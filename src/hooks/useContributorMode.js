import { useState, useEffect } from 'react'

export function useContributorMode() {
  const isElectron = typeof window !== 'undefined' && !!window.openCalcDesktop
  const [devFsAvailable, setDevFsAvailable] = useState(false)
  const [isCloned, setIsCloned] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function probe() {
      try {
        const [pingRes, statusRes] = await Promise.all([
          fetch('/api/dev-fs/ping').then(r => r.ok ? r.json() : null).catch(() => null),
          isElectron
            ? window.openCalcDesktop.getContributorStatus()
            : Promise.resolve(null),
        ])

        if (cancelled) return
        setDevFsAvailable(!!pingRes?.ok)
        setIsCloned(statusRes?.cloned ?? false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    probe()
    return () => { cancelled = true }
  }, [isElectron])

  return { isElectron, isCloned, devFsAvailable, available: devFsAvailable, loading }
}
