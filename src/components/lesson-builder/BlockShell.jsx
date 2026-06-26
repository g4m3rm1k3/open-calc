import { useBlockColor } from './BlockColorContext.js'

// Every Tailwind class string must appear literally in the source — no dynamic
// construction — so all possible values are listed here in full.
const THEMES = {
  indigo:  { border: 'border-indigo-200 dark:border-indigo-700',   hover: 'hover:border-indigo-300 dark:hover:border-indigo-600',  header: 'bg-indigo-50 dark:bg-indigo-900/30',   hdrBrd: 'border-indigo-100 dark:border-indigo-800',   label: 'text-indigo-600 dark:text-indigo-400',   dot: 'bg-indigo-400' },
  violet:  { border: 'border-violet-200 dark:border-violet-700',   hover: 'hover:border-violet-300 dark:hover:border-violet-600',  header: 'bg-violet-50 dark:bg-violet-900/30',   hdrBrd: 'border-violet-100 dark:border-violet-800',   label: 'text-violet-600 dark:text-violet-400',   dot: 'bg-violet-400' },
  purple:  { border: 'border-purple-200 dark:border-purple-700',   hover: 'hover:border-purple-300 dark:hover:border-purple-600',  header: 'bg-purple-50 dark:bg-purple-900/30',   hdrBrd: 'border-purple-100 dark:border-purple-800',   label: 'text-purple-600 dark:text-purple-400',   dot: 'bg-purple-400' },
  sky:     { border: 'border-sky-200 dark:border-sky-700',         hover: 'hover:border-sky-300 dark:hover:border-sky-600',        header: 'bg-sky-50 dark:bg-sky-900/30',         hdrBrd: 'border-sky-100 dark:border-sky-800',         label: 'text-sky-600 dark:text-sky-400',         dot: 'bg-sky-400' },
  teal:    { border: 'border-teal-200 dark:border-teal-700',       hover: 'hover:border-teal-300 dark:hover:border-teal-600',      header: 'bg-teal-50 dark:bg-teal-900/30',       hdrBrd: 'border-teal-100 dark:border-teal-800',       label: 'text-teal-600 dark:text-teal-400',       dot: 'bg-teal-400' },
  amber:   { border: 'border-amber-200 dark:border-amber-700',     hover: 'hover:border-amber-300 dark:hover:border-amber-600',    header: 'bg-amber-50 dark:bg-amber-900/30',     hdrBrd: 'border-amber-100 dark:border-amber-800',     label: 'text-amber-600 dark:text-amber-400',     dot: 'bg-amber-400' },
  emerald: { border: 'border-emerald-200 dark:border-emerald-700', hover: 'hover:border-emerald-300 dark:hover:border-emerald-600',header: 'bg-emerald-50 dark:bg-emerald-900/30', hdrBrd: 'border-emerald-100 dark:border-emerald-800', label: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
  orange:  { border: 'border-orange-200 dark:border-orange-700',   hover: 'hover:border-orange-300 dark:hover:border-orange-600',  header: 'bg-orange-50 dark:bg-orange-900/30',   hdrBrd: 'border-orange-100 dark:border-orange-800',   label: 'text-orange-600 dark:text-orange-400',   dot: 'bg-orange-400' },
  cyan:    { border: 'border-cyan-200 dark:border-cyan-700',       hover: 'hover:border-cyan-300 dark:hover:border-cyan-600',      header: 'bg-cyan-50 dark:bg-cyan-900/30',       hdrBrd: 'border-cyan-100 dark:border-cyan-800',       label: 'text-cyan-600 dark:text-cyan-400',       dot: 'bg-cyan-400' },
  pink:    { border: 'border-pink-200 dark:border-pink-700',       hover: 'hover:border-pink-300 dark:hover:border-pink-600',      header: 'bg-pink-50 dark:bg-pink-900/30',       hdrBrd: 'border-pink-100 dark:border-pink-800',       label: 'text-pink-600 dark:text-pink-400',       dot: 'bg-pink-400' },
  lime:    { border: 'border-lime-200 dark:border-lime-700',       hover: 'hover:border-lime-300 dark:hover:border-lime-600',      header: 'bg-lime-50 dark:bg-lime-900/30',       hdrBrd: 'border-lime-100 dark:border-lime-800',       label: 'text-lime-600 dark:text-lime-400',       dot: 'bg-lime-400' },
  green:   { border: 'border-green-200 dark:border-green-700',     hover: 'hover:border-green-300 dark:hover:border-green-600',    header: 'bg-green-50 dark:bg-green-900/30',     hdrBrd: 'border-green-100 dark:border-green-800',     label: 'text-green-600 dark:text-green-400',     dot: 'bg-green-400' },
  rose:    { border: 'border-rose-200 dark:border-rose-700',       hover: 'hover:border-rose-300 dark:hover:border-rose-600',      header: 'bg-rose-50 dark:bg-rose-900/30',       hdrBrd: 'border-rose-100 dark:border-rose-800',       label: 'text-rose-600 dark:text-rose-400',       dot: 'bg-rose-400' },
  fuchsia: { border: 'border-fuchsia-200 dark:border-fuchsia-700', hover: 'hover:border-fuchsia-300 dark:hover:border-fuchsia-600',header: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', hdrBrd: 'border-fuchsia-100 dark:border-fuchsia-800', label: 'text-fuchsia-600 dark:text-fuchsia-400', dot: 'bg-fuchsia-400' },
  yellow:  { border: 'border-yellow-200 dark:border-yellow-700',   hover: 'hover:border-yellow-300 dark:hover:border-yellow-600',  header: 'bg-yellow-50 dark:bg-yellow-900/30',   hdrBrd: 'border-yellow-100 dark:border-yellow-800',   label: 'text-yellow-600 dark:text-yellow-400',   dot: 'bg-yellow-400' },
  blue:    { border: 'border-blue-200 dark:border-blue-700',       hover: 'hover:border-blue-300 dark:hover:border-blue-600',      header: 'bg-blue-50 dark:bg-blue-900/30',       hdrBrd: 'border-blue-100 dark:border-blue-800',       label: 'text-blue-600 dark:text-blue-400',       dot: 'bg-blue-400' },
  red:     { border: 'border-red-200 dark:border-red-700',         hover: 'hover:border-red-300 dark:hover:border-red-600',        header: 'bg-red-50 dark:bg-red-900/30',         hdrBrd: 'border-red-100 dark:border-red-800',         label: 'text-red-600 dark:text-red-400',         dot: 'bg-red-400' },
  slate:   { border: 'border-slate-200 dark:border-slate-600',     hover: 'hover:border-slate-300 dark:hover:border-slate-500',    header: 'bg-slate-100 dark:bg-slate-800/60',    hdrBrd: 'border-slate-200 dark:border-slate-700',     label: 'text-slate-500 dark:text-slate-400',     dot: 'bg-slate-400' },
}

export default function BlockShell({ label, icon, rigid, isEditing, onEdit, index, total, onMoveUp, onMoveDown, onRemove, children }) {
  const colorKey = useBlockColor()
  const t = THEMES[colorKey] ?? THEMES.slate

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-150 ${
        isEditing
          ? 'border-brand-400 shadow-xl shadow-brand-100/40 dark:shadow-brand-900/40'
          : `${t.border} ${t.hover}`
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b ${t.hdrBrd} ${t.header} rounded-t-xl select-none`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />
        <span className="text-sm leading-none">{icon}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
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
              onClick={e => { e.stopPropagation(); onMoveUp?.() }}
              disabled={index === 0}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move up"
            >↑</button>
            <button
              onClick={e => { e.stopPropagation(); onMoveDown?.() }}
              disabled={index >= total - 1}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move down"
            >↓</button>
            <button
              onClick={e => { e.stopPropagation(); onRemove?.() }}
              className="ml-2 px-2 py-1 text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Remove section"
            >✕</button>
          </div>
        )}
      </div>

      {/* Body — click to edit when collapsed */}
      <div
        className={`p-5 ${!isEditing && !rigid ? 'cursor-pointer' : ''}`}
        onClick={!isEditing && !rigid ? e => { e.stopPropagation(); onEdit?.() } : undefined}
      >
        {children}
      </div>
    </div>
  )
}
