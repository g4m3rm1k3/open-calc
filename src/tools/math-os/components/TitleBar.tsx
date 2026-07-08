import type { AngleMode } from '../types'

interface Props {
  angleMode: AngleMode
  onAngleModeToggle: () => void
  onClose: () => void
  onMouseDown: (e: React.MouseEvent) => void
  ui: Record<string, string>
}

export default function TitleBar({ angleMode, onAngleModeToggle, onClose, onMouseDown, ui }: Props) {
  return (
    <div className={`relative flex items-center gap-3 px-5 py-3 border-b cursor-grab active:cursor-grabbing shrink-0 ${ui.bg1} ${ui.border}`} onMouseDown={onMouseDown}>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-sky-500/10 blur-xl pointer-events-none" />
      <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-400 font-black text-[15px] tracking-wide select-none">⬡ MathOS</span>
      <span className="relative z-10 text-slate-400 font-medium text-xs select-none">Universal STEM Workspace</span>
      <div className="relative z-10 ml-auto flex items-center gap-2">
        <button
          onClick={onAngleModeToggle}
          className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold transition-colors ${angleMode==='DEG'?'bg-amber-500/20 text-amber-300':'bg-white/10 hover:bg-white/20 text-slate-300'}`}
        >
          {angleMode}
        </button>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors">✕</button>
      </div>
    </div>
  )
}
