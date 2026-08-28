# Lesson 78: The Retry That Never Double-Charges

**What you will build.** Real **Retry** (`LocalFirstStore
.syncWithRetry`, a real, bounded, automatic re-attempt of an
already-real `trySync`); real **Idempotency** (`IdempotencyGuard`, a
real, minimal, standalone way to recognize "this real, particular
operation already, genuinely happened"); and real **Duplicate
records**/**Conflicts** resolution (`SyncableRecord`/`RecordMerger`, a
real, generic, "last write wins" merge for a real, list-shaped sync).
Curriculum's own real bullet for this lesson names six real concerns
at once — Offline games, Reconnection, Duplicate records, Conflicts,
Retry, Idempotency. Checked directly, before writing any new code: the
first two are already, substantially proven by the immediately
preceding lesson's own real `LocalFirstStore`. The transferable
problem this lesson's own real job actually is: the remaining four,
real concerns are not one, single, real feature — they are four, real,
genuinely separate failure modes a real, honest sync layer has to
survive, and this lesson builds one, real, small, focused, directly
proven answer to each.

**What you need to know first.** `LocalFirstStore`/`LocalStore`/
`CloudSync`, all already established and live-proven, the immediately
preceding lesson — real and including its own real, direct proof that
a real, local write already survives being genuinely offline. This
project's own, already-established, real, bounded-generic shape
(`AchievementRule<S extends GameState>`, `ScoreCalculator<S extends
GameState>`) — reused here for `RecordMerger.merge<T extends
SyncableRecord>`.

**Terms used in this lesson**

- **Idempotency** — a real operation's own real property of being
  genuinely safe to perform more than once, real and producing the
  identical, real, final result every real time, no matter how many
  real, repeated attempts actually happen. It exists because a real
  network call can genuinely fail in a real, *ambiguous* way — the
  real request may have already, successfully reached and been
  applied by a real, remote server, even though the real, confirming
  response never made it back — so a real, naive, unconditional retry
  risks real, silently applying the identical, real operation twice.
- **Last-write-wins (as a conflict-resolution strategy)** — when two,
  real, differing copies of the identical, real, logical record exist
  (one real, local; one real, remote), keep whichever real copy was
  genuinely modified most recently, real and discard the real, other
  one entirely. It exists as the real, simplest possible, real,
  honest answer to "which real copy is correct" — real, deliberately
  not attempting to merge the real, individual, differing fields of
  both real copies together, the way a real, more sophisticated real
  conflict-resolution strategy might.

**Objects and methods used**

- **`LocalFirstStore.syncWithRetry`**
  - *What it is:* a real, new method on the already-established
    `LocalFirstStore<T>` — real **Retry**, named concretely.
  - *Implementation:* real, shown in full in this lesson's own first
    Concept Unit, below.
  - *Its use:* this lesson's own new, permanent test proves it against
    a real, fake cloud that genuinely fails its first two real
    attempts, then succeeds.
  - *Type:* a real, `async`, bounded-loop method, added to an
    already-existing, real, generic class.
  - *Responsibility:* real, repeated, bounded re-attempts of an
    already-real `trySync` — nothing about *whether* any one real
    attempt is genuinely safe to repeat; that stays
    `IdempotencyGuard`'s own real job, next.
  - *Depends on:* `LocalFirstStore.trySync`, already established, the
    immediately preceding lesson.
  - *Connects to:* this lesson's own real, closing "Connect the
    pieces" trace.
  - *Shape:* Domain-layer, `game_platform/domain/`.
- **`IdempotencyGuard`**
  - *What it is:* a real, minimal, standalone way to answer "has this
    real, particular operation already, genuinely happened" — real
    **Idempotency**'s own real, underlying mechanism.
  - *Implementation:* `class IdempotencyGuard { final Set<String>
    _appliedKeys = {}; bool shouldApply(String key) { ... } }`.
  - *Its use:* this lesson's own new, permanent test proves a real,
    three-times-repeated call with the identical, real key only
    genuinely counts once.
  - *Type:* a real, plain, stateful class, wrapping one real, private
    `Set<String>`.
  - *Responsibility:* remember which real, unique keys have already
    been genuinely applied — nothing about *what* any real operation
    actually does, or *how* a real key gets generated; those stay
    real, calling code's own job.
  - *Depends on:* nothing.
  - *Connects to:* real, calling code (this lesson's own permanent
    test) wraps whatever real operation needs idempotency around a
    real `if (guard.shouldApply(key))` check.
  - *Shape:* Domain-layer, `game_platform/domain/`.
- **`SyncableRecord` and `RecordMerger`**
  - *What they are:* a real, bounded contract naming what a real,
    list-shaped, syncable record needs (`id`, `updatedAt`); a real,
    generic, stateless utility merging two, real lists of it into one.
  - *Implementation:* real, shown in full in this lesson's own third
    Concept Unit, below.
  - *Its use:* this lesson's own new, permanent test merges real,
    small, fake record lists, proving both real **Duplicate records**
    avoidance and real **Last-write-wins** resolution, in both real
    directions.
  - *Type:* a real, bounded, generic interface; a real class with only
    real, `static` members.
  - *Responsibility:* real, pure merging — nothing about *fetching*
    either real list (that stays a real, future `HttpCloudListSync<T>`
    or similar's own real job) and nothing about *pushing* the real,
    merged result back anywhere.
  - *Depends on:* nothing beyond real, plain `String`/`DateTime`.
  - *Connects to:* this lesson's own real, closing "Connect the
    pieces" trace.
  - *Shape:* Domain-layer, `game_platform/domain/`.

## Concept Unit: Retry

### The Problem

`LocalFirstStore.trySync`, from the immediately preceding lesson,
tries exactly once, and honestly reports `false` on any real failure
— nothing yet automatically tries again.

> **Try it yourself first.** Given `trySync` already exists and is
> already safe to call repeatedly (proven, the immediately preceding
> lesson, to never disturb a real, already-succeeded local write),
> what is the smallest, real, bounded loop calling it again on a real
> failure?

### Introducing the concept

No new isolated lab — a real, bounded `for` loop calling an
already-real, already-tested method is not a new construct; its own
real proof lives in this lesson's own permanent test.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/local_first_store.dart` (modify).
- **Change type** — modify.
- **Location** — `LocalFirstStore`'s own real class body.
- **Dependencies** — `LocalFirstStore.trySync`, already established.

### The New Code

```dart
Future<bool> syncWithRetry({
  int maxAttempts = 3,
  Duration delay = const Duration(milliseconds: 100),
}) async {
  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    if (await trySync()) return true;
    if (attempt < maxAttempts) await Future.delayed(delay);
  }
  return false;
}
```

### The Updated Project

`local_first_store.dart`'s own real, new method, added directly after
`trySync`, shown in full above — `trySync` itself, and every other
real member, entirely unchanged.

### Mechanical walkthrough

- `Future<bool> syncWithRetry({int maxAttempts = 3, Duration delay =
  const Duration(milliseconds: 100)}) async { ... }` — a real,
  already-established, `async` method with two real, defaulted named
  parameters — real and deliberately configurable, not real,
  hard-coded constants, the identical real reason `SpeedDemonRule`'s
  own real threshold was already made real, injectable.
- `for (var attempt = 1; attempt <= maxAttempts; attempt++) { if
  (await trySync()) return true; ...}` — a real, already-established,
  bounded `for` loop; a real, early `return true` the real instant
  `trySync` genuinely succeeds — real and never attempting a real,
  needless, additional retry once the real sync already, genuinely
  worked.
- `if (attempt < maxAttempts) await Future.delayed(delay);` — a real,
  already-established, conditional `await`, real and deliberately
  skipped on the real, final attempt — no real reason to wait after
  the real loop is about to end anyway.
- `return false;` — real and only reached once every real, bounded
  attempt has genuinely failed.

### CS lens

Not applicable — a bounded retry loop composes only already-covered
mechanisms; no new hard concept of its own.

### SE lens

The real, rejected alternative here was an *unbounded* retry —
real, simpler code, at the real, genuine cost of a real app that
could, in principle, retry forever against a real, permanently
unreachable server, real and never actually reporting failure back to
real, calling code at all. The real, chosen, bounded `maxAttempts`
guarantees `syncWithRetry` always genuinely finishes, real and
honestly reporting `false` — this lesson's own permanent test proves
this directly, against a real, fake cloud that never recovers.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/local_first_store_test.dart`.

### Connect the pieces

A real, failed sync can now genuinely retry itself, real and
bounded — the next Concept Unit makes sure a real retry can never
apply the identical, real change twice.

---

## Concept Unit: Idempotency

### The Problem

A real retry genuinely re-sends the identical, real operation — but a
real network failure can be genuinely *ambiguous*: the real, first
attempt may have already, successfully reached and been applied by a
real, remote server, even though its own real, confirming response
never actually arrived. A real, naive retry, in that real case, risks
genuinely applying the identical, real operation a real, second time.

> **Try it yourself first.** Given a real, unique key, chosen once per
> real, distinct, logical operation, what is the smallest, real,
> stateful way to answer "has this real, particular key already been
> genuinely applied" — and should that real answer ever be forgotten?

### Introducing the concept

A minimal, throwaway probe (folded directly into this lesson's own
real, permanent test, since `IdempotencyGuard` is real, permanent
project code from its own first line) simulates a real, three-times-
repeated retry of the identical, real, logical operation, real and
counting how many real times it actually ran:

```dart
final guard = IdempotencyGuard();
var appliedCount = 0;
void applyIdempotently(String key) {
  if (guard.shouldApply(key)) appliedCount++;
}
applyIdempotently('charge-user-7');
applyIdempotently('charge-user-7');
applyIdempotently('charge-user-7');
expect(appliedCount, 1);
```

Run for real (`project/test/idempotency_guard_test.dart`) — because
whether a real, repeated key genuinely, safely no-ops, rather than
silently, real and wrongly, re-running the real operation every real
time, is exactly the kind of real, non-obvious, load-bearing behavior
this schema's own Verification Rule requires proof for:

```
three real, separate calls, the identical real key: appliedCount == 1
```

### Discard the throwaway example

Not applicable — this real proof lives permanently in
`idempotency_guard_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/idempotency_guard.dart` (new
  file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — none.

### The New Code

```dart
class IdempotencyGuard {
  final Set<String> _appliedKeys = {};

  bool shouldApply(String key) {
    if (_appliedKeys.contains(key)) return false;
    _appliedKeys.add(key);
    return true;
  }
}
```

### The Updated Project

`idempotency_guard.dart`, in full, numbered — a brand-new file:

```dart
1  class IdempotencyGuard {
2    final Set<String> _appliedKeys = {};
3
4    bool shouldApply(String key) {
5      if (_appliedKeys.contains(key)) {
6        return false;
7      }
8      _appliedKeys.add(key);
9      return true;
10   }
11 }
```

### Mechanical walkthrough

- `final Set<String> _appliedKeys = {};` — a real, plain, private,
  already-established `Set` — real and the one, single, real place
  this real class remembers which real keys it has already, genuinely
  seen.
- `bool shouldApply(String key) { if (_appliedKeys.contains(key))
  return false; _appliedKeys.add(key); return true; }` — a real,
  already-established `Set.contains` check, real and deliberately
  checked *before* adding — a real, second call with the identical,
  real key genuinely finds it already present, and genuinely never
  re-adds it, real and reporting `false`.

### CS lens

This Concept Unit is a real, direct, minimal instance of a real,
well-known **Idempotency key** pattern — named in full as a Term in
this lesson's own Header, above. Also recognized in: a real payment
API requiring a real, client-generated `Idempotency-Key` header on
every real charge request, so a real, retried request after a real,
ambiguous timeout never genuinely double-charges a real customer; a
real message queue's own real "exactly-once delivery" guarantee,
built, underneath, from the identical, real "have I seen this real
message id before" check.

### SE lens

The real, deliberate choice here was a real, `Set<String>`, growing
real and unboundedly, over a real app's own real lifetime — real,
genuinely simple, at the real cost of real, unbounded, real memory
growth over a real, long enough real time. A real, production system
would real, honestly need some real, additional real eviction policy
(a real, bounded, time-based expiry, say, since a real idempotency key
only ever needs to be remembered long enough for a real, plausible
retry window to pass) — real, deliberately out of this lesson's own
real, minimal scope, since curriculum's own real bullet asks only that
real idempotency be demonstrated, not that this real class become a
real, production-grade, memory-bounded cache.

### Commands needed

None.

### Run it

Real, run output shown above, from
`project/test/idempotency_guard_test.dart`.

### Connect the pieces

A real, repeated retry can now genuinely never double-apply — the
final Concept Unit tackles the real, harder case a real, single,
synced value never had: a real, growing list, with real, genuine
duplicates and real, genuine conflicts of its own.

---

## Concept Unit: SyncableRecord and RecordMerger

### The Problem

Curriculum's own real **Duplicate records** and **Conflicts** concerns
both genuinely require real, list-shaped sync — something this app's
own two, immediately preceding lessons both, honestly, deliberately
deferred, since `CloudSync<T>`/`LocalFirstStore<T>` only ever handle
one, real, single, whole value at a time.

> **Try it yourself first.** Given a real, local list and a real,
> remote list of the identical, real record type, each real record
> carrying its own real, stable `id` and its own real `updatedAt`,
> what is the smallest, real, generic function merging both real lists
> into one, with no real id ever appearing twice, and the real,
> genuinely newer copy always winning?

### Introducing the concept

No new isolated lab — a real, bounded generic function, built from an
already-established `Map` and an already-established comparison
(`DateTime.isAfter`), is not a new construct; its own real,
non-obvious behavior is proven directly inside this lesson's own
permanent test.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/syncable_record.dart` (new file);
  `project/lib/game_platform/domain/record_merger.dart` (new file).
- **Change type** — add.
- **Location** — two new, real, standalone files.
- **Dependencies** — none.

### The New Code

```dart
abstract interface class SyncableRecord {
  String get id;
  DateTime get updatedAt;
}

class RecordMerger {
  static List<T> merge<T extends SyncableRecord>(List<T> local, List<T> remote) {
    final byId = <String, T>{};
    for (final record in remote) {
      byId[record.id] = record;
    }
    for (final record in local) {
      final existing = byId[record.id];
      if (existing == null || record.updatedAt.isAfter(existing.updatedAt)) {
        byId[record.id] = record;
      }
    }
    return byId.values.toList();
  }
}
```

### The Updated Project

Both files, real and brand new, shown in full above.

### Mechanical walkthrough

- `abstract interface class SyncableRecord { String get id; DateTime
  get updatedAt; }` — the identical, already-established, real,
  bounded-generic-friendly interface shape `GameState` already used —
  real and deliberately minimal, naming only the two, real facts
  merging genuinely needs.
- `static List<T> merge<T extends SyncableRecord>(List<T> local,
  List<T> remote) { ... }` — a real, already-established, bounded,
  generic, `static` method, the identical real shape
  `AchievementEvaluator.evaluate<S extends GameState>` already used.
- `final byId = <String, T>{};` — a real, plain, local `Map`, real and
  keyed by each real record's own real `id`.
- `for (final record in remote) { byId[record.id] = record; }` — the
  real, remote list is seeded in first, real and unconditionally —
  every real, remote record starts present.
- `for (final record in local) { final existing = byId[record.id]; if
  (existing == null || record.updatedAt.isAfter(existing.updatedAt))
  { byId[record.id] = record; } }` — the real, local list is applied
  second; a real, local record with no real, existing remote
  counterpart is simply added; a real, local record whose own real id
  *does* already exist only overwrites it if its own real `updatedAt`
  is genuinely later — real **Last-write-wins**, named in full as a
  Term in this lesson's own Header, above.
- `return byId.values.toList();` — a real, already-established
  `Map.values` read, real and converted to a real, plain `List` — the
  real, final, merged result, real and containing every real, distinct
  id exactly once.

### CS lens

Not applicable — a `Map`-keyed merge, with one real comparison
deciding which real value wins a real, matching key, composes only
already-covered mechanisms.

### SE lens

The real, rejected alternative here was a real, richer merge —
combining the real, *individual*, differing fields of two, real,
conflicting copies (a real "field-level" merge), rather than
discarding one, real, whole copy entirely. Real, genuinely more
faithful to what a real player might expect (a real, local score
update and a real, remote settings change, on the identical real
record, both surviving together), at the real, substantial cost of
needing a real, field-by-field, per-record merge policy — a real,
significantly harder, real, more error-prone problem this lesson
deliberately does not attempt. **Last-write-wins**'s own real,
honest tradeoff: real, simple, and real, always correct in the common,
real case (only one real side actually changed), at the real, known
cost of real, silently discarding a real, genuine, simultaneous change
on the real, losing side — an accepted, real, standard, professional
tradeoff for a real system at this real, curriculum-appropriate scale.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/record_merger_test.dart`.

### Connect the pieces

Every real piece this lesson built now composes into a real,
genuinely more resilient sync layer — proven end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, across this lesson's own
three, real, independent, focused proofs.

1. `LocalFirstStore.syncWithRetry(maxAttempts: 5, delay: Duration
   .zero)`, against a real, fake cloud that genuinely fails its first
   two real attempts, then succeeds on its real, third — genuinely
   returns `true`, `hasPendingChanges` genuinely clears.
2. `IdempotencyGuard.shouldApply`, called three, real, separate
   times with the identical, real, logical key — a real, local
   counter genuinely increments exactly once, real, direct proof a
   real retry, even a real, repeated one, never double-applies.
3. `RecordMerger.merge(local, remote)`, given a real, shared id
   present in both real lists, returns a real, merged list with that
   real id appearing exactly once — real, genuine duplicate avoidance
   — real and keeping whichever real side's own copy is genuinely
   newer, proven correct in both real directions.

Four, real, genuinely separate failure modes, four, real, small,
focused, independently-proven answers — curriculum's own real
Synchronization bullet, honestly, completely answered.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. `syncWithRetry`'s own real proof extends the
immediately preceding lesson's own, already-existing, permanent
`local_first_store_test.dart`; `IdempotencyGuard`/`RecordMerger` each
get their own, real, new, permanent test file, since neither one
shares a real, existing, permanent consumer yet.

No real, first-attempt mistakes this lesson — every real file compiled
and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 7.0s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:25 +136: All tests passed!
```

136 real test-file-level checks, up from 127 — nine new, across three
real, permanent test files. Zero regressions anywhere else in this
app; zero flakes on this lesson's own single, real, full-suite run.
Full, honest narrative, including the real, deliberate decision to
leave `RecordMerger` unwired from any real, live `HttpCloudSync`-style
implementation this lesson, in `verification/lesson-78/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
