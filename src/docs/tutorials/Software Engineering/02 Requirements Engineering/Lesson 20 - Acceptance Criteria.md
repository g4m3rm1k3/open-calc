# Lesson 20: Acceptance Criteria

**What you will build.** A precise set of pass/fail conditions for Lesson
14's restricted-contact export, written down *before* judging any
implementation against them — and then a second, subtly broken
implementation of that same export, one character different from the
original, that could easily look correct to someone skimming it, and
that those written-down conditions catch immediately, with a real,
specific error naming exactly what failed. The transferable problem:
"does this satisfy the requirement" is not a question a person should be
answering by impression. It's a question with a real, checkable answer,
if — and only if — the criteria for answering it were written down in
checkable form before anyone went looking for a reason to sign off.

**What you need to know first.** Lesson 14's `export_contacts_csv` and
its restricted-contact permission check — this lesson writes the first
real acceptance criteria this curriculum has produced, aimed directly at
that function.

**Terms introduced in this lesson**

- **acceptance criteria** — a specific, concrete, testable set of
  conditions, agreed on before or during the work, that determine whether
  a requirement has actually been satisfied. The word "acceptance" is
  literal: these are the conditions something has to meet to be accepted
  as done. The term matters because Lessons 16 through 19 established
  four real categories a requirement can fall into — functional,
  non-functional, constraint, assumption — and none of those, on their
  own, answer the practical question this lesson asks: given a real
  implementation, how do you actually *check* whether any of them were
  met, rather than trusting a glance?
- **Given/When/Then** — a common, structured way of writing a single
  acceptance criterion as a concrete scenario: a starting condition
  (Given), an action (When), and a required result (Then). The structure
  matters because it forces a criterion to be specific enough to
  translate directly into a real, runnable check — "the export should
  respect permissions" cannot be run; "Given a requester without
  restricted-contact permission, when they export, then the restricted
  contact must not appear" can.

**Objects and methods used.** `assert`, already used without comment in
earlier lessons' code but never given its own entry — given full
treatment now: a statement that does nothing if its condition is `True`,
and raises `AssertionError`, with an optional message, the instant it's
`False`. Its use in this lesson is exactly what it's for: turning a
written acceptance criterion directly into a real, checkable line of
code.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named, at its boundary with *Verification*.

---

## Concept Unit: Writing the Criteria Before Judging Anything Against Them

### The Problem

Lesson 14 built a version of `export_contacts_csv` that correctly
respects a `restricted` flag. How would anyone — the original author, a
teammate, a stakeholder — actually confirm that a *given* implementation
of this feature does what it's supposed to, rather than just looking
plausible?

### The Concept

Write it down, precisely, in the **Given/When/Then** shape, before
looking at any code at all:

> **AC1.** Given a requester without restricted-contact permission, when
> they export a contact list containing one restricted contact, then the
> restricted contact must not appear in the output, and every
> non-restricted contact must.
>
> **AC2.** Given a requester with restricted-contact permission, when
> they export the same list, then every contact, restricted or not, must
> appear.

These two sentences are **acceptance criteria** — not a description of
how the code works, but a checkable definition of what "correct" means
for this specific feature, precise enough that a real implementation
either satisfies them or doesn't, with no room for a difference of
opinion about it.

### CS Lens

This is Lesson 16's functional requirement, made concrete enough to run:
a functional requirement states what a system must do in general terms;
acceptance criteria pin that down to specific, named scenarios — the same
narrowing from "the cart should calculate correctly" to "given
`[12.50, 4.00, 7.25]`, return `23.75`" that Lesson 16 already performed
once, applied here to a feature with more than one input case to specify.

### SE Lens

Writing AC1 and AC2 down *before* looking at an implementation is the
point, not incidental — criteria written after seeing the code tend to
describe whatever the code already does, which checks nothing. Criteria
written first describe what should happen regardless of what any
particular implementation gets right or wrong, which is the only version
capable of catching a real mistake.

---

## Concept Unit: Turning Criteria Into a Real, Runnable Check

### The Problem

AC1 and AC2 are precise English. Make them a real check that can actually
be run against any implementation handed to it.

### The Code, Run for Real

