# Concept: TypeScript's `as const` Assertion

**What you'll understand by the end:** how to tell TypeScript to infer the narrowest, most literal possible type for a value, instead of its usual, wider default.

**Prerequisites:** `typescript-type-annotations.md`, `typescript-union-types.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

By default, TypeScript infers reasonably general types for literals — an array of strings is typed `string[]` (any string, any length), not "exactly these three specific strings, in this exact order." That generality is usually correct and convenient, but sometimes a value is meant to be a small, fixed, known set of exact options — and code consuming it would benefit from TypeScript knowing precisely which options are possible, not just "some string."

## The Isolated Example

```typescript
const axesDefault = ["x", "y", "z"];
const axesConst = ["x", "y", "z"] as const;

function useAxis(axis: string) {
    return `axis: ${axis}`;
}

function useAxisStrict(axis: "x" | "y" | "z") {
    return `axis: ${axis}`;
}

useAxisStrict(axesConst[0]);   // compiles: axesConst[0] is typed "x"
// useAxisStrict(axesDefault[0]);  // would NOT compile: axesDefault[0] is typed string
```

**Real `tsc` behavior:** `axesConst[0]` has the real, precise type `"x"` (a **literal type**, not just `string`), so it satisfies `useAxisStrict`'s narrower `"x" | "y" | "z"` parameter type directly. `axesDefault[0]` is typed as the much wider `string`, which does **not** satisfy `"x" | "y" | "z"` — attempting to pass it produces a real error: `Argument of type 'string' is not assignable to parameter of type '"x" | "y" | "z"'.`

**What this proves:** the exact same runtime array (`["x", "y", "z"]`) is given a meaningfully different, more precise compile-time type purely by adding `as const` — no runtime behavior changes at all; only what TypeScript is willing to assume about the array's contents does.

## Mechanical Walkthrough

- `as const` is a **type assertion** — it doesn't run any code or check anything at runtime; it tells the TypeScript compiler to infer the narrowest possible type for the expression it's attached to, rather than the usual, wider default.
- Applied to an array literal, `as const` produces a **readonly tuple** of **literal types** — `readonly ["x", "y", "z"]`, where each element's type is the exact literal value (`"x"`, `"y"`, `"z"`) rather than the general `string`.
- The `readonly` part is a real, enforced consequence: TypeScript will reject any attempt to mutate an `as const` array (`axesConst.push("w")` produces a real compile error) — treating it, correctly, as a fixed, unchanging set of values.
- The same assertion works on object literals too (`{ x: 1, y: 2 } as const` makes every property `readonly` and infers each value's exact literal type, rather than widening `1` to the general `number`).

## CS Lens

This is a form of **literal type narrowing** — TypeScript's type system is capable of representing not just broad categories (`string`, `number`) but individual, specific values as their own distinct types (the type `"x"` contains exactly one possible value: the string `"x"`). `as const` is the explicit, deliberate signal to use this narrower representation instead of the wider default a language's own type inference would otherwise reasonably choose.

Also recognized in: Rust's own literal types and const generics (representing specific values at the type level), and, more conceptually, any type system capable of expressing "exactly this value" as a distinct type from "any value of this general category" — a real, useful distinction not every type system supports as directly as TypeScript's does.

## SE Lens

`as const` is the practical, idiomatic way to define a small, fixed set of allowed string/number values in TypeScript without a separate `enum` declaration — an array of literal strings, asserted `as const`, gives both a real, iterable runtime value (useful for `.map()`-ing over the options) *and* a precise compile-time type derived directly from it, with zero duplication between the two. The real tradeoff: forgetting `as const` on a value meant to be a fixed set silently falls back to the much wider, less helpful `string[]`/`string` inference, losing the specific-value checking a reader might reasonably expect was already happening.

## Connection

Builds on `typescript-type-annotations.md` and `typescript-union-types.md` (a `readonly` tuple of literal types is closely related to, and can be converted into, a union type of those same literals via TypeScript's `typeof`/indexed-access utilities). Directly useful for defining a small, fixed set of valid options — like a machine's real axis names — that both runtime code (iterating over them) and the type checker (restricting what's a valid axis) need to agree on.

## Try It Yourself

1. Try mutating an `as const` array (`axesConst.push("w")` or `axesConst[0] = "w"`) and read the real compile errors this produces — confirming `readonly` is genuinely enforced, not just documentation.
2. Look up TypeScript's `(typeof axesConst)[number]` syntax — a real, common idiom for deriving a union type (`"x" | "y" | "z"`) directly from an `as const` array, rather than writing that union out separately by hand — and use it to type `useAxisStrict`'s parameter without repeating the three literal strings a second time.
3. Apply `as const` to an object literal (`const config = { retries: 3, timeout: 1000 } as const;`) and inspect the inferred type of `config.retries` — confirming it's the literal type `3`, not the general `number`, and reasoning about a real scenario where that extra precision would (or wouldn't) actually matter.
