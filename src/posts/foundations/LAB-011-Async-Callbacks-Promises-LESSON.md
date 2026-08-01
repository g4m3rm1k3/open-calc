# FOUNDATIONS — LAB-011 — Async Programming: Callbacks, Promises, and async/await

**Series:** FOUNDATIONS — Part II: Programming Fundamentals
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 75–90 minutes.

---

## What You Will Build

Three versions of the same program — "wait 1 second, then fetch a number, then double it, then log it" — written first with callbacks, then with Promises, then with async/await. All three run in the browser console. After this lab, you will be able to read any asynchronous JavaScript code, predict the order operations execute in, and write async functions that handle errors correctly.

---

## What You Need to Know First

**From LAB-002 (Processes, Threads, and the Event Loop):** JavaScript runs on a single thread. The event loop processes one task at a time from the task queue. `setTimeout(fn, 0)` does not call `fn` immediately — it queues `fn` as a task to run after the current synchronous code completes.

**From LAB-007 (Closures):** Callbacks close over their surrounding scope. A callback defined inside a setup function has access to that function's variables when it is eventually called, even though the setup function has long since returned.

**From LAB-009 (Error Handling):** Exceptions propagate up the call stack. Asynchronous code has no call stack to propagate through — which is why async error handling requires a different mechanism.

---

> **Quick Check — try to answer before reading:**
>
> 1. `console.log("A"); setTimeout(() => console.log("B"), 0); console.log("C");` — in what order do A, B, C appear?
> 2. A callback calls another callback which calls another callback. What does the code structure look like? What is this called?
> 3. If a Promise is `rejected` and no `.catch()` handler exists, what happens?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Event Loop: Why Async Exists

**The problem this step solves:** Establish why asynchronous programming is necessary in JavaScript before introducing any mechanism for it.

**The code:**

```js
console.log("Before");

setTimeout(function() {
  console.log("Inside timeout");
}, 1000);

console.log("After");
```

Run this in the browser console. Before pressing Enter, predict the output order.

**The walkthrough — what executes and when:**

1. `console.log("Before")` — synchronous. Runs immediately. Logs `"Before"`.
2. `setTimeout(fn, 1000)` — a built-in browser function. It does NOT pause execution for 1 second. It registers the callback with the browser's timer mechanism and returns immediately. The main thread continues.
3. `console.log("After")` — synchronous. Runs immediately. Logs `"After"`.
4. The current synchronous code is done. The call stack empties.
5. 1000ms passes. The browser's timer fires. The callback `function() { console.log("Inside timeout") }` is placed in the **task queue**.
6. The event loop sees the call stack is empty and picks up the task from the queue. The callback runs. Logs `"Inside timeout"`.

Output order: `Before`, `After`, `Inside timeout`.

**`setTimeout(callback, delayMs)`** — a built-in browser (and Node.js) function. The first argument is the callback function to call. The second argument is the minimum delay in milliseconds before calling it — not a guaranteed delay, a minimum. If the call stack is busy, the callback waits longer. `setTimeout(fn, 0)` means "call this as soon as the current synchronous code finishes," not "call this immediately."

**CS lens — the event loop architecture:**

The JavaScript runtime has three parts: the **call stack** (synchronous execution, one thing at a time), the **task queue** (pending async callbacks), and the **event loop** (the scheduler that moves tasks from the queue to the call stack when the stack is empty). The task queue is FIFO — first in, first out. The event loop's rule: if the call stack is empty, move the oldest task from the queue to the stack and run it.

**SE lens — why single-threaded with an event loop:**

Multi-threaded programming requires synchronization: mutexes, semaphores, monitors, race condition detection. Every line of code that might run concurrently needs protection. JavaScript avoided this by being single-threaded — at any moment, exactly one piece of JavaScript code is running. The event loop provides concurrency without parallelism: the appearance of doing many things at once by interleaving tasks, never actually running two at the same time. For I/O-heavy programs (web servers, UIs), this is sufficient. For CPU-heavy programs (video encoding, machine learning), it is not — Node.js provides worker threads for those cases.

