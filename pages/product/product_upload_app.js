/* 上架商品页 · 原型逻辑（添加商品弹窗 / 批量导入 / 预览新页），无后端假设 */
'use strict';

const WAREHOUSES = ['华东一号仓', '华北物流中心', '华南保税仓', '西南协同仓', '华中中心仓'];
const UNITS = ['台', '箱', '套', '件', '盒', '张', '包', '根', '条', '㎡'];

/** 全平台三级类目 · 末级含固定规格标签 */
const PLATFORM_CATEGORIES = [
  {
    name: '办公设备',
    children: [
      {
        name: '台式整机',
        children: [
          { name: '商用台式机', specLabels: ['处理器', '内存', '硬盘', '显示器尺寸'] },
          { name: '笔记本电脑', specLabels: ['处理器', '内存', '硬盘', '屏幕尺寸'] }
        ]
      },
      {
        name: '打印输出',
        children: [
          { name: '激光打印机', specLabels: ['打印类型', '幅面', '连接方式', '耗材型号'] },
          { name: '多功能一体机', specLabels: ['打印方式', '扫描方式', '传真', 'ADF'] }
        ]
      },
      {
        name: '外设配件',
        children: [{ name: '键鼠套装', specLabels: ['连接方式', '键区布局', '供电方式', '兼容系统'] }]
      }
    ]
  },
  {
    name: '办公耗材',
    children: [
      {
        name: '纸张类',
        children: [{ name: '复印打印纸', specLabels: ['克重', '幅面规格', '包装数量', '颜色'] }]
      },
      {
        name: '笔类文具',
        children: [{ name: '中性笔', specLabels: ['笔芯规格', '包装支数', '墨水颜色', '笔杆材质'] }]
      }
    ]
  },
  {
    name: '网络设备',
    children: [
      {
        name: '交换路由',
        children: [{ name: '以太网交换机', specLabels: ['端口数', '交换容量', 'PoE供电', '机架规格'] }]
      }
    ]
  },
  {
    name: '办公家具',
    children: [
      {
        name: '人体工学座椅',
        children: [{ name: '网布办公椅', specLabels: ['材质', '扶手机构', '气杆等级', '承重'] }]
      }
    ]
  }
];

const TEMPLATE_HEADER = [
  '商品名称',
  '价格(元)',
  '单位',
  '一级类目',
  '二级类目',
  '三级类目',
  '规格JSON',
  '仓库库存JSON',
  '商品主图URL',
  '商品副图URL',
  '详情图URL'
];

/** @typedef {{ id:string, name:string, price:number, unit:string, cat1:string, cat2:string, cat3:string, specLabels:string[], specs:Object, warehouses:string[], warehouseStocks:Object, mainImage:string, subImages:string[], detailImages:string[], stage:string }} PendingProduct */

/** @type {PendingProduct[]} */
let pendingProducts = [];

let globalDialogOnConfirm = null;
let globalDialogOnCancel = null;

function findLeaf(cat1Name, cat2Name, cat3Name) {
  const L1 = PLATFORM_CATEGORIES.find(c => c.name === cat1Name);
  if (!L1) return null;
  const L2 = L1.children.find(c => c.name === cat2Name);
  if (!L2) return null;
  const L3 = L2.children.find(c => c.name === cat3Name);
  return L3 || null;
}

function parseSpecJson(text) {
  if (!text || !String(text).trim()) return null;
  try {
    return JSON.parse(String(text).trim());
  } catch {
    return null;
  }
}

function validateSpecObject(leaf, obj) {
  if (!obj || typeof obj !== 'object') return { ok: false, msg: '规格JSON解析失败' };
  const miss = leaf.specLabels.find(l => obj[l] === undefined || obj[l] === null || String(obj[l]).trim() === '');
  if (miss) return { ok: false, msg: `规格字段「${miss}」不能为空（须与类目模板完全一致）` };
  return { ok: true };
}

