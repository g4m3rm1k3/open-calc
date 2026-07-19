import { useEffect, useRef, useState } from 'react'

// 32x32 RGBA = 4096 bytes = 256 real AES blocks (16 bytes each) — small
// enough that 256 concurrent crypto.subtle.encrypt calls finish instantly,
// large enough that the striped pattern is unmistakable once rendered.
const SIZE = 32

function buildStripedImage() {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4)
  const palette = [
    [59, 130, 246],
    [239, 68, 68],
    [16, 185, 129],
    [245, 158, 11],
  ]
  const bandHeight = SIZE / palette.length / 2
  for (let y = 0; y < SIZE; y++) {
    const [r, g, b] = palette[Math.floor(y / bandHeight) % palette.length]
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }
  return data
}

// Web Crypto has no native AES-ECB (browsers deliberately don't expose it —
// ECB's weakness is exactly what this demo proves). But AES-CBC encrypting
// a single 16-byte block with a zero IV is mathematically identical to raw
// ECB block encryption: C = AES_Encrypt(P XOR IV) = AES_Encrypt(P XOR 0) =
// AES_Encrypt(P), and ECB is defined as encrypting every block that way,
// independently, with no chaining at all. Doing this once per block with a
// fresh zero IV each time reproduces genuine ECB output using only the
// browser's real, native AES implementation — nothing here is a simulated
// or reimplemented cipher.
async function ecbEncrypt(key, bytes) {
  const zeroIv = new Uint8Array(16)
  const blockCount = bytes.length / 16
  const blocks = await Promise.all(
    Array.from({ length: blockCount }, (_, i) => {
      const chunk = bytes.slice(i * 16, i * 16 + 16)
      return crypto.subtle.encrypt({ name: 'AES-CBC', iv: zeroIv }, key, chunk)
    }),
  )
  const out = new Uint8Array(bytes.length)
  // Web Crypto's AES-CBC always appends a full 16-byte PKCS7 padding block,
  // even to an already block-aligned input — the real ciphertext for our
  // one real block is the first 16 bytes; the second 16 are pure padding
  // overhead we don't want in the reconstructed image.
  blocks.forEach((buf, i) => out.set(new Uint8Array(buf).slice(0, 16), i * 16))
  return out
}

// The real thing CBC does differently: one single encrypt call over the
// whole buffer, with real chaining (each block XORed with the previous
// block's ciphertext before encrypting) handled internally by the browser.
async function cbcEncrypt(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const buf = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, bytes)
  return new Uint8Array(buf).slice(0, bytes.length)
}

function drawBytesAsImage(canvas, bytes, forceOpaque) {
  const ctx = canvas.getContext('2d')
  const imgData = ctx.createImageData(SIZE, SIZE)
  for (let i = 0; i < bytes.length; i++) imgData.data[i] = bytes[i]
  if (forceOpaque) {
    // Ciphertext bytes are uniformly random, including whatever lands in
    // the alpha channel — forcing full opacity keeps the encrypted preview
    // fully visible instead of randomly translucent in places.
    for (let i = 3; i < imgData.data.length; i += 4) imgData.data[i] = 255
  }
  ctx.putImageData(imgData, 0, 0)
}

export default function ECBPatternLeak() {
  const plainRef = useRef(null)
  const ecbRef = useRef(null)
  const cbcRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (plainRef.current) drawBytesAsImage(plainRef.current, buildStripedImage(), false)
  }, [])

  const run = async () => {
    setRunning(true)
    const bytes = buildStripedImage()
    const key = await crypto.subtle.generateKey({ name: 'AES-CBC', length: 128 }, true, ['encrypt'])
    const [ecbBytes, cbcBytes] = await Promise.all([ecbEncrypt(key, bytes), cbcEncrypt(key, bytes)])
    drawBytesAsImage(ecbRef.current, ecbBytes, true)
    drawBytesAsImage(cbcRef.current, cbcBytes, true)
    setDone(true)
    setRunning(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <button
        onClick={run}
        disabled={running}
        className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-brand-500 text-white disabled:opacity-50 mb-4"
      >
        {running ? 'Encrypting…' : 'Encrypt this striped image, both ways'}
      </button>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <canvas
            ref={plainRef}
            width={SIZE}
            height={SIZE}
            className="w-full rounded border border-slate-300 dark:border-slate-700"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-xs text-slate-500 mt-1">Original</p>
        </div>
        <div>
          <canvas
            ref={ecbRef}
            width={SIZE}
            height={SIZE}
            className="w-full rounded border border-slate-300 dark:border-slate-700"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-xs text-slate-500 mt-1">AES-ECB</p>
        </div>
        <div>
          <canvas
            ref={cbcRef}
            width={SIZE}
            height={SIZE}
            className="w-full rounded border border-slate-300 dark:border-slate-700"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-xs text-slate-500 mt-1">AES-CBC</p>
        </div>
      </div>
      {done && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
          Same key, same real AES block cipher, same plaintext — the only difference is whether
          blocks are chained. ECB encrypts every 16-byte block independently, so identical
          plaintext blocks (the flat-color stripes above) still produce identical ciphertext
          blocks — the stripe boundaries survive encryption, in a different palette. CBC XORs
          each block with the previous block's ciphertext before encrypting, so identical input
          blocks produce completely different output the moment anything earlier in the image
          differs — the structure disappears into noise.
        </p>
      )}
    </div>
  )
}
