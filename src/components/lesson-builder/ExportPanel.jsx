import { useState } from 'react'
import { serializeLesson, getFilePath } from './lessonSerializer.js'

export default function ExportPanel({ state, onClose }) {
  const [copied, setCopied] = useState(false)
  const code = serializeLesson(state)
  const filePath = getFilePath(state)

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Export Lesson</h2>
            <p className="text-xs text-slate-400 mt-0.5">Copy and replace the file at the path below</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        {/* File path */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">File path</p>
          <code className="text-xs text-brand-600 dark:text-brand-400 font-mono break-all">{filePath}</code>
          <p className="text-[10px] text-slate-400 mt-1">
            Find the chapter folder (N-chapter-slug) in your file explorer, then replace or create the lesson file.
          </p>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre leading-relaxed">
            {code}
          </pre>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 shrink-0">
          <button
            onClick={copy}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
          <p className="text-xs text-slate-400">Paste into the lesson file to save your changes</p>
        </div>
      </div>
    </div>
  )
}
