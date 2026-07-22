# Concept: async/await

**What you'll understand by the end:** how to write asynchronous code that reads top-to-bottom like synchronous code, and what's actually happening underneath that appearance.

**Prerequisites:** `javascript-promises-async.md`, `typescript-generics.md`.

## Setup

Any modern JavaScript runtime (Node.js 14+, or a browser). No install needed — `async`/`await` is native JavaScript syntax.

## The Problem

A chain of `.then()` calls (see `javascript-promises-async.md`) handles asynchronous work correctly, but nesting several dependent async steps — "fetch this, then use it to fetch that, then use *that* to compute a third thing" — produces a callback-shaped structure that reads inside-out, and error handling has to be threaded through with `.catch()` at the right point in the chain rather than a single, ordinary `try`/`catch`.

## The Isolated Example

```typescript
function delay(ms: number): Promise<number> {
    return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
}

// .then() chain version
function withThen(): void {
    delay(100)
        .then((ms) => {
            console.log(`waited ${ms}ms`);
            return delay(50);
        })
        .then((ms) => {
            console.log(`waited another ${ms}ms`);
        });
}

// async/await version, same behavior
async function withAwait(): Promise<void> {
    const first = await delay(100);
    console.log(`waited ${first}ms`);
    const second = await delay(50);
    console.log(`waited another ${second}ms`);
}

withAwait();
```

**Real output:**
```
waited 100ms
waited another 50ms
```

**What this proves:** `withAwait` produces the identical sequence and timing as `withThen`, written as ordinary sequential statements instead of nested callbacks. `await` didn't block the whole program (other code can still run during the 100ms and 50ms waits) — it only paused *this function's* continuation until the awaited promise settled.

## Mechanical Walkthrough

- `async function withAwait()` — marking a function `async` means it always returns a `Promise`, even though its body has no explicit `Promise` construction — `withAwait`'s declared return type is `Promise<void>`, not `void`.
- `await delay(100)` — pauses execution of `withAwait` (and only `withAwait`) until the `Promise` returned by `delay(100)` settles, then unwraps its resolved value directly into `first`, as an ordinary `number` — no `.then()` callback needed to reach that value.
- Because `await` only suspends the current `async` function, not the whole JavaScript runtime, other code (a UI staying responsive, another timer) continues running during the pause — this is still the same single-threaded, non-blocking event loop `event-loop.md` describes; `await` is new syntax over the same underlying mechanism `javascript-promises-async.md` already showed with `.then()`.

## CS Lens

`async`/`await` is **syntactic sugar over promises** — the compiler/runtime transforms an `async` function's body into the equivalent chain of `.then()` continuations automatically; nothing new is added to the underlying execution model. This specific shape — pausable, resumable function execution built on top of a more primitive callback/continuation mechanism — is also called a **coroutine** in broader CS terms, and appears under different names (generators, `async`/`await`, goroutines with channels) across many languages built on an event loop or cooperative-scheduling model.

Also recognized in: Python's own `async`/`await` (near-identical syntax and semantics, also sugar over an underlying event loop), C#'s `async`/`await` (the syntax this JavaScript feature was directly modeled after).

## SE Lens

`try`/`catch` (see `python-try-except.md` for the analogous Python construct) works directly around `await`ed calls, exactly as it would around synchronous code — a real, practical readability and maintainability win over threading `.catch()` through a `.then()` chain at the correct link, especially once a sequence involves several dependent async steps and real conditional branching between them. The tradeoff is almost entirely one of appearance, not capability — both forms can express identical logic — but the sequential appearance is what makes `async`/`await` the default, idiomatic choice in modern code for anything beyond a single `.then()`.

## Connection

Builds on `javascript-promises-async.md` and `typescript-generics.md` (`Promise<T>` is `Promise` applied to a generic type parameter — a `Promise<number>` resolves specifically to a `number`, exactly as `T[]` in `typescript-array-types.md` is `Array` applied to `T`). `fetch-api.md`'s `fetch(...)` calls are commonly awaited directly (`const response = await fetch(url)`) instead of chained with `.then()`.

## Try It Yourself

1. Add a `try`/`catch` around the two `await` calls in `withAwait`, and make `delay` occasionally reject instead of resolve (e.g. `Math.random() < 0.5 ? reject("bad luck") : resolve(ms)`). Confirm the `catch` block catches the rejection exactly as it would a thrown synchronous exception.
2. Run two `delay` calls concurrently instead of sequentially: `const [a, b] = await Promise.all([delay(100), delay(50)]);`. Time the total execution (it should take ~100ms, not ~150ms) and reason about why awaiting them separately, one after another, would have taken longer for no benefit here.
3. Write an ordinary (non-`async`) function that calls an `async` function without `await`ing it, and log immediately afterward. Observe that the log runs *before* the async function's internal work finishes, and reason about why — this is the concrete, visible proof that `async` functions return immediately with a pending `Promise`, and don't block their caller by default.
