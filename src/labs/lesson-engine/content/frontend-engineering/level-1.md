---
series: frontend-engineering
level: 1
title: State Management Patterns
lang: javascript
---

# State Management Patterns

As a frontend application grows, state becomes harder to manage. A simple `const state = {}` object works for a small app. When the app has dozens of components, all reading and writing different parts of state, you need patterns that make state changes predictable, traceable, and testable.

Three patterns scale from small to large: local state (per-component), shared store (one shared state object), and the reducer pattern (state transitions as pure functions). By the end of this lesson you will understand when to use each and how to implement the store + reducer pattern that powers Redux, Vuex, and React's `useReducer`.

## Local state: the simplest case

```javascript
// LOCAL STATE: state owned by a single component
function createCounter(container) {
  let count = 0   // local state — not shared with anything

  function render() {
    container.innerHTML = `
      <span>${count}</span>
      <button id="dec">-</button>
      <button id="inc">+</button>
    `
    container.querySelector('#inc').onclick = () => { count++; render() }
    container.querySelector('#dec').onclick = () => { count--; render() }
  }

  render()
}

// Use local state when:
//   → Only one component needs this data
//   → No other part of the app cares about this state
// Do NOT use local state when:
//   → Multiple components need the same data
//   → The data needs to survive the component being destroyed
//   → You need to debug or log state changes across the app
```

## Shared store: a single source of truth

```javascript
// SHARED STORE: one object holds all application state
function createStore(initialState) {
  let state = { ...initialState }
  const subscribers = []

  return {
    getState() {
      return state
    },

    setState(updater) {
      const newState = typeof updater === 'function'
        ? updater(state)
        : { ...state, ...updater }

      if (newState !== state) {
        state = newState
        subscribers.forEach(fn => fn(state))
      }
    },

    subscribe(fn) {
      subscribers.push(fn)
      return () => {
        const i = subscribers.indexOf(fn)
        if (i > -1) subscribers.splice(i, 1)
      }
    }
  }
}

// Usage:
const store = createStore({ count: 0, user: null, items: [] })

// Components subscribe to state changes
store.subscribe((state) => {
  document.getElementById('count').textContent = state.count
})

// Event handlers update state
document.getElementById('increment').onclick = () => {
  store.setState(s => ({ ...s, count: s.count + 1 }))
}
```

```text
SHARED STORE RULES:
  → State is READ-ONLY from outside the store
    Components call store.getState() — they never modify state directly
  → State is updated through store.setState() — one centralised update path
  → Components subscribe to state changes and re-render themselves
  → The store notifies all subscribers on every state change

  BENEFITS:
  → Any component can read any part of state
  → State changes are traceable (you can log every setState call)
  → Components are decoupled from each other (talk to the store, not each other)
  → State can be serialised (for debugging, persistence, undo/redo)
```

## The reducer pattern

The reducer pattern makes state transitions explicit: instead of arbitrary state mutations, all changes go through a reducer — a pure function that takes `(state, action) → newState`.

```javascript
// REDUCER: a pure function that describes all possible state transitions
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1 }]
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id)
      }

    case 'APPLY_COUPON':
      return { ...state, coupon: action.code }

    case 'CLEAR_CART':
      return { items: [], coupon: null }

    default:
      return state   // unknown action → return state unchanged
  }
}

// STORE WITH REDUCER: dispatch actions instead of direct setState
function createReducerStore(reducer, initialState) {
  let state = initialState
  const subscribers = []

  return {
    getState: () => state,
    dispatch(action) {
      const newState = reducer(state, action)
      if (newState !== state) {
        state = newState
        subscribers.forEach(fn => fn(state))
      }
    },
    subscribe(fn) {
      subscribers.push(fn)
      return () => subscribers.splice(subscribers.indexOf(fn), 1)
    },
  }
}

const cartStore = createReducerStore(cartReducer, { items: [], coupon: null })

// Dispatch actions (not direct mutations):
cartStore.dispatch({ type: 'ADD_ITEM', item: { id: 'w1', name: 'Widget', price: 9.99 } })
cartStore.dispatch({ type: 'APPLY_COUPON', code: 'SAVE10' })
```

**CS lens:** The reducer pattern is the **state machine formalised**: the state is the current state; the action is the input event; the reducer is the transition function. Given any state and any action, the transition function deterministically produces the next state. Because the reducer is a pure function, you can trace every state transition: record every action dispatched, and you can replay them in any order to reproduce any sequence of states. This is how Redux's time-travel debugger works — it replays actions from a log.

