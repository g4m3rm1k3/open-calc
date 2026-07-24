# Lesson 8: A Scrolling List, Compose's Way

*(Calculation History)*

**User Story**
> As a user, I want every calculation I run to appear in a scrollable
> history list.

**What you will build**
Every successful `=` press appends an entry (the expression and its result)
to a visible, scrolling history list below the calculator.

**What you need to know first**
Lesson 7's `CalcResult`. From `../track/`: Lesson 6's `RecyclerView` and
`RecyclerView.Adapter` — this lesson is that exact feature, rebuilt with
Compose's own list mechanism, contrasted directly rather than re-explained
from zero.

---

## Concept Unit: `data class` for a History Entry

### The Problem

A history entry needs to hold two related pieces of data — the expression
that was typed and the result it produced — as one value, not two parallel
lists that could drift out of sync.

### The New Code

```kotlin
data class CalculationEntry(val expression: String, val result: String)
```

### CS Lens

Exactly Lesson 0's `data class` — a value type, holding two immutable
`String` fields — reused here without re-explanation, per the Repetition
Rule: basic syntax explained once, referenced by name after that.

### Connection

This is the same shape `../track/` Lesson 7 ("Data Deserves Its Own Type")
already taught the *principle* of — a real type instead of loose parallel
values — now expressed with one Kotlin keyword instead of a hand-written
Java class with a constructor, getters, and (if you bothered) `equals`.

---

## Concept Unit: `mutableStateListOf` and `LazyColumn`

### The Problem

Lesson 2's `mutableStateOf` tracks changes to a single value being
*replaced* wholesale. A history list needs something different: tracking
items being *added to* an existing list, triggering recomposition only for
what actually changed — appending a fourth item shouldn't force the first
three to redraw.

### The New Code

```kotlin
val history = remember { mutableStateListOf<CalculationEntry>() }

LazyColumn {
    items(history) { entry ->
        Text(text = "${entry.expression} = ${entry.result}")
    }
}
```

### Project Change

- **Reference Source:** No reference counterpart — the Compose-native
  equivalent of `../track/` Lesson 6's `RecyclerView` setup, not a
  line-for-line port (Compose has no `Adapter`/`ViewHolder` concept at all).
- **Files affected:** The calculator screen's composable.
- **Change type:** Add state + append on success.
- **Location:** Alongside `expression` from Lesson 5; append inside the
  `"="` branch of `onButtonPressed`, only on `CalcResult.Ok`.
- **Dependencies:** Lesson 7's `CalcResult`.

### The Updated Project

```kotlin
val history = remember { mutableStateListOf<CalculationEntry>() }  // ← new

fun onButtonPressed(label: String) {
    expression = when (label) {
        "C" -> ""
        "=" -> when (val result = safeEvaluate(expression)) {
            is CalcResult.Ok -> {
                history.add(CalculationEntry(expression, result.value.toString())) // ← new
                result.value.toString()
            }
            is CalcResult.Error -> result.message
        }
        else -> expression + label
    }
}

Column(modifier = Modifier.fillMaxSize()) {
    Text(text = expression.ifEmpty { "0" }, fontSize = 40.sp, modifier = Modifier.padding(16.dp))
    LazyVerticalGrid(columns = GridCells.Fixed(4), modifier = Modifier.weight(1f)) {
        items(buttons) { label ->
            Button(onClick = { onButtonPressed(label) }, modifier = Modifier.padding(4.dp)) {
                Text(text = label, fontSize = 20.sp)
            }
        }
    }
    LazyColumn(modifier = Modifier.weight(1f)) {                    // ← new
        items(history) { entry ->
            Text(text = "${entry.expression} = ${entry.result}")
        }
    }
}
```

`is CalcResult.Ok`'s branch now does two things — it's a **block body**
(`{ ... }`) instead of a single expression, appending to `history` before
returning the display string as the block's last expression. The screen
gains a scrolling history section below the button grid, sharing the
remaining vertical space with it via `Modifier.weight(1f)` on both.

### Mechanical walkthrough

