import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Code2, LayoutTemplate, ChevronDown, Download, FileDown, Upload } from 'lucide-react'
import { zipSync, strToU8 } from 'fflate'

// ── File helpers ──────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'cell'
}

function triggerDownload(content, filename, mime) {
  const blob = new Blob([content instanceof Uint8Array ? [content] : [content]], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

// Download a single cell as three separate files:
//   index.html  (references style.css and script.js)
//   style.css
//   script.js
// Browsers can only trigger one download at a time, so we use a tiny zip.
function downloadCell(cell, index) {
  const name = cell.label ? slugify(cell.label) : `cell-${index + 1}`
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
${cell.html || ''}
<script src="script.js"><\/script>
</body>
</html>`
  const files = {
    [`${name}/index.html`]: strToU8(html),
    [`${name}/style.css`]:  strToU8(cell.css || ''),
    [`${name}/script.js`]:  strToU8(cell.js  || ''),
  }
  const zipped = zipSync(files)
  triggerDownload(zipped, `${name}.zip`, 'application/zip')
}


// Parse an uploaded file (.html or .css or .js) and return a new cell
function parseUploadedFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const name = file.name
      if (name.endsWith('.html') || name.endsWith('.htm')) {
        const styleMatch  = text.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
        const scriptMatch = text.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i)
        const bodyMatch   = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        resolve({
          id: nextId(),
          label: name.replace(/\.html?$/, ''),
          css:  styleMatch  ? styleMatch[1].trim()  : '',
          js:   scriptMatch ? scriptMatch[1].trim()  : '',
          html: bodyMatch
            ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<link[^>]*>/gi, '').trim()
            : text,
        })
      } else if (name.endsWith('.css')) {
        resolve({ id: nextId(), label: name.replace('.css', ''), html: '', css: text, js: '' })
      } else if (name.endsWith('.js')) {
        resolve({ id: nextId(), label: name.replace('.js', ''), html: '', css: '', js: text })
      } else {
        resolve(null)
      }
    }
    reader.readAsText(file)
  })
}
import Editor from '@monaco-editor/react'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const T = {
  border:   '#334155',
  muted:    '#64748b',
  accent:   '#38bdf8',
  green:    '#34d399',
  red:      '#f87171',
  yellow:   '#fbbf24',
  editorBg: '#0c1222',
}

const TABS = ['html', 'css', 'js']
const TAB_LABEL = { html: 'HTML', css: 'CSS', js: 'JavaScript' }
const MONACO_LANG = { html: 'html', css: 'css', js: 'javascript' }

let _nextId = 10
function nextId() { return _nextId++ }

// ── Pre-built starter cells ───────────────────────────────────────────────────

const DEMO_TORUS = {
  id: nextId(),
  label: 'Three.js Torus Knot',
  html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<canvas id="c"></canvas>`,
  css: `* { margin: 0; padding: 0; }
body { background: #000; overflow: hidden; }
canvas { display: block; width: 100%; height: 100%; }`,
  js: `const canvas = document.getElementById('c');
const W = canvas.offsetWidth || 600, H = canvas.offsetHeight || 300;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
camera.position.z = 4;

// Torus knot
const geo = new THREE.TorusKnotGeometry(1, 0.35, 200, 32, 2, 3);
const mat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.2,
  metalness: 0.8,
  wireframe: false,
});
const knot = new THREE.Mesh(geo, mat);
scene.add(knot);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const point1 = new THREE.PointLight(0x38bdf8, 80, 20);
point1.position.set(3, 3, 3);
scene.add(point1);
const point2 = new THREE.PointLight(0xa78bfa, 60, 20);
point2.position.set(-3, -2, 2);
scene.add(point2);

// Starfield
const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute('position',
    new THREE.Float32BufferAttribute(
      Array.from({ length: 600 }, () => (Math.random() - 0.5) * 40),
      3
    )
  ),
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 })
);
scene.add(stars);

let t = 0;
(function loop() {
  requestAnimationFrame(loop);
  t += 0.008;
  knot.rotation.x = t * 0.7;
  knot.rotation.y = t;
  mat.color.setHSL((t * 0.05) % 1, 0.8, 0.6);
  point1.color.setHSL((t * 0.07 + 0.3) % 1, 1, 0.6);
  stars.rotation.y = t * 0.02;
  renderer.render(scene, camera);
})();`,
}

const DEMO_PARTICLES = {
  id: nextId(),
  label: 'Canvas Constellation',
  html: `<canvas id="c"></canvas>`,
  css: `* { margin: 0; padding: 0; }
body { background: #0f172a; overflow: hidden; }
canvas { display: block; }`,
  js: `const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width  = window.innerWidth  || 600;
canvas.height = window.innerHeight || 300;
const W = canvas.width, H = canvas.height;

const N = 80;
const CONNECT = 110; // px — max distance to draw a line

const pts = Array.from({ length: N }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  vx: (Math.random() - 0.5) * 0.6,
  vy: (Math.random() - 0.5) * 0.6,
  r: Math.random() * 2 + 1,
  hue: Math.random() * 60 + 180, // blue-purple range
}));

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Lines
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECT) {
        const alpha = 1 - d / CONNECT;
        ctx.strokeStyle = \`hsla(\${(pts[i].hue + pts[j].hue) / 2}, 80%, 65%, \${alpha * 0.5})\`;
        ctx.lineWidth = alpha * 1.2;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.stroke();
      }
    }
  }

  // Dots
  pts.forEach(p => {
    ctx.fillStyle = \`hsl(\${p.hue}, 80%, 70%)\`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    // Move + bounce
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
  });

  requestAnimationFrame(draw);
}
draw();`,
}

const DEMO_DOM = {
  id: nextId(),
  label: 'Interactive DOM Card',
  html: `<div class="card" id="card">
  <div class="badge" id="badge">Click me</div>
  <h2 id="title">open-calc</h2>
  <p id="sub">Interactive learning — built on the web.</p>
  <div class="tags" id="tags">
    <span class="tag">HTML</span>
    <span class="tag">CSS</span>
    <span class="tag">JavaScript</span>
  </div>
  <button id="btn">Add a tag</button>
</div>`,
  css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  min-height: 100vh;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', sans-serif;
}
.card {
  background: #1e293b;
  border: 1.5px solid #334155;
  border-radius: 16px;
  padding: 28px 32px;
  width: 320px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(56,189,248,0.15);
  border-color: #38bdf8;
}
.badge {
  display: inline-block;
  background: rgba(56,189,248,0.15);
  color: #38bdf8;
  border: 1px solid rgba(56,189,248,0.3);
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 14px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.badge:hover { background: rgba(56,189,248,0.3); }
h2 { color: #e2e8f0; font-size: 22px; margin-bottom: 6px; }
p  { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 18px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.tag {
  background: #0f172a;
  border: 1px solid #334155;
  color: #94a3b8;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  transition: all 0.15s;
}
.tag:hover { border-color: #38bdf8; color: #38bdf8; }
button {
  padding: 8px 18px;
  background: #0ea5e9;
  border: none; border-radius: 8px;
  color: #fff; font-size: 13px;
  font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
button:hover { background: #38bdf8; }`,
  js: `const badge = document.getElementById('badge');
const title = document.getElementById('title');
const tags  = document.getElementById('tags');
const btn   = document.getElementById('btn');

const newTags = ['DOM', 'Events', 'classList', 'querySelector', 'React', 'Three.js'];
let tagIdx = 0;
let clickCount = 0;

// Badge click — cycle title colours
badge.addEventListener('click', () => {
  clickCount++;
  const hue = (clickCount * 47) % 360;
  title.style.color = \`hsl(\${hue}, 80%, 70%)\`;
  badge.textContent = \`clicked \${clickCount}×\`;
});

// Add tag button
btn.addEventListener('click', () => {
  if (tagIdx >= newTags.length) {
    btn.textContent = 'All tags added!';
    btn.disabled = true;
    return;
  }
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = newTags[tagIdx++];
  tag.style.borderColor = \`hsl(\${Math.random()*360}, 70%, 50%)\`;
  tag.style.color = tag.style.borderColor;
  tags.appendChild(tag);
});`,
}

// ── Template library ──────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank',
    description: 'Empty cell',
    icon: '📄',
    cell: { html: '', css: `* { box-sizing: border-box; margin: 0; }
body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 20px; }`, js: '' },
  },
  {
    id: 'threejs',
    label: 'Three.js Scene',
    description: 'CDN import + renderer setup',
    icon: '🧊',
    cell: {
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>\n<canvas id="c"></canvas>`,
      css: `* { margin: 0; } body { background: #000; overflow: hidden; } canvas { display: block; width: 100%; }`,
      js: `const canvas = document.getElementById('c');
const W = canvas.offsetWidth || 600, H = 300;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(W, H);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
camera.position.z = 3;

const geo = new THREE.BoxGeometry();
const mat = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geo, mat);
scene.add(cube);

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

(function loop() {
  requestAnimationFrame(loop);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
})();`,
    },
  },
  {
    id: 'canvas',
    label: 'Canvas 2D',
    description: 'Blank canvas with draw loop',
    icon: '🎨',
    cell: {
      html: `<canvas id="c"></canvas>`,
      css: `* { margin: 0; } body { background: #0f172a; } canvas { display: block; }`,
      js: `const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width  = 600;
canvas.height = 300;

let t = 0;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Your drawing here
  ctx.fillStyle = \`hsl(\${t % 360}, 70%, 60%)\`;
  ctx.beginPath();
  ctx.arc(300 + Math.cos(t * 0.03) * 100, 150 + Math.sin(t * 0.03) * 80, 30, 0, Math.PI * 2);
  ctx.fill();

  t++;
  requestAnimationFrame(draw);
}
draw();`,
    },
  },
  {
    id: 'dom',
    label: 'DOM Manipulation',
    description: 'querySelector + events',
    icon: '🌳',
    cell: {
      html: `<div id="app">
  <h2 id="title">Hello, DOM</h2>
  <button id="btn">Click me</button>
</div>`,
      css: `* { box-sizing: border-box; } body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 24px; }
h2 { color: #38bdf8; margin-bottom: 16px; }
button { padding: 8px 20px; background: #0ea5e9; border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
button:hover { background: #38bdf8; }`,
      js: `const title = document.querySelector('#title');
const btn   = document.querySelector('#btn');

let count = 0;
btn.addEventListener('click', () => {
  count++;
  title.textContent = \`Clicked \${count} time\${count === 1 ? '' : 's'}!\`;
  title.style.color = \`hsl(\${count * 40 % 360}, 70%, 65%)\`;
});`,
    },
  },
  {
    id: 'css-anim',
    label: 'CSS Animation',
    description: 'Keyframes + transitions',
    icon: '✨',
    cell: {
      html: `<div class="scene">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="label">Pure CSS</div>
</div>`,
      css: `* { margin: 0; box-sizing: border-box; }
body { background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.scene { position: relative; width: 200px; height: 200px; }
.orb {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
  animation: spin 4s linear infinite;
}
.orb-1 { width: 140px; height: 140px; background: radial-gradient(circle, #38bdf8, transparent 70%); top: 0; left: 0; animation-duration: 3s; }
.orb-2 { width: 120px; height: 120px; background: radial-gradient(circle, #a78bfa, transparent 70%); bottom: 0; right: 0; animation-duration: 4s; animation-direction: reverse; }
.orb-3 { width: 100px; height: 100px; background: radial-gradient(circle, #34d399, transparent 70%); top: 50px; left: 50px; animation-duration: 5s; }
@keyframes spin {
  from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
}
.label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Segoe UI', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; }`,
      js: ``,
    },
  },
  {
    id: 'fetch',
    label: 'Fetch API',
    description: 'Load data from a public API',
    icon: '🌐',
    cell: {
      html: `<div id="out">Loading...</div>`,
      css: `body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 20px; }
#out { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; font-size: 13px; white-space: pre-wrap; }`,
      js: `const out = document.getElementById('out');

// Public JSON placeholder
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(res => res.json())
  .then(data => {
    out.textContent = JSON.stringify(data, null, 2);
  })
  .catch(err => {
    out.textContent = 'Error: ' + err.message;
  });`,
    },
  },
  {
    id: 'flexbox',
    label: 'Flexbox Layout',
    description: 'Flex container exploration',
    icon: '📐',
    cell: {
      html: `<div class="toolbar">
  <label>justify-content:
    <select id="jc">
      <option>flex-start</option><option selected>center</option>
      <option>flex-end</option><option>space-between</option>
      <option>space-around</option><option>space-evenly</option>
    </select>
  </label>
  <label>align-items:
    <select id="ai">
      <option>flex-start</option><option selected>center</option>
      <option>flex-end</option><option>stretch</option>
    </select>
  </label>
</div>
<div class="container" id="box">
  <div class="item">1</div>
  <div class="item tall">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; }
body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 16px; font-size: 13px; }
.toolbar { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
label { display: flex; align-items: center; gap: 6px; color: #94a3b8; }
select { background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 4px 8px; border-radius: 6px; }
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1e293b;
  border: 1.5px dashed #334155;
  border-radius: 10px;
  height: 180px;
  gap: 10px;
  transition: all 0.3s;
}
.item { background: #38bdf8; color: #0f172a; font-weight: 700; font-size: 18px; width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.item.tall { height: 80px; background: #a78bfa; }`,
      js: `const box = document.getElementById('box');
document.getElementById('jc').addEventListener('change', e => {
  box.style.justifyContent = e.target.value;
});
document.getElementById('ai').addEventListener('change', e => {
  box.style.alignItems = e.target.value;
});`,
    },
  },
]

// ── Build sandboxed iframe document ──────────────────────────────────────────
function buildDoc(html, css, js) {
  const uid = Math.random().toString(36).slice(2)
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 0; }
${css}
</style>
</head>
<body>
${html}
<script>
window.__id = '${uid}';
(function() {
  const _log = console.log.bind(console);
  const _err = console.error.bind(console);
  const _warn = console.warn.bind(console);
  function post(level, args) {
    const msg = args.map(a => {
      try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
      catch(_) { return String(a); }
    }).join(' ');
    window.parent.postMessage({ type: 'jspg_console', level, msg, uid: window.__id }, '*');
  }
  console.log   = (...a) => { _log(...a);  post('log',  a); };
  console.error = (...a) => { _err(...a);  post('error',a); };
  console.warn  = (...a) => { _warn(...a); post('warn', a); };
  window.addEventListener('error', e => { post('error', [e.message + ' (line ' + e.lineno + ')']); e.preventDefault(); });
  window.addEventListener('unhandledrejection', e => { post('error', ['Unhandled rejection: ' + e.reason]); e.preventDefault(); });
})();
try {
${js}
} catch(e) { console.error('Runtime error: ' + e.message); }
<\/script>
</body>
</html>`
}

// ── Console panel ─────────────────────────────────────────────────────────────
function ConsolePanel({ logs }) {
  if (logs.length === 0) return null
  const color = { log: '#e2e8f0', error: T.red, warn: T.yellow }
  const icon  = { log: '›', error: '✗', warn: '⚠' }
  return (
    <div style={{ background: '#080e18', borderTop: `1px solid ${T.border}`, padding: '8px 14px', maxHeight: 110, overflowY: 'auto' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Console</div>
      {logs.map((l, i) => (
        <div key={i} style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, color: color[l.level] || '#e2e8f0', display: 'flex', gap: 8 }}>
          <span style={{ color: T.muted, flexShrink: 0 }}>{icon[l.level]}</span>
          <span style={{ wordBreak: 'break-all' }}>{l.msg}</span>
        </div>
      ))}
    </div>
  )
}

// ── Template picker ───────────────────────────────────────────────────────────
function TemplatePicker({ onInsert, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={{
        position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
        background: '#0f172a', border: `1px solid ${T.border}`,
        borderRadius: 12, padding: 12, width: 320, zIndex: 50,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>Insert Template</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => { onInsert(t); onClose(); }}
            style={{
              background: '#1e293b', border: `1px solid ${T.border}`,
              borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
              textAlign: 'left', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{t.label}</div>
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{t.description}</div>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Single cell ───────────────────────────────────────────────────────────────
function PlaygroundCell({ cell, onChange, onDelete, canDelete }) {
  const iframeRef = useRef(null)
  const iframeUidRef = useRef(null)
  const debounceRef = useRef(null)
  const uploadRef = useRef(null)
  const [activeTab, setActiveTab] = useState(cell.html ? 'html' : 'js')
  const [logs, setLogs] = useState([])
  const [showTemplates, setShowTemplates] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const imported = await parseUploadedFile(file)
    if (!imported) return
    // Merge into current cell — put content in the matching tab
    onChange({
      ...cell,
      html: imported.html !== '' ? imported.html : cell.html,
      css:  imported.css  !== '' ? imported.css  : cell.css,
      js:   imported.js   !== '' ? imported.js   : cell.js,
    })
    // Switch to whichever tab has the new content
    if (file.name.endsWith('.css')) setActiveTab('css')
    else if (file.name.endsWith('.js')) setActiveTab('js')
    else setActiveTab('html')
  }

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== 'jspg_console') return
      if (e.data.uid !== iframeUidRef.current) return
      setLogs(prev => [...prev.slice(-49), { level: e.data.level, msg: e.data.msg }])
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const updatePreview = useCallback((html, css, js) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLogs([])
      const doc = buildDoc(html, css, js)
      const match = doc.match(/window\.__id = '([^']+)'/)
      if (match) iframeUidRef.current = match[1]
      if (iframeRef.current) iframeRef.current.srcdoc = doc
    }, 700)
  }, [])

  useEffect(() => {
    updatePreview(cell.html, cell.css, cell.js)
  }, [cell.html, cell.css, cell.js, updatePreview])

  const handleChange = (val = '') => onChange({ ...cell, [activeTab]: val })

  const insertTemplate = (template) => {
    onChange({ ...cell, html: template.cell.html, css: template.cell.css, js: template.cell.js })
    setActiveTab('html')
  }

  const editorValue = cell[activeTab] || ''
  const lineCount = editorValue.split('\n').length
  const editorHeight = Math.min(300, Math.max(100, lineCount * 20 + 28))

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
      {/* Live preview */}
      <div style={{ background: '#0a1016', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: '.08em', textTransform: 'uppercase', padding: '6px 12px 0' }}>Preview</div>
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          style={{ width: '100%', height: cell.previewHeight || 200, border: 'none', display: 'block' }}
          title={`cell-${cell.id}`}
        />
      </div>

      {/* Tab bar + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0c1520', borderBottom: `1px solid ${T.border}`, padding: '0 8px', position: 'relative' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '7px 14px', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${T.accent}` : '2px solid transparent',
              color: activeTab === tab ? T.accent : T.muted,
              fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '.04em',
            }}>
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 0', position: 'relative' }}>

          {/* Templates */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTemplates(s => !s)}
              style={{ background: 'transparent', border: `0.5px solid ${T.border}`, borderRadius: 6, color: T.muted, cursor: 'pointer', padding: '3px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <LayoutTemplate size={11} /> Templates <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {showTemplates && (
                <TemplatePicker onInsert={insertTemplate} onClose={() => setShowTemplates(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* Upload a file into this cell */}
          <input
            ref={uploadRef}
            type="file"
            accept=".html,.htm,.css,.js"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <button
            onClick={() => uploadRef.current?.click()}
            title="Upload .html / .css / .js into this cell"
            style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center' }}
          >
            <Upload size={13} />
          </button>

          {/* Download — individual files (zip) */}
          <button
            onClick={() => downloadCell(cell, 0)}
            title="Download as index.html + style.css + script.js (zip)"
            style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center' }}
          >
            <Download size={13} />
          </button>

          {/* Download — combined single HTML file */}
          <button
            onClick={() => {
              const name = cell.label ? slugify(cell.label) : 'cell'
              const combined = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<style>
${cell.css || ''}
</style>
</head>
<body>
${cell.html || ''}
<script>
${cell.js || ''}
<\/script>
</body>
</html>`
              triggerDownload(combined, `${name}.html`, 'text/html')
            }}
            title="Download as single combined .html file"
            style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center' }}
          >
            <FileDown size={13} />
          </button>

          {canDelete && (
            <button onClick={onDelete} title="Delete cell" style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Monaco editor */}
      <div style={{ background: T.editorBg }}>
        <Editor
          key={`${cell.id}-${activeTab}`}
          height={editorHeight}
          language={MONACO_LANG[activeTab]}
          value={editorValue}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            fontSize: 12, lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on', tabSize: 2,
            renderLineHighlight: 'none',
            overviewRulerLanes: 0, folding: false,
            lineDecorationsWidth: 4, lineNumbersMinChars: 3,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>

      <ConsolePanel logs={logs} />
    </div>
  )
}

// ── Main GlobalJSPlayground ───────────────────────────────────────────────────
function makeBlank() {
  return {
    id: nextId(), html: '', css: `* { box-sizing: border-box; margin: 0; }
body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; padding: 20px; }`, js: '',
  }
}

const INITIAL_CELLS = [
  { ...DEMO_TORUS,     previewHeight: 280 },
  { ...DEMO_PARTICLES, previewHeight: 220 },
  { ...DEMO_DOM,       previewHeight: 240 },
]

export default function GlobalJSPlayground({ isOpen, onClose }) {
  const [cells, setCells] = useState(INITIAL_CELLS)

  const updateCell = (id, updated) => setCells(prev => prev.map(c => c.id === id ? updated : c))
  const deleteCell = (id) => setCells(prev => prev.filter(c => c.id !== id))
  const addCell = () => setCells(prev => [...prev, makeBlank()])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto lg:hidden"
        />
        <motion.div
          initial={{ x: 600, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 600, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-3xl h-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col pointer-events-auto overflow-hidden"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
                <Code2 size={14} />
              </div>
              <h2 className="text-md font-bold text-slate-800 dark:text-white">JS Playground</h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">sandboxed · live preview</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X size={20} />
            </button>
          </header>

          {/* Cells */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 dark:bg-slate-950/30 custom-scrollbar">
            {cells.map(cell => (
              <PlaygroundCell
                key={cell.id}
                cell={cell}
                onChange={updated => updateCell(cell.id, updated)}
                onDelete={() => deleteCell(cell.id)}
                canDelete={cells.length > 1}
              />
            ))}
            <button
              onClick={addCell}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1.5px dashed ${T.border}`, background: 'transparent', color: T.muted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={14} /> Add cell
            </button>
          </div>

          <footer className="p-3 px-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 shrink-0 text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Sandboxed · No page access · Live preview · Press J to toggle
            </p>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