function makeId() {
  return `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizePrice(raw) {
  const n = Number(String(raw).replace(/,/g, '').trim());
  if (Number.isNaN(n) || n < 0) return NaN;
  return Math.round(n * 100) / 100;
}

function sanitizeInt(raw) {
  const s = String(raw).trim();
  if (!/^\d+$/.test(s)) return NaN;
  return Number(s);
}

/** 批量导入时可来自 Excel 数字或非负整数串 */
function sanitizeNonNegIntFlexible(raw) {
  if (raw === '' || raw === null || raw === undefined) return NaN;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 && Number.isInteger(raw)) return raw;
  const s = String(raw).trim().replace(/,/g, '');
  if (!/^\d+$/.test(s)) return NaN;
  return Number(s);
}

function splitMulti(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/[|｜;,，]/)
    .map(s => s.trim())
    .filter(Boolean);
}

/** @returns {{ warehouseStocks: Record<string, number>, warehouses: string[] }} */
function parseAndValidateWarehouseStockJson(text, rowTag) {
  const obj = parseSpecJson(text);
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error(`${rowTag} 「仓库库存JSON」须为合法 JSON 对象`);
  }
  const keys = Object.keys(obj);
  if (!keys.length) throw new Error(`${rowTag} 「仓库库存JSON」至少填写一个仓库及库存`);

  const warehouseStocks = {};
  for (const k of keys) {
    if (!WAREHOUSES.includes(k)) {
      throw new Error(`${rowTag} 未知仓库「${k}」，须为以下之一：${WAREHOUSES.join('、')}`);
    }
    const q = sanitizeNonNegIntFlexible(obj[k]);
    if (Number.isNaN(q)) {
      throw new Error(`${rowTag} 仓库「${k}」的库存须为非负整数`);
    }
    warehouseStocks[k] = q;
  }

  const warehouses = WAREHOUSES.filter(w => Object.prototype.hasOwnProperty.call(warehouseStocks, w));
  return { warehouseStocks, warehouses };
}

/** 列表中按固定仓库顺序逐行展示库存数量 */
function formatWarehouseStockByWarehouseHtml(p) {
  const ws = p.warehouseStocks || {};
  return WAREHOUSES.map(w => {
    const raw = ws[w];
    let n = 0;
    if (typeof raw === 'number' && Number.isFinite(raw)) n = raw;
    else if (raw !== undefined && raw !== '') {
      const parsed = sanitizeNonNegIntFlexible(raw);
      n = Number.isNaN(parsed) ? 0 : parsed;
    }
    return `<div class="flex justify-between gap-6 text-xs leading-snug max-w-[16rem]"><span class="text-slate-600">${escapeHtml(w)}</span><span class="tabular-nums shrink-0 font-semibold text-slate-900">${n}</span></div>`;
  }).join('');
}

function totalWarehouseStock(p) {
  const ws = p.warehouseStocks || {};
  return Object.values(ws).reduce((a, b) => a + Number(b || 0), 0);
}

function splitImageRefs(raw) {
  return splitMulti(raw);
}

function serializeForPreview(product) {
  return {
    name: product.name,
    price: product.price,
    unit: product.unit,
    catPath: [product.cat1, product.cat2, product.cat3],
    specs: product.specs,
    warehouses: [...(product.warehouses || [])],
    warehouseStocks: { ...(product.warehouseStocks || {}) },
    totalStock: totalWarehouseStock(product),
    mainImage: product.mainImage || '',
    subImages: [...(product.subImages || [])],
    detailImages: [...(product.detailImages || [])],
    stage: product.stage || '待提交'
  };
}

function openProductPreview(id) {
  const p = pendingProducts.find(x => x.id === id);
  if (!p) return;
  try {
    sessionStorage.setItem('PRODUCT_UPLOAD_PREVIEW', JSON.stringify(serializeForPreview(p)));
    window.open('./product_upload_preview.html', '_blank', 'noopener');
  } catch {
    showDialog({ title: '预览失败', message: '无法写入 sessionStorage（可能被浏览器禁用）。', type: 'error' });
  }
}

window.openProductPreview = openProductPreview;

function removePending(id) {
  pendingProducts = pendingProducts.filter(p => p.id !== id);
  renderPendingTable();
}

window.removePendingConfirm = function removePendingConfirm(id) {
  showDialog({
    title: '移除商品',
    message: '确认从待提交列表中移除此商品？',
    cancelText: '取消',
    confirmText: '移除',
    type: 'warn',
    onConfirm: () => removePending(id)
  });
};

/* ---------- Dialog ---------- */
function getDialogIcon(type) {
  if (type === 'success') return { cls: 'success', icon: 'fa-circle-check' };
  if (type === 'warn') return { cls: 'warn', icon: 'fa-triangle-exclamation' };
  if (type === 'error') return { cls: 'error', icon: 'fa-circle-xmark' };
  return { cls: 'info', icon: 'fa-circle-info' };
}

function showDialog(options) {
  const {
    title = '提示',
    message = '',
    type = 'info',
    confirmText = '确定',
    cancelText = '',
    onConfirm = null,
    onCancel = null,
    allowHtml = false
  } = options || {};

  const overlay = document.getElementById('globalDialogOverlay');
  const iconEl = document.getElementById('globalDialogIcon');
  const titleEl = document.getElementById('globalDialogTitle');
  const bodyEl = document.getElementById('globalDialogBody');
  const confirmBtn = document.getElementById('globalDialogConfirmBtn');
  const cancelBtn = document.getElementById('globalDialogCancelBtn');
  const ic = getDialogIcon(type);

  iconEl.className = `dialog-icon ${ic.cls}`;
  iconEl.innerHTML = `<i class="fas ${ic.icon}"></i>`;
  titleEl.textContent = title;
  if (allowHtml) bodyEl.innerHTML = message;
  else bodyEl.textContent = message;
  confirmBtn.textContent = confirmText || '确定';

  if (cancelText) {
    cancelBtn.style.display = 'inline-flex';
    cancelBtn.textContent = cancelText;
  } else cancelBtn.style.display = 'none';

  globalDialogOnConfirm = typeof onConfirm === 'function' ? onConfirm : null;
  globalDialogOnCancel = typeof onCancel === 'function' ? onCancel : null;
  overlay.classList.add('show');
}

window.closeGlobalDialogWhich = function closeGlobalDialog(which) {
  const overlay = document.getElementById('globalDialogOverlay');
  overlay.classList.remove('show');
  const cb = which === 'confirm' ? globalDialogOnConfirm : globalDialogOnCancel;
  globalDialogOnConfirm = null;
  globalDialogOnCancel = null;
  if (typeof cb === 'function') cb();
};

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

function formatPrice(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return `${Number(val).toFixed(2)}`;
}

function renderPendingTable() {
  const tbody = document.getElementById('pendingTableBody');
  const summary = document.getElementById('pendingSummary');

  if (!pendingProducts.length) {
    summary.textContent = '当前暂无待提交商品，请使用「添加商品」或「批量上传」。';
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="icon-wrap"><i class="fas fa-inbox"></i></div>
          <div class="text-base font-semibold text-slate-700 mb-2">暂无待提交商品</div>
          <div class="text-sm">可先添加单笔商品，或点击「批量上传」载入演示数据（原型）。</div>
        </td>
      </tr>`;
    return;
  }

  summary.textContent = `已载入 ${pendingProducts.length} 个待提交商品。可直接「提交审核」；亦可先执行「AI合规校验」（演示，不要求）。`;

  tbody.innerHTML = pendingProducts
    .map(p => {
      const path = `${escapeHtml(p.cat1)} / ${escapeHtml(p.cat2)} / ${escapeHtml(p.cat3)}`;

      const idEsc = escapeAttr(p.id);

      return `
        <tr class="border-t border-slate-100 hover:bg-slate-50 transition-colors">
          <td class="px-5 py-4"><div class="font-semibold text-slate-900">${escapeHtml(p.name)}</div></td>
          <td class="px-5 py-4">${escapeHtml(formatPrice(p.price))}</td>
          <td class="px-5 py-4">${escapeHtml(p.unit)}</td>
          <td class="px-5 py-4 text-xs text-slate-600 leading-5">${path}</td>
          <td class="px-5 py-4 align-top space-y-0.5">${formatWarehouseStockByWarehouseHtml(p)}</td>
          <td class="px-5 py-4">
            <div class="flex flex-wrap gap-2">
              <button type="button" class="table-op-btn" onclick="openProductPreview('${idEsc}')"><i class="fas fa-eye"></i><span>预览</span></button>
              <button type="button" class="table-op-btn table-op-btn-danger" onclick="removePendingConfirm('${idEsc}')"><i class="fas fa-trash"></i><span>移除</span></button>
            </div>
          </td>
        </tr>`;
    })
    .join('');
}

