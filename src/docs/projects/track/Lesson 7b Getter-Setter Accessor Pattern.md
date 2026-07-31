# Lesson 7b: Getter/Setter Accessor Pattern

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0j's access-level enforcement,
Lesson 0k's encapsulation.

**Terms introduced in this lesson:**

- **Getter/setter accessor pattern** — a public method whose only job
  is reading (getter) or writing (setter) a private field, making the
  field's access path a deliberate, controllable chokepoint instead of
  direct exposure.

---

## Concept Unit: Getter/Setter Accessor Pattern

### The Problem

Lesson 0j already established that a `private` field blocks direct
access from outside the class. Blocking access entirely, though, isn't
always the goal — often a field's value genuinely does need to be
readable, or writable, from outside, just not through direct,
uncontrolled field access.

### Introduce the Concept in Isolation

```
mkdir lesson-7b
cd lesson-7b
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
it — but only through a chokepoint that rejects a negative value
before it's ever stored.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `private int quantity;` — **(b) reappearing** from Lesson 0j:
   inaccessible directly from outside `Item`.
2. `public int getQuantity() { return quantity; }` — **(a) first
   appearance**: a getter, reading the field's current value through a
   controlled, public method rather than direct field access.
3. `public void setQuantity(int quantity) { if (quantity < 0) { throw
   ... } this.quantity = quantity; }` — **(a) first appearance**: a
   setter, validating the new value before storing it — a check
   direct field access could never enforce.
4. `item.setQuantity(-5);` inside the `try` block — rejected by the
   setter's own check, proving the chokepoint actually enforces the
   rule.

### CS Lens

This is the concrete mechanism that makes `encapsulation` (Lesson 0k)
real rather than abstract: a class's public surface — its getters and
setters — not its private fields, is what callers actually depend on
and can call; the field itself could be renamed or restructured
internally as long as the getter/setter surface stays the same.

Also recognized in: properties in C# and Kotlin (syntactic sugar over
this exact same getter/setter shape), any object-oriented language's
own convention for controlled field access.

### SE Lens

The alternative — making `quantity` `public` directly, skipping the
getter/setter entirely — was not chosen because it removes the
chokepoint: any code anywhere could set `item.quantity = -5;`
directly, with no validation possible at all, since a bare field
assignment cannot run any code.

---

## Connect the Pieces

Lesson 7a showed an incomplete override silently breaking a contract.
This lesson shows the opposite discipline done right: a controlled,
validating chokepoint replacing direct field access. The next lesson
(Make Illegal States Unrepresentable) takes this one step further.

## What Breaks Without This

Exposing a field as `public` instead of through a getter/setter
removes any chokepoint for validation, letting invalid values be
assigned with no possible check.

## Exercises

1. Add a `setName(String)` setter to `Item` that rejects an empty
   string, and confirm it throws correctly.
2. Change `quantity` to `public` temporarily and confirm
   `item.quantity = -5;` now compiles with no validation at all, then
   revert it.
3. Explain, in your own words, why a class's public surface, not its
   private fields, is what callers actually depend on.

## Definition of Done

- [ ] You ran the `Item` getter/setter example and saw the setter
      reject an invalid value.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `quantity` is `private` with a public getter/setter, rather than
      simply `public`.
