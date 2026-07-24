# Lesson 1: A Screen Described by a Function, Not a File

*(Your First Composable)*

**User Story**
> As a user, I want to open Slide Rule and see a real screen — no XML file
> involved.

**What you will build**
A new Android Studio project, Kotlin and Compose enabled, showing a single
line of centered text — no `activity_main.xml`, no `findViewById`. The
transferable problem: in `../track/`, a screen's structure lived in an XML
file and its behavior lived in a separate Java file, connected by
`setContentView` and view IDs (Lesson 3 of that course). This lesson
replaces both halves with one Kotlin function that *is* the UI's structure,
and shows exactly what mechanism makes that function special.

**What you need to know first**
Lesson 0's Kotlin syntax (`val`, named arguments). From `../track/`: what
`MainActivity`, `onCreate`, and `setContentView` do (Lessons 2–3) — this
lesson replaces `setContentView(R.layout.activity_main)` directly and
assumes you remember what it used to do.

---

## Concept Unit: `@Composable` and the Compose Compiler Plugin

### The Problem

In the Java course, describing "some centered text" meant writing a
`TextView` element in `activity_main.xml`, giving it an `id`, then calling
`findViewById(R.id.greeting)` in Java to get a reference to it before you
could touch it from code. Two files, one indirection layer (the `id`
lookup), just to say "put this text on screen."

### The New Code

Create a new project: **Empty Activity**, Kotlin selected (not Java this
time — Compose is Kotlin-first tooling), and confirm the **"Use Jetpack
Compose"** checkbox in the wizard is checked. Open `MainActivity.kt`.

```kotlin
package com.example.sliderule

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Greeting()
        }
    }
}

@Composable
fun Greeting() {
    Text(text = "Slide Rule is running.")
}
```

### The Updated Project