/** @returns {PendingProduct|null} */
function buildProductFromImportRow(rowObj, idx) {
  const name = (rowObj['商品名称'] || '').trim();
  const price = sanitizePrice(rowObj['价格(元)']);
  const unit = (rowObj['单位'] || '').trim();
  const c1 = (rowObj['一级类目'] || '').trim();
  const c2 = (rowObj['二级类目'] || '').trim();
  const c3 = (rowObj['三级类目'] || '').trim();

  const rowTag = `(第 ${idx + 1} 行)`;

  if (!name) throw new Error(`${rowTag} 缺少商品名称`);
  if (Number.isNaN(price)) throw new Error(`${rowTag} 价格无效`);
  if (!UNITS.includes(unit)) throw new Error(`${rowTag} 单位须为下拉枚举之一：${UNITS.join('、')}`);
  const leaf = findLeaf(c1, c2, c3);
  if (!leaf) throw new Error(`${rowTag} 三级类目不匹配平台类目树`);
  const specs = parseSpecJson(rowObj['规格JSON']);
  const vs = validateSpecObject(leaf, specs);
  if (!vs.ok) throw new Error(`${rowTag} ${vs.msg}`);

  const { warehouseStocks, warehouses } = parseAndValidateWarehouseStockJson(rowObj['仓库库存JSON'], rowTag);

  const mainUrl = (rowObj['商品主图URL'] || '').trim();
  if (!mainUrl) throw new Error(`${rowTag} 商品主图URL 不能为空`);

  return {
    id: makeId(),
    name,
    price,
    unit,
    cat1: c1,
    cat2: c2,
    cat3: c3,
    specLabels: [...leaf.specLabels],
    specs,
    warehouses,
    warehouseStocks,
    mainImage: mainUrl,
    subImages: splitImageRefs(rowObj['商品副图URL']),
    detailImages: splitImageRefs(rowObj['详情图URL']),
    stage: '待提交'
  };
}

/** CSV one line splitter with quotes */
function csvParseLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') q = !q;
    else if (!q && c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map(cell => String(cell).replace(/^"|"$/g, '').trim());
}

