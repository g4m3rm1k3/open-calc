# Android Foundations — Java, Kotlin, and the Framework, Topic by Topic

## What this is, and how it differs from this repo's other Android curricula

This repo already has several full narrative Android curricula —
[`track`](../track/)/[`track-beginner`](../track-beginner/)/
[`track-foundations`](../track-foundations/) (build one app, Java-based),
[`android-ui-foundations`](../android-ui-foundations/) (build a login
app, Java-based, in progress),
[`android-kotlin-foundations`](../android-kotlin-foundations/)/
[`kotlin basics`](../kotlin%20basics/) (Kotlin-based), and several
hardware/architecture/persistence labs. All of them are real, full
Lesson Schema curricula. What they share is the same shape this repo's
WPF material had before [`wpf-foundations`](../wpf-foundations/): one
continuous story, built across dozens of lessons, so getting back to
"wait, how did RecyclerView work again" means remembering *which* app,
*which* lesson number, and reading everything in between to get back
into context.

**This series is the same fix `wpf-foundations` was for WPF:** topic-
indexed, not narrative. Every lesson stands alone, teaches exactly one
real concept with a genuine isolated lab (or a real, deliberately caused
failure, when that's the clearer proof), and gets its own file you can
jump straight to. Full [`LESSON SCHEMA.md`](../../reference/LESSON%20SCHEMA.md)
rigor throughout — nothing appears in a code block without being taught
first.

## Who this is for

Real, working knowledge of OOP — proven, at this point, across this
curriculum's own earlier Java/Kotlin Android work and, more recently, C#
([`wpf-foundations`](../wpf-foundations/)). Classes, objects,
constructors, inheritance, interfaces are **not** re-taught here. Every
lesson below still gives full first-appearance treatment to anything
Java- or Kotlin-specific — a construct looking familiar from C# or from
this curriculum's own earlier Java material is a trap, not a reason to
skip its lab, per the schema's own Concept Isolation Rule.

## How the lessons are ordered — Java first, traditional Views, no Compose

**Java comes first, and the framework arc is Java-based.** The real
reason: the actual course this series is built for is taught in Java,
against the traditional View/XML UI toolkit — not Kotlin, and not
Jetpack Compose. Kotlin Essentials (Arc 2, below) already exists from
this series' first pass and stays, real and useful — a large share of
real-world Android code and job postings expect it — but it's not the
active priority right now, and the framework arc does not depend on it.

### Arc 1 — Java Essentials

| # | Lesson | Covers |
|---|---|---|
| 01 | [Java Syntax at a Glance](lesson-01-java-syntax-at-a-glance.md) | primitives vs. objects, arrays, `final`, access modifiers — Java specifics, not OOP itself |
| 02 | [Null in Java](lesson-02-null-in-java.md) | a real `NullPointerException`, defensive checks, `Optional<T>` — contrasted directly against Kotlin's compiler-enforced null safety (Lesson 07) |
| 03 | [Interfaces, Anonymous Classes, and Lambdas](lesson-03-interfaces-anonymous-classes-and-lambdas.md) | the single-method-interface pattern behind every Android listener, proven from a verbose anonymous class down to a Java 8 lambda |
| 04 | [Classes and the Object Contract](lesson-04-classes-and-the-object-contract.md) | hand-written `equals()`/`hashCode()`/`toString()`, proven against a real broken `HashSet` when the contract is violated |
| 05 | [Collections, Generics, and Streams](lesson-05-collections-generics-and-streams.md) | `List`/`Map`, generics and real type erasure, Java Streams (`map`/`filter`/`collect`) |

### Arc 2 — Kotlin Essentials *(written first pass; not the active priority)*

| # | Lesson | Covers |
|---|---|---|
| 06 | [Kotlin Syntax at a Glance](lesson-06-kotlin-val-var-and-type-inference.md) | `val`/`var`, type inference, string templates |
| 07 | [Kotlin Null Safety](lesson-07-kotlin-null-safety.md) | `?`, `?.`, `?:`, `!!`, smart casts — proven against a real `NullPointerException` and its fix |
| 08 | [Kotlin Functions as Values](lesson-08-kotlin-functions-as-values.md) | lambdas, trailing lambda syntax, higher-order functions |
| 09 | [Kotlin Classes and Data Classes](lesson-09-kotlin-classes-and-data-classes.md) | primary constructors, `data class`-generated equality |

### Arc 3 — The Android Framework (Java, traditional Views)

| # | Lesson | Covers |
|---|---|---|
| 10 | [Project Anatomy](lesson-10-project-anatomy.md) | Gradle (`build.gradle`), `AndroidManifest.xml`, `res/layout` XML, the generated `R` class, `setContentView` |
| 11 | [The Activity Lifecycle](lesson-11-the-activity-lifecycle.md) | `onCreate`/`onStart`/`onResume`/`onPause`/`onStop`/`onDestroy`, proven with real, logged callback order across launch, backgrounding, and close |
| 12 | [Views, ViewGroups, and XML Layouts](lesson-12-views-viewgroups-and-xml-layouts.md) | `View`, `ViewGroup`, `LinearLayout`, `ConstraintLayout`, `match_parent`/`wrap_content` |
| 13 | [`findViewById` and ViewBinding](lesson-13-findviewbyid-and-viewbinding.md) | a real `ClassCastException` from a wrong-type cast, fixed with ViewBinding's generated, typed fields |
| 14 | [RecyclerView and Adapters](lesson-14-recyclerview-and-adapters.md) | `Adapter`/`ViewHolder`, proven by real, logged call counts to reuse a small, fixed pool of rows against a 5,000-item list |
| 15 | [Fragments and the Fragment Lifecycle](lesson-15-fragments-and-the-fragment-lifecycle.md) | a real, separate, layered lifecycle proven by real, interleaved Logcat output against its host Activity |
| 16 | [ViewModel and Configuration Changes](lesson-16-viewmodel-and-configuration-changes.md) | a real, reproduced state-loss bug on rotation, fixed by `ViewModel`, proven via logged object identity |
| 17 | [LiveData](lesson-17-livedata.md) | a real, reproduced stale-UI bug, fixed by `LiveData`/`.observe(...)` — the direct Android counterpart to `wpf-foundations`' `INotifyPropertyChanged` |
| 18 | [Room](lesson-18-room.md) | `@Entity`/`@Dao`/`RoomDatabase`, proven with a real save surviving an actual forced app kill and relaunch |
| 19 | [Intents and Navigation](lesson-19-intents-and-navigation.md) | launching a real second Activity, passing real data via extras, proven against a real silent-`null` typo'd-key failure |
| 20 | [Permissions](lesson-20-permissions.md) | the real runtime request flow, proven against a real observed denial, not just the happy path |
| 21 | [Services and Background Work](lesson-21-services-and-background-work.md) | a real frozen-app bug fixed with `WorkManager`, proven to outlive the Activity that enqueued it |

This is the real, primary payoff of this series — the ground
`wpf-quick-reference`/`wpf-foundations` covered for WPF, at full depth,
for the actual platform and language this course uses.

## Status

Complete — all 21 lessons written. Java Essentials (Arc 1, Lessons
01–05), Kotlin Essentials (Arc 2, Lessons 06–09, paused deliberately —
see each lesson's own "Next" section), and the full Android Framework
arc (Arc 3, Lessons 10–21, Java, traditional Views, no Compose).

- [x] Lesson 01 — Java Syntax at a Glance
- [x] Lesson 02 — Null in Java
- [x] Lesson 03 — Interfaces, Anonymous Classes, and Lambdas
- [x] Lesson 04 — Classes and the Object Contract
- [x] Lesson 05 — Collections, Generics, and Streams
- [x] Lesson 06 — Kotlin Syntax at a Glance
- [x] Lesson 07 — Kotlin Null Safety
- [x] Lesson 08 — Kotlin Functions as Values
- [x] Lesson 09 — Kotlin Classes and Data Classes
- [x] Lesson 10 — Project Anatomy
- [x] Lesson 11 — The Activity Lifecycle
- [x] Lesson 12 — Views, ViewGroups, and XML Layouts
- [x] Lesson 13 — `findViewById` and ViewBinding
- [x] Lesson 14 — RecyclerView and Adapters
- [x] Lesson 15 — Fragments and the Fragment Lifecycle
- [x] Lesson 16 — ViewModel and Configuration Changes
- [x] Lesson 17 — LiveData
- [x] Lesson 18 — Room
- [x] Lesson 19 — Intents and Navigation
- [x] Lesson 20 — Permissions
- [x] Lesson 21 — Services and Background Work
