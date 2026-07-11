---
series: css-flexbox
level: 8
title: Flexbox vs Grid — When to Use Which
lang: css
---

# Flexbox vs Grid — When to Use Which

Flexbox and CSS Grid both create layouts, but they solve different problems. Knowing when to reach for each one — and when to combine them — is a critical professional skill.

## The fundamental difference

Flexbox is **content-first**: the container adapts to its items. Grid is **layout-first**: you define the structure, then place items in it. Try resizing the items in each container and notice how differently they respond.

```html
<p class="lbl">Flexbox — items define the layout. Add more items and they flow naturally.</p>
<div class="flex-ex">
  <div class="chip">Python</div>
  <div class="chip">JavaScript</div>
  <div class="chip long">CSS Grid and Flexbox</div>
  <div class="chip">React</div>
  <div class="chip">TypeScript</div>
</div>

<p class="lbl">Grid — layout is predefined. Items fit into slots.</p>
<div class="grid-ex">
  <div class="cell">1</div>
  <div class="cell">2</div>
  <div class="cell">3</div>
  <div class="cell">4</div>
  <div class="cell">5</div>
  <div class="cell">6</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.flex-ex { display: flex; flex-wrap: wrap; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
.chip { background: #6366f1; color: white; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
.long { background: #059669; }
.grid-ex { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; }
.cell { background: #818cf8; color: white; padding: 16px; border-radius: 6px; text-align: center; font-weight: 700; }
```

**Use flexbox when:** items flow naturally and you want the content to drive the sizing — navigation links, tag clouds, button groups, toolbars, centring a single element.

**Use grid when:** you have a defined structure — a page layout, a card grid with explicit columns, a form with aligned labels and inputs.

## Flexbox excels — the tag cloud

Items with variable widths that wrap naturally. No fixed column count. Content drives layout.

```html
<div class="tag-cloud">
  <span class="tag">Python</span>
  <span class="tag">Machine Learning</span>
  <span class="tag">CSS</span>
  <span class="tag">TypeScript</span>
  <span class="tag">React</span>
  <span class="tag">REST APIs</span>
  <span class="tag">Data Structures</span>
  <span class="tag">SQL</span>
  <span class="tag">Docker</span>
  <span class="tag">Git</span>
  <span class="tag">System Design</span>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
}
.tag:hover { background: #6366f1; color: white; border-color: #6366f1; }
```

Grid would require you to define column widths. Flexbox just flows — ideal.

## Grid excels — the strict column layout

An explicit 3-column grid where every card must align regardless of content length. Flexbox cards in rows can have different widths; grid cards are always the same.

```html
<div class="course-grid">
  <article class="course-card">
    <div class="emoji">🐍</div>
    <h3>Python Fundamentals</h3>
    <p>Learn Python from first principles.</p>
  </article>
  <article class="course-card">
    <div class="emoji">⚡</div>
    <h3>JavaScript</h3>
    <p>Master closures, async/await, and the event loop. A thorough modern JavaScript curriculum.</p>
  </article>
  <article class="course-card">
    <div class="emoji">🎨</div>
    <h3>CSS Mastery</h3>
    <p>Flexbox, Grid, animations.</p>
  </article>
  <article class="course-card">
    <div class="emoji">🗄️</div>
    <h3>SQL Fundamentals</h3>
    <p>Databases, queries, and joins.</p>
  </article>
  <article class="course-card">
    <div class="emoji">⚛️</div>
    <h3>React</h3>
    <p>Components, hooks, and state management.</p>
  </article>
  <article class="course-card">
    <div class="emoji">🔷</div>
    <h3>TypeScript</h3>
    <p>Type safety for large JavaScript codebases.</p>
  </article>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.course-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.course-card { background: #1e293b; padding: 20px; border-radius: 10px; display: flex; flex-direction: column; }
.emoji { font-size: 2rem; margin-bottom: 12px; }
.course-card h3 { color: #e2e8f0; margin: 0 0 8px; font-size: 1rem; }
.course-card p  { color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0; flex: 1; }
```

**CS lens:** You can combine both: use Grid for the outer layout (column definitions), use Flexbox inside each card (column direction, push button to bottom). This combination appears in virtually every real-world component library.

## Combining both — the real pattern

A Grid macro layout for the page structure, Flexbox micro layout for each component within the grid.

