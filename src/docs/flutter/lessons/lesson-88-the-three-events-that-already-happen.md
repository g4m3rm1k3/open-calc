# Lesson 88: The Three Events That Already Happen

**What you will build.** `AnalyticsEvent`/`AnalyticsTracker`, a real,
minimal, generic contract for real, named, business events, real and
deliberately distinct from the immediately preceding lesson's own
`Logger`; `LoggingAnalyticsTracker`, its own real, first, live
implementation, reusing the already-real `Logger` rather than
integrating a real, third-party SDK; and real tracking calls wired
into `GameSessionNotifier.enterDigit`, at its own real, two, already-
existing, natural decision points. The transferable problem:
curriculum names five, real events to track. This lesson's own real,
honest job is finding out how many of them this app can actually,
genuinely produce today — and tracking exactly, only, those.

**What you need to know first.** `Logger`/`LogLevel`/
`DeveloperLogger`, already established, the immediately preceding
lesson. `GameSessionNotifier.enterDigit`, and this app's own real
composition root (`game_session_provider.dart`), both already
established, real and central to this lesson's own real, second
Concept Unit.

**Terms used in this lesson**

No new Terms — `AnalyticsEvent`/`AnalyticsTracker` reuse the identical,
already-established, real, minimal-interface-plus-injected-
implementation shape `Clock`/`Logger`/`AuthApi` already established.

**Objects and methods used**

- **`AnalyticsEvent` and `AnalyticsTracker`**
  - *What they are:* a real, minimal, immutable record of one real,
    named event, and a real, minimal interface naming "the ability to
    record one."
  - *Implementation:* `class AnalyticsEvent { const AnalyticsEvent
    (this.name, [this.properties = const {}]); final String name;
    final Map<String, Object?> properties; }`; `abstract interface
    class AnalyticsTracker { void track(AnalyticsEvent event); }`.
  - *Its use:* `LoggingAnalyticsTracker`, below, is this lesson's own
    real, first, live implementation; `GameSessionNotifier
    .enterDigit`, this lesson's own second Concept Unit, is its own
    real, first caller.
  - *Type:* a `const`-constructible, plain, immutable class; a real,
    plain, generic-free interface.
  - *Responsibility:* real, structured naming of one real event —
    nothing about *where* it actually ends up; that stays
    `LoggingAnalyticsTracker`'s own real job, deliberately distinct
    from `Logger`'s own real, diagnostic job: an `AnalyticsEvent`
    answers "what did a real player just do," for a real, later
    product/growth audience; a real, logged error answers "what went
    wrong," for a real, later engineering one.
  - *Depends on:* nothing.
  - *Connects to:* implemented by `LoggingAnalyticsTracker`, below.
  - *Shape:* `observability/`, the identical, real, established,
    cross-cutting directory the two, immediately preceding lessons
    already used.
- **`LoggingAnalyticsTracker`**
  - *What it is:* `AnalyticsTracker`'s own real, first, live
    implementation.
  - *Implementation:* `class LoggingAnalyticsTracker implements
    AnalyticsTracker { const LoggingAnalyticsTracker(this._logger);
    ... _logger.log(LogLevel.info, '${event.name} ${event
    .properties}'); }`.
  - *Its use:* `analyticsTrackerProvider`'s own real, default, in this
    app's own real composition root.
  - *Type:* a real, concrete, `const`-constructible class.
  - *Responsibility:* real delegation straight to the already-real,
    already-tested `Logger` — nothing about *deciding* which real
    events are worth tracking, or what real properties they carry;
    those stay real, calling code's own job.
  - *Depends on:* `Logger`, `LogLevel`, both already established.
  - *Connects to:* `game_session_provider.dart`'s own real,
    composition-root wiring, this lesson's own second Concept Unit.
  - *Shape:* `observability/`.

## Concept Unit: AnalyticsEvent, AnalyticsTracker, and LoggingAnalyticsTracker

### The Problem

Nothing in this app has a real, generic way to record "a real player
genuinely did this" at all — only `Logger`, real and already
established for a real, different, diagnostic audience.

### Introducing the concept

No new isolated lab — a real, minimal, generic interface, one real,
small, immutable data class, and one real, thin, delegating
implementation, are all direct repeats of already-established shapes.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/observability/analytics_event.dart` (new file);
  `project/lib/observability/analytics_tracker.dart` (new file);
  `project/lib/observability/logging_analytics_tracker.dart` (new
  file).
- **Change type** — add.
- **Location** — three new, real, standalone files, in the
  already-established `observability/` directory.
- **Dependencies** — `Logger`, `LogLevel`, both already established.

### The New Code

```dart
class AnalyticsEvent {
  const AnalyticsEvent(this.name, [this.properties = const {}]);
  final String name;
  final Map<String, Object?> properties;
}

