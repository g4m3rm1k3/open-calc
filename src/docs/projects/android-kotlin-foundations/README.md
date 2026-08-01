# Android Kotlin Foundations — Full Lesson Plan

## What This Is

The direct sequel to [`android-ui-foundations`](../android-ui-foundations/):
the same app — a login screen, an inventory grid, a notifications screen
with a real runtime permission — built a second time, from scratch, in
modern Android with Kotlin. Same product, same 36-lesson beats, so every
difference you see is a difference that matters, not an arbitrary one.

This is not "the same lessons with `;` removed." Two real things change
between the two series, and both are taught explicitly, the moment the
app's own needs force them into view — never introduced because "you'll
need this eventually":

1. **The language.** Kotlin is a real, separate programming language with
   its own type system, not "Java with nicer syntax." Null safety, data
   classes, extension functions, lambdas-as-first-class-values, scope
   functions, coroutines, and `sealed`/`when` are all taught as language
   features in their own right, the same way the Java series stopped to
   teach interfaces or bounded generics — because Android's own APIs
   (nullable `Intent` extras, a `RecyclerView.Adapter` callback, a
   permission result arriving on a background thread) demand them, not
   because a lesson decided you should know them.
2. **The platform idiom.** The Java series builds UI with hand-written
   `findViewById`, an XML-only layout, and `AsyncTask`-era permission
   patterns because that is what the platform looked like when those
   idioms were standard, and understanding them is what makes "why did
   Android change this" a real, felt question instead of trivia. This
   series uses what a new Android project actually generates and what
   current documentation recommends: View Binding instead of
   `findViewById`, `ActivityResultContracts` instead of manual
   `onRequestPermissionsResult` overrides, a `ViewModel` holding the data
   a rotation would otherwise destroy, and Jetpack Compose introduced at
   the exact milestone where hand-writing more XML would have been the
   dishonest choice.

## Prerequisite

