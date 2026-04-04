import { useState, useEffect, useMemo, useRef } from 'react'
import { CNCInterpreter } from '../../../scripts/cnc/CNCInterpreter.js'
import CNCBackplot from './CNCBackplot.jsx'

/**
 * CNCLab - The "Command Center" for CNC Macro learning.
 * Mimics an actual Fanuc or Siemens Control Panel.
 */
export default function CNCLab({ initialCode = '', dialect = 'fanuc' }) {
  const [activeTab, setActiveTab] = useState('dro')
  const [code, setCode] = useState(initialCode)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [pathPoints, setPathPoints] = useState([])
  
  // Use a ref for the interpreter to maintain state correctly between steps
  const interpreterRef = useRef(new CNCInterpreter(dialect))
  const [machineState, setMachineState] = useState(interpreterRef.current.state)

  // Initialize Program
  useEffect(() => {
    interpreterRef.current.setDialect(dialect)
    interpreterRef.current.loadProgram(code)
    
    // Generate the path points for the backplot overview
    // (A machine actual path is a stream, but we pre-render the "future" lines)
    const points = []
    const tempInterpreter = new CNCInterpreter(dialect)
    tempInterpreter.loadProgram(code)
    
    points.push({ ...tempInterpreter.state })
    while (tempInterpreter.state.programPointer < tempInterpreter.blocks.length) {
      const state = tempInterpreter.step()
      points.push({ ...state })
    }
    setPathPoints(points)
    
    // Reset live machine state
    interpreterRef.current.loadProgram(code)
    setMachineState({ ...interpreterRef.current.state })
    setCurrentStep(0)
  }, [code, dialect])

  const stepNext = () => {
    const newState = interpreterRef.current.step()
    setMachineState({ ...newState })
    setCurrentStep(newState.programPointer)
  }

  const resetAll = () => {
    interpreterRef.current.loadProgram(code)
    setMachineState({ ...interpreterRef.current.state })
    setCurrentStep(0)
    setIsPlaying(false)
  }

  // Auto Play
  useEffect(() => {
    let timer
    if (isPlaying && !machineState.isDone) {
      timer = setTimeout(stepNext, 500)
    } else {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, machineState])

  return (
    <div className="flex flex-col gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-2xl font-mono select-none">
      
      {/* ── CONTROL TOP BAR ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 rounded-t-lg border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-slate-700'}`} />
            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Current Status: {machineState.isDone ? 'COMPLETED' : isPlaying ? 'EXECUTING' : 'READY'}</span>
          </div>
          <div className="text-[10px] text-brand-400 border-l border-white/10 pl-4 uppercase">
            Dialect: {dialect}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className={`px-4 py-1.5 rounded text-xs font-bold transition ${isPlaying ? 'bg-amber-600 text-white' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'}`}>
            {isPlaying ? 'STOP' : 'AUTO (CYCLE START)'}
          </button>
          <button onClick={stepNext} disabled={isPlaying || machineState.isDone} className="px-4 py-1.5 bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30 rounded text-xs font-bold disabled:opacity-30">
            SINGLE BLOCK
          </button>
          <button onClick={resetAll} className="px-2 py-1.5 bg-slate-800 text-slate-400 rounded text-xs">
            RESET
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 h-[600px]">
        
        {/* Left Panel: The Control Screen (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 flex flex-col border border-white/10 rounded-bl-lg overflow-hidden">
          
          {/* SCREEN TABS */}
          <div className="flex bg-slate-950 gap-0.5 p-1 border-b border-white/5">
            {['DRO', 'OFFSETS', 'MACROS', 'CODE'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t.toLowerCase())}
                className={`flex-1 py-1 text-[9px] font-bold rounded transition ${activeTab === t.toLowerCase() ? 'bg-slate-800 text-brand-400 border border-white/10' : 'text-slate-600'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            {activeTab === 'dro' && (
              <div className="space-y-6">
                {/* LARGE COORDINATE DISPLAY */}
                <div className="space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">{machineState.activeOffset} WORK POSITION</div>
                  {['X', 'Y', 'Z'].map(axis => (
                    <div key={axis} className="flex items-center justify-between bg-black/40 px-4 py-3 rounded border border-white/5">
                      <span className="text-3xl font-bold text-slate-500">{axis}</span>
                      <span className="text-4xl font-bold text-emerald-400 tabular-nums">
                        {machineState[`program${axis}`].toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* FEED & SPINDLE */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/20 p-2 rounded border border-white/5">
                    <div className="text-[9px] text-slate-500">FEEDRATE (F)</div>
                    <div className="text-xl text-amber-400">{machineState.feedrate.toFixed(1)} <span className="text-[10px] text-slate-600">IPM</span></div>
                  </div>
                  <div className="bg-black/20 p-2 rounded border border-white/5">
                    <div className="text-[9px] text-slate-500">SPINDLE (S)</div>
                    <div className="text-xl text-brand-400">{machineState.spindle} <span className="text-[10px] text-slate-600">RPM</span></div>
                  </div>
                </div>

                {/* MODAL CODES */}
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {['motionMode', 'posMode', 'plane', 'activeOffset'].map(m => (
                    <span key={m} className="px-2 py-1 bg-slate-800 rounded text-slate-400 border border-white/5">{machineState[m]}</span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'offsets' && (
              <div className="space-y-2">
                <h4 className="text-[10px] text-slate-500 mb-4 tracking-widest">WORK COORDINATE OFFSETS</h4>
                {Object.entries(machineState.offsets).map(([name, vals]) => (
                  <div key={name} className={`p-2 rounded border transition ${machineState.activeOffset === name ? 'bg-brand-500/10 border-brand-500' : 'bg-black/20 border-white/5'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-300">{name}</span>
                      {machineState.activeOffset === name && <span className="text-[7px] bg-brand-500 text-white px-1 rounded">ACTIVE</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                      <div>X: <span className="text-slate-100">{vals.x.toFixed(4)}</span></div>
                      <div>Y: <span className="text-slate-100">{vals.y.toFixed(4)}</span></div>
                      <div>Z: <span className="text-slate-100">{vals.z.toFixed(4)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'macros' && (
              <div className="space-y-4">
                <h4 className="text-[10px] text-slate-500 tracking-widest">VARIABLE WATCH</h4>
                <div className="grid grid-cols-2 gap-1">
                  {[...machineState.vars.entries()].map(([id, val]) => (
                    <div key={id} className="flex justify-between bg-black/40 px-2 py-1 rounded border border-white/5 text-[10px] transition-all animate-in fade-in">
                      <span className="text-slate-500">#{id}</span>
                      <span className="text-brand-400">{val.toFixed(3)}</span>
                    </div>
                  ))}
                  {machineState.vars.size === 0 && <div className="col-span-2 text-center text-slate-700 text-[10px] py-10 italic">EMPTY REGISTER</div>}
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="flex flex-col h-full">
                <textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-black text-emerald-500 text-xs p-4 focus:outline-none resize-none font-mono leading-relaxed"
                  spellCheck="false"
                  placeholder="G-Code input..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Simulation & Code View (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-1">
          {/* Backplot */}
          <div className="flex-1 relative">
            <CNCBackplot pathPoints={pathPoints} currentStep={currentStep} height="400" />
          </div>

          {/* Program Trace (Bottom Feed) */}
          <div className="h-40 bg-slate-900 border border-white/10 rounded-br-lg p-2 overflow-hidden flex flex-col">
            <div className="text-[8px] text-slate-500 uppercase tracking-widest px-2 mb-1">PROGRAM TRACE (BLOCK N - {machineState.programPointer})</div>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
              {interpreterRef.current.blocks.map((b, idx) => (
                <div key={idx} className={`px-2 py-0.5 rounded transition ${machineState.programPointer === idx ? 'bg-brand-500/20 text-brand-400 border-l-2 border-brand-500' : 'text-slate-600 opacity-60'}`}>
                  <span className="inline-block w-8 opacity-30 text-[10px]">{idx}</span>
                  {b.raw}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
