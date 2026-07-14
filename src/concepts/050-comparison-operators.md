---
concept: 050-comparison-operators
name: Comparison Operators
---

## Definition

Comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`) compare two values and
produce a boolean result describing their relationship.

## Problem

Decisions in a program (see Selection) almost always depend on comparing
something — is this value big enough, equal to that one, already seen before —
and comparison operators are what turn two values into the yes/no answer a
branch actually needs.

## Computer Science

`==` in most languages compares by value for primitives (are these two numbers
the same) but by reference for objects (are these two variables pointing at the
exact same object in memory) — the same operator, two different meanings
depending on what's being compared, a distinction covered fully in Object
Identity.

Tags: Value equality, Reference equality, Comparison semantics

## Software Engineering

A common, hard-to-spot bug is comparing values of subtly different types with
`==` in a language that allows loose comparison — JavaScript's `0 == '0'` being
`true` (implicit type conversion happens first) while `0 === '0'` is `false` (no
conversion, types must already match) is exactly this trap.

Tags: Loose vs strict equality, Type coercion bugs, Language-specific gotchas

## Common Mistakes

- Using `==` to compare floating-point numbers for exact equality — rounding error from earlier arithmetic can make two values that are "supposed" to be equal actually differ by a tiny fraction, so `==` returns `false` unexpectedly.
- In languages with loose (`==`) and strict (`===`) equality, defaulting to loose comparison out of habit and getting an implicit type conversion nobody intended.

## Exercises

- In the JavaScript example, compare `0 == '0'` and `0 === '0'` side by side and confirm they give different answers.
- In Python, compare two separately-constructed lists with the same contents using `==` and observe that it returns `True` — Python's `==` compares list contents, not identity.

## javascript

```javascript
console.log(5 > 3, 5 === 5, 0 == '0', 0 === '0')
```
Walkthrough: `===` (strict equality) requires both value and type to match,
while `==` (loose equality) converts types first — `0 == '0'` is `true` because
`'0'` is converted to `0` before comparing, but `0 === '0'` is `false` since a
number and a string are never the same type.

## python

```python
print(5 > 3, 5 == 5, [1, 2] == [1, 2])
```
Walkthrough: Python has only one equality operator, `==`, with no loose/strict
distinction like JavaScript's — for lists, and most built-in collection types,
`==` compares contents, so two separately built lists with the same elements
compare equal.

## java

```java
System.out.println(5 > 3);
System.out.println(5 == 5);
System.out.println("hi".equals("hi"));
```
Walkthrough: `==` on Java's primitives (like `int`) compares values directly,
but for objects (like `String`), `==` would compare references instead —
`.equals()` is what actually compares the string's contents, a distinction
explored fully in Object Identity.

## cpp

```cpp
std::cout << (5 > 3) << std::endl;
std::cout << (5 == 5) << std::endl;
std::cout << (std::string("hi") == std::string("hi")) << std::endl;
```
Walkthrough: unlike Java, C++'s `std::string` overloads `==` to compare
contents directly — no separate `.equals()`-style method needed, since C++ lets
a type define what `==` means for its own values.

## rust

```rust
println!("{}", 5 > 3);
println!("{}", 5 == 5);
println!("{}", "hi".to_string() == "hi".to_string());
```
Walkthrough: same as C++ — Rust's `String` implements the `PartialEq` trait, so
`==` compares contents directly, consistent with how `==` already behaves for
Rust's primitive types.
