# Lesson 19: `ViewModel` and Where State Actually Lives Now

**What you will build:** `InventoryViewModel`, a real class holding the
inventory list, replacing `remember { mutableStateListOf(...) }` as the
list's owner — and, immediately after, the exact rotation this series'
own Lesson 18 used to destroy the list on purpose, now surviving
correctly. The transferable problem: Lesson 18 ended with a real,
observed bug left unfixed on purpose. Fixing it requires understanding
something this series hasn't needed to ask yet: when a rotation
destroys and recreates an `Activity`, what, specifically, does Android
throw away, and is there any real mechanism for keeping something alive
*across* that exact event on purpose?

**What you need to know first:** This series' Lesson 15 (`remember`'s
real, proven limit), Lesson 17 (the hoisted `items` state this lesson
moves), Lesson 18 (the rotation failure this lesson fixes).

**Terms introduced in this lesson:**
- **`ViewModel`** — a class whose instances the Android framework
  deliberately keeps alive across a configuration change, even though
  the `Activity` that created it is destroyed and recreated.
- **`ViewModelStoreOwner`** — the real mechanism an `Activity` provides
  that lets the framework hand a `ViewModel` instance back to a *new*
  `Activity` object after a configuration change, instead of
  constructing a fresh one.
- **`viewModel()`** — the Compose function retrieving the current
  screen's `ViewModel`, creating it once and returning the exact same
  instance on every later call, across recompositions and configuration
  changes alike.

---

## Concept Unit: What a Configuration Change Actually Destroys

### The Problem

This series' own Lesson 04 already named the event precisely — a
rotation is a **configuration change**, and it destroys and recreates
the hosting `Activity` from scratch. What exactly does "destroys and
recreates the `Activity`" mean for the objects that `Activity` was
holding onto? Every field on the old `MainActivity`/`InventoryActivity`
object — `binding`, and, before this lesson, `items` itself — belonged
to that one specific object. When Android calls `onCreate` again after
a rotation, it is not reusing the previous `Activity` instance at all —
it is constructing a genuinely new one, running `onCreate` on it exactly
once, from a clean, empty slate. `remember`'s memory (Lesson 15) is tied
to the *composition*, which lives exactly as long as its hosting
`Activity` instance does — a new `Activity` instance means a fresh
composition, and everything `remember` was holding onto is gone with
the old one.

### CS Lens

