# Software Engineering Curriculum — Build Handoff

Read this first, every new session, before writing anything. It exists so
a new chat can resume this build cold, mid-curriculum, without re-deriving
decisions already made or re-reading everything from scratch.

## What this is

Building all ~280 lessons of `Software Engineering.brd.md`, one lesson per
file, each one fully compliant with `../reference/LESSON SCHEMA.md`. Source
of truth for lesson list, numbering, and domain boundaries: the BRD itself
(section 8 onward — each domain lists its own lesson titles and numbers).
Source of truth for lesson *format*: the schema. Nothing else is in scope —
per explicit user instruction, this build does not read or reference other
curricula/folders in this repo (Graphics, etc.) for style or content.

**Working style:** continuous building within a session — no mid-session
checkpoints, no "here's what's done, what's next?" pauses, no asking
permission between lessons. Build lesson after lesson until the session's
usage/context runs out, then update this file's Progress table and stop.
A new chat starts the next session; that new chat should read this file
first, then pick up at the first "not started" row.

## Conventions established in Lesson 1 (still in force)

- **Folder** = domain name, prefixed with its 2-digit domain number,
  exactly as the BRD titles it (e.g. `01 Software Engineering
  Foundations`, `03 Specification & Contracts` — keep the BRD's own `&`
  where it uses one).
- **File name** = `Lesson NN - <Title>.md`, where `NN` is the lesson's
  **global** number from the BRD (1–280, continuous across domains, not
  reset per-domain) and `<Title>` is the BRD's own lesson title verbatim.
  The `# Lesson N: <Title>` header line inside each file uses the same
  global number.
- **Language**: all code is **Python** (BRD explicitly delegates
  programming-fundamentals teaching to a different curriculum; Python's
  syntax stays quiet enough to keep the engineering idea, not the
  language, as the visible thing). **Basic Python syntax is assumed
  prior knowledge and never lab'd** — function defs, conditionals,
  built-ins, dict/set literals, classes/`self`, etc. Only genuinely new
  *engineering* ideas (a pattern, a principle, a technique — e.g.
  decorators in L31, when they were the vehicle for Design by Contract)
  get full Concept Unit / throwaway-lab treatment.
