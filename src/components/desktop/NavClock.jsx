import { useEffect, useState } from 'react'

export default function NavClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="flex flex-col items-end leading-none select-none cursor-default">
      <span className="text-[12px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">{timeStr}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{dateStr}</span>
    </div>
  )
}
