// 阳光优采 - 管理后台运营数据 Mock 数据
// 用于原型演示，所有数据均为模拟数据

const dashboardData = {
  // ========== 核心运营数据看板（8 张卡片） ==========
  
  // 订单总量（不含取消/退货）
  orderTotal: {
    value: 1248,
    trend: '+12.3%',
    trendUp: true,
    pending: 35,      // 待确认
    shipping: 58,     // 待发货
    receiving: 102    // 待收货
  },
  
  // 成交金额（主：下单金额；次：结算金额）
  gmv: {
    main: 2345678,        // 下单金额（主）
    secondary: 2100000,   // 结算金额（次）
    trend: '+8.5%',
    trendUp: true
  },
  
  // 活跃用户数（登录即活跃）
  activeUsers: {
    value: 856,
    trend: '+5.2%',
    trendUp: true
  },
  
  // 供应商数量
  suppliers: {
    certified: 45,    // 已认证
    pending: 8        // 待审核
  },
  
  // 商品总数
  products: {
    online: 3200,     // 上架
    offline: 150,     // 下架
    outOfStock: 80    // 缺货
  },
  
  // 分站数量
  stations: {
    total: 1,         // 总站
    regional: 5,      // 区域分站
    enterprise: 12    // 企业分站
  },
  
  // ========== 趋势图数据（支持日/周/月切换） ==========
  
  trends: {
    // 近7天数据（日粒度）
    daily: [
      { date: '01-08', orders: 120, gmv: 280000, activeUsers: 95 },
      { date: '01-09', orders: 135, gmv: 310000, activeUsers: 102 },
      { date: '01-10', orders: 148, gmv: 295000, activeUsers: 108 },
      { date: '01-11', orders: 125, gmv: 268000, activeUsers: 98 },
      { date: '01-12', orders: 160, gmv: 342000, activeUsers: 115 },
      { date: '01-13', orders: 178, gmv: 398000, activeUsers: 128 },
      { date: '01-14', orders: 182, gmv: 452000, activeUsers: 135 }
    ],
    
    // 近4周数据（周粒度）
    weekly: [
      { date: '第44周', orders: 820, gmv: 1850000, activeUsers: 645 },
      { date: '第45周', orders: 895, gmv: 2120000, activeUsers: 702 },
      { date: '第46周', orders: 1050, gmv: 2480000, activeUsers: 785 },
      { date: '第47周', orders: 1248, gmv: 2850000, activeUsers: 856 }
    ],
    
    // 近6个月数据（月粒度）
    monthly: [
      { date: '8月', orders: 3200, gmv: 7200000, activeUsers: 2100 },
      { date: '9月', orders: 3580, gmv: 8150000, activeUsers: 2380 },
      { date: '10月', orders: 4120, gmv: 9200000, activeUsers: 2650 },
      { date: '11月', orders: 4680, gmv: 10500000, activeUsers: 2920 },
      { date: '12月', orders: 5240, gmv: 11800000, activeUsers: 3150 },
      { date: '1月', orders: 5820, gmv: 13200000, activeUsers: 3480 }
    ]
  },
  
  // ========== 订单状态漏斗数据 ==========
  
  orderFunnel: [
    { status: '待确认', count: 35, percent: 2.8 },
    { status: '待发货', count: 58, percent: 4.6 },
    { status: '待收货', count: 102, percent: 8.2 },
    { status: '收货完成', count: 980, percent: 78.5 },
    { status: '已取消', count: 48, percent: 3.8 },
    { status: '退货', count: 25, percent: 2.0 }
  ],
  
  // ========== 分站订单占比数据 ==========
  
  stationOrderShare: {
    // 按销售金额（下单金额）
    gmv: [
      { name: '总站', value: 1200000, percent: 51.2, color: '#E2231A' },
      { name: '区域分站', value: 800000, percent: 34.1, color: '#FF6B6B' },
      { name: '企业分站', value: 345678, percent: 14.7, color: '#FFB84D' }
    ],
    // 按订单量
    count: [
      { name: '总站', value: 650, percent: 52.1, color: '#E2231A' },
      { name: '区域分站', value: 420, percent: 33.7, color: '#FF6B6B' },
      { name: '企业分站', value: 178, percent: 14.2, color: '#FFB84D' }
    ]
  },
  
  // ========== 各站用户占比数据 ==========
  
  stationUsers: {
    // 三类站总占比（饼图用）
    summary: [
      { name: '总站', value: 500, percent: 41.7, color: '#E2231A' },
      { name: '区域分站', value: 450, percent: 37.5, color: '#FF6B6B' },
      { name: '企业分站', value: 250, percent: 20.8, color: '#FFB84D' }
    ],
    // 各具体分站详细数据（柱状图用）
    detail: [
      { name: '总站', users: 500, color: '#E2231A' },
      { name: '区域-北京', users: 150, color: '#FF6B6B' },
      { name: '区域-上海', users: 120, color: '#FF7F7F' },
      { name: '区域-广州', users: 80, color: '#FF9393' },
      { name: '区域-深圳', users: 60, color: '#FFA6A6' },
      { name: '区域-成都', users: 40, color: '#FFB9B9' },
      { name: '企业-A公司', users: 60, color: '#FFB84D' },
      { name: '企业-B公司', users: 50, color: '#FFC266' },
      { name: '企业-C公司', users: 45, color: '#FFCC7F' },
      { name: '企业-D公司', users: 40, color: '#FFD699' },
      { name: '企业-E公司', users: 35, color: '#FFE0B2' },
      { name: '企业-其他', users: 20, color: '#FFEACC' }
    ]
  },
  
  // ========== 运营待办 ==========
  
  todos: {
    enterpriseVerify: 3,   // 待审核企业认证
    supplierVerify: 8,     // 待审核供应商认证
    poApproval: 12,        // 待审核采购单
    abnormalOrders: 5      // 异常订单（超时/退货）
  }
};

