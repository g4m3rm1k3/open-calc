# Concept: Storing a Reference by ID, Not by Object

**What you'll understand by the end:** why storing a plain, real ID
string (rather than a direct reference to the actual object) is often
the more correct choice when the referenced object might be replaced
or updated elsewhere — and the real, concrete staleness bug storing a
direct object reference can cause.

**Prerequisites:** `mutable-object-aliasing.md`.

## Setup

None — plain Python, no packages.

## The Problem

One real object (an assignment, a booking, a request) often needs to
refer to another (a machine, a room, a user) that's defined and
managed somewhere else — a real, separate catalog or registry. Storing
a **direct reference** to that other object seems like the obvious
choice, but breaks in a real, specific way if the referenced object is
ever replaced (not mutated in place, but swapped for a new, updated
instance) somewhere else in the system — the holder of the old
reference never finds out, and keeps pointing at stale, outdated data.

## The Isolated Example

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Machine:
    id: str
    name: str
    max_speed: int


machines_by_id = {"m1": Machine("m1", "Lathe A", 4000)}


@dataclass
class BrokenAssignment:
    """Stores a DIRECT OBJECT REFERENCE -- goes stale if the catalog changes."""
    machine: Machine


@dataclass
class Assignment:
    """Stores just the ID -- always looks up the CURRENT real definition."""
    machine_id: str

    def resolve(self, catalog):
        return catalog[self.machine_id]


broken = BrokenAssignment(machine=machines_by_id["m1"])
good = Assignment(machine_id="m1")

machines_by_id["m1"] = Machine("m1", "Lathe A (upgraded)", 6000)

print("BROKEN: still points at the OLD object:", broken.machine)
print("GOOD:   resolves to the CURRENT real object:", good.resolve(machines_by_id))
```

**Real output, run this session:**
```
BROKEN: still points at the OLD object: Machine(id='m1', name='Lathe A', max_speed=4000)
GOOD:   resolves to the CURRENT real object: Machine(id='m1', name='Lathe A (upgraded)', max_speed=6000)
```

**What this proves:** replacing `machines_by_id["m1"]` with an
upgraded `Machine` — a completely real, valid operation on the
catalog — left `broken.machine` genuinely, silently pointing at the
**old**, now-outdated `Machine` object (`max_speed: 4000`), because it
had captured a direct reference to that specific object, not to
whatever currently lives at key `"m1"`. `good`, storing only the ID
and resolving through the catalog on demand, correctly reflects the
**current** real definition (`max_speed: 6000`) every time.

## Mechanical Walkthrough

- `BrokenAssignment.machine` holds a real, direct reference to one
  specific `Machine` object — assigned once, at construction, it never
  changes on its own, no matter what happens to the catalog afterward.
- `machines_by_id["m1"] = Machine(...)` doesn't mutate the *existing*
  `Machine` object at key `"m1"` — it **replaces** the dictionary
  entry with a brand-new object entirely; the old object still exists
  in memory, unchanged, for as long as anything (like `broken.machine`)
  still references it.
- `Assignment.machine_id` holds only a plain string — a real, stable
  identifier that never itself goes stale, because it doesn't
  reference any specific object at all.
- `.resolve(catalog)` performs the real lookup **at the moment it's
  called**, always returning whatever object currently lives at that
  ID — genuinely current, every single time, by construction.

## CS Lens

This is the identical real problem a database **foreign key** solves:
a row referencing another row by its real, stable primary key (an ID)
rather than by embedding a full copy or a direct pointer to the
referenced row's own data — the reference stays valid and current even
as the referenced row is updated, because looking it up always goes
through the real, current table state rather than a frozen snapshot
taken at reference-creation time. This is conceptually the same real
idea `sqlalchemy-relationship-back-populates.md` builds real,
convenient Python-object navigation on top of — but this file's own
version needs no database or ORM at all; it's the identical underlying
principle, applied directly in plain Python.

Also recognized in: a web application storing a `user_id` in a
session rather than a full, embedded copy of the user's own data
(the user's real profile can change without invalidating the session);
any real caching or reference system where "what this points to" must
stay resolvable against the system's own, current state rather than a
value frozen at the moment the reference was first created.

## SE Lens

The real, practical tradeoff: an ID-based reference requires an extra,
real step (a lookup through the catalog) every time the actual
referenced data is needed, and that lookup can genuinely fail if the
ID no longer exists in the catalog at all (a real, different failure
mode a direct object reference doesn't have — a direct reference is
never "missing," just potentially stale). The real payoff is
correctness under change: any system where the referenced data can
legitimately be updated, reloaded, or replaced independently of
whatever's holding a reference to it needs ID-based references
specifically to avoid the exact staleness bug demonstrated above.

## Connection

Builds on `mutable-object-aliasing.md`'s own "does a change here affect
something else" framing, applied here to the opposite real question —
does a change *elsewhere* fail to affect something that should have
reflected it. Directly parallels `sqlalchemy-relationship-back-
populates.md` and `composite-natural-primary-key.md`'s own real
database-key concepts, without requiring any actual database.

## Try It Yourself

1. Change `BrokenAssignment` to instead store a **copy** of the machine
   (`copy.deepcopy(machines_by_id["m1"])`) and confirm it has the
   identical real staleness problem — copying doesn't fix this; only
   re-resolving through a real, live catalog does.
2. Add a real `.resolve(catalog)` call that raises a clear, custom
   exception when the ID no longer exists in the catalog — the real,
   different failure mode ID-based references introduce, worth
   handling explicitly rather than assuming resolution always succeeds.
3. Find a real, existing piece of code (in this project or elsewhere)
   storing a direct object reference to something that could plausibly
   be replaced or reloaded elsewhere, and reason about whether it has
   this exact real staleness risk.
