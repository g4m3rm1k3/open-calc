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

## Folder / file convention (established Lesson 1, keep using it)

```
Software Engineering/
  Software Engineering.brd.md      (source doc, do not edit)
  HANDOFF.md                       (this file)
  01 Software Engineering Foundations/
    Lesson 01 - What Software Engineering Is.md
    Lesson 02 - ...
  02 Requirements Engineering/
    Lesson 13 - ...
  ...
```

- Outer folder = domain name, prefixed with its 2-digit domain number,
  exactly as the BRD titles it ("01 Software Engineering Foundations",
  "02 Requirements Engineering", etc. — 18 domains total).
- File name = `Lesson NN - <Title>.md`, where `NN` is the lesson's
  **global** number from the BRD (1–280, continuous across domains, not
  reset per-domain) and `<Title>` is the BRD's own lesson title verbatim.
- The `# Lesson N: <Title>` header line inside each file uses the same
  global number.

## Language / code convention (established Lesson 1)

- All code examples are **Python**. Chosen because the BRD explicitly
  states programming-language fundamentals are Foundations' job, not this
  curriculum's — Python's syntax is quiet enough to keep the engineering
  idea, not the language, as the visible thing.
- **Basic Python syntax is assumed prior knowledge and is not lab'd** —
  function defs, conditionals, built-ins like `sum()`, dict literals, etc.
  Only genuinely new *engineering* ideas (a pattern, a principle, a
  technique) get full Concept Unit / throwaway-lab treatment, even when
  wrapped in trivial Python. This is stated explicitly in Lesson 1's
  header so it isn't a silent skip. Later lessons don't need to repeat the
  full explanation — one line pointing back to this convention is enough
  the first time it's relevant again.
- Real code is actually run via the Bash tool for every shown output —
  never fabricated. Terminal/output blocks use ```text fencing (not bare
  ```), separated from the preceding code block by at least one sentence
  of prose — **no two fenced blocks may ever sit back-to-back**, schema's
  own hard rule. Check this specifically before finishing every lesson;
  it's the easiest thing to violate by accident (code block → its own
  output block, with nothing said in between).

## Lesson-number citations (established Lesson 1)

