/**
 * 国采E购 — 系统管理（用户/角色/部门）Mock 数据
 * 菜单仅在角色配置中勾选，无独立菜单管理。
 */
(function (global) {
  'use strict';

  var DATA_SCOPES = [
    { value: '1', label: '全部数据权限' },
    { value: '2', label: '自定数据权限' },
    { value: '3', label: '本部门数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' },
    { value: '6', label: '部门及以下或本人数据权限' }
  ];

  /** 角色表单中的权限范围（仅三项） */
  var ROLE_FORM_DATA_SCOPES = [
    { value: '1', label: '全部数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' }
  ];

  function scopeLabel(v) {
    var f = DATA_SCOPES.find(function (d) { return d.value === String(v); });
    return f ? f.label : '—';
  }

  /** 菜单树：目录 / 菜单 / 按钮(F) */
  var MENU_TREES = {
    operator: [
      { id: 'op_root', label: '根目录', children: [
        { id: 'op_biz', label: '业务运营', children: [
          { id: 'op_dashboard', label: '工作台首页' },
          { id: 'op_station', label: '分站管理' },
          { id: 'op_supplier', label: '供应商管理' },
          { id: 'op_buyer', label: '采购商管理' },
          { id: 'op_product_audit', label: '商品上架审核' },
          { id: 'op_notice', label: '平台公告管理' },
          { id: 'op_po', label: '采购单管理' },
          { id: 'op_orders', label: '订单管理' },
          { id: 'op_settlement', label: '结算管理' },
          { id: 'op_cockpit', label: '数据驾驶舱' }
        ]},
        { id: 'op_sys', label: '系统管理', children: [
          { id: 'op_sys_user', label: '用户管理' },
          { id: 'op_sys_role', label: '角色管理' },
          { id: 'op_sys_dept', label: '部门管理' },
          { id: 'op_sys_role_add', label: '新增角色', type: 'F' },
          { id: 'op_sys_role_edit', label: '编辑角色', type: 'F' },
          { id: 'op_sys_role_del', label: '删除角色', type: 'F' },
          { id: 'op_sys_role_export', label: '导出角色', type: 'F' }
        ]}
      ]}
    ],
    buyer: [
      { id: 'by_root', label: '根目录', children: [
        { id: 'by_wb', label: '采购工作台', children: [
          { id: 'by_home', label: '首页' },
          { id: 'by_bid', label: '竞价/询价' },
          { id: 'by_po', label: '采购单' },
          { id: 'by_orders', label: '订单管理' },
          { id: 'by_after', label: '售后管理' },
          { id: 'by_contract', label: '合同签署' },
          { id: 'by_law', label: '采购法规' },
          { id: 'by_settlement', label: '结算订单' },
          { id: 'by_fav', label: '我的收藏' }
        ]},
        { id: 'by_sys', label: '系统管理', children: [
          { id: 'by_sys_user', label: '用户管理' },
          { id: 'by_sys_role', label: '角色管理' },
          { id: 'by_sys_dept', label: '部门管理' }
        ]}
      ]}
    ],
    supplier: [
      { id: 'sp_root', label: '根目录', children: [
        { id: 'sp_wb', label: '供应商工作台', children: [
          { id: 'sp_home', label: '首页' },
          { id: 'sp_warehouse', label: '仓库管理' },
          { id: 'sp_goods', label: '我的商品' },
          { id: 'sp_po', label: '采购单' },
          { id: 'sp_orders', label: '订单管理' },
          { id: 'sp_after', label: '售后管理' },
          { id: 'sp_contract', label: '合同签署' },
          { id: 'sp_settlement', label: '采购订单结算' },
          { id: 'sp_platform_settle', label: '平台结算管理' }
        ]},
        { id: 'sp_sys', label: '系统管理', children: [
          { id: 'sp_sys_user', label: '用户管理' },
          { id: 'sp_sys_role', label: '角色管理' },
          { id: 'sp_sys_dept', label: '部门管理' }
        ]}
      ]}
    ]
  };

  /** 共享单位（角色可授权到的组织） */
  var ORG_UNITS = [
    { id: 'org_op', type: 'operator', name: '国采E购运营中心' },
    { id: 'org_sp_yq', type: 'supplier', name: '雨前供应商有限公司' },
    { id: 'org_sp_dl', type: 'supplier', name: '浙江得力办公用品有限公司' },
    { id: 'org_sp_hb', type: 'supplier', name: '华北办公用品有限公司' },
    { id: 'org_sp_hn', type: 'supplier', name: '华南后勤服务有限公司' },
    { id: 'org_by_sh', type: 'buyer', name: '上海电信采购' },
    { id: 'org_by_bj', type: 'buyer', name: '北京市某某局采购中心' },
    { id: 'org_by_yy', type: 'buyer', name: '某某公立医院' }
  ];

  var DEFAULT_ROLES = {
    operator: [
      { id: 'r_op_1', roleName: '管理员', roleKey: 'admin', sort: 1, dataScope: '1', status: '0', sharedUnitIds: ['org_op','org_sp_yq','org_sp_dl','org_sp_hb','org_sp_hn','org_by_sh','org_by_bj','org_by_yy'], menuIds: ['op_root','op_biz','op_sys','op_dashboard','op_station','op_supplier','op_buyer','op_product_audit','op_notice','op_po','op_orders','op_settlement','op_cockpit','op_sys_user','op_sys_role','op_sys_dept','op_sys_role_add','op_sys_role_edit','op_sys_role_del','op_sys_role_export'], customDeptIds: [], remark: '预置超级管理员', preset: true, createTime: '2026-05-07 18:27:34' },
      { id: 'r_op_2', roleName: '运营专员', roleKey: 'operator_staff', sort: 2, dataScope: '4', status: '0', sharedUnitIds: ['org_op'], menuIds: ['op_root','op_biz','op_dashboard','op_station','op_supplier','op_buyer','op_product_audit','op_notice'], customDeptIds: [], remark: '', preset: false, createTime: '2026-05-08 10:15:00' },
      { id: 'r_op_3', roleName: '供应商协同角色', roleKey: 'supplier_collab', sort: 3, dataScope: '2', status: '0', sharedUnitIds: ['org_sp_yq','org_sp_dl','org_sp_hb'], menuIds: ['op_root','op_biz','op_supplier'], customDeptIds: [], remark: '多供应商共享', preset: false, createTime: '2026-05-12 09:00:00' }
    ],
    buyer: [
      { id: 'r_by_1', roleName: '单位管理员', roleKey: 'buyer_admin', sort: 1, dataScope: '1', status: '0', menuIds: ['by_root','by_wb','by_sys','by_home','by_bid','by_po','by_orders','by_after','by_contract','by_law','by_settlement','by_fav','by_sys_user','by_sys_role','by_sys_dept'], customDeptIds: [], remark: '预置', preset: true, createTime: '2026-05-07 18:27:34' },
      { id: 'r_by_2', roleName: '采购专员', roleKey: 'cgzy', sort: 2, dataScope: '5', status: '0', menuIds: ['by_root','by_wb','by_home','by_bid','by_po','by_orders','by_settlement'], customDeptIds: [], remark: '', preset: false, createTime: '2026-05-07 18:28:10' }
    ],
    supplier: [
      { id: 'r_sp_1', roleName: '企业管理员', roleKey: 'supplier_admin', sort: 1, dataScope: '1', status: '0', menuIds: ['sp_root','sp_wb','sp_sys','sp_home','sp_warehouse','sp_goods','sp_po','sp_orders','sp_after','sp_contract','sp_settlement','sp_platform_settle','sp_sys_user','sp_sys_role','sp_sys_dept'], customDeptIds: [], remark: '预置', preset: true, createTime: '2026-05-07 18:27:34' },
      { id: 'r_sp_2', roleName: '订单履约', roleKey: 'order_ops', sort: 2, dataScope: '5', status: '0', menuIds: ['sp_root','sp_wb','sp_home','sp_orders','sp_after'], customDeptIds: [], remark: '', preset: false, createTime: '2026-05-10 09:00:00' }
    ]
  };

  function deptNode(id, parentId, label, extra) {
    extra = extra || {};
    return {
      id: id,
      parentId: parentId,
      label: label,
      orgType: extra.orgType || '',
      orgUnitId: extra.orgUnitId || '',
      sort: extra.sort != null ? extra.sort : 1,
      status: extra.status != null ? extra.status : '0',
      children: extra.children || []
    };
  }

  /** 部门树按业务域分 scope：supplier=运营商+各供应商一级；buyer=各采购商一级 */
  var DEFAULT_DEPTS = {
    supplier: [
      deptNode('d_op_1', '0', '国采E购运营中心', { orgType: 'operator', orgUnitId: 'org_op', sort: 1, children: [
        deptNode('d_op_1_1', 'd_op_1', '平台运营部', { sort: 1 }),
        deptNode('d_op_1_2', 'd_op_1', '审核与风控部', { sort: 2 })
      ]}),
      deptNode('d_sp_yq', '0', '雨前供应商有限公司', { orgType: 'supplier', orgUnitId: 'org_sp_yq', sort: 2, children: [
        deptNode('d_sp_yq_1', 'd_sp_yq', '销售部', { sort: 1 }),
        deptNode('d_sp_yq_2', 'd_sp_yq', '仓储部', { sort: 2 })
      ]}),
      deptNode('d_sp_dl', '0', '浙江得力办公用品有限公司', { orgType: 'supplier', orgUnitId: 'org_sp_dl', sort: 3, children: [
        deptNode('d_sp_dl_1', 'd_sp_dl', '销售部', { sort: 1 })
      ]}),
      deptNode('d_sp_hb', '0', '华北办公用品有限公司', { orgType: 'supplier', orgUnitId: 'org_sp_hb', sort: 4, children: [
        deptNode('d_sp_hb_1', 'd_sp_hb', '销售部', { sort: 1 })
      ]}),
      deptNode('d_sp_hn', '0', '华南后勤服务有限公司', { orgType: 'supplier', orgUnitId: 'org_sp_hn', sort: 5, children: [
        deptNode('d_sp_hn_1', 'd_sp_hn', '履约部', { sort: 1 })
      ]})
    ],
    buyer: [
      deptNode('d_by_sh', '0', '上海电信采购', { orgType: 'buyer', orgUnitId: 'org_by_sh', children: [
        deptNode('d_by_sh_1', 'd_by_sh', '采购一部', { sort: 1 }),
        deptNode('d_by_sh_2', 'd_by_sh', '采购二部', { sort: 2 })
      ]}),
      deptNode('d_by_bj', '0', '北京市某某局采购中心', { orgType: 'buyer', orgUnitId: 'org_by_bj', children: [
        deptNode('d_by_bj_1', 'd_by_bj', '综合采购科', { sort: 1 })
      ]}),
      deptNode('d_by_yy', '0', '某某公立医院', { orgType: 'buyer', orgUnitId: 'org_by_yy', children: [
        deptNode('d_by_yy_1', 'd_by_yy', '设备采购组', { sort: 1 })
      ]})
    ],
    operator: [
      deptNode('d_op_1', '0', '国采E购运营中心', { orgType: 'operator', orgUnitId: 'org_op', sort: 1, children: [
        deptNode('d_op_1_1', 'd_op_1', '平台运营部', { sort: 1 }),
        deptNode('d_op_1_2', 'd_op_1', '审核与风控部', { sort: 2 })
      ]})
    ]
  };

  var DEFAULT_ORG_BY_CLIENT = {
    supplier: 'org_sp_yq',
    buyer: 'org_by_sh'
  };

  /** 默认角色模板（运营商后台「默认角色配置」） */
  var DEFAULT_ROLE_TEMPLATES = [
    { id: 'rt_op_admin', roleName: '管理员（默认）', roleKey: 'tpl_admin', sort: 1, dataScope: '1', status: '0', menuIds: ['op_root','op_biz','op_sys','op_dashboard','op_station','op_supplier','op_buyer','op_product_audit','op_notice','op_po','op_orders','op_settlement','op_cockpit','op_sys_user','op_sys_role','op_sys_dept'], remark: '适用于运营商单位', createBy: '系统', createTime: '2026-05-07 18:27:34' },
    { id: 'rt_op_staff', roleName: '运营专员（默认）', roleKey: 'tpl_staff', sort: 2, dataScope: '4', status: '0', menuIds: ['op_root','op_biz','op_dashboard','op_station','op_supplier','op_buyer','op_product_audit','op_notice'], remark: '', createBy: '系统', createTime: '2026-05-08 10:15:00' },
    { id: 'rt_sp_admin', roleName: '企业管理员（默认）', roleKey: 'tpl_sp_admin', sort: 3, dataScope: '1', status: '0', menuIds: ['sp_root','sp_wb','sp_sys','sp_home','sp_warehouse','sp_goods','sp_po','sp_orders','sp_after','sp_contract','sp_settlement','sp_platform_settle','sp_sys_user','sp_sys_role','sp_sys_dept'], remark: '适用于供应商', createBy: '系统', createTime: '2026-05-07 18:28:00' },
    { id: 'rt_by_admin', roleName: '单位管理员（默认）', roleKey: 'tpl_by_admin', sort: 4, dataScope: '1', status: '0', menuIds: ['by_root','by_wb','by_sys','by_home','by_po','by_orders','by_after','by_contract','by_law','by_settlement','by_fav','by_sys_user','by_sys_role','by_sys_dept'], remark: '适用于采购商', createBy: '系统', createTime: '2026-05-07 18:28:10' }
  ];

  /** 各单位实例角色（运营商后台「角色列表」按单位展示） */
  var DEFAULT_UNIT_ROLES = {
    supplier: [
      { id: 'ur_op_1', orgUnitId: 'org_op', roleName: '管理员', templateRoleId: 'rt_op_admin', createBy: 'admin', createTime: '2026-05-07 18:27:34', sort: 1, dataScope: '1', status: '0', menuIds: ['op_root','op_biz','op_sys','op_dashboard','op_station','op_supplier','op_buyer','op_product_audit','op_notice','op_po','op_orders','op_settlement','op_cockpit','op_sys_user','op_sys_role','op_sys_dept'], remark: '' },
      { id: 'ur_op_2', orgUnitId: 'org_op', roleName: '运营专员', templateRoleId: 'rt_op_staff', createBy: 'admin', createTime: '2026-05-08 10:15:00', sort: 2, dataScope: '4', status: '0', menuIds: ['op_root','op_biz','op_dashboard','op_station','op_supplier','op_buyer','op_product_audit','op_notice'], remark: '' },
      { id: 'ur_yq_1', orgUnitId: 'org_sp_yq', roleName: '企业管理员', templateRoleId: 'rt_sp_admin', createBy: 'admin', createTime: '2026-05-07 18:27:35', sort: 1, dataScope: '1', status: '0', menuIds: ['sp_root','sp_wb','sp_sys','sp_home','sp_warehouse','sp_goods','sp_po','sp_orders','sp_after','sp_contract','sp_settlement','sp_platform_settle','sp_sys_user','sp_sys_role','sp_sys_dept'], remark: '' },
      { id: 'ur_dl_1', orgUnitId: 'org_sp_dl', roleName: '企业管理员', templateRoleId: 'rt_sp_admin', createBy: 'admin', createTime: '2026-05-09 11:00:00', sort: 1, dataScope: '1', status: '0', menuIds: ['sp_root','sp_wb','sp_sys','sp_home','sp_orders'], remark: '' }
    ],
    buyer: [
      { id: 'ur_sh_1', orgUnitId: 'org_by_sh', roleName: '单位管理员', templateRoleId: 'rt_by_admin', createBy: 'admin', createTime: '2026-05-07 18:27:34', sort: 1, dataScope: '1', status: '0', menuIds: ['by_root','by_wb','by_sys','by_home','by_po','by_orders','by_after','by_contract','by_law','by_settlement','by_fav','by_sys_user','by_sys_role','by_sys_dept'], remark: '' }
    ],
    operator: [
      { id: 'ur_op_only', orgUnitId: 'org_op', roleName: '管理员', templateRoleId: 'rt_op_admin', createBy: 'admin', createTime: '2026-05-07 18:27:34', sort: 1, dataScope: '1', status: '0', menuIds: ['op_root','op_biz','op_sys','op_dashboard','op_station','op_supplier','op_buyer','op_product_audit','op_notice','op_po','op_orders','op_settlement','op_cockpit','op_sys_user','op_sys_role','op_sys_dept'], remark: '' }
    ]
  };

  var DEFAULT_USERS = {
    operator: [
      { id: 'u_op_1', userName: 'admin', nickName: '管理员', deptId: 'd_op_1', phone: '21000000000', email: 'admin@gceg.demo', sex: '0', roleIds: ['ur_op_1'], status: '0', preset: true, createTime: '2026-05-07 18:27:35' },
      { id: 'u_op_2', userName: 'yyzy001', nickName: '运营专员', deptId: 'd_op_1_1', phone: '21000000011', email: 'ops@gceg.demo', sex: '0', roleIds: ['ur_op_2'], status: '0', preset: false, createTime: '2026-05-10 14:20:00' },
      { id: 'u_op_3', userName: 'ptyy01', nickName: '平台运营A', deptId: 'd_op_1_1', phone: '21000000012', email: '', sex: '0', roleIds: ['ur_op_1'], status: '0', createTime: '2026-05-11 09:00:00' },
      { id: 'u_op_4', userName: 'ptyy02', nickName: '平台运营B', deptId: 'd_op_1_1', phone: '21000000013', email: '', sex: '0', roleIds: ['ur_op_1'], status: '0', createTime: '2026-05-12 10:30:00' },
      { id: 'u_op_5', userName: 'shfk01', nickName: '审核专员', deptId: 'd_op_1_2', phone: '21000000014', email: '', sex: '0', roleIds: ['ur_op_2'], status: '0', createTime: '2026-05-13 14:00:00' }
    ],
    buyer: [
      { id: 'u_by_1', userName: 'admin', nickName: 'admin', deptId: 'd_by_sh', phone: '21000000001', email: '', sex: '0', roleIds: ['ur_sh_1'], status: '0', createTime: '2026-05-07 18:27:35' },
      { id: 'u_by_2', userName: 'cgzy001', nickName: '采购专员', deptId: 'd_by_sh_1', phone: '21000000002', email: '', sex: '0', roleIds: ['ur_sh_1'], status: '0', createTime: '2026-05-08 11:20:00' },
      { id: 'u_by_3', userName: 'cgzy002', nickName: '采购员小李', deptId: 'd_by_sh_2', phone: '21000000015', email: '', sex: '0', roleIds: ['ur_sh_1'], status: '0', createTime: '2026-05-09 16:20:00' }
    ],
    supplier: [
      { id: 'u_sp_1', userName: 'supplier_admin', nickName: '企业管理员', deptId: 'd_sp_yq', phone: '21000000003', email: '', sex: '0', roleIds: ['ur_yq_1'], status: '0', createTime: '2026-05-07 18:27:35' },
      { id: 'u_sp_2', userName: 'xs001', nickName: '销售专员', deptId: 'd_sp_yq_1', phone: '21000000016', email: '', sex: '0', roleIds: ['ur_yq_1'], status: '0', createTime: '2026-05-10 11:00:00' },
      { id: 'u_sp_3', userName: 'cc001', nickName: '仓储管理员', deptId: 'd_sp_yq_2', phone: '21000000017', email: '', sex: '0', roleIds: ['ur_yq_1'], status: '0', createTime: '2026-05-11 15:30:00' },
      { id: 'u_sp_4', userName: 'dl_admin', nickName: '得力管理员', deptId: 'd_sp_dl', phone: '21000000018', email: '', sex: '0', roleIds: ['ur_dl_1'], status: '0', createTime: '2026-05-12 09:00:00' }
    ]
  };

  function storageKey(clientType, entity) {
    return 'gc_rbac_' + clientType + '_' + entity;
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return JSON.parse(JSON.stringify(fallback));
      return JSON.parse(raw);
    } catch (e) {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function saveJson(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getMenuTree(clientType) {
    return MENU_TREES[clientType] || [];
  }

  function flattenMenu(nodes, out) {
    out = out || [];
    (nodes || []).forEach(function (n) {
      out.push(n);
      if (n.children && n.children.length) flattenMenu(n.children, out);
    });
    return out;
  }

  function getRoles(clientType) {
    var key = storageKey(clientType, 'roles');
    var list = loadJson(key, DEFAULT_ROLES[clientType] || []);
    list = ensurePresetRoles(list, clientType);
    if (!localStorage.getItem(key)) saveJson(key, list);
    return list;
  }

  function ensurePresetRoles(list, clientType) {
    var defaults = DEFAULT_ROLES[clientType] || [];
    var out = list.slice();
    defaults.forEach(function (def) {
      var idx = out.findIndex(function (r) { return r.id === def.id; });
      if (idx < 0) {
        out.unshift(JSON.parse(JSON.stringify(def)));
      } else {
        var cur = out[idx];
        if (!cur.sharedUnitIds || !cur.sharedUnitIds.length) cur.sharedUnitIds = def.sharedUnitIds || [];
        if (!cur.dataScope) cur.dataScope = def.dataScope;
        if (!cur.roleKey) cur.roleKey = def.roleKey;
        cur.preset = true;
      }
    });
    return out;
  }

  function getDeptPath(nodes, deptId) {
    if (!deptId || deptId === '0') return '无（顶级部门）';
    var flat = flattenDepts(nodes);
    var map = {};
    flat.forEach(function (d) { map[d.id] = d; });
    var parts = [];
    var cur = map[deptId];
    while (cur) {
      parts.unshift(cur.label);
      cur = cur.parentId && cur.parentId !== '0' ? map[cur.parentId] : null;
    }
    return parts.length ? parts.join(' / ') : '—';
  }

  function genRoleKey(roleName, existingRoles) {
    var base = (roleName || 'role').replace(/\s+/g, '_').replace(/[^\w]/g, '').toLowerCase() || 'role';
    var key = base;
    var n = 1;
    while (existingRoles.some(function (r) { return r.roleKey === key; })) {
      key = base + '_' + (n++);
    }
    return key;
  }

  function saveRoles(clientType, list) {
    saveJson(storageKey(clientType, 'roles'), list);
  }

  function defaultTemplatesKey() {
    return 'gc_rbac_default_role_templates';
  }

  function unitRolesKey(scope) {
    return 'gc_rbac_unit_roles_' + (scope || 'supplier');
  }

  function getDefaultRoleTemplates() {
    var key = defaultTemplatesKey();
    var list = loadJson(key, DEFAULT_ROLE_TEMPLATES);
    if (!localStorage.getItem(key)) saveJson(key, list);
    return list;
  }

  function saveDefaultRoleTemplates(list) {
    saveJson(defaultTemplatesKey(), list);
  }

  function getUnitRoles(scope) {
    scope = scope || getPageScope();
    var key = unitRolesKey(scope);
    var list = loadJson(key, DEFAULT_UNIT_ROLES[scope] || []);
    if (!localStorage.getItem(key)) saveJson(key, list);
    return list;
  }

  function saveUnitRoles(scope, list) {
    saveJson(unitRolesKey(scope || getPageScope()), list);
  }

  /** 部门树一级节点 = 组织单位（角色列表左侧用） */
  function getTopLevelUnitsForScope(scope) {
    var depts = getDepts(scope || getPageScope());
    return (depts || []).map(function (root) {
      return {
        orgUnitId: root.orgUnitId || root.id,
        label: root.label,
        deptId: root.id,
        orgType: root.orgType || ''
      };
    });
  }

  function getOrgUnitIdFromDeptId(deptId, depts) {
    if (!deptId) return '';
    var node = findDeptNode(depts, deptId);
    if (!node) return '';
    var cur = node;
    while (cur && cur.parentId && cur.parentId !== '0') {
      cur = findDeptNode(depts, cur.parentId);
    }
    return cur ? (cur.orgUnitId || cur.id) : '';
  }

  function getOrgUnitLabel(orgUnitId) {
    return getOrgUnitName(orgUnitId);
  }

  function getMenuTreeForOrgUnit(orgUnitId) {
    var u = ORG_UNITS.find(function (x) { return x.id === orgUnitId; });
    if (!u) return getMenuTree('operator');
    if (u.type === 'supplier') return getMenuTree('supplier');
    if (u.type === 'buyer') return getMenuTree('buyer');
    return getMenuTree('operator');
  }

  function getUserClientForScope(scope) {
    if (scope === 'buyer') return 'buyer';
    if (scope === 'supplier') return 'supplier';
    return 'operator';
  }

  function countUsersForUnitRole(scope, roleId) {
    var n = 0;
    ['operator', 'supplier', 'buyer'].forEach(function (client) {
      n += getUsers(client).filter(function (u) {
        return (u.roleIds || []).indexOf(roleId) >= 0;
      }).length;
    });
    return n;
  }

  function canDisableUnitRole(roleId) {
    return countUsersForUnitRole(null, roleId) === 0;
  }

  function applyTemplateToRole(template, partial) {
    partial = partial || {};
    return {
      roleName: partial.roleName || template.roleName.replace(/（默认）$/, ''),
      dataScope: template.dataScope,
      menuIds: (template.menuIds || []).slice(),
      sort: template.sort,
      templateRoleId: template.id,
      remark: template.remark || ''
    };
  }

  function getPageScope() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('scope')) return params.get('scope');
      if (params.get('client') === 'supplier' || params.get('client') === 'buyer') return params.get('client');
      return 'operator';
    } catch (e) {
      return 'operator';
    }
  }

  function getWorkbenchClient() {
    try {
      var c = new URLSearchParams(window.location.search).get('client');
      if (c === 'supplier' || c === 'buyer') return c;
    } catch (e) { /* ignore */ }
    return null;
  }

  function isWorkbenchPortal() {
    try {
      if (new URLSearchParams(window.location.search).get('portal') === 'workbench') return true;
    } catch (e) { /* ignore */ }
    return /_(system_(user|role|dept))\.html$/i.test(window.location.pathname || '');
  }

  function getCurrentOrgUnitId(clientType) {
    var key = 'gc_current_org_' + clientType;
    try {
      var saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch (e) { /* ignore */ }
    return DEFAULT_ORG_BY_CLIENT[clientType] || '';
  }

  function setCurrentOrgUnitId(clientType, orgUnitId) {
    localStorage.setItem('gc_current_org_' + clientType, orgUnitId);
  }

  function getOrgUnitName(orgUnitId) {
    var u = ORG_UNITS.find(function (x) { return x.id === orgUnitId; });
    return u ? u.name : '本单位';
  }

  function findUnitRoot(nodes, orgUnitId) {
    if (!orgUnitId || !nodes) return null;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.orgUnitId === orgUnitId) return n;
      var unit = ORG_UNITS.find(function (u) { return u.id === orgUnitId; });
      if (unit && n.label === unit.name) return n;
    }
    return null;
  }

  function cloneDeptTree(nodes) {
    return JSON.parse(JSON.stringify(nodes || []));
  }

  /** 仅返回当前单位及其下级部门树（工作台用） */
  function getUnitDeptTree(scope, orgUnitId) {
    var all = getDepts(scope);
    var root = findUnitRoot(all, orgUnitId);
    return root ? [cloneDeptTree(root)] : [];
  }

  function userBelongsToUnit(user, orgUnitId, scope) {
    if (!user || !user.deptId) return false;
    var all = getDepts(scope);
    var root = findUnitRoot(all, orgUnitId);
    if (!root) return true;
    var ids = getDeptSubtreeIds(all, root.id);
    return ids.indexOf(user.deptId) >= 0;
  }

  function deptIdInUnit(deptId, orgUnitId, scope) {
    if (!deptId) return false;
    var all = getDepts(scope);
    var root = findUnitRoot(all, orgUnitId);
    if (!root) return true;
    return getDeptSubtreeIds(all, root.id).indexOf(deptId) >= 0;
  }

  function getScopeLabel(scope) {
    return { supplier: '供应商', buyer: '采购商', operator: '运营商' }[scope] || '运营商';
  }

  function deptStorageKey(scope) {
    return 'gc_rbac_depts_' + (scope || 'operator');
  }

  function getDepts(scope) {
    scope = scope || getPageScope();
    var key = deptStorageKey(scope);
    var list = loadJson(key, DEFAULT_DEPTS[scope] || DEFAULT_DEPTS.operator || []);
    if (!localStorage.getItem(key)) saveJson(key, list);
    return list;
  }

  function saveDepts(scope, list) {
    saveJson(deptStorageKey(scope || getPageScope()), list);
  }

  function getOrgUnits(filterType) {
    if (!filterType) return ORG_UNITS.slice();
    return ORG_UNITS.filter(function (u) { return u.type === filterType || u.type === 'operator'; });
  }

  function getOrgUnitsForScope(scope) {
    if (scope === 'supplier') return ORG_UNITS.filter(function (u) { return u.type === 'supplier' || u.type === 'operator'; });
    if (scope === 'buyer') return ORG_UNITS.filter(function (u) { return u.type === 'buyer'; });
    return ORG_UNITS.slice();
  }

  function sharedUnitsLabel(ids) {
    if (!ids || !ids.length) return '—';
    return ids.map(function (id) {
      var u = ORG_UNITS.find(function (x) { return x.id === id; });
      return u ? u.name : id;
    }).join('、');
  }

  function flattenDepts(nodes, out) {
    out = out || [];
    (nodes || []).forEach(function (n) {
      out.push(n);
      if (n.children && n.children.length) flattenDepts(n.children, out);
    });
    return out;
  }

  function findDeptNode(nodes, id) {
    var flat = flattenDepts(nodes);
    return flat.find(function (d) { return d.id === id; }) || null;
  }

  function findDeptParentList(nodes, id) {
    var found = null;
    function walk(list, parentArr) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          found = { parentList: parentArr, index: i, node: list[i] };
          return true;
        }
        if (list[i].children && list[i].children.length) {
          if (walk(list[i].children, list[i].children)) return true;
        }
      }
      return false;
    }
    walk(nodes, nodes);
    return found;
  }

  function getDeptSubtreeIds(nodes, rootId) {
    var root = findDeptNode(nodes, rootId);
    if (!root) return [];
    return flattenDepts([root]).map(function (d) { return d.id; });
  }

  function countUsersInDept(clientType, deptId, includeChildren, scope) {
    var depts = getDepts(scope);
    var ids = includeChildren !== false ? getDeptSubtreeIds(depts, deptId) : [deptId];
    return getUsers(clientType).filter(function (u) { return ids.indexOf(u.deptId) >= 0; }).length;
  }

  function removeDeptById(nodes, id) {
    var loc = findDeptParentList(nodes, id);
    if (!loc) return false;
    loc.parentList.splice(loc.index, 1);
    return true;
  }

  var USERS_DATA_VERSION_KEY = 'gc_rbac_users_data_v2';

  function getUsers(clientType) {
    var key = storageKey(clientType, 'users');
    if (!localStorage.getItem(USERS_DATA_VERSION_KEY)) {
      ['operator', 'supplier', 'buyer'].forEach(function (c) {
        saveJson(storageKey(c, 'users'), JSON.parse(JSON.stringify(DEFAULT_USERS[c] || [])));
      });
      localStorage.setItem(USERS_DATA_VERSION_KEY, '1');
    }
    var list = loadJson(key, DEFAULT_USERS[clientType] || []);
    if (!localStorage.getItem(key)) saveJson(key, list);
    return list;
  }

  function saveUsers(clientType, list) {
    saveJson(storageKey(clientType, 'users'), list);
  }

  function getDeptLabel(deptId, scope) {
    if (!deptId) return '—';
    var d = findDeptNode(getDepts(scope), deptId);
    return d ? d.label : '—';
  }

  function getRoleNames(clientType, roleIds) {
    var roles = getRoles(clientType);
    return (roleIds || []).map(function (rid) {
      var r = roles.find(function (x) { return x.id === rid; });
      return r ? r.roleName : '';
    }).filter(Boolean).join('、') || '—';
  }

  function sexLabel(code) {
    return { '0': '男', '1': '女', '2': '未知' }[String(code)] || '未知';
  }

  function genId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  function nowStr() {
    var d = new Date();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  global.SystemRbac = {
    DATA_SCOPES: DATA_SCOPES,
    ROLE_FORM_DATA_SCOPES: ROLE_FORM_DATA_SCOPES,
    ORG_UNITS: ORG_UNITS,
    scopeLabel: scopeLabel,
    getPageScope: getPageScope,
    getWorkbenchClient: getWorkbenchClient,
    isWorkbenchPortal: isWorkbenchPortal,
    getCurrentOrgUnitId: getCurrentOrgUnitId,
    setCurrentOrgUnitId: setCurrentOrgUnitId,
    getOrgUnitName: getOrgUnitName,
    findUnitRoot: findUnitRoot,
    getUnitDeptTree: getUnitDeptTree,
    userBelongsToUnit: userBelongsToUnit,
    deptIdInUnit: deptIdInUnit,
    getScopeLabel: getScopeLabel,
    getMenuTree: getMenuTree,
    flattenMenu: flattenMenu,
    getRoles: getRoles,
    saveRoles: saveRoles,
    getDefaultRoleTemplates: getDefaultRoleTemplates,
    saveDefaultRoleTemplates: saveDefaultRoleTemplates,
    getUnitRoles: getUnitRoles,
    saveUnitRoles: saveUnitRoles,
    getTopLevelUnitsForScope: getTopLevelUnitsForScope,
    getOrgUnitIdFromDeptId: getOrgUnitIdFromDeptId,
    getOrgUnitLabel: getOrgUnitLabel,
    getMenuTreeForOrgUnit: getMenuTreeForOrgUnit,
    getUserClientForScope: getUserClientForScope,
    countUsersForUnitRole: countUsersForUnitRole,
    canDisableUnitRole: canDisableUnitRole,
    applyTemplateToRole: applyTemplateToRole,
    getDepts: getDepts,
    saveDepts: saveDepts,
    flattenDepts: flattenDepts,
    findDeptNode: findDeptNode,
    findDeptParentList: findDeptParentList,
    getDeptSubtreeIds: getDeptSubtreeIds,
    countUsersInDept: countUsersInDept,
    removeDeptById: removeDeptById,
    deptNode: deptNode,
    getUsers: getUsers,
    saveUsers: saveUsers,
    getDeptLabel: getDeptLabel,
    getRoleNames: getRoleNames,
    getOrgUnits: getOrgUnits,
    getOrgUnitsForScope: getOrgUnitsForScope,
    sharedUnitsLabel: sharedUnitsLabel,
    getDeptPath: getDeptPath,
    genRoleKey: genRoleKey,
    ensurePresetRoles: ensurePresetRoles,
    sexLabel: sexLabel,
    genId: genId,
    nowStr: nowStr,
    CLIENT_LABELS: { operator: '运营商', buyer: '采购商', supplier: '供应商' }
  };
})(typeof window !== 'undefined' ? window : this);
