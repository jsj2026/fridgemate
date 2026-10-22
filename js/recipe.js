/* =========================================================================
 * 레시피 추천 — 담당: 이정남  (EPIC-05, USE-09, SCN-05)
 * 요구사항: FUN-037 보유 재료 1개 이상 쓰는 레시피 / FUN-038 임박 재료 많이 쓰는 순
 *          FUN-039 있는 재료·부족한 재료 표시 / FUN-040 결과 없음 안내
 * 화면 자리: #recipe-area
 * 데이터: data/recipes.js 의 FM_RECIPES
 * ========================================================================= */
(function (FM) {
  'use strict';

  /** 레시피 재료 이름과 보유 식재료를 맞춰 보기
   *  예) 재료 '우유' ↔ 보유 '서울우유 1L' 처럼 이름에 포함돼 있으면 같은 재료로 봄 */
  function findOwned(ingredient, items) {
    return items.find(function (i) {
      return i.name === ingredient || i.name.indexOf(ingredient) >= 0;
    }) || null;
  }

  /** 추천 목록 계산 (FUN-037·038)
   *  반환: [{ recipe, have:[{name, urgent}], missing:[이름], urgentCount }] */
  function recommend() {
    // 기한이 지난 재료는 추천에 쓰지 않음 (먹을 수 있는지는 사용자가 판단)
    const items = FM.store.getItems().filter(function (i) { return FM.util.status(i.expiryDate).key !== 'over'; });
    const list = [];

    (window.FM_RECIPES || []).forEach(function (r) {
      const have = [], missing = [];
      r.ingredients.forEach(function (ing) {
        const owned = findOwned(ing, items);
        if (owned) {
          const k = FM.util.status(owned.expiryDate).key;
          have.push({ name: ing, urgent: k === 'soon' || k === 'today' });
        } else {
          missing.push(ing);
        }
      });
      if (!have.length) return;   // 보유 재료가 하나도 없으면 제외
      list.push({
        recipe: r,
        have: have,
        missing: missing,
        urgentCount: have.filter(function (h) { return h.urgent; }).length
      });
    });

    // 정렬: ① 임박 재료 많이 쓰는 순 → ② 있는 재료 많은 순 → ③ 부족한 재료 적은 순
    list.sort(function (a, b) {
      return (b.urgentCount - a.urgentCount) || (b.have.length - a.have.length) || (a.missing.length - b.missing.length);
    });
    return list;
  }

  function chip(text, cls) {
    return '<span class="rc-chip ' + cls + '">' + FM.util.escape(text) + '</span>';
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
      html += '<article class="card rc-card">' +
        '<div class="rc-head"><h3>' + FM.util.escape(x.recipe.name) + '</h3>' +
        (x.urgentCount ? '<span class="badge st-soon">임박 재료 ' + x.urgentCount + '개</span>' : '') + '</div>' +
        '<div class="rc-row"><small>있는 재료</small><div>' +
        x.have.map(function (h) { return chip(h.name, h.urgent ? 'urgent' : 'have'); }).join('') + '</div></div>' +
        (x.missing.length ? '<div class="rc-row"><small>부족한 재료</small><div>' +
          x.missing.map(function (m) { return chip(m, 'missing'); }).join('') + '</div></div>' : '') +
        '<button class="btn block" data-idx="' + idx + '">레시피 보기</button>' +
        '</article>';
    });
    area.innerHTML = html;
    area._list = list;   // '레시피 보기' 버튼에서 사용
  }

  /** 레시피 상세 창 */
  function openDetail(x) {
    const r = x.recipe;
    const sheet = FM.util.openSheet(
      '<h3>' + FM.util.escape(r.name) + '</h3>' +
      '<div>' + x.have.map(function (h) { return chip(h.name, h.urgent ? 'urgent' : 'have'); }).join('') +
        x.missing.map(function (m) { return chip(m, 'missing'); }).join('') + '</div>' +
      '<p style="margin:0">' + FM.util.escape(r.steps) + '</p>' +
      '<p class="muted" style="margin:0;font-size:.78rem">출처: ' + FM.util.escape(r.source || '-') + '</p>' +
      '<button class="btn block" data-act="close">닫기</button>'
    );
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
