# Concept: JavaScript Arrow Functions

**What you'll understand by the end:** the `(params) => expression` shorthand for writing a function, and the one real behavioral difference it has from `function` beyond brevity.

**Prerequisites:** none.

## Setup

Any JavaScript runtime — a browser console or Node.js. No install needed.

## The Problem

Short, one-off functions (especially callbacks passed to another function) are extremely common in JavaScript. Writing `function (x) { return ...; }` for each one is more ceremony than the content usually warrants.

## The Isolated Example

```javascript
const square = (n) => n * n;

function squareLongForm(n) {
  return n * n;
}

console.log(square(5), squareLongForm(5));
```

**Real output:**
```
25 25
```

**What this proves:** both produce the identical result — `square` is not a different capability, only different syntax. The part before `=>` is the parameter list; the part after is the expression returned automatically, with no explicit `return` keyword needed for this single-expression form.

## Mechanical Walkthrough

- `(n) => n * n` — a single parameter `n`, and a body that's exactly one expression (`n * n`), implicitly returned.
- A version with a body in braces, `(n) => { return n * n; }`, is equivalent but requires the explicit `return` — the bare-expression form only omits it when the whole function is exactly one expression.
- Parentheses around a single parameter are optional in most contexts (`n => n * n` also works) but required for zero or multiple parameters (`() => 42`, `(a, b) => a + b`).

## CS Lens

This is **lambda syntax** — an anonymous, inline function expression, the same underlying idea as a mathematical lambda calculus abstraction, applied as everyday programming syntax for short, unnamed functions.

Also recognized in: Python's `lambda` (a similar, more restricted single-expression shorthand), C#'s `=>` expression-bodied members and lambda expressions, and Java's lambda expressions (`(x) -> x * x`) — the same shape, different punctuation, across most modern languages.

## SE Lens

Beyond brevity, arrow functions have one further real behavioral difference from `function`, not exercised in the example above but important once objects and classes are involved: they don't have their own `this` — they use whatever `this` was in the surrounding code, rather than being rebound based on how they're called. This matters specifically for callbacks used as object methods, and is a real, common source of confusion for anyone assuming arrow functions and `function` are interchangeable in every context.

## Connection

The near-universal callback style in modern JavaScript — `.then`, `.map`, `.filter`, `addEventListener` — is written as arrow functions by convention (see `javascript-promises-async.md` for a real callback usage).

## Try It Yourself

1. Write an arrow function with two parameters and a body needing more than one statement (braces required, explicit `return` required): e.g. one that logs a message and then returns a sum. Confirm the bare-expression shorthand genuinely can't express this without braces.
2. Inside a plain object literal with a method, compare a regular `function` method against an arrow function assigned as a property, both trying to read `this.value`. Confirm the arrow function version does *not* see the object's own `value` the way the regular function does — this is the `this`-binding difference named above, observed directly rather than just described.
3. Rewrite `square` as a named function expression instead of an arrow function (`const square = function(n) { return n * n; }`) and confirm it behaves identically for this simple case — proving the difference here really is just syntax, not capability.
