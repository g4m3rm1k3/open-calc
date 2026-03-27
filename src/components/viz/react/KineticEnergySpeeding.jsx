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

const Tag = ({ label, color, C }) => {
  if (!C) return null
  const m = { blue:[C.blueBg,C.blue], amber:[C.amberBg,C.amber], green:[C.greenBg,C.green], red:[C.redBg,C.red], purple:[C.purpleBg,C.purple] }
  const pair = m[color] || m.blue
  return <span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:pair[0],color:pair[1],fontWeight:500,marginBottom:10}}>{label}</span>
}

function EnergyCurve({ v1 = 0, v2 = 0, C }) {
  const ref = useRef(null)
  const KE = v => 0.5 * 1500 * (v / 3.6) ** 2

  useEffect(() => {
    if (!C) return
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const W = cv.offsetWidth || 500, H = 260
    cv.width = W; cv.height = H
    const pad = { t: 24, r: 20, b: 44, l: 64 }
    const iw = W-pad.l-pad.r, ih = H-pad.t-pad.b
    const vMax = 130, EMax = KE(vMax)
    const xS = v => pad.l + (v/vMax)*iw
    const yS = E => pad.t + ih - (E/EMax)*ih

    ctx.clearRect(0, 0, W, H)

    // grid
    ctx.strokeStyle = C.border; ctx.lineWidth = 1
    for (let v = 0; v <= vMax; v += 20) {
      ctx.beginPath(); ctx.moveTo(xS(v), pad.t); ctx.lineTo(xS(v), pad.t + ih); ctx.stroke()
      ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(v + ' km/h', xS(v), pad.t + ih + 16)
    }
    for (let pct = 0; pct <= 1; pct += 0.25) {
      const E = EMax * pct
      ctx.beginPath(); ctx.moveTo(pad.l, yS(E)); ctx.lineTo(pad.l + iw, yS(E)); ctx.stroke()
      ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
      ctx.fillText(Math.round(E / 1000) + 'kJ', pad.l - 4, yS(E) + 4)
    }

    // Areas
    ctx.beginPath(); ctx.moveTo(xS(v1), yS(KE(v1)))
    for (let v = v1; v <= v2; v += 0.5) ctx.lineTo(xS(v), yS(KE(v)))
    ctx.lineTo(xS(v2), yS(0)); ctx.lineTo(xS(v1), yS(0)); ctx.closePath()
    ctx.fillStyle = 'rgba(248,113,113,0.15)'; ctx.fill()

    ctx.beginPath(); ctx.moveTo(xS(0), yS(0))
    for (let v = 0; v <= v1; v += 0.5) ctx.lineTo(xS(v), yS(KE(v)))
    ctx.lineTo(xS(v1), yS(0)); ctx.closePath()
    ctx.fillStyle = 'rgba(56,189,248,0.08)'; ctx.fill()

    // Curve
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; ctx.beginPath()
    for (let v = 0; v <= vMax; v += 0.5) {
      v === 0 ? ctx.moveTo(xS(v), yS(KE(v))) : ctx.lineTo(xS(v), yS(KE(v)))
    }
    ctx.stroke()

    // Tangent
    const sl = (KE(v1 + 0.1) - KE(v1 - 0.1)) / 0.2
    const tl = 15
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath()
    ctx.moveTo(xS(v1 - tl), yS(KE(v1) - tl * sl))
    ctx.lineTo(xS(v1 + tl), yS(KE(v1) + tl * sl))
    ctx.stroke()

    // Points
    ;[[v1, C.blue], [v2, C.red]].forEach(([v, col]) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xS(v), yS(KE(v)), 6, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = C.text; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(v + ' km/h', xS(v), yS(KE(v)) - 12)
    })
  }, [v1, v2, C])

  return <canvas ref={ref} style={{ width: '100%', height: 260, display: 'block', background: C ? C.surface2 : '#f1f5f9' }} />
}

export default function KineticEnergySpeeding({ params = {} }) {
  const C = useColors()
  const [page, setPage] = useState(params.currentStep ?? 0)
  const [yourSpeed, setYourSpeed] = useState(40)
  const [limit, setLimit] = useState(30)

  if (!C) return null

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {[0, 1].map(p => (
          <div key={p} onClick={() => setPage(p)} style={{ flex: 1, height: 4, cursor: 'pointer', background: page === p ? C.amber : C.border }} />
        ))}
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.25rem' }}>
        {page === 0 ? (
          <>
            <Tag label="Energy & Velocity" color="red" C={C} />
            <h3 style={{fontSize:16, fontWeight:500, color:C.text, marginBottom:8}}>Energy Grows as Square of Speed</h3>
            <EnergyCurve v1={limit} v2={yourSpeed} C={C} />
            <div style={{display:'flex', gap:10, marginTop:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11, color:C.hint}}>Limit ({limit} km/h)</div>
                <input type="range" min={20} max={80} step={10} value={limit} onChange={e=>setLimit(+e.target.value)} style={{width:'100%'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11, color:C.hint}}>Your Speed ({yourSpeed} km/h)</div>
                <input type="range" min={limit+5} max={limit+40} step={5} value={yourSpeed} onChange={e=>setYourSpeed(+e.target.value)} style={{width:'100%'}}/>
              </div>
            </div>
            <p style={{fontSize:13, color:C.muted, marginTop:10}}>
              Since KE = 1/2 mv^2, doubling speed quadruples energy. The amber line shows the derivative (momentum).
            </p>
          </>
        ) : (
          <>
            <Tag label="Stopping Distance" color="red" C={C} />
            <h3 style={{fontSize:16, fontWeight:500, color:C.text, marginBottom:8}}>Braking Physics</h3>
            <p style={{fontSize:13, color:C.muted}}>Stopping distance is also proportional to v^2.</p>
          </>
        )}
      </div>
    </div>
  )
}
