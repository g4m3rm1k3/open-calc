# FOUNDATIONS — LAB-009 — Error Handling and Exceptions

**Series:** FOUNDATIONS — Part II: Programming Fundamentals
**Environment:** Browser DevTools console (F12 → Console). No install required.
**Time:** 50–65 minutes.

---

## What You Will Build

A set of functions that throw typed custom errors, catch them at the correct level of the call stack, and always clean up after themselves — even when something goes wrong. You will also build a small utility that distinguishes recoverable errors (log and continue) from unrecoverable ones (propagate and crash). After this lab, you will never write `catch (e) {}` again without knowing why it is dangerous.

---

## What You Need to Know First

**From LAB-008 (Recursion):** You have already seen the call stack grow with nested calls and unwind on return. An exception is a different kind of unwinding: instead of returning a value, each frame is popped without executing the code after the throw, until a frame with a matching `catch` block is found.

**From LAB-001 (The Call Stack):** The call stack is a LIFO (last in, first out) structure. Exception propagation walks it from top to bottom — from the frame that threw, outward through the frames that called it.

---

> **Quick Check — try to answer before reading:**
>
> 1. A function 5 levels deep in the call stack throws an error. No `try/catch` exists at levels 4, 3, 2, or 1. What happens?
> 2. What is the difference between an error that is *expected* (a user typed their password wrong) and an error that is *unexpected* (a null pointer dereference)? Should you handle them the same way?
> 3. What does `finally` guarantee that `try/catch` alone does not?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — What an Exception Is and How It Propagates

**The problem this step solves:** Understand the mechanics of exception propagation before writing any error handling.

**The code:**

```js
function level3() {
  throw new Error("something went wrong");
}

function level2() {
  level3();
}

function level1() {
  level2();
}

level1();
```

Paste this into the console. A red error message appears. Click on the triangle or the filename next to the error to expand the **stack trace**.

**The walkthrough — what executes:**

1. `level1()` is called. Frame pushed.
2. `level2()` is called from `level1`. Frame pushed.
3. `level3()` is called from `level2`. Frame pushed.
4. `throw new Error("something went wrong")` executes. JavaScript creates a new `Error` object with the message. Instead of returning normally, the current frame **throws**.
5. The runtime searches the current frame for a `catch` block. None found. The frame is popped.
6. The runtime searches the `level2` frame. None found. Popped.
7. The runtime searches the `level1` frame. None found. Popped.
8. The runtime searches the top level. None found. The error is **unhandled**. The browser prints the error and the stack trace, and stops executing the script.

**`new Error("message")`** — `Error` is a built-in JavaScript class. `new Error("message")` creates an instance with two important properties: `message` (the string you passed) and `stack` (a string containing the stack trace at the moment of creation). Both are readable.

**CS lens — exception propagation is stack unwinding:**

An exception **unwinds** the call stack. Each frame is popped without executing any remaining code in that function. This is different from a normal return: normal returns execute the code after the called function returns; exception propagation skips all of it. The unwinding continues until a `catch` block intercepts the exception. If no `catch` block exists, the exception reaches the top of the stack and becomes an unhandled error.

**SE lens — fail fast:**

An unhandled exception that crashes visibly is better than a silently corrupted value that produces wrong answers hours later. This is the **fail fast** principle: detect and signal errors as close to their source as possible, rather than letting invalid state propagate silently through the system. A stack trace pointing to `level3()` is infinitely more useful than a wrong result 10 computations later with no indication of where it went wrong.

**What breaks without this:**

Without exceptions, functions must return error codes: `if (result === -1) { /* handle error */ }`. Callers forget to check. Error codes get mixed up with valid values. The code that detects the error and the code that handles it are intertwined at every call site. Exceptions separate the two: throw anywhere in the call stack, handle at whatever level is appropriate.

---

### SAVE AND TRY

```js
function level3() {
  throw new Error("something went wrong");
}

function level2() {
  level3();
}

function level1() {
  try {
    level2();
  } catch (error) {
    console.log("Caught at level1:", error.message);
  }
}

level1();   // → "Caught at level1: something went wrong"
```

Expected: the error is caught at `level1`, not at `level2` or `level3`. Execution continues after the `try/catch`.

