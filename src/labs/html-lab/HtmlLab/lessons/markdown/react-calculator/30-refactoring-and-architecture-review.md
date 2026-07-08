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

**PL lens — naming the general shape of the bug being fixed here: a code
smell.** A **code smell** is a real, established term for a pattern in
working, correct code that isn't itself a bug, but reliably signals a
deeper structural problem worth investigating — duplicated logic is one of
the most common and well-known examples. The word is chosen carefully: a
smell is not proof of rot, the way an actual bug is proof of a mistake, but
it's a strong enough signal that experienced engineers learn to stop and
look whenever they notice one, exactly what Step 1 is doing on purpose.

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

**Walkthrough — `withCurrentValue` is itself a closure, the same concept
lesson 06 first named.** `withCurrentValue`, defined inside `Calculator`,
reads `state.expression` directly in its body without receiving it as a
parameter — it can do this because it's a closure: a function that
remembers the variables in scope where it was *defined*, not just the ones
it's explicitly handed. This is exactly why `withCurrentValue` couldn't be
moved out to `engine.ts` alongside `evaluate` — it isn't pure; it reaches
into `Calculator`'s own `state`, which is precisely the kind of thing the
engine/UI boundary from lesson 08 forbids on the engine side. It belongs
in `Calculator.tsx`, coupled to this component's state, for a real
structural reason, not by accident.

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

**Walkthrough — what an actual unit test for `evaluate` would look like,
concretely, since Step 2's refactor is exactly the situation tests exist
for.** A **unit test** is a small, automated piece of code that calls one
function with a known input and checks its output against a known-correct
answer, with no human needing to click through the UI by hand each time.
This project has none (none of this project's own file structure sets up a
test runner), but it's worth seeing the shape, since `engine.ts`'s
functions are exactly the kind of code unit tests are built for:

```typescript
// what a real test file for this project might contain
if (evaluate("2+3×4").kind !== "success" || evaluate("2+3×4").value !== 14) {
  throw new Error("evaluate('2+3×4') should equal 14");
}
```

A real test framework (like Vitest, already used elsewhere in this
repository's own test suite) replaces the hand-rolled `if`/`throw` above
with a cleaner `expect(evaluate("2+3×4")).toEqual({ kind: "success", value:
14 })`, and runs every such check automatically, in seconds, every time the
code changes. **This is exactly what would have caught Step 1's
duplication risk automatically**: if `withCurrentValue`'s refactor had
accidentally changed behavior, a real test suite would fail immediately,
instead of relying on a human noticing during manual re-testing. A test
that fails specifically because a change broke something that used to work
is called catching a **regression** — the single biggest reason
professional codebases invest in automated tests at all: not to catch new
bugs in new code, but to catch old, working code quietly breaking as a side
effect of something else changing.

**SE lens — what "architecture" actually means, defined precisely for a
lesson with that word in its title.** Every individual line of this
project's code could be correct — every function returning the right
answer, every button doing the right thing — and the project could still
have *bad* architecture. **Architecture** is the set of decisions about
how a codebase is divided into parts and how those parts are allowed to
depend on each other — not what any single function computes, but the
shape of the whole. This project's one sentence per file, in the table
above, is architecture made checkable: it's a direct test of whether the
**Single Responsibility Principle** — a component or module should have
exactly one reason to change — actually held, file by file, rather than
being a slogan applied only when it was convenient to.

**CS lens — cohesion and coupling, the two forces every one-sentence
description is actually measuring.** **Cohesion** is how tightly a single
file's own responsibilities belong together — `Display.tsx` is highly
cohesive: everything in it is about showing a value, nothing else.
**Coupling** is how much one file depends on the internal details of
another — `Button.tsx` is deliberately, minimally coupled to everything
around it: it reports a click and knows nothing about what that click
means, which is exactly why the same `Button` works identically in
`Keypad`, `MemoryPanel`, and `ScientificPad` without modification. The
general engineering goal these two forces point toward — high cohesion
within a file, low coupling between files — is not a rule specific to
React or to this project; it's the same measure a senior engineer applies
when reviewing any codebase in any language, and this project's own file
table is a small, concrete, checkable instance of applying it.

**CS lens — dependency direction, the module-level version of a rule this
project already lived by inside the component tree.** Lesson 07 stated
that data flows down a component tree and never back up uninvited. The
same idea holds one level higher, between whole files: `engine.ts` has
zero imports from any `.tsx` file in this project — nothing in it knows
`Calculator`, `Display`, or `Button` exist — while every UI file that
needs arithmetic imports directly from `engine.ts`. Drawing an arrow from
every file to whatever it depends on produces this project's **dependency
graph**: an arrow-only-downward structure, with `engine.ts` at the bottom,
depended on by everything above it, dependent on nothing itself. A
dependency arrow pointing the other way — `engine.ts` importing anything
from `Calculator.tsx` — would be the single clearest possible violation of
this project's founding promise, and the fact that no such arrow exists
anywhere in this codebase is the real, mechanical proof that the promise
held, not just an intention stated once in the README and never checked
again.

**Connect to the real world — why this specific dependency direction is
what makes `engine.ts` genuinely, trivially testable.** A real, production
consequence of `engine.ts` depending on nothing UI-related: every function
in it — `tokenize`, `parseExpression`, `evaluate` — can be tested by
calling it directly with plain data and checking its plain return value,
with no browser, no DOM, no rendering, and no React involved at all. This
is not a hypothetical benefit; it is the actual, standard reason
professional codebases separate "pure logic" from "UI" as deliberately as
this project did from lesson 08 onward — pure functions are the cheapest,
fastest, most reliable things in any codebase to verify automatically,
and every function in `engine.ts` qualifies, specifically because it never
once reached for `useState`, a click, or a DOM element.

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

**SE lens — naming what "kept growing" actually costs: technical debt.**
**Technical debt** is the accumulated cost of choices that were reasonable
at the time — a `switch` statement that started small, a component that
picked up one more `useState` call per feature — but that make *future*
change progressively more expensive the longer they go unaddressed. It's
called debt deliberately, as a real financial metaphor: like a loan, it's
not inherently wrong to take on (this project's `calculatorReducer` was
the right choice at every step it grew), but it accrues a kind of
interest — the next feature takes a little longer to add safely than the
last one did — and at some point, paying it down (splitting the reducer,
splitting the component) becomes cheaper than continuing to carry it. This
lesson's Step 1–2 refactor was a small, real repayment of exactly that
kind of debt; Step 4 is naming, honestly, the larger debt this project
chose not to repay, because the project chose to stop growing before it
became worth the cost.

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
- [ ] You can define architecture, cohesion, and coupling in your own words, and point to one file in this project that exemplifies each
- [ ] You can trace this project's dependency graph and explain why no arrow in it ever points from `engine.ts` toward a UI file
- [ ] You can explain what technical debt is, using this project's own `calculatorReducer` as the honest example
- [ ] You can explain what a unit test is and what a regression is, using `withCurrentValue`'s refactor as the concrete example

---

*This is the last lesson in the React Calculator series. Every concept in
the original table this project opened with — components, props, state,
events, lists, lifting state, conditional rendering, forms, context,
effects, reducers, custom hooks, memoization, React.memo, routing,
composition, error boundaries, performance, architecture, and
refactoring — is now something you have built, broken, and fixed,
yourself, at least once.*
