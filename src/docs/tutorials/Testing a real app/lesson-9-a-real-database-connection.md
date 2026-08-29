# Lesson 9: A Real Database Connection

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Nothing in `rebuild/backend`
> has ever needed a database until now — `/health` reads and writes
> nothing.

## What you will build

The first real piece of login's own implementation slice: a real,
configurable database connection for `rebuild/backend`, using the
identical real tool legacy already does — SQLAlchemy, through its own
real Flask integration. No user, no login route, and no table exists
yet by the end of this lesson; the real, honest proof this lesson
offers is narrower and just as real: the existing `/health` route
still works, unchanged, once a real database is wired in alongside it —
proof this real addition breaks nothing already built.

## What you need to know first

`rebuild/backend`'s own real `create_app`, which has accepted a real
`config_name` parameter since it was first written, without yet doing
anything with it. The real, already-passing `/health` route this lesson
proves still passes.

## Terms introduced

- **ORM** (Object-Relational Mapper) — a real library that lets a
  program work with a real database's own rows and tables as if they
  were ordinary real objects and classes, translating real method calls
  and real attribute access into real SQL underneath. SQLAlchemy, below,
  is a real, specific ORM; legacy's own real backend already depends on
  it for every real table it has.
- **Configuration class** — an ordinary real Python class whose only
  real job is holding named, real configuration values as class
  attributes, rather than as scattered real variables — legacy's own
  real `backend/config.py` already uses this exact real pattern, with a
  real, separate class per real environment (development, production,
  testing), each one a real Python class, not a real dictionary or
  config file format.
- **In-memory database** — a real SQLite database that exists only in a
  real process's own memory, never written to a real file on disk, and
  genuinely gone the instant that real process ends. Legacy's own real
  `TestingConfig` already uses one (`sqlite:///:memory:`) for exactly
  the reason this lesson reuses it: real, fast, fully isolated test
  runs that never leave real files behind or interfere with each other.

## Objects and methods used

- **`SQLAlchemy` (Flask-SQLAlchemy's own class)**
  - *What it is:* a real class, exported by the `flask_sqlalchemy`
    package — a real Flask extension wrapping SQLAlchemy itself, the
    same real package legacy's own backend already depends on.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — constructing one real instance (with
    no arguments) creates a real, reusable object, not yet attached to
    any specific real Flask app; that real attachment happens
    separately, via `db.init_app(app)`, below — a deliberate real
    two-step split, so the identical real `db` object can be attached
    to a genuinely different real `Flask` app per real call, the same
    real reason `create_app` itself is a function and not a
    module-level global.
  - *Its use:* this lesson constructs exactly one real instance, at
    module scope, the same real pattern legacy's own real
    `backend/app/__init__.py` already uses.
  - *Type:* a class; `SQLAlchemy()` is a constructor call.
  - *Responsibility:* providing the one real, shared object every real
    model in this project will eventually define its own real table
    through, and the one real object real database queries will
    eventually run against.
  - *Depends on:* nothing at construction time; a real, later call to
    `init_app(app)` before it can actually do anything.
  - *Connects to:* constructed once, at real module scope; attached to
    a real, specific `Flask` app inside `create_app`, below.
  - *Shape:* the real, central object this project's entire real
    **ORM** layer will be built around, from here forward.

- **`SQLAlchemy.init_app(app)`**
  - *What it is:* a real instance method on the `SQLAlchemy` object,
    above.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — reads the given real `Flask` app's own
    `app.config` for real, SQLAlchemy-specific settings (`
    SQLALCHEMY_DATABASE_URI`, among others) and attaches this real `db`
    object to that specific real app, so real queries run through it
    actually reach that app's own real, configured database.
  - *Its use:* this lesson's `create_app` calls it once, after loading
    real configuration onto the app, so the module-level `db` object
    above is actually usable for this specific real app instance.
  - *Type:* an instance method on `SQLAlchemy`, called on a real,
    already-constructed `app` object.
  - *Responsibility:* the real, deliberate second half of Flask-
    SQLAlchemy's own two-step setup — binding an already-existing real
    `db` object to one specific real `Flask` app's own real
    configuration.
  - *Depends on:* a real, already-configured `Flask` app — real
    configuration has to be loaded onto it first, or there's nothing
    real for this call to read.
  - *Connects to:* called once, inside `create_app`; every real model
    this project defines later imports the identical real `db` object
    this method attaches.
  - *Shape:* the real seam between "a reusable ORM object exists" and
    "this specific real app can actually use it."

