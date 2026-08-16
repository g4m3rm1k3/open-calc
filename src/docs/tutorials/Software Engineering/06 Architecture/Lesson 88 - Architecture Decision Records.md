# Lesson 88: Architecture Decision Records

**What you will build.** Lesson 57 removed `order_lifecycle.py`'s direct
dependency on `customer_activity.py`, for a real, measured reason: a
logging outage was breaking legal order transitions. Nothing about the
resulting code says why the dependency isn't there — a reader just sees
`transition_to` not logging activity, which looks like a gap. A later
engineer, cleaning up what looks like a missed feature, adds the call
back in — and the exact bug Lesson 57 fixed comes back, reproduced for
real: a logging outage breaks a legal transition again, for the second
time, because the first fix's own reasoning was never written down
anywhere the second engineer could find it. This lesson writes an
**architecture decision record** — a short, durable document naming the
context, the decision, and the consequences — so the next engineer who
wonders "why doesn't this log activity" finds the real answer instead of
rediscovering it by breaking production again.

**What you need to know first.** Dependency Direction (Lesson 57) — the
exact decision this lesson's own regression reverses, and the real bug
it recreates. Quality Attributes (Lesson 74) — that lesson's own "What
Breaks Without This" section named this identical gap directly:
"nothing about the cached function's own code signals that it used to
behave differently, or why that difference mattered."

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

Still the **Architecture** stage. Carried through: every decision this
domain has made so far — a direction, a boundary, a split, a critical
path — has lived only in the code itself and in this curriculum's own
lesson text. This lesson is the first to ask what happens once a real
engineer, without either of those, has to decide whether to keep,
change, or revert one of them.

**Terms introduced in this lesson.** One line each.

- **architecture decision record (ADR)** — a short, durable, discoverable
  document recording one architectural decision: what was decided, why,
  what alternatives were considered, and what consequences were
  accepted — written at the time the decision is made and kept alongside
  the code it applies to. It's the specific artifact that would have
  stopped this lesson's own regression — not a rule against ever
  revisiting a decision, but a guarantee that revisiting it starts from
  the real original reasoning, not from nothing.
- **decision regression** — reversing a past architectural decision,
  usually unknowingly, because the reasoning behind it was never
  recorded anywhere discoverable, recreating the exact problem the
  original decision solved. It's named because this lesson reproduces
  one directly, with real, run code, not as a hypothetical risk.

**Objects and methods used.** None new — this lesson's fix is a written
document, not a new language construct.

## Concept Unit: A Fix With No Recorded Reason Gets Undone

### The Problem

`order_lifecycle.py`, since Lesson 57, doesn't log activity directly
inside `transition_to` — the call was removed on purpose, after a real,
measured outage. A later engineer, reading the code cold, sees a gap
that looks like a missed feature and closes it:

```python
class Order:
    def transition_to(self, new_status):
        self.status = new_status
        # "cleanup": restoring what looks like a missing feature
        customer_activity.log_order_activity(
            self.customer_id, f"order {self.order_id} moved to {new_status}"
        )
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it against the identical,
still-broken `customer_activity` module from Lesson 57's own scenario:

```python
order = Order(order_id=501, customer_id=17)
try:
    order.transition_to("paid")
    print("status:", order.status)
except RuntimeError as e:
    print("RuntimeError:", e)
    print("status still:", order.status)
```

Running it produces:

```
RuntimeError: activity feed database is down
status still: paid
```

The exact bug Lesson 57 already fixed once is back — a routine
transition, legal and correct, failing because of an unrelated logging
outage. Nothing about this engineer's own change was careless; they had
no way to know the missing call was a deliberate fix, not an oversight,
because the code itself carries no trace of the original decision, only
its result.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** a new `docs/adr/0001-no-direct-customer-activity-
  dependency.md` file; `order_lifecycle.py` reverted back to Lesson 57's
  own fixed version.
- **Change type:** add — a durable record explaining the decision the
  code alone can't.
- **Location:** a dedicated `adr` directory, conventionally kept
  alongside the code it documents.
- **Dependencies:** none.

### The New Code

The smallest new piece is the record itself:

```markdown
# ADR 0001: order_lifecycle must not import customer_activity directly

