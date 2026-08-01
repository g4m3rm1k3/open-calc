# Lesson 14: Composable Functions

**What you will build:** Jetpack Compose enabled in this project for the
first time, and a small, disposable set of `@Composable` functions —
never wired to real inventory data yet — proving what it actually means
to describe UI as a function rather than build it imperatively. The
transferable problem: every screen this series has built so far follows
one recipe — inflate XML, get back real `View` objects, mutate them by
hand (`binding.usernameField.text`, `Toast.makeText(...)`). Java's Lesson
18 chose `RecyclerView` specifically because a plain `GridLayout`'s "one
XML element per data item" approach doesn't scale to dynamic data at
all, and even `RecyclerView`'s answer — a real, working `Adapter`/
`ViewHolder` contract — is still fundamentally about manually creating,
recycling, and mutating `View` objects yourself. Compose answers the
same underlying problem a structurally different way: instead of
mutating views to match data, you describe what the UI should look like
*for* a given piece of data, and let Compose's own runtime decide what
actually needs to change on screen.

**What you need to know first:** Java's Lesson 18 in full (the
`GridLayout`/`GridView`/`RecyclerView` comparison, view recycling as the
object-pool pattern, and `RecyclerView`'s decision to split
"arrangement" from "content" into two separate objects — the exact
split this lesson's own SE Lens returns to). This series' Lesson 05
(`open`/`override`, unrelated here except as the last lesson to
introduce a genuinely new structural idea about how Kotlin code is
organized).

**Terms introduced in this lesson:**
- **`@Composable`** — an annotation marking a function as describing a
  piece of UI, callable only from inside another `@Composable` function
  (or a designated entry point), rather than an ordinary function called
  freely from anywhere.
- **Composition** — the tree of UI that results from Compose actually
  running a `@Composable` function and every `@Composable` function it
  calls.
- **`Column` / `Row`** — built-in Compose functions arranging their
  content vertically or horizontally, the direct conceptual descendants
  of `LinearLayout`'s single-axis stacking.
- **`Modifier`** — a chainable object describing how a composable should
  be measured, laid out, drawn, or behave, passed as a parameter rather
  than set via separate XML attributes.
- **`@Preview`** — an annotation letting Android Studio render a
  composable directly in the IDE, without installing or running the
  whole app.

---

## Concept Unit: Enabling Jetpack Compose

### The Problem

Nothing about Compose exists in this project yet — it's a separate
Jetpack library with its own compiler integration, the same kind of
Gradle-level decision Java's Lesson 18 already flagged: "the next lesson
needs a Gradle dependency check before writing any Adapter code,"
because `RecyclerView` itself lives in a separate AndroidX artifact, not
the core platform. Compose needs a comparable, real setup step before
any `@Composable` function can exist at all.

### Project Change

- **Reference Source:** The Android Gradle Plugin's Compose support and
  the `androidx.compose:compose-bom` (Bill of Materials) artifact —
  Google's own current, standard project setup for a Compose-enabled
  module.
- **Files affected:** `app/build.gradle.kts`.
- **Change type:** Enable the `compose` build feature; add the Compose
  BOM and core UI dependencies.
