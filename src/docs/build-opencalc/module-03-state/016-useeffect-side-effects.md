# 016 — useEffect: Side Effects

*What side effects are, why they need special handling in React, and persisting state to localStorage*

---

## What You Will Build

You will add two side effects to the calculator:
1. Persist the calculation history to `localStorage` — when the page reloads, history is restored
2. Set the browser tab title to show the current expression while the user types

Both demonstrate the same concept: code that runs after a render and interacts with something outside the React component tree.

---

## What You Need to Know First

Lesson 015 — Lifting State. The calculator has `history` state in `Calculator`.

Lesson 014 — useState. You understand the render cycle.

---

## The Lesson

### What a side effect is

From lesson 009: a pure function has no side effects. A React component, in its ideal form, is a pure function of its props and state — given the same inputs, it returns the same JSX.

A **side effect** is anything a function does that affects the world outside its return value:
- Writing to `localStorage` or a database
- Fetching data from a server
- Setting `document.title`
- Starting a timer (`setTimeout`, `setInterval`)
- Adding a DOM event listener
- Logging to the console (technically a side effect)
- Subscribing to a WebSocket

These are not inherently bad — side effects are necessary for useful programs. But in React's rendering model, they need to be handled carefully.

---

**CS lens — purity and the rendering model:**

React's rendering model assumes components are pure functions. React may call a component function multiple times for a single visible render — in development with `<StrictMode>`, React intentionally double-invokes component functions to catch impure components.

If a side effect (say, a `fetch` call) is performed directly in the component function body:

```javascript
function Calculator() {
  const history = localStorage.getItem('history')  // side effect: reading storage
  fetch('/api/usage')  // side effect: network request
  // ...
}
```

In `<StrictMode>`, this component runs twice per render. Two `fetch` calls are made. Two storage reads happen. The network request fires on every render — including renders caused by state changes the user did not initiate.

`useEffect` solves this by **separating when the effect runs from when the component renders.** The component function always runs to produce JSX (the render). `useEffect` runs after the render, outside the render cycle, at a point where React guarantees it is safe.

---

**SE lens — separating concerns in the component:**

A component has two concerns:
1. **Rendering** — what JSX to produce, given current props and state (the return value)
2. **Effects** — interactions with systems outside the component tree, triggered by state changes

Keeping these separate maintains the pure-function model for rendering while allowing necessary side effects. If rendering and effects are interleaved, testing becomes harder (you cannot test the render output without side effects firing), and the double-invoke protection in `<StrictMode>` becomes meaningless.

---

### useEffect syntax

```javascript
useEffect(() => {
  // side effect code runs here
  
  return () => {
    // cleanup code — runs before the next effect or on unmount
  }
}, [dependency1, dependency2])
```

Three parts:

**The effect function** — the first argument. Runs after every render where one of the dependencies has changed. Can return a cleanup function.

**The dependency array** — the second argument. Controls when the effect runs:
- `[]` — runs once after the first render only. "Did mount" equivalent.
- `[value]` — runs after renders where `value` has changed (including first render).
- `[value1, value2]` — runs after renders where either `value1` or `value2` has changed.
- Omitting the second argument entirely — runs after every render. Rarely the right choice.

**The cleanup function** — returned from the effect function. Runs before the next effect execution and when the component unmounts. Used to cancel subscriptions, clear timers, close connections.

---

**CS lens — the dependency array as a declarative subscription:**

The dependency array is a **declarative** specification of when the effect should run. You declare which values the effect depends on; React determines when those values have changed.

React compares each dependency to its previous value using `Object.is` (strict equality). If any dependency has changed, the effect runs. If all dependencies are the same, the effect is skipped.

This is the same comparison React uses for state: same reference = no re-render. For objects and arrays, "same reference" means the same object in memory. A new array created with `[...prev, item]` is a different reference even if its contents are similar — this triggers the effect. This is correct behaviour: a new array means the data changed.

The most common mistake with `useEffect`: writing an effect that depends on a value but not listing it in the dependency array. The effect runs once (on mount) but never again even when the value changes.

---

### Effect 1 — persist history to localStorage

`localStorage` is a browser API that stores key-value pairs persistently across page reloads. Values are stored as strings.

