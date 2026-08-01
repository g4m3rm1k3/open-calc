# Lesson 18: Deleting a Row, and `remember` vs. `ViewModel`

**What you will build:** A working delete button on every row — and,
once that's genuinely working, a deliberate rotation that destroys the
entire list on purpose, to prove `remember`'s real limit honestly rather
than assert it. The transferable problem: Java's Lesson 29 needed a
real, careful mechanism — `getBindingAdapterPosition`, `NO_POSITION` —
specifically because a recycled `ViewHolder` can't simply "know" which
row it currently represents. This lesson shows why that entire category
of problem doesn't exist in Compose's version, and then spends the rest
of its time on a limit that's real regardless of which UI system is
used: `remember`'s memory does not survive a configuration change, and
this milestone's list has been silently vulnerable to that the entire
time.

**What you need to know first:** This series' Lesson 10 (`data class`,
structural `==` equality — used directly below), Lesson 15 (`remember`,
the rotation-reset failure already proven once on a single counter, now
proven again on the real inventory list), Lesson 17 (the hoisted `items`
state this lesson deletes from). Java's Lesson 29
(`getBindingAdapterPosition`, `NO_POSITION`, `notifyItemRemoved` — the
real problem being contrasted, not ported).

**Terms introduced in this lesson:** None new in the delete mechanism
itself — this lesson's real new term arrives in its closing unit, which
only *names* `ViewModel` as the concept the next lesson builds in full,
without yet writing any code for it.

---

## Concept Unit: Deleting a Row — By Value, Not By Position

### The Problem

Java's Lesson 29 opened with a real, subtle bug class: a `ViewHolder`'s
delete button can't simply capture "I am row 3" once, because
`RecyclerView`'s own recycling (Java's Lesson 18 object-pool pattern)
means the *exact same* `ViewHolder` object gets reassigned to a
*different* row later — a captured position can silently go stale,
which is exactly why `getBindingAdapterPosition()` has to be queried
fresh, at the moment of the tap, rather than stored once when the row
was first bound. Does `LazyColumn`'s version of a row need the
equivalent care?

### The Fix

```kotlin
@Composable
fun InventoryList(items: List<InventoryItem>, onDelete: (InventoryItem) -> Unit) {
    LazyColumn {
        items(items) { item ->
            Row(modifier = Modifier.padding(16.dp)) {
                Text(text = item.name, modifier = Modifier.weight(1f))
                Text(text = item.quantity.toString())
                Button(onClick = { onDelete(item) }) {
                    Text(text = "Delete")
                }
            }
        }
    }
}
```

```kotlin
InventoryList(items, onDelete = { item -> items.remove(item) })
```

`onDelete(item)` closes over `item` — the exact real `InventoryItem`
value this specific composable call was given, this lesson's own
Lesson 16 concept — not a numeric position captured once and possibly
outdated later. There is no equivalent of `getBindingAdapterPosition()`
or `NO_POSITION` anywhere, and this is not an oversight: `LazyColumn`
recomposes each visible row's content lambda directly against the
*current* item at that position on every recomposition — there is no
long-lived, reused `ViewHolder`-like object whose identity could
silently drift out of sync with the data it's currently showing the way
Java's Lesson 29 had to guard against.

