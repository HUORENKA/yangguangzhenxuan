/**
 * 商品列表（全量商品管理）· 原型逻辑
 * auditExempt=true：运营后台直传，免审直接上架，不展示 AI / 审核类型
 * 上架状态卡片：全部 / 待审核 / 已驳回 / 已下架 / 已上架（默认「全部」）
 */
'use strict';

const WAREHOUSES = ['华东一号仓', '华北物流中心', '华南保税仓', '西南协同仓', '华中中心仓'];

/** @type {'all' | 'pending' | 'rejected' | 'offline' | 'online'} */
let activeShelfTab = 'all';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function normalizeWarehouseStocksFull(ws) {
  const o = ws && typeof ws === 'object' ? ws : {};
  const full = {};
  WAREHOUSES.forEach(w => {
    const n = Number(o[w]);
    full[w] = Number.isFinite(n) ? n : 0;
  });
  return full;
}

function joinUrls(arr) {
  return (arr || []).join(', ');
}

function arrEqual(a, b) {
  const aa = [...(a || [])].map(String);
  const bb = [...(b || [])].map(String);
  if (aa.length !== bb.length) return false;
  return aa.every((v, i) => v === bb[i]);
}

/** @returns {{label:string,bVal:string,aVal:string,isDiff:boolean}[]} */
function compareSnapshotRows(before, after) {
  const rows = [];
  const wb = normalizeWarehouseStocksFull(before.warehouseStocks);
  const wa = normalizeWarehouseStocksFull(after.warehouseStocks);

  function pushRow(label, bVal, aVal, isDiff) {
    rows.push({ label, bVal, aVal, isDiff });
  }

  pushRow('商品名称', before.name, after.name, before.name !== after.name);
  pushRow(
    '价格（元）',
    Number(before.price).toFixed(2),
    Number(after.price).toFixed(2),
    Number(before.price) !== Number(after.price)
  );
  pushRow('单位', before.unit, after.unit, before.unit !== after.unit);
  pushRow('一级类目', before.cat1, after.cat1, before.cat1 !== after.cat1);
  pushRow('二级类目', before.cat2, after.cat2, before.cat2 !== after.cat2);
  pushRow('三级类目', before.cat3, after.cat3, before.cat3 !== after.cat3);

  const labelSet = new Set([
    ...(before.specLabels || []),
    ...(after.specLabels || []),
    ...Object.keys(before.specs || {}),
    ...Object.keys(after.specs || {})
  ]);
  labelSet.forEach(lbl => {
    const bv = String((before.specs || {})[lbl] ?? '');
    const av = String((after.specs || {})[lbl] ?? '');
    pushRow(`规格 · ${lbl}`, bv || '—', av || '—', bv !== av);
  });

  WAREHOUSES.forEach(w => {
    pushRow(`库存 · ${w}`, String(wb[w]), String(wa[w]), wb[w] !== wa[w]);
  });

  pushRow(
    '主图 URL',
    before.mainImage || '—',
    after.mainImage || '—',
    (before.mainImage || '') !== (after.mainImage || '')
  );
  pushRow(
    '副图（列表）',
    joinUrls(before.subImages) || '—',
    joinUrls(after.subImages) || '—',
    !arrEqual(before.subImages, after.subImages)
  );
  pushRow(
    '详情图（列表）',
    joinUrls(before.detailImages) || '—',
    joinUrls(after.detailImages) || '—',
    !arrEqual(before.detailImages, after.detailImages)
  );

  return rows;
}

function clearLinkedPendingChange(linkedProductId) {
  if (!linkedProductId) return;
  try {
    const pend = JSON.parse(sessionStorage.getItem('PRODUCT_CHANGE_PENDING_MAP') || '{}');
    if (pend && typeof pend === 'object') {
      delete pend[linkedProductId];
      sessionStorage.setItem('PRODUCT_CHANGE_PENDING_MAP', JSON.stringify(pend));
    }
  } catch {
    /* ignore */
  }
}

/** @returns {string} YYYY-MM-DD */
function shelvedDayFromRow(row) {
  const s = (row.submittedAt || '').trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

/** @param {typeof baseAuditMocks[number]} row */
function getWarehouseTotal(row) {
  const ws = row.warehouseStocks || {};
  let sum = 0;
  WAREHOUSES.forEach(w => {
    const n = Number(ws[w]);
    if (Number.isFinite(n)) sum += n;
  });
  return sum;
}

function formatWarehouseCell(row) {
  const total = getWarehouseTotal(row);
  const ws = row.warehouseStocks || {};
  const rowKey = escapeAttr(row.id);
  const details = WAREHOUSES.map(w => {
    const n = Number(ws[w]);
    const q = Number.isFinite(n) ? n : 0;
    return `<div class="audit-wh-popover-row"><span>${escapeHtml(w)}</span><strong>${q}</strong></div>`;
  }).join('');
  return `
    <div class="audit-wh-cell">
      <button type="button" class="audit-wh-total" data-wh-toggle="${rowKey}" aria-expanded="false" onclick="toggleWarehousePopover(event, '${rowKey}')">
        <span class="audit-wh-total-num">${total}</span>
        <span class="audit-wh-total-label">总库存</span>
        <i class="fas fa-chevron-down audit-wh-chevron"></i>
      </button>
      <div class="audit-wh-popover" id="wh-pop-${rowKey}">${details}</div>
    </div>`;
}

window.toggleWarehousePopover = function toggleWarehousePopover(event, rowId) {
  event.stopPropagation();
  const pop = document.getElementById('wh-pop-' + rowId);
  const btn = event.currentTarget;
  if (!pop || !btn) return;
  const willOpen = !pop.classList.contains('is-open');
  document.querySelectorAll('.audit-wh-popover.is-open').forEach(el => el.classList.remove('is-open'));
  document.querySelectorAll('.audit-wh-total[aria-expanded="true"]').forEach(el => el.setAttribute('aria-expanded', 'false'));
  if (willOpen) {
    pop.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
};



function formatPrice(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return Number(val).toFixed(2);
}

function previewStageLabel(row) {
  const m = { pending: '待审核', rejected: '已驳回', offline: '已下架', online: '已上架' };
  return m[row.listStatus] || row.auditStatusLabel || '—';
}

function serializeForListingPreview(row) {
  let sum = 0;
  WAREHOUSES.forEach(w => {
    const n = Number(row.warehouseStocks && row.warehouseStocks[w]);
    if (Number.isFinite(n)) sum += n;
  });
  return {
    name: row.name,
    price: row.price,
    unit: row.unit,
    catPath: [row.cat1, row.cat2, row.cat3],
    specs: { ...(row.specs || {}) },
    warehouses: WAREHOUSES.filter(w => row.warehouseStocks && row.warehouseStocks[w] != null),
    warehouseStocks: { ...(row.warehouseStocks || {}) },
    totalStock: sum,
    mainImage: row.mainImage || '',
    subImages: [...(row.subImages || [])],
    detailImages: [...(row.detailImages || [])],
    stage: previewStageLabel(row)
  };
}

window.openListingPreview = function openListingPreview(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row) return;
  try {
    sessionStorage.setItem('PRODUCT_UPLOAD_PREVIEW', JSON.stringify(serializeForListingPreview(row)));
    window.open('../product/product_upload_preview.html?ctx=audit', '_blank', 'noopener');
  } catch {
    window.alert('无法写入预览数据（sessionStorage）。');
  }
};

function normalizeSnapForAdminChangePage(snap) {
  return {
    name: snap.name ?? '',
    price: Number.isFinite(Number(snap.price)) ? Number(snap.price) : Number(snap.price) || 0,
    unit: snap.unit || '台',
    cat1: snap.cat1 || '',
    cat2: snap.cat2 || '',
    cat3: snap.cat3 || '',
    specs: snap.specs && typeof snap.specs === 'object' ? { ...snap.specs } : {},
    warehouseStocks: normalizeWarehouseStocksFull(snap.warehouseStocks),
    mainImage: String(snap.mainImage || ''),
    subImages: Array.isArray(snap.subImages) ? [...snap.subImages] : [],
    detailImages: Array.isArray(snap.detailImages) ? [...snap.detailImages] : []
  };
}

window.openChangeAuditDetailPage = function openChangeAuditDetailPage(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row || row.auditKind !== 'CHANGE_INFO' || !row.beforeSnapshot || !row.afterSnapshot) {
    openAuditDetailModal(rowId);
    return;
  }
  const payload = {
    ticketId: row.id,
    sku: row.sku || '',
    supplierName: row.supplierName || '',
    submittedAt: row.submittedAt || '',
    linkedProductId: row.linkedProductId || '',
    shelfSnapshot: row.shelfSnapshot === 'offline' ? 'offline' : 'online',
    before: normalizeSnapForAdminChangePage(row.beforeSnapshot),
    after: normalizeSnapForAdminChangePage(row.afterSnapshot)
  };
  try {
    sessionStorage.setItem('ADMIN_CHANGE_DETAIL_PAYLOAD', JSON.stringify(payload));
    window.location.href = '../../pages/admin/admin_product_change_audit_detail.html';
  } catch (e) {
    window.alert('无法打开核对页：' + (e.message || String(e)));
  }
};

