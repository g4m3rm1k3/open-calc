# React Calculator — Lesson 25 — Memoization: useMemo

## What You Will Build

A running total of every historical result, displayed below the history
list — and a real, felt lag every time a digit button is pressed, the
moment before this lesson fixes it. This is the first feature in this
project deliberately built slow, on purpose, so removing the slowness
means something.

---

## What You Need to Know First

Lesson 24 — `state.history: HistoryEntry[]`, growing by one entry per
successful calculation.

---

## Step 1 — Add a Deliberately Slow Computation

Add to `engine.ts`:

```typescript
// Deliberately wasteful — a stand-in for a genuinely expensive computation
// this project doesn't otherwise have a reason to need. The wasted loop
// exists purely to make a real, felt slowdown possible to demonstrate.
function expensiveHistoryTotal(history: { result: string }[]): number {
  let wastedWork = 0;
  for (let i = 0; i < 5_000_000; i++) {
    wastedWork += Math.sqrt(i);
  }
  return history.reduce((total, entry) => total + Number(entry.result), 0);
}
```

In `Calculator.tsx`, call it and display the result:

```tsx
const historyTotal = expensiveHistoryTotal(state.history);
```

```tsx
<p className="history-total">Total of all results: {historyTotal}</p>
```

Click **▶ Preview**. Compute a calculation or two. Then just press digit
buttons — `1`, `2`, `3` — with nothing to do with history at all. Notice
the real, felt delay after every single press.

**Walkthrough — why every digit press pays this cost.** `Calculator`
re-renders on *every* state change — a digit press dispatches an action,
`calculatorReducer` returns a new state, React re-renders `Calculator` to
match. `expensiveHistoryTotal(state.history)` is called fresh, from
scratch, on every single one of those re-renders — even though its actual
*answer* only changes when `state.history` itself changes, which is far
less often than the display's `expression` string changes while someone
is just typing.

**Performance, made concrete: what "hot path" means and the actual
budget.** Code that runs once, at startup, has a cost so small it's
essentially free. Code that runs on *every* keystroke — a **hot path**,
code executed repeatedly, often, in direct response to user action — has a
cost that compounds, keystroke after keystroke, for as long as someone
keeps typing. Browsers redraw the screen at up to **60 frames per
second**, meaning there is roughly **16.6 milliseconds** of budget between
each frame for all the JavaScript triggered by that frame to finish
running. `expensiveHistoryTotal`'s deliberately wasteful loop is written
specifically to blow well past that budget on purpose — the lag felt in
Step 1 *is* several frames' worth of budget being missed in a row,
JavaScript being single-threaded meaning nothing else (including the
actual screen repaint) can happen while that loop is still running.

---

## Step 2 — Memoize It

```tsx
const historyTotal = React.useMemo(
  () => expensiveHistoryTotal(state.history),
  [state.history]
);
```

Click **▶ Preview** again. Type digits — the lag is gone. Compute a new
calculation — the total updates correctly, with the expected brief delay,
exactly when it actually needs to.

**CS lens — naming the actual cost, with Big-O notation.** `expensiveHistoryTotal`'s
loop runs a fixed 5,000,000 iterations regardless of how large `history`
actually is — a **constant-time** cost in Big-O terms, written **O(1)**,
meaning "a fixed amount of work, independent of input size" (the `.reduce`
call afterward is a separate, genuinely **O(n)** cost, proportional to
`history`'s length, but negligible next to five million wasted square
roots). The *label* "expensive" here isn't about how the cost scales — it's
about the cost being large in absolute terms, paid needlessly, over and
over, on every render. Big-O notation is normally used to compare how an
algorithm's cost *grows* with input size; this lesson's bug is a reminder
that a cheap-scaling but frequently-repeated computation can be just as
real a performance problem as a badly-scaling one.

**Connect to the real world — a famous, often-misquoted line worth
stating precisely.** Donald Knuth, a foundational figure in computer
science, wrote: "premature optimization is the root of all evil" — but the
full quote continues, "yet we should not pass up our opportunities in that
critical 3%." The point was never "never optimize" — it was "don't
optimize before you know where the real cost is." Step 1 of this lesson
did exactly what Knuth actually recommended: build the feature plainly
first, *measure* the felt lag, confirm it's real, and only then reach for
`useMemo` — never wrap every value in memoization by default, on the
guess that it might matter somewhere.

**Walkthrough — `useMemo(factory, dependencies)`.** `useMemo` calls the
function it's given (`factory`) and remembers both the result and the
dependency values that produced it. On every later render, it checks: has
any dependency in the array actually changed since last time? If not, it
skips calling `factory` again entirely and just hands back the previously
remembered value. If a dependency *has* changed, it calls `factory` again
and remembers the new result. `[state.history]` means "only recompute when
`state.history` is a genuinely new array" — exactly the condition under
which `expensiveHistoryTotal`'s answer could possibly be different.

