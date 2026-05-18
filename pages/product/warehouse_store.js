/**
 * 供应商仓库管理 · 原型数据（sessionStorage）
 * 基于平台五仓名称；库存与「我的商品」演示数据同源初始化，页面间不写回同步。
 */
'use strict';

window.WH_STORAGE_KEY = 'SUPPLIER_WAREHOUSE_V1';

/** @type {string[]} */
window.DEFAULT_PLATFORM_WAREHOUSES = ['华东一号仓', '华北物流中心', '华南保税仓', '西南协同仓', '华中中心仓'];

/** 演示地址（可按仓编辑） */
const DEFAULT_WH_ADDRESS = {
  华东一号仓: '上海市浦东新区保税区Demo路188号',
  华北物流中心: '天津市滨海新区物流园Demo大街66号',
  华南保税仓: '广州市南沙区保税港区Demo大道9号',
  西南协同仓: '重庆市渝北区空港工业园Demo街108号',
  华中中心仓: '武汉市东西湖区分拣中心Demo路55号'
};

/** 商品主数据（库内列表 / 计数） */
window.WAREHOUSE_PRODUCT_CATALOG = [
  {
    id: 'SPU-202604-001',
    sku: 'SKU-LX-M550-001',
    name: '联想启天M550商用台式机',
    category: '办公设备',
    catPath: ['办公设备', '台式整机', '商用台式机']
  },
  {
    id: 'SPU-202604-002',
    sku: 'SKU-DELY-A4-8P',
    name: '得力A4复印纸 70g 8包/箱',
    category: '办公耗材',
    catPath: ['办公耗材', '纸张类', '复印打印纸']
  },
  {
    id: 'SPU-202604-003',
    sku: 'SKU-H3C-S1850-24P',
    name: '华三千兆交换机 S1850-24P',
    category: '网络设备',
    catPath: ['网络设备', '交换路由', '以太网交换机']
  },
  {
    id: 'SPU-202604-004',
    sku: 'SKU-AUR-A7-CHAIR',
    name: '震旦办公转椅 A7-人体工学版',
    category: '办公家具',
    catPath: ['办公家具', '人体工学座椅', '网布办公椅']
  },
  {
    id: 'SPU-202604-005',
    sku: 'SKU-HP-428FDW',
    name: '惠普LaserJet Pro MFP 428fdw',
    category: '办公设备',
    catPath: ['办公设备', '打印输出', '多功能一体机']
  },
  {
    id: 'SPU-202604-006',
    sku: 'SKU-LOG-K580',
    name: '罗技K580无线键鼠套装',
    category: '办公设备',
    catPath: ['办公设备', '外设配件', '键鼠套装']
  },
  {
    id: 'DRAFT-202605-001',
    sku: 'SKU-DRAFT-LJP-PRO',
    name: '佳能激光打印机（信息待完善）',
    category: '办公设备',
    catPath: ['办公设备', '打印输出', '激光打印机']
  },
  {
    id: 'DRAFT-202605-002',
    sku: 'SKU-DRAFT-SCAN-01',
    name: '高速扫描仪（草稿）',
    category: '办公设备',
    catPath: ['办公设备', '打印输出', '多功能一体机']
  }
];

/** productId -> { 仓名: 数量 }，与我的商品 PREVIEW_BY_ID 初始库存对齐 */
const SEED_STOCK_BY_PRODUCT = {
  'SPU-202604-001': { 华东一号仓: 40, 华北物流中心: 28, 华南保税仓: 0, 西南协同仓: 18, 华中中心仓: 32 },
  'SPU-202604-002': { 华东一号仓: 520, 华北物流中心: 310, 华南保税仓: 180, 西南协同仓: 95, 华中中心仓: 240 },
  'SPU-202604-003': { 华东一号仓: 66, 华北物流中心: 44, 华南保税仓: 22, 西南协同仓: 12, 华中中心仓: 30 },
  'SPU-202604-004': { 华东一号仓: 0, 华北物流中心: 48, 华南保税仓: 0, 西南协同仓: 12, 华中中心仓: 20 },
  'SPU-202604-005': { 华东一号仓: 25, 华北物流中心: 18, 华南保税仓: 10, 西南协同仓: 6, 华中中心仓: 14 },
  'SPU-202604-006': { 华东一号仓: 150, 华北物流中心: 88, 华南保税仓: 60, 西南协同仓: 40, 华中中心仓: 72 },
  'DRAFT-202605-001': { 华东一号仓: 0, 华北物流中心: 0, 华南保税仓: 0, 西南协同仓: 0, 华中中心仓: 0 },
  'DRAFT-202605-002': { 华东一号仓: 0, 华北物流中心: 0, 华南保税仓: 0, 西南协同仓: 0, 华中中心仓: 0 }
};

