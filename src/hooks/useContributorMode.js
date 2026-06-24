import { useState, useEffect } from 'react'

export function useContributorMode() {
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dev-fs/ping')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (d?.ok) setAvailable(true) })
      .catch(() => setAvailable(false))
      .finally(() => setLoading(false))
  }, [])

  return { available, loading }
}
