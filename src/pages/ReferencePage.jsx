import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import katex from 'katex'
import { REFERENCE_CATEGORIES, ALL_ENTRIES } from '../reference/reference-data.js'
import { PROOFS } from '../reference/proofs/index.js'
import ProofModal from '../components/reference/ProofModal.jsx'
import MathReferenceBackground from '../components/backgrounds/MathReferenceBackground.jsx'

const COLOR_CLASSES = {
  blue:    { tab: 'bg-blue-600 text-white',    tabInactive: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30', cover: 'from-blue-600 via-blue-700 to-indigo-800',    glow: '0 20px 50px -8px rgba(59,130,246,0.45)',    accent: '#60a5fa' },
  green:   { tab: 'bg-green-600 text-white',   tabInactive: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30', cover: 'from-green-600 via-green-700 to-emerald-800',  glow: '0 20px 50px -8px rgba(34,197,94,0.45)',     accent: '#4ade80' },
  purple:  { tab: 'bg-purple-600 text-white',  tabInactive: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30', cover: 'from-purple-600 via-purple-700 to-violet-900', glow: '0 20px 50px -8px rgba(168,85,247,0.45)',    accent: '#c084fc' },
  cyan:    { tab: 'bg-cyan-600 text-white',    tabInactive: 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30', cover: 'from-cyan-500 via-sky-600 to-blue-700',        glow: '0 20px 50px -8px rgba(6,182,212,0.45)',     accent: '#22d3ee' },
  orange:  { tab: 'bg-orange-500 text-white',  tabInactive: 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30', cover: 'from-orange-500 via-orange-600 to-red-700',   glow: '0 20px 50px -8px rgba(249,115,22,0.45)',    accent: '#fb923c' },
  emerald: { tab: 'bg-emerald-600 text-white', tabInactive: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30', cover: 'from-emerald-500 via-emerald-600 to-teal-800', glow: '0 20px 50px -8px rgba(16,185,129,0.45)',    accent: '#34d399' },
  rose:    { tab: 'bg-rose-600 text-white',    tabInactive: 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30', cover: 'from-rose-500 via-rose-600 to-pink-800',       glow: '0 20px 50px -8px rgba(244,63,94,0.45)',     accent: '#fb7185' },
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
      onMouseEnter={e => { if (hasProof) e.currentTarget.style.boxShadow = c.glow }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}
      className={`relative w-full text-left overflow-hidden rounded-2xl group transition-all duration-300
        shadow-[0_4px_20px_rgba(0,0,0,0.15),0_1px_4px_rgba(0,0,0,0.1)]
        dark:shadow-[0_4px_24px_rgba(0,0,0,0.5),0_1px_4px_rgba(0,0,0,0.3)]
        ${hasProof
          ? 'hover:-translate-y-2 cursor-pointer'
          : 'hover:-translate-y-0.5 cursor-default'
        }`}
    >
      {/* Book cover — colored gradient top section */}
      <div className={`relative bg-gradient-to-br ${c.cover} px-5 pt-4 pb-5 overflow-hidden`}>
        {/* Subtle gloss sheen on cover */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        {/* Embossed grid texture */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 11px,rgba(255,255,255,0.8) 11px,rgba(255,255,255,0.8) 12px),repeating-linear-gradient(90deg,transparent,transparent 11px,rgba(255,255,255,0.8) 11px,rgba(255,255,255,0.8) 12px)' }} />

        <div className="relative flex items-start justify-between gap-2">
          <div className="font-bold text-[15px] text-white leading-tight drop-shadow">
            {entry.name}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {hasProof && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-lg shadow-amber-900/30">
                Proof
              </span>
            )}
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/10">
              {entry.categoryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Page separator — simulates book spine edge */}
      <div className="h-[3px] w-full bg-gradient-to-r from-black/20 via-black/5 to-black/20 dark:from-black/40 dark:via-black/10 dark:to-black/40" />

      {/* Page body — formula + note */}
      <div className="bg-[#e8e2d5] dark:bg-[#0d0d18] px-4 pt-4 pb-4"
        style={{ boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.08)' }}>
        {/* Typeset formula well — elevated off the parchment */}
        <div
          className="overflow-x-auto text-center text-slate-900 dark:text-slate-100 rounded-xl
            bg-white dark:bg-[#1c1c2e]
            border border-slate-300/80 dark:border-slate-600/60
            shadow-[0_2px_8px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.4)]
            px-4 py-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Note + proof CTA */}
        <div className="mt-3 min-h-[28px] flex flex-col justify-end">
          {entry.note && (
            <div className="text-[11px] text-stone-500 dark:text-slate-500 font-medium italic line-clamp-2 leading-relaxed">
              {entry.note}
            </div>
          )}
          {hasProof && (
            <div
              className="flex items-center gap-1 text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 mt-1"
              style={{ color: c.accent }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
              EXPLORE PROOF
            </div>
          )}
        </div>
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
