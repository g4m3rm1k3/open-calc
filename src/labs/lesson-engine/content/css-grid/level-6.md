---
series: css-grid
level: 6
title: Real-World Grid Patterns
lang: css
---

# Real-World Grid Patterns

Grid properties combine to solve real layout challenges. This lesson shows four patterns you'll build repeatedly: the dashboard layout, the magazine article, the photo mosaic, and the responsive settings form.

## Pattern 1 — The dashboard layout

A header, sidebar, main area, and optional right panel. Named areas make the intent clear; a single grid change swaps layouts completely.

```html
<div class="dashboard">
  <header class="dash-header">
    <span class="brand">⚡ UpskillOS</span>
    <span class="user">Michael M.</span>
  </header>
  <nav class="dash-nav">
    <p class="nav-label">Menu</p>
    <a class="nav-link active" href="#">📊 Dashboard</a>
    <a class="nav-link" href="#">📚 Courses</a>
    <a class="nav-link" href="#">🧪 Labs</a>
    <a class="nav-link" href="#">⚙️ Settings</a>
  </nav>
  <main class="dash-main">
    <h1>Welcome back, Michael</h1>
    <div class="stat-row">
      <div class="stat">
        <span class="stat-num">12</span>
        <span class="stat-lbl">Courses</span>
      </div>
      <div class="stat">
        <span class="stat-num">847</span>
        <span class="stat-lbl">XP</span>
      </div>
      <div class="stat">
        <span class="stat-num">7</span>
        <span class="stat-lbl">Day Streak</span>
      </div>
    </div>
  </main>
  <aside class="dash-aside">
    <p class="aside-label">Today's Goal</p>
    <div class="goal-item">✓ Python Level 3</div>
    <div class="goal-item">◯ CSS Grid</div>
    <div class="goal-item">◯ JS Closures</div>
  </aside>
</div>
```

```css
body { background: #0f172a; margin: 0; padding: 24px; font-family: system-ui; }
.dashboard {
  display: grid;
  grid-template-columns: 180px 1fr 200px;
  grid-template-rows: 56px 1fr;
  grid-template-areas:
    "header header header"
    "nav    main   aside";
  gap: 2px;
  min-height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
}
.dash-header { grid-area: header; background: #1e293b; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
.brand { color: #818cf8; font-weight: 800; }
.user  { color: #64748b; font-size: 14px; }
.dash-nav  { grid-area: nav; background: #0f172a; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-label { color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 6px; }
.nav-link  { color: #64748b; text-decoration: none; padding: 8px 10px; border-radius: 6px; font-size: 14px; }
.nav-link.active { background: #1e293b; color: #818cf8; }
.dash-main  { grid-area: main; background: #1e293b; padding: 24px; }
.dash-main h1 { color: #e2e8f0; margin: 0 0 20px; font-size: 1.1rem; }
.stat-row   { display: flex; gap: 12px; }
.stat       { background: #0f172a; flex: 1; padding: 16px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; }
.stat-num   { color: #818cf8; font-size: 1.5rem; font-weight: 800; }
.stat-lbl   { color: #64748b; font-size: 12px; margin-top: 4px; }
.dash-aside { grid-area: aside; background: #0f172a; padding: 16px; }
.aside-label { color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px; }
.goal-item  { color: #94a3b8; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #1e293b; }
```

## Pattern 2 — The magazine article layout

Feature image spanning two columns, pull quotes, and a multi-column body — classic editorial layout.

```html
<article class="magazine">
  <div class="mag-hero">Feature Image Area</div>
  <h1 class="mag-title">The Future of Web Layout</h1>
  <div class="mag-body">
    <p>CSS Grid has fundamentally changed how we build web layouts. For decades, developers relied on floats, table hacks, and absolute positioning to achieve designs that should have been simple.</p>
    <p>Today, with two lines of CSS, you can create responsive multi-column layouts that adapt to any screen size without a single media query.</p>
  </div>
  <blockquote class="mag-quote">"Grid makes the impossible trivially easy."</blockquote>
  <div class="mag-meta">
    <span class="author">By Michael McLean</span>
    <span class="date">July 2026</span>
    <span class="read-time">5 min read</span>
  </div>
</article>
```

```css
body { background: #0f172a; padding: 24px; font-family: Georgia, serif; }
.magazine {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-areas:
    "hero   hero"
    "title  title"
    "body   quote"
    "meta   meta";
  gap: 20px;
  max-width: 700px;
  background: #1e293b;
  padding: 24px;
  border-radius: 12px;
}
.mag-hero  { grid-area: hero;  background: #334155; height: 160px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b; font-family: system-ui; font-size: 14px; }
.mag-title { grid-area: title; color: #e2e8f0; margin: 0; font-size: 1.5rem; line-height: 1.2; }
.mag-body  { grid-area: body;  color: #94a3b8; font-size: 15px; line-height: 1.7; }
.mag-body p { margin: 0 0 12px; }
.mag-quote { grid-area: quote; border-left: 3px solid #818cf8; padding-left: 16px; color: #818cf8; font-style: italic; font-size: 1rem; line-height: 1.6; margin: 0; display: flex; align-items: center; }
.mag-meta  { grid-area: meta;  display: flex; gap: 20px; border-top: 1px solid #334155; padding-top: 16px; font-family: system-ui; }
.mag-meta span { color: #64748b; font-size: 12px; font-style: normal; }
```

