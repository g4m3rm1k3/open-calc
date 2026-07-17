---
concept: 178-option-result-matching
name: Option/Result Matching (Rust)
---

## Definition

`Option<T>` and `Result<T, E>` are Rust's built-in types for representing
"a value that might not exist" (`Option`: `Some(value)` or `None`) and
"an operation that might fail" (`Result`: `Ok(value)` or `Err(error)`) —
pattern matching with `match` forces handling BOTH possibilities
explicitly, at compile time.

## Problem

Many languages represent "no value" with `null`/`None` that can silently
be passed anywhere a real value is expected, causing a runtime crash
(null pointer/reference exceptions) the moment code forgets to check for
it. Rust makes "might not have a value" or "might have failed" part of
the TYPE ITSELF (`Option<T>`, `Result<T, E>`) — the compiler then
REQUIRES the code to explicitly handle both cases before it can access
the inner value, eliminating null-reference crashes entirely.

## Execution

A function returns `Option<String>` — either `Some(name)` if found, or
`None` if not
↓
Matching on it requires handling BOTH cases — the compiler REJECTS code
that forgets the `None` case
↓
A function returns `Result<f64, String>` — either `Ok(value)` on success,
or `Err(message)` on failure
↓
Matching on it requires handling the ERROR case too, not silently
ignoring it or letting it crash

## Computer Science

`Option` and `Result` push the "did this succeed / does this exist" check
to COMPILE time via the type system, rather than leaving it as a RUNTIME
possibility a caller might forget to check — the compiler literally won't
let code compile if a `match` fails to handle every variant, converting a
whole class of runtime crash into a compile-time reminder.

Tags: Type-safe error handling, Exhaustive matching, Null safety, Algebraic data types

## Software Engineering

This shifts error handling from "hope every caller remembers to check"
(common in languages with nullable references or silent exceptions) to
"the compiler enforces that every possible outcome is handled somewhere"
— a substantial reliability improvement for code that deals with
operations that can genuinely fail or return nothing.

Tags: Reliability, Explicit error handling, Compiler-enforced correctness

## Common Mistakes

- Using `.unwrap()` carelessly in production code — it extracts the value from `Some`/`Ok` but PANICS (crashes) immediately if given `None`/`Err`, which reintroduces exactly the kind of runtime crash `Option`/`Result` were designed to prevent, unless you've already proven the value can't be `None`/`Err` at that point.
- Forgetting that `match` must be EXHAUSTIVE — every possible variant (`Some`/`None`, or `Ok`/`Err`) must be handled, or the code simply won't compile; there's no way to accidentally skip a case.

## Exercises

- Trace through what a lookup for a nonexistent id would return, and what the `match` would print for that case.
- Explain why `.unwrap()` on a `None` value causes a runtime panic — doesn't Rust's whole point revolve around catching this kind of thing at COMPILE time instead?

## rust

```rust
fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some(String::from("Alice")) } else { None }
}

fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 { Err(String::from("divide by zero")) } else { Ok(a / b) }
}

fn main() {
    match find_user(1) {
        Some(name) => println!("Found: {}", name),
        None => println!("Not found"),
    }

    match find_user(2) {
        Some(name) => println!("Found: {}", name),
        None => println!("Not found"),
    }

    match divide(10.0, 0.0) {
        Ok(result) => println!("Result: {}", result),
        Err(e) => println!("Error: {}", e),
    }

    match divide(10.0, 2.0) {
        Ok(result) => println!("Result: {}", result),
        Err(e) => println!("Error: {}", e),
    }
}
```
Walkthrough: `find_user(1)` matches `Some(name)`, printing the found
user; `find_user(2)` falls through to the `None` arm instead, since no
user with id `2` exists in this simplified lookup. `divide(10.0, 0.0)`
matches the `Err` arm (division by zero), while `divide(10.0, 2.0)`
matches `Ok` — every `match` here handles BOTH possible outcomes
explicitly, which the compiler requires.
