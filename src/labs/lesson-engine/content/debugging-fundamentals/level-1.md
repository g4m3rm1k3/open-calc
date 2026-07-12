---
series: debugging-fundamentals
level: 1
title: Reading Error Messages
lang: javascript
---

# Reading Error Messages

Error messages are not obstacles. They are the most precise information available about what went wrong. A developer who skims error messages and guesses at the cause will spend hours debugging what a developer who reads them carefully will fix in minutes. The skill of reading error messages correctly — extracting the error type, the location, the stack trace, and the chain of causes — is the most cost-effective debugging skill to develop.

Most errors in JavaScript belong to one of five error types, each with a specific meaning. Each is thrown in specific circumstances. Recognising the type immediately narrows the search space: a `TypeError` in a particular context means something specific happened, and knowing what it means tells you where to look.

By the end of this lesson you will be able to identify all five JavaScript error types, read a stack trace to find the origin of an error, use the `cause` property to trace error chains, and distinguish between errors that are your fault and errors that are the environment's fault.

## The five JavaScript error types

```text
ReferenceError — you used a name that does not exist in this scope.
  Signals: a typo in a variable name, using a variable before it is declared,
           accessing a variable outside its scope.
  Example: ReferenceError: userId is not defined
  → You typed `userId` but the variable is named `user_id`, or it was never declared.

TypeError — you used a value in a way that does not match its type.
  Signals: calling something that is not a function, accessing a property of null/undefined,
           using an operator on the wrong type.
  Example: TypeError: Cannot read properties of undefined (reading 'email')
  → `user` is undefined. You called `user.email` before confirming `user` exists.
  Example: TypeError: user.getProfile is not a function
  → `user.getProfile` is undefined (method does not exist), not a function.

SyntaxError — the code cannot be parsed — it is not valid JavaScript.
  Signals: missing bracket, unclosed string, invalid keyword usage.
  Example: SyntaxError: Unexpected token '}'
  → There is an extra or misplaced } somewhere.
  Note: SyntaxErrors are caught at parse time — the program never runs.

RangeError — a value is outside an acceptable range.
  Signals: Array.from(-1), recursion exceeding the stack, invalid string length.
  Example: RangeError: Maximum call stack size exceeded
  → Unbounded recursion — a function is calling itself without reaching a base case.
  Example: RangeError: Invalid array length
  → new Array(-1) — array length must be a non-negative integer.

URIError / EvalError — rare. URIError from malformed decodeURIComponent inputs.
  Not commonly encountered in practice.
```

## Reading a stack trace

The stack trace is the chain of function calls that were active when the error was thrown. Reading it correctly tells you exactly where to look.

```javascript
// This code produces an error:
function formatEmail(user) {
  return user.email.toLowerCase()   // throws if user.email is undefined
}

function buildWelcomeMessage(userId, db) {
  const user = db.find(u => u.id === userId)   // may return undefined if not found
  const email = formatEmail(user)               // passes undefined to formatEmail
  return `Welcome, ${email}!`
}

buildWelcomeMessage('unknown-id', [{ id: '1', email: 'alice@example.com' }])
```

```text
Error output:
  TypeError: Cannot read properties of undefined (reading 'email')
      at formatEmail (app.js:2:15)
      at buildWelcomeMessage (app.js:7:17)
      at <anonymous> (app.js:10:1)

HOW TO READ A STACK TRACE (bottom-up is chronological; top is where it threw):

  BOTTOM:  <anonymous> (app.js:10:1)
           → This is where execution started. buildWelcomeMessage was called on line 10.

  MIDDLE:  buildWelcomeMessage (app.js:7:17)
           → buildWelcomeMessage called formatEmail. Line 7, column 17.

  TOP:     formatEmail (app.js:2:15)
           → The error THREW HERE. Line 2 of formatEmail, column 15.
           → That is: user.email.toLowerCase()

  READING THE ERROR TYPE: TypeError — we used undefined as an object.
  READING THE ERROR MESSAGE: "reading 'email'" — we accessed .email on undefined.
  CONCLUSION: user is undefined when formatEmail is called.
  CAUSE: db.find() returned undefined (no user with that id).
  FIX: check the result of db.find() before calling formatEmail.
```

```text
The three things to extract from any error:

  1. ERROR TYPE:    TypeErrors are type mismatches. ReferenceErrors are name problems.
                    This narrows the search immediately.

  2. ERROR MESSAGE: "reading 'email'" tells you which property. "is not a function" tells
                    you which method. "is not defined" tells you which variable.

  3. STACK TRACE LINE: The TOP frame is where it threw. That is where the symptom is.
                       Work DOWNWARD to find the cause (what called what with wrong values).
```

