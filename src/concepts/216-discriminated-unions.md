---
concept: 216-discriminated-unions
name: Discriminated Unions (TypeScript)
---

## Definition

A discriminated union is a union of object types that all share a
common, uniquely-valued "tag" property (the discriminant) — checking that
ONE property's value lets TypeScript automatically narrow the ENTIRE
object to the matching specific type, safely accessing whatever OTHER
properties that variant alone has.

## Problem

A union of object types WITHOUT a shared discriminant property requires
awkward, less-reliable narrowing checks (checking for the presence of a
specific OTHER property, or `instanceof` for classes) to distinguish
between the possibilities. Adding a common, literal-typed "tag" field to
every variant lets a single, simple `switch` or `if` on that ONE field
reliably narrow to the correct specific type, with TypeScript verifying
every case is handled.

## Execution

Two type variants both share a `kind` field — the DISCRIMINANT — a
literal string type, DIFFERENT for each variant
↓
A `switch` on that `kind` field checks each possible literal value
↓
Inside the `'circle'` case, TypeScript narrows the value to the `Circle`
variant SPECIFICALLY, because `kind: 'circle'` uniquely identifies it —
its `radius` property becomes valid to access
↓
Inside the `'square'` case, narrowed to the `Square` variant instead —
its `side` property becomes valid there
↓
If a NEW variant is added to the union but the `switch` isn't updated to
handle it, TypeScript's `never` type (representing "this should be
unreachable") can be used in a `default` case to make the compiler ERROR
if any variant goes unhandled — a technique called "exhaustiveness
checking"

## Computer Science

This works because TypeScript performs narrowing based on LITERAL
TYPES — `kind: 'circle'` isn't just typed as `string`, it's typed as the
SPECIFIC literal `'circle'`, so checking that field's value (or a
`switch` case) genuinely narrows the union to exactly the one variant
whose discriminant matches that literal value.

Tags: Literal types, Tagged unions (cross-language), Exhaustiveness checking

## Software Engineering

Discriminated unions are the idiomatic TypeScript way to model "one of
several distinct shapes" (matching Rust's enums with data, or Go's
type-switched interfaces) — reaching for this pattern instead of a single
object with many OPTIONAL fields prevents invalid combinations (a
"circle" that also has a "side" property) from being representable at
all.

Tags: Modeling alternatives, Invalid state prevention, Cross-language pattern parallel

## Common Mistakes

- Modeling "one of several shapes" as a single type with many optional fields instead of a discriminated union — this allows constructing objects with an inconsistent, invalid combination of fields (a "circle" with a "side" property, or neither radius nor side at all).
- Forgetting to update a `switch`/`if` chain when a NEW variant is added to the union — without exhaustiveness checking (using `never` in a `default` case), TypeScript won't automatically flag the missing case, and the new variant could silently fall through unhandled at runtime.

## Exercises

- Trace through what TypeScript understands the value's type to be inside the `'circle'` case versus the `'square'` case, and explain specifically how the `kind` field enables that narrowing.
- Add a `Triangle` variant to the union and update the area function to handle it — what happens if you forget to add the new `case`, both with and without exhaustiveness checking in place?

## typescript

```typescript
type Circle = { kind: 'circle', radius: number };
type Square = { kind: 'square', side: number };
type Shape = Circle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius   // narrowed to Circle here -- .radius is valid
    case 'square':
      return shape.side * shape.side   // narrowed to Square here -- .side is valid
  }
}

const c: Circle = { kind: 'circle', radius: 2 }
const s: Square = { kind: 'square', side: 3 }

console.log(area(c).toFixed(2))   // 12.57
console.log(area(s))               // 9
```
Walkthrough: `area`'s `switch` on `shape.kind` narrows `shape` to `Circle`
specifically inside `case 'circle':` (making `.radius` valid) and to
`Square` inside `case 'square':` (making `.side` valid) — the SAME
`shape` parameter is narrowed differently depending purely on which
literal value its `kind` discriminant actually holds at runtime.
