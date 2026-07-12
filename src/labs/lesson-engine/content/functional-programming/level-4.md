---
series: functional-programming
level: 4
title: Handling Absence and Failure Functionally
lang: javascript
---

# Handling Absence and Failure Functionally

Every program must deal with values that may or may not be present, and operations that may or may not succeed. In imperative code, this is handled with null checks and try/catch. In functional code, absence and failure are values — they are wrapped in containers that carry the context of "present/absent" or "success/failure," and passed through pipelines like any other value.

The two containers you will learn are **Maybe** (wrapping absence) and **Result** (wrapping failure). Neither is a language feature — they are patterns that enforce, through their interface, that code never accidentally uses an absent value or ignores a failure. They are the functional alternative to defensive null-checking and scattered try/catch.

By the end of this lesson you will understand what a Maybe is and how it propagates absence through a pipeline, what a Result is and how it carries error information without throwing, and when to use each.

## The null problem: absence without context

`null` and `undefined` represent the absence of a value — but they provide no way to distinguish "this value does not exist" from "this value failed to load" from "this value was not provided." They also propagate silently until a function tries to use them, producing a TypeError far from the original absence.

```text
The null cascade problem:
  function getUserCity(userId) {
    const user    = findUser(userId)        // may return null
    const address = user.address            // TypeError if user is null
    return address.city                     // TypeError if address is null
  }

To fix, every access must be guarded:
  function getUserCity(userId) {
    const user    = findUser(userId)
    if (!user)    return null
    const address = user.address
    if (!address) return null
    return address.city
  }

The guarded version is correct but noisy — half the code is null checks.
For a 5-level deep chain, every level needs a guard.
The functional alternative: use Maybe to propagate absence automatically.
```

## Maybe: a container for values that might not exist

A Maybe is a container that holds either a value (Just) or nothing (Nothing). Operating on a Nothing produces another Nothing — the absence propagates without explicit null checks.

```javascript
class Maybe {
  constructor(value) {
    this._value = value
  }

  static of(value) {
    return new Maybe(value)
  }

  isNothing() {
    return this._value === null || this._value === undefined
  }

  // map: if Just, apply fn to value and wrap result; if Nothing, return Nothing
  map(fn) {
    if (this.isNothing()) return this   // propagate Nothing
    return Maybe.of(fn(this._value))
  }

  // getOrElse: extract value, or return the default if Nothing
  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this._value
  }
}
```

```javascript
// Using Maybe to handle the null cascade:
function getUserCity(userId) {
  return Maybe.of(findUser(userId))               // wrap: Just(user) or Nothing
    .map(user => user.address)                    // if Nothing, stays Nothing
    .map(address => address.city)                 // if Nothing, stays Nothing
    .getOrElse('Unknown city')                    // extract or default
}
```

```text
getUserCity('existing-user') trace:
  Maybe.of({ name: 'Alice', address: { city: 'NYC' } })
  .map(user => user.address)
    → Maybe.of({ city: 'NYC' })
  .map(address => address.city)
    → Maybe.of('NYC')
  .getOrElse('Unknown city')
    → 'NYC'

getUserCity('missing-user') trace:
  Maybe.of(null)               → Nothing
  .map(user => user.address)   → Nothing (fn never called)
  .map(address => address.city)→ Nothing (fn never called)
  .getOrElse('Unknown city')   → 'Unknown city'

No null checks. No TypeError. Nothing propagates through the chain silently.
The getOrElse at the end handles the Nothing case in one place.
```

**CS lens:** Maybe is an example of a **monad** — a design pattern from category theory that wraps values in a context (presence/absence, success/failure, asynchrony) and defines how functions are applied within that context. `Promise` is a monad (the context is asynchrony — a value that will exist in the future). `Maybe` is a monad (the context is optionality). The defining operation of a monad is `flatMap` (also called `bind` or `chain`) — applying a function that itself returns a wrapped value without double-wrapping. Understanding monads as "containers that define their own map and flatMap" unifies Promise, Maybe, Result, and many other patterns.

## Result: a container for operations that may fail

A Result wraps either a success value (Ok) or a failure value (Err). It is the functional alternative to try/catch — failures are values that carry context, not exceptions that disrupt control flow.

```javascript
class Result {
  constructor(ok, value, error) {
    this.ok    = ok
    this.value = value
    this.error = error
  }

  static Ok(value)    { return new Result(true, value, null) }
  static Err(error)   { return new Result(false, null, error) }

  // map: if Ok, apply fn to value; if Err, propagate Err unchanged
  map(fn) {
    if (!this.ok) return this   // propagate Err
    try {
      return Result.Ok(fn(this.value))
    } catch (err) {
      return Result.Err(err.message)
    }
  }

  // getOrThrow: extract value, or throw the error
  getOrThrow() {
    if (!this.ok) throw new Error(this.error)
    return this.value
  }
}
```

