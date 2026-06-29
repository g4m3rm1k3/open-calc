import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const PinsContext = createContext(null)

// Shown in Favourites for users who haven't customised yet.
// Format must match the rich pin shape used by StartMenu.
const DEFAULT_PINS = [
  { id: 'openmat',        label: 'OpenMAT',        emoji: '⚛️', type: 'lab',    path: '/openmat',              labKey: 'openmat' },
  { id: 'python',         label: 'Python',          emoji: '🐍', type: 'course', path: '/course/python' },
  { id: 'linear-algebra', label: 'Linear Algebra',  emoji: '🔢', type: 'course', path: '/course/linear-algebra' },
]

export function PinsProvider({ children }) {
  const [pins, setPins] = useState(() => {
    try {
      // 'oc-pins-seeded' is set the moment we write defaults for the first time.
      // Without this flag the old code always wrote '[]' so raw !== null was true
      // even on a clean install, meaning defaults were never applied.
      if (!localStorage.getItem('oc-pins-seeded')) {
        localStorage.setItem('oc-pins-seeded', '1')
        localStorage.setItem('oc-pins', JSON.stringify(DEFAULT_PINS))
        return DEFAULT_PINS
      }
      return JSON.parse(localStorage.getItem('oc-pins') || '[]')
    } catch { return DEFAULT_PINS }
  })

  useEffect(() => {
    localStorage.setItem('oc-pins', JSON.stringify(pins))
  }, [pins])

  const addPin = useCallback((pin) => {
    setPins(prev => prev.some(p => p.id === pin.id) ? prev : [pin, ...prev])
  }, [])

  const removePin = useCallback((id) => {
    setPins(prev => prev.filter(p => p.id !== id))
  }, [])

  const isPinned = useCallback((id) => pins.some(p => p.id === id), [pins])

  const value = useMemo(
    () => ({ pins, addPin, removePin, isPinned }),
    [pins, addPin, removePin, isPinned]
  )

  return (
    <PinsContext.Provider value={value}>
      {children}
    </PinsContext.Provider>
  )
}

export function usePins() {
  return useContext(PinsContext)
}
