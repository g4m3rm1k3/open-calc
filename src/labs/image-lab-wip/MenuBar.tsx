import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Activity, Archive, BarChart3, Blend, BookOpen, BrainCircuit, ChevronDown,
  Download, Eye, FileImage, Grid3X3, History as HistoryIcon, MousePointer2,
  Scan, SlidersHorizontal, Sparkles, Upload, Wand2, Zap,
} from 'lucide-react'
import type { ActiveTool, Settings, ViewerMode } from './types.js'

interface MenuButtonProps {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  openMenu: string | null
  setOpenMenu: (id: string | null) => void
  children: ReactNode
  width?: number
}

function MenuButton({ id, label, icon: Icon, openMenu, setOpenMenu, children, width = 240 }: MenuButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const open = openMenu === id

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenu(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpenMenu])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => { setRect(btnRef.current?.getBoundingClientRect() ?? null); setOpenMenu(open ? null : id) }}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
          open ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400' : 'text-slate-600 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-white/10'
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && rect && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpenMenu(null)} />
          <div
            className="fixed rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
            style={{ zIndex: 9999, left: Math.round(rect.left), top: Math.round(rect.bottom + 6), width }}
          >
            {children}
          </div>
        </>,
        document.body
      )}
    </>
  )
}

function MenuItem({ icon: Icon, label, onClick }: { icon: ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold text-slate-700 transition-colors hover:bg-brand-500/10 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </button>
  )
}

interface MenuBarProps {
  settings: Settings
  updateSetting: (key: keyof Settings, value: Settings[keyof Settings]) => void
  viewerMode: ViewerMode
  setViewerMode: (m: ViewerMode) => void
  kernelEnabled: boolean
  onToggleKernel: () => void
  onOpenTool: (tool: ActiveTool) => void
  onUploadClick: () => void
  onExport: () => void
  onResetSample: () => void
}

const CHANNELS: { id: Settings['channel']; label: string }[] = [
  { id: 'rgb', label: 'RGB' }, { id: 'gray', label: 'Gray' }, { id: 'red', label: 'Red' },
  { id: 'green', label: 'Green' }, { id: 'blue', label: 'Blue' },
]

export function MenuBar({
  settings, updateSetting, viewerMode, setViewerMode, kernelEnabled, onToggleKernel,
  onOpenTool, onUploadClick, onExport, onResetSample,
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  function pick(tool: ActiveTool) {
    onOpenTool(tool)
    setOpenMenu(null)
  }

  return (
    <div className="flex items-center gap-0.5">
      <MenuButton id="file" label="File" icon={FileImage} openMenu={openMenu} setOpenMenu={setOpenMenu} width={200}>
        <MenuItem icon={Upload} label="Upload image…" onClick={() => { onUploadClick(); setOpenMenu(null) }} />
        <MenuItem icon={Download} label="Export PNG" onClick={() => { onExport(); setOpenMenu(null) }} />
        <MenuItem icon={Sparkles} label="Reset to sample" onClick={() => { onResetSample(); setOpenMenu(null) }} />
      </MenuButton>

      <MenuButton id="view" label="View" icon={Eye} openMenu={openMenu} setOpenMenu={setOpenMenu} width={220}>
        <div className="mb-3">
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">View mode</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['image', 'matrix', 'split'] as ViewerMode[]).map((mode) => (
              <button key={mode} type="button" onClick={() => setViewerMode(mode)}
                className={`rounded-lg px-1 py-1.5 text-[10px] font-semibold capitalize transition-colors ${
                  viewerMode === mode ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                }`}>{mode}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Channel</div>
          <div className="grid grid-cols-2 gap-1.5">
            {CHANNELS.map((ch) => (
              <button key={ch.id} type="button" onClick={() => updateSetting('channel', ch.id)}
                className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                  settings.channel === ch.id ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                }`}>{ch.label}</button>
            ))}
          </div>
        </div>
      </MenuButton>

      <MenuButton id="adjust" label="Adjust" icon={SlidersHorizontal} openMenu={openMenu} setOpenMenu={setOpenMenu} width={240}>
        <div className="space-y-3">
          {([
            ['Brightness', 'brightness', -90, 90, 1, ''],
            ['Contrast', 'contrast', 30, 220, 1, '%'],
            ['Gamma', 'gamma', 0.3, 2.6, 0.1, ''],
          ] as const).map(([label, key, min, max, step, suffix]) => (
            <label key={key} className="block">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>{label}</span><span className="text-brand-600 dark:text-brand-400">{settings[key]}{suffix}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={settings[key]}
                onChange={(e) => updateSetting(key, Number(e.target.value))} className="w-full accent-brand-500" />
            </label>
          ))}
          <button type="button" onClick={() => { onToggleKernel(); pick('kernel') }}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200/70 px-2.5 py-2 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
            <span>Filter kernel</span>
            <span className={kernelEnabled ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-400'}>{kernelEnabled ? 'On ✓' : 'Off — open editor'}</span>
          </button>
        </div>
      </MenuButton>

      <MenuButton id="analyze" label="Analyze" icon={Eye} openMenu={openMenu} setOpenMenu={setOpenMenu} width={210}>
        <MenuItem icon={MousePointer2} label="Pixel Inspector" onClick={() => pick('pixels')} />
        <MenuItem icon={BarChart3} label="Histogram" onClick={() => pick('histogram')} />
        <MenuItem icon={Blend} label="RGB channels" onClick={() => pick('rgb')} />
        <MenuItem icon={Grid3X3} label="Matrix view" onClick={() => pick('matrix')} />
        <MenuItem icon={Scan} label="Edge Detection" onClick={() => pick('edges')} />
      </MenuButton>

      <MenuButton id="transform" label="Transform" icon={Wand2} openMenu={openMenu} setOpenMenu={setOpenMenu} width={210}>
        <MenuItem icon={Wand2} label="Affine Transform" onClick={() => pick('transform')} />
        <MenuItem icon={Zap} label="SVD Explorer" onClick={() => pick('svd')} />
        <MenuItem icon={Activity} label="2D FFT" onClick={() => pick('fft')} />
        <MenuItem icon={Archive} label="Compression Lab" onClick={() => pick('compress')} />
      </MenuButton>

      <MenuButton id="tools" label="Tools" icon={BrainCircuit} openMenu={openMenu} setOpenMenu={setOpenMenu} width={210}>
        <MenuItem icon={BrainCircuit} label="OpenMAT console" onClick={() => pick('openmat')} />
        <MenuItem icon={BookOpen} label="Experiment Notebook" onClick={() => pick('notebook')} />
        <MenuItem icon={HistoryIcon} label="Action Log" onClick={() => pick('log')} />
        <MenuItem icon={HistoryIcon} label="Snapshots / History" onClick={() => pick('history')} />
      </MenuButton>
    </div>
  )
}
