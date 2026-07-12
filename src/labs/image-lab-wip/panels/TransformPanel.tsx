import { useMemo } from 'react'
import { RotateCw } from 'lucide-react'
import { Button, LearnBox, Range, SectionHeader } from '../atoms.jsx'
import { applyAffineTransform, getTransformMatrix, TRANSFORM_TYPES } from '../imageMath.js'
import type { ImgData, TransformState } from '../types.js'

interface TransformPanelProps {
  image: ImgData
  transformState: TransformState
  setTransformState: (fn: (prev: TransformState) => TransformState) => void
  onTransformed: (img: ImgData) => void
  addEntry: (entry: { type: string; label: string }) => void
}

export function TransformPanel({ image, transformState, setTransformState, onTransformed, addEntry }: TransformPanelProps) {
  const { type, angle, scale, shear, customMatrix } = transformState

  const matrix = useMemo(() => {
    if (type === 'custom') return customMatrix
    return getTransformMatrix(type, { angle, scale, shear })
  }, [type, angle, scale, shear, customMatrix])

  function applyTransform() {
    const result = applyAffineTransform(image, matrix)
    onTransformed(result)
    addEntry({ type: 'transform', label: `Applied ${type} transform (angle=${angle}°, scale=${scale}, shear=${shear})` })
  }

  function updateMatrix(row: number, col: number, val: string) {
    const m = customMatrix.map((r) => [...r])
    m[row][col] = Number(val)
    setTransformState((s) => ({ ...s, customMatrix: m, type: 'custom' }))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="space-y-4">
        <div>
          <SectionHeader label="Transform type" />
          <div className="flex flex-wrap gap-1.5">
            {TRANSFORM_TYPES.map((t) => (
              <Button key={t.id} active={type === t.id} onClick={() => setTransformState((s) => ({ ...s, type: t.id as TransformState['type'] }))}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>
        {type === 'rotate' && (
          <Range label="Angle" value={angle} min={-180} max={180} step={1} suffix="°" onChange={(v) => setTransformState((s) => ({ ...s, angle: v }))} />
        )}
        {type === 'scale' && (
          <Range label="Scale" value={scale} min={0.1} max={3} step={0.05} onChange={(v) => setTransformState((s) => ({ ...s, scale: v }))} />
        )}
        {type === 'shear' && (
          <Range label="Shear" value={shear} min={-1.5} max={1.5} step={0.05} onChange={(v) => setTransformState((s) => ({ ...s, shear: v }))} />
        )}
        <Button onClick={applyTransform} className="w-full shadow-md">
          <RotateCw className="h-4 w-4" /> Apply to Image
        </Button>
      </div>

      <div className="space-y-4">
        <SectionHeader label="Transformation Matrix" />
        <div className="rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-500/10 to-sky-500/5 p-4 shadow-inner backdrop-blur-sm">
          <div className="mb-3 text-[11px] leading-relaxed text-brand-800 dark:text-brand-200">
            Edit any cell to create a custom transform. This 2×3 matrix encodes the full affine operation.
          </div>
          <div className="grid grid-cols-3 gap-2">
            {matrix.map((row, r) => row.map((v, c) => (
              <input key={`${r}-${c}`} type="number" step="0.01"
                value={Math.round(v * 1000) / 1000}
                onChange={(e) => updateMatrix(r, c, e.target.value)}
                className="h-10 rounded-lg border border-slate-200/50 bg-white/60 text-center font-mono text-xs font-bold text-slate-800 shadow-sm transition-all focus:border-brand-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-slate-100 dark:focus:bg-black/80"
              />
            )))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400/80">
            <span>a (scale X)</span><span>b (shear X)</span><span>tx (shift X)</span>
            <span>c (shear Y)</span><span>d (scale Y)</span><span>ty (shift Y)</span>
          </div>
        </div>
        <LearnBox>
          <strong>Affine transforms</strong> are linear operations that can be written as a matrix multiplication.
          <br />Every pixel (x, y) maps to (a·x + b·y + tx, c·x + d·y + ty).
          <br /><br />
          <strong>Rotation</strong> by angle θ uses: a = cos θ, b = −sin θ, c = sin θ, d = cos θ.
          <br />Try editing the matrix directly — watch the image change!
        </LearnBox>
      </div>
    </div>
  )
}
