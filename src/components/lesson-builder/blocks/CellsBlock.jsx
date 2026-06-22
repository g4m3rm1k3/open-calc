import { useState, lazy, Suspense } from 'react'
import BlockShell from '../BlockShell.jsx'
import MarkdownEditButton from '../MarkdownEditButton.jsx'
import VizCellEditor from './VizCellEditor.jsx'
import CodeField from '../CodeField.jsx'

const MarkdownCellEditor = lazy(() => import('./MarkdownCellEditor.jsx'))

const CELL_TYPES = ['markdown', 'js', 'challenge', 'coding', 'walkthrough']
const CELL_ICONS = { markdown: '📝', js: '⚡', challenge: '❓', coding: '✎', walkthrough: '⟳' }
const CELL_LABELS = { markdown: 'Markdown', js: 'Visual JS', challenge: 'Challenge', coding: 'Coding', walkthrough: 'Walkthrough' }

// ── Markdown toolbar ──────────────────────────────────────────────────────────
const MD_BUTTONS = [
  { label: 'H3', insert: '### ' },
  { label: 'B', insert: '**bold**' },
  { label: 'I', insert: '*italic*' },
  { label: '—', insert: '\n---\n' },
  { label: '$…$', insert: '$$\\frac{a}{b}$$' },
  { label: '\\frac', insert: '\\frac{numerator}{denominator}' },
  { label: '\\sqrt', insert: '\\sqrt{x}' },
  { label: '\\sum', insert: '\\sum_{i=1}^{n}' },
  { label: '°', insert: '^\\circ' },
  { label: '≈', insert: '\\approx' },
  { label: '≤', insert: '\\leq' },
  { label: '≥', insert: '\\geq' },
  { label: '·list', insert: '\n- item 1\n- item 2\n' },
]

function MdToolbar({ onInsert }) {
  return (
    <div className="flex flex-wrap gap-1 mb-1">
      {MD_BUTTONS.map(b => (
        <button
          key={b.label}
          type="button"
          onClick={() => onInsert(b.insert)}
          className="px-2 py-0.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-400 hover:text-brand-600 font-mono transition-colors"
          title={`Insert: ${b.insert.trim()}`}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
  )
}

function TA({ value, onChange, rows = 3, mono = false, placeholder = '', taRef }) {
  return (
    <textarea
      ref={taRef}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`field text-sm resize-y ${mono ? 'font-mono text-xs' : ''}`}
    />
  )
}

// ── Per-type cell editors ─────────────────────────────────────────────────────

function MarkdownEditor({ cell, onChange, onLiveEdit }) {
  const taRef = { current: null }
  const insertMd = (snippet) => {
    const ta = taRef.current
    if (!ta) {
      onChange({ ...cell, instruction: (cell.instruction ?? '') + snippet })
      return
    }
    const s = ta.selectionStart, e = ta.selectionEnd
    const v = ta.value
    const next = v.slice(0, s) + snippet + v.slice(e)
    onChange({ ...cell, instruction: next })
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + snippet.length; ta.focus() }, 0)
  }
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <MdToolbar onInsert={insertMd} />
        <div className="ml-2">
          <MarkdownEditButton onClick={onLiveEdit} label="📝 Full Editor + Preview" />
        </div>
      </div>
      <Field label="Markdown content">
        <TA taRef={taRef} value={cell.instruction} onChange={v => onChange({ ...cell, instruction: v })} rows={8} placeholder="### Heading&#10;&#10;Prose here. Use $$x^2$$ for inline math." />
      </Field>
    </div>
  )
}

