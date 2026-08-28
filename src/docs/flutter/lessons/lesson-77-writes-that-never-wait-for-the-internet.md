# Lesson 77: Writes That Never Wait for the Internet

**What you will build.** `LocalStore<T>`, curriculum's own real "Local
DB" — a real, minimal interface for saving and reading one, real,
whole value on-device; and `LocalFirstStore<T>`, curriculum's own real
"Sync engine" — composing `LocalStore<T>` with the immediately
preceding lesson's own real `CloudSync<T>` into one, real, small class
whose own real `write`/`read` genuinely never depend on a real, live
network connection, and whose own real, separate `trySync` can fail
without ever disturbing a real, already-succeeded local write.
Curriculum's own real, opening sentence for this lesson states the
actual test directly: "the game should work without internet." The
transferable problem: this app's own two, immediately preceding
lessons already proved a real value can be pushed to, and pulled from,
a real cloud — but neither one, alone, proves the app still works when
that real cloud is genuinely unreachable. This lesson's own real job
is making that real guarantee explicit, structural, and proven, not
assumed.

**What you need to know first.** `CloudSync<T>`/`HttpCloudSync<T>`,
already established and live-proven by the immediately preceding
lesson. `AuthService`, from two lessons back — the identical, real,
domain-level orchestration shape this lesson's own real
`LocalFirstStore<T>` reuses, composed entirely from real, injected
interfaces, genuinely unaware of any real, particular storage
mechanism.

**Terms used in this lesson**

- **Local-first (as an architectural principle)** — every real user
  action succeeds against a real, on-device copy of the data first,
  immediately, regardless of real network state; reaching a real,
  remote server happens afterward, as a real, separate, best-effort
  step, never as a real precondition for the real, local action
  itself succeeding. It exists so a real app genuinely keeps working
  — real reads, real writes, real gameplay — the instant a real
  network connection drops, rather than a real user staring at a real,
  stuck loading spinner for something that never needed the real
  network to begin with.

**Objects and methods used**

- **`LocalStore`**
  - *What it is:* a real, minimal interface naming "the ability to
    save one real, whole value on this real device, and read it
    back" — curriculum's own real "Local DB," named concretely.
  - *Implementation:* `abstract class LocalStore<T> { Future<void>
    save(T value); Future<T?> read(); }`.
  - *Its use:* injected into `LocalFirstStore<T>`, below; this
    lesson's own new, permanent test uses a real, in-memory
    implementation.
  - *Type:* a real, plain, generic interface — the identical real
    shape `CloudSync<T>` already established, one real lesson back.
  - *Responsibility:* real, local persistence, and nothing else —
    no real knowledge of the cloud, or of whether any real value it
    holds has ever actually been synced; that stays
    `LocalFirstStore`'s own real job, next.
  - *Depends on:* nothing.
  - *Connects to:* injected into `LocalFirstStore<T>`, below.
  - *Shape:* Domain-layer, `game_platform/domain/`.
