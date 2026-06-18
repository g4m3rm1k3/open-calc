export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-27-inline-styles-js',
  title: '27. Inline Styles via JavaScript',
  chapter: 'css-ch6',
  language: 'web',
  checkpoints: [
    { id: 'cp-element-style', label: 'element.style' },
    { id: 'cp-mouse-tracking', label: 'Mouse Tracking' },
    { id: 'cp-css-transitions', label: 'CSS Transitions' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'js',
      text: "You want an element to follow the mouse cursor. You want a parallax effect where layers move at different speeds. You want a card that tilts toward the cursor. These are legitimately dynamic — the values change continuously based on user input. For these cases, setting `element.style.property` from JavaScript is exactly right. The distinction: use classes for states, use inline styles for continuously computed values.",
      files: {
        html: `<div class="cursor-follower" id="dot"></div>
<p class="hint">Move your mouse around the page</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; overflow: hidden; }

.cursor-follower {
  position: fixed;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  pointer-events: none;
  /* Offset by half size so it's centered on cursor */
  transform: translate(-50%, -50%);
  transition: left 0.05s, top 0.05s; /* tiny lag = smoothness */
}

.hint { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); color: #64748b; font-size: 0.9rem; }`,
        js: `const dot = document.getElementById('dot');

document.addEventListener('mousemove', (e) => {
  dot.style.left = e.clientX + 'px';
  dot.style.top = e.clientY + 'px';
});`
      }
    },
    {
      type: 'narration',
      id: 'element-style-api',
      defaultTab: 'js',
      text: "`element.style` gives you read/write access to inline styles. Property names use camelCase: `backgroundColor`, `borderRadius`, `marginTop`. Set a value by assignment. Remove a value by setting it to empty string `''` — this removes the inline style so CSS rules take over again.",
      files: {
        html: `<div class="box" id="box">
  <p>Click buttons to modify inline styles</p>
</div>

<div class="controls">
  <button onclick="document.getElementById('box').style.backgroundColor = '#3b82f6'">Blue BG</button>
  <button onclick="document.getElementById('box').style.backgroundColor = '#10b981'">Green BG</button>
  <button onclick="document.getElementById('box').style.backgroundColor = ''">Reset BG</button>
  <button onclick="document.getElementById('box').style.borderRadius = '50%'">Round</button>
  <button onclick="document.getElementById('box').style.transform = 'rotate(45deg)'">Rotate</button>
  <button onclick="document.getElementById('box').style.cssText = ''">Reset All</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 24px; align-items: flex-start; }

.box { width: 160px; height: 160px; background: #1e293b; border: 2px solid #334155; border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.box p { color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 12px; margin: 0; }

.controls { display: flex; flex-wrap: wrap; gap: 8px; }
button { background: #334155; color: #f1f5f9; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
button:hover { background: #475569; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'getcomputedstyle',
      defaultTab: 'js',
      text: "`element.style` only reads INLINE styles. If a style is set via a stylesheet, `element.style.color` returns empty string. To read the actual computed value (after all cascading), use `getComputedStyle(element).propertyName`. Note: use kebab-case strings for computed style: `getComputedStyle(el).getPropertyValue('background-color')`.",
      files: {
        html: `<div class="box" id="inspect-box">Inspect me</div>
<div id="output" class="output">Click the box to see its computed styles</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; }

.box { width: 200px; height: 80px; background: #3b82f6; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 600; transition: transform 0.15s; }
.box:active { transform: scale(0.97); }

.output { background: #1e293b; padding: 16px 20px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; color: #94a3b8; white-space: pre-line; }`,
        js: `document.getElementById('inspect-box').addEventListener('click', (e) => {
  const el = e.currentTarget;
  const cs = getComputedStyle(el);
  const output = document.getElementById('output');

  output.textContent = [
    'element.style.backgroundColor: "' + el.style.backgroundColor + '" (inline, probably empty)',
    '',
    'getComputedStyle():',
    '  background-color: ' + cs.getPropertyValue('background-color'),
    '  width: ' + cs.width,
    '  height: ' + cs.height,
    '  border-radius: ' + cs.borderRadius,
  ].join('\\n');
});`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-element-style'
    },
    {
      type: 'narration',
      id: 'smooth-cursor',
      defaultTab: 'js',
      text: "Raw mouse tracking is jerky — the element teleports to each event position. Smooth following uses linear interpolation (lerp): move the element 10% of the way to the target on each animation frame. The element catches up smoothly. This is the basis of smooth scrolling, spring physics, and game character following.",
      files: {
        html: `<div class="trail" id="trail"></div>
<div class="cursor" id="cursor"></div>
<p class="hint">Move mouse slowly and quickly to see the lag</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: #0f172a; min-height: 100vh; overflow: hidden; }

.cursor {
  position: fixed;
  width: 16px; height: 16px;
  background: white;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.trail {
  position: fixed;
  width: 32px; height: 32px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.hint { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); color: #334155; font-family: sans-serif; font-size: 0.85rem; }`,
        js: `const cursor = document.getElementById('cursor');
const trail = document.getElementById('trail');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let trailX = mouseX;
let trailY = mouseY;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function lerp(a, b, t) { return a + (b - a) * t; }

function animate() {
  // Cursor snaps exactly to mouse
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';

  // Trail lerps 12% toward cursor each frame — creates lag/smoothness
  trailX = lerp(trailX, mouseX, 0.12);
  trailY = lerp(trailY, mouseY, 0.12);
  trail.style.left = trailX + 'px';
  trail.style.top = trailY + 'px';

  requestAnimationFrame(animate);
}

animate();`
      }
    },
    {
      type: 'narration',
      id: 'card-tilt',
      defaultTab: 'js',
      text: "The 3D card tilt effect is a classic use case: compute the cursor position relative to the card center, map it to rotation degrees, set `transform` inline. CSS provides `perspective` and `transform-style: preserve-3d`. JavaScript provides the live angle values.",
      files: {
        html: `<div class="scene">
  <div class="card" id="tilt-card">
    <div class="card-inner">
      <div class="shine" id="shine"></div>
      <h2>Hover Me</h2>
      <p>3D tilt driven by mouse position</p>
    </div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; }

.scene { perspective: 800px; }

.card {
  width: 280px;
  height: 180px;
  transform-style: preserve-3d;
  transition: transform 0.1s ease;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3a5f, #1e293b);
  border-radius: 16px;
  border: 1px solid #334155;
  padding: 28px;
  position: relative;
  overflow: hidden;
}

.shine {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.card:hover .shine { opacity: 1; }

h2 { margin: 0 0 8px; color: #e2e8f0; }
p { margin: 0; color: #94a3b8; font-size: 0.9rem; }`,
        js: `const card = document.getElementById('tilt-card');
const shine = document.getElementById('shine');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // Normalized position: -1 to 1
  const nx = (e.clientX - cx) / (rect.width / 2);
  const ny = (e.clientY - cy) / (rect.height / 2);

  const rotateY = nx * 12; // max 12deg
  const rotateX = -ny * 8; // max 8deg

  card.style.transform = \`rotateX(\${rotateX}deg) rotateY(\${rotateY}deg)\`;

  // Move shine to cursor position
  const px = ((e.clientX - rect.left) / rect.width) * 100;
  const py = ((e.clientY - rect.top) / rect.height) * 100;
  shine.style.background = \`radial-gradient(circle at \${px}% \${py}%, rgba(255,255,255,0.18) 0%, transparent 60%)\`;
});

card.addEventListener('mouseleave', () => {
  card.style.transform = 'rotateX(0) rotateY(0)';
});`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-mouse-tracking'
    },
    {
      type: 'narration',
      id: 'requestanimationframe',
      defaultTab: 'js',
      text: "`requestAnimationFrame(callback)` runs the callback just before the browser paints the next frame — typically 60 times per second. This is the correct way to do smooth animations from JavaScript. `setInterval` fires at unpredictable times and can cause jank. rAF is synchronized with the display refresh cycle.",
      files: {
        html: `<div class="orbit" id="orbit">
  <div class="planet" id="planet"></div>
  <div class="sun"></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; }

.orbit { position: relative; width: 200px; height: 200px; }

.sun { position: absolute; width: 40px; height: 40px; background: radial-gradient(circle, #fbbf24, #f59e0b); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 30px #f59e0b80; }

.planet { position: absolute; width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; top: 50%; left: 50%; transform-origin: 0 0; box-shadow: 0 0 12px #3b82f660; }`,
        js: `const planet = document.getElementById('planet');
let angle = 0;
const radius = 80;

function animate(timestamp) {
  angle = (timestamp / 1200) * Math.PI * 2; // full rotation every 1.2s

  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  planet.style.transform = \`translate(\${x - 8}px, \${y - 8}px)\`;

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);`
      }
    },
    {
      type: 'narration',
      id: 'combining-transitions',
      defaultTab: 'js',
      text: "CSS transitions + inline styles: set `transition` in CSS, update the value from JavaScript. The browser handles the interpolation. This is far better than JavaScript animation loops for state changes (hover, focus, active) because the browser can optimize transitions on the GPU compositor thread.",
      files: {
        html: `<div class="slider-track" id="track">
  <div class="slider-thumb" id="thumb"></div>
</div>
<p id="val">50%</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 48px; }

.slider-track { position: relative; width: 300px; height: 6px; background: #334155; border-radius: 3px; cursor: pointer; margin-bottom: 20px; }

.slider-thumb {
  position: absolute;
  width: 24px;
  height: 24px;
  background: #3b82f6;
  border-radius: 50%;
  top: 50%;
  left: 50%; /* JS sets this */
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 4px #3b82f630;
  /* CSS transition — JS just sets the target */
  transition: left 0.15s ease;
}

.slider-thumb:active { transform: translate(-50%, -50%) scale(1.2); }

p { color: #94a3b8; font-size: 1.1rem; }`,
        js: `const track = document.getElementById('track');
const thumb = document.getElementById('thumb');
const val = document.getElementById('val');

let dragging = false;

function setPosition(x) {
  const rect = track.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
  // Inline style — CSS transition handles the smoothness
  thumb.style.left = (pct * 100) + '%';
  val.textContent = Math.round(pct * 100) + '%';
}

track.addEventListener('mousedown', (e) => { dragging = true; setPosition(e.clientX); });
document.addEventListener('mousemove', (e) => { if (dragging) setPosition(e.clientX); });
document.addEventListener('mouseup', () => { dragging = false; });`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-css-transitions'
    },
    {
      type: 'narration',
      id: 'getBoundingClientRect',
      defaultTab: 'js',
      text: "`getBoundingClientRect()` returns an element's position and size relative to the viewport. Use it to position tooltips, menus, and overlays next to elements. Combine with scroll offsets (`window.scrollX`, `window.scrollY`) to position relative to the document. This is the foundation of all dropdown positioning libraries.",
      files: {
        html: `<div class="page">
  <button class="trigger" id="btn1">Hover for tooltip</button>
  <div id="tooltip" class="tooltip" role="tooltip">This is positioned via getBoundingClientRect()</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 80px; }

.trigger { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 0.95rem; }

.tooltip {
  position: fixed;
  background: #334155;
  color: #f1f5f9;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  pointer-events: none;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s;
}

.tooltip.is-visible { opacity: 1; }`,
        js: `const btn = document.getElementById('btn1');
const tooltip = document.getElementById('tooltip');

btn.addEventListener('mouseenter', () => {
  const rect = btn.getBoundingClientRect();
  // Position tooltip above and centered
  tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
  tooltip.classList.add('is-visible');
});

btn.addEventListener('mouseleave', () => {
  tooltip.classList.remove('is-visible');
});`
      }
    },
    {
      type: 'challenge',
      id: 'ch-mouse-follow',
      text: "Make the `.dot` element follow the mouse cursor precisely. Use a `mousemove` event listener on `document`. Set `dot.style.left` and `dot.style.top` to position it at the cursor. The dot is `position: fixed` and uses `transform: translate(-50%, -50%)` to center on the cursor.",
      hint: "document.addEventListener('mousemove', (e) => { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; });",
      defaultTab: 'js',
      startFiles: {
        html: `<div class="dot" id="dot"></div>
<p class="hint">Your mouse position should be tracked</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: #0f172a; min-height: 100vh; overflow: hidden; }
.dot { position: fixed; width: 24px; height: 24px; background: #3b82f6; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; left: -100px; top: -100px; }
.hint { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); color: #334155; font-family: sans-serif; font-size: 0.85rem; }`,
        js: `const dot = document.getElementById('dot');

// Add a mousemove listener to make the dot follow the cursor`
      },
      validate: (ctx) => {
        const js = ctx.files?.js || '';
        return /mousemove/.test(js) && /style\.left/.test(js) && /style\.top/.test(js);
      }
    },
    {
      type: 'challenge',
      id: 'ch-raf',
      text: "Use `requestAnimationFrame` to animate a `div` moving from left to right across the screen. The `.ball` starts at `left: 0` and should move to `left: calc(100% - 40px)` and back, bouncing continuously. Use a position variable and a direction variable (`1` or `-1`).",
      hint: "let pos = 0, dir = 1; in animate(): pos += dir * 2; if (pos >= max || pos <= 0) dir *= -1; ball.style.left = pos + 'px'; requestAnimationFrame(animate);",
      defaultTab: 'js',
      startFiles: {
        html: `<div class="track">
  <div class="ball" id="ball"></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.track { position: relative; width: 400px; height: 40px; background: #1e293b; border-radius: 20px; }
.ball { position: absolute; width: 40px; height: 40px; background: #3b82f6; border-radius: 50%; left: 0; top: 0; }`,
        js: `const ball = document.getElementById('ball');
let pos = 0;
let dir = 1;
const speed = 2;

function animate() {
  // Move pos, bounce at edges, set ball.style.left
  // Call requestAnimationFrame(animate) to continue
}

requestAnimationFrame(animate);`
      },
      validate: (ctx) => {
        const js = ctx.files?.js || '';
        return /requestAnimationFrame/.test(js) && /style\.left/.test(js) && /dir/.test(js);
      }
    }
  ]
};
