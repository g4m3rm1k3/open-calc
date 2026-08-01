# Lesson 12: Deleting a Row — Smart Casts and `takeIf`

**What you will build:** The per-row delete button, rebuilt in Kotlin,
handling the identical stale-position risk the Java version solved with
`getBindingAdapterPosition()`. Along the way: **smart casts**, a real,
frequently-encountered Kotlin feature this project's own narrow code
doesn't happen to strictly require — worth learning properly now,
deliberately, rather than only encountering it unexplained the first
time it appears in different code later.

**What you need to know first:** `getBindingAdapterPosition()`/
`RecyclerView.NO_POSITION` and the stale-position bug it prevents;
Lesson 02 (nullable types); Lesson 10 (`let`).

**Terms introduced in this lesson:**
- **Smart cast** — after a `null` check or an `is` type check, Kotlin's
  compiler automatically treats the checked value as the narrower type
  for the rest of that scope, with no explicit cast needed.
- **`takeIf`** — a standard-library function returning the receiver
  unchanged if a condition holds, or `null` if it doesn't — turning a
  condition into a nullable value usable with a safe call.

---

## Concept Unit: Smart Casts

### The Problem

Java requires an explicit cast even immediately after a type check that
already proved it safe (`if (x instanceof String) { String s = (String)
x; ... }`) — the check and the cast are two separate steps, and nothing
stops a typo from casting to the wrong type despite the check just
performed. Kotlin's compiler is able to do better, because it can
actually track what a check proved.

### Introduce the Concept in Isolation

```kotlin
fun describe(value: Any) {
    if (value is String) {
        println("Length: ${value.length}")
    }
}

fun describeNullable(value: String?) {
    if (value != null) {
        println("Length: ${value.length}")
    }
}

fun main() {
    describe("hello")
    describe(42)
    describeNullable("hi")
    describeNullable(null)
}
```

Compile and run:

```
kotlinc SmartCastDemo.kt -include-runtime -d SmartCastDemo.jar
java -jar SmartCastDemo.jar
```

Real output:

```
Length: 5
Length: 2
```

`if (value is String)` — Kotlin's own type-check operator, the
equivalent of Java's `instanceof`. Inside that `if` block,
`value.length` is called directly — no cast, `(value as String).length`,
written anywhere — and it compiles and runs correctly. This is a
**smart cast**: the compiler itself tracked that the `is String` check
just proved `value`'s real type within this exact scope, and
automatically treats `value` as `String` for the rest of that block,
without any separate cast statement required. `describeNullable`
proves the identical mechanism applies to null checks, not just type
checks: inside `if (value != null)`, `value` — declared `String?` — is
smart-cast to plain `String` for that block, which is *why*
`value.length` is legal there with no `?.` or `!!` needed at all.
`describe(42)` produced no output at all — `42 is String` is `false`,
the `if` body never ran, proving the check is real, not decorative.

### Discard the Throwaway Example

`describe`/`describeNullable` are deleted now. The delete-row logic,
next, doesn't happen to need this exact pattern (its own guard checks a
plain `Int`, not a nullable or differently-typed value) — but the
mechanism is worth having seen for real before meeting it unexplained
in different code later.

### CS Lens

A smart cast is **flow-sensitive typing**: the compiler tracks a
value's proven, narrower type *along a specific execution path*, not
just from its original declaration — the same category of static
analysis behind modern type systems in TypeScript (narrowing after
`typeof`/`instanceof` checks) and Swift (optional binding). This is a
genuinely more sophisticated compiler capability than Java's own type
checking, which only ever reasons about a variable's single, declared
type, never about what a specific `if` branch has already proven.

### SE Lens

**Why does this matter enough to be a real, named language feature,
rather than "the compiler being slightly smarter" as an incidental
detail?** Java's separate cast-after-check step is a real, repeated
source of a specific class of bug: a check for one type followed by a
cast to a *different* type, typo'd or from stale, since-edited code,
compiling fine and failing only at runtime with `ClassCastException`.
A smart cast removes the possibility of that mismatch entirely, because
there is no second, independently-typed statement to disagree with the
check at all.

---

## Concept Unit: Deleting a Row

### The Problem

With the framework contract and the stale-position risk both already
understood from the Java version, the Kotlin delete listener needs the
identical guard, expressed in Kotlin's own syntax.

### The New Code

```kotlin
holder.deleteButton.setOnClickListener {
    val currentPosition = holder.bindingAdapterPosition
    if (currentPosition != RecyclerView.NO_POSITION) {
        items.removeAt(currentPosition)
        notifyItemRemoved(currentPosition)
    }
}
```

### Mechanical Walkthrough

- `holder.bindingAdapterPosition` — Kotlin exposes
  `getBindingAdapterPosition()` as a synthetic property (Lesson 11's own
  mechanism), same real method, same real return type (`Int`, never
  nullable — `RecyclerView.NO_POSITION` is a real, ordinary `-1`
  constant, not `null`, which is exactly why this specific guard doesn't
  need a smart cast: there is no nullable or differently-typed value
  here to narrow, only an ordinary integer comparison).
