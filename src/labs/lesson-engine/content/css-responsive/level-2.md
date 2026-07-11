---
series: css-responsive
level: 2
title: Mobile-First Design
lang: css
---

# Mobile-First Design

Mobile-first is a strategy, not just a breakpoint direction. You write all base CSS for the smallest screen, then add CSS to expand the layout for larger screens. The result is simpler CSS, smaller payloads for mobile, and layouts that degrade gracefully.

## The mobile-first principle

Compare: desktop-first (overrides going down) vs mobile-first (overrides going up). Mobile-first almost always produces fewer lines of CSS and fewer specificity conflicts.

```html
<div class="comparison">
  <div class="panel">
    <div class="panel-label">Desktop-First (fight upstream)</div>
    <div class="df-card">
      <div class="df-header">Header</div>
      <div class="df-body">
        <div class="df-sidebar">Sidebar</div>
        <div class="df-main">Main</div>
      </div>
    </div>
    <p class="note">CSS starts wide: sidebar+main. Media query collapses it for mobile. You're fighting the default state.</p>
  </div>
  <div class="panel">
    <div class="panel-label">Mobile-First (build forward)</div>
    <div class="mf-card">
      <div class="mf-header">Header</div>
      <div class="mf-sidebar">Sidebar</div>
      <div class="mf-main">Main</div>
    </div>
    <p class="note">CSS starts stacked. Media query adds sidebar. You're building from simple → complex.</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.panel { display: flex; flex-direction: column; gap: 8px; }
.panel-label { color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.note { color: #64748b; font-size: 11px; line-height: 1.5; margin: 0; }
/* Desktop-first */
.df-card { background: #1e293b; border-radius: 8px; padding: 8px; font-size: 12px; }
.df-header { background: #dc2626; color: white; padding: 8px; border-radius: 4px; margin-bottom: 6px; font-weight: 700; text-align: center; }
.df-body { display: flex; gap: 6px; }
.df-sidebar { background: #7f1d1d; color: white; padding: 8px; border-radius: 4px; width: 60px; font-weight: 600; font-size: 11px; }
.df-main { background: #991b1b; color: white; padding: 8px; border-radius: 4px; flex: 1; font-weight: 600; font-size: 11px; }
/* Mobile-first */
.mf-card { background: #1e293b; border-radius: 8px; padding: 8px; font-size: 12px; }
.mf-header { background: #059669; color: white; padding: 8px; border-radius: 4px; margin-bottom: 6px; font-weight: 700; text-align: center; }
.mf-sidebar { background: #065f46; color: white; padding: 8px; border-radius: 4px; margin-bottom: 6px; font-weight: 600; font-size: 11px; }
.mf-main { background: #047857; color: white; padding: 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
```

## Rewriting a component mobile-first

A card component: single column on mobile, two columns at medium, three at large. Each breakpoint adds CSS rather than overriding it.

```html
<div class="card-grid">
  <div class="card"><div class="card-icon">🐍</div><div class="card-title">Python</div></div>
  <div class="card"><div class="card-icon">⚡</div><div class="card-title">JavaScript</div></div>
  <div class="card"><div class="card-icon">🎨</div><div class="card-title">CSS</div></div>
  <div class="card"><div class="card-icon">⚛️</div><div class="card-title">React</div></div>
  <div class="card"><div class="card-icon">🗄️</div><div class="card-title">SQL</div></div>
  <div class="card"><div class="card-icon">🔷</div><div class="card-title">TypeScript</div></div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
/* Mobile base — single column */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
/* 480px+ — two columns */
@media (min-width: 480px) {
  .card-grid { grid-template-columns: 1fr 1fr; }
}
/* 768px+ — three columns */
@media (min-width: 768px) {
  .card-grid { grid-template-columns: 1fr 1fr 1fr; }
}
.card { background: #1e293b; padding: 20px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.card-icon  { font-size: 2rem; }
.card-title { color: #e2e8f0; font-size: 14px; font-weight: 700; }
```

