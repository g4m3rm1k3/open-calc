import { FlaskConical } from 'lucide-react'
import LabWorkbenchBackground from '../components/backgrounds/LabWorkbenchBackground.jsx'
import { LABS } from '../labs/registry.js'
import GridPage from './GridPage.jsx'

export default function LabsPage() {
  return (
    <GridPage
      title="Labs"
      Background={LabWorkbenchBackground}
      badge={{ label: 'Labs', className: 'border-emerald-200/20 bg-emerald-300/10 text-emerald-100' }}
      badgeIcon={FlaskConical}
      headline="Live simulations with the engine humming underneath."
      subline="Hands-on simulations and interactive tools for experimenting, modeling, and building."
      sparkleLabel="Interactive 3D lab backdrop active"
      items={LABS}
      cardVariant="lab"
    />
  )
}
