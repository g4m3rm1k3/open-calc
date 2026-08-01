# Lesson 10: `data class`

**What you will build:** `InventoryItem`, the exact row type Java's
Lesson 22 built by hand — this time as a single line of Kotlin, plus the
sample list of three rows that line populates. The transferable
problem: Java's Lesson 22 named `record` as "the newest form, worth
knowing," used it only as a shown-but-not-taken alternative, and gave a
real, honest reason for not taking it: a `record`'s fields are all
implicitly `final`, and `InventoryItem` needs to stay mutable because a
later milestone edits a row's quantity in place. This lesson delivers
Kotlin's own answer to the same problem — and proves, by disassembling
real compiled code, that it does not force the same tradeoff Java's
`record` does.

**What you need to know first:** Java's Lesson 22 in full (the
hand-written `Point`/`InventoryItem` constructor-plus-getters pattern,
`record` shown and explicitly not chosen, the mutability reasoning
behind that choice). This series' Lesson 03 (primary constructor
properties, `var` auto-generating a setter — directly reused here, not
re-taught).

**Terms introduced in this lesson:**
- **`data class`** — a class modifier generating `equals()`,
  `hashCode()`, `toString()`, `copy()`, and `componentN()` functions from
  its primary constructor properties, automatically.
- **Structural equality (`==`)** — Kotlin's `==` operator compares
  objects by calling `.equals()`, unlike Java's `==` on objects, which
  compares references.
- **Referential equality (`===`)** — Kotlin's operator for "are these
  two references pointing at the exact same object," the operation
  Java's `==` performs on objects.
- **`copy()`** — a generated method producing a new object with the same
  property values as the original, except for whichever ones are
  explicitly overridden in the call.
- **Destructuring declaration** — assigning a single object's properties
  directly into several variables at once, in one statement.

---

## Concept Unit: `data class` — Generated Methods From One Line

### The Problem

Java's Lesson 22 wrote `Point` by hand: two `private final` fields, a
constructor, and two getters — four separate pieces to express "an `x`
and a `y` traveling together." That lesson also named a real cost of the
hand-written version it never fully addressed: comparing two `Point`s
for equality, or printing one usefully, would need a correct `equals()`,
`hashCode()`, and `toString()` written by hand too, none of which
`Point` actually had.

### Introduce the Concept in Isolation

```kotlin
data class Point(val x: Int, val y: Int)

fun main() {
    val origin = Point(0, 0)
    val corner = Point(10, 20)

    println(origin)
    println(corner)
}
```

Compile and run:

```
kotlinc DataClassDemo.kt -include-runtime -d DataClassDemo.jar
java -jar DataClassDemo.jar
```

Real output, from running this just now:

```
Point(x=0, y=0)
Point(x=10, y=20)
```

`class Point(val x: Int, val y: Int)` alone — this series' own Lesson
03 primary-constructor-property syntax, nothing new there — already
gives real fields, a constructor, and getters, exactly as Lesson 03
proved. The one new word, **`data`**, in front of `class`, is what
produced that readable `Point(x=0, y=0)` output with no `toString()`
written anywhere: `data class` generates a real `toString()`
automatically, along with `equals()`, `hashCode()`, `copy()`, and more,
covered through the rest of this lesson.

### Discard the Throwaway Example

`DataClassDemo.kt` is deleted, but the concept becomes real project code
before this lesson ends.

---

## Concept Unit: `==` vs. `===` — Kotlin Changes What `==` Means

### The Problem

Java's `==`, used on two objects, compares references — whether two
variables point at the *exact same* object in memory, not whether their
contents happen to match (this is precisely why Java needs a separate
`.equals()` method at all). Does `data class`'s generated `equals()`
actually get *used* by ordinary comparison syntax, or does calling
`.equals()` explicitly remain required?

### Introduce the Concept in Isolation

```kotlin
data class Point(val x: Int, val y: Int)

fun main() {
    val corner = Point(10, 20)
    val corner2 = Point(10, 20)

    println(corner == corner2)
    println(corner === corner2)
}
```

Compile and run:

```
kotlinc EqualityDemo.kt -include-runtime -d EqualityDemo.jar
java -jar EqualityDemo.jar
```

Real output, from running this just now:

```
true
false
```

