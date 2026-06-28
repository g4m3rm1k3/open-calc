import { useState, useMemo } from 'react';

const CATEGORY_STYLES = {
  foundations: { 
    color: 'text-blue-700 dark:text-blue-400', 
    bg: 'bg-blue-100 dark:bg-blue-900/20', 
    border: 'border-blue-300 dark:border-blue-500/50', 
    hover: 'hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-500/40 dark:hover:bg-blue-900/30',
    selectedBg: 'bg-white dark:bg-[#13131f]',
    selectedBorder: 'border-blue-400 dark:border-blue-500/50',
    glowColor: 'rgba(59,130,246,0.1)'
  },
  core: { 
    color: 'text-cyan-700 dark:text-cyan-400', 
    bg: 'bg-cyan-100 dark:bg-cyan-900/20', 
    border: 'border-cyan-300 dark:border-cyan-500/50', 
    hover: 'hover:border-cyan-300 hover:bg-cyan-50 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-900/30',
    selectedBg: 'bg-white dark:bg-[#13131f]',
    selectedBorder: 'border-cyan-400 dark:border-cyan-500/50',
    glowColor: 'rgba(6,182,212,0.1)'
  },
  spectral: { 
    color: 'text-purple-700 dark:text-purple-400', 
    bg: 'bg-purple-100 dark:bg-purple-900/20', 
    border: 'border-purple-300 dark:border-purple-500/50', 
    hover: 'hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-500/40 dark:hover:bg-purple-900/30',
    selectedBg: 'bg-white dark:bg-[#13131f]',
    selectedBorder: 'border-purple-400 dark:border-purple-500/50',
    glowColor: 'rgba(168,85,247,0.1)'
  },
  orthogonality: { 
    color: 'text-emerald-700 dark:text-emerald-400', 
    bg: 'bg-emerald-100 dark:bg-emerald-900/20', 
    border: 'border-emerald-300 dark:border-emerald-500/50', 
    hover: 'hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-900/30',
    selectedBg: 'bg-white dark:bg-[#13131f]',
    selectedBorder: 'border-emerald-400 dark:border-emerald-500/50',
    glowColor: 'rgba(16,185,129,0.1)'
  },
  decompositions: { 
    color: 'text-orange-700 dark:text-orange-400', 
    bg: 'bg-orange-100 dark:bg-orange-900/20', 
    border: 'border-orange-300 dark:border-orange-500/50', 
    hover: 'hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-500/40 dark:hover:bg-orange-900/30',
    selectedBg: 'bg-white dark:bg-[#13131f]',
    selectedBorder: 'border-orange-400 dark:border-orange-500/50',
    glowColor: 'rgba(249,115,22,0.1)'
  },
  applications: { 
    color: 'text-rose-700 dark:text-rose-400', 
    bg: 'bg-rose-100 dark:bg-rose-900/20', 
    border: 'border-rose-300 dark:border-rose-500/50', 
    hover: 'hover:border-rose-300 hover:bg-rose-50 dark:hover:border-rose-500/40 dark:hover:bg-rose-900/30',
    selectedBg: 'bg-white dark:bg-[#13131f]',
    selectedBorder: 'border-rose-400 dark:border-rose-500/50',
    glowColor: 'rgba(244,63,94,0.1)'
  },
};

const CATEGORY_ORDER = ['foundations', 'core', 'spectral', 'orthogonality', 'decompositions', 'applications'];

export default function ConceptSearch({ topics, onSelect, selected }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return topics.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [topics, query]);

  const grouped = useMemo(() => {
    const groups = {};
    CATEGORY_ORDER.forEach(c => { groups[c] = []; });
    filtered.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search concepts…"
            className="w-full bg-slate-100 dark:bg-[#12121f]/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-2.5 pl-10 text-[13px] border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-400/30 dark:focus:ring-indigo-500/30 transition-all shadow-inner"
          />
          <svg className="absolute left-3.5 top-[11px] w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
        {CATEGORY_ORDER.map(cat => {
          const items = grouped[cat];
          if (!items?.length) return null;
          const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.foundations;
          return (
            <div key={cat} className="mb-3">
              <div className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest sticky top-0 backdrop-blur-md z-10 border-y border-slate-200 dark:border-white/5 ${style.bg} ${style.color}`}>
                {cat}
              </div>
              <div className="flex flex-col mt-1 px-3">
                {items.map(t => {
                  const isSelected = selected?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelect(t)}
                      className={`text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-all mx-1 my-0.5 border ${
                        isSelected
                          ? `${style.selectedBg} ${style.color} shadow-sm ${style.selectedBorder}`
                          : `text-slate-600 dark:text-slate-400 border-transparent ${style.hover} hover:text-slate-900 dark:hover:text-slate-200`
                      }`}
                      style={isSelected ? { boxShadow: `0 0 15px ${style.glowColor}` } : {}}
                    >
                      {t.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
