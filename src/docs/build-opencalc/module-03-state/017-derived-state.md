# 017 — Derived State

*When to compute, when to store, and why redundant state is a consistency bug waiting to happen*

---

## What You Will Build

You will add a statistics panel to the calculator history — showing the sum, average, minimum, and maximum of all results in the history. You will implement it three ways: first as stored state (wrong), then as derived values (correct), then as memoised derived values (efficient). The comparison makes the problem and solution concrete.

---

## What You Need to Know First

Lesson 016 — useEffect. The calculator persists history to localStorage.

Lesson 015 — Lifting State. History state lives in `Calculator`.

---

## The Lesson

### The redundant state problem

In lesson 013, you derived `activeLab` and `isShowingLab` from `activeLabId`. The principle: do not store values that can be computed from other state.

Now consider: you want to show the count of calculations, the sum of all results, and the average. These are all functions of the `history` array.

**Wrong approach — storing derived values:**

```javascript
const [history,    setHistory]    = useState([])
const [totalCount, setTotalCount] = useState(0)
const [sumResults, setSumResults] = useState(0)
const [avgResult,  setAvgResult]  = useState(0)
```

Every time history updates (a new calculation), you must also update `totalCount`, `sumResults`, and `avgResult`. If you forget any:

```javascript
setHistory((prev) => [...prev, entry])
setTotalCount((prev) => prev + 1)
// Forgot setSumResults and setAvgResult
```

`totalCount` is correct. `sumResults` and `avgResult` are stale. The UI shows inconsistent data: the count says "5" but the average is calculated from only 4 entries.

This is the synchronisation problem from lesson 008's imperative DOM, applied to React state. Storing derived values creates multiple sources of truth that must be kept in sync manually.

---

**CS lens — consistency and atomicity:**

A **consistency invariant** is a condition that must hold across all pieces of related data. If you store `totalCount` separately from `history`, the invariant is: `totalCount === history.length`. If any code updates `history` without updating `totalCount`, the invariant is violated.

In database terminology, these updates must be **atomic** — either both succeed or neither does. React state setters are not atomic with each other in this sense: calling `setHistory` and `setTotalCount` as two separate calls means React processes them as two updates (even if batched into one render, each setter is called independently, and if an error occurs between them, the state is inconsistent).

The correct approach eliminates the need for atomicity by having only one piece of state: `history`. `totalCount` is derived from it synchronously; there is no window where they can be inconsistent.

---

**SE lens — the cost of synchronisation logic:**

Every piece of derived state you store creates a **maintenance obligation**: all code that modifies the source state must also update the derived state. As the codebase grows, new developers must learn this obligation. When requirements change, all update sites must be changed together.

This scales badly. If `history` is used in 10 different functions (not unrealistic for a large feature), each must be updated when a derived metric is added. A computed value requires updating only one place: the derivation formula.

The engineering principle: **prefer immutable derivation to mutable synchronisation.** If you can derive it, derive it. Only store state that cannot be derived.

---

### Correct approach — compute at render time

```javascript
// No new state variables.
// Derived values computed from history on every render.

const numericResults = history
  .map((entry) => parseFloat(entry.result))
  .filter((n) => !isNaN(n))

const stats = numericResults.length === 0
  ? null
  : {
      count: history.length,
      sum:   numericResults.reduce((acc, n) => acc + n, 0),
      avg:   numericResults.reduce((acc, n) => acc + n, 0) / numericResults.length,
      min:   Math.min(...numericResults),
      max:   Math.max(...numericResults),
    }
```

`parseFloat(entry.result)` — converts a string like `"42"` to the number `42`. `parseFloat("Error")` returns `NaN` (Not a Number). `!isNaN(n)` filters out error results that cannot be averaged.

`reduce((acc, n) => acc + n, 0)` — **reduce** is the fundamental array aggregation function. It takes an accumulator (starting at `0`) and combines each element into it. `(acc, n) => acc + n` adds each element to the running total. The final value is the sum.

`Math.min(...numericResults)` — the spread operator passes each element of the array as a separate argument. `Math.min(1, 2, 3)` is valid; `Math.min([1, 2, 3])` is not. The spread converts `[1, 2, 3]` to `1, 2, 3`.

---

**CS lens — functional computation on collections:**

`map`, `filter`, and `reduce` are the three fundamental operations on collections:

- **`map`** — transform: applies a function to each element, returns a new array of the same length
- **`filter`** — select: keeps only elements for which the predicate returns `true`
- **`reduce`** — aggregate: combines all elements into a single value

These three operations can produce any derived value from a collection:

