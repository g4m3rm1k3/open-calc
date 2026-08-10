# Concept: Storing Context-Scoped Data on Its Real Context, Not the Object It Names

**What you'll understand by the end:** why a real identifier that
looks like it names one specific thing ("spot 5," "tool T1") can
actually only be meaningful *within* a specific, real context — and
why data keyed by that identifier has to live on the context that
gives it meaning, not on some other object the identifier superficially
seems to belong to.

**Prerequisites:** `python-classes-instances.md`.

## Setup

None — plain Python, no packages.

## The Problem

Some real identifiers aren't globally unique at all — they're only
unique *within* a specific, real scope, and the identical identifier
genuinely means something different in a different scope (`"spot 5"`
in one parking garage is a completely different real space from
`"spot 5"` in another). Storing data keyed by that identifier in one
single, shared, global place quietly assumes it's globally meaningful
— and two different, real, correct assignments sharing the identical
identifier will collide, with the second one silently overwriting the
first.

## The Isolated Example

The broken, global version — one shared dict, keyed only by spot
number:

```python
global_assignments = {}


def assign_broken(spot_number, car):
    global_assignments[spot_number] = car


assign_broken(5, "Honda Civic")  # meant for the Downtown garage
assign_broken(5, "Ford F150")  # meant for the Airport garage -- but there's only ONE real slot for spot 5

print("global spot 5 (should have been TWO different real cars):", global_assignments[5])
```

**Real output, run this session:**
```
global spot 5 (should have been TWO different real cars): Ford F150
```

**What this proves:** the Downtown garage's own real assignment
(`"Honda Civic"` in its own spot 5) was **silently overwritten** by
the Airport garage's completely unrelated assignment — both used the
identical identifier (`5`), and the single, global dict had no way to
tell them apart, because it never modeled *which garage* each
assignment actually belonged to.

The fix — data scoped to its own real context:

```python
class Garage:
    def __init__(self, name):
        self.name = name
        self.spot_assignments = {}  # spot_number -> car -- MEANINGFUL ONLY within this garage

    def assign(self, spot_number, car):
        self.spot_assignments[spot_number] = car

    def car_in(self, spot_number):
        return self.spot_assignments.get(spot_number)


downtown = Garage("Downtown")
airport = Garage("Airport")

downtown.assign(5, "Honda Civic")
airport.assign(5, "Ford F150")

print("downtown spot 5:", downtown.car_in(5))
print("airport spot 5:", airport.car_in(5))
```

**Real output, run this session:**
```
downtown spot 5: Honda Civic
airport spot 5: Ford F150
```

**What this proves:** with `spot_assignments` living **on each real
`Garage` instance** instead of one shared, global dict, both real
assignments coexist correctly — `downtown.car_in(5)` and
`airport.car_in(5)` genuinely disagree, exactly as they should, since
`"spot 5"` was never a globally meaningful identifier to begin with.

## Mechanical Walkthrough

- An identifier like `5` (a spot number) or `"T1"` (a tool number) is
  only genuinely unique **within** a specific real scope — a garage, a
  machine's magazine — not across every possible instance of that
  scope.
- Storing data keyed by that identifier in a single, shared,
  **global** structure implicitly (and wrongly) assumes it's globally
  unique — nothing about the identifier's own type or value reveals
  this mistake; it only surfaces once two genuinely different, real
  scopes happen to reuse the identical identifier.
- The fix is structural: the data has to live **on the object that
  actually defines the scope** (`Garage.spot_assignments`, one dict
  per garage instance), so the identifier only ever needs to be unique
  *within* that one real object's own data, matching what's actually
  true about it.
- This is a real, further instance of choosing the right **owner** for
  a piece of state — not because the state needs to be per-instance for
  multiplicity reasons (per `state-ownership-promotion-for-
  multiplicity.md`), but because the state's own real *meaning* is
  inherently scoped to one specific context, and storing it anywhere
  else misrepresents that.

## CS Lens

This is a real, concrete instance of correctly identifying an
identifier's own **namespace** — the same underlying idea behind
Python's own module namespaces (two different modules can each define
a function called `helper` with no collision, because each module is
its own real scope), or a database's own composite primary key
(`(garage_id, spot_number)` instead of `spot_number` alone, exactly
mirroring this file's own real fix). Recognizing that an identifier is
scoped, not global, is what determines where data keyed by it actually
belongs.

Also recognized in: a spreadsheet's own cell references (`A1` means a
completely different real cell in every different sheet — meaningful
only relative to *which* sheet, never globally); a URL path (`/users/5`
is only meaningful relative to a specific real domain/API, not a
universal identifier on its own); a phone extension (`"204"` is only
meaningful within one specific real office's own phone system).

## SE Lens

The real, practical bug this mistake causes is often silent and
delayed: everything works correctly as long as only one real scope
(one garage, one job) is ever active or tested — the collision only
shows up once a second, genuinely independent scope happens to reuse
an identifier the first one also used, which can be far later than
when the flawed data model was originally written. The real,
practical fix costs little (one extra level of nesting, or a composite
key) but requires first correctly recognizing that the identifier
was never globally unique to begin with — the harder, real judgment
call is noticing the scoping assumption at all, not implementing the
fix once it's noticed.

## Connection

A real, further instance of the general "choose the right state owner"
family alongside `state-ownership-promotion-for-multiplicity.md` — that
file's own real trigger is *multiplicity of instances*; this file's own
real trigger is an identifier's *inherent scoping*, a related but
genuinely distinct real reason to reconsider where a piece of data
belongs. A real, applied instance in this project's own history: a
job's own tool-number-to-assembly assignments, deliberately stored on
the `Job` itself rather than on the shared tool-library `Assembly`
records — a tool number like `T1` only means one specific real
assembly *within* one specific job's own tool table, and can mean a
completely different real assembly in a different job, exactly the
scoping this file's own isolated example demonstrates.

## Try It Yourself

1. Add a third garage and confirm its own spot 5 assignment coexists
   correctly with both existing ones — real proof the fix scales past
   two scopes.
2. Rewrite the fixed version using a single, global dict keyed by a
   real **tuple** (`(garage_name, spot_number)`) instead of one dict
   per `Garage` instance — confirm it produces the identical, correct
   real behavior, direct proof there's more than one real, valid way
   to express "this identifier is scoped," not just per-instance
   storage.
3. Find a real identifier in a codebase you have access to that looks
   globally unique but might actually only be unique within some real,
   narrower scope — reasoning about what would happen the moment two
   instances of that scope coexist and happen to reuse the same
   identifier.
