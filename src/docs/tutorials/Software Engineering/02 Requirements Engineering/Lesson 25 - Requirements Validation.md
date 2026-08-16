# Lesson 25: Requirements Validation

**What you will build.** A tiny, throwaway prototype of a subscription
renewal reminder — not the real feature, just a table of sample dates —
built specifically to be shown to a stakeholder before any real
implementation exists. The prototype reveals, cheaply and immediately,
that "remind users before renewal" meant something different to the
person who requested it than it meant to whoever was about to build it.
The transferable problem: Lesson 20 taught how to check a finished
system against its stated requirements. This lesson is about a different,
earlier question — checking whether the stated requirement was ever the
right one — and why that check has to happen with the actual stakeholder,
not by reasoning about the requirement alone.

**What you need to know first.** Lesson 13's problem-versus-solution gap
and Lesson 21's ambiguous requirements — both of those failures could
have been caught by the exact practice this lesson formalizes, before
either one became a real bug found the hard way.

**Terms introduced in this lesson**

- **requirements validation** — confirming, directly with the actual
  stakeholder, that a stated requirement truly represents what they need
  — done by walking through concrete examples, a prototype, or a mockup,
  before or during building, rather than after. Validation asks *is this
  the right requirement*; Lesson 20's verification asks a different
  question, *does the system meet this requirement*. A system can pass
  verification completely — meet its stated requirement exactly — while
  that requirement itself was never validated, and still be the wrong
  system, precisely the way Lesson 13's CSV export was.

**Objects and methods used.** `zip(...)`, pairing up two sequences
element by element so corresponding items can be handled together —
first appearance in this curriculum, given full treatment where it's
used below.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: A Requirement That Sounds Settled

### The Problem

A real request arrives: *"remind users before their subscription
renews."* The team reads it, decides a day's notice sounds reasonable,
and is ready to start building the real feature — the email template, the
scheduling job, the delivery logic.

### The Concept

Nothing about "a day's notice sounds reasonable" was confirmed with
whoever actually asked for this feature. It's a real, silent
interpretation, made by the team, of a requirement that never specified a
number at all — structurally the same gap Lesson 21 demonstrated with
"remove duplicate entries," except here nobody has built two competing
versions yet to reveal the disagreement. The requirement *feels* settled,
because a specific number now exists in someone's head. Whether that
number is the one the stakeholder actually needs has not been checked at
all.

### CS Lens

This is Lesson 13's problem-versus-solution gap, one step earlier again:
there, a stated solution hid an unstated problem; here, a stated
requirement hides an unstated specific meaning, filled in silently by
whoever reads it first, exactly the way "a CSV export button" quietly
became the accepted requirement before anyone checked what it was
actually for.

### SE Lens

The realistic alternative to guessing "a day" is not "ask every possible
clarifying question about every requirement before writing a line of
code" — that would make Lesson 23's own prioritization impossible, buried
under endless upfront questioning. The specific, narrow discipline this
lesson introduces is cheaper and more targeted: build the smallest
possible thing that makes the team's current interpretation checkable by
the actual stakeholder, before the real, expensive version exists.

---

## Concept Unit: A Cheap Artifact, Checked Before the Real Thing Exists

### The Problem

Instead of building the full reminder feature — templates, scheduling,
delivery — build the smallest possible thing that shows what the team's
current interpretation actually produces.

### The Code, Run for Real

```python
from datetime import date, timedelta

def reminder_dates_prototype(renewal_dates, days_before):
    return [d - timedelta(days=days_before) for d in renewal_dates]
```

Run it against a few real, sample renewal dates, using the team's
current guess — one day's notice:

```python
renewal_dates = [date(2026, 3, 10), date(2026, 4, 1), date(2026, 4, 15)]

team_assumption = reminder_dates_prototype(renewal_dates, days_before=1)
print("prototype: reminders sent 1 day before renewal")
for renewal, reminder in zip(renewal_dates, team_assumption):
    print("  renews", renewal, "-> reminder sent", reminder)
```

Running it:

```text
$ python reminder_prototype.py
prototype: reminders sent 1 day before renewal
  renews 2026-03-10 -> reminder sent 2026-03-09
  renews 2026-04-01 -> reminder sent 2026-03-31
  renews 2026-04-15 -> reminder sent 2026-04-14
```

This table — three concrete dates, nothing else — is the entire
prototype. It has no email template, no scheduling logic, no way to
actually notify anyone. It exists only to be shown to the person who
requested the feature, with one question: *"is this what you meant?"*

### Mechanical Walkthrough

- `d - timedelta(days=days_before)` — already-assumed `date`/`timedelta`
  arithmetic, given full treatment in Lesson 4; the only new idea in this
  unit isn't in the code, it's in what the code is *for* — a disposable
  artifact built to be shown to someone, not to be shipped.
- `zip(renewal_dates, team_assumption)` — first appearance of `zip`:
  pairs up two sequences of equal length, position by position, so the
  first renewal date is paired with the first reminder date, the second
  with the second, and so on, letting the loop below print both together
  without indexing into either list by hand.

### The Concept

