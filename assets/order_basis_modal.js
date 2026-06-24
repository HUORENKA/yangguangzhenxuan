/* 关联采购依据弹窗 · 共享模块 */
(function () {
  var ORDER_BASIS_TOTAL_STEPS = 3;
  var orderBasisStep = 1;
  var selectedPlanId = '';
  var selectedBudgetId = '';
  var uploadedBasisFiles = [];
  var orderBasisListsInitialized = { plan: false, budget: false, files: false };
  var procurementPlanOptions = [];
  var procurementBudgetOptions = [];
  var _getOrderAmount = function () { return 0; };
  var _onComplete = null;
  var _confirmLabel = '确认并下单';

  var BASIS_FILE_LIMIT = 5;
  var BASIS_FILE_MAX_SIZE = 20 * 1024 * 1024;
  var BASIS_FILE_ACCEPTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

  var defaultProcurementPlans = [
    { id: 'plan-2026-q2-office', name: '2026年二季度办公耗材集中采购计划', period: '2026Q2', owner: '采购中心', planAmount: 280000, planUsed: 279872 },
    { id: 'plan-2026-special-it', name: '2026年信息化设备专项采购计划', period: '2026全年', owner: '信息化部', planAmount: 1500000, planUsed: 820000 }
  ];

  var defaultProcurementBudgets = [
    { id: 'budget-2026-q2-office', name: '办公耗材预算包', period: '2026Q2', amount: 280000, used: 279872 },
    { id: 'budget-2026-special-it', name: '信息化设备预算包', period: '2026全年', amount: 1200000, used: 820000 }
  ];

  function injectModalHtml() {
    if (document.getElementById('orderBasisOverlay')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = ''
      + '<div class="order-basis-overlay" id="orderBasisOverlay" onclick="if(event.target===this) closeOrderBasisModal()">'
      + '  <div class="order-basis-modal" onclick="event.stopPropagation()">'
      + '    <div class="order-basis-head">'
      + '      <div>'
      + '        <div class="obm-title"><i class="fa-solid fa-link" style="color:#6366f1"></i>关联采购依据</div>'
      + '        <div class="obm-subtitle">请按步骤补充本次下单的采购计划、采购预算及采购依据文件，便于后续审计追溯。</div>'
      + '      </div>'
      + '      <button class="order-basis-close" type="button" onclick="closeOrderBasisModal()" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>'
      + '    </div>'
      + '    <div class="order-basis-content">'
      + '      <div class="order-basis-steps">'
      + '        <div class="order-basis-step" id="basisStepNav1"><span class="order-basis-step-index">1</span><div><div class="order-basis-step-label">采购计划</div><div class="order-basis-step-desc">选择或跳过本次采购计划</div></div></div>'
      + '        <div class="order-basis-step" id="basisStepNav2"><span class="order-basis-step-index">2</span><div><div class="order-basis-step-label">采购预算</div><div class="order-basis-step-desc">选择或跳过本次采购预算</div></div></div>'
      + '        <div class="order-basis-step" id="basisStepNav3"><span class="order-basis-step-index">3</span><div><div class="order-basis-step-label">采购依据</div><div class="order-basis-step-desc">上传依据文件并完成下单前留痕</div></div></div>'
      + '      </div>'
      + '      <section class="basis-step-panel" id="basisStepPanel1"><div class="basis-step-card">'
      + '        <div class="basis-step-head"><div><div class="basis-step-kicker">STEP 1</div><div class="basis-step-title">选择采购计划</div>'
      + '        <div class="basis-step-desc-text">请选择本次下单关联的采购计划；如当前暂无明确计划，可先跳过。</div></div>'
      + '        <button class="basis-add-btn" type="button" onclick="addProcurementPlan()"><i class="fa-solid fa-plus"></i> 新增计划</button></div>'
      + '        <div class="basis-list" id="orderPlanList"></div></div></section>'
      + '      <section class="basis-step-panel" id="basisStepPanel2"><div class="basis-step-card">'
      + '        <div class="basis-step-head"><div><div class="basis-step-kicker">STEP 2</div><div class="basis-step-title">选择采购预算</div>'
      + '        <div class="basis-step-desc-text">请选择本次下单关联的采购预算；如预算信息稍后补充，可先跳过本步。</div></div>'
      + '        <button class="basis-add-btn" type="button" onclick="addProcurementBudget()"><i class="fa-solid fa-plus"></i> 新增预算</button></div>'
      + '        <div class="basis-list" id="orderBudgetList"></div></div></section>'
      + '      <section class="basis-step-panel" id="basisStepPanel3"><div class="basis-step-card">'
      + '        <div class="basis-step-head"><div><div class="basis-step-kicker">STEP 3</div><div class="basis-step-title">上传采购依据文件</div>'
      + '        <div class="basis-step-desc-text">支持补充采购申请单、审批单、比价截图、会议纪要等材料，用于订单留痕与后续审计追溯。</div></div></div>'
      + '        <div class="basis-upload-card"><div class="basis-upload-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>'
      + '        <div class="basis-upload-title">上传采购依据文件</div>'
      + '        <div class="basis-upload-desc">支持 pdf / doc / docx / xls / xlsx / jpg / jpeg / png，单个文件不超过 20MB，最多上传 5 个文件。</div>'
      + '        <div class="basis-upload-actions"><button class="basis-add-btn" type="button" onclick="triggerBasisFileUpload()"><i class="fa-solid fa-paperclip"></i> 上传文件</button>'
      + '        <span class="basis-upload-hint">原型阶段为本地假上传，仅展示文件名称与大小</span></div>'
      + '        <input class="basis-upload-input" id="basisFileInput" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="handleBasisFileUpload(event)"></div>'
      + '        <div class="basis-file-list" id="basisFileList"></div></div></section>'
      + '      <div class="basis-summary-tip" id="basisSelectedSummary"></div>'
      + '    </div>'
      + '    <div class="order-basis-foot">'
      + '      <div class="order-basis-foot-note">采购计划、预算可跳过；若计划、预算与依据文件均为空，下单前将二次确认。</div>'
      + '      <div class="order-basis-actions">'
      + '        <button class="btn-ghost" type="button" onclick="closeOrderBasisModal()">取消</button>'
      + '        <button class="btn-ghost" id="orderBasisPrevBtn" type="button" onclick="goPrevOrderBasisStep()">上一步</button>'
      + '        <button class="btn-ghost" id="orderBasisSkipBtn" type="button" onclick="skipOrderBasisStep()">跳过</button>'
      + '        <button class="btn-main" id="orderBasisNextBtn" type="button" onclick="goNextOrderBasisStep()">下一步</button>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(wrap.firstElementChild);
  }

  function escapeBasisText(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatBasisMoney(n) {
    return '¥' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function formatBasisFileSize(size) {
    var value = Number(size || 0);
    if (value >= 1024 * 1024) return (value / (1024 * 1024)).toFixed(1) + 'MB';
    if (value >= 1024) return Math.round(value / 1024) + 'KB';
    return value + 'B';
  }

  function formatBasisDateTime(date) {
    return new Date(date).toLocaleString('zh-CN', { hour12: false });
  }

  function loadProcurementBasisOptions() {
    try {
      var plans = JSON.parse(sessionStorage.getItem('gcProcurementPlans') || '[]');
      procurementPlanOptions = Array.isArray(plans) && plans.length ? plans : defaultProcurementPlans.slice();
    } catch (e) {
      procurementPlanOptions = defaultProcurementPlans.slice();
    }
    try {
      var budgets = JSON.parse(sessionStorage.getItem('gcProcurementBudgets') || '[]');
      procurementBudgetOptions = Array.isArray(budgets) && budgets.length ? budgets : defaultProcurementBudgets.slice();
    } catch (e) {
      procurementBudgetOptions = defaultProcurementBudgets.slice();
    }
  }

  function saveProcurementBasisOptions() {
    try {
      sessionStorage.setItem('gcProcurementPlans', JSON.stringify(procurementPlanOptions));
      sessionStorage.setItem('gcProcurementBudgets', JSON.stringify(procurementBudgetOptions));
    } catch (e) {}
  }

  function getBasisById(type, id) {
    var list = type === 'plan' ? procurementPlanOptions : procurementBudgetOptions;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function renderBasisItems(type, list, selectedId) {
    var selectHandler = type === 'plan' ? 'selectOrderPlan' : 'selectOrderBudget';
    var noneTitle = type === 'plan' ? '本次不关联采购计划' : '本次不关联采购预算';
    var noneRow = ''
      + '<button class="basis-item basis-item-none ' + (selectedId ? '' : 'active') + '" type="button" onclick="' + selectHandler + '(\'\')">'
      + '<div class="basis-item-title basis-item-title-none"><span>' + noneTitle + '</span>'
      + '<span class="basis-selected-dot"><i class="fa-solid fa-check"></i></span></div></button>';
    var rows = list.map(function (item) {
      var isSelected = selectedId === item.id;
      var meta = type === 'plan'
        ? '计划周期：' + escapeBasisText(item.period || '未填写') + ' · 提报部门：' + escapeBasisText(item.owner || '未填写') + ' · 计划总额：¥' + Number(item.planAmount || 0).toLocaleString('zh-CN')
        : '预算周期：' + escapeBasisText(item.period || '未填写') + ' · 预算金额：¥' + Number(item.amount || 0).toLocaleString('zh-CN') + ' · 已执行：¥' + Number(item.used || 0).toLocaleString('zh-CN');
      return ''
        + '<button class="basis-item ' + (isSelected ? 'active' : '') + '" type="button" onclick="' + selectHandler + '(\'' + escapeBasisText(item.id) + '\')">'
        + '<div class="basis-item-title"><span>' + escapeBasisText(item.name) + '</span>'
        + '<span class="basis-selected-dot"><i class="fa-solid fa-check"></i></span></div>'
        + '<div class="basis-item-meta">' + meta + '</div></button>';
    }).join('');
    return noneRow + rows;
  }

  function buildBasisAssociationFootnote() {
    var selectedPlan = getBasisById('plan', selectedPlanId);
    var selectedBudget = getBasisById('budget', selectedBudgetId);
    var planLabel = selectedPlan ? escapeBasisText(selectedPlan.name) : '未关联';
    var budgetLabel = selectedBudget ? escapeBasisText(selectedBudget.name) : '未关联';
    return '关联概况：采购计划【' + planLabel + '】；采购预算【' + budgetLabel + '】；采购依据文件【' + uploadedBasisFiles.length + '个】';
  }

  function renderBasisSelectedSummary() {
    var el = document.getElementById('basisSelectedSummary');
    if (!el) return;
    var orderAmt = _getOrderAmount();
    var foot = '<div class="basis-summary-sub">' + buildBasisAssociationFootnote() + '</div>';

    if (orderBasisStep === 1) {
      var selectedPlan = getBasisById('plan', selectedPlanId);
      if (!selectedPlanId || !selectedPlan) {
        el.className = 'basis-summary-tip basis-summary-tip--neutral';
        el.innerHTML = '<div class="basis-summary-main">未关联采购计划，不做计划额度校验。</div>' + foot;
        return;
      }
      var total = Number(selectedPlan.planAmount || 0);
      var used = Number(selectedPlan.planUsed || 0);
      if (!total || total <= 0) {
        el.className = 'basis-summary-tip basis-summary-tip--neutral';
        el.innerHTML = '<div class="basis-summary-main">当前采购计划未维护计划总额，无法进行额度校验。</div>' + foot;
        return;
      }
      var after = used + orderAmt;
      if (after <= total) {
        el.className = 'basis-summary-tip basis-summary-tip--ok';
        el.innerHTML = '<div class="basis-summary-main">当前选中采购计划总额 ' + formatBasisMoney(total) + '（已执行 ' + formatBasisMoney(used) + '）。本单金额 ' + formatBasisMoney(orderAmt) + '，计入后合计 ' + formatBasisMoney(after) + '，未超过计划总额；剩余可用约 ' + formatBasisMoney(total - after) + '。</div>' + foot;
      } else {
        el.className = 'basis-summary-tip basis-summary-tip--warn';
        el.innerHTML = '<div class="basis-summary-main">当前选中采购计划总额 ' + formatBasisMoney(total) + '（已执行 ' + formatBasisMoney(used) + '）。本单金额 ' + formatBasisMoney(orderAmt) + '，计入后合计 ' + formatBasisMoney(after) + '，已超过计划总额，超支 ' + formatBasisMoney(after - total) + '。</div>' + foot;
      }
      return;
    }

    if (orderBasisStep === 2) {
      var selectedBudget = getBasisById('budget', selectedBudgetId);
      if (!selectedBudgetId || !selectedBudget) {
        el.className = 'basis-summary-tip basis-summary-tip--neutral';
        el.innerHTML = '<div class="basis-summary-main">未关联采购预算，不做预算额度校验。</div>' + foot;
        return;
      }
      var bTotal = Number(selectedBudget.amount || 0);
      var bUsed = Number(selectedBudget.used || 0);
      if (!bTotal || bTotal <= 0) {
        el.className = 'basis-summary-tip basis-summary-tip--neutral';
        el.innerHTML = '<div class="basis-summary-main">当前采购预算未维护预算金额，无法进行额度校验。</div>' + foot;
        return;
      }
      var bAfter = bUsed + orderAmt;
      if (bAfter <= bTotal) {
        el.className = 'basis-summary-tip basis-summary-tip--ok';
        el.innerHTML = '<div class="basis-summary-main">当前选中采购预算总额 ' + formatBasisMoney(bTotal) + '（已执行 ' + formatBasisMoney(bUsed) + '）。本单金额 ' + formatBasisMoney(orderAmt) + '，计入后合计 ' + formatBasisMoney(bAfter) + '，未超过预算总额；剩余可用约 ' + formatBasisMoney(bTotal - bAfter) + '。</div>' + foot;
      } else {
        el.className = 'basis-summary-tip basis-summary-tip--warn';
        el.innerHTML = '<div class="basis-summary-main">当前选中采购预算总额 ' + formatBasisMoney(bTotal) + '（已执行 ' + formatBasisMoney(bUsed) + '）。本单金额 ' + formatBasisMoney(orderAmt) + '，计入后合计 ' + formatBasisMoney(bAfter) + '，已超过预算总额，超支 ' + formatBasisMoney(bAfter - bTotal) + '。</div>' + foot;
      }
      return;
    }

    el.className = 'basis-summary-tip basis-summary-tip--neutral';
    el.innerHTML = '<div class="basis-summary-main">当前关联：采购计划【' + (getBasisById('plan', selectedPlanId) ? escapeBasisText(getBasisById('plan', selectedPlanId).name) : '未关联') + '】；采购预算【' + (getBasisById('budget', selectedBudgetId) ? escapeBasisText(getBasisById('budget', selectedBudgetId).name) : '未关联') + '】；采购依据文件【' + uploadedBasisFiles.length + '个】</div>' + foot;
  }

  function renderBasisFileList() {
    var list = document.getElementById('basisFileList');
    if (!list) return;
    if (!uploadedBasisFiles.length) {
      list.innerHTML = '<div class="basis-empty-state">暂未上传采购依据文件，可点击「上传文件」补充采购申请单、审批单或比价截图等留痕材料。</div>';
      return;
    }
    list.innerHTML = uploadedBasisFiles.map(function (item) {
      return ''
        + '<div class="basis-file-item"><div class="basis-file-main">'
        + '<div class="basis-file-badge"><i class="fa-regular fa-file-lines"></i></div><div>'
        + '<div class="basis-file-name">' + escapeBasisText(item.name) + '</div>'
        + '<div class="basis-file-meta">文件类型：' + escapeBasisText(String(item.type).toUpperCase()) + ' · 文件大小：' + escapeBasisText(item.sizeText) + ' · 上传时间：' + escapeBasisText(item.uploadedAt) + '</div>'
        + '</div></div>'
        + '<button class="basis-file-remove" type="button" onclick="removeBasisFile(\'' + escapeBasisText(item.id) + '\')">删除</button></div>';
    }).join('');
  }

  function renderOrderBasisFooter() {
    var prevBtn = document.getElementById('orderBasisPrevBtn');
    var skipBtn = document.getElementById('orderBasisSkipBtn');
    var nextBtn = document.getElementById('orderBasisNextBtn');
    var note = document.querySelector('.order-basis-foot-note');
    if (!prevBtn || !skipBtn || !nextBtn || !note) return;
    prevBtn.style.display = orderBasisStep === 1 ? 'none' : 'inline-flex';
    skipBtn.style.display = 'inline-flex';
    skipBtn.textContent = orderBasisStep === 3 ? '跳过上传' : '跳过';
    nextBtn.textContent = orderBasisStep === 3 ? _confirmLabel : '下一步';
    note.textContent = orderBasisStep === 1
      ? '如当前订单暂无明确采购计划，可点击「跳过」进入下一步。'
      : orderBasisStep === 2
        ? '如预算信息暂未确认，可点击「跳过」进入「采购依据」步骤。'
        : '支持补充采购依据文件留痕；若采购计划、预算与依据文件均为空，系统会在下单前再次确认。';
  }

  function renderOrderBasisStepChrome() {
    [1, 2, 3].forEach(function (step) {
      var nav = document.getElementById('basisStepNav' + step);
      var panel = document.getElementById('basisStepPanel' + step);
      if (!nav || !panel) return;
      nav.classList.toggle('active', step === orderBasisStep);
      nav.classList.toggle('completed', step < orderBasisStep);
      panel.classList.toggle('active', step === orderBasisStep);
    });
    renderBasisSelectedSummary();
    renderOrderBasisFooter();
  }

  function normalizeBasisSelections() {
    if (!getBasisById('plan', selectedPlanId)) selectedPlanId = '';
    if (!getBasisById('budget', selectedBudgetId)) selectedBudgetId = '';
  }

  function refreshOrderBasisStepContent(step) {
    if (step === 1) {
      document.getElementById('orderPlanList').innerHTML = renderBasisItems('plan', procurementPlanOptions, selectedPlanId);
    } else if (step === 2) {
      document.getElementById('orderBudgetList').innerHTML = renderBasisItems('budget', procurementBudgetOptions, selectedBudgetId);
    } else if (step === 3) {
      renderBasisFileList();
    }
  }

  function goToOrderBasisStep(step) {
    normalizeBasisSelections();
    orderBasisStep = Math.max(1, Math.min(ORDER_BASIS_TOTAL_STEPS, step));
    refreshOrderBasisStepContent(orderBasisStep);
    renderOrderBasisStepChrome();
  }

  function buildBasisResult() {
    var plan = getBasisById('plan', selectedPlanId);
    var budget = getBasisById('budget', selectedBudgetId);
    var files = uploadedBasisFiles.map(function (f) { return Object.assign({}, f); });
    return {
      plan: plan ? Object.assign({}, plan) : null,
      budget: budget ? Object.assign({}, budget) : null,
      files: files,
      hasPlan: !!plan,
      hasBudget: !!budget,
      hasFiles: files.length > 0,
      hasBasis: !!(plan || budget || files.length)
    };
  }

  function confirmOrderBasisAndProceed() {
    if (!selectedPlanId && !selectedBudgetId && !uploadedBasisFiles.length) {
      if (!window.confirm('当前未关联采购计划、采购预算，也未上传采购依据文件，是否继续？')) return;
    }
    closeOrderBasisModal();
    if (typeof _onComplete === 'function') {
      _onComplete(buildBasisResult());
    }
  }

  window.closeOrderBasisModal = function () {
    var overlay = document.getElementById('orderBasisOverlay');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
  };

  window.openOrderBasisModalInternal = function () {
    selectedPlanId = '';
    selectedBudgetId = '';
    uploadedBasisFiles = [];
    orderBasisListsInitialized = { plan: false, budget: false, files: false };
    goToOrderBasisStep(1);
    document.getElementById('orderBasisOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  window.selectOrderPlan = function (id) {
    selectedPlanId = id || '';
    refreshOrderBasisStepContent(1);
    renderBasisSelectedSummary();
  };

  window.selectOrderBudget = function (id) {
    selectedBudgetId = id || '';
    refreshOrderBasisStepContent(2);
    renderBasisSelectedSummary();
  };

  window.triggerBasisFileUpload = function () {
    document.getElementById('basisFileInput').click();
  };

  window.handleBasisFileUpload = function (event) {
    var files = Array.from((event.target && event.target.files) || []);
    var addedCount = 0;
    files.forEach(function (file) {
      var extension = (file.name.split('.').pop() || '').toLowerCase();
      if (BASIS_FILE_ACCEPTS.indexOf(extension) < 0) return;
      if (file.size > BASIS_FILE_MAX_SIZE) return;
      if (uploadedBasisFiles.length >= BASIS_FILE_LIMIT) return;
      uploadedBasisFiles.push({
        id: 'basis-file-' + Date.now() + '-' + addedCount,
        name: file.name,
        size: file.size,
        sizeText: formatBasisFileSize(file.size),
        type: extension || 'file',
        uploadedAt: formatBasisDateTime(new Date())
      });
      addedCount += 1;
    });
    event.target.value = '';
    refreshOrderBasisStepContent(3);
    renderBasisSelectedSummary();
  };

  window.removeBasisFile = function (id) {
    uploadedBasisFiles = uploadedBasisFiles.filter(function (item) { return item.id !== id; });
    refreshOrderBasisStepContent(3);
    renderBasisSelectedSummary();
  };

  window.addProcurementPlan = function () {
    var name = window.prompt('请输入采购计划名称');
    if (!name || !name.trim()) return;
    var item = {
      id: 'plan-' + Date.now(),
      name: name.trim(),
      period: '2026Q3',
      owner: '采购中心',
      planAmount: 300000,
      planUsed: 0
    };
    procurementPlanOptions.unshift(item);
    selectedPlanId = item.id;
    saveProcurementBasisOptions();
    refreshOrderBasisStepContent(1);
    renderBasisSelectedSummary();
  };

  window.addProcurementBudget = function () {
    var name = window.prompt('请输入采购预算名称');
    if (!name || !name.trim()) return;
    var item = {
      id: 'budget-' + Date.now(),
      name: name.trim(),
      period: '2026Q3',
      amount: 100000,
      used: 0
    };
    procurementBudgetOptions.unshift(item);
    selectedBudgetId = item.id;
    saveProcurementBasisOptions();
    refreshOrderBasisStepContent(2);
    renderBasisSelectedSummary();
  };

  window.goPrevOrderBasisStep = function () {
    goToOrderBasisStep(orderBasisStep - 1);
  };

  window.goNextOrderBasisStep = function () {
    if (orderBasisStep >= ORDER_BASIS_TOTAL_STEPS) {
      confirmOrderBasisAndProceed();
      return;
    }
    goToOrderBasisStep(orderBasisStep + 1);
  };

  window.skipOrderBasisStep = function () {
    if (orderBasisStep === 1) {
      selectedPlanId = '';
      goToOrderBasisStep(2);
      return;
    }
    if (orderBasisStep === 2) {
      selectedBudgetId = '';
      goToOrderBasisStep(3);
      return;
    }
    confirmOrderBasisAndProceed();
  };

  window.OrderBasisModal = {
    open: function (opts) {
      opts = opts || {};
      injectModalHtml();
      loadProcurementBasisOptions();
      _getOrderAmount = typeof opts.getOrderAmount === 'function' ? opts.getOrderAmount : function () { return 0; };
      _onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
      _confirmLabel = opts.confirmLabel || '确认并下单';
      openOrderBasisModalInternal();
    }
  };

  injectModalHtml();
})();
