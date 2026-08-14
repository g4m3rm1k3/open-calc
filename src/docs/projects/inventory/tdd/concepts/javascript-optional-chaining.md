# Concept: Optional Chaining (`?.`)

**What you'll understand by the end:** how to safely access a property or call a method on a value that might be `null`/`undefined`, without a separate `if` check first.

**Prerequisites:** `typescript-union-types.md`.

## Setup

Any modern JavaScript or TypeScript runtime — no install needed.

## The Problem

Calling a method or accessing a property on a value that might be `null` or `undefined` — genuinely possible, for instance, before some setup step has run yet — throws a real runtime error the moment it happens, unless guarded by an explicit check first, and writing that check every single place such an access occurs is real, repetitive scaffolding.

## The Isolated Example

```javascript
const readyThing = { greet: () => "hello" };
const notReadyThing = null;

// Without optional chaining — needs an explicit guard
function safeGreetOldWay(thing) {
    if (thing !== null && thing !== undefined) {
        return thing.greet();
    }
    return undefined;
}

// With optional chaining
function safeGreetNew(thing) {
    return thing?.greet();
}

console.log(safeGreetOldWay(readyThing), safeGreetNew(readyThing));
console.log(safeGreetOldWay(notReadyThing), safeGreetNew(notReadyThing));
```

**Real output:**
```
hello hello
undefined undefined
```

**Now, without any guard at all:**
```javascript
console.log(notReadyThing.greet());
```
**Real output:**
```
TypeError: Cannot read properties of null (reading 'greet')
```

**What this proves:** `?.` produced results identical to the hand-written `if`-guarded version in both cases — calling through successfully when the value exists, and safely short-circuiting to `undefined` when it doesn't — while a bare, unguarded `.greet()` call on the same `null` value throws a real, program-halting error.

## Mechanical Walkthrough

- `thing?.greet()` checks whether `thing` is `null` or `undefined` immediately before accessing `.greet` — if it is, the entire expression short-circuits to `undefined` immediately, and `greet` is never accessed or called at all (avoiding the error entirely, not catching it after the fact).
- If `thing` is neither `null` nor `undefined`, `?.` behaves identically to an ordinary `.` — `thing?.greet()` calls `greet()` normally.
- `?.` can be chained across multiple links (`a?.b?.c`), short-circuiting at the *first* `null`/`undefined` encountered anywhere in the chain, without needing a separate guard at each link.
- It also works for array/computed access (`arr?.[0]`) and function calls specifically (`fn?.()`, calling `fn` only if it isn't `null`/`undefined`) — the same short-circuiting idea, applied to different kinds of access.

## CS Lens

This is **null-safe navigation** — a language-level feature specifically addressing the extremely common real-world pattern of "a value might legitimately be absent, and accessing through an absent value shouldn't itself be a program-halting error." It doesn't eliminate the need to eventually handle the absent case meaningfully (the caller still gets `undefined` back, and has to decide what that means) — it only removes the repetitive, error-prone boilerplate of checking for absence at every single access point along a chain.

Also recognized in: C#'s `?.` (the syntax JavaScript's own version was directly modeled after), Kotlin's `?.`, Swift's optional chaining (`?.` there too) — this exact feature, under this exact symbol, has converged across many modern languages specifically because the underlying problem (safely navigating through possibly-absent values) is so common.

## SE Lens

`?.` is most valuable specifically when "the value might genuinely not be there yet, and that's a normal, expected state" — not as a blanket habit for suppressing every possible null-related error regardless of whether it should actually be possible. Overusing it can silently hide a real bug: if a value is *supposed* to always be present at a certain point and genuinely isn't, `?.` quietly returns `undefined` instead of surfacing the loud, immediate error that would reveal something is actually wrong — the same tradeoff `typescript-non-null-assertion.md`'s `!` makes in the opposite direction (asserting something is never absent, when `?.` would instead tolerate it being absent).

## Connection

Builds on `typescript-union-types.md`. Directly used wherever a `react-useref-hook.md` ref's `.current` might genuinely still be `null` — a real, common, legitimate case, since a ref's initial value is often `null` until an effect or a `ref` JSX attribute assigns it.

## Try It Yourself

1. Chain optional chaining three levels deep (`a?.b?.c?.d`) with `a` itself `null`, and confirm the entire chain short-circuits at the very first link, never attempting to access `.c` or `.d` at all.
2. Combine `?.` with the nullish coalescing operator `??` (`thing?.greet() ?? "not ready"`) to supply a real fallback value instead of `undefined`, and confirm the combination reads naturally as "greet it if possible, otherwise say it's not ready."
3. Deliberately use `?.` on a value that should never actually be `null` in a correct program, and reason about the tradeoff: does silently returning `undefined` here risk hiding a real bug that a non-optional `.` access — failing loudly — would have caught immediately instead?
