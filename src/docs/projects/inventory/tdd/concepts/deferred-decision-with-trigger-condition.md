# Concept: Deferring a Decision With an Explicit Trigger Condition

**What you'll understand by the end:** a real, more specific practice
than plain YAGNI — not just deciding *not* to build something yet, but
writing down the exact, real condition that would make building it the
right call, so the deferral reads later as a deliberate, planned
decision rather than something that looks forgotten or never
considered.

**Prerequisites:** `avoid-premature-abstraction.md`.

## Setup

None — a documentation/process practice, demonstrated with a real,
generic code comment convention below.

## The Problem

`avoid-premature-abstraction.md` already covers the real judgment call
of *not* building something before a genuine need for it exists. A
real, separate problem shows up months later, when someone (possibly
the same person who made the original call) looks at the codebase and
can't tell the difference between "this was deliberately deferred,
with real reasoning" and "nobody ever thought about this at all." A
bare decision *not* to build something carries none of the real
context that made it the right call at the time.

## The Isolated Example

A bare, unhelpful deferral:

```python
# TODO: add caching later
def fetch_report(report_id):
    return database.query(report_id)
```

A deferred decision with an explicit, real trigger condition:

```python
# DEFERRED: no caching layer here yet. Trigger to revisit: if
# fetch_report() shows up as a real bottleneck in production profiling,
# OR once a second real caller needs the same report within the same
# request (right now there is exactly one caller). Until either
# condition is real, a cache here is unearned complexity with nothing
# to validate it against.
def fetch_report(report_id):
    return database.query(report_id)
```

**What this proves:** both versions produce identical real code — the
`TODO` comment carries no real information about *why* caching isn't
here yet, or what would actually justify adding it; a reader six
months later has to independently re-derive that judgment from
scratch, with no way to tell if it was ever actually made. The second
version states the exact, real, checkable condition — a specific
profiling finding, or a second concurrent real caller — that would
turn "not yet" into "now." Whoever encounters this code later can
directly check whether that condition has actually occurred, rather
than re-litigating the whole judgment call.

## Mechanical Walkthrough

- A **bare deferral** (a plain `# TODO` or an unstated decision not to
  build something) records only *that* a choice was made, if even
  that — it loses the real reasoning entirely, the moment whoever made
  it isn't available to explain it.
- A **deferred decision with a trigger condition** records three real
  things together: what's being deferred, *why* it's not needed yet,
  and the exact, real, checkable fact that would change that
  assessment — turning a vague future judgment call into a concrete
  question anyone can answer later: "has the trigger condition
  actually happened?"
- The trigger condition has to be genuinely **checkable** — "when it
  seems important" is not a real trigger condition; "when a second
  real caller needs this" or "when profiling shows this taking more
  than 100ms" are, because each has a real, objective yes/no answer.

## CS Lens

This is a real, more specific instance of documenting a
**decision, not just an outcome** — the same underlying idea behind an
Architecture Decision Record (ADR), a real, named practice in software
engineering for capturing not just *what* was decided but *why*, and
under what real circumstances the decision should be revisited. YAGNI
answers "should we build this now" (no); this practice additionally
answers "under what real, future circumstances would the answer
change," which YAGNI alone doesn't require stating.

Also recognized in: a real code review comment explaining why a
seemingly-obvious optimization was deliberately skipped, with a
specific condition under which it should be reconsidered; a project's
own real roadmap listing deferred features each with a stated real
trigger, rather than an undifferentiated backlog with no reasoning
attached to any item.

## SE Lens

The real, practical payoff shows up specifically when someone *other*
than the original decision-maker (or the same person, much later)
encounters the deferred item: a stated trigger condition lets them
check a real, objective fact ("has this actually happened?") instead
of re-deriving an entire judgment call from incomplete context, or
worse, assuming the omission was accidental and building the thing
prematurely, un-triggered, out of an abundance of caution. The real,
small cost is writing the condition down explicitly at the moment the
decision is made — cheap when the reasoning is still fresh, much more
expensive to reconstruct later.

## Connection

Builds directly on `avoid-premature-abstraction.md`'s own YAGNI
judgment call, adding one further, real requirement: state the
condition that would flip the decision. A real, applied instance of
this project's own history: a roadmap section naming several real,
deliberately-unbuilt architectural pieces, each with its own explicit,
stated first-consumer condition — exactly this practice, demonstrated
at the scale of a whole project's future direction rather than one
function. A second, real instance from later in the same project's
history closes the loop this file's own examples only show half of: a
genuinely uncertain value (a real assembly's own "how far the tool
sticks out of the holder" figure) was shipped with an honest,
deliberately-provisional default and a real, stated condition for
revisiting it ("once independently verified against real, populated
sample data") — and, a step later, that exact real condition was
actually met, and the provisional default was replaced by a verified,
real formula. Worth citing as the full, two-part shape — the deferral
*and* its own later, real resolution — not just the deferral half most
examples stop at. A third, related real instance from the identical
project's history shows the other honest direction this same
discipline can take: not just filling in a previously-unknown value
once real evidence arrived, but *correcting* an earlier, already-shipped
assumption once real, independently-verified data proved it wrong —
the same underlying willingness to update a real decision based on
real evidence, whether that evidence resolves an open unknown or
overturns something already believed settled.

A fourth, real instance of the same corrective direction: a wait-code
matcher originally treated "no capture group in the user's own regex
pattern" as "no distinguishing value available," falling back to
pairing channels by raw occurrence position — a reasonable-looking
assumption that a real bug report disproved: a pattern covering a
whole family of codes (no capture group, matching any of several
related M-codes) still needs each *specific* code told apart from the
others, and position alone silently cross-paired two genuinely
different codes once one channel's own program was missing one of
them. The real, verified fix widened what counts as "the value" (the
whole match text stands in perfectly well when no capture group was
given) rather than inventing a new, separate mechanism — the identical
disciplined-correction shape as this file's own third instance, once
again triggered by real, reported evidence rather than a hypothetical
concern.

## Try It Yourself

1. Find a real `# TODO` comment in a codebase you have access to (or
   write one yourself for a real, current judgment call) and rewrite it
   with an explicit, checkable trigger condition — reasoning about
   whether you can actually state one, or whether that difficulty
   itself reveals the original deferral wasn't really thought through.
2. Write two deferred-decision comments for the same real function —
   one with a vague, unchecked trigger ("when it matters") and one
   with a real, specific one — and reason about which one a teammate
   six months later could actually act on.
3. Look up "Architecture Decision Record" (ADR) as a real, named
   practice and compare its real, standard format against this file's
   own three-part structure (what, why not yet, what would change it).
