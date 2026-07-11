---
series: css-responsive
level: 0
title: The Viewport and CSS Pixels
lang: css
---

# The Viewport and CSS Pixels

Responsive design is about making layouts that work at any screen size — from a 320px phone to a 2560px monitor. Before you can write responsive CSS, you need to understand how browsers measure screen space.

## The problem: mobile browsers lie about their width

Without any responsive setup, a mobile browser pretends it is 980px wide (or similar), renders the page at that width, then zooms out so the whole thing fits on a 390px screen. Text becomes unreadable. This is why the viewport meta tag exists.

```html
<div class="demo">
  <div class="box narrow">320px — real phone CSS width</div>
  <div class="box medium">768px — tablet CSS width</div>
  <div class="box wide">1280px — desktop CSS width</div>
  <p class="note">A CSS pixel (px) is NOT a screen pixel. On a Retina screen, 1 CSS px = 2 or 3 device pixels. CSS always works in CSS pixels — device pixel ratio is invisible to your layout code.</p>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.demo { display: flex; flex-direction: column; gap: 10px; }
.box { color: white; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.narrow  { background: #dc2626; width: 100%; max-width: 320px; }
.medium  { background: #d97706; width: 100%; max-width: 768px; }
.wide    { background: #059669; width: 100%; }
.note { color: #64748b; font-size: 12px; line-height: 1.6; background: #1e293b; padding: 12px; border-radius: 8px; margin: 0; }
```

**The viewport meta tag** — `<meta name="viewport" content="width=device-width, initial-scale=1">` — tells the mobile browser: "stop pretending to be 980px wide. Use the actual device CSS width." This one tag is mandatory for every responsive page. Without it, media queries won't work correctly on real devices.

## vw and vh — viewport units

`vw` and `vh` are always relative to the viewport (the browser window), unlike `%` which is relative to the parent. `1vw` = 1% of viewport width. `100vh` = full viewport height.

```html
<div class="demo-vw">
  <div class="bar b25">25vw — always 25% of window width</div>
  <div class="bar b50">50vw — always 50% of window width</div>
  <div class="bar b75">75vw — always 75% of window width</div>
</div>
<div class="hero">
  <div class="hero-inner">100vh tall — fills the viewport height</div>
</div>
```

```css
body { background: #0f172a; padding: 0; margin: 0; font-family: system-ui; }
.demo-vw { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.bar { color: white; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; }
.b25 { background: #6366f1; width: 25vw; min-width: 80px; }
.b50 { background: #8b5cf6; width: 50vw; min-width: 120px; }
.b75 { background: #a855f7; width: 75vw; min-width: 160px; }
.hero { background: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 200px; margin: 16px; border-radius: 12px; }
.hero-inner { color: #94a3b8; font-size: 14px; font-weight: 600; }
```

**CS lens:** The viewport is a **coordinate space** — all CSS lengths are relative to it or to ancestor elements. `vw`/`vh` create a direct dependency on the viewport coordinate space, bypassing all ancestor sizing. This is why they're perfect for full-bleed headers or hero sections.

## The responsive size units comparison

`px`, `%`, `vw`, `em`, `rem` — each measures space differently. The right unit for each job eliminates media query overrides.

```html
<div class="comparison">
  <div class="row">
    <span class="lbl">font-size: 16px</span>
    <span class="demo px-demo">Aa</span>
    <span class="note">Fixed. Never scales.</span>
  </div>
  <div class="row">
    <span class="lbl">font-size: 1rem</span>
    <span class="demo rem-demo">Aa</span>
    <span class="note">Relative to root (html). Respects user's browser font setting.</span>
  </div>
  <div class="row">
    <span class="lbl">width: 80%</span>
    <span class="demo pct-demo">Box</span>
    <span class="note">Relative to parent container width.</span>
  </div>
  <div class="row">
    <span class="lbl">width: 50vw</span>
    <span class="demo vw-demo">Box</span>
    <span class="note">Relative to the viewport — ignores parent.</span>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.comparison { display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; align-items: center; gap: 12px; background: #1e293b; padding: 10px 14px; border-radius: 8px; flex-wrap: wrap; }
.lbl { color: #818cf8; font-size: 11px; font-weight: 700; font-family: monospace; min-width: 140px; }
.demo { background: #6366f1; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 700; }
.note { color: #64748b; font-size: 12px; flex: 1; }
.px-demo  { font-size: 16px; }
.rem-demo { font-size: 1rem; }
.pct-demo { width: 80%; }
.vw-demo  { width: min(50vw, 200px); }
```

**SE lens:** Using the right unit for the job eliminates the need for media query overrides. `width: 100%` on an image means it'll never overflow its container — no `@media` needed. `font-size: 1rem` means user preferences are respected — a user who sets their browser font to 20px gets proportionally larger text.

**Common mistakes:**
- Forgetting the viewport meta tag — media queries will not fire correctly on mobile.
- Using `100vh` on mobile — mobile browsers have a collapsing URL bar that makes `100vh` taller than the visible area. Use `100dvh` (dynamic viewport height) or `min-height: 100vh` instead.

**Debug tip:** In Chrome DevTools, click the device toggle (Ctrl+Shift+M) to simulate mobile widths. The ruler at the top shows CSS pixel width — this is what your media queries react to.

**Next:** `@media` queries — the syntax for applying different CSS at different viewport widths.

## Challenge: viewport_units

Style an element using viewport units.

1. `.hero` — `width: 100vw`, `min-height: 200px`, centre the content with flexbox

```html
<div class="hero">
  <h1 id="hero-title">Full Width Hero</h1>
</div>
```

```challenge
body { margin: 0; background: #0f172a; font-family: system-ui; }

.hero {
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 { color: white; font-size: 1.5rem; margin: 0; }
```

```test
var hero = getComputedStyle(document.querySelector('.hero'))
assert hero.width !== '' && hero.minHeight !== ''
assert parseFloat(hero.minHeight) >= 200
assert hero.display === 'flex'
assert hero.alignItems === 'center'
assert hero.justifyContent === 'center'
```
