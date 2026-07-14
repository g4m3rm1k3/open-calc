---
concept: 040-comments
name: Comments
---

## Definition

A comment is text in source code that the compiler or interpreter ignores
entirely — written for the humans reading the code, not for the machine running
it.

## Problem

Code says *what* happens, but not always *why* — a non-obvious decision, a
workaround for a bug, a warning about a subtlety — and there needs to be a way
to record that context directly next to the code it explains, without that text
being treated as an actual instruction.

## Computer Science

Comments are stripped, or simply ignored, during parsing before the program's
actual meaning is determined — they have zero effect on what the program does,
which is exactly what makes them safe to add, remove, or get wrong without
breaking anything.

Tags: Lexical analysis, Parsing, Dead text

## Software Engineering

Good comments explain *why*, not *what* — code that's hard to read benefits more
from being rewritten clearly than from being explained with a comment on top of
it. The most valuable comments record a non-obvious constraint, a workaround, or
a decision that isn't visible in the code itself.

Tags: Code readability, Documentation, Maintainability

## Common Mistakes

- Writing a comment that just restates what the code already says clearly (`// increment i` above `i++`) — this adds noise without adding information.
- Letting a comment go stale after the code around it changes — an inaccurate comment is worse than no comment, since it actively misleads the next reader.

## Exercises

- In the JavaScript example, add a comment above the risky-looking line explaining *why* it's written that way, not what it does.
- Delete every comment from the Python example and confirm the program's behavior is completely unchanged when run.

## javascript

```javascript
// Rounds to 2 decimal places — toFixed() returns a string, so wrap in Number()
const price = Number((19.999).toFixed(2))
console.log(price)
```
Walkthrough: the comment explains a non-obvious detail — `toFixed()`'s string
return type — that isn't visible just from reading `Number((19.999).toFixed(2))`
itself. Removing the comment entirely wouldn't change what this program prints.

## python

```python
# Rounding here (not truncating) avoids underbilling by a cent on paid invoices
price = round(19.999, 2)
print(price)
```
Walkthrough: `#` starts a Python comment — this one records *why* `round` was
chosen over just cutting off extra digits, a decision that matters for
correctness but isn't visible in the code itself.

## java

```java
// Wrapped in BigDecimal to avoid floating-point rounding errors in currency math
java.math.BigDecimal price = new java.math.BigDecimal("19.999").setScale(2, java.math.RoundingMode.HALF_UP);
System.out.println(price);
```
Walkthrough: same `//` syntax as JavaScript — the comment explains why
`BigDecimal` was used instead of a plain `double`, a real, non-obvious tradeoff
in currency-handling code.

## cpp

```cpp
double zero = 0.0;
// NaN never equals itself, even when compared to its own variable — this looks
// like it must be true, but it isn't
double result = zero / zero;
std::cout << (result == result) << std::endl;
```
Walkthrough: the comment warns about a genuinely surprising IEEE-754 float fact
that the code alone (`result == result`) wouldn't communicate — this prints `0`
(false), not `1`, exactly because `NaN` never equals anything, including itself.

## rust

```rust
// format! rounds to even on a tie here (2 stays 2), not always up — matches
// Rust's default floating-point formatting behavior
println!("{:.0}", 2.5_f64);
```
Walkthrough: same idea as the others — the comment flags a subtlety about
Rust's specific rounding behavior in float formatting that the code alone
wouldn't communicate; this prints `2`, not `3`.
