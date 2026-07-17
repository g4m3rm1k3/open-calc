---
concept: 232-guard-statements
name: Guard Statements (Swift)
---

## Definition

A `guard` statement checks a condition and, if it's FALSE, requires an
early exit (`return`, `break`, `continue`, or `throw`) from the current
scope — commonly paired with `guard let` to safely unwrap an Optional,
exiting early if it's `nil`, letting the REST of the function assume the
unwrapped value is valid without further nesting.

## Problem

Using `if let` for a required Optional value forces the "happy path"
code inside a NESTED block, and if a function needs to check several such
conditions in sequence, the nesting gets progressively deeper ("pyramid
of doom"). `guard let` inverts this — it checks the condition and exits
EARLY if it fails, letting the unwrapped value be used directly in the
REST of the function's TOP-LEVEL flow, with no extra nesting.

## Execution

`guard let unwrapped = name else { ...; return }` — if the optional is
`nil`, the `else` branch runs and MUST exit the function — if it has a
value, the unwrapped variable becomes available for the REST of the
function, un-nested
↓
Compare to the `if let` equivalent — functionally similar for ONE check,
but nesting grows with EACH additional condition, unlike `guard`'s flat
structure
↓
The Swift compiler ENFORCES that a `guard`'s `else` block must exit the
current scope — forgetting a `return`/`throw`/`break`/`continue` inside
it is a COMPILE ERROR, not a bug that could silently fall through

## Computer Science

`guard` is specifically designed around the "fail fast, then proceed
with confidence" control-flow pattern — by REQUIRING the failure branch
to exit, the compiler can treat everything AFTER a successful `guard` as
having satisfied that condition for the REST of the enclosing scope,
which `if let`'s nested structure doesn't provide the same guarantee for.

Tags: Fail-fast pattern, Compiler-enforced early exit, Flat vs nested control flow

## Software Engineering

`guard let` is the idiomatic Swift choice specifically for
PRECONDITION-style checks at the TOP of a function (validating required
inputs before proceeding) — reserving `if let` for cases where the
absent-value case is just ONE OF SEVERAL branches of ordinary,
non-precondition logic, not a validation gate.

Tags: Precondition checks, Idiomatic guard usage, if let vs guard let

## Common Mistakes

- Using `if let` for a chain of several required-value checks, producing deeply nested code — `guard let` flattens this into a sequence of early exits instead, since each successful guard just continues to the next line rather than nesting further.
- Writing a `guard` whose `else` block doesn't actually exit the current scope — this is a compile error in Swift, specifically because the language wants to GUARANTEE that code after a `guard` can safely assume the condition held.

## Exercises

- Rewrite a function using THREE chained `if let` checks (each nested inside the previous) as the equivalent flat sequence of `guard let` statements, and compare the nesting depth.
- Explain why Swift's compiler enforces that a `guard`'s `else` block must exit the scope — what would break if it were allowed to just "fall through" instead?

## swift

```swift
func greet(name: String?) -> String {
    guard let unwrapped = name else {
        return "no name given"
    }
    return "Hello, \(unwrapped)"
}

print(greet(name: "Alice"))
print(greet(name: nil))
```
Walkthrough: when `name` has a value, `guard let` unwraps it into
`unwrapped` and execution continues past the `guard` with no extra
nesting, reaching the greeting line directly. When `name` is `nil`, the
`else` block's `return` exits the function immediately — the compiler
requires this exit, guaranteeing that any code AFTER the `guard` can
safely assume `unwrapped` is valid.