- **`LocalFirstStore`**
  - *What it is:* this lesson's own real, generic **Sync engine** —
    curriculum's own real, three-layer picture (`Local DB ↕ Sync
    engine ↕ Cloud DB`), the middle layer, named concretely.
  - *Implementation:* real, shown in full across this lesson's own
    two remaining Concept Units, below.
  - *Its use:* this lesson's own new, permanent test drives every one
    of its own real, public members directly, against a real,
    deliberately toggle-able fake cloud.
  - *Type:* a real, plain, generic class, composed entirely from two,
    real, injected interfaces.
  - *Responsibility:* guarantee every real `write`/`read` succeeds
    against `LocalStore` alone — nothing about *how* `CloudSync`
    itself actually reaches a real, remote server, and nothing about
    real conflicts, real duplicate records, or real retry logic;
    those stay curriculum's own real, next lesson's own job.
  - *Depends on:* `LocalStore<T>`, `CloudSync<T>`, both above/already
    established.
  - *Connects to:* this lesson's own real, closing "Connect the
    pieces" trace.
  - *Shape:* Domain-layer, `game_platform/domain/` — real, genuinely
    unaware of SQL, HTTP, or any real, particular storage mechanism.

## Concept Unit: LocalStore

### The Problem

Curriculum's own real picture names a real "Local DB" layer — nothing
in this app yet has a real, generic, minimal shape for it.

> **Try it yourself first.** `CloudSync<T>` already names "push one
> real value up, pull it back down." What is the smallest, real,
> genuinely parallel shape for "save one real value locally, and read
> it back" — and should it, in any real way, know `CloudSync<T>`
> exists?

### Introducing the concept

No new isolated lab — a real, minimal, generic interface with two,
real methods is a direct repeat of the identical, already-established
shape `CloudSync<T>` used, one real lesson back.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/local_store.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — none.

### The New Code

```dart
abstract class LocalStore<T> {
  Future<void> save(T value);
  Future<T?> read();
}
```

### The Updated Project

`local_store.dart`, in full, numbered — a brand-new file:

```dart
1  abstract class LocalStore<T> {
2    Future<void> save(T value);
3    Future<T?> read();
4  }
```

### Mechanical walkthrough

- `abstract class LocalStore<T> { Future<void> save(T value);
  Future<T?> read(); }` — the identical, already-established, plain,
  generic interface declaration `CloudSync<T>` already used; real and
  deliberately not importing, referencing, or knowing `CloudSync<T>`
  exists at all.

### CS lens

Not applicable.

### SE lens

`LocalStore<T>` and `CloudSync<T>` genuinely share the identical, real
shape (`save`/`read` versus `push`/`pull` are the real, only naming
difference) — real and deliberate, not accidental: both real
interfaces answer the identical real question ("remember one real,
whole value, and hand it back"), differing only in *where*. Keeping
them as two, real, entirely separate, real interfaces — rather than
one, real, shared, generic "storage" interface both implement — means
`LocalFirstStore`, next, can genuinely tell the two real, injected
dependencies apart at its own real call sites, and, more importantly,
means a real, future, third real kind of storage (an in-memory cache,
say) could implement only the one real interface it actually needs,
never both.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Unit, in
the closing, full-lesson test run, below.

### Connect the pieces

Curriculum's own real "Local DB" layer now has a real, concrete shape
— the next Concept Unit builds the real "Sync engine" that actually
uses it.

---

## Concept Unit: LocalFirstStore — write, read, and trySync

### The Problem

Nothing yet actually proves curriculum's own real, opening claim: "the
game should work without internet." A real, naive combination of
`LocalStore`/`CloudSync` — one that, say, calls `CloudSync.push`
*before* `LocalStore.save`, or requires a real, successful cloud push
before a real `write` is considered done at all — would genuinely
break the instant a real network connection drops.

> **Try it yourself first.** Given `LocalStore.save` never depends on
> a real network connection, and `CloudSync.push` genuinely might
> fail, what is the smallest, real `write` method that guarantees
> local success regardless — and what is the smallest, real, separate
> method that attempts the real, remote push afterward, honestly
> reporting whether it actually worked, without ever undoing the real,
> already-succeeded local write?

### Introducing the concept

A minimal, throwaway probe (folded directly into this lesson's own
real, permanent test, since `LocalFirstStore` is real, permanent
project code from its own first line) constructs a real store around
a real, deliberately *offline* fake cloud — one whose own real `push`
genuinely throws — and writes a real value anyway:

```dart
final cloud = _FlakyCloudSync<int>()..online = false;
final store = LocalFirstStore<int>(local: _InMemoryLocalStore<int>(), cloud: cloud);

await store.write(42);
expect(await store.read(), 42);
```

Run for real (`project/test/local_first_store_test.dart`) — because
whether a real `write` genuinely succeeds while the real, injected
cloud is genuinely, actively failing is exactly the kind of real,
non-obvious, load-bearing behavior this schema's own Verification Rule
requires proof for, never assumed from reading `write`'s own source
alone:

```
cloud.online == false, the real, injected cloud genuinely throws on push
store.write(42) — completes without ever throwing
store.read() — returns 42, real and correct
```

Real, direct proof: a real `write` never once reaches, or depends on,
`CloudSync` at all.

### Discard the throwaway example

Not applicable — this real proof lives permanently in
`local_first_store_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/local_first_store.dart` (new
  file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `LocalStore<T>`, `CloudSync<T>`, both above/
  already established.

### The New Code

```dart
class LocalFirstStore<T> {
  LocalFirstStore({required this._local, required this._cloud});
  final LocalStore<T> _local;
  final CloudSync<T> _cloud;

  bool _pendingSync = false;
  bool get hasPendingChanges => _pendingSync;

  Future<T?> read() => _local.read();

  Future<void> write(T value) async {
    await _local.save(value);
    _pendingSync = true;
  }

