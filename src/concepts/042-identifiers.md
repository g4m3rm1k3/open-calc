---
concept: 042-identifiers
name: Identifiers
---

## Definition

An identifier is the name given to something in a program — a variable, a
function, a class — so it can be referred to elsewhere by that name instead of
by its value directly.

## Problem

Referring to a value only by rewriting it in full every time would make a
program unreadable and impossible to update in one place. An identifier gives a
value, a function, or a piece of logic a stable, meaningful name that can be
reused and changed once wherever it's needed.

## Computer Science

An identifier is resolved by the compiler or interpreter to whatever it's
currently bound to in scope (see Scope) — the same identifier text can refer to
entirely different values in different parts of a program, resolved based on
where it's looked up, not by the text itself.

Tags: Name resolution, Scope, Symbol tables

## Software Engineering

A well-chosen identifier name (`daysUntilExpiry` instead of `d`) is one of the
cheapest, highest-value things a programmer can do for a codebase's readability
— the cost of typing a longer name is paid once; the cost of a cryptic one is
paid by every future reader.

Tags: Naming conventions, Readability, Self-documenting code

## Common Mistakes

- Choosing a short, vague identifier (`x`, `data`, `temp`) for something that will be read many more times than it's written — the time saved typing it is far outweighed by the time lost by every future reader guessing its purpose.
- Reusing the same identifier for two conceptually different things in the same scope, relying on the language to keep them straight — this compiles but confuses readers who can't tell at a glance which one is meant.

## Exercises

- In the JavaScript example, rename `secondsRemaining` to `s` everywhere and compare how much harder the code is to follow with no other changes at all.
- In Python, reason about what would happen if two different variables in the same function were both named `total`.

## javascript

```javascript
const secondsRemaining = 90
const minutes = Math.floor(secondsRemaining / 60)
console.log(minutes)
```
Walkthrough: `secondsRemaining` and `minutes` are identifiers — meaningful names
standing in for their values. Nothing about how this runs would change if they
were named `x` and `y` instead, but a reader's ability to understand it at a
glance would.

## python

```python
seconds_remaining = 90
minutes = seconds_remaining // 60
print(minutes)
```
Walkthrough: same identifiers, following Python's `snake_case` naming
convention instead of JavaScript's `camelCase` — a style difference, not a
functional one.

## java

```java
int secondsRemaining = 90;
int minutes = secondsRemaining / 60;
System.out.println(minutes);
```
Walkthrough: same idea, with Java additionally requiring each identifier's type
to be declared once, right where it's introduced.

## cpp

```cpp
int secondsRemaining = 90;
int minutes = secondsRemaining / 60;
std::cout << minutes << std::endl;
```
Walkthrough: identical shape to Java's version — identifiers, once declared with
a type, can be used anywhere later in the same scope.

## rust

```rust
let seconds_remaining = 90;
let minutes = seconds_remaining / 60;
println!("{}", minutes);
```
Walkthrough: same idea again, following Rust's `snake_case` convention — the
identifier `seconds_remaining` is resolved to its bound value everywhere it's
used below its declaration.