**What breaks without the event loop:**

If `setTimeout` actually paused the thread for 1000ms, the browser would be unresponsive — no scrolling, no clicks, no rendering. Every animation would freeze during any timer. The event loop's asynchronous model allows the browser to remain responsive while waiting for timers, network responses, and file reads.

---

### SAVE AND TRY

```js
console.log("1 — synchronous start");

setTimeout(() => console.log("2 — timeout A (0ms)"), 0);
setTimeout(() => console.log("3 — timeout B (100ms)"), 100);

console.log("4 — synchronous end");
```

Expected order: `1`, `4`, `2`, `3`.

**Change something:** Add `setTimeout(() => console.log("0 — timeout (0ms)"), 0)` at the very beginning. Expected: `1`, `4`, `0`, `2`, `3` — the first 0ms timeout fires before the second 0ms timeout because the task queue is FIFO. Both fire after all synchronous code. Then try adding a `while (Date.now() < Date.now() + 200) {}` busy loop between the synchronous lines. The 0ms timeout is delayed — it was queued 0ms after scheduling, but the busy loop kept the stack occupied. The event loop could not pick it up until the synchronous code finished.

---

### Step 2 — Callbacks: The Original Async Mechanism

**The problem this step solves:** Show the callback pattern for sequencing asynchronous operations, and show the problem it creates when operations must be chained.

**A simulation of an async operation:**

```js
// Simulate an async operation: after delayMs, call callback with a value
function asyncGetNumber(delayMs, callback) {
  setTimeout(function() {
    callback(null, 42);   // convention: first arg is error (null = no error), second is result
  }, delayMs);
}

asyncGetNumber(500, function(error, number) {
  if (error) {
    console.log("Error:", error);
    return;
  }
  console.log("Got number:", number);
});
```

The callback convention `callback(error, result)` — called **error-first callbacks** or **Node-style callbacks** — is a standard established by Node.js. The first argument is always an error object (or `null` if no error). The second argument is the result. Every callback must check the first argument before using the second.

**The walkthrough:**

1. `asyncGetNumber(500, callback)` is called. It registers a timeout and returns immediately.
2. 500ms later: the timeout fires. The callback is called with `(null, 42)`.
3. The callback checks `error` — it is `null`. Logs `"Got number: 42"`.

**The problem — chained callbacks:**

```js
// "Get a number, then double it, then add 10, then log"
asyncGetNumber(300, function(error, number) {
  if (error) { console.log("Step 1 error:", error); return; }
  
  asyncDouble(number, function(error, doubled) {
    if (error) { console.log("Step 2 error:", error); return; }
    
    asyncAddTen(doubled, function(error, result) {
      if (error) { console.log("Step 3 error:", error); return; }
      
      console.log("Final result:", result);
    });
  });
});
```

This is called **callback hell** or the **pyramid of doom**. Every async operation that depends on the result of a previous one requires nesting one level deeper. The error handling duplicates at every level. The structure grows rightward. Reading the code requires matching opening and closing braces across many indentation levels.

**CS lens — the inversion of control problem:**

With callbacks, you hand control to the async function: "here is what to do next — call this function when you are done." The function you are passing determines if, when, and how many times the callback is called. You cannot reason about execution order from top to bottom anymore. You must trace the flow through nested callbacks. This inversion of control is the fundamental problem that Promises solve.

**SE lens — error handling duplication:**

Every callback function must duplicate the error check. Missing one `if (error) return;` silently continues with `undefined` as the value. The pattern is error-prone because it relies on convention, not enforcement. Promises enforce error handling structurally — the `.catch()` at the end handles all rejections in the chain.

**What breaks without a pattern:**

