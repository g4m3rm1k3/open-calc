import { useState, useEffect } from 'react'

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
    bg:       dark ? '#0f172a' : '#f8fafc',
    surface:  dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9',
    border:   dark ? '#334155' : '#e2e8f0',
    text:     dark ? '#e2e8f0' : '#1e293b',
    muted:    dark ? '#94a3b8' : '#64748b',
    hint:     dark ? '#475569' : '#94a3b8',
    blue:     dark ? '#38bdf8' : '#0284c7',
    blueBg:   dark ? 'rgba(56,189,248,0.12)'  : 'rgba(2,132,199,0.08)',
    blueBd:   dark ? '#38bdf8' : '#0284c7',
    amber:    dark ? '#fbbf24' : '#d97706',
    amberBg:  dark ? 'rgba(251,191,36,0.12)'  : 'rgba(217,119,6,0.08)',
    amberBd:  dark ? '#fbbf24' : '#d97706',
    green:    dark ? '#4ade80' : '#16a34a',
    greenBg:  dark ? 'rgba(74,222,128,0.12)'  : 'rgba(22,163,74,0.08)',
    greenBd:  dark ? '#4ade80' : '#16a34a',
    red:      dark ? '#f87171' : '#dc2626',
    redBg:    dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)',
    redBd:    dark ? '#f87171' : '#dc2626',
    purple:   dark ? '#a78bfa' : '#7c3aed',
    purpleBg: dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)',
    purpleBd: dark ? '#a78bfa' : '#7c3aed',
    teal:     dark ? '#2dd4bf' : '#0d9488',
    tealBg:   dark ? 'rgba(45,212,191,0.12)'  : 'rgba(13,148,136,0.08)',
    tealBd:   dark ? '#2dd4bf' : '#0d9488',
  }
}

