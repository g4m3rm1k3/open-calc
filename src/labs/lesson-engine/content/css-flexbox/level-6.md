---
series: css-flexbox
level: 6
title: Nested Flex Containers
lang: css
---

# Nested Flex Containers

A flex item can itself be a flex container. This is not special syntax — just `display: flex` on an element that already happens to be inside a flex layout. Nesting is the key to complex layouts: an outer row splits the page, inner columns stack content, and further nesting handles component details.

## Flex items are independent containers

Each flex item can start its own flex context for its children. The outer container controls how items sit side by side; each item controls how its own children are laid out internally.

```html
<div class="outer">
  <div class="panel" id="p-nav">
    <h3>Nav</h3>
    <a href="#">Link 1</a>
    <a href="#">Link 2</a>
    <a href="#">Link 3</a>
  </div>
  <div class="panel" id="p-content">
    <h3>Content</h3>
    <p>This panel is also a flex container — its children stack vertically.</p>
    <button>Action</button>
  </div>
  <div class="panel" id="p-aside">
    <h3>Aside</h3>
    <div class="tag">Tag 1</div>
    <div class="tag">Tag 2</div>
    <div class="tag">Tag 3</div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* Outer: three panels side by side */
.outer  { display: flex; gap: 16px; align-items: stretch; }
.panel  { display: flex; flex-direction: column; background: #1e293b; padding: 16px; border-radius: 10px; gap: 8px; flex: 1; }
h3 { color: #e2e8f0; margin: 0; font-size: 0.9rem; border-bottom: 1px solid #334155; padding-bottom: 8px; }
a  { color: #818cf8; font-size: 14px; text-decoration: none; }
p  { color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0; flex: 1; }
button { background: #6366f1; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
.tag { background: #334155; color: #e2e8f0; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
```

The `#p-nav` panel is a column flex container — its links stack vertically. The `#p-aside` panel is also a column flex container — its tags stack. Each flex context is independent.

**CS lens:** Flex contexts do not bleed into each other. The outer container's `align-items: stretch` makes all three panels the same height. Each panel then creates its own flex context for its children — independently. The inner items have no idea about the outer layout.

## The holy grail layout — header, footer, sidebar, main

The classic page layout: header across the top, footer across the bottom, sidebar on the left, main content filling the rest. Two levels of nesting achieves this.

```html
<div class="page">
  <header>Header — full width</header>
  <div class="body-row">
    <nav class="sidebar">
      <p>Sidebar</p>
      <a href="#">Dashboard</a>
      <a href="#">Projects</a>
      <a href="#">Settings</a>
    </nav>
    <main>
      <h2>Main Content</h2>
      <p>The outer .page is a column flex container. The inner .body-row is a row flex container. Two levels of nesting = holy grail layout.</p>
    </main>
  </div>
  <footer>Footer — full width</footer>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; margin: 0; }
/* Outer: vertical stack */
.page { display: flex; flex-direction: column; gap: 2px; min-height: 300px; }
header { background: #1e3a5f; color: #e2e8f0; padding: 16px 24px; font-weight: 700; border-radius: 8px 8px 0 0; }
footer { background: #1e293b; color: #64748b; padding: 12px 24px; font-size: 13px; border-radius: 0 0 8px 8px; }
/* Inner: horizontal row */
.body-row { display: flex; gap: 2px; flex: 1; }
.sidebar  { background: #1e293b; padding: 16px; width: 160px; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
.sidebar p { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.sidebar a { color: #94a3b8; font-size: 14px; text-decoration: none; }
main { background: #0f172a; border: 1px solid #1e293b; padding: 20px; flex: 1; border-radius: 0 0 0 0; }
main h2 { color: #e2e8f0; margin: 0 0 8px; }
main p  { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0; }
```

Two nested flex containers, no absolute positioning, no floats, and it works at any height.

## Nested flex for a card component

A card with an image, body content, and a footer tag row — three levels of flex nesting inside a grid of cards.

```html
<div class="card-row">
  <article class="card">
    <div class="card-img">🚀</div>
    <div class="card-body">
      <h3>Launch Guide</h3>
      <p>Learn how to deploy a production app in under an hour.</p>
    </div>
    <div class="card-footer">
      <span class="tag">DevOps</span>
      <span class="tag">CI/CD</span>
      <span class="dur">12 min</span>
    </div>
  </article>
  <article class="card">
    <div class="card-img">🎨</div>
    <div class="card-body">
      <h3>CSS Flexbox</h3>
      <p>Master one-dimensional layout from the flex container up.</p>
    </div>
    <div class="card-footer">
      <span class="tag">CSS</span>
      <span class="tag">Layout</span>
      <span class="dur">8 min</span>
    </div>
  </article>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* Outer row of cards */
.card-row { display: flex; gap: 16px; }
/* Each card: column flex */
.card { display: flex; flex-direction: column; background: #1e293b; border-radius: 12px; overflow: hidden; flex: 1; }
.card-img  { background: #1e1b4b; font-size: 2.5rem; text-align: center; padding: 24px; }
.card-body { padding: 16px; flex: 1; }
.card-body h3 { color: #e2e8f0; margin: 0 0 6px; font-size: 1rem; }
.card-body p  { color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0; }
/* Footer: row flex */
.card-footer { display: flex; gap: 6px; align-items: center; padding: 12px 16px; border-top: 1px solid #334155; flex-wrap: wrap; }
.tag  { background: #334155; color: #94a3b8; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
.dur  { margin-left: auto; color: #64748b; font-size: 12px; }
```

**SE lens:** Real UI components are almost always several levels of nested flex. The outer layout positions major sections; inner flex handles component-level alignment. There is no practical limit to nesting depth — the browser handles it efficiently.

**Common mistakes:**
- Forgetting that a flex item needs `display: flex` itself to become a flex container for its own children — `flex` properties on a parent don't propagate.
- Setting `height: 100%` on nested items when a parent has no explicit height — percentages resolve against the parent's content box, which may be `auto`.

**Debug tip:** In DevTools, selecting any element shows whether it is a flex container ("flex" badge) or a flex item (shown with a dashed border inside its parent's flex context). You can have both badges at once.

**Next:** Real-world patterns — sticky navigation, modal centering, sidebar layout, and the tab bar.

## Challenge: nested_flex

Create a card with nested flex: outer column, inner row footer.

1. `.card` — `display: flex`, `flex-direction: column`
2. `.card-footer` — `display: flex`, `flex-direction: row`, `justify-content: space-between`, `align-items: center`

```html
<div class="card" style="background:#1e293b;border-radius:10px;overflow:hidden;width:280px;">
  <div class="card-body" style="padding:16px;flex:1;">
    <h3 id="card-title" style="color:#e2e8f0;margin:0 0 8px;">Course Title</h3>
    <p style="color:#94a3b8;font-size:13px;margin:0;">Course description here.</p>
  </div>
  <div class="card-footer" style="padding:12px 16px;border-top:1px solid #334155;">
    <span id="tag" style="background:#334155;color:#94a3b8;padding:2px 8px;border-radius:9999px;font-size:12px;">CSS</span>
    <span id="dur" style="color:#64748b;font-size:12px;">8 min</span>
  </div>
</div>
```

```challenge
.card {
  font-family: system-ui;
}

.card-footer {

}
```

```test
var card = getComputedStyle(document.querySelector('.card'))
var footer = getComputedStyle(document.querySelector('.card-footer'))
assert card.display === 'flex'
assert card.flexDirection === 'column'
assert footer.display === 'flex'
assert footer.justifyContent === 'space-between'
assert footer.alignItems === 'center'
```
