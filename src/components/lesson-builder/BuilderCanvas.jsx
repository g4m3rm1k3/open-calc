import { useState } from 'react'
import IdentityBlock from './blocks/IdentityBlock.jsx'
import HookBlock from './blocks/HookBlock.jsx'
import ProseCalloutBlock from './blocks/ProseCalloutBlock.jsx'
import MathBlock from './blocks/MathBlock.jsx'
import ExamplesBlock from './blocks/ExamplesBlock.jsx'
import ChallengesBlock from './blocks/ChallengesBlock.jsx'
import CheckpointsBlock from './blocks/CheckpointsBlock.jsx'
import QuizBlock from './blocks/QuizBlock.jsx'
import PythonBlock from './blocks/PythonBlock.jsx'
import { HANDLED_SECTION_KEYS, HANDLED_META_KEYS } from './builderUtils.js'

function DropZone({ onDrop, label }) {
  const [over, setOver] = useState(false)
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const t = e.dataTransfer.getData('block-type'); if (t) onDrop(t) }}
      className={`h-8 rounded-lg border-2 border-dashed transition-all flex items-center justify-center text-xs font-semibold ${
        over
          ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-500'
          : 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700'
      }`}
    >
      {over ? `Drop here` : label}
    </div>
  )
}

const SECTION_LABELS = {
  intuition: 'Intuition',
  math: 'Math',
  rigor: 'Rigor',
  examples: 'Examples',
  challenges: 'Challenges',
  checkpoints: 'Checkpoints',
  quiz: 'Quiz',
}

const SECTION_ICONS = {
  intuition: '🧠',
  math: '📐',
  rigor: '∴',
  examples: '✏️',
  challenges: '🎯',
  checkpoints: '✅',
  quiz: '🧪',
}

function SectionBlock({ sec, dispatch, index, total }) {
  const common = {
    sec, dispatch, index, total,
    onMoveUp: () => dispatch({ type: 'MOVE_UP', id: sec._id }),
    onMoveDown: () => dispatch({ type: 'MOVE_DOWN', id: sec._id }),
    onRemove: () => {
      if (window.confirm(`Remove ${SECTION_LABELS[sec.type] ?? sec.type} section?`)) {
        dispatch({ type: 'REMOVE_SECTION', id: sec._id })
      }
    },
  }

  switch (sec.type) {
    case 'intuition':
      return <ProseCalloutBlock {...common} label="Intuition" icon="🧠" sectionId={sec._id} />
    case 'rigor':
      return <ProseCalloutBlock {...common} label="Rigor" icon="∴" sectionId={sec._id} />
    case 'math':
      return <MathBlock {...common} sectionId={sec._id} />
    case 'examples':
      return <ExamplesBlock {...common} />
    case 'challenges':
      return <ChallengesBlock {...common} />
    case 'checkpoints':
      return <CheckpointsBlock {...common} />
    case 'quiz':
      return <QuizBlock {...common} />
    case 'python':
      return <PythonBlock {...common} />
    default:
      return (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm text-slate-400">
          Unknown section type: {sec.type}
        </div>
      )
  }
}

// Show fields from _raw that the builder doesn't handle — confirms nothing will be dropped
function PassthroughPanel({ raw }) {
  const [expanded, setExpanded] = useState(false)
  if (!raw) return null

  const passKeys = Object.keys(raw).filter(k => !HANDLED_SECTION_KEYS.has(k) && !HANDLED_META_KEYS.has(k) && !['hook', 'id', 'slug', 'chapter', 'order', 'title', 'subtitle', 'tags', 'coreConcept', 'prerequisites', 'timeToComplete', 'aliases', 'nextLesson'].includes(k))

  if (!passKeys.length) return null

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="text-sm">🔒</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Preserved fields ({passKeys.length}) — not editable here, passed through unchanged
        </span>
        <span className="ml-auto text-xs text-slate-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 py-3 space-y-1">
          {passKeys.map(k => (
            <div key={k} className="flex items-baseline gap-2 text-xs">
              <span className="font-mono font-semibold text-brand-600 dark:text-brand-400 shrink-0">{k}</span>
              <span className="text-slate-400 truncate">
                {Array.isArray(raw[k]) ? `[${raw[k].length} items]`
                  : typeof raw[k] === 'object' ? `{${Object.keys(raw[k]).join(', ')}}`
                  : String(raw[k]).slice(0, 80)}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-slate-400 mt-2 italic">These fields will be included verbatim in your exported .js file.</p>
        </div>
      )}
    </div>
  )
}

export default function BuilderCanvas({ state, dispatch }) {
  const { meta, hook, sections, _raw } = state

  return (
    <div className="flex-1 min-w-0 space-y-3">
      {/* Rigid: identity */}
      <IdentityBlock meta={meta} dispatch={dispatch} />

      {/* Rigid: hook */}
      <HookBlock hook={hook} dispatch={dispatch} />

      {/* Drop zone before first flexible section */}
      {sections.length === 0 ? (
        <DropZone
          label="Drag a section here to start"
          onDrop={type => dispatch({ type: 'ADD_SECTION', blockType: type, insertAt: 0 })}
        />
      ) : (
        <>
          <DropZone
            label="+"
            onDrop={type => dispatch({ type: 'ADD_SECTION', blockType: type, insertAt: 0 })}
          />
          {sections.map((sec, i) => (
            <div key={sec._id}>
              <SectionBlock sec={sec} dispatch={dispatch} index={i} total={sections.length} />
              <DropZone
                label="+"
                onDrop={type => dispatch({ type: 'ADD_SECTION', blockType: type, insertAt: i + 1 })}
              />
            </div>
          ))}
        </>
      )}

      {/* Fields from the original lesson that are preserved but not editable in the builder */}
      <PassthroughPanel raw={_raw} />
    </div>
  )
}
