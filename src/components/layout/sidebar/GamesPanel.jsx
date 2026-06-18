import { Link } from 'react-router-dom'
import { GAMES } from '../../../games/registry.js'
import { GLASS_META } from '../../../styles/courseColors.js'

const DOTS_OVL = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
  backgroundSize: '8px 8px',
}

function GameItem({ item, isActive, onClick }) {
  const meta = GLASS_META[item.color] ?? GLASS_META.slate

  const inner = (
    <div className={`group flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl border transition-all ${
      isActive
        ? `${meta.border} bg-white/5 dark:bg-slate-800/80`
        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
    }`}>
      <div className={`relative w-9 h-9 rounded-lg bg-gradient-to-br ${meta.header} flex items-center justify-center text-lg shrink-0 overflow-hidden shadow-sm`}>
        <div className="absolute inset-0 pointer-events-none" style={DOTS_OVL} />
        <span className="relative z-10 leading-none">{item.emoji}</span>
      </div>
      <div className="min-w-0">
        <div className={`text-sm font-semibold leading-tight truncate ${meta.text}`}>{item.label}</div>
        {item.tags?.[0] && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{item.tags[0]}</div>
        )}
      </div>
    </div>
  )

  if (item.event) {
    return <button className="w-full text-left" onClick={onClick}>{inner}</button>
  }
  return <Link to={item.path} onClick={onClick}>{inner}</Link>
}

export default function GamesPanel({ path, onNavigate }) {
  return (
    <div className="px-3">
      {GAMES.map(item => (
        <GameItem
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
