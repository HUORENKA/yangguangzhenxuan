/**
 * 商城模拟数据生成器
 * 规则：
 * - 一级分类：4个（办公用品、电脑数码、个人防护、安全防护）
 * - 每个一级分类：5个二级分类
 * - 每个二级分类：5个三级分类
 * - 每个三级分类：10个商品
 * - 供应商总数：5个
 */

function pad(num, len) {
  return String(num).padStart(len, "0");
}

function seededPrice(i1, i2, i3, p) {
  // 稳定“伪随机”价格，保证每次生成一致
  const base = 10 + i1 * 6 + i2 * 3 + i3 * 1.5;
  const noise = ((i1 * 97 + i2 * 53 + i3 * 29 + p * 17) % 100) / 10;
  return Number((base + noise).toFixed(2));
}

function seededStock(i1, i2, i3, p) {
  return 50 + ((i1 * 131 + i2 * 67 + i3 * 37 + p * 19) % 950);
}

const suppliers = [
  { id: "S001", name: "华采供应链有限公司", contact: "400-100-0001" },
  { id: "S002", name: "中联商贸集团", contact: "400-100-0002" },
  { id: "S003", name: "鼎盛工业品服务商", contact: "400-100-0003" },
  { id: "S004", name: "优品集采科技有限公司", contact: "400-100-0004" },
  { id: "S005", name: "安捷物资平台", contact: "400-100-0005" },
];

const level1Names = ["办公用品", "电脑数码", "个人防护", "安全防护"];

const level2Map = {
  办公用品: ["书写文具", "纸品耗材", "文件管理", "桌面用品", "办公设备"],
  电脑数码: ["电脑整机", "外设设备", "存储设备", "网络设备", "数码配件"],
  个人防护: ["手部防护", "足部防护", "眼面防护", "呼吸防护", "躯体防护"],
  安全防护: ["消防器材", "监控设备", "应急照明", "警示标识", "安防工具"],
};

function buildLevel3Names(level2Name) {
  return [
    `${level2Name}-基础型`,
    `${level2Name}-标准型`,
    `${level2Name}-增强型`,
    `${level2Name}-专业型`,
    `${level2Name}-旗舰型`,
  ];
}

function generateMallMockData() {
  const categories = [];
  const products = [];

  let productSeq = 1;

  level1Names.forEach((l1Name, i1) => {
    const l1Id = `C1-${pad(i1 + 1, 2)}`;
    const level2List = level2Map[l1Name];

    const l1Node = {
      id: l1Id,
      name: l1Name,
      children: [],
    };

    level2List.forEach((l2Name, i2) => {
      const l2Id = `${l1Id}-C2-${pad(i2 + 1, 2)}`;
      const level3List = buildLevel3Names(l2Name);

      const l2Node = {
        id: l2Id,
        name: l2Name,
        children: [],
      };

      level3List.forEach((l3Name, i3) => {
        const l3Id = `${l2Id}-C3-${pad(i3 + 1, 2)}`;

        l2Node.children.push({
          id: l3Id,
          name: l3Name,
        });

        for (let p = 1; p <= 10; p++) {
          const supplier = suppliers[(productSeq - 1) % suppliers.length];
          const productId = `P${pad(productSeq, 6)}`;
          const sku = `SKU-${pad(i1 + 1, 2)}${pad(i2 + 1, 2)}${pad(i3 + 1, 2)}-${pad(p, 2)}`;

          products.push({
            id: productId,
            sku,
            name: `${l3Name} 商品${pad(p, 2)}`,
            level1Id: l1Id,
            level1Name: l1Name,
            level2Id: l2Id,
            level2Name: l2Name,
            level3Id: l3Id,
            level3Name: l3Name,
            supplierId: supplier.id,
            supplierName: supplier.name,
            price: seededPrice(i1 + 1, i2 + 1, i3 + 1, p),
            stock: seededStock(i1 + 1, i2 + 1, i3 + 1, p),
            unit: "件",
            status: "on_sale",
          });

          productSeq += 1;
        }
      });

      l1Node.children.push(l2Node);
    });

    categories.push(l1Node);
  });

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      level1Count: level1Names.length,
      level2PerLevel1: 5,
      level3PerLevel2: 5,
      productsPerLevel3: 10,
      supplierCount: suppliers.length,
      totalProducts: products.length, // 1000
    },
    suppliers,
    categories,
    products,
  };
}

// Node.js 直接运行时，输出 JSON 到控制台（可重定向为文件）
if (typeof module !== "undefined" && require.main === module) {
  const data = generateMallMockData();
  process.stdout.write(JSON.stringify(data, null, 2));
}

module.exports = {
  generateMallMockData,
};