function imgThumbRowHtml(urls) {
  const list = (urls || []).filter(Boolean);
  if (!list.length) return '<div class="text-xs text-slate-400 py-6 text-center">暂无图片</div>';
  return `<div class="img-preview-row">${list
    .map(u => `<div class="img-thumb"><img src="${escapeHtml(u)}" alt="" /></div>`)
    .join('')}</div>`;
}

/** 与上架弹窗类目规格控件一致顺序（规格标签取自提报快照） */
function specFieldsMirrorHtml(row) {
  const specs = row.specs || {};
  const labels = row.specLabels && row.specLabels.length ? row.specLabels : Object.keys(specs);
  if (!labels.length) return '';
  return labels
    .map(lbl => {
      const raw = specs[lbl];
      const val = raw !== undefined && raw !== null && String(raw).trim() !== '' ? String(raw) : '—';
      return `
        <label class="add-form-field">
          <span class="add-form-label">${escapeHtml(lbl)} <span class="text-red-500">*</span></span>
          <div class="add-form-input apm-ro-field">${escapeHtml(val)}</div>
        </label>`;
    })
    .join('');
}

/** 与上架弹窗仓库行 UI 一致（只读）；库存大于 0 视为已勾选 */
function warehouseRowsMirrorHtml(row) {
  const ws = row.warehouseStocks || {};
  return WAREHOUSES.map(w => {
    const n = Number(ws[w]);
    const q = Number.isFinite(n) ? n : 0;
    const checked = q > 0 ? 'checked' : '';
    return `
      <div class="apm-wm-row">
        <label class="apm-wm-item">
          <input type="checkbox" disabled ${checked} />
          <span>${escapeHtml(w)}</span>
        </label>
        <input type="number" disabled class="add-form-input apm-wm-stock-input apm-ro-field-num" value="${q}" />
      </div>`;
  }).join('');
}

function snapshotImgUploadRow(labelInnerHtml, zoneIconFa, hint, previewBlockHtml) {
  return `
    <div class="img-upload-row">
      <div class="add-form-label">${labelInnerHtml}</div>
      <div class="img-upload-card">
        <div class="img-upload-zone-ro">
          <span class="img-upload-zone-icon"><i class="${zoneIconFa}"></i></span>
          <span>上传图片</span>
          <span class="img-upload-hint">${escapeHtml(hint)}</span>
        </div>
        ${previewBlockHtml}
      </div>
    </div>`;
}

/** DOM 结构与供应商端「添加商品」弹窗一致，仅只读快照 + 尾部运营操作 */
function buildSupplierMirrorModalHtml(row) {
  const idEsc = escapeAttr(row.id);
  const mainPreviews = imgThumbRowHtml(row.mainImage ? [row.mainImage] : []);

  const headMeta = `
      <p class="text-xs text-slate-500 mt-3 leading-relaxed border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
        <strong class="text-slate-700">运营核对</strong> · SKU：<span class="font-mono text-slate-800">${escapeHtml(
          row.sku || '—'
        )}</span>
        · 供应商：${escapeHtml(row.supplierName)} · 上架时间：${escapeHtml(row.submittedAt || '—')}
      </p>`;

  const imgSection =
    snapshotImgUploadRow(
      '商品主图 <span class="text-red-500">*</span>',
      'fas fa-cloud-arrow-up',
      '必选 1 张主图 · 点击下方卡片重新选择',
      mainPreviews
    ) +
    snapshotImgUploadRow(
      '商品副图（可选）',
      'fas fa-images',
      '可选多张 · 支持一次多选文件',
      imgThumbRowHtml(row.subImages || [])
    ) +
    snapshotImgUploadRow(
      '详情图片（可选）',
      'fas fa-photo-film',
      '可选多张 · 用于详情页大图',
      imgThumbRowHtml(row.detailImages || [])
    );

  return `
<div class="add-product-modal audit-snapshot-shell" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
  <div class="apm-head-row">
    <div>
      <div class="text-xs font-black uppercase tracking-[0.14em] text-red-600">单笔录入 · 快照</div>
      <h3 class="text-xl font-black text-slate-900 mt-1">添加商品</h3>
      <p class="text-sm text-slate-500 mt-2 leading-6">价格按人民币填写；选择与平台一致的三级类目后，系统将展示该类目<strong>固定规格</strong>。勾选的每个仓库需单独填写<strong>非负整数</strong>库存。商品图片分为主图（必填）、副图（可选）与<strong>详情图</strong>（可选）。</p>
      ${headMeta}
    </div>
    <button type="button" class="assistant-close-ro rounded-full bg-slate-100 text-slate-500 border-0" style="width:40px;height:40px" onclick="closeAuditDetailModal()" aria-label="关闭">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>

  <div class="apm-section">
    <div class="apm-section-title">基本信息</div>
    <div class="add-form-grid">
      <label class="add-form-field" style="grid-column: 1 / -1;">
        <span class="add-form-label">商品名称 <span class="text-red-500">*</span></span>
        <div class="add-form-input apm-ro-field">${escapeHtml(row.name)}</div>
      </label>
      <label class="add-form-field">
        <span class="add-form-label">价格（人民币 · 元）<span class="text-red-500">*</span></span>
        <div class="add-form-input apm-ro-field">${escapeHtml(formatPrice(row.price))}</div>
      </label>
      <label class="add-form-field">
        <span class="add-form-label">单位（单枚举）<span class="text-red-500">*</span></span>
        <div class="add-form-input apm-ro-field">${escapeHtml(row.unit)}</div>
      </label>
    </div>
  </div>

  <div class="apm-section">
    <div class="apm-section-title">三级类目 · 规格</div>
    <div class="add-form-grid">
      <label class="add-form-field">
        <span class="add-form-label">一级类目 <span class="text-red-500">*</span></span>
        <div class="add-form-input apm-ro-field">${escapeHtml(row.cat1)}</div>
      </label>
      <label class="add-form-field">
        <span class="add-form-label">二级类目 <span class="text-red-500">*</span></span>
        <div class="add-form-input apm-ro-field">${escapeHtml(row.cat2)}</div>
      </label>
      <label class="add-form-field">
        <span class="add-form-label">三级类目 <span class="text-red-500">*</span></span>
        <div class="add-form-input apm-ro-field">${escapeHtml(row.cat3)}</div>
      </label>
      <div class="add-form-grid" style="grid-column: 1/-1; margin-top: 4px;">
        ${specFieldsMirrorHtml(row)}
      </div>
    </div>
  </div>

  <div class="apm-section">
    <div class="apm-section-title">仓库与分仓库存（可多选）</div>
    <p class="text-xs text-slate-500 mb-3">勾选仓库后，请在该行填写该仓的库存（非负整数）；未勾选的仓不参与。</p>
    <div class="apm-wm-grid">${warehouseRowsMirrorHtml(row)}</div>
  </div>

  <div class="apm-section">
    <div class="apm-section-title">图片 · 分成商品图片与详情图</div>
    ${imgSection}
  </div>

  <div class="flex flex-wrap justify-end gap-3 mt-8 pt-4 border-t border-slate-200">
    <button type="button" class="action-btn action-btn-secondary" onclick="closeAuditDetailModal()">关闭</button>
    <button type="button" class="action-btn action-btn-primary" onclick="openListingPreview('${idEsc}')"><i class="fas fa-camera"></i>预览</button>
  </div>
</div>`;
}

