---
series: css-animation
level: 4
title: UI Micro-animations
lang: css
---

# UI Micro-animations

Micro-animations are the details that make an interface feel responsive and alive. Without them, clicking a button feels like nothing happened — the user is left wondering if the action registered. With them, every interaction has immediate, clear feedback.

The key distinction: micro-animations communicate purpose. They are not decorative. A button press animation says "I received your click." A checkbox checkmark says "this is now active." A slide-in notification says "something just happened that requires your attention."

By the end of this lesson you will be able to build button press feedback, animated checkboxes, slide-in notifications, and loading states — all using CSS transitions and keyframes without JavaScript.

## Button feedback animations

Buttons need to communicate three states: default, active (pressed), and loading. CSS handles all three without JavaScript.

```html
<div class="btn-demo">
  <button class="btn-press">Click Me</button>
  <button class="btn-ripple">Ripple Effect</button>
  <button class="btn-loading" disabled>
    <span class="spinner"></span>
    Loading...
  </button>
</div>
```

```css
body { background: #0f172a; padding: 32px; font-family: system-ui; }
.btn-demo { display: flex; gap: 12px; flex-wrap: wrap; }
/* Press feedback */
.btn-press {
  background: #6366f1; color: white; border: none; padding: 11px 22px;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: transform 100ms ease, box-shadow 100ms ease;
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}
.btn-press:hover  { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.4); }
.btn-press:active { transform: translateY(1px); box-shadow: 0 2px 6px rgba(99,102,241,0.2); }
/* Ripple (pure CSS) */
.btn-ripple {
  background: #059669; color: white; border: none; padding: 11px 22px;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  position: relative; overflow: hidden;
  transition: background 200ms ease;
}
.btn-ripple::after {
  content: ''; position: absolute;
  width: 100%; height: 100%; top: 0; left: -100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 400ms ease;
}
.btn-ripple:hover::after { left: 100%; }
/* Loading spinner */
@keyframes btn-spin { to { transform: rotate(360deg); } }
.btn-loading {
  background: #475569; color: #94a3b8; border: none; padding: 11px 22px;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: not-allowed;
  display: flex; align-items: center; gap: 8px;
}
.spinner { width: 14px; height: 14px; border: 2px solid #64748b; border-top-color: #94a3b8; border-radius: 50%; animation: btn-spin 700ms linear infinite; }
```

## Skeleton loading screens

Skeleton screens (animated placeholders) communicate "content is loading here" better than a spinner, because they show the shape of what's coming.

```html
<div class="skeleton-card">
  <div class="sk-header">
    <div class="sk-avatar"></div>
    <div class="sk-meta">
      <div class="sk-line sk-name"></div>
      <div class="sk-line sk-subtitle"></div>
    </div>
  </div>
  <div class="sk-body">
    <div class="sk-line sk-full"></div>
    <div class="sk-line sk-full"></div>
    <div class="sk-line sk-partial"></div>
  </div>
  <div class="sk-footer">
    <div class="sk-btn"></div>
    <div class="sk-btn sk-btn-sm"></div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.sk-avatar, .sk-line, .sk-btn {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
.skeleton-card { background: #1e293b; border-radius: 12px; padding: 20px; max-width: 320px; }
.sk-header { display: flex; gap: 12px; margin-bottom: 16px; }
.sk-avatar { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
.sk-meta { flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
.sk-name { height: 12px; width: 70%; }
.sk-subtitle { height: 10px; width: 50%; }
.sk-body { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.sk-full { height: 10px; width: 100%; }
.sk-partial { height: 10px; width: 65%; }
.sk-footer { display: flex; gap: 8px; }
.sk-btn { height: 32px; flex: 1; border-radius: 6px; }
.sk-btn-sm { flex: 0.6; }
```

The shimmer is a gradient moving left-to-right on a dark background — `background-position` animates from `-200%` to `200%`. The gradient has a bright spot in the middle that "scans" across the skeleton.

