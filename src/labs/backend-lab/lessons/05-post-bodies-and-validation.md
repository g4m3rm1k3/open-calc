# Backend Lab — Lesson 5 — POST Bodies and Basic Validation

## What You Will Build

`POST /users` — the first endpoint that *creates* something instead of
just reading it — plus the first real defense against bad data: rejecting
a request before it can do damage, with a `400` and a clear reason why.

---

## What You Need to Know First

Lesson 1's `request.method`, `request.path`; lesson 4's `request.query`.
This lesson adds the last piece of the request object: `request.body`.

---

## Step 1 — A Request That Carries Data, Not Just a Destination

Every endpoint so far has read `request.path` or `request.query` to
decide *what* to return — the request itself carried no real data, just
instructions about which existing data to fetch. Creating something is
different: the client has to send the *actual new thing* — a new user's
name, for instance — somewhere in the request. That "somewhere" is the
**request body**: a chunk of data attached to the request, separate from
both the path and the query string, conventionally sent as JSON text.

**CS lens — why POST, and not GET, is used for this.** HTTP methods
carry meaning beyond just "which handler runs" — `GET` means "give me
data, and don't change anything by asking"; **`POST`** means "here is
data, do something with it — usually, create something new." This
distinction is called **HTTP semantics**, and real infrastructure
(browsers, caches, proxies) actually behaves differently based on it: a
browser might silently retry a failed `GET` (harmless — it can't have
changed anything), but would never automatically retry a failed `POST`
(it might create a second, duplicate resource). Using the right method
for the right kind of request isn't a style rule — it's read and acted on
by real software you didn't write.

**SE lens — the idempotence contrast lesson 4 promised, paid off.**
Lesson 4 named `GET` as **idempotent** — sending the same request five
times has the same effect as sending it once, because reading data
never changes anything. `POST /users` is the opposite: sending the exact
same request five times creates *five separate users*, each a real,
distinct side effect. This is precisely why a browser's automatic retry
behavior (mentioned above) treats the two methods so differently — retrying
an idempotent request is safe by definition; retrying a non-idempotent
one might not be. `GET` is also called a **safe method** for a related
but distinct reason: safety is specifically about not having side
effects at all (reading causes no change to anything), while idempotence
is about *repeating* an action having no additional effect beyond the
first time — `POST` is neither safe nor idempotent; a hypothetical
`PUT /users/1` (met later in this series) can be unsafe (it does change
something) while still being idempotent (setting the same value twice
leaves the same end result as setting it once).

---

## Step 2 — Read and Parse the Body

`request.body` arrives as a raw **string** of JSON text — the same
"the network only ever sends text" fact lesson 4 already established for
query parameters, just for a bigger, structured piece of data this time.

```javascript
function createUser(request) {
  var data = JSON.parse(request.body);
  return { status: 201, body: { id: 4, name: data.name } };
}
```

Wiring this in reaches a real limit in the lesson-3 router: `routes`
currently matches on `pattern` alone, and `POST /users` shares its exact
path with `GET /users` — the router has no way yet to tell "list every
user" apart from "create a new one." Fixed in Step 5. For now, test
`createUser` on its own by temporarily making it the first line of
`handleRequest`:

```javascript
function handleRequest(request) {
  return createUser(request);
}
```

Set the request body to `{ "name": "Priya" }`, path `/users`. Send it —
a `201` with the new user comes back. (The method dropdown doesn't
matter yet, since nothing checks it — that's exactly the gap Step 5
closes.)

**Walkthrough — `JSON.parse`, turning text back into real data.**
`request.body` is a string that merely *looks like* an object —
`'{ "name": "Priya" }'`, with quote marks, is not the same thing as an
actual object with a `name` key. `JSON.parse` reads that text and builds
a real object out of it, the same way `Number("1")` in lesson 4 turned
text that looked like a number into an actual number. `data.name` only
works *after* this conversion — trying to read `.name` directly off the
raw string would read a property that doesn't exist on a string at all.

**CS lens — 201, a status code that means more than "OK."** `200` means
"succeeded, here's the result you asked to see." `201 Created` means
something more specific: "succeeded, *and* a new resource now exists
because of this request." Real APIs distinguish these on purpose — a
client (or a human reading server logs) can tell "this request read
something" from "this request permanently changed something" just from
the status code, without inspecting anything else.

**Honest limitation — real requests also say what shape the body is in,
this lab always assumes JSON.** A real HTTP request carries a
`Content-Type` header alongside its body — `application/json` for JSON
text, `text/plain` for plain text, `multipart/form-data` for uploaded
files — telling the server how to interpret whatever bytes follow. This
lab always assumes `request.body` is JSON text and skips modeling that
header at all, the same kind of deliberate simplification lesson 1 named
for query-string parsing: the point of this lesson is what a body
*means* once parsed, not re-teaching content negotiation on top of
everything else already new here.

---

## Step 3 — Feel Why Validation Is Needed

Send a `POST /users` with an empty body, `""`, no method/path changes.

`JSON.parse("")` throws a real error — not a `400` you wrote, an actual
crash, because empty text isn't valid JSON at all. This is a request the
server should have handled gracefully, and currently doesn't.

