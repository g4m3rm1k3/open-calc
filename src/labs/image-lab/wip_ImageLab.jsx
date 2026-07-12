import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, Archive, BarChart3, Blend, BookOpen, BrainCircuit, Check, ChevronDown, ChevronRight, Copy, Download, Eye, FileImage, FileText, FlipHorizontal2, FlipVertical2, GitBranch, Grid3X3, History, Image as ImageIcon, Layers, Maximize2, MousePointer2, Move, PanelLeft, RefreshCw, RotateCw, Scan, SlidersHorizontal, Sparkles, Upload, Wand2, Zap,
} from 'lucide-react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { STUDIO_THEMES } from '../../utils/studioThemes.js'
import { runOpenMatScript, svdDecomp } from '../../engines/openmat/openmatEngine.js'
import OpenMatNotebook from '../../components/notebooks/OpenMatNotebook.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────

const WIDTH = 128
const HEIGHT = 88
const MAX_UPLOAD_SIDE = 180
const SVD_W = 64
const SVD_H = 48
const FFT_N = 32 // power-of-2 size for FFT

const LABS = [
  { id: 'pixels',      label: 'Pixels',    icon: MousePointer2 },
  { id: 'histogram',   label: 'Histogram', icon: BarChart3 },
  { id: 'rgb',         label: 'RGB',       icon: Blend },
  { id: 'matrix',      label: 'Matrix',    icon: Grid3X3 },
  { id: 'edges',       label: 'Edges',     icon: Scan },
  { id: 'convolution', label: 'Filters',   icon: Wand2 },
  { id: 'transform',   label: 'Transform', icon: Move },
  { id: 'svd',         label: 'SVD',       icon: Zap },
  { id: 'fft',         label: 'FFT',       icon: Activity },
  { id: 'compress',    label: 'Compress',  icon: Archive },
  { id: 'openmat',     label: 'OpenMAT',   icon: BrainCircuit },
  { id: 'notebook',    label: 'Notebook',  icon: BookOpen },
  { id: 'log',         label: 'Log',       icon: History },
]

const PRESETS = {
  identity: { name: 'Identity', values: [[0,0,0],[0,1,0],[0,0,0]] },
  sharpen:  { name: 'Sharpen',  values: [[0,-1,0],[-1,5,-1],[0,-1,0]] },
  blur:     { name: 'Box Blur', values: [[1,1,1],[1,1,1],[1,1,1]] },
  edge:     { name: 'Laplacian',values: [[0,1,0],[1,-4,1],[0,1,0]] },
  sobel:    { name: 'Sobel X',  values: [[-1,0,1],[-2,0,2],[-1,0,1]] },
  gauss:    { name: 'Gaussian', values: [[1,2,1],[2,4,2],[1,2,1]] },
}

const TRANSFORM_TYPES = [
  { id: 'identity',    label: 'Identity' },
  { id: 'rotate',      label: 'Rotation' },
  { id: 'scale',       label: 'Scale' },
  { id: 'shear',       label: 'Shear' },
  { id: 'flipH',       label: 'Flip H' },
  { id: 'flipV',       label: 'Flip V' },
  { id: 'custom',      label: 'Custom' },
]

const EDGE_METHODS = [
  { id: 'sobel',     label: 'Sobel' },
  { id: 'prewitt',   label: 'Prewitt' },
  { id: 'laplacian', label: 'Laplacian' },
  { id: 'roberts',   label: 'Roberts' },
  { id: 'canny',     label: 'Canny' },
]

// ─── Pure math helpers ────────────────────────────────────────────────────────

function clamp(v, lo = 0, hi = 255) { return Math.max(lo, Math.min(hi, v)) }
function makeImageData(w, h, pix) { return { width: w, height: h, pixels: pix } }
function copyImageData(img) { return makeImageData(img.width, img.height, new Uint8ClampedArray(img.pixels)) }

function pixelAt(img, x, y) {
  const cx = clamp(x, 0, img.width  - 1)
  const cy = clamp(y, 0, img.height - 1)
  const i  = (cy * img.width + cx) * 4
  return { x: cx, y: cy, r: img.pixels[i], g: img.pixels[i+1], b: img.pixels[i+2], a: img.pixels[i+3] }
}

function luminanceAt(img, x, y) {
  const p = pixelAt(img, x, y)
  return 0.299 * p.r + 0.587 * p.g + 0.114 * p.b
}

function toGrayMatrix(img, tw = 48, th = 34) {
  const w = Math.min(tw, img.width), h = Math.min(th, img.height)
  return Array.from({ length: h }, (_, r) => {
    const y = Math.round((r / Math.max(1, h - 1)) * (img.height - 1))
    return Array.from({ length: w }, (_, c) => {
      const x = Math.round((c / Math.max(1, w - 1)) * (img.width - 1))
      return luminanceAt(img, x, y)
    })
  })
}

// ─── Color space conversions ──────────────────────────────────────────────────

function rgbToHsv(r, g, b) {
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

function rgbToLab(r, g, b) {
  let R = r / 255, G = g / 255, B = b / 255
  const lin = v => v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  R = lin(R); G = lin(G); B = lin(B)
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  const Y = (R * 0.2126 + G * 0.7152 + B * 0.0722)
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  const L = Math.round(116 * f(Y) - 16)
  const a = Math.round(500 * (f(X) - f(Y)))
  const bv = Math.round(200 * (f(Y) - f(Z)))
  return { L, a, b: bv }
}

function computeGradient(img, x, y) {
  const gx = luminanceAt(img, x + 1, y) - luminanceAt(img, x - 1, y)
  const gy = luminanceAt(img, x, y + 1) - luminanceAt(img, x, y - 1)
  return {
    gx: gx.toFixed(1), gy: gy.toFixed(1),
    magnitude: Math.sqrt(gx * gx + gy * gy).toFixed(1),
    direction: (Math.atan2(gy, gx) * 180 / Math.PI).toFixed(1),
  }
}

// ─── Sample image ─────────────────────────────────────────────────────────────

function sampleImage() {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4)
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i  = (y * WIDTH + x) * 4
      const dx = x - WIDTH * 0.36, dy = y - HEIGHT * 0.5
      const radial = Math.max(0, 1 - Math.sqrt(dx*dx + dy*dy) / 58)
      const stripe = Math.sin((x + y * 1.7) * 0.16) * 0.5 + 0.5
      const wave   = Math.cos((x - y) * 0.09) * 0.5 + 0.5
      pixels[i]   = clamp(34  + x * 1.24 + radial * 96)
      pixels[i+1] = clamp(48  + y * 1.75 + stripe * 84)
      pixels[i+2] = clamp(86  + wave * 118 + radial * 52)
      pixels[i+3] = 255
    }
  }
  return makeImageData(WIDTH, HEIGHT, pixels)
}

// ─── Image processing ─────────────────────────────────────────────────────────

function applyAdjustments(img, s) {
  const out = copyImageData(img)
  const contrast = s.contrast / 100
  const gamma    = Math.max(0.15, s.gamma)
  for (let i = 0; i < out.pixels.length; i += 4) {
    let r = img.pixels[i], g = img.pixels[i+1], b = img.pixels[i+2]
    r = clamp((r - 128) * contrast + 128 + s.brightness)
    g = clamp((g - 128) * contrast + 128 + s.brightness)
    b = clamp((b - 128) * contrast + 128 + s.brightness)
    r = clamp(255 * Math.pow(r / 255, 1 / gamma))
    g = clamp(255 * Math.pow(g / 255, 1 / gamma))
    b = clamp(255 * Math.pow(b / 255, 1 / gamma))
    if (s.channel === 'gray') { const y = 0.299*r + 0.587*g + 0.114*b; r=y; g=y; b=y }
    else if (s.channel === 'red')   { g = 0; b = 0 }
    else if (s.channel === 'green') { r = 0; b = 0 }
    else if (s.channel === 'blue')  { r = 0; g = 0 }
    out.pixels[i] = r; out.pixels[i+1] = g; out.pixels[i+2] = b
  }
  return out
}

function applyKernel(img, kernel, normalize) {
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
          const w = Number(kernel[ky+1][kx+1] || 0)
          t[0] += p.r * w; t[1] += p.g * w; t[2] += p.b * w
        }
      }
      out[oi] = clamp(t[0]/div); out[oi+1] = clamp(t[1]/div); out[oi+2] = clamp(t[2]/div); out[oi+3] = 255
    }
  }
  return makeImageData(img.width, img.height, out)
}

function histogram(img) {
  const bins = Array.from({ length: 32 }, () => ({ gray: 0, r: 0, g: 0, b: 0 }))
  for (let i = 0; i < img.pixels.length; i += 4) {
    const r = img.pixels[i], g = img.pixels[i+1], b = img.pixels[i+2]
    bins[Math.min(31, Math.floor((0.299*r + 0.587*g + 0.114*b) / 8))].gray += 1
    bins[Math.min(31, Math.floor(r / 8))].r += 1
    bins[Math.min(31, Math.floor(g / 8))].g += 1
    bins[Math.min(31, Math.floor(b / 8))].b += 1
  }
  return bins
}

function channelAverages(img) {
  const t = { r: 0, g: 0, b: 0, gray: 0 }
  const n = img.width * img.height
  for (let i = 0; i < img.pixels.length; i += 4) {
    t.r += img.pixels[i]; t.g += img.pixels[i+1]; t.b += img.pixels[i+2]
    t.gray += 0.299*img.pixels[i] + 0.587*img.pixels[i+1] + 0.114*img.pixels[i+2]
  }
  return { r: t.r/n, g: t.g/n, b: t.b/n, gray: t.gray/n }
}

function readImageFile(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(MAX_UPLOAD_SIDE / img.width, MAX_UPLOAD_SIDE / img.height, 1)
        const w = Math.max(8, Math.round(img.width * scale))
        const h = Math.max(8, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0, w, h)
        res(makeImageData(w, h, new Uint8ClampedArray(ctx.getImageData(0, 0, w, h).data)))
      }
      img.onerror = rej; img.src = ev.target.result
    }
    reader.onerror = rej; reader.readAsDataURL(file)
  })
}

// ─── PSNR ─────────────────────────────────────────────────────────────────────

