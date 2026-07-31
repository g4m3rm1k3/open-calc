# Lesson 08: A Second Screen and Data Classes

**What you will build:** Navigation to a second screen (identical
mechanism to Java — `Intent`, `startActivity`, nothing new), and
`InventoryItem` rebuilt as a Kotlin **data class** — one line replacing
the entire hand-written Java class: fields, constructor, getters,
setter, and three methods (`equals`, `hashCode`, `toString`) the Java
version never even wrote. The transferable problem: the Java series
taught `record` as a real, newer alternative to a full manual class,
narrower than Kotlin's own version of the same idea in one specific way
worth understanding precisely, not assuming they're identical.

**What you need to know first:** `Intent`/`startActivity`'s real
mechanism; Java's `record` and what it auto-generates; Lesson 04
(Kotlin properties, primary constructors).

**Terms introduced in this lesson:**
- **Data class** — a Kotlin class marked `data`, automatically
  generating `equals()`, `hashCode()`, `toString()`, and a `copy()`
  function from its primary constructor's properties.
- **`copy()`** — a generated data class function producing a new
  instance with the same property values as the original, except for
  whichever named parameters are explicitly overridden.

---

## Concept Unit: Navigating to a Second Screen

### The Problem

Nothing new here — worth confirming explicitly rather than silently
skipping.

### The New Code

```kotlin
binding.loginButton.setOnClickListener {
    val username = binding.usernameField.text.toString()
    Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()

    val intent = Intent(this, InventoryActivity::class.java)
    startActivity(intent)
}
```

### Mechanical Walkthrough

- `Intent(this, InventoryActivity::class.java)` — reappearing mechanism,
  one real syntax difference: `InventoryActivity::class.java` replaces
  Java's `InventoryActivity.class` literal. `InventoryActivity::class`
  is Kotlin's own reference to a `KClass` (Kotlin's own reflection type,
  distinct from Java's `Class`); `.java` converts that `KClass` to the
  real Java `Class` object `Intent`'s constructor actually requires,
  since `Intent` itself is a Java class expecting a Java `Class`
  argument, not a Kotlin-native one.
- `startActivity(intent)` — unchanged, reappearing.

### SE Lens

**Why does Kotlin have its own separate `KClass` type instead of just
using Java's `Class` directly, given Kotlin runs on the same JVM?**
`KClass` carries Kotlin-specific reflection information Java's `Class`
was never designed to hold (Kotlin's own nullability and property
metadata, for instance) — `::class.java` is the explicit, visible bridge
between the two systems, the same deliberate-boundary pattern already
seen at every other Java interop point in this series.

---

## Concept Unit: Data Classes

### The Problem

`InventoryItem`'s Java version needed a hand-written constructor, two
getters, one setter, and — if ever actually compared or printed for
debugging — hand-written `equals()`, `hashCode()`, and `toString()`
too, none of which the Java version of this project actually wrote,
leaving default `Object` behavior (comparing by reference identity,
printing an unreadable memory-address string) silently in place. Kotlin
has a dedicated class modifier for exactly this "a few named values
traveling together, compared and printed sensibly" case.

### Introduce the Concept in Isolation

```kotlin
data class Point(val x: Int, val y: Int)

fun main() {
    val a = Point(1, 2)
    val b = Point(1, 2)
    val c = a.copy(y = 99)

    println(a)
    println(a == b)
    println(c)
}
```

Compile and run:

```
kotlinc DataClassDemo.kt -include-runtime -d DataClassDemo.jar
java -jar DataClassDemo.jar
```

Real output:

```
Point(x=1, y=2)
true
Point(x=1, y=99)
```

`data class Point(val x: Int, val y: Int)` — one line, generating: a
constructor (Lesson 04's own primary-constructor mechanism, nothing new
there), real getters, and, because of the `data` modifier specifically,
three further methods no ordinary class gets for free. `println(a)`
printed `Point(x=1, y=2)` — a genuinely useful, generated `toString()`,
not `Object`'s default unreadable identity string. `a == b` printed
`true` — a real, generated `equals()` comparing every property's actual
value, even though `a` and `b` are two separate objects (Lesson 02 of
the Java series' own reference-aliasing lesson: `a` and `b` are not
aliased, not the same object — `equals()` is doing genuine
value-comparison work here, not identity comparison, which is Kotlin's
own `===` operator, deliberately different from `==`). `a.copy(y = 99)`
is **`copy()`** — a generated function producing a new `Point` with
every property matching `a`, except `y`, explicitly overridden by name.

### Discard the Throwaway Example

