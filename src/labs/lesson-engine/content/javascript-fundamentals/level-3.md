---
series: javascript-fundamentals
level: 3
title: Arrays
lang: javascript
---

# Arrays

An array stores any number of values under a single name, in order. Without arrays, tracking ten scores means ten separate variables — and you cannot write a loop over ten separate names. With an array, the values are one collection you can iterate, slice, and transform.

This lesson teaches how to create arrays, access elements by index, iterate over them, and use the three most important array methods: `map`, `filter`, and `reduce`.

## Creating Arrays

An array literal uses square brackets with values separated by commas:

```javascript
const scores = [88, 92, 75, 95, 83]
const names = ["Ada", "Grace", "Linus"]
const empty = []

console.log(scores)
console.log(names.length)
console.log(empty.length)
```

```text
[ 88, 92, 75, 95, 83 ]
3
0
```

`scores`, `names`, `empty` — variable names bound to arrays (from Level 0).
`.length` — a property on every array that returns the number of elements. `names.length` → `3`. `.length` is the number of elements, which is always one more than the last valid index.

## Indexing — Accessing One Element

Elements are accessed by **index** — a zero-based position:

```javascript
const medals = ["Gold", "Silver", "Bronze"]

console.log(medals[0])
console.log(medals[1])
console.log(medals[medals.length - 1])
```

```text
Gold
Silver
Bronze
```

`medals[0]` — the first element. Index `0` is always the first.
`medals[medals.length - 1]` — the last element. `medals.length` is `3`, so `medals[2]` is last.

Accessing an index that does not exist returns `undefined`, not an error. `medals[5]` → `undefined`.

**CS lens:** Arrays in JavaScript are dynamic — they can grow or shrink. Internally, the engine stores them as objects with numeric keys for small dense arrays, and as true contiguous memory blocks when the engine's optimizer detects the pattern. Access by index is O(1).

## Mutating Arrays

Unlike strings (which are immutable), arrays can be changed after creation:

```javascript
const temperatures = [22, 35, 18]

temperatures[1] = 30
temperatures.push(25)

console.log(temperatures)
console.log(temperatures.length)
```

```text
[ 22, 30, 18, 25 ]
4
```

`temperatures[1] = 30` — replaces the element at index 1. The array is modified in place.
`.push(value)` — appends `value` to the end of the array. Returns the new length.

Note: `temperatures` is `const`, but we can still modify the array's contents. `const` means "this name always points to this array," not "this array's contents cannot change."

## Iterating with for...of

`for (const element of array)` — loops over every element in order:

```javascript
const scores = [88, 92, 75, 95, 83]
let total = 0

for (const score of scores) {
  total = total + score
}

const average = total / scores.length
console.log(`Average: ${average}`)
```

```text
Average: 86.6
```

`for (const score of scores)` — on each iteration, `score` is bound to the next element. `for...of` is the clean way to visit every element when you do not need the index.

`total = total + score` — accumulator pattern (from Python Fundamentals): starts at the identity value (`0` for addition), accumulates one element per iteration.

## map — Transform Every Element

`array.map(transformFn)` — returns a **new array** where each element is the result of calling `transformFn` with the original element. The original array is unchanged.

```javascript
const celsius = [0, 20, 37, 100]
const fahrenheit = celsius.map(c => c * 9 / 5 + 32)

console.log(celsius)
console.log(fahrenheit)
```

```text
[ 0, 20, 37, 100 ]
[ 32, 68, 98.6, 212 ]
```

`celsius.map(c => c * 9 / 5 + 32)` — for each element `c` in `celsius`, compute `c * 9 / 5 + 32` and put the result in the new array. The arrow function `c => c * 9 / 5 + 32` is the transform (functions from Level 1).

**CS lens:** `map` implements the **map operation** from functional programming — applying a function to every element of a collection and collecting the results. It is one of three primitive operations that replace most manual loops: map (transform), filter (select), reduce (combine).

## filter — Select Elements

`array.filter(predicateFn)` — returns a new array containing only elements for which `predicateFn` returns `true`:

```javascript
const scores = [88, 92, 75, 95, 83, 61, 70]
const passing = scores.filter(score => score >= 70)
const highHonours = scores.filter(score => score >= 90)

console.log(passing)
console.log(highHonours)
```

```text
[ 88, 92, 75, 95, 83, 70 ]
[ 92, 95 ]
```

`score => score >= 70` — a **predicate function**: takes one value, returns `true` or `false`. `filter` keeps the elements where the predicate returns `true`.

`>=` — greater-than-or-equal operator. Returns `true` if the left operand is ≥ the right operand.

## reduce — Combine Into One Value

`array.reduce(combineFn, initialValue)` — combines all elements into a single value:

```javascript
const scores = [88, 92, 75, 95, 83]
const total = scores.reduce((accumulator, score) => accumulator + score, 0)
const maximum = scores.reduce((acc, score) => score > acc ? score : acc, -Infinity)

console.log(total)
console.log(maximum)
```

```text
433
95
```

`(accumulator, score) => accumulator + score` — the combiner function takes two arguments: the accumulated result so far, and the current element. It returns the new accumulated result.
`0` — the initial value of the accumulator. For sums, start at `0`. For products, start at `1`.

`score > acc ? score : acc` — the **ternary operator**: `condition ? valueIfTrue : valueIfFalse`. If `score > acc`, return `score`; otherwise return `acc`. This keeps the running maximum.

`-Infinity` — a special number value that is smaller than every other number. Starting the maximum accumulator at `-Infinity` guarantees the first real element always becomes the running maximum.

## Challenge: summarise_scores

Write a function `summariseScores(scores)` that takes an array of numbers and returns an object with three properties: `total`, `average`, and `passing` (count of scores ≥ 70).

`summariseScores([80, 60, 90, 70])` → `{ total: 300, average: 75, passing: 3 }`

Use `reduce` for `total`, divide by `scores.length` for `average`, and `filter` then `.length` for `passing`.

Return an object literal: `{ total: ..., average: ..., passing: ... }`. Object literals are covered fully in Level 4 — for now, `{ key: value }` creates an object with one property named `key` holding `value`.

```challenge
function summariseScores(scores) {
  // TODO
}
```

```test
assert summariseScores([80, 60, 90, 70]).total === 300
assert summariseScores([80, 60, 90, 70]).average === 75
assert summariseScores([80, 60, 90, 70]).passing === 3
assert summariseScores([100]).total === 100
assert summariseScores([50, 50]).passing === 0
```
