/**
 * 企查查合作风险排查演示数据（结构对齐 ApiCode 2006）
 * 用于运营商后台 AI 资质审核原型，不发起真实请求。
 */
(function (global) {
  function wrap(data) {
    return {
      Status: '200',
      Message: '【有效请求】查询成功',
      OrderNumber: 'RISKCONTROL-DEMO-' + Date.now(),
      Result: { VerifyResult: 1, Data: data },
    };
  }

  const PASS_PROFILE = wrap({
    Name: '欧菲斯集团股份有限公司',
    CreditCode: '915000003048974356',
    OperName: '何志',
    Status: '存续（在营、开业、在册）',
    StartDate: '2014-05-27',
    RegistCapi: '22500万元',
    TaxpayerType: '一般纳税人',
    PersonScope: '300-399人',
    InsuredCount: '340',
    Scale: 'L',
    IsSmall: '0',
    Address: '重庆市渝北区金开大道西段106号1幢',
    Industry: { Industry: '批发和零售业', SubIndustry: '零售业' },
    RevokeInfo: null,
    ChangeList: [{}, {}, {}],
    TaxCreditList: [{ Level: 'A', Year: '2024' }],
    AdminLicenseList: [
      { Licensename: '第二类增值电信业务' },
      { Licensename: '第三类医疗器械经营' },
    ],
    SpotCheckList: null,
    IndustryChainList: [
      { Name: '办公用品流通' },
      { Name: '综合零售' },
      { Name: '企业集采供应链' },
    ],
    ShiXin: null,
    ZhiXing: null,
    AdminPenalty: null,
    Exception: null,
    ChattelMortgage: null,
    Liquidation: null,
    EquityPledge: null,
    SeriousIllegal: null,
    EquityFreeze: null,
    JudicialSale: null,
    Bankruptcy: null,
    Sumptuary: null,
    EnvPunishment: null,
    TaxOweNotice: null,
    TaxIllegal: null,
    TaxAbnormal: null,
    TaxHurry: null,
    TaxReminder: null,
    PublicSecurityNotice: null,
  });

  const RISK_PROFILE = wrap({
    Name: '雪松控股集团有限公司',
    CreditCode: '91440101347466547J',
    OperName: '张劲',
    Status: '存续（在营、开业、在册）',
    StartDate: '2015-08-04',
    RegistCapi: '600000万元',
    TaxpayerType: '一般纳税人',
    PersonScope: '少于50人',
    InsuredCount: '6',
    Scale: 'L',
    IsSmall: '0',
    Address: '广州市黄埔区中新广州知识城亿创街1号406房之27',
    Industry: { Industry: '租赁和商务服务业', SubIndustry: '商务服务业' },
    RevokeInfo: null,
    ChangeList: [],
    TaxCreditList: [{ Level: 'B', Year: '2021' }],
    AdminLicenseList: [{ Licensename: '投资管理服务备案' }],
    SpotCheckList: null,
    IndustryChainList: [],
    ShiXin: {
      TotalAmount: '17968.14',
      TotalCount: '17',
      DataList: [{ CaseNo: '（2026）粤0112执6681号' }],
    },
    ZhiXing: {
      TotalAmount: '1338769.2839',
      TotalCount: '26',
      DataList: [{ CaseNo: '（2026）粤0112执恢556号' }],
    },
    AdminPenalty: null,
    Exception: {
      TotalCount: '1',
      DataList: [{ AddReason: '通过登记的住所或者经营场所无法联系的' }],
    },
    ChattelMortgage: null,
    Liquidation: null,
    EquityPledge: null,
    SeriousIllegal: null,
    EquityFreeze: null,
    JudicialSale: null,
    Bankruptcy: null,
    Sumptuary: {
      TotalCount: '12',
      DataList: [{ CaseNo: '限高示例案号' }],
    },
    EnvPunishment: null,
    TaxOweNotice: {
      TotalCount: '2',
      DataList: [{}, {}],
    },
    TaxIllegal: null,
    TaxAbnormal: null,
    TaxHurry: null,
    TaxReminder: null,
    PublicSecurityNotice: null,
  });

  /** 无高风险，但有中/低风险（综合提示「中低风险」） */
  const WARN_PROFILE = wrap({
    Name: '北京联合科技有限公司',
    CreditCode: '91110000MA0012345X',
    OperName: '王某',
    Status: '存续（在营、开业、在册）',
    StartDate: '2018-03-12',
    RegistCapi: '1000万元',
    TaxpayerType: '一般纳税人',
    PersonScope: '50-99人',
    InsuredCount: '68',
    Scale: 'M',
    IsSmall: '0',
    Address: '北京市朝阳区望京SOHO T1栋',
    Industry: { Industry: '信息传输、软件和信息技术服务业', SubIndustry: '软件和信息技术服务业' },
    RevokeInfo: null,
    ChangeList: [{}, {}, {}, {}, {}, {}, {}, {}],
    TaxCreditList: [{ Level: 'B', Year: '2024' }],
    AdminLicenseList: [{ Licensename: '软件企业认定' }],
    SpotCheckList: [{ CheckResult: '正常' }, { CheckResult: '正常' }],
    IndustryChainList: [{ Name: '信息技术服务' }],
    ShiXin: null,
    ZhiXing: null,
    AdminPenalty: {
      TotalCount: '1',
      DataList: [{ PunishReason: '未按规定公示年度报告（示例）' }],
    },
    Exception: null,
    ChattelMortgage: null,
    Liquidation: null,
    EquityPledge: null,
    SeriousIllegal: null,
    EquityFreeze: null,
    JudicialSale: null,
    Bankruptcy: null,
    Sumptuary: null,
    EnvPunishment: null,
    TaxOweNotice: null,
    TaxIllegal: null,
    TaxAbnormal: null,
    TaxHurry: null,
    TaxReminder: null,
    PublicSecurityNotice: null,
  });

  /** 按供应商 ID / 信用代码 / 企业名映射演示画像 */
  const BY_SUPPLIER_ID = {
    'SP-001': 'warn',
    'SP-002': 'risk',
    'SP-003': 'pass',
    'SP-004': 'pass',
    'SP-005': 'pass',
    'SP-006': 'pass',
    'SP-007': 'pass',
    'SP-008': 'pass',
    'SP-009': 'pass',
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function overlayCompany(profile, info) {
    const payload = clone(profile);
    const data = payload.Result.Data;
    if (info.companyName) data.Name = info.companyName;
    if (info.creditCode) data.CreditCode = info.creditCode;
    if (info.legalPerson) data.OperName = info.legalPerson;
    if (info.address) data.Address = info.address;
    return payload;
  }

  /**
   * 模拟查询。searchKey 为空或显式 notfound 时返回查无。
   */
  function fetchMock(searchKey, options) {
    options = options || {};
    const key = String(searchKey || '').trim();
    if (!key || /查无|不存在|notfound/i.test(key)) {
      return {
        Status: '200',
        Message: '【有效请求】查询成功',
        OrderNumber: 'RISKCONTROL-DEMO-EMPTY',
        Result: { VerifyResult: 0, Data: null },
      };
    }

    let kind = options.forceKind || null;
    if (!kind && options.supplierId && BY_SUPPLIER_ID[options.supplierId]) {
      kind = BY_SUPPLIER_ID[options.supplierId];
    }
    if (!kind) {
      if (/雪松|风险|91440101347466547J/.test(key)) kind = 'risk';
      else if (/联合科技|中低|91110000MA0012345X/.test(key)) kind = 'warn';
      else kind = 'pass';
    }

    const base = kind === 'risk' ? RISK_PROFILE : (kind === 'warn' ? WARN_PROFILE : PASS_PROFILE);
    return overlayCompany(base, {
      companyName: options.companyName,
      creditCode: options.creditCode || (/^\d{15,18}[0-9A-Z]$/i.test(key) ? key : ''),
      legalPerson: options.legalPerson,
      address: options.address,
    });
  }

  global.QccMockData = {
    PASS_PROFILE,
    WARN_PROFILE,
    RISK_PROFILE,
    fetchMock,
  };
})(window);
