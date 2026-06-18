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
    bg: dark ? '#0f172a' : '#f8fafc', surface: dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9', border: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1e293b', muted: dark ? '#94a3b8' : '#64748b', hint: dark ? '#475569' : '#94a3b8',
    blue: dark ? '#38bdf8' : '#0284c7', blueBg: dark ? 'rgba(56,189,248,0.12)' : 'rgba(2,132,199,0.08)', blueBd: dark ? '#38bdf8' : '#0284c7',
    amber: dark ? '#fbbf24' : '#d97706', amberBg: dark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)', amberBd: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a', greenBg: dark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)', greenBd: dark ? '#4ade80' : '#16a34a',
    red: dark ? '#f87171' : '#dc2626', redBg: dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', redBd: dark ? '#f87171' : '#dc2626',
    teal: dark ? '#2dd4bf' : '#0d9488', tealBg: dark ? 'rgba(45,212,191,0.12)' : 'rgba(13,148,136,0.08)', tealBd: dark ? '#2dd4bf' : '#0d9488',
  }
}

function Tag({ label, color, C }) {
  const m = { blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber], green: [C.greenBg, C.green], red: [C.redBg, C.red], teal: [C.tealBg, C.teal] }
  const [bg, tc] = m[color] || m.blue
  return <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 9px', borderRadius: 6, background: bg, color: tc, fontWeight: 500, marginBottom: 10 }}>{label}</span>
}
function H({ children, C }) { return <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{children}</h3> }
function P({ children, C }) { return <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, marginBottom: 10 }}>{children}</p> }
function B({ children }) { return <span style={{ fontWeight: 500 }}>{children}</span> }
function Callout({ children, color, title, C }) {
  const m = { blue: [C.blueBg, C.blueBd, C.blue], amber: [C.amberBg, C.amberBd, C.amber], green: [C.greenBg, C.greenBd, C.green], red: [C.redBg, C.redBd, C.red], teal: [C.tealBg, C.tealBd, C.teal] }
  const [bg, bd, tc] = m[color] || m.amber
  return <div style={{ borderLeft: `2px solid ${bd}`, background: bg, borderRadius: '0 6px 6px 0', padding: '8px 12px', marginBottom: 10 }}>
    {title && <div style={{ fontSize: 12, fontWeight: 500, color: tc, marginBottom: 4 }}>{title}</div>}
    <p style={{ fontSize: 13, color: tc, lineHeight: 1.6, margin: 0 }}>{children}</p>
  </div>
}
function AhaBox({ title, children, C }) {
  return <div style={{ background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 10 }}>
    <div style={{ fontSize: 14, fontWeight: 500, color: C.green, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: C.green, lineHeight: 1.65 }}>{children}</div>
  </div>
}