// 工具函数：格式化金额
function formatCurrency(amount) {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(2) + '万';
  }
  return amount.toLocaleString('zh-CN');
}

// 工具函数：格式化数字
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return num.toLocaleString('zh-CN');
}

// ========== 店铺列表数据 ==========
const storeListData = {
  keyword: '', // 当前搜索关键词
  total: 10, // 店铺总数
  stores: []
};

// ========== 店铺详情数据 ==========
const storeDetailData = {
  id: '',
  name: '',
  logo: '',
  description: '',
  productCount: 0,
  followerCount: 0,
  openTime: '',
  isFollowed: false,
  categories: [],
  products: []
};

// 初始化店铺列表数据（10个店铺，每个5个推荐商品）
function initStoreListData(keyword = '') {
  const storeNames = [
    '迎瑞手机专营店',
    '京浩手机专营店',
    '华为礼象专卖店',
    '艾派客手机配件旗舰店',
    '荣耀官方旗舰店',
    '小米生态链专营店',
    '苹果授权经销商',
    'OPPO官方旗舰店',
    'vivo品牌专营店',
    '一加手机官方店'
  ];
  
  const descriptions = [
    '专业销售华为、荣耀等品牌手机，正品保证，全国联保，顺丰发货',
    '京东自营品质，正品保障，7天无理由退货，24小时发货',
    '华为官方授权店铺，原装正品，全国联保，售后无忧',
    '专业手机配件供应商，保护壳、贴膜、充电器等配件齐全',
    '荣耀官方旗舰店，新品首发，官方正品，全国联保',
    '小米生态链产品专营，智能家居、手机配件一站式采购',
    '苹果授权经销商，正品保证，全国联保，支持分期',
    'OPPO官方旗舰店，新品首发，官方正品，全国联保',
    'vivo品牌专营店，正品保证，全国联保，快速发货',
    '一加手机官方店，极速性能，官方正品，全国联保'
  ];
  
  const productImages = [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop'
  ];
  
  const productNames = [
    '华为Mate80 Pro Max 5G手机',
    '荣耀WIN RT 游戏手机',
    'iPhone 17 Pro Max',
    '小米15 Ultra 旗舰手机',
    'OPPO Find X8 Pro',
    'vivo X200 Pro',
    '一加13 Pro',
    '华为Pura 80 Pro',
    '荣耀Magic 8 Pro',
    '小米14 Pro'
  ];
  
  storeListData.keyword = keyword;
  storeListData.stores = storeNames.map((name, index) => {
    const productCount = Math.floor(Math.random() * 200) + 200;
    const followerCount = Math.floor(Math.random() * 2000) + 500;
    const openTime = `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    // 生成5个推荐商品
    const recommendedProducts = Array.from({ length: 5 }).map((_, i) => ({
      id: `prod_${index}_${i}`,
      name: productNames[(index * 5 + i) % productNames.length] + ` ${12 + i * 4}GB+${256 + i * 128}GB`,
      image: productImages[i % productImages.length],
      price: Math.floor(Math.random() * 5000) + 3000
    }));
    
    return {
      id: `store_${String(index + 1).padStart(3, '0')}`,
      name: name,
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
      description: descriptions[index],
      productCount: productCount,
      followerCount: followerCount,
      openTime: openTime,
      isFollowed: Math.random() > 0.7, // 30%概率已关注
      recommendedProducts: recommendedProducts
    };
  });
  
  return storeListData;
}

// 初始化店铺详情数据（50个商品）
function initStoreDetailData(storeId) {
  // 如果 storeListData 还没有初始化，先初始化它
  if (!storeListData.stores || storeListData.stores.length === 0) {
    initStoreListData('');
  }
  
  // 查找店铺，如果找不到则使用第一个店铺
  let store = storeListData.stores.find(s => s.id === storeId);
  if (!store && storeListData.stores.length > 0) {
    store = storeListData.stores[0];
  }
  
  // 如果还是找不到店铺，创建一个默认店铺
  if (!store) {
    store = {
      id: storeId || 'store_001',
      name: '迎瑞手机专营店',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
      description: '专业销售华为、荣耀等品牌手机，正品保证，全国联保，顺丰发货',
      productCount: 324,
      followerCount: 1250,
      openTime: '2024-01-15',
      isFollowed: false
    };
  }
  
  // 分类数据（两级）
  const categories = [
    {
      id: 'cat_all',
      name: '全部',
      level: 1,
      children: []
    },
    {
      id: 'cat_001',
      name: '智能手机',
      level: 1,
      children: [
        { id: 'cat_001_001', name: '华为手机', level: 2 },
        { id: 'cat_001_002', name: '荣耀手机', level: 2 },
        { id: 'cat_001_003', name: '苹果手机', level: 2 }
      ]
    },
    {
      id: 'cat_002',
      name: '手机配件',
      level: 1,
      children: [
        { id: 'cat_002_001', name: '保护壳', level: 2 },
        { id: 'cat_002_002', name: '贴膜', level: 2 },
        { id: 'cat_002_003', name: '充电器', level: 2 }
      ]
    },
    {
      id: 'cat_003',
      name: '智能设备',
      level: 1,
      children: [
        { id: 'cat_003_001', name: '智能手表', level: 2 },
        { id: 'cat_003_002', name: '无线耳机', level: 2 }
      ]
    }
  ];
  
  // 生成50个商品
  const productImages = [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'
  ];
  
  const productNames = [
    '华为Mate80 Pro Max 5G手机 12GB+256GB',
    '荣耀WIN RT 游戏手机 16GB+512GB',
    'iPhone 17 Pro Max 256GB',
    '小米15 Ultra 旗舰手机 12GB+256GB',
    'OPPO Find X8 Pro 16GB+512GB',
    'vivo X200 Pro 12GB+256GB',
    '一加13 Pro 16GB+512GB',
    '华为Pura 80 Pro 12GB+256GB',
    '荣耀Magic 8 Pro 16GB+512GB',
    '小米14 Pro 12GB+256GB'
  ];
  
  const shippingOptions = [
    '顺丰当天发 快至次日达',
    '24小时发货 快至次日达',
    '现货速发 快至次日达',
    '顺丰当日发 快至次日达'
  ];
  
  const products = Array.from({ length: 50 }).map((_, i) => {
    const categoryIndex = Math.floor(i / 12);
    const category = categories[categoryIndex + 1] || categories[1];
    const subCategory = category.children[Math.floor(Math.random() * category.children.length)];
    
    return {
      id: `prod_${store.id}_${i}`,
      name: productNames[i % productNames.length],
      image: productImages[i % productImages.length],
      price: Math.floor(Math.random() * 5000) + 3000,
      shipping: shippingOptions[i % shippingOptions.length],
      categoryId: subCategory ? subCategory.id : 'cat_all'
    };
  });
  
  storeDetailData.id = store.id;
  storeDetailData.name = store.name;
  storeDetailData.logo = store.logo;
  storeDetailData.description = store.description + '。我们致力于为消费者提供最优质的产品和服务，正品保证，全国联保。';
  storeDetailData.productCount = store.productCount;
  storeDetailData.followerCount = store.followerCount;
  storeDetailData.openTime = store.openTime;
  storeDetailData.isFollowed = store.isFollowed;
  storeDetailData.categories = categories;
  storeDetailData.products = products;
  
  return storeDetailData;
}

// 检查用户是否登录
function isLoggedIn() {
  const role = localStorage.getItem('role');
  return role && role !== 'guest';
}

// ========== 商城首页 Mock 数据（线框/字段与功能规划一致） ==========
// 使用方式：页面加载时调用 initHomePageData()，再使用 homePageData

const homePageData = {
  // Tab 页切换区：首页 | 平台公告 | 阳光见证链
  tabTabs: [
    { id: 'home', name: '首页', active: true },
    { id: 'announce', name: '平台公告', active: false },
    { id: 'witness', name: '阳光见证链', active: false }
  ],
  // 左侧商品分类（一级）+ 悬停展开用：二级分类 + 热门品牌/商品
  categories: [],
  // 推广轮播页（核心展示区右侧）
  carousel: [],
  // 入驻供应商（两行每行 6 个，卡片含图片、名称、主营业务）
  settledSuppliers: [],
  // 底部商城信息（服务承诺条）
  footerServices: []
};

/**
 * 初始化商城首页 Mock 数据（可直接在 mock.js 内按需填充或从接口替换）
 */
function initHomePageData() {
  // ---------- 一级分类（14 个）+ 每类 5 个二级 + 每二级 5 个三级 + 每类 3 个热门商品 ----------
  homePageData.categories = [
    { id: 'cat_01', name: '办公用品、电脑数码', icon: 'fa-laptop', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c01_01', name: '办公用纸', link: '#', children: ['复印纸', '打印纸', '传真纸', '便签纸', '牛皮纸'] },
        { id: 'c01_02', name: '书写用品', link: '#', children: ['中性笔', '圆珠笔', '铅笔', '记号笔', '白板笔'] },
        { id: 'c01_03', name: '办公设备', link: '#', children: ['打印机', '复印机', '扫描仪', '碎纸机', '装订机'] },
        { id: 'c01_04', name: '电脑整机', link: '#', children: ['台式机', '笔记本', '一体机', '工作站', '服务器'] },
        { id: 'c01_05', name: '数码配件', link: '#', children: ['U盘', '移动硬盘', '键盘', '鼠标', '显示器'] }
      ],
      hotProducts: [
        { name: '得力 A4 复印纸 70g 500张/包', price: 25.8, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=120&h=120&fit=crop', link: '#' },
        { name: '惠普 LaserJet 激光打印机', price: 1299, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=120&h=120&fit=crop', link: '#' },
        { name: '罗技无线键鼠套装', price: 189, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_02', name: '个人防护、安全防护', icon: 'fa-hard-hat', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c02_01', name: '头部防护', link: '#', children: ['安全帽', '防护眼镜', '护目镜', '防毒面罩', '耳塞'] },
        { id: 'c02_02', name: '呼吸防护', link: '#', children: ['口罩', '防尘面具', '防毒面具', '滤芯', '呼吸器'] },
        { id: 'c02_03', name: '手部防护', link: '#', children: ['手套', '指套', '防护袖套', '绝缘手套', '防割手套'] },
        { id: 'c02_04', name: '身体防护', link: '#', children: ['工作服', '反光背心', '防护服', '围裙', '雨衣'] },
        { id: 'c02_05', name: '安全鞋', link: '#', children: ['安全鞋', '防静电鞋', '绝缘鞋', '防砸鞋', '防滑鞋'] }
      ],
      hotProducts: [
        { name: '3M 安全帽 V 型', price: 45, image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=120&h=120&fit=crop', link: '#' },
        { name: '霍尼韦尔 KN95 防护口罩 50只', price: 89, image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b34b?w=120&h=120&fit=crop', link: '#' },
        { name: '星宇 PVC 浸胶劳保手套', price: 58, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_03', name: '工具耗材、机床数控', icon: 'fa-wrench', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c03_01', name: '手动工具', link: '#', children: ['扳手', '螺丝刀', '钳子', '锤子', '卷尺'] },
        { id: 'c03_02', name: '电动工具', link: '#', children: ['电钻', '角磨机', '切割机', '电锤', '抛光机'] },
        { id: 'c03_03', name: '机床配件', link: '#', children: ['刀片', '钻头', '砂轮', '锯片', '铣刀'] },
        { id: 'c03_04', name: '数控耗材', link: '#', children: ['数控刀柄', '刀片', '冷却液', '切削液', '导轨油'] },
        { id: 'c03_05', name: '测量工具', link: '#', children: ['游标卡尺', '千分尺', '水平仪', '角尺', '塞规'] }
      ],
      hotProducts: [
        { name: '博世 GSR 手电钻 13mm', price: 299, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=120&h=120&fit=crop', link: '#' },
        { name: '世达 32 件套筒扳手', price: 268, image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=120&h=120&fit=crop', link: '#' },
        { name: '三丰游标卡尺 150mm', price: 158, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_04', name: '清洁用品、清洁设备', icon: 'fa-broom', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c04_01', name: '清洁剂', link: '#', children: ['洗洁精', '消毒液', '玻璃水', '除垢剂', '洁厕剂'] },
        { id: 'c04_02', name: '清洁工具', link: '#', children: ['拖把', '扫帚', '抹布', '垃圾桶', '垃圾袋'] },
        { id: 'c04_03', name: '清洁设备', link: '#', children: ['洗地机', '吸尘器', '高压清洗机', '扫地车', '擦窗机'] },
        { id: 'c04_04', name: '环卫用品', link: '#', children: ['环卫服', '环卫车', '清洁车', '洒水车', '垃圾箱'] },
        { id: 'c04_05', name: '消杀用品', link: '#', children: ['杀虫剂', '消毒剂', '除菌液', '防霉剂', '空气清新剂'] }
      ],
      hotProducts: [
        { name: '威猛先生 厨房清洁剂', price: 18.9, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b39?w=120&h=120&fit=crop', link: '#' },
        { name: '科沃斯商用洗地机', price: 3999, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop', link: '#' },
        { name: '妙洁 拖把 旋转脱水', price: 89, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b39?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_05', name: '电气工控、工业自动', icon: 'fa-bolt', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c05_01', name: '低压电气', link: '#', children: ['断路器', '接触器', '继电器', '开关', '插座'] },
        { id: 'c05_02', name: '工控元件', link: '#', children: ['PLC', '变频器', '伺服', '传感器', '编码器'] },
        { id: 'c05_03', name: '工业自动化', link: '#', children: ['工业机器人', '机械手', '传送带', 'AGV', '视觉系统'] },
        { id: 'c05_04', name: '电线电缆', link: '#', children: ['电力电缆', '控制电缆', '通信电缆', '特种电缆', '电缆附件'] },
        { id: 'c05_05', name: '电源电池', link: '#', children: ['UPS', '蓄电池', '开关电源', '变压器', '稳压器'] }
      ],
      hotProducts: [
        { name: '施耐德 小型断路器 C32A', price: 68, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop', link: '#' },
        { name: '西门子 PLC S7-200', price: 1280, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop', link: '#' },
        { name: '正泰 交流接触器 40A', price: 95, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_06', name: '机械流体、紧固密封', icon: 'fa-cogs', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c06_01', name: '紧固件', link: '#', children: ['螺栓', '螺母', '垫片', '销钉', '铆钉'] },
        { id: 'c06_02', name: '传动件', link: '#', children: ['轴承', '皮带', '链条', '联轴器', '减速机'] },
        { id: 'c06_03', name: '密封件', link: '#', children: ['O型圈', '油封', '垫片', '密封胶', '填料'] },
        { id: 'c06_04', name: '液压气动', link: '#', children: ['液压泵', '气缸', '电磁阀', '油缸', '气动元件'] },
        { id: 'c06_05', name: '管件阀门', link: '#', children: ['球阀', '闸阀', '管接头', '软管', '法兰'] }
      ],
      hotProducts: [
        { name: 'SKF 深沟球轴承 6205', price: 35, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' },
        { name: '不锈钢螺栓 M8*30 304', price: 0.8, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' },
        { name: '氟橡胶 O型圈 套装', price: 28, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_07', name: '工业设备、仓储照明', icon: 'fa-warehouse', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c07_01', name: '仓储设备', link: '#', children: ['货架', '托盘', '周转箱', '叉车', '堆高车'] },
        { id: 'c07_02', name: '工业照明', link: '#', children: ['工矿灯', 'LED灯', '防爆灯', '应急灯', '路灯'] },
        { id: 'c07_03', name: '搬运设备', link: '#', children: ['手推车', '液压车', '升降平台', '传送带', '起重机'] },
        { id: 'c07_04', name: '包装设备', link: '#', children: ['封口机', '打包机', '缠绕机', '贴标机', '灌装机'] },
        { id: 'c07_05', name: '车间设备', link: '#', children: ['工作台', '工具柜', '零件柜', '线棒架', '流水线'] }
      ],
      hotProducts: [
        { name: '重型货架 2000*800*400', price: 380, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&h=120&fit=crop', link: '#' },
        { name: '雷士 LED 工矿灯 100W', price: 168, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop', link: '#' },
        { name: '手动液压搬运车 2T', price: 1280, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_08', name: '测量检测、仪器仪表', icon: 'fa-ruler-combined', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c08_01', name: '测量仪器', link: '#', children: ['游标卡尺', '千分尺', '高度尺', '百分表', '水平仪'] },
        { id: 'c08_02', name: '检测设备', link: '#', children: ['硬度计', '测厚仪', '探伤仪', '显微镜', '放大镜'] },
        { id: 'c08_03', name: '电工仪表', link: '#', children: ['万用表', '钳形表', '兆欧表', '接地电阻仪', '示波器'] },
        { id: 'c08_04', name: '温度压力', link: '#', children: ['温度计', '压力表', '流量计', '温控仪', '记录仪'] },
        { id: 'c08_05', name: '光学仪器', link: '#', children: ['激光测距仪', '水准仪', '全站仪', '经纬仪', '望远镜'] }
      ],
      hotProducts: [
        { name: '福禄克 数字万用表 17B+', price: 399, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' },
        { name: '三丰 数显千分尺 0-25mm', price: 428, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' },
        { name: '优利德 激光测距仪 40m', price: 199, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_09', name: '焊接切割、五金农林', icon: 'fa-fire', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c09_01', name: '焊接设备', link: '#', children: ['电焊机', '氩弧焊机', '二保焊机', '焊枪', '焊把'] },
        { id: 'c09_02', name: '切割设备', link: '#', children: ['切割机', '等离子切割', '激光切割', '割枪', '割嘴'] },
        { id: 'c09_03', name: '焊材耗材', link: '#', children: ['焊条', '焊丝', '焊剂', '保护气', '钨极'] },
        { id: 'c09_04', name: '五金工具', link: '#', children: ['扳手', '螺丝', '钉子', '铰链', '锁具'] },
        { id: 'c09_05', name: '农林用品', link: '#', children: ['农具', '园艺工具', '农药', '肥料', '种子'] }
      ],
      hotProducts: [
        { name: '瑞凌 逆变焊机 ZX7-200', price: 458, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' },
        { name: '金桥 焊条 J422 2.5mm', price: 6.5, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' },
        { name: '角磨机 切割片 100片装', price: 68, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_10', name: '建筑行业、建筑材料', icon: 'fa-building', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c10_01', name: '水泥砂浆', link: '#', children: ['水泥', '沙子', '砂浆', '腻子', '石膏'] },
        { id: 'c10_02', name: '建材辅料', link: '#', children: ['防水材料', '保温材料', '瓷砖胶', '填缝剂', '密封胶'] },
        { id: 'c10_03', name: '建筑五金', link: '#', children: ['膨胀螺栓', '吊件', '龙骨', '扣件', '脚手架'] },
        { id: 'c10_04', name: '装饰材料', link: '#', children: ['涂料', '墙纸', '地板', '吊顶', '隔断'] },
        { id: 'c10_05', name: '管道管材', link: '#', children: ['PVC管', '钢管', '铜管', 'PE管', '管件'] }
      ],
      hotProducts: [
        { name: '海螺 水泥 42.5 袋装', price: 28, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' },
        { name: '德高 瓷砖胶 20kg', price: 68, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b39?w=120&h=120&fit=crop', link: '#' },
        { name: '膨胀螺栓 M10*80 镀锌', price: 1.2, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_11', name: '实验器材、化学试剂', icon: 'fa-flask', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c11_01', name: '玻璃器皿', link: '#', children: ['烧杯', '量筒', '试管', '锥形瓶', '容量瓶'] },
        { id: 'c11_02', name: '实验仪器', link: '#', children: ['显微镜', '离心机', '天平', 'pH计', '分光光度计'] },
        { id: 'c11_03', name: '化学试剂', link: '#', children: ['酸碱试剂', '有机试剂', '标准溶液', '指示剂', '缓冲液'] },
        { id: 'c11_04', name: '防护用品', link: '#', children: ['白大褂', '护目镜', '手套', '通风柜', '洗眼器'] },
        { id: 'c11_05', name: '实验室家具', link: '#', children: ['实验台', '通风柜', '药品柜', '器皿柜', '天平台'] }
      ],
      hotProducts: [
        { name: '玻璃烧杯 500ml 刻度', price: 12, image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=120&h=120&fit=crop', link: '#' },
        { name: '梅特勒 电子天平 0.1mg', price: 2580, image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=120&h=120&fit=crop', link: '#' },
        { name: '盐酸 分析纯 500ml', price: 25, image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_12', name: '食品饮料、家居日用', icon: 'fa-wine-bottle', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c12_01', name: '休闲食品', link: '#', children: ['零食', '坚果', '糖果', '饼干', '巧克力'] },
        { id: 'c12_02', name: '饮料水饮', link: '#', children: ['矿泉水', '茶饮', '果汁', '咖啡', '功能饮料'] },
        { id: 'c12_03', name: '粮油调味', link: '#', children: ['大米', '食用油', '酱油', '醋', '调味料'] },
        { id: 'c12_04', name: '家居日用', link: '#', children: ['纸巾', '洗衣液', '洗洁精', '收纳', '清洁'] },
        { id: 'c12_05', name: '个护美妆', link: '#', children: ['洗发水', '沐浴露', '护肤品', '牙膏', '香皂'] }
      ],
      hotProducts: [
        { name: '农夫山泉 天然水 550ml*24瓶', price: 38, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=120&h=120&fit=crop', link: '#' },
        { name: '维达 抽纸 3层*130抽*20包', price: 52, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b39?w=120&h=120&fit=crop', link: '#' },
        { name: '金龙鱼 食用油 5L', price: 68, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_13', name: '餐饮设备、商务礼品', icon: 'fa-utensils', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c13_01', name: '厨房设备', link: '#', children: ['灶具', '冰箱', '烤箱', '蒸柜', '洗碗机'] },
        { id: 'c13_02', name: '餐饮用具', link: '#', children: ['餐具', '厨具', '不锈钢制品', '陶瓷', '玻璃杯'] },
        { id: 'c13_03', name: '商用电器', link: '#', children: ['商用冰箱', '制冰机', '咖啡机', '榨汁机', '电磁炉'] },
        { id: 'c13_04', name: '商务礼品', link: '#', children: ['定制礼品', '办公礼品', '节日礼品', '促销品', '纪念品'] },
        { id: 'c13_05', name: '员工福利', link: '#', children: ['福利卡', '节日福利', '生日福利', '体检', '团建'] }
      ],
      hotProducts: [
        { name: '商用双门冰箱 600L', price: 3999, image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=120&h=120&fit=crop', link: '#' },
        { name: '定制商务礼品 保温杯', price: 88, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=120&h=120&fit=crop', link: '#' },
        { name: '不锈钢商用汤桶 50L', price: 268, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b39?w=120&h=120&fit=crop', link: '#' }
      ]
    },
    { id: 'cat_14', name: '运动户外、汽车用品', icon: 'fa-running', link: '#', servicePhone: '400-680-9696',
      children: [
        { id: 'c14_01', name: '运动器材', link: '#', children: ['健身器材', '球类', '瑜伽', '跑步', '骑行'] },
        { id: 'c14_02', name: '户外用品', link: '#', children: ['帐篷', '睡袋', '背包', '登山杖', '户外服装'] },
        { id: 'c14_03', name: '汽车配件', link: '#', children: ['轮胎', '机油', '滤芯', '蓄电池', '雨刷'] },
        { id: 'c14_04', name: '汽车用品', link: '#', children: ['坐垫', '脚垫', '车载电器', '清洁用品', '装饰'] },
        { id: 'c14_05', name: '劳保鞋服', link: '#', children: ['安全鞋', '工作服', '反光衣', '劳保手套', '防护镜'] }
      ],
      hotProducts: [
        { name: '李宁 运动T恤 速干', price: 129, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop', link: '#' },
        { name: '车载充气泵 数显', price: 158, image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=120&h=120&fit=crop', link: '#' },
        { name: '骆驼 户外双人帐篷', price: 299, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=120&h=120&fit=crop', link: '#' }
      ]
    }
  ];

  // ---------- 推广轮播页（16:9 比例，接入真实商城促销图） ----------
  homePageData.carousel = [
    { id: 'c1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=675&fit=crop', title: '年终大促', subTitle: '全场满减 · 限时特惠', tag: '促销', link: '#', sortOrder: 1 },
    { id: 'c2', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=675&fit=crop', title: '阳光优采平台', subTitle: '依托一物一码 · 比质比价新模式', tag: '平台', link: '#', sortOrder: 2 },
    { id: 'c3', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=675&fit=crop', title: '办公用品专区', subTitle: '办公耗材 · 电脑数码 低至5折', tag: '专区', link: '#', sortOrder: 3 },
    { id: 'c4', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=675&fit=crop', title: '个人防护专场', subTitle: '20+高危场景防护指南', tag: '防护', link: '#', sortOrder: 4 }
  ];

  // ---------- 入驻供应商（两行每行 6 个：名称 + 主营业务 + 图片） ----------
  homePageData.settledSuppliers = [
    { id: 's1', name: '华信办公物资有限公司', business: '办公耗材+办公设备', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop', link: '#', sortOrder: 1 },
    { id: 's2', name: '安盾劳保安防科技有限公司', business: '个人防护装备+消防器材', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=250&fit=crop', link: '#', sortOrder: 2 },
    { id: 's3', name: '恒信工业零部件有限公司', business: '紧固件+传动件', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop', link: '#', sortOrder: 3 },
    { id: 's4', name: '康泰医疗设备有限公司', business: '医疗设备+护理器械', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=250&fit=crop', link: '#', sortOrder: 4 },
    { id: 's5', name: '创科电子科技有限公司', business: 'IT 数码+网络设备', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop', link: '#', sortOrder: 5 },
    { id: 's6', name: '绿源食品供应链有限公司', business: '员工福利食品+商务礼品', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop', link: '#', sortOrder: 6 },
    { id: 's7', name: '鑫盛办公家具有限公司', business: '办公桌椅+文件存储', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop', link: '#', sortOrder: 7 },
    { id: 's8', name: '恒达物流包装有限公司', business: '通用包装+定制包装', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=250&fit=crop', link: '#', sortOrder: 8 },
    { id: 's9', name: '博瑞印刷文创有限公司', business: '企业印刷品+仓储印刷品', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop', link: '#', sortOrder: 9 },
    { id: 's10', name: '锦程化工原料有限公司', business: '工业化工原料+实验室试剂', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop', link: '#', sortOrder: 10 },
    { id: 's11', name: '锐科五金工具有限公司', business: '手动工具+电动工具', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop', link: '#', sortOrder: 11 },
    { id: 's12', name: '悦礼企业礼品有限公司', business: '定制商务礼品+员工福利礼品', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=250&fit=crop', link: '#', sortOrder: 12 }
  ];

  // ---------- 底部商城信息（服务承诺条） ----------
  homePageData.footerServices = [
    { id: 'f1', icon: 'fa-shield-alt', text: '正品保障', link: '' },
    { id: 'f2', icon: 'fa-truck', text: '货期保证', link: '' },
    { id: 'f3', icon: 'fa-headset', text: '专属客服', link: '' },
    { id: 'f4', icon: 'fa-sun', text: '阳光采购', link: '' },
    { id: 'f5', icon: 'fa-gem', text: '诚信服务', link: '' }
  ];

  return homePageData;
}

// 导出数据（供页面使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    dashboardData, 
    formatCurrency, 
    formatNumber,
    storeListData,
    storeDetailData,
    initStoreListData,
    initStoreDetailData,
    isLoggedIn,
    homePageData,
    initHomePageData
  };
}
