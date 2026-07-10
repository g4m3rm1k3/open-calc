# 015 — Lifting State: Where It Lives

*Why siblings cannot share state directly, and how to move state to the right level*

---

## What You Will Build

You will add a calculation history panel to the calculator. The history panel is a separate component from the calculator buttons. Both components need access to the history list — one to add to it (on equals), one to display it. You will lift the history state to their shared parent and connect both components through it.

---

## What You Need to Know First

Lesson 014 — useState: The Reactive Value. The stateful `Calculator` component exists.

Lesson 013 — What Is State. You understand the state-render model and the single-source-of-truth principle.

---

## The Lesson

### The sibling communication problem

In lesson 014, the `Calculator` component owns `expression` and `isError`. These are local to `Calculator` — no other component needs them.

Now add the requirement: a history panel that shows past calculations. When the user presses `=`, the current expression and result are added to the history. The history panel shows the full list.

Two options for where history state lives:

**Option 1 — inside `Calculator`:** `Calculator` owns the history state. It passes the list down to `HistoryPanel` as a prop.

```
Calculator (owns: expression, isError, history)
├── CalculatorDisplay (receives: expression, isError)
├── Buttons (receive: handlers from Calculator)
└── HistoryPanel (receives: history)
```

**Option 2 — inside `HistoryPanel`:** `HistoryPanel` owns its own history state. `Calculator` calls a function when a calculation completes.

```
Calculator (owns: expression, isError)
│  calls onCalculate when = is pressed
HistoryPanel (owns: history)
```

Option 1 is correct. Option 2 is problematic.

---

**CS lens — the coupling problem with option 2:**

In option 2, `Calculator` and `HistoryPanel` are siblings. `Calculator` would need a way to call `HistoryPanel`'s internal function when a calculation completes. But siblings cannot communicate directly in React — there is no mechanism for `Calculator` to call a method on `HistoryPanel`.

The only communication channels in React are:
1. **Parent to child**: via props (data flows down)
2. **Child to parent**: via function props (events bubble up)
3. **Any component to any component**: via context, external state stores, or URL

For sibling communication, the standard solution is to lift the shared state to the lowest common ancestor. The parent owns the state; children receive what they need via props.

This is not a framework limitation — it is an architectural principle. Centralising shared state in the common ancestor:
- Makes data flow explicit and traceable
- Prevents "action at a distance" where two components can affect each other's state invisibly
- Makes the system easier to reason about and test

---

**SE lens — co-location vs shared ownership:**

From lesson 014: state should live as close as possible to the components that use it. This principle has a corollary: **when multiple components need the same state, it must live in their shared parent.**

Co-location minimises the scope of state. Shared ownership moves it up the minimum required distance. The goal in both cases is the same: state should live at the correct level — not so low that siblings cannot access it, not so high that unrelated components re-render when it changes.

Lifting state too high is also a mistake. If the history state lived in `App`, every time the history updated, `App` would re-render — causing all of its children to potentially re-render. History should be in the `Calculator` component (or a `CalculatorContainer` wrapper), not in `App`.

---

### Design the state structure

The history state is a list of completed calculations. Each entry needs:
- The expression string (e.g., `"123+45"`)
- The result (e.g., `168`)
- A unique ID for the `key` prop when rendering the list

```javascript
const [history, setHistory] = useState([])
// Each entry: { id: number, expression: string, result: string }
```

Using a monotonically incrementing ID as the key. Not the array index — array indices change when items are added at the beginning or when items are removed. An ID that is unique and never changes is a better key.

---

### Create the HistoryPanel component

Create `src/HistoryPanel.jsx`:

```jsx
// src/HistoryPanel.jsx

export default function HistoryPanel({ history, onClear }) {
  if (history.length === 0) {
    return (
      <div style={{
        background: '#f8f9fa',
        borderRadius: '0 0 8px 8px',
        padding: '16px',
        textAlign: 'center',
        color: '#bbb',
        fontSize: '13px',
      }}>
        No calculations yet
      </div>
    )
  }

  return (
    <div style={{ background: '#f8f9fa', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <span style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          History ({history.length})
        </span>
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '2px 6px',
          }}
        >
          Clear
        </button>
      </div>

      <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
        {[...history].reverse().map(({ id, expression, result }) => (
          <div
            key={id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '8px 16px',
              borderBottom: '1px solid #ebebeb',
              fontSize: '14px',
            }}
          >
            <span style={{ color: '#888' }}>{expression} =</span>
            <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{result}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Walkthrough:**

`{ history, onClear }` — two props:
- `history` — the array of calculation objects. `HistoryPanel` displays this; it does not own it.
- `onClear` — function prop. When "Clear" is clicked, `HistoryPanel` calls `onClear`. The parent decides what clearing means (setting `history` state back to `[]`).

`if (history.length === 0) { return (...) }` — **early return** for the empty state. If history is empty, render a simple empty message instead of the full panel. This is a common React pattern: render a different component tree for different data states (empty, loading, error, success).

`[...history].reverse()` — creates a copy of the history array (`[...history]`) and reverses it, so the most recent calculation appears at the top. The spread `[...]` is necessary because `Array.prototype.reverse()` mutates the array in place. Mutating `history` (the prop) would be a prop mutation (a React anti-pattern). Creating a copy first prevents that.

`.map(({ id, expression, result }) => (...))` — destructures each history entry inside the map callback. The `key={id}` prop uses the entry's unique ID, not the array index.

---

### Update Calculator.jsx to lift history state

Update `src/Calculator.jsx` to own history and coordinate with `HistoryPanel`:

```jsx
// src/Calculator.jsx

import { useState }       from 'react'
import CalculatorDisplay  from './CalculatorDisplay.jsx'
import CalculatorButton   from './CalculatorButton.jsx'
import HistoryPanel       from './HistoryPanel.jsx'

