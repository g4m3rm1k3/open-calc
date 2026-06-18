import { useState, useEffect, useRef } from 'react'

function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
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

function Tag({ label, color, C }) {
  const map = {
    blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber],
    green: [C.greenBg, C.green], red: [C.redBg, C.red], teal: [C.tealBg, C.teal],
  }
  const [bg, tc] = map[color] || map.blue
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, padding: '2px 9px', borderRadius: 6,
      background: bg, color: tc, fontWeight: 500, marginBottom: 10
    }}>
      {label}
    </span>
  )
}
function Heading({ children, C }) {
  return <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{children}</h3>
}
function Para({ children, C }) {
  return <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, marginBottom: 10 }}>{children}</p>
}
function Strong({ children }) { return <span style={{ fontWeight: 500 }}>{children}</span> }
function Callout({ children, color, title, C }) {
  const map = {
    blue: [C.blueBg, C.blueBd, C.blue], amber: [C.amberBg, C.amberBd, C.amber],
    green: [C.greenBg, C.greenBd, C.green], red: [C.redBg, C.redBd, C.red],
    teal: [C.tealBg, C.tealBd, C.teal],
  }
  const [bg, bd, tc] = map[color] || map.amber
  return (
    <div style={{
      borderLeft: `2px solid ${bd}`, background: bg,
      borderRadius: '0 6px 6px 0', padding: '8px 12px', marginBottom: 10
    }}>
      {title && <div style={{ fontSize: 12, fontWeight: 500, color: tc, marginBottom: 4 }}>{title}</div>}
      <p style={{ fontSize: 13, color: tc, lineHeight: 1.6, margin: 0 }}>{children}</p>
    </div>
  )
}
function AhaBox({ title, children, C }) {
  return (
    <div style={{
      background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 12,
      padding: '1rem 1.25rem', marginBottom: 10
    }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.green, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.green, lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}
function TwoCol({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>{children}</div>
}
function Stat({ label, value, color, C }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: C.hint, marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, color: color || C.text }}>{value}</div>
    </div>
  )
}
function CodeBox({ children, C }) {
  return (
    <div style={{
      background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace',
      fontSize: 13, color: C.text, lineHeight: 2, marginBottom: 10, whiteSpace: 'pre-wrap'
    }}>
      {children}
    </div>
  )
}

// ── Halving bars ──────────────────────────────────────────────────────────────
function HalvingBars({ k, C }) {
  const halfTime = Math.log(2) / k
  const bars = Array.from({ length: 8 }, (_, i) => ({
    t: (i * halfTime).toFixed(1),
    gap: (Math.exp(-k * i * halfTime) * 100).toFixed(1),
  }))
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: C.hint, marginBottom: 6 }}>
        Each row = one half-life ({halfTime.toFixed(1)} min). Gap always halves — but never hits zero.
      </div>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.hint, minWidth: 52 }}>{b.t} min</span>
          <div style={{ flex: 1, background: C.surface2, borderRadius: 4, height: 16, overflow: 'hidden' }}>
            <div style={{
              width: `${b.gap}%`, height: '100%', borderRadius: 4, transition: 'width .3s',
              background: i === 0 ? C.blue : i === 1 ? C.teal : C.green
            }} />
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.text, minWidth: 52 }}>{b.gap}% left</span>
          {i > 0 && <span style={{ fontSize: 10, color: C.amber, minWidth: 24 }}>÷2</span>}
        </div>
      ))}
      <div style={{
        marginTop: 8, padding: '8px 12px', background: C.amberBg,
        borderRadius: 8, border: `0.5px solid ${C.amberBd}`
      }}>
        <span style={{ fontSize: 12, color: C.amber }}>
          After 8 half-lives ({(8 * halfTime).toFixed(0)} min), {bars[7].gap}% of the gap remains.
          You can always halve — you always have half left. That is why it never reaches zero.
        </span>
      </div>
    </div>
  )
}

