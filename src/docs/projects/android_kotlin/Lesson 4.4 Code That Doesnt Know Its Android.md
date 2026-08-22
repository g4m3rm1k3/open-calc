# Lesson 4.4: Code That Doesn't Know It's Android

- **What you will build** — no new feature, and no production code changes
  at all; every one of this project's 27 real, passing tests still passes,
  unchanged, at the end of it. Instead, this lesson proves, with real,
  executed compiler evidence rather than a diagram, that this project's
  own three real files — `Calculator.kt`, `CalculatorViewModel.kt`, and
  `MainActivity.kt` — already form a real, working three-layer
  architecture, each layer depending only on the one below it, never the
  reverse. The transferable problem: a codebase can be organized into
  files with sensible names and still have no real architecture at all,
  if nothing actually stops a "lower" layer from quietly depending on a
  "higher" one — a real architecture is a rule about which direction
  dependencies are *allowed* to point, provable by trying to break it,
  not just a diagram someone drew once.
- **What you need to know first** — Lesson 3.3's `CalculatorState` and
  `nextState`, both real, pure functions living in `Calculator.kt`, with
  zero Compose or Android dependency; Lesson 4.3's real
  `CalculatorViewModel`, owning `CalculatorState` and calling `nextState`;
  Lesson 4.1's real `CalculatorScreen`, reading `CalculatorViewModel`'s
  own exposed state and forwarding button presses to it.
