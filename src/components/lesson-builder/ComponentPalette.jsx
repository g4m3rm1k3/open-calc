import { PALETTE_BLOCKS } from './builderUtils.js'

export default function ComponentPalette({ onAdd, presentTypes }) {
  return (
    <aside className="w-64 shrink-0 flex flex-col gap-2 sticky top-0 self-start">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
        Add Section
      </p>

      {PALETTE_BLOCKS.map(({ type, label, icon, desc }) => {
        const alreadyPresent = presentTypes.includes(type) && ['intuition', 'math', 'rigor'].includes(type)
        return (
          <button
            key={type}
            onClick={() => onAdd(type)}
            draggable
            onDragStart={e => e.dataTransfer.setData('block-type', type)}
            className={`group flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
              alreadyPresent
                ? 'border-slate-200 dark:border-slate-800 opacity-40 cursor-default'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md cursor-pointer active:scale-95'
            }`}
            title={alreadyPresent ? `${label} is already in the lesson` : desc}
            disabled={alreadyPresent}
          >
            <span className="text-xl leading-none mt-0.5">{icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {label}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5 truncate">{desc}</p>
            </div>
          </button>
        )
      })}

      <div className="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-3 text-center">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Click to append · Drag onto canvas to insert at position
        </p>
      </div>
    </aside>
  )
}
