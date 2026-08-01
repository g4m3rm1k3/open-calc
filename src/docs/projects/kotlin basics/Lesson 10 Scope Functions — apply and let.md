# Lesson 10: Scope Functions — `apply` and `let`

**What you will build:** The grid screen's `RecyclerView` wired to its
`LayoutManager` and `Adapter`, using `apply` — one of Kotlin's **scope
functions**, a real, idiomatic pattern with no direct Java equivalent.
The transferable problem: configuring an object by calling several
setters on it, one after another, is common enough that Kotlin has a
dedicated, distinctive syntax for it — worth understanding as a real
language feature, not just "some extra dots that appeared."

**What you need to know first:** `RecyclerView`'s `setLayoutManager`/
`setAdapter` and why both are needed; Lesson 07 (trailing lambdas).

**Terms introduced in this lesson:**
- **Scope function** — a small family of standard-library functions
  (`apply`, `let`, `also`, `run`, `with`) that run a lambda against a
  given object, differing in what the lambda refers to that object as,
  and what the whole expression evaluates to.
- **`apply`** — runs a lambda with the receiver available as `this`,
  and returns the receiver itself.
- **`let`** — runs a lambda with the receiver available as `it`, and
  returns the lambda's own result; commonly chained after a safe call.

---

## Concept Unit: `apply` — Configure, Then Return the Same Object

### The Problem

Setting several properties on one newly created object — the exact
shape `RecyclerView`'s setup needs — normally requires repeating the
object's own name on every line: `recyclerView.layoutManager = ...`,
then `recyclerView.adapter = ...`. Kotlin has a way to say "the next
several lines are all about this one object" once, instead of on every
line.

### Introduce the Concept in Isolation

```kotlin
class Paint {
    var color: String = "black"
    var strokeWidth: Int = 1
}

fun main() {
    val paint = Paint().apply {
        color = "red"
        strokeWidth = 5
    }

    println("${paint.color}, ${paint.strokeWidth}")
}
```

Compile and run:

```
kotlinc ApplyDemo.kt -include-runtime -d ApplyDemo.jar
java -jar ApplyDemo.jar
```

Real output:

```
red, 5
```

`Paint().apply { ... }` — **`apply`** runs the lambda that follows with
the object it's called on (`Paint()`, just constructed) available as
`this`, implicitly — `color = "red"` inside the block is really
`this.color = "red"`, with `this` omittable exactly the way it's always
omittable when unambiguous inside a method. The entire `apply` call —
receiver, plus its configuration block — evaluates to **the receiver
itself**, which is why `val paint = Paint().apply { ... }` correctly
assigns a real, configured `Paint` object to `paint`, not the `Unit`
the lambda block itself would produce.

### Discard the Throwaway Example

`Paint` is deleted now. `recyclerView`, next, is configured the same
way, for real.

### CS Lens

`apply` is a **lambda with receiver** — Kotlin's own term for a lambda
whose body runs as if it were a method *on* a specific object, rather
than a plain, standalone block. This is the same underlying mechanism
Kotlin uses to build DSL-style APIs (Lesson 07's CS Lens already
flagged this) — `apply`'s block reading like a small, dedicated
configuration language for exactly one object is not a coincidence, it's
the same feature applied to the standard library's own simplest,
most common case.

### SE Lens

**Why prefer `apply` over just calling `.layoutManager = ...` and
`.adapter = ...` as two separate, ordinary statements?** For exactly two
properties, the difference is genuinely small — a real, honest
observation, not oversold. `apply`'s actual payoff grows with the
number of properties being configured at once, and with whether the
object is being configured immediately after construction (the common
case `apply` specifically reads well for): grouping "everything about
setting this one object up" into one visually-scoped block communicates
intent — "this is initialization" — more directly than an unmarked
sequence of statements that happen to reference the same variable
repeatedly.

---

## Concept Unit: Wiring the `RecyclerView`

### The Problem

With `apply` understood, the grid screen's `RecyclerView` setup —
identical in requirement to the Java version — can be written in
Kotlin's own idiomatic shape.

### The New Code

```kotlin
binding.inventoryRecyclerView.apply {
    layoutManager = LinearLayoutManager(this@InventoryActivity)
    adapter = InventoryAdapter(items)
}
```

### The Updated Project

```kotlin
package com.yourname.yourapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.yourname.yourapp.databinding.ActivityInventoryBinding

class InventoryActivity : AppCompatActivity() {
    private lateinit var binding: ActivityInventoryBinding
    private val items = mutableListOf(
        InventoryItem("Bolts", 120),
        InventoryItem("Washers", 85),
        InventoryItem("Nuts", 200)
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityInventoryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.inventoryRecyclerView.apply {        // ← new
            layoutManager = LinearLayoutManager(this@InventoryActivity)
            adapter = InventoryAdapter(items)
        }
    }
}
```

