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
    purple: dark ? '#a78bfa' : '#7c3aed',
    purpleBg: dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)',
    purpleBd: dark ? '#a78bfa' : '#7c3aed',
  }
}

function Tag({ label, color, C }) {
  const map = {
    blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber],
    green: [C.greenBg, C.green], red: [C.redBg, C.red], purple: [C.purpleBg, C.purple],
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
    purple: [C.purpleBg, C.purpleBd, C.purple],
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
function ThreeCol({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>{children}</div>
}
function Stat({ label, value, color, C }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: C.hint, marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, color: color || C.text }}>{value}</div>
    </div>
  )
}

// ── Track math functions ──────────────────────────────────────────────────────
const X_MAX = 100
const trackH = x => 35 * Math.sin(x * 0.11) * Math.exp(-x * 0.012) + 12 * Math.sin(x * 0.38 + 0.5) * Math.exp(-x * 0.008) + 18
const trackSlope = x => { const d = 0.05; return (trackH(x + d) - trackH(x - d)) / (2 * d) }
const trackCurv = x => { const d = 0.3; return (trackH(x + d) - 2 * trackH(x) + trackH(x - d)) / (d * d) }
const carSpeed = x => Math.sqrt(Math.max(1, 2 * 9.8 * (trackH(0) + 30 - trackH(x))))
const gForce = x => { const v = carSpeed(x); return 1 + v * v * (-trackCurv(x)) / 9.8 }

// ── Combined track + graph canvas ─────────────────────────────────────────────
function TrackCanvas({ xCar, graphMode, C }) {
  const canvasRef = useRef(null)
  const roRef = useRef(null)
  const trackCanvasH = 175
  const graphCanvasH = 110

  useEffect(() => {
    const draw = () => {
      const cv = canvasRef.current; if (!cv) return
      const cw = cv.offsetWidth || 500
      const totalH = trackCanvasH + graphCanvasH + 6
      cv.width = cw; cv.height = totalH
      const ctx = cv.getContext('2d')
      ctx.clearRect(0, 0, cw, totalH)

      const pl = 16, pr = 16, pt = 12, pb = 20
      const innerW = cw - pl - pr
      const hMin = 0, hMax = 70
      const tx = x => pl + (x / X_MAX) * innerW
      const ty = hv => pt + trackCanvasH - pb - ((hv - hMin) / (hMax - hMin)) * (trackCanvasH - pt - pb)

      // ── track panel background ──
      ctx.fillStyle = C.surface2; ctx.fillRect(0, 0, cw, trackCanvasH)
      ctx.fillStyle = C.border; ctx.fillRect(0, trackCanvasH - pb, cw, pb)

      // color track segments by g-force
      for (let i = 0; i < 399; i++) {
        const x0 = i / 4, x1 = (i + 1) / 4
        const g = gForce(x0)
        let col
        if (g > 2.5) col = 'rgba(248,113,113,0.8)'
        else if (g > 1.5) col = 'rgba(251,191,36,0.55)'
        else if (g < 0.3) col = 'rgba(56,189,248,0.7)'
        else col = 'rgba(74,222,128,0.35)'
        ctx.strokeStyle = col; ctx.lineWidth = 5
        ctx.beginPath(); ctx.moveTo(tx(x0), ty(trackH(x0))); ctx.lineTo(tx(x1), ty(trackH(x1))); ctx.stroke()
      }

      // track outline
      ctx.strokeStyle = C.hint; ctx.lineWidth = 2; ctx.beginPath()
      for (let i = 0; i <= 400; i++) {
        const x = i / 4
        i === 0 ? ctx.moveTo(tx(x), ty(trackH(x))) : ctx.lineTo(tx(x), ty(trackH(x)))
      }
      ctx.stroke()

      // car
      const hCar = trackH(xCar)
      const slope = trackSlope(xCar)
      const pixSlope = slope * ((trackCanvasH - pt - pb) / (hMax - hMin)) / (innerW / X_MAX)
      const carAngle = Math.atan(-pixSlope)
      ctx.save()
      ctx.translate(tx(xCar), ty(hCar))
      ctx.rotate(carAngle)
      ctx.fillStyle = C.amber; ctx.fillRect(-11, -11, 22, 10)
      ctx.fillStyle = C.surface; ctx.fillRect(-7, -18, 14, 9)
      ctx.restore()

      // g-force readout
      const g = gForce(xCar)
      const gColor = g > 2.5 ? C.red : g < 0.3 ? C.blue : g > 1.5 ? C.amber : C.green
      ctx.fillStyle = gColor; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(g.toFixed(2) + 'g', tx(xCar), ty(hCar) - 16)

      // legend
      const legend = [['red', C.red, 'high g >2.5'], ['amber', C.amber, 'med g'], ['blue', C.blue, 'airtime <0.3g']]
      legend.forEach(([, col, lbl], i) => {
        ctx.fillStyle = col; ctx.fillRect(cw - 110, 8 + i * 15, 8, 8)
        ctx.fillStyle = C.muted; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(lbl, cw - 98, 16 + i * 15)
      })

      // vertical cursor across both panels
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(tx(xCar), pt); ctx.lineTo(tx(xCar), trackCanvasH + graphCanvasH + 6); ctx.stroke()
      ctx.setLineDash([])

      // ── graph panel ──
      const gy = trackCanvasH + 6
      const gph = graphCanvasH - 8
      ctx.fillStyle = C.surface2; ctx.fillRect(0, gy, cw, gph)

      const { fn, color, label, yMin, yMax, unit } = graphMode === 'slope'
        ? { fn: trackSlope, color: C.blue, label: "h′(x) slope", yMin: -1.5, yMax: 1.5, unit: '' }
        : { fn: gForce, color: C.red, label: 'g-force', yMin: -1, yMax: 4, unit: 'g' }

      const gy0 = v => gy + gph - ((v - yMin) / (yMax - yMin)) * gph

      // zero line
      ctx.strokeStyle = C.hint; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(pl, gy0(0)); ctx.lineTo(pl + innerW, gy0(0)); ctx.stroke()

      // graph curve
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath()
      for (let i = 0; i <= 400; i++) {
        const x = i / 4
        const v = Math.max(yMin - 0.5, Math.min(yMax + 0.5, fn(x)))
        i === 0 ? ctx.moveTo(tx(x), gy0(v)) : ctx.lineTo(tx(x), gy0(v))
      }
      ctx.stroke()

      // dot at current position
      const dotV = Math.max(yMin, Math.min(yMax, fn(xCar)))
      ctx.fillStyle = color; ctx.beginPath()
      ctx.arc(tx(xCar), gy0(dotV), 4, 0, Math.PI * 2); ctx.fill()

      // value label
      ctx.fillStyle = C.text; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(fn(xCar).toFixed(3) + unit, tx(xCar) + 6, gy0(dotV) - 4)

      // graph label
      ctx.fillStyle = color; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(label, pl + 4, gy + 13)

      if (graphMode === 'slope') {
        ctx.fillStyle = C.muted; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('zero crossings = peaks/valleys', pl + innerW / 2, gy + gph - 4)
      }
    }

    draw()
    if (!roRef.current) {
      roRef.current = new ResizeObserver(draw)
      if (canvasRef.current?.parentElement) roRef.current.observe(canvasRef.current.parentElement)
    }
    return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
  }, [xCar, graphMode, C])

  return <canvas ref={canvasRef} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
}

