---
series: react-fundamentals
level: 3
title: Component Composition and Custom Hooks
lang: javascript
---

# Component Composition and Custom Hooks

React's power comes from composition: small, focused components combined to build complex UIs. Custom hooks extract reusable logic from components. Together, these two patterns keep React code maintainable as applications grow.

This lesson covers the props patterns that enable flexible component design (render props, children, compound components), when and how to lift state up, and how to write custom hooks that encapsulate reusable stateful logic.

## The children prop

Every React component automatically receives a `children` prop containing whatever JSX is placed between its opening and closing tags.

```javascript
// COMPONENT USING children:
function Card({ title, children }) {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <div className="card-body">
        {children}   {/* whatever the parent puts between <Card>...</Card> */}
      </div>
    </div>
  )
}

// USAGE: the Card component doesn't know what's inside it
function App() {
  return (
    <Card title="User Details">
      <p>Name: Alice</p>
      <p>Email: alice@example.com</p>
      <button>Edit Profile</button>
    </Card>
  )
}

// Result: the card wraps its children in consistent styling.
// The Card component is reusable — it doesn't care what's inside.
// This is the "slot" pattern: a component with a designated slot for arbitrary content.
```

```text
CHILDREN vs PROPS:
  Props: data (strings, numbers, objects, functions) — you know the exact content
  Children: arbitrary JSX — the parent decides the content
  
  Use props when the component controls all content.
  Use children when the component provides structure/styling but not content.
  
  EXAMPLES:
    <Button label="Submit" />        — label is a prop (the component knows it's one piece of text)
    <Modal title="Confirm">          — children is the modal body (arbitrary JSX)
      <p>Are you sure?</p>
      <form>...</form>
    </Modal>
    <Layout sidebar={<Sidebar />}>  — sidebar is a prop that happens to be JSX
      <MainContent />               — children is the main content
    </Layout>
```

## Lifting state up

When multiple components need to share state, move the state to their nearest common ancestor.

```javascript
// PROBLEM: two components both need to know the selected tab
function TabButton({ label, selected, onClick }) {
  return (
    <button
      className={selected ? 'tab-active' : 'tab'}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function TabContent({ tab }) {
  const CONTENT = {
    overview: <p>Product overview...</p>,
    specs:    <p>Technical specifications...</p>,
    reviews:  <p>Customer reviews...</p>,
  }
  return CONTENT[tab] ?? null
}

// STATE LIFTED to the parent: both children receive it via props
function ProductTabs() {
  const [selectedTab, setSelectedTab] = useState('overview')
  
  return (
    <div>
      <nav className="tab-nav">
        {['overview', 'specs', 'reviews'].map(tab => (
          <TabButton
            key={tab}
            label={tab}
            selected={selectedTab === tab}
            onClick={() => setSelectedTab(tab)}
          />
        ))}
      </nav>
      <TabContent tab={selectedTab} />
    </div>
  )
}
```

```text
THE RULE FOR LIFTING STATE:
  State belongs in the LOWEST common ancestor of all components that need it.
  
  NOT: lift everything to the top-level App component.
         That creates a massive component with all state, and every update
         re-renders the entire tree.
  
  YES: find the lowest ancestor that parents all components that share the state.
  
  EXAMPLE:
    App
    ├── Header (needs isLoggedIn for user avatar)
    │   └── UserAvatar
    └── Page
        ├── ProductList (needs cart item count for badge)
        └── CartSidebar (needs cartItems for display)
  
  isLoggedIn: lowest common ancestor is App (Header and Page are siblings under App)
  cartItems: lowest common ancestor is Page (ProductList and CartSidebar are siblings under Page)
  
  Lifting too high: isLoggedIn and cartItems both at App → App re-renders for all changes
  Lifting just right: cartItems at Page → only Page and its children re-render on cart changes
```

**CS lens:** Lifting state is an application of the **single source of truth** principle to component state. When the same data (selected tab, cart items, logged-in user) lives in multiple places, they can diverge. Diverged state is a bug: one component shows "logged in", another shows "logged out". The single source of truth principle says: each piece of data lives in exactly one place. Every component that needs it reads from that one place. Updates go to that one place, which propagates down to all consumers via props.

## Custom hooks

A custom hook is a function whose name starts with `use` and that calls other hooks. Custom hooks extract reusable stateful logic from components.

```javascript
// CUSTOM HOOK: encapsulates data-fetching logic
function useFetch(url) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => { if (!cancelled) { setData(data); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false) } })
    
    return () => { cancelled = true }
  }, [url])
  
  return { data, loading, error }
}

// USAGE: components use the hook without knowing the implementation
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`)
  
  if (loading) return <Spinner />
  if (error)   return <ErrorMessage message={error} />
  return <div><h2>{user.name}</h2><p>{user.email}</p></div>
}

