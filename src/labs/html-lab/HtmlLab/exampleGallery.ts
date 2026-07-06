import type { LabElement, BodyStyles, JsFile, MultiPageData, SinglePageData, ExampleData, Example } from "./types";
import { generateExampleProject } from "./exampleProject";

export function el(
  id: string,
  tag: string,
  parentId: string | null,
  styles: Record<string, string> = {},
  content = "",
  attrs: Record<string, string> = {},
): LabElement {
  return { id, tag, parentId, styles, content, attrs, mediaQueries: [] };
}

// ── Multi-page Portfolio ───────────────────────────────────────────────────────
function generateMultiPageExample(): MultiPageData {
  const NAV_STYLE: Record<string, string> = {
    display: "flex", alignItems: "center", gap: "0",
    padding: "0 32px", height: "58px",
    background: "#1e293b", borderBottom: "1px solid #334155",
  };
  const LOGO_STYLE: Record<string, string> = {
    color: "#60a5fa", fontWeight: "700", fontSize: "18px",
    flex: "1", letterSpacing: "-0.02em",
  };
  const LINK_STYLE: Record<string, string> = {
    color: "#94a3b8", textDecoration: "none", fontSize: "14px",
    padding: "0 16px", height: "58px", display: "flex",
    alignItems: "center", transition: "color 0.15s",
  };
  const LINK_ACTIVE: Record<string, string> = { ...LINK_STYLE, color: "#f8fafc", fontWeight: "600",
    borderBottom: "2px solid #60a5fa" };
  const BODY: BodyStyles = {
    margin: "0", padding: "0", background: "#0f172a", color: "#f8fafc",
    fontFamily: "system-ui, sans-serif",
  };
  const EXPORT_NOTE: Record<string, string> = {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 32px", background: "#1c2d1a", borderBottom: "1px solid #2d4a2a",
    fontSize: "12px", color: "#4ade80",
  };

  function nav(active: string): LabElement[] {
    const links = [
      { id: "l-home",  text: "Home",  href: "index.html", key: "home"  },
      { id: "l-about", text: "About", href: "about.html", key: "about" },
      { id: "l-work",  text: "Work",  href: "work.html",  key: "work"  },
    ];
    return [
      el("pg-nav",  "header", null,     NAV_STYLE),
      el("pg-logo", "span",   "pg-nav", LOGO_STYLE, "Portfolio"),
      ...links.map(l => el(l.id, "a", "pg-nav", l.key === active ? LINK_ACTIVE : LINK_STYLE, l.text, { href: l.href })),
    ];
  }

  function note(): LabElement {
    return el("export-note", "div", null, EXPORT_NOTE, "🔗 Navigation links work after ↓ Export All — open index.html in a browser to try it.");
  }

  // ── HOME PAGE ──────────────────────────────────────────────────────────────
  const homeEls: LabElement[] = [
    ...nav("home"),
    note(),
    el("home-hero", "section", null, { padding: "80px 32px 64px", background: "#0f172a", textAlign: "center" }),
    el("home-tag", "span", "home-hero", {
      display: "inline-block", background: "#1e3a5f", color: "#60a5fa",
      fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em",
      textTransform: "uppercase", padding: "4px 12px", borderRadius: "20px", marginBottom: "24px",
    }, "Available for hire"),
    el("home-h1", "h1", "home-hero", {
      fontSize: "54px", fontWeight: "800", margin: "0 0 16px", lineHeight: "1.1", letterSpacing: "-0.03em",
    }, "Hi, I'm Michael"),
    el("home-sub", "p", "home-hero", {
      color: "#94a3b8", fontSize: "20px", maxWidth: "520px", margin: "0 auto 36px", lineHeight: "1.6",
    }, "Full-stack developer crafting fast, accessible web experiences."),
    el("home-btns", "div", "home-hero", { display: "flex", gap: "12px", justifyContent: "center" }),
    el("home-btn1", "a", "home-btns", {
      background: "#3b82f6", color: "#fff", padding: "12px 28px",
      borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "15px",
    }, "View Work →", { href: "work.html" }),
    el("home-btn2", "a", "home-btns", {
      background: "transparent", color: "#94a3b8", padding: "12px 28px",
      borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "15px",
      border: "1px solid #334155",
    }, "About me", { href: "about.html" }),
    el("home-stats", "div", null, {
      display: "flex", justifyContent: "center", gap: "0",
      borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b",
    }),
    el("stat-0",   "div", "home-stats", { padding: "32px 48px", textAlign: "center", borderRight: "1px solid #1e293b" }),
    el("stat-0-n", "div", "stat-0",     { fontSize: "32px", fontWeight: "800", color: "#60a5fa" }, "5+"),
    el("stat-0-l", "div", "stat-0",     { fontSize: "13px", color: "#64748b", marginTop: "4px" }, "years experience"),
    el("stat-1",   "div", "home-stats", { padding: "32px 48px", textAlign: "center", borderRight: "1px solid #1e293b" }),
    el("stat-1-n", "div", "stat-1",     { fontSize: "32px", fontWeight: "800", color: "#60a5fa" }, "40+"),
    el("stat-1-l", "div", "stat-1",     { fontSize: "13px", color: "#64748b", marginTop: "4px" }, "projects shipped"),
    el("stat-2",   "div", "home-stats", { padding: "32px 48px", textAlign: "center" }),
    el("stat-2-n", "div", "stat-2",     { fontSize: "32px", fontWeight: "800", color: "#60a5fa" }, "12"),
    el("stat-2-l", "div", "stat-2",     { fontSize: "13px", color: "#64748b", marginTop: "4px" }, "countries · clients"),
  ];

  // ── ABOUT PAGE ─────────────────────────────────────────────────────────────
  const skills = ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Three.js", "Figma", "AWS"];
  const aboutEls: LabElement[] = [
    ...nav("about"),
    note(),
    el("ab-hero", "section", null, { padding: "64px 32px 48px", maxWidth: "720px", margin: "0 auto" }),
    el("ab-h1", "h1", "ab-hero", { fontSize: "40px", fontWeight: "800", margin: "0 0 20px", letterSpacing: "-0.03em" }, "About me"),
    el("ab-p1", "p", "ab-hero", { color: "#94a3b8", fontSize: "17px", lineHeight: "1.75", margin: "0 0 16px" }, "I'm a full-stack developer based in Boston with a passion for building products that are fast, accessible, and a joy to use."),
    el("ab-p2", "p", "ab-hero", { color: "#94a3b8", fontSize: "17px", lineHeight: "1.75", margin: "0 0 36px" }, "I specialize in React, Node.js, and TypeScript. When I'm not coding I'm hiking, reading, or experimenting with generative art."),
    el("ab-skills-title", "h2", "ab-hero", { fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: "0 0 16px" }, "Technologies"),
    el("ab-skills", "div", "ab-hero", { display: "flex", flexWrap: "wrap", gap: "8px" }),
    ...skills.map((s, i) => el(`skill-${i}`, "span", "ab-skills", {
      background: "#1e293b", color: "#60a5fa", fontSize: "13px",
      padding: "6px 14px", borderRadius: "20px", border: "1px solid #334155",
    }, s)),
    el("ab-cta", "div", "ab-hero", {
      marginTop: "48px", padding: "28px", background: "#1e293b",
      borderRadius: "12px", border: "1px solid #334155",
      display: "flex", alignItems: "center", gap: "24px",
    }),
    el("ab-cta-text", "p", "ab-cta", { color: "#94a3b8", fontSize: "15px", margin: "0", flex: "1" }, "Interested in working together? See what I've built."),
    el("ab-cta-btn", "a", "ab-cta", {
      background: "#3b82f6", color: "#fff", padding: "10px 22px",
      borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px", flexShrink: "0",
    }, "See Work →", { href: "work.html" }),
  ];

  // ── WORK PAGE ──────────────────────────────────────────────────────────────
  const PROJECTS = [
    { name: "Orbit Dashboard",    desc: "SaaS analytics platform for e-commerce. Built with React + Node + PostgreSQL.",      tags: ["React", "Node", "Postgres"],    color: "#3b82f6" },
    { name: "Pulse Design System",desc: "Component library used by 6 internal teams. 200+ components, full Storybook.",       tags: ["TypeScript", "Storybook", "CSS"], color: "#8b5cf6" },
    { name: "MapFlow",            desc: "Real-time fleet tracking app. Leaflet maps + WebSocket updates. Used by 3 logistics firms.", tags: ["WebSocket", "Leaflet", "Node"], color: "#10b981" },
    { name: "Solstice",           desc: "Generative art tool using Three.js and WebGL. 5k users in launch week.",             tags: ["Three.js", "WebGL", "Canvas"],   color: "#f59e0b" },
    { name: "OpenCart CLI",       desc: "Developer CLI for Shopify store management. 800+ GitHub stars.",                     tags: ["Node", "CLI", "Open Source"],    color: "#ec4899" },
    { name: "Helio API",          desc: "REST + GraphQL API for a health-tech startup. HIPAA compliant, 99.9% uptime.",       tags: ["GraphQL", "AWS", "Security"],    color: "#06b6d4" },
  ];

  const workEls: LabElement[] = [
    ...nav("work"),
    note(),
    el("wk-hero", "section", null, { padding: "64px 32px 48px" }),
    el("wk-h1",   "h1",     "wk-hero", { fontSize: "40px", fontWeight: "800", margin: "0 0 12px", letterSpacing: "-0.03em" }, "Selected Work"),
    el("wk-sub",  "p",      "wk-hero", { color: "#64748b", fontSize: "16px", margin: "0 0 40px" }, "A few things I've shipped recently."),
    el("wk-grid", "div",    "wk-hero", { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }),
    ...PROJECTS.flatMap((p, i) => [
      el(`proj-${i}`, "div", "wk-grid", { background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }),
      el(`proj-${i}-dot`,  "div", `proj-${i}`, { width: "10px", height: "10px", borderRadius: "50%", background: p.color, flexShrink: "0" }),
      el(`proj-${i}-name`, "h3",  `proj-${i}`, { fontSize: "16px", fontWeight: "700", color: "#f8fafc", margin: "0" }, p.name),
      el(`proj-${i}-desc`, "p",   `proj-${i}`, { color: "#94a3b8", fontSize: "13px", lineHeight: "1.6", margin: "0", flex: "1" }, p.desc),
      el(`proj-${i}-tags`, "div", `proj-${i}`, { display: "flex", flexWrap: "wrap", gap: "6px" }),
      ...p.tags.map((t, j) => el(`proj-${i}-tag-${j}`, "span", `proj-${i}-tags`, { background: "#0f172a", color: "#64748b", fontSize: "11px", padding: "3px 8px", borderRadius: "4px", border: "1px solid #1e293b" }, t)),
    ]),
    el("wk-cta",      "div", "wk-hero", { marginTop: "48px", textAlign: "center" }),
    el("wk-cta-link", "a",   "wk-cta",  { color: "#3b82f6", textDecoration: "none", fontSize: "14px", fontWeight: "600" }, "← Back to Home", { href: "index.html" }),
  ];

  const pages = [
    { id: "pg-home",  name: "Home",  elements: homeEls,  bodyStyles: BODY, jsFiles: [], customCss: "" },
    { id: "pg-about", name: "About", elements: aboutEls, bodyStyles: BODY, jsFiles: [], customCss: "" },
    { id: "pg-work",  name: "Work",  elements: workEls,  bodyStyles: BODY, jsFiles: [], customCss: "" },
  ];

  return { pages };
}

