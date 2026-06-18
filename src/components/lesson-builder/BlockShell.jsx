export default function BlockShell({ label, icon, rigid, isEditing, onEdit, index, total, onMoveUp, onMoveDown, onRemove, children }) {
  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-150 ${
        isEditing
          ? 'border-brand-400 shadow-xl shadow-brand-100/40 dark:shadow-brand-900/40'
          : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-900'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 rounded-t-xl select-none">
        <span className="text-sm leading-none">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </span>
        {rigid && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600 ml-1">
            Required
          </span>
        )}
        {isEditing && (
          <span className="text-[10px] font-semibold text-brand-500 ml-1">● Editing</span>
        )}

        {!rigid && (
          <div className="ml-auto flex items-center gap-0.5">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move up"
            >↑</button>
            <button
              onClick={onMoveDown}
              disabled={index >= total - 1}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move down"
            >↓</button>
            <button
              onClick={onRemove}
              className="ml-2 px-2 py-1 text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Remove section"
            >✕</button>
          </div>
        )}
      </div>

      {/* Body — click to edit when not editing */}
      <div
        className={`p-5 ${!isEditing && !rigid ? 'cursor-pointer' : ''}`}
        onClick={!isEditing && !rigid ? onEdit : undefined}
      >
        {children}
      </div>
    </div>
  )
}
