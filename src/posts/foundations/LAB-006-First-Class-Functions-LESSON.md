# LAB-006 — Functions as First-Class Values

**Series:** FOUNDATIONS — Part II: Programming Fundamentals
**Prerequisite Labs:** LAB-005 (Big-O)
**Time estimate:** 50–65 minutes

---

## What You Will Be Able to Do After This Lab

- Assign a function to a variable and call it through that variable
- Pass a function as an argument to another function
- Return a function from a function and call the returned function
- Store functions in arrays and objects
- Explain what "first-class" means and why it matters

---

## Prerequisites

You are assumed to know: what a function is, what a variable is, what an array is.

---

## The Hook — Functions Are Values Like Any Other

In most languages you learn first, numbers are values and functions are... procedures. Different things. You would never write `let x = 42 + someFunction`. It makes no sense to add a number and a function.

But run this in DevTools Console:

```javascript
const greet = function(name) {
  return "Hello, " + name;
};

console.log(typeof greet);         // → "function"
console.log(greet("Alice"));       // → "Hello, Alice"
console.log(greet);                // → ƒ (name) { return "Hello, " + name; }
```

**SAVE AND TRY:** `greet` is just a variable. Its value happens to be a function. You can log it, pass it around, store it. Functions are values.

Now try this:

```javascript
const sayHi = greet;  // assign the FUNCTION ITSELF to another variable
console.log(sayHi("Bob"));  // → "Hello, Bob"
```

`sayHi` and `greet` now point to the same function object. This is identical to:

```javascript
let a = 42;
let b = a;   // b and a both hold 42
```

Except the value is a function instead of a number.

---

## Concept Block 1 — First-Class Functions

**What it is:**
A language has **first-class functions** when functions are values that can be:
1. Assigned to variables
2. Passed as arguments to other functions
3. Returned from functions
4. Stored in data structures (arrays, objects)

JavaScript and Python both have first-class functions. Java (pre-8) did not.

**The problem without first-class functions:**
Without first-class functions, you cannot abstract over behavior. You can abstract over data (a function that doubles a number), but not over actions (a function that applies some operation to each item in a list). Every "apply this behavior to these items" pattern would require duplicated code with the behavior hard-coded.

**The solution:**
Pass the behavior as a function argument. Write the structure once; swap in different behaviors.

**Smallest possible example — run in DevTools Console:**

```javascript
// Three different behaviors
function double(x)  { return x * 2; }
function square(x)  { return x * x; }
function negate(x)  { return -x; }

// One structure — apply whatever behavior is passed in
function applyToFive(fn) {
  return fn(5);
}

console.log(applyToFive(double));   // → 10
console.log(applyToFive(square));   // → 25
console.log(applyToFive(negate));   // → -5
```

`applyToFive` does not know or care what `fn` does. Any function that accepts one number and returns a value works here. This is the fundamental building block of **higher-order functions** and **functional programming**.

**SAVE AND TRY:** Write your own function that takes a number and returns something. Pass it to `applyToFive`.

**Why it matters:**
Array methods like `map`, `filter`, `sort`, `reduce`, `forEach`, `find`, and `every` are ALL higher-order functions that take functions as arguments. Callbacks in event handlers, timers, and fetch are first-class functions. React component event props (`onClick`, `onChange`, `onSubmit`) are first-class functions. This is the mechanism under almost every abstraction in JavaScript.

---

## Concept Block 2 — Functions as Arguments (Callbacks)

**What it is:**
A **callback** is a function you pass to another function to be called later. "Call me back when you are done" — hence the name.

**Canonical example:**

```javascript
// setTimeout takes a callback — a function to call after the delay
setTimeout(function() {
  console.log("Called after 1 second");
}, 1000);

// addEventListener takes a callback — a function to call when the event fires
document.addEventListener("click", function(event) {
  console.log("Clicked at:", event.clientX, event.clientY);
});
```

You already used callbacks in LAB-002 (event loop) and LAB-003 (fetch). Now you know the name for what you were passing.

**Building your own higher-order function:**

```javascript
// A function that takes an array and a callback,
// applies the callback to each element, returns a new array
function transform(arr, callback) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i]));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];

const doubled  = transform(numbers, n => n * 2);
const squared  = transform(numbers, n => n * n);
const asString = transform(numbers, n => "item_" + n);

console.log(doubled);   // → [2, 4, 6, 8, 10]
console.log(squared);   // → [1, 4, 9, 16, 25]
console.log(asString);  // → ["item_1", "item_2", ...]
```

You just built `Array.prototype.map` from scratch. The built-in version works identically — you just call `numbers.map(n => n * 2)` instead.

**SAVE AND TRY:** Run this in the console. Then replace `transform(numbers, n => n * 2)` with `numbers.map(n => n * 2)`. Same result.

**Change something:** Add a function `const absolute = n => Math.abs(n - 3)`. Pass it to `transform`. What do you expect? Run it.

---

## Concept Block 3 — Arrow Functions vs Function Expressions vs Function Declarations

