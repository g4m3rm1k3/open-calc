import { Compass } from 'lucide-react'
import CompassQuickPanel from '../../features/compass/CompassQuickPanel.jsx'

export const meta = {
  label: 'Compass',
  group: 'hidden',
  order: 20,
  icon: Compass,
  colorClass: 'text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30',
  eventTool: 'compass-quick',
}

export default CompassQuickPanel
