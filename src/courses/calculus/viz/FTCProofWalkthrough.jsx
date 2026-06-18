import React, { useState, useRef, useEffect } from 'react'

const lightColors = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  axis: '#94a3b8',
  grid: '#e2e8f0',
  text: '#1e293b',
  muted: '#64748b',
  faint: '#cbd5e1',
  cyan: '#06b6d4',
  emerald: '#10b981',
  rose: '#f43f5e',
  gold: '#f59e0b',
  violet: '#8b5cf6',
  areaFaint: 'rgba(6, 182, 212, 0.15)',
  areaSolid: 'rgba(6, 182, 212, 0.5)',
  areaMinus: 'rgba(244, 63, 94, 0.5)',
}

const darkColors = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  axis: '#475569',
  grid: '#152033',
  text: '#e2e8f0',
  muted: '#94a3b8',
  faint: '#475569',
  cyan: '#22d3ee',
  emerald: '#4ade80',
  rose: '#fb7185',
  gold: '#fbbf24',
  violet: '#a78bfa',
  areaFaint: 'rgba(34,211,238,0.2)',
  areaSolid: 'rgba(34,211,238,0.6)',
  areaMinus: 'rgba(251,113,133,0.6)',
}

function useIsDark() {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const ob = new MutationObserver(update)
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => ob.disconnect()
  }, [])
  return isDark
}

const GLOSSARY = {
  "F(x)": { math: "Accumulated Area", human: "The total area under the curve from a starting point 'a' to 'x'." },
  "F(x+h)": { math: "Slightly Larger Area", human: "The accumulated area stretching just a tiny bit further to 'x+h'." },
  "f(t)": { math: "The Original Function", human: "The curve forming the 'roof' of our area. t is just a dummy horizontal variable." },
  "f(c)": { math: "Average Height", human: "By Mean Value Theorem, there is some exact height f(c) that perfectly levels the sliver." },
  "h": { math: "The Width", human: "The tiny extra sliver of distance on the x-axis." }
}

function Tip({ term, C, children }) {
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
          marginBottom: 6, background: C.surface, border: `1px solid ${C.gold}`, borderRadius: 8,
          padding: '8px 12px', width: 240, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 4 }}>{entry.math}</div>
          <div style={{ fontSize: 11, color: C.text }}>{entry.human}</div>
        </div>
      )}
    </span>
  )
}

