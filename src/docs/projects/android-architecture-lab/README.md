# Android Architecture Lab — Building It the Way a Professional Would

## What This Is

The same app, one more time, from zero — a login screen, an inventory
grid, and a real, working SMS notification flow — built this time the
way a professional Android team actually starts a real project: a
proper layered architecture (MVVM), Room instead of raw `SQLiteOpenHelper`,
reactive UI updates instead of manual `notifyItemInserted` bookkeeping,
and the real system-service/`Context`/lifecycle discipline
`android-hardware-lab` taught, applied for real instead of on a
throwaway example.

This is **not** a rewrite-in-place of the other two series' project —
it's a brand-new Android Studio project, built up lesson by lesson from
`File → New Project`, the same way `android-ui-foundations` itself
started. Every architectural decision (why a `ViewModel`, why `Room`,
why a `Repository`, where a raw system service still belongs) is taught
as a real, deliberate choice, contrasted directly against how the
earlier series solved the identical problem.

**Prerequisite:** `android-ui-foundations` and `android-persistence-lab`
in full, and `android-hardware-lab` Lessons 01–02 at minimum (System
Services/Manager pattern, `Context`). This series assumes you've felt
the real pain each new piece here fixes — reading `findViewById` calls,
losing typed form data on rotation, writing raw SQL by hand, remembering
to call `notifyItemInserted` yourself — because you already built it
that way once.

## Why This Exists, Separately

Everything in this series is a genuine, real jump in *kind*, the same
reasoning `android-persistence-lab`'s own README already used to justify
its own separate existence: MVVM is an architectural pattern, not a
new API to memorize; Room is a real code-generation and query-validation
layer, not just "a nicer way to call `execSQL`"; `LiveData` changes the
actual direction data flows through the app. Each of these deserves the
same real, isolated-then-applied treatment this repository's whole
approach is built on, not a rushed "and here's the professional version"
tacked onto an already-long series.

## How This Series Uses the Other Three

Every lesson below explicitly traces back to the specific earlier lesson
whose problem it's the professional answer to — never presented as new
material with no history:

- **From `android-ui-foundations`:** the exact UI requirement (login
  fields, a data grid, two buttons) and the exact pain points left open
  on purpose — fields living directly on an `Activity`, manual
  `findViewById` calls, `RecyclerView` updates done one `notify*` call
  at a time.
- **From `android-persistence-lab`:** the exact persistence requirement
  (real accounts, real hashed/salted passwords, real `CRUD` against a
  real database, a real `SmsManager` send) and the exact pain points —
  hand-written `SQLiteOpenHelper`/`Cursor` code, a manual
  `getAllItems()` re-read after every change, one hand-rolled migration.
- **From `android-hardware-lab`:** the real `getSystemService`/Manager
  pattern, the real `Context` family and its real leak risk, and the
  real listener-registration/lifecycle-pairing discipline — applied
  here to where this app *actually* needs a raw system service, and
  contrasted directly against the places `LiveData`'s own
  lifecycle-awareness removes that manual discipline entirely.

## Lesson Standard

Same standard as every curriculum in this repository — see
`android-persistence-lab`'s own README for the full statement. One
addition specific to this series: every architectural pattern
(`ViewModel`, `Room`, `LiveData`, a `Repository`) is introduced by first
**reproducing the real, concrete problem it solves**, using code this
project itself already has reason to write the "old" way — never
"here's a best practice, trust it," always "here's the actual failure,
watched happen, then fixed."

## Roadmap

