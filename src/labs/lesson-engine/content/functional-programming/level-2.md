---
series: functional-programming
level: 2
title: Function Composition
lang: javascript
---

# Function Composition

If pure functions are the atoms of functional programming, composition is the chemistry — combining simple functions into complex ones by chaining the output of one into the input of the next. Composition is not a trick or an optimisation. It is the primary mechanism by which functional programs are built from small, reusable pieces.

You have already used composition via method chaining (`.filter().map().reduce()`). Explicit function composition is the generalisation of that idea: a way to combine any two functions into one new function, without arrays, without chaining, and with the composed function as a first-class value you can reuse.

By the end of this lesson you will understand what function composition is mathematically, how to implement it in JavaScript, why it promotes reuse, and how to use point-free style to write clean pipelines.

## What composition is

Mathematically, composing two functions `f` and `g` means: apply `g` first, then apply `f` to the result. Written as `f ∘ g`: `(f ∘ g)(x) = f(g(x))`.

```javascript
// Two simple, reusable functions:
const trim       = s => s.trim()
const upperCase  = s => s.toUpperCase()
const exclaim    = s => s + '!'

// Composing manually (nested calls):
const result = exclaim(upperCase(trim('  hello  ')))
// → 'HELLO!'

// Read the manual composition RIGHT TO LEFT: trim runs first, then upperCase, then exclaim.
// Nested calls obscure this order — the first applied function (trim) is innermost.
```

```javascript
// A compose function: applies functions right-to-left (mathematical convention)
function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x)
}

// compose(exclaim, upperCase, trim) creates a NEW function:
const shout = compose(exclaim, upperCase, trim)

shout('  hello  ')  // → 'HELLO!'
shout('  world  ')  // → 'WORLD!'
```

```text
compose(exclaim, upperCase, trim)(' hello ') trace:

  reduceRight starts from the rightmost function (trim):
    acc = ' hello '
    fn = trim    → acc = 'hello'
    fn = upperCase → acc = 'HELLO'
    fn = exclaim   → acc = 'HELLO!'
  Returns 'HELLO!'

shout is now a reusable function. Call it with any string.
It is equivalent to: s => exclaim(upperCase(trim(s)))
But it is named, composable, and not hard-coded to these specific inputs.
```

## Pipe: left-to-right composition

`compose` applies functions right-to-left (innermost first). `pipe` applies them left-to-right (top-down order, like reading a pipeline):

```javascript
// A pipe function: applies functions left-to-right (data-flow convention)
function pipe(...fns) {
  return (x) => fns.reduce((acc, fn) => fn(acc), x)
}

// Read pipe left-to-right: trim runs first, then upperCase, then exclaim
const shout = pipe(trim, upperCase, exclaim)

shout('  hello  ')  // → 'HELLO!'
```

```text
Why pipe is often preferred over compose:
  pipe(trim, upperCase, exclaim) reads in execution order — left to right.
  compose(exclaim, upperCase, trim) reads backwards — innermost function last.

  For data pipelines that people will READ, pipe matches the reading direction.
  pipe is the choice for most JavaScript code.

Both produce identical results. They differ only in argument order.
```

**CS lens:** Function composition is the direct translation of mathematical function composition into code. In mathematics, `(f ∘ g)(x) = f(g(x))` is a standard operation. Category theory — a branch of mathematics that studies structure and composition — shows that any system where composition is associative and has an identity element forms a **category**. Functions under composition form a category. This is the mathematical foundation that makes functional programming provably correct in ways that imperative programming cannot be: composition laws guarantee that a composed function behaves exactly as its parts specify.

## Point-free style: functions without their arguments

**Point-free** (also called **tacit**) style defines functions by composing other functions, without mentioning the data they operate on. The "point" is the argument.

```javascript
// Pointed (with argument):
const doubleAll = numbers => numbers.map(n => n * 2)

// Point-free: defined as a composition, not applied to a specific argument:
const double   = n => n * 2
const doubleAll = numbers => numbers.map(double)   // map is the HOF; double is the transform

// More point-free:
const isEven  = n => n % 2 === 0
const double  = n => n * 2

const doubleEvens = pipe(
  numbers => numbers.filter(isEven),
  numbers => numbers.map(double)
)

// Fully point-free (using partial application, covered next level):
const doubleEvens = pipe(
  filter(isEven),   // returns a function waiting for the array
  map(double)       // returns a function waiting for the array
)
```

```text
Point-free style reads like a description of the transformation, not its mechanics:
  "filter by even, then double" — that is what doubleEvens means.

Naming the steps makes the code document itself:
  const totalRevenue = pipe(
    filter(isCompleted),
    map(getAmount),
    reduce(sum, 0)
  )
  Read: "filter completed orders, get each amount, sum them."
  No variable names. No loop variables. No intermediate state. Just the transformation.
```

**SE lens:** Point-free style is most valuable when the composition is the whole function — when the function's body is entirely describable as a pipeline of named operations. The risk is over-application: point-free code can become unreadable when the pipeline is long or the composed functions have non-obvious interactions. The rule: use point-free when it makes the intent clearer; use explicit arguments when they add clarity. Point-free is a tool, not an ideology.

**Common mistakes:**
- Composing functions with incompatible types — if `f` returns a number but `g` expects a string, `compose(g, f)` will fail at runtime. In JavaScript this is a runtime error, not a compile error. TypeScript's type system catches this statically.
- Writing point-free for everything, including simple cases — `const double = pipe(x => x * 2)` is worse than `const double = x => x * 2`. Use composition where it adds clarity.
- Confusing compose and pipe argument order — `compose(f, g)(x)` applies g first; `pipe(f, g)(x)` applies f first. Mixing them up produces reversed pipelines with no error.

**Debug tip:** When a composed pipeline produces the wrong result, convert it to explicit steps:
```javascript
const debug = pipe(
  x => { const r = trim(x); console.log('after trim:', r); return r },
  x => { const r = upperCase(x); console.log('after upper:', r); return r },
  exclaim
)
```
Each step logs its output. The step where the log shows the wrong value is the bug location.

## Challenge: build_pipeline

Build a text processing pipeline using `pipe` and named functions.

Given a list of raw user input strings (may have extra whitespace, mixed case, duplicates), produce a cleaned list: trimmed, lowercased, with empty strings removed, and duplicates removed. The output order should preserve the first occurrence of each unique string.

```challenge
function pipe(...fns) {
  return x => fns.reduce((acc, fn) => fn(acc), x)
}

// Define individual step functions, then compose with pipe:
function cleanInputs(rawStrings) {
  // rawStrings: string[]
  // Returns: string[] — trimmed, lowercased, no empty strings, no duplicates (first occurrence kept)
}
```

```test
const input = ['  Hello  ', 'world', 'HELLO', '', '  ', 'World', 'foo']
const result = cleanInputs(input)
assert Array.isArray(result)
assert result.includes('hello') && result.includes('world') && result.includes('foo')
assert !result.includes('') && !result.includes('  ')
assert result.filter(s => s === 'hello').length === 1
assert result.filter(s => s === 'world').length === 1
assert result.indexOf('hello') < result.indexOf('foo')
```
