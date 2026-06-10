# Junior to Senior — T6·L7 — Error Boundaries and Suspense

**Prerequisites:** T6·L6 (react-hook-form and Zod). You can handle form
submission. This lesson covers two React features that deal with failure and
loading states at the component tree level.

**What this lab adds:**
- Error boundary: catches render errors in the child subtree
- What error boundaries catch vs what they do NOT catch
- `react-error-boundary` library — the modern approach
- `<Suspense fallback={<Spinner />}>` — showing a fallback while loading
- React Query + Suspense integration

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A component throws during render. What happens without an error boundary?
> 2. An error boundary wraps a component. That component throws in an `onClick`
>    handler. Is the error caught by the boundary?
> 3. `<Suspense fallback={<Loading />}>` — what makes a component "suspend"?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A resilient task list that handles render failures gracefully:

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<TaskListSkeleton />}>
    <TaskListFromAPI />   {/* may throw during render */}
  </Suspense>
</ErrorBoundary>
```

---

### Concept: Error Boundaries

**What it is:** A class component that implements `static getDerivedStateFromError`
or `componentDidCatch`. When a child throws during render, the boundary catches it
and renders a fallback UI instead of crashing the entire app.

**What they catch:**
- Errors during rendering
- Errors in lifecycle methods
- Errors in constructors of the tree below

**What they do NOT catch:**
- Event handler errors (use try/catch inside the handler)
- Asynchronous errors (setTimeout, fetch callbacks)
- Errors in the error boundary itself
- Server-side rendering errors

```tsx
// Manual error boundary (class component):
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

**`react-error-boundary`** provides a function component version with additional
features (reset, error info):

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div style={{ color: 'red', padding: 16 }}>
      <p>Something went wrong:</p>
      <pre style={{ fontSize: 12 }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <TaskList />
</ErrorBoundary>
```

**`resetKeys`:** Automatically resets the boundary when the specified props change:

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  resetKeys={[userId]}   // resets when userId changes
>
  <UserProfile />
</ErrorBoundary>
```

---

### Concept: Suspense

**What it is:** `<Suspense>` shows a fallback while children are "suspended" —
waiting for async data. A component suspends by throwing a Promise.

```tsx
// React reads the thrown Promise — when it resolves, the component renders:
function DataComponent() {
  const data = useSuspenseQuery(...)  // throws Promise internally if loading
  return <div>{data.title}</div>;     // only runs when data is available
}

// Suspense shows the fallback while DataComponent is suspended:
<Suspense fallback={<Spinner />}>
  <DataComponent />
</Suspense>
```

**React Query + Suspense (v5):**

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

function TaskList() {
  // useSuspenseQuery throws a Promise while loading — Suspense catches it:
  const { data: tasks } = useSuspenseQuery({
    queryKey: ['tasks'],
    queryFn:  fetchTasks,
  });
  // `data` is always defined here — no isLoading check needed
  return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}

// In the parent:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<p>Loading tasks...</p>}>
    <TaskList />
  </Suspense>
</ErrorBoundary>
```

---

## Step 1 — Add Error Boundary to the App

```bash
npm install react-error-boundary
```

Create `src/components/ErrorFallback.tsx`:

```tsx
interface ErrorFallbackProps {
  error:               Error;
  resetErrorBoundary:  () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      style={{
        padding:      16,
        background:   '#fff3f3',
        border:       '1px solid #f99',
        borderRadius: 8,
        color:        '#c00',
      }}
    >
      <h3>Something went wrong</h3>
      <p style={{ fontSize: 12, fontFamily: 'monospace' }}>{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        style={{ marginTop: 8, padding: '4px 12px' }}
      >
        Try again
      </button>
    </div>
  );
}
```

Create `src/components/TaskListSkeleton.tsx`:

```tsx
export function TaskListSkeleton() {
  return (
    <div aria-label="Loading tasks...">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            height:       40,
            background:   '#e0e0e0',
            borderRadius: 4,
            marginBottom: 8,
            animation:    'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
}
```

Update `src/App.tsx` to wrap with error boundary and suspense:

```tsx
import { ErrorBoundary }     from 'react-error-boundary';
import { Suspense }          from 'react';
import { ErrorFallback }     from './components/ErrorFallback';
import { TaskListSkeleton }  from './components/TaskListSkeleton';
import { TaskListFromAPI }   from './components/TaskListFromAPI';
import { TaskForm }          from './components/TaskForm';

export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Task Manager</h1>

      <TaskForm />

      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => console.error('Error boundary caught:', error)}
      >
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskListFromAPI />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

**Test the error boundary:** Temporarily add `throw new Error('test error')` to
the top of `TaskListFromAPI`. Expected: the error fallback renders with "Something
went wrong" and a "Try again" button. Remove the throw and the boundary resets
when you click "Try again."

---

## Step 2 — Write Tests

Create `src/components/ErrorFallback.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent          from '@testing-library/user-event';
import { ErrorBoundary }  from 'react-error-boundary';
import { ErrorFallback }  from './ErrorFallback';

// Suppress console.error for expected errors in tests:
const originalError = console.error;
beforeAll(()  => { console.error = vi.fn(); });
afterAll(()   => { console.error = originalError; });


function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error message');
  return <p>All good</p>;
}

describe('ErrorBoundary with ErrorFallback', () => {

  it('renders children when no error', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the fallback when a child throws', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders the Try again button', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('resets when Try again is clicked', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: /try again/i }));
    // After reset, it will try to render the child again — which still throws:
    // In a real app, resetErrorBoundary would be called after fixing the problem
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Error Boundary With `resetKeys`

**You know:** Error boundaries, `react-error-boundary`, `resetKeys`.

**Task:** Build a `UserProfile` component that throws when `userId` is `null`.
Wrap it with an `ErrorBoundary` that automatically resets when `userId` changes
(user logs in or selects a different user).

```tsx
<ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[userId]}>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