// ── PAGE COMPONENTS — named, top-level ───────────────────────────────────────

function PageSlopeGraph({ C }) {
  const [xCar, setXCar] = useState(10)
  const [playing, setPlaying] = useState(false)
  const animRef = useRef(null)

  const startPlay = () => {
    setXCar(0); setPlaying(true)
    let xPos = 0, lastTs = null
    const step = ts => {
      if (!lastTs) lastTs = ts
      const dt = (ts - lastTs) / 1000; lastTs = ts
      xPos = Math.min(X_MAX, xPos + carSpeed(xPos) * 0.18 * dt * 30)
      setXCar(parseFloat(xPos.toFixed(2)))
      if (xPos < X_MAX) animRef.current = requestAnimationFrame(step)
      else setPlaying(false)
    }
    animRef.current = requestAnimationFrame(step)
  }
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  const slope = trackSlope(xCar)
  const speed = carSpeed(xCar)
  const height = trackH(xCar)

  return (
    <>
      <Tag label="Track + slope graph" color="blue" C={C} />
      <Heading C={C}>The slope graph below the track is the first derivative h′(x)</Heading>
      <Para C={C}>
        The track shape is h(x) — height as a function of position.
        The graph below it is h′(x) — the slope at every point.{' '}
        <Strong>Where h′(x) = 0, you are at a peak or valley.</Strong>{' '}
        Watch the dot trace out the derivative as the car moves. The track and its derivative
        are two views of the same thing.
      </Para>
      <TrackCanvas xCar={xCar} graphMode="slope" C={C} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 10px' }}>
        <button onClick={startPlay} disabled={playing}
          style={{
            fontSize: 13, padding: '7px 20px', borderRadius: 8, border: 'none',
            cursor: playing ? 'default' : 'pointer', background: C.blue,
            color: '#fff', opacity: playing ? 0.6 : 1
          }}>
          {playing ? 'Running...' : '▶ Play'}
        </button>
        <input type="range" min={0} max={X_MAX} step={0.5} value={xCar}
          onChange={e => { setXCar(+e.target.value); setPlaying(false) }} style={{ flex: 1 }} />
      </div>
      <ThreeCol>
        <Stat label="Height h(x)" value={height.toFixed(1) + 'm'} color={C.purple} C={C} />
        <Stat label="Slope h′(x)" value={slope.toFixed(3)} color={C.blue} C={C} />
        <Stat label="Speed" value={speed.toFixed(1) + ' m/s'} color={C.amber} C={C} />
      </ThreeCol>
      <AhaBox title="Why the slope graph crosses zero at peaks" C={C}>
        At a hilltop the car is momentarily moving horizontally — not climbing or descending.
        The slope of the height curve is zero. That IS h′(x) = 0.
        This is what "critical point" means physically — not an abstract idea,
        just the top of a hill. Where the slope graph crosses the zero line, there is a peak or valley on the track.
      </AhaBox>
      <Callout color="amber" title="The track is colored by g-force" C={C}>
        Red = high g-force in valleys (pushed into seat). Blue = airtime at hilltops (floating).
        That coloring comes from the second derivative — see the next page.
      </Callout>
    </>
  )
}