Without the error-first convention, every library would have its own error reporting style. Some might pass the error second; some might not pass it at all. Writing code that uses multiple async libraries would require knowing each one's convention. The error-first convention made the Node.js ecosystem coherent. Promises replaced the need for the convention by building error handling into the abstraction.

---

### SAVE AND TRY

```js
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We will use delay() in later steps. For now, just verify callbacks:
function asyncMultiply(value, factor, callback) {
  setTimeout(() => callback(null, value * factor), 100);
}

asyncMultiply(5, 3, (error, result) => {
  if (error) { console.log("Error:", error); return; }
  console.log("5 × 3 =", result);   // → 15
});
```

Expected: `5 × 3 = 15` (after ~100ms).

**Change something:** Introduce an error: change the callback call to `callback(new Error("multiply failed"), null)`. Expected: the error path logs the message. Change it back to a successful call, then nest a second `asyncMultiply` inside the callback. The pyramid begins.

---

### Step 3 — Promises: A Value That Will Exist Later

**The problem this step solves:** Replace nested callbacks with chainable operations that read from top to bottom.

**What a Promise is:**

A **Promise** is an object that represents a value that is not yet available but will be at some point in the future — or has already been resolved. A Promise is in one of three states:
- **Pending**: the async operation has not completed yet
- **Fulfilled** (also called "resolved"): the operation completed successfully; the Promise has a value
- **Rejected**: the operation failed; the Promise has an error reason

Once a Promise is fulfilled or rejected, its state never changes. A fulfilled Promise stays fulfilled forever with the same value.

**Creating a Promise:**

```js
function asyncGetNumber(delayMs) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      const number = 42;
      resolve(number);   // signals success with a value
    }, delayMs);
  });
}
```

`new Promise(executor)` — creates a Promise. The `executor` function is called immediately (synchronously) with two arguments: `resolve` (call to fulfill the Promise with a value) and `reject` (call to reject it with an error). The Promise is pending until one of them is called.

**Consuming a Promise with `.then()` and `.catch()`:**

```js
asyncGetNumber(500)
  .then(function(number) {
    console.log("Got:", number);   // → "Got: 42"
    return number * 2;
  })
  .then(function(doubled) {
    console.log("Doubled:", doubled);   // → "Doubled: 84"
    return doubled + 10;
  })
  .then(function(result) {
    console.log("Final:", result);   // → "Final: 94"
  })
  .catch(function(error) {
    console.log("Error anywhere in chain:", error.message);
  });
```

**`.then(handler)`** — registers a callback to run when the Promise fulfills. The handler receives the fulfilled value. The return value of the handler becomes the value of a new Promise. This new Promise is what `.then()` returns — which is why calls can be chained.

**`.catch(handler)`** — registers a callback to run when the Promise rejects (or when any `.then()` handler throws an error). One `.catch()` at the end of a chain handles errors from any step in the chain.

**The walkthrough — what executes:**

1. `asyncGetNumber(500)` returns a pending Promise. The `.then()` and `.catch()` handlers are registered but not called yet.
2. 500ms passes. The timeout fires. `resolve(42)` is called. The first `.then` handler runs with `number = 42`. Logs `"Got: 42"`. Returns `84`.
3. The second `.then` handler runs with `doubled = 84`. Logs `"Doubled: 84"`. Returns `94`.
4. The third `.then` handler runs with `result = 94`. Logs `"Final: 94"`.
5. If any step throws an error or returns a rejected Promise, the `.catch` handler runs instead. The remaining `.then` handlers are skipped.

**CS lens — Promise chaining as a monad:**

Each `.then()` returns a new Promise whose value is whatever the handler returns. If the handler returns a Promise, the chain waits for that Promise to resolve. This makes chains composable: `p.then(f).then(g)` applies `f` to the result, then applies `g` to `f`'s result — regardless of whether `f` or `g` are synchronous or asynchronous. The chain reads top-to-bottom, like synchronous code, even though the operations are asynchronous.

