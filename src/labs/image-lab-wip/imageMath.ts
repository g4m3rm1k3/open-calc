// Pure image-processing math — no React, no DOM except where genuinely needed
// (readImageFile decodes via a canvas, which has no non-DOM equivalent).
// Kept isolated from the UI layer specifically so it can be unit tested
// (imageMath.test.ts) the same way packages/openmat/src tests its engine.
import { svdDecomp } from '../../engines/openmat/openmatEngine.js'
import type { EdgeMethod, FftData, ImgData, Kernel3x3, Settings, SvdData } from './types.js'

export const WIDTH = 128
export const HEIGHT = 88
// Uploaded images are downscaled to this before anything else touches them.
// 180 (the original WIP value) looked fine at native size, but the canvas
// scaling fix (CanvasView now fills its container via object-contain) means
// a maximized window stretches that source several hundred percent, which
// with `image-rendering: pixelated` reads as blocky/low-quality. SVD and FFT
// don't care about this value at all — they always re-downsample the source
// to their own fixed grids below (SVD_W×SVD_H, FFT_N×FFT_N) regardless of
// how big the source is — so raising this only costs a bit more time in the
// per-pixel ops (Adjustments/Kernel/Edge Detection), which stay well under a
// frame budget at this size.
export const MAX_UPLOAD_SIDE = 400
export const SVD_W = 64
export const SVD_H = 48
export const FFT_N = 32 // power-of-2 size for FFT

export const PRESETS: Record<string, { name: string; values: Kernel3x3 }> = {
  identity: { name: 'Identity', values: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
  sharpen: { name: 'Sharpen', values: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] },
  blur: { name: 'Box Blur', values: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
  edge: { name: 'Laplacian', values: [[0, 1, 0], [1, -4, 1], [0, 1, 0]] },
  sobel: { name: 'Sobel X', values: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] },
  gauss: { name: 'Gaussian', values: [[1, 2, 1], [2, 4, 2], [1, 2, 1]] },
}

export const TRANSFORM_TYPES = [
  { id: 'identity', label: 'Identity' },
  { id: 'rotate', label: 'Rotation' },
  { id: 'scale', label: 'Scale' },
  { id: 'shear', label: 'Shear' },
  { id: 'flipH', label: 'Flip H' },
  { id: 'flipV', label: 'Flip V' },
  { id: 'custom', label: 'Custom' },
] as const

export const EDGE_METHODS: { id: EdgeMethod; label: string }[] = [
  { id: 'sobel', label: 'Sobel' },
  { id: 'prewitt', label: 'Prewitt' },
  { id: 'laplacian', label: 'Laplacian' },
  { id: 'roberts', label: 'Roberts' },
  { id: 'canny', label: 'Canny' },
]

// ─── Core pixel helpers ────────────────────────────────────────────────────

export function clamp(v: number, lo = 0, hi = 255): number {
  return Math.max(lo, Math.min(hi, v))
}

export function makeImageData(w: number, h: number, pix: Uint8ClampedArray): ImgData {
  return { width: w, height: h, pixels: pix }
}

export function copyImageData(img: ImgData): ImgData {
  return makeImageData(img.width, img.height, new Uint8ClampedArray(img.pixels))
}

export function pixelAt(img: ImgData, x: number, y: number) {
  const cx = clamp(x, 0, img.width - 1)
  const cy = clamp(y, 0, img.height - 1)
  const i = (cy * img.width + cx) * 4
  return { x: cx, y: cy, r: img.pixels[i], g: img.pixels[i + 1], b: img.pixels[i + 2], a: img.pixels[i + 3] }
}

export function luminanceAt(img: ImgData, x: number, y: number): number {
  const p = pixelAt(img, x, y)
  return 0.299 * p.r + 0.587 * p.g + 0.114 * p.b
}

