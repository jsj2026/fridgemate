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

  var MAX_SIZE = 5 * 1024 * 1024; // 5MB 넘는 파일은 백업 파일로 보기 어려움

  /* ---------- 유틸 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // INT-007: fridgemate-backup-YYYYMMDD.json (사용자 기기 현지 날짜 기준)
  function backupFileName(d) {
    d = d || new Date();
    return 'fridgemate-backup-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function countOf(v) {
    if (Array.isArray(v)) return v.length;
    if (typeof v === 'number') return v;
    return null;
  }

  function showStatus(msg, type) {
    var el = document.getElementById('backup-status');
    if (!el) return;
    el.className = 'backup-status ' + (type || '');
    el.innerHTML = msg;
  }

  /* ---------- FUN-041 내보내기 ---------- */
  function exportBackup() {
    try {
      var data = FM.store.exportAll();
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = backupFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      showStatus('✅ <b>' + escapeHtml(a.download) + '</b> 파일로 내보냈어요.', 'ok');
    } catch (e) {
      showStatus('❌ 내보내기에 실패했어요: ' + escapeHtml(e.message), 'error');
    }
  }

  /* ---------- FUN-042 형식 검증 ---------- */
  // 통과하면 null, 문제가 있으면 사용자에게 보여줄 메시지를 반환
  function validate(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return 'FridgeMate 백업 파일 형식이 아니에요. (최상위가 객체가 아님)';
    }
    if ('items' in obj && !Array.isArray(obj.items)) {
      return '백업 파일의 식재료 목록(items) 형식이 올바르지 않아요.';
    }
    if ('history' in obj && !Array.isArray(obj.history)) {
      return '백업 파일의 기록(history) 형식이 올바르지 않아요.';
    }
    if (!('items' in obj) && !('history' in obj)) {
      return '백업 파일에 식재료나 기록 데이터가 없어요.';
    }
    return null;
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error('파일을 읽을 수 없어요.')); };
      r.readAsText(file, 'utf-8');
    });
  }

  /* ---------- FUN-042 / FUN-043 가져오기 ---------- */
  function importBackup() {
    var input = document.getElementById('backup-file');
    var file = input && input.files && input.files[0];
    if (!file) { showStatus('가져올 백업 파일을 먼저 골라 주세요.', 'error'); return; }
    if (!/\.json$/i.test(file.name)) { showStatus('❌ .json 파일만 가져올 수 있어요.', 'error'); return; }
    if (file.size > MAX_SIZE) { showStatus('❌ 파일이 너무 커요. (최대 5MB)', 'error'); return; }

    var checked = document.querySelector('input[name="backup-mode"]:checked');
    var mode = checked ? checked.value : 'merge';

    readFile(file).then(function (text) {
      var data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        showStatus('❌ JSON 형식이 깨져 있어서 읽을 수 없어요.', 'error');
        return;
      }

      var err = validate(data);
      if (err) { showStatus('❌ ' + escapeHtml(err), 'error'); return; }

      if (mode === 'replace' &&
          !window.confirm('지금 저장된 데이터를 모두 지우고 백업 내용으로 바꿀까요?\n이 작업은 되돌릴 수 없어요.')) {
        showStatus('덮어쓰기를 취소했어요.', '');
        return;
      }

      var res = FM.store.importAll(data, mode);
      if (!res || !res.ok) {
        showStatus('❌ 가져오기 실패: ' + escapeHtml((res && res.error) || '알 수 없는 오류'), 'error');
        return;
      }

      var parts = [];
      var ni = countOf(res.items), nh = countOf(res.history);
      if (ni !== null) parts.push('식재료 ' + ni + '개');
      if (nh !== null) parts.push('기록 ' + nh + '건');
      showStatus('✅ ' + (mode === 'replace' ? '덮어쓰기' : '합치기') + ' 완료!' +
        (parts.length ? ' (' + parts.join(', ') + ')' : ''), 'ok');

      input.value = '';
      // 다른 탭(냉장고 목록 등)도 새 데이터로 다시 그리기
      if (typeof FM.refreshAll === 'function') FM.refreshAll();
      document.dispatchEvent(new CustomEvent('fm:data-changed', { detail: { source: 'backup', mode: mode } }));
    }).catch(function (e) {
      showStatus('❌ ' + escapeHtml(e.message), 'error');
    });
  }

  /* ---------- 화면 ---------- */
  function render() {
    var area = document.getElementById('backup-area');
    if (!area) return;

    area.innerHTML =
      '<section class="backup">' +
        '<h3>백업하기</h3>' +
        '<p class="hint">냉장고 데이터를 <code>' + backupFileName() + '</code> 파일로 저장해요.</p>' +
        '<button type="button" id="backup-export">JSON으로 내보내기</button>' +

        '<h3>복원하기</h3>' +
        '<input type="file" id="backup-file" accept=".json,application/json">' +
        '<fieldset class="backup-mode">' +
          '<legend>가져오는 방식</legend>' +
          '<label><input type="radio" name="backup-mode" value="merge" checked> 합치기 — 지금 데이터는 두고 백업 내용을 더해요</label>' +
          '<label><input type="radio" name="backup-mode" value="replace"> 덮어쓰기 — 지금 데이터를 지우고 백업으로 바꿔요</label>' +
        '</fieldset>' +
        '<button type="button" id="backup-import">가져오기</button>' +

        '<div id="backup-status" class="backup-status" role="status" aria-live="polite"></div>' +
      '</section>';

    document.getElementById('backup-export').addEventListener('click', exportBackup);
    document.getElementById('backup-import').addEventListener('click', importBackup);
  }

  FM.register('backup', { render: render });
})(window.FM);
