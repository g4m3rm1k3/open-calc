import { useState, useEffect, Component, Suspense } from 'react'
import { lazy } from 'react'
import { VIZ_CATALOG } from '../vizCatalog.js'

const _COURSE_VIZZES = import.meta.glob('../../../courses/*/viz/*.{jsx,js}')
const _VIZ_REGISTRY_LAZY = Object.fromEntries(
  Object.entries(_COURSE_VIZZES).map(([path, loader]) => {
    const stem = path.split('/').pop().replace(/\.(jsx|js)$/, '')
    return [stem, lazy(loader)]
  })
)

Object.assign(_VIZ_REGISTRY_LAZY, {
  PythonNotebook:       lazy(() => import('../../../components/notebooks/PythonNotebook.jsx')),
  JSNotebook:           lazy(() => import('../../../components/notebooks/JSNotebook.jsx')),
  OpenMatNotebook:      lazy(() => import('../../../components/notebooks/OpenMatNotebook.jsx')),
  MiniGolfGame:         lazy(() => import('../../../games/golf/MiniGolfGame.jsx')),
  FootballCalculus:     lazy(() => import('../../../games/football/FootballCalculus.jsx')),
  CNCLab:               lazy(() => import('../../../labs/cnc-sim/cnc/CNCLab.jsx')),
  PLCLadderSim:         lazy(() => import('../../../labs/plc-lab/plc/PLCLadderSim.jsx')),
  LogicSim:             lazy(() => import('../../../labs/logic-sim/LogicSim.jsx')),
  PeriodicTable:        lazy(() => import('../../../labs/chemistry/PeriodicTable.jsx')),
  MoleculeBuilder:      lazy(() => import('../../../labs/chemistry/MoleculeBuilder.jsx')),
  LinearInterpolationViz: lazy(() => import('../../../labs/cnc-sim/cnc/LinearInterpolationViz.jsx')),
  SVGDiagram:           lazy(() => import('../../../courses/calculus/viz/SVGDiagram.jsx')),
})

class VizErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center p-6 gap-2 text-center">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Render error</p>
          <p className="text-xs text-red-500 font-mono">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

function inferControl(key, val) {
  if (typeof val === 'boolean') return { type: 'toggle' }
  if (typeof val === 'number') return { type: 'number' }
  if (typeof val === 'string' && /^#/.test(val)) return { type: 'color' }
  if (typeof val === 'string' && ['xs','sm','md','lg','xl'].includes(val)) return { type: 'select', options: ['xs','sm','md','lg','xl'] }
  if (typeof val === 'string') return { type: 'text' }
  if (Array.isArray(val)) return { type: 'json' }
  return { type: 'json' }
}

function PropControl({ propKey, value, onChange }) {
  const ctrl = inferControl(propKey, value)

  if (ctrl.type === 'toggle') {
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{propKey}</span>
        <button
          onClick={() => onChange(!value)}
          className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>
      </div>
    )
  }

  if (ctrl.type === 'color') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex-1">{propKey}</span>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-7 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
        />
        <span className="text-xs font-mono text-slate-400 w-16">{value}</span>
      </div>
    )
  }

  if (ctrl.type === 'number') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex-1">{propKey}</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-24 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-brand-400 text-slate-700 dark:text-slate-200"
        />
      </div>
    )
  }

  if (ctrl.type === 'select') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex-1">{propKey}</span>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200"
        >
          {ctrl.options.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    )
  }

  if (ctrl.type === 'json') {
    const str = JSON.stringify(value, null, 2)
    return (
      <div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block mb-1">{propKey}</span>
        <textarea
          rows={4}
          defaultValue={str}
          onBlur={e => { try { onChange(JSON.parse(e.target.value)) } catch {} }}
          className="w-full px-2 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-brand-400 text-slate-700 dark:text-slate-200 resize-y"
        />
      </div>
    )
  }

  // text
  return (
    <div>
      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block mb-1">{propKey}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-brand-400 text-slate-700 dark:text-slate-200"
      />
    </div>
  )
}

function CopyButton({ text, label = 'Copy snippet' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

function SaveButton({ vizId, params }) {
  const [saved, setSaved] = useState(false)
  const save = () => {
    const key = 'vizbuilder-collection'
    const coll = JSON.parse(localStorage.getItem(key) ?? '[]')
    const entry = { vizId, params, savedAt: Date.now() }
    const idx = coll.findIndex(e => e.vizId === vizId)
    if (idx >= 0) coll[idx] = entry; else coll.push(entry)
    localStorage.setItem(key, JSON.stringify(coll))
    setSaved(true); setTimeout(() => setSaved(false), 1800)
  }
  return (
    <button
      onClick={save}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
    >
      {saved ? '✓ Saved' : '+ Save'}
    </button>
  )
}

export default function VizConfigPane({ vizId, onCustomize }) {
  const catalog = VIZ_CATALOG[vizId]
  const defaultProps = catalog?.defaultProps ?? {}

  const [params, setParams] = useState(defaultProps)

  // Reset params when viz changes
  useEffect(() => {
    setParams(catalog?.defaultProps ?? {})
  }, [vizId])

  const VizComponent = vizId ? _VIZ_REGISTRY_LAZY[vizId] : null

  const snippet = `{
  id: '${vizId}',
  title: '${catalog?.title ?? vizId}',
  props: ${JSON.stringify(params, null, 2)},
}`

  if (!vizId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="text-4xl opacity-20">▶</span>
        <p className="text-sm text-slate-400">Preview will appear here</p>
      </div>
    )
  }

  const hasCatalogProps = catalog?.defaultProps && Object.keys(catalog.defaultProps).length > 0
  const hasParams = Object.keys(params).length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Live preview */}
      <div className="shrink-0 h-[42%] border-b border-slate-200 dark:border-slate-700 overflow-auto bg-white dark:bg-slate-900">
        {VizComponent ? (
          <VizErrorBoundary key={vizId}>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full" />
              </div>
            }>
              <VizComponent params={params} onParamChange={setParams} />
            </Suspense>
          </VizErrorBoundary>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-400 font-mono">ID not in registry: {vizId}</p>
          </div>
        )}
      </div>

      {/* Props + export */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Customize CTA */}
        {onCustomize && (
          <button
            onClick={() => onCustomize(vizId, params)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <span>⚙</span> Customize in Build mode →
          </button>
        )}

        {/* Prop controls */}
        {hasParams && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Props</p>
            <div className="space-y-3">
              {Object.entries(params).map(([k, v]) => (
                <PropControl
                  key={k}
                  propKey={k}
                  value={v}
                  onChange={val => setParams(prev => ({ ...prev, [k]: val }))}
                />
              ))}
            </div>
          </div>
        )}

        {!hasCatalogProps && !hasParams && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              This viz takes no configurable props — it manages its own state internally. You can still copy the snippet below to use it in a lesson.
            </p>
          </div>
        )}

        {/* Snippet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson snippet</p>
            <div className="flex gap-1.5">
              <SaveButton vizId={vizId} params={params} />
              <CopyButton text={snippet} />
            </div>
          </div>
          <pre className="text-[11px] font-mono bg-slate-950 text-green-300 rounded-xl p-3 overflow-x-auto leading-relaxed">{snippet}</pre>
        </div>

        {/* Reset */}
        {hasParams && (
          <button
            onClick={() => setParams(defaultProps)}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1 transition-colors"
          >
            Reset props to defaults
          </button>
        )}
      </div>
    </div>
  )
}
