---
series: javascript-fundamentals
level: 5
title: Loops & Iteration
lang: javascript
---

# Loops & Iteration

Loops are how programs repeat work. Without loops, processing ten items means writing the same code ten times — and processing an unknown number of items is impossible. JavaScript has four loop forms, each suited to a different situation.

This lesson teaches `for`, `while`, `for...of`, and `for...in`, explains when to use each, and shows the accumulator pattern that underlies most real-world iteration.

## for — Counted Repetition

`for (initialisation; condition; update)` — repeats the body a fixed number of times:

```javascript
for (let index = 0; index < 5; index++) {
  console.log(`Step ${index}`)
}
```

```text
Step 0
Step 1
Step 2
Step 3
Step 4
```

The three parts of a `for` loop:
- `let index = 0` — runs once before the loop starts. Creates the loop variable.
- `index < 5` — checked before each iteration. If `false`, the loop stops.
- `index++` — runs after each iteration. `index++` is shorthand for `index = index + 1`.

`let` is used (not `const`) because `index` changes on every iteration.

**CS lens:** The `(init; condition; update)` structure is the **loop invariant pattern**: the condition is a property that must hold to continue, and the update step brings the state closer to termination. Any `for` loop where the update step does not bring the condition closer to `false` is an infinite loop.

## while — Condition-Driven Repetition

`while (condition)` — repeats the body as long as `condition` is `true`. Use it when you do not know in advance how many iterations you need:

```javascript
let number = 1

while (number <= 1000) {
  number = number * 2
}

console.log(number)
```

```text
1024
```

`number` starts at `1` and doubles each iteration. The loop stops when `number` exceeds `1000`. The number of iterations depends on the starting value — you cannot predict it with a simple count.

Without the update (`number = number * 2`), `number` would stay `1` forever — an infinite loop.

## break and continue

`break` exits the loop immediately. `continue` skips to the next iteration:

```javascript
const numbers = [3, 7, 2, 9, 1, 8, 4, 6]
let firstEven = null

for (const number of numbers) {
  if (number % 2 === 0) {
    firstEven = number
    break
  }
}

console.log(`First even: ${firstEven}`)
```

```text
First even: 2
```

`number % 2 === 0` — `%` is the **remainder operator** (also called modulo). `9 % 2` → `1`. `8 % 2` → `0`. A number is even when the remainder after dividing by 2 is 0.

`===` — the **strict equality operator**. Returns `true` only when both value and type match. `2 === 2` → `true`. `"2" === 2` → `false`. Always prefer `===` over `==` in JavaScript; `==` performs type coercion and produces unexpected results.

`break` — when `number` is even, saves it and exits immediately. Without `break`, the loop would continue and `firstEven` would end up as the last even number.

## for...of — Iterating Arrays (revisited)

`for (const element of array)` — the cleanest way to visit every element when you do not need the index:

```javascript
const languages = ["Python", "JavaScript", "Rust", "Go"]
const lengths = []

for (const language of languages) {
  lengths.push(language.length)
}

console.log(lengths)
```

```text
[ 6, 10, 4, 2 ]
```

`language.length` — the length property of a string (from Level 0). `"Python".length` → `6`.
`.push(value)` — appends `value` to the `lengths` array (from Level 3).

This could also be written as `languages.map(lang => lang.length)`. The `for...of` loop is preferred when the body has multiple statements; `map` is preferred for single-expression transforms.

## for...in — Iterating Object Keys

`for (const key in object)` — iterates over the property names of an object:

```javascript
const config = {
  host: "localhost",
  port: 3000,
  debug: true,
}

for (const key in config) {
  console.log(`${key}: ${config[key]}`)
}
```

```text
host: localhost
port: 3000
debug: true
```

`for...in` gives you the keys (strings). `config[key]` accesses the value for that key using bracket notation (from Level 4).

**SE lens:** Prefer `Object.entries(object)` and `for...of` over `for...in` when you need both keys and values. `for...in` also iterates over inherited properties in some situations, which is almost never what you want. `Object.entries` only gives you own properties.

## The Accumulator Pattern with Arrays

A common loop task: build a new array from an existing one based on some condition. This is `filter` written as a loop:

```javascript
const temperatures = [15, 22, 8, 31, 19, 5, 28]
const warm = []

for (const temp of temperatures) {
  if (temp >= 20) {
    warm.push(temp)
  }
}

console.log(warm)
```

```text
[ 22, 31, 28 ]
```

`warm` starts as an empty array (the identity value for array accumulation). Each iteration decides whether to push. After the loop, `warm` holds only the elements that passed the condition.

This is exactly what `temperatures.filter(t => t >= 20)` does. The loop form is useful when the condition involves multiple steps or side effects.

## Challenge: fizz_buzz

Write a function `fizzBuzz(limit)` that returns an array of strings from `1` to `limit` (inclusive), where multiples of 3 are `"Fizz"`, multiples of 5 are `"Buzz"`, multiples of both are `"FizzBuzz"`, and all others are the number as a string.

`fizzBuzz(5)` → `["1", "2", "Fizz", "4", "Buzz"]`

Use a `for` loop from `1` to `limit`. Use `%` to test divisibility. `String(number)` converts a number to a string: `String(7)` → `"7"`.

Test multiples of 15 (both 3 and 5) before testing 3 and 5 individually, otherwise `"FizzBuzz"` cases will incorrectly match the earlier branch.

```challenge
function fizzBuzz(limit) {
  const result = []
  // TODO
  return result
}
```

```test
assert fizzBuzz(1)[0] === "1"
assert fizzBuzz(3)[2] === "Fizz"
assert fizzBuzz(5)[4] === "Buzz"
assert fizzBuzz(15)[14] === "FizzBuzz"
assert fizzBuzz(5).length === 5
```
