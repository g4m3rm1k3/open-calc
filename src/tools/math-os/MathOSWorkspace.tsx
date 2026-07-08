import { useState } from 'react'
import { useGlobalTheme } from '../../context/ThemeContext'
import { useDrag } from './hooks/useDrag'
import { useMathOSState } from './hooks/useMathOSState'
import TitleBar from './components/TitleBar'
import StatusBar from './components/StatusBar'
import MathOSCenter from './MathOS'
import VariablesPanel from './views/VariablesPanel'
import InspectorPanel from './views/InspectorPanel'
import TimelinePanel from './views/TimelinePanel'
import { platform } from './core/MathOSPlatform'
import { useMathDocument } from './hooks/useMathDocument'

interface Props { open: boolean; onClose: () => void }

export default function MathOSWorkspace({ open, onClose }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { themeStyles } = useGlobalTheme() as any
  const ui: Record<string, string> = themeStyles.ui

  const { pos, dragging, onMouseDown } = useDrag({ x: Math.max(20, window.innerWidth - 1280), y: 40 })

  // Classic compute/state layer — provides varCount + historyCount for StatusBar
  const s = useMathOSState()

  // Platform document for live panels (VariablesPanel, Inspector, Timeline)
  const [doc] = useState(() => platform.createDocument())
  const bridge = useMathDocument(doc)

  // Panel visibility
  const [showLeft, setShowLeft]   = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [rightTab, setRightTab]   = useState<'inspector' | 'timeline'>('inspector')

  if (!open) return null

  return (
    <div
      className={`fixed z-[2000] flex flex-col rounded-[24px] border ${ui.border} overflow-hidden backdrop-blur-3xl ${ui.bg0} ${ui.txt1} shadow-[0_20px_60px_rgba(0,0,0,0.5)]`}
      style={{ left: pos.x, top: pos.y, width: 1240, maxHeight: '92vh', userSelect: dragging.current ? 'none' : 'auto' }}
    >
      <TitleBar
        angleMode={s.angleMode}
        onAngleModeToggle={() => s.setAngleMode(a => a === 'RAD' ? 'DEG' : 'RAD')}
        onClose={onClose}
        onMouseDown={onMouseDown}
        ui={ui}
      />

      {/* Panel toggle toolbar */}
      <div className={`flex items-center gap-2 px-4 py-1.5 border-b border-slate-200/10 dark:border-white/5 ${ui.bg1} shrink-0`}>
        <button
          type="button"
          onClick={() => setShowLeft(v => !v)}
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors border ${showLeft ? 'bg-brand-500/15 text-brand-400 border-brand-500/20' : 'text-slate-500 border-transparent hover:border-white/10 hover:bg-white/5'}`}
        >
          ⊞ Vars
        </button>
        <button
          type="button"
          onClick={() => setShowRight(v => !v)}
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors border ${showRight ? 'bg-brand-500/15 text-brand-400 border-brand-500/20' : 'text-slate-500 border-transparent hover:border-white/10 hover:bg-white/5'}`}
        >
          ⊞ Panels
        </button>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <span className="text-[10px] text-slate-600 font-mono">{doc.objects.size} platform objects</span>
      </div>

      {/* 3-column body */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left: Variables (platform doc) */}
        {showLeft && (
          <div className={`w-[260px] shrink-0 border-r border-slate-200/10 dark:border-white/5 overflow-y-auto p-3 space-y-3 ${ui.bg1}`}>
            <VariablesPanel bridge={bridge} ui={ui} />
          </div>
        )}

        {/* Center: classic MathOS sections */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MathOSCenter />
        </div>

        {/* Right: Inspector + Timeline (platform doc) */}
        {showRight && (
          <div className={`w-[280px] shrink-0 border-l border-slate-200/10 dark:border-white/5 flex flex-col overflow-hidden ${ui.bg1}`}>
            <div className="flex items-center border-b border-slate-200/10 dark:border-white/5 px-2 pt-2 gap-1 shrink-0">
              {(['inspector', 'timeline'] as const).map(tab => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-t-lg transition-colors ${rightTab === tab ? 'text-brand-400 bg-brand-500/10 border border-b-0 border-brand-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab === 'inspector' ? 'Inspect' : 'Timeline'}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === 'inspector' && <InspectorPanel bridge={bridge} ui={ui} />}
              {rightTab === 'timeline' && <TimelinePanel doc={doc} ui={ui} />}
            </div>
          </div>
        )}

      </div>

      <StatusBar varCount={Object.keys(s.vars).length} historyCount={s.history.length} ui={ui} />
    </div>
  )
}
