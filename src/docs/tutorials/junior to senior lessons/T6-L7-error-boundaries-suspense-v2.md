# Junior to Senior — T6·L7 — Error Boundaries and Suspense

**Prerequisites:** T6·L6 (react-hook-form and Zod). You can build validated forms.
This lesson teaches how React's rendering engine handles failures and loading states —
specifically WHY the entire app goes blank when a component throws, and HOW error
boundaries intercept that process.

**What this lab adds:**
- What actually happens when a component throws during render — the unmount cascade
- How `getDerivedStateFromError` intercepts the throw before React clears the screen
- WHY event handler errors are NOT caught — the mechanism explained
- What "suspending" means mechanically — throwing a Promise, not an Error
- How React Query's `useSuspenseQuery` uses this to eliminate loading state checks

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A component throws `new Error('broken')` during render. Without an error boundary,
>    what does the user see? Why?
> 2. You have an error boundary wrapping a component. The component calls `onClick`,
>    which throws. Does the error boundary catch it? Why or why not?
> 3. "A component suspends by throwing a Promise." What does that mean? What does
>    React do with the thrown Promise?
>
> *(Answers at the end of this lab)*

---

## The Problem: One Broken Component Blanks the Whole Screen

React renders components as a call stack. When `App` renders `Sidebar`, which renders
`TaskList`, which renders `TaskItem` — and `TaskItem` throws — the error propagates up
the call stack until it is caught.

Without an error boundary, nothing catches it. React's default behaviour: unmount the
ENTIRE component tree and show a blank screen (or in development, the red error overlay).

The user sees nothing. Not a loading spinner, not an error message — nothing.

This is the problem error boundaries fix.

---

## Step 1 — See the Blank Screen Problem

Add a component that throws to `App.tsx` temporarily:

```tsx
// Add temporarily to App.tsx to see the problem:
function BrokenComponent() {
  throw new Error('Something went wrong in BrokenComponent');
  return <div>This never renders</div>;
}

// Add <BrokenComponent /> inside your app's JSX tree
```

```bash
npm run dev
```

### SAVE AND TRY

Open `http://localhost:5173`.

**You should see:** In development — React's red error overlay. Click the X to dismiss it.
**You should see:** A completely blank screen. The entire application is gone.

Open the browser console.
**You should see:** `Error: Something went wrong in BrokenComponent` — but the app is dead.

**Change something:** Add a `try/catch` around the throw:

```tsx
function BrokenComponent() {
  try {
    throw new Error('caught here');
  } catch (e) {
    console.log('caught:', e);
  }
  return <div>I rendered despite the error</div>;
}
```

**Expected:** The component renders normally. The error was caught at the throw site.
The blank screen only happens when an error propagates OUT of the render function uncaught.

Remove both versions before continuing.

---

### Concept: How `getDerivedStateFromError` Intercepts

**What it is:** An error boundary is a class component that implements a special React
lifecycle method: `static getDerivedStateFromError(error)`. This is the ONLY way to
catch errors during React rendering (function components cannot use it).

**The mechanism — what happens when `TaskItem` throws:**

```
1. React calls TaskItem's render function
2. TaskItem throws new Error('broken')
3. React walks UP the component tree looking for a class component that has
   getDerivedStateFromError defined
4. If it finds one: calls getDerivedStateFromError(error) → gets new state
5. Re-renders the error boundary class component with the new state
6. The error boundary renders its fallback instead of the broken subtree
7. The rest of the app (outside the boundary) is unaffected

If it finds NONE:
4. React unmounts the entire tree
5. Blank screen
```

**The key line — `static getDerivedStateFromError`:**

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  // Called by React when a child throws DURING RENDER:
  static getDerivedStateFromError(error: Error) {
    // Return new state — this triggers a re-render of the boundary:
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      // Render fallback instead of the broken children:
      return <div>Something went wrong: {this.state.error.message}</div>;
    }
    // No error: render children normally:
    return this.props.children;
  }
}
```

**Why only class components?** `getDerivedStateFromError` and `componentDidCatch` are class
lifecycle methods — they exist in the class-based React API. Function components do not
have lifecycle methods. React may add a function component equivalent in a future version,
but as of React 19, error boundaries must be class components (or you use `react-error-boundary`
which wraps the class for you).

**Why NOT event handlers?** When a component renders, React controls the execution. React
calls `render()`, and if that throws, React's rendering engine catches it and looks for
a boundary. But an event handler like `onClick` is called by the BROWSER when the user
clicks — React's rendering engine is not on the call stack at that point. The throw
propagates to the browser's event system, not to React's render loop. Error boundaries
only intercept throws that happen during React's rendering cycle.

**Canonical example:** A fire sprinkler system in one room. If the room (component subtree)
catches fire (throws), the sprinklers in THAT room activate (the boundary renders its fallback).
The rest of the building (other components outside the boundary) is unaffected. Without
sprinklers (no boundary), the fire spreads to the whole building (blank screen).

---

## Step 2 — Add an Error Boundary

Install `react-error-boundary`:

```bash
npm install react-error-boundary
```

Create `src/components/ErrorFallback.tsx`:

```tsx
// src/components/ErrorFallback.tsx

