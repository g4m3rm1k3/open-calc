import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
          className={`group relative flex flex-col items-start gap-3 p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-500/30 shadow-md hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden w-full ${className}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-400/0 via-rose-400/10 to-rose-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-rose-500/20 flex items-center justify-center shadow-sm relative z-10">
            <Bug className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide relative z-10">Report a Bug</span>
        </button>
      ) : (
        <button
          {...rest}
          onClick={() => { setOpen(true); onOpen?.() }}
          className={
            iconOnly
              ? `group relative flex items-center justify-center w-10 h-10 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-br hover:from-rose-500 hover:to-red-600 shadow-sm hover:shadow-lg hover:shadow-rose-500/40 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none overflow-hidden ${open ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/40 ring-2 ring-rose-400 ring-offset-2 dark:ring-offset-slate-950 scale-110' : ''} ${className}`
              : `group relative flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-br hover:from-rose-500 hover:to-red-600 shadow-sm hover:shadow-md hover:shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden ${open ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30' : ''} ${className}`
          }
          title="Report a bug"
        >
          <Bug className={`w-4 h-4 relative z-10 ${open ? 'drop-shadow-sm' : 'group-hover:drop-shadow-sm group-hover:animate-bounce'}`} />
          {!iconOnly && <span className="relative z-10">Report Bug</span>}
        </button>
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {open && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_16px_64px_rgba(225,29,72,0.15)] border border-rose-200/50 dark:border-rose-500/30 overflow-hidden relative"
          >
            {/* Subtle top glare */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200/50 dark:border-rose-900/30 bg-gradient-to-r from-rose-50/80 to-white/80 dark:from-rose-950/40 dark:to-slate-900/40">
              <div className="bg-rose-500/20 p-1.5 rounded-lg shadow-[0_0_10px_rgba(225,29,72,0.2)] shrink-0">
                <Bug className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              </div>
              <h2 className="flex-1 text-sm font-black text-slate-800 dark:text-slate-100 tracking-wide uppercase">Report a Bug</h2>
              <button onClick={close} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!canSubmit ? (
              <div className="px-5 py-12 flex flex-col items-center gap-4 text-center">
                <Bug className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-800 dark:text-slate-100">Sign in to report bugs</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create a free account to help us improve the app.</p>
                <button onClick={close} className="mt-4 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-300">
                  Close
                </button>
              </div>
            ) : done ? (
              <div className="px-5 py-12 flex flex-col items-center gap-4 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                <p className="font-semibold text-slate-800 dark:text-slate-100">Thanks for the report!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">We'll look into it.</p>
                <button onClick={close} className="mt-4 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-300">
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
                    className="w-full rounded-xl border border-slate-300/80 dark:border-rose-500/30 bg-white/80 dark:bg-slate-950/50 text-sm text-slate-800 dark:text-slate-100 px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 shadow-inner transition-all duration-300 appearance-none"
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
                    className="w-full rounded-xl border border-slate-300/80 dark:border-rose-500/30 bg-white/80 dark:bg-slate-950/50 text-sm text-slate-800 dark:text-slate-100 px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 placeholder:text-slate-400 dark:placeholder:text-rose-700/50 shadow-inner transition-all duration-300"
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
                    className="w-full rounded-xl border border-slate-300/80 dark:border-rose-500/30 bg-white/80 dark:bg-slate-950/50 text-sm text-slate-800 dark:text-slate-100 px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 placeholder:text-slate-400 dark:placeholder:text-rose-700/50 resize-none shadow-inner transition-all duration-300"
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
                  <button type="button" onClick={close} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-300">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !description.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 disabled:opacity-50 text-sm font-bold text-white shadow-md hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    {submitting ? <span className="animate-pulse">Sending…</span> : <><Send className="w-3.5 h-3.5" /> Send Report</>}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
