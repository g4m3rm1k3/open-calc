import { useState, useRef, useEffect } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#0f172a',
  surface:   '#1e293b',
  border:    '#334155',
  axis:      '#475569',
  grid:      '#152033',
  text:      '#e2e8f0',
  muted:     '#94a3b8',
  faint:     '#475569',
  cyan:      '#22d3ee',
  emerald:   '#4ade80',
  rose:      '#fb7185',
  gold:      '#fbbf24',
  violet:    '#a78bfa',
  rectFill:  'rgba(34,211,238,0.2)',
  rectStroke: 'rgba(34,211,238,0.8)',
}

// ─── Glossary Tooltips ────────────────────────────────────────────────────────
const GLOSSARY = {
  "Δx": { math: "Width of each rectangle", human: "Total interval width divided by the number of sections n." },
  "f(x_i)": { math: "Height of i-th rectangle", human: "Evaluated at the right edge of each slice by plugging the position into x²." },
  "Σ": { math: "Summation ('Sigma')", human: "A mathematical 'for loop'. Add up the area of each rectangle from i=1 to n." },
  "Limit": { math: "lim n → ∞", human: "Squeeze the rectangles until they are infinitely thin, perfectly matching the curve." },
}

function Tip({ term, children }) {
  const [open, setOpen] = useState(false)
  const entry = GLOSSARY[term]
  if (!entry) return <span>{children}</span>
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        style={{ borderBottom: `1px dashed ${C.gold}`, cursor: 'help', color: C.gold, fontWeight: 600 }}
      >
        {children}
      </span>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 6, background: '#1e293b', border: `1px solid ${C.gold}`, borderRadius: 8,
          padding: '8px 12px', width: 240, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 4 }}>{entry.math}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{entry.human}</div>
        </div>
      )}
    </span>
  )
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ step: s, isLatest, stepNumber }) {
  const stageColors = [C.emerald, C.cyan, C.gold, C.violet, C.rose]
  const color = stageColors[s.stage] ?? C.muted

  return (
    <div style={{
      borderLeft: `3px solid ${isLatest ? color : C.border}`,
      borderRadius: '0 8px 8px 0',
      background: isLatest ? `${color}08` : 'transparent',
      padding: '12px 14px',
      transition: 'all 0.3s',
      opacity: isLatest ? 1 : 0.65,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color, background: `${color}20`, padding: '2px 8px', borderRadius: 4 }}>
          STEP {stepNumber}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        {s.title}
      </div>
      
      <div style={{ fontSize: 13, color: C.muted, margin: '0 0 10px 0', lineHeight: 1.5 }}>
        {s.description}
      </div>

      <pre style={{
        background: C.grid, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px',
        fontSize: 12, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace',
      }}>
        {s.math}
      </pre>
    </div>
  )
}

const STEPS = [
  {
    stage: 0,
    title: 'The Core Goal',
    description: 'We want to find the exact area under the curve y = x² between x = 0 and x = 2. Since it is a curve, standard geometry fails. Our strategy is to approximate the area by filling it with vertical rectangles.',
    math: "∫(from 0 to 2) x² dx",
    n: 4,
  },
  {
    stage: 1,
    title: 'Setting up the Rectangles',
    description: 'We divide the total distance (2) into n equal slices. The width is exactly 2/n. The height touches right edge of the slice on the curve, so the position is i-th width, meaning height is (2i/n)²',
    math: "Width (Δx) = 2 / n\nHeight (f(x_i)) = (2i / n)² = 4i² / n²\nArea of one rectangle = (8i² / n³)",
    n: 8,
  },
  {
    stage: 2,
    title: 'The Σ Symbol (The For Loop)',
    description: 'To find the total area, we add up the area of every single rectangle from i=1 to n. The giant Sigma is literally just a mathematical "for loop".',
    math: "Σ (from i=1 to n) [ (4i² / n²) * (2 / n) ]\n= Σ (from i=1 to n) [ 8i² / n³ ]",
    n: 16,
  },
  {
    stage: 3,
    title: 'The Assumed Knowledge (The Magic Formula)',
    description: 'The constants 8 and n³ don\'t change as "i" counts up, so we pull them outside the loop. Now we need to sum i² (1² + 2² + ... + n²). Mathematicians already proved a formula for this series, which we just plug in.',
    math: "1. Pull out constants: (8/n³) * Σ(i²)\n2. Apply the formula for Σ(i²): n(n+1)(2n+1)/6\n3. Result: (16n³ + 24n² + 8n) / 6n³",
    n: 30,
  },
  {
    stage: 4,
    title: 'Getting the Exact Area (The Limit)',
    description: 'Rectangles look blocky and leave gaps. To get the perfect area, we squeeze n to infinity, making rectangles infinitely thin. The highest powers of n dominate (n³), and the smaller terms vanish into nothingness.',
    math: "lim(n→∞) [ (16n³ + 24n² + 8n) / 6n³ ]\n= 16 / 6\n= 8 / 3  ≈ 2.666...",
    n: 200,
  }
]