**Change something:** Move the `try/catch` to `level2` instead. Expected: same message, but the catch happens one level deeper. Move it to `level3` (wrap the `throw` itself). Expected: the throw is immediately caught and the program continues normally — `level2` and `level1` never know an error occurred.

---

### Step 2 — Custom Error Classes

**The problem this step solves:** Distinguish between different categories of errors so callers can decide which ones to handle and which ones to propagate.

**The code:**

```js
class ValidationError extends Error {
  constructor(message, fieldName) {
    super(message);           // calls Error's constructor, sets this.message
    this.name = "ValidationError";
    this.fieldName = fieldName;
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}
```

**`class ValidationError extends Error`** — `extends` is the inheritance keyword. `ValidationError` is a subclass of `Error`. It inherits the `message` and `stack` properties from `Error`. `super(message)` calls `Error`'s constructor, which sets `this.message` and captures the current stack trace in `this.stack`. `extends` and inheritance are covered fully in LAB-014; for now, just know that this makes `ValidationError` a specialized kind of `Error`.

**Setting `this.name`** is important: `Error`'s default `name` is `"Error"`. If you do not override it, `instanceof` and console output say `Error`, not `ValidationError`. Setting `this.name = "ValidationError"` makes the error identifiable.

**The walkthrough — using the custom errors:**

```js
function validateAge(age) {
  if (typeof age !== "number") {
    throw new ValidationError("Age must be a number", "age");
  }
  if (age < 0 || age > 150) {
    throw new ValidationError("Age must be between 0 and 150", "age");
  }
  return age;
}

try {
  validateAge("seventeen");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed on field:", error.fieldName);
    console.log("Message:", error.message);
  } else {
    throw error;   // not a validation error — re-throw, let it propagate
  }
}
```

`instanceof` — the `instanceof` operator checks whether an object is an instance of a given class, including subclasses. `error instanceof ValidationError` returns `true` if `error` was created with `new ValidationError(...)`. It also returns `true` if `error` is an instance of any subclass of `ValidationError`.

The `else { throw error; }` is critical. If the caught error is not a `ValidationError`, re-throwing it propagates it up the call stack for a more appropriate handler to deal with. A catch block that silently swallows all errors hides bugs. Only catch what you know how to handle.

**CS lens — class hierarchy for errors:**

Organizing errors in a class hierarchy (specialized errors extend a base) enables **selective catching**: catch the specific error type you expect, propagate everything else. This pattern mirrors how operating systems organize system error codes, how HTTP status codes are grouped by category (4xx client errors, 5xx server errors), and how typed exception hierarchies work in Java and C#.

**SE lens — why not just use `error.message` to distinguish errors?**

String matching on error messages is fragile. Messages change. They have typos. They differ by locale. `instanceof` checks the actual type — which is stable and explicit. When a new error type is needed, it gets a new class, not a new message format. Type-based dispatch is the designed mechanism; string-based dispatch is a workaround that will eventually break.

**What breaks without custom error classes:**

Every catch block must inspect the message string: `if (error.message.includes("validation"))`. This breaks when messages change. Two different errors produce the same message by accident. A third-party library throws an error that happens to contain the word "validation" in its message, and your code handles it incorrectly. Custom error classes are the designed solution.

---

### SAVE AND TRY

```js
class ValidationError extends Error {
  constructor(message, fieldName) {
    super(message);
    this.name = "ValidationError";
    this.fieldName = fieldName;
  }
}

function validateEmail(email) {
  if (typeof email !== "string") {
    throw new ValidationError("Email must be a string", "email");
  }
  if (!email.includes("@")) {
    throw new ValidationError("Email must contain @", "email");
  }
  return email;
}

try {
  validateEmail(42);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Field "${error.fieldName}": ${error.message}`);
  } else {
    throw error;
  }
}
```

Expected: `Field "email": Email must be a string`.

**Change something:** Pass `"notemail"` (no `@`) instead of `42`. Expected: `Field "email": Email must contain @`. Pass `"user@example.com"`. Expected: no error, function returns the email. Try `console.log(error instanceof Error)` inside the catch — expected `true`, because `ValidationError extends Error`.

---

### Step 3 — `finally`: The Guaranteed Cleanup Block

**The problem this step solves:** Ensure cleanup code (closing resources, resetting state) always runs, regardless of whether an error occurred.

**The code:**

```js
function withResource() {
  let resource = null;

  try {
    resource = { name: "database connection", id: 1 };
    console.log("Resource opened:", resource.name);

    // Simulate work that might fail:
    if (Math.random() < 0.5) {
      throw new Error("Random failure during work");
    }

    console.log("Work completed successfully");
    return "success";

  } catch (error) {
    console.log("Error occurred:", error.message);
    return "failure";

  } finally {
    // This ALWAYS runs — whether we hit return in try, return in catch, or throw
    if (resource !== null) {
      console.log("Resource closed:", resource.name);
      resource = null;
    }
  }
}

