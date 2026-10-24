/* =========================================================================
 * 레시피 추천 — 담당: 이정남  (EPIC-05, USE-09, SCN-05)
 * 요구사항: FUN-037 보유 재료 1개 이상 쓰는 레시피 / FUN-038 임박 재료 많이 쓰는 순
 *          FUN-039 있는 재료·부족한 재료 표시 / FUN-040 결과 없음 안내
 * 화면 자리: #recipe-area
 * 데이터: data/recipes.js 의 FM_RECIPES (재료 양·양념·요리 순서·팁 포함)
 * ========================================================================= */
(function (FM) {
  'use strict';

  /** 재료 항목에서 이름·양 꺼내기 (예전 형식 '두부' 문자열도 지원) */
  function ing(x) { return typeof x === 'string' ? { name: x, amount: '' } : x; }

  /** 레시피 재료 이름과 보유 식재료를 맞춰 보기
   *  예) 재료 '우유' ↔ 보유 '서울우유 1L' 처럼 이름에 포함돼 있으면 같은 재료로 봄 */
  function findOwned(name, items) {
    return items.find(function (i) {
      return i.name === name || i.name.indexOf(name) >= 0;
    }) || null;
  }

  /** 추천 목록 계산 (FUN-037·038)
   *  반환: [{ recipe, rows:[{name, amount, state:'urgent'|'have'|'missing'}], haveCount, missingCount, urgentCount }] */
  function recommend() {
    // 기한이 지난 재료는 추천에 쓰지 않음 (먹을 수 있는지는 사용자가 판단)
    const items = FM.store.getItems().filter(function (i) { return FM.util.status(i.expiryDate).key !== 'over'; });
    const list = [];

    (window.FM_RECIPES || []).forEach(function (r) {
      const rows = (r.ingredients || []).map(function (x) {
        const it = ing(x);
        const owned = findOwned(it.name, items);
        let state = 'missing';
        if (owned) {
          const k = FM.util.status(owned.expiryDate).key;
          state = (k === 'soon' || k === 'today') ? 'urgent' : 'have';
        }
        return { name: it.name, amount: it.amount || '', state: state };
      });
      const haveCount = rows.filter(function (x) { return x.state !== 'missing'; }).length;
      if (!haveCount) return;   // 보유 재료가 하나도 없으면 제외
      list.push({
        recipe: r,
        rows: rows,
        haveCount: haveCount,
        missingCount: rows.length - haveCount,
        urgentCount: rows.filter(function (x) { return x.state === 'urgent'; }).length
      });
    });

    // 정렬: ① 임박 재료 많이 쓰는 순 → ② 있는 재료 많은 순 → ③ 부족한 재료 적은 순
    list.sort(function (a, b) {
      return (b.urgentCount - a.urgentCount) || (b.haveCount - a.haveCount) || (a.missingCount - b.missingCount);
    });
    return list;
  }

  const esc = function (s) { return FM.util.escape(s); };
  const STATE_LABEL = { urgent: '임박', have: '있음', missing: '부족' };

  function chip(text, cls) { return '<span class="rc-chip ' + cls + '">' + esc(text) + '</span>'; }

  function meta(r) {
    const parts = [];
    if (r.time) parts.push('⏱ ' + esc(r.time));
    if (r.servings) parts.push('🍽 ' + esc(r.servings));
    if (r.level) parts.push('👩‍🍳 ' + esc(r.level));
    return parts.length ? '<div class="rc-meta">' + parts.join('<span aria-hidden="true">·</span>') + '</div>' : '';
  }

  function render() {
    const area = document.getElementById('recipe-area');
    const list = recommend();

    let html = '<h2>오늘 뭐 먹지?</h2>' +
      '<p class="muted" style="margin:0 0 4px;font-size:.85rem">냉장고에 있는 재료로 만들 수 있는 요리예요. 임박 재료를 많이 쓰는 요리가 위에 있어요.</p>';

    if (!list.length) {
      // FUN-040
      html += '<div class="placeholder"><b>지금 재료로 추천할 레시피가 없어요</b>재료를 더 등록하면 추천이 나타나요.</div>';
      area.innerHTML = html;
      return;
    }

    list.forEach(function (x, idx) {
      const r = x.recipe;
      const have = x.rows.filter(function (w) { return w.state !== 'missing'; });
      const missing = x.rows.filter(function (w) { return w.state === 'missing'; });
      html += '<article class="card rc-card">' +
        '<div class="rc-head"><h3><span aria-hidden="true">' + (r.emoji || '🍽') + '</span> ' + esc(r.name) + '</h3>' +
        (x.urgentCount ? '<span class="badge st-soon">임박 재료 ' + x.urgentCount + '개</span>' : '') + '</div>' +
        meta(r) +
        '<div class="rc-row"><small>있는 재료</small><div>' +
        have.map(function (w) { return chip(w.name, w.state); }).join('') + '</div></div>' +
        (missing.length ? '<div class="rc-row"><small>부족한 재료</small><div>' +
          missing.map(function (w) { return chip(w.name, 'missing'); }).join('') + '</div></div>' : '') +
        '<button class="btn block" data-idx="' + idx + '">재료 양·만드는 법 보기</button>' +
        '</article>';
    });
    area.innerHTML = html;
    area._list = list;   // 상세 보기 버튼에서 사용
  }

  /** 레시피 상세 창: 재료 양, 양념, 요리 순서, 팁 */
  function openDetail(x) {
    const r = x.recipe;
    const steps = Array.isArray(r.steps) ? r.steps : [r.steps];

    let html = '<div class="rc-detail">' +
      '<h3><span aria-hidden="true">' + (r.emoji || '🍽') + '</span> ' + esc(r.name) + '</h3>' + meta(r);

    // 재료 (냉장고 재료)
    html += '<h4>재료</h4><ul class="rc-ing">' +
      x.rows.map(function (w) {
        return '<li><span class="rc-ing-name">' + esc(w.name) + '</span>' +
          '<span class="rc-ing-amt">' + esc(w.amount) + '</span>' +
          '<span class="rc-chip ' + w.state + '">' + STATE_LABEL[w.state] + '</span></li>';
      }).join('') + '</ul>';

    // 양념
    if (r.seasonings && r.seasonings.length) {
      html += '<h4>양념·기본 재료</h4><ul class="rc-ing">' +
        r.seasonings.map(function (s) {
          s = ing(s);
          return '<li><span class="rc-ing-name">' + esc(s.name) + '</span><span class="rc-ing-amt">' + esc(s.amount) + '</span></li>';
        }).join('') + '</ul>';
    }

    // 요리 순서
    html += '<h4>만드는 법</h4><ol class="rc-steps">' +
      steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';

    if (r.tip) html += '<div class="rc-tip"><b>💡 팁</b> ' + esc(r.tip) + '</div>';
    html += '<p class="muted rc-src">계량: 1큰술 = 밥숟가락 1개 · 1작은술 = 찻숟가락 1개<br>출처: ' + esc(r.source || '-') + '</p>' +
      '<button class="btn block" data-act="close">닫기</button></div>';

    const sheet = FM.util.openSheet(html);
    sheet.querySelector('[data-act=close]').addEventListener('click', FM.util.closeSheet);
  }

  function init() {
    document.getElementById('recipe-area').addEventListener('click', function (e) {
      const b = e.target.closest('button[data-idx]');
      if (!b) return;
      const list = document.getElementById('recipe-area')._list || [];
      const x = list[Number(b.dataset.idx)];
      if (x) openDetail(x);
    });
  }

  FM.register('recipe', { init: init, render: render });
})(window.FM);
