---
concept: 049-arithmetic-operators
name: Arithmetic Operators
---

## Definition

Arithmetic operators (`+`, `-`, `*`, `/`, `%`) perform mathematical computation
on numeric values, producing a new numeric result.

## Problem

Nearly every program needs to compute with numbers — totals, averages,
positions — and arithmetic operators are the basic building blocks every one of
those computations is built from.

## Computer Science

Integer division and floating-point division are genuinely different
operations at the hardware level, not just a stylistic choice — `/` between two
integers in several languages here discards the remainder entirely, producing a
different answer than the same division done with floating-point numbers.

Tags: Integer vs floating-point arithmetic, Truncation, Numeric precision

## Software Engineering

Relying on integer division where floating-point precision was actually needed
is a common, easy-to-miss bug — `5 / 2` silently producing `2` instead of `2.5`
in a language that does integer division by default can quietly corrupt a
calculation with no error or warning at all.

Tags: Integer division pitfalls, Precision bugs, Silent truncation

## Common Mistakes

- Dividing two integers and expecting a fractional result — several languages (Java, C++, Rust) perform integer division by default, truncating any remainder, unless at least one operand is explicitly a floating-point value.
- Forgetting that `%` (modulo/remainder) can return a negative result for a negative left-hand operand in some languages, unlike Python's version, which always returns a result with the same sign as the divisor.

## Exercises

- In the Java example, change `7 / 2` to `7.0 / 2` and observe the result change from `3` to `3.5`.
- In Python, compute `-7 % 3` and compare it to what the same expression produces in Java — the sign convention differs between the two languages.

## javascript

```javascript
console.log(7 + 2, 7 - 2, 7 * 2, 7 / 2, 7 % 2)
```
Walkthrough: JavaScript has only one numeric type, so `7 / 2` always produces a
real floating-point result (`3.5`) — there's no separate integer division to
fall into by accident the way there is in several other languages.

## python

```python
print(7 + 2, 7 - 2, 7 * 2, 7 / 2, 7 % 2)
```
Walkthrough: Python's `/` always does true floating-point division (`3.5`),
just like JavaScript's — Python has a *separate* operator, `//`, specifically
for integer (floor) division, so the truncating behavior is opt-in, not the
default.

## java

```java
System.out.println((7 + 2) + " " + (7 - 2) + " " + (7 * 2) + " " + (7 / 2) + " " + (7 % 2));
```
Walkthrough: `7 / 2` here is integer division — both operands are `int`, so the
result truncates to `3`, discarding the `.5` entirely. Making either operand a
`double` (`7.0 / 2`) would produce `3.5` instead.

## cpp

```cpp
std::cout << (7 + 2) << " " << (7 - 2) << " " << (7 * 2) << " " << (7 / 2) << " " << (7 % 2) << std::endl;
```
Walkthrough: same integer-division behavior as Java's — `7 / 2` truncates to
`3`, since both operands are `int`; C++ follows the same "integer in, integer
out" rule.

## rust

```rust
println!("{} {} {} {} {}", 7 + 2, 7 - 2, 7 * 2, 7 / 2, 7 % 2);
```
Walkthrough: same truncating integer division as Java and C++ — `7 / 2` is `3`,
since Rust's integer literals default to `i32`; using `7.0 / 2.0` instead would
produce a floating-point `3.5`.
