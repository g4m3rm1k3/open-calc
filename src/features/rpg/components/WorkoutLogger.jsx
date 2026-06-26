import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRPGContent } from '../hooks/useRPGContent'
import { EXERCISE_TYPES } from '../data/rpgExercises'
import { Dumbbell, Activity, Wind, Hand, X, Plus, PlaySquare, Trophy, Zap, ChevronUp, Search } from 'lucide-react'
import ActiveWorkoutModal from './ActiveWorkoutModal'

const EQUIPMENT_FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'barbell',    label: 'Barbell' },
  { id: 'dumbbell',   label: 'Dumbbells' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'bodyweight', label: 'Bodyweight' },
  { id: 'machine',    label: 'Machine' },
  { id: 'cardio',     label: 'Cardio' },
  { id: 'mobility',   label: 'Mobility' },
]

function equipmentMatch(exId, filter) {
  if (filter === 'all') return true
  if (filter === 'barbell')    return exId.startsWith('barbell_')
  if (filter === 'dumbbell')   return exId.startsWith('db_')
  if (filter === 'kettlebell') return exId.startsWith('kb_')
  if (filter === 'bodyweight') return exId.startsWith('bw_') || exId.startsWith('iso_')
  if (filter === 'machine')    return exId.startsWith('machine_')
  if (filter === 'cardio')     return exId.startsWith('cardio_')
  if (filter === 'mobility')   return exId.startsWith('mob_')
  return true
}

function getIconForType(type) {
  if (type === EXERCISE_TYPES.WEIGHT_REPS || type === EXERCISE_TYPES.BODYWEIGHT_REPS) return <Dumbbell size={18} className="text-emerald-400" />
  if (type === EXERCISE_TYPES.DISTANCE_TIME) return <Wind size={18} className="text-cyan-400" />
  if (type === EXERCISE_TYPES.TIME_HOLD || type === EXERCISE_TYPES.ISOMETRIC) return <Hand size={18} className="text-fuchsia-400" />
  return <Activity size={18} className="text-orange-400" />
}

function formatPR(pr, type) {
  if (!pr) return null
  if (type === EXERCISE_TYPES.WEIGHT_REPS) return `${pr.weight}lbs × ${pr.reps}`
  if (type === EXERCISE_TYPES.BODYWEIGHT_REPS) return `${pr.reps} reps`
  if (type === EXERCISE_TYPES.DISTANCE_TIME) return `${pr.distance}km`
  if (type === EXERCISE_TYPES.TIME_HOLD || type === EXERCISE_TYPES.ISOMETRIC) return `${pr.duration}min`
  return null
}