**SE lens — one error handler for the whole chain:**

The single `.catch()` at the end handles errors from any point in the chain. This is the same as wrapping multiple synchronous operations in one `try/catch`. With callbacks, every step required its own error check. With Promises, the error handling is separated from the happy path. The happy path reads as a straight sequence; errors are handled in one place.

**What breaks without `.catch()`:**

An unhandled Promise rejection in modern browsers and Node.js produces a warning or error. In older Node.js versions, it crashed the process. The behavior varies, but the pattern is always wrong: an unhandled rejection silently swallows an error that indicates a real problem.

---

### SAVE AND TRY

```js
function asyncGetNumber(delayMs) {
  return new Promise((resolve) => setTimeout(() => resolve(42), delayMs));
}

asyncGetNumber(200)
  .then(number => {
    console.log("Number:", number);
    return number * 2;
  })
  .then(doubled => {
    console.log("Doubled:", doubled);
    return doubled + 10;
  })
  .then(result => {
    console.log("Result:", result);
  })
  .catch(error => {
    console.log("Error:", error.message);
  });
```

Expected (after 200ms): `Number: 42`, `Doubled: 84`, `Result: 94`.

**Change something:** In the first `.then`, add `throw new Error("deliberate error")` after the log. Expected: the second and third `.then` handlers are skipped; the `.catch` runs with `"deliberate error"`. Then change `resolve(42)` to `reject(new Error("fetch failed"))`. Expected: the `.catch` runs immediately; no `.then` handlers run.

---

### Step 4 — async/await: Synchronous-Looking Async Code

**The problem this step solves:** Write asynchronous code that reads like synchronous code, using `try/catch` for error handling instead of `.catch()`.

**The syntax:**

```js
async function fetchAndProcess() {
  const number = await asyncGetNumber(200);
  console.log("Number:", number);

  const doubled = number * 2;
  console.log("Doubled:", doubled);

  return doubled + 10;
}

fetchAndProcess().then(result => {
  console.log("Result:", result);
});
```

**`async function`** — the `async` keyword before `function` declares an async function. An async function **always returns a Promise**, regardless of what `return` statement it contains. `return 42` inside an async function is equivalent to `resolve(42)` — the function returns a Promise that fulfills with `42`.

**`await`** — used inside an async function, `await expression` pauses execution of the function at that line until the awaited Promise fulfills. The function's stack frame is suspended (not blocked — the event loop continues running other tasks) and resumes when the Promise settles. The value `await` evaluates to is the fulfilled value of the Promise. If the Promise rejects, `await` throws the rejection reason as an error — which means `try/catch` works.

**The walkthrough — what executes:**

1. `fetchAndProcess()` is called. Because it is `async`, it returns a Promise immediately.
2. Inside `fetchAndProcess`: `asyncGetNumber(200)` is called, returning a pending Promise. `await` suspends `fetchAndProcess` at this line.
3. The event loop continues. Other synchronous code after `fetchAndProcess().then(...)` runs.
4. 200ms later: `asyncGetNumber`'s Promise fulfills with `42`. `fetchAndProcess` resumes. `number` = `42`. Logs `"Number: 42"`.
5. `doubled` = `84`. Logs `"Doubled: 84"`.
6. `return 94` — the Promise returned by `fetchAndProcess()` fulfills with `94`.
7. The `.then(result => ...)` handler runs with `result = 94`. Logs `"Result: 94"`.

**Error handling with async/await:**

```js
async function safeProcess() {
  try {
    const number = await asyncGetNumber(200);
    const doubled = number * 2;
    return doubled;
  } catch (error) {
    console.log("Caught:", error.message);
    return 0;   // fallback value
  }
}
```

`try/catch` works inside async functions because `await` translates a rejected Promise into a thrown error. The `catch` block receives the rejection reason. This is the error handling mechanism from LAB-009, applied to async code without any new syntax.

**CS lens — cooperative multitasking:**

