/* =========================================================================
 * 식재료 처리(소비·폐기·수정·삭제) — 담당: 이지선  (EPIC-04, USE-05·USE-06, SCN-04)
 * 요구사항: FUN-025 수정 / FUN-026 삭제 전 확인 / FUN-027 소비·폐기 처리 후 목록 제외
 *          FUN-028 이력 저장 / FUN-029 일부 수량 처리 / FUN-030 여러 개 한 번에 처리
 *
 * 이벤트:
 *   FM.on('item:select', itemId)      → 재료 1개 처리 창 (list.js가 이미 보냄)
 *   FM.on('items:batch', [itemId...]) → 여러 개 한 번에 처리 창 (list.js에서 보내줘야 함)
 *
 * 쓰는 함수: FM.store.getItem / updateItem(id, 바꿀값) / removeItem / addHistory
 *           FM.util.openSheet / closeSheet / status / escape / toast
 * ========================================================================= */
(function (FM) {
  'use strict';

  const U = FM.util;
  const STORAGES = ['냉장', '냉동', '실온'];
  const ACTION_LABEL = { consume: '소비', discard: '폐기' };

  /* ---------- 작은 도우미 ---------- */
  function esc(v) { return U.escape(String(v == null ? '' : v)); }
  function round(n) { return Math.round(n * 100) / 100; }   // 0.1+0.2 같은 소수 오차 방지

  /* ---------- 핵심: 소비·폐기 처리 (FUN-027·028·029) ----------
   * amount를 안 주면 전량 처리. 다 쓰면 목록에서 빼고, 남으면 수량만 줄임. */
  function processItem(it, action, amount) {
    const qty = Number(it.quantity) || 0;
    const used = amount == null ? qty : Math.min(round(amount), qty);
    const left = round(qty - used);

    FM.store.addHistory({
      itemId: it.itemId,
      name: it.name,
      storage: it.storage,
      action: action,                 // 'consume' | 'discard'
      quantity: used,
      unit: it.unit,
      expiryDate: it.expiryDate,
      processedAt: new Date().toISOString()
    });

    if (left <= 0) FM.store.removeItem(it.itemId);
    else FM.store.updateItem(it.itemId, { quantity: left });

    return { used: used, left: left };
  }

  /* ---------- 재료 1개 처리 창 ---------- */
  function open(itemId) {
    if (!FM.store.getItem(itemId)) return;

    const sheet = U.openSheet('<div data-proc></div>');
    const box = sheet.querySelector('[data-proc]') || sheet;
    let pending = null;               // 지금 고른 동작: 'consume' | 'discard'

    function cur() { return FM.store.getItem(itemId); }

    function header(it) {
      const st = U.status(it.expiryDate);
      return '<h3>' + esc(it.name) + ' <span class="badge ' + st.cls + '">' + st.label + '</span></h3>' +
        '<p class="muted" style="margin:0 0 12px">' + esc(it.storage) + ' · ' +
        esc(it.quantity) + esc(it.unit) + ' · ' + esc(it.expiryDate) + '까지</p>';
    }

    const views = {
      main: function (it) {
        return header(it) +
          '<div style="display:flex;gap:8px">' +
            '<button class="btn block" data-act="pick" data-action="consume">소비</button>' +
            '<button class="btn block" data-act="pick" data-action="discard">폐기</button>' +
          '</div>' +
          '<button class="btn block" data-act="go" data-view="edit">수정</button>' +
          '<button class="btn danger block" data-act="go" data-view="confirmDelete">삭제</button>' +
          '<button class="btn block" data-act="close">닫기</button>';
      },

      // FUN-029: 일부 수량만 처리
      amount: function (it) {
        const label = ACTION_LABEL[pending];
        return header(it) +
          '<label>얼마나 ' + label + '했나요? (최대 ' + esc(it.quantity) + esc(it.unit) + ')</label>' +
          '<div style="display:flex;gap:8px;align-items:center;margin:6px 0">' +
            '<input type="number" data-amount min="0" step="any" max="' + esc(it.quantity) +
              '" value="' + esc(it.quantity) + '" style="flex:1"> ' + esc(it.unit) +
          '</div>' +
          '<div style="display:flex;gap:8px">' +
            '<button class="btn block" data-act="quick" data-ratio="0.5">절반</button>' +
            '<button class="btn block" data-act="quick" data-ratio="1">전부</button>' +
          '</div>' +
          '<p class="muted" data-err style="color:#d33;min-height:1em"></p>' +
          '<button class="btn block' + (pending === 'discard' ? ' danger' : '') + '" data-act="doProcess">' +
            label + ' 처리</button>' +
          '<button class="btn block" data-act="go" data-view="main">뒤로</button>';
      },

      // FUN-025: 수정 폼
      edit: function (it) {
        const opts = STORAGES.map(function (s) {
          return '<option' + (s === it.storage ? ' selected' : '') + '>' + s + '</option>';
        }).join('');
        return '<h3>재료 수정</h3>' +
          '<form data-edit onsubmit="return false">' +
            '<label>이름<input name="name" value="' + esc(it.name) + '" required></label>' +
            '<label>보관 위치<select name="storage">' + opts + '</select></label>' +
            '<div style="display:flex;gap:8px">' +
              '<label style="flex:2">수량<input name="quantity" type="number" min="0" step="any" value="' + esc(it.quantity) + '"></label>' +
              '<label style="flex:1">단위<input name="unit" value="' + esc(it.unit) + '"></label>' +
            '</div>' +
            '<label>유통기한<input name="expiryDate" type="date" value="' + esc(it.expiryDate) + '"></label>' +
          '</form>' +
          '<p class="muted" data-err style="color:#d33;min-height:1em"></p>' +
          '<button class="btn block" data-act="saveEdit">저장</button>' +
          '<button class="btn block" data-act="go" data-view="main">취소</button>';
      },

      // FUN-026: 창 안에서 한 번 더 확인
      confirmDelete: function (it) {
        return header(it) +
          '<p><b>' + esc(it.name) + '</b>을(를) 정말 삭제할까요?<br>' +
          '<span class="muted">삭제는 이력에 남지 않아요. 먹었거나 버린 거면 소비·폐기를 눌러 주세요.</span></p>' +
          '<button class="btn danger block" data-act="doDelete">삭제</button>' +
          '<button class="btn block" data-act="go" data-view="main">취소</button>';
      }
    };

    function render(view) {
      const it = cur();
      if (!it) { U.closeSheet(); return; }
      box.innerHTML = views[view](it);
    }

    function showErr(msg) {
      const el = box.querySelector('[data-err]');
      if (el) el.textContent = msg;
    }

    // onclick 대입: 창을 여러 번 열어도 리스너가 쌓이지 않음
    sheet.onclick = function (e) {
      const btn = e.target.closest('[data-act]');
      if (!btn || !sheet.contains(btn)) return;
      const it = cur();
      if (!it) { U.closeSheet(); return; }

      switch (btn.dataset.act) {
        case 'close':
          U.closeSheet();
          break;

        case 'go':
          render(btn.dataset.view);
          break;

        case 'pick':
          pending = btn.dataset.action;
          render('amount');
          break;

        case 'quick': {
          const input = box.querySelector('[data-amount]');
          input.value = round(Number(it.quantity) * Number(btn.dataset.ratio));
          break;
        }

        case 'doProcess': {
          const amount = Number(box.querySelector('[data-amount]').value);
          if (!(amount > 0)) return showErr('0보다 큰 수량을 입력해 주세요.');
          if (amount > Number(it.quantity)) return showErr('남은 수량보다 많아요.');
          const r = processItem(it, pending, amount);
          U.closeSheet();
          U.toast(it.name + ' ' + r.used + it.unit + ' ' + ACTION_LABEL[pending] + '했어요.' +
            (r.left > 0 ? ' (남은 양 ' + r.left + it.unit + ')' : ''));
          break;
        }

        case 'saveEdit': {
          const f = box.querySelector('[data-edit]');
          const name = f.name.value.trim();
          const quantity = Number(f.quantity.value);
          const expiryDate = f.expiryDate.value;
          if (!name) return showErr('이름을 입력해 주세요.');
          if (!(quantity > 0)) return showErr('수량은 0보다 커야 해요.');
          if (!expiryDate) return showErr('유통기한을 골라 주세요.');
          FM.store.updateItem(it.itemId, {
            name: name,
            storage: f.storage.value,
            quantity: round(quantity),
            unit: f.unit.value.trim(),
            expiryDate: expiryDate
          });
          U.toast(name + ' 수정했어요.');
          render('main');
          break;
        }

        case 'doDelete':
          FM.store.removeItem(it.itemId);
          U.closeSheet();
          U.toast(it.name + ' 삭제했어요.');
          break;
      }
    };

    render('main');
  }

  /* ---------- 여러 개 한 번에 처리 (FUN-030) ----------
   * 선택한 재료를 전량 소비/폐기. 일부 수량은 1개 처리 창에서. */
  function openBatch(ids) {
    const items = (ids || []).map(FM.store.getItem).filter(Boolean);
    if (!items.length) return;
    if (items.length === 1) return open(items[0].itemId);

    const sheet = U.openSheet('<div data-proc></div>');
    const box = sheet.querySelector('[data-proc]') || sheet;
    let pending = null;

    function checked() {
      return Array.prototype.map.call(box.querySelectorAll('[data-pick]:checked'), function (c) {
        return c.value;
      });
    }

    function renderList(selected) {
      const rows = items.map(function (it) {
        const st = U.status(it.expiryDate);
        const on = !selected || selected.indexOf(it.itemId) !== -1;
        return '<label style="display:flex;gap:8px;align-items:center;padding:6px 0">' +
          '<input type="checkbox" data-pick value="' + esc(it.itemId) + '"' + (on ? ' checked' : '') + '>' +
          '<span style="flex:1">' + esc(it.name) + ' <span class="muted">' + esc(it.quantity) + esc(it.unit) + '</span></span>' +
          '<span class="badge ' + st.cls + '">' + st.label + '</span></label>';
      }).join('');
      box.innerHTML = '<h3>여러 개 처리</h3>' + rows +
        '<p class="muted" data-err style="color:#d33;min-height:1em"></p>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn block" data-act="pick" data-action="consume">선택 소비</button>' +
          '<button class="btn block" data-act="pick" data-action="discard">선택 폐기</button>' +
        '</div>' +
        '<button class="btn block" data-act="close">닫기</button>';
    }

    function renderConfirm(selected) {
      const names = items.filter(function (it) { return selected.indexOf(it.itemId) !== -1; })
        .map(function (it) { return esc(it.name); }).join(', ');
      box.innerHTML = '<h3>' + selected.length + '개 ' + ACTION_LABEL[pending] + '할까요?</h3>' +
        '<p>' + names + '</p><p class="muted">전량 처리돼서 목록에서 빠져요.</p>' +
        '<button class="btn block' + (pending === 'discard' ? ' danger' : '') + '" data-act="doBatch">' +
          ACTION_LABEL[pending] + ' 처리</button>' +
        '<button class="btn block" data-act="back">뒤로</button>';
      box.dataset.selected = selected.join(',');
    }

    sheet.onclick = function (e) {
      const btn = e.target.closest('[data-act]');
      if (!btn || !sheet.contains(btn)) return;
      switch (btn.dataset.act) {
        case 'close':
          U.closeSheet();
          break;
        case 'pick': {
          const sel = checked();
          if (!sel.length) {
            box.querySelector('[data-err]').textContent = '하나 이상 골라 주세요.';
            return;
          }
          pending = btn.dataset.action;
          renderConfirm(sel);
          break;
        }
        case 'back':
          renderList(box.dataset.selected.split(','));
          break;
        case 'doBatch': {
          const sel = box.dataset.selected.split(',');
          let n = 0;
          sel.forEach(function (id) {
            const it = FM.store.getItem(id);   // 그 사이 지워졌을 수도 있으니 다시 조회
            if (it) { processItem(it, pending); n++; }
          });
          U.closeSheet();
          U.toast(n + '개 ' + ACTION_LABEL[pending] + '했어요.');
          break;
        }
      }
    };

    renderList();
  }

  // 다른 파일에서 직접 부를 수도 있게 열어 둠
  FM.process = { open: open, openBatch: openBatch, processItem: processItem };

  FM.register('process', {
    init: function () {
      FM.on('item:select', open);
      FM.on('items:batch', openBatch);
    }
  });
})(window.FM);
