import { useEffect, useRef, useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../utils/monacoThemes.js'
import { SIM_TEMPLATES } from '../data/simTemplates.js'
import { Play, RotateCcw, ChevronDown, Terminal, Code2, X, ChevronUp } from 'lucide-react'

// ── Snippet categories ────────────────────────────────────────────────────────
const SNIPPETS = [
  {
    category: 'Physics',
    color: 'text-sky-400',
    items: [
      {
        label: 'Euler step',
        code: `// Euler integration step\nvx += ax * dt\nvy += ay * dt\nx  += vx * dt\ny  += vy * dt`,
      },
      {
        label: 'RK4 step (1D)',
        code: `function rk4(y, v, a, dt) {
  const k1v = a(y, v);         const k1y = v
  const k2v = a(y+k1y*dt/2, v+k1v*dt/2); const k2y = v+k1v*dt/2
  const k3v = a(y+k2y*dt/2, v+k2v*dt/2); const k3y = v+k2v*dt/2
  const k4v = a(y+k3y*dt,   v+k3v*dt);   const k4y = v+k3v*dt
  return {
    y: y + (dt/6)*(k1y+2*k2y+2*k3y+k4y),
    v: v + (dt/6)*(k1v+2*k2v+2*k3v+k4v)
  }
}`,
      },
      {
        label: 'Spring force',
        code: `// Hooke's law: F = -k*x - b*v\nconst k = 10   // stiffness N/m\nconst b = 0.4  // damping\nconst ax = (-k * (x - rest) - b * vx) / mass`,
      },
      {
        label: 'Gravity (2 bodies)',
        code: `const G = 6.674e-11\nfunction gravForce(p1, m1, p2, m2) {\n  const dx = p2.x - p1.x, dy = p2.y - p1.y\n  const r2 = dx*dx + dy*dy\n  const f  = G * m1 * m2 / r2\n  const r  = Math.sqrt(r2)\n  return { fx: f*dx/r, fy: f*dy/r }\n}`,
      },
      {
        label: 'Bounce off ground',
        code: `if (pos.y < 0.3) {\n  pos.y = 0.3\n  vel.y = -vel.y * 0.75  // restitution\n}`,
      },
    ],
  },
  {
    category: 'Three.js',
    color: 'text-emerald-400',
    items: [
      {
        label: 'Sphere mesh',
        code: `const mesh = new THREE.Mesh(\n  new THREE.SphereGeometry(0.5, 16, 16),\n  new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x112233 })\n)\nscene.add(mesh)`,
      },
      {
        label: 'Box mesh',
        code: `const box = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshStandardMaterial({ color: 0xff8800 })\n)\nscene.add(box)`,
      },
      {
        label: 'Trail line',
        code: `// Call inside update() to extend a trail\ntrail.push(new THREE.Vector3(x, y, z))\nif (trail.length > 300) trail.shift()\nif (trailLine) scene.remove(trailLine)\nconst geo = new THREE.BufferGeometry().setFromPoints(trail)\ntrailLine = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x00ffcc }))\nscene.add(trailLine)`,
      },
      {
        label: 'Point light',
        code: `const light = new THREE.PointLight(0xffffff, 1.5, 50)\nlight.position.set(5, 10, 5)\nscene.add(light)`,
      },
      {
        label: 'Grid helper',
        code: `scene.add(new THREE.GridHelper(40, 20, 0x1a2a44, 0x0d1122))`,
      },
    ],
  },
  {
    category: 'Math',
    color: 'text-violet-400',
    items: [
      {
        label: 'Clamp',
        code: `const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))`,
      },
      {
        label: 'Lerp',
        code: `const lerp = (a, b, t) => a + (b - a) * t`,
      },
      {
        label: 'Polar → Cartesian',
        code: `const x = r * Math.cos(theta)\nconst y = r * Math.sin(theta)`,
      },
      {
        label: 'Normalize 2D',
        code: `function normalize(vx, vy) {\n  const len = Math.hypot(vx, vy) || 1\n  return { x: vx/len, y: vy/len }\n}`,
      },
    ],
  },
]

// ── Sandbox srcdoc ────────────────────────────────────────────────────────────
function buildSandbox() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box }
  body { background:#08111f; overflow:hidden }
  canvas { display:block }
  #err { position:fixed; top:0; left:0; right:0; padding:8px 12px; background:#1a0a0a;
         color:#ff6b6b; font:12px/1.5 monospace; white-space:pre-wrap;
         border-bottom:1px solid #ff4444; display:none; z-index:9 }
</style>
</head>
<body>
<div id="err"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script>
// ── Shared Three.js context (globals available to user code) ─────────────────
let scene, camera, renderer, controls
let animId = null
let userUpdate = null

function setupThree() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x08111f)
  scene.fog = new THREE.FogExp2(0x08111f, 0.012)

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000)
  camera.position.set(0, 8, 20)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(innerWidth, innerHeight)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)

  controls = new THREE.OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor  = 0.08

  // Default lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.35)
  scene.add(ambient)
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(8, 16, 8)
  sun.castShadow = true
  scene.add(sun)

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
  })
}

