# Concept: Capability-Based Modeling Instead of a Type Hierarchy

**What you'll understand by the end:** how to model real, varied
objects by *what they can do* (a set of capabilities) rather than
*what kind of thing they are* (a class hierarchy or a type flag), and
why this lets a genuinely new combination of real behaviors need no
new code at all.

**Prerequisites:** `python-classes-instances.md`,
`python-enum-and-auto.md`.

## Setup

Python 3, no packages needed.

## The Problem

Modeling several real, varied kinds of a thing — different machine
types, different user roles, different product tiers — often starts
with a type hierarchy or a type flag (`class SwissLathe(Machine)`, or
`machine.is_swiss = True`) naming each real variant explicitly. This
works cleanly right up until a genuinely new, real combination shows
up that doesn't cleanly fit any single named category — a machine with
*some* of one type's features and *some* of another's — at which point
a type-based model has to either invent an awkward new category for
every new combination, or force a real thing into a category it
doesn't quite match.

## The Isolated Example

```python
from dataclasses import dataclass, field
from enum import Enum, auto


class Capability(Enum):
    LIVE_TOOLING = auto()
    SUB_SPINDLE = auto()
    BAR_FEEDER = auto()
    PROBING = auto()


@dataclass(frozen=True)
class MachineDefinition:
    name: str
    capabilities: set[Capability] = field(default_factory=set)

    def has(self, capability):
        return capability in self.capabilities


swiss_lathe = MachineDefinition(
    "Swiss Lathe A",
    capabilities={Capability.LIVE_TOOLING, Capability.SUB_SPINDLE, Capability.BAR_FEEDER},
)
basic_mill = MachineDefinition("Basic Mill", capabilities={Capability.PROBING})

print("swiss_lathe.has(SUB_SPINDLE):", swiss_lathe.has(Capability.SUB_SPINDLE))
print("basic_mill.has(SUB_SPINDLE):", basic_mill.has(Capability.SUB_SPINDLE))


def requires_bar_feed_support(machine):
    return machine.has(Capability.BAR_FEEDER)


machines = [swiss_lathe, basic_mill]
capable = [m.name for m in machines if requires_bar_feed_support(m)]
print("machines that can run a bar-fed job:", capable)

gantry_with_probing_and_subspindle = MachineDefinition(
    "Odd Gantry Hybrid",
    capabilities={Capability.PROBING, Capability.SUB_SPINDLE},
)
print("the odd hybrid machine works with the SAME function, unmodified:",
      requires_bar_feed_support(gantry_with_probing_and_subspindle))
```

**Real output, run this session:**
```
swiss_lathe.has(SUB_SPINDLE): True
basic_mill.has(SUB_SPINDLE): False
machines that can run a bar-fed job: ['Swiss Lathe A']
the odd hybrid machine works with the SAME function, unmodified: False
```

**What this proves:** there is no `SwissLathe` class, no `is_swiss`
flag anywhere — `swiss_lathe` is just a `MachineDefinition` whose
`capabilities` set happens to include `LIVE_TOOLING`, `SUB_SPINDLE`,
and `BAR_FEEDER` together. `requires_bar_feed_support` never checks
"what kind of machine is this" — only "does it have this one specific
capability." The final, genuinely new, real combination (`"Odd Gantry
Hybrid"` — probing plus a sub-spindle, a combination that fits no
named category at all) worked correctly through the **identical**,
completely unmodified function — no new class, no new `elif`, no code
change of any kind was needed to support it.

## Mechanical Walkthrough

- `Capability` is a real, plain `Enum` — a fixed, named vocabulary of
  individual, real features a machine might or might not have.
- `MachineDefinition.capabilities: set[Capability]` holds however many
  of those real capabilities apply to one specific machine — a `set`
  because capabilities are unordered and never meaningfully duplicated
  (per `python-set-membership-testing.md`'s own reasoning).
- `.has(capability)` is the **entire** real interface anything needs to
  query a machine's behavior — real code never asks "what type is
  this," only "can it do this one specific thing."
- Adding a genuinely new, real machine — any combination of existing
  capabilities, including ones nobody anticipated together — requires
  constructing one more `MachineDefinition` with the right real set;
  it never requires touching `requires_bar_feed_support` or any other
  real function querying capabilities.

## CS Lens

This is **composition over inheritance**, applied specifically to
*data* (a set of tags) rather than to composed *objects* — instead of
representing "what kind of thing is this" through a class hierarchy
(where each new real combination might need its own new class, or
awkward multiple inheritance), real behavior is represented directly as
a flat, queryable collection of independent facts about one instance.
This is closely related to, but distinct from, the GoF **Strategy**
pattern (swapping in different *behavior* objects) — here, what varies
is real *data* describing what an object can do, queried directly,
not a swapped-in algorithm.

Also recognized in: Unix file permission bits (a file's real
capabilities — read, write, execute — are a flat set of independent
facts, not a "type" of file); role-based access control systems
(a user's real permissions are a set of granted capabilities, not a
fixed "type" of user); ECS (Entity-Component-System) architectures in
game development, where a game object's real behavior comes entirely
from which components/capabilities are attached to it, not from a
class hierarchy.

## SE Lens

The real, practical payoff, demonstrated directly above: a genuinely
new real combination of features needed **zero** code changes — just
one more, real data value. The real, honest tradeoff: capability-based
modeling can't express constraints a type system would naturally
enforce (nothing stops constructing a nonsensical real combination of
capabilities that could never physically exist together) — that
validation, if needed, has to be written explicitly, rather than being
structurally impossible the way an inheritance hierarchy might make
certain invalid combinations un-constructible by design.

## Connection

Builds on `python-classes-instances.md` and `python-enum-and-auto.md`.
Directly relevant wherever real variation is naturally described as
"which of these independent features apply," rather than "which single
named category does this belong to" — the same real judgment call
`avoid-premature-abstraction.md`'s own SE Lens describes for choosing
the right real structure for the actual, current variation a system
needs to support.

## Try It Yourself

1. Add a real function requiring **two** capabilities at once
   (`machine.has(A) and machine.has(B)`) and confirm it works
   correctly against every real machine, including the hybrid, with no
   special-casing needed.
2. Try modeling the identical real scenario with a type hierarchy
   instead (`class Machine`, `class SwissLathe(Machine)`, `class
   BasicMill(Machine)`) and attempt to represent the "Odd Gantry
   Hybrid" — reasoning concretely about what real, awkward choice
   (multiple inheritance, a new one-off class, a flag bolted onto the
   hierarchy) the type-based version forces that the capability-based
   version never needed.
3. Add a real validation function checking that a machine's
   capabilities are physically coherent (say, `SUB_SPINDLE` without
   `LIVE_TOOLING` might be a real, valid warning case) — confirming
   that this kind of real constraint genuinely does need to be written
   explicitly, since the capability model itself doesn't prevent
   constructing any combination.
