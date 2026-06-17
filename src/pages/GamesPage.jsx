import { Gamepad2 } from 'lucide-react'
import ArcadeMazeBackground from '../components/backgrounds/ArcadeMazeBackground.jsx'
import { GAMES } from '../games/registry.js'
import GridPage from './GridPage.jsx'

export default function GamesPage() {
  return (
    <GridPage
      title="Games"
      Background={ArcadeMazeBackground}
      badge={{ label: 'Games', className: 'border-cyan-200/20 bg-cyan-300/10 text-cyan-100' }}
      badgeIcon={Gamepad2}
      headline="Arcade learning."
      subline="Apply what you're learning through arcade challenges, physics playgrounds, and sports math."
      sparkleLabel="Original neon maze engine active"
      items={GAMES}
      cardVariant="game"
    />
  )
}
