---
series: software-construction
level: 4
title: Error Handling
lang: javascript
---

# Error Handling

Errors are not edge cases. In production software, errors are a primary concern from the first line of code. Networks fail. Users provide invalid input. Files are missing. Third-party APIs go down. A program that is not designed to handle errors is a program that will fail silently, corrupt data, or crash at the worst possible moment.

Error handling is not about adding try/catch everywhere. It is about deciding, for each piece of code, what errors it can handle, what errors it should propagate, and what errors represent genuinely unrecoverable situations. Those are design decisions, not implementation details.

By the end of this lesson you will understand the difference between errors you handle and errors you propagate, know how to design functions that communicate failure clearly, and be able to build error handling strategies that do not bury bugs or terrify users.

## What an error is

An error is any situation where a function cannot fulfil its contract. There are three categories.

```text
INVALID INPUT: the caller violated a precondition
  → The caller passed a string where a number was required.
  → The caller passed an empty array to a function that requires at least one element.
  Whose fault: the caller's.
  How to handle: throw immediately with a clear message.

EXPECTED FAILURE: a valid operation that may not succeed
  → Fetching a URL that may return a 404.
  → Looking up a user that may not exist.
  → Parsing a string that may not be valid JSON.
  Whose fault: nobody's. This is normal operation.
  How to handle: return a value that communicates the failure (null, false, a Result).

UNEXPECTED ERROR: something that should not be possible
  → A database that was connected 10ms ago is now unreachable.
  → A file that was confirmed present is now missing.
  → An out-of-memory error.
  Whose fault: the environment.
  How to handle: propagate up to the boundary of the program.
                 Log it. Notify if appropriate. Do not silently discard.
```

## Invalid input — fail immediately and loudly

When a caller violates a precondition, the error should be immediate, specific, and loud. Silent failures — where a function receives bad input and produces wrong output without indicating anything went wrong — are the hardest bugs to find.

```javascript
function averageOf(numbers) {
  // Precondition: numbers must be a non-empty array
  if (!Array.isArray(numbers)) {
    throw new TypeError(`averageOf: expected an array, received ${typeof numbers}`)
  }
  if (numbers.length === 0) {
    throw new RangeError('averageOf: array must contain at least one number')
  }

  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}
```

```text
averageOf([1, 2, 3])   → 2       (valid input, succeeds)
averageOf([])          → throws  RangeError: averageOf: array must contain at least one number
averageOf('hello')     → throws  TypeError: averageOf: expected an array, received string
averageOf(null)        → throws  TypeError: averageOf: expected an array, received object

The error message names the function, states what was expected, and states what was received.
A developer reading this in a log can fix it without reading the source.
```

**CS lens:** Throwing on invalid input is an implementation of **design by contract** — the principle formulated by Bertrand Meyer in Eiffel. The contract states: if the caller meets the preconditions, the function guarantees the postconditions. If the caller violates the preconditions, the function owes nothing — but it should still signal the violation clearly rather than producing incorrect results. Defensive programming (checking all preconditions) and offensive programming (crashing loudly on violations) are not opposites. You check defensively; you crash offensively.

## Expected failures — return information, not exceptions

When an operation can legitimately fail as part of normal use, throwing an exception is the wrong tool. Exceptions are for exceptional situations. "The user was not found" is not exceptional — it is a valid outcome that callers must handle.

```javascript
// BAD: throws on a completely normal situation
function findUser(id) {
  const user = database.get(id)
  if (!user) throw new Error(`User ${id} not found`)
  return user
}
// Callers must wrap every call in try/catch just to check existence.
// This is noise, not signal.

// GOOD: returns a sentinel value that communicates the outcome
function findUser(id) {
  return database.get(id) ?? null   // null = "not found" — a valid, expected result
}
// Callers check: if (user === null) { ... }
// No exception needed. The contract is clear.
```

```javascript
// Pattern: returning a result object for richer failure information
function parseJSON(text) {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch {
    return { ok: false, error: 'Invalid JSON' }
  }
}
```

