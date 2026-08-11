# Phase Transition: Building Systems → Running Them
### What's changing, what's being skipped and why, and what carries over

Thirteen lessons, three C++ systems projects — a package manager, a
working Mini Git — and, before that, three full language phases. Before
Phase 7 starts, it's worth being just as explicit about this boundary as
the Python→JavaScript one was, because this transition is a genuinely
different kind of shift: not a new language, but a new *category* of
concern.

---

## What kind of shift this actually is

Every phase so far has been, underneath its project theme, about
**building a thing correctly**: does `Note` behave right, does the
B-Tree stay balanced, does the Merkle tree's hash actually change when
it should. Phase 7 is about a different, later question: **does the
thing you built keep working once it's real** — once real users hit it
concurrently, once it has to run unattended for months, once someone
other than you has to operate it at 3 AM. That's not a smaller version
of the same problem. It's a genuinely different set of failure modes,
most of which never show up in a single developer running code once on
their own machine — which is exactly why nothing in Phases 1 through 5
could have taught them honestly.

The project map's own language for this is precise, and worth quoting
directly: *"Patterns become architecture instead of classes."* Every
pattern this curriculum has built by hand — Repository (Project 1),
Observer (Project 2, and native in Project 4), Strategy, Command,
Adapter, Decorator, Mediator, Composite, Visitor — was always one class,
touchable, readable start to finish in a single lesson. Phase 7 asks the
same underlying questions at a scale where the "pattern" is a whole
service's shape: not "does this one object hide its storage details"
but "does this whole system's authentication layer, log pipeline, and
deployment process hide their details from each other the same way."

---

## What's being skipped, and why that's a deliberate choice, not a gap

The original project map for this phase named two more standalone
projects — a Web Server and a Chat Server — that this curriculum is
*not* building as separate projects here. That's worth being direct
about rather than silently dropping: both of those problems were
already built, for real, substantially earlier —

- **Web Server** — Project 3 (Phase 1, Lessons 8–9) already built a
  real HTTP server from scratch: routing, request parsing, response
  building, validation, dependency injection. Rebuilding that shape a
  second time, in a different language, would repeat ground this
  curriculum has already covered honestly, not extend it.
- **Chat Server** — Project 6 (Phase 2, Lesson 14) already built a real
  WebSocket broadcast server — persistent connections, real-time
  multi-client messaging — from the ground up.

Per this curriculum's own stated philosophy — *"mix and match... not
every design and every pattern in every language"* — repeating those
two projects here would be coverage for its own sake, not learning
driven by a real, new problem. What Phase 7 asks instead is a genuinely
different question about systems like those: not "can you build a web
server" (already proven) but "can you make one *trustworthy* — secured,
observable, deployable, and correct under concurrent, adversarial, or
simply unattended real-world conditions."

---

## The language for this phase

Phase 7 returns to **Python**. This is a deliberate choice, not a
default: the concerns this phase covers — authentication, logging,
caching, testing at a system level, deployment — are conceptually
identical regardless of language, and Python's own low ceremony (proven
throughout Phase 1) keeps that focus on the *concept*, not on managing a
second language's own syntax while learning it. It's also a genuine
full-circle moment: Project 3's own REST API, built in Phase 1, is
exactly the kind of system this phase's lessons will make production-
ready — the same code, revisited with a different, later set of
questions.

---

## A concrete preview: why "just hash the password" isn't enough

Authentication is one of this phase's first real subjects, and it's
worth previewing with the same honesty this curriculum has applied to
every other real risk — a proof, not an assertion. Storing a password
by hashing it seems like the obvious fix over storing it in plain text
— but a naive hash has a real, exploitable weakness:

```python
import hashlib

password = "hunter2"

h1 = hashlib.sha256(password.encode()).hexdigest()
h2 = hashlib.sha256(password.encode()).hexdigest()
print("identical hashes?", h1 == h2)
```

Real output:

```
identical hashes? True
```

The same password, hashed twice, produces the **identical** hash both
times — which means anyone who steals a database of unsalted password
hashes can precompute hashes for every common password once (a
**rainbow table**) and instantly recognize matches, no cracking
required. Adding a random **salt** — extra, per-user random data mixed
in before hashing — fixes this directly:

```python
import os

salt1 = os.urandom(16)
salt2 = os.urandom(16)
sh1 = hashlib.sha256(salt1 + password.encode()).hexdigest()
sh2 = hashlib.sha256(salt2 + password.encode()).hexdigest()
print("identical hashes?", sh1 == sh2)
```

Real output:

```
identical hashes? False
```

Same password, completely different hashes — because each one was
mixed with different random data first. This is the shape every lesson
in this phase will take: a plausible-looking "solution" that has a
real, exploitable gap, proven rather than described, then closed
properly.

---

## What's ahead

- **Authentication & authorization** — real password hashing (the
  preview above, taken further with a real, production-grade algorithm,
  not raw SHA-256), sessions and tokens, and the real difference between
  "who are you" and "what are you allowed to do."
- **Logging, metrics, and monitoring** — structured logging (not just
  `print`), and the real difference between a log line written for a
  human debugging by hand and one written for a system parsing
  thousands per second.
- **Caching at scale** — Project 5's own LRU cache (Phase 2, Lesson 13),
  revisited for a world where more than one server process needs to
  share a cache, and what changes once "the cache" isn't just one
  process's own memory anymore.
- **Testing and CI/CD** — beyond Project 1's own `pytest` (Phase 1,
  Lesson 4): integration tests against real running services, and a
  real, working continuous-integration pipeline configuration.
- **Docker and deployment** — packaging a real service so it runs
  identically on any machine, and what "identically" actually depends
  on underneath.
- **Distributed systems basics** — what changes, honestly, once a
  system isn't one process anymore: network calls can fail in ways a
  function call never does, and two servers can disagree about what
  time it is.

Same instinct as every phase before this one: build the plausible
version first, find its real, provable gap, close it — just now, the
plausible version is a whole system's shape, not one class.

---

Ready for Lesson 36 whenever you are.
