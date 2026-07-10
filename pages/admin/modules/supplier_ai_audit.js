/**
 * 运营商后台 — 供应商 AI 资质审核（基于企查查合作风险排查）
 * 规则见 qcc_risk_engine.js；演示数据见 qcc_mock_data.js
 */
(function (global) {
  let ctx = {};
  let isAuditRunning = false;
  let lastEvaluation = null;
  let auditTimers = [];

  function showDialog(opts) {
    if (typeof ctx.showDialog === 'function') ctx.showDialog(opts);
  }

  function getSupplierInfo() {
    return typeof ctx.getSupplierInfo === 'function' ? ctx.getSupplierInfo() : {};
  }

  function getSearchKey(info) {
    return (info.creditCode || info.companyName || '').trim();
  }

  const DASH_STYLE_ID = 'supplierAiAuditDashboardStyle';

  function ensureDashboardStyles() {
    if (document.getElementById(DASH_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = DASH_STYLE_ID;
    style.textContent = `
      .ai-audit-inline-loading{display:none;margin-top:16px;padding-top:16px;border-top:1px solid #f1f5f9}
      .ai-audit-inline-loading.show{display:block}
      .ai-audit-inline-loading-row{display:flex;align-items:center;gap:10px;font-size:13px;color:#475569;font-weight:600}
      .ai-audit-inline-bar{margin-top:12px;height:6px;border-radius:999px;background:#e2e8f0;overflow:hidden}
      .ai-audit-inline-bar>div{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#6366f1,#2563eb);transition:width .4s ease}
      .ai-audit-dash-layout{display:grid;grid-template-columns:minmax(320px,360px) 1fr;gap:20px;align-items:start}
      .ai-audit-dash-side{display:flex;flex-direction:column;gap:14px;min-width:0}
      .ai-summary-style-c{border-radius:16px;padding:14px 16px;border:1px solid #e2e8f0;background:#fff;display:flex;gap:12px;align-items:flex-start}
      .ai-summary-style-c .ai-summary-c-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
      .ai-summary-style-c.pass{border-color:#bbf7d0;background:#f0fdf4}
      .ai-summary-style-c.pass .ai-summary-c-icon{background:#dcfce7;color:#16a34a}
      .ai-summary-style-c.warn{border-color:#fde68a;background:#fffbeb}
      .ai-summary-style-c.warn .ai-summary-c-icon{background:#fef3c7;color:#d97706}
      .ai-summary-style-c.high{border-color:#fecaca;background:#fef2f2}
      .ai-summary-style-c.high .ai-summary-c-icon{background:#fee2e2;color:#dc2626}
      .ai-summary-style-c .ai-summary-c-title{font-size:13px;font-weight:800;color:#0f172a;margin-bottom:4px}
      .ai-summary-style-c .ai-summary-c-text{font-size:12px;line-height:1.7;color:#475569;font-weight:600}
      .ai-audit-dash-info{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px}
      .ai-audit-dash-info-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;line-height:1.9;color:#475569}
      .ai-audit-dash-info-row strong{color:#0f172a;font-weight:600;flex-shrink:0}
      .ai-audit-dash-info-row span{text-align:right;color:#334155;word-break:break-all}
      .ai-audit-dash-radar{background:linear-gradient(180deg,#f8fafc 0%,#fff 100%);border:1px solid #e2e8f0;border-radius:14px;padding:14px 8px 12px;display:flex;flex-direction:column;align-items:center;overflow:visible}
      .ai-audit-dash-radar canvas{display:block;width:100%;max-width:320px;height:auto}
      .ai-audit-dash-ratio{text-align:center;padding:12px 0 4px}
      .ai-audit-dash-ratio .num{font-size:32px;font-weight:900;color:#2563eb;line-height:1}
      .ai-audit-dash-ratio .lbl{font-size:12px;color:#64748b;margin-top:4px}
      .ai-audit-dash-ratio .foot{font-size:11px;color:#94a3b8;margin-top:8px;line-height:1.6}
      .ai-audit-dash-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
      .ai-audit-dash-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;min-height:148px}
      .ai-audit-dash-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}
      .ai-audit-dash-card-title{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:800;color:#0f172a}
      .ai-audit-dash-card-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;flex-shrink:0}
      .ai-audit-dash-status{padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}
      .ai-audit-dash-status.pass{background:#dcfce7;color:#166534}
      .ai-audit-dash-status.low{background:#e0f2fe;color:#0369a1}
      .ai-audit-dash-status.mid{background:#fef3c7;color:#b45309}
      .ai-audit-dash-status.high{background:#fee2e2;color:#b91c1c}
      .ai-audit-dash-card-label{font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px}
      .ai-audit-dash-card-text{font-size:12px;color:#475569;line-height:1.75}
      .ai-audit-dash-ref{font-size:11px;color:#94a3b8;margin-top:8px}
      @media(max-width:1024px){.ai-audit-dash-layout{grid-template-columns:1fr}.ai-audit-dash-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureInlineLoadingEl() {
    let el = document.getElementById('aiAuditInlineLoading');
    if (el) return el;
    const module = document.getElementById('aiAuditModule') || document.getElementById('resultSection')?.parentElement;
    if (!module) return null;
    el = document.createElement('div');
    el.id = 'aiAuditInlineLoading';
    el.className = 'ai-audit-inline-loading';
    el.innerHTML = `
      <div class="ai-audit-inline-loading-row">
        <i class="fas fa-spinner fa-spin text-blue-500"></i>
        <span id="aiAuditInlineLoadingText">正在查询企查查企业风险数据…</span>
      </div>
      <div class="ai-audit-inline-bar"><div id="aiAuditInlineProgressBar"></div></div>
    `;
    const result = document.getElementById('resultSection');
    if (result) module.insertBefore(el, result);
    else module.appendChild(el);
    return el;
  }

  function setInlineLoading(show, text, progress) {
    ensureDashboardStyles();
    const el = ensureInlineLoadingEl();
    if (!el) return;
    el.classList.toggle('show', !!show);
    const textEl = document.getElementById('aiAuditInlineLoadingText');
    const bar = document.getElementById('aiAuditInlineProgressBar');
    if (textEl && text) textEl.textContent = text;
    if (bar && typeof progress === 'number') bar.style.width = progress + '%';
  }

  function escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function levelScore(level) {
    const map = (global.QccRiskEngine && global.QccRiskEngine.LEVEL_SCORE) || { pass: 3, low: 2, mid: 1, high: 0 };
    const score = map[level];
    return typeof score === 'number' ? score : 2;
  }

  function dotColor(level) {
    const map = (global.QccRiskEngine && global.QccRiskEngine.DOT_COLOR) || {
      pass: '#16a34a', low: '#d97706', mid: '#d97706', high: '#dc2626',
    };
    return map[level] || '#2563eb';
  }

  function statusLabel(level) {
    return (global.QccRiskEngine && global.QccRiskEngine.LEVEL_LABEL[level]) || level;
  }

  function drawAuditRadar(dimensions) {
    const canvas = document.getElementById('aiAuditRadar');
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // 按容器实际宽度绘制，避免侧栏偏窄时左右标签被裁切
    const parentW = (canvas.parentElement && canvas.parentElement.clientWidth) || 320;
    const cssW = Math.max(260, Math.min(320, parentW));
    const cssH = cssW;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssW;
    const h = cssH;
    const cx = w / 2;
    const cy = h / 2;
    // 预留足够边距给四字中文标签（左右对齐时文字会向外延伸）
    const labelPad = 46;
    const maxR = Math.min(w, h) / 2 - labelPad;
    const n = dimensions.length;
    const angleStep = (Math.PI * 2) / n;
    const maxScore = 3;
    ctx2d.clearRect(0, 0, w, h);

    for (let level = 1; level <= maxScore; level++) {
      const r = (maxR * level) / maxScore;
      ctx2d.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
      }
      ctx2d.closePath();
      ctx2d.strokeStyle = '#e2e8f0';
      ctx2d.lineWidth = 1;
      ctx2d.stroke();
    }

    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx2d.beginPath();
      ctx2d.moveTo(cx, cy);
      ctx2d.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
      ctx2d.strokeStyle = '#eef2f7';
      ctx2d.lineWidth = 1;
      ctx2d.stroke();
    }

    const points = dimensions.map((dim, idx) => {
      const score = levelScore(dim.level);
      const angle = idx * angleStep - Math.PI / 2;
      const r = (score / maxScore) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), dim };
    });

    ctx2d.beginPath();
    points.forEach((p, idx) => {
      idx === 0 ? ctx2d.moveTo(p.x, p.y) : ctx2d.lineTo(p.x, p.y);
    });
    ctx2d.closePath();
    ctx2d.fillStyle = 'rgba(37,99,235,0.14)';
    ctx2d.fill();
    ctx2d.strokeStyle = '#2563eb';
    ctx2d.lineWidth = 2.5;
    ctx2d.stroke();

    // 按风险等级着色的点：绿=通过，黄=中/低风险，红=高风险
    points.forEach(p => {
      const color = dotColor(p.dim.level);
      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx2d.fillStyle = '#fff';
      ctx2d.fill();
      ctx2d.strokeStyle = color;
      ctx2d.lineWidth = 2.5;
      ctx2d.stroke();
      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
      ctx2d.fillStyle = color;
      ctx2d.fill();
    });

    ctx2d.font = '600 12px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx2d.fillStyle = '#334155';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'middle';
    dimensions.forEach((dim, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const labelR = maxR + 24;
      let x = cx + labelR * Math.cos(angle);
      let y = cy + labelR * Math.sin(angle);
      const tw = ctx2d.measureText(dim.name).width;
      const half = tw / 2 + 2;
      // 将标签锚点钳制在画布内，避免左右文字被裁切
      x = Math.max(half, Math.min(w - half, x));
      y = Math.max(12, Math.min(h - 12, y));
      ctx2d.fillText(dim.name, x, y);
    });
  }

  function renderSummaryHtml(ev) {
    const summaryCase = ev.summaryCase || (ev.blocked ? 'high' : (ev.counts.mid || ev.counts.low ? 'warn' : 'pass'));
    const text = escHtml(ev.summaryText);
    if (summaryCase === 'high') {
      return `
        <div class="ai-summary-style-c high">
          <div class="ai-summary-c-icon"><i class="fas fa-circle-xmark"></i></div>
          <div>
            <div class="ai-summary-c-title">综合提示 · 高风险</div>
            <div class="ai-summary-c-text">${text}</div>
          </div>
        </div>`;
    }
    if (summaryCase === 'warn') {
      return `
        <div class="ai-summary-style-c warn">
          <div class="ai-summary-c-icon"><i class="fas fa-triangle-exclamation"></i></div>
          <div>
            <div class="ai-summary-c-title">综合提示 · 中低风险</div>
            <div class="ai-summary-c-text">${text}</div>
          </div>
        </div>`;
    }
    return `
      <div class="ai-summary-style-c pass">
        <div class="ai-summary-c-icon"><i class="fas fa-circle-check"></i></div>
        <div>
          <div class="ai-summary-c-title">综合提示 · 全部通过</div>
          <div class="ai-summary-c-text">${text}</div>
        </div>
      </div>`;
  }

  function renderResultSection(evaluation) {
    ensureDashboardStyles();
    const ev = evaluation || lastEvaluation;
    if (!ev || !ev.ok) return;

    lastEvaluation = ev;
    const dimensions = ev.dimensions;
    const radarDims = ev.radarDimensions || dimensions.filter(d => d.inRadar !== false);
    const passCount = ev.counts.pass;
    const total = ev.counts.total;

    const dash = document.getElementById('aiAuditDashboard');
    if (!dash) return;
    dash.innerHTML = `
      <div class="ai-audit-dash-layout">
        <aside class="ai-audit-dash-side">
          ${renderSummaryHtml(ev)}
          <div class="ai-audit-dash-info">
            ${ev.companyInfo.map(([k, v]) => `
              <div class="ai-audit-dash-info-row"><strong>${escHtml(k)}</strong><span>${escHtml(v)}</span></div>
            `).join('')}
          </div>
          <div class="ai-audit-dash-radar">
            <canvas id="aiAuditRadar" width="320" height="320" aria-label="六维合作风险雷达图"></canvas>
            <div class="ai-audit-dash-ratio">
              <div class="num">${passCount}/${total}</div>
              <div class="lbl">通过项 / 检测总数</div>
              <div class="foot">高风险 ${ev.counts.high} · 中风险 ${ev.counts.mid} · 低风险 ${ev.counts.low}</div>
            </div>
          </div>
        </aside>
        <div class="ai-audit-dash-grid">
          ${dimensions.map(dim => `
            <div class="ai-audit-dash-card">
              <div class="ai-audit-dash-card-head">
                <div class="ai-audit-dash-card-title">
                  <span class="ai-audit-dash-card-icon" style="background:${dim.color}"><i class="fas ${dim.icon}"></i></span>
                  ${escHtml(dim.name)}
                </div>
                ${dim.showBadge === false
                  ? ''
                  : `<span class="ai-audit-dash-status ${dim.level}">${statusLabel(dim.level)}</span>`}
              </div>
              <div class="ai-audit-dash-card-label">数据摘要</div>
              <div class="ai-audit-dash-card-text">${dim.lines.map(l => escHtml(l)).join('<br>')}</div>
              ${dim.inRadar === false
                ? '<div class="ai-audit-dash-ref">仅展示参考，不参与六维图与入驻阻断判定</div>'
                : (dim.refOnly ? '<div class="ai-audit-dash-ref">仅展示参考，不参与入驻阻断判定</div>' : '')}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('resultSection').classList.remove('hidden');
    drawAuditRadar(radarDims);
  }

  function startAiAudit() {
    if (isAuditRunning) return;
    if (!global.QccRiskEngine || !global.QccMockData) {
      showDialog({ title: '提示', message: '企查查审核模块未加载，请刷新页面后重试。', type: 'error', confirmText: '确定' });
      return;
    }

    const info = getSupplierInfo();
    const searchKey = getSearchKey(info);
    if (!searchKey) {
      showDialog({
        title: '提示',
        message: '请先填写企业名称或统一社会信用代码，再启动 AI 资质审核。',
        type: 'warn',
        confirmText: '确定',
      });
      return;
    }

    const resultSection = document.getElementById('resultSection');
    if (resultSection) resultSection.classList.add('hidden');
    lastEvaluation = null;

    isAuditRunning = true;
    const btn = document.getElementById('aiAuditBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>审核中...</span>';
    }

    // 模块内加载，不弹窗
    setInlineLoading(true, '正在查询企查查企业风险数据…', 18);

    const t1 = window.setTimeout(() => {
      setInlineLoading(true, '正在按六维规则核验合作风险…', 55);
    }, 450);
    auditTimers.push(t1);

    const t2 = window.setTimeout(() => {
      const payload = global.QccMockData.fetchMock(searchKey, {
        supplierId: info.supplierId,
        companyName: info.companyName,
        creditCode: info.creditCode,
        legalPerson: info.legalPerson,
        address: info.address,
      });
      const evaluation = global.QccRiskEngine.evaluate(payload);

      isAuditRunning = false;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-shield-halved"></i><span>AI资质审核</span>';
      }
      setInlineLoading(false, '', 0);

      if (!evaluation.ok) {
        showDialog({
          title: '无法查询到企业信息',
          message: evaluation.message,
          type: 'warn',
          confirmText: '知道了',
        });
        return;
      }

      renderResultSection(evaluation);
      const panel = document.getElementById('resultSection');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1400);
    auditTimers.push(t2);
  }

  function closeComplianceModal() {
    const overlay = document.getElementById('complianceOverlay');
    if (overlay) overlay.classList.remove('show');
  }

  function getLastEvaluation() {
    return lastEvaluation;
  }

  function isBlocked() {
    return !!(lastEvaluation && lastEvaluation.ok && lastEvaluation.blocked);
  }

  function hasEvaluation() {
    return !!(lastEvaluation && lastEvaluation.ok);
  }

  function init(context) {
    ctx = context || {};
    auditTimers.forEach(t => clearTimeout(t));
    auditTimers = [];
    isAuditRunning = false;
    lastEvaluation = null;
    setInlineLoading(false, '', 0);
  }

  function openAssistant() {
    showDialog({
      title: '提示',
      message: '当前 AI 资质审核已切换为企查查合作风险排查。请查看下方六维分析结果；资质文件由运营人工核验。',
      type: 'info',
      confirmText: '知道了',
    });
  }
  function closeAssistant() {
    const el = document.getElementById('assistantOverlay');
    if (el) el.classList.remove('show');
  }
  function notifySupplier() { closeAssistant(); }
  function rejectQual() { closeAssistant(); }
  function approveQual() { closeAssistant(); }
  function selectQueueItem() {}
  function toggleIssueAdopt() {}

  global.SupplierAiAuditModule = {
    init,
    startAiAudit,
    renderResultSection,
    getLastEvaluation,
    isBlocked,
    hasEvaluation,
    selectQueueItem,
    openAssistant,
    closeComplianceModal,
    closeAssistant,
    notifySupplier,
    rejectQual,
    approveQual,
    toggleIssueAdopt,
  };

  global.startAiAudit = startAiAudit;
  global.closeComplianceModal = closeComplianceModal;
  global.closeAssistant = closeAssistant;
  global.notifySupplier = notifySupplier;
  global.rejectQual = rejectQual;
  global.approveQual = approveQual;
})(window);
