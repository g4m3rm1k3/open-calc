# Backend Lab — Lesson 3 — Path Parameters

## What You Will Build

A route that answers `/users/1`, `/users/2`, and `/users/anything-at-all`
— one route, not one per user — by teaching the router to recognize a
*shape* of path, not just a fixed string.

---

## What You Need to Know First

Lesson 2's `routes` dispatch table and the vocabulary it introduced:
route, handler, router. The router currently does exact-string lookups
only — `routes[request.path]` — which is about to run into a real wall.

---

## Step 1 — Feel the Wall

`/users` returns every user. A real API also needs to answer for *one*
specific user — `/users/1` should return just user 1, `/users/2` just
user 2. Try registering that the only way you currently know how:

```javascript
var routes = {
  "/users": getAllUsers,
  "/users/1": getUserOne,
  "/users/2": getUserTwo,
};
```

This technically works for exactly the two users who happen to exist
right now. It falls apart the moment a third user signs up — nobody is
going to edit `server.js` and redeploy every time someone new signs up
for the app. The problem isn't the code's tidiness this time; it's that
the fix is structurally impossible to keep up with. `routes` needs to
recognize `/users/`, followed by *some id*, as a single pattern — not
memorize every id one at a time.

**SE lens — a felt limit, not a style complaint.** Lesson 2's problem
was that the `if`/`else` chain required editing existing code for every
new route. This problem is worse: there is no number of dispatch-table
entries that could ever be enough, because user ids aren't known in
advance — they're created by other people, while the server is already
running. Any fix has to work for ids that don't exist yet at the moment
the code is written.

**CS lens — generalization: solving the whole shape of the problem, not
one instance of it.** `"/users/1": getUserOne` solves exactly one case.
What's actually needed is a rule that works for *every* case at once,
including ones that don't exist yet — a **general** solution, rather than
a **special-cased** one enumerating each specific input by hand. This
distinction — one rule covering an entire category of inputs, versus a
growing list of individually-handled cases — is worth recognizing by
name: most of the real engineering work in this lesson is finding the
general rule, not the specific examples that motivate it.

---

## Step 2 — Strings Are Made of Pieces

Before fixing the router, one new fact about strings.

```javascript
var path = "/users/1";
var parts = path.split("/");
console.log(parts);
```

**Walkthrough.** `.split("/")` breaks a string into an array of smaller
strings, cutting at every place the given separator appears. `"/users/1"`
splits into `["", "users", "1"]` — the first entry is an empty string
because the path starts with `/`, so there's "nothing" before the very
first slash. This isn't a special case to memorize; it's just what
cutting a string at every `/` actually produces, including at the edges.

**CS lens — tokenizing, a small case of a big idea.** Breaking a
continuous piece of text into a sequence of meaningful pieces is called
**tokenizing**, and it shows up everywhere in real software: a JavaScript
engine tokenizes your source code into words and symbols before it can
run it at all; a URL path is tokenized into **segments** — `"users"` and
`"1"` are the two segments of `/users/1`. You don't need a formal parser
for this lesson's job — `.split("/")` is tokenizing enough — but the word
is worth having, because "segment" is about to become the router's whole
vocabulary for matching paths.

**SE lens — a small, general-purpose utility, reused for more than one
problem.** `.split("/")` isn't specific to routing at all — it's a
plain, general string operation that happens to solve this problem well.
This is the same reuse idea lesson 1 introduced for functions, one level
up: rather than writing routing-specific parsing code from scratch, this
lesson builds on a small, generic tool the language already provides.
The same `.split("/")` idea will resurface, doing a similar job, when
this series reaches query strings.

---

## Step 3 — Match Segment by Segment

The core idea: a route pattern like `"/users/:id"` and an incoming path
like `"/users/1"` should be compared **piece by piece**, not as whole
strings — and a piece in the pattern that starts with `:` should match
*any* piece in the real path, while remembering what that piece actually
was.

```javascript
function matchRoute(pattern, path) {
  var patternParts = pattern.split("/");
  var pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  var params = {};
  for (var i = 0; i < patternParts.length; i = i + 1) {
    var patternPart = patternParts[i];
    var pathPart = pathParts[i];

    if (patternPart[0] === ":") {
      var paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}
```

**CS lens — this is an algorithm, precisely, not just "some code."** An
**algorithm** is a precise, finite, step-by-step procedure that produces
a correct answer for *any* valid input, not just the examples used to
design it. Every function this project has written so far mapped fairly
directly onto one specific job; `matchRoute` is the first genuinely
general procedure — it has to correctly handle a pattern and path it has
never seen, which is exactly what Step 1's "generalization" was asking
for. Worth noticing the shift: this project has started writing
algorithms, not just application-specific logic.

