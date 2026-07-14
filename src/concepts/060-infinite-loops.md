---
concept: 060-infinite-loops
name: Infinite Loops
---

## Definition

An infinite loop is a loop whose condition never becomes false, or that has no
condition at all, causing it to repeat forever unless something inside it —
usually `break`, `return`, or the program exiting — stops it explicitly.

## Problem

Not every loop's stopping point is a simple condition checked at the top — a
server that should keep handling requests until it's shut down, or a game loop
that runs every frame until the player quits, genuinely needs to run forever by
default, stopping only in response to a specific event.

## Execution

The loop's condition is either always true or omitted entirely
↓
The body runs, and execution returns to the top of the loop
↓
This repeats indefinitely — there is no normal path where the condition
becomes false on its own
↓
The loop only actually ends if something inside it explicitly interrupts it —
`break`, `return`, an exception, or the whole program terminating

## Computer Science

An infinite loop is a completely normal, intentional construct when it's
genuinely meant to run forever with an internal exit — the same syntax, written
by accident (a condition that was supposed to change but never does), is one of
the most common real bugs in loop-based code.

Tags: Loop termination, Halting problem, Program correctness

## Software Engineering

Deliberately infinite loops are standard in event loops, servers, and game
loops — the key engineering discipline is making sure there's always a real,
reachable way out, not that the loop avoid being infinite in the first place.

Tags: Event loops, Server architecture, Long-running processes

## Common Mistakes

- Writing a loop condition that was intended to eventually become false but never actually does, due to a bug in how the loop variable is updated — an accidental infinite loop, not an intentional one.
- Writing a genuinely intentional infinite loop with no reachable exit condition at all — even an intentional infinite loop needs some real way to stop.

## Exercises

- In the JavaScript example, change the break condition so it's never actually true, and reason about why the loop would then run forever without a safeguard.
- In Rust, compare `loop { ... break; }` to the equivalent `while true { ... break; }` — both work, but `loop` makes the "this is intentionally unconditional" intent explicit in a way `while true` doesn't.

## javascript

```javascript
let attempts = 0
while (true) {
  attempts = attempts + 1
  if (attempts >= 3) break
}
console.log(attempts)
```
Walkthrough: `while (true)` has no condition that could ever become false on
its own — this loop runs forever unless something inside it stops it. Here,
`break` fires once `attempts` reaches `3`, giving the loop a real, reachable
exit.

## python

```python
attempts = 0
while True:
    attempts = attempts + 1
    if attempts >= 3:
        break
print(attempts)
```
Walkthrough: same `while True` pattern — Python's capitalized `True` aside,
this is structurally identical to JavaScript's version, with `break` providing
the only way out.

## java

```java
int attempts = 0;
while (true) {
    attempts = attempts + 1;
    if (attempts >= 3) break;
}
System.out.println(attempts);
```
Walkthrough: same intentional infinite loop as the other two — `while (true)`
never ends on its own, relying entirely on the `break` inside it to terminate.

## cpp

```cpp
int attempts = 0;
while (true) {
    attempts = attempts + 1;
    if (attempts >= 3) break;
}
std::cout << attempts << std::endl;
```
Walkthrough: same pattern once more — an unconditionally true loop, ended only
by the explicit `break` once the counter reaches its target.

## rust

```rust
let mut attempts = 0;
loop {
    attempts = attempts + 1;
    if attempts >= 3 {
        break;
    }
}
println!("{}", attempts);
```
Walkthrough: Rust has a dedicated `loop` keyword specifically for this —
instead of writing `while true`, `loop` states directly that this loop has no
condition at all and is only ever stopped by something explicit inside it, like
the `break` here.
