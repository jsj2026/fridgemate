/* =========================================================================
 * 식재료 등록 — 담당: 이석환  (EPIC-02, USE-02·USE-03)
 * 요구사항: FUN-007~012 바코드 등록 / FUN-013 직접 입력 / FUN-014 자동완성(TODO)
 *          FUN-015 소비기한 기본값(일부 구현) / FUN-016 필수값 검사
 * 화면 자리: #register-area
 *
 * [현재 상태] 공통 기반에서 만든 "기본 직접 입력 폼"입니다. 이석환님이 이어서 개발해 주세요.
 *   - 바코드 버튼  → js/barcode.js 의 FM.barcode.start(콜백) 연결
 *   - 소비기한 촬영 → js/ocr.js 의 FM.ocr.start(콜백) 연결
 *   - 자동완성(FUN-014): data/foods.js 의 FM_FOODS 사용
 * 저장은 반드시 FM.store.addItem({...}) 을 사용하세요. (형식: js/common/storage.js 맨 위 설명)
 * ========================================================================= */
(function (FM) {
  'use strict';

  function formHtml() {
    const opts = FM.store.STORAGES.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    return '' +
      '<h2>재료 등록</h2>' +
      '<div class="reg-actions">' +
      '  <button class="btn" id="reg-barcode" type="button">📷 바코드로 등록</button>' +
      '  <button class="btn" id="reg-ocr" type="button">📅 소비기한 촬영</button>' +
      '</div>' +
      '<form class="card form" id="reg-form" novalidate>' +
      '  <div class="field"><label for="reg-name">품목명</label>' +
      '    <input class="input" id="reg-name" list="reg-foods" placeholder="예: 우유" autocomplete="off"></div>' +
      '  <datalist id="reg-foods"></datalist>' +
      '  <div class="row">' +
      '    <div class="field"><label for="reg-qty">수량</label><input class="input" id="reg-qty" type="number" min="0.1" step="any" value="1"></div>' +
      '    <div class="field"><label for="reg-unit">단위</label><input class="input" id="reg-unit" value="개"></div>' +
      '  </div>' +
      '  <div class="row">' +
      '    <div class="field"><label for="reg-storage">보관 위치</label><select class="input" id="reg-storage">' + opts + '</select></div>' +
      '    <div class="field"><label for="reg-date">소비기한</label><input class="input" id="reg-date" type="date"></div>' +
      '  </div>' +
      '  <input type="hidden" id="reg-barcode-value">' +
      '  <p class="muted" id="reg-error" role="alert" style="color:var(--today);margin:0" hidden></p>' +
      '  <button class="btn primary block" type="submit">저장</button>' +
      '</form>';
  }

  function resetForm() {
    document.getElementById('reg-form').reset();
    document.getElementById('reg-date').value = FM.util.addDays(7);
    document.getElementById('reg-barcode-value').value = '';
    document.getElementById('reg-error').hidden = true;
  }

  function init() {
    const area = document.getElementById('register-area');
    area.innerHTML = formHtml();

    // 자동완성 후보 (간단 버전: 브라우저 datalist) — FUN-014 TODO: 최대 5개 제안 화면으로 개선
    document.getElementById('reg-foods').innerHTML = (window.FM_FOODS || [])
      .map(function (f) { return '<option value="' + FM.util.escape(f.name) + '">'; }).join('');

    // 품목을 고르면 보관 위치·소비기한 기본값 채우기 (FUN-015)
    document.getElementById('reg-name').addEventListener('change', function (e) {
      const f = FM.util.findFood(e.target.value);
      if (!f) return;
      document.getElementById('reg-storage').value = f.storage;
      document.getElementById('reg-date').value = FM.util.addDays(f.days);
    });

    // 바코드 (js/barcode.js)
    document.getElementById('reg-barcode').addEventListener('click', function () {
      if (FM.barcode && FM.barcode.start) {
        FM.barcode.start(function (result) {
          // result: { barcode, name, category } (barcode.js에서 정해서 넘겨주세요)
          if (!result) return;
          document.getElementById('reg-barcode-value').value = result.barcode || '';
          if (result.name) document.getElementById('reg-name').value = result.name;
        });
      } else FM.util.toast('바코드 기능은 준비 중이에요.');
    });

    // 소비기한 촬영 (js/ocr.js)
    document.getElementById('reg-ocr').addEventListener('click', function () {
      if (FM.ocr && FM.ocr.start) {
        FM.ocr.start(function (date) {
          // date: 'YYYY-MM-DD' (사용자가 확인한 날짜만 넘겨주세요, FUN-021)
          if (date) document.getElementById('reg-date').value = date;
        });
      } else FM.util.toast('소비기한 촬영 기능은 준비 중이에요.');
    });

    // 저장
    document.getElementById('reg-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const r = FM.store.addItem({
        name: document.getElementById('reg-name').value,
        quantity: document.getElementById('reg-qty').value,
        unit: document.getElementById('reg-unit').value.trim() || '개',
        storage: document.getElementById('reg-storage').value,
        expiryDate: document.getElementById('reg-date').value,
        barcode: document.getElementById('reg-barcode-value').value
      });
      const err = document.getElementById('reg-error');
      if (!r.ok) { err.textContent = r.error; err.hidden = false; return; }
      FM.util.toast(r.item.name + ' 등록했어요.');
      resetForm();
      FM.showTab('list');
    });

    resetForm();
  }

  FM.register('register', { init: init });
})(window.FM);
