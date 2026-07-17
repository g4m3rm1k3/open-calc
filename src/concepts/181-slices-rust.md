---
concept: 181-slices-rust
name: Slices (Rust)
---

## Definition

A slice is a reference to a CONTIGUOUS portion of a collection (an
array, a `Vec`, a `String`) without taking ownership of it or copying its
data — represented internally as a pointer plus a length, letting code
work with "some range of this data" generically, regardless of the full
collection's size.

## Problem

A function that needs to work with "part of an array" would otherwise
need to either copy that portion (wasteful) or take ownership of the
entire original collection (overly restrictive, and would move/consume
it). A slice provides a lightweight VIEW into existing data — no copying,
no ownership transfer — that can represent any contiguous range,
including the whole collection.

## Execution

An array of 5 integers is created
↓
A slice references indices 1 through 2 (exclusive of index 3) — no
copying of the underlying data occurred
↓
A function accepting a SLICE works with ANY contiguous range of
integers, regardless of whether it came from an array, a `Vec`, or
another slice
↓
Calling it with a partial slice sums just that range; calling it with the
WHOLE array (via a slice covering everything) sums all of it
↓
String slices work the same way — a range of a `String`'s characters is a
VIEW into the original data, not a separate copy

## Computer Science

A slice is a "fat pointer" — internally just a pointer to the start of
the range plus a length, making it extremely lightweight to create and
pass around (no data copying, ever) while still letting functions be
generic over collection SIZE, since a slice's length is checked at
runtime, not baked into the type.

Tags: Fat pointers, Contiguous memory, Zero-copy views, Bounds checking

## Software Engineering

Accepting a slice (`&[T]`) as a function parameter, rather than a
specific owned collection type (`Vec<T>` or `[T; N]`), is the idiomatic
Rust way to write a function that works with "any contiguous sequence of
T" — it's MORE flexible for callers (works with arrays, Vecs, or other
slices) while adding no runtime cost.

Tags: Idiomatic function signatures, Generic-over-collection-type, API flexibility

## Common Mistakes

- Requesting an out-of-bounds slice range on a collection — this is a runtime panic, since the compiler can't always know collection lengths ahead of time, so slice bounds are checked when the program actually runs.
- Writing a function that takes `&Vec<T>` when `&[T]` (a slice) would work just as well and be more flexible — `&[T]` accepts arrays, Vecs, and slices alike, while `&Vec<T>` only accepts an actual `Vec`.

## Exercises

- Trace through what a slice with no upper bound and one with no lower bound would each produce, using a 5-element array.
- Explain why passing a slice to a function never copies the underlying data, even though the function receives what looks like a brand new value.

## rust

```rust
fn sum(s: &[i32]) -> i32 {
    s.iter().sum()
}

fn main() {
    let arr = [1, 2, 3, 4, 5];

    let slice = &arr[1..3];   // indices 1 and 2 -- [2, 3]
    println!("{:?}", slice);   // [2, 3]

    println!("sum of slice: {}", sum(&arr[1..3]));   // 5  (2 + 3)
    println!("sum of whole array: {}", sum(&arr));    // 15 (the entire array, via a full slice)

    let s = String::from("hello world");
    let hello = &s[0..5];
    println!("{}", hello);   // hello -- a VIEW into s's data, not a separate copy
}
```
Walkthrough: `&arr[1..3]` produces a slice covering exactly indices 1 and
2 (`[2, 3]`), and `sum` works identically whether given a partial slice
or the full array via `&arr`, since it only cares that it received SOME
contiguous sequence of `i32`s. `&s[0..5]` demonstrates the same
zero-copy-view mechanic for a `String`, producing `"hello"` without
allocating a separate string.
