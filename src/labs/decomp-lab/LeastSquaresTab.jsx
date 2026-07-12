import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { polyfit, polyval, conditionNumber, math } from '../../engines/openmat/openmatEngine.js'
import { Tag, Def, Insight, Eq, SmallMatrix } from './atoms.jsx'
import { parseXYText } from './mathHelpers.js'
import { GLASS_META } from '../../styles/courseColors.js'

const LS_TOPICS = [
  { id: 'over', label: 'Overdetermined', color: 'cyan' },
  { id: 'normal', label: 'Normal Equation', color: 'amber' },
  { id: 'colspace', label: 'Column Space', color: 'green' },
  { id: 'svdls', label: 'SVD & LS', color: 'violet' },
]

const PRESET_DATASETS = [
  { label: 'Custom (click plot)', points: null },
  {
    label: 'Projectile height',
    points: [
      { x: 0, y: 0 }, { x: 0.5, y: 2.2 }, { x: 1, y: 3.9 }, { x: 1.5, y: 5.0 },
      { x: 2, y: 5.6 }, { x: 2.5, y: 5.7 }, { x: 3, y: 5.3 }, { x: 3.5, y: 4.4 },
      { x: 4, y: 3.0 }, { x: 4.5, y: 1.1 }, { x: 5, y: 0.1 },
    ],
  },
  {
    label: 'Population growth',
    points: [
      { x: 0, y: 1.0 }, { x: 1, y: 1.3 }, { x: 2, y: 1.7 }, { x: 3, y: 2.1 }, { x: 4, y: 2.8 },
      { x: 5, y: 3.7 }, { x: 6, y: 4.8 }, { x: 7, y: 6.1 }, { x: 8, y: 7.9 }, { x: 9, y: 9.5 },
    ],
  },
  {
    label: 'Noisy linear signal',
    points: [
      { x: 0.3, y: 0.8 }, { x: 1.1, y: 1.9 }, { x: 2.0, y: 2.5 }, { x: 2.9, y: 3.8 },
      { x: 3.8, y: 4.2 }, { x: 4.5, y: 5.4 }, { x: 5.3, y: 5.9 }, { x: 6.1, y: 7.1 },
      { x: 7.0, y: 7.6 }, { x: 7.8, y: 8.8 }, { x: 8.6, y: 9.1 }, { x: 9.4, y: 9.7 },
    ],
  },
]

const DEFAULT_POINTS = [
  { x: 0.5, y: 1.2 }, { x: 1.2, y: 2.8 }, { x: 2.1, y: 3.4 }, { x: 2.8, y: 4.1 },
  { x: 3.5, y: 3.7 }, { x: 4.2, y: 4.9 }, { x: 5.0, y: 5.8 }, { x: 5.8, y: 6.2 },
  { x: 6.5, y: 5.5 }, { x: 7.2, y: 6.8 }, { x: 8.0, y: 7.4 }, { x: 8.8, y: 7.0 },
]

const CW = 440, CH = 340, PAD = 36
const scaleX = (x, lo, hi) => PAD + (x - lo) / (hi - lo) * (CW - 2 * PAD)
const scaleY = (y, lo, hi) => CH - PAD - (y - lo) / (hi - lo) * (CH - 2 * PAD)

