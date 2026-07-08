import { SECTIONS } from '../constants'
import type { SectionId } from '../types'

interface Props {
  section: SectionId
  onSelect: (id: SectionId) => void
  ui: Record<string, string>
}

export default function SectionTabs({ section, onSelect, ui }: Props) {
  return (
    <div className={`flex gap-1 px-3 py-2 border-b shrink-0 overflow-x-auto ${ui.bg1} ${ui.border}`}>
      {SECTIONS.map(s => (
        <button key={s.id} onClick={() => onSelect(s.id)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${section===s.id?'bg-brand-500/15 text-brand-300 shadow-sm':'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
          {s.label}
        </button>
      ))}
    </div>
  )
}
