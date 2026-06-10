# Junior to Senior — T6·L1 — Zustand: Basic Store

**Prerequisites:** T5·L8 (Testing FastAPI). You have a working backend. This
lesson starts Topic 6 — React Patterns and State Management — by introducing Zustand,
the client-side state library that replaces scattered `useState` calls when state is shared.

**What this lab adds:**
- What a store is: global state any component can subscribe to and update
- `create<State>((set) => ({ ... }))` — creating a store
- `useStore(state => state.value)` — subscribing to a slice; re-renders only when that slice changes
- Actions: functions inside the store that call `set` to update state
- Selectors: deriving values from store state
- Zustand vs Context: why Zustand re-renders fewer components

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `useContext(TaskContext)` — a parent updates one value in the context. How
>    many children re-render?
> 2. `const selectedId = useTaskStore(s => s.selectedId)`. The store changes
>    `tasks` but not `selectedId`. Does this component re-render?
> 3. What is a "selector" in Zustand?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A task management store that any component can use directly:

```tsx
// In a task list component:
const tasks   = useTaskStore(s => s.tasks);
const select  = useTaskStore(s => s.selectTask);

// In a detail panel:
const selected = useTaskStore(s => s.selectedTask());

// In a status bar:
const count = useTaskStore(s => s.tasks.filter(t => t.done).length);
```

---

### Concept: The Problem With Prop Drilling

**What it is:** When state lives in a parent component, it must be passed down through
every intermediate component — even components that don't use it.

**The problem before:**

```tsx
<App>                               // holds tasks
  <Sidebar tasks={tasks} />        // passes down — doesn't use tasks
    <TaskList tasks={tasks} />     // passes down again — doesn't use tasks
      <TaskItem task={task} />     // finally uses it
```

When `App` updates `tasks`, every component in the chain re-renders — even `Sidebar`
and `TaskList` that only pass the data through without using it.

**The solution — global store:**

```tsx
// TaskItem subscribes directly — no prop drilling:
function TaskItem({ taskId }: { taskId: string }) {
  const task = useTaskStore(s => s.tasks.find(t => t.id === taskId));
  // Only re-renders when THIS task changes
}
```

**What it hides:** The subscription mechanism. Zustand tracks which components subscribe
to which slices of state. When state changes, only the components subscribed to that
slice re-render.

The invariant Zustand protects: each component re-renders only when the data it
ACTUALLY USES changes — not when any parent state changes.

**Canonical example:** A TV remote control. The remote (store) has volume, channel, and
power state. The volume display (component) only re-renders when volume changes. The
channel display only re-renders when the channel changes. Neither re-renders when
the other changes.

**Project Application:** The task manager has a task list, a detail panel, and a status
bar. All three need task data. Without a store, they would all be children of one parent
managing the data, with constant unnecessary re-renders.

**You will see this again in:**
- Redux: the original global store library for React
- MobX: observable state (similar principle, different implementation)
- Jotai, Recoil: atomic state (similar principle, per-atom subscriptions)
- React Query (T6-L3): server state management with the same subscribe-to-a-slice pattern

**Watch for:** Not everything belongs in a store. Local UI state (modal open/closed,
form input values, hover state) should stay in component `useState`. The store is for
state shared across components or that needs to survive navigation.

---

## Step 1 — Set Up the Project and Install Zustand

```bash
npm create vite@latest contact-manager -- --template react-ts
cd contact-manager
npm install
npm install zustand
```

Verify Zustand is available:

```bash
node -e "require('zustand'); console.log('zustand OK')"
```

Expected: `zustand OK`

---

### Concept: Creating a Store With `create`

**What it is:** `create<State>((set) => ...)` returns a custom hook. The store
definition is a function that receives `set` (for updating state) and returns
the initial state plus action functions.

**The problem before (scattered useState):**

```tsx
// State scattered across components:
function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // ...
}

function StatusBar() {
  const [tasks] = useState<Task[]>([]);   // DIFFERENT state — not in sync
  // Cannot read from TaskList's state
}
```

**The solution:**

