---
series: javascript-fundamentals
level: 8
title: Promises & async/await
lang: javascript
---

# Promises & async/await

JavaScript runs in a single thread — it can only do one thing at a time. But waiting for a network request or a file should not freeze the whole program. **Promises** and **async/await** are how JavaScript starts a slow operation, continues doing other things, and picks up the result when it is ready.

This lesson teaches what a Promise is, how to consume one with `async/await`, and how errors are handled in asynchronous code.

## The Problem: One Thread, Many Waits

Without asynchronous programming, fetching data from a server would pause the entire program:

```text
Start fetch (network takes 200ms)
← program is frozen for 200ms
Read result
Continue
```

With asynchronous programming:
```text
Start fetch → promise returned immediately
Program continues with other work
← 200ms later, promise resolves
Handler runs with the result
```

The program never freezes. The fetch starts, control returns to the caller, and the result is processed later.

## What a Promise Is

A **Promise** is an object representing a value that will be available in the future. It has three states:

```text
pending   — the operation has started but not finished
fulfilled — the operation succeeded; the value is ready
rejected  — the operation failed; an error is available
```

The `Promise` constructor takes a function with two parameters: `resolve` (call when done) and `reject` (call on error):

```javascript
function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(() => resolve(`done after ${milliseconds}ms`), milliseconds)
  })
}

const promise = delay(100)
console.log("Promise created:", promise)
```

```text
Promise created: Promise { <pending> }
```

`new Promise(executor)` — creates a promise. `executor` is called immediately with `resolve` and `reject`.
`setTimeout(callback, ms)` — a browser/Node API: calls `callback` after `ms` milliseconds. This is not covered in depth here; treat it as a stand-in for any slow operation.
`resolve(value)` — when called, moves the promise from `pending` to `fulfilled` and makes `value` available to whoever is waiting.

## await — Waiting for a Promise

`await` pauses the current async function until the promise resolves, then returns the resolved value:

```javascript
async function main() {
  const result = await Promise.resolve("Hello from a promise")
  console.log(result)
  console.log("This runs after the promise resolves")
}

main()
```

```text
Hello from a promise
This runs after the promise resolves
```

`async function main()` — the `async` keyword marks a function as asynchronous. Only inside an `async` function can you use `await`.

`await Promise.resolve("Hello from a promise")` — `Promise.resolve(value)` creates a promise that is already fulfilled with `value`. `await` unwraps it, returning `"Hello from a promise"`.

**CS lens:** `await` does not block the thread. Under the hood, the engine saves the current function's state (a **continuation**), returns control to the event loop, and resumes the function when the promise settles. The thread is free to do other work while waiting.

## Chaining async Operations

`await` can be used multiple times in one async function, making each step wait for the previous:

```javascript
async function fetchAndProcess() {
  const raw = await Promise.resolve([1, 2, 3, 4, 5])
  const doubled = raw.map(n => n * 2)
  const total = doubled.reduce((acc, n) => acc + n, 0)
  return total
}

async function main() {
  const result = await fetchAndProcess()
  console.log(`Total: ${result}`)
}

main()
```

```text
Total: 30
```

Each `await` pauses until that promise resolves. The function reads sequentially from top to bottom, even though the actual work is asynchronous. This is why `async/await` exists — the alternative (chaining `.then()` calls) becomes hard to read with more than two steps.

## Error Handling with try/catch

When a promise is rejected, `await` throws. Wrap in `try/catch` to handle errors:

```javascript
async function riskyOperation(shouldFail) {
  return new Promise((resolve, reject) => {
    if (shouldFail) {
      reject(new Error("Operation failed"))
    } else {
      resolve("Operation succeeded")
    }
  })
}

async function main() {
  try {
    const result = await riskyOperation(false)
    console.log(result)

    const failed = await riskyOperation(true)
    console.log(failed)
  } catch (error) {
    console.log(`Caught: ${error.message}`)
  }
}

main()
```

```text
Operation succeeded
Caught: Operation failed
```

`reject(new Error("Operation failed"))` — moves the promise to `rejected` state with an error. `new Error(message)` creates an Error object; `error.message` reads its description.

`try { ... } catch (error) { ... }` — if any `await` inside the `try` block rejects, execution jumps to the `catch` block with the error. This is the same `try/catch` pattern from Python Fundamentals Level 26, now applied to asynchronous errors.

## Promise.all — Running Concurrently

`Promise.all([p1, p2, p3])` — starts all promises at once and resolves when all are done:

```javascript
async function main() {
  const results = await Promise.all([
    Promise.resolve("first"),
    Promise.resolve("second"),
    Promise.resolve("third"),
  ])

  console.log(results)
}

main()
```

```text
[ 'first', 'second', 'third' ]
```

`Promise.all(array)` — returns a promise that resolves with an array of all results in the same order as the input. If any promise rejects, `Promise.all` rejects immediately with that error.

**SE lens:** Use `Promise.all` when the operations are independent and can run at the same time. Use sequential `await` when each operation depends on the previous result. The performance difference matters when the operations are genuinely slow (network requests, disk reads).

## Challenge: retry

Write an async function `retry(asyncOperation, maxAttempts)` that calls `asyncOperation()` up to `maxAttempts` times. Return the result on the first success. If every attempt fails, throw the last error.

`asyncOperation` is a function that returns a Promise. It may resolve or reject. Call it with no arguments.

Use a `for` loop from `1` to `maxAttempts`. Use `try/catch` inside the loop to catch rejections. On the last attempt, do not catch the error — let it propagate.

```challenge
async function retry(asyncOperation, maxAttempts) {
  // TODO
}
```

```test
let calls = 0
const alwaysSucceeds = () => Promise.resolve("ok")
const failsTwice = () => { calls++; return calls < 3 ? Promise.reject(new Error("fail")) : Promise.resolve("success") }
retry(alwaysSucceeds, 3).then(r => { assert r === "ok" })
calls = 0
retry(failsTwice, 3).then(r => { assert r === "success" })
assert typeof retry === "function"
```
