import { useState, useMemo } from 'react'
import { VIZ_CATALOG, CATEGORIES } from '../vizCatalog.js'

// Auto-discover every viz file from course packages
const _COURSE_PATHS = import.meta.glob('../../../courses/*/viz/*.{jsx,js}')
const COURSE_VIZZES = Object.keys(_COURSE_PATHS).map(path => {
  const parts = path.split('/')
  const courseId = parts[parts.indexOf('courses') + 1]
  const stem = parts.pop().replace(/\.(jsx|js)$/, '')
  return { id: stem, courseId }
})

// Manually registered lab/game vizzes not in a course viz folder
const EXTRA_VIZZES = [
  { id: 'PythonNotebook', courseId: 'notebooks' },
  { id: 'JSNotebook', courseId: 'notebooks' },
  { id: 'OpenMatNotebook', courseId: 'notebooks' },
  { id: 'MiniGolfGame', courseId: 'games' },
  { id: 'FootballCalculus', courseId: 'games' },
  { id: 'CNCLab', courseId: 'labs' },
  { id: 'PLCLadderSim', courseId: 'labs' },
  { id: 'LogicSim', courseId: 'labs' },
  { id: 'PeriodicTable', courseId: 'labs' },
  { id: 'MoleculeBuilder', courseId: 'labs' },
  { id: 'CardDiceLab', courseId: 'labs' },
]

const ALL_DEDUPED = [
  ...new Map([...COURSE_VIZZES, ...EXTRA_VIZZES].map(v => [v.id, v])).values()
].sort((a, b) => a.id.localeCompare(b.id))

function humanize(id) {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

function courseLabel(courseId) {
  const map = {
    'applied-statistics': 'Statistics',
    'calculus': 'Calculus',
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'cnc': 'CNC',
    'python': 'Python',
    'linear-algebra': 'Lin. Algebra',
    'notebooks': 'Notebooks',
    'games': 'Games',
    'labs': 'Labs',
  }
  return map[courseId] ?? courseId
}

function VizRow({ viz, selected, onSelect }) {
  const catalog = VIZ_CATALOG[viz.id]
  const catKey = catalog?.category
  const catColor = catKey ? CATEGORIES[catKey]?.color : null
  const title = catalog?.title ?? humanize(viz.id)

  return (
    <button
      onClick={() => onSelect(viz.id)}
      className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        selected
          ? 'bg-brand-50 dark:bg-brand-900/25 ring-1 ring-brand-400/60'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <span
        className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full mt-2"
        style={{ background: catColor ?? '#64748b' }}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${selected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {title}
        </p>
        {catalog?.description ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {catalog.description}
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{courseLabel(viz.courseId)}</p>
        )}
      </div>
    </button>
  )
}

export default function VizLibrary({ selectedId, onSelect }) {
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const cats = useMemo(() => {
    const used = new Set(ALL_DEDUPED.map(v => VIZ_CATALOG[v.id]?.category).filter(Boolean))
    return ['all', ...Object.keys(CATEGORIES).filter(k => used.has(k))]
  }, [])

  const filtered = useMemo(() => {
    return ALL_DEDUPED.filter(v => {
      const catalog = VIZ_CATALOG[v.id]
      const title = catalog?.title ?? humanize(v.id)
      const matchQ = !query || title.toLowerCase().includes(query.toLowerCase()) || v.id.toLowerCase().includes(query.toLowerCase())
      const matchCat = catFilter === 'all' || (catalog?.category === catFilter) || (!catalog && catFilter === 'other')
      return matchQ && matchCat
    })
  }, [query, catFilter])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Viz Library</p>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${ALL_DEDUPED.length} vizzes…`}
          className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-400/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />
      </div>

      {/* Category filter pills */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 shrink-0 flex flex-wrap gap-1.5">
        {cats.map(k => {
          const cat = CATEGORIES[k]
          const active = catFilter === k
          return (
            <button
              key={k}
              onClick={() => setCatFilter(k)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                active
                  ? 'text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={active && k !== 'all' ? { background: cat.color } : active ? { background: '#6366f1' } : {}}
            >
              {k === 'all' ? `All` : `${cat.icon} ${cat.label}`}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No vizzes match "{query}"</p>
        ) : (
          filtered.map(v => (
            <VizRow
              key={v.id}
              viz={v}
              selected={selectedId === v.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 shrink-0">
        <p className="text-[10px] text-slate-400">{filtered.length} of {ALL_DEDUPED.length} vizzes</p>
      </div>
    </div>
  )
}
