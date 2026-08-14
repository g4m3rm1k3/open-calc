# Concept: TypeScript Type Annotations

**What you'll understand by the end:** how to declare what type a function's parameters and return value must be, and see a real type mistake caught before the code ever runs.

**Prerequisites:** none.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

Nothing about plain JavaScript stops a function expecting a number from being called with a string, an object, or nothing at all — the mistake only surfaces, if it surfaces at all, when the wrong-shaped value hits code that assumes something it isn't, potentially deep inside a call stack, potentially only for a rare input.

## The Isolated Example

```typescript
function shout(message: string): string {
    return message.toUpperCase();
}

const result: string = shout("hello");
console.log(result);
```

**Real output, run with `node` (after stripping types):**
```
HELLO
```

Now the same shape, called wrong on purpose:
```typescript
function shout(message: string): string {
    return message.toUpperCase();
}

const result: string = shout(42 as any);
console.log(result);
```

Checked with the real, locally-installed compiler instead of run:
```
npx tsc --noEmit
```

**Real output:**
```
error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```

**What this proves:** the mistake was caught by name, with the exact reason, before anything executed at all — contrasted with plain JavaScript (or `node`, which only strips type annotations away and runs whatever's left, performing no checking), where the identical mistake would only surface as a runtime crash the moment `.toUpperCase()` is called on a number.

## Mechanical Walkthrough

- `message: string` — a **parameter type annotation**: `message` must be a `string`; passing anything else is a compile-time error.
- `): string` — a **return type annotation**: the function's body must return a `string` on every path; TypeScript checks this against the actual `return` statements inside.
- `const result: string = ...` — a type annotation on a variable, often redundant (TypeScript would infer `string` here anyway from `shout`'s own declared return type) but valid syntax, shown to name it explicitly once.

## CS Lens

This is **static type checking** — verifying a program's internal consistency by analyzing its source text alone, without running it — contrasted with **dynamic typing**, where a value's type is only checked (if ever) at the moment an operation actually uses it (see `static-vs-dynamic-typing.md` for this distinction in full).

Also recognized in: every statically-typed language's own parameter/return type declarations (Java, C#, Rust, Go, C++) — near-universal syntax across languages for exactly this idea, differing mostly in exact placement and punctuation.

## SE Lens

The real, honest cost: type annotations are more to type, and a type checker can occasionally reject code that would have actually run fine (a legitimate value shaped slightly differently than what was declared). The real, concrete benefit demonstrated above: an entire class of bug is caught at the moment of writing the code — often directly in an editor, before ever running anything — rather than discovered live, potentially in front of a real user, potentially only under a rare input path a human reviewer never happened to trace by hand.

## Connection

Foundational to `typescript-interfaces.md` (naming a whole object shape, not just one parameter), `typescript-generics.md`, and `typescript-union-types.md` — every richer TypeScript type feature builds on this same core idea of declaring a value's allowed shape and having it checked before runtime.

## Try It Yourself

1. Add a second parameter, `times: number`, and change the function to repeat the uppercased message that many times. Call it correctly, then call it with the arguments swapped (`shout(3, "hello")`) and read the real `tsc` error identifying exactly which argument is wrong.
2. Remove the return type annotation entirely (`function shout(message: string) { ... }`) and confirm TypeScript still correctly infers it as `string` — hover over the function in an editor, or check `tsc`'s behavior, to see that annotations are sometimes optional because of **type inference**, not always strictly required.
3. Write a function with no parameter type annotation at all (`function shout(message) { return message.toUpperCase(); }`) in a `tsconfig.json` with `"noImplicitAny"` (a common strictness setting) turned on, and observe the real error demanding an explicit type — versus the same file with that setting off, where `message` silently becomes the special `any` type (accepts anything, checked nowhere) instead.
