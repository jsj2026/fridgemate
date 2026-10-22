/* =========================================================================
 * 레시피 추천 — 담당: 이정남  (EPIC-05, USE-09, SCN-05)
 * 요구사항: FUN-037 보유 재료 1개 이상 쓰는 레시피 / FUN-038 임박 재료 많이 쓰는 순
 *          FUN-039 있는 재료·부족한 재료 표시 / FUN-040 결과 없음 안내
 * 화면 자리: #recipe-area
 * 데이터: data/recipes.js 의 FM_RECIPES
 * ========================================================================= */
(function (FM) {
  'use strict';

  function render() {
    document.getElementById('recipe-area').innerHTML =
      '<h2>오늘 뭐 먹지?</h2>' +
      '<div class="placeholder"><b>레시피 추천은 준비 중이에요</b>' +
      '이정남 담당 (js/recipe.js) · 준비된 레시피 ' + (window.FM_RECIPES || []).length + '개</div>';
  }

  FM.register('recipe', { render: render });
})(window.FM);