- `items.removeAt(currentPosition)` — Kotlin's `MutableList` method,
  the direct equivalent of Java's by-index `remove(int)` — named
  differently (`removeAt`, not `remove`) specifically so it can't be
  confused with the other overload, covered next.
- `notifyItemRemoved(currentPosition)` — reappearing, called with an
  implicit `this` referring to the enclosing `InventoryAdapter` itself,
  since this listener is registered inside one of its own methods.

### CS Lens

`removeAt(index)` versus a same-named `remove` overload was the exact
ambiguity the Java series' own overloading lesson had to explain
carefully — `Collection.remove(element)` (by value) versus
`MutableList`'s own `removeAt(index)` (by position) are, in Kotlin,
genuinely different function names, not two overloads of one shared
name. This is a real, deliberate design choice: Kotlin's standard
library avoids exactly the by-value-versus-by-index overload ambiguity
Java's own `List.remove` forced callers to reason about carefully.

### SE Lens

**Why would Kotlin's designers choose distinct names here, when Java
proved overloading works?** Java's two `remove` overloads are
genuinely, famously easy to call by mistake — passing an `int` intending
"remove this value" when the value happens to also be a valid index
autoboxes into the wrong overload silently. Giving the index-based
version its own name (`removeAt`) removes the ambiguity at the language
level, for the cost of one more method name to remember — a real
tradeoff, resolved differently than Java's own choice, for a real,
historically-documented reason.

---

## Concept Unit: A Real Alternative — `takeIf` and `let` Chained

### The Problem

The `if`-based guard above is correct and clear. Kotlin's standard
library offers a genuinely different, more expression-oriented shape
for the identical logic, worth seeing as a real option.

### The Alternative, Shown for Real

```kotlin
holder.deleteButton.setOnClickListener {
    holder.bindingAdapterPosition
        .takeIf { it != RecyclerView.NO_POSITION }
        ?.let { position ->
            items.removeAt(position)
            notifyItemRemoved(position)
        }
}
```

`.takeIf { it != RecyclerView.NO_POSITION }` — **`takeIf`** returns its
own receiver (the `Int` position) unchanged if the lambda's condition is
`true`, or `null` if it's `false` — turning a plain boolean condition
into a nullable value. `?.let { position -> ... }` — reappearing safe
call (Lesson 02) and `let` (Lesson 10, first properly used for real
here): runs its block only when the value chained into it isn't `null`,
with that value available by the name given (`position`, instead of the
implicit `it`, since `it` is already in use one level up for
`takeIf`'s own parameter).

### The Tradeoff

Both versions are fully correct and equally common in real Kotlin
code. The `if`-based version reads more directly for anyone coming
from Java, with the guard condition stated plainly. The
`takeIf`/`let`-chained version expresses the same guard as a single
flowing expression rather than a branching statement, favored by
developers who prefer Kotlin's more functional, chained style — a real
stylistic choice, not a difference in correctness or performance.

---

## Connect the Pieces

One trace: `holder.bindingAdapterPosition` reads the row's real, current
position — the identical value and identical purpose as the Java
version's `getBindingAdapterPosition()`. The `if`-guard (or its
`takeIf`/`let` equivalent) prevents acting on `RecyclerView.NO_POSITION`,
exactly as before, and `items.removeAt(currentPosition)` plus
`notifyItemRemoved(currentPosition)` complete the identical
recycling-safe deletion the Java version proved necessary.

## What Breaks Without This

Remove the guard entirely, calling `items.removeAt(currentPosition)`
unconditionally even when `currentPosition` might be
`RecyclerView.NO_POSITION` (`-1`). Real result:

```
Exception in thread "main" java.lang.IndexOutOfBoundsException: Index: -1
```

the identical real failure mode the Java version's own guard exists to
prevent, now triggered in Kotlin for the identical reason. Restore the
guard before moving on.

## Exercises

1. Run the smart-cast lab's `describe` function against a third type
   (`describe(3.14)`, a `Double`) and confirm the `if (value is String)`
   branch correctly does not run — proving the check, not just the
   smart cast, is doing real work.
2. Convert the `takeIf`/`let` version back to the plain `if` version (or
   vice versa) yourself, from memory, without looking at this lesson's
   code — confirming you understand both forms well enough to produce
   either one, not just recognize them.

## Definition of Done

- [ ] You ran the smart-cast lab and can explain why no explicit cast
      was needed inside either `if` block.
- [ ] You can state why `removeAt` and `remove` are separate names in
      Kotlin's `MutableList`, rather than overloads of one name.
- [ ] You triggered the real `IndexOutOfBoundsException` from removing
      the guard, and restored it.
- [ ] Tapping "Delete" on any row — first, middle, or last — removes
      exactly that row, matching the Java version's behavior.
- [ ] Commit: `git commit -m "Add per-row delete using
      bindingAdapterPosition, guarded against NO_POSITION"` — explaining
      the guard's purpose, not just that a delete button was added.

Next, and last: the SMS permission flow in Kotlin — `when`, and the
same asynchronous, registered-callback pattern from the Java version,
now with every callback a trailing lambda.
