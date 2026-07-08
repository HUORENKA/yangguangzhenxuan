/**
 * 管理后台 embed=1 子页：向父页 dashboard 上报文档高度，消除 iframe 内底部空白。
 * 在 iframe 内加载且 URL 带 embed=1 时自动生效。
 */
(function () {
  if (new URLSearchParams(location.search).get('embed') !== '1') return;
  if (window.parent === window) return;

  function measureHeight() {
    var doc = document.documentElement;
    var body = document.body;
    return Math.max(
      doc.scrollHeight,
      doc.offsetHeight,
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0
    );
  }

  function notifyParent() {
    window.parent.postMessage(
      { type: 'gc-admin-embed-resize', height: measureHeight() },
      '*'
    );
  }

  var timer;
  function scheduleNotify() {
    clearTimeout(timer);
    timer = setTimeout(notifyParent, 60);
  }

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'gc-admin-embed-request-resize') scheduleNotify();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleNotify);
  } else {
    scheduleNotify();
  }
  window.addEventListener('load', scheduleNotify);
  window.addEventListener('resize', scheduleNotify);

  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(scheduleNotify);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
  }

  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(scheduleNotify);
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  }
})();