## Status
Accepted

## Context
`transition_to` used to call `customer_activity.log_order_activity`
directly. A logging-service outage caused `InvalidTransition`-free,
otherwise legal order transitions to fail with `RuntimeError`, because
the activity log call ran inside the same function as the transition
itself.

## Decision
`order_lifecycle.py` will not import `customer_activity` or call it
directly. Activity logging happens through a separate mechanism
(a listener registered by `customer_activity.py` itself — see Lesson 61)
or is the responsibility of whichever code calls `transition_to`.

## Consequences
- A logging outage can no longer block a legal order transition.
- Activity logging is not guaranteed to happen at the same instant as a
  transition; a caller (or a registered listener) is responsible for it.
- Do not re-add a direct call from `transition_to` into
  `customer_activity` for any reason without reversing this decision
  explicitly, in a new ADR, not silently.
```

### The Updated Project

`order_lifecycle.py` returns to its Lesson 57 shape — no direct
dependency on `customer_activity` — and the new ADR file sits alongside
it, in the same repository, discoverable by anyone who wonders why:

```python
class Order:
    def transition_to(self, new_status):                        # ← reverted
        self.status = new_status                                   # ← reverted, no direct logging call
```

The code change here is small — reverting one accidental regression.
The real, durable change is the ADR file sitting next to it, which the
code alone was never going to carry.

### Isolating the Concept: The Record, Not the Code, Carries the Reasoning

The mechanism this lesson relies on — a written record surviving
independently of the code it explains — is inherently not something a
throwaway Python example can demonstrate through execution; its value is
in being read by a human before a decision is made, not in anything it
computes. The clearest way to see it work is the counterfactual: had the
engineer who "cleaned up" `transition_to` checked `docs/adr/` first and
found ADR 0001, the regression demonstrated in this lesson's own Problem
section would never have been written in the first place — the outage
that already happened once would not have needed to happen a second
time to be rediscovered.

### Mechanical Walkthrough

Working through the structure of the ADR itself, in order:

- **`## Status`** — whether this decision is still active
  (`Accepted`), has been replaced by a later decision
  (`Superseded by ADR-000N`), or was considered and rejected
  (`Rejected`) — a single word that tells a reader, immediately, whether
  the decision below is still the current one.
- **`## Context`** — the real, specific situation that made a decision
  necessary — here, the actual outage, described concretely enough that
  a reader unfamiliar with the incident understands what problem existed
  before this decision was made.
- **`## Decision`** — the actual rule, stated plainly and specifically
  enough to be checked against a proposed code change — "do not import
  X from Y" is checkable; "be careful with dependencies" is not.
- **`## Consequences`** — both the benefit and the real cost accepted on
  purpose, including an explicit instruction for what to do if someone
  wants to revisit it — not "never change this," but "change it
  deliberately, in a new record, not silently."

### CS Lens

An ADR is a form of **provenance**: a record of not just what a system
currently does, but why it came to do it that way, and what was true
when the decision was made. This is the identical concept behind a
database migration's own comment explaining why a column was added, a
compiler's optimization pass logging why it did or didn't apply a
transformation, and scientific research's own requirement to record
methodology, not just results — in every case, the *current state*
alone is insufficient for anyone downstream to reason correctly about
whether it's safe to change.