console.log("Result:", withResource());
```

**The walkthrough — the three execution paths:**

**Path 1 (no error):** `try` block runs, `resource` is created, work completes, `return "success"` is reached. Before actually returning, `finally` runs. The resource is cleaned up. Then the function returns `"success"`.

**Path 2 (error thrown):** `try` block starts, `resource` is created, the error is thrown. Control jumps to `catch`. `catch` logs the message, reaches `return "failure"`. Before returning, `finally` runs. Resource cleaned up. Returns `"failure"`.

**Path 3 (error not caught):** If there were no `catch` block and an error were thrown, `finally` would still run before the exception propagates up. The cleanup happens even when the error is not handled at this level.

**`finally` guarantee:** The `finally` block runs in every case: normal completion, early return from `try`, early return from `catch`, and uncaught exception. It is the only mechanism in JavaScript that provides this guarantee.

**CS lens — resource acquisition is initialization (RAII):**

The `try/finally` pattern is JavaScript's approximation of **RAII** — a resource management technique from C++. The principle: acquire a resource (open a file, start a transaction, lock a mutex), do the work, release the resource. The release must happen regardless of whether the work succeeded. Python's `with` statement and Go's `defer` serve the same purpose. Without `finally`, a thrown exception would skip the cleanup code and leave the resource locked or open.

**SE lens — always release what you acquire:**

In Node.js, the most common resources are database connections (taken from a connection pool, must be returned), file handles (opened, must be closed), and network sockets (opened, must be closed). A function that acquires a resource but fails to release it on error causes **resource leaks** — the resource is never returned to the pool. Over time: the pool empties, new requests cannot get a connection, the server hangs. `finally` is the standard prevention.

**What breaks without `finally`:**

```js
function withoutFinally() {
  const connection = openConnection();
  doWork(connection);      // if this throws, connection is never closed
  closeConnection(connection);  // this line never runs on error
}
```

If `doWork` throws, `closeConnection` is skipped. The connection leaks. In a high-traffic server, 1% error rate × 1000 requests/second = 10 leaked connections per second. In minutes, the connection pool is exhausted.

---

### SAVE AND TRY

```js
function divide(numerator, denominator) {
  try {
    if (denominator === 0) throw new Error("Division by zero");
    const result = numerator / denominator;
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.log("Caught:", error.message);
    return null;
  } finally {
    console.log("divide() always logs this");
  }
}

console.log(divide(10, 2));    // Result: 5 → always logs → returns 5
console.log(divide(10, 0));    // Caught: Division by zero → always logs → returns null
```

Expected: both calls log "divide() always logs this", regardless of success or failure.

**Change something:** Remove the `catch` block (keep only `try/finally`). Call `divide(10, 0)`. Expected: `finally` still runs, then the error propagates and appears as an unhandled error. `finally` runs even when there is no `catch`.

---

### Step 4 — Recoverable vs Unrecoverable Errors

**The problem this step solves:** Know when to handle an error locally, when to propagate it, and when to let it crash.

**The code:**

```js
class RecoverableError extends Error {
  constructor(message) {
    super(message);
    this.name = "RecoverableError";
  }
}

class UnrecoverableError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnrecoverableError";
  }
}

function processUserInput(input) {
  if (typeof input !== "string") {
    // Unrecoverable: the caller passed the wrong type — this is a programmer error
    throw new UnrecoverableError("processUserInput requires a string — received " + typeof input);
  }
  if (input.trim().length === 0) {
    // Recoverable: the user left the field blank — this is expected and handleable
    throw new RecoverableError("Input cannot be empty");
  }
  return input.trim().toUpperCase();
}