| # | Title | The Real Problem It Fixes, and Whose |
|---|---|---|
| 1 | Starting the Right Way — Project Setup, Git, and Package Structure | Nothing broken yet — the professional habits (`git init` on commit zero, a deliberate package-by-feature layout, dependency versions managed on purpose) that prevent later pain |
| 2 | MVVM — Why Fields on an Activity Don't Scale | `android-ui-foundations`' own `MainActivity`/`InventoryActivity` fields, reproduced and diagnosed as the real architectural dead end they are |
| 3 | `ViewModel` — Data That Survives What an `Activity` Doesn't | The real, reproduced data-loss-on-rotation bug `android-ui-foundations` never had to face, because it was never tested for |
| 4 | `Room` — the Professional Layer Over SQLite | `android-persistence-lab` Lessons 01–04's own hand-written `SQLiteOpenHelper`/`Cursor` code, replaced by a real, compiler-verified, generated equivalent |
| 5 | `LiveData` — Reactive Data Instead of Manual Reloads | `android-persistence-lab` Lesson 04's own `getAllItems()`, called again by hand after every single change |
| 6 | `Repository` — the Real Boundary Between `ViewModel` and `Room` | `android-persistence-lab`'s `ItemRepository`/`UserRepository`, rebuilt as the real architectural seam MVVM requires, not just a helper class |
| 7 | `ViewBinding` — the Real, Current Replacement for `findViewById` | `android-ui-foundations` Lesson 13's own manual `findViewById` calls and the wrong-ID risk that lesson proved directly |
| 8 | `RecyclerView` + `DiffUtil` — Automatic List Updates | `android-ui-foundations` Lessons 28–29's manual `notifyItemInserted`/`notifyItemRemoved` calls, and the real bug class (forgetting one) that `DiffUtil` removes entirely |
| 9 | Real Login, Through the New Architecture | `android-persistence-lab` Lessons 05–06's real hashing/salting logic, moved into a `Repository` a `ViewModel` calls, off the main thread for real |
| 10 | `Context` Done Right — `AndroidViewModel` and Why a `Repository` Never Holds an `Activity` | `android-hardware-lab` Lesson 02's own real leak demonstration, applied directly to this project's own `Repository` design |
| 11 | A Real System Service, Wired In Correctly | `android-hardware-lab` Lessons 01/03/05's `getSystemService`/listener/lifecycle-pairing pattern, applied to a real feature this app gains (a `ClipboardManager` "copy row" action), contrasted against where `LiveData` already made that manual discipline unnecessary |
| 12 | `SmsManager`, the Professional Way | `android-persistence-lab` Lessons 09–10's real send/permission/trigger logic, rebuilt as `ViewModel`-triggered and `LiveData`-observed instead of called directly from an `Activity` |
| 13 | Dependency Injection — Manual First, Then `Hilt` | Every constructor across this series that manually builds its own collaborators (`new DatabaseHelper(this)`, repeated everywhere) — the real, professional fix |
| 14 | Testing a `ViewModel` and a `Repository` With No Emulator | The real, professional practice every other lesson in this entire repository has deliberately deferred — real `JUnit`/`Mockito` tests proving business logic correct without a device at all |

## What This Series Deliberately Does Not Change

Still Java (per this series' own explicit scope), still XML layouts (no
Jetpack Compose), still no `Fragment`/Navigation Component rearchitecture
of the three-screen flow `android-ui-foundations` already established —
each is a real, legitimate further step, genuinely out of this series'
own chosen scope, the same honest "real alternative, not built here"
treatment this repository gives every deliberately-deferred tool.

## Status

- [x] Lessons 1–5 — written
- [ ] Lessons 6–14 — in progress

## Definition of Done (whole series)

- The same login/grid/SMS feature set as `android-persistence-lab`,
  functionally identical from a user's perspective, built on a real
  `ViewModel`/`Repository`/`Room`/`LiveData` architecture instead of
  fields and raw SQL directly on an `Activity`.
- Rotating the device mid-form, mid-edit, or mid-scroll never loses
  data the old series would have lost.
- Every `RecyclerView` change happens through `DiffUtil`, with zero
  manual `notifyItem*` calls anywhere in the codebase.
- At least one real, working system-service feature, registered and
  unregistered correctly against the real component lifecycle.
- A real, passing unit test suite for the `ViewModel` and `Repository`
  layers, running with no emulator or device required.
