---
series: css-responsive
level: 1
title: Media Queries
lang: css
---

# Media Queries

In Level 0 you learned that a CSS pixel is not a screen pixel, and that the viewport determines how wide the browser thinks it is. Now you can use that information to apply different CSS at different widths.

A **media query** tells the browser "apply this CSS only when a condition is true." The most common condition is viewport width — different CSS for narrow screens, wider screens, and large screens. Media queries are how layouts transform from a single column on mobile to a multi-column grid on desktop.

By the end of this lesson you will be able to write `@media` rules, choose between `min-width` and `max-width` strategies, pick appropriate breakpoints, and target dark mode and other user preferences with media features.

## The @media syntax

A media query wraps CSS rules in a block that only applies when the condition matches. The browser evaluates it on every resize.

```html
<div class="box">
  <div class="indicator">
    <span class="size-label" id="size-label">Resize to see the breakpoints fire</span>
  </div>
  <div class="bar bar-sm">Fires at any width (mobile base)</div>
  <div class="bar bar-md">Fires at 600px+ (medium)</div>
  <div class="bar bar-lg">Fires at 900px+ (large)</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; margin: 0; }
.box { display: flex; flex-direction: column; gap: 8px; }
.indicator { background: #1e293b; padding: 10px 14px; border-radius: 8px; margin-bottom: 4px; }
.size-label { color: #64748b; font-size: 12px; }
.bar { padding: 12px 16px; border-radius: 8px; color: white; font-size: 13px; font-weight: 600; display: none; }
.bar-sm { display: block; background: #6366f1; }
@media (min-width: 600px) { .bar-md { display: block; background: #059669; } }
@media (min-width: 900px) { .bar-lg { display: block; background: #d97706; } }
```

`@media (min-width: 600px) { ... }` — everything inside only applies when the viewport is 600px or wider. The default CSS (no query) applies at all widths. This is the foundation of mobile-first responsive design.

**CS lens:** The browser maintains a **media query evaluation engine** that fires a reflow whenever a media condition changes state. Internally it's a condition variable: if `viewportWidth >= 600`, activate this ruleset. The cascade applies as usual — the last matching rule wins, so wider breakpoints naturally override narrower ones.

## min-width vs max-width

`min-width` reads "at this width or above." `max-width` reads "at this width or below." The difference determines which direction CSS overrides flow.

```html
<div class="demo">
  <div class="block mw-demo">max-width approach — writes for large first, overrides down</div>
  <div class="block miw-demo">min-width approach (recommended) — writes for small first, overrides up</div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.demo { display: flex; flex-direction: column; gap: 10px; }
.block { padding: 14px 16px; border-radius: 8px; color: white; font-size: 13px; font-weight: 600; line-height: 1.5; }

/* max-width: large screens is the default */
.mw-demo { background: #dc2626; font-size: 18px; }
@media (max-width: 768px) { .mw-demo { font-size: 14px; background: #7f1d1d; } }

/* min-width: small screens is the default */
.miw-demo { background: #166534; font-size: 13px; }
@media (min-width: 768px) { .miw-demo { font-size: 16px; background: #059669; } }
```

The `min-width` (mobile-first) approach is almost always better. You write the simple, narrow layout first. Media queries add complexity for larger screens. Since most users are on mobile, their devices parse less CSS.

## Common breakpoints

There are no universal breakpoints. Base them on where your layout breaks, not on specific device widths. These are common starting points.

```html
<div class="bp-grid">
  <div class="bp-card">
    <div class="bp-value">0px</div>
    <div class="bp-name">Base (mobile)</div>
    <div class="bp-note">Default — no query needed</div>
  </div>
  <div class="bp-card">
    <div class="bp-value">480px</div>
    <div class="bp-name">Small</div>
    <div class="bp-note">Large phones, small phones landscape</div>
  </div>
  <div class="bp-card">
    <div class="bp-value">768px</div>
    <div class="bp-name">Medium</div>
    <div class="bp-note">Tablets, large phones landscape</div>
  </div>
  <div class="bp-card">
    <div class="bp-value">1024px</div>
    <div class="bp-name">Large</div>
    <div class="bp-note">Small laptops, tablets landscape</div>
  </div>
  <div class="bp-card">
    <div class="bp-value">1280px</div>
    <div class="bp-name">XL</div>
    <div class="bp-note">Desktops</div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.bp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.bp-card { background: #1e293b; border-radius: 10px; padding: 14px; }
.bp-value { color: #818cf8; font-size: 1.1rem; font-weight: 800; font-family: monospace; margin-bottom: 6px; }
.bp-name  { color: #e2e8f0; font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.bp-note  { color: #64748b; font-size: 11px; line-height: 1.5; }
```

**SE lens:** Tailwind CSS codified these breakpoints into a design system: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px). Understanding raw media queries is what lets you understand what `md:flex` means in Tailwind — it's just `@media (min-width: 768px) { display: flex }`.

**Common mistakes:**
- Using pixel-based `em` breakpoints (`48em` instead of `768px`) — technically more accessible but harder to read; stick to `px` unless the team has a specific reason.
- Creating a breakpoint for every element — define 2-4 global breakpoints, not per-element ones. This creates a consistent design system.

**Debug tip:** Chrome DevTools shows which media queries are active in the Sources tab → Media Queries sidebar. You can also add `::before { content: "mobile"; }` on `body` and change the content in media queries to label the current breakpoint during development.

**Next:** Mobile-first design — the strategy of writing all base CSS for small screens, then progressively enhancing for wider ones.

## Challenge: media_query

Write a media query that changes the card layout at 600px.

1. `.cards` — default `flex-direction: column`
2. `@media (min-width: 600px)` — `.cards` becomes `flex-direction: row`

```html
<div class="cards">
  <div class="card" id="c1">Card One</div>
  <div class="card" id="c2">Card Two</div>
  <div class="card" id="c3">Card Three</div>
</div>
```

```challenge
.card {
  background: #6366f1;
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-family: system-ui;
  font-weight: 700;
  text-align: center;
  flex: 1;
}

.cards {
  display: flex;
  gap: 12px;
  /* add flex-direction here */
}

/* add @media query here */
```

```test
var cards = getComputedStyle(document.querySelector('.cards'))
assert cards.display === 'flex'
var rules = Array.from(document.styleSheets[0].cssRules)
var hasMedia = rules.some(r => r.constructor.name === 'CSSMediaRule')
assert hasMedia
var mediaRule = rules.find(r => r.constructor.name === 'CSSMediaRule')
assert mediaRule !== undefined
assert mediaRule.conditionText.includes('600')
```
