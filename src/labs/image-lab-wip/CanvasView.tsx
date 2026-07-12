import { useCallback, useEffect, useRef, type MouseEvent } from 'react'
import { clamp, pixelAt, toGrayMatrix, type HistBin } from './imageMath.js'
import type { ImgData, Inspect } from './types.js'

interface CanvasViewProps {
  image: ImgData
  original: ImgData
  mode: 'image' | 'difference'
  inspect: Inspect | null
  onInspect: (p: Inspect) => void
}

export function CanvasView({ image, original, mode, inspect, onInspect }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = image.width; canvas.height = image.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const frame = ctx.createImageData(image.width, image.height)
    if (mode === 'difference') {
      for (let i = 0; i < image.pixels.length; i += 4) {
        const diff = Math.max(
          Math.abs(original.pixels[i] - image.pixels[i]),
          Math.abs(original.pixels[i + 1] - image.pixels[i + 1]),
          Math.abs(original.pixels[i + 2] - image.pixels[i + 2]),
        )
        frame.data[i] = clamp(diff * 2.2); frame.data[i + 1] = clamp(36 + diff * 0.45)
        frame.data[i + 2] = clamp(255 - diff * 1.3); frame.data[i + 3] = 255
      }
    } else {
      frame.data.set(image.pixels)
    }
    ctx.putImageData(frame, 0, 0)
  }, [image, mode, original])

  const handleMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * image.width)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * image.height)
    onInspect(pixelAt(image, x, y))
  }, [image, onInspect])

  return (
    <div className="relative flex h-full min-h-[260px] flex-1 items-center justify-center overflow-hidden p-6">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(148,163,184,0.08)_25%,transparent_25%),linear-gradient(-45deg,rgba(148,163,184,0.08)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(148,163,184,0.08)_75%),linear-gradient(-45deg,transparent_75%,rgba(148,163,184,0.08)_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] opacity-50 dark:opacity-20" />
      <canvas
        ref={canvasRef}
        onMouseMove={handleMove}
        // A canvas's on-screen size defaults to its pixel buffer size (the
        // image's actual width/height, often well under 200px) — h-full/w-full
        // + object-contain scales the rendered bitmap up to fill whatever
        // space this view has, same aspect ratio, still crisp via pixelated.
        className="relative z-10 h-full w-full rounded-xl border border-slate-300/50 bg-white/10 object-contain shadow-2xl backdrop-blur-sm dark:border-white/10"
        style={{ imageRendering: 'pixelated' }}
      />
      {inspect && (
        <div className="pointer-events-none absolute left-6 top-6 z-20 rounded-xl border border-white/20 bg-white/80 px-4 py-3 text-xs shadow-2xl backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-950/80">
          <div className="mb-2 font-mono font-bold tracking-wider text-slate-900 dark:text-slate-100">POS ({inspect.x}, {inspect.y})</div>
          <div className="grid grid-cols-3 gap-3 font-mono text-[11px] font-semibold">
            <span className="text-red-500">R {inspect.r}</span>
            <span className="text-green-500">G {inspect.g}</span>
            <span className="text-blue-500">B {inspect.b}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function MatrixPreview({ image }: { image: ImgData }) {
  const matrix = toGrayMatrix(image, 12, 8)
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 1
  return (
    <div
      // Fixed cols-12 + h-8 cells sized this to a small corner regardless of
      // how much room the container actually had — grid-template now sized
      // off the real row/col counts, with 1fr tracks, so cells stretch to
      // fill whatever height/width MatrixPreview itself is given.
      className="grid h-full w-full min-h-[240px] gap-px overflow-hidden rounded-xl border border-slate-200/50 bg-slate-200/50 font-mono text-[9px] shadow-inner dark:border-white/10 dark:bg-white/5"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {matrix.flatMap((row, r) => row.map((v, c) => (
        <div key={`${r}-${c}`} className="flex items-center justify-center bg-white/80 text-slate-600 transition-colors hover:bg-brand-50 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:bg-brand-950" style={{ opacity: 0.48 + v / 510 }}>
          {Math.round(v)}
        </div>
      )))}
    </div>
  )
}

export function HistogramBars({ bins, channel = 'gray' }: { bins: HistBin[]; channel?: keyof HistBin }) {
  const max = Math.max(...bins.map((b) => b[channel]), 1)
  const color = { gray: 'bg-slate-500', r: 'bg-red-500', g: 'bg-emerald-500', b: 'bg-blue-500' }[channel]
  return (
    <div className="flex h-28 items-end gap-0.5 rounded-xl border border-slate-200/50 bg-white/40 p-2 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      {bins.map((b, i) => (
        <div key={i} title={`${i * 8}–${i * 8 + 7}: ${b[channel]}`}
          className={`min-w-1 flex-1 rounded-t ${color}`}
          style={{ height: `${Math.max(4, (b[channel] / max) * 100)}%` }} />
      ))}
    </div>
  )
}
