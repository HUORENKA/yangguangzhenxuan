(function () {
  'use strict';
  var TA = window.TagAdmin;

  function parseLogDate(timeStr) {
    var d = (timeStr || '').split(' ')[0];
    return d.replace(/\//g, '-');
  }

  function getEntityName(log) {
    if (log.entityName) return log.entityName;
    var type = log.targetType === '商品' ? 'product' : 'supplier';
    return TA.getEntityDisplayName(type, log.entityId);
  }

  function getFilteredLogs() {
    var kw = (document.getElementById('logKeyword') || {}).value || '';
    var target = (document.getElementById('logTarget') || {}).value || '';
    var changeType = (document.getElementById('logChangeType') || {}).value || '';
    var from = (document.getElementById('logDateFrom') || {}).value || '';
    var to = (document.getElementById('logDateTo') || {}).value || '';
    kw = kw.trim().toLowerCase();
    return TA.changeLogs.filter(function (l) {
      if (target && l.targetType !== target) return false;
      if (changeType && l.changeType !== changeType) return false;
      if (kw) {
        var blob = (l.entityId + getEntityName(l) + l.operator).toLowerCase();
        if (blob.indexOf(kw) < 0) return false;
      }
      var d = parseLogDate(l.time);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  function renderLogs() {
    var tbody = document.getElementById('logBody');
    if (!tbody) return;
    var rows = getFilteredLogs();
    tbody.innerHTML = rows.map(function (l, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + l.targetType + '</td><td>' + l.entityId + '</td><td>' + getEntityName(l) + '</td><td>' + TA.renderLogChangeType(l.changeType) + '</td><td>' + l.operator + '</td><td>' + l.time + '</td>' +
        '<td><button type="button" class="link-btn log-view-detail" data-id="' + l.id + '">查看详情</button></td></tr>';
    }).join('');
    if (!rows.length) tbody.innerHTML = '<tr><td colspan="8" class="text-muted text-center">暂无匹配日志</td></tr>';
    tbody.querySelectorAll('.log-view-detail').forEach(function (btn) {
      btn.addEventListener('click', function () {
        TA.openLogDetailModal(btn.dataset.id);
      });
    });
  }

  function init() {
    renderLogs();
    document.getElementById('btnLogQuery').addEventListener('click', renderLogs);
    document.getElementById('btnLogReset').addEventListener('click', function () {
      document.getElementById('logKeyword').value = '';
      document.getElementById('logTarget').value = '';
      document.getElementById('logChangeType').value = '';
      document.getElementById('logDateFrom').value = '';
      document.getElementById('logDateTo').value = '';
      renderLogs();
    });
    document.getElementById('btnCloseLogDetail').addEventListener('click', function () {
      document.getElementById('logDetailModal').hidden = true;
    });
    document.getElementById('logDetailModal').addEventListener('click', function (e) {
      if (e.target === e.currentTarget) e.currentTarget.hidden = true;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
