---
series: css-animation
level: 6
title: Performance and Accessibility
lang: css
---

# Performance and Accessibility

Animation that looks great but causes frame drops or ignores user preferences is broken. This level covers the two non-negotiable constraints: keeping animations on the GPU compositor, and respecting `prefers-reduced-motion`.

## What the browser does to render animation

The browser rendering pipeline: Style → Layout → Paint → Composite. Animations that only change `transform` and `opacity` skip Layout and Paint — they run entirely on the compositor thread (GPU). Everything else triggers the full pipeline on every frame.

```html
<div class="perf-demo">
  <div class="perf-card">
    <div class="perf-label bad-label">❌ Slow — triggers layout</div>
    <div class="bad-box">width changes</div>
    <code class="perf-code">left, width, height, margin, padding</code>
    <p class="perf-note">Causes re-layout every frame. 60fps is almost impossible for complex pages.</p>
  </div>
  <div class="perf-card">
    <div class="perf-label good-label">✓ Fast — compositor only</div>
    <div class="good-box">transform moves</div>
    <code class="perf-code">transform: translate / scale / rotate, opacity</code>
    <p class="perf-note">Runs on the GPU. Layout is not recomputed. Smooth at 60fps even on mobile.</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.perf-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.perf-card { background: #1e293b; padding: 14px; border-radius: 10px; }
.perf-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
.bad-label  { color: #f87171; }
.good-label { color: #4ade80; }
@keyframes bad-anim  { from { width: 60px; } to { width: 140px; } }
@keyframes good-anim { from { transform: translateX(0); } to { transform: translateX(80px); } }
.bad-box  { background: #7f1d1d; color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 8px; animation: bad-anim 1s ease-in-out infinite alternate; }
.good-box { background: #14532d; color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 8px; width: 80px; animation: good-anim 1s ease-in-out infinite alternate; }
.perf-code { display: block; background: #0f172a; color: #818cf8; padding: 8px; border-radius: 4px; font-size: 10px; margin-bottom: 8px; }
.perf-note { color: #64748b; font-size: 11px; line-height: 1.5; margin: 0; }
```

**The rule:** only animate `transform` and `opacity` in production animations. For everything else — size, position, colors — use transitions for occasional state changes, not continuous keyframe animations.

## will-change — hinting the GPU

`will-change: transform` tells the browser to promote the element to its own compositor layer before the animation starts, avoiding a "first-frame jank" where the element pauses briefly as the browser promotes it mid-animation.

```html
<div class="will-change-demo">
  <div class="wc-card wc-without">
    <div class="wc-label">Without will-change</div>
    <div class="wc-box wc-no">Animates</div>
    <p class="wc-note">Browser promotes to compositor layer when animation starts. First frame may stutter.</p>
  </div>
  <div class="wc-card wc-with">
    <div class="wc-label">With will-change: transform</div>
    <div class="wc-box wc-yes">Animates</div>
    <p class="wc-note">Browser promotes the layer before animation starts. No first-frame jank.</p>
  </div>
  <div class="wc-card wc-warn">
    <div class="wc-label">⚠ Don't overuse</div>
    <p class="wc-note">Every will-change creates a new compositor layer. Too many layers consume GPU memory. Only add will-change to elements that actually animate, and remove it after animation ends.</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.will-change-demo { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.wc-card { background: #1e293b; padding: 14px; border-radius: 10px; }
.wc-label { color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
@keyframes wc-move { from { transform: translateX(0); } to { transform: translateX(30px); } }
.wc-box { color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 8px; animation: wc-move 1s ease-in-out infinite alternate; }
.wc-no  { background: #475569; }
.wc-yes { background: #6366f1; will-change: transform; }
.wc-note { color: #64748b; font-size: 11px; line-height: 1.5; margin: 0; }
.wc-warn { background: #1c1200; }
```

## prefers-reduced-motion — accessibility

Some users experience nausea, seizures, or distraction from animation. The `prefers-reduced-motion` media query reads the operating system's "reduce motion" setting. Respecting it is not optional — it is an accessibility requirement.

