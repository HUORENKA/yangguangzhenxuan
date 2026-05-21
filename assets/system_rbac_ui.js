/**
 * 系统管理 — 菜单树、弹窗等 UI 辅助（原型）
 */
(function (global) {
  'use strict';

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 渲染可勾选菜单树 */
  function renderMenuTree(container, nodes, checkedIds, options) {
    options = options || {};
    var linkage = options.linkage !== false;
    var expanded = options.expanded !== false;
    container.innerHTML = '';
    container.dataset.linkage = linkage ? '1' : '0';
    container.classList.add('rbac-menu-tree');

    function walk(list, depth) {
      var ul = document.createElement('ul');
      ul.className = depth === 0 ? 'rbac-tree-root' : 'rbac-tree-children';
      (list || []).forEach(function (node) {
        var li = document.createElement('li');
        li.className = 'rbac-tree-node';
        li.dataset.id = node.id;
        var hasChild = node.children && node.children.length;
        var row = document.createElement('div');
        row.className = 'rbac-tree-row';
        row.style.paddingLeft = (depth * 16 + 4) + 'px';

        if (hasChild) {
          var toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'rbac-tree-toggle';
          toggle.innerHTML = expanded ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-right"></i>';
          toggle.onclick = function (e) {
            e.stopPropagation();
            var ch = li.querySelector(':scope > .rbac-tree-children');
            if (!ch) return;
            var open = ch.style.display !== 'none';
            ch.style.display = open ? 'none' : '';
            toggle.innerHTML = open ? '<i class="fas fa-caret-right"></i>' : '<i class="fas fa-caret-down"></i>';
          };
          row.appendChild(toggle);
        } else {
          var spacer = document.createElement('span');
          spacer.className = 'rbac-tree-spacer';
          row.appendChild(spacer);
        }

        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'rbac-tree-check';
        cb.value = node.id;
        cb.checked = checkedIds.indexOf(node.id) >= 0;
        cb.dataset.nodeId = node.id;
        row.appendChild(cb);

        var label = document.createElement('span');
        label.className = 'rbac-tree-label';
        var typeTag = node.type === 'F' ? ' <em class="rbac-tag-f">按钮</em>' : '';
        label.innerHTML = escapeHtml(node.label) + typeTag;
        row.appendChild(label);
        li.appendChild(row);

        if (hasChild) {
          var childWrap = walk(node.children, depth + 1);
          if (!expanded) childWrap.style.display = 'none';
          li.appendChild(childWrap);
        }
        ul.appendChild(li);
      });
      return ul;
    }

    container.appendChild(walk(nodes, 0));

    container.addEventListener('change', function (e) {
      if (!e.target.classList.contains('rbac-tree-check')) return;
      if (container.dataset.linkage !== '1') return;
      var id = e.target.value;
      var checked = e.target.checked;
      var li = e.target.closest('.rbac-tree-node');
      if (!li) return;
      li.querySelectorAll('.rbac-tree-check').forEach(function (c) { c.checked = checked; });
      if (checked) {
        var p = li.parentElement;
        while (p && p !== container) {
          if (p.classList && p.classList.contains('rbac-tree-node')) {
            var pc = p.querySelector(':scope > .rbac-tree-row .rbac-tree-check');
            if (pc) pc.checked = true;
          }
          p = p.parentElement;
        }
      }
    });
  }

  function getCheckedMenuIds(container) {
    return Array.prototype.slice.call(container.querySelectorAll('.rbac-tree-check:checked'))
      .map(function (c) { return c.value; });
  }

  function setAllMenuChecks(container, checked) {
    container.querySelectorAll('.rbac-tree-check').forEach(function (c) { c.checked = checked; });
  }

  function toggleExpandAll(container, expand) {
    container.querySelectorAll(':scope .rbac-tree-children').forEach(function (ul) {
      ul.style.display = expand ? '' : 'none';
    });
    container.querySelectorAll('.rbac-tree-toggle').forEach(function (btn) {
      btn.innerHTML = expand ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-right"></i>';
    });
  }

  /** 部门树（数据权限-自定） */
  function renderDeptTree(container, nodes, checkedIds) {
    container.innerHTML = '';
    container.classList.add('rbac-dept-tree');
    function walk(list, depth) {
      var ul = document.createElement('ul');
      ul.className = depth === 0 ? 'rbac-tree-root' : 'rbac-tree-children';
      (list || []).forEach(function (node) {
        var li = document.createElement('li');
        var row = document.createElement('div');
        row.className = 'rbac-tree-row';
        row.style.paddingLeft = (depth * 16 + 4) + 'px';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'rbac-dept-check';
        cb.value = node.id;
        cb.checked = checkedIds.indexOf(node.id) >= 0;
        row.appendChild(cb);
        var label = document.createElement('span');
        label.className = 'rbac-tree-label';
        label.textContent = node.label;
        row.appendChild(label);
        li.appendChild(row);
        if (node.children && node.children.length) li.appendChild(walk(node.children, depth + 1));
        ul.appendChild(li);
      });
      return ul;
    }
    container.appendChild(walk(nodes, 0));
  }

  function getCheckedDeptIds(container) {
    return Array.prototype.slice.call(container.querySelectorAll('.rbac-dept-check:checked'))
      .map(function (c) { return c.value; });
  }

  /** 部门管理 — 可点击选择的树 */
  function renderDeptManageTree(container, nodes, options) {
    options = options || {};
    var selectedId = options.selectedId || '';
    var keyword = (options.keyword || '').trim().toLowerCase();
    var expanded = options.expanded !== false;
    container.innerHTML = '';
    container.classList.add('rbac-dept-manage-tree');

    function matchKw(node) {
      if (!keyword) return true;
      if ((node.label || '').toLowerCase().indexOf(keyword) >= 0) return true;
      return (node.children || []).some(matchKw);
    }

    function walk(list, depth) {
      var ul = document.createElement('ul');
      ul.className = depth === 0 ? 'rbac-tree-root' : 'rbac-tree-children';
      (list || []).forEach(function (node) {
        if (!matchKw(node)) return;
        var li = document.createElement('li');
        li.className = 'rbac-tree-node';
        li.dataset.id = node.id;
        var hasChild = node.children && node.children.length;
        var row = document.createElement('div');
        row.className = 'rbac-dept-row' + (node.id === selectedId ? ' active' : '');
        row.style.paddingLeft = (depth * 18 + 8) + 'px';
        if (hasChild) {
          var toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'rbac-tree-toggle';
          toggle.innerHTML = expanded ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-right"></i>';
          toggle.onclick = function (e) {
            e.stopPropagation();
            var ch = li.querySelector(':scope > .rbac-tree-children');
            if (!ch) return;
            var open = ch.style.display !== 'none';
            ch.style.display = open ? 'none' : '';
            toggle.innerHTML = open ? '<i class="fas fa-caret-right"></i>' : '<i class="fas fa-caret-down"></i>';
          };
          row.appendChild(toggle);
        } else {
          var spacer = document.createElement('span');
          spacer.className = 'rbac-tree-spacer';
          row.appendChild(spacer);
        }
        var icon = document.createElement('i');
        icon.className = 'fas fa-folder text-amber-500 text-xs';
        row.appendChild(icon);
        var label = document.createElement('span');
        label.className = 'rbac-tree-label flex-1';
        label.textContent = node.label;
        row.appendChild(label);
        if (node.status === '1') {
          var tag = document.createElement('span');
          tag.className = 'rbac-dept-disabled-tag';
          tag.textContent = '停用';
          row.appendChild(tag);
        }
        row.onclick = function () {
          if (typeof options.onSelect === 'function') options.onSelect(node.id);
        };
        li.appendChild(row);
        if (hasChild) {
          var childWrap = walk(node.children, depth + 1);
          if (!expanded && !keyword) childWrap.style.display = 'none';
          li.appendChild(childWrap);
        }
        ul.appendChild(li);
      });
      return ul;
    }

    container.appendChild(walk(nodes, 0));
  }

  function toggleDeptTreeExpand(container, expand) {
    container.querySelectorAll(':scope .rbac-tree-children').forEach(function (ul) {
      ul.style.display = expand ? '' : 'none';
    });
    container.querySelectorAll('.rbac-tree-toggle').forEach(function (btn) {
      btn.innerHTML = expand ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-right"></i>';
    });
  }

  /** 部门多级下拉（树形面板选择） */
  function renderDeptCascader(container, depts, selectedId, options) {
    options = options || {};
    var allowRoot = options.allowRoot !== false;
    var onChange = options.onChange || function () {};
    var getPath = options.getPath || function (id) {
      if (global.SystemRbac && global.SystemRbac.getDeptPath) {
        return global.SystemRbac.getDeptPath(depts, id);
      }
      return id || '—';
    };

    container.innerHTML = '';
    container.className = 'rbac-cascader';
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'rbac-cascader-input';
    input.readOnly = true;
    input.placeholder = options.placeholder || '请选择部门';

    var panel = document.createElement('div');
    panel.className = 'rbac-cascader-panel';

    function setValue(id) {
      container.dataset.value = id || '';
      input.value = getPath(id);
      panel.querySelectorAll('.rbac-cascader-item').forEach(function (el) {
        el.classList.toggle('active', el.dataset.id === (id || ''));
      });
      onChange(id, input.value);
    }

    function closePanel() {
      container.classList.remove('open');
    }

    function openPanel() {
      container.classList.add('open');
    }

    if (allowRoot) {
      var rootItem = document.createElement('div');
      rootItem.className = 'rbac-cascader-item root-opt';
      rootItem.dataset.id = '0';
      rootItem.textContent = '无（顶级部门）';
      rootItem.onclick = function () { setValue('0'); closePanel(); };
      panel.appendChild(rootItem);
    }

    function walk(list, depth) {
      (list || []).forEach(function (node) {
        var item = document.createElement('div');
        item.className = 'rbac-cascader-item';
        item.dataset.id = node.id;
        item.style.paddingLeft = (14 + depth * 16) + 'px';
        item.textContent = node.label;
        item.onclick = function () { setValue(node.id); closePanel(); };
        panel.appendChild(item);
        if (node.children && node.children.length) walk(node.children, depth + 1);
      });
    }
    walk(depts, 0);

    input.onclick = function (e) {
      e.stopPropagation();
      if (container.classList.contains('open')) closePanel();
      else openPanel();
    };
    panel.onclick = function (e) { e.stopPropagation(); };
    container.onclick = function (e) { e.stopPropagation(); };

    container.appendChild(input);
    container.appendChild(panel);

    if (!global._rbacCascaderDocBound) {
      global._rbacCascaderDocBound = true;
      document.addEventListener('click', function () {
        document.querySelectorAll('.rbac-cascader.open').forEach(function (el) {
          el.classList.remove('open');
        });
      });
    }

    setValue(selectedId || '');
    container.setValue = setValue;
    container.getValue = function () { return container.dataset.value || ''; };
  }

  function ensureRoleDisableModal() {
    if (document.getElementById('roleDisableBlockModal')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="rbac-modal-overlay" id="roleDisableBlockModal">' +
      '<div class="rbac-modal rbac-modal-warn">' +
      '<div class="rbac-modal-head"><i class="fas fa-triangle-exclamation mr-2"></i>无法停用角色</div>' +
      '<div class="rbac-modal-body">' +
      '<div class="rbac-modal-warn-icon"><i class="fas fa-circle-exclamation"></i></div>' +
      '<p id="roleDisableBlockMsg" class="text-sm text-slate-600 text-center leading-relaxed"></p>' +
      '</div>' +
      '<div class="rbac-modal-foot" style="justify-content:center;">' +
      '<button type="button" class="btn-sm btn-sm-primary" onclick="SystemRbacUi.closeRoleDisableBlockModal()">我知道了</button>' +
      '</div></div></div>';
    document.body.appendChild(wrap.firstElementChild);
  }

  function showRoleDisableBlockModal(roleName, userCount) {
    ensureRoleDisableModal();
    var msg = document.getElementById('roleDisableBlockMsg');
    if (msg) {
      msg.textContent = '角色「' + (roleName || '') + '」下仍有 ' + userCount + ' 个关联用户，无法停用。请先在用户管理中解除关联后再操作。';
    }
    document.getElementById('roleDisableBlockModal').classList.add('show');
  }

  function closeRoleDisableBlockModal() {
    var el = document.getElementById('roleDisableBlockModal');
    if (el) el.classList.remove('show');
  }

  function toast(msg, type) {
    var el = document.getElementById('rbacToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'rbacToast';
      el.className = 'rbac-toast';
      document.body.appendChild(el);
    }
    el.className = 'rbac-toast show ' + (type || 'info');
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  global.SystemRbacUi = {
    escapeHtml: escapeHtml,
    renderMenuTree: renderMenuTree,
    getCheckedMenuIds: getCheckedMenuIds,
    setAllMenuChecks: setAllMenuChecks,
    toggleExpandAll: toggleExpandAll,
    renderDeptTree: renderDeptTree,
    getCheckedDeptIds: getCheckedDeptIds,
    renderDeptManageTree: renderDeptManageTree,
    toggleDeptTreeExpand: toggleDeptTreeExpand,
    renderDeptCascader: renderDeptCascader,
    showRoleDisableBlockModal: showRoleDisableBlockModal,
    closeRoleDisableBlockModal: closeRoleDisableBlockModal,
    toast: toast
  };
})(typeof window !== 'undefined' ? window : this);
