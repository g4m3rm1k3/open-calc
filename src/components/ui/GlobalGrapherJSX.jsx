import { useEffect, useRef, useState, useCallback } from 'react'
import JXG from 'jsxgraph'
import {
  X, Box, Activity, Trash2, Plus, Info, Settings2,
  Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut, Minus,
  ChevronDown, ChevronUp, GitBranch, Sliders, TrendingUp,
  FlaskConical, Copy, Check, ArrowRight,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

// ─── CAS helpers (mathjs — loaded lazily) ────────────────────────────────────

let _math = null
async function getMath() {
  if (_math) return _math
  try { _math = await import('mathjs'); return _math } catch { return null }
}

function casDerivative(expr, variable = 'x') {
  try {
    if (!_math) return null
    return _math.derivative(_math.parse(expr), variable).toString()
  } catch (e) { return `Error: ${e.message}` }
}

function casSimplify(expr) {
  try {
    if (!_math) return null
    return _math.simplify(expr).toString()
  } catch (e) { return `Error: ${e.message}` }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BOARD_ID = 'jxgbox-pro-v3'

const COLORS = [
  '#6366f1', '#ec4899', '#facc15', '#22c55e',
  '#ef4444', '#a855f7', '#06b6d4', '#f97316',
  '#84cc16', '#14b8a6', '#f43f5e', '#8b5cf6',
]

const FUNC_TYPES = [
  { id: 'explicit',   label: 'y = f(x)',          short: 'y=' },
  { id: 'ineq',       label: 'Inequality shading', short: '≥' },
  { id: 'polar',      label: 'r = f(θ)',           short: 'r=' },
  { id: 'parametric', label: 'Parametric x(t),y(t)', short: 'xy' },
  { id: 'implicit',   label: 'Implicit f(x,y)=0',  short: 'F=0' },
  { id: 'point',      label: 'Point (x, y)',        short: 'pt' },
]

const DEFAULT_BBOX = [-10, 10, 10, -10]

// ─── Data factories ───────────────────────────────────────────────────────────

const makeFunc = (id, color) => ({
  id, color, visible: true,
  type: 'explicit',
  expr: '',
  exprY: 'sin(t)',
  rangeMin: (-Math.PI).toFixed(5),
  rangeMax: ( Math.PI).toFixed(5),
  lineWidth: 2.5,
  dashed: false,
  showTangent: false,
  showDerivative: false,
  ineqDir: 'above',    // 'above' | 'below'
  pointX: '0',
  pointY: '0',
})

const makeSlider = (id, name) => ({
  id, name, min: -5, max: 5, value: 1, step: 0.01,
})

// ─── Formula → JS ─────────────────────────────────────────────────────────────

function toJS(raw = '') {
  if (!raw.trim()) return null
  let s = raw.trim()
  // Implicit multiplication: 2x, 3(, …
  s = s
    .replace(/(\d)(x|y|t|r|theta|phi)\b/g, '$1*$2')
    .replace(/(\d)\(/g, '$1*(')
  // Math functions (longer names first)
  s = s
    .replace(/\barcsinh\b/g, 'Math.asinh')
    .replace(/\barccosh\b/g, 'Math.acosh')
    .replace(/\barctanh\b/g, 'Math.atanh')
    .replace(/\barcsin\b/g,  'Math.asin')
    .replace(/\barccos\b/g,  'Math.acos')
    .replace(/\barctan\b/g,  'Math.atan')
    .replace(/\basin\b/g,    'Math.asin')
    .replace(/\bacos\b/g,    'Math.acos')
    .replace(/\batan2\b/g,   'Math.atan2')
    .replace(/\batan\b/g,    'Math.atan')
    .replace(/\bsinh\b/g,    'Math.sinh')
    .replace(/\bcosh\b/g,    'Math.cosh')
    .replace(/\btanh\b/g,    'Math.tanh')
    .replace(/\bsin\b/g,     'Math.sin')
    .replace(/\bcos\b/g,     'Math.cos')
    .replace(/\btan\b/g,     'Math.tan')
    .replace(/\bcbrt\b/g,    'Math.cbrt')
    .replace(/\bsqrt\b/g,    'Math.sqrt')
    .replace(/\babs\b/g,     'Math.abs')
    .replace(/\bexp\b/g,     'Math.exp')
    .replace(/\bln\b/g,      'Math.log')
    .replace(/\blog10\b/g,   'Math.log10')
    .replace(/\blog2\b/g,    'Math.log2')
    .replace(/\blog\b/g,     'Math.log10')
    .replace(/\bfloor\b/g,   'Math.floor')
    .replace(/\bceil\b/g,    'Math.ceil')
    .replace(/\bround\b/g,   'Math.round')
    .replace(/\bsign\b/g,    'Math.sign')
    .replace(/\bmax\b/g,     'Math.max')
    .replace(/\bmin\b/g,     'Math.min')
    .replace(/\bpow\b/g,     'Math.pow')
    .replace(/\bPI\b/g,      'Math.PI')
    .replace(/\bpi\b/g,      'Math.PI')
    .replace(/(?<![A-Za-z_$\d\.])e(?![A-Za-z_$\d])/g, 'Math.E')
    .replace(/\*\*/g, '__POW__')
    .replace(/\^/g,   '**')
    .replace(/__POW__/g, '**')
  return s
}

function makeFn(jsExpr, ...vars) {
  try {
    return new Function(
      ...vars,
      `"use strict"; try { const _r=(${jsExpr}); return isFinite(_r)?_r:NaN } catch(e){ return NaN }`
    )
  } catch {
    return null
  }
}

// Numeric derivative via central difference
function derivFn(fn) {
  return x => {
    const h = 1e-7
    return (fn(x + h) - fn(x - h)) / (2 * h)
  }
}

// ─── Board helpers ────────────────────────────────────────────────────────────

function safeFreeBoardById(id) {
  try {
    if (JXG.boards?.[id]) JXG.JSXGraph.freeBoard(JXG.boards[id])
  } catch (_) {}
}

function boardTheme(dark) {
  return dark
    ? { bg: '#020617', axis: '#475569', grid: '#1e293b', tick: '#64748b' }
    : { bg: '#ffffff',  axis: '#94a3b8', grid: '#e2e8f0', tick: '#64748b' }
}

// Hex color → rgba with opacity
function colorWithOpacity(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── Component ────────────────────────────────────────────────────────────────

const GlobalGrapherJSX = ({ isOpen, onClose, onSwitchTo2D, onSwitchTo3D, launchConfig }) => {
  const domRef        = useRef(null)
  const curvesRef     = useRef({})    // funcId → array of JSXGraph objects
  const slidersJSXRef = useRef({})    // sliderId → JSXGraph slider object
  const sliderValsRef = useRef({})    // sliderName → current value (mutable)
  const darkRef       = useRef(document.documentElement.classList.contains('dark'))

  const [functions, setFunctions] = useLocalStorage('jsx-pro-v3-funcs', [
    { ...makeFunc(1, COLORS[0]), expr: 'sin(x)' },
    { ...makeFunc(2, COLORS[1]), expr: 'x^2 / 4' },
  ])
  const [sliders, setSliders] = useLocalStorage('jsx-pro-v3-sliders', [])
  const [settings, setSettings] = useLocalStorage('jsx-pro-v3-settings', {
    showGrid: true, showAxes: true, keepAspect: false, showNav: true,
    bbox: DEFAULT_BBOX,
  })

  // Keep live refs so async board init always uses the newest state.
  const functionsRef = useRef(functions)
  const slidersRef = useRef(sliders)

  const [errors, setErrors]             = useState({})
  const [isDark, setIsDark]             = useState(() => darkRef.current)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tab, setTab]                   = useState('functions')

  // CAS state
  const [casExpr,    setCasExpr]    = useState('')
  const [casResult,  setCasResult]  = useState(null)   // { op, input, output }
  const [casCopied,  setCasCopied]  = useState(false)
  const [casReady,   setCasReady]   = useState(false)
  const lastLaunchRef = useRef(null)                    // avoid re-applying same config

  // ── Dark mode observer ──────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const d = document.documentElement.classList.contains('dark')
      darkRef.current = d
      setIsDark(d)
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // ── Load mathjs once ───────────────────────────────────────────────────────
  useEffect(() => {
    getMath().then(m => setCasReady(!!m))
  }, [])

  useEffect(() => { functionsRef.current = functions }, [functions])
  useEffect(() => { slidersRef.current = sliders }, [sliders])

  // ── Apply launchConfig when grapher opens from a lesson ────────────────────
  useEffect(() => {
    if (!isOpen || !launchConfig) return
    if (launchConfig === lastLaunchRef.current) return   // already applied
    lastLaunchRef.current = launchConfig

    const { functions: fns, sliders: sls, replace = true } = launchConfig

    if (fns?.length) {
      const mapped = fns.map((f, i) => ({
        ...makeFunc(Date.now() + i, f.color ?? COLORS[i % COLORS.length]),
        expr:      f.expr       ?? f.latex ?? '',
        type:      f.type       ?? 'explicit',
        exprY:     f.exprY      ?? 'sin(t)',
        lineWidth: f.lineWidth  ?? 2.5,
        dashed:    f.dashed     ?? false,
        showTangent:    f.showTangent    ?? false,
        showDerivative: f.showDerivative ?? false,
      }))
      if (replace) setFunctions(mapped)
      else         setFunctions(prev => [...prev, ...mapped])
    }

    if (sls?.length) {
      const mapped = sls.map((s, i) => ({
        ...makeSlider(Date.now() + i, s.name ?? 'a'),
        min: s.min ?? -5, max: s.max ?? 5, value: s.value ?? 1, step: s.step ?? 0.01,
      }))
      if (replace) setSliders(mapped)
      else         setSliders(prev => [...prev, ...mapped])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, launchConfig])

  const getBoard = () => JXG.boards?.[BOARD_ID] ?? null

  // ── Board initialization ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      const b = getBoard()
      if (b) { try { setSettings(s => ({ ...s, bbox: b.getBoundingBox() })) } catch (_) {} }
      safeFreeBoardById(BOARD_ID)
      curvesRef.current = {}
      slidersJSXRef.current = {}
      return
    }

    const timer = setTimeout(() => {
      if (!domRef.current || getBoard()) return

      const dark  = darkRef.current
      const theme = boardTheme(dark)
      const bbox  = settings.bbox || DEFAULT_BBOX

      const b = JXG.JSXGraph.initBoard(BOARD_ID, {
        boundingbox:     bbox,
        axis:            settings.showAxes,
        grid:            settings.showGrid,
        showNavigation:  settings.showNav,
        showCopyright:   false,
        keepaspectratio: settings.keepAspect,
        maxBoundingBox:  [-1e4, 1e4, 1e4, -1e4],
        pan:  { enabled: true, needShift: false, needTwoFinger: false },
        zoom: { factorX: 1.15, factorY: 1.15, wheel: true, needShift: false, pinch: true },
        defaultAxes: {
          x: {
            strokeColor: theme.axis,
            ticks: { strokeColor: theme.tick, label: { strokeColor: theme.tick, fontSize: 10 } },
          },
          y: {
            strokeColor: theme.axis,
            ticks: { strokeColor: theme.tick, label: { strokeColor: theme.tick, fontSize: 10 } },
          },
        },
      })

      const liveSliders = slidersRef.current
      const liveFunctions = functionsRef.current
      liveSliders.forEach(s => { sliderValsRef.current[s.name] = s.value })
      createBoardSliders(b, liveSliders)
      renderAll(b, liveFunctions, liveSliders)
    }, 80)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Proper unmount cleanup (React Strict Mode safe)
  useEffect(() => { return () => safeFreeBoardById(BOARD_ID) }, [])

  // Re-render curves when functions change
  useEffect(() => {
    const b = getBoard()
    if (b) renderAll(b, functions, sliders)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functions])

  // Recreate board sliders when slider defs change
  useEffect(() => {
    const b = getBoard()
    if (!b) return
    Object.values(slidersJSXRef.current).forEach(obj => {
      try { b.removeObject(obj) } catch (_) {}
    })
    slidersJSXRef.current = {}
    sliders.forEach(s => { sliderValsRef.current[s.name] = s.value })
    createBoardSliders(b, sliders)
    renderAll(b, functions, sliders)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliders])

  // Toggle grid/axes without board recreation
  useEffect(() => {
    const b = getBoard()
    if (!b) return
    try {
      b.defaultAxes?.x.setAttribute({ visible: settings.showAxes })
      b.defaultAxes?.y.setAttribute({ visible: settings.showAxes })
      b.grids?.forEach(g => g.setAttribute({ visible: settings.showGrid }))
      b.update()
    } catch (_) {}
  }, [settings.showGrid, settings.showAxes])

  // ─── Board sliders ──────────────────────────────────────────────────────────
  const createBoardSliders = useCallback((b, sliderDefs) => {
    if (!sliderDefs.length) return
    const bbox   = b.getBoundingBox()
    const xL     = bbox[0] + (bbox[2] - bbox[0]) * 0.06
    const xR     = bbox[2] - (bbox[2] - bbox[0]) * 0.06
    const yRange = bbox[1] - bbox[3]
    const rowH   = Math.max(yRange * 0.08, 0.5)
    const yStart = bbox[3] + yRange * 0.06

    sliderDefs.forEach((s, i) => {
      try {
        const yPos    = yStart + i * rowH
        const jsxS    = b.create('slider',
          [[xL, yPos], [xR, yPos], [s.min, s.value, s.max]],
          {
            name: s.name, snapWidth: s.step > 0 ? s.step : 0, withTicks: false,
            label: { fontSize: 11, strokeColor: darkRef.current ? '#94a3b8' : '#475569', highlight: false },
            baseline: { strokeColor: darkRef.current ? '#334155' : '#cbd5e1', strokeWidth: 2 },
            highline: { strokeColor: COLORS[i % COLORS.length], strokeWidth: 3 },
            point1: { withLabel: false, strokeColor: '#94a3b8', size: 3 },
            point2: { withLabel: false, strokeColor: '#94a3b8', size: 3 },
            fillColor: COLORS[i % COLORS.length],
            strokeColor: COLORS[i % COLORS.length],
            size: 5,
          }
        )
        jsxS.on('drag', () => {
          sliderValsRef.current[s.name] = jsxS.Value()
          setSliders(prev => prev.map(sl => sl.id === s.id ? { ...sl, value: jsxS.Value() } : sl))
        })
        slidersJSXRef.current[s.id] = jsxS
      } catch (e) { console.warn('Slider error:', e) }
    })
  }, [setSliders])

  // ─── Render all curves ──────────────────────────────────────────────────────
  const renderAll = useCallback((b, funcs, sliderDefs) => {
    if (!b) return
    // Remove previous objects (keep sliders)
    const sliderObjs = new Set(Object.values(slidersJSXRef.current))
    Object.values(curvesRef.current).flat().forEach(obj => {
      if (!sliderObjs.has(obj)) try { b.removeObject(obj) } catch (_) {}
    })
    curvesRef.current = {}

    const sliderNames = (sliderDefs || []).map(s => s.name)
    const errs = {}

    funcs.forEach(f => {
      if (!f.visible) return

      const objs = []     // all JSXGraph objects for this function

      try {
        // Build a function that evaluates the expression with current slider values
        const evalWith = (expr, ...extraVars) => {
          const js = toJS(expr)
          if (!js) return null
          const fn = makeFn(js, ...extraVars, ...sliderNames)
          if (!fn) return null
          return (...args) => fn(...args, ...sliderNames.map(n => sliderValsRef.current[n] ?? 0))
        }

        const strokeAttrs = {
          strokeColor: f.color,
          strokeWidth: f.lineWidth || 2.5,
          highlightStrokeColor: f.color,
          highlightStrokeWidth: (f.lineWidth || 2.5) + 0.5,
          strokeOpacity: 0.92,
          dash: f.dashed ? 2 : 0,
          withLabel: false,
          shadow: false,
        }

        // ── Point ────────────────────────────────────────────────────────────
        if (f.type === 'point') {
          const xVal = parseFloat(f.pointX) || 0
          const yVal = parseFloat(f.pointY) || 0
          const pt   = b.create('point', [xVal, yVal], {
            name: `(${xVal}, ${yVal})`,
            size: 5,
            color: f.color,
            fillColor: f.color,
            strokeColor: f.color,
            withLabel: true,
            label: { fontSize: 10, strokeColor: f.color, offset: [6, 6] },
            fixed: true,
          })
          objs.push(pt)

        // ── Explicit y = f(x) ────────────────────────────────────────────────
        } else if (f.type === 'explicit' || f.type === 'ineq') {
          if (!f.expr?.trim()) return
          const fn = evalWith(f.expr, 'x')
          if (!fn) { errs[f.id] = 'Parse error'; return }

          const curve = b.create('functiongraph', [fn], strokeAttrs)
          objs.push(curve)

          // Inequality shading
          if (f.type === 'ineq') {
            const shade = b.create('inequality', [curve], {
              fillColor: colorWithOpacity(f.color, 0.15),
              strokeWidth: 0,
              inverse: f.ineqDir === 'below',
            })
            objs.push(shade)
          }

          // Derivative curve f'(x)
          if (f.showDerivative) {
            const dfn = derivFn(fn)
            const dcurve = b.create('functiongraph', [dfn], {
              ...strokeAttrs,
              strokeWidth: Math.max(1.5, (f.lineWidth || 2.5) - 1),
              dash: 2,
              strokeOpacity: 0.7,
            })
            objs.push(dcurve)
          }

          // Tangent line + draggable trace point
          if (f.showTangent) {
            try {
              const glider = b.create('glider', [0, 0, curve], {
                name: '', size: 5, color: f.color,
                fillColor: f.color, strokeColor: f.color,
                withLabel: true,
                label: { fontSize: 10, strokeColor: f.color, highlight: false, parse: false },
              })
              glider.label.setText(() =>
                `(${glider.X().toFixed(3)}, ${glider.Y().toFixed(3)})`
              )
              const tangent = b.create('tangent', [glider], {
                strokeColor: f.color, strokeWidth: 1.5, strokeOpacity: 0.6,
                dash: 2, withLabel: false,
              })
              objs.push(glider, tangent)
            } catch (_) {}
          }

        // ── Polar r = f(θ) ───────────────────────────────────────────────────
        } else if (f.type === 'polar') {
          if (!f.expr?.trim()) return
          const polarExpr = (toJS(f.expr) || '')
            .replace(/\btheta\b/g, 'phi')
            .replace(/(?<![A-Za-z_$])x(?![A-Za-z_$])/g, 'phi')
          const fn = evalWith(polarExpr, 'phi')
          if (!fn) { errs[f.id] = 'Parse error'; return }
          const curve = b.create('curve', [fn, [0, 2 * Math.PI]], {
            ...strokeAttrs, curveType: 'polar',
          })
          objs.push(curve)

        // ── Parametric ───────────────────────────────────────────────────────
        } else if (f.type === 'parametric') {
          if (!f.expr?.trim()) return
          const tMin = parseFloat(f.rangeMin) || -Math.PI
          const tMax = parseFloat(f.rangeMax) ||  Math.PI
          const xFn  = evalWith(f.expr,  't')
          const yFn  = evalWith(f.exprY || 'sin(t)', 't')
          if (!xFn || !yFn) { errs[f.id] = 'Parse error'; return }
          const curve = b.create('curve', [xFn, yFn, tMin, tMax], {
            ...strokeAttrs, curveType: 'parameter',
          })
          objs.push(curve)

        // ── Implicit f(x,y) = 0 ─────────────────────────────────────────────
        } else if (f.type === 'implicit') {
          if (!f.expr?.trim()) return
          const fn = evalWith(f.expr, 'x', 'y')
          if (!fn) { errs[f.id] = 'Parse error'; return }
          // JSXGraph 1.x implicitcurve API: first array arg is the function
          const curve = b.create('implicitcurve', [fn], {
            ...strokeAttrs,
            resolution_outer: 8,
            resolution_inner: 6,
            precision: 0.2,
          })
          objs.push(curve)
        }

        curvesRef.current[f.id] = objs

      } catch (e) {
        errs[f.id] = (e.message || 'Error').slice(0, 60)
      }
    })

    setErrors(errs)
    try { b.update() } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Zoom / pan / reset ─────────────────────────────────────────────────────
  const zoomBoard = dir => {
    const b = getBoard(); if (!b) return
    const f = dir > 0 ? 1.3 : 0.77
    b.zoomX(f); b.zoomY(f); b.update()
  }
  const resetView = () => {
    const b = getBoard(); if (!b) return
    b.setBoundingBox(DEFAULT_BBOX, true); b.update()
  }
  const handleClose = () => {
    const b = getBoard()
    if (b) { try { setSettings(s => ({ ...s, bbox: b.getBoundingBox() })) } catch (_) {} }
    onClose()
  }

  // ─── Function CRUD ──────────────────────────────────────────────────────────
  const addFunction = () => {
    const color = COLORS[functions.length % COLORS.length]
    setFunctions(prev => [...prev, makeFunc(Date.now(), color)])
  }
  const updateFunction = (id, upd) =>
    setFunctions(prev => prev.map(f => f.id === id ? { ...f, ...upd } : f))
  const removeFunction = id =>
    setFunctions(prev =>
      prev.length <= 1 ? [makeFunc(Date.now(), COLORS[0])] : prev.filter(f => f.id !== id)
    )

  // ─── Slider CRUD ────────────────────────────────────────────────────────────
  const addSlider = () => {
    const usedNames = new Set(sliders.map(s => s.name))
    const name = ['a','b','c','d','k','n','m','p','q'].find(n => !usedNames.has(n)) || `v${sliders.length}`
    setSliders(prev => [...prev, makeSlider(Date.now(), name)])
  }
  const updateSlider = (id, upd) =>
    setSliders(prev => prev.map(s => s.id === id ? { ...s, ...upd } : s))
  const removeSlider = id =>
    setSliders(prev => prev.filter(s => s.id !== id))

  const setSliderValue = (id, value) => {
    const slider = sliders.find(s => s.id === id)
    if (!slider) return
    sliderValsRef.current[slider.name] = value
    updateSlider(id, { value })
    const jsxS = slidersJSXRef.current[id]
    if (jsxS) { try { jsxS.setValue(value) } catch (_) {} }
    const b = getBoard()
    if (b) { try { b.update() } catch (_) {} }
  }

  const updateSetting = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl overflow-hidden text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-7xl flex flex-col md:flex-row h-[92vh] overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-950/40 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-10">
            <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight uppercase text-xs">
              <Settings2 className="w-4 h-4 text-emerald-500" /> Pro Grapher
            </h3>
            <div className="flex items-center gap-1">
              {onSwitchTo2D && (
                <button onClick={onSwitchTo2D} title="2D Plotter"
                  className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-500 dark:text-indigo-400 transition-all">
                  <Activity className="w-4 h-4" />
                </button>
              )}
              {onSwitchTo3D && (
                <button onClick={onSwitchTo3D} title="3D Plotter"
                  className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg text-amber-500 dark:text-amber-400 transition-all">
                  <Box className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={tab === 'functions' ? addFunction : addSlider}
                title={tab === 'functions' ? 'Add function' : 'Add slider'}
                className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 ml-1">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
            {[
              { id: 'functions', icon: <GitBranch    className="w-3 h-3" />, label: 'Functions' },
              { id: 'sliders',   icon: <Sliders      className="w-3 h-3" />, label: 'Sliders',
                badge: sliders.length || null },
              { id: 'cas',       icon: <FlaskConical className="w-3 h-3" />, label: 'CAS' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                  tab === t.id
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}>
                {t.icon}{t.label}
                {t.badge && (
                  <span className="ml-0.5 bg-emerald-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Functions tab ─────────────────────────────────────────────── */}
          {tab === 'functions' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {functions.map(func => {
                const type = func.type || 'explicit'
                const err  = errors[func.id]
                return (
                  <div key={func.id}
                    className={`flex flex-col gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm transition-all ${
                      err
                        ? 'border-red-300 dark:border-red-700/60'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50'
                    }`}>

                    {/* Row 1 */}
                    <div className="flex items-center gap-1.5">
                      <label className="relative cursor-pointer flex-shrink-0">
                        <span className="block w-5 h-5 rounded-full border-2 border-white dark:border-slate-700 shadow"
                          style={{ backgroundColor: func.color }} />
                        <input type="color" value={func.color}
                          onChange={e => updateFunction(func.id, { color: e.target.value })}
                          className="absolute inset-0 opacity-0 w-5 h-5 cursor-pointer" />
                      </label>

                      {/* Type pills */}
                      <div className="flex gap-0.5 flex-1 flex-wrap">
                        {FUNC_TYPES.map(t => (
                          <button key={t.id}
                            onClick={() => updateFunction(func.id, { type: t.id })}
                            title={t.label}
                            className={`px-1 py-0.5 text-[8px] font-bold rounded transition-all ${
                              type === t.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                            }`}>
                            {t.short}
                          </button>
                        ))}
                      </div>

                      <button onClick={() => updateFunction(func.id, { dashed: !func.dashed })}
                        title="Dashed"
                        className={`p-1 rounded transition-colors ${func.dashed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <button onClick={() => updateFunction(func.id, { visible: !func.visible })}
                        className={`p-1 rounded transition-colors ${func.visible ? 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                        {func.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => removeFunction(func.id)}
                        className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Point inputs */}
                    {type === 'point' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 font-mono">(</span>
                        <input type="number" value={func.pointX}
                          onChange={e => updateFunction(func.id, { pointX: e.target.value })}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-mono text-xs outline-none text-center"
                          placeholder="x" />
                        <span className="text-[9px] text-slate-400 font-mono">,</span>
                        <input type="number" value={func.pointY}
                          onChange={e => updateFunction(func.id, { pointY: e.target.value })}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-mono text-xs outline-none text-center"
                          placeholder="y" />
                        <span className="text-[9px] text-slate-400 font-mono">)</span>
                      </div>
                    )}

                    {/* Main expression */}
                    {type !== 'point' && (
                      <input
                        value={func.expr || ''}
                        onChange={e => updateFunction(func.id, { expr: e.target.value })}
                        placeholder={
                          type === 'explicit' || type === 'ineq' ? 'y = e.g. a*sin(x) + b' :
                          type === 'polar'      ? 'r = e.g. 1 + cos(theta)' :
                          type === 'parametric' ? 'x(t) = e.g. cos(t)' :
                                                 'e.g. x^2 + y^2 - 4'
                        }
                        className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-700 dark:text-slate-200 focus:ring-1 focus:outline-none transition-all ${
                          err
                            ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-400 focus:border-emerald-400'
                        }`}
                      />
                    )}

                    {/* Inequality direction */}
                    {type === 'ineq' && (
                      <div className="flex gap-1">
                        {[
                          { val: 'above', label: 'y ≥ f(x)' },
                          { val: 'below', label: 'y ≤ f(x)' },
                        ].map(opt => (
                          <button key={opt.val}
                            onClick={() => updateFunction(func.id, { ineqDir: opt.val })}
                            className={`flex-1 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                              func.ineqDir === opt.val
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Parametric y(t) + range */}
                    {type === 'parametric' && (
                      <>
                        <input
                          value={func.exprY || ''}
                          onChange={e => updateFunction(func.id, { exprY: e.target.value })}
                          placeholder="y(t) = e.g. sin(t)"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-400 font-bold">t ∈</span>
                          <input type="number" value={func.rangeMin}
                            onChange={e => updateFunction(func.id, { rangeMin: e.target.value })}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-1.5 py-1 text-[10px] dark:text-slate-100 outline-none text-center"
                            placeholder="-π" />
                          <span className="text-[9px] text-slate-400">to</span>
                          <input type="number" value={func.rangeMax}
                            onChange={e => updateFunction(func.id, { rangeMax: e.target.value })}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-1.5 py-1 text-[10px] dark:text-slate-100 outline-none text-center"
                            placeholder="π" />
                        </div>
                      </>
                    )}

                    {/* Extra toggles for explicit */}
                    {(type === 'explicit') && (
                      <div className="flex items-center gap-1.5">
                        <input type="range" min="1" max="6" step="0.5"
                          value={func.lineWidth || 2.5}
                          onChange={e => updateFunction(func.id, { lineWidth: parseFloat(e.target.value) })}
                          className="flex-1 h-1 rounded appearance-none cursor-pointer accent-emerald-500"
                        />
                        <button
                          onClick={() => updateFunction(func.id, { showTangent: !func.showTangent })}
                          title="Tangent line + trace point"
                          className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1 ${
                            func.showTangent
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}>
                          <GitBranch className="w-2.5 h-2.5" /> Tan
                        </button>
                        <button
                          onClick={() => updateFunction(func.id, { showDerivative: !func.showDerivative })}
                          title="Show derivative f'(x)"
                          className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1 ${
                            func.showDerivative
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}>
                          <TrendingUp className="w-2.5 h-2.5" /> f'
                        </button>
                      </div>
                    )}

                    {err && (
                      <p className="text-[9px] text-red-500 font-mono truncate" title={err}>⚠ {err}</p>
                    )}
                  </div>
                )
              })}
              {functions.length === 0 && (
                <p className="text-center py-10 text-slate-400 text-sm italic">Click + to add a function.</p>
              )}
            </div>
          )}

          {/* ── Sliders tab ───────────────────────────────────────────────── */}
          {tab === 'sliders' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sliders.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <Sliders className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-slate-400 dark:text-slate-600 text-xs leading-relaxed">
                    Add sliders to control your functions.<br />
                    Use the slider's name (<span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">a</span>, <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">b</span>…) in any expression.
                    <br /><br />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Example:</span> add slider <span className="font-mono">a</span>, then write <span className="font-mono">a*sin(x)</span>
                  </p>
                </div>
              )}
              {sliders.map(s => (
                <div key={s.id}
                  className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all">

                  <div className="flex items-center gap-2">
                    <input value={s.name}
                      onChange={e => updateSlider(s.id, { name: e.target.value.slice(0, 4).replace(/\s/g, '') })}
                      className="w-10 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 text-center outline-none"
                    />
                    <span className="flex-1 font-mono text-xs text-slate-600 dark:text-slate-300 text-right">
                      {typeof s.value === 'number' ? s.value.toFixed(3) : s.value}
                    </span>
                    <button onClick={() => removeSlider(s.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input type="range" min={s.min} max={s.max} step={s.step || 0.01}
                    value={s.value}
                    onChange={e => setSliderValue(s.id, parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 rounded-full"
                  />

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <input type="number" value={s.min}
                      onChange={e => updateSlider(s.id, { min: parseFloat(e.target.value) || 0 })}
                      className="w-16 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-1.5 py-1 dark:text-slate-200 outline-none text-center font-mono"
                      placeholder="min" />
                    <span className="flex-1 text-center text-slate-400">to</span>
                    <input type="number" value={s.max}
                      onChange={e => updateSlider(s.id, { max: parseFloat(e.target.value) || 0 })}
                      className="w-16 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-1.5 py-1 dark:text-slate-200 outline-none text-center font-mono"
                      placeholder="max" />
                    <input type="number" value={s.step}
                      onChange={e => updateSlider(s.id, { step: parseFloat(e.target.value) || 0.01 })}
                      className="w-14 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-1.5 py-1 dark:text-slate-200 outline-none text-center font-mono"
                      placeholder="step" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CAS tab ──────────────────────────────────────────────────── */}
          {tab === 'cas' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {!casReady && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3 border border-amber-200 dark:border-amber-800/50">
                  Loading CAS engine…
                </p>
              )}

              {/* Input */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Expression</p>
                <input
                  value={casExpr}
                  onChange={e => { setCasExpr(e.target.value); setCasResult(null) }}
                  placeholder="e.g.  x^3 * sin(x)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 font-mono text-xs text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                />
              </div>

              {/* Operation buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "d/dx (deriv.)",  op: 'deriv',    fn: () => casDerivative(casExpr, 'x') },
                  { label: "d/dt (deriv.)",  op: 'deriv-t',  fn: () => casDerivative(casExpr, 't') },
                  { label: "Simplify",       op: 'simplify', fn: () => casSimplify(casExpr) },
                  { label: "2nd derivative", op: 'deriv2',   fn: () => {
                    const d1 = casDerivative(casExpr, 'x')
                    return d1 ? casDerivative(d1, 'x') : null
                  }},
                ].map(({ label, op, fn }) => (
                  <button key={op}
                    disabled={!casReady || !casExpr.trim()}
                    onClick={() => {
                      const out = fn()
                      setCasResult(out ? { op, input: casExpr, output: out } : null)
                    }}
                    className="px-2 py-1.5 text-[9px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {label}
                  </button>
                ))}
              </div>

              {/* Result */}
              {casResult && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Result</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(casResult.output)
                          setCasCopied(true)
                          setTimeout(() => setCasCopied(false), 1500)
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Copy">
                        {casCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Input → Output display */}
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-slate-500 truncate max-w-[40%]">{casResult.input}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold break-all">{casResult.output}</span>
                  </div>

                  {/* Plot result button */}
                  <button
                    onClick={() => {
                      const color = COLORS[functions.length % COLORS.length]
                      setFunctions(prev => [
                        ...prev,
                        { ...makeFunc(Date.now(), color), expr: casResult.output },
                      ])
                      setTab('functions')
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all">
                    <TrendingUp className="w-3 h-3" /> Plot this
                  </button>

                  {/* Use as new expression */}
                  <button
                    onClick={() => { setCasExpr(casResult.output); setCasResult(null) }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <ArrowRight className="w-3 h-3" /> Use as input (chain operations)
                  </button>
                </div>
              )}

              {/* Quick reference */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Examples</p>
                {[
                  ['x^3 - 3*x', '→ derivative → 3*x^2 - 3'],
                  ['sin(x)^2 + cos(x)^2', '→ simplify → 1'],
                  ['x^2 * exp(x)', '→ 2nd deriv → (x^2+4x+2)*exp(x)'],
                ].map(([ex, hint]) => (
                  <div key={ex} className="flex items-center gap-2">
                    <button
                      onClick={() => { setCasExpr(ex); setCasResult(null) }}
                      className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline text-left">
                      {ex}
                    </button>
                    <span className="text-[9px] text-slate-400 truncate">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Settings (collapsible) ──────────────────────────────────────── */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <button onClick={() => setSettingsOpen(o => !o)}
              className="w-full flex items-center justify-between p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="flex items-center gap-1.5"><Settings2 className="w-3 h-3" /> View</span>
              {settingsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {settingsOpen && (
              <div className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'showGrid',   label: 'Grid' },
                    { key: 'showAxes',   label: 'Axes' },
                    { key: 'keepAspect', label: '1:1 Aspect' },
                    { key: 'showNav',    label: 'Nav' },
                  ].map(({ key, label }) => (
                    <button key={key} onClick={() => updateSetting(key, !settings[key])}
                      className={`px-2 py-1.5 rounded-xl text-[9px] font-bold border transition-all ${
                        settings[key]
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[
                    { label: 'In',    icon: <ZoomIn className="w-3 h-3" />,    dir: 1 },
                    { label: 'Out',   icon: <ZoomOut className="w-3 h-3" />,   dir: -1 },
                    { label: 'Reset', icon: <RotateCcw className="w-3 h-3" />, dir: 0 },
                  ].map(btn => (
                    <button key={btn.label}
                      onClick={() => btn.dir === 0 ? resetView() : zoomBoard(btn.dir)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all">
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Syntax guide */}
          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border-t border-emerald-100/50 dark:border-emerald-900/30">
            <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" /> Syntax
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>x^2  sqrt(x)</span>  <span className="font-sans">Power / root</span>
              <span>sin cos tan</span>    <span className="font-sans">Trig</span>
              <span>arcsin arctan</span>  <span className="font-sans">Inverse trig</span>
              <span>ln(x) log(x)</span>  <span className="font-sans">ln / log₁₀</span>
              <span>abs floor ceil</span> <span className="font-sans">Rounding</span>
              <span>pi  e</span>          <span className="font-sans">π, Euler's e</span>
            </div>
            <p className="mt-1.5 text-[9px] text-slate-400">
              Sliders: <span className="font-mono">a*sin(x)</span> · Polar: <span className="font-mono">theta</span> · Param: <span className="font-mono">t</span>
            </p>
          </div>
        </div>

        {/* ── Canvas ──────────────────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden cursor-crosshair">
          <button onClick={handleClose}
            className="absolute top-5 right-5 z-[80] p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-xl">
            <X className="w-5 h-5" />
          </button>

          <div
            id={BOARD_ID}
            ref={domRef}
            className="w-full h-full"
            style={{ background: isDark ? '#020617' : '#ffffff' }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        #${BOARD_ID} { border: none !important; }
        .dark #${BOARD_ID} svg text { fill: #64748b !important; font-family: ui-monospace, monospace !important; font-size: 10px !important; }
        .JXG_navigation {
          display: flex !important; gap: 4px !important;
          border-radius: 12px !important; padding: 6px !important;
          bottom: 16px !important; right: 16px !important;
          background: rgba(255,255,255,0.92) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 24px -4px rgba(0,0,0,0.12) !important;
        }
        .dark .JXG_navigation {
          background: rgba(15,23,42,0.92) !important; border-color: #1e293b !important;
        }
        .JXG_navigation_button {
          background: transparent !important; border: none !important;
          color: #64748b !important; border-radius: 8px !important;
          padding: 4px 6px !important; font-size: 14px !important; cursor: pointer !important;
        }
        .JXG_navigation_button:hover { background: #f1f5f9 !important; color: #1e293b !important; }
        .dark .JXG_navigation_button { color: #94a3b8 !important; }
        .dark .JXG_navigation_button:hover { background: #1e293b !important; color: #f8fafc !important; }
      `}} />
    </div>
  )
}

export default GlobalGrapherJSX