export function toGrayMatrix(img: ImgData, tw = 48, th = 34): number[][] {
  const w = Math.min(tw, img.width), h = Math.min(th, img.height)
  return Array.from({ length: h }, (_, r) => {
    const y = Math.round((r / Math.max(1, h - 1)) * (img.height - 1))
    return Array.from({ length: w }, (_, c) => {
      const x = Math.round((c / Math.max(1, w - 1)) * (img.width - 1))
      return luminanceAt(img, x, y)
    })
  })
}

// ─── Color space conversions ───────────────────────────────────────────────

export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (d > 0) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}

export function rgbToLab(r: number, g: number, b: number) {
  let R = r / 255, G = g / 255, B = b / 255
  const lin = (v: number) => (v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92)
  R = lin(R); G = lin(G); B = lin(B)
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const L = Math.round(116 * f(Y) - 16)
  const a = Math.round(500 * (f(X) - f(Y)))
  const bv = Math.round(200 * (f(Y) - f(Z)))
  return { L, a, b: bv }
}

export function computeGradient(img: ImgData, x: number, y: number) {
  const gx = luminanceAt(img, x + 1, y) - luminanceAt(img, x - 1, y)
  const gy = luminanceAt(img, x, y + 1) - luminanceAt(img, x, y - 1)
  return {
    gx: gx.toFixed(1), gy: gy.toFixed(1),
    magnitude: Math.sqrt(gx * gx + gy * gy).toFixed(1),
    direction: (Math.atan2(gy, gx) * 180 / Math.PI).toFixed(1),
  }
}

// ─── Sample image ──────────────────────────────────────────────────────────

export function sampleImage(): ImgData {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4)
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 4
      const dx = x - WIDTH * 0.36, dy = y - HEIGHT * 0.5
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

// ─── Adjustments / kernel / histogram ──────────────────────────────────────

export function applyAdjustments(img: ImgData, s: Settings): ImgData {
  const out = copyImageData(img)
  const contrast = s.contrast / 100
  const gamma = Math.max(0.15, s.gamma)
  for (let i = 0; i < out.pixels.length; i += 4) {
    let r = img.pixels[i], g = img.pixels[i + 1], b = img.pixels[i + 2]
    r = clamp((r - 128) * contrast + 128 + s.brightness)
    g = clamp((g - 128) * contrast + 128 + s.brightness)
    b = clamp((b - 128) * contrast + 128 + s.brightness)
    r = clamp(255 * Math.pow(r / 255, 1 / gamma))
    g = clamp(255 * Math.pow(g / 255, 1 / gamma))
    b = clamp(255 * Math.pow(b / 255, 1 / gamma))
    if (s.channel === 'gray') { const y = 0.299 * r + 0.587 * g + 0.114 * b; r = y; g = y; b = y }
    else if (s.channel === 'red') { g = 0; b = 0 }
    else if (s.channel === 'green') { r = 0; b = 0 }
    else if (s.channel === 'blue') { r = 0; g = 0 }
    out.pixels[i] = r; out.pixels[i + 1] = g; out.pixels[i + 2] = b
  }
  return out
}

export function applyKernel(img: ImgData, kernel: Kernel3x3, normalize: boolean): ImgData {
  const out = new Uint8ClampedArray(img.width * img.height * 4)
  const sum = kernel.flat().reduce((a, v) => a + Number(v || 0), 0)
  const div = normalize && Math.abs(sum) > 0.0001 ? sum : 1
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const oi = (y * img.width + x) * 4
      const t = [0, 0, 0]
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const p = pixelAt(img, x + kx, y + ky)
          const w = Number(kernel[ky + 1][kx + 1] || 0)
          t[0] += p.r * w; t[1] += p.g * w; t[2] += p.b * w
        }
      }
      out[oi] = clamp(t[0] / div); out[oi + 1] = clamp(t[1] / div); out[oi + 2] = clamp(t[2] / div); out[oi + 3] = 255
    }
  }
  return makeImageData(img.width, img.height, out)
}

export interface HistBin { gray: number; r: number; g: number; b: number }

