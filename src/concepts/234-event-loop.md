---
concept: 234-event-loop
name: Event Loop (JavaScript)
---

## Definition

The event loop is JavaScript's mechanism for handling asynchronous
operations on a SINGLE thread — it continuously checks whether the call
stack is empty, and if so, pulls the next queued callback (from a
completed timer, a resolved promise, a finished I/O operation) to run,
giving the illusion of concurrency without actual multi-threading.

## Problem

JavaScript runs on a single thread — if a long operation blocked that
thread entirely while waiting (like a network request), NOTHING else (UI
updates, other code) could run until it finished. The event loop solves
this by making asynchronous operations NON-blocking: initiating them and
immediately continuing with other code, then running their
callback/continuation LATER, once the operation completes and the call
stack is clear.

## Execution

Logging happens immediately (synchronous, on the call stack)
↓
Scheduling a timer callback (even with a `0`ms delay) defers it to AFTER
the current synchronous code finishes, and returns immediately, WITHOUT
blocking
↓
More synchronous code runs immediately next, still on the same call
stack
↓
Only once the call stack is COMPLETELY empty does the event loop pull the
queued timer callback and run it, LAST

## Computer Science

Microtasks (Promise callbacks) and macrotasks (`setTimeout`, I/O
callbacks) are handled in separate queues with different priority — ALL
pending microtasks are drained completely before the event loop moves on
to the next macrotask, which is why a resolved Promise's `.then()`
callback typically runs BEFORE a `setTimeout(..., 0)` callback, even
though both were "ready" around the same time.

Tags: Microtask queue, Macrotask queue, Single-threaded concurrency, Task priority

## Software Engineering

Understanding the event loop explains why long-running SYNCHRONOUS
JavaScript (a big, blocking loop) freezes an entire web page — since the
single thread is busy running that code, the event loop can't pull ANY
queued callback (including UI-related ones) until the blocking code
finishes, no matter how many async operations are pending.

Tags: UI freezing, Blocking the main thread, Async operation scheduling

## Common Mistakes

- Assuming `setTimeout(fn, 0)` runs "immediately" — it still gets QUEUED and only runs after the current synchronous code finishes AND the call stack is empty, never actually interrupting currently-running code.
- Writing long-running synchronous computation in browser JS without breaking it into smaller chunks — this blocks the single thread entirely, freezing the UI and preventing ANY queued async callback from running until the blocking code finally completes.

## Exercises

- Trace through the exact print order of a Promise `.then()` callback versus a `setTimeout(..., 0)` callback scheduled at roughly the same point — which one is guaranteed to run first, and why?
- Explain why a `while(true) {}` loop with no exit condition would freeze an entire browser tab, including things seemingly unrelated to that specific code (like button clicks).

## javascript

```javascript
console.log('1')

setTimeout(() => console.log('2 (macrotask)'), 0)

Promise.resolve().then(() => console.log('3 (microtask)'))

console.log('4')
```
Walkthrough: `'1'` and `'4'` run immediately, synchronously, since
they're not scheduled through any queue. The Promise's `.then()`
callback (a MICROTASK) runs before the `setTimeout` callback (a
MACROTASK), even though both were scheduled around the same point,
because the event loop always drains ALL pending microtasks before
moving on to the next macrotask — producing the order `1`, `4`, `3
(microtask)`, `2 (macrotask)`.