function handleFormSubmit(rawInput) {
  try {
    const processed = processUserInput(rawInput);
    console.log("Processed:", processed);
  } catch (error) {
    if (error instanceof RecoverableError) {
      console.log("Show to user:", error.message);   // user sees this
    } else {
      throw error;   // programmer error — let it propagate to a global error handler
    }
  }
}

handleFormSubmit("");         // → "Show to user: Input cannot be empty"
handleFormSubmit("hello");    // → "Processed: HELLO"
handleFormSubmit(null);       // → UnrecoverableError propagates — unhandled
```

**The walkthrough — the classification decision:**

The empty-string case is a **domain error** — an expected condition that the system should handle gracefully. Users leave fields blank. This is normal operation. Display a helpful message.

The wrong-type case is a **programming error** — the caller violated the function's contract. This should never happen in correct code. If it does, it indicates a bug. Display a generic error to the user (do not expose stack traces) and log the full error to a monitoring service. Do not try to "handle" programming errors in the sense of displaying a friendly message and continuing — the system state is unknown.

**CS lens — the two classes of failure:**

Every error is either an **expected domain error** (password wrong, input invalid, file not found, resource temporarily unavailable) or an **unexpected programming error** (null dereference, type mismatch, violated invariant). The handling strategy is opposite: domain errors are caught and handled close to where they occur; programming errors are propagated to a centralized handler that logs the full context.

**SE lens — don't swallow errors silently:**

`catch (error) {}` — an empty catch block — is one of the most dangerous patterns in programming. It hides the error completely. The program continues as if nothing went wrong, likely with corrupted state. Future bugs appear far from their cause. If you catch an error you cannot handle, re-throw it. If you want to suppress a genuinely ignorable error, document why it is ignorable.

**What breaks without this:**

An application that catches all errors the same way will either silently swallow programming bugs (empty catch) or show users cryptic technical messages about type mismatches (catching too broadly). Neither is acceptable. The classification — expected vs unexpected, recoverable vs unrecoverable — determines the correct response.

---

### SAVE AND TRY

```js
function safeParseInt(str) {
  const result = parseInt(str, 10);
  if (isNaN(result)) {
    throw new Error(`"${str}" is not a valid integer`);
  }
  return result;
}

function processAges(inputs) {
  const results = [];
  for (const input of inputs) {
    try {
      results.push(safeParseInt(input));
    } catch (error) {
      console.log("Skipping invalid input:", input, "—", error.message);
    }
  }
  return results;
}

const ages = processAges(["25", "thirty", "42", "", "18"]);
console.log("Valid ages:", ages);   // → [25, 42, 18]
```

`parseInt(str, 10)` — the built-in JavaScript function that converts a string to an integer. The second argument `10` is the **radix** — the numeric base to use. Without it, `parseInt("010")` might return `8` (treating the `0` prefix as octal) in some engines. Always pass the radix. Returns `NaN` (Not a Number) if the string cannot be converted.

`isNaN(value)` — returns `true` if `value` is `NaN`. Unlike `value === NaN` (which is always `false` because NaN is not equal to itself — a quirk of IEEE 754 arithmetic), `isNaN` correctly detects `NaN`.

Expected: the strings `"thirty"` and `""` produce error messages, the valid numbers are returned.

**Change something:** Move the `try/catch` outside the loop so it wraps the entire `for` loop. Call `processAges(["25", "thirty", "42"])`. Expected: stops after `"thirty"` — `42` is never processed because the `catch` is outside the loop, and catching once exits the loop. The lesson: where you place the try/catch determines the recovery scope.

---

## Connect the Pieces

**What you built:** Exception propagation mechanics, custom error classes, `finally` for resource cleanup, and the recoverable/unrecoverable distinction.

**How it connects to LAB-001 and LAB-008:** Exception propagation is call-stack unwinding. Each frame is popped without finishing its code, just as recursion unwinds by returning. The difference: returns carry a value upward; exceptions carry an error object upward, skipping frames until a `catch` intercepts.

**How it connects to LAB-007 (Closures):** Error handling callbacks — the function passed to `.catch()` on a Promise — close over the variables of their surrounding context. You will see this clearly in LAB-011 (Async), where the interplay of closures and error handling defines how async code fails gracefully.

**How it connects forward:**

- **LAB-010 (Modules):** When code in one module throws, the exception propagates across module boundaries. Modules do not change propagation mechanics.
- **LAB-011 (Async):** Promise rejection is the async equivalent of a synchronous throw. `promise.catch(handler)` is the async equivalent of `try/catch`. Unhandled promise rejections are the async equivalent of unhandled exceptions.
- **LAB-057 (Fail Fast):** The `processUserInput` function above validates preconditions at entry and throws immediately — this is the fail-fast principle. You will study it formally and apply it systematically.
- **LAB-059 (Refactoring):** Guard clauses — `if (invalid) throw new Error(...)` at the top of a function — replace deeply nested `if/else` with a flat, readable structure.

**The real-world connection:**

Every production system has error handling at three levels: the function level (`try/catch` close to the source), the service level (a global handler that catches unhandled errors, logs them to a monitoring service like Sentry, and returns a 500 response instead of crashing), and the infrastructure level (a load balancer that detects crashed instances and routes traffic away from them). This lab teaches the first level. The second level uses the same mechanics — one big `try/catch` wrapping the entire request handler.

---

## What Breaks Without This

**Concrete failure — swallowed error causes silent data corruption:**

```js
function divide(a, b) {
  try {
    return a / b;   // JavaScript does NOT throw for division by zero — returns Infinity
  } catch (error) {
    return 0;   // this catch never fires for division — silently returns wrong result
  }
}

