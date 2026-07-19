const TOOLS = [
  { id: 'select', label: 'Select', icon: '↖' },
  { id: 'pan', label: 'Pan', icon: '✋' },
  { id: 'pen', label: 'Pen', icon: '✎' },
  { id: 'marker', label: 'Marker', icon: '▮' },
  { id: 'eraser', label: 'Eraser', icon: '⌫' },
  { id: 'text', label: 'Text', icon: 'T' },
  { id: 'note', label: 'Note', icon: '▤' },
]

const SWATCHES = ['#1e1e1e', '#e24b4a', '#ef9f27', '#1d9e75', '#378ade', '#7f77dd']

export default function DrawToolbar({ tool, onSelectTool, strokeColor, onSelectColor, strokeWidth, onChangeStrokeWidth }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTool(t.id)}
            title={t.label}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
              tool === t.id
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onSelectColor(c)}
            title={c}
            className={`w-5 h-5 rounded-full border-2 ${strokeColor === c ? 'border-brand-500' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => onSelectColor(e.target.value)}
          className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        Width
        <input
          type="range"
          min="1"
          max="24"
          value={strokeWidth}
          onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
        />
        <span className="w-5 text-right">{strokeWidth}</span>
      </label>
    </div>
  )
}