Also recognized in: RFC (Request for Comments) documents in large
open-source projects, recording why a language or protocol feature was
designed the way it was, git commit messages that explain *why* a change
was made rather than only *what* changed (a convention every "Definition
of Done" checklist in this curriculum has required since Lesson 45), and
legal case law, where a ruling's own written reasoning, not just its
outcome, is what future courts are bound by.

### SE Lens

The principle is **write down the reasoning at the moment it's freshest,
not the outcome you expect a reader to reverse-engineer from the code
alone** — the alternative that produced this lesson's regression, no
ADR at all, relies entirely on either the original engineer still being
reachable to ask, or a git blame leading to a commit message detailed
enough to reconstruct the reasoning, neither of which is reliable months
or years later, across a growing team. The real cost of writing ADRs:
they take real time to write well, and only pay off for decisions
significant enough that reversing them by accident would be genuinely
costly — this lesson's own outage is exactly that bar; a routine
variable rename is not, and writing an ADR for every small decision
would bury the ones that actually matter under noise nobody reads.

### Commands Needed

No commands are needed to run this lesson's own artifact — an ADR is a
markdown file, read by humans, not executed. Reverting
`order_lifecycle.py` and rerunning Lesson 57's own scenario is
`python <filename>.py`, unchanged from every earlier lesson.

### Run It

Running the reverted `transition_to`, confirming the original fix is
back in place:

```python
order = Order(order_id=501, customer_id=17)
order.transition_to("paid")
print("status:", order.status)
```

The real output:

```
status: paid
```

The transition succeeds cleanly again, with no dependency on
`customer_activity` at all — the identical guarantee Lesson 57 already
established, now protected going forward by a record explaining exactly
why, so the next engineer who wonders about the missing log call finds
the real answer instead of writing this lesson's own regression a second
time.

### Connecting Back

Where every earlier lesson in this domain made one real architectural
decision, this lesson is the first to protect all of them — a decision
that isn't written down somewhere durable is, for all practical
purposes, invisible to whoever encounters its result without the
context that produced it.

## Connect the Pieces

`order.transition_to("paid")` was run three times across this lesson's
own story. First, in Lesson 57's original fix: succeeded cleanly, no
dependency on a failing logging service. Second, after an undocumented
"cleanup" silently reversed that fix: failed with the identical
`RuntimeError` the original fix was built to prevent — a real
regression, reproduced, not assumed. Third, after reverting the
regression and writing ADR 0001 to explain why: succeeded cleanly again,
this time with a durable record making sure the second failure doesn't
need to happen a third time to be understood.

## What Breaks Without This

Writing one ADR protects one decision. It does nothing for every
earlier decision in this domain that was never written down at all:

```
Decisions made in this domain with no ADR yet:
- Lesson 60: order_lifecycle must not depend on promo_experiment
- Lesson 72: arch_inventory must not depend on arch_order
- Lesson 82: notifications and loyalty are not on the checkout critical path
```

Every one of these is exactly as vulnerable to a well-meaning,
undocumented reversal as the customer-activity dependency was before
this lesson. Writing a single ADR doesn't retroactively protect a
system's entire decision history — that requires a real, ongoing
practice of writing one at the moment each significant decision is
actually made, not a one-time catch-up exercise covering only the
decision that happened to cause the most recent incident.

## Exercises

1. Write ADR 0002, documenting Lesson 60's own decision (`order_
   lifecycle` must not depend on `promo_experiment`), using the identical
   four-section format this lesson established.
2. Find one decision in this curriculum's own running example that was
   made but never framed as a formal decision with alternatives — pick
   one, and write the `## Context` and `## Decision` sections as if you
   were the engineer who made the call at the time.
3. ADR 0001 says "do not re-add this dependency... without reversing
   this decision explicitly, in a new ADR." Write ADR 0002 as a
   hypothetical *supersession* — a scenario where a future team
   deliberately decides the dependency should come back (say, activity
   logging becomes a hard business requirement) — showing how a
   superseding ADR should reference the one it replaces.

## Definition of Done

- [ ] `docs/adr/0001-no-direct-customer-activity-dependency.md` exists,
      with all four sections: Status, Context, Decision, Consequences.
- [ ] `order_lifecycle.py`'s `transition_to` has been reverted back to
      not calling `customer_activity` directly.
- [ ] The Problem section's regression has been reproduced for real,
      with the direct call re-added, before reverting it.
- [ ] The "Run It" scenario above runs against your own reverted file
      and produces output matching what's pasted here.
- [ ] Commit, with a message stating *why*: something like `docs: add
      ADR 0001 recording why order_lifecycle must not depend on
      customer_activity, after a second engineer reintroduced the
      original bug`, not `add documentation`.

Up next: Lesson 89, Architecture Tradeoffs — weighing several competing
architectural decisions against each other at once, using the real,
measured costs this domain has built up across every lesson so far.