```javascript
// Writing: JSON.stringify converts the array to a string
localStorage.setItem('calc-history', JSON.stringify(history))

// Reading: JSON.parse converts the string back to an array
const stored = localStorage.getItem('calc-history')
const history = stored ? JSON.parse(stored) : []
```

`JSON.stringify` — converts a JavaScript value (object, array, string, number, boolean, null) to a JSON string. Arrays become `"[{...},{...}]"`. Objects become `"{...}"`. Functions and `undefined` are omitted.

`JSON.parse` — parses a JSON string and returns the JavaScript value it represents. `JSON.parse("[{...}]")` returns an array of objects.

**Storage effect** (add to `Calculator.jsx` after the state declarations):

```javascript
// Persist history to localStorage after every change
useEffect(() => {
  localStorage.setItem('calc-history', JSON.stringify(history))
}, [history])
```

This effect:
- Runs after the first render (initial state) and after every render where `history` changed
- Converts `history` to a JSON string and writes to localStorage
- No cleanup needed — there is nothing to cancel

**Load history on mount** (replace the initial `useState` call):

```javascript
function loadInitialHistory() {
  try {
    const stored = localStorage.getItem('calc-history')
    if (stored === null) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

const [history, setHistory] = useState(loadInitialHistory)
```

`useState(loadInitialHistory)` — the **lazy initial state** form. When the initial value is expensive to compute (reading from localStorage, parsing JSON), pass a function instead of a value. `useState` calls the function only once (on first render) to get the initial value. Passing the function reference (`loadInitialHistory`) instead of calling it (`loadInitialHistory()`) ensures this — if you called it immediately, it would run on every render but be ignored after the first.

`JSON.parse` can throw if the stored string is corrupted. The `try/catch` ensures a malformed localStorage entry does not crash the component. The fallback is an empty array.

`!Array.isArray(parsed)` — guards against a stored value that is valid JSON but not an array (e.g., `null`, a string, a number). If the storage was written by different code, the format might not match.

---

**SE lens — defensive data loading:**

The `loadInitialHistory` function has three layers of defence:
1. `if (stored === null) return []` — nothing stored yet (first visit)
2. `try { ... } catch { return [] }` — invalid JSON (storage corruption)
3. `if (!Array.isArray(parsed)) return []` — valid JSON but wrong shape (data from a different version)

