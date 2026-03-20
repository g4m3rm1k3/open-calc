import Fuse from 'fuse.js'
import { useState, useEffect, useMemo, useRef } from 'react'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [isReady, setIsReady] = useState(false)
  const fuseRef = useRef(null)
  const docsRef = useRef([])

  useEffect(() => {
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data) => {
        docsRef.current = data.documents
        fuseRef.current = new Fuse(data.documents, {
          keys: [
            { name: 'title', weight: 4 },
            { name: 'subtitle', weight: 2 },
            { name: 'tags', weight: 2 },
            { name: 'content', weight: 1 },
          ],
          includeMatches: true,
          threshold: 0.35,
          minMatchCharLength: 2,
          ignoreLocation: true,
        })
        setIsReady(true)
      })
      .catch(() => {
        // Search index not yet built — silently continue
        setIsReady(false)
      })
  }, [])

  const results = useMemo(() => {
    if (!fuseRef.current || query.length < 2) return []
    return fuseRef.current.search(query).slice(0, 15)
  }, [query, isReady])

  return { query, setQuery, results, isReady }
}
