# Concept: TypeScript Generics

**What you'll understand by the end:** how to write a function that works correctly for any type while still preserving full type information, rather than giving up and accepting anything.

**Prerequisites:** `typescript-type-annotations.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

A function like "give me the first element of this list, or null if it's empty" is logically identical no matter what the list contains — writing one version for `string[]`, another for `number[]`, another for every other element type would be enormous, needless duplication. But accepting `any[]` and returning `any` throws away all type information — the caller would get back something with no known type at all, foregoing every benefit `typescript-type-annotations.md` demonstrated.

## The Isolated Example

```typescript
function findFirst<T>(items: T[]): T | null {
    return items.length > 0 ? items[0] : null;
}

const maybeName = findFirst<string>(["Alice", "Bob"]);
console.log(maybeName!.toUpperCase());

const maybeNumber = findFirst<number>([1, 2, 3]);
console.log(maybeNumber! + 100);
```

**Real output:**
```
ALICE
101
```

**What this proves:** the *same* function, `findFirst`, worked correctly for both a `string[]` and a `number[]`, and in each case, TypeScript knew the specific, correct return type — `maybeName` is known to be `string | null`, `maybeNumber` is known to be `number | null`, not some generic, unhelpful `unknown`. `<string>`/`<number>` at each call site is what fixed the placeholder to a concrete type for that specific call.

## Mechanical Walkthrough

- `<T>` immediately after `findFirst` declares a **generic type parameter** — `T` is a placeholder standing for "whatever type this specific call uses," not a real type itself.
- `items: T[]` and the return type `T | null` both refer to the same placeholder `T` — TypeScript enforces that whatever `T` turns out to be for a given call, both usages agree.
- `findFirst<string>(...)` explicitly fixes `T` to `string` for this call; TypeScript can often infer this automatically from the argument's own type without it being written explicitly (`findFirst(["Alice", "Bob"])` alone would infer `T = string` from the array's contents) — written explicitly here once, to name the mechanism directly.

## CS Lens

This is **parametric polymorphism** — writing one piece of code that works correctly for *any* type, parameterized by that type, without losing type information the way accepting `any` would. `findFirst<string>` is known, concretely, to return `string | null` — not just "some unknown value" — because the type parameter carries real information through the whole function, in to out.

Also recognized in: Java/C#'s own generics (`List<T>`), C++ templates, Rust's generic functions — the same underlying idea, parameterizing code by type, across every mainstream statically-typed language, distinct from Python's duck typing (see `static-vs-dynamic-typing.md`), where the identical `findFirst`-shaped function would work for any type with zero declared generic machinery at all, at the cost of no static type information being tracked through it either.

## SE Lens

The alternative to a generic — writing `findFirstString`, `findFirstNumber`, `findFirstDog`, one per type ever needed — is real, genuine code duplication: the same logic, copy-pasted, differing only in a type annotation. A generic function expresses "this logic is the same regardless of type" exactly once, and the type checker still catches real mistakes (calling `findFirst<string>` but treating the result as a number, for instance) at every individual call site, with none of the duplication cost.

## Connection

Builds on `typescript-type-annotations.md`. `Promise<T>` (used throughout `typescript-async-await.md`) and array types (`typescript-array-types.md`'s `Array<T>` alternate syntax) are both real, everyday uses of this exact mechanism, applied to built-in types instead of a hand-written function.

## Try It Yourself

1. Write a generic function `pair<A, B>(a: A, b: B): [A, B]` (two type parameters) returning a tuple, and call it with two different, unrelated types (a `string` and a `number`). Confirm TypeScript tracks both types independently through the return value.
2. Remove the `<T>` from `findFirst` and replace every `T` with `any`. Call it with a `string[]` and try to call `.toUpperCase()` on the result — confirm it still compiles, but note that TypeScript now provides zero protection if the wrong method were called instead (e.g. `.toFixed()`, a number method, on what's actually a string) — the real cost of `any` versus a real generic.
3. Add a constraint to the generic parameter (`function findFirst<T extends { id: number }>(items: T[]): T | null`), restricting `T` to only types that have at least an `id: number` field. Confirm calling it with an array of objects missing `id` now fails to compile, while one with `id` (plus other fields) still works — a real, additional layer of type safety generics support beyond "accepts literally anything."
