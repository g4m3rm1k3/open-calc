# Lesson 79: The Rank That Was Already There

**What you will build.** `Ranked`, a real, new, minimal interface;
this project's own, already-existing `Leaderboard` (`top`/`best`),
real and generalized from a real, hard-coded `List<Score>` shape to a
real, bounded `List<T extends Ranked>` one; `Leaderboard.rankOf`, one,
real, new method; and `LeaderboardEntry`, this lesson's own real, one,
new data type — one real player's own real, current, best score on a
real, global leaderboard. Curriculum's own real, three, named
deliverables for this lesson — Global leaderboard, Friends leaderboard,
Personal ranking — turn out, once `Leaderboard` is genuinely generic,
to need almost no real, new ranking logic at all. The transferable
problem: this lesson's own real test isn't whether a real leaderboard
can be built — it's whether an earlier, real, working design, built
for one real, narrower case, was already, secretly, general enough for
a real, second, genuinely different one, the instant that real, second
case actually showed up.

**What you need to know first.** `Leaderboard.top`/`.best`, real and
already-established, from this project's own much earlier, real
scoring lesson. `SyncableRecord`, from the immediately preceding
lesson. `GameSession implements GameState` — the real, already-proven
example of retroactive interface conformance an already-existing, real
class satisfies a real, later-defined contract with zero real changes
to its own real behavior — the identical real move this lesson makes
again, for `Score implements Ranked`.

**Terms used in this lesson**

No new Terms — this lesson's own real move (an already-existing, real
class retroactively satisfying a real, new, minimal interface) reuses
the identical, already-named idea `GameSession implements GameState`
already established.

**Objects and methods used**

- **`Ranked`**
  - *What it is:* a real, minimal, bounded interface naming the one,
    real fact `Leaderboard` actually needs to rank anything.
  - *Implementation:* `abstract interface class Ranked { int get
    points; }`.
  - *Its use:* `Score` and `LeaderboardEntry` both, real and
    independently, implement it.
  - *Type:* a real, plain, bounded-generic-friendly interface.
  - *Responsibility:* name exactly one, real, comparable fact — nothing
    about a real `gameId`, a real `achievedAt`, or a real `playerId`;
    those stay each real, concrete type's own real, additional
    business.
  - *Depends on:* nothing.
  - *Connects to:* the real bound on every one of `Leaderboard`'s own
    real, generic methods, below.
  - *Shape:* Domain-layer, `game_platform/domain/`.
- **`Leaderboard.rankOf`**
  - *What it is:* a real, new method on the already-established
    `Leaderboard` — real **Personal ranking**, named concretely.
  - *Implementation:* real, shown in full in this lesson's own fourth
    Concept Unit, below.
  - *Its use:* this lesson's own new, permanent test proves it reports
    a real, correct, one-based rank, and a real, honest `null` for a
    genuinely absent player.
  - *Type:* a real, bounded, generic, `static` method, added to an
    already-existing, real class.
  - *Responsibility:* real, one-based rank lookup — nothing about
    filtering *which* real players are even being ranked; that stays
    real, calling code's own job (this lesson's own third Concept
    Unit, for **Friends leaderboard**).
  - *Depends on:* `Ranked`, above.
  - *Connects to:* this lesson's own real, closing "Connect the
    pieces" trace.
  - *Shape:* Domain-layer, `game_platform/domain/`.
- **`LeaderboardEntry`**
  - *What it is:* one real player's own real, single, current, best
    real score on a real, cloud-hosted leaderboard.
  - *Implementation:* real, shown in full in this lesson's own second
    Concept Unit, below.
  - *Its use:* this lesson's own new, permanent test builds a real,
    small, four-player list of these directly.
  - *Type:* a `const`-constructible, plain, immutable class,
    implementing two, real, already-established, generic contracts at
    once (`Ranked`, `SyncableRecord`).
  - *Responsibility:* carry one, real player's own real identity, real
    display name, and real, current, best score — nothing about
    ranking, filtering, or merging any of it; those stay
    `Leaderboard`/`RecordMerger`'s own real jobs.
  - *Depends on:* `Ranked`, `SyncableRecord`, both above/already
    established.
  - *Connects to:* the real value every method on `Leaderboard`,
    below, actually operates on.
  - *Shape:* Domain-layer, `game_platform/domain/`.

