import { useMemo } from 'react'
import { Scan } from 'lucide-react'
import { Button, LearnBox, SectionHeader } from '../atoms.jsx'
import { computeEdgeMap, EDGE_METHODS, overlayEdges } from '../imageMath.js'
import type { EdgeMethod, EdgeState, ImgData } from '../types.js'

const EXPLANATIONS: Record<EdgeMethod, string> = {
  sobel: 'Sobel detects edges by computing horizontal and vertical gradients using two 3×3 kernels. Gradient magnitude = √(Gx² + Gy²).',
  prewitt: 'Prewitt is similar to Sobel but with equal weights. Less noise-sensitive than Sobel.',
  laplacian: 'The Laplacian is a second-order derivative operator. It finds edges where the gradient changes most rapidly (zero-crossings).',
  roberts: 'Roberts cross uses 2×2 diagonal kernels — the oldest and simplest gradient operator.',
  canny: 'Canny is a multi-stage detector: smooth → gradient → non-maximum suppression → hysteresis thresholding. Produces thin, accurate edges.',
}

interface EdgePanelProps {
  image: ImgData
  edgeState: EdgeState
  setEdgeState: (fn: (prev: EdgeState) => EdgeState) => void
  addEntry: (entry: { type: string; label: string }) => void
}

export function EdgePanel({ image, edgeState, setEdgeState, addEntry }: EdgePanelProps) {
  const { method, overlay, edgeImage } = edgeState

  function compute() {
    const edges = computeEdgeMap(image, method)
    setEdgeState((s) => ({ ...s, edgeImage: edges }))
    addEntry({ type: 'edge_detect', label: `Computed ${method} edge detection` })
  }

  const displayImage = useMemo(() => {
    if (!edgeImage) return null
    if (overlay === 'original') return image
    if (overlay === 'edges') return edgeImage
    return overlayEdges(image, edgeImage)
  }, [edgeImage, overlay, image])

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <div className="space-y-4">
        <SectionHeader label="Detector" />
        <div className="space-y-1.5">
          {EDGE_METHODS.map((m) => (
            <button key={m.id} type="button"
              onClick={() => setEdgeState((s) => ({ ...s, method: m.id, edgeImage: null }))}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] font-semibold transition-all duration-300 ${
                method === m.id ? 'bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <Scan className="h-3.5 w-3.5" /> {m.label}
            </button>
          ))}
        </div>
        <Button onClick={compute} className="w-full shadow-md"><Scan className="h-4 w-4" /> Detect Edges</Button>
        {edgeImage && (
          <div className="space-y-2 pt-2">
            <SectionHeader label="View Mode" />
            {(['original', 'edges', 'combined'] as const).map((v) => (
              <button key={v} type="button"
                onClick={() => setEdgeState((s) => ({ ...s, overlay: v }))}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] font-semibold capitalize transition-all duration-300 ${
                  overlay === v ? 'bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <LearnBox>
          <strong>{EDGE_METHODS.find((m) => m.id === method)?.label}</strong> — {EXPLANATIONS[method]}
        </LearnBox>
        {displayImage && (
          <div className="overflow-hidden rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10">
            <canvas
              width={displayImage.width} height={displayImage.height}
              ref={(el) => {
                if (!el) return
                const ctx = el.getContext('2d')
                if (!ctx) return
                const id = ctx.createImageData(displayImage.width, displayImage.height)
                id.data.set(displayImage.pixels)
                ctx.putImageData(id, 0, 0)
              }}
              className="mx-auto block max-w-md"
              style={{ imageRendering: 'pixelated', width: '100%', aspectRatio: `${displayImage.width}/${displayImage.height}` }}
            />
          </div>
        )}
        {!edgeImage && (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-300/50 bg-white/20 text-sm font-semibold text-slate-400 dark:border-white/10 dark:bg-white/5">
            Click "Detect Edges" to run
          </div>
        )}
      </div>
    </div>
  )
}
