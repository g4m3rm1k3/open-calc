# Backend Lab — Lesson 7 — Middleware

## What You Will Build

A **middleware pipeline** — shared logic (logging every request, then
rejecting unauthenticated ones) that runs once, before any controller
method, without copying that logic into every handler this project has
or will ever write.

---

## What You Need to Know First

Lesson 6's controllers and `routes` list; lesson 2's first-class
functions and callbacks; lesson 3's `null`-as-sentinel and early return.

---

## Step 1 — Feel the Duplication

A real requirement: log every request's method and path, for every
route, before it's handled. The only tool available so far is adding a
line to each handler:

```javascript
var usersController = {
  getAll: function (request) {
    console.log(request.method + " " + request.path);
    return { status: 200, body: [{ id: 1, name: "Mike" }] };
  },
  create: function (request) {
    console.log(request.method + " " + request.path);
    var data = JSON.parse(request.body);
    if (!data.name) return { status: 400, body: { error: "name is required" } };
    return { status: 201, body: { id: 4, name: data.name } };
  },
};
```

The identical line, copied into every method — and every future method,
on every future controller, needs the same line added by hand, forever.

**SE lens — DRY, named formally, restated from lesson 1.** Lesson 1
introduced *why* functions exist: write logic once, reuse it by name,
fix it in one place. This is the exact same principle, failing: the
logging line isn't reused by name at all — it's retyped, identically,
everywhere it's needed. **DRY** ("Don't Repeat Yourself") is the formal
name for this specific discipline: every piece of knowledge in a system
should have one single, authoritative place it's expressed, not copies
scattered wherever it's needed. Fixing a typo in the log format later
would mean finding and fixing every single copy — the exact cost lesson
1 already named as the whole reason functions were worth learning in the
first place.

**CS lens — a cross-cutting concern, named precisely.** Logging isn't
*about* users, or orders, or any one resource — it applies identically
across every single route, cutting across all of them at once. Concerns
like this — behavior that applies broadly across a system rather than
belonging to any one feature — are called **cross-cutting concerns**.
Logging is the simplest example; real backends have several more:
rate-limiting, request timing, CORS headers, compression. None of them
are "business logic" the way `createUser` is — they're infrastructure
that happens to need to run on nearly everything.

---

## Step 2 — A Second Requirement Makes It Worse

A second real requirement: `POST /users` should be rejected unless the
request proves who's making it. The only tool still available is the
same one:

```javascript
var usersController = {
  getAll: function (request) {
    console.log(request.method + " " + request.path);
    return { status: 200, body: [{ id: 1, name: "Mike" }] };
  },
  create: function (request) {
    console.log(request.method + " " + request.path);
    if (!request.headers.Authorization) {
      return { status: 401, body: { error: "Authentication required" } };
    }
    var data = JSON.parse(request.body);
    if (!data.name) return { status: 400, body: { error: "name is required" } };
    return { status: 201, body: { id: 4, name: data.name } };
  },
};
```

`create` now opens with *two* unrelated concerns stacked in front of its
actual job, and every future write-style endpoint (`updateUser`,
`deleteUser`, `createOrder`) will need the identical two lines prepended,
by hand, again.

**SE lens — the open/closed principle, failing for a third time in this
series.** Every time a new cross-cutting requirement shows up, the fix
so far has been to edit every handler that needs it — the exact "add a
new X requires editing existing code" test lesson 2 first named for
routing, and lesson 6 named again for organization. This lesson's
version of the same recurring problem: cross-cutting requirements
currently have nowhere to live *except* inside the handlers they cut
across.

---

## Step 3 — Extract the Shared Logic, Call It Once

The router already sees *every* request, before any handler runs.
Logging belongs there, once — not copied into every handler:

