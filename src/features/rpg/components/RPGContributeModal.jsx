import { useState } from 'react'
import { useRPGContent } from '../hooks/useRPGContent'
import { useAuth } from '../../../context/AuthContext'

const TABS = ['Exercise', 'Class', 'Plan']

const EXERCISE_TYPES = [
  { value: 'weight_reps', label: 'Weight + Reps (barbell, dumbbell)' },
  { value: 'bodyweight_reps', label: 'Bodyweight Reps' },
  { value: 'distance_time', label: 'Distance + Time (cardio)' },
  { value: 'time_hold', label: 'Timed Hold (plank, yoga)' },
]

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'elite']

const STAT_KEYS = ['STR', 'END', 'AGI', 'DEX']

const GITHUB_FILES = {
  Exercise: 'https://github.com/upskillos/open-calc/blob/main/src/data/rpg/exercises.json',
  Class: 'https://github.com/upskillos/open-calc/blob/main/src/data/rpg/classes.json',
  Plan: 'https://github.com/upskillos/open-calc/blob/main/src/data/rpg/plans.json',
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ─── Exercise Form ─────────────────────────────────────────────────────────────
function ExerciseForm({ value, onChange }) {
  const updateField = (field, val) => onChange({ ...value, [field]: val })
  const updateStatFocus = (stat, val) => {
    const num = parseFloat(val) || 0
    const updated = { ...value.statFocus }
    if (num === 0) delete updated[stat]
    else updated[stat] = num
    onChange({ ...value, statFocus: updated })
  }
  const updateInstruction = (i, val) => {
    const arr = [...(value.instructions || [])]
    arr[i] = val
    onChange({ ...value, instructions: arr })
  }
  const addInstruction = () => onChange({ ...value, instructions: [...(value.instructions || []), ''] })
  const removeInstruction = i => onChange({ ...value, instructions: value.instructions.filter((_, j) => j !== i) })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Name *</label>
          <input className="field" value={value.name || ''} onChange={e => {
            const name = e.target.value
            onChange({ ...value, name, id: slugify(name) })
          }} placeholder="e.g. Dumbbell Fly" />
        </div>
        <div>
          <label className="field-label">ID (auto)</label>
          <input className="field font-mono text-xs bg-slate-800" value={value.id || ''} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Type *</label>
          <select className="field" value={value.type || ''} onChange={e => updateField('type', e.target.value)}>
            <option value="">Select type…</option>
            {EXERCISE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Difficulty *</label>
          <select className="field" value={value.difficulty || ''} onChange={e => updateField('difficulty', e.target.value)}>
            <option value="">Select…</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Description</label>
        <input className="field" value={value.description || ''} onChange={e => updateField('description', e.target.value)} placeholder="One line summary" />
      </div>

      <div>
        <label className="field-label">Stat Focus (values 0–1, must add to ≤1)</label>
        <div className="grid grid-cols-4 gap-2">
          {STAT_KEYS.map(stat => (
            <div key={stat}>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">{stat}</label>
              <input
                type="number" min="0" max="1" step="0.1"
                className="field text-sm"
                value={value.statFocus?.[stat] || ''}
                onChange={e => updateStatFocus(stat, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">XP per rep/km/minute</label>
        <input type="number" className="field w-32" value={
          value.baseXpPerRep ?? value.baseXpPerKm ?? value.baseXpPerMinute ?? ''
        } onChange={e => {
          const num = parseFloat(e.target.value) || 0
          const key = value.type === 'distance_time' ? 'baseXpPerKm'
            : (value.type === 'time_hold' || value.type === 'isometric') ? 'baseXpPerMinute'
            : 'baseXpPerRep'
          onChange({ ...value, [key]: num })
        }} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="field-label mb-0">Form Cues</label>
          <button type="button" onClick={addInstruction} className="text-xs text-brand-400 hover:text-brand-300">+ Add cue</button>
        </div>
        <div className="space-y-2">
          {(value.instructions || []).map((inst, i) => (
            <div key={i} className="flex gap-2">
              <input className="field flex-1 text-sm" value={inst} onChange={e => updateInstruction(i, e.target.value)} placeholder={`Cue ${i + 1}`} />
              <button type="button" onClick={() => removeInstruction(i)} className="text-slate-500 hover:text-red-400 text-sm px-1">✕</button>
            </div>
          ))}
          {!value.instructions?.length && (
            <p className="text-xs text-slate-600 italic">No cues yet — add the key form points</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Primary muscles (comma-separated)</label>
          <input className="field text-sm" value={(value.muscles?.primary || []).join(', ')} onChange={e => onChange({ ...value, muscles: { primary: e.target.value.split(',').map(s => s.trim()).filter(Boolean), secondary: value.muscles?.secondary || [] } })} placeholder="quads, glutes" />
        </div>
        <div>
          <label className="field-label">Secondary muscles</label>
          <input className="field text-sm" value={(value.muscles?.secondary || []).join(', ')} onChange={e => onChange({ ...value, muscles: { primary: value.muscles?.primary || [], secondary: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} placeholder="core, hamstrings" />
        </div>
      </div>
    </div>
  )
}

// ─── Class Form ────────────────────────────────────────────────────────────────
const ICON_OPTIONS = ['shield', 'sword', 'wind', 'hand', 'zap', 'star', 'flame', 'target', 'map-pin', 'activity']
const COLOR_PRESETS = [
  { label: 'Fire', value: 'from-orange-500 to-red-600' },
  { label: 'Forest', value: 'from-emerald-400 to-teal-600' },
  { label: 'Arcane', value: 'from-fuchsia-500 to-purple-600' },
  { label: 'Ocean', value: 'from-cyan-400 to-blue-600' },
  { label: 'Nature', value: 'from-lime-400 to-green-600' },
  { label: 'Storm', value: 'from-violet-400 to-indigo-600' },
  { label: 'Solar', value: 'from-yellow-400 to-amber-600' },
  { label: 'Blood', value: 'from-rose-500 to-red-700' },
]

function ClassForm({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Class Name *</label>
          <input className="field" value={value.name || ''} onChange={e => {
            const name = e.target.value
            onChange({ ...value, name, id: slugify(name) })
          }} placeholder="e.g. Druid (Nature)" />
        </div>
        <div>
          <label className="field-label">ID (auto)</label>
          <input className="field font-mono text-xs bg-slate-800" value={value.id || ''} readOnly />
        </div>
      </div>

      <div>
        <label className="field-label">Description *</label>
        <input className="field" value={value.desc || ''} onChange={e => onChange({ ...value, desc: e.target.value })} placeholder="What does this class focus on?" />
      </div>

      <div>
        <label className="field-label">Lore / Flavor Text</label>
        <input className="field" value={value.lore || ''} onChange={e => onChange({ ...value, lore: e.target.value })} placeholder="One evocative sentence" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Icon</label>
          <select className="field" value={value.icon || ''} onChange={e => onChange({ ...value, icon: e.target.value })}>
            <option value="">Select…</option>
            {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Color Theme</label>
          <select className="field" value={value.color || ''} onChange={e => onChange({ ...value, color: e.target.value })}>
            <option value="">Select…</option>
            {COLOR_PRESETS.map(c => <option key={c.value} value={c.value}>{c.label} — {c.value}</option>)}
          </select>
        </div>
      </div>

      {value.color && (
        <div className={`h-10 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center`}>
          <span className="text-white text-xs font-bold opacity-80">Preview</span>
        </div>
      )}

      <div>
        <label className="field-label">Stat Bonus (choose one or two stats)</label>
        <div className="grid grid-cols-4 gap-2">
          {STAT_KEYS.map(stat => (
            <div key={stat}>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">{stat}</label>
              <input type="number" min="0" max="5" step="1" className="field text-sm"
                value={value.statBonuses?.[stat] || ''}
                onChange={e => {
                  const num = parseInt(e.target.value) || 0
                  const updated = { ...value.statBonuses }
                  if (num === 0) delete updated[stat]
                  else updated[stat] = num
                  onChange({ ...value, statBonuses: updated })
                }}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Plan Form ─────────────────────────────────────────────────────────────────
function PlanForm({ value, onChange }) {
  const addWorkout = () => onChange({ ...value, workouts: [...(value.workouts || []), { dayName: '', exercises: [] }] })
  const removeWorkout = i => onChange({ ...value, workouts: value.workouts.filter((_, j) => j !== i) })
  const updateWorkout = (i, field, val) => {
    const ws = [...(value.workouts || [])]
    ws[i] = { ...ws[i], [field]: val }
    onChange({ ...value, workouts: ws })
  }
  const addExercise = wi => {
    const ws = [...(value.workouts || [])]
    ws[wi] = { ...ws[wi], exercises: [...(ws[wi].exercises || []), { id: '', targetSets: 3, targetReps: 10 }] }
    onChange({ ...value, workouts: ws })
  }
  const updateExercise = (wi, ei, field, val) => {
    const ws = [...(value.workouts || [])]
    const exs = [...(ws[wi].exercises || [])]
    exs[ei] = { ...exs[ei], [field]: field === 'id' ? val : (parseFloat(val) || 0) }
    ws[wi] = { ...ws[wi], exercises: exs }
    onChange({ ...value, workouts: ws })
  }
  const removeExercise = (wi, ei) => {
    const ws = [...(value.workouts || [])]
    ws[wi] = { ...ws[wi], exercises: ws[wi].exercises.filter((_, j) => j !== ei) }
    onChange({ ...value, workouts: ws })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Plan Name *</label>
          <input className="field" value={value.name || ''} onChange={e => {
            const name = e.target.value
            onChange({ ...value, name, id: 'plan_' + slugify(name) })
          }} placeholder="e.g. The Iron Temple" />
        </div>
        <div>
          <label className="field-label">For Class</label>
          <input className="field" value={value.class || ''} onChange={e => onChange({ ...value, class: e.target.value })} placeholder="barbarian, monk, any…" />
        </div>
      </div>

      <div>
        <label className="field-label">Description</label>
        <input className="field" value={value.description || ''} onChange={e => onChange({ ...value, description: e.target.value })} placeholder="What is this plan about?" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Difficulty</label>
          <select className="field" value={value.difficulty || ''} onChange={e => onChange({ ...value, difficulty: e.target.value })}>
            <option value="">Select…</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Days per Week</label>
          <input type="number" min="1" max="7" className="field" value={value.daysPerWeek || ''} onChange={e => onChange({ ...value, daysPerWeek: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">Workout Days</label>
          <button type="button" onClick={addWorkout} className="text-xs text-brand-400 hover:text-brand-300">+ Add day</button>
        </div>
        <div className="space-y-3">
          {(value.workouts || []).map((w, wi) => (
            <div key={wi} className="border border-slate-700 rounded-xl p-3 space-y-2 bg-slate-900/50">
              <div className="flex gap-2 items-center">
                <input className="field flex-1 text-sm" value={w.dayName} onChange={e => updateWorkout(wi, 'dayName', e.target.value)} placeholder={`Day ${wi + 1} name`} />
                <button type="button" onClick={() => removeWorkout(wi)} className="text-slate-500 hover:text-red-400 text-sm px-1">✕</button>
              </div>
              {(w.exercises || []).map((ex, ei) => (
                <div key={ei} className="flex gap-2 items-center">
                  <input className="field flex-1 font-mono text-xs" value={ex.id} onChange={e => updateExercise(wi, ei, 'id', e.target.value)} placeholder="exercise_id" />
                  <input type="number" className="field w-16 text-sm" value={ex.targetSets} onChange={e => updateExercise(wi, ei, 'targetSets', e.target.value)} placeholder="sets" />
                  <input type="number" className="field w-16 text-sm" value={ex.targetReps} onChange={e => updateExercise(wi, ei, 'targetReps', e.target.value)} placeholder="reps" />
                  <button type="button" onClick={() => removeExercise(wi, ei)} className="text-slate-500 hover:text-red-400 text-sm px-1">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addExercise(wi)} className="text-xs text-slate-500 hover:text-slate-300">+ exercise</button>
            </div>
          ))}
          {!value.workouts?.length && (
            <p className="text-xs text-slate-600 italic">No workout days yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Save Actions Panel ────────────────────────────────────────────────────────
function SavePanel({ tab, data, onSaveLocal, onSaveCommunity, onClose }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(null) // null | 'saving' | 'done' | 'error'
  const [message, setMessage] = useState('')
  const [showJson, setShowJson] = useState(false)

  const isValid = data.name && (data.id || data.name) && (
    tab !== 'Exercise' || (data.type && data.difficulty)
  )

  const clean = { ...data }
  if (!clean.id) clean.id = slugify(clean.name || '')
  if (!clean.muscles) clean.muscles = { primary: [], secondary: [] }
  if (!clean.progressions) clean.progressions = { easier: [], harder: [] }
  if (!clean.instructions) clean.instructions = []
  if (!clean.statFocus) clean.statFocus = { STR: 1.0 }

  const jsonStr = JSON.stringify(clean, null, 2)

  async function handleLocal() {
    setStatus('saving')
    try {
      onSaveLocal(clean)
      setStatus('done')
      setMessage('Saved locally! It will appear in your exercises/plans immediately.')
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  async function handleCommunity() {
    if (!user) {
      setStatus('error')
      setMessage('You need to be logged in to share with the community.')
      return
    }
    setStatus('saving')
    try {
      await onSaveCommunity(clean)
      setStatus('done')
      setMessage('Shared with the community! Others will see it when they load the app.')
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  return (
    <div className="border-t border-slate-700 pt-4 space-y-3">
      {!isValid && (
        <p className="text-xs text-amber-400">Fill in the required fields (*) to enable saving.</p>
      )}

      {status === 'done' && (
        <div className="rounded-xl bg-emerald-900/40 border border-emerald-700 px-4 py-3 text-sm text-emerald-300">
          ✓ {message}
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-xl bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300">
          ✕ {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          disabled={!isValid || status === 'saving'}
          onClick={handleLocal}
          className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
        >
          💾 Save Locally
        </button>
        <button
          disabled={!isValid || status === 'saving' || !user}
          onClick={handleCommunity}
          title={!user ? 'Log in to share' : ''}
          className="flex-1 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
        >
          🌐 Share to Community
          {!user && <span className="block text-[10px] font-normal opacity-60">(log in required)</span>}
        </button>
      </div>

      <div>
        <button
          onClick={() => setShowJson(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-700 hover:border-brand-600 rounded-xl text-sm font-bold text-slate-300 transition-colors"
        >
          <span>⚔ Contribute to Repo (PR)</span>
          <span className="text-slate-500 font-normal text-xs">{showJson ? '▲ hide' : '▼ show'}</span>
        </button>
        {showJson && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy the JSON below, then open the file on GitHub and paste it into the array.
              Submit a pull request — once merged it becomes part of the official game for everyone.
            </p>
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 overflow-y-auto">
                {jsonStr}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(jsonStr)}
                className="absolute top-2 right-2 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-white rounded"
              >
                Copy
              </button>
            </div>
            <a
              href={GITHUB_FILES[tab]}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Open {tab === 'Exercise' ? 'exercises' : tab === 'Class' ? 'classes' : 'plans'}.json on GitHub →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function RPGContributeModal({ onClose }) {
  const { saveLocalExercise, saveLocalClass, saveLocalPlan, shareToCommunity } = useRPGContent()
  const [tab, setTab] = useState('Exercise')
  const [exerciseData, setExerciseData] = useState({ name: '', id: '', type: '', difficulty: '', statFocus: {}, instructions: [], muscles: { primary: [], secondary: [] } })
  const [classData, setClassData] = useState({ name: '', id: '', desc: '', lore: '', icon: '', color: '', statBonuses: {} })
  const [planData, setPlanData] = useState({ name: '', id: '', class: '', description: '', difficulty: '', daysPerWeek: 3, workouts: [] })

  const data = tab === 'Exercise' ? exerciseData : tab === 'Class' ? classData : planData
  const setData = tab === 'Exercise' ? setExerciseData : tab === 'Class' ? setClassData : setPlanData

  function handleSaveLocal(clean) {
    if (tab === 'Exercise') saveLocalExercise(clean)
    else if (tab === 'Class') saveLocalClass(clean)
    else saveLocalPlan(clean)
  }

  async function handleSaveCommunity(clean) {
    const type = tab === 'Exercise' ? 'exercises' : tab === 'Class' ? 'classes' : 'plans'
    await shareToCommunity(type, clean)
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-slate-700">
          <span className="text-xl">⚔</span>
          <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Contribute to the Game
          </h2>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 text-lg leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-slate-700">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                tab === t
                  ? 'text-brand-400 border-b-2 border-brand-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'Exercise' ? '🏋 Exercise' : t === 'Class' ? '⚡ Class' : '📋 Plan'}
            </button>
          ))}
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-xs text-slate-500 mb-4">
            {tab === 'Exercise'
              ? 'Add a new exercise to the game. It will show up in workout logging and plan building.'
              : tab === 'Class'
              ? 'Create a new hero class. Players will be able to pick it during onboarding.'
              : 'Build a structured training plan. Others can activate it in their dashboard.'}
          </p>

          {tab === 'Exercise' && <ExerciseForm value={exerciseData} onChange={setExerciseData} />}
          {tab === 'Class' && <ClassForm value={classData} onChange={setClassData} />}
          {tab === 'Plan' && <PlanForm value={planData} onChange={setPlanData} />}

          <div className="mt-6">
            <SavePanel
              tab={tab}
              data={data}
              onSaveLocal={handleSaveLocal}
              onSaveCommunity={handleSaveCommunity}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
