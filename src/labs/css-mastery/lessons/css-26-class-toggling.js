export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-26-class-toggling',
  title: '26. Class Toggling',
  chapter: 'css-ch6',
  language: 'web',
  checkpoints: [
    { id: 'cp-classlist', label: 'classList API' },
    { id: 'cp-state-classes', label: 'State Classes' },
    { id: 'cp-data-attrs', label: 'Data Attributes' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'html',
      text: "You want a nav menu to open when a button is clicked. Your first instinct: write JavaScript that reads the current state and sets `element.style.display = 'none'` or `'block'`. This puts layout logic in JavaScript. Two months later you want to animate it — but you can't transition `display`. The right approach: let JavaScript only toggle a class, and let CSS own the visual state entirely.",
      files: {
        html: `<nav id="nav" class="nav">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Work</a>
</nav>
<button onclick="
  const nav = document.getElementById('nav');
  if (nav.style.display === 'none') {
    nav.style.display = 'flex'; // JS owns the visual state — bad
  } else {
    nav.style.display = 'none';
  }
">Toggle (style.display — wrong way)</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }

.nav { display: flex; flex-direction: column; gap: 4px; background: #1e293b; padding: 12px; border-radius: 8px; }
.nav a { color: #94a3b8; text-decoration: none; padding: 10px 16px; border-radius: 6px; }
.nav a:hover { background: #334155; color: #f1f5f9; }

button { background: #334155; color: #f1f5f9; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'classlist-api',
      defaultTab: 'js',
      text: "`classList` is the right tool. It gives you `add()`, `remove()`, `toggle()`, and `contains()`. `toggle()` is one line: if the class is present, it removes it; if absent, it adds it. JavaScript sets the state — CSS owns the visual. This separation means you can change how the menu looks without ever touching JavaScript.",
      files: {
        html: `<nav id="nav" class="nav">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Work</a>
</nav>
<button id="btn">Toggle Menu</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }

.nav { display: flex; flex-direction: column; gap: 4px; background: #1e293b; padding: 12px; border-radius: 8px; max-height: 200px; overflow: hidden; transition: max-height 0.3s ease, opacity 0.3s ease; opacity: 1; }
.nav.is-hidden { max-height: 0; opacity: 0; padding: 0; }

.nav a { color: #94a3b8; text-decoration: none; padding: 10px 16px; border-radius: 6px; }
.nav a:hover { background: #334155; color: #f1f5f9; }

#btn { background: #334155; color: #f1f5f9; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }`,
        js: `document.getElementById('btn').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('is-hidden');
});`
      }
    },
    {
      type: 'narration',
      id: 'toggle-return',
      defaultTab: 'js',
      text: "`classList.toggle()` returns `true` if the class was added, `false` if removed. This lets you update button text or aria attributes in one expression. You can also pass a second argument to force-add or force-remove: `toggle('is-active', condition)` where `condition` is a boolean.",
      files: {
        html: `<div class="theme-toggle">
  <button id="theme-btn" aria-pressed="false">☀ Light Mode</button>
  <p>Current: <span id="mode-label">light</span></p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.theme-toggle { background: #1e293b; padding: 24px; border-radius: 10px; display: inline-flex; flex-direction: column; gap: 12px; }
#theme-btn { background: #f1f5f9; color: #0f172a; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 1rem; transition: background 0.2s, color 0.2s; }
p { margin: 0; color: #94a3b8; }
#mode-label { color: #38bdf8; font-weight: 600; }`,
        js: `const btn = document.getElementById('theme-btn');
const label = document.getElementById('mode-label');

btn.addEventListener('click', () => {
  // toggle() returns true if class was ADDED
  const isDark = document.body.classList.toggle('dark-mode');

  btn.setAttribute('aria-pressed', isDark);
  btn.textContent = isDark ? '🌙 Dark Mode' : '☀ Light Mode';
  label.textContent = isDark ? 'dark' : 'light';
});`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-classlist'
    },
    {
      type: 'narration',
      id: 'state-classes',
      defaultTab: 'css',
      text: "The convention for state classes is a BEM-style prefix: `.is-active`, `.is-open`, `.is-loading`, `.is-disabled`, `.has-error`. The `is-` prefix signals this is a temporary JavaScript-controlled state, not a permanent design class. This makes it immediately clear in CSS: `.card.is-selected` means a card in a selected state.",
      files: {
        html: `<ul class="menu" id="menu">
  <li class="menu-item is-active" data-id="home">Home</li>
  <li class="menu-item" data-id="about">About</li>
  <li class="menu-item" data-id="work">Work</li>
  <li class="menu-item" data-id="contact">Contact</li>
</ul>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.menu { list-style: none; padding: 0; margin: 0; background: #1e293b; border-radius: 10px; overflow: hidden; }
.menu-item { padding: 14px 20px; cursor: pointer; color: #94a3b8; border-bottom: 1px solid #334155; transition: background 0.15s, color 0.15s; }
.menu-item:last-child { border-bottom: none; }
.menu-item:hover { background: #334155; color: #e2e8f0; }

/* State class drives the active visual */
.menu-item.is-active { background: #3b82f620; color: #3b82f6; font-weight: 600; border-left: 3px solid #3b82f6; padding-left: 17px; }`,
        js: `document.getElementById('menu').addEventListener('click', (e) => {
  const item = e.target.closest('.menu-item');
  if (!item) return;

  // Remove is-active from all, add to clicked
  document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('is-active'));
  item.classList.add('is-active');
});`
      }
    },
    {
      type: 'narration',
      id: 'body-state',
      defaultTab: 'css',
      text: "Toggling a class on `<body>` or `<html>` is a powerful pattern for global UI states: dark mode, sidebar-open, modal-open, loading. Child components use CSS descendant selectors to respond. No prop drilling, no React context — just the cascade.",
      files: {
        html: `<button id="toggle-sidebar">☰ Toggle Sidebar</button>

<div class="layout">
  <aside class="sidebar">
    <p>Sidebar</p>
    <nav>
      <a href="#">Item 1</a>
      <a href="#">Item 2</a>
      <a href="#">Item 3</a>
    </nav>
  </aside>
  <main class="content">
    <p>Main content area. Sidebar collapses when body has .sidebar-closed.</p>
  </main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }

.layout { display: flex; gap: 16px; margin-top: 16px; height: 200px; }

.sidebar { background: #1e293b; border-radius: 8px; padding: 16px; width: 200px; flex-shrink: 0; overflow: hidden; transition: width 0.3s ease, padding 0.3s ease, opacity 0.3s ease; opacity: 1; }
.sidebar nav { display: flex; flex-direction: column; gap: 4px; margin-top: 12px; }
.sidebar a { color: #94a3b8; text-decoration: none; padding: 8px 10px; border-radius: 4px; font-size: 0.9rem; }

/* Body-level state drives sidebar collapse */
body.sidebar-closed .sidebar { width: 0; padding: 0; opacity: 0; }

.content { flex: 1; background: #1e293b; border-radius: 8px; padding: 16px; color: #94a3b8; }
#toggle-sidebar { background: #334155; color: #f1f5f9; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; }`,
        js: `document.getElementById('toggle-sidebar').addEventListener('click', () => {
  document.body.classList.toggle('sidebar-closed');
});`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-state-classes'
    },
    {
      type: 'narration',
      id: 'data-attributes',
      defaultTab: 'js',
      text: "`data-*` attributes can drive CSS via `[data-state]` selectors. This is the pattern used by Radix UI, Headless UI, and most modern component libraries. Setting `data-state=\"open\"` via JavaScript lets CSS target `[data-state=\"open\"]` — it separates semantic state from presentational classes.",
      files: {
        html: `<div class="tabs">
  <div class="tab-list" role="tablist">
    <button class="tab" data-state="active" onclick="setTab(this, 'p1')">Tab 1</button>
    <button class="tab" data-state="inactive" onclick="setTab(this, 'p2')">Tab 2</button>
    <button class="tab" data-state="inactive" onclick="setTab(this, 'p3')">Tab 3</button>
  </div>
  <div class="tab-panel" id="p1" data-state="active">Panel 1 content</div>
  <div class="tab-panel" id="p2" data-state="inactive">Panel 2 content</div>
  <div class="tab-panel" id="p3" data-state="inactive">Panel 3 content</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.tabs { background: #1e293b; border-radius: 10px; overflow: hidden; max-width: 440px; }
.tab-list { display: flex; background: #0f172a; }
.tab { flex: 1; padding: 12px; border: none; background: transparent; color: #64748b; cursor: pointer; font-size: 0.95rem; transition: color 0.15s; border-bottom: 2px solid transparent; }
.tab:hover { color: #94a3b8; }

/* data-state drives active styling — no .is-active class needed */
.tab[data-state="active"] { color: #3b82f6; border-bottom-color: #3b82f6; background: #1e293b; }

.tab-panel { padding: 24px; display: none; color: #94a3b8; }
.tab-panel[data-state="active"] { display: block; }`,
        js: `function setTab(clickedTab, panelId) {
  // Update tab states
  document.querySelectorAll('.tab').forEach(t => t.dataset.state = 'inactive');
  clickedTab.dataset.state = 'active';

  // Update panel states
  document.querySelectorAll('.tab-panel').forEach(p => p.dataset.state = 'inactive');
  document.getElementById(panelId).dataset.state = 'active';
}`
      }
    },
    {
      type: 'narration',
      id: 'custom-property-state',
      defaultTab: 'js',
      text: "Another pattern: use CSS custom properties to communicate state from JavaScript to CSS. Set a `--progress` variable via `element.style.setProperty('--progress', value)` and let CSS use it in `calc()`, `conic-gradient()`, or animations. The JavaScript sets values; CSS transforms them visually.",
      files: {
        html: `<div class="progress-ring" id="ring">
  <svg viewBox="0 0 100 100">
    <circle class="track" cx="50" cy="50" r="40"/>
    <circle class="fill" cx="50" cy="50" r="40"/>
  </svg>
  <span class="label" id="pct">60%</span>
</div>

<input type="range" id="slider" min="0" max="100" value="60">`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 24px; align-items: flex-start; }

.progress-ring { position: relative; width: 120px; height: 120px; }
.progress-ring svg { transform: rotate(-90deg); }

.track { fill: none; stroke: #334155; stroke-width: 8; }
.fill {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 251.2; /* 2π × 40 */
  /* CSS reads --progress from inline style set by JS */
  stroke-dashoffset: calc(251.2 - (251.2 * var(--progress, 60) / 100));
  transition: stroke-dashoffset 0.3s ease;
}

.label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; color: #e2e8f0; }
input[type="range"] { accent-color: #3b82f6; width: 200px; }`,
        js: `const ring = document.getElementById('ring');
const fill = ring.querySelector('.fill');
const pct = document.getElementById('pct');
const slider = document.getElementById('slider');

slider.addEventListener('input', () => {
  const value = slider.value;
  // Set CSS custom property — CSS handles the visual update
  fill.style.setProperty('--progress', value);
  pct.textContent = value + '%';
});`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-data-attrs'
    },
    {
      type: 'narration',
      id: 'accordion-pattern',
      defaultTab: 'css',
      text: "Let's build the classic accordion component the right way. JavaScript manages the `aria-expanded` attribute for accessibility. CSS reads `[aria-expanded=\"true\"]` to animate the panel open. The panel uses `max-height` transition since `height: auto` can't be transitioned directly (without `interpolate-size`).",
      files: {
        html: `<div class="accordion" id="accordion">
  <div class="panel">
    <button class="panel-header" aria-expanded="false">
      <span>What is the box model?</span>
      <span class="icon">▸</span>
    </button>
    <div class="panel-body">
      <p>The box model describes how the browser calculates the space an element takes up: content + padding + border + margin.</p>
    </div>
  </div>
  <div class="panel">
    <button class="panel-header" aria-expanded="true">
      <span>What is flexbox?</span>
      <span class="icon">▸</span>
    </button>
    <div class="panel-body">
      <p>Flexbox is a one-dimensional layout system. It distributes space along a main axis and aligns items on the cross axis.</p>
    </div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.accordion { max-width: 520px; display: flex; flex-direction: column; gap: 8px; }

.panel { background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid #334155; }

.panel-header { width: 100%; background: none; border: none; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; color: #e2e8f0; font-size: 1rem; font-weight: 600; text-align: left; }

.icon { color: #3b82f6; transition: transform 0.25s ease; display: inline-block; }

/* aria-expanded drives the visual */
.panel-header[aria-expanded="true"] .icon { transform: rotate(90deg); }

.panel-body { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.panel-header[aria-expanded="true"] + .panel-body { max-height: 200px; }

.panel-body p { padding: 4px 20px 20px; margin: 0; color: #94a3b8; line-height: 1.7; }`,
        js: `document.getElementById('accordion').addEventListener('click', (e) => {
  const header = e.target.closest('.panel-header');
  if (!header) return;

  const isOpen = header.getAttribute('aria-expanded') === 'true';
  header.setAttribute('aria-expanded', !isOpen);
});`
      }
    },
    {
      type: 'challenge',
      id: 'ch-toggle-theme',
      text: "Wire up the button to toggle a `dark` class on `<body>`. Write CSS so `body.dark` gets `background: #0f172a` and `color: #f1f5f9`, while the default (light) is `background: #ffffff` and `color: #1e293b`.",
      hint: "In JS: document.body.classList.toggle('dark'). In CSS: body.dark { background: #0f172a; color: #f1f5f9; }",
      defaultTab: 'js',
      startFiles: {
        html: `<button id="toggle">Toggle Theme</button>
<p>The page background and text should change.</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #ffffff; color: #1e293b; padding: 32px; transition: background 0.3s, color 0.3s; }
button { padding: 10px 20px; border-radius: 6px; border: 2px solid currentColor; background: transparent; color: inherit; cursor: pointer; font-size: 1rem; }

/* Add dark mode styles here */`,
        js: `// Wire up the button to toggle 'dark' on document.body`
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const js = ctx.files?.js || '';
        return /body\.dark/.test(css) && /classList\.toggle\(['"']dark['"']\)/.test(js);
      }
    },
    {
      type: 'challenge',
      id: 'ch-tabs',
      text: "Complete the tabs component. In JavaScript, toggle the `is-active` class: remove it from all tabs and panels, add it to the clicked tab and corresponding panel. In CSS, make `.tab.is-active` have `color: #3b82f6` and a blue bottom border.",
      hint: "In JS: tabs.forEach(t => t.classList.remove('is-active')), then tab.classList.add('is-active'). Match the panel by reading data-panel from the tab.",
      defaultTab: 'js',
      startFiles: {
        html: `<div class="tab-bar">
  <button class="tab is-active" data-panel="a">Tab A</button>
  <button class="tab" data-panel="b">Tab B</button>
  <button class="tab" data-panel="c">Tab C</button>
</div>
<div class="panels">
  <div class="panel is-active" id="a">Panel A content</div>
  <div class="panel" id="b">Panel B content</div>
  <div class="panel" id="c">Panel C content</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.tab-bar { display: flex; background: #1e293b; border-radius: 8px 8px 0 0; overflow: hidden; }
.tab { flex: 1; padding: 14px; background: none; border: none; color: #64748b; cursor: pointer; font-size: 0.95rem; border-bottom: 2px solid transparent; transition: color 0.15s; }

/* Add .is-active styles */

.panels { background: #1e293b; border-radius: 0 0 8px 8px; border-top: 1px solid #334155; }
.panel { display: none; padding: 20px; color: #94a3b8; }
.panel.is-active { display: block; }`,
        js: `const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove is-active from all tabs and panels
    // Add is-active to clicked tab and matching panel
  });
});`
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const js = ctx.files?.js || '';
        return /\.tab\.is-active/.test(css) && /classList\.remove\(['"']is-active['"']\)/.test(js) &&
          /classList\.add\(['"']is-active['"']\)/.test(js);
      }
    }
  ]
};
