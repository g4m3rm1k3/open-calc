import { useEffect, useRef } from 'react'

// Seeded pseudo-random so positions are stable across renders
function sr(n) { return ((Math.sin(n + 1) * 9301 + 49297) % 233280) / 233280 }

const CHARS = ['∂', '∑', '∫', '∇', 'π', 'λ', 'Δ', '⊗', '∞', 'φ', '∈', '≈', 'α', 'β', 'γ', 'σ', 'ω', '√', '⊕', 'θ', 'ε', '∀', 'μ', 'ζ', '∃', 'ρ']

const ITEMS = Array.from({ length: 44 }, (_, i) => {
  const layer = i % 3 // 0 = far, 1 = mid, 2 = near
  return {
    id: i,
    char: CHARS[i % CHARS.length],
    x: sr(i * 11 + 0) * 92 + 4,
    y: sr(i * 11 + 1) * 88 + 6,
    layer,
    size: [11, 16, 25][layer] + sr(i * 11 + 2) * [5, 7, 10][layer],
    dx: (sr(i * 11 + 3) - 0.5) * 40,
    dy: (sr(i * 11 + 4) - 0.5) * 30,
    period: 16 + sr(i * 11 + 5) * 22,
    phaseDelay: sr(i * 11 + 6) * 20,
  }
})

const PARALLAX = [9, 24, 50]  // px of parallax per layer
const OPACITY  = [0.06, 0.115, 0.22]
const BLUR     = [2.0, 0.7, 0]
const ANIMS    = ['oc-float-a', 'oc-float-b', 'oc-float-c']

const CSS = `
@keyframes oc-float-a {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  50%     { transform: translate(var(--dx),var(--dy)) rotate(7deg); }
}
@keyframes oc-float-b {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  33%     { transform: translate(var(--dx),calc(var(--dy)*.4)) rotate(-5deg); }
  66%     { transform: translate(calc(var(--dx)*.3),var(--dy)) rotate(9deg); }
}
@keyframes oc-float-c {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  40%     { transform: translate(calc(var(--dx)*.7),var(--dy)) rotate(-4deg); }
  70%     { transform: translate(var(--dx),calc(var(--dy)*.2)) rotate(6deg); }
}
`

export default function UpSkillOSBackground({ dark }) {
  const ref = useRef(null)

  // All parallax runs in RAF with direct DOM writes — zero React re-renders
  useEffect(() => {
    const root = ref.current
    if (!root) return

    let tx = 0, ty = 0, cx = 0, cy = 0, rafId = null

    const onMove = e => {
      tx = e.clientX / window.innerWidth  - 0.5
      ty = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const syms     = root.querySelectorAll('[data-layer]')
    const orbs     = root.querySelectorAll('[data-orb]')
    const gridWrap = root.querySelector('[data-grid-wrap]')
    const gridPane = root.querySelector('[data-grid-pane]')

    const tick = () => {
      cx += (tx - cx) * 0.055
      cy += (ty - cy) * 0.055

      // Symbol parallax
      syms.forEach(el => {
        const p = PARALLAX[+el.dataset.layer]
        el.style.transform = `translate(${cx * p}px,${cy * p}px)`
      })
      // Grid perspective shift
      if (gridWrap) gridWrap.style.perspectiveOrigin = `${50 + cx * 14}% ${44 + cy * 5}%`
      if (gridPane) gridPane.style.transform = `rotateX(73deg) translate(${cx * -42}px,${cy * -22}px)`
      // Orb drift
      orbs.forEach((el, i) => {
        const p = 14 + i * 8
        el.style.transform = `translate(-50%,-50%) translate(${cx * p}px,${cy * p * 0.65}px)`
      })

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const grid = dark ? 'rgba(99,102,241,0.09)' : 'rgba(79,70,229,0.06)'
  const sym  = dark ? '#818cf8' : '#4338ca'
  const bg   = dark
    ? 'radial-gradient(ellipse 100% 75% at 22% 8%, #1e1b4b 0%, #0d0d1e 42%, #07070f 100%)'
    : 'radial-gradient(ellipse 100% 75% at 22% 8%, #eef2ff 0%, #f6f6ff 42%, #ffffff 100%)'

  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0 }}>
      <style>{CSS}</style>

      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: bg }} />

      {/* Perspective grid — the core 3-D illusion */}
      <div
        data-grid-wrap
        className="absolute inset-0"
        style={{ perspective: '1000px', perspectiveOrigin: '50% 44%' }}
      >
        <div
          data-grid-pane
          className="absolute"
          style={{
            left: '-70%', right: '-70%', top: '38%', bottom: '-30%',
            transform: 'rotateX(73deg)',
            backgroundImage: `linear-gradient(${grid} 1px,transparent 1px),linear-gradient(90deg,${grid} 1px,transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage: 'linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.4) 38%,transparent 68%)',
            WebkitMaskImage: 'linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.4) 38%,transparent 68%)',
          }}
        />
      </div>

      {/* Ambient depth orbs — soft colored light sources at different depths */}
      {[
        { x: 18, y: 16, r: 580, c: dark ? '99,102,241' : '99,102,241', o: dark ? 0.15 : 0.09 },
        { x: 82, y: 52, r: 470, c: dark ? '139,92,246' : '124,58,237', o: dark ? 0.11 : 0.05 },
        { x: 50, y: 84, r: 530, c: dark ? '37,99,235'  : '37,99,235',  o: dark ? 0.09 : 0.04 },
      ].map((orb, i) => (
        <div
          key={i}
          data-orb
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`, top: `${orb.y}%`,
            width: orb.r, height: orb.r,
            background: `radial-gradient(circle,rgba(${orb.c},${orb.o}) 0%,transparent 70%)`,
          }}
        />
      ))}

      {/* Floating math symbols — 3 depth layers */}
      {ITEMS.map(item => (
        <div
          key={item.id}
          data-layer={item.layer}
          className="absolute"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          <div style={{
            '--dx': `${item.dx}px`,
            '--dy': `${item.dy}px`,
            animation: `${ANIMS[item.layer]} ${item.period}s ease-in-out -${item.phaseDelay}s infinite`,
            color: sym,
            fontSize: item.size,
            opacity: OPACITY[item.layer],
            filter: BLUR[item.layer] > 0 ? `blur(${BLUR[item.layer]}px)` : undefined,
            fontFamily: 'Georgia,"Times New Roman",serif',
            fontWeight: 300,
            lineHeight: 1,
          }}>
            {item.char}
          </div>
        </div>
      ))}

      {/* Horizon glow at vanishing point */}
      <div className="absolute left-0 right-0" style={{
        top: '28%', height: '150px',
        background: dark
          ? 'radial-gradient(ellipse 65% 100% at 50% 50%,rgba(99,102,241,.07) 0%,transparent 100%)'
          : 'radial-gradient(ellipse 65% 100% at 50% 50%,rgba(79,70,229,.04) 0%,transparent 100%)',
      }} />

      {/* Edge vignette for depth */}
      <div className="absolute inset-0" style={{
        background: dark
          ? 'radial-gradient(ellipse 110% 110% at 50% 50%,transparent 48%,rgba(0,0,0,.22) 100%)'
          : 'radial-gradient(ellipse 110% 110% at 50% 50%,transparent 48%,rgba(100,90,200,.06) 100%)',
      }} />
    </div>
  )
}
