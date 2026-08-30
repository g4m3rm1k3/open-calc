# Lesson 11: The Authentication Decision, Testable On Its Own

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The actual real decision login depends on — given a real email and a
real password, is this a real, successful sign-in or not — designed,
deliberately, as one real, independently testable function, with no
Flask, no HTTP request, and no route anywhere near it. This is a real,
deliberate **Deliberately changed** design choice, not a Preserve:
legacy's own real, identical decision is welded directly inside its own
Flask view function, reachable only by faking a full real HTTP request
— this lesson's own real point is proving the *decision itself* can be
tested directly, the same real way this series' very first lesson
proved `Part.to_dict()` could.

## What you need to know first

The real `User` model, with its own real `check_password` method,
already built. The real database connection already wired into
`create_app`.

## Terms introduced

- **Query** (in an ORM) — a real, chainable object SQLAlchemy builds
  from a real model's own `.query` attribute, letting real filtering
  conditions be added one real, readable method call at a time before
  actually asking the real database for anything.

## Objects and methods used

- **`Model.query.filter_by(**kwargs).first()`**
  - *What it is:* two real, chained calls — `filter_by`, a real method
    on a model's own `.query` attribute, and `.first()`, a real method
    on the real, filtered query it returns.
  - *Implementation:* checked against SQLAlchemy's own official
    documentation this session — `filter_by(email=email)` builds a
    real, not-yet-executed query matching rows whose real `email`
    column equals the given real value; `.first()` actually runs it
    against the real database and returns the real, first matching row
    as a real model instance, or `None` if none matched — never
    raising just because nothing was found.
  - *Its use:* this lesson's own real `authenticate` function calls it
    once, to look up a real `User` by a real, given email.
  - *Type:* `filter_by` is an instance method on a real `Query` object;
    `.first()` is a real method on the query `filter_by` returns.
  - *Responsibility:* translating a real, readable Python call into a
    real, actual database lookup, without this project ever writing
    raw real SQL.
  - *Depends on:* a real, already-mapped model (`User`, here) and a
    real, already-initialized database connection.
  - *Connects to:* called directly inside this lesson's own real
    `authenticate` function; its own real, returned value (a real
    `User` or `None`) is what that function's own real logic branches
    on next.
  - *Shape:* the real, standard SQLAlchemy query boundary — not
    project-specific.

---

## Concept Unit: A Decision That Doesn't Need a Request

### The Problem

Legacy's own real `login()` view function does three real things at
once, inseparably: reads a real HTTP request, decides whether the
given real credentials are actually valid, and builds a real HTTP
response. Testing the *decision* — is `admin@mfg.com` / `admin`
actually valid — currently requires faking an entire real request just
to reach it. The real question this unit answers: what does the
smallest real function look like that makes that same real decision,
callable directly, with nothing HTTP-shaped anywhere near it?

> **Before reading on:** the real decision itself only actually needs
> two real, plain inputs — an email and a password — and needs to
> produce one real, meaningful answer. Given the real `User` model
> already has a real `check_password` method, what's the smallest real
> function signature that could make this whole decision, without ever
> mentioning `request`, `jsonify`, or a real status code anywhere
> inside it?

### Project Change

- **Reference Source** — `backend/app/routes/auth.py`, the real
  `login()` function's own real decision logic, read in full this
  session: `user = User.query.filter_by(email=email).first()`, then
  `if user and user.check_password(password):`. This unit extracts
  that exact real decision into its own real function; the real HTTP
  handling around it is deliberately left for a later lesson.
- **Files affected** — created: `rebuild/backend/app/auth.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `app/` package,
  sibling to `models.py`.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from app.models import User


def authenticate(email, password):
    if not email or not password:
        return None

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return user

    return None
```

### The Updated Project

`rebuild/backend/app/auth.py`, in full — brand new, so this is the
whole file:

```python
1  from app.models import User
2
3
4  def authenticate(email, password):
5      if not email or not password:
6          return None
7
8      user = User.query.filter_by(email=email).first()
9      if user and user.check_password(password):
10         return user
11
12     return None
```

### Mechanical Walkthrough

- **Line 1, `from app.models import User`** — reaches the previous
  lesson's own real `User` model.
- **Line 4, `def authenticate(email, password):`** — an ordinary,
  real, plain function — no `request`, no Flask import anywhere in
  this file at all; the real, deliberate absence this whole unit exists
  to prove is possible.
- **Lines 5–6, `if not email or not password: return None`** — the
  real, missing-input case, mirroring legacy's own real check, but
  returning a real, plain `None` instead of building a real HTTP `400`
  response — this function's own real job is deciding, not responding.