**What it is:**
Three syntaxes for creating functions in JavaScript. They behave almost identically for our current purposes — but the syntax differences matter for readability and context.

```javascript
// Function declaration — hoisted, can be called before it is defined
function add(a, b) {
  return a + b;
}

// Function expression — assigned to a variable, NOT hoisted
const subtract = function(a, b) {
  return a - b;
};

// Arrow function — shortest syntax, same behavior for most cases
const multiply = (a, b) => a * b;
```

**Arrow function shorthand rules:**

```javascript
// One parameter: parentheses optional
const double = x => x * 2;
const double2 = (x) => x * 2;  // same thing

// Zero or multiple parameters: parentheses required
const greet = () => "hello";
const add = (a, b) => a + b;

// Single expression: implicit return (no curly braces, no return keyword)
const square = x => x * x;

// Multiple statements: curly braces required, explicit return required
const clamp = (x, min, max) => {
  if (x < min) return min;
  if (x > max) return max;
  return x;
};
```

**SAVE AND TRY — all three syntaxes, same behavior:**

```javascript
function addA(a, b) { return a + b; }
const addB = function(a, b) { return a + b; };
const addC = (a, b) => a + b;

console.log(addA(3, 4));  // → 7
console.log(addB(3, 4));  // → 7
console.log(addC(3, 4));  // → 7

// All three work as callbacks too
const nums = [1, 2, 3];
console.log(nums.map(addA));  // → [1, 2, 3] (identity: addA(x) = x when called with one arg from map)
```

Wait — `nums.map(addA)` passes each element to `addA` as the first argument. What does `addA(1, undefined)` return? Run it.

**Watch for:**
Arrow functions are the most common syntax you will see in modern JavaScript. If you see `=>`, it is a function.

---

## Concept Block 4 — Returning Functions from Functions

**What it is:**
A function that returns another function. The returned function is a new value you can call later, store, or pass around.

**The canonical pattern — function factories:**

```javascript
// A factory that creates multiplier functions
function makeMultiplier(factor) {
  return function(n) {
    return n * factor;
  };
}

const double  = makeMultiplier(2);
const triple  = makeMultiplier(3);
const times10 = makeMultiplier(10);

console.log(double(5));   // → 10
console.log(triple(5));   // → 15
console.log(times10(5));  // → 50
```

`makeMultiplier(2)` returns a NEW function. That function "remembers" that `factor` is `2`. This is called a **closure** — which is the subject of LAB-007. For now, just observe that it works.

**SAVE AND TRY:**

```javascript
function makeGreeter(greeting) {
  return function(name) {
    return greeting + ", " + name + "!";
  };
}

const hello   = makeGreeter("Hello");
const bonjour = makeGreeter("Bonjour");
const ciao    = makeGreeter("Ciao");

console.log(hello("Alice"));    // → "Hello, Alice!"
console.log(bonjour("Bob"));    // → "Bonjour, Bob!"
console.log(ciao("Carol"));     // → "Ciao, Carol!"
```

Each call to `makeGreeter` returns a DIFFERENT function. `hello` and `bonjour` are independent.

**Change something:** Call `makeGreeter` without assigning the result: `makeGreeter("Hi")("Dave")`. What happens? Can you chain function calls like that?

---

## Concept Block 5 — Functions in Data Structures

**What it is:**
Functions can live in arrays and objects just like numbers, strings, or booleans. This enables lookup tables, command maps, and plugin systems.

**Functions in an array:**

```javascript
const operations = [
  n => n + 1,
  n => n * 2,
  n => n ** 2,
  n => Math.sqrt(n),
];

// Apply each operation to 4
operations.forEach(fn => {
  console.log(fn(4));
});
// → 5, 8, 16, 2
```

**Functions in an object — a dispatch table:**

```javascript
// Instead of a long if/else chain...
function calculate(op, a, b) {
  if (op === "add") return a + b;
  if (op === "sub") return a - b;
  if (op === "mul") return a * b;
  if (op === "div") return a / b;
  throw new Error("Unknown operation: " + op);
}

// ...use a dispatch table (object with function values)
const ops = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
  div: (a, b) => a / b,
};

function calculate2(op, a, b) {
  if (!ops[op]) throw new Error("Unknown operation: " + op);
  return ops[op](a, b);
}

console.log(calculate2("add", 10, 5));  // → 15
console.log(calculate2("mul", 3, 7));   // → 21
```

**SAVE AND TRY:** Run both `calculate` and `calculate2` with the same inputs. Same results. Now add a new operation `"pow": (a, b) => a ** b` to the `ops` object. You did not have to change `calculate2` at all — just the data.

**Why dispatch tables matter:**
You will see this pattern constantly. In the CAD/CAM project: a map from tool type to the function that draws it. In event systems: a map from event name to handler functions. In game engines: a map from key codes to action functions. Adding a new case means adding one entry to an object — not editing a long `if/else` or `switch`.

**You will see this again in:**
LAB-077 (Command Pattern) — a dispatch table with undo/redo. LAB-065 (Strategy Pattern) — swapping algorithms at runtime. LAB-015 (OOP Polymorphism) — method dispatch is the OOP version of this same idea.

