import { useState, useMemo } from 'react'
import katex from 'katex'
import { REFERENCE_CATEGORIES, ALL_ENTRIES } from '../content/reference-data.js'
import { PROOFS } from '../content/proofs/index.js'
import ProofModal from '../components/ui/ProofModal.jsx'

const COLOR_CLASSES = {
  blue:    { badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',    tab: 'bg-blue-600 text-white',    tabInactive: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30' },
  green:   { badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',  tab: 'bg-green-600 text-white',   tabInactive: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' },
  purple:  { badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', tab: 'bg-purple-600 text-white', tabInactive: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30' },
  cyan:    { badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',    tab: 'bg-cyan-600 text-white',    tabInactive: 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30' },
  orange:  { badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300', tab: 'bg-orange-500 text-white', tabInactive: 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30' },
  emerald: { badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', tab: 'bg-emerald-600 text-white', tabInactive: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' },
  rose:    { badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',    tab: 'bg-rose-600 text-white',    tabInactive: 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30' },
}

function FormulaCard({ entry, onOpenProof }) {
  const c = COLOR_CLASSES[entry.color] ?? COLOR_CLASSES.blue
  const hasProof = !!PROOFS[entry.id]

  const html = useMemo(() => {
    try {
      return katex.renderToString(entry.latex, { displayMode: true, throwOnError: false, strict: false })
    } catch {
      return `<span style="color:red">${entry.latex}</span>`
    }
  }, [entry.latex])

  return (
    <button
      onClick={hasProof ? () => onOpenProof(entry) : undefined}
      className={`w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all ${
        hasProof
          ? 'hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 hover:-translate-y-0.5 cursor-pointer group'
          : 'hover:shadow-md cursor-default'
      }`}
    >
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">
          {entry.name}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasProof && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
              Proof
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.badge}`}>
            {entry.categoryLabel}
          </span>
        </div>
      </div>
      <div
        className="px-4 py-3 overflow-x-auto text-center text-slate-900 dark:text-slate-100"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {entry.note && (
        <div className="px-4 pb-3 text-xs text-slate-400 dark:text-slate-500 italic">
          {entry.note}
        </div>
      )}
      {hasProof && (
        <div className="px-4 pb-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          View step-by-step proof
        </div>
      )}
    </button>
  )
}

export default function ReferencePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [proofEntry, setProofEntry] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const entries = activeCategory === 'all'
      ? ALL_ENTRIES
      : ALL_ENTRIES.filter(e => e.category === activeCategory)
    if (!q) return entries
    return entries.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.latex.toLowerCase().includes(q) ||
      (e.note ?? '').toLowerCase().includes(q) ||
      e.categoryLabel.toLowerCase().includes(q)
    )
  }, [activeCategory, search])

  const proofCount = ALL_ENTRIES.filter(e => PROOFS[e.id]).length

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Reference</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Laws, identities, and theorems — every formula in one place.{' '}
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {proofCount} formulas have step-by-step proofs.
          </span>{' '}
          Click any highlighted card to explore.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search formulas, identities, rules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeCategory === 'all' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          All
        </button>
        {REFERENCE_CATEGORIES.map(cat => {
          const c = COLOR_CLASSES[cat.color] ?? COLOR_CLASSES.blue
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive ? c.tab : c.tabInactive}`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Formula grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          No formulas match "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(entry => (
            <FormulaCard key={entry.id} entry={entry} onOpenProof={setProofEntry} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center text-xs text-slate-300 dark:text-slate-600">
        {ALL_ENTRIES.length} formulas across {REFERENCE_CATEGORIES.length} categories · {proofCount} with proofs
      </div>

      {/* Proof modal */}
      {proofEntry && (
        <ProofModal
          entry={proofEntry}
          proof={PROOFS[proofEntry.id] ?? null}
          onClose={() => setProofEntry(null)}
        />
      )}
    </div>
  )
}
