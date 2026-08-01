# Lesson 32: Sealed Interfaces and Generics — Bounded Types

**What you will build:** A generic `Cage<A : Animal>` — the direct
Kotlin counterpart of Java's own Lesson 24 example, reusing this
series' own Lesson 05 `Animal`/`Dog` — plus a `sealed interface`
variant of this series' own Lesson 12 sealed classes, chosen for a real,
specific reason a plain sealed class can't satisfy. The transferable
problem: Java's Lessons 13 and 24 taught bounded generics —
`<T extends View>` on a method, `<A extends Animal>` on a class — as a
real, necessary constraint on an otherwise-unrestricted type parameter.
Kotlin expresses the identical concept with different syntax, and, as
this lesson proves directly, Kotlin's bound syntax can express one real
thing Java's `extends`-based bounds structurally cannot.

**What you need to know first:** Java's Lesson 13 (bounded generic
methods, `<T extends View>`, `findViewById`) and Lesson 24 (bounded
generic classes, `<A extends Animal>`, `Cage<A>`). This series' own
Lesson 02 (nullable types), Lesson 05 (`Animal`/`Dog`), Lesson 12
(`sealed class`, exhaustive `when`).

**Terms introduced in this lesson:**
- **`<T : UpperBound>`** — Kotlin's bounded generic syntax, the direct
  equivalent of Java's `<T extends UpperBound>`.
- **`where`** — Kotlin's syntax for declaring more than one bound on a
  single type parameter.
- **`sealed interface`** — a sealed hierarchy (this series' own Lesson
  12 concept) declared as an interface rather than a class, allowing an
  implementing class to also extend a separate, unrelated class.

---

## Concept Unit: `<T : UpperBound>` — Kotlin's Bound Syntax

### The Problem

Java's Lesson 13 bounded `findViewById`'s type parameter to `View` and
its subtypes specifically, so calling it could never accidentally
return some unrelated type like `String`. Does the identical constraint
exist in Kotlin, spelled differently?

### Introduce the Concept in Isolation

```kotlin
fun <T : Comparable<T>> max(a: T, b: T): T {
    return if (a > b) a else b
}

fun main() {
    println(max(3, 7))
    println(max("apple", "banana"))
}
```

Compile and run:

```
kotlinc ComparableBound.kt -include-runtime -d ComparableBound.jar
java -jar ComparableBound.jar
```

Real output, from running this just now:

```
7
banana
```

`<T : Comparable<T>>` reads directly as Java's `<T extends
Comparable<T>>` would — `:` replacing `extends`, the identical
inheritance-relationship syntax this series' own Lesson 05 already
established for a class's own supertype (`class MainActivity :
AppCompatActivity()`), reused here on a type parameter instead of a
class declaration. `a > b` inside the body is only legal because the
bound guarantees `T` really does have a working `compareTo` — the exact
same guarantee Java's Lesson 13 bound gave `findViewById` about its
return type actually being a `View`. Confirm the bound is real and
enforced, not decorative, with a type that doesn't satisfy it:

```kotlin
class NotComparable(val value: Int)

fun main() {
    val x = NotComparable(3)
    val y = NotComparable(7)
    println(max(x, y))
}
```

Real output, from running this just now:

```
ComparableBoundFail.kt:10:17: error: argument type mismatch: actual type is 'NotComparable', but 'Comparable<uninferred T (of fun <T : Comparable<T>> max)>' was expected.
    println(max(x, y))
                ^
```

A real, precise compiler error, naming exactly what's missing —
`NotComparable` doesn't implement `Comparable`, so it cannot satisfy
`max`'s bound, the direct Kotlin analog of the real risk Java's Lesson
13 bound exists to prevent.

### Discard the Throwaway Examples

`max`, `NotComparable`, and both scratch files are deleted.

---

## Concept Unit: A Bound Java's Generics Structurally Cannot Express

### The Problem

Java's `<T extends X>` bounds are always about class/interface
hierarchy — "must be `X` or a subtype of `X`." Kotlin's type system has
a whole additional axis Java's never had: nullability (this series' own
Lesson 02). Can a Kotlin bound constrain *that* too?

### The Proof

```kotlin
class Box<T>(val value: T)

fun main() {
    val box: Box<String?> = Box(null)
    println(box.value)
}
```

Compiles and runs fine — an unbounded `<T>` accepts a nullable type
argument, `String?`, without complaint. Now add a bound:

```kotlin
class Box<T : Any>(val value: T)

fun main() {
    val box: Box<String?> = Box(null)
    println(box.value)
}
```

Compile:

```
kotlinc Bounded.kt -include-runtime -d Bounded.jar
```

Real output, from running this just now:

```
Bounded.kt:4:18: error: type argument is not within its bounds: type parameter 'T (of class Box<T : Any>)' must be subtype of 'Any', but actual: 'String?'.
    val box: Box<String?> = Box(null)
                 ^^^^^^^^
