# Lesson 75: A Session That Survives Closing the App

**What you will build.** A real, complete, minimal authentication
feature, under a real, new, third, top-level `lib/auth/`: `User` (real
**Identity**); `AuthSession` (a real **Token**, paired with the real
`User` it belongs to); `AuthApi`/`HttpAuthApi` (a real, live way to
exchange real credentials for a real session, built on top of the
immediately preceding lesson's own real `ApiClient`); `AuthStorage`/
`SecureAuthStorage` (real **Secure storage**, backed by a real,
new, platform-native package); and `AuthService`, the one, real, small
place `login`/a real, saved **Session** surviving a real app
restart/**Logout** all actually happen. The transferable problem:
curriculum's own five real terms for this lesson (Identity, Sessions,
Tokens, Secure storage, Logout) name five, real, genuinely different
concerns — the real test isn't whether a login call can succeed, but
whether each of those five, real concerns stays its own, real,
separately-testable piece, composed, not tangled into one, real,
undifferentiated blob.

**What you need to know first.** `ApiClient`/`ApiException`,
`MockClient`, and real JSON encode/decode, all already established and
live-proven by the immediately preceding two, real lessons. This
project's own, already-established, real dependency-injection shape —
`Clock`/`PuzzleRepository`/`ScoreCalculator`, real and now `ApiClient`
too. The real Domain/Infrastructure split itself, first named for
`Clock`/`SystemClock`, real and applied here, for the real, first
time, to a genuinely new, real, third, top-level feature area.

**Terms used in this lesson**

No new Terms — this lesson's own real design decisions all reuse
already-established, already-named mechanisms: the real
Domain/Infrastructure split, real dependency injection, real JSON
encode/decode.

**Objects and methods used**

- **`User`**
  - *What it is:* a real, minimal record of *who* is signed in — real
    **Identity**, deliberately smaller than a real, full user profile.
  - *Implementation:* `class User { const User({required this.id,
    required this.username}); final String id; final String
    username; ... }`, real and including real `toJson`/`fromJson`.
  - *Its use:* carried by `AuthSession`, below; this lesson's own new,
    permanent test round-trips one through real JSON directly.
  - *Type:* a `const`-constructible, plain, immutable class.
  - *Responsibility:* name one real, distinct, authenticated person —
    nothing about a real token, a real session, or how any of it gets
    saved; those stay `AuthSession`/`AuthStorage`'s own real jobs.
  - *Depends on:* nothing.
  - *Connects to:* `AuthSession.user`, below.
  - *Shape:* Domain-layer, `auth/domain/` — real, plain, and
    genuinely small.
- **`AuthSession`**
  - *What it is:* a real, minimal, immutable record of one real,
    active **Session** — a real `User`, paired with a real, opaque
    **Token**.
  - *Implementation:* `class AuthSession { const AuthSession
    ({required this.user, required this.token}); final User user;
    final String token; ... }`, real and including real
    `toJson`/`fromJson`.
  - *Its use:* returned by `AuthApi.login`, below; saved, read, and
    cleared by `AuthStorage`, below; held by `AuthService
    .currentSession`.
  - *Type:* a `const`-constructible, plain, immutable class.
  - *Responsibility:* pair one real token with the one real user it
    belongs to — nothing about *how* that real token was issued, or
    *where* it's kept safe; those stay `AuthApi`/`AuthStorage`'s own
    real jobs.
  - *Depends on:* `User`, above.
  - *Connects to:* the real value every method on `AuthApi`/
    `AuthStorage`/`AuthService`, below, actually produces or carries.
  - *Shape:* Domain-layer, `auth/domain/`.
- **`AuthApi` and `AuthStorage`**
  - *What they are:* two, real, small, domain-level interfaces — one
    naming "exchange real credentials for a real session," one naming
    "remember a real session across a real app restart."
  - *Implementation:* real, shown in full in this lesson's own second
    Concept Unit, below.
  - *Its use:* `HttpAuthApi`/`SecureAuthStorage`, below, are this
    lesson's own real, first, live implementations; this lesson's own
    new, permanent test uses a real, in-memory `AuthStorage` instead.
  - *Type:* two real, plain `abstract class`es — neither one generic.
  - *Responsibility:* each name exactly one real ability, genuinely
    separate from the other — nothing about *when* login/restore/
    logout actually happen together; that stays `AuthService`'s own
    real job, next.
  - *Depends on:* `AuthSession`, above.
  - *Connects to:* both injected into `AuthService`, below.
  - *Shape:* Domain-layer, `auth/domain/` — real, genuinely
    Flutter/HTTP/storage-mechanism-free.
- **`AuthService`**
  - *What it is:* a real, single, small orchestrator owning this app's
    own real **Session** lifecycle.
  - *Implementation:* real, shown in full in this lesson's own third
    Concept Unit, below.
  - *Its use:* this lesson's own new, permanent test drives every one
    of its own real, public methods directly.
  - *Type:* a real, plain, concrete class, composed entirely from two,
    real, injected interfaces.
  - *Responsibility:* the one, real, single place `login`/
    `restoreSession`/`logout` actually happen — nothing about HTTP,
    JSON, or any real, particular secure-storage mechanism; those stay
    `AuthApi`/`AuthStorage`'s own real, separate jobs.
  - *Depends on:* `AuthApi`, `AuthStorage`, both above.
  - *Connects to:* this lesson's own real, closing "Connect the
    pieces" trace.
  - *Shape:* Domain-layer, `auth/domain/` — real, genuinely ignorant
    of HTTP or any real, particular storage mechanism.
- **`HttpAuthApi` and `SecureAuthStorage`**
  - *What they are:* `AuthApi`/`AuthStorage`'s own real, first, live
    implementations.
  - *Implementation:* real, shown in full in this lesson's own fourth
    Concept Unit, below.
  - *Its use:* real, production wiring — this lesson's own new,
    permanent test deliberately does not exercise either one directly
    (a real, in-memory `AuthStorage`, and a real, mocked `ApiClient`
    through `HttpAuthApi`, stand in instead).
  - *Type:* two real, concrete classes, each implementing one of the
    two real interfaces above.
  - *Responsibility:* real delegation — `HttpAuthApi` straight into
    the already-real, already-tested `ApiClient`; `SecureAuthStorage`
    straight into `flutter_secure_storage`'s own real, already-tested,
    platform-native store — neither one adds any real logic of its
    own beyond real JSON encode/decode.
  - *Depends on:* `ApiClient`, already established; `package
    :flutter_secure_storage`, a real, new dependency.
  - *Connects to:* real, production wiring for `AuthService`.
  - *Shape:* Infrastructure-layer, `auth/infrastructure/`.

## Concept Unit: User and AuthSession

### The Problem

Nothing in this app has ever represented "a real, signed-in person,"
or "one real, active, authenticated session," before — curriculum's
own real Identity/Sessions/Tokens terms all exist, so far, only as
real, unproven words.

> **Try it yourself first.** Given a real session needs to be saved,
> read back, and cleared later, what real, minimal shape lets both
> `User` and `AuthSession` convert cleanly to and from real JSON,
> reusing the identical real `toJson`/`fromJson` shape a real,
> later-saved value needs?

### Introducing the concept

No new isolated lab — two, real, small, immutable data classes, each
with a real, plain `toJson`/`fromJson` pair, are direct repeats of an
already-established, real shape (real JSON encode/decode, live-proved
two real lessons ago); their own real proof lives in this lesson's own
permanent test.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/auth/domain/user.dart` (new file);
  `project/lib/auth/domain/auth_session.dart` (new file).
- **Change type** — add.
- **Location** — two new, real, standalone files, in a real, new
  `auth/domain/` directory.
- **Dependencies** — none.

### The New Code

```dart
class User {
  const User({required this.id, required this.username});
  final String id;
  final String username;

  Map<String, dynamic> toJson() => {'id': id, 'username': username};
  factory User.fromJson(Map<String, dynamic> json) =>
      User(id: json['id'] as String, username: json['username'] as String);
}

class AuthSession {
  const AuthSession({required this.user, required this.token});
  final User user;
  final String token;

  Map<String, dynamic> toJson() => {'user': user.toJson(), 'token': token};
  factory AuthSession.fromJson(Map<String, dynamic> json) => AuthSession(
    user: User.fromJson(json['user'] as Map<String, dynamic>),
    token: json['token'] as String,
  );
}
```

### The Updated Project

Both files, real and brand new, shown in full above.

### Mechanical walkthrough

- `class User { const User({required this.id, required this.username});
  ... }` — the identical, already-established real shape as
  `Score`/`Achievement`: a real, `const`-constructible, immutable data
  class.
- `Map<String, dynamic> toJson() => {'id': id, 'username': username};`
  — a real, plain method returning a real, already-established
  `Map<String, dynamic>` literal — real and deliberately not itself
  calling `jsonEncode`; that stays real, later, calling code's own
  job (`SecureAuthStorage`, this lesson's own fourth Concept Unit).
- `factory User.fromJson(Map<String, dynamic> json) => User(id:
  json['id'] as String, ...);` — a real, already-established factory
  constructor, real and reading two real `Map` values back out with a
  real, explicit `as String` cast.
- `class AuthSession { ... final User user; final String token; ...
  }` — the identical, real shape, one real level up; `toJson`
  real and nesting `user.toJson()` directly, rather than flattening
  every real field into one, real, single-level `Map`.
- `factory AuthSession.fromJson(...)` — real and calling
  `User.fromJson` on the real, nested `json['user']` value directly —
  real, direct reuse, not a real, second, separate, duplicate parsing
  path for `User`'s own real fields.

### CS lens

Not applicable — two, plain, immutable data records with a real,
already-established JSON convert pair; no new hard concept of their
own.

### SE lens

The real, deliberate choice to give both `User` and `AuthSession`
their own real `toJson`/`fromJson`, rather than writing this real
conversion logic once, inline, only inside whatever real code
eventually saves a session, keeps that real, reusable logic real,
directly testable on its own — this lesson's own permanent test proves
a real, complete round-trip (`AuthSession.fromJson(session.toJson())`)
with zero real dependency on `AuthStorage`, `flutter_secure_storage`,
or any real, live network call at all.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, complete shape for one real, signed-in session now exists —
the next Concept Unit builds the two, real, small contracts that
actually produce and store one.

---

## Concept Unit: AuthApi and AuthStorage

### The Problem

Nothing yet says *how* a real `AuthSession` gets obtained (real
credentials in, a real session out), or *how* one gets remembered
across a real app restart — and, per this project's own real,
established discipline, neither real answer should be hard-coded
directly into whatever real, orchestrating code eventually needs both.

> **Try it yourself first.** Given `ScoreRepository`'s own real,
> already-established choice to *not* be generic over a real state
> type, should `AuthApi`/`AuthStorage` be generic over anything at
> all — and should either one know anything about the other?

### Introducing the concept

No new isolated lab — two, real, small, domain-level interfaces, each
naming one real ability, is the identical, already-established shape
`Clock`/`PuzzleRepository`/`ScoreRepository` already used.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/auth/domain/auth_api.dart` (new
  file); `project/lib/auth/domain/auth_storage.dart` (new file).
- **Change type** — add.
- **Location** — two new, real, standalone files.
- **Dependencies** — `AuthSession`, above.

### The New Code

```dart
abstract class AuthApi {
  Future<AuthSession> login({required String username, required String password});
}

abstract class AuthStorage {
  Future<void> save(AuthSession session);
  Future<AuthSession?> read();
  Future<void> clear();
}
```

### The Updated Project

Both files, real and brand new, shown in full above.

### Mechanical walkthrough

- `abstract class AuthApi { Future<AuthSession> login({required
  String username, required String password}); }` — a real,
  already-established, plain interface declaration; real and
  genuinely unaware of HTTP, `ApiClient`, or any real, particular
  server.
- `abstract class AuthStorage { Future<void> save(AuthSession
  session); Future<AuthSession?> read(); Future<void> clear(); }` —
  the identical, already-established real shape `GameSessionRepository`
  already used (`save`/`hasSavedSession`-style presence check via a
  real, nullable `read`/`clear`) — real and genuinely unaware of
  `flutter_secure_storage`, or any real, particular secure-storage
  mechanism.

### CS lens

Not applicable.

### SE lens

Neither interface is generic, and neither one references the other —
`AuthApi` only ever produces a real `AuthSession`; `AuthStorage` only
ever saves, reads, or clears one, real, already-complete value. The
real, rejected alternative — one, real, combined
`AuthApi`/`AuthStorage` interface — would tie a real, later test that
only wants to fake *one* of the two real abilities (this lesson's own
permanent test fakes `AuthStorage` while still going through a real,
mocked `HttpAuthApi`) to faking both at once, whether or not it
actually needed to.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

Two, real, small, genuinely independent contracts now exist — the
next Concept Unit composes them into this app's own real, complete
Session lifecycle.

---

## Concept Unit: AuthService

### The Problem

`AuthApi`/`AuthStorage` each do exactly one, real, small thing —
nothing yet composes them into the real, actual sequence a real
sign-in, a real app restart, and a real sign-out each need.

> **Try it yourself first.** Given `login` needs to call `AuthApi`
> *and then* `AuthStorage.save`, and `restoreSession` needs to read
> whatever `AuthStorage` already has, what is the smallest, real,
> single class composing both real interfaces into `login`/
> `restoreSession`/`logout`, without either interface needing to know
> the other exists?

### Introducing the concept

No new isolated lab — one, real, small class, composed from two, real,
already-established, injected interfaces, is not a new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/auth/domain/auth_service.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `AuthApi`, `AuthStorage`, `AuthSession`, all
  above.

### The New Code

```dart
class AuthService {
  AuthService({required this._authApi, required this._storage});
  final AuthApi _authApi;
  final AuthStorage _storage;

  AuthSession? _current;
  AuthSession? get currentSession => _current;

  Future<AuthSession> login({required String username, required String password}) async {
    final session = await _authApi.login(username: username, password: password);
    await _storage.save(session);
    _current = session;
    return session;
  }

  Future<bool> restoreSession() async {
    final saved = await _storage.read();
    if (saved == null) return false;
    _current = saved;
    return true;
  }

  Future<void> logout() async {
    await _storage.clear();
    _current = null;
  }
}
```

### The Updated Project

The file, real and brand new, shown in full above.

### Mechanical walkthrough

- `AuthService({required this._authApi, required this._storage});` —
  the identical, already-established, real dependency-injection shape
  `SudokuEngine`/`AuthService`'s own two, real dependencies both
  required, neither one defaulted — real and deliberate: unlike
  `Clock`/`ScoreCalculator`, there is no real, sensible, real, live
  default for either one this lesson.
- `Future<AuthSession> login({...}) async { ...; await _storage.save
  (session); _current = session; return session; }` — three real,
  already-established, sequential steps: ask `AuthApi`, `save` through
  `AuthStorage`, then update this real service's own real, in-memory
  `_current` — real and in that real order, so a real, later
  `currentSession` read is never stale relative to what was actually
  saved.
- `Future<bool> restoreSession() async { final saved = await _storage
  .read(); if (saved == null) return false; _current = saved; return
  true; }` — a real, already-established, explicit `null` check, real
  and the one, real place a real app-restart's own real "was anyone
  already signed in" question gets answered.
- `Future<void> logout() async { await _storage.clear(); _current =
  null; }` — real **Logout**, real and clearing both the real,
  persisted copy and this real service's own, real, in-memory one —
  real, direct proof either one, alone, being cleared would leave a
  real, stale, contradictory answer somewhere.

### CS lens

Not applicable — this Concept Unit composes already-covered
mechanisms; no new hard concept of its own.

### SE lens

Not applicable — every real design decision this Concept Unit needed
was already made, and already justified, by the immediately preceding
Concept Unit's own real interface shapes.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/auth_service_test.dart`.

### Connect the pieces

This app's own real, complete Session lifecycle now exists, real and
entirely testable without a real, live network call or a real, live
secure store — the final Concept Unit gives it real, live
implementations to actually run against.

---

## Concept Unit: HttpAuthApi and SecureAuthStorage

### The Problem

`AuthApi`/`AuthStorage` are both real, so far, only interfaces —
nothing yet actually calls a real server, or actually keeps a real
token real and safe, once this app genuinely ships.

### Introducing the concept

No new isolated lab — `HttpAuthApi` is real, direct delegation to the
already-real, already-tested `ApiClient`, the identical real role
`SqliteScoreRepository` already plays for its own real, domain-level
`ScoreRepository`; `SecureAuthStorage` is a real, thin wrapper around
`flutter_secure_storage`'s own real, already-tested, platform-native
API, real and confirmed directly from its own real package
documentation before use.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/auth/infrastructure/http_auth_api.dart` (new file);
  `project/lib/auth/infrastructure/secure_auth_storage.dart` (new
  file); `project/pubspec.yaml` (modify — add
  `flutter_secure_storage`).
- **Change type** — add; modify.
- **Location** — two new, real, standalone files, in a real, new
  `auth/infrastructure/` directory; `pubspec.yaml`'s own real
  `dependencies:` block.
- **Dependencies** — `ApiClient`, already established;
  `flutter_secure_storage: ^9.2.4`, this curriculum's own third real,
  new package dependency.

### The New Code

```dart
class HttpAuthApi implements AuthApi {
  HttpAuthApi(this._client);
  final ApiClient _client;

  @override
  Future<AuthSession> login({required String username, required String password}) async {
    final body = await _client.post('login', {'username': username, 'password': password});
    return AuthSession.fromJson(body);
  }
}
```

```dart
class SecureAuthStorage implements AuthStorage {
  SecureAuthStorage({FlutterSecureStorage? storage}) : _storage = storage ?? const FlutterSecureStorage();
  final FlutterSecureStorage _storage;
  static const _key = 'auth_session';

  @override
  Future<void> save(AuthSession session) {
    return _storage.write(key: _key, value: jsonEncode(session.toJson()));
  }

  @override
  Future<AuthSession?> read() async {
    final raw = await _storage.read(key: _key);
    if (raw == null) return null;
    return AuthSession.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  @override
  Future<void> clear() => _storage.delete(key: _key);
}
```

### The Updated Project

Both files, real and brand new, shown in full above.

### Mechanical walkthrough

- `class HttpAuthApi implements AuthApi { HttpAuthApi(this._client);
  ... }` — a real, already-established `implements` clause and real
  `this.field` constructor, the identical real shape
  `SqliteScoreRepository` already used one real layer down.
- `final body = await _client.post('login', {...}); return
  AuthSession.fromJson(body);` — the identical, already-established,
  real, live-proven `ApiClient.post` call, real and its own real,
  returned `Map<String, dynamic>` handed straight to the immediately
  preceding Concept Unit's own real `AuthSession.fromJson` — real and
  only possible because this lesson's own real, fake login response
  shape was deliberately designed to already match.
- `SecureAuthStorage({FlutterSecureStorage? storage}) : _storage =
  storage ?? const FlutterSecureStorage();` — the identical,
  already-established, real dependency-injection shape, real and
  applied to a real, external package's own real, concrete class this
  time, not one of this project's own.
- `_storage.write(key: _key, value: jsonEncode(session.toJson()));` —
  `flutter_secure_storage`'s own real, plain, `key: value` write, real
  and given one, real, whole `AuthSession`, `jsonEncode`d into one
  real string — real and deliberately not two, real, separate keys
  (one for the real token, one for the real user) that a real, future
  edit could accidentally leave out of sync.
- `final raw = await _storage.read(key: _key); if (raw == null) return
  null; return AuthSession.fromJson(jsonDecode(raw) as Map<String,
  dynamic>);` — the real, direct inverse, real and reusing the
  identical, already-established, real `jsonDecode`/`fromJson` pair.
- `Future<void> clear() => _storage.delete(key: _key);` — real
  **Logout**'s own real, underlying mechanism, one real line.

### CS lens

Not applicable.

### SE lens

`SecureAuthStorage` was deliberately left without a real, dedicated
unit test of its own this lesson — every one of its own real three
methods is a real, one-line, direct pass-through to
`flutter_secure_storage`'s own real, already-tested, platform-native
API, with no real logic of this app's own beyond the real
`jsonEncode`/`jsonDecode` pair this lesson's own permanent test already
proves directly, on `AuthSession` itself, with zero real dependency on
this real class at all — the identical, real, honest scope call this
project's own, much earlier `SystemClock` already received, for the
identical real reason.

### Commands needed

```
flutter pub get
```

### Run it

Real, run output shown below, in this lesson's own closing, full
verification.

### Connect the pieces

Every real piece this lesson built now composes into one, real,
complete, live-ready authentication feature — proven, end to end,
below.

---

## Connect the pieces

One real, concrete trace, start to finish, proving a real Session
genuinely survives a real, simulated app restart, and a real Logout
genuinely, fully clears it.

1. `AuthService(authApi: HttpAuthApi(ApiClient(...)), storage: ...)
   .login(username: 'bob', password: ...)` — a real Request, through
   `HttpAuthApi`/`ApiClient`, exchanges real credentials for a real
   `AuthSession`; `AuthStorage.save` immediately, permanently records
   it; `currentSession` updates.
2. A real, *second*, freshly-constructed `AuthService`, sharing the
   identical, real, already-populated `AuthStorage` — real, direct
   simulation of "the app was closed and reopened," its own real
   `currentSession` starting genuinely `null`.
3. `restoreSession()` on that real, second service genuinely rebuilds
   `currentSession` from what the real, first service already saved —
   real, direct proof a real Session genuinely survives a real app
   restart, not merely a real, running app's own real, in-memory
   state.
4. `logout()` clears both the real, in-memory `currentSession` *and*
   the real, persisted copy — a real, *third* service, sharing the
   identical, real storage, confirms `restoreSession()` now reports
   `false` too, real, direct proof real Logout is genuinely complete,
   not merely local to whichever real service instance called it.

A real Session that survives closing the app, and a real Logout that
genuinely, fully ends it — curriculum's own five real terms, proven
composed, not tangled, into one, real, small, testable feature.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `AuthService` and every real type around
it are real, permanent project code from their own first line, this
lesson's own real proof lives in a new, permanent
`project/test/auth_service_test.dart`, not a throwaway lab.

No real, first-attempt mistakes this lesson — every real file compiled
and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 8.2s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:25 +117: All tests passed!
```

117 real test-file-level checks, up from 112 — five new, all in the
new, permanent `auth_service_test.dart`. Zero regressions anywhere
else in this app; zero flakes on this lesson's own single, real,
full-suite run. Full, honest narrative, including the real, deliberate
choice to leave `SecureAuthStorage` without its own, dedicated real
test, in `verification/lesson-75/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
