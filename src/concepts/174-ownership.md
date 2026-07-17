---
concept: 174-ownership
name: Ownership (Rust)
---

## Definition

Ownership is Rust's core memory-management rule: every value has exactly
ONE owner (a variable) at a time, and when that owner goes out of scope,
the value is automatically dropped (freed) — no garbage collector needed,
since ownership alone determines when cleanup happens.

## Problem

Manual memory management (C-style malloc/free) risks use-after-free and
double-free bugs; garbage collection avoids those bugs but adds runtime
overhead and unpredictable pause times. Rust's ownership system catches
memory bugs at COMPILE time instead, with zero runtime cost — but this
requires a stricter rule: a value can only have one owner, and assigning
it to a new variable MOVES ownership rather than copying it (for
non-Copy types), invalidating the original.

## Computer Science

This is a fundamentally different tradeoff from both manual memory
management and garbage collection — ownership makes memory safety a
STATIC, compile-time-checked property (the borrow checker enforces it
before the program runs) rather than a runtime-enforced one, achieving
safety with zero runtime overhead.

Tags: Memory safety, Compile-time checking, Move semantics, Borrow checker

## Software Engineering

This is why Rust functions often take a reference (see Borrowing) instead
of the value itself when they only need to READ the data — passing by
value would MOVE ownership into the function, making the original
variable unusable afterward unless that's actually the intent.

Tags: Move vs borrow, API design, Zero-cost abstractions

## Common Mistakes

- Trying to use a variable after its value has been moved (e.g., after assigning it to another variable, or passing it by value into a function) — this is a compile error in Rust, not a runtime bug, specifically to catch it before the program ever runs.
- Assuming ALL types move on assignment — types that implement the `Copy` trait (like integers) are copied instead of moved, so the original remains perfectly valid to use afterward.

## Exercises

- Trace through what happens if a `String` variable is used again after being assigned to another variable — what specific compiler error would Rust report?
- Explain why an integer assigned to another variable does NOT invalidate the original, while a `String` in the same pattern does.

## rust

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;   // ownership MOVES from s1 to s2

    // println!("{}", s1);   // this would be a COMPILE ERROR: value borrowed after move
    println!("{}", s2);      // s2 is the valid owner now

    let x = 5;
    let y = x;   // integers implement Copy -- this COPIES, doesn't move
    println!("{} {}", x, y);   // both x and y are valid -- no move happened for Copy types
}
```
Walkthrough: after `let s2 = s1`, ownership of the `String` has moved to
`s2` — attempting to print `s1` afterward would fail to compile with a
"value borrowed after move" error (shown commented out, since this file
must actually compile to run). Integers implement the `Copy` trait, so
`let y = x` copies the value instead of moving it, leaving both `x` and
`y` independently valid.
