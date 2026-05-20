/**
 * 供应商 / 采购商工作台 — 用户、角色、部门管理（本单位范围）
 */
(function (global) {
  'use strict';

  function buildConfig(client) {
    var orgUnitId = SystemRbac.getCurrentOrgUnitId(client);
    return {
      client: client,
      scope: client,
      orgUnitId: orgUnitId,
      unitName: SystemRbac.getOrgUnitName(orgUnitId),
      portal: 'workbench',
      showSharedUnits: false,
      unitOnlyDepts: true,
      currentLogin: client === 'supplier' ? 'supplier_admin' : 'admin',
      portalLabel: client === 'supplier' ? '供应商工作台' : '采购工作台',
      idPrefix: {
        user: client === 'supplier' ? 'u_sp' : 'u_by',
        role: client === 'supplier' ? 'r_sp' : 'r_by',
        dept: client === 'supplier' ? 'd_sp' : 'd_by'
      }
    };
  }

  function initUserPage(client) {
    var cfg = buildConfig(client);
    var users = [];
    var fullDepts = [];
    var unitDepts = [];
    var filterDeptId = '';
    var selectedIds = new Set();
    var resetPwdUserId = '';

    function initMeta() {
      var t = document.getElementById('pageTitle');
      if (t) t.textContent = cfg.unitName + ' / 用户列表';
      document.title = cfg.portalLabel + ' / 用户管理';
      var u = document.getElementById('unitBadge');
      if (u) u.textContent = cfg.unitName;
    }

    function reloadDepts() {
      fullDepts = SystemRbac.getDepts(cfg.scope);
      unitDepts = SystemRbac.getUnitDeptTree(cfg.scope, cfg.orgUnitId);
    }

    function loadAll() {
      users = SystemRbac.getUsers(cfg.client).filter(function (u) {
        return SystemRbac.userBelongsToUnit(u, cfg.orgUnitId, cfg.scope);
      });
      reloadDepts();
      renderDeptFilter();
      renderTable();
    }

    function selectDeptFilter(id) {
      filterDeptId = id;
      document.getElementById('deptAllBtn').classList.toggle('active', !id);
      renderDeptFilter();
      renderTable();
    }

    function renderDeptFilter() {
      var kw = document.getElementById('deptFilterSearch').value;
      SystemRbacUi.renderDeptManageTree(document.getElementById('deptFilterTree'), unitDepts, {
        selectedId: filterDeptId,
        keyword: kw,
        expanded: true,
        onSelect: function (id) {
          document.getElementById('deptAllBtn').classList.remove('active');
          selectDeptFilter(id);
        }
      });
    }

    function initUserDeptCascader(deptId) {
      SystemRbacUi.renderDeptCascader(document.getElementById('userDeptCascader'), unitDepts, deptId || '', {
        allowRoot: false,
        placeholder: '请选择本单位部门',
        getPath: function (id) { return SystemRbac.getDeptPath(unitDepts, id); },
        onChange: function (id) {
          document.getElementById('fDeptId').value = id || '';
        }
      });
    }

    function fillRoleChecks(checkedIds) {
      checkedIds = checkedIds || [];
      var roles = SystemRbac.getRoles(cfg.client).filter(function (r) { return r.status === '0'; });
      document.getElementById('roleCheckGroup').innerHTML = roles.map(function (r) {
        var c = checkedIds.indexOf(r.id) >= 0 ? ' checked' : '';
        return '<label><input type="checkbox" class="role-cb" value="' + r.id + '"' + c + '> ' +
          SystemRbacUi.escapeHtml(r.roleName) + '</label>';
      }).join('');
    }

    function getFilteredUsers() {
      var nameKw = (document.getElementById('searchUser').value || '').trim().toLowerCase();
      var phoneKw = (document.getElementById('searchPhone').value || '').trim();
      var st = document.getElementById('searchStatus').value;
      var deptIds = [];
      if (filterDeptId) deptIds = SystemRbac.getDeptSubtreeIds(unitDepts, filterDeptId);
      return users.filter(function (u) {
        if (filterDeptId && deptIds.indexOf(u.deptId) < 0) return false;
        if (nameKw && u.userName.toLowerCase().indexOf(nameKw) < 0 && (u.nickName || '').toLowerCase().indexOf(nameKw) < 0) return false;
        if (phoneKw && (u.phone || '').indexOf(phoneKw) < 0) return false;
        if (st !== '' && u.status !== st) return false;
        return true;
      });
    }

    function avatarLetter(u) {
      return ((u.nickName || u.userName || '?').charAt(0)).toUpperCase();
    }

    function renderTable() {
      var list = getFilteredUsers();
      var tbody = document.getElementById('userTableBody');
      document.getElementById('tableCount').textContent = '共 ' + list.length + ' 条';
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-12 text-slate-400">暂无用户</td></tr>';
        updateSelectHint();
        return;
      }
      tbody.innerHTML = list.map(function (u) {
        var canDel = !u.preset && u.userName !== cfg.currentLogin;
        return '<tr class="border-t border-slate-100 hover:bg-slate-50/80">' +
          '<td class="px-4 py-3"><input type="checkbox" class="row-check w-4 h-4 accent-red-600" data-id="' + u.id + '"' +
          (selectedIds.has(u.id) ? ' checked' : '') + ' onchange="window._rbacUser.onRowCheck(this)"></td>' +
          '<td class="px-4 py-3"><div class="user-name-cell"><span class="user-avatar">' + avatarLetter(u) + '</span>' +
          '<div><div class="font-semibold">' + SystemRbacUi.escapeHtml(u.userName) + '</div>' +
          '<div class="sub">' + SystemRbacUi.escapeHtml(u.nickName || '') + '</div></div></div></td>' +
          '<td class="px-4 py-3">' + SystemRbac.sexLabel(u.sex) + '</td>' +
          '<td class="px-4 py-3">' + SystemRbacUi.escapeHtml(SystemRbac.getDeptLabel(u.deptId, cfg.scope)) + '</td>' +
          '<td class="px-4 py-3 text-slate-500">' + SystemRbacUi.escapeHtml(u.email || '—') + '</td>' +
          '<td class="px-4 py-3">' + SystemRbacUi.escapeHtml(u.phone || '—') + '</td>' +
          '<td class="px-4 py-3"><label class="rbac-switch"><input type="checkbox"' + (u.status === '0' ? ' checked' : '') +
          (u.preset ? ' disabled' : '') + ' onchange="window._rbacUser.toggleStatus(\'' + u.id + '\', this)"><span class="slider"></span></label></td>' +
          '<td class="px-4 py-3 text-xs text-slate-500">' + u.createTime + '</td>' +
          '<td class="px-4 py-3"><div class="flex gap-1">' +
          '<button type="button" class="rbac-op-icon" title="编辑" onclick="window._rbacUser.openDrawer(\'' + u.id + '\')"><i class="fas fa-pen"></i></button>' +
          '<button type="button" class="rbac-op-icon" title="重置密码" onclick="window._rbacUser.openResetPwd(\'' + u.id + '\')"><i class="fas fa-key"></i></button>' +
          (canDel ? '<button type="button" class="rbac-op-icon danger" title="删除" onclick="window._rbacUser.deleteUser(\'' + u.id + '\')"><i class="fas fa-trash"></i></button>' : '') +
          '</div></td></tr>';
      }).join('');
      updateSelectHint();
    }

    function updateSelectHint() {
      document.getElementById('selectHint').textContent = selectedIds.size ? '已选中 ' + selectedIds.size + ' 条' : '未选中任何记录';
    }

    window._rbacUser = {
      onRowCheck: function (el) {
        if (el.checked) selectedIds.add(el.dataset.id); else selectedIds.delete(el.dataset.id);
        updateSelectHint();
      },
      toggleSelectAll: function (el) {
        document.querySelectorAll('.row-check').forEach(function (c) {
          c.checked = el.checked;
          if (el.checked) selectedIds.add(c.dataset.id); else selectedIds.delete(c.dataset.id);
        });
        updateSelectHint();
      },
      toggleStatus: function (id, el) {
        var u = users.find(function (x) { return x.id === id; });
        if (!u || u.preset) return;
        u.status = el.checked ? '0' : '1';
        var all = SystemRbac.getUsers(cfg.client);
        var idx = all.findIndex(function (x) { return x.id === id; });
        if (idx >= 0) all[idx] = u;
        SystemRbac.saveUsers(cfg.client, all);
        SystemRbacUi.toast(u.status === '0' ? '已启用' : '已停用', 'success');
      },
      openDrawer: function (id) {
        document.getElementById('userDrawer').classList.add('show');
        var isEdit = !!id;
        document.getElementById('userDrawerTitle').textContent = isEdit ? '编辑用户' : '新增用户';
        document.getElementById('editUserId').value = id || '';
        document.getElementById('pwdReq').style.display = isEdit ? 'none' : '';
        document.getElementById('pwdHint').style.display = isEdit ? '' : 'none';
        document.getElementById('fPassword').placeholder = isEdit ? '留空不修改' : '请输入密码';
        document.getElementById('fPassword').value = '';
        document.getElementById('fUserName').readOnly = isEdit;
        var u = isEdit ? users.find(function (x) { return x.id === id; }) : null;
        document.getElementById('fNickName').value = u ? u.nickName : '';
        document.getElementById('fUserName').value = u ? u.userName : '';
        document.getElementById('fPhone').value = u ? (u.phone || '') : '';
        document.getElementById('fEmail').value = u ? (u.email || '') : '';
        var deptId = u ? (u.deptId || '') : (filterDeptId || '');
        document.getElementById('fDeptId').value = deptId;
        initUserDeptCascader(deptId);
        document.querySelector('input[name="fSex"][value="' + (u ? u.sex : '0') + '"]').checked = true;
        document.querySelector('input[name="fUserStatus"][value="' + (u ? u.status : '0') + '"]').checked = true;
        fillRoleChecks(u ? (u.roleIds || []) : []);
      },
      closeDrawer: function () {
        document.getElementById('userDrawer').classList.remove('show');
        document.getElementById('fUserName').readOnly = false;
      },
      save: function () {
        var nick = document.getElementById('fNickName').value.trim();
        var userName = document.getElementById('fUserName').value.trim();
        var pwd = document.getElementById('fPassword').value;
        var deptId = document.getElementById('fDeptId').value;
        var roleIds = Array.prototype.slice.call(document.querySelectorAll('.role-cb:checked')).map(function (c) { return c.value; });
        var id = document.getElementById('editUserId').value;
        if (!nick || !userName) { SystemRbacUi.toast('请填写用户昵称和登录账号', 'warn'); return; }
        if (!deptId) { SystemRbacUi.toast('请选择本单位部门', 'warn'); return; }
        if (!SystemRbac.deptIdInUnit(deptId, cfg.orgUnitId, cfg.scope)) {
          SystemRbacUi.toast('只能选择本单位内的部门', 'warn'); return;
        }
        if (!roleIds.length) { SystemRbacUi.toast('请至少选择一个角色', 'warn'); return; }
        var all = SystemRbac.getUsers(cfg.client);
        if (id) {
          var u = all.find(function (x) { return x.id === id; });
          if (!u) return;
          u.nickName = nick;
          u.deptId = deptId;
          u.phone = document.getElementById('fPhone').value.trim();
          u.email = document.getElementById('fEmail').value.trim();
          u.sex = document.querySelector('input[name="fSex"]:checked').value;
          u.status = document.querySelector('input[name="fUserStatus"]:checked').value;
          u.roleIds = roleIds;
          if (pwd) u.password = pwd;
        } else {
          if (!pwd) { SystemRbacUi.toast('请设置初始密码', 'warn'); return; }
          if (all.some(function (x) { return x.userName === userName; })) {
            SystemRbacUi.toast('登录账号已存在', 'warn'); return;
          }
          all.push({
            id: SystemRbac.genId(cfg.idPrefix.user),
            userName: userName,
            nickName: nick,
            deptId: deptId,
            phone: document.getElementById('fPhone').value.trim(),
            email: document.getElementById('fEmail').value.trim(),
            sex: document.querySelector('input[name="fSex"]:checked').value,
            status: document.querySelector('input[name="fUserStatus"]:checked').value,
            roleIds: roleIds,
            password: pwd,
            preset: false,
            createTime: SystemRbac.nowStr()
          });
        }
        SystemRbac.saveUsers(cfg.client, all);
        window._rbacUser.closeDrawer();
        loadAll();
        SystemRbacUi.toast('保存成功', 'success');
      },
      deleteUser: function (id) {
        var u = users.find(function (x) { return x.id === id; });
        if (!u || u.preset || u.userName === cfg.currentLogin) return;
        if (!confirm('确定删除用户「' + u.nickName + '」？')) return;
        var all = SystemRbac.getUsers(cfg.client).filter(function (x) { return x.id !== id; });
        SystemRbac.saveUsers(cfg.client, all);
        selectedIds.delete(id);
        loadAll();
        SystemRbacUi.toast('已删除', 'success');
      },
      batchDelete: function () {
        if (!selectedIds.size) { SystemRbacUi.toast('请先选择用户', 'warn'); return; }
        if (!confirm('确定删除选中的 ' + selectedIds.size + ' 个用户？')) return;
        var all = SystemRbac.getUsers(cfg.client).filter(function (u) {
          return !selectedIds.has(u.id) || !SystemRbac.userBelongsToUnit(u, cfg.orgUnitId, cfg.scope);
        });
        SystemRbac.saveUsers(cfg.client, all);
        selectedIds.clear();
        loadAll();
        SystemRbacUi.toast('批量删除完成', 'success');
      },
      openResetPwd: function (id) {
        var u = users.find(function (x) { return x.id === id; });
        if (!u) return;
        resetPwdUserId = id;
        document.getElementById('resetPwdUserLabel').textContent = u.nickName + '（' + u.userName + '）';
        document.getElementById('resetPwdValue').value = 'Gc@' + Math.random().toString(36).slice(2, 10);
        document.getElementById('resetPwdModal').classList.add('show');
      },
      closeResetPwd: function () {
        document.getElementById('resetPwdModal').classList.remove('show');
        resetPwdUserId = '';
      },
      confirmResetPwd: function () {
        var all = SystemRbac.getUsers(cfg.client);
        var u = all.find(function (x) { return x.id === resetPwdUserId; });
        if (u) {
          u.password = document.getElementById('resetPwdValue').value;
          SystemRbac.saveUsers(cfg.client, all);
          SystemRbacUi.toast('密码已重置', 'success');
        }
        window._rbacUser.closeResetPwd();
      },
      reload: function () { loadAll(); SystemRbacUi.toast('已刷新', 'success'); },
      exportUsers: function () { SystemRbacUi.toast('已导出用户列表（原型演示）', 'success'); },
      selectDeptFilter: selectDeptFilter,
      renderDeptFilter: renderDeptFilter
    };

    function bindFilters() {
      ['searchUser', 'searchPhone'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.oninput = renderTable;
      });
      var st = document.getElementById('searchStatus');
      if (st) st.onchange = renderTable;
    }

    document.addEventListener('DOMContentLoaded', function () {
      document.documentElement.classList.add('admin-embed-mode');
      initMeta();
      loadAll();
      bindFilters();
    });
  }

  function initRolePage(client) {
    var cfg = buildConfig(client);
    var unitRoles = [];
    var templates = [];
    var CURRENT_CREATOR = cfg.currentLogin;

    function initMeta() {
      var titleEl = document.getElementById('pageTitle');
      if (titleEl) titleEl.textContent = cfg.unitName + ' · 角色列表';
      document.title = cfg.portalLabel + ' / 角色管理';
      var badge = document.getElementById('unitBadge');
      if (badge) badge.textContent = cfg.unitName;
      var hint = document.getElementById('selectedUnitHint');
      if (hint) hint.textContent = '以下为该单位已配置的角色，可新增或编辑';
    }

    function fillScopeSelect(selId, val) {
      var sel = document.getElementById(selId);
      if (!sel) return;
      sel.innerHTML = SystemRbac.ROLE_FORM_DATA_SCOPES.map(function (d) {
        return '<option value="' + d.value + '">' + d.label + '</option>';
      }).join('');
      sel.value = val || '5';
    }

    function loadData() {
      unitRoles = SystemRbac.getUnitRoles(cfg.scope);
      templates = SystemRbac.getDefaultRoleTemplates();
      renderRoleCards();
    }

    function getUnitRoleList() {
      var kw = (document.getElementById('roleSearchName') && document.getElementById('roleSearchName').value || '').trim().toLowerCase();
      var st = document.getElementById('roleSearchStatus') ? document.getElementById('roleSearchStatus').value : '';
      return unitRoles.filter(function (r) {
        if (r.orgUnitId !== cfg.orgUnitId) return false;
        if (kw && r.roleName.toLowerCase().indexOf(kw) < 0) return false;
        if (st !== '' && r.status !== st) return false;
        return true;
      });
    }

    function renderRoleCards() {
      var grid = document.getElementById('roleCardGrid');
      var empty = document.getElementById('roleCardEmpty');
      if (!grid) return;

      var list = getUnitRoleList();
      if (!list.length) {
        grid.innerHTML = '';
        if (empty) {
          empty.style.display = '';
          empty.innerHTML = '<i class="fas fa-user-shield text-3xl mb-3 block text-slate-300"></i>暂无角色，点击「新增角色」创建';
        }
        return;
      }
      if (empty) empty.style.display = 'none';

      grid.innerHTML = list.map(function (r) {
        var userCount = r.status === '0' ? SystemRbac.countUsersForUnitRole(cfg.scope, r.id) : 0;
        var tplName = '';
        if (r.templateRoleId) {
          var t = templates.find(function (x) { return x.id === r.templateRoleId; });
          tplName = t ? t.roleName : '';
        }
        return '<div class="role-card">' +
          '<div class="role-card-head">' +
          '<div class="role-card-title">' + SystemRbacUi.escapeHtml(r.roleName) + '</div>' +
          '<label class="rbac-switch" title="启用/禁用"><input type="checkbox"' + (r.status === '0' ? ' checked' : '') +
          ' onchange="window._rbacRole.toggleStatus(\'' + r.id + '\', this)"><span class="slider"></span></label>' +
          '</div>' +
          '<div class="role-card-meta">' +
          '<div><strong>创建人员：</strong>' + SystemRbacUi.escapeHtml(r.createBy || '—') + '</div>' +
          '<div><strong>创建时间：</strong>' + SystemRbacUi.escapeHtml(r.createTime || '—') + '</div>' +
          (tplName ? '<div><strong>默认角色：</strong>' + SystemRbacUi.escapeHtml(tplName) + '</div>' : '') +
          '<div><strong>权限范围：</strong>' + SystemRbacUi.escapeHtml(SystemRbac.scopeLabel(r.dataScope)) + '</div>' +
          '</div>' +
          '<div class="role-card-foot">' +
          (r.status === '0' ? '<span class="role-card-user-count"><i class="fas fa-users"></i> 关联用户 ' + userCount + ' 人</span>' : '<span class="text-xs text-slate-400">已停用</span>') +
          '<button type="button" class="role-card-edit-btn" onclick="window._rbacRole.openDrawer(\'' + r.id + '\')"><i class="fas fa-pen"></i> 编辑角色</button>' +
          '</div></div>';
      }).join('');
    }

    function fillDefaultRoleOptions(selectedId) {
      var sel = document.getElementById('fDefaultRole');
      if (!sel) return;
      var opts = '<option value="">不套用模板（自定义配置）</option>';
      templates.filter(function (t) { return t.status === '0'; }).forEach(function (t) {
        opts += '<option value="' + t.id + '"' + (selectedId === t.id ? ' selected' : '') + '>' +
          SystemRbacUi.escapeHtml(t.roleName) + '</option>';
      });
      sel.innerHTML = opts;
    }

    function bindTreeToolbar() {
      var box = document.getElementById('unitMenuTreeBox');
      if (!box) return;
      var exp = document.getElementById('unitTreeExpand');
      var all = document.getElementById('unitTreeSelectAll');
      var link = document.getElementById('unitTreeLinkage');
      if (exp) exp.onchange = function () { SystemRbacUi.toggleExpandAll(box, this.checked); };
      if (all) all.onchange = function () { SystemRbacUi.setAllMenuChecks(box, this.checked); };
      if (link) link.onchange = function () { box.dataset.linkage = this.checked ? '1' : '0'; };
    }

    window._rbacRole = {
      toggleStatus: function (id, el) {
        var r = unitRoles.find(function (x) { return x.id === id; });
        if (!r) return;
        if (!el.checked) {
          var cnt = SystemRbac.countUsersForUnitRole(cfg.scope, id);
          if (cnt > 0) {
            el.checked = true;
            SystemRbacUi.showRoleDisableBlockModal(r.roleName, cnt);
            return;
          }
        }
        r.status = el.checked ? '0' : '1';
        SystemRbac.saveUnitRoles(cfg.scope, unitRoles);
        renderRoleCards();
        SystemRbacUi.toast(r.status === '0' ? '已启用' : '已停用', 'success');
      },
      onDefaultRolePick: function () {
        var tid = document.getElementById('fDefaultRole').value;
        if (!tid) return;
        var t = templates.find(function (x) { return x.id === tid; });
        if (!t) return;
        var applied = SystemRbac.applyTemplateToRole(t, {});
        document.getElementById('unitFRoleName').value = applied.roleName;
        fillScopeSelect('unitFDataScope', applied.dataScope);
        document.getElementById('unitFSort').value = applied.sort || 1;
        document.getElementById('unitFRemark').value = applied.remark || '';
        SystemRbacUi.renderMenuTree(document.getElementById('unitMenuTreeBox'), SystemRbac.getMenuTreeForOrgUnit(cfg.orgUnitId), applied.menuIds, {
          linkage: document.getElementById('unitTreeLinkage').checked
        });
        SystemRbacUi.toast('已套用默认角色配置', 'success');
      },
      openDrawer: function (id) {
        document.getElementById('unitRoleDrawer').classList.add('show');
        var isEdit = !!id;
        document.getElementById('unitDrawerTitle').textContent = isEdit ? '编辑角色' : '新增角色';
        document.getElementById('editUnitRoleId').value = id || '';
        var btnDel = document.getElementById('btnDeleteUnitRole');
        if (btnDel) btnDel.style.display = isEdit ? '' : 'none';
        fillDefaultRoleOptions('');
        fillScopeSelect('unitFDataScope', '5');

        var r = isEdit ? unitRoles.find(function (x) { return x.id === id; }) : null;
        if (r) {
          fillDefaultRoleOptions(r.templateRoleId || '');
          document.getElementById('unitFRoleName').value = r.roleName;
          fillScopeSelect('unitFDataScope', r.dataScope);
          document.getElementById('unitFSort').value = r.sort || 1;
          document.querySelector('input[name="unitFStatus"][value="' + r.status + '"]').checked = true;
          document.getElementById('unitFRemark').value = r.remark || '';
          SystemRbacUi.renderMenuTree(document.getElementById('unitMenuTreeBox'), SystemRbac.getMenuTreeForOrgUnit(cfg.orgUnitId), r.menuIds || [], {
            linkage: document.getElementById('unitTreeLinkage').checked
          });
        } else {
          document.getElementById('unitFRoleName').value = '';
          document.getElementById('unitFSort').value = '1';
          document.querySelector('input[name="unitFStatus"][value="0"]').checked = true;
          document.getElementById('unitFRemark').value = '';
          SystemRbacUi.renderMenuTree(document.getElementById('unitMenuTreeBox'), SystemRbac.getMenuTreeForOrgUnit(cfg.orgUnitId), [], {
            linkage: document.getElementById('unitTreeLinkage').checked
          });
        }
        bindTreeToolbar();
      },
      closeDrawer: function () {
        document.getElementById('unitRoleDrawer').classList.remove('show');
      },
      save: function () {
        var name = document.getElementById('unitFRoleName').value.trim();
        if (!name) { SystemRbacUi.toast('请填写角色名称', 'warn'); return; }
        var payload = {
          orgUnitId: cfg.orgUnitId,
          roleName: name,
          templateRoleId: document.getElementById('fDefaultRole').value || '',
          dataScope: document.getElementById('unitFDataScope').value,
          sort: parseInt(document.getElementById('unitFSort').value, 10) || 1,
          status: document.querySelector('input[name="unitFStatus"]:checked').value,
          menuIds: SystemRbacUi.getCheckedMenuIds(document.getElementById('unitMenuTreeBox')),
          remark: document.getElementById('unitFRemark').value.trim(),
          createBy: CURRENT_CREATOR
        };
        var id = document.getElementById('editUnitRoleId').value;
        if (payload.status === '1' && id) {
          var checkCnt = SystemRbac.countUsersForUnitRole(cfg.scope, id);
          if (checkCnt > 0) {
            SystemRbacUi.showRoleDisableBlockModal(name, checkCnt);
            return;
          }
        }
        if (id) {
          var r = unitRoles.find(function (x) { return x.id === id; });
          if (!r) return;
          Object.assign(r, payload);
          r.createBy = r.createBy || CURRENT_CREATOR;
        } else {
          payload.id = SystemRbac.genId('ur');
          payload.createTime = SystemRbac.nowStr();
          unitRoles.push(payload);
        }
        SystemRbac.saveUnitRoles(cfg.scope, unitRoles);
        window._rbacRole.closeDrawer();
        renderRoleCards();
        SystemRbacUi.toast('保存成功', 'success');
      },
      deleteFromDrawer: function () {
        var id = document.getElementById('editUnitRoleId').value;
        if (!id) return;
        var cnt = SystemRbac.countUsersForUnitRole(cfg.scope, id);
        if (cnt > 0) { SystemRbacUi.toast('该角色下还有 ' + cnt + ' 个用户，无法删除', 'warn'); return; }
        if (!confirm('确定删除该角色？')) return;
        unitRoles = unitRoles.filter(function (x) { return x.id !== id; });
        SystemRbac.saveUnitRoles(cfg.scope, unitRoles);
        window._rbacRole.closeDrawer();
        renderRoleCards();
        SystemRbacUi.toast('已删除', 'success');
      },
      reload: function () {
        loadData();
        SystemRbacUi.toast('已刷新', 'success');
      }
    };

    function bindFilters() {
      var n = document.getElementById('roleSearchName');
      if (n) n.oninput = renderRoleCards;
      var st = document.getElementById('roleSearchStatus');
      if (st) st.onchange = renderRoleCards;
    }

    document.addEventListener('DOMContentLoaded', function () {
      document.documentElement.classList.add('admin-embed-mode');
      initMeta();
      loadData();
      bindFilters();
    });
  }

  function initDeptPage(client) {
    var cfg = buildConfig(client);
    var fullDepts = [];
    var unitDepts = [];
    var selectedId = '';
    var treeExpanded = true;
    var unitRootId = '';

    function initMeta() {
      document.getElementById('pageTitle').textContent = cfg.unitName + ' / 部门列表';
      document.title = cfg.portalLabel + ' / 部门管理';
      var u = document.getElementById('unitBadge');
      if (u) u.textContent = cfg.unitName;
    }

    function loadDepts() {
      fullDepts = SystemRbac.getDepts(cfg.scope);
      unitDepts = SystemRbac.getUnitDeptTree(cfg.scope, cfg.orgUnitId);
      var root = SystemRbac.findUnitRoot(fullDepts, cfg.orgUnitId);
      unitRootId = root ? root.id : '';
      renderDeptTree();
    }

    function renderDeptTree() {
      var kw = document.getElementById('deptSearch').value;
      SystemRbacUi.renderDeptManageTree(document.getElementById('deptTreePanel'), unitDepts, {
        selectedId: selectedId,
        keyword: kw,
        expanded: treeExpanded,
        onSelect: function (id) {
          selectedId = id;
          document.getElementById('formMode').value = 'view';
          window._rbacDept.showForm(id);
          renderDeptTree();
        }
      });
    }

    function initParentCascader(parentId) {
      SystemRbacUi.renderDeptCascader(document.getElementById('parentDeptCascader'), unitDepts, parentId || unitRootId, {
        allowRoot: false,
        placeholder: '请选择上级部门',
        getPath: function (id) {
          return SystemRbac.getDeptPath(unitDepts, id);
        },
        onChange: function (id) {
          document.getElementById('fParentId').value = id || unitRootId;
        }
      });
    }

    window._rbacDept = {
      expandAll: function (flag) {
        treeExpanded = flag;
        SystemRbacUi.toggleDeptTreeExpand(document.getElementById('deptTreePanel'), flag);
        renderDeptTree();
      },
      startAdd: function () {
        if (!selectedId && unitRootId) selectedId = unitRootId;
        if (!selectedId) {
          SystemRbacUi.toast('请先选择上级部门', 'warn');
          return;
        }
        document.getElementById('formMode').value = 'add';
        window._rbacDept.showForm(selectedId);
      },
      showForm: function (id) {
        var node = id ? SystemRbac.findDeptNode(unitDepts, id) : null;
        var mode = document.getElementById('formMode').value;
        document.getElementById('formEmpty').style.display = 'none';
        document.getElementById('deptForm').style.display = '';
        document.getElementById('btnDeleteDept').style.display = (node && mode === 'view' && node.id !== unitRootId) ? '' : 'none';

        if (mode === 'add') {
          document.getElementById('formTitle').textContent = '新增部门';
          document.getElementById('fDeptId').value = '';
          document.getElementById('fParentId').value = id || unitRootId;
          initParentCascader(id || unitRootId);
          document.getElementById('fLabel').value = '';
          document.getElementById('fSort').value = '1';
          document.querySelector('input[name="fDeptStatus"][value="0"]').checked = true;
          return;
        }
        if (!node) return;
        document.getElementById('formTitle').textContent = '编辑部门';
        document.getElementById('fDeptId').value = node.id;
        document.getElementById('fParentId').value = node.parentId || unitRootId;
        initParentCascader(node.parentId || unitRootId);
        document.getElementById('fLabel').value = node.label;
        document.getElementById('fSort').value = node.sort != null ? node.sort : 1;
        document.querySelector('input[name="fDeptStatus"][value="' + (node.status || '0') + '"]').checked = true;
      },
      cancelForm: function () {
        document.getElementById('formMode').value = 'view';
        if (selectedId) window._rbacDept.showForm(selectedId);
        else {
          document.getElementById('deptForm').style.display = 'none';
          document.getElementById('formEmpty').style.display = '';
          document.getElementById('btnDeleteDept').style.display = 'none';
        }
      },
      save: function (e) {
        e.preventDefault();
        var mode = document.getElementById('formMode').value;
        var label = document.getElementById('fLabel').value.trim();
        if (!label) { SystemRbacUi.toast('请填写部门名称', 'warn'); return false; }
        var parentId = document.getElementById('fParentId').value || unitRootId;
        if (!SystemRbac.deptIdInUnit(parentId, cfg.orgUnitId, cfg.scope) && parentId !== unitRootId) {
          SystemRbacUi.toast('上级部门须在本单位内', 'warn'); return false;
        }

        if (mode === 'add') {
          var payload = {
            id: SystemRbac.genId(cfg.idPrefix.dept),
            parentId: parentId,
            label: label,
            sort: parseInt(document.getElementById('fSort').value, 10) || 1,
            status: document.querySelector('input[name="fDeptStatus"]:checked').value,
            children: []
          };
          var parent = SystemRbac.findDeptNode(fullDepts, parentId);
          if (!parent) { SystemRbacUi.toast('上级部门不存在', 'warn'); return false; }
          if (!parent.children) parent.children = [];
          parent.children.push(payload);
          selectedId = payload.id;
          SystemRbacUi.toast('新增成功', 'success');
        } else {
          var id = document.getElementById('fDeptId').value;
          var node = SystemRbac.findDeptNode(fullDepts, id);
          if (!node) return false;
          node.label = label;
          node.sort = parseInt(document.getElementById('fSort').value, 10) || 1;
          node.status = document.querySelector('input[name="fDeptStatus"]:checked').value;
          SystemRbacUi.toast('保存成功', 'success');
        }
        SystemRbac.saveDepts(cfg.scope, fullDepts);
        document.getElementById('formMode').value = 'view';
        loadDepts();
        window._rbacDept.showForm(selectedId);
        return false;
      },
      deleteDept: function () {
        var id = document.getElementById('fDeptId').value;
        if (!id || id === unitRootId) return;
        var node = SystemRbac.findDeptNode(fullDepts, id);
        if (!node) return;
        if (node.children && node.children.length) {
          SystemRbacUi.toast('存在下级部门，无法删除', 'warn'); return;
        }
        var userCount = SystemRbac.countUsersInDept(cfg.client, id, false, cfg.scope);
        if (userCount > 0) {
          SystemRbacUi.toast('该部门下还有 ' + userCount + ' 个用户，无法删除', 'warn'); return;
        }
        if (!confirm('确定删除部门「' + node.label + '」？')) return;
        SystemRbac.removeDeptById(fullDepts, id);
        SystemRbac.saveDepts(cfg.scope, fullDepts);
        selectedId = unitRootId;
        document.getElementById('formMode').value = 'view';
        loadDepts();
        window._rbacDept.showForm(selectedId);
        SystemRbacUi.toast('已删除', 'success');
      },
      renderDeptTree: renderDeptTree
    };

    document.addEventListener('DOMContentLoaded', function () {
      document.documentElement.classList.add('admin-embed-mode');
      initMeta();
      loadDepts();
      var ds = document.getElementById('deptSearch');
      if (ds) ds.oninput = renderDeptTree;
      if (unitDepts[0]) {
        selectedId = unitDepts[0].id;
        window._rbacDept.showForm(selectedId);
        renderDeptTree();
      }
    });
  }

  global.SystemRbacPortal = {
    buildConfig: buildConfig,
    initUserPage: initUserPage,
    initRolePage: initRolePage,
    initDeptPage: initDeptPage
  };
})(typeof window !== 'undefined' ? window : this);
