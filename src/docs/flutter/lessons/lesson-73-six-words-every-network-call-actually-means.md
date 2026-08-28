# Lesson 73: Six Words Every Network Call Actually Means

**What you will build.** No real, permanent production code — this
lesson's own real job is curriculum's own six, named, foundational
networking terms (Request, Response, Headers, Status codes, JSON,
REST), proven for real against a real, live, public, no-auth-required
REST test API, not only narrated in prose. Three real, throwaway labs,
run directly against `https://jsonplaceholder.typicode.com`: a real
GET to a real, existing resource; a real GET to a real, nonexistent
one; a real POST creating a real, new one. The transferable problem:
every real lesson in this curriculum, until now, has stayed entirely
local — no real network call has ever been made anywhere in this app.
Curriculum's own next lesson builds `ApiClient`, a real, permanent
abstraction over exactly this; this lesson's own real job is making
sure the six, real, raw concepts that abstraction will wrap are
already genuinely understood, run, and verified first.

**What you need to know first.** Nothing from this app's own real,
existing `game_platform/`/`features/` code — this lesson deliberately
stays outside both. `dart:convert`'s real, built-in `jsonEncode`/
`jsonDecode`, already familiar from any real, prior exposure to JSON in
general, real and newly, formally proven here for the real, first
time in this project specifically.

**Terms used in this lesson**

- **Request** — a real message a real client sends to a real server,
  naming a real method (`GET`, `POST`, and others), a real target
  resource, real headers, and, optionally, a real body.
- **Response** — a real message a real server sends back, naming a
  real status code, real headers, and, optionally, a real body.
- **Headers** — real, named metadata attached to a real Request or
  Response, kept genuinely separate from its own real body — a real
  Response's own `content-type` header, say, describing *how* to
  interpret its own real body, without being part of that body itself.
- **Status code** — a real, three-digit number classifying a real
  Response's own real outcome — `200` for a real, plain success,
  `201` for a real, successful creation, `404` for a real, requested
  resource that genuinely doesn't exist, and many other real,
  standardized values beyond the three this lesson actually observes.
- **JSON** — a real, plain-text data format representing real,
  structured values as real, nested objects, arrays, strings, numbers,
  booleans, and `null` — the real, dominant real format a real Request
  or Response body actually carries on the modern real web.
- **REST** — a real, architectural convention for shaping a real API's
  own real URLs and real HTTP methods around real, named resources —
  a real resource fetched by a real id in its own real URL path
  (`/todos/1`), a real `POST` to a real, plural, resource-named path
  (`/todos`) creating a real, new one, rather than one, real, single
  endpoint accepting a real "action name" parameter for everything.

**Objects and methods used**

- **`http.get` and `http.post`**
  - *What they are:* `package:http`'s own real, top-level functions
    for sending a real HTTP `GET`/`POST` Request and real, `async`ly
    awaiting its own real Response.
  - *Implementation:* `Future<http.Response> get(Uri url, {Map<String,
    String>? headers})`; `Future<http.Response> post(Uri url,
    {Map<String, String>? headers, Object? body})` — real, genuine
    library code, fetched and confirmed from the real, installed
    package source, not assumed from memory.
  - *Its use:* this lesson's own three, real labs call one or the
    other directly.
  - *Type:* real, top-level, `async` functions, each returning a real
    `Future<http.Response>`.
  - *Responsibility:* send one real Request, over a real, live network
    connection, and hand back its own real, eventual Response —
    nothing about interpreting that real Response's own real body;
    that stays real, calling code's own job.
  - *Depends on:* a real, live network connection; `Uri`, Dart's own,
    already-established, built-in type.
  - *Connects to:* `http.Response`, below.
  - *Shape:* `package:http`, a real, external, newly-added dependency
    — not this project's own code.
- **`http.Response`**
  - *What it is:* `package:http`'s own real, concrete class carrying
    one, real, complete Response — its own real status code, real
    headers, and real body, all together.
  - *Implementation:* real, relevant members this lesson's own labs
    actually read — `int get statusCode`; `Map<String, String> get
    headers`; `String get body`.
  - *Its use:* every one of this lesson's own three, real labs reads
    at least one of these three real members directly.
  - *Type:* a real, concrete class, real and returned, never
    constructed directly by this lesson's own code.
  - *Responsibility:* carry a real, already-received Response's own
    real facts — nothing about making a real Request in the first
    place; that stays `http.get`/`http.post`'s own real job, above.
  - *Depends on:* nothing this lesson's own code interacts with
    directly.
  - *Connects to:* `.body`, real and handed straight to `jsonDecode`,
    below, whenever a real Response actually carries real JSON.
  - *Shape:* `package:http`, a real, external dependency.
