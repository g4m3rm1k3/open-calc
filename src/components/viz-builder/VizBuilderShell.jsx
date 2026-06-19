import { useState } from 'react'
import ConfigMode from './modes/ConfigMode.jsx'
import NodeGraphMode from './modes/NodeGraphMode.jsx'
import CodeMode from './modes/CodeMode.jsx'
import GalleryMode from './modes/GalleryMode.jsx'
import VizPreview from './VizPreview.jsx'

const MODES = [
  { id: 'config',    label: 'Configure', icon: '⚙',  desc: 'Pick a template and fill a form' },
  { id: 'nodegraph', label: 'Node Graph', icon: '⬤→', desc: 'Wire data and render nodes together' },
  { id: 'code',      label: 'Code',      icon: '</>',  desc: 'Edit the JSON config directly' },
  { id: 'gallery',   label: 'Gallery',   icon: '🔭',  desc: 'Browse & fork 760+ existing vizzes' },
]

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }
  return (
    <button onClick={copy} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
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
  // ... your existing content ...
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Viz object (paste into visualizations[ ])</span>
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

export default function VizBuilderShell() {
  const [mode, setMode] = useState('config')
  const [vizConfig, setVizConfig] = useState({ vizId: '', title: '', caption: '', props: {} })
  const [showExport, setShowExport] = useState(false)
  const [graphOutputs, setGraphOutputs] = useState([])

  const isNodeGraph = mode === 'nodegraph'
  const hasViz = vizConfig.vizId || isNodeGraph

  const handleGalleryFork = (config) => {
    setVizConfig(config)
    setMode('code')
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Mode selector bar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-3">Mode</span>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            title={m.desc}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === m.id
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
        {/* Left panel — mode content */}
        {!isNodeGraph && (
          <div className="w-96 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            {mode === 'config'   && <ConfigMode vizConfig={vizConfig} onChange={setVizConfig} />}
            {mode === 'code'     && <CodeMode vizConfig={vizConfig} onChange={setVizConfig} />}
            {mode === 'gallery'  && <GalleryMode onFork={handleGalleryFork} />}
          </div>
        )}

        {/* Center/Right — preview or node graph */}
        {isNodeGraph ? (
          <div className="flex-1 min-w-0">
            <NodeGraphMode onGraphOutput={setGraphOutputs} />
          </div>
        ) : (
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-900">
            <VizPreview vizId={vizConfig.vizId} title={vizConfig.title} props={vizConfig.props} />
          </div>
        )}
      </div>

      {showExport && (
        <ExportPanel
          vizConfig={isNodeGraph ? { vizId: 'custom-graph', title: 'Node Graph Output', props: { outputs: graphOutputs } } : vizConfig}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
