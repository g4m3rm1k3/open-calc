import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import katex from 'katex'
import { REFERENCE_CATEGORIES, ALL_ENTRIES } from '../content/reference-data.js'
import { PROOFS } from '../content/proofs/index.js'
import ProofModal from '../components/ui/ProofModal.jsx'
import MathReferenceBackground from '../components/reference/MathReferenceBackground.jsx'

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

  // Subtle categorical sheen
  const sheenClass = {
    blue:    'from-blue-600/5 to-transparent',
    green:   'from-green-600/5 to-transparent',
    purple:  'from-purple-600/5 to-transparent',
    cyan:    'from-cyan-600/5 to-transparent',
    orange:  'from-orange-600/5 to-transparent',
    emerald: 'from-emerald-600/5 to-transparent',
    rose:    'from-rose-600/5 to-transparent',
  }[entry.color] || 'from-slate-600/5 to-transparent'

  return (
    <button
      onClick={hasProof ? () => onOpenProof(entry) : undefined}
      className={`relative w-full text-left bg-white dark:bg-slate-950/54 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[8px] overflow-hidden transition-all duration-300 group shadow-lg shadow-slate-950/10 ${
        hasProof
          ? 'hover:shadow-2xl hover:shadow-brand-500/10 hover:border-amber-400 dark:hover:border-amber-600 hover:-translate-y-1.5 cursor-pointer'
          : 'hover:shadow-xl cursor-default hover:-translate-y-0.5'
      }`}
    >
      {/* Sheen Accent */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${sheenClass} opacity-100 pointer-events-none`} />

      <div className="relative z-10 px-5 pt-5 pb-2 flex items-start justify-between gap-2">
        <div className="font-bold text-[15px] text-slate-800 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors leading-tight">
          {entry.name}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasProof && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/20">
              Proof
            </span>
          )}
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm ${c.badge}`}>
            {entry.categoryLabel}
          </span>
        </div>
      </div>
      <div
        className="relative z-10 px-5 py-5 overflow-x-auto text-center text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-white/8 my-1 mx-3 rounded-[8px] border border-slate-100 dark:border-white/10 shadow-inner"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="relative z-10 px-5 pb-4 min-h-[46px] flex flex-col justify-end">
        {entry.note && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed">
            {entry.note}
          </div>
        )}
        {hasProof && (
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-black opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0 mt-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
            EXPLORE PROOF
          </div>
        )}
      </div>
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
    <div className="relative min-h-[calc(100vh-9rem)] text-slate-900 dark:text-slate-100">
      <MathReferenceBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      {/* Cleaner Header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-[8px] border border-sky-200/30 bg-sky-200/12 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-sky-100 backdrop-blur-md">
            Formula Atlas
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-white">Reference</h1>
          <p className="text-slate-100/76 max-w-2xl leading-relaxed">
            Every formula, law, and identity in one place.{' '}
            <span className="text-amber-200 font-semibold">
              {proofCount} verified with step-by-step proofs.
            </span>
          </p>
        </div>
        <Link
          to="/chemistry"
          className="shrink-0 hidden sm:flex items-center gap-2 px-4 py-2 rounded-[8px] border border-sky-200/20 bg-sky-300/10 text-sky-100 text-sm font-semibold backdrop-blur-xl hover:bg-sky-300/16 transition-colors"
        >
          ⚛ Periodic Table
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search formulas, identities, rules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-[8px] border border-slate-200 dark:border-white/12 bg-white dark:bg-slate-950/58 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300/30 transition-shadow shadow-lg shadow-slate-950/15 backdrop-blur-xl"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-[8px] text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-xl ${activeCategory === 'all' ? 'bg-white text-slate-950 shadow-xl shadow-slate-950/20' : 'text-slate-100/76 hover:bg-white/10'}`}
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
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isActive ? c.tab : c.tabInactive}`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Formula grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-200/70">
          No formulas match "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(entry => (
            <FormulaCard key={entry.id} entry={entry} onOpenProof={setProofEntry} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center text-xs text-slate-200/58">
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
    </div>
  )
}
