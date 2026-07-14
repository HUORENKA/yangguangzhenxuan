/**
 * 企查查合作风险排查（ApiCode 2006）→ AI 资质审核规则引擎
 * 等级：pass | low | mid | high
 * 入驻阻断：仅 high
 */
(function (global) {
  const LEVEL = { PASS: 'pass', LOW: 'low', MID: 'mid', HIGH: 'high' };
  const LEVEL_RANK = { pass: 0, low: 1, mid: 2, high: 3 };
  const LEVEL_LABEL = {
    pass: '通过',
    low: '低风险',
    mid: '中风险',
    high: '高风险',
  };

  /** 看板维度：五维参与雷达；企业实力/产业链/行政许可仅展示、不进雷达 */
  const DIMENSIONS = [
    { key: 'biz', name: '工商存续', icon: 'fa-building', color: '#2563eb', refOnly: false, inRadar: true, displayOnly: false },
    { key: 'judicial', name: '司法风险', icon: 'fa-scale-balanced', color: '#dc2626', refOnly: false, inRadar: true, displayOnly: false },
    { key: 'penalty', name: '行政处罚', icon: 'fa-file-circle-exclamation', color: '#d97706', refOnly: false, inRadar: true, displayOnly: false },
    { key: 'tax', name: '税务风险', icon: 'fa-file-invoice-dollar', color: '#059669', refOnly: false, inRadar: true, displayOnly: false },
    { key: 'compliance', name: '经营合规', icon: 'fa-clipboard-check', color: '#7c3aed', refOnly: false, inRadar: true, displayOnly: false },
    { key: 'strength', name: '企业实力', icon: 'fa-star', color: '#2563eb', refOnly: true, inRadar: false, displayOnly: true },
    { key: 'chain', name: '产业链布局', icon: 'fa-diagram-project', color: '#0891b2', refOnly: true, inRadar: false, displayOnly: true },
    { key: 'license', name: '行政许可', icon: 'fa-stamp', color: '#6366f1', refOnly: true, inRadar: false, displayOnly: true },
  ];

  /** 雷达图分值映射（不在界面展示分数）：通过3 / 低风险2 / 中风险1 / 高风险0 */
  const LEVEL_SCORE = { pass: 3, low: 2, mid: 1, high: 0 };
  const DOT_COLOR = { pass: '#16a34a', low: '#d97706', mid: '#d97706', high: '#dc2626' };

  function worse(a, b) {
    return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
  }

  function riskCount(block) {
    if (!block) return 0;
    const n = parseInt(block.TotalCount, 10);
    if (!Number.isNaN(n) && n > 0) return n;
    if (Array.isArray(block.DataList) && block.DataList.length) return block.DataList.length;
    return 0;
  }

  function hasRisk(block) {
    return riskCount(block) > 0;
  }

  function listLen(list) {
    return Array.isArray(list) ? list.length : 0;
  }

  function isSurvivingStatus(status) {
    const s = String(status || '');
    if (!s) return false;
    if (/注销|吊销|清算|停业|撤销|迁出/.test(s)) return false;
    return /存续|在营|开业|在册|正常/.test(s);
  }

  function scaleLabel(scale) {
    return ({ L: '大型', M: '中型', S: '小型', XS: '微型' })[scale] || scale || '—';
  }

  function evalBiz(data) {
    const lines = [];
    const status = data.Status || '—';
    lines.push(`登记状态：${status}`);
    lines.push(`成立日期：${data.StartDate || '—'}`);
    lines.push(`注册资本：${data.RegistCapi || '—'}`);
    lines.push(`法定代表人：${data.OperName || '—'}`);

    let level = LEVEL.PASS;
    if (!isSurvivingStatus(status) || data.RevokeInfo) {
      level = LEVEL.HIGH;
      lines.push(data.RevokeInfo
        ? '存在注销/吊销信息，判定为高风险（阻断）。'
        : '登记状态非存续（在营），判定为高风险（阻断）。');
    }
    if (hasRisk(data.Liquidation)) {
      level = worse(level, LEVEL.HIGH);
      lines.push(`清算信息 ${riskCount(data.Liquidation)} 条，判定为高风险（阻断）。`);
    }
    if (listLen(data.ChangeList) >= 20) {
      level = worse(level, LEVEL.LOW);
      lines.push(`工商变更记录较多（${listLen(data.ChangeList)} 条），提示关注。`);
    }
    if (level === LEVEL.PASS) lines.push('工商存续状态正常。');
    return { level, lines };
  }

  function evalJudicial(data) {
    const lines = [];
    let level = LEVEL.PASS;

    if (hasRisk(data.ShiXin)) {
      level = worse(level, LEVEL.HIGH);
      lines.push(`失信被执行人 ${riskCount(data.ShiXin)} 条（涉案约 ${data.ShiXin.TotalAmount || '—'} 万元），高风险（阻断）。`);
    }
    if (hasRisk(data.Sumptuary)) {
      level = worse(level, LEVEL.HIGH);
      lines.push(`限制高消费 ${riskCount(data.Sumptuary)} 条，高风险（阻断）。`);
    }
    if (hasRisk(data.Bankruptcy)) {
      level = worse(level, LEVEL.HIGH);
      lines.push(`破产重整 ${riskCount(data.Bankruptcy)} 条，高风险（阻断）。`);
    }
    if (hasRisk(data.ZhiXing)) {
      level = worse(level, LEVEL.MID);
      lines.push(`被执行人 ${riskCount(data.ZhiXing)} 条（标的合计约 ${data.ZhiXing.TotalAmount || '—'} 万元），中风险。`);
    }
    if (hasRisk(data.EquityFreeze)) {
      level = worse(level, LEVEL.MID);
      lines.push(`股权冻结 ${riskCount(data.EquityFreeze)} 条，中风险。`);
    }
    if (hasRisk(data.JudicialSale)) {
      level = worse(level, LEVEL.MID);
      lines.push(`司法拍卖 ${riskCount(data.JudicialSale)} 条，中风险。`);
    }
    if (level === LEVEL.PASS) lines.push('无失信、限高、破产、被执行等司法风险记录。');
    return { level, lines };
  }

  function evalPenalty(data) {
    const lines = [];
    let level = LEVEL.PASS;
    if (hasRisk(data.AdminPenalty)) {
      level = worse(level, LEVEL.MID);
      lines.push(`行政处罚 ${riskCount(data.AdminPenalty)} 条，中风险。`);
    }
    if (hasRisk(data.EnvPunishment)) {
      level = worse(level, LEVEL.MID);
      lines.push(`环保处罚 ${riskCount(data.EnvPunishment)} 条，中风险。`);
    }
    if (hasRisk(data.PublicSecurityNotice)) {
      level = worse(level, LEVEL.MID);
      lines.push(`公安通告 ${riskCount(data.PublicSecurityNotice)} 条，中风险。`);
    }
    if (level === LEVEL.PASS) lines.push('无行政处罚、环保处罚、公安通告记录。');
    return { level, lines };
  }

  function evalTax(data) {
    const lines = [];
    let level = LEVEL.PASS;

    if (hasRisk(data.TaxIllegal)) {
      level = worse(level, LEVEL.HIGH);
      lines.push(`税收违法 ${riskCount(data.TaxIllegal)} 条，高风险（阻断）。`);
    }
    if (hasRisk(data.TaxAbnormal)) {
      level = worse(level, LEVEL.HIGH);
      lines.push(`税务非正常户 ${riskCount(data.TaxAbnormal)} 条，高风险（阻断）。`);
    }
    if (hasRisk(data.TaxOweNotice)) {
      level = worse(level, LEVEL.MID);
      lines.push(`欠税公告 ${riskCount(data.TaxOweNotice)} 条，中风险。`);
    }
    if (hasRisk(data.TaxHurry)) {
      level = worse(level, LEVEL.MID);
      lines.push(`税务催缴 ${riskCount(data.TaxHurry)} 条，中风险。`);
    }
    if (hasRisk(data.TaxReminder)) {
      level = worse(level, LEVEL.MID);
      lines.push(`税务催报 ${riskCount(data.TaxReminder)} 条，中风险。`);
    }

    const taxCredits = Array.isArray(data.TaxCreditList) ? data.TaxCreditList : [];
    if (taxCredits.length) {
      const latest = taxCredits[0];
      const grade = latest.Level || latest.Grade || latest.CreditLevel || '—';
      lines.push(`纳税信用等级（最近）：${grade}`);
      if (String(grade).toUpperCase() === 'D' || String(grade).includes('D')) {
        level = worse(level, LEVEL.LOW);
        lines.push('纳税信用等级偏低，提示关注。');
      }
    } else {
      lines.push(`纳税人资质：${data.TaxpayerType || '—'}`);
    }

    if (level === LEVEL.PASS && lines.length <= 1) {
      lines.push('无税收违法、非正常户、欠税等税务风险记录。');
    }
    return { level, lines };
  }

  function evalCompliance(data) {
    const lines = [];
    let level = LEVEL.PASS;

    if (hasRisk(data.SeriousIllegal)) {
      level = worse(level, LEVEL.HIGH);
      lines.push(`严重违法 ${riskCount(data.SeriousIllegal)} 条，高风险（阻断）。`);
    }
    if (hasRisk(data.Exception)) {
      level = worse(level, LEVEL.MID);
      lines.push(`经营异常 ${riskCount(data.Exception)} 条，中风险。`);
    }
    if (hasRisk(data.ChattelMortgage)) {
      level = worse(level, LEVEL.MID);
      lines.push(`动产抵押 ${riskCount(data.ChattelMortgage)} 条，中风险。`);
    }
    if (hasRisk(data.EquityPledge)) {
      level = worse(level, LEVEL.MID);
      lines.push(`股权出质 ${riskCount(data.EquityPledge)} 条，中风险。`);
    }
    if (listLen(data.SpotCheckList) > 0) {
      level = worse(level, LEVEL.LOW);
      lines.push(`抽查检查记录 ${listLen(data.SpotCheckList)} 条，低风险提示。`);
    }
    if (level === LEVEL.PASS) lines.push('无经营异常、严重违法、抽查异常等经营合规风险。');
    return { level, lines };
  }

  function evalStrength(data) {
    const lines = [
      `企业规模：${scaleLabel(data.Scale)}`,
      `注册资本：${data.RegistCapi || '—'}`,
      `参保人数：${data.InsuredCount || '—'}`,
      `人员规模：${data.PersonScope || '—'}`,
      `纳税人资质：${data.TaxpayerType || '—'}`,
    ];
    if (data.IsSmall === '1') lines.push('标识：小微企业（仅展示，不参与风险定级）。');
    lines.push('本维度仅作信息参考，不参与五维雷达图与入驻判定。');
    return { level: LEVEL.PASS, lines };
  }

  function evalChain(data) {
    const list = Array.isArray(data.IndustryChainList) ? data.IndustryChainList : [];
    const lines = [];
    if (!list.length) {
      lines.push('暂无产业链关联信息。');
    } else {
      const names = list.slice(0, 5).map(x => x.Name || x.IndustryChainName || x.ChainName || '产业链节点').filter(Boolean);
      lines.push(`关联产业链 ${list.length} 条：${names.join('、')}${list.length > 5 ? '…' : ''}`);
    }
    lines.push('本维度仅作信息参考，不参与五维雷达图与入驻判定。');
    return { level: LEVEL.PASS, lines };
  }

  function evalLicense(data) {
    const list = Array.isArray(data.AdminLicenseList) ? data.AdminLicenseList : [];
    const lines = [];
    if (!list.length) {
      lines.push('暂无行政许可记录。');
    } else {
      lines.push(`行政许可 ${list.length} 条。`);
      const sample = list.slice(0, 3).map(x => x.Licensename || x.LicenseName || x.Name || '许可项目');
      lines.push(`示例：${sample.join('；')}${list.length > 3 ? '…' : ''}`);
    }
    lines.push('本维度仅作信息参考，不参与五维雷达图与入驻判定。');
    return { level: LEVEL.PASS, lines };
  }

  const EVALUATORS = {
    biz: evalBiz,
    judicial: evalJudicial,
    penalty: evalPenalty,
    tax: evalTax,
    compliance: evalCompliance,
    strength: evalStrength,
    chain: evalChain,
    license: evalLicense,
  };

  function buildCompanyInfo(data) {
    return [
      ['登记状态', data.Status || '—'],
      ['统一社会信用代码', data.CreditCode || '—'],
      ['法定代表人', data.OperName || '—'],
      ['企业规模', scaleLabel(data.Scale)],
      ['注册资本', data.RegistCapi || '—'],
      ['成立日期', data.StartDate || '—'],
      ['所属行业', (data.Industry && data.Industry.Industry) || '—'],
      ['参保人数', data.InsuredCount || '—'],
      ['纳税人资质', data.TaxpayerType || '—'],
      ['注册地址', data.Address || '—'],
    ];
  }

  function evaluate(qccPayload) {
    if (!qccPayload || qccPayload.Status !== '200') {
      return {
        ok: false,
        reason: 'query_failed',
        message: '无法查询到企业信息。企查查接口请求失败或返回异常，请核对企业名称/统一社会信用代码后重试；也可由运营人工审核后决定是否通过入驻。',
      };
    }
    if (!qccPayload.Result || Number(qccPayload.Result.VerifyResult) !== 1 || !qccPayload.Result.Data) {
      return {
        ok: false,
        reason: 'not_found',
        message: '无法查询到企业信息。企查查未检索到匹配企业，请核对企业名称或统一社会信用代码后重试；也可由运营人工审核后决定是否通过入驻。',
      };
    }

    const data = qccPayload.Result.Data;
    const dimensions = DIMENSIONS.map(meta => {
      const result = EVALUATORS[meta.key](data);
      return {
        ...meta,
        level: result.level,
        lines: result.lines,
      };
    });

    const radarDims = dimensions.filter(d => d.inRadar !== false);
    const riskDims = radarDims.filter(d => !d.refOnly);
    let overall = LEVEL.PASS;
    riskDims.forEach(d => { overall = worse(overall, d.level); });

    const highCount = riskDims.filter(d => d.level === LEVEL.HIGH).length;
    const midCount = riskDims.filter(d => d.level === LEVEL.MID).length;
    const lowCount = riskDims.filter(d => d.level === LEVEL.LOW).length;
    const passCount = radarDims.filter(d => d.level === LEVEL.PASS).length;
    const blocked = overall === LEVEL.HIGH;

    const companyName = data.Name || '当前企业';
    let summaryText = `企业「${companyName}」合作风险排查完成：${passCount}/${radarDims.length} 项通过`;
    let summaryCase = 'pass'; // pass | warn | high
    if (blocked) {
      summaryCase = 'high';
      summaryText = `企业「${companyName}」存在 ${highCount} 项高风险（阻断），暂不建议通过入驻；低/中风险仅作提示。`;
    } else if (midCount || lowCount) {
      summaryCase = 'warn';
      summaryText = `企业「${companyName}」无高风险阻断项；存在 ${midCount} 项中风险、${lowCount} 项低风险，可提示关注后由运营确认入驻。`;
    } else {
      summaryCase = 'pass';
      summaryText = `企业「${companyName}」5 项合作风险检测全部通过，综合信用良好。`;
    }

    return {
      ok: true,
      companyName,
      creditCode: data.CreditCode || '',
      overall,
      overallLabel: LEVEL_LABEL[overall],
      summaryCase,
      blocked,
      summaryText,
      companyInfo: buildCompanyInfo(data),
      dimensions,
      radarDimensions: radarDims,
      counts: {
        pass: passCount,
        low: lowCount,
        mid: midCount,
        high: highCount,
        total: radarDims.length,
      },
      raw: data,
    };
  }

  global.QccRiskEngine = {
    LEVEL,
    LEVEL_LABEL,
    LEVEL_RANK,
    LEVEL_SCORE,
    DOT_COLOR,
    DIMENSIONS,
    evaluate,
    isSurvivingStatus,
    riskCount,
    hasRisk,
  };
})(window);
