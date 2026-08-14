# Concept: JavaScript Promises & Asynchronous Programming

**What you'll understand by the end:** what a Promise represents, and why asynchronous code runs out of the order it's written in.

**Prerequisites:** `javascript-arrow-functions.md`.

## Setup

Any JavaScript runtime — a browser console or Node.js. No install needed.

## The Problem

Some operations (a network request, a timer, reading a large file) take real time to complete. Blocking the whole program until they finish would freeze everything else it could otherwise be doing in the meantime — in a browser, that means the page stops responding to clicks and scrolling entirely while waiting.

## The Isolated Example

```javascript
function delayedValue(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

console.log("start");
delayedValue("done waiting", 1000).then((result) => {
  console.log(result);
});
console.log("this prints before 'done waiting'");
```

**Real output, over about one second:**
```
start
this prints before 'done waiting'
done waiting
```

**What this proves:** the program did not pause at `delayedValue(...)` — the third `console.log` ran immediately, before the Promise had resolved. `.then`'s callback only ran once the one-second timer actually finished, out of the code's normal top-to-bottom order — proof that "asynchronous" means "scheduled for later," not "slower but still sequential."

## Mechanical Walkthrough

- `new Promise((resolve) => { ... })` — a **Promise** is an object representing "a value that isn't ready yet, but will be." The function passed to its constructor receives a `resolve` callback; calling `resolve(value)` later is what makes the Promise fulfilled with that value.
- `setTimeout(() => resolve(value), ms)` schedules `resolve(value)` to run after `ms` milliseconds, without blocking anything in the meantime.
- `.then(callback)` registers what should happen once the Promise is fulfilled — it does not itself wait or block; it returns immediately, having only *registered* the callback for later.

## CS Lens

A Promise has three states: pending (not yet resolved or rejected), fulfilled (resolved with a value — triggers `.then`), or rejected (failed — triggers `.catch`). This is **asynchronous programming**: starting an operation that takes real time without blocking the rest of the program while it waits, and running a callback only once the result actually arrives.

Also recognized in: literally every modern app that talks to a network (every mobile app, every web app), event-driven UI frameworks generally (see `event-loop.md`), and a CNC controller issuing a motion command and continuing other work (reading the next line, updating a display) while the axis is still physically moving, rather than freezing until the move completes.

## SE Lens

The alternative — a synchronous, blocking call for a slow operation — would freeze an entire browser tab (JavaScript is single-threaded) for however long the operation takes, making the page completely unresponsive. Promises let the runtime keep handling other work (clicks, scrolling, rendering, other pending operations) while a slow operation is in flight, at the cost of code that runs out of visual order — a real readability tradeoff that `async`/`await` syntax exists specifically to soften, by letting asynchronous code *read* sequentially while still behaving non-blockingly underneath.

## Connection

Builds on `event-loop.md` (Promises are resolved by the same underlying event loop) and `javascript-arrow-functions.md` (the near-universal style for `.then` callbacks). `fetch-api.md` is the most common real source of Promises in web code.

## Try It Yourself

1. Chain a second `.then` after the first, returning a new transformed value from the first callback (e.g. uppercase the string) and reading it in the second. Confirm Promise chaining passes a value from one `.then` to the next.
2. Add a `.catch(...)` and deliberately call `reject(new Error("failed"))` instead of `resolve(...)` inside the Promise constructor. Confirm `.then` is skipped entirely and `.catch` runs instead.
3. Start three `delayedValue` calls with different delays (e.g. 300ms, 100ms, 500ms) without chaining them to each other — just call all three and log each result as it arrives. Confirm they resolve in time order, not call order, proving they're genuinely running concurrently, not queued one after another.
