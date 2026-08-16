# Lesson 30: Invariants

**What you will build.** A direct, standalone check for the exact
guarantee Lesson 19 spent an entire lesson protecting — "every entry in
`existing_usernames` is already normalized" — written not as a gate that
prevents bad entries from getting in, but as a question you can ask the
collection at any moment: *is this true, right now?* You'll confirm it
holds after `register_username` does its job, and then watch it catch a
violation the moment something else — a second, careless line of code —
reaches around the gate entirely.

**What you need to know first.** Lesson 28's precondition and Lesson
29's postcondition, and Lesson 19's `register_username` — this lesson
introduces the third member of the same family, and reuses Lesson 19's
own guarantee as its worked example.

**Terms introduced in this lesson**

- **invariant** — a condition that must remain true at every point a
  piece of data or a system is considered valid — not checked once at
  entry, like a precondition, or once at exit, like a postcondition, but
  true continuously, checkable at any moment, before and after every
  operation permitted to touch it. Lesson 19's fix — routing every
  addition through `register_username` — was already an invariant in
  spirit: "everything in `existing_usernames` is normalized" was meant to
  hold at all times. This lesson gives that guarantee a name, and,
  because an invariant is a claim about a *standing* state rather than
  one function call, builds something Lesson 19 never had: a way to ask
  directly whether it currently holds, independent of trusting the
  mechanism that's supposed to preserve it.

**Objects and methods used.** None new — this lesson's invariant check
uses already-assumed iteration and comparison, and Python's `!=` string
formatting (`{value!r}`), reused from earlier f-string usage without
comment.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: A Guarantee That Was Never Directly Askable

### The Problem

Lesson 19 made sure `existing_usernames` only ever gains normalized
entries, by giving it exactly one real way in: `register_username`. Given
some `existing_usernames` set, sitting in memory right now, is there any
way to ask, directly, whether that guarantee is actually true of it — or
only to trust that it must be, because every known path in only ever went
through the right function?

### The Concept

There isn't, yet — Lesson 19's fix is a real, working piece of
*prevention*, not a way to *check*. Those are different capabilities.
Prevention stops future violations through the one gate every legitimate
caller is expected to use. Checking answers a narrower, more direct
question about the data's current, actual state, independent of whatever
path it took to get there — useful precisely when something didn't go
through the gate, whether by a bug, a rushed fix, or data that existed
before the gate was ever built. That question — is this **invariant**
true, right now — deserves a real, standalone answer.

### CS Lens

This is the same relationship as Lesson 28's precondition to a real
runtime type check: a precondition prevents a specific call from
proceeding with bad input; a full, standalone check can inspect a value's
actual current state independent of how it arrived, which matters
whenever a value might have come from somewhere the precondition never
had a chance to guard.

### SE Lens

The realistic risk of relying on prevention alone is exactly the failure
Lesson 19's own `bulk_import` demonstrated once already: a second,
independently reasonable piece of code, with no reason to know a gate
existed, can bypass it entirely. A direct, standalone invariant check
doesn't prevent that — nothing can prevent every possible bypass — but it
gives you a way to *find out* the moment one happens, rather than
discovering it only when a downstream symptom, like Lesson 2's case-
sensitivity collision, shows up somewhere else entirely.

---

## Concept Unit: Asking the Question Directly

### The Problem

Write the invariant check itself, and confirm it holds for data that went
through the proper gate.

### The New Code

```python
def check_normalized_invariant(existing_usernames):
    for username in existing_usernames:
        assert username == normalize_username(username), f"invariant violated: {username!r} is not normalized"
    return True
```

Run it against a set built the correct way:

```python
existing_usernames = {"alice", "bob"}
register_username("Carol", existing_usernames)
print(existing_usernames)
print("invariant holds:", check_normalized_invariant(existing_usernames))
```

Running it:

```text
$ python usernames.py
{'bob', 'carol', 'alice'}
invariant holds: True
```

`"Carol"` was correctly normalized to `"carol"` by `register_username`,
and the invariant check confirms it, directly, by inspecting the actual
set — not by trusting that `register_username` was the only thing that
ever touched it.

### Mechanical Walkthrough

- `for username in existing_usernames:` — already-assumed iteration over
  a `set`; the invariant check has to examine *every* element, because a
  claim about "always true" is only actually verified by checking all of
  it, not a sample.
- `username == normalize_username(username)` — already-assumed equality
  and function call; this is the invariant's real content, restated as a
  literal, checkable comparison: a string is normalized exactly when
  normalizing it again changes nothing.
- `f"invariant violated: {username!r} is not normalized"` — already-
  assumed f-string syntax; `!r` renders the value using `repr()` rather
  than `str()`, which matters here specifically because it shows quote
  marks around the string, making it visually obvious in the error
  message that `username` is text, not some other type.

### CS Lens

This is a real, direct instance of a class invariant in the sense formal
specification traditions use the word: a condition an object or piece of
data is expected to satisfy at every moment it's considered valid,
checked independently of the specific operation that last touched it.