```
history (array of entries)
  → .map(entry => parseFloat(entry.result))    (array of numbers, same length)
  → .filter(n => !isNaN(n))                   (array of valid numbers, shorter)
  → .reduce((acc, n) => acc + n, 0)           (single sum value)
```

This is the functional programming approach to data transformation: compose small, pure transformations into a pipeline. Each step is independent and testable. The whole pipeline is a pure function of the input.

---

### When derivation is expensive — useMemo

For the history statistics, `map + filter + reduce` on a 100-entry array runs in microseconds. But consider a scenario where the derivation is slow: processing 100,000 history entries, or running a complex algorithm on every render.

If `Calculator` re-renders 60 times per second (for an animation), and the derivation takes 10 milliseconds, that is 600 ms of derivation per second — more than enough to cause visible frame drops.

`useMemo` memoises a computed value: it runs the computation only when the dependencies change, not on every render.

```javascript
import { useState, useEffect, useMemo } from 'react'

const stats = useMemo(() => {
  const numericResults = history
    .map((entry) => parseFloat(entry.result))
    .filter((n) => !isNaN(n))

  if (numericResults.length === 0) return null

  const sum = numericResults.reduce((acc, n) => acc + n, 0)

  return {
    count: history.length,
    sum,
    avg: sum / numericResults.length,
    min: Math.min(...numericResults),
    max: Math.max(...numericResults),
  }
}, [history])
```

`useMemo(() => computation, [dependencies])` — returns the cached result of `computation` if none of the `dependencies` have changed since the last render. If `history` has not changed, `stats` is the same object reference as last time. If `history` changed (new entry), `stats` is recomputed.

This also means: `stats` is only recomputed when `history` changes. Even if `expression` changes (every keypress), the stats calculation does not run. This is the memoisation optimisation: skip expensive computation when its inputs have not changed.

---

**CS lens — memoisation:**

**Memoisation** is the programming pattern of caching the result of a function based on its inputs. Given the same inputs, the function returns the cached output instead of recomputing.

The trade-off is **time vs space**: memoisation uses more memory (the cache) to reduce computation time. For a function called frequently with the same inputs, this is a good trade.

`useMemo` is React's built-in memoisation for derived values. It caches one result per component instance. When the dependencies change, the cache is invalidated and the function runs again to produce a new cached result.

The correct use of `useMemo`:
- The computation is genuinely expensive (measurably slow in performance profiling)
- The computation has inputs that are often the same across renders

The incorrect use:
- Every derived value, to be "safe" — adds overhead without benefit
- Simple computations like `array.length` or `isError ? 'Error' : expression`

`useMemo` is an optimisation, not a correctness tool. Never rely on it for correctness — React may choose to discard the cached value and recompute. Use it only when profiling shows a performance problem.

---

### Create the StatsPanel component

Create `src/StatsPanel.jsx`:

```jsx
// src/StatsPanel.jsx

export default function StatsPanel({ stats }) {
  if (stats === null) {
    return null
  }

  function fmt(n) {
    const rounded = Math.round(n * 100) / 100
    return rounded.toLocaleString()
  }

  return (
    <div style={{
      background: '#fff',
      borderTop: '1px solid #e0e0e0',
      padding: '12px 16px',
    }}>
      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Statistics
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: '13px' }}>
        {[
          ['Count',   fmt(stats.count)],
          ['Sum',     fmt(stats.sum)],
          ['Average', fmt(stats.avg)],
          ['Min',     fmt(stats.min)],
          ['Max',     fmt(stats.max)],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>{label}</span>
            <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

`if (stats === null) { return null }` — rendering `null` in React renders nothing. If there are no valid numeric results, the stats panel is invisible. This is cleaner than rendering an empty panel or "No data" text.

`Math.round(n * 100) / 100` — rounds to 2 decimal places. `Math.round(3.1415 * 100) = 314` → `314 / 100 = 3.14`. More readable than `n.toFixed(2)` which returns a string and can produce `"3.10"` instead of `3.1`.

`n.toLocaleString()` — formats the number according to the user's locale. In a US locale, `1234567` becomes `"1,234,567"`. In a German locale, it becomes `"1.234.567"`. Uses the browser's built-in locale awareness.

`.map(([label, value]) => ...)` — destructuring inside `.map()`. Each element of the outer array is `[label, value]` — a tuple (array of two elements). Destructuring in the map callback unpacks each pair directly.

---

### Update Calculator.jsx with useMemo and StatsPanel

Add to `Calculator.jsx`:

```jsx
import { useState, useEffect, useMemo } from 'react'
// ... existing imports ...
import StatsPanel from './StatsPanel.jsx'

