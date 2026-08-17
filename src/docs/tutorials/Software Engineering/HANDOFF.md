# Software Engineering Curriculum — Build Handoff

Read this first, every new session, before writing anything. It exists so
a new chat can resume this build cold, mid-curriculum, without re-deriving
decisions already made or re-reading everything from scratch.

## What this is

Building all ~280 lessons of `Software Engineering.brd.md`, one lesson per
file, each one fully compliant with `../reference/LESSON SCHEMA.md`. Source
of truth for lesson list, numbering, and domain boundaries: the BRD itself
(section 8 onward — each domain lists its own lesson titles and numbers).
Source of truth for lesson *format*: the schema (now fully read at least
once — see "Format conventions," below, for the
real, verified structure). Nothing else is in scope — per explicit user
instruction, this build does not read or reference other curricula/folders
in this repo (Graphics, etc.) for style or content, and — restated,
narrowed, and made explicit — does not open any
prior *lesson* file either. The only three files a session should read
before writing anything: this handoff, `LESSON SCHEMA.md`, and
`Software Engineering.brd.md`. The one standing exception: `../
inventory-report/` (see "The `inventory-report/` project is now real
and persistent," below) may be opened — read directly, not
reconstructed from prose — **only when actually needed** to see the
current, exact state of code a new lesson is about to extend, not as
routine background reading.

**No `git status`/`git log`/`git diff` or other repo-inspection commands
during a build session, for the same reason.** Explicit user instruction:
investigating something not asked about — even read-only, even a single
`git status` — spends usage that should go toward the lesson itself.
Noticing something odd in passing is fine to mention in one sentence;
spending a tool call to go verify it first is not, unless the user's own
question requires it.

**Working style — changed 2026-08-17, supersedes the old rule below.**
Earlier sessions (through the Domain 8/9 build spanning L45–133) built
continuously, many lessons per session, with zero narration between
them, on explicit instruction. **That pace is over.** Current, standing
instruction, replacing it: **one lesson per session, then
stop.** Finish whatever single lesson is in progress, move any newly
verified code into the real, persistent `inventory-report/` folder (see
below — no longer an ephemeral scratchpad), update this handoff, and
end the session there — do not continue building the next lesson
without the user explicitly restarting the build in a new turn. The
old zero-narration-*during*-a-build-in-progress habit is still correct
(no status updates or "should I continue" framing while actually
writing the one lesson a session is building) — what changed is that a
session no longer keeps going lesson after lesson on its own momentum
once that one lesson is done. Update this handoff file at the end of
*every* session now, not only when context is running low.

**Original rule, for historical context (no longer in force as
written):** continuous building, lesson after lesson, with no pauses of
any kind between lessons, zero narration, building until context forced
a stop. Still true: the user's own reason underneath both versions of
this rule hasn't changed (see next paragraph) — only the pace has.

The user's own stated reason for all of this, repeated several times: they
are working through this curriculum themselves, as homework, specifically
so they can apply it directly to real projects they build with Claude as
guide — their own past projects "scale and turn to shit with no recovery."
They explicitly want maximum schema completeness (no simplifying for
readability) and zero friction/narration around the build process itself.
See memory (`feedback_se_curriculum_completeness`, `feedback_se_curriculum_
no_checkpoints`, `project_se_curriculum_learning`) for the full context —
already saved, no need to re-derive.

## Format conventions (verified against the real schema — not a summary)

Earlier sessions worked from this handoff's own summary of the schema.
The L45 session read `LESSON SCHEMA.md` in full once, and separately opened
`Lesson 12 - The Software Lifecycle.md` once (with explicit user
permission, as a one-time exception to the "don't open other files" rule)
to recover the real 17-stage pipeline diagram and, incidentally, the
*real* Header/Closing formatting — which turned out to differ from what
an earlier session's summary implied. This is now the confirmed, correct
structure, followed by every lesson L45 onward:

- **Header fields use bolded run-in labels in flowing prose**, not `##`
  headings — e.g. `**What you will build.** ...`, `**What you need to know
  first.** ...`, `**Pipeline diagram.** ...`, `**Terms introduced in this
  lesson.** ...` (or **Terms restated in this lesson.** for domain-closing
  lessons, per the Repetition Rule), `**Objects and methods used.** ...`.
  Terms/Objects entries below the label are still real markdown bullet
  lists, each with the three-part What-it-is/Implementation/Its-use shape
  for Objects and Methods.
- **Closing section is four separate `##` headings**, not one wrapping
  `## Closing` with bolded sub-labels: `## Connect the Pieces`,
  `## What Breaks Without This`, `## Exercises`, `## Definition of Done`,
  each its own top-level section.
- **Concept Unit steps use `###` headings** (`### The Problem`,
  `### Project Change`, `### The New Code`, `### The Updated Project`,
  `### Isolating the Concept: <name>`, `### Mechanical Walkthrough`,
  `### CS Lens`, `### SE Lens`, `### Commands Needed`, `### Run It`,
  `### Connecting Back`) — this part matched the schema's own literal
  examples and needed no correction.
- **Domain-closing lessons** (L12, L27, L39, L51, L71, L92 confirmed so
  far) use 2–3 Concept Units with a lighter step sequence — just
  `### The Problem` → `### The Concept` (or a reused step name) →
  `### CS Lens` → `### SE Lens`, no Project Change/New Code/Isolated
  Lab/Mechanical Walkthrough, since nothing new is being built, only
  synthesized. Terms section says "**Terms restated in this lesson.**"

## The two checks to run on every lesson before calling it done

**1. Fence-pair audit (mechanical, catches formatting).** No two fenced
code blocks may ever sit back-to-back with nothing but a blank line
between them. Run this after writing each lesson:

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
offending fence open — fix by inserting a real prose sentence between the
two fences (not just a label like "Running it:" alone — a full sentence
connecting the two blocks reads better and satisfies the rule). Common
trigger: a lesson's "Updated Project" step showing more than
one file/code block back to back (multi-file lessons, e.g. L52, L61, L134) —
always needs a transition sentence between each file's own block.

**2. Full read-through + real execution (human, catches honesty).** Every
single code example in every lesson across the L45–92 build (~150+ distinct
runnable snippets) was actually run via Bash before being written into the
lesson text, output pasted verbatim, never fabricated — the same standard
every lesson since, including L134, has held to. This caught and
fixed several real mistakes worth knowing about for future sessions:

- **L52** originally let an uncaught exception print a raw Python
  traceback, which leaked this machine's own scratchpad absolute file path
  into what was supposed to be lesson content. Fixed by catching the
  exception and printing `type(e).__name__ + ": " + str(e)` instead —
  this is now the standing pattern for every lesson: **never let an
  uncaught traceback appear in lesson text**; always catch and print
  cleanly, matching what a reader would see regardless of their own
  filesystem layout.
- **L89** had two arithmetic errors in its own first draft (weighted
  scores computed by hand, not verified) — caught by actually running the
  scoring code, and one of the two errors also had the *wrong conclusion*
  narrated around it (claimed two results "coincidentally agreed" when the
  real numbers showed them disagreeing) — fixed by rewriting the
  surrounding prose to match the real, verified numbers, which turned out
  to make a *stronger* point than the fabricated version would have.
- **General pattern**: several `Run It` sections that compare two
  measurements (timing, probability simulations) show real numbers that
  vary slightly run-to-run (e.g. `time.perf_counter()` measurements,
  `random`-seeded simulations) — these are flagged honestly in-lesson
  ("real timings vary run to run; the shape doesn't") rather than
  presented as exact, reproducible-to-the-decimal facts.

Run both checks after every lesson, not just at the end of a session.

**Batching verification runs (standing practice, added 2026-08-17).** When
running the project's `check_*.py` files during a lesson's verification
pass, run them together in one combined command rather than one
`python3 check_X.py` invocation at a time — loop over `check_*.py` in a
single shell command and review the combined output together. This is
the same direction Lesson 139 (Testing Strategy) will eventually
formalize as real project code (see the L139 forward-reference debt,
below) — until then, it's how a session should actually be running the
checks during verification, not a separate future-only plan.

**Trivial code does not get a dedicated check (standing practice, added
2026-08-17).** Genuinely trivial code — a simple getter, an obvious
one-line pass-through, a bare constant with no logic — does not need its
own `check_*.py` file. Dedicated verification is reserved for real
logic: anything with a branch, a calculation, a boundary condition, or a
state change. This keeps the check suite's size proportional to the
codebase's actual complexity, not one file per function regardless of
what that function does.

## The shared `src/docs/concepts/` catalog

A large (~300+ file), pre-existing, project-independent catalog from a
different, unrelated build. Per the schema, check `concepts/GLOSSARY.md`
before writing a from-scratch explanation of anything generic enough to
plausibly recur elsewhere. Used successfully three times in Domains 1–3
(see prior sessions' work — `caching-and-memoization.md`,
`finite-state-machine-guarded-transitions.md`,
`exception-vs-return-value-invalid-input-signaling.md`,
`many-to-many-modeled-as-one-to-one.md`). **Not checked at all during
the L45–92 build** — worth a future session actually
reopening `GLOSSARY.md` to see whether any of Domain 5's or Domain 6's
now-completed lessons (design patterns, dependency inversion, hexagonal
architecture) duplicate something already in the catalog. This is a real,
known gap, not a decision that it doesn't apply.

## Shared reference files (pattern, established L45, still in force)

When a lesson needs a specific fact that only lives inside one
already-written lesson file, and the session is under a "don't open other
files freely" constraint: open that one source lesson once, pull the
needed fact into its own small shared file in this same folder, and have
every lesson that needs it read the shared file instead of reopening the
source. `PIPELINE.md` (this folder) holds the full 17-stage lifecycle
diagram plus a stage-to-domain map, extracted from L12 — every lesson
since (L45 onward) restates this diagram from that file, not by reopening
L12. Check this folder for an existing shared file before opening any
prior lesson file for a fact a new lesson needs.

## Notable curriculum-wide decisions

- **No dedicated Security domain** — security/crypto is explicitly a
  sibling curriculum per the BRD (§3, §30). L18 flagged this honestly;
  keep doing that whenever a lesson brushes against security territory
  (L75, Architectural Constraints, did the same for PCI-DSS-style
  compliance).
- **New-construct throwaway labs**, one per genuinely new language/stdlib
  construct at its first appearance in a lesson's own Concept Unit
  (regardless of whether an earlier lesson already used it — Repetition
  Rule): `Enum` (L45), `@property` (L48), keyword-only `*` parameters
  (L55), `ABC`/`@abstractmethod` (L70), `threading.Thread` (L81),
  `async`/`await`/`asyncio` (L85), `ast.parse`/`ast.walk` (L90). All
  followed the same template: isolated, unrelated throwaway example first
  (discarded explicitly), then the real project application.
- **Domain-closing synthesis lessons** (L12, L27, L39, L51, L71, L92) are
  lighter on new code, heavier on tying the domain's own running examples
  together and handing off to the next domain by name (never by lesson
  number). Confirmed pattern across six domains now, and L104 as well.
  **Correction, made during the L115–133 build: L128 is not Domain 9's own close** — an
  earlier guess in this file was wrong. Domain 9 spans L115–141;
  Property-Based Testing (L128), Generative Testing (L129), and every
  lesson through L133 (Test Isolation) were built as full,
  ordinary content lessons, each with real Concept Units, not
  domain-closing syntheses. L141 (Formal Verification) is Domain 9's
  real close.
- **Non-Python-code lesson types, introduced during the Domain 6 (L72–92) build, both real
  precedent for future domains**: L88 (Architecture Decision Records) is
  a documentation-artifact lesson — its "New Code" is a markdown ADR
  file, not Python, and its own execution proof is a *reproduced
  regression* (real code, run, showing what happens without the ADR)
  rather than the ADR itself being "run." L90 (Architecture Fitness) uses
  Python's `ast` module for real static analysis — parsing source without
  executing it — genuinely new territory, likely to recur in Domain 8
  (Version Control & Collaboration) or Domain 12 (Build & Dependency
  Engineering).
- **Domain 7's own running example is a from-scratch addition, not a
  continuation of Domain 5/6's `order_lifecycle.py`/`customer_activity.py`
  or `checkout`/`arch_order` code** — a deliberate choice, not an
  oversight: reconstructing those files' exact byte-for-byte current
  state from prose summaries alone (without reopening every lesson that
  touched them, which conflicts with this curriculum's own "don't open
  prior lesson files freely" constraint) risked fabricating code that
  was never actually verified. Every Domain 7 lesson's own Reference
  Source field says so explicitly: "no reference counterpart — this is
  a from-scratch addition." `pricing.py` (later split into
  `pricing_calculations.py`/`pricing_batch.py`, L102) is the resulting
  new running example; see the Domain 7 summary below for its own
  accumulated history. This precedent — starting a fresh, self-contained
  running example rather than reconstructing an unseen prior one from
  summary — is available to future sessions facing the identical
  constraint at any future domain boundary.
- **New-construct throwaway labs, continued in Domain 7**:
  `@dataclass(frozen=True)` (L103, `OrderRequest`) is a genuinely new
  construct, not previously introduced anywhere in this curriculum —
  added to the running list started in Domain 5 (`Enum` L45, `@property`
  L48, keyword-only `*` parameters L55, `ABC`/`@abstractmethod` L70,
  `threading.Thread` L81, `async`/`await`/`asyncio` L85, `ast.parse`/
  `ast.walk` L90). Not continued as a per-lesson list through Domain 8/9
  after this point — worth knowing this list is stale, not a claim no
  new constructs appeared. One later exception recorded on its own
  merits: `hypothesis`'s `seed()` decorator (L134) got a real isolated
  lab, its own Header entry, and a verified signature via `help(seed)`.

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
pipeline (Problem → ... → Retirement) was established in L12 — full text
now lives in `PIPELINE.md` (this folder), extracted L45 — every lesson
touching a stage of it opens by restating the diagram from that file.

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
`search_files_ranked_buggy` (L29). `existing_usernames`/
`register_username`/`check_normalized_invariant` (L30). Cart
`add_item`/`remove_item` (L32, L34 — L34 found a real, unplanned
order-sensitivity failure, kept honest rather than staged). `ResetToken`
(L33, first use of `class`). `register_many`/`register_many_atomic`
(L35). `accounts.py`/`growth_signup.py`/`get_account_status`/
`can_purchase` (L36–38, published contract → compatible rename →
zero-code-run contract test). L39 closes the domain.

| 40 | Why Domain Models Matter | **Done** |
| 41 | Entities | **Done** |
| 42 | Value Objects | **Done** |
| 43 | Identity | **Done** |
| 44 | Relationships | **Done** |
| 45 | State | **Done** |
| 46 | Lifecycle Modeling | **Done** |
| 47 | Business Rules | **Done** |
| 48 | Domain Invariants | **Done** |
| 49 | Aggregates | **Done** |
| 50 | Bounded Contexts | **Done** |
| 51 | Domain Language | **Done** |

**Domain 4 (Domain Modeling) — complete, all 12 lessons (40–51).**
`customers`/`customer_orders`/`customer_points` keyed by `customer_id`
(L40, orphaned-loyalty-points bug). `Customer` identity vs. attribute
equality (L41). `Money` value object, immutability (L42). Product
catalog, natural vs. surrogate key (L43, silent-overwrite bug).
`orders`/`customers`/`products`/`category_ids` (L44). `Order`/
`OrderStatus` (`Enum`) replacing four booleans (L45) → `ORDER_TRANSITIONS`
plus `transition_to` guard (L46) → `Customer.is_suspended` and
`customer_can_pay` single-source business rule (L47, real rule-drift bug)
→ `OrderLine` + `Order.total` as `@property`, never stored (L48, real
staleness bug) → `Order._lines` private + `tuple()` view, first explicit
aggregate root (L49) → `Customer.open_ticket_count` vs. borrowed
`is_suspended`, bounded-context leakage (L50) → L51 closes the domain,
naming "ubiquitous language" as the throughline underneath all eleven
prior fixes, plus a real `OrderStatus.RETURNED` vs. patched-transitions
term-drift demonstration. Every fix in this domain that left an honest,
explicit gap open (L46's bypassable guard, L48's un-validated `lines`)
was closed by name in a specific later lesson — L49 explicitly closed
both of L48's own open threads.

| 52 | What Is a Module? | **Done** |
| 53 | Information Hiding | **Done** |
| 54 | Encapsulation | **Done** |
| 55 | Interface Design | **Done** |
| 56 | Dependency | **Done** |
| 57 | Dependency Direction | **Done** |
| 58 | Coupling | **Done** |
| 59 | Cohesion | **Done** |
| 60 | Stable Dependencies | **Done** |
| 61 | Dependency Inversion | **Done** |
| 62 | Composition | **Done** |
| 63 | Substitution | **Done** |
| 64 | Polymorphism in Engineering | **Done** |
| 65 | Extension Points | **Done** |
| 66 | Configuration vs Code | **Done** |
| 67 | Side Effects | **Done** |
| 68 | State Ownership | **Done** |
| 69 | Boundary Design | **Done** |
| 70 | Design Patterns | **Done** |
| 71 | Pattern Selection | **Done** |

**Domain 5 (Software Design & Modularity) — complete, all 20 lessons
(52–71).** Running thread: `order_lifecycle.py` (`OrderStatus`, `Order`,
`_ORDER_TRANSITIONS`, `can_transition`) and `customer_activity.py`
(`_activity_log`, `log_order_activity`), built up across the whole
domain as two separate, evolving modules. Key real bugs, in order:
`is_active` name collision in one flat script (L52) → `ORDER_TRANSITIONS`
renamed private, `can_transition` public (L53, real `AttributeError` on
external `.ORDER_TRANSITIONS` access after the rename) → `get_shipping_
address` leaking a mutable dict reference (L54) → positional-boolean
"boolean trap" in `create_order` silently swapping `is_gift`/`is_priority`
(L55, fixed with keyword-only `*`) → `Order.__init__` gaining
`placed_by`, breaking a direct-constructor caller but not a
read-only one (L56, real dependency-surface distinction) →
`order_lifecycle` importing `customer_activity` directly, an activity-
feed outage breaking a legal transition (L57) → `checkout_place_order`
reading `activity_log`'s length directly, corrupted by an unrelated
`nightly_cleanup` (L58, common coupling) → `customer_activity.py`
absorbing an unrelated `check_low_stock`/`inventory_db` responsibility,
breaking activity logging when the warehouse DB is down (L59, low
cohesion) → `order_lifecycle` importing `promo_experiment`, cascading a
teardown to every consumer (L60, instability metric, `0.33`→`0.0`) →
`register_transition_listener`, Observer-pattern dependency inversion
closing the exact gap L57's manual-call fix left open (L61) →
`Order(InvoiceFormatter)` inheritance vs. composition, `AttributeError`
and a false `isinstance` (L62) → `RushOrder(Order)` subclass narrowing
`transition_to`'s contract, breaking a generic batch job (L63, LSP) →
`CreditCard`/`PayPal`/`GiftCard` polymorphic `.charge()` replacing an
`isinstance` chain (L64) → `PAYMENT_METHOD_REGISTRY` self-registration,
`GiftCard` addable with zero edits to `build_payment_method` (L65) →
`ENABLED_PAYMENT_METHODS` hardcoded vs. `payments_config.json`, a
fraud-spike disable needing a redeploy (L66) → `sorted_lines_by_price`
using `.sort()` (mutates in place) vs. `sorted()` (L67) →
`order_lifecycle` gaining a listener registry that also lets a
duplicated `mark_shipped_via_shipping_service` skip it (L68, state
ownership) → `order.__dict__` dumped as JSON leaking `internal_notes`
and an ugly enum repr into a shipping payload (L69, boundary object
fix) → `DiscountStrategy` `ABC` hierarchy vs. three plain functions,
real `TypeError` on a forgotten `NoDiscount.apply` (L70) → L71 closes
the domain, naming the one question underneath all twenty lessons: what
specific, demonstrated failure does a piece of structure actually
prevent, weighed honestly against structure's own real cost.

| 72 | What Is Architecture? | **Done** |
| 73 | Architectural Drivers | **Done** |
| 74 | Quality Attributes | **Done** |
| 75 | Architectural Constraints | **Done** |
| 76 | Architectural Boundaries | **Done** |
| 77 | Layered Architecture | **Done** |
| 78 | Hexagonal Architecture | **Done** |
| 79 | Ports and Adapters | **Done** |
| 80 | Modular Monoliths | **Done** |
| 81 | Service-Oriented Architecture | **Done** |
| 82 | Microservices | **Done** |
| 83 | Event-Driven Architecture | **Done** |
| 84 | Message-Oriented Architecture | **Done** |
| 85 | Asynchronous Systems | **Done** |
| 86 | Data Ownership | **Done** |
| 87 | Service Boundaries | **Done** |
| 88 | Architecture Decision Records | **Done** |
| 89 | Architecture Tradeoffs | **Done** |
| 90 | Architecture Fitness | **Done** |
| 91 | Architecture Failure | **Done** |
| 92 | Architecture Evolution | **Done** |

**Domain 6 (Architecture) — complete, all 21 lessons (72–92).** Real
measured numbers carried through the whole domain, each one an actual
run/simulation, not estimated: a circular `arch_order`/`arch_inventory`
import, real `ImportError` (L72) → checkout-by-entity-split needing 2
cross-boundary calls vs. checkout-by-capability needing 0, for the
identical `customer_can_pay`+`transition_to` operation (L73, Common
Closure) → cached vs. uncached `payments_config.json` reads, ~250x
latency win measured against Lesson 66's own freshness guarantee
silently breaking (L74) → a real credit-card number in a plaintext log,
`masked_card_number` fix, then a second, unmasked `refund` function
proving the underscore convention alone doesn't protect it (L75) →
`customer_email` leaking through Lesson 69's own boundary function until
a declared `BOUNDARY_FIELD_POLICY` protects every boundary automatically
(L76) → an admin "quick fix" skipping the business-logic layer straight
into a data layer, bypassing `customer_can_pay` for a suspended customer
(L77) → `OrderConfirmationService` constructing its own `SmtpMailer`
directly vs. accepting a `mailer` port, `FakeMailer` proving testability
(L78) → a core method shaped around REST's own nested JSON breaking an
unrelated CLI adapter the moment REST's shape changed (L79, port
ownership) → stock reserved over a network then payment failing,
permanently-stuck inventory vs. an in-process rollback (L80, modular
monolith) → a slow tax report and fast checkout sharing one worker,
checkouts blocked ~300ms behind it vs. ~1ms on an independent worker
(L81, with an explicit, verified GIL/CPU-bound honesty caveat) → 100,000-
trial simulation: 5 chained 99%-reliable services compounding to ~95.1%
order success vs. a 3-service critical path at ~97.0% (L82, real
`random`-seeded numbers) → `place_order` blocking ~100ms on notifications
and loyalty it never needed to wait for, event-driven `publish_event`
cutting it to ~0.003ms (L83) → an in-memory event queue losing an event
across a real, separate process invocation vs. a durable
`message_log.jsonl` surviving it (L84) → 5 sequential 50ms notifications
(~252ms) vs. `asyncio.gather` (~65ms), with a verified, honest GIL
caveat proving async doesn't help genuine CPU-bound work either (L85) →
two services each caching a customer's address, one going stale after an
update, vs. one owning service queried directly (L86) → a marketing
service reaching `customer_db` directly, breaking on an internal schema
change that a real API-routed consumer survived untouched (L87) → a
second engineer silently reverting Lesson 57's own fix, reproducing the
exact original outage, fixed with a written ADR (L88) → a
weighted, multi-attribute tradeoff matrix flipping the "obviously
faster" monolith choice into a microservices win once team-autonomy and
failure-risk are weighted correctly for returns processing specifically
— **note:** this lesson's own numbers were wrong in first draft and
corrected after actually running the scoring code, see "Format
conventions" section above (L89) → `ast`-based `check_no_forbidden_
import`, automatically catching L88's own regression before it ships,
proven against both the broken and fixed files (L90) → two individually
correct functions sharing one unbounded resource, checkout latency
degrading ~18,000x with no bug in either function, fixed locally with a
dedicated `set`, while explicitly *not* claiming this proves the
monolith decision itself was wrong (L91, architecture failure vs. local
bug) → L92 closes the domain: every decision in it was justified by real
evidence at the time, revisited only when new evidence — gathered with
the identical discipline — says to.

| 93 | Readable Code | **Done** |
| 94 | Naming | **Done** |
| 95 | Function and Method Design | **Done** |
| 96 | State Management | **Done** |
| 97 | Error Handling | **Done** |
| 98 | Failure Semantics | **Done** |
| 99 | Side Effects | **Done** |
| 100 | Input Validation | **Done** |
| 101 | Configuration | **Done** |
| 102 | Code Organization | **Done** |
| 103 | Code Smells | **Done** |
| 104 | Engineering Conventions | **Done** |

**Domain 7 (Implementation Engineering) — complete, all 12 lessons
(93–104).** Running example: a single evolving order-pricing codebase,
`pricing.py` through L101, split into `pricing_calculations.py` (pure)
and `pricing_batch.py` (side-effecting) at L102 along the exact
functional-core/imperative-shell line L99 already drew. Real bugs found
and fixed, in order: a nested, duplicated gold-tier discount check
silently skipping the discount for orders under $50 (L93, fixed with
guard clauses — the same restructuring that fixed it also exposed it)
→ `s`/`n`/`t`/`d`/`sh`/`bf` renamed to intention-revealing names,
`calc_order_total` → `calculate_order_total` (L94) → the function's four
rules extracted into named helpers; a keyword-only signature closing a
real `subtotal`/`item_count` positional swap that silently returned
`$11.34` instead of the correct `$45.89` (L95) → `calculate_subtotal`'s
own accumulator, plus a real mutable-default-argument leak in
`build_order_summary`'s `notes` list, fixed with `notes=None` (L96) →
an unrecognized loyalty tier (a `"glod"` typo) now raises a specific
`ValueError`; `process_orders` catches it by type, proven against a
bare `except:` that silently swallowed an unrelated `NameError` from a
real typo (L97) → `process_order_and_log`'s own audit-log increment
reordered to only count genuine successes; a real retry-futility
demonstration proved this `ValueError` is deterministic, not transient,
so no retry logic was added (L98) → `record_attempt`/`record_success`
extracted as side-effect-only functions; `preview_order_total` reuses
the now-fully-isolated-effects `calculate_order_total` to quote a total
with zero audit-log risk (L99) → `validate_order_lines` (element-wise,
naming the exact bad index) and a single `item_count` check at
`calculate_order_total`'s own boundary, deliberately *not* repeated
inside `calculate_bulk_handling_fee` — a real, counted 2x validation-cost
reduction shown in the isolated lab (L100) → `GOLD_TIER_DISCOUNT_RATE`
made configurable via environment variable with correct `str`→`Decimal`
coercion; a real configuration-drift bug shown (`5.00%` advertised vs.
`10%` actually applied) and fixed by reusing the one loaded constant
instead of a second independent read (L101) → the file split in two
along the pure/side-effecting line, with a real circular-import
`ImportError` demonstrated and reverted, establishing a one-way
dependency rule (L102) → `OrderRequest`, a frozen `@dataclass`,
replacing three primitive parameters repeated across three identical
signatures (primitive obsession); adding a `gift_wrap` field afterward
touched zero function signatures, proving the shotgun-surgery fix (L103)
→ L104 closes the domain, naming **engineering conventions** —
consistent, deliberate, honestly-tradeoffed, revisable choices — as the
one throughline underneath all eleven prior lessons' otherwise
different-sounding subjects.

| 105 | Why Version Control Exists | **Done** |
| 106 | Versioned State | **Done** |
| 107 | Commits | **Done** |
| 108 | Branches | **Done** |
| 109 | Merging | **Done** |
| 110 | Rebasing | **Done** |
| 111 | Conflict Resolution | **Done** |
| 112 | Pull Requests | **Done** |
| 113 | Code Review | **Done** |
| 114 | Collaborative Ownership | **Done** |

**Domain 8 (Version Control & Collaboration) — complete, all 10 lessons
(105–114).** Running example: `inventory-report/`, a from-scratch
project (a real reference source, not reconstructed from summary,
because the L105–133 build actually built and verified it — see "The
`inventory-report/` project is now real and persistent," below). Real,
verified sequence: manual-copy diffing
pain fixed by `diff -u`, then `git init`/`git status` (L105) →
`git add`/`git diff`/`git diff --staged`/`.gitignore`, proving staging
is a snapshot, not a live link (L106) → first commit, then `git log` and
`git cat-file -p` opening the real commit→tree→blob object graph (L107)
→ `git branch`/`git switch`, with `.git/refs/heads/*` and `.git/HEAD`
opened directly to prove a branch is just a file holding a hash (L108)
→ fast-forward vs. real two-parent merge commits, both proven with
`git cat-file` (L109) → `git rebase` proven to create new commit objects
(new hash, same message, new parent), plus a real bare-repo +
second-clone demonstration of the duplicate-commit mess rebasing
already-pushed history causes (L110) → real merge and rebase conflicts,
constructed on purpose (same line, two branches, two different values),
resolved by hand, including the label-flip between merge-conflict and
rebase-conflict markers (L111) → `git remote add`/`git push -u`, and a
real, run proof that a pull request's diff view has to be triple-dot
(`main...branch`), not two-dot, using a docstring `main` gained
independently as the concrete misleading-diff case (L112) → `git blame`
tracing a specific line to its own commit, plus a real `CODEOWNERS` file
reusing `.gitignore`'s own pattern syntax (L113) → L114 closes the
domain, walking `is_username_available`'s own two-engineer story (from
Lesson 12) across all ten lessons at once and naming **collaborative
ownership** — visibility and review, not exclusive access — as the
throughline, plus **bus factor** as the named risk every mechanism in
the domain keeps low.

## The `inventory-report/` project is now real and persistent

This changed during the L105–133 build, permanently, going forward. Every prior
session verified `inventory-report/` in an ephemeral scratch directory
(a session temp folder) and this handoff file carried its current state
forward as *prose* — a full-file dump of what the scratch directory
held as of the end of whichever lesson last touched it. That pattern is
retired. **`inventory-report/` (sibling folder to this handoff file,
`../inventory-report/`) is now a real, physically persisted directory
in this repository**, containing every file described as verified, run,
and committed across Lessons 105 through 133 — copied there directly
from that build's own scratch verification work, not reconstructed
from memory or summary. Lesson 134's own single-file change was applied
directly to the real, persistent copy, the same pattern going forward.

**What a future session should do instead of reading a prose dump
here:** open `../inventory-report/` directly — only when a new lesson
is actually about to extend code that lives there, per the "only when
actually needed" rule above — and read the real files. `inventory_
report.py` and `inventory_cli.py` hold every function; every `check_
*.py` file is a real, currently-passing check; `inventory.json`,
`inventory_bad.json`, `inventory_zero.json`, and `inventory_negative.
json` are the real fixture files Lessons 121, 122, and 126 built.
Running `python3 check_<name>.py` for any of them, or `python3 -m
mypy inventory_report.py`, from inside that folder, works today,
directly — nothing needs to be recreated first. Three packages are
installed into this machine's own Python environment (not vendored
into the folder itself) and would need `pip install mypy hypothesis
coverage` again on a different machine: `mypy` (Lesson 116),
`hypothesis` (Lesson 128), and `coverage` (Lesson 138). Lesson 138 also
left two new, real, permanent project files in this folder:
`.coveragerc` (`[run]` section: `source = inventory_report,
inventory_cli`, `parallel = true`) and `sitecustomize.py` (`import
coverage; coverage.process_startup()`) — running the real coverage
batch described in that lesson requires `export COVERAGE_PROCESS_
START="$(pwd)/.coveragerc"` first, same as that lesson's own Commands
Needed step.

**This folder has no `.git` of its own.** The real, commit-by-commit
git history the L105–133 build built during verification (used to demonstrate
real `git log`/`git diff`/`git show` behavior in Lesson 132
specifically) was scratch-only, the same way it always has been for
this curriculum's own repo-internal git demonstrations — it is not
preserved, and Lesson 132's own real commit hashes quoted in its lesson
text (`246f86b`, etc.) belong to that now-gone scratch history, not to
this repository's own git. A future session needing to reproduce a
similar git-history demonstration should build a fresh scratch `git
init` the way every session already has, using `../inventory-report/`'s
real current file content as the starting point instead of
reconstructing it from a prose summary.

A future session extending Domain 9 (L134 onward) should treat `../
inventory-report/` exactly like an already-cloned, already-working
project — read what's there, extend it, keep it passing — the same
posture a real engineer would have joining a real, existing codebase,
which is closer to this curriculum's own point than reconstructing
files from a changelog ever was.

## Verification gotchas discovered during the L105–133 build (save a future session real time)

- **On Windows/Git Bash, use Python for in-place file edits during
  verification, never `sed -i`.** `sed -i 's/x/y/'` on this platform, at
  least once, silently rewrote *every* line's own line
  endings, not just the targeted line — producing a diff with every line
  shown as removed-and-re-added (e.g., "12 insertions, 12 deletions" for
  what should have been a genuine one-line change) instead of a clean,
  single-line diff. Caught by checking `git show --stat` after an edit
  that should have been trivial and finding a suspiciously large change
  count. Fix used throughout the rest of that build, and still standing:
  `python3 -c "p='file'; t=open(p).read(); t=t.replace('old','new');
  open(p,'w').write(t)"` — never touches line endings it isn't told to.
- **`git config core.autocrlf false` once per scratch repo**, set
  immediately after `git init`, avoids a separate, related
  `warning: LF will be replaced by CRLF` noise on every `git add` — real
  Git behavior, not a bug, but irrelevant noise this curriculum's own
  lessons don't need cluttering verified output.
- **The L52 "never let an uncaught traceback leak this machine's own
  absolute path" rule extends to *every* real, run output containing a
  path, not just Python tracebacks** — `git init`'s own confirmation
  message (`Initialized empty Git repository in <path>`) and every
  Python traceback's own `File "<path>"` line both needed the same
  fix: keep the real, verified command and the real shape of its output,
  replace only the machine-specific path segment with a generic
  `/path/to/...` placeholder, and say so honestly in-lesson (this is
  *not* the same as the L52 case itself, which was about catching an
  exception that shouldn't have been allowed to propagate at all —
  Lesson 115 deliberately *does* let an `AssertionError` propagate
  uncaught, since that's correct, intended test-failure behavior; only
  the path inside that intentional traceback needed sanitizing, not the
  traceback itself).
- **A lesson borrowing a future lesson's own mechanism, briefly, to
  prove one real point early, is a legitimate pattern — used twice during
  the Domain 8 (L105–114) build, both real precedent for later domains.** Lesson 110
  (Rebasing) used `git init --bare`, a second clone, and `git push
  --force` — all Lesson 112 (Pull Requests)'s own real subject — solely
  inside its own "What Breaks Without This" section, to prove the
  shared-history-rebase danger concretely instead of only asserting it,
  explicitly flagging that full treatment of remotes was still Lesson
  112's job. Lesson 112 then delivered on that flag in full. Available
  to any future lesson facing the identical tradeoff: assert a real
  danger honestly, or borrow just enough of a not-yet-taught mechanism
  to prove it now, as long as the borrow is explicit and the real
  lesson still delivers full treatment later.
- **`mutmut` (the standard Python mutation-testing tool) refuses to run
  natively on this machine's own Windows environment** — it explicitly
  detects Windows and tells you to use WSL, which wasn't available when
  L131 was built. L131 (Mutation Testing) was built entirely by hand as a
  result (manually editing real code into a "mutant," running the real
  suite against it, reverting) — a real, honestly-flagged environment
  limitation, not a design choice. A future session with WSL access
  could redo L131 using the real tool, but the hand-built version is
  itself real, run, verified content, not a placeholder.
- **`mypy`, `hypothesis`, and `coverage` were all installed via `pip
  install` into this machine's own global Python environment, not into
  `inventory-report/` itself** (no virtual environment or lockfile —
  Domain 12, Build & Dependency Engineering, is where that gets real
  treatment). A future session on a different machine needs to
  reinstall all three before Lessons 116, 128, and 138 onward will
  actually run.
- **Coverage data files (`.coverage`, `.coverage.*`, `htmlcov/`) are a
  fourth generated-artifact category, same as `__pycache__/`,
  `.hypothesis/`, and `.mypy_cache/` — strip all four before copying
  the project anywhere or ending a session**, per the same rule already
  in force for the other three, below. `.coveragerc` and
  `sitecustomize.py` are real, permanent source files (Lesson 138) and
  must **not** be stripped alongside the generated data they configure —
  the distinction matters exactly the way it does for `.mypy_cache/`
  (generated, strip it) versus `inventory_report.py` (real source,
  never strip it).
- **Python caches its own compiled bytecode (`__pycache__/`) and can
  serve a stale cached version of a file that was just edited on disk**,
  at least once during the L105–133 build, when two edits happened in quick
  succession — caught by a check that should have failed still passing,
  traced to a stale `.pyc`. Fix: `rm -rf __pycache__` (and, for
  `hypothesis`/`mypy`/`coverage` specifically, their own `.hypothesis/`,
  `.mypy_cache/`, `.coverage`, `.coverage.*`, and `htmlcov/`) before
  rerunning anything after a hand-edit during verification, and always
  before copying the project anywhere — none of these belong in
  `inventory-report/` itself; stripped out before that build moved it
  into the real repo, and again after L134's and L138's own
  verification work.

| 115 | Why Test? | **Done** |
| 116 | Testing vs Verification | **Done** |
| 117 | Test Oracles | **Done** |
| 118 | Unit Tests | **Done** |
| 119 | Integration Tests | **Done** |
| 120 | System Tests | **Done** |
| 121 | End-to-End Tests | **Done** |
| 122 | Test Boundaries | **Done** |
| 123 | Test Doubles | **Done** |
| 124 | Mocks | **Done** |
| 125 | Stubs | **Done** |
| 126 | Fakes | **Done** |
| 127 | Contract Tests | **Done** |
| 128 | Property-Based Testing | **Done** |
| 129 | Generative Testing | **Done** |
| 130 | Fuzz Testing | **Done** |
| 131 | Mutation Testing | **Done** |
| 132 | Regression Testing | **Done** |
| 133 | Test Isolation | **Done** |
| 134 | Determinism | **Done** |
| 135 | Flaky Tests | **Done** |
| 136 | Test Data | **Done** |
| 137 | Test Environments | **Done** |
| 138 | Coverage | **Done** |
| 139 | Testing Strategy | Not started |
| 140 | Verification Strategies | Not started |
| 141 | Formal Verification | Not started |

**Domain 9 (Testing & Verification) — in progress, 24 of 27 lessons done
(115–138).** Running example: `inventory-report/`, continued directly
from Domain 8, **now a real, persistent project folder** (see the
section above) instead of a scratch directory reconstructed each
session. Real, verified sequence, each arrow a real bug found and
fixed unless noted otherwise: L115 revisited the Verification stage
Lesson 12 first placed, replacing a fragile one-off hand-check with a
real, automated `check_low_stock_items` → L116 drew the actual
testing/verification distinction using real `mypy` static type
checking, catching a missing `str()` conversion in an untested branch
that dynamic testing alone never exercised → L117 introduced test
oracles, building a derived-oracle second implementation of `reorder_
suggestion` that surfaced a real, pre-existing docstring-vs-behavior
mismatch on `low_stock_items` (fixed by correcting the docstring, not
the code) → L118 named unit tests and proved `check_restock_alert`
wasn't actually isolated from `low_stock_items`, via a real, reverted
regression → L119 combined `reorder_suggestion` and `format_reorder_
line` into `build_reorder_report`, finding a real negative-reorder-
quantity bug at their seam, fixed with an explicit precondition →
L120 gave the project its first real external interface, `inventory_
cli.py`, and a system test (`subprocess.run`) that caught a missing
`int()` on a CLI argument no unit/integration check could reach → L121
gave the project its first real file I/O, `load_inventory` reading
`inventory.json`, and an end-to-end test that caught a hand-edited
JSON data-quality mistake (a quoted number) real unit tests never
would → L122 named boundary value analysis and found `load_inventory`
silently accepted negative counts, closing the gap with a new,
deliberately-chosen-boundary check → L123 built a real monkey-patched
test double, finally isolating `restock_alert` from `low_stock_items`
the way L118 named but couldn't yet achieve → L124 added call-recording
to that same double (a mock), catching a swapped-argument bug the
plain stub from L123 couldn't see → L125 used deliberately unsorted
stub data to find a real ordering inconsistency between `restock_
alert` and `build_reorder_report`, fixed with one `sorted()` call →
L126 split `load_inventory` into `parse_inventory`/`load_inventory` so
`io.StringIO` fakes could test real parsing logic without touching
disk → L127 wrote `load_inventory`'s contract down explicitly as a
docstring and proved the same test passes unmodified against two
genuinely different real implementations of it → L128 introduced real
`hypothesis` property-based testing, finding and shrinking a real
counterexample that led to moving `build_reorder_report`'s own
precondition down into `reorder_suggestion` itself → L129 replaced
`assume()`-based filtering with a constructed-by-design strategy,
proven necessary by a real `hypothesis` `FailedHealthCheck` under a
deliberately narrow constraint → L130 used `hypothesis` fuzzing across
mixed JSON shapes to find a real `AttributeError` (a bare `null` file)
that ten prior lessons' worth of checks never tried → L131 introduced
mutation testing by hand (no tool available; `mutmut` doesn't run
natively on this machine's own Windows environment) and found the
project's *entire* test suite — every check across sixteen lessons —
never actually verified `low_stock_items`'s own `sorted()` call did
anything → L132 named regression testing explicitly, added comments
tying two existing checks to their real, specific historical bugs, and
reproduced a real historical regression against the current project
using real `git log`/`git diff`/`git checkout` → L133 introduced the
first function in the project that mutates its own input,
`apply_reorder`, and found a real order-dependent test failure caused
by two checks sharing one mutable dictionary, fixed by giving each
check its own fresh data → L134 named determinism explicitly and fixed
`check_reorder_suggestion_property.py` (L128's own file), which had been
silently non-deterministic since it was written: unseeded, `hypothesis`
picks a fresh PRNG start every run, so two runs of the identical file
against identical code can explore different inputs — proven for real,
twice, with `Verbosity.verbose` output showing two runs draw different
`inventory` dictionaries from the same strategy. Fixed with `hypothesis`'s
own `seed()` decorator (`@seed(20260817)`, a new construct, its own
isolated lab), verified reproducible across two separate runs with
byte-identical `Verbosity.verbose` output. The SE Lens named a real,
still-open cost of the fix rather than treating it as free: a permanently
seeded check stops exploring anywhere outside its one fixed sample
forever, so a bug living only outside that sample would now pass
silently — this project has no periodic unseeded sweep to offset that,
named honestly as a real, undelivered gap, not fixed this lesson → L135
introduced the project's first multi-store feature,
`low_stock_across_stores` (dedupes low-stock names across several store
inventories using a `set`), deliberately built with a real, un-staged
bug: `return list(low_names)`, unsorted, whose output order silently
depends on CPython's own per-process hash-randomization seed rather than
the data — verified for real by running the identical one-line `set`
print as five separate OS processes and getting three different
orderings. `check_low_stock_across_stores.py` asserts one exact combined-
report string and is genuinely flaky against the unfixed code (a real
`detect_flaky_tests.py` harness, built this lesson, spawning 30
independent subprocess reruns, counted `5 passed, 25 failed`); a
single-run CI simulation (six separate real runs) caught a real green
result sandwiched between red ones on identical, unfixed code, proving a
lucky single pass gives false confidence. Fixed by `return
sorted(low_names)`, matching this file's own pre-existing convention
every other list-returning function already followed; the same 30-run
harness then reported `30 passed, 0 failed`. First real appearance of
`set` in this curriculum, given its own isolated lab; `str.join` also
introduced and lab'd. Distinguished explicitly, in the lesson's own
Header, from L133's shared-mutable-state flakiness and L134's unseeded-
randomness flakiness — a third, independent real cause of the same named
failure mode → L136 named test data itself as a designed artifact,
proving via a real `grep` tally (17 hand-typed `"widgets"`, 13
`"gadgets"`, across the whole check suite) that every existing fixture
shared the same author's own narrow, single-case-spelling assumptions
as the code itself. Built a deliberately messier fixture (three stores,
one logging an item as `"Widgets"` where another used `"widgets"`) and
found `low_stock_across_stores` (L135) really did return both spellings
as separate items — verified before any fix. Fixed with `str.casefold()`
-based deduplication (a genuinely new construct, its own isolated lab
proving it differs from `.lower()` on non-ASCII input like German "ß",
though this project's own ASCII-only fixtures wouldn't have caught that
specific difference — named honestly as Exercise 2). New file:
`check_low_stock_across_stores_casing.py`. SE Lens named two real,
still-open gaps rather than treating the fix as complete: the same
seventeen-instance duplication risk across the suite was not resolved
with a shared fixture module, and no other function was audited for the
identical casing gap → L137 named test environments explicitly and
found that `check_inventory_cli.py` (Lesson 120) and
`check_inventory_end_to_end.py` (Lesson 121) both only ever passed
because they had always, by accident, been launched from directly
inside `inventory-report/` — real, verified for the first time this
lesson: launching either one, unmodified, from `inventory-report/`'s own
parent directory instead produces a real `AssertionError`, traced to
their own `subprocess.run` calls asking for `"inventory_cli.py"` and
`"inventory.json"` by relative path with no `cwd=` of their own, so both
silently inherited whatever directory launched the check rather than
resolving against their own folder. Fixed by computing
`CHECK_DIR = os.path.dirname(os.path.abspath(__file__))` once in each
file and passing `cwd=CHECK_DIR` to each `subprocess.run` call — proven,
for real, from both directories, both before (broken) and after
(fixed), including a live break/restore cycle in the lesson's own
"What Breaks Without This." `__file__`, `os.path.abspath`,
`os.path.dirname`, and `subprocess.run`'s `cwd` parameter are all new
constructs, each given real, fetched signatures (`help()`/
`inspect.signature()`, this session) and a from-scratch isolated
throwaway lab (`child.py`/`probe.py`, run from two directories,
discarded). SE Lens named a real, still-open gap: the fix anchors the
working directory only — it does nothing about a missing `python3` on
PATH, an unpinned interpreter version, or `inventory_cli.py` itself
moving to a different subdirectory relative to the checks that launch
it. Exercise 1 flagged, but deliberately did not fix, an honestly
different-shaped version of the identical bug class in
`detect_flaky_tests.py` (Lesson 135), where the relative path is a
caller-supplied argument rather than a name baked into the file, making
this lesson's own `CHECK_DIR` fix not obviously the right tool for it
→ L138 introduced real, run line coverage via `coverage.py` (a third
package now installed on this machine, alongside `mypy` and
`hypothesis`), run as a single batched command across all nineteen
`check_*.py` files (first real application of this session's own new
batching-verification-runs practice, see below) and found a real,
verified contradiction: `coverage report -m` showed `inventory_cli.py`'s
own `main()` at a flat 0%, lines 30–33 and 36 never executed, directly
contradicting Lessons 120, 121, and 137's own already-passing proof
that exact code runs, because `check_inventory_cli.py` and
`check_inventory_end_to_end.py` launch it as a separate `subprocess.run`
process invisible to the parent's own coverage instrumentation by
default — proven concretely with a discarded `probe_parent.py`/
`probe_child.py` throwaway pair showing a child process's real,
printed output completely unmeasured. Fixed with coverage.py's own real
subprocess-tracking machinery: a new `sitecustomize.py` (`import
coverage; coverage.process_startup()`) placed in `inventory-report/`
itself, reachable from the subprocess only because Lesson 137's own
`cwd=CHECK_DIR` fix puts `inventory-report/` on that subprocess's own
`sys.path[0]`; a `COVERAGE_PROCESS_START` environment variable pointing
at `.coveragerc`; and `parallel = true` plus `coverage combine` so the
subprocess's own separately written coverage data merges into one
report instead of being lost. Verified twice, live, with a real
break/restore cycle (unset the env var, rerun the identical batch, gap
reproduces at 78%/91%; restore it, reruns at 100%). SE Lens named a
real, still-open gap on the fix's own terms, distinct from but related
to Lesson 137's own: `sitecustomize.py`'s discoverability depends
entirely on `inventory_cli.py` continuing to be launched exactly the
way Lesson 137 left it (by file path, with `cwd=CHECK_DIR`) — a future
change to how either check launches it (`python3 -m inventory_cli`,
or a moved file) would silently reopen this exact coverage gap with no
error anywhere. No new `check_*.py` file this lesson — per this
session's own new practice (below), a measurement/config fix to the
verification tooling itself isn't behavior a dedicated check file would
assert anything about.

## Two new standing practices, added 2026-08-17 mid-session (not lesson-specific)

Recorded here because they change how every future session verifies a
lesson, not just this one:

- **Batch verification runs.** Run the project's `check_*.py` files
  together in one combined shell command during a lesson's verification
  pass — a loop over `check_*.py`, reviewed as one combined output —
  rather than one `python3 check_X.py` invocation at a time. L138's own
  `coverage` batch loop is the first real application of this.
- **No dedicated check for trivial code.** A simple getter, a one-line
  pass-through, a bare constant — none of these need their own
  `check_*.py` file. Dedicated checks are reserved for real logic: a
  branch, a calculation, a boundary condition, a state change.

## Next up: Lesson 139 — Testing Strategy, continuing Domain 9

Domain 9 spans **L115–141 (27 lessons)**, per the BRD's own words, "one
of the largest domains." Remaining: 139 Testing Strategy, 140
Verification Strategies, 141 Formal Verification. The BRD additionally
names one learner-understanding progression for this domain:
`Example-based testing → Property-based testing → Generative testing →
Model-based testing → Formal verification`, "as increasingly different
ways of producing evidence about system behavior" — L128 and L129
already delivered the first two steps of this progression in full;
"model-based testing" specifically has not been used by name by any
lesson yet and is worth checking against when L140 (Verification
Strategies) or L141 (Formal Verification) are eventually built.

A forward-reference debt worth knowing about, not yet paid: Lesson
119's own Exercise 3 and Lesson 130's own Exercise 2 both explicitly
named **Lesson 139 (Testing Strategy)** as the future lesson responsible
for running the project's entire check suite as one coordinated command,
instead of one `python3 check_X.py` invocation per file — nineteen
separate check files, twenty-eight individual check functions, recounted
for real (`grep -h "^def check_" check_*.py | wc -l`) as of the end of
L138 and unchanged since L136 (L135 added
`check_low_stock_across_stores.py` / `check_low_stock_across_stores_message`;
L136 added `check_low_stock_across_stores_casing.py` /
`check_low_stock_across_stores_dedupes_case_variants`; L137 and L138
both modified existing files rather than adding new check functions),
plus two separate commands outside that count: a `python3 -m mypy`
call, and, as of L138, the batched `coverage run -p`/`coverage
combine`/`coverage report -m` sequence (already itself one batched
command per this session's own new standing practice — see above — but
still a second, separate command from actually running the checks
themselves). Recount `check_*.py`/`check_` functions again at the start
of L139 rather than trusting this number forward indefinitely — the
coverage-specific `.coveragerc`/`sitecustomize.py`/`COVERAGE_PROCESS_
START` machinery is new since L138 and L139 should decide, by name,
whether its own coordinated command also runs coverage automatically or
keeps it separate. That promise has not been delivered yet and must be,
by name, when L139 is built. L139 should also decide, by name, whether
`detect_flaky_tests.py` (L135's own new subprocess-rerun harness — not a
`check_*.py` file itself, since it *reruns* another check rather than
asserting anything on its own) has any role in that same coordinated
command, or stays a separate, manually invoked tool.

Full lesson list/titles for all 18 domains: see the BRD, section 8
(Domain 1) through section 25 (Domain 18). Domain 7's own list, for
reference: 93 Readable Code, 94 Naming, 95 Function and Method Design,
96 State Management, 97 Error Handling, 98 Failure Semantics, 99 Side
Effects, 100 Input Validation, 101 Configuration, 102 Code Organization,
103 Code Smells, 104 Engineering Conventions.
