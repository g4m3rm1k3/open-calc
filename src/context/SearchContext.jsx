import { createContext, useState, useContext, useCallback, useMemo } from "react";
import { useSearch } from "../hooks/useSearch.js";

const SearchContext = createContext({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
  query: "",
  setQuery: () => {},
  results: [],
});

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchState = useSearch();

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    searchState.setQuery("");
  }, [searchState]);

  const { query, setQuery, results, isReady } = searchState;
  const value = useMemo(
    () => ({ query, setQuery, results, isReady, isOpen, openSearch, closeSearch }),
    [query, setQuery, results, isReady, isOpen, openSearch, closeSearch]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  return useContext(SearchContext);
}
