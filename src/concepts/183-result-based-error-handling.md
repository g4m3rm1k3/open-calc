---
concept: 183-result-based-error-handling
name: Result-Based Error Handling (Rust)
---

## Definition

Rust represents recoverable errors as ordinary return values using
`Result<T, E>` (`Ok(T)` for success, `Err(E)` for failure) rather than
exceptions — errors are propagated explicitly through function signatures
and the `?` operator, rather than being thrown and caught implicitly.

## Problem

Exception-based error handling (throw/catch) makes it easy for a function
call to fail in a way that isn't visible in its signature — any call
could potentially throw, and nothing forces the caller to handle it, so
an uncaught exception can crash the program from a code path nobody
anticipated. `Result`-based handling makes "this can fail" part of the
function's TYPE SIGNATURE, and the compiler ensures the caller
acknowledges the possibility.

## Execution

A function's SIGNATURE itself declares that it can fail, returning
`Result<u32, String>`
↓
Without `?`: matching explicitly handles both the success and error case
every time
↓
With `?`: a function chaining a fallible call uses `?` to automatically
RETURN the `Err` early if the inner call failed, or unwrap the `Ok` value
and continue if it succeeded — propagating the error UP to the caller
without verbose manual matching at every step
↓
This chains naturally: a whole pipeline of fallible operations can use
`?` at each step, and the FIRST failure anywhere in the chain
short-circuits the rest, propagating that specific error all the way up

## Computer Science

The `?` operator is syntactic sugar for exactly the match-and-early-return
pattern — it doesn't hide the possibility of failure the way an unchecked
exception would; it just removes the REPETITIVE boilerplate of writing
that same match arm at every single fallible step in a chain.

Tags: Explicit error propagation, Syntactic sugar, Error handling chains

## Software Engineering

This makes a function's error behavior fully visible and machine-checked
at its call site — a caller literally cannot ignore a `Result` without at
least explicitly discarding it (which is itself visible in the code),
unlike an exception that could silently propagate through many layers of
calls with zero indication at any of their signatures.

Tags: Visible failure modes, Compiler-enforced handling, API contracts

## Common Mistakes

- Using `.unwrap()` or `.expect()` on a `Result` in code where the error is genuinely possible and should be handled — this converts a recoverable `Err` into an immediate program-crashing panic, defeating the purpose of `Result`-based handling.
- Manually writing a full `match` for error propagation when the `?` operator would express the exact same "propagate this error to my own caller" logic far more concisely.

## Exercises

- Trace through what calling `process` with an invalid input would do, given the definitions below — where does the actual error surface, and via which mechanism (early return via `?`)?
- Explain the difference between `.unwrap()` (which panics on `Err`) and using `?` (which propagates the `Err` to the caller) — when is each one actually appropriate?

## rust

```rust
fn parse_age(input: &str) -> Result<u32, String> {
    input.parse::<u32>().map_err(|_| String::from("invalid number"))
}

fn process(input: &str) -> Result<u32, String> {
    let age = parse_age(input)?;   // propagates the Err early if parse_age failed, otherwise unwraps Ok
    Ok(age * 2)
}

fn main() {
    match process("25") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
    }

    match process("not a number") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
    }
}
```
Walkthrough: `process("25")` succeeds — `parse_age` returns `Ok(25)`, `?`
unwraps it to `25`, and `process` returns `Ok(50)`. `process("not a
number")` fails inside `parse_age`, and `?` immediately returns that
`Err` from `process` itself, without ever reaching the `Ok(age * 2)`
line — the SAME short-circuiting behavior visible in both calls' distinct
printed outcomes.