function parseCsvObjects(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) throw new Error('CSV 无有效行');

  const table = lines.map(csvParseLine);
  const headers = table[0].map(h => String(h).trim());
  const missing = TEMPLATE_HEADER.filter(h => !headers.includes(h));
  if (missing.length)
    throw new Error(`CSV 表头不完整，缺少列：${missing.join('、')}（必须与模板完全一致）`);

  const rowsOut = [];
  for (let r = 1; r < table.length; r += 1) {
    const cells = table[r];
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] !== undefined ? cells[i] : '';
    });
    rowsOut.push(obj);
  }
  return rowsOut;
}

function parseXlsxRows(buf) {
  if (typeof XLSX === 'undefined') throw new Error('未加载 SheetJS');
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
  if (!aoa.length) throw new Error('Excel 无数据');
  const headers = (aoa[0] || []).map(c => String(c || '').trim());
  const missing = TEMPLATE_HEADER.filter(h => !headers.includes(h));
  if (missing.length) throw new Error(`Excel 表头不完整，缺少列：${missing.join('、')}`);

  const rowsOut = [];
  for (let r = 1; r < aoa.length; r += 1) {
    const row = aoa[r] || [];
    const obj = {};
    headers.forEach((h, i) => {
      const v = row[i];
      obj[h] = v === undefined || v === null ? '' : String(v);
    });
    rowsOut.push(obj);
  }
  return rowsOut;
}

function templateExampleValues() {
  const leaf = findLeaf('办公设备', '台式整机', '商用台式机');
  const sj = leaf
    ? JSON.stringify(
        leaf.specLabels.reduce((m, lbl) => {
          const demo = ['i5', '16G', '512GB SSD', '23.8英寸'][leaf.specLabels.indexOf(lbl)] || '示例';
          m[lbl] = demo;
          return m;
        }, {})
      )
    : '{}';
  const wj =
    '{"华东一号仓":80,"华北物流中心":40}';

  return [
    `示例台式机_${Date.now() % 10000}`,
    '4299',
    '台',
    '办公设备',
    '台式整机',
    '商用台式机',
    sj,
    wj,
    'https://picsum.photos/seed/guocai-main400/480/480',
    'https://picsum.photos/seed/guocai-sub1/160/160|https://picsum.photos/seed/guocai-sub2/160/160',
    ''
  ];
}

