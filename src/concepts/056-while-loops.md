---
concept: 056-while-loops
name: while Loops
---

## Definition

A while loop repeats a block of code for as long as a condition remains true,
checking that condition again before every single iteration, including the
very first one.

## Problem

Some repetition doesn't have a known number of iterations ahead of time —
reading input until a sentinel value appears, retrying a connection until it
succeeds. A while loop repeats based on a condition staying true, rather than a
fixed count (see Counted Iteration for the fixed-count case).

## Execution

The condition is checked
↓
If false, the loop ends immediately — the body may never run at all, not even
once
↓
If true, the loop's body runs completely
↓
Execution returns to the condition and checks it again, repeating this cycle
until the condition becomes false

## Computer Science

A while loop's condition is checked before every iteration, including the
first — this is what distinguishes it from a do-while loop, which guarantees
the body runs at least once before its condition is ever checked.

Tags: Pre-test loops, Iteration, Loop termination

## Software Engineering

A while loop whose condition never becomes false runs forever (see Infinite
Loops) — every while loop needs something inside its body that can actually
change the condition's outcome, or a way out via `break`, or it will never
terminate.

Tags: Loop termination, Infinite loop risk, Defensive coding

## Common Mistakes

- Writing a while loop whose condition depends on a variable that's never actually updated inside the loop body — the condition never changes, so the loop runs forever.
- Using a while loop where a fixed-count for loop would be clearer, when the number of iterations is actually known ahead of time.

## Exercises

- In the JavaScript example, change the starting value so the condition is false immediately and confirm the loop body never runs at all.
- In Python, reason about why the loop would never terminate if the line updating the loop variable were removed.

## javascript

```javascript
let count = 0
while (count < 3) {
  console.log(count)
  count = count + 1
}
```
Walkthrough: the condition `count < 3` is checked before each iteration — `0`,
`1`, `2` all pass and print, and once `count` reaches `3`, the condition is
false and the loop ends without printing `3` at all.

## python

```python
count = 0
while count < 3:
    print(count)
    count = count + 1
```
Walkthrough: identical behavior to JavaScript's — the condition is checked
before every iteration, and the loop body updates `count` each time so the
condition eventually becomes false.

## java

```java
int count = 0;
while (count < 3) {
    System.out.println(count);
    count = count + 1;
}
```
Walkthrough: same pre-test loop as the other two — Java's `while` syntax is
nearly identical to JavaScript's and Python's in structure, just with required
braces and semicolons.

## cpp

```cpp
int count = 0;
while (count < 3) {
    std::cout << count << std::endl;
    count = count + 1;
}
```
Walkthrough: same pre-test behavior once more — the condition is evaluated
first, and the loop body only ever runs while it holds true.

## rust

```rust
let mut count = 0;
while count < 3 {
    println!("{}", count);
    count = count + 1;
}
```
Walkthrough: same as the other four — Rust's `while` requires `mut` on `count`
since the loop body reassigns it, consistent with Rust requiring `mut` for any
reassignable variable (see Assignment).
