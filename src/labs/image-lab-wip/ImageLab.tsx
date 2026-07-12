import { useMemo, useRef, useState } from 'react'
import { Download, FileImage, Upload } from 'lucide-react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { STUDIO_THEMES } from '../../utils/studioThemes.js'
import { runOpenMatScript } from '../../engines/openmat/openmatEngine.js'
import OpenMatNotebook from '../../components/notebooks/OpenMatNotebook.jsx'
import { IconButton } from './atoms.jsx'
import { CanvasView, HistogramBars, MatrixPreview } from './CanvasView.jsx'
import { MenuBar } from './MenuBar.jsx'
import {
  applyAdjustments, applyKernel, buildOpenMatCells, channelAverages, copyImageData,
  histogram, luminanceAt, PRESETS, readImageFile, sampleImage, toGrayMatrix, toOpenMatMatrix,
} from './imageMath.js'
import { KernelPanel } from './panels/KernelPanel.jsx'
import { SvdPanel } from './panels/SvdPanel.jsx'
import { TransformPanel } from './panels/TransformPanel.jsx'
import { EdgePanel } from './panels/EdgePanel.jsx'
import { FftPanel } from './panels/FftPanel.jsx'
import { CompressionPanel } from './panels/CompressionPanel.jsx'
import { PixelInspectorPanel } from './panels/PixelInspectorPanel.jsx'
import { NotebookPanel } from './panels/NotebookPanel.jsx'
import { HistoryPanel } from './panels/HistoryPanel.jsx'
import type {
  ActiveTool, EdgeState, FftState, HistorySnapshot, ImgData, Inspect,
  LogItem, NotebookEntry, Settings, SvdState, TransformState, ViewerMode,
} from './types.js'

interface ImageLabProps {
  onBack?: () => void
  onClose?: () => void
}

const TOOL_LABELS: Record<string, string> = {
  kernel: 'Filter Kernel', pixels: 'Pixel Inspector', histogram: 'Histogram', rgb: 'RGB Channels',
  matrix: 'Matrix View', edges: 'Edge Detection', transform: 'Affine Transform', svd: 'SVD Explorer',
  fft: '2D FFT', compress: 'Compression Lab', openmat: 'OpenMAT Console', notebook: 'Experiment Notebook',
  log: 'Action Log', history: 'Snapshots / History',
}