export default function Calculator() {
  const [expression, setExpression] = useState('')
  const [isError,    setIsError]    = useState(false)
  const [history,    setHistory]    = useState([])
  const [nextId,     setNextId]     = useState(1)

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
      // eslint-disable-next-line no-eval
      const result = eval(expression)
      const resultStr = String(result)

      setHistory((prev) => [
        ...prev,
        { id: nextId, expression, result: resultStr },
      ])
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

**Walkthrough:**

Three state variables for `Calculator`, now four: `expression`, `isError`, `history`, `nextId`.

`const [history, setHistory] = useState([])` — initial value is an empty array. Arrays in JavaScript are objects; `useState` accepts any JavaScript value including objects and arrays.

`const [nextId, setNextId] = useState(1)` — a monotonically incrementing counter for generating unique IDs. Starts at 1. Each time `evaluate()` completes, `nextId` increments. The current value of `nextId` is used as the ID for the new history entry.

```javascript
setHistory((prev) => [
  ...prev,
  { id: nextId, expression, result: resultStr },
])
setNextId((prev) => prev + 1)
```

`setHistory` uses the functional form. `[...prev, newEntry]` creates a new array with all previous entries followed by the new entry. Spread `...prev` copies the previous array into a new array. The new array replaces `history` as the state value.

Why spread instead of `prev.push(newEntry)`? `Array.prototype.push` mutates the array in place. Calling `setHistory` with the same array reference (the mutated array) may not trigger a re-render, because React compares with `Object.is` and sees the same array object (even though its contents changed). Creating a new array with `[...prev, newEntry]` gives React a new reference, guaranteeing the re-render.

This rule applies to all mutable data in React state: **never mutate state directly; always produce a new value.** For arrays: `[...prev, item]` not `prev.push(item)`. For objects: `{ ...prev, key: newValue }` not `prev.key = newValue`.

`setNextId((prev) => prev + 1)` — functional form. Next ID is always previous ID + 1.

`<HistoryPanel history={history} onClear={clearHistory} />` — `Calculator` passes `history` down to `HistoryPanel`. `HistoryPanel` displays the same history that `Calculator` uses for evaluation. When `onClear` is called from `HistoryPanel`, `Calculator`'s `clearHistory` function runs and resets both `history` and `nextId`.

---

**CS lens — the data flow invariant:**

The data flow forms a directed tree:

```
Calculator (owns history state)
├── Reads history → displays entry count (indirectly, via HistoryPanel.history.length)
├── Writes history → on evaluate() completion
└── HistoryPanel (reads history via prop)
    └── Calls onClear → triggers Calculator to clear history
```

The invariant: `history` in `HistoryPanel` always equals `history` in `Calculator`. They are the same array — the prop is a reference to the same value. When `Calculator` calls `setHistory([])`, `HistoryPanel` re-renders with the new empty array.

This invariant holds because React's rendering model guarantees: when a component's props change, it re-renders. `Calculator` owns the state; `HistoryPanel` receives the current value on every render. They cannot diverge.

---

**SE lens — the tradeoffs of lifting state:**

When state is lifted, the parent gains more responsibilities. `Calculator` went from owning 2 state variables to 4. Every time history changes, `Calculator` re-renders — which also re-renders `HistoryPanel`, `CalculatorDisplay`, and the button grid.

This is acceptable here because the component is small and the re-render is fast. For larger component trees where re-rendering is expensive, lifting state too high causes performance problems. The solutions are:
- Memoisation (`React.memo`, `useMemo`) — lesson 020 previews this
- State management libraries (Redux, Zustand) — lesson 022's registry pattern is an example

For this application: lift to the lowest common ancestor and accept the re-render cost. Premature optimisation avoids a problem that may never exist.

---

### Test the lift

Open `localhost:5173`, navigate to the Calculator lab. Perform a few calculations. The history panel shows each result, most recent first. Click "Clear" — history resets. Navigate back to the gallery and return to the calculator — history is reset (state is reset on unmount/remount).

---

## Connect the Pieces

**Connection to lesson 013:** In lesson 013, `App` lifted the active lab ID to own which view was showing. This lesson demonstrates the same pattern at a finer level: within the `Calculator` component, history state is lifted to be shared between the button handlers and `HistoryPanel`.

**Connection to lesson 016:** When the user navigates back to the gallery, the calculator's state (including history) is lost. Lesson 016's `useEffect` covers persisting state to `localStorage` so history survives navigation.

**Connection to lesson 017:** The history total count (`history.length`) and the most recent calculation (`history[history.length - 1]`) are derived values computed from the history array. Lesson 017 shows how to avoid recomputing expensive derivations on every render.

**Connection to lesson 022:** The lab registry is a global registry, not component state. Components register themselves at module load time. The registry is not lifted state — it is a static data structure. Understanding lifting state makes it clear why the registry does not use state at all.

---

## What Breaks Without This

**Mutating state directly:**

```javascript
setHistory((prev) => {
  prev.push({ id: nextId, expression, result: resultStr })  // mutates prev
  return prev  // same reference — React may not re-render
})
```

React compares `prev` (the array reference before the update) to the returned value. They are the same object. React bails out of the re-render. The history panel does not update. The history entry was added to the array (the mutation happened), but the UI does not reflect it.

This is the subtlest React state bug. The mutation works in JavaScript; the UI does not update. The fix is always: return a new reference.

**Storing the history in `HistoryPanel` (wrong side of the lift):**

If `HistoryPanel` owned the history state, `Calculator` would need to call `HistoryPanel`'s setter when `=` is pressed. In React, you cannot call another component's setter directly. You would need a `ref`, which is an escape hatch for imperative control — an advanced pattern that should not be the first reach.

The canonical solution is always to lift the state to the common parent, not to create cross-component setter access.

**Lifting state too high (unnecessary re-renders):**

If history were in `App`:

```javascript
// App.jsx
const [history, setHistory] = useState([])
```

Every time a calculation is made, `App` re-renders. `App` renders `AppShell`, `AppHeader`, `ContentArea`, `LabGallery` (or `LabDetail`), and all their children. Most of these components do not use history at all. They re-render unnecessarily.

At this application's scale: harmless. In a large application with hundreds of components and complex state: a visible performance problem.

---

## Definition of Done

- [ ] `src/HistoryPanel.jsx` exists and accepts `history` and `onClear` props
- [ ] `src/Calculator.jsx` owns `history` and `nextId` state alongside `expression` and `isError`
- [ ] Pressing `=` adds an entry to the history panel with the correct expression and result
- [ ] Clicking "Clear" in the history panel resets the history
- [ ] You can explain why `HistoryPanel` cannot own the history state
- [ ] You can explain why `[...prev, newEntry]` is used instead of `prev.push(newEntry)`
- [ ] You can explain why history is reset when navigating away from the calculator
- [ ] You can explain the tradeoff between lifting state and unnecessary re-renders
- [ ] Git commit:
  ```
  git add src/HistoryPanel.jsx src/Calculator.jsx
  git commit -m "Lift history state to Calculator, add HistoryPanel component

  Calculator owns expression, isError, history, and nextId.
  HistoryPanel receives history array and onClear callback as props.
  evaluate() appends to history using functional setHistory to avoid mutation.
  Lifting state to lowest common ancestor is the canonical sibling sharing pattern."
  ```
