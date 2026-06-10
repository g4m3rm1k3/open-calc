# Junior to Senior — T6·L8 — Frontend Testing With React Testing Library

**Prerequisites:** T6·L7 (Error Boundaries and Suspense). You understand the
component tree. This lesson covers the philosophy and practice of testing React
components — testing what users see, not implementation details.

**What this lab adds:**
- Testing philosophy: test what the user sees and does
- `render` and `screen` — rendering and querying the DOM
- Accessible queries: `getByRole`, `getByLabelText`, `getByText`
- `userEvent.type`, `userEvent.click` — simulating real interactions
- `waitFor` — waiting for async DOM changes
- `msw` (Mock Service Worker) — intercepting fetch at the network level

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your test uses `getByClassName('task-title')`. The CSS class is renamed to
>    `task-heading`. What happens to the test?
> 2. `getByRole('button', { name: 'Submit' })` — what does "role" mean here?
>    Why is it preferred over `getByTestId`?
> 3. `findByText('Task created')` vs `getByText('Task created')` — what is the
>    difference?
>
> *(Answers at the end of this lab)*

---

## The Testing Philosophy

React Testing Library's core philosophy:

> "The more your tests resemble the way your software is used, the more confidence they give you."

This means:

```tsx
// BAD — tests implementation details:
it('sets state correctly', () => {
  const { result } = renderHook(() => useTaskStore());
  act(() => result.current.addTask('Write tests'));
  expect(result.current.tasks[0].title).toBe('Write tests');
});

// GOOD — tests what the user sees:
it('shows the task after adding it', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByPlaceholderText('Task title'), 'Write tests');
  await user.click(screen.getByRole('button', { name: 'Add Task' }));
  expect(await screen.findByText('Write tests')).toBeInTheDocument();
});
```

The second test verifies the actual user experience. If the state shape changes
but the UI still works, the test still passes.

---

### Concept: Accessible Queries

**The query hierarchy** (most preferred → least preferred):

| Query | Finds by | Example |
|---|---|---|
| `getByRole` | ARIA role + accessible name | `getByRole('button', { name: 'Submit' })` |
| `getByLabelText` | `<label>` text | `getByLabelText('Email address')` |
| `getByPlaceholderText` | placeholder attribute | `getByPlaceholderText('Search...')` |
| `getByText` | visible text | `getByText('Task created!')` |
| `getByDisplayValue` | input's current value | `getByDisplayValue('current value')` |
| `getByTestId` | `data-testid` attribute | `getByTestId('task-item')` |

**Why `getByRole` is preferred:** Roles are part of the accessibility tree. Using
`getByRole('button', { name: 'Submit' })` tests that:
1. A button exists
2. It is accessible to screen readers with the correct label

If you rename the button's CSS class, the test still passes. If you accidentally
make the button inaccessible (no accessible name), the test fails — catching the
accessibility bug.

---

### Concept: `getBy` vs `findBy` vs `queryBy`

| Prefix | Behaviour on missing element | Returns |
|---|---|---|
| `getBy` | Throws immediately | Element (synchronous) |
| `findBy` | Waits, then throws if still missing | Promise\<Element\> |
| `queryBy` | Returns `null` | Element or null |

```tsx
// getByText — element must exist NOW:
screen.getByText('Submit')   // throws if not found

// findByText — waits up to 1000ms for element to appear:
await screen.findByText('Task created')   // for async DOM updates

// queryByText — check existence without throwing:
expect(screen.queryByText('Error')).not.toBeInTheDocument()
```

---

### Concept: `userEvent` vs `fireEvent`

**`userEvent`** simulates real user behavior:
- `type` fires keydown, keypress, input, keyup for each character
- `click` fires mousedown, mouseup, click
- Respects focus, disabled state, and pointer events

**`fireEvent`** fires a single DOM event — simpler but less realistic.

```tsx
// Prefer userEvent for accuracy:
const user = userEvent.setup();
await user.type(input, 'hello');
await user.click(button);
await user.selectOptions(select, 'high');
await user.clear(input);
```

---

## Step 1 — Write Component Tests

Create `src/components/TaskListFromAPI.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent               from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskListFromAPI }     from './TaskListFromAPI';
import { server }              from '../mocks/server';
import { resetTasks }          from '../mocks/handlers';
import { vi, describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(()  => server.listen());
afterEach(()  => { server.resetHandlers(); resetTasks(); });
afterAll(()   => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('TaskListFromAPI', () => {

  it('shows a loading message initially', () => {
    render(<TaskListFromAPI />, { wrapper });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows tasks after they load', async () => {
    render(<TaskListFromAPI />, { wrapper });
    expect(await screen.findByText('Write tests')).toBeInTheDocument();
    expect(await screen.findByText('Deploy')).toBeInTheDocument();
  });

  it('highlights the selected task when clicked', async () => {
    const user = userEvent.setup();
    render(<TaskListFromAPI />, { wrapper });

    const task = await screen.findByText('Write tests');
    await user.click(task);

    // The task's container gets the selected background:
    const listItem = task.closest('li');
    expect(listItem).toHaveStyle({ background: '#e3f2fd' });
  });

  it('shows an error message when the API fails', async () => {
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.get('http://localhost:8000/tasks/', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    render(<TaskListFromAPI />, { wrapper });
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

});
```