Showing this exact table to the actual stakeholder — not describing the
rule in words, showing the real, concrete output it produces — is
**requirements validation**. It asks a narrower, more answerable question
than "did we build this correctly" (Lesson 20's verification, which
doesn't even apply yet, since nothing real has been built). It asks
whether the *requirement itself*, made concrete enough to react to, is
the one the stakeholder actually needs — a question best answered by the
one person who actually knows the answer, shown something specific
enough to check against their own real expectation, rather than reasoned
about internally by the team alone.

### CS Lens

This is the same value a minimal, throwaway example delivers throughout
this curriculum's own Concept Isolation Rule — a small, disposable
artifact, built only to test one specific idea before it's trusted inside
something larger and more expensive to change.

### SE Lens

Building this three-line prototype cost minutes. Building the real
feature — with the wrong number silently inside it — and discovering the
mistake only once real users complain about too little notice, would cost
considerably more, per Lesson 5's cost-of-change curve, and would cost it
in a much more visible, damaging way: real users affected, not a
stakeholder reviewing a table before anything shipped.

---

## Concept Unit: What the Stakeholder Actually Says

### The Problem

Show the table to the stakeholder. They say: *"No — people need real time
to decide whether to cancel. A day's notice is basically useless. I meant
at least a week."*

### The New Code

```python
stakeholder_confirmed = reminder_dates_prototype(renewal_dates, days_before=7)
print("validated: reminders sent 7 days before renewal")
for renewal, reminder in zip(renewal_dates, stakeholder_confirmed):
    print("  renews", renewal, "-> reminder sent", reminder)
```

Running it:

```text
$ python reminder_prototype.py
validated: reminders sent 7 days before renewal
  renews 2026-03-10 -> reminder sent 2026-03-03
  renews 2026-04-01 -> reminder sent 2026-03-25
  renews 2026-04-15 -> reminder sent 2026-04-08
```

The exact same function, `reminder_dates_prototype`, unchanged — only the
`days_before` argument moved from a guess to a confirmed number. This
table gets shown to the stakeholder again; they confirm it now matches
what they meant. *That* confirmation — not the team's original guess, not
a plausible-sounding default — is what "the requirement" actually means
from this point forward.

### The Concept

Nothing about this correction required rebuilding anything real, because
nothing real had been built yet — the entire cost of catching this
mismatch was one small prototype and one short conversation. Compare
that to what Lesson 21's ambiguity cost when it was caught only after two
full implementations already existed and disagreed with each other, or
what Lesson 13's CSV export cost when the mismatch was only discovered
once a real CRM import failed. Validation, done here, at this stage, is
this domain's cheapest possible point to catch this exact class of
mistake — cheaper than resolving an ambiguity after the fact, cheaper
than a failed import discovered by a real user.

### CS Lens

This is Lesson 5's cost-of-change curve, applied at its earliest possible
point: the curve's whole argument was that catching a mistake earlier is
dramatically cheaper than catching it later; validation is the specific
practice of moving the catch point as early as it can possibly go — before
any real implementation exists to be wrong at all.

### SE Lens

The realistic risk of skipping this step isn't that every requirement
will turn out wrong — most guesses are probably close enough. It's that
there's no cheap way to tell *which* requirements are the wrong-guess
kind without checking, and the ones that turn out wrong are discovered,
without validation, at the most expensive possible point: after building,
after shipping, after real people are affected by the gap.

---

## Connect the Pieces

One requirement, one cheap artifact, one real correction:

1. **A requirement, silently interpreted** — "remind users before
   renewal" becomes "one day before," decided by the team, unconfirmed by
   anyone else.
2. **A disposable prototype, shown before real work begins** — three
   sample dates, computed by `reminder_dates_prototype`, built to be
   checked, not shipped.
3. **The real requirement, found by asking, not guessing** — the
   stakeholder rejects the one-day version and confirms seven days
   instead; the exact same function, given the confirmed number, becomes
   the validated table both sides now actually agree on.

## What Breaks Without This

Skip the prototype, and build the entire real feature — email template,
scheduling job, delivery logic — around the team's silent one-day
assumption. Every functional and non-functional requirement (Lessons 16
and 17) can be satisfied perfectly: the email genuinely sends, exactly
one day before renewal, every time, verified and correct by every
standard this domain has built except one. Real subscribers start
receiving reminders with no meaningful time to act on them, complaints
arrive, and only then does anyone learn the requirement was never
actually validated — at a cost far higher than three lines of code and
one short conversation would have been, weeks earlier.

## Exercises

1. Extend the prototype to show reminders for a subscription that renews
   in exactly 3 days from today, and discuss, in a sentence, what a
   stakeholder reviewing that specific row might notice that the three
   original sample dates didn't reveal.
2. Look back at Lesson 21's `dedupe_by_email` versus
   `dedupe_by_name_and_email`. Describe the smallest possible prototype
   you could have shown a stakeholder *before* building either one, that
   would have surfaced the ambiguity in a single conversation instead of
   two competing implementations.
3. Think of a requirement from this domain's earlier lessons — Lesson
   13's CSV export is a strong candidate — and describe, in a few
   sentences, what a validation artifact for it would have looked like,
   shown to the sales rep before any code existed.

## Definition of Done

- [ ] You can state the difference between validation and verification in
      one sentence each, without confusing the two.
- [ ] You've run both versions of the reminder prototype yourself.
- [ ] You've completed all three exercises.
- [ ] Commit `reminder_dates_prototype`, clearly marked as a prototype,
      not the real feature. Commit message should explain *why*: for
      example, `Lesson 25 — reminder-date prototype used to validate the
      "how many days before renewal" requirement with the stakeholder
      before building the real feature.`
