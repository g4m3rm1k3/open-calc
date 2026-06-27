import { useState, useEffect, useRef } from 'react'



import { useThemeColors } from '../../../hooks/useThemeColors';
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
  return <div style={{ background: C.purpleBg, borderLeft: `3px solid ${C.purpleBd}`, borderRadius: '0 6px 6px 0', padding: '10px 14px', marginBottom: 12 }}>
    <p style={{ fontSize: 13, color: C.purple, lineHeight: 1.65, margin: 0 }}>{children}</p>
  </div>
}
function Pill({ label, color, C }) {
  const map = { green: [C.greenBg, C.green], purple: [C.purpleBg, C.purple], red: [C.redBg, C.red], blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber] }
  const [bg, tc] = map[color] || map.blue
  return <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 6, background: bg, color: tc, fontWeight: 500, margin: '2px 2px 4px 0' }}>{label}</span>
}

// ── 2×2 matrix math helpers ───────────────────────────────────
function mul2(A, B) {
  return [
    [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
    [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]],
  ]
}
function det2(A) { return A[0][0]*A[1][1] - A[0][1]*A[1][0] }
function inv2(A) {
  const d = det2(A)
  if (Math.abs(d) < 0.0001) return null
  return [[A[1][1]/d, -A[0][1]/d], [-A[1][0]/d, A[0][0]/d]]
}
function fr(v, d = 3) { return parseFloat(v.toFixed(d)) }
function fmt(v) { return Math.abs(fr(v)) < 0.001 ? '0' : fr(v).toString() }

// ── Inverse step data ─────────────────────────────────────────
const INV_STEPS = [
  { label: 'Start: set up [A | I]', left: [[2,1],[5,3]], right: [[1,0],[0,1]], op: '' },
  { label: 'R₁ → (1/2)R₁', left: [[1,0.5],[5,3]], right: [[0.5,0],[0,1]], op: 'Divide row 1 by 2: [2/2, 1/2, 1/2, 0] = [1, 0.5, 0.5, 0]' },
  { label: 'R₂ → R₂ − 5R₁', left: [[1,0.5],[0,0.5]], right: [[0.5,0],[-2.5,1]], op: 'R₂ − 5×R₁: [5−5, 3−2.5, 0−2.5, 1] = [0, 0.5, −2.5, 1]' },
  { label: 'R₂ → 2R₂', left: [[1,0.5],[0,1]], right: [[0.5,0],[-5,2]], op: 'Multiply row 2 by 2: [0, 1, −5, 2]' },
  { label: 'R₁ → R₁ − 0.5·R₂  (RREF done)', left: [[1,0],[0,1]], right: [[3,-1],[-5,2]], op: 'R₁ − 0.5×R₂: [1, 0.5−0.5, 0.5+2.5, −1] = [1, 0, 3, −1]\n\nLeft side = I  →  right side = A⁻¹ = [[3, −1], [−5, 2]]' },
]

