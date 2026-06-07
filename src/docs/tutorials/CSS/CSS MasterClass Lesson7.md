# CSS Masterclass — Lesson 7: Transitions, Animations & Motion

---

## 1. `transition` — Smooth State Changes

```css
transition: property duration easing delay;

/* Single property */
.btn { transition: background-color 200ms ease; }

/* Multiple properties */
.card { transition: transform 200ms ease, box-shadow 200ms ease; }

/* All properties (lazy, avoid in production — can transition unexpected things) */
.el { transition: all 200ms ease; }

/* With delay */
.menu-item { transition: opacity 200ms ease 100ms; }
```

**The shorthand variable pattern:**

```css
:root {
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn { transition: background var(--transition-fast), transform var(--transition-fast); }
```

---

## 2. Easing Functions

Easing controls the acceleration curve of the transition.

```css
/* Keywords */
ease           /* slow → fast → slow (default, natural) */
ease-in        /* slow start, fast end (entering feels heavy) */
ease-out       /* fast start, slow end (exiting feels gentle) */
ease-in-out    /* slow → fast → slow (symmetrical) */
linear         /* constant speed (use for spinning loaders) */
step-start     /* instant jump at start */
step-end       /* instant jump at end */
steps(4, end)  /* 4 discrete steps */

/* Custom cubic-bezier — use https://cubic-bezier.com to design */
cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* ease-out-quart — very smooth */
cubic-bezier(0.34, 1.56, 0.64, 1)     /* spring overshoot */
cubic-bezier(0.22, 1, 0.36, 1)        /* ease-out-expo — snappy UI feel */

/* Modern: linear() for spring-like custom curves */
linear(0, 0.5 15%, 1.02 40%, 1 100%)  /* overshoot, then settle */
```

**Easing rules of thumb:**
- **Hover states**: `ease-out` — things that appear should decelerate
- **Dismissals**: `ease-in` — things that leave should accelerate out
- **Page load animations**: `ease-out` or custom cubic-bezier
- **Spinners/loaders**: `linear`
- **Bouncy UI**: spring cubic-bezier

---

## 3. What to Transition (Performance Rules)

Only transition **compositor-friendly** properties to avoid layout/paint:

| ✅ Cheap (compositor-only) | ❌ Expensive (causes layout) |
|---------------------------|------------------------------|
| `transform` | `width`, `height` |
| `opacity` | `margin`, `padding` |
| `filter` | `top`, `left`, `right`, `bottom` |
| `backdrop-filter` | `font-size` |
| `clip-path` | `border-width` |
| `background-color` (repaint) | `border-radius` (heavy) |

```css
/* Wrong — causes layout recalculation on every frame */
.card:hover { width: 220px; top: -5px; }

/* Right — GPU composited */
.card:hover { transform: scale(1.02) translateY(-5px); }
```

---

## 4. Common Transition Patterns

### Hover lift card

```css
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgb(0 0 0 / 0.15);
}
```

### Button press

```css
.btn {
  transition: transform 100ms ease, box-shadow 100ms ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}
.btn:active {
  transform: translateY(0);
  box-shadow: none;
}
```

### Smooth focus ring

```css
.input {
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 150ms ease, box-shadow 150ms ease;
}
.input:focus {
  outline-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgb(59 130 246 / 0.2);
}
```

### Color fade on hover

```css
.link {
  color: var(--color-text);
  transition: color 150ms ease;
}
.link:hover { color: var(--color-accent); }
```

### Sliding underline

```css
.nav-link {
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-accent);
  transition: width 200ms ease-out;
}
.nav-link:hover::after { width: 100%; }
```

---

## 5. `@keyframes` — CSS Animations

Animations repeat, loop, and don't need a trigger state.

```css
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Multiple percentage stops */
@keyframes bounce-in {
  0%   { transform: scale(0.3); opacity: 0; }
  50%  { transform: scale(1.05); opacity: 0.9; }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Applying animations

```css
animation: name duration easing delay iteration-count direction fill-mode;

