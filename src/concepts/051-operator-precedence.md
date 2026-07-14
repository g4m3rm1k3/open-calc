---
concept: 051-operator-precedence
name: Operator Precedence
---

## Definition

Operator precedence is the set of rules determining which operator in an
expression with several of them gets evaluated first — the same rules behind
"multiplication before addition" in ordinary math.

## Problem

An expression like `2 + 3 * 4` is ambiguous without a fixed rule for which
operation happens first. Precedence removes that ambiguity so every reader —
and the compiler — evaluates the same expression the same way, every time.

## Execution

The expression is scanned for the highest-precedence operator present
↓
That operator, and its operands, is evaluated first, effectively collapsing
into a single value
↓
The process repeats on what remains, at progressively lower precedence, until
one value is left
↓
Parentheses override this entirely — whatever's inside them is always
evaluated first, regardless of the operators involved

## Computer Science

Precedence rules are what a parser uses to build the correct expression tree —
`2 + 3 * 4` parses as `2 + (3 * 4)`, not `(2 + 3) * 4`, because multiplication
has higher precedence, and that shape of tree is what actually gets evaluated.

Tags: Expression trees, Parsing, Grammar rules

## Software Engineering

Relying on memorized precedence rules for anything beyond the most common cases
(`*`/`/` before `+`/`-`) is a real readability risk — adding explicit
parentheses, even where they're not strictly required, often makes an
expression's actual evaluation order obvious at a glance instead of requiring
the reader to recall a rule.

Tags: Readability, Explicit parentheses, Code clarity

## Common Mistakes

- Assuming an unfamiliar operator's precedence matches intuition instead of checking — logical `&&` binds tighter than `||` in most languages, which can silently change a condition's actual meaning if parentheses aren't added.
- Writing a dense expression with several different operators and no parentheses, trusting every future reader to correctly recall the same precedence rules being relied on.

## Exercises

- In the JavaScript example, add parentheses around `3 * 4` and confirm the result is unchanged — the parentheses just make the existing evaluation order explicit.
- In Python, change `2 + 3 * 4` to `(2 + 3) * 4` and observe the result change from `14` to `20`.

## javascript

```javascript
console.log(2 + 3 * 4)
console.log((2 + 3) * 4)
```
Walkthrough: `3 * 4` is evaluated first (multiplication has higher precedence
than addition), giving `12`, then `2 + 12` gives `14`. Wrapping `2 + 3` in
parentheses overrides precedence entirely, forcing that addition to happen
first instead: `20`.

## python

```python
print(2 + 3 * 4)
print((2 + 3) * 4)
```
Walkthrough: identical precedence rules to JavaScript — multiplication before
addition by default, with parentheses always taking priority over both.

## java

```java
System.out.println(2 + 3 * 4);
System.out.println((2 + 3) * 4);
```
Walkthrough: same precedence rule again — `14` without parentheses, `20` with
them forcing the addition first. This particular rule (`*` before `+`) is
identical across nearly every mainstream language.

## cpp

```cpp
std::cout << (2 + 3 * 4) << std::endl;
std::cout << ((2 + 3) * 4) << std::endl;
```
Walkthrough: same result as the others — `14` then `20` — C++ follows the same
mathematical precedence convention every language here does for these
operators.

## rust

```rust
println!("{}", 2 + 3 * 4);
println!("{}", (2 + 3) * 4);
```
Walkthrough: same precedence rule one more time — `14` then `20` — this
particular ordering is close to universal across languages precisely because it
matches the math convention programmers already know.
