# React Calculator — Lesson 24 — Expression History

## What You Will Build

Every successful calculation joins a running, most-recent-first list below
the calculator. Click any past entry, and its expression loads back into
the display, ready to reuse or continue from.

---

## What You Need to Know First

Lesson 23 — a working calculator with persisted formulas; `calculatorReducer`
owning `expression` and `result`.

**CS lens, previewed before the code: history is an event log.** Every
`HistoryEntry` this lesson creates is a permanent record of something that
already happened — a completed calculation — never modified after the
fact, only ever added to. A growing, append-only list of "things that
happened," each one immutable once recorded, is the core idea behind
**event sourcing**, a real architectural pattern used in production
systems (banking ledgers, version control history, audit logs) for
exactly this reason: if every change is recorded as a permanent, ordered
event rather than overwriting some single "current" value in place, you
can always reconstruct exactly how the system arrived at its present
state, and nothing already recorded can ever be silently lost or
corrupted by a later change. This project's `history` won't be replayed
to reconstruct anything (a real event-sourced system's defining feature),
but the shape — append-only, immutable, ordered — is the identical one.

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

**Walkthrough — `id: string`, and why history entries need identity at
all.** Every `HistoryEntry` gets its own `id`, distinct from its
`expression` and `result`. This matters because two different calculations
can produce an *identical* expression and result — computing `2+2` twice
in a row creates two entries that look completely the same by content —
and React's `key` prop (used when rendering the list in Step 2) needs a
value that uniquely identifies *which* entry this is, not just what it
contains. This is **identity versus equality**, a distinction lesson 04
first raised for the `key` prop in the abstract: two objects can be equal
in every visible way and still be different, individual things — `id`
exists purely to answer "which one," a question `expression` and `result`
alone cannot answer once duplicates exist.

**Walkthrough — history only records on success, and only inside
`"equals"`.** Pressing `=` on a broken expression (an unbalanced
parenthesis, a division by zero) still shows the error message, exactly
as before — it just doesn't add anything to history, since there's no
real completed calculation to remember. Every other action (`digit`,
`operator`, `function`, and so on) leaves `history` completely untouched
— the same `{ ...state, ... }` spread pattern already carries it forward
unchanged in every branch that doesn't explicitly mention it.

**Walkthrough — `historyId` travels inside the action, for the exact same
reason `angleMode` did in lesson 18.** Lesson 18 named the general law
this follows: **a reducer is a mathematical function, `(oldState, action)
→ newState`, and nothing else is allowed in** — no clock, no random
numbers, no storage, no network, no outside variables of any kind.
Generating the entry's id with `Date.now()` *inside* the reducer would
violate it exactly the way reading `angleMode` directly would have:
calling `calculatorReducer` twice with identical `state` and `action`
could produce two different results, purely because real time passed
between the calls. Generating the id at the call site (inside `onEquals`,
where `dispatch` is actually invoked) and handing it to the reducer as
part of the action keeps the law intact: everything the reducer needs is
sitting in its own two arguments, nothing borrowed from the outside world.

---

## Step 2 — Render History, Most Recent First

This feature is really four separate operations happening in a row: copy
the list, reverse the copy, walk it, and turn each entry into a piece of
JSX. Written out expanded, one operation per line, before compressing it:

```tsx
const newestFirst = [...state.history]; // Step A: copy
newestFirst.reverse();                  // Step B: reverse the copy in place
const rows = newestFirst.map((entry) => ( // Step C: walk the reversed copy
  <li key={entry.id} onClick={() => dispatch({ type: "setExpression", value: entry.expression })}>
    {entry.expression} = {entry.result}   // Step D: build one row's JSX
  </li>
));
```

Each step does exactly one thing: A copies, B reverses that copy, C visits
every entry in the now-reversed copy, D describes what one row looks like.
Confirm this works, then collapse it into the single-expression form
professionals actually write, doing the identical four steps with no
intermediate variables:

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

**CS lens — `.map()` over a reversed copy is still a linear scan, worth
noting since lesson 25 makes this precise.** Rendering `history` costs
time proportional to how many entries exist — an **O(n)** operation, the
same complexity class named formally in lesson 25 for `.reduce()`. For a
personal calculator's history list, realistically dozens or hundreds of
entries at most, this is invisible; the reason it's worth naming here at
all is so that when lesson 25 introduces a computation over this exact
same `history` array that genuinely *does* cause a felt slowdown, the
difference between "technically O(n)" and "expensive enough to matter" is
already a distinction you're equipped to make, rather than reaching for
optimization the instant any loop appears.

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
- [ ] You can explain why `HistoryEntry` needs its own `id` even though `expression` and `result` already describe it
- [ ] You can explain why rendering `history` is O(n) and why that's not currently a performance concern

---

*Next: Lesson 25 — Memoization: useMemo. A deliberately slow calculation
stops recomputing on every keystroke that has nothing to do with it.*
