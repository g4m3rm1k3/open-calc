# Slide Rule — A Kotlin + Jetpack Compose Calculator

## What You Will Build

A good-looking, genuinely extensible scientific calculator for Android:
button-grid arithmetic, a live-updating graph you can pan and zoom, a small
linear-algebra mode (vectors and matrices), numerical calculus drawn directly
on the graph (tangent lines, shaded area under a curve), and a physics
formula sheet — all backed by Room persistence for calculation history and
built entirely in Kotlin and Jetpack Compose. Every math topic is touched
once, deep enough to be real and extendable — this is a seed, not an
exhaustive scientific-calculator clone. You're expected to keep building on
it after Lesson 26.

## Why This Project, Why Now

This is the deliberate Kotlin sibling to [`../track/`](../track/) — the Java
Android "Pocket Inventory" course. That course already ends with a Compose
preview (its Lesson 32, "The Same App, a Different Toolkit"), giving you one
taste of Compose on a codebase you already know cold. This course is the
opposite move: a *new* app, built Compose-first from Lesson 1, so you learn
the paradigm as the default way to build the UI rather than as a late
add-on — and a different domain (calculator, not inventory) so you're not
just re-skinning the same product.

**This course assumes `../track/` (all 34 lessons) is done.** Every general
Android concept it already taught — Activities and the lifecycle, layouts
and the view tree, RecyclerView, SQLite and Room, ViewModel/LiveData/
Repository, Fragments and Navigation, menus/dialogs/permissions, services,
networking, testing, theming, and shipping — is **not retaught here**. This
course only teaches what's genuinely new: Kotlin the language (vs. the Java
you already know), Jetpack Compose as a real, primary UI paradigm (not a
one-lesson taste), and the math content the calculator itself needs. See
[`CURRICULUM_NOTES.md`](CURRICULUM_NOTES.md) for the exact concept-by-concept
map of what transfers from the Java course and what's genuinely new here —
worth reading before writing or reviewing a lesson.

## Lesson Standard

Same contract as every project in this curriculum:
[`LESSON_CONTRACT.md`](../../LESSON_CONTRACT.md) +
[`LESSON SCHEMA.md`](../../LESSON%20SCHEMA.md). The one addition specific to
this project: a concept that has a direct Java-course counterpart (Room,
ViewModel, RecyclerView → LazyColumn, Navigation Component → Compose
Navigation) gets a short **"vs. the Java course"** contrast instead of a
full first-appearance treatment — the underlying idea is already taught;
only the new API surface is.

## Lesson 0 — Kotlin for Java Developers

No user story — a dense, contrastive "translation guide" lesson covering
`val`/`var`, null safety (`?`, `!!`, `?:`, safe calls), data classes,
`when` expressions, string templates, extension functions, single-expression
functions, default/named arguments, and smart casts — each taught as a
direct diff against the Java you already know, not from zero. Ends with a
Kotlin console "Hello World" and enabling Compose in a new Android Studio
project.

→ *(write on request — not yet drafted)*

---

## Epic 1 — Compose Fundamentals

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 1 | `@Composable` functions | A greeting screen — no XML, no `findViewById` | The Compose compiler plugin; `Text`/`Column`/`Row`; `@Preview` |
| 2 | State & recomposition | A counter that updates on click, no manual view updates | `remember { mutableStateOf(...) }`, state hoisting — Compose's core idea, the equivalent of the Java course's LiveData-driven UI updates but declarative |
| 3 | Material 3 & theming | Light/dark mode, a real color scheme | `MaterialTheme`, `Scaffold` — contrast with Java course Lesson 33's `values-night` approach |
| 4 | Compose Navigation | Two real screens (Calculator, Graph) with back-stack behavior | `NavHost`/`NavController` — contrast with Java course Lesson 19's Navigation Component; same concept, Compose-native API |

## Epic 2 — The Calculator Core

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 5 | Button grid + expression state | A working button grid building up an expression string on screen | `LazyVerticalGrid`, state hoisting applied for real |
| 6 | Expression evaluation | Pressing `=` shows a real computed result | A small recursive-descent evaluator in Kotlin — the same pipeline shape as this repo's own OpenMAT project, ported |
| 7 | Errors as values | Dividing by zero shows a clean inline error, not a crash | A sealed `Result` type (`Ok`/`Error`) + exhaustive `when` — idiomatic Kotlin error handling, contrast with Java's exception-heavy style |
| 8 | History list | Every calculation appears in a scrollable history | `LazyColumn` — the direct Compose equivalent of Java course Lesson 6's RecyclerView |