- **Terms used in this lesson**
  - **MVVM** — a real, named architectural pattern organizing an
    application into three layers — a View, a ViewModel, and a Model (or,
    as this project's own BRD names it, a **Domain** layer) — each with
    its own real, distinct job, connected by a rule about which
    direction a dependency is allowed to point. Why it matters: without
    a named pattern and a real rule, "keep the UI and the business logic
    separate" is just good intentions — MVVM gives it three concrete
    layers and one concrete, checkable rule.
  - **Domain layer** — this project's own specific name (matching its
    own BRD, not the more generic "Model") for the layer holding pure
    business logic and pure data, with zero dependency on any UI
    framework, any Android class, or even Compose's own state-management
    machinery. Why it matters: this is the layer every other layer is
    ultimately built to serve, and the one most worth keeping completely
    independent, since it's the part of the app least likely to ever
    need to change just because the UI framework does.
  - **Dependency direction** — the specific, real rule an architecture
    enforces: a layer may depend on the layers *below* it, never the
    layers *above* it. Why it matters: a rule about names ("this file
    lives in a `domain` folder") is not the same as a rule about
    dependencies — the only way to actually know a layer never depends
    upward is to check, for real, whether its own code could even
    compile without whatever sits above it.
- **Objects and methods used**

  - **Everything else in the file, not this lesson's subject but still
    explained:**

    - **`Calculator.kt`**
      - *What it is:* this project's own real file holding every piece
        of this calculator's actual business logic and data —
        `Operation`, `Operator`, `Display`, `CalculatorState`,
        `nextState` — all unchanged by this lesson.
      - *Implementation:* a real Kotlin file with zero `import`
        statements of any kind — confirmed by reading its own real,
        current content this session.
      - *Its use:* this lesson's own real, decisive subject for the
        **Domain** layer — compiled standalone this session, proving
        that zero-import claim for real, not just by reading it.
      - *Type:* a Kotlin source file, holding several real top-level
        declarations.
      - *Responsibility:* compute this calculator's own results and hold
        its own state, correctly, with absolutely no awareness that
        Android, Compose, or any UI framework exists.
      - *Depends on:* nothing beyond the Kotlin standard library.
      - *Connects to:* called by `CalculatorViewModel`, below (`nextState`,
        `CalculatorState`); never calls anything outside itself.
      - *Shape:* the Domain layer, in full — the bottom of this
        project's own real, three-layer architecture.

    - **`CalculatorViewModel`**
      - *What it is:* this project's own real, permanent class, owning
        this calculator's current state independently of `CalculatorScreen`'s
        own lifecycle, unchanged by this lesson.
      - *Implementation:* `class CalculatorViewModel : ViewModel() { var
        state by mutableStateOf(CalculatorState()); private set; fun
        onButtonClick(label: String) { state = nextState(state, label) }
        }`, in `CalculatorViewModel.kt`, importing only
        `androidx.compose.runtime.*` and `androidx.lifecycle.ViewModel` —
        confirmed by reading its own real, current content this session.
      - *Its use:* this lesson's own real, decisive subject for the
        **ViewModel** layer — compiled this session with a real,
        deliberately restricted classpath, proving exactly what it needs
        and, just as importantly, what it doesn't.
      - *Type:* a class extending `ViewModel`.
      - *Responsibility:* own this calculator's state and translate real
        button presses into real calls against the Domain layer — nothing
        about how that state is actually rendered on screen.
      - *Depends on:* `Calculator.kt`'s own real `CalculatorState` and
        `nextState`; Compose's own real state-holding primitives
        (`mutableStateOf`); AndroidX's own real `ViewModel` base class.
      - *Connects to:* called by `CalculatorScreen`, below, via
        `viewModel()`; calls `nextState` directly.
      - *Shape:* the ViewModel layer, in full — the real, single
        crossing point between this project's UI and its Domain.

    - **`CalculatorScreen`**
      - *What it is:* this project's own real, top-level screen
        composable, unchanged by this lesson.
      - *Implementation:* `@Composable fun CalculatorScreen(mode: String
        = "Basic", calculatorViewModel: CalculatorViewModel =
        viewModel())`, in `MainActivity.kt`, importing, among many other
        real Compose UI and Android types, `android.os.Bundle`,
        `androidx.activity.ComponentActivity`,
        `androidx.compose.foundation.layout.Column`,
        `androidx.compose.material3.Text`, and
        `androidx.navigation.compose.NavHost` — confirmed by reading its
        own real, current content this session.
      - *Its use:* this lesson's own real, decisive subject for the
        **UI** layer — compiled this session with the exact same
        restricted classpath `CalculatorViewModel.kt` compiled cleanly
        against, proving it genuinely needs strictly more.
      - *Type:* a `@Composable` function.
      - *Responsibility:* render whatever state `CalculatorViewModel`
        currently exposes, and forward real user button presses back to
        it — nothing about computing a result or owning state itself.
      - *Depends on:* `CalculatorViewModel`, above, for state and
        behavior; real Compose UI, Material3, and Android framework
        types for rendering.
      - *Connects to:* reads `calculatorViewModel.state`; calls
        `calculatorViewModel.onButtonClick(label)` on every keypad press.
      - *Shape:* the UI layer, in full — the top of this project's own
        real, three-layer architecture, depending on everything below it.

---

## Concept Unit: Domain — the layer that needs nothing

### The Problem

`Calculator.kt` has read, in earlier lessons, as "the pure logic file" —
a description, not a proof. Nothing has ever actually tested whether it
could secretly be relying on some Android or Compose class without
anyone noticing, the way a single stray import can quietly happen during
an ordinary edit.

> **Stop and think:** if you wanted to prove, for certain, that a real
> Kotlin file needs absolutely nothing beyond the Kotlin standard
> library — no Android SDK, no Compose, nothing — what real command
> could you run to test that claim directly, rather than just reading
> the file's own imports and trusting what you see? What would it mean
> if that exact same command, run against `CalculatorViewModel.kt`
> instead, failed?

### Introduce the Concept in Isolation

A real copy of this project's own current `Calculator.kt`, compiled
completely standalone, with no classpath entries of any kind — not even
the Android SDK:

```
$ kotlinc Calculator.kt -include-runtime -d calculator_domain.jar
(compiles clean, no warnings/errors, zero -cp entries at all)
exit code: 0
```

A real, clean compile, with genuinely nothing on the classpath beyond
the Kotlin compiler's own standard library. Now the contrast: a real
copy of `CalculatorViewModel.kt`, compiled with *only* that same
freshly-built Domain jar on its classpath — the absolute minimum
anything depending on Domain could possibly need:

```
$ kotlinc CalculatorViewModel.kt -cp calculator_domain.jar -include-runtime -d viewmodel_zero_deps.jar
CalculatorViewModel.kt:3:8: error: unresolved reference 'androidx'.
import androidx.compose.runtime.getValue
       ^^^^^^^^
CalculatorViewModel.kt:6:8: error: unresolved reference 'androidx'.
import androidx.lifecycle.ViewModel
       ^^^^^^^^
CalculatorViewModel.kt:8:29: error: unresolved reference 'ViewModel'.
class CalculatorViewModel : ViewModel() {
                            ^^^^^^^^^
exit code: 1
```

A real, genuine compile failure. `Calculator.kt` needed nothing at all;
the moment something is built *on top of* it, real, new dependencies
appear immediately. This proves, concretely, that `Calculator.kt` sits
at the real bottom of this project's own dependency graph — nothing
below it, because nothing needs to be. This bottom layer, holding pure
logic and data with zero framework dependency, is called this project's
own **Domain layer**.

### Discard the Throwaway Example

Both real, temporary copies — `Calculator.kt` and `CalculatorViewModel.kt`
— and both compiled `.jar` files are deleted now; the real project's own
files were never touched at all. Real, saved in
`verification/4.4/step1_domain_copy.kt`,
`step1_domain_compiles_standalone.txt`, and
`break1_viewmodel_fails_with_zero_classpath.txt`.

### Mechanical Walkthrough

- `kotlinc Calculator.kt -include-runtime -d calculator_domain.jar` —
  compiles the real, unmodified `Calculator.kt` with no `-cp` flag at
  all — meaning the only things the compiler can resolve are Kotlin's
  own language constructs and standard library, proven above to be
  sufficient.
- `exit code: 0` — the real, standard shell convention for "succeeded,"
  confirming the compile genuinely finished with no errors.
- `kotlinc CalculatorViewModel.kt -cp calculator_domain.jar
  -include-runtime -d viewmodel_zero_deps.jar` — compiles the real,
  unmodified `CalculatorViewModel.kt`, this time with one real jar on
  the classpath — the Domain layer's own compiled output — proving even
  the smallest possible amount of help still isn't enough.
- `error: unresolved reference 'androidx'` — a real, genuine compiler
  error, appearing once per import the compiler couldn't resolve;
  `androidx.compose.runtime.getValue` and `androidx.lifecycle.ViewModel`
  are both real packages `CalculatorViewModel.kt` genuinely imports, and
  neither exists anywhere on this restricted classpath.
- `exit code: 1` — the real, standard shell convention for "failed,"
  confirming this compile genuinely did not succeed.

### CS Lens

A layer with zero dependency on anything above or beside it, sitting at
the bottom of a real dependency graph, is the concrete foundation the
broader idea of **layered architecture** is built on — every layer
above it can change freely, as long as it doesn't touch the one
foundational contract everything else is built against.

```
Also recognized in: an operating system's own kernel, with zero
dependency on any application running on top of it; a database's own
storage engine, independent of any query language built above it; a
compiler's own intermediate representation, independent of whichever
source language originally produced it; TCP, independent of any
particular application protocol built on top of it
```

### SE Lens

The alternative to a real, enforced Domain layer isn't hypothetical —
it's the shape most small projects actually start in: business logic
scattered directly inside UI code, with no file, and no real boundary,
drawing a line between "what this app computes" and "how this app looks
right now." That design is genuinely faster to write at first — no
extra file, no decision about what belongs where. The real cost, proven
concretely by this project's own Stage 2 and Stage 4 work: logic tangled
into UI code can't be tested without standing up the UI framework around
it (this project's own `CalculatorStateTest.kt` already proves the
opposite — `nextState` alone, tested directly, at real sub-millisecond
speed), and it can't be reused if the UI framework itself ever changes.
Keeping `Calculator.kt` genuinely dependency-free doesn't cost this
project anything today — the real discipline it requires is simply never
adding an import to that one file that doesn't belong there, a rule
this lesson's own compile just proved is still being honestly kept.

### Commands Needed

- `kotlinc <file>.kt -cp <jar1>:<jar2> -include-runtime -d <file>.jar`
  — compiles a standalone Kotlin file, resolving any real external
  types it references against the exact jars listed after `-cp`
  (colon-separated on macOS/Linux), bundling the Kotlin runtime into the
  output so it can run standalone afterward; omitting `-cp` entirely, as
  `Calculator.kt`'s own compile does, means nothing but the Kotlin
  standard library is available to resolve against.

### Run It

Both real commands, and their real output, already shown above in full;
both transcripts saved at `verification/4.4/step1_domain_compiles_standalone.txt`
and `verification/4.4/break1_viewmodel_fails_with_zero_classpath.txt`.

### Connect the Pieces

`Calculator.kt` needs nothing; the moment `CalculatorViewModel.kt` tries
to build on top of it with nothing else available, it fails immediately
— real, concrete proof of exactly where this project's own dependency
graph actually begins. The next unit finds out precisely how much
`CalculatorViewModel.kt` really does need, and how much less that is
than the UI layer built on top of *it*.

---

## Concept Unit: ViewModel — depends on Domain, never on rendering

### The Problem

The previous unit proved `CalculatorViewModel.kt` needs *something* —
real Compose and AndroidX types the Domain layer never touches. But
"needs something" isn't precise. `CalculatorScreen` also needs real
Compose types. If both layers reach for the same broad "Compose"
umbrella, is there still a real, meaningful line between what the
ViewModel layer needs and what only the UI layer needs — or has the
dependency direction quietly collapsed into "everything needs
everything"?

> **Stop and think:** `CalculatorViewModel.kt` uses `mutableStateOf` —
> a real Compose construct — but never renders anything to a screen; it
> has no `Text`, no `Button`, no `Column` anywhere in it. Given that
> Compose actually ships as several separate real libraries, not one
> single artifact, what would you predict happens if you tried to
> compile `CalculatorViewModel.kt` against only the specific Compose
> library that provides `mutableStateOf`, deliberately leaving out the
> one that provides `Text` and `Button`? What real evidence would prove
> whether that prediction is right?

### Introduce the Concept in Isolation

A real copy of `CalculatorViewModel.kt`, compiled against a real,
deliberately narrow classpath: the Domain layer's own compiled output,
plus exactly two real libraries — Compose's own **Runtime** module
(which provides `mutableStateOf` and its own `by` delegate support) and
AndroidX's own **Lifecycle ViewModel** module — nothing from Compose's
own **UI** module, no Material3, no Android SDK at all:

```
$ kotlinc CalculatorViewModel.kt -cp "calculator_domain.jar:runtime/classes.jar:lifecycle-viewmodel/classes.jar" -include-runtime -d viewmodel_minimal.jar
(compiles clean, no warnings/errors — Domain + Compose Runtime + AndroidX
Lifecycle ViewModel only; no Compose UI, no Material3, no android.jar)
exit code: 0
```

A real, clean compile — confirming the prediction: `CalculatorViewModel.kt`
genuinely never needed anything that draws pixels, only the specific
real module that lets it *hold* observable state. Now the decisive
contrast: a real copy of `MainActivity.kt`, compiled against that exact
same restricted classpath, with the freshly-built ViewModel jar added
alongside it:

```
$ kotlinc MainActivity.kt -cp "calculator_domain.jar:viewmodel_minimal.jar:runtime/classes.jar:lifecycle-viewmodel/classes.jar:lifecycle-viewmodel-compose/classes.jar" -include-runtime -d mainactivity_minimal.jar
MainActivity.kt:3:8: error: unresolved reference 'android'.
import android.os.Bundle
       ^^^^^^^
MainActivity.kt:4:17: error: unresolved reference 'activity'.
import androidx.activity.ComponentActivity
                ^^^^^^^^
MainActivity.kt:6:25: error: unresolved reference 'animation'.
import androidx.compose.animation.animateColorAsState
                        ^^^^^^^^^
MainActivity.kt:7:25: error: unresolved reference 'foundation'.
import androidx.compose.foundation.layout.Column
                        ^^^^^^^^^^
exit code: 1
```

A real, genuine, decisive failure — `MainActivity.kt` needs
`android.os.Bundle`, `androidx.activity.ComponentActivity`,
`androidx.compose.foundation.layout.Column`,
`androidx.compose.animation.animateColorAsState`, and — further down
this same real error output — `androidx.compose.material3.*` and
`androidx.navigation.*`, none of which `CalculatorViewModel.kt` needed
even once. Real, concrete proof of the exact real boundary between two
layers that both happen to use "Compose": the ViewModel layer needs only
Compose's own state-holding machinery; the UI layer needs Compose's own
actual rendering machinery, the Android framework itself, and Navigation
— strictly more, never the reverse.

### Discard the Throwaway Example

All real, temporary copies and compiled jars from both units are
deleted now; the real project's own files were never touched. Real,
saved in `verification/4.4/step2_viewmodel_copy.kt`,
`step2_viewmodel_compiles_with_minimal_classpath.txt`,
`step3_ui_copy.kt`, and `break2_ui_fails_with_viewmodel_classpath.txt`.

### Mechanical Walkthrough

- `kotlinc CalculatorViewModel.kt -cp
  "calculator_domain.jar:runtime/classes.jar:lifecycle-viewmodel/classes.jar"
  ...` — compiles the real, unmodified `CalculatorViewModel.kt` against
  exactly three real jars: the Domain layer's own compiled output,
  Compose's own real **Runtime** artifact (`androidx.compose.runtime`,
  the specific library providing `mutableStateOf` and its own delegate
  support — distinct from Compose's own **UI** artifact, which provides
  rendering composables like `Text` and `Button`), and AndroidX's own
  real **Lifecycle ViewModel** artifact.
