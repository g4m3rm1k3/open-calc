import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function getTodayEventCount() {
  try {
    const raw = localStorage.getItem('oc-calendar')
    if (!raw) return 0
    const store = JSON.parse(raw)
    const today = new Date()
    return (store.events ?? []).filter(ev => {
      const start = new Date(ev.start)
      return start.getFullYear() === today.getFullYear() &&
        start.getMonth() === today.getMonth() &&
        start.getDate() === today.getDate()
    }).length
  } catch {
    return 0
  }
}

export default function NavClock() {
  const [time, setTime] = useState(new Date())
  const [todayCount, setTodayCount] = useState(() => getTodayEventCount())
  const [hasNew, setHasNew] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Refresh badge when calendar data changes
  useEffect(() => {
    const refresh = () => setTodayCount(getTodayEventCount())
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  // Pulse the badge whenever a notification fires
  useEffect(() => {
    const handler = () => {
      setHasNew(true)
      setTodayCount(getTodayEventCount())
    }
    window.addEventListener('oc-notification', handler)
    return () => window.removeEventListener('oc-notification', handler)
  }, [])

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <button
      onClick={() => { navigate('/calendar'); setHasNew(false) }}
      title="Open Calendar"
      className="relative flex flex-col items-end leading-none select-none cursor-pointer hover:opacity-75 transition-opacity"
    >
      <span className="text-[12px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">{timeStr}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{dateStr}</span>

      {/* Badge — shows count of today's events */}
      {todayCount > 0 && (
        <span
          className={`absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 leading-none ${
            hasNew ? 'animate-pulse' : ''
          }`}
        >
          {todayCount}
        </span>
      )}
    </button>
  )
}
