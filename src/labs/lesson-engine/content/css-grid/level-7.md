---
series: css-grid
level: 7
title: Grid and Flexbox Together
lang: css
---

# Grid and Flexbox Together

Grid and Flexbox are not competitors — they are complementary tools that work best at different scales of a layout. The professional approach: use Grid for macro page structure, use Flexbox for the micro layout inside each component. Combine them freely.

## The layered model

Outer layer (Grid): page regions — header, sidebar, main, footer. Inner layer (Flexbox): how content inside each region is arranged — nav links in a row, card body as a column, button group at the end.

```html
<div class="app">
  <header class="app-header">
    <div class="brand">⚡ UpskillOS</div>
    <nav class="header-nav">
      <a href="#">Courses</a>
      <a href="#">Labs</a>
      <a href="#">Pro</a>
    </nav>
    <div class="header-actions">
      <button class="btn-ghost">Log in</button>
      <button class="btn-fill">Sign Up</button>
    </div>
  </header>
  <aside class="app-sidebar">
    <div class="sidebar-item active">📊 Dashboard</div>
    <div class="sidebar-item">📚 My Courses</div>
    <div class="sidebar-item">🧪 Labs</div>
    <div class="sidebar-item">⚙️ Settings</div>
  </aside>
  <main class="app-main">
    <h1>Dashboard</h1>
    <div class="card-row">
      <div class="stat-card"><div class="stat-icon">📚</div><div class="stat-info"><span class="stat-val">12</span><span class="stat-key">Courses</span></div></div>
      <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-info"><span class="stat-val">847</span><span class="stat-key">XP</span></div></div>
      <div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-info"><span class="stat-val">7</span><span class="stat-key">Streak</span></div></div>
    </div>
  </main>
  <footer class="app-footer">© 2026 UpskillOS</footer>
</div>
```

```css
body { background: #0f172a; margin: 0; padding: 20px; font-family: system-ui; }

/* Grid: outer page structure */
.app {
  display: grid;
  grid-template-columns: 180px 1fr;
  grid-template-rows: 52px 1fr 36px;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 2px;
  min-height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
}
.app-header  { grid-area: header; }
.app-sidebar { grid-area: sidebar; }
.app-main    { grid-area: main; }
.app-footer  { grid-area: footer; }

/* Flexbox: inside each grid region */
.app-header { background: #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; gap: 16px; }
.brand { color: #818cf8; font-weight: 800; flex-shrink: 0; }
.header-nav { display: flex; gap: 20px; }
.header-nav a { color: #94a3b8; text-decoration: none; font-size: 14px; }
.header-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-fill  { background: #6366f1; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
.app-sidebar { background: #0f172a; display: flex; flex-direction: column; gap: 2px; padding: 12px 8px; }
.sidebar-item { color: #64748b; padding: 8px 10px; border-radius: 6px; font-size: 13px; cursor: pointer; }
.sidebar-item.active { background: #1e293b; color: #818cf8; }
.app-main { background: #1e293b; padding: 20px; }
.app-main h1 { color: #e2e8f0; margin: 0 0 16px; font-size: 1.1rem; }
.card-row { display: flex; gap: 10px; }
.stat-card { flex: 1; background: #0f172a; padding: 14px; border-radius: 8px; display: flex; align-items: center; gap: 12px; }
.stat-icon { font-size: 1.5rem; }
.stat-info { display: flex; flex-direction: column; }
.stat-val { color: #818cf8; font-size: 1.25rem; font-weight: 800; line-height: 1; }
.stat-key { color: #64748b; font-size: 12px; }
.app-footer { background: #0f172a; display: flex; align-items: center; padding: 0 20px; color: #475569; font-size: 12px; }
```

## When to use each — the decision

A practical guide for making the choice:

