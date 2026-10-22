/* =========================================================================
 * 바코드 인식 — 담당: 이석환  (EPIC-02, SCN-01)
 * 요구사항: FUN-007 EAN-13·EAN-8·UPC-A 인식 / FUN-008 캐시 → 공개 상품 DB 조회
 *          FUN-009 10초 실패·권한 거부 시 번호 직접 입력 / FUN-010 DB 없음·5초 초과 시 직접 입력
 *          FUN-011 사용자 입력 상품명 저장 / INT-001~004
 *
 * 만들어야 할 것 (register.js가 이 함수를 부릅니다)
 *   FM.barcode.start(done)
 *     - 카메라를 열어 바코드를 읽고, 상품 정보를 찾은 뒤
 *     - done({ barcode: '880...', name: '상품명 또는 빈 값', category: '' }) 호출
 *     - 사용자가 취소하면 done(null)
 *
 * 도움 되는 공통 함수
 *   FM.store.getProduct(barcode)              캐시된 상품 정보 (없으면 null)
 *   FM.store.saveProduct(barcode, {name, category, source})
 *   FM.util.openSheet(html) / FM.util.closeSheet()   카메라 화면 띄우기
 *
 * 참고: 카메라는 https 주소(GitHub Pages)나 localhost에서만 동작해요. 파일을 더블클릭해서 열면 안 돼요.
 * 후보 OSS: html5-qrcode, ZXing (3주차 OSS 평가 후 확정)
 * ========================================================================= */
(function (FM) {
  'use strict';

  FM.barcode = {
    // TODO(이석환): 구현 후 아래 줄을 지우고 실제 함수로 바꿔 주세요.
    start: null
  };
})(window.FM);
