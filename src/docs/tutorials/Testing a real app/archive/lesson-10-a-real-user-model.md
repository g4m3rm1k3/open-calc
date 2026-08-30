# Lesson 10: A Real User Model

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The first real table `rebuild/backend`'s own database actually holds —
a real `User` model, matching legacy's own real fields, with real
password hashing reused from the identical real library legacy already
depends on. No route reads or writes it yet; this lesson's own real
proof is narrower, matching the previous lesson's own honest shape: the
existing `/health` route still passes, unchanged, once a real model
exists alongside it.

## What you need to know first

`rebuild/backend`'s own real database connection, wired into
`create_app` but not yet holding any real table. The real, already-
passing `/health` route this lesson proves still passes.

## Terms introduced

- **Model** — in an ORM, a real Python class representing one real
  database table, where each real class attribute names one real
  column. `User`, below, is this project's own first real model.
- **Primary key** — a real, standard database concept: the one real
  column (or set of columns) guaranteed to uniquely identify a real
  row, so any other real row can reference it unambiguously. Legacy's
  own real `User.id` already serves this real role.
- **Password hashing** — converting a real, plaintext password into a
  real, one-way, irreversible value before ever storing it, so a real
  database breach never exposes a real, usable password directly. A
  real hash can be *checked against* a real, later-supplied password —
  by hashing that new attempt the identical real way and comparing the
  two real hashes — but never reversed back into the original real
  plaintext.

## Objects and methods used

- **`db.Model`**
  - *What it is:* a real, declarative base class, provided by the
    `db` object this project's own previous lesson already constructed
    — part of Flask-SQLAlchemy's own public API.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — any real class inheriting from
    `db.Model` is automatically registered as a real, mapped table;
    its own real `db.Column(...)` class attributes, below, become that
    table's own real columns.
  - *Its use:* this lesson's `User` class inherits from it, once,
    making `User` a real, genuine database table rather than an
    ordinary Python class with no real database meaning.
  - *Type:* a class, meant to be subclassed, never instantiated
    directly.
  - *Responsibility:* the real, central seam translating an ordinary
    Python class definition into a real, mapped database table,
    without this project ever writing raw real SQL to create one.
  - *Depends on:* the real, shared `db` object this project's own
    database connection already constructed.
  - *Connects to:* every real model this project will ever define
    inherits from it; SQLAlchemy's own real, internal registry tracks
    every real subclass automatically.
  - *Shape:* the real foundation this lesson's Header's own
    **Model** term sits on.

- **`db.Column(type, **options)`**
  - *What it is:* a real function, provided by the `db` object,
    constructing a real column definition.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — takes a real SQLAlchemy type
    (`db.String(50)`, `db.Boolean`, and others) describing what real
    kind of value the column holds, plus real, optional keyword
    arguments (`primary_key=True`, `unique=True`, `nullable=False`, a
    real `default=`) describing real constraints and real defaults.
  - *Its use:* this lesson's `User` class calls it once per real field
    legacy's own `User` model already has.
  - *Type:* a free function (accessed as `db.Column`), returning a real
    column definition object.
  - *Responsibility:* declaring one real column's own real type and
    real constraints, in one real, self-contained call.
  - *Depends on:* a real SQLAlchemy type to describe what the column
    holds.
  - *Connects to:* assigned to a real class attribute inside a real
    `db.Model` subclass; SQLAlchemy reads every real one at real class-
    definition time to build the real table's own real schema.
  - *Shape:* the real, individual building block every real model's own
    real table shape is assembled from.

