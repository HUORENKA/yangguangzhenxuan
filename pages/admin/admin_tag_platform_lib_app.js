(function () {
  'use strict';
  var TA = window.TagAdmin;
  var state = {
    libId: 'product',
    selectedTagId: null,
    expanded: {},
    mode: 'idle',
    createDraft: { level: 3, l1Id: '', l2Id: '', valueType: '是/否', method: 'AI+规则', source: '', note: '', ruleConfig: '' }
  };

  function $(id) { return document.getElementById(id); }

  function setCreateMode(on) {
    var layout = $('dictLayout');
    if (layout) layout.classList.toggle('create-mode', on);
  }

  function renderLibTabs() {
    var row = $('libTabRow');
    if (!row) return;
    row.innerHTML = TA.tagLibraries.map(function (lib) {
      return '<button type="button" class="tag-inner-tab' + (lib.id === state.libId ? ' active' : '') + '" data-lib="' + lib.id + '">' + lib.name + '</button>';
    }).join('');
    row.querySelectorAll('[data-lib]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.libId = btn.dataset.lib;
        state.selectedTagId = null;
        state.mode = 'idle';
        setCreateMode(false);
        renderLibTabs();
        renderTree();
        renderDetail();
      });
    });
  }

  function renderTreeNodes(nodes, depth) {
    return nodes.map(function (n) {
      var hasChild = n.children && n.children.length;
      var expanded = state.expanded[n.id] !== false;
      var active = state.mode !== 'create' && state.selectedTagId === n.id ? ' active' : '';
      var badge = n.level === 1 ? 'L1' : n.level === 2 ? 'L2' : 'L3';
      var html = '<div class="tree-node"><div class="tag-tree-row' + active + '" data-id="' + n.id + '" style="padding-left:' + (10 + depth * 14) + 'px">';
      html += '<span class="toggle' + (hasChild ? '' : ' empty') + '" data-toggle="' + n.id + '">' + (hasChild ? (expanded ? '▼' : '▶') : '') + '</span>';
      html += '<span class="level-badge">' + badge + '</span><span class="node-label">' + n.name + '</span>';
      if (n.leaf) html += '<span class="leaf-dot"></span>';
      html += '</div>';
      if (hasChild && expanded) html += '<div class="tree-children">' + renderTreeNodes(n.children, depth + 1) + '</div>';
      html += '</div>';
      return html;
    }).join('');
  }

  function renderTree() {
    var body = $('tagTreeBody');
    if (!body) return;
    var tree = TA.tagTrees[state.libId] || [];
    body.innerHTML = tree.length ? renderTreeNodes(tree, 0) : '<div class="empty-detail" style="min-height:120px"><p>该标签库暂无标签</p></div>';
    body.querySelectorAll('.tag-tree-row').forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target.closest('[data-toggle]')) return;
        state.mode = 'edit';
        state.selectedTagId = row.dataset.id;
        setCreateMode(false);
        renderTree();
        renderDetail();
      });
    });
    body.querySelectorAll('[data-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        state.expanded[btn.dataset.toggle] = state.expanded[btn.dataset.toggle] === false;
        renderTree();
      });
    });
  }

  function getL1Nodes(tree) {
    return tree.filter(function (n) { return n.level === 1; });
  }

  function getL2UnderL1(tree, l1Id) {
    var l1 = TA.findNode(tree, l1Id);
    if (!l1 || !l1.children) return [];
    return l1.children.filter(function (n) { return n.level === 2; });
  }

  function getAncestorChain(tree, nodeId) {
    var chain = [];
    function walk(nodes, path) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var next = path.concat(n);
        if (n.id === nodeId) { chain = next; return true; }
        if (n.children && walk(n.children, next)) return true;
      }
      return false;
    }
    walk(tree, []);
    return chain;
  }

  function libSelectOptions(selectedId) {
    return TA.tagLibraries.map(function (l) { return { value: l.id, label: l.name }; });
  }

  function inputField(label, id, val) {
    return '<div class="form-item"><label>' + label + '</label><input class="form-input" id="' + id + '" value="' + (val || '').replace(/"/g, '&quot;') + '"></div>';
  }
  function fieldRO(label, val) {
    return '<div class="form-item"><label>' + label + '</label><div class="form-value readonly">' + (val || '—') + '</div></div>';
  }
  function selField(label, id, val, opts, emptyLabel) {
    var html = '<div class="form-item"><label>' + label + '</label><select class="form-input" id="' + id + '">';
    if (emptyLabel) html += '<option value="">' + emptyLabel + '</option>';
    opts.forEach(function (o) {
      var v = typeof o === 'object' ? o.value : o;
      var t = typeof o === 'object' ? o.label : o;
      html += '<option value="' + v + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + t + '</option>';
    });
    html += '</select></div>';
    return html;
  }
  function textareaField(label, id, val, rows) {
    rows = rows || 2;
    return '<div class="form-item form-full"><label>' + label + '</label><textarea class="form-input" id="' + id + '" rows="' + rows + '">' + (val || '') + '</textarea></div>';
  }

  function getRuleContentLabel(method) {
    if (method === '系统直取') return '取值规则';
    if (method === '系统映射') return '映射规则';
    if (method === '系统计算' || method === '行为计算') return '计算规则';
    if (method.indexOf('AI') >= 0) return '提示词';
    if (method === '规则汇总') return '汇总规则';
    if (method === '规则引擎') return '规则表达式';
    return '规则内容';
  }

  function renderRuleContentField(method, meta) {
    var label = getRuleContentLabel(method);
    var val = meta.ruleConfig || '';
    if (method === 'AI 抽取+规则校验') {
      return textareaField('提示词', 'detailPrompt', val, 2) +
        textareaField('规则校验', 'detailRuleCheck', '枚举合法性；evidence 非空；数量截断', 2);
    }
    if (label === '提示词') return textareaField('提示词', 'detailPrompt', val, 2);
    return textareaField(label, 'detailRuleContent', val, 2);
  }

  function renderRuleMatchSection(meta, method, prefix) {
    prefix = prefix || 'detail';
    var freq = meta.frequency || '商品变更时';
    var html = '<div class="rule-section"><div class="rule-section-title"><i class="fas fa-sliders"></i> 打标规则匹配</div>';
    html += '<div class="form-grid form-grid-compact form-grid-3">';
    html += selField('打标方式', prefix + 'Method', method, TA.METHODS);
    html += selField('打标频次', prefix + 'Frequency', freq, TA.FREQUENCIES);
    html += selField('标签值类型', prefix + 'ValueType', meta.valueType, TA.VALUE_TYPES);
    html += inputField('标签来源', prefix + 'Source', meta.source || '');
    html += '</div>';
    html += '<div class="form-grid form-grid-compact">' + renderRuleContentField(method, meta) + '</div></div>';
    return html;
  }

  function renderEnumSection(meta, tagIdKey) {
    if (meta.valueType !== '枚举') return '';
    var html = '<div class="enum-section"><div class="enum-head"><span class="enum-title"><i class="fas fa-list"></i> 枚举值</span><button type="button" class="btn btn-sm btn-primary" id="btnAddEnum"><i class="fas fa-plus"></i> 新增</button></div>';
    html += '<div class="table-wrap"><table class="data-table"><thead><tr><th>枚举编码</th><th>枚举名称</th><th>排序</th></tr></thead><tbody>';
    (meta.enums || []).slice(0, 4).forEach(function (en) {
      html += '<tr><td>' + en.code + '</td><td>' + en.name + '</td><td>' + en.sort + '</td></tr>';
    });
    if (!(meta.enums && meta.enums.length)) html += '<tr><td colspan="3" class="text-muted text-center">暂无枚举值</td></tr>';
    html += '</tbody></table></div></div>';
    return html;
  }

  function buildBasicFields(opts) {
    var o = opts || {};
    var html = '<div class="form-section-title"><i class="fas fa-circle-info"></i> 基础信息</div>';
    html += '<div class="form-grid form-grid-compact form-grid-3">';
    html += inputField('标签名称', o.nameId || 'detailName', o.name || '');
    html += inputField('标签编码', o.codeId || 'detailCode', o.code || '');
    if (o.libEditable !== false) {
      html += selField('所属标签库', o.libId || 'detailLib', o.libVal || state.libId, libSelectOptions(o.libVal || state.libId));
    } else {
      var lib = TA.tagLibraries.find(function (l) { return l.id === (o.libVal || state.libId); });
      html += fieldRO('所属标签库', lib ? lib.name : '—');
    }
    if (o.levelEditable) {
      html += selField('标签层级', o.levelId || 'detailLevel', o.levelText || '三级标签', ['一级标签', '二级标签', '三级标签']);
    } else {
      html += fieldRO('标签层级', o.levelText || '—');
    }
    if (o.showL1Select) {
      html += selField('所属一级标签', o.l1Id || 'detailL1', o.l1Val || '', o.l1Options, '请选择所属一级标签');
    }
    if (o.showL2Select) {
      html += selField('所属二级标签', o.l2Id || 'detailL2', o.l2Val || '', o.l2Options, '请选择所属二级标签');
    }
    if (o.showL1RO) {
      html += fieldRO('所属一级标签', o.l1Name || '—');
    }
    if (o.showL2RO) {
      html += fieldRO('所属二级标签', o.l2Name || '—');
    }
    html += textareaField('备注 / 规则说明', o.noteId || 'detailNote', o.note || '', 2);
    html += '</div>';
    return html;
  }

  function bindLibSelectChange() {
    var libSel = $('detailLib');
    if (!libSel) return;
    libSel.addEventListener('change', function () {
      var nextLib = libSel.value;
      if (!TA.tagLibraries.some(function (l) { return l.id === nextLib; })) return;
      state.libId = nextLib;
      if (state.mode === 'create') {
        state.createDraft.l1Id = '';
        state.createDraft.l2Id = '';
      } else if (state.mode === 'edit' && state.selectedTagId) {
        var tree = TA.tagTrees[state.libId] || [];
        if (!TA.findNode(tree, state.selectedTagId)) {
          state.selectedTagId = null;
          state.mode = 'idle';
        }
      }
      renderLibTabs();
      renderTree();
      renderDetail();
    });
  }

  function bindCreateFormEvents() {
    bindLibSelectChange();
    var levelSel = $('detailLevel');
    if (levelSel) {
      levelSel.addEventListener('change', function () {
        var map = { '一级标签': 1, '二级标签': 2, '三级标签': 3 };
        state.createDraft.level = map[levelSel.value] || 3;
        if (state.createDraft.level === 1) { state.createDraft.l1Id = ''; state.createDraft.l2Id = ''; }
        if (state.createDraft.level === 2) state.createDraft.l2Id = '';
        renderDetail();
      });
    }
    var l1Sel = $('detailL1');
    if (l1Sel) {
      l1Sel.addEventListener('change', function () {
        state.createDraft.l1Id = l1Sel.value;
        state.createDraft.l2Id = '';
        renderDetail();
      });
    }
    var l2Sel = $('detailL2');
    if (l2Sel) l2Sel.addEventListener('change', function () { state.createDraft.l2Id = l2Sel.value; });

    var methodSel = $('createMethod');
    if (methodSel) {
      methodSel.addEventListener('change', function () {
        state.createDraft.method = methodSel.value;
        renderDetail();
      });
    }
    var vtSel = $('createValueType');
    if (vtSel) vtSel.addEventListener('change', function () { state.createDraft.valueType = vtSel.value; renderDetail(); });

    var back = $('btnBackCreate');
    if (back) back.addEventListener('click', exitCreateMode);

    var save = $('btnSaveCreate');
    if (save) save.addEventListener('click', function () {
      var name = ($('detailName') || {}).value;
      if (!name || !name.trim()) { alert('请填写标签名称'); return; }
      if (state.createDraft.level >= 2 && !state.createDraft.l1Id) { alert('请选择所属一级标签'); return; }
      if (state.createDraft.level === 3 && !state.createDraft.l2Id) { alert('请选择所属二级标签'); return; }
      alert('已保存新标签（原型演示）');
      exitCreateMode();
    });
  }

  function bindEditFormEvents(meta, node) {
    bindLibSelectChange();
    var methodSel = $('detailMethod');
    if (methodSel) {
      methodSel.addEventListener('change', function () {
        if (!TA.tagMeta[state.selectedTagId]) TA.tagMeta[state.selectedTagId] = meta;
        TA.tagMeta[state.selectedTagId].method = methodSel.value;
        renderDetail();
      });
    }
    $('btnSaveTag') && $('btnSaveTag').addEventListener('click', function () { alert('已保存标签配置（原型演示）'); });
    $('btnAddEnum') && $('btnAddEnum').addEventListener('click', function () {
      if (!TA.tagMeta[state.selectedTagId]) TA.tagMeta[state.selectedTagId] = meta;
      if (!TA.tagMeta[state.selectedTagId].enums) TA.tagMeta[state.selectedTagId].enums = [];
      var arr = TA.tagMeta[state.selectedTagId].enums;
      arr.push({ code: 'NEW_' + Date.now(), name: '新枚举', sort: arr.length + 1 });
      renderDetail();
    });
    $('btnRuleTest') && $('btnRuleTest').addEventListener('click', function () { alert('规则测试通过（原型演示）'); });
  }

  function exitCreateMode() {
    state.mode = 'idle';
    state.selectedTagId = null;
    setCreateMode(false);
    renderTree();
    renderDetail();
  }

  function enterCreateMode() {
    state.mode = 'create';
    state.selectedTagId = null;
    state.createDraft = { level: 3, l1Id: '', l2Id: '', valueType: '是/否', method: 'AI+规则', source: '', note: '', ruleConfig: '', enums: [] };
    setCreateMode(true);
    renderTree();
    renderDetail();
  }

  function renderCreateForm() {
    var panel = $('tagDetailPanel');
    var tree = TA.tagTrees[state.libId] || [];
    var d = state.createDraft;
    var levelText = d.level === 1 ? '一级标签' : d.level === 2 ? '二级标签' : '三级标签';
    var l1Nodes = getL1Nodes(tree).map(function (n) { return { value: n.id, label: n.name }; });
    var l2Nodes = d.l1Id ? getL2UnderL1(tree, d.l1Id).map(function (n) { return { value: n.id, label: n.name }; }) : [];
    var meta = { valueType: d.valueType, method: d.method, source: d.source, note: d.note, ruleConfig: d.ruleConfig, frequency: '商品变更时', enums: d.enums || [] };

    var html = '<div class="tag-config-inner">';
    html += '<button type="button" class="tag-config-back" id="btnBackCreate"><i class="fas fa-arrow-left"></i> 返回标签树</button>';
    html += '<div class="detail-head"><h3>新增标签</h3></div>';
    html += buildBasicFields({
      levelEditable: true,
      levelText: levelText,
      libVal: state.libId,
      showL1Select: d.level >= 2,
      showL2Select: d.level === 3,
      l1Options: l1Nodes,
      l2Options: l2Nodes,
      l1Val: d.l1Id,
      l2Val: d.l2Id
    });

    if (d.level === 3) {
      html += renderRuleMatchSection(meta, d.method, 'create');
      html += renderEnumSection(meta);
    } else {
      html += '<div class="hint-box"><i class="fas fa-info-circle"></i> 一级/二级标签为分类节点；<strong>三级标签</strong>才配置打标规则匹配与枚举值。</div>';
    }

    html += '<div class="detail-actions">';
    html += '<button type="button" class="btn btn-outline" id="btnBackCreate2">取消</button>';
    html += '<button type="button" class="btn btn-primary" id="btnSaveCreate"><i class="fas fa-save"></i> 保存</button>';
    html += '</div></div>';

    panel.innerHTML = html;
    bindCreateFormEvents();
    $('btnBackCreate2') && $('btnBackCreate2').addEventListener('click', exitCreateMode);
  }

  function renderEditForm() {
    var panel = $('tagDetailPanel');
    var tree = TA.tagTrees[state.libId] || [];
    var node = TA.findNode(tree, state.selectedTagId);
    if (!node) return;
    var meta = TA.tagMeta[state.selectedTagId] || {
      code: 'TAG_' + state.selectedTagId.toUpperCase().replace(/-/g, '_'),
      valueType: node.leaf ? '文本' : '—',
      method: node.leaf ? 'AI+规则' : '—',
      source: '—',
      note: '',
      ruleConfig: '',
      frequency: '商品变更时',
      enums: []
    };
    if (!meta.frequency) meta.frequency = '商品变更时';
    var levelText = node.level === 1 ? '一级标签' : node.level === 2 ? '二级标签' : '三级标签';
    var isL3 = node.level === 3 && node.leaf;
    var ancestors = getAncestorChain(tree, state.selectedTagId);
    var l1Node = ancestors.find(function (n) { return n.level === 1; });
    var l2Node = ancestors.find(function (n) { return n.level === 2; });

    var html = '<div class="tag-config-inner">';
    html += '<div class="detail-head"><h3>' + node.name + '</h3></div>';
    html += buildBasicFields({
      name: node.name,
      code: meta.code,
      levelText: levelText,
      libVal: state.libId,
      note: meta.note || '',
      levelEditable: false,
      showL1RO: node.level >= 2,
      showL2RO: node.level >= 3,
      l1Name: l1Node ? l1Node.name : '—',
      l2Name: l2Node ? l2Node.name : '—'
    });

    if (!isL3) {
      html += '<div class="hint-box"><i class="fas fa-info-circle"></i> 当前为<strong>分类节点</strong>；三级标签才配置打标规则匹配与枚举值。</div>';
    }
    if (isL3) {
      html += renderRuleMatchSection(meta, meta.method, 'detail');
      html += renderEnumSection(meta, state.selectedTagId);
      html += '<div class="detail-actions"><button type="button" class="btn btn-primary" id="btnSaveTag"><i class="fas fa-save"></i> 保存配置</button></div>';
    }
    html += '</div>';

    panel.innerHTML = html;
    bindEditFormEvents(meta, node);
  }

  function renderDetail() {
    var panel = $('tagDetailPanel');
    if (!panel) return;
    if (state.mode === 'create') {
      renderCreateForm();
      return;
    }
    if (!state.selectedTagId) {
      panel.innerHTML = '<div class="empty-detail"><i class="fas fa-tags"></i><p>请在左侧选择标签节点，或点击右上角「新增标签」</p></div>';
      return;
    }
    renderEditForm();
  }

  function init() {
    var params = new URLSearchParams(location.search);
    if (params.get('lib') && TA.tagLibraries.some(function (l) { return l.id === params.get('lib'); })) {
      state.libId = params.get('lib');
    }
    renderLibTabs();
    renderTree();
    renderDetail();

    $('btnAddLib').addEventListener('click', function () { $('libModal').hidden = false; });
    $('btnAddTag').addEventListener('click', enterCreateMode);
    $('btnImportTag').addEventListener('click', function () { alert('导入标签库（原型演示）'); });
    $('btnExportTag').addEventListener('click', function () { alert('导出标签库（原型演示）'); });
    $('btnCloseLibModal').addEventListener('click', function () { $('libModal').hidden = true; });
    $('btnSaveLib').addEventListener('click', function () {
      var name = $('newLibName').value.trim();
      var code = $('newLibCode').value.trim();
      if (!name || !code) { alert('请填写标签库名称与编码'); return; }
      var id = code.toLowerCase();
      if (TA.tagLibraries.some(function (l) { return l.id === id; })) { alert('编码已存在'); return; }
      TA.tagLibraries.push({ id: id, name: name, code: code, desc: ($('newLibDesc').value || '').trim() });
      TA.tagTrees[id] = [];
      state.libId = id;
      $('libModal').hidden = true;
      $('newLibName').value = '';
      $('newLibCode').value = '';
      $('newLibDesc').value = '';
      renderLibTabs();
      renderTree();
      renderDetail();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