// ── cooling curve canvas ─────────────────────────────────────────────────────
function CoolingCanvas({ T0, Troom, k, tHover, onHover, C }) {
  const ref = useRef(null)
  const roRef = useRef(null)
  const T = t => Troom + (T0 - Troom) * Math.exp(-k * t)
  const dT = t => -k * (T0 - Troom) * Math.exp(-k * t)

  useEffect(() => {
    const draw = () => {
      const cv = ref.current; if (!cv) return
      const W = cv.offsetWidth || 500, H = 260
      cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const pad = { t: 16, r: 20, b: 44, l: 52 }
      const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b
      const tMax = 60, Tmin = Troom - 5, Tmax = T0 + 5
      const xS = t => pad.l + (t / tMax) * iw
      const yS = Tv => pad.t + ih - ((Tv - Tmin) / (Tmax - Tmin)) * ih

      ctx.clearRect(0, 0, W, H)

      // grid
      for (let t = 0; t <= tMax; t += 10) {
        ctx.strokeStyle = C.border; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(xS(t), pad.t); ctx.lineTo(xS(t), pad.t + ih); ctx.stroke()
        ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(t + ' min', xS(t), pad.t + ih + 16)
      }
      const Ticks = [Troom, Math.round(Troom + (T0 - Troom) / 3), Math.round(Troom + 2 * (T0 - Troom) / 3), T0]
      Ticks.forEach(Tv => {
        ctx.strokeStyle = C.border; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(pad.l, yS(Tv)); ctx.lineTo(pad.l + iw, yS(Tv)); ctx.stroke()
        ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
        ctx.fillText(Tv + '°C', pad.l - 4, yS(Tv) + 4)
      })

      // room temp line
      ctx.strokeStyle = C.red; ctx.lineWidth = 1; ctx.setLineDash([5, 4])
      ctx.beginPath(); ctx.moveTo(pad.l, yS(Troom)); ctx.lineTo(pad.l + iw, yS(Troom)); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.red; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('room: ' + Troom + '°C', pad.l + 4, yS(Troom) - 5)

      // cooling curve
      const isWarm = T0 > Troom
      const curveColor = isWarm ? C.amber : C.blue
      ctx.strokeStyle = curveColor; ctx.lineWidth = 2.5; ctx.beginPath()
      for (let i = 0; i <= 300; i++) {
        const t = (i / 300) * tMax
        i === 0 ? ctx.moveTo(xS(t), yS(T(t))) : ctx.lineTo(xS(t), yS(T(t)))
      }
      ctx.stroke()

      ctx.fillStyle = curveColor; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('T(t) = ' + Troom + ' + ' + (T0 - Troom) + '·e^(−' + k.toFixed(2) + 't)', pad.l + 8, pad.t + 16)

      // hover
      if (tHover !== null) {
        const t0 = tHover, Tv = T(t0), rate = dT(t0)
        const tlen = 5
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(xS(t0 - tlen), yS(Tv - tlen * rate))
        ctx.lineTo(xS(t0 + tlen), yS(Tv + tlen * rate))
        ctx.stroke()
        ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(xS(t0), yS(Tv), 5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = C.text; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
        const lx = xS(t0) + 8, ly = yS(Tv) - 28
        ctx.fillText(`t = ${t0.toFixed(0)} min`, lx, ly)
        ctx.fillStyle = curveColor; ctx.fillText(`T = ${Tv.toFixed(1)}°C`, lx, ly + 14)
        ctx.fillStyle = C.amber; ctx.fillText(`dT/dt = ${rate.toFixed(2)} °C/min`, lx, ly + 28)
        // gap arrow
        ctx.strokeStyle = C.hint; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
        ctx.beginPath(); ctx.moveTo(xS(t0), yS(Tv)); ctx.lineTo(xS(t0), yS(Troom)); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = C.hint; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(`gap: ${(Tv - Troom).toFixed(1)}°`, xS(t0) + 4, (yS(Tv) + yS(Troom)) / 2)
      }

      ctx.fillStyle = C.muted; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('time (minutes)', pad.l + iw / 2, H - 5)
      ctx.save(); ctx.translate(13, pad.t + ih / 2); ctx.rotate(-Math.PI / 2)
      ctx.fillText('temperature (°C)', 0, 0); ctx.restore()
    }
    draw()
    if (!roRef.current) { roRef.current = new ResizeObserver(draw); if (ref.current?.parentElement) roRef.current.observe(ref.current.parentElement) }
    return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
  }, [T0, Troom, k, tHover, C])

  const handleMove = (e) => {
    const cv = ref.current; if (!cv) return
    const rect = cv.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (cv.width / rect.width)
    const t = ((mx - 52) / (cv.width - 72)) * 60
    if (t >= 0 && t <= 60) onHover(parseFloat(t.toFixed(1)))
  }

  return <canvas ref={ref} onMouseMove={handleMove} onMouseLeave={() => onHover(null)}
    style={{ width: '100%', height: 260, display: 'block', cursor: 'crosshair' }} />
}

const PAGES = [
  // page 0 — the scenario
  ({ C }) => {
    const [T0, setT0] = useState(4)
    const [Troom, setTroom] = useState(25)
    const [k, setK] = useState(0.05)
    const [tHover, setTHover] = useState(null)
    const T = t => Troom + (T0 - Troom) * Math.exp(-k * t)
    const dT = t => -k * (T0 - Troom) * Math.exp(-k * t)

    return <>
      <Tag label="The scenario" color="blue" C={C} />
      <H C={C}>A cold glass in a warm room — why does it warm up faster at first?</H>
      <P C={C}>You take a glass of water out of the fridge at 4°C. The room is 25°C. The glass warms up — but not at a constant rate. It warms up <B>fast at first, then slower and slower</B>. Why?</P>
      <P C={C}>Hover over the curve below. The tangent slope at each moment is dT/dt — the rate of temperature change. Watch how it gets flatter as the glass approaches room temperature.</P>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          { l: 'Glass starts at', val: T0, set: setT0, min: -10, max: 20, color: C.blue, unit: '°C' },
          { l: 'Room temperature', val: Troom, set: setTroom, min: 15, max: 40, color: C.red, unit: '°C' },
          { l: 'Conductivity k', val: k, set: setK, min: 0.01, max: 0.15, step: 0.01, color: C.amber, unit: '' },
        ].map((s, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 11, color: C.hint, marginBottom: 2 }}>{s.l}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: s.color, marginBottom: 4 }}>{typeof s.val === 'number' && s.val % 1 !== 0 ? s.val.toFixed(2) : s.val}{s.unit}</div>
          <input type="range" min={s.min} max={s.max} step={s.step || 1} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: '100%' }} />
        </div>)}
      </div>
      <CoolingCanvas T0={T0} Troom={Troom} k={k} tHover={tHover} onHover={setTHover} C={C} />
      {tHover !== null && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
        {[
          { l: 'Temperature now', v: T(tHover).toFixed(1) + '°C', c: T0 < Troom ? C.blue : C.amber },
          { l: 'Gap to room temp', v: (T(tHover) - Troom).toFixed(1) + '°C', c: C.muted },
          { l: 'Rate of change', v: dT(tHover).toFixed(3) + ' °C/min', c: C.amber },
        ].map((x, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint }}>{x.l}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: x.c }}>{x.v}</div>
        </div>)}
      </div>}
      <AhaBox title="The aha moment" C={C}>
        The rate of warming is proportional to the gap between the glass and room temperature. When the gap is large, the rate is large. As the gap shrinks, the rate shrinks too. The glass will never quite reach exactly room temperature — it just gets closer and closer. This is exponential decay in real life.
      </AhaBox>
    </>
  },

  // page 1 — the differential equation
  ({ C }) => {
    const [k, setK] = useState(0.05)
    const [T0, setT0] = useState(4)
    const Troom = 25
    const scenarios = [
      { label: 'Metal cup', k: 0.12, color: C.red },
      { label: 'Glass', k: 0.05, color: C.blue },
      { label: 'Thermos', k: 0.01, color: C.green },
    ]
    const [scenario, setScenario] = useState(1)
    const sk = scenarios[scenario].k
    const T = t => Troom + (T0 - Troom) * Math.exp(-sk * t)
    const halvingTime = Math.log(2) / sk

    return <>
      <Tag label="The equation" color="amber" C={C} />
      <H C={C}>Newton's Law of Cooling — the differential equation</H>
      <P C={C}>The physical law is: <B>the rate of temperature change is proportional to the temperature difference</B>. Written as a derivative:</P>
      <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13, color: C.text, lineHeight: 2.1, marginBottom: 10 }}>
        dT/dt = −k · (T − T_room){'\n\n'}
        where k {'>'} 0 is the cooling constant{'\n'}
        (depends on material, surface area, airflow)
      </div>
      <P C={C}>This is a <B>differential equation</B> — an equation that involves a derivative. The solution (found by separating variables and integrating) is:</P>
      <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13, color: C.text, lineHeight: 2.1, marginBottom: 10 }}>
        T(t) = T_room + (T₀ − T_room) · e^(−kt){'\n\n'}
        T₀ = starting temperature{'\n'}
        e = Euler's number ≈ 2.718
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {scenarios.map((s, i) => <button key={i} onClick={() => setScenario(i)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', border: `0.5px solid ${scenario === i ? C.blueBd : C.border}`, background: scenario === i ? C.blueBg : 'transparent', color: scenario === i ? C.blue : C.muted, fontWeight: scenario === i ? 500 : 400 }}>{s.label}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[
          { l: 'k value', v: sk.toFixed(2), c: C.amber },
          { l: 'Temp after 10 min', v: T(10).toFixed(1) + '°C', c: C.blue },
          { l: 'Half the gap closes in', v: halvingTime.toFixed(1) + ' min', c: C.green },
        ].map((x, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint }}>{x.l}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: x.c }}>{x.v}</div>
        </div>)}
      </div>
      <Callout color="amber" title="Why a metal cup warms faster" C={C}>
        k is larger for metal because metal conducts heat faster. A larger k means the exponential decays faster — the temperature gap closes more quickly. The shape of the curve is always the same (exponential), just compressed or stretched in time.
      </Callout>
      <Callout color="green" title="The derivative tells you the instantaneous rate" C={C}>
        dT/dt = −k·(T − T_room). At t=0, T = T₀, so dT/dt = −k·(T₀ − T_room). For the cold glass: −0.05·(4−25) = +1.05 °C/min. After 20 min, T ≈ 16.4°C, so rate = −0.05·(16.4−25) = +0.43 °C/min. The rate has more than halved, even though the same k applies.
      </Callout>
    </>
  },

  // page 2 — two glasses at once
  ({ C }) => {
    const [Troom, setTroom] = useState(30)
    const [tLine, setTLine] = useState(20)
    const k = 0.05
    const scenarios = [
      { T0: 4, label: 'Cold glass (4°C)', color: C.blue },
      { T0: 95, label: 'Hot coffee (95°C)', color: C.red },
    ]
    const T = (T0, t) => Troom + (T0 - Troom) * Math.exp(-k * t)
    const ref = useRef(null)
    const roRef = useRef(null)

    useEffect(() => {
      const draw = () => {
        const cv = ref.current; if (!cv) return
        const W = cv.offsetWidth || 500, H = 250
        cv.width = W; cv.height = H
        const ctx = cv.getContext('2d')
        const pad = { t: 16, r: 20, b: 40, l: 52 }
        const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b
        const tMax = 80
        const xS = t => pad.l + (t / tMax) * iw
        const yS = Tv => pad.t + ih - ((Tv - 0) / 100) * ih

        ctx.clearRect(0, 0, W, H)
        for (let t = 0; t <= tMax; t += 20) {
          ctx.strokeStyle = C.border; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(xS(t), pad.t); ctx.lineTo(xS(t), pad.t + ih); ctx.stroke()
          ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
          ctx.fillText(t + ' min', xS(t), pad.t + ih + 16)
        }
        for (let Tv = 0; Tv <= 100; Tv += 20) {
          ctx.strokeStyle = C.border; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(pad.l, yS(Tv)); ctx.lineTo(pad.l + iw, yS(Tv)); ctx.stroke()
          ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
          ctx.fillText(Tv + '°', pad.l - 4, yS(Tv) + 4)
        }

        // room temp
        ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4])
        ctx.beginPath(); ctx.moveTo(pad.l, yS(Troom)); ctx.lineTo(pad.l + iw, yS(Troom)); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = C.amber; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText('Room ' + Troom + '°C', pad.l + 4, yS(Troom) - 5)

        scenarios.forEach(sc => {
          ctx.strokeStyle = sc.color; ctx.lineWidth = 2.5; ctx.beginPath()
          for (let i = 0; i <= 300; i++) {
            const t = (i / 300) * tMax
            i === 0 ? ctx.moveTo(xS(t), yS(T(sc.T0, t))) : ctx.lineTo(xS(t), yS(T(sc.T0, t)))
          }
          ctx.stroke()
          ctx.fillStyle = sc.color; ctx.font = '12px sans-serif'; ctx.textAlign = 'left'
          ctx.fillText(sc.label, pad.l + 8, yS(sc.T0) + (sc.T0 > Troom ? 16 : -5))
        })

        // time line
        ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3])
        ctx.beginPath(); ctx.moveTo(xS(tLine), pad.t); ctx.lineTo(xS(tLine), pad.t + ih); ctx.stroke()
        ctx.setLineDash([])
        scenarios.forEach(sc => {
          const Tv = T(sc.T0, tLine)
          const rate = -k * (Tv - Troom)
          ctx.fillStyle = sc.color; ctx.beginPath(); ctx.arc(xS(tLine), yS(Tv), 4, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = C.text; ctx.font = '11px sans-serif'; ctx.textAlign = tLine > 50 ? 'right' : 'left'
          const ox = tLine > 50 ? -8 : 8
          ctx.fillText(`${Tv.toFixed(1)}°, rate: ${rate.toFixed(2)}°/min`, xS(tLine) + ox, yS(Tv) + (sc.T0 > Troom ? -8 : 14))
        })
      }
      draw()
      if (!roRef.current) { roRef.current = new ResizeObserver(draw); if (ref.current?.parentElement) roRef.current.observe(ref.current.parentElement) }
      return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
    }, [Troom, tLine, C])

    return <>
      <Tag label="Two glasses" color="teal" C={C} />
      <H C={C}>Cold glass vs hot coffee — who approaches room temp faster?</H>
      <P C={C}>Both objects obey the same law: dT/dt = −k·(T − T_room). But they start on opposite sides of room temperature — one is warming, one is cooling. Move the time slider to see their rates at any moment.</P>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Room temp</span>
        <input type="range" min={15} max={40} step={1} value={Troom} onChange={e => setTroom(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.amber, minWidth: 40 }}>{Troom}°C</span>
      </div>
      <canvas ref={ref} style={{ width: '100%', height: 250, display: 'block' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Time</span>
        <input type="range" min={1} max={79} step={1} value={tLine} onChange={e => setTLine(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.green, minWidth: 48 }}>{tLine} min</span>
      </div>
      <Callout color="blue" title="Same law, opposite signs" C={C}>
        For the cold glass dT/dt {'>'} 0 (temperature rising). For coffee dT/dt {'<'} 0 (temperature falling). But both rates shrink over time as the gap to room temperature closes. The derivative's magnitude tells you how urgently the object is trying to reach equilibrium.
      </Callout>
      <div style={{ background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.green, marginBottom: 6 }}>Hot coffee reaches room temp faster</div>
        <div style={{ fontSize: 13, color: C.green, lineHeight: 1.65 }}>
          Coffee starts 65°C above room temp; the cold glass starts 21°C below. The initial derivative for coffee is proportionally larger. Coffee reaches room temperature in roughly half the time of the cold glass warming up — because the gap that drives the rate is so much bigger to start.
        </div>
      </div>
    </>
  },
]

