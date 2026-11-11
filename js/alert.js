/* =========================================================================
 * 임박 식재료 요약·알림 — 담당: 이지선  (EPIC-04, USE-07, SCN-04)
 * 요구사항: FUN-032 임박·오늘까지 개수와 품목명 상단 표시 / FUN-033 기한 경과 '확인 필요'
 *          FUN-034 단말 알림 하루 1회 (설정 notify 켜짐 + 권한 허용 시) / INT-006
 * 화면 자리: #alert-area (목록 탭 맨 위)
 *
 * 외부 공개(FM.register('alert', ...)):
 *   render()            : 요약 다시 그리기 + 하루 1회 알림 체크
 *   getFilter()         : 현재 필터 'soon' | 'over' | null
 *   matches(item)       : 목록 모듈에서 필터링할 때 사용 (필터 없으면 항상 true)
 *   requestPermission() : 설정 화면에서 '알림 켜기' 누를 때 호출 (사용자 클릭 안에서 호출해야 함)
 * 필터가 바뀌면 document 에 'fm:filter' 이벤트 발생 → detail.status
 * ========================================================================= */
(function (FM) {
  'use strict';

  const MAX_NAMES = 3;      // 요약에 보여줄 품목명 최대 개수
  let filter = null;        // 'soon' | 'over' | null

  /* ---------- 유틸 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function byExpiry(a, b) {
    return String(a.expiryDate).localeCompare(String(b.expiryDate));
  }

  // 품목 상태별로 나누기 (기한 빠른 순)
  function classify(items) {
    const g = { urgent: [], over: [] };
    items.forEach(function (i) {
      const k = FM.util.status(i.expiryDate).key;
      if (k === 'soon' || k === 'today') g.urgent.push({ item: i, today: k === 'today' });
      else if (k === 'over') g.over.push({ item: i, today: false });
    });
    g.urgent.sort(function (a, b) { return byExpiry(a.item, b.item); });
    g.over.sort(function (a, b) { return byExpiry(a.item, b.item); });
    return g;
  }

  // "우유(오늘까지), 두부, 계란 외 2개"
  function nameList(list, html) {
    const shown = list.slice(0, MAX_NAMES).map(function (e) {
      const n = html ? esc(e.item.name) : e.item.name;
      return e.today ? n + '(오늘까지)' : n;
    }).join(', ');
    const rest = list.length - MAX_NAMES;
    return rest > 0 ? shown + ' 외 ' + rest + '개' : shown;
  }

  /* ---------- 필터 (요약 클릭 → 해당 품목만 보기) ---------- */
  function setFilter(key) {
    filter = (filter === key) ? null : key;   // 같은 걸 다시 누르면 해제
    document.dispatchEvent(new CustomEvent('fm:filter', { detail: { status: filter } }));
    render();
  }

  function getFilter() { return filter; }

  function matches(item) {
    if (!filter) return true;
    const k = FM.util.status(item.expiryDate).key;
    if (filter === 'soon') return k === 'soon' || k === 'today';
    if (filter === 'over') return k === 'over';
    return true;
  }

  /* ---------- 단말 알림 (하루 1회) ---------- */
  function saveSettings(patch) {
    const st = Object.assign({}, FM.store.getSettings(), patch);
    const save = FM.store.setSettings || FM.store.saveSettings;
    if (typeof save === 'function') save.call(FM.store, st);
  }

  function show(title, body) {
    const opt = { body: body, tag: 'fm-daily' };
    try {
      new Notification(title, opt);
    } catch (e) {
      // 안드로이드 크롬 등은 생성자 금지 → 서비스워커로 대체
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (reg) reg.showNotification(title, opt);
        });
      }
    }
  }

  function notifyOnce(g) {
    const st = FM.store.getSettings();
    if (!st.notify) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const t = todayStr();
    if (st.lastNotified === t) return;
    if (!g.urgent.length && !g.over.length) return;   // 알릴 게 없으면 기록도 안 함 (나중에 생기면 알림)

    const parts = [];
    if (g.urgent.length) parts.push('임박 ' + g.urgent.length + '개 · ' + nameList(g.urgent, false));
    if (g.over.length) parts.push('확인 필요 ' + g.over.length + '개 · ' + nameList(g.over, false));
    show('Fridgmate 유통기한 알림', parts.join('\n'));
    saveSettings({ lastNotified: t });
  }

  function requestPermission() {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    if (Notification.permission !== 'default') return Promise.resolve(Notification.permission);
    return Notification.requestPermission();
  }

  /* ---------- 그리기 ---------- */
  function render() {
    const area = document.getElementById('alert-area');
    if (!area) return;
    const items = FM.store.getItems();
    const g = classify(items);
    const s = FM.store.getSettings().soonDays;

    function stat(cls, n, label, key) {
      const on = key && filter === key;
      return key
        ? '<button type="button" class="stat ' + cls + (on ? ' active' : '') + '" data-filter="' + key +
          '" aria-pressed="' + on + '"><b>' + n + '</b><small>' + label + '</small></button>'
        : '<div class="stat"><b>' + n + '</b><small>' + label + '</small></div>';
    }

    let html =
      '<section class="summary" aria-label="요약">' +
      stat('', items.length, '보관 중') +
      stat('soon', g.urgent.length, s + '일 이내', 'soon') +
      stat('over', g.over.length, '기한 지남', 'over') +
      '</section>';

    if (g.urgent.length) {
      html += '<button type="button" class="alert-line soon" data-filter="soon">' +
        '⚠️ 임박 ' + g.urgent.length + '개 · ' + nameList(g.urgent, true) + '</button>';
    }
    if (g.over.length) {
      html += '<button type="button" class="alert-line over" data-filter="over">' +
        '❗ 확인 필요 ' + g.over.length + '개 · ' + nameList(g.over, true) + '</button>';
    }
    if (!g.urgent.length && !g.over.length && items.length) {
      html += '<p class="alert-line ok">임박한 식재료가 없어요 👍</p>';
    }
    if (filter) {
      html += '<p class="filter-note">' + (filter === 'soon' ? '임박' : '기한 지난') +
        ' 품목만 보는 중 · <button type="button" class="link" data-filter="' + filter + '">전체 보기</button></p>';
    }

    area.innerHTML = html;
    area.querySelectorAll('[data-filter]').forEach(function (el) {
      el.addEventListener('click', function () { setFilter(el.getAttribute('data-filter')); });
    });

    notifyOnce(g);
  }

  FM.register('alert', {
    render: render,
    getFilter: getFilter,
    matches: matches,
    requestPermission: requestPermission
  });
})(window.FM);
