---
series: css-professional
level: 4
title: Scroll-Driven Animations
lang: css
---

# Scroll-Driven Animations

The standard approach to scroll-based animation — listen for `scroll` events, calculate position, update styles via JavaScript — runs on the main thread. That means every scroll event can cause a frame drop if the handler does meaningful work. Libraries like GSAP ScrollTrigger and Intersection Observer exist to mitigate this, but they're still JavaScript running on the main thread.

`animation-timeline: scroll()` moves the entire calculation into the browser's compositor. The scroll offset drives animation progress directly — no event listeners, no `requestAnimationFrame`, no JavaScript at all. The browser handles it at the same level as GPU-composited transforms.

By the end of this lesson you will understand `animation-timeline` and `animation-range`, be able to build a scroll progress bar and reveal-on-scroll effects in pure CSS, and know the current browser support status of scroll-driven animations.

## animation-timeline: scroll()

```html
<div class="scroll-demo-wrapper">
  <div class="scroll-progress-bar" id="progress-bar"></div>
  <div class="scroll-content">
    <div class="scroll-section">Section 1 — Scroll down to see the progress bar fill</div>
    <div class="scroll-section">Section 2 — The progress bar is driven by scroll, not JavaScript</div>
    <div class="scroll-section">Section 3 — No JS event listeners, no rAF, just CSS</div>
    <div class="scroll-section">Section 4 — Works at 60fps even on the main thread</div>
  </div>
</div>
```

```css
.scroll-demo-wrapper { position: relative; height: 300px; overflow-y: scroll; border: 1px solid #e2e8f0; border-radius: 10px; }

/* The progress bar animates based on the wrapper's scroll position */
.scroll-progress-bar {
  position: sticky;
  top: 0;
  left: 0;
  height: 3px;
  background: #6366f1;
  transform-origin: left;
  /* Link this animation to the scroll timeline of the nearest scrolling ancestor */
  animation: grow-bar linear;
  animation-timeline: scroll();
  z-index: 10;
}

@keyframes grow-bar {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

.scroll-content { padding: 1rem; display: flex; flex-direction: column; gap: 2rem; }
.scroll-section  { padding: 2rem; background: #f8fafc; border-radius: 8px; font-family: system-ui, sans-serif; font-size: 0.9rem; color: #475569; text-align: center; }
```

**CS lens:** `animation-timeline: scroll()` creates a **scroll progress timeline** — a value that goes from 0 to 1 as the user scrolls from top to bottom of the scroll container. The animation's progress is driven by this value instead of by time. The browser computes this on the compositor thread, meaning it doesn't block JavaScript or layout — that's why it's smoother than most JavaScript scroll handlers.

## animation-timeline: view()

```html
<div class="view-demo">
  <p class="view-intro">Scroll down — each card fades in as it enters the viewport</p>
  <div class="view-card">Card 1 — appears as it enters view</div>
  <div class="view-card">Card 2 — each card animates independently</div>
  <div class="view-card">Card 3 — no IntersectionObserver needed</div>
  <div class="view-card">Card 4 — pure CSS scroll-driven animation</div>
</div>
```

```css
.view-demo {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 1rem;
  font-family: system-ui, sans-serif;
}
.view-intro { color: #6b7280; font-size: 0.875rem; text-align: center; }

/* Each card animates based on its position in the viewport */
.view-card {
  padding: 2rem;
  background: #6366f1;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;

  animation: fade-slide-in linear both;
  /* view() tracks the element's position relative to the viewport */
  animation-timeline: view();
  /* Only animate during the 'entry' phase (element entering from bottom) */
  animation-range: entry 0% entry 40%;
}

@keyframes fade-slide-in {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

## Scroll-driven parallax

```html
<div class="parallax-wrapper">
  <div class="parallax-bg"></div>
  <div class="parallax-content">
    <h2>Parallax Header</h2>
    <p>The background moves at a different rate to the content as you scroll.</p>
  </div>
</div>
<div class="after-section">Content continues below the parallax section.</div>
```

```css
.parallax-wrapper {
  position: relative;
  height: 280px;
  overflow: hidden;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
}

.parallax-bg {
  position: absolute;
  inset: -50px 0;                 /* extra height for parallax travel */
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);

  animation: parallax-move linear;
  animation-timeline: scroll(root);  /* tied to the page scroll */
}

@keyframes parallax-move {
  from { transform: translateY(-30px); }
  to   { transform: translateY(30px); }
}

.parallax-content {
  position: relative;
  z-index: 1;
  padding: 3rem 2rem;
  color: white;
  text-align: center;
}
.parallax-content h2 { margin: 0 0 0.5rem; font-size: 1.5rem; }
.parallax-content p  { margin: 0; opacity: 0.85; font-size: 0.9rem; }
.after-section { padding: 2rem; text-align: center; color: #475569; font-family: system-ui, sans-serif; font-size: 0.875rem; }
```

**SE lens:** Before scroll-driven animations, the IntersectionObserver API was the best tool for "animate when element enters viewport." It requires 20-40 lines of JavaScript, must be initialized after the DOM is ready, adds overhead for each observed element, and can produce frame drops on scroll because it fires on the main thread. Scroll-driven animations replace this with 3 CSS properties. The trade-off: browser support is not yet universal (check caniuse.com before using in production).

**Common mistakes:**
- Using `scroll()` when you mean `view()` — `scroll()` tracks the scroll container's overall position (0% = top, 100% = bottom). `view()` tracks where the specific element is in the viewport (useful for reveal-on-scroll effects).
- Forgetting `animation-fill-mode: both` (or using the `both` keyword in animation shorthand) — without it, the animation resets to its starting state before it plays, causing a flash.

**Debug tip:** In Chrome DevTools, the Animations panel shows scroll-driven animations and lets you scrub through them manually — like a timeline editor. Open DevTools → More tools → Animations.

**Next:** `@property` — typed CSS custom properties with animation support.

## Challenge: scroll_reveal

Set up a scroll-driven reveal animation for an element.

```html
<div style="height:200px; overflow-y:scroll; border:1px solid #e2e8f0; border-radius:8px; padding:1rem;">
  <div style="height:150px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-family:system-ui; font-size:0.875rem;">Scroll down...</div>
  <div id="reveal-target" class="reveal-box">I appear on scroll!</div>
</div>
```

```css
.reveal-box {
  padding: 2rem;
  background: #6366f1;
  color: white;
  border-radius: 10px;
  font-family: system-ui, sans-serif;
  font-weight: 600;
  text-align: center;
  animation: reveal-fade linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 60%;
}
@keyframes reveal-fade {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

```test
const box = document.querySelector('.reveal-box')
assert box !== null
const style = getComputedStyle(box)
assert style.animationName !== 'none'
assert style.borderRadius !== '0px'
assert style.backgroundColor !== 'transparent'
```
