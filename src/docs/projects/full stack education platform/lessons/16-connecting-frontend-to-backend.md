# Lesson 16 — Connecting Frontend to Backend

## What You Will Build

Replace all hardcoded data in the app with real API calls. Add loading states (skeleton
loaders), error states, and pull-to-refresh on mobile. By the end, the Lessons screen
shows real lessons from the database, handles slow connections gracefully, and refreshes
when the user pulls down.

---

## What You Need to Know First

- Lesson 08: React state, `useEffect`
- Lesson 11–14: The Express API
- Lesson 15: Structured error handling

---

## The Lesson

### Step 1 — Asynchronous Programming

**The problem:** Network requests take time — typically 50–500ms. If your UI blocked
while waiting (synchronous execution), the screen would freeze on every API call.

**Asynchronous programming** starts an operation and continues executing other code while
waiting for the result. When the result arrives, a callback or Promise handler is called.

**Promises:** A `Promise` is an object that represents a **future value** — a value that
does not exist yet but will exist (or fail) at some point.

```typescript
const promise = fetch('/api/lessons')  // starts the request, returns immediately with a Promise

// The Promise is in one of three states:
// pending  — the request is in-flight
// fulfilled — the response arrived successfully
// rejected — the request failed (network error, 4xx, 5xx)
```

**`.then()`, `.catch()`, `.finally()`:**
```typescript
fetch('/api/lessons')
  .then(response => response.json())  // runs when fulfilled
  .then(data => setLessons(data))
  .catch(error => setError(error))    // runs when rejected
  .finally(() => setLoading(false))   // runs always, after then or catch
```

Each `.then()` returns a new Promise. Chaining is composition: each step transforms the
value. Errors skip over `.then()` handlers until they reach a `.catch()`.

**`async`/`await`:**
```typescript
async function fetchLessons() {
  const response = await fetch('/api/lessons')  // pauses here until the Promise resolves
  const data = await response.json()
  return data
}
```

`async function` makes a function return a Promise. `await` pauses the current function
until the awaited Promise resolves — **but does not block the event loop**. While `await`
is waiting, other code (event handlers, other async operations) can run.

`async`/`await` is syntactic sugar over Promises. The two are equivalent — `await` is
a cleaner way to write `.then()` chains.

### Step 2 — Race Conditions

A **race condition** occurs when two async operations produce incorrect results because
of their relative timing.

**The scenario:** User navigates to lesson 1. Request A starts. User quickly navigates
to lesson 2. Request B starts. Request B completes first (lesson 2 loads). Then Request
A completes — lesson 1 data overwrites the lesson 2 data that is currently displayed.
The user is viewing lesson 2 but seeing lesson 1's content.

**The fix — abort controllers:**
```typescript
useEffect(() => {
  const controller = new AbortController()

  async function fetchLesson() {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        signal: controller.signal
      })
      const data = await response.json()
      setLesson(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setError(error)
    }
  }

  fetchLesson()

  return () => controller.abort()  // cleanup: abort if the component unmounts or lessonId changes
}, [lessonId])
```

`AbortController` is a browser API for cancelling async operations. `controller.signal`
is passed to `fetch`. When `controller.abort()` is called, the fetch immediately rejects
with an `AbortError`. The `useEffect` cleanup function is called when `lessonId` changes —
aborting the previous request before starting a new one.

**CS lens:** Race conditions are a classic concurrency problem. They occur whenever two
operations read and write shared state without coordination. The `AbortController` pattern
ensures that only the most recent request's result is applied.

### Step 3 — Installing TanStack Query

Managing fetch state manually (`loading`, `error`, `data` state, abort controllers,
retry logic, cache) in every component is repetitive and error-prone.

**What TanStack Query (React Query) is:** A library for managing **server state** in React.
It handles: caching responses, background refresh, loading/error states, refetching on
window focus, pagination, and optimistic updates.

```bash
$ npm install @tanstack/react-query
```

**Three problems TanStack Query solves:**

1. **Caching:** The lessons list is fetched once and cached. Navigating away and back
   shows the cached data immediately, then quietly refetches in the background.
2. **Loading and error states:** Instead of `const [loading, setLoading] = useState(true)`
   in every component, `useQuery` returns `{ isLoading, isError, data }`.
3. **Automatic refetch:** When the user's device goes offline and comes back online, or
   when they tab back to the app, TanStack Query refetches stale data automatically.

**Setup:**

Wrap the app in a `QueryClientProvider`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // data is fresh for 5 minutes
      retry: 3,                   // retry failed requests 3 times
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <ErrorBoundary>
          <LessonProvider>
            <TabNavigator />
          </LessonProvider>
        </ErrorBoundary>
      </NavigationContainer>
    </QueryClientProvider>
  )
}
```

**`staleTime: 1000 * 60 * 5` explained:**
`staleTime` is how long cached data is considered "fresh." During this window, requests
use the cached data without refetching. After this window, data is "stale" — the next
component that reads it triggers a background refetch. Setting `staleTime` to 5 minutes
means the lessons list is refetched at most once every 5 minutes.

**`retry: 3`:** If a request fails, retry up to 3 times with exponential backoff.
A transient network error does not immediately show an error state.

### Step 4 — Fetching Lessons with `useQuery`

Create `src/api/lessons.ts`:

```typescript
const API_BASE = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000'

