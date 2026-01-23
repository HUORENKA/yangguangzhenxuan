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
    isLoggedIn
  };
}
