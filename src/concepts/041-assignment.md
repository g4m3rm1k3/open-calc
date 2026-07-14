---
concept: 041-assignment
name: Assignment
---

## Definition

Assignment is the operation that binds a value to a variable's name — storing
that value so it can be referred to later by that name.

## Problem

A computed value used only once doesn't need a name, but almost every useful
program needs to keep a value around to use again later, or give a meaningful
name to something that would otherwise be an unreadable expression. Assignment
is what makes that possible.

## Execution

The expression on the right-hand side is evaluated first, all the way down to a
single value
↓
That value is stored in memory
↓
The variable name on the left is bound to that stored value
↓
Any later use of that name retrieves the value that was stored

## Computer Science

Assignment is fundamentally different from mathematical equality, even though
`=` is used for it in most languages — `x = x + 1` is nonsensical as an equation
but perfectly normal as an assignment: evaluate the right side using `x`'s
current value, then overwrite `x` with the result.

Tags: Mutable state, Evaluation order, Variable binding

## Software Engineering

Reassigning a variable to a value of a completely different kind — using the
same name for a number, then later a string — is legal in dynamically typed
languages but makes code harder to follow. A reader can no longer trust that a
variable's type stays consistent throughout its lifetime.

Tags: Readability, Type consistency, Dynamic typing risks

## Common Mistakes

- Confusing `=` (assignment) with `==` (comparison) — writing `if (x = 5)` in a language that allows it silently assigns 5 to `x` instead of checking whether `x` equals 5.
- Assuming `a = b` makes `a` and `b` permanently linked — after the assignment, `a` holds whatever `b`'s value was at that moment; changing `b` afterward doesn't change `a` for value types (see Mutability and Copy vs Reference for object behavior).

## Exercises

- In the JavaScript example, change `count = count + 1` to `count += 1` and confirm it does exactly the same thing.
- In Rust, remove the `mut` keyword and observe the compiler reject the reassignment — Rust requires explicitly opting in to a variable being reassignable at all.

## javascript

```javascript
let count = 1
count = count + 1
console.log(count)
```
Walkthrough: `count + 1` is evaluated first using `count`'s current value (1),
producing 2 — only then is `count` reassigned to that new value. The right side
is always evaluated completely before the assignment happens.

## python

```python
count = 1
count = count + 1
print(count)
```
Walkthrough: identical evaluation order — Python computes `count + 1` using the
current value of `count` first, then binds the name `count` to the new result.

## java

```java
int count = 1;
count = count + 1;
System.out.println(count);
```
Walkthrough: same right-side-first evaluation — Java additionally requires
`count`'s type (`int`) to be declared once, and every later assignment must
produce a value of that same type.

## cpp

```cpp
int count = 1;
count = count + 1;
std::cout << count << std::endl;
```
Walkthrough: identical to Java's version — `count`'s type is fixed at
declaration, and `count + 1` is fully evaluated before being stored back into
`count`.

## rust

```rust
let mut count = 1;
count = count + 1;
println!("{}", count);
```
Walkthrough: Rust variables are immutable by default — the `mut` keyword is
required here specifically because `count` is reassigned; without it, this
exact code would be a compile error, not a runtime one.
