# Junior to Senior — T6·L5 — Custom Hooks

**Prerequisites:** T6·L4 (React Query Mutations). You can fetch and mutate server state.
This lesson teaches custom hooks — but more specifically, it teaches the *mechanism* of
`useEffect` cleanup, the *reason* the dependency array exists, and why the timer resets
on every keystroke. The hooks come out of understanding the mechanism, not before it.

**What this lab adds:**
- The cleanup function: what `return () => ...` inside `useEffect` actually does and WHEN it runs
- Why a rapidly changing value needs a timer that resets — the debounce mechanism explained step by step
- How custom hooks compose: a hook that calls other hooks, and what "each call gets its own state" really means
- `renderHook`: how to test a hook without rendering a component
- Return shape decisions: when `[value, setter]` vs `{ value, setter }` and why the choice matters

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `useEffect` returns a function. When exactly does that function run? Name
>    the two specific moments.
> 2. A user types "h", "he", "hel", "hell", "hello" — five keystrokes in 400ms.
>    How many search API calls should the debounced search make?
> 3. Two components call `useDebounce(value, 300)`. Do they share the same timer?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

A search input calls the API on every keystroke. The user types "hello" in half a second.
The API receives five requests — h, he, hel, hell, hello — and returns results for each.
Four of those responses are useless and may arrive out of order.

The fix: wait until the user pauses typing, THEN call the API. If the user types again
before the pause, restart the wait.

This is called debouncing. You will build it from scratch by understanding exactly what
`setTimeout`, `clearTimeout`, and `useEffect` cleanup do together.

---

## Step 1 — The Naive Version (Broken)

See the problem before building the solution.

Create `src/hooks/useDebounce.ts` with the version that does NOT debounce:

```ts
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Schedule an update:
    setTimeout(() => setDebounced(value), delay);
    // ← PROBLEM: no cleanup. Every render schedules a NEW timer.
    // Type "hello" → 5 timers all fire → 5 state updates
  }, [value, delay]);

  return debounced;
}
```

### SAVE AND TRY

Run the test we'll write together. First, create `src/hooks/useDebounce.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { vi, it, expect, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';

beforeEach(() => vi.useFakeTimers());    // fake timers: setTimeout doesn't actually wait
afterEach(()  => vi.useRealTimers());   // restore real timers after each test

it('does NOT update immediately — waits for the delay', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'initial' } }
  );

  rerender({ value: 'updated' });
  // 200ms has passed — delay is 300ms — should NOT have updated yet:
  act(() => vi.advanceTimersByTime(200));
  expect(result.current).toBe('initial');   // still 'initial'
});
```

```bash
npx vitest run
```

**You should see:** Test PASSES — the naive version accidentally passes this test because
200ms hasn't elapsed. But now test the reset behaviour:

```ts
it('resets the timer when value changes — only the LAST value should win', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'a' } }
  );

  // Simulate rapid typing: a → b → c, each 100ms apart:
  rerender({ value: 'b' });
  act(() => vi.advanceTimersByTime(100));

  rerender({ value: 'c' });
  act(() => vi.advanceTimersByTime(100));

  // 200ms after 'c', 300ms after 'b' — 'b' timer should have fired but 'c' should not:
  expect(result.current).toBe('a');   // we want 'a' — only final value after 300ms silence

  act(() => vi.advanceTimersByTime(200));   // 300ms after 'c'
  expect(result.current).toBe('c');   // now 'c' wins — only one API call
});
```

**You should see:** This test FAILS — the naive version updates to `'b'` before `'c'`.
Both timers fired. The debounce is broken.

---

### Concept: `useEffect` Cleanup — The Cancel Button

**What it is:** When `useEffect` returns a function, React calls that function in
two specific situations:
1. **Before running the effect again** (when the dependencies change)
2. **When the component unmounts** (when it is removed from the screen)

The returned function is called the "cleanup function."

**The mechanism — step by step:**

```
Render 1: value = 'h'
  → useEffect runs
  → Schedules setTimeout ID=1 (fires in 300ms)
  → Returns cleanup: () => clearTimeout(1)

Render 2: value = 'he' (100ms later, timer has NOT fired yet)
  → React sees value changed
  → React calls the PREVIOUS cleanup: clearTimeout(1)   ← CANCELS the 'h' timer
  → useEffect runs again
  → Schedules setTimeout ID=2 (fires in 300ms)
  → Returns cleanup: () => clearTimeout(2)

