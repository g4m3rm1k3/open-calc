import { useState, useEffect } from 'react'
import { lazy, Suspense } from 'react'
import { VIZ_CATALOG, CATEGORIES } from '../vizCatalog.js'

const Editor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

// Discover source files as raw text strings
const _RAW_SOURCES = import.meta.glob('../../../courses/*/viz/*.{jsx,js}', { query: '?raw', import: 'default' })

// Map stem → raw loader
const SOURCE_MAP = {}
for (const [path, loader] of Object.entries(_RAW_SOURCES)) {
  const stem = path.split('/').pop().replace(/\.(jsx|js)$/, '')
  if (!SOURCE_MAP[stem]) SOURCE_MAP[stem] = loader
}

// Fixed vizzes — map id → path for extra registered ones
const EXTRA_RAW = {
  PythonNotebook:       () => import('../../../components/notebooks/PythonNotebook.jsx?raw'),
  JSNotebook:           () => import('../../../components/notebooks/JSNotebook.jsx?raw'),
  OpenMatNotebook:      () => import('../../../components/notebooks/OpenMatNotebook.jsx?raw'),
  PLCLadderSim:         () => import('../../../labs/plc-lab/plc/PLCLadderSim.jsx?raw'),
  LogicSim:             () => import('../../../labs/logic-sim/LogicSim.jsx?raw'),
  PeriodicTable:        () => import('../../../labs/chemistry/PeriodicTable.jsx?raw'),
  MoleculeBuilder:      () => import('../../../labs/chemistry/MoleculeBuilder.jsx?raw'),
  CNCLab:               () => import('../../../labs/cnc-sim/cnc/CNCLab.jsx?raw'),
  LinearInterpolationViz: () => import('../../../labs/cnc-sim/cnc/LinearInterpolationViz.jsx?raw'),
  MiniGolfGame:         () => import('../../../games/golf/MiniGolfGame.jsx?raw'),
  FootballCalculus:     () => import('../../../games/football/FootballCalculus.jsx?raw'),
}

function humanize(id) {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

function ConceptPill({ label, color }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: color + '22', color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

function AboutTab({ vizId }) {
  const catalog = VIZ_CATALOG[vizId]
  const title = catalog?.title ?? humanize(vizId)
  const catKey = catalog?.category
  const cat = catKey ? CATEGORIES[catKey] : null

  if (!catalog) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
        <span className="text-4xl opacity-30">🔭</span>
        <p className="font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          No catalog entry yet. This viz works in lessons — add it to{' '}
          <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[11px]">vizCatalog.js</code> to show docs here.
        </p>
        <p className="text-[10px] text-slate-400 mt-2">Check the Source tab to see the component code.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* Title + category */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          {cat && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: cat.color + '22', color: cat.color }}
            >
              {cat.icon} {cat.label}
            </span>
          )}
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">{title}</h2>
      </div>

      {/* Description */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">What it is</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{catalog.description}</p>
      </div>

      {/* What you learn */}
      {catalog.whatYouLearn && (
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1.5">What you'll learn</p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">{catalog.whatYouLearn}</p>
        </div>
      )}

      {/* Concepts */}
      {catalog.concepts?.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Concepts</p>
          <div className="flex flex-wrap gap-2">
            {catalog.concepts.map(c => (
              <ConceptPill key={c} label={c} color={cat?.color ?? '#6366f1'} />
            ))}
          </div>
        </div>
      )}

      {/* How to use */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">How to use in a lesson</p>
        <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{`intuition: {
  visualizations: [
    {
      id: '${vizId}',
      title: '${title}',
    }
  ]
}`}</pre>
      </div>
    </div>
  )
}

function SourceTab({ vizId }) {
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    setLoading(true)
    setErr(null)
    setSource(null)

    const loader = SOURCE_MAP[vizId] ?? EXTRA_RAW[vizId]
    if (!loader) {
      setErr('Source not found — this viz may be dynamically constructed or not yet indexed.')
      setLoading(false)
      return
    }

    loader().then(mod => {
      const raw = typeof mod === 'string' ? mod : (mod?.default ?? null)
      if (raw == null) { setErr('Could not load source.'); setLoading(false); return }
      setSource(raw)
      setLoading(false)
    }).catch(e => {
      setErr(e.message ?? 'Failed to load source')
      setLoading(false)
    })
  }, [vizId])

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (err) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <span className="text-3xl">📄</span>
          <p className="text-sm text-slate-500 mt-3">{err}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full" />
        </div>
      }>
        <Editor
          height="100%"
          language="javascript"
          value={source}
          theme={dark ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'off',
            folding: true,
            renderLineHighlight: 'line',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </Suspense>
    </div>
  )
}

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'source', label: 'Source' },
]

export default function VizLearnPane({ vizId }) {
  const [tab, setTab] = useState('about')

  if (!vizId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
        <span className="text-6xl opacity-20">←</span>
        <p className="text-sm font-semibold text-slate-400">Select a viz from the library</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Browse the library on the left, pick a viz, and you'll see its docs here and a live preview on the right.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-700 shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab === t.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab body */}
      {tab === 'about'  && <AboutTab vizId={vizId} />}
      {tab === 'source' && <SourceTab vizId={vizId} />}
    </div>
  )
}