function computePSNR(ref, test, w, h) {
  let mse = 0
  for (let i = 0; i < w * h; i++) mse += Math.pow(ref[i] - test[i], 2)
  mse /= w * h
  return mse < 1e-10 ? Infinity : 20 * Math.log10(255 / Math.sqrt(mse))
}

// ─── SVD image analysis ───────────────────────────────────────────────────────

function computeImageSVD(img) {
  const gray = toGrayMatrix(img, SVD_W, SVD_H)
  const result = svdDecomp(gray)
  // Extract singular values from diagonal of S
  const sigmas = result.S.map((row, i) => Math.abs(row[i] ?? 0))
  return { U: result.U, V: result.V, sigmas, w: SVD_W, h: SVD_H, gray }
}

function reconstructFromSVD(U, V, sigmas, k, w, h) {
  const flat = new Float32Array(h * w)
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      let sum = 0
      for (let i = 0; i < k; i++) {
        sum += sigmas[i] * (U[r]?.[i] ?? 0) * (V[c]?.[i] ?? 0)
      }
      flat[r * w + c] = sum
    }
  }
  return flat
}

function svdToImage(flat, w, h) {
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const v = clamp(Math.round(flat[i]))
    pixels[i*4] = v; pixels[i*4+1] = v; pixels[i*4+2] = v; pixels[i*4+3] = 255
  }
  return makeImageData(w, h, pixels)
}

// ─── Edge detection ───────────────────────────────────────────────────────────

const EDGE_KERNELS = {
  sobel:     { kx: [[-1,0,1],[-2,0,2],[-1,0,1]], ky: [[-1,-2,-1],[0,0,0],[1,2,1]] },
  prewitt:   { kx: [[-1,0,1],[-1,0,1],[-1,0,1]], ky: [[-1,-1,-1],[0,0,0],[1,1,1]] },
  laplacian: { k:  [[0,1,0],[1,-4,1],[0,1,0]] },
  roberts:   { kx: [[1,0],[0,-1]], ky: [[0,1],[-1,0]] },
}

function applyEdgeKernel(img, k) {
  let total = 0
  for (let ky = 0; ky < k.length; ky++) {
    for (let kx = 0; kx < k[0].length; kx++) {
      const ox = kx - Math.floor(k[0].length / 2)
      const oy = ky - Math.floor(k.length / 2)
      // can't sum here, just return a function
      void ox; void oy
    }
  }
  void total
  return k  // placeholder
}

function computeEdgeMap(img, method) {
  const out = new Uint8ClampedArray(img.width * img.height * 4)
  const kern = EDGE_KERNELS[method] || EDGE_KERNELS.sobel

  function convolve(x, y, k) {
    const oh = Math.floor(k.length / 2)
    const ow = Math.floor(k[0].length / 2)
    let sum = 0
    for (let ky = 0; ky < k.length; ky++) {
      for (let kx = 0; kx < k[0].length; kx++) {
        sum += luminanceAt(img, x + kx - ow, y + ky - oh) * k[ky][kx]
      }
    }
    return sum
  }

  // Canny approximation: Sobel + threshold + NMS simplified
  if (method === 'canny') {
    const magnitudes = new Float32Array(img.width * img.height)
    const ks = EDGE_KERNELS.sobel
    let maxMag = 0
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const gx = convolve(x, y, ks.kx)
        const gy = convolve(x, y, ks.ky)
        const mag = Math.sqrt(gx*gx + gy*gy)
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
        out[oi] = v; out[oi+1] = v; out[oi+2] = v; out[oi+3] = 255
      }
    }
    return makeImageData(img.width, img.height, out)
  }

  if (kern.k) {
    // Single kernel (Laplacian)
    let max = 0
    const raw = new Float32Array(img.width * img.height)
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const v = Math.abs(convolve(x, y, kern.k))
        raw[y * img.width + x] = v
        if (v > max) max = v
      }
    }
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const oi = (y * img.width + x) * 4
        const v  = clamp(Math.round(raw[y * img.width + x] * 255 / Math.max(max, 1)))
        out[oi] = v; out[oi+1] = v; out[oi+2] = v; out[oi+3] = 255
      }
    }
  } else {
    // Dual kernel (gradient magnitude)
    let max = 0
    const raw = new Float32Array(img.width * img.height)
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const gx = convolve(x, y, kern.kx)
        const gy = convolve(x, y, kern.ky)
        const mag = Math.sqrt(gx*gx + gy*gy)
        raw[y * img.width + x] = mag
        if (mag > max) max = mag
      }
    }
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const oi = (y * img.width + x) * 4
        const v  = clamp(Math.round(raw[y * img.width + x] * 255 / Math.max(max, 1)))
        out[oi] = v; out[oi+1] = v; out[oi+2] = v; out[oi+3] = 255
      }
    }
  }
  return makeImageData(img.width, img.height, out)
}

function overlayEdges(original, edges, alpha = 0.7) {
  const out = new Uint8ClampedArray(original.width * original.height * 4)
  for (let i = 0; i < original.width * original.height; i++) {
    const edgeVal = edges.pixels[i * 4]
    const t = edgeVal / 255
    out[i*4]   = clamp(original.pixels[i*4]   * (1 - t * alpha) + 255 * t * alpha * 0.9)
    out[i*4+1] = clamp(original.pixels[i*4+1] * (1 - t * alpha))
    out[i*4+2] = clamp(original.pixels[i*4+2] * (1 - t * alpha))
    out[i*4+3] = 255
  }
  return makeImageData(original.width, original.height, out)
}

// ─── Affine transform ─────────────────────────────────────────────────────────

function getTransformMatrix(type, params) {
  const { angle = 0, scale = 1, shear = 0, tx = 0, ty = 0 } = params
  const rad = angle * Math.PI / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  switch (type) {
    case 'rotate':   return [[cos, -sin, tx], [sin, cos, ty]]
    case 'scale':    return [[scale, 0, tx], [0, scale, ty]]
    case 'shear':    return [[1, shear, tx], [0, 1, ty]]
    case 'flipH':    return [[-1, 0, tx], [0, 1, ty]]
    case 'flipV':    return [[1, 0, tx], [0, -1, ty]]
    default:         return [[1, 0, tx], [0, 1, ty]]
  }
}

function applyAffineTransform(img, matrix) {
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
        // Bilinear interpolation
        const x0 = Math.floor(sx), y0 = Math.floor(sy)
        const fx = sx - x0, fy = sy - y0
        const p00 = pixelAt(img, x0,   y0)
        const p10 = pixelAt(img, x0+1, y0)
        const p01 = pixelAt(img, x0,   y0+1)
        const p11 = pixelAt(img, x0+1, y0+1)
        out[oi]   = clamp(p00.r*(1-fx)*(1-fy) + p10.r*fx*(1-fy) + p01.r*(1-fx)*fy + p11.r*fx*fy)
        out[oi+1] = clamp(p00.g*(1-fx)*(1-fy) + p10.g*fx*(1-fy) + p01.g*(1-fx)*fy + p11.g*fx*fy)
        out[oi+2] = clamp(p00.b*(1-fx)*(1-fy) + p10.b*fx*(1-fy) + p01.b*(1-fx)*fy + p11.b*fx*fy)
        out[oi+3] = 255
      } else {
        // Checkerboard for transparent area
        const chk = ((Math.floor(x/8) + Math.floor(y/8)) % 2 === 0) ? 180 : 220
        out[oi] = chk; out[oi+1] = chk; out[oi+2] = chk; out[oi+3] = 255
      }
    }
  }
  return makeImageData(img.width, img.height, out)
}

// ─── 1D Radix-2 FFT ───────────────────────────────────────────────────────────

function fft1D(re, im) {
  const N = re.length
  if (N <= 1) return { re: [...re], im: [...im] }
  const outRe = new Float64Array(N), outIm = new Float64Array(N)
  for (let i = 0; i < N; i++) { outRe[i] = re[i]; outIm[i] = im[i] }
  // Bit-reversal permutation
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
  // Cooley-Tukey
  for (let len = 2; len <= N; len <<= 1) {
    const ang = -2 * Math.PI / len
    const wRe = Math.cos(ang), wIm = Math.sin(ang)
    for (let i = 0; i < N; i += len) {
      let curRe = 1, curIm = 0
      for (let k = 0; k < len / 2; k++) {
        const uRe = outRe[i+k], uIm = outIm[i+k]
        const vRe = outRe[i+k+len/2] * curRe - outIm[i+k+len/2] * curIm
        const vIm = outRe[i+k+len/2] * curIm + outIm[i+k+len/2] * curRe
        outRe[i+k]         = uRe + vRe;  outIm[i+k]         = uIm + vIm
        outRe[i+k+len/2]   = uRe - vRe;  outIm[i+k+len/2]   = uIm - vIm
        const nRe = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe; curRe = nRe
      }
    }
  }
  return { re: outRe, im: outIm }
}

function ifft1D(re, im) {
  const N = re.length
  const { re: outRe, im: outIm } = fft1D(im, re)
  return { re: new Float64Array(outRe).map(v => v / N), im: new Float64Array(outIm).map(v => v / N) }
}

function fft2D(matrix, N) {
  // FFT each row
  const rowRe = Array.from({ length: N }, (_, r) => {
    const row = Array.from({ length: N }, (_, c) => matrix[r * N + c])
    return fft1D(row, new Array(N).fill(0))
  })
  // FFT each column
  const out = { re: new Float64Array(N * N), im: new Float64Array(N * N) }
  for (let c = 0; c < N; c++) {
    const colRe = rowRe.map(r => r.re[c])
    const colIm = rowRe.map(r => r.im[c])
    const { re, im } = fft1D(colRe, colIm)
    for (let r = 0; r < N; r++) { out.re[r*N+c] = re[r]; out.im[r*N+c] = im[r] }
  }
  return out
}