---

## Concept Block 6 — Built-in Higher-Order Functions

**What it is:**
JavaScript arrays have built-in higher-order functions. These are the functions you will use most frequently. Every one takes a callback.

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map — transform each element, returns new array
const doubled = numbers.map(n => n * 2);
console.log(doubled);  // → [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter — keep elements where callback returns true
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);    // → [2, 4, 6, 8, 10]

// find — return the first element where callback returns true
const firstBig = numbers.find(n => n > 7);
console.log(firstBig); // → 8

// every — true if callback returns true for ALL elements
const allPositive = numbers.every(n => n > 0);
console.log(allPositive);  // → true

// some — true if callback returns true for ANY element
const hasNegative = numbers.some(n => n < 0);
console.log(hasNegative);  // → false

// reduce — fold the array into a single value
const sum = numbers.reduce((total, n) => total + n, 0);
console.log(sum);  // → 55

// sort — sort in place using a comparator function
const desc = [...numbers].sort((a, b) => b - a);
console.log(desc);  // → [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
```

**SAVE AND TRY:** Run each one. Then chain them:

```javascript
// Find the sum of squares of all even numbers
const result = numbers
  .filter(n => n % 2 === 0)    // [2, 4, 6, 8, 10]
  .map(n => n * n)             // [4, 16, 36, 64, 100]
  .reduce((sum, n) => sum + n, 0);  // 220

console.log(result);  // → 220
```

Each method returns an array (except `reduce` which returns the accumulated value), so you can chain them left to right. Read it like English: "filter evens, then map to squares, then sum them."

**Change something:** Change `filter(n => n % 2 === 0)` to `filter(n => n % 3 === 0)`. What do you expect? Run it.

---

## Challenge

**Task:** You are building a data pipeline for a product catalog. Implement a function called `pipeline` that takes an array of values and an array of functions, and applies the functions in sequence — the output of each function becomes the input of the next.

```javascript
// EXAMPLE USAGE:
const prices = [5, 10, 15, 20, 25, 30];

const result = pipeline(prices, [
  arr => arr.filter(p => p >= 10),            // remove prices below 10
  arr => arr.map(p => p * 1.1),              // apply 10% markup
  arr => arr.map(p => Math.round(p * 100) / 100),  // round to 2 decimal places
  arr => arr.sort((a, b) => b - a),          // sort descending
]);

console.log(result);
// → [33, 22, 16.5, 11]
```

Requirements:
- `pipeline(values, fns)` — takes any array and any array of functions
- Returns the result after applying all functions in order
- Works when pasted into DevTools console
- The original `prices` array must not be mutated

**Try it yourself before reading the solution.**

<details>
<summary>Solution</summary>

```javascript
function pipeline(values, fns) {
  return fns.reduce((current, fn) => fn(current), values);
}

// Test:
const prices = [5, 10, 15, 20, 25, 30];

const result = pipeline(prices, [
  arr => arr.filter(p => p >= 10),
  arr => arr.map(p => p * 1.1),
  arr => arr.map(p => Math.round(p * 100) / 100),
  arr => arr.sort((a, b) => b - a),
]);

console.log(result);    // → [33, 22, 16.5, 11]
console.log(prices);    // → [5, 10, 15, 20, 25, 30] — original unchanged
```

**Key insight:** `reduce` with a function as the accumulator update is the standard way to implement a pipeline. The initial value `values` is the "current data." Each function in `fns` receives the current data and returns the next data. The final result is what comes out of the last function.

**Why `[...arr]` is not needed inside filter/map?**
`filter` and `map` already return new arrays — they never modify the original. Only `sort` modifies in place, which is why the last stage uses the sorted version of the mapped array, not the original `prices`.

**The pattern you just built:**
This is the pipeline/compose pattern from functional programming. In larger systems this is called `pipe` (left-to-right) or `compose` (right-to-left). You will see it in libraries like `ramda`, `lodash/fp`, and `RxJS`. In the CAD/CAM project: a rendering pipeline where each stage transforms a list of geometry objects before the next stage processes them.

</details>

---

## Summary

| Concept | What It Means | Example |
|---|---|---|
| First-class function | A function is a value — can be stored, passed, returned | `const fn = () => 42` |
| Higher-order function | Takes a function as argument or returns a function | `map`, `filter`, `reduce` |
| Callback | A function passed to another to be called later | `setTimeout(fn, 1000)` |
| Function factory | A function that returns a configured function | `makeMultiplier(2)` |
| Dispatch table | Object/map where values are functions | `{ add: (a,b) => a+b }` |
| Arrow function | Short syntax for a function expression | `x => x * 2` |

**The single most important insight from this lab:**
Functions are values. Once you internalize this, every callback, every event handler, every `map`/`filter`/`reduce`, every React prop that starts with `on`, every middleware, every plugin API becomes the same pattern: someone stored or passed a function and called it later.

---

*Next: LAB-007 — Closures and Lexical Scope*