## Derived state and selectors

Computing values from state should be done in selectors — pure functions that derive computed values from state.

```javascript
// SELECTORS: pure functions that compute derived state
function selectCartTotal(state) {
  return state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function selectCartItemCount(state) {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
}

function selectDiscountedTotal(state) {
  const total = selectCartTotal(state)
  if (!state.cart.coupon) return total
  const discounts = { SAVE10: 0.10, FLAT20: null }
  // ... apply coupon
  return total
}

// Components use selectors to read derived state:
store.subscribe((state) => {
  document.getElementById('cart-total').textContent =
    `$${selectCartTotal(state).toFixed(2)}`
  document.getElementById('item-count').textContent =
    selectCartItemCount(state)
})
```

```text
SELECTORS SOLVE:
  → Computed values are not duplicated in state (total is not stored; it is derived)
  → Computed values are always consistent with source data
  → Selectors are pure functions → easy to test
  → Selectors can be memoised: if state.cart hasn't changed, selectCartTotal returns
    the cached result immediately (this is how Reselect works in Redux)

  RULE: Do not store derived values in state.
        If total can be computed from items and coupon, it should be computed,
        not stored. Storing it creates two sources of truth and sync bugs.
```

**SE lens:** The selector pattern is the application of the **single source of truth** principle to derived state. If the cart total is computed from items and coupons, and also stored separately in `state.cartTotal`, any bug that updates items without recalculating total creates a stale `cartTotal`. Selectors eliminate this by computing derived values on demand from the authoritative source. Memoised selectors eliminate the performance cost of recomputation when the source data has not changed.

**Common mistakes:**
- Putting derived values in state — `state.total = items.reduce(...)` — when items change, total must be manually updated. Easy to forget, causes subtle bugs. Use selectors instead.
- Deeply nested state mutation — `state.user.profile.settings.theme = 'dark'` — mutates state in place. The store's subscribers won't see the change (reference equality check fails). Always create new objects: `{ ...state, user: { ...state.user, profile: { ...state.user.profile, settings: { ...state.user.profile.settings, theme: 'dark' } } } }`. Or use immer for ergonomic immutable updates.
- Too much in one store — one global store for a large app with hundreds of state fields becomes hard to reason about. Split by domain: cartStore, userStore, catalogStore.

**Debug tip:** Add an action logger to the store: every dispatched action and the resulting state is logged to the console. `console.log('[action]', action.type, '→', newState)`. This makes state transitions visible and makes it trivial to find the action that caused unexpected state. In production: structured logging of action types (not full payloads — they may contain PII) to your monitoring system.

## Challenge: reducer_store

Implement a todo list with a reducer-based store.

```challenge
function createTodoReducer() {
  // Returns a reducer function: (state, action) → newState
  // Initial state: { todos: [], nextId: 1, filter: 'all' }
  //
  // Actions:
  //   { type: 'ADD_TODO', text: string }
  //     → adds { id, text, done: false } to todos, increments nextId
  //   { type: 'TOGGLE_TODO', id: number }
  //     → toggles the done state of the todo with the given id
  //   { type: 'DELETE_TODO', id: number }
  //     → removes the todo with the given id
  //   { type: 'SET_FILTER', filter: 'all' | 'active' | 'done' }
  //     → sets the filter
  //   Unknown actions → return state unchanged
}

function selectVisibleTodos(state) {
  // Returns todos based on state.filter:
  //   'all':    all todos
  //   'active': todos where done === false
  //   'done':   todos where done === true
}
```

```test
const reducer = createTodoReducer()
const INIT = { todos: [], nextId: 1, filter: 'all' }

let state = INIT

state = reducer(state, { type: 'ADD_TODO', text: 'Buy milk' })
assert state.todos.length === 1
assert state.todos[0].text === 'Buy milk'
assert state.todos[0].done === false
assert state.todos[0].id === 1
assert state.nextId === 2

state = reducer(state, { type: 'ADD_TODO', text: 'Read book' })
state = reducer(state, { type: 'TOGGLE_TODO', id: 1 })
assert state.todos[0].done === true

state = reducer(state, { type: 'SET_FILTER', filter: 'active' })
const visible = selectVisibleTodos(state)
assert visible.length === 1
assert visible[0].text === 'Read book'

state = reducer(state, { type: 'DELETE_TODO', id: 2 })
assert state.todos.length === 1

// Unknown action → unchanged
const same = reducer(state, { type: 'UNKNOWN' })
assert same === state   // same reference (no change)
```
