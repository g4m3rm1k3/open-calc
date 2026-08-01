# Lesson 17: Adding a Row — State Hoisting

**What you will build:** A real "Add Item" form beneath the inventory
list, adding a genuine new `InventoryItem` that the list visibly
displays — but only after this lesson deliberately builds a broken
version first, to make a real Compose architecture question impossible
to skip past. The transferable problem: Java's Lesson 28 named its own
real, easy-to-forget step directly — `RecyclerView` has no way to know
the list changed unless explicitly told, via `notifyItemInserted`.
Compose doesn't have that specific problem (Lesson 15 already proved
recomposition happens automatically once observable state changes) — but
it has a different one, just as real: which composable actually *owns*
the list, when two separate pieces of UI (the list itself, and the form
adding to it) both need to see and affect the exact same data?

**What you need to know first:** This series' Lesson 15 (`remember`,
`mutableStateOf`, recomposition), Lesson 16 (`InventoryList`,
`mutableStateListOf`, the real inventory screen this lesson extends).
Java's Lesson 28 (the dialog-vs-second-screen tradeoff for where "add"
lives, and `notifyItemInserted` — referenced for contrast, not ported;
this lesson doesn't need an equivalent to `notifyItemInserted` at all,
for a reason this lesson proves directly).

**Terms introduced in this lesson:**
- **State hoisting** — moving a piece of state up to the nearest
  composable that's a common ancestor of every composable that needs to
  read or change it, rather than letting more than one composable
  independently `remember` its own separate copy.
- **Stateless composable** — a composable with no `remember`ed state of
  its own, receiving everything it displays as parameters and reporting
  every change via callback parameters instead of mutating anything
  directly.

---

## Concept Unit: The Problem, Built Wrong on Purpose

### The Problem

The inventory screen needs a small form — a name field, a quantity
field, an "Add" button — living alongside the list it adds to. The most
obvious first attempt: give the form composable its own `remember`ed
state for the two typed fields, and, since it's the piece of code that
actually knows a new item was just created, let it hold the *list* too.

### The Broken Version

```kotlin
@Composable
fun AddItemForm() {
    var name by remember { mutableStateOf("") }
    var quantityText by remember { mutableStateOf("") }
    val items = remember { mutableStateListOf<InventoryItem>() }

    Column {
        TextField(value = name, onValueChange = { name = it })
        TextField(value = quantityText, onValueChange = { quantityText = it })
        Button(onClick = {
            items.add(InventoryItem(name, quantityText.toIntOrNull() ?: 0))
            name = ""
            quantityText = ""
        }) {
            Text(text = "Add")
        }
    }
}
```

```kotlin
setContent {
    val items = remember {
        mutableStateListOf(
            InventoryItem("Bolts", 120),
            InventoryItem("Washers", 85),
            InventoryItem("Nuts", 200)
        )
    }
    Column {
        InventoryList(items)
        AddItemForm()
    }
}
```

When you build and run this yourself: typing a name and quantity and
tapping "Add" does something visible — but not to the list on screen.
`AddItemForm`'s own `items` (a second, completely separate
`mutableStateListOf<InventoryItem>()`, starting empty) is what actually
receives the new row; `InventoryList` is still displaying the first
list, declared separately inside `setContent`, which never changes at
all. Two composables each called `remember { mutableStateListOf(...) }`
independently, and got two independent, out-of-sync lists — not one
shared list two different pieces of UI both look at.

### CS Lens

