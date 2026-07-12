import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  BarChart3,
  Blend,
  BrainCircuit,
  Download,
  Eye,
  FileImage,
  Grid3X3,
  History,
  Image as ImageIcon,
  Layers,
  MousePointer2,
  PanelLeft,
  RotateCw,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { STUDIO_THEMES } from '../../utils/studioThemes.js'
import { runOpenMatScript } from '../../engines/openmat/openmatEngine.js'
import OpenMatNotebook from '../../components/notebooks/OpenMatNotebook.jsx'

const WIDTH = 128
const HEIGHT = 88
const MAX_UPLOAD_SIDE = 180

const LABS = [
  { id: 'pixels', label: 'Pixels', icon: MousePointer2 },
  { id: 'histogram', label: 'Histogram', icon: BarChart3 },
  { id: 'rgb', label: 'RGB', icon: Blend },
  { id: 'matrix', label: 'Matrix', icon: Grid3X3 },
  { id: 'convolution', label: 'Filters', icon: Wand2 },
  { id: 'openmat', label: 'OpenMAT', icon: BrainCircuit },
  { id: 'fft', label: 'FFT', icon: Activity },
  { id: 'log', label: 'Log', icon: History },
]

const PRESETS = {
  identity: {
    name: 'Identity',
    values: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
  sharpen: {
    name: 'Sharpen',
    values: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  blur: {
    name: 'Box Blur',
    values: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  edge: {
    name: 'Laplacian',
    values: [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
    ],
  },
  sobel: {
    name: 'Sobel X',
    values: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
  },
}

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value))
}

function makeImageData(width, height, pixels) {
  return { width, height, pixels }
}

function sampleImage() {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4)
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const i = (y * WIDTH + x) * 4
      const dx = x - WIDTH * 0.36
      const dy = y - HEIGHT * 0.5
      const radial = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 58)
      const stripe = Math.sin((x + y * 1.7) * 0.16) * 0.5 + 0.5
      const wave = Math.cos((x - y) * 0.09) * 0.5 + 0.5
      pixels[i] = clamp(34 + x * 1.24 + radial * 96)
      pixels[i + 1] = clamp(48 + y * 1.75 + stripe * 84)
      pixels[i + 2] = clamp(86 + wave * 118 + radial * 52)
      pixels[i + 3] = 255
    }
  }
  return makeImageData(WIDTH, HEIGHT, pixels)
}

function copyImageData(image) {
  return makeImageData(image.width, image.height, new Uint8ClampedArray(image.pixels))
}

function pixelAt(image, x, y) {
  const cx = Math.max(0, Math.min(image.width - 1, x))
  const cy = Math.max(0, Math.min(image.height - 1, y))
  const i = (cy * image.width + cx) * 4
  return {
    x: cx,
    y: cy,
    r: image.pixels[i],
    g: image.pixels[i + 1],
    b: image.pixels[i + 2],
    a: image.pixels[i + 3],
  }
}

function luminanceAt(image, x, y) {
  const p = pixelAt(image, x, y)
  return 0.299 * p.r + 0.587 * p.g + 0.114 * p.b
}

function toGrayMatrix(image, targetW = 48, targetH = 34) {
  const w = Math.min(targetW, image.width)
  const h = Math.min(targetH, image.height)
  return Array.from({ length: h }, (_, r) => {
    const y = Math.round((r / Math.max(1, h - 1)) * (image.height - 1))
    return Array.from({ length: w }, (_, c) => {
      const x = Math.round((c / Math.max(1, w - 1)) * (image.width - 1))
      return luminanceAt(image, x, y)
    })
  })
}

function applyAdjustments(image, settings) {
  const output = copyImageData(image)
  const contrast = settings.contrast / 100
  const gamma = Math.max(0.15, settings.gamma)
  const channel = settings.channel
  for (let i = 0; i < output.pixels.length; i += 4) {
    let r = image.pixels[i]
    let g = image.pixels[i + 1]
    let b = image.pixels[i + 2]

    r = clamp((r - 128) * contrast + 128 + settings.brightness)
    g = clamp((g - 128) * contrast + 128 + settings.brightness)
    b = clamp((b - 128) * contrast + 128 + settings.brightness)

    r = clamp(255 * Math.pow(r / 255, 1 / gamma))
    g = clamp(255 * Math.pow(g / 255, 1 / gamma))
    b = clamp(255 * Math.pow(b / 255, 1 / gamma))

    if (channel === 'gray') {
      const y = 0.299 * r + 0.587 * g + 0.114 * b
      r = y; g = y; b = y
    } else if (channel === 'red') {
      g = 0; b = 0
    } else if (channel === 'green') {
      r = 0; b = 0
    } else if (channel === 'blue') {
      r = 0; g = 0
    }

    output.pixels[i] = r
    output.pixels[i + 1] = g
    output.pixels[i + 2] = b
  }
  return output
}

