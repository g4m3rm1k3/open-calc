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
  // Semantic colours
  gold:      '#fbbf24',   // critical points — the "landmarks"
  goldShade: 'rgba(251,191,36,0.10)',
  cyan:      '#22d3ee',   // the curve itself
  cyanShade: 'rgba(34,211,238,0.07)',
  emerald:   '#4ade80',   // f′ > 0 / increasing
  emeraldShade: 'rgba(74,222,128,0.10)',
  rose:      '#fb7185',   // f′ < 0 / decreasing
  roseShade: 'rgba(251,113,133,0.09)',
  violet:    '#a78bfa',   // inflection points
  violetShade: 'rgba(167,139,250,0.09)',
  upShade:   'rgba(34,211,238,0.07)',
  downShade: 'rgba(167,139,250,0.09)',
}

// ─── Tooltip glossary ─────────────────────────────────────────────────────────
const GLOSSARY = {
  "f′": { math: "First Derivative — the slope of f", human: "🔧 The angle of the tool path: positive = climbing, negative = diving, zero = level." },
  "f″": { math: "Second Derivative — the rate of change of slope", human: "🔧 The curvature of the cut: positive (∪) = hollow pocket, negative (∩) = rounded hump." },
  "critical point": { math: "Where f′(x) = 0 or is undefined", human: "🔧 A level-off moment — the peak of a hill or the bottom of a pocket. The tool momentarily moves horizontally." },
  "inflection point": { math: "Where f″ changes sign", human: "🔧 The exact moment a hollow cut becomes a hump (or vice versa). The point of 'straightest' travel." },
  "concave up": { math: "f″ > 0: slope is increasing", human: "🔧 Bowl shape — holds water. The cut curves upward like the bottom of a pocket." },
  "concave down": { math: "f″ < 0: slope is decreasing", human: "🔧 Arch shape — water runs off. The cut curves downward like the top of a bump." },
}

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  {
    id: 'quintic',
    label: 'g(x) = x⁵ − 5x⁴',
    shortLabel: 'x⁵−5x⁴',
    f:   x => x**5 - 5*x**4,
    domain: [-1.2, 5.2],
    yDomain: [-265, 30],
    criticals: [
      { x: 0, label: 'x = 0', type: 'local-max' },
      { x: 4, label: 'x = 4', type: 'local-min' },
    ],
    inflections: [{ x: 3, label: 'x = 3' }],
    fppZeros: [
      { x: 0, changesSign: false },
      { x: 3, changesSign: true },
    ],
    intervals: [
      { xStart: -Infinity, xEnd: 0,        mono: 'inc', concavity: 'down' },
      { xStart: 0,         xEnd: 3,        mono: 'dec', concavity: 'down' },
      { xStart: 3,         xEnd: 4,        mono: 'dec', concavity: 'up'   },
      { xStart: 4,         xEnd: Infinity, mono: 'inc', concavity: 'up'   },
    ],
    steps: [
      {
        stage: 1,
        stageLabel: 'Direction — f′ Sign Chart',
        title: 'Find critical points; map the slope direction',
        math: "g′(x) = 5x³(x − 4) = 0  →  x = 0, x = 4\n\n• x < 0:    g′ > 0  →  INCREASING\n• 0 < x < 4: g′ < 0  →  DECREASING\n• x > 4:    g′ > 0  →  INCREASING",
        human: "Think of this as plotting the tool's travel direction. Before x = 0 the cutter climbs. From x = 0 to 4 it dives. After x = 4 it climbs again.",
        why: "The sign of f′ tells you which way the function is moving, exactly like reading a slope gauge on a CNC surface. Positive slope = uphill cut; negative = downhill cut.",
        reveal: 'fprime-sign',
      },
      {
        stage: 2,
        stageLabel: 'Landmarks — Critical Point Classification',
        title: 'Classify each level-off point — max, min, or just flat?',
        math: "• x = 0: f′ changes + → −  →  LOCAL MAXIMUM  g(0) = 0\n• x = 4: f′ changes − → +  →  LOCAL MINIMUM   g(4) = −256\n\nKey rule: check the SIGN CHANGE, not just that f′ = 0.",
        human: "Any time the tool momentarily levels off (f′ = 0), ask: was it climbing before and diving after? That's a peak. Diving then climbing? That's a pocket-bottom. Same direction both sides? Just a hesitation — no real landmark.",
        why: "Without checking the sign change you might label a flat inflection point as a local extremum — a classic mistake. The sign change is the only reliable test.",
        reveal: 'extrema',
      },
      {
        stage: 3,
        stageLabel: 'Shape — f″ Sign Chart',
        title: 'Map the curvature: hollow or humped?',
        math: "g″(x) = 20x²(x − 3) = 0  →  x = 0, x = 3\n\nKey insight: x² ≥ 0 always, so the sign is set by (x − 3).\n• x < 3:  g″ < 0  →  CONCAVE DOWN  (arch/hump)\n• x > 3:  g″ > 0  →  CONCAVE UP    (bowl/hollow)",
        human: "Think of this as the curvature of the machined surface. Concave up (bowl) means the cut gets shallower then deeper — like the bottom of a pocket. Concave down (arch) means the opposite.",
        why: "f″ controls whether the rate of change speeds up or slows down. That's the difference between a 'decelerating fall' (concave up while descending) and an 'accelerating fall' (concave down while descending).",
        reveal: 'fprimeprime-sign',
      },
      {
        stage: 3,
        stageLabel: 'Shape — Inflection Point Check',
        title: 'Confirm where curvature actually flips',
        math: "• x = 0: g″ < 0 on BOTH sides (concave down everywhere near x = 0)\n         → NOT an inflection point — the f″ = 0 trap!\n         20x² is always ≥ 0, so the sign never flips at x = 0.\n\n• x = 3: g″ changes − → +  →  CONFIRMED inflection  g(3) = −162",
        human: "At x = 0 the curvature gauge reads zero but doesn't flip — like a road that momentarily straightens but stays curving the same way. At x = 3 the curvature genuinely reverses — the hollow becomes a hump.",
        why: "f″(c) = 0 is necessary but NOT sufficient. Many students circle every f″ = 0 as an inflection. Always build the full sign chart to check whether the sign actually changes across that point.",
        reveal: 'inflections',
      },
      {
        stage: 4,
        stageLabel: 'Assembly — Segment-by-Segment',
        title: 'Connect the landmarks with the correct curve shape',
        math: "x → −∞: g → −∞  (tool path comes from far below-left)\n\n(−∞, 0): INCREASING + CONCAVE DOWN → accelerating climb\n  x = 0: peak / local MAX at (0, 0)\n(0, 3):  DECREASING + CONCAVE DOWN → accelerating dive\n  x = 3: inflection — fall decelerates\n(3, 4):  DECREASING + CONCAVE UP   → decelerating fall\n  x = 4: valley / local MIN at (4, −256)\n(4, +∞): INCREASING + CONCAVE UP   → accelerating climb",
        human: "Read this like a CNC tool path description:\n  Entry → climb (gaining speed) → peak → dive (gaining speed) → slow → valley → climb (gaining speed) → exit\nIf you drew this as a motion diagram you'd have: fast up, peak, fast down, inflection kink, slow down, valley, fast up.",
        why: "Each segment gets exactly TWO properties: direction (f′ sign) and curvature (f″ sign). Those two together uniquely determine the visual shape of that piece. There are only four combinations:\n  ↑ ∪  accelerating rise   ↑ ∩  decelerating rise\n  ↓ ∪  decelerating fall   ↓ ∩  accelerating fall",
        reveal: 'full',
      },
      {
        stage: 4,
        stageLabel: 'Verification — Checklist',
        title: 'Use the checklist to eliminate wrong sketches',
        math: "✔ Exactly ONE local max (x = 0) and ONE local min (x = 4)\n✔ x = 0: f′ DOES change sign → IS an extremum\n✔ x = 0: f″ does NOT change sign → NOT an inflection point\n✔ Inflection ONLY at x = 3\n✔ Concave DOWN for all x < 3\n✔ Concave UP for all x > 3\n✔ As x → −∞: g → −∞  (odd-degree positive leading term)\n✔ As x → +∞: g → +∞",
        human: "If you were inspecting a machined surface against this spec, you'd reject any part that:\n  ✗ Has an extra peak or valley not in the spec\n  ✗ Shows a curvature flip at x = 0 (it shouldn't be there)\n  ✗ Doesn't have the hollow-to-hump transition at x = 3",
        why: "A correct qualitative sketch must be consistent with ALL derivative information simultaneously. The checklist is the acceptance test — no single step is the answer, the full picture must be coherent.",
        reveal: 'full',
      },
    ],
  },

  {
    id: 'cubic',
    label: 'f(x) = x³ − 3x',
    shortLabel: 'x³−3x',
    f:   x => x**3 - 3*x,
    domain: [-2.5, 2.5],
    yDomain: [-2.5, 2.5],
    criticals: [
      { x: -1, label: 'x = −1', type: 'local-max' },
      { x:  1, label: 'x = 1',  type: 'local-min' },
    ],
    inflections: [{ x: 0, label: 'x = 0' }],
    fppZeros: [{ x: 0, changesSign: true }],
    intervals: [
      { xStart: -Infinity, xEnd: -1, mono: 'inc', concavity: 'down' },
      { xStart: -1,        xEnd:  0, mono: 'dec', concavity: 'down' },
      { xStart:  0,        xEnd:  1, mono: 'dec', concavity: 'up'   },
      { xStart:  1,        xEnd: Infinity, mono: 'inc', concavity: 'up' },
    ],
    steps: [
      {
        stage: 1,
        stageLabel: 'Direction — f′ Sign Chart',
        title: 'Factor f′ and map each interval\'s travel direction',
        math: "f′(x) = 3x² − 3 = 3(x+1)(x−1) = 0  →  x = −1, x = 1\n\n• x < −1:     f′ > 0  →  INCREASING\n• −1 < x < 1: f′ < 0  →  DECREASING\n• x > 1:      f′ > 0  →  INCREASING",
        human: "The tool climbs until x = −1, dives to x = 1, then climbs again — a classic 'over the hill and through the valley' path.",
        why: "Factoring f′ into (x+1)(x−1) makes the sign chart almost instant: left of both zeros = (+)(−) = negative = wrong. Test one point per interval to confirm.",
        reveal: 'fprime-sign',
      },
      {
        stage: 2,
        stageLabel: 'Landmarks — Critical Point Classification',
        title: 'Sign changes in f′ confirm which landing is a peak vs. valley',
        math: "• x = −1: f′ changes + → −  →  LOCAL MAX  f(−1) = 2\n• x =  1: f′ changes − → +  →  LOCAL MIN  f(1) = −2",
        human: "The hill at x = −1 is at height 2. The valley at x = 1 is at depth −2.",
        why: "Both critical points have genuine sign changes, so both are real extrema — no fake levels here.",
        reveal: 'extrema',
      },
      {
        stage: 3,
        stageLabel: 'Shape — Concavity & Inflection',
        title: 'f″ tells us where the surface switches from hollow to hump',
        math: "f″(x) = 6x = 0  →  x = 0\n\n• x < 0: f″ < 0  →  CONCAVE DOWN (arch)\n• x > 0: f″ > 0  →  CONCAVE UP (bowl)\nf″ changes sign at x = 0  →  CONFIRMED inflection  f(0) = 0",
        human: "The surface arches on the left side and bowls on the right. The crossover happens at the origin — the straightest point of the whole walk-through.",
        why: "Unlike the quintic example, f″ = 6x is a simple line with an obvious sign change at x = 0. No trap here — just one clean inflection.",
        reveal: 'inflections',
      },
      {
        stage: 4,
        stageLabel: 'Assembly — Full Sketch',
        title: 'Connect all landmarks with correct curvature on each piece',
        math: "x → −∞: f → −∞ (comes from far below-left)\n\n(−∞, −1): INCREASING + CONCAVE DOWN → decelerating climb\n  x = −1: local MAX at (−1, 2)\n(−1, 0):  DECREASING + CONCAVE DOWN → accelerating fall\n  x = 0:  inflection — bowl shape starts\n(0, 1):   DECREASING + CONCAVE UP   → decelerating fall\n  x = 1:  local MIN at (1, −2)\n(1, +∞):  INCREASING + CONCAVE UP   → accelerating climb\n\nx → +∞: f → +∞",
        human: "Mountain shape: gentle approach to the summit (decelerating climb), sharp dive off the back (accelerating), then levels into the valley (decelerating), then climbs away fast.",
        why: "Only four segment types exist. This sketch uses all four in sequence: ↑∩, ↓∩, ↓∪, ↑∪. That's the full catalogue — a great reference example.",
        reveal: 'full',
      },
    ],
  },

  {
    id: 'table-only',
    label: 'h — from sign table only',
    shortLabel: 'Table example',
    f: x => (1/5)*x**5 - (5/4)*x**4 + (2/3)*x**3 + 2*x**2 - 10,
    domain: [-3.5, 5],
    yDomain: [-40, 20],
    criticals: [
      { x: -2, label: 'x = −2', type: 'local-min' },
      { x:  3, label: 'x = 3',  type: 'horiz-inflection' },
    ],
    inflections: [
      { x: -1/3, label: 'x ≈ −0.33' },
      { x: 3,    label: 'x = 3' },
    ],
    fppZeros: [
      { x: -1/3, changesSign: true },
      { x: 3,    changesSign: true },
    ],
    intervals: [
      { xStart: -Infinity, xEnd: -2,   mono: 'dec', concavity: 'up'   },
      { xStart: -2,        xEnd: -1/3, mono: 'inc', concavity: 'up'   },
      { xStart: -1/3,      xEnd: 3,    mono: 'inc', concavity: 'down' },
      { xStart: 3,         xEnd: Infinity, mono: 'inc', concavity: 'up' },
    ],
    steps: [
      {
        stage: 1,
        stageLabel: 'Direction — f′ Sign Chart',
        title: 'Read the given sign data for h′',
        math: "Given from table: h′(−2) = 0, h′(3) = 0\n\n• x < −2:     h′ < 0  →  DECREASING\n• −2 < x < 3: h′ > 0  →  INCREASING\n• x > 3:      h′ > 0  →  still INCREASING\n\nNote: f′ > 0 on BOTH sides of x = 3.",
        human: "The tool dives in from the left, hits a valley at x = −2, climbs through x = 3 (barely pausing at a flat spot), then keeps climbing. No true peak — just one valley and one hesitation.",
        why: "The crucial observation: h′ is POSITIVE on both sides of x = 3. It doesn't change sign. So x = 3 is a zero of h′ but NOT an extremum. This is the horizontal-inflection trap.",
        reveal: 'fprime-sign',
      },
      {
        stage: 2,
        stageLabel: 'Landmarks — Critical Point Classification',
        title: 'Only x = −2 is a real extremum; x = 3 is NOT',
        math: "• x = −2: h′ changes − → +  →  LOCAL MINIMUM ✔\n\n• x = 3:  h′ > 0 on (−2, 3) AND on (3, ∞)\n          NO sign change  →  NO extremum ✗\n          This is a horizontal tangent that is ALSO an inflection point.",
        human: "Think of x = 3 as a hill road that briefly levels off (rest stop) but doesn't turn around — you're still heading uphill on both sides. Not a peak. Just a pause.",
        why: "This is the most common mistake on curve-sketching exams: labelling every f′ = 0 as a local extremum. The sign change test eliminates false positives.",
        reveal: 'extrema',
      },
      {
        stage: 3,
        stageLabel: 'Shape — f″ Sign Chart',
        title: 'Map the concavity from the given sign data for h″',
        math: "Given: h″(−⅓) = 0, h″(3) = 0\n\n• x < −⅓:       h″ > 0  →  CONCAVE UP (bowl)\n• −⅓ < x < 3:   h″ < 0  →  CONCAVE DOWN (arch)\n• x > 3:          h″ > 0  →  CONCAVE UP (bowl)",
        human: "The surface profile: bowl coming in from the left, then arches over the middle section, then bowls again on the right. The crossover points are x ≈ −0.33 and x = 3.",
        why: "Three concavity zones means two inflection candidates. Both will be confirmed because h″ genuinely changes sign at each one.",
        reveal: 'fprimeprime-sign',
      },
      {
        stage: 3,
        stageLabel: 'Shape — Inflection Confirmation',
        title: 'Both x = −⅓ and x = 3 are true inflection points',
        math: "• x = −⅓: h″ changes + → −  →  CONFIRMED inflection ✔\n           (still increasing, but curvature flips from bowl to arch)\n\n• x = 3:  h″ changes − → +  →  CONFIRMED inflection ✔\n           (this point has BOTH a flat tangent AND a curvature flip)",
        human: "At x = −⅓: still climbing, but the cut shifts from hollow to humped — like the transition from a rounded valley wall to an overhanging ridge.\n\nAt x = 3: the tool is momentarily level AND it's the exact moment curvature reverses — two things happening at the same point.",
        why: "x = 3 is special: it's simultaneously where h′ = 0 (horizontal tangent) AND where h″ changes sign (curvature flip). A point can be an inflection point even when the slope is zero.",
        reveal: 'inflections',
      },
      {
        stage: 4,
        stageLabel: 'Assembly & Checklist',
        title: 'Build the full path; verify against all constraints',
        math: "(−∞, −2):  DECREASING + CONCAVE UP  → decelerating fall (coming into valley)\n  x = −2:  local MIN\n(−2, −⅓): INCREASING + CONCAVE UP  → accelerating climb\n  x ≈−⅓: inflection — curvature flips\n(−⅓, 3):  INCREASING + CONCAVE DOWN → decelerating climb\n  x = 3:  flat tangent + inflection\n(3, +∞):  INCREASING + CONCAVE UP  → accelerating climb\n\n✔ ONE extremum: local min at x = −2\n✔ Increasing everywhere after x = −2\n✔ Flat tangent at x = 3 — does NOT turn around\n✔ Inflections at x = −⅓ and x = 3",
        human: "The full tool path: swoops into the valley (decelerating), climbs out fast (accelerating), settles into a smooth ramp (decelerating), barely pauses, then accelerates away.",
        why: "Use the checklist as your acceptance test: any sketch that shows a local max, or shows the function decreasing after x = −2, fails the spec. Eliminate those options.",
        reveal: 'full',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function buildCurve(f, domain, yDomain, n = 500) {
  const pts = []
  const dx = (domain[1] - domain[0]) / n
  for (let i = 0; i <= n; i++) {
    const x = domain[0] + i * dx
    const y = f(x)
    if (isFinite(y) && y >= yDomain[0] - 30 && y <= yDomain[1] + 30) pts.push([x, y])
  }
  return pts
}

function svgPath(pts, xs, ys) {
  if (!pts.length) return ''
  let d = `M ${xs(pts[0][0]).toFixed(1)} ${ys(pts[0][1]).toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i][0] - pts[i-1][0]) > 0.3) {
      d += ` M ${xs(pts[i][0]).toFixed(1)} ${ys(pts[i][1]).toFixed(1)}`
    } else {
      d += ` L ${xs(pts[i][0]).toFixed(1)} ${ys(pts[i][1]).toFixed(1)}`
    }
  }
  return d
}

const REVEAL_ORDER = ['fprime-sign', 'extrema', 'fprimeprime-sign', 'inflections', 'full']
const shows = (tag, revealLevel) => REVEAL_ORDER.indexOf(tag) <= revealLevel

// ─── Tooltip component ────────────────────────────────────────────────────────
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
        style={{
          borderBottom: `1px dashed ${C.gold}`,
          cursor: 'help',
          color: C.gold,
          fontWeight: 600,
        }}
      >
        {children}
      </span>
      {open && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 6,
          background: '#1e293b',
          border: `1px solid ${C.gold}`,
          borderRadius: 8,
          padding: '8px 12px',
          width: 240,
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
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
  const stageColors = {
    1: C.emerald,
    2: C.gold,
    3: C.violet,
    4: C.cyan,
  }
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
      {/* Stage badge + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          color, background: `${color}20`,
          padding: '2px 8px', borderRadius: 4,
        }}>
          STAGE {s.stage} · {s.stageLabel}
        </span>
        <span style={{ fontSize: 11, color: C.muted }}>Step {stepNumber}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        {s.title}
      </div>

      {/* Math block */}
      <pre style={{
        background: C.grid,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: '8px 10px',
        fontSize: 12,
        color: C.text,
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: '0 0 8px 0',
        fontFamily: 'monospace',
      }}>
        {s.math}
      </pre>

      {/* Physical intuition block */}
      <div style={{
        background: 'rgba(251,191,36,0.06)',
        border: `1px solid ${C.gold}22`,
        borderRadius: 6,
        padding: '7px 10px',
        marginBottom: 8,
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🔧</span>
        <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>Physical read: </span>
          {s.human}
        </div>
      </div>

      {/* Why / decision logic */}
      {isLatest && (
        <div style={{
          background: `${color}0d`,
          border: `1px solid ${color}33`,
          borderRadius: 6,
          padding: '7px 10px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>💡</span>
          <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            <span style={{ color, fontWeight: 700 }}>Why this matters: </span>
            {s.why}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sign chart strip ─────────────────────────────────────────────────────────
function SignStrip({ label, strips, domain, dots, getSign, getLabel, posColor, negColor }) {
  const ref = useRef(null)
  const [w, setW] = useState(500)
  useEffect(() => {
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width))
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  const L = 38, R = 8, H = 44
  const pw = w - L - R
  const xs = x => L + ((x - domain[0]) / (domain[1] - domain[0])) * pw

  return (
    <div ref={ref} style={{ borderTop: `1px solid ${C.border}` }}>
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`}
        style={{ display: 'block', width: '100%', height: 'auto' }}>
        <rect width={w} height={H} fill={C.bg} />
        <text x={L - 5} y={H / 2 + 4} textAnchor="end" fontSize={10}
          fill={C.muted} fontStyle="italic">{label}</text>
        {strips.map((s, i) => {
          const x0 = Math.max(xs(s.lo), L), x1 = Math.min(xs(s.hi), L + pw)
          if (x1 <= x0) return null
          const sign = getSign(s), lbl = getLabel(s)
          const col = sign === '+' ? posColor : negColor
          const bg = sign === '+' ? `${posColor}14` : `${negColor}12`
          return (
            <g key={i}>
              <rect x={x0 + 1} y={3} width={x1 - x0 - 2} height={H - 6} fill={bg} rx={3} />
              <text x={(x0 + x1) / 2} y={19} textAnchor="middle"
                fontSize={14} fontWeight={700} fill={col}>{sign}</text>
              <text x={(x0 + x1) / 2} y={33} textAnchor="middle"
                fontSize={8} fill={col}>{lbl}</text>
            </g>
          )
        })}
        {dots.map(cx => {
          const sx = xs(cx)
          if (sx < L || sx > L + pw) return null
          return (
            <g key={cx}>
              <line x1={sx} y1={0} x2={sx} y2={H} stroke={C.gold} strokeWidth={1.5} />
              <circle cx={sx} cy={H / 2} r={3.5} fill={C.gold} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DerivativeSketchWalkthrough() {
  const [presetIdx, setPresetIdx] = useState(0)
  const [rawStep, setRawStep] = useState(0)
  const containerRef = useRef(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const ro = new ResizeObserver(e => setWidth(e[0].contentRect.width))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const preset = PRESETS[presetIdx]
  const step = Math.min(rawStep, preset.steps.length - 1)

  useEffect(() => { setRawStep(0) }, [presetIdx])

  const currentReveal = preset.steps[step]?.reveal ?? 'fprime-sign'
  const revealLevel = REVEAL_ORDER.indexOf(currentReveal)
  const show = tag => shows(tag, revealLevel)

  // Graph layout
  const W = Math.max(width, 300)
  const H = Math.round(W * 0.48)
  const PAD = { l: 44, r: 12, t: 14, b: 28 }
  const pw = W - PAD.l - PAD.r
  const ph = H - PAD.t - PAD.b

  const { domain, yDomain } = preset
  const xs = x => PAD.l + ((x - domain[0]) / (domain[1] - domain[0])) * pw
  const ys = y => PAD.t + (1 - (y - yDomain[0]) / (yDomain[1] - yDomain[0])) * ph

  const curve = buildCurve(preset.f, domain, yDomain)
  const curvePath = svgPath(curve, xs, ys)

  // Strip data
  const specialX = [
    ...preset.criticals.map(c => c.x),
    ...preset.inflections.map(c => c.x),
  ].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b)

  const strips = (() => {
    const bounds = [domain[0], ...specialX, domain[1]].sort((a, b) => a - b)
    return bounds.slice(0, -1).map((lo, i) => {
      const hi = bounds[i + 1]
      const mid = (lo + hi) / 2
      const iv = preset.intervals.find(v => v.xStart <= mid && v.xEnd >= mid)
      return { lo, hi, mono: iv?.mono ?? 'inc', conc: iv?.concavity ?? 'up' }
    })
  })()

  // x-axis ticks
  const span = domain[1] - domain[0]
  const tickStep = span > 8 ? 2 : 1
  const xTicks = []
  for (let x = Math.ceil(domain[0]); x <= Math.floor(domain[1]); x += tickStep) xTicks.push(x)

  // y-axis ticks
  const ySpan = yDomain[1] - yDomain[0]
  const yTickStep = ySpan > 200 ? 100 : ySpan > 80 ? 50 : ySpan > 20 ? 20 : ySpan > 6 ? 2 : 1
  const yTicks = []
  for (let y = Math.ceil(yDomain[0] / yTickStep) * yTickStep; y <= yDomain[1]; y += yTickStep) yTicks.push(y)

  const stepCount = preset.steps.length

  return (
    <div ref={containerRef} style={{
      background: C.bg,
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <span style={{ color: C.cyan, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
              SKETCH FROM DERIVATIVES
            </span>
            <span style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>
              — hover the{' '}
              <Tip term="f′">f′</Tip>,{' '}
              <Tip term="f″">f″</Tip>,{' '}
              <Tip term="critical point">critical point</Tip>,{' '}
              <Tip term="inflection point">inflection point</Tip>{' '}
              labels to see physical explanations
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => (
              <button key={p.id} onClick={() => setPresetIdx(i)} style={{
                padding: '3px 10px', borderRadius: 5, fontSize: 11, fontFamily: 'monospace',
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${i === presetIdx ? C.cyan : C.border}`,
                background: i === presetIdx ? `${C.cyan}20` : 'transparent',
                color: i === presetIdx ? C.cyan : C.muted,
              }}>{p.shortLabel}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Graph ──────────────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', width: '100%', height: 'auto' }}>
          <rect width={W} height={H} fill={C.bg} />
          <rect x={PAD.l} y={PAD.t} width={pw} height={ph} fill={C.surface} rx={3} />

          {/* f′ monotonicity shading */}
          {show('fprime-sign') && strips.map((s, i) => {
            const x0 = Math.max(xs(s.lo), PAD.l), x1 = Math.min(xs(s.hi), PAD.l + pw)
            if (x1 <= x0) return null
            return <rect key={`m${i}`} x={x0} y={PAD.t} width={x1 - x0} height={ph}
              fill={s.mono === 'inc' ? C.emeraldShade : C.roseShade} />
          })}
          {/* f″ concavity shading */}
          {show('fprimeprime-sign') && strips.map((s, i) => {
            const x0 = Math.max(xs(s.lo), PAD.l), x1 = Math.min(xs(s.hi), PAD.l + pw)
            if (x1 <= x0) return null
            return <rect key={`c${i}`} x={x0} y={PAD.t} width={x1 - x0} height={ph}
              fill={s.conc === 'up' ? C.upShade : C.downShade} opacity={0.8} />
          })}

          {/* Grid */}
          {yTicks.map(y => <line key={`gy${y}`}
            x1={PAD.l} y1={ys(y)} x2={PAD.l + pw} y2={ys(y)}
            stroke={y === 0 ? C.axis : C.grid} strokeWidth={y === 0 ? 1.5 : 0.75} />)}
          {xTicks.map(x => <line key={`gx${x}`}
            x1={xs(x)} y1={PAD.t} x2={xs(x)} y2={PAD.t + ph}
            stroke={x === 0 ? C.axis : C.grid} strokeWidth={x === 0 ? 1.5 : 0.75} />)}

          {/* Axis labels */}
          {xTicks.map(x => <text key={`xt${x}`} x={xs(x)} y={PAD.t + ph + 16}
            textAnchor="middle" fontSize={9} fill={C.muted}>{x}</text>)}
          {yTicks.map(y => <text key={`yt${y}`} x={PAD.l - 5} y={ys(y) + 3.5}
            textAnchor="end" fontSize={9} fill={C.muted}>{y}</text>)}

          {/* Critical verticals */}
          {show('fprime-sign') && preset.criticals.map(c => (
            <line key={`cv${c.x}`} x1={xs(c.x)} y1={PAD.t} x2={xs(c.x)} y2={PAD.t + ph}
              stroke={C.gold} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.7} />
          ))}
          {/* Inflection verticals */}
          {show('inflections') && preset.inflections.map(ip => (
            <line key={`iv${ip.x}`} x1={xs(ip.x)} y1={PAD.t} x2={xs(ip.x)} y2={PAD.t + ph}
              stroke={C.violet} strokeWidth={1.2} strokeDasharray="3 2" opacity={0.6} />
          ))}

          {/* Full curve */}
          {show('full') && <path d={curvePath} fill="none" stroke={C.cyan} strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" />}

          {/* Extremum dots + labels */}
          {show('extrema') && preset.criticals.map(c => {
            const fy = preset.f(c.x), sy = ys(fy)
            const inBounds = sy >= PAD.t && sy <= PAD.t + ph
            const col = c.type === 'local-max' ? C.emerald : c.type === 'local-min' ? C.rose : C.gold
            const sym = c.type === 'local-max' ? '▲' : c.type === 'local-min' ? '▼' : '●'
            return (
              <g key={`ex${c.x}`}>
                {show('full') && inBounds &&
                  <circle cx={xs(c.x)} cy={sy} r={6} fill={col} stroke={C.bg} strokeWidth={2} />}
                <text x={xs(c.x)} y={c.type === 'local-max' ? PAD.t + 16 : PAD.t + ph - 6}
                  textAnchor="middle" fontSize={9} fill={col} fontWeight={700}>{sym} {c.label}</text>
              </g>
            )
          })}
          {/* Inflection dots */}
          {show('inflections') && preset.inflections.map(ip => {
            const fy = preset.f(ip.x), sy = ys(fy)
            const inBounds = sy >= PAD.t && sy <= PAD.t + ph
            return (
              <g key={`ip${ip.x}`}>
                {show('full') && inBounds &&
                  <circle cx={xs(ip.x)} cy={sy} r={5} fill={C.violet} stroke={C.bg} strokeWidth={2} />}
                <text x={xs(ip.x)} y={PAD.t + ph / 2}
                  textAnchor="middle" fontSize={9} fill={C.violet} fontWeight={700}>◆</text>
              </g>
            )
          })}

          {/* Legend (top-left of plot) */}
          <g transform={`translate(${PAD.l + 5},${PAD.t + 5})`}>
            {show('full') && <>
              <line x1={0} y1={7} x2={18} y2={7} stroke={C.cyan} strokeWidth={2.5} />
              <text x={21} y={11} fontSize={9} fill={C.cyan}>{preset.shortLabel}</text>
            </>}
            {show('fprime-sign') && <>
              <rect x={0} y={15} width={18} height={7} fill={C.emeraldShade} stroke={C.emerald} strokeWidth={0.5} rx={2} />
              <text x={21} y={22} fontSize={8} fill={C.emerald}>f′ &gt; 0 ↑</text>
              <rect x={0} y={25} width={18} height={7} fill={C.roseShade} stroke={C.rose} strokeWidth={0.5} rx={2} />
              <text x={21} y={32} fontSize={8} fill={C.rose}>f′ &lt; 0 ↓</text>
            </>}
            {show('fprimeprime-sign') && <>
              <rect x={0} y={35} width={18} height={7} fill={C.upShade} stroke={C.cyan} strokeWidth={0.5} rx={2} />
              <text x={21} y={42} fontSize={8} fill={C.cyan}>f″ &gt; 0 ∪</text>
              <rect x={0} y={45} width={18} height={7} fill={C.downShade} stroke={C.violet} strokeWidth={0.5} rx={2} />
              <text x={21} y={52} fontSize={8} fill={C.violet}>f″ &lt; 0 ∩</text>
            </>}
          </g>
        </svg>

        {/* Sign chart strips */}
        {show('fprime-sign') && (
          <SignStrip label="f ′" strips={strips} domain={domain}
            dots={preset.criticals.map(c => c.x)}
            getSign={s => s.mono === 'inc' ? '+' : '−'}
            getLabel={s => s.mono === 'inc' ? 'inc ↑' : 'dec ↓'}
            posColor={C.emerald} negColor={C.rose} />
        )}
        {show('fprimeprime-sign') && (
          <SignStrip label="f ″" strips={strips} domain={domain}
            dots={preset.fppZeros.map(c => c.x)}
            getSign={s => s.conc === 'up' ? '+' : '−'}
            getLabel={s => s.conc === 'up' ? 'up ∪' : 'dn ∩'}
            posColor={C.cyan} negColor={C.violet} />
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {preset.steps.map((s, i) => {
            const isActive = i === step
            const isDone = i < step
            const col = [C.emerald, C.gold, C.violet, C.cyan][s.stage - 1] ?? C.muted
            return (
              <div key={i} onClick={() => setRawStep(i)}
                title={`Step ${i + 1}: ${s.stageLabel}`}
                style={{
                  width: isActive ? 9 : 7, height: isActive ? 9 : 7,
                  borderRadius: '50%',
                  background: isActive ? col : isDone ? `${col}80` : C.border,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: isActive ? `2px solid ${col}` : 'none',
                  outlineOffset: 2,
                }} />
            )
          })}
        </div>

        <span style={{ color: C.muted, fontSize: 11 }}>
          Step <span style={{ color: C.text, fontWeight: 700 }}>{step + 1}</span> / {stepCount}
        </span>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setRawStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{
              padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              cursor: step === 0 ? 'default' : 'pointer',
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: step === 0 ? C.faint : C.muted,
            }}>← Back</button>
          <button onClick={() => setRawStep(s => Math.min(stepCount - 1, s + 1))} disabled={step === stepCount - 1}
            style={{
              padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              cursor: step === stepCount - 1 ? 'default' : 'pointer',
              border: `1px solid ${step === stepCount - 1 ? C.border : C.cyan}`,
              background: step === stepCount - 1 ? 'transparent' : `${C.cyan}18`,
              color: step === stepCount - 1 ? C.faint : C.cyan,
            }}>Next →</button>
        </div>
      </div>

      {/* ── Step log (stacks) ───────────────────────────────────────── */}
      <div style={{ padding: '12px 12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...preset.steps.slice(0, step + 1)].reverse().map((s, i, arr) => (
          <StepCard key={`${preset.id}-${step - i}`} step={s} isLatest={i === 0} stepNumber={step - i + 1} />
        ))}
      </div>

      {/* ── Symbol key footer ───────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: '8px 16px',
        display: 'flex', flexWrap: 'wrap', gap: '4px 18px',
        background: C.surface,
      }}>
        {[
          { sym: '▲', col: C.emerald, text: 'Local MAX' },
          { sym: '▼', col: C.rose,    text: 'Local MIN' },
          { sym: '●', col: C.gold,    text: 'Flat tangent (no extremum)' },
          { sym: '◆', col: C.violet,  text: 'Inflection point' },
          { sym: '──', col: C.cyan,   text: 'f(x) curve' },
        ].map(item => (
          <span key={item.sym} style={{ fontSize: 10.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: item.col }}>{item.sym}</span>{item.text}
          </span>
        ))}
      </div>
    </div>
  )
}
