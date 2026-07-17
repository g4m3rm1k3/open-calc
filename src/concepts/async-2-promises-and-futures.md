---
concept: async-2-promises-and-futures
name: Async, Part 2 — Promises & Futures
series: async-fundamentals
seriesTitle: Asynchronous Programming
part: 2
---

## Definition

A **Promise** (JavaScript), **coroutine/Task** (Python), or **Future**
(Java/`CompletableFuture`) is a placeholder object representing a value that isn't
ready yet — it has a state (pending → fulfilled or rejected) and lets you attach
code to run once the real value arrives, instead of blocking to wait for it.

## Problem

Before this pattern existed, the only tool for "do this after that finishes" was
passing a plain callback function directly into the async call itself. That works
for one async step, but chaining several in sequence nests callbacks inside
callbacks inside callbacks — "callback hell," genuinely hard to read and to handle
errors in consistently.

## Execution

Call async operation
↓
Placeholder object returned immediately (Promise/Future/coroutine) — pending state
↓
Calling code continues running other statements — no blocking
↓
Real operation finishes in the background
↓
Placeholder transitions to fulfilled (or rejected) state
↓
Attached callback (.then / await / .thenApply) finally runs, with the real value

## Computer Science

This is the Future/Promise pattern — a proxy for a result that doesn't exist yet.
Attaching a callback to it registers "run this once the real value is known," which
the runtime invokes later, without the calling code ever blocking to wait for it.

Tags: Future/Promise pattern, Continuation-passing, State machines

## Software Engineering

The placeholder-object pattern lets you chain async steps as a flat sequence
instead of a nested pyramid of callbacks, and centralizes error handling in one
place instead of every callback needing its own.

Tags: Callback hell, Error handling, Composability

## Common Mistakes

- Treating a Promise/Future/coroutine as if it already holds the value — logging it directly shows the placeholder object itself, not the eventual result; you can only get the real value by awaiting it or attaching a callback.
- Assuming every language's version starts running immediately — Python's coroutines are the exception (see the Python walkthrough below), and code that assumes otherwise silently does nothing until the coroutine is awaited somewhere.

## Exercises

- In the Python example, comment out the `await user_coro` line and predict what happens — does the 2-second wait still occur?
- In the JavaScript example, add a second `.then()` chained after the first and predict the order of all four log lines.

## javascript

```javascript
function getUserAsync(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve({ id }), 2000)  // "arrives" after 2 seconds
  })
}

console.log('before')
const userPromise = getUserAsync(1)   // returns IMMEDIATELY — a Promise, not a User
console.log('got a promise:', userPromise)
userPromise.then(user => console.log('after, with user:', user))
console.log('this runs before "after" does')
```
Walkthrough: `getUserAsync(1)` returns instantly — `userPromise` is a Promise
object, not a user, and it's in the "pending" state. `.then(...)` doesn't run
right away either; it registers a callback for later. The very next line runs
immediately, before the promise ever resolves — proving nothing blocked. Two
seconds later, once the timer fires, the `.then()` callback finally fires with the
real user. A JavaScript Promise is created **eager**: the work inside it starts
running the instant the Promise is constructed, whether or not anything is
attached to react to it yet.

## python

```python
import asyncio

async def get_user_async(user_id):
    await asyncio.sleep(2)  # "arrives" after 2 seconds
    return {"id": user_id}

async def main():
    print("before")
    user_coro = get_user_async(1)     # this line alone does NOT start the wait
    print("got a coroutine object, not a user yet:", user_coro)
    user = await user_coro            # the wait actually starts here
    print("after, with user:", user)

asyncio.run(main())
```
Walkthrough: calling `get_user_async(1)` does **not** start the 2-second wait —
it only creates a coroutine object, inert until something actually awaits or
schedules it. This is the opposite of JavaScript's Promise: Python's coroutines
are **lazy**. The wait only begins at `await user_coro`. This is a real,
correctness-relevant difference, not just a naming one.

## java

```java
import java.util.concurrent.CompletableFuture;

class User {
    int id;
    User(int id) { this.id = id; }
}

CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> {
    try { Thread.sleep(2000); } catch (InterruptedException e) {}
    return new User(1);
});

System.out.println("before");
System.out.println("got a future, not a user yet: " + userFuture);
userFuture.thenAccept(user -> System.out.println("after, with user: " + user));
System.out.println("this runs before \"after\" does");
```
Walkthrough: `supplyAsync` returns immediately with a `CompletableFuture` — like
JavaScript's Promise, the work inside it starts right away, running on a separate
thread from a background thread pool (Part 3 covers exactly what that pool is).
Java's `CompletableFuture` is eager, matching JavaScript's Promise, not Python's
lazy coroutine — worth noticing that this particular behavior splits along "JS
and Java agree, Python differs," not along any obvious language-family line.
