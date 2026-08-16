# Lesson 21: Ambiguous Requirements

**What you will build.** Two implementations of "remove duplicate entries
from the contact list" — one real sentence, two people, two completely
reasonable readings of it, and two genuinely different, both internally
consistent results from the identical input data. Then a demonstration
that Lesson 20's acceptance criteria, powerful as they are, don't rescue
you here: criteria written around one reading pass one implementation and
fail the other, and the failure looks exactly like a bug, even though
both implementations are honest, defensible answers to the same words.
The transferable problem: some requirements fail not because they're
wrong, but because they were never precise enough to have only one
correct implementation in the first place.

**What you need to know first.** Lesson 16's functional requirements
(this lesson shows a requirement can look functional and precise while
still hiding more than one behavior) and Lesson 20's acceptance criteria
(this lesson shows exactly where that tool's power runs out).

**Terms introduced in this lesson**

- **ambiguous requirement** — a requirement whose wording admits more
  than one reasonable, different interpretation, such that two competent
  people, reading the identical sentence in good faith, could correctly
  build genuinely different things. The word "reasonable" is doing real
  work in that definition: an ambiguous requirement isn't one someone
  misread carelessly — it's one where more than one careful reading is
  actually defensible, which is exactly what makes it dangerous, and
  exactly what this lesson's two implementations demonstrate directly.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax: `set` membership, tuples as dict/set keys, and
list construction inside a loop.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: One Sentence, Two Defensible Systems

### The Problem

A requirement arrives: *"the system should remove duplicate entries from
the contact list."* Build it.

### The Code, Run for Real

One reasonable reading: two contacts are duplicates if they share an
email address.

```python
def dedupe_by_email(contacts):
    seen_emails = set()
    result = []
    for contact in contacts:
        if contact["email"] not in seen_emails:
            seen_emails.add(contact["email"])
            result.append(contact)
    return result
```

An equally reasonable reading: two contacts are duplicates only if they
share both a name and an email address.

```python
def dedupe_by_name_and_email(contacts):
    seen = set()
    result = []
    for contact in contacts:
        key = (contact["name"], contact["email"])
        if key not in seen:
            seen.add(key)
            result.append(contact)
    return result
```

Run both against the same, realistic contact list — one person's contact
entered twice, once under a shortened name:

```python
contacts = [
    {"name": "Alice Smith", "email": "alice@x.com"},
    {"name": "Alice S.", "email": "alice@x.com"},
    {"name": "Bob Jones", "email": "bob@x.com"},
]

print("dedupe by email only:", len(dedupe_by_email(contacts)), "contacts")
print("dedupe by name and email:", len(dedupe_by_name_and_email(contacts)), "contacts")
```

Running it:

```text
$ python dedupe.py
dedupe by email only: 2 contacts
dedupe by name and email: 3 contacts
```

Two contacts, or three — a genuinely different result, from the identical
input, built by two people who each read *"remove duplicate entries"* in
good faith and implemented it correctly, by their own reading. Neither
implementation contains a mistake. `dedupe_by_email` correctly removes
everything it considers a duplicate; `dedupe_by_name_and_email` correctly
keeps everything it doesn't. The word "duplicate" itself was never
defined precisely enough to force only one of these into existence.

### Mechanical Walkthrough

- `key = (contact["name"], contact["email"])` — building a tuple from two
  values to use as a single `set` membership key. Already-assumed tuple
  syntax; the idea worth naming is that a tuple, unlike a single value,
  lets "sameness" be defined across more than one field at once — exactly
  the mechanism that makes `dedupe_by_name_and_email`'s different
  definition of "duplicate" possible to express at all.
- `contact["email"] not in seen_emails` versus
  `key not in seen` — mechanically identical membership checks;
  the entire difference between the two functions lives in what's being
  checked for membership, one field versus two.

### CS Lens

This is Lesson 13's problem-versus-solution gap, discovered one stage
later: there, a request already carried an implicit solution before the
real problem was found. Here, the request never specified enough about
the problem itself — "duplicate" — to determine which solution was even
correct, and two different, valid solutions to two different, valid
readings of the same problem statement both got built.

### SE Lens

Neither implementation is the "obviously right" one in isolation —
matching only on email is more aggressive and would correctly catch a
retyped name; matching on both fields is more conservative and would
correctly avoid merging two different people who happen to share an
inbox. Which one is actually right depends entirely on a fact this
lesson's one-sentence requirement never supplied: what real-world
situation is this feature actually trying to prevent? That's Lesson 13's
own question, unresolved, sitting underneath a two-word phrase that
sounded precise enough not to ask it.

---

## Concept Unit: Why Acceptance Criteria Alone Don't Catch This

### The Problem

Lesson 20 built acceptance criteria specifically to catch a broken
implementation. Do they catch this one?

### The Concept

Write acceptance criteria the way Lesson 20 would, from one of the two
readings — say, matching by email only:

> **AC.** Given a contact list containing two entries with the same email
> address but different names, when duplicates are removed, then only one
> of them should remain.

Check `dedupe_by_email` against it: it passes, exactly as designed.
Check `dedupe_by_name_and_email` against the identical criterion: it
fails — two entries remain, not one — the exact shape of failure Lesson
20's acceptance checks are built to catch and report. But look at what
that failure actually means here: `dedupe_by_name_and_email` isn't
broken. It correctly implements a different, equally defensible reading
of the original requirement; the acceptance criterion above simply
encodes the *other* reading as if it were the only one, and grades
everything against it. Acceptance criteria are a powerful tool for
catching an implementation that violates an agreed-upon meaning — Lesson
20 proved that directly. They do nothing to catch a case where the
meaning itself was never actually agreed upon, only assumed, differently,
by whoever wrote the criteria and whoever wrote the code.

### CS Lens

This is the same distinction as a program passing every test written
against the wrong specification: the tests are internally consistent, the
implementation is internally consistent, and the whole apparatus still
produces the wrong system, because correctness was only ever checked
against one assumed meaning, never against reality.

### SE Lens

The realistic risk here isn't that acceptance criteria are useless — the
realistic risk is trusting them to catch a category of mistake they were
never built to catch, and concluding a feature is "fully specified"
because it has criteria at all, without asking whether those criteria
themselves reflect an agreed meaning or just one person's private
assumption, made concrete and never checked against anyone else's.

---

## Concept Unit: Resolving Ambiguity by Naming the Choice

### The Problem

Two defensible readings exist. The system can only behave one way. How
does the ambiguity actually get resolved, rather than just implemented
by whoever happens to build it first?

### The Concept

Not by picking whichever reading seems more "obviously right" in
isolation — this lesson already showed both are defensible on their own
terms. The real fix is upstream of any implementation at all: turn the
ambiguous phrase into an unambiguous one, the same precision Lesson 16
already demanded of a functional requirement, specifically by naming the
choice out loud and getting it confirmed before code exists — *"two
contacts are duplicates if and only if they share the same email
address; differing names under the same email should be merged, keeping
the most recently added name"* — a sentence with only one correct
implementation, because it no longer leaves the actual open question
unanswered. The ambiguity doesn't disappear by writing better code. It
disappears by someone noticing, before building anything, that
"duplicate" was never actually defined, and asking rather than assuming.

### CS Lens

This is the identical move Lesson 19 made against a different failure
mode: there, an unstated assumption was made structural, so it couldn't
be silently violated by future code; here, an unstated interpretation is
made explicit, so it can't be silently guessed at differently by two
different implementers.

### SE Lens

Catching this specific ambiguity cost one clarifying conversation, before
any code existed — cheap, by Lesson 5's cost-of-change curve, exactly
where this curriculum keeps arguing the cheapest point to catch anything
is. The realistic alternative — building both readings independently,
in different parts of a real system, and discovering the mismatch only
once two teams' contact counts disagree with each other in production —
is the same mistake at a scale this lesson's two ten-line functions were
only ever meant to preview.

---

## Connect the Pieces

One requirement, two honest readings, one gap acceptance criteria alone
couldn't close:

1. **Two defensible implementations** — `dedupe_by_email` and
   `dedupe_by_name_and_email`, both correct by their own reading, disagree
   on the identical input: `2` contacts versus `3`.
2. **Acceptance criteria pick a side without knowing it** — a criterion
   written from one reading passes one implementation and fails the
   other, in a way that looks exactly like a bug report.
3. **The real fix is upstream** — naming the specific, agreed
   interpretation *before* any implementation exists turns the ambiguous
   phrase into a functional requirement precise enough, in Lesson 16's
   sense, for only one correct implementation to exist at all.

## What Breaks Without This

Let two different people build two different features against the same
ambiguous requirement — a signup flow's duplicate check and a monthly
data-cleanup job's duplicate check, say — each implementing whichever
reading seemed reasonable to them individually. Both features work.
Both pass whatever tests their own authors wrote. In production, the
signup flow and the cleanup job silently disagree about how many
distinct contacts exist, and the resulting discrepancy shows up as a
customer-facing mystery — a contact merged in one place and not the
other — with no error, no failing test, and no obvious single piece of
"broken" code anywhere, because nothing was ever actually broken. Two
different, correct answers to two different, unasked questions simply
collided.

## Exercises

1. Write the precise, disambiguated requirement sentence for "remove
   duplicates" that this lesson's third unit gestures at, in full — decide
   explicitly what should happen to the differing name when two contacts
   are merged by email, and state it.
2. Find a requirement sentence from an earlier lesson in this domain
   (Lesson 13's "export contacts as a CSV file" is a good candidate) and
   identify one word or phrase in it that's ambiguous in this lesson's
   precise sense — admitting more than one reasonable reading. Name both
   readings.
3. Implement the disambiguated requirement you wrote in Exercise 1, and
   write acceptance criteria, in Lesson 20's style, that would now
   correctly fail *both* of this lesson's original implementations if
   they didn't match your specific, agreed choice.

## Definition of Done

- [ ] You can define "ambiguous requirement" in your own words, and
      explain why it's different from a requirement someone simply
      misread.
- [ ] You've run both `dedupe_by_email` and `dedupe_by_name_and_email` and
      confirmed the differing counts yourself.
- [ ] You can explain, without notes, why acceptance criteria don't
      resolve ambiguity even though they catch real bugs.
- [ ] You've completed all three exercises.
- [ ] Commit your disambiguated dedupe implementation and its acceptance
      criteria from Exercise 3. Commit message should explain *why*: for
      example, `Lesson 21 — "duplicate" now defined precisely as same
      email address, keeping the most recent name; resolves an ambiguity
      that let two equally valid implementations disagree.`
