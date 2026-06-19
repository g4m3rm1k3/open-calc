import { useState } from 'react'
import VizLibrary from './panes/VizLibrary.jsx'
import VizLearnPane from './panes/VizLearnPane.jsx'
import VizConfigPane from './panes/VizConfigPane.jsx'
import ConfigMode from './modes/ConfigMode.jsx'
import CodeMode from './modes/CodeMode.jsx'
import NodeGraphMode from './modes/NodeGraphMode.jsx'
import VizPreview from './VizPreview.jsx'

// ── Export panel ────────────────────────────────────────────────────────────
function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

function ExportPanel({ vizConfig, onClose }) {
  const vizObj = `{
  id: '${vizConfig.vizId}',${vizConfig.title ? `\n  title: '${vizConfig.title}',` : ''}${vizConfig.caption ? `\n  caption: '${vizConfig.caption}',` : ''}
  props: ${JSON.stringify(vizConfig.props ?? {}, null, 4).replace(/^/gm, '  ').trim()},
}`
  const sectionSnippet = `intuition: {
  visualizations: [
    ${vizObj}
  ],
},`
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <span className="text-lg">📋</span>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Export Viz</h2>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Viz object</span>
              <CopyButton text={vizObj} label="Copy viz" />
            </div>
            <pre className="text-xs font-mono bg-slate-950 text-green-300 rounded-xl p-4 overflow-x-auto">{vizObj}</pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full section snippet</span>
              <CopyButton text={sectionSnippet} label="Copy snippet" />
            </div>
            <pre className="text-xs font-mono bg-slate-950 text-slate-300 rounded-xl p-4 overflow-x-auto">{sectionSnippet}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Build sub-modes ─────────────────────────────────────────────────────────
const BUILD_MODES = [
  { id: 'configure', label: 'Configure', icon: '⚙', desc: 'Pick a template and fill in the details' },
  { id: 'code',      label: 'JSON',      icon: '</>', desc: 'Edit the config directly as JSON' },
]

function BuildMode({ initialConfig, onExport }) {
  const [subMode, setSubMode] = useState('configure')
  const [vizConfig, setVizConfig] = useState(
    initialConfig ?? { vizId: '', title: '', caption: '', props: {} }
  )
  const [showExport, setShowExport] = useState(false)
  const hasViz = !!vizConfig.vizId

  return (
    <div className="flex flex-col h-full">
      {/* Sub-mode bar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Build</span>
        {BUILD_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setSubMode(m.id)}
            title={m.desc}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subMode === m.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-sm leading-none">{m.icon}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button
          disabled={!hasViz}
          onClick={() => setShowExport(true)}
          className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          Export ↗
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: config panel */}
        <div className="w-96 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
          {subMode === 'configure' && <ConfigMode vizConfig={vizConfig} onChange={setVizConfig} />}
          {subMode === 'code'      && <CodeMode   vizConfig={vizConfig} onChange={setVizConfig} />}
        </div>

        {/* Right: live preview */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-900">
          <VizPreview vizId={vizConfig.vizId} title={vizConfig.title} props={vizConfig.props} />
        </div>
      </div>

      {showExport && <ExportPanel vizConfig={vizConfig} onClose={() => setShowExport(false)} />}
    </div>
  )
}

function NodeGraphMode_Shell() {
  const [outputs, setOutputs] = useState([])
  const [showExport, setShowExport] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Node Graph</span>
        <div className="flex-1" />
        <button
          disabled={outputs.length === 0}
          onClick={() => setShowExport(true)}
          className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors"
        >
          Export ↗
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <NodeGraphMode onGraphOutput={setOutputs} />
      </div>
      {showExport && (
        <ExportPanel
          vizConfig={{ vizId: 'custom-graph', title: 'Node Graph Output', props: { outputs } }}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

// ── Top-level shell ─────────────────────────────────────────────────────────
const TOP_MODES = [
  { id: 'browse',    label: 'Browse & Preview', icon: '🔭' },
  { id: 'build',     label: 'Build Custom',     icon: '⚙' },
  { id: 'nodegraph', label: 'Node Graph',        icon: '⬤→' },
]

export default function VizBuilderShell() {
  const [topMode, setTopMode] = useState('browse')
  // When user hits "Customize →" in Browse, carry the viz into Build mode
  const [buildSeed, setBuildSeed] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const handleCustomize = (vizId, props) => {
    setBuildSeed({ vizId, title: '', caption: '', props: props ?? {} })
    setTopMode('build')
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* ── Top mode bar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
        {TOP_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setTopMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              topMode === m.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-sm leading-none">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        {topMode === 'browse' && (
          <p className="text-[10px] text-slate-400 hidden md:block">
            Select a viz to learn about it, see its source, and copy or customize it
          </p>
        )}
      </div>

      {/* ── Mode bodies ────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {/* BROWSE — 3-pane */}
        {topMode === 'browse' && (
          <div className="flex h-full">
            <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
              <VizLibrary selectedId={selectedId} onSelect={setSelectedId} />
            </div>
            <div className="flex-1 min-w-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
              <VizLearnPane vizId={selectedId} />
            </div>
            <div className="w-80 shrink-0 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
              <VizConfigPane vizId={selectedId} onCustomize={handleCustomize} />
            </div>
          </div>
        )}

        {/* BUILD — configure + JSON editor + live preview */}
        {topMode === 'build' && (
          <BuildMode key={buildSeed?.vizId ?? 'build'} initialConfig={buildSeed} />
        )}

        {/* NODE GRAPH */}
        {topMode === 'nodegraph' && <NodeGraphMode_Shell />}
      </div>
    </div>
  )
}
