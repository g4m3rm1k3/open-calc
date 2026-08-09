# Lesson 2.1: A Database Connection

## What you will build

Not a model yet, but what every model needs to exist first: a
configured connection between this backend and a file-based SQLite
database. The first real entity comes next, once there's somewhere for
it to actually live.

## What you need to know first

`concepts/flask-application-and-route-decorator.md`'s own factory
pattern (already applied, Lesson 1.1). Everything else is taught from
scratch or cited from `concepts/`.

## Terms introduced

- **Manifest/config file** — `config.py`, a file holding settings the
  application reads at startup (a database location, a debug flag)
  instead of hardcoding them into application logic.
- **ORM** (object-relational mapping) — a library that lets Python
  classes stand in for database tables, translating attribute access
  and method calls into real SQL underneath.
- **Declarative model** — a class whose attributes, just by being
  defined with `db.Column(...)`, describe a table's real schema; the
  ORM reads the class itself to know what SQL to generate.
- **Deferred extension initialization** — creating an extension object
  (`db = SQLAlchemy()`) before any specific application exists, then
  binding it to one later with `db.init_app(app)`.

---

## Concept Unit: A Configured Database

### The Problem

Every entity this project adds from here on (a machine, a part, an
operation) needs somewhere to actually be stored between requests —
right now, this backend has no database connection at all; every
request would have to invent its own answer, and nothing would persist
past a restart.

### Concepts reused, 100% match — not re-taught here

- `concepts/orm-object-relational-mapping.md` — the general idea:
  Python classes standing in for tables, real SQL still underneath.
- `concepts/sqlite-file-based-database.md` — the file-based engine this
  project's own `SQLALCHEMY_DATABASE_URI` actually points at.

### New concept, no match: Flask-SQLAlchemy's own style

Full treatment in `concepts/flask-sqlalchemy-declarative-model.md` —
not repeated here. That file exists specifically because
`concepts/sqlalchemy-mapped-column-types.md` teaches modern
SQLAlchemy's
`Mapped[T]`/`mapped_column()` syntax, which the original application
does **not** use anywhere — it uses the older, still current,
`db.Model`/`db.Column(db.Type, ...)` style throughout, a genuinely
different, non-interchangeable API over the identical underlying
engine.

### New concept, no match: the deferred `init_app` pattern

Full treatment in `concepts/flask-extension-deferred-init-app.md` — not
repeated here. That file's own isolation lab proves, with a printed
`db is db` comparison, that the same extension object can be bound to
more than one Flask app in turn via `init_app`, and captures the exact
error (`RuntimeError: ... not registered with this 'SQLAlchemy'
instance`) `db.create_all()` raises without it.

### Discard the throwaway examples

Both concept files' own labs are discarded, per their own files — their
literal `Pet`/`pets` example never appears in this project.

### Project Change

- **Reference Source** — the original application's `config.py` (the
  `Config`/`DevelopmentConfig`/`config` dict, in part); `app/__init__.py`,
  the config-loading and SQLAlchemy-related lines specifically (not the
  whole file — Migrate, SocketIO, blueprints, static serving, and
  `seed_users()` all stay deferred, named explicitly, same as Lesson
  1.1's own list).
- **Files affected** — Created: `config.py`. Modified: `app/__init__.py`,
  `requirements.txt`, all in the backend folder.
- **Change type** — Add.
- **Location** — `__init__.py`: `db = SQLAlchemy()` at module scope,
  above `create_app`; the config-loading/`db.init_app`/`db.create_all()`
  lines inside `create_app`, before the `/health` route.
- **Dependencies** — An empty `data/` directory must exist before the
  first run — SQLite does not create missing *parent* directories for
  its own database file, only the file itself.

### Type this

Create `config.py`:

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.absolute()


class Config:
    DATA_PATH = os.environ.get('DATA_PATH', str(BASE_DIR / "data"))
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(DATA_PATH, "manufacturing.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True


config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}
```

Update `app/__init__.py` so it now reads:

```python
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()


def create_app(config_name: str = None) -> Flask:
    from config import config

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)

    app.config.from_object(config.get(config_name, config['default']))

    CORS(app, resources={r"/*": {"origins": "*"}})

    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Manufacturing Platform API is running'}

    return app
