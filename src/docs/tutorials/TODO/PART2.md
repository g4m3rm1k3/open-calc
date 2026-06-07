# Part 2: Building a Real React Frontend
## A Software Engineering Masterclass — The Frontend Mirror

> **Quick recap of Part 1**: We built an Express backend with four layers — types, repository, service, routes. Each layer answered exactly one question.  
> **Part 2's thesis**: The React frontend has the exact same four layers with different names. Once you see the mirror, you'll never forget either side.

---

## The Mirror

| Backend | Frontend | The Question |
|---|---|---|
| `types/todo.ts` | `types/todo.ts` | What IS a Todo? |
| `repositories/todoRepository.ts` | `api/todoApi.ts` | Where does data come from? |
| `services/todoService.ts` | `hooks/useTodos.ts` | What are we allowed to do? |
| `routes/todoRoutes.ts` | `components/` | How does the user interact? |
| `app.ts` | `App.tsx` | How does it all connect? |

The domain knowledge in the middle (`types/`, `services/`) barely changes. Only the edges change — "HTTP in" becomes "HTTP out", and "HTTP out" becomes "React UI".

---

## The Problem With Scripted React

Before we build the right way, here's what most beginners write — and why it causes drift:

```tsx
// ❌ THE SCRIPTED WAY
function App() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')

  // fetch, state logic, validation, AND rendering all in one component
  useEffect(() => {
    fetch('http://localhost:3001/api/todos')
      .then(r => r.json())
      .then(data => setTodos(data))
  }, [])

  function handleAdd() {
    if (!input.trim()) return  // validation buried in the component
    fetch('http://localhost:3001/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input })
    })
      .then(r => r.json())
      .then(todo => {
        setTodos([...todos, todo])  // direct state mutation pattern
        setInput('')
      })
  }

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleAdd}>Add</button>
      {todos.map(t => <div key={t.id}>{t.title}</div>)}
    </div>
  )
}
```

**The problems:**
- The URL `http://localhost:3001/api/todos` is hardcoded in the middle of UI code. Change the API and you hunt through components.
- Validation logic (`if (!input.trim())`) is inside the UI. If you add a second form, you copy-paste it.
- State management, data fetching, and rendering are one tangled blob. You can't test any piece in isolation.
- `App` knows too much. It knows *how* to fetch, *where* to fetch from, *what* to validate, *and* how to render.

---

## The File Structure We're Building

```
src/
  types/
    todo.ts           ← Same contracts as the backend (or imported from a shared package)
  api/
    todoApi.ts        ← All HTTP calls live here. One file. Period.
  hooks/
    useTodos.ts       ← State management + business logic
  components/
    TodoList.tsx      ← Displays todos. Knows nothing about fetching.
    TodoItem.tsx      ← One todo. Purely visual.
    AddTodoForm.tsx   ← The input form. Fires a callback. That's it.
  App.tsx             ← Wires it all together
  main.tsx            ← Entry point (Vite/React bootstrapping)
```

---

## Step 1: Types — The Shared Contract

The types are almost identical to Part 1. In a real monorepo (a single repo with both frontend and backend), you'd share this file literally. For now, we redeclare it.

```typescript
// src/types/todo.ts

// This is the same shape the backend sends us.
// If the backend changes this, TypeScript will tell us everywhere we use it.
export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string  // ← Note: string, not Date. JSON has no Date type.
                     // The backend serializes Date → string over the wire.
                     // This is a real gotcha. Always use string for dates from APIs.
}

// What we send TO the backend to create a todo
export interface CreateTodoInput {
  title: string
}

// What we send to update — both fields optional
export interface UpdateTodoInput {
  title?: string
  completed?: boolean
}
```

**The `Date` vs `string` lesson**: This is one of those things no one explains. JavaScript's `JSON.stringify()` converts `Date` objects to ISO strings (`"2024-01-15T10:30:00.000Z"`). When you `JSON.parse()` on the other end, you get a string back — not a Date. Your type must reflect what actually comes over the wire, not what you wish came over the wire. Always trust the wire format.

---

## Step 2: The API Layer — Your Frontend's Repository

**Pattern: API Client Module**

This file is the frontend equivalent of the backend's repository. It's the *only* place that knows:
- The base URL of the API
- How to set headers
- How to handle HTTP errors