### SE Lens

Writing `check_normalized_invariant` cost a few lines and pays for itself
specifically in exactly the situation Lesson 19 already lived through
once: it doesn't prevent a bypass, but it turns "is our data currently
consistent" from an assumption into a real, runnable question — one worth
asking after a suspicious change, during debugging, or as part of a
test, independent of whether the code that produced the current state is
even fully understood yet.

---

## Concept Unit: Catching a Bypass the Gate Alone Couldn't Stop

### The Problem

Simulate exactly the failure Lesson 19 already demonstrated once —
something adding to `existing_usernames` directly, bypassing
`register_username` — and see whether the invariant check actually
catches it.

### Run It — Watch It Fail

```python
existing_usernames.add("Dave")
print(existing_usernames)
check_normalized_invariant(existing_usernames)
```

Here's what actually happens:

```text
$ python usernames.py
{'Dave', 'bob', 'carol', 'alice'}
Traceback (most recent call last):
  File "usernames.py", line 20, in <module>
    check_normalized_invariant(existing_usernames)
  File "usernames.py", line 9, in check_normalized_invariant
    assert username == normalize_username(username), f"invariant violated: {username!r} is not normalized"
AssertionError: invariant violated: 'Dave' is not normalized
```

Immediate, specific, correct: `'Dave'`, capital D, named exactly, the
instant the check runs. Nothing about this required knowing *which* line
of code added `"Dave"` without normalizing it — `check_normalized_invariant`
doesn't inspect `bulk_import` or any other caller at all. It only asks
the data itself whether the guarantee currently holds, and answers
honestly the moment it doesn't.

### The Concept

This is the actual value an invariant delivers beyond prevention: a
real, working answer to "has anything gone wrong here" that doesn't
depend on already knowing where to look. Lesson 19's `register_username`
answers "how do we stop this from happening"; this lesson's
`check_normalized_invariant` answers a different, complementary question
— "did it happen anyway" — and answers it by looking at the data's actual
current state, which is the only place a real violation can ever
actually be found once it's already occurred.

### CS Lens

This is the same relationship testing (running code and checking its
output) has to formal verification (proving a property holds for every
possible execution): `register_username` is analogous to a design that's
*intended* to preserve the invariant; `check_normalized_invariant` is a
real, if partial, way to actually confirm it, on real data, rather than
trusting the design's intention alone.

### SE Lens

A real system would run a check like this one regularly — as part of a
test suite, a scheduled data-integrity job, or a debugging step when
something looks wrong — not as a replacement for `register_username`, but
alongside it. Prevention and checking are complementary, not competing:
prevention reduces how often the invariant breaks; checking is what
actually tells you if it did anyway.

---

## Connect the Pieces

One guarantee, checked directly instead of only trusted:

1. **The guarantee, unaskable before this lesson** — Lesson 19 prevented
   violations but never provided a way to directly confirm the data was
   actually still consistent.
2. **Confirmed true for correctly-built data** — `check_normalized_invariant`
   holds silently after `register_username` does its job.
3. **Caught the instant it's violated** — a direct `.add("Dave")`,
   bypassing the gate exactly the way Lesson 19's `bulk_import` once did,
   is caught immediately and named precisely.

## What Breaks Without This

Trust `register_username` alone, with no way to independently ask
whether `existing_usernames` is actually still consistent. A future bug
— a new admin tool, a data migration, a manual fix run once in a
production console — adds an unnormalized entry the same way `bulk_import`
once did. Nothing announces it. The system keeps running, and the only
way anyone finds out is the same way Lesson 19's own bug was originally
found: a downstream symptom, days or weeks later, with no direct way to
ask the data itself what actually went wrong.

## Exercises

1. Write an invariant check for Lesson 18's account-creation constraint:
   every stored account must have a `password_hash` field and must *not*
   have a raw `password` field. Run it against a correctly created
   account, then against one built the naive, non-compliant way from
   Lesson 18, and confirm it catches the difference.
2. `check_normalized_invariant` currently checks every element on every
   call, which costs more the larger `existing_usernames` gets. Describe,
   in a sentence or two, one realistic situation where you'd want to run
   this check, and one where the cost wouldn't be worth it.
3. Explain, in your own words, why an invariant check and a postcondition
   (Lesson 29) are different tools, even though both use `assert` the
   same way — think about *when* each one is meaningful to run.

## Definition of Done

- [ ] You can define "invariant" in your own words, and explain how it
      differs from both a precondition and a postcondition.
- [ ] You've run `check_normalized_invariant` yourself against both valid
      and invalid data, reproducing the real pass and the real failure.
- [ ] You've completed all three exercises.
- [ ] Commit `check_normalized_invariant`. Commit message should explain
      *why*: for example, `Lesson 30 — added a standalone invariant check
      for username normalization, so a bypass of register_username can
      be caught directly instead of only inferred from a downstream
      symptom.`