## Pattern 3 — Photo mosaic with spanning

A magazine-style photo grid where certain images are larger. Explicit placement makes this effortless.

```html
<div class="mosaic">
  <div class="photo large" id="ph1">Large Feature</div>
  <div class="photo" id="ph2">Tall Left</div>
  <div class="photo" id="ph3">Top Right</div>
  <div class="photo" id="ph4">Bottom Right</div>
  <div class="photo wide" id="ph5">Wide Bottom</div>
  <div class="photo" id="ph6">Small</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.mosaic {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 100px;
  gap: 10px;
}
.photo { border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; color: white; }
#ph1 { grid-column: span 2; grid-row: span 2; background: #4f46e5; }
#ph2 { grid-row: span 2; background: #059669; }
#ph3 { background: #d97706; }
#ph4 { background: #dc2626; }
#ph5 { grid-column: span 2; background: #7c3aed; }
#ph6 { background: #0891b2; }
.large { font-size: 16px; }
.wide  { }
```

## Pattern 4 — Responsive settings form

Label + input pairs that align perfectly at any width. Grid makes label-input alignment effortless.

```html
<form class="settings-form">
  <div class="form-group">
    <label for="name">Display Name</label>
    <input type="text" id="name" value="Michael McLean" placeholder="Your name">
  </div>
  <div class="form-group">
    <label for="email">Email Address</label>
    <input type="email" id="email" value="michael@example.com" placeholder="email@example.com">
  </div>
  <div class="form-group">
    <label for="bio">Bio</label>
    <textarea id="bio" rows="3" placeholder="Tell us about yourself...">Full-stack developer learning CSS Grid.</textarea>
  </div>
  <div class="form-group">
    <label></label>
    <button type="submit">Save Changes</button>
  </div>
</form>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.settings-form { background: #1e293b; padding: 24px; border-radius: 12px; max-width: 500px; }
.form-group { display: grid; grid-template-columns: 140px 1fr; gap: 12px; align-items: start; margin-bottom: 16px; }
label { color: #94a3b8; font-size: 14px; font-weight: 500; padding-top: 10px; text-align: right; }
input, textarea {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 10px 12px;
  font-size: 14px;
  font-family: system-ui;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
}
button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
```

**SE lens:** These four patterns — dashboard, magazine, mosaic, form — represent the design primitives of most web apps. Knowing the Grid implementation of each means you're never starting from scratch.

**Common mistakes:**
- Overcomplicating mosaics with JavaScript — if the layout is known at design time, CSS Grid placement handles it with no JS.
- Using fixed pixel widths in `grid-template-columns` for forms — `140px 1fr` adapts better than `140px 300px`.

**Debug tip:** For complex grids, write `grid-template-areas` first (the visual map), then add `grid-template-columns` and `grid-template-rows`. The areas string tells you immediately if the layout makes sense before writing a single pixel value.

**Next:** Combining Grid and Flexbox — the professional approach to real UI architecture.

## Challenge: magazine_grid

Build a two-column magazine layout.

1. `.layout` — `display: grid`, `grid-template-columns: 2fr 1fr`, `gap: 20px`
2. `#hero` — `grid-column: 1 / -1` (full width)
3. `#body` — stays in column 1
4. `#sidebar` — stays in column 2

```html
<div class="layout" style="background:#1e293b;padding:16px;border-radius:10px;max-width:600px;">
  <div id="hero" style="background:#1e1b4b;height:100px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#818cf8;font-family:system-ui;font-weight:700;">Hero Image</div>
  <div id="body" style="background:#0f172a;padding:16px;border-radius:8px;color:#94a3b8;font-family:system-ui;font-size:14px;">Article body content goes here.</div>
  <div id="sidebar" style="background:#0f172a;padding:16px;border-radius:8px;color:#64748b;font-family:system-ui;font-size:13px;">Sidebar content.</div>
</div>
```

```challenge
.layout {

}

#hero {

}
```

```test
var layout = getComputedStyle(document.querySelector('.layout'))
var hero = getComputedStyle(document.querySelector('#hero'))
assert layout.display === 'grid'
var cols = layout.gridTemplateColumns.split(' ')
assert cols.length === 2
assert hero.gridColumnStart === '1'
assert hero.gridColumnEnd === '-1' || hero.gridColumnEnd === '3'
```