window.downloadTemplate = function downloadTemplate(kind) {
  try {
    if (kind === 'csv') {
      const Bom = '\uFEFF';
      const vals = templateExampleValues();
      function csvEscapeCell(cell) {
        const s = String(cell ?? '');
        if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }
      const csv = Bom + `${TEMPLATE_HEADER.map(csvEscapeCell).join(',')}\n${vals.map(csvEscapeCell).join(',')}`;
      triggerDownloadBlob(csv, `商品上架导入模板_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
      return;
    }

    if (kind === 'xlsx') {
      if (typeof XLSX === 'undefined') throw new Error('请先联网加载 SheetJS CDN');
      const demo = templateExampleValues();
      const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADER, demo]);

      ws['!cols'] = TEMPLATE_HEADER.map(() => ({ wch: 18 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '导入模板');
      const ws2Data = [
        ['字段说明', ''],
        ['规格JSON', '键须与所选三级类目下固定规格标签完全一致'],
        ['仓库库存JSON', `JSON 对象，键为仓库名（${WAREHOUSES.join('、')}），值为非负整数库存，可多仓。示例：{"华东一号仓":120,"华北物流中心":30}`]
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
      XLSX.utils.book_append_sheet(wb, ws2, '填写说明');

      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownloadBlob(
        out,
        `商品上架导入模板_${Date.now()}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      return;
    }
  } catch (e) {
    showDialog({ title: '导出失败', message: e.message || String(e), type: 'warn' });
  }
};

function triggerDownloadBlob(data, filename, mime) {
  const blob =
    data instanceof Blob
      ? data
      : new Blob(data instanceof ArrayBuffer ? [data] : [data], { type: mime || 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** 原型：写入一批结构完整的待提交商品（含五大仓逐项库存），用于演示列表与预览页 */
function generateMockPendingProducts() {
  const demoRows = [
    {
      name: '【演示】14英寸轻薄办公本 Pro-14',
      price: 5799,
      unit: '台',
      cat1: '办公设备',
      cat2: '台式整机',
      cat3: '笔记本电脑',
      specs: { 处理器: 'i7-1360P', 内存: '16GB', 硬盘: '1TB SSD', 屏幕尺寸: '14英寸' },
      warehouseStocks: { 华东一号仓: 120, 华北物流中心: 64, 华南保税仓: 0, 西南协同仓: 42, 华中中心仓: 88 },
      mainImage: 'https://picsum.photos/seed/guocai-m-lap/480/480'
    },
    {
      name: '【演示】A4彩色激光一体机 CM480',
      price: 3299,
      unit: '台',
      cat1: '办公设备',
      cat2: '打印输出',
      cat3: '多功能一体机',
      specs: { 打印方式: '彩色激光', 扫描方式: '平板+ADF', 传真: '支持', ADF: '50页' },
      warehouseStocks: { 华东一号仓: 35, 华北物流中心: 22, 华南保税仓: 18, 西南协同仓: 9, 华中中心仓: 27 },
      mainImage: 'https://picsum.photos/seed/guocai-m-aio/480/480'
    },
    {
      name: '【演示】80g复印纸 A4 箱装（5包装）',
      price: 128,
      unit: '箱',
      cat1: '办公耗材',
      cat2: '纸张类',
      cat3: '复印打印纸',
      specs: { 克重: '80g', 幅面规格: 'A4', 包装数量: '5包×500张', 颜色: '高白' },
      warehouseStocks: { 华东一号仓: 560, 华北物流中心: 320, 华南保税仓: 210, 西南协同仓: 145, 华中中心仓: 280 },
      mainImage: 'https://picsum.photos/seed/guocai-m-paper/480/480'
    },
    {
      name: '【演示】24口千兆交换机 S24G-Pro',
      price: 899,
      unit: '台',
      cat1: '网络设备',
      cat2: '交换路由',
      cat3: '以太网交换机',
      specs: { 端口数: '24', 交换容量: '56Gbps', PoE供电: '可选', 机架规格: '1U' },
      warehouseStocks: { 华东一号仓: 72, 华北物流中心: 48, 华南保税仓: 30, 西南协同仓: 15, 华中中心仓: 36 },
      mainImage: 'https://picsum.photos/seed/guocai-m-sw/480/480'
    }
  ];

  return demoRows.map(r => {
    const leaf = findLeaf(r.cat1, r.cat2, r.cat3);
    const warehouses = WAREHOUSES.filter(w => Object.prototype.hasOwnProperty.call(r.warehouseStocks, w));
    return {
      id: makeId(),
      name: r.name,
      price: r.price,
      unit: r.unit,
      cat1: r.cat1,
      cat2: r.cat2,
      cat3: r.cat3,
      specLabels: leaf ? [...leaf.specLabels] : [],
      specs: r.specs,
      warehouses,
      warehouseStocks: { ...r.warehouseStocks },
      mainImage: r.mainImage,
      subImages: [
        `https://picsum.photos/seed/guocai-msub-${r.cat3.slice(0, 2)}-1/200/200`,
        `https://picsum.photos/seed/guocai-msub-${r.cat3.slice(0, 2)}-2/200/200`
      ],
      detailImages: [`https://picsum.photos/seed/guocai-mdet-${r.cat3.slice(0, 2)}/960/540`],
      stage: '待提交'
    };
  });
}

window.triggerBulkUpload = function triggerBulkUpload() {
  const batch = generateMockPendingProducts();
  pendingProducts = pendingProducts.concat(batch);
  renderPendingTable();
  document.getElementById('resultSection').classList.add('hidden');
  showDialog({
    title: '已载入演示数据',
    message: `已向待提交列表追加 ${batch.length} 条模拟商品（含各仓库存），可点击「预览」查看详情。\n可随时再次点击「批量上传」继续追加演示数据。`,
    type: 'success',
    confirmText: '好的'
  });
};

async function handleBulkFiles(fileList) {
  const file = fileList && fileList[0];
  if (!file) return;

  const name = file.name.toLowerCase();
  let objs = [];

  try {
    if (name.endsWith('.csv')) {
      const text = await file.text();
      objs = parseCsvObjects(text);
    } else if (name.endsWith('.xlsx')) {
      const buf = await file.arrayBuffer();
      objs = parseXlsxRows(buf);
    } else {
      showDialog({
        title: '格式不支持',
        message: '请上传 CSV 或 xlsx（与模板表头完全一致）。',
        type: 'warn'
      });
      return;
    }

    const errs = [];
    const ok = [];

    objs.forEach((row, idx) => {
      try {
        ok.push(buildProductFromImportRow(row, idx));
      } catch (e) {
        errs.push(e.message);
      }
    });

    if (!ok.length) {
      showDialog({
        title: '导入失败',
        message: errs.slice(0, 8).join('\n') + (errs.length > 8 ? '\n……' : ''),
        type: 'error'
      });
      return;
    }

    pendingProducts = pendingProducts.concat(ok);
    renderPendingTable();

    const msgLines = [`成功导入 ${ok.length} 条。`];
    if (errs.length) msgLines.push(`跳过 ${errs.length} 条：`, errs.slice(0, 5).join('\n'));
    showDialog({ title: '导入完成', message: msgLines.join('\n'), type: errs.length ? 'warn' : 'success' });

    document.getElementById('resultSection').classList.add('hidden');
  } catch (e2) {
    showDialog({
      title: '解析出错',
      message: e2.message || String(e2),
      type: 'error'
    });
  }
}

/* ---------- AI 演示：不耦合提交 ---------- */
window.runAiComplianceDemo = function runAiComplianceDemo() {
  if (!pendingProducts.length) {
    showDialog({
      title: '提示',
      message: '暂无待提交商品，请先添加或批量上传。',
      type: 'warn'
    });
    return;
  }

  pendingProducts.forEach(p => {
    p.stage = '合规已检查(演示)';
  });
  renderPendingTable();
  showDialog({
    title: '已完成',
    message: '（原型演示）已对全部待提交商品标记为「合规已检查」。此操作不影响「提交审核」。',
    confirmText: '知道了'
  });
};

window.submitAudit = window.runAiComplianceDemo;

const PRODUCT_UPLOAD_PENDING_DRAFT_KEY = 'PRODUCT_UPLOAD_PENDING_DRAFT';

window.saveAsDraft = function saveAsDraft() {
  if (!pendingProducts.length) {
    showDialog({ title: '提示', message: '暂无待提交商品，请先添加或批量上传。', type: 'warn' });
    return;
  }

  const n = pendingProducts.length;

  showDialog({
    title: '存为草稿',
    message: `将当前 ${n} 件商品存为草稿？不会创建平台审核任务，列表仍在本页保留，您可继续编辑或随后提交审核（原型示意图示）。`,
    cancelText: '取消',
    confirmText: '确认保存',
    onConfirm: () => {
      let payload;
      try {
        payload = JSON.stringify({
          savedAt: new Date().toISOString(),
          products: JSON.parse(JSON.stringify(pendingProducts))
        });
      } catch {
        showDialog({
          title: '保存失败',
          message: '草稿数据序列化出错（原型页异常）。',
          type: 'error'
        });
        return;
      }

      try {
        sessionStorage.setItem(PRODUCT_UPLOAD_PENDING_DRAFT_KEY, payload);
      } catch {
        showDialog({
          title: '保存失败',
          message: '无法写入浏览器存储（可能被禁用或已满）。',
          type: 'error'
        });
        return;
      }

      showDialog({
        title: '已存为草稿',
        message: `已为 ${n} 件商品保存草稿（原型）。可随时继续在本页修改，或点击「提交审核」。`,
        type: 'success',
        confirmText: '好的'
      });
    }
  });
};

window.submitReview = function submitReview() {
  if (!pendingProducts.length) {
    showDialog({ title: '提示', message: '暂无待提交商品。', type: 'warn' });
    return;
  }

  const n = pendingProducts.length;

  showDialog({
    title: '提交审核',
    message: `确认将当前 ${n} 件商品提交平台审核吗？`,
    cancelText: '取消',
    confirmText: '确认提交',
    onConfirm: () => {
      showDialog({
        title: '提交成功',
        message: `已为 ${n} 件商品创建审核申请（原型）。`,
        type: 'success'
      });
      pendingProducts = [];
      renderPendingTable();
      document.getElementById('resultSection').classList.add('hidden');
    }
  });
};

const IMAGE_PREVIEW_IDS = {
  apmMainImg: 'apmMainImgPreview',
  apmSubImg: 'apmSubImgPreview',
  apmDetailImg: 'apmDetailImgPreview'
};

function revokeBlobUrlsFromContainer(container) {
  if (!container) return;
  container.querySelectorAll('img[src^="blob:"]').forEach(img => {
    try {
      URL.revokeObjectURL(img.src);
    } catch {
      /* ignore */
    }
  });
}

function clearAllImagePreviews() {
  Object.values(IMAGE_PREVIEW_IDS).forEach(pid => {
    const el = document.getElementById(pid);
    if (!el) return;
    revokeBlobUrlsFromContainer(el);
    el.innerHTML = '';
  });
}

function refreshImagePreviews(inputId) {
  const input = document.getElementById(inputId);
  const wrapId = IMAGE_PREVIEW_IDS[inputId];
  if (!input || !wrapId) return;
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  revokeBlobUrlsFromContainer(wrap);
  wrap.innerHTML = '';
  const raw = input.files ? [...input.files] : [];
  if (!raw.length) return;
  const list = inputId === 'apmMainImg' ? raw.slice(0, 1) : raw;
  list.forEach(file => {
    if (!file || !/^image\//.test(file.type)) return;
    const url = URL.createObjectURL(file);
    const cell = document.createElement('div');
    cell.className = 'img-thumb';
    cell.title = file.name ? String(file.name) : '';
    const im = document.createElement('img');
    im.alt = '';
    im.src = url;
    cell.appendChild(im);
    wrap.appendChild(cell);
  });
}

window.toggleTemplateMenu = function toggleTemplateMenu(ev) {
  if (ev) ev.stopPropagation();
  const menu = document.getElementById('templateDownloadMenu');
  const btn = document.getElementById('templateDownloadBtn');
  if (!menu || !btn) return;
  menu.classList.toggle('show');
  btn.setAttribute('aria-expanded', menu.classList.contains('show') ? 'true' : 'false');
};

window.closeTemplateMenu = function closeTemplateMenu() {
  const menu = document.getElementById('templateDownloadMenu');
  const btn = document.getElementById('templateDownloadBtn');
  if (menu) menu.classList.remove('show');
  if (btn) btn.setAttribute('aria-expanded', 'false');
};

/* ---------- 添加商品弹窗 ---------- */

window.closeAddProductModal = function closeAddProductModal() {
  document.getElementById('addProductOverlay').classList.remove('show');
};

window.openAddProductModal = function openAddProductModal() {
  document.getElementById('addProductOverlay').classList.add('show');
  resetAddForm();
};

window.addFormCatChange = function addFormCatChange(which) {
  if (which === 1) onCat1();
  else if (which === 2) onCat2();
  else onCat3();
};

function resetAddForm() {
  document.getElementById('apmName').value = '';
  document.getElementById('apmPrice').value = '';

  const unitSel = document.getElementById('apmUnit');
  unitSel.innerHTML = UNITS.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('');

  const c1 = document.getElementById('apmCat1');
  const c2 = document.getElementById('apmCat2');
  const c3 = document.getElementById('apmCat3');
  [c2, c3].forEach(el => {
    el.innerHTML = '<option value="">请选择</option>';
  });
  c1.innerHTML = '<option value="">请选择</option>';
  PLATFORM_CATEGORIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    c1.appendChild(opt);
  });

  const whWrap = document.getElementById('apmWarehouseWrap');
  if (whWrap) {
    whWrap.innerHTML = WAREHOUSES.map(w => `
      <div class="apm-wm-row">
        <label class="apm-wm-item">
          <input type="checkbox" class="apm-wm-cb" data-wm value="${escapeHtml(w)}" />
          <span>${escapeHtml(w)}</span>
        </label>
        <input type="number" class="add-form-input apm-wm-stock-input" min="0" step="1" placeholder="勾选后填写该仓库存（整数）" data-wstock="${escapeHtml(
          w
        )}" disabled />
      </div>`).join('');
  }

  document.querySelectorAll('input[type=checkbox][data-wm]').forEach(cb => {
    cb.checked = false;
  });

  clearAllImagePreviews();
  ['apmMainImg', 'apmSubImg', 'apmDetailImg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderSpecFields(null);
}

function onCat1() {
  const v = document.getElementById('apmCat1').value;
  const c2 = document.getElementById('apmCat2');
  const c3 = document.getElementById('apmCat3');
  c2.innerHTML = '<option value="">请选择</option>';
  c3.innerHTML = '<option value="">请选择</option>';
  renderSpecFields(null);
  if (!v) return;
  const n1 = PLATFORM_CATEGORIES.find(c => c.name === v);
  n1.children.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    c2.appendChild(opt);
  });
}

function onCat2() {
  const v = document.getElementById('apmCat1').value;
  const v2 = document.getElementById('apmCat2').value;
  const c3 = document.getElementById('apmCat3');
  c3.innerHTML = '<option value="">请选择</option>';
  renderSpecFields(null);
  if (!v || !v2) return;
  const n1 = PLATFORM_CATEGORIES.find(c => c.name === v);
  const n2 = n1.children.find(c => c.name === v2);
  n2.children.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    c3.appendChild(opt);
  });
}

