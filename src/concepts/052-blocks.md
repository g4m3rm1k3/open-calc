---
concept: 052-blocks
name: Blocks
---

## Definition

A block is a group of statements treated as a single unit, usually delimited by
braces `{ }` or indentation, that defines a shared scope and executes together
as one sequence.

## Problem

Constructs like `if`, loops, and function bodies often need to run more than
one statement as a group, not just one. A block is what lets several statements
be treated as a single cohesive unit wherever one statement's worth of code is
expected.

## Execution

Execution enters the block at its opening delimiter
↓
Each statement inside runs in order, top to bottom
↓
Any variable declared inside the block exists only for the block's duration —
it's gone once execution leaves
↓
Execution exits at the block's closing delimiter and continues with whatever
comes after it

## Computer Science

A block defines a new scope (see Scope) — a variable declared inside one is not
visible outside it, which is what allows the same variable name to be safely
reused in two different blocks without them interfering with each other.

Tags: Scope, Lexical blocks, Variable shadowing

## Software Engineering

Deeply nested blocks — an `if` inside a loop inside another `if`, several
layers deep — are a well-known readability problem; extracting an inner block
into its own named function is one of the most common refactors for making that
kind of code easier to follow.

Tags: Nesting depth, Readability, Refactoring

## Common Mistakes

- Assuming a variable declared inside a block is accessible after the block ends — in most block-scoped languages, it's already out of scope the moment the closing delimiter is reached.
- Writing deeply nested blocks instead of extracting inner logic into a separate, named function — each added level of nesting makes the code meaningfully harder to trace.

## Exercises

- In the JavaScript example, reason about why logging `message` outside the `if` block would fail — it was only ever in scope inside the block that declared it.
- In Python, compare how a block is delimited (indentation) to how the other four languages delimit theirs (braces) — same concept, very different visual syntax.

## javascript

```javascript
if (true) {
  const message = 'inside the block'
  console.log(message)
}
```
Walkthrough: everything between `{` and `}` is one block — `message` is
declared and used entirely within it, and doesn't exist at all outside those
braces.

## python

```python
if True:
    message = 'inside the block'
    print(message)
```
Walkthrough: Python has no braces at all — indentation itself delimits the
block. The same idea as the brace-based languages, expressed through
whitespace instead of punctuation.

## java

```java
if (true) {
    String message = "inside the block";
    System.out.println(message);
}
```
Walkthrough: same brace-delimited block as JavaScript's — `message` is scoped
entirely to the lines between `{` and `}`.

## cpp

```cpp
if (true) {
    std::string message = "inside the block";
    std::cout << message << std::endl;
}
```
Walkthrough: identical shape to Java's — a block's braces define both where its
statements run together and the scope boundary for anything declared inside.

## rust

```rust
if true {
    let message = "inside the block";
    println!("{}", message);
}
```
Walkthrough: same brace-delimited block once more — in Rust, a block is
actually an expression itself (it can produce a value), a detail unique among
these five languages, though this particular block is just used for its
statements, not its value.
