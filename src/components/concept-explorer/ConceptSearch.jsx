import { useState, useMemo } from 'react';

const CATEGORY_COLORS = {
  foundations: '#6366f1',
  core: '#ec4899',
  spectral: '#f59e0b',
  orthogonality: '#10b981',
  decompositions: '#3b82f6',
  applications: '#ef4444',
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
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search topics…"
          className="w-full bg-gray-800 text-white placeholder-gray-500 rounded px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {CATEGORY_ORDER.map(cat => {
          const items = grouped[cat];
          if (!items?.length) return null;
          return (
            <div key={cat}>
              <div
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest sticky top-0"
                style={{ backgroundColor: CATEGORY_COLORS[cat] + '15', color: CATEGORY_COLORS[cat] }}
              >
                {cat}
              </div>
              {items.map(t => (
                <button
                  key={t.id}
                  onClick={() => onSelect(t)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors border-l-2 ${
                    selected?.id === t.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-750 hover:text-white'
                  }`}
                  style={{
                    borderLeftColor:
                      selected?.id === t.id ? CATEGORY_COLORS[cat] : 'transparent',
                  }}
                >
                  {t.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
