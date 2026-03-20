import { useEffect } from 'react'
import { useSearchContext } from '../context/SearchContext.jsx'

export default function SearchPage() {
  const { openSearch } = useSearchContext()
  useEffect(() => { openSearch() }, [])
  return (
    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
      <p>Opening search…</p>
    </div>
  )
}