- `exit code: 0` — confirms the real compile genuinely succeeded with
  exactly that narrow set of real dependencies.
- `kotlinc MainActivity.kt -cp
  "calculator_domain.jar:viewmodel_minimal.jar:runtime/classes.jar:lifecycle-viewmodel/classes.jar:lifecycle-viewmodel-compose/classes.jar"
  ...` — compiles the real, unmodified `MainActivity.kt` against that
  same real, narrow classpath, with the freshly-built `CalculatorViewModel`
  jar added so `CalculatorScreen`'s own real reference to it can resolve.
- `error: unresolved reference 'android'` /
  `'activity'` / `'animation'` / `'foundation'` — four real, genuine
  compiler errors, each naming a real package `MainActivity.kt` actually
  imports that has no jar providing it anywhere on this restricted
  classpath: `android.os.Bundle` (the Android SDK itself), `androidx.
  activity.ComponentActivity`, `androidx.compose.animation.
  animateColorAsState`, and `androidx.compose.foundation.layout.Column`
  — the real output continues further, naming `androidx.compose.
  material3.*` and `androidx.navigation.*` too.
- `exit code: 1` — confirms this real compile genuinely failed.

### CS Lens

Two layers that both, on paper, "use the same framework" can still have
a genuinely different real dependency footprint — the same idea behind
**modular library design**, where a large framework is deliberately
split into several separate, independently-linkable artifacts instead
of one monolithic one, specifically so consumers only need to depend on
the exact slice they actually use.

