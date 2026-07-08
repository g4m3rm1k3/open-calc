// ─── Variables Panel ──────────────────────────────────────────────────────────
// Shows all Variable objects in the document with live-updating sliders.
// Every slider change goes through the platform → DependencyEngine propagates
// → all dependent properties recompute → views re-render.

import { useState } from 'react'
import { objectsByKind } from '../core/MathDocument'
import type { Variable } from '../core/MathDocument'
import type { UseMathDocumentReturn } from '../hooks/useMathDocument'

interface Props {
  bridge: UseMathDocumentReturn
  ui: Record<string, string>
}

interface SliderConfig {
  min: number
  max: number
  step: number
}

function defaultSlider(value: number): SliderConfig {
  const abs = Math.abs(value)
  if (abs <= 1)  return { min: -2,   max: 2,   step: 0.01 }
  if (abs <= 10) return { min: -20,  max: 20,  step: 0.1  }
  if (abs <= 100)return { min: -200, max: 200, step: 1    }
  return            { min: -1000, max: 1000, step: 1    }
}

export default function VariablesPanel({ bridge, ui }: Props) {
  const { doc, tick, setVariable, addVariable, removeObject } = bridge
  const [newName, setNewName]   = useState('')
  const [newValue, setNewValue] = useState('0')
  const [sliders, setSliders]   = useState<Record<string, SliderConfig>>({})

  // Reread variables every tick so we always show current values
  const vars = objectsByKind<Variable>(doc, 'variable')
  void tick

  function getSlider(v: Variable): SliderConfig {
    return sliders[v.id] ?? defaultSlider(v.value)
  }

  function updateSliderConfig(id: string, patch: Partial<SliderConfig>) {
    setSliders(prev => ({ ...prev, [id]: { ...getSlider({ id, value: 0 } as Variable), ...patch } }))
  }

  function handleAdd() {
    const name = newName.trim()
    const val  = parseFloat(newValue)
    if (!name || isNaN(val)) return
    addVariable(name, val)
    setNewName(''); setNewValue('0')
  }

  if (vars.length === 0) return (
    <div className={`p-4 rounded-xl border ${ui.border} ${ui.bg1}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Variables</div>
      <AddVariableRow name={newName} value={newValue} onName={setNewName} onValue={setNewValue} onAdd={handleAdd} ui={ui} />
    </div>
  )

  return (
    <div className={`rounded-xl border ${ui.border} ${ui.bg1} overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/20 dark:border-white/5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Variables</span>
        <span className="text-[10px] text-slate-500">{vars.length} defined</span>
      </div>

      <div className="divide-y divide-slate-200/10 dark:divide-white/5">
        {vars.map(v => {
          const sl = getSlider(v)
          return (
            <div key={v.id} className="px-4 py-3 group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-brand-400">{v.name}</span>
                  {v.unit && <span className="text-[10px] text-slate-500 font-mono border border-slate-200/20 dark:border-white/10 px-1 rounded">{v.unit}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={v.value}
                    step={sl.step}
                    onChange={e => setVariable(v.id, parseFloat(e.target.value) || 0)}
                    aria-label={`${v.name} value`}
                    className={`w-24 text-right text-sm font-mono font-bold text-emerald-400 bg-transparent border-b border-slate-200/20 dark:border-white/10 focus:border-brand-400 focus:outline-none transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => removeObject(v.id)}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-600 hover:text-red-400 transition-all px-1"
                    aria-label={`Remove ${v.name}`}
                  >×</button>
                </div>
              </div>

              <input
                type="range"
                min={sl.min} max={sl.max} step={sl.step}
                value={v.value}
                aria-label={`${v.name} slider`}
                onChange={e => setVariable(v.id, parseFloat(e.target.value))}
                className="w-full h-1.5 accent-brand-500 cursor-pointer rounded-full"
              />

              {/* Slider range config — shown on hover */}
              <div className="hidden group-hover:flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                <span>range:</span>
                {(['min','max','step'] as const).map(field => (
                  <label key={field} className="flex items-center gap-1">
                    <span className="uppercase tracking-wider">{field}</span>
                    <input
                      type="number"
                      value={sl[field]}
                      step={field === 'step' ? 0.001 : 1}
                      onChange={e => updateSliderConfig(v.id, { [field]: parseFloat(e.target.value) || sl[field] })}
                      aria-label={`${v.name} slider ${field}`}
                      className="w-16 bg-transparent border-b border-white/10 text-slate-400 text-center focus:outline-none focus:border-brand-400"
                    />
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className={`px-4 py-3 border-t border-slate-200/20 dark:border-white/5 ${ui.bg0}`}>
        <AddVariableRow name={newName} value={newValue} onName={setNewName} onValue={setNewValue} onAdd={handleAdd} ui={ui} />
      </div>
    </div>
  )
}

function AddVariableRow({ name, value, onName, onValue, onAdd, ui }: {
  name: string; value: string
  onName: (v: string) => void; onValue: (v: string) => void
  onAdd: () => void; ui: Record<string, string>
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={e => onName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onAdd()}
        placeholder="name"
        aria-label="New variable name"
        className={`w-20 text-sm font-mono px-2 py-1 rounded-lg ${ui.bg2} border ${ui.border} text-slate-800 dark:text-slate-100 placeholder-slate-600 focus:border-brand-400 focus:outline-none`}
      />
      <span className="text-slate-500 text-sm">=</span>
      <input
        type="number"
        value={value}
        onChange={e => onValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onAdd()}
        aria-label="New variable value"
        className={`w-20 text-sm font-mono px-2 py-1 rounded-lg ${ui.bg2} border ${ui.border} text-slate-800 dark:text-slate-100 focus:border-brand-400 focus:outline-none`}
      />
      <button
        type="button"
        onClick={onAdd}
        className="px-3 py-1 text-xs font-bold bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 rounded-lg border border-brand-500/20 transition-colors"
      >+ Add</button>
    </div>
  )
}