## Epic 3 — Scientific Functions & Kotlin Idioms

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 9 | `kotlin.math` + extension functions | `sin`/`cos`/`log`/`√` buttons work | Extension functions (`Double.toRadians()`-style) — a real Kotlin idiom with no clean Java equivalent |
| 10 | Higher-order functions | A Deg/Rad toggle that changes every trig button's behavior at once | A `Map<String, (Double) -> Double>` dispatch table — functions as values, the same dispatch-table pattern from earlier projects, now in Kotlin |
| 11 | Memory (M+/M-/MR/MC) | Memory buttons work and show a memory indicator | First Compose-driven `ViewModel` — same class from Java course Lesson 15, now read via Compose's `collectAsState` |

## Epic 4 — Graphing

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 12 | The `Canvas` composable | An empty coordinate grid with axes drawn | `Canvas`, `DrawScope` — Compose's low-level drawing API |
| 13 | Plotting a function | Type `x^2`, see it graphed live | Reusing Lesson 6's evaluator, sampling across a pixel-mapped domain |
| 14 | Pan & zoom gestures | Drag and pinch the graph like a real map app | `pointerInput`, `detectTransformGestures` — new Compose gesture API |
| 15 | Multiple functions | Graph two functions at once, see where they cross | Layering draw calls; visual-only intersection, no solver yet |

## Epic 5 — Linear Algebra

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 16 | Vector/Matrix data classes | A small vector/matrix input UI with live results | `data class` + **operator overloading** (`operator fun plus/times`) — genuinely idiomatic Kotlin, no clean Java equivalent |
| 17 | Matrix multiply & determinant | 2×2/3×3 matrix operations compute correctly | Plain Kotlin functions over the new data classes |
| 18 | Solving a linear system | Enter a 2-equation system, see the solution and its point plotted | Gaussian elimination; drawing the result vector on Lesson 12's canvas |

## Epic 6 — Calculus

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 19 | Numerical derivative | Tap a point on the graph, see the tangent line drawn | Finite differences; reusing the graph's draw layer |
| 20 | Numerical integral | Shade the area under a curve between two points | Trapezoidal rule |

## Epic 7 — Physics & Coroutines

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 21 | A formulas screen | Pick "Projectile Motion," enter values, get an answer | Sealed class hierarchy of formulas + exhaustive `when` — a real Kotlin idiom payoff |
| 22 | Coroutines | An animated projectile-motion simulation on the canvas that never freezes the UI | `suspend fun`, `LaunchedEffect`, structured concurrency — direct contrast with Java course Lesson 14's thread/callback approach to "the main thread can't wait" |

## Epic 8 — Persistence & Finishing

| # | Concept | You Can See | New vs. Java Course |
|---|---|---|---|
| 23 | Room + coroutines/Flow | History survives a restart, updates live | Same Room from Java course Lesson 13, now with `suspend fun` + `Flow` instead of callback-based access |
| 24 | `StateFlow` in `ViewModel` | No visible change — the same UI, cleaner underneath | Direct evolution of Java course Lesson 16's LiveData |
| 25 | Testing in Kotlin | A coroutine test and a Compose UI test both pass | Contrast with Java course Lessons 30/31 (JUnit/Mockito, Espresso) |
| 26 | Polish & where to go next | Material You dynamic color, app icon, a closing list of self-directed extensions | Capstone — no new concept, explicit hand-off for you to extend solo (unit converter mode, complex numbers, matrix inverse, a stats mode, symbolic simplification) |

## Definition of Done

- Every button, mode, and screen works end-to-end, no placeholder behavior.
- The graph pans, zooms, and can show at least two functions plus a tangent
  line and a shaded integral region.
- A 2×2 or 3×3 linear system can be entered and solved.
- Calculation history survives an app restart via Room + Flow.
- At least one coroutine-driven animation runs without blocking the UI.
- You can explain, from memory, what changed between this course's
  `ViewModel`/Room usage and the Java course's — not just "it's the same but
  Kotlin."

## Status

All 27 lessons written (Lesson 0 through Lesson 26). Every C#/WPF-style
"vs. Java course" contrast, every Kotlin-specific construct, and the full
math arc (evaluation, graphing, linear algebra, calculus, physics,
persistence, testing) are covered end to end. Extensions deliberately left
unbuilt are listed in [Lesson 26](26-polish-and-next-steps.md) — this
course is a seed, per its own design brief, not an exhaustive scientific
calculator.