function ifft2D(re, im, N) {
  // IFFT columns
  const colOut = { re: new Float64Array(N * N), im: new Float64Array(N * N) }
  for (let c = 0; c < N; c++) {
    const colRe = Array.from({ length: N }, (_, r) => re[r*N+c])
    const colIm = Array.from({ length: N }, (_, r) => im[r*N+c])
    const { re: cr, im: ci } = ifft1D(colRe, colIm)
    for (let r = 0; r < N; r++) { colOut.re[r*N+c] = cr[r]; colOut.im[r*N+c] = ci[r] }
  }
  // IFFT rows
  const out = new Float64Array(N * N)
  for (let r = 0; r < N; r++) {
    const rowRe = Array.from({ length: N }, (_, c) => colOut.re[r*N+c])
    const rowIm = Array.from({ length: N }, (_, c) => colOut.im[r*N+c])
    const { re } = ifft1D(rowRe, rowIm)
    for (let c = 0; c < N; c++) out[r*N+c] = re[c]
  }
  return out
}

function computeFFTData(img) {
  // Downsample to FFT_N × FFT_N
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
  // Shift (center DC component)
  const shiftedRe = new Float64Array(N * N)
  const shiftedIm = new Float64Array(N * N)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const sr = (r + N/2) % N, sc = (c + N/2) % N
      shiftedRe[sr*N+sc] = re[r*N+c]; shiftedIm[sr*N+sc] = im[r*N+c]
    }
  }
  const mag  = new Float64Array(N * N)
  const phase = new Float64Array(N * N)
  for (let i = 0; i < N * N; i++) {
    mag[i]   = Math.sqrt(shiftedRe[i]*shiftedRe[i] + shiftedIm[i]*shiftedIm[i])
    phase[i] = Math.atan2(shiftedIm[i], shiftedRe[i])
  }
  return { re: shiftedRe, im: shiftedIm, mag, phase, N }
}

function applyFFTMaskAndInvert(fftData, mask) {
  const { re, im, N } = fftData
  const maskedRe = new Float64Array(N * N)
  const maskedIm = new Float64Array(N * N)
  for (let i = 0; i < N * N; i++) {
    maskedRe[i] = mask[i] ? re[i] : 0
    maskedIm[i] = mask[i] ? im[i] : 0
  }
  // Unshift
  const unshiftedRe = new Float64Array(N * N)
  const unshiftedIm = new Float64Array(N * N)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const sr = (r + N/2) % N, sc = (c + N/2) % N
      unshiftedRe[r*N+c] = maskedRe[sr*N+sc]; unshiftedIm[r*N+c] = maskedIm[sr*N+sc]
    }
  }
  const reconstructed = ifft2D(unshiftedRe, unshiftedIm, N)
  let min = Infinity, max = -Infinity
  for (let i = 0; i < N * N; i++) { if (reconstructed[i] < min) min = reconstructed[i]; if (reconstructed[i] > max) max = reconstructed[i] }
  const pixels = new Uint8ClampedArray(N * N * 4)
  for (let i = 0; i < N * N; i++) {
    const v = clamp(Math.round(((reconstructed[i] - min) / Math.max(max - min, 1)) * 255))
    pixels[i*4] = v; pixels[i*4+1] = v; pixels[i*4+2] = v; pixels[i*4+3] = 255
  }
  return makeImageData(N, N, pixels)
}

// ─── OpenMAT helpers ──────────────────────────────────────────────────────────

function toOpenMatMatrix(matrix) {
  return `[${matrix.map(row => row.map(v => Math.round(v)).join(' ')).join('; ')}]`
}

