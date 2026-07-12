import { useMemo } from 'react'
import { RefreshCw, Zap } from 'lucide-react'
import { Button, LearnBox, Range, Stat } from '../atoms.jsx'
import { computeImageSVD, computePSNR, reconstructFromSVD, svdToImage, SVD_H, SVD_W } from '../imageMath.js'
import type { ImgData, SvdState } from '../types.js'

interface SvdPanelProps {
  image: ImgData
  svdState: SvdState
  setSvdState: (fn: (prev: SvdState) => SvdState) => void
  addEntry: (entry: { type: string; label: string }) => void
}

export function SvdPanel({ image, svdState, setSvdState, addEntry }: SvdPanelProps) {
  const { data, k, computing } = svdState
  const maxK = data ? Math.min(data.sigmas.length, SVD_W, SVD_H) : 1

  const reconstructed = useMemo(() => {
    if (!data) return null
    return reconstructFromSVD(data.U, data.V, data.sigmas, k, data.w, data.h)
  }, [data, k])

  const { psnr, compressionRatio, energyFraction } = useMemo(() => {
    if (!data || !reconstructed) return { psnr: null, compressionRatio: null, energyFraction: null }
    const origFlat = new Float32Array(data.h * data.w)
    for (let r = 0; r < data.h; r++) for (let c = 0; c < data.w; c++) origFlat[r * data.w + c] = data.gray[r][c]
    const psnrVal = computePSNR(origFlat, reconstructed, data.w, data.h)
    const originalStorage = data.w * data.h
    const svdStorage = k * (data.h + data.w + 1)
    const totalSigmaEnergy = data.sigmas.reduce((s, v) => s + v * v, 0)
    const kSigmaEnergy = data.sigmas.slice(0, k).reduce((s, v) => s + v * v, 0)
    return {
      psnr: psnrVal === Infinity ? '∞' : psnrVal.toFixed(1),
      compressionRatio: (originalStorage / svdStorage).toFixed(2),
      energyFraction: (kSigmaEnergy / totalSigmaEnergy * 100).toFixed(1),
    }
  }, [data, reconstructed, k])

  const svdPreviewImage = useMemo(() => {
    if (!reconstructed || !data) return null
    return svdToImage(reconstructed, data.w, data.h)
  }, [reconstructed, data])

  function compute() {
    setSvdState((s) => ({ ...s, computing: true }))
    setTimeout(() => {
      try {
        const result = computeImageSVD(image)
        const initK = Math.min(20, result.sigmas.length)
        setSvdState(() => ({ data: result, k: initK, computing: false }))
        addEntry({ type: 'svd_compute', label: `Computed SVD (${result.sigmas.length} singular values)` })
      } catch {
        setSvdState((s) => ({ ...s, computing: false }))
      }
    }, 50)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={compute} disabled={computing} className="gap-2">
          <Zap className="h-3.5 w-3.5" />
          {computing ? 'Computing SVD…' : data ? 'Recompute SVD' : 'Compute SVD'}
        </Button>
        {data && <span className="font-mono text-[10px] text-slate-400">{data.sigmas.length} singular values · {data.h}×{data.w} matrix</span>}
      </div>

      {!data && !computing && (
        <LearnBox>
          <strong>What is SVD?</strong> Singular Value Decomposition breaks a matrix A into three parts: A = U × Σ × Vᵀ.
          U and V are rotation matrices. Σ (Sigma) is a diagonal matrix of "importance scores" called <em>singular values</em> — the largest ones capture the most structure in your image.
          By keeping only the top-k singular values, we can reconstruct an <em>approximation</em> of the image using far less data — this is image compression.
        </LearnBox>
      )}

      {computing && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Computing SVD — factorizing the {SVD_H}×{SVD_W} grayscale matrix…</span>
        </div>
      )}

      {data && !computing && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <Range
              label={`Keep top-k singular values (k = ${k} of ${maxK})`}
              value={k} min={1} max={maxK} step={1}
              onChange={(v) => setSvdState((s) => ({ ...s, k: v }))}
            />
            <div>
              <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">Singular value magnitude (σ₁ … σ{data.sigmas.length})</div>
              <div className="flex h-16 items-end gap-px overflow-hidden rounded-xl border border-slate-200/50 bg-white/40 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                {data.sigmas.map((sv, i) => {
                  const pct = sv / data.sigmas[0] * 100
                  const kept = i < k
                  return (
                    <div key={i} title={`σ${i + 1} = ${sv.toFixed(1)}`}
                      className={`flex-1 rounded-t transition-colors ${kept ? 'bg-brand-500 shadow-md shadow-brand-500/60' : 'bg-slate-300 dark:bg-white/10'}`}
                      style={{ height: `${Math.max(2, pct)}%` }} />
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-slate-400">
                <span>σ₁ = {data.sigmas[0].toFixed(0)} (largest)</span>
                <span>σ{data.sigmas.length} = {data.sigmas[data.sigmas.length - 1].toFixed(1)} (smallest)</span>
              </div>
            </div>
            {svdPreviewImage && (
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">Rank-{k} reconstruction (grayscale)</div>
                <div className="overflow-hidden rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10">
                  <canvas
                    width={svdPreviewImage.width}
                    height={svdPreviewImage.height}
                    ref={(el) => {
                      if (!el) return
                      const ctx = el.getContext('2d')
                      if (!ctx) return
                      const id = ctx.createImageData(svdPreviewImage.width, svdPreviewImage.height)
                      id.data.set(svdPreviewImage.pixels)
                      ctx.putImageData(id, 0, 0)
                    }}
                    className="mx-auto block max-w-md"
                    style={{ imageRendering: 'pixelated', width: '100%', aspectRatio: `${svdPreviewImage.width}/${svdPreviewImage.height}` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Stat label="Singular values kept" value={`${k} / ${maxK}`} highlight />
            <Stat label="Energy captured" value={`${energyFraction}%`} />
            <Stat label="PSNR (quality)" value={`${psnr} dB`} />
            <Stat label="Compression ratio" value={`${compressionRatio}×`} />
            <Stat label="Original values" value={(data.w * data.h).toLocaleString()} />
            <Stat label="SVD storage" value={(k * (data.h + data.w + 1)).toLocaleString()} />
            <LearnBox>
              <strong>PSNR</strong> (Peak Signal-to-Noise Ratio) measures quality in decibels. Above 40 dB = near-perfect. Below 20 dB = heavily degraded.
              <br /><br />
              <strong>Energy</strong> tells you what fraction of the image's "information" you're keeping. The first singular value alone often captures 50–80% of energy.
            </LearnBox>
          </div>
        </div>
      )}
    </div>
  )
}
