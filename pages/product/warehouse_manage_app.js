'use strict';

/** @type {ReturnType<typeof window.loadWarehouseState>} */
let wmState = window.loadWarehouseState();

/** 已选区县编码（持久化字段来源） */
let modalDistrictsSelected = new Set();

/** 中间栏聚焦：仅展示该市下属区县 */
/** @type {string | null} */
let viewProvinceCode = null;

/** @type {string | null} */
let viewCityCode = null;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function persist() {
  window.saveWarehouseState(wmState);
}

function getProvinceNode(tree, code) {
  return tree.find(p => p.code === code) || null;
}

function getCityNode(tree, cityCode) {
  for (let i = 0; i < tree.length; i++) {
    const c = (tree[i].children || []).find(x => x.code === cityCode);
    if (c) return { city: c, province: tree[i] };
  }
  return null;
}

/** @returns {string[]} */
function districtCodesUnderProvince(p) {
  const codes = [];
  (p.children || []).forEach(c => {
    (c.children || []).forEach(d => codes.push(d.code));
  });
  return codes;
}

/** @returns {string[]} */
function districtCodesUnderCity(c) {
  return (c.children || []).map(d => d.code);
}

function provinceSelectionSnapshot(p) {
  const ids = districtCodesUnderProvince(p);
  const n = ids.filter(id => modalDistrictsSelected.has(id)).length;
  return { ids, n, total: ids.length };
}

function citySelectionSnapshot(c) {
  const ids = districtCodesUnderCity(c);
  const n = ids.filter(id => modalDistrictsSelected.has(id)).length;
  return { ids, n, total: ids.length };
}

function resetModalRegionsEmpty() {
  modalDistrictsSelected = new Set();
  const tree = window.REGION_TREE_SAMPLE;
  viewProvinceCode = tree && tree.length ? tree[0].code : null;
  viewCityCode = null;
}

function loadModalRegionsFromCodes(codes) {
  modalDistrictsSelected = new Set(Array.isArray(codes) ? codes.filter(Boolean) : []);
  const tree = window.REGION_TREE_SAMPLE;
  if (!tree || !tree.length) {
    viewProvinceCode = null;
    viewCityCode = null;
    return;
  }

  viewProvinceCode = null;
  for (let pi = 0; pi < tree.length; pi++) {
    const p = tree[pi];
    const ids = districtCodesUnderProvince(p);
    if (ids.some(id => modalDistrictsSelected.has(id))) {
      viewProvinceCode = p.code;
      break;
    }
  }
  if (!viewProvinceCode) viewProvinceCode = tree[0].code;

  const pNode = getProvinceNode(tree, viewProvinceCode);
  viewCityCode = null;
  if (pNode) {
    for (const c of pNode.children || []) {
      const ids = districtCodesUnderCity(c);
      if (ids.some(id => modalDistrictsSelected.has(id))) {
        viewCityCode = c.code;
        break;
      }
    }
  }
}

function applyTriStateToInput(inp, total, selectedCount) {
  inp.checked = total > 0 && selectedCount === total;
  inp.indeterminate = selectedCount > 0 && selectedCount < total;
}