This is a real, concrete instance of **state duplication** — the same
family of bug parallel-array tracking (Java's Lesson 22 own opening
justification for `InventoryItem` existing at all: "not as two
separately tracked, easily-mismatched lists") warns against, here
appearing not as two arrays but as two independent `remember` blocks
that each believe they own the single source of truth.

---

## Concept Unit: State Hoisting — One Owner, Passed Down, Reported Up

### The Problem

Fix the duplication by deciding, deliberately, which composable is
actually the *owner* of the list — and give every other composable that
needs it a way to read and change it without owning a copy of its own.

### The Fix

```kotlin
@Composable
fun AddItemForm(onAdd: (InventoryItem) -> Unit) {
    var name by remember { mutableStateOf("") }
    var quantityText by remember { mutableStateOf("") }

    Column {
        TextField(value = name, onValueChange = { name = it })
        TextField(value = quantityText, onValueChange = { quantityText = it })
        Button(onClick = {
            onAdd(InventoryItem(name, quantityText.toIntOrNull() ?: 0))
            name = ""
            quantityText = ""
        }) {
            Text(text = "Add")
        }
    }
}
```

```kotlin
setContent {
    val items = remember {
        mutableStateListOf(
            InventoryItem("Bolts", 120),
            InventoryItem("Washers", 85),
            InventoryItem("Nuts", 200)
        )
    }
    Column {
        InventoryList(items)
        AddItemForm(onAdd = { newItem -> items.add(newItem) })
    }
}
```

`items` now lives in exactly one place — inside `setContent`, the
nearest composable that's a genuine common ancestor of both
`InventoryList` (which reads it) and `AddItemForm` (which needs to add
to it). This is called **state hoisting**: the state was moved *up* to
the lowest point in the composable tree that both consumers share,
rather than living inside either consumer directly. `AddItemForm` no
longer holds a list at all — it takes a parameter, `onAdd: (InventoryItem)
-> Unit`, a real Kotlin function type (this series' own Lesson 08
concept), and calls it with the newly built item instead of mutating
anything itself. `AddItemForm` still legitimately `remember`s `name` and
`quantityText` — that state genuinely belongs to the form alone; nothing
outside it ever needs to read or share the in-progress, not-yet-submitted
text. The rule state hoisting actually applies is narrower than "never
`remember` inside a child composable" — it's "don't let more than one
composable independently own state that others also need to see."

### Discard the Broken Version

The two-independent-lists version from the previous unit is deleted —
its failure was the entire point of building it, not a mistake to leave
half-fixed.

### CS Lens

State hoisting is Compose's own name for **unidirectional data flow** —
state flows down through parameters, events flow up through callbacks,
never the reverse — the same overall shape this series' own Lesson 08
already used for `setOnClickListener` (a callback reporting an event
upward to whoever registered it) and Lesson 16 used for `LazyColumn`'s
`items(...)` (data flowing down into a rendering lambda), now applied
deliberately to an entire composable's relationship with its state
rather than to one single callback.

Also recognized in: React's own explicit "lifting state up" pattern
(the near-identical name is not a coincidence — Compose's design was
directly influenced by React's), and the general architectural principle
behind most modern UI frameworks that a component's props (inputs) and
its emitted events (outputs) should be its entire interface to the rest
of the app, with no hidden, independently-owned state a sibling
component could get out of sync with.

### SE Lens

**Why not just give both composables a reference to the exact same
`mutableStateListOf` object, the way the broken version could have been
"fixed" by passing the same list into both, keeping `AddItemForm`
mutating it directly with `.add(...)`?** That would technically work —
Compose's `SnapshotStateList` really would notify both composables
correctly either way. The real cost of skipping the callback and passing
a mutable list directly is architectural, not functional: `AddItemForm`
would then be a **stateless composable** in name only, still able to
mutate shared data directly from inside its own body, at whatever point
in its code happens to call `.add(...)`. A parameter of type
`(InventoryItem) -> Unit` documents, in the function's own signature,
exactly what `AddItemForm` is allowed to do to the outside world — add
one item, nothing else — and makes `AddItemForm` genuinely reusable and
independently previewable (this series' own Lesson 14 `@Preview`)
against a fake `onAdd = {}` lambda, with no real list needing to exist
at all just to render it.

---

## Concept Unit: Wiring It Into the Real Project

### Project Change

- **Reference Source:** No reference counterpart — an application-
  specific composable and callback shape.
- **Files affected:** `InventoryActivity.kt`.
- **Change type:** Add `AddItemForm`; wrap `InventoryList` and
  `AddItemForm` together inside a `Column`.
- **Location:** Alongside `InventoryList`, inside `setContent`.
- **Dependencies:** This series' own Lesson 16 (`InventoryList`,
  `items`).

### The New Code

Already shown in full above — the fixed, hoisted version.

### Mechanical Walkthrough

- `onAdd: (InventoryItem) -> Unit` — reappearing, this series' own
  Lesson 08 function-type syntax, now used as a composable's own
  parameter rather than an argument to a framework method like
  `setOnClickListener`.
- `quantityText.toIntOrNull() ?: 0` — **first appearance of
  `toIntOrNull()`.** A standard-library function attempting to parse a
  `String` as an `Int`, returning the real parsed value or `null` if the
  text isn't a valid number — never throwing, unlike Java's
  `Integer.parseInt` (used directly, unguarded, in Java's own Lesson 28)
  which throws a `NumberFormatException` on invalid input. `?:` —
  reappearing, this series' own Lesson 02 Elvis operator — supplies `0`
  as a safe fallback when parsing fails, entirely avoiding the crash
  risk Java's version carries.
- `items.add(newItem)` — reappearing, an ordinary mutable-list `.add`
  call, now happening exactly once, in exactly one place — the hoisted
  owner — rather than being reachable from two independent locations the
  way the broken version allowed.

### SE Lens

**Java's Lesson 28 needed a real, separate mechanism —
`notifyItemInserted` — specifically to tell `RecyclerView` a row was
added. Why doesn't this lesson's fixed version need anything
equivalent?** `mutableStateListOf`'s own `.add(...)` already is the
notification — it's a real, observable state container (this series'
own Lesson 16 concept), and any composable that reads it during
composition is automatically re-run when it changes, the same
recomposition mechanism Lesson 15 already proved. `notifyItemInserted`
existed to solve a problem specific to `RecyclerView`'s imperative,
manually-managed `View` tree — telling it precisely which row changed so
it could update only that one row's real `View` objects. Compose's
declarative model (Lesson 14) doesn't have manually-managed views to
selectively update in the first place; the entire class of "did I
remember to notify the right mechanism" bug Java's Lesson 28 named
doesn't exist here, not because Compose is more careful, but because the
underlying problem it would exist to solve doesn't have the same shape.

---

## Connect the Pieces

One trace: this lesson's own broken first attempt proved, by causing a
real, observable bug on purpose, that two composables each independently
`remember`ing a list produces two out-of-sync copies, not one shared
source of truth. Hoisting `items` up into `setContent` — the nearest
common ancestor of `InventoryList` and `AddItemForm` — fixed it by
giving the state exactly one owner. `AddItemForm` became a genuinely
stateless composable with respect to the list: it reports a new item
upward through `onAdd`, a real Kotlin function-type parameter (Lesson
08), and the hoisted owner is the only place `.add(...)` is ever called,
with recomposition (Lesson 15) handling the rest automatically — no
`notifyItemInserted`-equivalent mechanism required at all.

## What Breaks Without This

Reproduce this lesson's own broken version — two independent
`remember { mutableStateListOf(...) }` calls, one inside `AddItemForm`,
one inside `setContent` — build and run it, and add an item through the
form.

Real result, when you do this yourself: the form's own fields clear (
proof `AddItemForm`'s local state updated correctly) but the list on
screen never gains a row — direct, observed proof of the exact
state-duplication failure this lesson's own first unit predicted, not
merely asserted. Restore the hoisted version before moving on.

## Exercises

1. Add a second stateless composable, `ItemCount(count: Int)`, displaying
   "`$count items`" above the list, reading `items.size` from the
   hoisted state and passed down the same way `InventoryList` is.
   Confirm it updates correctly the moment a new item is added, with no
   `remember` of its own at all — it needs none, since it owns nothing.
2. Deliberately pass the *same* `mutableStateListOf` object directly into
   `AddItemForm` (changing its signature to accept
   `items: MutableList<InventoryItem>` instead of `onAdd`), and call
   `items.add(...)` directly from inside it, restoring the pattern this
   lesson's SE Lens argued against. Confirm it still works at runtime,
   then explain, in your own words, what real capability was lost even
   though the visible behavior is identical.
3. Add a `@Preview` for `AddItemForm` alone, passing `onAdd = {}` as a
   throwaway no-op lambda, and confirm it renders correctly in Android
   Studio with no real inventory list existing anywhere — direct proof
   of the independent-previewability this lesson's SE Lens named as
   state hoisting's real payoff.

## Definition of Done

- [ ] You built and ran the broken, duplicated-state version yourself
      and observed the real, visible bug it causes.
- [ ] You can explain, precisely, what state hoisting means and why
      `AddItemForm`'s own `name`/`quantityText` fields correctly stay
      un-hoisted while `items` does not.
- [ ] Adding an item through the real form updates the visible list,
      verified on a running emulator or device.
- [ ] You can explain why no `notifyItemInserted`-equivalent call is
      needed anywhere in the fixed version.
- [ ] Commit: `git commit -m "Add AddItemForm with hoisted list state
      instead of duplicated per-composable state"` — explaining the
      hoisting decision and the bug it fixes, not just the new form.

Next: deleting a row — and the real limit of everything this milestone
has built so far, once a device rotation is deliberately caused to wipe
the entire list on purpose.