function applyKernel(image, kernel, normalize) {
  const out = new Uint8ClampedArray(image.width * image.height * 4)
  const sum = kernel.flat().reduce((acc, v) => acc + Number(v || 0), 0)
  const divisor = normalize && Math.abs(sum) > 0.0001 ? sum : 1
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const oi = (y * image.width + x) * 4
      const totals = [0, 0, 0]
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const p = pixelAt(image, x + kx, y + ky)
          const weight = Number(kernel[ky + 1][kx + 1] || 0)
          totals[0] += p.r * weight
          totals[1] += p.g * weight
          totals[2] += p.b * weight
        }
      }
      out[oi] = clamp(totals[0] / divisor)
      out[oi + 1] = clamp(totals[1] / divisor)
      out[oi + 2] = clamp(totals[2] / divisor)
      out[oi + 3] = 255
    }
  }
  return makeImageData(image.width, image.height, out)
}

function histogram(image) {
  const bins = Array.from({ length: 32 }, () => ({ gray: 0, r: 0, g: 0, b: 0 }))
  for (let i = 0; i < image.pixels.length; i += 4) {
    const r = image.pixels[i]
    const g = image.pixels[i + 1]
    const b = image.pixels[i + 2]
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    bins[Math.min(31, Math.floor(gray / 8))].gray += 1
    bins[Math.min(31, Math.floor(r / 8))].r += 1
    bins[Math.min(31, Math.floor(g / 8))].g += 1
    bins[Math.min(31, Math.floor(b / 8))].b += 1
  }
  return bins
}

function channelAverages(image) {
  const totals = { r: 0, g: 0, b: 0, gray: 0 }
  const count = image.width * image.height
  for (let i = 0; i < image.pixels.length; i += 4) {
    const r = image.pixels[i]
    const g = image.pixels[i + 1]
    const b = image.pixels[i + 2]
    totals.r += r
    totals.g += g
    totals.b += b
    totals.gray += 0.299 * r + 0.587 * g + 0.114 * b
  }
  return {
    r: totals.r / count,
    g: totals.g / count,
    b: totals.b / count,
    gray: totals.gray / count,
  }
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(MAX_UPLOAD_SIDE / img.width, MAX_UPLOAD_SIDE / img.height, 1)
        const width = Math.max(8, Math.round(img.width * scale))
        const height = Math.max(8, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0, width, height)
        resolve(makeImageData(width, height, new Uint8ClampedArray(ctx.getImageData(0, 0, width, height).data)))
      }
      img.onerror = reject
      img.src = ev.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function pseudoFrequencyGrid(image) {
  const matrix = toGrayMatrix(image, 16, 16)
  const values = []
  for (let u = 0; u < 12; u += 1) {
    for (let v = 0; v < 12; v += 1) {
      let real = 0
      let imag = 0
      for (let y = 0; y < matrix.length; y += 1) {
        for (let x = 0; x < matrix[0].length; x += 1) {
          const angle = -2 * Math.PI * ((u * x) / matrix[0].length + (v * y) / matrix.length)
          real += matrix[y][x] * Math.cos(angle)
          imag += matrix[y][x] * Math.sin(angle)
        }
      }
      values.push(Math.log1p(Math.sqrt(real * real + imag * imag)))
    }
  }
  const max = Math.max(...values, 1)
  return values.map((v) => v / max)
}

function toOpenMatMatrix(matrix) {
  return `[${matrix.map((row) => row.map((value) => Math.round(value)).join(' ')).join('; ')}]`
}