```

Update `requirements.txt` — add one line:

```
flask==3.0.0
flask-sqlalchemy==3.1.1
flask-cors==4.0.0
```

### The Updated Project

`config.py` is brand-new, shown whole above. `__init__.py`'s full,
current content is shown whole above.

### Mechanical Walkthrough

- `BASE_DIR = Path(__file__).parent.absolute()` — what a `Path` object
  is, what `__file__` holds, and what `.parent`/`.absolute()` each do
  is covered in `concepts/python-pathlib-path.md`, not repeated here;
  the result is this file's own containing directory, as an absolute
  path, regardless of what directory the program was launched from.
- `DATA_PATH = os.environ.get('DATA_PATH', str(BASE_DIR / "data"))` —
  what `os.environ.get(key, default)` does, and why it's used instead
  of a plain `os.environ[key]` lookup, is covered in
  `concepts/os-environ-get.md`; here it lets a real deployment override
  the data location without editing this file, while defaulting to a
  `data`
  folder next to this one on a developer's own machine.
- `DATA_PATH` / `SQLALCHEMY_DATABASE_URI` /
  `SQLALCHEMY_TRACK_MODIFICATIONS` — direct application of `sqlite-
  file-based-database.md`'s own file-based connection idea:
  `sqlite:///{path}` is the standard connection-string form naming a
  file on disk, ported exactly.
  `f'sqlite:///{os.path.join(DATA_PATH, "manufacturing.db")}'` is a
  **f-string** (`concepts/python-f-strings.md`) — the leading `f`
  before the opening quote means any
  `{expression}` written inside the string is evaluated and substituted
  in, right there, at the point the string is built; the call to
  `os.path.join(...)` runs first, and its returned path string is
  spliced directly into `sqlite:///...`, producing one complete
  connection string with no separate concatenation or `.format()` call
  needed. `SQLALCHEMY_TRACK_MODIFICATIONS = False` — a standard Flask-
  SQLAlchemy setting disabling an extra change-tracking feature this
  project doesn't use, matching the original exactly.
- `class DevelopmentConfig(Config): DEBUG = True` / `config = {...}` —
  reapplies already-established Python class inheritance; the `config`
  dict is what `config.get(config_name, config['default'])` looks names
  up in.
- `db = SQLAlchemy()` — direct application of `flask-extension-
  deferred-init-app.md`'s own pattern: a usable object, importable by
  any future model file, before any `create_app()` call happens.
- `from config import config` (inside `create_app`) — reapplies
  already-established Python imports; deliberately placed *inside* the
  function (matching the original's own placement, per its own comment
  already read this session: avoiding a circular import, since
  `config.py` might itself grow to import things that import back from
  `app`).
- `if config_name is None: config_name = os.environ.get('FLASK_ENV',
  'development')` — `os.environ.get` reappearing
  (`concepts/os-environ-get.md`, already cited above) — the first real
  *use* of
  `config_name`, the parameter Lesson 1.1 ported but left unused until
  now.
- `app.config.from_object(config.get(config_name, config['default']))`
  — what `app.config` is and what `from_object` actually copies (only
  UPPERCASE attributes, from any object handed to it) is covered in
  `concepts/flask-config-from-object.md`; here it looks the config
  class up by name, falling back to `DevelopmentConfig` for any
  unrecognized name.
- `db.init_app(app)` — direct application of `flask-extension-
  deferred-init-app.md`'s own second step, binding the already-existing
  `db` object to this specific app.
- `with app.app_context(): db.create_all()` — what an application
  context actually is, and why `with` is needed at all, is covered in
  `concepts/flask-application-context.md`; `db.create_all()` itself is
  direct application of `orm-object-relational-mapping.md`'s own
  schema-creation idea (`Base.metadata.create_all(engine)` there,
  the Flask-SQLAlchemy equivalent here) — it needs that context active
  because it has to know *which* app's config (and therefore which
  database) to act against, the same reason `db.init_app` needed a
  specific `app` a moment earlier.

### Execution Trace

This code runs on every server startup — trace it:

```
1. `python run.py` calls `create_app()`.
2. `config_name` is `None` (the default), so it falls back to
   `os.environ.get('FLASK_ENV', 'development')` → `'development'`
   (no `FLASK_ENV` variable set in this session).
3. `config.get('development', config['default'])` looks up
   `'development'` in the `config` dict → finds `DevelopmentConfig`.
4. `app.config.from_object(DevelopmentConfig)` copies every UPPERCASE
   attribute — `DATA_PATH`, `SQLALCHEMY_DATABASE_URI`,
   `SQLALCHEMY_TRACK_MODIFICATIONS`, `DEBUG` — onto `app.config`.
5. `CORS(app, ...)` runs, as it already did in Lesson 1.3.
6. `db.init_app(app)` binds the already-existing `db` object to this
   specific `app`, using the config just loaded in step 4 to know
   which database file to point at.
7. `with app.app_context():` opens a context naming `app` as "the
   current app" for anything that asks; `db.create_all()` runs inside
   it, checks the real file at `SQLALCHEMY_DATABASE_URI`, and creates
   any table declared by a registered model that doesn't already
   exist — currently zero, since no model has been declared yet.
8. `/health` is registered, as in Lesson 1.1. `create_app()` returns
   `app`. `run.py` starts listening.
```

