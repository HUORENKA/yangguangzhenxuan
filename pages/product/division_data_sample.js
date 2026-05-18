/**
 * 行政区划演示数据（省-市-区县三级）
 * 原型用精简集；正式环境可替换为全国数据源。
 */
'use strict';

/** @type {Array<{ code: string, name: string, children: Array<{ code: string, name: string, children: Array<{ code: string, name: string }> }> }>} */
window.REGION_TREE_SAMPLE = [
  {
    code: '310000',
    name: '上海市',
    children: [
      {
        code: '310100',
        name: '市辖区',
        children: [
          { code: '310115', name: '浦东新区' },
          { code: '310104', name: '徐汇区' },
          { code: '310105', name: '长宁区' }
        ]
      }
    ]
  },
  {
    code: '110000',
    name: '北京市',
    children: [
      {
        code: '110100',
        name: '市辖区',
        children: [
          { code: '110101', name: '东城区' },
          { code: '110105', name: '朝阳区' }
        ]
      }
    ]
  },
  {
    code: '330000',
    name: '浙江省',
    children: [
      {
        code: '330100',
        name: '杭州市',
        children: [
          { code: '330106', name: '西湖区' },
          { code: '330108', name: '滨江区' }
        ]
      },
      {
        code: '330200',
        name: '宁波市',
        children: [{ code: '330212', name: '鄞州区' }]
      }
    ]
  },
  {
    code: '320000',
    name: '江苏省',
    children: [
      {
        code: '320100',
        name: '南京市',
        children: [
          { code: '320102', name: '玄武区' },
          { code: '320105', name: '建邺区' }
        ]
      }
    ]
  },
  {
    code: '440000',
    name: '广东省',
    children: [
      {
        code: '440100',
        name: '广州市',
        children: [
          { code: '440105', name: '海珠区' },
          { code: '440106', name: '天河区' }
        ]
      },
      {
        code: '440300',
        name: '深圳市',
        children: [{ code: '440305', name: '南山区' }]
      }
    ]
  }
];

(function buildRegionIndex() {
  /** @type {Record<string, string>} */
  const cityToProvince = {};
  /** @type {Record<string, string>} */
  const districtToCity = {};
  /** @type {Record<string, string>} */
  const districtToProvince = {};
  /** @type {Record<string, string>} */
  const districtLabel = {};

  window.REGION_TREE_SAMPLE.forEach(p => {
    (p.children || []).forEach(c => {
      cityToProvince[c.code] = p.code;
      (c.children || []).forEach(d => {
        districtToCity[d.code] = c.code;
        districtToProvince[d.code] = p.code;
        districtLabel[d.code] = `${p.name} · ${c.name} · ${d.name}`;
      });
    });
  });

  window.REGION_INDEX = {
    provinces: window.REGION_TREE_SAMPLE,
    cityToProvince,
    districtToCity,
    districtToProvince,
    districtLabel
  };
})();

/** @param {string} code */
window.formatDistrictLabel = function formatDistrictLabel(code) {
  return window.REGION_INDEX.districtLabel[code] || code;
};