Finish [`android-ui-foundations`](../android-ui-foundations/) first. This
series assumes you already know what an `Activity`, the Manifest,
`onCreate`, an `Intent`, a `RecyclerView`, and a runtime permission
*are* — it does not re-teach Android's concepts from zero. What it
re-teaches, deliberately, is how each of those concepts is *expressed* in
Kotlin and in current Jetpack libraries, and it calls out every place the
expression changes the concept itself (e.g., a `ViewModel` doesn't just
restyle `onCreate`'s job — it changes *what survives* a rotation).

Every lesson below opens with an explicit callback to the Java lesson it
answers, the same way `android-ui-foundations` opens each lesson with
"what you need to know first."

## How Kotlin Is Taught

Kotlin is a full programming language used well beyond Android — this
series treats it as one. Every Kotlin language feature gets the same
Concept Unit treatment the Java series gives `interfaces` or generics:
introduced in isolation with a throwaway example first, then applied to
the real app. Nothing is waved off as "just how Kotlin does it."

## Lesson Plan

### Milestone 1 — A Kotlin Project, and Why Its Generated Code Looks Different (Lessons 1–4)

**1. The Shape of a Kotlin Program** — answers Lesson 01. `fun main()`
with no enclosing class, top-level functions, `val`/`var`, type
inference. The transferable point: Kotlin drops Java's "everything must
live in a class" rule — and that single change is why so much of this
app's later code looks shorter without being less precise.

**2. Null Safety — `?`, `!!`, and the Compiler's New Job** — answers
Lesson 04 (`NullPointerException`). Kotlin's type system distinguishes
`String` from `String?` at compile time. The transferable point: Java's
`NullPointerException` was a *runtime* discovery; Kotlin turns the same
mistake into a *compile* error, and understanding exactly what the `?`,
`!!`, `?:`, and `?.` operators each promise is the difference between
using this safely and defeating it with `!!` everywhere.

**3. Classes, Properties, and Constructors** — answers Lesson 02 and part
of Lesson 13. Kotlin's primary constructor syntax, properties as
`get`/`set` pairs instead of Java's manual fields-plus-methods. Why a
Kotlin class with three fields and getters/setters is one line instead of
fifteen — and what's actually still happening underneath.

**4. A New Project, View Binding Instead of `findViewById`** — answers
Lesson 05 and Lesson 13's `findViewById` half. Generates a real Kotlin
Android Studio project, and the first real platform-idiom fork: View
Binding's generated `Binding` class gives compile-time-checked view
references instead of `findViewById`'s unchecked cast and runtime crash
on a typo'd ID. The `NullPointerException` risk Lesson 04 taught is shown
closing here — nullable-`?` binding fields make "did I inflate this
layout yet" a compiler question, not a crash you find at runtime.

---

### Milestone 2 — The Login Screen (Lessons 5–9)

**5. `open`, `override`, and Why Kotlin Classes Are Final by Default** —
answers Lesson 06. Kotlin classes and methods cannot be overridden unless
marked `open` — the opposite default from Java. The transferable point:
this is a real design stance (favor composition, make inheritance an
explicit opt-in), not a syntax quirk, and it changes how you read
`MainActivity : AppCompatActivity()`.

**6. Views and Layout Containers, Chosen the Same Way** — answers
Lesson 08. The layout-container decision doesn't change with the
language — this lesson confirms that directly, spends most of its time on
what *does* change (View Binding wiring the container to Kotlin code),
and previews that Milestone 7 will revisit this exact screen in Compose
once the reason to switch is concrete.

**7. `TextView`, String Resources, and String Templates** — answers
Lesson 09. Kotlin string templates (`"$name logged in"`) replace Java's
string concatenation — a real language feature, not a style choice, shown
against the concatenation the Java series wrote by hand.

**8. Lambdas as Real Values — Wiring the Buttons** — answers Lesson 14
(interfaces, anonymous classes, lambdas) and Lesson 16
(`OnClickListener`). This is the single biggest language-feature lesson
in the series: Java's `View.OnClickListener` is a **functional
interface** — an interface with exactly one abstract method — which is
*why* Java could shorten it to a lambda at all (Lesson 14 already proved
this). Kotlin treats functions as first-class values directly, with no
"secretly an anonymous class" story required. `button.setOnClickListener
{ ... }` is shown fully unpacked: trailing lambda syntax, `it`, and what
Kotlin's function types (`(View) -> Unit`) actually are — answering, with
a working example, whether Kotlin still needs a Java-style interface here
at all (it doesn't, and the lesson proves why).

**9. Extension Functions** — new material with no Java-series ancestor,
introduced because the login screen's input validation needs it. The
transferable point: Kotlin lets you add a method to a class you don't
own and can't modify (`String.isValidUsername()`) without inheritance or
a wrapper class — a real answer to a real limitation Java has no clean
answer for, taught in isolation before it's used on `EditText` input.

---

### Milestone 3 — A Second Screen and Real Data (Lessons 10–13)

**10. `data class` — the Feature Lesson 22 Told You Was Coming** —
answers Lesson 22 directly. The Java series explicitly named `record` as
"the newest form, worth knowing" while using the older, hand-written
form. This lesson delivers on that: `data class InventoryItem(val name:
String, val quantity: Int)` and everything one line generates —
`equals`, `hashCode`, `toString`, `copy()`, and destructuring — each
demonstrated against the hand-written Java version it replaces, not
asserted.

**11. Getting to a Second Screen — Intents, and What's Different** —
answers Lesson 17. Same `Intent` API, same three real Android
alternatives — this lesson is honest that intent-based navigation hasn't
changed, then flags Milestone 7's Compose Navigation as the actual
platform-idiom shift Lesson 17 doesn't have an ancestor for yet.

**12. Sealed Classes and `when` as an Expression** — new material,
motivated by needing a `LoginResult` type (success / wrong-password /
network-error) that Java would model with constants and an `if`/`else`
chain riddled with unchecked cases. `sealed class` plus an exhaustive
`when` gives the compiler the ability to catch a missed case at compile
time — shown by deliberately handling only two of three subtypes and
reading the real compiler error.

**13. Scope Functions — `apply`, `let`, and `also`** — new material,
motivated by the object-configuration pattern Lesson 08's layout setup
and Lesson 22's sample-data population both needed repetitively. Each of
Kotlin's scope functions taught by what it actually returns (`this` vs.
the lambda result) and which real situation calls for which — not as a
"pick one" cheat sheet.

---

### Milestone 4 — The Inventory Grid, in Compose (Lessons 14–18)

This milestone is where the platform idiom fork becomes impossible to
paper over. Lesson 18's grid-layout choice and Lessons 26–29's
`RecyclerView.Adapter`/`ViewHolder` contract are the most XML-and-Java-
shaped part of the original series — and Compose exists specifically to
remove that ceremony. This series switches here, not earlier, so the
cost Compose removes is one you already paid once in the Java series and
can feel the size of.

**14. Composable Functions — Describing UI Instead of Building It** —
answers Lesson 08 and Lesson 18's *purpose*, not their mechanism. The
transferable problem: `RecyclerView.Adapter` (Lesson 26) exists to solve
"only build the rows currently on screen" by manually recycling `View`
objects — real, working, and a real amount of ceremony. A `@Composable`
function is a *description* of UI as a function of data; Compose's own
runtime decides what to redraw. This lesson introduces `@Composable`,
`Column`/`Row`/`LazyColumn` in isolation, deliberately not yet wired to
real data.

**15. State and Recomposition** — new material, the concept
`RecyclerView.Adapter.notifyDataSetChanged()` (Lesson 27–29) was a manual,
error-prone stand-in for. `remember { mutableStateOf(...) }`, and exactly
what "recomposition" means: Compose re-running a function, not mutating a
View tree by hand. Shown by deliberately forgetting `remember` and
watching state vanish on rotation — an honest failure, not just an
assertion.

**16. Rebuilding the Grid — `LazyColumn` Instead of `RecyclerView`** —
answers Lessons 26–27 directly. The full contract comparison: `Adapter`'s
`onCreateViewHolder`/`onBindViewHolder`/`getItemCount` versus
`LazyColumn`'s `items(list) { row -> ... }` — same job (only compose
visible rows), radically different amount of code, explained via what
each one is actually doing under the hood, not just "this is shorter."

