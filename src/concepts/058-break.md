---
concept: 058-break
name: "break"
---

## Definition

`break` immediately exits the innermost loop it's inside, skipping any
remaining iterations and any remaining code in the loop's body, and continues
execution with whatever comes right after the loop.

## Problem

Sometimes a loop's normal condition isn't the actual reason to stop — searching
a list and wanting to stop the instant a match is found, rather than continuing
to check every remaining element for no reason. `break` lets a loop exit early
from any point inside it, not just at its normal condition check.

## Execution

Execution reaches a `break` statement somewhere inside a loop's body
↓
The loop terminates immediately — any remaining code in that iteration, and any
remaining iterations, are skipped entirely
↓
Execution continues with the first statement after the loop, as if the loop's
own condition had just become false

## Computer Science

`break` only affects the innermost loop it's directly inside — exiting an outer
loop from inside a nested one requires either a labeled break, where the
language supports it, or a different mechanism entirely, like a flag variable
or restructuring into a function with `return`.

Tags: Loop control flow, Nested loops, Labeled breaks

## Software Engineering

A `break` used to short-circuit a search the moment a match is found is a
genuine performance win, not just a style choice — without it, a loop would
keep checking every remaining element even after the answer is already known.

Tags: Early exit optimization, Search patterns, Readability

## Common Mistakes

- Assuming `break` exits every loop it's nested inside, not just the innermost one — a `break` inside a loop nested within another loop only stops the inner one; the outer loop keeps running.
- Using `break` to exit a loop instead of restructuring the search into its own function that can simply `return` the result — sometimes the function extraction is clearer than an early exit buried in loop logic.

## Exercises

- In the JavaScript example, change the search target to a value not in the array and observe the loop run to completion without ever hitting `break`.
- In Rust, reason about what would happen if the `break` were removed — the loop would print every matching element instead of stopping at the first one.

## javascript

```javascript
const numbers = [4, 9, 15, 23, 7]
for (const n of numbers) {
  if (n > 10) {
    console.log('Found:', n)
    break
  }
}
```
Walkthrough: the loop checks each number in order — `4` and `9` don't satisfy
`n > 10`, but `15` does, so `'Found: 15'` prints and `break` stops the loop
immediately, without ever checking `23` or `7`.

## python

```python
numbers = [4, 9, 15, 23, 7]
for n in numbers:
    if n > 10:
        print('Found:', n)
        break
```
Walkthrough: identical behavior to JavaScript's — the loop stops the instant
`15` satisfies the condition, never reaching `23` or `7` at all.

## java

```java
int[] numbers = {4, 9, 15, 23, 7};
for (int n : numbers) {
    if (n > 10) {
        System.out.println("Found: " + n);
        break;
    }
}
```
Walkthrough: same early-exit behavior — `break` stops the loop the moment `15`
is found, skipping the remaining elements entirely.

## cpp

```cpp
std::vector<int> numbers = {4, 9, 15, 23, 7};
for (int n : numbers) {
    if (n > 10) {
        std::cout << "Found: " << n << std::endl;
        break;
    }
}
```
Walkthrough: same behavior once more — `break` exits the loop as soon as the
first match is found, leaving `23` and `7` unchecked.

## rust

```rust
let numbers = vec![4, 9, 15, 23, 7];
for n in &numbers {
    if *n > 10 {
        println!("Found: {}", n);
        break;
    }
}
```
Walkthrough: same early exit as every other language here — `break` stops
Rust's `for` loop immediately once `15` is found, and `*n` dereferences the
loop's borrowed reference to compare its actual value.