```javascript
function logRequest(request) {
  console.log(request.method + " " + request.path);
  return null;
}

function handleRequest(request) {
  logRequest(request);

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

Every controller method goes back to containing *only* its own actual
job — logging is gone from `usersController` entirely, called exactly
once, in exactly one place.

**Walkthrough — `logRequest` returning `null`, on purpose, even though
nothing reads it yet.** `logRequest(request)` is called in
`handleRequest`, but its return value is thrown away — `logRequest(request);`
alone, not `return logRequest(request);`. Returning `null` anyway, rather
than nothing at all, is deliberate setup for Step 4: a real convention is
about to be built where a shared function's return value *does* matter
— `null` will come to mean "nothing stopped this request, continue" —
and establishing that convention now, even before it's load-bearing,
means the next function written this way slots in without changing
`logRequest` at all.

---

## Step 4 — A Middleware That Can Stop the Request

Logging never needs to interrupt a request — auth-checking does. That
needs a real convention: a shared function can either say "continue" (`null`)
or say "stop, here's the response" (a real object):

```javascript
function requireAuth(request) {
  if (request.path === "/users" && request.method === "POST" && !request.headers.Authorization) {
    return { status: 401, body: { error: "Authentication required" } };
  }
  return null;
}

var middleware = [logRequest, requireAuth];

