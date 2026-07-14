---
concept: 006-counted-iteration
name: Counted Iteration (for loop)
---

## Definition

Counted iteration repeats a block of code a specific number of times, tracked by
an explicit counter that increments (or decrements) each pass.

## Problem

Some tasks need to happen a known number of times, or need access to a position
(index) while repeating — printing numbers 1 through 10, processing every
character in a string by position. Writing that repetition out by hand, one copy
per repetition, doesn't scale past a handful of iterations.

## Computer Science

A counted loop is built from three parts evaluated in a fixed pattern: an
initializer (runs once), a condition (checked before every iteration), and an
update (runs after every iteration, before the condition is checked again). This
three-part shape is a direct, explicit encoding of the loop invariant — the
condition that must remain true for the loop to continue.

Tags: Loop invariant, Control flow, Iteration count

## Software Engineering

An off-by-one error — looping one time too many or too few — is one of the most
common bug categories in all of programming, almost always from a boundary
condition (`<` vs `<=`, starting at `0` vs `1`). Careful attention to a loop's
exact start, end, and step is worth double-checking every time, not just when a
bug appears.

Tags: Off-by-one errors, Boundary conditions, Loop invariants

## Common Mistakes

- Using `<=` when `<` was intended (or vice versa), running one iteration too many or too few.
- Forgetting the update step entirely, causing an infinite loop that never terminates.

## Exercises

- In the JavaScript example, change `i < 5` to `i <= 5` and predict how many times the loop body runs.
- In Python, rewrite the loop to count down from 5 to 1 instead of up.

## javascript

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i)
}
// prints 0, 1, 2, 3, 4 — five times, not four or six
```
Walkthrough: `let i = 0` runs once, before anything else. Before each pass, `i < 5`
is checked — true for `0, 1, 2, 3, 4`, false once `i` becomes `5`, which is when the
loop stops. `i++` runs after each pass's body, incrementing `i` by one. This is why
the loop prints exactly five numbers, `0` through `4`, never reaching `5` itself.

## python

```python
for i in range(5):
    print(i)
# prints 0, 1, 2, 3, 4 — same five numbers
```
Walkthrough: Python doesn't write the three-part initializer/condition/update
explicitly — `range(5)` generates the sequence `0, 1, 2, 3, 4` directly, and `for i in`
iterates over it. This is really Python's Collection Iteration syntax applied to a
generated sequence of numbers, not a separate counted-loop construct — worth
noticing that Python only has one loop shape where JavaScript and Java have two.

## java

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
// prints 0, 1, 2, 3, 4
```
Walkthrough: identical three-part structure to JavaScript's — `int i = 0` once,
`i < 5` checked before each pass, `i++` after each pass. Java requires the loop
variable's type (`int`) to be declared explicitly, consistent with Java requiring
every variable's type to be fixed at declaration (see the Type and Variable
concepts).
