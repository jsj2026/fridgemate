/* =========================================================================
 * FridgeMate 공통 도구 (공통 기반 — 이정남)
 * 모든 기능 파일이 함께 쓰는 날짜·상태 계산, 이벤트, 화면 도우미입니다.
 * 고칠 일이 있으면 직접 수정하지 말고 Issue로 요청해 주세요.
 * ========================================================================= */
window.FM = window.FM || {};

(function (FM) {
  'use strict';

  /* ---------- 이벤트 (기능 파일끼리 서로 알리기) ----------
   * FM.on('items:changed', fn)   식재료가 추가·수정·삭제되면
   * FM.on('settings:changed', fn) 설정이 바뀌면
   * FM.on('day:changed', fn)     날짜가 바뀌면 (자정이 지나면)
   * FM.on('item:select', fn)     목록에서 식재료를 눌렀을 때 (fn(itemId))
   * FM.on('tab:show', fn)        탭이 바뀌었을 때 (fn(tabName))
   */
  const listeners = {};
  FM.on = function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); };
  FM.emit = function (name, data) {
    (listeners[name] || []).forEach(function (fn) {
      try { fn(data); } catch (e) { console.error('[FM] ' + name + ' 처리 중 오류', e); }
    });
  };
  FM.hasListener = function (name) { return !!(listeners[name] && listeners[name].length); };

  /* ---------- 기능 파일 등록 ----------
   * FM.register('이름', { init: function(){}, render: function(){} })
   * init  : 앱 시작 때 한 번 실행
   * render: 앱 시작 때와 데이터·설정·날짜가 바뀔 때마다 실행
   */
  FM._modules = FM._modules || {};
  FM.register = function (name, mod) { FM._modules[name] = mod; };

  /* ---------- 날짜 ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function toYMD(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  const util = {};

  /** 오늘 날짜 'YYYY-MM-DD' (단말 로컬 기준, DAT-002) */
  util.today = function () { return toYMD(new Date()); };

  /** 오늘에서 n일 뒤 날짜 'YYYY-MM-DD' (n이 음수면 이전 날짜) */
  util.addDays = function (n, from) {
    const d = from ? new Date(from + 'T00:00:00') : new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return toYMD(d);
  };

  /** D-day 정수: 소비기한까지 남은 일수 (오늘 0, 지나면 음수) */
  util.dday = function (expiryDate) {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const e = new Date(expiryDate + 'T00:00:00');
    return Math.round((e - t) / 86400000);
  };

  /** 'YYYY-MM-DD' → '10.24' 같은 짧은 표시 */
  util.shortDate = function (ymd) { return ymd ? ymd.slice(5).replace('-', '.') : ''; };

  /** 올바른 날짜 문자열인지 */
  util.isDate = function (s) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(new Date(s + 'T00:00:00'));
  };

  /* ---------- 식재료 상태 (FUN-003·FUN-004) ----------
   * soonDays: 임박 기준일 (설정값, 기본 3)
   * 반환 { key, name, label, cls, dday }
   *   key   : 'keep' | 'ok' | 'soon' | 'today' | 'over'
   *   name  : '보관' | '여유' | '임박' | '오늘까지' | '기한 지남'
   *   label : 화면 배지 글자  예) 'D-9', '임박 D-2', '오늘까지', '기한 지남'
   *   cls   : CSS 클래스  예) 'st-soon'
   */
  util.status = function (expiryDate, soonDays) {
    const s = soonDays || (FM.store ? FM.store.getSettings().soonDays : 3);
    const d = util.dday(expiryDate);
    let key, name, label;
    if (d < 0)            { key = 'over';  name = '기한 지남'; label = '기한 지남'; }
    else if (d === 0)     { key = 'today'; name = '오늘까지';  label = '오늘까지'; }
    else if (d <= s)      { key = 'soon';  name = '임박';     label = '임박 D-' + d; }
    else if (d <= 6)      { key = 'ok';    name = '여유';     label = 'D-' + d; }
    else                  { key = 'keep';  name = '보관';     label = 'D-' + d; }
    return { key: key, name: name, label: label, cls: 'st-' + key, dday: d };
  };

  /* ---------- 기타 ---------- */

  /** 화면에 넣을 글자의 특수문자 처리 (사용자 입력을 innerHTML에 넣을 때 꼭 사용) */
  util.escape = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /** 고유 ID 만들기 */
  util.uuid = function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  };

  /** 품목명으로 내장 품목 사전(data/foods.js)에서 찾기. 없으면 null */
  util.findFood = function (name) {
    const n = String(name || '').trim();
    return (window.FM_FOODS || []).find(function (f) { return f.name === n; }) || null;
  };

  /** 품목 아이콘 (사전에 있으면 그 이모지, 없으면 분류 기본값) */
  util.icon = function (item) {
    const f = util.findFood(item.name);
    if (f && f.emoji) return f.emoji;
    const byCat = { '유제품': '🥛', '채소': '🥬', '과일': '🍎', '육류': '🥩', '수산물': '🐟',
                    '냉동식품': '🥟', '가공식품': '🥫', '반찬': '🍱', '음료': '🧃', '양념': '🧂' };
    return byCat[item.category] || '🧊';
  };

  /** 화면 아래 잠깐 뜨는 알림 메시지 */
  let toastTimer;
  util.toast = function (msg) {
    const el = document.getElementById('toast');
    if (!el) return alertFallback(msg);
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
  };
  function alertFallback(msg) { console.log('[FM]', msg); }

  /** 아래에서 올라오는 창 열기. html은 창 안 내용, 반환값은 창 요소(닫기: FM.util.closeSheet()) */
  util.openSheet = function (html) {
    const area = document.getElementById('sheet-area');
    area.innerHTML = '<div class="sheet-bg"><div class="sheet" role="dialog" aria-modal="true">' + html + '</div></div>';
    const bg = area.firstChild;
    bg.addEventListener('click', function (e) { if (e.target === bg) util.closeSheet(); });
    return bg.firstChild;
  };
  util.closeSheet = function () { document.getElementById('sheet-area').innerHTML = ''; };

  FM.util = util;
})(window.FM);