`corner` and `corner2` are two separate objects — two separate `Point(10,
20)` constructor calls — yet `corner == corner2` reports `true`. This is
a real, load-bearing difference from Java: **Kotlin's `==` calls
`.equals()` automatically**, for every type, not just for `data class`.
`corner === corner2` — a third equals sign — performs the comparison
Java's `==` actually does on objects: "are these two references pointing
at the exact same object." It reports `false` here, correctly, since
`corner` and `corner2` are genuinely two distinct objects that merely
happen to hold equal values. `data class`'s generated `equals()` is what
makes `==`'s result meaningful here at all — a `class Point` without
`data` would report `false` for `corner == corner2` too, for exactly the
reason Java's own `==` would: with no generated `equals()`, Kotlin's
`==` falls back to the same reference comparison `===` performs.

### Discard the Throwaway Example

`EqualityDemo.kt` is deleted. This is one of the highest-risk naming
collisions for a Java-trained reader in this entire series: `==` looks
identical to Java's own operator and means something functionally
different the moment either side is an object rather than a primitive.

### CS Lens

The distinction between comparing "do these represent the same value"
(**structural equality**) and "are these the same object in memory"
(**referential equality**) is a fundamental one across every
object-oriented language — Java simply spells the two operations
`.equals()` and `==` respectively, while Kotlin spells them `==` and
`===`.

Also recognized in: Python's `==` (structural, calling `__eq__`) versus
`is` (referential) — the same two-operator split as Kotlin, with
different symbols — and JavaScript's `===` for strict value comparison
on primitives, though JavaScript objects still compare referentially
under `===`, unlike Kotlin's.

### SE Lens

**Why would Kotlin risk this exact confusion, reusing a symbol Java
programmers already have strong, different expectations for?** The
alternative — keeping `==` as reference comparison and requiring
`.equals()` for structural checks, matching Java exactly — would mean
every single comparison of two data-carrying objects needs `.equals()`
written out, for a check that is, in the overwhelming majority of real
code, exactly what a programmer actually means when comparing two
values. Kotlin's designers judged that the *common* case (comparing
values) deserved the *short* syntax (`==`), and the *less common* case
(comparing identity) should be the one requiring an extra, deliberate
character (`===`) — the reverse frequency-to-verbosity mapping from
Java's own choice. The real cost is exactly this lesson's own warning:
a Java-trained reader's instincts about `==` are actively wrong here,
not just incomplete, and this is a mistake worth making once, safely, in
a lab rather than first discovering it debugging a real comparison bug.

---

## Concept Unit: `copy()` — a Modified Copy, Original Untouched

### The Problem

Lesson 03's `val` properties are immutable once set. If most of an
object's fields should stay fixed but one value legitimately needs to
change for a *new* row rather than the existing one, is the only option
manually reconstructing the whole object field by field?

### Introduce the Concept in Isolation

```kotlin
data class InventoryItem(val name: String, var quantity: Int)

fun main() {
    val bolts = InventoryItem("Bolts", 120)
    val bolts2 = bolts.copy(quantity = 90)

    println(bolts)
    println(bolts2)
}
```

Compile and run:

```
kotlinc CopyDemo.kt -include-runtime -d CopyDemo.jar
java -jar CopyDemo.jar
```

Real output, from running this just now:

```
InventoryItem(name=Bolts, quantity=120)
InventoryItem(name=Bolts, quantity=90)
```

`bolts.copy(quantity = 90)` — this series' own Lesson 03 named-argument
syntax, reused — produces a brand-new `InventoryItem` with `quantity`
set to `90` and `name` carried over unchanged from `bolts`, without
`bolts` itself being modified at all: both lines print, proving `bolts`
still holds its original `120`. `copy()` is generated automatically by
`data class`, with one parameter per constructor property, each
defaulting to that property's current value on the object `copy()` was
called on — which is exactly why only `quantity` needed to be named;
`name` used its default, "whatever `bolts.name` already is."

### Discard the Throwaway Example

`CopyDemo.kt` is deleted. `copy()` reappears the moment this project's
grid needs an "edit this row without disturbing the list's other
independent references to the same data" operation.

### SE Lens