When an async function hits `await`, it **yields control** to the event loop. This is **cooperative multitasking**: the function voluntarily gives up the CPU until its awaited operation completes. Unlike thread preemption (where the OS forcibly switches between threads), JavaScript's async model requires explicit yield points (`await`). This means async functions are predictable: they only pause at `await` expressions and nowhere else.

**SE lens — async/await vs Promises:**

`async/await` does not replace Promises — it is syntax sugar that compiles to Promises. `await p` is equivalent to `p.then(value => { /* rest of function */ })`. The advantage of `async/await` is readability: the code reads top-to-bottom, errors use familiar `try/catch`, and there are no nested callbacks or chained `.then()` calls. The disadvantage: because it looks like synchronous code, developers sometimes forget that `await` pauses the function, and that the pause means other code may run between two `await` lines.

**What breaks without `await` on a Promise:**

```js
async function forgotAwait() {
  const number = asyncGetNumber(200);   // forgot await — number is a Promise, not 42
  console.log("Number:", number);       // → Promise { <pending> }
  return number * 2;                    // → NaN  (cannot multiply a Promise)
}
```

This is the most common async bug: using a Promise as if it were its resolved value. The error is silent — `NaN` is returned, not an exception. Always `await` a Promise before using its value.

---

### SAVE AND TRY

```js
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pipeline() {
  console.log("Start");
  await delay(300);
  console.log("After 300ms");
  await delay(200);
  console.log("After another 200ms");
  return "done";
}

async function main() {
  const result = await pipeline();
  console.log("Result:", result);
}

main();
console.log("This logs before delay");   // synchronous, logs immediately
```

Expected order: `"Start"`, `"This logs before delay"`, then (after 300ms) `"After 300ms"`, then (after 200ms more) `"After another 200ms"`, then `"Result: done"`.

**Change something:** Remove `await` from `const result = await pipeline()`. Expected: `result` is a Promise object, not `"done"`. `console.log("Result:", result)` logs the Promise. This demonstrates why you must `await` every async function call whose return value you use.

---

### Step 5 — Parallel vs Sequential Async Operations

**The problem this step solves:** Show that `await` inside a loop runs operations sequentially, and `Promise.all` runs them in parallel.

**Sequential — one at a time:**

```js
function fetchUser(id) {
  return new Promise(resolve => setTimeout(() => resolve({ id, name: "User " + id }), 200));
}

async function getThreeUsersSequential() {
  const startTime = Date.now();
  const user1 = await fetchUser(1);   // wait 200ms
  const user2 = await fetchUser(2);   // then wait another 200ms
  const user3 = await fetchUser(3);   // then wait another 200ms
  console.log("Sequential time:", Date.now() - startTime, "ms");  // ~600ms
  return [user1, user2, user3];
}
```

Total time: ~600ms. Each fetch waits for the previous one to complete before starting.

**Parallel — all at once:**

```js
async function getThreeUsersParallel() {
  const startTime = Date.now();
  const [user1, user2, user3] = await Promise.all([
    fetchUser(1),   // all three start simultaneously
    fetchUser(2),
    fetchUser(3),
  ]);
  console.log("Parallel time:", Date.now() - startTime, "ms");  // ~200ms
  return [user1, user2, user3];
}
```

Total time: ~200ms. All three fetches start at the same time. `Promise.all` waits for all of them to resolve.

**`Promise.all(arrayOfPromises)`** — accepts an array of Promises and returns a single Promise that:
- Fulfills when **all** Promises in the array have fulfilled. The value is an array of their fulfilled values, in the same order as the input.
- Rejects immediately if **any** one Promise rejects. The rejection reason is the first rejection.

`const [user1, user2, user3] = await Promise.all([...])` — this uses **array destructuring**, a JavaScript syntax that unpacks an array into individual variables in one line. `const [a, b, c] = [1, 2, 3]` sets `a = 1`, `b = 2`, `c = 3`.