const PRACTICE_M2 = [
  {
    ctx: 'Matrix multiplication',
    q: `Compute AB and BA. Are they equal? Why?\nA = [ 1  2 ]    B = [ 0  1 ]\n    [ 3  4 ]        [ 2  3 ]`,
    a: `AB:
C[1,1] = (1)(0)+(2)(2) = 4    C[1,2] = (1)(1)+(2)(3) = 7
C[2,1] = (3)(0)+(4)(2) = 8    C[2,2] = (3)(1)+(4)(3) = 15

AB = [  4   7 ]
     [  8  15 ]

BA:
C[1,1] = (0)(1)+(1)(3) = 3    C[1,2] = (0)(2)+(1)(4) = 4
C[2,1] = (2)(1)+(3)(3) = 11   C[2,2] = (2)(2)+(3)(4) = 16

BA = [  3   4 ]
     [ 11  16 ]

AB ≠ BA — matrix multiplication is NOT commutative.
This is one of the biggest differences from regular algebra.`,
  },
  {
    ctx: 'Finding A⁻¹ by row reduction',
    q: `Find A⁻¹ using row reduction on [A|I]:\nA = [ 3  1 ]\n    [ 5  2 ]`,
    a: `Set up [A | I]:
[ 3  1 | 1  0 ]
[ 5  2 | 0  1 ]

R₁ → (1/3)R₁:
[ 1  1/3 | 1/3  0 ]
[ 5  2   | 0    1 ]

R₂ → R₂ − 5R₁:
[ 1  1/3 |  1/3   0 ]
[ 0  1/3 | −5/3   1 ]

R₂ → 3R₂:
[ 1  1/3 |  1/3   0 ]
[ 0   1  | −5     3 ]

R₁ → R₁ − (1/3)R₂:
[ 1   0  |  2   −1 ]
[ 0   1  | −5    3 ]

A⁻¹ = [  2  −1 ]
       [ −5   3 ]

Verify: det(A) = 3·2 − 1·5 = 1. 2×2 formula: (1/det)·[ d −b; −c a ] ✓`,
  },
  {
    ctx: 'Solving Ax = b with the inverse',
    q: `Using the A⁻¹ from problem 2, solve Ax = b where b = [8, 13]ᵀ.\nThen verify by substituting back.`,
    a: `A⁻¹ = [  2  −1 ]   b = [ 8  ]
       [ −5   3 ]       [ 13 ]

x = A⁻¹b:
x₁ = 2(8) + (−1)(13) = 16 − 13 = 3
x₂ = −5(8) + 3(13) = −40 + 39 = −1

Solution: x = [3, −1]ᵀ

Verify Ax = b:
3(3) + 1(−1) = 9 − 1 = 8  ✓
5(3) + 2(−1) = 15 − 2 = 13 ✓`,
  },
  {
    ctx: 'LU decomposition',
    q: `Find the LU decomposition of A, then solve Ax = b with b = [2, 5, 3]ᵀ.\nA = [ 1   2   1 ]\n    [ 2   5   3 ]\n    [−1  −1   2 ]`,
    a: `Elimination to find U:

m₂₁ = 2/1 = 2:   R₂ → R₂ − 2R₁ → [0, 1, 1]
m₃₁ = −1/1 = −1: R₃ → R₃ + R₁  → [0, 1, 3]

m₃₂ = 1/1 = 1:   R₃ → R₃ − R₂  → [0, 0, 2]

U = [ 1   2   1 ]
    [ 0   1   1 ]
    [ 0   0   2 ]

L (1s on diagonal, multipliers fill below):
L = [  1   0   0 ]
    [  2   1   0 ]
    [ −1   1   1 ]

Forward solve Ly = b:
y₁ = 2
2(2) + y₂ = 5  →  y₂ = 1
−1(2) + 1(1) + y₃ = 3  →  y₃ = 4

Back solve Ux = y:
2x₃ = 4  →  x₃ = 2
x₂ + 2 = 1  →  x₂ = −1
x₁ + 2(−1) + 2 = 2  →  x₁ = 2

Solution: x = [2, −1, 2]ᵀ
Verify: [2−2+2=2 ✓, 4−5+6=5 ✓, −2+1+4=3 ✓]`,
  },
  {
    ctx: 'Graphics — composing transforms',
    q: `A point is at p = [3, 1]ᵀ. First rotate 90°, then scale by 2.\nCompute T = S·R, then T·p. Also find T⁻¹.`,
    a: `R (90° rotation):  cos90°=0, sin90°=1
R = [ 0  −1 ]
    [ 1   0 ]

S (scale by 2):
S = [ 2  0 ]
    [ 0  2 ]

Combined T = S·R:
T = [ 0  −2 ]
    [ 2   0 ]

T·p = [ 0(3)+(−2)(1) ] = [ −2 ]
      [ 2(3)+  0(1)  ]   [  6 ]

Transformed point: (−2, 6)

det(T) = 0(0) − (−2)(2) = 4
T⁻¹ = (1/4)[ 0  2 ] = [  0    0.5 ]
            [−2  0 ]   [ −0.5  0   ]

Verify T⁻¹·(−2, 6) = (3, 1) ✓`,
  },
]

