# React Calculator — Lesson 30 — Refactoring & Architecture Review

## What You Will Build

No new feature. One real piece of duplicated code, present since lesson
20 and quietly repeated twice more since, finally gets extracted — and
every file this project has built gets a deliberate second look, checked
against the promise this project opened with in its own
[README](README.md): the math engine is not React, and React is not the
math engine.

---

## What You Need to Know First

Lesson 29 — a complete, working Student Scientific Calculator: basic and
scientific arithmetic, memory, a persisted formula library, history,
settings, and a safety net around the one place this project deliberately
demonstrated a real crash.

---

## Step 1 — Notice the Duplication

Three functions in `Calculator.tsx` — `handleMemoryStore`,
`handleMemoryAdd`, `handleMemorySubtract` — share an identical shape:

```tsx
function handleMemoryStore(): void {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind === "success") memoryStore(outcome.value);
}

function handleMemoryAdd(): void {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind === "success") memoryAdd(outcome.value);
}

function handleMemorySubtract(): void {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind === "success") memorySubtract(outcome.value);
}
```

**SE lens — the Rule of Three.** One repeated shape is a coincidence. Two
is worth noticing. Three, appearing independently across separate
lessons, each added for a genuine, unrelated reason at the time, is a real
signal: this project has been quietly duplicating "evaluate the current
expression, and if it succeeded, do something with the number" three
separate times. Duplication like this is easy to miss while it's being
written one instance at a time — each individual function looked
perfectly reasonable on its own. It becomes obvious only in hindsight,
which is exactly why a dedicated review lesson, done once at the end,
catches things no single earlier lesson would have had a reason to.

---

## Step 2 — Extract the Shared Shape

```tsx
function withCurrentValue(action: (value: number) => void): void {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind === "success") action(outcome.value);
}
```

```tsx
function handleMemoryStore(): void { withCurrentValue(memoryStore); }
function handleMemoryAdd(): void { withCurrentValue(memoryAdd); }
function handleMemorySubtract(): void { withCurrentValue(memorySubtract); }
```

Click **▶ Preview**. Every memory button still works exactly as before —
this refactor changes nothing about what the calculator does, only how
its own code is organized.

**Walkthrough — `withCurrentValue`, a function that takes a function.**
`action: (value: number) => void` is a parameter that is itself a
function — `withCurrentValue` doesn't know or care *what* happens with
the evaluated number, only that evaluating it and checking for success is
common work every caller needs done first. `memoryStore`, `memoryAdd`, and
`memorySubtract` are each passed directly as `action`, since all three
already have exactly the right shape (`(value: number) => void`) —
`withCurrentValue(memoryStore)` reads as "evaluate the display, and if it
worked, store it," with the actual storing left entirely to the function
handed in.

**CS lens — this is called Higher-Order Function composition, the same
idea `.map()` and `.filter()` have used since lesson 04.** A function
that accepts another function as an argument, or returns one, is a
**higher-order function**. `.map()` takes a function describing how to
transform one item; `withCurrentValue` takes a function describing what
to do with one number. Recognizing this shape is what made the
duplication fixable in one line each, instead of three separate, subtly
different rewrites.

---

## Step 3 — Verify the Core Promise, File by File

Open `engine.ts` from top to bottom. Confirm, by reading it, that it
contains **zero** references to `React`, `useState`, `JSX`, or anything
resembling a button or a click — every function in it takes plain data
and returns plain data, nothing else.

Then walk the rest of the project and restate, in one sentence each, what
single thing every file is actually responsible for:

```
engine.ts             Every rule of arithmetic, parsing, and evaluation —
                       zero React, exactly as promised in lesson 08
Calculator.tsx         Owns every piece of state, and is the only place
                       that calls dispatch() or the memory/settings hooks
Display.tsx            Shows a value — no state, no logic
Button.tsx              Reports a click — no idea what it means
Keypad.tsx              Renders the digit and operator buttons
MemoryPanel.tsx         Renders the memory buttons
ScientificPad.tsx       Renders sin/cos/tan and the angle mode toggle
FormulaEditor.tsx       A controlled form; saves or updates one formula
CalculatorErrorBoundary.tsx  The one class in this project — catches
                       render-time crashes beneath it
Tabs.tsx                A reusable, generic tab bar
SettingsPanel.tsx       Reads and writes theme, precision, and angle mode
useMemory.ts            One independent, reusable memory slot
useHashRoute.ts         A tiny, real router built from a browser API
```

**If any file's one-sentence description needed the word "and" to connect
two unrelated things, that file is a candidate for splitting — check
whether any of yours do.**

---

## Step 4 — What Would Strain If This Project Kept Growing

This project deliberately stops at a Student Scientific Calculator, not a
graphing calculator with a dozen modes. Worth naming honestly, as a
capstone, what would actually start to hurt if it didn't stop here:

**`calculatorReducer`'s `switch` statement would keep growing.** Every new
kind of action this project has added since lesson 18 has meant one more
`case`. A calculator with a programmer mode (binary/hex conversion) and a
geometry mode (shape formulas) would plausibly need dozens more. Real,
large applications facing this same growth typically split one big reducer
into several smaller ones, each owning a slice of the overall state — a
pattern with its own name and its own tools once a project reaches that
size, deliberately not needed here.

**`Calculator.tsx` itself would keep absorbing new pieces of state.** Every
new capability this project has added has meant one more `useState`,
`useReducer`, or custom hook call inside `Calculator`. This is a real,
common shape production React components grow into — the point at which a
"god component" holding everything becomes worth splitting is a judgment
call, not a fixed line, and this project's own `Calculator.tsx` is closer
to that line than any other file in it.

**Connect to the real world.** Every concept this project built —
components, props, state, lists, lifted state, conditional rendering,
context, reducers, custom hooks, memoization, composition, error
boundaries — is exactly what a production React codebase is built from,
at a larger scale, with more files, more contributors, and more time
pressure than this project ever had. Nothing you learned here stops
applying once the codebase gets bigger; the *judgment calls* — when to
split a component, when to introduce a reducer, when a `useMemo` is worth
its own cost — are what experience sharpens, and this project handed you
a real, working example of every one of them, already made once, for you
to recognize the next time you have to make the same call yourself.

---

## Connect the Pieces

The whole project, now — engine and UI, exactly as separate as lesson 01
promised they would be.

---

## What Breaks Without This

Nothing breaks by skipping this lesson's refactor — the calculator worked
identically before and after `withCurrentValue` existed. That is precisely
the point a capstone review makes: correctness and good architecture are
different axes. Code can work perfectly and still be quietly
accumulating the kind of duplication that makes the *next* change harder
than it needed to be. Catching that before it compounds further is the
entire value of stopping to look, deliberately, even when nothing is
currently on fire.

---

## Definition of Done

- [ ] `withCurrentValue` replaces the three duplicated memory handlers, with identical behavior
- [ ] You've confirmed, by reading it, that `engine.ts` contains no React
- [ ] You can give a one-sentence responsibility for every file in this project
- [ ] You can name at least one real thing that would need to change if this project grew to ten more calculator modes
- [ ] You can point to at least one place in this project where you'd make a different choice today than the lesson made, and explain why

---

*This is the last lesson in the React Calculator series. Every concept in
the original table this project opened with — components, props, state,
events, lists, lifting state, conditional rendering, forms, context,
effects, reducers, custom hooks, memoization, React.memo, routing,
composition, error boundaries, performance, architecture, and
refactoring — is now something you have built, broken, and fixed,
yourself, at least once.*
