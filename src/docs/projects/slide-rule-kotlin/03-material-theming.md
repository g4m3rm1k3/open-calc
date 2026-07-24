# Lesson 3: A Theme Is Data, Applied Once at the Root

*(Material 3 and Dark Mode)*

**User Story**
> As a user, I want Slide Rule to look like a real, modern app — consistent
> colors, and a dark mode that actually works.

**What you will build**
The counter screen wrapped in a proper Material 3 theme, plus a working
dark/light toggle. The transferable problem: `../track/` Lesson 33 handled
dark mode via a *second, parallel set of XML resource files* (`values-night/`)
that the OS picks between at runtime. This lesson shows Compose's answer —
theme as a single Kotlin object, swapped at one point, not duplicated files.

**What you need to know first**
Lesson 2's state and recomposition. From `../track/`: Lesson 33's
`values`/`values-night` resource-qualifier approach — this lesson is a
direct contrast to it, not an unrelated new topic.

---

## Concept Unit: `MaterialTheme` and `Scaffold`

### The Problem

Every composable so far has used default, unstyled colors — Compose's
built-in gray-and-black. A real app needs one consistent set of colors,
typography, and shapes applied everywhere, and a proper root structure
(an app bar, consistent background) rather than a bare `Column`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch, contrasted
  conceptually with `../track/` Lesson 33's resource-qualifier approach.
- **Files affected:** `MainActivity.kt`.
- **Change type:** Wrap existing content.
- **Location:** Around the `CounterScreen()` call inside `setContent { }`.
- **Dependencies:** None new — `MaterialTheme` ships with Compose's
  Material 3 library, already included by the project wizard.

### The New Code

```kotlin
MaterialTheme {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Slide Rule") }) }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            CounterScreen()
        }
    }
}
```

### The Updated Project

```kotlin
setContent {
    MaterialTheme {                                          // ← new
        Scaffold(                                            // ← new
            topBar = { TopAppBar(title = { Text("Slide Rule") }) } // ← new
        ) { innerPadding ->                                   // ← new
            Box(modifier = Modifier.padding(innerPadding)) {  // ← new
                CounterScreen()
            }
        }
    }
}
```

The app now has a real top app bar reading "Slide Rule," and every
composable inside `MaterialTheme { }` automatically picks up consistent
default colors and text styles — `CounterScreen`'s own code didn't change
at all.

### Mechanical walkthrough

1. `MaterialTheme { ... }` — (first appearance) a composable that provides
   color, typography, and shape values to every composable nested inside
   it, without those inner composables needing to ask for them explicitly —
   `Text`, `Button`, and every other Material composable reads these values
   automatically.
2. `Scaffold(topBar = { ... }) { innerPadding -> ... }` — (first appearance)
   a composable providing the standard screen layout slots — top bar,
   optional bottom bar, floating action button, and a content area. Its
   last argument is a lambda that receives `innerPadding` — the space the
   top/bottom bars actually occupy — and returns the screen's main content.
3. `innerPadding ->` — (hard concept reappearing) a lambda parameter,
   Lesson 0/2's function-value syntax again, this time supplied *by*
   `Scaffold` rather than by you.
4. `Box(modifier = Modifier.padding(innerPadding))` — (first appearance)
   `Box` is Compose's simplest layout composable — it just stacks children
   on top of each other with no arrangement logic, used here purely to
   apply `innerPadding` around whatever's inside. `.padding(innerPadding)`
   ensures content doesn't render underneath the top app bar.

### CS Lens

This is **theming as a single source of truth propagated implicitly down a
tree** — every descendant composable reads shared values (colors, type)
from its nearest `MaterialTheme` ancestor, rather than each one being
configured individually. This is Compose's `CompositionLocal` mechanism
under the hood (the exact plumbing is out of scope here; what matters is
the effect: change the theme once, at the root, and everything downstream
updates).

### SE Lens

Contrast directly with `../track/` Lesson 33: that course's dark mode meant
maintaining a *second complete copy* of every color resource
(`values/colors.xml` and `values-night/colors.xml`), with the Android OS
choosing which file to load — correct, but the two files can drift out of
sync, and there's no compiler check that `values-night` actually defines
every color `values` does. Compose's version keeps colors as Kotlin values
in one place; Concept Unit 2 shows exactly how switching between a light
and dark set is just picking a different value, checked by the compiler
like any other Kotlin expression.

### Connection

Every real screen this course builds from Lesson 4 onward lives inside this
same `MaterialTheme` + `Scaffold` shell.

---

## Concept Unit: Dark Mode as a Kotlin `if`

### The Problem

`MaterialTheme { }` above used its default color scheme. Real dark-mode
support means switching between two actual color sets based on either the
system setting or a user toggle.

### The New Code