function Heading({ children, C }) {
  return <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{children}</h3>
}
function Para({ children, C }) {
  return <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, marginBottom: 10 }}>{children}</p>
}
function Strong({ children }) { return <span style={{ fontWeight: 500 }}>{children}</span> }
function AhaBox({ title, children, C }) {
  return <div style={{ background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 10 }}>
    <div style={{ fontSize: 14, fontWeight: 500, color: C.green, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: C.green, lineHeight: 1.65 }}>{children}</div>
  </div>
}
function WarnBox({ title, children, C }) {
  return <div style={{ background: C.redBg, border: `1px solid ${C.redBd}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 10 }}>
    <div style={{ fontSize: 14, fontWeight: 500, color: C.red, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: C.red, lineHeight: 1.65 }}>{children}</div>
  </div>
}
function CodeBox({ children, C }) {
  return <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: C.text, lineHeight: 2, marginBottom: 10, whiteSpace: 'pre-wrap' }}>{children}</div>
}
function WhyBox({ children, C }) {
  return <div style={{ background: C.greenBg, borderLeft: `3px solid ${C.greenBd}`, borderRadius: '0 6px 6px 0', padding: '10px 14px', marginBottom: 12 }}>
    <p style={{ fontSize: 13, color: C.green, lineHeight: 1.65, margin: 0 }}>{children}</p>
  </div>
}
function Pill({ label, color, C }) {
  const map = { green: [C.greenBg, C.green], purple: [C.purpleBg, C.purple], red: [C.redBg, C.red], blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber] }
  const [bg, tc] = map[color] || map.blue
  return <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 6, background: bg, color: tc, fontWeight: 500, margin: '2px 2px 4px 0' }}>{label}</span>
}
function StepNum({ n, C }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: C.surface2, border: `0.5px solid ${C.border}`, fontSize: 11, color: C.muted, flexShrink: 0, marginRight: 8 }}>{n}</span>
}

// ── Matrix display helper ─────────────────────────────────────
function MatRow({ row, pivots, isAug, C }) {
  return <div style={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 3 }}>
    {row.map((v, ci) => {
      const isAugSep = ci === 3
      const isPivot = pivots && pivots.includes(ci) && v !== 0 && row.slice(0, ci).every(x => x === 0)
      const bg = isPivot ? C.greenBg : 'transparent'
      const clr = isPivot ? C.green : v === 0 ? C.hint : C.text
      const val = Number.isInteger(v) ? v : parseFloat(v.toFixed(2))
      return <span key={ci} style={{
        fontFamily: 'monospace', fontSize: 13,
        width: isAugSep ? 46 : 38, textAlign: 'right',
        padding: '2px 4px', borderRadius: 3,
        background: bg, color: clr,
        borderLeft: isAugSep ? `2px solid ${C.border}` : 'none',
        marginLeft: isAugSep ? 4 : 0,
      }}>{val}</span>
    })}
  </div>
}

// ── Row reducer logic ─────────────────────────────────────────
function computeRREF(m) {
  const mat = m.map(r => [...r])
  const rows = mat.length, cols = mat[0].length
  let pr = 0
  for (let c = 0; c < cols - 1; c++) {
    let pivotR = -1
    for (let r = pr; r < rows; r++) { if (Math.abs(mat[r][c]) > 0.0001) { pivotR = r; break } }
    if (pivotR < 0) continue
    ;[mat[pr], mat[pivotR]] = [mat[pivotR], mat[pr]]
    const sc = mat[pr][c]
    mat[pr] = mat[pr].map(v => parseFloat((v / sc).toFixed(6)))
    for (let r = 0; r < rows; r++) {
      if (r !== pr && Math.abs(mat[r][c]) > 0.0001) {
        const f = mat[r][c]
        mat[r] = mat[r].map((v, j) => parseFloat((v - f * mat[pr][j]).toFixed(6)))
      }
    }
    pr++
  }
  return mat
}

function readSolution(mat) {
  const r = computeRREF(mat.map(row => [...row]))
  if (r.some(row => row.slice(0, 3).every(v => Math.abs(v) < 0.001) && Math.abs(row[3]) > 0.001)) return 'inconsistent — no solution'
  const pivs = []
  r.forEach((row, i) => {
    const p = row.findIndex((v, j) => j < 3 && Math.abs(v - 1) < 0.001 && row.slice(0, j).every(x => Math.abs(x) < 0.001))
    if (p >= 0) pivs.push({ row: i, col: p })
  })
  if (pivs.length === 3) {
    const vars = ['x', 'y', 'z']
    return `unique: ${pivs.map(({ row, col }) => `${vars[col]}=${parseFloat(r[row][3].toFixed(3))}`).join(', ')}`
  }
  return `${pivs.length} pivots — infinitely many solutions`
}

// ── Data ──────────────────────────────────────────────────────
const STEPS = [
  { label: 'Write the augmented matrix', mat: [[1,1,1,6],[2,1,-3,-5],[3,-2,1,2]], op: '', pivots: [] },
  { label: 'R₂ → R₂ − 2R₁  (eliminate x from row 2)', mat: [[1,1,1,6],[0,-1,-5,-17],[3,-2,1,2]], op: 'R₂ − 2R₁: [2−2, 1−2, −3−2, −5−12] = [0, −1, −5, −17]', pivots: [0] },
  { label: 'R₃ → R₃ − 3R₁  (eliminate x from row 3)', mat: [[1,1,1,6],[0,-1,-5,-17],[0,-5,-2,-16]], op: 'R₃ − 3R₁: [3−3, −2−3, 1−3, 2−18] = [0, −5, −2, −16]', pivots: [0] },
  { label: 'R₂ → −R₂  (make pivot positive)', mat: [[1,1,1,6],[0,1,5,17],[0,-5,-2,-16]], op: 'R₂ × −1: [0, 1, 5, 17]', pivots: [0, 1] },
  { label: 'R₃ → R₃ + 5R₂  (eliminate y from row 3)', mat: [[1,1,1,6],[0,1,5,17],[0,0,23,69]], op: 'R₃ + 5R₂: [0, −5+5, −2+25, −16+85] = [0, 0, 23, 69]', pivots: [0, 1] },
  { label: 'R₃ → (1/23)R₃  (make pivot = 1)', mat: [[1,1,1,6],[0,1,5,17],[0,0,1,3]], op: 'R₃ ÷ 23: [0, 0, 1, 3]  — now in REF', pivots: [0, 1, 2] },
  { label: 'R₂ → R₂ − 5R₃  (eliminate z from row 2)', mat: [[1,1,1,6],[0,1,0,2],[0,0,1,3]], op: 'R₂ − 5R₃: [0, 1−0, 5−5, 17−15] = [0, 1, 0, 2]', pivots: [0, 1, 2] },
  { label: 'R₁ → R₁ − R₃  (eliminate z from row 1)', mat: [[1,1,0,3],[0,1,0,2],[0,0,1,3]], op: 'R₁ − R₃: [1, 1, 1−1, 6−3] = [1, 1, 0, 3]', pivots: [0, 1, 2] },
  { label: 'R₁ → R₁ − R₂  — RREF complete', mat: [[1,0,0,1],[0,1,0,2],[0,0,1,3]], op: 'R₁ − R₂: [1, 1−1, 0, 3−2] = [1, 0, 0, 1]\n\nRREF complete. x=1, y=2, z=3\nCheck: 1+2+3=6 ✓   2(1)+2−9=−5 ✓   3−4+3=2 ✓', pivots: [0, 1, 2] },
]

const PRESETS = [
  [[1,2,-1,3],[2,-1,1,1],[3,1,2,5]],
  [[1,2,-1,3],[2,4,-2,6],[1,-1,1,2]],
  [[1,1,1,5],[2,2,2,9],[1,-1,1,1]],
]

const PRACTICE = [
  {
    ctx: 'Canonical — 2×2 system',
    q: `Solve by row reduction (show augmented matrix and every ERO):\n   3x + 2y = 12\n    x −  y = 1`,
    a: `Augmented:
[ 3   2 | 12 ]
[ 1  −1 |  1 ]

R₁ ↔ R₂:
[ 1  −1 |  1 ]
[ 3   2 | 12 ]

R₂ → R₂ − 3R₁:
[ 1  −1 |  1 ]
[ 0   5 |  9 ]

R₂ → (1/5)R₂:
[ 1  −1 |  1  ]
[ 0   1 | 9/5 ]

R₁ → R₁ + R₂:
[ 1   0 | 14/5 ]
[ 0   1 |  9/5 ]

Solution: x = 14/5 = 2.8,  y = 9/5 = 1.8
Check: 3(2.8) + 2(1.8) = 8.4 + 3.6 = 12 ✓   2.8 − 1.8 = 1 ✓`,
  },
  {
    ctx: 'Identifying the solution type',
    q: `Without solving fully, determine whether this system is consistent,\nand if consistent whether it has unique or infinite solutions:\n   x + 2y − z = 3\n  2x + 4y − 2z = 6\n   x −  y +  z = 2`,
    a: `Augmented:
[ 1   2  −1 | 3 ]
[ 2   4  −2 | 6 ]
[ 1  −1   1 | 2 ]

R₂ → R₂ − 2R₁ → [0, 0, 0, 0]  ← row 2 is exactly 2× row 1

R₃ → R₃ − R₁ → [0, −3, 2, −1]

[ 1   2  −1 |  3 ]
[ 0   0   0 |  0 ]   ← zero row (no contradiction)
[ 0  −3   2 | −1 ]

2 pivot columns, 3 variables → 1 free variable → INFINITELY MANY SOLUTIONS.
The system IS consistent (no row "0 = nonzero").`,
  },
  {
    ctx: 'CNC context — real application',
    q: `A 2-axis robot arm has two encoder constraints:\n   Encoder 1: 4x + 3y = 18 (mm)\n   Encoder 2: 2x −  y = 4  (mm)\nFind the end-effector position (x, y).`,
    a: `Augmented:
[ 4   3 | 18 ]
[ 2  −1 |  4 ]

R₁ ↔ R₂:
[ 2  −1 |  4 ]
[ 4   3 | 18 ]

R₂ → R₂ − 2R₁:
[ 2  −1 |  4 ]
[ 0   5 | 10 ]

R₂ → (1/5)R₂:
[ 2  −1 |  4 ]
[ 0   1 |  2 ]

R₁ → R₁ + R₂:
[ 2   0 |  6 ]  → R₁ → (1/2)R₁ → [1  0 | 3]
[ 0   1 |  2 ]

End-effector position: x = 3 mm,  y = 2 mm
Check: 4(3)+3(2) = 18 ✓   2(3)−2 = 4 ✓`,
  },
  {
    ctx: 'Free variables — parametric solution',
    q: `Solve and write in parametric form:\n   x₁ + 2x₂ − x₃ = 4\n  2x₁ + 4x₂ + x₃ = 7`,
    a: `Augmented:
[ 1   2  −1 |  4 ]
[ 2   4   1 |  7 ]

R₂ → R₂ − 2R₁:
[ 1   2  −1 |  4  ]
[ 0   0   3 | −1  ]

R₂ → (1/3)R₂:
[ 1   2  −1 |  4   ]
[ 0   0   1 | −1/3 ]

R₁ → R₁ + R₂:
[ 1   2   0 | 11/3 ]
[ 0   0   1 | −1/3 ]

Pivot cols: 1 and 3  →  x₁, x₃ are basic
Non-pivot col: 2     →  x₂ is FREE (let x₂ = t)

From row 2: x₃ = −1/3
From row 1: x₁ + 2t = 11/3  →  x₁ = 11/3 − 2t

Parametric solution:
  x₁ = 11/3 − 2t
  x₂ = t          (t ∈ ℝ)
  x₃ = −1/3`,
  },
  {
    ctx: 'Challenge — 3×3 inconsistent system',
    q: `Show this system has no solution by row reduction:\n    x + y + z = 5\n   2x + 2y + 2z = 9\n    x − y + z = 1`,
    a: `Augmented:
[ 1   1   1 |  5 ]
[ 2   2   2 |  9 ]
[ 1  −1   1 |  1 ]

R₂ → R₂ − 2R₁:
[0, 0, 0, 9−10] = [0, 0, 0, −1]

[ 1   1   1 |  5 ]
[ 0   0   0 | −1 ]   ← THIS ROW says 0x+0y+0z = −1
[ 1  −1   1 |  1 ]

That row says 0 = −1, which is IMPOSSIBLE.
System is INCONSISTENT — no solution.

Physical: row 2 (2x+2y+2z=9) is exactly 2× row 1 (x+y+z=5 → 2×=10).
But 9 ≠ 10. These planes never intersect.`,
  },
]

// ── Pages ─────────────────────────────────────────────────────

function PageConcept({ C }) {
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.blue, background: C.blueBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Module 1 — Linear Systems & Row Reduction</div>
    <WhyBox C={C}>
      <strong style={{ fontWeight: 500 }}>Why this exists:</strong> Any time you have multiple unknowns constrained by multiple equations, you have a linear system. CNC controllers, circuit solvers, structural FEA, computer graphics pipelines — they all reduce to this exact operation. Row reduction is how you solve them systematically, every time, without guessing.
    </WhyBox>

    <Heading C={C}>What a linear equation is</Heading>
    <Para C={C}>A <Strong>linear equation</Strong> in variables x₁…xₙ has the form a₁x₁ + a₂x₂ + … + aₙxₙ = b. "Linear" means no variable is squared, multiplied by another variable, or inside a function.</Para>
    <CodeBox C={C}>{`2x + 3y − z = 7   ✓ linear
x² + y = 5        ✗ not linear (x squared)
x·y = 3           ✗ not linear (product of unknowns)
4x₁ − x₂ + 6x₃ = 0  ✓ linear`}</CodeBox>

    <Heading C={C}>Three possible outcomes — always exactly one of these</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
      <div style={{ background: C.greenBg, borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ fontSize: 11, color: C.green, marginBottom: 3 }}>Unique solution</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.green }}>Lines cross once</div>
      </div>
      <div style={{ background: C.redBg, borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ fontSize: 11, color: C.red, marginBottom: 3 }}>No solution</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.red }}>Lines parallel (inconsistent)</div>
      </div>
    </div>
    <div style={{ background: C.purpleBg, borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: C.purple, marginBottom: 3 }}>Infinitely many solutions</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: C.purple }}>Same line — free variable(s)</div>
    </div>

    <Heading C={C}>The augmented matrix</Heading>
    <Para C={C}>Every system maps to a matrix. Append the constants as column b to get the augmented matrix [A|b]. Missing variables get coefficient 0 — never skip a slot.</Para>
    <CodeBox C={C}>{`System:            Augmented [A|b]:
2x + 3y − z = 1   [ 2   3  −1 | 1 ]
 x −  y + 2z = 4   [ 1  −1   2 | 4 ]
3x + 2y +  z = 5   [ 3   2   1 | 5 ]`}</CodeBox>

    <Heading C={C}>Three elementary row operations (EROs)</Heading>
    <Para C={C}>These are the only legal moves. Each one preserves the solution set.</Para>
    {[
      ['Swap', 'Rᵢ ↔ Rⱼ — changes order, not solution'],
      ['Scale', 'Rᵢ → kRᵢ (k ≠ 0) — same as multiplying both sides of an equation'],
      ['Replace', 'Rᵢ → Rᵢ + kRⱼ — adding a multiple of one equation to another'],
    ].map(([name, desc], i) => (
      <div key={i} style={{ background: C.surface2, borderRadius: 6, padding: '10px 14px', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <StepNum n={i + 1} C={C} />
        <span style={{ fontSize: 13, color: C.muted }}><strong style={{ fontWeight: 500, color: C.text }}>{name}:</strong> {desc}</span>
      </div>
    ))}

    <Heading C={C}>REF and RREF</Heading>
    <Para C={C}><Strong>Row echelon form (REF):</Strong> staircase of pivots, zeros below each pivot, zero rows at bottom.</Para>
    <Para C={C}><Strong>Reduced REF (RREF):</Strong> REF plus every pivot = 1 and zeros above pivots too. Solution reads directly from the last column.</Para>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
      <Pill label="consistent = ≥1 solution" color="green" C={C} />
      <Pill label="0 = nonzero row → inconsistent" color="red" C={C} />
      <Pill label="free variable = ∞ solutions" color="purple" C={C} />
      <Pill label="n pivots in n vars = unique" color="blue" C={C} />
    </div>
    <AhaBox title="The core insight" C={C}>
      Row operations turn an opaque system of equations into a transparent staircase. Every step preserves all solutions while making the structure clearer. RREF is the end state where each variable's value (or freedom) is immediately readable.
    </AhaBox>
  </>
}

function PageCanonical({ C }) {
  const [cur, setCur] = useState(0)
  const s = STEPS[cur]
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.amber, background: C.amberBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Step-through — 3×3 complete row reduction</div>
    <Heading C={C}>Solve step by step: x + y + z = 6, 2x + y − 3z = −5, 3x − 2y + z = 2</Heading>
    <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: C.hint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Augmented matrix</div>
      {s.mat.map((row, ri) => <MatRow key={ri} row={row} pivots={s.pivots} isAug C={C} />)}
    </div>
    {s.op && (
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontFamily: 'monospace', fontSize: 12, color: C.muted, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
        {s.op}
      </div>
    )}
    <div style={{ fontSize: 12, color: C.hint, marginBottom: 12 }}>Step {cur + 1} of {STEPS.length}: <span style={{ color: C.text }}>{s.label}</span></div>
    <div style={{ display: 'flex', gap: 8 }}>
      <button disabled={cur === 0} onClick={() => setCur(c => c - 1)}
        style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: `0.5px solid ${C.border}`, background: 'transparent', color: cur === 0 ? C.hint : C.text, cursor: cur === 0 ? 'default' : 'pointer', opacity: cur === 0 ? 0.4 : 1 }}>← Back</button>
      <button disabled={cur === STEPS.length - 1} onClick={() => setCur(c => c + 1)}
        style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: 'none', background: cur === STEPS.length - 1 ? C.hint : C.blue, color: '#fff', cursor: cur === STEPS.length - 1 ? 'default' : 'pointer' }}>
        {cur === STEPS.length - 1 ? 'Done' : 'Next step →'}</button>
      <button onClick={() => setCur(0)}
        style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: `0.5px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer' }}>Reset</button>
    </div>
    {cur === STEPS.length - 1 && (
      <AhaBox title="RREF reached" C={C} style={{ marginTop: 12 }}>
        Identity on the left, solution on the right: x = 1, y = 2, z = 3. No back-substitution needed — you read the answer directly.
      </AhaBox>
    )}
  </>
}

function PageRealWorld({ C }) {
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.green, background: C.greenBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Real World — CNC Machine Positioning</div>
    <WhyBox C={C}>
      A CNC controller reads multiple sensors simultaneously. Each sensor gives one linear constraint on the tool's position. The controller solves the resulting linear system in real time — exactly what you do by hand in this module.
    </WhyBox>

    <Heading C={C}>The setup</Heading>
    <Para C={C}>A 3-axis mill has position encoders on X, Y, Z. After a tool change, three encoder cross-checks give:</Para>
    <CodeBox C={C}>{`Encoder A:  2x + y + z = 10   (combined X+Y+Z reading)
Encoder B:   x − y + z =  2   (differential XZ vs Y)
Encoder C:   x + y − z =  0   (XY plane check)`}</CodeBox>
    <Para C={C}>The controller writes this as an augmented matrix and row-reduces:</Para>
    <CodeBox C={C}>{`Step 1 — augmented matrix:
[ 2   1   1 | 10 ]
[ 1  −1   1 |  2 ]
[ 1   1  −1 |  0 ]

Step 2 — R₁ ↔ R₂ (simpler pivot first):
[ 1  −1   1 |  2 ]
[ 2   1   1 | 10 ]
[ 1   1  −1 |  0 ]

Step 3 — R₂ → R₂ − 2R₁,  R₃ → R₃ − R₁:
[ 1  −1   1 |  2 ]
[ 0   3  −1 |  6 ]
[ 0   2  −2 | −2 ]

...continue to RREF...

RREF result:
[ 1   0   0 |  3 ]   → x = 3 mm
[ 0   1   0 |  2 ]   → y = 2 mm
[ 0   0   1 | 4.5]   → z = 4.5 mm

Tool origin confirmed: (3, 2, 4.5) mm from datum`}</CodeBox>

    <Heading C={C}>What happens when sensors contradict</Heading>
    <Para C={C}>If a faulty encoder produces an inconsistent system, the RREF contains a row like [0 0 0 | 5] — meaning 0 = 5. The controller detects this and halts rather than machining in the wrong place.</Para>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
      <Pill label="inconsistent → controller fault" color="red" C={C} />
      <Pill label="free variable → under-determined position" color="purple" C={C} />
      <Pill label="unique solution → confirmed position" color="green" C={C} />
    </div>

    <Heading C={C}>MATLAB / OpenMAT code</Heading>
    <CodeBox C={C}>{`A = [2 1 1; 1 -1 1; 1 1 -1];
b = [10; 2; 0];
Aug = [A b];
rref(Aug)       % gives RREF directly
x = A \\ b       % backslash solves Ax=b

% Check consistency:
if rank(A) == rank(Aug)
  disp('Consistent — unique solution')
else
  disp('Inconsistent — sensor fault')
end`}</CodeBox>
    <AhaBox title="The engineering takeaway" C={C}>
      Every engineering system with multiple constraints can be expressed as Ax=b. Row reduction is not abstract — it is literally the algorithm running inside every CNC controller, finite element solver, and circuit simulator.
    </AhaBox>
  </>
}

function PageInteractive({ C }) {
  const [mat, setMat] = useState(PRESETS[0].map(r => [...r]))
  const [history, setHistory] = useState([])
  const [log, setLog] = useState([])
  const [swI, setSwI] = useState(0)
  const [swJ, setSwJ] = useState(1)
  const [scRow, setScRow] = useState(0)
  const [scVal, setScVal] = useState('2')
  const [rpI, setRpI] = useState(2)
  const [rpJ, setRpJ] = useState(0)
  const [rpK, setRpK] = useState('-1')

  function fr(v) { return Math.abs(v % 1) < 0.001 ? Math.round(v) : parseFloat(v.toFixed(3)) }

  const rref = computeRREF(mat.map(r => [...r]))
  const hasContra = mat.some(r => r.slice(0, 3).every(v => Math.abs(v) < 0.001) && Math.abs(r[3]) > 0.001)
  const sol = readSolution(mat)

  function push(newMat, entry) {
    setHistory(h => [...h, mat.map(r => [...r])])
    setMat(newMat)
    setLog(l => [...l.slice(-7), entry])
  }

  function doSwap() {
    if (swI === swJ) return
    const m = mat.map(r => [...r]);
    [m[swI], m[swJ]] = [m[swJ], m[swI]]
    push(m, `R${swI + 1} ↔ R${swJ + 1}`)
  }
  function doScale() {
    const k = parseFloat(scVal)
    if (!k || k === 0) return
    const m = mat.map(r => [...r])
    m[scRow] = m[scRow].map(v => fr(v * k))
    push(m, `R${scRow + 1} → ${k}×R${scRow + 1}`)
  }
  function doReplace() {
    if (rpI === rpJ) return
    const k = parseFloat(rpK)
    const m = mat.map(r => [...r])
    m[rpI] = m[rpI].map((v, ci) => fr(v + k * mat[rpJ][ci]))
    push(m, `R${rpI + 1} → R${rpI + 1} + (${k})×R${rpJ + 1}`)
  }
  function doRREF() {
    push(computeRREF(mat.map(r => [...r])), '→ Auto RREF applied')
  }
  function doUndo() {
    if (!history.length) return
    setMat(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
    setLog(l => [...l.slice(-7), '↩ Undo'])
  }
  function loadPreset(i) { setMat(PRESETS[i].map(r => [...r])); setHistory([]); setLog([]) }

  const sel = { fontSize: 12, padding: '4px 6px', borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.surface2, color: C.text }
  const inp = { ...sel, width: 60, textAlign: 'center', fontFamily: 'monospace' }
  const btn = (primary) => ({ fontSize: 12, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', border: primary ? 'none' : `0.5px solid ${C.border}`, background: primary ? C.blue : 'transparent', color: primary ? '#fff' : C.text })

  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.purple, background: C.purpleBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Interactive — Row Reducer</div>
    <Heading C={C}>Reduce a 3×3 system to RREF yourself</Heading>
    <Para C={C}>Choose a preset, apply row operations, and watch the matrix update. Try to reach RREF before clicking "Auto RREF".</Para>

    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {['System A (unique)', 'System B (∞ solutions)', 'System C (no solution)'].map((label, i) => (
        <button key={i} onClick={() => loadPreset(i)} style={{ ...btn(false), fontSize: 11 }}>{label}</button>
      ))}
    </div>

    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
        {mat.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: C.hint, width: 20 }}>{`R${ri + 1}`}</span>
            {row.map((v, ci) => (
              <span key={ci} style={{
                width: ci === 3 ? 46 : 38, textAlign: 'right', padding: '3px 4px', borderRadius: 3,
                borderLeft: ci === 3 ? `2px solid ${C.border}` : 'none', marginLeft: ci === 3 ? 4 : 0,
                color: v === 0 ? C.hint : C.text,
              }}>{fr(v)}</span>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 12 }}>
        {hasContra
          ? <span style={{ color: C.red }}>Inconsistent — no solution (0 = nonzero row)</span>
          : <span style={{ color: C.muted }}>{sol}</span>}
      </div>
    </div>

    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, color: C.text }}>Row operations</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Swap rows</span>
        <select style={sel} value={swI} onChange={e => setSwI(+e.target.value)}>
          {[0,1,2].map(i => <option key={i} value={i}>{`R${i+1}`}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.muted }}>↔</span>
        <select style={sel} value={swJ} onChange={e => setSwJ(+e.target.value)}>
          {[0,1,2].map(i => <option key={i} value={i}>{`R${i+1}`}</option>)}
        </select>
        <button style={btn(true)} onClick={doSwap}>Swap</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Scale row</span>
        <select style={sel} value={scRow} onChange={e => setScRow(+e.target.value)}>
          {[0,1,2].map(i => <option key={i} value={i}>{`R${i+1}`}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.muted }}>×</span>
        <input type="number" style={inp} value={scVal} onChange={e => setScVal(e.target.value)} />
        <button style={btn(true)} onClick={doScale}>Scale</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Replace Rᵢ + k·Rⱼ</span>
        <select style={sel} value={rpI} onChange={e => setRpI(+e.target.value)}>
          {[0,1,2].map(i => <option key={i} value={i}>{`R${i+1}`}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.muted }}>+</span>
        <input type="number" style={inp} value={rpK} onChange={e => setRpK(e.target.value)} />
        <span style={{ fontSize: 12, color: C.muted }}>×</span>
        <select style={sel} value={rpJ} onChange={e => setRpJ(+e.target.value)}>
          {[0,1,2].map(i => <option key={i} value={i}>{`R${i+1}`}</option>)}
        </select>
        <button style={btn(true)} onClick={doReplace}>Replace</button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btn(false)} onClick={doRREF}>Auto RREF</button>
        <button style={btn(false)} onClick={doUndo} disabled={!history.length}>Undo</button>
      </div>
    </div>

    {log.length > 0 && (
      <div style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: C.muted, lineHeight: 1.8 }}>
        {log.map((entry, i) => <div key={i}>{entry}</div>)}
      </div>
    )}
  </>
}