function JsEditor({ cell, onChange, onLiveEdit }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Field label="Instruction / caption (markdown)">
          <TA value={cell.instruction} onChange={v => onChange({ ...cell, instruction: v })} rows={2} placeholder="Brief description…" />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">JavaScript (startCode)</span>
        <button
          onClick={onLiveEdit}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          ⚡ Live edit + preview
        </button>
      </div>
      <CodeField value={cell.startCode} onChange={v => onChange({ ...cell, startCode: v })} language="javascript" height={220} placeholder="var canvas = document.getElementById('cv');" />
      <Field label="HTML (optional)">
        <CodeField value={cell.html} onChange={v => onChange({ ...cell, html: v })} language="html" height={120} placeholder="<canvas id='cv' width='700' height='300'></canvas>" />
      </Field>
      <Field label="CSS (optional)">
        <CodeField value={cell.css} onChange={v => onChange({ ...cell, css: v })} language="css" height={100} placeholder="body { margin: 0; }" />
      </Field>
      <Field label="Output height (px)">
        <input
          type="number"
          value={cell.outputHeight ?? ''}
          onChange={e => onChange({ ...cell, outputHeight: parseInt(e.target.value) || undefined })}
          className="field w-28 text-sm"
          placeholder="220"
        />
      </Field>
    </div>
  )
}

function ChallengeOptionEditor({ options, onChange }) {
  const opts = options ?? [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }]
  return (
    <div className="space-y-2">
      {opts.map((o, i) => (
        <div key={i} className="flex items-start gap-2">
          <input value={o.label ?? ''} onChange={e => { const n = [...opts]; n[i] = { ...o, label: e.target.value }; onChange(n) }} className="field w-12 text-sm font-mono text-center" placeholder="A" />
          <input value={o.text ?? ''} onChange={e => { const n = [...opts]; n[i] = { ...o, text: e.target.value }; onChange(n) }} className="field flex-1 text-sm" placeholder="Option text" />
          <button onClick={() => onChange(opts.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-600 mt-1.5">✕</button>
        </div>
      ))}
      <button onClick={() => onChange([...opts, { label: String.fromCharCode(65 + opts.length), text: '' }])} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ Add option</button>
    </div>
  )
}

function ChallengeEditor({ cell, onChange }) {
  const correctLabel = (() => {
    if (!cell.check) return ''
    const m = String(cell.check).match(/return\s+label\s*===\s*['"]([^'"]+)['"]/)
    return m ? m[1] : ''
  })()
  return (
    <div className="space-y-3">
      <Field label="Question / instruction (markdown)">
        <TA value={cell.instruction} onChange={v => onChange({ ...cell, instruction: v })} rows={3} placeholder="What is the sum of angles in a triangle?" />
      </Field>
      <Field label="Options"><ChallengeOptionEditor options={cell.options} onChange={opts => onChange({ ...cell, options: opts })} /></Field>
      <Field label="Correct option label">
        <input value={correctLabel} onChange={e => onChange({ ...cell, check: `(label) => label === '${e.target.value.toUpperCase()}'` })} className="field w-20 text-sm font-mono" placeholder="A" />
      </Field>
      <Field label="Success message">
        <input value={cell.successMessage ?? ''} onChange={e => onChange({ ...cell, successMessage: e.target.value })} className="field text-sm" placeholder="Correct!" />
      </Field>
      <Field label="Fail message">
        <input value={cell.failMessage ?? ''} onChange={e => onChange({ ...cell, failMessage: e.target.value })} className="field text-sm" placeholder="Not quite — try again." />
      </Field>
      <Field label="Visual JS (optional diagram above options)">
        <CodeField value={cell.startCode} onChange={v => onChange({ ...cell, startCode: v })} language="javascript" height={140} placeholder="// optional diagram code" />
      </Field>
    </div>
  )
}

function CodingEditor({ cell, onChange }) {
  return (
    <div className="space-y-3">
      <Field label="Instruction (markdown)">
        <TA value={cell.instruction} onChange={v => onChange({ ...cell, instruction: v })} rows={3} placeholder="Write a function that…" />
      </Field>
      <Field label="Starter code">
        <CodeField value={cell.startCode} onChange={v => onChange({ ...cell, startCode: v })} language="javascript" height={180} placeholder="function solve() { /* your code here */ }" />
      </Field>
      <Field label="Solution code">
        <CodeField value={cell.solutionCode} onChange={v => onChange({ ...cell, solutionCode: v })} language="javascript" height={180} placeholder="function solve() { return 42; }" />
      </Field>
      <Field label="Success message">
        <input value={cell.successMessage ?? ''} onChange={e => onChange({ ...cell, successMessage: e.target.value })} className="field text-sm" placeholder="✓ Challenge complete!" />
      </Field>
      <Field label="Fail message">
        <input value={cell.failMessage ?? ''} onChange={e => onChange({ ...cell, failMessage: e.target.value })} className="field text-sm" placeholder="✗ Not quite — try again." />
      </Field>
    </div>
  )
}

function StepEditor({ step, onChange, onRemove }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <input value={step.title ?? ''} onChange={e => onChange({ ...step, title: e.target.value })} className="field flex-1 text-sm font-semibold" placeholder="Step title" />
        <button onClick={onRemove} className="ml-2 text-xs text-red-400 hover:text-red-600">✕</button>
      </div>
      <TA value={step.explanation} onChange={v => onChange({ ...step, explanation: v })} rows={2} placeholder="Explanation…" />
      <CodeField value={step.code} onChange={v => onChange({ ...step, code: v })} language="javascript" height={120} placeholder="// code" />
    </div>
  )
}