Render 3: value = 'hel' (100ms later)
  → React calls PREVIOUS cleanup: clearTimeout(2)       ← CANCELS the 'he' timer
  → Schedules setTimeout ID=3 (fires in 300ms)
  → Returns cleanup: () => clearTimeout(3)

...user stops typing for 300ms...
  → Timer ID=5 fires (the only one not cancelled)
  → setDebounced('hello')
  → ONE state update, ONE API call
```

**The invariant the cleanup function protects:** Only the MOST RECENTLY scheduled timer
can fire. Every previous timer is cancelled before a new one is created. The final value wins.

**Canonical example:** A bus departure board. Every time a new bus is scheduled (render),
the previous "departing soon" sign (timer) is cancelled. Only the latest "departing soon"
sign is shown. You don't see a sign for every bus that was ever scheduled.

**Smallest possible example — cleanup without debounce:**

```tsx
useEffect(() => {
  const subscription = someExternalSource.subscribe(setData);
  // Return a cleanup: run when effect re-runs or component unmounts
  return () => subscription.unsubscribe();
}, []);
// Without cleanup: the subscription leaks. Unsubscribe never called.
```

**You will see this again in:**
- Every `addEventListener` in `useEffect` needs a cleanup with `removeEventListener`
- Every `setInterval` needs a cleanup with `clearInterval`
- React Query: `cancelQueries` in optimistic updates is the same cancel pattern
- WebSocket in `useEffect`: cleanup calls `socket.close()`

**Watch for:** Forgetting the cleanup is the most common `useEffect` bug. The symptom:
memory leaks, stale callbacks, "Can't perform a React state update on an unmounted component"
warnings in the console.

---

## Step 2 — Fix the Debounce With Cleanup

Update `src/hooks/useDebounce.ts`:

```ts
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Schedule a timer to update the debounced value after `delay` ms:
    const timer = setTimeout(() => setDebounced(value), delay);

    // The cleanup function: CANCEL the timer if value changes before it fires.
    // React calls this automatically before running the effect again.
    return () => clearTimeout(timer);

  }, [value, delay]);
  // The dependency array [value, delay] means: re-run this effect whenever
  // value OR delay changes. Re-running triggers the cleanup of the previous run first.

  return debounced;
}
```

### SAVE AND TRY

```bash
npx vitest run
```

**You should see:** Both tests now pass, including the reset test that failed before.

**In the terminal, verify what the cleanup does — add a log temporarily:**

```ts
// Temporary — add to useEffect to see when cleanup runs:
const timer = setTimeout(() => setDebounced(value), delay);
console.log('Timer started for:', value);
return () => {
  console.log('Timer CANCELLED for:', value);   // ← see this!
  clearTimeout(timer);
};
```

Open the app and type "hello" quickly. In the console you will see:
```
Timer started for: h
Timer CANCELLED for: h    ← cleanup ran when 'he' caused a re-render
Timer started for: he
Timer CANCELLED for: he   ← cleanup ran when 'hel' caused a re-render
Timer started for: hel
...
Timer started for: hello  ← last one — no cancellation
```

Remove the logs before continuing.

---

### Concept: `renderHook` — Testing a Hook Without a Component

**What it is:** `renderHook(hookFn)` from `@testing-library/react` renders a minimal
React component that exists only to call the hook and expose its result. No JSX, no DOM
elements — just the hook's state and return values.

**The problem before:**

```tsx
// Without renderHook — you'd need a real component:
function TestComponent({ value }: { value: string }) {
  const debounced = useDebounce(value, 300);
  return <div data-testid="output">{debounced}</div>;
}

it('updates after delay', () => {
  render(<TestComponent value="hello" />);
  expect(screen.getByTestId('output')).toHaveTextContent('');  // fragile
});
```

**The solution:**

```ts
const { result, rerender } = renderHook(
  ({ value }) => useDebounce(value, 300),   // the hook call
  { initialProps: { value: 'initial' } }    // initial arguments
);

result.current   // the hook's current return value
rerender({ value: 'updated' })  // change the arguments → causes a re-render of the hook
```

**What it hides:** The wrapper component. `renderHook` creates a minimal component internally,
renders it in the test environment, and gives you direct access to the hook's return value.

**The `act()` wrapper — why it is required:**

React batches state updates. When a test advances fake timers and a timer fires, React
schedules a state update. Without `act()`, the state update hasn't been applied yet when
your `expect` runs:

```ts
// Without act — test sees stale state:
vi.advanceTimersByTime(300);
expect(result.current).toBe('updated');   // FAILS — React hasn't re-rendered yet