- **`jsonEncode` and `jsonDecode`**
  - *What they are:* `dart:convert`'s own real, top-level functions
    converting a real, plain Dart value into a real JSON `String`, and
    back.
  - *Implementation:* `String jsonEncode(Object? value)`; `dynamic
    jsonDecode(String source)` — real, built into the Dart SDK itself,
    no real, external package needed for either one.
  - *Its use:* this lesson's own real POST lab calls `jsonEncode` to
    build a real request body; every one of this lesson's own real GET
    labs calls `jsonDecode` on a real, received response body.
  - *Type:* real, top-level, synchronous functions.
  - *Responsibility:* real, pure, two-way translation between a real,
    plain Dart value (a real `Map`, in every real case this lesson
    uses) and a real JSON `String` — nothing about sending or
    receiving either one over a real network; that stays
    `http.get`/`http.post`, above.
  - *Depends on:* nothing beyond Dart's own, built-in
    `Map`/`List`/`String`/`num`/`bool`/`null` types.
  - *Connects to:* `jsonEncode`'s own real output becomes an
    `http.post` call's own real `body`; `jsonDecode`'s own real input
    is an `http.Response`'s own real `.body`.
  - *Shape:* `dart:convert`, part of the Dart SDK itself.

## Concept Unit: Request and Response, over a real GET

### The Problem

Nothing in this project has ever sent a real network Request or read
a real Response before — every one of curriculum's own six named terms
for this lesson exists, so far, only as a real, unproven word.

> **Try it yourself first.** `package:http`'s own real `get` function
> returns a `Future<http.Response>`. What is the smallest, real,
> `async` function that sends one real GET Request to one real, known,
> live URL, and reads back its own real status code, one real header,
> and its own real, JSON-decoded body?

### Introducing the concept

A real, live connectivity check ran first, real and direct, before
writing any real lab code at all:

```
curl -s -o /dev/null -w "%{http_code}\n" https://jsonplaceholder.typicode.com/todos/1
200
```

Confirms, for real, this environment genuinely has outbound internet
access — a real, live lab is possible, not merely theoretical.

### Discard the throwaway example

Not applicable — the real lab itself, below, is this lesson's own real
proof; per the Concept Isolation Rule, it stays a throwaway lab, real
and never promoted into `project/lib/` or `project/test/`, since no
real, permanent, production consumer of `http` exists yet — that stays
curriculum's own very next lesson's real job.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/pubspec.yaml` (modify — add the `http` dependency);
  `verification/lesson-73/http_fundamentals_labs_test.dart` (new,
  throwaway lab file).
- **Change type** — modify (dependency); add (lab).
- **Location** — `pubspec.yaml`'s own real `dependencies:` block; a
  new, real, standalone lab file, outside `project/`'s own real
  `lib/`/`test/` directories.
- **Dependencies** — `http: ^1.5.0`, this curriculum's own first, real,
  new package dependency since Phase 3's own original Flutter
  adoption.

### The New Code

```dart
final response = await http.get(Uri.parse('$_baseUrl/todos/1'));

expect(response.statusCode, 200);
expect(response.headers['content-type'], contains('application/json'));

