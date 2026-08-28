# Lesson 76: One Value Pushed Up, One Value Pulled Down

**What you will build.** `CloudSync<T>`, a real, minimal, generic
contract — `push`/`pull` — for keeping one, real, single, local value
in sync with the cloud; `HttpCloudSync<T>`, its own real, first, live
implementation, built on the already-real `ApiClient`; and real
`toJson`/`fromJson` for this app's own, already-existing `AppSettings`
— this lesson's own real, concrete proof target. The transferable
problem: curriculum's own real bullet names five, real things to
"Synchronize" — User, Scores, Achievements, Settings, Game history —
but those five real things are not, honestly, one real shape. This
lesson's own real job is telling which of them actually are, building
the one, real, generic contract that genuinely fits, and being
explicit, not silent, about which real ones deliberately wait for a
real, later lesson.

**What you need to know first.** `ApiClient`/`ApiException`/
`MockClient`, all already established and live-proven. This app's own,
already-existing `AppSettings` (`features/sudoku/application/
settings_provider.dart`) — seven real, plain fields, already a real,
immutable, `copyWith`-based snapshot. `AuthApi.login`, from the
immediately preceding lesson — already, honestly, the real, existing
answer to "Synchronize: User," real and unmodified by this lesson.

**Terms used in this lesson**

No new Terms — this lesson's own real design reuses already-established
mechanisms throughout: real generics (both bounded and unbounded),
real dependency injection, real JSON encode/decode.

**Objects and methods used**

- **`CloudSync`**
  - *What it is:* a real, minimal, generic interface naming "push one
    real, whole value to the cloud, and pull it back."
  - *Implementation:* `abstract class CloudSync<T> { Future<void>
    push(T value); Future<T?> pull(); }`.
  - *Its use:* `HttpCloudSync<T>`, below, is this lesson's own real,
    first, live implementation, real and generic over `AppSettings`
    in this lesson's own real, concrete proof.
  - *Type:* a real, plain, generic interface — `T` real and entirely
    unbounded (no real `extends` clause at all).
  - *Responsibility:* name the real, minimal shape one, real, single,
    synced value needs — nothing about real, growing lists, real
    merging, or real conflict resolution; those stay curriculum's own
    real, later, "professional" lesson's job.
  - *Depends on:* nothing.
  - *Connects to:* implemented by `HttpCloudSync<T>`, below.
  - *Shape:* Domain-layer, `game_platform/domain/` — real, generic,
    genuinely unaware `AppSettings`, or any other real value type,
    exists.
- **`HttpCloudSync`**
  - *What it is:* `CloudSync<T>`'s own real, first, live
    implementation.
  - *Implementation:* real, shown in full in this lesson's own third
    Concept Unit, below.
  - *Its use:* this lesson's own new, permanent test constructs one
    generic over `AppSettings`, real and injected with a real
    `MockClient` through `ApiClient`.
  - *Type:* a real, concrete class implementing `CloudSync<T>`, real
    and itself still generic over `T`.
  - *Responsibility:* real delegation to the already-real,
    already-tested `ApiClient`, plus one, real, small, honest decision
    about what a real `404` means — nothing about *which* real value
    type `T` actually is; two, real, injected functions
    (`toJson`/`fromJson`) handle that.
  - *Depends on:* `ApiClient`, `ApiException`, both already
    established.
  - *Connects to:* this lesson's own real, closing "Connect the
    pieces" trace.
  - *Shape:* Infrastructure-layer, `game_platform/infrastructure/`.

## Concept Unit: CloudSync

### The Problem

Curriculum's own real bullet names five, real, different things to
synchronize — before writing any real code, which of those five,
real, actually share one, real, honest shape?

> **Try it yourself first.** `User` and `AppSettings` each ever have
> exactly one, real, current, whole value. `Scores`/`Achievements`/
> `Game history` each real, honestly grow, over real time, into a
> real, whole list. Does one, real, single, generic `push`/`pull`
> contract genuinely fit both real shapes — or only one of them?