Now send `{ "age": 25 }` — no `name` at all. This one *doesn't* crash —
`JSON.parse` succeeds, `data.name` is simply `undefined`, and the server
happily creates "a user" with no name, silently accepting nonsense.

**SE lens — two different failure shapes, both real, both currently
unhandled.** A malformed request (bad JSON) crashes the whole request
instead of failing gracefully. A well-formed-but-incomplete request (no
`name`) doesn't crash at all — it's accepted and does something wrong
quietly, which is arguably worse, since nothing signals that anything
went wrong. **Validation** is the general name for checking that incoming
data is actually usable *before* acting on it — and it has to catch both
shapes of bad data, not just the ones that happen to crash.

**CS lens — two distinct failure modes, worth naming precisely.** A
**failure mode** is a specific, identifiable way a system can fail —
naming failure modes explicitly, rather than lumping every possible
problem into one vague "something went wrong," is a real reliability
practice: it's only possible to design a specific defense (a `try`/`catch`,
a presence check) once the specific way something can go wrong has been
named. This lesson has now identified exactly two: malformed input
(fails at the parsing stage) and incomplete input (fails at the
meaning stage, after parsing succeeds) — the same parsing-versus-
interpretation split lesson 4 introduced for query strings, showing up
again here for request bodies.

---

## Step 4 — Validate Before Acting

```javascript
function createUser(request) {
  var data;
  try {
    data = JSON.parse(request.body);
  } catch (err) {
    return { status: 400, body: { error: "Body must be valid JSON" } };
  }

  if (!data.name) {
    return { status: 400, body: { error: "name is required" } };
  }

  return { status: 201, body: { id: 4, name: data.name } };
}
```

Send the empty body again — a real `400`, not a crash. Send `{ "age": 25 }`
— a real `400` naming exactly what's missing. Send `{ "name": "Priya" }`
— still a working `201`, unaffected.

