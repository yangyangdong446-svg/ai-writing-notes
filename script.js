const notes = [
  {
    id: "prompt-workflow",
    title: "提示词不是魔法，而是协作接口",
    slug: "prompt-workflow",
    created: "2026/06/20",
    updated: "2026/06/20",
    category: "AI协作",
    tags: ["提示词", "Agent", "工作流"],
    summary: "记录如何把目标、读者、约束和素材交给 AI，让输出更稳定。",
    pinned: true
  },
  {
    id: "writing-skeleton",
    title: "先搭骨架，再追求漂亮句子",
    slug: "writing-skeleton",
    created: "2026/06/19",
    updated: "2026/06/20",
    category: "写作方法",
    tags: ["结构", "论证", "改稿"],
    summary: "把文章拆成论点、证据、转场和反例，再进入语言润色。",
    pinned: true
  },
  {
    id: "daily-review",
    title: "每日复盘要留下一个可复用动作",
    slug: "daily-review",
    created: "2026/06/18",
    updated: "2026/06/19",
    category: "复盘",
    tags: ["每日学习", "复盘", "行动清单"],
    summary: "学习记录不只保存感受，也保存下一次可以直接照做的动作。",
    pinned: false
  },
  {
    id: "source-card",
    title: "资料卡片：从素材到观点的转换",
    slug: "source-card",
    created: "2026/06/17",
    updated: "2026/06/18",
    category: "知识管理",
    tags: ["资料整理", "卡片", "知识库"],
    summary: "把长资料压缩为问题、要点、证据、可引用句和下一步。",
    pinned: false
  },
  {
    id: "publish-checklist",
    title: "发布前检查：标题、节奏、证据与读者路径",
    slug: "publish-checklist",
    created: "2026/06/16",
    updated: "2026/06/18",
    category: "写作方法",
    tags: ["发布", "检查清单", "编辑"],
    summary: "形成发布前最后一轮自检流程，减少临门一脚的混乱。",
    pinned: false
  },
  {
    id: "learning-map",
    title: "学习地图：把零散内容连成主线",
    slug: "learning-map",
    created: "2026/06/15",
    updated: "2026/06/17",
    category: "知识管理",
    tags: ["知识图谱", "主题", "长期项目"],
    summary: "用分类和标签追踪长期主题，让每日学习能被重新发现。",
    pinned: false
  },
  {
    id: "ai-revision",
    title: "让 AI 做编辑：三轮改稿法",
    slug: "ai-revision",
    created: "2026/06/14",
    updated: "2026/06/16",
    category: "AI协作",
    tags: ["改稿", "编辑", "质量控制"],
    summary: "第一轮看结构，第二轮看证据，第三轮看语言和读者体验。",
    pinned: false
  }
];

const categories = [
  { name: "AI协作", desc: "模型、Agent、提示词与共同编辑", icon: "✦", tone: "#3f82d7" },
  { name: "写作方法", desc: "结构、论证、叙事与发布实践", icon: "✎", tone: "#b05e29" },
  { name: "知识管理", desc: "资料卡片、标签系统与学习地图", icon: "◇", tone: "#20a486" },
  { name: "复盘", desc: "每日跟进、行动清单与阶段总结", icon: "◉", tone: "#9868d8" }
];

function parseDate(value) {
  return new Date(value.replaceAll("/", "-")).getTime();
}

function formatShortDate() {
  const date = new Date();
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" }).replace(",", "");
}

function sortNotes(list, field, dir) {
  return [...list].sort((a, b) => {
    const left = field === "title" ? a[field] : parseDate(a[field]);
    const right = field === "title" ? b[field] : parseDate(b[field]);
    const result = left > right ? 1 : left < right ? -1 : 0;
    return dir === "asc" ? result : -result;
  });
}

function noteLink(note) {
  return `./posts.html#${note.slug}`;
}

function renderPostList(list, target, withDates = true) {
  const element = document.querySelector(target);
  if (!element) return;
  element.innerHTML = `<ul class="post-list">${list.map((note) => `
    <li id="${note.slug}">
      ${withDates ? `<span class="date">${note.created}</span>` : ""}
      <a href="${noteLink(note)}">${note.title}</a>
    </li>`).join("")}</ul>`;
}

function deterministicDailyPick() {
  const seed = new Date().toISOString().slice(0, 10);
  return [...notes]
    .map((note) => ({
      note,
      score: [...`${seed}-${note.id}`].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.note);
}

function setupSortButtons(containerSelector) {
  const buttons = document.querySelectorAll(".sort-btn");
  const renderTarget = containerSelector;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderPostList(sortNotes(notes, button.dataset.field, button.dataset.dir), renderTarget);
    });
  });
}

