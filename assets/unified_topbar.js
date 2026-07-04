(function () {
  var STYLE_ID = "unifiedTopbarStyle";
  var AUTH_KEY = "gc_auth";
  var BRAND_LOGO_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'
    + '<defs>'
    + '<linearGradient id="gc-shield-bg" x1="8" y1="4" x2="56" y2="58" gradientUnits="userSpaceOnUse">'
    + '<stop offset="0%" stop-color="#1a4fa0"/>'
    + '<stop offset="55%" stop-color="#2563eb"/>'
    + '<stop offset="100%" stop-color="#1d4ed8"/>'
    + '</linearGradient>'
    + '<linearGradient id="gc-gold-line" x1="12" y1="48" x2="52" y2="48" gradientUnits="userSpaceOnUse">'
    + '<stop offset="0%" stop-color="#b8860b"/>'
    + '<stop offset="50%" stop-color="#e8c547"/>'
    + '<stop offset="100%" stop-color="#b8860b"/>'
    + '</linearGradient>'
    + '<linearGradient id="gc-roof" x1="32" y1="16" x2="32" y2="28" gradientUnits="userSpaceOnUse">'
    + '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>'
    + '<stop offset="100%" stop-color="#dbeafe" stop-opacity="0.92"/>'
    + '</linearGradient>'
    + '</defs>'
    + '<path d="M32 3.5 55 13.2v18.8c0 12.8-9.8 22.6-23 27.5-13.2-4.9-23-14.7-23-27.5V13.2L32 3.5z" fill="url(#gc-shield-bg)"/>'
    + '<path d="M32 5.8 52.6 14.4v17.6c0 11.2-8.6 19.8-20.6 24.2-12-4.4-20.6-13-20.6-24.2V14.4L32 5.8z" fill="none" stroke="url(#gc-gold-line)" stroke-width="1.4"/>'
    + '<path d="M20 24.5 32 17.5 44 24.5v3.2H20v-3.2z" fill="url(#gc-roof)"/>'
    + '<rect x="22" y="27.2" width="20" height="2.2" rx="0.6" fill="#ffffff" opacity="0.88"/>'
    + '<path d="M24.5 31.5h15c1.1 0 2 .9 2 2v11.5c0 1.1-.9 2-2 2h-15c-1.1 0-2-.9-2-2V33.5c0-1.1.9-2 2-2z" fill="#ffffff" opacity="0.96"/>'
    + '<path d="M27.5 31.5v-3.2c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v3.2" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>'
    + '<text x="32" y="43.5" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="13.5" font-weight="700" fill="#1a4fa0">E</text>'
    + '<rect x="18" y="50.5" width="28" height="2" rx="1" fill="url(#gc-gold-line)"/>'
    + '</svg>';

  function getAuth() {
    var v = localStorage.getItem(AUTH_KEY);
    if (v !== "0" && v !== "1") {
      localStorage.setItem(AUTH_KEY, "0");
      return "0";
    }
    return v;
  }

  function getRouteBases() {
    var path = (window.location.pathname || "").toLowerCase();
    if (path.indexOf("/pages-new/") >= 0) {
      var pnTail = path.split("/pages-new/")[1] || "";
      var pnDepth = pnTail.split("/").filter(Boolean).length - 1;
      var pnUp = pnDepth > 0 ? "../".repeat(pnDepth) : "./";
      return {
        pages: pnDepth > 0 ? "../".repeat(pnDepth + 1) + "pages/" : "../pages/",
        pagesNew: pnUp,
        login: pnDepth > 0 ? "../".repeat(pnDepth + 1) + "login.html" : "../login.html"
      };
    }
    if (path.indexOf("/pages/") >= 0) {
      var tail = path.split("/pages/")[1] || "";
      var depth = Math.max(tail.split("/").filter(Boolean).length - 1, 0);
      var up = depth > 0 ? "../".repeat(depth) : "./";
      return {
        pages: up,
        pagesNew: depth > 0 ? "../".repeat(depth + 1) + "pages-new/" : "../pages-new/",
        login: depth > 0 ? "../".repeat(depth + 1) + "login.html" : "../login.html"
      };
    }
    return { pages: "./pages/", pagesNew: "./pages-new/", login: "./login.html" };
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

  function brandLogoHtml() {
    return window.__gcBrandLogoSvg || BRAND_LOGO_SVG;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ""
      + "@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700;900&display=swap');"
      + ".topbar{position:sticky;top:0;z-index:100;background:rgba(255,253,251,.98);box-shadow:0 2px 14px rgba(15,23,42,.07),inset 0 -1px 0 rgba(226,232,240,.88)}"
      + ".topbar-inner{max-width:1440px;margin:0 auto;height:92px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:0 24px}"
      + ".brand{display:flex;align-items:center;gap:14px;text-decoration:none;color:#0c2d6b;line-height:1;flex-shrink:0}"
      + ".brand-logo{width:52px;height:52px;flex-shrink:0;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 6px 14px rgba(26,79,160,.22))}"
      + ".brand-logo svg{width:100%;height:100%;display:block}"
      + ".brand-text{font-family:'Noto Serif SC','Source Han Serif SC','STSong','SimSun',serif;font-size:34px;font-weight:900;line-height:1;letter-spacing:.1em;color:#0c2d6b}"
      + ".brand-text .brand-e{color:#2563eb;letter-spacing:0;font-weight:900}"
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
      + "@media (max-width:900px){.topbar-inner{grid-template-columns:auto auto;height:auto;padding:12px 16px;gap:12px}.brand-logo{width:44px;height:44px}.brand-text{font-size:28px;letter-spacing:.08em}.main-tabs{grid-column:1/-1;order:3;overflow:auto;justify-self:stretch}.main-tab{flex:0 0 auto;height:40px;font-size:14px;padding:0 16px}.topbar-slogan{grid-column:1/-1;order:3;justify-self:stretch;justify-content:center;padding:8px 16px}.topbar-slogan-text{font-size:14px}.topbar-slogan-sub{display:none}}";
    document.head.appendChild(style);
  }

  function buildTopbarHtml(active) {
    var isLogin = getAuth() === "1";
    var routes = getRouteBases();
    function tab(key, href, icon, label) {
      var cls = "main-tab" + (active === key ? " active" : "");
      return '<a class="' + cls + '" href="' + href + '"><i class="' + icon + '"></i> ' + label + "</a>";
    }

    var centerBlock = isSloganPage()
      ? '<div class="topbar-slogan" aria-label="平台标语"><span class="topbar-slogan-text">' + (window.__gcTopbarSlogan || "看得清 · 比得准 · 采得值") + '</span><span class="topbar-slogan-sub">智慧采购决策平台</span></div>'
      : '<nav class="main-tabs" aria-label="采购主功能导航">'
        + tab("home", routes.pages + "merged_home.html?tab=home", "fa-solid fa-house", "首页")
        + tab("mall", routes.pages + "merged_home.html?tab=mall", "fa-solid fa-store", "国采搜品")
        + tab("plan", routes.pagesNew + "plan_result.html", "fa-regular fa-file-lines", "最价方案")
        + tab("compare", routes.pagesNew + "smart_compare.html", "fa-solid fa-magnifying-glass", "全网寻品")
        + "</nav>";

    return ''
      + '<div class="topbar-inner">'
      + '  <a class="brand" href="' + routes.pages + 'merged_home.html?tab=home" aria-label="国采E购首页">'
      + '    <span class="brand-logo">' + brandLogoHtml() + '</span>'
      + '    <span class="brand-text">国采<span class="brand-e">E</span>购</span>'
      + '  </a>'
      + centerBlock
      + '  <div class="topbar-actions">'
      + '    <a class="topbar-icon-btn" href="#" title="购物车"><i class="fa-solid fa-cart-shopping"></i><span class="badge-dot"></span></a>'
      + '    <a class="topbar-icon-btn" href="#" title="消息"><i class="fa-regular fa-bell"></i></a>'
      + (isLogin ? '    <a class="user-pill" href="#"><span class="user-avatar">张</span><span>张三</span></a>' : '')
      + '    <button class="auth-btn" type="button" onclick="window.__gcAuthAction()"><i class="fa-solid ' + (isLogin ? 'fa-right-from-bracket' : 'fa-right-to-bracket') + '"></i>' + (isLogin ? '登出' : '登录') + '</button>'
      + "  </div>"
      + "</div>";
  }

  function loginUrlWithRedirect() {
    var redirect = encodeURIComponent(window.location.pathname + window.location.search);
    return getRouteBases().login + "?redirect=" + redirect;
  }

  function authAction() {
    if (getAuth() === "1") {
      localStorage.setItem(AUTH_KEY, "0");
      window.location.href = getRouteBases().pages + "merged_home.html?tab=home";
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