// ── Two-curve canvas (hot coffee vs cold glass) ───────────────────────────────
function TwoCurveCanvas({ troomVal, C }) {
  const canvasRef = useRef(null)
  const roRef = useRef(null)
  const kVal = 0.05
  const tcold = 4, thot = 95
  const temp = (t0, t) => troomVal + (t0 - troomVal) * Math.exp(-kVal * t)

  useEffect(() => {
    const draw = () => {
      const cv = canvasRef.current; if (!cv) return
      const cw = cv.offsetWidth || 500, ch = 260
      cv.width = cw; cv.height = ch
      const ctx = cv.getContext('2d')
      const pl = 52, pr = 20, pt = 16, pb = 44
      const iw = cw - pl - pr, ih = ch - pt - pb
      const tMax = 80
      const tx = t => pl + (t / tMax) * iw
      const ty = tv => pt + ih - ((tv - 0) / 100) * ih

      ctx.clearRect(0, 0, cw, ch)

      for (let t = 0; t <= tMax; t += 20) {
        ctx.strokeStyle = C.border; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(tx(t), pt); ctx.lineTo(tx(t), pt + ih); ctx.stroke()
        ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(t + ' min', tx(t), pt + ih + 16)
      }
      for (let tv = 0; tv <= 100; tv += 20) {
        ctx.strokeStyle = C.border; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(pl, ty(tv)); ctx.lineTo(pl + iw, ty(tv)); ctx.stroke()
        ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
        ctx.fillText(tv + '°', pl - 4, ty(tv) + 4)
      }

      // room temp
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4])
      ctx.beginPath(); ctx.moveTo(pl, ty(troomVal)); ctx.lineTo(pl + iw, ty(troomVal)); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.amber; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('room: ' + troomVal + '°C', pl + 4, ty(troomVal) - 5)

      // curves
      const curves = [
        { t0: thot, color: C.red, label: 'Coffee 95°C' },
        { t0: tcold, color: C.blue, label: 'Cold glass 4°C' },
      ]
      curves.forEach(({ t0, color, label }) => {
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath()
        for (let i = 0; i <= 300; i++) {
          const t = (i / 300) * tMax
          i === 0 ? ctx.moveTo(tx(t), ty(temp(t0, t))) : ctx.lineTo(tx(t), ty(temp(t0, t)))
        }
        ctx.stroke()
        ctx.fillStyle = color; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(label, pl + 6, ty(t0) + (t0 > troomVal ? 14 : -5))
      })

      // rate arrows at t=0
      curves.forEach(({ t0, color }) => {
        const rate = -kVal * (t0 - troomVal)
        const arrowPx = Math.abs(rate) * 2
        const startY = ty(t0)
        const dir = rate > 0 ? -1 : 1
        ctx.strokeStyle = color; ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(tx(2), startY); ctx.lineTo(tx(2), startY + dir * arrowPx); ctx.stroke()
        ctx.fillStyle = color; ctx.beginPath()
        ctx.moveTo(tx(2), startY + dir * arrowPx)
        ctx.lineTo(tx(2) - 5, startY + dir * arrowPx - dir * 8)
        ctx.lineTo(tx(2) + 5, startY + dir * arrowPx - dir * 8)
        ctx.fill()
        ctx.fillStyle = color; ctx.font = '500 10px sans-serif'; ctx.textAlign = 'right'
        ctx.fillText(Math.abs(rate).toFixed(2) + '°/min', tx(2) - 8, startY + dir * arrowPx / 2)
      })

      // gap annotations
      ctx.strokeStyle = C.hint; ctx.lineWidth = 1; ctx.setLineDash([2, 2])
      ctx.beginPath(); ctx.moveTo(tx(6), ty(troomVal)); ctx.lineTo(tx(6), ty(thot)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(tx(10), ty(troomVal)); ctx.lineTo(tx(10), ty(tcold)); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.hint; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('gap: ' + (thot - troomVal) + '°', tx(6) + 4, (ty(troomVal) + ty(thot)) / 2)
      ctx.fillText('gap: ' + (troomVal - tcold) + '°', tx(10) + 4, (ty(troomVal) + ty(tcold)) / 2)

      ctx.fillStyle = C.muted; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('time (minutes)', pl + iw / 2, ch - 5)
    }
    draw()
    if (!roRef.current) {
      roRef.current = new ResizeObserver(draw)
      if (canvasRef.current?.parentElement) roRef.current.observe(canvasRef.current.parentElement)
    }
    return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
  }, [troomVal, C])

  return <canvas ref={canvasRef} style={{ width: '100%', height: 260, display: 'block' }} />
}

