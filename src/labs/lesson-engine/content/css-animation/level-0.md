---
series: css-animation
level: 0
title: CSS Transitions
lang: css
---

# CSS Transitions

A UI without animation feels abrupt — elements appear and disappear instantly, state changes happen with no visual acknowledgment. A UI with overdone animation feels slow and distracting. The right amount of motion communicates change clearly and quickly.

CSS transitions are the simplest form of animation: when a property changes (on hover, on focus, when a class is toggled), the browser smoothly interpolates from the old value to the new one. No JavaScript needed.

By the end of this lesson you will be able to write transition declarations, control duration, easing, and delay, and know which properties are safe to animate versus which ones cause layout thrash.

## The transition property

`transition: property duration easing delay` — four values, only `property` and `duration` are required.

```html
<div class="demo">
  <div class="box no-transition">No transition — snaps instantly</div>
  <div class="box with-transition">With transition — 300ms ease</div>
  <div class="box slow-transition">Slow — 1s ease, 200ms delay</div>
</div>
<p class="note">Hover each box to see the difference.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.demo { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.box { background: #1e293b; color: #94a3b8; padding: 14px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.no-transition:hover   { background: #6366f1; color: white; }
.with-transition       { transition: background 300ms ease, color 300ms ease; }
.with-transition:hover { background: #6366f1; color: white; }
.slow-transition       { transition: background 1s ease 200ms, color 1s ease 200ms; }
.slow-transition:hover { background: #059669; color: white; }
.note { color: #64748b; font-size: 12px; background: #1e293b; padding: 10px 14px; border-radius: 8px; margin: 0; }
```

`transition` is placed on the **base state**, not the `:hover` state. This ensures the animation plays both on hover-in and hover-out. Placing it only in `:hover` gives you a smooth hover-in but an instant snap-out.

## What can be transitioned

Not all properties can be transitioned — only properties with **interpolatable values**. Numeric properties (size, color, opacity, position) transition. Display, visibility, and content do not (use opacity + visibility together for fade effects).

```html
<div class="prop-grid">
  <div class="prop-demo pd-opacity">opacity</div>
  <div class="prop-demo pd-color">color</div>
  <div class="prop-demo pd-size">size</div>
  <div class="prop-demo pd-shadow">shadow</div>
  <div class="prop-demo pd-border">border-radius</div>
  <div class="prop-demo pd-transform">transform</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.prop-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.prop-demo { background: #6366f1; color: white; padding: 16px; border-radius: 6px; font-size: 13px; font-weight: 700; text-align: center; cursor: pointer; }
.pd-opacity   { transition: opacity 300ms ease; }
.pd-opacity:hover { opacity: 0.3; }
.pd-color     { transition: background 300ms ease; }
.pd-color:hover { background: #059669; }
.pd-size      { transition: padding 300ms ease; }
.pd-size:hover { padding: 24px; }
.pd-shadow    { transition: box-shadow 300ms ease; }
.pd-shadow:hover { box-shadow: 0 20px 40px rgba(99,102,241,0.4); }
.pd-border    { transition: border-radius 300ms ease; }
.pd-border:hover { border-radius: 50%; }
.pd-transform { transition: transform 300ms ease; }
.pd-transform:hover { transform: scale(1.1); }
```

**CS lens:** The browser **interpolates** between two values during a transition. For colors, it interpolates through a color space (sRGB by default). For numbers, it interpolates linearly modified by the easing function. For transforms, it decomposes the transform matrix and interpolates each component. Transitions that change non-interpolatable properties (like `display`) will fire after the transition ends.

## transition: all — use sparingly

`transition: all 300ms ease` transitions every property that changes. Convenient but costly — the browser must check all properties on every frame. Target specific properties.

```html
<div class="card-hover">
  <div class="card-icon">⚡</div>
  <div class="card-title">JavaScript</div>
  <div class="card-meta">10 levels · Intermediate</div>
  <div class="card-tag">Hover me</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.card-hover {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  max-width: 280px;
  cursor: pointer;
  /* Only transition the properties that change */
  transition: transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: #6366f1;
}
.card-icon  { font-size: 2rem; margin-bottom: 10px; }
.card-title { color: #e2e8f0; font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
.card-meta  { color: #64748b; font-size: 13px; margin-bottom: 10px; }
.card-tag   { background: #1e1b4b; color: #818cf8; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; display: inline-block; }
```

`translateY(-4px)` moves the card up 4px. `box-shadow` adds depth. `border-color` highlights the border. These three transitions together create the "lift" effect used in every modern card UI — and they only cost three property animations.

**SE lens:** Transitions are the lowest cost, highest value animation tool in CSS. They require no JavaScript, no keyframes, and no animation library. The most polished production UIs — Linear, Vercel, Notion — are built almost entirely on `:hover` transitions. Master these before reaching for `@keyframes`.

**Common mistakes:**
- Putting `transition` in `:hover` only — the reverse animation (hover-out) snaps instantly.
- Using `transition: all` in production — creates unexpected animations when unrelated properties change (e.g., during a class toggle).

**Debug tip:** Chrome DevTools → Animations panel (three-dot menu → More tools → Animations) shows every active animation and transition, lets you scrub and replay them, and shows their duration and easing.

**Next:** CSS Transform — the properties that `transition` animates most smoothly: `translate`, `scale`, `rotate`, `skew`.

## Challenge: hover_transition

Add a transition to a button that smoothly animates background on hover.

1. `.btn` — `transition: background 250ms ease, transform 250ms ease`
2. `.btn:hover` — `background: #4f46e5`, `transform: translateY(-2px)`

```html
<button class="btn" id="hover-btn">Hover Me</button>
```

```challenge
body { background: #0f172a; padding: 40px; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 200px; }

.btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  /* add transition */
}

.btn:hover {
  /* add hover styles */
}
```

```test
var btn = getComputedStyle(document.querySelector('.btn'))
assert btn.transition.includes('background') || btn.transitionProperty.includes('background')
assert btn.transition.includes('transform') || btn.transitionProperty.includes('transform')
var rules = Array.from(document.styleSheets[0].cssRules)
var cssText = rules.map(r => r.cssText || '').join(' ')
assert cssText.includes('translateY')
assert cssText.includes('4f46e5') || cssText.includes('hover')
```