**CS lens — this is memoization, a classic technique, not a React-specific
idea.** **Memoization** means caching a function's output, keyed by its
input, so a later call with the same input can return the cached answer
instead of redoing the work. This project has already built a version of
this same idea once before: the TypeScript Spreadsheet project's own
lesson 14 (Recalculation Performance) tracked which cells were "dirty"
specifically to avoid recomputing formulas that hadn't actually changed.
`useMemo` is React's built-in version of that exact strategy, generalized
to any single computed value instead of a whole spreadsheet of cells.

**Walkthrough — `useMemo` versus `useEffect`, a distinction worth being
precise about.** Both take a function and a dependency array, and both
skip re-running when dependencies haven't changed — it's easy to blur them
together. `useEffect`'s function runs **after** rendering finishes, for
**side effects** (writing to `localStorage`, in lesson 23) — its return
value (other than an optional cleanup function) is thrown away. `useMemo`'s
function runs **during** rendering, computes a **value**, and that value
is used immediately, right there, as part of what gets displayed.
`useEffect` answers "what should happen after this render, as a
consequence of it?" `useMemo` answers "what value do I need, right now, to
even produce this render, without recomputing it needlessly?"

**Walkthrough — how `[state.history]` is actually compared, precisely.**
React does not deeply inspect `state.history`'s contents to decide whether
it "changed" — it compares the dependency to its previous value using the
same algorithm `Object.is` uses, essentially identical to `===` for
everyday values. This is *reference* comparison for arrays and objects,
exactly the same rule `React.memo` used in lesson 26 for props. It's why
`calculatorReducer`'s `{ ...state, history: [...state.history, entry] }`
(lesson 24) genuinely matters here, not just for the reducer's own
immutability rule: creating a *new* array reference only when an entry is
actually added is precisely what lets `useMemo`'s comparison correctly
say "unchanged" on every render that doesn't touch history, and "changed"
on the one that does.

**Walkthrough — render phase versus commit phase, a distinction that
explains exactly when this cost was being paid.** React's work on every
update happens in two phases: the **render phase**, where a component
function actually runs and computes what it wants the UI to look like
(this is where `expensiveHistoryTotal(state.history)` was being called,
directly inside `Calculator`'s function body), and the **commit phase**,
where React takes that result and actually writes the real changes to the
DOM. `useMemo`'s check happens right at the start of the render phase,
before the expensive call — skipping it there means the wasted work never
has a chance to run at all, rather than running and then somehow being
"undone" later. This is also why `useMemo`'s factory function must stay
pure, with no side effects — the render phase can, in principle, run more
than once for a single eventual commit under some of React's internal
scheduling behavior, a guarantee that would break immediately if the
factory function did anything besides compute and return a value.

**SE lens — `useMemo` is an optimization, not a correctness guarantee, and
should be reached for accordingly.** Removing the `useMemo` here changes
*performance*, not the actual computed answer — `historyTotal` would still
eventually be correct either way, just recalculated more often than
necessary. This is why `useMemo` is something to add once a real, felt, or
measured slowdown exists (exactly what Step 1 deliberately manufactured),
not something to wrap around every computed value in a component
preemptively — memoizing a computation that was already fast enough adds
a dependency-comparison cost of its own, for no real benefit.

---

## Connect the Pieces

```
engine.ts        expensiveHistoryTotal() — an intentionally slow stand-in,
                 clearly labeled as artificial
Calculator.tsx   historyTotal now wrapped in useMemo, keyed on
                 state.history specifically — not on state as a whole,
                 which changes on every keystroke
```

---

## What Breaks Without This

Already demonstrated, live: without `useMemo`, every digit press —
completely unrelated to history — pays the full cost of recomputing
`expensiveHistoryTotal` from scratch, a real, felt lag on every keystroke
that has nothing to do with the value actually being recomputed.

**A subtler mistake, worth naming:** memoizing with the wrong dependency —
for example, `useMemo(() => expensiveHistoryTotal(state.history), [])`,
an empty array. This "fixes" the lag completely, but for the wrong reason:
the computation now runs exactly once, ever, and never updates again, even
after new calculations are added to history. A `useMemo` with the wrong
dependency array doesn't fail loudly — it just quietly shows a stale
answer forever, which is why the dependency array must list every value
the computation actually depends on, honestly, not just enough to make a
warning disappear.

---

## Definition of Done

- [ ] Typing digits no longer causes a felt delay
- [ ] The history total still updates correctly after a new calculation
- [ ] You can explain what memoization is, using the TypeScript Spreadsheet project's dirty-cell tracking as a parallel
- [ ] You can explain the difference between what `useMemo` and `useEffect` are each for
- [ ] You can explain why an empty dependency array here would be a real, silent bug
- [ ] You can explain what render phase and commit phase are, and why `useMemo`'s factory must stay pure
- [ ] You can explain why `useMemo`'s dependency comparison is reference equality, not a deep comparison

---

*Next: Lesson 26 — React.memo: Stopping Unnecessary Button Re-renders.
`useMemo` skips recomputing a value; `React.memo` skips re-rendering an
entire component.*
