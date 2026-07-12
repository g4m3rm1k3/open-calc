---
series: rust-fundamentals
level: 3
title: Error Handling with Result
lang: javascript
---

# Error Handling with Result

Most languages treat errors as exceptional — they use exceptions that jump out of the normal control flow, forcing callers to either catch them (often incorrectly) or let them propagate unpredictably. Rust takes the opposite approach: errors are values, and functions that can fail must say so in their return type. `Result<T, E>` is an enum with two variants — `Ok(T)` for success and `Err(E)` for failure — and every caller must explicitly handle both. By the end of this lesson you will understand why errors as values produce more reliable code, how the `?` operator propagates errors without obscuring them, and when to use each error-handling strategy.

## Result — Encoding Failure in the Type

In Rust, a function that can fail returns `Result<T, E>`. Callers cannot use the success value without first checking whether the result is `Ok` or `Err`.

```javascript
// In real Rust:
//   fn divide(a: f64, b: f64) -> Result<f64, String> {
//     if b == 0.0 { return Err("division by zero".to_string()) }
//     Ok(a / b)
//   }

// We simulate Result with tagged objects:
const Ok  = value => ({ ok: true,  value })
const Err = error => ({ ok: false, error })

function divide(a, b) {
  if (b === 0) return Err('division by zero')
  return Ok(a / b)
}

function matchResult(result) {
  if (result.ok) return `success: ${result.value}`
  return `error: ${result.error}`
}

console.log(matchResult(divide(10, 2)))
console.log(matchResult(divide(10, 0)))
console.log(matchResult(divide(-6, 3)))
```

```text
success: 5
error: division by zero
success: -2
```

Execution trace for `divide(10, 0)`:
```text
b === 0 → true
return Err('division by zero')   → { ok: false, error: 'division by zero' }
matchResult({ ok: false, ... })  → 'error: division by zero'
```

**CS lens:** `Result<T, E>` is an **algebraic data type** (a sum type from Level 2), parameterised by two type variables. The compiler tracks the `Result` type through the program; you cannot call `.value` on a `Result` without first unwrapping it. This is the type-theoretic solution to the problem exceptions create: with exceptions, any function can throw any type at any time. With `Result`, every failure mode is in the type signature, checkable by the compiler.

## The ? Operator — Propagating Errors Cleanly

The `?` operator in Rust is syntactic sugar that does this: if the Result is `Err`, return the error immediately; if it is `Ok`, unwrap and continue.

```javascript
// In real Rust:
//   fn parse_and_double(s: &str) -> Result<i32, String> {
//     let n: i32 = s.parse()?   // ? returns Err if parse fails
//     Ok(n * 2)
//   }

// We simulate ? with a helper:
function tryResult(result) {
  if (!result.ok) throw { isEarlyReturn: true, result }
  return result.value
}

function withErrorPropagation(fn) {
  try { return fn() }
  catch (e) {
    if (e && e.isEarlyReturn) return e.result
    throw e
  }
}

function parsePositiveInt(str) {
  const n = parseInt(str, 10)
  if (isNaN(n)) return Err(`not a number: '${str}'`)
  if (n < 0)    return Err(`must be positive: ${n}`)
  return Ok(n)
}

// Without ?: nest every check manually
function processV1(input) {
  const parsed = parsePositiveInt(input)
  if (!parsed.ok) return parsed   // check 1
  const doubled = parsed.value * 2
  const asStr = doubled.toString()
  if (asStr.length > 3) return Err('result too large')  // check 2
  return Ok(asStr)
}

// With ? (simulated): early return on any Err, reads like happy-path code
function processV2(input) {
  return withErrorPropagation(() => {
    const n = tryResult(parsePositiveInt(input))   // ? here
    const doubled = n * 2
    if (doubled.toString().length > 3) return Err('result too large')
    return Ok(doubled.toString())
  })
}

console.log('--- processV1 ---')
console.log(processV1('21'))
console.log(processV1('-5'))
console.log(processV1('abc'))

console.log('--- processV2 (same result) ---')
console.log(processV2('21'))
console.log(processV2('-5'))
console.log(processV2('abc'))
```

```text
--- processV1 ---
{ ok: true, value: '42' }
{ ok: false, error: 'must be positive: -5' }
{ ok: false, error: "not a number: 'abc'" }
--- processV2 (same result) ---
{ ok: true, value: '42' }
{ ok: false, error: 'must be positive: -5' }
{ ok: false, error: "not a number: 'abc'" }
```

**SE lens:** The `?` operator solves the two main readability problems with explicit error checking: (1) the happy path is buried in error-handling boilerplate, and (2) forgetting a check silently ignores the error. With `?`, the happy path reads linearly, and you cannot accidentally ignore an error — ignoring a `Result` in Rust produces a compiler warning; ignoring it repeatedly produces an error.

