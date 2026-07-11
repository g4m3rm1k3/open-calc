---
series: css-flexbox
level: 7
title: Real-World Flex Patterns
lang: css
---

# Real-World Flex Patterns

Flexbox properties don't live in isolation — they combine to solve recurring layout problems. This lesson covers the five patterns you'll write in nearly every project: sticky nav, centred modal, sidebar+content, equal-height cards, and the tab bar.

## Pattern 1 — The sticky navigation bar

Logo on the left, nav links in the middle, action button on the right. `space-between` on the outer nav plus `gap` on the links group.

```html
<nav class="navbar">
  <div class="brand">⚡ UpskillOS</div>
  <ul class="nav-links">
    <li><a href="#">Courses</a></li>
    <li><a href="#">Labs</a></li>
    <li><a href="#">Community</a></li>
    <li><a href="#">Blog</a></li>
  </ul>
  <div class="nav-actions">
    <button class="btn-ghost">Log in</button>
    <button class="btn-primary">Sign Up</button>
  </div>
</nav>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; margin: 0; }
.navbar { display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 12px 24px; border-radius: 10px; }
.brand  { color: #818cf8; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
.nav-links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
.nav-links a { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; }
.nav-links a:hover { color: #e2e8f0; }
.nav-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-ghost   { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 7px 14px; border-radius: 6px; font-weight: 500; cursor: pointer; font-size: 13px; }
.btn-primary { background: #6366f1; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
```

## Pattern 2 — Centred modal overlay

`justify-content: center` + `align-items: center` on a full-viewport flex container. The modal card stays centred regardless of its content height.

```html
<div class="overlay">
  <div class="modal">
    <h2>Confirm Action</h2>
    <p>Are you sure you want to delete this item? This action cannot be undone.</p>
    <div class="modal-actions">
      <button class="cancel">Cancel</button>
      <button class="confirm">Delete</button>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; margin: 0; font-family: system-ui; }
.overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: rgba(0, 0, 0, 0.6);
  padding: 24px;
}
.modal { background: #1e293b; border-radius: 12px; padding: 28px; max-width: 360px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
.modal h2 { color: #e2e8f0; margin: 0 0 12px; font-size: 1.1rem; }
.modal p  { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.cancel  { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.confirm { background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
```

## Pattern 3 — Sidebar + scrollable content

Fixed sidebar, main content takes remaining space. The page is a row flex container; the sidebar has `flex-shrink: 0`; the content area has `flex: 1` and its own scroll.

```html
<div class="app">
  <aside class="sidebar">
    <p class="sidebar-label">Workspace</p>
    <a class="nav-item active" href="#">📊 Dashboard</a>
    <a class="nav-item" href="#">📁 Projects</a>
    <a class="nav-item" href="#">📅 Calendar</a>
    <a class="nav-item" href="#">⚙️ Settings</a>
  </aside>
  <main class="content">
    <h1>Dashboard</h1>
    <p>Main content area — takes all remaining horizontal space via flex: 1. Sidebar is fixed at 200px.</p>
    <div class="card-strip">
      <div class="stat-card"><span class="stat-val">128</span><span class="stat-lbl">Courses</span></div>
      <div class="stat-card"><span class="stat-val">42</span><span class="stat-lbl">Completed</span></div>
      <div class="stat-card"><span class="stat-val">86%</span><span class="stat-lbl">Progress</span></div>
    </div>
  </main>
</div>
```

```css
body { background: #0f172a; margin: 0; font-family: system-ui; padding: 24px; }
.app { display: flex; gap: 0; background: #1e293b; border-radius: 12px; overflow: hidden; min-height: 280px; }
.sidebar { width: 200px; flex-shrink: 0; background: #0f172a; padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }
.sidebar-label { color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 8px; }
.nav-item { color: #94a3b8; text-decoration: none; padding: 8px 10px; border-radius: 6px; font-size: 14px; font-weight: 500; }
.nav-item.active { background: #1e293b; color: #818cf8; }
.content  { flex: 1; padding: 24px; overflow-y: auto; }
.content h1 { color: #e2e8f0; margin: 0 0 8px; font-size: 1.25rem; }
.content p  { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
.card-strip { display: flex; gap: 12px; }
.stat-card  { flex: 1; background: #0f172a; padding: 16px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; }
.stat-val   { color: #818cf8; font-size: 1.5rem; font-weight: 800; }
.stat-lbl   { color: #64748b; font-size: 12px; margin-top: 4px; }
```

