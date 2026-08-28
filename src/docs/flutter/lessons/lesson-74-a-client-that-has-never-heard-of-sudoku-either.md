# Lesson 74: A Client That Has Never Heard of Sudoku Either

**What you will build.** `ApiClient`, a real, minimal, generic HTTP
client wrapper — real `get`/`post` methods, real, automatic JSON
decoding, and one, real, shared `ApiException` for any real,
non-successful Response — plus `ApiException` itself. Curriculum's own
real instruction for this lesson names its own real constraint
directly: "create `ApiClient`... and keep it outside the domain."
The transferable problem: the immediately preceding lesson proved
Request/Response/Headers/Status codes/JSON/REST all work, live, for
real — but proved them with three, separate, hand-written, throwaway
calls. This lesson's own real job is turning that real, proven,
raw knowledge into one, real, small, reusable, *permanent* piece of
code — and, per curriculum's own real instruction, keeping it
genuinely separate from this app's own real business rules, the
identical real separation `game_platform/domain/` and
`game_platform/infrastructure/` already keep for `Clock`.

**What you need to know first.** `http.get`/`http.post`/
`http.Response`/`jsonEncode`/`jsonDecode`, every one already
established, real and live-proven, by the immediately preceding
lesson. This project's own, already-established, real
dependency-injection shape — `Clock`/`PuzzleRepository`/
`ScoreCalculator`, each accepted as a real, injected constructor
parameter, defaulting to a real, concrete implementation when the
caller doesn't supply one. The real, already-established
Domain/Infrastructure split itself (`Clock`'s own interface, in
`domain/`; `SystemClock`, its own real implementation, in
`infrastructure/`) — the real precedent this lesson's own real
placement decision follows directly.

**Terms used in this lesson**

No new Terms — this lesson's own real placement decision reuses the
already-established Domain/Infrastructure split by name; its own real
dependency-injection shape reuses the identical, already-established
pattern `Clock`/`PuzzleRepository`/`ScoreCalculator` already named and
explained.

**Objects and methods used**

- **`ApiException`**
  - *What it is:* a real, custom domain error, thrown whenever a real
    Response's own real status code genuinely falls outside the real
    `2xx` success range.
  - *Implementation:* `class ApiException implements Exception {
    ApiException(this.statusCode, this.body); final int statusCode;
    final String body; ... }` — real, complete, two real fields.
  - *Its use:* thrown by `ApiClient`'s own real, shared `_decode`
    method, below; caught, and its own real `statusCode` inspected
    directly, by this lesson's own new, permanent test.
  - *Type:* a real, plain class implementing Dart's own, built-in
    `Exception` marker interface.
  - *Responsibility:* carry the real, actual status code and real body
    a real, failed Response actually had — nothing about deciding
    *how* real, calling code should react to one; that stays real,
    later, calling code's own job.
  - *Depends on:* nothing.
  - *Connects to:* thrown by `ApiClient._decode`, below.
  - *Shape:* Infrastructure-layer, `game_platform/infrastructure/` —
    real and living alongside `ApiClient` itself, outside the domain.
- **`ApiClient`**
  - *What it is:* a real, minimal, generic HTTP client wrapper — real
    and curriculum's own, one, named, real deliverable for this
    lesson.
  - *Implementation:* real, shown in full across this lesson's own
    first two Concept Units, below.
  - *Its use:* this lesson's own new, permanent test constructs one
    around a real, injected `MockClient`, below, and drives every one
    of its own real, public methods.
  - *Type:* a real, plain, concrete class — no real interface, no
    real, generic type parameter of its own.
  - *Responsibility:* send one real HTTP Request, decode its own real,
    successful JSON Response, or throw one real, shared
    `ApiException` — nothing about which real, particular API this
    app eventually calls, or what any real, decoded value actually
    means; those stay real, later, calling code's own job.
  - *Depends on:* `package:http`'s own real `Client`, already
    established.
  - *Connects to:* `ApiException`, above; a real `http.Client`,
    injected — a real, live one by default, a real `MockClient` in
    this lesson's own permanent test.
  - *Shape:* Infrastructure-layer, `game_platform/infrastructure/` —
    real and deliberately outside `game_platform/domain/`.