Create `src/components/AddTaskForm.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent               from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddTaskForm }         from './AddTaskForm';
import { server }              from '../mocks/server';

beforeAll(()  => server.listen());
afterEach(()  => server.resetHandlers());
afterAll(()   => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('AddTaskForm', () => {

  it('renders input and button', () => {
    render(<AddTaskForm />, { wrapper });
    expect(screen.getByPlaceholderText('Task title...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('does not submit when the title is empty', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Add' }));

    // Title is still empty — nothing submitted:
    expect(screen.getByPlaceholderText('Task title...')).toHaveValue('');
  });

  it('clears the input after submitting', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm />, { wrapper });

    const input = screen.getByPlaceholderText('Task title...');
    await user.type(input, 'Write tests');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(input).toHaveValue(''));
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## Step 2 — Testing With `within`

`within` scopes queries to a specific element — useful for testing lists where
the same text may appear in multiple items:

```tsx
import { within } from '@testing-library/react';

it('shows priority inside each task item', async () => {
  render(<TaskListFromAPI />, { wrapper });
  await screen.findByText('Write tests');

  const items = screen.getAllByRole('listitem');
  const first = within(items[0]);

  expect(first.getByText(/HIGH/i)).toBeInTheDocument();
});
```

---

## 🎯 Challenge: Test a Delete Flow

**You know:** `userEvent`, `findBy`, `waitFor`, `within`.

**Task:** Write a test for the complete delete flow:
1. The task list loads and shows 2 tasks
2. The user clicks the first task (selects it)
3. The user clicks "Delete" in the detail panel
4. The task disappears from the list

Assume the delete button has accessible name "Delete" and lives in `TaskDetail`.

Try for at least 15 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from '../App';

it('deletes a task and removes it from the list', async () => {
  // Extend mock to handle delete:
  server.use(
    http.delete('http://localhost:8000/tasks/:id', () =>
      new HttpResponse(null, { status: 204 })
    )
  );

  const user = userEvent.setup();
  render(<App />, { wrapper });

  // Wait for tasks to load:
  const writeTests = await screen.findByText('Write tests');

  // Select the first task:
  await user.click(writeTests);

  // Click delete in the detail panel:
  await user.click(screen.getByRole('button', { name: /delete/i }));

  // Task is gone from the list:
  await waitFor(() =>
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument()
  );
});
```

**Key insight:** The test exercises the full user flow through the real UI: click
to select → click to delete → verify absence. It does not test internal state, does
not call store methods directly, and does not verify specific class names. The test
would pass even if the entire state management was replaced with a different library,
as long as the user experience remains the same.

</details>

---

## Final Check

| Query type | When to use |
|---|---|
| `getByRole` | Interactive elements (buttons, inputs, links, headings) |
| `getByLabelText` | Form inputs with associated labels |
| `findByText` | Text that appears asynchronously (after fetch) |
| `queryByText` | Checking an element does NOT exist |
| `within(element)` | Scoping queries inside a specific container |

| Concept | Verify |
|---|---|
| `getByRole` vs implementation | Rename CSS class → test still passes |
| `findBy` waits | Async data loads → test waits automatically |
| `userEvent` fires real events | `type` fires keydown events — real validation runs |
| MSW intercepts fetch | Tests run without a real backend |

---

## Quick Check Answers

**1. CSS class renamed — `getByClassName` test. What happens?**

The test fails. `getByClassName` couples the test to an implementation detail
(the CSS class name). Any refactoring that renames the class — even without
changing the behaviour — breaks the test. This is a "false negative": the test
fails but the UI still works correctly. Use `getByRole`, `getByText`, or
`getByLabelText` instead — these query the semantics of the element, not its
implementation.

**2. `getByRole('button', { name: 'Submit' })` — what is "role"? Why preferred?**

"Role" is the ARIA role — the semantic type of the element in the accessibility
tree. A `<button>` element has the implicit role `button`. `{ name: 'Submit' }`
matches the button's accessible name (its text content, `aria-label`, or `aria-labelledby`).
This query is preferred because it tests accessibility simultaneously: if the
button's accessible name is wrong (breaking screen reader users), the test fails.
`getByTestId` tests nothing semantic — it only checks that `data-testid` attribute
exists.

**3. `findByText` vs `getByText` — difference?**

`getByText` throws immediately if the element does not exist. Use it when the
element is always present on render. `findByText` returns a Promise and polls
the DOM for up to 1000ms (configurable) until the element appears. Use it for
elements that appear after an async operation (API fetch, state update, animation).
If the element never appears, `findByText` throws after the timeout.
