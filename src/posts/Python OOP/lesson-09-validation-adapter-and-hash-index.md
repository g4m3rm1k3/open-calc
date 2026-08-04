# Lesson 9: Trusting Input, Wrapping the Incompatible, and Finding Fast
### (Project 3 — Mini REST API, Python)

**What you will build.** Three real fixes to real gaps from Lesson 8:
`POST /users` stops crashing on bad input and starts responding
correctly instead; a second, differently-shaped data source — a
"legacy" store using entirely different field names — gets wrapped so
the exact same `UserHandler` can serve it without a single line of
`api.py` changing; and `UserRepository` gains a real, measured,
constant-time way to find a user by id, closing the gap Project 2
deliberately left open. The transferable problems this lesson is
actually about: validating untrusted input by hand when nothing does it
for you automatically, making two genuinely incompatible shapes work
together without changing either one, and choosing a data structure
whose lookup cost doesn't grow with the data.

**What you need to know first.** Lesson 8 — `UserRepository`,
`make_handler`'s dependency injection, and the exact `KeyError` crash
this lesson's first unit fixes. Project 2, Lesson 6 — linear search and
its measured cost, which this lesson's third unit directly answers.

---

## Concept Unit: Validating a Request Body

### The Problem

Lesson 8 ended with a real crash: `POST /users` with a body missing
`"name"` raised an uncaught `KeyError` inside `do_POST`, and the client
got nothing back but a dropped connection. `argparse` handled exactly
this kind of problem automatically for CLI arguments back in Lesson 3 —
`http.server` gives no such thing for free. Every check has to be
written by hand, on purpose, before the data is trusted.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `validation_lab.py` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```python
def make_person(data):
    name = data.get("name")
    if not isinstance(name, str) or not name:
        return None, "name must be a non-empty string"
    return {"name": name}, None
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```python
print(make_person({"name": "Ada"}))
print(make_person({}))
print(make_person({"name": 42}))
```

Real output:

```
({'name': 'Ada'}, None)
(None, 'name must be a non-empty string')
(None, 'name must be a non-empty string')
```

Three different inputs, three genuinely different behaviors — proving
`data.get("name")` never crashes even when `"name"` is entirely absent
(unlike `body["name"]`'s `[]` indexing back in Lesson 8, which raised
`KeyError` on exactly this case), and that a value being present isn't
enough on its own — `42` is a value, but the wrong *kind* of value.
`isinstance(name, str)` checks whether `name` genuinely is a string, not
just present; `not name` catches an empty string, which passes the
`isinstance` check but still isn't usable.

### Discard the throwaway example

`make_person` is deleted — it only existed to prove `.get()` plus
`isinstance()` together catch both "missing" and "wrong type" cleanly,
isolated from `UserHandler` entirely. `do_POST`'s real validation is the
permanent version.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `api.py`.
- **Change type** — add (validation block inside `do_POST`).
- **Location** — inside `do_POST`, before `repo.add(...)` is called.
- **Dependencies** — none new.

### The New Code

```python
                name = body.get("name")
                if not isinstance(name, str) or not name:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    error = {"error": "name must be a non-empty string"}
                    self.wfile.write(json.dumps(error).encode())
                    return

                user = repo.add(name)
```

### The Updated Project

```python
        def do_POST(self):
            if self.path == "/users":
                length = int(self.headers["Content-Length"])
                body = json.loads(self.rfile.read(length))

                name = body.get("name")                              # ← new
                if not isinstance(name, str) or not name:              # ← new
                    self.send_response(400)                             # ← new
                    self.send_header("Content-Type", "application/json")  # ← new
                    self.end_headers()                                    # ← new
                    error = {"error": "name must be a non-empty string"}   # ← new
                    self.wfile.write(json.dumps(error).encode())            # ← new
                    return                                                   # ← new

                user = repo.add(name)                                  # ← changed
                self.send_response(201)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(user).encode())
            else:
                self.send_response(404)
                self.end_headers()
