# Lesson 47: Messy Legacy Schema Realities

**What you will build:** a real, direct explanation for Lesson 46's own
unresolved `qty_avail` discrepancy — reproduced live, on a real, fresh
example — and a real, recovered meaning for `tbl_person.mbr_type`'s own
undocumented, single-letter codes.

**What you need to know first:** [Lesson 46](lesson-46-reading-views-and-triggers.md)
— its own closing, real, unexplained discrepancy between `qty_avail`
and a fresh, computed count; this lesson explains exactly why it
happens.

**Terms introduced in this lesson:**
- **Data drift** — a real, general term for stored data quietly
  becoming incorrect relative to its own intended meaning, without any
  error, warning, or constraint violation anywhere.

**Objects and methods used:** none new — this lesson applies
already-explained SQL (`UPDATE`, `SELECT DISTINCT`) to reproduce and
explain a real, existing legacy bug.

---

## Concept Unit: Reproducing `qty_avail`'s Own Real Drift, Live

### The Problem

Lesson 46 closed with a real, proven, unexplained fact: `tbl_book` row
`3`'s own stored `qty_avail` (`1`) disagrees with a fresh, correctly-
computed count (`0`). Rather than trust that this was a one-time
accident, reproduce the exact real mechanism that causes it, on a
*different*, currently-correct row, to prove it's a real, structural
gap — not a fluke.

### Introduce the Concept in Isolation

`tbl_book` row `1` (`The Pragmatic Programmer`) currently, correctly,
shows `qty_avail = 2` — loan `1` (Ada, unreturned) and loan `2` (Alan,
returned `2024-06-20`) together correctly account for exactly one real
book currently out of three.

```
$ sqlite3 library_system.db
sqlite> SELECT qty_avail FROM tbl_book WHERE id = 1;
2
```

A real, deliberate "undo" of loan `2`'s own real return — the identical
real kind of manual correction a real library employee might make by
mistake, or on purpose, for a genuinely legitimate reason (the book was
returned, then found to be the wrong copy, say):

```
sqlite> UPDATE tbl_loan SET ret_dt = NULL WHERE id = 2;
sqlite> SELECT qty_avail FROM tbl_book WHERE id = 1;
2
```

Unchanged — still `2`, even though `tbl_loan` now, correctly, shows
*two* real, currently-unreturned loans against this one book (`id = 1`
and `id = 2` both), meaning the real, true available count is now `1`,
not `2`. Lesson 46's own recovered trigger logic explains exactly why:
`trg_loan_return`'s own real `WHEN` clause only fires on a `NULL` →
non-`NULL` transition; this update ran the *opposite* direction
(non-`NULL` → `NULL`), which neither trigger was ever written to
detect at all.

The real, further, honest complication — a naive "just set it back"
fix:

```
sqlite> UPDATE tbl_loan SET ret_dt = '2024-06-20' WHERE id = 2;
sqlite> SELECT qty_avail FROM tbl_book WHERE id = 1;
3
```

Now `3` — genuinely *more* wrong than before, and in the opposite
direction. Restoring `ret_dt` re-triggered `trg_loan_return`'s own real
`WHEN` clause correctly (`OLD.ret_dt IS NULL AND NEW.ret_dt IS NOT
NULL` really was true this time), incrementing `qty_avail` a *second*
time for a checkout-and-return cycle whose original, correct increment
had already happened once, back in the real past. The real, honest fix
here is not another trigger-driven update at all — it's a direct,
manual correction, the same real kind of repair this exact drift
already requires for row `3`:

```
sqlite> UPDATE tbl_book SET qty_avail = 2 WHERE id = 1;
```

### Discard

