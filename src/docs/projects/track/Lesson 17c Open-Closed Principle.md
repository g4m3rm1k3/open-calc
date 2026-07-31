# Lesson 17c: Open/Closed Principle

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 17b's layered architecture,
Lesson 0l's inheritance.

**Terms introduced in this lesson:**

- **Open/Closed Principle** — add new capability by extending or
  composing, without modifying existing, working, unrelated code.

---

## Concept Unit: The Open/Closed Principle

### The Problem

A working, tested class shouldn't need its own internals edited every
time a new, related capability is added elsewhere in the program — every
edit to already-working code is a fresh chance to break something that
previously worked correctly.

### Introduce the Concept in Isolation

Add a second calculator, without touching `PriceCalculator` at all:

```java
class DiscountedPriceCalculator extends PriceCalculator {
    @Override
    double calculateTotal(int quantity, double unitPrice) {
        return super.calculateTotal(quantity, unitPrice) * 0.9;
    }
}
```

`PriceCalculator` itself — the class this new one extends — is not
edited anywhere to make this possible. This is the `Open/Closed
Principle` — **first appearance**: add new capability by extending or
composing, without modifying existing, working, unrelated code.
`DiscountedPriceCalculator` adds a genuinely new capability (a 10%
discount) by extending `PriceCalculator`, never touching its original
source.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class DiscountedPriceCalculator extends PriceCalculator { @Override
   double calculateTotal(...) { return super.calculateTotal(...) * 0.9;
   } }` — **(b) reappearing** inheritance, overriding, and
   parent-implementation access from Lessons 0l, 0m, and 2n, applied here
   specifically to add new behavior without editing the original class.

### CS Lens

"Open for extension, closed for modification" is the principle's own
classic phrasing: a well-designed class stays open to new capability
being added around it (through inheritance or composition), while
staying closed — untouched — to direct edits from every new requirement
that comes along later.

Also recognized in: plugin architectures generally (new plugins add
capability without editing the host application's own source), the
Strategy Pattern (Lesson 6g's own subject, swapping in new behavior
without editing the code that uses it).

### SE Lens

The alternative — adding an `if (isDiscounted) { ... }` branch directly
inside `PriceCalculator.calculateTotal` itself — was not chosen because
it grows one class's own internal complexity indefinitely as more
variations are needed, and risks breaking the original, already-correct,
non-discounted behavior with every edit. Extending instead adds the new
behavior entirely alongside the original, never touching it.

---

## Connect the Pieces

`DiscountedPriceCalculator` added new behavior by extending, never
editing, the original `PriceCalculator`. The next lesson combines
delegation, layering, and this principle into one real, widely-used
pattern.

## What Breaks Without This

Adding an `if (isDiscounted) { ... }` branch directly inside
`PriceCalculator.calculateTotal` itself grows one class's own internal
complexity indefinitely as more variations are needed, and risks
breaking the original, already-correct behavior with every edit.

## Exercises

1. Add a second extension, `BulkDiscountCalculator`, following the same
   open/closed shape as `DiscountedPriceCalculator`.
2. Explain, in your own words, why editing `PriceCalculator` directly to
   add an `if` branch violates the open/closed principle, while
   `DiscountedPriceCalculator` does not.
3. Explain, in your own words, why "closed for modification" doesn't
   mean a class can never be edited at all — consider what kind of edit
   would still be acceptable.

## Definition of Done

- [ ] You ran the `DiscountedPriceCalculator` example and confirmed
      `PriceCalculator` itself was never edited.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what "open for
      extension, closed for modification" means.
