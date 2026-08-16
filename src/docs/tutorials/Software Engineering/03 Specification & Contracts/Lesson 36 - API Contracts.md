# Lesson 36: API Contracts

**What you will build.** Lesson 3's `get_account_status` boundary between
Accounts and Growth, given the one thing it never had: a published,
checked statement of exactly which status values it's allowed to return.
Without it, a new status Accounts adds for their own, unrelated reasons
crashes Growth's code, days or weeks later, with a confusing error deep
inside a function that never touched Accounts' internals at all. With
it, the identical change fails immediately, inside Accounts' own code,
with a message telling them exactly what they forgot to do.

**What you need to know first.** Lesson 3's `accounts.py` /
`growth_signup.py` boundary and Lesson 9's coupling — this lesson gives
that boundary the formal contract vocabulary Lessons 28 through 31
built, and shows why a boundary crossed by a different team needs it more
urgently than code one person owns alone.

**Terms introduced in this lesson**

- **API contract** — a function or service's contract specifically at a
  boundary crossed by callers who can't be assumed to read its
  implementation — a different team, a different process, sometimes a
  different company. Everything Lessons 28 through 31 built —
  preconditions, postconditions, closed sets of valid values — still
  applies, but an API contract needs to be *published and checked*, not
  just true of the code, because the people relying on it may never see
  the source at all. Lesson 3 already showed this boundary is as much
  social as technical; an API contract is the artifact that makes the
  technical half actually trustworthy across it.

**Objects and methods used.** None new — this lesson's code uses
already-assumed `assert`, `set` membership, and dict access.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: A Contract Nobody Actually Wrote Down

### The Problem

Lesson 3's `get_account_status` returns a status string — `"active"` or
`"suspended"`, in every example this curriculum has used it. Growth's
code was written against those two values, reasonably:

```python
def can_purchase(username):
    status = get_account_status(username)
    if status == "active":
        return True
    elif status == "suspended":
        return False
    else:
        raise AssertionError("unexpected account status: " + status)
```

Nowhere does either team's code say, explicitly, *"these are the only
two values `get_account_status` will ever return."* It's an assumption,
in exactly Lesson 19's sense — one Growth's code depends on completely,
and one Accounts has no way of knowing exists, because it was never
written down anywhere either team could see it at once.

### The Concept

Confirm the baseline still works:

```python
print(can_purchase("bob"))
```

Running it:

```text
$ python growth_signup.py
True
```

Fine, for now. But "for now" is exactly the danger — this contract lives
only in Growth's own source code, invisible to Accounts, who have every
reason to believe they're free to change their own internal statuses
however they like, since nothing tells them otherwise.

### CS Lens

This is Lesson 19's unstated assumption, moved across the exact
organizational boundary Lesson 3 first drew: there, a single codebase's
own internal assumption was invisible to a second function within the
same team. Here, the assumption is invisible across a boundary between
two *different* teams, which is a strictly harder gap to close by
accident — Growth can't stumble across Accounts' code the way one
function might stumble across another in the same file.

### SE Lens

An internal function's contract can survive being left unwritten a while
longer than an API's, because a single team can still ask each other, or
read each other's code, when something looks wrong. An API crossing a
real organizational boundary, per Lesson 3's own Conway's Law argument,
doesn't have that safety net by default — which is exactly why this
lesson exists as its own domain topic, not a restatement of Lesson 19.

---

## Concept Unit: A New Status, Added in Good Faith, Breaks a Team That Never Knew

### The Problem

Accounts adds a new status, `"pending_verification"`, for a real feature
of their own — nothing to do with Growth, nothing that looks, from
Accounts' side, like it should affect anyone else.

### The Code, Run for Real

```python
_accounts = {"bob": "active", "alice": "suspended", "carol": "pending_verification"}
```

Growth's `can_purchase`, completely unchanged, runs against the new
account:

```python
print(can_purchase("carol"))
```

Here's what actually happens:

```text
$ python growth_signup.py
Traceback (most recent call last):
  File "growth_signup.py", line 17, in <module>
    print(can_purchase("carol"))
  File "growth_signup.py", line 15, in can_purchase
    raise AssertionError("unexpected account status: " + status)
AssertionError: unexpected account status: pending_verification
```

The crash happens inside `can_purchase`, in Growth's own code, days or
weeks after Accounts shipped a change they had every reason to believe
was theirs alone to make. Whoever gets paged for this has to work
backward from a confusing error, in a function that never touched
Accounts' internals, to eventually discover a completely different
team added a completely new status with no announcement.

### CS Lens

This is Lesson 33's finite state machine, missing its own defining
feature: `get_account_status`'s real output was always meant to be a
closed, named set of values — exactly what a state machine's states are
— but nothing about it was ever actually declared that way. Adding a
value to an undeclared set is invisible; adding one to a state machine
without updating its own table is a change with a name and a place to be
caught.

### SE Lens

Nobody did anything unreasonable. Accounts genuinely couldn't know
Growth's code assumed only two statuses would ever exist, because that
assumption was never published anywhere Accounts could see it. This is
precisely the situation an API contract exists to prevent — not by
making people more careful, the same failed strategy Lesson 1 already
rejected, but by giving the assumption a real, checkable place to live.

