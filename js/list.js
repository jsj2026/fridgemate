/* =========================================================================
 * 식재료 목록 — 담당: 이정남  (EPIC-01, USE-01)
 * 요구사항: FUN-001 보관 위치 탭 / FUN-002 품목·수량·소비기한·D-day / FUN-003·004 상태 표시
 *          FUN-005 정렬(TODO) / FUN-006 검색(TODO)
 * 화면 자리: #list-area
 * ========================================================================= */
(function (FM) {
  'use strict';

  let filter = '전체';

  function render() {
    const area = document.getElementById('list-area');
    const all = FM.store.getItems();
    const shown = all
      .filter(function (i) { return filter === '전체' || i.storage === filter; })
      .sort(function (a, b) { return a.expiryDate < b.expiryDate ? -1 : a.expiryDate > b.expiryDate ? 1 : 0; }); // 임박순(기본)

    const counts = { '전체': all.length };
    FM.store.STORAGES.forEach(function (s) { counts[s] = all.filter(function (i) { return i.storage === s; }).length; });

    let html = '<nav class="chips" id="list-filter" aria-label="보관 위치">';
    ['전체'].concat(FM.store.STORAGES).forEach(function (s) {
      html += '<button data-f="' + s + '" aria-pressed="' + (s === filter) + '">' + s + ' ' + counts[s] + '</button>';
    });
    html += '</nav>';

    if (!shown.length) {
      html += '<div class="list"><div class="empty">' +
        (all.length ? filter + '에 보관 중인 재료가 없어요.' : '아직 재료가 없어요. 아래 ➕ 등록에서 첫 재료를 추가해 보세요.') +
        '</div></div>';
    } else {
      html += '<div class="list">';
      shown.forEach(function (i) {
        const st = FM.util.status(i.expiryDate);
        html += '<button class="item" data-id="' + i.itemId + '">' +
          '<span class="ico" aria-hidden="true">' + FM.util.icon(i) + '</span>' +
          '<span class="name"><div>' + FM.util.escape(i.name) + '</div>' +
          '<small>' + i.storage + ' · ' + i.quantity + i.unit + ' · ' + FM.util.shortDate(i.expiryDate) + '까지</small></span>' +
          '<span class="badge ' + st.cls + '">' + st.label + '</span>' +
          '</button>';
      });
      html += '</div>';
    }
    if (FM.store.isSample()) html += '<p class="note">지금 보이는 재료는 예시예요. 첫 재료를 등록하면 사라져요.</p>';
    else html += '<p class="note">재료를 누르면 소비·폐기·수정할 수 있어요. 데이터는 이 기기에만 저장돼요.</p>';
    area.innerHTML = html;
  }

  function init() {
    const area = document.getElementById('list-area');
    area.addEventListener('click', function (e) {
      const f = e.target.closest('#list-filter button');
      if (f) { filter = f.dataset.f; render(); return; }
      const row = e.target.closest('.item');
      if (row) {
        // 처리 창(소비·폐기·수정·삭제)은 js/process.js(이지선)가 'item:select'를 받아서 엽니다.
        if (FM.hasListener('item:select')) FM.emit('item:select', row.dataset.id);
        else FM.util.toast('처리 기능은 준비 중이에요.');
      }
    });
  }

  FM.register('list', { init: init, render: render });
})(window.FM);
