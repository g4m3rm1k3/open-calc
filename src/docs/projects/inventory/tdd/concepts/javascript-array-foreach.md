# Concept: `Array.prototype.forEach`

**What you'll understand by the end:** how to run a function once per array element purely for its side effects, and how this differs from `.map()`'s value-producing transformation.

**Prerequisites:** `javascript-array-map.md`.

## Setup

Any JavaScript or TypeScript runtime — no install needed.

## The Problem

Sometimes an array needs to be processed not to build a new array of results, but purely to *do something* once per element — add each one to a UI, write each one to a log, insert each one into a scene. `.map()` (see `javascript-array-map.md`) always builds and returns a new array; using it purely for a side effect, discarding its return value, sends a misleading signal to a reader about what the code is actually for.

## The Isolated Example

```javascript
const names = ["Rex", "Fido", "Buddy"];

// Misusing .map() for a side effect
const mapResult = names.map((name) => {
    console.log(`Hello, ${name}`);
});

// Using .forEach() instead
const forEachResult = names.forEach((name) => {
    console.log(`Hello, ${name}`);
});

console.log(mapResult);
console.log(forEachResult);
```

**Real output:**
```
Hello, Rex
Hello, Fido
Hello, Buddy
Hello, Rex
Hello, Fido
Hello, Buddy
[ undefined, undefined, undefined ]
undefined
```

**What this proves:** both ran the callback once per element, correctly, producing identical printed output — but `.map()`'s return value (`[undefined, undefined, undefined]`) is a real, allocated array nobody asked for or will use, since the callback never returns anything meaningful. `.forEach()` returns `undefined` directly, honestly reflecting that it isn't meant to produce a value at all.

## Mechanical Walkthrough

- `array.forEach(callback)` calls `callback` once for every element, in order, exactly like `.map()` — but always returns `undefined`, and does not construct or return any new array.
- `.forEach()` cannot be **chained** the way `.map()`/`.filter()` can (`.forEach(...).map(...)` is meaningless, since `.forEach()`'s return value carries no data) — this is itself a signal of intent: a `.forEach()` call is always the *end* of a chain, never the middle.
- Both methods receive the same callback arguments (element, index, full array) and iterate in the same order — the only real difference is what happens to the callback's return value: `.map()` collects it; `.forEach()` discards it.

## Execution Trace

Both calls iterate the identical `names = ["Rex", "Fido", "Buddy"]`,
traced against the real output above:

- names.map((name) => { console.log(...); }):
  name="Rex":   logs "Hello, Rex"   → callback returns undefined (no return statement) → collected: [undefined]
  name="Fido":  logs "Hello, Fido"  → returns undefined → collected: [undefined, undefined]
  name="Buddy": logs "Hello, Buddy" → returns undefined → collected: [undefined, undefined, undefined]
  mapResult = [undefined, undefined, undefined]

- names.forEach((name) => { console.log(...); }):
  name="Rex":   logs "Hello, Rex"   → return value discarded
  name="Fido":  logs "Hello, Fido"  → return value discarded
  name="Buddy": logs "Hello, Buddy" → return value discarded
  forEachResult = undefined

Both loops call the identical callback, in the identical order, with
the identical side effect (`console.log`) — the only difference
anywhere in this trace is what happens to each call's return value
*after* it returns: collected into a real array, or thrown away.

## CS Lens

This is the practical distinction between code run for its **return value** versus code run for its **side effects** — `.map()` is a pure transformation (assuming its callback is pure), producing a new value with no observable effect beyond that; `.forEach()` is explicitly about causing something to happen (mutating some outside state, performing I/O), with its return value deliberately discarded as irrelevant. Naming this distinction explicitly, via which method is chosen, documents *intent* directly in the code, not just in a comment.

Also recognized in: Python's own convention of using a plain `for` loop for side effects but a list comprehension for building a new list — the identical distinction, expressed as a choice between two different syntactic forms rather than two different method names on the same object.

## SE Lens

Choosing `.forEach()` over `.map()` when a callback exists purely for its side effect is a real, small readability signal: a reader scanning `names.map(...)` reasonably expects the result to be used somewhere, and has to read the callback body to discover it isn't; `names.forEach(...)` states directly, by its name alone, "this runs something once per element, and produces nothing." The functional difference between them is minor (an unused array is cheap); the communicative difference to a future reader is the actual reason to choose correctly.

## Connection

Builds on `javascript-array-map.md`. Commonly used to add one drawable object per data element into a scene graph — see `threejs-geometry-material-object.md` for the surrounding context this exact iterate-and-add pattern appears in.

## Try It Yourself

1. Try to chain `.map()` after a `.forEach()` call (`array.forEach(fn).map(fn2)`) and read the real error — confirm `.forEach()`'s `undefined` return value has no `.map()` method of its own, direct proof it isn't meant to be chained.
2. Rewrite a `.forEach()` loop as an ordinary `for...of` loop instead, and compare readability — reasoning about when a plain loop might communicate intent just as clearly as `.forEach()`, and when the method call's brevity is a genuine improvement.
3. Use `.forEach()`'s second callback argument (the index) to add every-other-element special handling (`array.forEach((item, i) => { if (i % 2 === 0) console.log(item); })`), confirming it receives the same `(element, index, array)` signature `.map()`'s callback does.
