import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import katex from 'katex'
import { REFERENCE_CATEGORIES, ALL_ENTRIES } from '../reference/reference-data.js'
import { PROOFS } from '../reference/proofs/index.js'
import ProofModal from '../components/reference/ProofModal.jsx'
import { GLASS_META } from '../styles/courseColors.js'
import { useGlobalTheme } from '../context/ThemeContext.jsx'

function FormulaCard({ entry, ui, onOpenProof }) {
  const c = GLASS_META[entry.color] ?? GLASS_META.blue
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
      className={`relative w-full text-left overflow-hidden rounded-3xl group transition-all duration-300
        border ${ui.border} ${ui.bg1} hover:-translate-y-1 hover:shadow-xl
        ${hasProof ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${c.bar}`} />
      
      {/* Header Section */}
      <div className={`relative px-5 pt-4 pb-5 border-b ${ui.border} bg-gradient-to-br ${c.header}`}>
        {/* Subtle gloss sheen on cover */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="font-bold text-[15px] leading-tight text-white drop-shadow">
            {entry.name}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {hasProof && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-sm shadow-amber-900/10">
                Proof
              </span>
            )}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ui.bg2} ${ui.txt2} group-hover:${c.text.split(' ')[0]} ${c.text.includes('dark:') ? `dark:group-hover:${c.text.split('dark:')[1]}` : ''} transition-colors border border-transparent`}>
              {entry.categoryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Page body — formula + note */}
      <div className={`px-5 pt-5 pb-5 relative`}>
        {/* Typeset formula well */}
        <div
          className={`overflow-x-auto text-center rounded-xl border ${ui.border} ${ui.bg2} px-4 py-5 shadow-sm group-hover:border-transparent transition-colors duration-300`}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Note + proof CTA */}
        <div className="mt-4 min-h-[32px] flex flex-col justify-end">
          {entry.note && (
            <div className={`text-[12px] ${ui.txt2} font-medium italic line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity`}>
              {entry.note}
            </div>
          )}
          {hasProof && (
            <div
              className={`flex items-center gap-1.5 text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0 mt-3 ${c.text}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  const { themeStyles: { ui } } = useGlobalTheme()
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
    <div className={`relative min-h-[calc(100vh-9rem)] ${ui.bg1} bg-gradient-to-br from-transparent to-black/5 dark:to-white/5`}>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      {/* Cleaner Header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <div className={`mb-4 inline-flex items-center gap-2 rounded-[8px] border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300 backdrop-blur-md`}>
            Formula Atlas
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 drop-shadow-sm filter">Reference</h1>
          <p className={`${ui.txt2} max-w-2xl leading-relaxed`}>
            Every formula, law, and identity in one place.{' '}
            <span className="text-emerald-500 font-semibold">
              {proofCount} verified with step-by-step proofs.
            </span>
          </p>
        </div>
        <Link
          to="/chemistry"
          className={`shrink-0 hidden sm:flex items-center gap-2 px-4 py-2 rounded-[8px] border ${ui.border} ${ui.bg2} ${ui.txt1} text-sm font-semibold backdrop-blur-xl ${ui.hoverBg} transition-colors`}
        >
          ⚛ Periodic Table
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-10">
        <svg className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${ui.txt2}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search formulas, identities, rules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full pl-14 pr-4 py-4 rounded-2xl border ${ui.border} ${ui.bg2} ${ui.txt1} placeholder-slate-400 dark:placeholder-slate-500 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-shadow shadow-sm`}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-[8px] text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === 'all' ? `${ui.bg2} ${ui.txt1} border ${ui.border} shadow-sm` : `${ui.txt2} ${ui.hoverBg} border border-transparent`}`}
        >
          All
        </button>
        {REFERENCE_CATEGORIES.map(cat => {
          const c = GLASS_META[cat.color] ?? GLASS_META.blue
          const isActive = activeCategory === cat.id
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-[8px] text-xs font-bold uppercase tracking-wider transition-all border
                ${isActive 
                  ? `bg-gradient-to-r ${c.header} border-transparent text-white shadow-lg` 
                  : `${ui.bg1} ${ui.border} ${ui.hoverBg} ${c.text}`}`}
              style={isActive ? { boxShadow: c.glow } : {}}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Formula grid */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${ui.txt2}`}>
          No formulas match "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(entry => (
            <FormulaCard key={entry.id} entry={entry} ui={ui} onOpenProof={setProofEntry} />
          ))}
        </div>
      )}

      <div className={`mt-12 text-center text-[13px] font-medium ${ui.txt2}`}>
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