**Why generate `copy()` at all, when this project's own `InventoryItem`
is about to be built mutable, with an ordinary settable `var quantity`
that doesn't need a copy to change?** Not every use of a data-carrying
type wants mutation — `copy()` exists for the cases (common in code that
passes objects between independent parts of an app, or code deliberately
written to avoid shared mutable state) where producing an *updated
replacement* is safer than mutating something another part of the code
might still be holding a reference to. This project's own `quantity`
being a `var` doesn't make `copy()` useless; it means this particular
class supports both styles, and later code can choose whichever fits a
given situation.

---

## Concept Unit: Destructuring Declarations

### The Problem

Reading `bolts.name` and `bolts.quantity` on two separate lines, when
both are needed together, is a small but real repetition of `bolts.`
each time.

### Introduce the Concept in Isolation

```kotlin
data class InventoryItem(val name: String, var quantity: Int)

fun main() {
    val bolts = InventoryItem("Bolts", 120)
    val (itemName, itemQuantity) = bolts
    println("$itemName: $itemQuantity")
}
```

Compile and run:

```
kotlinc Destructure.kt -include-runtime -d Destructure.jar
java -jar Destructure.jar
```

Real output, from running this just now:

```
Bolts: 120
```

`val (itemName, itemQuantity) = bolts` is a **destructuring
declaration**: it pulls `bolts`'s properties directly into two new
variables, in one statement, in the order the primary constructor
declared them. This works because `data class` also generates
`component1()`, `component2()`, and so on — one method per constructor
property, in order — and this syntax is really calling
`bolts.component1()` and `bolts.component2()` underneath, the same
"real syntax hiding a real method call" pattern this series' Lesson 09
already proved for extension functions.

### Discard the Throwaway Example

`Destructure.kt` is deleted. Destructuring reappears once this project
iterates over a list of rows and wants a row's name and quantity
available as two separate names inside a loop, rather than repeatedly
qualifying both through one variable.

---

## Concept Unit: Mixing `val` and `var` — No Forced Tradeoff

### The Problem

Java's Lesson 22 faced a real, binary choice: hand-write `InventoryItem`
with a mutable `quantity` and no generated `equals`/`hashCode`/
`toString`, or use `record` and get those generated methods at the cost
of every field, including `quantity`, becoming permanently immutable.
Does Kotlin's `data class` force the same choice?

### The Proof

`InventoryItem(val name: String, var quantity: Int)`, already used
above, already mixes `val` and `var` in the same primary constructor —
this series' own Lesson 03 concept, simply reused inside a `data class`
declaration rather than a plain one. Disassemble it to confirm nothing
was silently lost by including `var`:

```
javap -p InventoryItem.class
```

Real output, from running this just now:

```
public final class InventoryItem {
  private final java.lang.String name;
  private int quantity;
  public InventoryItem(java.lang.String, int);
  public final java.lang.String getName();
  public final int getQuantity();
  public final void setQuantity(int);
  public final java.lang.String component1();
  public final int component2();
  public final InventoryItem copy(java.lang.String, int);
  public java.lang.String toString();
  public int hashCode();
  public boolean equals(java.lang.Object);
}
```

Every method Java's Lesson 22 wrote by hand is here —
`getName()`/`getQuantity()`/`setQuantity(int)`, matching that lesson's
own getter/getter/setter trio exactly, including the deliberate choice
to generate no `setName` (`name` is `val`, immutable, exactly like Java's
Lesson 22 chose not to write one) — *plus* a real, generated
`equals()`, `hashCode()`, `toString()`, `copy()`, and `component1()`/
`component2()`, none of which Java's hand-written version had. Nothing
was traded away to keep `quantity` mutable.

### Project Change

- **Reference Source:** No reference counterpart — an application-
  specific type, same as Java's Lesson 22 own `InventoryItem`.
- **Files affected:** New file `InventoryItem.kt`; `InventoryActivity.kt`
  (populate a sample list) — this series' own Lesson 11 creates
  `InventoryActivity.kt` itself; this file is added alongside it.
- **Change type:** Create one new file.
- **Dependencies:** None new.

### The New Code

```kotlin
data class InventoryItem(val name: String, var quantity: Int)
```

```kotlin
val items = mutableListOf(
    InventoryItem("Bolts", 120),
    InventoryItem("Washers", 85),
    InventoryItem("Nuts", 200)
)
```

### Mechanical Walkthrough

