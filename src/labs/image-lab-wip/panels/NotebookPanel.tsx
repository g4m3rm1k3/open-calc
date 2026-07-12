import { useState } from 'react'
import { Check, Copy, FileText } from 'lucide-react'
import { Button } from '../atoms.jsx'
import type { NotebookEntry } from '../types.js'

const TYPE_COLORS: Record<string, string> = {
  image_load: 'border-green-400/50 bg-gradient-to-r from-green-500/10 to-transparent',
  filter_apply: 'border-violet-400/50 bg-gradient-to-r from-violet-500/10 to-transparent',
  svd_compute: 'border-brand-400/50 bg-gradient-to-r from-brand-500/10 to-transparent',
  fft_compute: 'border-blue-400/50 bg-gradient-to-r from-blue-500/10 to-transparent',
  fft_edit: 'border-blue-400/50 bg-gradient-to-r from-blue-500/10 to-transparent',
  transform: 'border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-transparent',
  edge_detect: 'border-pink-400/50 bg-gradient-to-r from-pink-500/10 to-transparent',
  compress_svd: 'border-teal-400/50 bg-gradient-to-r from-teal-500/10 to-transparent',
  setting: 'border-slate-200/50 bg-white/40 dark:border-white/10 dark:bg-white/5',
  snapshot: 'border-emerald-400/50 bg-gradient-to-r from-emerald-500/10 to-transparent',
}

interface NotebookPanelProps {
  entries: NotebookEntry[]
  setEntries: (fn: (prev: NotebookEntry[]) => NotebookEntry[]) => void
}

export function NotebookPanel({ entries, setEntries }: NotebookPanelProps) {
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [copied, setCopied] = useState(false)

  function saveAnnotation(id: string) {
    setEntries((es) => es.map((e) => (e.id === id ? { ...e, annotation: editText } : e)))
    setEditId(null)
  }

  function exportNotebook() {
    const text = entries.map((e) => {
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
    const text = entries.map((e) => {
      const time = new Date(e.at).toLocaleTimeString()
      return `[${time}] ${e.label}${e.annotation ? ` — ${e.annotation}` : ''}`
    }).join('\n')
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
                      onChange={(ev) => setEditText(ev.target.value)}
                      onKeyDown={(ev) => ev.key === 'Enter' && saveAnnotation(e.id)}
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