**CS lens — concurrency vs parallelism:**

JavaScript is single-threaded — it cannot execute two things at the same millisecond. But three 200ms network requests that start at the same time can all be **in-flight simultaneously**. While JavaScript is waiting for the network responses (doing nothing), it can be "waiting" for all three at once. This is **concurrency without parallelism**: multiple operations in progress simultaneously, but only one active at a time in JavaScript.

**SE lens — the cost of unnecessary sequential awaits:**

A common mistake: `await` each async operation in a loop when the operations are independent. Three independent database queries that each take 100ms should run in parallel (300ms total becomes 100ms). Awaiting them sequentially (300ms total stays 300ms) triples the response time. When operations are independent, use `Promise.all`. When operation B genuinely depends on the result of operation A, use sequential `await`.

**What breaks without `Promise.all`:**

A web API endpoint that fetches data from three independent sources sequentially takes 3× longer than parallel. Under high load, 3× slower query time means 3× more concurrent connections are held open, straining the database connection pool. `Promise.all` is not an optimization — it is the correct default for independent async operations.

---

### SAVE AND TRY

```js
function fetchItem(id, delayMs) {
  return new Promise(resolve => setTimeout(() => resolve(`item-${id}`), delayMs));
}

async function compare() {
  // Sequential
  const seqStart = Date.now();
  const a = await fetchItem(1, 150);
  const b = await fetchItem(2, 150);
  const c = await fetchItem(3, 150);
  console.log("Sequential:", Date.now() - seqStart, "ms", [a, b, c]);

  // Parallel
  const parStart = Date.now();
  const [x, y, z] = await Promise.all([
    fetchItem(4, 150),
    fetchItem(5, 150),
    fetchItem(6, 150),
  ]);
  console.log("Parallel:", Date.now() - parStart, "ms", [x, y, z]);
}

compare();
```

Expected: sequential ~450ms, parallel ~150ms.

**Change something:** Add a failing fetch: `fetchItem(7, 150, true)` where the flag causes it to reject. Wrap `Promise.all` in a `try/catch`. Expected: the whole `Promise.all` rejects as soon as one item fails. The other two that would have succeeded are ignored.

---

## Connect the Pieces

**What you built:** Three implementations of the same async flow (callbacks, Promises, async/await), parallel vs sequential operation, and the event loop mechanics underlying all of it.

**How it connects to LAB-002:** In LAB-002 you saw the event loop model — one task at a time from the queue. `setTimeout` callbacks, Promise resolution handlers, and async function resumptions are all tasks that go through this queue. Every `await` is the function voluntarily yielding until its task is queued and ready.

**How it connects to LAB-007 (Closures):** Every callback and every `.then()` handler is a closure. The callback passed to `setTimeout` closes over the variables of the function that called `setTimeout`. The `.then()` handler closes over variables in the scope where it was written. This is why async code can reference outer variables even though those outer scopes have long since returned by the time the callback runs.

**How it connects to LAB-009 (Error Handling):** `try/catch` inside `async` functions works because `await` translates a rejected Promise into a thrown error. All the error handling principles from LAB-009 apply directly. The `finally` block inside an async function works as expected.

**How it connects forward:**

- **LAB-039 (TypeScript Async):** TypeScript types `async` functions as returning `Promise<T>` where `T` is the type of the resolved value. `async function getData(): Promise<User[]>` tells the type system exactly what the function produces.
- **LAB-046 (Python Async):** Python's `asyncio` uses `async def` and `await` with the same semantics as JavaScript. The concepts here — coroutines, event loop, task queue — transfer directly.
- **LAB-063 (Integration Testing):** Testing async code requires `await` or returning the Promise from the test. Test runners like Vitest and Jest understand async tests.
- **LAB-107 (Fetch API):** `fetch(url)` returns a Promise. `const data = await (await fetch(url)).json()` is a double-await pattern — one for the network response, one for parsing the response body as JSON.