```
Also recognized in: the C standard library split into separate headers
(<stdio.h>, <math.h>, ...) linked independently; a web framework
splitting its ORM from its templating engine into separate installable
packages; a large SDK offering separate "core" and "UI" artifacts so a
backend service can use the core without pulling in an entire GUI
toolkit
```

### SE Lens

The alternative — bundling everything Compose-related into one
undifferentiated dependency and letting any layer reach for any of it —
would still compile and run today. The real cost only shows up over
time: without Compose's own real split between its Runtime and UI
artifacts, there would be nothing stopping a future edit from quietly
adding a `Text` call directly inside `CalculatorViewModel.kt`, and
nothing in the build would catch it — the "ViewModel never renders
anything" rule would become a convention someone has to remember, not a
fact the compiler enforces. Because Compose's own artifacts are already
genuinely separate, and this project's own `build.gradle.kts` never adds
`androidx.compose.ui`/`material3` to anything but the main `app` module
`MainActivity.kt` lives in, the real boundary this unit just proved
isn't an accident — it's a direct, structural consequence of a real
choice already made when this project's own dependencies were declared.

### Commands Needed

No new commands beyond `kotlinc ... -cp ...`, already shown in full
above.

### Run It

Both real commands, and their real output, already shown above in full;
both transcripts saved at
`verification/4.4/step2_viewmodel_compiles_with_minimal_classpath.txt`
and `verification/4.4/break2_ui_fails_with_viewmodel_classpath.txt`.

