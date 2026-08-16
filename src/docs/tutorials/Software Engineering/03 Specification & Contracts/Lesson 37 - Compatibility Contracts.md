# Lesson 37: Compatibility Contracts

**What you will build.** A real rename inside `accounts.py` — Accounts
wants to call their own internal status `"on_hold"` instead of
`"suspended"`, a more accurate name for what it now means — done first
the naive way, which Lesson 36's own contract check catches as an
immediate, correctly-attributed violation, and then done again in a way
that lets Accounts use their new, better internal name while Growth's
`can_purchase`, completely unchanged, keeps working exactly as before.

**What you need to know first.** Lesson 36's `ACCOUNT_STATUSES` contract
check — this lesson asks what happens when the team that owns an API
contract needs to *change* it, and shows that Lesson 36's guard, built to
catch accidental violations, also correctly catches a deliberate one that
was never made compatible with existing callers.

**Terms introduced in this lesson**

- **compatibility contract** — a promise that a change to an API's
  implementation will not break code already written against its
  previously published contract. Where Lesson 36's API contract stated
  what an API promises *right now*, a compatibility contract adds a
  second, temporal promise: that changing the API later won't silently
  break whoever already depends on today's version. The most common
  direction this takes is **backward compatibility** — a new version
  continuing to support callers written against the old one — which is
  this lesson's own subject.

**Objects and methods used.** `dict.get(key, default)`, already given
full treatment in Lesson 1, reused here for a new purpose: translating an
internal value into whatever the published contract still promises.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: A Contract's Own Guard Catches a Deliberate Break

### The Problem

Accounts decides `"suspended"` was never quite the right word for what
that status actually means, and renames it internally to `"on_hold"` —
a real, reasonable improvement, made directly against `_accounts`.

### The Code, Run for Real

```python
_accounts = {"bob": "active", "alice": "on_hold"}
```

Run `can_purchase`, Growth's function from Lesson 36, completely
unchanged, against this renamed data:

```python
print(can_purchase("alice"))
```

Here's what actually happens:

```text
$ python accounts.py
Traceback (most recent call last):
  File "accounts.py", line 19, in <module>
    print(can_purchase("alice"))
  File "accounts.py", line 11, in can_purchase
    status = get_account_status(username)
  File "accounts.py", line 7, in get_account_status
    assert status in ACCOUNT_STATUSES, "contract violation: undocumented status " + repr(status)
AssertionError: contract violation: undocumented status 'on_hold'
```

Lesson 36's own guard — built specifically to catch an undocumented
status leaving the boundary — catches this immediately, correctly,
inside `accounts.py` itself, exactly the way it's supposed to. But notice
what this actually reveals: the guard can tell Accounts *that* they broke
the contract. It can't tell them how to make the change they actually
want without breaking it.

### CS Lens

This is Lesson 26's requirements change, one layer deeper: there, a
change request was handled correctly by finding every affected
implementation through traceability. Here, the "affected implementation"
isn't a second copy of the same rule — it's every external caller who
already depends on today's contract, a much larger and less enumerable
set than Lesson 24's two tagged files.

### SE Lens

The realistic mistake here isn't making the rename — `"on_hold"`
genuinely might be the better name, and Accounts owns the right to
improve their own internal vocabulary. The mistake would be assuming
"internal" and "compatible" are the same claim: Lesson 9 already showed
that internal representation is free to change as long as the published
interface doesn't; this lesson shows that the published interface
includes not just the function's *shape*, but the actual *values* it
promises to return.

---

## Concept Unit: Renaming Internally Without Breaking the Promise

### The Problem

Let Accounts use `"on_hold"` as their real, internal name for the
status, while `get_account_status` keeps its promise to Growth
completely intact.

### The New Code

```python
STATUS_COMPATIBILITY_MAP = {"on_hold": "suspended"}

def get_account_status(username):
    internal_status = _accounts[username]
    published_status = STATUS_COMPATIBILITY_MAP.get(internal_status, internal_status)
    assert published_status in ACCOUNT_STATUSES, "contract violation: undocumented status " + repr(published_status)
    return published_status
```

Run the identical call from the previous unit:

```python
print(can_purchase("alice"))
print(get_account_status("alice"))
```

Running it:

```text
$ python accounts.py
False
suspended
```

`can_purchase`, still completely unchanged since Lesson 36, correctly
returns `False`. `get_account_status("alice")` returns `"suspended"` —
the old, published value — even though `_accounts` itself now stores
`"on_hold"`. Accounts got their better internal name. Growth never had to
know anything changed at all.