**The real-world connection:**

Every web application you use is built on async programming. Every button click that loads data, every search that queries a server, every form submission — these are all async operations. React's `useEffect` runs async functions. Next.js server components are `async` by default. Node.js HTTP request handlers return Promises. Async/await is not a specialized technique — it is the fundamental model for writing JavaScript that interacts with anything outside the current execution.

---

## What Breaks Without This

**Concrete failure — blocking the event loop:**

```js
function doHeavyWork() {
  let total = 0;
  for (let iteration = 0; iteration < 1_000_000_000; iteration++) {
    total += iteration;
  }
  return total;
}

document.querySelector("button")?.addEventListener("click", () => {
  console.log("Starting heavy work...");
  const result = doHeavyWork();   // synchronous — blocks for ~1 second
  console.log("Result:", result);
});
```

During the `doHeavyWork` loop, the browser is frozen — no clicks are registered, no animations render, no other callbacks run. The UI is completely unresponsive for the duration. In production, this causes the browser to show a "page unresponsive" dialog and offer to kill the tab.

The fix: break the work into chunks and yield to the event loop between chunks using `setTimeout(processNextChunk, 0)`, or move it to a Web Worker (a true separate thread). Async/await does not magically fix CPU-bound work — `await` only yields to the event loop, which only helps when the awaited operation is I/O-bound (waiting for network, disk, or timer). Awaiting a synchronous computation is a no-op.

---

## Definition of Done

Verify each item before moving to LAB-012.

- [ ] `setTimeout(() => console.log("B"), 0)` logs `"B"` after synchronous code, not immediately
- [ ] A callback-based async function calls its callback with `(null, result)` on success and `(error, null)` on failure
- [ ] A Promise-based function returns a Promise that resolves with a value after a delay
- [ ] `.then().then().catch()` chain runs correctly — the `.catch` handles errors from any `.then`
- [ ] An `async function` always returns a Promise even when `return 42` is written
- [ ] `await` inside an async function pauses the function but not the event loop
- [ ] `Promise.all([p1, p2, p3])` runs all three concurrently — verified with timing
- [ ] `try/catch` inside an async function catches rejections from `await`

**Git commit:**

```
git add .
git commit -m "LAB-011: async programming — callbacks, Promises, and async/await with error handling and parallel execution"
```

---

## Quick Check Answers

**1. What order do A, B, C appear in `console.log("A"); setTimeout(() => console.log("B"), 0); console.log("C")`?**

`A`, `C`, `B`. `console.log("A")` runs synchronously. `setTimeout(fn, 0)` schedules `fn` as a task (minimum 0ms delay) but does not run it immediately — it queues it. `console.log("C")` runs synchronously. When all synchronous code finishes and the call stack empties, the event loop picks up the queued task and runs it: `console.log("B")`.

**2. What does the code structure look like for chained callbacks? What is it called?**

It grows rightward with each level of nesting, forming a triangular shape. Each dependent operation requires wrapping the previous callback in another function. With three levels:

```
operation1(function() {
  operation2(function() {
    operation3(function() {
      // actual work is here, deeply indented
    });
  });
});
```

This is called **callback hell** or the **pyramid of doom**. The structure makes it hard to read, hard to handle errors at the right level, and impossible to use synchronous control flow (loops, try/catch). Promises and async/await were designed specifically to solve this.

**3. What happens to an unhandled Promise rejection?**

In modern browsers and Node.js versions, an unhandled rejection produces a console warning: `Uncaught (in promise) Error: ...`. In Node.js 15+, it throws an uncaught exception that can crash the process. In older environments, unhandled rejections were silently swallowed — one of the most dangerous sources of silent failures in production Node.js applications. The rule: every Promise chain must end with `.catch()`, or the call site must use `await` inside a `try/catch`. An unhandled rejection is always a bug.

---

*Next: LAB-012 — Classes and Objects*
