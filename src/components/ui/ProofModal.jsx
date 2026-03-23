/**
 * ProofModal.jsx
 * Full-screen overlay modal that shows a step-by-step proof
 * for a reference formula entry.
 *
 * Usage:
 *   <ProofModal entry={entry} proof={proofObject} onClose={() => setOpen(false)} />
 *
 * `entry`  — reference-data entry object { id, name, latex, category, categoryLabel, color }
 * `proof`  — proof data object (same shape as ImplicitDiffProof PROOF constant), or null
 */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ProofViewer from '../viz/react/ProofViewer.jsx'
import katex from 'katex'

const COLOR_HEADER = {
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/40',    border: 'border-blue-200 dark:border-blue-800',    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  green:   { bg: 'bg-green-50 dark:bg-green-950/40',  border: 'border-green-200 dark:border-green-800',  badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-950/40',border: 'border-purple-200 dark:border-purple-800',badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
  cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-950/40',    border: 'border-cyan-200 dark:border-cyan-800',    badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' },
  orange:  { bg: 'bg-orange-50 dark:bg-orange-950/40',border: 'border-orange-200 dark:border-orange-800',badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40',border:'border-emerald-200 dark:border-emerald-800',badge:'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950/40',    border: 'border-rose-200 dark:border-rose-800',    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' },
}

export default function ProofModal({ entry, proof, onClose }) {
  const scrollRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Render KaTeX for the formula in the header
  let formulaHtml = ''
  try {
    formulaHtml = katex.renderToString(entry.latex, { displayMode: true, throwOnError: false, strict: false })
  } catch {
    formulaHtml = `<span>${entry.latex}</span>`
  }

  const c = COLOR_HEADER[entry.color] ?? COLOR_HEADER.blue

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(0px, 2vw, 24px)',
        backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.55)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white dark:bg-slate-950 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
          maxWidth: '48rem',
          borderRadius: 'clamp(0px, 2vw, 16px)',
        }}
      >
        {/* Modal header */}
        <div className={`flex-shrink-0 px-6 py-4 border-b ${c.border} ${c.bg} flex items-start gap-4`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0 rounded-full ${c.badge}`}>
                {entry.categoryLabel}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                Proof
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {entry.name}
            </h2>
            <div
              className="mt-0 text-slate-800 dark:text-slate-200 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: formulaHtml }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close proof"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable proof body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-2 pb-4">
          <ProofViewer proof={proof} />
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
