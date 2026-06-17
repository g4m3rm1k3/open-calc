import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import LabErrorBoundary from '../components/ui/LabErrorBoundary.jsx'

export default function EntryShell({ paramKey, loader, notFoundEmoji, notFoundLabel, backTo, backLabel }) {
  const params = useParams()
  const key = params[paramKey]
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loader(key).then(e => {
      if (!cancelled) { setEntry(e); setLoading(false) }
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [key])

  useEffect(() => {
    if (entry) document.title = `${entry.label} — UpSkillOS`
    return () => { document.title = 'UpSkillOS' }
  }, [entry?.label])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )

  if (!entry?.component) return (
    <div className="py-20 text-center">
      <p className="text-4xl mb-4">{notFoundEmoji}</p>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">{notFoundLabel}</h2>
      <Link to={backTo} className="text-brand-600 hover:underline dark:text-brand-400">{backLabel}</Link>
    </div>
  )

  const Component = entry.component
  return (
    <LabErrorBoundary label={entry.label} backTo={backTo} backLabel={backLabel}>
      <Component onBack={() => navigate(backTo)} />
    </LabErrorBoundary>
  )
}