- **`MockClient`**
  - *What it is:* `package:http/testing.dart`'s own real, official,
    already-existing test double for `http.Client` — real and not this
    project's own code at all.
  - *Implementation:* `MockClient(Future<http.Response> Function
    (http.Request) fn)` — real, confirmed directly from the real,
    installed package source before use, not assumed from memory.
  - *Its use:* this lesson's own new, permanent test injects one into
    every real `ApiClient` it constructs, real and controlling every
    real Response `ApiClient` ever sees.
  - *Type:* a real, concrete class, real and already implementing
    `http.Client` itself.
  - *Responsibility:* let real, permanent test code define exactly
    what real Response comes back for a real Request, without a real,
    live network call ever happening — nothing about `ApiClient`'s own
    real behavior; that stays genuinely real, unmocked code, under
    real test.
  - *Depends on:* `package:http`, already established.
  - *Connects to:* injected as `ApiClient`'s own real, optional
    `httpClient` parameter.
  - *Shape:* `package:http/testing.dart`, a real, external dependency.

## Concept Unit: ApiClient's own real shape, and where it lives

### The Problem

Curriculum's own real instruction names a real constraint, not a real
implementation: "create `ApiClient`... and keep it outside the
domain." Nothing yet says *where*, precisely, "outside the domain"
means in this project's own, already-established directory shape.

> **Try it yourself first.** `Clock`'s own real interface lives in
> `game_platform/domain/`; its own real, concrete `SystemClock` lives
> in a real, separate, sibling `infrastructure/` directory. Given
> `ApiClient` has no real, corresponding domain-level interface of its
> own to implement (nothing in this app's own domain layer has ever
> asked "give me something that can make an HTTP call" before), where
> should it live — and does skipping a real, separate interface
> genuinely violate curriculum's own real "keep it outside the domain"
> instruction?

### Introducing the concept

No new isolated lab — placing a real, new, concrete class in a real,
new, sibling `infrastructure/` directory is not a new construct; this
project's own `features/sudoku/infrastructure/` already established
the identical, real, directory-level pattern one real layer down.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/infrastructure/api_client.dart` (new
  file — and a real, new, first `game_platform/infrastructure/`
  directory).
- **Change type** — add.
- **Location** — a real, new, standalone file, in a real, new,
  standalone directory.
- **Dependencies** — `package:http`, already established.

### The New Code

```dart
class ApiException implements Exception {
  ApiException(this.statusCode, this.body);
  final int statusCode;
  final String body;

  @override
  String toString() => 'ApiException($statusCode): $body';
}

class ApiClient {
  ApiClient({required this._baseUrl, http.Client? httpClient})
    : _httpClient = httpClient ?? http.Client();