function PageGForce({ C }) {
  const [xCar, setXCar] = useState(25)
  const [playing, setPlaying] = useState(false)
  const animRef = useRef(null)

  const startPlay = () => {
    setXCar(0); setPlaying(true)
    let xPos = 0, lastTs = null
    const step = ts => {
      if (!lastTs) lastTs = ts
      const dt = (ts - lastTs) / 1000; lastTs = ts
      xPos = Math.min(X_MAX, xPos + carSpeed(xPos) * 0.18 * dt * 30)
      setXCar(parseFloat(xPos.toFixed(2)))
      if (xPos < X_MAX) animRef.current = requestAnimationFrame(step)
      else setPlaying(false)
    }
    animRef.current = requestAnimationFrame(step)
  }
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  const g = gForce(xCar)
  const curv = trackCurv(xCar)
  const speed = carSpeed(xCar)
  const gColor = g > 2.5 ? C.red : g < 0.3 ? C.blue : g > 1.5 ? C.amber : C.green
  const feel = g > 2.5 ? 'Heavy — crushed into seat' : g < 0.3 ? 'Airtime — floating!' : g > 1.5 ? 'Noticeably heavy' : 'Normal'

  return (
    <>
      <Tag label="G-force = second derivative" color="red" C={C} />
      <Heading C={C}>What you feel in your stomach is h″(x)</Heading>
      <Para C={C}>
        The g-force at any point depends on two things: your speed and how sharply the track curves.
        The curvature of the track IS the second derivative h″(x) — how fast the slope itself is changing.
      </Para>
      <TrackCanvas xCar={xCar} graphMode="gforce" C={C} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 10px' }}>
        <button onClick={startPlay} disabled={playing}
          style={{
            fontSize: 13, padding: '7px 20px', borderRadius: 8, border: 'none',
            cursor: playing ? 'default' : 'pointer', background: C.red,
            color: '#fff', opacity: playing ? 0.6 : 1
          }}>
          {playing ? 'Running...' : '▶ Play'}
        </button>
        <input type="range" min={0} max={X_MAX} step={0.5} value={xCar}
          onChange={e => { setXCar(+e.target.value); setPlaying(false) }} style={{ flex: 1 }} />
      </div>
      <ThreeCol>
        <Stat label="Curvature h″(x)" value={curv.toFixed(4)} color={curv < 0 ? C.blue : C.red} C={C} />
        <Stat label="Speed" value={speed.toFixed(1) + ' m/s'} color={C.amber} C={C} />
        <Stat label="G-force" value={g.toFixed(2) + 'g'} color={gColor} C={C} />
      </ThreeCol>
      <div style={{
        background: C.surface2, border: `1px solid ${gColor}`, borderRadius: 12,
        padding: '1rem 1.25rem', marginBottom: 10
      }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: gColor, marginBottom: 4 }}>You feel: {feel}</div>
        <div style={{ fontSize: 13, color: C.muted }}>
          h″(x) = {curv.toFixed(4)} | {curv < 0 ? 'Concave down → hilltop → lighter' : 'Concave up → valley → heavier'}
        </div>
      </div>
      <div style={{
        background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace',
        fontSize: 13, color: C.text, lineHeight: 2, marginBottom: 10, whiteSpace: 'pre-wrap'
      }}>
        {`G-force = 1 + v² · |h″(x)| / g  (concave up, valley)
G-force = 1 − v² · |h″(x)| / g  (concave down, hilltop)

Right now: 1 + ${speed.toFixed(1)}² × ${Math.abs(curv).toFixed(4)} / 9.8 = ${g.toFixed(3)}g`}
      </div>
      <AhaBox title="h″(x) is what roller coaster designers obsess over" C={C}>
        First derivative h′(x) = slope = direction of travel. You feel this as the car tilting.
        Second derivative h″(x) = curvature = how fast direction is changing. You feel this as g-force.
        A valley with large positive h″(x) gives thrilling high-g. A hilltop with carefully tuned negative h″(x)
        gives airtime. Every section of track is a deliberate choice about what h″(x) should be.
      </AhaBox>
      <Callout color="purple" title="Why speed amplifies g-force" C={C}>
        G-force contribution = v²·|h″|/g. Speed appears squared.
        The same curved section at twice the speed gives four times the g-force contribution.
        That is why the same hill feels gentle at walking speed and intense at roller coaster speed.
        The second derivative is constant — but v² amplifies it.
      </Callout>
    </>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
const PAGES = [PageSlopeGraph, PageGForce]
const PAGE_LABELS = ['Slope graph + play', 'G-force + play']

export default function RollerCoasterDeep({ params = {} }) {
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
