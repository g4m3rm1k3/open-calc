# Lesson 20: `StateFlow` — Observable State, Properly Encapsulated

**What you will build:** `InventoryViewModel`, revised — its list is no
longer a publicly mutable property any composable could reach in and
directly `.add()` to, but a real `StateFlow`, read-only from outside,
changeable only through `addItem`/`deleteItem`. The transferable
problem: Lesson 19's `InventoryViewModel` fixed *survival* but left a
real, honest gap open — `val items = mutableStateListOf(...)` is public
and fully mutable, meaning `viewModel.items.add(SomeItem)` compiles
fine from anywhere, completely bypassing the two methods that were
supposed to be the only way to change this list. This lesson closes
that gap with a real, verified Kotlin mechanism, and, in doing so, lays
the groundwork the next several lessons need: `StateFlow` is how a
`ViewModel` exposes state produced by asynchronous work — including the
permission flow this milestone builds toward — not just synchronous
list edits.

**What you need to know first:** This series' Lesson 13
(`private`/encapsulation reasoning, reapplied here to a property instead
of a field), Lesson 19 (`InventoryViewModel`, the gap this lesson
closes).

**Terms introduced in this lesson:**
- **`MutableStateFlow<T>`** — a real, observable holder for a value of
  type `T`, readable and writable through its `.value` property.
- **`StateFlow<T>`** — the read-only supertype of `MutableStateFlow<T>`;
  its `.value` is a `val`, not a `var` — no public way to write it.
- **`.asStateFlow()`** — converts a `MutableStateFlow` into a plain
  `StateFlow` reference, exposing the read-only view without giving up
  the ability to write through the original, private reference.
- **`.collectAsState()`** — a Compose function converting a `StateFlow`
  into Compose's own observable `State`, so reading its value inside a
  composable participates in recomposition (Lesson 15) exactly like
  `mutableStateOf` does.

---

## Concept Unit: The Gap `ViewModel` Alone Left Open

### The Problem

Confirm the gap is real, not hypothetical: `InventoryViewModel`'s
`items` property, as built in this series' own Lesson 19, is declared
`val items = mutableStateListOf(...)` — a `SnapshotStateList`, which
implements Kotlin's `MutableList` interface directly. Nothing stops
`InventoryList` or `AddItemForm`, or any future code touching this
`ViewModel`, from calling `viewModel.items.add(SomeItem)` or
`viewModel.items.clear()` directly — completely outside `addItem`'s and
`deleteItem`'s own logic, with no way for `InventoryViewModel` to ever
add validation, logging, or any other behavior to a change made this
way. This is the exact **encapsulation** risk this series' own Lesson
13 already named for a plain mutable field — reappearing here on a
`ViewModel`'s public property instead.

---

## Concept Unit: `MutableStateFlow` and `StateFlow` — a Real, Read-Only View

### The Problem

A property needs to be genuinely mutable from *inside* its own class,
and genuinely read-only from *outside* it — the exact shape this
series' own Lesson 03 `private set` already solved for an ordinary
property. Does the same shape exist for something Compose needs to
observe for recomposition?

### Introduce the Concept in Isolation

```kotlin
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class InventoryHolder {
    private val _items = MutableStateFlow<List<String>>(listOf("Bolts", "Washers"))
    val items: StateFlow<List<String>> = _items.asStateFlow()

    fun addItem(item: String) {
        _items.value = _items.value + item
    }
}

fun main() {
    val holder = InventoryHolder()
    println(holder.items.value)
    holder.addItem("Nuts")
    println(holder.items.value)
}
```

Compile and run (against `kotlinx-coroutines-core`, a real dependency
this project already has once `ViewModel` and Compose are in place):

```
kotlinc -cp kotlinx-coroutines-core.jar StateFlowDemo.kt -include-runtime -d StateFlowDemo.jar
java -cp StateFlowDemo.jar:kotlinx-coroutines-core.jar StateFlowDemoKt
```

Real output, from running this just now:

```
[Bolts, Washers]
[Bolts, Washers, Nuts]
```