Per the schema's "for lessons written from this point forward" notes: no
`Lesson N` citations inside a Concept Unit's own prose, ever. Forward
references to later material stay generic ("a later part of this
curriculum covers this" / "this curriculum returns to this at larger
scale") — never a specific number promised in-body. The only places a
lesson number belongs: the header's "What you need to know first" list,
and this file.

## Shared `src/docs/concepts/` catalog

Exists, is large (~300+ files, mostly from a different, unrelated project
— C#, Python, Flask, JS, browser APIs). Per schema, a lesson should check
`concepts/GLOSSARY.md` before writing a from-scratch inline explanation of
anything generic enough to plausibly recur elsewhere, and reference an
existing file by name instead of re-deriving it, or add a new file there
if genuinely warranted and no match exists. Already confirmed present and
relevant: `dependency-inversion-principle.md`, `guard-clause-early-return.md`,
`avoid-premature-abstraction.md`, `move-method-refactoring.md`,
`fail-fast-validation.md`, `input-validation-at-boundary.md`,
`caching-and-memoization.md`, `automated-testing-unit-test-basics.md`, and
others — several SE-domain concepts (Domains 5, 7, 9 especially) likely
already have a matching file. **Check before re-teaching these from
scratch** — worth a `Grep`/`Read` of GLOSSARY.md when a lesson's topic
sounds like it might already be catalogued, rather than assuming. Lesson 1
itself didn't need this (pure scene-setting, no matching concept existed).

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

**Domain 1 (Software Engineering Foundations) is complete — all 12 lessons.**
Running examples built across it, reused freely in later lessons where
relevant: `cart_total` (L1, L5), `is_username_available` (L2, L3, L9, L11),
`accounts.py`/`growth_signup.py`/`get_account_status` (L3, L9),
`business_days_between` (L4), `safe_average` (L6), `account_utils` (L9),
`apply_coupon` (L10). The 17-stage lifecycle pipeline (Problem → ... →
Retirement) was established in L12 — every future lesson touching a stage
of it must open by restating the diagram per the schema's pipeline rule.

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

**Domain 2 (Requirements Engineering) is complete — all 15 lessons
(13–27).** Running example carried through nearly the whole domain:
`export_contacts_csv` (CSV/CRM confusion L13 → missed VIP stakeholder
L14 → acceptance criteria L20 → Sales/Compliance conflict L22 →
REQ-COMPLIANCE-1 traceability tag L24 → audit-log change request L26).
Other running examples: `search_files`/`search_files_ranked` (L15),
`cart_total`/`cart_total_wasteful` (L16-17), `create_account` password
hashing (L18), `is_username_available`/`register_username`/`bulk_import`
(L19), `dedupe_by_email`/`dedupe_by_name_and_email` (L21), backlog
value/cost prioritization (L23), `reminder_dates_prototype` (L25).
L27 closes the domain with a 13-item failure-mode catalog and hands off
to Domain 3 (Specification & Contracts).

| 28 | Preconditions | **Done** |
| 29 | Postconditions | **Done** |
| 30 | Invariants | **Done** |
| 31 | Design by Contract | **Done** |
| 32 | State-Based Specifications | **Done** |
| 33 | State Machines | **Done** |
| 34 | Behavioral Properties | **Done** |
| 35 | Error Contracts | **Done** |
| 36 | API Contracts | **Done** |
| 37–280 | ... | not started |

**Full audit run after L36** (user asked mid-session to double check schema
compliance): scripted scan across all 36 lesson files for (a) back-to-
back code blocks with no prose between — 0 violations after fixing 3
introduced in L36 itself; (b) every required header/closing section
present — clean, one correct intentional exception (L27 says "Terms
restated" not "introduced," which is right for a domain-closing
synthesis lesson per the Repetition Rule); (c) every Concept Unit has
both CS Lens and SE Lens — clean. Audit script itself was sanity-checked
against a deliberately-broken test file first. Worth re-running this
same three-part audit periodically in future sessions, especially after
any batch of lessons written without the per-lesson grep check.

L36 running example: `accounts.py`/`growth_signup.py` (reused from L3/L9)
— `ACCOUNT_STATUSES` published+checked set makes an undocumented new
status fail at its own source (Accounts' code) instead of crashing days
later inside an unrelated caller (Growth's code).

L34 running example: cart add/remove round-trip property — found a REAL,
unplanned failure (order-sensitivity from `list.remove()`'s first-match
semantics) on the 4th of 4 test cases; resolved by correcting the
property to be order-independent rather than "fixing" already-correct
code. Good authentic example of "the spec was wrong, not the code" —
deliberately kept honest/unplanned rather than staged.
L35 running example: `register_many` → `register_many_atomic` (batch
username registration; error contract must specify not just which
exception but what state guarantee holds on failure — atomicity).
Referenced `concepts/exception-vs-return-value-invalid-input-signaling.md`
for the signaling-mechanism half rather than re-deriving it (did NOT run
its PySide6-dependent example — just pointed to it).

L32 running example: `add_item`/`remove_item` cart state, plus
`check_remove_item_relation` (a before/after state relation, distinct
from an ordinary postcondition — catches a bug an isolated pre/post
check on remove_item's own args/return couldn't see).

L33 is the first lesson to use `class`/`self` — treated as already-
assumed Foundations syntax (stated explicitly in L33's header), same
convention as everything else. L33 also referenced an EXISTING shared
concept file instead of re-deriving from scratch:
`src/docs/concepts/finite-state-machine-guarded-transitions.md` (100%
match — general FSM/guarded-transition mechanism). Built a fresh,
curriculum-own example on top of it (`ResetToken`, replay-attack
prevention) rather than repeating the concept file's own Order example.
**Reminder for future lessons:** keep checking `concepts/GLOSSARY.md`
before writing a from-scratch explanation of anything that sounds like a
standard, reusable CS/SE construct — it has already paid off once
(caching-and-memoization.md in L11, finite-state-machine... in L33) and
likely will again in Domains 5+ (design patterns, dependency injection,
etc. are heavily represented in that shared catalog already).

Domain 3 folder name uses "&" to match the BRD exactly: "03 Specification
& Contracts". Domain 3 running examples so far: `average` (precondition
L28, wrapped in `@contract` decorator L31 — reuses Lesson 6);
`search_files_ranked` / `search_files_ranked_buggy` (postcondition
catches a real dict-key-collision bug, L29 — reuses Lesson 15's
`relevance_rank`); `existing_usernames`/`register_username`/
`check_normalized_invariant` (invariant, L30 — reuses Lesson 19).
L31 introduced decorators as a new language construct (full Concept
Isolation Rule throwaway lab: `announce`/`double`) then built a reusable
`contract(precondition=, postcondition=)` decorator — this is the first
"new Python construct requiring its own lab" moment in the curriculum;
worth remembering that pattern (isolate the construct itself before
using it for the domain-specific application) for future first-appearing
constructs (e.g. classes, generators, context managers) in later domains.

Domain 2 running examples: `export_contacts_csv` (CSV export → CRM
problem L13; restricted-contact permission check L14; acceptance
criteria + and/or bug catch L20); `search_files` / `search_files_ranked`
(task vs. goal, L15); `cart_total` / `cart_total_wasteful` (functional
L16, non-functional L17, 1ms budget); `create_account`/`hash_password`/
`check_password` (constraint: never store raw passwords, L18);
`is_username_available`/`register_username`/`bulk_import` (unstated
normalization assumption violated by a separately-written caller, L19).

Note: this BRD has NO dedicated Security domain (security/crypto is
explicitly a sibling curriculum per BRD §3/§30) — L18 flagged that
honestly rather than promising future depth this curriculum doesn't own.

Recurring self-check habit that's paid off every lesson so far: after
writing each lesson, grep the file for ^``` `and manually verify every
close-then-open fence pair has a real prose sentence between them — the
schema's "no two code blocks back-to-back" rule gets violated by default
(usually right before a "Running it:"-style output block) unless checked
explicitly every time.

Domain 1 (Foundations) is lessons 1–12. Full lesson list/titles: see the
BRD, section 8 (Domain 1) onward through section 25 (Domain 18).

## Working style for this build

User wants continuous building within a session — no mid-session
checkpoints, no "here's what's done, what's next?" pauses, no asking
permission between lessons. Build lesson after lesson until the session's
usage/context runs out, then update this file's Progress table and stop.
A new chat starts the next session; that new chat should read this file
first, then pick up at the first "not started" row.
