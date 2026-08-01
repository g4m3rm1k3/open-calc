# Lesson 30: Sealed Classes Revisited — Type-Safe Navigation Routes

**What you will build:** A `Destination` sealed class replacing every
raw `"inventory"`/`"notifications"` string literal this series' own
Lesson 25 wrote directly into `NavHost`, `composable(...)`, and
`navController.navigate(...)`. The transferable problem: this is a
synthesis lesson with no single Java-series lesson behind it — it
exists to close a real, open gap Lesson 25 left honestly unaddressed:
every route in that lesson is a bare `String`, and nothing stops a
typo'd route from compiling perfectly and failing only when a user
actually taps the button that navigates to it.

**What you need to know first:** This series' own Lesson 12 (`sealed
class`, exhaustive `when`), Lesson 25 (`NavHost`, `composable(route) { }`,
`navController.navigate(route)` — the exact string-based API this
lesson replaces).

**Terms introduced in this lesson:** None new — this lesson applies
Lesson 12's own `sealed class` concept to a new problem, with no new
Kotlin construct required.

---

## Concept Unit: The Real, Open Gap in String-Based Routes

### The Problem

Confirm the gap is real, not hypothetical, before fixing it.

### The Proof

```kotlin
val registeredRoutes = setOf("inventory", "notifications")

fun navigate(route: String) {
    if (route in registeredRoutes) {
        println("Navigating to $route")
    } else {
        println("Unknown route: $route")
    }
}

fun main() {
    navigate("notifications")
    navigate("notifcations")
}
```

Compile and run:

```
kotlinc StringRoutes.kt -include-runtime -d StringRoutes.jar
java -jar StringRoutes.jar
```

Real output, from running this just now:

```
Navigating to notifications
Unknown route: notifcations
```

`"notifcations"` — missing an `i` — compiles perfectly. Nothing about
`String` as a type carries any information about which specific strings
are actually valid routes; a real `NavController` given an unregistered
route throws `IllegalArgumentException` at runtime (this series' own
Lesson 25 already proved this exact crash, for a route removed
entirely rather than merely misspelled) — a real, working, but
entirely runtime-only defense against a mistake the compiler could, in
principle, catch far earlier.

### Discard the Throwaway Example

`StringRoutes.kt` is deleted.

---

## Concept Unit: `Destination` — Routes as a Sealed Hierarchy

### The Problem

This series' own Lesson 12 already proved a sealed class gives the
compiler a complete, checkable list of every real possibility. Can the
same mechanism turn "which route is this" from a runtime string
comparison into a compile-time-checked identifier?

### Introduce the Concept in Isolation

```kotlin
sealed class Destination(val route: String) {
    object Inventory : Destination("inventory")
    object Notifications : Destination("notifications")
}

fun navigate(destination: Destination) {
    println("Navigating to ${destination.route}")
}

fun main() {
    navigate(Destination.Notifications)
    navigate(Destination.Notifcations)
}
```

Compile:

```
kotlinc SealedRoutes.kt -include-runtime -d SealedRoutes.jar
```

Real output, from running this just now:

```
SealedRoutes.kt:12:26: error: unresolved reference 'Notifcations'.
    navigate(Destination.Notifcations)
                         ^^^^^^^^^^^^