function OverloadHint({ exerciseId, sessionLogs }) {
  const hint = useMemo(() => {
    if (!sessionLogs?.length) return null
    // Find last session where this exercise was logged
    for (const session of sessionLogs) {
      if (session.exerciseIds?.includes(exerciseId)) {
        // We don't store per-exercise weight in sessionLogs, just a hint based on presence
        return { sessionDate: session.date }
      }
    }
    return null
  }, [exerciseId, sessionLogs])

  if (!hint) return null
  const daysAgo = Math.floor((Date.now() - new Date(hint.sessionDate).getTime()) / 86_400_000)
  return (
    <span className="text-[10px] text-cyan-500 bg-cyan-900/20 border border-cyan-800/50 px-1.5 py-0.5 rounded flex items-center gap-1">
      <ChevronUp size={9} /> trained {daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`}
    </span>
  )
}

export function WorkoutLogger({ logDetailedWorkout, activePlan, personalRecords = {}, sessionLogs = [] }) {
  const { exercises: allExercises } = useRPGContent()
  const [activeDayIdx, setActiveDayIdx] = useState(0)
  const [workoutRows, setWorkoutRows] = useState([])
  const [levelUpMessage, setLevelUpMessage] = useState(false)
  const [newPrNames, setNewPrNames] = useState([])
  const [newAchievements, setNewAchievements] = useState([])
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [equipFilter, setEquipFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveModal, setShowActiveModal] = useState(false)

  useEffect(() => {
    if (!activePlan) { setWorkoutRows([]); return }
    if (activePlan.workouts?.[activeDayIdx]) {
      const dayExercises = activePlan.workouts[activeDayIdx].exercises.map((ex, idx) => ({
        ...ex,
        rowId: `row-${activePlan.id}-${activeDayIdx}-${idx}`,
        metrics: {
          weight: '', sets: ex.targetSets || '', reps: ex.targetReps || '',
          distance: ex.targetDistanceKm || '', duration: ex.targetDurationMinutes || '', rpe: 5,
        },
      }))
      setWorkoutRows(dayExercises)
    } else {
      setWorkoutRows([])
    }
  }, [activePlan, activeDayIdx])

  const handleMetricChange = (rowId, field, value) => {
    setWorkoutRows(rows => rows.map(row =>
      row.rowId === rowId ? { ...row, metrics: { ...row.metrics, [field]: value } } : row
    ))
  }

  const removeRow = (rowId) => setWorkoutRows(rows => rows.filter(r => r.rowId !== rowId))

  const addRow = (exerciseId) => {
    setWorkoutRows(rows => [...rows, {
      id: exerciseId,
      rowId: `row-spontaneous-${Date.now()}`,
      metrics: { weight: '', sets: '', reps: '', distance: '', duration: '', rpe: 5 },
    }])
    setShowAddMenu(false)
  }

  const calculateRowXpAndStats = (row) => {
    const exDb = allExercises.find(e => e.id === row.id)
    if (!exDb) return { xp: 0, statGains: {} }
    let xp = 0
    const m = row.metrics
    const w = parseFloat(m.weight) || 0
    const s = parseInt(m.sets) || 1
    const r = parseInt(m.reps) || 0
    const dKm = parseFloat(m.distance) || 0
    const dMin = parseFloat(m.duration) || 0
    const rpe = parseInt(m.rpe) || 5
    if (exDb.type === EXERCISE_TYPES.WEIGHT_REPS) xp = s * r * exDb.baseXpPerRep * (w > 0 ? w / 20 : 1)
    else if (exDb.type === EXERCISE_TYPES.BODYWEIGHT_REPS) xp = s * r * exDb.baseXpPerRep
    else if (exDb.type === EXERCISE_TYPES.DISTANCE_TIME) xp = dKm * (exDb.baseXpPerKm || 100)
    else xp = dMin * (exDb.baseXpPerMinute || 20) * s
    xp = Math.round(xp * (1 + ((rpe - 5) * 0.05)))
    const statGains = {}
    Object.keys(exDb.statFocus || {}).forEach(stat => { statGains[stat] = (xp * exDb.statFocus[stat]) * 0.1 })
    return { xp, statGains }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const entries = workoutRows.map(row => {
      const { xp, statGains } = calculateRowXpAndStats(row)
      return xp > 0 ? { exerciseId: row.id, metrics: row.metrics, calculatedXp: xp, statGains } : null
    }).filter(Boolean)
    if (!entries.length) return
    const planName = activePlan?.name || 'Workout'
    const { leveledUp, newPrs, newAchievements: earned } = logDetailedWorkout(entries, planName)
    if (leveledUp) { setLevelUpMessage(true); setTimeout(() => setLevelUpMessage(false), 5000) }
    if (newPrs?.length) { setNewPrNames(newPrs); setTimeout(() => setNewPrNames([]), 5000) }
    if (earned?.length) { setNewAchievements(earned); setTimeout(() => setNewAchievements([]), 6000) }
    setWorkoutRows(rows => rows.map(r => ({
      ...r, metrics: { weight: '', sets: '', reps: '', distance: '', duration: '', rpe: 5 },
    })))
  }

  const handleActiveComplete = (entries) => {
    const planName = activePlan?.name || 'Active Session'
    const { leveledUp, newPrs, newAchievements: earned } = logDetailedWorkout(entries, planName)
    setShowActiveModal(false)
    if (leveledUp) { setLevelUpMessage(true); setTimeout(() => setLevelUpMessage(false), 5000) }
    if (newPrs?.length) { setNewPrNames(newPrs); setTimeout(() => setNewPrNames([]), 5000) }
    if (earned?.length) { setNewAchievements(earned); setTimeout(() => setNewAchievements([]), 6000) }
  }

  const totalPreviewXp = workoutRows.reduce((sum, row) => sum + calculateRowXpAndStats(row).xp, 0)

  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      if (!equipmentMatch(ex.id, equipFilter)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return ex.name.toLowerCase().includes(q) ||
          (ex.muscles?.primary || []).some(m => m.includes(q))
      }
      return true
    })
  }, [allExercises, equipFilter, searchQuery])

  if (!activePlan) {
    return (
      <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 text-center backdrop-blur-xl">
        <PlaySquare className="text-slate-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-300 mb-2">No Active Plan</h3>
        <p className="text-slate-500">Select a training tome from the Plan Builder above to begin your session.</p>
      </div>
    )
  }

  const activeDay = activePlan.workouts?.[activeDayIdx]

  return (
    <>
      <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 relative backdrop-blur-xl">
        {/* Overlay announcements */}
        <AnimatePresence>
          {levelUpMessage && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl">
              <span className="text-5xl mb-4">⚡</span>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-center uppercase tracking-widest">Level Up!</h2>
              <p className="text-emerald-200 mt-2 font-bold">Your power grows.</p>
            </motion.div>
          )}
          {!levelUpMessage && newPrNames.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl">
              <Trophy size={64} className="text-amber-400 mb-4 animate-bounce" />
              <h2 className="text-4xl font-black text-amber-400 text-center uppercase">New Record!</h2>
              <div className="mt-3 space-y-1 text-center">
                {newPrNames.map(name => <p key={name} className="text-amber-200 font-bold">{name}</p>)}
              </div>
            </motion.div>
          )}
          {!levelUpMessage && !newPrNames.length && newAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl">
              <span className="text-6xl mb-4">🏅</span>
              <h2 className="text-3xl font-black text-fuchsia-400 text-center uppercase">Achievement Unlocked!</h2>
              <div className="mt-3 space-y-2 text-center">
                {newAchievements.map(({ id }) => (
                  <p key={id} className="text-fuchsia-200 font-bold">{id.replace(/_/g, ' ')}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {activePlan.name}
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Daily Log</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Active session button */}
            {activeDay?.exercises?.length > 0 && (
              <button
                onClick={() => setShowActiveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-700 to-cyan-700 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-black rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                ▶ Start Session
              </button>
            )}
            {/* Day switcher */}
            {activePlan.workouts?.length > 1 && (
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg">
                {activePlan.workouts.map((day, idx) => (
                  <button key={idx} onClick={() => setActiveDayIdx(idx)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      activeDayIdx === idx ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {day.dayName || `Day ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {workoutRows.map((row) => {
            const exDb = allExercises.find(e => e.id === row.id)
            if (!exDb) return null
            return (
              <motion.div key={row.rowId} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden">
                <button type="button" onClick={() => removeRow(row.rowId)}
                  className="absolute top-2 right-2 p-2 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">{getIconForType(exDb.type)}</div>
                  <div>
                    <h4 className="font-bold text-slate-200">{exDb.name}</h4>
                    <div className="flex items-center flex-wrap gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{Object.keys(exDb.statFocus || {}).join(' | ')}</p>
                      {formatPR(personalRecords[row.id], exDb.type) && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                          <Trophy size={9} /> PR: {formatPR(personalRecords[row.id], exDb.type)}
                        </span>
                      )}
                      <OverloadHint exerciseId={row.id} sessionLogs={sessionLogs} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-1">
                  {exDb.type === EXERCISE_TYPES.WEIGHT_REPS && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Weight</label>
                      <input type="number" placeholder="lbs" value={row.metrics.weight} onChange={e => handleMetricChange(row.rowId, 'weight', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                    </div>
                  )}
                  {(exDb.type === EXERCISE_TYPES.WEIGHT_REPS || exDb.type === EXERCISE_TYPES.BODYWEIGHT_REPS || exDb.type === EXERCISE_TYPES.TIME_HOLD || exDb.type === EXERCISE_TYPES.ISOMETRIC) && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Sets</label>
                      <input type="number" placeholder="sets" value={row.metrics.sets} onChange={e => handleMetricChange(row.rowId, 'sets', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                    </div>
                  )}
                  {(exDb.type === EXERCISE_TYPES.WEIGHT_REPS || exDb.type === EXERCISE_TYPES.BODYWEIGHT_REPS) && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Reps</label>
                      <input type="number" placeholder="reps" value={row.metrics.reps} onChange={e => handleMetricChange(row.rowId, 'reps', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                    </div>
                  )}
                  {exDb.type === EXERCISE_TYPES.DISTANCE_TIME && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Dist (km)</label>
                      <input type="number" placeholder="km" value={row.metrics.distance} onChange={e => handleMetricChange(row.rowId, 'distance', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                    </div>
                  )}
                  {(exDb.type === EXERCISE_TYPES.DISTANCE_TIME || exDb.type === EXERCISE_TYPES.TIME_HOLD || exDb.type === EXERCISE_TYPES.ISOMETRIC) && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Time (m)</label>
                      <input type="number" placeholder="mins" value={row.metrics.duration} onChange={e => handleMetricChange(row.rowId, 'duration', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                    </div>
                  )}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">RPE</label>
                      <span className="text-[10px] font-mono text-emerald-400">{row.metrics.rpe}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={row.metrics.rpe} onChange={e => handleMetricChange(row.rowId, 'rpe', e.target.value)}
                      className="w-full accent-emerald-500 h-2" />
                  </div>
                </div>
                {/* XP preview */}
                {calculateRowXpAndStats(row).xp > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-500/70">
                    <Zap size={9} /> {calculateRowXpAndStats(row).xp} XP
                  </div>
                )}
              </motion.div>
            )
          })}

          {/* Add exercise */}
          <div className="relative">
            {showAddMenu ? (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 z-10 shadow-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Add Exercise</span>
                  <button type="button" onClick={() => setShowAddMenu(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search exercises…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                {/* Equipment filter */}
                <div className="flex flex-wrap gap-1">
                  {EQUIPMENT_FILTERS.map(f => (
                    <button key={f.id} type="button" onClick={() => setEquipFilter(f.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        equipFilter === f.id ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {filteredExercises.map(ex => (
                    <button key={ex.id} type="button" onClick={() => addRow(ex.id)}
                      className="text-left w-full px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300 text-sm flex items-center justify-between gap-2">
                      <span className="truncate">{ex.name}</span>
                      <span className="text-[10px] text-emerald-500/50 shrink-0">{Object.keys(ex.statFocus || {}).join(', ')}</span>
                    </button>
                  ))}
                  {!filteredExercises.length && (
                    <p className="text-xs text-slate-600 text-center py-4">No exercises match</p>
                  )}
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowAddMenu(true)}
                className="w-full py-3 border border-dashed border-slate-600 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                <Plus size={18} /> Add Spontaneous Exercise
              </button>
            )}
          </div>

          <button type="submit" disabled={totalPreviewXp === 0}
            className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:scale-[1.01] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:scale-100 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none flex items-center justify-center gap-2 transition-all">
            Transcribe to Ledger <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-sm">+{totalPreviewXp} XP</span>
          </button>
        </form>
      </div>

      {/* Active workout overlay */}
      {showActiveModal && activeDay?.exercises && (
        <ActiveWorkoutModal
          exercises={activeDay.exercises}
          planName={`${activePlan.name} — ${activeDay.dayName || `Day ${activeDayIdx + 1}`}`}
          personalRecords={personalRecords}
          onComplete={handleActiveComplete}
          onClose={() => setShowActiveModal(false)}
        />
      )}
    </>
  )
}
