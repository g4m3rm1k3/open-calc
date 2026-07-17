---
concept: 215-mapped-types
name: Mapped Types (TypeScript)
---

## Definition

A mapped type generates a new type by iterating over the KEYS of an
existing type and transforming each corresponding property — `{ [K in
keyof T]: NewType }` — letting you programmatically derive a related
type's shape from an original, rather than writing it out property by
property.

## Problem

Deriving a new type where EVERY property needs the SAME transformation
applied (make everything optional, make everything nullable) by manually
re-listing every property one at a time duplicates the original type's
property names, and any change to the original type's properties requires
manually updating the duplicate too. Mapped types iterate the original
type's keys AUTOMATICALLY, applying the transformation uniformly, keeping
the derived type in sync.

## Execution

An interface defines a shape with two properties
↓
A mapped type says: for EVERY key `K` in `T`, produce a property of type
"the original type OR null"
↓
Applying that mapped type to the interface produces a new shape where
every original property is now nullable — automatically, without listing
each property by hand in the mapped type's own definition
↓
This is exactly how TypeScript's own built-in `Partial<T>` is
implemented, adding the `?` modifier via the same mapped type mechanism
instead of a "null" union
↓
If the original interface later gains a THIRD property, the mapped type
automatically includes a transformed version of it too, with ZERO
changes needed to the mapped type's own declaration

## Computer Science

`keyof T` produces a UNION of all of `T`'s property names as
string-literal types, and `[K in keyof T]` iterates that union, similar
in spirit to a `for...in` loop but operating entirely at the TYPE level,
at compile time — this is TypeScript's mechanism for genuinely
programmatic type transformation, rather than just static type
declarations.

Tags: keyof operator, Type-level iteration, Compile-time transformation

## Software Engineering

Mapped types are the underlying mechanism behind most of TypeScript's
built-in utility types (`Partial`, `Readonly`, and a related mechanism
for `Pick`) — understanding mapped types explains WHY those utilities
behave the way they do, and unlocks writing custom equivalents for
transformation patterns the built-ins don't already cover.

Tags: Utility type internals, Custom type transformations, Reusable patterns

## Common Mistakes

- Manually re-declaring a type with the SAME transformation applied to every property, one at a time, instead of writing a general mapped type — this duplicates the original type's property list and requires manual updates if the original ever changes.
- Confusing a mapped type's SYNTAX (`{ [K in keyof T]: ... }`) with an INDEX SIGNATURE (`{ [key: string]: ... }`) — despite looking superficially similar, they serve different purposes: a mapped type iterates a SPECIFIC, KNOWN set of keys from another type, while an index signature describes an OPEN-ENDED object with arbitrary string keys.

## Exercises

- Trace through what the mapped type below expands to if the original interface gains a third property — write out the full expanded shape.
- Explain the difference between `[K in keyof T]: T[K]` (preserving each property's original type) and `[K in keyof T]: string` (forcing every property to `string`, regardless of its original type).

## typescript

```typescript
interface Point {
  x: number
  y: number
}

type Nullable<T> = { [K in keyof T]: T[K] | null };

function clearPoint(): Nullable<Point> {
  const result = {} as Nullable<Point>
  result.x = null
  result.y = null
  return result
}

function movePoint(p: Point, dx: number, dy: number): Point {
  return { x: p.x + dx, y: p.y + dy }
}

const cleared = clearPoint()
console.log(cleared)   // { x: null, y: null }

const x = 1
const y = 2
const start: Point = { x, y }
const moved = movePoint(start, 3, 4)
console.log(moved)   // { x: 4, y: 6 }
```
Walkthrough: `Nullable<Point>` derives `{ x: number | null; y: number |
null }` from `Point`'s original shape, so `clearPoint` can validly build
`{ x: null, y: null }` — a shape `Point` itself would reject (since
`Point`'s own `x`/`y` require an actual `number`). `movePoint` uses the
original, non-nullable `Point` type directly, demonstrating both the
original and its mapped-derived variant being used side by side.
