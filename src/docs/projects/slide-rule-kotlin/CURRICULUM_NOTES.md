# Curriculum Notes — Slide Rule (Kotlin + Compose)

Working notes for whoever writes Lessons 0–26 next (human or AI). `README.md`
is the roadmap; this file is the *why* and the exact prerequisite map that
isn't itself part of the roadmap.

## Why this project exists, and why it's smaller than the WPF course

Written as the Kotlin/Compose follow-on to `../track/`, the Java Android
"Pocket Inventory" course, for a student who explicitly wants to conserve
effort/resources building this — the design brief was "touch on things, I'll
extend it myself after," not an exhaustive curriculum. That's why this is
~27 lessons instead of the WPF course's 50: nearly every foundational Android
concept is already paid for by `../track/`, so this course only has to teach
the delta (Kotlin-the-language, Compose-the-paradigm) plus the new app's math
content, touched once each rather than exhaustively.

## The exact prerequisite map — what `../track/` already covers

As of this writing, `../track/` has 34 lessons, covering (lesson number in
that course → concept): 1 package/namespaces, 2 Activity lifecycle/IoC, 3
view hierarchy, 4–5 Intents/back stack, 6 RecyclerView, 7 data model classes,
8 passing data between screens, 9 input validation, 10 Activity Result API,
11 SharedPreferences, 12 SQLite, 13 Room, 14 threading basics, 15 ViewModel,
16 LiveData, 17 Repository pattern, 18 Fragments, 19 Navigation Component, 20
DiffUtil, 21 menus/toolbar/search, 22 dialogs, 23 swipe-to-delete/Snackbar,
24 runtime permissions, 25 implicit intents/camera, 26 services/WorkManager,
27 BroadcastReceivers, 28 Retrofit/JSON, 29 ContentProvider, 30 JUnit/
Mockito, 31 Espresso, 32 a Jetpack Compose preview (same app, different
toolkit — this course's explicit "you've had one taste, now go deep" hook),
33 theming/dark mode/screen size, 34 signing/R8/shipping.

**None of that gets re-taught here.** If a lesson in this course is tempted
to re-explain Activities, Fragments, RecyclerView, SQLite, ViewModel, or
Navigation from scratch, that's a sign it drifted from the brief — reference
the Java-course lesson by number instead (per `LESSON_CONTRACT.md`'s
Connection Standards) and teach only the delta.

**Re-verify this list before trusting it if `../track/` has grown further** —
it was actively being written during this course's own design, so it may
already have more than 34 lessons by the time Lessons 0–26 here are actually
drafted. Check `ls ../track/` first.

## What's actually new here (the real teaching surface)

1. **Kotlin vs. Java, as a language** — null safety, data classes, sealed
   classes, extension functions, higher-order functions/lambdas, coroutines,
   scope functions, smart casts, operator overloading. Lesson 0 front-loads
   the small, low-cost ones (val/var, string templates, `when`) as a dense
   contrast lesson; the bigger ones (sealed classes, coroutines, operator
   overloading) get their own full lesson later, at the point the app
   actually needs them (per the Concept Isolation Rule — familiar-looking
   Kotlin still isn't Java, don't let the contrast-lesson format become an
   excuse to skip a real lab for the meaty ones).
2. **Jetpack Compose as the primary UI paradigm**, not a one-lesson taste.
   State hoisting is this course's equivalent of the WPF course's data-
   binding pivot and the Java course's LiveData — the recurring idea that
   the view reacts to state instead of being told about it, now in its
   third incarnation across this curriculum's projects. Say so explicitly
   when it's taught (Lesson 2) — this is exactly the kind of hard-concept
   reappearance `LESSON_CONTRACT.md`'s Repetition Rule wants named, not
   silently re-taught as if new.
3. **The math content** — expression evaluation, graphing, linear algebra,
   numerical calculus, physics formulas. Each is touched once, deep enough
   to be real and extendable, deliberately not exhaustive. Resist the urge
   to expand any single math epic into a full course of its own — that's
   explicitly against the brief this course was designed to.

## Cross-project connections worth making explicit in the actual lessons

- Lesson 6's expression evaluator is the same tokenize → parse → evaluate
  shape as this repo's OpenMAT project — name that connection directly when
  it's taught, don't just build it in isolation.
- Lesson 10's dispatch table (`Map<String, (Double) -> Double>`) is the same
  dispatch-table pattern that recurs across this curriculum (OpenMAT,
  `../pocket-inventory-wpf/`'s WPF course) — another Repetition Rule moment.
- Lesson 13/14 (canvas-drawn tangent line and shaded integral) reuse Epic 4's
  graphing layer rather than building a second drawing surface — keep them
  additive to that Canvas, not a parallel implementation.

## Don't conflate with the WPF course's patterns

The WPF course (`../pocket-inventory-wpf/`) delayed MVVM until Lesson 23,
specifically because code-behind pain needed to be felt first on an
audience with zero prior UI-framework experience. That reasoning does not
apply here — this student already has a full Android/Java course behind
them and already has one Compose preview from it. Compose-first from Lesson
1 is the right call here, not a contradiction of the WPF course's ordering
principle — it's the same "introduce the paradigm when the audience is
actually ready for it, not on a fixed schedule" judgment, applied to a
different starting point.

## Status

- [x] `README.md` — 27-lesson roadmap (Lesson 0 + 8 epics)
- [x] Lessons 0–26 — all written. Kotlin-only snippets (Lessons 0, 6, 7, 9,
      10, 16–20, 25) were verified for real, this session, via `kotlinc`/
      `kotlin` installed locally with `brew install kotlin`. Android/
      Compose-specific code (everything touching `@Composable`, `Canvas`,
      `ViewModel`, Room, coroutine builders tied to Android lifecycles)
      could not be executed in this sandboxed session — written from
      accurate, established API knowledge and flagged as needing
      verification on a real Android Studio run, the same honesty
      standard the WPF course applied to its own un-runnable WPF windows.
- [ ] Lesson 26's own "Pass 3" honesty check — confirming every screen,
      not just the calculator, actually got the Lesson 24 ViewModel
      treatment — was written as a prompt for the student to verify
      themselves against the real codebase, not verified against real code
      here (no app was actually built during authoring — these are lesson
      documents, not a running project).