- **`db.create_all()`**
  - *What it is:* a real method on the `db` object this project's own
    database-connection lesson already constructed — part of
    Flask-SQLAlchemy's own public API.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — inspects every real `db.Model` subclass
    Python has seen defined so far (`Widget`, `User`, and any real,
    future model) and issues real, actual `CREATE TABLE` SQL for each
    one that doesn't already exist in the real, connected database;
    genuinely does nothing to a real table that already exists. Requires
    a real, active **application context** — a real, ambient reference
    to which specific Flask app's own configuration and database
    connection the code inside a real `with app.app_context():` block
    should use, since nothing about this call takes an `app` argument
    directly.
  - *Its use:* this unit's own throwaway lab calls it once, so
    `Widget`'s own real table actually exists in the real, in-memory
    SQLite database before anything tries to write a real row to it.
  - *Type:* an instance method on the real `db` object.
  - *Responsibility:* the real, one-time (per real table) translation
    from "a real Python class exists" to "a real, matching database
    table actually exists to store its rows in" — genuinely distinct
    from `create_app`, this project's own real Flask *application*
    factory, which this method's own similar-sounding name is easy to
    confuse it with but shares no real relationship to at all.
  - *Depends on:* a real, active application context, and every real
    `db.Model` subclass Python has actually imported and defined by the
    moment it's called.
  - *Connects to:* called once, inside this unit's own throwaway lab's
    `with app.app_context():` block; every real column this unit's own
    `User` class (and, in the lab, `Widget`) declares becomes a real
    column in the real table this call actually creates.
  - *Shape:* the real, one-time schema-creation boundary between "models
    exist in Python" and "tables exist in the real database" — not
    something a real route or a real request ever calls; a real, one-off
    setup step, here only exercised inside a throwaway lab, never inside
    `rebuild/backend` itself.

- **`app.app_context()`**
  - *What it is:* a real instance method on a real, already-constructed
    `Flask` app object.
  - *Implementation:* checked against Flask's own official documentation
    this session — returns a real, standard Python **context manager**
    (an object usable with `with`, guaranteeing real setup and real
    teardown around the code inside the block); entering it makes that
    specific real app's own configuration and database connection
    ambiently reachable to code running inside, without that code having
    to be handed the real `app` object directly by every real function
    along the way.
  - *Its use:* this unit's own throwaway lab wraps `db.create_all()` and
    the real row-write-and-read code in a real `with
    app.app_context():` block, so both can reach `Widget`'s own real
    table inside `app`'s own specific, real, in-memory database.
  - *Type:* an instance method on `Flask`, returning a real context
    manager.
  - *Responsibility:* making one specific, real app's own configuration
    and database connection ambiently available to code that needs it,
    without threading the real `app` object through every real function
    call by hand.
  - *Depends on:* a real, already-constructed `Flask` app.
  - *Connects to:* entered via `with`, directly around this unit's own
    throwaway lab's real `db.create_all()` and database calls.
  - *Shape:* a real, request-independent version of the identical real
    ambient-context idea Flask already uses for a real, in-flight HTTP
    request — here needed because this lab's own code runs with no real
    request happening at all.

- **`generate_password_hash(password)`** / **`check_password_hash(hash, password)`**
  - *What they are:* two real functions, exported by
    `werkzeug.security` — part of Werkzeug, the real library Flask
    itself is built on, already a real, installed dependency.
  - *Implementation:* checked against Werkzeug's own official
    documentation this session — `generate_password_hash` produces a
    real, salted, one-way hash string from a real plaintext password;
    `check_password_hash` takes a real, previously-generated hash and a
    real, newly-supplied password, hashes the new one the identical
    real way, and returns a real `bool` — `True` only if they match,
    without ever reversing the real, stored hash.
  - *Their use:* this lesson's `User` class calls the first inside
    `set_password`, and the second inside `check_password`, both
    defined below.
  - *Type:* two free functions, exported by `werkzeug.security`.
  - *Responsibility:* this lesson's Header's own **Password hashing**
    term, applied for real — the actual, real cryptographic work,
    entirely delegated to an already-audited real library rather than
    this project inventing its own.
  - *Depends on:* a real, plaintext string, in both cases.
  - *Connects to:* called from `User.set_password`/`User.check_password`,
    below — this project's own real code never touches a real,
    plaintext password any other way.
  - *Shape:* a real, external cryptographic boundary — deliberately not
    reimplemented, the identical real library legacy already trusts.

---

## Concept Unit: A Real Table, Matching Legacy's Real Fields

### The Problem

`rebuild/backend`'s own real database connection, from the previous
lesson, has no real table in it at all. The real question this unit
answers: what does the actual smallest real `User` model look like,
that holds every real field this slice's own already-written
acceptance test (`test_login.py`) actually needs, matching legacy's
own real shape rather than inventing a new one?

> **Before reading on:** this project's own already-written
> `test_login.py` checks a real user's `id`, `email`, and `role`, and
> checks that `password_hash` is never present in a real response.
> Given only that, and legacy's own real login route also reading a
> real `name` and writing a real `last_login`, what real, minimum set
> of columns does `User` actually need?

