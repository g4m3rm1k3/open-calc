# Backend Lab — Lesson 10 — The Query Problem

## What You Will Build

`GET /users?name=Priya` — a way to ask storage a specific question,
answered by a small, general-purpose engine you write by hand, instead
of one `if` check per field anyone ever wants to search by.

---

## What You Need to Know First

Lesson 9's `db.getAllUsers()`, always returning everyone. Lesson 4's
query parameters and its "every value arrives as a string" rule. Lesson
2's dispatch table, replacing a chain of `if`s with a general mechanism.

---

## Step 1 — Feel the Wall, One More Time

`db.getAllUsers()` only knows how to do one thing: return everyone.
There's no way yet to ask "just the user named Priya," or "just user id 7."
The naive fix, the way lesson 2 first tried routing:

```javascript
function findUserByName(name) {
  var users = db.getAllUsers();
  for (var i = 0; i < users.length; i = i + 1) {
    if (users[i].name === name) {
      return users[i];
    }
  }
  return null;
}
```

This works — for exactly one field. Searching by id needs an
almost-identical `findUserById`; searching by email needs
`findUserByEmail`; every new field this project ever wants to search by
needs its own new, nearly-identical function.

**SE lens — the exact shape of lesson 2's problem, showing up again in a
new place.** Lesson 2's `if`/`else` chain couldn't scale because every
new route needed its own hand-written branch. This is the identical
structural problem, for searching instead of routing: every new
*field* needs its own hand-written function, each one differing only in
which property it happens to compare.

---

## Step 2 — A General Match, Instead of One Match Per Field

```javascript
function matchesFilters(user, filters) {
  var filterKeys = Object.keys(filters);
  for (var i = 0; i < filterKeys.length; i = i + 1) {
    var key = filterKeys[i];
    if (String(user[key]) !== filters[key]) {
      return false;
    }
  }
  return true;
}
```

**Walkthrough — `Object.keys(filters)`, reading a set of keys you don't
know in advance.** Every object read so far in this project has had
known, fixed field names — `request.path`, `user.name`. `filters` is
different: it might have a `name` key, an `id` key, both, or neither,
decided entirely by whoever calls this function. `Object.keys(filters)`
returns a real array containing every key currently on `filters`, as
strings, in no particular guaranteed order — a way to work with an
object's *shape* generically, without knowing its fields ahead of time.

**Walkthrough — `user[key]`, the same bracket-access idea from lesson 2,
applied to a variable key instead of a variable path.** `user[key]`
reads whichever field `key` currently holds the name of — if `key` is
`"name"`, `user[key]` is the same value as `user.name`; the property
being read is decided by a variable, not typed literally. This is the
exact same mechanic `routes[request.path]` used back in lesson 2's
dispatch table, reused here for a different purpose.

**PL lens — `String(user[key])`, and why the conversion has to happen
here, not just at the query-parsing boundary.** Lesson 4 established
that every query parameter arrives as a string, even ones that look
numeric. `filters.id`, if present, will be `"7"` — a string. `user.id`,
stored by `db.insertUser`, is a real number — `7`. Comparing `7 !== "7"`
directly would be `true` (they're never equal, being different types) —
`String(user[key])` converts the *stored* value to a string before
comparing, so a numeric field and a string query parameter can actually
match. This is the reverse of lesson 4's `Number(limit)` conversion,
solving the identical family of problem from the other direction.

**CS lens — a predicate, named precisely.** A function that takes a
value and returns `true` or `false` — answering one yes/no question
about that value — is called a **predicate**. `matchesFilters` is a
predicate factory of sorts: given a `filters` object, it decides,
per-user, whether that one user satisfies every filter provided. When
`filters` is `{}` (no query parameters at all), `Object.keys(filters)`
is an empty array, the loop never runs even once, and the function falls
through to `return true` — every user matches nothing being asked for at
all, exactly the behavior wanted for a plain `/users` with no filters.

---

## Step 3 — Search the Whole Collection

```javascript
function findUsers(users, filters) {
  var results = [];
  for (var i = 0; i < users.length; i = i + 1) {
    if (matchesFilters(users[i], filters)) {
      results.push(users[i]);
    }
  }
  return results;
}

var usersService = {
  search: function (filters) {
    return findUsers(db.getAllUsers(), filters);
  },
  create: function (name) {
    if (!name) {
      return { success: false, error: "name is required" };
    }
    var user = db.insertUser(name);
    return { success: true, user: user };
  },
};

var usersController = {
  getAll: function (request) {
    return { status: 200, body: usersService.search(request.query) };
  },
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

Create a couple of users first (`POST /users`), then send `GET /users` —
everyone. Send `GET /users?name=Priya` — just the matching user (or
users, if more than one shares that name). Send `GET /users?id=1` — just
that one user, `id` compared as a string against a real stored number,
correctly.

**Walkthrough — `usersController.getAll` passing `request.query`
straight through, unexamined.** The controller never decides what
counts as a filterable field — it hands `request.query` to
`usersService.search` exactly as it arrived, and `matchesFilters`
figures out what to do with whatever keys happen to be present. Adding
support for filtering by a brand-new field, `email` say, needs *zero*
new code anywhere in this chain — the mechanism already handles any key
that happens to show up.

**SE lens — the open/closed principle, reapplied to querying this
time.** Lesson 2 built a router that never needed editing to add a new
route. This lesson built a search mechanism that never needs editing to
search by a new field — the same property, earned the same way: replace
one hardcoded case per possibility with one general mechanism driven by
data.

**Connect to the real world.** Real APIs do exactly this: GitHub's
search endpoints, Stripe's list endpoints, and most REST APIs generally
accept arbitrary query parameters as filters, matched generically against
whatever fields exist — none of them hand-write a new code path per
filterable field either. A real production version would add real
safeguards this lesson skips honestly: limiting which fields are
filterable (so a client can't probe arbitrary internal fields), and
using a real database's own query language (lesson 13) instead of
looping through an array in JavaScript — but the underlying shape,
data-driven filtering instead of one-off checks, is the same idea.

---

## Connect the Pieces

```
request.query  -->  matchesFilters (a predicate, one user at a time)
                -->  findUsers (loops the whole collection, keeps matches)
                -->  usersService.search
                -->  usersController.getAll
```

---

## What Breaks Without This

**Forgetting `String(...)` around `user[key]`**: `user.id` (a number)
compared against `filters.id` (always a string) is never equal, no
matter what id is actually requested — `GET /users?id=1` would silently
return zero results, every time, for a request that looks completely
reasonable.

**Comparing with `==` instead of `!==` after `String(...)`, or forgetting
to convert on both sides**: type-coercion bugs in comparisons are quiet
by nature — nothing throws, a comparison simply evaluates to the wrong
boolean, and the *effect* (a filter that never matches, or matches too
much) is the only visible symptom.

---

## Definition of Done

- [ ] `GET /users` with no query string still returns everyone
- [ ] `GET /users?name=Priya` returns only users with that exact name
- [ ] `GET /users?id=1` returns the correct user, despite `id` being a stored number compared against a string
- [ ] You can explain what `Object.keys` returns and why this function needed it
- [ ] You can explain what a predicate is, using `matchesFilters` as the example
- [ ] You can explain why `String(user[key])` is necessary, connecting it back to lesson 4's "everything from a query string is a string" rule
- [ ] You can explain why adding a new filterable field requires zero new code in this mechanism

---

*Next: `usersService` now talks to `db` directly, inside the same object
that also holds validation rules — two more concerns quietly sharing one
place. Repositories are next: giving data access its own layer,
separate from business rules, for the same reasons controllers and
services were split apart.*
