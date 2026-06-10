# Sprint 2 · Lesson 4 — React: display a list of work orders

## What you will build

By the end of this lesson, the React app displays the full list of work orders fetched from FastAPI, lets the user click a row to see detail, and provides a form to create a new order. Each feature is its own component. State is managed with `useState`. Data fetching uses `useEffect` and `async/await`. The new order appears in the list immediately after creation.

---

## What you need to know first

- Sprint 1 L4: `fetch`, `useEffect`, `useState`, CORS, async/await, error/loading states.
- Sprint 2 L3: The CRUD API is running at `localhost:8000` with `GET /orders`, `POST /orders`.

**Concepts carried forward:** `useState`, `useEffect`, `fetch`, `async/await`, JSX, components, TypeScript interfaces, CORS, the 6-part async state (loading/error/data).

---

## The lesson

---

### 1. Define the shared TypeScript type

**The problem:** The React app will work with work order data from the API. Without a TypeScript type, Pylance cannot check that you are accessing real fields. You need to define the data shape once and use it everywhere.

Create `frontend/src/types.ts`:

```typescript
export interface WorkOrder {
  id: number
  title: string
  status: string
  priority: string
  assigned_to: string | null
}

export interface WorkOrderCreate {
  title: string
  status: string
  priority: string
  assigned_to?: string
}
```

**Walkthrough:**

`export interface WorkOrder` — `export` makes this interface available to other files via `import`. An `interface` in TypeScript is a compile-time-only type definition for an object shape. It describes what properties an object has and their types.

`id: number` — a required property. TypeScript's `number` corresponds to Python's `int` (and `float`). The JSON response from FastAPI contains `"id": 1` — a JSON number, which JavaScript parses as a `number`.

`assigned_to: string | null` — a **union type**. The value is either a `string` or `null`. This mirrors Pydantic's `Optional[str]` — FastAPI serialises `None` as `null` in JSON.

`WorkOrderCreate` mirrors the Pydantic `WorkOrderCreate` model. `assigned_to?: string` — the `?` makes a property optional in a TypeScript interface. It means the property may be absent (not just null). This is slightly different from the Python side (`Optional[str] = None` means absent-or-null), but both result in the same JSON: the field is either a string or absent/null.

**CS lens — types as cross-language contracts.** You now have the same data contract expressed in two languages: `WorkOrder` in Python (Pydantic) and `WorkOrder` in TypeScript (interface). They are not automatically in sync — if you add a field to the Pydantic model, you must also add it to the TypeScript interface. In larger projects, tools like `openapi-typescript` generate TypeScript types from the FastAPI OpenAPI schema automatically, eliminating this manual step. For this curriculum, you maintain both manually to understand the relationship.

**SE lens — types as the first thing you write.** Defining the TypeScript interface before writing components is not just organisation — it is a design decision. The interface is a claim about what the API returns. If the claim is wrong, TypeScript will show errors at every place you use the type. Writing the type first means you catch mismatches when you write the code that uses the data, not when you run it.

**What breaks without this:** Without the interface, every variable holding work order data has type `any` — TypeScript cannot check it. You can access `order.nonexistentField` without a compile error. Runtime errors become the only signal that the data shape was wrong.

---

### 2. Build the `WorkOrderList` component

**The problem:** Display all work orders in a table. Each row is clickable and calls a function provided by the parent.

Create `frontend/src/components/WorkOrderList.tsx`:

```typescript
import { WorkOrder } from '../types'

interface WorkOrderListProps {
  orders: WorkOrder[]
  onSelect: (order: WorkOrder) => void
}

function WorkOrderList({ orders, onSelect }: WorkOrderListProps) {
  if (orders.length === 0) {
    return <p>No work orders yet.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id} onClick={() => onSelect(order)} style={{ cursor: 'pointer' }}>
            <td>{order.id}</td>
            <td>{order.title}</td>
            <td>{order.status}</td>
            <td>{order.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default WorkOrderList
```

**Walkthrough:**

