import { useEffect, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export default function FullscreenButton({ className = '' }) {
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const update = () => setIsFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  return (
    <button
      onClick={toggle}
      title={isFull ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-label={isFull ? 'Exit fullscreen' : 'Enter fullscreen'}
      className={`p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none ${className}`}
    >
      {isFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
    </button>
  )
}
