import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDesktop } from '../components/desktop/DesktopProvider.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

// Thin route-trigger: loads the lab/game component, opens it as a desktop
// floating window, then navigates back to the listing page.
export default function EntryShell({ paramKey, loader, notFoundEmoji, notFoundLabel, backTo, backLabel }) {
  const params = useParams()
  const key = params[paramKey]
  const navigate = useNavigate()
  const { openWindow } = useDesktop()
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    loader(key).then(entry => {
      if (cancelled) return
      if (!entry?.component) { setNotFound(true); return }
      openWindow({
        id: key,
        label: entry.label,
        emoji: entry.emoji,
        Component: entry.component,
        backTo,
        backLabel,
      })
      navigate(backTo, { replace: true })
    }).catch(() => { if (!cancelled) setNotFound(true) })
    return () => { cancelled = true }
  }, [key])

  if (notFound) return (
    <div className="py-20 text-center">
      <p className="text-4xl mb-4">{notFoundEmoji}</p>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">{notFoundLabel}</h2>
      <button onClick={() => navigate(backTo)} className="text-brand-600 hover:underline dark:text-brand-400">
        {backLabel || 'Go back'}
      </button>
    </div>
  )

  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}
