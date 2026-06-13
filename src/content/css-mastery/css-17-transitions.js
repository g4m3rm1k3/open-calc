export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-17-transitions',
  title: '17. Transitions',
  chapter: 'css-ch4',
  language: 'web',
  checkpoints: [
    { id: 'cp-transitions', label: 'Transitions' },
    { id: 'cp-transition-perf', label: 'Performance' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "A button. On hover, the background changes. Without a transition: instant snap. With `transition: background-color 0.3s ease`: smooth. Two words change the entire interaction feel. The browser interpolates all the intermediate values between the two states. Hover over both buttons to feel the difference.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div>
    <p class="label">No transition — instant snap</p>
    <button class="btn no-transition">Hover Me</button>
  </div>
  <div>
    <p class="label">With transition — smooth</p>
    <button class="btn with-transition">Hover Me</button>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.demo {
  display: flex;
  gap: 60px;
  align-items: flex-end;
}

.label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 12px;
  text-align: center;
}

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: #1d4ed8;
  color: white;
  display: block;
}

.no-transition:hover {
  background: #10b981;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(16,185,129,0.4);
}

.with-transition {
  /* The transition property makes state changes smooth */
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

.with-transition:hover {
  background: #10b981;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(16,185,129,0.4);
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'transition-syntax',
      defaultTab: 'css',
      text: "`transition: property duration timing-function delay` — the four values. `transition: background-color 0.3s ease`. Property: what CSS property to animate. Duration: how long the animation takes. Timing function: how the animation accelerates (ease, linear, etc.). Delay: how long to wait before starting. Duration and delay use seconds (s) or milliseconds (ms).",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <button class="btn annotated">Hover Me</button>
  <div class="annotation">
    <div class="row"><span class="val">background-color</span><span class="desc">property: what to animate</span></div>
    <div class="row"><span class="val">0.4s</span><span class="desc">duration: how long</span></div>
    <div class="row"><span class="val">ease-out</span><span class="desc">timing: how it accelerates</span></div>
    <div class="row"><span class="val">0s</span><span class="desc">delay: wait before starting</span></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.btn {
  padding: 16px 40px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  background: #1d4ed8;
  color: white;
  /* property  duration  timing-function  delay */
  transition: background-color 0.4s ease-out 0s;
}

.btn:hover {
  background: #6366f1;
}

.annotation {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
}

.row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.val {
  font-family: monospace;
  font-size: 0.9rem;
  color: #3b82f6;
  min-width: 160px;
}

.desc {
  font-size: 0.85rem;
  color: #64748b;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'multiple-transitions',
      defaultTab: 'css',
      text: "Separate multiple transitions with commas: `transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease`. Different properties can have different durations. Transform changes quickly (0.2s) — it's perceived as more responsive. Background color can be slightly slower (0.3s) — it's a deeper color change.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <button class="btn multi">Hover Me</button>
  <pre class="code">transition:
  background-color 0.3s ease,
  transform        0.2s ease,
  box-shadow       0.3s ease;</pre>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 40px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.btn {
  padding: 16px 40px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  background: #1d4ed8;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  /* Each property gets its own duration */
  transition:
    background-color 0.3s ease,
    transform        0.2s ease,
    box-shadow       0.3s ease;
}

.btn:hover {
  background: #6366f1;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px rgba(99,102,241,0.5);
}

.code {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
  color: #94a3b8;
  line-height: 1.8;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'dont-use-all',
      defaultTab: 'css',
      text: "`transition: all` animates EVERY property that changes — including width, height, display, color, and opacity. This accidentally catches unintended changes, creates jank when layout properties change, and prevents you from setting different durations per property. The height animation below is unintentional but `transition: all` catches it. Always list properties explicitly.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="section">
    <p class="label bad">❌ transition: all — hover to see height animate unexpectedly</p>
    <button class="btn bad-btn">Hover Me</button>
  </div>
  <div class="section">
    <p class="label good">✓ explicit properties — only intended properties animate</p>
    <button class="btn good-btn">Hover Me</button>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.demo { display: flex; gap: 40px; align-items: flex-start; }
.section { text-align: center; }

.label {
  font-size: 0.8rem;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
}

.bad { background: rgba(239,68,68,0.1); color: #fca5a5; }
.good { background: rgba(16,185,129,0.1); color: #6ee7b7; }

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
}

/* BAD: transition: all catches the unintended padding change too */
.bad-btn {
  background: #ef4444;
  padding-bottom: 14px; /* default */
  transition: all 0.3s ease; /* catches everything */
}

.bad-btn:hover {
  background: #dc2626;
  padding-bottom: 32px; /* unintended — but all animates it */
}

/* GOOD: only the properties we care about animate */
.good-btn {
  background: #10b981;
  padding-bottom: 14px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.good-btn:hover {
  background: #059669;
  transform: scale(1.05);
  padding-bottom: 32px; /* changes but does NOT animate */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'timing-functions',
      defaultTab: 'css',
      text: "`ease` (default): slow start, fast middle, slow end — the most natural. `linear`: constant speed — good for spinners. `ease-in`: slow start, fast end — good for elements exiting. `ease-out`: fast start, slow end — the most natural for elements entering. `ease-in-out`: slow start AND end — good for back-and-forth motion.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <p class="instruction">Hover the container to start all animations simultaneously — notice how differently they feel:</p>
  <div class="race-track">
    <div class="lane"><span class="label">ease</span><div class="ball ease"></div></div>
    <div class="lane"><span class="label">linear</span><div class="ball linear"></div></div>
    <div class="lane"><span class="label">ease-in</span><div class="ball ease-in"></div></div>
    <div class="lane"><span class="label">ease-out</span><div class="ball ease-out"></div></div>
    <div class="lane"><span class="label">ease-in-out</span><div class="ball ease-in-out"></div></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.instruction {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 24px;
  line-height: 1.5;
}

.race-track {
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}

.lane {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0 12px;
  position: relative;
  overflow: hidden;
}

.label {
  font-family: monospace;
  font-size: 0.8rem;
  color: #64748b;
  min-width: 90px;
}

.ball {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
  transition-property: transform;
  transition-duration: 1s;
}

.ease         { transition-timing-function: ease; }
.linear       { transition-timing-function: linear; }
.ease-in      { transition-timing-function: ease-in; }
.ease-out     { transition-timing-function: ease-out; }
.ease-in-out  { transition-timing-function: ease-in-out; }

/* On hover, move all balls to the right simultaneously */
.race-track:hover .ball {
  transform: translateX(180px);
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'cubic-bezier',
      defaultTab: 'css',
      text: "`cubic-bezier(x1, y1, x2, y2)` defines a custom easing curve using two control points. `cubic-bezier(0.4, 0, 0.2, 1)` is Material Design's standard easing — a smooth ease-out with a slight ease-in. `cubic-bezier(0.34, 1.56, 0.64, 1)` has overshoot — the element goes slightly past its target before settling. Tools like cubic-bezier.com let you draw the curve visually.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <p class="instruction">Hover the container to compare standard and custom easing:</p>
  <div class="race-track">
    <div class="lane"><span class="label">ease-out</span><div class="ball standard"></div></div>
    <div class="lane"><span class="label">material</span><div class="ball material"></div></div>
    <div class="lane"><span class="label">spring</span><div class="ball spring"></div></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.instruction {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 24px;
  line-height: 1.5;
}

.race-track {
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  max-width: 480px;
}

.lane {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0 12px;
  overflow: hidden;
}

.label {
  font-family: monospace;
  font-size: 0.8rem;
  color: #64748b;
  min-width: 80px;
}

.ball {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  transition-property: transform;
  transition-duration: 0.6s;
}

.standard { background: #3b82f6; transition-timing-function: ease-out; }
.material  { background: #10b981; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
/* Overshoot spring: goes past and bounces back */
.spring    { background: #f59e0b; transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }

.race-track:hover .ball {
  transform: translateX(200px);
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'composited-properties',
      defaultTab: 'css',
      text: "Not all CSS properties animate with equal performance. `transform` and `opacity` are handled by the GPU compositor — they animate without touching layout or paint. Everything else (width, height, margin, left, background-color) triggers layout or paint recalculations on the CPU. For smooth 60fps animation, stick to transform and opacity whenever possible.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="row">
    <div class="panel bad">
      <p class="panel-label">❌ left animation</p>
      <p class="detail">Triggers Layout + Paint every frame. Causes jank on complex pages.</p>
      <div class="box bad-box">Hover</div>
    </div>
    <div class="panel good">
      <p class="panel-label">✓ transform animation</p>
      <p class="detail">GPU compositor only. Buttery smooth at 60fps.</p>
      <div class="box good-box">Hover</div>
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

.row { display: flex; gap: 20px; }

.panel {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
  min-height: 160px;
  position: relative;
  overflow: hidden;
}

.bad { border-color: #ef4444; }
.good { border-color: #10b981; }

.panel-label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.bad .panel-label { color: #fca5a5; }
.good .panel-label { color: #6ee7b7; }

.detail {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 20px;
}

.box {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

/* BAD: animating position triggers layout every frame */
.bad-box {
  background: #ef4444;
  position: relative;
  left: 0;
  transition: left 0.3s ease; /* triggers Layout + Paint */
}

.bad-box:hover { left: 80px; }

/* GOOD: transform is GPU compositor only */
.good-box {
  background: #10b981;
  transition: transform 0.3s ease; /* GPU only */
}

.good-box:hover { transform: translateX(80px); }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'will-change',
      defaultTab: 'css',
      text: "`will-change: transform` tells the browser 'this element will be animated soon — create a GPU compositing layer for it.' This promotes the element to its own layer, making the transition even smoother. Set it on elements that are ABOUT TO animate — on the hover or focus event, not permanently on everything. Overusing `will-change` consumes GPU memory.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <p class="note">will-change: transform is set on hover — promoting the element to a GPU layer just before it animates.</p>
  <div class="card">
    <div class="card-img"></div>
    <div class="card-body">
      <h3>Hover for GPU-accelerated lift</h3>
      <p>The will-change property is set on hover (before the animation) for optimal performance.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.note {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.6;
  background: #1e293b;
  border-left: 3px solid #3b82f6;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 24px;
  max-width: 500px;
}

.card {
  max-width: 400px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Hint the browser just before animation — not on the base style */
.card:hover {
  will-change: transform; /* promote to GPU layer */
  transform: translateY(-6px);
  box-shadow: 0 16px 40px -8px rgba(0,0,0,0.5);
}

.card-img {
  height: 160px;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
}

.card-body { padding: 20px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'transition-color',
      defaultTab: 'css',
      text: "Color properties — `background-color`, `color`, `border-color`, `box-shadow` — all animate smoothly with transition. The browser interpolates between the two color values: from `#1d4ed8` to `#10b981` it computes every RGB value in between. A well-designed button transitions multiple color properties simultaneously for a cohesive state change.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <button class="btn primary">Primary Action</button>
  <button class="btn secondary">Secondary</button>
  <button class="btn danger">Destructive</button>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 40px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo { display: flex; gap: 20px; flex-wrap: wrap; }

.btn {
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  /* Animate all color-related properties together */
  transition:
    background-color 0.2s ease,
    color            0.2s ease,
    border-color     0.2s ease,
    box-shadow       0.25s ease,
    transform        0.15s ease;
}

.primary {
  background: #1d4ed8;
  color: white;
  border-color: #1d4ed8;
}
.primary:hover {
  background: #2563eb;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.3);
  transform: translateY(-1px);
}

.secondary {
  background: transparent;
  color: #94a3b8;
  border-color: #334155;
}
.secondary:hover {
  background: #1e293b;
  color: #f8fafc;
  border-color: #64748b;
  transform: translateY(-1px);
}

.danger {
  background: #7f1d1d;
  color: #fca5a5;
  border-color: #991b1b;
}
.danger:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239,68,68,0.3);
  transform: translateY(-1px);
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-transitions'
    },
    {
      type: 'narration',
      id: 'hover-card',
      defaultTab: 'css',
      text: "A card with `transform: translateY(-4px) scale(1.02)` on hover, plus a growing `box-shadow`, creates a satisfying 'lift' effect. The shadow must get larger and softer as the card lifts — that's how real shadows work under a light source. Add `transition: transform 0.2s ease, box-shadow 0.2s ease` for smooth animation.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="grid">
  <div class="card">
    <div class="card-img"></div>
    <div class="card-body">
      <h3>Project Card</h3>
      <p>Hover to feel the lift effect. Shadow grows as the card rises.</p>
      <span class="tag">CSS</span>
    </div>
  </div>
  <div class="card">
    <div class="card-img alt"></div>
    <div class="card-body">
      <h3>Another Project</h3>
      <p>The transition applies to all cards via a shared class.</p>
      <span class="tag">Animation</span>
    </div>
  </div>
  <div class="card">
    <div class="card-img accent"></div>
    <div class="card-body">
      <h3>Third Card</h3>
      <p>Each card lifts independently on hover.</p>
      <span class="tag">Design</span>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 200px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  /* Only animate GPU-friendly properties */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.card:hover {
  transform: translateY(-6px) scale(1.02);
  /* Shadow gets larger and more diffuse as the card 'lifts' */
  box-shadow: 0 20px 40px -8px rgba(0,0,0,0.5);
}

.card-img {
  height: 140px;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
}
.card-img.alt   { background: linear-gradient(135deg, #7c3aed, #be185d); }
.card-img.accent { background: linear-gradient(135deg, #059669, #0891b2); }

.card-body { padding: 20px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 12px; }

.tag {
  background: #334155;
  color: #94a3b8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'transition-gotcha',
      defaultTab: 'css',
      text: "`display` cannot be transitioned. The browser can't interpolate between `display: none` and `display: block`. Workaround: use `opacity` + `visibility` together. `opacity: 0; visibility: hidden` hides the element and removes it from pointer events but preserves its space in layout. Transition both together for a smooth fade.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <button onclick="this.nextElementSibling.classList.toggle('visible')">Toggle Panel</button>
  <div class="panel">
    <p>This panel fades in and out smoothly using opacity + visibility. It can't use display: none because that can't be transitioned.</p>
    <p>Click the button again to fade it out.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
}

.panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* The trick: opacity + visibility can be transitioned */
  opacity: 0;
  visibility: hidden;
  /* display: none would prevent the transition from working */
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.panel.visible {
  opacity: 1;
  visibility: visible;
}

p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-transition-perf'
    },
    {
      type: 'challenge',
      id: 'ch-button',
      text: "Build an interactive button that smoothly transitions `background-color`, `transform` (scale up slightly on hover), and `box-shadow` on hover. Do NOT use `transition: all` — list each property explicitly.",
      hint: "Write three transition values separated by commas: `transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;`. Then add hover styles for each.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <button class="btn">Click Me</button>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 80px 40px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn {
  padding: 16px 40px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  /* Add transition here — list properties explicitly, no "all" */
}

.btn:hover {
  /* Add hover styles: darker background, slight scale, larger shadow */
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasTransition = /transition\s*:/.test(css);
        const noTransitionAll = !/transition\s*:\s*all/.test(css);
        const hasTransform = /transform\s*:/.test(css);
        const hasTransformInTransition = /transition[^;]*transform/.test(css);
        return hasTransition && noTransitionAll && hasTransform && hasTransformInTransition;
      }
    },
    {
      type: 'challenge',
      id: 'ch-card-hover',
      text: "Create a card that lifts upward (use `translateY` with a negative value) and gains a larger box-shadow on hover, with a smooth transition. The transition must include `transform` and `box-shadow` listed explicitly.",
      hint: "On the `.card`, add `transition: transform 0.2s ease, box-shadow 0.2s ease`. On `.card:hover`, add `transform: translateY(-6px)` and a larger `box-shadow`.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="card">
    <div class="card-img"></div>
    <div class="card-body">
      <h3>Hover Card</h3>
      <p>I should lift up and gain a shadow on hover.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.card {
  width: 300px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  /* Add transition here */
}

.card:hover {
  /* Add transform: translateY() and box-shadow here */
}

.card-img {
  height: 160px;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
}

.card-body { padding: 20px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasTranslateY = /transform\s*:.*translateY\s*\(\s*-/.test(css);
        const hasTransition = /transition[^;]*transform/.test(css);
        return hasTranslateY && hasTransition;
      }
    }
  ]
};