`import { WorkOrder } from '../types'` — imports the `WorkOrder` interface from `types.ts`. The path `'../types'` means: go up one level from `src/components/` to `src/`, then find `types.ts`. Vite resolves this relative path.

`interface WorkOrderListProps` — defines the **props** of this component. Props are the arguments a component receives from its parent. `orders: WorkOrder[]` means the parent must pass an array of `WorkOrder` objects. `onSelect: (order: WorkOrder) => void` means the parent must pass a function that accepts a `WorkOrder` and returns nothing.

`{ orders, onSelect }: WorkOrderListProps` — **destructuring** the props object in the function parameter. Instead of writing `props.orders` and `props.onSelect`, you extract the values directly. The `: WorkOrderListProps` annotation tells TypeScript the type of the incoming props object.

`orders.map(order => ...)` — `Array.prototype.map` transforms an array. For each `order` in `orders`, the arrow function returns a `<tr>` JSX element. The result is an array of `<tr>` elements, which JSX renders as table rows. This is the standard pattern for rendering lists in React — you cannot use a `for` loop directly inside JSX because JSX expects expressions, not statements.

`key={order.id}` — the **key prop** is required when rendering a list with `.map()`. React uses `key` to track which items in the list are which between renders. Without `key`, React cannot tell whether an item was added, removed, or reordered — it would re-render every row on every update, even if only one row changed. The key must be unique within the list. The work order's `id` is unique, so it is the correct key.

`onClick={() => onSelect(order)}` — attaches a click handler to each row. When clicked, the handler calls `onSelect(order)` — the function passed in by the parent. The parent decides what to do when a row is selected. The list component does not know or care.

`style={{ cursor: 'pointer' }}` — inline style in JSX. The outer `{}` switch from JSX to JavaScript; the inner `{}` is a JavaScript object. CSS properties use camelCase in JSX: `cursor` not `cursor`, `backgroundColor` not `background-color`.

**CS lens — the key as a stable identifier.** React's reconciliation algorithm uses `key` to match old and new virtual DOM nodes. Without a stable key, React uses position — the first rendered `<tr>` is matched to the first item in the new render. If an item is inserted at the beginning of the list, every subsequent row appears "changed" because its position shifted. With a stable key (the item's ID), React can correctly identify which row is which regardless of position.

**SE lens — props as the component's public API.** `WorkOrderListProps` is the public API of `WorkOrderList`. Anything not in props is an implementation detail — the parent cannot access it. This is **encapsulation**: the list component owns how it renders rows; the parent owns what data it receives and what happens when a row is clicked. Separating concerns this way makes both the list component and the parent simpler.

**What breaks without this:** If you use the array index as a key (`key={index}`), React renders correctly on initial load but behaves incorrectly when items are deleted or reordered — it matches the wrong old item to the new item, causing stale state. Always use a stable, unique identifier as the key.

---

### 3. Build the `WorkOrderDetail` component

**The problem:** When a row is clicked, display that order's full details.

Create `frontend/src/components/WorkOrderDetail.tsx`:

```typescript
import { WorkOrder } from '../types'

interface WorkOrderDetailProps {
  order: WorkOrder
  onBack: () => void
}

function WorkOrderDetail({ order, onBack }: WorkOrderDetailProps) {
  return (
    <div>
      <button onClick={onBack}>← Back to list</button>
      <h2>Order #{order.id}</h2>
      <p><strong>Title:</strong> {order.title}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Priority:</strong> {order.priority}</p>
      <p><strong>Assigned to:</strong> {order.assigned_to ?? 'Unassigned'}</p>
    </div>
  )
}

export default WorkOrderDetail
```

**Walkthrough:**

`onBack: () => void` — a function prop that takes no arguments and returns nothing. Calling `onBack()` tells the parent "go back to the list." The parent decides what "go back" means — it could change state, navigate to a different URL, close a modal. The detail component does not know or care.

