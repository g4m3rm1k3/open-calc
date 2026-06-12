import { useState, useMemo, useCallback } from 'react'
import katex from 'katex'
import { LA_CATEGORIES, ALL_LA_CONCEPTS } from '../content/linear-algebra-data.js'

function openInOpenMat(code) {
  try {
    const docs = (() => {
      try { return JSON.parse(localStorage.getItem('openmat-documents') || '[]') } catch { return [] }
    })()
    const id = `la-ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const updated = Array.isArray(docs) ? [...docs, { id, name: 'la-reference.m', code }] : [{ id, name: 'la-reference.m', code }]
    localStorage.setItem('openmat-documents', JSON.stringify(updated))
    localStorage.setItem('openmat-active-document-id', JSON.stringify(id))
    window.location.href = '/#/openmat'
  } catch (e) {
    console.error('Failed to open in OpenMAT:', e)
  }
}

const COLOR_CLASSES = {
  blue:    { tab: 'bg-blue-600 text-white',    tabInactive: 'text-blue-400 hover:bg-blue-900/30',     cover: 'from-blue-600 via-blue-700 to-indigo-800',     border: 'border-blue-700/40',   glow: '0 0 40px rgba(59,130,246,0.25)',   code: 'border-blue-700/40 bg-blue-950/30'    },
  purple:  { tab: 'bg-purple-600 text-white',  tabInactive: 'text-purple-400 hover:bg-purple-900/30', cover: 'from-purple-600 via-purple-700 to-violet-900', border: 'border-purple-700/40', glow: '0 0 40px rgba(168,85,247,0.25)',   code: 'border-purple-700/40 bg-purple-950/30'},
  cyan:    { tab: 'bg-cyan-600 text-white',    tabInactive: 'text-cyan-400 hover:bg-cyan-900/30',     cover: 'from-cyan-500 via-sky-600 to-blue-700',        border: 'border-cyan-700/40',   glow: '0 0 40px rgba(6,182,212,0.25)',    code: 'border-cyan-700/40 bg-cyan-950/30'    },
  orange:  { tab: 'bg-orange-500 text-white',  tabInactive: 'text-orange-400 hover:bg-orange-900/30', cover: 'from-orange-500 via-orange-600 to-red-700',    border: 'border-orange-700/40', glow: '0 0 40px rgba(249,115,22,0.25)',   code: 'border-orange-700/40 bg-orange-950/30'},
  emerald: { tab: 'bg-emerald-600 text-white', tabInactive: 'text-emerald-400 hover:bg-emerald-900/30', cover: 'from-emerald-500 via-emerald-600 to-teal-800', border: 'border-emerald-700/40', glow: '0 0 40px rgba(16,185,129,0.25)',  code: 'border-emerald-700/40 bg-emerald-950/30'},
  rose:    { tab: 'bg-rose-600 text-white',    tabInactive: 'text-rose-400 hover:bg-rose-900/30',     cover: 'from-rose-500 via-rose-600 to-pink-800',       border: 'border-rose-700/40',   glow: '0 0 40px rgba(244,63,94,0.25)',    code: 'border-rose-700/40 bg-rose-950/30'    },
  violet:  { tab: 'bg-violet-600 text-white',  tabInactive: 'text-violet-400 hover:bg-violet-900/30', cover: 'from-violet-600 via-violet-700 to-purple-900', border: 'border-violet-700/40', glow: '0 0 40px rgba(139,92,246,0.25)',   code: 'border-violet-700/40 bg-violet-950/30'},
  teal:    { tab: 'bg-teal-600 text-white',    tabInactive: 'text-teal-400 hover:bg-teal-900/30',     cover: 'from-teal-500 via-teal-600 to-emerald-800',    border: 'border-teal-700/40',   glow: '0 0 40px rgba(20,184,166,0.25)',   code: 'border-teal-700/40 bg-teal-950/30'    },
}

function KatexBlock({ latex, display = false }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { displayMode: display, throwOnError: false, strict: false })
    } catch {
      return `<code style="color:#f87171">${latex}</code>`
    }
  }, [latex, display])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function Section({ label, color, children }) {
  return (
    <div>
      <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${color}`}>{label}</div>
      {children}
    </div>
  )
}

