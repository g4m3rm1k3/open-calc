---
concept: 179-smart-pointers-rust
name: Smart Pointers (Rust)
---

## Definition

A smart pointer is a data structure that acts like a pointer but carries
additional metadata and behavior — Rust's standard library provides
several (`Box<T>` for heap allocation, `Rc<T>` for shared ownership via
reference counting, `RefCell<T>` for interior mutability), each solving a
specific ownership limitation that plain references can't handle alone.

## Problem

Rust's ownership rules (see Ownership) normally allow exactly one owner
and enforce borrow-checking at compile time — but some patterns genuinely
need MULTIPLE owners of the same data (a shared cache referenced from
several places), or data whose SIZE isn't known at compile time (a
recursive data structure). Smart pointers provide controlled, safe ways to
handle these cases without abandoning Rust's safety guarantees.

## Execution

`Box<T>` allocates a value on the HEAP instead of the stack, useful for
recursive types whose size the compiler can't determine upfront (see
Stack vs Heap)
↓
`Rc<T>` gives MULTIPLE owners of the SAME data, with a reference count
tracking how many `Rc` clones exist
↓
Checking the strong count after cloning shows it's increased — both the
original and the clone share ownership, and the underlying data is only
freed once the LAST `Rc` pointing to it is dropped
↓
`RefCell<T>` allows MUTATING data even through an IMMUTABLE reference, by
moving the borrow-checking from compile time to RUNTIME — useful for
specific patterns the compile-time borrow checker is too conservative to
allow

## Computer Science

Each smart pointer relaxes exactly ONE of Rust's default ownership
constraints in a controlled, still-safe way — `Box` relaxes "must be
stack-sized and known at compile time," `Rc` relaxes "exactly one owner,"
and `RefCell` relaxes "borrow checking happens at compile time" (moving
that specific check to runtime instead, where it panics on violation
rather than failing silently).

Tags: Heap allocation, Reference counting, Interior mutability, Runtime borrow checking

## Software Engineering

`Rc<T>` alone is NOT thread-safe (multiple threads incrementing its
reference count simultaneously could race) — `Arc<T>` (Atomic Rc) is the
thread-safe equivalent, used specifically when shared ownership needs to
cross thread boundaries; reaching for the wrong one is a common source of
compiler errors when introducing concurrency.

Tags: Rc vs Arc, Thread safety, Concurrency-safe sharing

## Common Mistakes

- Using `Rc<T>` in multi-threaded code instead of `Arc<T>` — the compiler will reject this (since `Rc` isn't `Send`/`Sync`), which is Rust catching a potential data race at compile time rather than allowing it to become a runtime bug.
- Reaching for `Rc<RefCell<T>>` habitually as a default pattern, instead of first trying to restructure the code to use Rust's normal ownership/borrowing rules — smart pointers solve real problems, but add real complexity (the runtime panic risk of `RefCell`, the reference-counting overhead of `Rc`) that plain ownership avoids.

## Exercises

- Trace through what the strong count would be immediately after a THIRD clone of the same `Rc` is created, continuing from the example below.
- Explain the specific problem `Box<T>` solves for a recursive data structure (like a singly linked list) that plain, non-boxed fields couldn't.

## rust

```rust
use std::rc::Rc;

fn main() {
    let b = Box::new(5);   // heap-allocated integer
    println!("boxed: {}", *b);

    let a = Rc::new(String::from("shared"));
    println!("count after creating a: {}", Rc::strong_count(&a));   // 1

    let b2 = Rc::clone(&a);   // a SECOND owner of the same data
    println!("count after cloning: {}", Rc::strong_count(&a));      // 2

    println!("a: {}, b2: {}", a, b2);   // both a and b2 can be used -- they share the SAME underlying String
}
```
Walkthrough: `Box::new(5)` demonstrates simple heap allocation. `Rc::new`
creates a reference-counted value starting at count `1`; cloning it with
`Rc::clone` increments the count to `2` WITHOUT copying the underlying
`String` data itself — both `a` and `b2` are genuinely separate owners
sharing the exact same heap-allocated string.