`order.assigned_to ?? 'Unassigned'` — the **nullish coalescing operator**. `??` returns the left side if it is not `null` or `undefined`; otherwise it returns the right side. `order.assigned_to ?? 'Unassigned'` returns `order.assigned_to` if it is a non-null string, or `'Unassigned'` if it is `null` or `undefined`. This is the correct operator for defaulting null values. The alternative, `||`, returns the right side for any falsy value — including empty string (`""`). `order.assigned_to || 'Unassigned'` would incorrectly replace an empty string assignment with `'Unassigned'`. Use `??` when you specifically want to handle `null`/`undefined`, not all falsy values.

**CS lens — `??` vs `||` as precision in falsy handling.** JavaScript has two kinds of "nothing": `null`/`undefined` (explicit absence) and falsy-but-present values (`""`, `0`, `false`). `||` coalesces all falsy values; `??` coalesces only `null` and `undefined`. Using `||` where `??` is correct is a category of bugs: `0 || 'default'` returns `'default'`, hiding the fact that the value was `0`. For data fields that might be `null`, use `??`. For fallback logic that treats all falsy values as absent, use `||`.

---

### 4. Build the `CreateOrderForm` component

**The problem:** The user needs to create new work orders. A form collects the data; a submit handler sends it to the API.

Create `frontend/src/components/CreateOrderForm.tsx`:

```typescript
import { useState } from 'react'
import { WorkOrder, WorkOrderCreate } from '../types'

interface CreateOrderFormProps {
  onCreated: (order: WorkOrder) => void
}

function CreateOrderForm({ onCreated }: CreateOrderFormProps) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('open')
  const [priority, setPriority] = useState('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const newOrder: WorkOrderCreate = { title, status, priority }

    try {
      const response = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail ?? 'Failed to create order')
      }

      const created: WorkOrder = await response.json()
      onCreated(created)
      setTitle('')
      setStatus('open')
      setPriority('medium')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Order</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={event => setTitle(event.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div>
        <label htmlFor="priority">Priority</label>
        <select id="priority" value={priority} onChange={event => setPriority(event.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Order'}
      </button>
    </form>
  )
}

export default CreateOrderForm
```

**Walkthrough:**

**Controlled inputs.** Each `<input>` and `<select>` has `value={...}` and `onChange={...}`. This is a **controlled input** — React owns the value. The displayed value is always the state variable (`title`, `status`, `priority`). When the user types, `onChange` fires, calls the state setter, React re-renders, and the new value appears. Without the `onChange` handler, the input would be read-only — the `value` prop would lock it to the initial state value and ignore typing.

**Uncontrolled input** (for contrast) has no `value` prop — the DOM owns the value and you read it with `ref.current.value`. Controlled inputs are preferred in React because state is the single source of truth: the displayed value and the stored value are always the same.

`event.preventDefault()` — called at the top of `handleSubmit`. HTML forms, when submitted, reload the page by default — the browser sends an HTTP POST to the page URL. `event.preventDefault()` cancels this default behaviour. Without it, the page would reload every time the form is submitted, clearing the React state and losing the fetched data.

`event: React.FormEvent` — the type of the event object passed to `onSubmit` handlers. TypeScript requires this annotation because the `event` argument is typed — it has properties like `preventDefault()`, `target`, and `currentTarget`. `React.FormEvent` is the correct type for form submission events.

`'Content-Type': 'application/json'` — an HTTP request header. This tells FastAPI "the body of this request is JSON." Without this header, FastAPI may not parse the body correctly and returns 422. The header is required for every POST and PUT request with a JSON body.

`JSON.stringify(newOrder)` — converts the JavaScript object `newOrder` to a JSON string. `{ title: "Fix belt", status: "open", priority: "high" }` becomes `'{"title":"Fix belt","status":"open","priority":"high"}'`. HTTP request bodies are strings (or binary data); JavaScript objects must be serialised before sending.

