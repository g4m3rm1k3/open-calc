# Lesson 11: Adding a Row — Named and Default Arguments

**What you will build:** The "Add Item" dialog, rebuilt in Kotlin —
reading two typed values, constructing a new `InventoryItem`, and
notifying the adapter, using a real, different Kotlin mechanism for
something the Java version needed method overloading to express
cleanly. The transferable problem: overloading (declaring several
methods sharing a name, distinguished by parameter shape) is one real
way to offer callers flexibility in what they supply. Kotlin has a
second, often-preferred way, worth understanding as a genuine
alternative, not a replacement that makes overloading obsolete.

**What you need to know first:** Java's method overloading and how
overload resolution works; `AlertDialog.Builder`'s real, chained API;
`notifyItemInserted`.

**Terms introduced in this lesson:**
- **Named argument** — supplying a function argument as `name = value`
  at the call site, identifying it by parameter name instead of
  position.
- **Default parameter value** — a function parameter declaring its own
  fallback value, making it optional for callers who don't need to
  override it.

---

## Concept Unit: Default Parameter Values

### The Problem

Java's method overloading (a dedicated lesson in the Java series' own
Milestone 4) exists largely to offer callers optional parameters:
`greet(name)` and `greet(name, timesToRepeat)` as two separate method
bodies, one calling the other. Kotlin can express "this parameter is
optional, with a sensible fallback" directly, without writing a second
method at all.

### Introduce the Concept in Isolation

```kotlin
fun greet(name: String, greeting: String = "Hello"): String {
    return "$greeting, $name"
}

fun main() {
    println(greet("Alex"))
    println(greet("Alex", "Hi"))
    println(greet(name = "Sam", greeting = "Hey"))
    println(greet(greeting = "Yo", name = "Sam"))
}
```

Compile and run:

```
kotlinc DefaultArgsDemo.kt -include-runtime -d DefaultArgsDemo.jar
java -jar DefaultArgsDemo.jar
```

Real output:

```
Hello, Alex
Hi, Alex
Hey, Sam
Yo, Sam
```

`greeting: String = "Hello"` declares a **default parameter value** —
callers may omit it entirely (`greet("Alex")`), and the fallback
applies. This is **one function**, not two — unlike Java's overloading,
there is no second method body anywhere; the compiler fills in the
default at each call site that doesn't supply its own value. The third
and fourth calls use **named arguments** — `name = "Sam"`, `greeting =
"Hey"` — identifying each argument by the parameter's own declared
name rather than by position; notice the fourth call supplies them in
the *opposite* order from how the function declares them, and still
compiles correctly, because named arguments are matched by name, not
position.

### Discard the Throwaway Example

`greet` is deleted now. `InventoryItem`'s own constructor, next,
already supports both defaults and named arguments with zero extra
code — both are general Kotlin function features, not something a data
class had to opt into separately.

### CS Lens

Default parameter values and named arguments together let one function
signature express what Java's overloading needs several separate method
bodies to express — genuinely reducing, though not eliminating, the
real need for overloading (Kotlin still supports it, and still needs it
for cases where the *types*, not just presence, of parameters
genuinely differ). This is a real, different tradeoff: one function body
to maintain, versus several, each independently simple.

### SE Lens

**Why does Kotlin support both mechanisms instead of picking one?**
Overloading remains the right tool when different parameter *counts or
types* represent genuinely different call shapes a reader should see as
distinct signatures (the Java series' own method-overloading lesson:
`List.remove(int)` vs. `remove(Object)`, fundamentally different operations sharing a
name). Default parameters are the right tool specifically when a single
operation has optional *refinements* to its normal case — exactly this
lesson's `greet` example, and exactly the shape most "just let me skip
this argument" needs actually have.

---

## Concept Unit: Building the Add-Item Dialog

### The Problem

With named and default arguments understood, the add-item flow can now
be built, reusing Lesson 10's `apply`.

### The New Code

```kotlin
private fun showAddItemDialog() {
    val dialogLayout = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(48, 24, 48, 24)
    }

    val nameInput = EditText(this).apply { hint = "Item name" }
    val quantityInput = EditText(this).apply {
        hint = "Quantity"
        inputType = InputType.TYPE_CLASS_NUMBER
    }

    dialogLayout.addView(nameInput)
    dialogLayout.addView(quantityInput)

    AlertDialog.Builder(this)
        .setTitle("Add Item")
        .setView(dialogLayout)
        .setPositiveButton("Add") { _, _ ->
            val name = nameInput.text.toString()
            val quantity = quantityInput.text.toString().toInt()
            addItem(name, quantity)
        }
        .setNegativeButton("Cancel", null)
        .show()
}

private fun addItem(name: String, quantity: Int) {
    items.add(InventoryItem(name, quantity))
    binding.inventoryRecyclerView.adapter?.notifyItemInserted(items.size - 1)
}
```

### Mechanical Walkthrough

- `LinearLayout(this).apply { orientation = ...; setPadding(...) }` —
  reappearing `apply` (Lesson 10), configuring a Java-based View
  constructed in code rather than inflated from XML, same shape as the
  Java version's own manual `LinearLayout` construction.
