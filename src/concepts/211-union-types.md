---
concept: 211-union-types
name: Union Types (TypeScript)
---

## Definition

A union type describes a value that could be ONE OF several specified
types — `string | number` means "either a string or a number" — letting
TypeScript's type checker verify code correctly handles every
possibility, rather than assuming just one type.

## Problem

A function or variable that can legitimately hold more than one kind of
value (an ID that's sometimes a number, sometimes a string; a result
that's either data or an error) can't be modeled by a single fixed type.
Union types let the type system express "this could genuinely be any of
these listed types," and TypeScript then requires code to handle EACH
possibility correctly before allowing certain operations.

## Execution

A parameter's type is a UNION — either a `string` or a `number`
↓
Calling a method that only exists on `string` DIRECTLY on that
parameter is a TYPE ERROR — TypeScript can't guarantee it's a `string` at
that point, since it could be a `number`
↓
Checking `typeof id === 'string'` NARROWS the type to just `string`
INSIDE that block (see Type Narrowing), and the string-only method
becomes valid
↓
In the `else` branch, TypeScript narrows to `number` instead, since the
`string` case has already been excluded

## Computer Science

Union types are TypeScript's structural way of modeling "one of several
possibilities" at the type level — similar in spirit to Rust's enums or
algebraic sum types (see Enums with Data (Rust)), but built on top of
JavaScript's existing runtime values rather than a distinct tagged
representation, meaning TypeScript relies on RUNTIME checks (like
`typeof`) to distinguish between the union's members.

Tags: Sum types (structural), Type-level alternatives, Runtime discrimination

## Software Engineering

Union types are extremely common in modeling API responses (a success
response OR an error response), optional/nullable values (`string |
null`), and flexible function parameters — they let a function's
SIGNATURE precisely document every shape of input it accepts, rather than
relying on `any` and hoping callers pass something sensible.

Tags: API modeling, Nullable alternatives to null-only, Precise signatures

## Common Mistakes

- Trying to access a member that only exists on ONE branch of a union without first narrowing the type — TypeScript rejects this at compile time, since it can't guarantee the value is currently that specific branch.
- Overusing `any` instead of a proper union type when a value's possible types ARE actually known in advance — `any` disables type checking entirely, while a union type still gets full compile-time verification for each specific case.

## Exercises

- Trace through what specific compiler error TypeScript reports if a string-only method is called directly on a `string | number` value WITHOUT a preceding type check.
- Add a THIRD type to the union (e.g., `string | number | boolean`) and explain what additional narrowing branch would be needed to handle it.

## typescript

```typescript
function formatId(id: string | number): string {
  if (typeof id === 'string') {
    return id.toUpperCase()
  } else {
    return id.toString()
  }
}

console.log(formatId('abc'))
console.log(formatId(42))
```
Walkthrough: `formatId`'s parameter `id` has the union type `string |
number` — inside the `if (typeof id === 'string')` branch, TypeScript
narrows `id` to just `string`, making `.toUpperCase()` valid; in the
`else` branch, `id` is narrowed to `number` instead, where `.toString()`
is the appropriate operation. Both calls demonstrate `formatId` correctly
handling either branch of the union, printing `ABC` and `42`.
