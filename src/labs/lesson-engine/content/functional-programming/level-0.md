---
series: functional-programming
level: 0
title: What Functional Programming Is
lang: javascript
---

# What Functional Programming Is

Functional programming is a style of building programs by composing pure functions — functions that always return the same output for the same input and have no side effects. It is not a language feature or a framework. It is a set of constraints that, when applied, produce code that is easier to test, reason about, and compose into larger programs.

You have already written some functional code without naming it: `array.map()`, `array.filter()`, `array.reduce()`. These are higher-order functions — functions that take other functions as arguments. They are functional programming's most visible face in JavaScript. But functional programming is a complete approach to structuring logic, not just a set of array methods.

By the end of this lesson you will understand what makes a function "pure," why purity matters for testability and predictability, what the functional constraints are (immutability, no side effects, function composition), and how they differ from the imperative style you are already familiar with.

## Imperative vs functional: two models of computation

The imperative model says: "do this, then do that, then do this other thing." The program is a sequence of commands that modify state. The functional model says: "compute this from that." The program is a chain of transformations.

```javascript
// IMPERATIVE: a sequence of state mutations
function doubleEvens(numbers) {
  const result = []
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0) {
      result.push(numbers[i] * 2)
    }
  }
  return result
}
```

```javascript
// FUNCTIONAL: a chain of named transformations
function doubleEvens(numbers) {
  return numbers
    .filter(n => n % 2 === 0)   // keep only even numbers
    .map(n => n * 2)            // double each
}
```

```text
doubleEvens([1, 2, 3, 4, 5, 6]):

Imperative trace:
  i=0: 1 is odd → skip
  i=1: 2 is even → push 4
  i=2: 3 is odd → skip
  i=3: 4 is even → push 8
  i=4: 5 is odd → skip
  i=5: 6 is even → push 12
  result: [4, 8, 12]

Functional trace:
  .filter([1,2,3,4,5,6]) → [2, 4, 6]   (keep even)
  .map([2, 4, 6])         → [4, 8, 12]  (double each)
  result: [4, 8, 12]

Same output. The functional version names the steps: "filter, then map."
The imperative version describes the mechanism: "loop, check, push."
```

**CS lens:** Imperative programming derives from the **von Neumann model** of computation: a processor executing instructions that modify memory state. Functional programming derives from **lambda calculus**, a mathematical model of computation defined by Alonzo Church in the 1930s. In lambda calculus, computation is the reduction of function applications — there is no state, only expressions and their values. Every functional language (Haskell, Erlang, Clojure) is, at its core, lambda calculus with practical additions. JavaScript's functional capabilities are lambda calculus features: first-class functions, closures, higher-order functions.

## Pure functions: the foundation

A pure function has exactly two properties:

```text
PROPERTY 1 — SAME INPUT, SAME OUTPUT (deterministic):
  For any set of inputs, a pure function always returns the same output.
  It does not matter when it is called, how many times, or in what order.

  PURE: function add(a, b) { return a + b }
    add(2, 3) always returns 5.

  NOT PURE: function addWithTime(a) { return a + Date.now() }
    The output changes with every call — depends on the current time.

PROPERTY 2 — NO SIDE EFFECTS:
  A pure function does not modify anything outside its own scope.
  It does not: write to a file, modify a global variable, update a database,
               mutate a parameter, log to the console, or send a network request.

  PURE: function doubleAll(arr) { return arr.map(n => n * 2) }
    Returns a new array. arr is unchanged.

  NOT PURE: function doubleAllInPlace(arr) { for (let i=0; i<arr.length; i++) arr[i]*=2 }
    Mutates arr. The mutation is a side effect — it changes something outside the function.
```

```javascript
// Testing pure vs impure functions:

// Pure function — completely predictable
function taxedPrice(price, taxRate) {
  return Math.round(price * (1 + taxRate) * 100) / 100
}
// Test: taxedPrice(100, 0.1) is always 110. No setup needed. Never fails for timing reasons.

// Impure function — hard to test
let taxRate = 0.1
function taxedPriceGlobal(price) {
  return Math.round(price * (1 + taxRate) * 100) / 100
}
// Test: must set taxRate before every test. Test order matters. Tests interfere with each other.
```

