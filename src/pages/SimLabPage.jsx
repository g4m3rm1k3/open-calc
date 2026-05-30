import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../utils/monacoThemes.js'
import { SIM_TEMPLATES } from '../data/simTemplates.js'
import { Play, RotateCcw, ChevronDown, Terminal, Code2, X, Sun, Moon, ArrowLeft } from 'lucide-react'

// ── Snippet library ───────────────────────────────────────────────────────────
const SNIPPETS = [
  {
    category: 'Physics',
    color: 'text-sky-400',
    items: [
      { label: 'Euler step', code: `// Euler integration\nvx += ax * dt\nvy += ay * dt\nx  += vx * dt\ny  += vy * dt` },
      { label: 'RK4 (1D)', code: `function rk4(y, v, accel, dt) {\n  const k1v = accel(y, v),         k1y = v\n  const k2v = accel(y+k1y*dt/2, v+k1v*dt/2), k2y = v+k1v*dt/2\n  const k3v = accel(y+k2y*dt/2, v+k2v*dt/2), k3y = v+k2v*dt/2\n  const k4v = accel(y+k3y*dt,   v+k3v*dt),   k4y = v+k3v*dt\n  return {\n    y: y + dt/6*(k1y+2*k2y+2*k3y+k4y),\n    v: v + dt/6*(k1v+2*k2v+2*k3v+k4v)\n  }\n}` },
      { label: 'Spring force', code: `const k = 10, b = 0.4, rest = 0\nconst F = -k*(x - rest) - b*vx` },
      { label: 'Gravity (2-body)', code: `const G = 6.674e-11\nfunction gravForce(p1, m1, p2, m2) {\n  const dx = p2.x-p1.x, dy = p2.y-p1.y\n  const r  = Math.hypot(dx, dy)\n  const f  = G*m1*m2 / (r*r)\n  return { fx: f*dx/r, fy: f*dy/r }\n}` },
      { label: 'Bounce', code: `if (pos.y < 0.3) { pos.y = 0.3; vel.y *= -0.75 }` },
    ],
  },
  {
    category: 'Canvas 2D',
    color: 'text-emerald-400',
    items: [
      { label: 'Clear', code: `ctx.fillStyle = '#02060f'\nctx.fillRect(0, 0, W, H)` },
      { label: 'Circle', code: `ctx.beginPath()\nctx.arc(cx, cy, r, 0, Math.PI*2)\nctx.fillStyle = '#44aaff'\nctx.fill()` },
      { label: 'Line', code: `ctx.beginPath()\nctx.moveTo(x1, y1)\nctx.lineTo(x2, y2)\nctx.strokeStyle = '#ffffff'\nctx.lineWidth = 2\nctx.stroke()` },
      { label: 'Dashed line', code: `ctx.setLineDash([6, 4])\nctx.beginPath()\nctx.moveTo(x1, y1)\nctx.lineTo(x2, y2)\nctx.stroke()\nctx.setLineDash([])` },
      { label: 'Grid', code: `const step = 50\nctx.strokeStyle = '#0a1825'; ctx.lineWidth = 1\nfor (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }\nfor (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }` },
      { label: 'Axes', code: `const ox = W/2, oy = H/2\nctx.strokeStyle = '#1e3a50'; ctx.lineWidth = 2\nctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke()\nctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke()` },
    ],
  },
  {
    category: 'Three.js',
    color: 'text-violet-400',
    items: [
      { label: 'Sphere', code: `const mesh = new THREE.Mesh(\n  new THREE.SphereGeometry(0.5, 16, 16),\n  new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x112233 })\n)\nscene.add(mesh)` },
      { label: 'Box', code: `const box = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshStandardMaterial({ color: 0xff8800 })\n)\nscene.add(box)` },
      { label: 'Trail line', code: `// call inside update() to draw a trailing path\ntrail.push(new THREE.Vector3(x, y, z))\nif (trail.length > 300) trail.shift()\nif (trailLine) scene.remove(trailLine)\ntrailLine = new THREE.Line(\n  new THREE.BufferGeometry().setFromPoints(trail),\n  new THREE.LineBasicMaterial({ color: 0x00ffcc })\n)\nscene.add(trailLine)` },
      { label: 'Point light', code: `const light = new THREE.PointLight(0xffffff, 1.5, 50)\nlight.position.set(5, 10, 5)\nscene.add(light)` },
      { label: 'Grid', code: `scene.add(new THREE.GridHelper(40, 20, 0x1a2a44, 0x0d1122))` },
    ],
  },
  {
    category: 'Math',
    color: 'text-amber-400',
    items: [
      { label: 'Clamp', code: `const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))` },
      { label: 'Lerp', code: `const lerp = (a, b, t) => a + (b - a) * t` },
      { label: 'Polar → XY', code: `const x = r * Math.cos(theta)\nconst y = r * Math.sin(theta)` },
      { label: 'Normalize 2D', code: `function normalize(vx, vy) {\n  const len = Math.hypot(vx, vy) || 1\n  return { x: vx/len, y: vy/len }\n}` },
      { label: 'Rotation matrix 2D', code: `function rotate2d(x, y, angle) {\n  const c = Math.cos(angle), s = Math.sin(angle)\n  return { x: c*x - s*y, y: s*x + c*y }\n}` },
      { label: '4×4 identity', code: `const I = new THREE.Matrix4().identity()` },
    ],
  },
]

