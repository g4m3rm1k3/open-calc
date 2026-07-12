import { useMemo } from 'react'
import { Activity, RefreshCw, RotateCw } from 'lucide-react'
import { Button, LearnBox, Stat } from '../atoms.jsx'
import { applyFFTMaskAndInvert, computeFFTData, FFT_N } from '../imageMath.js'
import type { FftState, ImgData } from '../types.js'

interface FftPanelProps {
  image: ImgData
  fftState: FftState
  setFftState: (fn: (prev: FftState) => FftState) => void
  addEntry: (entry: { type: string; label: string }) => void
}

export function FftPanel({ image, fftState, setFftState, addEntry }: FftPanelProps) {
  const { computing } = fftState

  function compute() {
    setFftState((s) => ({ ...s, computing: true }))
    setTimeout(() => {
      const fftData = computeFFTData(image)
      const N = fftData.N
      const initMask = new Uint8Array(N * N).fill(1)
      setFftState(() => ({ data: fftData, mask: initMask, computing: false, reconstructed: null }))
      addEntry({ type: 'fft_compute', label: `Computed 2D FFT (${N}×${N} grid)` })
    }, 50)
  }

  function toggleCell(r: number, c: number) {
    setFftState((s) => {
      if (!s.mask || !s.data) return s
      const m = new Uint8Array(s.mask)
      const N = s.data.N
      m[r * N + c] = m[r * N + c] ? 0 : 1
      return { ...s, mask: m }
    })
  }

  function resetMask() {
    setFftState((s) => (s.data ? { ...s, mask: new Uint8Array(s.data.N * s.data.N).fill(1), reconstructed: null } : s))
  }

  function runIFFT() {
    if (!fftState.data || !fftState.mask) return
    const img = applyFFTMaskAndInvert(fftState.data, fftState.mask)
    setFftState((s) => ({ ...s, reconstructed: img }))
    const zeroed = fftState.mask.filter((v) => !v).length
    addEntry({ type: 'fft_edit', label: `Inverse FFT with ${zeroed} frequencies zeroed` })
  }

  const N = fftState.data?.N ?? FFT_N
  const logMag = useMemo(() => {
    if (!fftState.data) return null
    const { mag } = fftState.data
    const logVals = Array.from(mag, (v) => Math.log1p(v))
    const maxVal = Math.max(...logVals, 1)
    return logVals.map((v) => v / maxVal)
  }, [fftState.data])

  const zeroed = fftState.mask ? fftState.mask.filter((v) => !v).length : 0

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
                    title={`(${r},${c}) magnitude=${fftState.data!.mag[i].toFixed(1)} ${kept ? '✓' : '✗ erased'}`}
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
                    ref={(el) => {
                      if (!el || !fftState.reconstructed) return
                      const ctx = el.getContext('2d')
                      if (!ctx) return
                      const id = ctx.createImageData(fftState.reconstructed.width, fftState.reconstructed.height)
                      id.data.set(fftState.reconstructed.pixels)
                      ctx.putImageData(id, 0, 0)
                    }}
                    className="mx-auto block max-w-md"
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
