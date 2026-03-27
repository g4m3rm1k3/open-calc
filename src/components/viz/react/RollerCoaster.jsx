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

// The track profile h(x)
const track = x => 40 * Math.sin(x * 0.18) * Math.exp(-x * 0.015) + 10 * Math.sin(x * 0.42) + 30
const trackDx = x => {
  const dx = 0.01
  return (track(x + dx) - track(x - dx)) / (2 * dx)
}
const trackD2x = x => {
  const dx = 0.1
  return (track(x + dx) - 2 * track(x) + track(x - dx)) / (dx * dx)
}

// ── Interactive coaster canvas ────────────────────────────────────────────────
function CoasterCanvas({ xCar, onMove, C, showVel, showAcc }) {
  const ref = useRef(null)
  const roRef = useRef(null)
  const xMax = 100

  useEffect(() => {
    const draw = () => {
      const cv = ref.current; if (!cv) return
      const W = cv.offsetWidth || 500, H = 240
      cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const pad = { t: 16, r: 16, b: 32, l: 16 }
      const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b

      const hMin = 0, hMax = 70
      const xS = x => pad.l + (x / xMax) * iw
      const yS = h => pad.t + ih - ((h - hMin) / (hMax - hMin)) * ih

      ctx.clearRect(0, 0, W, H)

      // sky gradient feel — flat
      ctx.fillStyle = C.surface2
      ctx.fillRect(0, 0, W, H)

      // ground
      ctx.fillStyle = C.border
      ctx.fillRect(0, pad.t + ih, W, H - pad.t - ih)

      // track fill
      ctx.beginPath()
      ctx.moveTo(xS(0), yS(0))
      for (let i = 0; i <= 300; i++) {
        const x = (i / 300) * xMax
        ctx.lineTo(xS(x), yS(track(x)))
      }
      ctx.lineTo(xS(xMax), yS(0))
      ctx.closePath()
      ctx.fillStyle = C.border
      ctx.fill()

      // track line
      ctx.strokeStyle = C.hint; ctx.lineWidth = 3; ctx.beginPath()
      for (let i = 0; i <= 300; i++) {
        const x = (i / 300) * xMax
        i === 0 ? ctx.moveTo(xS(x), yS(track(x))) : ctx.lineTo(xS(x), yS(track(x)))
      }
      ctx.stroke()

      const hCar = track(xCar)
      const slope = trackDx(xCar)
      const curv = trackD2x(xCar)
      const speed = Math.sqrt(Math.max(0, 2 * 9.8 * (track(0) + 50 - hCar))) // energy conservation

      // velocity vector
      if (showVel && speed > 0.5) {
        const angle = Math.atan(slope)
        const vlen = Math.min(speed * 1.2, 60)
        const vx = Math.cos(angle) * vlen, vy = -Math.sin(angle) * vlen
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.moveTo(xS(xCar), yS(hCar)); ctx.lineTo(xS(xCar) + vx, yS(hCar) + vy); ctx.stroke()
        // arrowhead
        const ax = xS(xCar) + vx, ay = yS(hCar) + vy
        ctx.fillStyle = C.blue; ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax - 8 * Math.cos(angle) + 4 * Math.sin(angle), ay + 8 * Math.sin(angle) + 4 * Math.cos(angle))
        ctx.lineTo(ax - 8 * Math.cos(angle) - 4 * Math.sin(angle), ay + 8 * Math.sin(angle) - 4 * Math.cos(angle))
        ctx.fill()
        ctx.fillStyle = C.blue; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(`v = ${speed.toFixed(1)} m/s`, xS(xCar) + vx + 6, yS(hCar) + vy)
      }

      // curvature / g-force vector
      if (showAcc) {
        const gForce = Math.abs(curv) * speed * speed / 9.8 + 1
        const aLen = Math.min(gForce * 12, 60)
        const aDir = curv < 0 ? -1 : 1 // concave up = push down = negative g direction feels up
        ctx.strokeStyle = C.red; ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.moveTo(xS(xCar), yS(hCar)); ctx.lineTo(xS(xCar), yS(hCar) + aLen * aDir); ctx.stroke()
        ctx.fillStyle = C.red; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(`${gForce.toFixed(2)}g`, xS(xCar) + 8, yS(hCar) + aLen * aDir + 4)
      }

      // car
      const carAngle = Math.atan(slope)
      ctx.save()
      ctx.translate(xS(xCar), yS(hCar))
      ctx.rotate(-carAngle)
      ctx.fillStyle = C.amber
      ctx.fillRect(-10, -10, 20, 10)
      ctx.fillStyle = C.surface
      ctx.fillRect(-6, -16, 12, 8)
      ctx.restore()

      // height indicator
      ctx.strokeStyle = C.purple; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(xS(xCar) + 14, yS(hCar)); ctx.lineTo(xS(xCar) + 14, yS(0)); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.purple; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(`h = ${hCar.toFixed(1)}m`, xS(xCar) + 18, (yS(hCar) + yS(0)) / 2)

      ctx.fillStyle = C.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('← drag to move the car →', W / 2, H - 4)
    }
    draw()
    if (!roRef.current) { roRef.current = new ResizeObserver(draw); if (ref.current?.parentElement) roRef.current.observe(ref.current.parentElement) }
    return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
  }, [xCar, C, showVel, showAcc])

  const handleMove = (e) => {
    const cv = ref.current; if (!cv) return
    const rect = cv.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (cv.width / rect.width)
    const x = ((mx - 16) / (cv.width - 32)) * 100
    if (x >= 0 && x <= 100) onMove(parseFloat(x.toFixed(1)))
  }
  const handleTouch = (e) => { e.preventDefault(); handleMove(e.touches[0]) }

  return <canvas ref={ref} onMouseMove={handleMove} onClick={handleMove}
    onTouchMove={handleTouch} onTouchStart={handleTouch}
    style={{ width: '100%', height: 240, display: 'block', cursor: 'ew-resize', borderRadius: 8 }} />
}