**Walkthrough — `try`/`catch`, catching a real crash on purpose.** Code
inside `try { ... }` runs normally; if it throws — `JSON.parse` throwing
on invalid text is a real, genuine throw, not a special case built for
this lesson — control jumps immediately into `catch (err) { ... }`
instead of crashing the whole request. This is the first time this
project has needed to catch an error on purpose, rather than let one
surface as an honest failure (lesson 1's opening beat) — the difference
is that *this* failure is entirely expected and recoverable: a client
sending malformed JSON is normal, ordinary traffic a real server has to
handle every day, not a bug in the server's own code.

**Walkthrough — `!data.name`, checking for "missing," not just
"undefined."** `!data.name` is `true` when `data.name` is `undefined`
(the key was never sent), `""` (sent as an empty string), `0`, or `null`
— every **falsy** value, not only the one specific "missing" case. For a
name field, treating an empty string the same as "not provided" is
usually exactly the right call — an empty name isn't a real name either.

**CS lens — two different ways of signaling failure, both used in this
one function.** `JSON.parse` failing produces an **exception** — control
is yanked away from wherever it was, immediately, whether or not
anything nearby was prepared to catch it (`try`/`catch` is what prepares
for it). The missing-`name` case is handled completely differently:
`createUser` simply `return`s a normal object, `{ status: 400, ... }` —
an **ordinary return value**, not a thrown exception at all, just a
response that happens to describe a failure. Both are legitimate ways to
signal "this didn't work," and real languages disagree about which
should be the default: JavaScript, Java, and Python lean on exceptions;
Go and Rust lean on ordinary return values for expected failures,
reserving exceptions/panics for truly unrecoverable situations. This
project already uses both, on purpose: an exception for a failure that's
a genuine anomaly in parsing, a return value for a failure that's a
completely ordinary, expected outcome of validation.

**SE lens — a consistent error shape is itself a design decision.**
Every `400` in this project so far returns `{ error: "some message" }` —
the same two-field shape, every time. Nothing forces this; it's a
convention, exactly like lesson 1's `{ status, body }` was a convention.
Keeping error responses in one predictable shape means any client
talking to this API can handle *every* error the same way (read
`.error`), rather than needing special-case code for each individual
endpoint's own error format — real APIs make this same decision
explicitly (some standardize on a shape like this one; a few even follow
a published standard for it, like RFC 7807's "problem details" format).

**SE lens — validation happens first, before any real work.** Both
checks run *before* `id: 4` is ever created — a general shape worth
naming: fail fast, reject bad input before it can influence anything
else, rather than discovering the problem partway through doing real
work. Every validation check this project writes from here on will
follow this same shape.

**Security lens — this is the first lesson that accepts real user
input, and that changes what "correct" means.** `data.name` currently
only gets checked for *presence* — is it there at all — never for
*content*. Send `{ "name": "<script>alert(1)</script>" }` right now: it
passes validation completely, since a script tag is a perfectly
non-empty string, and comes right back in the `201` response body,
completely unexamined. This is harmless *today*, purely because this
lab currently only ever sends that value back as JSON, and a JSON
string is never executed as code by whatever reads it. But the exact
same unchecked string is the raw material of two real, named
vulnerabilities this series will actually reach: **XSS (Cross-Site
Scripting)** — if a value like this were ever rendered into an HTML
page instead of returned as JSON (a future admin dashboard listing
users, for instance), a browser would treat `<script>` as real,
executable code, not as text, and run whatever an attacker put there;
and **injection** — if a value like this were ever pasted directly into
a raw database command as text (a risk this project will meet for real
once lesson 13 reaches actual SQL), the database could be tricked into
running commands the field's value was never supposed to contain. The
concrete rule worth carrying forward now, before either of those
moments arrives: **data from `request.body` is never automatically
safe just because it passed a presence check** — "is a name provided"
and "is this value safe to use elsewhere" are two completely different
questions, and this lesson has only answered the first one.

---

## Step 5 — Teach the Router About Methods

`GET /users` and `POST /users` share a path but mean opposite things —
the router needs to match on both, not path alone:

```javascript
var routes = [
  { pattern: "/users", method: "GET", handler: getAllUsers },
  { pattern: "/users/:id", method: "GET", handler: getUserById },
  { pattern: "/users", method: "POST", handler: createUser },
];

function handleRequest(request) {
  for (var i = 0; i < routes.length; i = i + 1) {
    var route = routes[i];
    if (route.method !== request.method) continue;
    var params = matchRoute(route.pattern, request.path);
    if (params !== null) {
      request.params = params;
      return route.handler(request);
    }
  }
  return { status: 404, body: "Not found" };
}
```

Send `GET /users` — the full list. Send `POST /users` with a valid body
— a real `201`. Both now live at the identical path, correctly told
apart.

**Walkthrough — `continue`, skipping a route without ending the loop.**
Each `route` now carries its own `method` alongside its `pattern`.
`if (route.method !== request.method) continue;` means: this particular
entry isn't even a candidate — don't bother running `matchRoute` on it
at all, just move on to check the next one. `continue` jumps straight to
the next loop iteration, unlike `return`, which would exit `handleRequest`
entirely — the loop still needs to keep checking the *other* routes.

**PL lens — `continue`, and the sibling keyword it's easy to confuse it
with.** `continue` skips the *rest of the current iteration* and moves on
to the next one — the loop keeps running. Its sibling, `break` (not used
here, but worth knowing by contrast now), exits the loop *entirely*, the
same way `return` exits a function entirely. `continue` says "this one
doesn't apply, try the next"; `break` says "stop looping altogether."
This router needs `continue` specifically because a wrong-method route
should be skipped, not treated as a reason to give up checking the rest
of `routes`.

**Connect to the real world.** This is exactly what a route defined in
Express as `router.get("/users", ...)` alongside `router.post("/users", ...)`
is doing underneath its friendlier syntax: pairing a method with a
pattern, not routing on the path in isolation.

---

## Connect the Pieces

```
server.js   createUser — parses request.body inside try/catch, returns
            400 for invalid JSON, 400 for a missing required field,
            201 only once the data has actually been checked
            routes — each entry now carries a method alongside its
            pattern, since the same path can mean different things
            depending on the method (GET /users vs POST /users)
            handleRequest — skips any route whose method doesn't match,
            via continue, before even attempting a pattern match
```

---

## What Breaks Without This

**No `try`/`catch` around `JSON.parse`**: a client sending malformed
JSON (a real, ordinary mistake — a typo, a truncated request, a bug in
whatever sent it) crashes the *entire* request with an unhandled error,
instead of getting back a clear `400` explaining what went wrong. From
the client's point of view, this looks like the server is broken, when
really the server just never planned for bad input at all.

**Matching on `pattern` alone, without `method`**: without the method
check, whichever of `GET /users` and `POST /users` happens to be listed
*first* in `routes` would silently intercept both — the router would
have no way to tell "list everyone" apart from "create someone new,"
two opposite actions that happen to share the identical path.

---

## Definition of Done

- [ ] `POST /users` with a valid `{ "name": ... }` body returns a `201` with the new user
- [ ] `POST /users` with an empty or malformed body returns a `400`, not a crash
- [ ] `POST /users` with valid JSON but no `name` field returns a `400` naming the missing field
- [ ] `GET /users` and `POST /users` are correctly told apart, even though they share a path
- [ ] You can explain the difference in meaning between the GET and POST HTTP methods
- [ ] You can explain what try/catch does and why JSON.parse specifically can throw
- [ ] You can explain why validation should happen before any other work in a handler, not after
- [ ] You can explain what continue does inside the router's loop, and how it differs from return and from break
- [ ] You can explain the difference between a safe method and an idempotent method, using GET and POST as the examples
- [ ] You can explain the difference between an exception and an ordinary return value as two ways of signaling failure, using createUser's two error paths as the example
- [ ] You can name the two distinct failure modes this lesson identifies and why they need different defenses

---

*Next: getAllUsers, getUserById, and createUser are three loose,
separately-named global functions — and a real backend needs the same
three verbs (list, get one, create) for orders, products, and every
other resource too. Naming every single one by hand (`getAllOrders`,
`getOrderById`, ...) to avoid collisions gets old fast. Controllers are
next.*
