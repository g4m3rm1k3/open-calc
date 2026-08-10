# Concept: TypeScript Union Types

**What you'll understand by the end:** how to declare that a value could be one of several specific types, and how TypeScript forces you to handle every possibility before treating it as any one of them.

**Prerequisites:** `typescript-type-annotations.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

Some values genuinely aren't always the same type — a lookup might find a real result, or might find nothing (`null`); a field might hold a `string` or a `number` depending on context. A type system needs a way to say "this could honestly be either," rather than forcing a single, inaccurate type or giving up and allowing anything.

## The Isolated Example

```typescript
function describe(value: string | number): string {
  if (typeof value === "string") {
    return `text: ${value.toUpperCase()}`;
  }
  return `number: ${value.toFixed(2)}`;
}

console.log(describe("hello"));
console.log(describe(3.14159));
```

**Real output:**
```
text: HELLO
number: 3.14
```

Calling a type-specific method without checking first:
```typescript
function broken(value: string | number): string {
  return value.toUpperCase();
}
```

**Real `tsc` output:**
```
error TS2339: Property 'toUpperCase' does not exist on type 'string | number'.
```

**What this proves:** TypeScript refused to let `.toUpperCase()` (a string-only method) be called on a value that *might* be a number, without first checking which one it actually is. The `typeof value === "string"` check in the working version is what let TypeScript narrow the type inside that branch — it's not just a runtime check, it changes what the type checker itself believes about `value` for the rest of that block.

## Mechanical Walkthrough

- `value: string | number` — a **union type**: `value` could be either a `string` or a `number`, and TypeScript tracks both possibilities simultaneously.
- Before narrowing, only operations valid on *every* member of the union are allowed — `.toUpperCase()` isn't valid on `number`, so it's rejected even though `value` might really be a string at runtime.
- `typeof value === "string"` inside an `if` is a **type guard** — TypeScript recognizes this specific runtime check and narrows `value`'s type to just `string` within that branch, and (since the two-branch `if`/implicit-`return` structure covers every case) to just `number` in the code after it.

## CS Lens

A union type is a **sum type** (in type-theory terms) — a value that is genuinely one of several distinct alternatives, as opposed to a **product type** (like an interface/object, an "and" of fields) which is genuinely all of several fields at once. Requiring a check before narrowing is the type system enforcing that every real possibility gets handled, rather than silently assuming the most convenient one.

Also recognized in: Rust's `enum` (a real, first-class sum type, more explicit than TypeScript's structural union), Haskell/OCaml's algebraic data types (where this concept originates formally), and — informally — any API documentation describing a field as "either a string or null" — a union type is what lets that same informal description be checked by a compiler instead of only trusted from a comment.

## SE Lens

The alternative — declaring `value: any` and skipping the type distinction entirely — avoids the friction of narrowing, at the cost of the checker being unable to catch a genuine mistake (calling a string-only method on what turns out, at runtime, to actually be a number). Requiring an explicit check before narrowing is exactly what makes union types safe rather than merely documentation: the compiler, not just a comment, ensures every code path that touches a union value has actually accounted for each possibility it could be.

## Connection

Builds on `typescript-type-annotations.md`. `T | null` (used in `typescript-generics.md`'s `findFirst` example, and directly relevant to `typescript-non-null-assertion.md`) is the single most common union type in real TypeScript code — "a real value, or the absence of one."

## Try It Yourself

1. Add a third type to the union (`string | number | boolean`) and extend `describe` to handle it with a third branch. Confirm TypeScript requires the new case be handled somewhere before allowing any branch-specific operation on it.
2. Remove one of the two `if`/implicit-return branches from the original `describe`, leaving a code path where TypeScript can't prove every case was handled. Read the real error about a missing return value on some code path, and reason about how this differs from `broken`'s error above — one is about type narrowing, the other about function completeness, both enforced by the same overall checking.
3. Write a function accepting a union of two *interfaces* (not primitives) — e.g. `{ kind: "circle"; radius: number } | { kind: "square"; side: number }` — and use the shared `kind` field as a type guard (`if (shape.kind === "circle")`) to narrow between them. This specific pattern (a shared "tag" field distinguishing union members) is common enough in real TypeScript to have its own name — look up "discriminated unions" to see the formal term for what you just built.