// With act — state update is flushed before expect:
act(() => vi.advanceTimersByTime(300));
expect(result.current).toBe('updated');   // PASSES — React has re-rendered
```

**You will see this again in:**
- Any hook with `useEffect` or `useState` needs `act()` around triggers
- `userEvent.type(input, 'hello')` from Testing Library wraps in `act` automatically
- The React Testing Library `waitFor` helper is `act` in a loop

**Watch for:** `act()` warnings in test output mean a state update happened outside of
`act`. Wrap the trigger in `act(() => { /* state-changing code */ })`.

---

## Step 3 — Write All Four `useDebounce` Tests

Replace the tests in `src/hooks/useDebounce.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {

  beforeEach(() => vi.useFakeTimers());
  afterEach(()  => vi.useRealTimers());

  it('returns the initial value immediately — no delay on first render', () => {
    // The hook should return the initial value immediately, not wait for the delay:
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // 200ms elapsed — still 100ms short of the 300ms delay:
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('initial');   // timer has not fired yet
  });

  it('updates after the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Exactly 300ms — the timer fires and state updates:
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('updated');
  });

  it('cancels the previous timer when value changes — only the last value wins', () => {
    // This is the core debounce test. Simulate rapid typing: a → b → c
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(100));   // 100ms after 'b' — 'a' timer was cancelled

    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(100));   // 100ms after 'c' — 'b' timer was cancelled

    // 200ms total since 'c', 300ms since 'b':
    // The 'b' timer would have fired at 300ms, but it was cancelled when 'c' arrived.
    // The 'c' timer needs 300ms from when 'c' was set — only 200ms have passed:
    expect(result.current).toBe('a');   // unchanged — no timer has fired

    act(() => vi.advanceTimersByTime(100));   // now 300ms after 'c'
    expect(result.current).toBe('c');   // 'c' wins — only one update total
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/hooks/useDebounce.test.ts
```

**You should see:**
```
✓ useDebounce > returns the initial value immediately
✓ useDebounce > does not update before the delay expires
✓ useDebounce > updates after the delay expires
✓ useDebounce > cancels the previous timer — only the last value wins

Tests  4 passed (4)
```

**Change something:** Remove the cleanup from `useDebounce` (`return () => clearTimeout(timer)`).
Rerun the tests.

**Expected:** The last test FAILS — `result.current` is `'b'` instead of `'a'` because
the `'b'` timer fired at 300ms after `'b'` was set, even though `'c'` came in after.
The cleanup is what makes debouncing work. Put it back.

---

### Concept: Custom Hooks Share Logic, Not State

**What it is:** Each call to a custom hook creates its own isolated set of state variables.
Two components calling `useDebounce` get two completely independent timers and two independent
debounced values. Nothing is shared.

**The problem this causes if you forget:**

```tsx
// Both components use useDebounce. Do they share one timer?
function SearchBar() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);   // component A's timer
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

function AutoSave() {
  const [content, setContent] = useState('');
  const debounced = useDebounce(content, 1000);  // component B's timer — INDEPENDENT
  return <textarea value={content} onChange={e => setContent(e.target.value)} />;
}
```

Typing in `SearchBar` does not affect `AutoSave`'s timer, and vice versa.
Each `useDebounce` call owns its own `useState` and its own `useEffect`.

**The mental model:** A custom hook is a function that creates state. Calling it is like
calling `useState` — every call site gets a fresh, independent instance. If you want
shared state, use a store (Zustand) or context — not a custom hook.

**Why this matters here:** `useDebounce` is safe to use in any number of components
simultaneously. There is no global timer state to worry about.

---

## Step 4 — Build `useAddTaskForm` With Explanation

The form hook composes multiple hooks together. Create `src/hooks/useAddTaskForm.ts`:

```ts
// src/hooks/useAddTaskForm.ts
import { useState }        from 'react';
import { useCreateTask }   from './useTaskMutations';  // React Query mutation hook

// The shape of what this hook returns — named fields because there are many:
interface UseAddTaskFormResult {
  title:        string;
  priority:     'low' | 'medium' | 'high';
  setTitle:     (t: string) => void;
  setPriority:  (p: 'low' | 'medium' | 'high') => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm:    () => void;
  isPending:    boolean;    // true while the API request is in flight
  isError:      boolean;    // true if the last request failed
}