export default function RiemannSumDefinitionWalkthrough() {
  const [stepIdx, setStepIdx] = useState(0)
  const containerRef = useRef(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const ro = new ResizeObserver(e => setWidth(e[0].contentRect.width))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const currentStepInfo = STEPS[stepIdx]
  const n = currentStepInfo.n

  // SVG Layout
  const W = Math.max(width, 300)
  const H = Math.round(W * 0.5)
  const PAD = { l: 40, r: 20, t: 20, b: 30 }
  const pw = W - PAD.l - PAD.r
  const ph = H - PAD.t - PAD.b

  const xs = x => PAD.l + (x / 2.2) * pw
  const ys = y => PAD.t + ph - (y / 4.5) * ph

  // Rectangles
  const dxAmount = 2 / n
  const rects = []
  for (let i = 1; i <= n; i++) {
    const xDist = i * dxAmount
    const hDist = xDist * xDist
    rects.push({
      x1: xs((i-1)*dxAmount),
      x2: xs(xDist),
      y1: ys(hDist),
      y2: ys(0),
    })
  }

  // Curve
  let dCurve = `M ${xs(0)} ${ys(0)}`
  for(let x=0; x<=2.1; x+=0.05) {
    dCurve += ` L ${xs(x)} ${ys(x*x)}`
  }

  return (
    <div ref={containerRef} style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${C.border}` }}>
         <span style={{ color: C.cyan, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
              INTEGRAL DEFINITION: THE RIEMANN SUM
         </span>
         <span style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>
              — hover the definitions <Tip term="Δx">Δx</Tip>, <Tip term="f(x_i)">f(x_i)</Tip>, <Tip term="Σ">Σ</Tip>, <Tip term="Limit">Limit</Tip> 
         </span>
      </div>

      {/* SVG Graph */}
      <div style={{ position: 'relative' }}>
         <svg width={W} height={H} style={{ display: 'block' }}>
            <rect width={W} height={H} fill={C.bg} />
            <rect x={PAD.l} y={PAD.t} width={pw} height={ph} fill={C.surface} rx={3} />

            {/* Axes */}
            <line x1={PAD.l} y1={ys(0)} x2={W-PAD.r} y2={ys(0)} stroke={C.axis} strokeWidth={1.5} />
            <line x1={xs(0)} y1={PAD.t} x2={xs(0)} y2={H-PAD.b} stroke={C.axis} strokeWidth={1.5} />

            {/* Ticks */}
            {[0, 1, 2].map(x => (
               <g key={"x"+x}>
                  <line x1={xs(x)} y1={ys(0)} x2={xs(x)} y2={ys(0)+5} stroke={C.axis} />
                  <text x={xs(x)} y={ys(0)+18} fontSize={10} fill={C.muted} textAnchor="middle">{x}</text>
               </g>
            ))}
            {[0, 2, 4].map(y => (
               <g key={"y"+y}>
                  <line x1={xs(0)-5} y1={ys(y)} x2={xs(0)} y2={ys(y)} stroke={C.axis} />
                  <text x={xs(0)-10} y={ys(y)+3} fontSize={10} fill={C.muted} textAnchor="end">{y}</text>
               </g>
            ))}

            {/* Rectangles */}
            {rects.map((r, i) => (
               <rect key={i} x={r.x1} y={r.y1} width={r.x2 - r.x1} height={Math.max(0, r.y2 - r.y1)} 
                     fill={C.rectFill} stroke={C.rectStroke} strokeWidth={n < 50 ? 1 : 0.2} />
            ))}

             {/* The Curve */}
            <path d={dCurve} fill="none" stroke={C.gold} strokeWidth={2} />
         </svg>
      </div>

      {/* Navigation */}
      <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {STEPS.map((_, i) => {
            const isActive = i === stepIdx
            return (
              <div key={i} onClick={() => setStepIdx(i)}
                   style={{ width: isActive ? 9 : 7, height: isActive ? 9 : 7, borderRadius: '50%', background: isActive ? C.cyan : C.border, cursor: 'pointer', outline: isActive ? `2px solid ${C.cyan}` : 'none', outlineOffset: 2 }} />
            )
          })}
        </div>
        <span style={{ color: C.muted, fontSize: 11 }}>Step <span style={{ color: C.text, fontWeight: 700 }}>{stepIdx + 1}</span> / {STEPS.length}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setStepIdx(s => Math.max(0, s - 1))} disabled={stepIdx === 0}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, border: `1px solid ${C.border}`, background: 'transparent', color: stepIdx === 0 ? C.faint : C.muted, cursor: stepIdx === 0 ? 'default' : 'pointer' }}>← Back</button>
          <button onClick={() => setStepIdx(s => Math.min(STEPS.length - 1, s + 1))} disabled={stepIdx === STEPS.length - 1}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, border: `1px solid ${stepIdx === STEPS.length - 1 ? C.border : C.cyan}`, background: stepIdx === STEPS.length - 1 ? 'transparent' : `${C.cyan}18`, color: stepIdx === STEPS.length - 1 ? C.faint : C.cyan, cursor: stepIdx === STEPS.length - 1 ? 'default' : 'pointer' }}>Next →</button>
        </div>
      </div>

      {/* Step Log */}
      <div style={{ padding: '12px 12px 60px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
        {[...STEPS.slice(0, stepIdx + 1)].reverse().map((s, i) => (
          <StepCard key={s.title} step={s} isLatest={i === 0} stepNumber={stepIdx - i + 1} />
        ))}
      </div>
    </div>
  )
}
