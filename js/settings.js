/* =========================================================================
 * 설정 — 담당: 이지선  (EPIC-04, USE-08)
 * 요구사항: FUN-035 임박 기준일 1~7일(기본 3일) / FUN-036 단말 알림 켜기·끄기
 * 화면 자리: #settings-area
 * 도움 되는 함수: FM.store.getSettings() / FM.store.saveSettings({ soonDays: 5 })
 *   saveSettings를 부르면 목록·요약이 자동으로 다시 그려져요.
 * ========================================================================= */
(function (FM) {
  'use strict';

  var MIN_DAYS = 1;
  var MAX_DAYS = 7;
  var DEFAULT_DAYS = 3;

  var message = ''; // 알림 권한 관련 안내 문구 (다시 그려도 유지)

  // 1~7 사이 정수로 맞추기, 이상한 값이면 기본 3일
  function clampDays(v) {
    var n = parseInt(v, 10);
    if (isNaN(n)) return DEFAULT_DAYS;
    return Math.min(MAX_DAYS, Math.max(MIN_DAYS, n));
  }

  function notifySupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  function render() {
    var s = FM.store.getSettings() || {};
    var days = clampDays(s.soonDays);
    var notifyOn = !!s.notify;

    var options = '';
    for (var d = MIN_DAYS; d <= MAX_DAYS; d++) {
      options += '<option value="' + d + '"' + (d === days ? ' selected' : '') + '>' +
        d + '일 전' + (d === DEFAULT_DAYS ? ' (기본)' : '') + '</option>';
    }

    var notifyNote = '';
    if (!notifySupported()) {
      notifyNote = '이 브라우저는 알림을 지원하지 않아요.';
    } else if (Notification.permission === 'denied') {
      notifyNote = '브라우저에서 알림이 차단돼 있어요. 브라우저 설정에서 허용해 주세요.';
    }

    document.getElementById('settings-area').innerHTML =
      '<h2>설정</h2>' +

      // FUN-035 임박 기준일
      '<div class="setting-row">' +
        '<label for="soon-days"><b>임박 알림 기준</b></label> ' +
        '<select id="soon-days">' + options + '</select>' +
        '<p class="setting-help">유통기한이 <b>' + days + '일</b> 이내로 남으면 "임박"으로 표시해요.</p>' +
      '</div>' +

      // FUN-036 알림 켜기·끄기
      '<div class="setting-row">' +
        '<label><input type="checkbox" id="notify-toggle"' +
          (notifyOn ? ' checked' : '') +
          (notifySupported() ? '' : ' disabled') +
        '> <b>단말 알림 받기</b></label>' +
        '<p class="setting-help">' + (notifyOn ? '알림이 켜져 있어요.' : '알림이 꺼져 있어요.') + '</p>' +
        (notifyNote ? '<p class="setting-warn">' + notifyNote + '</p>' : '') +
        (message ? '<p class="setting-warn">' + message + '</p>' : '') +
      '</div>';

    document.getElementById('soon-days').addEventListener('change', onDaysChange);
    document.getElementById('notify-toggle').addEventListener('change', onNotifyChange);
  }

  function onDaysChange(e) {
    message = '';
    FM.store.saveSettings({ soonDays: clampDays(e.target.value) });
    render();
  }

  function onNotifyChange(e) {
    var wantOn = e.target.checked;
    message = '';

    // 끄기는 바로 저장
    if (!wantOn) {
      FM.store.saveSettings({ notify: false });
      render();
      return;
    }

    if (!notifySupported()) {
      message = '이 브라우저는 알림을 지원하지 않아요.';
      render();
      return;
    }

    // 이미 허용돼 있으면 바로 켜기
    if (Notification.permission === 'granted') {
      FM.store.saveSettings({ notify: true });
      render();
      return;
    }

    // 권한 요청 (구형 브라우저는 콜백 방식이라 둘 다 처리)
    var handle = function (perm) {
      if (perm === 'granted') {
        FM.store.saveSettings({ notify: true });
      } else {
        message = '알림 권한이 허용되지 않아 켤 수 없어요.';
        FM.store.saveSettings({ notify: false });
      }
      render();
    };
    var p = Notification.requestPermission(handle);
    if (p && typeof p.then === 'function') p.then(handle);
  }

  FM.register('settings', { render: render });
})(window.FM);
