---
series: css-animation
level: 3
title: Easing Functions
lang: css
---

# Easing Functions

The same animation with different easing feels completely different. `ease-in-out` feels natural and physical. `linear` feels mechanical. `cubic-bezier()` gives you precise control. Easing is what separates polished UI animation from amateur motion.

## The built-in easing keywords

```html
<div class="easing-demo">
  <div class="ease-row"><span class="ease-label">linear</span><div class="ease-bar linear-bar"></div></div>
  <div class="ease-row"><span class="ease-label">ease</span><div class="ease-bar ease-bar-e"></div></div>
  <div class="ease-row"><span class="ease-label">ease-in</span><div class="ease-bar ease-in-bar"></div></div>
  <div class="ease-row"><span class="ease-label">ease-out</span><div class="ease-bar ease-out-bar"></div></div>
  <div class="ease-row"><span class="ease-label">ease-in-out</span><div class="ease-bar ease-in-out-bar"></div></div>
</div>
<p class="note">All bars move the same distance in the same time. The easing controls the velocity curve.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.easing-demo { background: #1e293b; padding: 16px; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.ease-row { display: flex; align-items: center; gap: 10px; }
.ease-label { color: #64748b; font-size: 11px; font-family: monospace; width: 90px; flex-shrink: 0; }
.ease-bar { width: 20px; height: 20px; background: #6366f1; border-radius: 4px; }
@keyframes move { from { transform: translateX(0); } to { transform: translateX(260px); } }
.linear-bar      { animation: move 2s linear infinite alternate; }
.ease-bar-e      { animation: move 2s ease infinite alternate; }
.ease-in-bar     { animation: move 2s ease-in infinite alternate; }
.ease-out-bar    { animation: move 2s ease-out infinite alternate; }
.ease-in-out-bar { animation: move 2s ease-in-out infinite alternate; }
.note { color: #64748b; font-size: 12px; background: #1e293b; padding: 10px 14px; border-radius: 8px; margin: 0; }
```

- `linear` — constant velocity. Good for progress bars, loading indicators.
- `ease` — starts fast, slows. The CSS default.
- `ease-in` — starts slow, ends fast. Good for elements leaving the screen.
- `ease-out` — starts fast, slows to stop. Good for elements entering the screen (feels natural, like deceleration).
- `ease-in-out` — slow start, fast middle, slow end. The most "physical" feel — like picking up and putting down an object.

**CS lens:** All easing functions are **cubic Bézier curves** — polynomial functions that map time (0→1) to progress (0→1). `ease-out` is `cubic-bezier(0, 0, 0.58, 1)`. The two control points define the shape of the velocity curve. A horizontal curve at the start = slow start. A horizontal curve at the end = slow finish.

## cubic-bezier() — custom easing

`cubic-bezier(x1, y1, x2, y2)` defines a custom curve with two control points. Values outside `[0,1]` for y allow overshoot (spring/bounce effect).

```html
<div class="bezier-demo">
  <div class="bz-row"><span class="bz-label">bounce out<br><small>cubic-bezier(0.34, 1.56, 0.64, 1)</small></span><div class="bz-bar bounce-bar"></div></div>
  <div class="bz-row"><span class="bz-label">snappy<br><small>cubic-bezier(0.23, 1, 0.32, 1)</small></span><div class="bz-bar snappy-bar"></div></div>
  <div class="bz-row"><span class="bz-label">anticipate<br><small>cubic-bezier(0.68, -0.55, 0.27, 1.55)</small></span><div class="bz-bar anticipate-bar"></div></div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.bezier-demo { background: #1e293b; padding: 16px; border-radius: 10px; display: flex; flex-direction: column; gap: 14px; }
.bz-row { display: flex; align-items: center; gap: 10px; }
.bz-label { color: #64748b; font-size: 11px; width: 160px; flex-shrink: 0; line-height: 1.4; }
.bz-label small { color: #475569; font-size: 10px; font-family: monospace; }
.bz-bar { width: 20px; height: 20px; background: #6366f1; border-radius: 4px; }
@keyframes bz-move { from { transform: translateX(0); } to { transform: translateX(140px); } }
.bounce-bar    { animation: bz-move 800ms cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate; }
.snappy-bar    { animation: bz-move 800ms cubic-bezier(0.23, 1, 0.32, 1) infinite alternate; background: #059669; }
.anticipate-bar{ animation: bz-move 800ms cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite alternate; background: #d97706; }
```

