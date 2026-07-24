# Lesson 32: The Same App, a Different Toolkit — an Introduction to Jetpack Compose

**What you will build:** A second, complete implementation of the
Settings screen — `ComposeSettingsScreen` — built with Jetpack Compose
instead of XML layouts and `findViewById`, kept in the project as a
real, working alternative alongside `SettingsFragment` (Lesson 21),
the same "build it for real, don't wire it in by default" pattern
Lesson 26 established for `Service` and Lesson 29 for `ContentProvider`.
The transferable problem: every screen since Lesson 3 has been built
from two separate halves — an XML file describing structure, and Java
code imperatively finding and mutating views by ID. Compose collapses
both into one thing: a function describing what the UI *should look
like right now*, re-run automatically whenever the state it depends on
changes, with no `findViewById` and no manual `notifyDataSetChanged`-
style calls anywhere in it.

**A required, upfront honesty check before anything else:** Jetpack
Compose's compiler plugin only processes **Kotlin** source files — it
cannot compile a `@Composable` function written in Java, at all, full
stop. This project has been Java throughout, deliberately (Lesson 1),
and stays Java everywhere else. This lesson is a genuine, bounded
exception: exactly one new file, in Kotlin, doing exactly one thing,
with the smallest possible amount of new Kotlin syntax explained
alongside it — not a switch to Kotlin, and not a full Kotlin course.
Real, professional Android codebases mixing Java and Kotlin in the same
project is itself a common, real situation, not a contrivance invented
for this lesson.

