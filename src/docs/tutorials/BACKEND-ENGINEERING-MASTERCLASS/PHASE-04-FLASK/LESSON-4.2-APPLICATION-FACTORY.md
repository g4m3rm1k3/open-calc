# Lesson 4.2: Application Factory

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Three real, run checks proving why this project's own real backend builds its app through a function, `create_app`, rather than a bare, module-level `app = Flask(__name__)`: real proof that Python's own import system caches a module but `create_app`'s own function call carries no such cache; a real look at why this project's own `db` object is created outside that function and only initialized inside it; and, closing the lesson, real, direct proof of the actual payoff - two independently-built real apps, from the identical real function, with genuinely isolated real databases.

**What you need to know first:** What the real WSGI application object, request context, and routing this project's own Flask app provides; what a Python module import actually does.

## Terms used in this lesson

- **application factory** — A real, plain function - `create_app`, in this project - that builds and returns a fully-configured `Flask` instance, rather than a bare, module-level `app` object existing the moment the module is imported. It exists so a real, independent app instance can be built fresh, on demand, as many real times as needed, instead of every part of a codebase sharing the identical real, single instance by default.
- **deferred initialization** — The real, two-step pattern this project's own code follows for its `db` object - created once, real, at module level, with no real app attached yet (`db = SQLAlchemy()`), then bound to a specific real app later, inside the factory (`db.init_app(app)`). It exists so real model files can import `db` directly, at any time, without needing a real, already-built `app` to exist first.

## Objects and methods used

- **`create_app`**
  - *What it is:* This project's own real application factory function, already studied in the previous lesson, revisited here specifically for why it exists as a function at all.
  - *Implementation:* `def create_app(config_name: str = None) -> Flask: ...` (`backend/app/__init__.py:172-444`) - every real call builds a genuinely new `Flask` instance from scratch (`app = Flask(__name__)`, `:244`), then attaches real configuration and every real blueprint to that one, specific instance.
  - *Its use:* This lesson calls it multiple times in a row, specifically to observe whether repeated calls share any real state at all.
  - *Type:* A real, module-level function - the application factory pattern.
  - *Responsibility:* Producing one real, independent, fully-configured `Flask` instance per call, with no real state carried over from any previous call.
  - *Depends on:* A real config name.
  - *Connects to:* Every real lesson in this curriculum that has called `create_app("testing")` has been relying on this real, per-call independence, whether or not it was ever named directly before now.
  - *Shape:* Takes an optional real config name string in; returns one real, freshly-built `Flask` instance out, every single call.

- **`db (module-level SQLAlchemy instance)`**
  - *What it is:* This project's own real, single `SQLAlchemy` instance, created at module level in `backend/app/__init__.py`, before `create_app` is ever called.
  - *Implementation:* `db = SQLAlchemy()` (`backend/app/__init__.py:158`) creates the real object with no `app` argument at all; later, inside `create_app`'s own real body, `db.init_app(app)` (`:263`) binds it to one specific, real `Flask` instance. The real comment block immediately above the module-level creation (`:134-153`) states this project's own stated reason: real model files (`from app import db`) need `db` to exist the moment they're imported, which can happen before any real `app` has been built at all.
  - *Its use:* This lesson imports it directly, before calling `create_app` at all, specifically to confirm it already exists as a real object at that point.
  - *Type:* A real, module-level `SQLAlchemy` instance.
  - *Responsibility:* Existing as one real, stable, importable name every model file can depend on, independent of whichever specific real `Flask` app instance it eventually gets bound to.
  - *Depends on:* Nothing, to exist; a real `Flask` app, via `.init_app(app)`, to actually do anything useful.
  - *Connects to:* Every real model in this project (`Machine`, `User`, and every other) imports this identical real object directly; this lesson's own closing unit proves it correctly serves two genuinely different real app instances at once.
  - *Shape:* `SQLAlchemy()` takes no required arguments; `.init_app(app)` takes one real `Flask` instance and returns nothing, mutating the instance in place.

## Concept Unit: A Function Call Isn't a Cached Import

### The Problem

Python's own real import system caches a module the first time it's imported - importing it again returns the identical real object, not a fresh one. Does calling `create_app()` behave the same way?

Before reading on:

- If `backend/app/__init__.py` instead built `app = Flask(__name__)` directly at module level, with no wrapping function, what would two separate real files doing `from app import app` actually get - two real, independent apps, or the identical real one?
- Given that `create_app` is a real, plain function, not a module-level variable, what would you expect two separate real calls to it to return?

