# Lesson 25: Compose Navigation

**What you will build:** `InventoryActivity` and `NotificationsActivity`
merged into one Activity hosting a real `NavHost`, with
`navController.navigate("notifications")` replacing the
`Intent`/`startActivity` hop between them — while the login screen's own
`Intent`-based navigation into this merged Activity stays exactly as
built. The transferable problem: Java's Lesson 17 chose `Intent`-based,
separate-Activity navigation as the right tool for this project, and
named the real cost of the alternatives at the time. Once two entire
screens are both built in Compose, a different, more specific option
exists — one that was never a real choice back when `InventoryActivity`
and `NotificationsActivity` were still separate Activities out of
necessity, and this lesson is honest about exactly which navigation
hops it does and doesn't change.

**What you need to know first:** Java's Lesson 17 in full (the real
three-way navigation tradeoff, and the reasoning behind choosing a
second Activity). This series' own Lesson 11 (`Intent`,
`::class.java`), Lesson 19 (`ViewModel`, `viewModel()`).

**Terms introduced in this lesson:**
- **`NavController`** — an object tracking which composable destination
  is currently shown and maintaining its own back stack, the Compose
  analog of the OS-maintained Activity back stack Java's Lesson 17
  already named.
- **`NavHost`** — a composable that displays whichever destination its
  `NavController` currently points at, swapping content in place rather
  than starting a new Activity.
- **Route** — a plain `String` key identifying one destination inside a
  `NavHost`, the Compose analog of an `Intent`'s target `Class`.

---

## Concept Unit: Two Compose Screens, Two Separate Activities — a Cost With No Payoff

### The Problem

`InventoryActivity` and `NotificationsActivity` are both already built
entirely in Compose (this series' own Lessons 16 and 22). Navigating
between them still goes through `Intent`/`startActivity` — a real,
working mechanism, but one whose actual justification, per Java's
Lesson 17, was giving each screen "its own layout file, its own
lifecycle" — a real distinction for two screens built in two genuinely
different UI systems, and a much smaller one for two screens that were
never going to have separate XML layouts in the first place.

### CS Lens

Two `ComponentActivity` subclasses, each hosting exactly one `setContent`
call with no other real reason to be separate objects, is a real,
avoidable duplication of Android's own per-Activity overhead (a
`ViewModelStoreOwner`, a lifecycle, a Manifest entry) for two screens
that share the identical hosting mechanism already.

---

## Concept Unit: `NavHost` and `NavController` — Swapping Content In Place

### The Problem

Merging both screens into one Activity means something has to decide
*which* composable is currently shown, and update that decision when
navigation happens — the exact job the OS's own back stack (Java's
Lesson 17) performed for two separate Activities.

### The New Code

```kotlin
@Composable
fun InventoryApp() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "inventory") {
        composable("inventory") {
            InventoryScreen(onNavigateToNotifications = {
                navController.navigate("notifications")
            })
        }
        composable("notifications") {
            NotificationsScreen(onNavigateBack = {
                navController.popBackStack()
            })
        }
    }
}
```

### Mechanical Walkthrough

