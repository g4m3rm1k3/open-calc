# Concept: Stubs — Deliberately Simple Placeholders

**What you'll understand by the end:** how to build a real, working interface backed by fake or hardcoded data, so everything depending on that interface can be built and verified before the harder, real implementation exists.

**Prerequisites:** none.

## Setup

No install needed — any language works. The isolated example uses Python.

## The Problem

Building a real, persistent data layer (a database, a file store, a real external API integration) is often genuinely more work than building whatever consumes that data (a UI, a report, another function). Blocking all of that downstream work until the real data layer is finished means nothing can be verified end-to-end until the hardest, slowest piece is done — and any design mistake in the downstream code is only discovered late, after real persistence work has already happened too.

## The Isolated Example

```python
# The stub — hardcoded, in-memory, temporary
def get_current_user():
    return {"id": 1, "name": "Test User", "role": "operator"}

# Code built and tested against the stub, unaware it isn't real yet
def greet(user_lookup):
    user = user_lookup()
    return f"Welcome, {user['name']} ({user['role']})"

print(greet(get_current_user))
```

**Real output:**
```
Welcome, Test User (operator)
```

**Later, once real persistence exists — the stub is replaced, the consumer is untouched:**
```python
def get_current_user():
    row = database.query("SELECT id, name, role FROM users WHERE id = ?", [session.user_id])
    return {"id": row.id, "name": row.name, "role": row.role}

print(greet(get_current_user))  # unchanged call, unchanged output shape
```

**What this proves:** `greet` never needed to change — it was written and verified entirely against `get_current_user`'s *shape* (a function returning a dict with `id`/`name`/`role`), never against *how* that data was actually obtained. Swapping a hardcoded stub for a real database query was a change contained entirely inside `get_current_user`.

## Mechanical Walkthrough

- A **stub** is a real, working piece of code — callable, returning real, correctly-shaped data — that stands in for a harder, not-yet-built implementation, satisfying the exact interface later code will depend on.
- Everything built to consume a stub's output (a UI, a report, a downstream function) is written against that output's real *shape*, not against how it was produced — this is what makes a later swap possible with zero changes on the consuming side.
- A stub differs from a **mock** (a related but distinct testing concept): a mock is typically used specifically within a test to verify *how* something was called (did this function get called exactly once, with these arguments); a stub simply returns fixed, plausible data so surrounding code has something real to work with, independent of any test.
- A stub is explicitly temporary and known to be temporary — naming it as a stub (in a comment, a variable name like `FAKE_...`, or, as here, in project documentation) is what prevents it from being silently mistaken for the real, finished implementation later.

## CS Lens

This is building against an **interface before an implementation** — the consuming code's real dependency is a *contract* ("give me a dict shaped like this"), not any particular way of fulfilling it; a stub and a real implementation are simply two different, swappable fulfillments of that same contract. This is the same underlying idea `python-custom-exceptions.md`'s error-translation boundary and `pure-functions-testability.md`'s dependency-on-shape-not-mechanism both rely on, applied here specifically to sequencing *when* the real implementation needs to exist.

Also recognized in: API mocking during frontend development (a frontend team building against a hardcoded, agreed-upon JSON shape before a backend team has finished the real endpoint), "walking skeleton" architectures in software delivery (a minimal, real, end-to-end path built first, entirely with stubs, then fleshed out piece by piece), and feature flags that return fixed data in a not-yet-launched code path.

## SE Lens

The real, practical value: an entire vertical slice of a system (data → logic → display) can be built, wired together, and verified to actually work *before* its hardest, slowest-to-build piece is finished — surfacing real design problems (a UI that needs a field the planned data shape doesn't have, for instance) early, while they're still cheap to fix, rather than after real persistence work is already built around the wrong shape. The real risk, worth naming honestly: a stub that's forgotten and never replaced becomes a real, silent lie — code that looks finished but secretly never persists or reflects real state — which is exactly why naming it explicitly as temporary, in both code and documentation, matters.

## Connection

A stub is what a real feature's read path commonly starts as, before `pure-functions-testability.md`'s testing discipline and a real persistence layer (a database, a file) are added later, at which point only the stub itself — never its consumers — needs rewriting.

## Try It Yourself

1. Write a stub function returning a hardcoded list of three items, and a second function that consumes it (filtering, formatting, or summing something) — confirm the consumer works correctly, then replace the stub's body with a different hardcoded list and confirm the consumer adapts with zero changes to its own code.
2. Deliberately leave a stub's shape *slightly* wrong (missing a field a consumer will eventually need) and notice, before writing the real implementation, that the consumer's own design already reveals the gap — reasoning about why catching this now, against a cheap stub, is better than catching it after real persistence work is done.
3. Search a real codebase you have access to for a function or variable with an obvious "fake," "stub," "mock," "TODO," or "temporary" naming signal, and investigate whether it's still genuinely temporary or whether it silently became permanent without ever being replaced.