```

The identical typo that silently compiled as a plain `String` is now a
reference to a name that doesn't exist — `Destination.Notifcations` is
not a valid identifier, and the compiler rejects it immediately,
exactly the same class of protection this series' own Lesson 12 already
proved for exhaustive `when` branches, here applied to preventing an
invalid route from ever being constructed in the first place, rather
than catching a missing case in a branch. `sealed class Destination(val
route: String)` — reappearing, this series' own Lesson 3 primary-
constructor-property syntax and Lesson 12 sealed-class syntax combined
— gives every real destination both a real Kotlin identifier
(`Destination.Notifications`) *and* the underlying `String` a
`NavHost` actually needs (`.route`), so nothing about `NavHost`'s own
real API has to change to use it.

### Discard the Throwaway Example

`SealedRoutes.kt` is deleted. This exact shape is the real project's own
next application.

### CS Lens

Wrapping a stringly-typed identifier in a real, named type is a
concrete instance of avoiding **primitive obsession** — using a raw,
general-purpose type (`String`) to represent something with a much
narrower, specific meaning (one of exactly two valid routes), when a
dedicated type could make invalid values genuinely unrepresentable
instead of merely checked at runtime.

Also recognized in: TypeScript's string literal union types (`type
Route = "inventory" | "notifications"`, checked structurally rather than
via a sealed class, but solving the identical problem), and any
codebase's own "wrapper type around a raw string/int" pattern, adopted
specifically to let the compiler catch a mistake a bare primitive type
never could.

---

## Concept Unit: Applying It to the Real `NavHost`

### Project Change

- **Reference Source:** No reference counterpart — an application-
  specific type wrapping `NavHost`'s own real, unchanged `String`-based
  route API (this series' own Lesson 25).
- **Files affected:** New `Destination.kt`; `InventoryActivity.kt`.
- **Change type:** Add a sealed class; replace every raw route string
  literal with a `Destination` reference's `.route`.
- **Dependencies:** This series' own Lesson 25 `NavHost`.

### The New Code

```kotlin
sealed class Destination(val route: String) {
    object Inventory : Destination("inventory")
    object Notifications : Destination("notifications")
}
```

```kotlin
NavHost(navController = navController, startDestination = Destination.Inventory.route) {
    composable(Destination.Inventory.route) {
        InventoryScreen(onNavigateToNotifications = {
            navController.navigate(Destination.Notifications.route)
        })
    }
    composable(Destination.Notifications.route) {
        NotificationsScreen(onNavigateBack = { navController.popBackStack() })
    }
}
```

### Mechanical Walkthrough

- `Destination.Inventory.route`, `Destination.Notifications.route` —
  every raw string literal from this series' own Lesson 25 is now
  reached through a real, compiler-checked identifier, with `.route`
  supplying the exact same underlying `String` `NavHost`'s own real API
  (unchanged) still requires. `startDestination`,
  `composable(route) { }`, and `navController.navigate(route)` all still
  take a plain `String` — this refactor changes *what produces* that
  string, not `NavHost`'s own signature at all.

### SE Lens

**Given `NavHost`'s own API still ultimately takes a plain `String`, has
this refactor actually eliminated the typo risk, or just moved it one
level up?** It has genuinely eliminated it at every call site *outside*
`Destination`'s own three-line declaration: every place this project's
code refers to a route now does so through a real identifier, checked
by the compiler exactly like this lesson's own lab proved. The typo
risk hasn't vanished from existence — it's been concentrated into
exactly one place (`Destination`'s own object declarations, where each
route string is written literally, once) instead of being repeated at
every single call site that needs to know a route's name. This is a
real, general engineering pattern worth naming directly: a raw,
error-prone value doesn't have to be eliminated everywhere to be made
safe everywhere — confining it to one single, small, easily-reviewed
location and wrapping every other use in a checked type achieves the
same practical safety.

---

## Connect the Pieces

One trace: a raw string typo (`"notifcations"`) compiled without
complaint and would only surface as a runtime crash the moment a user
actually triggered it — this lesson's own lab proved that directly.
`Destination`, a `sealed class` (this series' own Lesson 12) pairing
each real route with a real Kotlin identifier, moved that exact mistake
from a runtime risk to a compile-time one — proven, not asserted, by a
real "unresolved reference" error on the identical typo. `NavHost`
itself needed no change at all; only what supplies its route strings
did.

## What Breaks Without This

This lesson's own two labs — the silent string typo and the rejected
sealed-class typo — are already the full "what breaks / what doesn't
break anymore" comparison, both real and already triggered.

## Exercises

1. Add a third, real destination to `Destination` (a disposable
   "settings" screen, never actually built) and confirm the sealed
   class's own package-restriction rule (this series' own Lesson 12)
   still applies — try declaring a fourth `Destination` subclass from a
   different package and confirm the identical real compiler error
   Lesson 12 already triggered.
2. Search this project's own `InventoryActivity.kt` for any remaining
   bare route string literals after this lesson's refactor, and confirm
   none remain outside `Destination`'s own declaration.
3. Explain, in your own words, why `Destination` doesn't need a `when`
   expression anywhere in this lesson's own code, even though it's a
   sealed class — connecting your answer to what this lesson actually
   uses sealed classes *for* (a checked identifier) versus what Lesson
   12 used them for (an exhaustively-branched result).

## Definition of Done

- [ ] You ran both labs and can state, precisely, what changed and what
      didn't between a raw-string typo and a sealed-class typo.
- [ ] Every route in `InventoryActivity.kt`'s `NavHost` is now reached
      through `Destination`, with no bare route string literal
      remaining outside its own declaration.
- [ ] The app still navigates identically to before this refactor,
      verified on a running emulator or device.
- [ ] You can explain why this refactor doesn't require any change to
      `NavHost`'s own real, unchanged API.
- [ ] Commit: `git commit -m "Replace raw NavHost route strings with a
      sealed Destination type"` — explaining the typo-safety this adds,
      not just the refactor.

Next: this project's first genuinely unit-testable logic — a
`ViewModel` with no `Activity` dependency, and Kotlin's coroutine test
utilities for verifying it.
