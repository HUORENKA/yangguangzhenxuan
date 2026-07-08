(function () {
  var STYLE_ID = 'gcCapabilityAnalysisStyle';
  var MODAL_ID = 'capabilityModal';
  var loadTimer = null;
  var stepTimer = null;
  var currentData = null;

  var LOADING_STEPS = [
    '正在读取企业资质与信用认证数据...',
    '正在评估合同履约与商品质量...',
    '正在生成六维能力雷达图...',
    '正在输出 AI 综合分析结论...'
  ];

  var DEFAULT_DIMENSIONS = [
    { key: 'qualification', name: '资质合规', score: 96, icon: 'fa-shield-halved', color: '#2563eb', summary: '营业执照、行业许可、信用认证资料齐全，无重大违规记录。' },
    { key: 'fulfillment', name: '合同履约能力', score: 94, icon: 'fa-file-contract', color: '#059669', summary: '合同准时履约率 98.6%，大单履约经验丰富，物流覆盖全国重点区域。' },
    { key: 'quality', name: '商品质量', score: 91, icon: 'fa-medal', color: '#d97706', summary: '正品保障体系完善，退换货率低于行业均值，用户好评率 97.2%。' },
    { key: 'price', name: '价格竞争力', score: 88, icon: 'fa-tags', color: '#7c3aed', summary: '同类商品比价处于较优区间，批量采购议价空间合理。' },
    { key: 'service', name: '售后服务', score: 90, icon: 'fa-headset', color: '#0891b2', summary: '7×12 小时客服响应，售后工单平均处理时长 4.2 小时。' },
    { key: 'credit', name: '信用评价', score: 95, icon: 'fa-star', color: '#e11d48', summary: '平台信用分 950/1000，连续 3 年获「优质供应商」认证。' }
  ];

  function getDefaultAnalysis(options) {
    options = options || {};
    var scoreMap = { pass: { overallScore: 92, grade: 'A+' }, warn: { overallScore: 78, grade: 'B+' }, fail: { overallScore: 62, grade: 'C' }, none: { overallScore: 70, grade: 'B' } };
    var base = scoreMap[options.aiResult] || scoreMap.pass;
    return {
      overallScore: base.overallScore,
      grade: base.grade,
      aiSummary: options.aiSummary || '该企业综合合同履约能力优秀，资质合规与信用评价均处于平台前列。商品质量稳定、价格竞争力较强，售后响应及时，适合纳入政企集采优选供应商名录。',
      dimensions: DEFAULT_DIMENSIONS.map(function (d) { return Object.assign({}, d); }),
      highlights: options.highlights || [
        '连续 12 个月零重大投诉',
        '政采类目 TOP 5% 供应商',
        '支持电子合同与区块链存证'
      ],
      updatedAt: options.updatedAt || '2026-07-07'
    };
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = ''
      + '.modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);z-index:2000;display:none;align-items:center;justify-content:center;padding:20px}'
      + '.modal-overlay.show{display:flex}'
      + '.capability-modal{background:#fff;border-radius:20px;max-width:920px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(15,23,42,.22);position:relative}'
      + '.capability-modal-header{padding:20px 24px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#eff6ff 0%,#f0f9ff 50%,#faf5ff 100%);border-radius:20px 20px 0 0}'
      + '.capability-modal-title{display:flex;align-items:center;gap:12px}'
      + '.capability-modal-title-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#2563eb);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 8px 18px rgba(37,99,235,.25)}'
      + '.capability-modal-title h3{font-size:18px;font-weight:800;color:#0f172a;margin:0}'
      + '.capability-modal-title p{font-size:12px;color:#64748b;margin:2px 0 0}'
      + '.capability-modal .modal-close{width:36px;height:36px;border:none;background:rgba(255,255,255,.8);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;transition:all .2s}'
      + '.capability-modal .modal-close:hover{background:#fff;color:#1e293b;box-shadow:0 4px 12px rgba(0,0,0,.08)}'
      + '.capability-modal-body{padding:24px;position:relative;min-height:360px}'
      + '.capability-loading{display:none;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px 56px;min-height:360px}'
      + '.capability-loading.show{display:flex}'
      + '.capability-loading-icon{width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#6366f1,#2563eb);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 12px 28px rgba(37,99,235,.28);animation:gcCapPulse 1.6s ease-in-out infinite}'
      + '@keyframes gcCapPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}'
      + '.capability-loading-title{margin-top:20px;font-size:17px;font-weight:700;color:#0f172a}'
      + '.capability-loading-step{margin-top:8px;font-size:13px;color:#64748b;min-height:20px}'
      + '.capability-loading-bar{width:min(320px,100%);height:6px;margin-top:24px;background:#e2e8f0;border-radius:999px;overflow:hidden}'
      + '.capability-loading-bar-fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#6366f1,#2563eb,#0891b2);background-size:200% 100%;animation:gcCapBarShine 1.2s linear infinite;transition:width .4s ease}'
      + '@keyframes gcCapBarShine{0%{background-position:100% 0}100%{background-position:-100% 0}}'
      + '.capability-loading-dots{display:flex;gap:6px;margin-top:16px}'
      + '.capability-loading-dots span{width:7px;height:7px;border-radius:50%;background:#93c5fd;animation:gcCapDot 1.2s ease-in-out infinite}'
      + '.capability-loading-dots span:nth-child(2){animation-delay:.15s}'
      + '.capability-loading-dots span:nth-child(3){animation-delay:.3s}'
      + '@keyframes gcCapDot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}'
      + '.capability-modal-content.is-hidden{display:none}'
      + '.capability-overview{display:grid;grid-template-columns:minmax(300px,320px) 1fr;gap:24px;margin-bottom:24px;align-items:stretch}'
      + '.capability-radar-wrap{background:linear-gradient(180deg,#f8fafc 0%,#fff 100%);border:1px solid #e5e7eb;border-radius:16px;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:280px;overflow:visible}'
      + '.capability-radar-wrap canvas{display:block;max-width:100%;height:auto}'
      + '.capability-score-badge{text-align:center;flex-shrink:0}'
      + '.capability-score-value{font-size:36px;font-weight:900;background:linear-gradient(135deg,#2563eb,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}'
      + '.capability-score-label{font-size:12px;color:#64748b;margin-top:2px}'
      + '.capability-grade{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:12px;font-weight:700}'
      + '.capability-ai-summary{background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);border:1px solid #dbeafe;border-radius:14px;padding:16px 18px;display:flex;flex-direction:column}'
      + '.capability-ai-summary-top{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:12px}'
      + '.capability-ai-summary-left{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}'
      + '.capability-ai-summary-head{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#1d4ed8}'
      + '.capability-ai-summary p{font-size:14px;color:#334155;line-height:1.75;margin:0}'
      + '.capability-highlights{display:flex;flex-wrap:wrap;gap:6px}'
      + '.capability-highlight-chip{padding:6px 12px;border-radius:999px;background:#fff;border:1px solid #bfdbfe;color:#1e40af;font-size:12px;font-weight:600}'
      + '.capability-dimensions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}'
      + '.capability-dim-card{border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#fff}'
      + '.capability-dim-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}'
      + '.capability-dim-name{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#0f172a}'
      + '.capability-dim-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff}'
      + '.capability-dim-score{font-size:20px;font-weight:800;color:#2563eb}'
      + '.capability-dim-bar{height:6px;background:#f1f5f9;border-radius:999px;overflow:hidden;margin-bottom:8px}'
      + '.capability-dim-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#2563eb,#6366f1)}'
      + '.capability-dim-summary{font-size:12px;color:#64748b;line-height:1.6;margin:0}'
      + '.capability-info-section{margin-bottom:24px}'
      + '.capability-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin-bottom:16px}'
      + '.capability-info-grid p{margin:0;font-size:13px;line-height:1.8}'
      + '.capability-cert-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:4px}'
      + '.capability-cert-card{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff}'
      + '.capability-cert-label{padding:10px 14px;font-size:13px;font-weight:700;color:#334155;background:#f8fafc;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:6px}'
      + '.capability-cert-label i{color:#2563eb;font-size:12px}'
      + '.capability-cert-img-wrap{padding:12px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:180px}'
      + '.capability-cert-img-wrap img{max-width:100%;max-height:220px;object-fit:contain;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.08)}'
      + '.info-section-title{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;color:#1e293b;margin-bottom:12px}'
      + '.info-section-title::before{content:"";width:4px;height:16px;background:#2563eb;border-radius:2px}'
      + '.info-section-content{background:#f8fafc;padding:14px 16px;border-radius:10px;font-size:13px;color:#475569;line-height:1.7;border:1px solid #e5e7eb}'
      + '.capability-updated{text-align:right;font-size:11px;color:#94a3b8;margin-top:16px}'
      + '@media(max-width:768px){.capability-overview{grid-template-columns:1fr}.capability-dimensions{grid-template-columns:1fr}.capability-cert-grid{grid-template-columns:1fr}.capability-info-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }

  function ensureModal() {
    if (document.getElementById(MODAL_ID)) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = ''
      + '<div id="' + MODAL_ID + '" class="modal-overlay" onclick="if(event.target===this) GcCapabilityAnalysis.close()">'
      + '  <div class="capability-modal" onclick="event.stopPropagation()">'
      + '    <div class="capability-modal-header">'
      + '      <div class="capability-modal-title">'
      + '        <div class="capability-modal-title-icon"><i class="fas fa-wand-magic-sparkles"></i></div>'
      + '        <div><h3>企业综合能力分析</h3><p id="capabilityModalSubtitle">基于 AI 多维度评估</p></div>'
      + '      </div>'
      + '      <button type="button" class="modal-close" onclick="GcCapabilityAnalysis.close()" aria-label="关闭"><i class="fas fa-times"></i></button>'
      + '    </div>'
      + '    <div class="capability-modal-body">'
      + '      <div id="capabilityLoading" class="capability-loading">'
      + '        <div class="capability-loading-icon"><i class="fas fa-wand-magic-sparkles"></i></div>'
      + '        <div class="capability-loading-title">AI 正在分析企业综合能力</div>'
      + '        <div class="capability-loading-step" id="capabilityLoadingStep">正在初始化分析引擎...</div>'
      + '        <div class="capability-loading-bar"><div class="capability-loading-bar-fill" id="capabilityLoadingBar"></div></div>'
      + '        <div class="capability-loading-dots"><span></span><span></span><span></span></div>'
      + '      </div>'
      + '      <div id="capabilityModalContent" class="capability-modal-content is-hidden">'
      + '        <div class="capability-info-section">'
      + '          <div class="info-section-title">企业基本信息</div>'
      + '          <div class="info-section-content">'
      + '            <div class="capability-info-grid">'
      + '              <p><span style="color:#64748b">企业名称：</span><span id="storeInfoCompanyName" style="color:#0f172a;font-weight:600"></span></p>'
      + '              <p><span style="color:#64748b">联系电话：</span><span id="storeInfoContactPhone" style="color:#0f172a"></span></p>'
      + '              <p><span style="color:#64748b">统一社会信用代码：</span><span id="storeInfoCreditCode" style="color:#0f172a"></span></p>'
      + '              <p><span style="color:#64748b">注册资本：</span><span id="storeInfoRegisteredCapital" style="color:#0f172a"></span></p>'
      + '              <p style="grid-column:1/-1"><span style="color:#64748b">公司地址：</span><span id="storeInfoCompanyAddress" style="color:#0f172a"></span></p>'
      + '            </div>'
      + '            <div class="capability-cert-grid">'
      + '              <div class="capability-cert-card"><div class="capability-cert-label"><i class="fas fa-id-card"></i> 企业营业执照</div><div class="capability-cert-img-wrap"><img id="storeLicenseImage" alt="企业营业执照"></div></div>'
      + '              <div class="capability-cert-card"><div class="capability-cert-label"><i class="fas fa-certificate"></i> 供应商信用认证证书</div><div class="capability-cert-img-wrap"><img id="storeCertImage" alt="供应商基本信用认证"></div></div>'
      + '            </div>'
      + '          </div>'
      + '        </div>'
      + '        <div class="capability-overview">'
      + '          <div class="capability-radar-wrap"><canvas id="capabilityRadar" width="280" height="280" aria-label="企业能力六维雷达图"></canvas></div>'
      + '          <div class="capability-ai-summary">'
      + '            <div class="capability-ai-summary-top">'
      + '              <div class="capability-ai-summary-left">'
      + '                <div class="capability-ai-summary-head"><i class="fas fa-robot"></i><span>AI 分析结论</span></div>'
      + '                <div class="capability-highlights" id="capabilityHighlights"></div>'
      + '              </div>'
      + '              <div class="capability-score-badge">'
      + '                <div class="capability-score-value" id="capabilityOverallScore">--</div>'
      + '                <div class="capability-score-label">综合评分</div>'
      + '                <span class="capability-grade" id="capabilityGrade">--</span>'
      + '              </div>'
      + '            </div>'
      + '            <p id="capabilityAiSummary"></p>'
      + '          </div>'
      + '        </div>'
      + '        <div class="capability-dimensions" id="capabilityDimensions"></div>'
      + '        <div class="capability-updated" id="capabilityUpdated"></div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(wrap.firstElementChild);
  }

  function drawRadar(dimensions) {
    var canvas = document.getElementById('capabilityRadar');
    if (!canvas || !dimensions.length) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    var w = size, h = size, cx = w / 2, cy = h / 2;
    var labelPadding = 52;
    var maxR = Math.min(w, h) / 2 - labelPadding;
    var n = dimensions.length;
    var angleStep = (Math.PI * 2) / n;
    ctx.clearRect(0, 0, w, h);
    var level, i, angle, r, x, y, cos, sin;
    for (level = 1; level <= 4; level++) {
      ctx.beginPath();
      r = (maxR * level) / 4;
      for (i = 0; i <= n; i++) {
        angle = i * angleStep - Math.PI / 2;
        x = cx + r * Math.cos(angle);
        y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (i = 0; i < n; i++) {
      angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
    }
    ctx.beginPath();
    dimensions.forEach(function (dim, idx) {
      angle = idx * angleStep - Math.PI / 2;
      r = (dim.score / 100) * maxR;
      x = cx + r * Math.cos(angle);
      y = cy + r * Math.sin(angle);
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(37,99,235,0.18)';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    dimensions.forEach(function (dim, idx) {
      angle = idx * angleStep - Math.PI / 2;
      r = (dim.score / 100) * maxR;
      ctx.beginPath();
      ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
    });
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748b';
    dimensions.forEach(function (dim, idx) {
      angle = idx * angleStep - Math.PI / 2;
      r = maxR + 30;
      x = cx + r * Math.cos(angle);
      y = cy + r * Math.sin(angle);
      cos = Math.cos(angle);
      sin = Math.sin(angle);
      if (Math.abs(cos) < 0.25) {
        ctx.textAlign = 'center';
        ctx.textBaseline = sin < 0 ? 'bottom' : 'top';
      } else if (cos > 0) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
      } else {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
      }
      ctx.fillText(dim.name, x, y);
    });
  }

  function renderContent(data) {
    var analysis = data.capabilityAnalysis || getDefaultAnalysis();
    var license = data.businessLicense || {};
    var info = data.storeInfo || {};
    document.getElementById('capabilityModalSubtitle').textContent = '基于 AI 多维度评估 · ' + (data.name || '');
    document.getElementById('capabilityOverallScore').textContent = analysis.overallScore || '--';
    document.getElementById('capabilityGrade').textContent = analysis.grade || '--';
    document.getElementById('capabilityAiSummary').textContent = analysis.aiSummary || '暂无分析数据';
    document.getElementById('capabilityUpdated').textContent = analysis.updatedAt ? '数据更新于 ' + analysis.updatedAt : '';
    document.getElementById('storeInfoCompanyName').textContent = license.companyName || info.companyName || data.name || '-';
    document.getElementById('storeInfoContactPhone').textContent = info.contactPhone || '-';
    document.getElementById('storeInfoCreditCode').textContent = license.creditCode || '-';
    document.getElementById('storeInfoRegisteredCapital').textContent = license.registeredCapital || '-';
    document.getElementById('storeInfoCompanyAddress').textContent = license.companyAddress || '-';
    document.getElementById('storeLicenseImage').src = license.licenseImage || '';
    document.getElementById('storeCertImage').src = license.certImage || '';
    document.getElementById('capabilityHighlights').innerHTML = (analysis.highlights || []).map(function (h) {
      return '<span class="capability-highlight-chip"><i class="fas fa-check-circle" style="margin-right:4px"></i>' + h + '</span>';
    }).join('');
    document.getElementById('capabilityDimensions').innerHTML = (analysis.dimensions || []).map(function (dim) {
      return ''
        + '<div class="capability-dim-card">'
        + '  <div class="capability-dim-head">'
        + '    <div class="capability-dim-name"><span class="capability-dim-icon" style="background:' + dim.color + '"><i class="fas ' + dim.icon + '"></i></span>' + dim.name + '</div>'
        + '    <span class="capability-dim-score">' + dim.score + '</span>'
        + '  </div>'
        + '  <div class="capability-dim-bar"><div class="capability-dim-bar-fill" style="width:' + dim.score + '%"></div></div>'
        + '  <p class="capability-dim-summary">' + dim.summary + '</p>'
        + '</div>';
    }).join('');
    drawRadar(analysis.dimensions || []);
  }

  function open(data) {
    ensureStyle();
    ensureModal();
    currentData = data;
    var modal = document.getElementById(MODAL_ID);
    var loading = document.getElementById('capabilityLoading');
    var content = document.getElementById('capabilityModalContent');
    var bar = document.getElementById('capabilityLoadingBar');
    var stepEl = document.getElementById('capabilityLoadingStep');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    loading.classList.add('show');
    content.classList.add('is-hidden');
    if (loadTimer) clearTimeout(loadTimer);
    if (stepTimer) clearInterval(stepTimer);
    var stepIndex = 0;
    bar.style.width = '8%';
    stepEl.textContent = LOADING_STEPS[0];
    stepTimer = setInterval(function () {
      stepIndex++;
      if (stepIndex < LOADING_STEPS.length) {
        stepEl.textContent = LOADING_STEPS[stepIndex];
        bar.style.width = ((stepIndex + 1) / LOADING_STEPS.length * 88) + '%';
      }
    }, 550);
    loadTimer = setTimeout(function () {
      if (stepTimer) { clearInterval(stepTimer); stepTimer = null; }
      bar.style.width = '100%';
      stepEl.textContent = '分析完成，正在呈现结果...';
      setTimeout(function () {
        renderContent(currentData);
        loading.classList.remove('show');
        content.classList.remove('is-hidden');
        loadTimer = null;
      }, 300);
    }, 2400);
  }

  function close() {
    if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
    if (stepTimer) { clearInterval(stepTimer); stepTimer = null; }
    var modal = document.getElementById(MODAL_ID);
    var loading = document.getElementById('capabilityLoading');
    if (loading) loading.classList.remove('show');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  function buildFromSupplier(s, assetBase) {
    assetBase = assetBase || '../../assets/';
    var aiSummaryMap = {
      pass: '该企业综合合同履约能力优秀，资质合规与信用评价均处于平台前列，适合纳入政企集采优选供应商名录。',
      warn: '该企业整体能力良好，但部分资质文件需关注整改项，建议结合人工复核后纳入采购候选。',
      fail: '该企业存在关键资质或信用风险项，建议暂缓合作并启动专项复核流程。',
      none: '企业资质尚在审核中，暂无法输出完整能力评估，请待 AI 审核完成后再次分析。'
    };
    return {
      name: s.name,
      storeInfo: { companyName: s.companyName || s.name, contactPhone: s.phone },
      businessLicense: {
        creditCode: s.creditCode,
        registeredCapital: s.registeredCapital || '—',
        companyName: s.companyName || s.name,
        companyAddress: s.address,
        licenseImage: assetBase + 'business_license.png',
        certImage: assetBase + 'credit_certification.png'
      },
      capabilityAnalysis: getDefaultAnalysis({
        aiResult: s.aiResult,
        aiSummary: aiSummaryMap[s.aiResult] || aiSummaryMap.pass
      })
    };
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  window.GcCapabilityAnalysis = {
    open: open,
    close: close,
    getDefaultAnalysis: getDefaultAnalysis,
    buildFromSupplier: buildFromSupplier
  };
})();
