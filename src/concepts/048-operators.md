---
concept: 048-operators
name: Operators
---

## Definition

An operator is a symbol that performs an operation on one or more values — `+`,
`!`, `==` — combining or transforming them into a new value.

## Problem

Writing every computation as an explicit function call (`add(a, b)` for every
addition) would be extremely verbose for the most common operations. Operators
give the most frequently used operations compact, familiar symbolic notation
instead.

## Computer Science

Every operator has an arity — how many values it operates on. Unary operators
like `!` act on one value; binary operators like `+` act on two. Under the hood,
most operators are really just functions with special syntax; some languages
even let user-defined types customize what an operator does to them.

Tags: Operator arity, Operator overloading, Syntax sugar

## Software Engineering

Overusing "clever" operator combinations in a single expression trades a small
amount of typing for a real cost in readability — a line packed with several
operators at once often takes more time to mentally parse than the equivalent
written across a few named steps.

Tags: Readability, Operator overloading, Code clarity

## Common Mistakes

- Chaining too many operators into one dense expression instead of breaking it into named intermediate steps — technically correct, but much harder for the next reader to verify at a glance.
- Assuming an operator behaves identically across languages — `+` concatenates strings in JavaScript and Python but requires explicit conversion elsewhere, and division behaves differently by language too (see Arithmetic Operators).

## Exercises

- In the JavaScript example, change `!isValid` to `isValid` and observe the boolean flip.
- In Python, add the comparison operator `!=` to the same set of expressions and predict its result.

## javascript

```javascript
const isValid = true
const count = 3
console.log(!isValid, count + 1, count === 3)
```
Walkthrough: `!` is a unary operator (one value in, its negation out), `+` is
binary (two values combined), and `===` is a comparison operator (two values
in, a boolean out) — three different operators, three different arities, all
producing a new value from the ones given.

## python

```python
is_valid = True
count = 3
print(not is_valid, count + 1, count == 3)
```
Walkthrough: same three operations — Python spells the logical negation
operator as the word `not` instead of a symbol, but it plays the exact same
unary role as JavaScript's `!`.

## java

```java
boolean isValid = true;
int count = 3;
System.out.println(!isValid);
System.out.println(count + 1);
System.out.println(count == 3);
```
Walkthrough: identical three operators to JavaScript's — `!`, `+`, `==` — with
Java's static typing meaning each operand's type is already fixed and checked
at compile time.

## cpp

```cpp
bool isValid = true;
int count = 3;
std::cout << !isValid << std::endl;
std::cout << count + 1 << std::endl;
std::cout << (count == 3) << std::endl;
```
Walkthrough: same operators again — C++ additionally allows user-defined types
to overload most of these operators (`operator+`, `operator==`) to give them
custom meaning for a programmer's own classes, something neither JavaScript nor
Java's built-in operators support for user types.

## rust

```rust
let is_valid = true;
let count = 3;
println!("{}", !is_valid);
println!("{}", count + 1);
println!("{}", count == 3);
```
Walkthrough: same three operators — Rust, like C++, lets user-defined types
implement traits (`Not`, `Add`, `PartialEq`) to customize exactly what each
operator does when applied to them.