```html
<div class="decision-table">
  <div class="row header-row">
    <div class="cell label-cell">Scenario</div>
    <div class="cell">Use</div>
    <div class="cell">Why</div>
  </div>
  <div class="row">
    <div class="cell label-cell">Page regions (header/sidebar/main)</div>
    <div class="cell use-grid">Grid</div>
    <div class="cell reason">Two-dimensional: rows AND columns</div>
  </div>
  <div class="row">
    <div class="cell label-cell">Navigation bar links</div>
    <div class="cell use-flex">Flex</div>
    <div class="cell reason">One-dimensional row, content-driven widths</div>
  </div>
  <div class="row">
    <div class="cell label-cell">Uniform card grid</div>
    <div class="cell use-grid">Grid</div>
    <div class="cell reason">Explicit equal columns; items must align</div>
  </div>
  <div class="row">
    <div class="cell label-cell">Tag cloud / chip list</div>
    <div class="cell use-flex">Flex</div>
    <div class="cell reason">Variable widths, wraps naturally</div>
  </div>
  <div class="row">
    <div class="cell label-cell">Card with footer pinned</div>
    <div class="cell use-flex">Flex</div>
    <div class="cell reason">Column direction, flex: 1 on body</div>
  </div>
  <div class="row">
    <div class="cell label-cell">Form label + input</div>
    <div class="cell use-grid">Grid</div>
    <div class="cell reason">Two-column alignment of pairs</div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.decision-table { background: #1e293b; border-radius: 10px; overflow: hidden; }
.row { display: grid; grid-template-columns: 2fr 1fr 2fr; border-bottom: 1px solid #334155; }
.row:last-child { border-bottom: none; }
.cell { padding: 12px 16px; font-size: 13px; color: #94a3b8; display: flex; align-items: center; }
.header-row .cell { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #0f172a; }
.label-cell { color: #e2e8f0; }
.use-grid { color: #818cf8; font-weight: 700; }
.use-flex { color: #6ee7b7; font-weight: 700; }
.reason { color: #64748b; font-size: 12px; }
```

**SE lens:** The Grid/Flexbox combination is the official recommendation in the CSS Working Group specs — they were designed to work together, not compete. A typical production component uses Grid at the page level, Grid inside some components (forms, tables), and Flexbox inside others (nav bars, cards, buttons).

**Common mistakes:**
- Picking one and never using the other — this leads to overcomplicated selectors to coerce Flexbox into doing two-dimensional layout, or verbose Grid declarations for simple one-dimensional flows.
- Nesting Grid inside Grid when Flexbox would be simpler — use the simplest tool that solves the problem.

**Debug tip:** In DevTools, Grid containers show a solid "grid" badge; Flex containers show a "flex" badge. When debugging a nested layout, click the badge on the outer container first, then work inward.

## Challenge: grid_and_flex

Build a page using both Grid (outer structure) and Flexbox (inner components).

1. `.layout` — `display: grid`, `grid-template-columns: 160px 1fr`, `grid-template-rows: 50px 1fr`
2. `.header` — `display: flex`, `justify-content: space-between`, `align-items: center`
3. `.content` — `display: flex`, `flex-direction: column`, `gap: 12px`

```html
<div class="layout" style="background:#0f172a;border-radius:10px;overflow:hidden;min-height:200px;gap:2px;">
  <div class="header" style="grid-column:1/-1;background:#1e293b;padding:0 16px;">
    <span style="color:#818cf8;font-family:system-ui;font-weight:700;">Brand</span>
    <button style="background:#6366f1;color:white;border:none;padding:6px 12px;border-radius:6px;font-family:system-ui;cursor:pointer;">Sign Up</button>
  </div>
  <div class="sidebar" style="background:#0f172a;border-right:1px solid #1e293b;padding:12px;color:#64748b;font-family:system-ui;font-size:13px;">Sidebar</div>
  <div class="content" style="background:#1e293b;padding:16px;">
    <div style="background:#334155;border-radius:6px;padding:12px;color:#e2e8f0;font-family:system-ui;font-size:13px;">Item 1</div>
    <div style="background:#334155;border-radius:6px;padding:12px;color:#e2e8f0;font-family:system-ui;font-size:13px;">Item 2</div>
  </div>
</div>
```

```challenge
.layout {

}

.header {

}

.content {

}
```

```test
var layout  = getComputedStyle(document.querySelector('.layout'))
var header  = getComputedStyle(document.querySelector('.header'))
var content = getComputedStyle(document.querySelector('.content'))
assert layout.display === 'grid'
var cols = layout.gridTemplateColumns.split(' ')
assert cols.length === 2
assert header.display === 'flex'
assert header.justifyContent === 'space-between'
assert header.alignItems === 'center'
assert content.display === 'flex'
assert content.flexDirection === 'column'
```
