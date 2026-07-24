# Lesson 4: A Graph of Routes, Not a Graph of Activities

*(Compose Navigation)*

**User Story**
> As a user, I want a real Graph screen alongside the Calculator screen,
> with a working back button between them.

**What you will build**
Two real screens — Calculator and Graph — with a bottom navigation bar
switching between them, and correct back-stack behavior. The transferable
problem is not new: `../track/` Lesson 19 already taught "one graph instead
of many Intents," moving that course from separate `Activity`-per-screen
navigation to a single Navigation Component graph. This lesson is the same
idea's Compose-native form — same concept, different API, briefly
contrasted rather than re-taught from zero.

**What you need to know first**
Lesson 3's `Scaffold`. From `../track/`: Lesson 19's Navigation Component —
a `NavHost`, a graph of destinations, and `navController.navigate(...)`
will all sound immediately familiar, because they're the same concept.

---

## Concept Unit: `NavHost` and Composable Destinations

### The Problem

Right now, `MainActivity` shows exactly one screen — `CounterScreen` — with
no way to navigate anywhere else. `../track/` Lesson 19 solved the
equivalent problem with a `NavHostFragment` and an XML navigation graph
file listing each `Fragment` destination. Compose Navigation replaces both
the XML graph and the Fragments with composable functions and a Kotlin DSL.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch Compose
  equivalent of `../track/` Lesson 19's XML nav graph, contrasted directly,
  not ported line for line (the two APIs don't correspond that closely).
- **Files affected:** `MainActivity.kt`; add the Navigation Compose
  dependency to `build.gradle.kts` (`androidx.navigation:navigation-compose`).
- **Change type:** Add.
- **Location:** Replacing the direct `CounterScreen()` call inside
  `Scaffold`'s content lambda.
- **Dependencies:** `navigation-compose` library.

### The New Code

```kotlin
@Composable
fun SlideRuleApp() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "calculator") {
        composable("calculator") { CounterScreen() }
        composable("graph") { Text("Graph screen — placeholder") }
    }
}
```

### The Updated Project

```kotlin
setContent {
    var isDarkMode by remember { mutableStateOf(false) }
    SlideRuleTheme(darkTheme = isDarkMode) {
        Scaffold(
            topBar = { /* unchanged from Lesson 3 */ }
        ) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                SlideRuleApp()   // ← changed: was CounterScreen() directly
            }
        }
    }
}
```

`Scaffold`'s content area now hosts `SlideRuleApp`, which owns the
navigation graph — `CounterScreen` is one of two possible destinations
inside it instead of the whole screen's only content.

### Mechanical walkthrough

1. `rememberNavController()` — (first appearance) creates and remembers
   (Lesson 2's `remember`, reused) a `NavController` — the object that
   actually performs navigation and tracks the back stack, the direct
   Compose counterpart to `../track/`'s `NavController` from the
   Navigation Component (same class name, same job, different setup).
2. `NavHost(navController = ..., startDestination = "calculator") { ... }`
   — (first appearance) declares the navigation graph itself. `startDestination`
   names which route is shown first — the direct equivalent of the XML nav
   graph's `app:startDestination` attribute.
3. `composable("calculator") { CounterScreen() }` — (first appearance)
   registers a **route** — a plain string identifier, `"calculator"` — and
   the composable content shown when that route is active. This replaces
   an XML `<fragment>` tag with a Kotlin function call.
4. `"calculator"` / `"graph"` — plain Kotlin string literals acting as
   route identifiers — no separate resource IDs (`R.id.calculatorFragment`)
   the way the Java course's nav graph needed.

### CS Lens

This is the exact same **graph of destinations with one active node and a
back stack** concept from `../track/` Lesson 19 — a named graph instead of
loose point-to-point Intents. The graph itself is now declared as Kotlin
code (`NavHost { composable(...) }`) instead of a parsed XML resource file.

### SE Lens

The real tradeoff: string route names (`"calculator"`) have no compile-time
checking — a typo in `navController.navigate("calculater")` is a runtime
failure, not a build error, the same category of risk the XML nav graph's
generated `Directions` classes were specifically built to eliminate in the
Java course. Later, larger Compose Navigation setups typically define
routes as `sealed class` values instead of raw strings for exactly this
reason — worth knowing as an extension you can make yourself once the app
has more than two or three destinations.

### Connection

`"graph"`'s placeholder `Text` is replaced with a real screen the moment
Epic 4 needs a graph to navigate to.

---

## Concept Unit: Navigating and the Back Stack

### The Problem

Nothing currently triggers a route change — `NavHost` shows `"calculator"`
and stays there forever. A bottom navigation bar needs to actually call into
the `NavController` to switch routes.

### The New Code

```kotlin
NavigationBar {
    NavigationBarItem(
        selected = false,
        onClick = { navController.navigate("calculator") },
        label = { Text("Calculator") },
        icon = { }
    )
    NavigationBarItem(
        selected = false,
        onClick = { navController.navigate("graph") },
        label = { Text("Graph") },
        icon = { }
    )
}
```

### The Updated Project

```kotlin
Scaffold(
    topBar = { /* unchanged */ },
    bottomBar = {                                              // ← new
        NavigationBar {
            NavigationBarItem(
                selected = false,
                onClick = { navController.navigate("calculator") },
                label = { Text("Calculator") },
                icon = { }
            )
            NavigationBarItem(
                selected = false,
                onClick = { navController.navigate("graph") },
                label = { Text("Graph") },
                icon = { }
            )
        }
    }
) { innerPadding ->
    Box(modifier = Modifier.padding(innerPadding)) {
        NavHost(navController = navController, startDestination = "calculator") {
            composable("calculator") { CounterScreen() }
            composable("graph") { Text("Graph screen — placeholder") }
        }
    }
}
```

`Scaffold` now has both a top bar and a bottom navigation bar; tapping
either bottom item calls `navController.navigate(...)` with the
corresponding route string, and `NavHost` swaps its content accordingly.

### Mechanical walkthrough

1. `NavigationBar { ... }` / `NavigationBarItem(...)` — (first appearance)
   Material 3's bottom navigation composables — the direct visual
   equivalent of `../track/`'s `BottomNavigationView`.
2. `onClick = { navController.navigate("calculator") }` — calling
   `navigate(route)` on the same `NavController` created in Concept Unit 1
   — pushes the given route as the new current destination.
3. `selected = false` — hardcoded here on purpose; a real implementation
   compares the current route to each item's route to highlight the active
   one — left as this lesson's exercise, since it needs `NavController`'s
   current-back-stack-entry state, a small step beyond what's introduced
   here.

### Execution trace

```
App starts: back stack = ["calculator"], NavHost shows CounterScreen
Tap "Graph" → navigate("graph") → back stack = ["calculator", "graph"], NavHost shows Text placeholder
Tap "Calculator" → navigate("calculator") → back stack = ["calculator", "graph", "calculator"]
Press system Back → back stack pops → ["calculator", "graph"], NavHost shows Text placeholder again
```

*Note the third line:* `navigate("calculator")` when already navigating
between just two destinations can grow the back stack unboundedly if
tapped repeatedly — a real, common Compose Navigation gotcha, fixed with
`popUpTo`/`launchSingleTop` options on `navigate(...)`, worth looking up as
an exercise below rather than covered in full here (matching this course's
"touch on things, extend yourself" scope).

### CS Lens

Same **stack (LIFO)** data structure from `../track/` Lesson 5 ("The Screen
You Left Isn't Gone") and this curriculum's WPF course's own navigation
stack (Lesson 4 there) — a third appearance of the exact same idea, now in
Compose's own back-stack implementation.

### SE Lens

Why keep navigation state (`navController`, the back stack) separate from
the screens' own content state (`isDarkMode`, `count`)? Because navigation
is itself a cross-cutting concern every screen needs access to (a button
inside `CounterScreen` might eventually need to trigger navigation too),
while a given screen's internal state should stay private to it — the same
separation-of-concerns reasoning behind state hoisting in Lesson 2, applied
one level higher, to the whole app instead of one composable.

### Connection

Every future screen this course adds (Graph, Linear Algebra, Physics) is
registered as one more `composable(route) { ... }` entry inside this exact
`NavHost` — the graph grows, the mechanism doesn't change.

---

## Closing

### Connect the pieces

`rememberNavController()` (unit 1) creates the controller; `NavHost` declares
the graph of routes and which composable each one shows. `NavigationBar`
(unit 2) gives the user a way to actually call `navigate(route)`, which
pushes onto the exact same kind of back stack `../track/` Lesson 5 already
taught, now with Compose's own implementation.

### What breaks without this

Register the same route string twice (`composable("calculator") { ... }`
appearing twice in the same `NavHost`) and try to build. Real, observable
failure: an `IllegalArgumentException` at runtime the first time
`NavHost` initializes, naming the duplicate route — routes must be unique
within one graph, the same uniqueness requirement an XML nav graph's
destination IDs had, just checked later (at runtime, not build time) than
the Java course's version.

### Exercises

- Add `popUpTo("calculator") { inclusive = false }` to the calculator tab's
  `navigate` call and confirm, using the system Back button, that the back
  stack no longer grows every time you bounce between the two tabs.
- Make `selected` reflect the real current route by reading
  `navController.currentBackStackEntryAsState()` (look up its usage) instead
  of the hardcoded `false`.

### Definition of done

- [ ] Two real routes exist and a bottom nav bar switches between them.
- [ ] The system Back button correctly pops the back stack instead of
      exiting the app from a non-start destination.
- [ ] You can state, concretely, what's the same and what's different
      between this and `../track/` Lesson 19's Navigation Component.
- [ ] Commit: `git commit -m "Add Compose Navigation — calculator and graph as routes in one NavHost"`.
