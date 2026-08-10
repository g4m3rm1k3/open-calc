# Concept: Grounding a Design Decision in Real External Prior Art

**What you'll understand by the end:** a real, distinct research
practice — checking how established, real, already-shipped tools
actually solve a problem before speccing or building your own version
of it — and why this catches real mistakes that pure internal
reasoning about the problem cannot.

**Prerequisites:** `deferred-decision-with-trigger-condition.md`.

## Setup

None — a documentation/process practice, demonstrated with a real,
generic example below.

## The Problem

Designing a new, non-trivial feature purely from first principles —
reasoning out what fields it should have, what the interaction should
feel like, entirely from the requester's own head — risks re-deriving,
badly, a problem that real, shipping tools already solved, often after
their own real, hard-won mistakes. A confident-sounding internal design
can still be wrong in ways that only surface once real users actually
try to use it — ways an existing, mature tool's own interface already
had to confront and resolve.

## The Isolated Example

A design note written from pure internal reasoning:

```
DESIGN NOTE: keyboard shortcuts for the recipe timer

Add Space to start/pause the timer, and Enter to reset it. Simple,
done.
```

The same design note, revised after checking real prior art:

```
DESIGN NOTE: keyboard shortcuts for the recipe timer

Checked how three real, established kitchen-timer apps (Timer+,
KitchenClock, KG Cook) handle this before finalizing:
- All three use Space for start/pause -- confirms that choice.
- NONE use Enter for reset -- two use a long-press/hold on Space
  instead (guards against an accidental reset mid-cook), and one uses
  a separate dedicated key entirely. Enter alone, with no confirmation,
  is a real, easy accidental-reset trap none of the three real tools
  actually ship.
- Adopting hold-to-reset instead, matching the two-out-of-three real
  precedent.
```

**What this proves:** the first version's design was internally
coherent — it reads as reasonable on its own — but real prior art
revealed a genuine, specific problem (accidental resets) that pure
internal reasoning about "what shortcuts make sense" never surfaced,
because that failure mode only becomes obvious once a design is
checked against tools that already had to face real users hitting it
by mistake.

## Mechanical Walkthrough

- **Pure internal design** reasons from the problem statement alone —
  it can be entirely self-consistent and still miss a failure mode that
  only shows up in real, sustained use, because nothing forced it to
  confront that use.
- **Grounding in prior art** means actually looking at how real,
  already-shipped tools solve the identical or a closely related
  problem — not copying blindly, but treating their real, accumulated
  design decisions as evidence about what actually works (and, just as
  usefully, what a majority of them deliberately *avoided*).
- The practice is specifically about *checking directly*, not assuming
  — "I recall competitor tools generally do X" is a guess; "I confirmed
  against their actual, current documentation/behavior that they do X"
  is grounding.
- Prior art doesn't have to be copied wholesale — the example above
  ends up *not* simply adopting the majority pattern verbatim (long-
  press), it adapts it, informed by having actually checked what the
  real alternatives were and why they likely exist.

## CS Lens

This is a real, applied instance of **not reinventing a solved
problem** — treating existing, real, battle-tested implementations as a
genuine source of evidence, the same underlying instinct behind
consulting an existing algorithm or data structure before designing a
novel one from scratch (why invent a new hashing scheme when the
literature already has one with known, proven properties). It's also
adjacent to design pattern catalogs themselves (GoF, etc.) — a written
record of prior art specifically so future designers don't have to
independently rediscover the same shape from first principles.

Also recognized in: a UX designer reviewing several real, shipped
competitor products before wireframing a new feature; an API designer
checking how a handful of already-popular, real libraries name and
shape a similar operation before choosing their own function's
signature; a standards committee explicitly surveying existing, real
implementations before finalizing a new specification.

## SE Lens

The real, practical payoff: catching a design mistake *before* writing
any code, at the cheapest possible point to fix it, using evidence
(what real tools that have already faced real users actually do)
that's far stronger than internal speculation alone. The real cost:
time spent researching rather than immediately building, and a genuine
risk of over-indexing on prior art that may not actually fit the
current problem's own real constraints — grounding a decision in real
precedent is evidence to weigh, not a rule to follow blindly regardless
of whether the current situation is genuinely analogous.

## Connection

Builds on `deferred-decision-with-trigger-condition.md` — both are
real, disciplined ways of writing down *why* a design decision was
made, not just what was decided. A real, applied instance in this
project's own history: recording several future roadmap items
explicitly grounded in a specific, real, already-shipped tool's own
documented multichannel-editing behavior, confirmed directly against
that tool's actual documentation rather than assumed from memory,
*before* speccing any of those items further.

A second, real, applied instance: a "Remove Spaces" text-cleanup
feature whose own module docstring states directly it matches a
specific, real, already-shipped CAM tool's own identically-named
feature, and explains the *why* behind it — a program pulled straight
from a machine control genuinely has none of the spaces a human adds
while editing by hand, so that mismatch is pure real noise in a
side-by-side comparison until it's squeezed back out. Grounded the
same disciplined way as the first instance: naming the specific real
tool being matched and the specific real problem it solves, not just
"strip whitespace" as an unmotivated, internally-reasoned feature.

A third, real instance — this one an honest **negative** result, not a
match to adopt: a Gantt-style timeline view was designed against a
real, specific reference screenshot (a CAM tool's own Operations
Manager, showing named machining operations per timeline block).
Checked directly against what raw G-code text actually contains, the
real answer was that a "named operation" is that reference tool's own
internal model, not anything genuinely recoverable from the file being
visualized — so the design was honestly revised to group by the
coarsest boundary the text *does* actually carry (a sync point)
instead of faking named-operation labels the underlying data can't
really support. The identical disciplined checking this file's own
practice requires — confirm directly, don't assume — here produced "no,
don't copy that part" rather than "yes, adopt this," an equally real
and equally valuable outcome of the same real research step.

A fourth, real instance, back on the "yes, adopt this" side: the same
reference tool's own Operations Manager screenshot also draws a
connector line between two synchronized operations across its own two
timeline lanes — directly matched, this time, by a real, drawn
connector line between two matched wait-code pairs across two
side-by-side editors, once the underlying data (a real pairing) was
already confirmed genuinely available (unlike the third instance's own
named-operation label, which wasn't).

## Try It Yourself

1. Pick a real feature you've designed (or want to design) purely from
   your own reasoning, then actually go check two or three real,
   established tools that solve a similar problem. Write down one thing
   they agree on (evidence your instinct was right) and one thing at
   least one of them does differently than you expected (a real
   candidate for revising your own design).
2. Reason about the difference between "I'm pretty sure competitor
   tools do X" and "I confirmed, right now, against their actual
   current documentation or behavior, that they do X" — write one
   sentence on why this project's own real note explicitly uses the
   second, stronger phrasing.
3. Identify a case where blindly copying real prior art would actually
   be the *wrong* call — a situation where an established tool's design
   choice was shaped by constraints your own project genuinely doesn't
   share — to reinforce that grounding a decision in prior art means
   weighing evidence, not following it unconditionally.
