---
concept: 001-type
name: Type
---

## Definition

A type describes what kind of value something is, and therefore what operations
are valid on it — a number can be added, a string can be concatenated, a boolean
can be branched on.

## Problem

Without types, nothing stops code from trying an operation that makes no sense for
the value it actually has — adding a number to a list, calling a string as a
function. Types exist so those mistakes can be caught, either before the program
ever runs (static typing) or the moment they happen (dynamic typing), instead of
producing silently wrong results.

## Computer Science

A type is a set of possible values plus the operations defined over them. Static
typing checks that every operation matches its operand's type at compile time,
before the program runs. Dynamic typing checks at the moment each operation
actually executes, at runtime.

Tags: Static typing, Dynamic typing, Type checking, Type safety

## Software Engineering

Static types catch a whole category of bugs before code ever ships, at the cost of
writing type annotations and satisfying the compiler. Dynamic types are faster to
write and more flexible, at the cost of some type errors only surfacing when that
exact code path finally runs — sometimes in production, on an input nobody tested.

Tags: Compile-time safety, Runtime errors, Developer velocity

## Common Mistakes

- Assuming a dynamically-typed language has "no types" — every value still has a type; the language just doesn't check it until the operation runs.
- Comparing values of different types and expecting an error — several languages silently coerce instead (`"5" == 5` is `true` in JavaScript's `==`).

## Exercises

- In the Python example, change `age` to a string and predict what `age + 1` does.
- In the TypeScript example, try assigning a string to the `number`-typed variable and read the compiler error.

## javascript

```javascript
let age = 25          // number
age = "twenty-five"   // allowed — JavaScript is dynamically typed
console.log(typeof age)
```
Walkthrough: `age` starts as a number. Reassigning it to a string is completely
legal — JavaScript never checks that a variable keeps the same type. `typeof age`
reports whatever type the value currently holds, `"string"` after the reassignment,
not whatever it started as.

## typescript

```typescript
let age: number = 25
age = "twenty-five"   // compile error: Type 'string' is not assignable to type 'number'
```
Walkthrough: the `: number` annotation tells the compiler `age` must always hold a
number. The reassignment is caught **before the program ever runs** — this is
static typing: the error exists at compile time, not as something that only shows
up if that exact line executes.

## python

```python
age = 25          # int
age = "twenty-five"   # allowed — Python is dynamically typed
print(type(age))
```
Walkthrough: like JavaScript, Python never locks a variable to its first type.
`type(age)` reports the CURRENT type, `<class 'str'>` after reassignment. Python's
optional type hints (`age: int = 25`) look similar to TypeScript's annotations but
are not enforced at runtime by the language itself — a separate tool (`mypy`) has
to check them; Python itself will happily run this reassignment.
