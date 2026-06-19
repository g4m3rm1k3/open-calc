import { useState } from 'react'
import { useReportBug } from '../../hooks/useReportBug.js'
import { Bug, X, Send, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'bug',            label: '🐛 Something is broken' },
  { value: 'ui',             label: '🎨 Visual / layout issue' },
  { value: 'performance',    label: '⚡ Slow or unresponsive' },
  { value: 'content',        label: '📚 Wrong or missing content' },
  { value: 'feature',        label: '💡 Feature request' },
  { value: 'other',          label: '❓ Other' },
]

export default function ReportBugButton({ className = '', iconOnly = false, tile = false, onOpen, ...rest }) {
  const { submit: submitReport, submitting, canSubmit } = useReportBug()
  const [open, setOpen]           = useState(false)
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [category, setCategory]   = useState('bug')
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  const reset = () => {
    setTitle(''); setDesc(''); setCategory('bug')
    setDone(false); setError('')
  }

  const close = () => { setOpen(false); reset() }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await submitReport({ title, description, category })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit — please try again.')
    }
  }

  return (
    <>
      {tile ? (
        <button
          {...rest}
          onClick={() => { setOpen(true); onOpen?.() }}
          className={`flex flex-col items-start gap-3 p-4 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-500/20 shadow-sm w-full ${className}`}
        >
          <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-rose-500/20 flex items-center justify-center shadow-sm">
            <Bug className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold tracking-wide">Report a Bug</span>
        </button>
      ) : (
        <button
          {...rest}
          onClick={() => { setOpen(true); onOpen?.() }}
          className={
            iconOnly
              ? `flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none ${className}`
              : `flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${className}`
          }
          title="Report a bug"
        >
          <Bug className="w-3.5 h-3.5" />
          {!iconOnly && <span>Report Bug</span>}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <Bug className="w-4 h-4 text-red-500 shrink-0" />
              <h2 className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-100">Report a Bug</h2>
              <button onClick={close} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!canSubmit ? (
              <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
                <Bug className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-800 dark:text-slate-100">Sign in to report bugs</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create a free account to help us improve the app.</p>
                <button onClick={close} className="mt-2 px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Close
                </button>
              </div>
            ) : done ? (
              <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <p className="font-semibold text-slate-800 dark:text-slate-100">Thanks for the report!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">We'll look into it.</p>
                <button onClick={close} className="mt-2 px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-5 py-4 space-y-4">

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/50"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Title <span className="font-normal text-slate-400">(optional)</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Short summary…"
                    maxLength={120}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/50 placeholder:text-slate-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">What happened? <span className="text-red-400">*</span></label>
                  <textarea
                    value={description}
                    onChange={e => { setDesc(e.target.value); setError('') }}
                    placeholder="Describe the issue — what you did, what you expected, what actually happened…"
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/50 placeholder:text-slate-400 resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5 text-right">{description.length}/2000</p>
                </div>

                {/* Auto-context notice */}
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  We'll also record the current page URL and your browser info to help diagnose the issue.
                </p>

                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={close} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !description.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm font-bold text-white transition-colors"
                  >
                    {submitting ? <span className="animate-pulse">Sending…</span> : <><Send className="w-3.5 h-3.5" /> Send Report</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