```

`Any` is Kotlin's own root type — the direct analog of Java's `Object`
— but bounding a type parameter to plain `Any` (rather than the
implicit default every unbounded Kotlin type parameter actually carries,
`Any?`) genuinely excludes nullable types specifically, not just
unrelated classes. This is a real bound Java's own generics have no way
to express at all: Java's type system was never null-aware in the first
place, so "this type parameter may never be a nullable type" isn't a
sentence Java's own `<T extends X>` syntax can even attempt to say.

### CS Lens

Kotlin's default upper bound for an unbounded type parameter being
`Any?`, not `Any`, is a direct, deliberate extension of this series'
own Lesson 02 principle — nullability is part of a type, not a separate
concern layered on top — applied consistently even to generic type
parameters, a place many null-safety retrofits onto older type systems
(Java's own `@Nullable` annotations among them) handle only partially
or optionally.

---

## Concept Unit: `where` — More Than One Bound

### The Problem

A type parameter sometimes genuinely needs to satisfy two unrelated
constraints at once — Java's own bounded generics allow this too
(`<T extends A & B>`), and Kotlin needs an equivalent for the identical
case.

### Introduce the Concept in Isolation

```kotlin
interface Nameable {
    val name: String
}

fun <T> describeIfNameable(item: T) where T : Nameable, T : Comparable<T> {
    println("Nameable and comparable: ${item.name}")
}

data class Tagged(override val name: String, val priority: Int) : Nameable, Comparable<Tagged> {
    override fun compareTo(other: Tagged): Int = priority.compareTo(other.priority)
}

fun main() {
    describeIfNameable(Tagged("Bolts", 1))
}
```

Compile and run:

```
kotlinc WhereClause.kt -include-runtime -d WhereClause.jar
java -jar WhereClause.jar
```

Real output, from running this just now:

```
Nameable and comparable: Bolts
```

`where T : Nameable, T : Comparable<T>` declares both bounds on the same
type parameter `T` — Kotlin's syntax moves multiple bounds out of the
angle brackets entirely, into a separate clause after the parameter
list, rather than Java's `&`-joined single bound inside the brackets.
Both approaches express the identical requirement: whatever `T` actually
is, it must satisfy every listed constraint at once.

### Discard the Throwaway Example

`Nameable`/`describeIfNameable`/`Tagged`/`WhereClause.kt` are deleted.

---

## Concept Unit: Applying Bounded Generics — `Cage<A : Animal>`

### Project Change

- **Reference Source:** No reference counterpart — the direct Kotlin
  translation of Java's own Lesson 24 disposable `Cage<A extends
  Animal>` example, reusing this series' own Lesson 05 `Animal`/`Dog`.
- **Files affected:** None — this remains a disposable lab in both
  series, illustrating the concept before Java's own Lesson 26
  `RecyclerView.Adapter<VH extends ViewHolder>` (ahead of this series)
  meets the identical combination on a real framework class.

### The New Code

```kotlin
open class Animal {
    open fun makeSound(): String = "..."
}

class Dog : Animal() {
    override fun makeSound(): String = "Woof"
}

class Cage<A : Animal>(private val occupant: A) {
    fun describe(): String = "Cage containing an animal that says: ${occupant.makeSound()}"
}

fun main() {
    val dogCage = Cage(Dog())
    println(dogCage.describe())
}
```

### Mechanical Walkthrough

- `open class Animal` / `class Dog : Animal()` — reappearing exactly,
  this series' own Lesson 05 lab, reused rather than rebuilt.
- `class Cage<A : Animal>(private val occupant: A)` — the identical
  bound-on-a-class shape Java's Lesson 24 named, combining a generic
  class (a type parameter belonging to the whole class, not one method)
  with a bound restricting `A` to `Animal` or its subtypes — expressed
  with this lesson's own `:` bound syntax and this series' own Lesson 03
  primary-constructor-property syntax together.
- `occupant.makeSound()` — legal specifically because the bound
  guarantees `occupant` is some kind of `Animal`, which always has a
  `makeSound()` method — the exact same reasoning Java's Lesson 24 gave
  for why its own `Cage`'s bound mattered.

---

## Concept Unit: `sealed interface` — When the Bound Is on Inheritance Itself

### The Problem

This series' own Lesson 12 `sealed class LoginValidation` used up the
one class-inheritance slot every `object`/`class` subtype has — fine for
`Valid`/`InvalidUsername`/`InvalidPassword`, none of which needed to
extend anything else. Is there a sealed shape that doesn't cost that
slot?

### Introduce the Concept in Isolation

```kotlin
open class BaseEntity(val id: Int)

sealed interface SyncStatus

