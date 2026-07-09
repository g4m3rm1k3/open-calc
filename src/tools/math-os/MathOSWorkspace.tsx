import { useState, useEffect, useRef, useMemo } from 'react'
import { useGlobalTheme } from '../../context/ThemeContext'
import { useDrag } from './hooks/useDrag'
import { useMathOSState } from './hooks/useMathOSState'
import TitleBar from './components/TitleBar'
import StatusBar from './components/StatusBar'
import MathOSCenter from './MathOS'
import VariablesPanel from './views/VariablesPanel'
import InspectorPanel from './views/InspectorPanel'
import TimelinePanel from './views/TimelinePanel'
import AnimationPanel from './views/AnimationPanel'
import { platform } from './core/MathOSPlatform'
import { useMathDocument } from './hooks/useMathDocument'
import { objectsByKind } from './core/MathDocument'
import type { Variable } from './core/MathDocument'
import type { LessonConfig } from './core/LessonAdapter'
import type { UseMathDocumentReturn } from './hooks/useMathDocument'

export interface MathOSOpenConfig extends LessonConfig {
  section?: string
}

interface Props {
  open: boolean
  onClose: () => void
  lessonConfig?: MathOSOpenConfig | null
}

type RightTab = 'inspector' | 'timeline' | 'animate'

export default function MathOSWorkspace({ open, onClose, lessonConfig }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { themeStyles } = useGlobalTheme() as any
  const ui: Record<string, string> = themeStyles.ui

  const { pos, dragging, onMouseDown } = useDrag({ x: Math.max(20, window.innerWidth - 1280), y: 40 })

  // Single source of truth for classic compute state — passed down to MathOSCenter
  const s = useMathOSState()

  // Platform document for live panels
  const [doc] = useState(() => platform.createDocument())
  const bridge = useMathDocument(doc)

  // ─── Bridge: classic vars → platform doc ────────────────────────────────────
  const prevVarsRef = useRef<Record<string, number | string>>({})
  useEffect(() => {
    const prev = prevVarsRef.current
    // Add/update vars that changed
    Object.entries(s.vars).forEach(([name, val]) => {
      const num = Number(val)
      if (isNaN(num)) return
      if (prev[name] === undefined) {
        platform.addVariable(doc, name, num)
      } else if (prev[name] !== val) {
        platform.setVariable(doc, name, num)
      }
    })
    // Remove vars deleted from classic state
    const platformVars = objectsByKind<Variable>(doc, 'variable')
    Object.keys(prev).forEach(name => {
      if (!(name in s.vars)) {
        const v = platformVars.find(pv => pv.name === name)
        if (v) platform.removeObject(doc, v.id)
      }
    })
    prevVarsRef.current = { ...s.vars }
  }, [s.vars, doc])

  // ─── Bridge: platform vars → classic vars ───────────────────────────────────
  // Wrap the bridge so VariablesPanel mutations also update classic compute scope
  const syncedBridge: UseMathDocumentReturn = useMemo(() => ({
    ...bridge,
    addVariable: (name: string, value: number, unit?: string) => {
      const id = bridge.addVariable(name, value, unit)
      s.setVars({ ...s.vars, [name]: value })
      return id
    },
    setVariable: (idOrName: string, value: number) => {
      bridge.setVariable(idOrName, value)
      const found = objectsByKind<Variable>(doc, 'variable').find(
        v => v.id === idOrName || v.name === idOrName
      )
      if (found) s.setVars({ ...s.vars, [found.name]: value })
    },
    removeObject: (id: string) => {
      const found = objectsByKind<Variable>(doc, 'variable').find(v => v.id === id)
      bridge.removeObject(id)
      if (found) {
        const next = { ...s.vars }
        delete next[found.name]
        s.setVars(next)
      }
    },
  }), [bridge, s, doc]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Lesson config ──────────────────────────────────────────────────────────
  const appliedConfigRef = useRef<MathOSOpenConfig | null>(null)
  useEffect(() => {
    if (!lessonConfig || lessonConfig === appliedConfigRef.current) return
    appliedConfigRef.current = lessonConfig

    // Apply variables from lesson config to both systems
    if (lessonConfig.variables) {
      Object.entries(lessonConfig.variables).forEach(([name, value]) => {
        const existing = objectsByKind<Variable>(doc, 'variable').find(v => v.name === name)
        if (existing) {
          platform.setVariable(doc, name, value)
        } else {
          platform.addVariable(doc, name, value)
        }
      })
      s.setVars({ ...s.vars, ...lessonConfig.variables })
    }

    // Jump to a section if specified
    if (lessonConfig.section) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.setSection(lessonConfig.section as any)
    }
  }, [lessonConfig, doc]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Panel state ────────────────────────────────────────────────────────────
  const [showLeft, setShowLeft]   = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [rightTab, setRightTab]   = useState<RightTab>('inspector')

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
        {lessonConfig?.title && (
          <>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <span className="text-[11px] text-brand-400 font-semibold">{lessonConfig.title}</span>
          </>
        )}
      </div>

      {/* 3-column body */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left: Variables (synced to classic compute scope) */}
        {showLeft && (
          <div className={`w-[260px] shrink-0 border-r border-slate-200/10 dark:border-white/5 overflow-y-auto p-3 space-y-3 ${ui.bg1}`}>
            <VariablesPanel bridge={syncedBridge} ui={ui} />
          </div>
        )}

        {/* Center: classic MathOS sections */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MathOSCenter s={s} />
        </div>

        {/* Right: Inspector + Timeline + Animate */}
        {showRight && (
          <div className={`w-[280px] shrink-0 border-l border-slate-200/10 dark:border-white/5 flex flex-col overflow-hidden ${ui.bg1}`}>
            <div className="flex items-center border-b border-slate-200/10 dark:border-white/5 px-2 pt-2 gap-0.5 shrink-0">
              {([
                ['inspector', 'Inspect'],
                ['timeline',  'Timeline'],
                ['animate',   'Animate'],
              ] as [RightTab, string][]).map(([tab, label]) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-t-lg transition-colors ${rightTab === tab ? 'text-brand-400 bg-brand-500/10 border border-b-0 border-brand-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === 'inspector' && <InspectorPanel bridge={bridge} ui={ui} />}
              {rightTab === 'timeline'  && <TimelinePanel doc={doc} ui={ui} />}
              {rightTab === 'animate'   && <AnimationPanel bridge={syncedBridge} ui={ui} />}
            </div>
          </div>
        )}

      </div>

      <StatusBar varCount={Object.keys(s.vars).length} historyCount={s.history.length} ui={ui} />
    </div>
  )
}
