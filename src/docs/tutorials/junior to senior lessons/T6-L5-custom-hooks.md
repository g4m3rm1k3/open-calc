# Junior to Senior — T6·L5 — Custom Hooks

**Prerequisites:** T6·L4 (React Query Mutations). You can fetch and mutate server
state. This lesson covers custom hooks — the extraction pattern that turns
scattered stateful logic into named, reusable, testable units.

**What this lab adds:**
- What makes a function a custom hook (starts with `use`, calls other hooks)
- Extracting repeated stateful logic into a custom hook
- Return shapes: `{ value, setValue }` vs `[value, setValue]`
- Composing hooks: a custom hook that calls other custom hooks
- Testing custom hooks with `renderHook`

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two components both have `const [count, setCount] = useState(0)`. Do they
>    share the same state?
> 2. You build `useTaskForm()`. Inside it, you call `useState` and `useQuery`.
>    Is this allowed?
> 3. A custom hook that returns `{ tasks, addTask, isLoading }` — when should
>    the caller destructure vs use as an object?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three custom hooks that encapsulate the complexity of the task management UI:

```tsx
// Extracted form logic:
const { title, priority, handleSubmit, resetForm, isSubmitting } = useAddTaskForm();

// Extracted task operations:
const { complete, delete: remove, isPending } = useTaskActions(taskId);

// Extracted keyboard shortcut handling:
useKeyboardShortcut('Delete', () => remove(selectedTaskId));
```

---

### Concept: What a Custom Hook Is

**The rules:**
1. The function name starts with `use`
2. It may call other hooks (React built-ins or custom hooks)
3. Rules of hooks apply: only call hooks at the top level — no conditionals

**What custom hooks are for:**
- Extracting stateful logic shared between components
- Naming a complex state/effect combination
- Encapsulating external system subscriptions

**What custom hooks are NOT:**
- A way to share state between components (each call gets its own state)
- A React feature — they are conventions enforced by the linter

```tsx
// WITHOUT a custom hook — logic duplicated in two components:
function TaskListPage() {
  const [search, setSearch]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  // ...
}

function SearchBar() {
  const [search, setSearch]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => { /* same */ }, [search]);
  // ...
}

// WITH a custom hook — extracted once:
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function TaskListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch     = useDebounce(search, 300);
  // ...
}
```

---

### Concept: Return Shape

**Object `{ key: value }` for named fields:**

```tsx
// Object return — clear names, any order, callers choose what to destructure:
function useTaskForm() {
  const [title, setTitle] = useState('');
  // ...
  return { title, setTitle, handleSubmit, isPending, resetForm };
}

// Caller:
const { title, handleSubmit } = useTaskForm();   // only what's needed
```

**Tuple `[value, setter]` for pair conventions:**

```tsx
// Tuple return — conventional when it's a simple value/setter pair:
function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const setAndStore = (v: T) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  };

  return [value, setAndStore];
}

// Caller — just like useState:
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

**Rule:** Use a tuple when the hook is analogous to `useState` (a single value
and its setter). Use an object for anything more complex.

---

## Step 1 — Build Three Custom Hooks

Create `src/hooks/useDebounce.ts`:

```ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

Create `src/hooks/useAddTaskForm.ts`:

```ts
import { useState }         from 'react';
import { useCreateTask }    from './useTaskMutations';

interface UseAddTaskFormResult {
  title:        string;
  priority:     'low' | 'medium' | 'high';
  setTitle:     (t: string) => void;
  setPriority:  (p: 'low' | 'medium' | 'high') => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm:    () => void;
  isPending:    boolean;
  isError:      boolean;
}

export function useAddTaskForm(): UseAddTaskFormResult {
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const createTask              = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate(
      { title: title.trim(), priority },
      { onSuccess: () => resetForm() },
    );
  };

  const resetForm = () => {
    setTitle('');
    setPriority('medium');
  };

  return {
    title,
    priority,
    setTitle,
    setPriority,
    handleSubmit,
    resetForm,
    isPending: createTask.isPending,
    isError:   createTask.isError,
  };
}
```

