# Lesson 19: Assumptions

**What you will build.** A working, correct `is_username_available`,
untouched, sitting on top of a fact nobody ever wrote down: that
`existing_usernames` only ever contains already-normalized names. A
second, separately written tool — a bulk import feature, built later, by
someone with no reason to know that fact existed — silently breaks it,
without touching `is_username_available` at all. The transferable
problem: some of the facts a system's correctness depends on were never
stated as requirements, never imposed as constraints, and never verified
by any code — they were simply assumed, by whoever built the first piece
that relied on them, and every piece built afterward inherits the risk of
never having been told.

**What you need to know first.** Lesson 2's `is_username_available` and
its normalization fix, and Lesson 18's constraints — this lesson
introduces a fourth, genuinely different category, and shows precisely
why it's the most dangerous of the four to leave unexamined.

**Terms introduced in this lesson**

- **assumption** — something taken to be true, without being explicitly
  stated or checked, that a system's correctness silently depends on. An
  assumption differs from a requirement (agreed to and written down) and
  from a constraint (imposed from outside, usually known by name, per
  Lesson 18) — it's dangerous specifically because nobody ever decided to
  document it. It became true by accident, the first time some piece of
  code happened to rely on it, and stays true only for as long as every
  future piece of code touching the same data keeps relying on it too,
  whether or not anyone told them to.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax, including `set.add`, already covered by Lesson
10's coupon example.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: A Fact Nobody Wrote Down, That Everything Depends On

### The Problem

Lesson 2 fixed `is_username_available` so that `"Alice"` and `"alice"`
correctly collide, by normalizing both sides of the comparison. Read that
fixed version again, closely: what does it actually require to be true
about `existing_usernames` for that fix to keep working?

### The Concept

```python
def normalize_username(username):
    return username.strip().lower()

def is_username_available(username, existing_usernames):
    return normalize_username(username) not in existing_usernames
```

This function normalizes the *incoming* username before checking it. It
does nothing at all to normalize what's already sitting inside
`existing_usernames` — it simply trusts that everything already stored
there arrived normalized too. That trust was never written down as a
requirement anywhere Lesson 2 built. It was never handed down as a
constraint by anyone outside the problem, the way Lesson 18's password
rule was. It's an **assumption**: a fact — "every entry in
`existing_usernames` is already normalized" — that `is_username_available`
depends on completely, that nothing in this codebase currently checks,
enforces, or even states out loud.

### CS Lens

This is Lesson 10's local reasoning, examined from its blind spot: reading
`is_username_available` alone tells you everything about what it does
with its own arguments, exactly as Lesson 10 argued it should. It tells
you nothing about whether the *data* handed to it was prepared the way it
expects — that's not a fact about this function, it's a fact about every
other piece of code that ever touches `existing_usernames`, and none of
that is visible from here.

### SE Lens

Nothing about `is_username_available` needs to change to remove this
assumption's *risk* — the danger isn't in this function, it's in the
silence around it. The realistic failure mode isn't a mistake in this
code; it's a second, completely reasonable piece of code, written later
by someone with no way to know this assumption exists, that quietly
breaks it. That's exactly what the next unit builds.

---

## Concept Unit: A Second, Reasonable Piece of Code Breaks It

### The Problem

Months later, a real, separate feature is requested: bulk-importing a
list of usernames from a spreadsheet, all at once. Someone builds it,
using `existing_usernames` directly — reasonably, since that's exactly
what it's for.

### The Code, Run for Real

```python
def bulk_import(usernames, existing_usernames):
    for username in usernames:
        existing_usernames.add(username)
```

Run it, then check availability the normal way:

```python
existing_usernames = {"alice", "bob"}
bulk_import(["Dave"], existing_usernames)
print(existing_usernames)
print(is_username_available("dave", existing_usernames))
```

Running it:

```text
$ python usernames.py
{'bob', 'Dave', 'alice'}
True
```

`"Dave"` — capital D, exactly as it appeared in the import spreadsheet —
is sitting in `existing_usernames` unnormalized. Checking `"dave"`
(lowercase, the way a new signup would naturally arrive) against it comes
back `True` — available — which is exactly the collision
`is_username_available` was fixed, back in Lesson 2, to prevent. Nothing
about `bulk_import` is wrong on its own terms: it does exactly what "add
these usernames to the existing set" says, correctly. Nothing about
`is_username_available` changed at all — it's the identical function from
the previous unit. The assumption it depends on simply stopped being
true, from a direction it had no way to see coming.

### Mechanical Walkthrough

- `existing_usernames.add(username)` inside `bulk_import` — already-
  assumed `set.add`; the only new fact worth naming is what it *doesn't*
  do: nothing here normalizes `username` before storing it, because
  nothing told `bulk_import`'s author that normalization was ever
  required at all.
- `is_username_available("dave", existing_usernames)` — the identical
  call shape as every earlier lesson's use of this function; its
  behavior changed not because this call changed, but because the data
  it's checking against silently stopped honoring an assumption it was
  never told to honor.

### CS Lens

This is Lesson 9's tight-coupling failure, from a new angle: there, one
function reached directly into another's private data and broke when
that data's shape changed. Here, two functions never reach into each
other at all — `bulk_import` and `is_username_available` share nothing
but the same `set` — and the break still happens, because coupling
through *shared data with unstated rules* is exactly as real a dependency
as coupling through a private field, even though nothing about the code
itself looks connected.