### Project Change

- **Reference Source:** Real specimen: `backend/app/__init__.py:172-444` (`create_app`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None.

### The New Code

The real `app` module, imported twice, next to `create_app` called twice:

**File:** `verification/phase-04/lab_factory_module_caching.py` (new)

```python
import sys
sys.path.insert(0, "backend")

import app as app_module

print("app_module.create_app is a real function:", callable(app_module.create_app))

import app as app_module_again
print("re-importing the app module returns the identical real module object:", app_module is app_module_again)

app1 = app_module.create_app("testing")
app2 = app_module.create_app("testing")
print("but calling create_app() twice returns two genuinely different real objects:", app1 is not app2)

assert app_module is app_module_again
assert app1 is not app2
print("Python's own real import system caches a module - the identical real object every time; create_app's own real function call carries no such cache, producing a genuinely new real Flask instance every single call")
```

### Mechanical Walkthrough

- `import app as app_module; import app as app_module_again` — Two real, separate `import` statements for the identical real module - Python's own real import machinery caches the first result in `sys.modules`, so the second import returns the identical real object rather than re-executing the module's own top-level code.
- `app1 = app_module.create_app("testing"); app2 = app_module.create_app("testing")` — Two real, explicit function calls - `create_app`'s own real body runs in full both times, building a genuinely new `Flask()` instance each real call, with no caching of any kind.
- `assert app_module is app_module_again / assert app1 is not app2` — Confirms both real, opposite facts together - the module itself is real, cached, singular state; the app it produces, through the factory function, is not.

### CS Lens

This is the **factory pattern**: a real function whose entire real job is producing a new instance, deliberately avoiding any real, shared, module-level singleton. Also recognized in: a real database connection pool's own `get_connection()` method, handing back a genuinely available real connection rather than one, shared global one; a real logging library's own `getLogger(name)` function, returning a distinct real logger per name rather than one real, global logger everyone writes to; and, in this project's own domain, a real CAM post-processor generating a genuinely new real NC program per real part, rather than one, shared, mutated program file.

### SE Lens

The design principle is that a real factory function trades a small amount of real, up-front ceremony (calling `create_app()` explicitly, instead of just importing a ready-made `app`) for genuine, real independence between instances. The real alternative not chosen: the bare, module-level `app = Flask(__name__)` this lesson's own socratic prompt considered - real, simpler to write, real, one line shorter; the honest cost of that simpler real alternative, proven directly by this unit's own real run: Python's own real module caching would mean every real test, every real request handled in the same process, and every other real piece of code that imported `app` would share the identical real instance, with no real way to build a second, independently configured one without deleting the module from `sys.modules` by hand.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-04/lab_factory_module_caching.py` — Runs this as a plain script, from the repository root.

### Verification

```text
app_module.create_app is a real function: True
re-importing the app module returns the identical real module object: True
Seeding default users...
Seeding default users...
but calling create_app() twice returns two genuinely different real objects: True
Python's own real import system caches a module - the identical real object every time; create_app's own real function call carries no such cache, producing a genuinely new real Flask instance every single call
```

Full saved run: `verification/phase-04/lab_factory_module_caching_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the real, structural difference a factory function actually provides over a bare, cached module-level object.

## Concept Unit: Deferred Initialization - db Exists Before app Does

### The Problem

`backend/app/__init__.py`'s own real code creates `db = SQLAlchemy()` (`:158`) with no `app` argument at all, and only calls `db.init_app(app)` (`:263`) later, inside `create_app`. Why not just build `db` with the app already attached?

Before reading on:

- Every real model file in this project (`Machine`, `User`, and every other) does `from app import db` at the top of the file. If `db` only existed as a real name once `create_app()` had already run and returned, could those real model files even be imported before that happened?
- `register_routes(app)` (called inside `create_app`) imports every real route file, which in turn imports every real model file. Does that import chain happen before or after `db = SQLAlchemy()` (`:158`) has already run, given where each real line sits in this file?

### Project Change

- **Reference Source:** Real specimen: `backend/app/__init__.py:134-153` (this project's own real, stated design rationale, in its own comments) and `:158`/`:263` (`db = SQLAlchemy()` and `db.init_app(app)`), all read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None.

### The New Code

The real, module-level `db` object, inspected before `create_app` is ever called, then used successfully after it is:

**File:** `verification/phase-04/lab_factory_deferred_init.py` (new)

```python
import sys
sys.path.insert(0, "backend")

import app as app_module

print("real, module-level db object exists before create_app is ever called:", app_module.db)
print("real db.init_app is a real, bound method:", callable(app_module.db.init_app))

app = app_module.create_app("testing")
with app.app_context():
    from app.models.machine import Machine
    real_count = Machine.query.count()
    print("real Machine model, imported after create_app ran, queries successfully through the identical real db object -> real row count:", real_count)

print("the identical real module-level `db = SQLAlchemy()` object is what every real model file imports directly (`from app import db`) - it exists the moment this module is first imported, long before any real Flask app has been built at all")
```

### Mechanical Walkthrough

- `print("real, module-level db object exists before create_app is ever called:", app_module.db)` — Reads `app_module.db` before calling `create_app` at all - succeeds, and prints a real, already-constructed `SQLAlchemy` instance, confirming `db = SQLAlchemy()` (`:158`) already ran the moment this module was first imported, as a real, top-level statement.
- `app = app_module.create_app("testing")` — Only now does `db.init_app(app)` (`:263`) actually run, inside `create_app`'s own real body - binding the identical, already-existing real `db` object to this one, specific real app.
- `Machine.query.count()` — A real query, run through `Machine` - a model file that itself did `from app import db` at its own top level, proving that import succeeded correctly however early it happened, because `db` was already real and importable by then.

### Mental Model

```text
module import time:        db = SQLAlchemy()             (db exists, unbound)
                                  |
create_app() runs:          app = Flask(__name__)
                                  |
                            db.init_app(app)               (db bound to this app)
                                  |
                            register_routes(app)
                                  |
                      (imports real model files, each doing `from app import db` -
                       already safe, since db has existed since module import time)
```

### CS Lens

This is **deferred binding**: creating a real object before all of its real dependencies are available, then completing its setup later, once they are. Also recognized in: a real dependency injection container, constructing a real service object before its own real dependencies are wired in, then injecting them afterward; a C compiler's own real forward declaration, letting code reference a real function before its full real definition appears later in the file; and, in this project's own domain, a real work order created and given a real ID before the specific real machine that will run it has even been assigned.

### SE Lens

The design principle is breaking a real circular dependency by splitting one real object's construction into two real steps - `db` can exist, real and importable, before the real `app` it will eventually serve is built, because creating it doesn't yet require the app to exist. The real alternative not chosen: `db = SQLAlchemy(app)` at module level, requiring a real `app` to already exist at that exact point in the file - impossible here, since `app` isn't built until `create_app()` is later called, and every real model file needs `db` importable before that. The honest, real cost of the deferred pattern this project's own code actually uses: two real, separate lines of setup (`db = SQLAlchemy()`, then `db.init_app(app)`) have to be kept correctly ordered relative to `register_routes(app)`'s own real import chain, a real ordering requirement nothing in the language itself enforces.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-04/lab_factory_deferred_init.py` — Runs this as a plain script, from the repository root.

### Verification

```text
real, module-level db object exists before create_app is ever called: <SQLAlchemy>
real db.init_app is a real, bound method: True
Seeding default users...
real Machine model, imported after create_app ran, queries successfully through the identical real db object -> real row count: 0
the identical real module-level `db = SQLAlchemy()` object is what every real model file imports directly (`from app import db`) - it exists the moment this module is first imported, long before any real Flask app has been built at all
```

Full saved run: `verification/phase-04/lab_factory_deferred_init_output.txt`.

### Connection to the previous unit

The previous unit showed `create_app` itself producing genuinely new instances; this unit looks at the one real, shared object - `db` - that every one of those instances still has to bind to correctly, and why this project's own code builds it before the app exists at all.

## Concept Unit: Real, Isolated State - Proof the Pattern Actually Works

### The Problem

This lesson has shown `create_app` produces independent real app objects, and that `db` gets bound to whichever app calls `init_app`. Put together, do two real, separately-built apps actually get genuinely separate real databases?

Before reading on:

- If `db` is one real, shared, module-level object, and both `app1` and `app2` call `db.init_app(...)` on it, would you expect a row saved while working with `app1` to be visible while working with `app2` - or does something else about how this project's own code operates keep them apart?
- `TestingConfig`'s own real `SQLALCHEMY_DATABASE_URI` is `'sqlite:///:memory:'` - an in-memory database, unique to whichever real process (and, as this unit will show, whichever real app) creates it. Does that detail matter to the real outcome here?

### Project Change

- **Reference Source:** Real specimen: `backend/config.py:58-62` (`TestingConfig`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond `create_app`.

### The New Code

Two real apps, from the identical real function, tested for real database isolation directly:

**File:** `verification/phase-04/lab_factory_isolation.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app1 = create_app("testing")
app2 = create_app("testing")

print("app1 is app2:", app1 is app2)
print("app1.config is app2.config:", app1.config is app2.config)

with app1.app_context():
    machine = Machine(id="M-ONLY-IN-APP1", name="Test", category="mill", sub_type="3_axis", status="available")
    db.session.add(machine)
    db.session.commit()
    print("inside app1's own real context -> real row count:", Machine.query.count())

with app2.app_context():
    print("inside app2's own real context -> real row count:", Machine.query.count())

assert app1 is not app2
assert app1.config is not app2.config
print("two real, independent Flask apps, built by the identical real function, each with its own genuinely isolated real database - a row committed inside one is completely invisible from the other")
```

### Mechanical Walkthrough

- `app1 = create_app("testing"); app2 = create_app("testing")` — Two real, separate calls, each running `create_app`'s own full real body - including its own real `db.create_all()` (already studied in an earlier lesson), which builds a genuinely new, real, in-memory SQLite database for each.
- `with app1.app_context(): ... db.session.add(machine); db.session.commit()` — Commits a real row while `app1`'s own real context is active - `db.session`, the identical real shared object, resolves to `app1`'s own real, bound database for the duration of this block.
- `with app2.app_context(): print(..., Machine.query.count())` — Queries the identical real `Machine` model, this time inside `app2`'s own real context - `db.session` now resolves to `app2`'s own, genuinely separate real database instead.
- `assert app1.config is not app2.config` — Confirms, for real, that even the real configuration itself is a separate real object per app, not merely the database connection.

### CS Lens

This is **per-instance state isolation through a shared mechanism**: one real, shared `db` object correctly serving multiple real, independent app instances, by resolving to whichever one's real context is currently active. Also recognized in: a real thread pool's own single, shared connection-pool object, handing each real thread its own real, checked-out connection; a real templating engine's own single, shared instance, rendering genuinely different real output depending on which real template context is passed in; and, in this project's own domain, one real machine control program correctly running against whichever real work order is currently loaded, without confusing one job's real state for another's.

### SE Lens

The design principle is that real isolation doesn't require separate objects everywhere - `db` stays one, real, shared instance, while Flask's own real application context is what actually determines which real app's data a given block of code touches. The real alternative not chosen: a genuinely separate `db` object per app, constructed fresh alongside each `Flask()` instance; the honest, real value of the shared-`db`-plus-context approach this project's own code actually uses, proven directly by this unit's own real run: every real model file only ever has to import one real name (`db`), regardless of how many real, separate app instances might exist in the same real process at once - this curriculum's own labs have silently relied on exactly this, calling `create_app("testing")` fresh in nearly every one of them, never once worrying about real state leaking in from a previous lab's own run.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-04/lab_factory_isolation.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
Seeding default users...
app1 is app2: False
app1.config is app2.config: False
inside app1's own real context -> real row count: 1
inside app2's own real context -> real row count: 0
two real, independent Flask apps, built by the identical real function, each with its own genuinely isolated real database - a row committed inside one is completely invisible from the other
```

Full saved run: `verification/phase-04/lab_factory_isolation_output.txt`.

### Connection to the previous unit

The previous unit showed why `db` has to exist before `app` does; this unit closes the lesson with the real payoff - proof that the identical real `db` object correctly serves two, genuinely independent real apps at once, with no real state bleeding between them.

## Connect the pieces

One real function, `create_app`, called twice - producing two genuinely different real `Flask` instances, unlike a plain `import app`, which Python's own real caching would hand back identically every time (the factory itself). One real, module-level `db` object, deliberately created before any real app exists, so every real model file can import it safely regardless of when its own import happens to run, then bound to a specific real app later, inside the factory (deferred initialization). And, closing the lesson, two real apps built from that identical real function, each genuinely isolated from the other - a real row committed while working with one is completely invisible while working with the other, real, direct proof this project's own pattern actually delivers what it promises.

**Next lesson:** Every real app this lesson built passed the string `"testing"` into `create_app` without asking what that string actually controls; next, this curriculum studies configuration itself - environment variables, configuration objects, and the real, different values `"development"`, `"testing"`, and `"production"` each select.