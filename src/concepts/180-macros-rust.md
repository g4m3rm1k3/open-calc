---
concept: 180-macros-rust
name: Macros (Rust)
---

## Definition

A macro is code that generates other code at COMPILE time — Rust's
declarative macros (`macro_rules!`) let you write patterns that expand
into repetitive boilerplate code automatically, based on the arguments
given, before the compiler ever type-checks or compiles the expanded
result.

## Problem

Some patterns can't be expressed as ordinary functions — e.g., accepting
a VARIABLE number of arguments of different types (like `println!`'s
format string plus any number of values), or generating repetitive,
structurally similar code (implementing the same trait for several
different types) without hand-writing each one. Macros solve this by
operating on the SYNTAX of the code itself, generating new code according
to a pattern, rather than operating on runtime values like a function
does.

## Execution

`println!("{} is {}", name, age)` isn't a function call at all — the
trailing `!` marks it as a macro, expanded by the compiler INTO the
actual formatting code before compilation proceeds
↓
A custom macro can define a simple pattern matching an expression and
expanding it into that expression squared
↓
Calling that macro expands, AT COMPILE TIME, into the multiplied
expression — this happens before the code is even compiled, not at
runtime
↓
`vec![1, 2, 3]` is another standard library macro, expanding into the
actual `Vec` construction code, letting you write array-literal-style
syntax for a type that isn't literally built into the language's core
syntax

## Computer Science

Macros operate on the ABSTRACT SYNTAX (the code's structure itself)
rather than on runtime values — this is fundamentally different from a
function call, which happens at RUNTIME with actual values; a macro's
expansion happens entirely at COMPILE time, producing ordinary Rust code
that's THEN compiled normally.

Tags: Compile-time code generation, Metaprogramming, Syntax vs runtime values

## Software Engineering

Macros are powerful but should be reached for only when a regular
function genuinely can't express what's needed (variable argument
counts, generating repetitive trait implementations) — overusing macros
for things an ordinary function could do just as well makes code harder
to read, since macro expansion adds an extra mental step beyond normal
function-call reasoning.

Tags: Macro overuse, Readability tradeoffs, Function-first preference

## Common Mistakes

- Reaching for a macro when an ordinary function or generic function would work just as well — macros add real complexity (harder-to-read error messages, an extra expansion step to mentally trace) that isn't justified unless the pattern genuinely requires compile-time code generation.
- Assuming a macro call behaves exactly like a function call — macros operate on syntax and can do things (like accepting a variable, untyped number of arguments) that no ordinary function signature could express.

## Exercises

- Trace through what a `square!(5)`-style macro expands into at compile time, and explain why this expansion happens BEFORE the code is compiled, not while the program is running.
- Explain why `println!` needs to be a macro (rather than an ordinary function) to support a variable number of arguments of different types.

## rust

```rust
macro_rules! square {
    ($x:expr) => {
        $x * $x
    };
}

fn main() {
    let result = square!(5);   // expands, at COMPILE time, into: 5 * 5
    println!("5 squared is {}", result);   // 25

    let result2 = square!(2 + 3);   // expands into: (2 + 3) * (2 + 3), due to macro_rules! auto-parenthesizing $x
    println!("(2+3) squared is {}", result2);   // 25
}
```
Walkthrough: `square!(5)` expands at compile time into `5 * 5`, producing
`25`. `square!(2 + 3)` correctly produces `25` as well (not `2 + 3 * 2 +
3 = 11`), since `macro_rules!` automatically wraps the captured `$x:expr`
in parentheses during expansion, avoiding the operator-precedence bug a
naive textual find-and-replace macro would have.
