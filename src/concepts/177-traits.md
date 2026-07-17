---
concept: 177-traits
name: Traits (Rust)
---

## Definition

A trait defines a set of methods a type must implement to be considered
part of that trait — Rust's mechanism for shared behavior across
different types, similar to an interface in other languages, letting
generic code work with any type that implements the required trait.

## Problem

Writing separate, near-identical code for every concrete type that needs
some common behavior (e.g., "can be described as text") would duplicate
logic across every type. A trait defines that shared behavior ONCE as a
contract, and any type can implement it — letting generic functions
accept "anything that implements this trait" rather than one specific
concrete type.

## Execution

A trait defines a required method, with no implementation yet
↓
One type implements the trait, with its own specific logic
↓
A DIFFERENT type implements the SAME trait, its own different way
↓
A function accepts ANYTHING implementing the trait, regardless of its
concrete type
↓
Calling that function with either type works — the SAME function
operates correctly on both, since both satisfy the trait

## Computer Science

Traits enable a form of polymorphism resolved at compile time via
monomorphization (the compiler generates a separate, specialized version
of generic code for each concrete type actually used) — this achieves the
flexibility of interface-based polymorphism from other languages, but
typically with zero runtime dispatch overhead, unlike a virtual method
table lookup.

Tags: Polymorphism, Monomorphization, Zero-cost abstractions, Interfaces (cross-language)

## Software Engineering

Traits are how Rust achieves code reuse without inheritance (which Rust
deliberately doesn't have for structs) — instead of a class hierarchy,
behavior is composed by implementing multiple independent traits on a
type, each contributing its own specific capability.

Tags: Composition over inheritance, Trait bounds, Generic functions

## Common Mistakes

- Trying to call a trait method on a type that hasn't implemented that trait — this is a compile error; a type only gains a trait's methods once it explicitly implements them.
- Confusing a trait DEFINITION (the method signatures required) with an IMPLEMENTATION (the actual code fulfilling those signatures for a specific type) — a trait alone has no behavior; each `impl` block provides the real logic for one specific type.

## Exercises

- Trace through what a generic function accepting `&impl Summary` would do if called with a THIRD type that also implements `Summary` — does the function's own code need to change at all to support it?
- Explain what compiler error would occur if you tried calling a trait's method on a type that never implemented that trait.

## rust

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct Article { title: String }
struct Tweet { user: String, text: String }

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}...", self.title)
    }
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}: {}", self.user, self.text)
    }
}

fn notify(item: &impl Summary) {
    println!("Breaking! {}", item.summarize());
}

fn main() {
    let article = Article { title: String::from("Rust 2.0 Released") };
    let tweet = Tweet { user: String::from("rustlang"), text: String::from("It's out!") };

    notify(&article);   // Breaking! Rust 2.0 Released...
    notify(&tweet);      // Breaking! @rustlang: It's out!
}
```
Walkthrough: `notify` is written once, accepting `&impl Summary` — ANY
type implementing the `Summary` trait. Calling it with `&article` and
`&tweet` runs the SAME `notify` function body both times, but each call
invokes that specific type's own `summarize()` implementation, producing
different output despite `notify` itself having no knowledge of either
concrete type.