// ── Sandbox srcdoc (supports 3D Three.js and 2D Canvas) ────────────────────
function buildSandbox() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box }
  body { background:#02060f; overflow:hidden; transition:background 0.25s }
  body > canvas { position:absolute; top:0; left:0; display:block }
  #c2d { position:absolute; top:0; left:0; display:none }
  #err { position:fixed; bottom:0; left:0; right:0; padding:8px 14px;
         background:rgba(20,4,4,0.95); color:#ff6b6b; font:11px/1.6 monospace;
         white-space:pre-wrap; border-top:1px solid #ff4444; display:none;
         z-index:9; max-height:7em; overflow-y:auto }
</style>
</head>
<body>
<div id="err"></div>
<canvas id="c2d"></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script>
let scene, camera, renderer, controls
let animId = null, userUpdate = null, lastTs = 0
let currentMode = '3d'
const c2d = document.getElementById('c2d')

// ── Three.js setup ────────────────────────────────────────────────────────────
scene    = new THREE.Scene()
scene.background = new THREE.Color(0x02060f)
scene.fog = new THREE.FogExp2(0x02060f, 0.01)
camera   = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0, 8, 20)
renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)
controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  if (currentMode === '2d') { c2d.width = innerWidth; c2d.height = innerHeight }
})

function addDefaultLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(8, 16, 8)
  sun.castShadow = true
  scene.add(sun)
}

function clearScene() {
  while (scene.children.length) scene.remove(scene.children[0])
  addDefaultLights()
}

// ── Mode switching ─────────────────────────────────────────────────────────────
function switchMode(mode) {
  currentMode = mode
  if (mode === '3d') {
    renderer.domElement.style.display = 'block'
    c2d.style.display = 'none'
  } else {
    renderer.domElement.style.display = 'none'
    c2d.style.display = 'block'
    c2d.width  = innerWidth
    c2d.height = innerHeight
  }
}

// ── Error / console helpers ────────────────────────────────────────────────────
function showError(msg) { const el=document.getElementById('err'); el.textContent=msg; el.style.display='block' }
function hideError()    { document.getElementById('err').style.display='none' }

const _log  = console.log.bind(console)
console.log = (...a) => { _log(...a);  parent.postMessage({ type:'log', level:'log',   args:a.map(String) },'*') }
const _warn = console.warn.bind(console)
console.warn= (...a) => { _warn(...a); parent.postMessage({ type:'log', level:'warn',  args:a.map(String) },'*') }
const _err2 = console.error.bind(console)
console.error=(...a)=> { _err2(...a); parent.postMessage({ type:'log', level:'error', args:a.map(String) },'*') }