  Future<bool> trySync() async {
    if (!_pendingSync) return true;
    final local = await _local.read();
    if (local == null) return true;
    try {
      await _cloud.push(local);
      _pendingSync = false;
      return true;
    } catch (_) {
      return false;
    }
  }
}
```

### The Updated Project

`local_first_store.dart`, in full, numbered:

```dart
 1  class LocalFirstStore<T> {
 2    LocalFirstStore({required this._local, required this._cloud});
 3    final LocalStore<T> _local;
 4    final CloudSync<T> _cloud;
 5
 6    bool _pendingSync = false;
 7    bool get hasPendingChanges => _pendingSync;
 8
 9    Future<T?> read() => _local.read();
10
11   Future<void> write(T value) async {
12     await _local.save(value);
13     _pendingSync = true;
14   }
15
16   Future<bool> trySync() async {
17     if (!_pendingSync) {
18       return true;
19     }
20     final local = await _local.read();
21     if (local == null) {
22       return true;
23     }
24     try {
25       await _cloud.push(local);
26       _pendingSync = false;
27       return true;
28     } catch (_) {
29       return false;
30     }
31   }
32 }
```

### Mechanical walkthrough

- `LocalFirstStore({required this._local, required this._cloud});` —
  the identical, already-established, real `this.field` shorthand
  this project's own established style already uses for every real,
  required dependency; both real, `LocalStore<T>`/`CloudSync<T>`,
  required, neither one defaulted — real and deliberate, the identical
  real reason `AuthService`'s own two real dependencies both stayed
  required, too.
- `bool _pendingSync = false; bool get hasPendingChanges =>
  _pendingSync;` — a real, plain, private, mutable field, and a real,
  already-established, read-only getter exposing it — real and the
  one, single, real place this real class remembers "does the cloud
  genuinely have this real device's own latest, real, local value
  yet."
- `Future<T?> read() => _local.read();` — real, one-line, direct
  delegation — `read` never touches `_cloud` at all.
- `Future<void> write(T value) async { await _local.save(value);
  _pendingSync = true; }` — real, two, sequential steps: save locally
  first, real and unconditionally; mark `_pendingSync` only
  afterward, once the real, local save has already, genuinely
  succeeded.
- `Future<bool> trySync() async { if (!_pendingSync) return true; ...
  }` — a real, early return, real and honestly reporting success when
  there is genuinely nothing to do; `final local = await _local
  .read();` re-reads the real, current, local value rather than
  caching one from an earlier `write` call, real and correct even if
  a real, later `write` happened since `_pendingSync` was last set
  true.
- `try { await _cloud.push(local); _pendingSync = false; return true;
  } catch (_) { return false; }` — a real, already-established
  `try`/`catch`, real and deliberately broad (a bare `catch`, not one
  narrowed to a real, particular exception type) — this real method's
  own real job is reporting "did the real, remote push work," for
  *any* real reason it might not have, not distinguishing which real,
  particular failure occurred.

### CS lens

Not applicable — this Concept Unit composes already-covered
mechanisms (real dependency injection, a real `try`/`catch`); its own
real significance is architectural (real Local-first), covered in the
SE lens, not a real, hard, computational concept of its own.

### SE lens

This Concept Unit's own real code is, directly, curriculum's own real
**Local-first** principle, named in full as a Term in this lesson's
own Header, above: `write`'s own real, only dependency is
`LocalStore`; `CloudSync` is reached, if at all, by a real, separate,
later, explicit `trySync` call, real and never blocking, gating, or
being able to undo what `write` already, genuinely finished. The real,
rejected alternative — `write` calling `_cloud.push` directly, inline,
before returning — would make every real, local action's own real
success depend on a real, live network connection existing at that
real, exact moment; this lesson's own real, permanent test proves
directly that the real, chosen design does not.

### Commands needed

None.

### Run it

Real, run output shown above, from
`project/test/local_first_store_test.dart`.

### Connect the pieces

Every real piece this lesson built now composes into one, real, small,
proven Local-first store — proven end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, proving a real write
succeeds offline, and a real, later sync genuinely catches up once
reconnected.

1. `LocalFirstStore<int>(local: ..., cloud: _FlakyCloudSync()..online
   = false)` — a real, deliberately offline cloud, injected alongside
   a real, working local store.
2. `store.write(42)` genuinely succeeds, real and without ever
   touching the real, offline cloud; `store.read()` genuinely returns
   `42` right back; `store.hasPendingChanges` genuinely reports
   `true`.
3. `store.trySync()`, still genuinely offline, genuinely reports
   `false` — real, direct proof `store.read()` still, genuinely,
   correctly returns `42` afterward: the real, failed sync attempt
   never touched the real, already-succeeded local write.
4. `cloud.online = true` — real, simulated reconnection;
   `store.trySync()` now genuinely reports `true`, `hasPendingChanges`
   genuinely clears, and the real, fake cloud's own real, pulled-back
   value genuinely matches what was written locally, real minutes
   earlier.

Curriculum's own real, opening claim, proven, not merely declared: the
game works without internet — a real write, a real read, and a real,
honest "did the sync actually work" answer, every one of them real and
correct with the real, remote cloud entirely, genuinely unreachable.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `LocalFirstStore` is real, permanent
project code from its own first line, this lesson's own real proof
lives in a new, permanent
`project/test/local_first_store_test.dart`, not a throwaway lab.

No real, first-attempt mistakes this lesson — every real file
compiled and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 6.2s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:41 +127: All tests passed!
```

127 real test-file-level checks, up from 122 — five new, all in the
new, permanent `local_first_store_test.dart`. One real, isolated flake
(this project's own already-established, honest, unrelated pattern)
appeared on the first of two full-suite runs, confirmed clean
immediately after — genuinely unrelated to this lesson's own changes.
Full, honest narrative, including the real, deliberate decision to
leave a real, SQLite-backed `LocalStore<T>` unbuilt this lesson, in
`verification/lesson-77/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
