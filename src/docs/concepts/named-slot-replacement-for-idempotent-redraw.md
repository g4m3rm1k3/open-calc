# Concept: Named-Slot Replacement for Idempotent Redraw

**What you'll understand by the end:** a technique for safely
regenerating derived visual output from scratch, over and over, by
giving each real piece of output a stable **name** and always
re-adding under that name — so re-adding replaces the previous version
in place rather than piling up duplicates, and a genuinely different
technique from `rebuild-derived-ui-preserving-valid-state.md`'s own
capture/clear/restore approach.

**Prerequisites:** `python-dict-setdefault.md`.

## Setup

None — plain Python, no packages.

## The Problem

Some real output needs to be **fully recomputed from scratch** every
time its underlying source data changes (a chart, a 3D scene, a set of
overlays) — not incrementally patched. Calling the same "add this to
the display" operation again naively would just pile up a second,
duplicate copy alongside the first, since most display APIs have no
built-in notion of "this is a redo, not an addition." Manually tracking
and removing every previous piece of output before adding the new one
works, but is exactly the kind of bookkeeping that's easy to get
subtly wrong (forgetting one, removing the wrong one).

## The Isolated Example

```python
class Scene:
    """Stands in for a real renderer's own scene graph."""

    def __init__(self):
        self._actors = {}

    def add_mesh(self, mesh, name):
        replaced = name in self._actors
        self._actors[name] = mesh
        return replaced

    def remove_actor(self, name):
        if name in self._actors:
            del self._actors[name]

    def actor_names(self):
        return sorted(self._actors)


def redraw(scene, groups):
    for name, mesh in groups.items():
        replaced = scene.add_mesh(mesh, name=name)
        print(f"  add_mesh(name={name!r}) -- replaced existing: {replaced}")
    for name in list(scene.actor_names()):
        if name not in groups:
            scene.remove_actor(name)
            print(f"  remove_actor({name!r}) -- no longer present")


scene = Scene()

print("First redraw -- kinds: rapid, feed")
redraw(scene, {"rapid": "mesh-r1", "feed": "mesh-f1"})
print("actors now:", scene.actor_names())

print()
print("Second redraw -- SAME kinds, new geometry (simulating a source-data edit)")
redraw(scene, {"rapid": "mesh-r2", "feed": "mesh-f2"})
print("actors now:", scene.actor_names())
print("rapid actor is the NEW mesh, not a duplicate:", scene._actors["rapid"])
```

**Real output, run this session:**
```
First redraw -- kinds: rapid, feed
  add_mesh(name='rapid') -- replaced existing: False
  add_mesh(name='feed') -- replaced existing: False
actors now: ['feed', 'rapid']

Second redraw -- SAME kinds, new geometry (simulating a source-data edit)
  add_mesh(name='rapid') -- replaced existing: True
  add_mesh(name='feed') -- replaced existing: True
actors now: ['feed', 'rapid']
rapid actor is the NEW mesh, not a duplicate: mesh-r2
```

**What this proves:** calling `redraw` a **second** time with entirely
new mesh objects, using the identical two names, genuinely left
`scene.actor_names()` unchanged (`['feed', 'rapid']`, still exactly
two) — no duplicates accumulated. `add_mesh` itself reports
`replaced existing: True` the second time, and the actual stored value
under `"rapid"` is confirmed to be the **new** mesh (`mesh-r2`), not
the first one — the name genuinely acts as a slot whose contents get
swapped, not a fresh addition each call.

A real, further case — a kind disappearing entirely between redraws:

```python
print("Third redraw -- 'feed' kind disappears entirely")
redraw(scene, {"rapid": "mesh-r3"})
print("actors now:", scene.actor_names())
```

**Real output, run this session:**
```
Third redraw -- 'feed' kind disappears entirely
  add_mesh(name='rapid') -- replaced existing: True
  remove_actor('feed') -- no longer present
actors now: ['rapid']
```

**What this proves:** when the new redraw's `groups` no longer
contains `"feed"` at all, `redraw`'s own second loop correctly detects
it's still present in the scene from before and explicitly removes it
— `actor_names()` correctly drops to just `['rapid']`, with no stale
leftover geometry from a kind that no longer has any real data behind
it.

## Mechanical Walkthrough

