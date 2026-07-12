---
series: react-fundamentals
level: 4
title: React — Putting It Together
lang: javascript
---

# React — Putting It Together

You have covered the React model (UI as a function of state, virtual DOM, components), useState and event handling, useEffect and data fetching, and component composition with custom hooks. This capstone lesson builds a complete feature: a searchable user list with filtering, pagination, and error handling.

## The feature

A `UserListPage` component that:
- Fetches users from an API
- Shows a search input that filters results
- Paginates results (cursor-based, "load more")
- Handles loading and error states
- Lets users click a user to view their details

## Component breakdown

```text
UserListPage
├── SearchInput        — controlled input, debounced search
├── UserList
│   ├── LoadingSpinner — shows while fetching
│   ├── ErrorMessage   — shows on fetch failure
│   └── UserCard (×N) — one per user in the current page
└── LoadMoreButton     — loads next page via cursor
```

## The custom hook: useUserList

```javascript
// This hook encapsulates all the state and data-fetching logic for the user list.
// The component only deals with rendering.

function useUserList({ searchQuery, pageSize = 20 }) {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [cursor, setCursor]     = useState(null)   // null = first page
  const [hasMore, setHasMore]   = useState(true)

  // Debounce the search query (wait 300ms after typing stops before fetching)
  const debouncedQuery = useDebounce(searchQuery, 300)

  // When the search query changes: reset to first page
  useEffect(() => {
    setUsers([])
    setCursor(null)
    setHasMore(true)
  }, [debouncedQuery])

  // Fetch the current page when debouncedQuery or cursor changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const url = buildUrl('/api/users', {
      search: debouncedQuery || undefined,
      cursor: cursor || undefined,
      limit: pageSize,
    })

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(({ data, pagination }) => {
        if (cancelled) return
        setUsers(prev => cursor ? [...prev, ...data] : data)  // append on load-more, replace on search
        setHasMore(pagination.hasNextPage)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [debouncedQuery, cursor, pageSize])

  function loadMore() {
    if (hasMore && !loading) {
      const lastUser = users[users.length - 1]
      if (lastUser) setCursor(btoa(JSON.stringify({ lastId: lastUser.id })))
    }
  }

  return { users, loading, error, hasMore, loadMore }
}
```

## The components

```javascript
// Pure, focused components — each has one responsibility

function SearchInput({ value, onChange }) {
  return (
    <div className="search-container">
      <label htmlFor="user-search">Search users</label>
      <input
        id="user-search"
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name or email..."
        aria-label="Search users"
      />
    </div>
  )
}

function UserCard({ user, onSelect }) {
  return (
    <li className="user-card">
      <button
        className="user-card-button"
        onClick={() => onSelect(user)}
        aria-label={`View details for ${user.name}`}
      >
        <strong>{user.name}</strong>
        <span>{user.email}</span>
        <span className={`role-badge role-${user.role}`}>{user.role}</span>
      </button>
    </li>
  )
}

function LoadMoreButton({ onClick, loading }) {
  return (
    <button
      className="load-more"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? 'Loading...' : 'Load more'}
    </button>
  )
}
```

## The page component

```javascript
function UserListPage() {
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  const { users, loading, error, hasMore, loadMore } = useUserList({ searchQuery })

  // When a user is selected, show their detail view instead of the list
  if (selectedUser) {
    return (
      <UserDetail
        userId={selectedUser.id}
        onBack={() => setSelectedUser(null)}
      />
    )
  }

  return (
    <div className="user-list-page">
      <h1>Users</h1>

      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {error && (
        <div role="alert" className="error-message">
          Failed to load users: {error}
          <button onClick={() => setSearchQuery(q => q)}>Retry</button>
        </div>
      )}

      {!error && (
        <ul role="list" aria-label="Users" aria-live="polite">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onSelect={setSelectedUser}
            />
          ))}
        </ul>
      )}

      {loading && <div aria-live="polite" aria-label="Loading">Loading...</div>}

      {!loading && hasMore && !error && (
        <LoadMoreButton onClick={loadMore} loading={loading} />
      )}

      {!loading && !hasMore && users.length > 0 && (
        <p className="end-of-list">All {users.length} users loaded.</p>
      )}

      {!loading && users.length === 0 && !error && (
        <p>No users found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
      )}
    </div>
  )
}
```

## The full data flow trace