**What you need to know first:** Lesson 21 (`SettingsFragment`, the
feature being rebuilt), Lesson 11 (`SharedPreferences`, the same data
this new screen reads and writes), Lesson 16 (`LiveData`'s "re-run
when state changes" idea — Compose's recomposition is a close cousin).

---

## Concept Unit: Just Enough Kotlin to Read What Follows

### The Problem

Before any Compose-specific syntax, the plain Kotlin underneath it
needs a translation, since every line of this lesson's real code is
Kotlin, not Java.

### The Concept, as a Direct Comparison

| Java (what you know) | Kotlin (what this lesson uses) |
|---|---|
| `int x = 5;` | `val x = 5` — `val` means "assigned once," like Java's `final`; no semicolons required |
| `int x; x = 5;` (reassignable) | `var x = 5` — reassignable, Java's plain `int x` |
| `String greet(String name) { return "Hi " + name; }` | `fun greet(name: String): String { return "Hi $name" }` — `fun` declares a function; type comes *after* the name; `$name` inside a string is a **string template**, inserting the variable's value directly, no `+` concatenation |
| `list.forEach(item -> System.out.println(item));` | `list.forEach { item -> println(item) }` — a **trailing lambda**: when a function's last parameter is itself a function/lambda, Kotlin lets you write it outside the parentheses, directly as a `{ }` block |

That table is the entire Kotlin vocabulary this lesson needs. Every
other piece of syntax below is Compose-specific, explained on its own
first appearance exactly like every other new construct in this
curriculum — the table above is reference material to return to, not
something to memorize before continuing.

### Commands Needed

Add to the **project-level** `build.gradle`'s `plugins { }` block:

```gradle
id 'org.jetbrains.kotlin.android' version '1.9.22' apply false
```

Add to `app/build.gradle`'s `plugins { }` block:

```gradle
id 'org.jetbrains.kotlin.android'
```

Add inside `app/build.gradle`'s `android { }` block:

```gradle
buildFeatures {
    compose true
}
composeOptions {
    kotlinCompilerExtensionVersion '1.5.8'
}
```

Add to `dependencies { }`:

```gradle
implementation platform('androidx.compose:compose-bom:2024.02.00')
implementation 'androidx.compose.ui:ui'
implementation 'androidx.compose.material3:material3'
implementation 'androidx.compose.ui:ui-tooling-preview'
implementation 'androidx.activity:activity-compose:1.8.2'
```

Sync — this is a substantial dependency addition; give it time.

---

## Concept Unit: `@Composable` — a Function That Describes UI

### The Problem

Every screen so far needs an XML file (structure) plus Java (behavior),
kept in sync by hand — Lesson 3's `activity_main.xml` plus Lesson 4's
`findViewById` calls, repeated for every screen since. See the
alternative shape in isolation before building the real screen.

### Introduce the Concept in Isolation

Create a throwaway file, `ComposeDemo.kt` (note the `.kt` extension —
**first appearance**, marking this as Kotlin source, compiled by an
entirely separate compiler front-end from every `.java` file in this
project):

```kotlin
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}
```

This alone doesn't run anything visible — `@Composable` functions
describe UI; something still has to actually display one. Temporarily,
inside `InventoryActivity.onCreate`, after `setContentView`, add:

```java
android.view.ViewGroup root = findViewById(android.R.id.content);
androidx.compose.ui.platform.ComposeView composeView = new androidx.compose.ui.platform.ComposeView(this);
composeView.setContent(kotlin.jvm.functions.Function0::class); // placeholder, see note below
```

In practice, calling a `@Composable` function directly from Java is
awkward (Java has no native trailing-lambda syntax matching
`setContent { Greeting("World") }`'s idiomatic Kotlin form) — for this
isolated proof, temporarily add a tiny Kotlin-side bridge instead,
`ComposeDemoHost.kt`:

```kotlin
import android.app.Activity
import androidx.compose.ui.platform.ComposeView

fun showComposeDemo(activity: Activity) {
    val composeView = ComposeView(activity)
    composeView.setContent { Greeting("World") }
    activity.setContentView(composeView)
}
```

And call `ComposeDemoHostKt.showComposeDemo(this);` temporarily from
`InventoryActivity.onCreate`. Run the app: the whole screen is replaced
by plain text reading "Hello, World!" — real, running proof a
`@Composable` function produced real, visible UI with no XML file
anywhere in the chain.

### Discard the Throwaway Example

Delete `ComposeDemo.kt`, `ComposeDemoHost.kt`, and the temporary call —
the real Settings screen, built next, replaces this proof with the
genuine feature.

### Mechanical Walkthrough
- `@Composable` — **first appearance.** Marks a function as describing
  UI — the Compose compiler plugin transforms functions marked this way
  in ways ordinary Kotlin functions aren't, enabling the automatic
  re-invocation (**recomposition**, covered fully next unit) the rest
  of this lesson depends on.
- `fun Greeting(name: String) { ... }` — reappearing (this lesson's
  Kotlin table), new detail worth naming: Composable function names
  conventionally start with a capital letter, like a class, signaling
  "this represents a piece of UI," not an ordinary action.
- `Text(text = "Hello, $name!")` — **first appearance.** A Compose-
- provided function (itself `@Composable`) that renders text — the
  direct conceptual replacement for XML's `<TextView>` (Lesson 3), now
- a function call instead of a tag.
- `text = "..."` — **first appearance
  of Kotlin named-argument syntax** — explicitly naming which parameter
  a value is for, readable independent of parameter order.
- `ComposeView(activity)` — **first appearance.** The actual bridge
  class letting Compose UI exist inside this project's otherwise
  entirely View-based world — every screen in this project remains a
  Fragment hosted the Lesson 18/19 way; `ComposeView` is itself just
  another `View` that happens to render Compose content inside it.
- `composeView.setContent { Greeting("World") }` — **first appearance.**
  The actual entry point connecting a `ComposeView` to real
- `@Composable` content — `{ Greeting("World") }` is Kotlin's trailing-
  lambda syntax (this lesson's table) supplying the UI-describing
  function to run.

### CS Lens

Describing UI as "what it should currently look like," re-invoked
automatically on state change, rather than "here's the initial
structure, now imperatively mutate pieces of it over time," is
**declarative UI** — the exact same conceptual shift Lesson 3's CS Lens
already named for XML layouts versus manual pixel placement, taken one
step further: XML is still declarative *structure*, but every update to
it since Lesson 4 (`setText`, `notifyDataSetChanged`) has been
imperative Java glue code. Compose makes updates declarative too. Also
recognized in: React/Vue's component re-render model, SwiftUI (Apple's
close analog), and spreadsheet formula recalculation, named already in
Lesson 3's own CS Lens, now recurring for the third time in this
curriculum.

---

## Concept Unit: State and Recomposition — Rebuilding the Settings Screen

### The Problem

Time to build the real feature: a Compose version of `SettingsFragment`
(Lesson 21) — reading the current threshold, letting the user edit it,
saving it back, with identical behavior to the existing XML/Java
version.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `ComposeSettingsScreen.kt`.
- **Change type:** Create.
- **Dependencies:** none new beyond this lesson's Gradle additions.

### The New Code

```kotlin
package com.yourname.pocketinventory

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ComposeSettingsScreen(context: Context, onSaved: () -> Unit) {
    val prefs = context.getSharedPreferences("pocket_inventory_prefs", Context.MODE_PRIVATE)
    var thresholdText by remember {
        mutableStateOf(prefs.getInt("low_stock_threshold", 5).toString())
    }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(modifier = Modifier.padding(24.dp)) {
        Text(text = "Low-stock warning threshold")
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = thresholdText,
            onValueChange = { thresholdText = it },
            isError = errorMessage != null
        )
        if (errorMessage != null) {
            Text(text = errorMessage!!)
        }
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = {
            val threshold = thresholdText.toIntOrNull()
            if (threshold == null) {
                errorMessage = "Enter a whole number"
            } else {
                prefs.edit().putInt("low_stock_threshold", threshold).apply()
                onSaved()
            }
        }) {
            Text(text = "Save")
        }
    }
}
```

### The Updated Project

A whole new file — nothing to show it landing inside yet, though its
*behavior* is a direct, feature-for-feature parallel to
`SettingsFragment.java`'s `onViewCreated` from Lesson 21.

### Mechanical Walkthrough
- `fun ComposeSettingsScreen(context: Context, onSaved: () -> Unit)` —
- reappearing (`fun`, this lesson's table); `onSaved: () -> Unit` —
  **first appearance of a Kotlin function type as a parameter** — "a
  parameter that is itself a function, taking no arguments and
  returning nothing" (`Unit` is Kotlin's equivalent of Java's `void`,
  but usable as a real type) — the Kotlin-side version of Lesson 8's
  `OnItemClickListener` interface, here needing no interface
  declaration at all, just a type describing the shape directly.
- `var thresholdText by remember { mutableStateOf(...) }` — **first
  appearance, the single most important new idea in this lesson.**
  `mutableStateOf(...)` creates a special, Compose-tracked value
  holder; `remember { ... }` tells Compose "create this once, and keep
  the *same* holder across recompositions of this function, don't
- rebuild it from scratch every time this function reruns"; `by` — **first appearance of Kotlin property delegation** — lets `thresholdText`

  be read and written as if it were a plain `var`, while every write
  actually goes through the tracked holder underneath. The direct
  payoff: assigning a new value to `thresholdText` anywhere in this
  function automatically triggers **recomposition** — Compose re-
  invokes this function, producing updated UI, with **no**
- `findViewById`, **no** `.setText(...)` call anywhere — a complete,
  structural elimination of the imperative view-mutation pattern every
  single screen since Lesson 4 has used.
- `var errorMessage by remember { mutableStateOf<String?>(null) }` —
- reappearing shape, `String?` — **first appearance of Kotlin nullable types** — the `?` suffix means this variable is explicitly allowed to

  hold `null` (Kotlin, unlike Java, distinguishes nullable from
  non-nullable types at the language level; a plain `String` type could
  never hold `null` without the `?`).
- `Column(modifier = Modifier.padding(24.dp)) { ... }` — **first
  appearance.** A layout composable, the direct conceptual replacement
- for `LinearLayout android:orientation="vertical"` (Lesson 7) — stacks
  its child composables (everything in the trailing lambda) vertically.
- `Modifier` — **first appearance** — a chainable configuration object
  (a similar shape to the Builder pattern already met repeatedly, Lesson
  13/22/26/28) describing how a composable should be measured, laid
- out, and drawn — `padding(24.dp)` the direct replacement for XML's
  `android:padding` attribute (Lesson 6).
- `TextField(value = ..., onValueChange = { thresholdText = it }, isError = ...)`
- — **first appearance.** The Compose replacement for `<EditText>`
  (Lesson 9) — critically **stateless on its own**: unlike an
  `EditText`, which holds its own text internally, a Compose `TextField`
  displays exactly `value` and calls `onValueChange` on every keystroke
- — the *caller* (this function, via `thresholdText`) owns the actual
  state, a pattern called **state hoisting**, explained fully in this
- unit's SE Lens.
- `it` — **first appearance of Kotlin's implicit single- parameter name** — inside a lambda with exactly one parameter, `it`

  refers to it without declaring a name explicitly, here the newly-typed
  text.
- `if (errorMessage != null) { Text(text = errorMessage!!) }` —
- reappearing `if` (already basic), `errorMessage!!` — **first
  appearance of Kotlin's non-null assertion operator** — asserts "I
  know this isn't null right now" (safe here, directly inside the
- `null`-checking `if` block), throwing if wrong — a real, sharp-edged
  operator worth using carefully, flagged rather than glossed over.
- `Button(onClick = { ... }) { Text(text = "Save") }` — **first
- appearance.** The Compose replacement for `<Button>` (Lesson 3) —
  `onClick` is a trailing-lambda-shaped parameter (this lesson's table),
  and the **outer** trailing lambda (after the parentheses close) is
- the button's own *content* — a Compose `Button` doesn't take a `text`
  parameter directly; it takes arbitrary child composables, here just a
  `Text`, a real structural difference from the XML `Button`'s
  `android:text` attribute worth naming.
- `thresholdText.toIntOrNull()` — **first appearance.** Kotlin's
  standard-library equivalent of Lesson 9/30's `try`/`catch`-wrapped
- `Integer.parseInt` — returns the parsed `Int` or `null` on failure,
  no exception thrown or caught at all, a real, different idiom for the
  identical underlying need.
- `prefs.edit().putInt("low_stock_threshold", threshold).apply()` —
  reappearing verbatim, Lesson 11 — proof this new UI toolkit changes
  nothing about how data is actually read or written; only the
  *screen-building* half of this project's stack differs.

### CS Lens

**This is a hard concept — unidirectional data flow via hoisted state —
and it's worth naming explicitly, distinct from ordinary recomposition:**
`TextField` doesn't own its own text; it receives a value from above
and reports changes upward via a callback, with the *actual* source of
truth living one level higher, in the calling function's own state.
Also recognized in: React's "controlled components" (the identical
pattern, different language), Redux/Flux-style state management
architectures generally, and — closer to home — Lesson 16's `LiveData`,
where `InventoryAdapter` similarly never owns its data, only displays
whatever `submitList` most recently supplied.

### SE Lens

**Why does `TextField` push state ownership up to the caller instead of
just managing its own text internally, the way `EditText` always has?**
An `EditText` owning its own state works fine in isolation, but makes
it genuinely awkward to have *other* logic — validation, a reset
button, syncing with a `ViewModel` — react to or control that text from
outside, since the only way in is through imperative methods like
`.setText(...)`/`.getText()` (Lesson 9). Hoisting the state up means
*any* other part of this function (or a parent function, in a more
complex screen) can read or drive `thresholdText` directly, as an
ordinary variable — the cost is that every stateful widget needs an
explicit `value`/`onValueChange` pair wired by hand, more verbose for
the simplest possible case than `EditText`'s "just works" default.

---

## Concept Unit: Hosting the Composable From Java

### The Problem

`ComposeSettingsScreen` exists but nothing in this project's real,
Java-based Fragment/Activity structure displays it yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `ComposeSettingsFragment.java`.
- **Change type:** Create — kept as an unused-by-default alternative to
  `SettingsFragment`, per this lesson's opening framing.

### The New Code

```java
package com.yourname.pocketinventory;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.compose.ui.platform.ComposeView;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import kotlin.Unit;

public class ComposeSettingsFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        ComposeView composeView = new ComposeView(requireContext());
        composeView.setContent(compose -> {
            ComposeSettingsScreenKt.ComposeSettingsScreen(requireContext(), () -> {
                Navigation.findNavController(requireView()).navigateUp();
                return Unit.INSTANCE;
            });
            return Unit.INSTANCE;
        });
        return composeView;
    }
}
```

### The Updated Project

This is the whole new file. It follows the exact `onCreateView`-returns-
a-`View` contract from Lesson 18 — the only difference from every
other Fragment in this project is that the returned `View` is a
`ComposeView` instead of the result of `inflater.inflate(...)`.

### Mechanical Walkthrough
- `ComposeView composeView = new ComposeView(requireContext())` —
  reappearing (this lesson's first unit), constructed directly rather
- than inflated from XML — `ComposeView` is a real, ordinary Java-
  constructible class despite hosting Kotlin content.
- `composeView.setContent(compose -> { ... return Unit.INSTANCE; })` —
  **first appearance of calling Kotlin's trailing-lambda API from
  Java.** Java has no trailing-lambda syntax; calling a Kotlin function
  expecting `() -> Unit` from Java means passing an ordinary Java
- lambda that explicitly `return`s `kotlin.Unit.INSTANCE` — the Java- visible representation of Kotlin's `Unit` type — a real, slightly

  awkward seam this lesson's opening honesty check promised to be
  upfront about.
- `ComposeSettingsScreenKt.ComposeSettingsScreen(...)` — **first
  appearance of calling a Kotlin top-level function from Java.** Kotlin
  compiles a file's top-level functions (like `ComposeSettingsScreen`,
  declared directly in `ComposeSettingsScreen.kt`, not inside any
  class) into a synthetic Java class named after the file with `Kt`
- appended — `ComposeSettingsScreenKt` — a real, mechanical detail of
  how Kotlin/Java interop actually works, not an arbitrary naming
  choice.
- `() -> { Navigation.findNavController(requireView()).navigateUp(); return Unit.INSTANCE; }`
- — reappearing (`NavController.navigateUp()`, Lesson 19/21), supplied as this screen's `onSaved` callback — the Compose screen calls it

  after successfully saving, exactly parallel to `SettingsFragment`'s
  own navigation-away-on-save behavior from Lesson 21.

### Run It

Temporarily add a second destination to `nav_graph.xml` pointing at
`ComposeSettingsFragment` and a temporary second button to reach it
(or briefly swap `settingsFragment`'s `android:name` to
`ComposeSettingsFragment` and run it directly). Confirm it reads the
real saved threshold, lets you edit and save it, and that
`SettingsFragment`'s own version (switch back) shows the identical,
updated value afterward — real proof both implementations read and
write the exact same underlying `SharedPreferences` data, differing
only in how the screen itself is built.

### CS Lens

Two independently-built UI implementations reading and writing the
exact same underlying data source is a direct, felt demonstration of
this project's own layering discipline (Lesson 17's Repository
principle, here at the `SharedPreferences` layer instead of Room): the
data layer has no idea, and no reason to care, whether XML/`findViewById`
or Compose is presenting it.

