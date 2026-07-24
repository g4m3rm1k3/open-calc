# Lesson 9: The Contract Nobody Tells You About

*(Writing `equals`/`hashCode`/`toString` by Hand)*

**What you will build**
A standalone `Roll` value type with correctly implemented `equals`,
`hashCode`, and `toString` — written by hand, so the contract between
those three methods is understood before Lesson 21 reveals the one-line
shortcut modern Java provides for exactly this.

**What you need to know first**
Lesson 0's `==` vs. `.equals()` distinction — this lesson is where you
implement the `.equals()` side of that distinction for a type of your own,
for the first time.

---

## Concept Unit: `equals()` — Defining What "Equal" Means for Your Own Type

### The Problem

Every object inherits a default `equals()` from `Object` — reference
identity, the same `==` behavior Lesson 0 already showed. A `Roll` value
type should mean two rolls of the same pin count are equal, regardless of
whether they're the same object in memory.

### The New Code

```java
class Roll {
    private final int pins;

    Roll(int pins) {
        this.pins = pins;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Roll)) return false;
        Roll roll = (Roll) other;
        return this.pins == roll.pins;
    }
}
```

### Mechanical walkthrough

1. `@Override` — (first appearance in this project) an annotation telling
   the compiler "this method must actually override a method from a
   superclass" — if you misspell `equals` as `eqauls`, `@Override` turns
   that typo into a compile error instead of silently creating an
   unrelated new method that's never called. A real, cheap safety net.
2. `public boolean equals(Object other)` — the exact signature `Object`
   declares — the parameter type must be `Object`, not `Roll`, even though
   you only ever really want to compare against another `Roll` — this is
   why the next line exists.
3. `if (this == other) return true;` — a fast path: if it's genuinely the
   same object, they're equal without needing to compare fields at all.
4. `if (!(other instanceof Roll)) return false;` — (first appearance)
   `instanceof` checks whether `other` is actually a `Roll` at runtime —
   necessary because the parameter's *declared* type is `Object`, which
   could be anything.
5. `Roll roll = (Roll) other;` — (first appearance) an explicit **cast** —
   telling the compiler "trust me, I've already checked, treat this
   `Object` as a `Roll` from here on." Safe here specifically because the
   `instanceof` check just above guarantees it.

### Connection

`equals()` alone is not the whole contract — Concept Unit 2 shows exactly
why.

---

## Concept Unit: `hashCode()` — The Contract Nobody Enforces Until It Breaks

### The Problem

Java's rule (stated in `Object`'s own documentation, not always read)
is: **if two objects are `.equals()`, they must return the same
`hashCode()`.** Nothing in the compiler checks this — it's an honor-system
contract, and breaking it produces a real, silent bug rather than an
error.

### Introduce the concept in isolation — the broken version, first

```java
class BrokenRoll {
    private final int pins;
    BrokenRoll(int pins) { this.pins = pins; }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof BrokenRoll)) return false;
        BrokenRoll roll = (BrokenRoll) other;
        return this.pins == roll.pins;
    }
    // hashCode NOT overridden — still Object's default
}
```

```java
public class BrokenRollDemo {
    public static void main(String[] args) {
        BrokenRoll a = new BrokenRoll(7);
        BrokenRoll b = new BrokenRoll(7);
        System.out.println("equals: " + a.equals(b));
        System.out.println("same hashCode: " + (a.hashCode() == b.hashCode()));

        java.util.Set<BrokenRoll> rolls = new java.util.HashSet<>();
        rolls.add(a);
        System.out.println("contains: " + rolls.contains(b));
    }
}
```

Run it:

```bash
javac BrokenRoll.java BrokenRollDemo.java
java BrokenRollDemo
```

Real output — verified this session:

```text
equals: true
same hashCode: false
contains: false
```

*What this proves — a real, concrete bug, not a theoretical warning:*
`a.equals(b)` correctly says `true` — they represent the same roll. But
`rolls.contains(b)` says `false`, even though `a` (which *is* equal to
`b`) was just added. `HashSet` (and `HashMap`) use `hashCode()` first to
find the right "bucket" to look in, and only call `.equals()` on entries
already in that bucket — if two equal objects hash differently, `b` looks
in a bucket `a` was never placed in, and `.equals()` never even gets a
chance to run. This is the exact contract violation the rule exists to
prevent.