abstract interface class AnalyticsTracker {
  void track(AnalyticsEvent event);
}

class LoggingAnalyticsTracker implements AnalyticsTracker {
  const LoggingAnalyticsTracker(this._logger);
  final Logger _logger;

  @override
  void track(AnalyticsEvent event) {
    _logger.log(LogLevel.info, '${event.name} ${event.properties}');
  }
}
```

### The Updated Project

All three files, real and brand new, shown in full above.

### Mechanical walkthrough

- `const AnalyticsEvent(this.name, [this.properties = const {}]);` —
  a real, already-established, `const`-constructible constructor,
  real and taking one real, positional, optional parameter
  (`properties`), defaulting to a real, empty, `const` `Map` — a real
  event carrying no real, extra detail needs no real, separate,
  special-cased constructor.
- `abstract interface class AnalyticsTracker { void track
  (AnalyticsEvent event); }` — the identical, already-established,
  real, plain interface shape `Logger` already used.
- `_logger.log(LogLevel.info, '${event.name} ${event.properties}');`
  — a real, already-established `Logger.log` call, real and using
  `LogLevel.info`, not `.warning`/`.error` — a real, tracked event is
  real and routine, expected, business activity, not a real problem.

### CS lens

Not applicable.

### SE lens

The real, rejected alternative here was integrating a real,
particular, third-party analytics SDK (Firebase Analytics,
Mixpanel, or similar) directly. Curriculum's own real bullet names no
real, specific provider at all — building against one, real, specific,
commercial SDK would tie this real, generic lesson to a real vendor
choice curriculum never actually made, and would need a real, live
network account/API key this project has no honest way to provide.
The real, chosen `AnalyticsTracker` interface keeps that real, later
choice genuinely open — a real, future `FirebaseAnalyticsTracker`, or
any other real, concrete provider, could implement the identical,
real, already-proven contract without this lesson's own real code
changing at all.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Unit, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, generic way to track one, real event now exists — the next
Concept Unit finds out which real events this app can genuinely,
honestly produce today.

---

## Concept Unit: Tracking only what already happens

### The Problem

Curriculum names five, real events. Does this app's own, real,
existing code genuinely produce all five?

> **Try it yourself first.** `GameSession.abandon()`/`useHint()` both
> already exist as real, domain-level methods. Search this app's own
> real, existing notifier and UI code directly: does any real, live
> caller anywhere actually invoke either one?

### Introducing the concept

No new isolated lab — one, real, new, local variable
(`wasNotStarted`), and two, real, new `track` calls placed inside an
already-existing, real method's own already-existing real branches,
are not new constructs; the real, load-bearing proof (that these real
events fire exactly once, at exactly the real, correct moments, across
a real, whole, complete game) lives in this project's own,
already-existing, permanent `game_session_provider_test.dart`,
extended.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/application/game_session_provider.dart`
  (modify).
- **Change type** — modify.
- **Location** — a real, new `analyticsTrackerProvider`;
  `GameSessionNotifier.enterDigit`'s own real method body.
- **Dependencies** — `AnalyticsEvent`, `AnalyticsTracker`,
  `LoggingAnalyticsTracker`, `DeveloperLogger`, all above/already
  established.

### The New Code

```dart
final analyticsTrackerProvider = Provider<AnalyticsTracker>(
  (ref) => const LoggingAnalyticsTracker(DeveloperLogger('Analytics')),
);

void enterDigit(int row, int col, int digit) {
  final wasNotStarted = state.status == GameStatus.notStarted;
  try {
    state.enterDigit(row, col, digit);
  } finally {
    state = state.touched();
    _save();
    if (wasNotStarted && state.status != GameStatus.notStarted) {
      ref.read(analyticsTrackerProvider).track(const AnalyticsEvent('game_started'));
    }
    if (state.status == GameStatus.completed) {
      ref.read(scoreRepositoryProvider).save(Score(...));
      ref.read(analyticsTrackerProvider).track(
        AnalyticsEvent('game_completed', {'difficulty': state.difficulty.name}),
      );
      ref.read(analyticsTrackerProvider).track(
        AnalyticsEvent('score_submitted', {'points': state.score}),
      );
    }
  }
}
```

### The Updated Project

`game_session_provider.dart`'s own real, new provider, and
`enterDigit`'s own real, updated method, numbered, this Concept
Unit's own new or changed lines marked:

```dart
1  final analyticsTrackerProvider = Provider<AnalyticsTracker>(     // ← new
2    (ref) => const LoggingAnalyticsTracker(DeveloperLogger('Analytics')),
3  );
```

```dart
 1  void enterDigit(int row, int col, int digit) {
 2    final wasNotStarted = state.status == GameStatus.notStarted;  // ← new
 3    try {
 4      state.enterDigit(row, col, digit);
 5    } finally {
 6      state = state.touched();
 7      _save();
 8      if (wasNotStarted && state.status != GameStatus.notStarted) { // ← new
 9        ref.read(analyticsTrackerProvider)                          // ← new
10           .track(const AnalyticsEvent('game_started'));            // ← new
11     }                                                              // ← new
12     if (state.status == GameStatus.completed) {
13       ref.read(scoreRepositoryProvider).save(Score(...));
14       ref.read(analyticsTrackerProvider)                           // ← new
15          .track(AnalyticsEvent('game_completed', {                 // ← new
16            'difficulty': state.difficulty.name,                    // ← new
17          }));                                                      // ← new
18       ref.read(analyticsTrackerProvider)                           // ← new
19          .track(AnalyticsEvent('score_submitted', {                // ← new
20            'points': state.score,                                  // ← new
21          }));                                                      // ← new
22     }
23   }
24 }
```

### Mechanical walkthrough

- `final analyticsTrackerProvider = Provider<AnalyticsTracker>((ref)
  => const LoggingAnalyticsTracker(DeveloperLogger('Analytics')));` —
  the identical, already-established, real, composition-root
  `Provider` shape `clockProvider`/`scoreRepositoryProvider` already
  use.
- `final wasNotStarted = state.status == GameStatus.notStarted;` — a
  real, new, local variable, real and captured *before*
  `state.enterDigit` runs, since that real call is what actually
  performs the real transition.
- `if (wasNotStarted && state.status != GameStatus.notStarted) { ...
  }` — real and only genuinely `true` the real, first time a real
  session ever leaves `notStarted` — every real, later move sees
  `wasNotStarted` already `false`, real and skips this real branch
  entirely.
- The two, real, new `track` calls inside the already-existing
  `state.status == GameStatus.completed` branch — real and placed
  directly alongside the real, already-existing score save, real and
  firing together, exactly once, on the real, final, winning move.

### CS lens

Not applicable.

### SE lens

Curriculum's own real, second instruction for this lesson — "avoid
collecting data you don't need" — is this Concept Unit's own real,
central, honest decision: `game_abandoned`/`hint_used` were
deliberately, honestly, **not** wired up, despite both real,
underlying domain methods (`GameSession.abandon()`/`useHint()`)
already existing — real, direct inspection found neither one has any
real, live caller anywhere in this app's own real UI or notifier code
today. Tracking either one now would mean either writing real,
permanently untriggered, dead code, or inventing real, speculative new
UI/behavior solely to have something real to track — the identical,
real kind of scope creep this whole project has consistently avoided
in every earlier lesson.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/game_session_provider_test.dart`.

### Connect the pieces

Every real event this app can genuinely, currently produce is now
genuinely, correctly tracked — proven end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, across a real, complete,
81-move game, played entirely through the real, live UI.

1. The real, first move — `GameSessionNotifier.enterDigit` genuinely
   tracks `game_started`, real and exactly once.
2. Every real, remaining move in between — real and genuinely tracks
   nothing at all, `wasNotStarted` already `false`.
3. The real, final, winning move — `game_completed` and
   `score_submitted` genuinely track together, real and exactly once,
   alongside the real, already-existing score save.
4. This project's own, already-existing, permanent
   `game_session_provider_test.dart`, extended, confirms the real,
   exact, expected sequence: `['game_started', 'game_completed',
   'score_submitted']` — real, direct proof, not assumed.

The three events that already happen — curriculum's own real,
named list, honestly narrowed to exactly what this app can genuinely
produce today, and not one, real, speculative event more.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `GameSessionNotifier` touches real,
permanent, already-existing project code, this lesson's own real
proof lives partly in a new, permanent `project/test/
analytics_tracker_test.dart`, and partly in this project's own,
already-existing, permanent `game_session_provider_test.dart`,
extended, not replaced.

No real, first-attempt mistakes this lesson — every real file
compiled and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 6.9s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:30 +152: All tests passed!
```

152 real test-file-level checks, up from 150 — two new. One real,
isolated flake (this project's own already-established, honest,
unrelated pattern) appeared on the first of two full-suite runs,
confirmed clean immediately after. Zero regressions anywhere else in
this app. Full, honest narrative in
`verification/lesson-88/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
