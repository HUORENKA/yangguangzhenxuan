/**
 * 供应商入驻审核页 — 演示数据与回填（与列表页、资质详情页 mock 保持一致）
 */
(function (global) {
  const SUPPLIER_SETTLE_DB = {
    'SP-001': {
      id: 'SP-001', name: '北京联合科技有限公司', station: '北京分站',
      aiResult: 'warn', onlineStatus: 'online',
      applicantName: '王小明', applicantMobile: '13800102334',
      contact: '王主任', phone: '13800102334', legalPerson: '王某',
      creditCode: '91110000MA0012345X', address: '北京市朝阳区望京SOHO T1栋',
      afterSalesPhone: '4001002001',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-003', upload: 'uploaded', ai: 'warn' },
        { code: 'QF-004', upload: 'uploaded', ai: 'pass' },
      ],
    },
    'SP-002': {
      id: 'SP-002', name: '上海联华网络设备有限公司', station: '华东分站',
      aiResult: 'fail', onlineStatus: 'offline',
      applicantName: '李丽', applicantMobile: '13600101028',
      contact: '李老师', phone: '13600101028', legalPerson: '李某',
      creditCode: '52110000MJ1234567A', address: '上海市浦东新区张江高科技园区',
      afterSalesPhone: '',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-003', upload: 'uploaded', ai: 'fail' },
        { code: 'QF-004', upload: 'uploaded', ai: 'pass' },
      ],
    },
    'SP-003': {
      id: 'SP-003', name: '广州得力办公用品贸易公司', station: '医疗卫生专区',
      aiResult: 'pass', onlineStatus: 'online',
      applicantName: '张伟', applicantMobile: '13500108820',
      contact: '赵老师', phone: '13500108820', legalPerson: '张某',
      creditCode: '12110000MB9876543B', address: '广州市天河区珠江新城',
      afterSalesPhone: '4008003003',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-003', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-004', upload: 'uploaded', ai: 'pass' },
      ],
    },
    'SP-004': {
      id: 'SP-004', name: '深圳华强IT配件有限公司', station: '教育装备专区',
      aiResult: 'none', onlineStatus: 'reviewing',
      applicantName: '陈晨', applicantMobile: '13900109900',
      contact: '钱老师', phone: '13900109900', legalPerson: '陈某',
      creditCode: '91310000MB4455667C', address: '深圳市福田区华强北路',
      afterSalesPhone: '',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'none' },
        { code: 'QF-003', upload: 'neutral', ai: 'none' },
        { code: 'QF-004', upload: 'neutral', ai: 'none' },
      ],
    },
    'SP-005': {
      id: 'SP-005', name: '杭州智创家具科技股份公司', station: '华东分站',
      aiResult: 'warn', onlineStatus: 'pending',
      applicantName: '刘洋', applicantMobile: '13700106677',
      contact: '孙老师', phone: '13700106677', legalPerson: '刘某',
      creditCode: '91110000MB8899001D', address: '杭州市西湖区文三路',
      afterSalesPhone: '057188880005',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-003', upload: 'uploaded', ai: 'warn' },
        { code: 'QF-004', upload: 'uploaded', ai: 'pass' },
      ],
    },
    'SP-006': {
      id: 'SP-006', name: '成都宇宙电子商务有限公司', station: '北京分站',
      aiResult: 'pass', onlineStatus: 'offline',
      applicantName: '赵敏', applicantMobile: '13300652345',
      contact: '赵总', phone: '13300652345', legalPerson: '赵某',
      creditCode: '91510000654321987E', address: '成都市高新区天府大道',
      afterSalesPhone: '4006006006',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-003', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-004', upload: 'uploaded', ai: 'pass' },
      ],
    },
    'SP-007': {
      id: 'SP-007', name: '武汉光谷办公家具有限公司', station: '医疗卫生专区',
      aiResult: 'pass', onlineStatus: 'online',
      applicantName: '孙磊', applicantMobile: '13100766789',
      contact: '孙总', phone: '13100766789', legalPerson: '孙某',
      creditCode: '91420000987123456F', address: '武汉市洪山区光谷广场',
      afterSalesPhone: '02788880007',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-003', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-004', upload: 'uploaded', ai: 'pass' },
      ],
    },
    'SP-008': {
      id: 'SP-008', name: '南京智造网络科技有限公司', station: '教育装备专区',
      aiResult: 'none', onlineStatus: 'reviewing',
      applicantName: '周杰', applicantMobile: '13200870123',
      contact: '周经理', phone: '13200870123', legalPerson: '周某',
      creditCode: '91320000147258369G', address: '南京市鼓楼区江北新区',
      afterSalesPhone: '',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'none' },
        { code: 'QF-003', upload: 'uploaded', ai: 'none' },
        { code: 'QF-004', upload: 'uploaded', ai: 'none' },
      ],
    },
    'SP-009': {
      id: 'SP-009', name: '得力办公用品专卖店', companyName: '得力集团有限公司', station: '办公用品专区',
      aiResult: 'pass', onlineStatus: 'online',
      applicantName: '得力管理员', applicantMobile: '4008208056',
      contact: '企业客服', phone: '4008208056', legalPerson: '陈德强',
      creditCode: '9133020025438442XD',
      address: '中国（江苏）自由贸易试验区苏州片区苏州工业园区汇智街8号',
      afterSalesPhone: '4008208056',
      registeredCapital: '36225万元',
      establishDate: '1992-12-22',
      scale: '大型',
      industry: '批发和零售业',
      insured: '761',
      revenue: '110.00亿元',
      qualFiles: [
        { code: 'QF-001', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-003', upload: 'uploaded', ai: 'pass' },
        { code: 'QF-004', upload: 'uploaded', ai: 'pass' },
      ],
    },
  };

  const ONLINE_STATUS_LABEL = {
    online: '已上架',
    offline: '已下架',
    reviewing: '审核中',
    pending: '待整改',
  };

  function setSelectValue(selectEl, value) {
    if (!selectEl || !value) return;
    const options = Array.from(selectEl.options);
    const hit = options.find(o => o.value === value || o.text === value);
    if (hit) {
      selectEl.value = hit.value;
      return;
    }
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    selectEl.appendChild(opt);
    selectEl.value = value;
  }

  function applyQualState(qualFiles, metaList) {
    if (!Array.isArray(qualFiles) || !Array.isArray(metaList)) return;
    qualFiles.forEach(file => {
      const meta = metaList.find(m => m.code === file.id);
      if (!meta) return;
      if (meta.upload === 'uploaded' || meta.upload === 'pending' || meta.upload === 'progress') {
        file.uploadStatus = 'uploaded';
      } else {
        file.uploadStatus = 'neutral';
      }
      if (['pass', 'warn', 'fail'].includes(meta.ai)) {
        file.aiResult = meta.ai;
        file.summary = file.finalSummary;
        file.checks.forEach(c => { c.runtimeStatus = c.finalStatus; });
      }
    });
  }

  function fillForm(record) {
    const map = {
      settleStation: record.station,
      applicantName: record.applicantName,
      applicantMobile: record.applicantMobile,
      applicantSmsCode: '888888',
      companyName: record.companyName || record.name,
      creditCode: record.creditCode,
      legalPerson: record.legalPerson,
      legalPersonId: record.legalPersonId || '110101199001011234',
      contactName: record.contact,
      contactPhone: String(record.phone || '').replace(/\D/g, '').slice(0, 11) || record.phone,
      afterSalesPhone: record.afterSalesPhone || '',
      address: record.address,
    };
    Object.entries(map).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (!el || value == null || value === '') return;
      if (el.tagName === 'SELECT') setSelectValue(el, value);
      else el.value = value;
    });
  }

  function loadRecord(id) {
    return SUPPLIER_SETTLE_DB[id] || null;
  }

  function hydratePage(id, qualFiles, hooks) {
    const record = loadRecord(id);
    if (!record) return null;

    fillForm(record);
    applyQualState(qualFiles, record.qualFiles);

    const titleEl = document.querySelector('h1.text-3xl');
    if (titleEl) titleEl.textContent = '供应商入驻审核 · ' + record.name;

    const hintEl = document.getElementById('supplierEditHint');
    if (hintEl) {
      const statusLabel = ONLINE_STATUS_LABEL[record.onlineStatus] || record.onlineStatus;
      hintEl.textContent = `正在办理【${record.name}】（${record.id}）的入驻审核 · 当前上架状态：${statusLabel}`;
      hintEl.classList.remove('hidden');
    }

    if (typeof hooks.renderQualTable === 'function') hooks.renderQualTable();
    return record;
  }

  global.SupplierSettleData = {
    DB: SUPPLIER_SETTLE_DB,
    loadRecord,
    fillForm,
    applyQualState,
    hydratePage,
  };
})(window);