1. `mutableStateListOf<CalculationEntry>()` — (first appearance) creates an
   observable, mutable list — the list-specific sibling of `mutableStateOf`.
   `<CalculationEntry>` is a **generic type parameter**, stating explicitly
   this list only ever holds `CalculationEntry` values — the compiler
   rejects adding anything else, the same static-typing guarantee from
   Lesson 0 applied to a collection.
2. `history.add(...)` — (first appearance) mutating the list directly (not
   reassigning `history` to a new list) is what triggers recomposition
   here — `mutableStateListOf`'s whole purpose is making in-place mutation
   itself observable, unlike `mutableStateOf`, which only reacts to
   wholesale reassignment (`count = count + 1`, not mutating something
   inside `count`).
3. `LazyColumn { items(history) { entry -> ... } }` — (first appearance)
   the direct Compose counterpart to `RecyclerView` — like
   `LazyVerticalGrid` (Lesson 5), it only creates and measures the rows
   actually near the visible screen area, regardless of how long `history`
   grows.
4. `is CalcResult.Ok -> { history.add(...); result.value.toString() }` —
   (hard concept reappearing) a `when` branch whose body is a block instead
   of a single expression — a block's *last line* is the value the branch
   produces, exactly like a function body ending in an expression.
5. `Modifier.weight(1f)` — (first appearance) inside a `Column`, `weight`
   tells that child to take a share of the remaining space proportional to
   its weight value relative to siblings' weights — both the button grid
   and the history list get `1f`, splitting the remaining vertical space
   evenly between them.

### CS Lens

Contrast directly with `../track/` Lesson 6: that lesson needed a
`RecyclerView.Adapter` subclass implementing `onCreateViewHolder` (inflate
one row's layout) and `onBindViewHolder` (populate one row's views from one
data item) as two separate, explicit steps, plus a `ViewHolder` class to
hold view references. `LazyColumn`'s `items(history) { entry -> ... }` is
both of those steps collapsed into one lambda — recompose-and-rebind is the
same mechanism Lesson 2 already covers, not a new concept, just applied to
a list instead of a single value.

### SE Lens

Why does Compose need a *separate* `mutableStateListOf` instead of just
using `mutableStateOf(listOf(...))` with plain `List`? Because Kotlin's
plain `List` is immutable — adding an item would mean building an entirely
new list and reassigning `mutableStateOf`'s value every time, which is both
more code and less efficient for large histories. `mutableStateListOf`
gives you a genuinely mutable list that still participates in Compose's
observation system — the same trade Lesson 2's `remember` made, applied to
a collection instead of a scalar.

### Connection

Every future feature that's fundamentally "a growing list of things"
(Epic 8's persisted history, replacing this in-memory version) starts from
this exact `LazyColumn` shape.

---

## Closing

### Connect the pieces

`CalculationEntry` (unit 1) pairs an expression with its result as one
value. `mutableStateListOf` (unit 2) tracks additions to a list of those
entries, observable the same way Lesson 2's scalar state was. Every
successful `=` (Lesson 7's `CalcResult.Ok` branch) appends one entry, and
`LazyColumn` renders the growing list, recycling off-screen rows the same
way `../track/`'s `RecyclerView` did — with no `Adapter` or `ViewHolder`
class required to get that behavior.

### What breaks without this

Replace `mutableStateListOf<CalculationEntry>()` with a plain
`mutableListOf<CalculationEntry>()` (no `remember`, no Compose state
tracking) and press `=` a few times. Real, observable failure: `history`
does grow (you could log its size and see it increase), but the
`LazyColumn` on screen never shows any new rows — Compose has no way to
know the list changed, since nothing about it is being observed. Restore
`mutableStateListOf` (with `remember` around it) and new rows appear
immediately.

### Exercises

- Add a "Clear History" button that empties `history` — confirm
  `history.clear()` alone (no reassignment) is enough to update the screen.
- Show the most recent entry at the *top* of the list instead of the
  bottom, without changing how entries are added — look at
  `LazyColumn`'s `reverseLayout` parameter.

### Definition of done

- [ ] Every successful calculation appears in a scrolling history list.
- [ ] Errors (Lesson 7) do not get added to history.
- [ ] You can state, concretely, why `mutableStateListOf` is needed instead
      of `mutableStateOf(listOf(...))`.
- [ ] Commit: `git commit -m "Add calculation history with mutableStateListOf and LazyColumn"`.
