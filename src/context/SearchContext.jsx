import { createContext, useState, useContext, useCallback } from 'react'
import { useSearch } from '../hooks/useSearch.js'

export const SearchContext = createContext({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
  query: '',
  setQuery: () => {},
  results: [],
})

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const searchState = useSearch()

  const openSearch = useCallback(() => setIsOpen(true), [])
  const closeSearch = useCallback(() => {
    setIsOpen(false)
    searchState.setQuery('')
  }, [searchState])

  return (
    <SearchContext.Provider value={{ ...searchState, isOpen, openSearch, closeSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchContext() {
  return useContext(SearchContext)
}
