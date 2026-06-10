# Junior to Senior — T6·L2 — Zustand: Middleware and Slices

**Prerequisites:** T6·L1 (Zustand Basic Store). You can create and use a store.
This lesson adds middleware — the composable layers that give a Zustand store
persistence, immutable updates, and debugging without changing the store logic.

**What this lab adds:**
- `immer` middleware: write `state.tasks.push(...)` directly; immer makes it immutable
- `persist` middleware: saves to `localStorage` automatically on every change
- `devtools` middleware: Redux DevTools browser extension support
- Slices: separating unrelated state into independent modules combined into one store

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Why does Zustand require immutable updates (`[...state.tasks, newTask]`) by
>    default? Why does `state.tasks.push(newTask)` not work?
> 2. You use `persist`. The user reloads the page. What happens to their task list?
> 3. Two feature areas (tasks and preferences) live in one store. Name one concrete
>    reason to split them into slices.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The task store enhanced with middleware, surviving a page reload:

```
1. Add a task → stored in localStorage
2. Reload the page → task still there (persist middleware)
3. Complete a task using immer mutation syntax
4. See every action in Redux DevTools (devtools middleware)
```

---

### Concept: `immer` Middleware — Write Mutations Directly

**What it is:** `immer` middleware wraps the store's state in a Proxy. When you
"mutate" the state inside `set()`, immer intercepts the mutations and produces a
new immutable state object. You write mutations; immer produces copies.

**The problem before (spread syntax for nested updates):**

```ts
// Without immer — spread syntax required for immutability:
completeTask: (id) => set(state => ({
  tasks: state.tasks.map(task =>
    task.id === id
      ? { ...task, done: true }  // new object for the changed task
      : task                      // same object for unchanged tasks
  ),
})),
```

For deeply nested state, spread syntax becomes verbose and error-prone.

**The solution — immer mutations:**

```ts
import { immer } from 'zustand/middleware/immer';

const useTaskStore = create<TaskState>()(
  immer((set) => ({
    tasks: [],

    completeTask: (id) => set(state => {
      const task = state.tasks.find(t => t.id === id);
      if (task) task.done = true;   // direct mutation — immer handles immutability
    }),

    addTask: (title) => set(state => {
      state.tasks.push({ id: `t-${Date.now()}`, title, done: false, priority: 'medium' });
    }),
  }))
);
```

**What it hides:** The copy-on-write machinery. Immer tracks which parts of the state
you mutated and creates new objects only for those paths — unchanged parts are shared.

**Canonical example:** Editing a document in a word processor. You type a character (mutation).
The word processor saves a new version with only the changed page re-rendered (immutable result).
You write naturally; the system manages versioning.

**Project Application:** The task store's `deleteTask` and `completeTask` actions become
simpler with immer — no more `filter` or `map` expressions for simple mutations.

**You will see this again in:**
- Redux Toolkit uses immer internally — the same mutation syntax
- `produce()` from the `immer` package — the underlying function
- Zustand with immer is the most common Zustand setup in professional codebases

**Watch for:** Immer mutations only work INSIDE the `set(state => {...})` callback.
Outside that callback, the state is still the regular immutable state. And never
`return` from an immer `set` callback — return is for non-immer updates.

---

## Step 1 — See Why Push Does Not Work Without Immer

```bash
node -e "
const arr = [1, 2, 3];
const ref = arr;
arr.push(4);
console.log(arr === ref);   // true — same reference
console.log(arr);           // [1, 2, 3, 4]
"
```

**You should see:** `true` — pushing mutates the array IN PLACE. The reference does not
change. Zustand uses `Object.is` to detect changes — if the reference is the same,
React doesn't know to re-render. With immer, the mutation produces a NEW array reference.

---

### Concept: `persist` Middleware — Automatic localStorage

**What it is:** `persist` wraps the store and saves its state to `localStorage`
(or any storage adapter) on every change. On page load, it reads from `localStorage`
and merges into the initial state.

**The problem before (manual localStorage):**

```ts
// Every action must manually save to localStorage:
addTask: (title) => {
  const newTasks = [...get().tasks, { id: ..., title, done: false }];
  localStorage.setItem('tasks', JSON.stringify(newTasks));
  set({ tasks: newTasks });
},
// Duplicated for every action — error-prone, easy to forget
```

