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
    text: dark ? '#e2e8f0' : '#1e293b', muted: dark ? '#94a3b8' : '#64748b',
    hint: dark ? '#475569' : '#94a3b8',
    blue: dark ? '#38bdf8' : '#0284c7', blueBg: dark ? 'rgba(56,189,248,0.12)' : 'rgba(2,132,199,0.08)', blueBd: dark ? '#38bdf8' : '#0284c7',
    amber: dark ? '#fbbf24' : '#d97706', amberBg: dark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)', amberBd: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a', greenBg: dark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)', greenBd: dark ? '#4ade80' : '#16a34a',
    red: dark ? '#f87171' : '#dc2626', redBg: dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', redBd: dark ? '#f87171' : '#dc2626',
    purple: dark ? '#a78bfa' : '#7c3aed', purpleBg: dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)', purpleBd: dark ? '#a78bfa' : '#7c3aed',
  }
}

function Tag({ label, color, C }) {
  const m = { blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber], green: [C.greenBg, C.green], red: [C.redBg, C.red], purple: [C.purpleBg, C.purple] }
  const [bg, tc] = m[color] || m.blue
  return <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 9px', borderRadius: 6, background: bg, color: tc, fontWeight: 500, marginBottom: 10 }}>{label}</span>
}
function H({ children, C }) { return <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{children}</h3> }
function P({ children, C }) { return <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, marginBottom: 10 }}>{children}</p> }
function B({ children }) { return <span style={{ fontWeight: 500 }}>{children}</span> }
function Callout({ children, color, title, C }) {
  const m = { blue: [C.blueBg, C.blueBd, C.blue], amber: [C.amberBg, C.amberBd, C.amber], green: [C.greenBg, C.greenBd, C.green], red: [C.redBg, C.redBd, C.red], purple: [C.purpleBg, C.purpleBd, C.purple] }
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
function Tabs({ tabs, active, onChange, C }) {
  return <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
    {tabs.map((t, i) => <button key={i} onClick={() => onChange(i)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', border: `0.5px solid ${active === i ? C.blueBd : C.border}`, background: active === i ? C.blueBg : 'transparent', color: active === i ? C.blue : C.muted, fontWeight: active === i ? 500 : 400 }}>{t}</button>)}
  </div>
}

// ── The main graph canvas ────────────────────────────────────────────────────
function PositionGraph({ scenario, tHover, onHover, C }) {
  const ref = useRef(null)
  const roRef = useRef(null)

  useEffect(() => {
    const draw = () => {
      const cv = ref.current; if (!cv) return
      const W = cv.offsetWidth || 500, H = 260
      cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const pad = { t: 20, r: 24, b: 44, l: 52 }
      const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b

      const { fn, tMax, dMax, label, limit, color } = scenario
      const xS = t => pad.l + (t / tMax) * iw
      const yS = d => pad.t + ih - (d / dMax) * ih

      ctx.clearRect(0, 0, W, H)

      // grid
      for (let t = 0; t <= tMax; t += tMax / 5) {
        ctx.strokeStyle = C.border; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(xS(t), pad.t); ctx.lineTo(xS(t), pad.t + ih); ctx.stroke()
        ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(t.toFixed(0) + 's', xS(t), pad.t + ih + 16)
      }
      for (let d = 0; d <= dMax; d += dMax / 4) {
        ctx.strokeStyle = C.border; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(pad.l, yS(d)); ctx.lineTo(pad.l + iw, yS(d)); ctx.stroke()
        ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
        ctx.fillText(d.toFixed(0) + 'm', pad.l - 6, yS(d) + 4)
      }

      // limit zone
      const limitY = yS(limit.d1)
      const limitY2 = yS(limit.d2)
      ctx.fillStyle = 'rgba(248,113,113,0.08)'
      ctx.fillRect(pad.l, Math.min(limitY, limitY2), iw, Math.abs(limitY2 - limitY))
      ctx.strokeStyle = C.red; ctx.lineWidth = 1; ctx.setLineDash([4, 3])
      ctx.beginPath(); ctx.moveTo(pad.l, yS(limit.d1)); ctx.lineTo(pad.l + iw, yS(limit.d1)); ctx.stroke()
      ctx.setLineDash([])

      // position curve
      const pathColor = color === 'blue' ? C.blue : C.purple
      ctx.strokeStyle = pathColor; ctx.lineWidth = 2.5
      ctx.beginPath()
      for (let i = 0; i <= 200; i++) {
        const t = (i / 200) * tMax
        const d = fn(t)
        i === 0 ? ctx.moveTo(xS(t), yS(d)) : ctx.lineTo(xS(t), yS(d))
      }
      ctx.stroke()

      // label
      ctx.fillStyle = pathColor; ctx.font = '12px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(label, pad.l + 8, pad.t + 16)
      ctx.fillStyle = C.red; ctx.textAlign = 'right'
      ctx.fillText('speed limit zone', pad.l + iw - 4, yS(limit.d1) - 5)

      // hover point + tangent (instantaneous speed)
      if (tHover !== null) {
        const t0 = tHover
        const d0 = fn(t0)
        const dt = 0.01
        const speed = (fn(t0 + dt) - fn(t0 - dt)) / (2 * dt) // m/s
        const speedKmh = speed * 3.6

        // tangent line
        const tlen = tMax * 0.12
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(xS(t0 - tlen), yS(d0 - tlen * speed))
        ctx.lineTo(xS(t0 + tlen), yS(d0 + tlen * speed))
        ctx.stroke()

        ctx.fillStyle = C.amber; ctx.beginPath()
        ctx.arc(xS(t0), yS(d0), 5, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = C.text; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'left'
        const lx = xS(t0) + 10, ly = yS(d0) - 14
        ctx.fillText(`t = ${t0.toFixed(1)}s`, lx, ly)
        const scolor = speedKmh > limit.speed ? C.red : C.green
        ctx.fillStyle = scolor
        ctx.fillText(`${speedKmh.toFixed(1)} km/h`, lx, ly + 16)
        ctx.fillStyle = C.hint; ctx.font = '11px sans-serif'
        ctx.fillText('← tangent slope = speed', lx, ly + 30)
      }

      // axes labels
      ctx.fillStyle = C.muted; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('time (seconds)', pad.l + iw / 2, H - 6)
      ctx.save(); ctx.translate(14, pad.t + ih / 2); ctx.rotate(-Math.PI / 2)
      ctx.fillText('distance (m)', 0, 0); ctx.restore()
    }

    draw()
    if (!roRef.current) {
      roRef.current = new ResizeObserver(draw)
      if (ref.current) roRef.current.observe(ref.current.parentElement)
    }
    return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
  }, [scenario, tHover, C])

  const handleMove = (e) => {
    const cv = ref.current; if (!cv) return
    const rect = cv.getBoundingClientRect()
    const pad = { l: 52, r: 24 }
    const iw = cv.width - pad.l - pad.r
    const mx = (e.clientX - rect.left) * (cv.width / rect.width)
    const t = ((mx - pad.l) / iw) * scenario.tMax
    if (t >= 0 && t <= scenario.tMax) onHover(parseFloat(t.toFixed(2)))
  }

  return <canvas ref={ref} onMouseMove={handleMove} onMouseLeave={() => onHover(null)}
    style={{ width: '100%', height: 260, display: 'block', cursor: 'crosshair' }} />
}

// ── Scenarios ────────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: '40in30',
    label: 'Scenario A: 40 in a 30 zone',
    desc: 'You travel 400m in 36 seconds. The limit is 30 km/h.',
    fn: t => 11.1 * t + 0.5 * 0.05 * t * t,  // roughly 40 km/h average
    tMax: 36, dMax: 450,
    limit: { speed: 30, d1: 270, d2: 450 },
    color: 'blue',
    limitSpeed: 30,
    yourAvg: 40,
    over: 10,
    context: 'A quiet residential street. The limit is 30 km/h (8.3 m/s). You average 40 km/h over 400m.',
  },
  {
    id: '60in50',
    label: 'Scenario B: 60 in a 50 zone',
    desc: 'You travel 1000m in 60 seconds. The limit is 50 km/h.',
    fn: t => 16.7 * t + 0.3 * 0.04 * t * t,
    tMax: 60, dMax: 1100,
    limit: { speed: 50, d1: 750, d2: 1100 },
    color: 'blue',
    limitSpeed: 50,
    yourAvg: 60,
    over: 10,
    context: 'A main road. Limit is 50 km/h (13.9 m/s). You average 60 km/h over 1km.',
  },
]

const PAGES = [
  // page 0 — the hook
  ({ C }) => {
    const [scenario, setScenario] = useState(0)
    const [tHover, setTHover] = useState(null)
    const sc = SCENARIOS[scenario]
    const dt = 0.01
    const speed = tHover !== null ? ((sc.fn(tHover + dt) - sc.fn(tHover - dt)) / (2 * dt)) * 3.6 : null

    return <>
      <Tag label="The question" color="blue" C={C} />
      <H C={C}>Which is worse: 40 in a 30, or 60 in a 50?</H>
      <P C={C}>Both are <B>10 km/h over the limit</B>. On paper they look the same. But they feel completely different — and the derivative explains exactly why.</P>
      <P C={C}>Move your cursor over the distance-time graph below. The slope of the curve at any moment is your <B>instantaneous speed</B>. That's exactly what a derivative measures — the rate of change of distance with respect to time.</P>
      <Tabs tabs={SCENARIOS.map(s => s.label)} active={scenario} onChange={setScenario} C={C} />
      <P C={C} style={{ fontSize: 12 }}>{sc.context}</P>
      <PositionGraph scenario={sc} tHover={tHover} onHover={setTHover} C={C} />
      {tHover !== null && speed !== null && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
          {[
            { l: 'Your speed', v: speed.toFixed(1) + ' km/h', c: speed > sc.limitSpeed ? C.red : C.green },
            { l: 'Speed limit', v: sc.limitSpeed + ' km/h', c: C.muted },
            { l: 'Over by', v: Math.max(0, speed - sc.limitSpeed).toFixed(1) + ' km/h', c: speed > sc.limitSpeed ? C.red : C.green },
          ].map((x, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: C.hint }}>{x.l}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: x.c, fontWeight: 500 }}>{x.v}</div>
          </div>)}
        </div>
      )}
      <AhaBox title="The derivative IS the speedometer" C={C}>
        If s(t) is your position at time t, then ds/dt is your speed at that exact instant. The speedometer in your car is literally a derivative machine — it measures how fast your position is changing right now, not on average.
      </AhaBox>
    </>
  },

  // page 1 — average vs instantaneous
  ({ C }) => {
    const [t1, setT1] = useState(5)
    const [t2, setT2] = useState(25)
    const fn = t => 11.1 * t + 0.025 * t * t
    const ref = useRef(null)
    const roRef = useRef(null)

    useEffect(() => {
      const draw = () => {
        const cv = ref.current; if (!cv) return
        const W = cv.offsetWidth || 500, H = 220
        cv.width = W; cv.height = H
        const ctx = cv.getContext('2d')
        const pad = { t: 16, r: 20, b: 36, l: 52 }
        const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b
        const tMax = 36, dMax = 450
        const xS = t => pad.l + (t / tMax) * iw
        const yS = d => pad.t + ih - (d / dMax) * ih

        ctx.clearRect(0, 0, W, H)
        for (let t = 0; t <= tMax; t += 6) {
          ctx.strokeStyle = C.border; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(xS(t), pad.t); ctx.lineTo(xS(t), pad.t + ih); ctx.stroke()
          ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
          ctx.fillText(t + 's', xS(t), pad.t + ih + 14)
        }
        for (let d = 0; d <= dMax; d += 100) {
          ctx.strokeStyle = C.border; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(pad.l, yS(d)); ctx.lineTo(pad.l + iw, yS(d)); ctx.stroke()
          ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
          ctx.fillText(d + 'm', pad.l - 4, yS(d) + 4)
        }

        // curve
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; ctx.beginPath()
        for (let i = 0; i <= 200; i++) { const t = (i / 200) * tMax; i === 0 ? ctx.moveTo(xS(t), yS(fn(t))) : ctx.lineTo(xS(t), yS(fn(t))) }
        ctx.stroke()

        // secant (average rate)
        const d1 = fn(t1), d2 = fn(t2)
        const avgSpeed = ((d2 - d1) / (t2 - t1)) * 3.6
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2
        const ext = 4
        ctx.beginPath()
        ctx.moveTo(xS(t1 - ext), yS(d1 - (t1 - ext) * (d2 - d1) / (t2 - t1) + d1 - fn(t1)))
        // simpler: just draw the secant between the two points extended a bit
        const slope = (d2 - d1) / (t2 - t1)
        ctx.moveTo(xS(t1 - ext), yS(d1 - ext * slope))
        ctx.lineTo(xS(t2 + ext), yS(d2 + ext * slope))
        ctx.stroke()

        // points
        ;[[t1, d1], [t2, d2]].forEach(([t, d], idx) => {
          ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(xS(t), yS(d), 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = C.text; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
          ctx.fillText(`(${t.toFixed(0)}s, ${d.toFixed(0)}m)`, xS(t) + 8, yS(d) - 6)
        })

        // tangent at midpoint
        const tm = (t1 + t2) / 2
        const dm = fn(tm)
        const instSlope = (fn(tm + 0.01) - fn(tm - 0.01)) / 0.02
        const tlen = 4
        ctx.strokeStyle = C.green; ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(xS(tm - tlen), yS(dm - tlen * instSlope))
        ctx.lineTo(xS(tm + tlen), yS(dm + tlen * instSlope))
        ctx.stroke()
        ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(xS(tm), yS(dm), 4, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = C.green; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
        ctx.fillText(`inst. ${(instSlope * 3.6).toFixed(1)} km/h`, xS(tm) - 8, yS(dm) - 8)

        ctx.fillStyle = C.amber; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(`avg ${avgSpeed.toFixed(1)} km/h`, xS((t1 + t2) / 2), yS((d1 + d2) / 2) - 14)
      }
      draw()
      if (!roRef.current) { roRef.current = new ResizeObserver(draw); if (ref.current?.parentElement) roRef.current.observe(ref.current.parentElement) }
      return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
    }, [t1, t2, C])

    return <>
      <Tag label="Average vs instantaneous" color="amber" C={C} />
      <H C={C}>The two kinds of speed — and why one is a derivative</H>
      <P C={C}><B>Average speed</B> is what you get from a radar speed camera that tracks you over a distance: total distance ÷ total time. It's the slope of the line connecting two points on the graph — a <B>secant line</B>.</P>
      <P C={C}><B>Instantaneous speed</B> is what your speedometer shows right now. It's the slope of the curve at a single point — a <B>tangent line</B>. That's the derivative.</P>
      <canvas ref={ref} style={{ width: '100%', height: 220, display: 'block' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 48 }}>From t =</span>
        <input type="range" min={1} max={16} step={0.5} value={t1} onChange={e => setT1(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.amber, minWidth: 30 }}>{t1}s</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 48 }}>To t =</span>
        <input type="range" min={20} max={35} step={0.5} value={t2} onChange={e => setT2(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.amber, minWidth: 30 }}>{t2}s</span>
      </div>
      <Callout color="amber" title="The limit definition of the derivative" C={C}>
        As you slide the two points closer together (Δt → 0), the secant slope becomes the tangent slope. That limiting process — (Δd/Δt) as Δt→0 — is exactly the definition of the derivative. The derivative IS instantaneous speed.
      </Callout>
      <Callout color="green" title="So which is worse?" C={C}>
        40 in a 30 is 33% over the limit. 60 in a 50 is 20% over. But stopping distance scales with speed squared — at 60 km/h you need 4× the stopping distance as at 30 km/h. The derivative of stopping distance with respect to speed is d = v²/2a, so d′ = v/a — the faster you go, the faster stopping distance grows. 60 in a 50 is objectively more dangerous even though you're the same 10 km/h over.
      </Callout>
    </>
  },

  // page 2 — what the derivative tells you
  ({ C }) => {
    const [speed, setSpeed] = useState(50)
    const stopDist = v => (v / 3.6) ** 2 / (2 * 7) // v in km/h, a=7m/s²
    const deriv = v => v / (3.6 * 3.6 * 7) // ds/dv in m per km/h

    return <>
      <Tag label="The derivative as a rate" color="purple" C={C} />
      <H C={C}>Stopping distance and why speed² matters</H>
      <P C={C}>Stopping distance from speed v (with braking deceleration a) is:</P>
      <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13, color: C.text, lineHeight: 2, marginBottom: 10 }}>
        d(v) = v² / (2a){'\n'}
        d′(v) = v / a &nbsp;&nbsp; ← how fast stopping distance grows as speed increases
      </div>
      <P C={C}>The derivative d′(v) = v/a tells you: at speed v, each extra 1 km/h of speed adds v/a extra metres of stopping distance. At higher speeds, the cost of going faster is higher — the derivative is larger.</P>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 64 }}>Speed</span>
        <input type="range" min={10} max={120} step={1} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.amber, minWidth: 64 }}>{speed} km/h</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { l: 'Stopping distance', v: stopDist(speed).toFixed(1) + ' m', c: C.blue },
          { l: 'Each extra km/h costs', v: deriv(speed).toFixed(2) + ' m more', c: C.amber },
          { l: 'At 30 km/h limit, stopping distance', v: stopDist(30).toFixed(1) + ' m', c: C.green },
          { l: 'At 50 km/h limit, stopping distance', v: stopDist(50).toFixed(1) + ' m', c: C.purple },
        ].map((x, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint }}>{x.l}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: x.c }}>{x.v}</div>
        </div>)}
      </div>

      <AhaBox title="The answer: which is worse?" C={C}>
        At 40 km/h, d′ = 40/7 ≈ 5.7 m per km/h. At 60 km/h, d′ = 60/7 ≈ 8.6 m per km/h. The derivative is 50% larger. Each extra km/h you add at 60 km/h costs 50% more stopping distance than at 40 km/h. 60 in a 50 is the more dangerous situation — the derivative tells you so directly.
      </AhaBox>
      <Callout color="blue" title="This is why calculus matters" C={C}>
        The function d(v) = v²/2a tells you the stopping distance. But d′(v) = v/a tells you the risk rate — how much worse things get as you go faster. The derivative is the thing that tells you about rates of change, which is almost always the thing you actually care about.
      </Callout>
    </>
  },
]

const PAGE_META = [
  { label: 'The question' },
  { label: 'Avg vs instant' },
  { label: 'The derivative' },
]

export default function SpeedingTicket({ params = {} }) {
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
