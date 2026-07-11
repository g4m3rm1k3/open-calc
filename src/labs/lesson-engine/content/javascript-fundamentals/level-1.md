---
series: javascript-fundamentals
level: 1
title: Functions
lang: javascript
---

# Functions

A function is a named, reusable block of code. Without functions, every program is a single sequence of steps — no repetition, no abstraction, no way to test one piece in isolation. With functions, you give a name to a task, define it once, and call it from anywhere.

This lesson teaches how to declare functions, how arguments flow in and return values flow out, and why functions are the primary unit of abstraction in JavaScript.

## Declaring a Function

`function name(parameters) { body }` — declares a function. The body runs only when the function is called.

```javascript
function greet(personName) {
  const message = "Hello, " + personName + "!"
  return message
}

const result = greet("Ada")
console.log(result)
console.log(greet("Grace"))
```

```text
Hello, Ada!
Hello, Grace!
```

Atoms in this example:
- `function` — keyword that begins a function declaration
- `personName` — **parameter**: a local variable that receives the caller's value. Exists only inside the function body.
- `return message` — sends `message` back to the caller. The function stops executing at `return`.
- `greet("Ada")` — a **function call**: the name of the function, followed by parentheses containing the **argument** (the actual value passed in). `"Ada"` is assigned to `personName`.

**Enable Debug and step through this.** Watch what happens when execution reaches `greet("Ada")`: the call stack gains a new frame, `personName` appears with value `"Ada"`, `message` is created, then `return` removes the frame and the value appears at the call site.

**CS lens:** A function call creates a new **stack frame** — a block of memory holding the local variables for that call. When the function returns, the frame is removed. The call stack is the data structure that tracks all active frames. This is why recursive functions can run out of memory: each call adds a frame before the previous one finishes.

## Parameters and Arguments

A function can take zero or more parameters. Each parameter becomes a local variable:

```javascript
function rectangle(width, height) {
  const area = width * height
  const perimeter = 2 * (width + height)
  return area
}

console.log(rectangle(8, 5))
console.log(rectangle(3, 3))
```

```text
40
9
```

`rectangle(8, 5)` — `width` receives `8`, `height` receives `5`. The arguments are assigned in position order.

`return area` — only `area` is returned. `perimeter` is computed but discarded. A function returns exactly one value. To return multiple values, wrap them in an object or array (covered in Level 3 and Level 4).

## Functions Without return

A function without a `return` statement (or with a bare `return;`) returns `undefined`:

```javascript
function printGreeting(personName) {
  console.log("Hello, " + personName + "!")
}

const result = printGreeting("Linus")
console.log(result)
```

```text
Hello, Linus!
undefined
```

`printGreeting` produces a side effect (printing) but returns no value. `result` is `undefined`. This is intentional: functions that exist for their side effects typically do not return anything meaningful.

**SE lens:** Distinguish between functions that **return a value** (pure computation) and functions that **produce a side effect** (printing, modifying state, making a network request). Functions that return a value are easier to test because you can check the return value. Functions with only side effects must be tested by checking what changed in the world.

## Arrow Functions

Arrow functions are a shorter syntax for declaring functions. They are especially common as arguments to other functions:

```javascript
const double = (number) => number * 2
const square = (number) => number * number
const greet = (personName) => `Hello, ${personName}!`

console.log(double(5))
console.log(square(4))
console.log(greet("Guido"))
```

```text
10
16
Hello, Guido!
```

`(parameters) => expression` — an arrow function with a single expression body. The expression is evaluated and returned automatically (no `return` keyword needed for single-expression bodies).

```javascript
const add = (a, b) => {
  const sum = a + b
  return sum
}

console.log(add(3, 4))
```

```text
7
```

`(parameters) => { body }` — when the body needs multiple statements, use curly braces and an explicit `return`. Arrow functions and `function` declarations are mostly interchangeable. The difference (`this` binding) is a topic for Level 7 (Classes).

## Default Parameters

A parameter can have a default value used when the caller does not pass an argument:

```javascript
function power(base, exponent = 2) {
  return Math.pow(base, exponent)
}

console.log(power(3))
console.log(power(3, 3))
console.log(power(2, 10))
```

```text
9
27
1024
```

`exponent = 2` — if the caller omits the second argument (or passes `undefined`), `exponent` is `2`. Otherwise it takes the caller's value.

`Math.pow(base, exponent)` — raises `base` to the power of `exponent`. `Math.pow(3, 2)` → `9`. `Math` is JavaScript's built-in math object; its methods are covered as needed.

## Challenge: clamp

Write a function `clamp(value, minimum, maximum)` that returns `value` clamped to the range `[minimum, maximum]`.

If `value` is less than `minimum`, return `minimum`. If `value` is greater than `maximum`, return `maximum`. Otherwise return `value` unchanged.

`clamp(5, 0, 10)` → `5`. `clamp(-3, 0, 10)` → `0`. `clamp(15, 0, 10)` → `10`.

Use `if` / `else if` / `else` — if a condition is true, execute the block; otherwise check the next condition. You were introduced to conditionals in Python; the JavaScript syntax is `if (condition) { ... } else if (condition) { ... } else { ... }`.

```challenge
function clamp(value, minimum, maximum) {
  // TODO
}
```

```test
assert clamp(5, 0, 10) === 5
assert clamp(-3, 0, 10) === 0
assert clamp(15, 0, 10) === 10
assert clamp(0, 0, 10) === 0
assert clamp(10, 0, 10) === 10
```