```ts
import { create } from 'zustand';

interface Task {
  id:       string;
  title:    string;
  priority: 'low' | 'medium' | 'high';
  done:     boolean;
}

interface TaskState {
  tasks:        Task[];
  selectedId:   string | null;
  addTask:      (title: string, priority?: Task['priority']) => void;
  selectTask:   (id: string | null) => void;
  completeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks:      [],
  selectedId: null,

  addTask: (title, priority = 'medium') => set(state => ({
    tasks: [...state.tasks, { id: `t-${Date.now()}`, title, priority, done: false }],
  })),

  selectTask:   (id) => set({ selectedId: id }),

  completeTask: (id) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, done: true } : t),
  })),
}));
```

**What it hides:** The subscription tracking. When `addTask` calls `set()`, Zustand
compares the previous state to the new state and re-renders only the components whose
subscribed selector value changed.

**Project Application:** `useTaskStore` is the single source of truth for all task data.
The task list, detail panel, and status bar all read from it. Any of them can update it.

**Smallest possible example:**

```ts
import { create } from 'zustand';

const useCounterStore = create<{ count: number; increment: () => void }>((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));

// In a component:
const count     = useCounterStore(s => s.count);
const increment = useCounterStore(s => s.increment);
```

**You will see this again in:**
- The Zustand documentation uses this exact pattern
- Every React application at scale uses a store (Zustand, Redux, or similar)
- The "selector" argument `(s => s.count)` is the same concept as Redux `useSelector`

**Watch for:** Store actions should call `set` — not mutate state directly.
`state.tasks.push(...)` mutates the existing array and Zustand will not detect the change.
Always use spread: `tasks: [...state.tasks, newTask]`.

---

## Step 2 — Build the Task Store

Create `src/stores/taskStore.ts`:

```ts
import { create } from 'zustand';

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

  // Derived state — computed from current store values:
  visibleTasks: () => Task[];
  selectedTask: () => Task | undefined;
}

let _nextId = 1;

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks:      [],
  selectedId: null,
  filter:     'all',

  addTask: (title, priority = 'medium') => set(state => ({
    tasks: [
      ...state.tasks,
      { id: `t-${_nextId++}`, title: title.trim(), priority, done: false },
    ],
  })),

  selectTask: (id) => set({ selectedId: id }),

  completeTask: (id) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, done: true } : t),
  })),

  deleteTask: (id) => set(state => ({
    tasks:      state.tasks.filter(t => t.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  })),

  setFilter: (filter) => set({ filter }),

  visibleTasks: () => {
    const { tasks, filter } = get();   // get() reads current state without subscribing
    switch (filter) {
      case 'active': return tasks.filter(t => !t.done);
      case 'done':   return tasks.filter(t =>  t.done);
      default:       return tasks;
    }
  },

  selectedTask: () => {
    const { tasks, selectedId } = get();
    return tasks.find(t => t.id === selectedId);
  },
}));
```

### SAVE AND TRY

```bash
npx tsx -e "
import { useTaskStore } from './src/stores/taskStore.ts';
console.log('store created');
" 2>/dev/null || echo "TypeScript file — needs compilation"
```

The store can't be run directly with tsx (it uses React context). Instead verify
TypeScript compiles it:

```bash
npx tsc --noEmit src/stores/taskStore.ts --allowImportingTsExtensions 2>&1 | head -5
```

Expected: no type errors.

---

### Concept: Selectors — Subscribe to a Slice

**What it is:** The argument to `useTaskStore(selector)` is a selector — a function
from the full state to the value the component needs. Zustand only re-renders when the
selector's return value changes (using `Object.is` comparison).

**The problem before (subscribing to too much state):**

```tsx
// This re-renders on ANY store change:
const state = useTaskStore();
const tasks = state.tasks;   // re-renders when selectedId changes — unnecessary

// This also re-renders unnecessarily:
const { tasks, selectedId } = useTaskStore();   // subscribes to both
```

**The solution — precise selectors:**

```tsx
// Re-renders ONLY when tasks change:
const tasks = useTaskStore(s => s.tasks);

// Re-renders ONLY when selectedId changes:
const selectedId = useTaskStore(s => s.selectedId);

// Actions never change — subscribing to them causes zero re-renders:
const addTask = useTaskStore(s => s.addTask);
```

**What it hides:** The equality check. After every state update, Zustand calls the
selector with the new state and compares the result to the previous result using
`Object.is`. Only if they differ does the component re-render.

