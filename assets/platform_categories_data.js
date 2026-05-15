/* 与 pages/product/product_upload_app.js 中 PLATFORM_CATEGORIES 保持一致，供筛选栏三级联动复用 */
'use strict';

/** @type {Array<{ name: string, children: Array<{ name: string, children: Array<{ name: string }> }> }>} */
window.PLATFORM_CATEGORIES = [
  {
    name: '办公设备',
    children: [
      {
        name: '台式整机',
        children: [{ name: '商用台式机' }, { name: '笔记本电脑' }]
      },
      {
        name: '打印输出',
        children: [{ name: '激光打印机' }, { name: '多功能一体机' }]
      },
      {
        name: '外设配件',
        children: [{ name: '键鼠套装' }]
      }
    ]
  },
  {
    name: '办公耗材',
    children: [
      {
        name: '纸张类',
        children: [{ name: '复印打印纸' }]
      },
      {
        name: '笔类文具',
        children: [{ name: '中性笔' }]
      }
    ]
  },
  {
    name: '网络设备',
    children: [
      {
        name: '交换路由',
        children: [{ name: '以太网交换机' }]
      }
    ]
  },
  {
    name: '办公家具',
    children: [
      {
        name: '人体工学座椅',
        children: [{ name: '网布办公椅' }]
      }
    ]
  }
];

/**
 * @param {{ cat1: string, cat2: string, cat3: string }} ids 三个 select 的 id
 * @param {() => void} [onChange] 任一级别变更后回调（如刷新列表）
 */
window.bindThreeLevelCategoryFilter = function bindThreeLevelCategoryFilter(ids, onChange) {
  const tree = window.PLATFORM_CATEGORIES;
  const el1 = document.getElementById(ids.cat1);
  const el2 = document.getElementById(ids.cat2);
  const el3 = document.getElementById(ids.cat3);
  if (!el1 || !el2 || !el3) return;

  const L = {
    cat1: '全部一级类目',
    cat2: '全部二级类目',
    cat3: '全部三级类目'
  };

  function addOpt(sel, val, label) {
    const o = document.createElement('option');
    o.value = val;
    o.textContent = label;
    sel.appendChild(o);
  }

  function rebuildCat1() {
    el1.innerHTML = '';
    addOpt(el1, '', L.cat1);
    tree.forEach(n => addOpt(el1, n.name, n.name));
  }

  function rebuildCat2() {
    el2.innerHTML = '';
    addOpt(el2, '', L.cat2);
    const v1 = el1.value;
    if (!v1) return;
    const n1 = tree.find(n => n.name === v1);
    if (!n1 || !n1.children) return;
    n1.children.forEach(n2 => addOpt(el2, n2.name, n2.name));
  }

  function rebuildCat3() {
    el3.innerHTML = '';
    addOpt(el3, '', L.cat3);
    const v1 = el1.value;
    const v2 = el2.value;
    if (!v1 || !v2) return;
    const n1 = tree.find(n => n.name === v1);
    if (!n1) return;
    const n2 = n1.children.find(c => c.name === v2);
    if (!n2 || !n2.children) return;
    n2.children.forEach(n3 => addOpt(el3, n3.name, n3.name));
  }

  function fire() {
    if (typeof onChange === 'function') onChange();
  }

  rebuildCat1();
  rebuildCat2();
  rebuildCat3();

  el1.onchange = () => {
    el2.value = '';
    el3.value = '';
    rebuildCat2();
    rebuildCat3();
    fire();
  };
  el2.onchange = () => {
    el3.value = '';
    rebuildCat3();
    fire();
  };
  el3.onchange = fire;
};

/**
 * @param {{ cat1: string, cat2: string, cat3: string }} ids
 */
window.resetThreeLevelCategoryFilter = function resetThreeLevelCategoryFilter(ids) {
  const el1 = document.getElementById(ids.cat1);
  if (!el1) return;
  el1.value = '';
  el1.dispatchEvent(new Event('change', { bubbles: true }));
};