.spinner { animation: spin 1s linear infinite; }

.card {
  animation: slide-up 400ms ease-out both;
  /* 'both' = hold first keyframe before, hold last keyframe after */
}

/* Staggered entrance */
.item:nth-child(1) { animation: slide-up 300ms ease-out 0ms both; }
.item:nth-child(2) { animation: slide-up 300ms ease-out 60ms both; }
.item:nth-child(3) { animation: slide-up 300ms ease-out 120ms both; }
```

### Animation properties in detail

```css
animation-name: slide-up;
animation-duration: 400ms;
animation-timing-function: ease-out;
animation-delay: 100ms;
animation-iteration-count: 1 | infinite | 3;
animation-direction: normal | reverse | alternate | alternate-reverse;
animation-fill-mode: none | forwards | backwards | both;
/* forwards = keep last keyframe state after animation ends */
/* backwards = apply first keyframe state during delay period */
/* both = both forwards and backwards */
animation-play-state: running | paused;
```

---

## 6. Staggered Animations with CSS Custom Properties

```css
.item {
  animation: fade-up 400ms ease-out calc(var(--i) * 60ms) both;
}
```

```html
<div class="item" style="--i: 0">First</div>
<div class="item" style="--i: 1">Second</div>
<div class="item" style="--i: 2">Third</div>
```

Or with `:nth-child` for fixed lists:

```css
.list-item { animation: fade-up 400ms ease-out both; }
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 80ms; }
.list-item:nth-child(3) { animation-delay: 160ms; }
.list-item:nth-child(4) { animation-delay: 240ms; }
```

---

## 7. `animation-timeline` — Scroll-Driven Animations

Modern CSS: animations that progress based on scroll position.

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}

.section {
  animation: reveal linear both;
  animation-timeline: view();          /* based on element's scroll position in viewport */
  animation-range: entry 0% entry 40%; /* play during entry, complete at 40% into view */
}
```

```css
/* Progress bar tied to page scroll */
.progress-bar {
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  background: var(--color-accent);
  transform-origin: left;
  animation: grow linear;
  animation-timeline: scroll(root block);
}
@keyframes grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

---

## 8. `will-change` — Performance Hints

```css
/* Tell the browser to create a GPU layer for this element */
.animated-card { will-change: transform; }

/* Remove after animation finishes — don't set permanently */
.card.animating  { will-change: transform, opacity; }
.card.done       { will-change: auto; }
```

> Only use `will-change` on elements you know will animate. Overuse wastes GPU memory.

---

## 9. Respecting User Preferences

Always wrap non-essential animations in this media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Or target specific animations */
@media (prefers-reduced-motion: no-preference) {
  .fancy-animation {
    animation: bounce-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
}
```

---

## 10. Useful Keyframe Library

```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Fade in up */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Fade in scale */
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

/* Slide in from right */
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

/* Skeleton loading shimmer */
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}
.skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 0.7s linear infinite; }

/* Ping (notification badge) */
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
.badge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: inherit;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

---

## Quick Reference Card

```
Transition:
  transition: property duration easing delay
  transition: transform 200ms ease-out, opacity 200ms ease-out
  Cheap: transform, opacity, filter
  Expensive: width, height, margin, top/left

Easing:
  ease-out     → elements appearing
  ease-in      → elements leaving
  linear       → spinners
  cubic-bezier(0.22, 1, 0.36, 1)  → snappy UI

Animation:
  @keyframes name { from {} to {} }
  animation: name duration easing delay count direction fill-mode
  animation-fill-mode: both  (almost always use this)
  animation-play-state: paused / running

Stagger:
  animation-delay: calc(var(--i) * 60ms)

Always add:
  @media (prefers-reduced-motion: reduce) { 
    /* kill animations for accessibility */ 
  }
```

---