export default function ImageLab({ onBack, onClose }: ImageLabProps) {
  const { studioTheme, setStudioTheme, themeStyles } = useGlobalTheme()
  const ui = themeStyles.ui ?? {}
  const close = onBack ?? onClose
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [source, setSource] = useState<ImgData>(() => sampleImage())
  const [settings, setSettings] = useState<Settings>({ brightness: 0, contrast: 100, gamma: 1, channel: 'rgb' })
  const [kernel, setKernel] = useState(PRESETS.identity.values)
  const [normalize, setNormalize] = useState(false)
  const [kernelEnabled, setKernelEnabled] = useState(false)
  const [viewerMode, setViewerMode] = useState<ViewerMode>('image')
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)
  const [inspect, setInspect] = useState<Inspect | null>(null)
  const [log, setLog] = useState<LogItem[]>(() => [{ label: 'Opened Image Lab with generated sample image', at: Date.now() }])

  const [svdState, setSvdState] = useState<SvdState>({ data: null, k: 20, computing: false })
  const [fftState, setFftState] = useState<FftState>({ data: null, mask: null, computing: false, reconstructed: null })
  const [transformState, setTransformState] = useState<TransformState>({ type: 'identity', angle: 0, scale: 1, shear: 0, customMatrix: [[1, 0, 0], [0, 1, 0]] })
  const [edgeState, setEdgeState] = useState<EdgeState>({ method: 'sobel', overlay: 'edges', edgeImage: null })
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([
    { id: 'init', at: Date.now(), type: 'image_load', label: 'Opened Image Lab — generated sample image loaded', annotation: '' },
  ])

  const [historyStack, setHistoryStack] = useState<HistorySnapshot[]>([])
  const [currentHistoryIdx, setCurrentHistoryIdx] = useState(-1)
  const [transformedImage, setTransformedImage] = useState<ImgData | null>(null)

  const adjusted = useMemo(() => applyAdjustments(source, settings), [source, settings])
  const processed = useMemo(() => (kernelEnabled ? applyKernel(adjusted, kernel, normalize) : adjusted), [adjusted, kernel, kernelEnabled, normalize])
  const bins = useMemo(() => histogram(processed), [processed])
  const averages = useMemo(() => channelAverages(processed), [processed])
  const grayMatrix = useMemo(() => toGrayMatrix(processed), [processed])

  const displayImage = useMemo(() => (activeTool === 'transform' && transformedImage ? transformedImage : processed), [processed, transformedImage, activeTool])

  function addToLog(label: string) {
    setLog((items) => [{ label, at: Date.now() }, ...items].slice(0, 50))
  }
  function addEntry(entry: { type: string; label: string }) {
    setNotebookEntries((es) => [{ id: `${Date.now()}-${Math.random()}`, at: Date.now(), annotation: '', ...entry }, ...es].slice(0, 200))
  }
  function updateSetting(key: keyof Settings, value: Settings[keyof Settings]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    addToLog(`Changed ${key} to ${value}`)
    addEntry({ type: 'setting', label: `Adjusted ${key} → ${value}` })
  }

  async function handleFile(file: File) {
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
      addEntry({ type: 'image_load', label: `Loaded image: ${file.name} (${image.width}×${image.height} pixels)` })
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
    addEntry({ type: 'image_load', label: 'Reset to generated sample image' })
  }

  function toggleKernel() {
    setKernelEnabled((v) => {
      addToLog(`${!v ? 'Enabled' : 'Disabled'} convolution filter`)
      addEntry({ type: 'filter_apply', label: `${!v ? 'Applied' : 'Removed'} convolution kernel` })
      return !v
    })
  }

  function handleTransformed(img: ImgData) {
    setTransformedImage(img)
    addToLog(`Applied ${transformState.type} transform`)
    addEntry({ type: 'transform', label: `Applied affine transform: ${transformState.type}` })
  }

  function saveSnapshot() {
    const label = prompt('Snapshot name:', `State ${historyStack.length + 1}`) ?? `State ${historyStack.length + 1}`
    const snap: HistorySnapshot = { id: `${Date.now()}`, at: Date.now(), label, source: copyImageData(source), settings: { ...settings } }
    setHistoryStack((h) => [...h, snap])
    setCurrentHistoryIdx(historyStack.length)
    addToLog(`Saved snapshot: ${label}`)
    addEntry({ type: 'snapshot', label: `Snapshot saved: "${label}"` })
  }

  function restoreSnapshot(idx: number) {
    const snap = historyStack[idx]
    if (!snap) return
    setSource(snap.source)
    setSettings(snap.settings)
    setCurrentHistoryIdx(idx)
    addToLog(`Restored snapshot: ${snap.label}`)
    addEntry({ type: 'snapshot', label: `Restored snapshot: "${snap.label}"` })
  }

  function branchFromSnapshot(idx: number) {
    const snap = historyStack[idx]
    if (!snap) return
    const label = `Branch of "${snap.label}"`
    const newSnap: HistorySnapshot = { id: `${Date.now()}`, at: Date.now(), label, source: copyImageData(snap.source), settings: { ...snap.settings } }
    setHistoryStack((h) => [...h, newSnap])
    setSource(snap.source)
    setSettings(snap.settings)
    addToLog(`Branched from snapshot: ${snap.label}`)
    addEntry({ type: 'snapshot', label: `Branched from snapshot: "${snap.label}"` })
  }

  function exportPng() {
    const canvas = document.createElement('canvas')
    canvas.width = processed.width; canvas.height = processed.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const data = ctx.createImageData(processed.width, processed.height)
    data.data.set(processed.pixels)
    ctx.putImageData(data, 0, 0)
    const link = document.createElement('a')
    link.download = 'image-lab-output.png'; link.href = canvas.toDataURL('image/png'); link.click()
    addToLog('Exported processed image as PNG')
    addEntry({ type: 'image_load', label: 'Exported processed image as PNG' })
  }

  const openMatCells = useMemo(() => buildOpenMatCells(processed, averages), [processed, averages])
  const openMatSummary = useMemo(() => {
    try {
      const result = runOpenMatScript(`I = ${toOpenMatMatrix(grayMatrix)};\nrows = size(I, 1)\ncols = size(I, 2)\nv = flatten(I)\navg = mean(v)\nlo = min(v)\nhi = max(v)\nspan = hi - lo\n`)
      return result.logs.join('\n')
    } catch { return 'OpenMAT summary unavailable.' }
  }, [grayMatrix])

  const viewerDisplayImage = activeTool === 'log' ? processed : displayImage

  return (
    <div className={`relative h-full w-full overflow-hidden ${ui.bg0 ?? 'bg-slate-50 dark:bg-slate-950'} ${ui.txt1 ?? 'text-slate-900 dark:text-slate-100'}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[40%] rounded-full bg-sky-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[60%] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <header className={`flex h-14 shrink-0 items-center gap-3 border-b px-4 shadow-sm backdrop-blur-xl ${ui.border ?? 'border-slate-200/50 dark:border-white/10'} ${ui.bg1 ?? 'bg-white/70 dark:bg-slate-900/70'}`}>
          {close && (
            <button onClick={close} className="shrink-0 rounded-lg border border-slate-200/50 bg-white/40 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Labs
            </button>
          )}
          <div className="flex items-center gap-2 font-black tracking-widest">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-sky-600 text-white shadow-lg shadow-brand-500/30">
              <FileImage className="h-4 w-4" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400">IMAGE LAB</span>
          </div>

          <MenuBar
            settings={settings}
            updateSetting={updateSetting}
            viewerMode={viewerMode}
            setViewerMode={setViewerMode}
            kernelEnabled={kernelEnabled}
            onToggleKernel={toggleKernel}
            onOpenTool={setActiveTool}
            onUploadClick={() => fileInputRef.current?.click()}
            onExport={exportPng}
            onResetSample={resetSample}
          />

          <div className="min-w-0 flex-1" />
          <select
            value={studioTheme}
            onChange={(e) => setStudioTheme(e.target.value)}
            className="hidden h-9 rounded-lg border border-slate-200/50 bg-white/60 px-3 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-slate-200 sm:block"
            title="Theme"
          >
            {Object.entries(STUDIO_THEMES).map(([id, t]: [string, any]) => <option key={id} value={id}>{t.name}</option>)}
          </select>
          <IconButton title="Upload image" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /></IconButton>
          <IconButton title="Export PNG" onClick={exportPng}><Download className="h-4 w-4" /></IconButton>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''
          }} />
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1">
            {viewerMode === 'matrix' ? (
              // flex-1 + w-full: this sits in a row-direction flex parent, so
              // without an explicit grow/width it shrinks to content size
              // instead of claiming the row — same bug the split view's
              // matrix half had below.
              <div className="h-full w-full min-h-0 min-w-0 flex-1 overflow-auto p-6"><MatrixPreview image={processed} /></div>
            ) : viewerMode === 'split' ? (
              // This grid container is itself a child of a row-direction flex
              // parent — same missing-grow bug as the matrix wrapper above,
              // just one level further out: without flex-1/w-full here, the
              // whole split view (both halves) shrinks to content width.
              <div className="grid h-full w-full min-h-0 min-w-0 flex-1 grid-rows-2">
                <CanvasView image={viewerDisplayImage} original={source} mode="image" inspect={inspect} onInspect={setInspect} />
                <div className="h-full w-full min-h-0 min-w-0 overflow-auto border-t border-slate-200/50 p-4 dark:border-white/10"><MatrixPreview image={processed} /></div>
              </div>
            ) : (
              <CanvasView
                image={viewerDisplayImage}
                original={source}
                mode={activeTool === 'log' ? 'difference' : 'image'}
                inspect={inspect}
                onInspect={setInspect}
              />
            )}

            <div className="pointer-events-none absolute bottom-3 right-3 flex gap-2">
              {[['W', processed.width], ['H', processed.height], ['Matrix', `${processed.height}×${processed.width}`]].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-slate-200/60 bg-white/80 px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-300">
                  {label}: {val}
                </div>
              ))}
            </div>
          </div>

          {activeTool && (
            <div className={`flex max-h-[46%] shrink-0 flex-col border-t backdrop-blur-xl shadow-[0_-10px_20px_rgba(0,0,0,0.04)] ${ui.border ?? 'border-slate-200/50 dark:border-white/10'} ${ui.bg1 ?? 'bg-white/90 dark:bg-slate-900/90'}`}>
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200/50 px-4 py-2 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{TOOL_LABELS[activeTool]}</span>
                <button onClick={() => setActiveTool(null)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200" title="Close">✕</button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {activeTool === 'kernel' && (
                  <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    <KernelPanel kernel={kernel} setKernel={setKernel} normalize={normalize} setNormalize={setNormalize}
                      setLog={(fn) => { setLog(fn); addEntry({ type: 'filter_apply', label: 'Applied custom kernel' }) }} />
                    <div className="space-y-4">
                      <div className="rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-500/10 to-sky-500/5 p-4 shadow-inner backdrop-blur-md">
                        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-800 dark:text-brand-200">Convolution step at inspected pixel</div>
                        <div className="grid grid-cols-3 gap-2 font-mono text-[10px] font-semibold">
                          {[-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => {
                            const x = (inspect?.x ?? Math.floor(processed.width / 2)) + dx
                            const y = (inspect?.y ?? Math.floor(processed.height / 2)) + dy
                            const lum = luminanceAt(processed, x, y)
                            const weight = kernel[dy + 1][dx + 1]
                            return (
                              <div key={`${dx}-${dy}`} className={`rounded-lg border p-3 shadow-sm transition-all hover:scale-105 ${dx === 0 && dy === 0 ? 'border-brand-400 bg-brand-500 text-white shadow-md' : 'border-slate-200/50 bg-white/60 dark:border-white/10 dark:bg-black/40'}`}>
                                <div>{Math.round(lum)} × {weight}</div>
                                <div className={dx === 0 && dy === 0 ? 'text-brand-100' : 'text-slate-500'}>= {(lum * weight).toFixed(1)}</div>
                              </div>
                            )
                          }))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTool === 'pixels' && <PixelInspectorPanel image={processed} inspect={inspect} />}
                {activeTool === 'histogram' && (
                  <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                      <HistogramBars bins={bins} channel="gray" />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <HistogramBars bins={bins} channel="r" />
                        <HistogramBars bins={bins} channel="g" />
                        <HistogramBars bins={bins} channel="b" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-xl border border-brand-400/50 bg-brand-500/10 px-3 py-2">
                        <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">{averages.gray.toFixed(1)}</div>
                        <div className="text-[9px] uppercase text-slate-500">Avg luminance</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTool === 'rgb' && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {([['Red channel', averages.r, 'bg-red-500'], ['Green channel', averages.g, 'bg-emerald-500'], ['Blue channel', averages.b, 'bg-blue-500']] as const).map(([label, avg, color]) => (
                      <div key={label} className="rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">{label}</span>
                          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{avg.toFixed(1)}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-white/10">
                          <div className={`h-full ${color}`} style={{ width: `${avg / 255 * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTool === 'matrix' && <MatrixPreview image={processed} />}
                {activeTool === 'edges' && <EdgePanel image={processed} edgeState={edgeState} setEdgeState={setEdgeState} addEntry={addEntry} />}
                {activeTool === 'transform' && <TransformPanel image={processed} transformState={transformState} setTransformState={setTransformState} onTransformed={handleTransformed} addEntry={addEntry} />}
                {activeTool === 'svd' && <SvdPanel image={processed} svdState={svdState} setSvdState={setSvdState} addEntry={addEntry} />}
                {activeTool === 'fft' && <FftPanel image={processed} fftState={fftState} setFftState={setFftState} addEntry={addEntry} />}
                {activeTool === 'compress' && <CompressionPanel image={processed} svdState={svdState} setSvdState={setSvdState} addEntry={addEntry} />}
                {activeTool === 'openmat' && (
                  <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
                    <div className="rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                      <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">OpenMAT engine summary</div>
                      <pre className="whitespace-pre-wrap font-mono text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-200">{openMatSummary}</pre>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto rounded-xl shadow-lg">
                      <OpenMatNotebook params={{ initialCells: openMatCells }} />
                    </div>
                  </div>
                )}
                {activeTool === 'notebook' && <NotebookPanel entries={notebookEntries} setEntries={setNotebookEntries} />}
                {activeTool === 'log' && (
                  <div className="space-y-3">
                    {log.length === 0 && <div className="text-sm font-semibold text-slate-400">No actions yet.</div>}
                    {log.map((item) => (
                      <div key={`${item.at}-${item.label}`} className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-white/40 px-4 py-3 text-xs font-semibold backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                        <span className="font-mono text-[10px] text-slate-400">{new Date(item.at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTool === 'history' && (
                  <HistoryPanel history={historyStack} current={currentHistoryIdx} onRestore={restoreSnapshot} onBranch={branchFromSnapshot} onSnapshot={saveSnapshot} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
