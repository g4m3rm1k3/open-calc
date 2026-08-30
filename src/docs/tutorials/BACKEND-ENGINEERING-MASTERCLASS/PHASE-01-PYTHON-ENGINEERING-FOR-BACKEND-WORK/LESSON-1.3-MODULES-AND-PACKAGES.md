# Lesson 1.3: Modules and Packages

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, small tool, continuing the same `ast`-based investigation technique already used to find routes, this time extracting a real file's own top-level import declarations mechanically - the raw material an actual project-wide import graph would be built from, not that graph itself - then a return to this real backend's own `app/__init__.py`, which turns out to contain a real cycle in that graph between the package that holds the shared database object and the package that holds the routes needing it. Whether a real cycle like this actually fails depends on initialization order, not on the cycle merely existing - and this exact one is deliberately ordered so it doesn't.

**What you need to know first:** Reading a real, existing file as evidence; a real, small tool built from Python's own `ast` module to extract structured facts from source text mechanically.

## Terms used in this lesson

- **Import graph** — The real, directed structure formed by every "this file imports that file" relationship across a whole project - not drawn by hand, but implied automatically by every real `import`/ `from ... import` statement already in the source. It exists as its own concept because a project's real files depend on each other in a specific, real shape, and that shape can be traced mechanically from the source itself rather than assumed from a folder structure alone.
- **Package boundary** — The real organizational unit a Python package forms - a real directory carrying an `__init__.py`, grouping related real modules under one importable namespace (`app.routes`, `app.models`) and exposing them to the rest of a project only through real import statements crossing that boundary. It exists as its own concept because Python enforces the namespace itself (you import `app.routes`, not any arbitrary file on disk) but enforces nothing about which *direction* real imports should flow across it - two packages can import each other, and Python permits that just as readily as a clean, one-way dependency.
- **Circular dependency** — A real cycle in the import graph - two or more real modules or packages each needing something from the other, rather than a straight line. A circular dependency is a fact about the real *shape* of the graph, not a prediction about whether it fails: whether a genuine cycle actually raises a real error depends on the real, exact order those modules happen to initialize in, not on the mere presence of the cycle. A circular dependency is a graph property; a circular-import failure is an initialization- order problem - the two are related, never the same claim.
- **Public/private module interface** — A Python naming convention - a leading underscore, `_name` - indicating a module-level name is intended for internal use only, distinguished from a name with no leading underscore, meant to be part of what a module actually offers the rest of the project. Python itself enforces nothing here: nothing stops another real file from importing a leading-underscore name anyway, and nothing about the language treats it differently at runtime. It exists as a convention, not access control, because a module with every name equally importable gives every other file equal *license* to depend on its internals, even though the language provides no actual barrier - making a later change to those internals a real risk to code that was never supposed to be touching them.

## Objects and methods used

- **`ast.Import`**
  - *What it is:* The real AST node type representing one plain `import x` statement.
  - *Implementation:* A class with a real field, `'names'` (a list of `alias` objects), confirmed this session via `ast.Import._fields`.
  - *Its use:* This lesson's lab uses it to recognize a plain `import` statement, as opposed to a `from ... import ...` one.
  - *Type:* A class (an `ast.AST` subclass).
  - *Responsibility:* Represent, as real structured data, one or more plain module names being imported directly - `import uuid`, `import json`.
  - *Depends on:* Being produced by `ast.parse` wherever the real source contains a plain `import` statement.
  - *Connects to:* Its `names` field (a real list) is iterated to read each real imported module's own name, via `alias.name`, below.
  - *Shape:* One object whose `names` field is a list - a plain `import x` can name more than one module on the same line (`import os, sys`), so this is never a single bare string.

