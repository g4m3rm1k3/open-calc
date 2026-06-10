# Junior to Senior — T6·L8 — Frontend Testing With React Testing Library

**Prerequisites:** T6·L7 (Error Boundaries and Suspense). You understand the component
tree. This lesson teaches frontend testing — but specifically WHY `getByRole` is safer than
`getByTestId`, HOW `userEvent` differs from `fireEvent`, and WHAT `waitFor` is actually
polling for when it retries.

**What this lab adds:**
- Why class names and test IDs are implementation details — what breaks when you rename them
- How `getByRole` queries the accessibility tree — what that tree is and why it matters
- The difference between `userEvent` and `fireEvent` — which events each fires and why it matters
- What `findBy` is doing internally — it is a `waitFor` loop, not a Promise.resolve
- How MSW intercepts fetch — at the Service Worker level, not by mocking the function

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `getByClassName('task-title')` — you rename the CSS class to `task-heading`.
>    The component still works for users. Does your test still pass?
> 2. `userEvent.type(input, 'hello')` fires 5 keydown events, 5 keypress events,
>    5 input events, and 5 keyup events. `fireEvent.change(input, { target: { value: 'hello' } })`
>    fires 1 event. Why does the difference matter for testing form validation?
> 3. `await findByText('Task created')` — how many times does React Testing Library
>    check the DOM? How often? What is the timeout?
>
> *(Answers at the end of this lab)*

---

## The Core Problem: What Are You Actually Testing?

A test can test three different things:

1. **Implementation** — which CSS class is applied, which internal function was called,
   what state variable holds what value
2. **API contract** — what function a component exports, what props it accepts
3. **User behaviour** — what the user sees, what happens when they click, what appears after they type

React Testing Library is built around option 3. The reason: implementation changes are constant
(refactoring, class renames, state restructuring), but user behaviour is stable. A test that
checks user behaviour survives any internal change that doesn't change what the user experiences.

---

## Step 1 — See Why CSS Class Tests Break

Write this test and then break it by renaming the CSS class:

```tsx
// TaskItem.test.tsx — the FRAGILE version (class-name test):
it('shows the task title', () => {
  render(<TaskItem task={{ id: 't-1', title: 'Write tests', done: false }} />);
  expect(document.querySelector('.task-title').textContent).toBe('Write tests');
  //                             ^^^^^^^^^^^  this is the implementation detail
});
```

Now rename the CSS class in `TaskItem.tsx` from `task-title` to `task-heading`.
The component still looks the same to the user. But the test FAILS.

```tsx
// The STABLE version (behaviour test):
it('shows the task title', () => {
  render(<TaskItem task={{ id: 't-1', title: 'Write tests', done: false }} />);
  expect(screen.getByText('Write tests')).toBeInTheDocument();
  // 'Write tests' is visible to the user — if this changes, behaviour changed
});
```

Rename the CSS class now. **Expected:** The stable version still passes.

---

### Concept: `getByRole` — The Accessibility Tree

**What it is:** `getByRole` queries the accessibility tree — the parallel representation
of the UI that screen readers use. Every HTML element has a default ARIA role:
`<button>` → role `button`, `<input>` → role `textbox`, `<h1>` → role `heading`.

**The mechanism — two trees exist simultaneously:**

```
DOM tree:                      Accessibility tree:
<div class="form">             "form" (role: form)
  <label for="title">         "Task title" (role: label, for: title)
    Task title
  </label>
  <input id="title" />        "Task title" (role: textbox, labeled by: "Task title")
  <button>Add Task</button>   "Add Task" (role: button, name: "Add Task")
</div>
```

`getByRole('button', { name: 'Add Task' })` asks: "is there a node in the accessibility tree
with role `button` and accessible name `Add Task`?" — the accessible name comes from the
button's text content, its `aria-label`, or its `aria-labelledby`.

**Why this is better than `getByTestId`:**

```tsx
// getByTestId — tests an attribute that has no meaning to users:
<button data-testid="submit-btn">Add Task</button>
// If you remove data-testid, the test breaks. But the button still works for users.

// getByRole — tests what a screen reader user experiences:
<button>Add Task</button>
// The button has role "button" and name "Add Task" regardless of any attribute.
// If you rename the button text, the test fails AND the user sees a different label.
```

**The accessibility bonus:** Tests written with `getByRole` ALSO verify that the UI
is accessible. If a button has no accessible name, `getByRole('button', { name: 'Add Task' })`
fails — catching an accessibility bug at the same time as testing the feature.

**You will see this again in:**
- WCAG (Web Content Accessibility Guidelines) defines role and name requirements
- Screen readers (VoiceOver, NVDA, JAWS) use the accessibility tree to describe the UI
- Automated accessibility checkers (axe-core, Lighthouse) also use ARIA roles

---

## Step 2 — Build the Test Suite

Install testing dependencies if not already done:

```bash
npm install -D @testing-library/react @testing-library/user-event jsdom msw
```

Update `vite.config.ts`:

```ts
test: { environment: 'jsdom' }
```

