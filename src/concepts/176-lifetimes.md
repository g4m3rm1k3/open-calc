---
concept: 176-lifetimes
name: Lifetimes (Rust)
---

## Definition

A lifetime is Rust's way of tracking, at compile time, how long a
reference remains VALID — ensuring a reference never outlives the data it
points to, which would otherwise create a dangling reference (pointing at
memory that's already been freed).

## Problem

If a reference could outlive the data it points to, using that reference
afterward would read invalid, potentially reused memory — a classic and
dangerous class of bug in languages without this protection (a "dangling
pointer" or "use-after-free"). Rust's compiler tracks lifetimes to reject
any code where this COULD happen, before the program ever runs.

## Execution

A reference is declared, not yet pointing anywhere
↓
A value is created in an INNER scope, and the reference borrows it
↓
The value goes out of scope at the end of the inner block — its memory
would normally be freed here
↓
Using the reference AFTER the value is gone would read invalid memory
↓
Rust's compiler REJECTS this code at compile time with a lifetime error —
it can prove the reference's lifetime would outlive the value's, and
refuses to compile rather than risk a dangling reference at runtime

## Computer Science

Lifetimes are a compile-time-only concept — they add ZERO runtime
overhead (no lifetime information exists in the compiled binary at all);
they exist purely to let the compiler PROVE, ahead of time, that every
reference in the program will always point to valid data for as long as
it's used.

Tags: Dangling references, Compile-time proof, Zero runtime cost, Borrow checker

## Software Engineering

Most lifetimes are inferred automatically by the compiler without any
explicit annotation needed — explicit lifetime annotations (`'a`) are only
required in specific situations, most commonly when a function returns a
reference and the compiler can't automatically determine which input
reference it's tied to.

Tags: Lifetime elision, Explicit annotations, Function signatures

## Common Mistakes

- Trying to return a reference to a value that was created INSIDE the function and would be dropped when the function returns — this is a lifetime error, since the returned reference would immediately dangle; the function needs to return an owned value instead.
- Assuming lifetime annotations CHANGE how long a value lives — they don't extend or shorten anything; they only describe an existing relationship between reference lifetimes so the compiler can verify it's safe.

## Exercises

- Trace through the example below and explain specifically why the compiler would reject using `result` after the inner block ends — what would `result` actually be pointing at if this were allowed to run?
- Explain why lifetime annotations add no runtime cost, despite constraining what code is allowed to compile.

## rust

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    // the explicit lifetime 'a tells the compiler: the returned reference
    // is valid for AS LONG AS BOTH x and y are valid -- no longer
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("long string");
    let result;
    {
        let string2 = String::from("short");
        result = longest(string1.as_str(), string2.as_str());
        println!("Longest: {}", result);   // valid HERE, since string2 is still alive in this scope
    }
    // println!("{}", result);   // this would be a COMPILE ERROR: string2 (and result's possible reference to it)
                                   // doesn't live long enough -- commented out so this file actually compiles
}
```
Walkthrough: the `'a` lifetime annotation tells the compiler that
`longest`'s returned reference is only guaranteed valid as long as BOTH
`x` and `y` are. Using `result` INSIDE the inner block (while `string2` is
still alive) compiles fine; using it AFTER the inner block ends (shown
commented out) would fail to compile, since `result` might be referencing
`string2`, which no longer exists at that point.
