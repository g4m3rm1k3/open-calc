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
  "Δx": { math: "Width / Resolution", human: "How coarse or fine your slices are." },
  "x_i": { math: "Iterator Position", human: "The exact x-coordinate where you take a measurement." },
  "f(x_i)": { math: "Probe Depth", human: "The height of the part at the probe location." },
  "Σ": { math: "Summation Loop", human: "Execute a for-loop accumulating all individual units." },
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
  const stageColors = [C.emerald, C.cyan, C.gold, C.rose, C.violet, C.emerald]
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
        fontSize: 14, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace',
      }}>
        {s.math}
      </pre>

      {/* Why it matters / Physical Intuition */}
      {isLatest && s.human && (
        <div style={{
          background: 'rgba(251,191,36,0.06)',
          border: `1px solid ${C.gold}22`,
          borderRadius: 6,
          padding: '7px 10px',
          marginTop: 8,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🔧</span>
          <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            <span style={{ color: C.gold, fontWeight: 700 }}>Shop Floor Logic: </span>
            {s.human}
          </div>
        </div>
      )}
    </div>
  )
}

const STEPS = [
  {
    stage: 0,
    title: 'The Resolution (Width)',
    description: 'You decide how "granular" your measurement is. Take your total distance (b - a) and divide it by n slices.',
    math: "Δx = (b - a) / n",
    human: 'Think of this like setting the step-over size on a milling tool path. Coarse step-over = wide slices. Fine step-over = thin slices.',
    n: 4,
    focus: 'width'
  },
  {
    stage: 1,
    title: 'The Probe Position (Iterator)',
    description: 'You need to know where the "probe" is touching the part for each slice. Start at the beginning (a) and take i steps of your width.',
    math: "x_i = a + i(Δx)",
    human: 'If you are probing a part, you don\'t probe randomly. You zero at "a" and step over by your set resolution "i" times to take your i-th measurement.',
    n: 4,
    focus: 'x_i'
  },
  {
    stage: 2,
    title: 'The Measurement (Height)',
    description: 'You plug that position into your function to see how "tall" the part is at that exact spot.',
    math: "Height = f(x_i) = f(a + iΔx)",
    human: 'The function is literally just your digital indicator showing the depth or height at that exact x_i coordinate.',
    n: 4,
    focus: 'height'
  },
  {
    stage: 3,
    title: 'The Individual Slice (Area of one unit)',
    description: 'You multiply the height you just found by the width of the slice. This is the area of a single thin rectangle.',
    math: "Area_i = f(x_i) · Δx",
    human: 'You just calculated a single chunk of material. You assumed the height stayed flat for that small step-over width. It\'s an approximation.',
    n: 4,
    focus: 'slice'
  },
  {
    stage: 4,
    title: 'The Loop (Summation)',
    description: 'You "add them all up" from the 1st slice to the n-th slice. This is where you use the Big Swap formulas to turn the "for loop" into algebra.',
    math: "Sum = Σ (from i=1 to n) [ f(x_i) · Δx ]",
    human: 'In a program, this is just a For-Loop adding to a total counter. In math, Sigma is the loop. It means "run through every single slice and tally the area."',
    n: 16,
    focus: 'sum'
  },
  {
    stage: 5,
    title: 'The Perfect Finish (The Limit)',
    description: 'You see what happens to that total sum as the number of slices (n) goes to Infinity.',
    math: "Area = lim(n→∞) Σ [ f(x_i) · Δx ]\n     = ∫(a to b) f(x) dx",
    human: 'The "gaps" or "steps" in your approximation disappear. Like filing away the ridges left by a coarse tool path until you have a perfectly smooth, exact surface. The Summation becomes a solid Integral.',
    n: 120,
    focus: 'limit'
  }
]

