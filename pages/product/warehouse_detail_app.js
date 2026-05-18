'use strict';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const params = new URLSearchParams(window.location.search);
const currentWhId = params.get('wh');

/** @type {ReturnType<typeof window.loadWarehouseState>} */
let wdState = window.loadWarehouseState();

function persist() {
  window.saveWarehouseState(wdState);
}

function currentWarehouse() {
  return window.getWarehouseById(wdState, currentWhId);
}

function readOnlyMode() {
  const w = currentWarehouse();
  return !!(w && !w.enabled);
}

function categoryCell(p) {
  if (Array.isArray(p.catPath) && p.catPath.length >= 3) {
    return `${p.catPath[0]} / ${p.catPath[1]} / ${p.catPath[2]}`;
  }
  return p.category || '—';
}

function getFilteredRows() {
  const kw = document.getElementById('wdSearchInput').value.trim().toLowerCase();
  const fc1 = document.getElementById('wdFilterCat1').value.trim();
  const fc2 = document.getElementById('wdFilterCat2').value.trim();
  const fc3 = document.getElementById('wdFilterCat3').value.trim();

  return window.WAREHOUSE_PRODUCT_CATALOG.filter(p => {
    const hay = `${p.name} ${p.sku}`.toLowerCase();
    if (kw && !hay.includes(kw)) return false;
    const cp = { cat1: p.catPath[0], cat2: p.catPath[1], cat3: p.catPath[2] };
    if (fc1 && cp.cat1 !== fc1) return false;
    if (fc2 && cp.cat2 !== fc2) return false;
    if (fc3 && cp.cat3 !== fc3) return false;
    return true;
  });
}

function renderBanner() {
  const el = document.getElementById('wdReadonlyBanner');
  if (!el) return;
  el.classList.toggle('hidden', !readOnlyMode());
}

function renderTitle() {
  const w = currentWarehouse();
  const nameEl = document.getElementById('wdWarehouseTitle');
  const subEl = document.getElementById('wdWarehouseSub');
  if (nameEl) nameEl.textContent = w ? w.name : '仓库不存在';
  if (subEl) subEl.textContent = w ? (readOnlyMode() ? '当前仓库已禁用 · 仅支持查看库存' : '管理本仓 SKU 库存与仓间调拨（原型）') : '';
}

function renderTable() {
  renderBanner();
  renderTitle();
  const tbody = document.getElementById('wdTableBody');
  const summary = document.getElementById('wdTableSummary');
  if (!tbody) return;

  const w = currentWarehouse();
  if (!w) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="px-5 py-14 text-center text-slate-400">无效的仓库参数。</td></tr>';
    return;
  }

  const rows = getFilteredRows();
  const ro = readOnlyMode();

  summary.textContent = `共 ${rows.length} 条 SKU · ${ro ? '只读' : '可编辑'}`;

  const masterCb = document.getElementById('wdMasterCb');
  if (masterCb) {
    masterCb.checked = false;
    masterCb.disabled = ro;
  }

  tbody.innerHTML = rows
    .map(p => {
      const qty = window.getQty(wdState, currentWhId, p.id);
      const pidEsc = escapeHtml(p.id);
      const cbDisabled = ro ? 'disabled' : '';
      const btnDisabled = ro ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';
      return `
      <tr class="border-t border-slate-100 hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 align-middle">
          <input type="checkbox" class="wd-row-cb h-4 w-4 rounded border-slate-300 text-red-600" data-pid="${pidEsc}" ${cbDisabled} />
        </td>
        <td class="px-5 py-3">
          <div class="font-semibold text-slate-900">${escapeHtml(p.name)}</div>
        </td>
        <td class="px-5 py-3 font-mono text-sm text-slate-700">${escapeHtml(p.sku)}</td>
        <td class="px-5 py-3 text-sm text-slate-600">${escapeHtml(categoryCell(p))}</td>
        <td class="px-5 py-3 tabular-nums font-semibold text-slate-900">${qty}</td>
        <td class="px-5 py-3">
          <div class="flex flex-wrap gap-2 ${btnDisabled}">
            <button type="button" class="wd-mini-btn wd-mini-secondary" data-stock-edit="${pidEsc}" ${ro ? 'disabled' : ''}>修改库存</button>
            <button type="button" class="wd-mini-btn wd-mini-outline" data-transfer-one="${pidEsc}" ${ro ? 'disabled' : ''}>转移库存</button>
          </div>
        </td>
      </tr>`;
    })
    .join('');

  tbody.querySelectorAll('[data-stock-edit]').forEach(btn => {
    btn.addEventListener('click', () => openStockModal(btn.getAttribute('data-stock-edit')));
  });
  tbody.querySelectorAll('[data-transfer-one]').forEach(btn => {
    btn.addEventListener('click', () => openTransferModal([btn.getAttribute('data-transfer-one')]));
  });

  tbody.querySelectorAll('.wd-row-cb').forEach(cb => {
    cb.addEventListener('change', syncBatchBtn);
  });

  syncBatchBtn();
}

