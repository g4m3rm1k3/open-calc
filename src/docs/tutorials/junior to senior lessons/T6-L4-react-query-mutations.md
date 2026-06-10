# Junior to Senior — T6·L4 — React Query: Mutations and Optimistic Updates

**Prerequisites:** T6·L3 (React Query Fetching). You can fetch and cache server data.
This lesson covers mutations — creating, updating, and deleting data — and the
optimistic update pattern for a UI that feels instant.

**What this lab adds:**
- `useMutation({ mutationFn, onSuccess })` — sending data to the server
- `queryClient.invalidateQueries` — marking cache stale after a mutation
- Optimistic updates: update the cache immediately, roll back on server error
- `onMutate` (snapshot + update), `onError` (roll back), `onSettled` (always refetch)
- `isPending` — disabling buttons while a mutation is in flight

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A user creates a task. `useMutation.onSuccess` calls `invalidateQueries(['tasks'])`.
>    What triggers immediately after?
> 2. Optimistic update: user clicks "Complete". UI updates instantly. Server returns
>    500. What must happen?
> 3. `isPending: true` on a mutation. What should the Submit button do?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A task creation flow that feels instant with optimistic updates:

```tsx
// Click "Add Task" → task appears in the list immediately (optimistic)
// If server accepts → task stays with server-assigned ID
// If server rejects → task disappears, error shown
```

---

### Concept: `useMutation` — Sending Data to the Server

**What it is:** `useMutation({ mutationFn, onSuccess })` declares a mutation —
an operation that changes server state. Unlike queries (which run automatically),
mutations are triggered imperatively by calling `mutation.mutate(...)`.

**The problem before:**

```tsx
async function handleCreateTask(title: string): Promise<void> {
  setLoading(true);
  try {
    const response = await fetch('/tasks/', {
      method: 'POST', headers: { ... }, body: JSON.stringify({ title }),
    });
    const task = await response.json();
    setTasks(prev => [...prev, task]);
  } catch (e) {
    setError(e);
  } finally {
    setLoading(false);
  }
}
// Repeated for every mutating operation — update, delete, complete
```

**The solution:**

```tsx
const mutation = useMutation({
  mutationFn: (title: string) => createTask(title),

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });   // marks cache stale → refetch
  },
});

// In the handler:
mutation.mutate('Write tests');

// In the JSX:
<button disabled={mutation.isPending}>
  {mutation.isPending ? 'Saving...' : 'Add Task'}
</button>
```

**What it hides:** The loading state management, error catching, and cache coordination.
`isPending`, `isError`, `isSuccess` are automatically derived from the mutation state.

**Canonical example:** Sending a text message. You press send (`mutate`). The "sending..."
indicator appears (`isPending`). The message is delivered (`onSuccess`) or fails (`onError`).
You did not manually manage a loading boolean.

**Project Application:** `useCreateTask()`, `useCompleteTask()`, and `useDeleteTask()`
each use `useMutation`. Any component can trigger them.

**You will see this again in:**
- SWR: `useSWRMutation('/tasks/', createTask)` — same concept
- Apollo Client (GraphQL): `const [createTask, { loading }] = useMutation(CREATE_TASK_MUTATION)`
- React Hook Form's `handleSubmit` with mutations is the standard pattern

**Watch for:** `mutate` is fire-and-forget. `mutateAsync` returns a Promise you can
`await`. Use `mutate` for event handlers; use `mutateAsync` when you need to wait for
the result before proceeding.

---

### Concept: Optimistic Updates — Instant UI

**What it is:** Update the cache BEFORE the server responds. Show the user the expected
result immediately. If the server rejects, roll back to the previous state.

**The three-callback pattern:**