**17. Adding a Row — State Hoisting** — answers Lesson 28. The add-row
feature forces the real Compose architecture question: which composable
owns the list state, and how does a child (the "add" button/form) report
a new item upward without owning the list itself? State hoisting taught
as the direct Compose answer to a problem Lesson 28's `ArrayList.add()` +
`notifyItemInserted()` didn't have to ask this way.

**18. Deleting a Row, and `remember` vs. `ViewModel`** — answers
Lesson 29 — and exposes state hoisting's real limit. Rotate the device
mid-session and `remember`-held state is gone, because a configuration
change destroys and recreates the composable's host `Activity`. This
lesson names that failure honestly, on screen, then introduces
`ViewModel` as survivable state — not to be revisited as a rewrite, but
as the direct fix to a bug this lesson just made you watch happen.

---

### Milestone 5 — `ViewModel`, Coroutines, and the Notifications Screen (Lessons 19–24)

**19. `ViewModel` and Where State Actually Lives Now** — the architecture
lesson the whole series has been building toward. What a `ViewModel`
survives that a composable or an `Activity` does not, and why; the
inventory list from Milestone 4 is moved into one, with the visible
before/after of a rotation that now doesn't lose data.

**20. `StateFlow` — Observable State Kotlin's Way** — new material,
answering the real question Milestone 4 left open: how does a
`Composable` learn a `ViewModel`'s state changed? `StateFlow`,
`.collectAsState()`, and why this replaces the Java series' total absence
of an observer mechanism (the login/grid screens never needed one,
because manual `notifyDataSetChanged()` calls *were* the update
mechanism).

**21. Coroutines and `suspend` — Answering Lesson 33's Inversion of
Control** — answers Lesson 33 directly, which named this exact problem
("the request call returns immediately... the real answer arrives later")
as the clearest Inversion-of-Control case in the whole Java series.
Kotlin's coroutines and `suspend` functions are taught as a direct answer
to that named problem: code that *reads* top-to-bottom despite genuinely
suspending and resuming later, contrasted line-by-line against a
callback-based version of the same operation.

**22. Declaring the Permission and Building the Notifications Screen** —
answers Lessons 30 and 31. The Manifest declaration step (`SEND_SMS`,
`<uses-feature>`) is identical to the Java series, confirmed rather than
re-derived. Java's own Lesson 33 already uses the modern, contract-based
`ActivityResultContracts.RequestPermission()` API — this series doesn't
"upgrade" that choice, it inherits it — so what actually differs is
narrower and more honest: Java registers the launcher in a field
initializer, satisfying a strict "before STARTED" Activity lifecycle
rule; Compose's own equivalent, `rememberLauncherForActivityResult`,
built in the next lesson, satisfies the analogous composition-time
timing rule through `remember` instead.

**23. `if` as an Expression, and Kotlin's Ternary Answer** — answers
Lesson 32. Kotlin has no `?:`-as-ternary operator (that syntax means
something else entirely in Kotlin — the Elvis operator, a deliberate trap
for a Java-trained reader) because `if`/`else` is already an expression
that returns a value. Shown by rewriting Lesson 32's exact ternary example
as a Kotlin `if` expression, then flagging the Elvis-operator name
collision explicitly so it's never a silent confusion later.