**Walkthrough — the length check comes first, on purpose.** `"/users/:id"`
splits into 3 segments (`["", "users", ":id"]`); `/users/1/extra` splits
into 4. Different lengths mean the shapes can't possibly match — a
pattern with 3 segments was never going to match a path with 4, no matter
what any individual segment looks like, so this check is the fastest way
to reject an obvious non-match before doing any real comparison work.
Returning immediately the moment a mismatch is certain, rather than
continuing to check things that can no longer matter, is called an
**early return** (or **short-circuiting**) — the rest of the function
simply never runs for an input that's already been ruled out.

**PL lens — `null`, chosen on purpose, as a sentinel value.** `matchRoute`
returns `null` to mean "this pattern didn't match," and a real object
(possibly empty, `{}`) to mean "it did." A specific, reserved value used
to signal a distinct out-of-band condition — "no match," "not found," "end
of list" — separately from any real, ordinary result, is called a
**sentinel value**. `null` is a reasonable choice here specifically
because a real, successful match always produces an *object* (even with
zero captured params), so `null` can never be confused with a genuine
result the way `undefined` (JavaScript's own "nothing was ever set" value,
already met in lesson 2) might be more ambiguous to read at a glance.

**Walkthrough — the loop, comparing one pair of segments at a time.**
For each position `i`, `patternPart` is the expected shape and `pathPart`
is the real value found there. `patternPart[0]` reads the very first
**character** of the pattern segment — the exact same square-bracket,
count-from-zero indexing lesson 1 taught for arrays applies to strings
too: a string can be indexed like an ordered list of its own characters,
position `0` being the first one. If that first character is a colon,
this position is a **placeholder**, meaning "match anything here, and
remember it," not "match this literal text." `patternPart.slice(1)`
removes that leading colon, turning `":id"` into the plain name `"id"`,
which becomes the key under which the real value gets stored in `params`.
If the segment *isn't* a placeholder, it has to match the real path
exactly (`patternPart !== pathPart` returning `null` the moment it
doesn't) — `"users"` must literally see `"users"`, or this isn't the
right route at all.

**CS lens — this is pattern matching, named precisely.** Comparing a
piece of data against a template that contains both fixed parts and
"match anything" placeholders, and extracting the matched pieces, is
called **pattern matching**. It's not unique to routers — it's the same
underlying idea behind regular expressions, and behind the `switch`-like
pattern matching built into languages like Rust or Python. Here, it's
built from nothing but `.split()`, a loop, and an `if` — worth seeing
built by hand once, since every framework's fancier route syntax
(`/users/:id`, `/users/{id}`, `/users/<id>`) is running some version of
exactly this underneath.

**Connect to the real world — a colon is a tiny, invented convention,
the same idea behind every templating syntax.** Nothing about JavaScript
gives `:` any special meaning inside a string — `matchRoute` is the only
thing that decides a leading colon means "placeholder." This project has
just invented its own small, local convention, the exact same kind of
idea behind `{{name}}` in Handlebars, `${name}` in a JS template literal,
or `{id}` in Python's f-strings and Flask's routes: pick a character or
symbol no ordinary data would use, and give it a special meaning your
own code understands. Every one of those is a tiny, purpose-built
language living inside a bigger one.

**SE lens — matching logic lives in its own function, separate from the
router that uses it.** `matchRoute` doesn't loop over `routes`, and it
doesn't know what a handler is — it only answers one question: "does
this one pattern match this one path?" Keeping that question in its own
function, separate from Step 4's job of trying it against a *list* of
routes, means `matchRoute` can be tested, read, and trusted on its own,
one pattern at a time, before it's ever combined with anything else.

---

## Step 4 — Wire It Into the Router

`routes` can no longer be a plain lookup table, since patterns need to be
*compared*, not looked up by exact key. It becomes a list instead:

**CS lens — trading away constant time, on purpose, for a real reason.**
Lesson 2's `routes[request.path]` was constant time — the same cost
whether there were 3 routes or 3,000. A list, checked one entry at a time
in `handleRequest`'s loop, is back to the same cost class as lesson 1's
original `if`/`else` chain: work that grows directly with the number of
routes. This is a genuine step backward in raw lookup speed, not an
oversight — a dictionary can only look up an *exact* key, and a pattern
like `/users/:id` isn't one fixed key, it's a shape that has to be
*compared* against. Trading constant-time lookup for the ability to
match a shape is a real, deliberate cost, worth naming honestly rather
than pretending this version is strictly better than lesson 2's in every
way.

```javascript
var routes = [
  { pattern: "/users", handler: getAllUsers },
  { pattern: "/users/:id", handler: getUserById },
];

function handleRequest(request) {
  for (var i = 0; i < routes.length; i = i + 1) {
    var route = routes[i];
    var params = matchRoute(route.pattern, request.path);
    if (params !== null) {
      request.params = params;
      return route.handler(request);
    }
  }
  return { status: 404, body: "Not found" };
}

function getAllUsers(request) {
  return { status: 200, body: [{ id: 1, name: "Mike" }, { id: 2, name: "Sam" }] };
}

function getUserById(request) {
  var id = request.params.id;
  return { status: 200, body: { id: id, name: "User " + id } };
}
```

Send `/users/1` and `/users/42` — both now return a real, per-id response
from *one* route. Send `/users` — still matches the first, exact-only
route, since `matchRoute` requires the segment counts to match and `:id`
is never involved when there's no third segment at all.

**Walkthrough — `request.params`, a new field, attached at match time.**
`matchRoute` returns an object like `{ id: "1" }` when it matches. That
object gets attached onto `request` itself, under a new key, `params` —
the exact same "add a field to an object" mechanic lesson 1 already
taught with dot notation, just done by the router's code instead of by
the client. By the time `getUserById` runs, `request.params.id` is
already sitting there, ready to read. This is reference semantics,
exactly as lesson 1 named it: `request` inside `handleRequest` and
`request` inside `getUserById` are not two separate objects — they're
the identical object, referenced from two different functions. Mutating
it in the router (`request.params = params`) is only visible to
`getUserById` afterward *because* nothing was ever copied.

**SE lens — order matters now, in a way it didn't in lesson 2.** `routes`
is a **list**, checked top to bottom, and the first pattern that matches
wins — unlike a dispatch table, where key order never mattered because
lookup was direct. If `"/users/:id"` were listed *before* `"/users"`,
`/users` itself would still match the first, exact-only entry correctly
in this particular example — but in general, a broader pattern listed
before a narrower, more specific one can silently steal requests meant
for the specific one. Specific-before-general is the safe default,
worth stating now, before it causes a real bug later in this series.

---

## Connect the Pieces

```
server.js   matchRoute — compares one path against one pattern,
            segment by segment, returning captured params or null
            routes — now a list of { pattern, handler } pairs, checked
            in order, since patterns must be compared, not looked up
            handleRequest — loops routes, calls matchRoute on each,
            attaches params to request, calls the first handler that matches
            getUserById — reads request.params.id, set by the router
```

---

## What Breaks Without This

**Forgetting the segment-length check**: without it, a shorter loop
using only `patternParts.length` as its bound would let `/users/:id`
"match" `/users/1/2/3` too — the loop simply never looks at the extra
segments, so nothing ever notices they exist. The bug wouldn't show up
as an error; it would show up as a route quietly matching requests it
should have rejected.

**Comparing the whole segment array with `===` instead of segment by
segment**: two arrays that look identical are still two different array
values in this language — comparing them directly with `===` is always
`false`, even when every element matches. This is why the loop compares
`patternPart !== pathPart` (individual strings) rather than
`patternParts !== pathParts` (whole arrays) — a mistake easy to make
once, worth naming explicitly so it isn't made twice.

---

## Definition of Done

- [ ] `/users/1`, `/users/2`, and any other `/users/<id>` all return a per-id response through one route
- [ ] `/users` (no id) still correctly returns the full list, unaffected by the new pattern
- [ ] An unmatched path still correctly returns a 404
- [ ] You can explain what `.split("/")` does to a path string and why the result has an empty first entry
- [ ] You can explain what a placeholder segment (`:id`) means inside a route pattern
- [ ] You can explain why the segment-count check has to happen before comparing individual segments
- [ ] You can explain why more specific patterns should be listed before more general ones
- [ ] You can explain why `matchRoute` counts as an algorithm, not just "some code"
- [ ] You can explain what a sentinel value is, using `matchRoute`'s `null` return as the example
- [ ] You can explain why this lesson's router is slower, in the worst case, than lesson 2's dispatch table, and why that trade was necessary
- [ ] You can explain reference semantics using `request.params` as the example, connecting it back to lesson 1

---

*Next: `/users/1` selects one user by id, but a real API also needs to
ask questions about a whole collection at once — `/users?limit=10`. Query
parameters teach the router to read information that lives after the
`?`, separate from the path entirely.*