- Each real, distinct category of output (`"rapid"`, `"feed"`) is
  given a **stable name**, chosen to be the same every single redraw —
  not a fresh, unique identifier generated per call.
- `add_mesh(mesh, name=...)` is deliberately **not** append-only — the
  underlying `dict`-keyed-by-name storage (`self._actors[name] =
  mesh`) means adding under an existing name overwrites, it never
  grows a second entry.
- A full redraw calls `add_mesh` again for **every** currently-real
  category, unconditionally — there's no attempt to diff "what changed
  since last time"; the entire, correct new state is computed from
  scratch every call, and the name-keyed replacement handles making
  that safe to repeat.
- Categories that no longer have any real data need one further,
  explicit step: checking which previously-known names are absent from
  the new redraw and removing those specifically — replacement alone
  only handles categories that are still present, not ones that
  vanished entirely.

## CS Lens

This is a real, concrete instance of designing an operation to be
**idempotent** with respect to identity, not to input — calling
`add_mesh(mesh, name="rapid")` any number of times in a row, with
different `mesh` values each time, always leaves the scene in exactly
one well-defined state for that name (whatever was passed most
recently), never an accumulating pile. This is a genuinely different
real idea from `idempotent-initialization-guard.md`'s own shape (code
that runs its real effect at most once, then skips on every later
call) — here, the operation is meant to run, and take full effect,
every single time; idempotence lives in the *replacement* semantics of
the name, not in skipping repeat calls.

Also recognized in: a dictionary or hash map itself (`d[key] = value`
always overwrites, never duplicates); a database `UPSERT`/`INSERT ...
ON CONFLICT` operation keyed by a stable ID; a UI framework re-running
its entire render function on every state change and relying on keyed
elements (see `react-key-prop-reconciliation.md`) to update the right
DOM node in place rather than creating a new one.

## SE Lens

The real, practical payoff: the redraw function never has to track
*what changed* between calls — it can always compute the full, correct
output from the current source data and hand it to the display layer
wholesale, trusting the name-keyed replacement to make repeated calls
safe. This is a genuinely simpler real design than manually diffing
old vs. new state by hand, at the real cost of redoing work that
didn't actually need to change (rebuilding `"rapid"`'s mesh even when
only `"feed"`'s data changed) — a worthwhile, deliberate tradeoff when
the recomputation itself is cheap relative to the bookkeeping a manual
diff would require, and when correctness (never leaking stale output)
matters more than micro-optimizing every redraw.

## Connection

Builds on `python-dict-setdefault.md`'s underlying dict-based storage
style. Genuinely distinct from
`rebuild-derived-ui-preserving-valid-state.md` — that file's own
technique exists specifically to **preserve** still-valid pieces of
prior state (a user's own selection) across a rebuild; this file's
technique makes **no** attempt to preserve anything from the previous
call — every redraw fully replaces whatever was there before, for
every name still present, and removes what's no longer present. The
two are easy to conflate ("both happen on rebuild") but solve
genuinely different problems: one is about *carrying forward user
state*, the other is about *safely repeating a from-scratch
computation*. A real, applied instance in this project's own history:
a 3D toolpath view, re-derived on every text edit, grouping the real
program's motion into a handful of named categories (by real motion
kind) and re-adding each one under its own stable name every time —
letting the view redraw completely from scratch on every keystroke
without ever accumulating duplicate or stale geometry.

## Try It Yourself

1. Call `redraw` a fourth time with a **new** category name never seen
   before (`"arc"`) alongside `"rapid"` — confirm it's added
   correctly, with `replaced existing: False`, exactly like a
   brand-new name should report.
2. Remove the second loop (the one calling `remove_actor` for
   vanished categories) from `redraw` entirely, then rerun the third
   redraw from the isolated example — observe the real, stale `"feed"`
   actor that incorrectly survives, direct, concrete proof why that
   second loop is a genuinely necessary part of the pattern, not
   optional cleanup.
3. Reason about (then confirm) what would happen if `redraw` generated
   a fresh, unique name every call (e.g. `f"rapid-{call_count}"`)
   instead of a stable one — confirm `actor_names()` grows without
   bound across repeated redraws, a concrete, felt sense of the exact
   bug stable naming exists to prevent.
