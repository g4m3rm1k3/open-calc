# Lesson 52: The `equals`/`hashCode` Contract, the Getter/Setter Pattern, and Illegal States

**What you will build:** Three small, fully runnable, plain Java labs.

**What you need to know first:** Lesson 04's access control and
encapsulation, Lesson 18's identity vs. equality.

**Terms introduced in this lesson:**

- **`equals`/`hashCode` contract** — two objects considered equal via
  `.equals()` must also return the same `hashCode()` — a contract
  hash-based collections rely on to locate objects efficiently.
- **Getter/setter accessor pattern** — a public method whose only job is
  reading (getter) or writing (setter) a private field, making the
  field's access path a deliberate, controllable chokepoint instead of
  direct exposure.
- **Make illegal states unrepresentable** — designing a type so an
  invalid combination of data (e.g. a name with no matching quantity)
  cannot even be constructed, rather than merely being unlikely.

---

## Concept Unit: The `equals`/`hashCode` Contract

### The Problem

Lesson 18 already established that `.equals()` can be overridden to
compare content instead of identity. Overriding only `.equals()`, though,
and leaving `hashCode()` untouched, compiles cleanly and looks correct —
but silently breaks any `HashSet` or `HashMap` built from these objects,
since those collections locate objects by hash code first, and only
compare with `.equals()` among objects that land in the same hash bucket.

### Introduce the Concept in Isolation

```
mkdir lesson-52a
cd lesson-52a
```

Create `Main.java`:

```java
import java.util.HashSet;

public class Main {
    static class BrokenPoint {
        int x, y;
        BrokenPoint(int x, int y) { this.x = x; this.y = y; }

        @Override
        public boolean equals(Object other) {
            if (!(other instanceof BrokenPoint)) return false;
            BrokenPoint p = (BrokenPoint) other;
            return this.x == p.x && this.y == p.y;
        }
        // hashCode() NOT overridden — still Object's default, identity-based.
    }

    public static void main(String[] args) {
        HashSet<BrokenPoint> set = new HashSet<>();
        set.add(new BrokenPoint(1, 2));
        boolean contains = set.contains(new BrokenPoint(1, 2));
        System.out.println("equals() says equal: " + new BrokenPoint(1, 2).equals(new BrokenPoint(1, 2)));
        System.out.println("HashSet.contains() finds it: " + contains);
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
equals() says equal: true
HashSet.contains() finds it: false
```

#### Execution Trace

Trace of the four `BrokenPoint` constructions, in order:

1. `new BrokenPoint(1, 2)` stored in `set` — hashed using `Object`'s
   default, identity-based `hashCode()`, since this call created a
   distinct instance with its own identity-based hash.
2. `new BrokenPoint(1, 2)` passed to `set.contains(...)` — a *different*
   instance, with its *own* different identity-based hash code, because
   `hashCode()` was never overridden to derive from `x`/`y` instead of
   identity.
3. `new BrokenPoint(1, 2)` and `.equals(new BrokenPoint(1, 2))` in the
   `println` call — two more distinct instances, compared directly with
   `.equals()`, which correctly reports `true` because `.equals()` *was*
   overridden to compare `x`/`y`.
4. Because step 1's and step 2's instances have different, unrelated hash
   codes, `HashSet` never even compares them with `.equals()` — it looks
   in the wrong bucket entirely, so `contains` returns `false` despite
   step 3 proving `.equals()` itself works correctly.

`.equals()` correctly reports the two points as equal, yet
`HashSet.contains()`, given an equal object, reports `false`. This is the
`equals`/`hashCode` contract — **first appearance**: two objects
considered equal via `.equals()` must also return the same `hashCode()`
— a contract hash-based collections rely on to locate objects
efficiently. `BrokenPoint` violates this contract: it overrides
`.equals()` alone, so two equal points still produce different, default,
identity-based hash codes, landing in different hash buckets that
`HashSet` never even compares against each other.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `set.add(new BrokenPoint(1, 2));` — **(a) first appearance**: stored
   using its default, identity-based hash code, since `hashCode()` was
   never overridden.