function DataImport({ onImport }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  function apply(raw) {
    const points = parseXYText(raw)
    if (points.length < 2) { setError('Need at least 2 valid "x, y" lines.'); return }
    setError('')
    onImport(points)
    setOpen(false)
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] font-mono tracking-wide text-violet-600 dark:text-violet-400 hover:underline"
      >
        {open ? '▾' : '▸'} Import your own data (paste or upload .csv)
      </button>
      {open && (
        <div className="mt-2 p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'x, y\n0, 1.2\n1, 2.8\n2, 3.4\n…'}
            rows={4}
            className="w-full text-[11px] font-mono p-2 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 text-slate-700 dark:text-slate-200 resize-y"
          />
          {error && <div className="text-[10px] text-red-500 mt-1">{error}</div>}
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={() => apply(text)}
              className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              Load pasted data
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-2.5 py-1 rounded-md text-[10px] font-semibold border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Upload .csv
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                file.text().then(apply)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeastSquaresTab() {
  const canvasRef = useRef(null)
  const [points, setPoints] = useState(DEFAULT_POINTS)
  const [degree, setDegree] = useState(1)
  const [topic, setTopic] = useState('over')
  const [preset, setPreset] = useState(0)

  const xMin = 0, xMax = 10, yMin = 0, yMax = 10
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y)

  const A = useMemo(() => xs.map((x) => Array.from({ length: degree + 1 }, (_, j) => x ** j)), [xs, degree])
  const AtA = useMemo(() => (A.length ? math.multiply(math.transpose(A), A) : []), [A])

  const rawCoeffs = useMemo(() => {
    try { return polyfit(xs, ys, degree) } catch { return Array(degree + 1).fill(0) }
  }, [xs, ys, degree])
  // polyfit returns highest-power-first; the UI (and AtA row/col reasoning
  // below) talks about "coefficient of x^i" low-to-high, so keep both.
  const coeffs = useMemo(() => [...rawCoeffs].reverse(), [rawCoeffs])

  const curveXs = useMemo(() => Array.from({ length: 100 }, (_, i) => xMin + (xMax - xMin) * i / 99), [])
  const curveYs = useMemo(() => polyval(rawCoeffs, curveXs), [rawCoeffs, curveXs])
  const predicted = useMemo(() => polyval(rawCoeffs, xs), [rawCoeffs, xs])
  const residuals = useMemo(() => ys.map((y, i) => y - predicted[i]), [ys, predicted])
  const rss = useMemo(() => residuals.reduce((s, r) => s + r * r, 0), [residuals])

  const condA = useMemo(() => { try { return conditionNumber(A) } catch { return NaN } }, [A])
  const condAtA = useMemo(() => { try { return conditionNumber(AtA) } catch { return NaN } }, [AtA])

  const onCanvasClick = useCallback((e) => {
    if (preset !== 0) return
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width * CW
    const cy = (e.clientY - rect.top) / rect.height * CH
    const mx = xMin + (cx - PAD) / (CW - 2 * PAD) * (xMax - xMin)
    const my = yMin + (CH - PAD - cy) / (CH - 2 * PAD) * (yMax - yMin)
    if (mx < xMin || mx > xMax || my < yMin || my > yMax) return
    setPoints((pts) => [...pts, { x: mx, y: my }])
  }, [preset])

  const handlePreset = useCallback((idx) => {
    setPreset(idx)
    setPoints(PRESET_DATASETS[idx].points ?? DEFAULT_POINTS)
  }, [])

  const handleImport = useCallback((imported) => {
    setPreset(0)
    setPoints(imported)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const isDark = document.documentElement.classList.contains('dark')
    ctx.clearRect(0, 0, CW, CH)
    ctx.fillStyle = isDark ? '#0b0f19' : '#f8fafc'
    ctx.fillRect(0, 0, CW, CH)
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      const gx = scaleX(i, xMin, xMax), gy = scaleY(i, yMin, yMax)
      ctx.beginPath(); ctx.moveTo(gx, PAD); ctx.lineTo(gx, CH - PAD); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(PAD, gy); ctx.lineTo(CW - PAD, gy); ctx.stroke()
    }
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD, CH - PAD); ctx.lineTo(CW - PAD, CH - PAD); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PAD, PAD); ctx.lineTo(PAD, CH - PAD); ctx.stroke()
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8'
    ctx.font = "9px 'JetBrains Mono', monospace"
    ctx.textAlign = 'center'
    for (let i = 0; i <= 10; i += 2) {
      ctx.fillText(i, scaleX(i, xMin, xMax), CH - PAD + 12)
      ctx.textAlign = 'right'
      ctx.fillText(i, PAD - 6, scaleY(i, yMin, yMax) + 3)
      ctx.textAlign = 'center'
    }
    ctx.beginPath(); ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2.5; ctx.setLineDash([])
    curveXs.forEach((x, i) => {
      const px = scaleX(x, xMin, xMax), py = scaleY(curveYs[i], yMin, yMax)
      if (py < PAD - 10 || py > CH - PAD + 10) return
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    })
    ctx.stroke()
    ctx.strokeStyle = 'rgba(248,113,113,0.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3])
    points.forEach((pt, i) => {
      const px = scaleX(pt.x, xMin, xMax), py = scaleY(pt.y, yMin, yMax)
      const ppy = scaleY(predicted[i], yMin, yMax)
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, ppy); ctx.stroke()
    })
    ctx.setLineDash([])
    points.forEach((pt) => {
      const px = scaleX(pt.x, xMin, xMax), py = scaleY(pt.y, yMin, yMax)
      ctx.fillStyle = '#22d3ee'; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 8
      ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
    })
  }, [points, curveXs, curveYs, predicted])

  const topicColor = LS_TOPICS.find((t) => t.id === topic)?.color ?? 'cyan'

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      <div className="w-[380px] flex-shrink-0 border-r border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
        <div className="p-2.5 border-b border-slate-200 dark:border-white/10 flex flex-wrap gap-1.5 bg-slate-50/60 dark:bg-white/[0.02]">
          {PRESET_DATASETS.map((ds, i) => {
            const active = i === preset
            return (
              <button
                key={i}
                onClick={() => handlePreset(i)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wide border transition-colors ${
                  active ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {ds.label}
              </button>
            )
          })}
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
          <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-1.5">
            {preset === 0 ? 'CLICK TO ADD DATA POINTS' : 'PRESET DATASET'} — {points.length} points, degree {degree} fit
          </div>
          <canvas
            ref={canvasRef} width={CW} height={CH} onClick={onCanvasClick}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 block"
            style={{ cursor: preset === 0 ? 'crosshair' : 'default' }}
          />
          <DataImport onImport={handleImport} />
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-1.5">POLYNOMIAL DEGREE</div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                onClick={() => setDegree(d)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-mono border transition-colors ${
                  d === degree ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'
                }`}
              >
                deg {d}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2.5">
            <div className="p-2 rounded-lg bg-white/70 dark:bg-white/[0.03] border border-red-500/25 text-center">
              <div className="text-[15px] font-bold font-mono text-red-500">{rss.toFixed(3)}</div>
              <div className="text-[8px] text-slate-400 dark:text-slate-500">RSS ‖r‖²</div>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-white/[0.03] border border-amber-500/25 text-center">
              <div className="text-[15px] font-bold font-mono text-amber-500">{points.length}×{degree + 1}</div>
              <div className="text-[8px] text-slate-400 dark:text-slate-500">MATRIX SIZE</div>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-white/[0.03] border border-green-500/25 text-center">
              <div className="text-[13px] font-bold font-mono text-green-500">{coeffs.length > 3 ? `${coeffs.length} coeffs` : coeffs.map((c) => c.toFixed(2)).join(', ')}</div>
              <div className="text-[8px] text-slate-400 dark:text-slate-500">COEFFICIENTS</div>
            </div>
          </div>
          {preset === 0 && (
            <button
              onClick={() => setPoints([])}
              className="w-full mt-2 py-1.5 rounded-md text-[9px] font-mono tracking-wide border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              CLEAR POINTS
            </button>
          )}
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-2">VANDERMONDE MATRIX A (first 4 rows)</div>
          <SmallMatrix data={A.slice(0, 4)} color="cyan" label="A — each row is [1, xᵢ, xᵢ², …]" />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-white/10 flex-shrink-0 overflow-x-auto">
          {LS_TOPICS.map((t) => {
            const meta = GLASS_META[t.color]
            const active = t.id === topic
            return (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={`px-3.5 py-2.5 text-[9px] font-mono tracking-widest uppercase whitespace-nowrap border-b-2 transition-colors ${
                  active ? `${meta.border.replace('/30', '')} ${meta.text} font-bold` : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="mb-3"><Tag color={topicColor}>{LS_TOPICS.find((t) => t.id === topic)?.label}</Tag></div>

          {topic === 'over' && (
            <>
              <Def term="Overdetermined System" color="cyan">
                You have {points.length} data points but only {degree + 1} unknowns (polynomial coefficients). That's {points.length}{' '}
                equations, {degree + 1} unknowns — an <strong>overdetermined system</strong> Ax = b where A is {points.length}×{degree + 1}.
                In general, no exact solution exists. We find the <em>closest</em> one instead.
              </Def>
              <Insight label="WHY NO EXACT SOLUTION EXISTS" color="cyan">
                Your {points.length} noisy data points don't all lie on any single degree-{degree} polynomial. b (your y-values) is NOT in
                the column space of A. We need to find x̂ that makes Ax̂ as close to b as possible — minimizing ‖b − Ax‖². The red dashed
                lines on the plot are the residuals r = b − Ax̂.
              </Insight>
              <Eq color="cyan">{`System: Ax = b    (${points.length} equations, ${degree + 1} unknowns)

A = Vandermonde matrix (each row: [1, xᵢ, xᵢ², …])
x = [c₀, c₁, …, c_d]ᵀ  (coefficients to find)
b = [y₁, y₂, …, y_n]ᵀ  (observed values)

Current: A is ${points.length}×${degree + 1},  rank(A) = ${Math.min(points.length, degree + 1)}`}</Eq>
              <Def term="Residual Vector" color="cyan">
                r = b − Ax̂ is the <strong>residual</strong> — the error. RSS = ‖r‖² = {rss.toFixed(3)} = sum of squared vertical distances
                on the plot. Least squares finds x̂ that minimizes this.
              </Def>
            </>
          )}

          {topic === 'normal' && (
            <>
              <Def term="Normal Equation" color="amber">
                Minimizing ‖b − Ax‖² leads to the <strong>normal equation</strong>:<br />
                <span className="text-amber-600 dark:text-amber-400 font-mono">AᵀAx = Aᵀb</span><br />
                This is a square ({degree + 1}×{degree + 1}) system that always has a unique solution when A has full column rank
                (columns linearly independent).
              </Def>
              <div className="mb-2.5">
                <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-2">AᵀA (LIVE — {degree + 1}×{degree + 1})</div>
                <SmallMatrix data={AtA} color="amber" hlDiag />
              </div>
              <div className="mb-2.5">
                <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-2">SOLUTION x̂ = (AᵀA)⁻¹Aᵀb</div>
                <div className="font-mono text-[11px] leading-loose p-3 rounded-lg bg-white/70 dark:bg-white/[0.03] border border-amber-500/25">
                  {coeffs.map((c, i) => (
                    <div key={i}>
                      <span className="text-slate-400 dark:text-slate-500">c{i} = </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{c.toFixed(4)}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-2">(coefficient of x^{i})</span>
                    </div>
                  ))}
                </div>
              </div>
              <Insight label="WHY AᵀA IS ALWAYS SQUARE AND SYMMETRIC" color="amber">
                A is {points.length}×{degree + 1}. Aᵀ is {degree + 1}×{points.length}. So AᵀA is {degree + 1}×{degree + 1} — always
                square regardless of how many data points. It's also symmetric (AᵀA = (AᵀA)ᵀ) and positive semi-definite. This is why the
                normal equation is solvable even when A isn't square.
              </Insight>
            </>
          )}

          {topic === 'colspace' && (
            <>
              <Def term="Projection onto Column Space" color="green">
                The least-squares solution Ax̂ = p is the <strong>orthogonal projection</strong> of b onto Col(A). The projection matrix is:<br />
                <span className="text-green-600 dark:text-green-400 font-mono">P = A(AᵀA)⁻¹Aᵀ</span>
              </Def>
              <Insight label="THE FUNDAMENTAL THEOREM OF LINEAR ALGEBRA" color="green">
                ℝⁿ splits into two orthogonal subspaces:<br />
                Col(A) ⊕ Null(Aᵀ) = ℝⁿ<br /><br />
                Your b (observed data) lives in ℝⁿ. It splits into:<br />
                <strong>p = Ax̂</strong> (projection INTO Col(A) — the fit)<br />
                <strong>r = b − p</strong> (residual — perpendicular to Col(A))<br /><br />
                The red dashed lines on the canvas ARE this orthogonal decomposition. Least squares finds p because p is the closest point
                in Col(A) to b.
              </Insight>
              <Eq color="green">{`b     = p       +  r
      ↓              ↓
b = Ax̂  +  (b − Ax̂)
        ↓              ↓
   in Col(A)    ⊥ to Col(A)

‖b‖² = ‖p‖² + ‖r‖²  (Pythagoras!)`}</Eq>
              <Def term="Why Aᵀr = 0 (Optimality Condition)" color="green">
                At the optimal x̂, the residual r is perpendicular to every column of A. This means Aᵀr = 0 — and substituting r = b−Ax̂
                gives Aᵀ(b−Ax̂) = 0, which rearranges to the normal equation AᵀAx̂ = Aᵀb. The two derivations are the same thing:
                geometry = algebra.
              </Def>
            </>
          )}

          {topic === 'svdls' && (
            <>
              <Def term="Least Squares via SVD" color="violet">
                Using A = UΣVᵀ, the least-squares solution becomes:<br />
                <span className="text-violet-600 dark:text-violet-400 font-mono">x̂ = V Σ⁺ Uᵀ b</span><br />
                where Σ⁺ is the <strong>pseudoinverse</strong> of Σ — replace each σᵢ with 1/σᵢ (and 0 where σᵢ=0). This works even when
                AᵀA is singular.
              </Def>
              <Insight label="WHY SVD IS BETTER THAN NORMAL EQUATIONS" color="violet">
                The normal equation AᵀAx = Aᵀb involves AᵀA, whose condition number is σ_max²/σ_min² — squaring the condition number of A.
                For your current data: <strong>κ(A) = {Number.isFinite(condA) ? condA.toFixed(1) : '∞'}</strong>, but{' '}
                <strong>κ(AᵀA) = {Number.isFinite(condAtA) ? condAtA.toFixed(1) : '∞'}</strong> (computed live via <code>conditionNumber()</code>)
                — numerically terrible when A is nearly rank-deficient. SVD works directly with A's singular values and is the most
                numerically stable method. MATLAB's backslash operator uses SVD.
              </Insight>
              <Def term="Moore-Penrose Pseudoinverse" color="violet">
                A⁺ = V Σ⁺ Uᵀ is the pseudoinverse of A. It generalizes the inverse to non-square and singular matrices. Properties:<br />
                • AA⁺A = A<br />
                • A⁺AA⁺ = A⁺<br />
                • (AA⁺)ᵀ = AA⁺  (symmetric projection)<br />
                The least-squares solution is x̂ = A⁺b, the minimum-norm solution.
              </Def>
              <Insight label="THE UNIFIED PICTURE" color="violet">
                SVD + least squares appear together everywhere: linear regression (data science), GPS positioning (overdetermined
                trilateration), image reconstruction (MRI), principal component analysis, control systems, signal denoising, Google's
                PageRank. The math you're learning in class IS the engine of modern computing.
              </Insight>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