function clearScene() {
  cancelAnimationFrame(animId)
  animId = null
  userUpdate = null
  while (scene.children.length) scene.remove(scene.children[0])
  // Re-add default lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.35)
  scene.add(ambient)
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(8, 16, 8)
  sun.castShadow = true
  scene.add(sun)
}

function showError(msg) {
  const el = document.getElementById('err')
  el.textContent = msg
  el.style.display = 'block'
}
function hideError() {
  document.getElementById('err').style.display = 'none'
}

let lastTs = 0
function loop(ts) {
  animId = requestAnimationFrame(loop)
  const dt = Math.min((ts - lastTs) / 1000, 0.05)
  lastTs = ts
  controls.update()
  if (userUpdate) {
    try { userUpdate(dt) }
    catch(e) { showError(e.message); userUpdate = null }
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────────
setupThree()
renderer.render(scene, camera)
parent.postMessage({ type: 'sim_ready' }, '*')

// ── Patch console to forward logs upstream ───────────────────────────────────
const _log = console.log.bind(console)
console.log = (...a) => {
  _log(...a)
  parent.postMessage({ type: 'log', level: 'log', args: a.map(String) }, '*')
}
const _warn = console.warn.bind(console)
console.warn = (...a) => {
  _warn(...a)
  parent.postMessage({ type: 'log', level: 'warn', args: a.map(String) }, '*')
}
const _err2 = console.error.bind(console)
console.error = (...a) => {
  _err2(...a)
  parent.postMessage({ type: 'log', level: 'error', args: a.map(String) }, '*')
}

// ── Message handler ──────────────────────────────────────────────────────────
window.addEventListener('message', ({ data }) => {
  if (!data) return
  if (data.type === 'run') {
    hideError()
    clearScene()
    try {
      // Evaluate user code — it defines init() and update()
      const fn = new Function('scene','camera','renderer','controls','THREE', data.code + '\\nreturn { init, update }')
      const { init, update } = fn(scene, camera, renderer, controls, THREE)
      init()
      userUpdate = update
      lastTs = performance.now()
      animId = requestAnimationFrame(loop)
    } catch(e) {
      showError(e.toString())
      parent.postMessage({ type: 'error', message: e.toString() }, '*')
    }
  }
  if (data.type === 'reset') {
    hideError()
    clearScene()
    renderer.render(scene, camera)
  }
})
</script>
</body>
</html>`
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SimLabPage() {
  const [code, setCode]             = useState(SIM_TEMPLATES[0].code)
  const [template, setTemplate]     = useState(SIM_TEMPLATES[0].key)
  const [logs, setLogs]             = useState([])
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [snippetOpen, setSnippetOpen] = useState(false)
  const [ready, setReady]           = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const iframeRef  = useRef(null)
  const editorRef  = useRef(null)
  const logsEndRef = useRef(null)
  const srcdoc = useRef(buildSandbox())

  useEffect(() => {
    document.title = 'Sim Lab — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  // Forward messages from sandbox
  useEffect(() => {
    function onMessage({ data, source }) {
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
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Auto-scroll console
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const run = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'run', code }, '*')
  }, [code])

  const reset = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'reset' }, '*')
  }, [])

  function pickTemplate(key) {
    const t = SIM_TEMPLATES.find(t => t.key === key)
    if (!t) return
    setTemplate(key)
    setCode(t.code)
    setTemplateOpen(false)
    // Auto-run after a tick so editor updates
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'run', code: t.code }, '*')
    }, 50)
  }

  function insertSnippet(snippetCode) {
    const editor = editorRef.current
    if (!editor) return
    const selection = editor.getSelection()
    editor.executeEdits('snippet', [{
      range: selection,
      text: snippetCode,
      forceMoveMarkers: true,
    }])
    editor.focus()
    setSnippetOpen(false)
  }

  const activeTpl = SIM_TEMPLATES.find(t => t.key === template) ?? SIM_TEMPLATES[0]

  return (
    <div className="flex flex-col h-screen bg-[#08111f] text-white overflow-hidden select-none">

      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1626] border-b border-white/5 shrink-0">
        <span className="text-sm font-black tracking-wider text-slate-200 mr-1">SIM LAB</span>

        {/* Template picker */}
        <div className="relative">
          <button
            onClick={() => setTemplateOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <span>{activeTpl.icon}</span>
            <span>{activeTpl.label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
          {templateOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#0d1626] border border-white/10 rounded-lg shadow-2xl z-50 py-1">
              {SIM_TEMPLATES.map(t => (
                <button
                  key={t.key}
                  onClick={() => pickTemplate(t.key)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${t.key === template ? 'text-sky-400' : 'text-slate-300'}`}
                >
                  <span className="mr-2">{t.icon}</span>
                  <span className="font-semibold">{t.label}</span>
                  <span className="ml-2 text-slate-500">{t.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Run */}
        <button
          onClick={run}
          disabled={!ready}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-xs font-bold transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
          Run
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>

        {/* Snippets */}
        <button
          onClick={() => setSnippetOpen(o => !o)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors ${snippetOpen ? 'bg-violet-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Snippets
        </button>

        <div className="flex-1" />

        {/* Console toggle */}
        <button
          onClick={() => setConsoleOpen(o => !o)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors ${consoleOpen ? 'bg-slate-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
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

      {/* ── Snippet drawer ─────────────────────────────────────────────────── */}
      {snippetOpen && (
        <div className="shrink-0 border-b border-white/5 bg-[#0a1220] overflow-x-auto">
          <div className="flex gap-4 px-3 py-2 min-w-max">
            {SNIPPETS.map(cat => (
              <div key={cat.category}>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${cat.color}`}>{cat.category}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {cat.items.map(s => (
                    <button
                      key={s.label}
                      onClick={() => insertSnippet(s.code)}
                      title={s.code}
                      className="px-2 py-1 rounded bg-slate-700/80 hover:bg-slate-600 text-xs text-slate-200 font-mono transition-colors whitespace-nowrap"
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

      {/* ── Main split ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Editor panel */}
        <div className="flex flex-col w-1/2 border-r border-white/5 min-h-0">
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={v => setCode(v ?? '')}
              theme="opencalc-dark"
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
            <div className="h-40 shrink-0 bg-[#040c14] border-t border-white/5 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Console</span>
                <div className="flex gap-2">
                  <button onClick={() => setLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300">Clear</button>
                  <button onClick={() => setConsoleOpen(false)}><X className="h-3 w-3 text-slate-500 hover:text-slate-200" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-1 font-mono text-[11px] space-y-0.5">
                {logs.length === 0 && <span className="text-slate-600">No output yet — run a simulation to see logs.</span>}
                {logs.map((l, i) => (
                  <div key={i} style={{ color: l.color }}>{l.text}</div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Sandbox iframe */}
        <div className="flex-1 bg-[#08111f] relative">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-xs text-slate-500 animate-pulse">Loading Three.js engine…</div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc.current}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="Simulation sandbox"
            onLoad={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
