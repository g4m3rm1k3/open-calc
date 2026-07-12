---
series: css-animation
level: 1
title: CSS Transform
lang: css
---

# CSS Transform

Moving an element by changing `top` or `left` triggers a layout recalculation — the browser has to recompute positions for the entire affected region. On low-end devices this causes visible stuttering.

`transform` moves, scales, rotates, or skews an element without affecting document flow at all. Other elements don't shift. The browser can hand transform work to the GPU compositor, which runs independently of the main thread. This is why transform-based animations are smooth even when JavaScript is busy.

By the end of this lesson you will be able to use `translate`, `scale`, `rotate`, and `skew`, combine multiple transforms in one declaration, understand the transform origin, and know why `transform` is the right tool for smooth animation.

## The four transform functions

`translate`, `scale`, `rotate`, `skew` — each operates independently or combined.

```html
<div class="transform-grid">
  <div class="t-demo">
    <div class="box t-translate">translate</div>
    <div class="t-label">translateX(20px) translateY(-10px)</div>
  </div>
  <div class="t-demo">
    <div class="box t-scale">scale</div>
    <div class="t-label">scale(1.3) — 30% larger</div>
  </div>
  <div class="t-demo">
    <div class="box t-rotate">rotate</div>
    <div class="t-label">rotate(15deg)</div>
  </div>
  <div class="t-demo">
    <div class="box t-skew">skew</div>
    <div class="t-label">skewX(15deg)</div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.transform-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.t-demo { background: #1e293b; padding: 20px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.box { background: #6366f1; color: white; padding: 14px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; text-align: center; cursor: pointer; transition: transform 300ms ease; }
.t-label { color: #64748b; font-size: 11px; font-family: monospace; text-align: center; }
.t-translate:hover { transform: translateX(20px) translateY(-10px); }
.t-scale:hover     { transform: scale(1.3); }
.t-rotate:hover    { transform: rotate(15deg); }
.t-skew:hover      { transform: skewX(15deg); }
```

`translate` moves without affecting layout. `scale` sizes up/down from the transform origin. `rotate` spins around the transform origin (default: `center`). `skew` shears the element.

## transform-origin — the pivot point

The pivot point for `scale` and `rotate` defaults to the element's center. `transform-origin` changes it.

```html
<div class="origin-demo">
  <div class="origin-row">
    <div class="ob ob-center">center<br>(default)</div>
    <div class="ob ob-topleft">top left</div>
    <div class="ob ob-topright">top right</div>
    <div class="ob ob-bottom">bottom center</div>
  </div>
  <p class="onote">Hover to rotate. The dot shows the transform-origin.</p>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.origin-demo { background: #1e293b; padding: 20px; border-radius: 10px; }
.origin-row { display: flex; gap: 12px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap; }
.ob { background: #6366f1; color: white; padding: 14px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; text-align: center; line-height: 1.4; cursor: pointer; transition: transform 400ms ease; position: relative; }
.ob::after { content: '●'; position: absolute; color: #fbbf24; font-size: 10px; }
.ob-center::after   { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.ob-topleft::after  { top: 2px; left: 4px; }
.ob-topright::after { top: 2px; right: 4px; }
.ob-bottom::after   { bottom: 2px; left: 50%; transform: translateX(-50%); }
.ob-center:hover    { transform: rotate(20deg); transform-origin: center center; }
.ob-topleft:hover   { transform: rotate(20deg); transform-origin: top left; }
.ob-topright:hover  { transform: rotate(20deg); transform-origin: top right; }
.ob-bottom:hover    { transform: rotate(20deg); transform-origin: bottom center; }
.onote { color: #64748b; font-size: 12px; margin: 0; }
```

**CS lens:** `transform` operates on the element's **local coordinate system**. The browser applies the transform in the order written, right-to-left in the matrix multiplication sense. `translateX(20px) rotate(45deg)` is different from `rotate(45deg) translateX(20px)` — order matters because rotation changes the axis directions.

## Combining transforms — the card flip

Multiple transforms combine in one `transform` declaration. The classic "flip card" uses `rotateY(180deg)` with `perspective` and `backface-visibility`.

```html
<div class="flip-scene">
  <div class="flip-card">
    <div class="flip-front">
      <div class="flip-icon">🐍</div>
      <div class="flip-title">Python</div>
      <div class="flip-hint">Hover to flip</div>
    </div>
    <div class="flip-back">
      <div class="flip-desc">Learn Python from first principles. Variables, functions, classes, and professional tooling.</div>
      <div class="flip-cta">36 levels</div>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 40px; font-family: system-ui; display: flex; justify-content: center; }
.flip-scene { perspective: 600px; }
.flip-card {
  width: 220px; height: 160px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.flip-scene:hover .flip-card { transform: rotateY(180deg); }
.flip-front, .flip-back {
  position: absolute; inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 20px; box-sizing: border-box;
}
.flip-front { background: #1e293b; }
.flip-back  { background: #6366f1; transform: rotateY(180deg); }
.flip-icon  { font-size: 2rem; margin-bottom: 8px; }
.flip-title { color: #e2e8f0; font-size: 1rem; font-weight: 700; }
.flip-hint  { color: #475569; font-size: 11px; margin-top: 6px; }
.flip-desc  { color: white; font-size: 12px; line-height: 1.6; text-align: center; margin-bottom: 10px; }
.flip-cta   { background: white; color: #6366f1; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
```

`perspective` sets the 3D depth. `transform-style: preserve-3d` allows children to exist in 3D space. `backface-visibility: hidden` hides the back of each face when it's facing away. The back face starts at `rotateY(180deg)` so it's invisible at rest and visible when flipped.

**SE lens:** GPU acceleration: `transform` is composited on the GPU — the browser does not need to re-layout or re-paint when only `transform` or `opacity` changes. This is why animations using `transform` are always smoother than ones using `left`/`top`/`width`. The Chrome DevTools Performance panel labels frames that trigger layout as expensive (red); transform-only animations don't appear there.

**Common mistakes:**
- Combining `translate` with `left`/`top` — use only `transform: translate()` for positioned movement to keep animations GPU-accelerated.
- Forgetting `transform-style: preserve-3d` on the parent — 3D child transforms flatten without it.

**Debug tip:** Add `outline: 2px solid red` to the element during development to see that transforms move the element without affecting layout. Surrounding elements stay in place — unlike `margin` or `position`.

**Next:** `@keyframes` — defining multi-step animations that run on their own timeline, not triggered by state.

## Challenge: transform_hover

Apply multiple transforms on hover.

1. `.card` — `transition: transform 300ms ease`
2. `.card:hover` — `transform: translateY(-6px) scale(1.03)`

```html
<div class="card" id="transform-card">
  <div style="font-size:2rem;">⚡</div>
  <div style="color:#e2e8f0; font-weight:700; margin-top:8px;">JavaScript</div>
</div>
```

```challenge
body { background: #0f172a; padding: 40px; font-family: system-ui; display: flex; justify-content: center; }

.card {
  background: #1e293b;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  /* add transition */
}

.card:hover {
  /* add transform */
}
```

```test
var card = getComputedStyle(document.querySelector('.card'))
assert card.transition.includes('transform') || card.transitionProperty.includes('transform')
assert parseFloat(card.transitionDuration) > 0
var rules = Array.from(document.styleSheets[0].cssRules)
var cssText = rules.map(r => r.cssText || '').join(' ')
assert cssText.includes('translateY')
assert cssText.includes('scale')
assert getComputedStyle(document.querySelector('.card')).borderRadius !== '0px'
```
