# Lesson 31: Delegation, Layering, and the Repository Pattern

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons, building up through three smaller ideas to one larger
pattern that combines all three.

**What you need to know first:** Lesson 06's `program to an interface`.

**Terms introduced in this lesson:**

- **Delegation** — a method's entire body forwards the call to another
  object that does the real work, rather than implementing the logic
  itself.
- **Layered architecture** — each layer only ever calls downward to the
  layer directly below it, never sideways or back up, and no layer skips
  one to reach directly into a lower one.
- **Open/closed principle** — add new capability by extending or
  composing, without modifying existing, working, unrelated code.
- **Repository pattern** — one class responsible only for "get me the
  data, from wherever it actually lives, and hand back a single, unified
  answer" — hiding the actual source (one database, several, a network
  call, a cache, any combination) behind one small, stable interface.

---

## Concept Unit: Delegation

### The Problem

A class sometimes needs to offer a method whose real work genuinely
belongs to a different, more specialized object it already holds — doing
the work itself would duplicate logic that object already implements
correctly.

### Introduce the Concept in Isolation

```
mkdir lesson-31
cd lesson-31
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
from simply calling a static utility method (Lesson 03), since the
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

## Concept Unit: Layered Architecture

### The Problem

As a program grows past two or three classes, some structure is needed
for *which* classes are allowed to call *which* others — without it,
any class can call any other, and the resulting web of dependencies
becomes difficult to reason about or safely change.

### Introduce the Concept in Isolation

Extend this lesson's own example with a third layer:

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
   delegation shape as the previous unit, one level up.
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
edited anywhere to make this possible. This is the `open/closed
principle` — **first appearance**: add new capability by extending or
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
   parent-implementation access from Lesson 05, applied here specifically
   to add new behavior without editing the original class.

### CS Lens

"Open for extension, closed for modification" is the principle's own
classic phrasing: a well-designed class stays open to new capability
being added around it (through inheritance or composition), while
staying closed — untouched — to direct edits from every new requirement
that comes along later.

Also recognized in: plugin architectures generally (new plugins add
capability without editing the host application's own source), the
Strategy pattern (a later lesson's own subject, swapping in new behavior
without editing the code that uses it).

### SE Lens

The alternative — adding an `if (isDiscounted) { ... }` branch directly
inside `PriceCalculator.calculateTotal` itself — was not chosen because
it grows one class's own internal complexity indefinitely as more
variations are needed, and risks breaking the original, already-correct,
non-discounted behavior with every edit. Extending instead adds the new
behavior entirely alongside the original, never touching it.

---

## Concept Unit: The Repository Pattern

### The Problem

`PriceCalculator` and `DiscountedPriceCalculator` show a real payoff for
delegation, layering, and the open/closed principle — but the pattern
that combines all three most directly, in real applications, is about
*where data comes from*: a database today, possibly a network call or a
cache added later, with calling code that shouldn't need to change
regardless of which.

### Introduce the Concept in Isolation

```java
interface ItemSource {
    String getItemName(int id);
}

class DatabaseItemSource implements ItemSource {
    public String getItemName(int id) {
        return "Item #" + id + " from the database";
    }
}

class ItemRepository {
    private ItemSource source = new DatabaseItemSource();

    String getItemName(int id) {
        return source.getItemName(id);
    }
}

public class Main {
    public static void main(String[] args) {
        ItemRepository repository = new ItemRepository();
        System.out.println(repository.getItemName(42));
    }
}
```

Compile and run it. Here is the real output:

```
Item #42 from the database
```

`ItemRepository` is a `repository pattern` — **first appearance**: one
class responsible only for "get me the data, from wherever it actually
lives, and hand back a single, unified answer" — hiding the actual
source (one database, several, a network call, a cache, any combination)
behind one small, stable interface. `Main` calls
`repository.getItemName(42)` with no idea the real answer came from
`DatabaseItemSource` specifically — this lesson's own delegation
(`ItemRepository` forwards to `source`), layering (`Main` never reaches
`DatabaseItemSource` directly), and open/closed principle (a
`NetworkItemSource` could be added later, implementing the same
`ItemSource` interface, with zero changes to `ItemRepository` or `Main`)
all combine in this one, real, widely-used pattern.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ItemSource { String getItemName(int id); }` — **(b)
   reappearing** interface, program-to-an-interface (Lesson 06),
   describing *where data comes from* generically.
2. `class DatabaseItemSource implements ItemSource { ... }` — one
   concrete source; a `NetworkItemSource` could exist alongside it,
   implementing the identical contract.
3. `private ItemSource source = new DatabaseItemSource();` and `String
   getItemName(int id) { return source.getItemName(id); }` — pure
   delegation (this lesson's first unit), forwarding entirely to
   whichever source is actually configured.

### CS Lens

The repository pattern is this lesson's three earlier ideas, combined
into one real, widely-recognized shape: delegate the actual work,
enforce a layer boundary between calling code and the real data source,
and stay open to new sources being added later without modifying
existing, working code.

Also recognized in: the Repository pattern by name across nearly every
mainstream application architecture (Android's own architecture
guidance, ASP.NET's own layered conventions), any data-access layer
hiding multiple possible backing stores behind one stable interface.

### SE Lens

The alternative — `Main` (or any calling code) talking to
`DatabaseItemSource` directly — was not chosen because it would couple
every caller to one specific data source, permanently; adding a second
source later (a cache, checked before falling through to the database)
would mean editing every call site instead of editing `ItemRepository`
alone, in one place.

---

## Connect the Pieces

`OrderSummary.getTotal(...)` delegated entirely to `PriceCalculator`.
`ReceiptPrinter` reached that same calculation only through
`OrderSummary`, never skipping a layer. `DiscountedPriceCalculator`
added new behavior by extending, never editing, the original
`PriceCalculator`. `ItemRepository` combines all three: delegates to
whichever `ItemSource` it holds, stays the one layer calling code goes
through, and can accept new source implementations later with zero
changes to itself or its callers.

## What Breaks Without This

Calling `DatabaseItemSource` directly from `Main`, skipping
`ItemRepository` entirely, compiles and runs fine on its own — the real
cost only appears later: adding a second, alternate source (a cache, say)
would require finding and editing every single place that skipped the
repository and called `DatabaseItemSource` directly, rather than editing
`ItemRepository` alone, in one place. This is a real, compounding
maintenance cost, not a compiler-caught error — exactly the kind of
problem layered architecture and the repository pattern exist to
prevent structurally, before it accumulates.

## Exercises

1. Add a second `ItemSource` implementation, `CachedItemSource`, and
   swap `ItemRepository`'s own `source` field to use it instead —
   confirm `Main` needs zero changes.
2. Add a second calculator variation, `BulkDiscountCalculator`, following
   the same open/closed shape as `DiscountedPriceCalculator`.
3. Explain, in your own words, why `ItemRepository`'s field is typed as
   `ItemSource`, not `DatabaseItemSource`, connecting this back to Lesson
   06's own program-to-an-interface principle.

## Definition of Done

- [ ] You ran all four of this lesson's examples and saw their real
      output.
- [ ] You completed Exercise 1 and swapped the repository's data source
      with zero changes to calling code.
- [ ] You can state, without looking back at this lesson, which of this
      lesson's earlier three concepts the repository pattern combines,
      and how.