function onCat3() {
  const v = document.getElementById('apmCat1').value;
  const v2 = document.getElementById('apmCat2').value;
  const v3 = document.getElementById('apmCat3').value;
  if (!v || !v2 || !v3) return renderSpecFields(null);
  const leaf = findLeaf(v, v2, v3);
  if (!leaf) return renderSpecFields(null);
  renderSpecFields(leaf);
}

function renderSpecFields(leaf) {
  const wrap = document.getElementById('apmSpecArea');
  if (!leaf || !leaf.specLabels.length) {
    wrap.innerHTML = '<p class="text-sm text-slate-400">请先选择三级类目，以下将展示该类目固定规格字段。</p>';
    return;
  }
  wrap.innerHTML = leaf.specLabels
    .map(
      lbl => `
      <label class="add-form-field">
        <span class="add-form-label">${escapeHtml(lbl)} <span class="text-red-500">*</span></span>
        <input type="text" class="add-form-input" data-sp-label="${escapeHtml(lbl)}" />
      </label>`
    )
    .join('');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error('图片读取失败'));
    fr.readAsDataURL(file);
  });
}

async function readMulti(files) {
  const list = files ? [...files] : [];
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    /* eslint-disable no-await-in-loop */
    out.push(await readFileAsDataUrl(list[i]));
  }
  return out;
}

