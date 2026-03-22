import React, { useEffect, useRef, useState } from 'react'
import JXG from 'jsxgraph'
import { X, Box, Activity, Layers, Trash2, Plus, Info, Settings2 } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const GlobalGrapherJSX = ({ isOpen, onClose, onSwitchTo2D, onSwitchTo3D }) => {
  const boardRef = useRef(null)
  const [board, setBoard] = useState(null)
  const [functions, setFunctions] = useLocalStorage('global-grapher-jsx-funcs', [
    { id: 1, latex: 'sin(x)', color: '#6366f1', visible: true, type: 'function' },
    { id: 2, latex: 'x^2', color: '#ec4899', visible: true, type: 'function' }
  ])
  
  const [settings, setSettings] = useLocalStorage('global-grapher-jsx-settings', {
    boundingBox: [-10, 10, 10, -10],
    showGrid: true,
    showNavigation: true,
    keepAspectRatio: false,
    showAxis: true,
    minimizeReflow: true,
    isDark: document.documentElement.classList.contains('dark')
  })

  // Theme Sync
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    if (settings.isDark !== isDark) {
      setSettings(s => ({ ...s, isDark }))
      if (board) {
        // Force board colors if already initialized
        board.update()
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && boardRef.current && !board) {
      // Configuration for a truly interactive board
      const b = JXG.JSXGraph.initBoard(boardRef.current.id, {
        boundingbox: settings.boundingBox,
        axis: settings.showAxis,
        grid: settings.showGrid,
        showNavigation: settings.showNavigation,
        showCopyright: false,
        keepaspectratio: settings.keepAspectRatio,
        pan: { enabled: true, needShift: false, needTwoFinger: false },
        zoom: { factorX: 1.2, factorY: 1.2, wheel: true, needShift: false },
        browser: { scroll: 'none' },
        selection: { enabled: true, withShift: true, vertices: { visible: false } }
      })

      // Sync bounding box movements back to settings so they persist
      b.on('update', () => {
        const box = b.getBoundingBox()
        // Use a small timeout or check to prevent recursive loop if using state
      })

      setBoard(b)
    }

    return () => {
      if (board) {
        try {
          JXG.JSXGraph.freeBoard(board)
        } catch (e) {
          console.warn("JSXGraph cleanup warning:", e)
        }
        setBoard(null)
      }
    }
  }, [isOpen, settings.showGrid, settings.showAxis, settings.keepAspectRatio])

  // Update functions on the board
  useEffect(() => {
    if (!board) return

    // Collect existing non-axis objects to clean up
    const toRemove = []
    board.objectsList.forEach(obj => {
      if (obj.type !== JXG.OBJECT_TYPE_AXIS && obj.name !== 'grid') {
        toRemove.push(obj)
      }
    })
    board.removeObject(toRemove)

    functions.forEach(f => {
      if (!f.visible || !f.latex) return

      try {
        const jsFormula = f.latex
          .replace(/\^/g, '**')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/exp/g, 'Math.exp')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/abs/g, 'Math.abs')
          .replace(/log/g, 'Math.log')
          .replace(/pi/g, 'Math.PI')

        board.create('functiongraph', [new Function('x', `return ${jsFormula}`)], {
          strokeColor: f.color,
          strokeWidth: 3,
          highlightStrokeWidth: 4,
          name: f.latex,
          withLabel: false,
          fixed: false // Allow it to be somewhat interactive
        })
      } catch (e) {
        console.error("JSXGraph Eval Error:", e)
      }
    })

    board.update()
  }, [board, functions])

  if (!isOpen) return null

  const addFunction = () => {
    const colors = ['#6366f1', '#ec4899', '#facc15', '#22c55e', '#ef4444', '#a855f7']
    const nextColor = colors[functions.length % colors.length]
    setFunctions([...functions, { id: Date.now(), latex: '', color: nextColor, visible: true, type: 'function' }])
  }

  const updateFunction = (id, updates) => {
    setFunctions(functions.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeFunction = (id) => {
    setFunctions(functions.filter(f => f.id !== id))
  }

  const updateSetting = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }))
    if (board && key === 'boundingBox') {
      board.setBoundingBox(val)
    }
  }

  const resetView = () => {
    if (board) {
      board.setBoundingBox([-10, 10, 10, -10])
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl transition-all duration-500 overflow-hidden text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-7xl flex flex-col md:flex-row h-[92vh] overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-950/30 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 transition-colors">
            <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight uppercase text-xs">
              <Settings2 className="w-5 h-5 text-emerald-500 animate-pulse" />
              JSXGraph Pro
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={onSwitchTo2D} title="Switch to D3 (G)" className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 transition-all"><Activity className="w-4 h-4" /></button>
              <button onClick={onSwitchTo3D} title="Switch to 3D (3)" className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400 transition-all"><Box className="w-4 h-4" /></button>
              <button onClick={addFunction} className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 ml-2"><Plus className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-2">
               <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Functions</h4>
               {functions.map((func) => (
                <div key={func.id} className="group flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-400 dark:hover:border-emerald-500/50">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateFunction(func.id, { visible: !func.visible })}
                      className={`w-4 h-4 rounded-full border-2 transition-all flex-shrink-0 ${func.visible ? '' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50'}`}
                      style={{ backgroundColor: func.visible ? func.color : undefined, borderColor: func.color }}
                    />
                    <input 
                      value={func.latex}
                      onChange={(e) => updateFunction(func.id, { latex: e.target.value })}
                      className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm text-slate-700 dark:text-slate-200 placeholder:opacity-30"
                      placeholder="Math.sin(x)"
                    />
                    <button onClick={() => removeFunction(func.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Board Settings</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                   onClick={() => updateSetting('showGrid', !settings.showGrid)}
                   className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${settings.showGrid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                >GRID</button>
                <button 
                   onClick={() => updateSetting('showAxis', !settings.showAxis)}
                   className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${settings.showAxis ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                >AXES</button>
                <button 
                   onClick={() => updateSetting('keepAspectRatio', !settings.keepAspectRatio)}
                   className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${settings.keepAspectRatio ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                >1:1 ASPECT</button>
                <button 
                   onClick={resetView}
                   className="px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >RESET VIEW</button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-emerald-50/30 dark:bg-emerald-950/10 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-500 mt-1" />
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-bold text-emerald-600 dark:text-indigo-400">Interaction Guide</p>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li><strong>Pan:</strong> Left-click and drag</li>
                  <li><strong>Zoom:</strong> Mouse wheel</li>
                  <li><strong>Multitouch:</strong> Pinch supported</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 relative bg-white dark:bg-slate-950 overflow-hidden cursor-crosshair">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-[80] p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-xl"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            id="jxgbox-global" 
            ref={boardRef}
            className="w-full h-full jxgbox shadow-inner"
            style={{ backgroundColor: 'transparent' }}
          />

          <style dangerouslySetInnerHTML={{ __html: `
            .jxgbox { border: none !important; }
            .dark .jxgbox { background-color: #020617 !important; }
            .dark .JXG_axis { stroke: #334155 !important; }
            .dark .JXG_grid { stroke: #1e293b !important; stroke-dasharray: 0 !important; }
            .dark .JXG_text { fill: #94a3b8 !important; font-family: 'JetBrains Mono', monospace !important; font-size: 10px !important; }
            .JXG_navigation { display: flex !important; gap: 4px; border-radius: 12px !important; padding: 4px !important; bottom: 20px !important; right: 20px !important; }
            .JXG_navigation_button { background: white !important; border-radius: 6px !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; color: #64748b !important; }
            .dark .JXG_navigation_button { background: #1e293b !important; color: #94a3b8 !important; border: 1px solid #334155 !important; }
          `}} />
        </div>
      </div>
    </div>
  )
}

export default GlobalGrapherJSX
