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

**Lessons 2–7 are the walking skeleton — a thin, real slice through
the whole stack (backend, frontend, the connection between them,
styling) built before any real feature, following it agile-style: get
something real and complete end-to-end first, then layer real features
on top of it, rather than going deep on one layer before the others
exist.** No database, no login, and no other real feature appears
anywhere in this slice, on purpose.

- 2: Standing Up `rebuild` — An Application From Nothing. The
  "implement it from scratch" half of the slice Lesson 1 already
  proved RED: the smallest real Flask app, built from nothing, until
  Lesson 1's own unmodified `/health` test passes against `rebuild`
  too.
- 3: Testing Something That Doesn't Exist Yet. `rebuild/frontend`'s
  own first real code — but test-first, the same way every backend
  lesson already has been: this series' first real frontend test
  (Vitest, Testing Library), written and proven to fail honestly,
  before any real component exists to satisfy it.
- 4: Something Real on Screen. The actual smallest real component that
  makes Lesson 3's own test pass — nothing more.
- 5: Testing the Real Connection. A real, mocked-network unit test,
  written before `App` knows how to fetch anything, proving the
  *component's own logic* is correct without needing a real, running
  backend just to run a test.
- 6: Connecting `rebuild`'s Two Real Halves. The real code that makes
  Lesson 5's test pass, plus the real, separate infrastructure — a
  dev-server proxy, the same real technique legacy's frontend already
  uses — needed to prove it against a real, running `rebuild/backend`
  too, not just against a test's own fake.
- 7: Real Styling, Scoped to `rebuild/frontend`. Tailwind, matching
  legacy's own real tool choice, with its own config so this project
  never silently inherits legacy's. The walking skeleton is complete
  after this lesson — a real backend, a real frontend, a real,
  styled connection between them, and nothing else yet.

**Lessons 8–12 are the first real feature slice — real sign-in — built
on top of the now-complete walking skeleton:**

- 8: Testing Real Sign-In. Characterizes legacy's own real
  `POST /api/auth/login` — four real cases (missing input, unknown
  email, wrong password, real success), the last two proven to return
  the identical generic error on purpose, resisting user enumeration.
- 9: A Real Database Connection. The first real infrastructure this
  slice needs — SQLAlchemy, a real config class, proven only by not
  breaking the already-working `/health` route.
- 10: A Real User Model. Matching legacy's own real fields exactly,
  with real, delegated password hashing.
- 11: The Authentication Decision, Testable On Its Own. A real,
  deliberate **Deliberately changed** design choice: the actual
  authentication decision pulled into one plain function, independently
  tested with no HTTP anywhere near it — legacy's own real, identical
  decision has never been testable this way.
- 12: The Real Login Route. The thinnest possible real adapter between
  a request and Lesson 11's own decision — where Lesson 8's own real
  test, written before any of this existed, finally passes against
  `rebuild` too.
- 13: Testing a Real Login Form. The backend half of sign-in, alone,
  repeats this series' own earlier `/health`-only mistake — a feature
  isn't a real, complete slice until its frontend half exists too. A
  real, test-first login form test: type credentials, submit, see a
  real error or real success.
- 14: The Real Login Form. The actual component, both real outcomes
  proven. Real sign-in is now a complete, full-stack vertical slice.

**Lessons 15–17 are a real, second, separate feature slice —
authorization — built on top of real sign-in:**

- 15: Testing Real Authorization. Characterizes legacy's real `401`
  (no proof of identity) vs. `403` (real, valid identity, still not
  allowed) distinction on `GET /api/auth/users`, building its own real
  test data through the already-proven login/register routes.
- 16: A Real, Reusable Authorization Check. `token_required`, a real
  decorator factory, independently tested with no HTTP anywhere near
  it — Preserving legacy's three-layer shape and 401/403 distinction,
  deliberately not Preserving its "operator bypass" special case (no
  real, current test exercises it).
- 17: Wiring Real Authorization Onto Real Routes. The real feature
  routes, protected, completing the slice.

Later lessons, roughly in order, refined as each one is actually
written rather than fixed up front:

- Fixtures, once a second acceptance test needs the same setup as the
  first.
- Coverage measurement on the new app — and what it does and doesn't
  actually prove.
- UI/UX: what's actually mechanically checkable versus what still
  needs a human looking at it.

No coverage percentage is promised up front. Growth is lesson by
lesson, on real code, or it isn't real.
