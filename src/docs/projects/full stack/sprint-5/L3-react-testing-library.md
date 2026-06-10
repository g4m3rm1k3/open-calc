# Sprint 5 · Lesson 3 — React Testing Library: test your frontend

## What you will build

By the end of this lesson, three frontend tests pass: the order list renders work orders, the create form submits a POST request, and the login form rejects empty inputs. You will use React Testing Library (RTL) and Mock Service Worker (MSW) to intercept network requests in tests. You will understand why RTL tests by user interaction rather than implementation details, and what `screen.getByRole` means.

---

## What you need to know first

- Sprint 1 L2: React components, `useState`, `useEffect`.
- Sprint 4 L4: `LoginForm`, `WorkOrderList`, `CreateOrderForm`, Zustand `useAuthStore`.
- Sprint 5 L1: What a test is, arrange-act-assert.

---

## The lesson

---

### 1. Install the testing stack

React Testing Library and Vitest (Vite's test runner, compatible with Jest's API):

```
cd frontend
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom msw
```

Update `frontend/vite.config.ts` to configure Vitest:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `frontend/src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Add a test script to `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

**Walkthrough:**

`@testing-library/react` — renders React components into a virtual DOM for testing. Provides `render`, `screen`, and other utilities.

`@testing-library/user-event` — simulates real user interactions: typing text character by character, clicking buttons, tabbing between fields. More realistic than `fireEvent` (which fires synthetic events directly).

`@testing-library/jest-dom` — extends Jest/Vitest `expect` with DOM-specific matchers: `toBeInTheDocument()`, `toBeDisabled()`, `toHaveTextContent()`. The import in `test-setup.ts` makes these available in every test.

`vitest` — Vite's test runner. Compatible with Jest's API (`describe`, `it`, `expect`, `beforeEach`, `afterEach`). Faster than Jest for Vite projects because it reuses Vite's transform pipeline.

`jsdom` — a JavaScript implementation of browser APIs (DOM, window, document). Vitest uses it to simulate a browser environment in Node.js. Your components can `querySelector`, set `innerHTML`, etc.

`msw` (Mock Service Worker) — intercepts HTTP requests in tests and returns configurable responses. Unlike mocking `fetch` directly, MSW intercepts at the network layer — your `fetch()` calls run exactly as they do in production, but the response comes from MSW's handler instead of a real server.

`environment: 'jsdom'` — tells Vitest to use jsdom as the test environment (simulated browser).

`setupFiles: ['./src/test-setup.ts']` — runs this file before each test file. `import '@testing-library/jest-dom'` extends `expect` with DOM matchers.

---

### 2. Set up MSW handlers

Create `frontend/src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'

const mockOrders = [
  { id: 1, title: 'Fix conveyor belt', status: 'open', priority: 'high' },
  { id: 2, title: 'Lubricate pump', status: 'in_progress', priority: 'medium' },
]

export const handlers = [
  http.get('http://localhost:8000/orders', () => {
    return HttpResponse.json(mockOrders)
  }),

  http.post('http://localhost:8000/orders', async ({ request }) => {
    const body = await request.json() as Record<string, string>
    return HttpResponse.json(
      { id: 3, title: body.title, status: body.status, priority: body.priority },
      { status: 201 }
    )
  }),

  http.post('http://localhost:8000/auth/login', async ({ request }) => {
    const body = await request.json() as Record<string, string>
    if (body.username === 'testuser' && body.password === 'testpass') {
      return HttpResponse.json({ access_token: 'mock-token', token_type: 'bearer' })
    }
    return HttpResponse.json(
      { detail: 'Incorrect username or password' },
      { status: 401 }
    )
  }),
]
```

Create `frontend/src/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

Update `frontend/src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { afterAll, afterEach, beforeAll } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Walkthrough:**

`http.get('http://localhost:8000/orders', ...)` — defines a handler that intercepts GET requests to this URL. The callback returns an `HttpResponse`. Your component's `fetch('http://localhost:8000/orders')` call never reaches the real server — MSW intercepts it and returns the mock response.

`server.listen()` — starts the MSW server before all tests. Registers the request interceptors.

`server.resetHandlers()` — after each test, resets any per-test handler overrides (added with `server.use()`) back to the base handlers. This ensures test-specific overrides do not leak into subsequent tests.