export function useAddTaskForm(): UseAddTaskFormResult {
  // Local form state — belongs to this hook, not shared:
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // useCreateTask is itself a custom hook (wraps useMutation from React Query):
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();       // ← stop the browser from reloading the page (default form behaviour)
    if (!title.trim()) return; // ← guard: don't submit empty titles

    createTask.mutate(
      { title: title.trim(), priority },
      {
        // onSuccess is called when the server returns a successful response.
        // We pass it here (not in useMutation) so this specific form instance
        // resets itself — other uses of useCreateTask don't reset this form:
        onSuccess: () => resetForm(),
      }
    );
  };

  const resetForm = () => {
    setTitle('');            // ← reset title input to empty
    setPriority('medium');   // ← reset priority to default
  };

  return {
    title,
    priority,
    setTitle,
    setPriority,
    handleSubmit,
    resetForm,
    // Expose React Query's mutation state so the form can show spinners/errors:
    isPending: createTask.isPending,
    isError:   createTask.isError,
  };
}
```

### SAVE AND TRY

With the app running, add this component to verify the hook works:

```tsx
// Add temporarily to App.tsx to test:
import { useAddTaskForm } from './hooks/useAddTaskForm';

function TestForm() {
  const { title, setTitle, handleSubmit, isPending } = useAddTaskForm();
  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button disabled={isPending} type="submit">
        {isPending ? 'Saving...' : 'Add'}
      </button>
    </form>
  );
}
```

```bash
npm run dev
```

Expected: the form appears. Type a task title and submit. The button shows "Saving..."
while the request is in flight. After success, both the title and priority reset.

---

### Concept: Return Shape — Object vs Tuple

**What it is:** Custom hooks can return any type. The two conventions are:

**Object `{ key: value }` — for hooks with multiple named pieces:**
```ts
const { title, isPending, handleSubmit } = useAddTaskForm();
// Clear names. Caller takes only what they need. Order doesn't matter.
```

**Tuple `[value, setter]` — for hooks that mirror `useState`:**
```ts
const [theme, setTheme] = useLocalStorage('theme', 'light');
// Mirrors useState. Caller names freely. Order matters (index 0 = value, 1 = setter).
```

**The rule:** If your hook returns exactly two things — a value and a function that
changes it — use a tuple. It lets callers rename easily, matching the `useState` convention
they already know. For everything else, use an object.

**Why naming matters with tuples:**
```ts
// With a tuple — caller names them contextually:
const [sortBy, setSortBy] = useLocalStorage('sort', 'date');
const [filter, setFilter] = useLocalStorage('filter', 'all');
// 'sortBy' and 'filter' are caller-chosen names — clear in context

// With an object — hook provides the names:
const { value: sortBy, setValue: setSortBy } = useLocalStorage('sort', 'date');
// Verbose — requires renaming every time
```

---

## Step 5 — Test `useAddTaskForm` With MSW

```ts
// src/hooks/useAddTaskForm.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server }          from '../mocks/server';
import { useAddTaskForm }  from './useAddTaskForm';

beforeAll(()  => server.listen());
afterEach(()  => server.resetHandlers());
afterAll(()   => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

it('title starts empty and can be updated', () => {
  const { result } = renderHook(() => useAddTaskForm(), { wrapper });

  expect(result.current.title).toBe('');

  act(() => result.current.setTitle('Write tests'));
  expect(result.current.title).toBe('Write tests');
});

it('handleSubmit does nothing when title is empty', () => {
  const { result } = renderHook(() => useAddTaskForm(), { wrapper });

  act(() => {
    result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  });

  // isPending would be true if a request was made — it should not be:
  expect(result.current.isPending).toBe(false);
});

it('resets the form after successful submission', async () => {
  const { result } = renderHook(() => useAddTaskForm(), { wrapper });

  act(() => result.current.setTitle('Write tests'));
  act(() => {
    result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  });

  // Wait for the mutation to complete (MSW responds to POST /tasks/):
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(result.current.title).toBe('');   // ← resetForm() was called on success
});
```

### SAVE AND TRY

```bash
npx vitest run src/hooks/useAddTaskForm.test.tsx
```

Expected: all 3 tests pass.

---

## 🎯 Challenge: Build `useLocalStorage`

**You know:** `useState` with a lazy initialiser, `useEffect` cleanup, custom hook
return shapes, how `localStorage` works.

**The mechanism to understand before coding:**

`useState` accepts either a value OR a function. When you pass a function:
```ts
const [state, setState] = useState(() => expensiveComputation());
//                                  ↑ lazy initialiser: only runs ONCE on first render
```

Without the lazy initialiser, `expensiveComputation()` runs on every render.
With it, the function is called only once.

For `useLocalStorage`, `localStorage.getItem(key)` is the expensive call — reading from
disk on every render would be wasteful. The lazy initialiser reads once.

**Task:** Build `useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void]`

Requirements:
- Reads from localStorage on first render using a lazy initialiser
- Writes to localStorage whenever the value changes
- Falls back to `initial` if the key doesn't exist or contains invalid JSON
- Returns a `[value, setter]` tuple — mirrors `useState`

Write these 4 tests before implementing:

```ts
beforeEach(() => localStorage.clear());