export function histogram(img: ImgData): HistBin[] {
  const bins: HistBin[] = Array.from({ length: 32 }, () => ({ gray: 0, r: 0, g: 0, b: 0 }))
  for (let i = 0; i < img.pixels.length; i += 4) {
    const r = img.pixels[i], g = img.pixels[i + 1], b = img.pixels[i + 2]
    bins[Math.min(31, Math.floor((0.299 * r + 0.587 * g + 0.114 * b) / 8))].gray += 1
    bins[Math.min(31, Math.floor(r / 8))].r += 1
    bins[Math.min(31, Math.floor(g / 8))].g += 1
    bins[Math.min(31, Math.floor(b / 8))].b += 1
  }
  return bins
}

export function channelAverages(img: ImgData) {
  const t = { r: 0, g: 0, b: 0, gray: 0 }
  const n = img.width * img.height
  for (let i = 0; i < img.pixels.length; i += 4) {
    t.r += img.pixels[i]; t.g += img.pixels[i + 1]; t.b += img.pixels[i + 2]
    t.gray += 0.299 * img.pixels[i] + 0.587 * img.pixels[i + 1] + 0.114 * img.pixels[i + 2]
  }
  return { r: t.r / n, g: t.g / n, b: t.b / n, gray: t.gray / n }
}

export function readImageFile(file: File): Promise<ImgData> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(MAX_UPLOAD_SIDE / img.width, MAX_UPLOAD_SIDE / img.height, 1)
        const w = Math.max(8, Math.round(img.width * scale))
        const h = Math.max(8, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
        ctx.drawImage(img, 0, 0, w, h)
        res(makeImageData(w, h, new Uint8ClampedArray(ctx.getImageData(0, 0, w, h).data)))
      }
      img.onerror = rej
      img.src = ev.target?.result as string
    }
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

// ─── PSNR ───────────────────────────────────────────────────────────────────

export function computePSNR(ref: ArrayLike<number>, test: ArrayLike<number>, w: number, h: number): number {
  let mse = 0
  for (let i = 0; i < w * h; i++) mse += Math.pow(ref[i] - test[i], 2)
  mse /= w * h
  return mse < 1e-10 ? Infinity : 20 * Math.log10(255 / Math.sqrt(mse))
}

// ─── SVD image analysis ────────────────────────────────────────────────────

export function computeImageSVD(img: ImgData): SvdData {
  const gray = toGrayMatrix(img, SVD_W, SVD_H)
  const result = svdDecomp(gray)
  // Extract singular values from the diagonal of S
  const sigmas = result.S.map((row: number[], i: number) => Math.abs(row[i] ?? 0))
  return { U: result.U, V: result.V, sigmas, w: SVD_W, h: SVD_H, gray }
}

export function reconstructFromSVD(U: number[][], V: number[][], sigmas: number[], k: number, w: number, h: number): Float32Array {
  const flat = new Float32Array(h * w)
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      let sum = 0
      for (let i = 0; i < k; i++) sum += sigmas[i] * (U[r]?.[i] ?? 0) * (V[c]?.[i] ?? 0)
      flat[r * w + c] = sum
    }
  }
  return flat
}

export function svdToImage(flat: Float32Array, w: number, h: number): ImgData {
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const v = clamp(Math.round(flat[i]))
    pixels[i * 4] = v; pixels[i * 4 + 1] = v; pixels[i * 4 + 2] = v; pixels[i * 4 + 3] = 255
  }
  return makeImageData(w, h, pixels)
}

// ─── Edge detection ─────────────────────────────────────────────────────────

const EDGE_KERNELS: Record<string, { kx?: number[][]; ky?: number[][]; k?: number[][] }> = {
  sobel: { kx: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], ky: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]] },
  prewitt: { kx: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], ky: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]] },
  laplacian: { k: [[0, 1, 0], [1, -4, 1], [0, 1, 0]] },
  roberts: { kx: [[1, 0], [0, -1]], ky: [[0, 1], [-1, 0]] },
}

