import { useMemo, useState } from 'react'

export default function VectorBuilder() {
  const [tip, setTip] = useState({ x: 180, y: 70 })
  const center = { x: 120, y: 120 }

  const values = useMemo(() => {
    const vx = (tip.x - center.x) / 20
    const vy = (center.y - tip.y) / 20
    const mag = Math.sqrt(vx * vx + vy * vy)
    const ang = (Math.atan2(vy, vx) * 180) / Math.PI
    return { vx, vy, mag, ang }
  }, [tip])

  const onPointerMove = (e) => {
    if (e.buttons !== 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(15, Math.min(225, e.clientX - rect.left))
    const y = Math.max(15, Math.min(225, e.clientY - rect.top))
    setTip({ x, y })
  }

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">Drag the vector tip. Components and direction update in real time.</p>
      <svg
        viewBox="0 0 240 240"
        className="w-full max-w-[360px] bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        onPointerMove={onPointerMove}
      >
        <line x1="0" y1="120" x2="240" y2="120" stroke="#94a3b8" strokeWidth="1" />
        <line x1="120" y1="0" x2="120" y2="240" stroke="#94a3b8" strokeWidth="1" />
        <line x1={center.x} y1={center.y} x2={tip.x} y2={tip.y} stroke="#0ea5e9" strokeWidth="3" />
        <circle cx={tip.x} cy={tip.y} r="7" fill="#0284c7" onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)} />
      </svg>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">vx = {values.vx.toFixed(2)} m/s</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">vy = {values.vy.toFixed(2)} m/s</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">|v| = {values.mag.toFixed(2)} m/s</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">angle = {values.ang.toFixed(1)} deg</div>
      </div>
    </div>
  )
}
