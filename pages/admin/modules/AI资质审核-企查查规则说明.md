# 企查查 AI 资质审核 — 维度与规则说明

> 数据源：企查查 ApiCode **2006 合作风险排查**（`RiskControl/Scan`）  
> 本模块**仅使用企查查数据**，不依据上传资质文件定级。

## 1. 审核维度

### 1.1 六维（参与雷达与通过计数）

| 维度 | 主要字段 | 是否参与阻断 | 雷达分值 | 状态标签 |
| --- | --- | --- | --- | --- |
| 工商存续 | Status、RevokeInfo、Liquidation、ChangeList | 是 | 通过3 / 低2 / 中1 / 高0 | 有 |
| 司法风险 | ShiXin、Sumptuary、Bankruptcy、ZhiXing、EquityFreeze、JudicialSale | 是 | 同上 | 有 |
| 行政处罚 | AdminPenalty、EnvPunishment、PublicSecurityNotice | 是 | 同上 | 有 |
| 税务风险 | TaxIllegal、TaxAbnormal、TaxOweNotice、TaxHurry、TaxReminder、TaxCreditList | 是 | 同上 | 有 |
| 经营合规 | SeriousIllegal、Exception、ChattelMortgage、EquityPledge、SpotCheckList | 是 | 同上 | 有 |
| 企业实力 | Scale、RegistCapi、InsuredCount、PersonScope、TaxpayerType、IsSmall | **否（仅展示）** | 固定按通过=3 | 有 |

### 1.2 仅展示（不进六维图、不打通过/风险标签）

| 维度 | 主要字段 | 说明 |
| --- | --- | --- |
| 产业链布局 | IndustryChainList | 卡片展示参考信息，不参与雷达与入驻阻断 |
| 行政许可 | AdminLicenseList | 同上 |

## 2. 四级等级与雷达点色

`通过` → `低风险` → `中风险` → `高风险（阻断）`

- 雷达半径：通过=3、低风险=2、中风险=1、高风险=0（界面不展示分数）
- 雷达顶点着色：**绿点**=通过，**黄点**=中/低风险，**红点**=高风险

## 3. 高风险（阻断）命中即阻断入驻

- 登记状态非存续 / 注销吊销 / 清算  
- 失信被执行人（ShiXin）  
- 限制高消费（Sumptuary）  
- 破产重整（Bankruptcy）  
- 严重违法（SeriousIllegal）  
- 税收违法（TaxIllegal） / 税务非正常户（TaxAbnormal）  

## 4. 中风险（提示，不阻断）

被执行人、行政处罚、经营异常、欠税公告、环保处罚、股权冻结/出质、动产抵押、税务催缴/催报、公安通告等。

## 5. 低风险（提示，不阻断）

抽查检查记录、变更过于频繁、纳税信用 D 级等提示性信息。

## 6. 综合提示三种结论态

按业务结果自动展示（非皮肤切换）：

| 结论态 | 条件 | 样式 |
| --- | --- | --- |
| 高风险 | 存在 ≥1 项高风险（阻断） | 红叉 +「暂不建议通过入驻」 |
| 中低风险 | 无高风险，但有中/低风险 | 黄叹号 + 提示关注后人工确认 |
| 全部通过 | 六维均无中/低/高风险 | 绿勾 + 综合信用良好 |

其他约定：

- **入驻结论**：仅高风险不可通过；低/中风险可提示后人工通过。  
- **查无/失败**：弹窗「无法查询到企业信息」，不生成结果面板，仍允许人工通过。  
- **加载方式**：点击「AI资质审核」后在模块内显示进度，不弹全屏进度窗。  
- **时间窗口**：不限时间，接口有记录即计入。

## 7. 原型文件

- `pages/admin/modules/qcc_risk_engine.js` — 规则引擎  
- `pages/admin/modules/qcc_mock_data.js` — 演示数据（SP-003=全部通过；SP-001=中低风险；SP-002=高风险）  
- `pages/admin/modules/supplier_ai_audit.js` — 审核交互与看板  
