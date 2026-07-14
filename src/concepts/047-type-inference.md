---
concept: 047-type-inference
name: Type Inference
---

## Definition

Type inference is a language determining a value's type automatically from
context — usually from the value assigned to it — instead of requiring the
programmer to write the type out explicitly.

## Problem

Writing out every variable's type explicitly, every time, is often redundant —
the type is already obvious from the value being assigned. Type inference lets
a statically typed language keep its compile-time type checking without forcing
that repetition.

## Computer Science

Type inference doesn't remove static typing — the compiler still determines a
single, fixed type for the variable, exactly as if it had been written
explicitly. Inference only changes *who* writes the type down: the compiler,
deriving it from the initializer, instead of the programmer.

Tags: Static typing, Compile-time analysis, Type checking

## Software Engineering

Inferred types keep code concise without sacrificing the safety of static
typing, but can occasionally make a signature harder to read at a glance — a
result assigned with an inferred type doesn't show its type at the point of use
the way an explicit annotation would.

Tags: Readability tradeoffs, Static typing, Code conciseness

## Common Mistakes

- Assuming type inference means a variable can hold any type later — once inferred, the type is fixed, same as if it had been declared explicitly; reassigning to a different type is still a compile error.
- Relying on inference where the inferred type isn't actually what's needed — most languages let you add an explicit annotation exactly when inference guesses wrong.

## Exercises

- In the Rust example, reason about why reassigning `count` to a string afterward would be a compile error, even though no type was ever written explicitly.
- In Java, replace `var` with the explicit type `int` and confirm the code behaves identically either way.

## javascript

```javascript
let count = 5
count = 'now a string'
console.log(count)
```
Walkthrough: JavaScript has no static type inference to speak of — there's no
compile-time type being determined at all, since `count` isn't restricted to any
single type in the first place. This reassignment to a completely different
type is legal and runs without error, unlike the statically typed languages
below.

## python

```python
count = 5
count = 'now a string'
print(count)
```
Walkthrough: same as JavaScript — Python is dynamically typed, so there's no
static type inference happening; `count` simply gets rebound to whatever value
it's assigned, with no compile-time type ever fixed in place.

## java

```java
var count = 5;
System.out.println(count);
```
Walkthrough: `var` tells the compiler to infer `count`'s type from its
initializer — `5` is an `int` literal, so `count` is statically typed as `int`,
exactly as if `int count = 5;` had been written. Unlike the dynamic languages
above, reassigning `count` to a string afterward would be a compile error.

## cpp

```cpp
auto count = 5;
std::cout << count << std::endl;
```
Walkthrough: `auto` is C++'s inference keyword — `count` is deduced as `int`
from the literal `5`, fixed at compile time exactly like Java's `var`.

## rust

```rust
let count = 5;
println!("{}", count);
```
Walkthrough: Rust infers `count`'s type (`i32` by default for an integer
literal) without any keyword at all — `let` alone triggers inference; no `auto`
or `var` needed, but the type is just as fixed at compile time as in Java or C++.
