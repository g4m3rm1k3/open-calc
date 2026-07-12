import { useMemo, useState } from 'react'
import { Archive } from 'lucide-react'
import { Button, LearnBox, Range } from '../atoms.jsx'
import { clamp, computeImageSVD, computePSNR, makeImageData, reconstructFromSVD, svdToImage, toGrayMatrix, SVD_H, SVD_W } from '../imageMath.js'
import type { ImgData, SvdState } from '../types.js'

interface CompressionPanelProps {
  image: ImgData
  svdState: SvdState
  setSvdState: (fn: (prev: SvdState) => SvdState) => void
  addEntry: (entry: { type: string; label: string }) => void
}

function MiniCanvas({ img }: { img: ImgData }) {
  return (
    <canvas
      width={img.width} height={img.height}
      ref={(el) => {
        if (!el) return
        const ctx = el.getContext('2d')
        if (!ctx) return
        const id = ctx.createImageData(img.width, img.height)
        id.data.set(img.pixels)
        ctx.putImageData(id, 0, 0)
      }}
      style={{ imageRendering: 'pixelated', width: '100%', aspectRatio: `${img.width}/${img.height}` }}
      className="rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10"
    />
  )
}

export function CompressionPanel({ image, svdState, setSvdState, addEntry }: CompressionPanelProps) {
  const { data, computing } = svdState
  const [rank, setRank] = useState(10)
  const [quantBits, setQuantBits] = useState(4)

  function computeSVD() {
    setSvdState((s) => ({ ...s, computing: true }))
    setTimeout(() => {
      try {
        const result = computeImageSVD(image)
        setSvdState((s) => ({ ...s, data: result, k: rank, computing: false }))
        addEntry({ type: 'compress_svd', label: 'Computed image SVD for compression comparison' })
      } catch {
        setSvdState((s) => ({ ...s, computing: false }))
      }
    }, 50)
  }

  const quantized = useMemo(() => {
    const step = 256 / Math.pow(2, quantBits)
    const out = new Uint8ClampedArray(image.pixels.length)
    for (let i = 0; i < image.pixels.length; i += 4) {
      out[i] = clamp(Math.round(image.pixels[i] / step) * step)
      out[i + 1] = clamp(Math.round(image.pixels[i + 1] / step) * step)
      out[i + 2] = clamp(Math.round(image.pixels[i + 2] / step) * step)
      out[i + 3] = 255
    }
    return makeImageData(image.width, image.height, out)
  }, [image, quantBits])

  const svdRecon = useMemo(() => {
    if (!data) return null
    const flat = reconstructFromSVD(data.U, data.V, data.sigmas, rank, data.w, data.h)
    return svdToImage(flat, data.w, data.h)
  }, [data, rank])

  const psnrs = useMemo(() => {
    const origGray = new Float32Array(image.width * image.height)
    for (let i = 0; i < image.width * image.height; i++) origGray[i] = 0.299 * image.pixels[i * 4] + 0.587 * image.pixels[i * 4 + 1] + 0.114 * image.pixels[i * 4 + 2]

    const quantGray = new Float32Array(quantized.pixels.length / 4)
    for (let i = 0; i < quantized.width * quantized.height; i++) quantGray[i] = 0.299 * quantized.pixels[i * 4] + 0.587 * quantized.pixels[i * 4 + 1] + 0.114 * quantized.pixels[i * 4 + 2]

    const qPsnr = computePSNR(origGray, quantGray, image.width, image.height)

    if (data && svdRecon) {
      const origLow = new Float32Array(data.h * data.w)
      const origGrayLow = toGrayMatrix(image, data.w, data.h)
      for (let r = 0; r < data.h; r++) for (let c = 0; c < data.w; c++) origLow[r * data.w + c] = origGrayLow[r][c]
      const reconGray = new Float32Array(data.h * data.w)
      for (let i = 0; i < data.h * data.w; i++) reconGray[i] = svdRecon.pixels[i * 4]
      const svdPsnr = computePSNR(origLow, reconGray, data.w, data.h)
      return { quant: qPsnr === Infinity ? '∞' : qPsnr.toFixed(1), svd: svdPsnr === Infinity ? '∞' : svdPsnr.toFixed(1) }
    }
    return { quant: qPsnr === Infinity ? '∞' : qPsnr.toFixed(1), svd: null as string | null }
  }, [image, quantized, data, svdRecon])

  const svdStorage = data ? rank * (data.h + data.w + 1) : 0
  const origStorage = image.width * image.height * 3

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={computeSVD} disabled={computing}>
          <Archive className="h-3.5 w-3.5" />
          {computing ? 'Computing…' : data ? 'Recompute' : 'Compute SVD'}
        </Button>
        <Range label={`SVD rank k=${rank}`} value={rank} min={1} max={data ? Math.min(data.sigmas.length, SVD_W, SVD_H) : 50} step={1}
          onChange={setRank} />
        <Range label={`Quantization bits=${quantBits}`} value={quantBits} min={1} max={8} step={1}
          onChange={setQuantBits} />
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="space-y-3 rounded-xl border border-slate-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">① Original</div>
          <MiniCanvas img={image} />
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-slate-500">Storage: {origStorage.toLocaleString()} bytes</div>
            <div className="font-mono text-[10px] text-slate-500">PSNR: ∞ dB (reference)</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">② Quantized ({quantBits}-bit)</div>
          <MiniCanvas img={quantized} />
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-slate-500">Storage: {Math.round(origStorage * quantBits / 8).toLocaleString()} bytes</div>
            <div className="font-mono text-[10px] text-slate-500">PSNR: {psnrs.quant} dB</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-all" style={{ width: `${Math.min(100, quantBits / 8 * 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">③ SVD rank-{rank}</div>
          {svdRecon ? <MiniCanvas img={svdRecon} /> : (
            <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-slate-300/50 text-[10px] font-semibold text-slate-400">
              {computing ? 'Computing…' : 'Press Compute SVD'}
            </div>
          )}
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-slate-500">Storage: ~{svdStorage.toLocaleString()} floats</div>
            <div className="font-mono text-[10px] text-slate-500">PSNR: {psnrs.svd ?? '…'} dB</div>
            {data && <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full bg-brand-500 shadow-md shadow-brand-500/40 transition-all" style={{ width: `${Math.min(100, svdStorage / origStorage * 100)}%` }} />
            </div>}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">④ Quantization Error</div>
          <div className="overflow-hidden rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10">
            <canvas
              width={image.width} height={image.height}
              ref={(el) => {
                if (!el) return
                const ctx = el.getContext('2d')
                if (!ctx) return
                const id = ctx.createImageData(image.width, image.height)
                for (let i = 0; i < image.pixels.length; i += 4) {
                  const diff = Math.abs(image.pixels[i] - quantized.pixels[i])
                  id.data[i] = clamp(diff * 4); id.data[i + 1] = 0; id.data[i + 2] = clamp(diff * 4); id.data[i + 3] = 255
                }
                ctx.putImageData(id, 0, 0)
              }}
              style={{ imageRendering: 'pixelated', width: '100%', aspectRatio: `${image.width}/${image.height}` }}
            />
          </div>
          <div className="font-mono text-[10px] text-slate-500">Purple = error. Brighter = larger difference</div>
        </div>
      </div>

      <LearnBox>
        <strong>Lossy vs Lossless compression:</strong> Quantization reduces bits per pixel (like PNG with less color depth).
        SVD compression keeps only the most important mathematical components.
        JPEG actually uses the Discrete Cosine Transform (related to FFT) + quantization — a combination of both approaches.
      </LearnBox>
    </div>
  )
}
