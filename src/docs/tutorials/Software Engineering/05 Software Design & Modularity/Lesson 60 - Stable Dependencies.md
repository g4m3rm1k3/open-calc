# Lesson 60: Stable Dependencies

**What you will build.** `order_lifecycle.py` has two known consumers in
this domain's own running example, `checkout.py` and `reporting.py` —
two other modules that depend on it being correct. It gains a new
import, `promo_experiment`, a rapidly-changing module nothing else
depends on yet. The experiment gets torn down, `promo_experiment.py`
starts failing to import, and both of `order_lifecycle`'s own consumers
break too — not because either one touches promotions, but because the
module *they* depend on now transitively depends on the one thing that
just broke. This lesson names, and computes, exactly why that's
backwards: `order_lifecycle` has two dependents and, once the bad import
is removed, zero dependencies of its own — it's this domain's most
*stable* module by a real, calculable measure, and a dependency pointing
from it toward something unstable puts every one of its own dependents
at risk of a change none of them asked for.

**What you need to know first.** Dependency Direction (Lesson 57) — the
specific fix this lesson generalizes into a measurable rule; Lesson 57
argued by instinct that logging shouldn't live inside `transition_to`,
this lesson gives that instinct a number. Coupling (Lesson 58) — fan-in
and fan-out, below, are really just a count of how many other modules
each direction of coupling touches.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Design** stage. Carried through: Lesson 57 fixed one
dependency's direction by reasoning about it directly; this lesson
builds the general, computable version of that reasoning, the same
version the *Architecture* stage further down this pipeline will need
once a system has too many modules to reason about by instinct alone.

**Terms introduced in this lesson.** One line each.

- **fan-in** — the number of other modules that depend on a given
  module. It names half of what stability actually measures: a module
  many other things rely on being correct is expensive, in practice, to
  change, whether or not anyone has written that cost down anywhere.
- **fan-out** — the number of other modules a given module itself
  depends on. It names the other half: a module that depends on many
  things is exposed to every one of their failures and every one of
  their future changes.
- **instability** — a module's fan-out divided by its total connections,
  fan-out plus fan-in — a number between `0` (maximally stable: nothing
  but dependents, no dependencies of its own) and `1` (maximally
  unstable: nothing depends on it, and it depends on everything it
  touches). It's worth naming because it turns "which modules are risky
  to depend on" from a feeling into something that can actually be
  computed and compared between two real modules.
- **Stable Dependencies Principle** — the rule that a dependency should
  always point from a less stable, higher-instability module toward a
  more stable, lower-instability one, never the reverse. It's the
  generalized, measurable version of the specific fix Lesson 57 already
  made once, by instinct rather than by a named, computable rule.

**Objects and methods used.** None new — this lesson's fix reuses the
identical dependency-removal technique from Lesson 57; what's new is the
measurement, not the mechanism.

## Concept Unit: A Stable Module Should Not Depend on an Unstable One

### The Problem

`order_lifecycle.py` picks up a new import, `promo_experiment`, a
frequently-changing module that hasn't earned any dependents of its own
yet:

```python
from enum import Enum
import promo_experiment


class OrderStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Two other modules, `checkout.py` and
`reporting.py`, both depend on `order_lifecycle` the ordinary way,
importing it to call `can_transition`. When `promo_experiment.py` gets
torn down — its own A/B test framework retired, the file left raising
an error on import:

```python
consumers = ["checkout", "reporting"]
broken = []
for name in consumers:
    try:
        __import__(name)
    except ImportError as e:
        broken.append(name)
        print(f"{name} failed to import:", e)

print()
print(f"{len(broken)} of {len(consumers)} order_lifecycle consumers broke from an unrelated promo experiment teardown")
```

Running it produces:

```
checkout failed to import: promo_experiment: this week's A/B test framework was torn down
reporting failed to import: promo_experiment: this week's A/B test framework was torn down

