# Backend Lab — Lesson 8 — Services

## What You Will Build

`usersService` — a plain object holding the actual business rules for
what makes a valid user, completely separate from HTTP: no `request`, no
`response`, no status codes, nothing that couldn't run the exact same
way from a script, a test, or a future admin tool that has never heard
of an HTTP request.

---

## What You Need to Know First

Lesson 6's controllers; lesson 5's `try`/`catch` around `JSON.parse` and
the missing-`name` validation currently living inside `createUser`.

---

## Step 1 — Feel the Mixing Problem

`usersController.create`, as lesson 5 and 6 left it, does three
genuinely different jobs in one function:

```javascript
create: function (request) {
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

Job one: read the HTTP request and pull real data out of it (`JSON.parse`).
Job two: decide whether that data is *usable as JSON at all* (the `try`/`catch`).
Job three: decide whether it's a *valid user* — genuinely business logic,
nothing to do with HTTP (a name is required; later, a real backend might
add: names must be under 100 characters, email addresses must look like
email addresses, duplicate accounts aren't allowed). Right now, all
three live inside one function that also happens to know about status
codes.

**SE lens — the felt limit: business logic welded to HTTP, unable to run
anywhere else.** Imagine a future requirement: a script that bulk-creates
users from a CSV file, with no HTTP request anywhere in sight. Right now,
reusing "what makes a valid user" would mean either duplicating the
`!data.name` check somewhere else (lesson 7's DRY problem, again, in a
new place) or *faking* a whole `request` object just to satisfy a
function that never actually needed one. The real rule — "a user needs a
name" — has no life of its own outside `usersController`; it's trapped
inside HTTP-specific code that was never really about HTTP.

**CS lens — this is a layering problem, named precisely.** Two genuinely
different kinds of concern are tangled together: **HTTP concerns**
(parsing a request body, choosing a status code, shaping a response) and
**domain concerns** (what a valid user actually is, independent of how a
request arrived). A **domain**, in this sense, is simply the actual
problem the software exists to solve — for this project, users, orders,
and the rules governing them are the domain; HTTP is just one possible
way of reaching it. Untangling code into distinct layers, each
responsible for one *kind* of concern rather than one *feature*, is
called **layered architecture** — a structural idea, different from (and
compatible with) the controllers/resources split lesson 6 already built.

**CS lens — transport versus process, two orthogonal questions.** *How*
a request physically arrives — HTTP, a message queue, a CLI argument —
is a **transport** concern. *What* should happen once it has arrived —
create a user, given a name — is a **business process** concern. These
two questions are **orthogonal**: independent of each other, each free
to change without requiring the other to change. Right now they're
fused into one function; this lesson's whole job is separating them so
each can vary on its own.

---

## Step 2 — Extract the Business Rule Into a Service

```javascript
var usersService = {
  create: function (name) {
    if (!name) {
      return { success: false, error: "name is required" };
    }
    return { success: true, user: { id: 4, name: name } };
  },
};
```

**Walkthrough — no `request`, no `response`, anywhere.** `usersService.create`
takes one plain value, `name` — a string, nothing else — and returns one
plain object describing what happened. It never reads `request.body`,
never returns a `status`. This function could be called from
`usersController`, from a future test, from a future script, or from a
future CLI tool this project never builds — it has no idea any of those
things exist, and doesn't need to.

**CS lens — pure *for now*, worth being precise about why.** Lesson 1
named **determinism**: the same input always producing the same output,
nothing hidden. `usersService.create("Mike")` happens to be a pure
function today, purely because it happens to have no side effects yet —
not because "a service" is inherently pure as a category. The very next
lesson gives this exact function a real side effect (writing to a
database), at which point it stops being pure, on purpose, without
stopping being a service. What actually matters here, and what won't
change once persistence arrives, is narrower than purity: this function
is **HTTP-independent business logic** — nothing about its call shape
requires an `HttpRequest` or an `HttpResponse` to exist. That
independence is what makes it easy to test in isolation, whether or not
it happens to be pure at any given moment.

**SE lens — one entry point becomes many.** Before this lesson,
`usersController.create` was the *only* way to create a user — one entry
point. `usersService.create` can be called from that controller, but
also from a future test, a future script, or a future second controller
serving the same business logic over a completely different transport
(a message queue, a CLI). A controller is naturally **one entry point**
into the system; a service, once extracted, can have **many** — the
number of ways in doesn't change what the business rule actually is.

**SE lens — business rules tend to outlive their transport.** HTTP
methods, REST conventions, and entire frameworks change across a
project's lifetime far more often than the actual rule "a user needs a
name" does. That rule would be exactly as true if this project were
rebuilt on GraphQL, a message queue, or a CLI tool tomorrow. This is a
large part of *why* separating business logic from HTTP is worth doing
at all: the thing more likely to survive a rewrite is worth insulating
from the thing more likely to change.

**PL lens — a result object, a real, named pattern for expected
failure.** `{ success: false, error: "..." }` or `{ success: true, user: {...} }`
is a **result object** (sometimes called a "Result type" in languages
that build it into the type system directly, like Rust's `Result<T, E>`
or Go's `(value, error)` return pairs) — a single, consistent shape a
caller can check (`if (result.success)`) rather than needing a
`try`/`catch` for something that isn't really an exceptional crash, just
an expected "this didn't work" outcome. This is the same
exceptions-versus-return-values choice lesson 5 first named, applied
deliberately here: a missing name is ordinary, expected, recoverable —
exactly the case lesson 5 said belongs to a return value, not a thrown
exception.

---

## Step 3 — The Controller Becomes a Translator

```javascript
var usersController = {
  create: function (request) {
    var data;
    try {
      data = JSON.parse(request.body);
    } catch (err) {
      return { status: 400, body: { error: "Body must be valid JSON" } };
    }

    var result = usersService.create(data.name);
    if (!result.success) {
      return { status: 400, body: { error: result.error } };
    }
    return { status: 201, body: result.user };
  },
};
```

Send `POST /users` with `{ "name": "Priya" }` — a real `201`, identical
to before. Send `{ "age": 25 }` — a real `400`, `"name is required"`,
identical to before. Nothing observable changed; everything about *how*
it's built did.

**Walkthrough — two different validations, at two different layers, now
visibly distinct.** `JSON.parse` failing is an **HTTP-layer** problem —
the request itself was malformed, before any business rule could even be
consulted. `usersService.create` returning `success: false` is a
**domain-layer** problem — the request was perfectly good HTTP, but the
*data* inside it doesn't satisfy a business rule. These used to be two
`if`/`catch` blocks doing conceptually different jobs, indistinguishable
from each other by their shape alone; now the boundary between them is a
real function call, not just a comment a reader would have to infer.

**SE lens — the controller's whole job, restated precisely.** `usersController.create`
now does exactly three things, in order: pull data out of the request,
hand it to the service, translate whatever the service decides into an
HTTP response. It makes zero business decisions itself — "is this name
valid" is a question only `usersService` answers. This is the same
"clean split of responsibility" lesson 6 named between router and
controller, reapplied one layer deeper: router → controller → service,
each layer translating between the one above it and the one below.

**SE lens — dependency direction, restated from lesson 2, now between
two new layers.** `usersController` knows `usersService` exists — it
calls it by name. `usersService` has no idea `usersController`, or any
controller, exists at all. Dependencies point one direction, downward:
controller → service, never the reverse — the same shape lesson 2 named
between the router and its handlers. This one-way dependency is what
keeps `usersService` reusable from anywhere: nothing about it was ever
written to expect a caller that looks like a controller.

**SE lens — inversion of responsibility: the controller stopped
deciding, and started asking.** Before this lesson, `usersController.create`
*decided*, itself, whether `data.name` was acceptable — the decision and
the HTTP-handling lived in the same place. Now it *asks* `usersService`
and acts on the answer — it has no opinion of its own about what makes a
name valid. Handing a decision off to a lower layer instead of making it
directly is called **inversion of responsibility**, and it's one of the
more significant shifts in this entire lesson: notice that the
controller got *smaller* and *dumber* on purpose, and that's the goal,
not an accident.

**PL/CS lens — the translator pattern, named explicitly.** Every step
this lesson took follows one repeated shape: HTTP in → translate into
plain values → business logic → translate the result back → HTTP out.
A controller whose entire job is translating between a transport format
(HTTP) and plain domain values, in both directions, is doing exactly
what an **adapter** does in software design generally — taking a shape
one side needs and converting it into a shape the other side needs,
without either side needing to know about the other. This project isn't
naming the full pattern this belongs to yet (a later architectural
idea called "ports and adapters" builds directly on exactly this shape),
but the groundwork being laid here is real, not incidental.

**Connect to the real world.** This exact split — a thin controller
translating HTTP into calls against a "service layer" holding the real
business rules — is standard architecture in nearly every serious
backend framework: Spring's `@Service` classes, NestJS's injectable
services, and even Rails' more recent "service object" convention for
logic too complex to leave inside a controller. None of them invented
this from nothing — it's the same tangled-concerns problem, solved the
same way, independently, by nearly every mainstream framework.

---

## Connect the Pieces

```
Raw HTTP request
      |
      v   (Controller: JSON.parse)
