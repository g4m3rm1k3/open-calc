---
concept: 004-expression
name: Expression vs Statement
---

## Definition

An expression is code that evaluates to a value (`2 + 2`, `isReady()`). A statement
is a complete instruction that performs an action but doesn't itself produce a
usable value (`if (x) { ... }`, `for (...) { ... }`).

## Problem

Not knowing which of your code is an expression and which is a statement leads to
real confusion: trying to use a statement where a value is expected, or writing an
expression as its own line and wondering why nothing happened with the result.

## Computer Science

Every expression, when evaluated, reduces to a single value — this is why
expressions can be nested inside other expressions (`2 + (3 * 4)`, the `3 * 4` is
itself an expression). Statements form the structure of a program — sequence,
selection, iteration — but a statement itself has no value to nest inside anything
else.

Tags: Evaluation, Expression nesting, Statement sequencing

## Software Engineering

Languages that treat more constructs as expressions (Rust's `if`, for example)
let you write more concise, assignment-free code — `let x = if cond { 1 } else { 2 }`
instead of a multi-line if/else with an assignment inside each branch. This is a
real design choice languages make differently, not a stylistic accident.

Tags: Language design, Conciseness, Functional style

## Common Mistakes

- Writing `if (x) { return a } else { return b }` and expecting to use it directly as a value — in JavaScript and Java, `if` is a statement, not an expression; you cannot write `let y = if (x) { a } else { b }`.
- Confusing a function call statement (ignoring its return value) with using that call as an expression elsewhere.

## Exercises

- In Python, try writing the conditional example as a plain `if`/`else` statement block instead of the ternary expression, and compare the two forms.
- Identify which lines in the Java example are statements and which sub-parts are expressions nested inside them.

## javascript

```javascript
const price = 10
const total = price > 5 ? price * 2 : price   // ternary — an expression
console.log(total)                             // console.log(...) here is a statement
```
Walkthrough: `price > 5 ? price * 2 : price` is a **ternary expression** — it
evaluates to a single value (`20`), which is why it can sit directly on the right
side of `=`. `console.log(total)` is a statement — calling it performs an action
(printing), but the statement itself has no value to assign anywhere.

## python

```python
price = 10
total = price * 2 if price > 5 else price   # conditional expression
print(total)
```
Walkthrough: Python's `X if condition else Y` is the expression form of a
conditional — it evaluates to one of two values, so it can be assigned directly,
exactly like JavaScript's ternary. Python's plain `if`/`else` block, by contrast,
is a statement and cannot be used as a value the same way.

## java

```java
int price = 10;
int total = price > 5 ? price * 2 : price;   // ternary — an expression
System.out.println(total);
```
Walkthrough: identical shape to JavaScript's ternary — `price > 5 ? price * 2 : price`
evaluates to one `int` value. Java's `if`/`else` (without the ternary form) is a
statement, the same restriction as JavaScript: you cannot assign the result of a
plain `if` block directly to a variable.