**SE lens:** Purity is the property that makes unit testing trivial. A pure function test is: arrange inputs → call function → assert output. No mocking, no state setup, no database, no environment. The test is deterministic: it passes or fails for the same reason every time. This is the "trivially testable code" ideal from the testing lesson — and the reason functional programming produces highly testable codebases. Pure functions are the mechanism; testability is the consequence.

## Immutability: never modify, always copy

Immutability is the functional constraint that data, once created, is never changed. Instead of modifying data, pure functions create new data with the desired changes.

```javascript
// MUTABLE approach: modifying data in place
const user = { name: 'Alice', score: 100 }

function addPoints(user, points) {
  user.score += points   // MUTATES user — the original object is changed
  return user
}

addPoints(user, 50)
console.log(user.score)  // 150 — original was mutated

// IMMUTABLE approach: creating new data
function addPointsImmutable(user, points) {
  return { ...user, score: user.score + points }   // spread creates a copy, override score
}

const updated = addPointsImmutable(user, 50)
console.log(user.score)    // 100 — original unchanged
console.log(updated.score) // 150 — new object with the update
```

```text
Why immutability matters:
  PREDICTABLE: if addPoints() does not mutate user, every function receives
               the same user it was given. No function has to worry that another
               function changed user before it was called.

  SAFE TO SHARE: immutable data can be shared across functions, closures, and
                 threads without synchronisation — it cannot change out from under you.

  UNDO/HISTORY: keeping the old values means you can go back. React's state management
                and Redux work this way: every state is immutable; updates create new states.
                The old state is the "undo" step.

Spread operator for immutable updates:
  const original = { a: 1, b: 2, c: 3 }
  const updated  = { ...original, b: 99 }   // { a: 1, b: 99, c: 3 }
  original is unchanged. updated is a new object.

  const arr = [1, 2, 3]
  const withFour = [...arr, 4]              // [1, 2, 3, 4] — original unchanged
```

**Common mistakes:**
- Thinking `const` makes data immutable — `const` prevents reassigning the variable, not mutating the object. `const arr = [1, 2, 3]; arr.push(4)` works fine. Immutability in JavaScript is a discipline, not an enforcement (unless using Object.freeze() or TypeScript readonly).
- Creating unnecessary copies — immutability does not mean copying everything. Only copy the thing you are changing. `{ ...user, score: newScore }` copies only the changed field; the unchanged fields still reference the same values.
- Confusing immutability with inefficiency — copying a small object is microseconds. The cost of mutability bugs (shared mutable state, unexpected changes, hard-to-reproduce bugs) is hours or days.

**Debug tip:** When a variable's value changes unexpectedly, search for all places where the variable (or the object it references) is passed to a function. Add `console.log('before:', JSON.stringify(obj))` before each call and `console.log('after:', JSON.stringify(obj))` after. The function that changes the value between before and after is the culprit.

## Challenge: pure_or_not

Classify each function as pure or impure, and explain why.

```challenge
let counter = 0

function increment()        { counter++ }
function double(n)          { return n * 2 }
function randomGreeting(name) { return `Hello ${name}, roll: ${Math.random()}` }
function sumArray(arr)      { return arr.reduce((s, n) => s + n, 0) }
function pushToArray(arr, x) { arr.push(x); return arr }
function addToArray(arr, x) { return [...arr, x] }

const classification = {
  increment:     '',   // 'pure' or 'impure' — and one-sentence why
  increment_why: '',
  double:        '',
  double_why:    '',
  randomGreeting: '',
  randomGreeting_why: '',
  sumArray:      '',
  sumArray_why:  '',
  pushToArray:   '',
  pushToArray_why: '',
  addToArray:    '',
  addToArray_why: '',
}
```

```test
const c = classification
assert c.increment === 'impure'      && c.increment_why.length > 10
assert c.double === 'pure'           && c.double_why.length > 10
assert c.randomGreeting === 'impure' && c.randomGreeting_why.length > 10
assert c.sumArray === 'pure'         && c.sumArray_why.length > 10
assert c.pushToArray === 'impure'    && c.pushToArray_why.length > 10
assert c.addToArray === 'pure'       && c.addToArray_why.length > 10
```
