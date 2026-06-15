import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getLabEntry } from '../labs/labLoader.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import LabErrorBoundary from '../components/ui/LabErrorBoundary.jsx'

export default function LabShell() {
  const { labKey } = useParams()
  const navigate = useNavigate()
  const [lab, setLab] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getLabEntry(labKey).then(entry => {
      if (!cancelled) { setLab(entry); setLoading(false) }
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [labKey])

  useEffect(() => {
    if (lab) document.title = `${lab.label} — UpSkillOS`
    return () => { document.title = 'UpSkillOS' }
  }, [lab?.label])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!lab?.component) {
    return (
      <div className="py-20 text-center">
        <p className="text-4xl mb-4">🔬</p>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Lab not found</h2>
        <Link to="/labs" className="text-brand-600 hover:underline dark:text-brand-400">Back to labs</Link>
      </div>
    )
  }

  const Component = lab.component
  return (
    <LabErrorBoundary label={lab.label} backTo="/labs" backLabel="Back to labs">
      <Component onBack={() => navigate('/labs')} />
    </LabErrorBoundary>
  )
}