function OrderList({ userId }) {
  const { data: orders, loading } = useFetch(`/api/users/${userId}/orders`)
  
  if (loading) return <Spinner />
  return <ul>{orders?.map(o => <li key={o.id}>{o.total}</li>)}</ul>
}
```

```javascript
// MORE CUSTOM HOOKS:

// useLocalStorage: persists state in localStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    // Lazy initialiser: reads from localStorage only on first render
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })
  
  function set(newValue) {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }
  
  return [value, set]
}

// Usage: const [theme, setTheme] = useLocalStorage('theme', 'light')

// useDebounce: delays a value update
function useDebounce(value, delayMs) {
  const [debounced, setDebounced] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  
  return debounced
}

// Usage:
// const debouncedQuery = useDebounce(searchQuery, 300)
// useEffect(() => { fetch('/search?q=' + debouncedQuery) }, [debouncedQuery])
```

```text
CUSTOM HOOK RULES:
  ✓ Name must start with 'use' (React's rule — enables hook usage inside)
  ✓ Can call other hooks (useState, useEffect, other custom hooks)
  ✓ Returns any value: primitive, object, array, function
  ✓ Each component that calls the hook gets its own independent state
  
  WHEN TO EXTRACT A CUSTOM HOOK:
    → Same useState + useEffect logic appears in 2+ components
    → Logic is complex enough to benefit from a name and tests
    → The logic has nothing to do with the component's rendering

  WHEN NOT TO EXTRACT:
    → Logic is used in only one place and isn't complex
    → The logic is tightly coupled to the component's specific JSX
```

**SE lens:** Custom hooks enforce the **separation of concerns** principle within a component: the hook handles the "how" (fetch timing, cleanup, error handling) while the component handles the "what to show" (loading spinner, error message, user profile). This separation makes both independently testable: the hook is tested by calling it with different URLs and checking the returned state; the component is tested by passing different `{ data, loading, error }` values. Neither needs to test the other's concern.

**Common mistakes:**
- Calling a custom hook conditionally — `if (userId) useFetch('/api/users/' + userId)` violates the rules of hooks. Hooks must always be called in the same order. Instead, pass the condition into the hook: `const { data } = useFetch(userId ? '/api/users/' + userId : null)` and handle null inside the hook.
- Returning too much from a custom hook — if a hook returns 10 values, it's doing too much. Split it into smaller hooks, each doing one thing.
- Not memoising expensive hook return values — if a hook returns a function, use `useCallback`; if it returns a computed value, use `useMemo`. Without memoisation, every re-render creates a new function or object reference, causing children that depend on it to re-render unnecessarily.

**Debug tip:** Custom hooks can be debugged in React DevTools → Components → find the component using the hook → look in the "hooks" section. Each hook call is listed with its current value. If `useFetch` shows `loading: true` but no data arrives, check the Network tab — the request may be failing, or the component may have unmounted and the cleanup may have set `cancelled = true` too early.

## Challenge: useFormState

Implement a reusable form state manager hook.

```challenge
function createFormState(fields) {
  // fields: { [fieldName]: initialValue }
  // Simulates a useFormState custom hook (without React — pure state logic)
  //
  // Returns:
  //   .values          → current { [fieldName]: value } object
  //   .errors          → current { [fieldName]: errorMessage | null } object
  //   .isDirty         → boolean: true if any field differs from initialValue
  //   .setValue(field, value) → updates the field value
  //   .setError(field, msg)   → sets an error message for a field (or null to clear)
  //   .reset()                → restores all values to initialValues, clears all errors
  //   .getField(field)        → { value, error, isDirty } for one field
  //     isDirty for a field: true if current value !== initialValue
}
```

```test
const form = createFormState({ name: '', email: '', age: '0' })

// Initial state
assert form.values.name === ''
assert form.values.email === ''
assert form.isDirty === false

// Set a value
form.setValue('name', 'Alice')
assert form.values.name === 'Alice'
assert form.isDirty === true

// Field-level dirty
const nameField = form.getField('name')
assert nameField.value === 'Alice'
assert nameField.isDirty === true

const emailField = form.getField('email')
assert emailField.isDirty === false   // email not changed

// Set error
form.setError('email', 'Email is required')
assert form.errors.email === 'Email is required'

// Clear error
form.setError('email', null)
assert form.errors.email === null

// Reset
form.setValue('email', 'alice@example.com')
form.reset()
assert form.values.name === ''
assert form.values.email === ''
assert form.isDirty === false
```