- `data class InventoryItem(val name: String, var quantity: Int)` —
  reappearing, the exact mixed-mutability shape just proven: `name`
  immutable (nothing in this project's requirements ever renames an
  existing row, the identical reasoning Java's Lesson 22 already gave),
  `quantity` mutable (a later milestone edits it in place).
- `mutableListOf(...)` — **first appearance.** Kotlin's standard-library
  function for building a real, mutable list from the values given —
  the direct equivalent of Java's `new ArrayList<>()` followed by three
  separate `.add(...)` calls, collapsed into one expression. The
  distinction between `mutableListOf` and a plain `listOf` (an
  immutable list, not used here) is covered fully once this series'
  RecyclerView-equivalent lesson actually needs to add and remove rows.

### SE Lens

**Given `data class` doesn't force full immutability, is there still a
real reason to prefer `val` properties where a class doesn't specifically
need to change, rather than defaulting every property to `var` out of
convenience?** Yes — this is the same **minimize the mutable surface**
reasoning Java's own Lesson 22 SE Lens already applied to `InventoryItem`
specifically choosing not to add a `setName`: every `var` is a place
some other, possibly distant, piece of code could later change a value
out from under code that assumed it was fixed. `data class` removing the
immutability *tradeoff* record forced doesn't remove the *design*
question of which fields genuinely need to change — it just means the
answer can be decided per-property, honestly, instead of being forced to
an all-or-nothing choice by the tool.

---

## Connect the Pieces

One trace: `data class InventoryItem(val name: String, var quantity:
Int)` generated, from one line, everything Java's Lesson 22 wrote by
hand across four separate pieces (constructor, two getters, one setter)
— confirmed field-for-field with `javap` — plus real `equals()`,
`hashCode()`, `toString()`, and `copy()`, none of which Java's version
had, without giving up `quantity`'s mutability the way Java's `record`
alternative would have required. `corner == corner2` proved that
generated `equals()` is what Kotlin's own `==` operator actually calls,
a real, load-bearing difference from Java's reference-comparing `==`.
`copy()` and destructuring both proved to be ordinary generated methods
underneath convenient syntax, the same "real mechanism, shorter
spelling" pattern this series has now seen for extension functions,
SAM conversion, and `data class` alike.

## What Breaks Without This

Remove `data` from `data class InventoryItem(...)`, leaving a plain
`class`, and re-run the equality check from this lesson's own lab
(`InventoryItem("Bolts", 120) == InventoryItem("Bolts", 120)`).

Real output, from running this yourself: `false` — with no `data`
keyword, no `equals()` is generated, so Kotlin's `==` falls back to
`===`'s reference comparison, exactly like Java's own `==` on two
separate `Point` objects would report `false` even with identical
fields. Restore `data` before moving on.

## Exercises

1. Remove `var` from `quantity`, making it `val` like `name`, and try to
   compile a line that assigns `bolts.quantity = 200` afterward. Read
   the real compiler error and connect it to this series' own Lesson 03
   explanation of what a `val` property actually restricts.
2. Using `javap -p`, confirm a plain (non-`data`) version of `Point`
   generates no `equals`, `hashCode`, `toString`, `copy`, or `component1`/
   `component2` methods at all — direct, disassembled proof of exactly
   what the single word `data` is responsible for adding.
3. Destructure an `InventoryItem` inside a `for` loop over the
   `mutableListOf(...)` list from this lesson (`for ((name, quantity) in
   items) { ... }`) and print each row — confirming destructuring works
   the same way inside a loop as it does in a single `val (...)`
   declaration.

## Definition of Done

- [ ] You ran every lab in this lesson and can state, precisely, what
      `data` adds beyond what a plain primary constructor already gives.
- [ ] You can explain the real difference between `==` and `===` in
      Kotlin, and why a Java-trained instinct about `==` is actively
      wrong here rather than just imprecise.
- [ ] You disassembled a mixed-`val`/`var` `data class` yourself and can
      point to exactly which generated members came from `data` versus
      from the primary constructor alone.
- [ ] `InventoryItem.kt` exists with the shape shown above, and a real,
      populated `mutableListOf` of three sample rows exists (wired into
      a real Activity next lesson).
- [ ] Commit: `git commit -m "Add InventoryItem as a data class with a
      mutable quantity and populate a sample list"` — explaining the
      mixed val/var choice, not just the new file.

Next: a second screen — `Intent`, `startActivity`, and Kotlin's own
navigation mechanics, unchanged from Java in the ways that matter most.
