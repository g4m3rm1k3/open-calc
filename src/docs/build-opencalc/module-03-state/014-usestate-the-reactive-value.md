# 014 — useState: The Reactive Value

*How React preserves values across renders, what the setter does, and the calculator with live state*

---

## What You Will Build

You will wire the calculator buttons to state. Clicking a digit, operator, or equals will update the display in real time. The calculator from lesson 009 (static props showing "12+3") will become a fully working calculator using `useState` for the expression and error state.

---

## What You Need to Know First

Lesson 013 — What Is State. The concept: state is a value that, when changed, causes the component to re-render.

Lesson 009 — React Components. `CalculatorDisplay` and `CalculatorButton` components exist.

---

## The Lesson

### The problem with variables in components

Every time a component function runs (on every render), all `const` and `let` declarations inside it are re-initialised. This is normal JavaScript — function calls create new local variables:

```javascript
function Counter() {
  let count = 0  // re-initialised to 0 on every render

  function increment() {
    count++  // changes the local copy
    // Does not trigger re-render — just changes a local variable
  }

  return <button onClick={increment}>{count}</button>
}
```

On every render, `count` starts at `0`. Clicking calls `increment`, which increments the local `count` to `1` — but does not cause a re-render. The next time `Counter` renders (for any reason), `count` is `0` again.

The problem: **React needs a way to store a value that persists across renders and causes re-renders when it changes.**

That is exactly what `useState` provides.

---

**CS lens — closures and the re-render model:**

A component function is called fresh on every render. Each call creates a new execution context with new local variables. How can state persist if every variable is re-initialised?

React stores state **outside** the component function, in React's internal state table keyed by the component instance and the call order of `useState` hooks in that instance. When the component function runs:

1. React looks up the state value for this component from its internal table
2. `useState(initialValue)` returns the stored value (ignoring `initialValue` after first render)
3. The component renders using that stored value
4. If `setX(newValue)` is called later, React updates its internal table
5. React re-runs the component function; `useState` returns the new value

This is why the **rules of hooks** matter:
- Only call hooks at the top level of the component function (not inside `if`, loops, or nested functions)
- Do not call hooks in regular JavaScript functions, only in component functions

These rules ensure that the call order of `useState` is the same on every render, so React can reliably look up which stored value to return for each `useState` call. If you put `useState` inside an `if`, the call order changes depending on the condition — React's internal table indices break.

---

### useState in detail

```javascript
const [value, setValue] = useState(initialValue)
```

**`useState(initialValue)`** — called once per render. Returns `[currentValue, setter]`. `initialValue` is used only on the first render; on subsequent renders it is ignored.

**`value`** — the current value of this piece of state. Read-only within the component function. Changes to this variable do not trigger re-renders; only calling `setValue` does.

**`setValue(newValue)`** — schedules a re-render with `newValue` as the new state. The setter:
1. Updates React's internal state table for this component
2. Marks the component as needing re-render
3. Returns immediately (state is not updated yet — `value` still holds the old value for the rest of this event handler)
4. React will re-render the component asynchronously (before the next paint)

**Functional update form:** The setter also accepts a function:

```javascript
setValue((previous) => previous + 1)
```

The function receives the current state value and returns the new state value. Use this when the new state depends on the previous state — it guarantees you are reading the most recent value, not a potentially stale closure value.

---

**CS lens — the difference between synchronous and asynchronous state:**

When you call `setValue(newValue)`, state is not updated immediately. The value you provided is stored in React's update queue. React batches updates and applies them together before re-rendering.

This batching is intentional. If you call three setters in one event handler:

```javascript
function handleInput(char) {
  setExpression(expression + char)
  setHistory(history)
  setIsError(false)
}
```

React does not re-render three times. It collects all three updates, applies them at once, and re-renders once with all three new values. This is more efficient and avoids intermediate renders where the UI is in an inconsistent state (expression updated, error flag not yet cleared).

In React 18 (which this project uses), all state updates are batched by default — including updates from asynchronous code (setTimeout, Promises, fetch callbacks). In earlier versions, only synchronous event handler updates were batched.

---

### Build the stateful calculator

Create `src/Calculator.jsx`:

```jsx
// src/Calculator.jsx
//
// Stateful calculator using useState.
// Compare with src/calculator-v1.js (lesson 008) — same logic,
// no manual render calls, no DOM operations.

import { useState } from 'react'
import CalculatorDisplay from './CalculatorDisplay.jsx'
import CalculatorButton  from './CalculatorButton.jsx'

export default function Calculator() {
  const [expression, setExpression] = useState('')
  const [isError,    setIsError]    = useState(false)

  // ---- State operations ----
  // Each function reads current state, computes next state,
  // and calls the setter. React handles re-rendering.

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
    if (isError)         return
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
      // eval() is used for demonstration only.
      // See the note in lesson 008 about why this is unsafe in production.
      // eslint-disable-next-line no-eval
      const result = eval(expression)
      setExpression(String(result))
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

  // ---- Derived values ----
  const clearLabel = expression !== '' || isError ? 'C' : 'AC'

  // ---- Button definitions ----
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
    <div style={{
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      maxWidth: '340px',
    }}>
      <CalculatorDisplay expression={expression} isError={isError} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px',
        background: '#e0e0e0',
      }}>
        {buttonDefs.map(({ label, action, variant = 'default' }) => (
          <CalculatorButton
            key={label}
            label={label}
            onClick={action}
            variant={variant}
          />
        ))}

        <CalculatorButton
          key="equals"
          label="="
          onClick={evaluate}
          variant="equals"
        />
      </div>
    </div>
  )
}
```

**Walkthrough:**

`const [expression, setExpression] = useState('')` — state for the current expression string. Initial value: `''` (empty string). On first render, the display shows "0" because `CalculatorDisplay` renders `expression || '0'`.

`const [isError, setIsError] = useState(false)` — state for whether the last evaluation produced an error. Initial value: `false`.

Two state variables instead of one. Why not one object `{ expression, isError }`? Two variables is simpler when they change independently and frequently. Updating `expression` alone does not need to touch `isError`. One object would require always providing both values: `setState({ expression: newExpr, isError: state.isError })` — more verbose and error-prone than `setExpression(newExpr)`.

The rule: when two state values always change together, consider combining them. When they change independently, keep them separate.

`setExpression((prev) => prev + digit)` — the functional update form. `prev` is the current value of `expression` at the moment the setter is called. Using the functional form is important when the new value depends on the previous value, especially in rapid-fire updates. In this calculator the updates are from button clicks (not rapid-fire), but the habit is correct.

`setExpression((prev) => prev.slice(0, -1) + op)` — replaces the last character of the expression with the new operator. `String.prototype.slice(-1)` returns the last character. `slice(0, -1)` returns all characters except the last. Combined with `+ op`, this replaces the last operator.

`const clearLabel = expression !== '' || isError ? 'C' : 'AC'` — derived from state. When there is expression text or an error, the button shows "C" (clear entry). When both are empty/false, it shows "AC" (all clear). This is a computed value, not state — it is re-computed on every render based on current state. No `useState` call, no synchronisation.

The `buttonDefs` array is defined inside the component function because it captures `expression` and `isError` through closures. On every render, each button's `action` function closes over the current state values. This is necessary — if it were at module scope, the closures would capture stale state.

---

**SE lens — eliminating the render-call problem from lesson 008:**

Compare `appendDigit` here to `handleDigit` from lesson 008:

**Lesson 008 (imperative):**

```javascript
function handleDigit(digit) {
  if (isError) return
  if (digit === '0' && currentExpression === '0') return
  if (currentExpression === '0' && digit !== '.') {
    currentExpression = digit
  } else {
    currentExpression += digit
  }
  // Manual render calls required
  renderDisplay()
  renderExpression()
  renderClearButton()
}
```

**Lesson 014 (React):**

```javascript
function appendDigit(digit) {
  if (isError) return
  if (digit === '0' && expression === '0') return
  if (expression === '0' && digit !== '.') {
    setExpression(digit)
  } else {
    setExpression((prev) => prev + digit)
  }
  // No render calls. React handles re-rendering.
}
```

The business logic is identical. The difference: in lesson 008, three render functions must be called manually. Here, calling `setExpression` is sufficient — React knows to re-render, and on re-render, `CalculatorDisplay` receives the new `expression` and renders the correct output.

The "implicit render call" — the connection between calling `setExpression` and the display updating — is why React is valuable. The connection is structural (a component that uses state always re-renders when state changes) rather than manual (a developer who must remember to call `renderDisplay` after every state change).

---

### Update App.jsx to show the calculator

Update `src/App.jsx`:

