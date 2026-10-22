/* =========================================================================
 * FridgeMate 앱 시작 (공통 기반 — 이정남)
 * 탭 전환, 기능 파일 시작(init), 날짜 변경·오프라인 감지를 담당합니다.
 *
 * 기능 파일을 만드는 방법 (예: js/process.js)
 *   FM.register('process', {
 *     init: function () { ... 처음 한 번 실행 (이벤트 연결 등) ... },
 *     render: function () { ... 화면 그리기 ... }   // 데이터가 바뀌면 자동으로 다시 불림
 *   });
 * ========================================================================= */
window.FM = window.FM || {};

(function (FM) {
  'use strict';

  const modules = FM._modules || {};
  const TABS = ['list', 'register', 'recipe', 'settings'];
  let currentTab = 'list';

  /** 탭 이동: FM.showTab('register') */
  FM.showTab = function (tab) {
    if (TABS.indexOf(tab) < 0) return;
    currentTab = tab;
    document.querySelectorAll('.view').forEach(function (v) { v.hidden = v.dataset.tab !== tab; });
    document.querySelectorAll('#tabbar button').forEach(function (b) {
      if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    FM.emit('tab:show', tab);
  };
  FM.currentTab = function () { return currentTab; };

  function renderAll() {
    Object.keys(modules).forEach(function (name) {
      const m = modules[name];
      if (typeof m.render === 'function') {
        try { m.render(); } catch (e) { console.error('[FM] ' + name + '.render 오류', e); }
      }
    });
  }

  function start() {
    // 1) 기능 파일 시작
    Object.keys(modules).forEach(function (name) {
      const m = modules[name];
      if (typeof m.init === 'function') {
        try { m.init(); } catch (e) { console.error('[FM] ' + name + '.init 오류', e); }
      }
    });
    // 2) 데이터가 바뀌면 모든 화면 다시 그리기
    FM.on('items:changed', renderAll);
    FM.on('settings:changed', renderAll);
    FM.on('day:changed', renderAll);
    // 3) 탭 버튼
    document.getElementById('tabbar').addEventListener('click', function (e) {
      const b = e.target.closest('button[data-tab]');
      if (b) FM.showTab(b.dataset.tab);
    });
    // 4) 날짜가 바뀌면 상태 다시 계산 (FUN-031)
    let day = FM.util.today();
    function checkDay() {
      const t = FM.util.today();
      if (t !== day) { day = t; FM.emit('day:changed', t); }
    }
    setInterval(checkDay, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) checkDay(); });
    // 5) 오프라인 표시 (FUN-044)
    function net() {
      const off = !navigator.onLine;
      document.getElementById('offline-badge').hidden = !off;
      FM.emit('network:changed', !off);
    }
    window.addEventListener('online', net);
    window.addEventListener('offline', net);
    net();
    // 6) 첫 화면
    renderAll();
    FM.showTab('list');
    FM.emit('app:ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.FM);