export function computeEdgeMap(img: ImgData, method: string): ImgData {
  const out = new Uint8ClampedArray(img.width * img.height * 4)
  const kern = EDGE_KERNELS[method] || EDGE_KERNELS.sobel

  function convolve(x: number, y: number, k: number[][]): number {
    const oh = Math.floor(k.length / 2)
    const ow = Math.floor(k[0].length / 2)
    let sum = 0
    for (let ky = 0; ky < k.length; ky++) {
      for (let kx = 0; kx < k[0].length; kx++) sum += luminanceAt(img, x + kx - ow, y + ky - oh) * k[ky][kx]
    }
    return sum
  }

  if (method === 'canny') {
    const magnitudes = new Float32Array(img.width * img.height)
    const ks = EDGE_KERNELS.sobel
    let maxMag = 0
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const gx = convolve(x, y, ks.kx as number[][])
        const gy = convolve(x, y, ks.ky as number[][])
        const mag = Math.sqrt(gx * gx + gy * gy)
        magnitudes[y * img.width + x] = mag
        if (mag > maxMag) maxMag = mag
      }
    }
    const threshold = maxMag * 0.2
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const oi = (y * img.width + x) * 4
        const mag = magnitudes[y * img.width + x]
        const v = mag > threshold ? clamp(mag * 255 / maxMag) : 0
        out[oi] = v; out[oi + 1] = v; out[oi + 2] = v; out[oi + 3] = 255
      }
    }
    return makeImageData(img.width, img.height, out)
  }

  let max = 0
  const raw = new Float32Array(img.width * img.height)
  if (kern.k) {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const v = Math.abs(convolve(x, y, kern.k))
        raw[y * img.width + x] = v
        if (v > max) max = v
      }
    }
  } else {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const gx = convolve(x, y, kern.kx as number[][])
        const gy = convolve(x, y, kern.ky as number[][])
        const mag = Math.sqrt(gx * gx + gy * gy)
        raw[y * img.width + x] = mag
        if (mag > max) max = mag
      }
    }
  }
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const oi = (y * img.width + x) * 4
      const v = clamp(Math.round(raw[y * img.width + x] * 255 / Math.max(max, 1)))
      out[oi] = v; out[oi + 1] = v; out[oi + 2] = v; out[oi + 3] = 255
    }
  }
  return makeImageData(img.width, img.height, out)
}

export function overlayEdges(original: ImgData, edges: ImgData, alpha = 0.7): ImgData {
  const out = new Uint8ClampedArray(original.width * original.height * 4)
  for (let i = 0; i < original.width * original.height; i++) {
    const edgeVal = edges.pixels[i * 4]
    const t = edgeVal / 255
    out[i * 4] = clamp(original.pixels[i * 4] * (1 - t * alpha) + 255 * t * alpha * 0.9)
    out[i * 4 + 1] = clamp(original.pixels[i * 4 + 1] * (1 - t * alpha))
    out[i * 4 + 2] = clamp(original.pixels[i * 4 + 2] * (1 - t * alpha))
    out[i * 4 + 3] = 255
  }
  return makeImageData(original.width, original.height, out)
}

// ─── 1D/2D radix-2 FFT ──────────────────────────────────────────────────────

