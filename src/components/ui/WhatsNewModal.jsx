import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { WHATS_NEW, getLatestWhatsNewId } from '../../data/whatsNew.js'
import { TOUR_SEEN_KEY } from '../../context/TourContext.jsx'

const SEEN_KEY = 'oc-whatsnew-last-seen'

// Shown to returning visitors when a release-notes entry has been added
// since their last visit — not on every visit, and never for first-time
// visitors (they get Delta's tour instead, see TourContext/TourSpotlight).
export default function WhatsNewModal() {
  const location = useLocation()
  const [visible, setVisible] = useState(() => {
    const isFirstVisit = !localStorage.getItem(TOUR_SEEN_KEY)
    if (isFirstVisit) return false
    return localStorage.getItem(SEEN_KEY) !== getLatestWhatsNewId()
  })

  // The Lesson Builder has its own first-visit tour — don't stack two.
  if (!visible || WHATS_NEW.length === 0 || location.pathname.startsWith('/lesson-builder')) return null

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, getLatestWhatsNewId())
    setVisible(false)
  }

  const latest = WHATS_NEW[0]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={dismiss}>
      <div
        className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
          What's new
        </p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{latest.title}</h2>
        <ul className="space-y-2 mb-6">
          {latest.items.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex gap-2">
              <span className="text-brand-500 dark:text-brand-400 shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
        <button
          onClick={dismiss}
          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
