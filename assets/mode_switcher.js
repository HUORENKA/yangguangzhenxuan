(function () {
  function initModeSwitcher() {
  var role = localStorage.getItem("role") || "buyer";
  if (role !== "buyer" && role !== "buyer-user") {
    return;
  }

  var path = window.location.pathname || "";
  if (path.indexOf("/pages/") === -1) {
    return;
  }

  var afterPages = path.split("/pages/")[1] || "";
  var parts = afterPages.split("/").filter(Boolean);
  if (!parts.length) return;

  var depth = Math.max(parts.length - 1, 0);
  var prefix = "";
  for (var i = 0; i < depth; i++) prefix += "../";

  var procurementHref = prefix + "home.html";
  var managementHref = prefix + "workbench/workbench_home.html";
  var isManagementMode = afterPages.indexOf("workbench/workbench_home.html") === 0;

  var oldFabs = document.querySelectorAll(".mode-switch-fab");
  oldFabs.forEach(function (el) {
    el.remove();
  });

  if (!document.getElementById("gcModeSwitcherStyle")) {
    var style = document.createElement("style");
    style.id = "gcModeSwitcherStyle";
    style.textContent = [
      ".mode-switch-fab{position:fixed;right:26px;bottom:26px;z-index:220;}",
      ".gc-mode-switch-track{position:relative;display:flex;align-items:center;gap:4px;padding:4px;border-radius:999px;border:1px solid #e2e8f0;background:rgba(15,23,42,.92);box-shadow:0 14px 26px rgba(15,23,42,.28)}",
      ".gc-mode-switch-thumb{position:absolute;top:4px;left:4px;width:calc(50% - 4px);height:40px;border-radius:999px;background:#fff;box-shadow:0 8px 16px rgba(15,23,42,.12);transition:transform .2s ease}",
      ".gc-mode-switch-track[data-active='management'] .gc-mode-switch-thumb{transform:translateX(100%)}",
      ".gc-mode-switch-item{position:relative;z-index:1;min-width:110px;height:40px;padding:0 14px;border:none;border-radius:999px;background:transparent;color:rgba(255,255,255,.82);font-size:14px;font-weight:700;letter-spacing:.2px;cursor:pointer;transition:color .2s ease}",
      ".gc-mode-switch-item:hover{color:#fff}",
      ".gc-mode-switch-item.active{color:#0f172a;cursor:default}",
      "@media (max-width:900px){.mode-switch-fab{right:14px;bottom:14px;width:calc(100vw - 28px)}.gc-mode-switch-track{width:100%}.gc-mode-switch-item{min-width:0;flex:1}}",
    ].join("");
    document.head.appendChild(style);
  }

  var fab = document.createElement("div");
  fab.className = "mode-switch-fab";

  var track = document.createElement("div");
  track.className = "gc-mode-switch-track";
  track.setAttribute("data-active", isManagementMode ? "management" : "procurement");

  var thumb = document.createElement("span");
  thumb.className = "gc-mode-switch-thumb";
  track.appendChild(thumb);

  var procurementBtn = document.createElement("button");
  procurementBtn.type = "button";
  procurementBtn.className = "gc-mode-switch-item" + (isManagementMode ? "" : " active");
  procurementBtn.textContent = "采购模式";
  procurementBtn.addEventListener("click", function () {
    if (!isManagementMode) return;
    window.location.href = procurementHref;
  });

  var managementBtn = document.createElement("button");
  managementBtn.type = "button";
  managementBtn.className = "gc-mode-switch-item" + (isManagementMode ? " active" : "");
  managementBtn.textContent = "管理模式";
  managementBtn.addEventListener("click", function () {
    if (isManagementMode) return;
    window.location.href = managementHref;
  });

  track.appendChild(procurementBtn);
  track.appendChild(managementBtn);
  fab.appendChild(track);
  document.body.appendChild(fab);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initModeSwitcher);
  } else {
    initModeSwitcher();
  }
})();
