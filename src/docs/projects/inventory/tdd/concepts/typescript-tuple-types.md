# Concept: TypeScript Tuple Types

**What you'll understand by the end:** how to type an array whose *length*
and *per-position* types are both fixed and known ahead of time, and why
that's a real, checked guarantee that a same-typed array (`number[]`)
cannot make.

**Prerequisites:** `typescript-array-types.md`, `javascript-destructuring.md`.

## Setup

Any TypeScript project — no install beyond `typescript` itself:
```
npm install --save-dev typescript
```

## The Problem

A function that always returns exactly three related numbers — the red,
green, and blue channels of a color, say — could type its return value as
`number[]`. That compiles, and reads fine at the call site. But `number[]`
means "zero or more numbers," not "exactly three." A caller writing
`const [r, g, b] = getChannels()` is trusting, not checking, that `b` will
ever actually exist — if the function's implementation ever returned only
two numbers, nothing in the type system would object, and `b` would be
silently `undefined` at every call site, discovered only when something
downstream tries to use it.

## The Isolated Example

```typescript
function hexToRgb(hex: string): [number, number, number] {
  return [0, 0, 0];
}

const [r, g, b] = hexToRgb("#ffffff");
console.log(r, g, b);

// A same-typed array makes no promise about length at all — this compiles
// fine even though it's missing the third channel.
const asArray: number[] = [1, 2];

// The tuple type promises exactly three positions.
const asTuple: [number, number, number] = [1, 2];
```

**Real output, run this session** (`tsc --noEmit --strict`):
```
tuple-test.ts(16,7): error TS2322: Type '[number, number]' is not assignable to type '[number, number, number]'.
  Source has 2 element(s) but target requires 3.
```

**What this proves:** `asArray` — typed `number[]` — accepted a 2-element
array with no complaint at all; the exact same 2-element array assigned to
the tuple-typed `asTuple` failed to compile, with the compiler naming the
real mismatch (`2 element(s)` vs. `requires 3`) instead of silently
accepting it. The tuple type is catching, at compile time, precisely the
mistake that `number[]` was structurally unable to catch.

## Mechanical Walkthrough

- `[number, number, number]` — **(a) first appearance** — a **tuple type**:
  a fixed-length array type where each position can have its own type
  (here, all three happen to be `number`, but they don't have to match).
  Written with the same square-bracket syntax as an array *literal*, not
  an array *type* (`number[]`) — the distinction is what's inside the
  brackets: a list of per-position types, not one type followed by `[]`.
- `function hexToRgb(hex: string): [number, number, number]` — **(b)
  reappearing** — a function return type annotation
  (`typescript-type-annotations.md`), now naming a tuple type instead of a
  primitive or interface.
- `const [r, g, b] = hexToRgb("#ffffff")` — **(b) reappearing** — array
  destructuring (`javascript-destructuring.md`), applied to a tuple's
  return value specifically. This is the direct payoff: because the
  return type *guarantees* three positions, TypeScript knows `r`, `g`, and
  `b` are each genuinely `number` — not `number | undefined` — with zero
  extra checking at the call site.
- `const asArray: number[] = [1, 2]` — **(c) already basic** — a plain
  array type annotation, already established.
- `const asTuple: [number, number, number] = [1, 2]` — **(a) first
  appearance**, the failing case — assigning a shorter array literal to a
  tuple type. The compiler error names the exact real mismatch: element
  count, not element type.

## CS Lens

A tuple type is a **fixed-arity, heterogeneous-by-position** structure —
distinct from an array (homogeneous, arbitrary length). This is the same
underlying idea as a `struct` in C, a `record` in many languages, or a
Python tuple with type hints: a small, fixed group of values where
*position* carries meaning (position 0 is always red, position 1 is
always green), rather than a collection where every element plays the
same role.

Also recognized in: Python's `tuple[int, int, int]` type hints, Rust and
Go's fixed-size arrays, SQL row types, function signatures in any
statically-typed language that returns multiple values.

## SE Lens

The real alternative here isn't just "use `number[]`" — it's "define a
named interface" (`interface RGB { r: number; g: number; b: number }`).
That alternative is arguably *more* readable at the call site (`rgb.r`
instead of a positional `[0]`), and would be the better choice if this
value were passed around widely or if a reader unfamiliar with the
function needed the fields self-documented. The tuple was chosen here
specifically because the destructuring call site (`const [r, g, b] = ...`)
already reads clearly, the three values are always used together and
immediately unpacked, and a whole named interface for a value that never
outlives one function call would be overhead without a matching benefit —
a real, deliberate tradeoff, not the only "correct" option.

## Connection

Builds on `typescript-array-types.md` and `javascript-destructuring.md`.
Used in this project's real code in `hexToRgb`'s return type in
`javascript-hex-color-blending.md` — the tuple is what lets that
function's own destructured callers trust `r`, `g`, and `b` all really
exist.

## Try It Yourself

1. Change `hexToRgb`'s return type from a tuple to `number[]`, then
   destructure it as `const [r, g, b] = hexToRgb(...)` — confirm this
   still compiles, then hover `b` in an editor with type-checking enabled
   and notice its inferred type is now `number`, same as before — the
   *type checker* can't tell the difference at the call site until the
   underlying array is genuinely shorter, which is exactly the silent
   failure this concept exists to prevent.
2. Write a tuple type for a "labeled point" — `[string, number, number]`
   (a name, then x and y) — and try assigning `["origin", 0, 0, 0]` (one
   extra element) to a variable of that type; read the real error.