```python
def check_acceptance_criteria(export_fn):
    contacts = [
        {"id": 1, "name": "Alice", "email": "alice@example.com", "company": "Acme", "restricted": False},
        {"id": 2, "name": "VIP Client", "email": "vip@bigcorp.com", "company": "BigCorp", "restricted": True},
    ]

    ordinary = export_fn(contacts, requester_can_view_restricted=False)
    assert "Alice" in ordinary, "AC1 failed: non-restricted contact missing from ordinary export"
    assert "VIP Client" not in ordinary, "AC1 failed: restricted contact leaked to ordinary requester"

    senior = export_fn(contacts, requester_can_view_restricted=True)
    assert "Alice" in senior, "AC2 failed: non-restricted contact missing from senior export"
    assert "VIP Client" in senior, "AC2 failed: restricted contact missing for authorized requester"

    print("all acceptance criteria passed")
```

Run it against Lesson 14's original, correct implementation:

```python
def export_contacts_csv_correct(contacts, requester_can_view_restricted):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"] and not requester_can_view_restricted:
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)

check_acceptance_criteria(export_contacts_csv_correct)
```

Running it:

```text
$ python export_check.py
all acceptance criteria passed
```

### Mechanical Walkthrough

- `assert "Alice" in ordinary, "..."` — first full treatment of `assert`
  in this curriculum: evaluates the condition (`"Alice" in ordinary`); if
  `True`, execution continues exactly as if the line weren't there; if
  `False`, it immediately raises `AssertionError` with the given message
  attached, stopping execution right there.
- Four `assert` lines, one per half of AC1 and AC2 — each one is a
  direct, literal translation of one clause from this lesson's own
  Given/When/Then sentences: "must not appear" becomes `not in`, "must
  appear" becomes `in`.
- `check_acceptance_criteria(export_fn)` taking a function as its
  argument — already-assumed (functions are values, passable like any
  other), used here so the identical check can be run against more than
  one candidate implementation without rewriting it.

### CS Lens

This is precisely Lesson 6's correctness definition, operationalized: a
claim about behavior is worth nothing until it's checked against a real
input and a real expected output, and `check_acceptance_criteria` is
exactly that check, written once, aimed at whichever implementation is
handed to it.

### SE Lens

Writing this check cost real, upfront effort — translating two English
sentences into four precise assertions took actual thought about exactly
what "must not appear" means in terms of the function's real output. That
cost buys something Lesson 5's cost-of-change curve already argued is
worth paying early: a mistake caught here, before any implementation is
even judged, costs nothing but the check itself. The next unit shows what
the same mistake costs when the check exists but a reviewer skips
straight to eyeballing the code instead.

---

## Concept Unit: What "Looks Correct" Misses

### The Problem

A second implementation of the same feature arrives, differing from the
original by exactly one operator.

### The New Code

```python
def export_contacts_csv_buggy(contacts, requester_can_view_restricted):
    lines = ["Full Name,Email Address,Company"]
    for contact in contacts:
        if contact["restricted"] or not requester_can_view_restricted:
            continue
        lines.append(contact["name"] + "," + contact["email"] + "," + contact["company"])
    return "\n".join(lines)
```

Skimmed quickly, this looks nearly identical to the correct version — a
condition, a `continue`, the same structure. Run the acceptance check
against it:

```python
check_acceptance_criteria(export_contacts_csv_buggy)
```

Here's what actually happens:

```text
$ python export_check.py
Traceback (most recent call last):
  File "export_check.py", line 20, in <module>
    check_acceptance_criteria(export_contacts_csv_buggy)
  File "export_check.py", line 8, in check_acceptance_criteria
    assert "Alice" in ordinary, "AC1 failed: non-restricted contact missing from ordinary export"
AssertionError: AC1 failed: non-restricted contact missing from ordinary export
```

Immediate, specific failure: `and` became `or`. Trace what that single
change actually does — for an ordinary requester,
`not requester_can_view_restricted` is `True`, and `True or anything` is
always `True`, so *every* contact is skipped, restricted or not. An
ordinary rep's export comes back completely empty, not just missing the
VIP client. A senior rep fares no better: for them,
`not requester_can_view_restricted` is `False`, so the condition reduces
to just `contact["restricted"]` — which means the VIP client, the one
contact a senior rep is specifically supposed to see, gets skipped
instead of included, the exact opposite of what AC2 requires.

