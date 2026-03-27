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
    purple: dark ? '#a78bfa' : '#7c3aed',
    purpleBg: dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)',
    purpleBd: dark ? '#a78bfa' : '#7c3aed',
  }
}

const h = x => 30*Math.sin(x*0.1) + 10*Math.sin(x*0.3) + 20
const dh = x => { const dx=0.01; return (h(x+dx)-h(x-dx))/(2*dx) }

function Coaster({ xCar, C }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!C) return
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    const W = cv.offsetWidth||500, H = 200
    cv.width = W; cv.height = H
    const pad = {l:20, r:20, t:10, b:30}
    const iw = W-pad.l-pad.r, ih = H-pad.t-pad.b
    const xS = x => pad.l + (x/100)*iw, yS = y => pad.t + ih - (y/80)*ih
    ctx.clearRect(0,0,W,H)
    ctx.strokeStyle = C.hint; ctx.lineWidth = 2; ctx.beginPath()
    for(let x=0; x<=100; x++){ x===0?ctx.moveTo(xS(x),yS(h(x))):ctx.lineTo(xS(x),yS(h(x))) }
    ctx.stroke()
    ctx.strokeStyle = C.blue; ctx.beginPath()
    for(let x=0; x<=100; x++){ const y = H - 15 - dh(x)*30; x===0?ctx.moveTo(xS(x),y):ctx.lineTo(xS(x),y) }
    ctx.stroke()
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(xS(xCar), yS(h(xCar)), 10, 0, 7); ctx.fill()
  }, [xCar, C])
  return <canvas ref={ref} style={{ width: '100%', height: 200, display: 'block', background: C ? C.surface2 : '#f1f5f9' }} />
}

export default function RollerCoasterDeep({ params = {} }) {
  const C = useColors()
  const [x, setX] = useState(10)
  if (!C) return null
  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '1.25rem' }}>
        <h3 style={{fontSize:16, fontWeight:500, color:C.text, marginBottom:8}}>Roller Coaster Slopes</h3>
        <Coaster xCar={x} C={C} />
        <input type="range" min={0} max={100} value={x} onChange={e => setX(+e.target.value)} style={{ width: '100%', marginTop: 10 }} />
      </div>
    </div>
  )
}
