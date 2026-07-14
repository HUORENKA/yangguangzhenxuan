/* 竞价采购助手 · 共享演示逻辑（最价方案 / 管理工作台） */
(function () {
  var PLAN_BID_PENDING_CONFIRM = null;
  var PLAN_BID_PENDING_STOP = null;
  var PLAN_BID_HISTORY_FILTER = 'all';
  var PLAN_BID_QUOTES_ROW_ID = null;

  var PLAN_BID_STATUS = {
    quoting: { text: '报价中', cls: 'quoting' },
    pending_confirm: { text: '待确认下单', cls: 'pending_confirm' },
    ordered: { text: '已下单', cls: 'ordered' },
    terminated: { text: '已终止', cls: 'terminated' },
    failed: { text: '流标', cls: 'failed' }
  };

  function planBidJsStr(s) {
    return JSON.stringify(String(s == null ? '' : s));
  }

  function planBidHasBidSchemeFile(files) {
    return (files || []).some(function (f) {
      return f.isBidScheme || /竞价方案|询价方案/.test(f.name || '');
    });
  }

  function planBidCreateBidSchemeFile(row) {
    var base = String((row && row.file) || '本次采购').replace(/\.[^.]+$/, '');
    var isInquiry = row && row.mode === 'inquiry';
    var label = isInquiry ? '询价方案' : '竞价方案';
    var uploadedAt = '2026-05-06 09:00:00';
    if (row && row.deadline) {
      var dl = planBidFmtDeadline(row.deadline);
      if (dl !== '—') uploadedAt = dl.replace(/\//g, '-') + ':00';
    }
    return {
      id: 'bid-scheme',
      name: base + '-' + label + '.pdf',
      type: 'pdf',
      sizeText: '420KB',
      uploadedAt: uploadedAt,
      isBidScheme: true,
      source: 'system'
    };
  }

  function planBidMergeBasisFiles(row, basis) {
    var files = Array.isArray(basis && basis.files) ? basis.files.slice() : [];
    if (!planBidHasBidSchemeFile(files)) files.unshift(planBidCreateBidSchemeFile(row));
    return files;
  }

  function planBidBasisLink(rowId, kind, name) {
    return '<button type="button" class="bi-basis-view-link" onclick="planBidOpenBasisDoc('
      + planBidJsStr(rowId) + ',' + planBidJsStr(kind) + ',' + planBidJsStr(name) + ')">'
      + planBidEsc(name) + '</button>';
  }

  window.planBidOpenBasisDoc = function planBidOpenBasisDoc(rowId, kind, docName) {
    var row = planBidFindRow(rowId);
    var labels = { plan: '采购计划', budget: '采购预算', file: '采购依据文件', bidScheme: '竞价方案文件' };
    var typeLabel = labels[kind] || '文件';
    alert('演示：打开' + typeLabel + '「' + docName + '」'
      + (row && row.file ? '\n关联采购文件：' + row.file : ''));
  };

  var PLAN_BID_DEMO_BASIS = {
    office: {
      plan: { name: '2026年二季度办公耗材集中采购计划', period: '2026Q2', owner: '采购中心', planAmount: 280000, planUsed: 82000 },
      budget: { name: '办公耗材预算包', period: '2026Q2', amount: 280000, used: 82000 },
      files: [
        { name: '采购申请审批单.pdf', type: 'pdf', sizeText: '248KB', uploadedAt: '2026-05-06 09:30:00' },
        { name: '需求清单与比价说明.xlsx', type: 'xlsx', sizeText: '86KB', uploadedAt: '2026-05-06 09:31:12' }
      ],
      hasPlan: true, hasBudget: true, hasFiles: true, hasBasis: true
    },
    furniture: {
      plan: { name: '2026年办公家具更新专项计划', period: '2026全年', owner: '行政部', planAmount: 1500000, planUsed: 620000 },
      budget: { name: '办公家具预算包', period: '2026全年', amount: 1200000, used: 580000 },
      files: [
        { name: '家具更新立项批复.pdf', type: 'pdf', sizeText: '312KB', uploadedAt: '2026-05-04 10:15:00' },
        { name: '现场勘测与配置清单.docx', type: 'docx', sizeText: '1.2MB', uploadedAt: '2026-05-04 10:18:22' }
      ],
      hasPlan: true, hasBudget: true, hasFiles: true, hasBasis: true
    },
    minimal: {
      plan: null,
      budget: null,
      files: [{ name: '竞价采购说明.pdf', type: 'pdf', sizeText: '156KB', uploadedAt: '2026-05-05 14:00:00' }],
      hasPlan: false, hasBudget: false, hasFiles: true, hasBasis: true
    }
  };

  var PLAN_BID_HISTORY = [
    { id: 'h1', code: 'BID20260507001', file: '会议室音视频改造项目.pdf', docType: 'pdf', mode: 'bidding', suppliers: '5 家', status: 'quoting', deadline: '2026-06-27T18:00', budget: 95000, bidStep: 500, lowest: 86200, lowestSupplier: '声谷科技公司', procurementBasis: PLAN_BID_DEMO_BASIS.office, quotes: [{ time: '2026-05-06 10:15', supplier: '蓝天系统集成', amount: 90500, valid: true, quoteRemark: '含基础安装，交付周期15个工作日。', descFileName: '蓝天-竞价说明.pdf' }, { time: '2026-05-06 14:22', supplier: '声谷科技公司', amount: 88000, valid: true, quoteRemark: '含上门安装调试，质保3年。', descFileName: '声谷-会议室音视频竞价说明.pdf' }, { time: '2026-05-07 09:05', supplier: '京采云商贸', amount: 87000, valid: true }, { time: '2026-05-07 11:20', supplier: '蓝天系统集成', amount: 89800, valid: false }, { time: '2026-05-07 14:32', supplier: '声谷科技公司', amount: 86200, valid: true, quoteRemark: '含上门安装调试及半年驻场运维；报价有效期30天。', descFileName: '声谷-竞价说明V2.pdf' }] },
    { id: 'h2', code: 'RFQ20260507002', file: '年度耗材集中采购.xlsx', docType: 'excel', mode: 'inquiry', suppliers: '4 家', status: 'pending_confirm', deadline: '2026-06-25T18:00', budget: 50000, bidStep: null, lowest: 42800, lowestSupplier: '京采云商贸', procurementBasis: PLAN_BID_DEMO_BASIS.office, quotes: [{ time: '2026-05-07 08:40', supplier: '政采优选数码', amount: 46500, valid: true, quoteRemark: '市区免费配送，次月统一开票。', descFileName: '政采优选-询价说明.docx' }, { time: '2026-05-07 10:12', supplier: '京采云商贸', amount: 44200, valid: true }, { time: '2026-05-07 11:05', supplier: '北京华政科技', amount: 45100, valid: true }, { time: '2026-05-07 13:48', supplier: '京采云商贸', amount: 42800, valid: true, quoteRemark: '框架协议价，可按需分批供货。', descFileName: '京采云-耗材询价说明.pdf' }, { time: '2026-05-07 15:22', supplier: '政采优选数码', amount: 43900, valid: true }] },
    { id: 'h3', code: 'BID20260506003', file: '办公家具更新项目.xlsx', docType: 'excel', mode: 'bidding', suppliers: '6 家', status: 'ordered', deadline: '2026-05-08T18:00', budget: 140000, bidStep: 1000, lowest: 128000, lowestSupplier: '中采智联供应链', procurementBasis: PLAN_BID_DEMO_BASIS.furniture, quotes: [{ time: '2026-05-04 16:10', supplier: '国采办公服务中心', amount: 136500, valid: true }, { time: '2026-05-05 09:30', supplier: '中采智联供应链', amount: 131200, valid: true }, { time: '2026-05-05 14:55', supplier: '北京华政科技', amount: 129800, valid: true }, { time: '2026-05-06 11:18', supplier: '中采智联供应链', amount: 128000, valid: true }] },
    { id: 'h4', code: 'RFQ20260505004', file: '机房布线耗材询价.pdf', docType: 'pdf', mode: 'inquiry', suppliers: '3 家', status: 'terminated', deadline: '2026-05-05T18:00', budget: 65000, bidStep: null, lowest: 59900, lowestSupplier: '北京华政科技', procurementBasis: PLAN_BID_DEMO_BASIS.office, quotes: [{ time: '2026-05-03 13:20', supplier: '京采云商贸', amount: 62800, valid: true }, { time: '2026-05-03 17:45', supplier: '北京华政科技', amount: 61200, valid: true }, { time: '2026-05-04 09:10', supplier: '北京华政科技', amount: 59900, valid: true }, { time: '2026-05-04 10:02', supplier: '政采优选数码', amount: 60500, valid: false }] },
    { id: 'h5', code: 'RFQ20260503006', file: '保安服务费竞价.docx', docType: 'word', mode: 'bidding', suppliers: '4 家', status: 'failed', deadline: '2026-05-06T18:00', budget: 120000, bidStep: 500, lowest: null, lowestSupplier: null, procurementBasis: PLAN_BID_DEMO_BASIS.minimal, quotes: [{ time: '2026-05-05 09:00', supplier: '甲保安服务有限公司', amount: 120000, valid: false }, { time: '2026-05-05 11:30', supplier: '乙安防服务中心', amount: 118000, valid: false }, { time: '2026-05-05 15:10', supplier: '丙安保集团', amount: 121500, valid: false }] },
    { id: 'h6', code: 'BID20260507008', file: '绿化养护外包询价.xlsx', docType: 'excel', mode: 'inquiry', suppliers: '5 家', status: 'quoting', deadline: '2026-06-30T18:00', budget: 35000, bidStep: null, lowest: 31500, lowestSupplier: '政采优选数码', procurementBasis: PLAN_BID_DEMO_BASIS.office, quotes: [{ time: '2026-05-07 07:50', supplier: '绿化园林工程队', amount: 35200, valid: true }, { time: '2026-05-07 09:18', supplier: '政采优选数码', amount: 33200, valid: true }, { time: '2026-05-07 12:40', supplier: '京采云商贸', amount: 32800, valid: true }, { time: '2026-05-07 16:05', supplier: '政采优选数码', amount: 31500, valid: true }, { time: '2026-05-07 18:22', supplier: '绿化园林工程队', amount: 31800, valid: true }] },
    { id: 'h7', code: 'DIR20260708001', file: '办公设备及劳保用品采购计划.pdf', docType: 'pdf', mode: 'direct', purchaseMethod: 'direct', suppliers: '—', status: 'ordered', deadline: '2026-07-08T18:00', budget: 86000, bidStep: null, lowest: 84200, lowestSupplier: '京采云商贸', procurementBasis: PLAN_BID_DEMO_BASIS.office, quotes: [] }
  ];

  function planBidGetHistory() {
    var list = PLAN_BID_HISTORY.slice();
    try {
      var extra = JSON.parse(sessionStorage.getItem('planBidNewRecords') || '[]');
      if (Array.isArray(extra) && extra.length) list = extra.concat(list);
    } catch (e) {}
    return list;
  }

  function planBidFmtMoney(n) {
    if (n == null || n === '') return '—';
    return '¥' + Number(n).toLocaleString('zh-CN');
  }

  function planBidDocIcon(dt) {
    if (dt === 'pdf') return { cls: 'pdf', icon: 'fa-file-pdf' };
    if (dt === 'word') return { cls: 'word', icon: 'fa-file-word' };
    return { cls: '', icon: 'fa-file-excel' };
  }

  function planBidSortQuotes(quotes) {
    return quotes.slice().sort(function (a, b) {
      return a.time < b.time ? 1 : (a.time > b.time ? -1 : 0);
    });
  }

  function planBidEsc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function planBidRowCode(row) {
    return planBidEsc(row.code || '—');
  }

  function planBidGenerateCode(mode) {
    var prefix = mode === 'inquiry' ? 'RFQ' : 'BID';
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var dateStr = '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    var seq = String(Date.now()).slice(-3);
    return prefix + dateStr + seq;
  }

  function planBidDocFileCellHtml(row, wb) {
    if (!row.file) {
      return wb
        ? '<td><span style="color:#94a3b8">—</span></td>'
        : '<td><span class="bi-doc-empty" style="color:#94a3b8">—</span></td>';
    }
    var ic = planBidDocIcon(row.docType);
    if (wb) {
      return ''
        + '<td><div class="doc-cell"><div class="doc-icon ' + ic.cls + '"><i class="fa-solid ' + ic.icon + '"></i></div>'
        + '<div><div class="doc-name">' + planBidEsc(row.file) + '</div></div></div></td>';
    }
    return ''
      + '<td><div class="bi-doc-cell"><div class="bi-doc-icon ' + ic.cls + '"><i class="fa-solid ' + ic.icon + '"></i></div>'
      + '<div><div class="bi-doc-name">' + planBidEsc(row.file) + '</div></div></div></td>';
  }

  function planBidFmtSuppliers(text) {
    return String(text == null ? '' : text).replace(/[（(]\s*已邀请\s*[）)]/g, '').trim();
  }

  function planBidFmtDeadline(v) {
    if (v == null || v === '') return '—';
    var s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
      var parts = s.replace('T', ' ').split(' ');
      return parts[0].replace(/-/g, '/') + ' ' + (parts[1] || '').slice(0, 5);
    }
    if (/^\d{4}-\d{2}-\d{2}\s/.test(s)) {
      return s.replace(/-/g, '/').slice(0, 16);
    }
    return s;
  }

  function planBidFmtBidStep(row) {
    if (row.mode !== 'bidding' || row.bidStep == null || row.bidStep === '') return '—';
    return planBidFmtMoney(row.bidStep);
  }

  function planBidRuleColsHtml(row) {
    return ''
      + '<td class="bi-rule-deadline">' + planBidEsc(planBidFmtDeadline(row.deadline)) + '</td>'
      + '<td class="bi-rule-budget">' + planBidFmtMoney(row.budget) + '</td>'
      + '<td class="bi-rule-step">' + planBidFmtBidStep(row) + '</td>';
  }

  var PLAN_BID_ITEM_TPL = {
    h1: [
      { name: '视频会议终端', spec: '4K / 12倍变焦', qty: 2, unit: '台', maxPrice: 28500, basePrice: 26800 },
      { name: '全向麦克风', spec: '360° 拾音', qty: 4, unit: '个', maxPrice: 3200, basePrice: 2900 },
      { name: 'HDMI 高清线', spec: '15m / 4K', qty: 6, unit: '条', maxPrice: 380, basePrice: 320 }
    ],
    h2: [
      { name: 'A4 复印纸', spec: '70g / 8包装', qty: 100, unit: '箱', maxPrice: 1280, basePrice: 1180 },
      { name: 'HP 85A 硒鼓', spec: '兼容型号', qty: 20, unit: '个', maxPrice: 420, basePrice: 390 }
    ],
    h3: [
      { name: '办公桌', spec: '1.4m / 钢木', qty: 30, unit: '张', maxPrice: 1680, basePrice: 1520 },
      { name: '办公椅', spec: '人体工学 / 网布', qty: 30, unit: '把', maxPrice: 980, basePrice: 890 },
      { name: '文件柜', spec: '三层 / 0.9m', qty: 15, unit: '组', maxPrice: 720, basePrice: 650 }
    ],
    default: [
      { name: '采购项 A', spec: '标准规格', qty: 10, unit: '件', maxPrice: 5000, basePrice: 4600 },
      { name: '采购项 B', spec: '标准规格', qty: 5, unit: '套', maxPrice: 8200, basePrice: 7800 }
    ]
  };

  function planBidBuildQuoteItems(row, quote) {
    if (quote.items && quote.items.length) return quote.items;
    var tpl = PLAN_BID_ITEM_TPL[row.id] || PLAN_BID_ITEM_TPL.default;
    var baseSum = tpl.reduce(function (sum, it) { return sum + it.basePrice * it.qty; }, 0);
    var ratio = baseSum > 0 ? quote.amount / baseSum : 1;
    var items = tpl.map(function (it) {
      var price = Math.max(1, Math.round(it.basePrice * ratio));
      return {
        name: it.name,
        spec: it.spec,
        qty: it.qty,
        unit: it.unit,
        maxPrice: it.maxPrice,
        price: price,
        subtotal: price * it.qty
      };
    });
    var itemSum = items.reduce(function (sum, it) { return sum + it.subtotal; }, 0);
    if (items.length && itemSum !== quote.amount) {
      var diff = quote.amount - itemSum;
      items[items.length - 1].price += Math.round(diff / items[items.length - 1].qty);
      items[items.length - 1].subtotal = items[items.length - 1].price * items[items.length - 1].qty;
    }
    return items;
  }

  function planBidFindQuoteByIndex(rowId, quoteIndex) {
    var row = planBidFindRow(rowId);
    if (!row || !row.quotes) return null;
    var sorted = planBidSortQuotes(row.quotes);
    return sorted[quoteIndex] || null;
  }

  function planBidQuoteSupplementLabels(row) {
    var isInquiry = row && row.mode === 'inquiry';
    return {
      remark: isInquiry ? '询价说明' : '竞价说明',
      file: isInquiry ? '询价说明文件' : '竞价说明文件'
    };
  }

  function planBidRenderQuoteSupplementHtml(row, quote, wb) {
    var labels = planBidQuoteSupplementLabels(row);
    var remark = quote.quoteRemark ? planBidEsc(quote.quoteRemark) : '—';
    var fileBlock = '—';
    if (quote.descFileName) {
      var fn = planBidEsc(quote.descFileName);
      var btnCls = wb ? 'quote-supplement-file-btn' : 'bi-quote-supplement-file-btn';
      fileBlock = ''
        + '<button type="button" class="' + btnCls + '" onclick="planBidOpenQuoteDescFile(' + JSON.stringify(quote.descFileName) + ')">'
        + '<i class="fa-solid fa-file-lines"></i> ' + fn + '</button>';
    }
    var wrapCls = wb ? 'quote-supplement' : 'bi-quote-supplement';
    var itemCls = wb ? 'quote-supplement-item' : 'bi-quote-supplement-item';
    var labelCls = wb ? 'quote-supplement-label' : 'bi-quote-supplement-label';
    var valueCls = wb ? 'quote-supplement-value' : 'bi-quote-supplement-value';
    return ''
      + '<div class="' + wrapCls + '">'
      + '<div class="' + itemCls + '"><div class="' + labelCls + '">' + labels.remark + '</div>'
      + '<div class="' + valueCls + '">' + remark + '</div></div>'
      + '<div class="' + itemCls + '"><div class="' + labelCls + '">' + labels.file + '</div>'
      + '<div class="' + valueCls + '">' + fileBlock + '</div></div>'
      + '</div>';
  }

  window.planBidOpenQuoteDescFile = function planBidOpenQuoteDescFile(fileName) {
    alert('演示：打开供应商上传文件「' + fileName + '」');
  };

  function planBidFindRow(id) {
    var list = planBidGetHistory();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function planBidGetProcurementBasis(row) {
    if (row && row.procurementBasis) return row.procurementBasis;
    return PLAN_BID_DEMO_BASIS.office;
  }

  function planBidEnsureBasisModal() {
    if (document.getElementById('biModalBasis')) return;
    if (!document.getElementById('planBidBasisViewStyles')) {
      var style = document.createElement('style');
      style.id = 'planBidBasisViewStyles';
      style.textContent = ''
        + '.bi-basis-view-stack{display:flex;flex-direction:column;gap:14px;}'
        + '.bi-basis-view-card{border:1px solid #e8eef5;border-radius:12px;background:#fff;overflow:hidden;}'
        + '.bi-basis-view-card-head{padding:10px 14px;background:#f8fafc;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:800;color:#64748b;letter-spacing:.2px;}'
        + '.bi-basis-view-card-body{padding:12px 14px;}'
        + '.bi-basis-view-name{font-size:14px;font-weight:800;color:#0f172a;line-height:1.45;margin:0 0 6px;}'
        + '.bi-basis-view-link{display:inline;border:none;background:none;padding:0;margin:0;font:inherit;font-size:14px;font-weight:800;color:#0f766e;line-height:1.45;cursor:pointer;text-align:left;}'
        + '.bi-basis-view-link:hover{text-decoration:underline;color:#115e59;}'
        + '.bi-basis-view-meta{font-size:12px;color:#64748b;line-height:1.55;margin:0;}'
        + '.bi-basis-view-empty{font-size:13px;color:#94a3b8;line-height:1.55;margin:0;}'
        + '.bi-basis-view-file{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;}'
        + '.bi-basis-view-file:last-child{border-bottom:none;padding-bottom:0;}'
        + '.bi-basis-view-file:first-child{padding-top:0;}'
        + '.bi-basis-view-file-name{font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px;}'
        + '.bi-basis-view-file-name .bi-basis-view-link{font-size:13px;}'
        + '.bi-basis-view-tag{font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:#ecfdf5;color:#047857;white-space:nowrap;flex-shrink:0;}'
        + '.bi-basis-view-tag.system{background:#eff6ff;color:#1d4ed8;}'
        + '.bi-basis-view-summary{margin:0 0 2px;padding:12px 14px;border-radius:10px;background:linear-gradient(135deg,#f0fdfa 0%,#fff 100%);border:1px solid #ccfbf1;font-size:13px;color:#334155;line-height:1.6;}';
      document.head.appendChild(style);
    }
    var wb = planBidIsWorkbench();
    var wrap = document.createElement('div');
    if (wb) {
      wrap.innerHTML = ''
        + '<div class="dialog" id="biModalBasis" role="dialog" aria-modal="true" onclick="if(event.target===this)planBidCloseModal(\'biModalBasis\')">'
        + '  <div class="dialog-panel lg" onclick="event.stopPropagation()">'
        + '    <div class="dialog-head">'
        + '      <h4 id="biModalBasisTitle">采购依据</h4>'
        + '      <button type="button" class="dialog-x" onclick="planBidCloseModal(\'biModalBasis\')" aria-label="关闭"><i class="fas fa-xmark"></i></button>'
        + '    </div>'
        + '    <div class="dialog-body" id="biModalBasisBody"></div>'
        + '    <div class="dialog-foot">'
        + '      <button type="button" class="btn" onclick="planBidCloseModal(\'biModalBasis\')">关闭</button>'
        + '    </div>'
        + '  </div>'
        + '</div>';
    } else {
      wrap.innerHTML = ''
        + '<div class="bi-modal-overlay" id="biModalBasis" role="dialog" aria-modal="true" onclick="if(event.target===this)planBidCloseModal(\'biModalBasis\')">'
        + '  <div class="bi-modal bi-modal-lg" onclick="event.stopPropagation()">'
        + '    <div class="bi-modal-head">'
        + '      <div class="bi-modal-head-main"><h4 id="biModalBasisTitle">采购依据</h4></div>'
        + '      <button type="button" class="bi-modal-x" onclick="planBidCloseModal(\'biModalBasis\')" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>'
        + '    </div>'
        + '    <div class="bi-modal-body" id="biModalBasisBody"></div>'
        + '    <div class="bi-modal-foot">'
        + '      <button type="button" class="bi-modal-btn" onclick="planBidCloseModal(\'biModalBasis\')">关闭</button>'
        + '    </div>'
        + '  </div>'
        + '</div>';
    }
    document.body.appendChild(wrap.firstElementChild);
  }

  function planBidRenderBasisViewHtml(row) {
    var basis = planBidGetProcurementBasis(row);
    var plan = basis.plan;
    var budget = basis.budget;
    var files = planBidMergeBasisFiles(row, basis);
    var rowId = row.id;
    var planMeta = plan
      ? '计划周期：' + planBidEsc(plan.period || '未填写') + ' · 提报部门：' + planBidEsc(plan.owner || '未填写') + ' · 计划总额：' + planBidFmtMoney(plan.planAmount || 0)
      : '';
    var budgetMeta = budget
      ? '预算周期：' + planBidEsc(budget.period || '未填写') + ' · 预算金额：' + planBidFmtMoney(budget.amount || 0) + ' · 已执行：' + planBidFmtMoney(budget.used || 0)
      : '';
    var filesHtml = files.length
      ? files.map(function (item) {
        var kind = item.isBidScheme ? 'bidScheme' : 'file';
        var tagCls = item.isBidScheme ? 'bi-basis-view-tag system' : 'bi-basis-view-tag';
        var tagText = item.isBidScheme ? '系统生成' : '已留痕';
        return ''
          + '<div class="bi-basis-view-file">'
          + '<div><p class="bi-basis-view-file-name">' + planBidBasisLink(rowId, kind, item.name) + '</p>'
          + '<p class="bi-basis-view-meta">文件类型：' + planBidEsc(String(item.type || '').toUpperCase()) + ' · 文件大小：' + planBidEsc(item.sizeText || '—') + ' · 上传时间：' + planBidEsc(item.uploadedAt || '—') + '</p></div>'
          + '<span class="' + tagCls + '">' + tagText + '</span></div>';
      }).join('')
      : '<p class="bi-basis-view-empty">暂未上传采购依据文件。</p>';
    var summary = '采购计划【' + (plan ? planBidEsc(plan.name) : '未关联') + '】；'
      + '采购预算【' + (budget ? planBidEsc(budget.name) : '未关联') + '】；'
      + '采购依据文件【' + files.length + ' 个】';
    return ''
      + '<p class="bi-basis-view-summary">' + summary + '</p>'
      + '<div class="bi-basis-view-stack">'
      + '<div class="bi-basis-view-card"><div class="bi-basis-view-card-head">采购计划</div><div class="bi-basis-view-card-body">'
      + (plan
        ? '<p class="bi-basis-view-name">' + planBidBasisLink(rowId, 'plan', plan.name) + '</p><p class="bi-basis-view-meta">' + planMeta + '</p>'
        : '<p class="bi-basis-view-empty">本次未关联采购计划。</p>')
      + '</div></div>'
      + '<div class="bi-basis-view-card"><div class="bi-basis-view-card-head">采购预算</div><div class="bi-basis-view-card-body">'
      + (budget
        ? '<p class="bi-basis-view-name">' + planBidBasisLink(rowId, 'budget', budget.name) + '</p><p class="bi-basis-view-meta">' + budgetMeta + '</p>'
        : '<p class="bi-basis-view-empty">本次未关联采购预算。</p>')
      + '</div></div>'
      + '<div class="bi-basis-view-card"><div class="bi-basis-view-card-head">采购依据文件</div><div class="bi-basis-view-card-body">' + filesHtml + '</div></div>'
      + '</div>';
  }

  window.planBidOpenBasis = function planBidOpenBasis(id) {
    var row = planBidFindRow(id);
    if (!row) return;
    planBidEnsureBasisModal();
    document.getElementById('biModalBasisTitle').textContent = '采购依据 · ' + row.file;
    document.getElementById('biModalBasisBody').innerHTML = planBidRenderBasisViewHtml(row);
    planBidOpenModal('biModalBasis');
  };

  function planBidCfg() {
    return window.PLAN_BID_ASSIST_CONFIG || {};
  }

  function planBidIsWorkbench() {
    return !!planBidCfg().workbenchStyle;
  }

  var WB_STATUS_BADGE = {
    quoting: 'b-amber',
    pending_confirm: 'b-teal',
    ordered: 'b-green',
    terminated: 'b-slate',
    failed: 'b-red'
  };

  function planBidUpdateWorkbenchStats() {
    if (!planBidIsWorkbench()) return;
    var rows = planBidGetHistory();
    var counts = { total: rows.length, quoting: 0, pending: 0, ordered: 0, closed: 0 };
    rows.forEach(function (r) {
      if (r.status === 'quoting') counts.quoting++;
      else if (r.status === 'pending_confirm') counts.pending++;
      else if (r.status === 'ordered') counts.ordered++;
      else if (r.status === 'terminated' || r.status === 'failed') counts.closed++;
    });
    var map = {
      statTotal: counts.total,
      statQuoting: counts.quoting,
      statPending: counts.pending,
      statOrdered: counts.ordered,
      statClosed: counts.closed
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  function planBidRowBizMode(row) {
    return row.purchaseMethod || row.mode || 'bidding';
  }

  function planBidBizTypeLabel(row) {
    var mode = planBidRowBizMode(row);
    if (mode === 'direct') return '直接采购';
    if (mode === 'inquiry') return '询价采购';
    return '竞价采购';
  }

  function planBidBizTypeCls(row) {
    var mode = planBidRowBizMode(row);
    if (mode === 'direct') return 'direct';
    if (mode === 'inquiry') return 'inquiry';
    return 'bidding';
  }

  function planBidFileRowMeta(row) {
    var st = PLAN_BID_STATUS[row.status];
    var parts = [];
    if (row.uploadedAt) parts.push(row.uploadedAt.slice(0, 10).replace(/-/g, '/'));
    else if (row.deadline) parts.push(planBidFmtDeadline(row.deadline).slice(0, 10));
    if (st) parts.push(st.text);
    if (row.suppliers && row.suppliers !== '—') parts.push(planBidFmtSuppliers(row.suppliers) + '参与');
    if (row.lowest != null) parts.push('当前报价 ' + planBidFmtMoney(row.lowest));
    else if (row.budget != null) parts.push('预算 ' + planBidFmtMoney(row.budget));
    return parts.join(' · ');
  }

  function planBidFilterRows(rows) {
    if (PLAN_BID_HISTORY_FILTER === 'all') return rows;
    return rows.filter(function (row) {
      return planBidRowBizMode(row) === PLAN_BID_HISTORY_FILTER;
    });
  }

  function planBidRenderFileRow(row) {
    var ic = planBidDocIcon(row.docType);
    var bizLabel = planBidBizTypeLabel(row);
    var bizCls = planBidBizTypeCls(row);
    var meta = planBidFileRowMeta(row);
    return ''
      + '<div class="bi-file-row" data-id="' + planBidEsc(row.id) + '">'
      + '<button type="button" class="bi-file-main" onclick="planBidOpenHistoryRecord(\'' + row.id + '\')">'
      + '<div class="bi-file-icon ' + ic.cls + '"><i class="fa-solid ' + ic.icon + '"></i></div>'
      + '<div class="bi-file-info">'
      + '<div class="bi-file-name">' + planBidEsc(row.file) + '</div>'
      + '<div class="bi-file-meta">' + planBidEsc(meta) + '</div>'
      + '</div></button>'
      + '<div class="bi-file-biz"><span class="bi-biz-tag ' + bizCls + '">' + bizLabel + '</span></div>'
      + '<div class="bi-file-action">'
      + '<button type="button" class="bi-btn-progress" onclick="planBidOpenProgressDemo()">查看进度</button>'
      + '</div></div>';
  }

  function planBidRenderFileList() {
    var listEl = document.getElementById('planBidFileList');
    var empty = document.getElementById('planBidHistoryEmpty');
    if (!listEl) return;
    var rows = planBidFilterRows(planBidGetHistory());
    if (!rows.length) {
      listEl.innerHTML = '';
      listEl.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      planBidUpdateWorkbenchStats();
      return;
    }
    listEl.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    listEl.innerHTML = rows.map(planBidRenderFileRow).join('');
    planBidUpdateWorkbenchStats();
  }

  window.planBidOpenProgressDemo = function planBidOpenProgressDemo() {
    planBidOpenModal('biModalProgressDemo');
  };

  window.planBidOpenHistoryRecord = function planBidOpenHistoryRecord(id) {
    var row = planBidFindRow(id);
    if (!row) return;
    var st = PLAN_BID_STATUS[row.status];
    var titleEl = document.getElementById('biModalHistoryRecordTitle');
    var bodyEl = document.getElementById('biModalHistoryRecordBody');
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = '历史记录 · ' + row.file;
    var hasQuotes = row.quotes && row.quotes.length;
    var canStop = row.status === 'quoting' || row.status === 'pending_confirm';
    var canConfirm = row.status === 'pending_confirm' && row.lowest != null && row.lowestSupplier;
    bodyEl.innerHTML = ''
      + '<p class="bi-history-record-tip">该文件已完成分析并进入采购流程，可在此查看编号、状态与报价摘要，并继续操作。</p>'
      + '<div class="bi-history-record-grid">'
      + '<div class="bi-history-record-item"><label>业务编号</label><span>' + planBidRowCode(row) + '</span></div>'
      + '<div class="bi-history-record-item"><label>采购形式</label><span>' + planBidEsc(planBidBizTypeLabel(row)) + '</span></div>'
      + '<div class="bi-history-record-item"><label>当前状态</label><span>' + planBidEsc(st ? st.text : '—') + '</span></div>'
      + '<div class="bi-history-record-item"><label>参与供应商</label><span>' + planBidEsc(planBidFmtSuppliers(row.suppliers) || '—') + '</span></div>'
      + '<div class="bi-history-record-item"><label>报价截止</label><span>' + planBidEsc(planBidFmtDeadline(row.deadline)) + '</span></div>'
      + '<div class="bi-history-record-item"><label>预算上限</label><span>' + planBidFmtMoney(row.budget) + '</span></div>'
      + '<div class="bi-history-record-item"><label>当前报价</label><span>' + planBidFmtMoney(row.lowest) + '</span></div>'
      + '<div class="bi-history-record-item"><label>报价供应商</label><span>' + planBidEsc(row.lowestSupplier || '—') + '</span></div>'
      + '</div>'
      + '<div class="bi-history-record-actions">'
      + '<button type="button" class="bi-op-link primary" onclick="planBidCloseModal(\'biModalHistoryRecord\');planBidOpenBasis(\'' + row.id + '\')"><i class="fa-solid fa-file-lines"></i> 查看采购依据</button>'
      + '<button type="button" class="bi-op-link primary" onclick="planBidCloseModal(\'biModalHistoryRecord\');planBidOpenQuotes(\'' + row.id + '\')" ' + (!hasQuotes ? 'disabled' : '') + '><i class="fa-solid fa-list-ul"></i> 查看报价详情</button>'
      + '<button type="button" class="bi-op-link primary" onclick="planBidCloseModal(\'biModalHistoryRecord\');planBidOpenConfirm(\'' + row.id + '\')" ' + (!canConfirm ? 'disabled' : '') + '><i class="fa-solid fa-cart-plus"></i> 确认下单</button>'
      + '<button type="button" class="bi-op-link danger" onclick="planBidCloseModal(\'biModalHistoryRecord\');planBidOpenStop(\'' + row.id + '\')" ' + (!canStop ? 'disabled' : '') + '><i class="fa-solid fa-ban"></i> 停止采购</button>'
      + '</div>';
    planBidOpenModal('biModalHistoryRecord');
  };

  window.planBidSetFilter = function planBidSetFilter(mode) {
    PLAN_BID_HISTORY_FILTER = mode;
    document.querySelectorAll('.bi-filter').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === mode);
    });
    planBidRenderHistory();
  };

  window.planBidRenderHistory = function planBidRenderHistory() {
    if (!planBidIsWorkbench()) {
      planBidRenderFileList();
      return;
    }
    var tb = document.getElementById('planBidHistoryBody');
    var wrap = document.getElementById('planBidHistoryWrap');
    var empty = document.getElementById('planBidHistoryEmpty');
    if (!tb) return;
    var rows = planBidFilterRows(planBidGetHistory());
    if (!rows.length) {
      tb.innerHTML = '';
      if (wrap) wrap.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      planBidUpdateWorkbenchStats();
      return;
    }
    if (wrap) wrap.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    tb.innerHTML = rows.map(function (row) {
      var st = PLAN_BID_STATUS[row.status];
      var modeCls = row.mode === 'inquiry' ? 'inquiry' : (row.mode === 'direct' ? 'direct' : 'bidding');
      var modeText = planBidBizTypeLabel(row);
      var canStop = row.status === 'quoting' || row.status === 'pending_confirm';
      var canConfirm = row.status === 'pending_confirm' && row.lowest != null && row.lowestSupplier;
      var hasQuotes = row.quotes && row.quotes.length;
      var wb = planBidIsWorkbench();

      if (wb) {
        var modeBadge = row.mode === 'inquiry' ? 'b-blue' : 'b-teal';
        var stBadge = WB_STATUS_BADGE[row.status] || 'b-slate';
        var amtBlock = '<div class="money">' + planBidFmtMoney(row.lowest) + '</div>'
          + '<button type="button" class="btn-link-teal" onclick="planBidOpenQuotes(\'' + row.id + '\')" '
          + (!hasQuotes ? 'disabled style="opacity:.35;cursor:not-allowed"' : '') + '>查看报价详情</button>';
        return ''
          + '<tr data-id="' + row.id + '" data-status="' + row.status + '">'
          + '<td><span class="font-semibold text-slate-900">' + planBidRowCode(row) + '</span></td>'
          + planBidDocFileCellHtml(row, true)
          + '<td><span class="badge ' + modeBadge + '">' + modeText + '</span></td>'
          + '<td>' + planBidEsc(planBidFmtSuppliers(row.suppliers)) + '</td>'
          + planBidRuleColsHtml(row)
          + '<td><span class="badge ' + stBadge + '">' + st.text + '</span></td>'
          + '<td>' + amtBlock + '</td>'
          + '<td>' + (row.lowestSupplier ? planBidEsc(row.lowestSupplier) : '—') + '</td>'
          + '<td><div class="row-actions">'
          + '<button type="button" class="btn" onclick="planBidOpenBasis(\'' + row.id + '\')"><i class="fa-solid fa-file-lines"></i> 查看采购依据</button>'
          + '<button type="button" class="btn btn-danger" onclick="planBidOpenStop(\'' + row.id + '\')" ' + (!canStop ? 'disabled style="opacity:.35;cursor:not-allowed"' : '') + '><i class="fa-solid fa-ban"></i> 停止</button>'
          + '<button type="button" class="btn btn-teal" onclick="planBidOpenConfirm(\'' + row.id + '\')" ' + (!canConfirm ? 'disabled style="opacity:.35;cursor:not-allowed"' : '') + '><i class="fa-solid fa-cart-plus"></i> 确认下单</button>'
          + '</div></td>'
          + '</tr>';
      }

      var amtBlock = '<div class="bi-quote-amt">' + planBidFmtMoney(row.lowest) + '</div>'
        + '<button type="button" class="bi-quote-link" onclick="planBidOpenQuotes(\'' + row.id + '\')" '
        + (!hasQuotes ? 'disabled' : '') + '>查看报价详情</button>';
      return ''
        + '<tr data-id="' + row.id + '">'
        + '<td><span class="bi-doc-name" style="font-weight:800">' + planBidRowCode(row) + '</span></td>'
        + planBidDocFileCellHtml(row, false)
        + '<td><span class="bi-tag-mode ' + modeCls + '">' + modeText + '</span></td>'
        + '<td>' + planBidEsc(planBidFmtSuppliers(row.suppliers)) + '</td>'
        + planBidRuleColsHtml(row)
        + '<td><span class="bi-status-pill ' + st.cls + '">' + st.text + '</span></td>'
        + '<td class="bi-quote-cell">' + amtBlock + '</td>'
        + '<td>' + (row.lowestSupplier ? planBidEsc(row.lowestSupplier) : '—') + '</td>'
        + '<td><div class="bi-row-actions">'
        + '<button type="button" class="bi-op-link" onclick="planBidOpenBasis(\'' + row.id + '\')"><i class="fa-solid fa-file-lines"></i> 查看采购依据</button>'
        + '<button type="button" class="bi-op-link danger" onclick="planBidOpenStop(\'' + row.id + '\')" ' + (!canStop ? 'disabled' : '') + '><i class="fa-solid fa-ban"></i> 停止采购</button>'
        + '<button type="button" class="bi-op-link primary" onclick="planBidOpenConfirm(\'' + row.id + '\')" ' + (!canConfirm ? 'disabled' : '') + '><i class="fa-solid fa-cart-plus"></i> 确认下单</button>'
        + '</div></td>'
        + '</tr>';
    }).join('');
    planBidUpdateWorkbenchStats();
  };

  function planBidSetQuotesView(mode) {
    var backBtn = document.getElementById('biModalQuotesBack');
    var modalBox = document.getElementById('biModalQuotesBox');
    if (backBtn) backBtn.classList.toggle('hidden', mode !== 'detail');
    if (modalBox) {
      if (planBidIsWorkbench()) {
        modalBox.classList.toggle('xl', mode === 'detail');
        modalBox.classList.toggle('lg', mode !== 'detail');
      } else {
        modalBox.classList.toggle('bi-modal-detail', mode === 'detail');
      }
    }
  }

  function planBidRenderQuoteList(rowId) {
    var row = planBidFindRow(rowId);
    if (!row || !row.quotes || !row.quotes.length) return;
    PLAN_BID_QUOTES_ROW_ID = rowId;
    planBidSetQuotesView('list');
    document.getElementById('biModalQuotesTitle').textContent = '报价详情 · ' + row.file;
    var sorted = planBidSortQuotes(row.quotes);
    var summaryLow = row.lowest != null ? planBidFmtMoney(row.lowest) : '—';
    var summarySup = row.lowestSupplier ? planBidEsc(row.lowestSupplier) : '—';
    var rowsHtml = sorted.map(function (q, idx) {
      var detailBtnCls = planBidIsWorkbench() ? 'btn-link-teal' : 'bi-quote-detail-btn';
      var rowCls = planBidIsWorkbench() ? 'quote-row' : 'bi-quote-row';
      var validCls = planBidIsWorkbench() ? 'flag-valid' : 'bi-flag-valid';
      var invalidCls = planBidIsWorkbench() ? 'flag-invalid' : 'bi-flag-invalid';
      return ''
        + '<div class="' + rowCls + '">'
        + '<div class="t-time">' + planBidEsc(q.time) + '</div>'
        + '<div class="t-sup">' + planBidEsc(q.supplier) + '</div>'
        + '<div class="t-amt">' + planBidFmtMoney(q.amount) + '</div>'
        + '<div class="t-detail"><button type="button" class="' + detailBtnCls + '" onclick="planBidOpenQuoteItems(\'' + rowId + '\',' + idx + ')"><i class="fa-solid fa-list-ul"></i> 查看详情</button></div>'
        + '<div class="t-flag">' + (q.valid ? '<span class="' + validCls + '">有效</span>' : '<span class="' + invalidCls + '">无效</span>') + '</div>'
        + '</div>';
    }).join('');
    var summaryCls = planBidIsWorkbench() ? 'quote-summary' : 'bi-quote-summary';
    var hintCls = planBidIsWorkbench() ? 'quote-hint' : 'bi-quote-sort-hint';
    var rowsWrapCls = planBidIsWorkbench() ? 'quote-rows' : 'bi-quote-rows';
    document.getElementById('biModalQuotesBody').innerHTML = ''
      + '<div class="' + summaryCls + '"><b>当前有效最低价：</b>' + summaryLow
      + '　<b>报价供应商：</b>' + summarySup + '</div>'
      + '<div class="' + hintCls + '"><i class="fa-regular fa-clock"></i> 多轮报价按报价时间从新到旧排序（不按供应商分组）</div>'
      + '<div class="' + rowsWrapCls + '">' + rowsHtml + '</div>';
  }

  window.planBidOpenQuotes = function planBidOpenQuotes(id) {
    planBidRenderQuoteList(id);
    planBidOpenModal('biModalQuotes');
  };

  window.planBidBackToQuoteList = function planBidBackToQuoteList() {
    if (!PLAN_BID_QUOTES_ROW_ID) return;
    planBidRenderQuoteList(PLAN_BID_QUOTES_ROW_ID);
  };

  window.planBidCloseQuotesModal = function planBidCloseQuotesModal() {
    planBidCloseModal('biModalQuotes');
    PLAN_BID_QUOTES_ROW_ID = null;
    planBidSetQuotesView('list');
  };

  window.planBidOpenQuoteItems = function planBidOpenQuoteItems(rowId, quoteIndex) {
    var row = planBidFindRow(rowId);
    var quote = planBidFindQuoteByIndex(rowId, quoteIndex);
    if (!row || !quote) return;
    PLAN_BID_QUOTES_ROW_ID = rowId;
    planBidSetQuotesView('detail');
    var items = planBidBuildQuoteItems(row, quote);
    document.getElementById('biModalQuotesTitle').textContent = '商品报价明细 · ' + quote.supplier;
    var metaCls = planBidIsWorkbench() ? 'item-meta' : 'bi-detail-meta';
    var tableWrapCls = planBidIsWorkbench() ? 'item-table-wrap' : 'bi-item-table-wrap';
    var tableCls = planBidIsWorkbench() ? 'item-table' : 'bi-item-table';
    document.getElementById('biModalQuotesBody').innerHTML = ''
      + '<div class="' + metaCls + '">'
      + '供应商 <strong style="color:#0f172a">' + planBidEsc(quote.supplier) + '</strong>'
      + ' · 报价时间 ' + planBidEsc(quote.time)
      + '</div>'
      + '<div class="' + tableWrapCls + '"><table class="' + tableCls + '">'
      + '<colgroup>'
      + '<col class="col-name"><col class="col-spec"><col class="col-qty">'
      + '<col class="col-ref"><col class="col-price"><col class="col-sub">'
      + '</colgroup>'
      + '<thead><tr>'
      + '<th>商品名称</th><th>规格</th><th>数量</th>'
      + '<th class="t-money-h">平台参考价</th><th class="t-money-h">报价</th><th class="t-money-h">小计</th>'
      + '</tr></thead><tbody>'
      + items.map(function (it) {
        return ''
          + '<tr>'
          + '<td><strong>' + planBidEsc(it.name) + '</strong></td>'
          + '<td>' + planBidEsc(it.spec) + '</td>'
          + '<td class="t-qty">' + it.qty + ' ' + planBidEsc(it.unit) + '</td>'
          + '<td class="t-max t-money">' + planBidFmtMoney(it.maxPrice) + '</td>'
          + '<td class="t-price t-money">' + planBidFmtMoney(it.price) + '</td>'
          + '<td class="t-sub t-money">' + planBidFmtMoney(it.subtotal) + '</td>'
          + '</tr>';
      }).join('')
      + '</tbody></table></div>'
      + planBidRenderQuoteSupplementHtml(row, quote, planBidIsWorkbench());
    if (!document.getElementById('biModalQuotes').classList.contains('open')) {
      planBidOpenModal('biModalQuotes');
    }
  };

  window.planBidOpenConfirm = function planBidOpenConfirm(id) {
    var row = planBidFindRow(id);
    if (!row || row.status !== 'pending_confirm' || row.lowest == null || !row.lowestSupplier) return;
    PLAN_BID_PENDING_CONFIRM = id;
    document.getElementById('biModalConfirmBody').innerHTML = ''
      + '<p style="margin:0 0 10px;">确认以<strong style="color:#0f172a">当前有效最低价 ' + planBidFmtMoney(row.lowest) + '</strong>，向供应商<strong style="color:#0f766e">「' + planBidEsc(row.lowestSupplier) + '」</strong>下单吗？</p>'
      + '<p style="margin:0;font-size:13px;color:#64748b;">采购文件：<strong style="color:#334155">' + planBidEsc(row.file) + '</strong></p>';
    document.getElementById('biModalConfirmOk').onclick = function () { planBidExecConfirm(); };
    planBidOpenModal('biModalConfirm');
  };

  function planBidExecConfirm() {
    var id = PLAN_BID_PENDING_CONFIRM;
    planBidCloseModal('biModalConfirm');
    if (!id) return;
    var row = planBidFindRow(id);
    if (row) {
      row.status = 'ordered';
      alert('已确认下单（演示）：' + row.file);
      planBidRenderHistory();
    }
    PLAN_BID_PENDING_CONFIRM = null;
  }

  window.planBidOpenStop = function planBidOpenStop(id) {
    var row = planBidFindRow(id);
    if (!row || (row.status !== 'quoting' && row.status !== 'pending_confirm')) return;
    PLAN_BID_PENDING_STOP = id;
    document.getElementById('biModalStopBody').innerHTML = ''
      + '<p style="margin:0;">确认停止采购并结束本轮报价吗？停止后供应商将无法继续报价。</p>'
      + '<p style="margin:12px 0 0;font-size:13px;color:#64748b;">采购文件：<strong style="color:#334155">' + planBidEsc(row.file) + '</strong></p>';
    document.getElementById('biModalStopOk').onclick = function () { planBidExecStop(); };
    planBidOpenModal('biModalStop');
  };

  function planBidExecStop() {
    var id = PLAN_BID_PENDING_STOP;
    planBidCloseModal('biModalStop');
    if (!id) return;
    var row = planBidFindRow(id);
    if (row) {
      row.status = 'terminated';
      alert('已停止采购（演示）：' + row.file);
      planBidRenderHistory();
    }
    PLAN_BID_PENDING_STOP = null;
  }

  window.planBidOpenModal = function planBidOpenModal(domId) {
    var el = document.getElementById(domId);
    if (el) el.classList.add('open');
  };

  window.planBidCloseModal = function planBidCloseModal(domId) {
    var el = document.getElementById(domId);
    if (el) el.classList.remove('open');
  };

  document.addEventListener('DOMContentLoaded', function () {
    planBidEnsureBasisModal();
    planBidRenderHistory();
    var f = document.getElementById('planBidAssistantFile');
    if (f) {
      f.addEventListener('change', function () {
        if (!this.files || !this.files[0]) return;
        var fileName = this.files[0].name;
        var cfg = window.PLAN_BID_ASSIST_CONFIG || {};
        try {
          sessionStorage.removeItem('bidAssistProductLaunch');
          sessionStorage.setItem('bidAssistDemo', JSON.stringify({
            file: fileName,
            uploadedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
            budget: 90000
          }));
          if (cfg.returnUrl) {
            sessionStorage.setItem('bidAssistReturnUrl', cfg.returnUrl);
          } else {
            sessionStorage.removeItem('bidAssistReturnUrl');
          }
        } catch (e) {}
        window.location.href = cfg.resultUrl || './pages-new/bid_assist_result.html';
      });
    }
  });
})();
