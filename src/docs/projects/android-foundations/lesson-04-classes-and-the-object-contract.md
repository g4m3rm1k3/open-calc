# Lesson 04: Classes and the Object Contract

**What you will build:** a real, reproduced bug — two `Item`s with
identical data, silently treated as different entries in a `HashSet` —
caused by Java's real default `equals()`/`hashCode()`, then fixed by
hand, proving exactly what the "contract" between them requires and why
breaking it silently corrupts a collection.

**What you need to know first:** [Lesson 01](lesson-01-java-syntax-at-a-glance.md)
(`==` vs. `.equals()` on reference types). [Lesson 09](lesson-09-kotlin-classes-and-data-classes.md)
(Kotlin's `data class`, generating exactly what this lesson writes by
hand) is useful, direct contrast, not required.

**Terms introduced in this lesson:**
- **The `equals()`/`hashCode()` contract** — a real, documented rule:
  two objects that are `.equals()` **must** return the same
  `hashCode()`; violating this silently corrupts any hash-based
  collection (`HashSet`, `HashMap`) that object is used in.

**Objects and methods used:**

**`Object.equals` / `Object.hashCode`**
- *What they are:* real methods every Java object inherits from
  `Object`, the root of Java's class hierarchy.
- *Implementation:* `Object`'s own default `equals(Object o)` returns
  `this == o` (plain identity comparison); its own default `hashCode()`
  returns an implementation-specific integer, typically derived from the
  object's memory address — confirmed against the real, documented JDK
  behavior.
- *Its use:* the real, inherited default this lesson's first unit
  proves is usually wrong for a data-carrying class, and the two methods
  this lesson's second unit overrides by hand.

---

## Concept Unit: The Real, Inherited Default Is Identity-Based

### The Problem

Lesson 01 proved `==` on `String` compares identity. Does a plain,
custom class's own `.equals()` — inherited, with no override written —
behave any differently?

### Introduce the Concept in Isolation

```java
class Item {
    String name;
    double value;

    Item(String name, double value) {
        this.name = name;
        this.value = value;
    }
}
```

```java
Item a = new Item("Drill", 89.99);
Item b = new Item("Drill", 89.99);
System.out.println(a.equals(b));
System.out.println(a.hashCode());
System.out.println(b.hashCode());
```

Output:
```
false
366712642
1829164700
```

`a.equals(b)` is `false` — two separately constructed `Item`s with
identical `name`/`value` data are still considered unequal, because
`Item` inherits `Object`'s own default `.equals()`, which — confirmed in
this lesson's Header — simply returns `this == o`, plain identity
comparison, the exact same default `wpf-foundations` Lesson 04 already
proved for C#'s plain `class` and this series' own Lesson 09 proved for
Kotlin's plain `class`. `a.hashCode()`/`b.hashCode()` are two real,
different numbers — proof the inherited default `hashCode()` is also
identity-based, not derived from the object's actual field data.

### Discard

This proof is disposable; the real, working fix, next, replaces this
`Item` directly.

### Mechanical Walkthrough

- `Item(String name, double value) { this.name = name; ...}` — **(c)
  already basic**, ordinary constructor syntax, already familiar; `this.name`
  — **(c) already basic**, disambiguating the field from the same-named
  parameter, already familiar from prior Java work.
- `a.equals(b)` — **(b) hard concept reappearing**, `.equals()` from
  Lesson 01, now called on a custom class instead of `String`; its real,
  inherited, identity-based result is this unit's own proof.
- `a.hashCode()` — **(a) first appearance** of this specific method,
  confirmed real and inherited in this lesson's Header; its real,
  differing output between `a` and `b` is the second half of this unit's
  proof.

## Concept Unit: The Real Bug — a Hash-Based Collection Silently Corrupted

### The Problem

Does the previous unit's `equals()`/`hashCode()` mismatch against
`Item`'s own real data actually cause a *visible*, practical bug
anywhere, or is it a purely theoretical concern?

### Introduce the Concept in Isolation

