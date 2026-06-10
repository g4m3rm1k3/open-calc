# Junior to Senior — T6·L3 — React Query: Fetching and Caching

**Prerequisites:** T6·L2 (Zustand Middleware). You manage client state. This lesson
covers server state — data that lives on the backend and must be fetched, cached,
and kept in sync.

**What this lab adds:**
- `useQuery({ queryKey, queryFn })` — declarative data fetching with automatic states
- Query keys: the cache key — same key = same cache entry across all components
- Stale time and cache time: when data is refetched vs garbage-collected
- Automatic refetching: on window focus, on network reconnect
- `isLoading` vs `isFetching` — first load vs background refresh

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two components mount simultaneously and both call `useQuery({ queryKey: ['tasks'] })`.
>    How many HTTP requests are made?
> 2. `staleTime: 5000` — the user switches tabs and returns 10 seconds later.
>    What happens?
> 3. A query has `isLoading: true` and `data: undefined`. The user saw tasks
>    30 seconds ago. Can this state exist?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A task list that fetches from the FastAPI backend with loading, error, and
background-refresh states:

```tsx
// Shows a loading spinner on first load:
if (isLoading) return <Spinner />;

// Shows an error message if the request fails:
if (isError)   return <ErrorMessage error={error} />;

// Shows tasks — automatically refreshed when window refocuses:
return <TaskList tasks={data} />;
```

---

### Concept: Server State vs Client State

**What it is:** Not all state is the same:

- **Client state** (Zustand): `selectedId`, `theme`, `filter` — owned by the browser,
  no server involved, synchronous, always fresh
- **Server state** (React Query): task list from the API, project data, user profile —
  owned by the server, requires fetching, can be stale, can fail

React Query is NOT a general-purpose state manager. It is a server state
synchronisation library. Do not put UI state in it.

**The problem before (managing server state with `useState`):**

```tsx
function TaskList() {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/tasks/')
      .then(r => r.json())
      .then(data => { setTasks(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, []);

  // 15 lines just for one fetch — duplicated everywhere
}
```

**The solution:**

```tsx
function TaskList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn:  () => fetch('/tasks/').then(r => r.json()),
  });
  // 3 lines — React Query handles all the states
}
```

**What it hides:** The entire fetch lifecycle: loading state, error handling, retry
logic, background refresh, cache invalidation, deduplication of concurrent requests,
and data synchronisation across components.

**Canonical example:** A news feed subscription. You subscribe once (`useQuery`).
The feed delivers updates automatically (background refetch). If the same story
appears in two feeds (two components with same key), you only receive it once (deduplication).

**You will see this again in:**
- Every production React application with API data uses React Query or SWR
- The SWR library (by Vercel) is the main alternative with the same concepts
- This pattern appears in Angular (NgRx Effects), Vue (Pinia), Flutter (Riverpod)

**Watch for:** React Query is for server state, not client state. If you find yourself
putting `selectedId` or `filter` in a query, you have the wrong tool.

---

## Step 1 — Install and Configure React Query

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

Update `src/main.tsx`:

```tsx
import { StrictMode }         from 'react';
import { createRoot }         from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App                    from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,   // data is "fresh" for 30 seconds
      retry:     1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
```

### SAVE AND TRY

```bash
npm run dev
```

Open `http://localhost:5173`. The React Query DevTools icon appears in the corner.
No queries yet — but the infrastructure is ready.

---

### Concept: `useQuery` — Declarative Fetching

**What it is:** `useQuery({ queryKey, queryFn })` declares a data dependency. The
query key is the cache identifier; the query function is how to fetch the data.

```tsx
import { useQuery } from '@tanstack/react-query';

interface Task {
  id: string; title: string; priority: string; done: boolean;
}

async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('http://localhost:8000/tasks/');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function TaskList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn:  fetchTasks,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError)   return <p>Error: {(error as Error).message}</p>;

  return (
    <ul>
      {data?.map(task => <li key={task.id}>{task.title}</li>)}
    </ul>
  );
}
```

**What it hides:** The request deduplication, background refetch scheduling,
error retry logic, and cache management. The component only declares WHAT data it
needs — React Query handles HOW to get and maintain it.

**Canonical example:** A newspaper subscription. You subscribe (`useQuery`) to the
"daily news" edition (`queryKey: ['news', 'daily']`). The newspaper delivers automatically
(background fetch). If you ask for today's paper twice (two components with same key),
you get the same copy (cached).

**Project Application:** The contacts manager fetches tasks from the FastAPI backend.
Every component that needs the task list uses the same query key — they all share one
cache entry and one HTTP request.

**You will see this again in:**
- SWR: `const { data, error } = useSWR('/tasks/', fetcher)` — same concept
- Apollo Client (GraphQL): `const { data, loading } = useQuery(GET_TASKS)` — same concept
- Every modern React application that talks to an API

**Watch for:** `queryFn` must be a function that returns a Promise. Do not call
the fetch inside `queryFn` with `await` before passing — pass the async function itself:
`queryFn: fetchTasks` not `queryFn: fetchTasks()`.

---

### Concept: Query Keys — The Cache Identifier

**What it is:** The query key is an array that uniquely identifies the cache entry.
Two components with the same key share the same cache and the same HTTP request.

```tsx
// Same cache — one request:
useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });
useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });  // same key = same cache

// Different keys = different cache entries:
useQuery({ queryKey: ['tasks', { priority: 'high' }], queryFn: () => fetchTasks({ priority: 'high' }) });
useQuery({ queryKey: ['tasks', { priority: 'low' }],  queryFn: () => fetchTasks({ priority: 'low' }) });

// Task by ID — include the ID in the key:
useQuery({ queryKey: ['tasks', taskId], queryFn: () => fetchTask(taskId) });
```

