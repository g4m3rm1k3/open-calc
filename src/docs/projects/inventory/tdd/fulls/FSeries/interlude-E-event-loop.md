# Interlude E: The Event Loop and Async JavaScript

**What you will build**
Nothing running in the app yet — this interlude demonstrates, directly and observably, how JavaScript stays responsive while waiting on things (like the network calls Lesson F2 needs) despite running on a single thread. The problem we're solving: this is precisely the kind of mechanical gap "boring, PEMDAS" JS courses tend to skip entirely — you can write `fetch(...)` correctly by imitation without ever understanding what actually happens while it's "waiting," and that gap turns into real, confusing bugs the moment async code doesn't behave the way it looks like it should.

**What you need to know first**
Backend Interlude A (call stack — reused directly here, same concept, new language).

**Exemption from the failing-test-first rule:** this interlude has no application feature to spec — it demonstrates real, observable ordering behavior instead.

---

## Concept Unit: Single-Threaded, Non-Blocking — the Event Loop

### The Problem

The backend, running under `uvicorn`, can genuinely handle multiple requests around the same time. A browser tab runs JavaScript on a single thread — there's no equivalent built-in parallelism. And yet, a slow network request never freezes an entire web page while it waits. Something has to explain how both of those facts are true at once.

### Demonstrate the behavior

Create `lab_eventloop.js`:

```javascript
console.log("1: start");

setTimeout(() => {
    console.log("3: timeout callback");
}, 0);

console.log("2: end");
```

Run it:

```bash
node lab_eventloop.js
```

Output:

```text
1: start
2: end
3: timeout callback
```

*What this proves — and this is the part worth sitting with:* `setTimeout(..., 0)` asked for the callback to run after *zero* milliseconds, and yet `"2: end"` still printed before it. The delay isn't really the point — `0` was chosen deliberately to prove that *even with no meaningful wait time*, the callback never runs immediately, or in the middle of the currently-running code. It always waits until the currently running code finishes completely.

### Explain the mechanism

This is JavaScript's **call stack** — the exact same concept from backend Interlude A, same underlying idea, now in a language without an interpreter managing multiple OS-level threads for you. `console.log("1: start")` and `console.log("2: end")` run as part of one single, uninterrupted pass through the script — nothing can interleave with that pass while it's running, because there's only one thread and one stack. `setTimeout`'s callback isn't run by that thread directly — it's handed off to the browser (or, in Node, to its runtime) to actually track the delay, and only placed into a **callback queue** once the delay elapses. The **event loop** is a continuously running check: "is the call stack currently empty? If yes, take the next item off the callback queue and push it onto the stack." That check is what finally runs `"3: timeout callback"` — but only after the stack was completely empty, which didn't happen until *after* `"2: end"` had already printed.

### CS Lens

**Concurrency without parallelism.** JavaScript can have many things "in flight" at once (multiple pending network requests, timers, user events) without ever running more than one piece of JS code at the exact same instant. This is a genuinely different model from Python's backend, where `uvicorn` can use real OS-level concurrency (and potentially parallelism, depending on configuration) to handle simultaneous requests. JS achieves responsiveness not by doing two things at literally the same time, but by never letting one slow thing (waiting on a network response) block the single thread from handling anything else in the meantime — the waiting happens *outside* JS's own thread entirely.

### SE Lens

**This is precisely why a slow `fetch()` call doesn't freeze a page, but a slow, non-async loop does.** A `for` loop doing a million iterations of real computation runs entirely on the single thread, with nothing to hand off — the call stack stays occupied and the browser tab genuinely, visibly freezes until it finishes. A `fetch()` call, in contrast, hands the actual waiting off entirely, freeing the stack immediately — this distinction (offloadable waiting vs. real, on-thread computation) is the practical line between "safe to leave un-optimized" and "will actually freeze the UI" in frontend code.

---

## Concept Unit: Promises and `async`/`await`

### The Problem