function renderRegionColumns() {
  const tree = window.REGION_TREE_SAMPLE;
  const elP = document.getElementById('whRegionProvinces');
  const elC = document.getElementById('whRegionCities');
  const elD = document.getElementById('whRegionDistricts');
  const sum = document.getElementById('whRegionSummary');
  if (!elP || !elC || !elD || !tree || !window.REGION_INDEX) {
    const msg = '<div class="wh-region-empty">行政区划数据未加载</div>';
    if (elP) elP.innerHTML = msg;
    if (elC) elC.innerHTML = msg;
    if (elD) elD.innerHTML = msg;
    return;
  }

  elP.innerHTML = tree
    .map(p => {
      const active = viewProvinceCode === p.code;
      return `
    <div class="wh-region-row${active ? ' wh-region-row-active' : ''}">
      <input type="checkbox" class="wh-region-cb" data-kind="p" data-code="${escapeHtml(p.code)}" />
      <span role="button" tabindex="0" class="wh-region-focus-label wh-region-text" data-focus-p="${escapeHtml(
        p.code
      )}">${escapeHtml(p.name)}</span>
    </div>`;
    })
    .join('');

  elP.querySelectorAll('input.wh-region-cb[data-kind="p"]').forEach(inp => {
    const code = inp.dataset.code;
    const p = getProvinceNode(tree, code);
    if (!p) return;
    const { total, n } = provinceSelectionSnapshot(p);
    applyTriStateToInput(inp, total, n);
  });

  const pFocus = viewProvinceCode ? getProvinceNode(tree, viewProvinceCode) : null;

  if (!pFocus) {
    elC.innerHTML = '<div class="wh-region-empty">请点击左侧省份名称</div>';
    elD.innerHTML = '<div class="wh-region-empty">请点击中间地市名称</div>';
    if (sum) sum.textContent = `已选 ${modalDistrictsSelected.size} 个区县`;
    return;
  }

  const cities = pFocus.children || [];
  elC.innerHTML = cities.length
    ? cities
        .map(c => {
          const active = viewCityCode === c.code;
          return `
    <div class="wh-region-row${active ? ' wh-region-row-active' : ''}">
      <input type="checkbox" class="wh-region-cb" data-kind="c" data-code="${escapeHtml(c.code)}" />
      <span role="button" tabindex="0" class="wh-region-focus-label wh-region-text" data-focus-c="${escapeHtml(
        c.code
      )}">${escapeHtml(c.name)}</span>
    </div>`;
        })
        .join('')
    : '<div class="wh-region-empty">该省份暂无地市数据</div>';

  elC.querySelectorAll('input.wh-region-cb[data-kind="c"]').forEach(inp => {
    const code = inp.dataset.code;
    const found = getCityNode(tree, code);
    if (!found) return;
    const { total, n } = citySelectionSnapshot(found.city);
    applyTriStateToInput(inp, total, n);
  });

  const cityFocus =
    viewCityCode && cities.length ? cities.find(c => c.code === viewCityCode) : null;

  if (!cityFocus) {
    elD.innerHTML = '<div class="wh-region-empty">请点击中间地市名称查看区县</div>';
    if (sum) sum.textContent = `已选 ${modalDistrictsSelected.size} 个区县`;
    return;
  }

  const districts = cityFocus.children || [];
  elD.innerHTML = districts.length
    ? districts
        .map(
          d => `
    <label class="wh-region-row">
      <input type="checkbox" class="wh-region-cb" data-kind="d" data-code="${escapeHtml(d.code)}" ${
            modalDistrictsSelected.has(d.code) ? 'checked' : ''
          } />
      <span class="wh-region-text">${escapeHtml(d.name)}</span>
    </label>`
        )
        .join('')
    : '<div class="wh-region-empty">该地市暂无区县数据</div>';

  if (sum) sum.textContent = `已选 ${modalDistrictsSelected.size} 个区县`;
}

function handleRegionCheckboxChange(ev) {
  const t = ev.target;
  if (!(t instanceof HTMLInputElement) || !t.classList.contains('wh-region-cb')) return;
  const kind = t.dataset.kind;
  const code = t.dataset.code;
  if (!kind || !code) return;

  const tree = window.REGION_TREE_SAMPLE;
  if (!tree) return;

  if (kind === 'p') {
    const p = getProvinceNode(tree, code);
    if (!p) return;
    const ids = districtCodesUnderProvince(p);
    if (ids.length === 0) return;
    const { n, total } = provinceSelectionSnapshot(p);
    const fully = total > 0 && n === total;
    if (fully) ids.forEach(id => modalDistrictsSelected.delete(id));
    else ids.forEach(id => modalDistrictsSelected.add(id));
  } else if (kind === 'c') {
    const found = getCityNode(tree, code);
    if (!found) return;
    const ids = districtCodesUnderCity(found.city);
    if (ids.length === 0) return;
    const { n, total } = citySelectionSnapshot(found.city);
    const fully = total > 0 && n === total;
    if (fully) ids.forEach(id => modalDistrictsSelected.delete(id));
    else ids.forEach(id => modalDistrictsSelected.add(id));
  } else if (kind === 'd') {
    if (t.checked) modalDistrictsSelected.add(code);
    else modalDistrictsSelected.delete(code);
  }

  renderRegionColumns();
}