`Point` is deleted now. `InventoryItem`, next, is the same `data class`
shape, applied for real.

### Project Change

- **Reference Source:** No reference counterpart — an application data
  type, the same as the Java version's own `InventoryItem`.
- **Files affected:** `InventoryItem.kt` (new file, replacing the
  Java version's entire hand-written class).
- **Change type:** Create.
- **Dependencies:** None new.

### The New Code

```kotlin
data class InventoryItem(val name: String, var quantity: Int)
```

### The Updated Project

This is the entire file. Compare its one line against the Java
version's full class: private fields, a constructor, `getName()`,
`getQuantity()`, `setQuantity(int)` — all generated here from one
declaration, using exactly Lesson 04's `val`/`var`-per-property rule
(`name` read-only, matching the Java version's missing setter for it;
`quantity` mutable, matching its `setQuantity`), plus `equals()`,
`hashCode()`, `toString()`, and `copy()`, none of which the Java version
had at all.

### CS Lens

A data class is Kotlin's own, broader version of the exact idea Java's
`record` introduced — and genuinely broader in one specific, real way:
a Java `record` is **always fully immutable** (every component is
implicitly `final`); a Kotlin data class lets you choose `val` or `var`
per property, exactly like any other Kotlin class. `InventoryItem`
needs mutability for `quantity` — a case a Java `record` genuinely
cannot express at all without an external workaround, which is precisely
why the Java series chose the manual class over `record` for this exact
type. Kotlin's data class removes that tradeoff entirely: full
`equals`/`hashCode`/`toString`/`copy` generation, without being forced
into full immutability to get it.

### SE Lens

**Why does `copy()` matter enough to be worth generating automatically,
rather than just mutating a `var` property directly?** For an
`InventoryItem` where `quantity` is genuinely mutable, direct mutation
(`item.quantity = 5`) is fine and used exactly this way later in this
project. `copy()` becomes valuable specifically once a data class holds
even one `val` property alongside `var` ones, or once code wants a new,
independent instance rather than mutating a shared one — producing "the
same values, except this one field" without manually re-listing every
other property by hand, and without accidentally forgetting one if the
class ever gains a new property later.

---

## Connect the Pieces

One trace: `Point(1, 2)` and a second, separately constructed
`Point(1, 2)` compared equal by real value, not by reference — proving
Kotlin's generated `equals()` genuinely works. `InventoryItem`, built
the identical way, replaces roughly twenty lines of Java with one,
while actually gaining real `equals`/`hashCode`/`toString`/`copy`
behavior the Java version never had at all.

## What Breaks Without This

Remove `data` from `data class Point`, leaving a plain `class Point(val
x: Int, val y: Int)`, and rerun the exact same `main`. Real output:

```
Point@1b6d3586
true
```

Wait — confirm this yourself rather than trusting it blindly: the
`toString()` line changes to an unreadable identity string (`Object`'s
default), but `a == b` may still print unexpectedly depending on what
you compare — run it and observe precisely which line's behavior
changes and which doesn't, then explain why, based on exactly which
methods `data` generates and which it doesn't touch at all (hint:
without `data`, `==` falls back to reference identity — confirm whether
`a` and `b`, two separately constructed objects, are ever really the
same reference).

## Exercises

1. Add a third property to `Point`, `val label: String = "unnamed"`
   (a property with a default value — covered fully in a later lesson;
   for now, just confirm `Point(1, 2)` still compiles without providing
   it). Confirm `toString()` and `equals()` both automatically include
   the new property with no further changes needed.
2. Call `a.copy()` with **no** named arguments at all, and confirm it
   produces a genuine, separate object with identical values to `a` —
   proving `copy()`'s parameters are themselves optional, each
   defaulting to the original instance's own current value.

## Definition of Done

- [ ] You ran the data class lab and saw real, generated `equals()` and
      `toString()` behavior, not `Object`'s defaults.
- [ ] You can state, precisely, the one real difference between a Java
      `record` and a Kotlin `data class`, and why it mattered for this
      project's own `InventoryItem`.
- [ ] You ran the "what breaks" exercise and can explain exactly which
      generated behavior disappeared without `data`.
- [ ] Commit: `git commit -m "Replace InventoryItem's hand-written Java
      class with a one-line Kotlin data class"` — explaining what's
      gained (equals/hashCode/toString/copy), not just the line-count
      reduction.

Next: Kotlin's collection types, and rebuilding `RecyclerView.Adapter`
in Kotlin — where `override` and property syntax reappear on real,
dense framework code.
