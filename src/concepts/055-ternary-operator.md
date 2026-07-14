---
concept: 055-ternary-operator
name: Ternary Operator
---

## Definition

The ternary operator is a compact, single-expression form of if/else —
`condition ? valueIfTrue : valueIfFalse` — that evaluates to one of two values
instead of running one of two blocks of statements.

## Problem

Choosing between two values to assign, return, or pass as an argument using a
full `if`/`else` statement requires several lines and a temporary variable
declared beforehand. The ternary operator expresses "pick one of these two
values based on this condition" as a single expression, usable anywhere a value
is expected.

## Computer Science

A ternary expression, unlike an `if`/`else` statement, always produces a value —
it's an expression, not a statement (see the Expression concept), which is
exactly why it can be used inline: as a function argument, inside a larger
expression, or directly in a return statement.

Tags: Expressions vs statements, Conditional expressions, Inline evaluation

## Software Engineering

A single, simple ternary (`isValid ? 'yes' : 'no'`) is usually more readable
than the equivalent `if`/`else`, but nesting ternaries inside each other trades
that readability away fast — most style guides recommend falling back to a full
`if`/`else` chain once a ternary would need to nest.

Tags: Readability, Nested ternaries, Code style

## Common Mistakes

- Nesting ternary operators several levels deep instead of using a full if/else chain — this saves lines at a real cost to how quickly a reader can parse the logic.
- Using a ternary purely for its side effects instead of an actual if/else statement — a ternary is for producing a value, not for choosing which side effect to run.

## Exercises

- In the JavaScript example, change the condition and confirm the ternary evaluates to the other branch.
- In Rust, compare the ternary-equivalent `if` expression's syntax to the other four languages' dedicated `?:` operator — Rust has no separate ternary syntax at all.

## javascript

```javascript
const age = 20
const status = age >= 18 ? 'adult' : 'minor'
console.log(status)
```
Walkthrough: `age >= 18 ? 'adult' : 'minor'` evaluates to one of the two string
values directly — no separate `if`/`else` statement or temporary variable
declared beforehand was needed to compute `status`.

## python

```python
age = 20
status = 'adult' if age >= 18 else 'minor'
print(status)
```
Walkthrough: Python has no `?:` symbol — its conditional expression reads more
like English (`value_if_true if condition else value_if_false`), but it plays
the exact same role as JavaScript's ternary operator.

## java

```java
int age = 20;
String status = age >= 18 ? "adult" : "minor";
System.out.println(status);
```
Walkthrough: identical `?:` syntax to JavaScript's — Java's ternary operator is
one of several pieces of C-style syntax shared almost character-for-character
between the two languages.

## cpp

```cpp
int age = 20;
std::string status = age >= 18 ? "adult" : "minor";
std::cout << status << std::endl;
```
Walkthrough: same `?:` syntax again — C++'s ternary operator is where this
exact syntax originated, later adopted by Java and JavaScript.

## rust

```rust
let age = 20;
let status = if age >= 18 { "adult" } else { "minor" };
println!("{}", status);
```
Walkthrough: Rust has no dedicated ternary operator at all — because `if` is
already an expression in Rust (see Blocks), a normal `if`/`else` can produce a
value directly, making a separate `?:` syntax unnecessary.