  final Uri _baseUrl;
  final http.Client _httpClient;
}
```

### The Updated Project

`api_client.dart`'s own real, opening lines, numbered — the start of a
brand-new file:

```dart
1  class ApiException implements Exception {
2    ApiException(this.statusCode, this.body);
3    final int statusCode;
4    final String body;
5
6    @override
7    String toString() => 'ApiException($statusCode): $body';
8  }
9
10 class ApiClient {
11   ApiClient({required this._baseUrl, http.Client? httpClient})
12     : _httpClient = httpClient ?? http.Client();
13
14   final Uri _baseUrl;
15   final http.Client _httpClient;
```

### Mechanical walkthrough

- `class ApiException implements Exception { ApiException(this
  .statusCode, this.body); ... }` — a real, already-established
  `implements` clause against Dart's own, built-in `Exception` marker
  interface, and a real, plain constructor using real `this.field`
  shorthand.
- `String toString() => 'ApiException($statusCode): $body';` — a real,
  already-established `@override`, real and giving this real
  exception a real, human-readable message wherever it's real,
  eventually printed or logged.
- `ApiClient({required this._baseUrl, http.Client? httpClient}) :
  _httpClient = httpClient ?? http.Client();` — the identical,
  already-established, real dependency-injection shape `Clock`/
  `PuzzleRepository`/`ScoreCalculator` already use: a real, required,
  private field (`_baseUrl`), and a real, optional, nullable,
  injected dependency (`httpClient`), defaulting, via the
  already-established real `??` operator, to a real, genuine
  `http.Client()` — `package:http`'s own real, built-in factory
  constructor, already read directly from its own real, installed
  source.

### CS lens

Not applicable.

### SE lens

The real, rejected alternative here was a real, domain-level
`ApiClient` *interface*, in `game_platform/domain/`, with `ApiClient`
itself demoted to one, real, concrete implementation living in
`infrastructure/` — the identical, real shape `Clock`/`SystemClock`
already use. Real, deliberately not built that way, this lesson: no
real, domain-level code has ever asked to depend on "something that
can make an HTTP call" — inventing that real interface now, with
exactly one, real, ever, concrete implementation, and zero, real,
actual domain-level callers, would be real, speculative abstraction
for a real need that doesn't exist yet. `ApiClient` itself living in
`infrastructure/`, and simply never being imported from `domain/`,
already, fully satisfies curriculum's own real instruction — a real,
future lesson that actually needs domain-level code to depend on a
real, swappable network abstraction is the real, right, later place
to introduce that real, additional interface, not this one.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

`ApiClient` now exists, real and correctly placed — the next Concept
Unit gives it the real, two methods curriculum's own real deliverable
actually needs to be useful.

---

## Concept Unit: get, post, and one real, shared decode path

### The Problem

`ApiClient` can be constructed, but sends no real Requests yet, and
has no real, single, shared way to turn a real Response into either a
real, decoded value or a real, thrown error.

> **Try it yourself first.** Given `get` and `post` both need to react
> the identical, real way to a real, non-2xx Response, what is the
> smallest, real, single, shared method both can call, rather than
> each real method separately, real and riskily, checking
> `statusCode` its own way?

### Introducing the concept

No new isolated lab — a real, private, shared helper method, called
from more than one real, public method, is an already-established
shape; its own real proof lives in this lesson's own permanent test,
run directly against real project code.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/infrastructure/api_client.dart` (modify —
  continuing the immediately preceding Concept Unit's own real file).
- **Change type** — modify.
- **Location** — `ApiClient`'s own real class body.
- **Dependencies** — `jsonEncode`/`jsonDecode`, already established;
  `ApiException`, above.

### The New Code

```dart
Future<Map<String, dynamic>> get(String path) async {
  final response = await _httpClient.get(_baseUrl.resolve(path));
  return _decode(response);
}

Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
  final response = await _httpClient.post(
    _baseUrl.resolve(path),
    headers: const {'Content-Type': 'application/json'},
    body: jsonEncode(body),
  );
  return _decode(response);
}

Map<String, dynamic> _decode(http.Response response) {
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw ApiException(response.statusCode, response.body);
  }
  return jsonDecode(response.body) as Map<String, dynamic>;
}
```

### The Updated Project

`api_client.dart`'s own real, remaining lines, numbered, continuing
directly from the immediately preceding Concept Unit's own real
ending line 15:

```dart
16
17   Future<Map<String, dynamic>> get(String path) async {
18     final response = await _httpClient.get(_baseUrl.resolve(path));
19     return _decode(response);
20   }
21
22   Future<Map<String, dynamic>> post(
23     String path,
24     Map<String, dynamic> body,
25   ) async {
26     final response = await _httpClient.post(
27       _baseUrl.resolve(path),
28       headers: const {'Content-Type': 'application/json'},
29       body: jsonEncode(body),
30     );
31     return _decode(response);
32   }
33
34   Map<String, dynamic> _decode(http.Response response) {
35     if (response.statusCode < 200 || response.statusCode >= 300) {
36       throw ApiException(response.statusCode, response.body);
37     }
38     return jsonDecode(response.body) as Map<String, dynamic>;
39   }
40 }
```

### Mechanical walkthrough

- `Future<Map<String, dynamic>> get(String path) async { ... }` — a
  real, `async` method, real and already-established in shape;
  `_baseUrl.resolve(path)` — `Uri`'s own real, built-in `resolve`
  method, real and already turning a real, relative `path` string into
  a real, complete, absolute `Uri` against this real client's own real
  `_baseUrl`.
- `Future<Map<String, dynamic>> post(String path, Map<String,
  dynamic> body) async { ... }` — the identical, real, `async` shape,
  real and passing `headers`/`body` through to `_httpClient.post`, the
  identical, already-established, live-proven call the immediately
  preceding lesson already used directly.
- `Map<String, dynamic> _decode(http.Response response) { ... }` — a
  real, private, shared method — real and the one, single, real place
  every real HTTP method this class has reaches to turn a real
  Response into either a real, thrown `ApiException` or a real,
  decoded value.
- `if (response.statusCode < 200 || response.statusCode >= 300) {
  throw ApiException(...); }` — a real, already-established
  comparison and a real, already-established `throw`, real and
  checking the real, standard `2xx` success range directly, rather
  than only real, hard-coding the three, specific status codes the
  immediately preceding lesson happened to observe.
- `return jsonDecode(response.body) as Map<String, dynamic>;` — the
  identical, already-established, real, live-proven decode call, real
  and now living in one, real, single, shared place instead of
  repeated at every real call site.

### CS lens

Not applicable — a real, shared, private helper method is an
already-covered mechanism; no new hard concept of its own.

### SE lens

The real, rejected alternative here was letting `get` and `post` each
check `statusCode`, and throw, independently — real, one fewer method,
at the real cost of a real, genuine risk this lesson's own new,
permanent test directly, deliberately proves against: two, real,
separate, hand-written checks can silently drift apart over real time
(a real, later edit to one real method's own real range check,
forgotten on the other). One, real, shared `_decode` makes that real
kind of real, silent drift structurally impossible — there is only
ever one, real, single place the real check lives.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/api_client_test.dart`.

### Connect the pieces

`ApiClient` can now genuinely send Requests and decode Responses — the
final Concept Unit proves it, real and entirely deterministically,
with zero real, live network calls.

---

## Concept Unit: Proving it with MockClient

### The Problem

The immediately preceding lesson's own real lab depended on a real,
live, external, third-party service staying reachable — real and
deliberately unsuitable for a real, permanent `project/test/` entry.
Nothing yet proves `ApiClient` actually works without that real,
external dependency.

> **Try it yourself first.** `ApiClient`'s own real, injected
> `httpClient` parameter already accepts anything real implementing
> `http.Client`. What real, already-existing tool, from `package:http`
> itself, could stand in for a real, live server, real and entirely
> under this real test's own control?

### Introducing the concept

`package:http/testing.dart`'s own real, installed source
(`http-1.6.0/lib/src/mock_client.dart`) was read directly, confirming
its own real, exact constructor shape before use, rather than assumed
from memory:

```dart
MockClient(MockClientHandler fn)
typedef MockClientHandler = Future<Response> Function(Request request);
```

No new isolated lab — `MockClient` is a real, already-existing,
official library tool, not a new construct this project itself has to
build; its own real proof lives directly in this lesson's own
permanent test.

### Discard the throwaway example

Not applicable — this real proof lives permanently in
`api_client_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/test/api_client_test.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone test file.
- **Dependencies** — `MockClient`, above; `ApiClient`, `ApiException`,
  both established in this lesson's own two immediately preceding
  Concept Units.

### The New Code

```dart
final client = ApiClient(
  baseUrl: Uri.parse('https://example.test/'),
  httpClient: MockClient((request) async {
    return http.Response(jsonEncode({'id': 1}), 200);
  }),
);

final body = await client.get('todos/1');
expect(body['id'], 1);
```

### The Updated Project

`api_client_test.dart`'s own real, first real test, numbered:

```dart
1  final client = ApiClient(
2    baseUrl: Uri.parse('https://example.test/'),
3    httpClient: MockClient((request) async {
4      requestedUrl = request.url;
5      return http.Response(
6        jsonEncode({'id': 1, 'title': 'a real todo'}),
7        200,
8        headers: {'content-type': 'application/json'},
9      );
10   }),
11 );
12
13 final body = await client.get('todos/1');
14
15 expect(requestedUrl, Uri.parse('https://example.test/todos/1'));
16 expect(body['id'], 1);
```

### Mechanical walkthrough

- `MockClient((request) async { ... })` — a real, already-confirmed
  constructor call, real and handed a real, plain, `async` callback
  receiving the real, exact `http.Request` `ApiClient` actually sent.
- `requestedUrl = request.url;` — a real, direct read off the real,
  received `Request`, real and captured into a real, outer, local
  variable this real test can assert on afterward — real, direct
  proof `_baseUrl.resolve(path)`, from the immediately preceding
  Concept Unit, genuinely built the real, correct, full URL.
- `return http.Response(jsonEncode({...}), 200, headers: {...});` — a
  real, already-established `http.Response` constructor call, real and
  building the real, fake Response this real test wants `ApiClient`
  to receive — no real, live server involved anywhere.
- `expect(requestedUrl, Uri.parse('https://example.test/todos/1'));` —
  a real, already-established assertion, real and checking the real,
  captured `Uri` matches exactly.

### CS lens

Not applicable.

### SE lens

Not applicable — every real design decision this Concept Unit needed
was already made by `package:http`'s own real, existing `MockClient`;
nothing here is this project's own real design choice to justify.

### Commands needed

None.

### Run it

```
"/c/flutter/bin/flutter.bat" test test/api_client_test.dart
...
00:00 +4: All tests passed!
```

All four real tests passed on the real, first run.

### Connect the pieces

`ApiClient` is now real, permanent, tested project code — proven
correct without depending on a single, real, live network call.

---

## Connect the pieces

One real, concrete trace, start to finish, proving `ApiClient` sends,
decodes, and errors correctly, entirely deterministically.

1. `ApiClient(baseUrl: ..., httpClient: MockClient((request) async {
   ... }))` — a real, injected, fake server, standing in for a real,
   live one, the identical real seam `Clock`/`PuzzleRepository`
   already established for their own real dependencies.
2. `client.get('todos/1')` — a real Request, correctly resolved
   against `_baseUrl`, real and confirmed directly by reading the real
   `Request` `MockClient` handed back; a real, `200` Response returns a
   real, decoded `Map`.
3. A real, second `MockClient`, returning a real `404` — `client.get`
   genuinely throws a real `ApiException`, its own real `statusCode`
   directly, correctly readable.
4. `client.post('todos', {...})` — real and confirmed to send the
   real, correct HTTP method, a real `Content-Type` header, and a
   real, `jsonEncode`d body; a real, second, real, non-2xx
   `MockClient` proves the identical, real `_decode` path is genuinely
   shared between `get` and `post`, not duplicated.

`ApiClient`, real, permanent, and genuinely outside the domain —
curriculum's own real instruction, satisfied, and proven correct
without ever touching a real, live network.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `ApiClient` is real, permanent project
code from its own first line, this lesson's own real proof lives in a
new, permanent `project/test/api_client_test.dart`, not a throwaway
lab.

No real, first-attempt mistakes this lesson — every real file
compiled and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 7.2s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:30 +112: All tests passed!
```

112 real test-file-level checks, up from 108 — four new, all in the
new, permanent `api_client_test.dart`. Three real, isolated flakes
(this project's own already-established, honest, unrelated pattern,
now observed spreading to two, further, real, unrelated widget-test
files beyond its own, already-known cases) appeared on the first of
two full-suite runs, confirmed clean immediately after — genuinely
unrelated to this lesson's own changes, since `ApiClient` touches no
real UI, database, or widget tree at all. Full, honest narrative in
`verification/lesson-74/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