```typescript
// src/api/todoApi.ts
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo'

// The base URL comes from an environment variable.
// In Vite, env vars must start with VITE_ to be exposed to the browser.
// You'll have a .env file: VITE_API_URL=http://localhost:3001
// In production, this becomes your real server URL.
// The `??` operator means "use the fallback if the left side is null or undefined"
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// ─── A shared fetch wrapper ───────────────────────────────────────
// This is a critical pattern. fetch() does NOT throw on 4xx/5xx errors.
// A 404 is "successful" to fetch — you got a response.
// This wrapper turns HTTP error status codes into thrown errors,
// so callers don't have to check res.ok every single time.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,   // Allow callers to add extra headers without losing the default
    },
  })

  if (!response.ok) {
    // Try to parse the error message from our API's JSON error format
    // The backend sends: { error: "Todo not found" }
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }

  // 204 No Content — body is empty, return undefined cast to T
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// ─── Public API functions ─────────────────────────────────────────
// Each function is small, named, and typed.
// The caller never writes fetch() — they call these.

export async function fetchTodos(): Promise<Todo[]> {
  return request<Todo[]>('/api/todos')
}

export async function fetchTodo(id: string): Promise<Todo> {
  return request<Todo>(`/api/todos/${id}`)
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return request<Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
  return request<Todo>(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteTodo(id: string): Promise<void> {
  return request<void>(`/api/todos/${id}`, { method: 'DELETE' })
}
```

**The `request<T>` wrapper pattern**: Notice the generic `<T>`. This is TypeScript generics — instead of writing a separate wrapper for every return type, we write one wrapper that adapts to whatever type you tell it to return. `request<Todo[]>` returns `Promise<Todo[]>`. `request<void>` returns `Promise<void>`. Same logic, different shapes. This is parametric reuse.

---

## Step 3: The Custom Hook — Your Frontend's Service Layer

**Pattern: Custom Hook as Service**

This is the most important concept in React architecture. A custom hook is a function that:
- Starts with `use` (React convention, not decoration)
- Can call other hooks (`useState`, `useEffect`, etc.)
- Encapsulates *all* the state logic and side effects for a feature
- Returns *only what the component needs* — not the whole state shape

```typescript
// src/hooks/useTodos.ts
import { useState, useEffect, useCallback } from 'react'
import * as todoApi from '../api/todoApi'
import { Todo } from '../types/todo'

// The shape of what this hook returns.
// Defining it as an interface makes it easy to read and document.
interface UseTodosReturn {
  todos: Todo[]
  isLoading: boolean
  error: string | null
  addTodo: (title: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  removeTodo: (id: string) => Promise<void>
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Load todos on mount ────────────────────────────────────────
  useEffect(() => {
    // We define the async function inside useEffect because
    // useEffect's callback itself cannot be async.
    // This is a common React pattern — not a workaround, it's intentional.
    async function load() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await todoApi.fetchTodos()
        setTodos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load todos')
      } finally {
        setIsLoading(false)  // always runs — success or failure
      }
    }

    load()
  }, [])  // ← The empty array means "run once, when the component first mounts"
           // If you put [userId] here, it re-runs whenever userId changes.
           // This is the dependency array — one of React's most important concepts.

  // ─── useCallback: memoized functions ───────────────────────────
  // useCallback returns a memoized version of the function.
  // WHY? If we define addTodo as a plain function, React creates a new
  // function object every render. Any child component that receives it
  // as a prop thinks it changed and re-renders unnecessarily.
  // useCallback: "only create a new function if these dependencies change"
  const addTodo = useCallback(async (title: string) => {
    // Business rule (just like the service layer): validate before calling the API
    if (!title.trim()) return

    try {
      const newTodo = await todoApi.createTodo({ title: title.trim() })
      // Functional state update: use the previous state to compute the new state.
      // NEVER do: setTodos([...todos, newTodo]) — `todos` in that closure may be stale.
      // DO: setTodos(prev => [...prev, newTodo]) — `prev` is always current.
      setTodos(prev => [...prev, newTodo])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo')
    }
  }, [])  // No dependencies — this function doesn't close over any state

  const toggleTodo = useCallback(async (id: string) => {
    // Find the todo to determine what "toggled" means
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    try {
      const updated = await todoApi.updateTodo(id, { completed: !todo.completed })
      // Map over previous state: replace the one that changed, keep the rest
      setTodos(prev => prev.map(t => t.id === id ? updated : t))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
    }
  }, [todos])  // ← `todos` is a dependency because we read it inside the callback

  const removeTodo = useCallback(async (id: string) => {
    try {
      await todoApi.deleteTodo(id)
      // Filter out the removed item
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
    }
  }, [])

  return { todos, isLoading, error, addTodo, toggleTodo, removeTodo }
}
```

