(function () {
  var STYLE_ID = "unifiedTopbarStyle";
  var AUTH_KEY = "gc_auth";

  function getAuth() {
    var v = localStorage.getItem(AUTH_KEY);
    if (v !== "0" && v !== "1") {
      localStorage.setItem(AUTH_KEY, "0");
      return "0";
    }
    return v;
  }

  function getPageKey() {
    var path = (window.location.pathname || "").toLowerCase();
    if (path.endsWith("/merged_home.html")) {
      var q = new URLSearchParams(window.location.search || "");
      var tab = q.get("tab");
      return tab === "mall" ? "mall" : "home";
    }
    if (path.endsWith("/plan_result.html")) return "plan";
    if (path.endsWith("/smart_compare.html")) return "compare";
    if (path.endsWith("/search.html")) return "mall";
    if (path.endsWith("/product.html")) return "product";
    if (path.endsWith("/order_confirm.html")) return "order_confirm";
    return "";
  }

  function isSloganPage() {
    var key = getPageKey();
    return key === "product" || key === "order_confirm";
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ""
      + ".topbar{position:sticky;top:0;z-index:100;background:rgba(255,253,251,.98);box-shadow:0 2px 14px rgba(15,23,42,.07),inset 0 -1px 0 rgba(226,232,240,.88)}"
      + ".topbar-inner{max-width:1440px;margin:0 auto;height:88px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:0 24px}"
      + ".brand{display:flex;align-items:center;gap:12px;font-weight:800;color:#0f172a;line-height:1}"
      + ".brand-logo{width:36px;height:36px;border-radius:11px;background:linear-gradient(135deg,#3b82f6,#2563eb);box-shadow:0 8px 18px rgba(37,99,235,.28);flex-shrink:0}"
      + ".brand-text{font-size:28px;font-weight:800;line-height:1;letter-spacing:-.3px}"
      + ".main-tabs{display:inline-flex;justify-self:center;align-items:center;gap:8px;padding:6px;border:1px solid rgba(226,216,206,.55);border-radius:999px;background:#faf9f7}"
      + ".main-tab{height:44px;padding:0 20px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:#475569;text-decoration:none;white-space:nowrap}"
      + ".main-tab i{font-size:15px;width:16px;text-align:center}"
      + ".main-tab:hover{background:#eef2ff;color:#1d4ed8}"
      + ".main-tab.active{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;box-shadow:0 8px 18px rgba(37,99,235,.3)}"
      + ".topbar-actions{display:flex;align-items:center;gap:10px}"
      + ".topbar-icon-btn{position:relative;width:44px;height:44px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#334155;font-size:20px;text-decoration:none;transition:background .18s,color .18s}"
      + ".topbar-icon-btn:hover{background:#f1f5f9;color:#2563eb}"
      + ".badge-dot{position:absolute;top:7px;right:7px;width:7px;height:7px;background:#ef4444;border-radius:50%;border:2px solid #fff}"
      + ".user-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;color:#334155;text-decoration:none;font-size:15px;font-weight:700}"
      + ".user-pill:hover{background:#f8fafc}"
      + ".user-avatar{width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-size:15px;font-weight:800;box-shadow:0 6px 14px rgba(37,99,235,.22)}"
      + ".auth-btn{height:38px;padding:0 16px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:14px;font-weight:700;border:1px solid #dbe6f6;color:#1e40af;background:#eff6ff;cursor:pointer;transition:background .18s}"
      + ".auth-btn i{font-size:14px}"
      + ".auth-btn:hover{background:#dbeafe}"
      + ".topbar-slogan{display:inline-flex;justify-self:center;align-items:center;max-width:100%;padding:10px 32px;border:1px solid rgba(226,216,206,.55);border-radius:999px;background:#faf9f7}"
      + ".topbar-slogan-text{font-size:16px;font-weight:700;color:#1e40af;letter-spacing:.4px;white-space:nowrap}"
      + ".topbar-slogan-sub{margin-left:10px;font-size:14px;font-weight:600;color:#64748b}"
      + "@media (max-width:900px){.topbar-inner{grid-template-columns:auto auto;height:auto;padding:12px 16px;gap:12px}.main-tabs{grid-column:1/-1;order:3;overflow:auto;justify-self:stretch}.main-tab{flex:0 0 auto;height:40px;font-size:14px;padding:0 16px}.topbar-slogan{grid-column:1/-1;order:3;justify-self:stretch;justify-content:center;padding:8px 16px}.topbar-slogan-text{font-size:14px}.topbar-slogan-sub{display:none}}";
    document.head.appendChild(style);
  }

  function buildTopbarHtml(active) {
    var isLogin = getAuth() === "1";
    function tab(key, href, icon, label) {
      var cls = "main-tab" + (active === key ? " active" : "");
      return '<a class="' + cls + '" href="' + href + '"><i class="' + icon + '"></i> ' + label + "</a>";
    }

    var centerBlock = isSloganPage()
      ? '<div class="topbar-slogan" aria-label="平台标语"><span class="topbar-slogan-text">' + (window.__gcTopbarSlogan || "看得清 · 比得准 · 采得值") + '</span><span class="topbar-slogan-sub">智慧采购决策平台</span></div>'
      : '<nav class="main-tabs" aria-label="采购主功能导航">'
        + tab("home", "./merged_home.html?tab=home", "fa-solid fa-house", "首页")
        + tab("mall", "./merged_home.html?tab=mall", "fa-solid fa-store", "国采搜品")
        + tab("plan", "./plan_result.html", "fa-regular fa-file-lines", "最价方案")
        + tab("compare", "./smart_compare.html", "fa-solid fa-magnifying-glass", "全网寻品")
        + "</nav>";

    return ''
      + '<div class="topbar-inner">'
      + '  <div class="brand"><span class="brand-logo"></span><span class="brand-text">国采e购</span></div>'
      + centerBlock
      + '  <div class="topbar-actions">'
      + '    <a class="topbar-icon-btn" href="./workbench/workbench_home.html" title="工作台"><i class="fa-solid fa-briefcase"></i></a>'
      + '    <a class="topbar-icon-btn" href="#" title="购物车"><i class="fa-solid fa-cart-shopping"></i><span class="badge-dot"></span></a>'
      + '    <a class="topbar-icon-btn" href="#" title="消息"><i class="fa-regular fa-bell"></i></a>'
      + (isLogin ? '    <a class="user-pill" href="#"><span class="user-avatar">张</span><span>张三</span></a>' : '')
      + '    <button class="auth-btn" type="button" onclick="window.__gcAuthAction()"><i class="fa-solid ' + (isLogin ? 'fa-right-from-bracket' : 'fa-right-to-bracket') + '"></i>' + (isLogin ? '登出' : '登录') + '</button>'
      + "  </div>"
      + "</div>";
  }

  function loginUrlWithRedirect() {
    var redirect = encodeURIComponent(window.location.pathname + window.location.search);
    return "../login.html?redirect=" + redirect;
  }

  function authAction() {
    if (getAuth() === "1") {
      localStorage.setItem(AUTH_KEY, "0");
      window.location.href = "./merged_home.html?tab=home";
      return;
    }
    window.location.href = loginUrlWithRedirect();
  }

  function renderTopbar() {
    var topbars = document.querySelectorAll(".topbar");
    var topbar = topbars[0];
    for (var i = 1; i < topbars.length; i++) topbars[i].remove();
    if (!topbar) {
      topbar = document.createElement("header");
      topbar.className = "topbar";
      document.body.insertBefore(topbar, document.body.firstChild);
    }
    topbar.innerHTML = buildTopbarHtml(getPageKey());
  }

  function applyMergedHomeTab() {
    var path = (window.location.pathname || "").toLowerCase();
    if (!path.endsWith("/merged_home.html")) return;
    if (typeof window.switchMainTab !== "function") return;
    var tab = new URLSearchParams(window.location.search || "").get("tab");
    window.switchMainTab(tab === "mall" ? "mall" : "home");
  }

  window.__gcAuthAction = authAction;
  ensureStyle();
  renderTopbar();
  applyMergedHomeTab();
})();