`y` values above 1 or below 0 create overshoot — the element moves past its target then springs back. This is what makes animations feel physical rather than mechanical. The "bounce" and "anticipate" effects are pure `cubic-bezier()`, no JavaScript.

## steps() — discrete animation

`steps(n, end)` divides the animation into `n` equal discrete jumps with no interpolation. Perfect for sprite sheets, typewriter effects, and any animation that should not look smooth.

```html
<div class="steps-demo">
  <div class="s-row">
    <span class="s-label">steps(4, end)</span>
    <div class="s-bar s-4"></div>
    <span class="s-note">4 discrete jumps</span>
  </div>
  <div class="s-row">
    <span class="s-label">steps(8, end)</span>
    <div class="s-bar s-8"></div>
    <span class="s-note">8 discrete jumps</span>
  </div>
  <div class="s-row">
    <span class="s-label">steps(1, start)</span>
    <div class="s-bar s-blink"></div>
    <span class="s-note">blink — cursor effect</span>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.steps-demo { background: #1e293b; padding: 16px; border-radius: 10px; display: flex; flex-direction: column; gap: 14px; }
.s-row { display: flex; align-items: center; gap: 10px; }
.s-label { color: #64748b; font-size: 11px; font-family: monospace; width: 120px; flex-shrink: 0; }
.s-note  { color: #475569; font-size: 11px; }
.s-bar { width: 20px; height: 20px; border-radius: 4px; }
@keyframes step-move { from { transform: translateX(0); } to { transform: translateX(120px); } }
@keyframes blink-op  { from { opacity: 1; } to { opacity: 0; } }
.s-4    { background: #6366f1; animation: step-move 2s steps(4, end) infinite; }
.s-8    { background: #059669; animation: step-move 2s steps(8, end) infinite; }
.s-blink{ width: 2px; height: 20px; background: #e2e8f0; animation: blink-op 1s steps(1, start) infinite; }
```

**SE lens:** The easing function is the subtlest but highest-impact design decision in motion. Framer Motion, GSAP, and Apple's iOS system animations all use `ease-out` for entering elements and `ease-in` for leaving elements. The principle: **entering should feel friendly (decelerating), leaving should feel efficient (accelerating)**. Linear is almost never the right choice for UI motion — it feels robotic because nothing in the physical world moves at constant velocity.

**Common mistakes:**
- Using `ease-in` for enter animations — starts slow, makes the UI feel sluggish.
- Using `ease-out` for exit animations — slows to a stop, elements don't feel like they've actually left.
- Using `cubic-bezier` with extreme values — subtle spring effects feel polished; obvious overshoot feels unprofessional.

**Debug tip:** Chrome DevTools shows an easing curve editor in the Animations panel. Click any animation and you can graphically edit the Bézier control points and see the effect in real time.

**Next:** UI micro-animations — the hover effects, skeleton loaders, progress bars, and toast notifications that make up professional UI.

## Challenge: easing

Add an animation with a custom cubic-bezier easing.

1. `@keyframes drop` — `from { transform: translateY(-30px); opacity: 0; }` to `to { transform: translateY(0); opacity: 1; }`
2. `.card` — `animation: drop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both`

```html
<div class="card" id="drop-card">
  <div style="font-size:1.5rem;">🎯</div>
  <div style="color:#e2e8f0; font-weight:700; margin-top:8px; font-size:14px;">Drop in</div>
</div>
```

```challenge
body { background: #0f172a; padding: 40px; font-family: system-ui; display: flex; justify-content: center; }

@keyframes drop {
  /* from / to keyframes */
}

.card {
  background: #1e293b;
  padding: 24px 32px;
  border-radius: 12px;
  text-align: center;
  /* add animation */
}
```

```test
var card = getComputedStyle(document.querySelector('.card'))
assert card.animationName === 'drop'
assert card.animationDuration === '600ms'
var rules = Array.from(document.styleSheets[0].cssRules)
var hasKeyframe = rules.some(r => r.constructor.name === 'CSSKeyframesRule')
assert hasKeyframe
var cssText = rules.map(r => r.cssText || '').join(' ')
assert cssText.includes('cubic-bezier')
```