2. `set.contains(new BrokenPoint(1, 2))` — a *different* `BrokenPoint`
   instance, equal by content but with its own, different default hash
   code — looked up in a different bucket than the one actually
   containing the stored point.
3. `contains` prints `false` — direct proof the contract was violated:
   `.equals()` alone was not enough for `HashSet` to find a
   content-equal object.

### CS Lens

The `equals`/`hashCode` contract exists because hash-based collections
never scan every stored element to check equality — they compute a hash
code first, jump straight to that bucket, and only then check `.equals()`
among whatever's already in that bucket. Two equal objects landing in
different buckets are never even compared, no matter how correct
`.equals()` itself is.

Also recognized in: `equals`/`hashCode` pairs in every JVM language
(Kotlin's `data class` generates both together, specifically to avoid
this exact bug), analogous "equal keys must hash identically" contracts
in any hash-table-based data structure in any language.

### SE Lens

The alternative — overriding `.equals()` without also overriding
`hashCode()` — was not a safe partial step; the two must be changed
together, always, or a working-looking `.equals()` silently corrupts every
hash-based collection built from that type, with no compiler error or
warning at all.

---

## Concept Unit: Getter/Setter Accessor Pattern

### The Problem

Lesson 04 already established that a `private` field blocks direct access
from outside the class. Blocking access entirely, though, isn't always
the goal — often a field's value genuinely does need to be readable, or
writable, from outside, just not through direct, uncontrolled field
access.

### Introduce the Concept in Isolation

```
mkdir lesson-52b
cd lesson-52b
```

Create `Main.java`:

```java
public class Main {
    static class Item {
        private int quantity;

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            if (quantity < 0) {
                throw new IllegalArgumentException("Quantity cannot be negative.");
            }
            this.quantity = quantity;
        }
    }

    public static void main(String[] args) {
        Item item = new Item();
        item.setQuantity(12);
        System.out.println("Quantity: " + item.getQuantity());

        try {
            item.setQuantity(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
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
Quantity: 12
Rejected: Quantity cannot be negative.
```

`quantity` itself is `private` — inaccessible directly from outside
`Item`. This is the `getter/setter accessor pattern` — **first
appearance**: a public method whose only job is reading (getter) or
writing (setter) a private field, making the field's access path a
deliberate, controllable chokepoint instead of direct exposure.
`getQuantity()` exposes reading it; `setQuantity(int)` exposes writing
it — but only through a chokepoint that rejects a negative value before
it's ever stored.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `private int quantity;` — **(b) reappearing** from Lesson 04:
   inaccessible directly from outside `Item`.
2. `public int getQuantity() { return quantity; }` — **(a) first
   appearance**: a getter, reading the field's current value through a
   controlled, public method rather than direct field access.
3. `public void setQuantity(int quantity) { if (quantity < 0) { throw ...
   } this.quantity = quantity; }` — **(a) first appearance**: a setter,
   validating the new value before storing it — a check direct field
   access could never enforce.
4. `item.setQuantity(-5);` inside the `try` block — rejected by the
   setter's own check, proving the chokepoint actually enforces the rule.

### CS Lens

This is the concrete mechanism that makes `encapsulation` (Lesson 04) real
rather than abstract: a class's public surface — its getters and setters
— not its private fields, is what callers actually depend on and can
call; the field itself could be renamed or restructured internally as
long as the getter/setter surface stays the same.

Also recognized in: properties in C# and Kotlin (syntactic sugar over
this exact same getter/setter shape), any object-oriented language's own
convention for controlled field access.

### SE Lens

The alternative — making `quantity` `public` directly, skipping the
getter/setter entirely — was not chosen because it removes the
chokepoint: any code anywhere could set `item.quantity = -5;` directly,
with no validation possible at all, since a bare field assignment cannot
run any code.

---

## Concept Unit: Make Illegal States Unrepresentable

### The Problem

Lesson 07's own parallel-lists bug is a real, concrete failure of the
alternative to this concept: three separate, synchronized lists (names,
quantities, categories) can silently drift out of sync — one list gets an
element added or removed without the others, and nothing detects it,
since nothing bundles a name with its own matching quantity in the first
place.

### Introduce the Concept in Isolation