/** 信息变更审核：前后快照对比（与供应商变更页字段对齐） */
function buildChangeCompareModalHtml(row) {
  const b = row.beforeSnapshot;
  const a = row.afterSnapshot;
  if (!b || !a) return buildSupplierMirrorModalHtml(row);

  const cmpRows = compareSnapshotRows(b, a);
  const idEsc = escapeAttr(row.id);

  const banner = `
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-1 text-sm text-amber-950 leading-relaxed">
        <strong><i class="fas fa-code-branch mr-1"></i>本单为「信息变更」审核</strong>
        · 非新建上架；通过后将以<strong>变更后</strong>快照更新前台展示（原型）。
        · SKU：<span class="font-mono">${escapeHtml(row.sku || '—')}</span>
        ${row.linkedProductId ? ` · 关联商品 ID：<span class="font-mono">${escapeHtml(row.linkedProductId)}</span>` : ''}
      </div>`;

  const grid = `
    <div class="grid grid-cols-[minmax(76px,92px)_1fr_1fr] gap-x-2 gap-y-2 text-sm items-start mt-4">
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wide pb-1 border-b border-slate-100">字段</div>
      <div class="text-[11px] font-bold text-slate-400 uppercase pb-1 border-b border-slate-100">变更前（生效）</div>
      <div class="text-[11px] font-bold text-slate-400 uppercase pb-1 border-b border-slate-100">变更后（待审）</div>
      ${cmpRows
        .map(
          r => `
        <div class="font-semibold text-slate-600 text-xs pt-1.5">${escapeHtml(r.label)}</div>
        <div class="rounded-lg border border-slate-200 px-2 py-2 bg-slate-50 text-slate-700 text-xs leading-snug break-all">${escapeHtml(r.bVal)}</div>
        <div class="rounded-lg border px-2 py-2 text-xs leading-snug break-all ${
          r.isDiff ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-white border-slate-200 text-slate-800'
        }">${escapeHtml(r.aVal)}</div>`
        )
        .join('')}
    </div>`;

  return `
<div class="add-product-modal audit-snapshot-shell" role="dialog" aria-modal="true" onclick="event.stopPropagation()" style="width:min(900px,100%)">
  <div class="apm-head-row">
    <div class="min-w-0">
      <div class="text-xs font-black uppercase tracking-[0.14em] text-amber-700">审批 · 信息变更</div>
      <h3 class="text-xl font-black text-slate-900 mt-1 leading-snug break-words">${escapeHtml(row.name)}</h3>
      <p class="text-sm text-slate-500 mt-2">供应商：${escapeHtml(row.supplierName)} · 提交时间：${escapeHtml(row.submittedAt || '—')}</p>
      ${banner}
    </div>
    <button type="button" class="assistant-close-ro rounded-full bg-slate-100 text-slate-500 border-0 shrink-0" style="width:40px;height:40px" onclick="closeAuditDetailModal()" aria-label="关闭">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>

  <div class="apm-section">
    <div class="apm-section-title">变更内容前后对比</div>
    ${grid}
  </div>

  <div class="flex flex-wrap justify-end gap-3 mt-8 pt-4 border-t border-slate-200">
    <button type="button" class="action-btn action-btn-secondary" onclick="closeAuditDetailModal()">关闭</button>
    <button type="button" class="action-btn action-btn-primary" onclick="openListingPreview('${idEsc}')"><i class="fas fa-camera"></i>预览（变更后）</button>
  </div>