---

## Concept Unit: Publishing the Contract Where the Change Actually Happens

### The Problem

State the contract explicitly, and check it at the one place a violation
can be caught immediately: inside `get_account_status` itself, the
moment a new, undocumented status is about to leave the boundary at all.

### The New Code

```python
ACCOUNT_STATUSES = {"active", "suspended"}

def get_account_status(username):
    status = _accounts[username]
    assert status in ACCOUNT_STATUSES, (
        f"contract violation: get_account_status returned undocumented status {status!r}; "
        f"add it to ACCOUNT_STATUSES and notify callers before shipping"
    )
    return status
```

Run the identical scenario — `"carol"`, with her new,
`"pending_verification"` status — against this version:

```python
print(get_account_status("carol"))
```

Here's what actually happens:

```text
$ python accounts.py
Traceback (most recent call last):
  File "accounts.py", line 14, in <module>
    print(get_account_status("carol"))
  File "accounts.py", line 8, in get_account_status
    assert status in ACCOUNT_STATUSES, (
AssertionError: contract violation: get_account_status returned undocumented status 'pending_verification'; add it to ACCOUNT_STATUSES and notify callers before shipping
```

The failure moved. It's no longer discovered in Growth's code, days
later, by whoever happens to notice `can_purchase` crashing. It happens
immediately, inside `accounts.py`, the moment the new status is actually
introduced — caught by the team making the change, with a message
telling them precisely what they forgot: update the published contract,
and tell whoever depends on it, before this ships anywhere near Growth's
code at all.

### Mechanical Walkthrough

- `ACCOUNT_STATUSES = {"active", "suspended"}` — the contract, made real:
  a `set`, sitting in `accounts.py` itself, that any developer working on
  that file can see, right next to the function whose output it
  constrains.
- `assert status in ACCOUNT_STATUSES, ...` — already-assumed `assert` and
  `in`; the postcondition, in exactly Lesson 29's sense, now lives inside
  the function it describes, checked on every single call, not only
  documented in a comment someone might not read.

### CS Lens

This is Design by Contract, Lesson 31's own vocabulary, applied at
exactly the seam Lesson 3 identified as organizationally real: the
postcondition on `get_account_status` isn't just a nice internal
discipline anymore — it's the mechanism that turns a silent, cross-team
assumption into a loud, immediately-attributable failure, caught by
whoever's actually in a position to fix it.

### SE Lens

This costs Accounts something real and worth naming: they can no longer
add a new status casually — `ACCOUNT_STATUSES` now has to be updated
deliberately, and this exact assertion will stop them from shipping
otherwise. That's not friction to eliminate. It's the price of an API
actually meaning what it promises, and it's a direct, mechanical
implementation of Lesson 3's own conclusion: crossing this boundary
should never again be silent.

---

## Connect the Pieces

One boundary, one unpublished assumption, one contract made real:

1. **The unwritten contract** — `get_account_status` was always meant to
   return only `"active"` or `"suspended"`, known only inside Growth's
   own code.
2. **A silent break, discovered far from its cause** — Accounts adds
   `"pending_verification"` in good faith; `can_purchase` crashes days
   later, with no clue pointing back at Accounts' change.
3. **The contract, published and checked at its source** —
   `ACCOUNT_STATUSES`, checked inside `get_account_status` itself, turns
   the identical change into an immediate, correctly-attributed failure,
   caught by the team that can actually fix it.

## What Breaks Without This

Keep every API's real contract implicit — living only in whichever
caller's code happens to assume it — across a real organization with
dozens of teams and hundreds of boundaries like this one. Every
individual team, examined alone, is doing reasonable work. Silent breaks
like this lesson's own `"pending_verification"` accumulate constantly,
each one discovered the same expensive way: not at its source, but
downstream, in someone else's code, by someone who has to work backward
through a confusing failure to find a change they were never told about.

## Exercises

1. Add a real workflow to `accounts.py`: a new `"pending_verification"`
   status that should legitimately exist, updating `ACCOUNT_STATUSES` to
   include it *and* updating `can_purchase` to handle it correctly.
   Confirm both functions agree on the new status with real output.
2. Write the full API contract, in prose, for Lesson 14's
   `export_contacts_csv` as it would need to be published for a
   different team building against it — precondition, postcondition, and
   the closed set of possible outcomes.
3. Explain, in a few sentences, why checking `ACCOUNT_STATUSES` inside
   `get_account_status` itself is a better place to catch this mistake
   than checking it inside `can_purchase`, even though both would
   eventually catch the same underlying problem.

## Definition of Done

- [ ] You can define "API contract" in your own words, and explain why
      it needs to be published and checked, not just true.
- [ ] You've reproduced the real cross-team failure and confirmed the
      published contract catches it at its actual source.
- [ ] You've completed all three exercises.
- [ ] Commit `ACCOUNT_STATUSES` and the updated `get_account_status`.
      Commit message should explain *why*: for example, `Lesson 36 —
      get_account_status now checks its return value against a published
      set of valid statuses, so an undocumented new status fails at its
      source instead of inside an unrelated caller.`
