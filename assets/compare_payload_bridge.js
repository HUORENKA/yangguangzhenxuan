(function (global) {
  var KEY = 'aiComparePayload';
  var HASH_PREFIX = '#p=';

  function savePayload(payload) {
    var json = JSON.stringify(payload);
    try {
      global.localStorage.setItem(KEY, json);
    } catch (e) {}
    try {
      global.sessionStorage.setItem(KEY, json);
    } catch (e) {}
    return json;
  }

  function readRawPayload() {
    var raw = null;
    try {
      raw = global.localStorage.getItem(KEY);
    } catch (e) {}
    if (!raw) {
      try {
        raw = global.sessionStorage.getItem(KEY);
      } catch (e) {}
    }
    if (!raw && global.location && global.location.hash && global.location.hash.indexOf(HASH_PREFIX) === 0) {
      try {
        raw = decodeURIComponent(global.location.hash.slice(HASH_PREFIX.length));
      } catch (e) {}
    }
    return raw;
  }

  function loadPayload() {
    var raw = readRawPayload();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function buildCompareUrl(relativeUrl, json) {
    var url = relativeUrl;
    if (json && json.length <= 120000) {
      url += HASH_PREFIX + encodeURIComponent(json);
    }
    return url;
  }

  function openComparePage(relativeUrl, payload, query) {
    var json = savePayload(payload);
    var base = String(relativeUrl || '').split('#')[0];
    if (query) {
      base += (base.indexOf('?') === -1 ? '?' : '&') + String(query).replace(/^\?/, '');
    }
    var url = buildCompareUrl(base, json);
    global.open(url, '_blank', 'noopener,noreferrer');
  }

  function clearHashPayload() {
    if (global.location && global.location.hash && global.location.hash.indexOf(HASH_PREFIX) === 0) {
      try {
        global.history.replaceState(null, '', global.location.pathname + global.location.search);
      } catch (e) {}
    }
  }

  global.ComparePayloadBridge = {
    KEY: KEY,
    save: savePayload,
    load: loadPayload,
    open: openComparePage,
    clearHash: clearHashPayload
  };
})(window);
