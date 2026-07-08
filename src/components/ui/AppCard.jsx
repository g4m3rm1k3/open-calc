import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { GLASS_META } from '../../styles/courseColors.js'
import { buildProgressKey } from '../../context/progressMigration.ts'

const GRID_OVL = {
  backgroundImage: [
    'repeating-linear-gradient(rgba(255,255,255,0.04) 0 1px, transparent 1px 100%)',
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 100%)',
  ].join(','),
  backgroundSize: '22px 22px',
}

const DOTS_OVL = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)',
  backgroundSize: '13px 13px',
}

const GRID_TEXTURE = 'repeating-linear-gradient(0deg,transparent,transparent 11px,rgba(255,255,255,0.8) 11px,rgba(255,255,255,0.8) 12px),repeating-linear-gradient(90deg,transparent,transparent 11px,rgba(255,255,255,0.8) 11px,rgba(255,255,255,0.8) 12px)'

const TAG = 'text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.08] text-slate-500'

function LabHeader({ item }) {
  const { grad, mark, sub } = item.cover
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${grad}`}>
      <div className="absolute inset-0 pointer-events-none" style={GRID_OVL} />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none select-none leading-none font-black text-white/[0.07] text-[52px] tracking-tighter">{mark}</div>
      <div className="relative flex items-center gap-3.5 px-4 py-4">
        <span className="text-[2rem] leading-none">{item.emoji}</span>
        <div>
          <h4 className="font-bold text-white text-sm leading-tight">{item.label}</h4>
          <span className="text-white/45 text-[11px] font-mono">{sub}</span>
        </div>
        <span className="ml-auto text-white/25 text-xs shrink-0 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all">Launch →</span>
      </div>
    </div>
  )
}

function GameHeader({ item }) {
  const { grad, mark, sub } = item.cover
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${grad}`}>
      <div className="absolute inset-0 pointer-events-none" style={DOTS_OVL} />
      <div className="absolute bottom-0 right-2 pointer-events-none select-none leading-none font-black text-white/[0.09] text-[48px] tracking-tight">{mark}</div>
      <div className="relative px-4 pt-5 pb-4">
        <div className="text-[2rem] leading-none mb-1.5">{item.emoji}</div>
        <h4 className="font-bold text-white text-sm leading-tight">{item.label}</h4>
        <span className="text-white/45 text-[11px]">{sub}</span>
      </div>
    </div>
  )
}

function LabBody({ item }) {
  return (
    <div className="bg-white/80 dark:bg-transparent px-4 py-3">
      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{item.desc}</p>
      <div className="flex flex-wrap gap-1">
        {item.tags.map(t => <span key={t} className={TAG}>{t}</span>)}
      </div>
    </div>
  )
}

function GameBody({ item }) {
  return (
    <div className="bg-white/80 dark:bg-transparent px-4 py-3">
      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{item.desc}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {item.tags.map(t => <span key={t} className={TAG}>{t}</span>)}
        </div>
        <span className="text-slate-400 dark:text-white/25 text-xs font-bold shrink-0 group-hover:text-slate-800 dark:group-hover:text-white/80 group-hover:translate-x-0.5 transition-all">Play →</span>
      </div>
    </div>
  )
}

function CourseCard({ item, chapters, getLessonStatus, meta, ref }) {
  const total = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
  const done  = chapters.reduce((s, ch) =>
    s + ch.lessons.filter(l => getLessonStatus(buildProgressKey(item.key, l), 1) === 'complete').length, 0)
  const pct = total > 0 ? done / total : 0
  return (
    <div ref={ref} className="group flex flex-col overflow-hidden rounded-[24px] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-[#0b0f19]/80 backdrop-blur-2xl transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-2">
      <div className={`relative bg-gradient-to-br ${meta.header} px-5 pt-5 pb-5 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.055] pointer-events-none" style={{ backgroundImage: GRID_TEXTURE }} />
        <div className="relative">
          <div className="text-3xl font-black text-white/65 mb-2 font-mono leading-none tracking-tight">{item.icon}</div>
          <div className="font-bold text-[17px] text-white leading-tight drop-shadow">{item.label}</div>
        </div>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-black/30 via-black/10 to-black/30" />
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0d0d18] px-4 pt-4 pb-4"
        style={{ boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.02)' }}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug flex-1 mb-3">{item.description}</p>
        <div className="mb-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5">
            <span>{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}{total > 0 && ` · ${total} lessons`}</span>
            {done > 0 && <span className={`font-bold ${meta.text}`}>{Math.round(pct * 100)}%</span>}
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${meta.header} transition-all`}
              style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : '0%' }} />
          </div>
        </div>
        <div className="flex justify-end mt-1">
          <span className={`text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 ${meta.text}`}>
            {pct > 0 ? 'Continue →' : 'Start →'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AppCard({ item, variant = 'course', chapters, getLessonStatus }) {
  const ref = useRef(null)
  const meta = GLASS_META[item.color] ?? GLASS_META.slate

  if (variant === 'course') {
    return (
      <Link
        ref={ref}
        to={item.path}
        className="block"
        onMouseEnter={() => { if (ref.current) ref.current.style.boxShadow = meta.glow }}
        onMouseLeave={() => { if (ref.current) ref.current.style.boxShadow = '' }}
      >
        <CourseCard item={item} chapters={chapters} getLessonStatus={getLessonStatus} meta={meta} />
      </Link>
    )
  }

  const inner = (
    <div
      ref={ref}
      className="group rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-[#0b0f19]/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white dark:hover:border-white/20 hover:scale-[1.025] hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-none"
      onMouseEnter={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = meta.glow }}
      onMouseLeave={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = '' }}
    >
      {variant === 'lab'  && <LabHeader item={item} />}
      {variant === 'game' && <GameHeader item={item} />}
      {variant === 'lab'  && <LabBody item={item} />}
      {variant === 'game' && <GameBody item={item} />}
    </div>
  )

  if (item.event) {
    return (
      <button className="block w-full text-left"
        onClick={() => window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: item.event } }))}>
        {inner}
      </button>
    )
  }
  return <Link to={item.path} className="block">{inner}</Link>
}