window.confirmAddProduct = async function confirmAddProduct() {
  try {
    const name = document.getElementById('apmName').value.trim();
    const priceRaw = sanitizePrice(document.getElementById('apmPrice').value);
    const unit = document.getElementById('apmUnit').value;
    const c1 = document.getElementById('apmCat1').value;
    const c2 = document.getElementById('apmCat2').value;
    const c3 = document.getElementById('apmCat3').value;

    const bad = msg => showDialog({ title: '请完善表单', message: msg, confirmText: '确定' });

    if (!name) return bad('请填写商品名称');
    if (Number.isNaN(priceRaw)) return bad('请填写合法的人民币价格（元）');
    if (!unit) return bad('请选择单位');
    if (!c1 || !c2 || !c3) return bad('请选择完整三级类目');
    const leaf = findLeaf(c1, c2, c3);
    if (!leaf) return bad('类目无效');

    const specs = {};
    const inputs = document.querySelectorAll('#apmSpecArea [data-sp-label]');
    leaf.specLabels.forEach(lbl => {
      const inp = [...inputs].find(el => el.getAttribute('data-sp-label') === lbl);
      specs[lbl] = inp ? inp.value.trim() : '';
    });

    const vSpecs = validateSpecObject(leaf, specs);
    if (!vSpecs.ok) return bad(vSpecs.msg);

    const warehouseStocks = {};
    let anyWh = false;
    for (const row of document.querySelectorAll('.apm-wm-row')) {
      const cb = row.querySelector('input[type="checkbox"][data-wm]');
      if (!cb || !cb.checked) continue;
      anyWh = true;
      const wh = cb.value;
      const inp = row.querySelector('input[data-wstock]');
      const q = inp && inp.value !== '' ? sanitizeInt(String(inp.value)) : NaN;
      if (Number.isNaN(q)) return bad(`请为「${wh}」填写非负整数库存`);
      warehouseStocks[wh] = q;
    }
    if (!anyWh || !Object.keys(warehouseStocks).length) return bad('请勾选至少一个仓库，并为所选仓库逐项填写库存');

    const warehouses = WAREHOUSES.filter(w => Object.prototype.hasOwnProperty.call(warehouseStocks, w));

    const mainFile = document.getElementById('apmMainImg').files && document.getElementById('apmMainImg').files[0];
    if (!mainFile) return bad('商品主图为必填');

    const mainImage = await readFileAsDataUrl(mainFile);
    const subImages = await readMulti(document.getElementById('apmSubImg').files);
    const detailImages = await readMulti(document.getElementById('apmDetailImg').files);

    pendingProducts.push({
      id: makeId(),
      name,
      price: priceRaw,
      unit,
      cat1: c1,
      cat2: c2,
      cat3: c3,
      specLabels: [...leaf.specLabels],
      specs,
      warehouses,
      warehouseStocks,
      mainImage,
      subImages,
      detailImages,
      stage: '待提交'
    });

    renderPendingTable();
    closeAddProductModal();

    document.getElementById('resultSection').classList.add('hidden');

    showDialog({ title: '已添加', message: '商品已进入待提交列表，可预览或批量提交审核。', confirmText: '好的' });
  } catch (e) {
    showDialog({ title: '添加失败', message: e.message || String(e), type: 'error' });
  }
};

