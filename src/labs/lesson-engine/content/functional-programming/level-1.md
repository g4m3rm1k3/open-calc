---
series: functional-programming
level: 1
title: Higher-Order Functions
lang: javascript
---

# Higher-Order Functions

A higher-order function is a function that takes another function as an argument, returns a function as its result, or both. This is not a special capability reserved for advanced code — `array.map()`, `array.filter()`, `array.reduce()`, `setTimeout()`, and `array.sort()` are all higher-order functions, and you have used them. What functional programming adds is the understanding of why higher-order functions are powerful, and the discipline of using them to separate "what to do" from "how to do it."

By the end of this lesson you will understand what makes a function higher-order, why passing behaviour as data enables abstraction, how to write your own higher-order functions, and how higher-order functions eliminate duplication that loops and conditionals cannot.

## Functions are first-class values

Higher-order functions work because JavaScript treats functions as first-class values — functions can be stored in variables, passed as arguments, and returned from other functions.

```javascript
// A function stored in a variable:
const double = n => n * 2

// A function passed as an argument:
[1, 2, 3].map(double)   // → [2, 4, 6]

// A function returned from a function:
function makeMultiplier(factor) {
  return n => n * factor   // returns a NEW function
}
const triple = makeMultiplier(3)
triple(5)   // → 15
triple(10)  // → 30
```

```text
makeMultiplier(3) returns: n => n * 3
makeMultiplier(5) returns: n => n * 5

The returned function CAPTURES `factor` from the enclosing scope.
This is a closure (from CS Foundations) — the returned function carries `factor` with it.

First-class functions: you can do with a function anything you can do with a number.
Store it. Pass it. Return it. Put it in an array. Use it as an object property.
```

**CS lens:** The capability of passing functions as values — treating functions as data — is the defining feature of lambda calculus. In lambda calculus, every computation is expressed as function application, and every "higher-order" function is just a function that takes another lambda as input. JavaScript inherited this capability via Scheme (a Lisp dialect), which influenced Brendan Eich when designing the language in 1995. Every time you write `array.map(fn)`, you are applying a concept from 1930s mathematics.

## Map, filter, reduce: the three fundamental transforms

These three operations cover the vast majority of array transformations. Understanding what each does at the conceptual level (not just the syntax) is understanding the vocabulary of functional data processing.

```text
MAP — transform every element; same number of elements in, same number out.
  Question map answers: "What is this data after applying a transformation to each item?"
  fn: (element) → newElement
  Result: an array of the same length, with each element transformed.

FILTER — keep only elements matching a predicate; fewer or equal elements out.
  Question filter answers: "Which of these items satisfy a condition?"
  fn: (element) → boolean
  Result: an array of zero or more elements that returned true.

REDUCE — combine all elements into a single value.
  Question reduce answers: "What aggregate value do I get from this entire collection?"
  fn: (accumulator, element) → newAccumulator
  Result: a single value (number, string, object, array — anything).
```

```javascript
const orders = [
  { id: 'a', amount: 100, isPaid: true  },
  { id: 'b', amount: 200, isPaid: false },
  { id: 'c', amount:  50, isPaid: true  },
]

// MAP: extract just the amounts
const amounts = orders.map(order => order.amount)
// → [100, 200, 50]

// FILTER: keep only paid orders
const paidOrders = orders.filter(order => order.isPaid)
// → [{ id:'a', amount:100, isPaid:true }, { id:'c', amount:50, isPaid:true }]

// REDUCE: sum the amounts of paid orders
const paidTotal = orders
  .filter(order => order.isPaid)
  .reduce((total, order) => total + order.amount, 0)
// → 150
```

```text
Reduce trace for .reduce((total, order) => total + order.amount, 0):
  Initial accumulator: 0
  order = { id:'a', amount:100, isPaid:true }  → total = 0 + 100 = 100
  order = { id:'c', amount:50,  isPaid:true }  → total = 100 + 50 = 150
  (id:'b' was filtered out before reduce runs)
  Final accumulator: 150

Note: reduce can produce any type.
  .reduce((obj, order) => ({ ...obj, [order.id]: order.amount }), {})
  → { a: 100, c: 50 }   (an object, indexed by id)
```

