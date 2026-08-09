# Concept: Emitting Output Only on Change, Seeded from an External Baseline

**What you'll understand by the end:** how to walk a sequence and
produce output only at the points where a tracked value actually
changes — and why seeding the "last known value" from an external
baseline, rather than from the sequence's own first element, matters
for correctness.

**Prerequisites:** `sticky-state-modal-behavior.md`.

## Setup

Python 3, no packages needed.

## The Problem

A common reporting task: given a sequence of readings, print a line
only when a tracked value changes from what was last printed — not on
every reading. The naive version seeds "last printed" from the first
element of the sequence itself. That's wrong whenever the reader has
*already* been told the starting value through some other means (a
summary printed just before this loop runs) — the naive version prints
a redundant first line repeating information the reader already has,
because it has nothing to compare the first element against except
undefined/nothing.

## The Isolated Example

The naive version, and its bug:

```python
already_shown_elsewhere = "green"   # a summary line, printed just before this loop
readings = ["green", "green", "yellow", "yellow", "red"]

last = None
for value in readings:
    if value != last:
        print(f"changed to {value}")
        last = value
```

**Real output:**
```
changed to green
changed to yellow
changed to red
```

**What this proves:** the very first line, `"changed to green"`, is
redundant — the reader was already told the state starts at `"green"`
(`already_shown_elsewhere`), so seeing it "change to green" again is
misleading: it implies a real transition happened, when in fact nothing
changed yet.

**The fix — seed `last` from the real, external baseline:**

```python
last = already_shown_elsewhere
for value in readings:
    if value != last:
        print(f"changed to {value}")
        last = value
```

**Real output:**
```
changed to yellow
changed to red
```

**What this proves:** seeding `last` from the real starting state
(instead of `None`, or the sequence's own first element) means only
*genuine* transitions get printed — the reader was already told it
starts green, and now only sees the two real changes that happened
after that.

## Mechanical Walkthrough

- `last = already_shown_elsewhere` — the sticky "last known" tracker
  (see `sticky-state-modal-behavior.md`), initialized from an external
  fact instead of `None` or the loop's own first value.
- `if value != last:` — the emission gate: output only happens on a
  real difference from whatever was last shown, anywhere (including
  before this loop even started).
- `last = value` — after emitting, the tracker updates, so the *next*
  comparison is against this new value, not the original baseline.

## Execution Trace

The naive version, seeded from `None`, against
`readings = ["green", "green", "yellow", "yellow", "red"]`:

- Start: last = None
- value="green":  "green" != None  → True  → print "changed to green"; last="green"
- value="green":  "green" != "green" → False → nothing printed
- value="yellow": "yellow" != "green" → True → print "changed to yellow"; last="yellow"
- value="yellow": "yellow" != "yellow" → False → nothing printed
- value="red":    "red" != "yellow" → True → print "changed to red"; last="red"

The fixed version, seeded from the real baseline `"green"`:

- Start: last = "green"  (already_shown_elsewhere, not None)
- value="green":  "green" != "green" → False → nothing printed
- value="green":  "green" != "green" → False → nothing printed
- value="yellow": "yellow" != "green" → True → print "changed to yellow"; last="yellow"
- value="yellow": "yellow" != "yellow" → False → nothing printed
- value="red":    "red" != "yellow" → True → print "changed to red"; last="red"

Same 5 real readings, same loop, same comparison — only `last`'s
starting value differs, and that one difference is what turns a false
"changed to green" (nothing actually changed) into correct silence on
the first two, identical readings.

## CS Lens

This is diffing against a running baseline — the same shape as `git
diff` (shows only lines that changed from a known prior state, not the
whole file every time) or React's own reconciliation (only re-renders
what changed since the last commit, not the whole tree). The detail
this concept adds on top of plain "track the last value" is specifically
*where the tracker starts*: seeded from context the reader already has,
not from the sequence's own first element, so as not to falsely report
a "change" that never actually happened relative to what's already
known.

Also recognized in: a diff tool run against a specific prior commit
rather than the file's own first line; a chat UI showing "typing..."
only when someone's status changes from what was last displayed, seeded
from their status *before* the chat window opened, not from silence.

## SE Lens

The alternative — always seeding from `None` or the sequence's own
first element — is simpler code (no external baseline parameter
needed), but it's only correct when nothing about the starting state
was ever communicated elsewhere. The real cost of the version built
here is a required parameter (the baseline) that every caller must
supply correctly; get it wrong (seed from the wrong state) and every
emitted "change" downstream is subtly off by one, still executing
without error, which makes this a real, quiet correctness bug if the
baseline is ever passed carelessly.

## Connection

Builds directly on `sticky-state-modal-behavior.md` (the running
tracker itself is ordinary sticky state) and pairs naturally with
`group-consecutive-elements-by-a-sticky-key.md` — both compare a
current value against "the last one that mattered," one to decide
partition boundaries, this one to decide whether to emit anything at
all.

## Try It Yourself

1. Seed `last` from the *wrong* baseline (e.g. `"red"` when the real
   starting state is `"green"`) and observe the resulting output —
   confirm it silently reports a false "changed to green" transition
   even though nothing really changed, proving why the baseline must be
   accurate, not just present.
2. Extend the example to track two independent values at once (e.g.
   color and size), each seeded from its own external baseline, each
   only emitting when its own value changes — confirm one value
   changing doesn't cause the other to spuriously re-emit.
3. Run the sequence with zero elements at all. Confirm the fixed version
   produces no output and no error — the loop body simply never runs.

## A Second Real Facet: When `None` *Is* the Correct Baseline

This file's own Problem section treats seeding from `None` as the
real bug to fix. A real, honest, second case exists where `None` is
**not** a bug at all — it's the genuinely correct baseline, because
nothing about the starting state is actually known to anyone:

```python
readings = ["idle", "idle", "running", "running", "stopped"]

last = None  # genuinely unknown -- no prior real information exists
for value in readings:
    if value != last:
        print(f"changed to {value}")
        last = value
```

**Real output, run this session:**
```
changed to idle
changed to running
changed to stopped
```

**What this proves:** unlike the file's own original example (where a
real, external baseline — `already_shown_elsewhere` — genuinely
existed and got wrongly ignored), here there is no real information
about the machine's state *before* these readings begin — nothing
communicated it elsewhere, because nothing about it is knowable. The
first, real "changed to idle" is completely correct here, not
redundant — it's genuinely the first real fact anyone learns about
this value.

**The real, honest distinction:** seeding from `None` is a bug
specifically when a real, external baseline *exists and is available*
but gets ignored in favor of treating the sequence's own first element
as if it were the beginning of time. Seeding from `None` is *correct*
when no such real baseline genuinely exists — this project's own
machine-state tracking (current tool, spindle state, coolant mode)
seeds from `None` for exactly this reason: nothing real is known about
a machine's state before a program file even starts running.

### Try It Yourself (second facet)

1. Reason about a real, different case in this project's own domain
   where a genuine external baseline *would* exist (a job resuming
   mid-program, where the machine's actual current state genuinely is
   known ahead of time) — and what would have to change in the code to
   correctly use it instead of `None`.
2. Write a single, general function taking an optional real baseline
   (defaulting to `None`) and confirm it produces this file's own
   "naive" behavior when no baseline is given, and the "fixed" behavior
   when one is — one real function correctly handling both cases.
3. Explain, in your own words, why "seed from `None`" and "seed from a
   known baseline" are not actually two different techniques, but the
   *same* technique applied honestly to two genuinely different real
   situations — what's the one, real question that decides which
   applies?