// Inside Calculator():
const stats = useMemo(() => {
  const numericResults = history
    .map((entry) => parseFloat(entry.result))
    .filter((n) => !isNaN(n))

  if (numericResults.length === 0) return null

  const sum = numericResults.reduce((acc, n) => acc + n, 0)

  return {
    count: history.length,
    sum,
    avg: sum / numericResults.length,
    min: Math.min(...numericResults),
    max: Math.max(...numericResults),
  }
}, [history])

// In the return JSX, after HistoryPanel:
// <StatsPanel stats={stats} />
```

Full updated return block:

```jsx
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
    <StatsPanel stats={stats} />
  </div>
)
```

Open `localhost:5173`. Navigate to the calculator. Perform several calculations. The stats panel appears below the history with count, sum, average, min, and max. Adding more calculations updates the stats. Clearing history removes the stats panel (it returns `null`).

---

**SE lens — derived state as a specification:**

The stats derivation is a specification of what the stats mean:

```javascript
const sum = numericResults.reduce((acc, n) => acc + n, 0)
const avg = sum / numericResults.length
```

These two lines are the complete, unambiguous definition of `sum` and `avg`. There is no synchronisation code, no "remember to update avg when history changes" comment, no risk of the formula drifting over time. The formula is the source of truth.

This is the value of derived state beyond preventing bugs: it makes the specification of computed values explicit and co-located with their definition. The "spec" for `avg` is visible in the component, not scattered across update sites.

---

## Connect the Pieces

**Connection to lesson 013:** Lesson 013 introduced derived values (`activeLab`, `isShowingLab`). This lesson extends the pattern to computed aggregations (`stats`) and introduces memoisation for when the computation is expensive.

**Connection to lesson 023 (TypeScript):** The `stats` object's shape (`{ count, sum, avg, min, max }`) will become a TypeScript interface. Without TypeScript, the `StatsPanel` silently renders nothing if `stats` is passed with a missing field; with TypeScript, missing fields are compile errors.

**Connection to lesson 027 (Unit Tests):** The stats derivation (`numericResults.reduce(...)`) is a pure function. It is the easiest code in the codebase to test: pass an array, assert the result. Lesson 027 will test this.

---

## What Breaks Without This

**Storing derived values and forgetting to sync:**

```javascript
// Added feature: a third display of result count in the header
setHistory((prev) => [...prev, entry])
setTotalCount((prev) => prev + 1)
// Forgot: setLastResult(resultStr)
```

The header shows the last result from `lastResult` state, which was not updated. The display is stale. The bug is in the forgotten setter call, which is invisible in the code that reads `lastResult`. Finding it requires tracing backwards: "why is `lastResult` stale?" → "which code updates it?" → "is every code path covered?" This is the investigation that derived state eliminates.

**`useMemo` with a missing dependency:**

```javascript
const stats = useMemo(() => {
  // Computation uses history
  return { count: history.length, ... }
}, [])  // Missing: history
```

Same as `useEffect` with a missing dependency: the computation runs once (on mount) and is never recomputed. Even as `history` grows, `stats` always shows the initial values. The linting rule (`eslint-plugin-react-hooks`) catches this.

**Relying on `useMemo` for correctness:**

```javascript
const expensive = useMemo(() => dangerousOperation(), [])
```

React may discard the cached value at any time (during concurrent mode scheduling, for example). `useMemo` is a performance hint, not a guarantee. If the computation has side effects, or if correctness depends on it running exactly once, use a different mechanism (`useEffect` or initialise in state).

---

## Definition of Done

- [ ] `src/StatsPanel.jsx` exists and renders `null` when `stats` is `null`
- [ ] `src/Calculator.jsx` computes `stats` with `useMemo` depending on `[history]`
- [ ] `StatsPanel` is rendered below `HistoryPanel`
- [ ] Performing calculations shows count, sum, average, min, max in the stats panel
- [ ] Stats update when new calculations are added
- [ ] Clearing history makes the stats panel disappear (null render)
- [ ] You can explain why `totalCount` as separate state is a consistency bug
- [ ] You can explain when to use `useMemo` vs plain variable computation
- [ ] You can explain what `reduce` does and why it is used for sum computation
- [ ] You can explain why `useMemo` should not be used for correctness, only performance
- [ ] Git commit:
  ```
  git add src/StatsPanel.jsx src/Calculator.jsx
  git commit -m "Add derived statistics panel with useMemo

  stats computed from history via useMemo — no separate state variables.
  StatsPanel receives the stats object as a prop, renders null when empty.
  Demonstrates: derived state eliminates synchronisation bugs;
  useMemo caches the computation between renders where history is unchanged."
  ```
