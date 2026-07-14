---
concept: 057-do-while-loops
name: do-while Loops
---

## Definition

A do-while loop runs its body once, unconditionally, and only then checks its
condition to decide whether to repeat — guaranteeing at least one execution,
unlike a while loop, which might skip the body entirely.

## Problem

Some logic genuinely needs to run at least once no matter what — showing a menu
before asking whether to show it again, reading at least one line of input
before checking whether more should be read. A do-while loop expresses "run
this, then decide whether to keep going" directly.

## Execution

The loop's body runs once, unconditionally
↓
The condition is checked only after that first execution
↓
If true, the body runs again, and the condition is checked again afterward
↓
This repeats until the condition is false, at which point the loop ends

## Computer Science

A do-while loop is a post-test loop — its condition check happens after the
body, the opposite order from a while loop's pre-test check — which is exactly
why a do-while loop's body is guaranteed to run at least once, and a while
loop's body isn't.

Tags: Post-test loops, Iteration, Loop termination

## Software Engineering

Not every language has a dedicated do-while construct — languages without one
emulate it with an infinite loop and an explicit `break` at the point the
condition would have been checked, more verbose but expressing the exact same
"run at least once" guarantee.

Tags: Language feature gaps, Loop emulation, Portability

## Common Mistakes

- Reaching for a do-while loop when a regular while loop would do — if there's no real requirement that the body run at least once, a while loop's pre-test check is usually the clearer, more conventional default.
- Forgetting that a do-while loop's condition is checked *after* the body, so the very first iteration always happens regardless of whether the condition is even true to begin with.

## Exercises

- In the JavaScript example, change the starting value of `count` so the while condition would be false from the start, and confirm the body still runs exactly once anyway.
- Compare the Python and Rust versions to the other three — both have to emulate this with a different construct, since neither has a dedicated do-while keyword.

## javascript

```javascript
let count = 5
do {
  console.log(count)
  count = count + 1
} while (count < 3)
```
Walkthrough: the body runs once first, printing `5`, and only afterward is
`count < 3` checked — it's false, so the loop stops. A regular `while` loop with
the same condition would never have run at all, since `5 < 3` is false from the
very start.

## python

```python
count = 5
while True:
    print(count)
    count = count + 1
    if not (count < 3):
        break
```
Walkthrough: Python has no `do-while` keyword at all — this is the standard way
to emulate it: an infinite `while True` loop with an explicit `break` placed
exactly where the do-while's condition check would have happened, guaranteeing
the same "runs at least once" behavior.

## java

```java
int count = 5;
do {
    System.out.println(count);
    count = count + 1;
} while (count < 3);
```
Walkthrough: same post-test structure as JavaScript's — the body runs once
before `count < 3` is ever checked, printing `5` even though the condition is
false from the start.

## cpp

```cpp
int count = 5;
do {
    std::cout << count << std::endl;
    count = count + 1;
} while (count < 3);
```
Walkthrough: identical `do`/`while` syntax to Java's — C++ is where this exact
construct originated, later adopted essentially unchanged by both Java and
JavaScript.

## rust

```rust
let mut count = 5;
loop {
    println!("{}", count);
    count = count + 1;
    if !(count < 3) {
        break;
    }
}
```
Walkthrough: like Python, Rust has no dedicated `do-while` keyword — `loop`
(Rust's explicit infinite-loop construct) combined with a `break` placed after
the body plays the same role, guaranteeing the print happens at least once
before the condition is ever checked.
