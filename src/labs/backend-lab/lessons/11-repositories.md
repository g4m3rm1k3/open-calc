# Backend Lab — Lesson 11 — Repositories

## What You Will Build

`usersRepository` — an object whose entire job is knowing how to fetch
and store user data, hiding `db` and the query-matching engine behind a
small, stable set of methods, so `usersService` never has to know
*how* storage actually works, only *that* it can ask for data and get it.

---

## What You Need to Know First

Lesson 9's `db.getAllUsers()`/`db.insertUser(name)`. Lesson 10's
`findUsers`/`matchesFilters`. Lesson 8's controller/service split — this
lesson performs the same kind of split one layer deeper.

---

## Step 1 — Feel the Tangling, One Layer Deeper

```javascript
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
```

`usersService` now does two genuinely different jobs: deciding business
rules (is this name valid?) and knowing exactly how to fetch and store
data (`db.getAllUsers()`, `findUsers(...)`, `db.insertUser(...)`). This
is the identical shape lesson 8 solved between HTTP and business logic —
showing up again, one layer further down, between business logic and
data access.

**SE lens — the felt limit: business rules can't change independently
of storage details.** Imagine `db` is replaced by a real SQL database
(lesson 13, and it will be) — every method in `usersService` that
touches `db` or calls `findUsers` would need to change, even though "a
user needs a name" hasn't changed even slightly. The business rule and
the storage mechanism are currently forced to change together, for
reasons that have nothing to do with each other.

---

## Step 2 — Extract a Repository

```javascript
var usersRepository = {
  findAll: function (filters) {
    return findUsers(db.getAllUsers(), filters);
  },
  insert: function (name) {
    return db.insertUser(name);
  },
};
```

**CS lens — the repository pattern, named precisely.** A **repository**
is an object whose only job is translating between "get me data matching
these criteria" / "store this new thing" and whatever the actual storage
mechanism happens to be underneath. `usersRepository` doesn't know or
care whether `db` is a plain array, a `Map`, or — starting next lesson —
real SQL; it just exposes a small, storage-agnostic vocabulary
(`findAll`, `insert`, and later `findById`, `update`, `delete`) that
never needs to change no matter what's actually behind it.

**CS lens — CRUD, the standard vocabulary this vocabulary is drawn
from.** **Create, Read, Update, Delete** — CRUD — names the four basic
operations almost every resource in almost every backend needs.
`usersRepository.insert` is Create; `findAll` is Read. Later lessons will
add Update and Delete to this exact repository, using this exact same
naming convention — a real, industry-standard vocabulary, not this
project's own invention.

---

## Step 3 — The Service Talks Only to the Repository

```javascript
var usersService = {
  search: function (filters) {
    return usersRepository.findAll(filters);
  },
  create: function (name) {
    if (!name) {
      return { success: false, error: "name is required" };
    }
    var user = usersRepository.insert(name);
    return { success: true, user: user };
  },
};
```

Send the exact same requests lesson 10 verified — `POST /users`,
`GET /users?name=Priya` — identical results. Nothing observable changed;
`usersService` no longer mentions `db` or `findUsers` anywhere at all.

**Walkthrough — what actually moved, and what didn't.** `usersService.create`
still decides *whether* a name is valid — that never left. It no longer
decides *how* a user actually gets stored — that's `usersRepository.insert`'s
job now, exclusively. The business rule and the storage mechanism can now
change completely independently: swapping `db` for real SQL only touches
`usersRepository`; adding a new validation rule only touches `usersService`.

**SE lens — the real payoff: a fake repository, swapped in for testing,
with zero changes to `usersService`.** Because `usersService` only ever
calls `usersRepository.findAll`/`.insert` — never `db` directly — a test
could hand it a *completely fake* repository instead: a plain object
with the same two method names, backed by nothing but a local array,
with no `db` bridge involved at all. `usersService`'s validation logic
could be tested in complete isolation this way, without touching real
storage — this only works because `usersService` depends on a *shape*
(two method names), not on `db` specifically. This exact idea — swapping
which real object gets used, as long as it has the right shape — is
what the next lesson, dependency injection, builds a real mechanism for.

**Connect to the real world.** The repository pattern is a real, named,
extremely common architecture: Spring Data's `Repository` interfaces,
Laravel's repository classes, and Entity Framework's `DbSet`s all exist
specifically to hide a real database behind a small, storage-agnostic
API — precisely the role `usersRepository` plays here, at a much smaller
scale.

---

## Connect the Pieces

```
Request
   |
Controller   (HTTP: status codes, parsing)
   |
Service      (business rules: is this valid?)
   |
Repository   (storage-agnostic: findAll, insert)
   |
db           (today: an array. Lesson 13: real SQL.)
```

---

## What Breaks Without This

**`usersService` calling `db` directly anywhere, even once, alongside
using `usersRepository` elsewhere**: the moment even one method bypasses
the repository, the "storage details never leak above this layer"
guarantee is already broken for that one path — swapping storage later
would require re-auditing every service method individually to check
which ones still secretly depend on `db`, rather than trusting the
boundary completely.

**Adding a new repository method that returns something
`db`-shaped instead of plain data** (for example, returning a raw
heap-wrapped object instead of the same plain shape `findAll`/`insert`
already return): callers of the repository would need to know
storage-specific details to use it correctly, quietly reintroducing the
exact coupling this lesson just removed.

---

## Definition of Done

- [ ] `POST /users` and `GET /users?name=...` behave identically to lesson 10
- [ ] `usersService` no longer references `db` or `findUsers` anywhere
- [ ] You can explain what a repository is and what specific concern it isolates
- [ ] You can explain what CRUD stands for and name which repository method corresponds to each letter so far
- [ ] You can explain why a fake, array-backed repository could replace `usersRepository` in a test without changing `usersService` at all

---

*Next: swapping in that fake repository for a test still means editing
`usersService`'s own code to point at a different repository object.
Dependency injection is next: a real mechanism for handing a service
its repository from outside, instead of the service reaching out and
grabbing one by name.*
