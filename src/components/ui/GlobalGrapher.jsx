import React, { useRef, useEffect, useState } from 'react'
import functionPlot from 'function-plot'
import { X, Trash2, Plus, Info, Layers, Box, Settings2, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const COLORS = ['#6366f1', '#ec4899', '#facc15', '#22c55e', '#ef4444', '#a855f7', '#06b6d4', '#f97316']

const FUNC_TYPES = [
  { id: 'explicit',    label: 'Explicit y=f(x)',      short: 'Ex' },
  { id: 'implicit',    label: 'Implicit f(x,y)=0',    short: 'Im' },
  { id: 'polar',       label: 'Polar r=f(θ)',          short: 'Po' },
  { id: 'parametric',  label: 'Parametric x(t), y(t)', short: 'Pa' },
]

const PRESETS = {
  linear:      { xMin: -10, xMax: 10,    yMin: -10,  yMax: 10,  xStep: 1,       yStep: 1   },
  trig:        { xMin: -6.2832, xMax: 6.2832, yMin: -2, yMax: 2, xStep: 1.5708, yStep: 0.5 },
  exponential: { xMin: -2,  xMax: 5,     yMin: -1,   yMax: 20,  xStep: 1,       yStep: 2   },
}

const makeFunc = (id, color) => ({
  id, latex: '', color, visible: true,
  type: 'explicit', exprY: 'sin(t)',
  rangeMin: '-3.14159', rangeMax: '3.14159',
})

function cleanExpr(s = '') {
  return s
    .replace(/sin\^2/g, '(sin(x))^2')
    .replace(/cos\^2/g, '(cos(x))^2')
    .replace(/\^/g, '**')
}

const GlobalGrapher = ({ isOpen, onClose, onSwitchTo3D, onSwitchToJSX }) => {
  const containerRef = useRef(null)

  const [functions, setFunctions] = useLocalStorage('global-grapher-funcs', [
    { ...makeFunc(1, COLORS[0]), latex: 'x^2' }
  ])
  const [settings, setSettings] = useLocalStorage('global-grapher-settings', {
    ...PRESETS.linear,
    preset: 'linear',
  })
  const [error, setError] = useState(null)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Sync dark mode
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Render graph
  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    containerRef.current.innerHTML = ''

    try {
      const { xMin, xMax, yMin, yMax, xStep, yStep } = settings
      const xCount = xStep > 0 ? Math.max(2, Math.round((xMax - xMin) / xStep)) : undefined
      const yCount = yStep > 0 ? Math.max(2, Math.round((yMax - yMin) / yStep)) : undefined

      const data = functions
        .filter(f => f.visible && (f.latex || '').trim() !== '')
        .flatMap(f => {
          const type = f.type || 'explicit'
          const color = f.color || COLORS[0]

          if (type === 'polar') {
            const fn = cleanExpr(f.latex).replace(/\bx\b/g, 'theta')
            return [{ fn, fnType: 'polar', graphType: 'polyline', color }]
          }

          if (type === 'implicit') {
            return [{ fn: cleanExpr(f.latex), fnType: 'implicit', color }]
          }

          if (type === 'parametric') {
            const x = cleanExpr(f.latex)
            const y = cleanExpr(f.exprY || 'sin(t)')
            const t0 = parseFloat(f.rangeMin ?? '-3.14159')
            const t1 = parseFloat(f.rangeMax ?? '3.14159')
            return [{
              fnType: 'parametric',
              x, y,
              range: [isNaN(t0) ? -Math.PI : t0, isNaN(t1) ? Math.PI : t1],
              graphType: 'polyline',
              color,
            }]
          }

          // explicit (default)
          return [{ fn: cleanExpr(f.latex), graphType: 'polyline', color }]
        })

      functionPlot({
        target: containerRef.current,
        width: containerRef.current.clientWidth || 600,
        height: containerRef.current.clientHeight || 480,
        tip: {
          xLine: true,
          yLine: true,
          renderer: (x, y) => `(${x.toFixed(3)}, ${y.toFixed(3)})`,
        },
        xAxis: { domain: [xMin, xMax], ...(xCount ? { tick: { count: xCount } } : {}) },
        yAxis: { domain: [yMin, yMax], ...(yCount ? { tick: { count: yCount } } : {}) },
        grid: true,
        data: data.length ? data : [],
      })

      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }, [isOpen, functions, isDark, settings])

  // Function helpers
  const addFunction = () => {
    const color = COLORS[functions.length % COLORS.length]
    setFunctions(prev => [...prev, makeFunc(Date.now(), color)])
  }

  const updateFunction = (id, updates) =>
    setFunctions(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))

  const removeFunction = (id) =>
    setFunctions(prev =>
      prev.length <= 1
        ? [makeFunc(Date.now(), COLORS[0])]
        : prev.filter(f => f.id !== id)
    )

  // Settings helpers
  const updateSetting = (key, val) =>
    setSettings(prev => ({ ...prev, [key]: val }))

  const applyPreset = (type) => {
    if (PRESETS[type]) setSettings(prev => ({ ...prev, ...PRESETS[type], preset: type }))
  }

  const zoom = (factor) => {
    setSettings(prev => {
      const cx = (prev.xMin + prev.xMax) / 2
      const cy = (prev.yMin + prev.yMax) / 2
      const xHalf = (prev.xMax - prev.xMin) / 2 * factor
      const yHalf = (prev.yMax - prev.yMin) / 2 * factor
      return { ...prev, xMin: cx - xHalf, xMax: cx + xHalf, yMin: cy - yHalf, yMax: cy + yHalf, preset: '' }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden mt-16 sm:mt-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row h-[90vh] overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tighter text-sm">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              2D Plotter
            </h3>
            <div className="flex items-center gap-1">
              {onSwitchTo3D && (
                <button onClick={onSwitchTo3D} title="3D Plotter"
                  className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400 transition-all">
                  <Box className="w-4 h-4" />
                </button>
              )}
              {onSwitchToJSX && (
                <button onClick={onSwitchToJSX} title="JSXGraph"
                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400 transition-all">
                  <Settings2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={addFunction} title="Add function"
                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Functions list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {functions.map((func) => {
              const type = func.type || 'explicit'
              return (
                <div key={func.id}
                  className="flex flex-col gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all">

                  {/* Controls row */}
                  <div className="flex items-center gap-1.5">
                    {/* Color picker */}
                    <label className="relative cursor-pointer flex-shrink-0" title="Pick color">
                      <span className="block w-5 h-5 rounded-full border-2 border-white dark:border-slate-700 shadow-sm cursor-pointer"
                        style={{ backgroundColor: func.color }} />
                      <input type="color" value={func.color}
                        onChange={e => updateFunction(func.id, { color: e.target.value })}
                        className="absolute inset-0 opacity-0 w-5 h-5 cursor-pointer" />
                    </label>

                    {/* Type pills */}
                    <div className="flex gap-0.5 flex-1">
                      {FUNC_TYPES.map(t => (
                        <button key={t.id} onClick={() => updateFunction(func.id, { type: t.id })} title={t.label}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all ${
                            type === t.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                          }`}>
                          {t.short}
                        </button>
                      ))}
                    </div>

                    {/* Visibility */}
                    <button onClick={() => updateFunction(func.id, { visible: !func.visible })}
                      className={`p-1 rounded transition-colors ${func.visible ? 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                      {func.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete */}
                    <button onClick={() => removeFunction(func.id)}
                      className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Main expression */}
                  <input
                    value={func.latex || ''}
                    onChange={e => updateFunction(func.id, { latex: e.target.value })}
                    onFocus={() => setError(null)}
                    placeholder={
                      type === 'explicit'   ? 'e.g. sin(x)' :
                      type === 'implicit'   ? 'e.g. y - x^2  (= 0)' :
                      type === 'polar'      ? 'r =  e.g. 1 + cos(x)' :
                                             'x(t) =  e.g. cos(t)'
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all outline-none"
                  />

                  {/* Parametric extras */}
                  {type === 'parametric' && (
                    <>
                      <input
                        value={func.exprY || ''}
                        onChange={e => updateFunction(func.id, { exprY: e.target.value })}
                        onFocus={() => setError(null)}
                        placeholder="y(t) =  e.g. sin(t)"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-400 transition-all outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">t ∈</span>
                        <input type="number" value={func.rangeMin ?? '-3.14159'}
                          onChange={e => updateFunction(func.id, { rangeMin: e.target.value })}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 text-[10px] dark:text-slate-100 outline-none"
                          placeholder="-π" />
                        <span className="text-[9px] text-slate-400">to</span>
                        <input type="number" value={func.rangeMax ?? '3.14159'}
                          onChange={e => updateFunction(func.id, { rangeMax: e.target.value })}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 text-[10px] dark:text-slate-100 outline-none"
                          placeholder="π" />
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {functions.length === 0 && (
              <p className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm italic">
                No functions. Click + to add one.
              </p>
            )}
          </div>

          {/* Settings panel */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/50 space-y-3">

            {/* Presets */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Preset</p>
              <div className="flex gap-1.5">
                {Object.keys(PRESETS).map(p => (
                  <button key={p} onClick={() => applyPreset(p)}
                    className={`flex-1 py-0.5 text-[9px] font-bold rounded border transition-all ${
                      settings.preset === p
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Window */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Window  <span className="normal-case font-normal">(min · max · step)</span></p>
              <div className="grid grid-cols-[1.2rem_1fr_1fr_1fr] gap-1 items-center text-[10px]">
                <span className="text-slate-400 font-mono">x</span>
                <input type="number" value={settings.xMin}  onChange={e => updateSetting('xMin',  parseFloat(e.target.value))} className="bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 dark:text-slate-100 outline-none" />
                <input type="number" value={settings.xMax}  onChange={e => updateSetting('xMax',  parseFloat(e.target.value))} className="bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 dark:text-slate-100 outline-none" />
                <input type="number" step="0.1" value={settings.xStep} onChange={e => updateSetting('xStep', parseFloat(e.target.value) || 1)} className="bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 dark:text-slate-100 outline-none" />
                <span className="text-slate-400 font-mono">y</span>
                <input type="number" value={settings.yMin}  onChange={e => updateSetting('yMin',  parseFloat(e.target.value))} className="bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 dark:text-slate-100 outline-none" />
                <input type="number" value={settings.yMax}  onChange={e => updateSetting('yMax',  parseFloat(e.target.value))} className="bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 dark:text-slate-100 outline-none" />
                <input type="number" step="0.1" value={settings.yStep} onChange={e => updateSetting('yStep', parseFloat(e.target.value) || 1)} className="bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 dark:text-slate-100 outline-none" />
              </div>
            </div>

            {/* Zoom */}
            <div className="flex gap-1.5">
              <button onClick={() => zoom(0.65)} title="Zoom in"
                className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 dark:hover:border-indigo-700 transition-all">
                <ZoomIn className="w-3 h-3" /> In
              </button>
              <button onClick={() => zoom(1.5)} title="Zoom out"
                className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 dark:hover:border-indigo-700 transition-all">
                <ZoomOut className="w-3 h-3" /> Out
              </button>
              <button onClick={() => applyPreset(settings.preset || 'linear')} title="Reset view"
                className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 dark:hover:border-indigo-700 transition-all">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Syntax help */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100/50 dark:border-indigo-900/30">
            <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" /> Syntax  <span className="normal-case font-normal text-indigo-400">(mathjs, not LaTeX)</span>
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>x^2</span>       <span className="font-sans text-slate-400">Power</span>
              <span>sin(x)</span>    <span className="font-sans text-slate-400">Trig</span>
              <span>sqrt(x)</span>   <span className="font-sans text-slate-400">Square root</span>
              <span>abs(x)</span>    <span className="font-sans text-slate-400">Absolute val</span>
              <span>exp(x)</span>    <span className="font-sans text-slate-400">e^x</span>
              <span>log(x)</span>    <span className="font-sans text-slate-400">ln(x)</span>
              <span>pi</span>        <span className="font-sans text-slate-400">π</span>
              <span>E</span>         <span className="font-sans text-slate-400">e ≈ 2.718</span>
            </div>
          </div>
        </div>

        {/* ── Main: Plot area ── */}
        <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-950 min-h-[400px]">
          <button onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 p-6 lg:p-10 flex items-center justify-center overflow-hidden">
            <div ref={containerRef} className="w-full h-full max-h-[600px] graph-svg-container" />
          </div>

          {error && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-3 shadow-xl backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default GlobalGrapher