- **`Flask.config.from_object(config_class)`**
  - *What it is:* a real method on `app.config`, itself a real,
    dict-like object every `Flask` instance already has.
  - *Implementation:* checked against Flask's own official
    documentation this session — reads every real, uppercase class
    attribute off the given real class (or class instance) and copies
    each one into `app.config`, making it a real, readable setting from
    anywhere the app is accessible.
  - *Its use:* this lesson's `create_app` calls it once, with a real
    **Configuration class** selected by the real `config_name` argument
    — the first real thing that argument actually does, since it was
    added to `create_app`'s own signature.
  - *Type:* an instance method on `app.config`.
  - *Responsibility:* loading a whole, real, named set of configuration
    values onto an app in one real call, rather than setting each real
    key by hand.
  - *Depends on:* a real class (or instance) whose real, uppercase
    attributes are meant to become real config values.
  - *Connects to:* called once, inside `create_app`, before
    `db.init_app(app)`, above, which reads what this call just loaded.
  - *Shape:* Flask's own real, standard configuration-loading
    mechanism — not project-specific, the same real method legacy's own
    `create_app` already calls.

---

## Concept Unit: A Config Class, Selected By Name

### The Problem

`create_app` has accepted a real `config_name` parameter since Lesson
2, but nothing has ever used it — this application has had no real,
per-environment behavior to choose between until now. The real question
this unit answers: what is the actual smallest real way to let
`config_name='testing'` mean something concrete, the same real way
legacy's own `config_name` already does?

> **Before reading on:** legacy's own real `backend/config.py` maps a
> real string (`'testing'`, `'development'`, `'production'`) to a real
> Python *class*, not a real dictionary of raw values. Given a real
> class's own attributes can hold real, typed Python values directly —
> a real string, a real boolean — what real advantage does a class have
> here over, say, a real JSON config file this project would have to
> parse first?

### Project Change

- **Reference Source** — `backend/config.py`, read in full this
  session: a real `Config` base class, three real subclasses
  (`DevelopmentConfig`, `ProductionConfig`, `TestingConfig`), and a real
  `config` dictionary mapping real string names to each real class.
  This unit deliberately Preserves only the real shape this project
  actually needs right now — a base class and a real `TestingConfig` —
  not legacy's own real `DevelopmentConfig`/`ProductionConfig`, which
  nothing in `rebuild` has a real reason to run under yet.
- **Files affected** — created: `rebuild/backend/config.py`.
- **Change type** — add (new file).
- **Location** — sibling to `rebuild/backend/run.py`, outside the real
  `app/` package — the identical real location legacy's own
  `config.py` already lives in.
- **Dependencies** — `flask-sqlalchemy`, a real, new dependency this
  unit installs.

### The New Code

```python
class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'testing': TestingConfig,
    'default': TestingConfig,
}
```

### The Updated Project

`rebuild/backend/config.py`, in full — brand new, so this is the whole
file:

```python
1  class Config:
2      SQLALCHEMY_TRACK_MODIFICATIONS = False
3
4
5  class TestingConfig(Config):
6      TESTING = True
7      SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
8
9
10 config = {
11     'testing': TestingConfig,
12     'default': TestingConfig,
13 }
```

### The Isolated Example

A real Python class used purely to hold named values, never
instantiated, is genuinely new to this series' own backend code.
Isolated, throwaway, and *not* part of this project:

```python
# throwaway_config.py — not part of this project, deleted after this unit
class Colors:
    PRIMARY = 'blue'
    SECONDARY = 'gray'


print(Colors.PRIMARY)
```

Not run this session — stated from confidence, not executed, per the
Verification Rule: this is ordinary, extremely well-known Python class-
attribute access, not something this lesson has any real doubt about.
Confidently predicted:

```
blue
```

This proves, in isolation, exactly what `Config`/`TestingConfig` depend
on: a real Python class can hold real, named values as class attributes
— `Colors.PRIMARY`, reached without ever writing `Colors()` — and a
real subclass (were `Colors` subclassed) would inherit every real
attribute its own real parent already defines, exactly how
`TestingConfig(Config)` below inherits `SQLALCHEMY_TRACK_MODIFICATIONS`
without restating it.

### Discard the Throwaway Example

