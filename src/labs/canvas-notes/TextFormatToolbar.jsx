const SIZES = [14, 18, 24, 32]

// Formats whichever character range is selected inside a fabric.Textbox
// that's currently being edited — or the whole text, if nothing is
// highlighted. Every button here calls back up to PageCanvas, which is the
// only thing holding a reference to the live fabric object.
export default function TextFormatToolbar({ onToggleBold, onToggleItalic, onChangeColor, onChangeSize }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 w-fit">
      <button onClick={onToggleBold} className="w-7 h-7 font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800">
        B
      </button>
      <button onClick={onToggleItalic} className="w-7 h-7 italic rounded hover:bg-slate-100 dark:hover:bg-slate-800">
        I
      </button>
      <input
        type="color"
        onChange={(e) => onChangeColor(e.target.value)}
        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
      />
      <select
        onChange={(e) => onChangeSize(Number(e.target.value))}
        defaultValue="18"
        className="text-xs rounded border border-slate-200 dark:border-slate-800 bg-transparent px-1 py-0.5"
      >
        {SIZES.map((s) => (
          <option key={s} value={s}>{s}px</option>
        ))}
      </select>
    </div>
  )
}