## CS Lens

Not a new CS idea beyond what this lesson's own cited/new concept files
already name.

## SE Lens

`db.create_all()` runs unconditionally, every startup, rather than only
once, ever. Its own documented behavior — safe to call repeatedly, only
creating tables that don't already exist, never touching ones that do —
is what makes this safe: a second `python run.py` against an
already-populated database does nothing destructive, it just confirms
the schema already matches. The honest limit, worth naming now even
though it isn't a problem yet with zero models: `db.create_all()` never
*alters* an existing table's columns — adding a field to an existing
model later needs a real migration tool (`Migrate`, still deferred), not
this call.

## Commands needed

```
cd backend
mkdir data
.venv/Scripts/python.exe -m pip install flask-sqlalchemy==3.1.1
.venv/Scripts/python.exe run.py
```

`mkdir data` is the necessary setup step named in this lesson's own
Dependencies, above — SQLite will not create it for you.

## Run it

Captured this session — the backend still answers:

```
curl -s http://127.0.0.1:5000/health
```

```json
{"message": "Manufacturing Platform API is running", "status": "healthy"}
```

Captured proof a database file now genuinely exists:

```
ls -la data/
```

```
-rw-r--r-- 1 g4m3r 197610 0 Aug  8 15:34 manufacturing.db
```

An empty (`0` bytes) file — expected: `db.create_all()` ran against zero
registered models, so there was, correctly, nothing to create yet.

### Connect

This backend now has a working, configured database connection — every
model this project adds from here on has somewhere to actually be
stored, and every request this backend answers can now, in principle,
read or write durable data instead of inventing an answer fresh each
time.

---

## Connect the pieces

One startup, traced start to finish in the Execution Trace above:
`run.py` calls `create_app()`; `config_name` falls back to
`os.environ.get('FLASK_ENV', 'development')`, `app.config.from_object(
...)` loads `DevelopmentConfig`'s own `SQLALCHEMY_DATABASE_URI`,
`db.init_app(app)` binds the already-existing `db` object (`flask-
extension-deferred-init-app.md`) to this specific app using that
config, and `db.create_all()`, inside an app context, creates (currently
zero) tables at the file path that config named — proven by the `ls`
output above, a genuine file where none existed before.

## What breaks without this

Captured this session by temporarily removing `db.init_app(app)`
(keeping every other line unchanged) and restarting:

```
python run.py
```

```
RuntimeError: The current Flask app is not registered with this
'SQLAlchemy' instance. Did you forget to call 'init_app', or did you
create multiple 'SQLAlchemy' instances?
```

Reading this per `concepts/reading-a-stack-trace.md`: the last line
names the error and, unusually, also names the likely fix directly — a
genuine `db` object, fully valid and importable, but never told *which*
app's config to act against; `db.create_all()`, needing that binding to
know what to connect to at all, fails immediately and loudly. Restored:

```python
    db.init_app(app)
```

The identical startup, run again, succeeds with no error.

## Exercises

1. In your own words: why is `db.init_app(app)` called *inside*
   `create_app()`, while `db = SQLAlchemy()` sits *outside* it, at
   module scope?
2. Delete `data/manufacturing.db` (not the folder) and restart the
   server — confirm `db.create_all()` transparently recreates it,
   empty, with no error — direct proof of this lesson's own SE Lens
   claim.
3. Run `node scripts/check-fidelity.mjs diff <commit>` against this
   lesson's commit with no `--allow-new` at all. In your own words: why
   does porting `config_name`'s real *use* now need no exception, when
   the parameter itself was already ported, unused, back in Lesson 1.1?

## Definition of done

- [ ] `mkdir data`, run inside your backend folder, creates the
      required directory.
- [ ] `python run.py` starts with no errors and still answers `/health`
      correctly.
- [ ] A `data/manufacturing.db` file exists after the first run.
- [ ] Removing `db.init_app(app)` reproduces the exact `RuntimeError`
      above; restoring it fixes the identical run.
- [ ] `concepts/flask-sqlalchemy-declarative-model.md` and
      `concepts/flask-extension-deferred-init-app.md` both exist, were
      reasoned about for real this session, and are referenced by name
      here rather than re-derived.

Stage and commit:

```
git add .
git commit -m "Lesson 2.1: A Database Connection"
```

This message states *why* the commit exists — this backend can now
genuinely connect to a durable database — not merely which files
changed.

---

**Next lesson:** the first real entity — `User`, and real sign-in. Not
a machine, a part, or any other piece of shop-floor data — this
curriculum follows a user's own path through the application, and a
user reaches it through sign-in before anything else.