function StepCard({ step: s, isLatest, stepNumber, C }) {
  const stageColors = [C.emerald, C.cyan, C.gold, C.violet, C.rose]
  const color = stageColors[s.stage] ?? C.muted

  return (
    <div style={{
      borderLeft: `3px solid ${isLatest ? color : C.border}`,
      borderRadius: '0 8px 8px 0',
      background: isLatest ? `${color}15` : 'transparent',
      padding: '12px 14px',
      transition: 'all 0.3s',
      opacity: isLatest ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color, background: `${color}20`, padding: '2px 8px', borderRadius: 4 }}>
          STEP {stepNumber}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        {s.title}
      </div>
      <div style={{ fontSize: 13, color: C.text, margin: '0 0 10px 0', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: s.description }} />
      <pre style={{
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px',
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
    title: 'The Starting Point (Subtraction)',
    description: 'The definition of a derivative is the difference between two states. This looks messy because we have two separate integrals starting at the same point "a".',
    math: "F(x+h) - F(x)\n= ∫ (from a to x+h) f(t)dt  -  ∫ (from a to x) f(t)dt",
    animMode: 'subtraction'
  },
  {
    stage: 1,
    title: 'The "Flip" (Changing the Sign)',
    description: 'To combine these, we use the <b>Reverse Path Rule</b>. We take the second integral and flip its boundaries. When you swap top and bottom (a and x), the sign changes from negative to positive.',
    math: "Original: - ∫ (from a to x) f(t)dt\nFlipped:  + ∫ (from x to a) f(t)dt\n\nExpression: ∫ (from a to x+h) f(t)dt + ∫ (from x to a) f(t)dt",
    animMode: 'flip'
  },
  {
    stage: 2,
    title: 'The "Bridge" (Adding Adjacent Intervals)',
    description: 'Because we travel from x → a and then a → x+h, they "dock" together perfectly. The arbitrary start "a" disappears, leaving only the sliver of area between x and x+h.',
    math: "= ∫ (from x to x+h) f(t)dt",
    animMode: 'bridge'
  },
  {
    stage: 3,
    title: 'The "Average Value" Connection',
    description: 'The definition of average value over an interval is Area / Width. Our width is h. The Mean Value Theorem guarantees there is a point c where the function exactly equals this average.',
    math: "Derivative = limit (h→0) [ 1/h * ∫ (from x to x+h) f(t)dt ]\n\n1/h * ∫ (from x to x+h) f(t)dt = f(c)",
    animMode: 'average'
  },
  {
    stage: 4,
    title: 'The "Squeeze" (The Limit)',
    description: 'As h shrinks to zero, the tiny window collapses. Because c is trapped between x and x+h, c is forced to become x. The average height becomes the exact height at x!',
    math: "lim(h→0) f(c)  (where x < c < x+h)\n= f(x)",
    animMode: 'squeeze'
  }
]

export default function FTCProofWalkthrough() {
  const isDark = useIsDark()
  const C = isDark ? darkColors : lightColors

  const [stepIdx, setStepIdx] = useState(0)
  const containerRef = useRef(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const ro = new ResizeObserver(e => setWidth(e[0].contentRect.width))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const currentStep = STEPS[stepIdx]

  // Config bounds
  const W = Math.max(width, 300)
  const H = Math.round(W * 0.45)
  const PAD = { l: 40, r: 40, t: 40, b: 40 }
  const pw = W - PAD.l - PAD.r
  const ph = H - PAD.t - PAD.b

  const xs = x => PAD.l + (x / 10) * pw
  const ys = y => PAD.t + ph - (y / 5) * ph

  const f = (t) => 1.5 + 2 * Math.sin(t / 2) + Math.cos(t)

  const renderCurve = (dStart, dEnd) => {
    let d = `M ${xs(dStart)} ${ys(0)} L ${xs(dStart)} ${ys(f(dStart))}`
    for(let t=dStart; t<=dEnd; t+=0.1) { d += ` L ${xs(t)} ${ys(f(t))}` }
    d += ` L ${xs(dEnd)} ${ys(f(dEnd))} L ${xs(dEnd)} ${ys(0)} Z`
    return d
  }

  // Animation values based on step
  const aIdx = 1;
  const xIdx = 6;
  let hIdx = 2; // Default width
  if (currentStep.animMode === 'squeeze') hIdx = 0.2; // squeezed width

  const fullAreaPath = renderCurve(aIdx, xIdx + hIdx)
  const subAreaPath = renderCurve(aIdx, xIdx)
  const sliverAreaPath = renderCurve(xIdx, xIdx + hIdx)

  return (
    <div ref={containerRef} style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${C.border}` }}>
         <span style={{ color: C.cyan, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
              FUNDAMENTAL THEOREM OF CALCULUS PROOF
         </span>
         <span style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>
              — hover the definitions <Tip term="F(x)" C={C}>F(x)</Tip>, <Tip term="f(t)" C={C}>f(t)</Tip>, <Tip term="f(c)" C={C}>f(c)</Tip>, <Tip term="h" C={C}>h</Tip> 
         </span>
      </div>

      <div style={{ position: 'relative' }}>
         <svg width={W} height={H} style={{ display: 'block' }}>
            <rect width={W} height={H} fill={C.bg} />
            <rect x={PAD.l} y={PAD.t} width={pw} height={ph} fill={C.surface} rx={3} />

            {/* Grid */}
            <line x1={PAD.l} y1={ys(0)} x2={W-PAD.r} y2={ys(0)} stroke={C.axis} strokeWidth={1.5} />

            {/* Stage dependent visual rendering */}
            
            {(currentStep.animMode === 'subtraction' || currentStep.animMode === 'flip') && (
              <g>
                <path d={fullAreaPath} fill={C.areaFaint} />
                <path d={subAreaPath} fill={C.areaMinus} opacity={currentStep.animMode === 'subtraction' ? 0.3 : 0.8} />
                
                {/* Visual arrow indicating direction */}
                {currentStep.animMode === 'subtraction' && (
                  <path d={`M ${xs(aIdx)} ${ys(0.5)} L ${xs(xIdx)} ${ys(0.5)}`} stroke={C.rose} strokeWidth={2} strokeDasharray="4,4" markerEnd="url(#arrow)" />
                )}
                {currentStep.animMode === 'flip' && (
                  <path d={`M ${xs(xIdx)} ${ys(0.5)} L ${xs(aIdx)} ${ys(0.5)}`} stroke={C.emerald} strokeWidth={3} markerEnd="url(#arrow)" />
                )}
              </g>
            )}

            {(currentStep.animMode === 'bridge') && (
              <g>
                <path d={sliverAreaPath} fill={C.areaSolid} />
                <path d={subAreaPath} fill="transparent" stroke={C.faint} strokeDasharray="2,2" />
              </g>
            )}

            {(currentStep.animMode === 'average') && (
              <g>
                <path d={renderCurve(xIdx, xIdx + hIdx)} fill={C.areaFaint} stroke={C.cyan} strokeWidth={1} />
                {/* Average leveling box */}
                <rect x={xs(xIdx)} y={ys(f(xIdx + hIdx/2))} width={xs(xIdx+hIdx)-xs(xIdx)} height={ys(0) - ys(f(xIdx + hIdx/2))} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="4,4"/>
                <line x1={xs(xIdx)} y1={ys(f(xIdx + hIdx/2))} x2={xs(xIdx)+hIdx*20} y2={ys(f(xIdx + hIdx/2))} stroke={C.gold} strokeWidth={1} />
                <text x={xs(xIdx+hIdx)+5} y={ys(f(xIdx+hIdx/2))} fill={C.gold} fontSize={12} alignmentBaseline="middle">f(c)</text>
              </g>
            )}

            {(currentStep.animMode === 'squeeze') && (
              <g>
                <path d={renderCurve(xIdx, xIdx + hIdx)} fill={C.cyan} />
                <circle cx={xs(xIdx)} cy={ys(f(xIdx))} r={5} fill={C.rose} />
                <text x={xs(xIdx)-5} y={ys(f(xIdx))-15} fill={C.rose} fontSize={14} fontWeight="bold" textAnchor="end">f(x)</text>
              </g>
            )}

            {/* Axis labels */}
            <g fontSize={12} fill={C.text} textAnchor="middle">
               <text x={xs(aIdx)} y={ys(-0.5)}>a</text>
               <text x={xs(xIdx)} y={ys(-0.5)}>x</text>
               {currentStep.animMode !== 'squeeze' && <text x={xs(xIdx+hIdx)} y={ys(-0.5)}>x+h</text>}
            </g>

            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>

            {/* The primary f(t) curve always renders last to stay on top */}
            <path d={renderCurve(0, 10).replace(/L.*Z/, '')} fill="none" stroke={C.cyan} strokeWidth={2.5} />
         </svg>
      </div>

      <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {STEPS.map((_, i) => (
              <div key={i} onClick={() => setStepIdx(i)}
                   style={{ width: i === stepIdx ? 9 : 7, height: i === stepIdx ? 9 : 7, borderRadius: '50%', background: i === stepIdx ? C.cyan : C.border, cursor: 'pointer', outline: i === stepIdx ? `2px solid ${C.cyan}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setStepIdx(s => Math.max(0, s - 1))} disabled={stepIdx === 0}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, border: `1px solid ${C.border}`, background: 'transparent', color: stepIdx === 0 ? C.faint : C.text, cursor: stepIdx === 0 ? 'default' : 'pointer' }}>←</button>
          <button onClick={() => setStepIdx(s => Math.min(STEPS.length - 1, s + 1))} disabled={stepIdx === STEPS.length - 1}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, border: `1px solid ${stepIdx === STEPS.length - 1 ? C.border : C.cyan}`, background: stepIdx === STEPS.length - 1 ? 'transparent' : `${C.cyan}18`, color: stepIdx === STEPS.length - 1 ? C.faint : C.cyan, cursor: stepIdx === STEPS.length - 1 ? 'default' : 'pointer' }}>→</button>
        </div>
      </div>

      <div style={{ padding: '12px 12px 60px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
        {[...STEPS.slice(0, stepIdx + 1)].reverse().map((s, i) => (
          <StepCard key={s.title} step={s} isLatest={i === 0} stepNumber={stepIdx - i + 1} C={C} />
        ))}
      </div>
    </div>
  )
}