export function fft1D(re: ArrayLike<number>, im: ArrayLike<number>): { re: Float64Array; im: Float64Array } {
  const N = re.length
  if (N <= 1) return { re: Float64Array.from(re), im: Float64Array.from(im) }
  const outRe = new Float64Array(N), outIm = new Float64Array(N)
  for (let i = 0; i < N; i++) { outRe[i] = re[i]; outIm[i] = im[i] }
  let j = 0
  for (let i = 1; i < N; i++) {
    let bit = N >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[outRe[i], outRe[j]] = [outRe[j], outRe[i]]
      ;[outIm[i], outIm[j]] = [outIm[j], outIm[i]]
    }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = -2 * Math.PI / len
    const wRe = Math.cos(ang), wIm = Math.sin(ang)
    for (let i = 0; i < N; i += len) {
      let curRe = 1, curIm = 0
      for (let k = 0; k < len / 2; k++) {
        const uRe = outRe[i + k], uIm = outIm[i + k]
        const vRe = outRe[i + k + len / 2] * curRe - outIm[i + k + len / 2] * curIm
        const vIm = outRe[i + k + len / 2] * curIm + outIm[i + k + len / 2] * curRe
        outRe[i + k] = uRe + vRe; outIm[i + k] = uIm + vIm
        outRe[i + k + len / 2] = uRe - vRe; outIm[i + k + len / 2] = uIm - vIm
        const nRe = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe; curRe = nRe
      }
    }
  }
  return { re: outRe, im: outIm }
}

export function ifft1D(re: ArrayLike<number>, im: ArrayLike<number>): { re: Float64Array; im: Float64Array } {
  const N = re.length
  const { re: outRe, im: outIm } = fft1D(im, re)
  return { re: outRe.map((v) => v / N), im: outIm.map((v) => v / N) }
}

export function fft2D(matrix: Float64Array, N: number): { re: Float64Array; im: Float64Array } {
  const rowRe = Array.from({ length: N }, (_, r) => {
    const row = Array.from({ length: N }, (_, c) => matrix[r * N + c])
    return fft1D(row, new Array(N).fill(0))
  })
  const out = { re: new Float64Array(N * N), im: new Float64Array(N * N) }
  for (let c = 0; c < N; c++) {
    const colRe = rowRe.map((r) => r.re[c])
    const colIm = rowRe.map((r) => r.im[c])
    const { re, im } = fft1D(colRe, colIm)
    for (let r = 0; r < N; r++) { out.re[r * N + c] = re[r]; out.im[r * N + c] = im[r] }
  }
  return out
}

export function ifft2D(re: Float64Array, im: Float64Array, N: number): Float64Array {
  const colOut = { re: new Float64Array(N * N), im: new Float64Array(N * N) }
  for (let c = 0; c < N; c++) {
    const colRe = Array.from({ length: N }, (_, r) => re[r * N + c])
    const colIm = Array.from({ length: N }, (_, r) => im[r * N + c])
    const { re: cr, im: ci } = ifft1D(colRe, colIm)
    for (let r = 0; r < N; r++) { colOut.re[r * N + c] = cr[r]; colOut.im[r * N + c] = ci[r] }
  }
  const out = new Float64Array(N * N)
  for (let r = 0; r < N; r++) {
    const rowRe = Array.from({ length: N }, (_, c) => colOut.re[r * N + c])
    const rowIm = Array.from({ length: N }, (_, c) => colOut.im[r * N + c])
    const { re } = ifft1D(rowRe, rowIm)
    for (let c = 0; c < N; c++) out[r * N + c] = re[c]
  }
  return out
}

export function computeFFTData(img: ImgData): FftData {
  const N = FFT_N
  const flat = new Float64Array(N * N)
  for (let r = 0; r < N; r++) {
    const y = Math.round((r / (N - 1)) * (img.height - 1))
    for (let c = 0; c < N; c++) {
      const x = Math.round((c / (N - 1)) * (img.width - 1))
      flat[r * N + c] = luminanceAt(img, x, y)
    }
  }
  const { re, im } = fft2D(flat, N)
  const shiftedRe = new Float64Array(N * N)
  const shiftedIm = new Float64Array(N * N)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const sr = (r + N / 2) % N, sc = (c + N / 2) % N
      shiftedRe[sr * N + sc] = re[r * N + c]; shiftedIm[sr * N + sc] = im[r * N + c]
    }
  }
  const mag = new Float64Array(N * N)
  const phase = new Float64Array(N * N)
  for (let i = 0; i < N * N; i++) {
    mag[i] = Math.sqrt(shiftedRe[i] * shiftedRe[i] + shiftedIm[i] * shiftedIm[i])
    phase[i] = Math.atan2(shiftedIm[i], shiftedRe[i])
  }
  return { re: shiftedRe, im: shiftedIm, mag, phase, N }
}