</div>`;
}

window.closeAuditDetailModal = function closeAuditDetailModal() {
  const modal = document.getElementById('auditDetailModal');
  const mount = document.getElementById('auditDetailMount');
  if (mount) mount.innerHTML = '';
  if (modal) modal.hidden = true;
};

window.openAuditDetailModal = function openAuditDetailModal(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row) return;
  const modal = document.getElementById('auditDetailModal');
  const mount = document.getElementById('auditDetailMount');
  if (!modal || !mount) return;
  const isChange = row.auditKind === 'CHANGE_INFO' && row.beforeSnapshot && row.afterSnapshot;
  mount.innerHTML = isChange ? buildChangeCompareModalHtml(row) : buildSupplierMirrorModalHtml(row);
  modal.hidden = false;
};

let rejectTargetId = null;

function closeRejectModal() {
  const el = document.getElementById('rejectModal');
  if (el) el.hidden = true;
  rejectTargetId = null;
  const ta = document.getElementById('rejectReasonInput');
  if (ta) ta.value = '';
}

window.openRejectModal = function openRejectModal(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row) return;
  if (row.listStatus !== 'pending') {
    window.alert('当前状态不可驳回，仅「待审核」可操作。');
    return;
  }
  rejectTargetId = rowId;
  const modal = document.getElementById('rejectModal');
  const hint = document.getElementById('rejectProductHint');
  const ta = document.getElementById('rejectReasonInput');
  if (!modal || !hint || !ta) return;
  hint.textContent = `即将驳回：「${row.name}」（SKU：${row.sku || '—'}）`;
  ta.value = '';
  modal.hidden = false;
  setTimeout(() => ta.focus(), 50);
};

function confirmRejectAudit() {
  if (!rejectTargetId) return;
  const ta = document.getElementById('rejectReasonInput');
  const reason = ta ? ta.value.trim() : '';
  if (!reason) {
    window.alert('请填写驳回理由。');
    if (ta) ta.focus();
    return;
  }
  const idx = auditQueue.findIndex(x => x.id === rejectTargetId);
  const nameSnap = idx >= 0 ? auditQueue[idx].name : '';
  const linkedPid = idx >= 0 ? auditQueue[idx].linkedProductId : null;
  if (idx === -1) {
    closeRejectModal();
    return;
  }
  auditQueue[idx].listStatus = 'rejected';
  auditQueue[idx].auditStatusLabel = '已驳回';
  clearLinkedPendingChange(linkedPid);
  closeRejectModal();
  renderShelfTabs();
  renderAuditProductTable();
  window.alert(`已对「${nameSnap}」执行驳回（原型）。\n驳回理由：${reason}`);
}

window.auditApprove = function auditApprove(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row || row.listStatus !== 'pending') return;
  if (!window.confirm(`确认通过审核？\n${row.name}`)) return;

  if (row.auditKind === 'CHANGE_INFO' && row.afterSnapshot) {
    const a = row.afterSnapshot;
    row.name = a.name;
    row.price = a.price;
    row.unit = a.unit;
    row.cat1 = a.cat1;
    row.cat2 = a.cat2;
    row.cat3 = a.cat3;
    row.specs = { ...(a.specs || {}) };
    row.specLabels = [...(a.specLabels && a.specLabels.length ? a.specLabels : Object.keys(a.specs || {}))];
    row.warehouseStocks = normalizeWarehouseStocksFull(a.warehouseStocks);
    row.mainImage = a.mainImage || '';
    row.subImages = [...(a.subImages || [])];
    row.detailImages = [...(a.detailImages || [])];
    row.listStatus = row.shelfSnapshot === 'offline' ? 'offline' : 'online';
    row.auditStatusLabel = row.listStatus === 'online' ? '已上架' : '已下架';

    if (row.linkedProductId) {
      const linked = auditQueue.find(x => x.id === row.linkedProductId);
      if (linked && isAuditExempt(linked)) {
        linked.name = a.name;
        linked.price = a.price;
        linked.unit = a.unit;
        linked.cat1 = a.cat1;
        linked.cat2 = a.cat2;
        linked.cat3 = a.cat3;
        linked.specs = { ...(a.specs || {}) };
        linked.specLabels = [...(a.specLabels && a.specLabels.length ? a.specLabels : Object.keys(a.specs || {}))];
        linked.warehouseStocks = normalizeWarehouseStocksFull(a.warehouseStocks);
        linked.mainImage = a.mainImage || '';
        linked.subImages = [...(a.subImages || [])];
        linked.detailImages = [...(a.detailImages || [])];
        linked.listStatus = row.shelfSnapshot === 'offline' ? 'offline' : 'online';
        linked.auditStatusLabel = linked.listStatus === 'online' ? '已上架' : '已下架';
      }

      try {
        const applied = JSON.parse(sessionStorage.getItem('PRODUCT_CHANGE_APPLIED_MAP') || '{}');
        const specText = Object.values(a.specs || {})
          .filter(v => String(v).trim())
          .join(' / ');
        applied[row.linkedProductId] = {
          name: a.name,
          price: a.price,
          unit: a.unit,
          category: a.cat1,
          spec: specText,
          catPath: [a.cat1, a.cat2, a.cat3],
          specs: { ...(a.specs || {}) },
          warehouseStocks: { ...normalizeWarehouseStocksFull(a.warehouseStocks) },
          mainImage: a.mainImage || '',
          subImages: [...(a.subImages || [])],
          detailImages: [...(a.detailImages || [])],
          status: row.shelfSnapshot === 'offline' ? 'offline' : 'published'
        };
        sessionStorage.setItem('PRODUCT_CHANGE_APPLIED_MAP', JSON.stringify(applied));
      } catch {
        /* ignore */
      }
    }

    row.auditKind = undefined;
    row.beforeSnapshot = null;
    row.afterSnapshot = null;
    row.shelfSnapshot = undefined;
    clearLinkedPendingChange(row.linkedProductId);
    row.linkedProductId = undefined;
  } else {
    row.listStatus = 'online';
    row.auditStatusLabel = '已上架';
  }

  renderShelfTabs();
  renderAuditProductTable();
};

window.auditSetOffline = function auditSetOffline(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row || row.listStatus !== 'online') return;
  if (!window.confirm(`确认下架该商品？\n${row.name}`)) return;
  row.listStatus = 'offline';
  row.auditStatusLabel = '已下架';
  renderShelfTabs();
  renderAuditProductTable();
};

window.auditSetOnline = function auditSetOnline(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row || row.listStatus !== 'offline') return;
  if (!window.confirm(`确认重新上架该商品？\n${row.name}`)) return;
  row.listStatus = 'online';
  row.auditStatusLabel = '已上架';
  renderShelfTabs();
  renderAuditProductTable();
};

const baseAuditMocks = [
  {
    id: 'AUD-DEMO-LAPTOP',
    listStatus: 'pending',
    sku: 'SKU-GC-NB-Pro14',
    specLabels: ['处理器', '内存', '硬盘', '屏幕尺寸'],
    name: '【演示】14英寸轻薄办公本 Pro-14',
    price: 5799,
    unit: '台',
    cat1: '办公设备',
    cat2: '台式整机',
    cat3: '笔记本电脑',
    specs: { 处理器: 'i7-1360P', 内存: '16GB', 硬盘: '1TB SSD', 屏幕尺寸: '14英寸' },
    warehouseStocks: { 华东一号仓: 120, 华北物流中心: 64, 华南保税仓: 0, 西南协同仓: 42, 华中中心仓: 88 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-lap/480/480',
    subImages: [
      'https://picsum.photos/seed/guocai-adm-sw1-lap/200/200',
      'https://picsum.photos/seed/guocai-adm-sw2-lap/200/200'
    ],
    detailImages: ['https://picsum.photos/seed/guocai-adm-det-lap/960/540'],
    supplierName: '北京联合科技有限公司',
    submittedAt: '2026-05-12 10:08',
    aiKind: 'pass',
    aiRiskCount: 0,
    aiCheckedAt: '2026-05-12 10:06'
  },
  {
    id: 'AUD-DEMO-CHANGE-PAPER',
    auditKind: 'CHANGE_INFO',
    linkedProductId: '',
    listStatus: 'pending',
    sku: 'SKU-GC-PPR-CHG01',
    specLabels: ['克重', '幅面规格', '包装数量', '颜色'],
    name: '【演示·变更】得力风 A4复印纸 70g（10包装）',
    price: 135,
    unit: '箱',
    cat1: '办公耗材',
    cat2: '纸张类',
    cat3: '复印打印纸',
    specs: { 克重: '70g', 幅面规格: 'A4', 包装数量: '10包×500张', 颜色: '高白' },
    warehouseStocks: {
      华东一号仓: 600,
      华北物流中心: 300,
      华南保税仓: 200,
      西南协同仓: 100,
      华中中心仓: 280
    },
    mainImage: 'https://picsum.photos/seed/guocai-adm-paper-new/480/480',
    subImages: [],
    detailImages: [],
    supplierName: '华东优选办公用品商行',
    submittedAt: '2026-05-13 14:05',
    aiKind: 'warn',
    aiRiskCount: 2,
    aiCheckedAt: '2026-05-13 14:03',
    aiCheckSummary: '包装规格变更后图文一致性需核对，共 2 项风险。',
    shelfSnapshot: 'online',
    beforeSnapshot: {
      name: '【演示·变更】得力风 A4复印纸 70g（8包装）',
      price: 128,
      unit: '箱',
      cat1: '办公耗材',
      cat2: '纸张类',
      cat3: '复印打印纸',
      specs: { 克重: '70g', 幅面规格: 'A4', 包装数量: '8包×500张', 颜色: '高白' },
      specLabels: ['克重', '幅面规格', '包装数量', '颜色'],
      warehouseStocks: {
        华东一号仓: 520,
        华北物流中心: 310,
        华南保税仓: 180,
        西南协同仓: 95,
        华中中心仓: 240
      },
      mainImage: 'https://picsum.photos/seed/guocai-adm-paper/480/480',
      subImages: [],
      detailImages: []
    },
    afterSnapshot: {
      name: '【演示·变更】得力风 A4复印纸 70g（10包装）',
      price: 135,
      unit: '箱',
      cat1: '办公耗材',
      cat2: '纸张类',
      cat3: '复印打印纸',
      specs: { 克重: '70g', 幅面规格: 'A4', 包装数量: '10包×500张', 颜色: '高白' },
      specLabels: ['克重', '幅面规格', '包装数量', '颜色'],
      warehouseStocks: {
        华东一号仓: 600,
        华北物流中心: 300,
        华南保税仓: 200,
        西南协同仓: 100,
        华中中心仓: 280
      },
      mainImage: 'https://picsum.photos/seed/guocai-adm-paper-new/480/480',
      subImages: [],
      detailImages: []
    }
  },
  {
    id: 'AUD-DEMO-AIO',
    listStatus: 'pending',
    sku: 'SKU-GC-AIO-CM480',
    specLabels: ['打印方式', '扫描方式', '传真', 'ADF'],
    name: '【演示】A4彩色激光一体机 CM480',
    price: 3299,
    unit: '台',
    cat1: '办公设备',
    cat2: '打印输出',
    cat3: '多功能一体机',
    specs: { 打印方式: '彩色激光', 扫描方式: '平板+ADF', 传真: '支持', ADF: '50页' },
    warehouseStocks: { 华东一号仓: 35, 华北物流中心: 22, 华南保税仓: 18, 西南协同仓: 9, 华中中心仓: 27 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-aio/480/480',
    subImages: ['https://picsum.photos/seed/guocai-adm-sub-aio/160/160'],
    detailImages: [],
    supplierName: '华北数码供应链有限公司',
    submittedAt: '2026-05-12 09:52',
    aiKind: 'warn',
    aiRiskCount: 2,
    aiCheckedAt: '2026-05-12 09:50',
    aiCheckSummary: '详情中存在需核对的宣传表述，图文一致性需人工复核，共 2 项风险。'
  },
  {
    id: 'AUD-DEMO-PAPER',
    listStatus: 'rejected',
    sku: 'SKU-GC-PPR-A4080',
    specLabels: ['克重', '幅面规格', '包装数量', '颜色'],
    name: '【演示】80g复印纸 A4 箱装（5包装）',
    price: 128,
    unit: '箱',
    cat1: '办公耗材',
    cat2: '纸张类',
    cat3: '复印打印纸',
    specs: { 克重: '80g', 幅面规格: 'A4', 包装数量: '5包×500张', 颜色: '高白' },
    warehouseStocks: { 华东一号仓: 560, 华北物流中心: 320, 华南保税仓: 210, 西南协同仓: 145, 华中中心仓: 280 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-paper/480/480',
    subImages: [],
    detailImages: ['https://picsum.photos/seed/guocai-adm-paper-d1/960/400'],
    supplierName: '华东优选办公用品商行',
    submittedAt: '2026-05-11 16:41',
    aiKind: 'pass',
    aiRiskCount: 0,
    aiCheckedAt: '2026-05-11 16:38'
  },
  {
    id: 'AUD-DEMO-SW',
    listStatus: 'offline',
    sku: 'SKU-GC-SW-S24G',
    specLabels: ['端口数', '交换容量', 'PoE供电', '机架规格'],
    name: '【演示】24口千兆交换机 S24G-Pro',
    price: 899,
    unit: '台',
    cat1: '网络设备',
    cat2: '交换路由',
    cat3: '以太网交换机',
    specs: { 端口数: '24', 交换容量: '56Gbps', PoE供电: '可选', 机架规格: '1U' },
    warehouseStocks: { 华东一号仓: 72, 华北物流中心: 48, 华南保税仓: 30, 西南协同仓: 15, 华中中心仓: 36 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-swdev/480/480',
    subImages: [],
    detailImages: [],
    supplierName: '智联网络设备（上海）有限公司',
    submittedAt: '2026-05-11 11:06',
    aiKind: 'fail',
    aiRiskCount: 3,
    aiCheckedAt: '2026-05-11 11:04',
    aiCheckSummary: '主图与参数型号不一致，类目归属存疑，共 3 项风险。'
  },
  {
    id: 'AUD-DEMO-DOCK',
    listStatus: 'online',
    sku: 'SKU-GC-USBC-HUB7',
    specLabels: ['连接方式', '键区布局', '供电方式', '兼容系统'],
    name: '【演示】已上架 USB-C 七合一扩展坞',
    price: 199,
    unit: '个',
    cat1: '办公设备',
    cat2: '外设配件',
    cat3: '键鼠套装',
    specs: { 连接方式: 'USB-C 3.2', 键区布局: '—', 供电方式: '总线供电', 兼容系统: 'Windows / macOS' },
    warehouseStocks: { 华东一号仓: 200, 华北物流中心: 120, 华南保税仓: 80, 西南协同仓: 40, 华中中心仓: 90 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-dock/480/480',
    subImages: [],
    detailImages: [],
    supplierName: '北京联合科技有限公司',
    submittedAt: '2026-05-10 09:18',
    aiKind: 'pass',
    aiRiskCount: 0,
    aiCheckedAt: '2026-05-10 09:16'
  },
  {
    id: 'AUD-DEMO-CHAIR-OFF',
    listStatus: 'offline',
    sku: 'SKU-GC-CHAIR-M01',
    specLabels: ['材质', '扶手机构', '气杆等级', '承重'],
    name: '【演示】已下架 网布人体工学椅 M01',
    price: 1299,
    unit: '把',
    cat1: '办公家具',
    cat2: '人体工学座椅',
    cat3: '网布办公椅',
    specs: { 材质: '网布+尼龙脚', 扶手机构: '3D 可调', 气杆等级: '三级气压杆', 承重: '120kg' },
    warehouseStocks: { 华东一号仓: 0, 华北物流中心: 24, 华南保税仓: 0, 西南协同仓: 8, 华中中心仓: 16 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-chair/480/480',
    subImages: ['https://picsum.photos/seed/guocai-adm-chair-s1/160/160'],
    detailImages: [],
    supplierName: '华北数码供应链有限公司',
    submittedAt: '2026-05-09 14:22',
    aiKind: 'pass',
    aiRiskCount: 0,
    aiCheckedAt: '2026-05-09 14:20'
  },
  {
    id: 'ADM-DIRECT-INK',
    auditExempt: true,
    listStatus: 'online',
    sku: 'SKU-GC-INK-BK500',
    specLabels: ['颜色', '容量', '适用机型', '包装规格'],
    name: '【运营直传】原装黑色墨盒 BK-500',
    price: 89,
    unit: '个',
    cat1: '办公耗材',
    cat2: '打印耗材',
    cat3: '墨盒',
    specs: { 颜色: '黑色', 容量: '标准容量', 适用机型: 'CM480 系列', 包装规格: '单支装' },
    warehouseStocks: { 华东一号仓: 500, 华北物流中心: 320, 华南保税仓: 180, 西南协同仓: 90, 华中中心仓: 210 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-ink/480/480',
    subImages: [],
    detailImages: [],
    supplierName: '国采平台自营供应链',
    submittedAt: '2026-05-14 09:30'
  },
  {
    id: 'ADM-DIRECT-CABLE',
    auditExempt: true,
    listStatus: 'offline',
    sku: 'SKU-GC-CBL-HDMI2',
    specLabels: ['线材类型', '长度', '接口版本', '屏蔽工艺'],
    name: '【运营直传】HDMI 2.1 高清连接线 2米',
    price: 45,
    unit: '根',
    cat1: '办公设备',
    cat2: '外设配件',
    cat3: '线缆转接',
    specs: { 线材类型: 'HDMI', 长度: '2m', 接口版本: 'HDMI 2.1', 屏蔽工艺: '多层屏蔽' },
    warehouseStocks: { 华东一号仓: 0, 华北物流中心: 150, 华南保税仓: 80, 西南协同仓: 40, 华中中心仓: 60 },
    mainImage: 'https://picsum.photos/seed/guocai-adm-hdmi/480/480',
    subImages: [],
    detailImages: [],
    supplierName: '智联网络设备（上海）有限公司',
    submittedAt: '2026-05-13 16:20'
  }
];

/** @type {typeof baseAuditMocks} */
let auditQueue = [...baseAuditMocks];

function isAuditExempt(row) {
  return row && row.auditExempt === true;
}

/** 【上架审核层】校验项（与商品上架审核维度一致，共 5 项 · 是/否） */
const LISTING_AUDIT_ITEMS = [
  {
    code: 'title',
    name: '商品名称',
    desc: '标题非空、≤80 字，无外链/第三方平台名/敏感词；须含品名及关键规格，与所选类目一致',
    source: '商品名称'
  },
  {
    code: 'mainImg',
    name: '主图合格',
    desc: '主图清晰可访问，AI 判定主体为商品本身，非文字海报、空白占位或严重模糊图',
    source: '主图'
  },
  {
    code: 'consistency',
    name: '图文一致',
    desc: '标题、参数与主图 OCR 的品牌、型号、核心规格前后一致，无矛盾',
    source: '图文'
  },
  {
    code: 'noWatermark',
    name: '无水印导流',
    desc: '图文无外链、联系方式、导流文案及第三方平台水印/二维码',
    source: '图文'
  },
  {
    code: 'noSensitive',
    name: '无敏感违规',
    desc: '无敏感词库命中及广告法绝对化用语，AI 语义安全检测通过',
    source: '图文'
  }
];

function buildAiComplianceSummary(items, forSupplier) {
  var fails = items.filter(function (i) { return i.status === 'fail'; });
  if (!fails.length) {
    return forSupplier
      ? '商品上架审核 5 项均通过，合规无风险，可提交平台审核。'
      : '商品上架审核 5 项均通过，合规无风险。';
  }
  var failNames = fails.map(function (i) { return '「' + i.name + '」'; }).join('、');
  return forSupplier
    ? '商品上架审核共 ' + fails.length + ' 项未通过（' + failNames + '），请修改后重新校验。'
    : '共识别 ' + fails.length + ' 项风险（' + failNames + '），请结合明细核对后作出人工审核决定。';
}

function getAiRiskCount(row) {
  if (typeof row.aiRiskCount === 'number') return row.aiRiskCount;
  if (Array.isArray(row.aiCheckItems) && row.aiCheckItems.length) {
    return row.aiCheckItems.filter(function (i) { return i.status === 'fail'; }).length;
  }
  if (row.aiKind === 'pass') return 0;
  if (row.aiKind === 'warn') return 2;
  if (row.aiKind === 'fail') return 3;
  return 0;
}

function buildAiCheckSnapshot(row) {
  if (Array.isArray(row.aiCheckItems) && row.aiCheckItems.length) {
    var normalized = row.aiCheckItems.filter(function (i) {
      return LISTING_AUDIT_ITEMS.some(function (d) { return d.code === i.code; });
    });
    return {
      items: normalized.length ? normalized : row.aiCheckItems,
      summary: row.aiCheckSummary || buildAiComplianceSummary(normalized.length ? normalized : row.aiCheckItems, false),
      checkedAt: row.aiCheckedAt || row.submittedAt || '—'
    };
  }
  var riskN = getAiRiskCount(row);
  if (riskN === 0) {
    var passItems = LISTING_AUDIT_ITEMS.map(function (def) {
      return { code: def.code, name: def.name, desc: def.desc, source: def.source, value: '是', status: 'pass', evidence: '' };
    });
    return {
      items: passItems,
      summary: buildAiComplianceSummary(passItems, false),
      checkedAt: row.aiCheckedAt || row.submittedAt || '—'
    };
  }
  var failCodes =
    row.aiKind === 'fail'
      ? ['title', 'mainImg', 'consistency']
      : row.aiKind === 'warn'
        ? ['consistency', 'noSensitive']
        : ['noWatermark'];
  var evidenceMap = {
    title: '标题与类目匹配度不足，或缺少可识别品名及关键规格',
    mainImg: '主图不符合清晰度要求，或 AI 判定主体非有效商品图',
    consistency: '标题/参数与主图 OCR 存在品牌、型号或核心规格矛盾',
    noWatermark: '详情图疑似含第三方平台水印，置信度 0.62，建议人工复核',
    noSensitive: '详情中存在需核对的宣传表述或绝对化用语'
  };
  var items = LISTING_AUDIT_ITEMS.map(function (def) {
    if (failCodes.includes(def.code)) {
      return {
        code: def.code,
        name: def.name,
        desc: def.desc,
        source: def.source,
        value: '否',
        status: 'fail',
        evidence: evidenceMap[def.code] || '未通过校验'
      };
    }
    return { code: def.code, name: def.name, desc: def.desc, source: def.source, value: '是', status: 'pass', evidence: '' };
  });
  return {
    items: items,
    summary: row.aiCheckSummary || buildAiComplianceSummary(items, false),
    checkedAt: row.aiCheckedAt || row.submittedAt || '—'
  };
}

function aiComplianceTagHtml(row) {
  const n = getAiRiskCount(row);
  if (n === 0) {
    return '<span class="mini-tag tag-ai-pass"><i class="fas fa-check"></i> 合规无风险</span>';
  }
  const cls = row.aiKind === 'fail' ? 'tag-ai-fail' : 'tag-ai-warn';
  const icon = row.aiKind === 'fail' ? 'fa-times' : 'fa-triangle-exclamation';
  return `<span class="mini-tag ${cls}"><i class="fas ${icon}"></i> ${n}项风险</span>`;
}

function aiTagCell(row) {
  if (isAuditExempt(row)) {
    return '<span class="text-xs text-slate-400">—</span>';
  }
  if (row.aiKind == null && !row.aiCheckItems) {
    return '<span class="text-xs text-slate-400">—</span>';
  }
  return aiComplianceTagHtml(row);
}

function renderAdminAiCheckItemsHtml(items) {
  return items
    .map(item => {
      const cls = item.status === 'pass' ? 'pass' : item.status === 'fail' ? 'fail' : '';
      const valCls = item.status === 'pass' ? 'pass' : item.status === 'fail' ? 'fail' : '';
      const def = LISTING_AUDIT_ITEMS.find(d => d.code === item.code) || {};
      const desc = item.desc || def.desc || '';
      const evidenceHtml =
        item.status === 'fail' && item.evidence
          ? `<div class="admin-ai-check-evidence"><i class="fas fa-triangle-exclamation"></i> ${escapeHtml(item.evidence)}</div>`
          : '';
      return `
        <div class="admin-ai-check-item ${cls}">
          <div class="admin-ai-check-main">
            <div class="admin-ai-check-name">${escapeHtml(item.name)}</div>
            ${desc ? `<div class="admin-ai-check-desc">${escapeHtml(desc)}</div>` : ''}
            ${evidenceHtml}
          </div>
          <span class="admin-ai-check-val ${valCls}">${escapeHtml(item.value || '—')}</span>
        </div>`;
    })
    .join('');
}

window.closeAdminAiAuditResult = function closeAdminAiAuditResult() {
  const modal = document.getElementById('adminAiResultModal');
  const body = document.getElementById('adminAiResultBody');
  if (body) body.innerHTML = '';
  if (modal) modal.hidden = true;
};

window.openAdminAiAuditResult = function openAdminAiAuditResult(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row || (row.aiKind == null && !row.aiCheckItems)) return;
  const snap = buildAiCheckSnapshot(row);
  const modal = document.getElementById('adminAiResultModal');
  const body = document.getElementById('adminAiResultBody');
  const sub = document.getElementById('adminAiResultSub');
  if (!modal || !body) return;

  const riskN = getAiRiskCount(row);
  const statusText = riskN === 0 ? '合规无风险' : `${riskN}项风险`;
  if (sub) {
    sub.textContent = `${escapeHtml(row.name)} · 校验时间：${snap.checkedAt} · ${statusText}`;
  }

  body.innerHTML = `
    <div class="admin-ai-readonly-note">
      <i class="fas fa-lock text-slate-400"></i>
      以下内容为供应商提交审核时附带的 <strong>AI 合规校验快照</strong>，仅供运营核对参考，不可在此重新发起校验。
    </div>
    <div class="admin-ai-section-title">审核项目 <span class="admin-ai-layer-tag">上架审核层</span></div>
    <div class="admin-ai-check-grid">${renderAdminAiCheckItemsHtml(snap.items)}</div>
    <div class="admin-ai-summary">
      <div class="admin-ai-summary-label"><i class="fas fa-wand-magic-sparkles"></i> AI 合规总结</div>
      ${escapeHtml(snap.summary)}
    </div>`;

  modal.hidden = false;
};

function aiResultBtnHtml(row) {
  if (isAuditExempt(row)) return '';
  if (row.aiKind == null && !row.aiCheckItems) return '';
  const idEsc = escapeAttr(row.id);
  return `<button type="button" class="btn-audit-sm btn-audit-primary" onclick="openAdminAiAuditResult('${idEsc}')"><i class="fas fa-shield-halved"></i>AI审核结果</button>`;
}

function getShelfStatusKey(row) {
  if (row.listStatus === 'online') return 'online';
  if (row.listStatus === 'offline') return 'offline';
  if (row.listStatus === 'pending' && row.auditKind === 'CHANGE_INFO' && row.shelfSnapshot) {
    return row.shelfSnapshot === 'offline' ? 'offline' : 'online';
  }
  if (row.listStatus === 'pending' || row.listStatus === 'rejected') return 'unshelved';
  return 'none';
}

function shelfStatusCellHtml(row) {
  if (isAuditExempt(row) && (row.listStatus === 'pending' || row.listStatus === 'rejected')) {
    return '<span class="text-gray-400 text-xs">—</span>';
  }
  const cfg = {
    online: { label: '已上架', cls: 'status-pill-shelf-online', icon: 'fa-circle-check' },
    offline: { label: '已下架', cls: 'status-pill-shelf-offline', icon: 'fa-circle-minus' },
    unshelved: { label: '未上架', cls: 'status-pill-shelf-unshelved', icon: 'fa-circle' },
    none: { label: '—', cls: 'status-pill-shelf-unshelved', icon: '' }
  };
  const u = cfg[getShelfStatusKey(row)] || cfg.none;
  const icon = u.icon ? `<i class="fas ${u.icon}"></i>` : '';
  return `<span class="status-pill ${u.cls}">${icon}${escapeHtml(u.label)}</span>`;
}

function auditStatusCellHtml(row) {
  if (isAuditExempt(row)) {
    return '<span class="text-gray-400 text-xs">—</span>';
  }
  const cfg = {
    pending: { label: '待审核', cls: 'status-pill-audit-pending', icon: 'fa-clock' },
    rejected: { label: '已驳回', cls: 'status-pill-audit-rejected', icon: 'fa-ban' },
    online: { label: '已通过', cls: 'status-pill-audit-pass', icon: 'fa-check' },
    offline: { label: '已通过', cls: 'status-pill-audit-pass', icon: 'fa-check' }
  };
  const u = cfg[row.listStatus] || { label: '—', cls: 'status-pill-shelf-unshelved', icon: '' };
  const icon = u.icon ? `<i class="fas ${u.icon}"></i>` : '';
  return `<span class="status-pill ${u.cls}">${icon}${escapeHtml(u.label)}</span>`;
}

function auditKindCellHtml(row) {
  if (isAuditExempt(row)) {
    return '<span class="text-xs text-slate-400">—</span>';
  }
  if (row.auditKind === 'CHANGE_INFO') {
    return `<span class="mini-tag bg-amber-50 text-amber-900 border border-amber-200"><i class="fas fa-code-branch"></i> 信息变更</span>`;
  }
  return `<span class="mini-tag bg-slate-50 text-slate-600 border border-slate-200"><i class="fas fa-plus"></i> 新建上架</span>`;
}

function rowActionsHtml(r) {
  const idEsc = escapeAttr(r.id);
  const aiBtn = aiResultBtnHtml(r);
  const useChangeDetailPage =
    !isAuditExempt(r) && r.auditKind === 'CHANGE_INFO' && r.beforeSnapshot && r.afterSnapshot;
  const detail = useChangeDetailPage
    ? `<button type="button" class="btn-audit-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" onclick="openChangeAuditDetailPage('${idEsc}')"><i class="fas fa-file-lines"></i>查看详情</button>`
    : `<button type="button" class="btn-audit-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" onclick="openAuditDetailModal('${idEsc}')"><i class="fas fa-file-lines"></i>查看详情</button>`;
  const preview = `<button type="button" class="btn-audit-sm bg-slate-50 text-gray-700 border border-gray-200 hover:bg-slate-100" onclick="openListingPreview('${idEsc}')"><i class="fas fa-camera"></i>预览</button>`;

  const row1Items = [detail];
  if (aiBtn) row1Items.push(aiBtn);

  const row2Items = [preview];

  if (isAuditExempt(r)) {
    if (r.listStatus === 'online') {
      row2Items.push(`<button type="button" class="btn-audit-sm border border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100" onclick="auditSetOffline('${idEsc}')"><i class="fas fa-arrow-down"></i>下架</button>`);
    } else if (r.listStatus === 'offline') {
      row2Items.push(`<button type="button" class="btn-audit-sm btn-audit-pass" onclick="auditSetOnline('${idEsc}')"><i class="fas fa-arrow-up"></i>上架</button>`);
    }
  } else if (r.listStatus === 'pending') {
    row2Items.push(
      `<button type="button" class="btn-audit-sm btn-audit-pass" onclick="auditApprove('${idEsc}')"><i class="fas fa-check"></i>通过</button>`,
      `<button type="button" class="btn-audit-sm btn-audit-reject" onclick="openRejectModal('${idEsc}')"><i class="fas fa-ban"></i>驳回</button>`
    );
  } else if (r.listStatus === 'online') {
    row2Items.push(`<button type="button" class="btn-audit-sm border border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100" onclick="auditSetOffline('${idEsc}')"><i class="fas fa-arrow-down"></i>下架</button>`);
  } else if (r.listStatus === 'offline') {
    row2Items.push(`<button type="button" class="btn-audit-sm btn-audit-pass" onclick="auditSetOnline('${idEsc}')"><i class="fas fa-arrow-up"></i>上架</button>`);
  }

  const row1Cols = Math.max(row1Items.length, 1);
  const row2Cols = Math.max(row2Items.length, 1);

  return `
    <div class="audit-action-cell">
      <div class="audit-action-row cols-${row1Cols}">${row1Items.join('')}</div>
      <div class="audit-action-row cols-${row2Cols}">${row2Items.join('')}</div>
    </div>`;
}

function renderShelfTabs() {
  const total = auditQueue.length;
  const pend = auditQueue.filter(x => x.listStatus === 'pending').length;
  const rej = auditQueue.filter(x => x.listStatus === 'rejected').length;
  const off = auditQueue.filter(x => x.listStatus === 'offline').length;
  const on = auditQueue.filter(x => x.listStatus === 'online').length;

  const a = document.getElementById('auditStatAll');
  const b = document.getElementById('auditStatPending');
  const c = document.getElementById('auditStatRejected');
  const d = document.getElementById('auditStatOffline');
  const e = document.getElementById('auditStatOnline');
  if (a) a.textContent = String(total);
  if (b) b.textContent = String(pend);
  if (c) c.textContent = String(rej);
  if (d) d.textContent = String(off);
  if (e) e.textContent = String(on);

  document.querySelectorAll('[data-audit-tab]').forEach(el => {
    const t = el.getAttribute('data-audit-tab');
    const pressed = t === activeShelfTab;
    el.classList.toggle('audit-card-active', pressed);
    if (el instanceof HTMLButtonElement) el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  });
}

function getFilteredRows() {
  let rows = [...auditQueue];

  if (activeShelfTab !== 'all') rows = rows.filter(r => r.listStatus === activeShelfTab);

  const statusEl = document.getElementById('auditFilterListStatus');
  const statusFilter = statusEl && statusEl.value ? statusEl.value.trim() : '';
  if (activeShelfTab === 'all' && statusFilter) {
    rows = rows.filter(r => r.listStatus === statusFilter);
  }

  const skuNameEl = document.getElementById('auditFilterNameSku');
  const key = skuNameEl && skuNameEl.value ? skuNameEl.value.trim() : '';
  if (key) {
    rows = rows.filter(r => {
      const sku = String(r.sku || '');
      return r.name.includes(key) || sku.toLowerCase().includes(key.toLowerCase());
    });
  }

  const supEl = document.getElementById('auditFilterSupplier');
  const sup = supEl && supEl.value ? supEl.value.trim() : '';
  if (sup) rows = rows.filter(r => r.supplierName.includes(sup));

  const cat1El = document.getElementById('auditFilterCat1');
  const cat2El = document.getElementById('auditFilterCat2');
  const cat3El = document.getElementById('auditFilterCat3');
  const f1 = cat1El && cat1El.value ? cat1El.value.trim() : '';
  const f2 = cat2El && cat2El.value ? cat2El.value.trim() : '';
  const f3 = cat3El && cat3El.value ? cat3El.value.trim() : '';
  if (f1 || f2 || f3) {
    rows = rows.filter(r => {
      if (f1 && r.cat1 !== f1) return false;
      if (f2 && r.cat2 !== f2) return false;
      if (f3 && r.cat3 !== f3) return false;
      return true;
    });
  }

  const kindEl = document.getElementById('auditFilterAuditKind');
  const kind = kindEl && kindEl.value ? kindEl.value.trim() : '';
  if (kind === 'CHANGE_INFO') rows = rows.filter(r => !isAuditExempt(r) && r.auditKind === 'CHANGE_INFO');
  else if (kind === 'NEW_LISTING') rows = rows.filter(r => !isAuditExempt(r) && r.auditKind !== 'CHANGE_INFO');

  const startEl = document.getElementById('auditShelvedStart');
  const endEl = document.getElementById('auditShelvedEnd');
  const start = startEl && startEl.value ? startEl.value.trim() : '';
  const end = endEl && endEl.value ? endEl.value.trim() : '';
  if (start || end) {
    rows = rows.filter(r => {
      const d = shelvedDayFromRow(r);
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }

  return rows;
}

function resetFilters() {
  const ids = [
    'auditFilterNameSku',
    'auditFilterSupplier',
    'auditShelvedStart',
    'auditShelvedEnd'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const kind = document.getElementById('auditFilterAuditKind');
  if (kind) kind.selectedIndex = 0;
  const listStatus = document.getElementById('auditFilterListStatus');
  if (listStatus) listStatus.selectedIndex = 0;
  if (typeof window.resetThreeLevelCategoryFilter === 'function') {
    window.resetThreeLevelCategoryFilter({
      cat1: 'auditFilterCat1',
      cat2: 'auditFilterCat2',
      cat3: 'auditFilterCat3'
    });
  }
}

function renderAuditProductTable() {
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  const rows = getFilteredRows();

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" class="text-center py-14 text-gray-500 text-sm">
          暂无符合条件的数据。<br/><span class="text-xs text-gray-400 mt-2 inline-block">可点击「重置」清空筛选。</span>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(r => {
      const catPath = `${escapeHtml(r.cat1)} / ${escapeHtml(r.cat2)} / ${escapeHtml(r.cat3)}`;
      const idEsc = escapeAttr(r.id);

      return `
        <tr>
          <td class="col-product">
            <div class="audit-product-name">${escapeHtml(r.name)}</div>
            <div class="audit-product-sku">${escapeHtml(r.sku || '—')}</div>
          </td>
          <td class="col-price tabular-nums">${escapeHtml(formatPrice(r.price))}</td>
          <td class="col-unit">${escapeHtml(r.unit)}</td>
          <td class="col-cat">${catPath}</td>
          <td class="col-wh">${formatWarehouseCell(r)}</td>
          <td class="col-supplier">${escapeHtml(r.supplierName)}</td>
          <td class="col-time">${escapeHtml(r.submittedAt)}</td>
          <td class="col-kind">${auditKindCellHtml(r)}</td>
          <td class="col-ai">${aiTagCell(r)}</td>
          <td class="col-shelf">${shelfStatusCellHtml(r)}</td>
          <td class="col-audit">${auditStatusCellHtml(r)}</td>
          <td class="col-actions">${rowActionsHtml(r)}</td>
        </tr>`;
    })
    .join('');
}

function bindAuditFilterPanel() {
  const panel = document.getElementById('auditFilterPanel');
  const toggleBtn = document.getElementById('auditFilterToggleBtn');
  const toggleText = document.getElementById('auditFilterToggleText');
  if (!panel || !toggleBtn) return;

  const applyCollapsed = collapsed => {
    panel.classList.toggle('is-collapsed', collapsed);
    toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (toggleText) toggleText.textContent = collapsed ? '展开更多' : '收起更多';
  };

  let collapsed = false;
  try {
    collapsed = sessionStorage.getItem('AUDIT_FILTER_COLLAPSED') === '1';
  } catch {
    /* ignore */
  }
  applyCollapsed(collapsed);

  toggleBtn.addEventListener('click', () => {
    collapsed = !collapsed;
    applyCollapsed(collapsed);
    try {
      sessionStorage.setItem('AUDIT_FILTER_COLLAPSED', collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  });
}

function bindAuditModals() {
  const detailModal = document.getElementById('auditDetailModal');
  const rejectModal = document.getElementById('rejectModal');
  const aiModal = document.getElementById('adminAiResultModal');

  if (detailModal) {
    detailModal.addEventListener('click', ev => {
      if (ev.target === detailModal) closeAuditDetailModal();
    });
  }

  if (rejectModal) {
    rejectModal.addEventListener('click', ev => {
      if (ev.target === rejectModal) closeRejectModal();
    });
  }
  document.getElementById('rejectCancelBtn')?.addEventListener('click', closeRejectModal);
  document.getElementById('rejectConfirmBtn')?.addEventListener('click', confirmRejectAudit);

  document.getElementById('rejectReasonInput')?.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') closeRejectModal();
  });

  window.addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return;
    if (detailModal && !detailModal.hidden) closeAuditDetailModal();
    if (rejectModal && !rejectModal.hidden) closeRejectModal();
    if (aiModal && !aiModal.hidden) closeAdminAiAuditResult();
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.audit-wh-popover.is-open').forEach(el => el.classList.remove('is-open'));
    document.querySelectorAll('.audit-wh-total[aria-expanded="true"]').forEach(el => el.setAttribute('aria-expanded', 'false'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const append = JSON.parse(sessionStorage.getItem('PROTOTYPE_AUDIT_QUEUE_APPEND') || '[]');
    if (Array.isArray(append) && append.length) {
      append.forEach(r => auditQueue.unshift(r));
      sessionStorage.removeItem('PROTOTYPE_AUDIT_QUEUE_APPEND');
    }
  } catch {
    /* ignore */
  }

  if (typeof window.bindThreeLevelCategoryFilter === 'function') {
    window.bindThreeLevelCategoryFilter(
      { cat1: 'auditFilterCat1', cat2: 'auditFilterCat2', cat3: 'auditFilterCat3' },
      renderAuditProductTable
    );
  }

  document.querySelectorAll('[data-audit-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-audit-tab');
      activeShelfTab = /** @type {typeof activeShelfTab} */ (t && ['all', 'pending', 'rejected', 'offline', 'online'].includes(t) ? t : 'all');
      renderShelfTabs();
      renderAuditProductTable();
    });
  });

  bindAuditModals();
  bindAuditFilterPanel();

  renderShelfTabs();
  renderAuditProductTable();

  document.getElementById('auditSearchBtn')?.addEventListener('click', renderAuditProductTable);
  document.getElementById('auditFilterListStatus')?.addEventListener('change', renderAuditProductTable);

  document.getElementById('auditResetFiltersBtn')?.addEventListener('click', () => {
    resetFilters();
    renderAuditProductTable();
  });

  ['auditFilterNameSku', 'auditFilterSupplier', 'auditShelvedStart', 'auditShelvedEnd'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') renderAuditProductTable();
    });
  });
  document.getElementById('auditFilterAuditKind')?.addEventListener('change', renderAuditProductTable);
});