```kotlin
@Composable
fun SlideRuleTheme(darkTheme: Boolean, content: @Composable () -> Unit) {
    val colors = if (darkTheme) darkColorScheme() else lightColorScheme()
    MaterialTheme(colorScheme = colors, content = content)
}
```

### The Updated Project

```kotlin
setContent {
    var isDarkMode by remember { mutableStateOf(false) } // ← new
    SlideRuleTheme(darkTheme = isDarkMode) {              // ← changed
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Slide Rule") },
                    actions = {
                        Switch(                             // ← new
                            checked = isDarkMode,
                            onCheckedChange = { isDarkMode = it }
                        )
                    }
                )
            }
        ) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                CounterScreen()
            }
        }
    }
}
```

### Mechanical walkthrough

1. `fun SlideRuleTheme(darkTheme: Boolean, content: @Composable () -> Unit)`
   — (first appearance) `content: @Composable () -> Unit` is a parameter
   that is itself a composable function — this is how `SlideRuleTheme`
   wraps *whatever* is passed to it, the same shape `Scaffold`'s own
   content lambda used in Concept Unit 1, made explicit here.
2. `darkColorScheme()` / `lightColorScheme()` — (first appearance) built-in
   Compose functions returning a complete, pre-built set of Material colors
   for dark or light mode.
3. `val colors = if (darkTheme) darkColorScheme() else lightColorScheme()`
   — (hard concept reappearing) Kotlin's `if` used as an **expression**,
   the same idea Lesson 0's `when` demonstrated — the whole `if`/`else`
   evaluates to one of the two color schemes and that result is assigned
   directly to `colors`.
4. `Switch(checked = isDarkMode, onCheckedChange = { isDarkMode = it })` —
   (first appearance) a Material toggle composable — `it` here is Kotlin's
   implicit name for a lambda's single parameter (the switch's new boolean
   value) when you don't bother naming it explicitly.
5. `isDarkMode by remember { mutableStateOf(false) }` — (hard concept
   reappearing) Lesson 2's exact state pattern, now driving which color
   scheme `SlideRuleTheme` picks.

### Execution trace

```
Initial: isDarkMode = false → colors = lightColorScheme()
User taps Switch → onCheckedChange(true) fires → isDarkMode = true
Recomposition: SlideRuleTheme re-evaluates darkTheme = true → colors = darkColorScheme()
Every Text/Button/Scaffold reading MaterialTheme's colors updates to the dark palette
```

### CS Lens

Same recomposition mechanism from Lesson 2 — `isDarkMode` is state; the
`if` expression that depends on it re-runs when it changes; everything
reading `MaterialTheme`'s resulting `colorScheme` recomposes downstream.
Dark mode isn't a special case Compose treats differently — it's an
ordinary consequence of state changing.

### SE Lens

The real tradeoff versus `../track/`'s OS-driven `values-night` approach:
that mechanism gets dark mode "for free" whenever the system setting
changes, with zero app code needed to react to it. This lesson's version
requires you to wire up the toggle yourself (or read the system setting via
`isSystemInDarkTheme()`, not shown here) — more code, but the two color sets
are guaranteed to define the exact same set of names, checked by the Kotlin
compiler, which `values`/`values-night`'s two separate XML files can never
guarantee.

### Connection

This `isDarkMode` toggle is a real, permanent feature of the app from here
on — every future screen inherits it automatically by living inside
`SlideRuleTheme`.

---

## Closing

### Connect the pieces

`MaterialTheme` (unit 1) provides shared colors/typography down the tree;
`Scaffold` gives the app a real top bar and content-area structure. Unit 2
made the color scheme itself a function of state (`isDarkMode`), the same
`remember`/recomposition mechanism from Lesson 2, now driving something
visual instead of a number on screen.

### What breaks without this

Remove the `Box(modifier = Modifier.padding(innerPadding))` wrapper and put
`CounterScreen()` directly inside `Scaffold`'s content lambda. Real,
observable failure: the counter's content renders up underneath the top app
bar, partially obscured — `Scaffold` reserves the space for its bars but
doesn't automatically apply that reservation to arbitrary nested content;
you have to apply `innerPadding` yourself. Restore the `Box` and the layout
is correct again.

### Exercises

- Replace the `Switch` with a check against `isSystemInDarkTheme()`
  (look up its signature) as `isDarkMode`'s initial value, keeping the
  manual toggle as an override.
- Add a custom color (e.g., a specific brand color) to `lightColorScheme()`
  and `darkColorScheme()`'s parameters and use it on one `Text`'s color —
  confirm it's just a Kotlin value, editable like any other.

### Definition of done

- [ ] App shows a top app bar and consistent Material styling.
- [ ] Dark/light mode toggles correctly via the `Switch`.
- [ ] You can explain, concretely, the difference between this approach
      and `../track/` Lesson 33's `values-night` resource qualifiers.
- [ ] Commit: `git commit -m "Add MaterialTheme, Scaffold, and a working dark mode toggle"`.
