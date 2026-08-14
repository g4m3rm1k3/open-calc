# Concept: The Spread Operator (`...`) in a Function Call

**What you'll understand by the end:** how to take a real array whose
length you don't know ahead of time and pass its elements to a function
that expects them one at a time, without writing a loop.

**Prerequisites:** `javascript-arrow-functions.md`, `typescript-array-types.md`.

## Setup

Any JavaScript runtime — a browser console or Node.js. No install needed.

## The Problem

`Math.max` (and its sibling `Math.min`) is a real, built-in function
that accepts any number of separate arguments — `Math.max(3, 7, 2)` —
and returns the largest. It does **not** accept a single array:
`Math.max([3, 7, 2])` returns `NaN`, because the whole array is treated
as one unexpected argument, not three numbers. But real data usually
arrives as an array (a list of sequence numbers parsed out of a
program, of unknown length until the program is actually read) — there
is no way to write `Math.max(numbers[0], numbers[1], numbers[2], ...)`
by hand when you don't know how many elements `numbers` holds.

## The Isolated Example

```javascript
const scores = [3, 7, 2, 9, 4];

console.log("without spread:", Math.max(scores));
console.log("with spread:", Math.max(...scores));
```

**Real output, this session:**
```
without spread: NaN
with spread: 9
```

**What this proves:** `Math.max(scores)` failed — one array argument
is not the same thing as five number arguments. `Math.max(...scores)`
produced the correct answer — `...scores` expanded the array into five
separate arguments at the call site, exactly as if `Math.max(3, 7, 2,
9, 4)` had been typed by hand, regardless of how many elements
`scores` actually holds.

## Mechanical Walkthrough

- `scores` — **(b) reappearing**, a plain JavaScript array
  (`typescript-array-types.md`).
- `Math.max(scores)` — **(a) first appearance**, calling a function
  with one array argument. `Math.max` receives exactly one argument (an
  array object), tries to compare it as if it were a number, and fails
  — this is *not* the same operation as passing the array's contents.
- `...scores` — **(a) first appearance**, the spread operator inside a
  function call. At the exact position it appears, JavaScript replaces
  it with the array's elements, each becoming its own, separate
  argument. `Math.max(...scores)` is mechanically identical to typing
  `Math.max(3, 7, 2, 9, 4)` — the number of arguments actually varies
  with the array's real length at that moment, decided at runtime, not
  written out by hand.

## CS Lens

This is **argument expansion** — turning one aggregate value (an array)
into the individual arguments a *variadic* function (one that accepts
any number of arguments, like `Math.max`) actually expects. It is the
inverse of a **rest parameter** (`function f(...args)`, not used here
but the same `...` syntax on the receiving end instead of the calling
end) — spread expands a collection into separate values; rest collects
separate values back into one array.

Also recognized in: Python's `*args` unpacking a list into positional
arguments (`max(*scores)` is the exact same idea, different language),
SQL's `IN (...)` clause conceptually expanding a list into individual
comparisons, and shell scripting's `"$@"` expanding an array of
arguments into separate words passed to a command.

## SE Lens

The alternative — writing a loop that tracks a running maximum by hand
(`let max = -Infinity; for (const value of scores) { if (value > max)
max = value; }`) — is correct, but re-implements logic `Math.max`
already provides, and is easy to get subtly wrong (an empty array, the
wrong starting value). Using `Math.max(...scores)` delegates the actual
comparison logic to a built-in, well-tested function, and only supplies
the one thing that's genuinely project-specific: which numbers to
compare. This is the same instinct behind preferring a standard
library function over a hand-rolled loop whenever one already exists
and matches the need exactly.

## Connection

Builds on `typescript-array-types.md` (the array being spread) and
`javascript-arrow-functions.md`-style unfamiliarity with concise
syntax generally. Used directly in `cnc-editor-electron/src/program-summary.ts`'s
`summarizeProgram`, where `Math.min(...sequenceNumbers)` and
`Math.max(...sequenceNumbers)` derive a program's sequence-number range
from an array whose length is only known once the program's text has
actually been scanned.

## Try It Yourself

1. Spread an empty array into `Math.max(...[])` and observe the real
   result (`-Infinity`) — this is why `summarizeProgram` checks
   `sequenceNumbers.length > 0` before calling `Math.max`/`Math.min` at
   all, rather than trusting the spread call directly on a possibly-empty
   array.
2. Use spread to combine two arrays into a third: `[...a, ...b]`.
   Confirm the result is one flat array, not an array containing two
   arrays — the same expansion behavior, used inside an array literal
   instead of a function call.
3. Try spreading a `string` instead of an array into `Math.max(...".")`.
   Reason about why this produces `NaN` (a string spreads into its
   individual *characters*, not numbers) — proof spread doesn't know or
   care what a function does with the values it produces; it purely
   expands an iterable.
