/* 标签管理 · 共享数据与工具 */
window.TagAdmin = (function () {
  'use strict';

  var MANUAL_BLOCKED = ['系统直取', '系统映射', '系统计算', '规则汇总', '行为计算'];
  var METHODS = [
    '系统直取', '系统映射', '系统计算', '行为计算', '规则引擎',
    'AI 抽取', 'AI+规则', 'AI 抽取+规则校验', 'AI+OCR', 'AI 识别+人工核验', '规则汇总'
  ];
  var VALUE_TYPES = ['是/否', '枚举', '文本', '数值', '高/中/低', '通过/预警/驳回'];
  var FREQUENCIES = ['商品提交时', '商品变更时', '定时任务', '手动触发'];

  function node(id, name, level, children, leaf) {
    return { id: id, name: name, level: level, children: children || [], leaf: !!leaf };
  }

  var tagLibraries = [
    { id: 'product', name: '商品标签', code: 'product', desc: 'SKU 维度标签，支撑审核、搜索与推荐' },
    { id: 'supplier', name: '供应商标签', code: 'supplier', desc: '供应商维度标签，支撑资质校验与画像' }
  ];

  var tagTrees = {
    product: [
      node('p-audit', '商品信息审核', 1, [
        node('p-audit-cq', '内容质量', 2, [
          node('p-title', '标题规范', 3, [], true),
          node('p-intro', '简介充分', 3, [], true),
          node('p-params', '参数完整', 3, [], true),
          node('p-mainimg', '主图合格', 3, [], true),
          node('p-detailimg', '详情图充足', 3, [], true),
          node('p-consist', '图文一致', 3, [], true),
          node('p-nowm', '无水印导流', 3, [], true),
          node('p-nosens', '无敏感违规', 3, [], true),
          node('p-complete', '资料完整度', 3, [], true)
        ]),
        node('p-audit-cat', '类目与品目', 2, [
          node('p-cat-accurate', '类目归属准确', 3, [], true),
          node('p-gov-map', '政采品目可映射', 3, [], true),
          node('p-not-banned', '非禁售品类', 3, [], true)
        ])
      ]),
      node('p-spec', '类目与规格', 1, [
        node('p-cat', '物资大类', 2, [
          node('p-cat-l1', '一级类目', 3, [], true),
          node('p-cat-l2', '二级类目', 3, [], true),
          node('p-cat-l3', '三级类目', 3, [], true)
        ]),
        node('p-spec-info', '规格信息', 2, [
          node('p-brand', '品牌', 3, [], true),
          node('p-model', '规格型号', 3, [], true),
          node('p-pack', '包装规格', 3, [], true)
        ])
      ]),
      node('p-scene', '场景与需求', 1, [
        node('p-scene-use', '适用场景', 2, [], true),
        node('p-scene-obj', '适用对象', 2, [], true),
        node('p-scene-fp', '功能卖点', 2, [], true),
        node('p-scene-buy', '采购属性', 2, [], true)
      ]),
      node('p-compliance', '合规与信任', 1, [
        node('p-cert', '强制认证', 2, [
          node('p-3c', '3C认证', 3, [], true),
          node('p-prod-lic', '生产许可证', 3, [], true)
        ]),
        node('p-quality', '质量证明', 2, [node('p-qc', '质检报告', 3, [], true)]),
        node('p-trade', '交易特征', 2, [
          node('p-hot', '热销商品', 3, [], true),
          node('p-new', '新品上架', 3, [], true)
        ])
      ])
    ],
    supplier: [
      node('s-biz', '经营属性', 1, [
        node('s-main-cat', '主营类目', 2, [], true),
        node('s-region', '服务区域', 2, [], true)
      ]),
      node('s-qual', '资质合规', 1, [
        node('s-brand-auth', '品牌授权', 2, [], true),
        node('s-industry-lic', '行业许可', 2, [], true)
      ]),
      node('s-fulfill', '履约能力', 1, [
        node('s-ship', '发货时效等级', 2, [], true),
        node('s-after', '售后响应等级', 2, [], true)
      ])
    ]
  };

  var tagMeta = {
    'p-title': { code: 'CQ_TITLE', valueType: '是/否', method: 'AI+规则', source: '标题', note: '标题非空、≤80字、无外链与敏感词，且与类目一致。', ruleConfig: '硬性规则 + 标题信息完整性 AI 判定' },
    'p-intro': { code: 'CQ_INTRO', valueType: '是/否', method: 'AI+规则', source: 'spjj/spms', note: '简介与描述合并有效文字不少于 30 字。', ruleConfig: '字数≥30；非模板化文案' },
    'p-params': { code: 'CQ_PARAMS', valueType: '是/否', method: '规则引擎', source: 'ggcs', note: '按三级类目必填参数清单逐项校验。', ruleConfig: '必填参数非空；占位符无效' },
    'p-mainimg': { code: 'CQ_MAINIMG', valueType: '是/否', method: 'AI+规则', source: '主图', note: '主图可访问、≥800px、主体为商品。', ruleConfig: '尺寸规则 + AI 有效商品图判定' },
    'p-detailimg': { code: 'CQ_DETAILIMG', valueType: '是/否', method: 'AI+规则', source: '详情图', note: '有效详情图不少于 3 张。', ruleConfig: '数量≥3；非重复图' },
    'p-consist': { code: 'CQ_CONSIST', valueType: '是/否', method: 'AI+规则', source: '图文', note: '品牌、型号、核心规格前后一致。', ruleConfig: '多字段交叉比对' },
    'p-nowm': { code: 'CQ_NOWM', valueType: '是/否', method: 'AI+规则', source: '图文', note: '无外链、水印、导流文案。', ruleConfig: 'URL/水印/导流词检测' },
    'p-nosens': { code: 'CQ_NOSENS', valueType: '是/否', method: 'AI+规则', source: '图文', note: '无敏感词与绝对化用语。', ruleConfig: '敏感词库 + 内容安全' },
    'p-complete': { code: 'CQ_COMPLETE', valueType: '高/中/低', method: '规则汇总', source: '综合', note: '汇总前 8 项内容质量检查结果。', ruleConfig: '8项均为是→高；1-2项否→中；否则→低' },
    'p-cat-accurate': { code: 'AUDIT_CAT', valueType: '是/否', method: 'AI+规则', source: '标题+类目+主图', note: '所选类目与商品实际品类一致。', ruleConfig: 'AI 品类识别 vs 所选类目' },
    'p-gov-map': { code: 'AUDIT_GOV', valueType: '是/否', method: '规则引擎', source: '品目映射表', note: '可映射到有效政采品目编码。', ruleConfig: '品目映射表匹配' },
    'p-not-banned': { code: 'AUDIT_BAN', valueType: '是/否', method: '规则引擎', source: '禁售清单', note: '不属于平台禁售品类。', ruleConfig: '禁售清单匹配' },
    'p-cat-l1': { code: 'CAT_L1', valueType: '文本', method: '系统映射', source: '中资分类表', note: '从中资商品分类同步。', ruleConfig: '中资分类表映射' },
    'p-cat-l2': { code: 'CAT_L2', valueType: '文本', method: '系统映射', source: '中资分类表', note: '从中资商品分类同步。', ruleConfig: '中资分类表映射' },
    'p-cat-l3': { code: 'CAT_L3', valueType: '文本', method: '系统映射', source: '中资分类表', note: '从中资商品分类同步。', ruleConfig: '中资分类表映射' },
    'p-brand': { code: 'SPEC_BRAND', valueType: '文本', method: '系统直取', source: 'pp', note: '从商品字段 pp 直取并归一化。', ruleConfig: '字段 pp → 品牌标准库归一化' },
    'p-model': { code: 'SPEC_MODEL', valueType: '文本', method: '系统直取', source: 'ggxh', note: '从商品字段 ggxh 直取。', ruleConfig: '字段 ggxh 直取' },
    'p-pack': { code: 'SPEC_PACK', valueType: '文本', method: '系统映射', source: '包装规格', note: '从商品包装规格字段直取。', ruleConfig: '包装规格字段直取' },
    'p-scene-use': {
      code: 'SCENE_USE', valueType: '枚举', method: 'AI 抽取+规则校验', source: '标题+简介+参数',
      note: '从商品图文语义匹配适用场景枚举，1～5 条。',
      ruleConfig: '语义匹配场景枚举；confidence≥0.6；evidence 非空；1～5 条',
      enums: [
        { code: 'SC_DAILY', name: '日常办公', sort: 1 },
        { code: 'SC_PRINT', name: '复印打印', sort: 2 },
        { code: 'SC_MEETING', name: '会议会务', sort: 3 },
        { code: 'SC_IT', name: '桌面运维', sort: 4 },
        { code: 'SC_XC', name: '信创适配', sort: 5 }
      ]
    },
    'p-scene-obj': {
      code: 'SCENE_OBJ', valueType: '枚举', method: 'AI 抽取', source: '简介+参数', note: '适用对象枚举。',
      ruleConfig: 'AI 抽取适用对象；枚举合法性校验',
      enums: [
        { code: 'OBJ_GOV', name: '机关单位', sort: 1 },
        { code: 'OBJ_SCHOOL', name: '学校', sort: 2 },
        { code: 'OBJ_HOSP', name: '医疗机构', sort: 3 }
      ]
    },
    'p-scene-fp': { code: 'SCENE_FP', valueType: '文本', method: 'AI 抽取', source: '标题+简介+详情图', note: '动态抽取功能卖点 3～8 条。', ruleConfig: 'FP 提示词规则；去重截断 3～8 条' },
    'p-scene-buy': {
      code: 'SCENE_BUY', valueType: '枚举', method: 'AI+规则', source: '简介+参数', note: '采购友好属性。',
      ruleConfig: 'B2G 采购属性关键词匹配',
      enums: [
        { code: 'BUY_BOX', name: '整箱采购', sort: 1 },
        { code: 'BUY_INV', name: '支持电子发票', sort: 2 },
        { code: 'BUY_STOCK', name: '常备现货', sort: 3 }
      ]
    },
    'p-3c': { code: 'CERT_3C', valueType: '是/否', method: 'AI+OCR', source: '证书图+登记', note: '识别 3C 证书并与商品型号比对。', ruleConfig: 'OCR 证书字段 + 型号一致性' },
    'p-prod-lic': { code: 'CERT_PROD', valueType: '是/否', method: 'AI 识别+人工核验', source: '证书图', note: '生产许可证有效性核验。', ruleConfig: '证书 OCR；低置信进人工复核' },
    'p-qc': { code: 'QUAL_QC', valueType: '是/否', method: 'AI+OCR', source: '证书图', note: '质检报告有效且品名一致。', ruleConfig: '有效期 + 品名规格比对' },
    'p-hot': { code: 'TRADE_HOT', valueType: '是/否', method: '行为计算', source: '订单行为', note: '近 30 日销量达阈值。', ruleConfig: '近30日销量 ≥ 阈值' },
    'p-new': { code: 'TRADE_NEW', valueType: '是/否', method: '系统计算', source: '上架时间', note: '上架 30 日内标记新品。', ruleConfig: '上架天数 ≤ 30' },
    's-main-cat': {
      code: 'SUP_MAIN_CAT', valueType: '枚举', method: '规则引擎', source: '经营类目登记', note: '供应商主营类目。',
      ruleConfig: '经营登记类目 vs 枚举',
      enums: [
        { code: 'MC_OFFICE', name: '办公耗材', sort: 1 },
        { code: 'MC_DEVICE', name: '办公设备', sort: 2 },
        { code: 'MC_IT', name: '信息化设备', sort: 3 }
      ]
    },
    's-region': { code: 'SUP_REGION', valueType: '文本', method: '系统直取', source: '供应商档案', note: '从供应商注册信息直取服务区域。', ruleConfig: 'serviceRegion 字段直取' },
    's-brand-auth': { code: 'SUP_BRAND', valueType: '文本', method: 'AI+规则', source: '授权文件', note: '已授权品牌清单。', ruleConfig: '授权文件 OCR + 品牌清单' },
    's-industry-lic': { code: 'SUP_LIC', valueType: '是/否', method: 'AI 识别+人工核验', source: '资质文件', note: '行业许可是否齐全有效。', ruleConfig: '许可 OCR；低置信进复核' },
    's-ship': { code: 'SUP_SHIP', valueType: '高/中/低', method: '行为计算', source: '发货履约', note: '按历史发货时效计算等级。', ruleConfig: '近90日发货时效分档' },
    's-after': { code: 'SUP_AFTER', valueType: '高/中/低', method: '行为计算', source: '售后数据', note: '按售后响应时长计算等级。', ruleConfig: '近90日售后响应分档' }
  };

  var productTaggings = [
    {
      id: 'SKU10001', sku: 'SKU10001', name: '得力 A4 复印纸 70g 5包装', category: '办公耗材 > 纸张类 > 复印纸',
      supplier: '浙江得力办公用品有限公司', status: '自动打标完成', reviewCount: 0, taggedAt: '2026-06-14 10:22',
      tags: [
        { tagId: 'p-brand', path: '类目与规格 > 规格信息 > 品牌', value: '得力', method: '系统直取', status: '自动打标完成', editable: false },
        { tagId: 'p-scene-use', path: '场景与需求 > 适用场景', value: '复印打印、日常办公', method: 'AI 抽取+规则校验', status: '自动打标完成', editable: true, confidence: 0.91 },
        { tagId: 'p-complete', path: '商品信息审核 > 内容质量 > 资料完整度', value: '高', method: '规则汇总', status: '自动打标完成', editable: false }
      ]
    },
    {
      id: 'SKU10002', sku: 'SKU10002', name: '惠普 LaserJet 打印机', category: '办公设备 > 打印设备 > 激光打印机',
      supplier: '华北办公用品有限公司', status: '人工复核', reviewCount: 2, taggedAt: '2026-06-15 09:10',
      tags: [
        { tagId: 'p-3c', path: '合规与信任 > 强制认证 > 3C认证', value: '待确认', method: 'AI+OCR', status: '人工复核', editable: true, confidence: 0.52, evidence: '证书图 OCR 模糊' },
        { tagId: 'p-scene-use', path: '场景与需求 > 适用场景', value: '桌面运维', method: 'AI 抽取+规则校验', status: '人工复核', editable: true, confidence: 0.58, evidence: '简介信息不足' },
        { tagId: 'p-brand', path: '类目与规格 > 规格信息 > 品牌', value: '惠普', method: '系统直取', status: '自动打标完成', editable: false }
      ]
    },
    {
      id: 'SKU10003', sku: 'SKU10003', name: '中性笔 0.5mm 黑色 12支装', category: '办公耗材 > 书写工具 > 中性笔',
      supplier: '雨前供应商有限公司', status: '自动打标失败', reviewCount: 1, taggedAt: '2026-06-15 11:40',
      tags: [
        { tagId: 'p-scene-fp', path: '场景与需求 > 功能卖点', value: '—', method: 'AI 抽取', status: '自动打标失败', editable: true, evidence: 'AI 服务超时' }
      ]
    }
  ];

  var supplierTaggings = [
    {
      id: 'SUP001', name: '浙江得力办公用品有限公司', code: 'SUP001', category: '办公耗材 > 纸张类 > 复印纸',
      supplier: '浙江得力办公用品有限公司', status: '自动打标完成', reviewCount: 0, taggedAt: '2026-06-13 16:00',
      tags: [
        { tagId: 's-main-cat', path: '经营属性 > 主营类目', value: '办公耗材', method: '规则引擎', status: '自动打标完成', editable: true },
        { tagId: 's-region', path: '经营属性 > 服务区域', value: '华东地区', method: '系统直取', status: '自动打标完成', editable: false },
        { tagId: 's-ship', path: '履约能力 > 发货时效等级', value: '高', method: '行为计算', status: '自动打标完成', editable: false }
      ]
    },
    {
      id: 'SUP002', name: '华北办公用品有限公司', code: 'SUP002', category: '办公设备 > 打印设备 > 激光打印机',
      supplier: '华北办公用品有限公司', status: '人工复核', reviewCount: 1, taggedAt: '2026-06-14 14:20',
      tags: [
        { tagId: 's-brand-auth', path: '资质合规 > 品牌授权', value: '惠普（待核验）', method: 'AI+规则', status: '人工复核', editable: true, evidence: '授权书 OCR 不完整' }
      ]
    }
  ];

  var changeLogs = [
    { id: 'log1', targetType: '商品', entityId: 'SKU10002', entityName: '惠普 LaserJet 打印机', tagPath: '场景与需求 > 适用场景', changeType: '人工复核', before: '—', after: '桌面运维', operator: '张三', time: '2026-06-15 10:05' },
    { id: 'log2', targetType: '商品', entityId: 'SKU10001', entityName: '得力 A4 复印纸 70g 5包装', tagPath: '场景与需求 > 适用场景', changeType: '自动达标', before: '—', after: '复印打印、日常办公', operator: '系统', time: '2026-06-14 10:22' },
    { id: 'log3', targetType: '供应商', entityId: 'SUP001', entityName: '浙江得力办公用品有限公司', tagPath: '经营属性 > 主营类目', changeType: '人工修改', before: '办公设备', after: '办公耗材', operator: '李四', time: '2026-06-13 17:30' }
  ];

  function getLogChangeTypeMeta(changeType) {
    if (changeType === '自动达标') {
      return { label: '自动达标', icon: 'fa-robot', cls: 'log-change-auto', hint: '系统自动打标写入' };
    }
    if (changeType === '人工复核') {
      return { label: '人工复核', icon: 'fa-user-check', cls: 'log-change-review', hint: '运营人员复核确认标签值' };
    }
    return { label: '人工修改', icon: 'fa-user-pen', cls: 'log-change-manual', hint: '运营人员主动维护修改标签值' };
  }

  function logChangeShowsDiff(changeType) {
    return changeType === '人工修改' || changeType === '人工复核';
  }

  function renderLogChangeType(changeType) {
    var meta = getLogChangeTypeMeta(changeType);
    return '<span class="tag log-change-pill ' + meta.cls + '" title="' + meta.hint + '"><i class="fas ' + meta.icon + '"></i><span>' + meta.label + '</span></span>';
  }

  function resolveLogChangeType(tag, processIntent) {
    if (processIntent === 'review') return '人工复核';
    if (processIntent === 'maintain') return '人工修改';
    if (tag.status === '人工复核' || tag.status === '自动打标失败') return '人工复核';
    return '人工修改';
  }

  function $(sel, root) { return (root || document).querySelector(sel); }

  function isManualBlocked(method) {
    return MANUAL_BLOCKED.indexOf(method) >= 0;
  }

  function statusTagClass(status) {
    if (status === '自动打标完成') return 'tag-success';
    if (status === '自动打标失败') return 'tag-danger';
    return 'tag-warn';
  }

  /** 实体级打标状态展示（列表/详情统一） */
  function getEntityStatusMeta(status, reviewCount) {
    if (status === '自动打标完成') {
      return { label: '打标正常', icon: 'fa-circle-check', cls: 'tag-success', hint: '全部标签已自动打标，无待办项' };
    }
    if (status === '自动打标失败') {
      return {
        label: '打标异常',
        icon: 'fa-circle-xmark',
        cls: 'tag-danger',
        hint: '存在自动打标失败项' + (reviewCount ? '（' + reviewCount + ' 项待处理）' : '')
      };
    }
    return {
      label: '待人工复核',
      icon: 'fa-user-check',
      cls: 'tag-warn',
      hint: reviewCount ? reviewCount + ' 项标签待人工确认' : '存在需人工复核的标签'
    };
  }

  function renderEntityStatus(status, reviewCount) {
    var meta = getEntityStatusMeta(status, reviewCount);
    var html = '<span class="tag tag-status-pill ' + meta.cls + '" title="' + meta.hint + '">';
    html += '<i class="fas ' + meta.icon + '"></i><span>' + meta.label + '</span>';
    if ((status === '人工复核' || status === '自动打标失败') && reviewCount > 0) {
      html += '<span class="tag-status-count">' + reviewCount + '</span>';
    }
    html += '</span>';
    return html;
  }

  function entityNeedsReview(status, reviewCount) {
    return (reviewCount || 0) > 0 || status === '人工复核' || status === '自动打标失败';
  }

  function entityIsNormalComplete(status, reviewCount) {
    return status === '自动打标完成' && !(reviewCount || 0);
  }

  function findNode(nodes, id) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return nodes[i];
      if (nodes[i].children) {
        var hit = findNode(nodes[i].children, id);
        if (hit) return hit;
      }
    }
    return null;
  }

  function getParentName(nodes, id) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.children && n.children.some(function (c) { return c.id === id; })) return n.name;
      if (n.children) {
        var deep = getParentName(n.children, id);
        if (deep !== '—') return deep;
      }
    }
    return '—';
  }

  function getEntityList(type) {
    return type === 'product' ? productTaggings : supplierTaggings;
  }

  function getEntityDisplayName(type, id) {
    var data = getEntityList(type).find(function (x) { return x.id === id; });
    return data ? data.name : '—';
  }

  function buildLogDetailHtml(log) {
    var type = log.targetType === '商品' ? 'product' : 'supplier';
    var data = getEntityList(type).find(function (x) { return x.id === log.entityId; });
    if (!data) return '<div class="empty-detail"><p>未找到对应实体数据</p></div>';
    var entityName = log.entityName || data.name;
    var showDiff = logChangeShowsDiff(log.changeType);
    var html = '<div class="log-detail-summary">';
    html += '<div class="log-detail-meta"><span>打标目标：<strong>' + log.targetType + '</strong></span>';
    html += '<span>实体 ID：<strong>' + log.entityId + '</strong></span>';
    html += '<span>名称：<strong>' + entityName + '</strong></span></div>';
    html += '<div class="log-detail-meta"><span>变更类型：' + renderLogChangeType(log.changeType) + '</span>';
    html += '<span>操作人：<strong>' + log.operator + '</strong></span>';
    html += '<span>时间：<strong>' + log.time + '</strong></span></div>';
    html += '</div>';
    html += '<div class="table-wrap mt-3"><table class="data-table entity-tag-table log-detail-table"><thead><tr>';
    html += '<th>标签路径</th><th>标签值</th>';
    if (showDiff) html += '<th>改前</th><th>改后</th>';
    html += '<th>打标方式</th><th>打标状态</th></tr></thead><tbody>';
    data.tags.forEach(function (t) {
      var isChanged = t.path === log.tagPath;
      var rowClass = isChanged ? ' log-tag-row-changed' : '';
      html += '<tr class="' + rowClass.trim() + '"><td>' + t.path + '</td><td>' + t.value + '</td>';
      if (showDiff) {
        html += '<td>' + (isChanged ? '<span class="log-diff-before">' + log.before + '</span>' : '—') + '</td>';
        html += '<td>' + (isChanged ? '<span class="log-diff-after">' + log.after + '</span>' : '—') + '</td>';
      }
      html += '<td>' + t.method + '</td>';
      html += '<td><span class="tag ' + statusTagClass(t.status) + '">' + t.status + '</span></td></tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function openLogDetailModal(logId) {
    var log = changeLogs.find(function (l) { return l.id === logId; });
    if (!log) return;
    var overlay = document.getElementById('logDetailModal');
    var title = document.getElementById('logDetailTitle');
    var body = document.getElementById('logDetailBody');
    if (!overlay || !title || !body) return;
    var entityName = log.entityName || getEntityDisplayName(log.targetType === '商品' ? 'product' : 'supplier', log.entityId);
    title.textContent = '标签详情 · ' + entityName;
    body.innerHTML = buildLogDetailHtml(log);
    overlay.hidden = false;
  }

  /** 校验标签值是否符合标签库配置的「标签值类型」 */
  function validateTagValue(tagId, value) {
    var v = String(value || '').trim();
    if (!v || v === '—') return { ok: false, msg: '标签值不能为空' };
    var meta = tagMeta[tagId];
    if (!meta) return { ok: true, msg: '' };
    var type = meta.valueType;
    if (type === '是/否') {
      if (v !== '是' && v !== '否') return { ok: false, msg: '「是/否」类型仅允许填写：是、否' };
    } else if (type === '高/中/低') {
      if (['高', '中', '低'].indexOf(v) < 0) return { ok: false, msg: '「高/中/低」类型仅允许：高、中、低' };
    } else if (type === '通过/预警/驳回') {
      if (['通过', '预警', '驳回'].indexOf(v) < 0) return { ok: false, msg: '仅允许：通过、预警、驳回' };
    } else if (type === '数值') {
      if (isNaN(Number(v))) return { ok: false, msg: '「数值」类型须为有效数字' };
    } else if (type === '枚举') {
      var names = (meta.enums || []).map(function (e) { return e.name; });
      var parts = v.split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
      var bad = parts.filter(function (p) { return names.indexOf(p) < 0; });
      if (bad.length) return { ok: false, msg: '枚举值不在允许范围：' + bad.join('、') + '；可选：' + names.join('、') };
    }
    return { ok: true, msg: '' };
  }

  var entityModalState = { type: null, id: null, onUpdate: null, mode: 'view', processIntent: 'review' };

  function syncEntityModalFooter(mode) {
    var footer = document.querySelector('#entityModal .modal-footer');
    if (!footer) return;
    var confirmBtn = document.getElementById('btnConfirmReview');
    if (mode === 'process') {
      if (!confirmBtn) {
        confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.id = 'btnConfirmReview';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> 确认复核/修改';
        confirmBtn.addEventListener('click', confirmEntityTagEdits);
        footer.insertBefore(confirmBtn, footer.firstChild);
      } else {
        confirmBtn.hidden = false;
      }
    } else if (confirmBtn) {
      confirmBtn.hidden = true;
    }
  }

  function openEntityModal(type, id, onUpdate, mode) {
    var list = getEntityList(type);
    var data = list.find(function (x) { return x.id === id; });
    if (!data) return;
    var overlay = $('#entityModal');
    if (!overlay) return;
    mode = mode === 'process' ? 'process' : 'view';
    entityModalState = { type: type, id: id, onUpdate: onUpdate || null, mode: mode, processIntent: entityModalState.processIntent || 'review' };
    var title = $('#entityModalTitle');
    var body = $('#entityModalBody');
    title.textContent = (type === 'product' ? '商品标签详情 · ' : '供应商标签详情 · ') + data.name;
    var html = '<div class="entity-meta">';
    html += '<span>打标状态：<span id="entityOverallStatus">' + renderEntityStatus(data.status, data.reviewCount || 0) + '</span></span>';
    html += '<span>待复核项：<strong id="entityReviewCount">' + (data.reviewCount || 0) + '</strong></span>';
    html += '<span>最近打标：' + data.taggedAt + '</span>';
    if (mode === 'process') {
      html += '<button type="button" class="btn btn-sm btn-outline" id="btnRetag"><i class="fas fa-rotate"></i> 重新打标</button>';
    }
    html += '</div>';
    html += '<div class="table-wrap mt-3"><table class="data-table entity-tag-table"><thead><tr><th>标签路径</th><th>标签值</th><th>打标方式</th><th>打标状态</th><th>置信度</th></tr></thead><tbody>';
    data.tags.forEach(function (t, idx) {
      var rowClass = mode === 'process' && (t.status === '人工复核' || t.status === '自动打标失败') ? ' entity-tag-row-pending' : '';
      html += '<tr class="' + rowClass.trim() + '" data-idx="' + idx + '"><td>' + t.path + '</td><td>';
      if (mode === 'process' && t.editable) {
        html += '<input type="text" class="form-input tag-value-input" data-idx="' + idx + '" value="' + String(t.value).replace(/"/g, '&quot;') + '" style="min-width:160px">';
      } else {
        html += t.value;
        if (mode === 'process' && !t.editable) {
          html += '<span class="text-muted text-xs block">系统直取不可改</span>';
        }
      }
      html += '</td><td>' + t.method + '</td>';
      html += '<td><span class="tag ' + statusTagClass(t.status) + ' tag-status-cell">' + t.status + '</span></td>';
      html += '<td>' + (t.confidence != null ? t.confidence : '—') + '</td></tr>';
    });
    html += '</tbody></table></div>';
    if (mode === 'process') {
      html += '<div class="log-hint"><i class="fas fa-clock-rotate-left"></i> 修改后请点击<strong>确认复核/修改</strong>，系统将校验标签值是否符合配置要求，并写入标签维护日志。</div>';
    }
    body.innerHTML = html;
    if (mode === 'process') {
      data.tags.forEach(function (t) {
        if (t.editable) t._originalValue = t.value;
      });
      $('#btnRetag') && $('#btnRetag').addEventListener('click', function () { alert('已触发重新打标任务（原型演示）'); });
    }
    syncEntityModalFooter(mode);
    overlay.hidden = false;
  }

  function openEntityProcessModal(type, id, onUpdate, processIntent) {
    entityModalState.processIntent = processIntent === 'maintain' ? 'maintain' : 'review';
    openEntityModal(type, id, onUpdate, 'process');
  }

  function confirmEntityTagEdits() {
    var type = entityModalState.type;
    var id = entityModalState.id;
    if (!type || !id) return;
    var data = getEntityList(type).find(function (x) { return x.id === id; });
    if (!data) return;
    var inputs = document.querySelectorAll('.tag-value-input');
    var errors = [];
    var changes = [];
    inputs.forEach(function (inp) {
      var idx = +inp.dataset.idx;
      var tag = data.tags[idx];
      var newVal = inp.value.trim();
      var oldVal = tag._originalValue != null ? tag._originalValue : tag.value;
      if (newVal === oldVal) return;
      var check = validateTagValue(tag.tagId, newVal);
      if (!check.ok) {
        errors.push('「' + tag.path + '」：' + check.msg);
        inp.classList.add('input-error');
      } else {
        inp.classList.remove('input-error');
        changes.push({ tag: tag, oldVal: oldVal, newVal: newVal });
      }
    });
    if (errors.length) {
      alert('校验未通过：\n\n' + errors.join('\n'));
      return;
    }
    if (!changes.length) {
      alert('未检测到标签值变更');
      return;
    }
    changes.forEach(function (c) {
      changeLogs.unshift({
        id: 'log' + Date.now() + Math.random(),
        targetType: type === 'product' ? '商品' : '供应商',
        entityId: data.id,
        entityName: data.name,
        tagPath: c.tag.path,
        changeType: resolveLogChangeType(c.tag, entityModalState.processIntent),
        before: c.oldVal,
        after: c.newVal,
        operator: '张三',
        time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      });
      c.tag.value = c.newVal;
      c.tag.status = '自动打标完成';
      c.tag._originalValue = c.newVal;
    });
    data.reviewCount = data.tags.filter(function (t) {
      return t.status === '人工复核' || t.status === '自动打标失败';
    }).length;
    data.status = data.reviewCount > 0 ? '人工复核' : '自动打标完成';
    alert('已确认复核/修改，共更新 ' + changes.length + ' 项标签');
    openEntityModal(type, id, entityModalState.onUpdate, entityModalState.mode);
    if (entityModalState.onUpdate) entityModalState.onUpdate();
  }

  function closeModals() {
    ['entityModal', 'libModal', 'ruleInlineTest', 'logDetailModal'].forEach(function (id) {
      var el = id === 'logDetailModal' ? document.getElementById(id) : $('#' + id);
      if (el) el.hidden = true;
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModals();
  });

  return {
    MANUAL_BLOCKED: MANUAL_BLOCKED,
    METHODS: METHODS,
    VALUE_TYPES: VALUE_TYPES,
    FREQUENCIES: FREQUENCIES,
    tagLibraries: tagLibraries,
    tagTrees: tagTrees,
    tagMeta: tagMeta,
    productTaggings: productTaggings,
    supplierTaggings: supplierTaggings,
    changeLogs: changeLogs,
    $: $,
    isManualBlocked: isManualBlocked,
    statusTagClass: statusTagClass,
    getEntityStatusMeta: getEntityStatusMeta,
    renderEntityStatus: renderEntityStatus,
    entityNeedsReview: entityNeedsReview,
    entityIsNormalComplete: entityIsNormalComplete,
    findNode: findNode,
    getParentName: getParentName,
    getEntityList: getEntityList,
    getEntityDisplayName: getEntityDisplayName,
    buildLogDetailHtml: buildLogDetailHtml,
    openLogDetailModal: openLogDetailModal,
    renderLogChangeType: renderLogChangeType,
    validateTagValue: validateTagValue,
    openEntityModal: openEntityModal,
    openEntityProcessModal: openEntityProcessModal,
    confirmEntityTagEdits: confirmEntityTagEdits,
    closeModals: closeModals
  };
})();
