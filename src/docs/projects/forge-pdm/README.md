# Forge — A Real PDM System in Your Own Real Stack

## What this is, and why it exists

This project's own sibling, [`PDM/` (Vault)](../PDM/pdm-brd-and-lesson-plan.md),
already teaches this exact problem — a hand-built, AI-grown file-
management system that became too complex to read, debug, or extend,
rebuilt with real, explicit architecture instead of patched further.
Vault's own real diagnosis of that failure mode applies here directly:

> "The existing solution... has reached a complexity threshold where it
> cannot be read, debugged, or extended... The correct response is not
> to patch it. It is to rebuild it with explicit architecture."

**Forge teaches the identical real problem, in a genuinely different,
real stack** — the one actually used at a real job: FastAPI, plain
JavaScript, a local git repository as real version-history storage
(driven correctly, this time), and a native-feeling desktop delivery
built from PyInstaller and a real, local web server, rather than
Electron. Vault remains a real, valid reference architecture throughout
— cross-referenced by name wherever its own, already-proven design
choice transfers directly, and departed from by name, with a stated
real reason, wherever this project's own real constraints call for
something different.

## The real bug this project exists to fix

A real, specific, reproducible failure, diagnosed directly in Phase 3:
two people each hold their own independent clone of the same git
repository. Both edit the same file. Whoever pushes second silently
overwrites whoever pushed first, with no warning, no conflict, and no
real record that it happened. This is not a git bug — git is behaving
exactly as designed. It is an **architecture bug**: nothing in that
design ever designated one, single, real, canonical copy of the truth,
or ever stopped two people from editing the same file at the same real
time in the first place. Forge's own real, central fix, proven directly
in Phase 4, is the same one Vault already proved: **exactly one
canonical copy, real, exclusive locks, enforced by a real database
transaction** — never independent clones, ever, for any user.

## Who this is for

Real, working knowledge of Python and JavaScript, and everything this
site's own [`sqlite-mastery`](../sqlite-mastery/README.md) series
already taught — `sqlite3`, FastAPI, `Depends`, the repository pattern,
real transactions and locking (Lesson 14, Lesson 50), and pyodbc-based
server database access (Arc 9) are all reused directly, by name, rather
than re-taught. Real, working knowledge of `git` from the command line
is assumed; **GitPython** itself — driving git programmatically, safely,
from a single, trusted, backend process — gets full, first-appearance
treatment here, because that is this project's own real, stated gap.

Every lesson follows this repo's full
[Lesson Schema](../../reference/LESSON%20SCHEMA.md), identical in rigor
to `sqlite-mastery`: an isolated throwaway lab before any construct is
used for real, a full mechanical walkthrough, CS/SE lenses, a real
caused-failure section, exercises, and a Definition of Done.

## Architecture