const PAGE_META = [{ label: 'The scenario' }, { label: 'The equation' }, { label: 'Two glasses' }]

export default function NewtonCooling({ params = {} }) {
  const C = useColors()
  const [page, setPage] = useState(params.currentStep ?? 0)
  useEffect(() => { if (params.currentStep !== undefined) setPage(Math.min(params.currentStep, PAGES.length - 1)) }, [params.currentStep])
  const PageComponent = PAGES[Math.min(page, PAGES.length - 1)]

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {PAGE_META.map((pg, i) => <div key={i} onClick={() => setPage(i)} style={{ flex: 1, height: 4, borderRadius: 2, cursor: 'pointer', background: i < page ? C.blue : i === page ? C.amber : C.border, transition: 'background .25s' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        {PAGE_META.map((pg, i) => <button key={i} onClick={() => setPage(i)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, cursor: 'pointer', border: `0.5px solid ${i === page ? C.amberBd : C.border}`, background: i === page ? C.amberBg : 'transparent', color: i === page ? C.amber : C.hint }}>{pg.label}</button>)}
      </div>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '1.25rem', marginBottom: 12 }}>
        <PageComponent C={C} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ fontSize: 13, padding: '7px 18px', borderRadius: 8, cursor: page === 0 ? 'default' : 'pointer', border: `0.5px solid ${C.border}`, background: 'transparent', color: C.text, opacity: page === 0 ? 0.3 : 1 }}>← Back</button>
        <span style={{ fontSize: 12, color: C.hint }}>{page + 1} / {PAGES.length}</span>
        <button disabled={page === PAGES.length - 1} onClick={() => setPage(p => p + 1)} style={{ fontSize: 13, padding: '7px 18px', borderRadius: 8, cursor: page === PAGES.length - 1 ? 'default' : 'pointer', border: 'none', background: C.text, color: C.bg, opacity: page === PAGES.length - 1 ? 0.3 : 1 }}>Next →</button>
      </div>
    </div>
  )
}
