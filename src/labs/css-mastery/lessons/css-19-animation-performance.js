export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-19-animation-performance',
  title: '19. Animation Performance',
  chapter: 'css-ch4',
  language: 'web',
  checkpoints: [
    { id: 'cp-performance', label: 'Rendering Pipeline' },
    { id: 'cp-optimized', label: 'Optimized Animations' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Two identical-looking animations. One is silky smooth, one stutters on mobile. The difference is four letters: the smooth one uses `transform`, the stuttering one uses `margin-left`. Visually indistinguishable. Performance: radically different. Understanding why requires knowing how the browser renders each frame.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="track">
    <p class="track-label">margin-left animation — triggers Layout every frame</p>
    <div class="box bad-anim">🐌</div>
  </div>
  <div class="track">
    <p class="track-label">transform animation — GPU compositor only</p>
    <div class="box good-anim">🚀</div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo { display: flex; flex-direction: column; gap: 24px; }

.track {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  overflow: hidden;
}

.track-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 16px;
  font-family: monospace;
}

.box {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* BAD: margin-left triggers Layout + Paint on every frame */
@keyframes slideWithMargin {
  from { margin-left: 0; }
  to   { margin-left: calc(100% - 72px); }
}

.bad-anim {
  background: #ef4444;
  animation: slideWithMargin 2s ease-in-out infinite alternate;
}

/* GOOD: transform is compositor-only — no Layout, no Paint */
@keyframes slideWithTransform {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100cqw - 88px)); }
}

.good-anim {
  background: #10b981;
  container-type: inline-size;
  animation: slideWithTransform 2s ease-in-out infinite alternate;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'render-pipeline',
      defaultTab: 'css',
      text: "Every frame, the browser follows this pipeline: 1. Style (apply CSS rules). 2. Layout (calculate every element's size and position). 3. Paint (draw pixels into layers). 4. Composite (combine layers and send to GPU). Each step triggers all subsequent steps. Skipping to step 4 (Composite) is the goal for animations — it's the cheapest and runs on the GPU.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="pipeline">
  <div class="step s1">
    <div class="num">1</div>
    <div class="info"><strong>Style</strong><p>Apply CSS rules to each element</p></div>
    <div class="cost low">Always runs</div>
  </div>
  <div class="arrow">→</div>
  <div class="step s2">
    <div class="num">2</div>
    <div class="info"><strong>Layout</strong><p>Calculate sizes and positions</p></div>
    <div class="cost expensive">width, height, margin, padding, top, left...</div>
  </div>
  <div class="arrow">→</div>
  <div class="step s3">
    <div class="num">3</div>
    <div class="info"><strong>Paint</strong><p>Draw pixels into layers</p></div>
    <div class="cost moderate">color, background, box-shadow...</div>
  </div>
  <div class="arrow">→</div>
  <div class="step s4 target">
    <div class="num">4</div>
    <div class="info"><strong>Composite</strong><p>Combine layers on GPU</p></div>
    <div class="cost cheap">transform, opacity ✓</div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 16px;
}

.pipeline {
  display: flex;
  align-items: stretch;
  gap: 4px;
  flex-wrap: wrap;
}

