# Lesson 17b: Layered Architecture

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 17a's delegation.

**Terms introduced in this lesson:**

- **Layered architecture** — each layer only ever calls downward to the
  layer directly below it, never sideways or back up, and no layer skips
  one to reach directly into a lower one.

---

## Concept Unit: Layered Architecture

### The Problem

As a program grows past two or three classes, some structure is needed
for *which* classes are allowed to call *which* others — without it,
any class can call any other, and the resulting web of dependencies
becomes difficult to reason about or safely change.

### Introduce the Concept in Isolation

Extend Lesson 17a's own example with a third layer:

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

class ReceiptPrinter {
    private OrderSummary summary = new OrderSummary();

    void printReceipt(int quantity, double unitPrice) {
        System.out.println("Receipt total: " + summary.getTotal(quantity, unitPrice));
    }
}

public class Main {
    public static void main(String[] args) {
        ReceiptPrinter printer = new ReceiptPrinter();
        printer.printReceipt(3, 9.99);
    }
}
```

Compile and run it. Here is the real output:

```
Receipt total: 29.97
```

`ReceiptPrinter` calls `OrderSummary`; `OrderSummary` calls
`PriceCalculator`. `ReceiptPrinter` never calls `PriceCalculator`
directly, even though it easily could. This is `layered architecture` —
**first appearance**: each layer only ever calls downward to the layer
directly below it, never sideways or back up, and no layer skips one to
reach directly into a lower one. Three layers, each calling only the one
immediately beneath it.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class ReceiptPrinter { private OrderSummary summary = new
   OrderSummary(); ... }` — **(a) first appearance** of a third layer,
   holding the middle layer as its own collaborator, the identical
   delegation shape from Lesson 17a, one level up.
2. `summary.getTotal(...)` inside `printReceipt` — `ReceiptPrinter`
   reaches `PriceCalculator`'s result only through `OrderSummary` —
   there is no `new PriceCalculator()` or direct reference to it
   anywhere inside `ReceiptPrinter` at all.

### CS Lens

A layered architecture enforces a specific *direction* of dependency:
each layer knows about the layer below it, and nothing above. This
constraint, while it costs a small amount of indirection (`ReceiptPrinter`
must go through `OrderSummary` even for something `PriceCalculator`
alone could answer), makes the overall dependency graph predictable — no
layer's internals can be reached by skipping past its own owner.

Also recognized in: the classic presentation/business-logic/data-access
layering in enterprise software, network protocol stacks (each layer
only interacts with the one directly above or below it), any "clean
architecture" or "hexagonal architecture" pattern enforcing directional
dependencies.

### SE Lens

The alternative — `ReceiptPrinter` calling `PriceCalculator` directly,
skipping `OrderSummary` entirely — was not chosen because it would mean
two separate paths exist to reach the same calculation, and any future
change to how `OrderSummary` wraps or validates that calculation would
need to be duplicated into `ReceiptPrinter`'s own skip-ahead call as
well, or silently diverge from it.

---

## Connect the Pieces

`ReceiptPrinter` reaches `PriceCalculator` only through `OrderSummary`,
never skipping a layer. The next lesson shows a different, complementary
principle: adding new capability without editing existing, working code.

## What Breaks Without This

`ReceiptPrinter` calling `PriceCalculator` directly, skipping
`OrderSummary` entirely, means two separate paths exist to reach the same
calculation — any future change to how `OrderSummary` wraps or validates
it would need to be duplicated or would silently diverge.

## Exercises

1. Add a fourth layer, `InvoiceEmailer`, holding `ReceiptPrinter` as its
   own collaborator, following the same one-layer-down shape.
2. Explain, in your own words, why `ReceiptPrinter` skipping straight to
   `PriceCalculator` would compile and run correctly today, yet still be
   a real design problem.
3. Explain, in your own words, why a layered architecture's own
   constraint is described as directional, not merely "organized."

## Definition of Done

- [ ] You ran the three-layer example and saw the real output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `ReceiptPrinter` should never call `PriceCalculator` directly.