**CS lens:** A stack trace is a literal representation of the call stack at the moment the error was thrown. Each line in the trace corresponds to one stack frame. The top frame is the function that was executing when `throw` was called. The frames below it are the functions that called each other, in order. The bottom frame is the entry point. Reading a stack trace is reading the call stack — which is exactly the data structure from the CS Foundations series.

## Error chains: the `cause` property

When one error causes another — a network error causes a database error which causes an API error — the chain of causes can be preserved using the `cause` property.

```javascript
// Without cause: the original error is lost
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    return await response.json()
  } catch (networkError) {
    throw new Error(`Failed to fetch user ${id}`)   // networkError is DISCARDED
    // Whoever catches this sees only "Failed to fetch user X" — no information about WHY
  }
}

// With cause: the full chain is preserved
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    return await response.json()
  } catch (networkError) {
    throw new Error(`Failed to fetch user ${id}`, { cause: networkError })
    // Whoever catches this can access: err.cause.message for the original network error
  }
}
```

```text
Accessing the chain:
  try {
    await fetchUser('abc')
  } catch (err) {
    console.error('Top-level error:', err.message)
    // → "Failed to fetch user abc"
    console.error('Caused by:', err.cause?.message)
    // → "fetch failed: ECONNREFUSED 127.0.0.1:3000" (the original network error)
  }

Without cause: "Failed to fetch user abc" — you do not know if the server is down,
  the URL is wrong, or the network is unavailable.
With cause: "fetch failed: ECONNREFUSED 127.0.0.1:3000" — the server port is closed.
```

**SE lens:** The `cause` property (added in ES2022) enables building error chains that preserve the full context of what went wrong, at every layer of abstraction. A database error at the data layer should be wrapped into a service-level error ("User lookup failed") which is wrapped into an HTTP error ("500 Internal Server Error") — with each layer preserving the original via `cause`. Logging `err.cause` at the boundary (the HTTP handler) gives the full chain in one log entry. Without it, you get "500 Internal Server Error" with no trace to the database connection problem that caused it.

**Common mistakes:**
- Looking only at the error message and ignoring the type — "null" in a TypeError means you accessed a property of `null`; in a RangeError it means the range was violated. The type changes the meaning of the message.
- Reading the stack trace top-to-bottom (chronological order) instead of recognising that the error is at the TOP — the top frame is where the throw happened, not where the cause is. Follow the chain downward to find where the wrong value came from.
- Catching and rethrowing without `cause` — every error boundary that wraps and rethrows without `cause` is discarding diagnostic information. Future-you (debugging at 2am) will regret it.

**Debug tip:** When a TypeError says "Cannot read properties of undefined (reading 'X')", the fix is never to guard against undefined with `user?.email` — the fix is to find out why `user` is undefined and fix that. The optional chaining just moves the symptom (returns undefined instead of throwing) without fixing the cause (the lookup that should have found a user but didn't).

## Challenge: read_the_error

Read this code and error, then answer the diagnostic questions.

```challenge
// Code that produces an error:
function getTopProduct(inventory) {
  const sorted = inventory.sort((a, b) => b.sales - a.sales)
  return sorted[0].name.toUpperCase()
}

// Error produced when called with an empty array:
// TypeError: Cannot read properties of undefined (reading 'name')
//     at getTopProduct (store.js:3:20)
//     at processReport (store.js:12:18)
//     at main (store.js:20:3)

const errorAnalysis = {
  // What type of error is this?
  errorType: '',         // 'TypeError', 'ReferenceError', 'RangeError', or 'SyntaxError'

  // Which line (in getTopProduct) threw the error?
  throwLine: 0,

  // Why is sorted[0] undefined?
  whySorted0Undefined: '',

  // What is the root cause?
  rootCause: '',

  // What is the correct fix? (describe in one sentence — do not fix .name)
  correctFix: '',
}
```

```test
const e = errorAnalysis
assert e.errorType === 'TypeError'
assert e.throwLine === 3
assert e.whySorted0Undefined.toLowerCase().includes('empty') || e.whySorted0Undefined.toLowerCase().includes('length')
assert e.rootCause.length > 15
assert e.correctFix.toLowerCase().includes('empty') || e.correctFix.toLowerCase().includes('length') || e.correctFix.toLowerCase().includes('guard')
```