.step {
  flex: 1;
  min-width: 120px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step.target {
  border-color: #10b981;
  background: #14532d;
}

.num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.target .num { background: #166534; color: #86efac; }

strong { font-size: 0.95rem; }
p { font-size: 0.78rem; color: #94a3b8; line-height: 1.4; }

.cost {
  font-size: 0.72rem;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1.4;
  margin-top: auto;
}

.low      { background: rgba(100,116,139,0.2); color: #94a3b8; }
.expensive { background: rgba(239,68,68,0.1); color: #fca5a5; }
.moderate  { background: rgba(245,158,11,0.1); color: #fcd34d; }
.cheap     { background: rgba(16,185,129,0.1); color: #6ee7b7; font-weight: 600; }

.arrow {
  display: flex;
  align-items: center;
  color: #334155;
  font-size: 1.5rem;
  flex-shrink: 0;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'layout-triggers',
      defaultTab: 'css',
      text: "Changing these properties triggers a LAYOUT pass — the browser recalculates positions and sizes for the entire page: `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, `bottom`, `display`, `position`, `font-size`. This is expensive at 60fps because it cascades through the entire DOM. A page with 500 elements recalculates all 500.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="comparison">
  <div class="track">
    <p class="label bad-label">❌ Animating left: triggers Layout + Paint</p>
    <div class="orbit-container">
      <div class="dot bad-dot"></div>
    </div>
  </div>
  <div class="track">
    <p class="label good-label">✓ Animating transform: compositor only</p>
    <div class="orbit-container">
      <div class="dot good-dot"></div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.comparison { display: flex; flex-direction: column; gap: 16px; }

.track {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  overflow: hidden;
}

.label { font-size: 0.8rem; margin-bottom: 12px; font-family: monospace; }
.bad-label  { color: #fca5a5; }
.good-label { color: #6ee7b7; }

.orbit-container { position: relative; height: 40px; }

.dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: absolute;
  top: 0;
}

/* BAD: 'left' triggers full Layout pass every frame */
@keyframes moveWithLeft {
  from { left: 0; }
  to   { left: calc(100% - 40px); }
}
.bad-dot {
  background: #ef4444;
  animation: moveWithLeft 1.5s ease-in-out infinite alternate;
}

/* GOOD: 'transform' skips Layout and Paint entirely */
@keyframes moveWithTransform {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100cqw - 40px - 32px)); }
}
.good-dot {
  background: #10b981;
  animation: moveWithTransform 1.5s ease-in-out infinite alternate;
}

.track { container-type: inline-size; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'paint-triggers',
      defaultTab: 'css',
      text: "Paint-triggering properties are cheaper than layout triggers but still involve CPU work: `background-color`, `color`, `border-color`, `box-shadow`. The browser must redraw pixels but doesn't recalculate positions. Still expensive at 60fps on complex pages. Better than layout triggers, worse than compositor-only properties.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cost-table">
  <div class="row header">
    <span>Property</span><span>Pipeline cost</span><span>Safe to animate?</span>
  </div>
  <div class="row expensive-row">
    <code>width, height, margin, top, left</code>
    <span>Layout + Paint + Composite</span>
    <span class="no">❌ Avoid</span>
  </div>
  <div class="row moderate-row">
    <code>background-color, color, box-shadow</code>
    <span>Paint + Composite</span>
    <span class="ok">⚠ OK for short transitions</span>
  </div>
  <div class="row cheap-row">
    <code>transform, opacity</code>
    <span>Composite only (GPU)</span>
    <span class="yes">✓ Always safe</span>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.cost-table {
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
}

.row {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr;
  gap: 0;
  padding: 14px 16px;
  border-bottom: 1px solid #334155;
  align-items: center;
}

.row:last-child { border-bottom: none; }

.header {
  background: #334155;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.expensive-row { background: rgba(239,68,68,0.06); }
.moderate-row  { background: rgba(245,158,11,0.06); }
.cheap-row     { background: rgba(16,185,129,0.06); }

code {
  font-family: monospace;
  font-size: 0.78rem;
  color: #cbd5e1;
}

.row span { font-size: 0.82rem; color: #94a3b8; }

.no  { color: #fca5a5; font-weight: 600; }
.ok  { color: #fcd34d; font-weight: 600; }
.yes { color: #6ee7b7; font-weight: 600; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'compositor-only',
      defaultTab: 'css',
      text: "`transform` and `opacity` are the two properties handled exclusively by the GPU compositor. No layout, no paint. The GPU manipulates pre-drawn layers: moving them (`translate`), scaling them (`scale`), rotating them (`rotate`), or fading them (`opacity`). At 60fps, each frame takes 16ms — the compositor can handle this with time to spare.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="showcase">
    <div class="el translate">translate</div>
    <div class="el scale">scale</div>
    <div class="el rotate">rotate</div>
    <div class="el fade">fade</div>
  </div>
  <p class="note">All four animations run at 60fps with zero Layout or Paint cost. The GPU handles all of them simultaneously.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo { display: flex; flex-direction: column; gap: 24px; }

.showcase {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.el {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  text-align: center;
}

/* All four animations are compositor-only */
@keyframes doTranslate {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-20px); }
}

@keyframes doScale {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.3); }
}

@keyframes doRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes doFade {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}

.translate { background: #3b82f6; animation: doTranslate 1.2s ease-in-out infinite; }
.scale     { background: #6366f1; animation: doScale    1.2s ease-in-out infinite; }
.rotate    { background: #10b981; animation: doRotate   2s linear infinite; }
.fade      { background: #f59e0b; animation: doFade     1.2s ease-in-out infinite; }

.note {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.6;
  background: #1e293b;
  border-left: 3px solid #10b981;
  padding: 14px 16px;
  border-radius: 0 8px 8px 0;
  max-width: 480px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'replace-position',
      defaultTab: 'css',
      text: "Instead of animating `top` and `left` to move an element, use `transform: translate()`. Instead of animating `width` and `height` to resize, use `transform: scale()`. Visually identical results, completely different pipeline cost. Make this a reflex: whenever you reach for a position or size property in a keyframe, ask if `transform` can achieve the same effect.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="side-by-side">
  <div class="panel">
    <p class="label bad">❌ Animating position properties</p>
    <div class="track-area">
      <div class="mover bad-mover">bad</div>
    </div>
    <code>@keyframes { from { left: 0; } to { left: 160px; } }</code>
  </div>
  <div class="panel">
    <p class="label good">✓ Animating transform</p>
    <div class="track-area">
      <div class="mover good-mover">good</div>
    </div>
    <code>@keyframes { from { transform: translateX(0); } to { transform: translateX(160px); } }</code>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.side-by-side { display: flex; gap: 16px; flex-wrap: wrap; }

.panel {
  flex: 1;
  min-width: 240px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label { font-size: 0.85rem; font-weight: 600; }
.bad  { color: #fca5a5; }
.good { color: #6ee7b7; }

.track-area {
  height: 52px;
  position: relative;
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
}

.mover {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  position: absolute;
  top: 0;
}

@keyframes moveLeft {
  from { left: 0; }
  to   { left: calc(100% - 52px); }
}

@keyframes moveTransform {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100cqw - 52px - 32px)); }
}

.bad-mover {
  background: #ef4444;
  animation: moveLeft 1.5s ease-in-out infinite alternate;
}

.good-mover {
  background: #10b981;
  animation: moveTransform 1.5s ease-in-out infinite alternate;
}

.panel { container-type: inline-size; }

code {
  font-family: monospace;
  font-size: 0.72rem;
  color: #94a3b8;
  background: #0f172a;
  padding: 10px;
  border-radius: 6px;
  line-height: 1.6;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'will-change',
      defaultTab: 'css',
      text: "`will-change: transform` promotes an element to its own GPU compositing layer ahead of time. The browser pre-allocates GPU memory for the layer. This makes subsequent transform animations even smoother — the layer is already resident on the GPU. Set it immediately before animation (on `:hover` works well for hover effects). Remove it when done: `will-change: auto`. Applying it to everything wastes GPU memory.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="cards">
    <div class="card without-wc">
      <h3>Without will-change</h3>
      <p>Browser promotes to GPU layer when animation starts — slight first-frame cost.</p>
    </div>
    <div class="card with-wc">
      <h3>With will-change</h3>
      <p>GPU layer is pre-allocated on hover — zero first-frame cost. Ideal for cards.</p>
    </div>
  </div>
  <p class="warning">Warning: don't add will-change to everything. Each layer costs GPU memory. Only use on elements that WILL animate soon.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.demo { display: flex; flex-direction: column; gap: 24px; }

.cards { display: flex; gap: 16px; flex-wrap: wrap; }

.card {
  flex: 1;
  min-width: 200px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.4);
}

/* With will-change: pre-promote to GPU layer on hover */
.with-wc:hover {
  will-change: transform; /* hint: I'm about to animate */
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.4);
}

h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

.warning {
  font-size: 0.82rem;
  color: #fcd34d;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: 8px;
  padding: 12px 16px;
  line-height: 1.5;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'backface-visibility',
      defaultTab: 'css',
      text: "`backface-visibility: hidden` and `transform: translateZ(0)` are legacy hacks to force GPU compositing in older browsers. They work by giving the element a 3D transform context, which historically triggered GPU promotion. Modern browsers handle this automatically for `transform` and `opacity` animations. If you see these in older codebases, now you know why they're there.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="legacy-info">
    <h3>Legacy GPU hacks — for reference only</h3>
    <div class="hack-list">
      <div class="hack"><code>transform: translateZ(0)</code><p>Tricks old browsers into GPU promotion by adding a 3D transform. Modern browsers don't need this for transform/opacity animations.</p></div>
      <div class="hack"><code>backface-visibility: hidden</code><p>Another 3D context trigger. Used with translateZ(0) for extra certainty in old Chrome/Safari.</p></div>
      <div class="hack good"><code>will-change: transform</code><p>The modern, explicit way. Supported in all current browsers. Use this instead.</p></div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.legacy-info {
  max-width: 640px;
}

h3 {
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 16px;
}

.hack-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hack {
  background: #1e293b;
  border: 1px solid #334155;
  border-left: 3px solid #ef4444;
  border-radius: 8px;
  padding: 16px;
}

.hack.good {
  border-left-color: #10b981;
}

code {
  font-family: monospace;
  font-size: 0.9rem;
  color: #cbd5e1;
  display: block;
  margin-bottom: 8px;
}

p { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'reduce-motion',
      defaultTab: 'css',
      text: "`@media (prefers-reduced-motion: reduce)` detects users with 'Reduce Motion' enabled in their OS accessibility settings. These users may experience motion sickness, vestibular disorders, or epilepsy. The correct pattern: define ALL animations, then wrap them in `@media (prefers-reduced-motion: no-preference)`. This way, motion-sensitive users get no animation by default.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="hero">
    <h1>Welcome</h1>
    <p>This page has an entrance animation — but only for users who are OK with motion.</p>
  </div>
  <div class="spinner-row">
    <div class="spinner"></div>
    <span>Loading indicator — static for motion-sensitive users</span>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.page {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 40px;
  text-align: center;
}

h1 { font-size: 2rem; margin-bottom: 12px; }
p { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }

.spinner-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
}

.spinner-row span { font-size: 0.9rem; color: #94a3b8; }

/* Animations ONLY run when user has NOT requested reduced motion */
@media (prefers-reduced-motion: no-preference) {
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .hero {
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .spinner {
    animation: spin 0.8s linear infinite;
  }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-performance'
    },
    {
      type: 'narration',
      id: 'layout-thrashing',
      defaultTab: 'css',
      text: "Reading layout properties in JavaScript (`offsetWidth`, `getBoundingClientRect`, `scrollTop`) forces the browser to synchronously calculate layout immediately. Reading, then writing, then reading again in a loop causes layout thrashing: hundreds of layout calculations per second. Batch reads together, then writes together. Or use `requestAnimationFrame` to batch work to the next paint.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="code-panel bad-code">
    <h3>❌ Layout thrashing</h3>
    <pre>// BAD: read → write → read → write
items.forEach(item => {
  // Each read forces a layout recalculation
  const h = item.offsetHeight; // FORCE LAYOUT
  item.style.height = h + 10 + 'px'; // write
  // Next read triggers layout again!
  const w = item.offsetWidth; // FORCE LAYOUT
});</pre>
  </div>
  <div class="code-panel good-code">
    <h3>✓ Batched reads then writes</h3>
    <pre>// GOOD: all reads first, then all writes
const heights = items.map(item =>
  item.offsetHeight // batch all reads
);

items.forEach((item, i) =>
  item.style.height = heights[i] + 10 + 'px'
  // then batch all writes
);</pre>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.demo { display: flex; flex-direction: column; gap: 16px; }

.code-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
}

.bad-code  { border-color: #ef4444; }
.good-code { border-color: #10b981; }

h3 { font-size: 0.9rem; margin-bottom: 12px; }
.bad-code h3  { color: #fca5a5; }
.good-code h3 { color: #6ee7b7; }

pre {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.8;
  white-space: pre-wrap;
  background: #0f172a;
  padding: 12px;
  border-radius: 6px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'devtools',
      defaultTab: 'css',
      text: "Chrome DevTools Performance tab records the rendering pipeline. Record your animation, then inspect the flame chart. Green bars are paint, purple bars are layout. Yellow bars are JavaScript. A dotted line marks the 16ms frame budget. If you see purple bars during animation, a layout-triggering property is the culprit. The Layers panel shows which elements have their own GPU layer.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="guide">
  <h2>Performance Panel Guide</h2>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body">
        <strong>Open DevTools</strong>
        <p>F12 or Cmd+Option+I on Mac. Click the Performance tab.</p>
      </div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body">
        <strong>Record</strong>
        <p>Click the record button, interact with your animation, then stop. DevTools captures every frame.</p>
      </div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body">
        <strong>Look for purple bars</strong>
        <p>Purple = Layout recalculations during animation. If you see them, find the property causing them.</p>
      </div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div class="step-body">
        <strong>Check the 16ms line</strong>
        <p>Frames that exceed 16ms are dropped — the user sees a stutter. Keep all animation work under this threshold.</p>
      </div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.guide { max-width: 560px; }
h2 { font-size: 1.3rem; margin-bottom: 20px; }

.steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-body strong { display: block; margin-bottom: 4px; font-size: 0.95rem; }
.step-body p { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-optimized'
    },
    {
      type: 'challenge',
      id: 'ch-replace-position',
      text: "The animation uses `margin-left` to slide the element — this triggers Layout on every frame. Replace it with `transform: translateX()` to achieve the same visual result with compositor-only performance.",
      hint: "Delete the `margin-left` keyframe animation and define a new `@keyframes` using `transform: translateX(0)` to `transform: translateX(200px)`. Update the animation property on `.box` to use the new keyframes name.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="track">
  <div class="box">Slide Me</div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.track {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  overflow: hidden;
}

/* BAD: Replace this with a transform animation */
@keyframes badSlide {
  from { margin-left: 0; }
  to   { margin-left: 200px; }
}

.box {
  width: 100px;
  height: 60px;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  /* Replace badSlide with a transform-based animation */
  animation: badSlide 1.5s ease-in-out infinite alternate;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasTranslateX = /translateX/.test(css);
        const noMarginLeftKeyframe = !/@keyframes[^}]*\{[^@]*margin-left/.test(css.replace(/\n/g, ' '));
        return hasTranslateX && noMarginLeftKeyframe;
      }
    },
    {
      type: 'challenge',
      id: 'ch-accessible-animation',
      text: "Wrap the bounce animation so it only plays when the user has NOT requested reduced motion. Use the correct `@media` query: `@media (prefers-reduced-motion: no-preference)`. The animation should be completely absent for motion-sensitive users.",
      hint: "Move the `@keyframes bounce` and the `animation` property on `.ball` inside `@media (prefers-reduced-motion: no-preference) { }`. Without the query, the ball is static — that's correct for motion-sensitive users.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="ball"></div>
  <p>This ball should bounce — but only for users who haven't enabled Reduce Motion.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Move this inside the correct prefers-reduced-motion media query */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-30px); }
}

.ball {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3b82f6;
  /* Move this animation property inside the media query too */
  animation: bounce 0.6s ease-in-out infinite;
}

p {
  font-size: 0.9rem;
  color: #94a3b8;
  text-align: center;
  max-width: 320px;
  line-height: 1.6;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasMediaQuery = /@media\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/.test(css);
        const hasAnimationInsideQuery = /@media[^{]*prefers-reduced-motion[^{]*no-preference[^}]*\{[^@]*animation/.test(css.replace(/\n/g, ' '));
        return hasMediaQuery && hasAnimationInsideQuery;
      }
    }
  ]
};
