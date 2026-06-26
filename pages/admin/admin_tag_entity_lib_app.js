(function () {
  'use strict';
  var TA = window.TagAdmin;
  var entityType = document.body.dataset.entityType || 'product';

  var CAT_TREE = {
    '办公耗材': { '纸张类': ['复印纸'], '书写工具': ['中性笔'] },
    '办公设备': { '打印设备': ['激光打印机'] }
  };

  function parseCategory(cat) {
    var parts = (cat || '').split('>').map(function (s) { return s.trim(); });
    return { l1: parts[0] || '', l2: parts[1] || '', l3: parts[2] || '' };
  }

  function fillCatL2(l1) {
    var sel = document.getElementById('filterCatL2');
    if (!sel) return;
    sel.innerHTML = '<option value="">二级分类（全部）</option>';
    if (!l1 || !CAT_TREE[l1]) return;
    Object.keys(CAT_TREE[l1]).forEach(function (k) {
      sel.innerHTML += '<option>' + k + '</option>';
    });
  }

  function fillCatL3(l1, l2) {
    var sel = document.getElementById('filterCatL3');
    if (!sel) return;
    sel.innerHTML = '<option value="">三级分类（全部）</option>';
    if (!l1 || !l2 || !CAT_TREE[l1] || !CAT_TREE[l1][l2]) return;
    CAT_TREE[l1][l2].forEach(function (k) {
      sel.innerHTML += '<option>' + k + '</option>';
    });
  }

  function getFilteredList() {
    var list = TA.getEntityList(entityType);
    var sku = (document.getElementById('filterSku') || {}).value || '';
    var sup = (document.getElementById('filterSupplier') || {}).value || '';
    var l1 = (document.getElementById('filterCatL1') || {}).value || '';
    var l2 = (document.getElementById('filterCatL2') || {}).value || '';
    var l3 = (document.getElementById('filterCatL3') || {}).value || '';
    var st = (document.getElementById('filterStatus') || {}).value || '';
    sku = sku.trim().toLowerCase();
    sup = sup.trim().toLowerCase();
    return list.filter(function (item) {
      var c = parseCategory(item.category);
      if (entityType === 'product') {
        if (sku && item.sku.toLowerCase().indexOf(sku) < 0 && item.name.toLowerCase().indexOf(sku) < 0) return false;
        if (sup && item.supplier.toLowerCase().indexOf(sup) < 0) return false;
      } else {
        if (sku && item.code.toLowerCase().indexOf(sku) < 0 && item.name.toLowerCase().indexOf(sku) < 0) return false;
        if (sup && (item.supplier || item.name).toLowerCase().indexOf(sup) < 0) return false;
      }
      if (l1 && c.l1 !== l1) return false;
      if (l2 && c.l2 !== l2) return false;
      if (l3 && c.l3 !== l3) return false;
      if (st && item.status !== st) return false;
      return true;
    });
  }

  function renderActionCell(id, status, reviewCount) {
    var rc = reviewCount || 0;
    var html = '<div class="entity-action-group">';
    html += '<button type="button" class="entity-action-btn entity-action-btn-view view-tag" data-id="' + id + '">查看标签详情</button>';
    if (TA.entityIsNormalComplete(status, rc)) {
      html += '<button type="button" class="entity-action-btn entity-action-btn-maintain maintain-tag" data-id="' + id + '">维护</button>';
    } else if (TA.entityNeedsReview(status, rc)) {
      html += '<button type="button" class="entity-action-btn entity-action-btn-review review-tag" data-id="' + id + '">复核标签</button>';
    }
    html += '</div>';
    return html;
  }

  function bindListActions() {
    var tbody = document.getElementById('entityListBody');
    if (!tbody) return;
    tbody.querySelectorAll('.view-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        TA.openEntityModal(entityType, btn.dataset.id, renderList, 'view');
      });
    });
    tbody.querySelectorAll('.maintain-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        TA.openEntityProcessModal(entityType, btn.dataset.id, renderList, 'maintain');
      });
    });
    tbody.querySelectorAll('.review-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        TA.openEntityProcessModal(entityType, btn.dataset.id, renderList, 'review');
      });
    });
  }

  function renderList() {
    var tbody = document.getElementById('entityListBody');
    if (!tbody) return;
    var list = getFilteredList();
    if (entityType === 'product') {
      tbody.innerHTML = list.map(function (p, i) {
        var rc = p.reviewCount || 0;
        return '<tr><td>' + (i + 1) + '</td><td class="font-semibold">' + p.sku + '</td><td>' + p.name + '</td><td>' + p.category + '</td><td>' + p.supplier + '</td>' +
          '<td>' + TA.renderEntityStatus(p.status, rc) + '</td>' +
          '<td><span class="review-count' + (rc ? '' : ' zero') + '">' + rc + '</span></td>' +
          '<td>' + p.taggedAt + '</td>' +
          '<td class="entity-actions">' + renderActionCell(p.id, p.status, rc) + '</td></tr>';
      }).join('');
      if (!list.length) tbody.innerHTML = '<tr><td colspan="9" class="text-muted text-center">暂无匹配商品</td></tr>';
    } else {
      tbody.innerHTML = list.map(function (s, i) {
        var rc = s.reviewCount || 0;
        return '<tr><td>' + (i + 1) + '</td><td class="font-semibold">' + s.code + '</td><td>' + s.name + '</td>' +
          '<td>' + TA.renderEntityStatus(s.status, rc) + '</td>' +
          '<td><span class="review-count' + (rc ? '' : ' zero') + '">' + rc + '</span></td>' +
          '<td>' + s.taggedAt + '</td>' +
          '<td class="entity-actions">' + renderActionCell(s.id, s.status, rc) + '</td></tr>';
      }).join('');
      if (!list.length) tbody.innerHTML = '<tr><td colspan="7" class="text-muted text-center">暂无匹配供应商</td></tr>';
    }
    bindListActions();
  }

  function initFilters() {
    var l1Sel = document.getElementById('filterCatL1');
    if (!l1Sel) return;
    l1Sel.addEventListener('change', function () {
      fillCatL2(l1Sel.value);
      fillCatL3(l1Sel.value, '');
    });
    var l2Sel = document.getElementById('filterCatL2');
    if (l2Sel) {
      l2Sel.addEventListener('change', function () {
        fillCatL3(l1Sel.value, this.value);
      });
    }
    var queryBtn = document.getElementById('btnFilterQuery');
    if (queryBtn) queryBtn.addEventListener('click', renderList);
    var resetBtn = document.getElementById('btnFilterReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var skuInput = document.getElementById('filterSku');
        var supInput = document.getElementById('filterSupplier');
        var statusSel = document.getElementById('filterStatus');
        if (skuInput) skuInput.value = '';
        if (supInput) supInput.value = '';
        l1Sel.value = '';
        fillCatL2('');
        fillCatL3('', '');
        if (statusSel) statusSel.value = '';
        renderList();
      });
    }
  }

  function init() {
    renderList();
    initFilters();
    document.getElementById('btnCloseEntityModal').addEventListener('click', function () {
      document.getElementById('entityModal').hidden = true;
    });
    var params = new URLSearchParams(location.search);
    if (params.get('id')) {
      setTimeout(function () { TA.openEntityModal(entityType, params.get('id'), renderList, 'view'); }, 200);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
