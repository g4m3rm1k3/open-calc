import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CalendarEvent } from './types'
import { EVENT_COLORS } from './types'

interface ToastItem {
  id: string
  event: CalendarEvent
  body: string
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: Event) => {
      const { event, body } = (e as CustomEvent<{ event: CalendarEvent; body: string }>).detail
      const toastId = `${event.id}-${Date.now()}`

      setToasts(prev => {
        // Max 4 visible at once — drop the oldest
        const next = [...prev.slice(-3), { id: toastId, event, body }]
        return next
      })

      // Auto-dismiss after 8 s
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId))
      }, 8_000)
    }

    window.addEventListener('oc-notification', handler)
    return () => window.removeEventListener('oc-notification', handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-14 right-3 z-[3000] flex flex-col gap-2 w-72 pointer-events-none">
      {toasts.map(toast => {
        const color = toast.event.color ?? EVENT_COLORS[toast.event.type]
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex gap-3 items-start bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 animate-slide-in"
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
              style={{ backgroundColor: color + '22' }}
            >
              🔔
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {toast.event.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {toast.body}
              </p>
              <button
                type="button"
                onClick={() => navigate('/calendar')}
                className="text-[11px] font-semibold mt-1"
                style={{ color }}
              >
                Open calendar →
              </button>
            </div>

            {/* Dismiss */}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 text-base leading-none shrink-0 mt-0.5"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
