import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function ModelVsReality({ params = {} }) {
  const [showAirResistance, setShowAirResistance] = useState(params.showAirResistance || false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const frameRef = useRef(null)
  const startRef = useRef(null)

  // Simulation parameters
  const g = 9.8
  const k = 0.5 // simplified air resistance coefficient
  
  // Equations of motion
  // Ideal: y = 1/2 g t^2
  // With resistance (approximate): v_terminal = g/k, y = (g/k) * (t - (1/k)*(1 - exp(-k*t)))
  
  const getIdealY = (t) => 0.5 * g * t**2
  const getRealY = (t) => (g/k) * (t - (1/k) * (1 - Math.exp(-k * t)))

  useEffect(() => {
    if (!isPlaying) return
    if (startRef.current === null) {
      startRef.current = performance.now() - (time * 1000)
    }

    const step = (now) => {
      const t = (now - startRef.current) / 1000
      if (t <= 5) {
        setTime(t)
        frameRef.current = requestAnimationFrame(step)
        return
      }
      setTime(5)
      setIsPlaying(false)
      startRef.current = null
    }

    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isPlaying, time])

  const reset = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    startRef.current = null
    setIsPlaying(false)
    setTime(0)
  }

  const { idealY, realY } = useMemo(() => {
    const scale = 3
    return {
      idealY: Math.min(92, getIdealY(time) * scale),
      realY: Math.min(92, getRealY(time) * scale),
    }
  }, [time])

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">
          Simulation: Free Fall
        </h4>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAirResistance(!showAirResistance)}
            className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
              showAirResistance 
                ? 'bg-red-500 border-red-600 text-white shadow-sm' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
            }`}
          >
            Air Resistance: {showAirResistance ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => {
              if (time >= 5) reset()
              setIsPlaying((prev) => !prev)
            }}
            className="px-4 py-1 text-xs font-bold bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-all"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-1 text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative h-64 border-l-2 border-b-2 border-slate-300 dark:border-slate-700 mx-10">
        {/* Ideal Ball */}
        <div 
          className="absolute w-6 h-6 bg-blue-500/30 rounded-full border-2 border-blue-500 flex items-center justify-center transition-all duration-75"
          style={{ top: `${idealY}%`, left: '25%', transform: 'translate(-50%, -50%)' }}
        >
          <span className="text-[8px] font-bold text-blue-700 dark:text-blue-300">Ideal</span>
        </div>

        {/* Real Ball */}
        {showAirResistance && (
          <div 
            className="absolute w-6 h-6 bg-red-500/30 rounded-full border-2 border-red-500 flex items-center justify-center transition-all duration-75"
            style={{ top: `${realY}%`, left: '75%', transform: 'translate(-50%, -50%)' }}
          >
            <span className="text-[8px] font-bold text-red-700 dark:text-red-300">Real</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400">
          Time: {time.toFixed(2)}s
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] font-mono">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
          <p className="text-blue-600 dark:text-blue-400 font-bold mb-1">Vacuum Model</p>
          <p className="text-slate-500 text-[10px]">y = 0.5 * 9.8 * t²</p>
          <p className="mt-1">Pos: {getIdealY(time).toFixed(2)}m</p>
        </div>
        <div className={`p-2 rounded border transition-all ${
          showAirResistance 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 opacity-100' 
            : 'bg-slate-100 dark:bg-slate-800 border-transparent opacity-30 grayscale'
        }`}>
          <p className="text-red-600 dark:text-red-400 font-bold mb-1">Atmospheric Model</p>
          <p className="text-slate-500 text-[10px]">y = v_term * (t - τ(1 - e⁻ᵗ៸τ))</p>
          <p className="mt-1">Pos: {getRealY(time).toFixed(2)}m</p>
        </div>
      </div>
    </div>
  )
}