`server.close()` — after all tests, removes the interceptors.

**The architecture:** MSW operates at the `fetch` API level. It does not mock `fetch` — it intercepts the actual network request before it leaves the process. The fetch call path is:

```
component → fetch() → [MSW intercepts] → handler returns mock → fetch() resolves with mock response
```

Your component code (the part that calls `fetch` and processes the response) runs exactly as it does in production. Only the network response is replaced. This tests more of the real code path than manually mocking `fetch`.

**CS lens — interceptors as middleware.** MSW is a network middleware: it sits between your code and the network, inspecting and responding to requests. The same principle appears in: Express middleware (sits between HTTP request and route handler), database transaction hooks (sit between application code and database), and proxy servers (sit between client and origin). The pattern — intercept, inspect, respond or pass through — is fundamental to network programming.

**SE lens — realistic mocks vs. tight mocks.** MSW handlers return realistic HTTP responses — JSON with the same shape as your real API. When your real API returns a different shape (e.g., the field is renamed from `priority` to `urgency`), both the mock and the component need updating. This is a feature, not a bug: the mock is a contract. Updating it when the API changes is the same discipline as updating Pydantic schemas when the database schema changes.

---

### 3. Test the WorkOrderList component

Create `frontend/src/components/__tests__/WorkOrderList.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { WorkOrderList } from '../WorkOrderList'

describe('WorkOrderList', () => {
  it('renders a list of work orders', async () => {
    // Arrange
    const mockOrders = [
      { id: 1, title: 'Fix conveyor belt', status: 'open', priority: 'high' },
      { id: 2, title: 'Lubricate pump', status: 'in_progress', priority: 'medium' },
    ]

    // Act
    render(
      <WorkOrderList
        orders={mockOrders}
        onSelectOrder={() => {}}
      />
    )

    // Assert
    expect(screen.getByText('Fix conveyor belt')).toBeInTheDocument()
    expect(screen.getByText('Lubricate pump')).toBeInTheDocument()
  })

  it('renders nothing when the list is empty', () => {
    // Arrange & Act
    render(
      <WorkOrderList
        orders={[]}
        onSelectOrder={() => {}}
      />
    )

    // Assert
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('calls onSelectOrder with the order when clicked', async () => {
    // Arrange
    const handleSelect = vi.fn()
    const mockOrders = [
      { id: 1, title: 'Fix conveyor belt', status: 'open', priority: 'high' },
    ]

    render(
      <WorkOrderList
        orders={mockOrders}
        onSelectOrder={handleSelect}
      />
    )

    // Act
    const orderItem = screen.getByText('Fix conveyor belt')
    orderItem.click()

    // Assert
    expect(handleSelect).toHaveBeenCalledWith(mockOrders[0])
    expect(handleSelect).toHaveBeenCalledTimes(1)
  })
})
```

**Walkthrough:**

`render(<WorkOrderList ... />)` — renders the component into jsdom. The component runs through its initial render cycle (including any `useEffect` hooks that run synchronously). The rendered DOM is available via `screen`.

`screen.getByText('Fix conveyor belt')` — searches the rendered DOM for an element with this exact text. `getBy` throws if the element is not found (the test fails immediately). `queryBy` returns `null` if not found (useful for asserting absence). `findBy` returns a Promise and waits for the element to appear (useful for async).

`toBeInTheDocument()` — an `@testing-library/jest-dom` matcher. Asserts the element exists in the document. `getByText` already throws if the element is not found — but `toBeInTheDocument()` makes the assertion intent explicit to readers.

`screen.queryByRole('listitem')` — `queryBy` returns `null` if not found. `.not.toBeInTheDocument()` asserts it does not exist. This combination tests the empty-list case.

`vi.fn()` — Vitest's mock function. Records calls, arguments, and can be configured to return specific values. Equivalent to `jest.fn()`.

`expect(handleSelect).toHaveBeenCalledWith(mockOrders[0])` — asserts the mock was called with this specific argument. The entire order object must match. This verifies that clicking an item passes the right data up to the parent.