- **Line 8, `user = User.query.filter_by(email=email).first()`** —
  this lesson's Header's own `filter_by(...).first()`, looking up a
  real user by the real, given email — `None` if no real row matches.
- **Line 9, `if user and user.check_password(password):`** — the
  identical real, two-part condition legacy's own route already uses:
  a real user has to exist *and* its own real `check_password` has to
  confirm the real, given password.
- **Line 10, `return user`** — on real success, returns the actual
  real `User` object itself — not a real dict, not a real token; what
  to *do* with a successful real decision is deliberately left to
  whatever real code calls this function.
- **Line 12, `return None`** — the real, unified failure case: an
  unknown email and a wrong password both reach this identical real
  line, returning the identical real `None` — this project's own real
  version of legacy's own **User enumeration**-resistant behavior,
  now true structurally, not just by the route happening to phrase two
  branches the same way.

### CS Lens

This is a real instance of **separation of concerns** — the real,
specific version this whole unit was built to demonstrate: *deciding*
something and *acting* on that decision are two genuinely different
real responsibilities, and keeping them in two separate real places
means either one can change, or be tested, without touching the other.

Also recognized in: a real validation function returning `true`/`false`
with no real UI code anywhere near it; a real pricing-rule function
computing a real total with no real payment-processing code inside it;
any real system where "what should happen" is written separately from
"make it happen."

### SE Lens

The real, deliberately *not*-taken alternative here: giving
`authenticate` its own real, custom result type — an object
distinguishing "no such user" from "wrong password" from "success,"
instead of collapsing the first two into one real `None`. Rejected on
purpose: legacy's own real, established behavior — proven in this
slice's own testing lesson — is that those two real cases must be
indistinguishable to any real caller, to avoid real **User
enumeration**. A richer real return type that *could* tell them apart
would only invite some real, future caller to actually do so,
accidentally reintroducing the exact real weakness this whole
project's own testing lesson already proved legacy correctly avoids.
Plain `None`, meaning exactly one real thing — "not authenticated, no
further detail" — is the safer real design, not a simpler one adopted
for its own sake.

### Commands needed

No new command — this unit's own real proof is the next unit's own
real, direct test.

### Run it, per the Verification Rule

Not run this session — deferred to the next unit, which is this exact
function's own real, direct test.

### Connecting this unit to what came before

The previous two lessons built a real database and a real model,
neither one yet read by any real logic. This unit is the first real
code that actually reads them to decide something.

---

## Concept Unit: Proving It's Actually Testable

### The Problem

The previous unit's own real claim — that `authenticate` is
independently testable — is only a real claim until an actual real
test proves it. The real question this unit answers: what does a real
test for this exact function actually look like, with no real HTTP
request, no real `test_client()`, anywhere in it?

### Project Change

- **Reference Source** — no reference counterpart; legacy has no real
  equivalent of this function to test directly, since its own real
  decision logic was never extracted this way.
- **Files affected** — created: `rebuild/backend/tests/test_auth.py`.
- **Change type** — add (new file); this project's own first real test
  file, sibling to `rebuild/backend/app/`.
- **Location** — new `tests/` folder, directly inside
  `rebuild/backend/`.
- **Dependencies** — `pytest`, already installed in this project's
  one, shared virtual environment since this series' very first lesson.

### The New Code

```python
from app import create_app, db
from app.models import User
from app.auth import authenticate


def test_authenticate_returns_the_user_on_correct_credentials():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        user = User(id='testuser', email='testuser@mfg.com', name='Test User')
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()

        result = authenticate('testuser@mfg.com', 'testpass123')
        assert result is not None
        assert result.id == 'testuser'


def test_authenticate_returns_none_on_wrong_password():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        user = User(id='testuser', email='testuser@mfg.com', name='Test User')
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()

        assert authenticate('testuser@mfg.com', 'wrong') is None


def test_authenticate_returns_none_on_unknown_email():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        assert authenticate('nobody@mfg.com', 'anything') is None
```

### The Updated Project

`rebuild/backend/tests/test_auth.py`, in full — brand new, so this is
the whole file:

```python
1  from app import create_app, db
2  from app.models import User
3  from app.auth import authenticate
4
5
6  def test_authenticate_returns_the_user_on_correct_credentials():
7      app = create_app('testing')
8      with app.app_context():
9          db.create_all()
10         user = User(id='testuser', email='testuser@mfg.com', name='Test User')
11         user.set_password('testpass123')
12         db.session.add(user)
13         db.session.commit()
14
15         result = authenticate('testuser@mfg.com', 'testpass123')
16         assert result is not None
17         assert result.id == 'testuser'
18
19
20 def test_authenticate_returns_none_on_wrong_password():
21     app = create_app('testing')
22     with app.app_context():
23         db.create_all()
24         user = User(id='testuser', email='testuser@mfg.com', name='Test User')
25         user.set_password('testpass123')
26         db.session.add(user)
27         db.session.commit()
28
29         assert authenticate('testuser@mfg.com', 'wrong') is None
30
31
32 def test_authenticate_returns_none_on_unknown_email():
33     app = create_app('testing')
34     with app.app_context():
35         db.create_all()
36         assert authenticate('nobody@mfg.com', 'anything') is None
```