Four real layers, the identical shape Vault already proved correct,
adapted to this project's own real stack:

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                  │
│  Plain JavaScript, served as static files by FastAPI │
│  Job: show state, capture user intent                │
├─────────────────────────────────────────────────────┤
│  API LAYER                                           │
│  FastAPI routers                                     │
│  Job: receive intent, validate, delegate              │
├─────────────────────────────────────────────────────┤
│  DOMAIN LAYER                                         │
│  Plain Python modules: checkout, versioning, locking  │
│  Job: enforce business rules — no FastAPI, no SQL     │
├─────────────────────────────────────────────────────┤
│  DATA LAYER                                           │
│  SQLite (metadata) + one canonical git repo (content) │
│  Job: persist and retrieve data                       │
└─────────────────────────────────────────────────────┘
```

**Where Forge departs from Vault, and the real, stated reason each
time:**

| Vault's real choice | Forge's real choice | Why |
|---|---|---|
| Electron | FastAPI + a local `uvicorn` server, PyInstaller `--noconsole`, the OS's own default browser opened via Python's `webbrowser` module | Matches the real, existing, working delivery mechanism already in production — no reason to replace something that already works |
| React | Plain JavaScript + `fetch` | Matches the real frontend already in use; this project's own [`sqlite-mastery`](../sqlite-mastery/lesson-38-jquery-fundamentals.md) series already covers jQuery separately, if ever wanted here |
| PostgreSQL from lesson one | SQLite through Phase 5, a real, explicit migration to a production server database (reusing `sqlite-mastery` Arc 9 directly) as Phase 6's own closing lesson | Matches this project's own real, stated end goal — "fix it, then add it to a real SQL database" — as a real, deliberate, taught *step*, not an assumed starting point |
| GitLab REST API as the storage backend | A single, canonical, local git working repository, driven only by the backend process through GitPython | Matches the real, existing tool already in use (GitPython) and this project's own real, stated goal of becoming genuinely competent with it, rather than replacing it with a hosted API |
| PAT-based identity, delegated to GitLab | A real, custom, local username/password system, with a real role hierarchy (super-admin creates admins) | Matches the real, existing feature already described; Vault's own BRD explicitly lists role-based access control as out of scope for its own v1.0 — Forge does not have that luxury, since the real app already has it |

## Domain language

The same real precision Vault's own BRD insists on, restated for this
project's own real terms:

| Term | Definition |
|---|---|
| **File** | A managed document Forge tracks: a path, a name, a file type, and a real version history. |
| **Version** | A committed, permanent snapshot of a file — backed by one real git commit in the one, canonical repository. |
| **WIP snapshot** | A real, recoverable save made while a file is checked out, that never becomes a real git commit and never appears in version history. |
| **Checkout** | Exclusive, real, database-enforced permission to edit one specific file. Exactly one user at a time. |
| **Check-in** | Releasing a checkout, creating one real, new committed version. |
| **Lock** | The real, single database row recording who currently holds a checkout. Its mere existence *is* the lock. |
| **Canonical repository** | The one, real, single working copy of the managed git repository Forge's own backend process exclusively reads from and writes to. No other real copy is ever treated as authoritative. |
| **Role** | One of `super_admin`, `admin`, or `user` — a real, stored, enforced fact about one user, checked on every real, permission-sensitive request. |

## How the lessons are ordered

Six real phases. Nothing in a later phase is used before the earlier
one that teaches it.

### Phase 1 — Foundations

| # | Lesson | Covers |
|---|---|---|
| 01 | The Shell | the four-layer folder structure, a real, running FastAPI server, plain JS served statically, the first real end-to-end request |
| 02 | The Domain Layer, For Real | why `src/domain/` never imports FastAPI or SQL — a real, enforced boundary, proven by a deliberate violation and its real cost |
| 03 | SQLite and the Data Layer | the repository pattern (`sqlite-mastery` Lesson 22, reused directly), `Depends(get_db)` (Lesson 31, reused directly) |
| 04 | The Domain Types | Python dataclasses/Pydantic models as the real, shared shape of a `File`, a `User`, a `Lock` |
| 05 | Schema Migrations | `sqlite-mastery` Lesson 24's own migration runner, reused directly, for Forge's own real, growing schema |
| 06 | The Complete Skeleton | every layer wired together, a real, first request touching all four |

### Phase 2 — Identity and Access

| # | Lesson | Covers |
|---|---|---|
| 07 | What Authentication Actually Means | identity vs. authentication vs. authorization, named and distinguished for real |
| 08 | Password Hashing | real, salted hashing (`passlib`/`bcrypt`), proven against a real, cracked plaintext-password disaster |
| 09 | Login and Sessions | a real, working login endpoint, real server-side sessions |
| 10 | The Super-Admin Bootstrap | a real, first-run-only path to create the one, original super-admin — proven against the real chicken-and-egg problem of "who creates the first admin" |
| 11 | Roles and Authorization | `super_admin` → `admin` → `user`, a real, enforced dependency checking role on every permission-sensitive endpoint |

### Phase 3 — Storage Design and the File Tree

| # | Lesson | Covers |
|---|---|---|
| 12 | Reproducing the Real Bug, On Purpose | two independent real clones, two real edits, one real, silent overwrite — the exact failure this whole project exists to fix, caused deliberately before it's fixed |
| 13 | GitPython Fundamentals | `Repo`, `commit`, `diff`, real, isolated, throwaway use before any real, permanent code |
| 14 | The One Canonical Repository | why Forge's own backend holds the only real, authoritative working copy, and no user process ever gets their own |
| 15 | The File Tree | listing real, tracked files and folders, syncing them into SQLite's own metadata layer |
| 16 | Error Handling and Loading States | a real, honest state for every API call: idle, loading, success, error |

### Phase 4 — Checkout and Check-in

| # | Lesson | Covers |
|---|---|---|
| 17 | The Checkout Domain Function | the real business rule, in one real place, proven correct in isolation |
| 18 | The Real Race Condition | two simultaneous checkout attempts, the TOCTOU gap, caused and observed directly |
| 19 | Atomic Locking With a Real Transaction | `sqlite-mastery` Lesson 14/50's own real transaction knowledge, closing the race for good |
| 20 | The Checkout API and UI | a real, working "Check Out" button, end to end |
| 21 | WIP Snapshots | real, recoverable saves that never touch the canonical repository's own commit history |
| 22 | Check-In: a Real GitPython Commit | releasing a lock and creating one real, permanent version |
| 23 | Version History | every real, past version, retrievable, nothing ever deleted |
| 24 | Phase 4 Review — the Bug, Revisited | Lesson 12's exact original failure, reproduced again, now structurally impossible |

### Phase 5 — File Types, Config, and Polish

| # | Lesson | Covers |
|---|---|---|
| 25 | Configurable File Types and Form Requirements | a real, database-backed config system, not a hardcoded list |
| 26 | Search | finding a real file by name, type, or metadata |
| 27 | The Audit Log | every real, permission-sensitive action, recorded permanently |
| 28 | Notifications | a real, honest signal when a checked-out file becomes available again |

### Phase 6 — Packaging and Production

| # | Lesson | Covers |
|---|---|---|
| 29 | Packaging With PyInstaller | `--noconsole`, `webbrowser.open()`, a real, standalone distributable |
| 30 | Graduating to a Real Server Database | migrating the metadata layer from SQLite to a real production database, reusing `sqlite-mastery` Arc 9 directly rather than re-teaching it |

## Status

Complete — all 30 lessons written across six phases, in the same real
stack as the actual, existing application this series was built to
help fix: FastAPI, plain JavaScript, SQLite, GitPython, and a real
PyInstaller `--noconsole` desktop delivery. Every lesson follows the
full [Lesson Schema](../../reference/LESSON%20SCHEMA.md), identical in
rigor to [`sqlite-mastery`](../sqlite-mastery/README.md), whose own
already-taught foundations this series reuses directly rather than
re-deriving.

- [x] Phase 1 — Foundations (01–06)
- [x] Phase 2 — Identity and Access (07–11)
- [x] Phase 3 — Storage Design and the File Tree (12–16)
- [x] Phase 4 — Checkout and Check-in (17–24)
- [x] Phase 5 — File Types, Config, and Polish (25–28)
- [x] Phase 6 — Packaging and Production (29–30)