An `Activity` instance being fully destroyed and rebuilt rather than
merely "refreshed in place" is a real, deliberate Android design
decision: rotation genuinely changes available screen dimensions,
resource qualifiers (a `values-land/strings.xml`, for instance, this
series hasn't needed but could exist), and potentially which layout
resources apply at all — restarting `onCreate` from scratch guarantees
every one of those is picked up correctly, at the cost that nothing the
old instance held survives automatically.

---

## Concept Unit: `ViewModel` — Kept Alive on Purpose, Across That Exact Event

### The Problem

If the `Activity` object itself is genuinely thrown away, is there any
real way for *anything* to survive a rotation without manually saving
and restoring it by hand?

### The Real Mechanism

`ViewModel` is a real class, provided by AndroidX, with one specific,
deliberate guarantee: an instance obtained through the proper channel
(covered in the next unit) is retained by the framework itself across a
configuration change, and handed back — the exact same object, not a
new one — to whichever new `Activity` instance asks for it next. The
mechanism behind this is a **`ViewModelStoreOwner`**: every `Activity`
provides one, and it is *this* object — not the `Activity` itself —
that the framework actually keeps alive across the destroy-and-recreate
cycle a configuration change triggers. A `ViewModel` obtained through it
is only ever truly destroyed once the screen is genuinely finished for
good (the user navigates away permanently, not merely rotates the
device), at which point the framework calls a real, overridable
`onCleared()` method on it.

```kotlin
class InventoryViewModel : ViewModel() {
    val items = mutableStateListOf(
        InventoryItem("Bolts", 120),
        InventoryItem("Washers", 85),
        InventoryItem("Nuts", 200)
    )

    fun addItem(item: InventoryItem) {
        items.add(item)
    }

    fun deleteItem(item: InventoryItem) {
        items.remove(item)
    }
}
```

### Mechanical Walkthrough

- `class InventoryViewModel : ViewModel()` — reappearing, this series'
  own Lesson 05 inheritance syntax, extending a real AndroidX class
  rather than an application class.
- `val items = mutableStateListOf(...)` — reappearing, this series' own
  Lesson 16 concept, with one real, deliberate change: no `remember { }`
  wrapping it. Inside a `ViewModel`, this isn't an oversight — a
  `ViewModel` instance itself is already the thing the framework is
  keeping alive across recomposition and configuration changes alike;
  wrapping its own property in `remember` would be solving a problem
  `ViewModel` doesn't have, since the object holding `items` isn't being
  recreated the way a composable function's local scope is.
- `addItem(item)`, `deleteItem(item)` — ordinary methods, moving the
  exact logic this series' own Lesson 17 (`items.add(newItem)`) and
  Lesson 18 (`items.remove(item)`) previously ran directly inline inside
  `setContent`'s lambda, now owned by the `ViewModel` instead.

### CS Lens

A `ViewModel` surviving its `Activity`'s own destruction is a real
instance of **separating an object's lifecycle from the lifecycle of
whatever currently displays it** — the same underlying idea behind a web
server keeping a user's session alive across multiple separate HTTP
requests (each request is its own short-lived event, like each
`Activity` instance; the session data outlives any single one of them),
or a database connection pool's connections outliving any one query that
uses them.

### SE Lens

**Why didn't Android just make configuration changes not destroy the
`Activity` at all, avoiding this whole problem?** Not destroying the
`Activity` would mean the OS could never guarantee resource qualifiers,
screen dimensions, or layout resources are correctly re-evaluated after
a genuine hardware or configuration change — the exact correctness
`Activity` recreation exists to guarantee, per this lesson's own CS
Lens. `ViewModel`'s real contribution is narrower and more honest:
accept that the `Activity` object itself must be rebuilt, and give
developers one specific, well-defined class whose *data* — not its UI,
not its `Activity` reference — is deliberately exempted from that
rebuild.

---

## Concept Unit: `viewModel()` — Getting the Same Instance Every Time

### The Problem

`InventoryViewModel` exists as a class. A composable needs a real,
consistent way to obtain *the* instance associated with this screen —
the same one every time, including after a rotation — rather than
accidentally constructing a fresh one on every recomposition the way a
plain `InventoryViewModel()` constructor call would.

### The New Code

```kotlin
setContent {
    val viewModel: InventoryViewModel = viewModel()
    Column {
        InventoryList(viewModel.items, onDelete = { item -> viewModel.deleteItem(item) })
        AddItemForm(onAdd = { item -> viewModel.addItem(item) })
    }
}
```

### Mechanical Walkthrough

- `viewModel()` — **first appearance.** A real Compose function (from
  `androidx.lifecycle.viewmodel.compose`) that looks up the current
  screen's `ViewModelStoreOwner` (this lesson's own concept, provided
  automatically by the hosting `Activity`), constructs an
  `InventoryViewModel` the *first* time it's called for this screen, and
  returns that exact same instance on every subsequent call — including
  calls made from a brand-new `Activity` object after a rotation. This
  is the real mechanism honoring this lesson's own central claim, not
  an assertion: the object `viewModel.items` refers to genuinely does
  not change identity across a configuration change, even though the
  composable calling `viewModel()` is running inside a completely new
  `Activity` instance each time.
