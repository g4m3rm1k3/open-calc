export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-28-variables-js',
  title: '28. CSS Variables & JavaScript',
  chapter: 'css-ch6',
  language: 'web',
  checkpoints: [
    { id: 'cp-setproperty', label: 'setProperty()' },
    { id: 'cp-live-theme', label: 'Live Theming' },
    { id: 'cp-animation-vars', label: 'Animation Control' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You want a color picker that updates the entire app's theme in real time. Every component — buttons, links, borders, shadows — should change the moment the picker moves. Updating CSS custom properties from JavaScript is the cleanest solution: change one variable at the root and the cascade does the rest. No React state, no per-component updates.",
      files: {
        html: `<div class="app">
  <header class="header">
    <span class="logo">Brand</span>
    <button class="btn">Action</button>
  </header>
  <main>
    <div class="card">
      <h2>Live Theme</h2>
      <p>Move the slider to change the theme hue</p>
      <input type="range" id="hue" min="0" max="360" value="220">
    </div>
  </main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

:root {
  --hue: 220;
  --brand: hsl(var(--hue), 70%, 60%);
  --brand-dark: hsl(var(--hue), 70%, 50%);
  --brand-faint: hsl(var(--hue), 70%, 60%, 0.15);
}

body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.header { background: #1e293b; display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-bottom: 1px solid var(--brand-faint); }
.logo { font-weight: 700; color: var(--brand); font-size: 1.1rem; }
.btn { background: var(--brand); color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
.btn:hover { background: var(--brand-dark); }

main { padding: 32px; }
.card { background: #1e293b; padding: 28px; border-radius: 10px; border: 1px solid var(--brand-faint); max-width: 400px; }
h2 { color: var(--brand); margin: 0 0 12px; }
p { color: #94a3b8; margin: 0 0 20px; }
input[type="range"] { width: 100%; accent-color: var(--brand); }`,
        js: `document.getElementById('hue').addEventListener('input', (e) => {
  // One setProperty call — cascade updates everything
  document.documentElement.style.setProperty('--hue', e.target.value);
});`
      }
    },
    {
      type: 'narration',
      id: 'setproperty-syntax',
      defaultTab: 'js',
      text: "`element.style.setProperty('--name', value)` writes a CSS custom property to the element's inline style. `getPropertyValue('--name')` reads it back. These accept the property name as a string including the `--` prefix. Use `removeProperty('--name')` to delete it (fallback to stylesheet value takes effect).",
      files: {
        html: `<div id="box" class="box">Box</div>
<div class="controls">
  <label>Width: <input type="range" id="w" min="80" max="300" value="150"></label>
  <label>Height: <input type="range" id="h" min="40" max="200" value="80"></label>
  <label>Radius: <input type="range" id="r" min="0" max="50" value="10"></label>
  <label>Hue: <input type="range" id="c" min="0" max="360" value="220"></label>
  <button id="reset">Reset (removeProperty)</button>
</div>
<div id="log" class="log"></div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 24px; }

.box {
  width: var(--w, 150px);
  height: var(--h, 80px);
  background: hsl(var(--c, 220), 70%, 60%);
  border-radius: var(--r, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  transition: width 0.1s, height 0.1s, border-radius 0.1s, background 0.1s;
}

.controls { display: flex; flex-direction: column; gap: 10px; color: #94a3b8; font-size: 0.9rem; }
label { display: flex; gap: 12px; align-items: center; }
input[type="range"] { flex: 1; accent-color: #3b82f6; }
button { background: #334155; color: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; align-self: flex-start; }

.log { font-family: monospace; font-size: 0.8rem; color: #64748b; background: #1e293b; padding: 12px 16px; border-radius: 6px; }`,
        js: `const box = document.getElementById('box');
const log = document.getElementById('log');

function updateLog() {
  const cs = getComputedStyle(box);
  log.textContent = [
    'getPropertyValue("--w"): ' + box.style.getPropertyValue('--w'),
    'getPropertyValue("--h"): ' + box.style.getPropertyValue('--h'),
    'computed width: ' + cs.width,
  ].join('\\n');
}

document.getElementById('w').addEventListener('input', (e) => {
  box.style.setProperty('--w', e.target.value + 'px');
  updateLog();
});

document.getElementById('h').addEventListener('input', (e) => {
  box.style.setProperty('--h', e.target.value + 'px');
  updateLog();
});

document.getElementById('r').addEventListener('input', (e) => {
  box.style.setProperty('--r', e.target.value + 'px');
});

document.getElementById('c').addEventListener('input', (e) => {
  box.style.setProperty('--c', e.target.value);
});

document.getElementById('reset').addEventListener('click', () => {
  ['--w', '--h', '--r', '--c'].forEach(v => box.style.removeProperty(v));
  updateLog();
});`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-setproperty'
    },
    {
      type: 'narration',
      id: 'full-theme-picker',
      defaultTab: 'js',
      text: "Here's a complete theme builder: pick primary color, choose dark or light mode, see all components update instantly. The JavaScript sets 4 variables on `:root`. All components read from those variables. This is the pattern used by design systems like Chakra UI and Mantine.",
      files: {
        html: `<div class="theme-builder">
  <div class="controls">
    <label>Accent: <input type="color" id="accent" value="#3b82f6"></label>
    <label>
      Mode:
      <select id="mode">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </label>
  </div>
</div>

<div class="preview">
  <header class="preview-header">
    <span class="preview-logo">Logo</span>
    <nav>
      <a href="#">Docs</a>
      <a href="#">Blog</a>
      <button class="preview-btn">Sign up</button>
    </nav>
  </header>
  <div class="preview-body">
    <div class="preview-card">
      <h2>Welcome</h2>
      <p>This is a live theme preview. Change the controls above.</p>
      <button class="preview-btn outline">Learn more</button>
    </div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; padding: 24px; background: #0a0f1a; color: #f1f5f9; }

:root {
  --accent: #3b82f6;
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
}

.theme-builder { background: #1e293b; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px; display: flex; gap: 24px; }
.controls { display: flex; gap: 20px; align-items: center; color: #94a3b8; font-size: 0.9rem; }
label { display: flex; gap: 8px; align-items: center; }
input[type="color"] { width: 40px; height: 30px; padding: 2px; background: none; border: 1px solid #334155; border-radius: 4px; cursor: pointer; }
select { background: #0f172a; color: #f1f5f9; border: 1px solid #334155; padding: 6px 10px; border-radius: 4px; }

.preview { background: var(--bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
.preview-header { background: var(--surface); padding: 0 24px; height: 52px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
.preview-logo { font-weight: 700; color: var(--accent); }
.preview-header nav { display: flex; align-items: center; gap: 8px; }
.preview-header a { color: var(--text-muted); text-decoration: none; padding: 6px 12px; font-size: 0.9rem; }
.preview-body { padding: 32px; }
.preview-card { background: var(--surface); padding: 28px; border-radius: 10px; border: 1px solid var(--border); max-width: 380px; }
.preview-card h2 { color: var(--accent); margin: 0 0 10px; }
.preview-card p { color: var(--text-muted); margin: 0 0 20px; line-height: 1.6; }
.preview-btn { background: var(--accent); color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
.preview-btn.outline { background: transparent; border: 2px solid var(--accent); color: var(--accent); }`,
        js: `const root = document.documentElement;

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3), 16) / 255;
  let g = parseInt(hex.slice(3,5), 16) / 255;
  let b = parseInt(hex.slice(5,7), 16) / 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0)) / 6; break;
      case g: h = ((b-r)/d + 2) / 6; break;
      default: h = ((r-g)/d + 4) / 6;
    }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

document.getElementById('accent').addEventListener('input', (e) => {
  const [h, s, l] = hexToHsl(e.target.value);
  root.style.setProperty('--accent', \`hsl(\${h},\${s}%,\${l}%)\`);
});

document.getElementById('mode').addEventListener('change', (e) => {
  if (e.target.value === 'light') {
    root.style.setProperty('--bg', '#f8fafc');
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--text', '#0f172a');
    root.style.setProperty('--text-muted', '#64748b');
    root.style.setProperty('--border', '#e2e8f0');
  } else {
    root.style.setProperty('--bg', '#0f172a');
    root.style.setProperty('--surface', '#1e293b');
    root.style.setProperty('--text', '#f1f5f9');
    root.style.setProperty('--text-muted', '#94a3b8');
    root.style.setProperty('--border', '#334155');
  }
});`
      }
    },
    {
      type: 'narration',
      id: 'animation-control',
      defaultTab: 'js',
      text: "CSS custom properties can control animations. Set `--duration` or `--delay` on individual elements from JavaScript before adding an animation class. Each element reads its own variable — same CSS rule, different values per element. This replaces the need for dynamically generated `<style>` tags.",
      files: {
        html: `<div class="grid" id="grid">
  <div class="tile">1</div>
  <div class="tile">2</div>
  <div class="tile">3</div>
  <div class="tile">4</div>
  <div class="tile">5</div>
  <div class="tile">6</div>
  <div class="tile">7</div>
  <div class="tile">8</div>
  <div class="tile">9</div>
</div>
<button id="animate-btn">Animate Grid</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 24px; align-items: flex-start; }

.grid { display: grid; grid-template-columns: repeat(3, 80px); gap: 12px; }

.tile {
  width: 80px; height: 80px;
  background: #1e293b;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 700; color: #334155;
  border: 2px solid #334155;
}

@keyframes pop {
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.tile.is-animating {
  background: #3b82f620;
  color: #3b82f6;
  border-color: #3b82f640;
  animation: pop var(--duration, 0.4s) ease var(--delay, 0s) both;
}

button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 1rem; }`,
        js: `document.getElementById('animate-btn').addEventListener('click', () => {
  const tiles = document.querySelectorAll('.tile');

  tiles.forEach((tile, i) => {
    tile.classList.remove('is-animating');
    // Force reflow to reset animation
    void tile.offsetWidth;

    // Set per-element delay via CSS custom property
    tile.style.setProperty('--delay', (i * 0.07) + 's');
    tile.style.setProperty('--duration', '0.4s');
    tile.classList.add('is-animating');
  });
});`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-animation-vars'
    },
    {
      type: 'narration',
      id: 'staggered-entrance',
      defaultTab: 'js',
      text: "The stagger pattern is one of the most used animation techniques. Each item in a list gets `--i: 0`, `--i: 1`, etc. The CSS uses `calc(var(--i) * 80ms)` for the delay. You set `--i` once from JavaScript, and the entire stagger sequence is declarative CSS.",
      files: {
        html: `<ul class="list" id="list">
  <li>Dashboard</li>
  <li>Analytics</li>
  <li>Reports</li>
  <li>Settings</li>
  <li>Profile</li>
</ul>
<button id="replay">Replay Entrance</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }

.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.list li {
  background: #1e293b;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: 500;
  color: #e2e8f0;
  border-left: 3px solid #3b82f6;
  /* Each item reads its own --i to compute its delay */
  animation: slideIn 0.4s ease calc(var(--i, 0) * 80ms) both;
}

button { background: #334155; color: #f1f5f9; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; }`,
        js: `// Set --i on each list item
function setStagger() {
  document.querySelectorAll('.list li').forEach((item, i) => {
    item.style.setProperty('--i', i);
    // Force re-run animation
    item.style.animation = 'none';
    void item.offsetWidth;
    item.style.animation = '';
  });
}

setStagger();
document.getElementById('replay').addEventListener('click', setStagger);`
      }
    },
    {
      type: 'narration',
      id: 'scroll-progress',
      defaultTab: 'js',
      text: "A scroll progress bar: read `window.scrollY` and the page height, compute a 0-100 percentage, set `--progress` on a progress element. The CSS uses `scaleX(calc(var(--progress) / 100))`. The result: a reading progress indicator that costs 5 lines of JavaScript.",
      files: {
        html: `<div class="progress-bar" id="progress"></div>

<article class="content">
  <h1>Scroll Progress Demo</h1>
  <p>Scroll down to see the progress bar fill up at the top of the page.</p>
  <div class="filler">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.</p>
  </div>
</article>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.progress-bar {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 4px;
  background: #3b82f6;
  transform-origin: left;
  /* JS sets --progress 0–100, CSS maps it to a scale */
  transform: scaleX(calc(var(--progress, 0) / 100));
  transition: transform 0.05s linear;
  z-index: 100;
}

.content { padding: 48px 32px; max-width: 640px; margin: 0 auto; }
h1 { color: #38bdf8; margin: 0 0 16px; }
.filler p { color: #94a3b8; line-height: 1.8; margin: 0 0 16px; }`,
        js: `const progress = document.getElementById('progress');

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.setProperty('--progress', pct.toFixed(2));
}, { passive: true });`
      }
    },
    {
      type: 'narration',
      id: 'observing-mutations',
      defaultTab: 'js',
      text: "Custom properties flow in one direction: JavaScript writes, CSS reads. But CSS can also write back to JavaScript via `getComputedStyle`. A common pattern: CSS sets `--breakpoint: 'mobile'` in a media query, and JavaScript reads it to know which layout mode is active — a CSS-to-JS communication channel.",
      files: {
        html: `<div class="responsive-info" id="info">
  <p>Resize the preview frame to see the active breakpoint</p>
  <p>JS reads from CSS: <strong id="bp-label">—</strong></p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* CSS sets a custom property at different breakpoints */
:root { --breakpoint: 'xs'; }
@media (min-width: 480px) { :root { --breakpoint: 'sm'; } }
@media (min-width: 640px) { :root { --breakpoint: 'md'; } }
@media (min-width: 1024px) { :root { --breakpoint: 'lg'; } }

.responsive-info { background: #1e293b; padding: 24px; border-radius: 10px; }
p { margin: 0 0 12px; color: #94a3b8; }
strong { color: #3b82f6; font-size: 1.1rem; }`,
        js: `const label = document.getElementById('bp-label');

function readBreakpoint() {
  // Read the CSS custom property — CSS-to-JS communication
  const bp = getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint')
    .trim()
    .replace(/['"]/g, '');
  label.textContent = bp || 'unknown';
}

readBreakpoint();
window.addEventListener('resize', readBreakpoint);`
      }
    },
    {
      type: 'challenge',
      id: 'ch-slider-theme',
      text: "Wire up the `#hue` slider to update a `--hue` custom property on `:root`. The card reads `background: hsl(var(--hue), 60%, 20%)` and the button reads `background: hsl(var(--hue), 70%, 55%)`. Moving the slider should update all colors.",
      hint: "document.documentElement.style.setProperty('--hue', e.target.value) in the slider's input event handler.",
      defaultTab: 'js',
      startFiles: {
        html: `<input type="range" id="hue" min="0" max="360" value="220">
<div class="card">
  <h2>Live Color</h2>
  <p>Drag the slider to change the hue</p>
  <button class="btn">Button</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; }
:root { --hue: 220; }
input[type="range"] { width: 200px; }
.card { background: hsl(var(--hue), 60%, 20%); padding: 24px; border-radius: 10px; max-width: 280px; }
.card h2 { color: hsl(var(--hue), 80%, 75%); margin: 0 0 8px; }
.card p { color: hsl(var(--hue), 40%, 60%); margin: 0 0 16px; }
.btn { background: hsl(var(--hue), 70%, 55%); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }`,
        js: `// Wire the #hue slider to update --hue on :root`
      },
      validate: (ctx) => {
        const js = ctx.files?.js || '';
        return /setProperty\(\s*['"]--hue['"]/.test(js) && /documentElement/.test(js);
      }
    },
    {
      type: 'challenge',
      id: 'ch-stagger',
      text: "Set `--i` on each `.item` element using its index (0, 1, 2...). The CSS uses `animation-delay: calc(var(--i) * 100ms)` to stagger the items. Call `document.querySelectorAll('.item').forEach((el, i) => el.style.setProperty('--i', i))` on page load.",
      hint: "document.querySelectorAll('.item').forEach((el, i) => { el.style.setProperty('--i', i); });",
      defaultTab: 'js',
      startFiles: {
        html: `<ul class="list">
  <li class="item">First item</li>
  <li class="item">Second item</li>
  <li class="item">Third item</li>
  <li class="item">Fourth item</li>
</ul>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }
.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
.item {
  background: #1e293b;
  padding: 14px 20px;
  border-radius: 8px;
  color: #e2e8f0;
  opacity: 0;
  animation: fade-in 0.4s ease calc(var(--i, 0) * 100ms) forwards;
}`,
        js: `// Set --i on each .item using its index`
      },
      validate: (ctx) => {
        const js = ctx.files?.js || '';
        return /setProperty\(\s*['"]--i['"]/.test(js) && /querySelectorAll/.test(js);
      }
    }
  ]
};
