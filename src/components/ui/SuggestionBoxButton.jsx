import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSubmitSuggestion } from '../../hooks/useSuggestions.js'
import { Lightbulb, X, Send, Lock } from 'lucide-react'

// Modal, not a route — this opens as an overlay on top of whatever the
// learner is doing (a lesson, a lab) and closing it puts them back exactly
// where they were. A dedicated page would mean navigating away mid-lesson
// to leave an idea, then finding your way back. Same interaction shape as
// ReportBugButton, which already gets this right.
//
// Submit-only, and only ever rendered from inside the Help modal's
// "Feedback & Bugs" section now — that section is the single entry point
// for both reporting and browsing (see HelpModal.jsx / useFeedbackBoard).
// This used to also have its own icon in the top bar, a Start Menu entry,
// and a HomePage footer link — three doors to the same room, removed in
// favor of the one already-discoverable Help button.
export default function SuggestionBoxButton({ className = '', iconOnly = false, ...rest }) {
  const [open, setOpen] = useState(false)
  const { signInWithGoogle } = useAuth()
  const { submit, submitting, canSubmit } = useSubmitSuggestion()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const close = () => { setOpen(false); setError(''); setDone(false) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await submit({ title, description })
      setTitle(''); setDescription(''); setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit — please try again.')
    }
  }

  return (
    <>
      <button
        {...rest}
        onClick={() => setOpen(true)}
        title="Suggestion Box — have an idea?"
        className={
          iconOnly
            ? `flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/50 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none ${className}`
            : `group flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ${className}`
        }
      >
        <Lightbulb className="w-4 h-4 relative z-10 group-hover:animate-bounce" />
        {!iconOnly && <span className="relative z-10 text-white">Suggestion Box</span>}
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={close}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_16px_64px_rgba(245,158,11,0.15)] border border-amber-200/50 dark:border-amber-500/30 overflow-hidden relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200/50 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/80 to-white/80 dark:from-amber-950/40 dark:to-slate-900/40 shrink-0">
                  <div className="bg-amber-500/20 p-1.5 rounded-lg shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h2 className="flex-1 text-sm font-black text-slate-800 dark:text-slate-100 tracking-wide uppercase">Suggestion Box</h2>
                  <button onClick={close} aria-label="Close" className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative px-5 py-4">
                  {!canSubmit && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-center px-4">
                      <Lock className="w-7 h-7 text-slate-400" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sign in to suggest an idea</p>
                      <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-colors"
                      >
                        Sign in
                      </button>
                    </div>
                  )}
                  {done ? (
                    <p className="text-sm text-emerald-500 font-medium text-center py-4">
                      Thanks — it's live in the Help modal's Feedback &amp; Bugs section.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmit} className={!canSubmit ? 'opacity-40 pointer-events-none select-none' : ''}>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="What's the idea?"
                        maxLength={120}
                        disabled={!canSubmit}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 px-4 py-2.5 outline-none focus:ring-2 focus:border-amber-400 focus:ring-amber-400/30 placeholder:text-slate-400 mb-2"
                      />
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Why would this help learners?"
                        rows={2}
                        maxLength={2000}
                        disabled={!canSubmit}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 px-4 py-2.5 outline-none focus:ring-2 focus:border-amber-400 focus:ring-amber-400/30 placeholder:text-slate-400 resize-none mb-2"
                      />
                      {error && <p className="text-xs text-red-500 font-medium mb-2">{error}</p>}
                      <button
                        type="submit"
                        disabled={!canSubmit || submitting || !title.trim() || !description.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold disabled:opacity-50 transition-colors"
                      >
                        {submitting ? 'Submitting…' : <><Send className="w-3.5 h-3.5" /> Submit idea</>}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
