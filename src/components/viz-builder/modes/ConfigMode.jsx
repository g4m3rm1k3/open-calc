// Mode A — pick a viz template, fill a form, get live preview

const TEMPLATES = [
  {
    vizId: 'PythonNotebook',
    label: 'Python Notebook',
    icon: '🐍',
    desc: 'Interactive Pyodide notebook with code cells',
    defaultProps: {
      initialCells: [
        { id: 1, cellTitle: 'Introduction', prose: 'Run this cell to get started.', code: 'print("Hello, world!")', output: '', status: 'idle', figureJson: null },
      ],
    },
    fields: [],
    custom: 'notebook',
  },
  {
    vizId: 'SVGDiagram',
    label: 'SVG Diagram',
    icon: '🖼',
    desc: 'Static or animated SVG diagram',
    defaultProps: { src: '', alt: '' },
    fields: [
      { key: 'src', type: 'text', label: 'SVG source URL or inline SVG' },
      { key: 'alt', type: 'text', label: 'Alt text' },
    ],
  },
  {
    vizId: 'VideoEmbed',
    label: 'Video Embed',
    icon: '▶',
    desc: 'Embed a YouTube or Vimeo video',
    defaultProps: { url: '', title: '' },
    fields: [
      { key: 'url', type: 'text', label: 'Video URL' },
      { key: 'title', type: 'text', label: 'Title' },
    ],
  },
  {
    vizId: 'PLCLadderSim',
    label: 'PLC Simulator',
    icon: '⚙',
    desc: 'Ladder logic simulation',
    defaultProps: {},
    fields: [],
  },
  {
    vizId: 'LogicSim',
    label: 'Logic Gate Sim',
    icon: '⊕',
    desc: 'Build and test digital logic circuits',
    defaultProps: {},
    fields: [],
  },
  {
    vizId: 'CNCLab',
    label: 'CNC Simulator',
    icon: '🔧',
    desc: 'G-Code programming and toolpath visualizer',
    defaultProps: {},
    fields: [],
  },
  {
    vizId: 'custom',
    label: 'Custom ID',
    icon: '🔭',
    desc: 'Enter any registered viz ID manually',
    defaultProps: {},
    fields: [{ key: '_customId', type: 'text', label: 'Viz ID' }],
    custom: 'id',
  },
]

function NotebookCellsConfig({ cells, onChange }) {
  const update = (i, upd) => { const next = [...cells]; next[i] = { ...next[i], ...upd }; onChange(next) }
  const remove = i => onChange(cells.filter((_, j) => j !== i))
  const add = () => onChange([...cells, { id: cells.length + 1, cellTitle: '', prose: '', code: '', output: '', status: 'idle', figureJson: null }])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cells</span>
        <button onClick={add} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ Add cell</button>
      </div>
      {cells.map((cell, i) => (
        <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            <input value={cell.cellTitle ?? ''} onChange={e => update(i, { cellTitle: e.target.value })} placeholder="Cell title…" className="field text-sm py-0.5 flex-1" />
            <button onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">✕</button>
          </div>
          <div className="p-3 space-y-2">
            <textarea value={cell.prose ?? ''} onChange={e => update(i, { prose: e.target.value })} rows={2} placeholder="Prose above code…" className="field text-sm resize-none" />
            <textarea value={cell.code ?? ''} onChange={e => update(i, { code: e.target.value })} rows={6} placeholder="Python code…" className="field font-mono text-xs resize-y" spellCheck={false} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ConfigMode({ vizConfig, onChange }) {
  const selected = TEMPLATES.find(t => t.vizId === vizConfig.vizId) ?? null

  const pickTemplate = (tpl) => {
    const resolvedId = tpl.custom === 'id' ? (vizConfig.props?._customId ?? '') : tpl.vizId
    onChange({ vizId: resolvedId, title: vizConfig.title, caption: vizConfig.caption, props: { ...tpl.defaultProps } })
  }

  const updateProp = (key, value) => {
    const newProps = { ...vizConfig.props, [key]: value }
    const newId = key === '_customId' ? value : vizConfig.vizId
    onChange({ ...vizConfig, vizId: newId, props: newProps })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-5">
      {/* Template picker */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Choose a template</p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.vizId}
              onClick={() => pickTemplate(tpl)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                vizConfig.vizId === (tpl.vizId === 'custom' ? (vizConfig.props?._customId ?? '') : tpl.vizId)
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
              }`}
            >
              <div className="text-lg mb-1">{tpl.icon}</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{tpl.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{tpl.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Common meta fields */}
      <div className="space-y-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</span>
          <input value={vizConfig.title ?? ''} onChange={e => onChange({ ...vizConfig, title: e.target.value })} placeholder="e.g. Chapter 3 — Lab Tour" className="field text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Caption</span>
          <input value={vizConfig.caption ?? ''} onChange={e => onChange({ ...vizConfig, caption: e.target.value })} placeholder="Shown below the viz" className="field text-sm" />
        </label>
      </div>

      {/* Template-specific fields */}
      {selected?.custom === 'notebook' && (
        <NotebookCellsConfig
          cells={vizConfig.props?.initialCells ?? []}
          onChange={cells => onChange({ ...vizConfig, props: { ...vizConfig.props, initialCells: cells } })}
        />
      )}

      {selected?.fields?.filter(f => f.key !== '_customId' || selected.custom === 'id').map(field => (
        <label key={field.key} className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
          <input
            value={vizConfig.props?.[field.key] ?? ''}
            onChange={e => updateProp(field.key, e.target.value)}
            className="field text-sm"
          />
        </label>
      ))}
    </div>
  )
}