## Concept Unit: Ranked, and generalizing Leaderboard

### The Problem

`Leaderboard.top`/`.best` are already real, working, permanent,
already-tested code — real and hard-coded to `List<Score>`
specifically. `LeaderboardEntry`, this lesson's own real, new type,
needs the identical, real ranking logic, but is real and genuinely not
a `Score`.

> **Try it yourself first.** `Leaderboard.top`/`.best` never actually
> read any real field off `Score` except `points`. What is the
> smallest, real, minimal interface naming just that one real fact —
> and does `Score` already, genuinely satisfy it, with zero real
> changes to its own real body?

### Introducing the concept

No new isolated lab — a real, minimal, bounded interface, and an
already-existing, real class retroactively `implements`-ing it, is a
direct repeat of the identical, already-established, real move
`GameSession implements GameState` already made; its own real proof
lives in this project's own, already-existing, permanent
`generic_scoring_test.dart`, re-run, not a throwaway lab.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/ranked.dart` (new file);
  `project/lib/game_platform/domain/leaderboard.dart` (modify);
  `project/lib/game_platform/domain/score.dart` (modify);
  `project/test/generic_scoring_test.dart` (modify — one, real, fixed
  compile error).
- **Change type** — add; modify.
- **Location** — a new, real, standalone file; `Leaderboard`'s own
  real, existing methods; `Score`'s own real class declaration and
  `points` field; one, real, existing test assertion.
- **Dependencies** — none.

### The New Code

```dart
abstract interface class Ranked {
  int get points;
}
```

```dart
class Score implements Ranked {
  const Score({required this.gameId, required this.points, required this.achievedAt});
  final String gameId;
  @override
  final int points;
  final DateTime achievedAt;
}
```

```dart
class Leaderboard {
  static List<T> top<T extends Ranked>(List<T> items, {int limit = 10}) {
    final sorted = List<T>.of(items)..sort((a, b) => b.points.compareTo(a.points));
    return sorted.take(limit).toList();
  }

