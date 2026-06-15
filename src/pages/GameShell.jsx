import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getGameEntry } from '../games/gameLoader.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import LabErrorBoundary from '../components/ui/LabErrorBoundary.jsx'

export default function GameShell() {
  const { gameKey } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getGameEntry(gameKey).then(entry => {
      if (!cancelled) { setGame(entry); setLoading(false) }
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [gameKey])

  useEffect(() => {
    if (game) document.title = `${game.label} — UpSkillOS`
    return () => { document.title = 'UpSkillOS' }
  }, [game?.label])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!game?.component) {
    return (
      <div className="py-20 text-center">
        <p className="text-4xl mb-4">🎮</p>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Game not found</h2>
        <Link to="/games" className="text-brand-600 hover:underline dark:text-brand-400">Back to games</Link>
      </div>
    )
  }

  const Component = game.component
  return (
    <LabErrorBoundary label={game.label} backTo="/games" backLabel="Back to games">
      <Component onBack={() => navigate('/games')} />
    </LabErrorBoundary>
  )
}
