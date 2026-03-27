import { useState, useEffect, useRef } from 'react'

function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark ? '#0f172a' : '#f8fafc',
    surface: dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9',
    border: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1e293b',
    muted: dark ? '#94a3b8' : '#64748b',
    hint: dark ? '#475569' : '#94a3b8',
    blue: dark ? '#38bdf8' : '#0284c7',
    blueBg: dark ? 'rgba(56,189,248,0.12)' : 'rgba(2,132,199,0.08)',
    blueBd: dark ? '#38bdf8' : '#0284c7',
    amber: dark ? '#fbbf24' : '#d97706',
    amberBg: dark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)',
    amberBd: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a',
    greenBg: dark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)',
    greenBd: dark ? '#4ade80' : '#16a34a',
    red: dark ? '#f87171' : '#dc2626',
    redBg: dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)',
    redBd: dark ? '#f87171' : '#dc2626',
    teal: dark ? '#2dd4bf' : '#0d9488',
    tealBg: dark ? 'rgba(45,212,191,0.12)' : 'rgba(13,148,136,0.08)',
    tealBd: dark ? '#2dd4bf' : '#0d9488',
  }
}

function RateCanvas({ Troom, C }) {
  const ref = useRef(null)
  const k = 0.05
  const T = (T0, t) => Troom + (T0 - Troom) * Math.exp(-k * t)
  useEffect(() => {
    if (!C) return
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    const W = cv.offsetWidth || 500, H = 200
    cv.width = W; cv.height = H
    const pad = { t: 10, r: 10, b: 30, l: 40 }
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b
    const xS = t => pad.l + (t / 80) * iw
    const yS = v => pad.t + ih - (v / 100) * ih
    ctx.clearRect(0, 0, W, H)
    ctx.strokeStyle = C.amber; ctx.setLineDash([5, 5])
    ctx.beginPath(); ctx.moveTo(pad.l, yS(Troom)); ctx.lineTo(pad.l + iw, yS(Troom)); ctx.stroke()
    ctx.setLineDash([]); ctx.strokeStyle = C.red; ctx.beginPath()
    for (let t = 0; t <= 80; t++) { t === 0 ? ctx.moveTo(xS(t), yS(T(95, t))) : ctx.lineTo(xS(t), yS(T(95, t))) }
    ctx.stroke()
    ctx.strokeStyle = C.blue; ctx.beginPath()
    for (let t = 0; t <= 80; t++) { t === 0 ? ctx.moveTo(xS(t), yS(T(4, t))) : ctx.lineTo(xS(t), yS(T(4, t))) }
    ctx.stroke()
  }, [Troom, C])
  return <canvas ref={ref} style={{ width: '100%', height: 200, display: 'block', background: C ? C.surface2 : '#f1f5f9' }} />
}

export default function NewtonCoolingDeep({ params = {} }) {
  const C = useColors()
  const [page, setPage] = useState(params.currentStep ?? 0)
  const [Troom, setTroom] = useState(25)
  if (!C) return null
  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.25rem' }}>
        <h3 style={{fontSize:16, fontWeight:500, color:C.text, marginBottom:8}}>Newton's Cooling Law</h3>
        <RateCanvas Troom={Troom} C={C} />
        <input type="range" min={15} max={40} value={Troom} onChange={e => setTroom(+e.target.value)} style={{ width: '100%', marginTop: 10 }} />
        <div style={{fontSize:12, color:C.muted, marginTop:8}}>Room Temperature: {Troom}°C</div>
      </div>
    </div>
  )
}