function WalkthroughEditor({ cell, onChange }) {
  const steps = cell.steps ?? []
  return (
    <div className="space-y-3">
      <Field label="Instruction / overview (markdown)">
        <TA value={cell.instruction} onChange={v => onChange({ ...cell, instruction: v })} rows={2} placeholder="Build a triangle step by step…" />
      </Field>
      <Field label="Base HTML (optional)">
        <CodeField value={cell.html} onChange={v => onChange({ ...cell, html: v })} language="html" height={100} placeholder="<canvas id='cv'></canvas>" />
      </Field>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Steps</span>
          <button onClick={() => onChange({ ...cell, steps: [...steps, { title: `Step ${steps.length + 1}`, explanation: '', code: '' }] })} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ Add step</button>
        </div>
        {steps.map((s, i) => (
          <StepEditor key={i} step={s}
            onChange={u => { const n = [...steps]; n[i] = u; onChange({ ...cell, steps: n }) }}
            onRemove={() => onChange({ ...cell, steps: steps.filter((_, j) => j !== i) })}
          />
        ))}
      </div>
    </div>
  )
}

// ── Single cell editor wrapper ────────────────────────────────────────────────

function CellEditor({ cell, onChange, onLiveEdit, onMarkdownLiveEdit }) {
  switch (cell.type) {
    case 'markdown':    return <MarkdownEditor cell={cell} onChange={onChange} onLiveEdit={onMarkdownLiveEdit} />
    case 'js':          return <JsEditor cell={cell} onChange={onChange} onLiveEdit={onLiveEdit} />
    case 'challenge':   return <ChallengeEditor cell={cell} onChange={onChange} />
    case 'coding':      return <CodingEditor cell={cell} onChange={onChange} />
    case 'walkthrough': return <WalkthroughEditor cell={cell} onChange={onChange} />
    default: return <div className="text-xs text-slate-400 italic">Unknown cell type: {cell.type}</div>
  }
}

// ── Main CellsBlock ───────────────────────────────────────────────────────────