```jsx
// src/App.jsx

import { useState } from 'react'
import AppShell     from './AppShell.jsx'
import AppHeader    from './AppHeader.jsx'
import ContentArea  from './ContentArea.jsx'
import Card         from './Card.jsx'
import LabCard      from './LabCard.jsx'
import Calculator   from './Calculator.jsx'

const labs = [
  { id: 'calculator',   title: 'Calculator',              description: 'A working calculator built with React state. Covers useState, event handlers, and derived values.',           category: 'code',  difficulty: 'beginner'     },
  { id: 'robot-arm',    title: 'Robot Arm Simulator',     description: 'Program a 3-axis robot arm using real MATLAB and Python commands.',                                           category: 'code',  difficulty: 'intermediate' },
  { id: 'rubiks-cube',  title: "Rubik's Cube Solver",    description: "Explore group theory through the Rubik's Cube.",                                                             category: 'math',  difficulty: 'advanced'     },
  { id: 'linear-algebra', title: 'Linear Algebra Visualiser', description: 'See matrix multiplication and eigenvectors in real time.',                                             category: 'math',  difficulty: 'beginner'     },
]

function LabGallery({ labs, onLaunch }) {
  return (
    <Card padding="24px 32px" elevation="raised">
      <h1 style={{ margin: '0 0 8px', fontSize: '22px' }}>Labs</h1>
      <p style={{ margin: '0 0 24px', color: '#666' }}>{labs.length} labs available</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {labs.map((lab) => (
          <LabCard
            key={lab.id}
            title={lab.title}
            description={lab.description}
            category={lab.category}
            difficulty={lab.difficulty}
            onLaunch={() => onLaunch(lab.id)}
          />
        ))}
      </div>
    </Card>
  )
}

function LabDetail({ lab, onBack }) {
  return (
    <Card padding="24px 32px" elevation="raised">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a2e', fontSize: '14px', padding: 0, marginBottom: '20px' }}>
        ← Back to Labs
      </button>
      <h1 style={{ margin: '0 0 8px', fontSize: '22px' }}>{lab.title}</h1>
      <p style={{ margin: '0 0 24px', color: '#666' }}>{lab.description}</p>

      {lab.id === 'calculator'
        ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <Calculator />
          </div>
        )
        : (
          <div style={{ padding: '60px 24px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#999' }}>
            <p style={{ margin: 0 }}>Lab component loads here. (Lesson 022)</p>
          </div>
        )
      }
    </Card>
  )
}

export default function App() {
  const [activeLabId, setActiveLabId] = useState(null)
  const activeLab    = labs.find((lab) => lab.id === activeLabId) ?? null
  const isShowingLab = activeLabId !== null

  return (
    <AppShell>
      <AppHeader platformName="my-platform" activeLabName={activeLab?.title ?? null} />
      <ContentArea>
        {isShowingLab && activeLab !== null
          ? <LabDetail lab={activeLab} onBack={() => setActiveLabId(null)} />
          : <LabGallery labs={labs} onLaunch={(id) => setActiveLabId(id)} />
        }
      </ContentArea>
    </AppShell>
  )
}
```

Open `localhost:5173`. Click "Calculator" in the gallery. The header updates. The lab detail shows the `<Calculator>` component. Type digits, operators, hit `=`. The display updates in real time. Hit `C` to clear.

---

**CS lens — component isolation and independent state:**

The `Calculator` component has its own state (`expression`, `isError`). When the user navigates back to the gallery and returns to the calculator, the calculator's state is **reset to initial values** — the expression starts empty again.

This happens because React mounts a new instance of `Calculator` each time it renders. When `LabDetail` renders (because `activeLabId` changes to `'calculator'`), React creates a new `Calculator` instance with fresh state. When `LabDetail` unmounts (because `activeLabId` changes to `null`), React destroys the instance and its state is gone.

This is the expected behaviour in this architecture. Lesson 016 (useEffect) and lesson 018 (SPA routing) show how to persist state across navigation — using `localStorage`, a parent component's state, or URL parameters.

---

**SE lens — the calculator's state is local:**

`Calculator` owns its own state. `App` does not know about the calculator's expression. `LabDetail` does not know about it. The state is scoped to the component that needs it.

This is the principle of **co-location**: state should live as close to the components that use it as possible. `expression` and `isError` are used only inside `Calculator`, so they live inside `Calculator`. When you need to share state between components, you "lift" it to their lowest common ancestor — the topic of lesson 015.