// ── Graphics canvas component ─────────────────────────────────
function GraphicsCanvas({ deg, scl, sh, C }) {
  const canvasRef = useRef(null)
  const roRef = useRef(null)

  useEffect(() => {
    const draw = () => {
      const cv = canvasRef.current; if (!cv) return
      const canvasW = cv.offsetWidth || 500
      const canvasH = 280
      cv.width = canvasW; cv.height = canvasH
      const ctx = cv.getContext('2d')
      ctx.clearRect(0, 0, canvasW, canvasH)

      const cx = canvasW / 2, cy = canvasH / 2, sc = Math.min(36, canvasW / 14)
      // grid
      ctx.strokeStyle = C.border; ctx.lineWidth = 0.5
      for (let i = -7; i <= 7; i++) {
        ctx.beginPath(); ctx.moveTo(cx + i * sc, 0); ctx.lineTo(cx + i * sc, canvasH); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, cy + i * sc); ctx.lineTo(canvasW, cy + i * sc); ctx.stroke()
      }
      // axes
      ctx.strokeStyle = C.hint; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvasW, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvasH); ctx.stroke()

      const rad = deg * Math.PI / 180
      const cos = Math.cos(rad), sin = Math.sin(rad)
      const T = [
        [scl * cos, -scl * sin + sh * scl * cos],
        [scl * sin,  scl * cos + sh * scl * sin],
      ]
      const shape = [[1,0],[2.5,0],[2.5,1],[2,2.5],[1,2.5],[0,2.5],[0,1]]
      const tf = p => [cx + (T[0][0]*p[0]+T[0][1]*p[1])*sc, cy - (T[1][0]*p[0]+T[1][1]*p[1])*sc]
      const orig = p => [cx + p[0]*sc, cy - p[1]*sc]

      // original (dashed)
      ctx.strokeStyle = C.hint; ctx.lineWidth = 1; ctx.setLineDash([4,4])
      ctx.beginPath(); ctx.moveTo(...orig(shape[0])); shape.forEach(p => ctx.lineTo(...orig(p))); ctx.closePath(); ctx.stroke()
      ctx.setLineDash([])

      // transformed
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.fillStyle = C.blueBg
      ctx.beginPath(); ctx.moveTo(...tf(shape[0])); shape.forEach(p => ctx.lineTo(...tf(p))); ctx.closePath(); ctx.stroke(); ctx.fill()

      ctx.fillStyle = C.hint; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('original (dashed)', 8, 16)
      ctx.fillStyle = C.blue; ctx.fillText('transformed', 8, 30)
    }

    draw()
    if (!roRef.current) {
      roRef.current = new ResizeObserver(draw)
      if (canvasRef.current?.parentElement) roRef.current.observe(canvasRef.current.parentElement)
    }
    return () => { if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }
  }, [deg, scl, sh, C])

  return <canvas ref={canvasRef} style={{ width: '100%', height: 280, display: 'block', borderRadius: 8 }} />
}

// ── Pages ─────────────────────────────────────────────────────

