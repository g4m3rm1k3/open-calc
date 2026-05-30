import { useRef } from 'react'
import { Link } from 'react-router-dom'

// Blueprint grid overlay — reinforces the "technical tool" identity
const GRID_OVL = {
  backgroundImage: [
    'repeating-linear-gradient(rgba(255,255,255,0.04) 0 1px, transparent 1px 100%)',
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 100%)',
  ].join(','),
  backgroundSize: '22px 22px',
}

const GLOW = {
  indigo:  'rgba(99,102,241,0.55)',
  amber:   'rgba(245,158,11,0.55)',
  violet:  'rgba(139,92,246,0.55)',
  cyan:    'rgba(6,182,212,0.55)',
  fuchsia: 'rgba(217,70,239,0.55)',
  slate:   'rgba(100,116,139,0.45)',
  emerald: 'rgba(16,185,129,0.55)',
}

export default function LabCard({ item }) {
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
      {/* Cover: gradient + blueprint grid + watermark */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${grad}`}>
        <div className="absolute inset-0 pointer-events-none" style={GRID_OVL} />
        {/* Watermark symbol */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none select-none leading-none font-black text-white/[0.07] text-[52px] tracking-tighter">
          {mark}
        </div>
        {/* Content */}
        <div className="relative flex items-center gap-3.5 px-4 py-4">
          <span className="text-[2rem] leading-none">{item.emoji}</span>
          <div>
            <h4 className="font-bold text-white text-sm leading-tight">{item.label}</h4>
            <span className="text-white/45 text-[11px] font-mono">{sub}</span>
          </div>
          <span className="ml-auto text-white/25 text-xs font-bold group-hover:text-white/80 group-hover:translate-x-0.5 transition-all shrink-0">
            Launch →
          </span>
        </div>
      </div>
      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{item.desc}</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.map(t => (
            <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.08] text-slate-500">
              {t}
            </span>
          ))}
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