function PagePractice({ C }) {
  const [shown, setShown] = useState(PRACTICE.map(() => false))
  const toggle = (i) => setShown(s => s.map((v, j) => j === i ? !v : v))
  const btn = { fontSize: 12, padding: '5px 12px', borderRadius: 7, cursor: 'pointer', border: `0.5px solid ${C.border}`, background: 'transparent', color: C.muted, marginTop: 6 }
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.teal, background: C.tealBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Practice problems</div>
    <Heading C={C}>Work each problem by hand, then reveal the answer</Heading>
    <Para C={C}>Attempt before revealing — that's the only way it sticks.</Para>
    {PRACTICE.map((p, i) => (
      <div key={i} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.ctx}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{i + 1}. {p.q}</div>
        <button style={btn} onClick={() => toggle(i)}>{shown[i] ? 'Hide answer' : 'Show answer'}</button>
        {shown[i] && (
          <div style={{ marginTop: 8, background: C.surface2, borderRadius: 6, padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.9, color: C.muted, whiteSpace: 'pre' }}>
            {p.a}
          </div>
        )}
      </div>
    ))}
    <WarnBox title="Common mistake" C={C}>
      Forgetting that row operations affect the entire row including the augmented column. When you add k times row j to row i, every entry changes — including the constant on the right of the vertical bar.
    </WarnBox>
  </>
}

const PAGES = [PageConcept, PageCanonical, PageRealWorld, PageInteractive, PagePractice]
const PAGE_LABELS = ['Concept', 'Step-through', 'Real world', 'Interactive', 'Practice']

export default function LALinearSystemsModule({ params = {} }) {
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
          <div key={i} onClick={() => setPage(i)} style={{ flex: 1, height: 4, borderRadius: 2, cursor: 'pointer', transition: 'background .25s', background: i < page ? C.blue : i === page ? C.amber : C.border }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
        {PAGE_LABELS.map((label, i) => (
          <button key={i} onClick={() => setPage(i)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, cursor: 'pointer', border: `0.5px solid ${i === page ? C.amberBd : C.border}`, background: i === page ? C.amberBg : 'transparent', color: i === page ? C.amber : C.hint }}>
            {label}
          </button>
        ))}
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