---

## Connect the Pieces

Full trace: `ComposeSettingsFragment.onCreateView` (Java, the familiar
Lesson 18 shape) constructs a `ComposeView` and calls its Kotlin-
originated `setContent`, bridged through Java's lambda-to-`Unit.INSTANCE`
seam → inside, `ComposeSettingsScreenKt.ComposeSettingsScreen(...)`
runs real Kotlin code, reading `SharedPreferences` (Lesson 11,
unchanged) into a `remember`ed, Compose-tracked `thresholdText` → every
keystroke in the `TextField` calls `onValueChange`, reassigning
`thresholdText`, automatically triggering recomposition — the entire
function reruns, producing updated UI, with not one `findViewById` or
`.setText()` call anywhere in this file → tapping Save parses the text,
writes back through the identical `SharedPreferences.Editor` chain
Lesson 11 built, and calls the `onSaved` callback, which — back on the
Java side — calls the same `NavController.navigateUp()` every other
screen in this project already uses.

## What Breaks Without This

Temporarily remove `remember { }` from around `mutableStateOf(...)`,
leaving `var thresholdText by mutableStateOf(...)` directly. Type into
the field: the text visually resets on every keystroke, because without
`remember`, a fresh `mutableStateOf` holder is created on *every*
recomposition instead of persisting across them — a real, direct
demonstration of what `remember` actually buys you. Restore it
afterward.