```tsx
const mutation = useMutation({
  mutationFn: completeTask,

  onMutate: async (taskId) => {
    // 1. Cancel any outgoing refetches (avoid overwriting optimistic update):
    await queryClient.cancelQueries({ queryKey: ['tasks'] });

    // 2. Snapshot the previous value for rollback:
    const previousTasks = queryClient.getQueryData<ApiTask[]>(['tasks']);

    // 3. Optimistically update the cache:
    queryClient.setQueryData<ApiTask[]>(['tasks'], old =>
      (old ?? []).map(t => t.id === taskId ? { ...t, done: true } : t)
    );

    return { previousTasks };   // returned as `context` to onError
  },

  onError: (_error, _taskId, context) => {
    // Roll back to the snapshot:
    if (context?.previousTasks) {
      queryClient.setQueryData(['tasks'], context.previousTasks);
    }
  },

  onSettled: () => {
    // Always sync with server (success or failure):
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

**What it hides:** The race condition management. `cancelQueries` prevents a background
refetch from overwriting the optimistic update. `onSettled` ensures the cache is
eventually consistent even if the optimistic update was wrong.

**Canonical example:** A bank's ATM. You see `$500 available` instantly (optimistic).
The network transaction confirms or reverses later. The display never freezes waiting
for confirmation.

**Project Application:** Completing a task should feel instant. The UI marks it done
immediately. The server confirms or rolls back.

**You will see this again in:**
- Every real-time app: chat apps mark messages sent before server confirms
- E-commerce: "added to cart" appears before the server responds
- Social media: like counts update optimistically

**Watch for:** Optimistic updates require `onError` to roll back. Without `onError`,
a failed mutation leaves the UI in an incorrect state permanently.

---

## Step 1 — Build the Mutation Hooks

Update `src/api/tasks.ts` to add mutation functions:

```ts
export async function createTask(body: { title: string; priority: string }): Promise<ApiTask> {
  const res = await fetch(`${BASE_URL}/tasks/`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to create task: HTTP ${res.status}`);
  return res.json();
}

export async function completeTask(taskId: string): Promise<ApiTask> {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ done: true }),
  });
  if (!res.ok) throw new Error(`Failed to complete task: HTTP ${res.status}`);
  return res.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete task: HTTP ${res.status}`);
}
```

Create `src/hooks/useTaskMutations.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, completeTask, deleteTask, type ApiTask } from '../api/tasks';