function buildOpenMatCells(image, averages) {
  const grayMatrix = toGrayMatrix(image, 14, 10)
  const matrixLiteral = toOpenMatMatrix(grayMatrix)
  const cx = Math.floor(grayMatrix[0].length / 2)
  const cy = Math.floor(grayMatrix.length / 2)
  const patch = [
    grayMatrix[Math.max(0, cy - 1)].slice(Math.max(0, cx - 1), Math.max(0, cx - 1) + 3),
    grayMatrix[cy].slice(Math.max(0, cx - 1), Math.max(0, cx - 1) + 3),
    grayMatrix[Math.min(grayMatrix.length - 1, cy + 1)].slice(Math.max(0, cx - 1), Math.max(0, cx - 1) + 3),
  ]
  const patchLiteral = toOpenMatMatrix(patch)
  const sample = pixelAt(image, Math.floor(image.width / 2), Math.floor(image.height / 2))
  return [
    {
      id: 'image-matrix',
      cellTitle: 'Current image as a matrix',
      prose: [
        'Image Lab sends a downsampled luminance matrix into the same OpenMAT notebook engine used by the math workspace.',
      ],
      code: `I = ${matrixLiteral};
size(I)
v = flatten(I)
mean(v)
min(v)
max(v)
`,
    },
    {
      id: 'pixel-vector',
      cellTitle: 'Inspect one pixel as data',
      prose: [
        'A pixel can be treated as a vector. Edit the vector or matrix below and run it directly with OpenMAT.',
      ],
      code: `pixel = [${sample.r}; ${sample.g}; ${sample.b}]
luminance_weights = [0.299 0.587 0.114]
Y = luminance_weights * pixel
channel_mean = [${averages.r.toFixed(2)} ${averages.g.toFixed(2)} ${averages.b.toFixed(2)}]
`,
    },
    {
      id: 'kernel-math',
      cellTitle: 'Kernel math',
      prose: [
        'This cell keeps the image-processing math visible without baking a special-purpose operation into the UI.',
      ],
      code: `K = [0 -1 0; -1 5 -1; 0 -1 0]
patch = ${patchLiteral}
filtered_center = sum(sum(K .* patch))
`,
    },
  ]
}

