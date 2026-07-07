# React Calculator — Lesson 24 — Expression History

## What You Will Build

Every successful calculation joins a running, most-recent-first list below
the calculator. Click any past entry, and its expression loads back into
the display, ready to reuse or continue from.

---

## What You Need to Know First

Lesson 23 — a working calculator with persisted formulas; `calculatorReducer`
owning `expression` and `result`.

---

## Step 1 — Add History to the Reducer's State

```tsx
interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
}

interface CalculatorState {
  expression: string;
  result: string | null;
  history: HistoryEntry[];
}
```

Update the `"equals"` action and branch to also record an entry:

```tsx
type CalculatorAction =
  | // ...existing variants...
  | { type: "equals"; historyId: string }
  | // ...
```

```tsx
case "equals": {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind !== "success") return { ...state, result: outcome.message };
  const entry: HistoryEntry = { id: action.historyId, expression: state.expression, result: String(outcome.value) };
  return { ...state, result: String(outcome.value), history: [...state.history, entry] };
}
```

Update the dispatch call in `Keypad`'s `onEquals` prop:

```tsx
onEquals={() => dispatch({ type: "equals", historyId: Date.now().toString() })}
```

Update the initial state passed to `useReducer` to include `history: []`.

**Walkthrough — history only records on success, and only inside
`"equals"`.** Pressing `=` on a broken expression (an unbalanced
parenthesis, a division by zero) still shows the error message, exactly
as before — it just doesn't add anything to history, since there's no
real completed calculation to remember. Every other action (`digit`,
`operator`, `function`, and so on) leaves `history` completely untouched
— the same `{ ...state, ... }` spread pattern already carries it forward
unchanged in every branch that doesn't explicitly mention it.

**Walkthrough — `historyId` travels inside the action, for the exact same
reason `angleMode` did in lesson 18.** Generating the entry's id with
`Date.now()` *inside* the reducer would make `calculatorReducer` depend on
something beyond its own two arguments — calling it twice with identical
`state` and `action` could produce two different results, purely because
real time passed between the calls. Generating the id at the call site
(inside `onEquals`, where `dispatch` is actually invoked) and handing it
to the reducer as part of the action keeps the reducer a genuinely pure
function: everything it needs to produce its result is sitting in its own
two arguments, nothing borrowed from the outside world.

---

## Step 2 — Render History, Most Recent First

```tsx
<ul className="history-list">
  {[...state.history].reverse().map((entry) => (
    <li key={entry.id} onClick={() => dispatch({ type: "setExpression", value: entry.expression })}>
      {entry.expression} = {entry.result}
    </li>
  ))}
</ul>
```

Click **▶ Preview**. Compute a few different calculations. The most
recent one appears at the top of the history list. Click an older entry —
its expression loads back into the display.

**Walkthrough — `[...state.history].reverse()`, and why the spread comes
first.** `Array.prototype.reverse()` is different from `.map()` and
`.filter()` in a way worth stopping on: **it reverses the array in
place**, mutating the original, and also returns that same, now-reversed
array. Calling `state.history.reverse()` directly would silently mutate
`state` itself — the exact violation of React's immutability rule lesson
18 built the entire reducer discipline to prevent, hiding inside a method
that looks as harmless as `.map()` or `.filter()`. `[...state.history]`
makes a brand-new array first — a shallow copy, containing the same
entries in the same order — and `.reverse()` is called on *that* copy,
leaving `state.history` completely untouched. The lesson worth keeping:
not every array method is immutable by default; `.reverse()`, `.sort()`,
`.push()`, `.splice()`, and a few others mutate directly, and each one
needs this same "copy first" treatment before use inside anything React
is tracking as state.

**SE lens — clicking history reuses the exact mechanism lesson 20 already
built for memory recall.** Loading a past expression back onto the display
is `dispatch({ type: "setExpression", value: entry.expression })` — the
same action `handleMemoryRecall` already dispatches, introduced
specifically so state outside the reducer (there, `useMemory`; here, a
list rendered from `state.history` itself) could still update `expression`
through the one sanctioned path. No new reducer action was needed for this
feature at all.

---

## Connect the Pieces

```
Calculator.tsx   HistoryEntry — one completed calculation
                 CalculatorState gains history: HistoryEntry[]
                 "equals" now also appends to history, only on success
                 clicking a history entry reuses the existing
                 "setExpression" action
```

---

## What Breaks Without This

**Calling `.reverse()` directly on `state.history` instead of on a spread
copy:** looks correct on screen — the list *does* display most-recent-
first. The real damage is invisible at first glance: `state.history` (the
actual state React is tracking) is now permanently reordered too, in
place, without ever going through `dispatch`. Any code elsewhere in the
project that assumed `state.history` stayed in the order entries were
actually calculated (a future export-to-file feature, for instance) would
silently see the wrong order — a bug with no error message anywhere,
caused by a state mutation that happened outside any reducer action.

---

## Definition of Done

- [ ] Every successful calculation appears in history, most recent first
- [ ] Failed calculations (errors) do not add a history entry
- [ ] Clicking a history entry loads its expression back into the display
- [ ] You can explain why `.reverse()` needs a spread copy first, unlike `.map()` or `.filter()`
- [ ] You can explain why `historyId` is generated at the dispatch call site instead of inside the reducer

---

*Next: Lesson 25 — Memoization: useMemo. A deliberately slow calculation
stops recomputing on every keystroke that has nothing to do with it.*
