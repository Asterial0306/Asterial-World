/* ============================================================
   星渊世界 - 全局交互脚本
   功能：深浅模式切换 · 移动端侧边栏
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "asterial-theme";

  /* ---------- 深浅模式切换 ---------- */
  var themeToggle = document.getElementById("themeToggle");

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // 初始化：优先使用本地保存的主题，否则跟随系统
  applyTheme(getSavedTheme() || getSystemTheme());

  // 未手动选择时，跟随系统主题变化
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  /* ---------- 侧边栏导航（数据来自 assets/data/nav.js） ---------- */
  var NAV_ICONS = {
    home: '<svg viewBox="0 0 24 24" class="icon"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-5V15h-5v6.5H4.5A1.5 1.5 0 0 1 3 20z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
    tech: '<svg viewBox="0 0 24 24" class="icon"><path d="M12 6.5a5.5 5.5 0 0 1 5.5 5.5v4a2.5 2.5 0 0 1-2.5 2.5H9a2.5 2.5 0 0 1-2.5-2.5v-4A5.5 5.5 0 0 1 12 6.5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M12 4v2M7 4.5L5.5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    life: '<svg viewBox="0 0 24 24" class="icon"><path d="M4 5h16v12H4z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    about: '<svg viewBox="0 0 24 24" class="icon"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" class="icon"><path d="M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.2L12 17.3l-5.6 2.9 1.2-6.2L3 9.6l6.3-.8z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
    article: '<svg viewBox="0 0 24 24" class="icon"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
  };

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderNav() {
    var container = document.getElementById("sidebarNav");
    if (!container) return;

    var data = window.NAV_DATA || [];
    var current = location.pathname.split("/").pop() || "index.html";

    container.innerHTML = data.map(function (item) {
      var active = item.url === current ? " active" : "";
      var icon = NAV_ICONS[item.icon] || NAV_ICONS.star;
      return '<a href="' + escapeHtml(item.url) + '" class="nav-item' + active + '">' +
               icon +
               '<span>' + escapeHtml(item.name) + '</span>' +
             '</a>';
    }).join("");
  }
  renderNav();

  /* ---------- 移动端侧边栏 ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    overlay && overlay.classList.remove("show");
    document.body.classList.remove("sidebar-open");
    menuToggle && menuToggle.setAttribute("aria-expanded", "false");
  }

  function openSidebar() {
    sidebar.classList.add("open");
    overlay && overlay.classList.add("show");
    document.body.classList.add("sidebar-open");
    menuToggle && menuToggle.setAttribute("aria-expanded", "true");
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });
    overlay && overlay.addEventListener("click", closeSidebar);
  }

  // 点击侧边栏链接后自动关闭抽屉
  if (sidebar) {
    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeSidebar);
    });
  }

  // 桌面端调整窗口大小时复位侧边栏状态
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) closeSidebar();
  });

  /* ---------- 公告列表（数据来自 assets/data/notice.js） ---------- */
  var MAX_NOTICE_ON_HOME = 3; // 首页最多展示公告条数

  function renderNotice() {
    var list = document.getElementById("noticeList");
    if (!list) return;

    var data = window.NOTICE_DATA || [];
    var isListPage = document.body.classList.contains("page-notices");
    var items = isListPage ? data : data.slice(0, MAX_NOTICE_ON_HOME);

    list.innerHTML = items.map(function (item) {
      return '<li class="list-item">' +
               '<span class="list-date">' + item.date + '</span>' +
               '<p class="list-text">' + item.text + '</p>' +
             '</li>';
    }).join("") || '<li class="list-item"><p class="list-text">暂无公告</p></li>';
  }
  renderNotice();

  /* ---------- 站点统计（数据来自 assets/data/stats.js） ---------- */
  function calcRunningDays(launchDate) {
    if (!launchDate) return 0;
    var parts = String(launchDate).split("-");
    if (parts.length !== 3) return 0;
    var launch = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - launch.getTime()) / 86400000) + 1; // 含上线当天
  }

  function renderStats() {
    var container = document.getElementById("stats");
    if (!container) return; // 非首页（如文章页）无统计，跳过

    var stats = window.STATS_DATA || {};
    var items = [
      { value: Number(stats.articles) || 0, label: "文章" },
      { value: Number(stats.categories) || 0, label: "分类" },
      { value: calcRunningDays(stats.launchDate), label: "运行天数" },
      { value: Number(stats.visits) || 0, label: "访客" }
    ];

    container.innerHTML = items.map(function (item) {
      return '<div class="stat-item">' +
               '<span class="stat-value">' + item.value + '</span>' +
               '<span class="stat-label">' + item.label + '</span>' +
             '</div>';
    }).join("");
  }
  renderStats();

  /* ---------- 精选内容（数据来自 assets/data/featured.js） ---------- */
  function renderFeatured() {
    var container = document.getElementById("featuredList");
    if (!container) return;

    var data = window.FEATURED_DATA || [];
    container.innerHTML = data.map(function (item) {
      return '<a class="featured-card" href="' + escapeHtml(item.url || "#") + '">' +
               '<span class="featured-title">' + escapeHtml(item.title) + '</span>' +
               '<span class="featured-desc">' + escapeHtml(item.desc) + '</span>' +
             '</a>';
    }).join("") || '<p class="featured-empty">暂无精选内容</p>';
  }
  renderFeatured();

  /* ---------- 文章列表（数据来自 assets/data/articles.js，页面 articles.html） ---------- */
  function renderArticlesList() {
    var container = document.getElementById("articleList");
    if (!container) return;

    var list = (window.ARTICLES_DATA || []).slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });

    container.innerHTML = list.map(function (item) {
      return '<a class="article-card" href="article.html?id=' + encodeURIComponent(item.id) + '">' +
               '<div class="article-card-head">' +
                 '<time>' + escapeHtml(item.date) + '</time>' +
                 (item.category ? '<span class="chip-mini">' + escapeHtml(item.category) + '</span>' : '') +
               '</div>' +
               '<h2 class="article-card-title">' + escapeHtml(item.title) + '</h2>' +
               (item.summary ? '<p class="article-card-summary">' + escapeHtml(item.summary) + '</p>' : '') +
             '</a>';
    }).join("") || '<p class="featured-empty">暂无文章</p>';
  }
  renderArticlesList();

  /* ---------- 文章详情（页面 article.html，通过 ?id= 指定文章） ---------- */
  function renderArticleDetail() {
    var box = document.getElementById("articleBox");
    if (!box) return;

    var id = Number(new URLSearchParams(location.search).get("id"));
    var list = window.ARTICLES_DATA || [];
    var article = null;
    for (var i = 0; i < list.length; i++) {
      if (Number(list[i].id) === id) { article = list[i]; break; }
    }

    if (!article) {
      box.innerHTML = '<p class="featured-empty">文章不存在或已删除。<a href="articles.html">返回文章列表</a></p>';
      return;
    }

    document.title = article.title + " - 星渊世界";

    box.innerHTML =
      '<header class="article-header">' +
        '<h1 class="article-title">' + escapeHtml(article.title) + '</h1>' +
        '<div class="article-meta">' +
          '<time>' + escapeHtml(article.date) + '</time>' +
          (article.category ? '<span class="dot">·</span><span>' + escapeHtml(article.category) + '</span>' : '') +
          '<span class="dot">·</span><span>作者：星渊</span>' +
        '</div>' +
      '</header>' +
      '<div class="article-body">' +
        (window.renderMarkdown ? window.renderMarkdown(article.content) : escapeHtml(article.content)) +
      '</div>';
  }
  renderArticleDetail();
})();