`if (!response.ok)` — `response.ok` is a boolean property on the Fetch Response object. It is `true` for status codes 200–299 and `false` for all others. Checking `!response.ok` after a POST catches 422 (validation error), 400 (bad request), 500 (server error), and any other non-success status. Without this check, a 422 response would be treated as success.

`throw new Error(errorData.detail ?? 'Failed to create order')` — converts the FastAPI error response into a JavaScript `Error` object that the `catch` block can handle. `errorData.detail` is the `"detail"` field from FastAPI's error JSON.

`onCreated(created)` — calls the parent's callback with the newly created `WorkOrder`. The parent will add it to the list.

`{error && <p style={{ color: 'red' }}>{error}</p>}` — **short-circuit conditional rendering**. `&&` in JavaScript evaluates both sides and returns the last truthy value if all are truthy, or the first falsy value. If `error` is `null` (falsy), the expression short-circuits to `null`, and React renders nothing. If `error` is a string (truthy), the expression evaluates the JSX and React renders the error paragraph.

**CS lens — the controlled input as a state machine.** A controlled input is a two-node state machine: "user types character" → "onChange fires" → "setTitle called" → "React re-renders" → "input displays new value." The React state is the authoritative source; the DOM input is a rendering of that state. This is the same relationship as a read-only view over a database: the database is authoritative, the view derives from it.

**SE lens — form state as ephemeral state.** The form's `title`, `status`, and `priority` values are **ephemeral state** — they matter only while the form is visible and are discarded after submission. Storing them in `useState` inside the form component (not in a global store) is correct because their scope is this component. If you stored form state globally, it would persist across navigations and interfere with other parts of the UI.

**Security lens — XSS via user input.** The form accepts user input (`title`) and displays it in the UI. React's JSX renderer automatically escapes text content — `{order.title}` renders as plain text, never as HTML. A work order title of `<script>alert('XSS')</script>` displays the literal string on screen; the `<script>` tag is never parsed as HTML. This is why `{value}` in JSX is safe: React uses `textContent` assignment internally, which treats content as text. The unsafe equivalent — `dangerouslySetInnerHTML={{ __html: value }}` — does parse HTML and should never be used with user input.

**What breaks without this:** If you omit `event.preventDefault()`, the form submit reloads the page. The fetch call fires but the page reloads before the response arrives, clearing all state and appearing to do nothing.

---

### 5. Assemble everything in `App.tsx`

**The problem:** You have three components. `App` must wire them together: fetch the list on load, show either the list or the detail view, pass the create callback.

Replace `frontend/src/App.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { WorkOrder } from './types'
import WorkOrderList from './components/WorkOrderList'
import WorkOrderDetail from './components/WorkOrderDetail'
import CreateOrderForm from './components/CreateOrderForm'

function App() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch('http://localhost:8000/orders')
        if (!response.ok) throw new Error('Failed to load orders')
        const data: WorkOrder[] = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  function handleOrderCreated(newOrder: WorkOrder) {
    setOrders(currentOrders => [...currentOrders, newOrder])
  }

  function handleOrderSelected(order: WorkOrder) {
    setSelectedOrder(order)
  }

  function handleBack() {
    setSelectedOrder(null)
  }

  if (isLoading) return <div>Loading work orders...</div>
  if (error) return <div>Error: {error}</div>

  if (selectedOrder) {
    return <WorkOrderDetail order={selectedOrder} onBack={handleBack} />
  }

  return (
    <div>
      <h1>Work Orders</h1>
      <WorkOrderList orders={orders} onSelect={handleOrderSelected} />
      <hr />
      <CreateOrderForm onCreated={handleOrderCreated} />
    </div>
  )
}

export default App
```

**Walkthrough:**

`selectedOrder: WorkOrder | null` — the currently selected order, or `null` if no order is selected (list view). This single state variable controls whether the app shows the list or the detail view.

`setOrders(currentOrders => [...currentOrders, newOrder])` — the **functional update form** of `setOrders`. Instead of `setOrders([...orders, newOrder])`, which captures the `orders` value at the time the function was defined (a stale closure risk), the functional form receives the current state value as its argument. This is correct when the new state depends on the previous state.