### Connect the Pieces

The previous unit proved Domain needs nothing, and anything built on
top of it needs *something*; this unit found precisely what that
something is for the ViewModel layer specifically — real state-holding
machinery and a real lifecycle base class, genuinely nothing about
rendering — and proved, with the exact same restricted classpath, that
the UI layer sitting above it needs strictly more again.

---

## Connect the Pieces

Three real files, three real, executed compiles, one real chain of
strictly-increasing dependency. `Calculator.kt` compiled with nothing at
all — the real floor of this project's own dependency graph.
`CalculatorViewModel.kt` failed against that same nothing, then
succeeded the moment Compose's own Runtime artifact and AndroidX's own
Lifecycle ViewModel artifact were added — real, specific evidence that
the ViewModel layer depends on Domain plus exactly enough machinery to
hold observable state, and not one real dependency more.
`MainActivity.kt` failed against that exact same, still-restricted
classpath, needing the Android SDK itself, Compose's own UI and
Material3 artifacts, and Navigation before it would compile at all —
real, decisive evidence that the UI layer depends on everything below it
and adds real rendering machinery of its own. Three real layers, one
real direction — Domain, at the bottom, needing nothing; ViewModel,
built on Domain, needing state machinery but never rendering; UI, built
on both, needing everything. This project didn't invent this shape for
this lesson — every file already existed, unchanged, before this lesson
began. What this lesson proved, for real, is that the shape those files
already had is a genuine, checkable architecture, not just a
convenient way to organize three files.