### Mechanical Walkthrough

- `private val items = mutableListOf(InventoryItem("Bolts", 120), ...)`
  — reappearing `data class` construction (Lesson 08), `mutableListOf`
  (reappearing, Lesson 09) building a real, growable list directly from
  its initial contents — no separate `.add()` calls needed the way the
  Java version's `ArrayList` + repeated `.add()` required, since
  `mutableListOf` itself accepts any number of initial elements.
- `binding.inventoryRecyclerView.apply { ... }` — this lesson's own
  concept, applied for real.
- `layoutManager = LinearLayoutManager(this@InventoryActivity)` —
  **first appearance of qualified `this`.** Inside the `apply` block,
  plain `this` now refers to the `RecyclerView` itself (the receiver
  `apply` is scoped to) — but `LinearLayoutManager`'s own constructor
  needs a `Context`, specifically the enclosing `InventoryActivity`, not
  the `RecyclerView`. `this@InventoryActivity` is Kotlin's **qualified
  this** syntax: explicitly naming *which* enclosing scope's `this` is
  meant, needed the moment a lambda-with-receiver (or a nested class)
  creates more than one possible meaning for a bare `this`.
- `adapter = InventoryAdapter(items)` — reappearing `data class`/
  `MutableList` construction, passing the exact same `items` reference
  (the Java series' own reference-aliasing lesson, reapplied here in
  Kotlin with no change to the underlying reference-sharing fact) into
  the adapter's own constructor.

### SE Lens

**Why does `this@InventoryActivity` matter enough to require its own
explicit syntax, rather than Kotlin just picking "the nearest sensible
one"?** Silently guessing which enclosing `this` a bare reference means
would be a real, dangerous ambiguity the moment nested scopes disagree
about what `this` should mean — Kotlin instead requires the ambiguous
case to be resolved explicitly, by name, the same general design stance
already seen in `override` being required rather than optional: prefer
a compile-time requirement for clarity over a runtime surprise from a
guessed default.

---

## Connect the Pieces

One trace: `binding.inventoryRecyclerView.apply { ... }` configured the
`RecyclerView`'s two required properties in one visually-scoped block,
evaluating to the `RecyclerView` itself. Inside that block, plain
`this` correctly referred to the `RecyclerView`, while
`this@InventoryActivity` explicitly reached past it to the enclosing
`Context` `LinearLayoutManager` actually needed — both real, necessary
Kotlin mechanisms, not stylistic flourishes.

## What Breaks Without This

Remove `this@InventoryActivity`'s qualifier, leaving bare `this`, inside
the `apply` block:
`layoutManager = LinearLayoutManager(this)`. Real error:

```
error: type mismatch: inferred type is RecyclerView but Context was expected
```

confirming precisely what qualified `this` was disambiguating: inside
this `apply` block, unqualified `this` really is the `RecyclerView`,
not the Activity — and `LinearLayoutManager` correctly rejects it.

## Exercises

1. Rewrite the `RecyclerView` setup *without* `apply`, as two ordinary
   statements (`binding.inventoryRecyclerView.layoutManager = ...`,
   then `binding.inventoryRecyclerView.adapter = ...`), and confirm it
   behaves identically — direct proof `apply` is a real convenience,
   not a different underlying mechanism.
2. Try `let` in place of `apply` on the same `RecyclerView` setup
   (`binding.inventoryRecyclerView.let { it.layoutManager = ...; it.adapter
   = ... }`) and confirm it also technically works, but observe the
   resulting expression's type is now `Unit`, not the `RecyclerView` —
   confirming precisely why `apply`, not `let`, is the correct tool when
   the configured object itself needs to be the result.

## Definition of Done

- [ ] You ran the `apply` lab and can explain what the whole expression
      evaluates to.
- [ ] You triggered the real type-mismatch error from an unqualified
      `this` inside the `apply` block, and can explain why.
- [ ] The grid screen displays the same three sample rows as the Java
      version, wired through Kotlin's own idiom.
- [ ] Commit: `git commit -m "Wire RecyclerView using apply; build
      items with mutableListOf"` — explaining the scope-function choice,
      not just that the grid now shows data.

Next: adding a row — named arguments, default parameter values, and
exactly how much of Java's method-overloading machinery Kotlin lets you
avoid needing in the first place.
