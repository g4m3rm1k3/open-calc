import { createContext, useContext, useState, useEffect } from 'react'

const PinsContext = createContext(null)

export function PinsProvider({ children }) {
  const [pins, setPins] = useState(() => {
    try { return JSON.parse(localStorage.getItem('oc-pins') || '[]') }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('oc-pins', JSON.stringify(pins))
  }, [pins])

  function addPin(pin) {
    // pin: { id, title, subtitle, path }
    setPins(prev => prev.some(p => p.id === pin.id) ? prev : [pin, ...prev])
  }

  function removePin(id) {
    setPins(prev => prev.filter(p => p.id !== id))
  }

  function isPinned(id) {
    return pins.some(p => p.id === id)
  }

  return (
    <PinsContext.Provider value={{ pins, addPin, removePin, isPinned }}>
      {children}
    </PinsContext.Provider>
  )
}

export function usePins() {
  return useContext(PinsContext)
}