export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    onMutate: async (newTask) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueryData<ApiTask[]>(['tasks']);

      qc.setQueryData<ApiTask[]>(['tasks'], old => [
        ...(old ?? []),
        { id: `temp-${Date.now()}`, done: false, due_date: null, tags: [], ...newTask },
      ]);

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['tasks'], context.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: completeTask,

    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueryData<ApiTask[]>(['tasks']);

      qc.setQueryData<ApiTask[]>(['tasks'], old =>
        (old ?? []).map(t => t.id === taskId ? { ...t, done: true } : t)
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['tasks'], context.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

---

## Step 2 — Write Tests

Update `src/mocks/handlers.ts` to add mutation endpoints:

```ts
import { http, HttpResponse } from 'msw';
import type { ApiTask } from '../api/tasks';

let tasks: ApiTask[] = [
  { id: 't-1', title: 'Write tests', priority: 'high', done: false, due_date: null, tags: [] },
];
let nextId = 2;

export const handlers = [
  http.get('http://localhost:8000/tasks/', () => HttpResponse.json(tasks)),

  http.post('http://localhost:8000/tasks/', async ({ request }) => {
    const body = await request.json() as { title: string; priority: string };
    const task: ApiTask = { id: `t-${nextId++}`, ...body, done: false, due_date: null, tags: [] };
    tasks.push(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch('http://localhost:8000/tasks/:id', async ({ params }) => {
    const task = tasks.find(t => t.id === params.id);
    if (!task) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    task.done = true;
    return HttpResponse.json(task);
  }),
];

export function resetTasks() {
  tasks = [{ id: 't-1', title: 'Write tests', priority: 'high', done: false, due_date: null, tags: [] }];
  nextId = 2;
}
```

Create `src/hooks/useTaskMutations.test.tsx`:

```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server }         from '../mocks/server';
import { resetTasks }     from '../mocks/handlers';
import { useCreateTask }  from './useTaskMutations';
import { useTasks }       from './useTasks';
import { http, HttpResponse } from 'msw';

beforeAll(()  => server.listen());
afterEach(()  => { server.resetHandlers(); resetTasks(); });
afterAll(()   => server.close());

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useCreateTask', () => {

  it('optimistically adds a task and confirms with server id', async () => {
    const wrapper = makeWrapper();
    const tasks   = renderHook(() => useTasks(), { wrapper });
    const create  = renderHook(() => useCreateTask(), { wrapper });

    await waitFor(() => expect(tasks.result.current.isSuccess).toBe(true));
    const initialCount = tasks.result.current.data?.length ?? 0;

    act(() => {
      create.result.current.mutate({ title: 'New task', priority: 'low' });
    });

    // Optimistic update appears immediately:
    await waitFor(() =>
      expect(tasks.result.current.data?.length).toBeGreaterThan(initialCount)
    );

    await waitFor(() => expect(create.result.current.isSuccess).toBe(true));
  });

  it('rolls back on server error', async () => {
    server.use(
      http.post('http://localhost:8000/tasks/', () =>
        HttpResponse.json({ detail: 'Error' }, { status: 500 })
      )
    );

    const wrapper = makeWrapper();
    const tasks   = renderHook(() => useTasks(), { wrapper });
    const create  = renderHook(() => useCreateTask(), { wrapper });

    await waitFor(() => expect(tasks.result.current.isSuccess).toBe(true));
    const initialCount = tasks.result.current.data?.length ?? 0;

    act(() => { create.result.current.mutate({ title: 'Will fail', priority: 'low' }); });

    await waitFor(() => expect(create.result.current.isError).toBe(true));
    expect(tasks.result.current.data?.length).toBe(initialCount);  // rolled back
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: both tests pass.

---

## 🎯 Challenge: Add Inline Edit Mutation

**You know:** `useMutation`, optimistic updates.

**Task:** Build `useUpdateTaskTitle()` that:
- Optimistically updates the task title in the cache
- Sends `PATCH /tasks/{id}` with `{ title: newTitle }`
- Rolls back if the server returns an error

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function useUpdateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: { title?: string } }) =>
      fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then(r => r.json()),

    onMutate: async ({ taskId, updates }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueryData<ApiTask[]>(['tasks']);
      qc.setQueryData<ApiTask[]>(['tasks'], old =>
        (old ?? []).map(t => t.id === taskId ? { ...t, ...updates } : t)
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['tasks'], context.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

</details>

---

## Final Check

| Concept | Verify |
|---|---|
| `invalidateQueries` triggers refetch | After mutation, watch DevTools — new GET request |
| Optimistic update visible | Task appears before server responds |
| Rollback on error | Mock 500 → optimistic update disappears |
| `isPending` disables button | Click add, button is disabled until resolved |

---

## Quick Check Answers

**1. `onSuccess` calls `invalidateQueries(['tasks'])`. What happens immediately?**

The `['tasks']` query is marked as stale. React Query immediately triggers a background
refetch. While refetching, `isFetching` is `true` but existing data is shown. When fresh
data arrives, the component re-renders with the server's response.

**2. Optimistic update, server returns 500. What must happen?**

Roll back the cache to the snapshot taken in `onMutate`. The snapshot was saved before
the optimistic update. `onError` receives it as `context` and restores it with
`queryClient.setQueryData`. The UI reverts to the state before the user action.

**3. `isPending: true`. What should the Submit button do?**

Be disabled: `<button disabled={mutation.isPending}>`. This prevents double-submission.
Also show a loading indicator: `{mutation.isPending ? 'Saving...' : 'Save'}` to signal
work is in progress.