```html
<div class="motion-demo">
  <div class="animated-card">
    <div class="spin-icon">⚡</div>
    <div class="card-title">Animated Card</div>
    <p class="card-body">This card has entrance animation and a spinning icon. With reduced motion, the animation is instant and the spin is removed. The content is identical.</p>
    <button class="card-btn">Start Course</button>
  </div>
  <div class="motion-note">
    <p><strong>CSS used:</strong></p>
    <code>@media (prefers-reduced-motion: reduce) {<br>
    &nbsp;&nbsp;* { animation-duration: 0.01ms !important; }<br>
    &nbsp;&nbsp;* { transition-duration: 0.01ms !important; }<br>
    }</code>
    <p>This is the nuclear option — it disables all animations sitewide. Apply it in your global CSS as a safety net, then fine-tune per component.</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
@keyframes card-entrance { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes icon-spin { to { transform: rotate(360deg); } }
.motion-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.animated-card { background: #1e293b; border-radius: 12px; padding: 20px; animation: card-entrance 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.spin-icon  { font-size: 2rem; display: inline-block; animation: icon-spin 2s linear infinite; margin-bottom: 10px; }
.card-title { color: #e2e8f0; font-weight: 700; font-size: 1rem; margin-bottom: 8px; }
.card-body  { color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 14px; }
.card-btn   { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
.motion-note { background: #1e293b; border-radius: 12px; padding: 20px; }
.motion-note p { color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 10px; }
.motion-note strong { color: #e2e8f0; }
.motion-note code { display: block; background: #0f172a; color: #86efac; padding: 12px; border-radius: 6px; font-size: 11px; line-height: 1.6; }
/* Respect the user's motion preference */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

`prefers-reduced-motion: reduce` fires when the user has enabled "Reduce Motion" in their OS. The CSS above sets all animation durations to `0.01ms` (effectively instant) with `!important` as a global override. This is the recommended approach from the Web Content Accessibility Guidelines (WCAG 2.1, criterion 2.3.3).

**SE lens:** Animation accessibility was ignored for a decade in web development. WCAG 2.1 (2018) formalized `prefers-reduced-motion` support as a guideline. Major companies now require it: Apple's Human Interface Guidelines, Google's Material Design, and GitHub's Primer design system all mandate checking this preference. The two lines of CSS above are not nice-to-have — they are the difference between a site that works for everyone and one that makes some users sick.

**Common mistakes:**
- Adding `will-change: transform` to every element — this creates hundreds of compositor layers, consuming GPU memory and making performance worse. Use it only on elements that animate frequently.
- Not testing `prefers-reduced-motion` — enable it in your OS settings and test your site. Users who need it have no other option.

**Debug tip:** In Chrome DevTools → Rendering panel → check "Emulate CSS media feature prefers-reduced-motion: reduce". Test that your site is fully usable with all animation disabled.

**Congratulations — CSS Animation complete!** You've covered transitions, transform, keyframes, easing, micro-animations, animation patterns, and performance and accessibility. The CSS curriculum continues with TypeScript Fundamentals.

## Challenge: reduced_motion

Add a prefers-reduced-motion media query that disables animation.

1. `.box` — `animation: spin 1s linear infinite`
2. `@media (prefers-reduced-motion: reduce)` — `.box { animation: none }`

```html
<div class="box-wrap">
  <div class="box" id="spin-box">⚡</div>
</div>
```

```challenge
body { background: #0f172a; padding: 40px; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 200px; }
.box-wrap { display: flex; align-items: center; justify-content: center; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.box {
  background: #6366f1;
  color: white;
  width: 60px; height: 60px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  /* add animation */
}

/* add prefers-reduced-motion query */
```

```test
var box = getComputedStyle(document.querySelector('.box'))
assert box.animationName === 'spin'
var rules = Array.from(document.styleSheets[0].cssRules)
var hasMedia = rules.some(r => r.constructor.name === 'CSSMediaRule' && (r.conditionText || '').includes('reduced-motion'))
assert hasMedia
var mediaRule = rules.find(r => r.constructor.name === 'CSSMediaRule' && (r.conditionText || '').includes('reduced-motion'))
assert mediaRule !== undefined
```
