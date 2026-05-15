/**
 * 商品审核列表 · 原型逻辑
 * 上架状态卡片：全部 / 待审核 / 已驳回 / 已下架 / 已上架（默认展示「全部」）；
 * 待审核：通过、驳回（变更状态）；已上架：下架；已下架：上架；
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

/** @returns {string} YYYY-MM-DD */
function shelvedDayFromRow(row) {
  const s = (row.submittedAt || '').trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

/** @param {typeof baseAuditMocks[number]} row */
function formatWarehouseCols(row) {
  const ws = row.warehouseStocks || {};
  return WAREHOUSES.map(w => {
    const n = Number(ws[w]);
    const q = Number.isFinite(n) ? n : 0;
    return `<div class="flex justify-between gap-4 text-xs leading-snug max-w-[15rem] text-gray-700"><span class="text-gray-500">${escapeHtml(w)}</span><span class="tabular-nums font-semibold shrink-0 text-gray-900">${q}</span></div>`;
  }).join('');
}



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
  mount.innerHTML = buildSupplierMirrorModalHtml(row);
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
  if (idx === -1) {
    closeRejectModal();
    return;
  }
  auditQueue[idx].listStatus = 'rejected';
  auditQueue[idx].auditStatusLabel = '已驳回';
  closeRejectModal();
  renderShelfTabs();
  renderAuditProductTable();
  window.alert(`已对「${nameSnap}」执行驳回（原型）。\n驳回理由：${reason}`);
}

window.auditApprove = function auditApprove(rowId) {
  const row = auditQueue.find(x => x.id === rowId);
  if (!row || row.listStatus !== 'pending') return;
  if (!window.confirm(`确认通过审核？\n${row.name}`)) return;
  row.listStatus = 'online';
  row.auditStatusLabel = '已上架';
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
    aiKind: 'pass'
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
    aiKind: 'warn'
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
    aiKind: 'pass'
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
    aiKind: 'fail'
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
    aiKind: 'pass'
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
    aiKind: 'pass'
  }
];

/** @type {typeof baseAuditMocks} */
let auditQueue = [...baseAuditMocks];

/** 数据来源：队列中出现过 + 预设拓展（便于筛选演示） */
function buildThirdCategoryOptions() {
  const sel = document.getElementById('auditFilterCat3');
  if (!sel) return;
  const preset = [...new Set(baseAuditMocks.map(r => r.cat3))].sort();
  const extras = ['商用台式机', '激光打印机', '键鼠套装', '中性笔', '网布办公椅'];
  const merged = [...new Set([...preset, ...extras])].sort();
  while (sel.options.length > 1) sel.remove(1);
  merged.forEach(c3 => {
    const opt = document.createElement('option');
    opt.value = c3;
    opt.textContent = c3;
    sel.appendChild(opt);
  });
}

function aiTagHtml(aiKind) {
  if (aiKind === 'pass')
    return '<span class="mini-tag tag-ai-pass"><i class="fas fa-check"></i> 合规无风险</span>';
  if (aiKind === 'warn')
    return '<span class="mini-tag tag-ai-warn"><i class="fas fa-exclamation"></i> 语义/宣传需核对</span>';
  if (aiKind === 'fail')
    return '<span class="mini-tag tag-ai-fail"><i class="fas fa-times"></i> 类目规格需整改</span>';
  return '<span class="mini-tag tag-ai-pass">—</span>';
}

function aiTagCell(row) {
  if (row.listStatus !== 'pending') return '<span class="text-xs text-slate-400">—</span>';
  return aiTagHtml(row.aiKind);
}

function listStatusCellHtml(row) {
  const cfg = {
    pending: { label: '待审核', cls: 'text-[#1890FF] font-medium' },
    rejected: { label: '已驳回', cls: 'text-red-600 font-medium' },
    offline: { label: '已下架', cls: 'text-slate-600 font-medium' },
    online: { label: '已上架', cls: 'text-green-600 font-medium' }
  };
  const u = cfg[row.listStatus] || { label: '—', cls: 'text-gray-500' };
  return `<span class="${u.cls}">${escapeHtml(u.label)}</span>`;
}