The real, deliberate "undo" and its own further, compounding mistake
are disposable proof of the real mechanism; `tbl_book` row `1` is
restored to its own correct, real `qty_avail = 2`, and row `3`'s own
real, pre-existing discrepancy (Lesson 46's own closing proof) is left
genuinely unfixed — this arc's own Lesson 49 is where a real, structural
fix (a `CHECK` constraint preventing this class of drift outright)
finally becomes possible.

### Mechanical Walkthrough

- `UPDATE tbl_loan SET ret_dt = NULL WHERE id = 2;` — **(b) hard
  concept reappearing**, Lesson 06's own `UPDATE`, unchanged; the real
  point is not the syntax, but which real trigger condition it does
  and does not satisfy.
- `UPDATE tbl_loan SET ret_dt = '2024-06-20' WHERE id = 2;` — **(c)
  already basic**, identical shape; proven here to re-fire
  `trg_loan_return` correctly, but at the real, wrong moment, since the
  book's own real "currently out" status was never actually recorded as
  changing during the first, un-returning `UPDATE`.
- `UPDATE tbl_book SET qty_avail = 2 WHERE id = 1;` — **(c) already
  basic**; a real, direct, manual correction — the honest, necessary fix
  once trigger-driven logic alone can no longer be trusted to have kept
  a value correct.

### CS Lens

This is real, direct proof of **incremental-update logic's own real
fragility**: a system correctly maintaining a derived value through
*some* real transitions (checkout, ordinary return) but not *all* of
them (an un-return) accumulates real, silent error over time, with each
individual real update looking entirely reasonable in isolation.

Also recognized in: a bank account balance maintained by summing
transactions incrementally, silently wrong forever the moment one
transaction is ever edited rather than reversed with a new, offsetting
one; a cache invalidated on some, but not all, real code paths that
modify its own underlying data; distributed systems' own real
"eventual consistency" failures when an update reaches some replicas
but not others.

### SE Lens

The real, honest lesson this unit exists to teach, stated plainly:
`qty_avail`, as this schema actually implements it, is not a
trustworthy real source of truth on its own — it is a real, best-effort
cache, correct only for the specific, real sequence of transitions its
own two triggers were written to anticipate. Any real, future code this
project writes against `library_system.db` (Lesson 48's own subject)
must either recompute availability fresh, the same real way Lesson 12's
own `low_stock` view does, or accept and document this exact, real
limitation rather than silently trusting a column whose own name
sounds authoritative but isn't, provably, always correct.

## Concept Unit: `mbr_type` — Recovering an Undocumented Code

### The Problem

`tbl_person.mbr_type` (Lesson 44) is a real `TEXT` column holding
short, real values — `'F'`, `'S'`, `'P'` in this project's own sample
data — with no lookup table, no `CHECK` constraint listing valid
values, and no comment anywhere explaining what any of them mean.

### Introduce the Concept in Isolation

```
sqlite> SELECT DISTINCT mbr_type FROM tbl_person;
F
S
P
```

Three real, distinct codes, confirmed to be the *entire* real set in
use — but still meaningless without context. Cross-referencing against
this project's own real, known people:

```
sqlite> SELECT fname, lname, mbr_type, joined_dt FROM tbl_person;
Ada|Lovelace|F|2023-01-15
Alan|Turing|S|2023-03-02
Grace|Hopper|P|2022-11-20
```

Real, outside knowledge (this arc's own, already-established fictional
context: Ada Lovelace and Alan Turing as real, historical figures
associated with academic/research work, Grace Hopper's own row simply
lacking that same real signal) suggests a plausible real reading —
`F` for **Faculty**, `S` for **Student**, `P` for **Public** — a
real, library-specific membership tier. This is a genuine, honest
**inference**, not a structural proof the way Lesson 45's own foreign
keys were: nothing in this schema *enforces* or *documents* this
meaning anywhere, and a real, careful developer states it as a working
hypothesis, not a certainty, until it can be confirmed against real,
external documentation or a real, knowledgeable person — exactly the
situation this entire arc has deliberately placed you in from Lesson 44
onward.

### Discard

Nothing throwaway — this real, working hypothesis for `mbr_type`'s own
meaning is carried forward, explicitly labeled as inferred rather than
confirmed, into Lesson 48.

### Mechanical Walkthrough

- `SELECT DISTINCT mbr_type FROM tbl_person;` — **(a) first appearance**
  of `SELECT DISTINCT`: returns each real, unique value in a column
  exactly once, collapsing real duplicates — genuinely new syntax,
  small enough that Lesson 10's own aggregate-function treatment didn't
  need to cover it, worth its own first-appearance note here.
- `SELECT fname, lname, mbr_type, joined_dt FROM tbl_person;` — **(c)
  already basic**, an ordinary column-list `SELECT`.

### CS Lens

An undocumented, short-code column like `mbr_type` is a real instance
of an **implicit enumeration**: a real, small, fixed set of valid
values, never declared as such anywhere in the schema (no `CHECK
(mbr_type IN ('F', 'S', 'P'))`, unlike this series' own earlier,
better-documented `CHECK` constraints), existing only as a real,
informal convention in the data itself.

### SE Lens

The real, honest, professional response to an undocumented code like
this is neither to guess confidently nor to refuse to proceed at all —
it's exactly what this unit modeled: gather every real, distinct value,
cross-reference every real, available clue, state a real, working
hypothesis explicitly as a hypothesis, and note directly (as this
lesson does) that Lesson 49's own real schema-modification tools could,
if this hypothesis were later confirmed, add a real, enforced `CHECK`
constraint naming every valid code explicitly — turning an implicit,
undocumented convention into a real, structural guarantee for whoever
inherits this schema next.

## Connect the pieces

Two real, separate kinds of legacy messiness, both handled the same
real, honest way: `qty_avail`'s own real drift, reproduced live and
explained precisely by re-reading the two triggers Lesson 46 already
recovered — a real, structural gap, not a mystery — and `mbr_type`'s
own undocumented codes, given a real, stated, honestly-labeled
hypothesis rather than either a confident guess or a refusal to
proceed. Neither problem was fixed at the schema level in this
lesson — Lesson 49 is where a real, structural fix for the first
finally becomes possible.

## What breaks without this

Trust `qty_avail` directly, in a real, plausible application query,
without the cross-check this arc's own Lesson 46 and this lesson
together already proved necessary:

```
$ sqlite3 library_system.db "SELECT ttl FROM tbl_book WHERE qty_avail > 0;"
The Pragmatic Programmer
Dune
The C Programming Language
```

`The C Programming Language` (`id = 3`) appears — real, direct proof
this query would incorrectly tell a real patron a genuinely unavailable
book (per this lesson's own confirmed, real drift) is available to
borrow. This is the real, concrete cost of Lesson 46's own discrepancy,
left unaddressed: not an abstract data-quality concern, but a real,
wrong answer a real user would actually see.

## Exercises

1. Write the real, correct version of this lesson's own final query —
   computing real availability fresh from `tbl_loan` directly, the same
   way this lesson's own first unit's cross-check did — and confirm it
   correctly excludes `The C Programming Language`.
2. Propose, in your own real words, a real `CHECK` constraint for
   `tbl_person.mbr_type` that would have caught a real, future typo
   (a real `'X'` value, say) immediately — you are not required to
   implement it yet; Lesson 49 covers how, given `ALTER TABLE`'s own
   real inability to add one to an existing table directly.

## Definition of Done

- [ ] You reproduced `qty_avail`'s own real drift live, on a
      previously-correct row, and restored it with a real, manual
      correction.
- [ ] You can state, from memory, exactly which real `ret_dt`
      transition neither trigger detects.
- [ ] You recovered a real, working hypothesis for `mbr_type`'s own
      three codes, and can state clearly why it's a hypothesis, not a
      proven fact.
- [ ] You completed both exercises.

## Next

[Lesson 48 — Pointing the Existing App at This New Database](lesson-48-pointing-the-existing-app-at-this-new-database.md)
adapts Arc 4 and Arc 5's own real, already-working code to
`library_system.db` directly — proven against real, failing endpoints
until every one of this arc's own real, recovered facts is correctly
accounted for.