### Project Change

- **Reference Source** — `backend/app/models/user.py`, read in full
  this session: a real `User(db.Model)` class, with `id`, `email`,
  `name`, `password_hash`, `role`, `created_at`, `last_login`, and
  `must_change_password` real columns, plus real
  `set_password`/`check_password`/`to_dict` methods. This unit
  Preserves legacy's own real field set in full — every real field
  legacy's own `to_dict()` returns is a real, external, observable
  fact about this application's own real API shape, not an internal
  detail safe to trim.
- **Files affected** — created: `rebuild/backend/app/models.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `app/` package. A
  **Deliberately changed** real structural choice, worth naming
  honestly: legacy organizes its own real models as a real *package* —
  `backend/app/models/`, with `user.py` one real file inside it, sitting
  alongside real siblings for its other real tables. This unit uses one
  real, flat `models.py` instead, on purpose: this project has exactly
  one real model so far, and a real package with one real file inside it
  is speculative structure for real tables that don't exist yet — the
  identical real reasoning this slice's own database-connection lesson
  already gave for not porting legacy's `DevelopmentConfig`/
  `ProductionConfig` early. The real, honest cost: this file will likely
  need to become a real package itself, the moment a second real model
  gives it an actual reason to.
- **Dependencies** — none beyond what the previous lesson already
  installed.

### The New Code

```python
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

from app import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(200), nullable=True)
    role = db.Column(db.String(20), default='operator')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    must_change_password = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'mustChangePassword': self.must_change_password,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None,
        }
```

### The Updated Project

`rebuild/backend/app/models.py`, in full — brand new, so this is the
whole file:

```python
1  from datetime import datetime
2  from werkzeug.security import generate_password_hash, check_password_hash
3
4  from app import db
5
6
7  class User(db.Model):
8      __tablename__ = 'users'
9
10     id = db.Column(db.String(50), primary_key=True)
11     email = db.Column(db.String(120), unique=True, nullable=False)
12     name = db.Column(db.String(100), nullable=False)
13     password_hash = db.Column(db.String(200), nullable=True)
14     role = db.Column(db.String(20), default='operator')
15     created_at = db.Column(db.DateTime, default=datetime.utcnow)
16     last_login = db.Column(db.DateTime, nullable=True)
17     must_change_password = db.Column(db.Boolean, default=False)
18
19     def set_password(self, password):
20         self.password_hash = generate_password_hash(password)
21
22     def check_password(self, password):
23         if not self.password_hash:
24             return False
25         return check_password_hash(self.password_hash, password)
26
27     def to_dict(self):
28         return {
29             'id': self.id,
30             'email': self.email,
31             'name': self.name,
32             'role': self.role,
33             'mustChangePassword': self.must_change_password,
34             'createdAt': self.created_at.isoformat() if self.created_at else None,
35             'lastLogin': self.last_login.isoformat() if self.last_login else None,
36         }
```

### The Isolated Example

`db.Model`/`db.Column` are genuinely new to this series. Isolated,
throwaway, and *not* part of this project:

```python
# throwaway_model.py — not part of this project, deleted after this unit
from app import create_app, db


class Widget(db.Model):
    __tablename__ = 'widgets'
    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50), nullable=False)


app = create_app('testing')
with app.app_context():
    db.create_all()
    widget = Widget(id='w1', name='Bolt')
    db.session.add(widget)
    db.session.commit()

    found = Widget.query.get('w1')
    print(found.name)