function ConceptCard({ concept, forceExpanded }) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const expanded = forceExpanded || localExpanded
  const c = COLOR_CLASSES[concept.color] ?? COLOR_CLASSES.blue

  return (
    <div
      className={`rounded-2xl overflow-hidden border ${c.border} bg-[#0e0e1a] transition-all duration-300`}
      style={expanded ? { boxShadow: c.glow } : {}}
    >
      {/* Header — always clickable */}
      <button
        className={`w-full text-left relative bg-gradient-to-br ${c.cover} overflow-hidden`}
        onClick={() => setLocalExpanded(e => !e)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,1) 8px,rgba(255,255,255,1) 9px)' }} />
        <div className="relative px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-black text-[17px] text-white leading-tight drop-shadow mb-1">{concept.name}</div>
            <div className="text-white/75 text-[13px] leading-snug max-w-2xl">
              {concept.plain.split('.')[0]}.
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/10">
              {concept.categoryLabel}
            </span>
            <span className="text-white/50 text-sm">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-6 py-5 space-y-6">

          {/* Plain English */}
          <Section label="In Plain English" color="text-slate-400">
            <p className="text-slate-200 text-[14px] leading-relaxed">{concept.plain}</p>
            {concept.intuition && (
              <p className="mt-2 text-slate-400 text-[13px] leading-relaxed italic border-l-2 border-slate-700 pl-3">{concept.intuition}</p>
            )}
          </Section>

          {/* Two-column: Formal + Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {concept.formal && (
              <Section label="Formally" color="text-slate-400">
                <div className="overflow-x-auto rounded-xl bg-[#13131f] border border-slate-700/50 px-4 py-3 text-center text-slate-100 shadow-inner min-h-[60px] flex items-center justify-center">
                  <KatexBlock latex={concept.formal} display />
                </div>
              </Section>
            )}
            {concept.example && (
              <Section label="Concrete Example" color="text-slate-400">
                <p className="text-slate-300 text-[13px] leading-relaxed mb-2">{concept.example}</p>
                {concept.exampleLatex && (
                  <div className="overflow-x-auto rounded-xl bg-[#13131f] border border-slate-700/50 px-4 py-3 text-center text-slate-100 shadow-inner">
                    <KatexBlock latex={concept.exampleLatex} display />
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* When / Where */}
          {concept.when && (
            <Section label="Where You'll See This" color="text-amber-500/70">
              <p className="text-slate-300 text-[13px] leading-relaxed">{concept.when}</p>
            </Section>
          )}

          {/* Watch out / don't confuse */}
          {concept.watchout && (
            <Section label="Don't Confuse With" color="text-rose-400/70">
              <p className="text-slate-300 text-[13px] leading-relaxed">{concept.watchout}</p>
            </Section>
          )}

          {/* OpenMAT code */}
          {concept.openmat && (
            <Section label="See It in OpenMAT" color="text-emerald-400/70">
              <div className={`rounded-xl border ${c.code} overflow-hidden`}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">openmat</span>
                  <button
                    onClick={() => openInOpenMat(concept.openmat)}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg transition-all"
                    style={{ color: '#c2410c', borderColor: '#fed7aa', background: '#fff7ed', border: '1px solid #fed7aa' }}
                  >
                    ↗ Open in OpenMAT
                  </button>
                </div>
                <pre className="px-4 py-3 text-[13px] text-emerald-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">{concept.openmat}</pre>
              </div>
            </Section>
          )}

        </div>
      )}
    </div>
  )
}

export default function LinearAlgebraReferencePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandAll, setExpandAll] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = activeCategory === 'all'
      ? ALL_LA_CONCEPTS
      : ALL_LA_CONCEPTS.filter(c => c.category === activeCategory)
    if (!q) return base
    return base.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.plain.toLowerCase().includes(q) ||
      (c.when ?? '').toLowerCase().includes(q) ||
      (c.example ?? '').toLowerCase().includes(q) ||
      c.categoryLabel.toLowerCase().includes(q)
    )
  }, [activeCategory, search])

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px)' }} />

      <div className="relative max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-700/40 rounded-full px-4 py-1.5 mb-4">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">First Semester · Complete Reference</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="text-white">Linear </span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Algebra</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {ALL_LA_CONCEPTS.length} concepts. Plain English first, then formal, then code. Click any card to expand.
          </p>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search concepts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#12121f] border border-slate-700/60 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-200 placeholder-slate-600
                focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setExpandAll(e => !e)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              expandAll
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-[#12121f] border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeCategory === 'all' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            All ({ALL_LA_CONCEPTS.length})
          </button>
          {LA_CATEGORIES.map(cat => {
            const c = COLOR_CLASSES[cat.color]
            const count = ALL_LA_CONCEPTS.filter(x => x.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeCategory === cat.id ? c.tab : c.tabInactive}`}
              >
                {cat.label} ({count})
              </button>
            )
          })}
        </div>

        {search && (
          <p className="text-center text-slate-500 text-xs mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-slate-600 py-16">No concepts match your search.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(concept => (
              <ConceptCard key={concept.id} concept={concept} forceExpanded={expandAll} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
