import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { GLASS_META } from '../../styles/courseColors.js'
import { buildProgressKey } from '../../context/progressMigration.ts'

const TAG = 'text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'

function PremiumHeaderBackground({ grad }) {
  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-[0.85] dark:opacity-100`} />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/30 blur-[30px] rounded-full pointer-events-none mix-blend-overlay" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/20 blur-[30px] rounded-full pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none" />
    </>
  )
}

function LabHeader({ item }) {
  const { grad, mark, sub } = item.cover
  return (
    <div className="relative overflow-hidden">
      <PremiumHeaderBackground grad={grad} />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none select-none leading-none font-black text-white/[0.07] text-[64px] tracking-tighter">{mark}</div>
      <div className="relative flex items-center gap-4 px-5 py-5 z-10">
        <span className="text-[2.5rem] leading-none filter drop-shadow-md">{item.emoji}</span>
        <div>
          <h4 className="font-extrabold text-white text-[17px] leading-tight drop-shadow-sm tracking-tight">{item.label}</h4>
          <span className="text-white/70 text-[12px] font-mono font-medium">{sub}</span>
        </div>
        <span className="ml-auto text-white/50 text-xs font-bold uppercase shrink-0 group-hover:text-white group-hover:translate-x-0.5 transition-all">Launch →</span>
      </div>
    </div>
  )
}

function GameHeader({ item }) {
  const { grad, mark, sub } = item.cover
  return (
    <div className="relative overflow-hidden">
      <PremiumHeaderBackground grad={grad} />
      <div className="absolute bottom-0 right-2 pointer-events-none select-none leading-none font-black text-white/[0.09] text-[56px] tracking-tight">{mark}</div>
      <div className="relative px-5 pt-6 pb-5 z-10">
        <div className="text-[2.5rem] leading-none mb-3 filter drop-shadow-md">{item.emoji}</div>
        <h4 className="font-extrabold text-white text-[17px] leading-tight drop-shadow-sm tracking-tight">{item.label}</h4>
        <span className="text-white/70 text-[12px] font-medium">{sub}</span>
      </div>
    </div>
  )
}

function LabBody({ item }) {
  return (
    <div className="bg-white/90 dark:bg-transparent px-5 py-4 flex-1 flex flex-col">
      <p className="text-slate-600 dark:text-slate-300 text-[13px] leading-relaxed mb-4 line-clamp-2 flex-1">{item.desc}</p>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {item.tags.map(t => <span key={t} className={TAG}>{t}</span>)}
      </div>
    </div>
  )
}

function GameBody({ item }) {
  return (
    <div className="bg-white/90 dark:bg-transparent px-5 py-4 flex-1 flex flex-col">
      <p className="text-slate-600 dark:text-slate-300 text-[13px] leading-relaxed mb-4 line-clamp-2 flex-1">{item.desc}</p>
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(t => <span key={t} className={TAG}>{t}</span>)}
        </div>
        <span className="text-slate-400 dark:text-white/30 text-[11px] uppercase tracking-wide font-black shrink-0 group-hover:text-slate-800 dark:group-hover:text-white/90 group-hover:translate-x-0.5 transition-all">Play →</span>
      </div>
    </div>
  )
}

function CourseCard({ item, chapters, getLessonStatus, meta, innerRef }) {
  const total = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
  const done  = chapters.reduce((s, ch) =>
    s + ch.lessons.filter(l => getLessonStatus(buildProgressKey(item.key, l), 1) === 'complete').length, 0)
  const pct = total > 0 ? done / total : 0
  
  return (
    <div ref={innerRef} className="flex flex-col h-full overflow-hidden rounded-[24px] border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-[#0b0f19]/80 backdrop-blur-2xl transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] group-hover:-translate-y-2">
      
      {/* Sleek Header */}
      <div className="relative px-5 pt-6 pb-6 overflow-hidden">
        <PremiumHeaderBackground grad={meta.header} />
        
        {/* Large faded background icon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none leading-none text-[100px] opacity-[0.12] -mr-4 drop-shadow-lg filter mix-blend-overlay">
          {item.icon}
        </div>

        <div className="relative z-10">
          <div className="text-4xl mb-3 font-mono leading-none tracking-tight filter drop-shadow-md">{item.icon}</div>
          <div className="font-extrabold text-[19px] text-white leading-tight tracking-tight drop-shadow-sm">{item.label}</div>
        </div>
      </div>
      
      {/* Body */}
      <div className="flex-1 flex flex-col bg-white/80 dark:bg-[#0d0d18]/50 px-5 pt-5 pb-5 relative">
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed flex-1 mb-6">{item.description}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Progress</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}{total > 0 && ` · ${total} lessons`}</span>
            </div>
            {done > 0 && <span className={`font-black text-sm ${meta.text}`}>{Math.round(pct * 100)}%</span>}
          </div>
          
          {/* Themed Progress Bar */}
          <div className={`h-2 rounded-full relative overflow-hidden ${meta.text}`}>
            <div className="absolute inset-0 bg-current opacity-[0.15] dark:opacity-[0.2]" />
            <div className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${meta.header} transition-all duration-700 ease-out`}
              style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : '0%', boxShadow: pct > 0 ? meta.glow.replace('32px', '16px').replace('0.50', '0.6') : 'none' }} />
          </div>
          
          <div className="flex justify-end mt-2 h-4">
            <span className={`text-[11px] uppercase tracking-wider font-black opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0 ${meta.text}`}>
              {pct > 0 ? 'Continue →' : 'Start →'}
            </span>
          </div>
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
        to={item.path}
        className="group block h-full"
        onMouseEnter={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = meta.glow }}
        onMouseLeave={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = '' }}
      >
        <CourseCard innerRef={ref} item={item} chapters={chapters} getLessonStatus={getLessonStatus} meta={meta} />
      </Link>
    )
  }

  const inner = (
    <div
      ref={ref}
      className="group flex flex-col h-full overflow-hidden rounded-[24px] border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-[#0b0f19]/80 backdrop-blur-2xl transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-2 cursor-pointer"
      onMouseEnter={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = GLASS_META.indigo.glow }}
      onMouseLeave={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = '' }}
    >
      {variant === 'lab' ? <LabHeader item={item} /> : <GameHeader item={item} />}
      {variant === 'lab' ? <LabBody item={item} /> : <GameBody item={item} />}
    </div>
  )

  return item.path ? <Link to={item.path} className="block h-full">{inner}</Link> : inner
}
