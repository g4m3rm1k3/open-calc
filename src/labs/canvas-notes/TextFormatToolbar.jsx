const SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]
const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Sans-serif', value: 'Arial, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: '"Courier New", monospace' },
]

// Formats whichever character range is selected inside a fabric.Textbox
// that's currently being edited — or the whole text, if nothing is
// highlighted. Every button here calls back up to PageCanvas, which is the
// only thing holding a reference to the live fabric object.
export default function TextFormatToolbar({
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrike,
  onChangeColor,
  onChangeSize,
  onChangeFont,
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-sm w-fit text-xs">
      {/* Bold */}
      <button
        onClick={onToggleBold}
        title="Bold (Ctrl+B)"
        className="w-7 h-7 font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      >
        B
      </button>

      {/* Italic */}
      <button
        onClick={onToggleItalic}
        title="Italic (Ctrl+I)"
        className="w-7 h-7 italic rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      >
        I
      </button>

      {/* Underline */}
      <button
        onClick={onToggleUnderline}
        title="Underline (Ctrl+U)"
        className="w-7 h-7 underline rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      >
        U
      </button>

      {/* Strikethrough */}
      <button
        onClick={onToggleStrike}
        title="Strikethrough"
        className="w-7 h-7 line-through rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      >
        S
      </button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Text color */}
      <input
        type="color"
        onChange={(e) => onChangeColor(e.target.value)}
        title="Text color"
        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
      />

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Font family */}
      <select
        onChange={(e) => onChangeFont(e.target.value)}
        defaultValue=""
        title="Font family"
        className="text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 px-1 py-0.5 cursor-pointer"
      >
        {FONTS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Font size */}
      <select
        onChange={(e) => onChangeSize(Number(e.target.value))}
        defaultValue="18"
        title="Font size"
        className="text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 px-1 py-0.5 cursor-pointer"
      >
        {SIZES.map((s) => (
          <option key={s} value={s}>
            {s}px
          </option>
        ))}
      </select>
    </div>
  )
}
