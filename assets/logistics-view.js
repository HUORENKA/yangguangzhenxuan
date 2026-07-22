/**
 * 查看物流弹窗 · 共享渲染与模拟数据（供应商/采购订单管理等页复用）
 */
window.LogisticsView = (function () {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function addHours(isoStr, h) {
    const d = new Date(String(isoStr).replace(/-/g, '/'));
    if (isNaN(d.getTime())) return isoStr;
    d.setHours(d.getHours() + h);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }

  /** 构建时间轴：最新节点在前，最新节点用长描述 */
  function buildTimelineNodes(waybill, carrier, shipTimeApi) {
    const base = shipTimeApi || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const history = [
      { time: base, desc: '快件已揽收', status: '已揽收', statusLoc: '浙江省,温州市,龙湾区' },
      { time: addHours(base, 6), desc: '快件已发往【温州转运中心】', status: '运输中', statusLoc: '浙江省,温州市' },
      { time: addHours(base, 18), desc: '快件到达【福州转运中心】', status: '运输中', statusLoc: '福建省,福州市' },
      { time: addHours(base, 30), desc: '快件已发出，下一站【福州仓山区】', status: '运输中', statusLoc: '福建省,福州市,仓山区' },
      { time: addHours(base, 42), desc: '快件派送中', status: '派送中', statusLoc: '福建省,福州市,仓山区' }
    ];
    const latest = {
      time: addHours(base, 48),
      desc: '您的包裹已由【彭启国，电话：13159473259】送达，并放置在【门卫室】，如有疑问请联系：13159473259',
      status: '签收',
      statusLoc: '福建,福州市,仓山区,螺洲镇',
      isLatest: true
    };
    return [latest].concat(history.slice().reverse());
  }

  function statusBadgeClass(status) {
    if (status === '签收') return 'logistics-status-signed';
    if (status === '派送中') return 'logistics-status-delivering';
    return 'logistics-status-transit';
  }

  function getShipmentCoverLine(order, shipment) {
    const alloc = shipment.allocations && shipment.allocations[0];
    if (!alloc) return order.lines[0];
    return order.lines.find(function (l) { return l.lineId === alloc.lineId; }) || order.lines[0];
  }

  function renderStaticMap(mapOpen) {
    return (
      '<div class="logistics-static-map' + (mapOpen ? ' show' : '') + '" id="logisticsStaticMapPanel">' +
      '<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="400" height="180" fill="#dcefe0"/>' +
      '<path d="M40,140 Q120,60 200,90 T360,50" fill="none" stroke="#3b82f6" stroke-width="4" stroke-dasharray="8 6" opacity="0.85"/>' +
      '<circle cx="40" cy="140" r="8" fill="#ef4444" stroke="#fff" stroke-width="2"/>' +
      '<circle cx="360" cy="50" r="8" fill="#16a34a" stroke="#fff" stroke-width="2"/>' +
      '<rect x="280" y="30" width="90" height="36" rx="6" fill="#fff" opacity="0.92"/>' +
      '<text x="325" y="52" text-anchor="middle" font-size="11" fill="#334155">当前位置示意</text>' +
      '</svg></div>'
    );
  }

  function renderPagerHtml(index, total, accentColor) {
    if (total <= 1) return '';
    var color = accentColor || '#2563eb';
    return (
      '<div class="logistics-pager" data-logistics-pager>' +
      '<button type="button" class="logistics-pager-btn" data-logistics-prev ' + (index <= 0 ? 'disabled' : '') + ' aria-label="上一条运单">' +
      '<i class="fa-solid fa-chevron-left"></i></button>' +
      '<span class="logistics-pager-text">运单 ' + (index + 1) + '/' + total + '</span>' +
      '<button type="button" class="logistics-pager-btn" data-logistics-next ' + (index >= total - 1 ? 'disabled' : '') + ' aria-label="下一条运单">' +
      '<i class="fa-solid fa-chevron-right"></i></button>' +
      '</div>'
    );
  }

  function renderModalBody(order, shipment, options) {
    options = options || {};
    var line = getShipmentCoverLine(order, shipment);
    var imgUrl = options.lineImageUrl ? options.lineImageUrl(line) : '';
    var nodes = buildTimelineNodes(shipment.waybill, shipment.carrier, shipment.shipTimeApi);
    var latest = nodes[0];
    var status = latest.status || '运输中';
    var mapOpen = !!options.mapOpen;

    var timelineHtml = nodes.map(function (n, i) {
      var isLatest = i === 0;
      var descClass = isLatest ? 'logistics-node-desc is-latest' : 'logistics-node-desc is-history';
      var footer = (n.statusLoc)
        ? '<div class="logistics-node-footer">' + escapeHtml(n.status) + ' ' + escapeHtml(n.statusLoc) + '</div>'
        : '';
      return (
        '<div class="logistics-node' + (isLatest ? ' is-latest' : '') + '">' +
        '<div class="logistics-node-time">' + escapeHtml(n.time) + '</div>' +
        '<div class="' + descClass + '">' + escapeHtml(n.desc) + '</div>' +
        footer +
        '</div>'
      );
    }).join('');

    return (
      '<div class="logistics-summary-card">' +
      '<img class="logistics-cover" src="' + escapeHtml(imgUrl) + '" alt="">' +
      '<div class="logistics-summary-meta">' +
      '<div><span class="lbl">物流公司：</span>' + escapeHtml(shipment.carrier) + '</div>' +
      '<div><span class="lbl">物流单号：</span>' + escapeHtml(shipment.waybill) + '</div>' +
      '<div><span class="lbl">订单编号：</span>' + escapeHtml(order.id) + '</div>' +
      '</div>' +
      '<span class="logistics-status-badge ' + statusBadgeClass(status) + '">' + escapeHtml(status) + '</span>' +
      '</div>' +
      '<div class="logistics-map-entry" data-logistics-map-toggle role="button" tabindex="0">' +
      '<span>查看物流位置</span><span class="chev"><i class="fa-solid fa-chevron-right"></i></span>' +
      '</div>' +
      renderStaticMap(mapOpen) +
      '<div class="logistics-section-title">物流节点明细</div>' +
      '<div class="logistics-timeline">' + timelineHtml + '</div>'
    );
  }

  function renderOrderLogisticsButton(orderId, shipmentCount, linkClass) {
    if (!shipmentCount) return '';
    var cls = linkClass || 'linklike';
    var label = shipmentCount > 1 ? '查看物流(' + shipmentCount + ')' : '查看物流';
    return '<button type="button" class="' + cls + '" data-action="timeline" data-order="' + escapeHtml(orderId) + '">' + label + '</button>';
  }

  return {
    escapeHtml: escapeHtml,
    buildTimelineNodes: buildTimelineNodes,
    renderModalBody: renderModalBody,
    renderPagerHtml: renderPagerHtml,
    renderOrderLogisticsButton: renderOrderLogisticsButton,
    getShipmentCoverLine: getShipmentCoverLine,
    statusBadgeClass: statusBadgeClass
  };
})();
