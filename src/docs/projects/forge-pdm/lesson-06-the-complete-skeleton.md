# Lesson 06: The Complete Skeleton

**What you will build:** every real piece Phase 1 has built so far —
the layered folders, the domain/API boundary, the data layer, the real
migration runner — wired into one, real, self-bootstrapping
application: delete `forge.db` entirely, start the app once, and every
real table exists correctly, with no separate, manual setup step at
all.

**What you need to know first:** Lessons 01–05 — every real piece this
lesson connects, none of them re-explained here.

**Terms introduced in this lesson:**
- **Lifespan** — a real, defined block of code a real ASGI application
  (FastAPI included) runs once, automatically, when the server starts
  (and, symmetrically, once more when it shuts down) — distinct from an
  ordinary route, which only runs in response to a real, individual
  request.

**Objects and methods used:**

**`fastapi.FastAPI(lifespan=...)`**
- *What it is:* a real, built-in FastAPI parameter, paired with a real,
  standard-library async context manager.
- *Implementation:* `@asynccontextmanager async def lifespan(app:
  FastAPI): ...setup...; yield` — every real line before `yield` runs
  once, automatically, the moment the real server starts, before it
  accepts its first real request; `FastAPI(lifespan=lifespan)` wires it
  in.
- *Its use:* running this project's own real `run_migrations` exactly
  once, automatically, on every real startup — never a separate,
  manual step a real user (or a real, future teammate) has to remember.

---

## Concept Unit: Migrations, Run Automatically on Startup

### The Problem

Every real migration so far has been run by hand, from a real, separate
`python -c` command. A real, working application cannot ask a real user
to do that before every single launch.

### Introduce the Concept in Isolation

```python
# src/main.py (complete, Phase 1 version)
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from src.api.files import router as files_router
from src.data.database import DB_PATH
from src.data.migrations import run_migrations


@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = sqlite3.connect(DB_PATH)
    run_migrations(conn)
    conn.close()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(files_router)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

A real, complete, from-scratch proof:

```
$ rm -f forge.db
$ uvicorn src.main:app --reload
Applied migration 1: create files table
Applied migration 2: create users table
Applied migration 3: create locks table
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Every real migration applied, in real, correct order, with no separate
command run by hand at all — `forge.db` did not exist one line above,
and now genuinely, fully does, real schema and all, purely because the
server itself started.

### Discard

Nothing throwaway — `main.py`'s own real, final Phase 1 shape is
permanent, extended directly by every later phase.

### Mechanical Walkthrough

- `@asynccontextmanager async def lifespan(app: FastAPI): ...; yield`
  — **(a) first appearance**, full treatment above; `async`/`await`-
  adjacent syntax — assumed real, working knowledge per this project's
  own README, not re-taught.
- `conn = sqlite3.connect(DB_PATH); run_migrations(conn); conn.close()`
  — **(b) hard concept reappearing** throughout, this lesson's own
  Lessons 03 and 05, unchanged; run here, for the first time, from
  inside `lifespan` instead of a separate, manual command.
- `app = FastAPI(lifespan=lifespan)` — **(a) first appearance** of the
  real `lifespan` parameter itself.

### CS Lens

Running migrations from a real `lifespan` block is a direct, concrete
instance of **idempotent initialization**: this exact same real startup
code is correct whether `forge.db` is genuinely new (every migration
applies) or already fully current (`sqlite-mastery` Lesson 24's own
real idempotency proof, reused directly — nothing applies twice), with
no real branch anywhere asking "is this the first run?" explicitly.

### SE Lens

The real, deliberate reason this matters beyond convenience: this
project's own real, eventual packaged form (Lesson 29's own
PyInstaller build) will run on a real user's own machine, with no
real developer present to run a manual setup command at all. Wiring
migrations into `lifespan` now means Lesson 29's own real executable
already works correctly, for free, rather than needing a real,
separate fix discovered only once packaging is underway.

## Connect the pieces

Every real piece Phase 1 built — the four-layer folders (Lesson 01),
the domain/API boundary proven by a real, deliberate violation (Lesson
02), the repository pattern (Lesson 03), explicit domain types (Lesson
04), and the real, versioned migration runner (Lesson 05) — is now one,
real, self-bootstrapping application: delete the database file
entirely, start the server once, and the real, correct schema exists
automatically, with every real route already able to use it.

## What breaks without this

Remove `conn.close()` from `lifespan`, leaving the startup connection
open indefinitely:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = sqlite3.connect(DB_PATH)
    run_migrations(conn)
    yield
```

The real application still starts and still runs correctly — this is
not a crash, which is exactly what makes it a real, easy mistake to
miss. A real, permanently-open connection, held for the entire real
lifetime of the server process, is a real, unnecessary resource — on a
real, long-running deployment, one genuinely worth avoiding, the
identical real discipline `sqlite-mastery` Lesson 31's own
`Depends(get_db)` already enforces correctly, per request, that this
one, real, startup-only connection needs enforcing by hand instead,
since nothing here is `Depends`-managed.

## Exercises

1. Reproduce this lesson's own real, from-scratch proof yourself:
   delete `forge.db`, start the server, and confirm all three real
   migrations apply in order with no manual step.
2. Fix this lesson's own real "what breaks" gap directly — restore
   `conn.close()` — and, separately, confirm `GET /api/files` still
   works correctly afterward, proving the fix didn't disturb anything
   real that already worked.

## Definition of Done — Phase 1 Complete

- [ ] A real, running FastAPI server serves both a real static page and
      real API routes from one process.
- [ ] `src/domain/` holds real, pure business logic with zero FastAPI
      or SQL dependency, proven by a deliberate violation and its real
      cost.
- [ ] `src/data/` holds every real query behind a named repository
      function, with real, explicit domain types at the boundary.
- [ ] Every real table exists through the versioned migration runner,
      applied automatically on startup — no manual setup step, ever.
- [ ] You completed both exercises.

## Phase 1 complete

Six lessons, and Forge now has a real, working shell: four layers, each
with exactly one real job, wired together correctly and proven to
bootstrap itself from nothing. [Phase 2](lesson-07-what-authentication-actually-means.md)
gives this project real, working identity — starting from what
authentication actually is, before a single login form exists.
