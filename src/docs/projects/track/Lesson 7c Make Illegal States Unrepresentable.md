# Lesson 7c: Make Illegal States Unrepresentable

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 7b's getter/setter accessor
pattern, Lesson 0aa's immutability.

**Terms introduced in this lesson:**

- **Make illegal states unrepresentable** — designing a type so an
  invalid combination of data (e.g. a name with no matching quantity)
  cannot even be constructed, rather than merely being unlikely.

---

## Concept Unit: Make Illegal States Unrepresentable

### The Problem

The very next lesson in this course (`track/Lesson 7`) opens with a
real, concrete failure of the alternative to this concept: three
separate, synchronized lists (names, quantities, categories) can
silently drift out of sync — one list gets an element added or removed
without the others, and nothing detects it, since nothing bundles a
name with its own matching quantity in the first place.

### Introduce the Concept in Isolation

```
mkdir lesson-7c
cd lesson-7c
```

Create `Main.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Item {
        final String name;
        final int quantity;
        Item(String name, int quantity) {
            this.name = name;
            this.quantity = quantity;
        }
    }

    public static void main(String[] args) {
        List<Item> items = new ArrayList<>();
        items.add(new Item("Wrench", 12));
        items.add(new Item("Bolt", 340));

        // Removing an item removes its name AND quantity together — always:
        items.remove(0);

        for (Item item : items) {
            System.out.println(item.name + ": " + item.quantity);
        }
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
Bolt: 340
```

#### Execution Trace

Trace of the two constructions and the loop that follows:

1. `new Item("Wrench", 12)` — added to `items`; name and quantity are
   bundled into one `Item`, never two separately-mutable values.
2. `new Item("Bolt", 340)` — added to `items`; a second, independent
   bundled `Item`.
3. `items.remove(0);` — removes the whole first `Item`
   (`"Wrench"`/`12` together) as one unit; there is no operation that
   removes only the name or only the quantity.
4. The `for (Item item : items)` loop then has exactly one element
   left (`"Bolt"`/`340`), so it prints exactly one line — `Bolt: 340`
   — because removal always takes a name and its quantity together, by
   construction.

Removing `items.get(0)` removed `"Wrench"` and its `12` together, as
one unit — there is no way to remove a name without also removing its
matching quantity, because they were never stored as two separate,
independently-mutable lists in the first place. This is `make illegal
states unrepresentable` — **first appearance**: designing a type so an
invalid combination of data (e.g. a name with no matching quantity)
cannot even be constructed, rather than merely being unlikely. A "name
with no matching quantity" state simply has no representation in this
design — there is no operation that could produce it.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class Item { final String name; final int quantity; ... }` — **(a)
   first appearance**: bundles a name and its quantity into one
   inseparable unit — `final` (Lesson 0aa's own immutability) ensures
   neither field can drift independently after construction.
2. `List<Item> items` — **(b) reappearing** generic collection, now
   holding one bundled `Item` per element instead of three separate
   parallel lists.
3. `items.remove(0);` — removes one whole `Item` — name and quantity
   together, always, by construction; there is no operation on this
   design that removes only one half.

### CS Lens

This is a design-level guarantee, not a runtime check: the
parallel-lists version *could* have added a check ("if you remove
from the names list, also remove from the quantities list at the same
index") — but that check can always be forgotten at some future call
site. Bundling the data into one type removes the failure mode
entirely, rather than merely guarding against it.

Also recognized in: sum types/tagged unions in strongly-typed
functional languages (designed specifically so an invalid combination
cannot be constructed at all), any API design preferring "impossible
to call incorrectly" over "documented not to call incorrectly."

### SE Lens

The alternative — three parallel lists kept manually in sync by
discipline and code review alone — was not chosen because the very
next capstone lesson demonstrates the real failure mode directly: a
name and its score can drift apart with no error, warning, or crash at
all, only a silently wrong answer discovered later. One bundled `Item`
makes that specific drift structurally impossible, not just
discouraged.

---

## Connect the Pieces

Lesson 7a's `.equals()`/`hashCode()` and Lesson 7b's getter/setter
pattern both strengthened the same underlying discipline: controlling
how a type's data is accessed and validated. This lesson takes that
discipline one step further — designing the type itself so an invalid
combination has no representation to validate against in the first
place, right before the capstone lesson that motivates it directly.

## What Breaks Without This

Keeping data in parallel, separately-mutable lists instead of one
bundled type allows a name and its quantity to drift apart with one
missed synchronization, with no error at all — exactly the failure
mode the very next lesson in this course demonstrates concretely.

## Exercises

1. Explain, in your own words, why `final` on `Item`'s own fields
   strengthens the "illegal states unrepresentable" guarantee,
   connecting your answer to Lesson 0aa's own immutability material.
2. Add a third bundled field, `String category`, to `Item`, and
   confirm removing an item removes all three together.
3. Explain, in your own words, why a design-level guarantee is
   stronger than a runtime check that could be forgotten.

## Definition of Done

- [ ] You ran the bundled-`Item` example and can explain why it
      cannot represent a name without a matching quantity.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why bundling
      data into one type is stronger than a manually-maintained
      synchronization rule.
