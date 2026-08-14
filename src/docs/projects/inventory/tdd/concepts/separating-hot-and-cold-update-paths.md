# Concept: Separating a Hot, Cheap Path From a Cold, Expensive One

**What you'll understand by the end:** why bundling an expensive,
rarely-actually-needed computation together with a cheap, frequently-
needed one forces every caller to pay the expensive cost even when
only the cheap part was needed — and the real fix: splitting them into
two separate, independently-callable functions, so a caller who
already knows which situation it's in can invoke only the one it
actually needs.

**Prerequisites:** `caching-and-memoization.md`.

## Setup

None — plain Python, no packages.

## The Problem

Some real operation ("update everything the screen shows") naturally
has two genuinely different real parts bundled together: a cheap part
that has to run very often (redraw the current view), and an expensive
part that only actually needs to run when the underlying real data has
changed (recompute that data from scratch). Calling one combined
function that always does both means paying the expensive cost on
**every** call — including the vast majority of calls where nothing
that the expensive part produces has changed at all.

## The Isolated Example

The broken, bundled version — every call pays the full, expensive cost:

```python
import time


def expensive_recompute(data):
    # Stands in for a real, costly full pipeline re-run.
    return sorted(data, reverse=True)


def cheap_render(sorted_data, cursor):
    # Stands in for a real, cheap visual-only redraw.
    return sorted_data[cursor % len(sorted_data)]


data = list(range(200_000))

t0 = time.perf_counter()
for frame in range(30):
    sorted_data = expensive_recompute(data)  # redone on EVERY frame
    cheap_render(sorted_data, frame)
t1 = time.perf_counter()
print("expensive work redone every frame -- total (ms):", (t1 - t0) * 1000)
```

**Real output, run this session:**
```
expensive work redone every frame -- total (ms): 95.23999999510124
```

**What this proves:** across `30` real "frames," none of which
actually changed the underlying `data`, `expensive_recompute` still
ran all `30` times — real, repeated, wasted work, since sorting the
identical, unchanged data 30 times can never produce anything but the
identical, unchanged result each time.

The fix — split the two real concerns into separate, independently-
callable functions:

```python
t0 = time.perf_counter()
sorted_data = expensive_recompute(data)  # runs ONCE
for frame in range(30):
    cheap_render(sorted_data, frame)  # runs every frame, but it's cheap
t1 = time.perf_counter()
print("expensive work run once, cheap render per frame -- total (ms):", (t1 - t0) * 1000)
```

**Real output, run this session:**
```
expensive work run once, cheap render per frame -- total (ms): 3.236900025513023
```

**What this proves:** splitting the two functions apart let the
calling code run `expensive_recompute` exactly **once**, then call
only `cheap_render` — genuinely cheap — for every one of the 30 real
frames, roughly a **30x** real speedup, with the identical final
visual result.

## Mechanical Walkthrough

- The two real parts of "update everything" — recomputing derived
  data, and redrawing based on it — become two **separate, named**
  functions, each independently callable, rather than one bundled
  operation that always does both.
- The calling code, not the functions themselves, decides **which**
  situation it's actually in — a real edit occurred (call both,
  in order) versus nothing changed, just time passing (call only the
  cheap one) — because the caller already, structurally knows which
  real trigger it's responding to.
- Nothing here **detects** whether the underlying data actually
  changed — that decision is made explicitly, by the caller choosing
  which function(s) to invoke, not by comparing an old value to a new
  one automatically.

## CS Lens

This is a real, deliberate **hot path / cold path** separation — the
hot path (called very frequently, must stay cheap) is kept free of any
work that only the cold path (called rarely, can afford real expense)
actually needs to do. This is a genuinely different real mechanism
from `caching-and-memoization.md`'s own technique: memoization
**automatically** detects "have I already computed this" (typically by
comparing or hashing inputs) and transparently skips redundant work
inside a *single* function; this file's technique instead **exposes**
two separate functions and relies on the caller's own, already-
available knowledge of which real situation it's in — no comparison or
cache-key logic is needed anywhere, because the caller was never
confused about which case applied.

Also recognized in: a game engine's own separate `update()` (game
logic, runs on a fixed real tick) and `render()` (drawing, runs as
often as the display can manage) loop functions; a web framework
separating "recompute this expensive database query" from "re-render
the already-fetched data as HTML"; any real UI's distinction between
"the model changed, rebuild the view" and "just repaint what's already
there."

## SE Lens

The real, practical payoff, demonstrated directly above: a real,
dramatic performance win, achieved with **less** conceptual bundling,
not more — two small, focused functions instead of one that silently
does two genuinely different jobs. The real, honest cost: the calling
code now has a real, additional responsibility — correctly knowing
which situation it's in and calling the right function(s) — that a
single, always-does-everything function would have handled
automatically, if wastefully; getting this wrong (calling only the
cheap path when the expensive one was actually needed) produces a real,
concrete bug: a redraw against stale, no-longer-correct derived data.

## Connection

Builds on `caching-and-memoization.md`, specifically as a contrast —
both techniques exist to avoid redundant expensive work, but memoization
detects redundancy automatically from *within* one function, while
this file's technique relies on the *caller* already knowing which
real case applies, exposed as two separate, explicitly-chosen
functions. A real, applied instance in this project's own history: a
continuous toolpath-playback feature explicitly separating a cheap,
visual-only `_render()` (called on every single playback tick, and on
UI toggles) from an expensive `_refresh_toolpath()` (the full macro-
resolution/canned-cycle-expansion/toolpath-parsing pipeline, plus a
camera reset) — only ever run when a real edit actually occurred, with
every playback tick calling `_render()` alone.

A second, real, applied instance: a folder-comparison view offering
two independent toggles that look similar but sit on opposite sides of
this exact hot/cold split — "Show Only Differences" re-renders the
visible table rows from an already-computed comparison result (cheap,
no filesystem access), while "Ignore Spaces" has to re-run the entire
real comparison from scratch (expensive — re-walking the whole
directory tree and re-reading and re-normalizing every real file's
content), because *what counts as a difference at all* genuinely
changes, not just which already-computed rows are shown. The two
checkboxes are wired to two different real methods for exactly this
reason — one calls the cheap, display-only render function directly,
the other calls the expensive, full-rescan function that then also
re-renders.

## Try It Yourself

1. Increase the frame count from `30` to `300` in the broken, bundled
   version and confirm the real, wasted cost scales up roughly
   linearly — the wastefulness compounds the longer a real "playback"
   or "frame loop" runs.
2. Deliberately introduce the real bug this split makes possible:
   change `data` after the split version's own one-time
   `expensive_recompute` call, then call `cheap_render` several more
   times — confirm it keeps rendering the real, now-**stale** old
   data, direct, concrete proof of the responsibility the caller now
   bears for calling the expensive path when it's actually needed.
3. Compare this file's technique against memoizing `expensive_recompute`
   itself instead (per `caching-and-memoization.md`) — reasoning about
   which approach fits better when the calling code already,
   structurally knows the real answer to "did anything change" for
   free (a real edit event vs. a real timer tick), versus when that
   knowledge genuinely isn't available at the call site and has to be
   inferred by comparing inputs.