```java
import java.util.HashSet;
import java.util.Set;

Set<Item> items = new HashSet<>();
items.add(new Item("Drill", 89.99));
items.add(new Item("Drill", 89.99));

System.out.println(items.size());
```

Output:
```
2
```

**A real, observed bug:** adding two `Item`s that any reasonable reading
of the data would call duplicates produces a `HashSet` of size `2`, not
`1` — a `HashSet`'s entire real job is rejecting duplicates, and it
relies directly on `equals()`/`hashCode()` to decide what counts as one.
Since `Item`'s inherited defaults are identity-based (previous unit),
every `new Item(...)`, even with identical data, is treated as a
genuinely distinct entry — the real, practical cost of never overriding
these two methods on a data-carrying class.

### Discard

This buggy `Item`/`HashSet` proof is disposable; the real fix, next,
closes this exact gap.

### Mechanical Walkthrough

- `Set<Item> items = new HashSet<>();` — **(a) first appearance** of
  `HashSet`, a real, standard collection type — full generics/collection
  treatment in Lesson 05; used here specifically because its
  duplicate-rejection behavior is what makes this bug directly, visibly
  observable.
- `items.add(new Item("Drill", 89.99));` (twice) — **(c) already basic**
  as method calls and object construction; the real, incorrect count
  they produce together is this unit's entire proof.

### The Fix, Proven

```java
import java.util.Objects;

class Item {
    String name;
    double value;

    Item(String name, double value) {
        this.name = name;
        this.value = value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Item)) return false;
        Item other = (Item) o;
        return Double.compare(value, other.value) == 0 && Objects.equals(name, other.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, value);
    }
}
```

With `Item` rewritten this way and the previous unit's exact `HashSet`
test rerun, unchanged otherwise: `items.size()` now correctly prints
`1`.

### Mechanical Walkthrough

- `@Override` — **(a) first appearance** of this real annotation: not
  required for the code to run, but a real, compiler-checked assertion
  that this method genuinely overrides a real inherited method — a typo
  in the method name or parameter type here becomes a real compile
  error instead of silently declaring an unrelated new method that never
  actually overrides anything.
- `public boolean equals(Object o)` — **(a) first appearance** of the
  real, required signature: `Object o`, not `Item o` — overriding
  `equals(Item o)` instead would **not** actually override `Object`'s
  real method at all (a different, unrelated overload), exactly the
  mistake `@Override` exists to catch.
- `if (this == o) return true;` — **(b) hard concept reappearing**, `==`
  identity comparison (Lesson 01); a real, standard optimization —
  skips field-by-field comparison entirely when both sides are already
  the same object.
- `if (!(o instanceof Item)) return false;` — **(a) first appearance**
  of `instanceof`: a real operator checking whether `o`'s actual runtime
  type is `Item` (or a subclass) — required because `equals(Object o)`
  must handle being passed *anything*, including an unrelated type,
  correctly (returning `false`, never throwing).
- `Item other = (Item) o;` — **(a) first appearance** of an explicit
  **cast**: `o`'s declared type is `Object`; `(Item) o` tells the
  compiler to treat it as `Item` from here on — only safe because the
  `instanceof` check on the previous line already proved it genuinely is
  one.
- `Double.compare(value, other.value) == 0` — **(a) first appearance**
  of this real static method, the correct way to compare two `double`
  values for equality (safer than plain `==` on `double`, a real,
  separate floating-point precision concern not otherwise exercised in
  this lesson).
- `Objects.equals(name, other.name)` — **(a) first appearance** of this
  real static utility method: null-safe equality — correctly returns
  `true` if both are `null`, `false` if only one is, and delegates to
  `.equals()` otherwise, avoiding a real `NullPointerException`
  (Lesson 02) that a plain `name.equals(other.name)` would risk if `name`
  itself were ever `null`.
- `Objects.hash(name, value)` — **(a) first appearance** of this real
  static utility method, producing a single, combined hash code from
  both fields — real, standard practice, rather than combining them by
  hand.

### CS Lens