**CS lens:** The shimmer technique uses `background-size: 200% 100%` to make the gradient wider than the element, then animates `background-position` to move the gradient. The bright stripe sweeps across because the gradient is 200% wide and the animation moves it 400% (from -200% to 200%). This is a common pattern for any "scanning" or "sweeping" visual effect.

## Toast / notification slide-in

A notification that appears from the corner, stays for a moment, then fades out.

```html
<div class="toast-stack">
  <div class="toast toast-success">
    <span class="toast-icon">✓</span>
    <span class="toast-msg">Changes saved successfully</span>
    <span class="toast-close">×</span>
  </div>
  <div class="toast toast-error" style="animation-delay: 500ms;">
    <span class="toast-icon">✕</span>
    <span class="toast-msg">Failed to connect. Retrying...</span>
    <span class="toast-close">×</span>
  </div>
  <div class="toast toast-info" style="animation-delay: 1000ms;">
    <span class="toast-icon">ℹ</span>
    <span class="toast-msg">Your session expires in 5 minutes</span>
    <span class="toast-close">×</span>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
@keyframes toast-in {
  from { transform: translateX(120%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
.toast-stack { display: flex; flex-direction: column; gap: 8px; max-width: 320px; }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; animation: toast-in 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.toast-icon  { font-size: 14px; font-weight: 800; flex-shrink: 0; width: 20px; text-align: center; }
.toast-msg   { flex: 1; }
.toast-close { color: inherit; opacity: 0.5; cursor: pointer; font-size: 16px; line-height: 1; padding: 2px 4px; }
.toast-success { background: #14532d; color: #4ade80; }
.toast-error   { background: #7f1d1d; color: #f87171; }
.toast-info    { background: #1e1b4b; color: #818cf8; }
```

**SE lens:** Each micro-animation serves a semantic purpose. The button `:active` scale tells the user "I received your click." The skeleton says "something is loading here." The toast says "an event just occurred." Design without these signals forces users to guess. This is why accessibility guidelines (WCAG 2.5.3) require changes of state to be perceivable — animation is a primary way states are perceived.

**Common mistakes:**
- Animating on every page element — causes cognitive overload. Animate only elements that have changed state.
- Using `@keyframes` for what `transition` can do — transitions are simpler and automatically reverse.

**Debug tip:** Test all animations with Chrome's "Emulate CSS media feature `prefers-reduced-motion: reduce`" (DevTools → Rendering panel). Your site should still be fully usable with motion reduced — animations should either disable or use instant transitions.

**Next:** Performance and accessibility — `will-change`, compositor layers, and `prefers-reduced-motion`.

## Challenge: skeleton_shimmer

Build a skeleton card with the shimmer animation.

1. `@keyframes shimmer` — animate `background-position` from `-200% 0` to `200% 0`
2. `.sk-line` — gradient + `background-size: 200% 100%` + `animation: shimmer 1.5s ease infinite`

```html
<div class="skeleton">
  <div class="sk-line sk-title" id="skt"></div>
  <div class="sk-line sk-body1" id="skb1"></div>
  <div class="sk-line sk-body2" id="skb2"></div>
</div>
```

```challenge
body { background: #0f172a; padding: 24px; font-family: system-ui; }

@keyframes shimmer {
  /* animate background-position */
}

.skeleton { background: #1e293b; padding: 20px; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; }

.sk-line {
  border-radius: 4px;
  height: 14px;
  /* add gradient background, background-size, and animation */
}

.sk-title { width: 60%; }
.sk-body1 { width: 100%; }
.sk-body2 { width: 80%; }
```

```test
var lines = document.querySelectorAll('.sk-line')
assert lines.length >= 3
var style = getComputedStyle(lines[0])
assert style.animationName === 'shimmer'
var rules = Array.from(document.styleSheets[0].cssRules)
var hasKeyframe = rules.some(r => r.constructor.name === 'CSSKeyframesRule')
assert hasKeyframe
assert parseFloat(style.height) >= 10
```