function handleRegionNavKeydown(ev) {
  if (ev.key !== 'Enter' && ev.key !== ' ') return;
  const t = ev.target;
  if (!(t instanceof Element)) return;
  const nav = t.closest('[data-focus-p], [data-focus-c]');
  if (!nav || !document.getElementById('whEditModalBody')?.contains(nav)) return;
  ev.preventDefault();
  const fp = nav.getAttribute('data-focus-p');
  const fc = nav.getAttribute('data-focus-c');
  if (fp) {
    viewProvinceCode = fp;
    viewCityCode = null;
    renderRegionColumns();
  } else if (fc) {
    viewCityCode = fc;
    renderRegionColumns();
  }
}

function handleRegionNavClick(ev) {
  const fp = ev.target.closest('[data-focus-p]');
  if (fp && fp.getAttribute('data-focus-p')) {
    viewProvinceCode = fp.getAttribute('data-focus-p');
    viewCityCode = null;
    renderRegionColumns();
    return;
  }
  const fc = ev.target.closest('[data-focus-c]');
  if (fc && fc.getAttribute('data-focus-c')) {
    viewCityCode = fc.getAttribute('data-focus-c');
    renderRegionColumns();
  }
}

function renderCards() {
  const mount = document.getElementById('whCardGrid');
  if (!mount) return;
  if (!wmState.warehouses.length) {
    mount.innerHTML =
      '<div class="text-center py-16 text-slate-400 text-sm col-span-full">暂无仓库数据，请点击「新增仓库」。</div>';
    return;
  }
  mount.innerHTML = wmState.warehouses
    .map(w => {
      const skuN = window.countActiveSkusInWarehouse(wmState, w.id);
      const dn = Array.isArray(w.deliveryDistrictCodes) ? w.deliveryDistrictCodes.length : 0;
      const statusBadge = w.enabled
        ? '<span class="wh-status wh-status-on"><i class="fas fa-circle-check"></i>启用</span>'
        : '<span class="wh-status wh-status-off"><i class="fas fa-ban"></i>禁用</span>';
      const toggleLabel = w.enabled ? '禁用仓库' : '启用仓库';
      const idEsc = encodeURIComponent(w.id);
      return `
        <article class="wh-card">
          <div class="wh-card-head">
            <h3 class="wh-card-title">${escapeHtml(w.name)}</h3>
            <button type="button" class="wh-icon-btn" title="编辑" aria-label="编辑" data-wh-edit="${encodeURIComponent(w.id)}">
              <i class="fas fa-pen-to-square"></i>
            </button>
          </div>
          <p class="wh-card-addr"><i class="fas fa-location-dot text-slate-400 mr-1"></i>${escapeHtml(w.address || '—')}</p>
          <div class="text-xs text-slate-500 flex items-center gap-2 mb-1">
            <i class="fas fa-truck text-slate-400"></i><span>配送范围：<strong class="text-slate-700">${dn}</strong> 个区县</span>
          </div>
          <div class="wh-card-meta">
            <div><span class="text-slate-500">商品数量（SKU）</span><strong>${skuN}</strong></div>
            <div>${statusBadge}</div>
          </div>
          <div class="wh-card-actions">
            <button type="button" class="wh-btn wh-btn-secondary" data-wh-toggle="${encodeURIComponent(w.id)}">${toggleLabel}</button>
            <a class="wh-btn wh-btn-primary" href="./warehouse_detail.html?wh=${idEsc}">进入仓库</a>
          </div>
        </article>`;
    })
    .join('');

  mount.querySelectorAll('[data-wh-edit]').forEach(btn => {
    btn.addEventListener('click', () =>
      openWarehouseModal(decodeURIComponent(btn.getAttribute('data-wh-edit') || ''))
    );
  });
  mount.querySelectorAll('[data-wh-toggle]').forEach(btn => {
    btn.addEventListener('click', () =>
      toggleWarehouse(decodeURIComponent(btn.getAttribute('data-wh-toggle') || ''))
    );
  });
}