Create `src/components/TaskListFromAPI.test.tsx`:

```tsx
// src/components/TaskListFromAPI.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent                    from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense }                 from 'react';
import { ErrorBoundary }            from 'react-error-boundary';
import { server }                   from '../mocks/server';
import { TaskListFromAPI }          from './TaskListFromAPI';
import { http, HttpResponse }       from 'msw';

beforeAll(()  => server.listen());
afterEach(()  => server.resetHandlers());
afterAll(()   => server.close());

// Every test needs QueryClient + Suspense + ErrorBoundary — wrap once:
function TestWrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

describe('TaskListFromAPI', () => {

  it('shows a loading state before data arrives', () => {
    // Before the MSW response arrives, the Suspense fallback is visible:
    render(<TaskListFromAPI />, { wrapper: TestWrapper });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    // The component has suspended — the fallback is showing
  });

  it('shows tasks after they load', async () => {
    render(<TaskListFromAPI />, { wrapper: TestWrapper });

    // findByText waits until the element appears (after MSW responds):
    expect(await screen.findByText('Write tests')).toBeInTheDocument();
    expect(await screen.findByText('Deploy')).toBeInTheDocument();
  });

  it('shows an error fallback when the API fails', async () => {
    // Override the handler just for this test:
    server.use(
      http.get('http://localhost:8000/tasks/', () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    render(<TaskListFromAPI />, { wrapper: TestWrapper });

    // Error boundary activates — query throws after 500 response:
    expect(await screen.findByText('Error')).toBeInTheDocument();
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/components/TaskListFromAPI.test.tsx
```

Expected: all 3 tests pass.

**In the terminal, watch what `findByText` does:**

```ts
// findByText('Write tests') is equivalent to:
await waitFor(() => {
  const element = screen.queryByText('Write tests');
  if (!element) throw new Error('element not found');
  return element;
}, { timeout: 1000, interval: 50 });
// Retries every 50ms for up to 1000ms
// This is not a single Promise.resolve — it polls the DOM
```

---

### Concept: `userEvent` vs `fireEvent` — Why the Difference Matters

**What it is:** Both simulate user interactions, but at different levels:

- `fireEvent.change(input, { target: { value: 'hello' } })` — fires ONE synthetic React
  change event with the given value. The browser never fires this kind of event.
- `userEvent.type(input, 'hello')` — fires the complete sequence of events a real browser
  fires: keydown, keypress, input, keyup for EACH character. The input's value changes
  character by character.

**Why it matters for form validation:**

```tsx
// react-hook-form validates on specific events (onBlur, onChange, keypress etc.)
// userEvent.type fires ALL of them in sequence:
await userEvent.type(input, 'h');   // keydown(h) → keypress(h) → input(value='h') → keyup(h)
await userEvent.type(input, 'e');   // keydown(e) → ...

// fireEvent.change fires ONE event with the final value:
fireEvent.change(input, { target: { value: 'he' } });  // one 'change' event

// RESULT: react-hook-form's onKeyPress validation never fires with fireEvent.change
// Your test may pass with fireEvent but fail with real user interaction
```

**The rule:** Use `userEvent` for tests that involve form inputs, keyboard shortcuts,
or any interaction where the event sequence matters. Use `fireEvent` only for testing
that a specific low-level event fires a specific handler.

**You will see this again in:**
- react-hook-form validation mode 'onChange' and 'onKeyPress' require `userEvent` to test correctly
- Keyboard accessibility tests — Tab, Escape, arrow keys — need `userEvent` for realistic sequences
- Any test that simulates "what would a real user do?"

---

### Concept: MSW — Intercepting at the Network Level

**What it is:** Mock Service Worker (MSW) installs a Service Worker in the browser
(or a Node intercept in tests) that intercepts `fetch` calls BEFORE they reach the
network. Your test code never mocks `fetch` — MSW intercepts at the protocol level.

**The mechanism — where MSW sits:**

```
Test code → fetch('/tasks/') → [MSW intercepts here] → [never reaches real server]
                                     ↓
                             MSW handler runs: http.get('/tasks/', () => HttpResponse.json([...]))
                                     ↓
                             Returns fake response to fetch()
                                     ↓
Test code receives: Response { status: 200, body: '[...]' }
```

**Why this is better than mocking `fetch`:**

```tsx
// Mocking fetch directly — fragile:
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => [{ id: 't-1', title: 'Write tests' }],
});
// This only catches if your code uses `fetch` directly.
// If you switch to axios, the mock stops working.
// If fetch is called from a library, the mock doesn't know the URL.

// MSW — intercepts regardless of how fetch is called:
server.use(http.get('/tasks/', () => HttpResponse.json([...])));
// Works with fetch, axios, ky, any HTTP library.
// Tests use the real fetch API — closer to production.
```

**You will see this again in:**
- The MSW documentation shows browser setup (service worker) vs Node setup (interceptor)
- In production, no service worker is installed — MSW only intercepts during testing
- `server.use(...)` overrides handlers for one test; `server.resetHandlers()` in afterEach restores defaults