Raw callbacks (`setTimeout`'s style, from the previous unit) get unmanageable fast once several async steps need to happen in sequence — each one nested inside the previous one's callback, historically nicknamed "callback hell." We need a cleaner way to express "do this, then when it's done, do this next thing," especially since Lesson F2's real API calls will need exactly that sequencing.

### Demonstrate the behavior

Create `lab_promise.js`:

```javascript
function delay(ms, value) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(value), ms);
    });
}

console.log("A: start");

delay(50, "first result")
    .then((result) => {
        console.log("B:", result);
        return delay(50, "second result");
    })
    .then((result) => {
        console.log("C:", result);
    });

console.log("D: end (before either result)");
```

Run it:

```bash
node lab_promise.js
```

Output:

```text
A: start
D: end (before either result)
B: first result
C: second result
```

*What this proves:* `delay(...)` returns immediately — a `Promise` object, not the eventual value — which is why `"D: end"` prints before either `.then()` callback runs; the synchronous code (`console.log("A")`, calling `delay`, `console.log("D")`) all finishes first, exactly matching the event loop behavior from the previous unit. Each `.then()` only runs once its Promise actually resolves, and chaining them guarantees `B` happens entirely before `C` starts, without nesting one callback inside another.

### Explain the mechanism

A **Promise** is an object representing a value that doesn't exist yet, but will (or will fail to) — it exists in exactly one of three states: pending, fulfilled (resolved with a value), or rejected (failed with an error), and once it leaves "pending," it never changes state again. `.then()` registers what to do once a Promise fulfills, itself returning a *new* Promise — which is what makes chaining `.then().then()` work: each step waits for the one before it.

### Rewrite it as `async`/`await`

Create `lab_async.js`:

```javascript
function delay(ms, value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function run() {
    console.log("A: start");
    const first = await delay(50, "first result");
    console.log("B:", first);
    const second = await delay(50, "second result");
    console.log("C:", second);
}

run();
console.log("D: end (before either result)");
```

Run it:

```bash
node lab_async.js
```

Output:

```text
A: start
D: end (before either result)
B: first result
C: second result
```

*What this proves:* identical output, identical actual behavior — `async`/`await` is **syntactic sugar** over exactly the same Promise mechanism from the previous unit, not a different execution model. `await delay(...)` pauses `run()`'s own execution at that line until the Promise resolves, *without* blocking the rest of the program (`"D: end"` still prints before `run()` resumes) — the function reads top-to-bottom like ordinary sequential code, while still behaving exactly like the `.then()` chain underneath.

### CS Lens

**A Promise as a small, one-way state machine.** Pending → fulfilled or pending → rejected, and never any transition after that — the same "state machine" framing used for regular expressions back in backend Lesson 11, applied here to a value's lifecycle instead of text matching. Recognizing this as the same *kind* of structure, not a brand-new concept, is worth more than memorizing Promise syntax on its own.

### SE Lens

**`async`/`await` is preferred over raw `.then()` chains specifically for readability, not because it does anything fundamentally different.** Both examples above produce identical output through identical underlying mechanics — the choice is purely about which version is easier for a human to read and reason about later, especially once error handling (`try`/`catch` around an `await`, directly parallel to `.catch()` on a `.then()` chain) and multiple sequential steps are involved. This is worth remembering exactly because it prevents a common confusion: `async`/`await` doesn't make code "more asynchronous" or "faster" — it's the same event loop, the same Promises, just read top-to-bottom.

---

## Closing

**Connect the pieces**
JavaScript's single call stack means synchronous code always finishes completely before any pending callback runs — the event loop is the mechanism that continuously checks for an empty stack and pushes the next queued callback onto it. Promises give a structured, chainable way to express "when this eventually resolves, do this next," and `async`/`await` is the same mechanism, written to read like ordinary sequential code. Lesson F2's real `fetch()` calls will return Promises, and will be written with `async`/`await`, directly on top of everything demonstrated here.

**What breaks without this**
Without understanding that `await` doesn't block anything outside the function it's in, it's easy to expect `console.log` statements to run in the order they're *written*, rather than the order the event loop actually schedules them — leading to genuinely confusing bugs where logs, UI updates, or API-dependent logic appear to run "out of order," when they're actually running in the only order the underlying mechanism ever guaranteed.

**Exercises**
1. Add a `try`/`catch` around the `await` calls in `lab_async.js`, then modify `delay` to sometimes call `reject(new Error("simulated failure"))` instead of `resolve`, and confirm the `catch` block runs — this is the exact pattern Lesson F2 needs for real network failures.
2. Predict the print order of a version of `lab_eventloop.js` with *two* `setTimeout` calls, one with delay `100` and one with delay `0`, both before a final synchronous `console.log` — then run it and check your prediction against the actual output.

**Definition of Done**
* [x] Observed the event loop directly: synchronous code always completes before a queued callback runs, even with a `0`ms delay.
* [x] Rewrote a `.then()` chain as `async`/`await`, confirming identical behavior underneath.
* [x] Can explain, without notes, why `await` doesn't block code outside the function it's used in.

---

## Context Snapshot (End of Interlude E)

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Call stack (JS) | Interlude E | Same concept as backend Interlude A — the currently-running code's execution frames |
| Callback queue | Interlude E | Where completed async callbacks wait until the call stack is empty |
| Event loop | Interlude E | Continuously moves the next queued callback onto the stack once it's empty |
| Concurrency without parallelism | Interlude E | Multiple things "in flight" without ever running literally simultaneously |
| Promise (pending/fulfilled/rejected) | Interlude E | An object representing a not-yet-available value, as a one-way state machine |
| `async`/`await` | Interlude E | Syntactic sugar over Promises, letting async code read sequentially |

**Lesson Completion State:**
- Completed: F1, Interlude E
- Next: F2 — Talking to a Real API