**The solution:**

```ts
import { persist } from 'zustand/middleware';

const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({ /* store definition — no localStorage calls needed */ }),
    {
      name:       'task-store',     // localStorage key
      version:    1,                // increment when state shape changes
      partialize: (state) => ({ tasks: state.tasks }),  // only persist tasks
    }
  )
);
```

**What it hides:** The serialisation, deserialisation, and hydration complexity.
`persist` serialises to JSON, stores under the key, and on page load reads back and
merges. The store code never mentions `localStorage`.

**`partialize`:** Specifies which parts to save. Exclude transient UI state (selected ID,
filter, modal state) — these should reset on reload. Only persist data the user expects
to survive.

**Canonical example:** Auto-save in a word processor. Every keystroke (state change)
triggers an auto-save. When you reopen the document (page reload), the auto-saved state
is restored. You never called "save" — the mechanism was automatic.

**You will see this again in:**
- Web apps that cache API responses in localStorage for offline access
- Shopping carts: items persisted across page reloads
- User preferences: theme, language, layout

**Watch for:** `partialize` must be used for transient state. Without it, the
selected task ID is saved and restored — which may point to a task that was deleted
in another tab or session.

---

### Concept: Composing Middleware

**What it is:** Middleware is composed by nesting. The order of nesting determines
the order of interception.

```ts
const useTaskStore = create<TaskState>()(
  devtools(          // outermost — wraps everything
    persist(         // middle — handles storage
      immer(         // innermost — handles mutation
        (set, get) => ({
          // store definition
        })
      ),
      { name: 'task-store' }
    ),
    { name: 'TaskStore' }
  )
);
```

**You will see this again in:**
- Redux middleware: `applyMiddleware(logger, thunk, crashReporter)` — same concept
- Express.js: `app.use(logger, auth, rateLimit)` — composed middleware
- Python: `@timer @retry def fn()` — stacked decorators from T5-L0c

---

## Step 2 — Update the Store With Middleware

Update `src/stores/taskStore.ts`:

```ts
import { create }   from 'zustand';
import { immer }    from 'zustand/middleware/immer';
import { persist }  from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export interface Task {
  id:       string;
  title:    string;
  priority: 'low' | 'medium' | 'high';
  done:     boolean;
}

interface TaskState {
  tasks:        Task[];
  selectedId:   string | null;
  filter:       'all' | 'active' | 'done';
  addTask:      (title: string, priority?: Task['priority']) => void;
  selectTask:   (id: string | null) => void;
  completeTask: (id: string) => void;
  deleteTask:   (id: string) => void;
  setFilter:    (filter: TaskState['filter']) => void;
  visibleTasks: () => Task[];
  selectedTask: () => Task | undefined;
}

let _nextId = 1;

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      immer((set, get) => ({
        tasks:      [],
        selectedId: null,
        filter:     'all' as const,

        addTask: (title, priority = 'medium') => set(state => {
          state.tasks.push({
            id: `t-${_nextId++}`, title: title.trim(), priority, done: false,
          });
        }, false, 'tasks/addTask'),

        selectTask: (id) => set({ selectedId: id }, false, 'tasks/selectTask'),

        completeTask: (id) => set(state => {
          const task = state.tasks.find(t => t.id === id);
          if (task) task.done = true;
        }, false, 'tasks/completeTask'),

        deleteTask: (id) => set(state => {
          state.tasks = state.tasks.filter(t => t.id !== id);
          if (state.selectedId === id) state.selectedId = null;
        }, false, 'tasks/deleteTask'),

        setFilter: (filter) => set({ filter }, false, 'tasks/setFilter'),

        visibleTasks: () => {
          const { tasks, filter } = get();
          if (filter === 'active') return tasks.filter(t => !t.done);
          if (filter === 'done')   return tasks.filter(t =>  t.done);
          return tasks;
        },

        selectedTask: () => {
          const { tasks, selectedId } = get();
          return tasks.find(t => t.id === selectedId);
        },
      })),
      {
        name:       'task-store',
        version:    1,
        partialize: (state) => ({ tasks: state.tasks }),   // only persist tasks
      }
    ),
    { name: 'TaskStore' }
  )
);
```

### SAVE AND TRY

```bash
npm run dev
```