function buildOpenMatCells(img, averages) {
  const grayMatrix = toGrayMatrix(img, 14, 10)
  const matLit = toOpenMatMatrix(grayMatrix)
  const cx = Math.floor(grayMatrix[0].length / 2), cy = Math.floor(grayMatrix.length / 2)
  const patch = [
    grayMatrix[Math.max(0, cy-1)].slice(Math.max(0, cx-1), Math.max(0, cx-1)+3),
    grayMatrix[cy].slice(Math.max(0, cx-1), Math.max(0, cx-1)+3),
    grayMatrix[Math.min(grayMatrix.length-1, cy+1)].slice(Math.max(0, cx-1), Math.max(0, cx-1)+3),
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

// ─── UI Components ────────────────────────────────────────────────────────────

function Button({ children, active, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
        active
          ? 'border-transparent bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-lg shadow-brand-500/40'
          : 'border-slate-200/50 bg-white/40 text-slate-600 hover:bg-white/80 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
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
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 ${
        active
          ? 'border-transparent bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-lg shadow-brand-500/40'
          : 'border-slate-200/50 bg-white/40 text-slate-500 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border px-3 py-2 transition-all duration-300 backdrop-blur-md ${
      highlight 
        ? 'border-brand-400/50 bg-brand-500/10 shadow-md shadow-brand-500/15' 
        : 'border-slate-200/50 bg-white/40 dark:border-white/10 dark:bg-white/5'
    }`}>
      <div className={`font-mono text-sm font-bold tracking-tight ${
        highlight 
          ? 'bg-gradient-to-r from-brand-400 to-sky-400 bg-clip-text text-transparent' 
          : 'text-slate-900 dark:text-slate-100'
      }`}>
        {value}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400/80">{label}</div>
    </div>
  )
}

function Range({ label, value, min, max, step = 1, onChange, suffix = '' }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="text-brand-600 dark:text-brand-400">{value}{suffix}</span>
      </div>
      <input
        className="w-full accent-brand-500"
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function SectionHeader({ icon: Icon, label, children }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
      {Icon && <Icon className="h-4 w-4 text-brand-500" />}
      {label}
      {children}
    </div>
  )
}

function LearnBox({ children }) {
  return (
    <div className="mt-4 rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-500/10 to-sky-500/5 p-4 text-[11px] leading-relaxed text-brand-900 shadow-inner backdrop-blur-sm dark:text-brand-100">
      {children}
    </div>
  )
}

// ─── Canvas View ──────────────────────────────────────────────────────────────

function CanvasView({ image, original, mode, inspect, onInspect }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = image.width; canvas.height = image.height
    const ctx = canvas.getContext('2d')
    const frame = ctx.createImageData(image.width, image.height)
    if (mode === 'difference') {
      for (let i = 0; i < image.pixels.length; i += 4) {
        const diff = Math.max(
          Math.abs(original.pixels[i]   - image.pixels[i]),
          Math.abs(original.pixels[i+1] - image.pixels[i+1]),
          Math.abs(original.pixels[i+2] - image.pixels[i+2]),
        )
        frame.data[i] = clamp(diff * 2.2); frame.data[i+1] = clamp(36 + diff * 0.45)
        frame.data[i+2] = clamp(255 - diff * 1.3); frame.data[i+3] = 255
      }
    } else {
      frame.data.set(image.pixels)
    }
    ctx.putImageData(frame, 0, 0)
  }, [image, mode, original])

  const handleMove = useCallback(e => {
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
        className="relative z-10 max-h-full max-w-full rounded-xl border border-slate-300/50 bg-white/10 shadow-2xl backdrop-blur-sm transition-transform duration-500 dark:border-white/10"
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

// ─── Matrix Preview ───────────────────────────────────────────────────────────

function MatrixPreview({ image }) {
  const matrix = toGrayMatrix(image, 12, 8)
  return (
    <div className="grid grid-cols-12 gap-px overflow-hidden rounded-xl border border-slate-200/50 bg-slate-200/50 font-mono text-[9px] shadow-inner dark:border-white/10 dark:bg-white/5">
      {matrix.flatMap((row, r) => row.map((v, c) => (
        <div key={`${r}-${c}`} className="flex h-8 items-center justify-center bg-white/80 text-slate-600 transition-colors hover:bg-brand-50 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:bg-brand-950" style={{ opacity: 0.48 + v / 510 }}>
          {Math.round(v)}
        </div>
      )))}
    </div>
  )
}

// ─── Histogram Bars ───────────────────────────────────────────────────────────

function HistogramBars({ bins, channel = 'gray' }) {
  const max = Math.max(...bins.map(b => b[channel]), 1)
  const color = { gray: 'bg-slate-500', r: 'bg-red-500', g: 'bg-emerald-500', b: 'bg-blue-500' }[channel]
  return (
    <div className="flex h-28 items-end gap-0.5 rounded-xl border border-slate-200/50 bg-white/40 p-2 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      {bins.map((b, i) => (
        <div key={i} title={`${i*8}–${i*8+7}: ${b[channel]}`}
          className={`min-w-1 flex-1 rounded-t ${color}`}
          style={{ height: `${Math.max(4, (b[channel] / max) * 100)}%` }} />
      ))}
    </div>
  )
}

// ─── Kernel Editor ────────────────────────────────────────────────────────────

function KernelEditor({ kernel, setKernel, normalize, setNormalize, setLog }) {
  function update(row, col, val) {
    setKernel(prev => prev.map((line, r) => line.map((cell, c) => (r === row && c === col ? Number(val) : cell))))
  }
  function usePreset(id) {
    setKernel(PRESETS[id].values)
    setLog(items => [{ label: `Loaded ${PRESETS[id].name} kernel`, at: Date.now() }, ...items].slice(0, 50))
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {kernel.flatMap((row, r) => row.map((v, c) => (
          <input key={`${r}-${c}`} type="number" value={v}
            onChange={e => update(r, c, e.target.value)}
            className="h-10 rounded-lg border border-slate-200/50 bg-white/60 text-center font-mono text-sm font-bold text-slate-800 shadow-sm transition-all focus:border-brand-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-slate-100 dark:focus:bg-black/80" />
        )))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(PRESETS).map(([id, p]) => (
          <Button key={id} onClick={() => usePreset(id)}>{p.name}</Button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={normalize} onChange={e => setNormalize(e.target.checked)} className="accent-brand-500" />
        Normalize by kernel sum
      </label>
    </div>
  )
}

// ─── SVD Explorer Panel ───────────────────────────────────────────────────────

function SVDExplorerPanel({ image, svdState, setSvdState, addEntry }) {
  const { data, k, computing } = svdState
  const maxK = data ? Math.min(data.sigmas.length, SVD_W, SVD_H) : 1

  const reconstructed = useMemo(() => {
    if (!data) return null
    const flat = reconstructFromSVD(data.U, data.V, data.sigmas, k, data.w, data.h)
    return flat
  }, [data, k])

  const { psnr, compressionRatio, energyFraction } = useMemo(() => {
    if (!data || !reconstructed) return { psnr: null, compressionRatio: null, energyFraction: null }
    const origFlat = new Float32Array(data.h * data.w)
    for (let r = 0; r < data.h; r++) for (let c = 0; c < data.w; c++) origFlat[r*data.w+c] = data.gray[r][c]
    const psnrVal = computePSNR(origFlat, reconstructed, data.w, data.h)
    const originalStorage = data.w * data.h
    const svdStorage = k * (data.h + data.w + 1)
    const totalSigmaEnergy = data.sigmas.reduce((s, v) => s + v*v, 0)
    const kSigmaEnergy = data.sigmas.slice(0, k).reduce((s, v) => s + v*v, 0)
    return {
      psnr: psnrVal === Infinity ? '∞' : psnrVal.toFixed(1),
      compressionRatio: (originalStorage / svdStorage).toFixed(2),
      energyFraction: ((kSigmaEnergy / totalSigmaEnergy) * 100).toFixed(1),
    }
  }, [data, reconstructed])

  const svdPreviewImage = useMemo(() => {
    if (!reconstructed || !data) return null
    return svdToImage(reconstructed, data.w, data.h)
  }, [reconstructed, data])

  function compute() {
    setSvdState(s => ({ ...s, computing: true }))
    setTimeout(() => {
      try {
        const result = computeImageSVD(image)
        const initK = Math.min(20, result.sigmas.length)
        setSvdState({ data: result, k: initK, computing: false })
        addEntry({ type: 'svd_compute', label: `Computed SVD (${result.sigmas.length} singular values)` })
      } catch (e) {
        setSvdState(s => ({ ...s, computing: false }))
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
              onChange={v => setSvdState(s => ({ ...s, k: v }))}
            />
            {/* Singular value bar chart */}
            <div>
              <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">Singular value magnitude (σ₁ … σ{data.sigmas.length})</div>
              <div className="flex h-16 items-end gap-px overflow-hidden rounded-xl border border-slate-200/50 bg-white/40 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                {data.sigmas.map((sv, i) => {
                  const pct = (sv / data.sigmas[0]) * 100
                  const kept = i < k
                  return (
                    <div key={i} title={`σ${i+1} = ${sv.toFixed(1)}`}
                      className={`flex-1 rounded-t transition-colors ${kept ? 'bg-brand-500 shadow-md shadow-brand-500/60' : 'bg-slate-300 dark:bg-white/10'}`}
                      style={{ height: `${Math.max(2, pct)}%` }} />
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-slate-400">
                <span>σ₁ = {data.sigmas[0].toFixed(0)} (largest)</span>
                <span>σ{data.sigmas.length} = {data.sigmas[data.sigmas.length-1].toFixed(1)} (smallest)</span>
              </div>
            </div>
            {/* Reconstructed preview */}
            {svdPreviewImage && (
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">Rank-{k} reconstruction (grayscale)</div>
                <div className="overflow-hidden rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10">
                  <canvas
                    width={svdPreviewImage.width}
                    height={svdPreviewImage.height}
                    ref={el => {
                      if (!el) return
                      const ctx = el.getContext('2d')
                      const id = ctx.createImageData(svdPreviewImage.width, svdPreviewImage.height)
                      id.data.set(svdPreviewImage.pixels)
                      ctx.putImageData(id, 0, 0)
                    }}
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

// ─── Transform Lab Panel ──────────────────────────────────────────────────────

function TransformLabPanel({ image, transformState, setTransformState, onTransformed, addEntry }) {
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

  function updateMatrix(row, col, val) {
    const m = customMatrix.map(r => [...r])
    m[row][col] = Number(val)
    setTransformState(s => ({ ...s, customMatrix: m, type: 'custom' }))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="space-y-4">
        <div>
          <SectionHeader label="Transform type" />
          <div className="flex flex-wrap gap-1.5">
            {TRANSFORM_TYPES.map(t => (
              <Button key={t.id} active={type === t.id} onClick={() => setTransformState(s => ({ ...s, type: t.id }))}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>
        {type === 'rotate' && (
          <Range label="Angle" value={angle} min={-180} max={180} step={1} suffix="°" onChange={v => setTransformState(s => ({ ...s, angle: v }))} />
        )}
        {type === 'scale' && (
          <Range label="Scale" value={scale} min={0.1} max={3} step={0.05} onChange={v => setTransformState(s => ({ ...s, scale: v }))} />
        )}
        {type === 'shear' && (
          <Range label="Shear" value={shear} min={-1.5} max={1.5} step={0.05} onChange={v => setTransformState(s => ({ ...s, shear: v }))} />
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
                onChange={e => updateMatrix(r, c, e.target.value)}
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

// ─── Edge Detection Panel ─────────────────────────────────────────────────────

function EdgeDetectionPanel({ image, edgeState, setEdgeState, addEntry }) {
  const { method, overlay, edgeImage } = edgeState

  function compute() {
    const edges = computeEdgeMap(image, method)
    setEdgeState(s => ({ ...s, edgeImage: edges }))
    addEntry({ type: 'edge_detect', label: `Computed ${method} edge detection` })
  }

  const displayImage = useMemo(() => {
    if (!edgeImage) return null
    if (overlay === 'original') return image
    if (overlay === 'edges') return edgeImage
    return overlayEdges(image, edgeImage)
  }, [edgeImage, overlay, image])

  const EXPLANATIONS = {
    sobel:     'Sobel detects edges by computing horizontal and vertical gradients using two 3×3 kernels. Gradient magnitude = √(Gx² + Gy²).',
    prewitt:   'Prewitt is similar to Sobel but with equal weights. Less noise-sensitive than Sobel.',
    laplacian: 'The Laplacian is a second-order derivative operator. It finds edges where the gradient changes most rapidly (zero-crossings).',
    roberts:   'Roberts cross uses 2×2 diagonal kernels — the oldest and simplest gradient operator.',
    canny:     'Canny is a multi-stage detector: smooth → gradient → non-maximum suppression → hysteresis thresholding. Produces thin, accurate edges.',
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <div className="space-y-4">
        <SectionHeader label="Detector" />
        <div className="space-y-1.5">
          {EDGE_METHODS.map(m => (
            <button key={m.id} type="button"
              onClick={() => setEdgeState(s => ({ ...s, method: m.id, edgeImage: null }))}
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
            {['original', 'edges', 'combined'].map(v => (
              <button key={v} type="button"
                onClick={() => setEdgeState(s => ({ ...s, overlay: v }))}
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
          <strong>{EDGE_METHODS.find(m => m.id === method)?.label}</strong> — {EXPLANATIONS[method]}
        </LearnBox>
        {displayImage && (
          <div className="overflow-hidden rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10">
            <canvas
              width={displayImage.width} height={displayImage.height}
              ref={el => {
                if (!el) return
                const ctx = el.getContext('2d')
                const id = ctx.createImageData(displayImage.width, displayImage.height)
                id.data.set(displayImage.pixels)
                ctx.putImageData(id, 0, 0)
              }}
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

// ─── FFT Lab Panel ────────────────────────────────────────────────────────────

function FFTLabPanel({ image, fftState, setFftState, addEntry }) {
  const { data, mask, computing, reconstructed } = fftState

  function compute() {
    setFftState(s => ({ ...s, computing: true }))
    setTimeout(() => {
      const fftData = computeFFTData(image)
      const N = fftData.N
      const initMask = new Uint8Array(N * N).fill(1)
      setFftState({ data: fftData, mask: initMask, computing: false, reconstructed: null })
      addEntry({ type: 'fft_compute', label: `Computed 2D FFT (${N}×${N} grid)` })
    }, 50)
  }

  function toggleCell(r, c) {
    setFftState(s => {
      if (!s.mask) return s
      const m = new Uint8Array(s.mask)
      const N = s.data.N
      m[r * N + c] = m[r * N + c] ? 0 : 1
      return { ...s, mask: m }
    })
  }

  function resetMask() {
    setFftState(s => s.data ? { ...s, mask: new Uint8Array(s.data.N * s.data.N).fill(1), reconstructed: null } : s)
  }

  function runIFFT() {
    if (!fftState.data || !fftState.mask) return
    const img = applyFFTMaskAndInvert(fftState.data, fftState.mask)
    setFftState(s => ({ ...s, reconstructed: img }))
    const zeroed = fftState.mask.filter(v => !v).length
    addEntry({ type: 'fft_edit', label: `Inverse FFT with ${zeroed} frequencies zeroed` })
  }

  const N = fftState.data?.N ?? FFT_N
  const logMag = useMemo(() => {
    if (!fftState.data) return null
    const { mag } = fftState.data
    const logVals = mag.map(v => Math.log1p(v))
    const maxVal = Math.max(...logVals, 1)
    return logVals.map(v => v / maxVal)
  }, [fftState.data])

  const zeroed = fftState.mask ? fftState.mask.filter(v => !v).length : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={compute} disabled={computing}>
          <Activity className="h-3.5 w-3.5" />
          {computing ? 'Computing…' : fftState.data ? 'Recompute FFT' : 'Compute 2D FFT'}
        </Button>
        {fftState.data && <>
          <Button onClick={resetMask}><RefreshCw className="h-3.5 w-3.5" /> Reset mask</Button>
          <Button onClick={runIFFT} active={!!fftState.reconstructed}><RotateCw className="h-3.5 w-3.5" /> Inverse FFT</Button>
          {zeroed > 0 && <span className="text-[11px] font-bold text-amber-500">{zeroed} frequencies erased</span>}
        </>}
      </div>

      {!fftState.data && !computing && (
        <LearnBox>
          <strong>What is the FFT?</strong> The Fourier Transform decomposes your image into sinusoidal waves of different frequencies.
          Low frequencies (center of the grid) = smooth gradients and large shapes.
          High frequencies (edges) = fine detail, sharp edges, noise.
          <br /><br />
          Click any cell in the frequency grid to zero out that frequency, then press <strong>Inverse FFT</strong> to see how the image changes.
          This is how JPEG compression works — it discards high-frequency coefficients.
        </LearnBox>
      )}

      {computing && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Computing 2D FFT ({FFT_N}×{FFT_N})…</span>
        </div>
      )}

      {fftState.data && logMag && (
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Frequency magnitude (click to erase)</div>
            <div
              className="inline-grid rounded-xl border-2 border-slate-800 bg-slate-900 p-2 shadow-2xl"
              style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, gap: '1px' }}
            >
              {logMag.map((v, i) => {
                const r = Math.floor(i / N), c = i % N
                const kept = fftState.mask?.[i] ?? 1
                const brightness = Math.round(v * 255)
                return (
                  <div key={i}
                    onClick={() => toggleCell(r, c)}
                    title={`(${r},${c}) magnitude=${fftState.data.mag[i].toFixed(1)} ${kept ? '✓' : '✗ erased'}`}
                    className="cursor-pointer rounded-sm transition-all hover:scale-110 hover:opacity-80"
                    style={{
                      width: 14, height: 14,
                      background: kept
                        ? `rgb(${Math.round(brightness * 0.14)}, ${Math.round(brightness * 0.86)}, ${Math.round(60 + brightness * 0.7)})`
                        : 'rgba(239,68,68,0.8)',
                    }}
                  />
                )
              })}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">DC (zero frequency) is at center</div>
          </div>
          <div className="space-y-4">
            {fftState.reconstructed ? (
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">Reconstructed image (inverse FFT)</div>
                <div className="overflow-hidden rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10">
                  <canvas
                    width={fftState.reconstructed.width} height={fftState.reconstructed.height}
                    ref={el => {
                      if (!el) return
                      const ctx = el.getContext('2d')
                      const id = ctx.createImageData(fftState.reconstructed.width, fftState.reconstructed.height)
                      id.data.set(fftState.reconstructed.pixels)
                      ctx.putImageData(id, 0, 0)
                    }}
                    style={{ imageRendering: 'pixelated', width: '100%', aspectRatio: `${N}/${N}` }}
                  />
                </div>
              </div>
            ) : (
              <LearnBox>
                <strong>Tip:</strong> Try zeroing the outer cells (high frequencies) to see a blurred version — this is exactly how low-pass filtering works.
                Zero the center cells to remove smooth gradients and see only edges (high-pass filtering).
              </LearnBox>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Stat label="FFT grid size" value={`${N}×${N}`} />
              <Stat label="Frequencies zeroed" value={zeroed} highlight={zeroed > 0} />
              <Stat label="Total coefficients" value={N * N} />
              <Stat label="Kept" value={N * N - zeroed} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Compression Lab Panel ────────────────────────────────────────────────────

function CompressionLabPanel({ image, svdState, setSvdState, addEntry }) {
  const { data, computing } = svdState
  const [rank, setRank] = useState(10)
  const [quantBits, setQuantBits] = useState(4)

  function computeSVD() {
    setSvdState(s => ({ ...s, computing: true }))
    setTimeout(() => {
      try {
        const result = computeImageSVD(image)
        setSvdState(s => ({ ...s, data: result, k: rank, computing: false }))
        addEntry({ type: 'compress_svd', label: 'Computed image SVD for compression comparison' })
      } catch {
        setSvdState(s => ({ ...s, computing: false }))
      }
    }, 50)
  }

  const quantized = useMemo(() => {
    const step = 256 / Math.pow(2, quantBits)
    const out = new Uint8ClampedArray(image.pixels.length)
    for (let i = 0; i < image.pixels.length; i += 4) {
      out[i]   = clamp(Math.round(image.pixels[i]   / step) * step)
      out[i+1] = clamp(Math.round(image.pixels[i+1] / step) * step)
      out[i+2] = clamp(Math.round(image.pixels[i+2] / step) * step)
      out[i+3] = 255
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
    for (let i = 0; i < image.width * image.height; i++) origGray[i] = 0.299*image.pixels[i*4] + 0.587*image.pixels[i*4+1] + 0.114*image.pixels[i*4+2]

    const quantGray = new Float32Array(quantized.pixels.length / 4)
    for (let i = 0; i < quantized.width * quantized.height; i++) quantGray[i] = 0.299*quantized.pixels[i*4] + 0.587*quantized.pixels[i*4+1] + 0.114*quantized.pixels[i*4+2]

    const qPsnr = computePSNR(origGray, quantGray, image.width, image.height)

    if (data && svdRecon) {
      const origLow = new Float32Array(data.h * data.w)
      const origGrayLow = toGrayMatrix(image, data.w, data.h)
      for (let r = 0; r < data.h; r++) for (let c = 0; c < data.w; c++) origLow[r*data.w+c] = origGrayLow[r][c]
      const reconGray = new Float32Array(data.h * data.w)
      for (let i = 0; i < data.h * data.w; i++) reconGray[i] = svdRecon.pixels[i*4]
      const svdPsnr = computePSNR(origLow, reconGray, data.w, data.h)
      return { quant: qPsnr === Infinity ? '∞' : qPsnr.toFixed(1), svd: svdPsnr === Infinity ? '∞' : svdPsnr.toFixed(1) }
    }
    return { quant: qPsnr === Infinity ? '∞' : qPsnr.toFixed(1), svd: null }
  }, [image, quantized, data, svdRecon])

  function MiniCanvas({ img }) {
    return (
      <canvas
        width={img.width} height={img.height}
        ref={el => {
          if (!el) return
          const ctx = el.getContext('2d')
          const id = ctx.createImageData(img.width, img.height)
          id.data.set(img.pixels)
          ctx.putImageData(id, 0, 0)
        }}
        style={{ imageRendering: 'pixelated', width: '100%', aspectRatio: `${img.width}/${img.height}` }}
        className="rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10"
      />
    )
  }

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
        {/* Original */}
        <div className="space-y-3 rounded-xl border border-slate-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">① Original</div>
          <MiniCanvas img={image} />
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-slate-500">Storage: {origStorage.toLocaleString()} bytes</div>
            <div className="font-mono text-[10px] text-slate-500">PSNR: ∞ dB (reference)</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
          </div>
        </div>

        {/* Quantized */}
        <div className="space-y-3 rounded-xl border border-slate-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">② Quantized ({quantBits}-bit)</div>
          <MiniCanvas img={quantized} />
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-slate-500">Storage: {Math.round(origStorage * quantBits / 8).toLocaleString()} bytes</div>
            <div className="font-mono text-[10px] text-slate-500">PSNR: {psnrs.quant} dB</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-all" style={{ width: `${Math.min(100, (quantBits / 8) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* SVD compressed */}
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
              <div className="h-full bg-brand-500 shadow-md shadow-brand-500/40 transition-all" style={{ width: `${Math.min(100, (svdStorage / origStorage) * 100)}%` }} />
            </div>}
          </div>
        </div>

        {/* Difference */}
        <div className="space-y-3 rounded-xl border border-slate-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">④ Quantization Error</div>
          <div className="overflow-hidden rounded-xl border border-slate-200/50 shadow-inner dark:border-white/10">
            <canvas
              width={image.width} height={image.height}
              ref={el => {
                if (!el) return
                const ctx = el.getContext('2d')
                const id = ctx.createImageData(image.width, image.height)
                for (let i = 0; i < image.pixels.length; i += 4) {
                  const diff = Math.abs(image.pixels[i] - quantized.pixels[i])
                  id.data[i] = clamp(diff * 4); id.data[i+1] = 0; id.data[i+2] = clamp(diff * 4); id.data[i+3] = 255
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

// ─── Enhanced Pixel Inspector ─────────────────────────────────────────────────

function PixelInspectorPanel({ image, inspect }) {
  const [tab, setTab] = useState('rgb')
  const px = inspect ?? pixelAt(image, Math.floor(image.width / 2), Math.floor(image.height / 2))
  const hsv = rgbToHsv(px.r, px.g, px.b)
  const lab = rgbToLab(px.r, px.g, px.b)
  const grad = computeGradient(image, px.x, px.y)
  const lum = Math.round(0.299 * px.r + 0.587 * px.g + 0.114 * px.b)

  const neighborhood = useMemo(() => {
    return [-1, 0, 1].map(dy => [-1, 0, 1].map(dx => pixelAt(image, px.x + dx, px.y + dy)))
  }, [image, px.x, px.y])

  const tabs = [
    { id: 'rgb', label: 'RGB' },
    { id: 'hsv', label: 'HSV' },
    { id: 'lab', label: 'L*a*b*' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'neighbor', label: '3×3' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div className="h-12 w-12 shrink-0 rounded-lg border-2 border-white shadow-lg dark:border-white/20"
          style={{ background: `rgb(${px.r},${px.g},${px.b})` }} />
        <div>
          <div className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100">Pixel ({px.x}, {px.y})</div>
          <div className="font-mono text-xs font-semibold text-slate-500">Luminance = {lum}</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200/50 pb-2 dark:border-white/10">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-300 ${
              tab === t.id ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'rgb' && (
        <div className="space-y-3">
          {[['Red', px.r, 'bg-red-500'], ['Green', px.g, 'bg-emerald-500'], ['Blue', px.b, 'bg-blue-500']].map(([label, val, color]) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px] font-bold"><span className="text-slate-500">{label}</span><span className="text-slate-900 dark:text-white">{val}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className={`h-full ${color} shadow-sm`} style={{ width: `${(val / 255) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="R" value={px.r} /><Stat label="G" value={px.g} /><Stat label="B" value={px.b} />
            <Stat label="Hex" value={`#${px.r.toString(16).padStart(2,'0')}${px.g.toString(16).padStart(2,'0')}${px.b.toString(16).padStart(2,'0')}`} />
            <Stat label="Alpha" value={px.a} />
            <Stat label="Lum" value={lum} highlight />
          </div>
        </div>
      )}

      {tab === 'hsv' && (
        <div className="space-y-4">
          <LearnBox>
            <strong>HSV</strong> (Hue, Saturation, Value) is a human-perceptual color space. Hue is the color angle (0°–360°). Saturation is how vivid. Value is brightness.
          </LearnBox>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Hue" value={`${hsv.h}°`} />
            <Stat label="Saturation" value={`${hsv.s}%`} />
            <Stat label="Value" value={`${hsv.v}%`} />
          </div>
          <div className="h-8 w-full overflow-hidden rounded-xl shadow-inner" style={{ background: `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))` }}>
            <div className="h-full w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ marginLeft: `${(hsv.h / 360) * 100}%` }} />
          </div>
        </div>
      )}

      {tab === 'lab' && (
        <div className="space-y-4">
          <LearnBox>
            <strong>L*a*b*</strong> is a perceptually uniform color space designed to match human vision. L* = lightness (0=black, 100=white). a* = green↔red axis. b* = blue↔yellow axis. Distances in L*a*b* correspond to perceived color differences.
          </LearnBox>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="L*" value={lab.L} />
            <Stat label="a*" value={lab.a} />
            <Stat label="b*" value={lab.b} />
          </div>
        </div>
      )}

      {tab === 'gradient' && (
        <div className="space-y-4">
          <LearnBox>
            The <strong>gradient</strong> measures how rapidly the image is changing. Gx = horizontal change, Gy = vertical change. Magnitude = √(Gx² + Gy²). High magnitude = sharp edge. Direction = the angle the edge runs.
          </LearnBox>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Gx (horizontal)" value={grad.gx} />
            <Stat label="Gy (vertical)" value={grad.gy} />
            <Stat label="Magnitude" value={grad.magnitude} highlight />
            <Stat label="Direction" value={`${grad.direction}°`} />
          </div>
        </div>
      )}

      {tab === 'neighbor' && (
        <div className="space-y-4">
          <LearnBox>
            The <strong>3×3 neighborhood</strong> is the pixel and its 8 surrounding pixels. Convolution kernels operate on this patch. The center pixel is the one you clicked.
          </LearnBox>
          <div className="grid max-w-sm grid-cols-3 gap-2 font-mono text-[10px]">
            {neighborhood.flatMap((row, r) => row.map((p, c) => (
              <div key={`${r}-${c}`}
                className={`flex h-20 flex-col items-center justify-center rounded-xl border gap-1 shadow-sm transition-transform hover:scale-105 ${r === 1 && c === 1 ? 'border-brand-400 bg-gradient-to-b from-brand-500/20 to-brand-500/5' : 'border-slate-200/50 bg-white/40 dark:border-white/10 dark:bg-white/5'}`}
              >
                <div className="h-5 w-5 rounded shadow-sm" style={{ background: `rgb(${p.r},${p.g},${p.b})` }} />
                <div className="font-bold text-slate-700 dark:text-slate-200">{Math.round(luminanceAt(image, p.x, p.y))}</div>
                <div className="text-[9px] text-slate-400">({p.x},{p.y})</div>
              </div>
            )))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Experiment Notebook Panel ────────────────────────────────────────────────

function ExperimentNotebookPanel({ entries, setEntries }) {
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')
  const [copied, setCopied] = useState(false)

  function saveAnnotation(id) {
    setEntries(es => es.map(e => e.id === id ? { ...e, annotation: editText } : e))
    setEditId(null)
  }

  function exportNotebook() {
    const text = entries.map(e => {
      const time = new Date(e.at).toLocaleTimeString()
      const lines = [`[${time}] ${e.label}`]
      if (e.annotation) lines.push(`  📝 ${e.annotation}`)
      return lines.join('\n')
    }).join('\n')
    const blob = new Blob([`Image Lab Experiment Notebook\n${'='.repeat(30)}\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'imagelab-notebook.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  async function copyAll() {
    const text = entries.map(e => {
      const time = new Date(e.at).toLocaleTimeString()
      return `[${time}] ${e.label}${e.annotation ? ` — ${e.annotation}` : ''}`
    }).join('\n')
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const TYPE_COLORS = {
    image_load:   'border-green-400/50 bg-gradient-to-r from-green-500/10 to-transparent',
    filter_apply: 'border-violet-400/50 bg-gradient-to-r from-violet-500/10 to-transparent',
    svd_compute:  'border-brand-400/50 bg-gradient-to-r from-brand-500/10 to-transparent',
    fft_compute:  'border-blue-400/50 bg-gradient-to-r from-blue-500/10 to-transparent',
    fft_edit:     'border-blue-400/50 bg-gradient-to-r from-blue-500/10 to-transparent',
    transform:    'border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-transparent',
    edge_detect:  'border-pink-400/50 bg-gradient-to-r from-pink-500/10 to-transparent',
    compress_svd: 'border-teal-400/50 bg-gradient-to-r from-teal-500/10 to-transparent',
    setting:      'border-slate-200/50 bg-white/40 dark:border-white/10 dark:bg-white/5',
    snapshot:     'border-emerald-400/50 bg-gradient-to-r from-emerald-500/10 to-transparent',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={exportNotebook}><FileText className="h-4 w-4" /> Export .txt</Button>
        <Button onClick={copyAll}>{copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />} Copy all</Button>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-slate-500">{entries.length} entries</span>
      </div>

      {entries.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300/50 bg-white/20 p-8 text-center text-sm font-semibold text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          Your experiment notebook is empty. Every action you take (loading images, applying filters, computing SVD, running FFT) is automatically recorded here.
          <br /><br />You can add annotations to any step.
        </div>
      )}

      <div className="space-y-3">
        {entries.map((e, idx) => (
          <div key={e.id} className={`rounded-xl border px-4 py-3 backdrop-blur-sm transition-all hover:shadow-md ${TYPE_COLORS[e.type] ?? 'border-slate-200/50 dark:border-white/10'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                  <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100">{e.label}</span>
                </div>
                {e.annotation && <div className="mt-2 text-[11px] font-semibold italic text-slate-600 dark:text-slate-300">📝 {e.annotation}</div>}
                {editId === e.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={editText}
                      onChange={ev => setEditText(ev.target.value)}
                      onKeyDown={ev => ev.key === 'Enter' && saveAnnotation(e.id)}
                      placeholder="Add annotation…"
                      className="min-w-0 flex-1 rounded-lg border border-brand-400/50 bg-white px-3 py-1.5 text-[11px] font-medium shadow-inner outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-slate-900"
                    />
                    <Button onClick={() => saveAnnotation(e.id)}><Check className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{new Date(e.at).toLocaleTimeString()}</span>
                <button type="button" onClick={() => { setEditId(editId === e.id ? null : e.id); setEditText(e.annotation ?? '') }}
                  className="rounded p-1 text-[11px] text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200">
                  ✏️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bottom Panel dispatcher ──────────────────────────────────────────────────

function BottomPanel({
  activeLab, image, original, bins, inspect, kernel, setKernel, normalize, setNormalize, log, setLog,
  svdState, setSvdState, fftState, setFftState, transformState, setTransformState, edgeState, setEdgeState,
  onTransformed, notebookEntries, setNotebookEntries,
}) {
  const averages = useMemo(() => channelAverages(image), [image])
  const grayMatrix = useMemo(() => toGrayMatrix(image), [image])
  const openMatCells = useMemo(() => buildOpenMatCells(image, averages), [image, averages])

  const openMatSummary = useMemo(() => {
    try {
      const result = runOpenMatScript(`I = ${toOpenMatMatrix(grayMatrix)};\nrows = size(I, 1)\ncols = size(I, 2)\nv = flatten(I)\navg = mean(v)\nlo = min(v)\nhi = max(v)\nspan = hi - lo\n`)
      return result.logs.join('\n')
    } catch { return 'OpenMAT summary unavailable.' }
  }, [grayMatrix])

  const diffMean = useMemo(() => {
    let total = 0
    for (let i = 0; i < image.pixels.length; i += 4) {
      total += Math.abs(original.pixels[i] - image.pixels[i])
      total += Math.abs(original.pixels[i+1] - image.pixels[i+1])
      total += Math.abs(original.pixels[i+2] - image.pixels[i+2])
    }
    return (total / (image.width * image.height * 3)).toFixed(1)
  }, [image, original])

  function addEntry(entry) {
    setNotebookEntries(es => [{ id: `${Date.now()}-${Math.random()}`, at: Date.now(), annotation: '', ...entry }, ...es].slice(0, 200))
  }

  if (activeLab === 'histogram') {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <HistogramBars bins={bins} channel="gray" />
          <div className="grid gap-4 sm:grid-cols-3">
            <HistogramBars bins={bins} channel="r" />
            <HistogramBars bins={bins} channel="g" />
            <HistogramBars bins={bins} channel="b" />
          </div>
        </div>
        <div className="space-y-4">
          <Stat label="Avg luminance" value={averages.gray.toFixed(1)} highlight />
          <Stat label="Difference mean" value={diffMean} />
          <Stat label="Pixels" value={(image.width * image.height).toLocaleString()} />
          <LearnBox>A histogram shows how many pixels exist at each brightness level. A wide, flat histogram = high contrast. A narrow, tall peak = low contrast image.
          </LearnBox>
        </div>
      </div>
    )
  }

  if (activeLab === 'rgb') {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[['Red channel', averages.r, 'bg-red-500'], ['Green channel', averages.g, 'bg-emerald-500'], ['Blue channel', averages.b, 'bg-blue-500']].map(([label, avg, color]) => (
            <div key={label} className="rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">{label}</span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{avg.toFixed(1)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-white/10">
                <div className={`h-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${(avg / 255) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <LearnBox>
          Every pixel in a color image is actually three separate numbers (R, G, B), each ranging 0–255. A color image is three stacked matrices. When G and B are 0, you see only red — try the Channels panel on the left.
        </LearnBox>
      </div>
    )
  }

  if (activeLab === 'matrix') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Stat label="Matrix size" value={`${image.height} × ${image.width} × 4`} highlight />
          <Stat label="Gray sample" value={`${grayMatrix.length} × ${grayMatrix[0]?.length ?? 0}`} />
          <Stat label="Avg luminance" value={averages.gray.toFixed(1)} />
        </div>
        <MatrixPreview image={image} />
        <LearnBox>
          An image is literally a matrix of numbers. Each cell holds a luminance value from 0 (black) to 255 (white). The numbers below are the actual pixel values — notice how they track the colors in the image above.
        </LearnBox>
      </div>
    )
  }

  if (activeLab === 'convolution') {
    return (
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <KernelEditor kernel={kernel} setKernel={setKernel} normalize={normalize} setNormalize={setNormalize}
          setLog={items => { setLog(items); addEntry({ type: 'filter_apply', label: `Applied custom kernel` }) }} />
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-500/10 to-sky-500/5 p-4 shadow-inner backdrop-blur-md">
            <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-800 dark:text-brand-200">Convolution step at inspected pixel</div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] font-semibold">
              {[-1, 0, 1].flatMap(dy => [-1, 0, 1].map(dx => {
                const x = (inspect?.x ?? Math.floor(image.width / 2)) + dx
                const y = (inspect?.y ?? Math.floor(image.height / 2)) + dy
                const lum = luminanceAt(image, x, y)
                const weight = kernel[dy+1][dx+1]
                return (
                  <div key={`${dx}-${dy}`} className={`rounded-lg border p-3 shadow-sm transition-all hover:scale-105 ${dx===0&&dy===0 ? 'border-brand-400 bg-brand-500 text-white shadow-md' : 'border-slate-200/50 bg-white/60 dark:border-white/10 dark:bg-black/40'}`}>
                    <div>{Math.round(lum)} × {weight}</div>
                    <div className={dx===0&&dy===0 ? 'text-brand-100' : 'text-slate-500'}>= {(lum * weight).toFixed(1)}</div>
                  </div>
                )
              }))}
            </div>
          </div>
          <LearnBox>
            Convolution slides the kernel over every pixel. At each location, multiply each kernel value by the corresponding neighbor pixel value, then sum all 9 products. That sum becomes the new pixel value. Center cell highlighted above.
          </LearnBox>
        </div>
      </div>
    )
  }

  if (activeLab === 'pixels') {
    return <PixelInspectorPanel image={image} inspect={inspect} />
  }

  if (activeLab === 'edges') {
    return <EdgeDetectionPanel image={image} edgeState={edgeState} setEdgeState={setEdgeState} addEntry={addEntry} />
  }

  if (activeLab === 'transform') {
    return <TransformLabPanel image={image} transformState={transformState} setTransformState={setTransformState} onTransformed={onTransformed} addEntry={addEntry} />
  }

  if (activeLab === 'svd') {
    return <SVDExplorerPanel image={image} svdState={svdState} setSvdState={setSvdState} addEntry={addEntry} />
  }

  if (activeLab === 'fft') {
    return <FFTLabPanel image={image} fftState={fftState} setFftState={setFftState} addEntry={addEntry} />
  }

  if (activeLab === 'compress') {
    return <CompressionLabPanel image={image} svdState={svdState} setSvdState={setSvdState} addEntry={addEntry} />
  }

  if (activeLab === 'openmat') {
    return (
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">OpenMAT engine summary</div>
          <pre className="whitespace-pre-wrap font-mono text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-200">{openMatSummary}</pre>
        </div>
        <div className="max-h-[520px] overflow-y-auto rounded-xl shadow-lg">
          <OpenMatNotebook params={{ initialCells: openMatCells }} />
        </div>
      </div>
    )
  }

  if (activeLab === 'notebook') {
    return <ExperimentNotebookPanel entries={notebookEntries} setEntries={setNotebookEntries} />
  }

  if (activeLab === 'log') {
    return (
      <div className="space-y-3">
        {log.length === 0 && <div className="text-sm font-semibold text-slate-400">No actions yet.</div>}
        {log.map(item => (
          <div key={`${item.at}-${item.label}`} className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-white/40 px-4 py-3 text-xs font-semibold backdrop-blur-sm transition-all hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
            <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
            <span className="font-mono text-[10px] text-slate-400">{new Date(item.at).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// ─── History Panel ────────────────────────────────────────────────────────────

function HistoryPanel({ history, current, onRestore, onBranch, onSnapshot }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="border-t border-slate-200/50 dark:border-white/10">
      <button type="button" onClick={() => setCollapsed(c => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-100/50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200">
        <span className="flex items-center gap-2"><History className="h-4 w-4" /> History ({history.length})</span>
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {!collapsed && (
        <div className="space-y-2 px-3 pb-3">
          <button type="button" onClick={onSnapshot}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-400/30 bg-brand-500/10 px-3 py-2 text-[11px] font-bold text-brand-700 transition-all hover:bg-brand-500/20 dark:text-brand-400">
            <GitBranch className="h-4 w-4" /> Save snapshot
          </button>
          {history.length === 0 && <div className="px-2 py-2 text-center text-[10px] font-semibold text-slate-400">No snapshots yet. Save one to track your experiments.</div>}
          {history.map((snap, idx) => (
            <div key={snap.id} className={`group rounded-lg border px-3 py-2 transition-all ${idx === current ? 'border-brand-400/50 bg-gradient-to-r from-brand-500/10 to-transparent shadow-md shadow-brand-500/10' : 'border-slate-200/50 bg-white/40 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`truncate text-[11px] font-bold ${idx === current ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>{snap.label}</span>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => onRestore(idx)} title="Restore"
                    className="rounded p-1 text-slate-400 hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-400"><RotateCw className="h-3 w-3" /></button>
                  <button type="button" onClick={() => onBranch(idx)} title="Branch from here"
                    className="rounded p-1 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400"><GitBranch className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="mt-1 font-mono text-[9px] font-semibold text-slate-400">{new Date(snap.at).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImageLab({ onBack, onClose }) {
  const { studioTheme, setStudioTheme, themeStyles } = useGlobalTheme()
  const ui = themeStyles.ui ?? {}
  const close = onBack ?? onClose
  const fileInputRef = useRef(null)

  // Core image state
  const [source, setSource] = useState(() => sampleImage())
  const [settings, setSettings] = useState({ brightness: 0, contrast: 100, gamma: 1, channel: 'rgb' })
  const [kernel, setKernel] = useState(PRESETS.identity.values)
  const [normalize, setNormalize] = useState(false)
  const [kernelEnabled, setKernelEnabled] = useState(false)
  const [viewerMode, setViewerMode] = useState('image')
  const [activeLab, setActiveLab] = useState('pixels')
  const [inspect, setInspect] = useState(null)
  const [log, setLog] = useState(() => [{ label: 'Opened Image Lab with generated sample image', at: Date.now() }])

  // Lab-specific state
  const [svdState, setSvdState] = useState({ data: null, k: 20, computing: false })
  const [fftState, setFftState] = useState({ data: null, mask: null, computing: false, reconstructed: null })
  const [transformState, setTransformState] = useState({ type: 'identity', angle: 0, scale: 1, shear: 0, customMatrix: [[1,0,0],[0,1,0]] })
  const [edgeState, setEdgeState] = useState({ method: 'sobel', overlay: 'edges', edgeImage: null })
  const [notebookEntries, setNotebookEntries] = useState([
    { id: 'init', at: Date.now(), type: 'image_load', label: 'Opened Image Lab — generated sample image loaded', annotation: '' }
  ])

  // History
  const [historyStack, setHistoryStack] = useState([])
  const [currentHistoryIdx, setCurrentHistoryIdx] = useState(-1)

  // Transformed image (separate from adjustments pipeline)
  const [transformedImage, setTransformedImage] = useState(null)

  // Derived
  const adjusted  = useMemo(() => applyAdjustments(source, settings), [source, settings])
  const processed = useMemo(() => {
    const base = kernelEnabled ? applyKernel(adjusted, kernel, normalize) : adjusted
    return base
  }, [adjusted, kernel, kernelEnabled, normalize])
  const bins     = useMemo(() => histogram(processed), [processed])
  const averages = useMemo(() => channelAverages(processed), [processed])

  // Derived: display image for the viewer
  const displayImage = useMemo(() => {
    if (activeLab === 'transform' && transformedImage) return transformedImage
    return processed
  }, [processed, transformedImage, activeLab])

  function addToLog(label) {
    setLog(items => [{ label, at: Date.now() }, ...items].slice(0, 50))
  }

  function addNotebookEntry(entry) {
    setNotebookEntries(es => [{ id: `${Date.now()}-${Math.random()}`, at: Date.now(), annotation: '', ...entry }, ...es].slice(0, 200))
  }

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
    addToLog(`Changed ${key} to ${value}`)
    addNotebookEntry({ type: 'setting', label: `Adjusted ${key} → ${value}` })
  }

  async function handleFile(file) {
    try {
      const image = await readImageFile(file)
      setSource(image)
      setSettings({ brightness: 0, contrast: 100, gamma: 1, channel: 'rgb' })
      setKernelEnabled(false)
      setSvdState({ data: null, k: 20, computing: false })
      setFftState({ data: null, mask: null, computing: false, reconstructed: null })
      setEdgeState({ method: 'sobel', overlay: 'edges', edgeImage: null })
      setTransformedImage(null)
      addToLog(`Loaded ${file.name} as ${image.width}×${image.height} matrix`)
      addNotebookEntry({ type: 'image_load', label: `Loaded image: ${file.name} (${image.width}×${image.height} pixels)` })
    } catch {
      addToLog('Image load failed')
    }
  }

  function resetSample() {
    setSource(sampleImage())
    setSettings({ brightness: 0, contrast: 100, gamma: 1, channel: 'rgb' })
    setKernel(PRESETS.identity.values)
    setKernelEnabled(false)
    setSvdState({ data: null, k: 20, computing: false })
    setFftState({ data: null, mask: null, computing: false, reconstructed: null })
    setEdgeState({ method: 'sobel', overlay: 'edges', edgeImage: null })
    setTransformedImage(null)
    addToLog('Reset to generated sample image')
    addNotebookEntry({ type: 'image_load', label: 'Reset to generated sample image' })
  }

  function applyKernelAction() {
    setKernelEnabled(v => {
      addToLog(`${!v ? 'Enabled' : 'Disabled'} convolution filter`)
      addNotebookEntry({ type: 'filter_apply', label: `${!v ? 'Applied' : 'Removed'} convolution kernel` })
      return !v
    })
  }

  function handleTransformed(img) {
    setTransformedImage(img)
    addToLog(`Applied ${transformState.type} transform`)
    addNotebookEntry({ type: 'transform', label: `Applied affine transform: ${transformState.type}` })
  }

  function saveSnapshot() {
    const label = prompt('Snapshot name:', `State ${historyStack.length + 1} — ${activeLab}`) ?? `State ${historyStack.length + 1}`
    const snap = { id: `${Date.now()}`, at: Date.now(), label, source: copyImageData(source), settings: { ...settings } }
    setHistoryStack(h => [...h, snap])
    setCurrentHistoryIdx(historyStack.length)
    addToLog(`Saved snapshot: ${label}`)
    addNotebookEntry({ type: 'snapshot', label: `Snapshot saved: "${label}"` })
  }

  function restoreSnapshot(idx) {
    const snap = historyStack[idx]
    if (!snap) return
    setSource(snap.source)
    setSettings(snap.settings)
    setCurrentHistoryIdx(idx)
    addToLog(`Restored snapshot: ${snap.label}`)
    addNotebookEntry({ type: 'snapshot', label: `Restored snapshot: "${snap.label}"` })
  }

  function branchFromSnapshot(idx) {
    const snap = historyStack[idx]
    if (!snap) return
    const label = `Branch of "${snap.label}"`
    const newSnap = { id: `${Date.now()}`, at: Date.now(), label, source: copyImageData(snap.source), settings: { ...snap.settings } }
    setHistoryStack(h => [...h, newSnap])
    setSource(snap.source)
    setSettings(snap.settings)
    addToLog(`Branched from snapshot: ${snap.label}`)
    addNotebookEntry({ type: 'snapshot', label: `Branched from snapshot: "${snap.label}"` })
  }

  function exportPng() {
    const canvas = document.createElement('canvas')
    canvas.width = processed.width; canvas.height = processed.height
    const ctx = canvas.getContext('2d')
    const data = ctx.createImageData(processed.width, processed.height)
    data.data.set(processed.pixels)
    ctx.putImageData(data, 0, 0)
    const link = document.createElement('a')
    link.download = 'image-lab-output.png'; link.href = canvas.toDataURL('image/png'); link.click()
    addToLog('Exported processed image as PNG')
    addNotebookEntry({ type: 'image_load', label: 'Exported processed image as PNG' })
  }

  const viewerDisplayImage = activeLab === 'log' ? processed : displayImage

  return (
    <div className={`relative h-full w-full overflow-hidden ${ui.bg0 ?? 'bg-slate-50 dark:bg-slate-950'} ${ui.txt1 ?? 'text-slate-900 dark:text-slate-100'}`}>
      
      {/* Ambient glowing background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[40%] rounded-full bg-sky-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[60%] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* ── Header ── */}
        <header className={`flex h-14 shrink-0 items-center gap-4 border-b px-4 shadow-sm backdrop-blur-xl ${ui.border ?? 'border-slate-200/50 dark:border-white/10'} ${ui.bg1 ?? 'bg-white/70 dark:bg-slate-900/70'}`}>
          {close && <Button onClick={close} className="shrink-0 shadow-md">Labs</Button>}
          <div className="flex items-center gap-2 font-black tracking-widest">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-sky-600 text-white shadow-lg shadow-brand-500/30">
              <FileImage className="h-4 w-4" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400">IMAGE LAB</span>
          </div>
          <div className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 md:block">Image = Matrix · Learn with Every Pixel</div>
          <div className="min-w-0 flex-1" />
          <select
            value={studioTheme}
            onChange={e => setStudioTheme(e.target.value)}
            className="hidden h-9 rounded-lg border border-slate-200/50 bg-white/60 px-3 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-slate-200 sm:block"
            title="Theme"
          >
            {Object.entries(STUDIO_THEMES).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}
          </select>
          <IconButton title="Upload image" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /></IconButton>
          <IconButton title="Export PNG" onClick={exportPng}><Download className="h-4 w-4" /></IconButton>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''
          }} />
        </header>

        {/* ── Body ── */}
        <div className="flex min-h-0 flex-1">

          {/* ── Left Sidebar ── */}
          <aside className={`hidden w-60 shrink-0 flex-col overflow-y-auto border-r lg:flex z-10 backdrop-blur-xl ${ui.border ?? 'border-slate-200/50 dark:border-white/10'} ${ui.bg1 ?? 'bg-white/70 dark:bg-slate-900/70'}`}>
            <div className="border-b border-slate-200/50 p-4 dark:border-white/10">
              <SectionHeader icon={PanelLeft} label="Explorer" />
              <div className="space-y-1">
                {['Images', 'Layers', 'Results'].map((item, i) => (
                  <button key={item} type="button" className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-all hover:bg-white/80 hover:shadow-sm dark:text-slate-300 dark:hover:bg-white/10">
                    <span>{item}</span>
                    <span className="font-mono text-[10px] text-slate-400">{i === 0 ? '1' : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5 border-b border-slate-200/50 p-4 dark:border-white/10">
              <div>
                <SectionHeader icon={Eye} label="View" />
                <div className="grid grid-cols-3 gap-1.5">
                  {['image', 'matrix', 'split'].map(mode => (
                    <Button key={mode} active={viewerMode === mode} onClick={() => setViewerMode(mode)} className="px-1 capitalize">{mode}</Button>
                  ))}
                </div>
              </div>
              <div>
                <SectionHeader icon={Layers} label="Channels" />
                <div className="grid grid-cols-2 gap-2">
                  {[['rgb','RGB'],['gray','Gray'],['red','Red'],['green','Green'],['blue','Blue']].map(([id, label]) => (
                    <Button key={id} active={settings.channel === id} onClick={() => updateSetting('channel', id)}>{label}</Button>
                  ))}
                </div>
              </div>
              <Button onClick={resetSample} className="w-full shadow-sm"><Sparkles className="h-4 w-4" /> Sample</Button>
            </div>

            <HistoryPanel
              history={historyStack}
              current={currentHistoryIdx}
              onRestore={restoreSnapshot}
              onBranch={branchFromSnapshot}
              onSnapshot={saveSnapshot}
            />
          </aside>

          {/* ── Main ── */}
          <main className="flex min-w-0 flex-1 flex-col relative z-0">
            <div className="flex min-h-0 flex-1 relative">

              {/* ── Image Viewer ── */}
              <section className="flex min-w-0 flex-1 flex-col relative">
                {viewerMode === 'matrix' ? (
                  <div className="h-full overflow-auto p-6"><MatrixPreview image={processed} /></div>
                ) : viewerMode === 'split' ? (
                  <div className="grid h-full min-h-0 grid-rows-2">
                    <CanvasView image={viewerDisplayImage} original={source} mode="image" inspect={inspect} onInspect={setInspect} />
                    <div className="overflow-auto border-t border-slate-200/50 p-4 dark:border-white/10"><MatrixPreview image={processed} /></div>
                  </div>
                ) : (
                  <CanvasView
                    image={viewerDisplayImage}
                    original={source}
                    mode={activeLab === 'log' ? 'difference' : 'image'}
                    inspect={inspect}
                    onInspect={setInspect}
                  />
                )}
              </section>

              {/* ── Right Sidebar (Properties) ── */}
              <aside className={`hidden w-80 shrink-0 flex-col overflow-y-auto border-l p-4 xl:flex z-10 backdrop-blur-xl shadow-[-10px_0_20px_rgba(0,0,0,0.02)] ${ui.border ?? 'border-slate-200/50 dark:border-white/10'} ${ui.bg1 ?? 'bg-white/70 dark:bg-slate-900/70'}`}>
                <SectionHeader icon={SlidersHorizontal} label="Properties" />
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Width"  value={processed.width} />
                  <Stat label="Height" value={processed.height} />
                  <Stat label="Channels" value="RGBA" />
                  <Stat label="Matrix" value={`${processed.height}×${processed.width}`} />
                </div>

                {inspect && (
                  <div className="mt-4 rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md transition-all dark:border-white/10 dark:bg-white/5">
                    <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">Hovered Pixel</div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg border-2 border-white shadow-md dark:border-white/20" style={{ background: `rgb(${inspect.r},${inspect.g},${inspect.b})` }} />
                      <span className="font-mono text-[12px] font-bold text-slate-800 dark:text-white">({inspect.x},{inspect.y})</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px] font-semibold">
                      <span className="text-red-500">R {inspect.r}</span>
                      <span className="text-green-500">G {inspect.g}</span>
                      <span className="text-blue-500">B {inspect.b}</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <Range label="Brightness" value={settings.brightness} min={-90} max={90}   onChange={v => updateSetting('brightness', v)} />
                  <Range label="Contrast"   value={settings.contrast}   min={30}  max={220}  onChange={v => updateSetting('contrast', v)} suffix="%" />
                  <Range label="Gamma"      value={settings.gamma}      min={0.3} max={2.6} step={0.1} onChange={v => updateSetting('gamma', v)} />
                </div>

                <div className="mt-6 rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                  <div className="mb-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <span>Filter kernel</span>
                    <button type="button" onClick={applyKernelAction} className="text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400">
                      {kernelEnabled ? 'On ✓' : 'Off'}
                    </button>
                  </div>
                  <KernelEditor kernel={kernel} setKernel={setKernel} normalize={normalize} setNormalize={setNormalize} setLog={setLog} />
                </div>

                <div className="mt-6 space-y-3">
                  <SectionHeader label="Stats" />
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Avg R" value={averages.r.toFixed(0)} />
                    <Stat label="Avg G" value={averages.g.toFixed(0)} />
                    <Stat label="Avg B" value={averages.b.toFixed(0)} />
                    <Stat label="Avg Lum" value={averages.gray.toFixed(0)} highlight />
                  </div>
                </div>
              </aside>
            </div>

            {/* ── Bottom Panel (Lab Tabs) ── */}
            <footer className={`shrink-0 border-t z-20 backdrop-blur-xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)] ${ui.border ?? 'border-slate-200/50 dark:border-white/10'} ${ui.bg1 ?? 'bg-white/80 dark:bg-slate-900/80'}`}>
              <div className="flex flex-wrap gap-2 border-b border-slate-200/50 px-4 py-3 dark:border-white/10">
                {LABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id} type="button"
                    onClick={() => setActiveLab(id)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold transition-all duration-300 ${
                      activeLab === id
                        ? 'bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-lg shadow-brand-500/40 scale-105'
                        : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="max-h-80 overflow-y-auto p-5 custom-scrollbar">
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
                  svdState={svdState}
                  setSvdState={setSvdState}
                  fftState={fftState}
                  setFftState={setFftState}
                  transformState={transformState}
                  setTransformState={setTransformState}
                  edgeState={edgeState}
                  setEdgeState={setEdgeState}
                  onTransformed={handleTransformed}
                  notebookEntries={notebookEntries}
                  setNotebookEntries={setNotebookEntries}
                />
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* Hidden element to prevent tree-shaking of used but visually-suppressed icons */}
      <div className="hidden">
        <ImageIcon /><Maximize2 /><FlipHorizontal2 /><FlipVertical2 />
        <Check /><Copy /><FileText /><GitBranch />
        {averages.gray > 0 && null}
      </div>
    </div>
  )
}