## Pattern 4 — Equal-height cards with pinned footer

Cards in a row stretch to equal height. The "button at the bottom" effect uses `flex-direction: column` + `flex: 1` on the growing body.

```html
<div class="card-row">
  <div class="card">
    <div class="card-header">🎨 CSS Mastery</div>
    <div class="card-body">
      <p>Learn flexbox, grid, animations, and everything in between.</p>
    </div>
    <div class="card-foot">
      <span class="level">Beginner</span>
      <button>Enroll</button>
    </div>
  </div>
  <div class="card">
    <div class="card-header">⚡ JavaScript</div>
    <div class="card-body">
      <p>Master closures, prototypes, async/await, and the event loop. A comprehensive deep-dive into how JavaScript really works under the hood, covering everything from scope to memory management.</p>
    </div>
    <div class="card-foot">
      <span class="level">Intermediate</span>
      <button>Enroll</button>
    </div>
  </div>
  <div class="card">
    <div class="card-header">🐍 Python</div>
    <div class="card-body">
      <p>From fundamentals to data pipelines.</p>
    </div>
    <div class="card-foot">
      <span class="level">Beginner</span>
      <button>Enroll</button>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.card-row { display: flex; gap: 16px; align-items: stretch; }
.card { display: flex; flex-direction: column; background: #1e293b; border-radius: 12px; overflow: hidden; flex: 1; }
.card-header { background: #1e1b4b; color: #818cf8; padding: 16px; font-size: 1rem; font-weight: 700; }
.card-body   { padding: 16px; flex: 1; }
.card-body p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0; }
.card-foot   { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-top: 1px solid #334155; }
.level  { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
button  { background: #6366f1; color: white; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
```

**SE lens:** These four patterns cover ~80% of real UI layouts. The key insight is that most layouts are just nested flex containers with different `flex-direction` at each level. Once you can picture the nesting, the CSS follows naturally.

**Common mistakes:**
- Making the overlay `position: fixed; width: 100vw; height: 100vh` instead of using `min-height: 100vh` on the flex container — the flex approach is simpler and works better with dynamic content.
- Forgetting `flex: 0 0 200px` on the sidebar — without `flex-shrink: 0`, the sidebar will shrink when the content is long.

**Debug tip:** When a flex layout breaks, check each container in turn: outer first, then each nested container. The bug is almost always a missing `display: flex` or an unexpected `flex-basis` on an item.

**Next:** CSS Grid — two-dimensional layout for rows and columns simultaneously.

## Challenge: sidebar_layout

Build the sidebar+content pattern.

1. `.app` — `display: flex`
2. `.sidebar` — `width: 220px`, `flex-shrink: 0`
3. `.content` — `flex: 1`

```html
<div class="app" style="background:#1e293b;border-radius:10px;overflow:hidden;min-height:180px;">
  <aside class="sidebar" style="background:#0f172a;padding:16px;">
    <p style="color:#64748b;margin:0;font-size:13px;">Sidebar</p>
  </aside>
  <main class="content" style="padding:16px;">
    <p id="content-text" style="color:#94a3b8;font-size:14px;margin:0;">Main content fills remaining space</p>
  </main>
</div>
```

```challenge
/* Build the sidebar + content layout */
.app {
  font-family: system-ui;
}

.sidebar {

}

.content {

}
```

```test
var app  = getComputedStyle(document.querySelector('.app'))
var sb   = getComputedStyle(document.querySelector('.sidebar'))
var main = getComputedStyle(document.querySelector('.content'))
assert app.display === 'flex'
assert sb.width === '220px'
assert sb.flexShrink === '0'
assert main.flexGrow === '1'
```
