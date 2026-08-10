# Concept: TypeScript's `unknown` Type

**What you'll understand by the end:** how to honestly type a value that could genuinely be anything, without disabling type checking the way `any` does.

**Prerequisites:** `typescript-type-annotations.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

Some values genuinely can be of any type — the argument to a generic "print this for debugging" function, data parsed from an untrusted source before its real shape has been confirmed. `any` (see `static-vs-dynamic-typing.md`) can hold this role, but it does so by turning off type checking entirely for that value — every operation on an `any`-typed value is silently permitted, even ones that would be genuinely unsafe.

## The Isolated Example

```typescript
function debugAny(value: any) {
    console.log(value.toUpperCase()); // compiles, even though this might crash
}

function debugUnknown(value: unknown) {
    console.log(value.toUpperCase()); // does NOT compile
}
```

**Real `tsc` output for `debugUnknown`:**
```
error TS18046: 'value' is of type 'unknown'.
```
`debugAny` compiles with no complaint at all — and crashes at runtime with a real `TypeError` the moment it's called with, say, a number.

**Making `debugUnknown` actually work, by narrowing first:**
```typescript
function debugUnknownSafe(value: unknown) {
    if (typeof value === "string") {
        console.log(value.toUpperCase());
    } else {
        console.log(String(value));
    }
}
```
**Real behavior:** compiles cleanly, and never crashes regardless of what's passed — a string, a number, `null`, an object.

## Mechanical Walkthrough

- `any` disables type checking for a value entirely — every property access, method call, and operation on an `any`-typed value is accepted without complaint, even ones that will genuinely fail at runtime.
- `unknown` accepts any value (exactly like `any` can be assigned anything), but TypeScript refuses to let *any* operation run on an `unknown`-typed value until its actual type has been checked and narrowed — the same `typeof`-based narrowing `typescript-union-types.md` describes for narrowing a known set of possible types applies here too, just starting from "could be anything" instead of a specific, named union.
- This makes `unknown` the honest choice for "I genuinely don't know or care what type this is" while `any` is really closer to "stop checking this value's type entirely" — a meaningfully different, riskier claim.
- A function accepting `unknown` and doing nothing but passing it to another function that itself accepts `unknown` (like `JSON.stringify`, which genuinely handles any value) never needs to narrow at all — narrowing is only required the moment a type-specific operation (like `.toUpperCase()`) is attempted.

## CS Lens

`unknown` is the **top type** in TypeScript's type system (a type every other type is assignable *to*, but which itself isn't assignable to anything more specific without a check) — this is a real, deliberate type-theory distinction from `any`, which effectively opts a value *out* of the type system rather than sitting at the top of it. Some statically-typed languages (Java, C# via `object`; Rust has no direct equivalent, favoring generics/trait objects instead) have a similar top type, though few make the any/unknown-style distinction between "opted out of checking" and "checked, but currently unconfirmed" as explicitly as TypeScript does.

Also recognized in: Java/C#'s `Object` type (every value is assignable to it, but using it as anything specific requires a cast, which is checked, at least at runtime, unlike TypeScript's fully-erased compile-time-only checks).

## SE Lens

Choosing `unknown` over `any` for genuinely-any-type values (a logging function's argument, data before its shape is validated) is a small habit with a real, concrete payoff: it forces every consumer of that value to actually confirm what it is before doing anything type-specific with it, catching real mistakes `any` would silently let through. `any` remains occasionally useful as a deliberate, narrow escape hatch (working around a poorly-typed third-party library, for instance) but should be a conscious, rare exception — most real TypeScript style guides recommend `unknown` as the default for "could be anything," reserving `any` for cases nothing else fits.

## Connection

Builds on `typescript-type-annotations.md` and `typescript-union-types.md`'s narrowing mechanism. The correct, honest type for a component or function whose entire job is handling arbitrary data generically — formatting it for display, logging it — without making any claim about its specific shape.

## Try It Yourself

1. Try calling `debugAny(42)` and `debugUnknownSafe(42)` — confirm `debugAny` compiles but crashes at runtime (`(42).toUpperCase is not a function`), while `debugUnknownSafe` handles it gracefully via its `else` branch.
2. Write a function accepting `unknown` that narrows it using `Array.isArray(value)` instead of `typeof`, confirming TypeScript recognizes this specific check too as valid narrowing, not just `typeof`.
3. Change `any` to `unknown` in a real function signature in a project you have access to, run the type checker, and read through every resulting error — each one marks a real spot where a value's type was previously assumed rather than actually confirmed.