2 of 2 order_lifecycle consumers broke from an unrelated promo experiment teardown
```

Neither `checkout` nor `reporting` mentions promotions anywhere in its
own code. Both broke anyway, because both depend on `order_lifecycle`,
and `order_lifecycle` now transitively depends on `promo_experiment`.
This is the identical shape of failure Lesson 57 already demonstrated
once — but this time, it's happening to a module with *two* real
dependents instead of zero, which is exactly what makes it worse: the
blast radius of a bad dependency scales with how many things trust the
module carrying it.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `order_lifecycle` module, not a port of an
  external reference codebase.
- **Files affected:** `order_lifecycle.py`, modified to remove the
  `promo_experiment` import.
- **Change type:** remove.
- **Location:** `order_lifecycle.py`'s own top-level imports.
- **Dependencies:** none — this fix removes a dependency.

### The New Code

The smallest new piece is the instability calculation itself, applied to
both modules for real:

```python
def instability(fan_in, fan_out):
    return fan_out / (fan_in + fan_out)
```

### The Updated Project

Computing both modules' real numbers, using the counts from this
lesson's own scenario — `order_lifecycle` has two known dependents,
`checkout` and `reporting`, and, with the bad import still in place, one
dependency of its own; `promo_experiment` has no dependents yet and
three dependencies of its own (a pricing engine, a discount-rules
service, and its A/B test framework):

```python
order_lifecycle_instability = instability(fan_in=2, fan_out=1)         # ← new
promo_experiment_instability = instability(fan_in=0, fan_out=3)         # ← new

print("order_lifecycle instability:", round(order_lifecycle_instability, 2))  # ← new
print("promo_experiment instability:", round(promo_experiment_instability, 2))  # ← new
```

`order_lifecycle`, with two dependents already relying on it and only
one dependency of its own, is already far toward the stable end of the
scale before this lesson even removes anything — which is exactly why
the direction its one dependency points matters so much.

### Isolating the Concept: Two Real Numbers, One Comparison

The mechanism doing the real work above — computing instability from
real fan-in and fan-out counts, then comparing the two modules on either
end of the bad dependency — is shown directly through the real project
numbers above rather than a separate, unrelated example, since the
calculation itself is the entire new concept and is already as small as
it can be. Running it:

```
order_lifecycle instability: 0.33
promo_experiment instability: 1.0
```

`order_lifecycle`'s `0.33` sits closer to the stable end — most of its
connections are dependents, not dependencies. `promo_experiment`'s `1.0`
is the maximum possible instability — every one of its connections is a
dependency, none are dependents, exactly what "an experiment nothing
else relies on yet, that itself relies on several other systems" should
look like numerically. The Stable Dependencies Principle says a
dependency should point from the higher number toward the lower one —
`promo_experiment` (`1.0`) depending on something more stable would be
fine; `order_lifecycle` (`0.33`) depending on `promo_experiment` (`1.0`)
points exactly backwards.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def instability(fan_in, fan_out):`** — a function definition taking
  two parameters, the raw counts this lesson's terms already named.
- **`return fan_out / (fan_in + fan_out)`** — ordinary division: the
  number of things this module depends on, divided by the total number
  of connections it has in either direction. When `fan_out` is `0` — a
  module with no dependencies of its own — the result is always `0.0`,
  regardless of how large `fan_in` is, because a module that depends on
  nothing is, by this measure, as stable as a module can be.

### CS Lens

This is Robert Martin's **Stable Dependencies Principle**, one half of a
pair of measurable metrics — instability alongside a second one,
abstractness, this domain doesn't need yet — built specifically to make
architectural judgment computable rather than purely a matter of
experience. The same underlying idea recurs anywhere a system's own
structure is analyzed as a graph: a package dependency graph where a
widely-used base library should never depend on an application built on
top of it, a build system computing which targets are safe to change
without triggering a full rebuild of everything, and a service mesh
computing blast radius before approving a risky deployment.

Also recognized in: the standard library of any programming language,
which has enormous fan-in and essentially zero fan-out onto anything a
specific application defines, and any plugin architecture where the core
system must have zero dependency on any individual plugin, however
popular that plugin becomes.

### SE Lens

The principle is **let the number, not the instinct, decide which
direction is safe** — Lesson 57 fixed one specific case of this by
reasoning about it directly, which works for a codebase small enough to
reason about by eye. `order_lifecycle` having two dependents is small
enough to still eyeball; a real system's foundational module might have
dozens or hundreds, at which point "does this look risky" stops being a
reliable judgment and a computed instability score becomes the only
practical way to catch a bad dependency before it ships. The real cost
of taking this seriously: it requires actually tracking fan-in and
fan-out as real, current facts about a codebase — information most
projects don't maintain automatically unless real tooling is built or
adopted to compute it, which is genuine, ongoing infrastructure work,
not a one-time fix.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Removing the bad import and rerunning the identical consumer check:

```python
consumers = ["checkout", "reporting"]
broken = []
for name in consumers:
    try:
        __import__(name)
        print(name, "imported fine")
    except ImportError as e:
        broken.append(name)
        print(name, "failed to import:", e)

print()
print(len(broken), "of", len(consumers), "order_lifecycle consumers broke while promo_experiment is still down")
```

The real output:

```
checkout imported fine
reporting imported fine

0 of 2 order_lifecycle consumers broke while promo_experiment is still down
```

`promo_experiment.py` is still exactly as broken as it was in the
Problem section — nothing about the experiment itself got fixed. Both of
`order_lifecycle`'s real dependents now survive that outage completely,
because `order_lifecycle`'s own fan-out dropped to zero: with nothing
left for it to depend on, its instability score is `0.0`, and there's
no longer any path for an unstable module's problems to reach it, or
anything that depends on it, at all.

### Connecting Back

Where Lesson 57 fixed one dependency's direction by reasoning about the
specific case, this lesson gives that same judgment a number — turning
"this direction feels backwards" into "this module's instability score
is higher than what depends on it," a distinction that stops being
optional once a codebase is too large to reason about by feel alone.

## Connect the Pieces

`checkout` and `reporting`'s ability to import `order_lifecycle` was
tested twice against the identical `promo_experiment` outage. First,
with `order_lifecycle` (instability `0.33`) depending on
`promo_experiment` (instability `1.0`): both of `order_lifecycle`'s two
real dependents broke, a direct, countable consequence of a stable
module depending on an unstable one. Second, with that one dependency
removed, `order_lifecycle`'s own instability at `0.0`: both dependents
survived the identical outage untouched, because there was no longer any
path from the broken experiment to either of them.

## What Breaks Without This

Computing instability once tells you the shape of a system at the
moment you measured it. It says nothing about the *next* import someone
adds:

```python
order_lifecycle_instability_before = instability(fan_in=2, fan_out=0)
order_lifecycle_instability_after_new_import = instability(fan_in=2, fan_out=1)

print("before:", round(order_lifecycle_instability_before, 2))
print("after one new unstable import:", round(order_lifecycle_instability_after_new_import, 2))
```

Run for real, this is what comes back:

```
before: 0.0
after one new unstable import: 0.33
```

The score moved the moment a single new dependency was added — nothing
computed this lesson's own metric automatically as that import was
written; a human had to decide to check. The Stable Dependencies
Principle names the rule correctly, and this lesson's own fix proves the
rule matters in practice — but nothing about naming a rule enforces it
automatically the next time someone reaches for a convenient import in a
hurry. That enforcement is exactly what real dependency-analysis tooling
exists to automate, which this lesson's own hand-computed numbers were
only ever a small, illustrative stand-in for.

## Exercises

1. Compute `customer_activity`'s own instability, using this domain's
   running example so far (after Lesson 59's split, it has zero
   dependencies of its own, and one known dependent — the checkout flow
   that calls `log_order_activity`). Where does it fall relative to
   `order_lifecycle`?
2. `inventory.py`, from Lesson 59, depends on `inventory_db` and has no
   dependents yet. Compute its instability, and decide, using the Stable
   Dependencies Principle, whether it would be safe for `order_lifecycle`
   to depend on it directly.
3. Instability alone doesn't say whether a module *should* be stable —
   only how stable it currently is. Name one module from this domain's
   own running example that has low fan-in today but that you'd argue
   *should* eventually be depended on by many other things. What would
   have to be true about it first?

## Definition of Done

- [ ] `order_lifecycle.py` has no `import promo_experiment` line
      anywhere in it.
- [ ] The Problem section's cascading breakage has been reproduced for
      real, against the *original*, promo-dependent version, before you
      apply the fix.
- [ ] You can compute, by hand, the instability score for at least two
      real modules in this domain's own running example.
- [ ] The "Run It" scenario above runs against your own fixed files and
      produces output matching what's pasted here.
- [ ] Commit, with a message stating *why*: something like `stable
      dependencies: remove order_lifecycle's dependency on
      promo_experiment so its two dependents survive experiment
      teardowns`, not `remove import`.

Up next: Lesson 61, Dependency Inversion — the technique that lets a
stable module react to something unstable without ever depending on it
directly, closing the gap this lesson's fix could only ever remove one
import at a time.