export default function CellsBlock({ sec, dispatch, index, total, onMoveUp, onMoveDown, onRemove, courseId = 'geometry' }) {
  const [openIdx, setOpenIdx] = useState(null)
  const [vizEditCell, setVizEditCell] = useState(null)    // { cell, cellIndex }
  const [mdEditCell, setMdEditCell] = useState(null)      // { cell, cellIndex }

  const cells = sec.cells ?? []
  const update = updates => dispatch({ type: 'UPDATE_SECTION', id: sec._id, updates })

  const updateCell = (i, updated) => {
    const next = [...cells]; next[i] = updated; update({ cells: next })
  }
  const removeCell = (i) => { update({ cells: cells.filter((_, j) => j !== i) }); if (openIdx === i) setOpenIdx(null) }
  const addCell = (type) => {
    const defaults = {
      markdown:    { type: 'markdown', instruction: '' },
      js:          { type: 'js', instruction: '', html: '', css: '', startCode: '', outputHeight: 280 },
      challenge:   { type: 'challenge', instruction: '', options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }], check: "(label) => label === 'A'", successMessage: '', failMessage: '' },
      coding:      { type: 'coding', instruction: '', startCode: '', solutionCode: '', successMessage: '', failMessage: '' },
      walkthrough: { type: 'walkthrough', instruction: '', html: '', css: '', steps: [] },
    }
    const next = [...cells, defaults[type] ?? { type }]
    update({ cells: next })
    setOpenIdx(next.length - 1)
  }
  const moveCell = (i, dir) => {
    const next = [...cells]; const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]; update({ cells: next }); setOpenIdx(j)
  }

  const isDark = document.documentElement.classList.contains('dark')

  return (
    <>
      <BlockShell
        label={`Cells (${cells.length})`} icon="⚗️"
        index={index} total={total}
        onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}
        isEditing={true}
      >
        <div className="space-y-3">
          {/* Scratchpad — sketch/edit diagram files for this course */}
          <div className="flex justify-end">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('oc-open-scratchpad', { detail: { dir: `src/courses/${courseId}/diagrams` } }))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
            >
              🎨 Open Scratchpad
            </button>
          </div>

          {/* Cell list */}
          {cells.length === 0 && (
            <p className="text-sm italic text-slate-400">No cells yet — add one below.</p>
          )}
          {cells.map((cell, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {/* Cell header */}
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="text-sm">{CELL_ICONS[cell.type] ?? '▪'}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{CELL_LABELS[cell.type] ?? cell.type}</span>
                <span className="text-xs text-slate-400 truncate ml-1 flex-1">
                  {(cell.instruction || cell.startCode || '').slice(0, 60)}
                </span>
                <select
                  value={cell.type}
                  onClick={e => e.stopPropagation()}
                  onChange={e => { e.stopPropagation(); updateCell(i, { ...cell, type: e.target.value }) }}
                  className="field text-xs py-0.5 px-1 w-28"
                >
                  {CELL_TYPES.map(t => <option key={t} value={t}>{CELL_LABELS[t]}</option>)}
                </select>
                <button onClick={e => { e.stopPropagation(); moveCell(i, -1) }} disabled={i === 0} className="px-1.5 py-0.5 text-xs text-slate-400 disabled:opacity-20">↑</button>
                <button onClick={e => { e.stopPropagation(); moveCell(i, 1) }} disabled={i === cells.length - 1} className="px-1.5 py-0.5 text-xs text-slate-400 disabled:opacity-20">↓</button>
                <button onClick={e => { e.stopPropagation(); removeCell(i) }} className="px-1.5 py-0.5 text-xs text-red-400 hover:text-red-600">✕</button>
                <span className="text-xs text-slate-300 ml-1">{openIdx === i ? '▲' : '▼'}</span>
              </button>

              {/* Expanded cell editor */}
              {openIdx === i && (
                <div className="px-4 py-4 space-y-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <CellEditor
                    cell={cell}
                    onChange={updated => updateCell(i, updated)}
                    onLiveEdit={() => setVizEditCell({ cell, cellIndex: i })}
                    onMarkdownLiveEdit={() => setMdEditCell({ cell, cellIndex: i })}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add cell buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {CELL_TYPES.map(t => (
              <button
                key={t}
                onClick={() => addCell(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 transition-colors"
              >
                <span>{CELL_ICONS[t]}</span> + {CELL_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </BlockShell>

      {/* Live JS viz editor modal */}
      {vizEditCell && (
        <VizCellEditor
          cell={vizEditCell.cell}
          dark={isDark}
          onSave={updated => updateCell(vizEditCell.cellIndex, updated)}
          onClose={() => setVizEditCell(null)}
        />
      )}

      {/* Markdown live editor modal */}
      {mdEditCell && (
        <Suspense fallback={<div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950 text-slate-400">Loading editor…</div>}>
          <MarkdownCellEditor
            value={mdEditCell.cell.instruction}
            onChange={v => updateCell(mdEditCell.cellIndex, { ...mdEditCell.cell, instruction: v })}
            onClose={() => setMdEditCell(null)}
          />
        </Suspense>
      )}

    </>
  )
}