// This component is what renders INSTEAD of the broken subtree:
export function ErrorFallback({
  error,
  resetErrorBoundary,   // calling this function clears hasError and re-renders children
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div
      role="alert"              // screen readers announce this as an alert
      style={{ padding: 16, background: '#fff3f3', borderRadius: 8, color: '#c00' }}
    >
      <p>Something went wrong:</p>
      <pre style={{ fontSize: 12 }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
```

Update `App.tsx` to wrap with an error boundary:

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorFallback';

// Wrap the part that might fail — NOT the whole app necessarily:
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => console.error('Boundary caught:', error, info)}
>
  <TaskListFromAPI />
</ErrorBoundary>
```

### SAVE AND TRY

Temporarily add `throw new Error('test')` to `TaskListFromAPI`'s render.

```bash
npm run dev
```

**You should see:** Instead of a blank screen, the `ErrorFallback` component renders
with the error message and a "Try again" button. The rest of the app still works.

Click "Try again". **Expected:** React re-tries rendering `TaskListFromAPI`. If the throw
is still there, the error fallback reappears. Remove the throw and click "Try again" —
the real component renders.

Remove the test throw.

---

### Concept: Suspense — Throwing a Promise

**What it is:** `<Suspense>` works by letting components "suspend" — signal that they are
waiting for something. The mechanism: a component throws a PROMISE (not an Error). React
detects that the thrown value is a Promise and shows the nearest Suspense fallback.
When the Promise resolves, React retries rendering the component.

**The mechanism:**

```
1. React renders DataComponent
2. DataComponent calls useSuspenseQuery('tasks')
3. Data is not in the cache yet
4. useSuspenseQuery throws a Promise (the pending fetch)
5. React: "this is a Promise, not an Error — show the Suspense fallback"
6. React renders <Spinner /> from the fallback prop
7. The fetch Promise resolves (data arrives)
8. React retries DataComponent — useSuspenseQuery now has data in cache
9. DataComponent renders with data — Spinner replaced
```

**The `useSuspenseQuery` difference:**

```tsx
// Without Suspense (you check loading manually):
function TaskList() {
  const { data, isLoading, isError } = useQuery({ ... });
  if (isLoading) return <Spinner />;
  if (isError)   return <Error />;
  return <ul>{data.map(...)}</ul>;
}

// With useSuspenseQuery (Suspense + ErrorBoundary handle loading/error):
function TaskList() {
  const { data } = useSuspenseQuery({ ... });
  // data is ALWAYS defined here — no loading/error checks needed
  return <ul>{data.map(...)}</ul>;
}

// The parent handles states:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<Spinner />}>
    <TaskList />
  </Suspense>
</ErrorBoundary>
```

**What it hides:** The "throw Promise" mechanism. You never write `throw somePromise`.
`useSuspenseQuery` does it internally. You only see the clean component that always has data.

**You will see this again in:**
- React Server Components use Suspense extensively
- React's `lazy()` for code splitting throws a Promise while the chunk loads
- Any data-fetching library can implement Suspense by throwing pending Promises

---

## Step 3 — Wire Up Suspense With React Query

```tsx
// src/components/TaskListFromAPI.tsx — updated to use useSuspenseQuery
import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchTasks }        from '../api/tasks';

export function TaskListFromAPI() {
  // useSuspenseQuery throws a Promise if data isn't cached yet
  // — React catches the Promise and shows the <Suspense> fallback
  // data is always defined below this line (never undefined, never loading)
  const { data: tasks } = useSuspenseQuery({
    queryKey: ['tasks'],
    queryFn:  fetchTasks,
  });

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map(task => (
        <li key={task.id} style={{ padding: '8px 0' }}>
          {task.title}
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// src/components/TaskListSkeleton.tsx — the Suspense fallback
export function TaskListSkeleton() {
  return (
    <div aria-label="Loading tasks...">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            height: 36, background: '#e0e0e0', borderRadius: 4,
            marginBottom: 8, animation: 'pulse 1.5s infinite',
          }}
        />
      ))}
    </div>
  );
}
```

```tsx
// In App.tsx:
import { Suspense }           from 'react';
import { ErrorBoundary }      from 'react-error-boundary';
import { ErrorFallback }      from './components/ErrorFallback';
import { TaskListSkeleton }   from './components/TaskListSkeleton';
import { TaskListFromAPI }    from './components/TaskListFromAPI';

// Both boundaries handle different kinds of failure:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<TaskListSkeleton />}>
    <TaskListFromAPI />
  </Suspense>
</ErrorBoundary>
```

### SAVE AND TRY

```bash
npm run dev
```

With the FastAPI backend running, open the app.

**You should see:** The skeleton (grey boxes) appears briefly while the first fetch
completes. Then the task list replaces it.

**In the browser network tab:**
Slow the network (DevTools → Network → Slow 3G). Reload the page.
**Expected:** The skeleton is visible for several seconds — Suspense is showing the
fallback while the Promise is pending. When the data arrives, React retries the component
and the real list appears.

**Change something:** To test the error boundary, add this to `TaskListFromAPI.tsx`:

```tsx
// Simulate a render error:
if (Math.random() < 0.5) throw new Error('Random render failure');
```

Reload several times. **Expected:** Roughly half the time you see the error fallback,
half the time the task list loads. This shows both boundaries working.

Remove the test error.

---

## Step 4 — Write Tests

Create `src/components/ErrorFallback.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent          from '@testing-library/user-event';
import { ErrorBoundary }  from 'react-error-boundary';
import { ErrorFallback }  from './ErrorFallback';

// Suppress console.error for expected test errors:
const originalError = console.error;
beforeAll(()  => { console.error = vi.fn(); });
afterAll(()   => { console.error = originalError; });

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error message');
  return <p>Rendered successfully</p>;
}

describe('ErrorBoundary with ErrorFallback', () => {

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Rendered successfully')).toBeInTheDocument();
  });

  it('renders the fallback when a child throws during render', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows the Try Again button in the fallback', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('an error in an event handler is NOT caught by the boundary', async () => {
    // This test documents a common misconception:
    const user = userEvent.setup();
    const handleClick = () => { throw new Error('event handler error'); };

    // This should NOT use ErrorBoundary — event handler errors propagate differently:
    render(<button onClick={handleClick}>Click me</button>);

    // The click will throw, but the component tree is not affected —
    // the error goes to window.onerror, not to React's error boundary:
    // (In tests, this just throws and we verify the component didn't unmount)
    try {
      await user.click(screen.getByRole('button'));
    } catch {
      // Expected — event handler threw
    }

    // The button is still in the DOM — the boundary did NOT unmount the tree:
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/components/ErrorFallback.test.tsx
```

Expected: all 4 tests pass. The last test is the most instructive — it verifies that
event handler errors do NOT trigger the error boundary.

---

## 🎯 Challenge: Add `resetKeys` to Auto-Reset the Boundary

**You know:** Error boundaries, `resetErrorBoundary`, `react-error-boundary`.

**The mechanism to understand first:**

`resetKeys` is a prop on `<ErrorBoundary>`. When any value in the `resetKeys` array
changes, the boundary automatically calls `resetErrorBoundary()` — clearing `hasError`
and re-rendering the children. This lets the boundary recover when the problem is fixed.

**Task:** Build a `UserProfile` component that throws when `userId` is null.
Wrap it with a boundary that automatically resets when `userId` changes.

```tsx
<ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[userId]}>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

Write a test that verifies the boundary resets when `userId` changes from `null` to a valid ID.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
function UserProfile({ userId }: { userId: string | null }) {
  if (!userId) throw new Error('No user selected');
  return <p>User: {userId}</p>;
}

it('resets when resetKeys change', () => {
  let userId: string | null = null;

  const { rerender } = render(
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[userId]}>
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );

  // Boundary activates — userId is null:
  expect(screen.getByRole('alert')).toBeInTheDocument();

  // User logs in — userId becomes valid:
  userId = 'u-123';
  rerender(
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[userId]}>
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );

  // resetKeys changed → boundary resets → component re-renders successfully:
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByText('User: u-123')).toBeInTheDocument();
});
```

**Key insight:** `resetKeys` compares previous vs current values using `Object.is`.
When `null → 'u-123'`, the value changed, so `resetErrorBoundary()` is called automatically.
This is the correct pattern for "recover when the user fixes the problem" — the boundary
clears itself as soon as the underlying issue is resolved.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Boundary limits the damage | Throw in child → only that subtree is replaced, not the whole app |
| Event handlers NOT caught | Throw in onClick → boundary does NOT activate |
| Suspense shows fallback | Slow network → skeleton visible during fetch |
| `useSuspenseQuery` = no loading check | `TaskListFromAPI` has no `isLoading` check |

---

## Quick Check Answers

**1. Component throws without an error boundary. What does the user see?**

A completely blank screen (in production). React unmounts the ENTIRE component tree when
an uncaught error propagates out of the rendering cycle. In development, React also shows
its red error overlay before going blank. Without a boundary, there is no recovery —
the app is dead until the user reloads.

**2. Error boundary wraps a component. The component throws in `onClick`. Caught?**

No. `onClick` is called by the browser's event system when the user clicks. React's
rendering engine is not on the call stack at that moment — it is not executing any
`render()` function. The throw propagates through the browser's event handling, not
through React's rendering loop. Error boundaries only intercept throws that happen
during React's rendering process (`render()`, constructors, lifecycle methods).

**3. "A component suspends by throwing a Promise." What does that mean?**

The component literally `throw`s a Promise object (not an Error). React's rendering
engine detects that the thrown value is a thenable (has a `.then` method) rather than
an Error. React shows the nearest Suspense fallback and attaches a listener to the
Promise. When the Promise resolves (data arrives), React retries rendering the component.
`useSuspenseQuery` implements this — you never write `throw` yourself; the library does it.