function Button({ children, active, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
        active
          ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function IconButton({ title, active, children, ...props }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
        active
          ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
          : 'border-slate-200 bg-white/70 text-slate-500 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:text-slate-100'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  )
}

function Range({ label, value, min, max, step = 1, onChange, suffix = '' }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-bold text-cyan-600 dark:text-cyan-300">{value}{suffix}</span>
      </div>
      <input
        className="w-full accent-cyan-500"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function CanvasView({ image, original, mode, inspect, onInspect }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    const frame = ctx.createImageData(image.width, image.height)
    if (mode === 'difference') {
      for (let i = 0; i < image.pixels.length; i += 4) {
        const diff = Math.max(
          Math.abs(original.pixels[i] - image.pixels[i]),
          Math.abs(original.pixels[i + 1] - image.pixels[i + 1]),
          Math.abs(original.pixels[i + 2] - image.pixels[i + 2]),
        )
        frame.data[i] = clamp(diff * 2.2)
        frame.data[i + 1] = clamp(36 + diff * 0.45)
        frame.data[i + 2] = clamp(255 - diff * 1.3)
        frame.data[i + 3] = 255
      }
    } else {
      frame.data.set(image.pixels)
    }
    ctx.putImageData(frame, 0, 0)
  }, [image, mode, original])

  const handleMove = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * image.width)
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * image.height)
    onInspect(pixelAt(image, x, y))
  }, [image, onInspect])

  return (
    <div className="relative flex h-full min-h-[260px] items-center justify-center overflow-hidden bg-[linear-gradient(45deg,rgba(148,163,184,0.16)_25%,transparent_25%),linear-gradient(-45deg,rgba(148,163,184,0.16)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(148,163,184,0.16)_75%),linear-gradient(-45deg,transparent_75%,rgba(148,163,184,0.16)_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0]">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMove}
        className="max-h-[72vh] max-w-full rounded-md border border-slate-300 bg-white shadow-2xl dark:border-white/10"
        style={{ imageRendering: 'pixelated', width: 'min(100%, 860px)', aspectRatio: `${image.width}/${image.height}` }}
      />
      {inspect && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-xs shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
          <div className="font-mono font-bold text-slate-900 dark:text-slate-100">({inspect.x}, {inspect.y})</div>
          <div className="mt-1 grid grid-cols-3 gap-2 font-mono text-[11px]">
            <span className="text-red-500">R {inspect.r}</span>
            <span className="text-green-500">G {inspect.g}</span>
            <span className="text-blue-500">B {inspect.b}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function MatrixPreview({ image }) {
  const matrix = toGrayMatrix(image, 12, 8)
  return (
    <div className="grid grid-cols-12 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 font-mono text-[9px] dark:border-white/10 dark:bg-white/10">
      {matrix.flatMap((row, r) => row.map((value, c) => (
        <div
          key={`${r}-${c}`}
          className="flex h-8 items-center justify-center bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300"
          style={{ opacity: 0.48 + value / 510 }}
        >
          {Math.round(value)}
        </div>
      )))}
    </div>
  )
}

function HistogramBars({ bins, channel = 'gray' }) {
  const max = Math.max(...bins.map((bin) => bin[channel]), 1)
  const color = {
    gray: 'bg-slate-500',
    r: 'bg-red-500',
    g: 'bg-emerald-500',
    b: 'bg-blue-500',
  }[channel]
  return (
    <div className="flex h-28 items-end gap-0.5 rounded-md border border-slate-200 bg-white/70 p-2 dark:border-white/10 dark:bg-white/[0.03]">
      {bins.map((bin, index) => (
        <div
          key={index}
          title={`${index * 8}-${index * 8 + 7}: ${bin[channel]}`}
          className={`min-w-1 flex-1 rounded-t ${color}`}
          style={{ height: `${Math.max(4, (bin[channel] / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

function KernelEditor({ kernel, setKernel, normalize, setNormalize, setLog }) {
  function updateCell(row, col, value) {
    setKernel((prev) => prev.map((line, r) => line.map((cell, c) => (r === row && c === col ? Number(value) : cell))))
  }

  function usePreset(id) {
    setKernel(PRESETS[id].values)
    setLog((items) => [{ label: `Loaded ${PRESETS[id].name} kernel`, at: Date.now() }, ...items].slice(0, 12))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {kernel.flatMap((row, r) => row.map((value, c) => (
          <input
            key={`${r}-${c}`}
            type="number"
            value={value}
            onChange={(event) => updateCell(r, c, event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white text-center font-mono text-sm text-slate-800 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
          />
        )))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(PRESETS).map(([id, preset]) => (
          <Button key={id} onClick={() => usePreset(id)}>{preset.name}</Button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={normalize} onChange={(event) => setNormalize(event.target.checked)} className="accent-cyan-500" />
        Normalize by kernel sum
      </label>
    </div>
  )
}

function BottomPanel({ activeLab, image, original, bins, inspect, kernel, setKernel, normalize, setNormalize, log, setLog }) {
  const averages = useMemo(() => channelAverages(image), [image])
  const grayMatrix = useMemo(() => toGrayMatrix(image), [image])
  const openMatSummary = useMemo(() => {
    try {
      const matrixLiteral = toOpenMatMatrix(grayMatrix)
      const result = runOpenMatScript(`I = ${matrixLiteral};
rows = size(I, 1)
cols = size(I, 2)
v = flatten(I)
avg = mean(v)
lo = min(v)
hi = max(v)
span = hi - lo
`)
      return result.logs.join('\n')
    } catch {
      return 'OpenMAT summary unavailable for this matrix.'
    }
  }, [grayMatrix])
  const openMatCells = useMemo(() => buildOpenMatCells(image, averages), [image, averages])
  const frequencies = useMemo(() => pseudoFrequencyGrid(image), [image])
  const diffMean = useMemo(() => {
    let total = 0
    for (let i = 0; i < image.pixels.length; i += 4) {
      total += Math.abs(original.pixels[i] - image.pixels[i])
      total += Math.abs(original.pixels[i + 1] - image.pixels[i + 1])
      total += Math.abs(original.pixels[i + 2] - image.pixels[i + 2])
    }
    return total / (image.width * image.height * 3)
  }, [image, original])

  if (activeLab === 'histogram') {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <HistogramBars bins={bins} channel="gray" />
          <div className="grid gap-3 sm:grid-cols-3">
            <HistogramBars bins={bins} channel="r" />
            <HistogramBars bins={bins} channel="g" />
            <HistogramBars bins={bins} channel="b" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <Stat label="Avg luminance" value={averages.gray.toFixed(1)} />
          <Stat label="Difference mean" value={diffMean.toFixed(1)} />
          <Stat label="Pixels" value={(image.width * image.height).toLocaleString()} />
        </div>
      </div>
    )
  }

  if (activeLab === 'rgb') {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Red channel', averages.r, 'bg-red-500'],
          ['Green channel', averages.g, 'bg-emerald-500'],
          ['Blue channel', averages.b, 'bg-blue-500'],
        ].map(([label, avg, color]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span>
              <span className="font-mono text-xs text-slate-500">{avg.toFixed(1)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className={`h-full ${color}`} style={{ width: `${(avg / 255) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activeLab === 'matrix') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Stat label="Matrix size" value={`${image.height} x ${image.width} x 4`} />
          <Stat label="Gray sample" value={`${grayMatrix.length} x ${grayMatrix[0]?.length ?? 0}`} />
          <Stat label="Avg luminance" value={averages.gray.toFixed(1)} />
        </div>
        <MatrixPreview image={image} />
      </div>
    )
  }

  if (activeLab === 'convolution') {
    return (
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <KernelEditor kernel={kernel} setKernel={setKernel} normalize={normalize} setNormalize={setNormalize} setLog={setLog} />
        <div className="rounded-md border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Convolution step at inspected pixel</div>
          <div className="mt-3 grid grid-cols-3 gap-1.5 font-mono text-[10px]">
            {[-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => {
              const x = (inspect?.x ?? Math.floor(image.width / 2)) + dx
              const y = (inspect?.y ?? Math.floor(image.height / 2)) + dy
              const lum = luminanceAt(image, x, y)
              const weight = kernel[dy + 1][dx + 1]
              return (
                <div key={`${dx}-${dy}`} className="rounded border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-slate-950">
                  <div>{Math.round(lum)} x {weight}</div>
                  <div className="text-slate-400">= {(lum * weight).toFixed(1)}</div>
                </div>
              )
            }))}
          </div>
        </div>
      </div>
    )
  }

  if (activeLab === 'openmat') {
    return (
      <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <div className="rounded-md border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">OpenMAT engine summary</div>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-200">{openMatSummary}</pre>
        </div>
        <div className="max-h-[520px] overflow-y-auto rounded-md">
          <OpenMatNotebook params={{ initialCells: openMatCells }} />
        </div>
      </div>
    )
  }

  if (activeLab === 'fft') {
    return (
      <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
        <div className="grid grid-cols-12 gap-px rounded-md border border-slate-200 bg-slate-900 p-2 dark:border-white/10">
          {frequencies.map((value, index) => (
            <div key={index} className="aspect-square rounded-sm" style={{ background: `rgb(${Math.round(value * 36)}, ${Math.round(value * 220)}, ${Math.round(80 + value * 175)})` }} />
          ))}
        </div>
        <div className="rounded-md border border-slate-200 bg-white/70 p-3 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
          The grid is a compact Fourier magnitude map. Bright cells mean strong repeating structure at that frequency. Low frequencies cluster near the corner; high-frequency detail and edges spread outward.
        </div>
      </div>
    )
  }

  if (activeLab === 'log') {
    return (
      <div className="space-y-2">
        {log.map((item) => (
          <div key={`${item.at}-${item.label}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">
            <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
            <span className="font-mono text-slate-400">{new Date(item.at).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <Stat label="Coordinate" value={inspect ? `(${inspect.x}, ${inspect.y})` : 'hover'} />
      <Stat label="RGB" value={inspect ? `${inspect.r}, ${inspect.g}, ${inspect.b}` : '---'} />
      <Stat label="Luminance" value={inspect ? Math.round(0.299 * inspect.r + 0.587 * inspect.g + 0.114 * inspect.b) : '---'} />
      <Stat label="Neighborhood" value="3 x 3" />
    </div>
  )
}

export default function ImageLab({ onBack, onClose }) {
  const { studioTheme, setStudioTheme, themeStyles } = useGlobalTheme()
  const ui = themeStyles.ui ?? {}
  const close = onBack ?? onClose
  const fileInputRef = useRef(null)

  const [source, setSource] = useState(() => sampleImage())
  const [settings, setSettings] = useState({ brightness: 0, contrast: 100, gamma: 1, channel: 'rgb' })
  const [kernel, setKernel] = useState(PRESETS.identity.values)
  const [normalize, setNormalize] = useState(false)
  const [kernelEnabled, setKernelEnabled] = useState(false)
  const [viewerMode, setViewerMode] = useState('image')
  const [activeLab, setActiveLab] = useState('pixels')
  const [inspect, setInspect] = useState(null)
  const [log, setLog] = useState(() => [{ label: 'Opened Image Lab with generated sample image', at: Date.now() }])

  const adjusted = useMemo(() => applyAdjustments(source, settings), [source, settings])
  const processed = useMemo(() => (kernelEnabled ? applyKernel(adjusted, kernel, normalize) : adjusted), [adjusted, kernel, kernelEnabled, normalize])
  const bins = useMemo(() => histogram(processed), [processed])
  const averages = useMemo(() => channelAverages(processed), [processed])

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setLog((items) => [{ label: `Changed ${key} to ${value}`, at: Date.now() }, ...items].slice(0, 12))
  }

  async function handleFile(file) {
    try {
      const image = await readImageFile(file)
      setSource(image)
      setSettings({ brightness: 0, contrast: 100, gamma: 1, channel: 'rgb' })
      setKernelEnabled(false)
      setLog((items) => [{ label: `Loaded ${file.name} as ${image.width} x ${image.height} matrix`, at: Date.now() }, ...items].slice(0, 12))
    } catch {
      setLog((items) => [{ label: 'Image load failed', at: Date.now() }, ...items].slice(0, 12))
    }
  }

  function resetSample() {
    setSource(sampleImage())
    setSettings({ brightness: 0, contrast: 100, gamma: 1, channel: 'rgb' })
    setKernel(PRESETS.identity.values)
    setKernelEnabled(false)
    setLog((items) => [{ label: 'Reset to generated sample image', at: Date.now() }, ...items].slice(0, 12))
  }

  function exportPng() {
    const canvas = document.createElement('canvas')
    canvas.width = processed.width
    canvas.height = processed.height
    const ctx = canvas.getContext('2d')
    const data = ctx.createImageData(processed.width, processed.height)
    data.data.set(processed.pixels)
    ctx.putImageData(data, 0, 0)
    const link = document.createElement('a')
    link.download = 'image-lab-output.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    setLog((items) => [{ label: 'Exported processed image as PNG', at: Date.now() }, ...items].slice(0, 12))
  }

  return (
    <div className={`h-full w-full overflow-hidden ${ui.bg0 ?? 'bg-white dark:bg-slate-950'} ${ui.txt1 ?? 'text-slate-900 dark:text-slate-100'}`}>
      <div className="flex h-full min-h-0 flex-col">
        <header className={`flex h-12 shrink-0 items-center gap-3 border-b px-3 ${ui.border ?? 'border-slate-200 dark:border-white/10'} ${ui.bg1 ?? 'bg-slate-50 dark:bg-slate-900'}`}>
          {close && (
            <Button onClick={close} className="shrink-0">Labs</Button>
          )}
          <div className="flex items-center gap-2 font-black tracking-wide">
            <FileImage className="h-4 w-4 text-cyan-500" />
            <span>IMAGE LAB</span>
          </div>
          <div className="hidden text-[10px] uppercase tracking-[0.22em] text-slate-400 md:block">Matrix workspace for pixels</div>
          <div className="min-w-0 flex-1" />
          <select
            value={studioTheme}
            onChange={(event) => setStudioTheme(event.target.value)}
            className="hidden h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 sm:block"
            title="Theme"
          >
            {Object.entries(STUDIO_THEMES).map(([id, theme]) => <option key={id} value={id}>{theme.name}</option>)}
          </select>
          <IconButton title="Upload image" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /></IconButton>
          <IconButton title="Export PNG" onClick={exportPng}><Download className="h-4 w-4" /></IconButton>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) handleFile(file)
            event.target.value = ''
          }} />
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className={`hidden w-56 shrink-0 flex-col border-r lg:flex ${ui.border ?? 'border-slate-200 dark:border-white/10'} ${ui.bg1 ?? 'bg-slate-50 dark:bg-slate-900'}`}>
            <div className="border-b border-slate-200 p-3 dark:border-white/10">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><PanelLeft className="h-3.5 w-3.5" /> Explorer</div>
              {['Images', 'Layers', 'History', 'Results'].map((item, index) => (
                <button key={item} type="button" className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
                  <span>{item}</span>
                  <span className="font-mono text-[10px] text-slate-400">{index === 0 ? '1' : index === 1 ? '2' : ''}</span>
                </button>
              ))}
            </div>
            <div className="space-y-3 overflow-y-auto p-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Eye className="h-3.5 w-3.5" /> View</div>
                <div className="grid grid-cols-3 gap-1">
                  {['image', 'matrix', 'split'].map((mode) => (
                    <Button key={mode} active={viewerMode === mode} onClick={() => setViewerMode(mode)} className="px-1 capitalize">{mode}</Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Layers className="h-3.5 w-3.5" /> Channels</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    ['rgb', 'RGB'],
                    ['gray', 'Gray'],
                    ['red', 'Red'],
                    ['green', 'Green'],
                    ['blue', 'Blue'],
                  ].map(([id, label]) => (
                    <Button key={id} active={settings.channel === id} onClick={() => updateSetting('channel', id)}>{label}</Button>
                  ))}
                </div>
              </div>
              <Button onClick={resetSample} className="w-full"><Sparkles className="h-3.5 w-3.5" /> Sample</Button>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1">
              <section className="min-w-0 flex-1">
                {viewerMode === 'matrix' ? (
                  <div className="h-full overflow-auto p-4"><MatrixPreview image={processed} /></div>
                ) : viewerMode === 'split' ? (
                  <div className="grid h-full min-h-0 grid-rows-2">
                    <CanvasView image={processed} original={source} mode="image" inspect={inspect} onInspect={setInspect} />
                    <div className="overflow-auto border-t border-slate-200 p-3 dark:border-white/10"><MatrixPreview image={processed} /></div>
                  </div>
                ) : (
                  <CanvasView image={processed} original={source} mode={activeLab === 'pixels' ? 'image' : activeLab === 'histogram' ? 'image' : activeLab === 'log' ? 'difference' : 'image'} inspect={inspect} onInspect={setInspect} />
                )}
              </section>

              <aside className={`hidden w-72 shrink-0 overflow-y-auto border-l p-3 xl:block ${ui.border ?? 'border-slate-200 dark:border-white/10'} ${ui.bg1 ?? 'bg-slate-50 dark:bg-slate-900'}`}>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><SlidersHorizontal className="h-3.5 w-3.5" /> Properties</div>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Width" value={processed.width} />
                  <Stat label="Height" value={processed.height} />
                  <Stat label="Channels" value="RGBA" />
                  <Stat label="Matrix" value={`${processed.height}x${processed.width}`} />
                </div>
                <div className="mt-4 space-y-3">
                  <Range label="Brightness" value={settings.brightness} min={-90} max={90} onChange={(value) => updateSetting('brightness', value)} />
                  <Range label="Contrast" value={settings.contrast} min={30} max={220} onChange={(value) => updateSetting('contrast', value)} suffix="%" />
                  <Range label="Gamma" value={settings.gamma} min={0.3} max={2.6} step={0.1} onChange={(value) => updateSetting('gamma', value)} />
                </div>
                <div className="mt-4 rounded-md border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>Filter kernel</span>
                    <button
                      type="button"
                      onClick={() => {
                        setKernelEnabled((value) => !value)
                        setLog((items) => [{ label: `${kernelEnabled ? 'Disabled' : 'Enabled'} convolution filter`, at: Date.now() }, ...items].slice(0, 12))
                      }}
                      className="text-cyan-600 dark:text-cyan-300"
                    >
                      {kernelEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                  <KernelEditor kernel={kernel} setKernel={setKernel} normalize={normalize} setNormalize={setNormalize} setLog={setLog} />
                </div>
              </aside>
            </div>

            <footer className={`shrink-0 border-t ${ui.border ?? 'border-slate-200 dark:border-white/10'} ${ui.bg1 ?? 'bg-slate-50 dark:bg-slate-900'}`}>
              <div className="flex gap-1 overflow-x-auto border-b border-slate-200 p-1 dark:border-white/10">
                {LABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveLab(id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold transition-colors ${
                      activeLab === id
                        ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="max-h-64 overflow-y-auto p-3">
                <BottomPanel
                  activeLab={activeLab}
                  image={processed}
                  original={source}
                  bins={bins}
                  inspect={inspect}
                  kernel={kernel}
                  setKernel={setKernel}
                  normalize={normalize}
                  setNormalize={setNormalize}
                  log={log}
                  setLog={setLog}
                />
              </div>
            </footer>
          </main>
        </div>

        <div className="hidden">
          <ImageIcon />
          <BrainCircuit />
          <RotateCw />
          {averages.gray}
        </div>
      </div>
    </div>
  )
}
