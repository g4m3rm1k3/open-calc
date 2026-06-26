import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getExerciseDetails, EXERCISE_TYPES } from '../data/rpgExercises'
import { X, ChevronRight, Timer, SkipForward, CheckCircle, Trophy, Dumbbell } from 'lucide-react'

const DEFAULT_REST = 90 // seconds

function getDefaultMetrics(ex, planEx) {
  return {
    weight: '',
    sets: planEx?.targetSets || 3,
    reps: planEx?.targetReps || '',
    distance: planEx?.targetDistanceKm || '',
    duration: planEx?.targetDurationMinutes || '',
    rpe: 7,
    completedSets: [], // [{ reps, weight, duration, distance }] per completed set
  }
}

function RestTimer({ seconds, onDone, onSkip }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (remaining <= 0) { onDone(); return }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(intervalRef.current); onDone(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.round((remaining / seconds) * 100)
  const color = remaining > 30 ? '#10b981' : remaining > 10 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rest</p>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white tabular-nums">{remaining}</span>
          <span className="text-[10px] text-slate-400">sec</span>
        </div>
      </div>
      <button onClick={onSkip}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 text-sm transition-colors"
      >
        <SkipForward size={14} /> Skip rest
      </button>
    </div>
  )
}

function SetLogger({ ex, planEx, setNumber, totalSets, prevSet, onComplete, onSkip }) {
  const isWeighted = ex.type === EXERCISE_TYPES.WEIGHT_REPS
  const isBW = ex.type === EXERCISE_TYPES.BODYWEIGHT_REPS
  const isCardio = ex.type === EXERCISE_TYPES.DISTANCE_TIME
  const isTimed = ex.type === EXERCISE_TYPES.TIME_HOLD || ex.type === EXERCISE_TYPES.ISOMETRIC

  const [weight, setWeight] = useState(prevSet?.weight ?? planEx?.targetSets ? '' : '')
  const [reps, setReps] = useState(prevSet?.reps ?? planEx?.targetReps ?? '')
  const [distance, setDistance] = useState(prevSet?.distance ?? planEx?.targetDistanceKm ?? '')
  const [duration, setDuration] = useState(prevSet?.duration ?? planEx?.targetDurationMinutes ?? '')
  const [rpe, setRpe] = useState(7)

  // Pre-fill from last set
  useEffect(() => {
    if (prevSet) {
      if (prevSet.weight) setWeight(prevSet.weight)
      if (prevSet.reps) setReps(prevSet.reps)
    }
  }, [prevSet])

  const handleDone = () => {
    onComplete({ weight, reps, distance, duration, rpe })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          Set {setNumber} of {totalSets}
        </span>
        <button onClick={onSkip} className="text-xs text-slate-500 hover:text-slate-300">skip set</button>
      </div>

      {/* Dot indicators for sets */}
      <div className="flex gap-2">
        {Array.from({ length: totalSets }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${
            i < setNumber - 1 ? 'bg-emerald-500' : i === setNumber - 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
          }`} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isWeighted && (
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Weight (lbs)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder={planEx?.targetSets ? '—' : 'lbs'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-lg font-bold text-white text-center focus:border-emerald-500 outline-none"
            />
          </div>
        )}
        {(isWeighted || isBW) && (
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Reps</label>
            <input type="number" value={reps} onChange={e => setReps(e.target.value)}
              placeholder={String(planEx?.targetReps || '—')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-lg font-bold text-white text-center focus:border-emerald-500 outline-none"
            />
          </div>
        )}
        {isCardio && (
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-1">Distance (km)</label>
            <input type="number" value={distance} onChange={e => setDistance(e.target.value)}
              placeholder={String(planEx?.targetDistanceKm || '—')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-lg font-bold text-white text-center focus:border-emerald-500 outline-none"
            />
          </div>
        )}
        {isTimed && (
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-1">Duration (minutes)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              placeholder={String(planEx?.targetDurationMinutes || '—')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-lg font-bold text-white text-center focus:border-emerald-500 outline-none"
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
          <span>RPE (effort)</span>
          <span className="text-emerald-400">{rpe}/10</span>
        </div>
        <input type="range" min="1" max="10" value={rpe} onChange={e => setRpe(Number(e.target.value))}
          className="w-full accent-emerald-500 h-2"
        />
      </div>

      <button onClick={handleDone}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <CheckCircle size={20} /> Set Done
      </button>
    </div>
  )
}

export default function ActiveWorkoutModal({ exercises, planName, onComplete, onClose, personalRecords = {} }) {
  // exercises: [{ id, targetSets, targetReps, targetDistanceKm, targetDurationMinutes }]
  const [exIdx, setExIdx] = useState(0)
  const [phase, setPhase] = useState('set') // 'set' | 'rest' | 'done'
  const [restSeconds, setRestSeconds] = useState(DEFAULT_REST)
  const [allLogs, setAllLogs] = useState([]) // [{ exerciseId, metrics }]
  const [exLogs, setExLogs] = useState({}) // { exerciseId: { completedSets: [], currentSet: 1 } }
  const [sessionXp, setSessionXp] = useState(0)

  const currentPlanEx = exercises[exIdx]
  const currentEx = getExerciseDetails(currentPlanEx?.id)
  const currentLog = exLogs[currentPlanEx?.id] || { completedSets: [], currentSet: 1 }
  const totalSets = currentPlanEx?.targetSets || 3
  const isLastEx = exIdx === exercises.length - 1
  const isLastSet = currentLog.currentSet >= totalSets

  const prevSet = currentLog.completedSets.at(-1) || null

  const xpForEntry = useCallback((exerciseId, metrics) => {
    const ex = getExerciseDetails(exerciseId)
    if (!ex) return 0
    const w = parseFloat(metrics.weight) || 0
    const s = parseInt(metrics.sets) || 1
    const r = parseInt(metrics.reps) || 0
    const dKm = parseFloat(metrics.distance) || 0
    const dMin = parseFloat(metrics.duration) || 0
    const rpe = parseInt(metrics.rpe) || 7
    let xp = 0
    if (ex.type === EXERCISE_TYPES.WEIGHT_REPS) xp = s * r * ex.baseXpPerRep * (w > 0 ? w / 20 : 1)
    else if (ex.type === EXERCISE_TYPES.BODYWEIGHT_REPS) xp = s * r * ex.baseXpPerRep
    else if (ex.type === EXERCISE_TYPES.DISTANCE_TIME) xp = dKm * (ex.baseXpPerKm || 100)
    else xp = dMin * (ex.baseXpPerMinute || 20) * s
    return Math.round(xp * (1 + ((rpe - 5) * 0.05)))
  }, [])

  const handleSetDone = (setData) => {
    const exId = currentPlanEx.id
    const updatedSets = [...currentLog.completedSets, setData]
    setExLogs(prev => ({ ...prev, [exId]: { completedSets: updatedSets, currentSet: currentLog.currentSet + 1 } }))

    if (isLastSet) {
      // All sets done for this exercise — aggregate into a single log entry
      const allSets = updatedSets
      const avgWeight = allSets.reduce((s, x) => s + (parseFloat(x.weight) || 0), 0) / allSets.length
      const avgReps = allSets.reduce((s, x) => s + (parseInt(x.reps) || 0), 0) / allSets.length
      const avgRpe = allSets.reduce((s, x) => s + (parseInt(x.rpe) || 7), 0) / allSets.length
      const metrics = {
        sets: allSets.length,
        weight: avgWeight || '',
        reps: Math.round(avgReps) || '',
        distance: allSets[0]?.distance || '',
        duration: allSets[0]?.duration || '',
        rpe: Math.round(avgRpe),
      }
      const xp = xpForEntry(exId, metrics)
      setSessionXp(s => s + xp)
      setAllLogs(prev => [...prev, {
        exerciseId: exId,
        metrics,
        calculatedXp: xp,
        statGains: (() => {
          const ex = getExerciseDetails(exId)
          if (!ex) return {}
          const g = {}
          Object.keys(ex.statFocus).forEach(stat => { g[stat] = (xp * ex.statFocus[stat]) * 0.1 })
          return g
        })(),
      }])

      if (isLastEx) {
        setPhase('done')
      } else {
        setPhase('rest')
      }
    } else {
      setPhase('rest')
    }
  }

  const handleRestDone = () => {
    setPhase('set')
    if (isLastSet && !isLastEx) {
      setExIdx(i => i + 1)
      setExLogs(prev => {
        const nxt = exercises[exIdx + 1]?.id
        if (nxt && !prev[nxt]) return { ...prev, [nxt]: { completedSets: [], currentSet: 1 } }
        return prev
      })
    }
  }

  const skipToNext = () => {
    if (!isLastEx) {
      setExIdx(i => i + 1)
      setPhase('set')
    } else {
      setPhase('done')
    }
  }

  if (!currentEx && phase !== 'done') return null

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Session</p>
          <p className="text-sm font-bold text-slate-200 truncate">{planName}</p>
        </div>
        <div className="text-sm font-mono text-emerald-400 font-bold bg-emerald-900/30 px-2 py-1 rounded-lg">
          +{sessionXp} XP
        </div>
        <button onClick={onClose}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Exercise progress strip */}
      <div className="shrink-0 flex gap-1 px-4 py-2 bg-slate-900/50">
        {exercises.map((ex, i) => {
          const exData = getExerciseDetails(ex.id)
          const log = exLogs[ex.id]
          const done = log && log.completedSets.length >= (ex.targetSets || 3)
          return (
            <div key={i} className={`flex-1 rounded-full h-1.5 transition-colors ${
              done ? 'bg-emerald-500' : i === exIdx ? 'bg-emerald-300 animate-pulse' : 'bg-slate-700'
            }`} title={exData?.name} />
          )
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {phase === 'done' ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <div className="text-8xl">🏆</div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-center">
                Session Complete!
              </h2>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-3xl font-black text-emerald-400">+{sessionXp}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">XP Earned</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-cyan-400">{allLogs.length}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Exercises</p>
                </div>
              </div>
              <div className="w-full space-y-2 max-w-sm">
                {allLogs.map((log, i) => {
                  const ex = getExerciseDetails(log.exerciseId)
                  const m = log.metrics
                  const detail = m.reps ? `${m.sets}×${m.reps}${m.weight ? ` @ ${m.weight}lbs` : ''}`
                    : m.distance ? `${m.distance}km` : m.duration ? `${m.duration}min` : ''
                  return (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 text-sm">
                      <span className="text-slate-300">{ex?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">{detail}</span>
                        <span className="text-emerald-400 font-mono text-xs">+{log.calculatedXp} XP</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => onComplete(allLogs)}
                className="w-full max-w-sm py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98]"
              >
                Save to Ledger ⚔
              </button>
            </motion.div>
          ) : phase === 'rest' ? (
            <motion.div key={`rest-${exIdx}-${currentLog.currentSet}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-2">
                <p className="text-slate-300 font-bold">{currentEx?.name}</p>
                <p className="text-xs text-slate-500">Set {currentLog.currentSet - 1} done ✓</p>
              </div>
              <RestTimer
                seconds={restSeconds}
                onDone={handleRestDone}
                onSkip={handleRestDone}
              />
              <div className="flex items-center justify-center gap-3 mt-2">
                <p className="text-xs text-slate-500">Rest duration:</p>
                {[30, 60, 90, 120, 180].map(s => (
                  <button key={s} onClick={() => setRestSeconds(s)}
                    className={`text-xs px-2 py-1 rounded ${restSeconds === s ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >{s}s</button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={`set-${exIdx}-${currentLog.currentSet}`}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              {/* Exercise header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{exIdx + 1} / {exercises.length}</span>
                  <button onClick={skipToNext} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                    Skip exercise <ChevronRight size={12} />
                  </button>
                </div>
                <h3 className="text-2xl font-black text-white">{currentEx?.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{currentEx?.description}</p>
                {/* PR badge */}
                {personalRecords[currentPlanEx.id] && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg w-fit">
                    <Trophy size={10} /> PR: {
                      personalRecords[currentPlanEx.id].weight
                        ? `${personalRecords[currentPlanEx.id].weight}lbs × ${personalRecords[currentPlanEx.id].reps}`
                        : personalRecords[currentPlanEx.id].reps
                        ? `${personalRecords[currentPlanEx.id].reps} reps`
                        : `${personalRecords[currentPlanEx.id].distance}km`
                    }
                  </div>
                )}
                {/* Form cue */}
                {currentEx?.instructions?.[0] && (
                  <p className="text-xs text-slate-500 italic mt-2">💡 {currentEx.instructions[0]}</p>
                )}
              </div>

              <SetLogger
                ex={currentEx}
                planEx={currentPlanEx}
                setNumber={currentLog.currentSet}
                totalSets={totalSets}
                prevSet={prevSet}
                onComplete={handleSetDone}
                onSkip={() => {
                  if (isLastSet) {
                    if (isLastEx) setPhase('done')
                    else { setExIdx(i => i + 1); setPhase('set') }
                  } else {
                    setExLogs(prev => ({
                      ...prev,
                      [currentPlanEx.id]: { ...currentLog, currentSet: currentLog.currentSet + 1 }
                    }))
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