Write a test that verifies the boundary resets when `resetKeys` changes.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
function UserProfile({ userId }: { userId: string | null }) {
  if (!userId) throw new Error('No user selected');
  return <p>User: {userId}</p>;
}

// Test:
it('resets when resetKeys change', async () => {
  let userId: string | null = null;

  const { rerender } = render(
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[userId]}>
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );

  // Error boundary activates:
  expect(screen.getByRole('alert')).toBeInTheDocument();

  // Simulate user logging in:
  userId = 'u-123';
  rerender(
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[userId]}>
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );

  // resetKeys changed — boundary resets and renders the component:
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByText('User: u-123')).toBeInTheDocument();
});
```

**Key insight:** `resetKeys` compares the previous and current values using
`Object.is`. When any value in the array changes, the boundary is reset —
the internal `hasError` state is cleared — and the children are re-rendered.
This is the correct mechanism for "automatically recover when the problem is fixed."

</details>

---

## Final Check

| What error boundaries catch | What they don't catch |
|---|---|
| Render errors | Event handler errors (`try/catch` in handler) |
| Constructor errors | `setTimeout`/`setInterval` callbacks |
| Lifecycle method errors | Async errors in `useEffect` |
| Children errors | Errors in the boundary itself |

---

## Quick Check Answers

**1. Component throws during render without an error boundary. What happens?**

The entire React tree unmounts and the DOM is cleared. React renders nothing —
the user sees a blank page. In development mode, React shows an error overlay.
In production, the entire app disappears. Error boundaries prevent this by
catching the error at the boundary level and rendering a fallback instead.

**2. Component throws in an `onClick` handler. Is the error caught by the boundary?**

No. Error boundaries only catch errors during rendering, in lifecycle methods,
and in constructors. An error in an event handler is a JavaScript error that
happens outside of React's rendering cycle. The component does not unmount;
the error propagates normally to the top-level error handler or crashes the app.
Use `try/catch` inside event handlers for this case.

**3. What makes a component "suspend"?**

The component throws a Promise. React detects that the thrown value is a Promise
(technically, a "thenable"), pauses rendering, shows the nearest `<Suspense>`
fallback, and waits for the Promise to resolve. When it resolves, React retries
rendering the component. Libraries like React Query implement this internally —
`useSuspenseQuery` throws a Promise when data is loading so you never see
`isLoading: true` in the component itself.
