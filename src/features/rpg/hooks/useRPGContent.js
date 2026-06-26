import { useState, useEffect } from 'react'
import { db } from '../../../firebase'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../../../context/AuthContext'
import baseExercises from '../../../data/rpg/exercises.json'
import baseClasses from '../../../data/rpg/classes.json'
import basePlans from '../../../data/rpg/plans.json'

const LOCAL_KEY = 'oc-rpg-custom'

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveLocal(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

// Merge arrays by id — custom entries override base entries with same id, new ids are appended
function mergeById(base, ...layers) {
  const map = new Map(base.map(item => [item.id, item]))
  for (const layer of layers) {
    if (!Array.isArray(layer)) continue
    for (const item of layer) {
      if (item?.id) map.set(item.id, item)
    }
  }
  return Array.from(map.values())
}

export function useRPGContent() {
  const { user } = useAuth()
  const [communityExercises, setCommunityExercises] = useState([])
  const [communityClasses, setCommunityClasses] = useState([])
  const [communityPlans, setCommunityPlans] = useState([])
  const [communityLoading, setCommunityLoading] = useState(false)

  const [localCustom, setLocalCustom] = useState(() => loadLocal())

  // Fetch community content from Firebase once on mount
  useEffect(() => {
    setCommunityLoading(true)
    Promise.all([
      getDocs(collection(db, 'rpgContent', 'exercises', 'community')).catch(() => null),
      getDocs(collection(db, 'rpgContent', 'classes', 'community')).catch(() => null),
      getDocs(collection(db, 'rpgContent', 'plans', 'community')).catch(() => null),
    ]).then(([exSnap, clSnap, plSnap]) => {
      if (exSnap) setCommunityExercises(exSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      if (clSnap) setCommunityClasses(clSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      if (plSnap) setCommunityPlans(plSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }).finally(() => setCommunityLoading(false))
  }, [])

  const exercises = mergeById(
    baseExercises.exercises,
    communityExercises,
    localCustom.exercises,
  )
  const classes = mergeById(
    baseClasses,
    communityClasses,
    localCustom.classes,
  )
  const plans = mergeById(
    basePlans,
    communityPlans,
    localCustom.plans,
  )

  // Save a new entry to localStorage (always available)
  function saveLocal_exercise(exercise) {
    const updated = { ...loadLocal(), exercises: [...(loadLocal().exercises || []), exercise] }
    saveLocal(updated)
    setLocalCustom(updated)
  }

  function saveLocal_class(cls) {
    const updated = { ...loadLocal(), classes: [...(loadLocal().classes || []), cls] }
    saveLocal(updated)
    setLocalCustom(updated)
  }

  function saveLocal_plan(plan) {
    const updated = { ...loadLocal(), plans: [...(loadLocal().plans || []), plan] }
    saveLocal(updated)
    setLocalCustom(updated)
  }

  // Share to Firebase community collection (requires auth)
  async function shareToCommunity(type, item) {
    if (!user) throw new Error('Must be logged in to share')
    const payload = { ...item, submittedBy: user.uid, submittedAt: serverTimestamp() }
    const collPath = `rpgContent/${type}/community`
    const ref = await addDoc(collection(db, ...collPath.split('/')), payload)
    const withId = { ...item, id: item.id || ref.id }
    if (type === 'exercises') setCommunityExercises(prev => [...prev, withId])
    if (type === 'classes') setCommunityClasses(prev => [...prev, withId])
    if (type === 'plans') setCommunityPlans(prev => [...prev, withId])
    return ref.id
  }

  return {
    exercises,
    classes,
    plans,
    loading: communityLoading,
    baseExerciseTypes: baseExercises.types,
    baseStats: baseExercises.stats,
    saveLocalExercise: saveLocal_exercise,
    saveLocalClass: saveLocal_class,
    saveLocalPlan: saveLocal_plan,
    shareToCommunity,
  }
}