export async function fetchLessons(): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE}/api/lessons`)
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`)
  }
  return response.json()
}

export async function fetchLesson(id: number): Promise<Lesson> {
  const response = await fetch(`${API_BASE}/api/lessons/${id}`)
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`)
  }
  return response.json()
}
```

**`process.env['EXPO_PUBLIC_API_URL']`:** Expo exposes environment variables prefixed
with `EXPO_PUBLIC_` to the client bundle. Regular `process.env` variables are only
available on the server — they are not safe to bundle into the client (they could contain
secrets). `EXPO_PUBLIC_API_URL` is a non-secret variable (a URL, not a key).

**`!response.ok`:** `response.ok` is `true` for 2xx status codes. For 4xx and 5xx, it
is `false`. `fetch` does not throw on HTTP errors — only on network failures. Always
check `response.ok` and throw explicitly for HTTP errors, so TanStack Query's error
handling kicks in.

**Using `useQuery` in `LessonsScreen`:**

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchLessons } from '../api/lessons'

export function LessonsScreen() {
  const { data: lessons, isLoading, isError, refetch } = useQuery({
    queryKey: ['lessons'],
    queryFn: fetchLessons,
  })

  if (isLoading) return <SkeletonLoader />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <FlatList
      data={lessons}
      keyExtractor={lesson => String(lesson.id)}
      renderItem={({ item }) => <LessonCard lesson={item} />}
      onRefresh={refetch}
      refreshing={isLoading}
    />
  )
}
```

**`queryKey: ['lessons']`:** The query key uniquely identifies this query in the cache.
TanStack Query uses it as a cache key: two components with the same key share the same
cached data. For parameterised queries: `queryKey: ['lessons', { difficulty: 'beginner' }]`.

**`FlatList` explained:**
React Native's `FlatList` is a high-performance list component. It renders only the
items visible on screen (virtual rendering) — a list of 10,000 items renders only
the ~10 visible ones. This is the same **windowing** technique Monaco uses for large
files. `keyExtractor` provides a stable key for each item; `renderItem` renders each item.

### Step 5 — Loading States and Skeleton Loaders

**Three states every async operation has:**
1. **Loading** — the request is in-flight
2. **Error** — the request failed
3. **Success** — data is available

Every UI must handle all three. Not just the happy path. A screen that shows a blank
area while loading teaches users the app is broken.

**A skeleton loader** is a placeholder that mimics the layout of the final content:

```typescript
function SkeletonLoader() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(index => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
      ))}
    </View>
  )
}
```

The skeleton uses the same layout as the real cards but shows grey boxes instead of
text. This tells the user "content is loading here" and prevents layout shift when
the content arrives.

---

## Connect the Pieces

TanStack Query's `staleTime` and cache are a client-side implementation of the
**stale-while-revalidate** HTTP caching strategy: serve cached data immediately, then
refresh in the background. This is the same strategy used by service workers (Lesson 29)
and CDNs (Lesson 31): serve what you have, update asynchronously.

The `queryKey` pattern — an array that uniquely identifies a query — is the same
concept as a cache key in any caching system. Change a query key entry (`['lessons', { difficulty: 'beginner' }]` vs `['lessons', { difficulty: 'intermediate' }]`) and the cache treats
them as separate queries.

The `!response.ok` check is a critical pattern for all `fetch` usage. It will appear
in Lesson 17 (auth: check for 401 responses), Lesson 25 (WebSocket fallback to polling
when connection fails), and throughout. Make it a reflex.

---

## What Breaks Without This

Without `!response.ok`, a `404 Not Found` response from the API does not throw. TanStack
Query thinks the request succeeded. `response.json()` parses the error body
`{ error: { code: 'NOT_FOUND' } }` and sets `data` to that error object. The component
renders the error object as if it were lesson data — showing `undefined` where lesson fields
should be, crashing when it tries to render them.

Without `staleTime`, every component that calls `useQuery(['lessons'])` triggers a
new network request — even if another component fetched the same data one second ago.
A screen with three components each showing lesson data sends three simultaneous identical
requests. The `staleTime` cache prevents this.

---

## Definition of Done

- [ ] The Lessons screen shows real lessons from the API (not hardcoded data)
- [ ] A skeleton loader appears while lessons are loading
- [ ] An error state with a retry button appears when the server is not running
- [ ] Pull-to-refresh on mobile refetches the lessons
- [ ] Navigating away and back shows cached data immediately (no second loading state)
- [ ] You can answer: what is `async`/`await` and how does it relate to Promises?
- [ ] You can answer: what is a race condition in async code and how does `AbortController` prevent it?
- [ ] You can answer: what is `staleTime` and what problem does it solve?
- [ ] You can answer: why does `fetch` not throw on a 404 response and how do you handle it?
- [ ] `git commit` with a message explaining why — "Replace hardcoded data with TanStack Query API calls, add loading and error states"
