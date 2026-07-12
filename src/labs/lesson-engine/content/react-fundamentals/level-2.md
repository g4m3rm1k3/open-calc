---
series: react-fundamentals
level: 2
title: useEffect and Data Fetching
lang: javascript
---

# useEffect and Data Fetching

React components render JSX based on their current state and props. But many real applications need to do things that are outside of rendering: fetch data from an API, set up a timer, subscribe to an event source, update the page title. These are **side effects** — actions that interact with the world outside the component.

`useEffect` is React's hook for running side effects. Understanding useEffect means understanding when effects run, how to clean them up, and the dependency array that controls re-execution. By the end of this lesson you will be able to fetch data on component mount, handle loading and error states, and avoid the most common useEffect bugs.

## What is a side effect?

```text
PURE FUNCTION (no side effects):
  function double(n) { return n * 2 }
  → Same input always gives the same output
  → No observable effect outside the function

SIDE EFFECT:
  → Modifies state outside the function (global variable, DOM, file, database)
  → Reads something non-deterministic (Date.now(), Math.random(), network)
  → Has observable behaviour beyond returning a value
  
SIDE EFFECTS IN REACT COMPONENTS:
  ✓ Fetch data from an API
  ✓ Subscribe to WebSocket messages
  ✓ Set up a timer (setInterval / setTimeout)
  ✓ Add a DOM event listener (window.addEventListener)
  ✓ Update document.title
  ✓ Write to localStorage
  
  These must NOT happen during render (during the component function call)
  because render must be pure: same props/state → same JSX.
  useEffect runs AFTER render, outside the pure rendering pipeline.
```

## useEffect: running effects after render

```javascript
import { useState, useEffect } from 'react'

function PageTitle({ title }) {
  // useEffect(effect, dependencies)
  // effect: the function to run after render
  // dependencies: array of values — re-run the effect when these change
  
  useEffect(() => {
    document.title = title   // side effect: modifying document.title
    // This runs after every render where `title` changed
  }, [title])   // dependency array: only re-run when `title` changes
  
  return <h1>{title}</h1>
}
```

```text
WHEN useEffect RUNS:

  1. Component renders (the function body executes)
  2. React updates the DOM
  3. THEN: useEffect callback runs
  
  Dependency array controls when:
  
  useEffect(fn)         — runs after EVERY render (rarely what you want)
  useEffect(fn, [])     — runs ONCE after the first render (mount only)
  useEffect(fn, [x])    — runs after mount, and after any render where x changed
  useEffect(fn, [x, y]) — runs after mount, and when x OR y changed
  
  EXAMPLE TIMELINE:
    Render 1 (title="Home"):
      → DOM updated with "Home"
      → effect runs: document.title = "Home"
    
    Render 2 (title="Home"):   ← same title
      → DOM updated (no visible change)
      → effect does NOT run (title didn't change)
    
    Render 3 (title="About"):
      → DOM updated with "About"
      → effect runs: document.title = "About"
```

**CS lens:** The dependency array implements **memoisation of effect execution** — React compares the current dependency values with the previous values using `Object.is`. If all dependencies are unchanged, the effect is skipped. This is analogous to the memoisation pattern (`useMemo`, `useCallback`): skip work when inputs haven't changed. The dependency array is effectively a cache invalidation key for the effect. React's ESLint plugin (`eslint-plugin-react-hooks`) warns when the dependency array is incomplete — if a value is used inside the effect but not listed in the array, the effect may see stale values.

## Data fetching with useEffect

The most common use of useEffect is fetching data from an API when a component mounts.

```javascript
function UserProfile({ userId }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  
  useEffect(() => {
    let cancelled = false   // prevents state update after unmount
    
    setLoading(true)
    setError(null)
    
    fetch(`/api/users/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        if (!cancelled) setUser(data)   // only update if still mounted
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    
    // CLEANUP FUNCTION: runs when the component unmounts or before the effect re-runs
    return () => {
      cancelled = true   // prevent state updates from in-flight requests
    }
  }, [userId])   // re-fetch when userId changes
  
  if (loading) return <div>Loading...</div>
  if (error)   return <div className="error">Error: {error}</div>
  if (!user)   return null
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

```text
THE UNMOUNT PROBLEM:
  
  1. User navigates to UserProfile with userId=42.
  2. Component mounts. fetch('/api/users/42') starts (takes 500ms).
  3. User navigates away BEFORE the fetch completes.
  4. Component unmounts.
  5. 500ms later, the fetch completes and calls setUser(data).
  
  WITHOUT CLEANUP:
    React tries to update state on an unmounted component.
    Warning: "Can't perform a React state update on an unmounted component."
    May also cause bugs if the component re-mounts — the stale fetch overwrites
    the new component's state.
  
  WITH CLEANUP (cancelled = true):
    The cleanup function runs when the component unmounts.
    The .then() and .catch() handlers check cancelled before calling setState.
    The stale response is silently discarded.
    No warning, no stale state.

THE RACE CONDITION:
  1. userId changes from 42 to 99.
  2. Effect re-runs: fetch('/api/users/99') starts.
  3. But the cleanup function for the userId=42 effect runs first: cancelled = true.
  4. If the userId=42 fetch resolves later: setUser is skipped (cancelled).
  5. Only the userId=99 response updates state.
  
  Without cancellation, if userId=42's request is slow and resolves after userId=99:
  the UI shows userId=42's data while userId=99 is selected — a race condition.
```