Create `src/hooks/useKeyboardShortcut.ts`:

```ts
import { useEffect, useCallback } from 'react';

export function useKeyboardShortcut(
  key:     string,
  handler: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; shiftKey?: boolean } = {},
): void {
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key !== key) return;
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      stableHandler(e);
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [key, options.ctrlKey, options.shiftKey, stableHandler]);
}
```

---

## Step 2 — Write Tests With `renderHook`

Create `src/hooks/useDebounce.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {

  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(()  => { vi.useRealTimers(); });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');   // not updated yet

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('initial');   // still not updated
  });

  it('updates after the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('updated');
  });

  it('resets the timer when value changes before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(200));  // not expired yet

    rerender({ value: 'c' });               // new value resets timer
    act(() => vi.advanceTimersByTime(200));  // 200ms after 'c' — not expired
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(100));  // 300ms after 'c' — expired
    expect(result.current).toBe('c');
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Build `useLocalStorage`

**You know:** Custom hooks, `useState`, `useEffect`, return shapes.

**Task:** Build `useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void]`

Requirements:
- Initial value is read from localStorage on first render
- Updates are written to localStorage whenever the value changes
- Works with any JSON-serialisable type
- Falls back to `initial` if localStorage is empty or contains invalid JSON

Write 4 tests before implementing.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**Tests:**
```ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

beforeEach(() => localStorage.clear());

it('returns the initial value when nothing is stored', () => {
  const { result } = renderHook(() => useLocalStorage('key', 'default'));
  expect(result.current[0]).toBe('default');
});

it('reads a previously stored value', () => {
  localStorage.setItem('key', JSON.stringify('stored'));
  const { result } = renderHook(() => useLocalStorage('key', 'default'));
  expect(result.current[0]).toBe('stored');
});

it('writes new value to localStorage', () => {
  const { result } = renderHook(() => useLocalStorage('key', 0));
  act(() => result.current[1](42));
  expect(localStorage.getItem('key')).toBe('42');
});

it('falls back to initial on invalid JSON', () => {
  localStorage.setItem('key', 'not-valid-json{');
  const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
  expect(result.current[0]).toBe('fallback');
});
```

**Implementation:**
```ts
import { useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });

  const setValue = (value: T) => {
    setStored(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [stored, setValue];
}
```

**Key insight:** The initial state uses a lazy initialiser (`useState(() => ...)`)
so `localStorage.getItem` only runs once — not on every render. The tuple return
shape mirrors `useState` — callers name it however they want:
`const [theme, setTheme] = useLocalStorage('theme', 'light')`.

</details>

---

## Final Check

| Concept | Verify |
|---|---|
| Each call gets its own state | Two components use `useDebounce` — values are independent |
| Hooks can call hooks | `useAddTaskForm` calls `useCreateTask` which calls `useMutation` |
| Object return | Caller destructures only what it needs |
| Tuple return | Caller renames freely: `const [value, set] = useLocalStorage(...)` |
| `renderHook` for testing | Tests run without rendering a full component tree |

---

## Quick Check Answers

**1. Two components both have `useState(0)`. Do they share state?**

No. Each call to `useState` (including inside a custom hook) creates an independent
piece of state tied to that component instance. If `useCounter()` wraps `useState(0)`,
two components calling `useCounter()` each get their own counter — zero sharing.
To share state between components, use Zustand or React context.

**2. Custom hook calls `useState` and `useQuery`. Is this allowed?**

Yes. A custom hook can call any other hooks — built-in or custom. The rules of
hooks apply to the custom hook itself (same as any component): call hooks at the
top level, not inside conditions, loops, or callbacks. The custom hook follows
the same rules as a component's function body.

**3. `{ tasks, addTask, isLoading }` — when to destructure vs use as object?**

Destructure when you want only some fields: `const { tasks, isLoading } = useTasks()`.
Use as an object when you pass the whole result somewhere: `const result = useTasks();`
then `<TaskList queryResult={result} />`. Most of the time, destructure — it makes
the component's dependencies explicit.
