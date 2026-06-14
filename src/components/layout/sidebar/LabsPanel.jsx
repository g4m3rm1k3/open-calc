import { Link } from 'react-router-dom'
import { LABS } from '../../../data/labs.js'
import { GLASS_META } from '../../../constants/courseColors.js'

const GRID_OVL = {
  backgroundImage: [
    'repeating-linear-gradient(rgba(255,255,255,0.06) 0 1px, transparent 1px 100%)',
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 100%)',
  ].join(','),
  backgroundSize: '10px 10px',
}

function LabItem({ item, isActive, onClick }) {
  const meta = GLASS_META[item.color] ?? GLASS_META.slate

  const inner = (
    <div className={`group flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl border transition-all ${
      isActive
        ? `${meta.border} bg-white/5 dark:bg-slate-800/80`
        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
    }`}>
      <div className={`relative w-9 h-9 rounded-lg bg-gradient-to-br ${meta.header} flex items-center justify-center text-lg shrink-0 overflow-hidden shadow-sm`}>
        <div className="absolute inset-0 pointer-events-none" style={GRID_OVL} />
        <span className="relative z-10 leading-none">{item.emoji}</span>
      </div>
      <div className="min-w-0">
        <div className={`text-sm font-semibold leading-tight truncate ${meta.text}`}>{item.label}</div>
        {item.tags?.[0] && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono">{item.tags[0]}</div>
        )}
      </div>
    </div>
  )

  if (item.event) {
    return <button className="w-full text-left" onClick={onClick}>{inner}</button>
  }
  return <Link to={item.path} onClick={onClick}>{inner}</Link>
}

export default function LabsPanel({ path, onNavigate }) {
  return (
    <div className="px-3">
      {LABS.map(item => (
        <LabItem
          key={item.key}
          item={item}
          isActive={!!item.path && path === item.path}
          onClick={() => {
            onNavigate()
            if (item.event) window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: item.event } }))
          }}
        />
      ))}
    </div>
  )
}