- `viewModel.items`, `viewModel.deleteItem(item)`, `viewModel.addItem(item)`
  — ordinary property/method access on the retrieved instance, reused
  directly by `InventoryList`/`AddItemForm` exactly where
  `items`/`onDelete`/`onAdd` (this series' own Lessons 16 and 17) used
  to read and mutate hoisted local state directly.

### SE Lens

**Given `viewModel()` already guarantees the same instance every time,
is state hoisting (Lesson 17) still a real, necessary concept, or did
`ViewModel` just make it obsolete?** State hoisting's actual principle —
exactly one owner for shared state, everyone else reads and reports
through parameters and callbacks — is unchanged; only *where* the owner
lives moved, from a `remember` call inside `setContent` to a
`ViewModel` instance retrieved via `viewModel()`. `InventoryList` and
`AddItemForm` are exactly as stateless with respect to the list as they
were in Lesson 17 — neither one calls `viewModel()` itself, and neither
one holds any reference to the `ViewModel` at all; they still only ever
see a plain list and plain callback parameters. `ViewModel` solved
*survival*; it didn't change who's allowed to own the state in the
first place.

---

## Connect the Pieces

One trace: rotating the device (Lesson 18) destroyed the old
`InventoryActivity` instance completely, exactly as this lesson's own
opening unit described. `viewModel()`, called from the brand-new
instance's `setContent` block, found the existing `InventoryViewModel`
already retained by the `Activity`'s `ViewModelStoreOwner` (this
lesson's own mechanism) and returned it unchanged — the same `items`
list, with every add and delete from before the rotation still present.
State hoisting's own principle (Lesson 17) carried over completely
unchanged; only the state's actual home moved from a `remember`-backed
local variable to a `ViewModel` instance the framework itself keeps
alive.

## What Breaks Without This

Repeat this series' own Lesson 18 experiment exactly — add a row, delete
a row, then rotate — now against the `ViewModel`-backed version.

Real result, when you do this yourself: the list survives completely
intact, added and deleted rows and all — direct, observed proof that
this lesson's fix actually closes the exact bug Lesson 18 caused on
purpose. As a second, contrasting check: force-stop the app entirely
(from the device's own app-info settings, not just backgrounding it) and
relaunch it.

Real result, when you do this yourself: the list resets to its original
three items. This is `ViewModel`'s real, honest limit, named directly
rather than glossed over: it survives a configuration change, because
the framework specifically retains its `ViewModelStoreOwner` across
that one event — it does not survive the app's process being killed
entirely, which discards everything, `ViewModel` included, exactly the
way the very first `onCreate` ever ran. Surviving *that* event requires
a different, further tool (`rememberSaveable` for small values, or
persisting data to real storage) — a real, correct next step for a
production app, and genuinely out of this project's UI-only scope.

## Exercises

1. Add a `Log.d` call inside `InventoryViewModel`'s class body (not
   inside any method — at the point of construction) and confirm, via
   Logcat, that it prints exactly once across several rotations, but
   prints again if the app is force-stopped and relaunched — direct,
   observed proof of exactly where the real boundary of `ViewModel`'s
   guarantee sits.
2. Override `onCleared()` in `InventoryViewModel` with a `Log.d` call
   inside it, navigate away from `InventoryActivity` back to
   `MainActivity` via the device back button, and confirm it fires —
   proof `ViewModel`'s destruction is a real, observable lifecycle
   event of its own, not merely "whenever the Activity object
   disappears."
3. Explain, in your own words, why `viewModel()` being called again on
   a rotated, brand-new `Activity` instance doesn't construct a second,
   independent `InventoryViewModel` — connect your answer directly to
   this lesson's own `ViewModelStoreOwner` explanation.

## Definition of Done

- [ ] `InventoryViewModel` exists, holding `items` and the `addItem`/
      `deleteItem` methods this series' own Lessons 17 and 18 previously
      ran directly inline.
- [ ] You reproduced Lesson 18's rotation bug against this lesson's
      fixed version and confirmed the list now survives completely.
- [ ] You force-stopped the app and confirmed the list resets — proof
      you understand `ViewModel`'s real, honest limit, not just its
      guarantee.
- [ ] You can explain what a `ViewModelStoreOwner` is and why
      `viewModel()` returns the same instance after a rotation.
- [ ] Commit: `git commit -m "Move inventory list into InventoryViewModel
      so it survives configuration changes"` — explaining what specific
      bug this fixes and what it still doesn't fix (process death), not
      just the refactor.

Next: how a composable actually finds out a `ViewModel`'s data changed,
now that the data lives in a genuinely separate object instead of
`remember`ed local state — `StateFlow`, and Kotlin's own answer to
observing state across that boundary.
