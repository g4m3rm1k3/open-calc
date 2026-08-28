# Testing a Real App

This series does not test `open-calc`. It targets a separate, real
application — `manufacturing-platform`, a Flask + React
manufacturing-tracking app living in its own sibling repository —
starting from zero prior testing knowledge.

**A lesson may introduce a concept before the application needs it, but
implementation work is always driven by a real, already-existing
behavior in `manufacturing-platform` — never an arbitrary tutorial
exercise invented to demonstrate a concept.** No toy implementations:
real legacy behavior → real test, characterized against legacy → lesson
→ real new implementation → the same real test, passing against the new
app → next behavior.

**The method, as of Lesson 1, is a test-driven strangler rewrite, not
just adding tests.** `manufacturing-platform/backend` and `src/` (the
**legacy app**) are the real, already-running application — the
*behavioral oracle*, not the design to copy. `manufacturing-platform/rebuild`
(the **new app**) is a real, currently-empty rebuild target. The
behavioral contract carried by each acceptance test is the actual
invariant here, not the technology stack — Flask/React is `rebuild`'s
chosen implementation because it's already the right stack for this
app, not a rule the curriculum imposes on every feature. A shared
`acceptance-tests/` folder, sibling to both, holds tests that belong to
neither implementation — each one checks a real HTTP request/response
contract, characterized against legacy first, then used to drive
building the identical real behavior in `rebuild`, on purpose
implemented however is actually good, not copied from legacy's own
internals. Every real behavior carries one of three honest labels:
**Preserve** (legacy's real behavior, reproduced as-is — the default,
needing no extra ceremony), **Correct** (an established legacy bug, not
merely a disliked implementation choice, fixed in the new app on
purpose), or **Deliberately changed** (a real, stated design decision to
do it differently). The label only has to be made explicit, decided per
feature and never assumed, when the new app's real behavior actually
diverges from legacy's — that's where silently drifting into an
unstated design decision is the real risk.

**Runtime:** whatever `manufacturing-platform` itself already uses —
Python 3.13 / `pytest` for both backends; a frontend test runner once
the series reaches `src/`. Every lesson's own "Objects and methods
used" section states exactly which real file, in that separate
repository, its code lives in — never this repo.

**Why this exists.** `manufacturing-platform`'s own frontend went
through a real, weeks-long refactor declared "100% complete" on the
strength of a successful build alone — its own Testing Checklist was
never actually checked. Two weeks later, new feature work on top of
that "complete" refactor was already prompting a proposal to abandon
the stack entirely. Three separate rebuild attempts followed, none of
them anchored by a single real test, all three now archived or stalled.
This series is a fourth, structurally different attempt: nothing in the
new app counts as done until a real test — proven, first, against the
real legacy app — passes against it too.

Each lesson's own real, executed verification — the exact commands run
and their real captured output — lives in a `lesson-N-verification/`
folder next to that lesson, not reconstructed from memory.

## Table of Contents

- 0: The Assertion — Checking a Claim Instead of Trusting It. The
  mechanical idea every test is built on; this project's first-ever
  real test, against the legacy app's already-existing `Part.to_dict()`
  — deliberately coupled to today's internal implementation, not an
  external contract, and kept exactly as-is rather than retrofitted to
  the method below.
- 1: Pointing One Test at Two Real Apps. Small, infrastructure-only:
  `acceptance-tests/`, one test, capable of running against either real
  backend by name, proven against legacy and proven to fail honestly
  against the still-empty `rebuild` — the shift from a test coupled to
  implementation to one coupled to a contract, which is what makes it
  reusable against a second, independently-built app at all.

Later lessons, roughly in order, refined as each one is actually
written rather than fixed up front:

- 2: real sign-in (`POST /api/auth/login`) — the first real feature.
  Characterize legacy's three real cases (400/401/200), then build the
  smallest possible real Flask app in `rebuild/backend` and the same
  route inside it, until the identical test passes there too.
- Fixtures, once a second acceptance test needs the same setup as the
  first.
- Authorization — a real protected route, roles, and what a 403 versus
  a 401 actually means.
- The new app's own React frontend, once its backend has real,
  passing coverage to build against.
- Coverage measurement on the new app — and what it does and doesn't
  actually prove.
- UI/UX: what's actually mechanically checkable versus what still
  needs a human looking at it.

No coverage percentage is promised up front. Growth is lesson by
lesson, on real code, or it isn't real.