These guards implement the **Robustness Principle** (Postel's Law): "be conservative in what you send, be liberal in what you accept." The function is conservative in what it stores (valid JSON arrays) and liberal in what it accepts when loading (it handles all failure modes gracefully).

Without these guards, a single corrupted localStorage entry would crash the calculator on every page load until the user manually cleared their storage.

---

### Effect 2 — set the browser tab title

`document.title` is the property that controls the browser tab's title text. Reading or writing it is a DOM side effect — it interacts with the browser environment outside the React tree.

```javascript
useEffect(() => {
  if (expression !== '') {
    document.title = `${expression} — Calculator`
  } else {
    document.title = 'Calculator'
  }

  return () => {
    // Reset to platform name when component unmounts
    document.title = 'my-platform'
  }
}, [expression])
```

This effect:
- Runs after every render where `expression` has changed
- Sets `document.title` to reflect the current expression
- Returns a **cleanup function** that resets the title when `Calculator` unmounts (when the user navigates back to the gallery)

**Why the cleanup matters:** Without cleanup, after the user navigates back to the gallery, `document.title` would still show the last expression. The tab title would say "123+45 — Calculator" even though the gallery is visible. The cleanup runs when the component unmounts, resetting the title to the platform name.

---

**CS lens — the cleanup function as RAII:**

The cleanup function is React's version of **RAII (Resource Acquisition Is Initialisation)** — a C++ pattern where a resource is acquired when an object is created and released when the object is destroyed.

In React:
- Effect runs → resource acquired (event listener added, timer started, title set)
- Cleanup runs → resource released (event listener removed, timer cleared, title reset)

If cleanup is omitted for resources that need it, the resource leaks. Event listeners accumulate. Timers keep firing after the component is gone. WebSocket connections stay open. These are **memory leaks** and **stale update bugs** — the most common causes of unexpected behaviour in React apps.

For `document.title`, the leak is cosmetic (wrong tab title). For a WebSocket subscription that calls a state setter after the component unmounts, React will log an error and the call is a no-op — but it is still wasted work.

---

### Full updated Calculator.jsx

```jsx
// src/Calculator.jsx

import { useState, useEffect } from 'react'
import CalculatorDisplay       from './CalculatorDisplay.jsx'
import CalculatorButton        from './CalculatorButton.jsx'
import HistoryPanel            from './HistoryPanel.jsx'

function loadInitialHistory() {
  try {
    const stored = localStorage.getItem('calc-history')
    if (stored === null) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function loadInitialNextId(history) {
  if (history.length === 0) return 1
  const maxId = Math.max(...history.map((entry) => entry.id))
  return maxId + 1
}

export default function Calculator() {
  const [expression, setExpression] = useState('')
  const [isError,    setIsError]    = useState(false)
  const [history,    setHistory]    = useState(loadInitialHistory)
  const [nextId,     setNextId]     = useState(() => loadInitialNextId(loadInitialHistory()))

  // Effect: persist history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history))
  }, [history])

  // Effect: update browser tab title to reflect current expression
  useEffect(() => {
    document.title = expression !== '' ? `${expression} — Calculator` : 'Calculator'
    return () => {
      document.title = 'my-platform'
    }
  }, [expression])

  function appendDigit(digit) {
    if (isError) return
    if (digit === '0' && expression === '0') return
    if (expression === '0' && digit !== '.') {
      setExpression(digit)
    } else {
      setExpression((prev) => prev + digit)
    }
  }

  function appendOperator(op) {
    if (isError)          return
    if (expression === '') return
    const lastChar = expression.slice(-1)
    if (['+', '-', '*', '/'].includes(lastChar)) {
      setExpression((prev) => prev.slice(0, -1) + op)
    } else {
      setExpression((prev) => prev + op)
    }
  }

  function appendDecimal() {
    if (isError) return
    const segments    = expression.split(/[+\-*/]/)
    const lastSegment = segments[segments.length - 1]
    if (lastSegment.includes('.')) return
    setExpression((prev) => prev === '' ? '0.' : prev + '.')
  }

  function evaluate() {
    if (isError)          return
    if (expression === '') return

    try {
      // eslint-disable-next-line no-eval
      const result    = eval(expression)
      const resultStr = String(result)

      setHistory((prev) => [...prev, { id: nextId, expression, result: resultStr }])
      setNextId((prev) => prev + 1)
      setExpression(resultStr)
      setIsError(false)

    } catch {
      setExpression('')
      setIsError(true)
    }
  }

  function clear() {
    setExpression('')
    setIsError(false)
  }

  function clearHistory() {
    setHistory([])
    setNextId(1)
  }

  const clearLabel = expression !== '' || isError ? 'C' : 'AC'

  const buttonDefs = [
    { label: '7', action: () => appendDigit('7') },
    { label: '8', action: () => appendDigit('8') },
    { label: '9', action: () => appendDigit('9') },
    { label: '/', action: () => appendOperator('/'), variant: 'operator' },
    { label: '4', action: () => appendDigit('4') },
    { label: '5', action: () => appendDigit('5') },
    { label: '6', action: () => appendDigit('6') },
    { label: '*', action: () => appendOperator('*'), variant: 'operator' },
    { label: '1', action: () => appendDigit('1') },
    { label: '2', action: () => appendDigit('2') },
    { label: '3', action: () => appendDigit('3') },
    { label: '-', action: () => appendOperator('-'), variant: 'operator' },
    { label: '0', action: () => appendDigit('0') },
    { label: '.', action: () => appendDecimal()   },
    { label: clearLabel, action: clear, variant: 'clear' },
    { label: '+', action: () => appendOperator('+'), variant: 'operator' },
  ]

  return (
    <div style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', overflow: 'hidden', maxWidth: '340px' }}>
      <CalculatorDisplay expression={expression} isError={isError} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e0e0e0' }}>
        {buttonDefs.map(({ label, action, variant = 'default' }) => (
          <CalculatorButton key={label} label={label} onClick={action} variant={variant} />
        ))}
        <CalculatorButton key="equals" label="=" onClick={evaluate} variant="equals" />
      </div>
      <HistoryPanel history={history} onClear={clearHistory} />
    </div>
  )
}
```

Open `localhost:5173`. Make several calculations. Reload the page. History is restored. While typing in the calculator, watch the browser tab — it shows the current expression. Navigate back to the gallery — the tab title resets to "my-platform".

---

**CS lens — the stale closure trap:**

A common `useEffect` bug:

```javascript
const [count, setCount] = useState(0)

useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1)  // stale closure: count is always 0
  }, 1000)
  return () => clearInterval(id)
}, [])  // empty dependency array — runs once, captures count = 0
```

The effect runs once (empty `[]`). The `setInterval` callback closes over `count` at the time of the first render: `count = 0`. Every second, `setCount(0 + 1)` sets `count` to `1`. The count never goes above `1`.

Fix: use the functional update form, which receives the current value at call time:

```javascript
useEffect(() => {
  const id = setInterval(() => {
    setCount((prev) => prev + 1)  // always uses the actual current count
  }, 1000)
  return () => clearInterval(id)
}, [])
```

Or add `count` to the dependency array (effect restarts every time `count` changes — one interval per render, which is a different problem).

The functional update form sidesteps the stale closure trap for simple increment/decrement patterns. For more complex cases, the `useRef` hook holds a mutable value that does not go stale — an advanced pattern outside this series.

---

## Connect the Pieces

**Connection to lesson 013:** The history state from lesson 013/014 now persists. The state is in `Calculator`; the effect synchronises it to storage. This is the pattern: **state is the source of truth, effects synchronise state to external systems.**

**Connection to lesson 022:** The lab registry is loaded once at module initialisation — not from `useEffect`. `useEffect` is for data that changes at runtime (user input, server responses). Static configuration data loaded once at module parse time does not need `useEffect`.

**Connection to lesson 026 (tests):** Testing effects requires the testing library to flush effects (using `act()`). `useEffect` with the title setter is tested by asserting `document.title` after rendering with specific props.

---

## What Breaks Without This

**Missing dependency in the array:**

```javascript
useEffect(() => {
  localStorage.setItem('calc-history', JSON.stringify(history))
}, [])  // Missing: history
```

The effect runs once, on mount. It writes the initial empty array to storage. When `history` changes (new calculation), the effect does not run — the change is never persisted. Storage always contains the initial empty array.

React's linting rules (the `eslint-plugin-react-hooks` plugin) detect this and warn: `React Hook useEffect has a missing dependency: 'history'.` Always follow this warning.

**Side effect directly in the component function:**

```javascript
function Calculator() {
  localStorage.setItem('calc-history', JSON.stringify(history))  // wrong
  // ...
}
```

With `<StrictMode>`, this runs twice per render. Every keystroke writes localStorage twice. In a fetch call, two requests are made. In `<StrictMode>`'s double-invoke pattern, the second call may overwrite the first's side effect. Move all side effects into `useEffect`.

**No cleanup for the title effect:**

```javascript
useEffect(() => {
  document.title = expression !== '' ? `${expression} — Calculator` : 'Calculator'
  // No return/cleanup
}, [expression])
```

When the user navigates back to the gallery, `Calculator` unmounts. The title stays as the last expression (`"42 — Calculator"`). The gallery has no effect to reset the title. The browser tab now shows the wrong title for the gallery view.

With cleanup: `Calculator` unmounts → cleanup runs → `document.title = 'my-platform'`. The title is correct immediately.

---

## Definition of Done

- [ ] `src/Calculator.jsx` imports and uses `useEffect` from React
- [ ] History persists to `localStorage` with key `'calc-history'`
- [ ] Reloading the page restores the history list
- [ ] The browser tab title shows the current expression while typing
- [ ] Navigating back to the gallery resets the tab title to `'my-platform'`
- [ ] `loadInitialHistory` is a function reference passed to `useState`, not called in the function body
- [ ] You can explain what `[history]` means in the dependency array
- [ ] You can explain why the cleanup function is needed for the title effect
- [ ] You can explain the stale closure trap and how the functional setter form avoids it
- [ ] You can explain what `JSON.stringify` and `JSON.parse` do and why both are needed
- [ ] Git commit:
  ```
  git add src/Calculator.jsx
  git commit -m "Add useEffect for localStorage persistence and tab title

  History persists to localStorage — restored on page reload.
  loadInitialHistory uses lazy useState initialiser for one-time read.
  Tab title reflects current expression; cleanup resets on unmount.
  Demonstrates effect dependency array and cleanup pattern."
  ```