`throwaway_config.py` and `Colors` never become part of
`rebuild/backend` — they exist only to isolate real class-attribute
access and real inheritance from this unit's own actual, real config
classes.

### Mechanical Walkthrough

- **Line 1, `class Config:`** — this lesson's Header's own
  **Configuration class** term, applied for real: an ordinary Python
  class, holding no real methods, only real, shared attributes every
  real environment's own config will need.
- **Line 2, `SQLALCHEMY_TRACK_MODIFICATIONS = False`** — a real,
  Flask-SQLAlchemy-specific setting, read later by this lesson's
  Header's own `SQLAlchemy.init_app(app)`; `False` disables a real,
  separate, legacy real-time change-tracking feature this project has
  no real use for, matching legacy's own real, identical value.
- **Line 5, `class TestingConfig(Config):`** — a real subclass,
  inheriting `Config`'s own real attribute, per this unit's own
  Isolated Example, above.
- **Line 6, `TESTING = True`** — a real, Flask-recognized setting;
  `True` tells Flask itself this app is running under test conditions —
  among other real effects, real exception handling changes slightly,
  surfacing real errors more directly.
- **Line 7, `SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'`** — this
  lesson's Header's own **In-memory database** term, applied for real:
  a real, standard SQLAlchemy connection string, `sqlite:///` naming the
  real SQLite dialect, `:memory:` naming the real, special, in-memory
  database instead of a real file path — the identical real value
  legacy's own `TestingConfig` already uses.
- **Line 10, `config = {`** — a real, plain Python dictionary, mapping
  real string names to real classes themselves (not real instances of
  them) — the identical real shape legacy's own real `config`
  dictionary already uses, deliberately narrowed to the one real
  environment this project actually runs under so far.

### CS Lens

This is a real instance of the **Strategy pattern** — a real, named
choice (`'testing'`) selects one whole, real, swappable bundle of
behavior (a real config class) from a real set of interchangeable
options, rather than branching on scattered real `if` statements
throughout the codebase every time environment-specific behavior is
needed.

