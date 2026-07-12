---
series: functional-programming
level: 3
title: Currying and Partial Application
lang: javascript
---

# Currying and Partial Application

You have written functions that take multiple arguments. Currying transforms such a function into a sequence of single-argument functions. Partial application pre-fills some arguments of a function, returning a new function that takes the rest. Both techniques produce reusable, composable building blocks that are impossible to create with ordinary multi-argument functions.

These are not theoretical curiosities. Currying is what makes `filter(isEven)` and `map(double)` work as standalone functions that wait for the array — enabling point-free composition from the previous lesson. Partial application is how you configure behaviour without repetition, creating specialised functions from general ones.

By the end of this lesson you will understand what currying transforms, how to write curried functions, how partial application differs, and how to use both in practical code.

## Currying: one argument at a time

A curried function takes its arguments one at a time, returning a new function for each argument until all are provided.

```javascript
// Uncurried: takes both arguments at once
function add(a, b) {
  return a + b
}
add(2, 3)  // → 5. Must provide both arguments.

// Curried: takes one argument, returns a function that takes the next
function addCurried(a) {
  return function(b) {
    return a + b
  }
}

addCurried(2)      // → function(b) { return 2 + b }  — a new function with a=2 captured
addCurried(2)(3)   // → 5  — applying both arguments in sequence
```

```text
addCurried(2) returns: (b) => 2 + b

This returned function is a specialisation of add:
  const add2 = addCurried(2)   // a function that adds 2 to anything
  add2(3)  → 5
  add2(10) → 12
  add2(0)  → 2

Currying allows you to create specialised functions by partially applying a general function.
The general function: add(a, b)
The specialised function: add2 = addCurried(2) — always adds 2.
```

```javascript
// Arrow function curried syntax:
const add = a => b => a + b

const add2  = add(2)
const add10 = add(10)

[1, 2, 3].map(add2)   // → [3, 4, 5]
[1, 2, 3].map(add10)  // → [11, 12, 13]
```

**CS lens:** Currying is named after Haskell Curry (the mathematician, who popularised it — it was actually introduced by Moses Schönfinkel). In Haskell, ALL functions are curried by default: every function takes exactly one argument. Multi-argument functions in Haskell are syntactic sugar for curried functions. Haskell's type system tracks this precisely: `add :: Int -> Int -> Int` means "a function that takes an Int and returns a function from Int to Int." JavaScript requires explicit currying because it supports multi-argument functions natively.

## Partial application: pre-filling arguments

Partial application is simpler than currying: it fixes some (but not all) of a function's arguments, returning a new function for the rest.

```javascript
// A general function with multiple arguments:
function multiply(factor, number) {
  return factor * number
}

// Partial application: fix `factor`, return a function that takes `number`
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs)
}

const double = partial(multiply, 2)    // factor=2 is fixed
const triple = partial(multiply, 3)    // factor=3 is fixed

double(5)  // → 10
triple(5)  // → 15

[1, 2, 3, 4].map(double)  // → [2, 4, 6, 8]
[1, 2, 3, 4].map(triple)  // → [3, 6, 9, 12]
```

```text
Difference between currying and partial application:

  CURRYING: transforms a multi-argument function into nested single-argument functions.
    Every argument must be applied one at a time, in order.
    add(2)(3) — not add(2, 3) or add(_, 3).

  PARTIAL APPLICATION: pre-fills any subset of arguments, returning a new function.
    You choose which arguments to pre-fill.
    partial(log, 'DEBUG') pre-fills the first argument;
    the returned function still takes any remaining arguments.

  Partial application is more flexible.
  Currying is a more principled transformation — it is always unary functions.
```

```javascript
// Practical partial application: configuring loggers
function log(level, message, data = {}) {
  console.log(JSON.stringify({ level, message, ...data, ts: Date.now() }))
}

const debug = partial(log, 'DEBUG')
const error = partial(log, 'ERROR')

debug('Starting server', { port: 3000 })    // level='DEBUG' prefilled
error('Payment failed', { orderId: 'a' })   // level='ERROR' prefilled
```

