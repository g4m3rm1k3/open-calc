# Concept: Attributing Resolved State to Its Origin Event

**What you'll understand by the end:** how to find *which specific
past event* produced a value you're currently holding as resolved,
carried-forward state — and why the resolved value alone isn't enough
information to answer that.

**Prerequisites:** `sticky-state-modal-behavior.md`.

## Setup

Python 3, no packages needed.

## The Problem

`sticky-state-modal-behavior.md` covers *reading* sticky state: a value
persists until something explicitly changes it, and later steps just
read whatever's currently active. That's enough for display. It is not
enough for *editing*: to change a sticky value, you need to know which
specific past event actually set it — not just what its current,
resolved value is — because the resolved value alone doesn't say
where it came from. A snapshot taken at any later point looks
identical whether the value was set one step ago or fifty steps ago.

## The Isolated Example

```python
events = [
    {"line": 1, "sets_bold": True},
    {"line": 2, "sets_bold": None},
    {"line": 3, "sets_bold": None},
    {"line": 4, "sets_bold": None},
]

# Resolved state at line 4: bold is True. But which line set it?
resolved_bold = None
for e in events:
    if e["sets_bold"] is not None:
        resolved_bold = e["sets_bold"]
print("resolved value at line 4:", resolved_bold)


def find_origin(events, upto_line, sets_it):
    for e in reversed(events[:upto_line]):
        if sets_it(e):
            return e
    return None


origin = find_origin(events, 4, lambda e: e["sets_bold"] is not None)
print("originating line:", origin["line"] if origin else None)
```

**Real output:**
```
resolved value at line 4: True
originating line: 1
```

**What this proves:** the resolved value alone (`True`) says nothing
about *where* it came from — reaching that requires a second, separate
search, walking backward through the real event history, not just
reading the current snapshot.

## Mechanical Walkthrough

- The first loop computes ordinary sticky/resolved state (`sticky-
  state-modal-behavior.md`'s own idea) — a single, forward pass, no
  memory of *which* event set the value, only what it currently is.
- `find_origin` is a second, distinct operation: walking `events[:
  upto_line]` **backward** (`reversed(...)`), stopping at the first
  (i.e., most recent) event that satisfies `sets_it` — the actual
  event responsible for today's resolved value.
- Returning `None` when nothing in range set it explicitly is a real,
  meaningful case: the value is an inherited default from *before* the
  range being searched, not something any event in scope actually set
  — a caller has to decide what to do then (this concept doesn't
  prescribe that; see Connection).

## Execution Trace

The forward pass (resolving *what*), traced against the real `events`
list above:

```
Start: resolved_bold = None
e = {line: 1, sets_bold: True}  → sets_bold is not None → resolved_bold = True
e = {line: 2, sets_bold: None}  → sets_bold is None     → resolved_bold unchanged (True)
e = {line: 3, sets_bold: None}  → sets_bold is None     → resolved_bold unchanged (True)
e = {line: 4, sets_bold: None}  → sets_bold is None     → resolved_bold unchanged (True)
Final: resolved_bold = True
```

The backward search (resolving *where*), `find_origin(events, 4, ...)` —
`events[:4]` is all four events, `reversed(...)` walks them line 4 → 1:

```
Check line 4: sets_bold is None → sets_it(e) is False → keep searching
Check line 3: sets_bold is None → sets_it(e) is False → keep searching
Check line 2: sets_bold is None → sets_it(e) is False → keep searching
Check line 1: sets_bold is True → sets_it(e) is True  → return this event
Result: origin = {line: 1, sets_bold: True}
```

The forward pass touches all 4 events and keeps overwriting the same
variable; the backward search stops at the *first* match it finds
walking in reverse — which is why it correctly lands on line 1 in one
pass, without needing to compare timestamps or track "the last one that
changed it" separately.

## CS Lens

This is the same operation as `git blame`: given a file's current line
content, find which specific commit last touched it — not just what the
content currently is. Also recognized in: a spreadsheet's "trace
precedents" feature (which cell/formula produced this value); a
database audit log's "who last modified this row" query; a debugger's
reverse-execution/time-travel search for "which statement set this
variable to its current value."

## SE Lens

The real cost this concept accepts: an explicit, backward search over
history, rather than an O(1) read of a cached resolved value — genuinely
more expensive than just reading sticky state, and only worth paying
when you specifically need attribution (editing, auditing, debugging),
not for ordinary display. A system that never needs to *change* sticky
state, only read it, has no reason to pay this cost — this technique is
reached for exactly at the boundary between "read-only" and "editable."

## Connection

Builds directly on `sticky-state-modal-behavior.md` — the resolved
value being attributed is exactly that same sticky/modal state; this
concept adds the missing "which event set it" question sticky state
alone never answers. Pairs with `partition-and-replace-within-a-
combined-field.md` once the origin event is found: locating *which*
line to edit is only half the problem; editing it correctly (without
disturbing unrelated data on that same line) is the other half.

## Try It Yourself

1. Change `events` so line 2 (not line 1) sets `sets_bold`, and confirm
   `find_origin` at line 4 now correctly returns line 2, not line 1 —
   the search always finds the *most recent* setter, not the first one
   in the list.
2. Call `find_origin` with `upto_line=1` (searching only through line
   1) after moving the bold-setting event to line 2 — confirm it
   correctly returns `None`, since nothing in that narrower range set
   the value.
3. Extend the example with a *second*, independent sticky field (e.g.
   `sets_italic`) and write a second, separate `find_origin` call for
   it — confirm each field's own origin is found independently, proving
   this technique doesn't assume only one sticky field exists at a
   time.