**(b) hard concept, real restatement.** This is the identical
**value-based equality** idea `wpf-foundations` Lesson 04 proved for
C#'s `record` and this series' own Lesson 09 proved for Kotlin's
`data class` — both of which *generate* exactly this code automatically.
Writing it by hand here, in Java, makes the real, underlying mechanism
fully visible rather than hidden behind a compiler-generated shortcut —
useful groundwork for correctly reasoning about `data class`'s generated
version too.

### SE Lens

**The real, documented contract this lesson's title names:** two objects
that are `.equals()` **must** return the same `hashCode()` — this isn't
a style preference; it's how every hash-based collection (`HashSet`,
`HashMap`) actually works internally: it uses `hashCode()` to decide
*which internal bucket* to look in first, then `equals()` to confirm a
real match within that bucket. Overriding `equals()` without also
overriding `hashCode()` to agree with it — a real, easy mistake to
make — produces exactly this lesson's own original bug: two objects
that report themselves as equal, yet a `HashSet` still might not
recognize them as duplicates, because it never even looks in the same
bucket. The real cost of following this contract correctly, honestly
stated: real, non-trivial boilerplate for every data-carrying class —
exactly the cost Kotlin's `data class` and C#'s `record` both exist to
remove automatically, at the cost proven directly in this series'
Lesson 09 (a body-declared property silently excluded from that
generated version).

## Connect the pieces

One trace: `Item`'s inherited `equals()`/`hashCode()` are both real,
identity-based defaults — proven directly, not merely described — and
proven to cause a real, observed bug: a `HashSet` failing to reject a
genuine duplicate. Overriding both by hand, following the real,
documented contract (`@Override`, correct signature, `instanceof`,
`Objects.equals`/`Objects.hash`), fixes the exact same test. The
underlying idea — value-based equality — is the identical one
`wpf-foundations` and this series' own Lesson 09 already proved
*generated automatically* by other languages; this lesson shows the real
mechanism those generators are standing in for.

## What breaks without this

Override `equals()` correctly, exactly as this lesson's fix did, but
**omit** the matching `hashCode()` override entirely (leaving `Object`'s
inherited, identity-based default in place) — a real, common, partial
fix:

```java
@Override
public boolean equals(Object o) { /* correct, as above */ }
// hashCode() NOT overridden
```

Rerunning this lesson's own `HashSet` test with this partial fix: real,
observed result: `items.size()` still prints `2`, the identical bug as
before `equals()` was fixed at all. Direct, provable proof of this
lesson's own SE Lens: a `HashSet` checks `hashCode()` *first*, to choose
a bucket — two `Item`s with correct, matching `equals()` but different,
identity-based `hashCode()` values usually land in different buckets
and are never even compared with `equals()` at all. Overriding one
without the other is not a partial fix; it's silently broken in exactly
the same visible way as overriding neither.

## Exercises

1. Reproduce the real, partial-fix failure from the What Breaks section
   yourself, then add the correct `hashCode()` override back and confirm
   `items.size()` finally reports `1`.
2. Write `toString()` for `Item` (also inherited from `Object`, also
   identity-based by default — confirm this directly first, the same
   way this lesson's own first unit confirmed `equals()`/`hashCode()`),
   returning a real, readable string like `"Item(Drill, 89.99)"`, and
   confirm `System.out.println(item)` now shows it (Java automatically
   calls `toString()` when an object is printed directly).

## Definition of Done

- [ ] You confirmed `Item`'s inherited `equals()`/`hashCode()` are both
      identity-based by default.
- [ ] You reproduced the real `HashSet` duplicate-acceptance bug this
      causes.
- [ ] You fixed it with correct, hand-written overrides, confirming the
      real, corrected `HashSet` size.
- [ ] You reproduced the real partial-fix failure (correct `equals()`,
      default `hashCode()`) and understand why it still breaks.
- [ ] You completed both exercises.

## Next

[Lesson 05 — Collections, Generics, and Streams](lesson-05-collections-generics-and-streams.md)
covers `List`/`Map` for real, generics and real type erasure, and Java's
own Stream API — the direct counterpart to Kotlin's collection functions
(this series' planned Lesson 10) and C#'s LINQ
(`wpf-foundations` Lesson 00).