### Discard the broken version

`BrokenRoll` is deleted. The fix — overriding `hashCode()` consistently
with `equals()` — is what `Roll` actually uses.

### The New Code

```java
import java.util.Objects;

class Roll {
    private final int pins;

    Roll(int pins) { this.pins = pins; }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Roll)) return false;
        Roll roll = (Roll) other;
        return this.pins == roll.pins;
    }

    @Override
    public int hashCode() {
        return Objects.hash(pins);
    }

    @Override
    public String toString() {
        return "Roll{pins=" + pins + "}";
    }
}
```

### Run it

Real output — verified this session, the fixed version:

```text
Roll{pins=7}
true
true
true
```

*What this proves:* `equals`, matching `hashCode`s, and `HashSet.contains`
all agree now — `Objects.hash(pins)` is a standard-library helper that
builds a correct hash code from one or more fields, consistent with
`equals()`'s own field comparison.

### Mechanical walkthrough

1. `Objects.hash(pins)` — (first appearance) a `java.util.Objects` static
   helper that computes a combined hash from the given fields — using the
   *same* fields `equals()` compares is exactly what keeps the two methods
   consistent with each other.
2. `toString()` override — (hard concept reappearing, from Lesson 0's
   `Object` default) without this override, `System.out.println(a)` would
   print something like `Roll@1b6d3586` — a memory-address-derived string
   telling you nothing about the actual roll.

### CS Lens

This is the **equals/hashCode contract** — a real invariant every hash-based
collection (`HashSet`, `HashMap`) depends on silently working. This
curriculum's Kotlin course generates all three of these methods
automatically from one `data class` keyword; this lesson is deliberately
the "by hand" version *first*, so Lesson 21's `record` reveal actually
means something concrete instead of "magic that saves typing."

### SE Lens

Why doesn't the compiler enforce this contract, if breaking it causes
real bugs? Because `equals()` and `hashCode()` are ordinary overridable
methods with no special compiler relationship — Java trusts the
programmer to keep them consistent, the same honor-system trust behind
several of Java's older conventions (this is exactly the kind of gap
`record`, added in Java 14, exists to close by generating both together,
guaranteed consistent, automatically).

### Connection

Lesson 21 reveals `record Roll(int pins) {}` — one line, replacing every
line in this lesson, doing exactly what you just built by hand, correctly,
guaranteed. This curriculum's Kotlin course's `data class` and the WPF
course's C# `record` do the same job — naming that three-way connection is
Lesson 21's job specifically.

---

## Closing

### Connect the pieces

`equals()` (unit 1) defines what "equal" means for `Roll`, using
`instanceof` and a cast to safely narrow from `Object`. `hashCode()`
(unit 2), proven necessary with a real, concrete `HashSet` failure when
it's missing, keeps that definition consistent everywhere a hash-based
collection is involved. `toString()` makes `Roll` readable in output,
rather than a memory address.

### What breaks without this

You already ran the real, broken version above — `BrokenRoll` in a
`HashSet` silently fails to find an equal entry. That failure mode *is*
this lesson's "what breaks" — proven before the fix, not after, because
seeing the actual contract violation is the entire point.

### Exercises

- Add a second field to `Roll` (say, a boolean `wasStrike`) and update
  `equals`/`hashCode`/`toString` consistently — confirm all three still
  agree with each other for two rolls with the same field values.
- Try comparing a `Roll` to a completely unrelated object (a `String`) via
  `.equals()` and confirm it correctly returns `false` rather than
  crashing — trace through why the `instanceof` check handles this safely.

### Definition of done

- [ ] You triggered the real `HashSet.contains` failure with `BrokenRoll`
      yourself.
- [ ] `Roll`'s `equals`/`hashCode`/`toString` all work correctly and
      consistently, verified with real output.
- [ ] You can explain, in your own words, why `HashSet.contains` can fail
      even when `.equals()` alone would say `true`.
- [ ] Commit: `git commit -m "Add Roll value type with hand-written equals/hashCode/toString — the contract Lesson 21's record shortcut will later replace"`.
