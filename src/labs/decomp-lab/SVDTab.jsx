import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { svdDecomp, singularValues, matrixRank, conditionNumber } from '../../engines/openmat/openmatEngine.js'
import { svdReconstruct, makeTestImage } from './mathHelpers.js'
import { Tag, Def, Insight, Eq, ImageCanvas } from './atoms.jsx'
import { GLASS_META } from '../../styles/courseColors.js'

const SVD_TOPICS = [
  { id: 'what', label: 'What is SVD?', color: 'violet' },
  { id: 'usigmav', label: 'U · Σ · Vᵀ', color: 'cyan' },
  { id: 'rank', label: 'Rank & Energy', color: 'amber' },
  { id: 'project', label: 'Projection', color: 'green' },
  { id: 'ortho', label: 'Gram-Schmidt', color: 'pink' },
]

const DEFAULT_M = 36, DEFAULT_N = 48
const MAX_UPLOAD_PX = 160

function readImageToMatrix(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width, h = img.height
        const scale = Math.min(MAX_UPLOAD_PX / w, MAX_UPLOAD_PX / h, 1)
        w = Math.max(4, Math.round(w * scale))
        h = Math.max(4, Math.round(h * scale))
        const cnv = document.createElement('canvas')
        cnv.width = w; cnv.height = h
        const ctx = cnv.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data
        const matrix = Array.from({ length: h }, (_, r) =>
          Array.from({ length: w }, (_, c) => {
            const i = 4 * (r * w + c)
            return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          })
        )
        resolve(matrix)
      }
      img.onerror = reject
      img.src = ev.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Dropzone({ onFile, isCustom, onReset }) {
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onFile(file)
      }}
      onClick={() => fileRef.current?.click()}
      className={`w-full mt-2 px-3 py-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
        dragOver
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
          : 'border-slate-300 dark:border-white/15 hover:border-violet-400 dark:hover:border-violet-500/50'
      }`}
    >
      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        {dragOver ? 'Drop image to decompose' : '↑ Drag & drop an image, or click to browse'}
      </div>
      {isCustom && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onReset() }}
          className="mt-1.5 text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
        >
          reset to default image
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function SVDTab() {
  const defaultImg = useMemo(() => makeTestImage(DEFAULT_M, DEFAULT_N), [])
  const [original, setOriginal] = useState(defaultImg)
  const [isCustom, setIsCustom] = useState(false)
  const [k, setK] = useState(4)
  const [topic, setTopic] = useState('what')

  const m = original.length
  const n = original[0]?.length ?? DEFAULT_N

  const { U, V } = useMemo(() => svdDecomp(original), [original])
  const S = useMemo(() => singularValues(original), [original])
  const maxK = S.filter((s) => s > 0.1).length
  const rank = useMemo(() => matrixRank(original), [original])
  const cond = useMemo(() => conditionNumber(original), [original])

  useEffect(() => { setK((prev) => Math.min(prev, Math.max(1, maxK))) }, [maxK])

  const reconstructed = useMemo(() => svdReconstruct(U, S, V, k), [U, S, V, k])
  const totalEnergy = useMemo(() => S.reduce((s, v) => s + v * v, 0), [S])
  const capturedPct = useMemo(() => S.slice(0, k).reduce((s, v) => s + v * v, 0) / totalEnergy * 100, [S, k, totalEnergy])
  const compressionRatio = useMemo(() => {
    const orig = m * n
    const compressed = k * (m + n + 1)
    return (orig / compressed).toFixed(2)
  }, [k, m, n])
  const residual = useMemo(
    () => original.map((row, r) => row.map((v, c) => Math.abs(v - reconstructed[r][c]))),
    [original, reconstructed]
  )

  const topicColor = SVD_TOPICS.find((t) => t.id === topic)?.color ?? 'violet'
  const topicMeta = GLASS_META[topicColor]

  const handleFile = useCallback(async (file) => {
    try {
      const matrix = await readImageToMatrix(file)
      setOriginal(matrix)
      setIsCustom(true)
      setK(4)
    } catch { /* unreadable file — silently ignore, user can retry */ }
  }, [])

  const handleReset = useCallback(() => {
    setOriginal(defaultImg)
    setIsCustom(false)
    setK(4)
  }, [defaultImg])

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Left: images + controls */}
      <div className="w-[360px] flex-shrink-0 border-r border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
        <div className="p-4 flex flex-col gap-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
          <div className="flex flex-wrap gap-3">
            <ImageCanvas matrix={original} width={110} height={82} label="ORIGINAL" badge={`${m}×${n}`} />
            <ImageCanvas matrix={reconstructed} width={110} height={82} label="RECONSTRUCTED" badge={`k=${k}`} />
            <ImageCanvas matrix={residual} width={110} height={82} label="RESIDUAL" badge="error" />
          </div>
          <Dropzone onFile={handleFile} isCustom={isCustom} onReset={handleReset} />
          {isCustom && (
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Custom image — {m}×{n} px (scaled to fit, max {MAX_UPLOAD_PX}px)
            </div>
          )}
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Singular values kept: <span className="font-bold text-violet-600 dark:text-violet-400">k = {k}</span>
              <span className="text-slate-400 dark:text-slate-600"> / {maxK}</span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400">{capturedPct.toFixed(1)}% energy</span>
          </div>
          <input
            type="range" min={1} max={maxK} step={1} value={k}
            onChange={(e) => setK(parseInt(e.target.value, 10))}
            className="w-full accent-violet-600 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1">
            <span>k=1 (blurry)</span><span>k={maxK} (lossless)</span>
          </div>
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2 bg-slate-50/60 dark:bg-white/[0.02]">
          {[
            { label: 'COMPRESSION', val: `${compressionRatio}×`, color: 'green' },
            { label: 'ENERGY KEPT', val: `${capturedPct.toFixed(1)}%`, color: 'amber' },
            { label: 'RANK', val: `${rank}`, color: 'violet' },
            { label: 'CONDITION #', val: Number.isFinite(cond) ? cond.toFixed(1) : '∞', color: 'cyan' },
          ].map(({ label, val, color }) => {
            const meta = GLASS_META[color]
            return (
              <div key={label} className={`text-center p-2 rounded-lg border ${meta.border} bg-white/70 dark:bg-white/[0.03]`}>
                <div className={`text-[17px] font-bold font-mono ${meta.text}`}>{val}</div>
                <div className="text-[8px] tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">{label}</div>
              </div>
            )
          })}
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-2">
            SINGULAR VALUES σᵢ — each bar = one "layer" of the image
          </div>
          <div className="flex items-end gap-0.5 h-20">
            {S.slice(0, maxK).map((sv, i) => {
              const h = Math.max(2, (sv / S[0]) * 76)
              const kept = i < k
              return (
                <div
                  key={i}
                  title={`σ${i}=${sv.toFixed(1)}`}
                  onClick={() => setK(i + 1)}
                  style={{ height: h }}
                  className={`flex-1 min-w-[4px] rounded-t cursor-pointer transition-colors ${kept ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[8px] font-mono text-slate-400 dark:text-slate-500 mt-1">
            <span>σ₀={S[0]?.toFixed(0)} (largest)</span>
            <span>σ{maxK - 1}={S[maxK - 1]?.toFixed(1)} (smallest)</span>
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5">Click a bar to set k. Violet = kept, gray = discarded.</div>
        </div>
      </div>

      {/* Right: concepts */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-white/10 flex-shrink-0 overflow-x-auto">
          {SVD_TOPICS.map((t) => {
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
          <div className="mb-3"><Tag color={topicColor}>{SVD_TOPICS.find((t) => t.id === topic)?.label}</Tag></div>

          {topic === 'what' && (
            <>
              <Def term="Singular Value Decomposition" color="violet">
                Every matrix A (m×n) can be written as:<br />
                <span className="text-violet-600 dark:text-violet-400 font-mono">A = U · Σ · Vᵀ</span><br />
                U is m×m orthogonal, Σ is m×n diagonal (singular values on diagonal), Vᵀ is n×n orthogonal.
                The singular values σᵢ in Σ are always ≥ 0 and sorted largest to smallest.
              </Def>
              <Insight label="THE IMAGE IS THE MATRIX" color="violet">
                This {m}×{n} image <em>is</em> a matrix of numbers — pixel brightness 0–255. SVD decomposes it into{' '}
                <strong>{maxK} rank-1 "layers"</strong>, each one a single outer product σᵢ·uᵢ·vᵢᵀ. The first layer (largest σ) captures
                the most information. You're throwing away layers with small σ — that's compression.
              </Insight>
              <Eq color="violet">{`A = σ₁·u₁v₁ᵀ  +  σ₂·u₂v₂ᵀ  +  …  +  σᵣ·uᵣvᵣᵀ

  k=${k}: keeping first ${k} term${k > 1 ? 's' : ''}
  Energy captured: ${capturedPct.toFixed(1)}%`}</Eq>
              <Def term="Rank-1 Outer Product" color="violet">
                uᵢ·vᵢᵀ is an m×n matrix formed from one column of U and one row of Vᵀ. It's the simplest possible matrix — rank 1 —
                one "pattern" scaled by σᵢ. SVD says any matrix is a sum of these patterns, ordered by importance.
              </Def>
            </>
          )}

          {topic === 'usigmav' && (
            <>
              <Def term="U matrix (left singular vectors)" color="cyan">
                U is m×m and <strong>orthogonal</strong> — its columns are orthonormal vectors that form a basis for the row space of A.
                Each column uᵢ is a "pattern" in pixel-row space.
              </Def>
              <Def term="Σ (Sigma) — the diagonal" color="amber">
                Σ has singular values σ₁ ≥ σ₂ ≥ … ≥ σᵣ ≥ 0 on the diagonal. σᵢ² = eigenvalue of AᵀA. Large σᵢ = important pattern.
                σᵢ = 0 means that direction carries no information.
              </Def>
              <div className="mb-2.5">
                <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-1.5">TOP 6 SINGULAR VALUES (current image)</div>
                <div className="flex flex-wrap gap-1.5">
                  {S.slice(0, 6).map((sv, i) => (
                    <div key={i} className={`px-2.5 py-1.5 rounded-md border font-mono text-[11px] ${i < k ? 'border-amber-500/40' : 'border-slate-300 dark:border-white/10'}`}>
                      <div className={`font-bold ${i < k ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>σ{i} = {sv.toFixed(1)}</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{(S[i] * S[i] / totalEnergy * 100).toFixed(1)}% energy</div>
                    </div>
                  ))}
                </div>
              </div>
              <Def term="Vᵀ (right singular vectors)" color="green">
                Vᵀ is n×n orthogonal. Its rows (= V's columns) are orthonormal vectors that form a basis for the column space of A.
                Each row vᵢᵀ is a "pattern" in pixel-column space.
              </Def>
              <Insight label="WHY Uᵀ U = I AND VᵀV = I" color="cyan">
                U and V are orthogonal matrices — their columns are mutually perpendicular unit vectors (orthonormal basis). This means Uᵀ=U⁻¹.
                In the image: the U patterns are uncorrelated row-patterns, V patterns are uncorrelated column-patterns. Orthogonality is
                what lets you discard layers independently without cross-contamination.
              </Insight>
            </>
          )}

          {topic === 'rank' && (
            <>
              <Def term="Rank" color="amber">
                The rank of a matrix = number of non-zero singular values = number of linearly independent rows (= linearly independent
                columns). This image has rank <strong>{rank}</strong> (computed live via <code>matrixRank()</code>) — it takes {rank} layers
                to represent it exactly. Using k&lt;{rank} gives an approximation (rank-k approximation).
              </Def>
              <Insight label="ENERGY = σᵢ² / Σσⱼ²" color="amber">
                The "energy" (Frobenius norm squared) of each layer is σᵢ². Keeping k layers captures {capturedPct.toFixed(1)}% of total
                energy. This is the mathematical reason JPEG-like compression works — human eyes don't notice the missing low-energy layers.
              </Insight>
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-white/70 dark:bg-white/[0.03] mb-2.5">
                <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-2">CUMULATIVE ENERGY vs K</div>
                {[1, 2, 3, 5, 8, 12, 20, maxK].map((ki) => {
                  if (ki > maxK) return null
                  const pct = S.slice(0, ki).reduce((s, v) => s + v * v, 0) / totalEnergy * 100
                  return (
                    <div key={ki} className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-[10px] min-w-[36px] ${ki <= k ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>k={ki}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${ki <= k ? 'bg-amber-500' : 'bg-slate-400/60 dark:bg-slate-600'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`font-mono text-[10px] min-w-[42px] text-right ${ki <= k ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>{pct.toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
              <Def term="Condition Number" color="amber">
                κ(A) = σ_max / σ_min = <strong>{Number.isFinite(cond) ? cond.toFixed(1) : '∞'}</strong> for this image (computed live via{' '}
                <code>conditionNumber()</code>). A large condition number means the smallest layers are numerically fragile — tiny changes
                to the image can swing them wildly, which is exactly why they're safe to discard first.
              </Def>
              <Def term="Eckart–Young–Mirsky Theorem" color="amber">
                The rank-k SVD truncation is the <strong>best possible rank-k approximation</strong> of A in both Frobenius and spectral
                norms. No other rank-k matrix is closer to A. This is why SVD is used for compression, not just any factorization.
              </Def>
            </>
          )}

          {topic === 'project' && (
            <>
              <Def term="Orthogonal Projection" color="green">
                The projection of vector b onto the column space of A is:<br />
                <span className="text-green-600 dark:text-green-400 font-mono">p = A(AᵀA)⁻¹Aᵀ b</span><br />
                The matrix P = A(AᵀA)⁻¹Aᵀ is called the <strong>projection matrix</strong>. It "drops a perpendicular" from b down to the
                closest point in Col(A).
              </Def>
              <Insight label="SVD MAKES PROJECTION TRIVIAL" color="green">
                With A = UΣVᵀ, the projection matrix becomes P = UUᵀ. Projecting onto the first k columns: P_k = U_k U_kᵀ. That's all SVD
                compression is — projecting the image onto the k-dimensional subspace spanned by the first k left singular vectors.
              </Insight>
              <Eq color="green">{`Projection onto rank-${k} subspace:
P_${k} = U_${k} U_${k}ᵀ

For any image vector x:
  p = P_${k} x  ← best approximation in k dimensions
  r = x - p    ← residual, ⊥ to Col(U_${k})`}</Eq>
              <Def term="Orthogonal Complement" color="green">
                The residual r = b − p is orthogonal to every vector in Col(A). So ℝⁿ = Col(A) ⊕ Null(Aᵀ) — every vector splits into a
                projection (in the column space) plus a residual (in the left null space). This decomposition is fundamental to least squares.
              </Def>
            </>
          )}

          {topic === 'ortho' && (
            <>
              <Def term="Gram-Schmidt Process" color="pink">
                Given linearly independent vectors v₁,v₂,…,vₙ, Gram-Schmidt produces an orthonormal basis q₁,q₂,…,qₙ for the same space:
              </Def>
              <Eq color="pink">{`u₁ = v₁
q₁ = u₁ / ‖u₁‖

u₂ = v₂ − (v₂·q₁)q₁        ← remove component along q₁
q₂ = u₂ / ‖u₂‖

u₃ = v₃ − (v₃·q₁)q₁ − (v₃·q₂)q₂
q₃ = u₃ / ‖u₃‖`}</Eq>
              <Insight label="GRAM-SCHMIDT BUILDS THE U AND V MATRICES" color="pink">
                The columns of U in SVD are orthonormal — they were built by running Gram-Schmidt on the eigenvectors of AAᵀ. The QR
                decomposition (A = QR) is essentially Gram-Schmidt stored as a matrix factorization. Every time you use SVD, Gram-Schmidt
                is hiding inside.
              </Insight>
              <Def term="QR Decomposition" color="pink">
                QR factors A into an orthogonal matrix Q (Gram-Schmidt output) and an upper-triangular matrix R. Numerically, QR
                decomposition is HOW computers compute SVD — it's more stable than working with AᵀA directly.
              </Def>
              <Insight label="WHY ORTHOGONALITY IS THE WHOLE GAME" color="pink">
                Orthogonal bases let you handle each component independently. When Q is orthogonal, Qᵀ = Q⁻¹ (free inversion!), projections
                are just dot products, and you can add/remove components without affecting others. Gram-Schmidt is how you manufacture this
                beautiful structure from any basis.
              </Insight>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