function initSourceBanner() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  const id = params.get('id');
  if (!source) return;
  const banner = document.getElementById('sourceBanner');
  const text = document.getElementById('sourceBannerText');
  banner.classList.remove('hidden');

  if (source === 'rectify' && id) {
    text.textContent = `系统已关联待整改条目 ${id}，请在上传页补充信息后重新提交审核（原型占位）。`;
  } else if (id) {
    text.textContent = `正在关联商品条目 ${id}，可在此处补充信息后提交审核（原型占位）。`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSourceBanner();

  const confirmBtn = document.getElementById('globalDialogConfirmBtn');
  const cancelBtn = document.getElementById('globalDialogCancelBtn');

  confirmBtn.onclick = () => closeGlobalDialogWhich('confirm');
  cancelBtn.onclick = () => closeGlobalDialogWhich('cancel');

  document.getElementById('globalDialogOverlay').addEventListener('click', event => {
    if (event.target.id === 'globalDialogOverlay') closeGlobalDialogWhich('cancel');
  });

  const addOv = document.getElementById('addProductOverlay');
  if (addOv) {
    addOv.addEventListener('change', ev => {
      const t = ev.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (t.type !== 'checkbox' || !t.hasAttribute('data-wm')) return;
      const row = t.closest('.apm-wm-row');
      const inp = row && row.querySelector('input[data-wstock]');
      if (!(inp instanceof HTMLInputElement)) return;
      inp.disabled = !t.checked;
      if (!t.checked) inp.value = '';
    });
  }

  const aiBtn = document.getElementById('aiCheckBtn');
  if (aiBtn) {
    aiBtn.onclick = () => runAiComplianceDemo();
  }

  Object.keys(IMAGE_PREVIEW_IDS).forEach(inpId => {
    const inp = document.getElementById(inpId);
    if (inp) inp.addEventListener('change', () => refreshImagePreviews(inpId));
  });

  document.addEventListener('click', ev => {
    if (!ev.target.closest('.template-dd-wrap')) closeTemplateMenu();
  });

  renderPendingTable();
  document.getElementById('resultSection').classList.add('hidden');
});
