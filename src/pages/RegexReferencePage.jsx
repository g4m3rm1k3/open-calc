import { useState, useMemo } from 'react'
import katex from 'katex'
import { REGEX_CATEGORIES, ALL_REGEX_CONCEPTS } from '../reference/regex-reference-data.js'
import RegexDemo from '../components/concept-explorer/RegexDemo.jsx'

const COLOR_CLASSES = {
  orange:  { tab: 'bg-orange-500 text-white',  tabInactive: 'text-orange-400 hover:bg-orange-900/30', cover: 'from-orange-500 via-orange-600 to-red-700',    border: 'border-orange-700/40', glow: '0 0 40px rgba(249,115,22,0.25)'  },
  cyan:    { tab: 'bg-cyan-600 text-white',    tabInactive: 'text-cyan-400 hover:bg-cyan-900/30',     cover: 'from-cyan-500 via-sky-600 to-blue-700',        border: 'border-cyan-700/40',   glow: '0 0 40px rgba(6,182,212,0.25)'   },
  rose:    { tab: 'bg-rose-600 text-white',    tabInactive: 'text-rose-400 hover:bg-rose-900/30',     cover: 'from-rose-500 via-rose-600 to-pink-800',       border: 'border-rose-700/40',   glow: '0 0 40px rgba(244,63,94,0.25)'   },
  violet:  { tab: 'bg-violet-600 text-white',  tabInactive: 'text-violet-400 hover:bg-violet-900/30', cover: 'from-violet-600 via-violet-700 to-purple-900', border: 'border-violet-700/40', glow: '0 0 40px rgba(139,92,246,0.25)'  },
  emerald: { tab: 'bg-emerald-600 text-white', tabInactive: 'text-emerald-400 hover:bg-emerald-900/30', cover: 'from-emerald-500 via-emerald-600 to-teal-800', border: 'border-emerald-700/40', glow: '0 0 40px rgba(16,185,129,0.25)'  },
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
  const c = COLOR_CLASSES[concept.color] ?? COLOR_CLASSES.cyan

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
          {(concept.formal || concept.example) && (
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
                  <p className="text-slate-300 text-[13px] leading-relaxed">{concept.example}</p>
                </Section>
              )}
            </div>
          )}

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

          {/* Live demo — same RegexDemo used by the Concept Explorer, in place
              of linear-algebra-data.js's "Open in OpenMAT" runnable code block:
              regex has no separate lab to hand code off to, so the demo is
              just inline and self-contained. */}
          {concept.demo && (
            <Section label="Try It" color="text-emerald-400/70">
              <RegexDemo topic={concept} />
            </Section>
          )}

        </div>
      )}
    </div>
  )
}

export default function RegexReferencePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandAll, setExpandAll] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = activeCategory === 'all'
      ? ALL_REGEX_CONCEPTS
      : ALL_REGEX_CONCEPTS.filter(c => c.category === activeCategory)
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
          <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-700/40 rounded-full px-4 py-1.5 mb-4">
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Syntax · Engine · History</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="text-white">Regular </span>
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 bg-clip-text text-transparent">Expressions</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {ALL_REGEX_CONCEPTS.length} concepts. Plain English first, then formal, then a live pattern to try. Click any card to expand.
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
                focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition-all"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setExpandAll(e => !e)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              expandAll
                ? 'bg-red-600 border-red-500 text-white'
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
            All ({ALL_REGEX_CONCEPTS.length})
          </button>
          {REGEX_CATEGORIES.map(cat => {
            const c = COLOR_CLASSES[cat.color]
            const count = ALL_REGEX_CONCEPTS.filter(x => x.category === cat.id).length
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
