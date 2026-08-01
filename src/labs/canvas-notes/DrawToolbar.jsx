import { useRef } from 'react'
import { useThemeColors } from '../../hooks/useThemeColors.js'

const DRAW_TOOLS = [
  { id: 'select',  label: 'Select (V)',   icon: '↖',  title: 'Select & move (V)' },
  { id: 'pan',     label: 'Pan (H)',      icon: '✋',  title: 'Pan / drag canvas (H)' },
]
const INK_TOOLS = [
  { id: 'pen',     label: 'Pen (P)',      icon: '✎',  title: 'Freehand pen (P)' },
  { id: 'marker',  label: 'Marker (M)',   icon: '▊',  title: 'Highlighter marker (M)' },
  { id: 'eraser',  label: 'Eraser (E)',   icon: '⌫',  title: 'Eraser (E)' },
]
const CONTENT_TOOLS = [
  { id: 'text',    label: 'Text (T)',     icon: 'T',  title: 'Text box (T)' },
  { id: 'note',    label: 'Note (N)',     icon: '▤',  title: 'Markdown note (N)' },
]
const SHAPE_TOOLS = [
  { id: 'rect',    label: 'Rectangle (R)', icon: '▭', title: 'Rectangle (R)' },
  { id: 'ellipse', label: 'Ellipse (O)',   icon: '⬭', title: 'Ellipse (O)' },
  { id: 'line',    label: 'Line (L)',      icon: '╱', title: 'Line (L)' },
  { id: 'arrow',   label: 'Arrow (A)',     icon: '→', title: 'Arrow (A)' },
]

const BG_STYLES = ['blank', 'ruled', 'grid']
const BG_ICONS  = { blank: '⬜', ruled: '≡', grid: '⊞' }
const BG_LABELS = { blank: 'Blank', ruled: 'Ruled lines', grid: 'Grid' }

export default function DrawToolbar({
  tool,
  onSelectTool,
  strokeColor,
  onSelectColor,
  strokeWidth,
  onChangeStrokeWidth,
  // undo / redo
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  // zoom
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  // background
  bgStyle,
  onCycleBg,
  // export
  onExportPNG,
  onExportNotebook,
  onImportNotebook,
}) {
  const C = useThemeColors()
  const importInputRef = useRef(null)

  const SWATCHES = [
    C.canvasText,
    '#e24b4a',
    '#ef9f27',
    '#1d9e75',
    '#378ade',
    '#7f77dd',
  ]

  const Btn = ({ onClick, disabled, title, active, children, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-7 flex items-center justify-center rounded text-sm transition-colors shrink-0 ${
        active
          ? 'bg-brand-500 text-white shadow-sm'
          : disabled
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
      } ${className}`}
    >
      {children}
    </button>
  )

  const Divider = () => (
    <div className="w-px self-stretch bg-slate-200 dark:bg-slate-700 shrink-0 mx-0.5" />
  )

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto">

      {/* Undo / Redo */}
      <Btn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="w-7">↺</Btn>
      <Btn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="w-7">↻</Btn>

      <Divider />

      {/* Navigate tools */}
      {DRAW_TOOLS.map((t) => (
        <Btn key={t.id} onClick={() => onSelectTool(t.id)} active={tool === t.id} title={t.title} className="w-7">
          {t.icon}
        </Btn>
      ))}

      <Divider />

      {/* Ink tools */}
      {INK_TOOLS.map((t) => (
        <Btn key={t.id} onClick={() => onSelectTool(t.id)} active={tool === t.id} title={t.title} className="w-7">
          {t.icon}
        </Btn>
      ))}

      <Divider />

      {/* Content tools */}
      {CONTENT_TOOLS.map((t) => (
        <Btn key={t.id} onClick={() => onSelectTool(t.id)} active={tool === t.id} title={t.title} className="w-7">
          {t.icon}
        </Btn>
      ))}

      <Divider />

      {/* Shape tools */}
      {SHAPE_TOOLS.map((t) => (
        <Btn key={t.id} onClick={() => onSelectTool(t.id)} active={tool === t.id} title={t.title} className="w-7">
          {t.icon}
        </Btn>
      ))}

      <Divider />

      {/* Color swatches */}
      <div className="flex items-center gap-0.5 shrink-0">
        {SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onSelectColor(c)}
            title={c}
            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
              strokeColor === c ? 'border-brand-500 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => onSelectColor(e.target.value)}
          title="Custom color"
          className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
        />
      </div>

      {/* Stroke width */}
      <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
        <span className="hidden sm:block">Width</span>
        <input
          type="range"
          min="1"
          max="24"
          value={strokeWidth}
          onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
          className="w-20"
        />
        <span className="w-4 text-right tabular-nums">{strokeWidth}</span>
      </label>

      <Divider />

      {/* Background style toggle */}
      <Btn
        onClick={onCycleBg}
        title={`Background: ${BG_LABELS[bgStyle]} — click to cycle (blank → ruled → grid)`}
        className="px-2 gap-1 text-xs"
      >
        <span>{BG_ICONS[bgStyle]}</span>
      </Btn>

      <Divider />

      {/* Zoom controls */}
      <Btn onClick={onZoomOut} title="Zoom out (Ctrl+−)" className="w-7">−</Btn>
      <button
        onClick={onZoomReset}
        title="Reset zoom to 100% (Ctrl+0)"
        className="px-2 h-7 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded tabular-nums min-w-[3.5rem] text-center"
      >
        {zoom ?? 100}%
      </button>
      <Btn onClick={onZoomIn} title="Zoom in (Ctrl+=)" className="w-7">+</Btn>

      <Divider />

      {/* Export controls */}
      <Btn onClick={onExportPNG} title="Export current page as PNG" className="px-1.5 text-xs gap-1">
        <span>📷</span>
      </Btn>
      <Btn onClick={onExportNotebook} title="Export notebook as JSON backup" className="px-1.5 text-xs gap-1">
        <span>💾</span>
      </Btn>
      <Btn
        onClick={() => importInputRef.current?.click()}
        title="Import notebook from JSON backup"
        className="px-1.5 text-xs gap-1"
      >
        <span>📂</span>
      </Btn>

      {/* Hidden file input for import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImportNotebook?.(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