function handleRequest(request) {
  for (var i = 0; i < middleware.length; i = i + 1) {
    var result = middleware[i](request);
    if (result !== null) {
      return result;
    }
  }

  for (var j = 0; j < routes.length; j = j + 1) {
    var route = routes[j];
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

Send `GET /users` — logs, then a real `200`. Send `POST /users` with no
`Authorization` header set — a real `401`, and `createUser` never runs at
all. Add an `Authorization` header (in the Postman panel's new **Headers**
section, above the body) with any value, send again — a real `201`.

**Walkthrough — the middleware loop, and why it stops the moment
anything isn't `null`.** Each function in `middleware` is called, in
order, with the same `request`. `if (result !== null) { return result; }`
means: the moment any one of them returns something other than `null`,
`handleRequest` returns that value immediately — the route-matching loop
below never even runs. `logRequest` always returns `null`, so it never
stops anything; `requireAuth` returns a real response *only* when its
one specific condition is true, letting every other request pass through
untouched.

**CS lens — a function each named `middleware` is called, precisely:
this is the Chain of Responsibility pattern.** A sequence of independent
handlers, each given the chance to either handle a request itself or
pass it along to the next one in line, is a real, named design pattern
called **Chain of Responsibility**. Each middleware function here is one
link in that chain: given the request, decide "is this mine to stop?" —
if not, implicitly hand it to whichever middleware comes next by
returning `null`. This is a formal pattern with a name, not an
improvised trick — worth recognizing the shape now that it's been built
by hand once.

**CS lens — a pipeline that can stop early, extending lesson 4's
definition.** Lesson 4 named a **pipeline**: a sequence of stages, each
transforming a value and passing it forward. This pipeline is a
refinement of that shape: instead of every stage always running, each
stage can also *end* the pipeline early by returning a real response —
the exact same **early return**/short-circuiting idea lesson 3 named for
`matchRoute`, applied here across an entire sequence of functions instead
of within just one. `null` is doing the identical sentinel-value job
lesson 3 already named too, just meaning "continue" here instead of "no
match."

**SE lens — cross-cutting concerns finally have somewhere to live.**
Both requirements from Steps 1 and 2 are now handled in exactly one
place each, completely separate from `usersController`, which has gone
back to containing nothing but its own actual job. Adding a third
concern — rate limiting, say — means writing one more function and
adding it to `middleware`; nothing about any existing handler, or any
existing middleware function, ever needs to change. This is the
open/closed principle, satisfied again, for cross-cutting concerns this
time instead of routes (lesson 2) or organization (lesson 6) — the same
shape, reapplied at a new kind of problem.

**Security lens — this "auth" is a stand-in, not real authentication,
named honestly now.** `requireAuth` only checks *whether* an
`Authorization` header was sent at all — not whether its value is
correct, not whether it belongs to a real, registered user, and nothing
about it is actually secret or verifiable. This is a deliberately
simplified placeholder, standing in for the real mechanism (passwords,
hashing, sessions or tokens) a much later lesson in this series actually
builds. Treat this middleware as proof that the *pipeline* mechanism
works, not as a real security boundary — real authentication needs to
verify an identity, not just check that some value showed up in some
field.

**Honest limitation — header names are case-sensitive here, unlike a
real server.** Real HTTP treats header names as case-insensitive — a
real server would treat `Authorization` and `authorization` as the exact
same header. This lab's `request.headers` is a plain JavaScript object,
and plain object keys *are* case-sensitive — `request.headers.Authorization`
and `request.headers.authorization` read two different (usually
different) fields here. Worth testing directly, and worth knowing the
gap exists, rather than assuming this lab matches real HTTP exactly in
every detail.

---

## Step 5 — Order Is a Real Decision, Not an Accident

`middleware` lists `logRequest` before `requireAuth` — on purpose.

**SE lens — why logging runs first.** If `requireAuth` ran first, a
rejected, unauthenticated `POST /users` would never reach `logRequest`
at all — the *attempt* would leave no trace anywhere. Logging first means
every request gets recorded, including ones that get rejected a moment
later — often exactly the requests most worth having a record of. Order
inside a middleware list is a real design decision with real
consequences, not an arbitrary detail — the same "order matters" lesson
3 already named for route patterns, showing up again here for a
completely different reason.

---

## Connect the Pieces

```
Client  -->  middleware[0]  -->  middleware[1]  -->  ...  -->  Router  -->  Handler  -->  Response
             (logRequest,        (requireAuth,
              always null)        null or a real response)
```

**Connect to the real world.** This exact shape is what Express calls
`app.use(middleware)`, what Django calls a middleware class, what
ASP.NET Core builds as its request pipeline, and what Java's Servlet API
calls a Filter — a request passing through an ordered chain of shared
functions before reaching the code that actually handles it, any one of
which can stop the chain early. The "return `null`/return a response"
convention here is this lab's own simplified version — many of those
real frameworks use a `next()` callback instead ("call this to continue
to the next one") rather than a return value, but the underlying shape
— an ordered chain, each link deciding whether to pass the request
along — is the exact same idea underneath either convention.

---

## What Breaks Without This

**Forgetting to check `result !== null` and returning it unconditionally**
(`return result;` instead of `if (result !== null) { return result; }`):
`logRequest` runs first and always returns `null` — an unconditional
`return result;` hands that `null` straight back out of `handleRequest`
itself, on the very first middleware call, before `requireAuth` or any
route ever runs. The Response tab doesn't show an error for this — it
shows "Your code ran, but never sent a response back," the exact same
message lesson 1 already explained for a handler that forgets `return`
entirely. The cause is different (a missing `if`, not a missing
`return`), but the lab surfaces it identically, since both boil down to
the same thing: `handleRequest` producing `null` instead of a real
`{ status, body }` object.

**Listing `requireAuth` before `logRequest`**: not a crash, but a real,
quiet loss — every rejected, unauthenticated request stops at
`requireAuth` and never reaches `logRequest`, leaving no record that the
attempt ever happened. A security-relevant gap that produces no error
and no warning, exactly the kind of bug that's only noticed once the
missing log is actually needed.

---

## Definition of Done

- [ ] `GET /users` still works and is logged
- [ ] `POST /users` with no `Authorization` header returns a real `401`, and `createUser` never runs
- [ ] `POST /users` with an `Authorization` header set (any value) succeeds exactly as it did before this lesson
- [ ] You can explain DRY and how it names the exact problem duplicated logging created
- [ ] You can explain what a cross-cutting concern is, using logging and auth as the two examples
- [ ] You can explain why `logRequest` returns `null` even though nothing used its return value at first
- [ ] You can explain the Chain of Responsibility pattern, using the `middleware` array as the example
- [ ] You can explain how this lesson's pipeline extends lesson 4's pipeline definition with early exit
- [ ] You can explain why this lesson's "auth" is not real authentication
- [ ] You can explain why `logRequest` is listed before `requireAuth`, and what would go quietly wrong if the order were reversed

---

*Next: `usersController.create` still mixes together reading the
request, validating it, and deciding what a "user" actually is — three
different jobs, one function. Services are next: separating what a
request needs answered from the actual business logic that answers it.*
