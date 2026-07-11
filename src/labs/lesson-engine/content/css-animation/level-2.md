---
series: css-animation
level: 2
title: keyframe Animations
lang: css
---

# @keyframes Animations

Transitions animate between two states when a property changes. `@keyframes` animations run on their own timeline — they start automatically, can loop, can pause, and can define as many steps as needed. They're the tool for loaders, reveals, and continuous motion.

## Defining a keyframe animation

`@keyframes name { from { } to { } }` defines the animation. `animation` property on an element runs it.

```html
<div class="anim-demo">
  <div class="pulse-box">Pulse</div>
  <div class="slide-box">Slide in</div>
  <div class="fade-box">Fade in</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.anim-demo { display: flex; gap: 12px; flex-wrap: wrap; }

@keyframes pulse {
  from { transform: scale(1); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
  to   { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(99,102,241,0); }
}
@keyframes slide-in {
  from { transform: translateX(-40px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.pulse-box {
  background: #6366f1; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 700;
  animation: pulse 1s ease-in-out infinite alternate;
}
.slide-box {
  background: #059669; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 700;
  animation: slide-in 600ms ease both;
}
.fade-box {
  background: #d97706; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 700;
  animation: fade-in 1s ease 300ms both;
}
```

The `animation` shorthand: `name duration easing delay iteration-count direction fill-mode`. `both` fill-mode applies the first keyframe before the animation starts and the last keyframe after it ends — this prevents a flash of unstyled content at the start.

## Multi-step keyframes with percentages

`from/to` is shorthand for `0%/100%`. Use percentages for more than two steps.

```html
<div class="steps-demo">
  <div class="traffic-light">
    <div class="light-bulb" id="tl-light"></div>
    <div class="tl-label">Traffic light — 3 steps</div>
  </div>
  <div class="loading-bar-wrap">
    <div class="loading-bar" id="lb"></div>
    <div class="tl-label">Loading bar — 4 steps</div>
  </div>
  <div class="type-wrap">
    <div class="typed-text" id="typed">Hello World</div>
    <div class="tl-label">Typewriter — 2 steps</div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.steps-demo { display: flex; gap: 16px; flex-wrap: wrap; }
@keyframes traffic {
  0%   { background: #dc2626; box-shadow: 0 0 16px #dc2626; }
  33%  { background: #d97706; box-shadow: 0 0 16px #d97706; }
  66%  { background: #059669; box-shadow: 0 0 16px #059669; }
  100% { background: #dc2626; box-shadow: 0 0 16px #dc2626; }
}
@keyframes load {
  0%   { width: 0%; }
  30%  { width: 45%; }
  70%  { width: 70%; }
  100% { width: 100%; }
}
@keyframes type {
  from { width: 0; }
  to   { width: 100%; }
}
.traffic-light { background: #1e293b; padding: 16px 24px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.light-bulb { width: 40px; height: 40px; border-radius: 50%; animation: traffic 3s step-start infinite; }
.loading-bar-wrap { background: #1e293b; padding: 16px 20px; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; width: 160px; }
.loading-bar { height: 8px; background: #6366f1; border-radius: 4px; animation: load 2s ease-in-out infinite; }
.type-wrap { background: #1e293b; padding: 16px 20px; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; }
.typed-text { color: #e2e8f0; font-family: monospace; font-size: 14px; overflow: hidden; white-space: nowrap; border-right: 2px solid #6366f1; animation: type 2s steps(11, end) infinite; }
.tl-label { color: #64748b; font-size: 11px; text-align: center; }
```

**CS lens:** `@keyframes` defines a **timeline** — a function from `[0, 1]` to property values, interpolated by the easing function. The browser calculates the value at each frame by interpolating between the adjacent keyframes. `steps(n, end)` is a special easing that jumps in `n` discrete steps — used for sprite sheet animations and typewriter effects.

## animation shorthand breakdown

Each animation sub-property in detail:

```html
<div class="breakdown-demo">
  <div class="bd-box" style="animation-name: slide-demo; animation-duration: 1s; animation-timing-function: ease-out; animation-delay: 0s; animation-iteration-count: infinite; animation-direction: alternate; animation-fill-mode: both;">Bounce alternating</div>
  <div class="bd-box" style="animation: slide-demo 800ms ease-in 0s 3 normal both;">3 times, ease-in</div>
  <div class="bd-box" style="animation: slide-demo 600ms linear 500ms infinite reverse both;">Infinite reverse</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
@keyframes slide-demo {
  from { transform: translateX(0); background: #6366f1; }
  to   { transform: translateX(40px); background: #8b5cf6; }
}
.breakdown-demo { display: flex; flex-direction: column; gap: 20px; }
.bd-box { color: white; padding: 14px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; display: inline-block; }
```

`animation-direction: alternate` — plays forward then backward. `animation-fill-mode: both` — element holds the `from` styles before start and `to` styles after finish. `animation-iteration-count: infinite` — loops forever.

**SE lens:** Animation is a communication tool, not decoration. Good animation tells the user what happened: a card "flying in" means it just loaded. A button "bouncing" means the form failed. Bad animation — random transitions with no semantic purpose — is noise. The rule in production design systems: every animation should answer a question the user is implicitly asking ("did my click do something?", "is data loading?", "where did that element go?").

**Common mistakes:**
- Not setting `animation-fill-mode: both` — the element snaps back to its original state the instant the animation ends.
- Animating properties other than `transform` and `opacity` in keyframe animations — `width`, `height`, `margin` animations trigger layout on every frame, causing jank.

**Debug tip:** Chrome DevTools → Animations panel shows every `@keyframes` animation, its timeline, duration, and easing. You can pause, scrub, and replay any animation directly in DevTools without touching the code.

**Next:** Easing functions — `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`, and `steps()`. The same animation with different easing feels completely different.

## Challenge: keyframe_spin

Create a spinning loader animation.

1. `@keyframes spin` — `from { transform: rotate(0deg) }` to `to { transform: rotate(360deg) }`
2. `.loader` — `animation: spin 1s linear infinite`

```html
<div class="loader-wrap">
  <div class="loader" id="spin-loader"></div>
</div>
```

```challenge
body { background: #0f172a; padding: 40px; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 200px; }
.loader-wrap { display: flex; align-items: center; justify-content: center; }

@keyframes spin {
  /* define keyframes */
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #334155;
  border-top-color: #6366f1;
  border-radius: 50%;
  /* add animation */
}
```

```test
var loader = getComputedStyle(document.querySelector('.loader'))
assert loader.animationName === 'spin'
assert loader.animationDuration === '1s'
assert loader.animationIterationCount === 'infinite'
var rules = Array.from(document.styleSheets[0].cssRules)
var hasKeyframe = rules.some(r => r.constructor.name === 'CSSKeyframesRule')
assert hasKeyframe
```
