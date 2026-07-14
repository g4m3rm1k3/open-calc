---
concept: 061-nested-loops
name: Nested Loops
---

## Definition

A nested loop is a loop written entirely inside the body of another loop — for
every single iteration of the outer loop, the entire inner loop runs to
completion before the outer loop advances to its next iteration.

## Problem

Some data and some problems are inherently two-dimensional or more — a grid, a
table, every pair of items in two separate lists — and a single loop can only
walk through one dimension at a time. Nesting a second loop inside the first is
how a program walks through both dimensions together.

## Execution

The outer loop begins its first iteration
↓
The entire inner loop runs — every one of its own iterations — before the
outer loop is allowed to advance
↓
Once the inner loop finishes completely, the outer loop moves to its next
iteration, and the inner loop restarts from its own beginning
↓
This continues until the outer loop's own condition ends it

## Computer Science

The total number of times a nested loop's innermost body runs is the product of
both loops' iteration counts, not their sum — a 3-iteration outer loop wrapping
a 4-iteration inner loop runs the innermost code 12 times total, which is why
nested loops are the classic source of an algorithm's quadratic (or worse) time
complexity.

Tags: Time complexity, Iteration count, Nested control flow

## Software Engineering

Deeply nested loops — three or more levels — are a common readability and
performance red flag; extracting the inner loop into its own named function is
a common refactor that both clarifies intent and makes it easier to reason
about each loop's cost independently.

Tags: Readability, Performance, Refactoring

## Common Mistakes

- Assuming a nested loop's total iteration count is the sum of the two loops' counts instead of their product — a common miscalculation when estimating how expensive a piece of code will be to run.
- Reusing the same loop variable name for both the outer and inner loop — this compiles in most languages but makes it easy to accidentally reference the wrong one inside the inner loop.

## Exercises

- In the JavaScript example, change the outer loop to run 4 times instead of 2 and predict the new total number of printed lines.
- In Python, swap which loop is outer and which is inner and confirm the printed pairs are still the same set, just in a different order.

## javascript

```javascript
for (let row = 0; row < 2; row++) {
  for (let col = 0; col < 3; col++) {
    console.log(`(${row}, ${col})`)
  }
}
```
Walkthrough: for each single value of `row` (0, then 1), the entire inner loop
runs all three of its values (0, 1, 2) before `row` advances — six total lines
printed, `2 × 3`, not `2 + 3`.

## python

```python
for row in range(2):
    for col in range(3):
        print(f'({row}, {col})')
```
Walkthrough: identical nested structure to JavaScript's — the inner loop
completes fully for each single iteration of the outer one, six total pairs
printed.

## java

```java
for (int row = 0; row < 2; row++) {
    for (int col = 0; col < 3; col++) {
        System.out.println("(" + row + ", " + col + ")");
    }
}
```
Walkthrough: same nested behavior — six total lines, the inner loop's three
iterations completing in full for each of the outer loop's two.

## cpp

```cpp
for (int row = 0; row < 2; row++) {
    for (int col = 0; col < 3; col++) {
        std::cout << "(" << row << ", " << col << ")" << std::endl;
    }
}
```
Walkthrough: same shape once more — six total printed pairs, identical to
every other language shown here.

## rust

```rust
for row in 0..2 {
    for col in 0..3 {
        println!("({}, {})", row, col);
    }
}
```
Walkthrough: same nested behavior as the rest — `0..2` and `0..3` are Rust's
range syntax, but the nesting mechanics (inner loop completes fully before the
outer advances) are identical to every language above.