### The Concept

Nothing about `export_contacts_csv_buggy` looks obviously wrong on a
skim — it has the right shape, the right number of conditions, the right
`continue`. A reviewer confirming "yes, this checks permissions" by
reading it, without running anything, would very plausibly approve it.
The acceptance criteria don't skim — they run the function against
concrete inputs and check concrete, named conditions, and the single
`or` fails two of them at once, immediately, with a message naming
exactly which promise was broken. This is the entire value **acceptance
criteria** deliver over an impression of correctness: a criterion
written down in advance doesn't care how plausible the code looks: it
only cares whether the real behavior matches what was actually promised.

### CS Lens

This is Lesson 9's cohesion-and-coupling lesson's own moral, restated at
the level of verification instead of design: a change that looks
locally reasonable — one operator, in one line — can break real,
independent guarantees the code was supposed to uphold, and only checking
those guarantees directly, rather than trusting the code's overall shape,
reliably catches it.

### SE Lens

The realistic alternative to acceptance criteria isn't malicious
carelessness — whoever wrote `export_contacts_csv_buggy` almost certainly
believed it was correct, the same honest mistake Lesson 1's regression
demonstrated. What acceptance criteria change isn't how likely that
mistake is to happen; people will keep typing `or` when they meant `and`.
What changes is how long it survives unnoticed: with AC1 and AC2 written
down and run, this mistake is caught before it's ever called "done." This
curriculum's entire, much larger domain on testing and verification is
built on exactly this same principle, applied far beyond one function.

---

## Connect the Pieces

One feature, two written criteria, two implementations checked against
them:

1. **Criteria written first** — AC1 and AC2, in Given/When/Then form,
   stating exactly what "correct" means for this feature before any code
   is judged.
2. **Turned into a real check** — `check_acceptance_criteria`, four
   `assert` statements, a direct translation of the English criteria into
   something that actually runs.
3. **The correct implementation, verified** — `export_contacts_csv_correct`
   passes both criteria, confirmed by real output.
4. **The subtly broken one, caught immediately** — one operator changed,
   `and` to `or`; the acceptance check fails instantly, naming exactly
   which criterion broke and why, something a quick read of the code
   would very plausibly have missed.

## What Breaks Without This

Skip writing acceptance criteria, and rely instead on a reviewer reading
`export_contacts_csv_buggy` and judging, by eye, whether it looks like it
respects permissions. It does — the shape is right, the logic reads as
plausible, and without running it against a concrete scenario, there's
no obvious tell that `or` should have been `and`. The feature ships,
"approved" by an impression rather than a check, and an ordinary sales
rep's export comes back empty in production — or worse, a senior rep,
who's supposed to see restricted contacts, silently doesn't, and nobody
notices until someone goes looking for a contact that should have been
there and isn't.

## Exercises

1. Write a third acceptance criterion, in Given/When/Then form, for what
   should happen when the contact list is completely empty. Translate it
   into a real `assert` and add it to `check_acceptance_criteria`. Run it
   against both implementations.
2. Deliberately introduce a *different* one-character bug into a fresh
   copy of the correct implementation (not the `and`/`or` swap already
   shown) and confirm the existing acceptance criteria still catch it.
3. Write Given/When/Then acceptance criteria for Lesson 15's
   `search_files_ranked` — specifically, a criterion capturing that an
   exact filename match should appear before a partial match in the
   results.

## Definition of Done

- [ ] You can define acceptance criteria in your own words, and explain
      why they need to be written before an implementation is judged, not
      after.
- [ ] You've run `check_acceptance_criteria` against both implementations
      yourself and reproduced the real pass and the real failure.
- [ ] You can explain exactly why `or` instead of `and` breaks both AC1
      and AC2, by tracing the boolean logic, not just by citing the error
      message.
- [ ] You've completed all three exercises.
- [ ] Commit `check_acceptance_criteria` alongside the correct
      implementation (not the buggy one, kept only as this lesson's
      worked example). Commit message should explain *why*: for example,
      `Lesson 20 — added acceptance criteria as real, runnable checks for
      the restricted-contact export, catching a plausible-looking and/or
      bug that a code review missed.`