const PAGES = [
  // page 0 — position, height, potential energy
  ({ C }) => {
    const [xCar, setXCar] = useState(15)
    const hCar = track(xCar)
    const speed = Math.sqrt(Math.max(0, 2 * 9.8 * (track(0) + 50 - hCar)))
    const slope = trackDx(xCar)

    return <>
      <Tag label="Height & speed" color="blue" C={C} />
      <H C={C}>Why you go fast at the bottom — conservation of energy</H>
      <P C={C}>Drag the car along the track. As the car drops, <B>potential energy converts to kinetic energy</B>. The lower the car, the faster it goes. The velocity vector (blue arrow) is always tangent to the track — that's the first derivative of the track's height profile.</P>
      <CoasterCanvas xCar={xCar} onMove={setXCar} C={C} showVel={true} showAcc={false} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 60 }}>Position</span>
        <input type="range" min={0} max={100} step={0.5} value={xCar} onChange={e => setXCar(+e.target.value)} style={{ flex: 1 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[
          { l: 'Height h(x)', v: hCar.toFixed(1) + ' m', c: C.purple },
          { l: 'Speed v', v: speed.toFixed(2) + ' m/s', c: C.blue },
          { l: 'Slope dh/dx', v: slope.toFixed(3), c: C.amber },
        ].map((x, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint }}>{x.l}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: x.c }}>{x.v}</div>
        </div>)}
      </div>
      <AhaBox title="The velocity vector IS the first derivative" C={C}>
        The track has a shape h(x). The velocity of the car is always directed along the track — tangent to the curve. The direction of that tangent is exactly dh/dx, the first derivative. When dh/dx is steep and negative (going downhill), the car is accelerating hard.
      </AhaBox>
      <Callout color="blue" title="Energy conservation gives us speed" C={C}>
        At any height h, the speed v = √(2g·Δh) where Δh is how far you've dropped from the start. This isn't calculus — it's physics. But the rate of change of speed with respect to position IS calculus: dv/dx = −g/(v) · dh/dx. The steeper the slope, the faster speed changes.
      </Callout>
    </>
  },

  // page 1 — second derivative and g-forces
  ({ C }) => {
    const [xCar, setXCar] = useState(30)
    const hCar = track(xCar)
    const slope = trackDx(xCar)
    const curv = trackD2x(xCar)
    const speed = Math.sqrt(Math.max(0, 2 * 9.8 * (track(0) + 50 - hCar)))
    const gForce = (Math.abs(curv) * speed * speed / 9.8 + 1).toFixed(2)
    const concavity = curv < -0.05 ? 'concave down (hilltop) — lighter feeling' : curv > 0.05 ? 'concave up (valley) — heavier feeling' : 'nearly flat'

    return <>
      <Tag label="G-forces" color="red" C={C} />
      <H C={C}>The second derivative is what you feel in your stomach</H>
      <P C={C}>The first derivative dh/dx is the slope — it tells you which direction you're going. The second derivative d²h/dx² is the <B>curvature</B> — it tells you how sharply the track is bending. That curvature is what creates g-forces.</P>
      <CoasterCanvas xCar={xCar} onMove={setXCar} C={C} showVel={true} showAcc={true} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 60 }}>Position</span>
        <input type="range" min={0} max={100} step={0.5} value={xCar} onChange={e => setXCar(+e.target.value)} style={{ flex: 1 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[
          { l: 'd²h/dx² (curvature)', v: curv.toFixed(3), c: Math.abs(curv) > 0.3 ? C.red : C.muted },
          { l: 'G-force on rider', v: gForce + 'g', c: +gForce > 2 ? C.red : +gForce < 0.5 ? C.blue : C.green },
          { l: 'Speed here', v: speed.toFixed(1) + ' m/s', c: C.blue },
          { l: 'Concavity', v: concavity, c: curv < 0 ? C.blue : C.red },
        ].map((x, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint }}>{x.l}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: x.c, lineHeight: 1.4 }}>{x.v}</div>
        </div>)}
      </div>
      <Callout color="red" title="Concave down = hilltop = lighter feeling" C={C}>
        At a hilltop, d²h/dx² {'<'} 0 (concave down). The track is curving away from you. You feel lighter — the centripetal acceleration points away from the track. If you go fast enough, you lift off the seat. Airtime!
      </Callout>
      <Callout color="amber" title="Concave up = valley = heavier feeling" C={C}>
        In a valley, d²h/dx² {'>'} 0 (concave up). The track is curving toward you. You're being pushed into your seat. The faster you go, the larger the centripetal force — that's why valleys feel intense at high speed. G-force = 1 + (v²·κ)/g where κ = |d²h/dx²| is curvature.
      </Callout>
      <AhaBox title="First vs second derivative — feel the difference" C={C}>
        First derivative = slope = direction of travel. You feel this as the car tilting. Second derivative = curvature = how fast direction is changing. You feel this as g-force — the force pressing you into or lifting you from the seat. The second derivative is what roller coaster designers obsess over.
      </AhaBox>
    </>
  },

  // page 2 — position velocity acceleration layers
  ({ C }) => {
    const [t, setT] = useState(20)
    const tMax = 80
    const h0 = 60
    const pos = t => h0 - 0.5 * 9.8 * t * t + 15 * t  // projectile-ish going up then down
    const vel = t => -9.8 * t + 15
    const acc = () => -9.8
    const ref = useRef(null)
    const roRef = useRef(null)

    useEffect(() => {
      const draw = () => {
        const cv = ref.current; if (!cv) return
        const W = cv.offsetWidth || 500, H = 240
        cv.width = W; cv.height = H
        const ctx = cv.getContext('2d')
        const rows = 3
        const rh = (H - 12) / rows
        const pad = { l: 44, r: 16 }
        const iw = W - pad.l - pad.r

        const datasets = [
          { fn: t => Math.max(0, pos(t)), label: 'h(t) position (m)', color: C.blue, min: 0, max: 80 },
          { fn: vel, label: "v(t) = h'(t) velocity (m/s)", color: C.amber, min: -70, max: 20 },
          { fn: acc, label: "a(t) = h''(t) = −9.8 m/s²", color: C.red, min: -15, max: 5 },
        ]

        ctx.clearRect(0, 0, W, H)

        datasets.forEach(({ fn, label, color, min, max }, ri) => {
          const y0 = ri * rh + 6
          const xS = t => pad.l + (t / tMax) * iw
          const yS = v => y0 + rh - 8 - ((v - min) / (max - min)) * (rh - 16)

          // zero line
          ctx.strokeStyle = C.hint; ctx.lineWidth = 0.5
          ctx.beginPath(); ctx.moveTo(pad.l, yS(0)); ctx.lineTo(pad.l + iw, yS(0)); ctx.stroke()

          // curve
          ctx.strokeStyle = color; ctx.lineWidth = 2
          ctx.beginPath()
          for (let i = 0; i <= 200; i++) {
            const t2 = (i / 200) * tMax
            const v = typeof fn === 'function' ? fn(t2) : fn
            i === 0 ? ctx.moveTo(xS(t2), yS(v)) : ctx.lineTo(xS(t2), yS(v))
          }
          ctx.stroke()

          // current value dot
          const cv2 = typeof fn === 'function' ? fn(t / 10) : fn
          ctx.fillStyle = color; ctx.beginPath()
          ctx.arc(xS(t / 10), yS(cv2), 5, 0, Math.PI * 2); ctx.fill()

          // vertical time line
          ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
          ctx.beginPath(); ctx.moveTo(xS(t / 10), y0 + 6); ctx.lineTo(xS(t / 10), y0 + rh - 8); ctx.stroke()
          ctx.setLineDash([])

          // label
          ctx.fillStyle = color; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
          ctx.fillText(label, pad.l + 4, y0 + 15)

          // value
          ctx.fillStyle = C.text; ctx.font = '500 11px sans-serif'; ctx.textAlign = 'left'
          ctx.fillText((typeof cv2 === 'number' ? cv2.toFixed(1) : cv2.toFixed(1)), xS(t / 10) + 7, yS(cv2) - 5)

          // separator
          if (ri < rows - 1) {
            ctx.strokeStyle = C.border; ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(0, y0 + rh); ctx.lineTo(W, y0 + rh); ctx.stroke()
          }
        })
      }
      draw()
      if (!roRef.current) { roRef.current = new ResizeObserver(draw); if (ref.current?.parentElement) roRef.current.observe(ref.current.parentElement) }
      return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
    }, [t, C])

    const p = pos(t / 10), v = vel(t / 10)

    return <>
      <Tag label="Three layers" color="purple" C={C} />
      <H C={C}>Position → velocity → acceleration: three stories from one object</H>
      <P C={C}>A roller coaster car launches off the track into the air (let's say from a launch coaster). Three graphs — three derivatives — three completely different stories, all about the same object at the same moment.</P>
      <canvas ref={ref} style={{ width: '100%', height: 240, display: 'block' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 12px' }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 40 }}>Time</span>
        <input type="range" min={0} max={tMax} step={1} value={t} onChange={e => setT(+e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.amber, minWidth: 48 }}>{(t / 10).toFixed(1)}s</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[
          { l: 'Height h(t)', v: Math.max(0, p).toFixed(1) + ' m', c: C.blue },
          { l: 'Velocity h\'(t)', v: v.toFixed(1) + ' m/s', c: v > 0 ? C.amber : C.red },
          { l: 'Acceleration h\'\'(t)', v: '−9.8 m/s²', c: C.red },
        ].map((x, i) => <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint }}>{x.l}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: x.c }}>{x.v}</div>
        </div>)}
      </div>
      <AhaBox title="The derivative is the slope of the graph below it" C={C}>
        Where the blue (position) curve is at its peak, the orange (velocity) curve crosses zero — because the slope of position is zero at the top. Where velocity crosses zero and goes negative, position is at maximum and starts falling. The red (acceleration) is constant at −9.8 m/s² always — gravity is steady. Each graph is the derivative of the one above.
      </AhaBox>
      <Callout color="amber" title="Where velocity = 0, position is at a maximum" C={C}>
        This is calculus in action: to find the highest point of the trajectory, set h′(t) = v(t) = 0 and solve for t. That's exactly what "critical points" means — the first derivative is zero at maxima and minima.
      </Callout>
    </>
  },
]

const PAGE_META = [{ label: 'Height & speed' }, { label: 'G-forces' }, { label: 'Three layers' }]

export default function RollerCoaster({ params = {} }) {
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