---

## Step 3 — Write the Full Component Test Suite

Create `src/components/AddTaskForm.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent                    from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server }                   from '../mocks/server';
import { AddTaskForm }              from './AddTaskForm';

beforeAll(()  => server.listen());
afterEach(()  => server.resetHandlers());
afterAll(()   => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('AddTaskForm', () => {

  it('renders the title input and submit button', () => {
    render(<AddTaskForm />, { wrapper });

    // Use role queries — these test accessibility, not implementation:
    expect(screen.getByPlaceholderText('Task title...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('does not submit when the title is empty', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Add' }));

    // Input still empty — nothing was submitted:
    expect(screen.getByPlaceholderText('Task title...')).toHaveValue('');
  });

  it('clears the input after successful submission', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm />, { wrapper });

    const input = screen.getByPlaceholderText('Task title...');
    await user.type(input, 'Write tests');           // real keyboard events
    await user.click(screen.getByRole('button', { name: 'Add' }));

    // Wait for the mutation to complete and the form to reset:
    await waitFor(() => expect(input).toHaveValue(''));
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

**Expected:** All tests pass.

**Change something:** In the last test, replace `userEvent.type` with `fireEvent.change`:

```tsx
import { fireEvent } from '@testing-library/react';
fireEvent.change(input, { target: { value: 'Write tests' } });
```

**Expected:** Test still passes in this case (because AddTaskForm uses react-hook-form's
`register` which hooks into the native input events that `fireEvent.change` does fire).
But add a Zod validation min-length to the form schema and try again — the validation
may not trigger because `fireEvent.change` doesn't fire the full event sequence.
Switch back to `userEvent.type`.

---

## 🎯 Challenge: Test the Delete Flow End-to-End

**You know:** `userEvent`, `findBy`, `waitFor`, `within`.

**The mechanism to understand:**

`within(container)` scopes all queries to a specific DOM element. Without it, if two
items have the same text "Delete", you can't distinguish which button belongs to which task.
`within` solves: "among the children of this element, find...".

**Task:** Write a test that:
1. Loads the task list (2 tasks appear)
2. Clicks the first task to select it
3. Clicks "Delete" in the detail panel
4. Verifies the deleted task disappears from the list

---

<details>
<summary>▶ Show Solution</summary>

```tsx
it('deletes a task and removes it from the list', async () => {
  // Add DELETE handler to MSW:
  server.use(
    http.delete('http://localhost:8000/tasks/:id', () =>
      new HttpResponse(null, { status: 204 })
    )
  );

  const user = userEvent.setup();
  render(<App />, { wrapper });

  // Wait for the task list to load:
  const task = await screen.findByText('Write tests');

  // Select the task:
  await user.click(task);

  // Click delete in the detail panel:
  await user.click(screen.getByRole('button', { name: /delete/i }));

  // The task disappears from the list:
  await waitFor(() =>
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument()
  );
});
```

**Key insight:** `queryByText` (not `getByText`) is used in the final assertion because
`getByText` throws if the element is NOT found — but we WANT it to not be found.
`queryByText` returns `null` when the element is absent, which lets `waitFor` retry
until the element is truly gone (after the optimistic update and cache invalidation).

</details>

---

## Final Check

| Query | Use when | Breaks when |
|---|---|---|
| `getByRole` | Interactive elements | Button loses accessible name |
| `getByLabelText` | Form inputs with labels | Label text changes |
| `findByText` | Text that appears async | Text changes |
| `queryByText` | Checking absence | Text appears unexpectedly |
| `within(el)` | Multiple similar elements | Target element structure changes |

---

## Quick Check Answers

**1. CSS class renamed from `task-title` to `task-heading`. `getByClassName` test passes?**

No — it fails. `document.querySelector('.task-title')` returns `null` because the class
no longer exists. The component looks identical to users, but the test broke. This is
the "fragile test" problem — it tested an implementation detail (CSS class name) rather
than a user-visible behaviour. `getByText('Write tests')` would still pass.

**2. `userEvent.type` fires 20 events for "hello". `fireEvent.change` fires 1. Why does it matter?**

Validation libraries like react-hook-form, and custom hooks like `useDebounce`, respond to
specific events in the sequence. react-hook-form's `mode: 'onChange'` triggers validation
on the `change` event AND the `input` event. `userEvent.type` fires both; `fireEvent.change`
fires only one. For debounce hooks, `userEvent.type` fires `keydown` which can trigger
debounce reset; `fireEvent.change` skips it. The test passes with `fireEvent` but the real
user experience might behave differently.

**3. `await findByText(...)` — how many times does it check? How often? What is the timeout?**

`findByText` is a wrapper around `waitFor` which retries every 50ms for up to 1000ms
(the defaults). So: up to 20 checks, every 50ms, before throwing if the element never appears.
When the React Query data arrives and the component re-renders, the next 50ms check finds
the element and the Promise resolves. It is NOT a single Promise.resolve — it continuously
polls the DOM until the element appears or the timeout expires.