function rowActionsHtml(r) {
  const idEsc = escapeAttr(r.id);
  const detail = `<button type="button" class="btn-audit bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" onclick="openAuditDetailModal('${idEsc}')"><i class="fas fa-file-lines"></i>查看详情</button>`;
  const preview = `<button type="button" class="btn-audit bg-slate-50 text-gray-700 border border-gray-200 hover:bg-slate-100" onclick="openListingPreview('${idEsc}')"><i class="fas fa-camera"></i>预览</button>`;

  if (r.listStatus === 'pending') {
    return `
      ${detail}
      ${preview}
      <button type="button" class="btn-audit btn-audit-pass" onclick="auditApprove('${idEsc}')"><i class="fas fa-check"></i>通过</button>
      <button type="button" class="btn-audit btn-audit-reject" onclick="openRejectModal('${idEsc}')"><i class="fas fa-ban"></i>驳回</button>`;
  }
  if (r.listStatus === 'online') {
    return `
      ${detail}
      ${preview}
      <button type="button" class="btn-audit border border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100" onclick="auditSetOffline('${idEsc}')"><i class="fas fa-arrow-down"></i>下架</button>`;
  }
  if (r.listStatus === 'offline') {
    return `
      ${detail}
      ${preview}
      <button type="button" class="btn-audit btn-audit-pass" onclick="auditSetOnline('${idEsc}')"><i class="fas fa-arrow-up"></i>上架</button>`;
  }
  return `${detail}${preview}`;
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

  const cat3El = document.getElementById('auditFilterCat3');
  const cat3 = cat3El && cat3El.value ? cat3El.value.trim() : '';
  if (cat3) rows = rows.filter(r => r.cat3 === cat3);

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
  const cat3 = document.getElementById('auditFilterCat3');
  if (cat3) cat3.selectedIndex = 0;
}

function renderAuditProductTable() {
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  const rows = getFilteredRows();

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center py-14 text-gray-500 text-sm">
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
          <td>
            <div class="font-semibold text-gray-900">${escapeHtml(r.name)}</div>
            <div class="text-xs text-gray-500 mt-1"><span class="text-gray-400">SKU</span> <span class="font-mono">${escapeHtml(r.sku || '—')}</span></div>
          </td>
          <td class="text-gray-800 tabular-nums whitespace-nowrap">${escapeHtml(formatPrice(r.price))}</td>
          <td class="text-gray-800 whitespace-nowrap">${escapeHtml(r.unit)}</td>
          <td class="text-xs text-gray-600 leading-relaxed max-w-[200px]">${catPath}</td>
          <td class="space-y-0.5">${formatWarehouseCols(r)}</td>
          <td class="text-gray-800 whitespace-nowrap">${escapeHtml(r.supplierName)}</td>
          <td class="text-gray-600 whitespace-nowrap">${escapeHtml(r.submittedAt)}</td>
          <td>${aiTagCell(r)}</td>
          <td>${listStatusCellHtml(r)}</td>
          <td class="text-right">
            <div class="flex flex-wrap justify-end gap-2">${rowActionsHtml(r)}</div>
          </td>
        </tr>`;
    })
    .join('');
}

function bindAuditModals() {
  const detailModal = document.getElementById('auditDetailModal');
  const rejectModal = document.getElementById('rejectModal');

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
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildThirdCategoryOptions();

  document.querySelectorAll('[data-audit-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-audit-tab');
      activeShelfTab = /** @type {typeof activeShelfTab} */ (t && ['all', 'pending', 'rejected', 'offline', 'online'].includes(t) ? t : 'all');
      renderShelfTabs();
      renderAuditProductTable();
    });
  });

  bindAuditModals();

  renderShelfTabs();
  renderAuditProductTable();

  document.getElementById('auditSearchBtn')?.addEventListener('click', renderAuditProductTable);

  document.getElementById('auditResetFiltersBtn')?.addEventListener('click', () => {
    resetFilters();
    renderAuditProductTable();
  });

  ['auditFilterNameSku', 'auditFilterSupplier', 'auditShelvedStart', 'auditShelvedEnd'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') renderAuditProductTable();
    });
  });
  document.getElementById('auditFilterCat3')?.addEventListener('change', renderAuditProductTable);
});