function PageConcept({ C }) {
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.purple, background: C.purpleBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Module 2 — Matrix Algebra</div>
    <WhyBox C={C}>
      <strong style={{ fontWeight: 500 }}>Why this exists:</strong> Matrix multiplication is not just "math for its own sake." It is the operation that describes every transformation in 3D graphics, every state transition in a simulation, every change of coordinates in robotics. Understanding the rules of matrix algebra is understanding how transformations compose and invert.
    </WhyBox>

    <Heading C={C}>Matrix addition and scalar multiplication</Heading>
    <Para C={C}>Add entry-by-entry (dimensions must match). Scalar multiplication scales every entry. These are commutative, associative, and distributive — just like regular algebra.</Para>
    <CodeBox C={C}>{`[ 1  2 ] + [ 5  0 ] = [ 6  2 ]
[ 3  4 ]   [ 1  2 ]   [ 4  6 ]

3 × [ 1  2 ] = [ 3   6 ]
    [ 3  4 ]   [ 9  12 ]`}</CodeBox>

    <Heading C={C}>Matrix multiplication — the important one</Heading>
    <Para C={C}>For A (m×n) × B (n×p): inner dimensions must match, result is m×p. Entry (i,j) of AB = dot product of row i of A with column j of B.</Para>
    <Para C={C} style={{ color: C.red }}><strong style={{ fontWeight: 600 }}>Critical: AB ≠ BA in general. Matrix multiplication is NOT commutative.</strong></Para>
    <CodeBox C={C}>{`C[i,j] = Σ aᵢₖ bₖⱼ   (sum over k — row times column)

A (2×3) × B (3×2) = C (2×2)   ← inner dims match (3=3), outer give shape`}</CodeBox>

    <Heading C={C}>The identity matrix I</Heading>
    <Para C={C}>1s on the diagonal, 0s elsewhere. Acts like the number 1: AI = IA = A for any compatible A.</Para>

    <Heading C={C}>The matrix inverse A⁻¹</Heading>
    <Para C={C}>A square matrix A is <Strong>invertible</Strong> if there exists A⁻¹ such that AA⁻¹ = A⁻¹A = I. To find it: row-reduce [A|I] until left side is I — the right side is A⁻¹. If det(A) = 0, A is <Strong>singular</Strong> and has no inverse.</Para>
    <CodeBox C={C}>{`To find A⁻¹:   row reduce [A | I] → [I | A⁻¹]

2×2 shortcut:
   [ a  b ]⁻¹     1     [  d  −b ]
   [ c  d ]   = ------  [ −c   a ]
                ad−bc`}</CodeBox>

    <Heading C={C}>LU decomposition</Heading>
    <Para C={C}>Factor A = LU where L is lower triangular (1s on diagonal) and U is upper triangular. Multipliers from Gaussian elimination go into L; the elimination result is U. Solve Ax = b as two triangular systems: Ly = b (forward), Ux = y (back) — both fast.</Para>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
      <Pill label="A = LU — two easy triangular solves" color="green" C={C} />
      <Pill label="multipliers from elimination → L" color="purple" C={C} />
      <Pill label="one factorization → many b vectors" color="blue" C={C} />
    </div>
    <AhaBox title="The key insight" C={C}>
      Matrices represent linear transformations. Multiplying matrices is composing transformations. Finding the inverse is finding the "undo" operation. These are not arithmetic tricks — they are the algebra of maps between spaces.
    </AhaBox>
  </>
}

