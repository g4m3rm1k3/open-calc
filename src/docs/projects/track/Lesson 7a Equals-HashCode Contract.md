# Lesson 7a: The `equals`/`hashCode` Contract

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 4c's identity vs. equality.

**Terms introduced in this lesson:**

- **`equals`/`hashCode` contract** — two objects considered equal via
  `.equals()` must also return the same `hashCode()` — a contract
  hash-based collections rely on to locate objects efficiently.

---

## Concept Unit: The `equals`/`hashCode` Contract

### The Problem

Lesson 4c already established that `.equals()` can be overridden to
compare content instead of identity. Overriding only `.equals()`,
though, and leaving `hashCode()` untouched, compiles cleanly and looks
correct — but silently breaks any `HashSet` or `HashMap` built from
these objects, since those collections locate objects by hash code
first, and only compare with `.equals()` among objects that land in
the same hash bucket.

### Introduce the Concept in Isolation

```
mkdir lesson-7a
cd lesson-7a
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
2. `new BrokenPoint(1, 2)` passed to `set.contains(...)` — a
   *different* instance, with its *own* different identity-based hash
   code, because `hashCode()` was never overridden to derive from
   `x`/`y` instead of identity.
3. `new BrokenPoint(1, 2)` and `.equals(new BrokenPoint(1, 2))` in the
   `println` call — two more distinct instances, compared directly
   with `.equals()`, which correctly reports `true` because
   `.equals()` *was* overridden to compare `x`/`y`.
4. Because step 1's and step 2's instances have different, unrelated
   hash codes, `HashSet` never even compares them with `.equals()` — it
   looks in the wrong bucket entirely, so `contains` returns `false`
   despite step 3 proving `.equals()` itself works correctly.

`.equals()` correctly reports the two points as equal, yet
`HashSet.contains()`, given an equal object, reports `false`. This is
the `equals`/`hashCode` contract — **first appearance**: two objects
considered equal via `.equals()` must also return the same
`hashCode()` — a contract hash-based collections rely on to locate
objects efficiently. `BrokenPoint` violates this contract: it
overrides `.equals()` alone, so two equal points still produce
different, default, identity-based hash codes, landing in different
hash buckets that `HashSet` never even compares against each other.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `set.add(new BrokenPoint(1, 2));` — **(a) first appearance**:
   stored using its default, identity-based hash code, since
   `hashCode()` was never overridden.
2. `set.contains(new BrokenPoint(1, 2))` — a *different* `BrokenPoint`
   instance, equal by content but with its own, different default hash
   code — looked up in a different bucket than the one actually
   containing the stored point.
3. `contains` prints `false` — direct proof the contract was
   violated: `.equals()` alone was not enough for `HashSet` to find a
   content-equal object.

### CS Lens

The `equals`/`hashCode` contract exists because hash-based collections
never scan every stored element to check equality — they compute a
hash code first, jump straight to that bucket, and only then check
`.equals()` among whatever's already in that bucket. Two equal objects
landing in different buckets are never even compared, no matter how
correct `.equals()` itself is.

Also recognized in: `equals`/`hashCode` pairs in every JVM language
(Kotlin's `data class` generates both together, specifically to avoid
this exact bug), analogous "equal keys must hash identically"
contracts in any hash-table-based data structure in any language.

### SE Lens

The alternative — overriding `.equals()` without also overriding
`hashCode()` — was not a safe partial step; the two must be changed
together, always, or a working-looking `.equals()` silently corrupts
every hash-based collection built from that type, with no compiler
error or warning at all.

---

## Connect the Pieces

`BrokenPoint` proved overriding `.equals()` alone is an incomplete,
silently-broken step. The next lesson (Getter/Setter Accessor Pattern)
shows a related discipline: controlling a field's access path
deliberately, rather than leaving it wide open.

## What Breaks Without This

Overriding `.equals()` without `hashCode()` silently corrupts every
`HashSet`/`HashMap` built from that type — proven directly above.

## Exercises

1. Add a correct `hashCode()` override to `BrokenPoint` (returning,
   for example, `x * 31 + y`) and confirm `HashSet.contains()` now
   correctly returns `true`.
2. Explain, in your own words, why `HashSet` never even calls
   `.equals()` on `BrokenPoint`'s two equal instances.
3. Explain, in your own words, why `.equals()` and `hashCode()` must
   always be changed together.

## Definition of Done

- [ ] You ran the `BrokenPoint` example and observed the real
      `equals`/`hashCode` contract violation.
- [ ] You completed Exercise 1 and fixed the violation.
- [ ] You can state, without looking back at this lesson, why
      overriding `.equals()` alone is not a safe partial step.