## Writing your own higher-order functions

The power of higher-order functions is not limited to array methods. Any function that accepts a function as a parameter is higher-order, and you can write them to express your own abstractions.

```javascript
// Problem: retry logic is duplicated wherever network calls can fail
// Without higher-order function:
async function fetchUser(id) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { return await apiClient.get(`/users/${id}`) }
    catch (err) { if (attempt === 3) throw err }
  }
}

async function fetchOrder(id) {
  for (let attempt = 1; attempt <= 3; attempt++) {  // same retry logic, duplicated
    try { return await apiClient.get(`/orders/${id}`) }
    catch (err) { if (attempt === 3) throw err }
  }
}

// WITH a higher-order function: the retry logic is abstracted
function withRetry(fn, maxAttempts = 3) {
  return async (...args) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try { return await fn(...args) }
      catch (err) { if (attempt === maxAttempts) throw err }
    }
  }
}

const fetchUser  = withRetry(id => apiClient.get(`/users/${id}`))
const fetchOrder = withRetry(id => apiClient.get(`/orders/${id}`))
const fetchSlowEndpoint = withRetry(id => apiClient.get(`/slow/${id}`), 5)   // 5 retries
```

```text
withRetry(fn, maxAttempts) takes a function and returns a new function.
The returned function:
  — accepts any arguments (...args)
  — passes them to the original fn
  — retries on failure up to maxAttempts times
  — throws the last error if all attempts fail

The retry logic is written ONCE. fetchUser and fetchOrder share it without duplication.
Adding a new endpoint with retry: withRetry(fn) — one line. No copy-paste.

This is the separation of concerns higher-order functions enable:
  "What to fetch" (fetchUser logic) is separate from
  "how to handle failure" (withRetry logic).
```

**SE lens:** The higher-order function pattern is the functional equivalent of the **decorator pattern** from object-oriented design: wrapping existing behaviour with additional behaviour (logging, retry, caching, rate-limiting) without modifying the original. In JavaScript, `withRetry`, `withLogging`, `withCache`, and `withRateLimit` are all decorators implemented as higher-order functions. The difference from the OOP version: no class hierarchy, no interface, no verbose wrapping — just function composition.

**Common mistakes:**
- Calling the function in the argument instead of passing it — `arr.map(double())` calls double() immediately and passes its return value (a number); `arr.map(double)` passes the function. The parentheses are the difference.
- Using reduce for everything — reduce can express any transformation, but filter and map communicate intent more clearly. Use the most specific tool that fits: filter if you are filtering, map if you are transforming, reduce only if you are aggregating.
- Not providing the initial accumulator to reduce — `[].reduce((a, b) => a + b)` throws "Reduce of empty array with no initial value." Always provide the initial value: `[].reduce((a, b) => a + b, 0)` returns 0.

**Debug tip:** When a chained `.filter().map().reduce()` produces an unexpected result, break the chain into named intermediate variables: `const filtered = arr.filter(fn); const mapped = filtered.map(fn); console.log('filtered:', filtered, 'mapped:', mapped)`. The intermediate values show exactly where the transformation goes wrong.

## Challenge: compose_transforms

Use map, filter, and reduce to process a list of products. Do not use any loops.

```challenge
function summariseProducts(products) {
  // products: [{ name, price, category, inStock }]
  // Returns: { total: <sum of prices of in-stock electronics>, count: <how many> }
  // Only include products where category === 'electronics' AND inStock === true.
}
```

```test
const products = [
  { name: 'Laptop',  price: 999, category: 'electronics', inStock: true  },
  { name: 'Phone',   price: 699, category: 'electronics', inStock: false },
  { name: 'Tablet',  price: 499, category: 'electronics', inStock: true  },
  { name: 'Shirt',   price:  29, category: 'clothing',    inStock: true  },
  { name: 'Monitor', price: 399, category: 'electronics', inStock: true  },
]
const result = summariseProducts(products)
assert result.count === 3
assert result.total === 1897
const empty = summariseProducts([])
assert empty.count === 0 && empty.total === 0
const noneMatch = summariseProducts([{ name: 'A', price: 10, category: 'clothing', inStock: true }])
assert noneMatch.count === 0 && noneMatch.total === 0
```