**The rule:** The query key should contain every variable the `queryFn` uses.
If the key changes (e.g., different `priority` filter), React Query refetches.

**What it hides:** The cache lookup. React Query uses the key to hash the cache entry
and retrieve it in O(1). You only need to define the key once — React Query manages the rest.

**Project Application:** `['tasks']` fetches all tasks. `['tasks', { priority: 'high' }]`
fetches only high-priority tasks. These are different cache entries — changing the filter
triggers a new fetch.

**You will see this again in:**
- RTK Query (Redux): `useGetTasksQuery(filterParams)` — the params ARE the key
- Relay (GraphQL): query arguments ARE the cache key
- HTTP: cache headers (`ETag`, `Cache-Control`) implement the same concept

**Watch for:** Key arrays must be JSON-serialisable. Objects in the key are compared
deeply — `{ priority: 'high' }` and `{ priority: 'high' }` are the same key even though
they are different JavaScript objects.

---

## Step 2 — Build the API Layer and Task Query

Create `src/api/tasks.ts`:

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface ApiTask {
  id:       string;
  title:    string;
  priority: string;
  done:     boolean;
  due_date: string | null;
  tags:     string[];
}

export interface TaskFilters {
  priority?: string;
  done?:     boolean;
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<ApiTask[]> {
  const params = new URLSearchParams();
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.done !== undefined) params.set('done', String(filters.done));

  const url = `${BASE_URL}/tasks/?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch tasks: HTTP ${res.status}`);
  return res.json();
}

export async function fetchTask(taskId: string): Promise<ApiTask> {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`);
  if (!res.ok) throw new Error(`Task ${taskId} not found: HTTP ${res.status}`);
  return res.json();
}
```

Create `src/hooks/useTasks.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, fetchTask, type TaskFilters } from '../api/tasks';

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn:  () => fetchTasks(filters),
    staleTime: 30_000,
  });
}

export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn:  () => fetchTask(taskId!),
    enabled:  taskId !== null,   // only fetch when a task is selected
    staleTime: 60_000,
  });
}
```

---

## Step 3 — Write Tests With MSW

```bash
npm install -D msw
```

Create `src/mocks/handlers.ts`:

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:8000/tasks/', () => {
    return HttpResponse.json([
      { id: 't-1', title: 'Write tests', priority: 'high',   done: false, due_date: null, tags: [] },
      { id: 't-2', title: 'Deploy',      priority: 'medium', done: false, due_date: null, tags: [] },
    ]);
  }),
];
```

Create `src/mocks/server.ts`:

```ts
import { setupServer } from 'msw/node';
import { handlers }    from './handlers';
export const server = setupServer(...handlers);
```

Create `src/hooks/useTasks.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server }    from '../mocks/server';
import { useTasks }  from './useTasks';
import { http, HttpResponse } from 'msw';

beforeAll(()  => server.listen());
afterEach(()  => server.resetHandlers());
afterAll(()   => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useTasks', () => {

  it('returns tasks from the API', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].title).toBe('Write tests');
  });

  it('is in loading state initially', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('sets isError when API fails', async () => {
    server.use(
      http.get('http://localhost:8000/tasks/', () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all 3 tests pass.

---

## 🎯 Challenge: Add `useTasksByPriority`

**You know:** `useQuery`, query keys, `enabled`.

**Task:** Build `useTasksByPriority(priority: 'low' | 'medium' | 'high' | null)` that:
- Does not fetch when `priority` is null (`enabled: false`)
- Uses a query key that includes the priority
- Fetches filtered tasks when priority is provided

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function useTasksByPriority(priority: 'low' | 'medium' | 'high' | null) {
  return useQuery({
    queryKey: ['tasks', 'by-priority', priority],
    queryFn:  () => fetchTasks({ priority: priority! }),
    enabled:  priority !== null,
    staleTime: 30_000,
  });
}
```

**Tests:**
```tsx
it('does not fetch when priority is null', () => {
  const { result } = renderHook(() => useTasksByPriority(null), { wrapper });
  expect(result.current.fetchStatus).toBe('idle');
  expect(result.current.data).toBeUndefined();
});

it('fetches tasks when priority is provided', async () => {
  const { result } = renderHook(() => useTasksByPriority('high'), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

</details>

---

## Final Check

| Concept | Verify |
|---|---|
| One request for two components | Same key → one HTTP request |
| `isLoading` vs `isFetching` | First load → `isLoading: true`; background refetch → `isFetching: true` |
| `enabled: false` | `useTask(null)` — no request made |
| Error state | Mock 500 response — `isError: true`, `data: undefined` |

---

## Quick Check Answers

**1. Two components with `['tasks']` key mount simultaneously. How many requests?**

One. React Query deduplicates queries with the same key. When both components mount,
only one HTTP request is made. Both receive the result when it resolves. This is the
fundamental cache-sharing feature — no duplicate network traffic.

**2. `staleTime: 5000`, user switches tabs for 10 seconds. What happens on return?**

A background refetch is triggered. After `staleTime` (5s) expires, the data is "stale."
When the window refocuses (default behaviour), React Query fires a background fetch.
The component shows stale data while refetching — no loading spinner unless `isLoading`
is used instead of `isFetching`.

**3. `isLoading: true`, `data: undefined`. Can this exist after user already saw data?**

No. `isLoading` is `true` ONLY when there is no cached data. Once the user has seen
data, it's in the cache. On subsequent fetches, `isFetching` is true but `isLoading`
is false (data exists). The state in the question can only occur on the very first load.