`items.remove(item)` — the real deletion — relies directly on `==`'s
structural equality (this series' own Lesson 10): `MutableList.remove`
finds and removes the *first element equal to* the given value, and
because `InventoryItem` is a `data class`, "equal to" means "same `name`
and `quantity`," generated automatically, with no manual `equals()`
ever written. This is a genuine, concrete payoff of a decision made four
lessons ago paying off here, unprompted.

### CS Lens

Removing an item from a collection *by value* rather than by a
separately-tracked index sidesteps an entire category of **stale
reference** bug — Java's Lesson 29 real, careful solution to exactly
that category, here avoided rather than solved, because Compose's
per-recomposition rebinding never introduces the staleness in the first
place.

### SE Lens

**Is `items.remove(item)` always the right choice, or could two rows
with identical name and quantity cause the wrong one to be deleted?**
This is a real, honest limit worth naming, not glossing over:
`data class` equality means two `InventoryItem("Bolts", 120)` values,
constructed separately, are `==` to each other — `remove` would delete
whichever one it finds first, which may or may not be the specific row
the user actually tapped. For this project's own scope, that's an
acceptable, low-stakes ambiguity; a real inventory system tracking
genuinely distinct physical rows (even ones that happen to share a name
and quantity right now) would need each `InventoryItem` to carry its own
unique identifier — a straightforward, real extension to this class this
lesson doesn't build, named honestly rather than pretended not to exist.

---

## Concept Unit: The Real Limit — Rotation Wipes the List

### The Problem

This series' own Lesson 15 already proved, on a disposable counter, that
`remember`'s memory does not survive a configuration change. The real
inventory list — with real, user-added and user-deleted rows, unlike
Lesson 15's throwaway example — has been running with the exact same
vulnerability this entire milestone, untested until now.

### The Failure, Caused on Purpose

Build and run the real inventory screen. Add a row through the form
(Lesson 17). Delete one of the original sample rows (this lesson's own
new delete button). Confirm the list now shows a genuinely modified set
of rows — not the original three. Then rotate the device.

Real result, when you do this yourself: the list resets completely, back
to the original three hardcoded sample rows — every add and every
delete performed during this session, gone. This is not a new failure
mode; it's the exact mechanism Lesson 15 already proved on a counter,
now shown to have been silently true of this project's real, user-facing
data the entire time Milestone 4 has been built.

### Discard Nothing — This Stays Broken On Purpose, For Now

Unlike this series' other deliberate failures, this one is not reverted
at the end of the lesson. It's left in place, honestly, because the real
fix — `ViewModel` — is substantial enough to deserve its own full
lesson, not a quick patch bolted on here.

### SE Lens

**Given `remember`'s limit was already proven back in Lesson 15, why
does this lesson wait until now — after building add *and* delete — to
address it for real, instead of fixing it immediately?** Feeling the
cost concretely, on data a reader has personally created and deleted
through their own real interactions with a real, working feature, is a
substantially stronger motivation than an abstract warning delivered
before any real state existed to lose. Lesson 15's counter proved the
mechanism; this lesson lets a reader lose *their own* work to it, on
purpose, immediately before the fix — the same "let the pain be real
before the tool that solves it arrives" pattern this curriculum's own
`LessonContract` uses throughout, not a lesson-planning oversight.

---

## Connect the Pieces

One trace: `onDelete(item)` closed over a real `InventoryItem` value,
sidestepping Java's Lesson 29 entire stale-position problem by relying
on `LazyColumn`'s per-recomposition rebinding and `data class` structural
equality (Lesson 10) instead of a tracked numeric position.
`items.remove(item)` performed the real deletion. Then, deliberately,
rotating the device after both adding and deleting real rows proved —
by causing a real, felt loss, not a hypothetical one — that
`remember`'s guarantee (Lesson 15) never covered this data at all,
setting up the exact problem the next lesson's `ViewModel` exists to
solve.

## What Breaks Without This

This lesson's entire second unit *is* "what breaks" — a real, deliberate
data-loss bug, caused on purpose, left unresolved on purpose, as the
direct motivation for the next lesson.

## Exercises

1. Add a second `InventoryItem("Bolts", 120)` to the list (matching an
   existing row's name and quantity exactly) through the add form, then
   tap "Delete" on the *original* "Bolts" row. Observe which one
   actually disappears, and connect the result directly to this lesson's
   own SE Lens about `data class` equality's real limit for deletion.
2. Reproduce the rotation-data-loss failure yourself, on a real device
   or emulator, after performing at least one add and one delete —
   confirming the loss is real and complete, not partial.
3. Before the next lesson, write down, in your own words, exactly what
   guarantee `remember` provides and exactly what event breaks it —
   check your answer against this series' own Lesson 15 SE Lens once
   you're done, without looking back at it first.

## Definition of Done

- [ ] Deleting a row works correctly for a real, running inventory list,
      verified on an emulator or device.
- [ ] You can explain why `LazyColumn`'s rows never need Java's Lesson 29
      `getBindingAdapterPosition`/`NO_POSITION` mechanism.
- [ ] You can name one real, honest limit of deleting by `data class`
      equality rather than by a unique identifier.
- [ ] You personally caused the rotation data-loss bug, on real data you
      added and deleted yourself, and left it unfixed on purpose.
- [ ] Commit: `git commit -m "Add delete-by-value to the inventory list;
      rotation data loss is a known, unfixed limit until the next
      lesson"` — an honest commit message naming a real, open bug, not
      hiding it.

Next: `ViewModel` — what it actually survives that a composable or an
`Activity` does not, and why, fixing the exact bug this lesson just made
you watch happen.
