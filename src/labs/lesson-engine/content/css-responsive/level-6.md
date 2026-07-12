---
series: css-responsive
level: 6
title: Container Queries
lang: css
---

# Container Queries

Media queries have a fundamental limitation: they respond to the viewport, not to where a component is placed. A card component inside a narrow sidebar should look different from the same card in a wide main column — but a `@media` query cannot know where the card is. So developers write separate CSS for each context, duplicating code.

**Container queries** (`@container`) respond to the component's parent container width. The card can style itself based on how much space its container gives it, regardless of viewport size. This makes truly reusable components possible for the first time.

By the end of this lesson you will be able to set up container query contexts with `container-type`, write `@container` rules, and understand when to use container queries versus media queries.

## The problem with media queries for components

A card styled with `@media (min-width: 768px)` will use its wide layout whenever the viewport is wide — even if the card is inside a 300px sidebar. Container queries solve this.

```html
<div class="demo">
  <div class="panel narrow-panel">
    <p class="panel-label">Narrow container (260px)</p>
    <div class="course-card">
      <div class="card-icon">🐍</div>
      <div class="card-info">
        <div class="card-title">Python Fundamentals</div>
        <div class="card-meta">36 levels</div>
      </div>
    </div>
  </div>
  <div class="panel wide-panel">
    <p class="panel-label">Wide container (fills remaining space)</p>
    <div class="course-card">
      <div class="card-icon">🐍</div>
      <div class="card-info">
        <div class="card-title">Python Fundamentals</div>
        <div class="card-meta">36 levels · Beginner → Intermediate · 8 hours</div>
      </div>
      <div class="card-action"><button class="enroll-btn">Enroll</button></div>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.demo { display: flex; gap: 12px; }
.panel { background: #1e293b; border-radius: 10px; padding: 14px; container-type: inline-size; }
.narrow-panel { width: 240px; flex-shrink: 0; }
.wide-panel { flex: 1; }
.panel-label { color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px; }
/* Component default — compact */
.course-card { display: flex; align-items: center; gap: 10px; background: #0f172a; padding: 12px; border-radius: 8px; }
.card-icon  { font-size: 1.5rem; flex-shrink: 0; }
.card-title { color: #e2e8f0; font-size: 13px; font-weight: 700; }
.card-meta  { color: #64748b; font-size: 11px; margin-top: 2px; }
.card-action { display: none; }
/* Container query — wide layout when container is 400px+ */
@container (min-width: 400px) {
  .course-card { padding: 16px; }
  .card-icon   { font-size: 2rem; }
  .card-title  { font-size: 15px; }
  .card-meta   { font-size: 12px; }
  .card-action { display: block; margin-left: auto; }
  .enroll-btn  { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
}
```

Two identical `course-card` components. Their container size determines which layout they use — not the viewport. `container-type: inline-size` on the `.panel` declares it as a containment context.

## @container syntax

Container queries mirror media query syntax. `@container (min-width: 400px)` fires when the nearest container ancestor is 400px or wider.

```html
<div class="container-demo">
  <div class="outer-container">
    <p class="clabel">Outer container — wide</p>
    <div class="widget">
      <div class="widget-icon">⚡</div>
      <div class="widget-content">
        <div class="widget-title">JavaScript Fundamentals</div>
        <div class="widget-desc">Master closures, async/await, and the event loop.</div>
      </div>
    </div>
  </div>
  <div class="inner-container">
    <p class="clabel">Inner container — 220px</p>
    <div class="widget">
      <div class="widget-icon">⚡</div>
      <div class="widget-content">
        <div class="widget-title">JavaScript</div>
        <div class="widget-desc">10 levels</div>
      </div>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.container-demo { display: flex; gap: 12px; }
.outer-container { flex: 1; background: #1e293b; padding: 14px; border-radius: 10px; container-type: inline-size; }
.inner-container { width: 200px; background: #1e293b; padding: 14px; border-radius: 10px; container-type: inline-size; }
.clabel { color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px; }
/* Widget — compact by default */
.widget { display: flex; flex-direction: column; gap: 8px; background: #0f172a; padding: 12px; border-radius: 8px; }
.widget-icon { font-size: 1.25rem; }
.widget-title { color: #e2e8f0; font-size: 13px; font-weight: 700; }
.widget-desc  { color: #64748b; font-size: 11px; line-height: 1.4; }
/* Wide container — horizontal layout */
@container (min-width: 350px) {
  .widget { flex-direction: row; align-items: center; }
  .widget-icon { font-size: 1.75rem; flex-shrink: 0; }
  .widget-title { font-size: 14px; }
  .widget-desc  { font-size: 12px; }
}
```

