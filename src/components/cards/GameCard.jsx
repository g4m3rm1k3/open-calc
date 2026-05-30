import { useRef } from 'react'
import { Link } from 'react-router-dom'

// Dot matrix overlay — arcade / playful feel
const DOTS_OVL = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)',
  backgroundSize: '13px 13px',
}

const GLOW = {
  emerald: 'rgba(16,185,129,0.55)',
  cyan:    'rgba(6,182,212,0.55)',
  fuchsia: 'rgba(217,70,239,0.55)',
  indigo:  'rgba(99,102,241,0.55)',
  violet:  'rgba(139,92,246,0.55)',
  rose:    'rgba(244,63,94,0.55)',
  amber:   'rgba(245,158,11,0.55)',
  teal:    'rgba(20,184,166,0.55)',
  sky:     'rgba(14,165,233,0.55)',
  orange:  'rgba(249,115,22,0.55)',
  purple:  'rgba(168,85,247,0.55)',
  green:   'rgba(34,197,94,0.55)',
}

export default function GameCard({ item }) {
  const ref = useRef(null)
  const { grad, mark, sub } = item.cover
  const glow = `0 0 36px ${GLOW[item.color] ?? 'rgba(100,116,139,0.45)'}`

  const inner = (
    <div
      ref={ref}
      className="group rounded-xl border border-white/10 bg-[#060a14] overflow-hidden transition-all duration-300 hover:border-white/20 hover:scale-[1.025] hover:-translate-y-0.5"
      onMouseEnter={() => { if (ref.current) ref.current.style.boxShadow = glow }}
      onMouseLeave={() => { if (ref.current) ref.current.style.boxShadow = '' }}
    >
      {/* Cover: gradient + dot matrix + large watermark */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${grad}`}>
        <div className="absolute inset-0 pointer-events-none" style={DOTS_OVL} />
        {/* Large bottom-right watermark */}
        <div className="absolute bottom-0 right-2 pointer-events-none select-none leading-none font-black text-white/[0.09] text-[48px] tracking-tight">
          {mark}
        </div>
        {/* Content stacks vertically for more visual presence */}
        <div className="relative px-4 pt-5 pb-4">
          <div className="text-[2rem] leading-none mb-1.5">{item.emoji}</div>
          <h4 className="font-bold text-white text-sm leading-tight">{item.label}</h4>
          <span className="text-white/45 text-[11px]">{sub}</span>
        </div>
      </div>
      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{item.desc}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.map(t => (
              <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.08] text-slate-500">
                {t}
              </span>
            ))}
          </div>
          <span className="text-white/25 text-xs font-bold shrink-0 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all">
            Play →
          </span>
        </div>
      </div>
    </div>
  )

  if (item.event) {
    return (
      <button
        className="block w-full text-left"
        onClick={() => window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: item.event } }))}
      >
        {inner}
      </button>
    )
  }
  return <Link to={item.path} className="block">{inner}</Link>
}