## Cleanup functions

Every effect that sets up a subscription, timer, or event listener must return a cleanup function to tear it down.

```javascript
function LiveSearch({ query }) {
  const [results, setResults] = useState([])
  
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }
    
    // Debounce: wait 300ms before fetching (avoids fetching on every keystroke)
    const timerId = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => setResults(data))
    }, 300)
    
    // CLEANUP: cancel the debounce timer if query changes before 300ms
    return () => clearTimeout(timerId)
    // Effect re-runs on every query change.
    // If query changes within 300ms, the previous timer is cleared and a new one set.
    // Result: fetch only fires 300ms after the user stops typing.
  }, [query])
  
  return (
    <ul>
      {results.map(r => <li key={r.id}>{r.title}</li>)}
    </ul>
  )
}
```

```javascript
// CLEANUP EXAMPLES:

// Timer:
useEffect(() => {
  const id = setInterval(() => setTick(t => t + 1), 1000)
  return () => clearInterval(id)   // cleanup: stop the interval
}, [])

// DOM event listener:
useEffect(() => {
  function handleResize() { setWindowWidth(window.innerWidth) }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)  // cleanup
}, [])

// WebSocket:
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/live')
  ws.onmessage = event => setMessage(event.data)
  return () => ws.close()   // cleanup: close the connection
}, [])
```

**SE lens:** The cleanup function enforces the **RAII (Resource Acquisition Is Initialisation)** principle from C++: resources are acquired when set up and released when torn down, in the same place. In React terms: the effect acquires a resource (timer, event listener, connection), and the cleanup releases it. Without cleanup, resources leak. In long-running SPAs, leaked event listeners accumulate — after 100 page navigations, there are 100 `resize` listeners firing simultaneously. Cleanup prevents this class of memory and performance leak entirely.

**Common mistakes:**
- Missing dependency array — `useEffect(fn)` without a dependency array runs after EVERY render. If the effect modifies state, it triggers another render, which triggers the effect again: infinite loop.
- Missing variables in the dependency array — if you use `userId` inside the effect but don't include it in the array, the effect captures the initial `userId` value and never re-runs. The UI shows stale data.
- Async functions directly as the effect — `useEffect(async () => { ... })` — an async function returns a Promise. React interprets the return value of an effect as a cleanup function. A Promise is not a cleanup function. Use an inner async function instead: `useEffect(() => { async function load() {...} load() }, [deps])`.

**Debug tip:** When an effect runs more times than expected, add `console.log('effect ran', deps)` inside the effect. If it runs on every render, check whether an object or array in the dependency array is being recreated on every render. `{ a: 1 }` created inline in JSX is a new object on every render — `Object.is({a:1}, {a:1})` is false. Move the object outside the component or use `useMemo` to stabilise it.

## Challenge: useDataFetcher

Implement a data fetching state manager.

```challenge
function createDataFetcher() {
  // Returns a data fetcher that simulates React's data-fetching pattern.
  // 
  // .fetch(fetchFn)
  //   - fetchFn: an async function () => data
  //   - Sets loading = true, error = null before fetching
  //   - On success: sets data = result, loading = false
  //   - On error: sets error = err.message, loading = false
  //   - Returns: the data on success, throws on error
  //
  // .cancel()
  //   - Marks any in-flight fetch as cancelled
  //   - After cancel(), subsequent completions should NOT update data or error
  //
  // .getState()
  //   - Returns: { data, loading, error }
  //   - Initial state: { data: null, loading: false, error: null }
}
```

```test
const fetcher = createDataFetcher()

// Initial state
assert fetcher.getState().data === null
assert fetcher.getState().loading === false
assert fetcher.getState().error === null

// Successful fetch
const result = await fetcher.fetch(async () => ({ id: 1, name: 'Alice' }))
assert result.id === 1
assert fetcher.getState().data.name === 'Alice'
assert fetcher.getState().loading === false
assert fetcher.getState().error === null

// Failed fetch
try {
  await fetcher.fetch(async () => { throw new Error('Network error') })
} catch (e) {}
assert fetcher.getState().error === 'Network error'
assert fetcher.getState().loading === false

// Cancelled fetch: data should not update
fetcher.cancel()
const fetcher2 = createDataFetcher()
let stateAfterCancel = null
const cancelledFetch = fetcher2.fetch(async () => {
  fetcher2.cancel()   // cancel mid-flight
  return { id: 2, name: 'Bob' }
}).then(() => {
  stateAfterCancel = fetcher2.getState()
})
await cancelledFetch
assert stateAfterCancel.data === null   // cancelled — data not set
```
