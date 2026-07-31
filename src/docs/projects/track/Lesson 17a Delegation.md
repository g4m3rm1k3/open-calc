# Lesson 17a: Delegation

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0r's program to an interface.

**Terms introduced in this lesson:**

- **Delegation** — a method's entire body forwards the call to another
  object that does the real work, rather than implementing the logic
  itself.

---

## Concept Unit: Delegation

### The Problem

A class sometimes needs to offer a method whose real work genuinely
belongs to a different, more specialized object it already holds — doing
the work itself would duplicate logic that object already implements
correctly.

### Introduce the Concept in Isolation

```
mkdir lesson-17a
cd lesson-17a
```

Create `Main.java`:

```java
class PriceCalculator {
    double calculateTotal(int quantity, double unitPrice) {
        return quantity * unitPrice;
    }
}

class OrderSummary {
    private PriceCalculator calculator = new PriceCalculator();

    double getTotal(int quantity, double unitPrice) {
        return calculator.calculateTotal(quantity, unitPrice);
    }
}

public class Main {
    public static void main(String[] args) {
        OrderSummary summary = new OrderSummary();
        System.out.println("Total: " + summary.getTotal(3, 9.99));
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Total: 29.97
```

`OrderSummary.getTotal(...)`'s entire body is one line, forwarding
directly to `calculator.calculateTotal(...)`. This is `delegation` —
**first appearance**: a method's entire body forwards the call to another
object that does the real work, rather than implementing the logic
itself. `OrderSummary` doesn't know or care *how* the total is
calculated — it simply hands the request to `PriceCalculator`, which
does.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class PriceCalculator { double calculateTotal(...) { ... } }` — an
   ordinary class, holding the actual calculation logic.
2. `private PriceCalculator calculator = new PriceCalculator();` —
   **(b) reappearing** field-with-object shape, `OrderSummary` holding a
   `PriceCalculator` as a collaborator.
3. `double getTotal(...) { return calculator.calculateTotal(...); }` —
   **(a) first appearance** of pure delegation: the method's *entire*
   body is a single forwarding call, with no independent logic of its
   own at all.

### CS Lens

Delegation forwards *responsibility*, not just data — `OrderSummary`
holds a real collaborator and hands off the actual work to it, distinct
from simply calling a static utility method (Lesson 0i), since the
collaborator here is a real, potentially-swappable object.

Also recognized in: the delegate pattern by name in iOS/Cocoa
development, composition-based code reuse generally (as opposed to
inheritance-based reuse), any wrapper class whose methods simply forward
to a wrapped object.

### SE Lens

The alternative — `OrderSummary` implementing `calculateTotal`'s own
logic directly, inline — was not chosen because it duplicates logic that
already exists correctly elsewhere, and couples `OrderSummary` to the
specific calculation details rather than to a clean, swappable
collaborator.

---

## Connect the Pieces

`OrderSummary.getTotal(...)` delegates entirely to `PriceCalculator`. The
next lesson adds a third layer and names the rule governing which layer
is allowed to call which.

## What Breaks Without This

`OrderSummary` implementing `calculateTotal`'s own logic directly,
inline, duplicates logic that already exists correctly elsewhere, and
couples `OrderSummary` to specific calculation details it shouldn't need
to know.

## Exercises

1. Add a second calculator method, `applyTax(double amount, double
   rate)`, to `PriceCalculator`, and delegate to it from a new
   `OrderSummary` method the same way `getTotal` does.
2. Explain, in your own words, why `getTotal`'s body is described as
   "pure" delegation.
3. Explain, in your own words, why `OrderSummary` holding a
   `PriceCalculator` as a field, rather than a static utility call, makes
   the collaborator swappable.

## Definition of Done

- [ ] You ran the `OrderSummary`/`PriceCalculator` example and saw the
      real output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what makes a
      method's body "pure delegation."