### Introducing the concept

No new isolated lab — a real, minimal, generic interface with two,
real, `Future`-returning methods is an already-established shape;
this Concept Unit's own real, load-bearing decision is which real
things it should, and should not, be asked to cover, not a new real
mechanism.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/cloud_sync.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — none.

### The New Code

```dart
abstract class CloudSync<T> {
  Future<void> push(T value);
  Future<T?> pull();
}
```

### The Updated Project

`cloud_sync.dart`, in full, numbered — a brand-new file:

```dart
1  abstract class CloudSync<T> {
2    Future<void> push(T value);
3    Future<T?> pull();
4  }
```

### Mechanical walkthrough

- `abstract class CloudSync<T> { Future<void> push(T value); ... }` —
  a real, already-established, plain generic interface declaration;
  `T` real and entirely unbounded — unlike `AchievementRule<S extends
  GameState>`, nothing here needs `T` to satisfy any real, particular
  contract, since real converting is a real, injected concern
  (`HttpCloudSync`'s own real `toJson`/`fromJson`, below), not this
  real interface's own job.
- `Future<T?> pull();` — a real, already-established, nullable return
  type — `null` real and honestly meaning "nothing has ever been
  pushed here yet," the identical real convention `AuthStorage.read`/
  `GameSessionRepository.load` already established.

### CS lens

Not applicable.

### SE lens

The real, deliberate scope this Concept Unit draws is the whole
lesson's own real point: `CloudSync<T>` only ever handles one, real,
whole value at a time, real and never a real list. Syncing
`Scores`/`Achievements`/`Game history` for real would need real,
additional, genuinely harder concerns this real, minimal contract
does not attempt — merging a real, local list against a real, remote
one; recognizing a real, already-synced entry to avoid a real,
duplicate push; deciding what "conflict" even means when both a real,
local and a real, remote copy changed. Curriculum's own very next
lesson is explicitly named, in curriculum.md itself, "an important
professional lesson" for local-first architecture — real, strong,
textual evidence those real, harder concerns are deliberately that
lesson's own real job, not invented speculatively here.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, generic shape for syncing one, real, single value now exists
— the next Concept Unit gives it a real, concrete value to actually
sync.

---

## Concept Unit: AppSettings gains toJson and fromJson

### The Problem

`AppSettings` already exists, real and complete, but nothing yet
converts it to or from real JSON — the one, real, missing piece before
it can be a real `CloudSync<T>`'s own real `T`.

> **Try it yourself first.** `AppSettings` carries two real `enum`
> fields (`ThemeMode`, `Difficulty`). Should `toJson` store either
> one's own real, ordinal `.index`, or its own real, stable `.name` —
> and which real choice stays correct if a real, later lesson ever
> reorders either enum's own declared values?

### Introducing the concept

No new isolated lab — a real `toJson`/`fromJson` pair on an
already-existing, real, immutable class is a direct repeat of the
identical, already-established shape `User`/`AuthSession` already
used, the immediately preceding lesson.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/application/settings_provider.dart`
  (modify).
- **Change type** — modify.
- **Location** — `AppSettings`'s own real class body.
- **Dependencies** — none beyond `AppSettings`'s own, already-existing
  real fields.

### The New Code

```dart
Map<String, dynamic> toJson() => {
  'soundEnabled': soundEnabled,
  'hapticsEnabled': hapticsEnabled,
  'themeMode': themeMode.name,
  'showTimer': showTimer,
  'mistakeWarningsEnabled': mistakeWarningsEnabled,
  'animationsEnabled': animationsEnabled,
  'preferredDifficulty': preferredDifficulty.name,
};

factory AppSettings.fromJson(Map<String, dynamic> json) {
  return AppSettings(
    soundEnabled: json['soundEnabled'] as bool,
    hapticsEnabled: json['hapticsEnabled'] as bool,
    themeMode: ThemeMode.values.byName(json['themeMode'] as String),
    showTimer: json['showTimer'] as bool,
    mistakeWarningsEnabled: json['mistakeWarningsEnabled'] as bool,
    animationsEnabled: json['animationsEnabled'] as bool,
    preferredDifficulty: Difficulty.values.byName(json['preferredDifficulty'] as String),
  );
}
```

### The Updated Project

`settings_provider.dart`'s own real, new methods, added directly
inside `AppSettings`'s own, already-existing real class body, shown in
full above — every one of `AppSettings`'s own, already-existing real
members (constructor, fields, `copyWith`) entirely unchanged.

### Mechanical walkthrough

- `'themeMode': themeMode.name` / `'preferredDifficulty':
  preferredDifficulty.name` — Dart's own real, already-established,
  built-in `Enum.name` getter, real and reporting each real value's
  own real, stable, declared identifier (`'dark'`, `'hard'`) — real
  and deliberately not `.index` (a real, plain integer, silently
  reassigned the instant a real, future edit reorders either enum's
  own declared values).
- `ThemeMode.values.byName(json['themeMode'] as String)` /
  `Difficulty.values.byName(...)` — Dart's own real, already-established,
  built-in `List<T>.byName` extension method (available on any real
  `.values` list of a real `enum`), real and the direct, real inverse
  of `.name`.

### CS lens

Not applicable.

### SE lens

The real, rejected alternative — storing `.index` instead of `.name`
— is real, one, small, syntactic difference, at a real, genuine,
future cost: a real, later lesson reordering `Difficulty`'s own
declared values (adding a real, new difficulty *between* two
already-existing ones, say) would silently, real and invisibly, change
what an already-synced, real, remote `2` actually means, for every
real player whose own real settings were already pushed. `.name`
genuinely cannot suffer that real failure mode — only a real, direct
rename of the enum value itself would, a real, far rarer, and far more
visible, real change.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Unit, in
the closing, full-lesson test run, below.

### Connect the pieces

`AppSettings` can now genuinely convert to and from real JSON — the
final Concept Unit builds the real, live implementation that actually
pushes and pulls it.

---

## Concept Unit: HttpCloudSync

### The Problem

`CloudSync<T>` exists, but nothing yet actually sends a real Request
— and, per REST convention, a real, not-yet-synced value should
honestly report back as "nothing yet," not as a real error.

> **Try it yourself first.** Given `ApiClient.get` already throws a
> real `ApiException` on any real, non-2xx status, what is the
> smallest, real, honest way `pull` can turn a real `404`,
> specifically, into a real `null`, while still letting every real,
> other real failure propagate unchanged?

### Introducing the concept

No new isolated lab — real delegation to the already-real,
already-tested `ApiClient`, plus a real, `on ApiException catch`
clause checking one real field, is not a new construct; its own real
proof lives in this lesson's own permanent test, run directly against
real project code.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/infrastructure/http_cloud_sync.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `CloudSync`, above; `ApiClient`, `ApiException`,
  already established.

### The New Code

```dart
class HttpCloudSync<T> implements CloudSync<T> {
  HttpCloudSync({
    required this._client,
    required this._path,
    required this._toJson,
    required this._fromJson,
  });

  final ApiClient _client;
  final String _path;
  final Map<String, dynamic> Function(T value) _toJson;
  final T Function(Map<String, dynamic> json) _fromJson;

  @override
  Future<void> push(T value) => _client.post(_path, _toJson(value));

  @override
  Future<T?> pull() async {
    try {
      final body = await _client.get(_path);
      return _fromJson(body);
    } on ApiException catch (error) {
      if (error.statusCode == 404) return null;
      rethrow;
    }
  }
}
```

### The Updated Project

The file, real and brand new, shown in full above.

### Mechanical walkthrough

- `HttpCloudSync({required this._client, required this._path,
  required this._toJson, required this._fromJson});` — the identical,
  already-established, real `this.field` initializing-formal shorthand
  this project's own established style already uses for every real,
  required constructor dependency — real and applied here to four real
  parameters at once, two of them real, plain values, two of them real
  functions.
- `Future<void> push(T value) => _client.post(_path, _toJson(value));`
  — a real, one-line method, real and calling `_toJson` to turn the
  real, generic `value` into the real, plain `Map<String, dynamic>`
  `ApiClient.post` already, real and established, expects.
- `Future<T?> pull() async { try { ... } on ApiException catch
  (error) { if (error.statusCode == 404) return null; rethrow; } }` —
  a real, already-established `try`/`on`/`catch` clause, real and
  narrowly typed to `ApiException` specifically (not a real, bare
  `catch`, which would also, real and wrongly, swallow a genuinely
  different real error type); `error.statusCode == 404` reads the
  real, already-established field `ApiException` carries; `rethrow`,
  real and already-established, lets every real, other real failure
  continue propagating unchanged.

### CS lens

Not applicable — this Concept Unit composes already-covered
mechanisms; no new hard concept of its own.

### SE lens

The real, rejected alternative here was letting `pull`'s own real
`ApiException` propagate for a real `404` too, real and pushing the
"is this a real, honest not-yet-synced case, or a real, genuine
failure" decision onto every real, individual caller instead. The
real, chosen approach makes that real, one, correct decision exactly
once, real and in the one, real, single place that actually knows
`404` means "not found" here — every real caller of `pull` gets a
real, plain, honest `T?` back, real and never needing its own,
separate, real `try`/`catch` just to tell "never synced" apart from
"the real server is down."

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/cloud_sync_test.dart`.

### Connect the pieces

Every real piece this lesson built now composes into one, real,
complete, live-ready sync feature for one, real, single value —
proven, end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, proving `AppSettings`
genuinely pushes, pulls, and honestly reports "never synced," through
the identical, real, generic seam.

1. `HttpCloudSync<AppSettings>(client: ApiClient(...), path:
   'settings', toJson: (s) => s.toJson(), fromJson: AppSettings
   .fromJson)` — a real, generic sync, wired to one, real, concrete
   value type, with zero real changes needed to `CloudSync<T>` itself.
2. `push(settings)` sends a real POST, the real, whole,
   `toJson`-encoded value, to the real, configured `'settings'` path —
   real and confirmed, directly, by inspecting the real, captured
   request body.
3. `pull()`, against a real, live value the cloud already has, returns
   a real, correctly `fromJson`-decoded `AppSettings` — every real
   field, including both real enums, genuinely intact.
4. `pull()`, against a real, deliberately empty cloud (a real `404`),
   returns a real, honest `null` — not a real, thrown error; `pull()`,
   against a real, genuine `500` failure, still genuinely throws the
   real `ApiException`, real, direct proof the two real cases stay
   genuinely distinct.

One, real value, pushed up, and pulled back down — curriculum's own
real "Synchronize" bullet, honestly, partially answered: real and
complete for `Settings`, real and already covered, from the
immediately preceding lesson, for `User`, and real and explicitly,
honestly deferred, not silently skipped, for the three, real,
list-shaped concerns still ahead.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `HttpCloudSync`/`AppSettings`'s own real
JSON methods both touch real, permanent project code, this lesson's
own real proof lives in a new, permanent
`project/test/cloud_sync_test.dart`, not a throwaway lab.

One real, first-attempt mistake, caught immediately: `HttpCloudSync`'s
own first, real constructor used a colon-initializer list instead of
`this.field` shorthand, triggering the identical, already-existing
`prefer_initializing_formals` info this project's own `SudokuEngine`/
`MinesweeperBoard` constructors already carry; fixed identically.

```
flutter analyze .
57 issues found. (ran in 6.4s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories, after the one, real,
first-attempt fix above.

```
flutter test
...
00:26 +122: All tests passed!
```

122 real test-file-level checks, up from 117 — five new, all in the
new, permanent `cloud_sync_test.dart`. Zero regressions anywhere else
in this app; zero flakes on this lesson's own single, real,
full-suite run. Full, honest narrative in
`verification/lesson-76/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
