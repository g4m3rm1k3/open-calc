import { useState, useRef, useEffect } from 'react'

const C = {
  bg:'#0f172a', surface:'#1e293b', border:'#334155', axis:'#475569', grid:'#152033',
  text:'#e2e8f0', muted:'#94a3b8', faint:'#475569',
  gold:'#fbbf24', goldShade:'rgba(251,191,36,0.10)',
  cyan:'#22d3ee', cyanShade:'rgba(34,211,238,0.07)',
  emerald:'#4ade80', emeraldShade:'rgba(74,222,128,0.10)',
  rose:'#fb7185', roseShade:'rgba(251,113,133,0.09)',
  violet:'#a78bfa', violetShade:'rgba(167,139,250,0.09)',
  upShade:'rgba(34,211,238,0.07)', downShade:'rgba(167,139,250,0.09)',
}

const REVEAL = ['marks','fprime-sign','extrema','fprimeprime-sign','inflections','full']
const shows = (tag, lvl) => REVEAL.indexOf(tag) <= lvl

// ── Phantom functions (satisfy the conditions exactly; formula is never shown) ──
// Example A: f(x) = x³ + 1.5x² − 6x  →  f′ = 3x²+3x−6 = 3(x+2)(x−1)
// Example B: g(x) = x⁴/4 − 5x³/3 + 1.5x² + 9x  →  g′ = (x+1)(x−3)²