export default function RiemannSumFromSigma() {
  const [stepIdx, setStepIdx] = useState(0)
  const containerRef = useRef(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const ro = new ResizeObserver(e => setWidth(e[0].contentRect.width))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const currentStep = STEPS[stepIdx]
  const { n, focus } = currentStep

  // SVG Layout
  const W = Math.max(width, 300)
  const H = Math.round(W * 0.45)
  const PAD = { l: 40, r: 30, t: 40, b: 30 }
  const pw = W - PAD.l - PAD.r
  const ph = H - PAD.t - PAD.b

  // Coordinate mapping
  // Let the interval be [1, 5], mapped to pw. Curve is generic.
  const a = 1
  const b = 5
  const domainW = b - a

  const xs = x => PAD.l + ((x - a) / domainW) * pw
  
  // Generic smooth curve y = f(x). Say it starts low, goes up, then a bit down.
  // We'll define a simple function in math-space: f(x) = sin(x/1.5) * 2 + 3
  const f = (x) => Math.sin(x / 1.5) * 2 + 3
  
  // y domain roughly [0, 6]
  const yDomainTop = 6
  const ys = y => PAD.t + ph - (y / yDomainTop) * ph

  // Elements to draw
  const dxAmount = domainW / n
  
  // Specifically pick out the 3rd slice for highlighting the "probe" (i=3) for early steps
  const targetI = 3
  const targetX = a + targetI * dxAmount
  const prevX = a + (targetI - 1) * dxAmount
  const hDist = f(targetX)

  const rects = []
  for (let i = 1; i <= n; i++) {
    const xEdge = a + i * dxAmount
    const xPrev = a + (i-1) * dxAmount
    const h = f(xEdge)
    
    // Determine style based on focus
    let isHighlighted = false
    let isFaded = false
    
    if (focus === 'width' || focus === 'x_i' || focus === 'height' || focus === 'slice') {
       if (i === targetI) isHighlighted = true
       else isFaded = true
    }

    rects.push({
      i,
      x1: xs(xPrev),
      x2: xs(xEdge),
      y1: ys(h),
      y2: ys(0),
      isHighlighted,
      isFaded
    })
  }

  // Curve
  let dCurve = `M ${xs(a)} ${ys(f(a))}`
  for(let x=a; x<=b; x+=0.05) {
    dCurve += ` L ${xs(x)} ${ys(f(x))}`
  }

  return (
    <div ref={containerRef} style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${C.border}` }}>
         <span style={{ color: C.cyan, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
              THE CANONICAL ALGORITHM: "INFINITE ACCUMULATION"
         </span>
      </div>

      {/* SVG Graph */}
      <div style={{ position: 'relative' }}>
         <svg width={W} height={H} style={{ display: 'block' }}>
            <rect width={W} height={H} fill={C.bg} />
            <rect x={PAD.l} y={PAD.t} width={pw} height={ph} fill={C.surface} rx={3} />

            {/* Axes */}
            <line x1={PAD.l} y1={ys(0)} x2={W-PAD.r+20} y2={ys(0)} stroke={C.axis} strokeWidth={1.5} />
            
            {/* a and b markers */}
            <line x1={xs(a)} y1={ys(0)} x2={xs(a)} y2={ys(0)+8} stroke={C.axis} strokeWidth={2}/>
            <text x={xs(a)} y={ys(0)+22} fontSize={12} fill={C.muted} textAnchor="middle" fontWeight="bold">a</text>
            
            <line x1={xs(b)} y1={ys(0)} x2={xs(b)} y2={ys(0)+8} stroke={C.axis} strokeWidth={2}/>
            <text x={xs(b)} y={ys(0)+22} fontSize={12} fill={C.muted} textAnchor="middle" fontWeight="bold">b</text>

            <text x={W-PAD.r+20} y={ys(0)+14} fontSize={12} fill={C.muted} fontStyle="italic">x</text>

            {/* The Curve (background) */}
            {(focus === 'sum' || focus === 'limit') && 
               <path d={dCurve} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.3} />
            }
            
            {/* Region shading for Limit */}
            {focus === 'limit' && 
               <path d={`${dCurve} L ${xs(b)} ${ys(0)} L ${xs(a)} ${ys(0)} Z`} fill={C.cyan} opacity={0.3} />
            }

            {/* Rectangles */}
            {rects.map((r) => {
               if (focus === 'limit') return null; // Don't draw discrete rects in limit
               if (r.isFaded && (focus === 'width' || focus === 'x_i' || focus === 'height')) return null; // Only show one slice early on

               const opacity = r.isHighlighted ? 0.9 : r.isFaded ? 0 : 0.6;
               const fill = r.isHighlighted ? C.cyan : C.rectFill;
               const stroke = r.isHighlighted ? C.cyan : C.rectStroke;
               const dash = r.isHighlighted && focus === 'width' ? "2 2" : "0";
               
               if (focus === 'width') {
                  // Only draw the base width
                  return (
                     <g key={r.i}>
                        <rect x={r.x1} y={ys(0)-3} width={r.x2 - r.x1} height={6} fill={C.emerald} opacity={0.8} />
                     </g>
                  )
               }
               
               if (focus === 'x_i' || focus === 'height') {
                  // Draw x_i point, maybe probe line
                  return (
                     <g key={r.i}>
                        <line x1={r.x2} y1={ys(0)} x2={r.x2} y2={focus === 'height' ? r.y1 : ys(0)} stroke={C.gold} strokeWidth={2} strokeDasharray="4 4" />
                        <circle cx={r.x2} cy={ys(0)} r={4} fill={C.emerald} />
                        {focus === 'height' && <circle cx={r.x2} cy={r.y1} r={4} fill={C.gold} />}
                     </g>
                  )
               }

               return (
                  <rect key={r.i} x={r.x1} y={r.y1} width={r.x2 - r.x1} height={Math.max(0, r.y2 - r.y1)} 
                        fill={fill} stroke={stroke} strokeWidth={n < 50 ? 1 : 0.2} opacity={opacity} strokeDasharray={dash} />
               )
            })}

            {/* Annotations */}
            {focus === 'width' && (
               <g>
                   <text x={xs((prevX + targetX) / 2)} y={ys(0) - 10} fontSize={14} fill={C.emerald} textAnchor="middle" fontWeight="bold">Δx</text>
                   <text x={W/2} y={PAD.t} fontSize={14} fill={C.emerald} textAnchor="middle">Divide total distance into n chunks</text>
               </g>
            )}

            {focus === 'x_i' && (
               <g>
                   <text x={xs(targetX)} y={ys(0) + 20} fontSize={14} fill={C.emerald} textAnchor="middle" fontWeight="bold">x_i</text>
                   <path d={`M ${xs(a)} ${ys(0)-15} Q ${xs((a+targetX)/2)} ${ys(0)-40} ${xs(targetX)-5} ${ys(0)-18}`} fill="none" stroke={C.emerald} strokeWidth={1.5} strokeDasharray="3 3"/>
                   <polygon points={`${xs(targetX)},${ys(0)-15} ${xs(targetX)-8},${ys(0)-20} ${xs(targetX)-4},${ys(0)-25}`} fill={C.emerald} />
                   <text x={xs((a+targetX)/2)} y={ys(0)-35} fontSize={12} fill={C.emerald} textAnchor="middle">i steps of Δx</text>
               </g>
            )}

            {focus === 'height' && (
               <g>
                   <text x={xs(targetX) + 8} y={(ys(0) + ys(hDist))/2} fontSize={14} fill={C.gold} fontWeight="bold">f(x_i)</text>
                   <text x={xs(targetX)} y={ys(0) + 20} fontSize={14} fill={C.emerald} textAnchor="middle" fontWeight="bold">x_i</text>
               </g>
            )}

            {focus === 'slice' && (
               <g>
                   <text x={xs(targetX) + 8} y={(ys(0) + ys(hDist))/2} fontSize={12} fill={C.gold} opacity={0.8}>Height</text>
                   <text x={xs((prevX + targetX) / 2)} y={ys(0) + 16} fontSize={12} fill={C.emerald} textAnchor="middle">Width</text>
                   
                   <text x={W/2} y={PAD.t/2 + 10} fontSize={15} fill={C.cyan} textAnchor="middle" fontWeight="bold">Area_i = f(x_i) · Δx</text>
               </g>
            )}

             {/* The Curve (Foreground, full) */}
             {(focus === 'width' || focus === 'x_i' || focus === 'height' || focus === 'slice' || focus === 'limit') && 
               <path d={dCurve} fill="none" stroke={C.gold} strokeWidth={2} />
            }

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
