# Concept: `typeof` and `ReturnType<...>` in TypeScript's Type System

**What you'll understand by the end:** how to derive a type directly from an existing function, instead of writing out its shape by hand a second time.

**Prerequisites:** `typescript-generics.md`, `typescript-interfaces.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

A function's return value often has a real, specific shape — but writing that shape out again as a separate, named `interface` purely so something else can hold a variable of that type duplicates information TypeScript already has: the function's own signature already fully determines what it returns. If the function's return shape ever changes, a hand-duplicated interface would silently drift out of sync unless someone remembers to update both places.

## The Isolated Example

```typescript
function makeCounter(start: number) {
    let value = start;
    return {
        increment: () => { value += 1; return value; },
        reset: () => { value = start; return value; },
    };
}

// Written by hand, duplicating the shape
interface CounterByHand {
    increment: () => number;
    reset: () => number;
}

// Derived directly from the function
type Counter = ReturnType<typeof makeCounter>;

const a: CounterByHand = makeCounter(0);
const b: Counter = makeCounter(0);

console.log(a.increment(), b.increment());
```

**Real output:**
```
1 1
```

**Now, `makeCounter` gains a new method — only one of the two type declarations notices:**
```typescript
function makeCounter(start: number) {
    let value = start;
    return {
        increment: () => { value += 1; return value; },
        reset: () => { value = start; return value; },
        current: () => value,
    };
}
```
**Real `tsc` behavior:** `Counter` (the `ReturnType<typeof makeCounter>` version) automatically includes `current` with no code changes needed anywhere else. `CounterByHand` does not — using `a.current()` against the hand-written interface produces `error TS2339: Property 'current' does not exist on type 'CounterByHand'`, even though the real object at runtime genuinely has it.

**What this proves:** the derived type (`ReturnType<typeof makeCounter>`) stayed automatically, permanently in sync with the function's real, actual shape; the hand-written interface silently fell behind the moment the function changed, with no warning that it had.

## Mechanical Walkthrough

- `typeof makeCounter` — in a *type* context (as opposed to `typeof` used as a runtime JavaScript operator checking a value's runtime type), `typeof` refers to the **type of the function itself** — its full signature, including parameter types and return type — not its return value.
- `ReturnType<F>` is a built-in TypeScript **utility type**: given a function type `F`, it extracts *only* the return type, discarding the parameter types.
- `ReturnType<typeof makeCounter>` chains both together: "the type of `makeCounter`, then, of that, just the return type" — the net effect is "whatever `makeCounter` actually returns," computed once, directly from the real function, and automatically kept current with it.
- TypeScript ships several other utility types built the same way (`Parameters<F>` — extracts a function's parameter types as a tuple; `Partial<T>` — makes every property of an object type optional) — all mechanically derive a new type from an existing one, rather than requiring it be written out by hand.

## CS Lens

This is **type-level computation** — deriving one type from another via a named operation (here, "extract the return type"), rather than writing every type out as an independent, hand-maintained declaration. It reflects the same "don't repeat information the system already has" instinct as any other form of derived/computed value, applied at the type-checking level instead of the runtime-value level — the type checker computes `Counter`'s real shape by actually analyzing `makeCounter`'s code, the same way a runtime computation derives a value by analyzing its inputs.

Also recognized in: any sufficiently expressive static type system's own type-level utilities (Rust's associated types and trait bounds achieve related goals differently), and, more distantly, database views (a view's columns are derived from — and stay in sync with — the underlying query, rather than being a separately hand-maintained copy of a table's shape).

## SE Lens

Deriving a type instead of hand-declaring a duplicate is a direct, real defense against the exact drift demonstrated above — a type that's *computed* from its source can never silently disagree with that source, whereas a hand-written duplicate is only ever as accurate as whoever last remembered to update it. This is most valuable specifically for values whose real shape is naturally expressed by *writing the code* rather than by *first deciding on and declaring a type* — a function returning an object literal, as here, is a common, real case where the "natural" shape only exists once the function itself is written.

## Connection

Builds on `typescript-generics.md` (`ReturnType<F>` is itself a generic type, parameterized by `F`) and `typescript-interfaces.md` (the shape it produces is usable anywhere a hand-written interface would be). Commonly used to type a variable meant to hold the result of a factory function — a function whose entire job is constructing and returning some configured object — without separately declaring that object's shape.

## Try It Yourself

1. Use `Parameters<typeof makeCounter>` (the sibling utility type extracting parameter types instead of the return type) and confirm it evaluates to `[number]` — a one-element tuple type matching `makeCounter`'s single `start: number` parameter.
2. Deliberately change `makeCounter`'s `start` parameter's type from `number` to `number | string`, and confirm both `Counter` (via `ReturnType`) and any code depending on it continue to type-check correctly with no manual updates — while imagining (or trying) a hand-duplicated interface elsewhere that referenced the old, narrower shape, and reasoning about what would silently go stale.
3. Look up TypeScript's `Partial<T>` utility type, and apply it to a plain interface you've already written (`Partial<GreetingProps>`, referencing `react-component-props.md`'s example) — confirm every field becomes optional, and reason about a real use case for this (a function that only needs to *update* some fields of an existing object, not supply all of them).