1. Add some tasks
2. Reload the page — tasks survive (localStorage persistence)
3. Install Redux DevTools extension in your browser — see the action log with labels
   like `tasks/addTask`, `tasks/completeTask`

**In the browser console:**

```js
localStorage.getItem('task-store')
```

**Expected:** A JSON string containing your tasks. This is what `persist` saved.

**Change something:** Add `state.tasks.push(...)` WITHOUT the immer wrapper
(remove the `immer(...)` layer temporarily). Run the app. Add a task — the UI
does not update. Restore immer.

---

## Step 3 — Write the Tests

Update `src/stores/taskStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './taskStore';

describe('taskStore with immer middleware', () => {

  beforeEach(() => {
    useTaskStore.setState({ tasks: [], selectedId: null, filter: 'all' });
  });

  it('addTask uses immer mutation syntax — no spread required', () => {
    useTaskStore.getState().addTask('Write tests', 'high');
    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].priority).toBe('high');
  });

  it('completeTask mutates only the specific task', () => {
    useTaskStore.getState().addTask('A');
    useTaskStore.getState().addTask('B');
    const [t1] = useTaskStore.getState().tasks;
    useTaskStore.getState().completeTask(t1.id);

    const [a, b] = useTaskStore.getState().tasks;
    expect(a.done).toBe(true);
    expect(b.done).toBe(false);
  });

  it('immer produces immutable state — tasks array is replaced', () => {
    const before = useTaskStore.getState().tasks;
    useTaskStore.getState().addTask('New task');
    const after = useTaskStore.getState().tasks;
    expect(before).not.toBe(after);  // different array reference
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add a `preferences` Slice

**You know:** Slices, `persist` middleware.

**Task:** Create a `usePreferencesStore` with:
- `theme: 'light' | 'dark'`
- `defaultPriority: 'low' | 'medium' | 'high'`
- `setTheme(t)` and `setDefaultPriority(p)` actions
- Persisted separately from task store (different `name` key)

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// src/stores/preferencesStore.ts
import { create }  from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  theme:              'light' | 'dark';
  defaultPriority:    'low' | 'medium' | 'high';
  setTheme:           (t: 'light' | 'dark') => void;
  setDefaultPriority: (p: 'low' | 'medium' | 'high') => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme:           'light',
      defaultPriority: 'medium',
      setTheme:        (t) => set({ theme: t }),
      setDefaultPriority: (p) => set({ defaultPriority: p }),
    }),
    { name: 'preferences-store' }   // different key from task store
  )
);
```

**Tests:**
```ts
it('default theme is light', () => {
  expect(usePreferencesStore.getState().theme).toBe('light');
});

it('setTheme updates the theme', () => {
  usePreferencesStore.getState().setTheme('dark');
  expect(usePreferencesStore.getState().theme).toBe('dark');
});

it('preference changes do not affect task store', () => {
  usePreferencesStore.getState().setTheme('dark');
  expect(useTaskStore.getState().tasks).toHaveLength(0);  // independent
});
```

**Key insight:** Separate stores for separate concerns. Preferences are persisted
permanently; task data could be cleared on logout. They have different schemas and
different lifetimes — keeping them separate allows independent versioning and clearing.

</details>

---

## Final Check

| Middleware | What it does | Key config |
|---|---|---|
| `immer` | Write mutations on draft | — |
| `persist` | Save/load from localStorage | `name`, `partialize` |
| `devtools` | Redux DevTools integration | `name`, action labels |

---

## Quick Check Answers

**1. Why does Zustand require immutable updates? Why does `push` not work?**

React uses reference equality (`Object.is`) to detect changes. `state.tasks.push(...)`
mutates the array in place — the reference stays the same. React sees no difference
and skips the re-render. Zustand's `set()` replaces the state reference, which signals
React that state changed. Immer makes this transparent — you write mutations, immer
produces new immutable references.

**2. User reloads with `persist`. What happens to their task list?**

On startup, Zustand checks `localStorage` for the key specified in `name`. If found,
it merges the stored state with the initial state (stored values override defaults).
Components immediately have the persisted values. The user sees their tasks as if the
page was never reloaded.

**3. Tasks and preferences in one store — concrete reason to split?**

Persistence granularity: task data should be cleared on logout; preferences should
survive. If they share a store with one `name` key, you cannot clear one without
the other. Separate stores can have independent clear/reset operations.