export function applyFFTMaskAndInvert(fftData: FftData, mask: Uint8Array): ImgData {
  const { re, im, N } = fftData
  const maskedRe = new Float64Array(N * N)
  const maskedIm = new Float64Array(N * N)
  for (let i = 0; i < N * N; i++) {
    maskedRe[i] = mask[i] ? re[i] : 0
    maskedIm[i] = mask[i] ? im[i] : 0
  }
  const unshiftedRe = new Float64Array(N * N)
  const unshiftedIm = new Float64Array(N * N)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const sr = (r + N / 2) % N, sc = (c + N / 2) % N
      unshiftedRe[r * N + c] = maskedRe[sr * N + sc]; unshiftedIm[r * N + c] = maskedIm[sr * N + sc]
    }
  }
  const reconstructed = ifft2D(unshiftedRe, unshiftedIm, N)
  let min = Infinity, max = -Infinity
  for (let i = 0; i < N * N; i++) { if (reconstructed[i] < min) min = reconstructed[i]; if (reconstructed[i] > max) max = reconstructed[i] }
  const pixels = new Uint8ClampedArray(N * N * 4)
  for (let i = 0; i < N * N; i++) {
    const v = clamp(Math.round(((reconstructed[i] - min) / Math.max(max - min, 1)) * 255))
    pixels[i * 4] = v; pixels[i * 4 + 1] = v; pixels[i * 4 + 2] = v; pixels[i * 4 + 3] = 255
  }
  return makeImageData(N, N, pixels)
}

// ─── Affine transforms ──────────────────────────────────────────────────────

export function getTransformMatrix(type: string, params: { angle?: number; scale?: number; shear?: number; tx?: number; ty?: number }): number[][] {
  const { angle = 0, scale = 1, shear = 0, tx = 0, ty = 0 } = params
  const rad = angle * Math.PI / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  switch (type) {
    case 'rotate': return [[cos, -sin, tx], [sin, cos, ty]]
    case 'scale': return [[scale, 0, tx], [0, scale, ty]]
    case 'shear': return [[1, shear, tx], [0, 1, ty]]
    case 'flipH': return [[-1, 0, tx], [0, 1, ty]]
    case 'flipV': return [[1, 0, tx], [0, -1, ty]]
    default: return [[1, 0, tx], [0, 1, ty]]
  }
}

export function applyAffineTransform(img: ImgData, matrix: number[][]): ImgData {
  const [a, b, tx] = matrix[0]
  const [c, d, ty] = matrix[1]
  const det = a * d - b * c
  if (Math.abs(det) < 1e-10) return img
  const ai = d / det, bi = -b / det, ci = -c / det, di = a / det
  const cx = img.width / 2, cy = img.height / 2
  const out = new Uint8ClampedArray(img.width * img.height * 4)
  out.fill(0)
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const xc = x - cx - tx, yc = y - cy - ty
      const sx = ai * xc + bi * yc + cx
      const sy = ci * xc + di * yc + cy
      const oi = (y * img.width + x) * 4
      if (sx >= 0 && sx < img.width - 1 && sy >= 0 && sy < img.height - 1) {
        const x0 = Math.floor(sx), y0 = Math.floor(sy)
        const fx = sx - x0, fy = sy - y0
        const p00 = pixelAt(img, x0, y0)
        const p10 = pixelAt(img, x0 + 1, y0)
        const p01 = pixelAt(img, x0, y0 + 1)
        const p11 = pixelAt(img, x0 + 1, y0 + 1)
        out[oi] = clamp(p00.r * (1 - fx) * (1 - fy) + p10.r * fx * (1 - fy) + p01.r * (1 - fx) * fy + p11.r * fx * fy)
        out[oi + 1] = clamp(p00.g * (1 - fx) * (1 - fy) + p10.g * fx * (1 - fy) + p01.g * (1 - fx) * fy + p11.g * fx * fy)
        out[oi + 2] = clamp(p00.b * (1 - fx) * (1 - fy) + p10.b * fx * (1 - fy) + p01.b * (1 - fx) * fy + p11.b * fx * fy)
        out[oi + 3] = 255
      } else {
        // Checkerboard for the out-of-bounds area. The original WIP had
        // `x\8`/`y\8` here — `\` isn't a JS operator at all, a leftover typo
        // that would have thrown a SyntaxError the moment this file was ever
        // actually imported (it never was — this lab wasn't wired into the
        // app). Should be integer division: Math.floor(x / 8).
        const chk = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0 ? 180 : 220
        out[oi] = chk; out[oi + 1] = chk; out[oi + 2] = chk; out[oi + 3] = 255
      }
    }
  }
  return makeImageData(img.width, img.height, out)
}