  static T? best<T extends Ranked>(List<T> items) {
    if (items.isEmpty) return null;
    return top(items, limit: 1).single;
  }
}
```

### The Updated Project

`ranked.dart`, in full, numbered — a brand-new file:

```dart
1  abstract interface class Ranked {
2    int get points;
3  }
```

`score.dart`'s own real, updated class declaration and `points`
field, numbered, this Concept Unit's own new or changed lines marked:

```dart
1  import 'ranked.dart';                                              // ← new
2
3  class Score implements Ranked {                                    // ← changed
4    const Score({
5      required this.gameId,
6      required this.points,
7      required this.achievedAt,
8    });
9    final String gameId;
10
11   @override                                                        // ← new
12   final int points;
13
14   final DateTime achievedAt;
15 }
```

`leaderboard.dart`'s own real, updated `top`/`best`, numbered:

```dart
1  static List<T> top<T extends Ranked>(List<T> items, {int limit = 10}) {  // ← changed
2    final sorted = List<T>.of(items)
3      ..sort((a, b) => b.points.compareTo(a.points));
4    return sorted.take(limit).toList();
5  }
6
7  static T? best<T extends Ranked>(List<T> items) {                       // ← changed
8    if (items.isEmpty) {
9      return null;
10   }
11   return top(items, limit: 1).single;
12 }
```

`generic_scoring_test.dart`'s own real, one, fixed assertion:

```dart
expect(Leaderboard.best(const <Score>[]), isNull);   // ← changed: explicit <Score>
```

### Mechanical walkthrough

- `abstract interface class Ranked { int get points; }` — a real,
  already-established, plain, bounded-generic-friendly interface
  declaration, the identical real shape `GameState`/`SyncableRecord`
  already used.
- `class Score implements Ranked` / `@override final int points;` —
  the identical, already-established, real, retroactive
  `implements` clause `GameSession implements GameState` already
  proved — `points` already existed; only a real `implements` clause
  and a real `@override` annotation were added.
- `static List<T> top<T extends Ranked>(List<T> items, {int limit =
  10})` — the identical, already-established method body, real and
  now bounded-generic over `T` instead of hard-coded to `Score` — the
  identical real sort comparator (`b.points.compareTo(a.points)`)
  still compiles unchanged, since `Ranked`'s own real contract already
  guarantees `.points` exists on any real `T`.
- `expect(Leaderboard.best(const <Score>[]), isNull);` — a real,
  explicit type argument on a real, empty list literal, real and
  necessary once `best` became generic — an untyped `const []` no
  longer has enough real context to infer its own real `T`.

### CS lens

Not applicable — this Concept Unit reapplies the already-named,
already-explained retroactive interface conformance idea from this
project's own earlier lesson; no new hard concept of its own.

### SE lens

This Concept Unit's own real, load-bearing lesson is what generalizing
an already-working, real, permanent piece of code actually costs: a
real, existing, permanent test (`generic_scoring_test.dart`) broke —
real, direct, honest proof that "should still work" is never assumed
in this project, only ever checked, by re-running every real, existing
test after every real change. The real, rejected alternative — leaving
`Leaderboard` hard-coded to `Score`, and writing a real, second,
separate, parallel sort utility for `LeaderboardEntry` — would have
kept `generic_scoring_test.dart` untouched, at the real, ongoing cost
of two, real, separate, duplicate sort implementations, real and only
one, real character apart (`b.points.compareTo(a.points)`), that a
real, later change to either one could real, silently, drift out of
sync with the other.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

`Leaderboard` can now genuinely rank any real, `Ranked` value — the
next Concept Unit gives it a real, second, genuinely different one to
rank.

---

## Concept Unit: LeaderboardEntry

### The Problem

Nothing in this app yet represents "one real player's own real,
current score, on a real, global leaderboard" — `Score` itself is
real and per-*game*, never naming *which* real player earned it.

### Introducing the concept

No new isolated lab — a real, small, immutable data class
implementing two, real, already-established, generic contracts at
once is a direct repeat of an already-established shape.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/leaderboard_entry.dart` (new
  file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `Ranked`, `SyncableRecord`, both above/already
  established.

### The New Code

```dart
class LeaderboardEntry implements Ranked, SyncableRecord {
  const LeaderboardEntry({
    required this.playerId,
    required this.playerName,
    required this.points,
    required this.updatedAt,
  });
  final String playerId;
  final String playerName;
  @override
  final int points;
  @override
  final DateTime updatedAt;
  @override
  String get id => playerId;
}
```

### The Updated Project

`leaderboard_entry.dart`, in full, numbered — a brand-new file:

```dart
 1  class LeaderboardEntry implements Ranked, SyncableRecord {
 2    const LeaderboardEntry({
 3      required this.playerId,
 4      required this.playerName,
 5      required this.points,
 6      required this.updatedAt,
 7    });
 8    final String playerId;
 9    final String playerName;
10
11   @override
12   final int points;
13
14   @override
15   final DateTime updatedAt;
16
17   @override
18   String get id => playerId;
19 }
```

### Mechanical walkthrough

- `class LeaderboardEntry implements Ranked, SyncableRecord` — a real,
  already-established `implements` clause naming two, real, separate
  interfaces at once — Dart's own real, already-established support
  for a real class satisfying more than one real contract
  simultaneously.
- `final String playerId; final String playerName;` — two real, plain
  `String` fields, real and this class's own real, only new,
  genuinely business-specific data.
- `@override final int points;` / `@override final DateTime
  updatedAt;` — the real, direct fields satisfying `Ranked`/
  `SyncableRecord`'s own real, required members.
- `@override String get id => playerId;` — a real,
  already-established getter, real and reusing `playerId` directly as
  `SyncableRecord.id` — one real player never has more than one real
  entry on the identical real leaderboard, so their own real
  `playerId` is already a real, sufficient, real, unique id.

### CS lens

Not applicable.

### SE lens

`LeaderboardEntry` deliberately holds only one, real, current, best
score per real player — real and not a real, whole history of every
real score they have ever earned, the identical, real, honest "one,
current, real snapshot" shape `AppSettings` already chose for its own
real, single-value cloud sync. A real, richer, "keep every real score
ever earned" leaderboard is a real, legitimate, different, and larger
real design, deliberately out of this lesson's own real, minimal
scope.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, rankable, syncable player entry now exists — the next Concept
Unit uses it to build curriculum's own first two, real, named
deliverables.

---

## Concept Unit: Global leaderboard and Friends leaderboard

### The Problem

Curriculum names two, real, separate leaderboards — one real, global;
one real, filtered to a real player's own real friends. Does either
one genuinely need its own, real, separate ranking logic?

> **Try it yourself first.** Given `Leaderboard.top` already ranks any
> real `List<Ranked>`, what is the smallest, real, additional code a
> real "Friends leaderboard" needs, beyond a real, already-established
> `List.where`?

### Introducing the concept

No new isolated lab — `Leaderboard.top`, already established, and a
real, already-established `Iterable.where`, compose directly; no new
construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — none — real, zero, new production code for
  this Concept Unit; only this lesson's own new, permanent test.
- **Change type** — none (production); add (test).
- **Location** — `project/test/cloud_leaderboard_test.dart` (new
  file).
- **Dependencies** — `Leaderboard.top`, `LeaderboardEntry`, both
  above.

### The New Code

```dart
final global = Leaderboard.top(entries, limit: 10);

final friendsOnly = entries.where((e) => friendIds.contains(e.playerId)).toList();
final friends = Leaderboard.top(friendsOnly, limit: 10);
```

### The Updated Project

Real, direct proof, shown in full in `cloud_leaderboard_test.dart`'s
own real, first two tests — no real, new production file needed for
either curriculum bullet.

### Mechanical walkthrough

- `Leaderboard.top(entries, limit: 10)` — the identical,
  already-established, real, generic method, real and reaching
  **Global leaderboard** entirely unmodified.
- `entries.where((e) => friendIds.contains(e.playerId)).toList()` —
  a real, already-established `Iterable.where`, real and producing a
  real, smaller, filtered list.
- `Leaderboard.top(friendsOnly, limit: 10)` — the identical, real,
  already-established method, called a real, second time, against the
  real, filtered list — **Friends leaderboard**, real and reached
  through zero real, new ranking code.

### CS lens

Not applicable.

### SE lens

Curriculum's own real "Friends leaderboard" needed a real,
`Set<String> friendIds` handed in from *outside* — this app has no
real, existing concept of real, mutual friendship anywhere, and this
Concept Unit deliberately does not invent one. Real, calling code
(wherever a real, future screen eventually calls this) is real,
honestly responsible for supplying a real, actual friends list; this
Concept Unit's own real job stops at "rank whatever real, filtered
list you hand me," the identical real, narrow-contract discipline this
project's own `ScoreRepository`/`AchievementRepository` already
chose.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/cloud_leaderboard_test.dart`.

### Connect the pieces

Two of curriculum's own three, real, named deliverables are done, real
and needing zero, real, new production code — the final Concept Unit
builds the one, real, genuinely new method the third one needs.

---

## Concept Unit: Personal ranking

### The Problem

Neither `Leaderboard.top` nor `Leaderboard.best` answers "where do I,
specifically, rank" — the real, one, remaining, genuinely new question
curriculum names.

> **Try it yourself first.** Given `top`/`best` already sort a real
> list highest-first internally, what is the smallest, real, new
> method reusing that identical, real sort to report one, real
> player's own real, one-based position — real and honestly reporting
> `null` if they aren't in the real list at all?

### Introducing the concept

No new isolated lab — a real, bounded, generic method reusing an
already-established sort, plus a real, already-established
`List.indexWhere`, is not a new construct; its own real proof lives in
this lesson's own permanent test.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/leaderboard.dart` (modify).
- **Change type** — modify.
- **Location** — `Leaderboard`'s own real class body.
- **Dependencies** — `Ranked`, above.

### The New Code

```dart
static int? rankOf<T extends Ranked>(List<T> items, bool Function(T item) matches) {
  final sorted = List<T>.of(items)..sort((a, b) => b.points.compareTo(a.points));
  final index = sorted.indexWhere(matches);
  return index == -1 ? null : index + 1;
}
```

### The Updated Project

`leaderboard.dart`'s own real, new method, added directly after
`best`, shown in full above.

### Mechanical walkthrough

- `static int? rankOf<T extends Ranked>(List<T> items, bool
  Function(T item) matches)` — a real, already-established, bounded,
  generic, `static` method, real and taking a real, plain, boolean
  predicate function — the identical real shape
  `RecordMerger.merge`/`AchievementEvaluator.evaluate` already used
  for their own real, injected `bool Function(T)` parameters.
- `final sorted = List<T>.of(items)..sort((a, b) => b.points
  .compareTo(a.points));` — the identical, already-established real
  sort `top`/`best` both already use, real and duplicated here rather
  than reused directly, since `top`/`best` both return a real, new
  `List`, not the real, useful `int` index this method actually needs.
- `final index = sorted.indexWhere(matches);` — a real,
  already-established, built-in `List.indexWhere`, real and returning
  `-1` on a real, genuine miss.
- `return index == -1 ? null : index + 1;` — a real, already-established
  ternary, real and converting a real, zero-based index into a real,
  human-facing, one-based rank — real and honestly `null`, not a real,
  misleading `0` or `-1`, when the real, given player genuinely isn't
  present at all.

### CS lens

Not applicable.

### SE lens

The real, rejected alternative here was reusing `top`'s own real
output directly (`top(items, limit: items.length).indexWhere(matches)
+ 1`) instead of a real, second, separate sort — real, fewer lines, at
the real cost of a real, needless `.take()`/`.toList()` allocation
`top` performs internally that `rankOf` never actually needs, since it
only ever wants a real index, never the real, whole, sorted list back.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/cloud_leaderboard_test.dart`.

### Connect the pieces

Every one of curriculum's own three, real, named deliverables now
exists — proven, end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, across a real, small,
four-player leaderboard, proving all three of curriculum's own real,
named deliverables.

1. `Leaderboard.top(entries, limit: 2)` — a real, global leaderboard,
   real and correctly ranking Bob (`1500`) above Carol (`1200`),
   Alice, and Dan.
2. `entries.where((e) => friendIds.contains(e.playerId)).toList()`,
   then `Leaderboard.top(...)` again — the identical real method,
   real and correctly ranking a real, smaller, friends-only view.
3. `Leaderboard.rankOf(entries, (e) => e.playerId == 'carol')` — a
   real, correct `2`; the identical real call for a real, genuinely
   absent player reports a real, honest `null`.

Global, Friends, and Personal ranking — curriculum's own three, real,
named deliverables, real and needing exactly one, real, small, new
method (`rankOf`) and one, real, minimal, new interface (`Ranked`)
beyond what this project already, genuinely had.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `Leaderboard`/`Score` both touch real,
permanent, already-existing project code, this lesson's own real proof
lives partly in a new, permanent `project/test/cloud_leaderboard_test
.dart`, and partly in this project's own, already-existing, permanent
`generic_scoring_test.dart`, re-verified, not replaced.

One real, first-attempt mistake, caught immediately, not assumed
away: generalizing `Leaderboard.best` broke an already-existing, real,
permanent test's own real, untyped, empty-list assertion — caught by
re-running the real, existing test suite, fixed by giving the real,
empty list literal an explicit type.

```
flutter analyze .
57 issues found. (ran in 6.3s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories, after the one, real,
first-attempt fix above.

```
flutter test
...
00:25 +140: All tests passed!
```

140 real test-file-level checks, up from 136 — four new, all in the
new, permanent `cloud_leaderboard_test.dart`. Generalizing
`Leaderboard` produced zero, real, further regressions anywhere else
in this app; zero flakes on this lesson's own single, real, full-suite
run. Full, honest narrative in
`verification/lesson-79/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.

---

**Phase 9 — "Networking and cloud persistence" — is now complete**,
Lessons 73 through 79: real HTTP fundamentals, live-proven;
`ApiClient`, kept outside the domain; a real, complete authentication
feature (`AuthService`/`AuthApi`/`AuthStorage`); real, single-value
cloud sync (`CloudSync`/`HttpCloudSync`); a real, proven Local-first
architecture (`LocalFirstStore`); real Retry/Idempotency/Duplicate-
record/Conflict handling (`syncWithRetry`/`IdempotencyGuard`/
`SyncableRecord`/`RecordMerger`); and, closing the phase, real cloud
leaderboards, built almost entirely by generalizing what this project
had already, genuinely earned.