### Mechanical Walkthrough

- `STATUS_COMPATIBILITY_MAP = {"on_hold": "suspended"}` — a real,
  explicit translation table, sitting directly next to
  `ACCOUNT_STATUSES`; this is the **compatibility contract**, made
  concrete: a stated mapping from the new internal reality to the old
  published promise.
- `STATUS_COMPATIBILITY_MAP.get(internal_status, internal_status)` —
  already-assumed `dict.get` with a default, given full treatment in
  Lesson 1; the specific idea worth naming is the default itself:
  `internal_status` — any status *not* listed in the compatibility map
  passes through unchanged, so this line only translates the specific
  values that actually need it, without needing to enumerate every
  status that doesn't.
- The `assert` line, unchanged from Lesson 36 — still checking
  `published_status`, not `internal_status`, against `ACCOUNT_STATUSES`:
  the contract check now runs against exactly what actually leaves the
  boundary, which is what makes it correctly pass this time.

### CS Lens

This is a real, direct instance of an **adapter** — a small piece of code
whose entire job is translating one shape or vocabulary into a different
one that something else already depends on, without either side needing
to change. The same shape recurs anywhere a system's internals evolve
faster than everything depending on it can be updated: a database
migration keeping an old column name as a view over a renamed real one; a
library's new major version shipping a thin compatibility layer over its
old function names.

### SE Lens

This costs something real and ongoing: `STATUS_COMPATIBILITY_MAP` is a
permanent piece of code that exists purely to preserve a promise, not to
do any of the system's real work, and it has to be remembered and
eventually retired once Growth (or whoever else depends on `"suspended"`)
has actually moved to the new name — a real process this curriculum's
later material on deprecation and versioning covers in full. Skipping it
entirely and breaking Growth outright would have been faster today and
more expensive the moment it shipped, exactly Lesson 5's cost-of-change
curve again, now applied specifically to changing a promise instead of
fixing a mistake.

---

## Connect the Pieces

One internal rename, one contract, kept intact on purpose:

1. **The naive break, caught by the very guard built to catch it** —
   renaming `"suspended"` to `"on_hold"` internally trips Lesson 36's own
   `ACCOUNT_STATUSES` assertion immediately.
2. **The compatible version** — `STATUS_COMPATIBILITY_MAP` translates the
   new internal name back to the old published one at the exact point it
   crosses the boundary, verified by `can_purchase` continuing to work
   completely unchanged.
3. **The real cost, named honestly** — a compatibility contract isn't
   free; it's a real, deliberate piece of ongoing code, kept until
   everyone depending on the old promise has actually moved off it.

## What Breaks Without This

Ship the naive rename directly to production, past whatever check might
have existed, reasoning that "on_hold" is obviously a better name and
Growth will just have to update their code. Growth doesn't know the
change happened until `can_purchase` starts raising real exceptions for
every account on hold — in production, not in a lesson's own reproduced
traceback — and the fix now requires an emergency coordination between
two teams instead of a compatibility layer Accounts could have written
in the same sitting as the rename itself.

## Exercises

1. Add a second internal rename — `"active"` becomes `"in_good_standing"`
   — to `STATUS_COMPATIBILITY_MAP`, and confirm `can_purchase` still
   returns `True` for an active account with no changes to Growth's code
   at all.
2. Write, in a sentence or two, what would have to be true before
   Accounts could safely delete `STATUS_COMPATIBILITY_MAP` entirely and
   have `get_account_status` return `"on_hold"` directly.
3. Look back at Lesson 22's `view_contact`/`export_contacts_csv` split.
   If Compliance later needed to rename the `restricted` field itself,
   what compatibility contract would need to exist for every caller of
   both functions to keep working?

## Definition of Done

- [ ] You can define "compatibility contract" in your own words, and
      explain how it differs from Lesson 36's API contract.
- [ ] You've reproduced the naive break and confirmed the compatibility-
      mapped version keeps `can_purchase` working unchanged.
- [ ] You've completed all three exercises.
- [ ] Commit `STATUS_COMPATIBILITY_MAP` and the updated
      `get_account_status`. Commit message should explain *why*: for
      example, `Lesson 37 — accounts renamed "suspended" to "on_hold"
      internally; a compatibility map keeps get_account_status's
      published contract unchanged for existing callers.`