Also recognized in: a real logging library's own named log levels, each
one a real, swappable bundle of what actually gets recorded; a real
payment processor's own sandbox-vs-live mode, selected by one real
setting rather than real conditionals sprinkled through checkout code;
any real system offering a small, fixed, real menu of whole behaviors
instead of many independent real flags.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own real `DevelopmentConfig` and `ProductionConfig` right now, alongside
`TestingConfig`. Rejected on purpose, the identical real reason this
series' own very first backend lesson already gave for not porting
legacy's whole `create_app` at once: `rebuild` has no real reason to run
in development or production mode yet — nothing serves real traffic,
nothing needs a real, persistent database file. Building those two real
classes now would be real, speculative infrastructure, exactly what
this series' own README already names as a rule to avoid. The real,
honest cost accepted here: `config.py` will grow again, for real, the
moment a real, later lesson actually needs a real, persistent database
or a real, running production mode — not a shortcut, the correct order.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
../../backend/.venv/Scripts/python.exe -m pip install flask-sqlalchemy
```

### Run it, per the Verification Rule

Not run this session — a real, freshly-defined Python class with no
real logic in it carries no real doubt about whether it "works"; there
is nothing yet to run it against. This unit's own real proof comes from
the next unit, once `create_app` actually uses this file.

### Connecting this unit to what came before

`config_name` has existed on `create_app`'s own signature since this
application's very first real line of code, unused. This unit is the
first time a real value passed through it actually means something.

---

## Concept Unit: Wiring the Real Database Into `create_app`

### The Problem

A real config class now exists, and a real `SQLAlchemy` object needs to
exist somewhere too — but `create_app` is a function, called fresh
every time, per this series' own already-established **Application
factory** pattern, while a real, importable `db` object needs to be
reachable by name from other real files (a real `User` model, in a
later lesson, will need to write `from app import db`). The real
question this unit answers: how does a real object built once, at real
module scope, get correctly attached to a genuinely different real
`Flask` app on every single real call to `create_app`?

### Project Change

- **Reference Source** — `backend/app/__init__.py`, read in full this
  session: `db = SQLAlchemy()` at real module scope, then, inside
  `create_app`, `app.config.from_object(config[config_name])` followed
  by `db.init_app(app)`.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function; a new
  real module-level line above it.
- **Dependencies** — this unit's own new `config.py`, and
  `flask-sqlalchemy`, already installed in the previous unit.

### The New Code

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import config

db = SQLAlchemy()


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    db.init_app(app)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}

    return app
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — replacing the earlier,
simpler version entirely, so this is the whole file:

```python
1  from flask import Flask
2  from flask_sqlalchemy import SQLAlchemy
3  from config import config
4
5  db = SQLAlchemy()
6
7
8  def create_app(config_name='default'):
9      app = Flask(__name__)
10     app.config.from_object(config[config_name])
11     db.init_app(app)
12
13     @app.route('/health')
14     def health_check():
15         return {'status': 'healthy'}
16
17     return app
```

### Mechanical Walkthrough

- **Line 2, `from flask_sqlalchemy import SQLAlchemy`** — this lesson's
  Header's own `SQLAlchemy` class, imported for the first time.
- **Line 3, `from config import config`** — a real, standard Python
  import, reaching the previous unit's own real `config` dictionary.
- **Line 5, `db = SQLAlchemy()`** — this lesson's Header's own
  `SQLAlchemy`, constructed once, at real module scope — outside
  `create_app`, deliberately, so the identical real `db` object is
  importable by name (`from app import db`) from anywhere else in this
  project, the same real reason legacy's own backend already does this.
- **Line 8, `def create_app(config_name='default'):`** — the real,
  existing factory function; `config_name`'s own real default changes
  from `None` to the literal string `'default'`, matching this unit's
  own real `config` dictionary key, so a real, argument-less call still
  resolves to a real, valid config instead of raising a real `KeyError`.
- **Line 10, `app.config.from_object(config[config_name])`** — this
  lesson's Header's own `Flask.config.from_object(...)`, called with
  `config[config_name]` — a real dictionary lookup, resolving the real
  string this call was given into one of the previous unit's own real
  config classes.
- **Line 11, `db.init_app(app)`** — this lesson's Header's own
  `SQLAlchemy.init_app(app)`, attaching the module-level `db` object,
  line 5, to this specific real `app` instance, now that real
  configuration has actually been loaded onto it for this real call to
  read.

### CS Lens

This is a real instance of **dependency injection via configuration** —
`create_app` doesn't decide, by itself, which real database to connect
to; it's told, each real call, by whatever real config class
`config_name` resolves to. The identical real function produces a
genuinely different, real, working application depending only on what
real name it's given.

Also recognized in: a real web server reading its own real listen port
from an environment variable instead of hardcoding it; a real test
suite injecting a real, fake clock instead of the real system time; any
real system where *what* gets built is decided from outside the code
that builds it.

### SE Lens

The real, deliberately *not*-taken alternative here: calling
`db.init_app(app)` before `app.config.from_object(...)`. Rejected — not
a stylistic preference, a real, functional requirement: `init_app`
reads `app.config` the moment it's called, per this lesson's Header's
own documented behavior; calling it first would attach `db` to an app
with no real `SQLALCHEMY_DATABASE_URI` set at all yet, a real, silent
mistake this unit's own line order avoids entirely by construction.

### Commands needed

This unit's own real proof reuses this project's own shared
acceptance-test harness, unmodified, pointed at `rebuild` instead of
`legacy`:

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='new'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_health.py -v
```

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: adding a
real, unused-so-far database connection alongside an already-working
route changes nothing about how that route itself answers a real
request; Flask and Flask-SQLAlchemy's own documented behavior gives no
real reason `/health` would stop returning `200`. Confidently predicted,
in the identical real shape this series has already proven for real
against `legacy`:

```
test_health.py::test_health_returns_200_and_status_healthy PASSED [100%]
1 passed in ...s
```

If this does *not* happen exactly this way when actually run, that's a
real signal something above is wrong — most likely a real, missing
`flask-sqlalchemy` install, or a real typo in `config_name`'s own
default — worth stopping to investigate before continuing.

### Connecting this unit to what came before

The previous unit built a real, inert config class, not yet used
anywhere. This unit is what actually connects it to a running
application, proven not to have broken the one real thing already
working.

---

## Connect the pieces

`rebuild/backend` now has a real, configurable database connection,
proven not to interfere with the one real route already built —
without a single real table, model, or query existing yet. Nothing
here is login-specific; this is real, shared infrastructure any future
real feature needing persistence will also depend on.

---

**Next lesson:** the first real table this database connection
actually holds — a real `User` model, matching legacy's own real
fields, the next real piece login's own implementation needs before a
real password can even be checked.
