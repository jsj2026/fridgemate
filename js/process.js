/* =========================================================================
 * 식재료 처리(소비·폐기·수정·삭제) — 담당: 이지선  (EPIC-04, USE-05·USE-06, SCN-04)
 * 요구사항: FUN-025 수정 / FUN-026 삭제 전 확인 / FUN-027 소비·폐기 처리 후 목록 제외
 *          FUN-028 이력 저장 / FUN-029 일부 수량 처리 / FUN-030 여러 개 한 번에 처리
 *
 * 동작 방식: 목록(list.js)에서 재료를 누르면 FM.emit('item:select', itemId) 가 발생하고,
 *           이 파일이 FM.on('item:select', ...) 으로 받아 처리 창을 엽니다.
 *
 * [현재 상태] 공통 기반에서 만든 "삭제만 되는 기본 창"입니다. 이지선님이 이어서 개발해 주세요.
 *   TODO: 소비·폐기 버튼(FM.store.addHistory + removeItem 또는 updateItem으로 수량 감소), 수정 폼, 일괄 처리
 * 도움 되는 함수: FM.store.getItem / updateItem / removeItem / addHistory
 *               FM.util.openSheet(html) / FM.util.closeSheet()
 * ========================================================================= */
(function (FM) {
  'use strict';

  function open(itemId) {
    const it = FM.store.getItem(itemId);
    if (!it) return;
    const st = FM.util.status(it.expiryDate);
    const sheet = FM.util.openSheet(
      '<h3>' + FM.util.escape(it.name) + ' <span class="badge ' + st.cls + '">' + st.label + '</span></h3>' +
      '<p class="muted" style="margin:0">' + it.storage + ' · ' + it.quantity + it.unit + ' · ' + it.expiryDate + '까지</p>' +
      '<div class="placeholder"><b>소비·폐기·수정은 준비 중이에요</b>이지선 담당 (js/process.js)</div>' +
      '<button class="btn danger block" data-act="delete">삭제</button>' +
      '<button class="btn block" data-act="close">닫기</button>'
    );
    sheet.addEventListener('click', function (e) {
      const act = e.target.dataset.act;
      if (act === 'close') FM.util.closeSheet();
      if (act === 'delete') {
        // TODO(이지선): 브라우저 confirm 대신 창 안에서 한 번 더 확인하도록 개선 (FUN-026)
        if (window.confirm(it.name + '을(를) 삭제할까요?')) {
          FM.store.removeItem(it.itemId);
          FM.util.closeSheet();
          FM.util.toast(it.name + ' 삭제했어요.');
        }
      }
    });
  }

  FM.register('process', {
    init: function () { FM.on('item:select', open); }
  });
})(window.FM);