- `EditText(this).apply { hint = "Item name" }` — `hint` here is a
  Kotlin **property** (Lesson 04's mechanism), corresponding to Java's
  `setHint(String)`; Kotlin exposes many Java setter/getter pairs as
  properties automatically, through a compiler feature called
  **synthetic properties** — `view.setHint(x)`/`view.getHint()` in Java
  becomes `view.hint = x`/`view.hint` in Kotlin, the same getter/setter-
  to-property compression Lesson 04 already proved for Kotlin-authored
  classes, extended here to reach Java classes too.
- `.setPositiveButton("Add") { _, _ -> ... }` — reappearing trailing
  lambda (Lesson 07) and SAM conversion, this time for
  `DialogInterface.OnClickListener`, a **two**-parameter functional
  interface (`onClick(DialogInterface, Int)`). `{ _, _ -> ... }` uses
  Kotlin's **underscore parameter name** — `_` is a real, valid way to
  name a lambda parameter you're required to declare (because there's
  more than one, so no implicit `it` is available) but genuinely never
  use, communicating "this parameter exists but is deliberately
  ignored" more clearly than a name like `dialog` that's never actually
  read anywhere in the block.
- `quantityInput.text.toString().toInt()` — `.toInt()` is a Kotlin
  standard-library function converting a `String` to `Int`, Kotlin's own
  equivalent of Java's `Integer.parseInt(String)`; the same real,
  unguarded risk the Java version named honestly — non-numeric input
  throws `NumberFormatException` here exactly as it did there.
- `addItem(name, quantity)` — calling the second function below,
  ordinary positional arguments here since both are always supplied and
  the order is already natural.
- `items.add(InventoryItem(name, quantity))` — reappearing `data class`
  construction and `MutableList.add`.
- `binding.inventoryRecyclerView.adapter?.notifyItemInserted(...)` —
  **first appearance of a safe call on a real Android property in this
  context.** `RecyclerView.adapter` is declared nullable in Kotlin
  (`Adapter<*>?`) — genuinely, a `RecyclerView` might not have an
  adapter set yet at the point this is called — so reaching it requires
  `?.`, exactly Lesson 02's mechanism, applied here instead of an
  unguarded assumption the adapter is definitely present.

### CS Lens

Synthetic properties are another instance of Lesson 05's "sugar with a
verifiable mechanical translation": Kotlin recognizes any Java
`getX()`/`setX(value)` pair and exposes it as a property automatically —
confirmable by disassembling the compiled call site and finding the
real `setHint`/`getHint` calls underneath, the same kind of proof
already trusted for `main`'s generated wrapper class and SAM conversion.

### SE Lens

**Why does `RecyclerView.adapter` need a safe call here but
`binding.usernameField` never did?** `binding`'s properties (Lesson 06)
are guaranteed non-null specifically because the View Binding tooling
verified every one exists in the real, inflated layout. `RecyclerView.adapter`
carries no equivalent build-time guarantee — a `RecyclerView` is
frequently constructed and used before an adapter is ever assigned to
it (this project's own earlier code did exactly that, briefly, between
inflation and the `apply` block that set it) — so Kotlin correctly
represents it as genuinely, sometimes, absent.

---

## Connect the Pieces

One trace: tapping "Add Item" builds a dialog using `apply` for both the
container and its two fields. Tapping "Add" inside it reads both
values, converts the quantity with `.toInt()`, and calls `addItem` —
which appends a new `InventoryItem` (Lesson 08's data class) to the
same shared `items` list the adapter already reads from, then safely
notifies the adapter of the exact new position, only if one is
currently present.

## What Breaks Without This

Remove the safe call, writing
`binding.inventoryRecyclerView.adapter!!.notifyItemInserted(...)`
instead, and temporarily comment out the earlier line that assigns
`adapter` in `onCreate`, simulating a state where none is set yet. Real
result:

```
kotlin.KotlinNullPointerException
```

thrown directly by `!!`, exactly as Lesson 03 predicted — confirming
the safe call in the real code isn't defensive decoration, it's
handling a genuinely possible state. Restore both the adapter
assignment and the safe call before moving on.

## Exercises

1. Give `addItem` a default value for `quantity` —
   `private fun addItem(name: String, quantity: Int = 1)` — and add a
   call site using it (`addItem("Free Sample")`), confirming a new item
   is added with quantity `1` with no second argument supplied.
2. Rewrite one `.apply { ... }` block in this lesson as a sequence of
   ordinary property assignments instead, confirming identical
   behavior — the same proof from Lesson 10, reinforced on new code.

## Definition of Done

- [ ] You ran the default-arguments lab and can explain the difference
      between a named-argument call and an ordinary positional one.
- [ ] You can state when overloading is still the right tool versus
      when a default parameter is.
- [ ] You triggered the real `KotlinNullPointerException` from `!!` on
      a genuinely absent adapter, and restored the safe-call version.
- [ ] Tapping "Add Item," filling both fields, and tapping "Add"
      visibly inserts a new row, matching the Java version's behavior.
- [ ] Commit: `git commit -m "Add an AlertDialog-based add-item flow
      using apply and a safe call on RecyclerView.adapter"` — explaining
      the null-safety difference from the Java version, not just the
      port.

Next: deleting a row — smart casts, and the same stale-position risk
from the Java version, resolved with Kotlin's own null-safety tools.