function syncBatchBtn() {
  const btn = document.getElementById('wdBatchTransferBtn');
  if (!btn) return;
  btn.disabled = readOnlyMode() || getSelectedPids().length === 0;
}

function getSelectedPids() {
  return [...document.querySelectorAll('.wd-row-cb:checked')].map(cb => cb.getAttribute('data-pid'));
}

function toggleSelectAll(master) {
  if (readOnlyMode()) return;
  document.querySelectorAll('.wd-row-cb').forEach(cb => {
    cb.checked = master.checked;
  });
  syncBatchBtn();
}

function openStockModal(productId) {
  if (readOnlyMode()) return;
  const p = window.WAREHOUSE_PRODUCT_CATALOG.find(x => x.id === productId);
  if (!p) return;
  const qty = window.getQty(wdState, currentWhId, productId);
  document.getElementById('wdStockPid').value = productId;
  document.getElementById('wdStockProductLabel').textContent = `${p.name}（${p.sku}）`;
  document.getElementById('wdStockCurrent').textContent = String(qty);
  document.getElementById('wdStockInput').value = String(qty);
  document.getElementById('wdStockOverlay').classList.add('show');
}

function closeStockModal() {
  document.getElementById('wdStockOverlay').classList.remove('show');
}

function confirmStockModal() {
  const pid = document.getElementById('wdStockPid').value;
  const raw = document.getElementById('wdStockInput').value.trim();
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 0) {
    alert('请输入非负整数库存。');
    return;
  }
  window.setQty(wdState, currentWhId, pid, n);
  persist();
  closeStockModal();
  renderTable();
}

function buildTargetSelectHtml(excludeId) {
  return wdState.warehouses
    .filter(w => w.id !== excludeId && w.enabled)
    .map(w => `<option value="${encodeURIComponent(w.id)}">${escapeHtml(w.name)}</option>`)
    .join('');
}

function refreshTransferPreview(targetIdRaw) {
  const targetId = targetIdRaw ? decodeURIComponent(targetIdRaw) : '';
  const tbody = document.getElementById('wdTransferTbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr[data-t-pid]');
  rows.forEach(tr => {
    const pid = tr.getAttribute('data-t-pid');
    const cur = window.getQty(wdState, currentWhId, pid);
    const inp = tr.querySelector('.wd-transfer-qty');
    let mv = Math.floor(Number(inp.value));
    if (!Number.isFinite(mv) || mv < 0) mv = 0;
    if (mv > cur) mv = cur;
    tr.querySelector('[data-t-src]').textContent = String(cur);
    if (!targetId) {
      tr.querySelector('[data-t-tgt-before]').textContent = '—';
      tr.querySelector('[data-t-tgt-after]').textContent = '—';
      return;
    }
    const tgtBefore = window.getQty(wdState, targetId, pid);
    const after = tgtBefore + mv;
    tr.querySelector('[data-t-tgt-before]').textContent = String(tgtBefore);
    tr.querySelector('[data-t-tgt-after]').textContent = String(after);
  });
}

