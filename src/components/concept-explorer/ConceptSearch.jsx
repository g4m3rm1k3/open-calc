import { useState, useMemo } from 'react';
import { CATEGORY_STYLES } from './categoryStyles.js';

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
            className="w-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-2.5 pl-10 text-[13px] border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-400/30 dark:focus:ring-indigo-500/30 transition-all shadow-inner"
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
          const c = CATEGORY_STYLES[cat] || CATEGORY_STYLES.foundations;
          return (
            <div key={cat} className="mb-3">
              <div className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest sticky top-0 backdrop-blur-md z-10 border-y border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-slate-900/90 ${c.text}`}>
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
                          ? `${c.pill}`
                          : `text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200`
                      }`}
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
