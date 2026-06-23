import { useState, useCallback, useEffect, useRef } from 'react'

// Fired whenever a key is written to localStorage from outside a
// useLocalStorage hook instance — currently only AuthContext.jsx's
// cross-device sync merge, which writes the merged result directly via
// localStorage.setItem since it runs before/independent of any component
// mount. Without this, a hook that already mounted (and captured its
// initial state before the async Firestore merge resolved) never picks up
// the merged data — confirmed real bug: two genuinely signed-in devices
// showing different progress because neither tab ever re-read post-sync
// data without a full page reload.
const EXTERNAL_WRITE_EVENT = 'oc-localstorage-external-write'

export function writeLocalStorageKey(key, value) {
  try {
    window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(EXTERNAL_WRITE_EVENT, { detail: { key } }))
  } catch (e) {
    console.warn('localStorage error:', e)
  }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const initialValueRef = useRef(initialValue)
  initialValueRef.current = initialValue

  const setValue = useCallback((value) => {
    try {
      setStoredValue((currentValue) => {
        const valueToStore = value instanceof Function ? value(currentValue) : value
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        return valueToStore
      })
    } catch (e) {
      console.warn('localStorage error:', e)
    }
  }, [key])

  useEffect(() => {
    const onExternalWrite = (e) => {
      if (e.detail?.key !== key) return
      try {
        const item = window.localStorage.getItem(key)
        setStoredValue(item ? JSON.parse(item) : initialValueRef.current)
      } catch {}
    }
    window.addEventListener(EXTERNAL_WRITE_EVENT, onExternalWrite)
    return () => window.removeEventListener(EXTERNAL_WRITE_EVENT, onExternalWrite)
  }, [key])

  return [storedValue, setValue]
}