```html
<div class="page-layout">
  <header class="header">
    <div class="header-brand">⚡ UpskillOS</div>
    <nav class="header-nav">
      <a href="#">Courses</a><a href="#">Labs</a><a href="#">Pro</a>
    </nav>
    <button class="header-cta">Sign Up</button>
  </header>
  <aside class="sidebar">
    <p class="cat-label">Categories</p>
    <a class="cat" href="#">CSS</a>
    <a class="cat" href="#">JavaScript</a>
    <a class="cat" href="#">Python</a>
  </aside>
  <main class="main">
    <h1>Welcome back</h1>
    <p>Your courses are below. Grid handles the page; Flexbox handles each row inside.</p>
    <div class="course-row">
      <div class="mini-card">Python Fundamentals</div>
      <div class="mini-card">CSS Flexbox</div>
      <div class="mini-card">SQL Basics</div>
    </div>
  </main>
  <footer class="footer">Footer — full width via grid-column: 1 / -1</footer>
</div>
```

```css
body { background: #0f172a; margin: 0; padding: 24px; font-family: system-ui; }
/* Grid: outer page structure */
.page-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: "header header" "sidebar main" "footer footer";
  gap: 2px;
  min-height: 320px;
  border-radius: 12px;
  overflow: hidden;
}
.header  { grid-area: header; display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 12px 20px; gap: 16px; }
.sidebar { grid-area: sidebar; background: #0f172a; padding: 16px 12px; display: flex; flex-direction: column; gap: 6px; }
.main    { grid-area: main; background: #1e293b; padding: 20px; }
.footer  { grid-area: footer; background: #0f172a; padding: 10px 20px; }
/* Flex: component-level layout */
.header-brand { color: #818cf8; font-weight: 800; flex-shrink: 0; }
.header-nav   { display: flex; gap: 16px; }
.header-nav a { color: #94a3b8; text-decoration: none; font-size: 14px; }
.header-cta   { background: #6366f1; color: white; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; flex-shrink: 0; }
.cat-label { color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 4px; }
.cat { color: #94a3b8; text-decoration: none; font-size: 14px; padding: 6px 8px; border-radius: 6px; }
.main h1 { color: #e2e8f0; margin: 0 0 8px; font-size: 1.1rem; }
.main p  { color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 16px; }
.course-row { display: flex; gap: 10px; }
.mini-card  { flex: 1; background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center; }
.footer { color: #475569; font-size: 12px; display: flex; align-items: center; }
```

**SE lens:** The rule of thumb in professional teams: Grid for page layout (two-dimensional), Flexbox for components (one-dimensional). When in doubt, start with Flexbox — switch to Grid when you need columns AND rows simultaneously.

**Common mistakes:**
- Using Flexbox for a grid of cards where you want strict equal column widths — Grid's `repeat(3, 1fr)` gives you that; `flex: 1 1 200px` does not.
- Using Grid for a horizontal nav bar — `display: flex; gap: 16px` is simpler and more appropriate.

**Debug tip:** If your layout fights you, ask: "Do I need control of rows AND columns?" If yes → Grid. If no → Flexbox.

## Challenge: flex_vs_grid

Build both: a flex tag row and a 3-column grid.

1. `.tags` — `display: flex`, `flex-wrap: wrap`, `gap: 8px`
2. `.grid` — `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: 12px`

```html
<div class="tags">
  <span class="tag">Python</span>
  <span class="tag">CSS</span>
  <span class="tag">JavaScript</span>
  <span class="tag">React</span>
</div>
<div class="grid" style="margin-top:16px;">
  <div class="cell">A</div>
  <div class="cell">B</div>
  <div class="cell">C</div>
</div>
```

```challenge
.tag  { background: #334155; color: #e2e8f0; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-family: system-ui; }
.cell { background: #6366f1; color: white; padding: 16px; border-radius: 6px; text-align: center; font-family: system-ui; font-weight: 700; }

.tags {

}

.grid {

}
```

```test
var tags = getComputedStyle(document.querySelector('.tags'))
var grid = getComputedStyle(document.querySelector('.grid'))
assert tags.display === 'flex'
assert tags.flexWrap === 'wrap'
assert tags.gap === '8px'
assert grid.display === 'grid'
assert grid.gridTemplateColumns.split(' ').length === 3
assert grid.gap === '12px' || grid.rowGap === '12px'
```