**24. Reacting to the Result — Coroutines Meet the Permission Callback**
— answers Lesson 33's second half. The notifications screen finished:
`registerForActivityResult`'s callback updates `StateFlow`-backed state,
observed by a composable — the full chain from Lessons 19–23 closing on
one real, working screen.

---

### Milestone 6 — Navigation, Theming, and Polish (Lessons 25–30)

**25. Compose Navigation** — answers Lesson 17's deferred half. A real
`NavHost`/`NavController` replacing the `Intent`-per-screen model for the
two Compose screens built in Milestones 4–5, with an honest comparison of
when `Intent`-based navigation (still correct, still used for
inter-app requests) remains the right tool versus when it isn't.

**26. Material Theming — `MaterialTheme` Instead of Per-View Styling** —
answers Lesson 34. Colors, typography, and shape defined once in a
`MaterialTheme` and inherited by every composable, versus the Java
series' per-screen manual style application — the same "define once,
apply everywhere" goal Lesson 34 already named, with Compose's actual
mechanism for it.

**27. Higher-Order Functions — Passing Behavior, Not Just Data** — new
material, motivated by needing the login screen, grid screen, and
notifications screen to share one "styled screen scaffold" composable
that each customizes with its own content. Functions that accept or
return other functions, taught in isolation first, then used to build a
shared layout wrapper — the Compose-idiomatic answer to what Lesson 25's
static nested classes and Lesson 23's abstract classes solved with
inheritance in Java.

**28. Focus Order and Accessibility in Compose** — answers Lesson 35.
`Modifier.focusOrder`/`.semantics` versus the Java series' XML
`nextFocusForward` attributes — same problem (logical tab order, honest
TalkBack traversal), Compose's modifier-based mechanism for solving it.

**29. Animating Between Screens** — answers Lesson 36. Compose
Navigation's `enterTransition`/`exitTransition` versus the Java series'
`overridePendingTransition` — same visual goal, contrasted directly
against the Activity-transition API it replaces.

**30. Sealed Classes Revisited — Modeling All Three Screens as One
Navigation State** — a synthesis lesson with no single Java-series
ancestor. Ties Lesson 12's `sealed class` back in to represent the app's
three destinations as a closed, exhaustive type, wired through the
`NavController` from Lesson 25 — the series' own answer to "now that you
know sealed classes and Navigation separately, here is why real apps
combine them."

---

### Milestone 7 — Testing and What's Actually Different, In Review (Lessons 31–33)

**31. Testing a `ViewModel` with Kotlin Coroutines Test Utilities** — new
material. `kotlinx-coroutines-test`, `runTest`, and testing the
`StateFlow`-backed login/permission logic built in Milestones 3 and 5 —
introduced here specifically because a `ViewModel` with no `Activity`
dependency, unlike the Java series' Activity-entangled logic, is
genuinely unit-testable for the first time in either series.

**32. `sealed` Interfaces and Generics — Bounded Types, Kotlin's Way** —
answers Lesson 12 (bounded generic methods) and Lesson 24 (bounded
generic classes). Kotlin's `where`/`:` bound syntax against Java's
`<T extends X>`, applied to a real generic repository-style wrapper
around the inventory list — same CS concept, closing gap between the two
languages' syntax for it.

**33. Retrospective — Every Fork Between the Two Series, in One Table** —
no new code. A single side-by-side table walking every lesson pair above:
what stayed the same (the platform concept), what changed (the idiom),
and *why* the ecosystem moved — closing the series by making the whole
"Java Android → Kotlin Android" transition visible as one coherent shape,
not 33 disconnected swaps.

## Kotlin Language Features Taught

Null safety (`?`, `!!`, `?:`, `?.`), type inference and `val`/`var`,
string templates, primary constructors and properties, `open`/`override`,
lambdas and function types, trailing lambda syntax, extension functions,
`data class`, `sealed class`/`sealed interface`, `when` as an exhaustive
expression, scope functions (`apply`, `let`, `also`, `run`, `with`),
`if`/`else` as an expression, coroutines and `suspend`, higher-order
functions, and generic bound syntax (`where`/`:`).

## Android/Jetpack Concepts Taught

View Binding, `ViewModel` and configuration-change survival, `StateFlow`
and `collectAsState`, Jetpack Compose (`@Composable`, `remember`, state
hoisting, `LazyColumn`), Compose Navigation, `MaterialTheme`,
`ActivityResultContracts` for runtime permissions, Compose accessibility
modifiers, Compose navigation transitions, and coroutine-based unit
testing of a `ViewModel`.