This is the entire new `MainActivity.kt` — a brand-new file's worth of
content, nothing to show it landing inside since the whole file is new.
Compare its shape directly to the Java course's `MainActivity.java`:
`onCreate` still exists, `super.onCreate(savedInstanceState)` still runs
first (same lifecycle contract from that course's Lesson 2) — the only
change is what happens after: `setContent { Greeting() }` replaces
`setContentView(R.layout.activity_main)`.

### Mechanical walkthrough

1. `class MainActivity : ComponentActivity()` — (hard concept reappearing)
   Kotlin's inheritance syntax — `:` where Java used `extends`.
   `ComponentActivity` is Compose's base Activity class, playing the exact
   role `AppCompatActivity` played in the Java course.
2. `override fun onCreate(savedInstanceState: Bundle?)` — (hard concept
   reappearing) same lifecycle callback from the Java course, Kotlin
   syntax: `override` is a required keyword here (Java's `@Override` was
   only a checked annotation, not mandatory) — `Bundle?` is nullable,
   matching the real possibility of no saved state.
3. `setContent { ... }` — (first appearance) the Compose replacement for
   `setContentView(R.layout...)`. It takes a **lambda** — Kotlin's syntax
   for a block of code passed as a value, here containing the UI
   description — instead of a resource ID pointing at an XML file.
4. `Greeting()` — a call to the function defined below. Notice it's called
   exactly like calling any ordinary function — no special syntax.
5. `@Composable` — (first appearance) an annotation that tells the special
   **Compose compiler plugin** (installed automatically by the project
   wizard) to transform this function. A plain Kotlin function *cannot* be
   called inside `setContent { }` — only a function marked `@Composable`
   can, which is what makes `Greeting()` legal there and would make an
   unmarked function a compile error in that exact position.
6. `Text(text = "Slide Rule is running.")` — (first appearance) `Text` is a
   `@Composable` function the Compose library provides — the direct
   replacement for a `TextView`. `text = "..."` is Lesson 0's named-argument
   syntax, not special Compose syntax.

### CS Lens

This is UI described by a **declarative function call tree**: calling
`Greeting()`, which calls `Text(...)`, builds up a tree of UI the same way
the Java course's XML `<TextView>` inside a layout built a tree of `View`
objects (that course's Lesson 3, "A Screen Is a Tree, Not a Canvas") — the
tree still exists, it's now expressed as nested function calls instead of
nested XML tags.

### SE Lens

Why does `@Composable` need to exist at all — why can't any function just
be called inside `setContent { }`? Because the Compose compiler plugin
rewrites a `@Composable` function's body to track *where in the UI tree*
it's being called from and to support **recomposition** — re-running just
the parts of the tree that actually changed, rather than rebuilding
everything (Lesson 2 makes this concrete). An ordinary function has no such
tracking, so the compiler refuses to let you call one where that tracking
is required — this is a real, checked rule, not just a naming convention.

### Commands needed

```bash
# Run configuration: ▶ in Android Studio, same as every lesson in the Java course
```

Real device/emulator output — verify yourself, this can't run outside
Android Studio: a window showing "Slide Rule is running." near the top-left
of the screen (no centering yet — that's the next unit).

### Connection

`setContent { }` is called exactly once, in `onCreate` — same as
`setContentView` was — but everything inside it is now Kotlin function
calls instead of a separate XML file.

---

## Concept Unit: `Column`, `Row`, and `Modifier`

### The Problem

`Greeting()` currently places its text at the screen's natural top-left
corner with no spacing. The Java course had `ConstraintLayout` (and
`LinearLayout`) for arranging multiple views and controlling spacing.
Compose has its own, smaller set of layout composables that do the same
job.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch addition;
  Lesson 3 of `../track/` covers the *general* layout-as-a-tree idea this
  builds on, not a specific counterpart to port.
- **Files affected:** `MainActivity.kt`.
- **Change type:** Replace `Greeting`'s body.
- **Location:** Inside the `@Composable fun Greeting()` block added above.
- **Dependencies:** None new.

### The New Code

```kotlin
Column(
    modifier = Modifier.fillMaxSize(),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
) {
    Text(text = "Slide Rule", fontSize = 32.sp)
    Text(text = "is running.", fontSize = 16.sp)
}
```

### The Updated Project

```kotlin
@Composable
fun Greeting() {
    Column(
        modifier = Modifier.fillMaxSize(),          // ← new
        horizontalAlignment = Alignment.CenterHorizontally, // ← new
        verticalArrangement = Arrangement.Center    // ← new
    ) {
        Text(text = "Slide Rule", fontSize = 32.sp)      // ← changed
        Text(text = "is running.", fontSize = 16.sp)     // ← new
    }
}
```

`Greeting` now arranges two lines of text stacked vertically and centered
in both directions, instead of a single unstyled line pinned to the corner.

### Mechanical walkthrough

1. `Column(...) { ... }` — (first appearance) a layout composable that
   arranges its children vertically, one after another — the direct
   Compose equivalent of a vertical `LinearLayout`.
2. `modifier = Modifier.fillMaxSize()` — (first appearance) **`Modifier`**
   is a chainable configuration object almost every composable accepts —
   here, `.fillMaxSize()` tells the `Column` to occupy all available space.
   Modifiers are how Compose handles the sizing/padding/click-handling that
   XML attributes used to handle per-view.
3. `horizontalAlignment = Alignment.CenterHorizontally` /
   `verticalArrangement = Arrangement.Center` — (first appearance) named
   parameters (Lesson 0) controlling how `Column` positions its children —
   this replaces `ConstraintLayout`'s constraint lines with two named
   arguments.
4. `fontSize = 32.sp` — (first appearance) `sp` is a unit suffix — **scale-
   independent pixels**, the Compose equivalent of XML's `android:textSize="32sp"`
   — a real Kotlin feature (an extension property on `Int`/`Double`) making
   `32.sp` valid Kotlin, not special syntax.

### CS Lens

`Row` (not used yet, but the horizontal counterpart) and `Column` are two
implementations of the same **layout algorithm** idea from the WPF course's
`StackPanel` — arrange children along one axis, in source order. Compose
gives you the single-axis case as two dedicated composables rather than one
panel with an "orientation" property.

### SE Lens

Why does Compose split "size/position" (`Modifier`) from "content"
(`Text`'s own parameters) instead of one giant parameter list? Because a
`Modifier` chain composes freely — `Modifier.fillMaxSize().padding(16.dp)`
reads left to right as "do this, then this" — while a flat parameter list
covering every possible layout concern for every composable would make each
composable's own specific parameters (like `Text`'s `fontSize`) harder to
find among dozens of unrelated layout options.

### Run it

Run configuration: same ▶ button. Verify on your device/emulator: both
lines of text, centered horizontally and vertically on screen.

### Connection

This `Column` is the shell every later screen in this course starts from —
Lesson 4 replaces its single hardcoded content with real navigable screens.

---

## Concept Unit: `@Preview`

### The Problem

In the Java course, seeing a layout change meant a full build-and-deploy to
an emulator or device every time — slow, especially for small visual
tweaks. Compose has a faster feedback loop for exactly this.

### The New Code

```kotlin
@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    Greeting()
}
```

Add this directly below `Greeting()` in the same file.

### Mechanical walkthrough

1. `@Preview(showBackground = true)` — (first appearance) tells Android
   Studio to render this composable directly inside the editor, without
   building or deploying anything. `showBackground = true` gives it a solid
   background instead of transparent, so text is visible against the
   editor's own background color.
2. `fun GreetingPreview()` — an ordinary function name, no special meaning —
   by convention named `<Thing>Preview`, calling the real composable being
   previewed.

### SE Lens

The real tradeoff: a `@Preview` function renders in isolation, with no real
`Activity`, no real device, and no real user interaction — clicks and state
changes that depend on a running app won't work here (Lesson 2 revisits
this once there's actual state to preview). It's a tool for fast visual
iteration on layout and styling, not a replacement for running the real app.

### Run it

Open the **Split** or **Design** view in Android Studio for `MainActivity.kt`
— the preview pane renders `GreetingPreview()` directly in the editor,
updating within a couple of seconds of any edit, without a build.

### Connection

Every composable in this course gets a `@Preview` alongside it as a matter
of habit — this is the one you'll reach for constantly while iterating on
the calculator's button grid in Lesson 5.

---

## Closing

### Connect the pieces

One concrete trace: `MainActivity.onCreate` calls `setContent { Greeting() }`
(unit 1) instead of `setContentView`. `Greeting` is a `@Composable` function
because only such functions can be called there — the Compose compiler
plugin enforces this. Inside it, a `Column` (unit 2) arranges two `Text`
composables, centered via `Modifier` and named arguments. `GreetingPreview`
(unit 3) renders the same tree instantly in the editor, without a build.

### What breaks without this

Remove `@Composable` from `Greeting`'s declaration and try to build. Real,
representative failure: a compile error at the `Greeting()` call site
inside `setContent { }`, stating that a `@Composable` function is required
in that context. Restore the annotation and it builds again — direct proof
that `@Composable` is a checked requirement, not decoration.

### Exercises

- Add a third `Text` line and confirm `Column` stacks it below the other
  two automatically, no positioning code needed.
- Change `verticalArrangement` to `Arrangement.Top` and observe the text
  jump to the top of the screen — connect this back to what "arrangement"
  actually controls.
- Try calling `Text(...)` directly inside `onCreate`, outside `setContent`.
  Read the resulting error and connect it to unit 1's CS Lens.

### Definition of done

- [ ] Project created with Kotlin + Compose, builds and runs.
- [ ] `Greeting` shows two lines of centered text via `Column`.
- [ ] `GreetingPreview` renders correctly in Android Studio's preview pane.
- [ ] You can state, in your own words, what `@Composable` actually changes
      about a function versus what `TextView` + `findViewById` required.
- [ ] Commit: `git commit -m "First Compose screen — replaces XML layout + findViewById with a single @Composable tree"`.