function openTransferModal(productIds) {
  if (readOnlyMode()) return;
  const ids = [...new Set(productIds)].filter(Boolean);
  if (!ids.length) return;

  const sel = document.getElementById('wdTransferTarget');
  sel.innerHTML = '<option value="">请选择目标仓库</option>' + buildTargetSelectHtml(currentWhId);
  const tbody = document.getElementById('wdTransferTbody');
  tbody.innerHTML = ids
    .map(pid => {
      const p = window.WAREHOUSE_PRODUCT_CATALOG.find(x => x.id === pid);
      if (!p) return '';
      const cur = window.getQty(wdState, currentWhId, pid);
      return `
      <tr data-t-pid="${escapeHtml(pid)}" class="border-t border-slate-100">
        <td class="px-3 py-2 text-sm">${escapeHtml(p.name)} <span class="text-slate-400 font-mono text-xs">${escapeHtml(p.sku)}</span></td>
        <td class="px-3 py-2 tabular-nums text-sm text-center" data-t-src>${cur}</td>
        <td class="px-3 py-2 text-center">
          <input type="number" min="0" step="1" class="wd-transfer-qty toolbar-input py-2 text-center" style="max-width:100px;margin:0 auto" value="0" />
        </td>
        <td class="px-3 py-2 tabular-nums text-sm text-center text-slate-600" data-t-tgt-before>0</td>
        <td class="px-3 py-2 tabular-nums text-sm text-center font-semibold text-emerald-700" data-t-tgt-after>0</td>
      </tr>`;
    })
    .join('');

  tbody.querySelectorAll('.wd-transfer-qty').forEach(inp => {
    inp.addEventListener('input', () => refreshTransferPreview(sel.value));
  });

  sel.onchange = () => refreshTransferPreview(sel.value);

  document.getElementById('wdTransferOverlay').classList.add('show');
  refreshTransferPreview(sel.value);
}

function closeTransferModal() {
  document.getElementById('wdTransferOverlay').classList.remove('show');
}

function confirmTransferModal() {
  const rawTarget = document.getElementById('wdTransferTarget').value.trim();
  const targetId = rawTarget ? decodeURIComponent(rawTarget) : '';
  if (!targetId) {
    alert('请选择目标仓库。');
    return;
  }
  const tw = window.getWarehouseById(wdState, targetId);
  if (!tw || !tw.enabled) {
    alert('目标仓库不可用（可能已禁用）。');
    return;
  }

  /** @type {Record<string, number>} */
  const transfers = {};
  document.querySelectorAll('#wdTransferTbody tr[data-t-pid]').forEach(tr => {
    const pid = tr.getAttribute('data-t-pid');
    const cur = window.getQty(wdState, currentWhId, pid);
    let mv = Math.floor(Number(tr.querySelector('.wd-transfer-qty').value));
    if (!Number.isFinite(mv) || mv < 0) mv = 0;
    if (mv > cur) mv = cur;
    if (mv > 0) transfers[pid] = mv;
  });

  if (!Object.keys(transfers).length) {
    alert('请至少填写一笔大于 0 的转移数量。');
    return;
  }

  window.applyBatchTransfer(wdState, currentWhId, targetId, transfers);
  persist();
  closeTransferModal();
  renderTable();
}

document.addEventListener('DOMContentLoaded', () => {
  if (!currentWhId || !currentWarehouse()) {
    renderTitle();
    document.getElementById('wdTableBody').innerHTML =
      '<tr><td colspan="6" class="px-5 py-14 text-center text-slate-400">仓库不存在或链接无效。<a href="./warehouse_manage.html" class="text-red-600 underline ml-2">返回仓库管理</a></td></tr>';
    return;
  }

  document.getElementById('wdBackLink').href = './warehouse_manage.html';

  if (typeof window.bindThreeLevelCategoryFilter === 'function') {
    window.bindThreeLevelCategoryFilter(
      { cat1: 'wdFilterCat1', cat2: 'wdFilterCat2', cat3: 'wdFilterCat3' },
      renderTable
    );
  }

  document.getElementById('wdSearchInput').addEventListener('keydown', ev => {
    if (ev.key === 'Enter') renderTable();
  });
  document.getElementById('wdSearchBtn').addEventListener('click', renderTable);

  document.getElementById('wdMasterCb').addEventListener('change', ev => {
    toggleSelectAll(ev.target);
  });

  document.getElementById('wdBatchTransferBtn').addEventListener('click', () => {
    const ids = getSelectedPids();
    if (!ids.length) {
      alert('请先勾选需要转移的商品。');
      return;
    }
    openTransferModal(ids);
  });

  document.getElementById('wdStockCancel').addEventListener('click', closeStockModal);
  document.getElementById('wdStockSave').addEventListener('click', confirmStockModal);
  document.getElementById('wdStockOverlay').addEventListener('click', ev => {
    if (ev.target.id === 'wdStockOverlay') closeStockModal();
  });

  document.getElementById('wdTransferCancel').addEventListener('click', closeTransferModal);
  document.getElementById('wdTransferConfirm').addEventListener('click', confirmTransferModal);
  document.getElementById('wdTransferOverlay').addEventListener('click', ev => {
    if (ev.target.id === 'wdTransferOverlay') closeTransferModal();
  });

  renderTable();
});