## Currying for composition

The reason currying matters for composition is that it makes multi-argument functions composable by separating configuration from application.

```javascript
// Without currying: cannot use filter and map in a point-free pipeline
//   filter(fn, arr) — both arguments needed at once
//   pipe(filter(isEven), map(double)) — filter(isEven) returns undefined, not a function

// With currying: filter and map become configurable
const filter = predicate => array => array.filter(predicate)
const map    = transform => array => array.map(transform)
const reduce = (fn, init) => array => array.reduce(fn, init)

const isEven = n => n % 2 === 0
const double = n => n * 2
const sum    = (a, b) => a + b

// Now these are functions waiting for an array:
filter(isEven)         // returns: array => array.filter(isEven)
map(double)            // returns: array => array.map(double)
reduce(sum, 0)         // returns: array => array.reduce(sum, 0)

// And they compose cleanly:
const doubleEvenSum = pipe(
  filter(isEven),
  map(double),
  reduce(sum, 0)
)

doubleEvenSum([1, 2, 3, 4, 5, 6])  // → 24
```

```text
doubleEvenSum([1,2,3,4,5,6]) trace:

  filter(isEven)([1,2,3,4,5,6])  → [2, 4, 6]
  map(double)([2, 4, 6])          → [4, 8, 12]
  reduce(sum, 0)([4, 8, 12])      → 24

The pipeline reads: "filter evens, double them, sum the results."
Each step is a curried function waiting for the array.
pipe threads the array through each step.
```

**SE lens:** The `filter/map/reduce` curried pattern described above is the core of functional data processing libraries like Ramda. The key engineering value is **configuration-before-application**: the configuration (which predicate, which transform, what reduction) is expressed at definition time; the data arrives at call time. This separation means pipelines can be defined once and reused across many datasets, with no duplication of the logic — only the data changes.

**Common mistakes:**
- Confusing currying with default parameters — `function add(a, b = 0) {}` is not currying. Default parameters still take multiple arguments; currying returns new functions.
- Applying all arguments to a curried function at once — `addCurried(2, 3)` in the curried version above gives `addCurried(2)` (evaluating to a function, ignoring the `3`). Curried functions require sequential application: `addCurried(2)(3)`.
- Over-currying simple functions — `const x = a => b => c => a + b + c` is correct currying but painful to call: `x(1)(2)(3)`. For functions called with all arguments at once in normal usage, currying adds overhead without benefit. Curry when composability is the goal.

**Debug tip:** When a curried function returns a function instead of a value, you are missing one or more argument applications. Check the arity: count the `=>` arrows. `a => b => a + b` needs two applications: `fn(a)(b)`. Log the intermediate value — if it is a function, you need another `(arg)`.

## Challenge: curried_validator

Implement a curried validator. `validate(rules)(value)` takes an array of rule functions and returns a function that applies them to a value, returning `{ valid: true }` or `{ valid: false, rule: 'name' }`.

```challenge
// Rule functions have this shape: { name: string, check: value => boolean }
// validate(rules) returns a function waiting for the value.
// The returned function applies each rule in order.
// Returns { valid: false, rule: 'ruleName' } for the FIRST failing rule.
// Returns { valid: true } if all pass.

function validate(rules) {
  // returns a function: value => { valid, rule? }
}
```

```test
const required = { name: 'required', check: v => v !== null && v !== undefined && v !== '' }
const minLen5  = { name: 'minLen5',  check: v => typeof v === 'string' && v.length >= 5 }
const noSpaces = { name: 'noSpaces', check: v => typeof v === 'string' && !v.includes(' ') }

const validateUsername = validate([required, minLen5, noSpaces])

assert validateUsername('alice').valid === true
assert validateUsername('').valid === false && validateUsername('').rule === 'required'
assert validateUsername('ali').valid === false && validateUsername('ali').rule === 'minLen5'
assert validateUsername('alice bob').valid === false && validateUsername('alice bob').rule === 'noSpaces'
assert validateUsername('alicebob').valid === true
```
