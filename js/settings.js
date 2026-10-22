/* =========================================================================
 * 설정 — 담당: 이지선  (EPIC-04, USE-08)
 * 요구사항: FUN-035 임박 기준일 1~7일(기본 3일) / FUN-036 단말 알림 켜기·끄기
 * 화면 자리: #settings-area
 * 도움 되는 함수: FM.store.getSettings() / FM.store.saveSettings({ soonDays: 5 })
 *   saveSettings를 부르면 목록·요약이 자동으로 다시 그려져요.
 * ========================================================================= */
(function (FM) {
  'use strict';

  function render() {
    const s = FM.store.getSettings();
    document.getElementById('settings-area').innerHTML =
      '<h2>설정</h2>' +
      '<div class="placeholder"><b>알림 기준 설정은 준비 중이에요</b>' +
      '이지선 담당 (js/settings.js) · 현재 임박 기준: ' + s.soonDays + '일</div>';
  }

  FM.register('settings', { render: render });
})(window.FM);
