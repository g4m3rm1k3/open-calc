---
concept: 182-enums-with-data
name: Enums with Data (Rust)
---

## Definition

Rust enums can carry DATA in each variant (unlike a plain enum in many
other languages, which is just a set of named constants) — different
variants of the same enum can hold completely different types and
amounts of data, making an enum a genuine "one of these several possible
shapes" type.

## Problem

Representing "a value that could be one of several genuinely different
shapes" (a network response that's either a success WITH data, or a
failure WITH an error message) using separate flags or nullable fields is
error-prone — nothing stops accidentally reading the "success data" field
when the operation actually failed. A data-carrying enum makes each
possible shape EXPLICIT and mutually exclusive, and `match` forces
handling every shape.

## Execution

An enum has three variants, each carrying COMPLETELY different data: no
data, a struct-like pair of fields, or a single string
↓
A value is constructed as one specific variant, with its associated data
↓
Matching on it DESTRUCTURES each variant's specific data directly, and
must handle all three variants
↓
This is exactly how `Option<T>` (`Some(T)` / `None`) and `Result<T, E>`
(`Ok(T)` / `Err(E)`) are themselves defined — they're just enums with
data, using this same general mechanism (see Option/Result Matching)

## Computer Science

This is what's formally called an "algebraic data type" (specifically a
sum type / tagged union) — a value is guaranteed to be EXACTLY one of the
listed variants, never a mix, and the compiler tracks which variant's
data is actually present, making it impossible to accidentally access a
field that doesn't apply to the current variant.

Tags: Algebraic data types, Sum types, Tagged unions, Pattern matching

## Software Engineering

Data-carrying enums are Rust's idiomatic way to model "one of several
distinct cases" that in other languages might be represented with a base
class and several subclasses, or with a type flag plus several
optional/nullable fields — the enum approach makes invalid combinations
(like a "success" flag paired with error data) impossible to construct in
the first place.

Tags: Modeling alternatives, Type safety, Invalid state prevention

## Common Mistakes

- Modeling "one of several distinct cases" with a set of independent boolean flags or nullable fields instead of an enum — this allows constructing invalid combinations (e.g., both "success" and "error" fields populated at once) that a proper enum would make structurally impossible.
- Forgetting to handle every variant in a `match` — the compiler rejects a non-exhaustive `match`, which is a real safety feature: it's impossible to silently forget a case.

## Exercises

- Trace through what would happen if a new variant were added to an enum, but an existing `match` block against it were left unchanged — what would the compiler say?
- Explain why `Option<T>` being defined as an enum (`Some(T)` / `None`) is the same underlying mechanism as a custom multi-variant enum.

## rust

```rust
enum WebEvent {
    PageLoad,
    Click { x: i64, y: i64 },
    Paste(String),
}

fn handle_event(event: WebEvent) {
    match event {
        WebEvent::PageLoad => println!("page loaded"),
        WebEvent::Click { x, y } => println!("clicked at {}, {}", x, y),
        WebEvent::Paste(s) => println!("pasted: {}", s),
    }
}

fn main() {
    handle_event(WebEvent::PageLoad);
    handle_event(WebEvent::Click { x: 10, y: 20 });
    handle_event(WebEvent::Paste(String::from("hello")));
}
```
Walkthrough: each call to `handle_event` passes a DIFFERENT variant of
`WebEvent`, each carrying its own distinct shape of data (nothing, an
`{x, y}` pair, or a `String`) — the single `match` inside `handle_event`
destructures whichever variant it's actually given and handles all three
possibilities, something the compiler verifies is exhaustive at compile
time.