```

`do_POST` now checks the shape of the incoming data *before* ever
touching `repo` — invalid input gets a clean, informative `400`
response and returns immediately; only genuinely valid input ever
reaches `repo.add(...)`.

### Mechanical walkthrough

- `name = body.get("name")` — **(b) hard concept reappearing**, the
  same `.get()` proven in the isolated lab, replacing `body["name"]`'s
  crash-on-missing `[]` indexing from Lesson 8.
- `if not isinstance(name, str) or not name:` — **(b) hard concept
  reappearing**, the exact condition from the isolated lab.
- `self.send_response(400)` — **(a) first appearance** of status `400`
  specifically: HTTP's convention for "the client sent something this
  server can't accept," distinct from `404` ("nothing exists here") and
  `201` ("something new was created").
- `error = {"error": "..."}` — **(c) already basic**, dict-literal
  syntax from Lesson 2.
- `self.wfile.write(json.dumps(error).encode())` — **(b) hard concept
  reappearing**, the exact response-writing pattern from Lesson 8,
  reused for an error body instead of a success body.
- `return` — **(a) first appearance** of a bare `return` used purely to
  exit early: with no value after it, this just stops `do_POST` from
  continuing to the `repo.add(...)` line below, the same way it would
  in any function, here specifically to prevent invalid data from ever
  reaching the repository.

### CS lens

This is validating at a **trust boundary**: the exact moment data
crosses from an untrusted source (a network client, which can send
literally anything) into code that assumes a specific shape. Also
recognized in: SQL parameter binding preventing injection, a compiler
rejecting a syntactically invalid program before ever attempting to run
it, a form library rejecting malformed input before a database write is
attempted.

### SE lens

The alternative is exactly Lesson 8's own crash: trusting the body's
shape implicitly and letting a mismatch surface as an uncaught
exception, deep inside code that has nothing to do with validation.
`argparse` back in Lesson 3 did this same job automatically, for free,
because CLI arguments are a problem the standard library has already
solved generically; an HTTP request body's *shape* is specific to this
API, so nothing generic can validate it without being told what "valid"
even means here. The cost is a few explicit lines per field; the
alternative — as already proven in Lesson 8 — is a silent connection
drop and zero information for whoever sent the bad request.

### Commands needed

Same server-plus-request pattern as Lesson 8.

### Run it

```python
post({"name": "Ada"})
post({"nickname": "Ada"})
post({"name": ""})
post({"name": 42})
```

Real output:

```
201 {"id": 1, "name": "Ada"}
400 {"error": "name must be a non-empty string"}
400 {"error": "name must be a non-empty string"}
400 {"error": "name must be a non-empty string"}
```

Three different kinds of bad input — a missing key, an empty string, and
the wrong type — all produce the same clean `400` and readable error
message, with no traceback anywhere in the server's own log this time.

### Connecting sentence

`POST /users` now rejects bad input the way a real API should — the
next unit turns to a completely different kind of flexibility: making
this same handler work against data it was never originally written
for.

---

## Concept Unit: The Adapter Pattern

### The Problem

Suppose this project needs to serve data from somewhere that already
exists and can't be changed — a "legacy" system storing people under
completely different names: `full_name` instead of `name`, `person_id`
instead of `id`, and completely different method names for adding and
reading records. `UserHandler` was written against `UserRepository`'s
specific shape (`add(name)`, `all()`, dicts with `"id"`/`"name"` keys).
Rewriting `UserHandler` itself to understand a second, differently-
shaped data source would mean it now has to know about *two* possible
shapes internally — and a third source later would mean a third.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `adapter_lab.py` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```python
class OldCalculator:
    def old_add(self, a, b):
        return a + b


class CalculatorAdapter:
    def __init__(self, old_calculator):
        self.old_calculator = old_calculator

    def add(self, a, b):
        return self.old_calculator.old_add(a, b)
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```python
old = OldCalculator()
new = CalculatorAdapter(old)
print(new.add(2, 3))
```

Real output:

```
5
```

`new.add(2, 3)` was called — using the *new*, expected method name,
`add` — and it worked, even though `OldCalculator` has no `add` method
at all, only `old_add`. `CalculatorAdapter` sits between the two,
translating one call shape into the other, without `OldCalculator`
needing to change (it might not even be code this project owns) and
without whoever calls `new.add(...)` needing to know `OldCalculator`
exists underneath at all. This is called the **Adapter pattern**.

### Discard the throwaway example

`OldCalculator`/`CalculatorAdapter` are deleted — they only existed to
prove one interface can be wrapped to look like a different, expected
one, isolated from `UserRepository` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `legacy_store.py`,
  `user_repository_adapter.py`.
- **Change type** — add.
- **Location** — new files, alongside `user_repository.py`.
- **Dependencies** — none new; `api.py` needs zero changes.

### The New Code

```python
class LegacyUserStore:
    def __init__(self):
        self.people = []

    def register_person(self, full_name):
        record = {"person_id": len(self.people) + 1, "full_name": full_name}
        self.people.append(record)
        return record

    def get_people(self):
        return self.people
```