function buildInitialInventory() {
  /** @type {Record<string, Record<string, number>>} */
  const inv = {};
  window.DEFAULT_PLATFORM_WAREHOUSES.forEach(w => {
    inv[w] = {};
  });
  window.WAREHOUSE_PRODUCT_CATALOG.forEach(p => {
    const row = SEED_STOCK_BY_PRODUCT[p.id];
    if (!row) return;
    Object.keys(row).forEach(w => {
      if (!inv[w]) inv[w] = {};
      inv[w][p.id] = row[w];
    });
  });
  return inv;
}

function initialWarehousesFromDefaults() {
  return window.DEFAULT_PLATFORM_WAREHOUSES.map(id => ({
    id,
    name: id,
    address: DEFAULT_WH_ADDRESS[id] || '（请完善仓库地址）',
    enabled: true,
    deliveryDistrictCodes: []
  }));
}

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * @returns {{ warehouses: Array<{ id:string, name:string, address:string, enabled:boolean }>, inventory: Record<string, Record<string, number>> }}
 */
window.loadWarehouseState = function loadWarehouseState() {
  try {
    const raw = sessionStorage.getItem(window.WH_STORAGE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && Array.isArray(o.warehouses) && o.inventory && typeof o.inventory === 'object') {
        o.warehouses.forEach(w => {
          if (!Array.isArray(w.deliveryDistrictCodes)) w.deliveryDistrictCodes = [];
        });
        return o;
      }
    }
  } catch {
    /* ignore */
  }
  return {
    warehouses: initialWarehousesFromDefaults(),
    inventory: buildInitialInventory()
  };
};

window.saveWarehouseState = function saveWarehouseState(state) {
  sessionStorage.setItem(window.WH_STORAGE_KEY, JSON.stringify(state));
};

window.ensureWarehouseInventorySlot = function ensureWarehouseInventorySlot(state, warehouseId) {
  if (!state.inventory[warehouseId]) state.inventory[warehouseId] = {};
};

/** SKU 数：本仓库存数量 > 0 的 SKU 个数 */
window.countActiveSkusInWarehouse = function countActiveSkusInWarehouse(state, warehouseId) {
  const m = state.inventory[warehouseId];
  if (!m) return 0;
  return Object.keys(m).filter(pid => Number(m[pid]) > 0).length;
};

window.getWarehouseById = function getWarehouseById(state, id) {
  return state.warehouses.find(w => w.id === id) || null;
};

window.getQty = function getQty(state, warehouseId, productId) {
  const q = state.inventory[warehouseId] && state.inventory[warehouseId][productId];
  return Number.isFinite(Number(q)) ? Number(q) : 0;
};

window.setQty = function setQty(state, warehouseId, productId, qty) {
  window.ensureWarehouseInventorySlot(state, warehouseId);
  const n = Math.max(0, Math.floor(Number(qty) || 0));
  state.inventory[warehouseId][productId] = n;
};

/**
 * @param {string} fromWh
 * @param {string} toWh
 * @param {Record<string, number>} transfers productId -> qty
 */
window.applyBatchTransfer = function applyBatchTransfer(state, fromWh, toWh, transfers) {
  window.ensureWarehouseInventorySlot(state, fromWh);
  window.ensureWarehouseInventorySlot(state, toWh);
  Object.keys(transfers).forEach(pid => {
    let n = Math.max(0, Math.floor(Number(transfers[pid]) || 0));
    const cur = window.getQty(state, fromWh, pid);
    if (n > cur) n = cur;
    if (n <= 0) return;
    state.inventory[fromWh][pid] = cur - n;
    const toBefore = window.getQty(state, toWh, pid);
    state.inventory[toWh][pid] = toBefore + n;
  });
};