## Exercises

1. Add a `Text` composable showing a live character count below the
   `TextField` (`Text(text = "${thresholdText.length} characters")`),
   confirming it updates automatically on every keystroke with no
   additional wiring — direct proof recomposition covers every
   composable reading the changed state, not just the one that wrote it.
2. Write down, in your own words, comparing this lesson's
   `ComposeSettingsScreen` directly against Lesson 21's
   `SettingsFragment`: which felt like less code for identical
   behavior, and which parts (if any) felt like they'd get harder to
   read as the screen grew more complex than one field.

## Definition of Done

- [ ] `ComposeSettingsScreen.kt` and `ComposeSettingsFragment.java`
      both exist, compile, and correctly read/write the real saved
      threshold.
- [ ] You ran the throwaway `Greeting` composable and saw real Compose
      output before building the real screen.
- [ ] You can explain, in your own words, what `remember` and
      `mutableStateOf` each do, and why removing `remember` breaks
      typing.
- [ ] You can explain why this lesson's new file had to be Kotlin, not
      Java, and what `ComposeSettingsScreenKt` actually is.
- [ ] Commit: message explaining why (e.g. "Add a Compose-based
      alternative Settings screen alongside the existing XML/Fragment
      version, demonstrating declarative UI and state hoisting against
      the same SharedPreferences data").

Lesson 33 is next: every screen so far uses whatever colors and text
sizes the wizard's default theme happened to generate — Material
theming, dark mode, and layouts that adapt to screen size instead of
just phone-shaped assumptions.
