import { describe, it, expect } from 'vitest'
import {
  clamp, makeImageData, histogram, applyKernel, computePSNR, rgbToHsv, rgbToLab,
  sampleImage, computeImageSVD, reconstructFromSVD, svdToImage, getTransformMatrix,
  applyAffineTransform, PRESETS,
} from './imageMath.js'

describe('clamp', () => {
  it('clamps below the low bound', () => { expect(clamp(-10)).toBe(0) })
  it('clamps above the high bound', () => { expect(clamp(300)).toBe(255) })
  it('passes through in-range values', () => { expect(clamp(128)).toBe(128) })
})

describe('histogram', () => {
  it('bins sum to the pixel count for every channel', () => {
    const img = sampleImage()
    const bins = histogram(img)
    const pixelCount = img.width * img.height
    expect(bins.reduce((s, b) => s + b.gray, 0)).toBe(pixelCount)
    expect(bins.reduce((s, b) => s + b.r, 0)).toBe(pixelCount)
    expect(bins.reduce((s, b) => s + b.g, 0)).toBe(pixelCount)
    expect(bins.reduce((s, b) => s + b.b, 0)).toBe(pixelCount)
  })
})

describe('applyKernel', () => {
  it('identity kernel is a no-op', () => {
    const img = sampleImage()
    const out = applyKernel(img, PRESETS.identity.values, false)
    // Interior pixels (not affected by edge-clamping) should be unchanged.
    for (let i = img.width * 4 + 4; i < img.pixels.length - img.width * 4 - 4; i++) {
      expect(out.pixels[i]).toBe(img.pixels[i])
    }
  })
})

describe('computePSNR', () => {
  it('is Infinity for identical images', () => {
    const flat = new Float32Array([1, 2, 3, 4])
    expect(computePSNR(flat, flat, 2, 2)).toBe(Infinity)
  })
  it('is finite and decreases as error grows', () => {
    const ref = new Float32Array([100, 100, 100, 100])
    const smallErr = new Float32Array([101, 100, 100, 100])
    const bigErr = new Float32Array([150, 100, 100, 100])
    const psnrSmall = computePSNR(ref, smallErr, 2, 2)
    const psnrBig = computePSNR(ref, bigErr, 2, 2)
    expect(psnrSmall).toBeGreaterThan(psnrBig)
  })
})

describe('rgbToHsv', () => {
  it('pure red is hue 0, full saturation, full value', () => {
    const hsv = rgbToHsv(255, 0, 0)
    expect(hsv.h).toBe(0)
    expect(hsv.s).toBe(100)
    expect(hsv.v).toBe(100)
  })
  it('gray has zero saturation', () => {
    const hsv = rgbToHsv(128, 128, 128)
    expect(hsv.s).toBe(0)
  })
})

describe('rgbToLab', () => {
  it('white maps to L*=100, a*=0, b*=0', () => {
    const lab = rgbToLab(255, 255, 255)
    expect(lab.L).toBe(100)
    expect(Math.abs(lab.a)).toBeLessThanOrEqual(1)
    expect(Math.abs(lab.b)).toBeLessThanOrEqual(1)
  })
  it('black maps to L*=0', () => {
    const lab = rgbToLab(0, 0, 0)
    expect(lab.L).toBe(0)
  })
})

describe('SVD reconstruct round trip', () => {
  it('full-rank reconstruction stays close to the source image', () => {
    const img = sampleImage()
    const { U, V, sigmas, w, h, gray } = computeImageSVD(img)
    const fullK = sigmas.length
    const flat = reconstructFromSVD(U, V, sigmas, fullK, w, h)
    const recon = svdToImage(flat, w, h)
    let maxDiff = 0
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const diff = Math.abs(gray[r][c] - recon.pixels[(r * w + c) * 4])
        if (diff > maxDiff) maxDiff = diff
      }
    }
    // Full-rank SVD should reconstruct the (already-quantized-to-8-bit) source almost exactly.
    expect(maxDiff).toBeLessThan(3)
  })

  it('rank-1 reconstruction captures less energy than full rank (lossy)', () => {
    const img = sampleImage()
    const { U, V, sigmas, w, h, gray } = computeImageSVD(img)
    const rank1 = svdToImage(reconstructFromSVD(U, V, sigmas, 1, w, h), w, h)
    const full = svdToImage(reconstructFromSVD(U, V, sigmas, sigmas.length, w, h), w, h)
    const origFlat = new Float32Array(w * h)
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) origFlat[r * w + c] = gray[r][c]
    const rank1Flat = new Float32Array(w * h)
    const fullFlat = new Float32Array(w * h)
    for (let i = 0; i < w * h; i++) { rank1Flat[i] = rank1.pixels[i * 4]; fullFlat[i] = full.pixels[i * 4] }
    const psnrRank1 = computePSNR(origFlat, rank1Flat, w, h)
    const psnrFull = computePSNR(origFlat, fullFlat, w, h)
    expect(psnrFull).toBeGreaterThan(psnrRank1)
  })
})

describe('affine transforms', () => {
  it('identity transform matrix is the identity', () => {
    expect(getTransformMatrix('identity', {})).toEqual([[1, 0, 0], [0, 1, 0]])
  })

  it('applyAffineTransform with identity matrix returns an image the same size as the source', () => {
    const img = sampleImage()
    const out = applyAffineTransform(img, getTransformMatrix('identity', {}))
    expect(out.width).toBe(img.width)
    expect(out.height).toBe(img.height)
  })

  it('out-of-bounds pixels after a shift render a valid checkerboard (not NaN/undefined)', () => {
    // A large translation pushes every source pixel out of bounds, so every
    // output pixel takes the checkerboard branch — this is exactly the path
    // that had the `x\8` typo (invalid JS) in the original WIP file.
    const img = makeImageData(4, 4, new Uint8ClampedArray(4 * 4 * 4).fill(200))
    const out = applyAffineTransform(img, [[1, 0, 1000], [0, 1, 1000]])
    for (const v of out.pixels) expect(Number.isFinite(v)).toBe(true)
  })
})