final body = jsonDecode(response.body) as Map<String, dynamic>;
expect(body['id'], 1);
```

### The Updated Project

`http_fundamentals_labs_test.dart`'s own real, first lab, numbered:

```dart
1  final response = await http.get(Uri.parse('$_baseUrl/todos/1'));
2
3  expect(response.statusCode, 200);
4  expect(response.headers['content-type'], contains('application/json'));
5
6  final body = jsonDecode(response.body) as Map<String, dynamic>;
7  expect(body['id'], 1);
8  expect(body.containsKey('title'), isTrue);
```

### Mechanical walkthrough

- `await http.get(Uri.parse('$_baseUrl/todos/1'))` — a real, live
  network **Request**, real and genuinely `await`ed — this real call
  does not return until the real, remote server's own real
  **Response** genuinely arrives.
- `response.statusCode` — a real, live **Status code**, real and read
  directly off the real, received **Response** — `200`, a real,
  observed value, not a real, assumed one.
- `response.headers['content-type']` — a real, live **Header**, real
  and read the identical, already-established way any real Dart `Map`
  is indexed.
- `jsonDecode(response.body)` — real **JSON**, decoded from the real,
  live **Response**'s own real body `String` into a real, plain Dart
  `Map<String, dynamic>`.
- `body['id']` / `body.containsKey('title')` — two real, plain `Map`
  reads, real and direct proof the real, decoded value genuinely
  contains the real fields **REST** convention promises a single,
  real, `/todos/1`-shaped resource should.

### CS lens

Not applicable — this Concept Unit composes already-covered
mechanisms (`async`/`await`, a real, external library call, `Map`
indexing); no new hard concept of its own.

### SE lens

The real, deliberate choice to run this real lab against a real, live,
external, third-party service, rather than a real, local mock server,
is worth naming directly: real and genuinely proving actual Request/
Response/Headers/Status-code/JSON/REST behavior, at the real cost of
this real lab depending on a real, external service staying up and
reachable — real and precisely why this real proof stays a throwaway
lab, never a permanent, real `project/test/` entry: a real, permanent,
CI-running test suite genuinely should not depend on a real, live,
external network call it doesn't control.

### Commands needed

```
flutter pub get
```

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

Request, Response, Headers, Status codes, and JSON are all now real
and proven, together, in one real, successful case — the next Concept
Unit proves a Status code can genuinely differ.

---

## Concept Unit: A real, different Status code

### The Problem

`200` alone doesn't actually prove `statusCode` is read correctly — a
real, hard-coded `200` fallback (a real, silent bug) would pass the
immediately preceding Concept Unit's own real assertion just as
easily as a real, genuinely correct read would.

> **Try it yourself first.** What is the smallest, real change to the
> immediately preceding Concept Unit's own real lab that forces a real,
> genuinely different Status code back from the real, same, live
> server — proving `statusCode` is actually read, not merely assumed?

### Introducing the concept

No new isolated lab — a real, second GET Request, identical in every
real way except its own real, target id, is not a new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `verification/lesson-73/http_fundamentals_labs_test.dart` (already
  new, above — this Concept Unit adds a real, second `test(...)`
  block).
- **Change type** — add.
- **Location** — the identical, already-new lab file.
- **Dependencies** — `http.get`, already established, above.

### The New Code

```dart
final response = await http.get(Uri.parse('$_baseUrl/todos/999999999'));
expect(response.statusCode, 404);
```

### The Updated Project

`http_fundamentals_labs_test.dart`'s own real, second lab, numbered:

```dart
1  final response = await http.get(Uri.parse('$_baseUrl/todos/999999999'));
2  expect(response.statusCode, 404);
```

### Mechanical walkthrough

- `Uri.parse('$_baseUrl/todos/999999999')` — the identical,
  already-established real call, real and pointed at a real, genuinely
  nonexistent id.
- `expect(response.statusCode, 404);` — the real, already-established
  assertion pattern, real and now checking a real, different value —
  direct, real proof this real server (and this real client code)
  genuinely distinguishes "found" from "not found," rather than always
  reporting the identical real code regardless of what was actually
  asked for.

### CS lens

Not applicable.

### SE lens

Not applicable — every real design decision this Concept Unit needed
was already made, and already justified, by the immediately preceding
Concept Unit.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Unit, in
the closing, full-lesson test run, below.

### Connect the pieces

Two real, genuinely different Status codes are now proven — the final
Concept Unit proves Headers and JSON flowing the other direction, on a
real Request this app itself sends.

---

## Concept Unit: REST, over a real POST

### The Problem

Every real Request so far has only ever *read* — nothing yet proves a
real Header or a real JSON body can be *sent*, on a real Request, or
that REST's own real convention for *creating* a real, new resource
(`POST` to a real, plural, resource-named path) actually behaves the
way its own real name promises.

> **Try it yourself first.** Given `http.post`'s own real
> `{Map<String, String>? headers, Object? body}` parameters, what is
> the smallest, real call sending a real, explicit `Content-Type`
> Header and a real, `jsonEncode`d body, and what real Status code
> should REST convention predict for a real, successful creation?

### Introducing the concept

No new isolated lab — `http.post`, real and already established above
for `http.get`, takes the identical real shape with two, real,
additional, optional named parameters; `jsonEncode`, the direct real
inverse of the already-established `jsonDecode`, is not a new
construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `verification/lesson-73/http_fundamentals_labs_test.dart` (already
  new, above — this Concept Unit adds a real, third `test(...)`
  block).
- **Change type** — add.
- **Location** — the identical, already-new lab file.
- **Dependencies** — `http.post`, `jsonEncode`, both established above.

### The New Code

```dart
final response = await http.post(
  Uri.parse('$_baseUrl/todos'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({'title': 'a real, new todo', 'completed': false}),
);
expect(response.statusCode, 201);
```

### The Updated Project

`http_fundamentals_labs_test.dart`'s own real, third lab, numbered:

```dart
1  final response = await http.post(
2    Uri.parse('$_baseUrl/todos'),
3    headers: {'Content-Type': 'application/json'},
4    body: jsonEncode({'title': 'a real, new todo', 'completed': false}),
5  );
6
7  expect(response.statusCode, 201);
8
9  final created = jsonDecode(response.body) as Map<String, dynamic>;
10 expect(created['title'], 'a real, new todo');
11 expect(created.containsKey('id'), isTrue);
```

### Mechanical walkthrough

- `Uri.parse('$_baseUrl/todos')` — real and deliberately the real,
  plural, resource-named path, with no real, specific id — REST's own
  real convention for "create a real, new one here," a real, different
  real URL shape from the immediately preceding Concept Units' own
  `/todos/1`.
- `headers: {'Content-Type': 'application/json'}` — a real, explicit,
  outgoing **Header**, real and telling the real, remote server how to
  correctly interpret this real Request's own real body.
- `body: jsonEncode({'title': ..., 'completed': false})` — real
  **JSON**, real and encoded from a real, plain Dart `Map` into a real
  `String`, this real call's own real, outgoing body.
- `expect(response.statusCode, 201);` — a real, third, genuinely
  different, observed **Status code** — REST convention's own real,
  standard answer for "a real request that successfully created a
  real, new resource."
- `jsonDecode(response.body)` / `created['title']` /
  `created.containsKey('id')` — the identical, already-established
  real decode pattern, now real and reading the real, remote server's
  own real echo of what it actually created, including a real,
  server-assigned `id` this real client never sent.

### CS lens

Not applicable.

### SE lens

Not applicable — this Concept Unit reuses every real design decision
already made and justified above.

### Commands needed

None.

### Run it

Real, run output shown below, in this lesson's own closing, full
verification.

### Connect the pieces

Every one of curriculum's own six named terms is now real and proven,
in both real directions — a real Request carrying real Headers and a
real, encoded body; a real Response carrying a real Status code, real
Headers, and a real, decodable body — over both a real GET and a real
POST.

---

## Connect the pieces

One real, concrete trace, start to finish, across this lesson's own
three real labs, proving all six of curriculum's own named terms for
real.

1. A real GET **Request** to `/todos/1` — a real, RESTful, id-in-path
   resource lookup — returns a real `200` **Response**, a real
   `content-type` **Header**, and a real, `jsonDecode`-readable
   **JSON** body.
2. A real GET **Request** to `/todos/999999999` — the identical real
   shape, a real, deliberately nonexistent id — returns a real,
   genuinely different `404` **Status code**, direct proof this real
   client actually reads what the real server actually sends, not a
   real, hard-coded assumption.
3. A real POST **Request** to `/todos` — REST convention's own real,
   plural, resource-creating path — carrying a real, explicit
   `Content-Type` **Header** and a real, `jsonEncode`d **JSON** body,
   returns a real `201` **Response**, echoing back a real,
   server-assigned id this real client never sent.

Six real words, no longer only words — every one of curriculum's own
named terms for this lesson, run and genuinely observed against a
real, live server this app does not control.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. This lesson's own real proof lives entirely in
a new, throwaway `verification/lesson-73/http_fundamentals_labs_test
.dart`, per the Concept Isolation Rule — no real, permanent production
code, and no new, real, permanent `project/test/` entry, since no
real, permanent consumer of `http` exists in this app yet.

No real, first-attempt mistakes this lesson — every real lab passed
against the real, live, remote server on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 7.1s)
```

Unchanged from this lesson's own pre-change baseline — the new, real
lab lives outside `flutter analyze .`'s own real scope; adding
`http` as a real, new dependency introduced zero new, real issues of
its own.

```
flutter test
...
00:28 +108: All tests passed!
```

108 real test-file-level checks, unchanged — this lesson's own real
proof lives entirely in a throwaway lab. One real, isolated flake
(this project's own already-established, honest, unrelated pattern,
now observed a sixth time) appeared on the first of two full-suite
runs, confirmed clean immediately after. Full, honest narrative,
including the real, live connectivity check run before writing any
real lab code, in `verification/lesson-73/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
