import { Suspense, useState } from 'react'
import { SCENE_REGISTRY, SCENE_META } from '../components/eng-math/scenes/index.js'

const ALL_IDS = Object.keys(SCENE_REGISTRY)

function SceneCard({ id, fullscreen, onClick }) {
  const Scene = SCENE_REGISTRY[id]
  const meta = SCENE_META[id] ?? { label: id }

  return (
    <div
      className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
      onClick={() => onClick(id)}
    >
      <div className="relative bg-slate-950" style={{ height: fullscreen ? '100%' : 220 }}>
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        }>
          <Scene key={id} />
        </Suspense>
      </div>
      {!fullscreen && (
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 leading-none mb-0.5">
            {id}
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            {meta.label}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SceneSandboxPage() {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(null)

  const filtered = ALL_IDS.filter(id =>
    id.toLowerCase().includes(search.toLowerCase()) ||
    (SCENE_META[id]?.label ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      {/* Full-screen overlay */}
      {focused && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col"
          onClick={() => setFocused(null)}
        >
          <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">{focused}</div>
              <div className="text-sm font-semibold text-white">{SCENE_META[focused]?.label}</div>
            </div>
            <button
              onClick={() => setFocused(null)}
              className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              ✕ Close
            </button>
          </div>
          <div
            className="flex-1 relative"
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const Scene = SCENE_REGISTRY[focused]
              return (
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  </div>
                }>
                  <Scene key={focused + '-full'} />
                </Suspense>
              )
            })()}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scene Sandbox</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {ALL_IDS.length} scenes — click any to view full screen
            </p>
          </div>
          <input
            type="search"
            placeholder="Filter scenes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-56 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(id => (
            <SceneCard key={id} id={id} onClick={setFocused} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            No scenes match "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