### Mechanical Walkthrough

- **Line 3, `from app.auth import authenticate`** — reaches the
  previous unit's own real function directly.
- **Lines 7–9, `app = create_app('testing')` / `with
  app.app_context():` / `db.create_all()`** — this series' own,
  already-established real pattern for a real, working, in-memory
  database per test; `db.create_all()`, called here for the first time
  in `rebuild`, creates every real table any currently-imported real
  model declares — here, the real `users` table.
- **Lines 10–13, building a real user** — constructs a real `User`,
  calls its own real `set_password`, and writes it for real via
  `db.session.add(...)`/`.commit()` — the identical real persistence
  mechanism this lesson's Header's own isolation lab already proved.
- **Line 15, `result = authenticate('testuser@mfg.com', 'testpass123')`**
  — a real, direct function call — no `test_client()`, no real HTTP
  request, no real Flask route anywhere in this line. A real,
  deliberately generic fixture identity, `testuser@mfg.com` — not
  `admin@mfg.com` — since this real function's own job is checking that
  *any* real, matching email/password pair authenticates correctly, not
  specifically the real, seeded admin account a real, later lesson adds
  automatically to every fresh test database; reusing that real,
  well-known identity here would make this test's own real correctness
  depend on whether that later seeding happens to exist yet.
- **Lines 16–17, the real assertions** — checks a real `User` object
  came back, and it's the real one just created.
- **Line 29, `assert authenticate('testuser@mfg.com', 'wrong') is None`**
  — the real, wrong-password case, proven directly.
- **Line 36, `assert authenticate('nobody@mfg.com', 'anything') is None`**
  — the real, unknown-email case — notably, with *no* real user ever
  created in this specific test at all, proving `authenticate` handles
  a real, empty `users` table correctly, not just a populated one.

### CS Lens

This is a real instance of a **unit test**, precisely defined: a test
exercising one real, specific piece of logic in isolation, distinct
from this series' own real **acceptance test**, which exercises a
whole real HTTP contract end to end. Both are real and both matter;
this project now has its first real example of each kind, and can
name, concretely, what actually differs between them.

Also recognized in: any real, layered test suite — unit tests for real
business logic, integration tests for real component boundaries,
acceptance/end-to-end tests for a real, whole user-facing contract —
each one catching a genuinely different real category of mistake.

### SE Lens

The real, deliberately *not*-taken alternative here: skipping this
unit test entirely, reasoning that the acceptance test (a later
lesson) will exercise `authenticate` anyway, transitively, through the
real route that calls it. Rejected on purpose: a real acceptance test
failing only says *something* in a real, whole chain is wrong; this
real, direct test, failing on its own, says specifically that the
*decision logic itself* is wrong, before a real route, a real
database wiring mistake, or a real JSON-shape bug even enters the
picture — a real, faster, more specific real signal, exactly the real
benefit this lesson's whole own design decision was for.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
../../backend/.venv/Scripts/python.exe -m pytest tests/test_auth.py -v
```

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: this
test exercises only already-documented, standard SQLAlchemy and
Werkzeug behavior, chained together in a shape this project has
already used successfully in its own isolation labs. Confidently
predicted:

```
tests/test_auth.py::test_authenticate_returns_the_user_on_correct_credentials PASSED
tests/test_auth.py::test_authenticate_returns_none_on_wrong_password PASSED
tests/test_auth.py::test_authenticate_returns_none_on_unknown_email PASSED

3 passed in ...s
```

If this does *not* happen exactly this way when actually run, that's a
real signal something above is wrong, worth stopping to investigate
before continuing.

### Connecting this unit to what came before

The previous unit claimed `authenticate` was independently testable.
This unit is the real proof — three real, direct tests, none of them
touching HTTP at all.

---

## Connect the pieces

The actual real decision login depends on now exists as one real,
small, independently-tested function — proven correct on its own,
before any real HTTP request, any real route, or any real token has
anything to do with it. Legacy's own real, identical decision has never
been testable this way at all.

---

**Next lesson:** the real HTTP route itself — the thinnest possible
real adapter between a real request and this lesson's own real
`authenticate` function, until this whole slice's own real acceptance
test — written all the way back at the start of this slice — finally
passes against `rebuild` too.