const total = divide(100, 0);     // returns Infinity, not an error
console.log("Tax:", total * 0.1); // → Infinity
console.log("Price:", total + 5); // → Infinity
```

JavaScript's `/` operator does not throw on division by zero — it returns `Infinity`. No catch fires. The error propagates silently as `Infinity` through every subsequent calculation, producing incorrect results throughout the system. `safeParseInt` above is the correct pattern: validate explicitly, throw explicitly when invalid, do not rely on the runtime to detect the problem.

---

## Definition of Done

Verify each item before moving to LAB-010.

- [ ] A function that throws without any `try/catch` — you can read the stack trace and identify the file, line, and call chain
- [ ] A custom `ValidationError` class exists with `name` and `fieldName` fields
- [ ] `error instanceof ValidationError` returns `true` for a `ValidationError` instance
- [ ] `error instanceof Error` also returns `true` for a `ValidationError` instance (inheritance)
- [ ] A `try/catch/finally` where `finally` logs a message regardless of whether an error occurred
- [ ] `processAges` correctly skips invalid entries and returns only the valid ones
- [ ] An empty catch block `catch (error) {}` — you can explain why this is dangerous

**Git commit:**

```
git add .
git commit -m "LAB-009: implement custom error classes, try/catch/finally cleanup, and recoverable vs unrecoverable error handling"
```

---

## Quick Check Answers

**1. What happens when a function 5 levels deep throws with no `catch` anywhere?**

The exception unwinds the call stack one frame at a time: level 5 is popped, then level 4, then 3, 2, 1. Each frame is abandoned without executing any remaining code. When the stack is empty with no `catch` found, the error is **unhandled**. In the browser, it appears as a red error in the console, and script execution stops. In Node.js, it triggers the `uncaughtException` event; if nothing handles that, the process exits with a non-zero exit code. The stack trace shows the original location of the throw, making it easier to find the source.

**2. Should expected errors and unexpected errors be handled the same way?**

No. Expected errors (user typed wrong password, file not found, network timeout) are part of normal operation — they should be caught close to where they occur and handled gracefully (show a helpful message, retry, use a fallback). Unexpected errors (null dereference, violated invariant, wrong argument type) indicate bugs — they should propagate to a centralized handler that logs the full context and presents a generic "something went wrong" message to the user. Treating all errors the same leads to either silently ignoring bugs (bad) or showing users cryptic technical messages (also bad).

**3. What does `finally` guarantee that `try/catch` alone does not?**

`finally` guarantees that its block runs regardless of how the `try` block exits: normal completion, early `return`, or an exception (whether caught or not). A `catch` block only runs when an exception occurs. If the `try` block returns normally, `catch` is skipped. `finally` is not skipped — ever. This makes it the correct place for cleanup code that must always run: closing connections, releasing locks, resetting state.

---

*Next: LAB-010 — Modules and Imports*