function toggleWarehouse(id) {
  const w = window.getWarehouseById(wmState, id);
  if (!w) return;
  w.enabled = !w.enabled;
  persist();
  renderCards();
}

function openWarehouseModal(id) {
  const isNew = id === '__new__';
  const w = isNew ? null : window.getWarehouseById(wmState, id);
  const overlay = document.getElementById('whEditOverlay');
  const title = document.getElementById('whModalTitle');
  const inpId = document.getElementById('whModalHiddenId');
  const inpName = document.getElementById('whModalName');
  const inpAddr = document.getElementById('whModalAddress');
  const selStatus = document.getElementById('whModalStatus');
  if (!overlay || !inpName || !inpAddr || !selStatus) return;
  inpId.value = isNew ? '' : id;
  title.textContent = isNew ? '新增仓库' : '编辑仓库';
  inpName.value = isNew ? '' : w.name;
  inpAddr.value = isNew ? '' : w.address || '';
  selStatus.value = isNew ? '1' : w.enabled ? '1' : '0';

  if (isNew) resetModalRegionsEmpty();
  else loadModalRegionsFromCodes(w.deliveryDistrictCodes);
  renderRegionColumns();

  overlay.classList.add('show');
  setTimeout(() => inpName.focus(), 50);
}

function closeWarehouseModal() {
  document.getElementById('whEditOverlay')?.classList.remove('show');
}

function confirmWarehouseModal() {
  const inpId = document.getElementById('whModalHiddenId');
  const inpName = document.getElementById('whModalName');
  const inpAddr = document.getElementById('whModalAddress');
  const selStatus = document.getElementById('whModalStatus');
  const name = inpName && inpName.value.trim();
  const addr = inpAddr && inpAddr.value.trim();
  const enabled = selStatus && selStatus.value === '1';
  const districtsSaved = [...modalDistrictsSelected].sort();

  if (!name) {
    alert('请填写仓库名称。');
    return;
  }
  if (!addr) {
    alert('请填写仓库地址。');
    return;
  }

  const hid = inpId && inpId.value.trim();
  if (hid) {
    const row = window.getWarehouseById(wmState, hid);
    if (!row) return;
    row.name = name;
    row.address = addr;
    row.enabled = enabled;
    row.deliveryDistrictCodes = districtsSaved;
  } else {
    const nid = `WH-${Date.now()}`;
    wmState.warehouses.push({
      id: nid,
      name,
      address: addr,
      enabled,
      deliveryDistrictCodes: districtsSaved
    });
    window.ensureWarehouseInventorySlot(wmState, nid);
  }
  persist();
  closeWarehouseModal();
  renderCards();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  document.getElementById('whAddBtn')?.addEventListener('click', () => openWarehouseModal('__new__'));
  document.getElementById('whModalCancel')?.addEventListener('click', closeWarehouseModal);
  document.getElementById('whModalSave')?.addEventListener('click', confirmWarehouseModal);
  document.getElementById('whEditOverlay')?.addEventListener('click', ev => {
    if (ev.target.id === 'whEditOverlay') closeWarehouseModal();
  });
  document.getElementById('whEditModalBody')?.addEventListener('change', handleRegionCheckboxChange);
  document.getElementById('whEditModalBody')?.addEventListener('click', handleRegionNavClick);
  document.getElementById('whEditModalBody')?.addEventListener('keydown', handleRegionNavKeydown);
});

window.whManageReloadState = function () {
  wmState = window.loadWarehouseState();
  renderCards();
};