`_items` — a `MutableStateFlow`, `private`, following a real, common
Kotlin naming convention (a leading underscore marking "the private,
writable backing version" of a publicly exposed property) — holds the
real, current list, replaced with a genuinely new list on every change
(`_items.value + item` builds a new list rather than mutating the old
one in place, unlike `mutableStateListOf`'s in-place `.add`). `items`,
the public property, is typed `StateFlow<List<String>>` — the read-only
supertype — obtained via `.asStateFlow()`, which wraps the same
underlying flow without exposing the ability to write to it through this
second reference. Confirm that restriction is real, not just a type
annotation, by trying to write through it directly:

```kotlin
fun main() {
    val holder = InventoryHolder()
    holder.items.value = listOf("Hacked")
}
```

Real output, from running this just now:

```
StateFlowEncap.kt:12:18: error: 'val' cannot be reassigned.
    holder.items.value = listOf("Hacked")
                 ^^^^^
```

`StateFlow<T>.value` is declared `val` on the interface itself — there
is no setter to call at all from outside, a compiler-enforced
restriction, exactly like this series' own Lesson 03 `private set`
proved for an ordinary property, expressed here through a real
supertype/subtype split instead of a single property modifier.

### Discard the Throwaway Example

`InventoryHolder`/`StateFlowDemo.kt` are deleted. This exact
`private MutableStateFlow` / `public StateFlow` pairing is the real
project's own next application.

### CS Lens

`StateFlow`'s split into a private, writable type and a public,
read-only supertype is the same **information hiding** principle behind
Java's Lesson 13 `private` fields with public getters, expressed through
Kotlin's type system rather than through separate getter methods — the
type itself, not a naming convention or documentation comment, is what
prevents external mutation.

### SE Lens

**Why go through a full `MutableStateFlow`/`StateFlow` pair instead of
simply keeping `mutableStateListOf` but marking it `private set` (this
series' own Lesson 03 mechanism), which would also block external
writes?** `private set` blocks *reassigning* the property to a
different list — it does nothing to stop calling `.add()` on the
*existing* list object, since the list itself would still be a fully
mutable `SnapshotStateList` regardless of the property's own
read/write modifier. `StateFlow`'s read-only interface has no mutating
methods at all exposed on the public type — the restriction lives on
the object's own type, not on how a property pointing at it can be
reassigned, which is exactly why it closes this specific gap
completely, where `private set` alone would not.

---

## Concept Unit: `.collectAsState()` — Reading a `StateFlow` Inside Compose

### The Problem

A `StateFlow` is a real, observable value — proven by this lesson's own
lab — but it isn't, itself, the kind of observable state Compose's
recomposition mechanism (Lesson 15) already knows how to watch. Something
has to bridge the two.

### The Mechanism

```kotlin
val items by viewModel.items.collectAsState()
```

`.collectAsState()` is a real Compose function (from
`androidx.lifecycle.viewmodel.compose`/`androidx.compose.runtime`)
that subscribes to a `StateFlow` and produces Compose's own `State`
object from it — the same kind of thing `mutableStateOf` (Lesson 15)
produces directly. `by` — reappearing, this series' own Lesson 15
property delegation concept — lets `items` be read as a plain
`List<InventoryItem>` inside the composable, with every new value the
`StateFlow` emits automatically triggering recomposition of whatever
reads it, the identical mechanism Lesson 15 already proved for a plain
`mutableStateOf` value.

### CS Lens

This is a real, concrete instance of the **Adapter pattern** — this
series' own Lesson 08 concept, reappearing here as a language-boundary
adapter rather than a class-boundary one: `.collectAsState()` adapts
`StateFlow`'s general-purpose, coroutine-based observation model into
the specific shape Compose's own recomposition system expects,
without either side needing to know the other's underlying
implementation.

---

## Concept Unit: Applying It — `InventoryViewModel`, Properly Encapsulated

### Project Change

- **Reference Source:** `kotlinx.coroutines.flow.StateFlow`/
  `MutableStateFlow`, and `androidx.lifecycle.viewmodel.compose.
  collectAsState` — standard, stable Kotlin coroutines and Jetpack
  Compose APIs.
- **Files affected:** `InventoryViewModel.kt`; `InventoryActivity.kt`.
- **Change type:** Replace `items`'s declaration; update how
  `setContent` reads it.
- **Dependencies:** `kotlinx-coroutines-core` (already a transitive
  dependency of `androidx.lifecycle:lifecycle-viewmodel-ktx`, no new
  Gradle line needed).

### The New Code

```kotlin
class InventoryViewModel : ViewModel() {
    private val _items = MutableStateFlow<List<InventoryItem>>(
        listOf(
            InventoryItem("Bolts", 120),
            InventoryItem("Washers", 85),
            InventoryItem("Nuts", 200)
        )
    )
    val items: StateFlow<List<InventoryItem>> = _items.asStateFlow()

    fun addItem(item: InventoryItem) {
        _items.value = _items.value + item
    }

    fun deleteItem(item: InventoryItem) {
        _items.value = _items.value.filter { it != item }
    }
}
```

```kotlin
setContent {
    val viewModel: InventoryViewModel = viewModel()
    val items by viewModel.items.collectAsState()
    Column {
        InventoryList(items, onDelete = { item -> viewModel.deleteItem(item) })
        AddItemForm(onAdd = { item -> viewModel.addItem(item) })
    }
}
```

### Mechanical Walkthrough

- `_items.value = _items.value + item` — reappearing, this lesson's own
  immutable-replacement pattern, now on real `InventoryItem` values.
- `_items.value.filter { it != item }` — **first appearance of
  `filter` in this series.** A standard-library function producing a
  new list containing only the elements for which the given lambda
  returns `true` — here, "every item that isn't the one being deleted."
  `it != item` uses `data class` structural inequality (this series'
  own Lesson 10 `==`, negated), the same value-based comparison Lesson
  18's `items.remove(item)` already relied on, now expressed as a filter
  producing a new list rather than a mutation of an existing one —
  required here because `StateFlow`'s own value must be *replaced*, not
  mutated in place, for `.collectAsState()` to correctly detect a real
  change.
- `viewModel.items.collectAsState()` — reappearing, this lesson's own
  concept, now bridging the real `ViewModel`'s `StateFlow` into the real
  composable that displays it.

### SE Lens

**Why does deleting an item now require building a whole new filtered
list, when Lesson 18's `mutableStateListOf`-based version could just
call `.remove(item)` directly on the existing list?** This is the real,
concrete cost of `StateFlow`'s encapsulation win: `StateFlow` detects a
change by comparing whether a *new* value was assigned to `.value`, not
by watching for in-place mutations the way a `SnapshotStateList`'s own
internal tracking does. Producing a new, filtered list on every delete
is a real, deliberate tradeoff — more allocation than an in-place
removal, in exchange for a state container whose public interface makes
uncontrolled external mutation impossible, and whose type is the same
one this project needs regardless, once genuinely asynchronous state
(the permission flow, two lessons ahead) enters the picture.

---

## Connect the Pieces

One trace: `InventoryViewModel`'s `items` moved from a publicly mutable
`mutableStateListOf` (Lesson 19's own real, left-open gap) to a private
`MutableStateFlow` paired with a public, read-only `StateFlow` — proven,
by a real compiler error, to block direct external writes the way
Lesson 19's version never could. `addItem`/`deleteItem` now build and
assign whole new immutable lists rather than mutating one in place, and
`.collectAsState()` bridges that `StateFlow` into Compose's own
recomposition system (Lesson 15), so `InventoryList` and `AddItemForm`
— still exactly as stateless as Lesson 17 left them — see every change
with no code of their own aware that the underlying mechanism changed
at all.

## What Breaks Without This

Try writing `viewModel.items.value = emptyList()` directly from inside
`setContent`, bypassing `addItem`/`deleteItem` entirely, and attempt to
build.

Real output, from running this yourself: a real compiler error —
`items` is typed `StateFlow<List<InventoryItem>>`, whose `.value` is a
read-only `val`, exactly this lesson's own lab already proved. This is
the concrete, compiler-enforced closing of the exact gap this lesson
opened with: Lesson 19's version would have let this line compile and
silently wipe the list from any careless call site; this version
refuses it outright.

## Exercises

1. Add a `clearAll()` method to `InventoryViewModel` (`_items.value =
   emptyList()`), and confirm this is the *only* way to now empty the
   list — direct proof the `private`/`public` split correctly routes
   every mutation through the `ViewModel`'s own methods.
2. Reproduce this lesson's own compile-error proof yourself, against
   the real project, by attempting `viewModel.items.value = listOf()`
   directly inside `InventoryActivity.kt`.
3. Rewrite `deleteItem` using `_items.value.toMutableList().apply {
   remove(item) }` instead of `.filter { it != item }` (reappearing,
   this series' own Lesson 13 `apply`). Confirm it produces an
   equivalent result, and explain, in your own words, which version
   reads more clearly given `StateFlow`'s own "always assign a whole new
   value" requirement.

## Definition of Done

- [ ] You ran the `StateFlow`/`MutableStateFlow` lab yourself and
      triggered the real "'val' cannot be reassigned" compiler error.
- [ ] `InventoryViewModel`'s `items` is now a properly encapsulated
      `StateFlow`, with `addItem`/`deleteItem` as the only ways to
      change it, verified by attempting and failing to bypass them.
- [ ] The inventory screen still adds, deletes, and survives rotation
      correctly, verified on a running emulator or device.
- [ ] You can explain why deleting now requires `.filter { }` instead of
      `.remove(item)`, and what real property of `StateFlow` requires it.
- [ ] Commit: `git commit -m "Encapsulate InventoryViewModel's list
      behind a StateFlow instead of a publicly mutable list"` —
      explaining the encapsulation gap this closes, not just the
      refactor.

Next: the real Inversion-of-Control problem Java's Lesson 33 named
directly — a permission request that returns immediately, with the real
answer arriving later, from a separate process — and Kotlin's
coroutines, built specifically to answer it.
