---
concept: 169-pure-functions
name: Pure Functions
---

## Definition

A pure function always returns the same output for the same input, and
has no observable side effects (it doesn't modify anything outside itself
— no mutating arguments, no changing global state, no I/O) — its entire
behavior is fully captured by its inputs and its return value.

## Problem

Functions with side effects or that depend on external, changing state
are hard to reason about and test — calling the SAME function with the
SAME arguments might produce different results depending on when you call
it, or might silently affect other, seemingly-unrelated parts of the
program. Pure functions eliminate this unpredictability: given the same
input, they're 100% predictable and self-contained, every single time.

## Execution

An impure function that reads and mutates an external counter variable:
calling it TWICE in a row with the same argument returns DIFFERENT
results, since it depends on and mutates external state
↓
A pure function that just adds two numbers: calling it any number of
times, at any point, ALWAYS returns the same result — no dependency on or
effect on anything outside itself
↓
An impure function that mutates an array passed in as a side effect,
beyond just computing a return value
↓
A pure equivalent computes an answer without touching the input array at
all

## Computer Science

Purity is what makes memoization (see Memoization) sound — caching a
function's result by its input only works correctly if the SAME input
always produces the SAME output, which is only guaranteed for pure
functions; caching an impure function's result would return a stale
answer the moment external state changes.

Tags: Memoization, Referential transparency, Deterministic output

## Software Engineering

Pure functions are dramatically easier to test (no setup of external
state needed, no order-dependence between tests) and easier to reason
about in isolation (you never need to trace through the whole rest of the
program to understand what a pure function does) — this is why "keep as
much logic pure, push side effects to the edges" is a widely recommended
practice even in non-functional codebases.

Tags: Testability, Isolated reasoning, Side effects at the edges

## Common Mistakes

- Mutating an argument inside a function that's supposed to just "compute and return" something — this is a hidden side effect that can surprise callers who don't expect their input to change.
- Assuming a function is pure just because it LOOKS simple — a function that reads a global variable, the current time, or a random number is impure, even without any explicit `return`-side mutation, since its output isn't determined purely by its arguments.

## Exercises

- Trace through calling the impure counter-based function three times in a row in the example above — what does each call return, and why do they differ despite identical arguments?
- Rewrite a function you've written that mutates one of its arguments into a pure version that returns a new value instead — what specifically had to change?

## javascript

```javascript
// Impure: depends on and mutates external state -- same input, different output each time
let total = 0
function addToTotal(x) {
  total += x
  return total
}
console.log(addToTotal(5))   // 5
console.log(addToTotal(5))   // 10 -- SAME argument, DIFFERENT result, since it depends on external `total`

// Pure: same input always produces the same output, no external dependency or mutation
function add(a, b) { return a + b }
console.log(add(2, 3))   // 5
console.log(add(2, 3))   // 5 -- called again, identical arguments, IDENTICAL result, every time

// Impure: mutates its argument as a side effect
function addFirst(arr) {
  arr.push(0)
  return arr[0]
}
const original = [1, 2, 3]
addFirst(original)
console.log(original)   // [ 1, 2, 3, 0 ] -- the caller's array was mutated as a side effect

// Pure equivalent: computes an answer without touching the input at all
function firstOrZero(arr) { return arr.length > 0 ? arr[0] : 0 }
const original2 = [1, 2, 3]
firstOrZero(original2)
console.log(original2)   // [ 1, 2, 3 ] -- completely untouched
```
Walkthrough: `addToTotal(5)` returns a DIFFERENT result each time despite
identical arguments, since it depends on and mutates the external `total`
variable — it's impure. `add(2, 3)` returns the exact same result every
single time, with zero external dependency — it's pure. `addFirst`
mutates its input array as an unwanted side effect, while `firstOrZero`
computes the same kind of answer without touching `original2` at all.

## python

```python
# Impure: depends on and mutates external state -- same input, different output each time
total = 0
def add_to_total(x):
    global total
    total += x
    return total

print(add_to_total(5))   # 5
print(add_to_total(5))   # 10 -- SAME argument, DIFFERENT result, since it depends on external total

# Pure: same input always produces the same output, no external dependency or mutation
def add(a, b):
    return a + b

print(add(2, 3))   # 5
print(add(2, 3))   # 5 -- called again, identical arguments, IDENTICAL result, every time

# Impure: mutates its argument as a side effect
def add_first(arr):
    arr.append(0)
    return arr[0]

original = [1, 2, 3]
add_first(original)
print(original)   # [1, 2, 3, 0] -- the caller's list was mutated as a side effect

# Pure equivalent: computes an answer without touching the input at all
def first_or_zero(arr):
    return arr[0] if len(arr) > 0 else 0

original2 = [1, 2, 3]
first_or_zero(original2)
print(original2)   # [1, 2, 3] -- completely untouched
```
Walkthrough: identical pure-vs-impure contrast as the JavaScript version —
`add_to_total` depends on and mutates external state, `add` is fully
self-contained, `add_first` mutates its input as a side effect, and
`first_or_zero` computes the same kind of answer while leaving its input
untouched.
