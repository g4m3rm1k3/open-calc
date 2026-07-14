---
concept: 045-primitive-types
name: Primitive Types
---

## Definition

A primitive type is one of a language's built-in, most basic data types —
numbers, booleans, characters — that isn't built out of other types and is
usually handled directly by the hardware rather than through any user-defined
structure.

## Problem

Every other type in a program — objects, arrays, custom classes — is ultimately
built up out of some small set of basic building blocks. A language needs to
define what those most basic pieces are, since everything else is composed from
them.

## Computer Science

Primitive types typically map closely to how the hardware itself represents
data — a 32-bit integer really is 32 bits in memory, laid out in a form the
processor's arithmetic instructions operate on directly, unlike a user-defined
object, which is a higher-level construct the language runtime builds on top.

Tags: Value types, Memory layout, Hardware representation

## Software Engineering

Which types count as "primitive" differs by language and matters practically —
Java's primitives (`int`, `boolean`) are copied by value and can't be `null`,
while its object wrapper types (`Integer`, `Boolean`) behave differently;
JavaScript has no integer type at all, only one floating-point `number` type for
everything.

Tags: Value vs reference semantics, Type systems, Language design differences

## Common Mistakes

- Assuming every language has the same set of primitive types — JavaScript has no separate integer type, and Python's `int` has no fixed size limit at all, unlike Java's or C++'s fixed-width integers.
- Treating a primitive's wrapper/boxed type (Java's `Integer`) as identical to the primitive itself (`int`) — they behave differently around `null` and identity comparison.

## Exercises

- In the Java example, change `int` to `double` for `wholeNumber` and observe how the printed value changes shape.
- Compare C++'s `int` example to Rust's `i32` — both are 32-bit integers by default, just named differently.

## javascript

```javascript
const wholeNumber = 42
const decimal = 3.14
const flag = true
console.log(typeof wholeNumber, typeof decimal, typeof flag)
```
Walkthrough: JavaScript has no separate integer type — `42` and `3.14` are both
just `number`, one underlying floating-point representation for every numeric
value, unlike the other four languages here.

## python

```python
whole_number = 42
decimal = 3.14
flag = True
print(type(whole_number), type(decimal), type(flag))
```
Walkthrough: Python does distinguish `int` from `float`, unlike JavaScript — and
notably, Python's `int` has no fixed bit-width limit at all, unlike every other
language shown here.

## java

```java
int wholeNumber = 42;
double decimal = 3.14;
boolean flag = true;
System.out.println(wholeNumber + " " + decimal + " " + flag);
```
Walkthrough: Java's primitives (`int`, `double`, `boolean`) are fixed-size and
handled directly by the JVM — `int` is always exactly 32 bits, unlike Python's
arbitrary-size `int`.

## cpp

```cpp
int wholeNumber = 42;
double decimal = 3.14;
bool flag = true;
std::cout << wholeNumber << " " << decimal << " " << flag << std::endl;
```
Walkthrough: same primitive set as Java's — `int`, `double`, `bool` — mapped
directly to the hardware's native integer and floating-point representations,
with no runtime overhead beyond the raw bits themselves.

## rust

```rust
let whole_number: i32 = 42;
let decimal: f64 = 3.14;
let flag: bool = true;
println!("{} {} {}", whole_number, decimal, flag);
```
Walkthrough: Rust's primitive names are explicit about their size — `i32`
(32-bit signed integer), `f64` (64-bit float) — where Java and C++'s
`int`/`double` leave the exact width implied by convention rather than spelled
out in the type name itself.
