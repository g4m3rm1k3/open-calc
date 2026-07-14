---
concept: 046-type-conversion
name: Type Conversion
---

## Definition

Type conversion is turning a value of one type into an equivalent value of
another type — a string `"42"` into the number `42`, or an integer into a
floating-point number — either automatically by the language or explicitly
requested by the programmer.

## Problem

Values of different types often need to interact — adding a number typed into a
form field (arriving as a string) to an actual number, or using an integer
somewhere a floating-point value is expected — and there has to be a defined way
to bridge between them.

## Execution

A value of one type is provided where a different type is expected or requested
↓
The language checks whether a conversion rule exists between the two types
↓
If an implicit rule exists, the value is converted automatically without the
programmer asking
↓
If no implicit rule exists, or the language requires it, the programmer must
call an explicit conversion, or the operation fails

## Computer Science

Conversion between types is either widening (int to float, no data lost) or
narrowing (float to int, some information discarded) — this distinction is why
languages are far more willing to convert automatically in one direction than
the other.

Tags: Implicit vs explicit conversion, Widening vs narrowing, Type coercion

## Software Engineering

Implicit conversion, or "coercion," is convenient but a common source of subtle
bugs — JavaScript's `'5' + 3` producing `'53'` instead of `8` surprises many
people precisely because the conversion happened silently. Explicit conversion,
while more verbose, makes the intent visible in the code itself.

Tags: Type coercion pitfalls, Explicit conversion, Debuggability

## Common Mistakes

- Relying on implicit conversion between very different types (string and number) without realizing it happened — a common source of bugs that only show up with certain input values.
- Converting a floating-point value to an integer and assuming it rounds — most languages truncate (cut off the decimal) by default instead, a different result for negative numbers especially.

## Exercises

- In the JavaScript example, change `'5' + 3` to `'5' - 3` and predict the output — subtraction doesn't have string concatenation to fall back on, so the string gets converted to a number instead.
- In Java, reason about what would happen if the explicit `(int)` cast were removed entirely.

## javascript

```javascript
const combined = '5' + 3
const converted = Number('5') + 3
console.log(combined, converted)
```
Walkthrough: `+` between a string and a number implicitly converts the number
to a string and concatenates — `'53'`. `Number('5')` explicitly converts the
string to a number first, so the second line does real addition instead: `8`.

## python

```python
combined = '5' + str(3)
converted = int('5') + 3
print(combined, converted)
```
Walkthrough: Python is stricter than JavaScript here — `'5' + 3` would actually
raise a `TypeError` rather than implicitly converting, so both sides of this
example use explicit conversion (`str()`, `int()`) instead of relying on any
automatic coercion.

## java

```java
double price = 19.99;
int wholeDollars = (int) price;
System.out.println(wholeDollars);
```
Walkthrough: `(int)` is an explicit cast — without it, Java's compiler rejects
assigning a `double` to an `int` variable outright, since that conversion loses
information. The cast truncates, not rounds: `19.99` becomes `19`, not `20`.

## cpp

```cpp
double price = 19.99;
int wholeDollars = static_cast<int>(price);
std::cout << wholeDollars << std::endl;
```
Walkthrough: `static_cast<int>` is C++'s explicit conversion syntax — same
truncating behavior as Java's cast: `19.99` becomes `19`.

## rust

```rust
let price: f64 = 19.99;
let whole_dollars = price as i32;
println!("{}", whole_dollars);
```
Walkthrough: `as i32` is Rust's explicit conversion syntax — Rust never converts
between numeric types implicitly at all, even between an `i32` and an `i64`;
every conversion has to be written out with `as`.