// ── PAGE COMPONENTS — named, top-level ───────────────────────────────────────

function PageNeverReaches({ C }) {
  const [kVal, setKVal] = useState(0.08)
  const halfTime = (Math.log(2) / kVal).toFixed(1)
  return (
    <>
      <Tag label="Why never reaches?" color="teal" C={C} />
      <Heading C={C}>Why the glass never quite reaches room temperature</Heading>
      <Para C={C}>
        Newton's law says: <Strong>the rate of cooling is proportional to the current gap.</Strong>
      </Para>
      <CodeBox C={C}>
        {`dT/dt = −k · (T − T_room)\nrate of change = −k × current gap`}
      </CodeBox>
      <Para C={C}>
        When the gap is 20°, the rate is k×20. When the gap is 10°, the rate is k×10 — half as fast.
        When the gap is 1°, almost nothing. <Strong>The smaller the gap, the slower the closing.</Strong>{' '}
        The gap drives its own rate of closing, and as it shrinks, so does the closing rate.
      </Para>
      <Para C={C}>
        The table below shows what happens at each half-life. Every {halfTime} minutes,
        half the remaining gap closes. But half of something is never zero.
      </Para>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Speed k</span>
        <input type="range" min={0.03} max={0.2} step={0.01} value={kVal}
          onChange={e => setKVal(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.teal, minWidth: 40 }}>{kVal.toFixed(2)}</span>
      </div>
      <HalvingBars k={kVal} C={C} />
      <AhaBox title="The mathematical proof it never reaches" C={C}>
        The solution is T(t) = T_room + (T₀ − T_room)·e^(−kt).
        For T(t) to equal T_room we need e^(−kt) = 0.
        But e^(−kt) = 1/e^(kt), and e^(kt) grows forever — it never becomes infinite at any finite time t.
        So e^(−kt) never reaches zero. The gap gets arbitrarily small but never exactly zero.
      </AhaBox>
      <Callout color="blue" title="Same logic as Zeno's paradox" C={C}>
        To walk to a wall you first cover half the distance, then half the remainder, then half again.
        Each step is shorter than the last. You get arbitrarily close but never arrive.
        Newton's cooling is the same idea with temperature gaps instead of distances.
        The exponential is the mathematical object that captures "always halving, never reaching."
      </Callout>
    </>
  )
}

