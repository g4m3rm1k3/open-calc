---
series: frontend-engineering
level: 3
title: Frontend Engineering — Putting It Together
lang: javascript
---

# Frontend Engineering — Putting It Together

The three concepts you have learned — the state/render/event model and component thinking, state management patterns (local state, shared store, reducer), and accessibility — are the foundation of professional frontend engineering. This capstone lesson integrates them by building a complete, accessible, state-managed interactive component: a filterable product list.

## The design

```text
COMPONENT: FilterableProductList
  STATE:
    products: Product[]     (loaded from API)
    filter:   string        (current search term)
    loading:  boolean       (while fetching)
    error:    string | null (fetch error)

  ACTIONS:
    SET_FILTER(text)    → update filter, recompute visible list
    LOAD_PRODUCTS       → set loading: true
    PRODUCTS_LOADED(ps) → set products, loading: false
    LOAD_ERROR(msg)     → set error, loading: false

  DERIVED STATE:
    visibleProducts: products that match the filter

  DOM:
    search input (accessible label, aria-live on results count)
    product list (role="list", each item role="listitem")
    loading indicator (aria-live="polite")
    error message (role="alert")
```

## The reducer

```javascript
const initialState = {
  products: [],
  filter: '',
  loading: false,
  error: null,
}

function productListReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filter: action.text }

    case 'LOAD_PRODUCTS':
      return { ...state, loading: true, error: null }

    case 'PRODUCTS_LOADED':
      return { ...state, products: action.products, loading: false }

    case 'LOAD_ERROR':
      return { ...state, error: action.message, loading: false }

    default:
      return state
  }
}

// Selector: compute visible products from state
function selectVisibleProducts(state) {
  const term = state.filter.toLowerCase().trim()
  if (!term) return state.products
  return state.products.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term)
  )
}
```

## The component

```javascript
function createProductList(container, fetchProducts) {
  const store = createReducerStore(productListReducer, initialState)

  // Render: derive the DOM from state
  function render(state) {
    const visible = selectVisibleProducts(state)

    container.innerHTML = `
      <div class="search-area">
        <label for="product-search">Search products</label>
        <input
          type="search"
          id="product-search"
          value="${escapeHtml(state.filter)}"
          placeholder="Search by name or category"
          aria-controls="product-results"
        >
        <span aria-live="polite" id="results-count" aria-atomic="true">
          ${state.loading ? 'Loading...' : `${visible.length} product${visible.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      ${state.error
        ? `<div role="alert" class="error">${escapeHtml(state.error)}</div>`
        : ''
      }

      <ul id="product-results" role="list" aria-label="Products">
        ${visible.map(p => `
          <li role="listitem" class="product-card">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="category">${escapeHtml(p.category)}</p>
            <p class="price">$${p.price.toFixed(2)}</p>
          </li>
        `).join('')}
      </ul>
    `

    // Re-attach event listeners after innerHTML replacement
    const input = container.querySelector('#product-search')
    if (input) {
      input.addEventListener('input', (e) => {
        store.dispatch({ type: 'SET_FILTER', text: e.target.value })
      })
      // Keep focus on the input if it was focused before render:
      if (document.activeElement?.id === 'product-search') {
        input.focus()
      }
    }
  }

  // Subscribe to state changes → re-render
  store.subscribe(render)

  // Initial load
  async function load() {
    store.dispatch({ type: 'LOAD_PRODUCTS' })
    try {
      const products = await fetchProducts()
      store.dispatch({ type: 'PRODUCTS_LOADED', products })
    } catch (err) {
      store.dispatch({ type: 'LOAD_ERROR', message: err.message })
    }
  }

  // Initial render with loading state
  render(store.getState())
  load()

  return {
    getState: () => store.getState(),
    setFilter: (text) => store.dispatch({ type: 'SET_FILTER', text }),
    reload: load,
  }
}
```

## Accessibility decisions explained

```text
<label for="product-search">:
  Every input has a visible label. Placeholder alone is insufficient.
  Users of screen readers hear "Search products, edit text" when they focus the input.

aria-controls="product-results":
  The search input announces that it controls the results list.
  Screen readers: "Search products, edit text, controls product-results list"

aria-live="polite" on results count:
  When the filter changes and the count updates, screen readers announce:
  "5 products" (politely — waits until the user is quiet).
  Without aria-live: screen reader users don't know the results changed.

aria-atomic="true":
  The entire results count string is announced as one unit.
  Without it: only the changed characters are announced ("5" instead of "5 products").

role="alert" on the error:
  Alerts are announced immediately (equivalent to aria-live="assertive").
  Error messages need to be announced immediately — they are urgent.

role="list" + role="listitem":
  Removes the default list bullet styling without losing the semantic list role.
  (CSS `list-style: none` on <ul> sometimes removes list semantics in some browsers.
  Adding role="list" ensures screen readers still announce it as a list.)
```

**CS lens:** The render function demonstrates the **unidirectional data flow** pattern: state → render → events → dispatch → new state → render. This is the same as the MVC loop, made explicit: all state flows in one direction through the reducer, all DOM updates are derived from state, all user interactions dispatch actions. This makes the data flow auditable: you can trace any DOM change back to the action that caused it.

**SE lens:** The key engineering decision in this component is innerHTML replacement vs. targeted DOM updates. innerHTML is simpler to write and understand; it becomes a problem when there are many items or when DOM state must be preserved (scroll position, text input focus, animations). The focus restoration hack (`if (document.activeElement?.id === 'product-search') input.focus()`) is a code smell — it signals that innerHTML replacement is the wrong model for a component with user input. In a production app, this would use targeted updates or a virtual DOM. For a lesson, innerHTML shows the pattern clearly.

**Common mistakes in frontend state management:**
- Conflating UI state with domain state — loading/error/filter are UI state (how the app is displaying); products are domain state (the actual data). Keep them separate: different concerns, different lifetimes, different sources of truth.
- Updating state from inside the render function — `store.dispatch()` inside `render()` creates an infinite loop. The render function should be a pure view of state; it should not trigger state transitions.
- Not cleaning up subscriptions — `store.subscribe(render)` creates a subscriber. If the component is destroyed without calling the unsubscribe function, the render function is still called on every state change, updating a detached DOM tree.

## Challenge: product_reducer

Implement the product list reducer and selector.

```challenge
function createProductListReducer() {
  // Returns a reducer: (state, action) → newState
  // Initial state: { products: [], filter: '', loading: false, error: null }
  // Actions: SET_FILTER, LOAD_PRODUCTS, PRODUCTS_LOADED, LOAD_ERROR (as described above)
}

function selectVisibleProducts(state) {
  // Filters state.products by state.filter (case-insensitive, checks name and category)
  // Returns all products if filter is empty
}
```

```test
const reducer = createProductListReducer()
let s = { products: [], filter: '', loading: false, error: null }

s = reducer(s, { type: 'LOAD_PRODUCTS' })
assert s.loading === true && s.error === null

s = reducer(s, { type: 'PRODUCTS_LOADED', products: [
  { id: 1, name: 'Widget', category: 'tools', price: 9.99 },
  { id: 2, name: 'Gadget', category: 'tech',  price: 24.99 },
]})
assert s.loading === false && s.products.length === 2

s = reducer(s, { type: 'SET_FILTER', text: 'tool' })
assert selectVisibleProducts(s).length === 1 && selectVisibleProducts(s)[0].name === 'Widget'

s = reducer(s, { type: 'LOAD_ERROR', message: 'Network failure' })
assert s.error === 'Network failure' && s.loading === false

// Unknown action → unchanged, same reference
assert reducer(s, { type: 'NOOP' }) === s
```