Plain data ({ name: "Priya" })
      |
      v   (Service: business rules)
Plain result ({ success, user } or { success, error })
      |
      v   (Controller: choose a status code)
HTTP response ({ status, body })
```

---

## What Breaks Without This

**Reading `result.user` without checking `result.success` first**: when
`usersService.create` returns `{ success: false, error: "..." }`, that
object has no `user` field at all — `result.user.id` would read `.id`
off `undefined`, a real crash, not a graceful `400`. The `if (!result.success)`
check isn't optional ceremony; it's the only thing standing between a
clean error response and an unhandled exception.

**Letting HTTP concepts leak into the service** (for example, having
`usersService.create` read `request.headers` directly, or return a
`status` field itself): the moment the service knows anything about HTTP,
it can no longer run anywhere HTTP doesn't exist — the entire point of
this lesson's split quietly disappears, even though every test written
so far would still pass.

---

## Definition of Done

- [ ] `POST /users` with a valid name still returns a `201`, unchanged from lesson 5
- [ ] `POST /users` with a missing name still returns a `400` with the same message, unchanged from lesson 5
- [ ] `usersService.create` never reads `request` or returns a `status` field
- [ ] You can explain the difference between an HTTP-layer concern and a domain-layer concern, using this lesson's two validations as the examples
- [ ] You can explain why HTTP-independence, not purity itself, is the property that actually matters here
- [ ] You can explain what a result object is and how it relates to lesson 5's exceptions-vs-return-values distinction
- [ ] You can explain what would break if `usersService` read `request.headers` directly
- [ ] You can explain dependency direction between a controller and a service, and why it only points one way
- [ ] You can explain inversion of responsibility, using the controller's shift from deciding to asking as the example
- [ ] You can explain what a domain is and why business rules tend to outlive their transport

---

*Next: `usersService.create` still invents a fixed `id: 4` every time —
nothing is actually being stored anywhere, and every "created" user
vanishes the moment the request ends. Persistence is next: giving this
project real, durable data for the first time.*