```javascript
// Using Result for a parsing pipeline:
function parseAge(input) {
  if (typeof input !== 'string') return Result.Err('input must be a string')
  const n = parseInt(input, 10)
  if (isNaN(n))   return Result.Err(`"${input}" is not a number`)
  if (n < 0)      return Result.Err('age cannot be negative')
  if (n > 150)    return Result.Err('age is implausibly large')
  return Result.Ok(n)
}

function validateAge(result) {
  return result.map(age => {
    if (age < 18) throw new Error('must be 18 or older')
    return age
  })
}
```

```text
parseAge('25') → Result.Ok(25)
validateAge(Result.Ok(25)) → Result.Ok(25)   (25 >= 18)

parseAge('abc') → Result.Err('"abc" is not a number')
validateAge(Result.Err(...)) → Result.Err (unchanged — propagates through map)

parseAge('15') → Result.Ok(15)
validateAge(Result.Ok(15)) → Result.Err('must be 18 or older')   (map caught the throw)

Every failure carries its specific reason. Callers handle it:
  const ageResult = validateAge(parseAge(userInput))
  if (!ageResult.ok) {
    showError(ageResult.error)   // user sees the specific reason
    return
  }
  submitForm({ age: ageResult.value })
```

**SE lens:** The Result pattern is the functional equivalent of explicitly typed error returns in Go: `value, err := operation()`. In Go, ignoring the error requires explicitly discarding it. With Result, accessing the value without checking `ok` is a design choice — the container makes the possibility of failure visible in the type. TypeScript can enforce this: `Result<T, E>` where accessing `.value` requires checking `.ok` first. The pattern eliminates the two most common error-handling bugs: silent swallowing (the `.map` chain propagates errors) and missing context (each failure carries its reason).

**Common mistakes:**
- Using Maybe when Result is appropriate — Maybe answers "is there a value?" and carries no reason for absence. Result answers "did this succeed?" and carries the reason for failure. When a failure can have many causes (parsing, validation, network), use Result. When absence is simply "not found" with no elaboration needed, Maybe is simpler.
- Nesting Results or Maybes — `Maybe.of(Maybe.of(value))` produces a double-wrapped container that is painful to work with. Use `flatMap` (or `chain`) when a mapped function itself returns a Maybe or Result — it prevents double-wrapping.
- Returning null inside a Maybe chain — if `fn(value)` in `.map(fn)` returns null, the result is `Maybe.of(null)` — a Just wrapping null, not a Nothing. Use `flatMap(fn)` when fn may return null, so the result is properly Nothing.

**Debug tip:** When a Maybe or Result chain produces an unexpected Nothing or Err, unwrap step by step: log the result after each `.map()` call. `const step1 = maybe.map(fn); console.log('step1:', step1)`. The first step that is Nothing/Err reveals where the value was lost or the error occurred.

## Challenge: result_pipeline

Implement a user registration pipeline using Result. Each step either succeeds (returning `Result.Ok`) or fails with a specific error (returning `Result.Err`).

```challenge
class Result {
  constructor(ok, value, error) { this.ok = ok; this.value = value; this.error = error }
  static Ok(value)  { return new Result(true,  value, null)  }
  static Err(error) { return new Result(false, null,  error) }
  map(fn) {
    if (!this.ok) return this
    try { return Result.Ok(fn(this.value)) } catch (e) { return Result.Err(e.message) }
  }
}

function validateEmail(email) {
  // Returns Result.Ok(email) if email contains '@', Result.Err('invalid email') otherwise
}

function validatePassword(password) {
  // Returns Result.Ok(password) if password.length >= 8, Result.Err('password too short') otherwise
}

function registerUser(email, password) {
  // Validate email, then validate password, then return Result.Ok({ email, password })
  // If either validation fails, return the Err
}
```

```test
const ok = registerUser('user@example.com', 'securepassword123')
assert ok.ok === true
assert ok.value.email === 'user@example.com'

const badEmail = registerUser('not-an-email', 'securepassword123')
assert badEmail.ok === false
assert badEmail.error === 'invalid email'

const shortPass = registerUser('user@example.com', 'short')
assert shortPass.ok === false
assert shortPass.error === 'password too short'

const both = registerUser('bad', 'pw')
assert both.ok === false   // first failure wins — email fails first
```
