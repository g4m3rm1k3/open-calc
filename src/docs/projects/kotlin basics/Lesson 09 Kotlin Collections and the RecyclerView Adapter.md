# Lesson 09: Kotlin Collections and the `RecyclerView` Adapter

**What you will build:** `InventoryAdapter`, rebuilt in Kotlin —
fulfilling the identical `RecyclerView.Adapter` contract, with two real
Kotlin-specific differences worth understanding precisely: a
read-only/mutable split in the collection type itself, and a second
inversion of a Java default, exactly parallel to Lesson 05's
`open`/`final` inversion, this time for nested classes. The transferable
problem: `RecyclerView.Adapter`'s real contract doesn't change at all
between languages — what changes is how Kotlin expresses "a list that
can grow" and "a class nested purely for organization," and both
differ from Java in a specific, non-obvious direction.

**What you need to know first:** `RecyclerView.Adapter`'s real
contract (`onCreateViewHolder`, `onBindViewHolder`, `getItemCount`,
`ViewHolder`'s constructor); Java's `static` nested class and why it was
needed; `ArrayList<E>`.

**Terms introduced in this lesson:**
- **`List<E>` / `MutableList<E>`** — Kotlin's own collection interfaces;
  `List` exposes no mutating methods at all, at the type level;
  `MutableList` extends it, adding `add`/`remove`/etc.
- **Nested class (Kotlin default)** — a class declared inside another
  carries **no** implicit reference to an enclosing instance by
  default — the opposite of Java's non-static inner class default.

---

## Concept Unit: `List` and `MutableList`

### The Problem

Java's `List` interface always exposes `.add()` and `.remove()`,
whether or not the underlying list is actually meant to be mutated —
calling them on a genuinely immutable list compiles fine and only fails
at runtime, with `UnsupportedOperationException`. Kotlin makes this
distinction part of the type itself.

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val fixed: List<String> = listOf("Bolts", "Washers")
    val growable: MutableList<String> = mutableListOf("Bolts", "Washers")

    growable.add("Nuts")
    println(growable)

    fixed.add("Nuts")
}
```

Attempt to compile this exactly as written. Real error:

```
error: unresolved reference: add
    fixed.add("Nuts")
          ^
```

`List<String>` — Kotlin's own read-only collection interface — simply
does not declare an `add` method **at all**, at the type level; this
isn't a runtime-enforced restriction the way Java's immutable-list
wrapper is, it's a real, different interface with a smaller method set,
checked exactly the same way any other missing-method error would be.
`MutableList<String>` extends `List`, adding the mutating methods
(`add`, `remove`, `set`, ...) on top of everything `List` already
provides. Remove the final line and rerun — real output:

```
[Bolts, Washers, Nuts]
```

### Discard the Throwaway Example

Deleted now. `InventoryAdapter`, next, deliberately chooses which of the
two interfaces fits its own actual needs.

### CS Lens

This is the same **interface segregation** idea already implicit in
Java's own `List`/`ArrayList` split (an interface separate from its
implementation) — Kotlin segregates one level further, splitting the
interface itself by capability (read-only vs. mutable) rather than
exposing every capability through one interface and trusting runtime
checks or documentation to communicate which operations are actually
safe.

### SE Lens

**Why does this matter enough to be a real language feature, rather
than a documentation convention (naming a parameter `readOnlyItems`,
for instance)?** A function accepting `List<InventoryItem>` instead of
`MutableList<InventoryItem>` makes a real, compiler-checked promise to
its caller: "I will not modify what you handed me" — verifiable by the
compiler, not just asserted in a comment a future editor might not
read. `InventoryAdapter` genuinely never needs to add or remove from
its own list directly (a later lesson does that from `InventoryActivity`
instead) — so its own field type should honestly reflect that,
communicating intent precisely rather than granting more capability
than the class actually uses.

---

## Concept Unit: `RecyclerView.Adapter` in Kotlin

### The Problem

With Kotlin's `override` requirement (Lesson 05) and collection
distinction understood, `InventoryAdapter` can be rebuilt exactly
matching the real, unchanged `RecyclerView.Adapter` contract.

### The New Code

```kotlin
package com.yourname.yourapp

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView

class InventoryAdapter(private val items: MutableList<InventoryItem>) :
    RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): InventoryViewHolder {
        val rowView = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_inventory, parent, false)
        return InventoryViewHolder(rowView)
    }

    override fun onBindViewHolder(holder: InventoryViewHolder, position: Int) {
        val item = items[position]
        holder.nameText.text = item.name
        holder.quantityText.text = item.quantity.toString()
    }

    override fun getItemCount(): Int = items.size

    class InventoryViewHolder(rowView: View) : RecyclerView.ViewHolder(rowView) {
        val nameText: TextView = rowView.findViewById(R.id.itemNameText)
        val quantityText: TextView = rowView.findViewById(R.id.itemQuantityText)
    }
}
```

### Mechanical Walkthrough

- `class InventoryAdapter(private val items: MutableList<InventoryItem>) : RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>()`
  — the primary constructor (Lesson 04) directly declares and stores
  `items` in one line — no separate constructor body assigning a field
  is needed at all, unlike the Java version's explicit `this.items =
  items;`. `MutableList<InventoryItem>`, not `List<InventoryItem>`: the
  adapter never mutates it directly, but a later lesson passes the
  *same* list from `InventoryActivity`, which does — the type must
  match what's actually handed in.
- `override fun onCreateViewHolder(...)`, `override fun onBindViewHolder(...)`,
  `override fun getItemCount(): Int` — reappearing `override` (Lesson
  05), applied to all three real, abstract contract methods; note
  `getItemCount(): Int = items.size` uses Kotlin's **expression-body
  function** syntax — `= expression` instead of `{ return expression }`
  — a plain, unnamed shorthand for a function whose entire body is one
  returned value, not a new concept requiring its own lesson, just a
  syntax convenience worth recognizing on sight.
- `class InventoryViewHolder(rowView: View) : RecyclerView.ViewHolder(rowView)`
  — **first appearance of Kotlin's nested-class default.** This class
  is declared inside `InventoryAdapter`, exactly like the Java
  version's `static class InventoryViewHolder` — but notice: no
  modifier equivalent to `static` appears anywhere. This is because
  Kotlin **inverts Java's own nested-class default**, the same
  direction as Lesson 05's `open`/`final` inversion: a class nested
  inside another, in Kotlin, carries **no** implicit reference to an
  enclosing instance *by default* — exactly Java's `static` behavior,
  with no keyword needed to request it. Constructing one, as
  `onCreateViewHolder` does (`InventoryViewHolder(rowView)`), needs no
  enclosing `InventoryAdapter` instance, identical to the Java
  version's own `new InventoryViewHolder(rowView)`. Getting Java's
  *other* behavior — a nested class that **does** carry an implicit
  reference back to its enclosing instance — requires the explicit
  `inner` keyword (`inner class InventoryViewHolder`), the opposite of
  Java, where that behavior is the default and `static` opts out of it.
- `val nameText: TextView = rowView.findViewById(R.id.itemNameText)` —
  reappearing property syntax (Lesson 04); note `findViewById` is used
  here, deliberately, not View Binding — `item_inventory.xml` is
  inflated manually inside `onCreateViewHolder`, outside any Activity's
  own generated binding class, the identical structural reason the Java
  version also used `findViewById` at exactly this one spot.

### CS Lens

Kotlin's nested-class default matches exactly what the Java version had
to request explicitly with `static` — because a `ViewHolder` never
needs to reach back into its owning `Adapter`, Kotlin's default already
produces the correct, lighter-weight shape with zero extra ceremony,
where Java required a deliberate opt-out.

### SE Lens

**Why would Kotlin invert this default too, on top of already
inverting `open`/`final`?** The same reasoning as Lesson 05, applied a
second time: an implicit reference to an enclosing instance is a real,
easy-to-reach-for-without-thinking convenience in Java, and also a real
cost — a memory reference kept alive as long as the nested instance
exists, and a coupling between the two classes that may not be needed
or wanted. Kotlin's designers chose the same pattern twice: make the
lighter-weight, less-coupled option the default, and require a visible
keyword (`open`, `inner`) the moment a design genuinely needs the
heavier alternative.

---

## Connect the Pieces

One trace: `MutableList<InventoryItem>` in `InventoryAdapter`'s
constructor honestly declares that a mutable list is expected, even
though the adapter itself never calls `add`/`remove` on it directly.
`InventoryViewHolder`, nested with no `static`-equivalent keyword
needed at all, gets Java's `static class` behavior as Kotlin's own
default — the same inversion already proven for `open`/`final`,
applied to a second, real language default.

## What Breaks Without This

Add `inner` to `InventoryViewHolder`'s declaration
(`inner class InventoryViewHolder(rowView: View) : ...`) and attempt to
construct one exactly as `onCreateViewHolder` already does:
`InventoryViewHolder(rowView)`. Real error:

```
error: 'InventoryAdapter' is not an inner class
```

An `inner` class in Kotlin can only be constructed through an existing
enclosing instance (`this@InventoryAdapter.InventoryViewHolder(rowView)`,
Kotlin's own qualified-outer-instance syntax) — the identical
requirement Java's non-static inner classes impose, now opted into
explicitly. Remove `inner` before moving on.

## Exercises

1. Change `items`'s declared type from `MutableList<InventoryItem>` to
   plain `List<InventoryItem>` and attempt to compile the exact code
   shown above. Confirm it still compiles — `onBindViewHolder`'s
   `items[position]` and `getItemCount`'s `items.size` are both
   read-only operations, available on `List` alone; the type change
   only matters once a later lesson actually needs to mutate this same
   list from outside.
2. Add `inner` to `InventoryViewHolder` correctly this time, updating
   `onCreateViewHolder` to construct it as `this.InventoryViewHolder(rowView)`,
   and confirm it now compiles and runs — then explain, in your own
   words, why this project doesn't actually want this version, given
   `ViewHolder` never needs to reach back into `InventoryAdapter`.

## Definition of Done

- [ ] You triggered the real "unresolved reference: add" error on a
      `List`, and can explain why it's a compile error here rather than
      a Java-style runtime one.
- [ ] You can explain, precisely, what Kotlin's nested-class default is
      and how it differs from Java's.
- [ ] You triggered the real "'InventoryAdapter' is not an inner class"
      error from a misused `inner` class, and understand what it was
      demanding.
- [ ] Commit: `git commit -m "Rebuild InventoryAdapter and
      InventoryViewHolder in Kotlin, using MutableList and Kotlin's
      default nested-class behavior"` — explaining both real
      differences from the Java version, not just the syntax port.

Next: wiring `RecyclerView` together and building the add-item dialog —
scope functions, Kotlin's own idiom for configuring an object in one
expression.