// ─── OpenMAT helpers ────────────────────────────────────────────────────────

export function toOpenMatMatrix(matrix: number[][]): string {
  return `[${matrix.map((row) => row.map((v) => Math.round(v)).join(' ')).join('; ')}]`
}

export function buildOpenMatCells(img: ImgData, averages: { r: number; g: number; b: number; gray: number }) {
  const grayMatrix = toGrayMatrix(img, 14, 10)
  const matLit = toOpenMatMatrix(grayMatrix)
  const cx = Math.floor(grayMatrix[0].length / 2), cy = Math.floor(grayMatrix.length / 2)
  const patch = [
    grayMatrix[Math.max(0, cy - 1)].slice(Math.max(0, cx - 1), Math.max(0, cx - 1) + 3),
    grayMatrix[cy].slice(Math.max(0, cx - 1), Math.max(0, cx - 1) + 3),
    grayMatrix[Math.min(grayMatrix.length - 1, cy + 1)].slice(Math.max(0, cx - 1), Math.max(0, cx - 1) + 3),
  ]
  const sample = pixelAt(img, Math.floor(img.width / 2), Math.floor(img.height / 2))
  return [
    {
      id: 'image-matrix',
      cellTitle: 'Current image as a matrix',
      prose: ['Image Lab sends a downsampled luminance matrix into OpenMAT.'],
      code: `I = ${matLit};\nsize(I)\nv = flatten(I)\nmean(v)\nmin(v)\nmax(v)\n`,
    },
    {
      id: 'pixel-vector',
      cellTitle: 'Inspect one pixel as a vector',
      prose: ['A pixel is a vector in RGB space. The luminance is a weighted sum.'],
      code: `pixel = [${sample.r}; ${sample.g}; ${sample.b}]\nluminance_weights = [0.299 0.587 0.114]\nY = luminance_weights * pixel\nchannel_mean = [${averages.r.toFixed(2)} ${averages.g.toFixed(2)} ${averages.b.toFixed(2)}]\n`,
    },
    {
      id: 'kernel-math',
      cellTitle: 'Convolution as dot product',
      prose: ['Each output pixel = element-wise multiply kernel with neighborhood, then sum.'],
      code: `K = [0 -1 0; -1 5 -1; 0 -1 0]\npatch = ${toOpenMatMatrix(patch)}\nfiltered_center = sum(sum(K .* patch))\n`,
    },
    {
      id: 'svd-intro',
      cellTitle: 'SVD and image compression',
      prose: ['A = U Σ Vᵀ. Keeping only the top-k singular values approximates the image.'],
      code: `A = ${matLit}\n[U,S,V] = svd(A)\ns = diag(S)\nrank_1_approx = s(1) * U(:,1) * V(:,1)'\nenergy = s(1)^2 / sum(s.^2)\n`,
    },
  ]
}
