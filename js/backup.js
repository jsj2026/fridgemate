/* =========================================================================
 * 백업·복원 — 담당: 이지선  (EPIC-05, USE-10, SCN-06)
 * 요구사항: FUN-041 JSON 내보내기 / FUN-042 형식 검증 후 가져오기 / FUN-043 합치기·덮어쓰기 선택
 *          INT-007 파일 이름 fridgemate-backup-YYYYMMDD.json
 * 화면 자리: #backup-area (설정 탭)
 * 도움 되는 함수: FM.store.exportAll() → 백업 객체
 *               FM.store.importAll(객체, 'merge' | 'replace') → { ok, error | items, history }
 * ========================================================================= */
(function (FM) {
  'use strict';

  function render() {
    document.getElementById('backup-area').innerHTML =
      '<div class="placeholder"><b>백업·복원은 준비 중이에요</b>이지선 담당 (js/backup.js)</div>';
  }

  FM.register('backup', { render: render });
})(window.FM);
