---
concept: 054-pattern-matching
name: Pattern Matching
---

## Definition

Pattern matching compares a value against a set of shapes or structures — not
just simple equality — and can simultaneously destructure that value into named
parts if it matches, going well beyond what a basic switch statement can
express.

## Problem

Some data has an internal shape — an array with a specific length, a value that
could be one of several distinct variants — and checking "does this value have
this exact shape, and if so, give me its parts" with a chain of manual `if`
checks and indexing is verbose and error-prone. Pattern matching expresses the
check and the extraction in one step.

## Execution

A value is compared against each pattern in order
↓
A pattern can match on more than just equality — a value's shape, its type, or
a combination with a guard condition
↓
The first pattern that matches wins, and any parts of the value the pattern
named are bound to those names immediately
↓
The code associated with that matching pattern runs, with the destructured
names available inside it

## Computer Science

Pattern matching is closely related to type theory's sum types — also called
tagged unions — a value that could be one of several distinct shapes.
Exhaustiveness checking, where a compiler verifies every possible shape has
been handled, is only possible when the compiler knows the complete, closed set
of shapes a value could take, which is exactly what a sum type guarantees.

Tags: Sum types, Exhaustiveness checking, Destructuring, Control flow

## Software Engineering

Exhaustive pattern matching turns a class of bugs — "I added a new variant but
forgot to handle it somewhere" — into a compile-time error instead of a silent
runtime gap, which is a major reason languages with a proper enum/pattern-
matching combination are often preferred for representing "one of several known
cases" over a loose set of booleans or string tags.

Tags: Exhaustiveness, Type safety, API design

## Common Mistakes

- Reaching for pattern matching's full destructuring power when a simple equality check would already be clear and sufficient — added structure without added clarity is its own kind of complexity.
- Assuming a language's pattern matching is exhaustive when it isn't — JavaScript and Python's simpler matching won't warn about an unhandled case the way Rust's compiler-enforced exhaustiveness does.

## Exercises

- In the Rust example, add a third shape to the slice patterns being matched and observe the compiler complain if a case is left unhandled.
- In Python, change the destructured `case [x, y]:` pattern to `case [x, y, z]:` and predict what happens when it's matched against a two-element list.

## javascript

```javascript
const point = [3, 4]
const [x, y] = point
if (point.length === 2) {
  console.log(`2D point: (${x}, ${y})`)
}
```
Walkthrough: JavaScript has no real pattern matching statement — `const [x, y] = point`
is array destructuring, which extracts parts of a known shape but doesn't
branch on which shape it is; the shape has to be checked separately, by hand,
with `point.length === 2`.

## python

```python
point = [3, 4]
match point:
    case [x, y]:
        print(f'2D point: ({x}, {y})')
    case [x, y, z]:
        print(f'3D point: ({x}, {y}, {z})')
    case _:
        print('Unknown shape')
```
Walkthrough: Python's `match` genuinely pattern-matches — `case [x, y]:` both
checks that `point` has exactly two elements *and* binds them to `x` and `y` in
one step, unlike JavaScript's version, which needed a separate length check.

## java

```java
Object point = new int[]{3, 4};
if (point instanceof int[] p && p.length == 2) {
    System.out.println("2D point: (" + p[0] + ", " + p[1] + ")");
}
```
Walkthrough: `instanceof` with a pattern variable (`int[] p`) is Java's more
recent step toward pattern matching — it checks the type and binds `p` to it in
one expression, though it's still less powerful than Rust's or Python's `match`.

## cpp

```cpp
std::vector<int> point = {3, 4};
if (point.size() == 2) {
    std::cout << "2D point: (" << point[0] << ", " << point[1] << ")" << std::endl;
}
```
Walkthrough: C++ has no pattern matching construct for this at all — the shape
check (`point.size() == 2`) and the extraction (`point[0]`, `point[1]`) are two
completely separate manual steps, the most manual of all five languages shown
here.

## rust

```rust
let point = vec![3, 4];
match point.as_slice() {
    [x, y] => println!("2D point: ({}, {})", x, y),
    [x, y, z] => println!("3D point: ({}, {}, {})", x, y, z),
    _ => println!("Unknown shape"),
}
```
Walkthrough: Rust's `match` on a slice pattern both checks the exact length and
destructures it in one step, and the compiler verifies every possible shape is
handled by the catch-all `_` arm — an unhandled case would be a compile error,
not a runtime gap.
