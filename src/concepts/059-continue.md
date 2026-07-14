---
concept: 059-continue
name: "continue"
---

## Definition

`continue` immediately skips the rest of the current iteration's body and
jumps straight to the loop's next iteration, without exiting the loop entirely
the way `break` does.

## Problem

Sometimes only part of a loop's body should be skipped for certain elements —
not the whole loop — like skipping invalid entries while still processing every
valid one. `continue` lets a single iteration bail out early without
abandoning the rest of the loop.

## Execution

Execution reaches a `continue` statement somewhere inside a loop's body
↓
The rest of the current iteration's body is skipped entirely
↓
The loop's condition, or next-element check, is evaluated again, starting the
next iteration
↓
The loop only actually ends when its own normal condition becomes false —
`continue` never exits it directly

## Computer Science

`continue` and `break` both alter a loop's normal control flow, but in
opposite ways — `break` exits the loop entirely, while `continue` only skips
ahead to the next iteration, keeping the loop itself running.

Tags: Loop control flow, Iteration skipping, Control transfer

## Software Engineering

A `continue` used to skip invalid or irrelevant items at the top of a loop
body — a guard clause for loops — often reads more clearly than wrapping the
entire rest of the body in an `if` block; both are common, but `continue`
avoids one extra level of nesting.

Tags: Guard clauses, Readability, Nesting reduction

## Common Mistakes

- Using nested `if` blocks to skip unwanted items instead of an early `continue` — this adds a level of indentation to the entire rest of the loop body for no real benefit.
- Confusing `continue`'s effect with `break`'s — `continue` moves to the next iteration; it does not exit the loop, a mix-up that produces a loop that runs the wrong number of times.

## Exercises

- In the JavaScript example, remove the `continue` and observe negative numbers get processed (and printed) instead of skipped.
- In Python, add a second condition that also uses `continue` (e.g. skip values over 100 too) and confirm both filters apply independently.

## javascript

```javascript
const numbers = [4, -2, 9, -7, 15]
for (const n of numbers) {
  if (n < 0) continue
  console.log(n)
}
```
Walkthrough: when `n` is `-2` or `-7`, `continue` skips the rest of that
iteration — the `console.log(n)` line below it never runs for those two values
— but the loop itself keeps going, reaching `9` and `15` normally afterward.

## python

```python
numbers = [4, -2, 9, -7, 15]
for n in numbers:
    if n < 0:
        continue
    print(n)
```
Walkthrough: identical behavior to JavaScript's — negative values skip straight
to the next iteration, never reaching the `print(n)` line, while positive
values are printed normally.

## java

```java
int[] numbers = {4, -2, 9, -7, 15};
for (int n : numbers) {
    if (n < 0) continue;
    System.out.println(n);
}
```
Walkthrough: same skip-and-continue behavior — negative numbers never reach the
print statement, but the loop keeps running through every remaining element.

## cpp

```cpp
std::vector<int> numbers = {4, -2, 9, -7, 15};
for (int n : numbers) {
    if (n < 0) continue;
    std::cout << n << std::endl;
}
```
Walkthrough: same pattern once more — `continue` skips straight past the print
statement for negative values without ending the loop.

## rust

```rust
let numbers = vec![4, -2, 9, -7, 15];
for n in &numbers {
    if *n < 0 {
        continue;
    }
    println!("{}", n);
}
```
Walkthrough: same behavior as the other four — `continue` skips this
iteration's remaining body for negative values, and the loop moves on to the
next element regardless.