- **Lesson-number citations**: never inside a Concept Unit's own prose —
  forward references stay generic ("a later part of this curriculum
  covers this"). The only places a lesson number belongs: the header's
  "What you need to know first" list, and this file.
- **Every code example is actually run via Bash**, output pasted
  verbatim. Never fabricated.

## The two checks to run on every lesson before calling it done

**1. Fence-pair audit (mechanical, catches formatting).** No two fenced
code blocks may ever sit back-to-back with nothing but a blank line
between them — the schema's hard rule, violated by default right before
a "Running it:"-style output block unless caught. Run this after writing
each lesson:

```bash
awk -v fname="L<N>" '
  /^```/ {
    if (prev_close && !had_prose) { print fname ":" NR ": VIOLATION" }
    in_block = !in_block
    if (!in_block) { prev_close=1; had_prose=0 } else { prev_close=0 }
    next
  }
  { if (prev_close && !in_block && $0 !~ /^[[:space:]]*$/) had_prose=1 }
' "path/to/Lesson NN - Title.md"
```

No output = clean. A `VIOLATION` line names the line number of the
offending fence open — fix by inserting one prose sentence ("Running
it:" / "Here's what actually happens:") between the two fences. This
script is sanity-checked (verified against a deliberately-broken test
file) and has caught 2–3 real violations in nearly every lesson so far,
always in the same spot: a code block immediately followed by its own
output block.

**2. Full read-through (human, catches honesty).** The awk script only
checks *spacing* — it cannot tell whether the content inside a block is
real. **Real incident:** Lesson 42's first draft left a fabricated
"wrong" output block in place, followed by "Wait — check that again"
prose correcting it, instead of just writing the real output once. This
survived because it wasn't a spacing violation. After writing each
lesson, read it start to finish once, specifically watching for leftover
draft artifacts, self-corrections left in the prose, or any output block
that isn't the actual last real Bash run. Caught and fixed once already;
watch for it every time.

A full-repo run of both checks (all 44 lessons, done at the end of this
session) came back completely clean: 0 fence violations, all required
header/closing sections present in every lesson (one correct intentional
exception: L27, a domain-closing synthesis lesson, says "Terms restated"
instead of "introduced" per the Repetition Rule — that's right, not a
gap), every Concept Unit has both CS Lens and SE Lens, no leftover
self-correction language anywhere. Worth re-running both checks
periodically in future sessions, especially after any batch of lessons.

## The shared `src/docs/concepts/` catalog

A large (~300+ file), pre-existing, project-independent catalog from a
different, unrelated build. Per the schema, check `concepts/GLOSSARY.md`
before writing a from-scratch explanation of anything generic enough to
plausibly recur elsewhere (a design pattern, a named CS/SE technique) —
if a 100%-match file exists, reference it by name and build only the
project-specific application yourself; don't re-derive the general
concept. Used successfully three times so far:

- `caching-and-memoization.md` — referenced in L11 (Engineering
  Tradeoffs), which then built its own `is_username_available` caching
  example on top rather than repeating the file's `slow_square` one.
- `finite-state-machine-guarded-transitions.md` — referenced in L33
  (State Machines); built a fresh `ResetToken` replay-attack example
  instead of repeating its `Order` example.
- `exception-vs-return-value-invalid-input-signaling.md` — referenced in
  L35 (Error Contracts) for the signaling-mechanism half; did not run its
  PySide6-dependent example, just pointed to it.
- `many-to-many-modeled-as-one-to-one.md` — referenced in L44
  (Relationships); built a fresh products/categories example instead of
  repeating its recipe/kitchen one.

Keep checking `GLOSSARY.md` going forward — Domain 5 (Design &
Modularity) especially is likely to hit more matches (the catalog already
has `dependency-inversion-principle.md`, `guard-clause-early-return.md`,
`avoid-premature-abstraction.md`, `move-method-refactoring.md`,
`adapter-pattern.md`, `delegation-pattern.md`, `dependency-injection.md`,
and other design-pattern files that look like direct hits for upcoming
lessons).

## Notable curriculum-wide decisions

- **No dedicated Security domain** — security/crypto is explicitly a
  sibling curriculum per the BRD (§3, §30), not part of this one. L18
  (Constraints, password hashing) flagged this honestly rather than
  promising future depth this curriculum doesn't own — keep doing that
  whenever a lesson brushes against security territory.
- **First new-construct lab, L31**: decorators, introduced via a
  throwaway `announce`/`double` lab before being used for a real
  `@contract(precondition=, postcondition=)` decorator. This is the
  template to follow for the next first-appearing construct that needs
  its own isolation lab (generators, context managers, `@dataclass`,
  etc., whenever one is genuinely the vehicle for a new engineering idea
  rather than incidental syntax).
- **Domain-closing synthesis lessons** (L12, L27, L39 so far) are lighter
  on new code, heavier on tying the domain's own running examples
  together and handing off to the next domain by name (never by lesson
  number) — follow this pattern for L51, L71, etc.

## Progress

| # | Lesson | Status |
|---|--------|--------|
| 1 | What Software Engineering Is | **Done** |
| 2 | Programming vs Software Engineering | **Done** |
| 3 | Software as a Socio-Technical System | **Done** |
| 4 | Essential vs Accidental Complexity | **Done** |
| 5 | Change as the Central Engineering Problem | **Done** |
| 6 | Correctness, Reliability, and Maintainability | **Done** |
| 7 | Abstraction as a Complexity-Management Tool | **Done** |
| 8 | Separation of Concerns | **Done** |
| 9 | Cohesion and Coupling | **Done** |
| 10 | Local Reasoning | **Done** |
| 11 | Engineering Tradeoffs | **Done** |
| 12 | The Software Lifecycle | **Done** |

**Domain 1 (Software Engineering Foundations) — complete, all 12
lessons.** Running examples, reused freely later: `cart_total` (L1, L5),
`is_username_available` (L2, L3, L9, L11), `accounts.py`/
`growth_signup.py`/`get_account_status` (L3, L9, and much more later —
see Domain 3), `business_days_between` (L4), `safe_average` (L6),
`account_utils` (L9), `apply_coupon` (L10). The 17-stage lifecycle
pipeline (Problem → ... → Retirement) was established in L12 — every
lesson touching a stage of it must open by restating the diagram per the
schema's pipeline rule (this has been done in every Domain 3+ lesson
since).

| 13 | Problems vs Solutions | **Done** |
| 14 | Stakeholders | **Done** |
| 15 | User Goals | **Done** |
| 16 | Functional Requirements | **Done** |
| 17 | Non-Functional Requirements | **Done** |
| 18 | Constraints | **Done** |
| 19 | Assumptions | **Done** |
| 20 | Acceptance Criteria | **Done** |
| 21 | Ambiguous Requirements | **Done** |
| 22 | Conflicting Requirements | **Done** |
| 23 | Requirements Prioritization | **Done** |
| 24 | Requirements Traceability | **Done** |
| 25 | Requirements Validation | **Done** |
| 26 | Requirements Change | **Done** |
| 27 | Requirements Failure Modes | **Done** |

**Domain 2 (Requirements Engineering) — complete, all 15 lessons
(13–27).** Running example carried through nearly the whole domain:
`export_contacts_csv` (CSV/CRM confusion L13 → missed VIP stakeholder
L14 → acceptance criteria L20 → Sales/Compliance conflict L22 →
REQ-COMPLIANCE-1 traceability tag L24 → audit-log change request L26).
Others: `search_files`/`search_files_ranked` (L15), `cart_total`/
`cart_total_wasteful` (L16–17), `create_account` password hashing (L18),
`is_username_available`/`register_username`/`bulk_import` (L19),
`dedupe_by_email`/`dedupe_by_name_and_email` (L21), backlog value/cost
prioritization (L23), `reminder_dates_prototype` (L25). L27 closes the
domain with a 13-item failure-mode catalog.

| 28 | Preconditions | **Done** |
| 29 | Postconditions | **Done** |
| 30 | Invariants | **Done** |
| 31 | Design by Contract | **Done** |
| 32 | State-Based Specifications | **Done** |
| 33 | State Machines | **Done** |
| 34 | Behavioral Properties | **Done** |
| 35 | Error Contracts | **Done** |
| 36 | API Contracts | **Done** |
| 37 | Compatibility Contracts | **Done** |
| 38 | Contract Testing | **Done** |
| 39 | Specification Refinement | **Done** |

**Domain 3 (Specification & Contracts) — complete, all 12 lessons
(28–39).** `average` carries the precondition/postcondition/contract
thread (L28, L31, reusing L6). `search_files_ranked`/
`search_files_ranked_buggy` (L29, postcondition catches a real
dict-key-collision bug, reusing L15's `relevance_rank`).
`existing_usernames`/`register_username`/`check_normalized_invariant`
(L30, reusing L19). Cart `add_item`/`remove_item`/
`check_remove_item_relation` (L32, state relation) then the same cart's
add/remove round-trip property (L34) — L34 found a **real, unplanned**
failure (order-sensitivity from `list.remove()`'s first-match semantics)
on the 4th of 4 test cases, correctly diagnosed as an over-specified
property rather than a code bug — kept honest/unplanned rather than
staged, and is the anchor example L39 returns to. `ResetToken` (L33,
first use of `class`). `register_many`/`register_many_atomic` (L35,
atomicity as part of an error contract). `accounts.py`/
`growth_signup.py`/`get_account_status`/`can_purchase` is this domain's
richest thread: `ACCOUNT_STATUSES` published contract (L36) →
`STATUS_COMPATIBILITY_MAP` for a compatible internal rename (L37) →
`consumer_contract_test` catching a documented contract change with zero
`accounts.py` code running (L38) — this pair also carries L3 and L9 from
Domain 1. L39 closes the domain, explicitly fulfilling a forward-
reference L34 made to itself, and hands off to Domain 4.

| 40 | Why Domain Models Matter | **Done** |
| 41 | Entities | **Done** |
| 42 | Value Objects | **Done** |
| 43 | Identity | **Done** |
| 44 | Relationships | **Done** |
| 45–280 | ... | not started |

**Domain 4 (Domain Modeling) — in progress, 5/12 lessons (40–44 done;
next up: 45 State).** `customers`/`customer_orders`/`customer_points`
keyed by `customer_id` instead of email (L40 — real "orphaned loyalty
points" bug when the mutable email was used as identity; deliberately
stayed light on formal identity vocabulary to leave L43 its own
treatment). `Customer` identity- vs attribute-based equality (L41 — two
real, opposite failures: same entity called different, different
entities called same). `Money` value object, `__eq__`, immutability vs. a
shared-reference mutation bug (L42 — see the quality-incident note
above, now fixed). Product catalog, natural key (`supplier_sku`) vs.
surrogate key (`product_id`) (L43 — real catastrophic silent-overwrite
when two suppliers reuse the same SKU). `orders`/`customers` (honest
one-to-many) vs. `products`/`category_id` (real many-to-many mistakenly
modeled as one-to-one, fixed with `category_ids` as a `set`) (L44).

Remaining Domain 4 lessons per the BRD: 45 State, 46 Lifecycle Modeling,
47 Business Rules, 48 Domain Invariants, 49 Aggregates, 50 Bounded
Contexts, 51 Domain Language (L51 = domain-closing synthesis, hand off to
Domain 5: Software Design & Modularity, 20 lessons, 52–71).

Full lesson list/titles for all 18 domains: see the BRD, section 8
(Domain 1) through section 25 (Domain 18).