function PageHotVsCold({ C }) {
  const [troomVal, setTroomVal] = useState(25)
  const kVal = 0.05
  const tcold = 4, thot = 95
  const gapHot = thot - troomVal
  const gapCold = troomVal - tcold
  const rateHot = (kVal * gapHot).toFixed(2)
  const rateCold = (kVal * gapCold).toFixed(2)
  const timeHot = (Math.log(gapHot / 1) / kVal).toFixed(0)
  const timeCold = (Math.log(Math.max(gapCold, 1) / 1) / kVal).toFixed(0)
  return (
    <>
      <Tag label="Hot vs cold" color="red" C={C} />
      <Heading C={C}>Why hot coffee reaches room temperature faster than a cold glass warms up</Heading>
      <Para C={C}>
        Same room. Same k. Same law. But the coffee starts {gapHot}°C above room temperature,
        while the cold glass is only {gapCold}°C below it.{' '}
        <Strong>The initial gap is {(gapHot / Math.max(gapCold, 0.1)).toFixed(1)}× larger for coffee.</Strong>
      </Para>
      <Para C={C}>
        Since dT/dt = −k × gap, coffee's initial rate of change is also {(gapHot / Math.max(gapCold, 0.1)).toFixed(1)}×
        larger. The gap is the engine — bigger gap, bigger engine, faster journey to equilibrium.
      </Para>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Room temp</span>
        <input type="range" min={15} max={40} step={1} value={troomVal}
          onChange={e => setTroomVal(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.amber, minWidth: 40 }}>{troomVal}°C</span>
      </div>
      <TwoCurveCanvas troomVal={troomVal} C={C} />
      <TwoCol>
        <Stat label="Coffee gap at t=0" value={gapHot + '°C'} color={C.red} C={C} />
        <Stat label="Cold glass gap at t=0" value={gapCold + '°C'} color={C.blue} C={C} />
        <Stat label="Coffee initial rate" value={rateHot + ' °C/min'} color={C.red} C={C} />
        <Stat label="Cold glass initial rate" value={rateCold + ' °C/min'} color={C.blue} C={C} />
        <Stat label="Coffee reaches room in" value={'~' + timeHot + ' min'} color={C.red} C={C} />
        <Stat label="Cold glass reaches room in" value={'~' + timeCold + ' min'} color={C.blue} C={C} />
      </TwoCol>
      <AhaBox title="The proof — same equation, different starting gap" C={C}>
        Time to get within 1°C of room temp: t = ln(gap₀) / k.
        Coffee: ln({gapHot}) / {kVal} ≈ {timeHot} min.
        Cold glass: ln({gapCold}) / {kVal} ≈ {timeCold} min.
        Same k, same law. The only difference is ln({gapHot}) {'>'} ln({gapCold}).
        Bigger initial gap → more time needed → but faster rate throughout the whole journey.
      </AhaBox>
      <Callout color="teal" title="How to explain this to someone" C={C}>
        Ask: "Is coffee further from room temperature than a cold glass?" Yes — {gapHot}° vs {gapCold}°.
        "Does the law say rate ∝ gap?" Yes. "So is coffee's initial rate faster?" Yes — {(gapHot / Math.max(gapCold, 0.1)).toFixed(1)}× faster.
        "So which reaches equilibrium first?" Coffee. The logic follows from the equation alone.
      </Callout>
    </>
  )
}

function PageDerivation({ C }) {
  const [step, setStep] = useState(0)
  const steps = [
    {
      title: 'The law',
      eq: 'dT/dt = −k·(T − T_room)',
      why: 'This says: the rate of temperature change is proportional to how far T is from room temperature. The minus sign means it always moves toward room temperature — if T > T_room then dT/dt is negative (cooling). If T < T_room then dT/dt is positive (warming).',
    },
    {
      title: 'Separate variables',
      eq: 'dT / (T − T_room) = −k · dt',
      why: 'Move everything with T to the left, everything with t to the right. We are going to integrate both sides. Left has T, right has t — separated.',
    },
    {
      title: 'Integrate both sides',
      eq: '∫ dT/(T − T_room) = ∫ −k dt\nln|T − T_room| = −kt + C',
      why: 'The left integral is ln|T − T_room| (standard: ∫du/u = ln|u|). Right side is −kt plus a constant of integration C.',
    },
    {
      title: 'Exponentiate both sides',
      eq: '|T − T_room| = e^(−kt + C) = e^C · e^(−kt)\nT − T_room = A · e^(−kt)',
      why: 'Take e to the power of both sides to undo the ln. e^C is just another constant — call it A. A can be positive or negative depending on whether T₀ is above or below T_room.',
    },
    {
      title: 'Apply initial condition',
      eq: 'At t = 0:  T = T₀\nT₀ − T_room = A · e^0 = A\nSo  A = T₀ − T_room',
      why: 'The initial condition pins down A. At the starting moment T = T₀, so the gap equals A.',
    },
    {
      title: 'Final solution',
      eq: 'T(t) = T_room + (T₀ − T_room) · e^(−kt)',
      why: 'This is the temperature at any time t. As t → ∞, e^(−kt) → 0, so T(t) → T_room. But e^(−kt) never equals 0 at a finite time — which is why the object never exactly reaches room temperature.',
    },
  ]
  const s = steps[step]
  return (
    <>
      <Tag label="The derivation" color="amber" C={C} />
      <Heading C={C}>Solving the differential equation — where the formula comes from</Heading>
      <Para C={C}>
        Here is where T(t) = T_room + (T₀ − T_room)·e^(−kt) comes from.
        Each step follows from the previous using basic calculus.
      </Para>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => setStep(i)}
            style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
              border: `0.5px solid ${step === i ? C.amberBd : C.border}`,
              background: step === i ? C.amberBg : 'transparent',
              color: step === i ? C.amber : C.hint
            }}>
            {i + 1}. {st.title}
          </button>
        ))}
      </div>
      <CodeBox C={C}>{s.eq}</CodeBox>
      <Callout color="amber" C={C}>{s.why}</Callout>
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
          style={{
            flex: 1, padding: 7, borderRadius: 8, cursor: step === 0 ? 'default' : 'pointer',
            border: `0.5px solid ${C.border}`, background: 'transparent',
            color: C.text, opacity: step === 0 ? 0.3 : 1, fontSize: 13
          }}>← Previous</button>
        <button disabled={step === steps.length - 1} onClick={() => setStep(s => s + 1)}
          style={{
            flex: 1, padding: 7, borderRadius: 8, cursor: step === steps.length - 1 ? 'default' : 'pointer',
            border: 'none', background: C.text, color: C.bg,
            opacity: step === steps.length - 1 ? 0.3 : 1, fontSize: 13
          }}>Next step →</button>
      </div>
      <div style={{
        marginTop: 12, padding: '10px 12px', background: C.greenBg,
        borderRadius: 8, border: `0.5px solid ${C.greenBd}`
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.green, marginBottom: 4 }}>Key insight from the derivation</div>
        <div style={{ fontSize: 12, color: C.green, lineHeight: 1.65 }}>
          The e^(−kt) is not assumed — it falls out of integrating 1/(T−T_room), which produces a logarithm,
          and exponentiating to solve gives e^(−kt). Any system whose rate of change is proportional
          to its current value will produce exponential behavior. That is Newton's cooling, radioactive decay,
          population growth, and compound interest — all the same equation.
        </div>
      </div>
    </>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
