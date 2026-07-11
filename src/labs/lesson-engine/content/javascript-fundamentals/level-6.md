---
series: javascript-fundamentals
level: 6
title: Closures
lang: javascript
---

# Closures

A **closure** is a function that remembers the variables from the scope where it was created, even after that scope has finished executing. Without closures, a function can only see variables that exist at the moment it runs — there would be no way to create private state, factory functions, or callbacks that remember context.

Closures are not a special feature you opt into. Every function in JavaScript is a closure. This lesson makes that visible.

## A Function Remembers Its Birthplace

When a function is defined inside another function, it captures the variables of the outer function:

```javascript
function makeCounter() {
  let count = 0

  function increment() {
    count = count + 1
    return count
  }

  return increment
}

const counter = makeCounter()

console.log(counter())
console.log(counter())
console.log(counter())
```

```text
1
2
3
```

Execution trace:
```text
makeCounter() runs
  count is created, set to 0
  increment is defined — it captures count
  makeCounter returns increment
  makeCounter's stack frame is removed
    BUT count is not destroyed —
    increment still holds a reference to it

counter() → calls increment → count becomes 1 → returns 1
counter() → calls increment → count becomes 2 → returns 2
counter() → calls increment → count becomes 3 → returns 3
```

`count` lives beyond the function that created it because `increment` holds a reference to it. This is the closure: `increment` closed over `count`.

**CS lens:** The JavaScript engine does not store `count` on the stack (which disappears when `makeCounter` returns). It stores `count` in the **heap** — a long-lived memory region — and the closure holds a pointer to it. Garbage collection keeps the heap value alive as long as any closure references it.

## Each Call Creates Its Own Closed-Over Variables

Calling a function that returns a closure twice creates two independent closures:

```javascript
function makeAdder(addend) {
  return function(number) {
    return number + addend
  }
}

const addFive = makeAdder(5)
const addTen = makeAdder(10)

console.log(addFive(3))
console.log(addTen(3))
console.log(addFive(100))
```

```text
8
13
105
```

`makeAdder(5)` returns a function that closes over `addend = 5`. `makeAdder(10)` returns a different function that closes over `addend = 10`. They do not share state.

**Enable Debug and step through this.** Call `addFive(3)` and watch `addend` appear in the closure scope in the variables panel — it is `5`, from the call to `makeAdder(5)`.

## Closures for Private State

Because closed-over variables are not accessible from outside the function, closures can hide state:

```javascript
function makeBank(initialBalance) {
  let balance = initialBalance

  return {
    deposit(amount) {
      balance = balance + amount
      return balance
    },
    withdraw(amount) {
      if (amount > balance) return "Insufficient funds"
      balance = balance - amount
      return balance
    },
    getBalance() {
      return balance
    },
  }
}

const account = makeBank(100)

console.log(account.deposit(50))
console.log(account.withdraw(30))
console.log(account.getBalance())
```

```text
150
120
120
```

`balance` is defined inside `makeBank` and is not a property of the returned object — it cannot be read or changed directly from outside. The only way to affect `balance` is through `deposit`, `withdraw`, and `getBalance`. This is **encapsulation**: the implementation detail (`balance`) is hidden behind a controlled interface.

`{ deposit(amount) { ... } }` — an object with **method shorthand**: `methodName(params) { body }` is shorthand for `methodName: function(params) { body }`. Methods are functions stored as object properties.

**SE lens:** This pattern (a function that returns an object of methods sharing private state) is called the **module pattern**. Before JavaScript had classes (Level 7), this was the standard way to encapsulate state. It remains useful today when a class feels like overkill for a simple stateful thing.

## Closures in Callbacks

Closures appear naturally when you pass a function as an argument — the callback closes over the variables of the surrounding function:

```javascript
function makeMultiplier(factor) {
  return [1, 2, 3, 4, 5].map(number => number * factor)
}

console.log(makeMultiplier(3))
console.log(makeMultiplier(10))
```

```text
[ 3, 6, 9, 12, 15 ]
[ 10, 20, 30, 40, 50 ]
```

The arrow function `number => number * factor` is a closure — it references `factor` from the surrounding `makeMultiplier` scope. Each call to `makeMultiplier` creates a fresh closure with a different `factor`.

## Challenge: make_accumulator

Write a function `makeAccumulator(initialValue)` that returns a function. Each time the returned function is called with a number, it adds that number to a running total and returns the new total.

```
const acc = makeAccumulator(0)
acc(10)  → 10
acc(5)   → 15
acc(20)  → 35
```

The returned function takes one argument (the number to add). The running total must be stored in a closure — not passed as an argument.

```challenge
function makeAccumulator(initialValue) {
  // TODO: return a function
}
```

```test
const acc1 = makeAccumulator(0)
assert acc1(10) === 10
assert acc1(5) === 15
assert acc1(20) === 35
const acc2 = makeAccumulator(100)
assert acc2(50) === 150
```