// ── API Dashboard ──────────────────────────────────────────────────────────────
function generateApiExample(): SinglePageData {
  const elements: LabElement[] = [
    el("api-topbar", "div", null, { padding: "20px 32px", background: "#0f172a", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }),
    el("api-title-wrap", "div", "api-topbar"),
    el("api-title",    "h1",    "api-title-wrap", { color: "#f8fafc", fontSize: "24px", fontWeight: "700", margin: "0" }, "User Directory"),
    el("api-subtitle", "p",     "api-title-wrap", { color: "#64748b", fontSize: "13px", margin: "4px 0 0" }, "Live data · JSONPlaceholder REST API"),
    el("api-refresh",  "button","api-topbar", { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }, "↻ Refresh", { class: "api-refresh-btn" }),
    el("api-grid", "div", null, { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", padding: "24px 32px", background: "#0f172a", flex: "1" }, "", { class: "api-users-grid" }),
  ];

  const bodyStyles: BodyStyles = {
    background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif",
    margin: "0", padding: "0", display: "flex", flexDirection: "column", minHeight: "100vh",
  };

  const javascript = `(function() {
  var grid = document.querySelector('.api-users-grid');
  var btn  = document.querySelector('.api-refresh-btn');
  var COLORS = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4'];

  function showLoading() {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#475569;font-size:15px;">Loading users…</div>';
  }

  function card(u) {
    var color = COLORS[u.id % COLORS.length];
    return '<div class="api-card" style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px;transition:transform .15s,box-shadow .15s;cursor:default;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<div style="width:46px;height:46px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:700;flex-shrink:0;">' + u.name.charAt(0) + '</div>' +
        '<div><div style="color:#f1f5f9;font-weight:600;font-size:15px;">' + u.name + '</div>' +
        '<div style="color:#64748b;font-size:12px;">' + u.company.name + '</div></div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:4px;">' +
        '<div style="color:#94a3b8;font-size:13px;">✉ ' + u.email + '</div>' +
        '<div style="color:#94a3b8;font-size:13px;">🌐 ' + u.website + '</div>' +
        '<div style="color:#94a3b8;font-size:13px;">📍 ' + u.address.city + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:#64748b;background:#0f172a;border-radius:6px;padding:6px 10px;font-style:italic;">"' + u.company.catchPhrase + '"</div>' +
    '</div>';
  }

  function load() {
    showLoading();
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(function(r) { return r.json(); })
      .then(function(users) {
        grid.innerHTML = users.map(card).join('');
        grid.querySelectorAll('.api-card').forEach(function(c) {
          c.addEventListener('mouseenter', function() { c.style.transform = 'translateY(-3px)'; c.style.boxShadow = '0 8px 24px rgba(0,0,0,.5)'; });
          c.addEventListener('mouseleave', function() { c.style.transform = ''; c.style.boxShadow = ''; });
        });
      })
      .catch(function() {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#f87171;">Failed to load — check your connection.</div>';
      });
  }

  btn && btn.addEventListener('click', load);
  load();
})();`;

  return { elements, bodyStyles, javascript };
}

// ── Kanban Board ───────────────────────────────────────────────────────────────
function generateKanbanExample(): SinglePageData {
  const COL: Record<string, string> = { background: "#1e293b", borderRadius: "12px", padding: "12px", width: "260px", minWidth: "260px", display: "flex", flexDirection: "column", gap: "8px", flexShrink: "0" };
  const COL_HDR: Record<string, string> = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 4px" };
  const COL_TITLE: Record<string, string> = { color: "#f8fafc", fontSize: "12px", fontWeight: "700", margin: "0", textTransform: "uppercase", letterSpacing: "0.07em" };
  const BADGE: Record<string, string> = { background: "#334155", color: "#94a3b8", borderRadius: "10px", padding: "1px 8px", fontSize: "11px" };
  const LIST: Record<string, string> = { display: "flex", flexDirection: "column", gap: "8px", minHeight: "60px", borderRadius: "8px", padding: "4px", transition: "background 0.15s" };
  const ADD_BTN: Record<string, string> = { background: "none", border: "1px dashed #334155", color: "#64748b", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", cursor: "pointer", width: "100%", textAlign: "left", transition: "border-color 0.15s, color 0.15s" };

  function col(colId: string, colKey: string, titleText: string, titleColor: string): LabElement[] {
    return [
      el(`col-${colId}`,       "div",    "kb-board",           COL,                                          "", { class: "kb-col", "data-col": colKey }),
      el(`col-${colId}-hdr`,   "div",    `col-${colId}`,       COL_HDR),
      el(`col-${colId}-title`, "h3",     `col-${colId}-hdr`,   { ...COL_TITLE, color: titleColor },          titleText),
      el(`col-${colId}-badge`, "span",   `col-${colId}-hdr`,   BADGE,                                        "0",  { class: "kb-badge" }),
      el(`col-${colId}-list`,  "div",    `col-${colId}`,       LIST,                                         "",   { class: "kb-list", "data-col": colKey }),
      el(`col-${colId}-add`,   "button", `col-${colId}`,       ADD_BTN,                                      "+ Add a card", { class: "kb-add", "data-col": colKey }),
    ];
  }

  const elements: LabElement[] = [
    el("kb-header", "div", null, { padding: "14px 24px", background: "#0f172a", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "16px" }),
    el("kb-title",  "h1",  "kb-header", { color: "#f8fafc", fontSize: "17px", fontWeight: "700", margin: "0", flex: "1" }, "📋 Project Board"),
    el("kb-board",  "div", null, { display: "flex", gap: "14px", padding: "18px 24px", background: "#0f172a", overflowX: "auto", flex: "1", alignItems: "flex-start" }, "", { class: "kb-board" }),
    ...col("todo",  "todo",  "To Do",       "#f8fafc"),
    ...col("doing", "doing", "In Progress", "#fbbf24"),
    ...col("done",  "done",  "Done",        "#34d399"),
  ];

  const bodyStyles: BodyStyles = {
    background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif",
    margin: "0", padding: "0", display: "flex", flexDirection: "column", height: "100vh",
  };

  const javascript = `(function() {
  var TAGS = {
    high:    { label: 'High',    color: '#ef4444' },
    medium:  { label: 'Medium',  color: '#f59e0b' },
    low:     { label: 'Low',     color: '#22d3ee' },
    feature: { label: 'Feature', color: '#a78bfa' },
    bug:     { label: 'Bug',     color: '#f87171' },
  };
  var TAG_KEYS = Object.keys(TAGS);

  var SEED = [
    { col: 'todo',  text: 'Design new landing page',       tag: 'feature' },
    { col: 'todo',  text: 'Write unit tests for auth',      tag: 'high'    },
    { col: 'todo',  text: 'Update API documentation',       tag: 'low'     },
    { col: 'doing', text: 'Implement drag-and-drop',        tag: 'feature' },
    { col: 'doing', text: 'Fix mobile navigation bug',      tag: 'bug'     },
    { col: 'done',  text: 'Set up CI/CD pipeline',          tag: 'feature' },
    { col: 'done',  text: 'Code review: user auth PR',      tag: 'medium'  },
    { col: 'done',  text: 'Deploy v2.1.0 to staging',       tag: 'high'    },
  ];

  var dragCard = null;

  function makeCard(text, tagKey) {
    var t = TAGS[tagKey] || TAGS.low;
    var card = document.createElement('div');
    card.className = 'kb-card';
    card.draggable = true;
    card.style.cssText = 'background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px 12px;cursor:grab;display:flex;flex-direction:column;gap:6px;transition:box-shadow .15s,opacity .15s;';
    card.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">' +
        '<span style="color:#e2e8f0;font-size:13px;line-height:1.4;">' + text + '</span>' +
        '<button class="kb-del" style="background:none;border:none;color:#475569;cursor:pointer;font-size:13px;line-height:1;padding:0;flex-shrink:0;" title="Delete">✕</button>' +
      '</div>' +
      '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;color:' + t.color + ';border:1px solid ' + t.color + '44;display:inline-block;width:fit-content;">' + t.label + '</span>';
    card.querySelector('.kb-del').addEventListener('click', function(e) { e.stopPropagation(); card.remove(); updateCounts(); });
    card.addEventListener('dragstart', function() { dragCard = card; setTimeout(function() { card.style.opacity = '0.4'; }, 0); });
    card.addEventListener('dragend',   function() { card.style.opacity = ''; dragCard = null; document.querySelectorAll('.kb-list').forEach(function(l) { l.style.background = ''; }); updateCounts(); });
    card.addEventListener('mouseenter', function() { card.style.boxShadow = '0 4px 12px rgba(0,0,0,.5)'; });
    card.addEventListener('mouseleave', function() { card.style.boxShadow = ''; });
    return card;
  }

  function getDragAfter(list, y) {
    var cards = Array.from(list.querySelectorAll('.kb-card')).filter(function(c) { return parseFloat(c.style.opacity) !== 0.4; });
    return cards.reduce(function(closest, el) {
      var box = el.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset: offset, el: el } : closest;
    }, { offset: -Infinity, el: null }).el;
  }

  function updateCounts() {
    document.querySelectorAll('.kb-col').forEach(function(col) {
      var badge = col.querySelector('.kb-badge');
      var count = col.querySelector('.kb-list').querySelectorAll('.kb-card').length;
      if (badge) badge.textContent = count;
    });
  }

  document.querySelectorAll('.kb-list').forEach(function(list) {
    list.addEventListener('dragover',  function(e) { e.preventDefault(); if (!dragCard) return; list.style.background = 'rgba(59,130,246,.1)'; var after = getDragAfter(list, e.clientY); if (!after) list.appendChild(dragCard); else list.insertBefore(dragCard, after); });
    list.addEventListener('dragleave', function() { list.style.background = ''; });
    list.addEventListener('drop',      function(e) { e.preventDefault(); list.style.background = ''; updateCounts(); });
  });

  document.querySelectorAll('.kb-add').forEach(function(btn) {
    var colKey = btn.dataset.col;
    var form = document.createElement('div');
    form.style.cssText = 'display:none;flex-direction:column;gap:6px;';
    var textarea = document.createElement('textarea');
    textarea.placeholder = 'Card title…';
    textarea.rows = 2;
    textarea.style.cssText = 'background:#0f172a;border:1px solid #3b82f6;border-radius:6px;color:#e2e8f0;font-size:13px;padding:8px;resize:none;font-family:inherit;outline:none;width:100%;box-sizing:border-box;';
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;';
    var addBtn = document.createElement('button');
    addBtn.textContent = 'Add card';
    addBtn.style.cssText = 'background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;';
    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    cancelBtn.style.cssText = 'background:#334155;color:#94a3b8;border:none;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;';
    row.appendChild(addBtn); row.appendChild(cancelBtn); form.appendChild(textarea); form.appendChild(row);
    btn.parentNode.insertBefore(form, btn);
    function openForm()  { form.style.display = 'flex'; btn.style.display = 'none'; textarea.focus(); }
    function closeForm() { form.style.display = 'none'; btn.style.display = ''; textarea.value = ''; }
    btn.addEventListener('click', openForm);
    cancelBtn.addEventListener('click', closeForm);
    function submitCard() {
      var text = textarea.value.trim(); if (!text) return;
      var list = document.querySelector('.kb-list[data-col="' + colKey + '"]');
      var tagKey = TAG_KEYS[Math.floor(Math.random() * TAG_KEYS.length)];
      list.appendChild(makeCard(text, tagKey)); updateCounts(); textarea.value = ''; textarea.focus();
    }
    addBtn.addEventListener('click', submitCard);
    textarea.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitCard(); } if (e.key === 'Escape') closeForm(); });
  });

  SEED.forEach(function(s) {
    var list = document.querySelector('.kb-list[data-col="' + s.col + '"]');
    if (list) list.appendChild(makeCard(s.text, s.tag));
  });
  updateCounts();
})();`;

  return { elements, bodyStyles, javascript };
}

// ── Solar System (Three.js) ────────────────────────────────────────────────────
function generateThreeJsExample(): SinglePageData {
  const elements: LabElement[] = [
    el("three-wrap",  "div", null,         { position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#000010" }, "", { class: "threejs-container" }),
    el("three-hud",   "div", "three-wrap", { position: "absolute", top: "20px", left: "24px", zIndex: "10", pointerEvents: "none" }),
    el("three-title", "h1",  "three-hud",  { color: "#fff", fontSize: "20px", fontWeight: "700", margin: "0", textShadow: "0 2px 12px rgba(0,0,0,.9)" }, "Solar System"),
    el("three-hint",  "p",   "three-hud",  { color: "#94a3b8", fontSize: "12px", margin: "4px 0 0" }, "Drag to rotate · Scroll to zoom · Click to speed up"),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", background: "#000010", overflow: "hidden", fontFamily: "system-ui, sans-serif",
  };

  const javascript = `(function() {
  if (typeof THREE === 'undefined') {
    var c = document.querySelector('.threejs-container');
    if (c) c.innerHTML = '<div style="color:#f87171;padding:60px;text-align:center;font-size:15px;">Three.js not loaded — enable it in the Libraries panel first, then hit Preview.</div>';
    return;
  }
  var container = document.querySelector('.threejs-container');
  var W = window.innerWidth, H = window.innerHeight;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 2000);
  camera.position.set(0, 28, 60); camera.lookAt(0, 0, 0);
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:block;';
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0x0a0a22, 3));
  var sunLight = new THREE.PointLight(0xfff0cc, 8, 300); scene.add(sunLight);
  var sun = new THREE.Mesh(new THREE.SphereGeometry(5, 48, 48), new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xff8800, emissiveIntensity: 1.6, roughness: 0.3 }));
  scene.add(sun);
  sun.add(new THREE.Mesh(new THREE.SphereGeometry(5.8, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.07, side: THREE.BackSide })));
  var PDEFS = [
    { r: 1.1, d: 11,  speed: 1.3,  color: 0x6699ff, emissive: 0x001133, rings: false, moons: 0 },
    { r: 1.7, d: 18,  speed: 0.75, color: 0xff7755, emissive: 0x220800, rings: false, moons: 0 },
    { r: 1.4, d: 26,  speed: 0.48, color: 0x44ee88, emissive: 0x002211, rings: false, moons: 1 },
    { r: 2.3, d: 37,  speed: 0.28, color: 0xddaa66, emissive: 0x1a0800, rings: true,  moons: 0 },
  ];
  var planets = PDEFS.map(function(def) {
    var pts = []; for (var j = 0; j <= 128; j++) { var a = (j/128)*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*def.d,0,Math.sin(a)*def.d)); }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.45 })));
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(def.r,32,32), new THREE.MeshStandardMaterial({ color: def.color, emissive: def.emissive, roughness: 0.65, metalness: 0.1 }));
    mesh.castShadow = true; scene.add(mesh);
    if (def.rings) { var rm = new THREE.Mesh(new THREE.RingGeometry(def.r*1.5, def.r*2.5, 64), new THREE.MeshBasicMaterial({ color: 0xbbaa88, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })); rm.rotation.x = Math.PI/2.8; mesh.add(rm); }
    var moon = null;
    if (def.moons > 0) { moon = new THREE.Mesh(new THREE.SphereGeometry(0.38,16,16), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 })); scene.add(moon); }
    return { mesh, moon, d: def.d, speed: def.speed, angle: Math.random()*Math.PI*2 };
  });
  var starPos = new Float32Array(9000);
  for (var i = 0; i < 9000; i += 3) { var phi = Math.acos(2*Math.random()-1); var theta = 2*Math.PI*Math.random(); var rad = 300+Math.random()*500; starPos[i]=rad*Math.sin(phi)*Math.cos(theta); starPos[i+1]=rad*Math.sin(phi)*Math.sin(theta); starPos[i+2]=rad*Math.cos(phi); }
  var starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true })));
  var camAngle = 0.3, camTilt = 0.45, camRadius = 65, orbitSpeed = 1.0, dragging = false, px = 0, py = 0;
  renderer.domElement.addEventListener('mousedown', function(e) { dragging = true; px = e.clientX; py = e.clientY; });
  window.addEventListener('mouseup', function() { dragging = false; });
  window.addEventListener('mousemove', function(e) { if (!dragging) return; camAngle -= (e.clientX-px)*0.006; camTilt = Math.max(0.05, Math.min(1.3, camTilt+(e.clientY-py)*0.006)); px = e.clientX; py = e.clientY; });
  renderer.domElement.addEventListener('wheel', function(e) { camRadius = Math.max(18, Math.min(130, camRadius+e.deltaY*0.06)); e.preventDefault(); }, { passive: false });
  renderer.domElement.addEventListener('click', function() { orbitSpeed = orbitSpeed > 1.5 ? 0.4 : orbitSpeed < 0.6 ? 1.0 : 3.5; });
  window.addEventListener('resize', function() { var w = window.innerWidth, h = window.innerHeight; camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); });
  var t = 0;
  function animate() {
    requestAnimationFrame(animate); t += 0.008*orbitSpeed;
    sun.material.emissiveIntensity = 1.4+Math.sin(t*3.5)*0.25; sun.rotation.y = t*0.25;
    planets.forEach(function(p) { p.angle += p.speed*0.005*orbitSpeed; p.mesh.position.set(Math.cos(p.angle)*p.d, Math.sin(p.angle*0.3)*1.2, Math.sin(p.angle)*p.d); p.mesh.rotation.y += 0.02*orbitSpeed; if (p.moon) { var ma=t*2.8; p.moon.position.set(p.mesh.position.x+Math.cos(ma)*2.8, p.mesh.position.y+0.4, p.mesh.position.z+Math.sin(ma)*2.8); } });
    if (!dragging) camAngle += 0.0025*orbitSpeed;
    camera.position.set(Math.sin(camAngle)*Math.cos(camTilt)*camRadius, Math.sin(camTilt)*camRadius, Math.cos(camAngle)*Math.cos(camTilt)*camRadius);
    camera.lookAt(0,0,0); renderer.render(scene,camera);
  }
  animate();
})();`;

  return { elements, bodyStyles, javascript, cdnLinks: ["threejs"] };
}

// ── Tetris (React, multi-file JSX) ──────────────────────────────────────────
// Deliberately split across 4 files by responsibility — this is the example
// meant to demonstrate (and exercise) multi-file JSX in HTML Lab. Files
// share one global scope (no `import`/`export` — see jsxTranspile.ts), so
// load order in `jsFiles` below IS dependency order: constants, then the
// pure rules that use them, then the component that uses the rules, then
// the entry point that mounts the component.
function generateTetrisExample(): SinglePageData {
  const constantsJs = `// ── constants.jsx ────────────────────────────────────────────────────────
// Pure data: board dimensions and the seven standard tetromino shapes. No
// React, no logic — just the numbers everything else in this game agrees on.

const BOARD_COLS = 10;
const BOARD_ROWS = 20;
const TICK_MS = 500; // base speed at level 1 — see board.jsx's speedForLevel()
const LINES_PER_LEVEL = 10; // clear this many lines to advance a level

// Each shape is defined in its "spawn" rotation as a 2D matrix of 0s/1s.
// board.jsx's rotateMatrix() derives every other rotation from this one —
// no need to hand-author 4 rotation states per piece.
const TETROMINOES = {
  I: { color: '#22d3ee', shape: [[1, 1, 1, 1]] },
  O: { color: '#facc15', shape: [[1, 1], [1, 1]] },
  T: { color: '#c084fc', shape: [[0, 1, 0], [1, 1, 1]] },
  S: { color: '#4ade80', shape: [[0, 1, 1], [1, 1, 0]] },
  Z: { color: '#f87171', shape: [[1, 1, 0], [0, 1, 1]] },
  J: { color: '#60a5fa', shape: [[1, 0, 0], [1, 1, 1]] },
  L: { color: '#fb923c', shape: [[0, 0, 1], [1, 1, 1]] },
};
const PIECE_KEYS = Object.keys(TETROMINOES);`;

  const boardJs = `// ── board.jsx ────────────────────────────────────────────────────────────
// Pure game rules: every function here operates only on plain arrays and
// numbers, with no React and no rendering — Game.jsx is the only file that
// touches component state. Keeping this pure means each rule is trivially
// testable and readable on its own, with no hooks or DOM in the way.

function createEmptyBoard() {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
}

function randomPieceKey() {
  return PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
}

function spawnPiece(key) {
  const def = TETROMINOES[key];
  return {
    key,
    color: def.color,
    shape: def.shape,
    row: 0,
    col: Math.floor((BOARD_COLS - def.shape[0].length) / 2),
  };
}

// Rotates a shape matrix 90° clockwise: transpose, then reverse each row.
// One general-purpose function instead of 4 hardcoded rotation states per piece.
function rotateMatrix(shape) {
  const rows = shape.length, cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
}

// A position is only legal if every filled cell of the piece lands inside
// the board's left/right/bottom walls and on top of an empty cell. Cells
// above the visible board (row < 0) are allowed through — that's how a
// piece is permitted to spawn partly off the top.
function isValidPosition(board, shape, row, col) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const boardRow = row + r, boardCol = col + c;
      if (boardCol < 0 || boardCol >= BOARD_COLS || boardRow >= BOARD_ROWS) return false;
      if (boardRow >= 0 && board[boardRow][boardCol]) return false;
    }
  }
  return true;
}

// Copies the piece's cells permanently into the board — called the moment a
// piece can no longer move down.
function mergePieceIntoBoard(board, piece) {
  const next = board.map((row) => row.slice());
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const boardRow = piece.row + r, boardCol = piece.col + c;
      if (boardRow >= 0) next[boardRow][boardCol] = piece.color;
    }
  }
  return next;
}

// Removes every fully-filled row and drops everything above down to fill
// the gap, reporting how many rows were cleared (for scoring).
function clearCompletedLines(board) {
  const remaining = board.filter((row) => row.some((cell) => !cell));
  const clearedCount = BOARD_ROWS - remaining.length;
  const empties = Array.from({ length: clearedCount }, () => Array(BOARD_COLS).fill(null));
  return { board: [...empties, ...remaining], clearedCount };
}

// Classic Tetris scoring — a 4-line "Tetris" is worth far more per line than
// clearing one row at a time, which is what rewards playing well.
function scoreForLines(count) {
  return [0, 100, 300, 500, 800][count] || 0;
}

// Every level shaves time off the drop timer, floored so the game never
// becomes literally unplayable at high levels.
function speedForLevel(level) {
  return Math.max(100, TICK_MS - (level - 1) * 40);
}`;

  const gameJsx = `// ── Game.jsx ─────────────────────────────────────────────────────────────
// The only file that owns React state or touches the DOM's input events —
// board.jsx supplies the pure rules, this file supplies the clock (the drop
// timer), the player's keyboard input, and the rendering. Composing it this
// way means the rules in board.jsx could power a totally different renderer
// (canvas, terminal, ...) without changing a single line of game logic.

// A small 4x4 preview of an upcoming piece, centered in its box. Purely
// presentational — it re-reads TETROMINOES directly rather than taking a
// pre-rendered board, since "what does piece X look like" is display
// concern, not game-rules concern.
function NextPiecePreview({ pieceKey }) {
  const { shape, color } = TETROMINOES[pieceKey];
  const boxSize = 4;
  const rowOffset = Math.floor((boxSize - shape.length) / 2);
  const colOffset = Math.floor((boxSize - shape[0].length) / 2);
  const cells = [];
  for (let r = 0; r < boxSize; r++) {
    for (let c = 0; c < boxSize; c++) {
      const shapeR = r - rowOffset;
      const shapeC = c - colOffset;
      const filled = shapeR >= 0 && shapeR < shape.length && shapeC >= 0 && shapeC < shape[0].length && shape[shapeR][shapeC];
      cells.push(
        <div key={\`\${r}-\${c}\`} style={{ width: '16px', height: '16px', background: filled ? color : 'transparent' }} />
      );
    }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 16px)', gridTemplateRows: 'repeat(4, 16px)', gap: '1px' }}>
      {cells}
    </div>
  );
}

function Game() {
  const [board, setBoard] = React.useState(createEmptyBoard);
  const [piece, setPiece] = React.useState(() => spawnPiece(randomPieceKey()));
  const [nextKey, setNextKey] = React.useState(randomPieceKey);
  const [score, setScore] = React.useState(0);
  const [lines, setLines] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [gameOver, setGameOver] = React.useState(false);

  // Locks a piece into \`board\`, clears completed lines, scores them (worth
  // more per line at higher levels), advances the level, and draws the next
  // piece from the queue — ending the game if the new piece has nowhere
  // legal to spawn. Shared by both the natural drop timer and a hard drop,
  // so "what happens when a piece can no longer fall" only lives in one place.
  const lockPiece = React.useCallback((current) => {
    const merged = mergePieceIntoBoard(board, current);
    const { board: cleared, clearedCount } = clearCompletedLines(merged);
    setBoard(cleared);
    if (clearedCount > 0) {
      setScore((s) => s + scoreForLines(clearedCount) * level);
      setLines((prevLines) => {
        const total = prevLines + clearedCount;
        setLevel(1 + Math.floor(total / LINES_PER_LEVEL));
        return total;
      });
    }

    const spawned = spawnPiece(nextKey);
    setNextKey(randomPieceKey());
    if (!isValidPosition(cleared, spawned.shape, spawned.row, spawned.col)) {
      setGameOver(true);
      return null;
    }
    return spawned;
  }, [board, nextKey, level]);

  // Moves the active piece down one row if legal, otherwise hands off to lockPiece.
  const drop = React.useCallback(() => {
    setPiece((prev) => {
      if (!prev) return prev;
      if (isValidPosition(board, prev.shape, prev.row + 1, prev.col)) {
        return { ...prev, row: prev.row + 1 };
      }
      return lockPiece(prev);
    });
  }, [board, lockPiece]);

  // Instantly moves the piece to its landing row and locks it — the
  // impatient player's shortcut, triggered by Space.
  const hardDrop = React.useCallback(() => {
    setPiece((prev) => {
      if (!prev) return prev;
      let landingRow = prev.row;
      while (isValidPosition(board, prev.shape, landingRow + 1, prev.col)) {
        landingRow++;
      }
      return lockPiece({ ...prev, row: landingRow });
    });
  }, [board, lockPiece]);

  // The drop timer — stops entirely once the game ends, and speeds up as
  // \`level\` climbs (speedForLevel lives in board.jsx alongside the other rules).
  React.useEffect(() => {
    if (gameOver) return;
    const id = setInterval(drop, speedForLevel(level));
    return () => clearInterval(id);
  }, [drop, gameOver, level]);

  // Keyboard controls: left/right to move, up to rotate, down for a soft
  // drop, space for an instant hard drop.
  React.useEffect(() => {
    if (gameOver) return;
    function onKeyDown(e) {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        hardDrop();
        return;
      }
      setPiece((prev) => {
        if (!prev) return prev;
        if (e.key === 'ArrowLeft' && isValidPosition(board, prev.shape, prev.row, prev.col - 1)) {
          return { ...prev, col: prev.col - 1 };
        }
        if (e.key === 'ArrowRight' && isValidPosition(board, prev.shape, prev.row, prev.col + 1)) {
          return { ...prev, col: prev.col + 1 };
        }
        if (e.key === 'ArrowDown' && isValidPosition(board, prev.shape, prev.row + 1, prev.col)) {
          return { ...prev, row: prev.row + 1 };
        }
        if (e.key === 'ArrowUp') {
          const rotated = rotateMatrix(prev.shape);
          if (isValidPosition(board, rotated, prev.row, prev.col)) {
            return { ...prev, shape: rotated };
          }
        }
        return prev;
      });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [board, gameOver, hardDrop]);

  function restart() {
    setBoard(createEmptyBoard());
    setPiece(spawnPiece(randomPieceKey()));
    setNextKey(randomPieceKey());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
  }

  // The falling piece is overlaid on the locked board purely for rendering —
  // it never actually lives inside \`board\` until the moment it locks.
  const displayBoard = board.map((row) => row.slice());
  if (piece) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const boardRow = piece.row + r, boardCol = piece.col + c;
        if (boardRow >= 0 && boardRow < BOARD_ROWS) displayBoard[boardRow][boardCol] = piece.color;
      }
    }
  }

  const statBlock = (label, value) => (
    <div>
      <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '32px', fontFamily: 'system-ui, sans-serif', color: '#f8fafc' }}>
      <h1 style={{ margin: 0, fontSize: '26px' }}>Tetris</h1>
      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: \`repeat(\${BOARD_COLS}, 24px)\`,
          gridTemplateRows: \`repeat(\${BOARD_ROWS}, 24px)\`,
          gap: '1px',
          background: '#1e293b',
          border: '2px solid #334155',
        }}>
          {displayBoard.map((row, r) =>
            row.map((cell, c) => (
              <div key={\`\${r}-\${c}\`} style={{ width: '24px', height: '24px', background: cell || '#0f172a' }} />
            ))
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '90px' }}>
          {statBlock('SCORE', score)}
          {statBlock('LEVEL', level)}
          {statBlock('LINES', lines)}
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '6px' }}>NEXT</div>
            <NextPiecePreview pieceKey={nextKey} />
          </div>
        </div>
      </div>
      {gameOver ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f87171', fontWeight: 'bold', fontSize: '17px', margin: '0 0 8px' }}>Game Over</p>
          <button
            onClick={restart}
            style={{ padding: '8px 20px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            Play Again
          </button>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>← → move · ↑ rotate · ↓ soft drop · space hard drop</p>
      )}
    </div>
  );
}`;

  const appJsx = `// ── App.jsx ──────────────────────────────────────────────────────────────
// The entry point — the only file that knows a DOM/browser is involved at
// all. Everything above it (constants, board, Game) has no idea, which is
// exactly what makes each of them easy to read and reason about on its own.

ReactDOM.createRoot(document.getElementById('tetris-root')).render(<Game />);`;

  const jsFiles: JsFile[] = [
    { id: "tetris-constants", name: "constants.jsx", code: constantsJs },
    { id: "tetris-board",     name: "board.jsx",     code: boardJs },
    { id: "tetris-game",      name: "Game.jsx",       code: gameJsx },
    { id: "tetris-app",       name: "App.jsx",        code: appJsx },
  ];

  const elements: LabElement[] = [
    el("tetris-root", "div", null, {
      display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center",
      textAlign: "center", fontFamily: "system-ui, sans-serif", fontSize: "16px", color: "#94a3b8",
    }, "This canvas is static — press ▶ Preview above to run the React game.", { id: "tetris-root" }),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", background: "#0f172a", color: "#f8fafc",
    fontFamily: "system-ui, sans-serif", minHeight: "100vh",
  };

  return { elements, bodyStyles, jsFiles, customCss: "" };
}

// ── Gallery export ─────────────────────────────────────────────────────────────
export const EXAMPLES: Example[] = [
  {
    id: "multipage",
    name: "Portfolio Site",
    description: "3-page site (Home · About · Work) with linked navigation — export to see links work",
    icon: "🔗",
    generate: generateMultiPageExample as () => ExampleData,
    badge: "Multi-page",
  },
  {
    id: "showcase",
    name: "Interactive Showcase",
    description: "Counters, tabs, modals and more — all wired with JavaScript",
    icon: "⚡",
    generate: generateExampleProject as () => ExampleData,
  },
  {
    id: "api-dashboard",
    name: "Live API Dashboard",
    description: "Fetches real user data from a public API and renders it dynamically",
    icon: "🌐",
    generate: generateApiExample as () => ExampleData,
  },
  {
    id: "kanban",
    name: "Kanban Board",
    description: "Drag-and-drop task board — add cards, move them between columns",
    icon: "📋",
    generate: generateKanbanExample as () => ExampleData,
  },
  {
    id: "threejs",
    name: "Solar System",
    description: "Interactive 3D scene with orbiting planets, drag to rotate, scroll to zoom",
    icon: "🪐",
    generate: generateThreeJsExample as () => ExampleData,
    requiresCdn: ["threejs"],
  },
  {
    id: "tetris",
    name: "Tetris (React)",
    description: "A real Tetris game built with React across 4 files — constants, board logic, component, entry point",
    icon: "🎮",
    generate: generateTetrisExample as () => ExampleData,
    badge: "React",
  },
];
