import { useEffect } from 'react'
import AppCard from '../components/ui/AppCard.jsx'

export default function GridPage({ title, Background, badge, badgeIcon: Icon, headline, subline, sparkleLabel, items, cardVariant, extraProps }) {
  useEffect(() => {
    document.title = `${title} — UpSkillOS`
    return () => { document.title = 'UpSkillOS' }
  }, [title])

  return (
    <div className="relative min-h-[calc(100vh-9rem)] text-white">
      <Background />
      <div className="relative z-10 mx-auto max-w-5xl pt-6 sm:pt-10">
        <div className="mb-10 max-w-3xl">
          {badge && (
            <div className={`mb-5 inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 text-xs font-black uppercase tracking-[0.22em] backdrop-blur-md ${badge.className}`}>
              {Icon && <Icon className="h-4 w-4" />}
              {badge.label}
            </div>
          )}
          <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-6xl">{headline}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-100/76 sm:text-lg">{subline}</p>
        </div>
        {sparkleLabel && (
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-100/80">
            <span>✦</span>
            <span>{sparkleLabel}</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <AppCard key={item.key} item={item} variant={cardVariant} {...(extraProps?.(item) ?? {})} />
          ))}
        </div>
      </div>
    </div>
  )
}