function renderHome() {
  const dailyDate = document.querySelector("#daily-date");
  if (dailyDate) dailyDate.textContent = formatShortDate();
  renderPostList(notes.filter((note) => note.pinned), "#pinned-posts");
  renderPostList(deterministicDailyPick(), "#daily-posts", false);
  renderPostList(sortNotes(notes, "created", "desc"), "#sortable-posts");
  setupSortButtons("#sortable-posts");
}

function renderPosts() {
  renderPostList(sortNotes(notes, "created", "desc"), "#all-posts");
  setupSortButtons("#all-posts");
}

function renderTags() {
  const tagCounts = new Map();
  notes.forEach((note) => note.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const target = document.querySelector("#tag-list");
  if (!target) return;
  target.innerHTML = [...tagCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "zh-CN"))
    .map(([tag, count]) => `<li><a href="./posts.html">${tag}</a><span class="taxonomy-count">(${count})</span></li>`)
    .join("");
}

function renderCategories() {
  const target = document.querySelector("#category-grid");
  if (!target) return;
  target.innerHTML = categories.map((category) => {
    const items = notes.filter((note) => note.category === category.name);
    const tagCounts = new Map();
    items.forEach((note) => note.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
    const pills = [...tagCounts.entries()].slice(0, 8).map(([tag, count]) => `<span class="pill">${tag} <strong>${count}</strong></span>`).join("");
    return `
      <article class="taxonomy-card" style="--tone:${category.tone}">
        <div class="taxonomy-head">
          <span class="taxonomy-icon">${category.icon}</span>
          <div><h2>${category.name}</h2><p>${category.desc}</p></div>
          <span class="taxonomy-total">${items.length} 篇</span>
        </div>
        <div class="pill-row">${pills}</div>
      </article>`;
  }).join("");
}

function setupSearch() {
  const toggle = document.querySelector("#search-toggle");
  const overlay = document.querySelector("#search-overlay");
  const panel = document.querySelector("#search-panel");
  const input = document.querySelector("#search-input");
  const results = document.querySelector("#search-results");
  if (!toggle || !overlay || !panel || !input || !results) return;

  function openSearch() {
    panel.classList.add("is-open");
    overlay.classList.add("is-open");
    input.focus();
  }

  function closeSearch() {
    panel.classList.remove("is-open");
    overlay.classList.remove("is-open");
    input.value = "";
    results.innerHTML = '<p class="search-hint">输入关键词搜索标题、分类、标签和摘要</p>';
  }

  function renderResults(query) {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      results.innerHTML = '<p class="search-hint">输入关键词搜索标题、分类、标签和摘要</p>';
      return;
    }
    const matched = notes.filter((note) => [note.title, note.category, note.summary, ...note.tags].join(" ").toLowerCase().includes(keyword));
    results.innerHTML = matched.length
      ? matched.map((note) => `<a class="search-result-item" href="${noteLink(note)}"><span class="result-date">${note.created}</span><span class="result-title">${note.title}</span></a>`).join("")
      : '<p class="search-empty">没有找到匹配笔记</p>';
  }

  toggle.addEventListener("click", openSearch);
  overlay.addEventListener("click", closeSearch);
  input.addEventListener("input", (event) => renderResults(event.target.value));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSearch();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });
}

function setupTheme() {
  const button = document.querySelector("#theme-toggle");
  const stored = localStorage.getItem("notes-theme");
  if (stored === "dark") document.documentElement.classList.add("dark");
  if (button) button.textContent = document.documentElement.classList.contains("dark") ? "☀" : "☾";
  button?.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("notes-theme", isDark ? "dark" : "light");
    button.textContent = isDark ? "☀" : "☾";
  });
}

function setupNav() {
  const menu = document.querySelector("#nav-hamburger");
  const links = document.querySelector("#nav-links");
  const current = document.body.dataset.page;
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if ((current === "home" && href.includes("index")) || href.includes(`${current}.html`)) {
      link.classList.add("active");
    }
  });
  menu?.addEventListener("click", () => links?.classList.toggle("is-open"));
}

function setupBackToTop() {
  const button = document.querySelector("#back-to-top");
  if (!button) return;
  window.addEventListener("scroll", () => button.classList.toggle("show", window.scrollY > 360));
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function init() {
  const page = document.body.dataset.page;
  setupTheme();
  setupNav();
  setupSearch();
  setupBackToTop();
  if (page === "home") renderHome();
  if (page === "posts") renderPosts();
  if (page === "tags") renderTags();
  if (page === "categories") renderCategories();
}

init();