- `rememberNavController()` — **first appearance.** Creates a real
  `NavController`, wrapped in `remember` (this series' own Lesson 15) so
  the identical instance survives recomposition rather than being
  rebuilt from scratch every time `InventoryApp` recomposes.
- `NavHost(navController = navController, startDestination = "inventory")`
  — **first appearance.** A composable whose entire job is displaying
  whichever destination `navController` currently points at —
  `"inventory"` at first launch, per `startDestination`. Everything
  inside its trailing lambda declares the complete set of destinations
  this `NavHost` knows about, the Compose analog of every `<activity>`
  entry this series has added to the Manifest so far.
- `composable("inventory") { InventoryScreen(...) }` — **first
  appearance.** Registers `"inventory"` as a real **route** — a plain
  `String` key — mapped to the composable content shown when that route
  is current. `InventoryScreen` (a small rename of this series' own
  Lesson 16 `InventoryList`-hosting content, now taking a navigation
  callback instead of assuming it owns the whole screen) is called only
  while this route is active.
- `navController.navigate("notifications")` — **first appearance.**
  Called from inside `InventoryScreen`'s own "Notifications" button
  (this series' own Lesson 22 button, its `Intent`/`startActivity` body
  replaced), this swaps `NavHost`'s displayed content to the
  `"notifications"` route and pushes the previous route onto
  `NavController`'s own back stack — the direct Compose analog of
  `startActivity` pushing the calling Activity onto the OS back stack
  (Java's Lesson 17).
- `navController.popBackStack()` — **first appearance.** The direct
  analog of the device's own back button/gesture, callable from code —
  returns to whatever route was current before the last `navigate` call.

### CS Lens

`NavController`'s own back stack is the identical **stack data
structure** Java's Lesson 17 already named for the OS-maintained
Activity back stack — last destination pushed is the first one returned
to — implemented here entirely inside one Activity's own composition,
rather than by the operating system across separate Activity instances.

### SE Lens

**Given the OS's own back stack already worked correctly for two
separate Activities, why does merging them into one `NavHost` actually
improve anything, rather than just moving the identical mechanism to a
different layer?** The real payoff isn't the back-stack mechanism
itself — it's what merging removes: a second `ComponentActivity`
subclass, a second Manifest `<activity>` entry, and, as the next unit
covers honestly, a subtlety in how `ViewModel` instances get scoped
across two separate Activities that a single `NavHost` sidesteps
entirely. For two screens that were always going to be Compose, sharing
one Activity is less to declare and maintain for an identical user-
facing result.

---

## Concept Unit: Where `Intent`-Based Navigation Is Still Correct

### The Problem

`MainActivity` (the login screen) is still View Binding-based, and still
navigates to the merged Compose Activity via `Intent`/`startActivity`
(this series' own Lesson 11). Should that hop be converted to
`NavHost`-based navigation too, for consistency?

### The Honest Answer

No — and naming why, precisely, matters more than the answer itself.
`NavController`/`NavHost` navigate between composables *inside one
Activity's own composition*; they have no way to navigate between two
genuinely separate Activities, one View-based and one Compose-based, any
more than the OS back stack could swap XML layouts inside a single
Compose screen. `Intent`-based navigation remains the only correct tool
at this specific boundary — crossing from a View system screen into a
Compose one — exactly the case Java's own Lesson 17 already reasoned
through, just now applied at the one seam in this project where it's
still genuinely necessary rather than everywhere by default.

### Project Change

- **Reference Source:** `androidx.navigation.compose`'s
  `NavHost`/`rememberNavController`/`composable` — standard, stable
  Jetpack Navigation Compose API.
- **Files affected:** New `InventoryApp.kt` (or added to
  `InventoryActivity.kt`); `NotificationsActivity.kt` deleted as a
  separate Activity; `AndroidManifest.xml` (remove the
  `NotificationsActivity` entry); `MainActivity.kt` (no change — its
  own `Intent` still targets `InventoryActivity::class.java`, unchanged).
- **Change type:** Merge two Activities into one `NavHost`; remove one
  Manifest entry.
- **Dependencies:** `androidx.navigation:navigation-compose`, a new
  Gradle dependency this project hasn't needed before now.

### SE Lens

**Why keep `MainActivity` as a separate Activity at all, rather than
converting the login screen to Compose too and putting everything under
one `NavHost`?** That would be a legitimate, real option for a new
project — and an honest, real cost for this one: `MainActivity`'s login
screen (this series' own Milestones 2–3) already works, is fully
tested, and gains nothing functionally from a rewrite motivated purely
by consistency. This project's own real architecture — one View-based
Activity, one Compose Activity internally using `NavHost` — is exactly
the kind of mixed, incrementally-adopted-Compose codebase most real,
existing Android apps actually have, not a contrived teaching
simplification.

---

## Concept Unit: `ViewModel` Scoping Across a `NavHost` — a Real, Honest Subtlety

### The Problem

`InventoryScreen` and `NotificationsScreen` now live inside the same
Activity. Does calling `viewModel()` (this series' own Lesson 19) inside
each one still give each screen its own, independent `ViewModel`
instance, or do they now share one, since they share one
`ViewModelStoreOwner`?

### The Honest Answer

By default, `viewModel()` called inside a `composable(route) { }` block
is scoped to that specific **`NavBackStackEntry`** — Jetpack Navigation
Compose's own per-destination lifecycle object — not to the whole
Activity. `InventoryViewModel` and `NotificationsViewModel` remain
correctly independent, each tied to its own route's own back-stack
entry, cleared when that specific entry is popped rather than only when
the whole Activity is destroyed. This is a real, deliberate design
choice in Navigation Compose, not an accident of merging two Activities
into one — worth confirming directly, since the natural but incorrect
assumption, having just learned `viewModel()` returns "the one instance
tied to this screen," would be that merging two screens into one
Activity must mean they now share that one instance.

---

## Connect the Pieces

One trace: `InventoryApp`'s `NavHost`, tracked by a `remember`ed
`NavController`, replaced the two separate Activities and the OS back
stack Java's own Lesson 17 relied on with one Activity's own internal
navigation and its own equivalent back stack. `navController.navigate("notifications")`
did the job `Intent`/`startActivity` used to do for this one hop
specifically; `MainActivity`'s own `Intent`-based navigation into this
merged Activity was left completely unchanged, because it crosses a
real UI-system boundary `NavHost` has no way to cross. And `viewModel()`,
now scoped per-route via `NavBackStackEntry` rather than per-Activity,
kept `InventoryViewModel` and `NotificationsViewModel` exactly as
independent as they were as two separate Activities.

## What Breaks Without This

Temporarily remove the `"notifications"` route's `composable(...)`
registration from `NavHost` entirely, leaving the `navigate("notifications")`
call in place, and tap the button that triggers it.

Real result, when you do this yourself: a real runtime crash —
`IllegalArgumentException: Navigation destination that matches request
... cannot be found` — naming the missing route directly, the
Compose-navigation analog of Java's own Lesson 11
`ActivityNotFoundException` for a missing Manifest entry. Restore the
route registration before moving on.

## Exercises

1. Add a third, temporary route to `NavHost` (a disposable "about"
   screen with a single `Text`), navigate to it, and confirm
   `popBackStack()` correctly returns to whichever route was current
   before — proving the back stack tracks real history, not just the
   two original destinations.
2. Confirm this lesson's own `ViewModel`-scoping claim directly: add a
   `Log.d` to both `InventoryViewModel`'s and `NotificationsViewModel`'s
   constructors, navigate back and forth between the two routes several
   times, and observe in Logcat whether either constructor log line
   ever prints a second time — reasoning about what that confirms or
   disproves about per-route scoping.
3. Explain, in your own words, why `navController.navigate("notifications")`
   takes a plain `String` rather than a `Class` reference the way
   `Intent`'s constructor does — connect your answer to this series'
   own Lesson 11 `::class.java` unit and what problem a route string
   does and doesn't need to solve differently.

## Definition of Done

- [ ] `InventoryActivity` and `NotificationsActivity` are merged into
      one Activity hosting a real `NavHost`, verified on a running
      emulator or device.
- [ ] `MainActivity`'s own `Intent`-based navigation into the merged
      Activity is unchanged and still works.
- [ ] You triggered the real "Navigation destination... cannot be
      found" crash from a missing route, and restored it.
- [ ] You can state precisely why `Intent`-based navigation remains
      correct at exactly one boundary in this project, and incorrect
      everywhere `NavHost` now handles.
- [ ] You can explain how `ViewModel` scoping changed (or didn't) after
      merging the two screens into one Activity.
- [ ] Commit: `git commit -m "Merge InventoryActivity and
      NotificationsActivity into one NavHost-based Activity"` —
      explaining which navigation hop changed and which deliberately
      didn't.

Next: one consistent color and text style across every screen —
`MaterialTheme`, Compose's own answer to Java's per-screen manual style
application.
