/* ============================================================
   星渊世界 - 全局交互脚本
   功能：深浅模式切换 · 移动端侧边栏 · 分类筛选 · 文章搜索
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

  /* ---------- 首页：分类筛选与搜索 ---------- */
  var cardGrid = document.getElementById("cardGrid");
  var emptyTip = document.getElementById("emptyTip");
  var searchInput = document.getElementById("searchInput");
  var chips = document.querySelectorAll(".chip");

  var activeFilter = "all";

  function filterCards() {
    if (!cardGrid) return;

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visibleCount = 0;

    cardGrid.querySelectorAll(".post-card").forEach(function (card) {
      var category = card.getAttribute("data-category");
      var text = card.textContent.toLowerCase();
      var matchFilter = activeFilter === "all" || category === activeFilter;
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;

      card.style.display = matchFilter && matchKeyword ? "" : "none";
      if (matchFilter && matchKeyword) visibleCount++;
    });

    if (emptyTip) emptyTip.hidden = visibleCount !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeFilter = chip.getAttribute("data-filter");
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }
})();
