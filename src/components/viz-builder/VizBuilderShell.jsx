import { useState } from 'react'
import VizLibrary from './panes/VizLibrary.jsx'
import VizLearnPane from './panes/VizLearnPane.jsx'
import VizConfigPane from './panes/VizConfigPane.jsx'

export default function VizBuilderShell() {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* ── Left: Library ─────────────────────── */}
      <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
        <VizLibrary selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* ── Center: Learn (About + Source) ────── */}
      <div className="flex-1 min-w-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
        <VizLearnPane vizId={selectedId} />
      </div>

      {/* ── Right: Live Preview + Props ─────────── */}
      <div className="w-80 shrink-0 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
        <VizConfigPane vizId={selectedId} />
      </div>
    </div>
  )
}