- **Location:** Inside `android { buildFeatures { } }` (alongside this
  series' own Lesson 04 `viewBinding = true`); inside `dependencies { }`.
- **Dependencies:** None beyond what's added here.

### The New Code

```kotlin
buildFeatures {
    viewBinding = true
    compose = true
}
```

```kotlin
dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.9.2")
}
```

### Mechanical Walkthrough

- `compose = true` — reappearing syntax from this series' own Lesson 04
  (`viewBinding = true`), a second, independent build feature enabled
  the identical way. Both `viewBinding` and `compose` can be `true` at
  once — this project's existing login screen keeps working exactly as
  built, unchanged, while the inventory grid this milestone builds
  adopts Compose specifically, side by side in one app.
- `platform("androidx.compose:compose-bom:...")` — **first appearance of
  a BOM (Bill of Materials).** Compose ships as dozens of separate
  artifacts (`ui`, `material3`, `foundation`, and more), each
  independently versioned — a BOM is a single dependency that pins a
  matched, tested set of versions for all of them at once, so declaring
  each individual Compose artifact below never needs its own version
  number written out by hand.
- `implementation("androidx.compose.ui:ui")`,
  `implementation("androidx.compose.material3:material3")` — ordinary
  Gradle dependency declarations, the same shape every dependency this
  project already relies on (AndroidX, AppCompat) uses; genuinely basic,
  no new mechanism.

### SE Lens

**Why does Compose ship as several separate small artifacts instead of
one single dependency, if a BOM is needed anyway just to keep their
versions in sync?** Splitting Compose into `ui` (core drawing/layout),
`material3` (Google's specific design system built on top of it),
`foundation`, and others lets a project depend on exactly the layers it
actually needs — a project using a completely custom design language
instead of Material could skip `material3` entirely, while still using
`ui`'s and `foundation`'s core composables. The BOM's job is narrowly
solving the version-matching problem this modularity creates, without
forcing every project into a single, undifferentiated dependency.

---

## Concept Unit: `@Composable` — Describing UI, Not Building It

### The Problem

Every screen so far inflates a layout once and then mutates real,
already-built `View` objects to reflect changes (`binding.usernameField.
text`, a `Toast` shown imperatively). `RecyclerView`'s own `Adapter`
contract (Java's Lesson 26, ahead of this series) exists specifically to
manage that mutation efficiently at scale — a real, working answer, with
a real, nontrivial contract to implement. Compose's `@Composable`
functions do the underlying job — put things on screen — through a
completely different discipline: describe what the UI looks like as a
function of the data it's given, and let Compose itself figure out what
actually needs to be built or changed.

### Introduce the Concept in Isolation

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}
```

This is the smallest real composable: a function marked `@Composable`
(the annotation from this series' own new terms), taking an ordinary
`String` parameter, and calling `Text` — a built-in Compose function
that displays a run of text, the direct conceptual descendant of Java's
Lesson 09 `TextView`. Notice what's genuinely different from every
Activity method this series has written so far: `Greeting` returns
nothing (no `View` object, no reference to anything) — calling it
doesn't hand back something to store in a field the way `findViewById`
or a View Binding property did. Calling `Greeting("Kotlin")` a second
time with a different name doesn't create a second, independent
`Text` widget sitting somewhere waiting to be added to a container by
hand — it describes what should exist, and Compose's own runtime is
responsible for actually building or updating real screen content to
match. When you build and run a composable like this on a device or
emulator, the text appears immediately, with no `setContentView`, no
`R.layout` resource, and no XML file involved anywhere.

### Arranging More Than One Thing — `Column` and `Row`

A single line of text isn't a screen. Composing more than one piece of
UI together uses the same building-block idea, nested:

```kotlin
@Composable
fun LoginTitleAndHint() {
    Column(modifier = Modifier.padding(24.dp)) {
        Text(text = "Welcome Back", fontSize = 24.sp)
        Text(text = "Username")
    }
}
```

`Column` arranges its content vertically, top to bottom, in the order
written — the direct conceptual descendant of this series' own Lesson 06
`LinearLayout` with `android:orientation="vertical"`, and `Row` (not
shown, but declared identically) is the horizontal equivalent of
`android:orientation="horizontal"`. `Modifier.padding(24.dp)` is a
**`Modifier`** — a chainable description of layout, drawing, or behavior
concerns, passed as an ordinary function parameter rather than set
through separate XML attributes the way `android:padding="24dp"` was in
this series' own Lesson 06. `24.dp` and `24.sp` are real Kotlin
expressions, not XML attribute strings — `.dp` and `.sp` are extension
properties (this series' own Lesson 09 concept, applied to a number
instead of a `String`) converting a plain number into Compose's own
dimension types, the same density-independent and scale-independent
units Java's Lesson 08 and Lesson 09 already established, now expressed
as Kotlin values instead of XML unit suffixes.

### Discard the Throwaway Examples

`Greeting` and `LoginTitleAndHint` are deleted — real conceptual
groundwork, not code that enters the project. The real inventory screen,
built for real starting next lesson, uses this exact `@Composable`/
`Column`/`Modifier` vocabulary on real data.

### `@Preview` — Seeing a Composable Without Running the App

One more real, practical piece worth naming before writing throwaway
composables becomes routine: Android Studio can render any parameterless
`@Composable` function directly in the editor, without building or
installing the whole app, given one more annotation:

```kotlin
@Preview(showBackground = true)
@Composable
fun LoginTitleAndHintPreview() {
    LoginTitleAndHint()
}
```

`@Preview` requires a real, existing `@Composable` function with no
required parameters (a plain wrapper calling the real one with sample
data, as shown, is the standard pattern when the real composable does
take parameters) — Android Studio finds every `@Preview`-annotated
function in a file and renders each one in a dedicated panel, updating
live as the source changes. This is a genuinely faster iteration loop
than Java's own screens ever had, which always required a full build and
an emulator or device to see anything at all.

### CS Lens

Describing output as a pure function of input, and leaving the actual
work of reconciling that description against whatever currently exists
to a separate runtime, is the same **declarative** paradigm shift behind
SQL (describe *what* rows you want, not *how* to fetch them), and, most
directly relevant here, the exact same idea behind React's own
component model — `@Composable` functions and React function components
solve UI the same way, for the same underlying reason, arrived at
independently by two different ecosystems.

Also recognized in: HTML/CSS itself (describing what a page should look
like, leaving rendering to the browser engine), and any templating
system that regenerates output from data rather than mutating
previously-generated output by hand.

### SE Lens

**Why does `RecyclerView`'s Adapter/ViewHolder contract exist at all, if
Compose can apparently just skip straight to "describe it and let the
runtime handle the rest"?** `RecyclerView` and its recycling contract
(Java's Lesson 18, Lesson 26) were built inside the older, imperative
View system, where the only tool available for efficiency was manually
reusing a small pool of already-built `View` objects — the object-pool
pattern Java's Lesson 18 CS Lens already named. Compose's runtime solves
the identical efficiency problem — don't do more work than necessary to
keep the screen correct — but does it *underneath* the declarative
API, deciding on its own which parts of a description actually changed
between two calls, rather than requiring the programmer to manage a view
pool by hand. The real cost trade: `RecyclerView`'s contract is visible
and directly controllable (a real, learnable interface); Compose's
recycling and update mechanism is real but happens inside a runtime this
series hasn't looked inside of yet — a genuine loss of visibility for a
genuine gain in how little code has to be written to get correct,
efficient behavior.

---

## Connect the Pieces

One trace: enabling `compose = true` and adding the Compose BOM made
`@Composable` functions and built-in composables like `Text`/`Column`
available in this project for the first time, living alongside — not
replacing — the View Binding-based login screen already built.
`@Composable fun Greeting(name: String)` proved that a composable
describes UI rather than building and returning a `View` object, and
`Column`/`Modifier` proved Compose's own vocabulary for arrangement and
styling directly descends from `LinearLayout`/`android:orientation`/
`android:padding`, expressed as Kotlin function calls and chainable
objects instead of XML tags and attributes.

## What Breaks Without This

Try calling `Text(text = "Hello")` from an ordinary, non-`@Composable`
function — for instance, directly inside `onCreate`, outside any
composable — and attempt to build.

Real output, from running this yourself: a real compiler error stating
that `@Composable` invocations can only happen from the context of a
`@Composable` function — proof that `@Composable` is a real, enforced
restriction on *who is allowed to call this function*, not just
documentation of what the function does. Composable functions form a
connected tree starting from one real entry point (covered fully once
this series wires a composable into a real Activity, next lesson); code
outside that tree cannot call into it directly.

## Exercises

1. Add a `Row` inside this lesson's disposable `LoginTitleAndHint`,
   placing two `Text` composables side by side inside it, and add a
   `@Preview` for the result. Confirm, from the preview panel alone (no
   build required), that they render horizontally rather than stacked.
2. Give `Greeting` a second parameter, `excited: Boolean`, and change its
   body to call `Text` with a different string depending on that
   parameter's value (an ordinary `if`/`else` statement is fine here —
   this series' own if-as-an-expression lesson comes later). Add two
   `@Preview` functions calling `Greeting` with different arguments and
   confirm both render correctly side by side in Android Studio.

## Definition of Done

- [ ] The project builds successfully with `compose = true` and the
      Compose BOM/dependencies added, alongside the existing, unchanged
      View Binding-based login screen.
- [ ] You can explain, precisely, what calling a `@Composable` function
      actually does, and how that differs from what `findViewById` or a
      View Binding property access does.
- [ ] You triggered the real compiler error from calling a composable
      outside any composable context.
- [ ] You used `@Preview` to render a composable in Android Studio
      without running the full app.
- [ ] Commit: `git commit -m "Enable Jetpack Compose alongside the
      existing View Binding login screen"` — explaining that both UI
      systems now coexist deliberately, not that one replaced the other.

Next: the concept `RecyclerView.notifyDataSetChanged()` was always a
manual stand-in for — real, observable state, and what "recomposition"
actually means when a composable's own data changes.