// ── Animation loops ───────────────────────────────────────────────────────────
function loop3d(ts) {
  animId = requestAnimationFrame(loop3d)
  const dt = Math.min((ts-lastTs)/1000, 0.05); lastTs = ts
  controls.update()
  if (userUpdate) { try { userUpdate(dt) } catch(e) { showError(e.message); userUpdate=null } }
}
function loop2d(ts) {
  animId = requestAnimationFrame(loop2d)
  const dt = Math.min((ts-lastTs)/1000, 0.05); lastTs = ts
  if (userUpdate) { try { userUpdate(dt) } catch(e) { showError(e.message); userUpdate=null } }
}
function stopLoop() { if (animId) { cancelAnimationFrame(animId); animId=null } userUpdate=null }

// ── Message handler ────────────────────────────────────────────────────────────
window.addEventListener('message', ({ data }) => {
  if (!data) return

  if (data.type === 'run') {
    stopLoop(); hideError()
    const mode = data.mode || '3d'
    switchMode(mode)

    if (mode === '2d') {
      const ctx = c2d.getContext('2d')
      const W   = c2d.width, H = c2d.height
      try {
        const fn = new Function('canvas','ctx','W','H', data.code + '\\nreturn { init, update }')
        const { init, update } = fn(c2d, ctx, W, H)
        init()
        userUpdate = update
        lastTs = performance.now()
        animId = requestAnimationFrame(loop2d)
      } catch(e) {
        showError(e.toString())
        parent.postMessage({ type:'error', message:e.toString() }, '*')
      }
    } else {
      clearScene()
      try {
        const fn = new Function('scene','camera','renderer','controls','THREE', data.code + '\\nreturn { init, update }')
        const { init, update } = fn(scene, camera, renderer, controls, THREE)
        init()
        userUpdate = update
        lastTs = performance.now()
        animId = requestAnimationFrame(loop3d)
      } catch(e) {
        showError(e.toString())
        parent.postMessage({ type:'error', message:e.toString() }, '*')
      }
    }
  }

  if (data.type === 'reset') {
    stopLoop(); hideError()
    if (currentMode === '3d') { clearScene(); renderer.render(scene, camera) }
    else { const ctx=c2d.getContext('2d'); ctx.clearRect(0,0,c2d.width,c2d.height) }
  }

  if (data.type === 'theme') {
    const bg = data.dark ? '#02060f' : '#e8f0f8'
    document.body.style.background = bg
    if (scene) scene.background = new THREE.Color(data.dark ? 0x02060f : 0xe8f0f8)
  }
})