```python
class UserRepositoryAdapter:
    def __init__(self, legacy_store):
        self.legacy_store = legacy_store

    def add(self, name):
        record = self.legacy_store.register_person(name)
        return {"id": record["person_id"], "name": record["full_name"]}

    def all(self):
        return [
            {"id": record["person_id"], "name": record["full_name"]}
            for record in self.legacy_store.get_people()
        ]
```

### The Updated Project

Both files shown whole above. `LegacyUserStore` deliberately mirrors
none of `UserRepository`'s naming — that's the point, it's meant to
represent a real system this project doesn't control.
`UserRepositoryAdapter` presents `add(name)`/`all()` — exactly
`UserRepository`'s own interface — translating field names in both
directions underneath.

### Mechanical walkthrough

- `class LegacyUserStore:` through `get_people(self)` — **(c) already
  basic**, a plain class using already-taught pieces, deliberately named
  differently from `UserRepository` to represent a genuinely separate
  system.
- `class UserRepositoryAdapter:` / `def __init__(self, legacy_store):
  self.legacy_store = legacy_store` — **(b) hard concept reappearing**,
  the same wrapping-constructor shape as `CalculatorAdapter`.
- `def add(self, name): record = self.legacy_store.register_person(name)
  return {"id": record["person_id"], "name": record["full_name"]}` —
  **(b) hard concept reappearing**: calls the legacy system's own method
  name, then re-shapes its differently-keyed result into the exact dict
  shape `UserHandler` already expects from `UserRepository.add(...)`.
- `def all(self): return [...]` — **(a) first appearance** of a list
  comprehension *building new dicts*, not just calling a method per item
  the way Project 1 Lesson 2's `[n.to_dict() for n in notes]` did:
  `{"id": record["person_id"], "name": record["full_name"]} for record
  in self.legacy_store.get_people()` constructs a brand-new,
  correctly-shaped dict for every legacy record, translating both field
  names at once, for every single user in one line.

### CS lens

Adapter's whole purpose is making two things interoperate that were
never designed to know about each other — critically, without modifying
either side. Also recognized in: a physical power plug adapter (neither
the wall socket nor the device changes), a database driver presenting a
uniform query interface over genuinely different underlying databases, a
payment gateway library normalizing Stripe's and PayPal's very different
APIs into one consistent interface an application can call the same way
regardless of which is actually in use underneath.

### SE lens

The alternative — teaching `UserHandler` to understand
`LegacyUserStore`'s shape directly, with an `if using_legacy: ... else:
...` branch somewhere — would work for exactly two data sources and get
worse with every additional one, and it would mean `UserHandler` now
has to know something it has no real reason to know: what *kind* of
storage is behind it. `UserRepositoryAdapter` costs one small class per
incompatible source; in exchange, `UserHandler`, `make_handler`, and
every route inside them stay completely unaware that more than one data
shape exists anywhere in this system — provable directly, since
`make_handler(adapter)` needs to work with zero changes to `api.py` at
all.

### Commands needed

Same server-plus-request pattern as before.

### Run it

```python
legacy = LegacyUserStore()
repo = UserRepositoryAdapter(legacy)
server = HTTPServer(("localhost", 8130), make_handler(repo))
```

```
POST /users: 201 {"id": 1, "name": "Ada"}
GET /users: 200 {"id": 1, "name": "Ada"}]  # (shown as a list)
--- what the legacy store actually stored, underneath ---
[{'person_id': 1, 'full_name': 'Ada'}]
```

Full real output:

```
POST /users: 201 {"id": 1, "name": "Ada"}
GET /users: 200 [{"id": 1, "name": "Ada"}]
--- what the legacy store actually stored, underneath ---
[{'person_id': 1, 'full_name': 'Ada'}]
```

The HTTP responses are byte-for-byte identical in shape to Lesson 8's
`UserRepository`-backed responses — `"id"`, `"name"` — while the actual
storage underneath uses `person_id`/`full_name` entirely. `make_handler`
never saw the difference, because `UserRepositoryAdapter` is the only
thing that had to.

### Connecting sentence

The same handler now genuinely serves two incompatible data sources
without knowing it — the last unit turns back to `UserRepository`
itself, giving it a real performance improvement that has nothing to do
with what's wrapped around it.

---

## Concept Unit: A Hash Index for Fast Lookup

### The Problem

Project 2, Lesson 6 measured `find_by_title`'s linear scan at 4.30ms
across 200,000 tasks, and deliberately deferred fixing it, naming
Project 3's "50,000 users" premise as the project that would actually
need the fix. `UserRepository` has arrived at exactly that premise —
and currently has no `find_by_id` at all, only `all()`, which means
finding one specific user among many would mean scanning the *entire*
list, every time, exactly the cost already measured and named as a real
problem two lessons ago.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `index_lab.py` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```python
users = [{"id": i, "name": f"User {i}"} for i in range(200_000)]

