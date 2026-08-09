# Concept: `Array.prototype.map`

**What you'll understand by the end:** how to transform every element of an array into a new array of different values, one-to-one, without a hand-written loop.

**Prerequisites:** `javascript-arrow-functions.md`.

## Setup

Any JavaScript or TypeScript runtime — no install needed.

## The Problem

Converting an array of one shape into an array of a different shape — say, a list of `{x, y}` objects into a list of formatted strings — by hand requires: creating an empty result array, looping over every element of the source, computing the transformed value, and pushing it into the result. That's real, repetitive scaffolding around the one actually-meaningful line (the transformation itself) that has to be rewritten, correctly, every single time this shape of problem comes up.

## The Isolated Example

```javascript
const points = [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }];

// Hand-written loop version
const labelsLoop = [];
for (const p of points) {
    labelsLoop.push(`(${p.x}, ${p.y})`);
}

// .map() version
const labelsMap = points.map((p) => `(${p.x}, ${p.y})`);

console.log(labelsLoop);
console.log(labelsMap);
console.log(JSON.stringify(labelsLoop) === JSON.stringify(labelsMap));
```

**Real output:**
```
[ '(1, 2)', '(3, 4)', '(5, 6)' ]
[ '(1, 2)', '(3, 4)', '(5, 6)' ]
true
```

**What this proves:** both versions produce the identical result array — `.map()` isn't a different capability, it's the identical logic with the loop scaffolding (the empty array, the manual push) handled automatically, leaving only the transformation itself written out.

## Mechanical Walkthrough

- `array.map(callback)` calls `callback` once for every element of `array`, in order, and collects each call's return value into a brand-new array, the same length as the original.
- The original array (`points`) is never modified — `.map()` always returns a new array, leaving the source untouched (this matters when the source array is shared or reused elsewhere).
- The callback receives up to three arguments — the element, its index, and the whole array being mapped — though most uses (as here) only need the element itself.
- Because `.map()` always produces one output per input, it's the wrong tool when the desired output has a *different* number of elements than the input (filtering some out, or expanding one into several) — those are different, related array methods (`.filter()`, `.flatMap()`) built on the same general idea.

## Execution Trace

Both versions run against `points = [{x:1,y:2}, {x:3,y:4}, {x:5,y:6}]`:

- Hand-written loop:
  Start: labelsLoop = []
  p={x:1,y:2}: labelsLoop.push("(1, 2)") → labelsLoop = ["(1, 2)"]
  p={x:3,y:4}: labelsLoop.push("(3, 4)") → labelsLoop = ["(1, 2)", "(3, 4)"]
  p={x:5,y:6}: labelsLoop.push("(5, 6)") → labelsLoop = ["(1, 2)", "(3, 4)", "(5, 6)"]

- .map() version:
  p={x:1,y:2}: callback returns "(1, 2)" → collected
  p={x:3,y:4}: callback returns "(3, 4)" → collected
  p={x:5,y:6}: callback returns "(5, 6)" → collected
  labelsMap = ["(1, 2)", "(3, 4)", "(5, 6)"]

- JSON.stringify(labelsLoop) === JSON.stringify(labelsMap) → true

Both traces visit the same 3 elements in the same order and produce the
identical string at each step — `.map()` isn't computing anything
different, it's just not making the caller write `labelsLoop = []` and
`.push(...)` by hand.

## CS Lens

`.map()` is the direct JavaScript instance of the general **map** higher-order function found across functional programming — applying one function to every element of a collection, independently, producing a new collection of results. It is deliberately distinct from **fold/reduce** (see `fold-reduce-pattern.md`), which combines a collection down into a single accumulated value rather than producing one output per input — `.map()` preserves the collection's shape (same length, transformed contents); `.reduce()` collapses it.

Also recognized in: Python's `map()` builtin or, more idiomatically, a list comprehension (`[transform(x) for x in items]`); nearly every language with first-class functions provides some form of this exact operation, often under the identical name.

## SE Lens

Beyond avoiding repeated loop boilerplate, `.map()`'s real engineering value is that its *shape* — "this is a one-to-one transformation, nothing else" — is visible to a reader at a glance, purely from the method name, without reading the loop body to confirm nothing unexpected also happens inside it (an early return, a mutation of some outer variable, a skipped element). A hand-written `for` loop could, in principle, do any of those things too; `.map()`'s narrower contract is exactly what makes it more predictable to read and to reason about.

## Connection

Builds on `javascript-arrow-functions.md`. Used directly to convert this project's own plain `{x, y, z}` point objects into whatever shape a rendering library's own vertex type requires — see `threejs-geometry-material-object.md` for `.map()` applied to exactly that conversion.

## Try It Yourself

1. Chain `.map()` with `.filter()` (`points.filter((p) => p.x > 2).map((p) => p.x)`) and reason about the order the two operations run in, and why `.filter()` first here reduces the amount of work `.map()` then has to do.
2. Use the callback's second argument (the index) to produce labeled output (`points.map((p, i) => \`point ${i}: (${p.x}, ${p.y})\`)`), confirming `.map()` provides the index for free, with no separate counter variable needed.
3. Try calling `.map()` on an empty array (`[].map((x) => x * 2)`) and confirm it returns `[]` with no error — reasoning about why this is the correct, unsurprising behavior for "transform every element" when there are zero elements to transform.
