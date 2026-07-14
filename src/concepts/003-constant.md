---
concept: 003-constant
name: Constant
---

## Definition

A constant is a named value that cannot be reassigned after it's first set —
the name always refers to the same value for its entire lifetime.

## Problem

Some values should never change once set — a tax rate loaded from config, a
mathematical constant, a maximum retry count. Using a regular variable for these
leaves the door open for some later line of code to accidentally reassign it;
a constant makes that a compile-time or immediate runtime error instead of a
silent bug.

## Computer Science

Declaring a binding as constant is a compiler- or runtime-enforced invariant: once
established, the name-to-value binding cannot change. This doesn't necessarily mean
the *value itself* is immutable (see Immutability) — a `const` array in JavaScript
still allows its contents to be modified; only the variable's reference is locked.

Tags: Invariants, Immutability vs. constant binding, Compile-time enforcement

## Software Engineering

Defaulting to constants and only using a mutable variable when reassignment is
genuinely needed makes code easier to reason about — a reader of `const maxRetries = 3`
knows, without reading the rest of the function, that this value is fixed for its
entire scope.

Tags: Immutability by default, Reasoning about code, Configuration values

## Common Mistakes

- Assuming a constant object or array is fully immutable — in JavaScript, `const user = {}` still allows `user.name = 'Alice'`; only reassigning `user` itself (`user = {}`) is blocked.
- Declaring everything as a mutable variable "just in case," instead of defaulting to constant and only relaxing it when reassignment is actually required.

## Exercises

- In the JavaScript example, try mutating a property of the const object, then try reassigning the const variable itself, and compare what happens.
- In Java, try reassigning a `final` variable and read the compiler error.

## javascript

```javascript
const MAX_RETRIES = 3
console.log(MAX_RETRIES)
// MAX_RETRIES = 5   // would throw: Assignment to constant variable.
```
Walkthrough: `const` locks the binding — `MAX_RETRIES` can never be reassigned
after this line. Attempting `MAX_RETRIES = 5` throws a `TypeError` at the moment
that line runs, not at compile time (JavaScript has no separate compile step that
would catch it earlier).

## python

```python
MAX_RETRIES = 3   # convention only — Python has no real constants
print(MAX_RETRIES)
MAX_RETRIES = 5    # allowed! Python does not enforce this at all
print(MAX_RETRIES)
```
Walkthrough: Python has no language-level constant mechanism. `MAX_RETRIES = 5`
succeeds without error or warning — the ALL_CAPS naming is a convention that tells
other developers "treat this as fixed," enforced by nobody but the reader's
discipline. This is a real, meaningful difference from JavaScript and Java, not
just a syntax variant.

## java

```java
final int MAX_RETRIES = 3;
System.out.println(MAX_RETRIES);
// MAX_RETRIES = 5;   // compile error: cannot assign a value to final variable
```
Walkthrough: `final` is Java's constant keyword. Unlike Python's convention-only
approach, this is enforced by the compiler — attempting to reassign `MAX_RETRIES`
anywhere in the file fails to compile at all, before the program ever runs.