start = time.perf_counter()
found = None
for user in users:
    if user["id"] == 199_999:
        found = user
        break
scan_time = time.perf_counter() - start

by_id = {user["id"]: user for user in users}

start = time.perf_counter()
found2 = by_id[199_999]
lookup_time = time.perf_counter() - start
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Run it:

```
{'id': 199999, 'name': 'User 199999'}
linear scan: 9.13 ms
{'id': 199999, 'name': 'User 199999'}
dict lookup: 0.0020 ms
```

Same data, same target, same 200,000 items — and the dict lookup is
roughly **4,500 times faster**, measured, not estimated. `by_id = {user["id"]:
user for user in users}` is a **dict comprehension** — the same
`{key: value for item in iterable}` shape as the list comprehensions
from Project 1 Lesson 2, but building a dictionary instead of a list —
and once built, `by_id[199_999]` goes straight to the matching entry
without checking anything else, the same constant-time lookup Python's
`dict` already provided every time `SORT_STRATEGIES[args.sort]` was used
back in Lesson 3, just now applied specifically to make search itself
fast rather than to pick a function.

### Discard the throwaway example

`users`/`by_id` above are deleted — they only existed to measure the
real cost difference between a linear scan and a dict lookup, isolated
from `UserRepository` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `user_repository.py`.
- **Change type** — add (`_by_id`, `find_by_id`); modify `__init__` and
  `add`.
- **Location** — inside `class UserRepository`.
- **Dependencies** — none new.

### The New Code

```python
        self._by_id = {}
```

```python
    def add(self, name):
        user = {"id": len(self.users) + 1, "name": name}
        self.users.append(user)
        self._by_id[user["id"]] = user
        return user

    def find_by_id(self, user_id):
        return self._by_id.get(user_id)
```

### The Updated Project

```python
class UserRepository:
    def __init__(self):
        self.users = []
        self._by_id = {}                            # ← new

    def add(self, name):
        user = {"id": len(self.users) + 1, "name": name}
        self.users.append(user)
        self._by_id[user["id"]] = user               # ← new
        return user

    def all(self):
        return self.users

    def find_by_id(self, user_id):                    # ← new
        return self._by_id.get(user_id)                 # ← new
```

Every user now lives in *two* places at once: `self.users`, the ordered
list `all()` returns, and `self._by_id`, a dict built specifically for
fast lookup by id — kept in sync automatically, every single time
`add()` runs, so they can never drift apart.

### Mechanical walkthrough

- `self._by_id = {}` — **(a) first appearance** of the leading-underscore
  naming convention: not a language rule, but a widely understood
  signal that this attribute is an internal implementation detail — the
  fast-lookup index — not something outside code should read or modify
  directly, unlike `self.users` and `self.tasks` in earlier projects,
  which were always meant to be read directly.
- `self._by_id[user["id"]] = user` — **(b) hard concept reappearing**:
  dict assignment via `[]`, the write-side counterpart to the `[]`
  read-indexing already proven in Project 2 Lesson 6.
- `def find_by_id(self, user_id): return self._by_id.get(user_id)` —
  **(b) hard concept reappearing**, the same `.get()` from this lesson's
  first unit — returning `None` for an id that was never added, rather
  than crashing.

### CS lens

`self._by_id` is a **hash index**: a dictionary maintained specifically
so a lookup that would otherwise require scanning becomes near-instant
instead, at the cost of a small amount of extra memory and bookkeeping
on every write. Also recognized in: a database index on a column
(exactly this tradeoff, formalized), a browser's DOM `id` attribute
lookup (`getElementById` is fast specifically because the browser
maintains an index like this one internally), any cache keyed by a
lookup value.

### SE lens

The alternative — `find_by_id` implemented as a linear scan over
`self.users`, mirroring `find_by_title` from Project 2 exactly — was
explicitly, honestly deferred there for being fine at that project's
actual scale. It stops being fine here, and this project's own name for
its problem — "search through 50,000 users" — makes that concrete. The
real cost of `_by_id`: every `add()` now does slightly more work, and
every user genuinely exists in memory twice, once in each structure.
That's a deliberate, worthwhile trade — write cost barely changes,
`add()` is still effectively instant, while read cost drops from
scaling with every user in the system to not scaling at all. Measured
directly against a `UserRepository` holding 200,000 real users:

```
0.0048 ms to find the last user among 200,000
None
```

Under five microseconds, regardless of position — the last user found
exactly as fast as the first would have been — and a missing id
returns `None` cleanly, the same `.get()` safety proven earlier in this
lesson, rather than crashing or scanning fruitlessly to the end.

### Commands needed

`python3 find_by_id_demo.py`, same pattern.

### Run it

Shown above.

### Connecting sentence

`UserRepository` now answers "find this specific user" in time that
doesn't grow with how many users exist — closing, with real measured
numbers, the exact gap Project 2 named and chose not to fix two lessons
ago.

---

## Closing

**Connect the pieces.** One user, through every idea in this lesson:
`POST /users` with `{"name": "Ada"}` passes this lesson's own
validation (a real string, not empty) before `repo.add("Ada")` ever
runs; if `repo` happens to be a `UserRepositoryAdapter`, that call
silently becomes `legacy_store.register_person("Ada")` underneath,
re-shaped back into `{"id": ..., "name": ...}` before `do_POST` ever
sees it; and whichever concrete `UserRepository` is actually in use,
`add()` now writes into both `self.users` and `self._by_id` at once, so
a later `find_by_id(1)` returns Ada in constant time, regardless of how
many thousands of other users have been added since. Three independent
fixes — none of them requiring changes to the other two.

**What breaks without this.** `UserRepositoryAdapter` was written
against `UserRepository`'s *original* interface — `add`/`all` — and this
lesson's last unit added a *third* method, `find_by_id`, only to the
real `UserRepository`, not to the adapter. Calling
`adapter.find_by_id(1)` right now:

```python
>>> adapter.find_by_id(1)
AttributeError: 'UserRepositoryAdapter' object has no attribute 'find_by_id'
```

That's an honest, real gap this lesson is leaving open on purpose: an
Adapter only stays trustworthy as long as it keeps matching *every*
method the code using it might call — adding `find_by_id` to
`UserRepository` without updating `UserRepositoryAdapter` to match
silently broke the promise the Adapter pattern makes. Fixing it is this
lesson's first exercise, not a hidden problem to discover by accident
later.

**Exercises.**
1. Fix the gap above: add a `find_by_id` to `UserRepositoryAdapter`,
   maintaining its own `_by_id`-style index over `legacy_store`'s
   differently-shaped records, so it and `UserRepository` genuinely stay
   interchangeable.
2. Add a `GET /users/<id>` route to `api.py` that calls `repo.find_by_id(...)`,
   returning `404` if it comes back `None` — you'll need the path-parsing
   idea flagged as an exercise in Lesson 8.
3. Write a `pytest` test proving `find_by_id` returns the exact same
   user object whether it's called right after `add()` or after 10,000
   other unrelated users have also been added — confirming the lookup
   cost claim isn't just measured casually, but actually verified.

**Definition of done.**
- [ ] `POST /users` returns a clean `400` with a real JSON error body
      for a missing, empty, or wrong-typed `name` — confirmed with real
      requests, zero server-side tracebacks.
- [ ] `UserRepositoryAdapter` wraps `LegacyUserStore` and works through
      `make_handler` with zero changes to `api.py`, confirmed by real
      HTTP responses matching `UserRepository`'s own shape exactly.
- [ ] `UserRepository.find_by_id` is confirmed, with real measured
      timing, to stay fast regardless of how many users exist.
- [ ] You've triggered the real `AttributeError` from calling
      `find_by_id` on the adapter, and understand exactly why it
      happens.
- [ ] Commit with a message explaining why — e.g. `"Validate POST bodies
      by hand since http.server does it for free, adapt a legacy store
      to the existing repository interface, and index users by id for
      O(1) lookup"` — not `"add validation, adapter, and index"`.

**This closes Project 3**, and Phase 1 of the curriculum. Across
Projects 1–3, entirely in Python: Factory, Repository, Strategy,
Command, Observer, Dependency Injection, and Adapter all arrived because
a real, growing project needed each one, alongside lists, stacks, a
heap-backed priority queue, linear search (deliberately deferred), and a
hash index (deliberately delivered). **Phase 2** moves to JavaScript —
same engineering instincts, a genuinely different language — where
Observer stops being a class you write by hand and turns out to already
be sitting inside the browser itself, as DOM events.