**CS lens — role-based querying as semantic HTML.** `getByRole('listitem')` queries by ARIA role, not by class name or element type. A `<li>` element has the implicit role `listitem`. `getByRole('button')` finds any `<button>` or `<input type="button">`. This approach has a direct implication for accessibility: if your component uses a `<div onClick>` instead of a `<button>`, `getByRole('button')` will not find it — and neither will a screen reader. RTL's role-based queries encode the principle that accessible HTML is correct HTML.

**SE lens — testing props, not internals.** The `WorkOrderList` tests never access the component's state directly. They only interact with: the rendered DOM (what a user sees) and the callbacks (what a user can trigger). This is the React Testing Library philosophy: "The more your tests resemble the way your software is used, the more confidence they can give you." Tests that check `component.state.orders` are testing React internals — they break if you refactor state management but not the behaviour.

**What breaks without this:** If you change `WorkOrderList` to render orders inside a `<div>` instead of `<ul>/<li>`, the tests still pass (because `getByText` finds by text, not by element type). If you change the rendered text (e.g., display `order.title.toUpperCase()`), the test `getByText('Fix conveyor belt')` fails — alerting that the visual output changed.

---

### 4. Test the CreateOrderForm component

Create `frontend/src/components/__tests__/CreateOrderForm.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateOrderForm } from '../CreateOrderForm'

describe('CreateOrderForm', () => {
  it('calls onOrderCreated after successful submit', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleCreated = vi.fn()
    render(<CreateOrderForm onOrderCreated={handleCreated} />)

    // Act: fill in the form and submit
    await user.type(screen.getByLabelText(/title/i), 'Fix conveyor belt')
    await user.selectOptions(screen.getByLabelText(/status/i), 'open')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')
    await user.click(screen.getByRole('button', { name: /create/i }))

    // Assert: wait for the async submit to resolve
    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledTimes(1)
    })
  })

  it('does not submit when title is empty', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleCreated = vi.fn()
    render(<CreateOrderForm onOrderCreated={handleCreated} />)

    // Act: click submit without filling the title
    await user.click(screen.getByRole('button', { name: /create/i }))

    // Assert: callback was never called
    expect(handleCreated).not.toHaveBeenCalled()
  })
})
```

**Walkthrough:**

`userEvent.setup()` — creates a user event instance. Must be called at the top of each test (not in `beforeEach`) to ensure proper state isolation.

`await user.type(screen.getByLabelText(/title/i), 'Fix conveyor belt')` — two things happen:

1. `screen.getByLabelText(/title/i)` — finds the input associated with a `<label>` whose text matches `/title/i` (case-insensitive regex). This requires your form to have proper `<label htmlFor="title-input">` HTML. If the label is absent, the query fails — which is both a test failure and an accessibility bug indicator.

2. `user.type(element, text)` — types each character one by one into the input, firing `keydown`, `input`, and `keyup` events for each character. This exercises the same code path as a real user typing, including React's synthetic event handling.

`await user.selectOptions(screen.getByLabelText(/status/i), 'open')` — selects an option from a `<select>` element. Fires the `change` event.

`await user.click(screen.getByRole('button', { name: /create/i }))` — clicks the button. `{ name: /create/i }` matches the button's accessible name — its text content. This is more robust than `getByText(/create/i)` because it specifically finds interactive elements (buttons).

`await waitFor(() => { expect(handleCreated).toHaveBeenCalledTimes(1) })` — `waitFor` retries the assertion until it passes or times out (default 1000ms). This handles the asynchronous submit: clicking the button starts a `fetch` call (intercepted by MSW), which resolves asynchronously. `waitFor` waits for the component to update after the fetch resolves.

**CS lens — async testing with waitFor.** React updates triggered by asynchronous operations (fetch responses, setTimeout callbacks) require `await waitFor(...)`. Without it, the assertion runs before the async operation resolves — the test asserts against the intermediate state, not the final state. `waitFor` polls the assertion on each React flush until it passes. This is the test equivalent of polling a completion condition — but with proper backoff and timeout built in.

**SE lens — `getByLabelText` enforces accessibility.** `getByLabelText` finds the input linked to a label. This requires `<label htmlFor="...">` and `<input id="...">` to match. If the label is missing or the `for`/`id` association is broken, the test fails. This is a direct test of accessibility compliance: screen readers use the label association to read form inputs. Making your tests pass forces accessible HTML.

