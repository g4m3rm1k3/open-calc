import { useState, useMemo } from 'react'

// Discover all course viz components
const ALL_VIZ_PATHS = import.meta.glob('../../../courses/*/viz/*.{jsx,js}')

const VIZ_LIST = Object.keys(ALL_VIZ_PATHS).map(path => {
  const parts = path.split('/')
  const courseId = parts[parts.indexOf('courses') + 1]
  const stem = parts.pop().replace(/\.(jsx|js)$/, '')
  return { id: stem, courseId, path }
})

// Deduplicate by ID — keep one entry per unique viz name
const VIZ_DEDUPED = [...new Map(VIZ_LIST.map(v => [v.id, v])).values()]
  .sort((a, b) => a.id.localeCompare(b.id))

// Additional manually registered vizzes from VizFrame
const EXTRA_VIZZES = [
  { id: 'MiniGolfGame', courseId: 'games' },
  { id: 'FootballCalculus', courseId: 'games' },
  { id: 'CNCLab', courseId: 'labs' },
  { id: 'CNCBackplot', courseId: 'labs' },
  { id: 'GcodeNotebook', courseId: 'labs' },
  { id: 'PLCLadderSim', courseId: 'labs' },
  { id: 'PLCScanCycleViz', courseId: 'labs' },
  { id: 'LogicSim', courseId: 'labs' },
  { id: 'PeriodicTable', courseId: 'labs' },
  { id: 'CardDiceLab', courseId: 'labs' },
]

const ALL_VIZZES = [
  ...VIZ_DEDUPED,
  ...EXTRA_VIZZES.filter(e => !VIZ_DEDUPED.find(v => v.id === e.id)),
]

const COURSE_COLORS = {
  'applied-statistics': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'physics': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'python': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'calculus': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'linear-algebra': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'labs': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  'games': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}
const courseColor = (id) => COURSE_COLORS[id] ?? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'

export default function GalleryMode({ onFork }) {
  const [query, setQuery] = useState('')
  const [course, setCourse] = useState('all')

  const courses = useMemo(() => {
    const ids = [...new Set(ALL_VIZZES.map(v => v.courseId))].sort()
    return ['all', ...ids]
  }, [])

  const filtered = useMemo(() => {
    return ALL_VIZZES.filter(v => {
      const matchQ = !query || v.id.toLowerCase().includes(query.toLowerCase())
      const matchC = course === 'all' || v.courseId === course
      return matchQ && matchC
    })
  }, [query, course])

  return (
    <div className="flex flex-col h-full">
      {/* Search + filter */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 space-y-2 shrink-0">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${ALL_VIZZES.length} vizzes…`}
          className="field text-sm"
        />
        <select
          value={course}
          onChange={e => setCourse(e.target.value)}
          className="field text-sm"
        >
          {courses.map(c => (
            <option key={c} value={c}>{c === 'all' ? `All courses (${ALL_VIZZES.length})` : c}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">No vizzes match "{query}"</p>
        )}
        {filtered.map(viz => (
          <div
            key={viz.id + viz.courseId}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors group cursor-pointer"
            onClick={() => onFork({ vizId: viz.id, title: '', caption: '', props: {} })}
          >
            <span className="text-lg shrink-0">🔭</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{viz.id}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${courseColor(viz.courseId)}`}>
                {viz.courseId}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              Load →
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 shrink-0">
        <p className="text-[10px] text-slate-400">Click any viz to load it in the preview. Switch to Code mode to edit its props.</p>
      </div>
    </div>
  )
}
