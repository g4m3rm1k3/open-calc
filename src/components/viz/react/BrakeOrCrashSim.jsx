import { useEffect, useMemo, useState } from 'react'

export default function BrakeOrCrashSim() {
  const [mode, setMode] = useState('average')
  const [running, setRunning] = useState(false)
  const [x, setX] = useState(0) // true position
  const [v, setV] = useState(24) // true instantaneous velocity
  const [measuredV, setMeasuredV] = useState(24) // what controller sees
  const [estimatedX, setEstimatedX] = useState(0) // controller's internal position estimate
  const [time, setTime] = useState(0)
  const [sampleClock, setSampleClock] = useState(0)
  const [trueTrace, setTrueTrace] = useState([])
  const [measuredTrace, setMeasuredTrace] = useState([])
  const wall = 100
  const dt = 0.1
  const brakeDecel = 6

  const crashed = x >= wall
  const safe = !running && !crashed && x > 0 && v <= 0
  const lagDistance = Math.max(0, x - estimatedX)
  const lagTime = mode === 'average' ? sampleClock : 0

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setTime((t) => t + dt)

      // True kinematics (calculus-level local update)
      setX((px) => px + v * dt)
      setV((pv) => Math.max(0, pv - brakeDecel * dt))

      // Controller estimate based on measured (possibly stale) velocity
      setEstimatedX((ex) => ex + measuredV * dt)

      // Average mode: stepwise sensor update every 2s; instant mode: continuous
      if (mode === 'instant') {
        setMeasuredV(v)
        setSampleClock(0)
      } else {
        const nextClock = sampleClock + dt
        if (nextClock >= 2) {
          setMeasuredV(v)
          setSampleClock(0)
        } else {
          setSampleClock(nextClock)
        }
      }

      // Telemetry tape
      setTrueTrace((arr) => [...arr.slice(-69), v])
      setMeasuredTrace((arr) => [...arr.slice(-69), measuredV])
    }, 100)
    return () => clearInterval(id)
  }, [running, v, measuredV, mode, sampleClock, time])

  useEffect(() => {
    if (crashed) setRunning(false)
  }, [crashed])

  const status = useMemo(() => {
    if (crashed) return 'Crash'
    if (safe) return 'Safe Stop'
    return 'In Motion'
  }, [crashed, safe])

  const reset = () => {
    setRunning(false)
    setX(0)
    setV(24)
    setMeasuredV(24)
    setEstimatedX(0)
    setTime(0)
    setSampleClock(0)
    setTrueTrace([])
    setMeasuredTrace([])
  }

  const sparkW = 280
  const sparkH = 80
  const toPoints = (arr, colorMode = 'smooth') => {
    if (arr.length < 2) return ''
    return arr.map((val, i) => {
      const px = (i / Math.max(1, arr.length - 1)) * sparkW
      const py = sparkH - (Math.max(0, Math.min(30, val)) / 30) * sparkH
      if (colorMode === 'step' && i > 0) {
        const prevX = ((i - 1) / Math.max(1, arr.length - 1)) * sparkW
        return `${prevX},${py} ${px},${py}`
      }
      return `${px},${py}`
    }).join(' ')
  }

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">Level 1 (Average telemetry) is stale. Level 2 (Instant telemetry) is responsive.</p>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setMode('average')} className={`px-3 py-1 rounded text-xs ${mode === 'average' ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 border'}`}>Level 1: Average</button>
        <button onClick={() => setMode('instant')} className={`px-3 py-1 rounded text-xs ${mode === 'instant' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border'}`}>Level 2: Instant</button>
        <button onClick={() => setRunning((r) => !r)} className="px-3 py-1 rounded text-xs bg-brand-600 text-white">{running ? 'Brake/Pause' : 'Start'}</button>
        <button onClick={reset} className="px-3 py-1 rounded text-xs bg-slate-200 dark:bg-slate-700">Reset</button>
      </div>

      <div className="relative h-20 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="absolute top-8 left-0 right-0 border-t border-dashed border-slate-300 dark:border-slate-600" />
        {/* Computer estimate ghost */}
        <div className="absolute top-6 h-8 w-8 border-2 border-amber-500/70 bg-amber-300/30 rounded" style={{ left: `${Math.min(94, (estimatedX / wall) * 100)}%` }} />
        {/* True car */}
        <div className="absolute top-5 h-10 w-10 bg-blue-500 rounded shadow" style={{ left: `${Math.min(92, (x / wall) * 100)}%` }} />
        <div className="absolute right-2 top-2 h-14 w-2 bg-red-500" />
        <div className="absolute left-2 top-1 text-[10px] text-slate-500">Ghost = stale computer estimate</div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 text-sm">
        <div className="p-3 rounded border bg-white dark:bg-slate-800">True v: {v.toFixed(1)} m/s</div>
        <div className="p-3 rounded border bg-white dark:bg-slate-800">Measured v: {measuredV.toFixed(1)} m/s</div>
        <div className="p-3 rounded border bg-white dark:bg-slate-800">Lag distance: {lagDistance.toFixed(2)} m</div>
        <div className="p-3 rounded border bg-white dark:bg-slate-800">Status: {status}</div>
      </div>

      <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <p className="text-xs text-slate-500 mb-2">Telemetry Overlay: True (smooth) vs Measured (stale/stepped)</p>
        <svg viewBox={`0 0 ${sparkW} ${sparkH}`} className="w-full h-20">
          <polyline fill="none" stroke="#06b6d4" strokeWidth="2.2" points={toPoints(trueTrace)} />
          <polyline fill="none" stroke="#f59e0b" strokeWidth="2.2" points={toPoints(measuredTrace, 'step')} />
        </svg>
      </div>

      {crashed && (
        <div className="p-3 rounded border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          Crash! Your 2-second average telemetry lagged reality. Computer estimated wall distance using stale data while true position had already reached the obstacle.
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">If displayed velocity updates too slowly, braking decisions lag behind reality.</p>
      {!crashed && mode === 'average' && <p className="text-xs text-amber-600 dark:text-amber-300">Reaction lag timer: {lagTime.toFixed(1)} s since last average sensor refresh.</p>}
    </div>
  )
}