data class Syncing(val progress: Int, val entityId: Int) : BaseEntity(entityId), SyncStatus

fun main() {
    val s = Syncing(42, 7)
    println("id=${s.id} progress=${s.progress}")
}
```

Compile and run:

```
kotlinc SealedInterfaceMulti.kt -include-runtime -d SealedInterfaceMulti.jar
java -jar SealedInterfaceMulti.jar
```

Real output, from running this just now:

```
id=7 progress=42
```

`Syncing` both extends `BaseEntity` (using up its one real
class-inheritance slot) *and* implements `sealed interface SyncStatus` —
something impossible if `SyncStatus` were declared `sealed class`
instead, since Kotlin classes may only ever extend one other class
(this series' own Lesson 05), and that one slot is already spent on
`BaseEntity`. A `sealed interface` still gives every real benefit this
series' own Lesson 12 already proved for a sealed class — a real,
package-restricted, exhaustively-checkable set of implementers — while
leaving each implementing class free to extend something else entirely.
Confirm exhaustiveness still applies identically:

```kotlin
object Idle : SyncStatus
data class Failed(val reason: String) : SyncStatus

fun describe(status: SyncStatus): String {
    return when (status) {
        is Idle -> "idle"
        is Syncing -> "syncing: ${status.progress}%"
        is Failed -> "failed: ${status.reason}"
    }
}
```

Real output, from running this just now (all three cases handled):

```
idle
syncing: 42%
failed: timeout
```

### Discard the Throwaway Examples

Every example in this unit is deleted.

### SE Lens

**When should a real project reach for `sealed interface` instead of
`sealed class`, given both give the identical exhaustiveness
guarantee?** Exactly this lesson's own demonstrated case: whenever an
implementer of the sealed hierarchy might legitimately need to extend
some other, unrelated base class too. This series' own Lesson 12
`LoginValidation` correctly stays a `sealed class`, since none of its
three outcomes have any other class to extend — reaching for `sealed
interface` there would add no real capability, just a different
keyword. The choice is a real, case-by-case judgment about whether the
extra inheritance slot is ever actually needed, not a default to prefer
one over the other universally.

---

## Connect the Pieces

One trace: `<T : Comparable<T>>` proved Kotlin's bound syntax enforces
the identical constraint Java's `<T extends X>` already did, with a real
compiler error confirming it, not just a syntax translation. `Box<T :
Any>` proved Kotlin's bounds can additionally express non-nullability —
a constraint Java's own generics structurally cannot state at all.
`where` handled the multiple-bounds case Java's `&` syntax already
covered, and `Cage<A : Animal>` confirmed the identical bounded-generic-
class shape Java's own Lesson 24 taught, reusing this series' own
Lesson 05 `Animal`/`Dog` directly. `sealed interface`, finally, revisited
this series' own Lesson 12 sealed hierarchy through a genuinely
different lens — not a new capability for exhaustiveness itself, but a
real, concrete answer to the one thing a sealed *class* structurally
can't do: leave its implementers free to extend something else.

## What Breaks Without This

This lesson's own three proofs — the failed `Comparable` bound, the
failed nullable-type-argument bound, and (implicitly) the impossibility
of a `Syncing`-style class extending two separate classes at once if
`SyncStatus` were a `sealed class` instead of a `sealed interface` — are
each real, already-triggered or directly-reasoned failures.

## Exercises

1. Change `Cage<A : Animal>` to plain `Cage<A>` (no bound at all) and
   try to compile `occupant.makeSound()` inside `describe()`. Read the
   real compiler error and connect it directly to why Java's own Lesson
   24 needed the identical bound for the identical reason.
2. Try making `Syncing` extend `BaseEntity` while `SyncStatus` is
   changed back to `sealed class`, and read the real compiler error
   about extending more than one class — direct, hands-on proof of this
   lesson's own `sealed interface` SE Lens.
3. Write a bounded generic function combining this series' own Lesson
   10 `data class` equality with a bound: `fun <T> findDuplicate(items:
   List<T>): T?` (no bound actually needed here, since `==` works on
   any type) — then explain, in your own words, why this particular
   function needs no bound at all, contrasting it with `max`'s real
   need for one.

## Definition of Done

- [ ] You ran every lab in this lesson and triggered both real bound-
      violation compiler errors.
- [ ] You can translate Java's `<T extends X>` to Kotlin's `<T : X>`
      fluently, and state one real bound Kotlin can express that Java's
      generics cannot.
- [ ] You can explain, precisely, when `sealed interface` is the
      correct choice over `sealed class`.
- [ ] Commit: not applicable — every example in this lesson is a
      disposable lab, matching Java's own Lessons 13 and 24.

Next: the retrospective — every fork between the Java and Kotlin series,
laid out in one table, closing this series by making the whole
transition visible as one coherent shape.
