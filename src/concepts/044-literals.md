---
concept: 044-literals
name: Literals
---

## Definition

A literal is a value written directly into source code exactly as it is — `42`,
`"hello"`, `true` — rather than computed or referred to by a variable name.

## Problem

Every program needs some starting values to actually compute with. A literal is
how a fixed, known value gets written directly into the code itself, as opposed
to a value that only exists after some computation or comes from outside the
program.

## Computer Science

A literal's type is usually determined by its own form — `42` is an integer
literal, `42.0` a floating-point one, `"42"` a string literal — the same
characters, three completely different types, distinguished entirely by how
they're written.

Tags: Type inference, Lexical tokens, Literal syntax

## Software Engineering

Repeating the same literal value in many places in a codebase — a timeout of
`3000` written directly in ten different files — makes it easy to update nine
of them and miss the tenth. Giving that literal a named constant (see the
Constant concept) in one place instead avoids that class of bug entirely.

Tags: Magic numbers, Maintainability, Named constants

## Common Mistakes

- Using an unexplained literal value ("magic number") directly in logic (`if (status == 3)`) instead of a named constant — a reader has no way to know what `3` means without digging elsewhere.
- Confusing a numeric literal with a string literal that looks like a number (`"42"` vs `42`) — they behave completely differently in arithmetic and comparisons.

## Exercises

- In the JavaScript example, remove the quotes around `'Alex'` so it's no longer a valid string literal and reason about why it would fail to parse.
- In Python, add a `None` literal to the printed values and observe its type.

## javascript

```javascript
const age = 30
const name = 'Alex'
const isActive = true
console.log(typeof age, typeof name, typeof isActive)
```
Walkthrough: `30`, `'Alex'`, and `true` are all literals — values written
directly into the code. `typeof` confirms each one's type is decided purely by
how it was written: digits without quotes are a number, quoted text is a
string, `true`/`false` are booleans.

## python

```python
age = 30
name = 'Alex'
is_active = True
print(type(age), type(name), type(is_active))
```
Walkthrough: same three literal forms — Python's `type()` shows each literal
resolved to `int`, `str`, and `bool` respectively, based purely on how each was
written.

## java

```java
int age = 30;
String name = "Alex";
boolean isActive = true;
System.out.println(age + " " + name + " " + isActive);
```
Walkthrough: same three literals, but Java requires each variable's type to be
declared explicitly rather than inferred purely from the literal's form the way
Python and JavaScript do.

## cpp

```cpp
int age = 30;
std::string name = "Alex";
bool isActive = true;
std::cout << age << " " << name << " " << isActive << std::endl;
```
Walkthrough: same shape as Java — three literals, each requiring its variable's
type declared up front. Printing `isActive` shows `1`, not `true` — C++'s
`std::cout` prints booleans as `0`/`1` by default.

## rust

```rust
let age = 30;
let name = "Alex";
let is_active = true;
println!("{} {} {}", age, name, is_active);
```
Walkthrough: same three literal forms — Rust infers each variable's type from
its literal (see Type Inference), so no explicit type annotation is needed here
even though Rust is statically typed.