---

### State batching and multiple setters

In `evaluate()`, both setters are called:

```javascript
setExpression(String(result))
setIsError(false)
```

Or in the catch block:

```javascript
setExpression('')
setIsError(true)
```

React 18 batches these into a single re-render. `Calculator` re-renders once with both new values, not twice (once for expression, once for isError). This is guaranteed by React 18's automatic batching — no special code is required.

To verify: add a `console.log` inside the component function and observe that it runs once after clicking `=`, not twice.

---

**CS lens — idempotency and state updates:**

Calling `setExpression('42')` twice in a row produces the same result as calling it once — the expression is `'42'` either way. State updates are **idempotent** for the same value.

This is useful for understanding what happens when an event fires multiple times rapidly. If the user double-clicks `=`:
1. First click: `evaluate()` runs, `setExpression('42')`, `setIsError(false)`
2. React batches and re-renders with expression `'42'`
3. Second click: `evaluate()` runs, `eval('42')` returns `42`, `setExpression('42')` again
4. React sees the same value for expression — no change needed — and skips the re-render

React compares new state to old state with `Object.is` (strict equality). If the new value is the same as the old value, React skips the re-render. This optimisation is "bailing out" — React bails out of the re-render cycle when state has not changed.

---

## Connect the Pieces

**Connection to lesson 008:** The entire render-call problem from lesson 008 is resolved. `appendDigit` has no render calls. The connection between state and UI is structural. Adding a memory feature to this calculator requires: one more `useState`, one more button definition. No existing handlers need to change.

**Connection to lesson 015:** The calculator's state is local. Lesson 015 introduces **lifting state** — moving state up to a parent when two sibling components need to share it. If the lesson detail page needed to display the calculator's current expression in the sidebar, the expression state would need to be lifted to `LabDetail` or `App`.

**Connection to lesson 017:** `clearLabel` is derived state — computed from `expression` and `isError` on every render. Lesson 017 extends this to more complex cases where derived values are expensive to compute and need memoisation.

---

## What Breaks Without This

**Calling `useState` conditionally:**

```javascript
function Calculator({ showAdvanced }) {
  const [expression, setExpression] = useState('')
  if (showAdvanced) {
    const [memory, setMemory] = useState(0)  // Error: Hooks inside conditionals
  }
}
```

```
React Hook "useState" is called conditionally. React Hooks must be called
in the exact same order in every component render.
```

React counts hook calls by position. First `useState` = expression. Second `useState` = memory. If `showAdvanced` is `false`, React only sees one `useState`. If it then becomes `true`, React sees two — but the second `useState` call is at a different position than React expects for the memory hook. The internal index is wrong; React returns the wrong value.

**Reading `expression` immediately after `setExpression`:**

```javascript
function appendDigit(digit) {
  setExpression(expression + digit)
  console.log(expression)  // old value — setter hasn't applied yet
}
```

This is the most common React state bug. `setExpression` schedules an update; it does not mutate `expression`. After calling `setExpression`, `expression` is still the old value for the rest of this function call. The new value only appears on the next render. Use the value you computed: `const next = expression + digit; setExpression(next); console.log(next)`.

---

## Definition of Done

- [ ] `src/Calculator.jsx` exists with `expression` and `isError` useState hooks
- [ ] All digit, operator, decimal, clear, and equals operations work
- [ ] The display updates on every button click with no page reload
- [ ] The clear button shows "C" with input and "AC" without
- [ ] Error state (`isError`) shows "Error" in red and clears on next C
- [ ] Navigating away from the calculator and back resets it to empty state
- [ ] You can explain why `setExpression((prev) => prev + digit)` is used instead of `setExpression(expression + digit)`
- [ ] You can explain why calling two setters in one handler only causes one re-render
- [ ] You can explain why reading `expression` immediately after `setExpression` gives the old value
- [ ] You can explain why `clearLabel` is a derived value and not `useState`
- [ ] Git commit:
  ```
  git add src/Calculator.jsx src/App.jsx
  git commit -m "Add stateful Calculator component using useState

  expression and isError state drive CalculatorDisplay automatically.
  No manual render calls — state change triggers re-render structurally.
  clearLabel is derived on every render, never stored as state.
  Calculator is isolated: fresh state on each mount."
  ```