```
mkdir lesson-52c
cd lesson-52c
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
3. `items.remove(0);` — removes the whole first `Item` (`"Wrench"`/`12`
   together) as one unit; there is no operation that removes only the
   name or only the quantity.
4. The `for (Item item : items)` loop then has exactly one element left
   (`"Bolt"`/`340`), so it prints exactly one line — `Bolt: 340` — because
   removal always takes a name and its quantity together, by construction.

Removing `items.get(0)` removed `"Wrench"` and its `12` together, as one
unit — there is no way to remove a name without also removing its
matching quantity, because they were never stored as two separate,
independently-mutable lists in the first place. This is `make illegal
states unrepresentable` — **first appearance**: designing a type so an
invalid combination of data (e.g. a name with no matching quantity)
cannot even be constructed, rather than merely being unlikely. A "name
with no matching quantity" state simply has no representation in this
design — there is no operation that could produce it.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class Item { final String name; final int quantity; ... }` — **(a)
   first appearance**: bundles a name and its quantity into one
   inseparable unit — `final` (Lesson 25's own immutability) ensures
   neither field can drift independently after construction.
2. `List<Item> items` — **(b) reappearing** generic collection from
   Lesson 07, now holding one bundled `Item` per element instead of three
   separate parallel lists.
3. `items.remove(0);` — removes one whole `Item` — name and quantity
   together, always, by construction; there is no operation on this
   design that removes only one half.

### CS Lens

This is a design-level guarantee, not a runtime check: the parallel-lists
version *could* have added a check ("if you remove from the names list,
also remove from the quantities list at the same index") — but that check
can always be forgotten at some future call site. Bundling the data into
one type removes the failure mode entirely, rather than merely guarding
against it.

Also recognized in: sum types/tagged unions in strongly-typed functional
languages (designed specifically so an invalid combination cannot be
constructed at all), any API design preferring "impossible to call
incorrectly" over "documented not to call incorrectly."

### SE Lens

The alternative — three parallel lists kept manually in sync by
discipline and code review alone — was not chosen because Lesson 07's own
capstone already demonstrates the real failure mode: a name and its score
can drift apart with no error, warning, or crash at all, only a silently
wrong answer discovered later. One bundled `Item` makes that specific
drift structurally impossible, not just discouraged.

---

## Connect the Pieces

All three concepts strengthen the same underlying discipline from Lesson
04's encapsulation. The `equals`/`hashCode` contract shows overriding
`.equals()` alone is an incomplete, silently-broken step. The
getter/setter pattern shows *why* a private field plus a controlled public
surface is safer than direct exposure — the setter is exactly where a
validation check like `make illegal states unrepresentable`'s own
constructor check can live. And `Item` bundling a name with its quantity
is that same idea taken one step further: not just validating a value on
the way in, but designing the type itself so the invalid combination has
no representation to validate against in the first place.

## What Breaks Without This

Overriding `.equals()` without `hashCode()` silently corrupts every
`HashSet`/`HashMap` built from that type — proven directly above.
Exposing a field as `public` instead of through a getter/setter removes
any chokepoint for validation, letting invalid values be assigned with no
possible check. And keeping data in parallel, separately-mutable lists
instead of one bundled type allows exactly the drift Lesson 07's own
capstone bug demonstrates — a name and its quantity separated by one
missed synchronization, with no error at all.

## Exercises

1. Add a correct `hashCode()` override to `BrokenPoint` (returning, for
   example, `x * 31 + y`) and confirm `HashSet.contains()` now correctly
   returns `true`.
2. Add a `setName(String)` setter to `Item` in the getter/setter example
   that rejects an empty string, and confirm it throws correctly.
3. Explain, in your own words, why `final` on `Item`'s own fields
   strengthens the "illegal states unrepresentable" guarantee, connecting
   your answer to Lesson 25's own immutability material.

## Definition of Done

- [ ] You ran the `BrokenPoint` example and observed the real
      `equals`/`hashCode` contract violation.
- [ ] You ran the `Item` getter/setter example and saw the setter reject
      an invalid value.
- [ ] You ran the bundled-`Item` example and can explain why it cannot
      represent a name without a matching quantity.