```text
parseJSON('{"name":"Alice"}')   → { ok: true,  value: { name: 'Alice' } }
parseJSON('not json at all')    → { ok: false, error: 'Invalid JSON' }
parseJSON('')                   → { ok: false, error: 'Invalid JSON' }

Callers:
  const result = parseJSON(rawInput)
  if (!result.ok) {
    showError(result.error)
    return
  }
  processData(result.value)

The caller always gets a result — success or failure.
No try/catch required. No unhandled exceptions.
```

## Error propagation — knowing when not to handle

Not every function should handle every error. A function deep in the call stack — say, a function that formats a date — should not decide what to show the user when formatting fails. That decision belongs higher up, closer to the user interface.

```javascript
// Low-level function: knows how to format, not what to do when it fails
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError(`formatDate: received an invalid Date: ${date}`)
  }
  return date.toISOString().slice(0, 10)
}

// Mid-level function: uses formatDate, handles the error at its level
function buildReportHeader(startDate, endDate) {
  try {
    return `Report: ${formatDate(startDate)} to ${formatDate(endDate)}`
  } catch (error) {
    return 'Report: (date unavailable)'
  }
}

// Top-level: where user-facing error messages are appropriate
async function generateReport(params) {
  try {
    const header = buildReportHeader(params.startDate, params.endDate)
    const body = await fetchReportData(params)
    return { header, body }
  } catch (error) {
    console.error('Report generation failed:', error)
    return { error: 'Could not generate report. Please try again.' }
  }
}
```

```text
Error handling levels:

  formatDate()         → throws TypeError (invalid input — fail fast)
  buildReportHeader()  → catches, returns fallback string (expected failure, handled locally)
  generateReport()     → catches, logs, returns user-friendly message (boundary — user-facing)

Rule: handle errors at the level that has enough context to handle them well.
  formatDate() has no context about what the user sees — it throws.
  generateReport() does — it returns a user-friendly message.
```

**SE lens:** The most common error-handling failure in production codebases is **swallowing errors** — catching an exception and doing nothing, or logging it and continuing as if nothing happened. `catch(e) {}` is how bugs disappear into the void and resurface weeks later as data corruption. Every catch block should do at least one of: handle the error (retry, return fallback), log the error (record that it happened), or re-throw the error (let a higher level handle it). Silently swallowing is never the right answer.

**Common mistakes:**
- Catching `Error` at the wrong level — catching database errors inside a validation function forces that function to know about databases. Let database errors propagate to the level that manages database connections.
- Throwing strings instead of Error objects — `throw 'something went wrong'` loses the stack trace. Always `throw new Error('...')` or a subclass.
- Using error codes instead of exceptions (in JavaScript) — error codes require callers to check every return value. Missed checks mean silent failures. Use exceptions for exceptional situations and return-values for expected failures.

**Debug tip:** When tracking down where an error originated, the stack trace in `error.stack` shows every function call between where the error was thrown and where it was caught. If you are catching and re-throwing, always preserve the original: `throw new Error('context', { cause: originalError })`. The `cause` property lets you trace the chain of errors back to the root.

## Challenge: error_strategy

Design the error handling for a password reset system.

```challenge
// For each function, decide: should it throw, return null, or return a result object?
// Fill in 'throw', 'null', or 'result' and explain why.
const errorStrategy = {
  // findUserByEmail(email): looks up a user — email might not be registered
  findUserByEmail_returns: '',     // 'throw', 'null', or 'result'
  findUserByEmail_why: '',

  // generateResetToken(userId): creates a secure token — userId must be a valid number
  generateResetToken_returns: '',
  generateResetToken_why: '',

  // sendResetEmail(email, token): sends an email — network might be down
  sendResetEmail_returns: '',
  sendResetEmail_why: '',
}
```

```test
const strategy = errorStrategy
assert strategy.findUserByEmail_returns !== '' && strategy.findUserByEmail_why !== ''
assert strategy.generateResetToken_returns !== '' && strategy.generateResetToken_why !== ''
assert strategy.sendResetEmail_returns !== '' && strategy.sendResetEmail_why !== ''
assert strategy.findUserByEmail_returns === 'null' || strategy.findUserByEmail_returns === 'result'
assert strategy.generateResetToken_returns === 'throw'
assert strategy.sendResetEmail_returns === 'result' || strategy.sendResetEmail_returns === 'throw'
```