### SE Lens

The realistic alternative to this failure isn't "always remember every
assumption while writing new code" — that doesn't scale past one person
holding the entire system's unwritten rules in their head, which is
precisely the failure mode that just played out. The actual fix has to
make the assumption impossible to accidentally violate, not merely
easier to remember, which is what the next unit builds.

---

## Concept Unit: Turning the Assumption Into Something Enforced

### The Problem

`existing_usernames` needs exactly one rule respected everywhere it's
ever written to: only normalized names go in. How do you make that true
without trusting every future author to remember it?

### The New Code

```python
def register_username(username, existing_usernames):
    existing_usernames.add(normalize_username(username))
```

Route both the original signup path and `bulk_import` through it instead
of touching `existing_usernames` directly:

```python
def bulk_import(usernames, existing_usernames):
    for username in usernames:
        register_username(username, existing_usernames)
```

Run the identical scenario that broke in the previous unit:

```python
existing_usernames = {"alice", "bob"}
bulk_import(["Dave"], existing_usernames)
print(existing_usernames)
print(is_username_available("dave", existing_usernames))
```

Running it:

```text
$ python usernames.py
{'dave', 'bob', 'alice'}
False
```

`"Dave"` is stored as `"dave"`, normalized on the way in. Checking
`"dave"` now correctly returns `False` — taken, exactly as it should be.

### The Concept

Nothing about this fix relies on `bulk_import`'s author remembering an
unwritten rule — it relies on there being exactly one real way to add a
username to `existing_usernames`, `register_username`, which normalizes
every single time, regardless of who's calling it or why. This is the
actual discipline this lesson is teaching: an assumption stops being
dangerous not when it's written down in a comment — comments can be
skipped, missed, or go stale — but when it's made structurally impossible
to violate, the same way Lesson 8's separated `is_password_valid`
couldn't drift out of sync once both features called the same real
function instead of each carrying their own copy of the rule.

### CS Lens

This is the same move as Lesson 1's `.get()` fix, generalized: there, a
single function was changed to correctly handle a case it used to crash
on. Here, the fix isn't inside any one function that reads
`existing_usernames` — it's a single, enforced gateway for anything that
*writes* to it, which is a more general, more durable version of the same
underlying idea: don't just handle the bad case when you see it, remove
the path that lets the bad case happen at all.

### SE Lens

This lesson's fix cost one new function and two call sites updated to use
it — small, here, because this system is still small. In a real,
larger codebase, `existing_usernames` might be written to from a dozen
different places, built over years by people who never talked to each
other, which is exactly the situation where an unexamined assumption like
this one causes real, hard-to-trace production bugs — discovered, as this
lesson's own example showed, nowhere near the code that actually violated
them.

---

## Connect the Pieces

One assumption, invisible until a second, unrelated feature violated it:

1. **The assumption, unstated** — `is_username_available` silently trusts
   that everything in `existing_usernames` is already normalized; nothing
   requires it, checks it, or says so.
2. **A reasonable feature breaks it** — `bulk_import`, built later by
   someone with no reason to know the assumption existed, stores `"Dave"`
   unnormalized; `is_username_available("dave", ...)` incorrectly returns
   `True`, reproduced for real.
3. **The fix makes it structural, not remembered** — `register_username`
   becomes the one real way to add a username; both `bulk_import` and any
   future caller inherit the correct behavior automatically, verified by
   the identical scenario now returning `False`.

## What Breaks Without This

Leave `existing_usernames` open to direct `.add()` calls from anywhere,
trusting every future author to remember to normalize first. The system
works exactly as intended for as long as every single person who ever
touches this code happens to know an unwritten rule that exists nowhere
in writing. The first time that streak breaks — a new hire, a rushed
fix, a tool built by a different team entirely — produces exactly this
lesson's own bug: two usernames, differing only in case, both technically
"available," both eventually registered, colliding in a way
`is_username_available`'s own code was specifically built, back in
Lesson 2, to prevent.

## Exercises

1. Add a second bulk-import-style feature of your own — a "restore from
   backup" function — and confirm, by running it, that routing it through
   `register_username` keeps the normalization guarantee intact
   automatically, with no new normalization logic written a second time.
2. Look back at Lesson 18's `create_account`/`hash_password`. Name one
   real assumption that code depends on but never states or enforces
   (hint: think about what `check_password` assumes is true about how
   every account in the system was actually created).
3. Pick any function from this curriculum so far that reads from a shared
   collection (a `set`, `dict`, or list) it didn't itself populate. Name
   one assumption it's making about that collection's contents, and
   whether anything in the code actually enforces it.

## Definition of Done

- [ ] You can define "assumption" in your own words, and explain how it
      differs from a requirement and from a constraint.
- [ ] You've reproduced the `bulk_import` bug and confirmed
      `register_username` fixes it.
- [ ] You've completed all three exercises.
- [ ] Commit `register_username` and the updated `bulk_import`. Commit
      message should explain *why*: for example, `Lesson 19 —
      centralized username insertion through register_username so the
      normalization assumption can't be silently violated by future
      code.`
