import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppCard from './AppCard.jsx'
import ItemInfoModal from './ItemInfoModal.jsx'
import { getAllCourses, getChapters } from '../../courses/courseLoader.js'
import { LABS } from '../../labs/registry.js'
import { GAMES } from '../../games/registry.js'
import { usePinLauncher } from '../../hooks/usePinLauncher.js'
import { useProgress } from '../../hooks/useProgress.js'
import { GLASS_META } from '../../styles/courseColors.js'

const ALL_COURSES = getAllCourses()

function PremiumHeaderBackground({ meta }) {
  return (
    <>
      <div className={`absolute inset-0 opacity-[0.15] dark:opacity-[0.25] bg-gradient-to-br ${meta.header} mix-blend-multiply dark:mix-blend-screen pointer-events-none group-hover/fieldset:opacity-[0.25] dark:group-hover/fieldset:opacity-[0.35] transition-opacity duration-300`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover/fieldset:opacity-100 transform -translate-x-full group-hover/fieldset:translate-x-full transition-all duration-700 pointer-events-none" />
    </>
  )
}

// Resolves one curated { kind, key, differentiator } entry into real,
// live display data from the registry that actually owns it — this file
// never duplicates label/emoji/color/tags, only the curated differentiator.
function resolveEntry(entry) {
  if (entry.kind === 'course') {
    const meta = ALL_COURSES.find(c => c.key === entry.key)
    if (!meta) return null
    return {
      kind: 'course',
      badgeKind: 'course',
      key: entry.key,
      label: meta.label,
      emoji: meta.icon,
      differentiator: entry.differentiator,
      cardItem: { ...meta, description: entry.differentiator ?? meta.description },
      chapters: getChapters(entry.key),
      path: meta.path,
    }
  }
  const registry = entry.kind === 'lab' ? LABS : entry.kind === 'game' ? GAMES : null
  if (!registry) return null
  const reg = registry.find(r => r.key === entry.key)
  if (!reg) return null
  return {
    kind: entry.kind,
    // Labs carry their own kind (lab/lesson/builder/visualizer) — surface
    // that on the badge instead of the generic registry-selector kind.
    badgeKind: entry.kind === 'lab' ? (reg.kind ?? 'lab') : entry.kind,
    key: entry.key,
    label: reg.label,
    emoji: reg.emoji,
    differentiator: entry.differentiator,
    cardItem: { ...reg, desc: entry.differentiator ?? reg.desc },
    path: reg.path,
    event: reg.event,
    color: reg.color,
  }
}

const TINT = {
  teal: 'bg-teal-50/50 dark:bg-teal-950/10 border-teal-200/70 dark:border-teal-500/25',
  slate: 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/70 dark:border-slate-700/50',
}

const KIND_LABEL = { course: 'COURSE', lesson: 'LESSON', lab: 'LAB', builder: 'BUILDER', visualizer: 'VISUALIZER', game: 'GAME' }

// (SubGroup removed for flat grid rendering)

export default function TopicTable({ group, query, matchItem }) {
  const { getLessonStatus } = useProgress()
  const { openPin } = usePinLauncher()
  const navigate = useNavigate()
  const [openItem, setOpenItem] = useState(null)

  const resolved = group.items.map(resolveEntry).filter(Boolean)
  const filtered = query ? resolved.filter((r) => matchItem(r.cardItem, query)) : resolved

  const courses = filtered.filter((r) => r.kind === 'course')
  const labs = filtered.filter((r) => r.kind === 'lab')
  const games = filtered.filter((r) => r.kind === 'game')

  function launch(entry) {
    setOpenItem(null)
    if (entry.kind === 'course') {
      navigate(entry.path)
      return
    }
    const pin = {
      id: entry.key,
      label: entry.label,
      emoji: entry.emoji,
      type: entry.kind,
      path: entry.path,
      event: entry.event,
      color: entry.color,
      ...(entry.kind === 'lab' ? { labKey: entry.key } : { gameKey: entry.key }),
    }
    openPin(pin)
  }

  const groupMeta = filtered.length > 0 ? (GLASS_META[filtered[0].cardItem.color] ?? GLASS_META.slate) : GLASS_META.slate;

  return (
    <fieldset className={`rounded-[32px] border-[2px] ${groupMeta.border.replace('/30', '/40')} px-6 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-2 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-2xl relative shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.2)] min-w-0 z-10`}>
      
      {/* Subtle Background Glow for the Table Container */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${groupMeta.header} rounded-full blur-[100px] opacity-[0.15] dark:opacity-[0.25] pointer-events-none`} />

      <legend className={`px-4 mx-2 sm:mx-4 text-3xl font-black tracking-tight bg-gradient-to-r ${groupMeta.header} bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]`}>
        {group.label}
      </legend>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-4">No matches for "{query}" in {group.label}.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-10 mt-2">
          {filtered.map((r) => {
            const meta = GLASS_META[r.cardItem.color] ?? GLASS_META.slate;
            return (
              <div
                key={`${r.kind}-${r.key}`}
                onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setOpenItem(r) }}
                className="h-[110px] cursor-pointer min-w-0"
              >
                <fieldset
                  className={`h-full min-w-0 w-full border-[2px] ${meta.border} bg-white/80 dark:bg-[#0b0f19]/95 backdrop-blur-2xl rounded-[20px] transition-all duration-300 hover:-translate-y-1 group/fieldset relative z-10 overflow-hidden`}
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                  onMouseEnter={(e) => { if (document.documentElement.classList.contains('dark')) e.currentTarget.style.boxShadow = meta.glow }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)' }}
                >
                  <legend className={`px-2 mx-4 text-[10px] font-black uppercase tracking-wider ${meta.text} relative z-20 bg-[#f8fafc] dark:bg-[#0b0f19] rounded-full`}>
                    {KIND_LABEL[r.badgeKind] ?? r.badgeKind.toUpperCase()}
                  </legend>

                  {/* Wrap content in a rounded overflow-hidden container to clip PremiumHeaderBackground */}
                  <div className="absolute inset-0 z-0 overflow-hidden rounded-[18px] pointer-events-none">
                    <PremiumHeaderBackground meta={meta} />
                    <div className={`absolute right-[-10px] top-1/2 -translate-y-1/2 pointer-events-none select-none leading-none font-black text-[80px] tracking-tighter opacity-[0.06] dark:opacity-[0.12] ${meta.text}`}>
                      {r.cardItem.cover?.mark || r.cardItem.icon || r.cardItem.emoji}
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center h-full px-4 pb-2 pt-0 min-w-0">
                    <span className="text-[2.5rem] leading-none filter drop-shadow-sm transition-transform duration-300 group-hover/fieldset:scale-110 mr-3">
                      {r.cardItem.icon || r.cardItem.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-extrabold text-[15px] leading-tight drop-shadow-sm tracking-tight ${meta.text} truncate`}>
                        {r.cardItem.label}
                      </h4>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium block truncate mt-1">
                        {r.cardItem.description || r.cardItem.desc}
                      </span>
                    </div>
                  </div>
                </fieldset>
              </div>
            )
          })}
        </div>
      )}

      <ItemInfoModal item={openItem} onClose={() => setOpenItem(null)} onLaunch={() => launch(openItem)} getLessonStatus={getLessonStatus} />
    </fieldset>
  )
}