## unwrap, expect, and Explicit Handling

Rust gives three ways to get the value out of a Result:

```javascript
function demonstrateUnwrapping() {
  const Ok  = v => ({ ok: true,  value: v })
  const Err = e => ({ ok: false, error: e })

  // 1. unwrap() — panic if Err; only use when you KNOW it's Ok
  function unwrap(result) {
    if (!result.ok) throw new Error(`called unwrap() on Err: ${result.error}`)
    return result.value
  }

  // 2. expect(message) — panic with a descriptive message; better than unwrap for debugging
  function expect(result, message) {
    if (!result.ok) throw new Error(`${message}: ${result.error}`)
    return result.value
  }

  // 3. match — handle both cases explicitly
  function safeDivide(a, b) {
    const result = b === 0 ? Err('zero divisor') : Ok(a / b)
    if (result.ok) {
      return `answer: ${result.value}`
    } else {
      return `failed: ${result.error}`
    }
  }

  // unwrap when we know it's Ok (hardcoded valid input)
  const knownOk = Ok(42)
  console.log('unwrap:', unwrap(knownOk))

  // expect with a descriptive message
  const configResult = Ok({ port: 8080 })
  const config = expect(configResult, 'failed to load config')
  console.log('expect:', config.port)

  // Explicit match for uncertain results
  console.log(safeDivide(10, 2))
  console.log(safeDivide(10, 0))

  // unwrap on Err → panic
  try {
    unwrap(Err('something went wrong'))
  } catch (e) {
    console.log('panic:', e.message)
  }
}

demonstrateUnwrapping()
```

```text
unwrap: 42
expect: 8080
answer: 5
failed: zero divisor
panic: called unwrap() on Err: something went wrong
```

**SE lens:** In production Rust code: use `?` in functions that return `Result` (most library code), use `expect()` with a good message at program entry points where panic is acceptable (CLI tools, test setup), use explicit matching when you need to take different actions based on the specific error. `unwrap()` without `expect()` is a code smell — it panics with an unhelpful message. `unwrap()` with a comment explaining why it cannot fail is acceptable. Unwrapping in a library (code called by others) almost never acceptable.

## Chaining Results with map and and_then

```javascript
function demonstrateChaining() {
  const Ok  = v => ({ ok: true,  value: v })
  const Err = e => ({ ok: false, error: e })

  // map: transform Ok value, pass Err through unchanged
  function mapResult(result, transform) {
    if (!result.ok) return result
    return Ok(transform(result.value))
  }

  // andThen (flatMap): chain operations that each return Result
  function andThen(result, fn) {
    if (!result.ok) return result
    return fn(result.value)
  }

  function parseNumber(str)    { const n = Number(str); return isNaN(n) ? Err(`not a number: ${str}`) : Ok(n) }
  function requirePositive(n)  { return n > 0 ? Ok(n) : Err(`must be positive: ${n}`) }
  function squareRoot(n)       { return Ok(Math.sqrt(n)) }

  // Chain: parse → requirePositive → squareRoot
  function processInput(str) {
    return andThen(andThen(mapResult(parseNumber(str), x => x), requirePositive), squareRoot)
  }

  console.log(processInput('16'))
  console.log(processInput('-4'))
  console.log(processInput('hello'))
}

demonstrateChaining()
```

```text
{ ok: true, value: 4 }
{ ok: false, error: 'must be positive: -4' }
{ ok: false, error: 'not a number: hello' }
```

`andThen` is Rust's `and_then` method on `Result`. It short-circuits on the first `Err` — the later steps never run.

## Challenge: validator

Implement a chainable validator using the Result pattern.

`createValidator()` — returns an object with:
- `.validate(value, rules)` — `value` is any value; `rules` is an array of `{ check: (v) => boolean, message: string }` objects; applies each rule in order; returns `{ ok: true, value }` if all pass, or `{ ok: false, error: string }` with the first failing rule's message

```challenge
function createValidator() {
  return {
    validate(value, rules) {
      return { ok: true, value }
    },
  }
}
```

```test
const v = createValidator()
const rules = [
  { check: x => typeof x === 'number', message: 'must be a number' },
  { check: x => x > 0, message: 'must be positive' },
  { check: x => x < 100, message: 'must be less than 100' },
]
const r1 = v.validate(42, rules)
assert r1.ok === true
assert r1.value === 42
const r2 = v.validate(-5, rules)
assert r2.ok === false
assert r2.error === 'must be positive'
const r3 = v.validate(200, rules)
assert r3.ok === false
assert r3.error === 'must be less than 100'
const r4 = v.validate('hello', rules)
assert r4.ok === false
assert r4.error === 'must be a number'
```
