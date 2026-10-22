/* =========================================================================
 * 임박 식재료 요약·알림 — 담당: 이지선  (EPIC-04, USE-07, SCN-04)
 * 요구사항: FUN-032 임박·오늘까지 개수와 품목명 상단 표시 / FUN-033 기한 경과 '확인 필요'
 *          FUN-034 단말 알림 하루 1회 (설정 notify 켜짐 + 권한 허용 시) / INT-006
 * 화면 자리: #alert-area (목록 탭 맨 위)
 *
 * [현재 상태] 공통 기반에서 만든 "개수만 보여주는 기본 요약"입니다. 이지선님이 이어서 개발해 주세요.
 *   TODO: 품목명 표시("임박 2개 · 우유, 두부"), 요약을 누르면 임박 품목만 보기, 단말 알림
 * 도움 되는 함수: FM.util.status(expiryDate) → { key:'soon'|'today'|'over'|... }
 *               FM.store.getSettings() → { soonDays, notify, lastNotified }
 * ========================================================================= */
(function (FM) {
  'use strict';

  function render() {
    const items = FM.store.getItems();
    let soon = 0, over = 0;
    items.forEach(function (i) {
      const k = FM.util.status(i.expiryDate).key;
      if (k === 'soon' || k === 'today') soon++;
      if (k === 'over') over++;
    });
    const s = FM.store.getSettings().soonDays;
    document.getElementById('alert-area').innerHTML =
      '<section class="summary" aria-label="요약">' +
      '<div class="stat"><b>' + items.length + '</b><small>보관 중</small></div>' +
      '<div class="stat soon"><b>' + soon + '</b><small>' + s + '일 이내</small></div>' +
      '<div class="stat over"><b>' + over + '</b><small>기한 지남</small></div>' +
      '</section>';
  }

  FM.register('alert', { render: render });
})(window.FM);
