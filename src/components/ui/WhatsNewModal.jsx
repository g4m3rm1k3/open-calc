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
        className="relative max-w-md w-full max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="px-6 pt-6 pb-3 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
            What's new
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{latest.title}</h2>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 flex-1 min-h-0">
          <ul className="space-y-2 pb-4">
            {latest.items.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex gap-2">
                <span className="text-brand-500 dark:text-brand-400 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
          {latest.discord && (
            <a
              href={latest.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700/40 text-sky-700 dark:text-sky-300 text-sm font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>🎮</span>
              <span>Join the Discord community →</span>
            </a>
          )}
        </div>

        {/* Fixed footer */}
        <div className="px-6 pb-6 pt-3 shrink-0">
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
