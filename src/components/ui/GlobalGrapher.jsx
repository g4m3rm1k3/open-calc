import React, { useRef, useEffect, useState } from 'react'
import functionPlot from 'function-plot'
import * as d3 from 'd3'
import { X, Trash2, Plus, Play, Info } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const GlobalGrapher = ({ isOpen, onClose }) => {
  const containerRef = useRef(null)
  const [functions, setFunctions] = useLocalStorage('global-grapher-funcs', [
    { id: 1, latex: 'x^2', color: '#6366f1', visible: true }
  ])
  const [settings, setSettings] = useLocalStorage('global-grapher-settings', {
    xStep: 1,
    yStep: 1,
    xMin: -6,
    xMax: 6,
    yMin: -4,
    yMax: 4,
    isPolar: false,
    preset: 'linear' // linear, trig, exponential
  })

  // Preset handler
  const applyPreset = (type) => {
    let newSettings = { ...settings, preset: type }
    if (type === 'trig') {
      newSettings.xMin = -Math.PI * 2
      newSettings.xMax = Math.PI * 2
      newSettings.xStep = Math.PI / 2
      newSettings.isPolar = false
    } else if (type === 'exponential') {
      newSettings.xMin = -2
      newSettings.xMax = 5
      newSettings.yMin = -1
      newSettings.yMax = 20
      newSettings.isPolar = false
    } else if (type === 'linear') {
      newSettings.xMin = -10
      newSettings.xMax = 10
      newSettings.yMin = -10
      newSettings.yMax = 10
      newSettings.xStep = 1
      newSettings.isPolar = false
    }
    setSettings(newSettings)
  }

  const [error, setError] = useState(null)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Settings handlers
  const updateSetting = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  // Sync dark mode
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    // Clear previous SVG content to prevent artifacts
    containerRef.current.innerHTML = ''

    try {
      const activeFuncs = functions
        .filter(f => f.visible && f.latex.trim() !== '')
        .map(f => {
          // Normalize LaTeX/Math strings for function-plot's builtIn parser
          let clean = f.latex
            .replace(/sin\^2/g, '(sin(x))^2')
            .replace(/cos\^2/g, '(cos(x))^2')
            .replace(/\^/g, '**')

          if (settings.isPolar) {
            // function-plot polar mode requires 'theta' variable
            return {
              fn: clean.replace(/x/g, 'theta'),
              color: f.color,
              fnType: 'polar',
              graphType: 'polyline'
            }
          }
          
          return {
            fn: clean,
            color: f.color,
            graphType: 'polyline'
          }
        })

      functionPlot({
        target: containerRef.current,
        width: containerRef.current.clientWidth,
        height: 480,
        tip: {
          xLine: true,
          yLine: true,
          renderer: (x, y) => `(${x.toFixed(3)}, ${y.toFixed(3)})`
        },
        yAxis: { domain: [settings.yMin, settings.yMax] },
        xAxis: { domain: [settings.xMin, settings.xMax] },
        grid: true,
        data: activeFuncs
      })

      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }, [isOpen, functions, isDark, settings])

  const addFunction = () => {
    const colors = ['#6366f1', '#ec4899', '#facc15', '#22c55e', '#ef4444', '#a855f7']
    const nextColor = colors[functions.length % colors.length]
    setFunctions([...functions, { id: Date.now(), latex: '', color: nextColor, visible: true }])
  }

  const updateFunction = (id, updates) => {
    setFunctions(functions.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeFunction = (id) => {
    if (functions.length > 1) {
      setFunctions(functions.filter(f => f.id !== id))
    } else {
      setFunctions([{ id: Date.now(), latex: '', color: '#6366f1', visible: true }])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md shadow-2xl overflow-hidden mt-16 sm:mt-0 transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row h-[90vh] overflow-hidden">
        
        {/* Sidebar: Controls */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600/20" />
              Expressions
            </h3>
            <button 
              onClick={addFunction} 
              className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {functions.map((func, idx) => (
              <div key={func.id} className="group relative flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateFunction(func.id, { visible: !func.visible })}
                    className={`w-4 h-4 rounded-full border-2 transition-all flex-shrink-0 hover:scale-110 active:scale-95 ${func.visible ? '' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50'}`}
                    style={{ backgroundColor: func.visible ? func.color : undefined, borderColor: func.color }}
                  />
                  <input 
                    value={func.latex}
                    onChange={(e) => updateFunction(func.id, { latex: e.target.value })}
                    onFocus={() => setError(null)}
                    placeholder="e.g. sin(x)"
                    className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50"
                  />
                  <button 
                    onClick={() => removeFunction(func.id)} 
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                    title="Remove expression"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {functions.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm italic">
                No expressions. Click + to add one.
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Presets & Modes</h4>
            <div className="flex flex-wrap gap-2">
              {['linear', 'trig', 'exponential'].map(p => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all ${settings.preset === p ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => setSettings(s => ({ ...s, isPolar: !s.isPolar }))}
                className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all ${settings.isPolar ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                POLAR
              </button>
            </div>

            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Window & Steps</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">X Step</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={settings.xStep} 
                  onChange={e => updateSetting('xStep', parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Y Step</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={settings.yStep} 
                  onChange={e => updateSetting('yStep', parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">X Min/Max</label>
                <div className="flex gap-1">
                  <input type="number" value={settings.xMin} onChange={e => updateSetting('xMin', parseFloat(e.target.value))} className="w-1/2 bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 text-[10px] dark:text-slate-100" />
                  <input type="number" value={settings.xMax} onChange={e => updateSetting('xMax', parseFloat(e.target.value))} className="w-1/2 bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 text-[10px] dark:text-slate-100" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Y Min/Max</label>
                <div className="flex gap-1">
                  <input type="number" value={settings.yMin} onChange={e => updateSetting('yMin', parseFloat(e.target.value))} className="w-1/2 bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 text-[10px] dark:text-slate-100" />
                  <input type="number" value={settings.yMax} onChange={e => updateSetting('yMax', parseFloat(e.target.value))} className="w-1/2 bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-1 text-[10px] dark:text-slate-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100/50 dark:border-indigo-900/30">
            <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info className="w-3 h-3" /> Syntax Help
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>x^2</span> <span className="text-slate-400">Power</span>
              <span>sin(x)</span> <span className="text-slate-400">Trig</span>
              <span>sqrt(x)</span> <span className="text-slate-400">Root</span>
              <span>abs(x)</span> <span className="text-slate-400">Abs</span>
              <span>exp(x)</span> <span className="text-slate-400">e^x</span>
              <span>log(x)</span> <span className="text-slate-400">Natural</span>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 italic">
              * Note: For powers of trig, use (sin(x))^2 instead of sin^2(x).
            </p>
          </div>
        </div>

        {/* Main: Plot */}
        <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-950 min-h-[400px]">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 p-6 lg:p-10 flex items-center justify-center overflow-hidden">
            <div ref={containerRef} className="w-full h-full max-h-[600px] graph-svg-container" />
          </div>

          {error && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-3 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <span className="font-medium">Expression Error:</span> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GlobalGrapher