**CS lens:** Container queries create a **scoped layout context**. The browser resolves container size first, then evaluates `@container` rules for all descendants. This is why `container-type: inline-size` is required — without it, the browser doesn't know what to measure against. `inline-size` measures width; `size` measures both width and height.

## Named containers

When nesting containers, name them to target a specific ancestor.

```html
<div class="page-layout" style="container-type: inline-size; container-name: page;">
  <aside class="side" style="container-type: inline-size; container-name: sidebar;">
    <div class="sidebar-widget">
      <div class="sw-label">Sidebar Widget</div>
      <div class="sw-body">This responds to the sidebar container, not the page.</div>
    </div>
  </aside>
  <main class="main-area" style="container-type: inline-size; container-name: main;">
    <div class="main-widget">
      <div class="mw-label">Main Widget</div>
      <div class="mw-body">This responds to the main container width.</div>
    </div>
  </main>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.page-layout { display: flex; gap: 12px; }
.side { width: 200px; flex-shrink: 0; background: #1e293b; padding: 14px; border-radius: 10px; }
.main-area { flex: 1; background: #1e293b; padding: 14px; border-radius: 10px; }
.sidebar-widget, .main-widget { background: #0f172a; padding: 12px; border-radius: 8px; }
.sw-label, .mw-label { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
.sw-label { color: #f59e0b; }
.mw-label { color: #818cf8; }
.sw-body, .mw-body { font-size: 12px; color: #64748b; line-height: 1.5; }
/* Target specific named containers */
@container sidebar (min-width: 180px) {
  .sw-body { color: #94a3b8; }
}
@container main (min-width: 400px) {
  .mw-body { color: #94a3b8; font-size: 13px; }
}
```

**SE lens:** Container queries are the missing piece for **component-driven design**. Before container queries, a card component couldn't truly adapt to its context — you'd need separate `card--narrow` and `card--wide` variants. With container queries, the component adapts itself. This is how React/Vue component libraries are now being designed: the component owns its responsive behaviour, not the page.

**Common mistakes:**
- Forgetting `container-type: inline-size` — without it, `@container` queries never fire.
- Querying a container from inside itself — you can't query the container you're measuring against. The query applies to the container's descendants, not to the container element itself.

**Debug tip:** Chrome DevTools has container query support — elements inside a container show a "container" badge in the Elements panel, and you can see which container queries are active in the Styles sidebar.

**Next:** A complete responsive page — combining viewport units, media queries, fluid typography, responsive images, auto-grid, and container queries into a single cohesive design.

## Challenge: container_query

Set up a container query that changes a card's layout.

1. `.card-wrapper` — `container-type: inline-size`
2. `@container (min-width: 400px)` — `.card` becomes `flex-direction: row`

```html
<div class="card-wrapper" style="width: 500px; background: #1e293b; padding: 16px; border-radius: 10px;">
  <div class="card">
    <div class="card-img" id="cimg" style="background:#6366f1; color:white; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:13px;">Image</div>
    <div class="card-body" id="cbody">
      <div style="color:#e2e8f0; font-weight:700; margin-bottom:4px; font-size:14px;">Card Title</div>
      <div style="color:#64748b; font-size:12px;">Card description text goes here.</div>
    </div>
  </div>
</div>
```

```challenge
body { background: #0f172a; padding: 20px; font-family: system-ui; }

.card-wrapper {
  /* add container-type */
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-img { width: 100%; aspect-ratio: 16/9; border-radius: 8px; }
.card-body { padding: 4px; }

/* add @container query */
```

```test
var wrapper = getComputedStyle(document.querySelector('.card-wrapper'))
assert wrapper.containerType === 'inline-size'
var rules = Array.from(document.styleSheets[0].cssRules)
var hasContainer = rules.some(r => r.constructor.name === 'CSSContainerRule')
assert hasContainer
var containerRule = rules.find(r => r.constructor.name === 'CSSContainerRule')
assert containerRule.conditionText.includes('400')
var innerRules = Array.from(containerRule.cssRules || [])
assert innerRules.length > 0
assert innerRules.some(r => r.selectorText && r.selectorText.includes('.card'))
```