**Canonical example:** A news feed. You subscribe to "technology" news (selector). When
"sports" news arrives (state change), you don't get notified because your subscription
only covers technology.

**Project Application:** Each component in the task manager subscribes to exactly the
state it needs — `TaskList` to `tasks`, `TaskDetail` to the selected task, `StatusBar` to
done count. No component re-renders because of another component's data changing.

**You will see this again in:**
- Redux: `useSelector(state => state.tasks)` — same concept
- React Query: `useQuery` with `select` option
- MobX: `observer` wrapping with fine-grained observable tracking

**Watch for:** Selectors returning objects. `useTaskStore(s => ({ tasks: s.tasks, selectedId: s.selectedId }))`
creates a new object on every call — so `Object.is` always returns false — so the component
always re-renders. Use `useShallow` from `zustand/react/shallow` for object selectors.

---

## Step 3 — Build Components Using the Store

Create `src/components/TaskList.tsx`:

```tsx
import { useTaskStore } from '../stores/taskStore';

export function TaskList() {
  const tasks    = useTaskStore(s => s.visibleTasks());
  const select   = useTaskStore(s => s.selectTask);
  const selected = useTaskStore(s => s.selectedId);

  if (tasks.length === 0) {
    return <p style={{ color: '#999' }}>No tasks. Add one above.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map(task => (
        <li
          key={task.id}
          onClick={() => select(task.id)}
          style={{
            padding:         '8px 12px',
            marginBottom:    4,
            cursor:          'pointer',
            background:      selected === task.id ? '#e3f2fd' : '#f5f5f5',
            borderRadius:    4,
            textDecoration:  task.done ? 'line-through' : 'none',
          }}
        >
          [{task.priority.toUpperCase()}] {task.title}
        </li>
      ))}
    </ul>
  );
}
```

Create `src/components/AddTaskForm.tsx`:

```tsx
import { useState } from 'react';
import { useTaskStore, type Task } from '../stores/taskStore';

export function AddTaskForm() {
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const addTask                 = useTaskStore(s => s.addTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, priority);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title..."
        style={{ flex: 1, padding: '6px 10px' }}
      />
      <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit">Add</button>
    </form>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: a form to add tasks and a list that shows them.
Select a task — it highlights. Notice that `AddTaskForm` never re-renders when you select
tasks (its selector only reads `addTask`, which never changes).

**Change something:** Add `console.log(task.id + ' rendered')` inside the `<li>` map.
Add a task. Select it. Notice only the task list re-renders, not the form. This demonstrates
selective re-rendering.

---

## Step 4 — Write the Store Tests

Install testing dependencies:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Add to `vite.config.ts`:

```ts
test: { environment: 'jsdom' }
```

Create `src/stores/taskStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './taskStore';