const PROBLEMS = [
  {
    id:'two-extrema',
    label:'Classic: Max + Min + Inflection',
    name:'f',
    phantom: x => x**3 + 1.5*x**2 - 6*x,
    domain:[-3.8, 3], yDomain:[-5.5, 11.5],
    conditions:{
      fpZeros:['f ′(−2) = 0', 'f ′(1) = 0'],
      mono:[
        { label:'Increasing on', intervals:'(−∞, −2)  ∪  (1, ∞)' },
        { label:'Decreasing on', intervals:'(−2, 1)' },
      ],
      fppZeros:['f ″(−½) = 0'],
      concavity:[
        { label:'Concave UP on',   intervals:'(−½, ∞)' },
        { label:'Concave DOWN on', intervals:'(−∞, −½)' },
      ],
    },
    criticals:[
      { x:-2, label:'x = −2', type:'local-max' },
      { x: 1, label:'x = 1',  type:'local-min' },
    ],
    inflections:[{ x:-0.5, label:'x = −½', changesSign:true }],
    fppZerosX:[{ x:-0.5, changesSign:true }],
    intervals:[
      { xStart:-Infinity, xEnd:-2,   mono:'inc', concavity:'down' },
      { xStart:-2,        xEnd:-0.5, mono:'dec', concavity:'down' },
      { xStart:-0.5,      xEnd: 1,   mono:'dec', concavity:'up'   },
      { xStart: 1,        xEnd:Infinity, mono:'inc', concavity:'up' },
    ],
    steps:[
      {
        stage:1, stageLabel:'Locate Critical Points',
        title:'Mark where f ′ = 0 — these are the only extrema candidates',
        action:"f ′(−2) = 0  and  f ′(1) = 0\nThese two x-values divide the number line into three intervals:\n(−∞, −2),   (−2, 1),   (1, ∞)",
        howToWrite:"\"The only candidates for local extrema are x = −2 and x = 1, since these are the only x-values where f ′(x) = 0 (and f ′ is defined everywhere).\"",
        physical:"These are the only places the curve can peak or valley — everywhere else it's definitely going one direction.",
        reveal:'marks',
      },
      {
        stage:1, stageLabel:'f ′ Sign Chart',
        title:'Fill in the sign of f ′ on each interval',
        action:"From the given monotonicity data:\n• (−∞, −2): f is INCREASING  →  f ′ > 0\n• (−2,  1):  f is DECREASING  →  f ′ < 0\n• (1,  ∞):   f is INCREASING  →  f ′ > 0\n\nSign chart:   +  |  −  |  +\n              −2      1",
        howToWrite:"\"The given data directly gives the sign of f ′: positive on (−∞,−2), negative on (−2,1), positive on (1,∞).\"",
        physical:"Climbing → levelling off → diving → levelling off → climbing. The sign chart is the tool-path direction log.",
        reveal:'fprime-sign',
      },
      {
        stage:2, stageLabel:'Classify Each Critical Point',
        title:'Apply the First Derivative Test to each f ′ zero',
        action:"• x = −2: f ′ changes  (+) → (−)  →  LOCAL MAXIMUM\n• x =  1: f ′ changes  (−) → (+)  →  LOCAL MINIMUM\n\nNo other extrema are possible.",
        howToWrite:"\"At x = −2, f ′ changes sign from positive to negative, so by the First Derivative Test, f has a LOCAL MAXIMUM at x = −2. At x = 1, f ′ changes sign from negative to positive, confirming a LOCAL MINIMUM at x = 1.\"",
        physical:"Peak at x = −2 (tool reaches highest point before diving). Valley at x = 1 (deepest point before climbing back out).",
        reveal:'extrema',
      },
      {
        stage:3, stageLabel:'f ″ Sign Chart',
        title:'Map concavity from the given f ″ data',
        action:"f ″(−½) = 0  →  one candidate inflection point.\n\nFrom the given concavity data:\n• (−∞, −½): CONCAVE DOWN  →  f ″ < 0\n• (−½,  ∞): CONCAVE UP    →  f ″ > 0\n\nSign chart:   −  |  +\n              −½",
        howToWrite:"\"f ″ = 0 at x = −½. f is concave down on (−∞, −½) and concave up on (−½, ∞).\"",
        physical:"The cut arches over the left side (concave down, like a hill), then bowls on the right (concave up, like a pocket).",
        reveal:'fprimeprime-sign',
      },
      {
        stage:3, stageLabel:'Confirm Inflection Point',
        title:'Check for a genuine sign change in f ″',
        action:"At x = −½:\n  f ″ changes from (−) to (+)  →  sign genuinely changes.\n  ✔ CONFIRMED inflection point at x = −½.\n\nNote: a single inflection means two concavity zones.",
        howToWrite:"\"Since f ″ changes sign at x = −½ (from negative to positive), x = −½ is a confirmed inflection point where the concavity switches from downward to upward.\"",
        physical:"The exact moment the surface transitions from arched to bowl-shaped. Before: curvature steepens. After: curvature flattens.",
        reveal:'inflections',
      },
      {
        stage:4, stageLabel:'Segment-by-Segment Assembly',
        title:'Combine direction + shape on each piece; connect at landmarks',
        action:"x → −∞: f → −∞  (positive cubic → comes from lower-left)\n\n(−∞, −2): ↑ + ∩  →  decelerating rise  (climbing, curving down)\n  x = −2: LOCAL MAX\n(−2, −½): ↓ + ∩  →  accelerating fall  (diving, curving down)\n  x = −½: INFLECTION — curvature flips\n(−½,  1): ↓ + ∪  →  decelerating fall  (diving, curving up)\n  x =  1: LOCAL MIN\n(1,   ∞): ↑ + ∪  →  accelerating rise  (climbing, curving up)\n\nx → +∞: f → +∞",
        howToWrite:"Describe each segment: \"On (−∞, −2), f increases and is concave down, so the curve rises with a decreasing slope approaching the local max. On (−2, −½), f decreases and is concave down, so the fall accelerates into the inflection. On (−½, 1), f decreases but is now concave up, so the fall decelerates into the local min. On (1, ∞), f increases and is concave up, so the rise accelerates.\"",
        physical:"Full CNC surface profile: smooth run-up (decelerate) → peak → sharp dive (accelerate) → curve flattens → slow into valley → climb out fast.",
        reveal:'full',
      },
      {
        stage:4, stageLabel:'Written Justification',
        title:'Assemble all the above into your exam answer',
        isJustification: true,
        justification:`f has a LOCAL MAXIMUM at x = −2 and a LOCAL MINIMUM at x = 1.

This follows from the First Derivative Test:
  • f ′(−2) = 0 and f ′ changes sign from positive to negative at x = −2
    (f increases on (−∞,−2) then decreases on (−2,1)), confirming a local maximum.
  • f ′(1) = 0 and f ′ changes sign from negative to positive at x = 1
    (f decreases on (−2,1) then increases on (1,∞)), confirming a local minimum.

There is exactly ONE inflection point at x = −½.

f ″(−½) = 0 and f ″ changes sign from negative to positive at x = −½
(f is concave down on (−∞,−½) and concave up on (−½,∞)), confirming an inflection point.

To construct the sketch:
  Start at lower-left (f → −∞ as x → −∞). Draw a decelerating rise (↑∩) to the local
  max at x = −2. Fall with increasing steepness (↓∩) through the inflection at x = −½,
  where the curvature flips. Continue falling with decreasing steepness (↓∪) into the
  local min at x = 1. Finally, rise with increasing steepness (↑∪) to upper-right.`,
        action:'',
        howToWrite:'',
        physical:'',
        reveal:'full',
      },
    ],
  },

  {
    id:'horiz-inflection',
    label:'Trap: Horizontal Inflection at f ′ = 0',
    name:'g',
    phantom: x => x**4/4 - 5*x**3/3 + 1.5*x**2 + 9*x,
    domain:[-2.2, 5.2], yDomain:[-7, 22],
    conditions:{
      fpZeros:['g ′(−1) = 0', 'g ′(3) = 0'],
      mono:[
        { label:'Increasing on', intervals:'(−1, 3)  ∪  (3, ∞)' },
        { label:'Decreasing on', intervals:'(−∞, −1)' },
      ],
      fppZeros:['g ″(⅓) = 0', 'g ″(3) = 0'],
      concavity:[
        { label:'Concave UP on',   intervals:'(−∞, ⅓)  ∪  (3, ∞)' },
        { label:'Concave DOWN on', intervals:'(⅓, 3)' },
      ],
    },
    criticals:[
      { x:-1, label:'x = −1', type:'local-min' },
      { x: 3, label:'x = 3',  type:'horiz-inflection' },
    ],
    inflections:[
      { x:1/3, label:'x = ⅓', changesSign:true },
      { x:3,   label:'x = 3', changesSign:true },
    ],
    fppZerosX:[
      { x:1/3, changesSign:true },
      { x:3,   changesSign:true },
    ],
    intervals:[
      { xStart:-Infinity, xEnd:-1,  mono:'dec', concavity:'up'   },
      { xStart:-1,        xEnd:1/3, mono:'inc', concavity:'up'   },
      { xStart:1/3,       xEnd:3,   mono:'inc', concavity:'down' },
      { xStart:3,         xEnd:Infinity, mono:'inc', concavity:'up' },
    ],
    steps:[
      {
        stage:1, stageLabel:'Read the Monotonicity Data Carefully',
        title:'Look for the critical pattern: what sign is f ′ on each side of x = 3?',
        action:"g ′(−1) = 0  and  g ′(3) = 0.\n\nRead the monotonicity intervals:\n• Decreasing on (−∞, −1)  →  g ′ < 0  here\n• Increasing on (−1, 3)    →  g ′ > 0  here\n• Increasing on (3, ∞)     →  g ′ > 0  here\n\n⚠ Key observation: g ′ is POSITIVE on BOTH sides of x = 3.",
        howToWrite:"\"From the given data, g ′ < 0 on (−∞,−1) and g ′ > 0 on (−1,3) ∪ (3,∞). Note that g ′ does not change sign at x = 3.\"",
        physical:"The tool path only dips before x = −1. After that it's always climbing — even through the pause at x = 3.",
        reveal:'marks',
      },
      {
        stage:1, stageLabel:'f ′ Sign Chart',
        title:'Build the sign chart — the crucial step before classifying',
        action:"Sign chart for g ′:\n\n  −   |   +   |  0  |   +\n    −1     (1/3)  3\n\nImportant: x = 3 is NOT a sign change — g ′ stays positive on both sides.",
        howToWrite:"\"The sign chart shows g ′ < 0 on (−∞,−1), g ′ > 0 on (−1,3) and (3,∞). The sign does not change at x = 3.\"",
        physical:"One valley (at x = −1), then a continuous climb with a momentary level-off at x = 3 — like a road with a flat rest stop that keeps going uphill.",
        reveal:'fprime-sign',
      },
      {
        stage:2, stageLabel:'Classify Each Critical Point',
        title:'Apply the First Derivative Test — x = 3 is the trap',
        action:"• x = −1: g ′ changes  (−) → (+)  →  LOCAL MINIMUM  ✔\n\n• x =  3: g ′ stays (+) on BOTH sides  →  NO EXTREMUM  ✗\n  x = 3 is a horizontal tangent point but NOT a local max or min.\n  It is a flat moment where the function keeps increasing.",
        howToWrite:"\"At x = −1, g ′ changes sign from negative to positive, so g has a LOCAL MINIMUM at x = −1. At x = 3, g ′ does NOT change sign (positive on both sides), so there is NO local extremum at x = 3 — it is merely a point of horizontal tangency.\"",
        physical:"x = −1: bottom of a pocket — valid valley. x = 3: rest stop on an uphill road, not a peak, not a valley. The cutter slows to horizontal then keeps climbing.",
        reveal:'extrema',
      },
      {
        stage:3, stageLabel:'f ″ Sign Chart',
        title:'Map the concavity from the given data',
        action:"g ″(⅓) = 0  and  g ″(3) = 0.\n\nFrom the given concavity data:\n• (−∞, ⅓): CONCAVE UP    →  g ″ > 0\n• (⅓, 3):  CONCAVE DOWN  →  g ″ < 0\n• (3, ∞):   CONCAVE UP    →  g ″ > 0\n\nSign chart:  +  |  −  |  +\n             ⅓      3",
        howToWrite:"\"g ″ > 0 on (−∞,⅓) ∪ (3,∞) (concave up), and g ″ < 0 on (⅓,3) (concave down).\"",
        physical:"Bowl shape coming in from the left, transitions to an arch over the middle section, then bowls again on the right.",
        reveal:'fprimeprime-sign',
      },
      {
        stage:3, stageLabel:'Confirm Inflection Points',
        title:'Both x = ⅓ and x = 3 have genuine sign changes in g ″',
        action:"• x = ⅓: g ″ changes  (+) → (−)  →  CONFIRMED inflection ✔\n  (still increasing, but curvature flips from bowl to arch)\n\n• x = 3: g ″ changes  (−) → (+)  →  CONFIRMED inflection ✔\n  AND g ′(3) = 0  →  this point has BOTH a flat tangent AND a curvature flip.",
        howToWrite:"\"At x = ⅓, g ″ changes from positive to negative, confirming an inflection point. At x = 3, g ″ changes from negative to positive, also confirming an inflection point. Note that x = 3 simultaneously has a horizontal tangent and a change in concavity.\"",
        physical:"x = ⅓: the arch starts (still climbing, but curvature reverses). x = 3: two things happen at once — the pause in slopes AND the bowl restarts.",
        reveal:'inflections',
      },
      {
        stage:4, stageLabel:'Segment-by-Segment Assembly',
        title:'Combine direction + shape on each piece',
        action:"x → −∞: g → −∞  (even-degree with positive leading term)\n\n(−∞, −1): ↓ + ∪  →  decelerating fall  (falling, cupping up)\n  x = −1: LOCAL MIN\n(−1, ⅓):  ↑ + ∪  →  accelerating rise  (climbing, cupping up)\n  x = ⅓:  INFLECTION — curvature flips to down\n(⅓, 3):   ↑ + ∩  →  decelerating rise  (climbing, arching over)\n  x = 3:  FLAT TANGENT + INFLECTION — momentary level, curvature flips to up\n(3, ∞):   ↑ + ∪  →  accelerating rise  (climbing, cupping up)\n\nx → +∞: g → +∞",
        howToWrite:"Describe each segment. Critically: \"At x = 3, the curve momentarily has a horizontal tangent (since g ′(3) = 0) and simultaneously changes from concave down to concave up. The curve does not turn around — it continues increasing with a brief flat moment.\"",
        physical:"Swoops into valley (decelerating), climbs out fast (accelerating bowl), slows into the arch, almost-flat at x = 3 then accelerates again. No peaks after the valley.",
        reveal:'full',
      },
      {
        stage:4, stageLabel:'Written Justification',
        title:'Assemble all the above into your exam answer',
        isJustification: true,
        justification:`g has a LOCAL MINIMUM at x = −1. There is NO local extremum at x = 3.

First Derivative Test:
  • g ′(−1) = 0 and g ′ changes sign from negative to positive at x = −1
    (decreasing on (−∞,−1), increasing on (−1,∞)), confirming a local minimum.
  • g ′(3) = 0, but g ′ remains positive on both (−1,3) and (3,∞).
    Since g ′ does NOT change sign at x = 3, there is no local extremum there.
    x = 3 is a point of horizontal tangency only.

There are TWO inflection points: at x = ⅓ and x = 3.

  • At x = ⅓: g ″ changes from positive to negative (concave up → concave down). Confirmed inflection.
  • At x = 3:  g ″ changes from negative to positive (concave down → concave up). Confirmed inflection.
    This point also carries a horizontal tangent (g ′(3) = 0), so x = 3 is simultaneously
    a point of horizontal tangency AND a change in concavity.

To construct the sketch:
  Start at lower-left (g → −∞ as x → −∞, even-degree positive). Draw a decelerating fall
  (↓∪) into the local min at x = −1. Climb with increasing speed (↑∪) to the inflection
  at x = ⅓, where curvature flips. Continue climbing with decreasing slope (↑∩) curving
  toward the momentary-flat at x = 3. At x = 3 the curve briefly levels (horizontal tangent)
  then resumes climbing as a bowl curve (↑∪), accelerating to upper-right.`,
        action:'', howToWrite:'', physical:'',
        reveal:'full',
      },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function buildCurve(f, domain, yDomain, n=500) {
  const pts=[], dx=(domain[1]-domain[0])/n
  for(let i=0;i<=n;i++){
    const x=domain[0]+i*dx, y=f(x)
    if(isFinite(y)&&y>=yDomain[0]-20&&y<=yDomain[1]+20) pts.push([x,y])
  }
  return pts
}
function svgPath(pts, xs, ys) {
  if(!pts.length) return ''
  let d=`M ${xs(pts[0][0]).toFixed(1)} ${ys(pts[0][1]).toFixed(1)}`
  for(let i=1;i<pts.length;i++){
    if(Math.abs(pts[i][0]-pts[i-1][0])>0.3)
      d+=` M ${xs(pts[i][0]).toFixed(1)} ${ys(pts[i][1]).toFixed(1)}`
    else d+=` L ${xs(pts[i][0]).toFixed(1)} ${ys(pts[i][1]).toFixed(1)}`
  }
  return d
}

// ── Problem Statement Card ────────────────────────────────────────────────────
function ProblemStatement({ p }) {
  const row = (label, val, col=C.text) => (
    <div style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'4px 0',
      borderBottom:`1px solid ${C.border}22` }}>
      <span style={{ color:C.muted, fontSize:11, minWidth:130, flexShrink:0 }}>{label}</span>
      <span style={{ color:col, fontSize:11, fontFamily:'monospace', lineHeight:1.5 }}>{val}</span>
    </div>
  )
  return (
    <div style={{ margin:'0 0 0 0', padding:'12px 14px',
      background:C.surface, borderBottom:`1px solid ${C.border}` }}>
      <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:0.8, marginBottom:8 }}>
        📋 GIVEN CONDITIONS — no formula for {p.name}(x) is provided
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 32px' }}>
        <div style={{ flex:'1 1 200px' }}>
          <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>FIRST DERIVATIVE</div>
          {row('Zeros:', p.conditions.fpZeros.join(', '), C.gold)}
          {p.conditions.mono.map(m => row(m.label+':', m.intervals, C.emerald))}
        </div>
        <div style={{ flex:'1 1 200px' }}>
          <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>SECOND DERIVATIVE</div>
          {row('Zeros:', p.conditions.fppZeros.join(', '), C.violet)}
          {p.conditions.concavity.map(m => row(m.label+':', m.intervals, C.cyan))}
        </div>
      </div>
    </div>
  )
}

