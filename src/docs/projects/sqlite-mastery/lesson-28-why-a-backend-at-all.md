# Lesson 28: Why a Backend At All

**What you will build:** nothing shippable yet — this lesson's real
deliverable is a direct, provable case for *why* Arc 4 exists at all,
built entirely from facts this series has already proven, before Lesson
29 writes a single line of FastAPI.

**What you need to know first:** [Lesson 27](lesson-27-opening-the-same-db-from-a-browser.md)
— its own real, structural proof that a browser cannot open
`pocket_hardware.db` directly, the single clearest piece of evidence
this lesson leans on. [Lesson 22](lesson-22-a-repository-pattern-in-python.md)
— the real repository module this lesson's own second problem points at
directly.

**Terms introduced in this lesson:**
- **Backend** — a real, single, always-running process that owns
  direct access to the real data (here, `pocket_hardware.db`) and
  exposes a real, network-reachable interface other programs use
  *instead of* touching that data directly.
- **Client** — any real program that talks to a backend rather than
  opening the underlying data itself — a browser tab, a desktop app, a
  mobile app, or another server entirely.

**Objects and methods used:** none — this lesson is architectural
reasoning built on real facts already established; no new code appears
until Lesson 29.

---

## Concept Unit: Three Real Problems Direct File Access Cannot Solve

### The Problem

Every real client this series has built so far — the CLI (Arc 1),
Python scripts (Arc 2), Node.js and C# programs (Arc 3) — opened
`pocket_hardware.db` directly, by its own real file path, and it
worked. Arc 5's own real goal is a desktop app with a genuine web-page
UI. Can that UI simply open the same file directly too, the same way
every earlier client has?

### Introduce the Concept in Isolation

No throwaway code — three real, already-proven or directly-observable
facts, examined together for the first time:

**First, Lesson 27's own real, structural proof.** A browser cannot
open a local file by path at all — `fetch("pocket_hardware.db")` had to
request it, over a real protocol (HTTP), from a real, listening server;
nothing in a browser's own real security model allows
`new SQL.Database(open("C:/path/to/pocket_hardware.db"))` the way
Python's `sqlite3.connect` or C#'s `SqliteConnection` do. Arc 5's own
real UI is a genuine web page, run inside `pywebview`'s own embedded
browser engine — the identical real constraint applies.

**Second, a real addressing problem, not yet named directly in this
series.** `"pocket_hardware.db"` is a real, valid path — but only
*on the one real machine* where that exact file happens to live, in
that exact real folder. A second real machine, or even this same
machine's own browser sandbox, has no real way to reach it by that
path at all. A real network address — `http://localhost:8000/parts`,
this arc's own destination — is reachable by any real client that can
make an HTTP request, on this machine or, with real, correct network
configuration, any other.

**Third, a real duplication problem this series has already paid the
cost of once.** Lesson 22's own `parts_repository.py` — real,
parameterized, constraint-respecting, correctly using `sqlite3.Row` —
exists only in Python. Lesson 25 and Lesson 26 both proved Node.js and
C# can open the same real file directly, but neither one gets any of
Lesson 22's own real safety work for free: a Node.js client would have
to re-derive Lesson 18's own safe parameterization, Lesson 19's own
`sqlite3.Row`-equivalent pattern, and every real business rule, entirely
on its own, in its own language, a second time.

Together, these are the real, concrete case for a **backend**: one
real, single process that owns `pocket_hardware.db` directly, enforces
every real rule exactly once, and exposes a real, network-reachable
interface — reachable from a browser (solving the first problem),
addressable the same way regardless of which real machine a client runs
on (solving the second), and usable by *any* client capable of an HTTP
request, without re-implementing a single line of Lesson 22's own real
logic (solving the third).

### Discard

Nothing to discard — this unit is real, direct reasoning from facts
this series has already established, not disposable example code.

### Mechanical Walkthrough

Not applicable — no code was introduced in this unit.

### CS Lens

A backend is a real, concrete instance of the **client-server
architecture**: a designated, real process that owns a real resource
and mediates every access to it, rather than every consumer holding a
direct reference to that resource itself.

Also recognized in: a real database server itself (Postgres, MySQL — the
"client-server database" category Lesson 01 already named directly, as
opposed to SQLite's own embedded model), a real file server mediating
access to files no client machine could reach directly otherwise, any
real microservice that owns one specific piece of data and answers
requests about it rather than letting every other service touch its
own real storage directly.

### SE Lens

The real, honest tradeoff this arc is about to pay, stated directly
rather than left implicit: everything Arc 1–3 already proved about
SQLite's own real simplicity — no server to start, no network protocol,
open the file and go — is genuinely, partially given up the moment a
real backend enters the picture. Lesson 01's own embedded-vs-client-
server framing, originally about SQLite versus Postgres, now applies
*again*, one layer up: this project is deliberately choosing to build a
real, small client-server layer *on top of* an embedded database,
specifically to solve the three real problems above — not because
SQLite itself needed a server to function correctly, which every
earlier arc already proved it doesn't.

## Connect the pieces

Three real, separately-proven facts, read together for the first time:
a browser cannot reach a local file directly (Lesson 27), a file path
only means something on the one real machine that holds it, and
Lesson 22's own real safety work exists only for Python callers. A
backend is the single, real answer to all three — not a new capability
SQLite itself was missing, but a real, deliberate layer this project
adds on top of it, starting with Lesson 29's own first real FastAPI
endpoint.

## What breaks without this

Not applicable — this lesson causes no real failure on purpose; its own
"proof" is the reasoning above, built entirely from failures and
constraints this series has already caused and confirmed directly in
Lessons 22 and 27.

## Exercises

1. In your own words, write two or three real sentences explaining
   specifically why Lesson 27's own browser constraint — not Lesson 25
   or 26's own successful direct-access proofs — is the single strongest
   piece of evidence for Arc 5's own real architecture needing a
   backend at all.
2. Name one real, additional capability a backend could enforce exactly
   once, centrally, that would be genuinely difficult to guarantee
   consistently if every client (Python, Node.js, C#, a browser) instead
   connected to `pocket_hardware.db` directly and was individually
   trusted to enforce it correctly on its own.

## Definition of Done

- [ ] You can state, from memory and in your own words, all three real
      problems this lesson named that direct file access cannot solve.
- [ ] You can explain specifically why Lesson 27's own browser proof is
      this arc's single clearest piece of supporting evidence.
- [ ] You completed both exercises.

## Next

[Lesson 29 — FastAPI Project Setup and the First Endpoint](lesson-29-fastapi-project-setup-and-the-first-endpoint.md)
builds the real, first, running piece of the backend this lesson just
made the case for.
