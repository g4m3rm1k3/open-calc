---
concept: 064-strategy-2-functions
name: "Strategy Pattern: First-Class Functions"
series: strategy-pattern
seriesTitle: Strategy Pattern
part: 2
---

## Definition

The same interchangeable-algorithm idea as the classic Strategy pattern, but
the "strategy" is a plain function passed directly, rather than an object
implementing a shared interface — the language's function type itself acts as
the interface.

## Problem

In a language where functions are first-class values, defining a whole class —
with a constructor, a single method, and an interface it implements — just to
wrap one function is often pure ceremony. The interface the classic pattern
relies on to make strategies interchangeable is exactly what a function's own
type signature already provides for free.

## Computer Science

A function's type signature — its parameter and return types — is itself an
interface with exactly one method. Passing a function directly instead of an
object implementing a one-method interface is functionally identical, which is
why this variant is sometimes described as replacing a whole class hierarchy
with values that were already, structurally, exactly what the pattern needed.

Tags: First-class functions, Structural typing, Higher-order functions

## Software Engineering

This variant trades away one real capability the class-based version has — a
strategy object can hold its own internal state and multiple related methods,
while a bare function is stateless and single-purpose. When a strategy
genuinely needs configuration or multiple related operations, the class-based
version (Part 1) is still the better fit; when it's truly just "one algorithm,
one input, one output," the function version removes real ceremony for no real
loss.

Tags: Stateless vs stateful strategies, Code conciseness, When to prefer classes

## Common Mistakes

- Reaching for the function-based version when a strategy actually needs to carry internal state or configuration — that's exactly the case the class-based version (Part 1) still exists for.
- Using the class-based version out of habit in a language with strong first-class function support, adding real boilerplate for no practical benefit over passing a function directly.

## Exercises

- In the JavaScript example, add a third pricing function (e.g. a flat 20% off) and pass it into `checkout` with zero changes to `checkout` itself — same open/closed benefit as the class-based version.
- In Rust, compare the closure syntax here to Part 1's trait-object syntax — both achieve runtime substitution, but one needs a trait and implementing structs, the other doesn't.

## javascript

```javascript
const regularPricing = (total) => total
const memberPricing = (total) => total * 0.9

function checkout(total, strategy) {
  return strategy(total)
}

console.log(checkout(100, memberPricing))
```
Walkthrough: `memberPricing` is just a function — no class, no interface, no
`new`. `checkout` calls it directly as `strategy(total)`, and swapping in
`regularPricing` changes the result the exact same way swapping objects did in
Part 1, with far less code to get there.

## python

```python
def regular_pricing(total):
    return total

def member_pricing(total):
    return total * 0.9

def checkout(total, strategy):
    return strategy(total)

print(checkout(100, member_pricing))
```
Walkthrough: same idea in Python — functions are already first-class values,
so `member_pricing` can be passed directly into `checkout` exactly like any
other argument, no class or interface required at all.

## java

```java
java.util.function.DoubleUnaryOperator regularPricing = total -> total;
java.util.function.DoubleUnaryOperator memberPricing = total -> total * 0.9;

static double checkout(double total, java.util.function.DoubleUnaryOperator strategy) {
    return strategy.applyAsDouble(total);
}

System.out.println(checkout(100, memberPricing));
```
Walkthrough: `DoubleUnaryOperator` is a built-in functional interface — a
lambda (`total -> total * 0.9`) satisfies it directly, without a named class
implementing `PricingStrategy` the way Part 1 required. This is the same
underlying mechanism, a one-method interface, just filled in with a lambda
instead of a full class.

## cpp

```cpp
#include <functional>

std::function<double(double)> regularPricing = [](double total) { return total; };
std::function<double(double)> memberPricing = [](double total) { return total * 0.9; };

double checkout(double total, std::function<double(double)> strategy) {
    return strategy(total);
}

std::cout << checkout(100, memberPricing) << std::endl;
```
Walkthrough: `std::function<double(double)>` is C++'s type for "any callable
taking a double and returning a double" — a lambda satisfies it directly,
replacing Part 1's `PricingStrategy` base class and its two derived structs
with a single closure.

## rust

```rust
fn checkout(total: f64, strategy: &dyn Fn(f64) -> f64) -> f64 {
    strategy(total)
}

let regular_pricing = |total: f64| total;
let member_pricing = |total: f64| total * 0.9;

println!("{}", checkout(100.0, &member_pricing));
```
Walkthrough: `&dyn Fn(f64) -> f64` is Rust's trait-object syntax for "any
closure with this signature" — the `Fn` trait plays the same structural role
`PricingStrategy` did in Part 1, but it's built into the language rather than
hand-declared.