function PageCanonical({ C }) {
  const [invStep, setInvStep] = useState(0)
  const s = INV_STEPS[invStep]
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.amber, background: C.amberBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Canonical examples — step by step</div>

    <Heading C={C}>Example 1 — matrix multiplication (2×3 × 3×2)</Heading>
    <CodeBox C={C}>{`        [ 1  2  3 ]          [ 7   8 ]
A (2×3)=[ 4  5  6 ]  B (3×2)=[ 9  10 ]
                              [11  12 ]

C = AB is 2×2. Compute each entry:

C[1,1] = (1)(7)+(2)(9)+(3)(11) = 7+18+33 = 58
C[1,2] = (1)(8)+(2)(10)+(3)(12) = 8+20+36 = 64
C[2,1] = (4)(7)+(5)(9)+(6)(11) = 28+45+66 = 139
C[2,2] = (4)(8)+(5)(10)+(6)(12) = 32+50+72 = 154

      [  58   64 ]
AB =  [ 139  154 ]

Note: BA is 3×3 — completely different shape. AB ≠ BA.`}</CodeBox>

    <Heading C={C}>Example 2 — finding A⁻¹ by row reduction</Heading>
    <Para C={C}>Matrix A = [[2, 1], [5, 3]]</Para>
    <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: C.hint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>[ A | I ]</div>
      {[0, 1].map(ri => (
        <div key={ri} style={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 3, fontFamily: 'monospace', fontSize: 13 }}>
          <span style={{ fontSize: 11, color: C.hint, width: 20 }}>{`R${ri+1}`}</span>
          {s.left[ri].map((v, ci) => (
            <span key={ci} style={{ width: 38, textAlign: 'right', padding: '2px 4px', borderRadius: 3, color: v === 0 ? C.hint : v === 1 && s.left[ri].indexOf(v) === ri ? C.green : C.text }}>
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </span>
          ))}
          <span style={{ width: 2, background: C.border, margin: '0 6px', height: 20, borderRadius: 1, display: 'inline-block' }} />
          {s.right[ri].map((v, ci) => (
            <span key={ci} style={{ width: 38, textAlign: 'right', padding: '2px 4px', borderRadius: 3, background: invStep === INV_STEPS.length - 1 ? C.purpleBg : 'transparent', color: invStep === INV_STEPS.length - 1 ? C.purple : C.text }}>
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </span>
          ))}
        </div>
      ))}
      {s.op && <div style={{ marginTop: 8, fontSize: 11, color: C.muted, whiteSpace: 'pre', fontFamily: 'monospace' }}>{s.op}</div>}
    </div>
    <div style={{ fontSize: 12, color: C.hint, marginBottom: 10 }}>Step {invStep + 1}/{INV_STEPS.length}: <span style={{ color: C.text }}>{s.label}</span></div>
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <button disabled={invStep === 0} onClick={() => setInvStep(i => i - 1)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: `0.5px solid ${C.border}`, background: 'transparent', color: invStep === 0 ? C.hint : C.text, cursor: invStep === 0 ? 'default' : 'pointer', opacity: invStep === 0 ? 0.4 : 1 }}>← Back</button>
      <button disabled={invStep === INV_STEPS.length - 1} onClick={() => setInvStep(i => i + 1)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: 'none', background: invStep === INV_STEPS.length - 1 ? C.hint : C.blue, color: '#fff', cursor: invStep === INV_STEPS.length - 1 ? 'default' : 'pointer' }}>
        {invStep === INV_STEPS.length - 1 ? 'Done' : 'Next →'}</button>
      <button onClick={() => setInvStep(0)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: `0.5px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer' }}>Reset</button>
    </div>

    <Heading C={C}>Example 3 — LU decomposition</Heading>
    <CodeBox C={C}>{`Factor A = [ 2   4  −2 ]
           [ 4   9  −3 ]
           [−2  −3   7 ]

Elimination step 1: eliminate column 1
  m₂₁ = 4/2 = 2    →  R₂ → R₂ − 2R₁:  [0, 1, 1]
  m₃₁ = −2/2 = −1  →  R₃ → R₃ + R₁:   [0, 1, 5]

Elimination step 2: eliminate column 2
  m₃₂ = 1/1 = 1    →  R₃ → R₃ − R₂:   [0, 0, 4]

U = [ 2   4  −2 ]    L = [  1   0   0 ]
    [ 0   1   1 ]        [  2   1   0 ]
    [ 0   0   4 ]        [ −1   1   1 ]

Verify: L·U[row 2] = 2×[2,4,−2] + 1×[0,1,1] = [4, 9, −3] ✓
MATLAB:  [L, U, P] = lu(A)`}</CodeBox>
  </>
}

function PageRealWorld({ C }) {
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.green, background: C.greenBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Real World — 3D Graphics & FEA</div>
    <WhyBox C={C}>
      <strong style={{ fontWeight: 500 }}>Why this exists:</strong> Every 3D model is a list of vertices. When you rotate, scale, or translate it, the software multiplies every vertex by a transformation matrix. Your GPU does billions of these multiplications per second. The reason they're matrices is so multiple transformations can be combined into one operation.
    </WhyBox>

    <Heading C={C}>Transformation matrices in 2D</Heading>
    <CodeBox C={C}>{`Rotation by θ:           Scale by (sx, sy):
[ cos θ  −sin θ ]         [ sx   0  ]
[ sin θ   cos θ ]         [  0  sy  ]

Shear in x by k:          Reflection over x-axis:
[  1   k ]                [  1   0 ]
[  0   1 ]                [  0  −1 ]`}</CodeBox>

    <Heading C={C}>Composing transformations — why multiplication matters</Heading>
    <Para C={C}>Rotating then scaling: T = S·R. Apply T to all vertices once instead of applying S then R separately. With 10,000 vertices at 60fps, this matters enormously.</Para>
    <CodeBox C={C}>{`R = rotation 30°,  S = scale 2
Combined:  T = S·R  (apply R first, then S)

(AB)⁻¹ = B⁻¹A⁻¹  → undo: first undo S, then undo R

det(T) = 0 means the shape collapsed — the transform is irreversible`}</CodeBox>

    <Heading C={C}>The inverse in graphics — camera transforms</Heading>
    <Para C={C}>When the camera moves, every object appears to move the opposite direction. If the camera transform is C, the view transform applied to all objects is C⁻¹.</Para>
    <CodeBox C={C}>{`% Camera matrix C: position p, rotation R
C = [cos(t) -sin(t) tx; sin(t) cos(t) ty; 0 0 1];  % homogeneous
V = inv(C);                 % view matrix
vertex_view = V * vertex_world;`}</CodeBox>

    <Heading C={C}>LU decomposition in FEA (Finite Element Analysis)</Heading>
    <Para C={C}>In structural FEA, the global stiffness matrix K can be 100,000×100,000. You LU-factorize K once, then solve Kx = F for many different load vectors F using the same L and U.</Para>
    <CodeBox C={C}>{`K (stiffness matrix — 100k×100k, sparse)
F₁, F₂, F₃...  (different load cases)

[L, U] = lu(K)      % do once — expensive
for each Fᵢ:
  y = L \\ Fᵢ        % forward solve — fast
  x = U \\ y         % back solve — fast
end`}</CodeBox>
    <AhaBox title="The engineering takeaway" C={C}>
      LU decomposition is why FEA can analyze hundreds of load cases without re-solving from scratch each time. The matrix inverse is why camera systems, robot controllers, and graphics engines can "undo" any transformation. These are not abstract — they are runtime algorithms in every engineering tool you will use.
    </AhaBox>
  </>
}

function PageInteractive({ C }) {
  const [aVals, setAVals] = useState([2, 1, 5, 3])
  const [bVals, setBVals] = useState([3, 2, 1, 4])
  const [vb, setVb] = useState([7, 5])
  const [deg, setDeg] = useState(0)
  const [scl, setScl] = useState(100)
  const [sh, setSh] = useState(0)

  const A = [[aVals[0], aVals[1]], [aVals[2], aVals[3]]]
  const B = [[bVals[0], bVals[1]], [bVals[2], bVals[3]]]
  const AB = mul2(A, B)
  const BA = mul2(B, A)
  const Ainv = inv2(A)
  const dA = fr(det2(A))
  const sol = Ainv ? [fr(Ainv[0][0]*vb[0]+Ainv[0][1]*vb[1]), fr(Ainv[1][0]*vb[0]+Ainv[1][1]*vb[1])] : null

  const rad = deg * Math.PI / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const sclF = scl / 100, shF = sh / 100
  const T = [[sclF*cos, -sclF*sin + shF*sclF*cos], [sclF*sin, sclF*cos + shF*sclF*sin]]
  const dT = fr(T[0][0]*T[1][1] - T[0][1]*T[1][0])

  const inp = { width: 52, fontFamily: 'monospace', fontSize: 13, textAlign: 'center', padding: '4px', borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.surface2, color: C.text }
  const sld = { flex: 1, margin: '0 8px' }

  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.teal, background: C.tealBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Interactive — Matrix sandbox</div>

    <Heading C={C}>2×2 matrix multiplication and inverse</Heading>
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 12 }}>
      {[['Matrix A', aVals, setAVals], ['Matrix B', bVals, setBVals]].map(([label, vals, setVals]) => (
        <div key={label}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: C.text }}>{label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {vals.map((v, i) => (
              <input key={i} type="number" style={inp} value={v}
                onChange={e => setVals(prev => prev.map((x, j) => j === i ? +e.target.value : x))} />
            ))}
          </div>
        </div>
      ))}
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: C.text }}>Vector b</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
          {vb.map((v, i) => (
            <input key={i} type="number" style={inp} value={v}
              onChange={e => setVb(prev => prev.map((x, j) => j === i ? +e.target.value : x))} />
          ))}
        </div>
      </div>
    </div>
    <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: C.text, lineHeight: 1.9, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
      {`AB = [ ${fmt(AB[0][0])}  ${fmt(AB[0][1])} ]\n     [ ${fmt(AB[1][0])}  ${fmt(AB[1][1])} ]`}
      {`\n\nBA = [ ${fmt(BA[0][0])}  ${fmt(BA[0][1])} ]\n     [ ${fmt(BA[1][0])}  ${fmt(BA[1][1])} ]`}
      {`\n\nAB ${JSON.stringify(AB.map(r => r.map(v => fr(v)))) === JSON.stringify(BA.map(r => r.map(v => fr(v)))) ? '=' : '≠'} BA\n\ndet(A) = ${dA}`}
      {Ainv
        ? `\n\nA⁻¹ = [ ${fmt(Ainv[0][0])}  ${fmt(Ainv[0][1])} ]\n      [ ${fmt(Ainv[1][0])}  ${fmt(Ainv[1][1])} ]`
        : '\n\nA is singular — no inverse (det = 0)'}
      {sol ? `\n\nA⁻¹b = [${sol[0]}, ${sol[1]}]ᵀ` : ''}
    </div>

    <Heading C={C}>Graphics: live transformation visualizer</Heading>
    <Para C={C}>Compose rotation, scale, and shear. The dashed shape is the original; the solid blue shape is the transformed result.</Para>
    {[
      ['Rotation (°)', deg, setDeg, 0, 360, 1, `${deg}°`],
      ['Scale', scl, setScl, 25, 200, 5, `${(scl/100).toFixed(2)}×`],
      ['Shear', sh, setSh, -150, 150, 5, `${(sh/100).toFixed(2)}`],
    ].map(([label, val, setVal, min, max, step, display]) => (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 90 }}>{label}</span>
        <input type="range" min={min} max={max} step={step} value={val} onChange={e => setVal(+e.target.value)} style={sld} />
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.amber, minWidth: 50 }}>{display}</span>
      </div>
    ))}
    <GraphicsCanvas deg={deg} scl={scl / 100} sh={sh / 100} C={C} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
      <div style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 2 }}>det(T) — area scale</div>
        <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 500, color: Math.abs(dT) < 0.01 ? C.red : C.text }}>{dT.toFixed(3)}</div>
      </div>
      <div style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 2 }}>Invertible?</div>
        <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 500, color: Math.abs(dT) > 0.01 ? C.green : C.red }}>{Math.abs(dT) > 0.01 ? 'Yes' : 'No — singular!'}</div>
      </div>
    </div>
  </>
}

function PagePractice({ C }) {
  const [shown, setShown] = useState(PRACTICE_M2.map(() => false))
  const toggle = (i) => setShown(s => s.map((v, j) => j === i ? !v : v))
  const btnStyle = { fontSize: 12, padding: '5px 12px', borderRadius: 7, cursor: 'pointer', border: `0.5px solid ${C.border}`, background: 'transparent', color: C.muted, marginTop: 6 }
  return <>
    <div style={{ fontSize: 13, fontWeight: 500, color: C.teal, background: C.tealBg, display: 'inline-block', padding: '2px 9px', borderRadius: 6, marginBottom: 10 }}>Practice problems</div>
    <Heading C={C}>Work each problem by hand, then reveal the answer</Heading>
    {PRACTICE_M2.map((p, i) => (
      <div key={i} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.ctx}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{i + 1}. {p.q}</div>
        <button style={btnStyle} onClick={() => toggle(i)}>{shown[i] ? 'Hide answer' : 'Show answer'}</button>
        {shown[i] && (
          <div style={{ marginTop: 8, background: C.surface2, borderRadius: 6, padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.9, color: C.muted, whiteSpace: 'pre' }}>
            {p.a}
          </div>
        )}
      </div>
    ))}
    <WarnBox title="Common mistake" C={C}>
      When composing two transforms T = S·R, the <em>rightmost</em> matrix is applied first. T = S·R means "first rotate (R), then scale (S)." If you reverse the order you get a different combined transform.
    </WarnBox>
  </>
}

const PAGES = [PageConcept, PageCanonical, PageRealWorld, PageInteractive, PagePractice]
const PAGE_LABELS = ['Concept', 'Examples', 'Real world', 'Interactive', 'Practice']

export default function LAMatrixAlgebraModule({ params = {} }) {
  const C = useThemeColors()
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
