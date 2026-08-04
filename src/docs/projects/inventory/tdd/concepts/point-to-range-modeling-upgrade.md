# Concept: Upgrading a Point Model to a Range Model

**What you'll understand by the end:** why modeling something as a
single point (one line, one timestamp, one index) breaks the moment a
real query needs to ask "does this fall *within* it," and the small,
mechanical change — one field becomes two, inclusive start and end —
that fixes it.

**Prerequisites:** `python-dataclasses.md`.

## Setup

Python 3, no packages needed.

## The Problem

Some real things are naturally modeled as a single point at first —
one line number, one timestamp — because the first real question ever
asked about them is "did this happen at exactly this spot." A real,
different question shows up later: "is this *other* spot inside it,"
which a pure point can't answer at all — there's nothing for "inside"
to mean when the thing itself has no width.

## The Isolated Example

The point model — correct for exact matches, silently unable to answer
containment:

```python
from dataclasses import dataclass


@dataclass
class IncidentPoint:
    occurred_at: int  # a single line/tick, not a real span


def affected_by_point(incidents, line):
    return [i for i in incidents if i.occurred_at == line]


points = [IncidentPoint(10), IncidentPoint(25)]
print("point model, exact match only:", affected_by_point(points, 12))
```

**Real output, run this session:**
```
point model, exact match only: []
```

The range model — the same real data, upgraded to carry a start and an
end:

```python
@dataclass
class IncidentRange:
    started_at: int
    ended_at: int  # inclusive


def affected_by_range(incidents, line):
    return [i for i in incidents if i.started_at <= line <= i.ended_at]


ranges = [IncidentRange(10, 18), IncidentRange(25, 25)]
print("range model, correctly finds the containing incident:", affected_by_range(ranges, 12))
print("range model, a single-line incident still works (start==end):", affected_by_range(ranges, 25))
```

**Real output, run this session:**
```
range model, correctly finds the containing incident: [IncidentRange(started_at=10, ended_at=18)]
range model, a single-line incident still works (start==end): [IncidentRange(started_at=25, ended_at=25)]
```

**What this proves:** `affected_by_point(points, 12)` genuinely returns
**nothing** — `12` isn't exactly `10` or `25`, and a point model has no
other real notion of "close to" or "within." `affected_by_range`,
asked the identical real question against the upgraded model, correctly
finds the incident that genuinely spans line `12` (`10` through `18`).
The second check confirms the range model didn't lose anything the
point model could do — an incident that's really just one line
(`started_at == ended_at == 25`) still matches an exact query
correctly, a real range with zero width being a strict generalization
of a point, not a replacement that loses precision.

## Mechanical Walkthrough

- A **point** model carries exactly one real value locating "where"
  something is — equality (`==`) is the only real, meaningful query
  against it.
- A **range** model carries two real values, a start and an inclusive
  end — its own natural query is containment (`start <= x <= end`),
  which subsumes equality as the special case where `start == end`.
- The upgrade is almost always additive at the *data* level (one field
  becomes two) but requires real, corresponding changes everywhere the
  old field was read — every real caller comparing against the old
  single point now has to decide whether it means "the start," "the
  end," or genuinely "anywhere within."
- The real trigger for this upgrade is never "ranges are more
  general, so start with them" — it's a real, concrete new
  requirement (a query needing "within," not just "equals") that a
  point model provably cannot answer at all, discovered only once that
  requirement actually arrives.

## CS Lens

This is a real, common instance of **generalizing a model's own
granularity to match its real unit of meaning** — a point is a
zero-width interval, and an interval is the natural generalization the
moment "does X fall inside this" becomes a real question the point
version structurally cannot answer, no matter how the query code around
it is written. The same real relationship as a single database row
representing an instant versus a `[start, end)` interval representing a
duration — interval trees, range queries, and interval-scheduling
algorithms all exist specifically because "point vs. range" is a
recurring, fundamental modeling fork, not a one-off design choice.

Also recognized in: a calendar event upgraded from a single reminder
timestamp to a real start/end duration; a version-control "blame" tool
attributing a change to a single commit versus a real range of commits
a bisection narrowed it to; genomic sequence analysis modeling a single
mutation site versus a real affected region.

## SE Lens

The real, practical signal this upgrade is needed: a query that should
have a real, sensible answer ("what incident was active at line 12")
structurally *cannot* be expressed against the current point model at
all — not a bug in existing logic, but a real, missing capability no
amount of clever querying against the old shape can produce. The real,
honest cost: every existing caller reading the old single field has to
be found and updated to state, explicitly, which of "start," "end," or
"contains" it actually meant — a point model's own ambiguity (is this
value the start, the end, or just "the" location) only becomes visible
once it's forced to split into two real, named fields.

## Connection

Builds on `python-dataclasses.md`. A real, independently-arrived-at
instance appearing **twice** in this project's own history, in two
unrelated parts of the same codebase, for the identical underlying
reason: a sequence model gaining `start_line`/`end_line` instead of a
single point, once "which subprogram calls fall inside this sequence"
became a real question; and a diff model's own per-row entries
replaced by per-range entries once real, editable line numbers (not a
padded, artificially-aligned row index) needed to be the unit of
navigation. Directly relevant to `avoid-premature-abstraction.md`'s
own convergent-design facet — two independent real occurrences of this
identical upgrade, worth explicitly naming as the same recurring shape
rather than two unrelated coincidences.

## Try It Yourself

1. Add a real `duration` property to `IncidentRange`
   (`ended_at - started_at + 1`) and confirm it correctly reports `1`
   for the zero-width `IncidentRange(25, 25)` — direct, real proof a
   range with `start == end` behaves exactly like the point model's own
   single value, just expressed with two fields instead of one.
2. Write a function checking whether two `IncidentRange`s **overlap**
   (`a.started_at <= b.ended_at and b.started_at <= a.ended_at`) and
   confirm this is a real, new query the original point model had no
   way to express at all, not even awkwardly.
3. Find a real point-modeled value in a codebase you have access to,
   and reason about whether a real "does X fall within this" question
   has ever come up (or plausibly could) — if so, sketch what the
   corresponding range upgrade would look like, and what existing
   callers would need to change.
