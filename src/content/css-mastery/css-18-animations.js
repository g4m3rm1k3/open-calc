export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-18-animations',
  title: '18. Keyframe Animations',
  chapter: 'css-ch4',
  language: 'web',
  checkpoints: [
    { id: 'cp-keyframes', label: 'Keyframes' },
    { id: 'cp-animation-control', label: 'Animation Control' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "A transition goes from A to B on an event (like hover). But a loading spinner must spin continuously with no user interaction. An entrance animation runs once when the element appears. A pulsing badge repeats forever. None of these can be done with transitions — they need keyframes: animations that run on their own schedule, independent of user events.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="panel">
    <h3>Transitions need an event:</h3>
    <button class="btn-hover">Hover me</button>
    <p>Only animates on hover — requires user action</p>
  </div>
  <div class="panel">
    <h3>Keyframes are self-driven:</h3>
    <div class="placeholder-spinner"></div>
    <p>Runs automatically — no user action needed</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo { display: flex; gap: 24px; flex-wrap: wrap; }

.panel {
  flex: 1;
  min-width: 200px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

h3 { font-size: 0.9rem; color: #94a3b8; }
p { font-size: 0.8rem; color: #64748b; text-align: center; line-height: 1.5; }

.btn-hover {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-hover:hover {
  background: #10b981;
  transform: scale(1.05);
}

.placeholder-spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: conic-gradient(#3b82f6 0deg, #3b82f6 270deg, #1e293b 270deg);
  /* No animation yet — just a static placeholder */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'keyframes-syntax',
      defaultTab: 'css',
      text: "`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` — define the start and end states. `from` is shorthand for `0%`. `to` is shorthand for `100%`. For multi-step animations, use percentage values: `0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; }`.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="spinner"></div>
  <pre class="code">@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}</pre>
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

.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

/* Step 1: define the keyframes */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spinner {
  width: 56px;
  height: 56px;
  border: 4px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  /* Step 2: apply the animation */
  animation: spin 1s linear infinite;
}

.code {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
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
      id: 'animation-property',
      defaultTab: 'css',
      text: "`animation: name duration timing-function delay iteration-count direction fill-mode` — the seven-value shorthand. Most used: `animation: spin 1s linear infinite`. The order matters but you can omit trailing values. The first time value is always duration; the second (if provided) is delay. `infinite` is a special keyword for iteration count.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="spinner fast"></div>
  <div class="spinner medium"></div>
  <div class="spinner slow"></div>
  <div class="annotation">
    <div class="row"><span class="val">spin</span><span class="desc">name — matches @keyframes spin</span></div>
    <div class="row"><span class="val">1s / 2s / 3s</span><span class="desc">duration — how long one loop takes</span></div>
    <div class="row"><span class="val">linear</span><span class="desc">timing-function</span></div>
    <div class="row"><span class="val">infinite</span><span class="desc">iteration-count — loops forever</span></div>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
}

/* animation: name duration timing-function delay iteration-count */
.fast   { animation: spin 0.5s linear infinite; border-top-color: #ef4444; }
.medium { animation: spin 1.5s linear infinite; border-top-color: #3b82f6; }
.slow   { animation: spin 3s linear infinite;   border-top-color: #10b981; }

.annotation {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
  width: 100%;
  max-width: 440px;
}

.row { display: flex; gap: 12px; align-items: center; }
.val { font-family: monospace; font-size: 0.85rem; color: #3b82f6; min-width: 140px; }
.desc { font-size: 0.8rem; color: #64748b; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'iteration-count',
      defaultTab: 'css',
      text: "`animation-iteration-count: infinite` loops forever. `animation-iteration-count: 3` runs three times then stops. `animation-iteration-count: 1` (the default) runs once. You can use fractional values like `2.5` for two and a half loops — the animation stops mid-cycle. Setting iteration count to `0` effectively disables the animation.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="row"><div class="box once"></div><span>iteration-count: 1 — plays once</span></div>
  <div class="row"><div class="box three"></div><span>iteration-count: 3 — plays 3 times</span></div>
  <div class="row"><div class="box half"></div><span>iteration-count: 2.5 — plays 2.5 times</span></div>
  <div class="row"><div class="box infinite-box"></div><span>iteration-count: infinite — loops</span></div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
}

.row {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 16px;
}

.row span { font-size: 0.85rem; color: #94a3b8; font-family: monospace; }

@keyframes bounce {
  0%, 100% { transform: translateX(0); }
  50%       { transform: translateX(120px); }
}

.box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
  animation-name: bounce;
  animation-duration: 0.8s;
  animation-timing-function: ease-in-out;
}

.once         { background: #3b82f6; animation-iteration-count: 1; }
.three        { background: #6366f1; animation-iteration-count: 3; }
.half         { background: #10b981; animation-iteration-count: 2.5; }
.infinite-box { background: #f59e0b; animation-iteration-count: infinite; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'fill-mode',
      defaultTab: 'css',
      text: "`animation-fill-mode: forwards` keeps the element in the state defined in the final keyframe after the animation ends. Without it, the element snaps back to its original CSS state. `backwards` applies the first keyframe's state during the animation delay period (before it starts). `both` does both.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="row">
    <div class="box snaps-back">Snaps Back</div>
    <span>No fill-mode — snaps back to original state after animation</span>
  </div>
  <div class="row">
    <div class="box stays">Stays Put</div>
    <span>fill-mode: forwards — stays in final keyframe state</span>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo { display: flex; flex-direction: column; gap: 24px; max-width: 600px; }

.row {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
}

.row span { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

@keyframes slideRight {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(80px); opacity: 0.3; }
}

.box {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  flex-shrink: 0;
  animation: slideRight 1s ease-in-out 0.5s; /* 0.5s delay so you can see the start state */
}

/* No fill-mode: snaps back to original position after animation */
.snaps-back {
  background: #ef4444;
  /* animation-fill-mode is 'none' by default */
}

/* fill-mode: forwards: stays in the final state (translateX(80px), opacity: 0.3) */
.stays {
  background: #10b981;
  animation-fill-mode: forwards;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'direction',
      defaultTab: 'css',
      text: "`animation-direction: alternate` plays the animation forward, then backward, then forward again — a natural ping-pong effect. `reverse` plays it backward only. For a pulsing animation that grows and shrinks, `alternate` with a short duration gives a natural breathing rhythm without needing to write the 'return' in the keyframes.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="col">
    <p>animation-direction: normal</p>
    <div class="pulse-dot normal"></div>
    <span>Always plays forward</span>
  </div>
  <div class="col">
    <p>animation-direction: alternate</p>
    <div class="pulse-dot alternate"></div>
    <span>Grows → shrinks → grows</span>
  </div>
  <div class="col">
    <p>animation-direction: reverse</p>
    <div class="pulse-dot reverse"></div>
    <span>Always plays backward</span>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo { display: flex; gap: 32px; flex-wrap: wrap; }

.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  flex: 1;
  min-width: 160px;
}

p { font-size: 0.75rem; font-family: monospace; color: #94a3b8; text-align: center; }
span { font-size: 0.8rem; color: #64748b; text-align: center; }

@keyframes grow {
  from { transform: scale(1); opacity: 0.5; }
  to   { transform: scale(1.5); opacity: 1; }
}

.pulse-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  animation: grow 0.8s ease-in-out infinite;
}

.normal    { background: #3b82f6; animation-direction: normal; }
.alternate { background: #10b981; animation-direction: alternate; }
.reverse   { background: #f59e0b; animation-direction: reverse; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'entrance-animation',
      defaultTab: 'css',
      text: "A classic entrance animation: element appears by fading in while sliding up from 20px below its final position. `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`. Applied with `animation: fadeInUp 0.4s ease-out forwards`. Clean, subtle, and modern.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="card">
    <h2>Welcome Back</h2>
    <p>This card fades in from below when it appears on the page. Refresh to see it again.</p>
  </div>
  <div class="card delayed">
    <h2>And This One</h2>
    <p>This card enters 0.15s after the first — a subtle stagger effect.</p>
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  width: 100%;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 28px;
  /* Entrance animation: runs once, stays in final state */
  animation: fadeInUp 0.4s ease-out forwards;
}

.delayed {
  animation-delay: 0.15s;
  /* Prevent flash before animation starts */
  opacity: 0;
}

h2 { font-size: 1.3rem; margin-bottom: 12px; }
p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'multiple-keyframes',
      defaultTab: 'css',
      text: "Keyframes can have multiple steps at any percentage. A notification badge pulse: `0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); }`. Applied with `animation: pulse 2s ease-in-out infinite` — a gentle, repeated attention-getter that doesn't feel alarming.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="nav-icon">
    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    <div class="badge">3</div>
  </div>
  <div class="status-dot"></div>
  <p>Both use multi-step keyframes for organic-feeling animations.</p>
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

/* Badge pulse: draws attention without being alarming */
@keyframes pulse {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
  50%  { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(239,68,68,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
}

/* Status dot: breathing green glow */
@keyframes breathe {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); opacity: 1; }
  50%  { box-shadow: 0 0 0 8px rgba(16,185,129,0); opacity: 0.8; }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); opacity: 1; }
}

.nav-icon {
  position: relative;
  color: #94a3b8;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ef4444;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #10b981;
  animation: breathe 2s ease-in-out infinite;
}

p { font-size: 0.85rem; color: #64748b; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'staggering',
      defaultTab: 'css',
      text: "Stagger entrance animations using `animation-delay`. Items at indices 0–5 get delays 0s, 0.1s, 0.2s, 0.3s, 0.4s, 0.5s. They enter one after another in a cascade. In CSS, set per-item delays using inline `style` attributes or CSS custom properties with `nth-child` selectors.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<ul class="list">
  <li class="item" style="animation-delay: 0s">First item enters first</li>
  <li class="item" style="animation-delay: 0.1s">Second item follows</li>
  <li class="item" style="animation-delay: 0.2s">Third item</li>
  <li class="item" style="animation-delay: 0.3s">Fourth item</li>
  <li class="item" style="animation-delay: 0.4s">Fifth item</li>
  <li class="item" style="animation-delay: 0.5s">Last item enters last</li>
</ul>`,
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.item {
  background: #1e293b;
  border: 1px solid #334155;
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
  padding: 16px 20px;
  font-size: 0.95rem;
  color: #94a3b8;
  /* animation-delay is set per-item via inline style */
  animation: slideIn 0.35s ease-out forwards;
  opacity: 0; /* start hidden until animation begins */
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-keyframes'
    },
    {
      type: 'narration',
      id: 'animation-shorthand',
      defaultTab: 'css',
      text: "For complex animations, use longhand properties for clarity: `animation-name`, `animation-duration`, `animation-timing-function`, `animation-iteration-count`, etc. For multiple simultaneous animations on one element, use the shorthand comma syntax: `animation: spin 1s linear infinite, pulse 2s ease-in-out infinite`. Both animations run concurrently.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="dual-animate">
    <span>3</span>
  </div>
  <pre class="code">/* Two animations running simultaneously */
animation:
  spin  1s linear infinite,
  pulse 2s ease-in-out infinite;</pre>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); }
  50%       { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
}

.dual-animate {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
  /* Both animations run at the same time */
  animation:
    spin  3s linear infinite,
    pulse 1.5s ease-in-out infinite;
}

.code {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
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
      id: 'js-animation-trigger',
      defaultTab: 'css',
      text: "Animations defined in CSS can be triggered by JavaScript adding a class. Define `@keyframes shake` and `.shake { animation: shake 0.5s ease }`. JavaScript adds `.shake` to trigger it. Remove the class in the `animationend` event listener to allow the animation to be re-triggered later. Here the class is pre-applied in HTML for the demo.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="form-field error shake" id="field">
    <label>Email Address</label>
    <input type="email" value="not-an-email" readonly>
    <span class="error-msg">Invalid email address</span>
  </div>
  <button onclick="
    const el = document.getElementById('field');
    el.classList.remove('shake');
    void el.offsetWidth; /* trigger reflow to restart animation */
    el.classList.add('shake');
  ">Shake Again</button>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 24px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 360px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%       { transform: translateX(-8px); }
  30%       { transform: translateX(8px); }
  45%       { transform: translateX(-6px); }
  60%       { transform: translateX(6px); }
  75%       { transform: translateX(-3px); }
  90%       { transform: translateX(3px); }
}

.form-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.form-field input {
  padding: 12px 14px;
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 0.95rem;
  outline: none;
  width: 100%;
}

/* The shake animation triggers when .shake class is added by JS */
.form-field.shake {
  animation: shake 0.5s ease;
}

.form-field.error input {
  border-color: #ef4444;
}

.error-msg {
  font-size: 0.8rem;
  color: #f87171;
}

button {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-animation-control'
    },
    {
      type: 'challenge',
      id: 'ch-spinner',
      text: "Create a loading spinner: a circle with a partial border that spins continuously. Use `@keyframes` to define the rotation from 0deg to 360deg, and apply it with `animation` and `infinite` iteration count.",
      hint: "Create a div with `border-radius: 50%`. Set most of the border to a dark color, one side to a bright color. Define `@keyframes spin { to { transform: rotate(360deg); } }` and apply `animation: spin 0.8s linear infinite`.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="loading-screen">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Define @keyframes here */

.spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  /* Add border styling: most border dark, one side colored */
  /* Add animation: ... linear infinite */
}

p {
  color: #64748b;
  font-size: 0.9rem;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasKeyframes = /@keyframes/.test(css);
        const hasAnimation = /animation\s*:/.test(css) || /animation-name\s*:/.test(css);
        const hasInfinite = /infinite/.test(css);
        return hasKeyframes && hasAnimation && hasInfinite;
      }
    },
    {
      type: 'challenge',
      id: 'ch-entrance',
      text: "Make the card enter the page by fading in while sliding up 30px from below its final position. The animation should run once and the card must stay in its final position (use fill-mode: forwards).",
      hint: "Define `@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`. Apply with `animation: fadeUp 0.5s ease-out forwards`. Set `opacity: 0` on the card so it starts hidden.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="card">
    <h2>Animated Card</h2>
    <p>I should fade in while sliding up from 30px below. I should stay in my final position after the animation ends.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

/* Define @keyframes here */

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 32px;
  max-width: 400px;
  /* Start hidden: opacity: 0 */
  /* Add animation here with fill-mode: forwards */
}

h2 { font-size: 1.5rem; margin-bottom: 12px; }
p { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasKeyframes = /@keyframes/.test(css);
        const hasOpacityInKeyframes = /@keyframes[^}]*\{[^@]*opacity/.test(css.replace(/\n/g, ' '));
        const hasTransformInKeyframes = /@keyframes[^}]*\{[^@]*transform/.test(css.replace(/\n/g, ' '));
        const hasForwards = /forwards/.test(css);
        return hasKeyframes && hasForwards && (hasOpacityInKeyframes || /opacity\s*:\s*0/.test(css)) && (hasTransformInKeyframes || /translateY/.test(css));
      }
    }
  ]
};
