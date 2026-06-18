import { Terminal } from 'lucide-react'

export const meta = {
  label: 'Terminal',
  group: 'engine',
  order: 15,
  icon: Terminal,
  colorClass: 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
  eventTool: 'terminal',
}

export { default } from './TerminalHub.jsx'