**The stale closure problem** is one of the most common React bugs for beginners. When you write `setTodos([...todos, newTodo])`, the `todos` variable was captured at the moment the function was *created*. If another update happened since then, your `todos` is stale — you're appending to an old list. `setTodos(prev => [...prev, newTodo])` gets the *current* state at the moment of the update, not the moment of the closure. Use functional updates whenever the new state depends on the old state.

---

## Step 4: Components — Purely Visual

**Pattern: Dumb Components (Presentational Components)**

A "dumb" or "presentational" component:
- Receives data via `props`
- Fires `callbacks` when something happens
- Has **zero** knowledge of where data comes from or how state is managed
- Is easy to test: give it props, assert it renders correctly

```tsx
// src/components/TodoItem.tsx
import { Todo } from '../types/todo'

// Define props as an interface — always.
// This is the component's "contract": here's exactly what I need to work.
interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void    // callback — we fire it, we don't define it
  onDelete: (id: string) => void
}

// Note: no state, no effects, no API calls.
// This component's entire job is: "given a todo, render it"
export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        // We call onToggle with the id and let the CALLER decide what "toggle" does.
        // This component has no opinion about what happens next.
      />
      <span style={{
        textDecoration: todo.completed ? 'line-through' : 'none',
        color: todo.completed ? '#888' : 'inherit',
        flex: 1,
      }}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete ${todo.title}`}  // ← Accessibility. Always label icon buttons.
      >
        ✕
      </button>
    </li>
  )
}
```

```tsx
// src/components/TodoList.tsx
import { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

// TodoList doesn't know what a "toggle" does. It just passes the callback down.
// This is called "prop drilling" — for 2 levels, it's fine.
// For deeper nesting, you'd use Context. We'll get there.
export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ color: '#888', fontStyle: 'italic' }}>No todos yet. Add one above.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map(todo => (
        // key is required on list items. React uses it to track which item is which.
        // Use the stable ID from your data — NEVER use the array index.
        // WHY? If you reorder or delete, index-based keys cause React to update
        // the wrong items. Your stable ID is already unique and never changes.
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
```

```tsx
// src/components/AddTodoForm.tsx
import { useState, FormEvent } from 'react'

interface AddTodoFormProps {
  onAdd: (title: string) => Promise<void>
  disabled?: boolean
}

// This component manages its OWN local state (the input field).
// That's appropriate — the input value is UI state, not application state.
// Rule of thumb: if state is only relevant to how this component looks,
// keep it local. If other components need it, lift it up.
export function AddTodoForm({ onAdd, disabled }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()             // Prevent the browser from reloading the page
    if (!title.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAdd(title)           // Let the parent handle the actual work
      setTitle('')                 // Only clear input on success
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        disabled={disabled || isSubmitting}
        style={{ flex: 1, padding: '8px' }}
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || isSubmitting || !title.trim()}
      >
        {isSubmitting ? 'Adding...' : 'Add'}
      </button>
    </form>
  )
}
```

**The `disabled` pattern**: Notice `AddTodoForm` has a `disabled` prop. The parent passes `isLoading` into it. The form doesn't know *why* it's disabled — maybe the data is loading, maybe the user isn't logged in. It just knows "when disabled is true, don't let the user submit." This keeps the component flexible. It works in any context.

---

## Step 5: App.tsx — The Composition Root

**Pattern: Smart Container**

`App.tsx` is the one "smart" component. It:
- Calls the custom hook (gets state and actions)
- Passes data down to dumb components as props
- Passes actions down as callbacks

It's the wiring layer. Like `app.ts` in the backend.

```tsx
// src/App.tsx
import { useTodos } from './hooks/useTodos'
import { TodoList } from './components/TodoList'
import { AddTodoForm } from './components/AddTodoForm'

export default function App() {
  // One line. This is all App needs to know about state management.
  // The hook encapsulates everything — state, loading, errors, actions.
  const { todos, isLoading, error, addTodo, toggleTodo, removeTodo } = useTodos()

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h1>Todos</h1>

      {/* Error banner — shown when something goes wrong */}
      {error && (
        <div style={{ background: '#fee', border: '1px solid #f88', padding: '8px', marginBottom: '16px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <AddTodoForm onAdd={addTodo} disabled={isLoading} />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        // Props flow down. Callbacks flow up.
        // App owns the data. Components display and interact.
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={removeTodo}
        />
      )}

      <p style={{ color: '#888', fontSize: '14px' }}>
        {todos.filter(t => !t.completed).length} remaining
      </p>
    </div>
  )
}
```

**Props down, callbacks up** — this is React's fundamental data flow. Data flows *down* the tree via props. User interactions flow *back up* via callback functions. `App` owns the data and the actions. Components are just UI surfaces.

---

## Step 6: Entry Point

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode renders your components twice in development.
  // WHY? To catch bugs caused by side effects running at the wrong time.
  // It's annoying when you first see it. It's saved countless production bugs.
  // Never remove it.
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## Step 7: Project Setup

```bash
# Create the project with Vite (the modern alternative to Create React App)
npm create vite@latest todo-client -- --template react-ts
cd todo-client
npm install

# Create your .env file — Vite reads this automatically
echo "VITE_API_URL=http://localhost:3001" > .env
```

```
todo-client/
  src/
    types/
      todo.ts
    api/
      todoApi.ts
    hooks/
      useTodos.ts
    components/
      TodoItem.tsx
      TodoList.tsx
      AddTodoForm.tsx
    App.tsx
    main.tsx
  .env
  package.json
  tsconfig.json
```

---

## The Full Data Flow, Traced

Here's what happens when a user types a title and clicks "Add":

```
User clicks "Add"
  → AddTodoForm.handleSubmit fires
  → calls onAdd(title)               [prop callback — goes up to App]
    → App passed useTodos().addTodo as onAdd
    → addTodo(title) runs in useTodos
    → validates: title.trim() must not be empty
    → calls todoApi.createTodo({ title })
      → request<Todo>('/api/todos', { method: 'POST', body: ... })
        → fetch('http://localhost:3001/api/todos', ...)
        → Express receives POST /api/todos
        → todoRoutes → todoService.createTodo → todoRepository.create
        → returns 201 { id, title, completed: false, createdAt }
      → request parses JSON → returns Todo
    → setTodos(prev => [...prev, newTodo])  [state update]
    → React re-renders
  → TodoList receives new todos prop
  → new TodoItem renders for the new todo
User sees the new todo in the list
```

Every step crosses exactly one layer boundary. No step skips a layer. This is called **layered architecture** — and this trace is exactly what you'd draw in a system design interview.

---

## Patterns Recap: What You Just Learned

| Pattern | Where | The Problem It Solves |
|---|---|---|
| **API Client Module** | `api/todoApi.ts` | HTTP details in one place. Components never write fetch(). |
| **Generic fetch wrapper** | `api/todoApi.ts` | Handle HTTP errors once, not in every caller. |
| **Custom Hook as Service** | `hooks/useTodos.ts` | State logic and side effects extracted from components. |
| **Functional state updates** | `hooks/useTodos.ts` | Avoid stale closures. Always use `prev =>` when new state depends on old. |
| **useCallback** | `hooks/useTodos.ts` | Stable function references. Prevent unnecessary child re-renders. |
| **Presentational Components** | `components/` | Components that only render. Testable, reusable, readable. |
| **Props down, callbacks up** | `App.tsx` → components | Unidirectional data flow. Predictable state changes. |
| **Local vs lifted state** | `AddTodoForm.tsx` | Input state stays local. Shared state lives in the hook. |
| **Stable keys** | `TodoList.tsx` | Use data IDs for list keys. Never use array index. |
| **Composition Root** | `App.tsx` | One smart component. Everything else is dumb. |

---

## The "Drift" Checklist

When you're coding along and feel lost, run through this:

**For any new piece of code, ask:**
1. Does this touch the network? → It belongs in `api/`
2. Does this manage state or side effects? → It belongs in `hooks/`
3. Does this render UI? → It belongs in `components/`
4. Does this wire pieces together? → It belongs in `App.tsx`

**If a component is getting long:**
- Is it doing fetch calls? Extract an API function.
- Is it managing complex state? Extract a custom hook.
- Is it rendering a big chunk that could stand alone? Extract a component.

**If you feel yourself copy-pasting:**
- Logic copy-paste → extract a utility function or hook
- JSX copy-paste → extract a component
- fetch copy-paste → add a function to the API module

---

## What's Next in Part 3 (Optional)

The foundation is solid. Part 3 could cover:

- **Error Boundaries** — catching render errors gracefully (React's try/catch equivalent)
- **React Query / TanStack Query** — replacing your custom hook with an industry-standard data-fetching library, and seeing why it's worth it
- **Context API** — when prop drilling gets too deep (auth state, themes, user preferences)
- **Optimistic updates** — updating the UI before the server confirms, then rolling back on error (makes the app feel instant)
- **Zod validation** — runtime schema validation so bad API responses don't silently corrupt your state
- **Testing** — unit testing the hook with `vitest`, component testing with `@testing-library/react`

Each of these is a direct upgrade to something you've already built. You'll understand *why* each library or pattern exists because you've felt the pain it solves.