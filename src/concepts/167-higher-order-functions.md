---
concept: 167-higher-order-functions
name: Higher-Order Functions
---

## Definition

A higher-order function is a function that either accepts another
function as an argument, returns a function, or both — building generic,
reusable logic that's parameterized by BEHAVIOR (what to do), not just by
data.

## Problem

Writing a separate, near-identical function for every slightly different
operation (a function that doubles every array element, another that
squares every element) duplicates the shared "loop over every element"
logic each time. A higher-order function like `map` factors out the
shared looping logic ONCE, and accepts the actual per-element operation as
a parameter — the caller supplies the behavior, not the (already-written)
mechanism.

## Execution

A `map` function loops over an array, applying a given function to each
element, and collects the results
↓
Calling it with a doubling function: the LOOPING logic lives inside
`map`; the CALLER supplies just the specific transformation
↓
Result: every element doubled — `map` applied the caller's function to
every element, without `map` itself needing to know anything about
doubling specifically
↓
Calling the SAME `map` function again with a squaring function instead —
reused with a DIFFERENT behavior passed in — no duplicated looping code
needed

## Computer Science

This is a direct consequence of first-class functions (see First-Class
Functions) — since a function can be passed as an ordinary argument, a
higher-order function can be GENERIC over behavior the same way an
ordinary function is generic over data, which is what lets `map`,
`filter`, and `reduce` express an enormous variety of specific operations
from a small set of reusable, general-purpose building blocks.

Tags: Generic behavior, Map/filter/reduce, First-class functions, Code reuse

## Software Engineering

Built-in higher-order functions like `.map()`, `.filter()`, and
`.reduce()` are usually preferred over hand-written loops for these exact
operations, since they communicate INTENT directly (the reader immediately
knows "this transforms every element" from seeing `.map()`, rather than
having to read a loop's body to figure out what it's doing) and eliminate
common loop bugs (off-by-one indexing, forgetting to initialize an
accumulator).

Tags: Intent communication, Array methods, Loop bug avoidance

## Common Mistakes

- Writing a manual loop to do exactly what `.map()`, `.filter()`, or `.reduce()` already expresses directly — this obscures the code's intent behind boilerplate looping logic that a reader has to mentally trace through.
- Passing a function that has SIDE EFFECTS (see Side Effects) into something like `.map()`, which is meant for pure transformation — this can produce confusing, hard-to-predict behavior, since `.map()`'s contract implicitly assumes the transformation function doesn't also mutate external state.

## Exercises

- Rewrite a hand-written `for` loop that squares every number in an array using `.map()` instead, and explain what became more concise or clearer.
- Identify one higher-order function (`.filter()`, `.reduce()`, a custom one) you've used, and explain what "behavior" was passed in as a parameter versus what looping/mechanism logic was already built in.

## javascript

```javascript
// A hand-written higher-order function, demonstrating the SAME map logic
// reused with two completely different behaviors passed in.
function map(arr, fn) {
  const result = []
  for (const item of arr) result.push(fn(item))
  return result
}

console.log(map([1, 2, 3], x => x * 2))   // [ 2, 4, 6 ] -- doubling behavior passed in
console.log(map([1, 2, 3], x => x * x))   // [ 1, 4, 9 ] -- squaring behavior passed in -- SAME map function, reused
```
Walkthrough: `map`'s own looping logic never changes between the two
calls — only the function passed as `fn` differs (doubling vs. squaring),
demonstrating exactly what "higher-order" means: `map` is generic over
BEHAVIOR, the same way an ordinary function is generic over data values.

## python

```python
def hof_map(arr, fn):
    result = []
    for item in arr:
        result.append(fn(item))
    return result


print(hof_map([1, 2, 3], lambda x: x * 2))   # [2, 4, 6] -- doubling behavior passed in
print(hof_map([1, 2, 3], lambda x: x * x))   # [1, 4, 9] -- squaring behavior passed in -- SAME map function, reused
```
Walkthrough: identical generic-over-behavior mechanics as the JavaScript
version — the same `hof_map` function's looping logic is reused with two
different behaviors passed in as `fn`.
