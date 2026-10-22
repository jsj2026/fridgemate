/* =========================================================================
 * FridgeMate 데이터 저장 (공통 기반 — 이정남)
 * 식재료·처리 이력·설정·상품 정보 캐시를 이 기기의 브라우저(localStorage)에 저장합니다.
 * 모든 기능 파일은 localStorage를 직접 쓰지 말고 반드시 FM.store 함수만 사용하세요.
 *
 * 식재료 데이터 형식 (요구사항 DAT-001)
 * {
 *   itemId:     'uuid',          // 자동 생성
 *   name:       '우유 1L',        // 필수
 *   category:   '유제품',         // 선택 (data/foods.js 분류)
 *   barcode:    '8801115114154', // 선택 (바코드 등록 시)
 *   quantity:   1,               // 0보다 큰 숫자
 *   unit:       '개',
 *   storage:    '냉장',           // '냉장' | '냉동' | '실온'
 *   expiryDate: '2026-10-25',    // 'YYYY-MM-DD'
 *   createdAt:  ISO 시각, updatedAt: ISO 시각   // 자동 기록
 * }
 * ========================================================================= */
window.FM = window.FM || {};

(function (FM) {
  'use strict';

  const KEY = 'fm.v1';                 // 저장 이름
  const OLD_KEY = 'fridgemate-items';  // 예전 껍데기 앱이 쓰던 이름 (자동 이전)
  const SCHEMA_VERSION = 1;
  const STORAGES = ['냉장', '냉동', '실온'];
  const DEFAULT_SETTINGS = { soonDays: 3, notify: false, lastNotified: null };

  let db = load();

  /* ---------- 내부: 읽기·쓰기 ---------- */
  function empty() {
    return { schemaVersion: SCHEMA_VERSION, items: [], history: [], settings: Object.assign({}, DEFAULT_SETTINGS), productCache: {} };
  }
  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* 저장소 사용 불가 */ }
    if (!data || !Array.isArray(data.items)) {
      data = empty();
      const migrated = migrateOld();
      data.items = migrated || sampleItems();
      data.isSample = !migrated;
      persist(data);
    }
    data.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
    data.history = data.history || [];
    data.productCache = data.productCache || {};
    return data;
  }
  function persist(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data || db));
      return true;
    } catch (e) {
      // INT-005: 저장 실패 시 원인과 조치 안내
      if (FM.util) FM.util.toast('저장하지 못했어요. 저장 공간이 부족하면 설정 > 백업 후 이력을 정리해 주세요.');
      console.error('[FM] 저장 실패', e);
      return false;
    }
  }
  function now() { return new Date().toISOString(); }
  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  /** 예전 껍데기 앱 데이터({id,name,place,date})를 새 형식으로 옮기기 */
  function migrateOld() {
    let old;
    try { old = JSON.parse(localStorage.getItem(OLD_KEY)); } catch (e) { return null; }
    if (!Array.isArray(old) || !old.length) return null;
    return old.map(function (o) {
      return newItem({ name: o.name, storage: o.place, expiryDate: o.date, quantity: 1, unit: '개' });
    });
  }

  /** 처음 실행할 때 보여줄 예시 재료 */
  function sampleItems() {
    const d = FM.util.addDays;
    return [
      { name: '우유', category: '유제품', storage: '냉장', expiryDate: d(2) },
      { name: '계란', category: '유제품', storage: '냉장', expiryDate: d(9), quantity: 10 },
      { name: '두부', category: '가공식품', storage: '냉장', expiryDate: d(-1) },
      { name: '대파', category: '채소', storage: '냉장', expiryDate: d(4) },
      { name: '요거트', category: '유제품', storage: '냉장', expiryDate: d(0) },
      { name: '만두', category: '냉동식품', storage: '냉동', expiryDate: d(60) },
      { name: '삼겹살', category: '육류', storage: '냉동', expiryDate: d(25) },
      { name: '양파', category: '채소', storage: '실온', expiryDate: d(12), quantity: 3 }
    ].map(newItem);
  }

  /** 입력값으로 식재료 객체 만들기 (검사 포함) */
  function newItem(input) {
    const t = now();
    return {
      itemId: FM.util.uuid(),
      name: String(input.name || '').trim(),
      category: input.category || (FM.util.findFood(input.name) || {}).category || '',
      barcode: input.barcode || '',
      quantity: Number(input.quantity) > 0 ? Number(input.quantity) : 1,
      unit: input.unit || '개',
      storage: STORAGES.indexOf(input.storage) >= 0 ? input.storage : '냉장',
      expiryDate: input.expiryDate,
      createdAt: t,
      updatedAt: t
    };
  }

  /** 필수값 검사 (FUN-016). 문제가 있으면 오류 메시지 문자열, 없으면 null */
  function validate(input) {
    if (!String(input.name || '').trim()) return '품목명을 입력해 주세요.';
    if (input.quantity != null && !(Number(input.quantity) > 0)) return '수량은 0보다 커야 해요.';
    if (input.storage != null && STORAGES.indexOf(input.storage) < 0) return '보관 위치는 냉장·냉동·실온 중 하나예요.';
    if (!FM.util.isDate(input.expiryDate)) return '소비기한 날짜를 입력해 주세요.';
    return null;
  }

  function changed() { persist(); FM.emit('items:changed'); }

  /* ---------- 공개 함수 (FM.store) ---------- */
  const store = {
    STORAGES: STORAGES,

    /* --- 식재료 --- */

    /** 전체 식재료 목록 (복사본) */
    getItems: function () { return copy(db.items); },

    /** 식재료 1개 (없으면 null) */
    getItem: function (itemId) {
      const it = db.items.find(function (i) { return i.itemId === itemId; });
      return it ? copy(it) : null;
    },

    /** 식재료 추가. 성공 {ok:true, item}, 실패 {ok:false, error:'메시지'} */
    addItem: function (input) {
      const err = validate(input);
      if (err) return { ok: false, error: err };
      if (db.isSample) { db.items = []; db.isSample = false; }  // 첫 등록 시 예시 재료 지우기
      const item = newItem(input);
      db.items.push(item);
      changed();
      return { ok: true, item: copy(item) };
    },

    /** 식재료 수정. patch에는 바꿀 항목만. 성공 {ok:true, item} */
    updateItem: function (itemId, patch) {
      const it = db.items.find(function (i) { return i.itemId === itemId; });
      if (!it) return { ok: false, error: '식재료를 찾을 수 없어요.' };
      const next = Object.assign({}, it, patch, { itemId: it.itemId, createdAt: it.createdAt });
      const err = validate(next);
      if (err) return { ok: false, error: err };
      next.quantity = Number(next.quantity);
      next.updatedAt = now();
      Object.assign(it, next);
      changed();
      return { ok: true, item: copy(it) };
    },

    /** 식재료 삭제 */
    removeItem: function (itemId) {
      const before = db.items.length;
      db.items = db.items.filter(function (i) { return i.itemId !== itemId; });
      if (db.items.length !== before) changed();
      return { ok: db.items.length !== before };
    },

    /** 지금 목록이 처음 실행 때 넣은 예시 재료인지 */
    isSample: function () { return !!db.isSample; },

    /* --- 처리 이력 (DAT-005) --- */

    /** 이력 추가: { itemId, name, type:'소비'|'폐기', quantity } */
    addHistory: function (h) {
      const rec = {
        historyId: FM.util.uuid(), itemId: h.itemId, name: h.name,
        type: h.type === '폐기' ? '폐기' : '소비', quantity: Number(h.quantity) || 1, processedAt: now()
      };
      db.history.push(rec);
      // 1년 지난 이력은 정리
      const limit = Date.now() - 365 * 86400000;
      db.history = db.history.filter(function (r) { return new Date(r.processedAt).getTime() >= limit; });
      persist();
      FM.emit('history:changed');
      return copy(rec);
    },
    getHistory: function () { return copy(db.history); },

    /* --- 설정 (DAT-008) --- */
    getSettings: function () { return copy(db.settings); },
    saveSettings: function (patch) {
      Object.assign(db.settings, patch);
      persist();
      FM.emit('settings:changed', copy(db.settings));
      return copy(db.settings);
    },

    /* --- 바코드 상품 정보 캐시 (DAT-006, 30일) --- */
    getProduct: function (barcode) {
      const p = db.productCache[barcode];
      if (!p) return null;
      if (Date.now() - new Date(p.fetchedAt).getTime() > 30 * 86400000 && p.source !== '사용자 입력') return null;
      return copy(p);
    },
    /** p: { name, category, source } — source 예: 'Open Food Facts', '사용자 입력' */
    saveProduct: function (barcode, p) {
      db.productCache[barcode] = { barcode: barcode, name: p.name, category: p.category || '', source: p.source || '', fetchedAt: now() };
      persist();
    },

    /* --- 백업 (DAT-010) --- */

    /** 전체 데이터를 백업용 객체로 */
    exportAll: function () {
      return { app: 'FridgeMate', schemaVersion: SCHEMA_VERSION, exportedAt: now(),
               items: copy(db.items), history: copy(db.history), settings: copy(db.settings) };
    },

    /** 백업 객체 가져오기. mode: 'merge'(합치기) | 'replace'(덮어쓰기)
     *  형식이 틀리면 기존 데이터를 바꾸지 않고 {ok:false, error} 반환 (FUN-042) */
    importAll: function (data, mode) {
      if (!data || data.app !== 'FridgeMate' || !Array.isArray(data.items))
        return { ok: false, error: 'FridgeMate 백업 파일이 아니에요.' };
      if (data.schemaVersion > SCHEMA_VERSION)
        return { ok: false, error: '더 새로운 버전 앱에서 만든 백업이에요. 앱을 업데이트해 주세요.' };
      const bad = data.items.filter(function (i) { return validate(i); });
      if (bad.length) return { ok: false, error: '백업 파일의 식재료 ' + bad.length + '건 형식이 올바르지 않아요.' };
      if (mode === 'replace') {
        db.items = copy(data.items);
        db.history = copy(data.history || []);
      } else {
        const ids = {};
        db.items.forEach(function (i) { ids[i.itemId] = true; });
        data.items.forEach(function (i) { if (!ids[i.itemId]) db.items.push(copy(i)); });
        const hids = {};
        db.history.forEach(function (h) { hids[h.historyId] = true; });
        (data.history || []).forEach(function (h) { if (!hids[h.historyId]) db.history.push(copy(h)); });
      }
      if (data.settings) db.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
      db.isSample = false;
      changed();
      FM.emit('settings:changed', copy(db.settings));
      return { ok: true, items: data.items.length, history: (data.history || []).length };
    },

    /** 모든 데이터 지우기 (테스트용) */
    resetAll: function () { db = empty(); persist(); FM.emit('items:changed'); FM.emit('settings:changed', copy(db.settings)); }
  };

  FM.store = store;
})(window.FM);
