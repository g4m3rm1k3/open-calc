import { Button } from '../atoms.jsx'
import { PRESETS } from '../imageMath.js'
import type { Kernel3x3, LogItem } from '../types.js'

interface KernelPanelProps {
  kernel: Kernel3x3
  setKernel: (fn: (prev: Kernel3x3) => Kernel3x3) => void
  normalize: boolean
  setNormalize: (v: boolean) => void
  setLog: (fn: (prev: LogItem[]) => LogItem[]) => void
}

export function KernelPanel({ kernel, setKernel, normalize, setNormalize, setLog }: KernelPanelProps) {
  function update(row: number, col: number, val: string) {
    setKernel((prev) => prev.map((line, r) => line.map((cell, c) => (r === row && c === col ? Number(val) : cell))))
  }
  function usePreset(id: string) {
    setKernel(() => PRESETS[id].values)
    setLog((items) => [{ label: `Loaded ${PRESETS[id].name} kernel`, at: Date.now() }, ...items].slice(0, 50))
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {kernel.flatMap((row, r) => row.map((v, c) => (
          <input key={`${r}-${c}`} type="number" value={v}
            onChange={(e) => update(r, c, e.target.value)}
            className="h-10 rounded-lg border border-slate-200/50 bg-white/60 text-center font-mono text-sm font-bold text-slate-800 shadow-sm transition-all focus:border-brand-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-slate-100 dark:focus:bg-black/80" />
        )))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(PRESETS).map(([id, p]) => (
          <Button key={id} onClick={() => usePreset(id)}>{p.name}</Button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="accent-brand-500" />
        Normalize by kernel sum
      </label>
    </div>
  )
}
