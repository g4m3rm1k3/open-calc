import { useEffect, useMemo, useState } from 'react'

export default function FrameSwitcher() {
  const [frame, setFrame] = useState('ground')
  const [trainV, setTrainV] = useState(18)
  const [walkerV, setWalkerV] = useState(2)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setT((prev) => (prev >= 8 ? 0 : prev + 0.1))
    }, 80)
    return () => clearInterval(id)
  }, [playing])

  const kinematics = useMemo(() => {
    const xTrainGround = trainV * t
    const xWalkerTrain = walkerV * t
    const xWalkerGround = (trainV + walkerV) * t

    const displayedTrain = frame === 'ground' ? xTrainGround : 0
    const displayedWalker = frame === 'ground' ? xWalkerGround : xWalkerTrain

    return {
      xTrainGround,
      xWalkerGround,
      displayedTrain,
      displayedWalker,
      relV: walkerV,
      groundV: trainV + walkerV,
    }
  }, [frame, t, trainV, walkerV])

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFrame('ground')} className={`px-3 py-1 rounded text-xs ${frame === 'ground' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'}`}>Ground Frame</button>
        <button onClick={() => setFrame('train')} className={`px-3 py-1 rounded text-xs ${frame === 'train' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'}`}>Train Frame</button>
        <button onClick={() => setPlaying((p) => !p)} className="px-3 py-1 rounded text-xs bg-slate-200 dark:bg-slate-700">{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => setT(0)} className="px-3 py-1 rounded text-xs bg-slate-200 dark:bg-slate-700">Reset</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-xs">Train speed: {trainV.toFixed(1)} m/s<input type="range" min="0" max="30" step="0.5" value={trainV} onChange={(e) => setTrainV(Number(e.target.value))} className="w-full" /></label>
        <label className="text-xs">Walker speed in train frame: {walkerV.toFixed(1)} m/s<input type="range" min="-8" max="8" step="0.5" value={walkerV} onChange={(e) => setWalkerV(Number(e.target.value))} className="w-full" /></label>
      </div>

      <div className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 mb-2">Time: {t.toFixed(1)} s</p>
        <div className="relative h-16 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
          <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-blue-500" style={{ left: `${Math.max(0, Math.min(92, kinematics.displayedTrain))}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-amber-500" style={{ left: `${Math.max(0, Math.min(95, kinematics.displayedWalker))}%` }} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">v walker/ground = {kinematics.groundV.toFixed(1)} m/s</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">v walker/train = {kinematics.relV.toFixed(1)} m/s</div>
      </div>
    </div>
  )
}