- **`ast.ImportFrom`**
  - *What it is:* The real AST node type representing one `from x import y` statement.
  - *Implementation:* A class with real fields, `'module'` (a string) and `'names'` (a list of `alias` objects), confirmed this session via `ast.ImportFrom._fields`.
  - *Its use:* This lesson's lab uses it to recognize a `from ... import ...` statement and read which real module it names.
  - *Type:* A class (an `ast.AST` subclass).
  - *Responsibility:* Represent, as real structured data, which real module something is being imported from (`module`) and which real name(s) are being imported from it (`names`).
  - *Depends on:* Being produced by `ast.parse` wherever the real source contains a `from ... import ...` statement.
  - *Connects to:* Its `module` field is read directly; its `names` field is iterated the same way as `ast.Import`'s, above.
  - *Shape:* One object with two real fields: `module`, a single plain string (never a list, even though what's imported from it can be several names), and `names`, a list - two different real shapes for two different real facts about the same statement.

- **`ast.alias`**
  - *What it is:* The real AST node type representing one imported name within either an `ast.Import` or `ast.ImportFrom`.
  - *Implementation:* A class with real fields, `'name'` and `'asname'`, confirmed this session via `ast.alias._fields`.
  - *Its use:* This lesson's lab reads its real `name` field to get the actual imported name as a plain string, for each name an import statement names.
  - *Type:* A class (an `ast.AST` subclass).
  - *Responsibility:* Represent, as real structured data, one imported name exactly as written (`name`) and, if the statement used `as`, the real name it's bound to instead (`asname`, `None` otherwise).
  - *Depends on:* Being produced by `ast.parse`, appearing inside either `ast.Import.names` or `ast.ImportFrom.names`.
  - *Connects to:* Its `name` field is read directly by this lesson's lab; `asname` is not used by this lesson's lab, since nothing in the real file investigated renames an import.
  - *Shape:* One object per real imported name; `name` is always a plain string, `asname` is either a plain string or `None` - never conflated, the same distinction already seen between a real default value and no default at all.

- **`db`**
  - *What it is:* The real, module-level SQLAlchemy instance every model in this application is built on - created once, in `app/__init__.py`, before `create_app`, below, is even defined.
  - *Implementation:* `db = SQLAlchemy()`, at `backend/app/__init__.py:158`.
  - *Its use:* This lesson's second unit treats its exact placement - before `create_app`'s own definition, and long before `create_app` is ever called - as the real fact that makes the rest of this unit's circular-dependency story work at all.
  - *Type:* A module-level instance of Flask-SQLAlchemy's `SQLAlchemy` class.
  - *Responsibility:* Exist, real and ready, the moment anything imports `app` at all - so that any other real file doing `from app import db` gets a real, already-constructed object, never a name that isn't there yet.
  - *Depends on:* Nothing beyond `SQLAlchemy()` itself - no app, no config, no database connection yet; that binding happens later, inside `create_app`.
  - *Connects to:* Imported by every real model file, and by `app/routes/operation_manager.py`'s own `from app import db`, already investigated.
  - *Shape:* One real object, created by one line, at module level - not inside a function, not deferred, not conditional. Its existence doesn't depend on `create_app` ever running at all.

- **`create_app`**
  - *What it is:* The real Flask application factory function - the one place this backend's own real circular dependency is deliberately resolved.
  - *Implementation:* `create_app(config_name: str = None) -> Flask`, defined at `backend/app/__init__.py:172`.
  - *Its use:* This lesson's second unit reads two of its real internal lines - one already commented by this application's own author as existing specifically to avoid a circular import - to see exactly how and when each real import inside it actually runs.
  - *Type:* A free function, in `app/__init__.py`, following the application-factory pattern.
  - *Responsibility:* Build and return one fully configured real Flask app - and, along the way, import the real `routes` package only once actually called, not the moment `app` itself is first imported.
  - *Depends on:* Nothing at the moment it's merely defined; once called, a real config module, and the real `app.routes` package.
  - *Connects to:* Defined directly below `db`, above, in the same real file; its own body imports `app.routes`, which in turn imports `db` back from this same file.
  - *Shape:* Its own definition (`def create_app(...):`) runs immediately when `app/__init__.py` is first imported - but its body, including every import inside it, only runs later, whenever something actually calls `create_app()`. Two genuinely different real moments in time, not one.

- **`subprocess.run`**
  - *What it is:* A standard-library function that runs a real, separate process and waits for it to finish.
  - *Implementation:* `subprocess.run(args, cwd=None, capture_output=False, text=False) -> CompletedProcess`
  - *Its use:* This lesson's second unit uses it to run each real circular-import reproduction in its own fresh, real Python process, so neither one's already-imported `pkg` module leaks into the other.
  - *Type:* A free function, in Python's standard library `subprocess` module.
  - *Responsibility:* Start a real child process with the given real command, optionally in a given real working directory, and capture its real stdout/stderr as plain text once it exits.
  - *Depends on:* A real, runnable command (here, `sys.executable`, the real path to the interpreter currently running, plus a `-c` script string).
  - *Connects to:* Its result's `.stdout`/`.stderr` fields are read directly and printed.
  - *Shape:* Takes a list of real command-line argument strings in; returns one `CompletedProcess` object whose `.stdout` and `.stderr` are plain strings (because `text=True`) holding everything that real child process actually printed - not a live stream, the whole real output, captured only once the process has already exited.

## Concept Unit: Extracting a Real File's Top-Level Import Declarations, Mechanically

### The Problem

A real file's actual dependencies are declared at its own top, but a large real file can also carry imports scattered elsewhere inside it - already seen once, when a local `from datetime import datetime` turned up inside a function body rather than at the top of the file. A small, real tool, continuing the same `ast` technique already used to find routes, can extract exactly this one file's own top-level import declarations mechanically - the raw material an actual import graph is built from, not a full graph itself - rather than reading a long real file by eye.

Before reading on:

- Given that `import uuid` and `from app import db` both appear in the same real file, what real, structural difference does `ast` need to notice between them, beyond both being some kind of import?
- If this tool also walked inside every function body, instead of only this file's own top-level statements, what real, already-investigated fact about this exact file would it find repeated more than once?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch investigation tool, run against `backend/app/routes/operation_manager.py`'s real, current source (the same real file already investigated for its boundary violation and its pure/impure functions).
- **Files affected:** `verification/phase-01/lab_find_imports.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's standard library `ast` module only.

Rather than read a 900-line real file top to bottom to answer "what does this file actually depend on," this unit builds a small, real tool that answers the same question by parsing the file's actual source and reading only its own top-level statements - this file's own real, declared import declarations, not every import anywhere in the file, and not yet a resolved, project-wide graph (that would need following each of these into the actual file it names).

### The New Code

New code, typed into a new throwaway file - the whole file at once, since there's no existing structure to return to for something this small:

**File:** `verification/phase-01/lab_find_imports.py` (new)

```python
import ast

source = open("backend/app/routes/operation_manager.py", encoding="utf-8").read()
tree = ast.parse(source)

for node in tree.body:
    if isinstance(node, ast.Import):
        for alias in node.names:
            print(f"import {alias.name}")
    elif isinstance(node, ast.ImportFrom):
        names = ", ".join(alias.name for alias in node.names)
        print(f"from {node.module} import {names}")
```

### Mechanical Walkthrough

- `source = open("backend/app/routes/operation_manager.py", encoding="utf-8").read()` — Reads the real, current text of the real file being investigated - `open()`/`.read()` (basic Python), with an explicit `encoding` this time, since this particular real file contains at least one real character outside the platform's own default text encoding.
- `tree = ast.parse(source)` — The same real `ast.parse` already proven, producing the same kind of real `ast.Module` root already established.
- `for node in tree.body:` — `tree.body` - a real list, the `Module` node's own top-level statements only, in real declared order. Deliberately not `ast.walk(tree)`: `ast.walk` would also reach into every real function body in the file, finding every local import anywhere inside it, not just the ones this file declares at its own top level.
- `if isinstance(node, ast.Import): for alias in node.names: print(f"import {alias.name}")` — `ast.Import` matches a plain `import x` statement; its real `names` field is iterated, and each real `alias`'s `name` field is printed - a real module name, exactly as written.
- `elif isinstance(node, ast.ImportFrom): names = ", ".join(alias.name for alias in node.names) print(f"from {node.module} import {names}")` — `ast.ImportFrom` matches a `from x import y` statement; its real `module` field names what's being imported from, and its real `names` field (the same real shape as `ast.Import`'s) is joined into one real, comma-separated string (basic Python `str.join`) for printing.

### CS Lens

This is a dependency graph: a real, directed structure where an edge from one real node to another means "this one needs that one." Also recognized in: a package manager (`pip`, `npm`) resolving a real project's entire dependency tree before installing anything, a build tool like `make` deciding which targets have to run before others based on real declared dependencies, and a spreadsheet recomputing cells in the real order their formulas actually depend on each other.

### SE Lens

This tool's own real output is top-level import declarations, not a resolved project import graph, and the gap between those two is worth being honest about. Choosing `tree.body` over `ast.walk` means it would never notice a real import placed deliberately inside a function body, on purpose, rather than one left there by accident - and there's a real, deliberate one waiting in this exact backend's own `app/__init__.py`, investigated next. Beyond that, it wouldn't handle a real relative import (`from .foo import bar` - `node.level`, a real field this tool never reads), it wouldn't tell a real project module apart from a real third-party package (`app.models.part` and `flask` print identically here, though only one of them is this project's own code), and it wouldn't follow any of these names to the actual real file each one points at - the one further step an actual, resolved import graph would need. What this tool actually gives: the raw declarations a real graph could be built from, for one file, not the graph itself.

### Commands needed

- `python verification/phase-01/lab_find_imports.py` — Run from the manufacturing-platform repository root, so the relative path to backend/app/routes/operation_manager.py resolves correctly.

### Verification

```text
from flask import Blueprint, jsonify, request, render_template
from app import db
from app.models.operation_manager import OperationOrder
from app.models.nc_template import NCTemplate
from app.models.machine_pairing import MachineCAMPairing
from app.services.operation_manager_service import OperationManagerService
from app.models.sequence import Sequence
from app.models.nc_file import NCFile
from app.models.cam_file import CAMFile
from app.models.part import Part
from app.models.machine import Machine
import uuid
import json
import os
from datetime import datetime
```

Full saved run: `verification/phase-01/lab_find_imports_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: A Real Circular Dependency, and How This Backend Already Resolves One

### The Problem

The unit above's own tool found that `operation_manager.py` depends on `app`, for `db`. But `app/__init__.py` - the file `app` itself actually is - needs to reach into the real routes package to register them. Each package genuinely needs the other. Reading `app/__init__.py` closely enough shows this real cycle was noticed by this application's own author, and already has a real, working answer.

Before reading on:

- Given that `operation_manager.py` does `from app import db` at its own top level, what real problem would `app/__init__.py` run into if it also did `from app.routes import register_routes` at ITS OWN top level, before `db = SQLAlchemy()` on line 158 ever ran?
- The real comment on `app/__init__.py`'s own line 219 says a local import there is 'to avoid circular imports.' Given `db = SQLAlchemy()` already ran on line 158, what would have to be true about the ORDER these two real lines run in for that comment to no longer be necessary?

### Project Change

- **Reference Source:** `backend/app/__init__.py:155-158`, `:172`, `:216-221`, and `:285-299` - real, already-existing code in the same real file, read and quoted verbatim this session - plus a small, real, two-package reproduction of the same shape at minimal scale, so what would actually happen without the deferred import can be run and observed directly, not merely asserted.
- **Files affected:** `verification/phase-01/lab_circular_import/broken/pkg/__init__.py` (new), `verification/phase-01/lab_circular_import/broken/pkg/routes.py` (new), `verification/phase-01/lab_circular_import/fixed/pkg/__init__.py` (new), `verification/phase-01/lab_circular_import/fixed/pkg/routes.py` (new), `verification/phase-01/lab_circular_import/run_circular_import_demo.py` (new)
- **Change type:** add
- **Location:** New files, no existing project to place them within.
- **Dependencies:** Python's standard library `subprocess` module only, for the runner.

`app/__init__.py` creates `db` at module level, the moment anything imports `app` at all - before `create_app`, the function, is even defined. `create_app`'s own body, which only runs once something actually calls it, imports the real routes package - which itself needs `db` back from `app`. Reading exactly where each real line sits, and exactly when each one actually runs, shows why this works instead of failing. The real backend itself can't safely be broken just to prove the point, so a small, real, standalone reproduction of the exact same shape - one package, one shared name created at module level, one submodule that needs it back - is built here instead, twice: once the naive way, once with the same deferred-import fix already in place in the real backend.

### The New Code

A minimal, real, two-package reproduction of the same shape as the real backend - built twice, broken and fixed, plus a small runner that executes both and prints what actually happens:

**File:** `verification/phase-01/lab_circular_import/broken/pkg/__init__.py` (new)

```python
from pkg.routes import register_routes

db = "the-shared-db-object"
```

**File:** `verification/phase-01/lab_circular_import/broken/pkg/routes.py` (new)

```python
from pkg import db


def register_routes():
    print(f"registered, using {db!r}")
```

**File:** `verification/phase-01/lab_circular_import/fixed/pkg/__init__.py` (new)

```python
db = "the-shared-db-object"


def create_app():
    from pkg.routes import register_routes
    register_routes()
```

**File:** `verification/phase-01/lab_circular_import/fixed/pkg/routes.py` (new)

```python
from pkg import db


def register_routes():
    print(f"registered, using {db!r}")
```

**File:** `verification/phase-01/lab_circular_import/run_circular_import_demo.py` (new)

```python
import subprocess
import sys

print("=== broken: routes imported at module level, before db exists ===")
result = subprocess.run(
    [sys.executable, "-c", "import pkg"],
    cwd="broken",
    capture_output=True,
    text=True,
)
print(result.stderr.strip())

print()
print("=== fixed: routes import deferred into create_app() ===")
result = subprocess.run(
    [sys.executable, "-c", "import pkg; pkg.create_app()"],
    cwd="fixed",
    capture_output=True,
    text=True,
)
print(result.stdout.strip())
```

### The Updated Project

**File:** `backend/app/__init__.py (lines 155-158)` (already exists — read-only, nothing to type)

```python
# The SQLAlchemy instance that ALL models will use
# Models do: from app import db
# Then:      class Part(db.Model): ...
db = SQLAlchemy()
```

**File:** `backend/app/__init__.py (line 172)` (already exists — read-only, nothing to type)

```python
def create_app(config_name: str = None) -> Flask:
```

**File:** `backend/app/__init__.py (lines 216-221)` (already exists — read-only, nothing to type)

```python
# ─────────────────────────────────────────────────────────────────────────
# STEP 1: Import configuration
# ─────────────────────────────────────────────────────────────────────────
# We import INSIDE the function to avoid circular imports.
# config.py might import things that import from here.
from config import config
```

**File:** `backend/app/__init__.py (lines 285-299)` (already exists — read-only, nothing to type)

```python
# ─────────────────────────────────────────────────────────────────────────
# STEP 7: Register Blueprints (API Routes)
# ─────────────────────────────────────────────────────────────────────────
# Blueprints are Flask's way of organizing routes into modules.
# Instead of 500 routes in one file, we split them:
#   - auth_bp:      /api/auth/*
#   - parts_bp:     /api/parts/*
#   - machines_bp:  /api/machines/*
#
# register_routes() is a helper function that registers all blueprints
from app.routes import register_routes
from app.routes.bootstrap import bootstrap_bp

register_routes(app)
app.register_blueprint(bootstrap_bp)
```

### Mechanical Walkthrough

- `from pkg.routes import register_routes (broken/pkg/__init__.py, line 1)` — The naive shape: `pkg`'s own `__init__.py` imports its `routes` submodule at module level, as its very first line - before `db`, below, has been created at all.
- `db = "the-shared-db-object" (broken/pkg/__init__.py, line 3)` — Never reached on a real run - execution fails on the import above before this line's own turn ever comes.
- `from pkg import db (broken/pkg/routes.py, line 1)` — Runs while `pkg`'s own `__init__.py` is still in the middle of executing its first line - `pkg` exists as a real, partially-built module object at this point, but `db` isn't one of its attributes yet.
- `db = "the-shared-db-object" (fixed/pkg/__init__.py, line 1); def create_app(): from pkg.routes import register_routes` — The same real fix already in place in the actual backend: `db` is created first, unconditionally, at module level; the import that needs `db` back is moved inside a function, deferred until something actually calls it.
- `subprocess.run([sys.executable, "-c", "import pkg"], cwd="broken", ...)` — Runs a real, separate Python process for each real reproduction, `cwd`'d into either `broken/` or `fixed/` - `subprocess.run` (standard library), so each one gets a genuinely fresh, real interpreter with no already-imported `pkg` left over from the other.
- `db = SQLAlchemy()` — Runs immediately, the moment `app` is first imported by anything at all - real, module-level code, not inside any function. By the time execution reaches this point, `db` genuinely exists on the `app` module.
- `def create_app(config_name: str = None) -> Flask:` — A `def` statement only creates the function object and binds the name `create_app` - it does not run anything inside the function's own body yet (basic Python). Whatever imports happen inside it wait until something actually calls `create_app()`.
- `from config import config` — The real, first line to actually run inside `create_app`'s body - and only once `create_app()` is actually called, not at the moment `app/__init__.py` itself was imported. The real comment immediately above it, in this application's own words, states why: importing this at module level risked a real circular import, since `config.py` may itself import something that imports back from `app`.
- `from app.routes import register_routes` — The real line that resolves the timing of this backend's own circular dependency, without removing the dependency itself - `app` still needs `routes`, `routes` still needs `app`, a real cycle either way. `app.routes` (and, inside it, `operation_manager.py`) does `from app import db` - which only finds `db` there because, by the time this line actually runs (inside a real call to `create_app()`), `db = SQLAlchemy()` already ran, long before, the moment `app` was first imported. Deferring this one import changes when each side of the real cycle resolves, so neither side ever reaches for something not there yet - it doesn't make the two real packages stop depending on each other.
- `register_routes(app); app.register_blueprint(bootstrap_bp)` — Only reachable after the import above has already succeeded - real evidence that `register_routes` and `bootstrap_bp` are genuinely available by this point, confirming the deferred import actually worked, not just that it was attempted.

### Mental Model

```text
IMPORT TIME (the moment anything does `import app` / `from app import ...`):

  app/__init__.py starts running, top to bottom
    line 158:  db = SQLAlchemy()          <- db now exists
    line 172:  def create_app(...): ...   <- function DEFINED, body not run
  app/__init__.py finishes.
  At this point: db exists. create_app exists. app.routes has NOT been touched.

CALL TIME (later, e.g. run.py does `create_app()`):

  create_app()'s body starts running
    line 221:  from config import config          (real import, runs now)
    line 295:  from app.routes import register_routes
                  -> Python starts loading app/routes/operation_manager.py
                  -> operation_manager.py line 41: from app import db
                     -> `app` already finished importing (see above) -
                        db is already there. No failure.
    line 298:  register_routes(app)

If `from app.routes import register_routes` were moved to
import time (module level, before line 158), operation_manager.py's
own `from app import db` would run before `db = SQLAlchemy()` ever
had - a real circular import, and a real failure.
```

### CS Lens

This is deferred binding: delaying when a real dependency is actually resolved until the moment it's genuinely needed, rather than the moment its own module is first loaded. Also recognized in: a lazily-initialized singleton in any object-oriented language, a JavaScript `require()` call placed inside a function instead of at the top of a file for the same real reason, and a database connection pool that opens its first real connection on first use rather than at process startup.

### SE Lens

A circular dependency is a graph property; a circular-import failure is an initialization-order problem - the two are not the same claim, and this real backend is proof: `app` and `app.routes` genuinely depend on each other both ways (`routes` needs `db` from `app`; `app`'s own `create_app` needs `register_routes` from `routes`) - a real cycle, still there, not removed by anything this unit found. What the deferred import actually changes is not whether the cycle exists, but *when* each side of it is resolved: by the time `create_app`'s own deferred import runs, `db` already exists, so the reverse edge never finds anything missing. That's the real alternative not chosen - import `app.routes` at the very top of `app/__init__.py`, the same way `db` is created at the top - exactly the shape the `broken/` reproduction above actually ran, and actually failed, because `import`/`from ... import` are executable statements, run in real, top-to-bottom order like any other - not declarations resolved all at once. Its real, captured error - `ImportError: cannot import name 'db' from 'pkg' (consider renaming '...__init__.py' if it has the same name as a library you intended to import)` - was worth actually running rather than assuming: an earlier guess at this exact wording, made from memory before this unit's own lab existed, named a real, genuine Python `ImportError` correctly but got its precise text wrong - the same real failure, run through this same real `subprocess.run` command, produces a different exact message than it does through a plain `sys.path` import, a real reminder that even a message this well-known deserves running, not reciting. The captured message's own absolute path is specific to the real machine this was run on, and would read differently - a different path, on some platforms a different separator - on anyone else's; the part that doesn't change is the `ImportError` itself and what it names: `db`, not found in `pkg`, while `pkg` is still mid-import. The underlying mechanism, regardless of exact wording: `pkg` exists as a real, partially-built module object the moment its own `__init__.py` starts running, but `db` isn't one of its real attributes yet until that file's own execution actually reaches the line that creates it - a real name lookup against a real, still-incomplete object, not a language limitation. This backend's real fix - deferring the routes import into `create_app`'s own body - makes the code work, and the `fixed/` reproduction's own real output confirms it actually works, not just that it should. But "works at runtime" and "is architecturally ideal" are different real claims: the two packages are still coupled in both directions, and only the real, careful ordering of module-level code versus deferred, call-time code is what keeps that real cycle from failing. The same real file also shows the other concept this lesson names: `_build_export_data`, already investigated, keeps its leading underscore specifically because nothing outside `operation_manager.py`'s own module is meant to import it directly - unlike `generate_nc_file`, exposed as a real route, `_build_export_data` is this module's own private interface, by convention, not by any enforced language rule.

### Commands needed

- `python run_circular_import_demo.py` — Run from inside verification/phase-01/lab_circular_import/, so the runner's own cwd='broken'/cwd='fixed' resolve correctly.

### Verification

```text
=== broken: routes imported at module level, before db exists ===
Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import pkg
  File "C:\Users\g4m3r\Documents\manufacturing-platform\verification\phase-01\lab_circular_import\broken\pkg\__init__.py", line 1, in <module>
    from pkg.routes import register_routes
  File "C:\Users\g4m3r\Documents\manufacturing-platform\verification\phase-01\lab_circular_import\broken\pkg\routes.py", line 1, in <module>
    from pkg import db
ImportError: cannot import name 'db' from 'pkg' (consider renaming 'C:\\Users\\g4m3r\\Documents\\manufacturing-platform\\verification\\phase-01\\lab_circular_import\\broken\\pkg\\__init__.py' if it has the same name as a library you intended to import)

=== fixed: routes import deferred into create_app() ===
registered, using 'the-shared-db-object'
```

Full saved run: `verification/phase-01/lab_circular_import/run_circular_import_demo_output.txt`.

### Connection to the previous unit

The unit above built a tool that reads a file's own declared, top-level import statements; this unit found a real import placed deliberately outside that usual shape - deferred, on purpose, inside a function body - and read closely enough to see exactly why: two real packages that need each other, still coupled both ways, made to work by controlling when, not whether, each import actually runs.

## Connect the pieces

One small, real tool extracted `operation_manager.py`'s own top-level import declarations, including its real dependency on `app` for `db` - then `app/__init__.py` itself, read closely enough to show that same dependency runs in the other direction too: `app` needs `routes`, `routes` needs `app`. `db = SQLAlchemy()` at module level, before `create_app` is even defined, and two real imports deferred inside `create_app`'s own body, are what let both real packages depend on each other without either one failing to find what it needs.

**Next lesson:** How to represent a request's own real data as it's turned into Python values - lists, dicts, tuples, sets - and what real tradeoffs choosing one over another actually costs.