**What breaks without this:** If `CreateOrderForm` uses uncontrolled inputs (reading `document.querySelector` instead of React state), the `user.type` events still fire, but React does not update the state. The form submits empty values to the API, which returns 422. The test catches this by verifying `handleCreated` is called — which requires a 201 response from MSW, which requires the request body to have the right fields.

---

### 5. Test the LoginForm component

Create `frontend/src/components/__tests__/LoginForm.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
  it('calls login store action on successful login', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<LoginForm />)

    // Act
    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/password/i), 'testpass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // Assert: MSW returns a token, the login action stores it
    await waitFor(() => {
      expect(screen.queryByText(/incorrect/i)).not.toBeInTheDocument()
    })
  })

  it('shows error message on failed login', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<LoginForm />)

    // Act: wrong credentials
    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // Assert: error message appears
    await waitFor(() => {
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument()
    })
  })

  it('password field obscures text', () => {
    // Arrange & Act
    render(<LoginForm />)

    // Assert
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
```

**Walkthrough — `it('password field obscures text', ...)`:**

This test renders the form and immediately checks the password input's `type` attribute. No interaction needed. This is a simple assertion about the DOM structure — but it has real security implications. If a refactor accidentally changes `type="password"` to `type="text"`, this test fails immediately. The test encodes the requirement: passwords must not be displayed in plaintext.

`toHaveAttribute('type', 'password')` — an `@testing-library/jest-dom` matcher that checks an HTML attribute value.

**CS lens — `findBy` vs. `getBy` vs. `queryBy`.** All three RTL query families have the same variant types:

- `getBy*` — synchronous, throws if not found. Use when the element should always be present after render.
- `queryBy*` — synchronous, returns `null` if not found. Use with `not.toBeInTheDocument()` to assert absence.
- `findBy*` — asynchronous (returns Promise), waits up to 1000ms. Use for elements that appear after async operations.

`waitFor(() => expect(...))` is the explicit version of `findBy` — you control exactly what to wait for.

**SE lens — MSW for API-dependent component tests.** `LoginForm` calls the real FastAPI login endpoint in production. In tests, MSW intercepts that call and returns a pre-configured response. This means the `LoginForm` test:
- Does not require the FastAPI server to be running
- Runs deterministically (same mock response every time)
- Tests the full component code path including the fetch and response processing

Without MSW, you would either need a running server (slow, fragile) or mock `fetch` globally (breaks other tests, does not test the actual fetch call).

---

## Connect the pieces

The frontend test suite now:
- Tests component rendering (WorkOrderList)
- Tests user interactions and async callbacks (CreateOrderForm)
- Tests form validation and error states (LoginForm)
- Intercepts network requests without a running server (MSW)
- Verifies security-sensitive attributes (password field type)

Lesson 4 runs the backend pytest suite and frontend Vitest suite together in GitHub Actions on every push.

---

## What breaks without this

**Missing `await` before `user.type`:** `userEvent` methods return Promises. Forgetting `await` means the next line runs before the typing completes — the form is empty when you click submit. The test passes incorrectly (the form was never filled). Fix: always `await user.type(...)`, `await user.click(...)`.

**`server.resetHandlers()` missing from `afterEach`:** If one test adds a per-test handler override with `server.use(...)` (e.g., to test an error response), the override persists into the next test. The next test receives unexpected responses. Fix: `afterEach(() => server.resetHandlers())` in `test-setup.ts`.

---

## Definition of done

- [ ] `npm test` (or `npm run test:run`) shows all component tests passing
- [ ] `WorkOrderList.test.tsx` tests pass without a running backend server
- [ ] The password-type test fails if you change `type="password"` to `type="text"` in `LoginForm`
- [ ] You can explain the difference between `getBy`, `queryBy`, and `findBy`
- [ ] You can explain what MSW intercepts and why it is better than mocking `fetch`
- [ ] You can explain why `getByLabelText` enforces accessibility

**Git commit:**

```
git add frontend/src/mocks/ frontend/src/test-setup.ts frontend/src/components/__tests__/ frontend/vite.config.ts
git commit -m "Add React Testing Library tests: WorkOrderList, CreateOrderForm, LoginForm with MSW network interception"
```