```text
USER TYPES 'ali' into the search input:

  1. onChange fires: setSearchQuery('ali')
  2. UserListPage re-renders with searchQuery = 'ali'
  3. SearchInput receives value='ali' → shows 'ali'
  4. useUserList receives searchQuery='ali'
  5. useDebounce('ali', 300) → returns '' for 300ms (debounced)
     [wait 300ms with no more typing]
  6. useDebounce returns 'ali' → triggers re-render in useUserList
  7. Effect [debouncedQuery changed]: setUsers([]), setCursor(null), setHasMore(true)
  8. Effect [debouncedQuery, cursor changed]:
       setLoading(true)
       fetch('/api/users?search=ali&limit=20')
  9. Fetch resolves: { data: [{id:1, name:'Alice',...}], pagination: {hasNextPage:false, ...} }
  10. setUsers([{id:1, name:'Alice',...}]), setHasMore(false), setLoading(false)
  11. UserListPage re-renders: shows Alice's UserCard, no LoadMoreButton

USER CLICKS Alice's card:

  1. onClick fires: setSelectedUser({ id: 1, name: 'Alice', ... })
  2. UserListPage re-renders with selectedUser = Alice
  3. The if (selectedUser) branch renders: <UserDetail userId={1} onBack={...} />
  4. The user list is unmounted → useUserList's cleanup cancels any in-flight fetch

USER CLICKS Back:

  1. onBack() fires: setSelectedUser(null)
  2. UserListPage re-renders with selectedUser = null
  3. The list is mounted again with its current users/loading/error state
```

**CS lens:** This component structure demonstrates the **two-level architecture** of React applications. The bottom level is pure UI components (UserCard, SearchInput, LoadMoreButton) — they are pure functions of their props, fully reusable, trivially testable. The top level is the orchestration layer (UserListPage, useUserList) — it manages state, data fetching, and coordination. Separating these levels means the UI components can be tested by rendering them with different props, and the hooks can be tested by calling them with different inputs, without either needing to know about the other. The same two-level architecture appears in Redux (presentation components + containers), MVC (views + controllers), and MVVM (views + view models).

**SE lens:** The retry button (`onClick={() => setSearchQuery(q => q)}`) is a subtle pattern: it forces a state update with the same value, which would normally be a no-op. But because `useEffect` tracks `debouncedQuery` and we're working through `useDebounce`, this re-triggers the effect. In production, a better approach is a dedicated `retry` function in the hook that explicitly re-fetches. The pattern here illustrates why retry logic belongs in the hook (the data layer), not the component (the view layer): the component shouldn't need to know the hook's implementation details to trigger a retry.

**Common mistakes in real React applications:**
- Prop drilling — passing props through many layers of components that don't use them, only passing them down. When a prop is passed through 4+ layers, consider React Context or a state management library (Zustand, Redux) to provide the value directly to the consumer.
- Too many re-renders — if the parent re-renders, all children re-render by default. Use `React.memo()` to skip re-renders for children whose props haven't changed. Profile with React DevTools → Profiler before optimising; don't add `React.memo` everywhere preemptively.
- State that should be derived — if `filteredUsers` can be computed from `users` and `searchQuery`, don't store it as state. Compute it during render: `const filteredUsers = users.filter(u => u.name.includes(searchQuery))`. Derived state creates sync problems: you must remember to update it whenever the source state changes.

## Challenge: createUserListState

Implement the core user list state logic.

```challenge
function createUserListState(initialPageSize = 20) {
  // Manages state for a paginated, searchable user list.
  //
  // State:
  //   users:    array of user objects
  //   loading:  boolean
  //   error:    string | null
  //   hasMore:  boolean (true initially)
  //   query:    current search string (default '')
  //
  // Methods:
  //   .getState()        → current state snapshot
  //
  //   .setQuery(q)       → update query; RESETS users to [], hasMore to true
  //
  //   .startLoading()    → set loading = true, error = null
  //
  //   .appendPage(users, hasNextPage)
  //                      → append users to existing list, set hasMore = hasNextPage, loading = false
  //
  //   .replaceResults(users, hasNextPage)
  //                      → replace users list entirely (used on search change),
  //                         set hasMore = hasNextPage, loading = false
  //
  //   .setError(msg)     → set error = msg, loading = false
}
```

```test
const state = createUserListState()

// Initial state
const s0 = state.getState()
assert s0.users.length === 0
assert s0.loading === false
assert s0.hasMore === true
assert s0.query === ''

// Set query resets
state.setQuery('alice')
assert state.getState().query === 'alice'
assert state.getState().users.length === 0

// Start loading
state.startLoading()
assert state.getState().loading === true
assert state.getState().error === null

// Replace results (first page from a search)
const page1 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Alicia' }]
state.replaceResults(page1, true)
assert state.getState().users.length === 2
assert state.getState().hasMore === true
assert state.getState().loading === false

// Append page (load more)
state.startLoading()
const page2 = [{ id: 3, name: 'Alistair' }]
state.appendPage(page2, false)
assert state.getState().users.length === 3
assert state.getState().hasMore === false

// Error handling
state.startLoading()
state.setError('Network failed')
assert state.getState().error === 'Network failed'
assert state.getState().loading === false
```