it('returns the initial value when nothing is stored', ...)
it('reads a previously stored value on first render', ...)
it('writes new value to localStorage when setter is called', ...)
it('falls back to initial when stored JSON is invalid', ...)
```

---

<details>
<summary>▶ Show Solution</summary>

```ts
// src/hooks/useLocalStorage.ts
import { useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    // Lazy initialiser: this function runs ONCE on first render.
    // This is important — we don't want to read from localStorage on every render.
    try {
      const item = localStorage.getItem(key);
      // null means the key was never set — use the initial value:
      return item !== null ? (JSON.parse(item) as T) : initial;
    } catch {
      // JSON.parse threw (invalid JSON) — fall back to initial:
      return initial;
    }
  });

  const setValue = (value: T) => {
    setStored(value);                                    // update React state → triggers re-render
    localStorage.setItem(key, JSON.stringify(value));   // persist to disk
    // Note: we do NOT use useEffect here because we always want to write to
    // localStorage exactly when the setter is called — not on some future render.
  };

  return [stored, setValue];
}
```

**Tests:**
```ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

beforeEach(() => localStorage.clear());

it('returns the initial value when nothing is stored', () => {
  const { result } = renderHook(() => useLocalStorage('key', 'default'));
  expect(result.current[0]).toBe('default');
});

it('reads a previously stored value on first render', () => {
  localStorage.setItem('key', JSON.stringify('stored'));
  const { result } = renderHook(() => useLocalStorage('key', 'default'));
  expect(result.current[0]).toBe('stored');   // lazy initialiser read it
});

it('writes new value to localStorage when setter is called', () => {
  const { result } = renderHook(() => useLocalStorage('key', 0));
  act(() => result.current[1](42));
  expect(localStorage.getItem('key')).toBe('42');
  expect(result.current[0]).toBe(42);   // state also updated
});

it('falls back to initial when stored JSON is invalid', () => {
  localStorage.setItem('key', 'not-valid-json{');
  const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
  expect(result.current[0]).toBe('fallback');   // JSON.parse threw; initial returned
});
```

**Key insight:** The lazy initialiser `useState(() => ...)` is what makes `useLocalStorage`
correct. Without it, `localStorage.getItem(key)` runs on every render — even renders
where the value hasn't changed. The lazy form reads disk once per component mount.

</details>

---

## Final Check

| What to verify | How to verify | Expected |
|---|---|---|
| Cleanup cancels the timer | Remove `clearTimeout`, run reset test | Test fails — 'b' updates before 'c' |
| `act()` wraps timer advances | Remove `act()`, run delay test | Warning: state update outside act |
| Two components = two timers | Log timer IDs in both | Different IDs, different delays |
| Lazy initialiser reads once | Add `console.log` inside `useState(() => ...)` | Logs once, not on every render |
| Tuple return = rename at call site | `const [x, setX] = useLocalStorage(...)` | `x` is the custom name |

---

## Quick Check Answers

**1. `useEffect` returns a function. When exactly does that function run?**

Two specific moments: (1) immediately before the effect runs again — when any dependency
in the array changes and causes a re-run, React calls the previous cleanup before running
the new effect; (2) when the component unmounts — React calls the cleanup one final time
as the component is removed from the screen. This is why `clearTimeout`, `removeEventListener`,
and `subscription.unsubscribe()` belong in cleanup functions — they prevent leaks when
re-renders happen or when the user navigates away.

**2. User types "hello" in 400ms with 300ms debounce. How many API calls?**

One. The timer for "h" is cancelled when "he" arrives. The timer for "he" is cancelled
when "hel" arrives. And so on. Only the timer for "hello" is not cancelled — the user
stopped typing before 300ms elapsed after the last keystroke. Result: one API call for
the final complete word.

**3. Two components call `useDebounce`. Do they share the same timer?**

No. Each call to `useDebounce` creates its own `useState` (its own debounced value) and
its own `useEffect` (its own timer). They are completely independent. Custom hooks share
LOGIC (the code), not STATE (the runtime values). To share state, you need Zustand, context,
or a module-level variable — not a custom hook.