// ── Boot ──────────────────────────────────────────────────────────────────────
addDefaultLights()
renderer.render(scene, camera)
parent.postMessage({ type: 'sim_ready' }, '*')
</script>
</body>
</html>`
}

// ── Group templates ───────────────────────────────────────────────────────────
const GROUPS = ['Applied', 'Physics']

// ── Component ─────────────────────────────────────────────────────────────────
export default function SimLabPage() {
  const navigate = useNavigate()
  const [code, setCode]               = useState(SIM_TEMPLATES[0].code)
  const [template, setTemplate]       = useState(SIM_TEMPLATES[0].key)
  const [logs, setLogs]               = useState([])
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [snippetOpen, setSnippetOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [ready, setReady]             = useState(false)
  const [darkMode, setDarkMode]       = useState(true)

  const iframeRef  = useRef(null)
  const editorRef  = useRef(null)
  const logsEndRef = useRef(null)
  const srcdoc     = useRef(buildSandbox())

  useEffect(() => {
    document.title = 'Sim Lab — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  // Forward messages from sandbox
  useEffect(() => {
    function onMsg({ data, source }) {
      if (!iframeRef.current || source !== iframeRef.current.contentWindow) return
      if (data?.type === 'sim_ready') setReady(true)
      if (data?.type === 'log') {
        const color = data.level === 'error' ? '#ff6b6b' : data.level === 'warn' ? '#fbbf24' : '#a3e635'
        setLogs(prev => [...prev.slice(-199), { text: data.args.join(' '), color }])
      }
      if (data?.type === 'error') {
        setLogs(prev => [...prev.slice(-199), { text: data.message, color: '#ff6b6b' }])
        setConsoleOpen(true)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Sync theme to sandbox
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'theme', dark: darkMode }, '*')
  }, [darkMode, ready])

  // Auto-scroll console
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const activeTpl = SIM_TEMPLATES.find(t => t.key === template) ?? SIM_TEMPLATES[0]

  const run = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'run', code, mode: activeTpl.mode || '3d' }, '*'
    )
  }, [code, activeTpl])

  const reset = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'reset' }, '*')
  }, [])

  function pickTemplate(key) {
    const t = SIM_TEMPLATES.find(t => t.key === key)
    if (!t) return
    setTemplate(key)
    setCode(t.code)
    setTemplateOpen(false)
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'run', code: t.code, mode: t.mode || '3d' }, '*'
      )
    }, 50)
  }

  function insertSnippet(snippetCode) {
    const editor = editorRef.current
    if (!editor) return
    editor.executeEdits('snippet', [{ range: editor.getSelection(), text: snippetCode, forceMoveMarkers: true }])
    editor.focus()
    setSnippetOpen(false)
  }

  // Colours vary by dark/light mode
  const bg       = darkMode ? 'bg-[#08111f]'    : 'bg-[#f0f4f8]'
  const headerBg = darkMode ? 'bg-[#0d1626]'    : 'bg-[#e0e8f0]'
  const border   = darkMode ? 'border-white/5'  : 'border-black/8'
  const text     = darkMode ? 'text-slate-200'  : 'text-slate-700'
  const muted    = darkMode ? 'text-slate-500'  : 'text-slate-400'
  const btnBase  = darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100 border border-slate-300'

  return (
    <div className={`flex flex-col h-screen ${bg} ${text} overflow-hidden select-none`}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-3 py-2 ${headerBg} border-b ${border} shrink-0 flex-wrap`}>

        {/* Back to Labs */}
        <button
          onClick={() => navigate('/labs')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors ${btnBase} ${muted} hover:${text}`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Labs
        </button>

        <div className={`w-px h-5 ${darkMode ? 'bg-white/10' : 'bg-black/10'} mx-0.5`} />

        <span className={`text-sm font-black tracking-wider ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>SIM LAB</span>

        {/* Mode badge */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
          activeTpl.mode === '2d'
            ? 'bg-emerald-900/50 text-emerald-300'
            : 'bg-sky-900/50 text-sky-300'
        }`}>
          {activeTpl.mode ?? '3d'}
        </span>

        {/* Template picker */}
        <div className="relative">
          <button
            onClick={() => setTemplateOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${btnBase} text-xs font-semibold transition-colors`}
          >
            <span>{activeTpl.icon}</span>
            <span>{activeTpl.label}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
          {templateOpen && (
            <div className={`absolute top-full left-0 mt-1 w-64 ${darkMode ? 'bg-[#0d1626] border-white/10' : 'bg-white border-black/10'} border rounded-lg shadow-2xl z-50 py-1 overflow-y-auto max-h-80`}>
              {GROUPS.map(grp => {
                const items = SIM_TEMPLATES.filter(t => t.group === grp)
                return (
                  <div key={grp}>
                    <div className={`px-3 pt-2 pb-0.5 text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{grp}</div>
                    {items.map(t => (
                      <button
                        key={t.key}
                        onClick={() => pickTemplate(t.key)}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-start gap-2 ${
                          t.key === template
                            ? darkMode ? 'text-sky-400 bg-sky-900/20' : 'text-sky-600 bg-sky-50'
                            : darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="mt-0.5">{t.icon}</span>
                        <span>
                          <span className="font-semibold block">{t.label}</span>
                          <span className={`${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Run */}
        <button
          onClick={run}
          disabled={!ready}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-xs font-bold text-white transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
          Run
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${btnBase} text-xs font-semibold transition-colors`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>

        {/* Snippets */}
        <button
          onClick={() => setSnippetOpen(o => !o)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            snippetOpen
              ? 'bg-violet-700 text-white'
              : `${btnBase} ${darkMode ? 'text-slate-200' : 'text-slate-600'}`
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Snippets
        </button>

        <div className="flex-1" />

        {/* Dark / light toggle */}
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`p-1.5 rounded-md ${btnBase} transition-colors`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode
            ? <Sun className="h-4 w-4 text-amber-400" />
            : <Moon className="h-4 w-4 text-slate-500" />}
        </button>

        {/* Console toggle */}
        <button
          onClick={() => setConsoleOpen(o => !o)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            consoleOpen
              ? darkMode ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-700'
              : `${btnBase} ${muted}`
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          Console
          {logs.length > 0 && (
            <span className="ml-1 rounded-full bg-sky-600 text-white text-[10px] w-4 h-4 flex items-center justify-center font-bold">
              {logs.length > 9 ? '9+' : logs.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Snippet drawer ──────────────────────────────────────────────────── */}
      {snippetOpen && (
        <div className={`shrink-0 border-b ${border} ${darkMode ? 'bg-[#0a1220]' : 'bg-[#e8eef6]'} overflow-x-auto`}>
          <div className="flex gap-4 px-3 py-2 min-w-max">
            {SNIPPETS.map(cat => (
              <div key={cat.category} className="min-w-0">
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${cat.color}`}>{cat.category}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {cat.items.map(s => (
                    <button
                      key={s.label}
                      onClick={() => insertSnippet(s.code)}
                      title={s.code}
                      className={`px-2 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                        darkMode
                          ? 'bg-slate-700/80 hover:bg-slate-600 text-slate-200'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main split ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Editor + console */}
        <div className={`flex flex-col w-1/2 border-r ${border} min-h-0`}>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={v => setCode(v ?? '')}
              theme={darkMode ? 'opencalc-dark' : 'vs-light'}
              beforeMount={setupOpenCalcMonaco}
              onMount={editor => { editorRef.current = editor }}
              options={{
                fontSize: 13,
                lineHeight: 20,
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                tabSize: 2,
                wordWrap: 'on',
                renderLineHighlight: 'gutter',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Console panel */}
          {consoleOpen && (
            <div className={`h-40 shrink-0 border-t ${border} flex flex-col ${darkMode ? 'bg-[#040c14]' : 'bg-[#f8fafc]'}`}>
              <div className={`flex items-center justify-between px-3 py-1 border-b ${border}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>Console</span>
                <div className="flex gap-2">
                  <button onClick={() => setLogs([])} className={`text-[10px] ${muted} hover:${text}`}>Clear</button>
                  <button onClick={() => setConsoleOpen(false)}><X className={`h-3 w-3 ${muted} hover:${text}`} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-1 font-mono text-[11px] space-y-0.5">
                {logs.length === 0
                  ? <span className={muted}>No output yet — run a simulation to see logs.</span>
                  : logs.map((l, i) => <div key={i} style={{ color: l.color }}>{l.text}</div>)
                }
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Sandbox iframe */}
        <div className={`flex-1 ${darkMode ? 'bg-[#02060f]' : 'bg-[#e8f0f8]'} relative`}>
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className={`text-xs ${muted} animate-pulse`}>Loading Three.js engine…</div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc.current}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="Simulation sandbox"
          />
        </div>
      </div>
    </div>
  )
}