**CS lens:** Each media query creates an additive **CSS layer** — it adds rules rather than replacing them. This is the cascade at work: the most specific (or latest) matching rule wins. Mobile-first media queries are always additive, which is why they produce less CSS than desktop-first.

## Mobile-first navigation pattern

Navigation on mobile: a hamburger (hidden for this demo), stacked links. On tablet+: horizontal links. On desktop+: spaced nav bar.

```html
<header class="site-header">
  <div class="brand">⚡ UpskillOS</div>
  <nav class="main-nav">
    <a class="nav-link" href="#">Courses</a>
    <a class="nav-link" href="#">Labs</a>
    <a class="nav-link" href="#">Community</a>
    <a class="nav-link active" href="#">Pro</a>
  </nav>
</header>
<main class="page-main">
  <h1>Resize me</h1>
  <p>The nav stacks on small screens, goes horizontal on wider screens, and spreads out on large screens.</p>
</main>
```

```css
body { background: #0f172a; margin: 0; font-family: system-ui; padding: 0; }
/* Mobile base */
.site-header { background: #1e293b; padding: 12px 16px; }
.brand { color: #818cf8; font-weight: 800; font-size: 1rem; margin-bottom: 10px; }
.main-nav { display: flex; flex-direction: column; gap: 2px; }
.nav-link { color: #94a3b8; text-decoration: none; padding: 8px 10px; border-radius: 6px; font-size: 14px; font-weight: 500; }
.nav-link.active { color: #818cf8; background: #1e1b4b; }
/* 600px+ — horizontal nav */
@media (min-width: 600px) {
  .site-header { display: flex; align-items: center; justify-content: space-between; }
  .brand { margin-bottom: 0; }
  .main-nav { flex-direction: row; gap: 4px; }
}
/* 900px+ — more padding */
@media (min-width: 900px) {
  .site-header { padding: 16px 32px; }
  .main-nav { gap: 8px; }
}
.page-main { padding: 24px 16px; }
.page-main h1 { color: #e2e8f0; margin: 0 0 8px; font-size: 1.25rem; }
.page-main p  { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0; }
```

**SE lens:** This is **progressive enhancement** — the core content and navigation work on every device because the mobile base is complete. The media queries enhance the experience for larger screens without breaking smaller ones. A user with a broken CSS file still sees a working page.

**Common mistakes:**
- Writing `@media (min-width: 0px)` — the `0px` query is redundant. Mobile base CSS applies at all widths with no query.
- Putting all your media queries at the bottom of the file — keep them right after the rule they modify so the relationship is clear.

**Debug tip:** Temporarily add `body::after { content: 'mobile'; position: fixed; top: 0; right: 0; background: red; color: white; padding: 4px 8px; font-size: 12px; }` and override `content` in each media query to label the current breakpoint during development.

**Next:** Responsive typography — using `clamp()` to make text scale fluidly between sizes without any media queries at all.

## Challenge: mobile_first

Add a media query that changes the layout from column to row at 640px.

1. `.layout` — default `flex-direction: column`
2. `@media (min-width: 640px)` — `.layout` flex-direction becomes `row`

```html
<div class="layout">
  <aside class="sidebar" id="sb">Sidebar</aside>
  <main class="content" id="ct">Main Content</main>
</div>
```

```challenge
body { background: #0f172a; font-family: system-ui; padding: 16px; }
.sidebar { background: #6366f1; color: white; padding: 16px; border-radius: 8px; font-weight: 700; font-size: 14px; }
.content { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; flex: 1; font-size: 14px; }

.layout {
  display: flex;
  gap: 12px;
  /* set flex-direction */
}

/* write the media query */
```

```test
var layout = getComputedStyle(document.querySelector('.layout'))
assert layout.display === 'flex'
var rules = Array.from(document.styleSheets[0].cssRules)
var mediaRule = rules.find(r => r.constructor.name === 'CSSMediaRule')
assert mediaRule !== undefined
assert mediaRule.conditionText.includes('640')
var innerRules = Array.from(mediaRule.cssRules)
var layoutRule = innerRules.find(r => r.selectorText === '.layout')
assert layoutRule !== undefined
```