```

Not run this session — stated from confidence, not executed, per the
Verification Rule: this is standard, well-documented Flask-SQLAlchemy
usage, identical in shape to real, official examples. Confidently
predicted:

```
Bolt
```

This proves, in isolation, exactly what `User` depends on:
`db.Model`'s own real subclassing turns `Widget` into a real table;
`db.Column(db.String(10), primary_key=True)` declares a real,
uniquely-identifying column — this lesson's Header's own **Primary
key** term; this lesson's Header's own `db.create_all()`, called inside
a real `with app.app_context():` block — a real, ambient reference to
which specific Flask app's own database connection this code should
use, required because `db.create_all()` itself takes no `app` argument
directly — actually creates the real table; `db.session.add(...)`/
`.commit()` write a real row; `Widget.query.get('w1')` reads it back by
its real primary key.
`User`, below, uses the identical real mechanism, just with more real
columns.

### Discard the Throwaway Example

`throwaway_model.py` and `Widget` never become part of
`rebuild/backend` — they exist only to isolate real model/table
mechanics from this unit's own actual, real `User` class.

### Mechanical Walkthrough

- **Line 4, `from app import db`** — reaches the previous lesson's own
  real, module-level `db` object.
- **Line 7, `class User(db.Model):`** — this lesson's Header's own
  `db.Model`, subclassed for the first time in this project.
- **Line 8, `__tablename__ = 'users'`** — a real, standard SQLAlchemy
  class attribute, explicitly naming the real database table this
  class maps to, matching legacy's own real, identical table name.
- **Line 10, `id = db.Column(db.String(50), primary_key=True)`** — this
  lesson's Header's own `db.Column`, given a real `db.String(50)` type
  and `primary_key=True` — the real column this table's own rows are
  uniquely identified by, matching legacy's own real, identical
  declaration.
- **Lines 11–17, the remaining real columns** — each one a real,
  direct match to legacy's own real field, checked this session:
  `email` (`unique=True`, `nullable=False` — a real row can never be
  saved without one, and no two real rows can share one),
  `name`/`password_hash`/`role` (real, optional or defaulted strings),
  `created_at`/`last_login` (real, nullable timestamps), and
  `must_change_password` (a real, defaulted boolean).
- **Lines 19–20, `def set_password(self, password): self.password_hash
  = generate_password_hash(password)`** — this lesson's Header's own
  `generate_password_hash`, called with a real, plaintext password, its
  real, hashed result assigned directly to this real instance's own
  `password_hash` attribute — never the real plaintext itself.
- **Lines 22–25, `def check_password(self, password):`** — a real,
  defensive check first: `if not self.password_hash: return False` —
  a real user with no real password set yet can never real, accidentally
  pass a real check; otherwise, this lesson's Header's own
  `check_password_hash`, comparing the real, stored hash against a real,
  freshly-hashed attempt.
- **Lines 27–36, `def to_dict(self):`** — a real, plain dictionary
  literal, built entirely from `self`'s own real attribute values — the
  identical real serialization boundary this series' very first lesson
  already gave full treatment to, for a genuinely different real model;
  `password_hash` is deliberately never one of its real keys — the real,
  structural reason this project's own acceptance test can assert its
  real absence with confidence, not by coincidence.

### CS Lens

This is a real instance of the identical concept this series already
proved for `Part.to_dict()`, in its very first lesson: a real,
side-effect-free method, reading only `self`'s own current real
attributes — this project's own second real proof that pure,
easily-tested methods aren't an accident, they're a real, deliberate
project convention.

Also recognized in: any real DTO (data transfer object) pattern, in any
real language, that exists purely to reshape one real object's own
data for a different real boundary.

### SE Lens

The real, deliberately *not*-taken alternative here: returning
`self.password_hash` from `to_dict()`, gated behind a real, "admin
only" check at the call site instead of never including it at all.
Rejected on purpose, matching legacy's own real, identical design
choice: a real value that should never cross a real API boundary is
safest when the *serialization method itself* structurally cannot leak
it, rather than trusting every real caller, forever, to remember a real
runtime check.

### Commands needed

No new command — this unit's own real proof, like the previous
lesson's, is that nothing already working broke.

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: defining
a real model that nothing yet queries or writes to cannot change
`/health`'s own real behavior; Flask/SQLAlchemy's own documented
behavior gives no real reason it would. Confidently predicted, the
identical real shape already proven for `legacy` and for `rebuild` in
the previous lesson:

```
test_health.py::test_health_returns_200_and_status_healthy PASSED [100%]
1 passed in ...s
```

### Connecting this unit to what came before

The previous lesson built a real, working database connection with
nothing real to store. This unit is the first real thing it actually
holds.

---

## Connect the pieces

`rebuild/backend` now has a real, complete `User` table, matching
legacy's own real fields exactly, with real, delegated password
hashing — and still no route reads or writes a single real row. Every
real column traces to a real, read line of legacy's own source, not
invented or trimmed for convenience.

---

**Next lesson:** the actual authentication *decision* itself — given a
real email and a real password, deciding what the real, correct
response is — designed, deliberately, as a real, independently
testable piece of logic, separate from the Flask route that will
eventually call it.
