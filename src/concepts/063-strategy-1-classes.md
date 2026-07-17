---
concept: 063-strategy-1-classes
name: "Strategy Pattern: Interchangeable Classes"
series: strategy-pattern
seriesTitle: Strategy Pattern
part: 1
---

## Definition

The Strategy pattern extracts an interchangeable algorithm into its own
object, implementing a shared interface, so the algorithm can be swapped at
runtime without changing the code that uses it.

## Problem

A class that hardcodes one specific algorithm can't be reused when a caller
needs different behavior — a checkout total might need regular pricing, member
pricing, or a promotional rate depending on context. Hardcoding that choice
with if/else inside the class that uses it tightly couples that class to every
possible variant.

## Execution

A context object holds a reference to a strategy object, not a specific
concrete algorithm
↓
The strategy object implements a shared interface — the context only ever
calls that interface's method, never caring which concrete strategy it's
holding
↓
At runtime, a different strategy object can be substituted into the context,
changing its behavior with zero changes to the context's own code
↓
The context delegates the actual algorithmic work entirely to whichever
strategy it currently holds

## Computer Science

The Strategy pattern is a direct application of polymorphism (see that
concept) — the context calls one method name, and dynamic dispatch decides
which concrete implementation actually runs, based on which object was
injected, not on any branching logic written inside the context itself.

Tags: Polymorphism, Dependency injection, Runtime behavior swapping

## Software Engineering

Strategy keeps a context class open for extension — a new algorithm just means
a new class implementing the shared interface — but closed for modification,
since the context itself never needs to change to support that new algorithm:
a direct instance of the open/closed principle.

Tags: Open/closed principle, Testability, Algorithm encapsulation

## Common Mistakes

- Adding an if/else chain inside the context to pick behavior instead of injecting a strategy object — this is exactly the tight coupling Strategy exists to remove, and it means the context has to change every time a new variant is added.
- Creating a Strategy interface with only one real implementation and no actual plan for a second one — like Interface and Dependency Injection, this is unneeded indirection until a second variant genuinely exists.

## Exercises

- In the JavaScript example, add a third `PricingStrategy` (e.g. a bulk-discount strategy) and swap it into `checkout` with zero changes to `checkout` itself.
- In Python, remove the shared base class requirement and confirm any object with a compatible `calculate` method still works — Python's duck typing doesn't require a formal interface the way Java does.

## javascript

```javascript
class RegularPricing {
  calculate(total) { return total }
}
class MemberPricing {
  calculate(total) { return total * 0.9 }
}

function checkout(total, strategy) {
  return strategy.calculate(total)
}

console.log(checkout(100, new MemberPricing()))
```
Walkthrough: `checkout` never checks what kind of pricing is in effect — it
just calls `strategy.calculate(total)` and lets whichever strategy object it
was given handle the actual math. Swapping `MemberPricing` for
`RegularPricing` changes the result with zero changes to `checkout` itself.

## python

```python
class RegularPricing:
    def calculate(self, total):
        return total

class MemberPricing:
    def calculate(self, total):
        return total * 0.9

def checkout(total, strategy):
    return strategy.calculate(total)

print(checkout(100, MemberPricing()))
```
Walkthrough: identical shape to the JavaScript version — `checkout` delegates
entirely to whatever strategy object it receives, with no branching logic of
its own to decide which pricing rule applies.

## java

```java
interface PricingStrategy {
    double calculate(double total);
}
class RegularPricing implements PricingStrategy {
    public double calculate(double total) { return total; }
}
class MemberPricing implements PricingStrategy {
    public double calculate(double total) { return total * 0.9; }
}

static double checkout(double total, PricingStrategy strategy) {
    return strategy.calculate(total);
}

System.out.println(checkout(100, new MemberPricing()));
```
Walkthrough: `PricingStrategy` is the shared interface both strategies
implement — `checkout` depends only on that interface, never on a concrete
pricing class, so dynamic dispatch decides which `calculate` actually runs
based purely on which object was passed in.

## cpp

```cpp
struct PricingStrategy {
    virtual double calculate(double total) = 0;
    virtual ~PricingStrategy() = default;
};
struct RegularPricing : PricingStrategy {
    double calculate(double total) override { return total; }
};
struct MemberPricing : PricingStrategy {
    double calculate(double total) override { return total * 0.9; }
};

double checkout(double total, PricingStrategy& strategy) {
    return strategy.calculate(total);
}

MemberPricing member;
std::cout << checkout(100, member) << std::endl;
```
Walkthrough: `virtual`/`override` is C++'s mechanism for the same dynamic
dispatch Java gets from `implements` — `checkout` calls
`strategy.calculate(...)` through a base-class reference, and the actual
overridden method that runs depends on the concrete object bound to it at the
call site.

## rust

```rust
trait PricingStrategy {
    fn calculate(&self, total: f64) -> f64;
}
struct RegularPricing;
impl PricingStrategy for RegularPricing {
    fn calculate(&self, total: f64) -> f64 { total }
}
struct MemberPricing;
impl PricingStrategy for MemberPricing {
    fn calculate(&self, total: f64) -> f64 { total * 0.9 }
}

fn checkout(total: f64, strategy: &dyn PricingStrategy) -> f64 {
    strategy.calculate(total)
}

let member = MemberPricing;
println!("{}", checkout(100.0, &member));
```
Walkthrough: `&dyn PricingStrategy` is Rust's trait-object syntax for dynamic
dispatch — `checkout` accepts any type implementing `PricingStrategy` without
knowing which concrete type it'll get at compile time, the same runtime
substitution every other language here demonstrates.