const PAGES = [PageNeverReaches, PageHotVsCold, PageDerivation]
const PAGE_LABELS = ['Never reaches', 'Hot vs cold', 'Full derivation']

export default function NewtonCoolingDeep({ params = {} }) {
  const C = useColors()
  const [page, setPage] = useState(params.currentStep ?? 0)
  useEffect(() => {
    if (params.currentStep !== undefined)
      setPage(Math.min(params.currentStep, PAGES.length - 1))
  }, [params.currentStep])
  const PageComponent = PAGES[Math.min(page, PAGES.length - 1)]
  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {PAGE_LABELS.map((_, i) => (
          <div key={i} onClick={() => setPage(i)} style={{
            flex: 1, height: 4, borderRadius: 2,
            cursor: 'pointer', transition: 'background .25s',
            background: i < page ? C.blue : i === page ? C.amber : C.border
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        {PAGE_LABELS.map((label, i) => (
          <button key={i} onClick={() => setPage(i)}
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 6, cursor: 'pointer',
              border: `0.5px solid ${i === page ? C.amberBd : C.border}`,
              background: i === page ? C.amberBg : 'transparent',
              color: i === page ? C.amber : C.hint
            }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{
        background: C.surface, border: `0.5px solid ${C.border}`,
        borderRadius: 12, padding: '1.25rem', marginBottom: 12
      }}>
        <PageComponent C={C} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          style={{
            fontSize: 13, padding: '7px 18px', borderRadius: 8,
            cursor: page === 0 ? 'default' : 'pointer',
            border: `0.5px solid ${C.border}`, background: 'transparent',
            color: C.text, opacity: page === 0 ? 0.3 : 1
          }}>← Back</button>
        <span style={{ fontSize: 12, color: C.hint }}>{page + 1} / {PAGES.length}</span>
        <button disabled={page === PAGES.length - 1} onClick={() => setPage(p => p + 1)}
          style={{
            fontSize: 13, padding: '7px 18px', borderRadius: 8,
            cursor: page === PAGES.length - 1 ? 'default' : 'pointer',
            border: 'none', background: C.text, color: C.bg,
            opacity: page === PAGES.length - 1 ? 0.3 : 1
          }}>Next →</button>
      </div>
    </div>
  )
}