// ── Justification card ────────────────────────────────────────────────────────
function JustificationCard({ text }) {
  return (
    <div style={{ border:`1px solid ${C.gold}44`, borderRadius:8,
      background:'rgba(251,191,36,0.05)', padding:'12px 14px' }}>
      <div style={{ color:C.gold, fontWeight:700, fontSize:12, marginBottom:8 }}>
        ✍️ JUSTIFICATION TEMPLATE — write something like this in your answer
      </div>
      <pre style={{ color:C.text, fontSize:11.5, lineHeight:1.75,
        whiteSpace:'pre-wrap', wordBreak:'break-word',
        fontFamily:'system-ui, sans-serif', margin:0 }}>{text}</pre>
    </div>
  )
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepCard({ s, isLatest, num }) {
  const cols = [C.emerald, C.gold, C.violet, C.cyan]
  const col = cols[(s.stage-1) % cols.length]
  if (s.isJustification) {
    return (
      <div style={{ borderLeft:`3px solid ${C.gold}`, borderRadius:'0 8px 8px 0',
        padding:'12px 14px', background:isLatest ? 'rgba(251,191,36,0.05)' : 'transparent',
        opacity: isLatest ? 1 : 0.6 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.gold,
            background:'rgba(251,191,36,0.15)', padding:'2px 8px', borderRadius:4 }}>
            STAGE 4 · {s.stageLabel}
          </span>
          <span style={{ fontSize:11, color:C.muted }}>Step {num}</span>
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>{s.title}</div>
        <JustificationCard text={s.justification} />
      </div>
    )
  }
  return (
    <div style={{ borderLeft:`3px solid ${isLatest ? col : C.border}`,
      borderRadius:'0 8px 8px 0', padding:'12px 14px',
      background: isLatest ? `${col}08` : 'transparent',
      opacity: isLatest ? 1 : 0.6, transition:'all 0.3s' }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
        <span style={{ fontSize:10, fontWeight:700, color:col,
          background:`${col}20`, padding:'2px 8px', borderRadius:4 }}>
          STAGE {s.stage} · {s.stageLabel}
        </span>
        <span style={{ fontSize:11, color:C.muted }}>Step {num}</span>
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:8 }}>{s.title}</div>
      <pre style={{ background:C.grid, border:`1px solid ${C.border}`, borderRadius:6,
        padding:'8px 10px', fontSize:11.5, color:C.text, lineHeight:1.7,
        whiteSpace:'pre-wrap', wordBreak:'break-word', margin:'0 0 8px', fontFamily:'monospace' }}>
        {s.action}
      </pre>
      {s.howToWrite && (
        <div style={{ background:C.goldShade, border:`1px solid ${C.gold}22`,
          borderRadius:6, padding:'7px 10px', marginBottom:8 }}>
          <span style={{ color:C.gold, fontWeight:700, fontSize:11 }}>📝 How to write this: </span>
          <span style={{ color:C.muted, fontSize:11, fontStyle:'italic' }}>{s.howToWrite}</span>
        </div>
      )}
      {isLatest && s.physical && (
        <div style={{ background:'rgba(34,211,238,0.05)', border:`1px solid ${C.cyan}22`,
          borderRadius:6, padding:'7px 10px', display:'flex', gap:8 }}>
          <span style={{ fontSize:13, flexShrink:0 }}>🔧</span>
          <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>
            <span style={{ color:C.cyan, fontWeight:700 }}>Physical read: </span>{s.physical}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sign strip ─────────────────────────────────────────────────────────────────
function SignStrip({ label, strips, domain, dots, getSign, getLabel, posColor, negColor }) {
  const ref=useRef(null), [w,setW]=useState(500)
  useEffect(()=>{
    const ro=new ResizeObserver(e=>setW(e[0].contentRect.width))
    if(ref.current) ro.observe(ref.current)
    return ()=>ro.disconnect()
  },[])
  const L=38, R=8, H=44, pw=w-L-R
  const xs=x=>L+((x-domain[0])/(domain[1]-domain[0]))*pw
  return (
    <div ref={ref} style={{ borderTop:`1px solid ${C.border}` }}>
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`}
        style={{ display:'block', width:'100%', height:'auto' }}>
        <rect width={w} height={H} fill={C.bg}/>
        <text x={L-5} y={H/2+4} textAnchor="end" fontSize={10}
          fill={C.muted} fontStyle="italic">{label}</text>
        {strips.map((s,i)=>{
          const x0=Math.max(xs(s.lo),L), x1=Math.min(xs(s.hi),L+pw)
          if(x1<=x0) return null
          const sign=getSign(s), lbl=getLabel(s)
          const col=sign==='+'?posColor:negColor
          const bg=sign==='+'?`${posColor}14`:`${negColor}12`
          return <g key={i}>
            <rect x={x0+1} y={3} width={x1-x0-2} height={H-6} fill={bg} rx={3}/>
            <text x={(x0+x1)/2} y={19} textAnchor="middle" fontSize={14} fontWeight={700} fill={col}>{sign}</text>
            <text x={(x0+x1)/2} y={33} textAnchor="middle" fontSize={8} fill={col}>{lbl}</text>
          </g>
        })}
        {dots.map((cx,di)=>{
          const sx=xs(cx)
          if(sx<L||sx>L+pw) return null
          return <g key={di}>
            <line x1={sx} y1={0} x2={sx} y2={H} stroke={C.gold} strokeWidth={1.5}/>
            <circle cx={sx} cy={H/2} r={3.5} fill={C.gold}/>
          </g>
        })}
      </svg>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SignDataSketchLab() {
  const [pidx,setPidx]=useState(0)
  const [rawStep,setRawStep]=useState(0)
  const containerRef=useRef(null)
  const [width,setWidth]=useState(600)

  useEffect(()=>{
    const ro=new ResizeObserver(e=>setWidth(e[0].contentRect.width))
    if(containerRef.current) ro.observe(containerRef.current)
    return ()=>ro.disconnect()
  },[])

  const p=PROBLEMS[pidx]
  const step=Math.min(rawStep,p.steps.length-1)
  useEffect(()=>setRawStep(0),[pidx])

  const curReveal=p.steps[step]?.reveal??'marks'
  const revLvl=REVEAL.indexOf(curReveal)
  const show=tag=>shows(tag,revLvl)

  const W=Math.max(width,300), H=Math.round(W*0.44)
  const PAD={l:44,r:12,t:14,b:28}
  const pw=W-PAD.l-PAD.r, ph=H-PAD.t-PAD.b

  const {domain,yDomain}=p
  const xs=x=>PAD.l+((x-domain[0])/(domain[1]-domain[0]))*pw
  const ys=y=>PAD.t+(1-(y-yDomain[0])/(yDomain[1]-yDomain[0]))*ph

  const curve=buildCurve(p.phantom,domain,yDomain)
  const curvePath=svgPath(curve,xs,ys)

  const specialX=[...p.criticals.map(c=>c.x),...p.inflections.map(i=>i.x)]
    .filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b)

  const strips=(()=>{
    const bounds=[domain[0],...specialX,domain[1]].sort((a,b)=>a-b)
    return bounds.slice(0,-1).map((lo,i)=>{
      const hi=bounds[i+1], mid=(lo+hi)/2
      const iv=p.intervals.find(v=>v.xStart<=mid&&v.xEnd>=mid)
      return {lo,hi,mono:iv?.mono??'inc',conc:iv?.concavity??'up'}
    })
  })()

  const span=domain[1]-domain[0], tStep=span>8?2:1
  const xTicks=[]
  for(let x=Math.ceil(domain[0]);x<=Math.floor(domain[1]);x+=tStep) xTicks.push(x)
  const ySpan=yDomain[1]-yDomain[0]
  const yTStep=ySpan>200?100:ySpan>80?50:ySpan>20?20:ySpan>6?2:1
  const yTicks=[]
  for(let y=Math.ceil(yDomain[0]/yTStep)*yTStep;y<=yDomain[1];y+=yTStep) yTicks.push(y)

  const stepCount=p.steps.length

  return (
    <div ref={containerRef} style={{ background:C.bg, borderRadius:14,
      border:`1px solid ${C.border}`, overflow:'hidden',
      fontFamily:'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ padding:'10px 16px 8px', borderBottom:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div>
          <span style={{ color:C.cyan, fontWeight:700, fontSize:12, letterSpacing:1 }}>
            SKETCH FROM CONDITIONS
          </span>
          <span style={{ color:C.muted, fontSize:11, marginLeft:8 }}>
            — no formula; build the graph from derivative data alone
          </span>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {PROBLEMS.map((q,i)=>(
            <button key={q.id} onClick={()=>setPidx(i)} style={{
              padding:'3px 10px', borderRadius:5, fontSize:11, cursor:'pointer',
              border:`1px solid ${i===pidx?C.cyan:C.border}`,
              background:i===pidx?`${C.cyan}20`:'transparent',
              color:i===pidx?C.cyan:C.muted }}>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Problem statement */}
      <ProblemStatement p={p} />

      {/* Graph */}
      <div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          style={{ display:'block', width:'100%', height:'auto' }}>
          <rect width={W} height={H} fill={C.bg}/>
          <rect x={PAD.l} y={PAD.t} width={pw} height={ph} fill={C.surface} rx={3}/>

          {/* Monotonicity shading */}
          {show('fprime-sign')&&strips.map((s,i)=>{
            const x0=Math.max(xs(s.lo),PAD.l),x1=Math.min(xs(s.hi),PAD.l+pw)
            if(x1<=x0) return null
            return <rect key={`m${i}`} x={x0} y={PAD.t} width={x1-x0} height={ph}
              fill={s.mono==='inc'?C.emeraldShade:C.roseShade}/>
          })}
          {/* Concavity shading */}
          {show('fprimeprime-sign')&&strips.map((s,i)=>{
            const x0=Math.max(xs(s.lo),PAD.l),x1=Math.min(xs(s.hi),PAD.l+pw)
            if(x1<=x0) return null
            return <rect key={`c${i}`} x={x0} y={PAD.t} width={x1-x0} height={ph}
              fill={s.conc==='up'?C.upShade:C.downShade} opacity={0.8}/>
          })}

          {/* Grid */}
          {yTicks.map(y=><line key={`gy${y}`} x1={PAD.l} y1={ys(y)} x2={PAD.l+pw} y2={ys(y)}
            stroke={y===0?C.axis:C.grid} strokeWidth={y===0?1.5:0.75}/>)}
          {xTicks.map(x=><line key={`gx${x}`} x1={xs(x)} y1={PAD.t} x2={xs(x)} y2={PAD.t+ph}
            stroke={x===0?C.axis:C.grid} strokeWidth={x===0?1.5:0.75}/>)}
          {xTicks.map(x=><text key={`xt${x}`} x={xs(x)} y={PAD.t+ph+16}
            textAnchor="middle" fontSize={9} fill={C.muted}>{x}</text>)}
          {yTicks.map(y=><text key={`yt${y}`} x={PAD.l-5} y={ys(y)+3.5}
            textAnchor="end" fontSize={9} fill={C.muted}>{y}</text>)}

          {/* Critical verticals */}
          {show('marks')&&p.criticals.map(c=>(
            <line key={`cv${c.x}`} x1={xs(c.x)} y1={PAD.t} x2={xs(c.x)} y2={PAD.t+ph}
              stroke={C.gold} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.7}/>
          ))}
          {/* Inflection verticals */}
          {show('inflections')&&p.inflections.map(ip=>(
            <line key={`iv${ip.x}`} x1={xs(ip.x)} y1={PAD.t} x2={xs(ip.x)} y2={PAD.t+ph}
              stroke={C.violet} strokeWidth={1.2} strokeDasharray="3 2" opacity={0.6}/>
          ))}

          {/* Curve — shown only at 'full' reveal */}
          {show('full')&&<path d={curvePath} fill="none" stroke={C.cyan} strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round"/>}

          {/* Extremum labels */}
          {show('extrema')&&p.criticals.map(c=>{
            const fy=p.phantom(c.x), sy=ys(fy)
            const inBounds=sy>=PAD.t&&sy<=PAD.t+ph
            const col=c.type==='local-max'?C.emerald:c.type==='local-min'?C.rose:C.gold
            const sym=c.type==='local-max'?'▲':c.type==='local-min'?'▼':'●'
            return <g key={`ex${c.x}`}>
              {show('full')&&inBounds&&
                <circle cx={xs(c.x)} cy={sy} r={6} fill={col} stroke={C.bg} strokeWidth={2}/>}
              <text x={xs(c.x)} y={c.type==='local-max'?PAD.t+16:PAD.t+ph-6}
                textAnchor="middle" fontSize={9} fill={col} fontWeight={700}>{sym} {c.label}</text>
            </g>
          })}
          {/* Inflection labels */}
          {show('inflections')&&p.inflections.map(ip=>{
            const fy=p.phantom(ip.x), sy=ys(fy)
            const inBounds=sy>=PAD.t&&sy<=PAD.t+ph
            return <g key={`ip${ip.x}`}>
              {show('full')&&inBounds&&
                <circle cx={xs(ip.x)} cy={sy} r={5} fill={C.violet} stroke={C.bg} strokeWidth={2}/>}
              <text x={xs(ip.x)} y={PAD.t+ph/2}
                textAnchor="middle" fontSize={9} fill={C.violet} fontWeight={700}>◆</text>
            </g>
          })}

          {/* Legend */}
          <g transform={`translate(${PAD.l+5},${PAD.t+5})`}>
            {show('full')&&<>
              <line x1={0} y1={7} x2={18} y2={7} stroke={C.cyan} strokeWidth={2.5}/>
              <text x={21} y={11} fontSize={9} fill={C.cyan}>{p.name}(x) — matches all conditions</text>
            </>}
            {show('fprime-sign')&&<>
              <rect x={0} y={15} width={18} height={7} fill={C.emeraldShade} stroke={C.emerald}
                strokeWidth={0.5} rx={2}/>
              <text x={21} y={22} fontSize={8} fill={C.emerald}>f ′ &gt; 0 ↑</text>
              <rect x={0} y={25} width={18} height={7} fill={C.roseShade} stroke={C.rose}
                strokeWidth={0.5} rx={2}/>
              <text x={21} y={32} fontSize={8} fill={C.rose}>f ′ &lt; 0 ↓</text>
            </>}
            {show('fprimeprime-sign')&&<>
              <rect x={0} y={35} width={18} height={7} fill={C.upShade} stroke={C.cyan}
                strokeWidth={0.5} rx={2}/>
              <text x={21} y={42} fontSize={8} fill={C.cyan}>f ″ &gt; 0 ∪</text>
              <rect x={0} y={45} width={18} height={7} fill={C.downShade} stroke={C.violet}
                strokeWidth={0.5} rx={2}/>
              <text x={21} y={52} fontSize={8} fill={C.violet}>f ″ &lt; 0 ∩</text>
            </>}
          </g>
        </svg>

        {show('fprime-sign')&&(
          <SignStrip label="f ′" strips={strips} domain={domain}
            dots={p.criticals.map(c=>c.x)}
            getSign={s=>s.mono==='inc'?'+':'−'}
            getLabel={s=>s.mono==='inc'?'inc ↑':'dec ↓'}
            posColor={C.emerald} negColor={C.rose}/>
        )}
        {show('fprimeprime-sign')&&(
          <SignStrip label="f ″" strips={strips} domain={domain}
            dots={p.fppZerosX.map(z=>z.x)}
            getSign={s=>s.conc==='up'?'+':'−'}
            getLabel={s=>s.conc==='up'?'up ∪':'dn ∩'}
            posColor={C.cyan} negColor={C.violet}/>
        )}
      </div>

      {/* Navigation */}
      <div style={{ padding:'8px 16px', borderTop:`1px solid ${C.border}`,
        borderBottom:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          {p.steps.map((s,i)=>{
            const col=[C.emerald,C.gold,C.violet,C.cyan][(s.stage-1)%4]
            return <div key={i} onClick={()=>setRawStep(i)}
              title={`Step ${i+1}: ${s.stageLabel}`}
              style={{ width:i===step?9:7, height:i===step?9:7, borderRadius:'50%',
                background:i===step?col:i<step?`${col}80`:C.border,
                cursor:'pointer', transition:'all 0.2s',
                outline:i===step?`2px solid ${col}`:'none', outlineOffset:2 }}/>
          })}
        </div>
        <span style={{ color:C.muted, fontSize:11 }}>
          Step <span style={{ color:C.text, fontWeight:700 }}>{step+1}</span> / {stepCount}
        </span>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>setRawStep(s=>Math.max(0,s-1))} disabled={step===0}
            style={{ padding:'5px 14px', borderRadius:6, fontSize:12, fontWeight:600,
              cursor:step===0?'default':'pointer', border:`1px solid ${C.border}`,
              background:'transparent', color:step===0?C.faint:C.muted }}>
            ← Back
          </button>
          <button onClick={()=>setRawStep(s=>Math.min(stepCount-1,s+1))} disabled={step===stepCount-1}
            style={{ padding:'5px 14px', borderRadius:6, fontSize:12, fontWeight:600,
              cursor:step===stepCount-1?'default':'pointer',
              border:`1px solid ${step===stepCount-1?C.border:C.cyan}`,
              background:step===stepCount-1?'transparent':`${C.cyan}18`,
              color:step===stepCount-1?C.faint:C.cyan }}>
            Next →
          </button>
        </div>
      </div>

      {/* Step log — newest on top */}
      <div style={{ padding:'12px 12px 8px', display:'flex', flexDirection:'column', gap:8 }}>
        {[...p.steps.slice(0,step+1)].reverse().map((s,i)=>(
          <StepCard key={`${p.id}-${step-i}`} s={s} isLatest={i===0} num={step-i+1}/>
        ))}
      </div>

      {/* Footer key */}
      <div style={{ borderTop:`1px solid ${C.border}`, padding:'8px 16px',
        display:'flex', flexWrap:'wrap', gap:'4px 16px', background:C.surface }}>
        {[
          {sym:'▲',col:C.emerald,txt:'Local MAX'},
          {sym:'▼',col:C.rose,txt:'Local MIN'},
          {sym:'●',col:C.gold,txt:'Flat tangent (NOT extremum)'},
          {sym:'◆',col:C.violet,txt:'Inflection point'},
          {sym:'📝',col:C.gold,txt:'How to write this'},
          {sym:'🔧',col:C.cyan,txt:'Physical intuition'},
        ].map(item=>(
          <span key={item.sym} style={{ fontSize:10.5, color:C.muted,
            display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ color:item.col }}>{item.sym}</span>{item.txt}
          </span>
        ))}
      </div>
    </div>
  )
}