describe('taskStore', () => {

  beforeEach(() => {
    // Reset store state before each test:
    useTaskStore.setState({ tasks: [], selectedId: null, filter: 'all' });
    // Reset the ID counter too:
    const { addTask, ...rest } = useTaskStore.getState();
  });

  it('adds a task with the given title and default priority', () => {
    useTaskStore.getState().addTask('Write tests', 'high');
    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Write tests');
    expect(tasks[0].priority).toBe('high');
    expect(tasks[0].done).toBe(false);
  });

  it('completes a task by id', () => {
    useTaskStore.getState().addTask('Write tests');
    const task = useTaskStore.getState().tasks[0];
    useTaskStore.getState().completeTask(task.id);
    expect(useTaskStore.getState().tasks[0].done).toBe(true);
  });

  it('deletes a task and clears selection if deleted task was selected', () => {
    useTaskStore.getState().addTask('Write tests');
    const task = useTaskStore.getState().tasks[0];
    useTaskStore.getState().selectTask(task.id);
    useTaskStore.getState().deleteTask(task.id);
    expect(useTaskStore.getState().tasks).toHaveLength(0);
    expect(useTaskStore.getState().selectedId).toBeNull();
  });

  it('visibleTasks returns only active tasks when filter is active', () => {
    useTaskStore.getState().addTask('Active');
    useTaskStore.getState().addTask('Done');
    const tasks = useTaskStore.getState().tasks;
    useTaskStore.getState().completeTask(tasks[1].id);
    useTaskStore.getState().setFilter('active');
    expect(useTaskStore.getState().visibleTasks()).toHaveLength(1);
    expect(useTaskStore.getState().visibleTasks()[0].title).toBe('Active');
  });

  it('selectedTask returns the task matching selectedId', () => {
    useTaskStore.getState().addTask('Write tests');
    const task = useTaskStore.getState().tasks[0];
    useTaskStore.getState().selectTask(task.id);
    expect(useTaskStore.getState().selectedTask()?.title).toBe('Write tests');
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

**You should see:**
```
✓ taskStore > adds a task with the given title and default priority
✓ taskStore > completes a task by id
✓ taskStore > deletes a task and clears selection if deleted task was selected
✓ taskStore > visibleTasks returns only active tasks when filter is active
✓ taskStore > selectedTask returns the task matching selectedId

Tests  5 passed (5)
```

**Change something:** Remove `selectedId: state.selectedId === id ? null : state.selectedId`
from `deleteTask`. Run the `'deletes a task and clears selection'` test.
Expected: fails — `selectedId` still points to the deleted task. Restore the fix.

---

## 🎯 Challenge: Add Undo Action

**You know:** Zustand store structure, `set`, `get`, immutable state updates.

**Task:** Add `undo()` to the store that reverses the last `addTask` or `deleteTask`.
Maintain a `history: Task[][]` array — before each mutation, push the current tasks.

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Add to TaskState interface:
history: Task[][];
undo: () => void;

// In create():
history: [],

addTask: (title, priority = 'medium') => set(state => ({
  history: [...state.history, state.tasks],  // ← save before mutating
  tasks: [...state.tasks, { id: `t-${_nextId++}`, title: title.trim(), priority, done: false }],
})),

deleteTask: (id) => set(state => ({
  history:    [...state.history, state.tasks],  // ← save before mutating
  tasks:      state.tasks.filter(t => t.id !== id),
  selectedId: state.selectedId === id ? null : state.selectedId,
})),

undo: () => set(state => {
  if (state.history.length === 0) return {};
  const previous = state.history[state.history.length - 1];
  return {
    tasks:   previous,
    history: state.history.slice(0, -1),
  };
}),
```

**Tests:**
```ts
it('undo reverses the last addTask', () => {
  useTaskStore.getState().addTask('A');
  useTaskStore.getState().addTask('B');
  useTaskStore.getState().undo();
  expect(useTaskStore.getState().tasks).toHaveLength(1);
});

it('undo does nothing when history is empty', () => {
  useTaskStore.getState().undo();   // no error
  expect(useTaskStore.getState().tasks).toHaveLength(0);
});

it('undo reverses a delete', () => {
  useTaskStore.getState().addTask('A');
  const id = useTaskStore.getState().tasks[0].id;
  useTaskStore.getState().deleteTask(id);
  useTaskStore.getState().undo();
  expect(useTaskStore.getState().tasks).toHaveLength(1);
});
```

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Selector granularity | `console.log` in a component — only logs when subscribed slice changes |
| Actions are stable | `addTask` reference doesn't change between renders |
| `getState()` in tests | Tests run without React — direct state access |
| Filter state | Switch filter, verify `visibleTasks()` returns correct subset |
| State reset in tests | `beforeEach` resets store — test 2 sees clean state |

---

## Quick Check Answers

**1. `useContext(TaskContext)` — parent updates one value. How many children re-render?**

ALL consumers of that context re-render — even those that only use a different value in
the context object. React context uses reference equality; the context object is a new
reference on every update. Zustand solves this with selectors — each component subscribes
to only the data it uses.

**2. Store changes `tasks` but not `selectedId`. Does `useTaskStore(s => s.selectedId)` re-render?**

No. The selector `s => s.selectedId` returns the same value before and after the update.
Zustand compares previous result to new result using `Object.is`. Since `selectedId` did
not change, the comparison passes and no re-render is triggered.

**3. What is a "selector" in Zustand?**

The function argument passed to `useTaskStore(...)`. It takes the full store state and
returns a slice — the specific value or values the component needs. Zustand uses it to
determine whether the component should re-render: if the selector's output changed, re-render;
otherwise, skip.