`[...currentOrders, newOrder]` — the **spread operator** creates a new array. `...currentOrders` expands all existing orders into the new array; `newOrder` appends the new item. The original `currentOrders` array is not mutated — React requires immutable state updates (you create a new array rather than calling `.push()` on the existing one) because React uses object identity to detect changes.

`if (selectedOrder)` — if a non-null order is selected, render the detail view. React renders `WorkOrderDetail` with the selected order as a prop. When `handleBack` calls `setSelectedOrder(null)`, `selectedOrder` becomes `null`, this condition is false, and React renders the list view instead. This is **conditional rendering based on state** — the component renders different UI depending on the current state.

**CS lens — state as the UI's single source of truth.** Every visible difference in the UI — loading spinner vs. list vs. detail — corresponds to a different state configuration. The React model: state is the source of truth; JSX is a pure function of state. Given the same state, the component always renders the same UI. This makes the UI predictable: you do not need to trace imperative mutations ("show the spinner, then hide it") — you trace state changes ("isLoading was true, then false").

**SE lens — lifting state.** `selectedOrder` lives in `App`, not in `WorkOrderList`. This is called **lifting state** — moving shared state to the nearest common ancestor of the components that need it. `WorkOrderList` triggers state change via the `onSelect` callback; `App` owns the state change. If both components needed the state, it would live in their shared parent. The rule: state lives at the lowest ancestor that all components needing it share.

**What breaks without this:** If you use `setOrders([...orders, newOrder])` instead of `setOrders(current => [...current, newOrder])` in `handleOrderCreated`, and two orders are created in quick succession before the first state update renders, the second creation might capture a stale `orders` value and overwrite the first. The functional update form prevents this by always receiving the latest state.

---

## Connect the pieces

The UI now covers the full read/create cycle. Users can see all work orders, click to view detail, and create new ones. The `orders` state in `App` is the single source of truth for the displayed list — when a new order is created, it is appended to the state, and React re-renders the list. No page reload, no refetch.

In Sprint 3, the in-memory list on the server is replaced by a Postgres database. The React code does not change — it still calls the same endpoints, receives the same JSON, and renders the same UI. The persistence layer is completely hidden behind the HTTP API.

---

## What breaks without this

**Clicking a row does nothing:** The `onClick` on `<tr>` calls `onSelect(order)`, which calls `handleOrderSelected` in `App`, which calls `setSelectedOrder(order)`. If any of these are missing or misconnected — wrong prop name, wrong function reference — the click appears to do nothing. Check the React DevTools to verify that `onSelect` is the correct function.

**New order appears in list but detail is out of date:** After creating an order and clicking it, the detail shows the `WorkOrderCreate` data, not the `WorkOrder` data with the assigned ID. This means `handleOrderCreated` received the wrong type. Verify that `CreateOrderForm` calls `onCreated(created)` where `created` is the parsed response from the POST endpoint — the `WorkOrder` with an `id`.

---

## Definition of done

- [ ] `http://localhost:5173` shows a list of work orders fetched from FastAPI
- [ ] Clicking a row shows the detail view with a back button
- [ ] Submitting the create form adds a new order to the list without a page reload
- [ ] The new order's `id` is assigned by the server, not the client
- [ ] You can explain what a controlled input is and why `event.preventDefault()` is needed
- [ ] You can explain the `key` prop and what breaks without it
- [ ] You can explain why `setOrders(current => [...current, newOrder])` is preferred over `setOrders([...orders, newOrder])`
- [ ] You can explain how `selectedOrder` controls which view is rendered

**Git commit:**

```
git add frontend/src
git commit -m "Add work orders UI: list, detail, and create form connected to CRUD API"
```

This commit marks the end of Sprint 2. You have a working full-stack application: a React frontend, a FastAPI backend, Pydantic-validated data, and five HTTP endpoints. Everything runs in memory — Sprint 3 persists it.
