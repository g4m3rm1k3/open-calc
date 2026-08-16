# Lesson 58: Coupling

**What you will build.** A checkout flow computes "this is activity
number N for this session" by reading `len(customer_activity.
activity_log)` directly, then calling `log_order_activity` separately. A
completely unrelated nightly cleanup job clears that same shared list
between the read and the log call, and checkout's own claim about which
number activity this was comes out wrong — not because either function
has a bug in it alone, but because both were reaching into the same
shared, mutable, global list without either one knowing about the
other. This lesson fixes it by making `log_order_activity` compute and
return the position itself, atomically, so no caller ever reads the
shared list's state separately from the one function that owns it. The
transferable problem: Lesson 56 named that a dependency exists between
two pieces of code; this lesson names how *much* two pieces of code
actually need to know about each other to work correctly together — and
sharing raw, mutable state directly is the tightest, most fragile way
two unrelated pieces of code can end up coupled.

**What you need to know first.** Dependency (Lesson 56) — the precise
relationship this lesson now measures the tightness of. Dependency
Direction (Lesson 57) — a different axis of the same relationship;
direction asks which way it points, this lesson asks how much either
side needs to know about the other regardless of direction. Aggregates
(Lesson 49) — private, guarded internal state as the general shape this
lesson's fix reuses, now applied to a module-level list instead of an
object's own field.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Design** stage. Carried through: this lesson measures the
same kind of relationship Lessons 56 and 57 already named and pointed —
now asking how tightly bound the two sides actually are, the same
question the *Testing & Verification* domain, much further down this
pipeline, will depend on directly: tightly coupled code through shared
mutable state is exactly the shape that makes tests unpredictable
depending on what order they run in.

**Terms introduced in this lesson.** One line each.

- **coupling** — how much one piece of code needs to know about
  another's internal details, state, or exact shape in order to work
  correctly with it. It's distinguished from Lesson 56's dependency by
  degree, not existence: two pieces of code can depend on each other
  while barely knowing anything about each other's internals, or while
  knowing everything about them, and coupling names where a given
  relationship actually falls on that scale.
- **common coupling** — two or more pieces of code interacting
  indirectly by both reading and writing the same shared, mutable state,
  rather than passing data explicitly between each other. It's one of
  the tightest, most dangerous forms of coupling, because neither side
  can reason correctly about the shared state's value without knowing
  about everything else in the entire program that might also be
  touching it — often code with no other real relationship to it at all.
- **data coupling** — two pieces of code interacting only by passing the
  specific data one actually needs to the other, through an explicit
  parameter or return value. It's named as the loosest practical form of
  coupling for two pieces of code that genuinely need to exchange
  information — the goal this lesson's fix moves toward.

**Objects and methods used.** None new — this lesson's fix reuses the
leading-underscore, guarded-access shape already established in Lessons
49 and 53, applied here to a module-level list instead of an object's
field or a module's dict.

## Concept Unit: Two Unrelated Functions, One Shared List

### The Problem

`customer_activity.py`'s activity log is a plain, public, module-level
list. A checkout function reads its length directly to compute which
number activity a new entry will be, then logs it:

```python
activity_log = []


def log_order_activity(customer_id, message):
    activity_log.append((customer_id, message))


def checkout_place_order(customer_id, order_id):
    position = len(customer_activity.activity_log) + 1
    customer_activity.log_order_activity(customer_id, f"order {order_id} placed")
    print(f"order {order_id} is activity #{position} for this session")


def nightly_cleanup():
    customer_activity.activity_log.clear()
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running a checkout, then an unrelated
cleanup job, then a second checkout:

```python
customer_activity.log_order_activity(11, "order 401 placed")
customer_activity.log_order_activity(12, "order 402 placed")

checkout_place_order(17, 501)
nightly_cleanup()
checkout_place_order(18, 502)
```

Running it produces:

```
order 501 is activity #3 for this session
order 502 is activity #1 for this session
```

`checkout_place_order` has no bug in it, read on its own. Neither does
`nightly_cleanup`. Neither function even knows the other exists —
`nightly_cleanup` isn't part of checkout at all, and has no reason to
be. But both directly read and write the exact same shared, mutable
list, and `checkout_place_order`'s own claim, "activity #1," happens to
be true only by coincidence — it computed `position` by reading the
list's length *before* logging, and something entirely unrelated to
checkout emptied that list in between the read and the append,
invalidating the assumption without either function doing anything
individually wrong.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `customer_activity` module, not a port of an
  external reference codebase.
- **Files affected:** `customer_activity.py`, modified.
- **Change type:** refactor — `activity_log` becomes private,
  `_activity_log`; `log_order_activity` computes and returns the
  position itself, as one atomic operation.
- **Location:** module level in `customer_activity.py`.
- **Dependencies:** none.

### The New Code

The smallest new piece is the return value that closes the gap between
"read the length" and "append":

```python
def log_order_activity(customer_id, message):
    _activity_log.append((customer_id, message))
    return len(_activity_log)
```

### The Updated Project

`activity_log` is renamed private, and `checkout_place_order` no longer
reads it directly at all — it gets the position from the one function
that actually owns the list:

```python
_activity_log = []                                          # ← renamed from activity_log


def log_order_activity(customer_id, message):
    _activity_log.append((customer_id, message))
    return len(_activity_log)                                # ← new


def checkout_place_order(customer_id, order_id):
    position = log_order_activity(customer_id, f"order {order_id} placed")  # ← changed
    print(f"order {order_id} is activity #{position} in the log")


def nightly_cleanup():
    _activity_log.clear()
```

`checkout_place_order` no longer performs its own separate read of the
list's length at all — `position` comes directly from
`log_order_activity`'s own return value, computed at the exact moment
the entry was actually added, immune to anything that happens to the
list between two calls that used to be two separate steps.

### Isolating the Concept: One Atomic Call Instead of Read-Then-Write

The mechanism doing the real work above — folding a read and a write
that used to be two separate calls into one function that does both
atomically — is shown directly through the real project code above
rather than a separate, unrelated example, since the fix is small
enough, and specific enough to shared-list coupling, to be clearest in
its own real context. Running the exact same checkout-then-cleanup-
then-checkout sequence against the fixed module:

```python
customer_activity.log_order_activity(11, "order 401 placed")
customer_activity.log_order_activity(12, "order 402 placed")

checkout_place_order(17, 501)
nightly_cleanup()
checkout_place_order(18, 502)
```

Running it produces:

```
order 501 is activity #3 in the log
order 502 is activity #1 in the log
```

The numbers look identical to the broken version's output — and this
time they're actually *correct*, not coincidentally correct. After
`nightly_cleanup` empties the list, order `502` really is the first
entry in it; `log_order_activity` computed `1` from the list's real
state at the exact moment it appended, not from a separate read that
happened before an unrelated function got a chance to invalidate it.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`_activity_log.append((customer_id, message))`** — unchanged from
  before this lesson's fix, aside from the renamed variable; appends a
  new tuple to the list.
- **`return len(_activity_log)`** — calls the built-in `len` on the same
  list immediately after the append that just ran, inside the same
  function call, and returns that count to whoever called
  `log_order_activity`. Because this line runs immediately after the
  append, in the same function, with nothing else able to run in
  between, the returned number always reflects the list's real length at
  the exact moment this entry was added — there is no window between
  "check the length" and "add the entry" for anything else to slip into.

### CS Lens

This is the difference between **common coupling** — two pieces of code
interacting indirectly through shared, mutable state, each one able to
change what the other sees without either knowing about it — and **data
coupling** — two pieces of code interacting only by passing the exact
data one needs to the other, through a parameter or a return value.
Classic software-engineering coupling taxonomies rank these, roughly
tightest to loosest: content coupling (one module directly modifying
another's internals), common coupling (this lesson's original bug,
shared global state), control coupling (passing a flag that tells the
other side *how* to behave), stamp coupling (passing a whole structure
when only part of it is needed), and data coupling (passing exactly what's
needed, nothing more) — this lesson's fix moves `checkout_place_order`
and `log_order_activity`'s relationship from the second-tightest
category to the loosest one.

Also recognized in: race conditions between two threads reading and
writing the same shared variable without coordination, spreadsheet
formulas that silently break when an unrelated cell they don't visibly
reference gets deleted, and two microservices that both read and write
the same database table directly instead of communicating through an
explicit API — the shared table plays the exact role
`customer_activity.activity_log` played here.

### SE Lens

The principle is **prefer explicit data exchange over shared mutable
state** — the alternative that was in place before this lesson,
`checkout_place_order` reading `activity_log`'s length directly, worked
correctly for as long as nothing else in the entire program happened to
touch the same list at the wrong moment, which is exactly the kind of
assumption that holds in a small example and quietly stops holding as a
real system grows more pieces that all reach for the same convenient
shared list. The real cost of the fix: any other code that used to read
`activity_log`'s length directly for its own reasons now has to be
found and rewritten to ask `log_order_activity`, or a similarly-owned
function, instead — the same migration cost this domain's earlier
lessons have already been honest about, paid once, in exchange for
removing an entire category of bug that depends on unpredictable timing
between unrelated pieces of code.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed module through the identical three-call sequence:

```python
customer_activity.log_order_activity(11, "order 401 placed")
customer_activity.log_order_activity(12, "order 402 placed")

checkout_place_order(17, 501)
nightly_cleanup()
checkout_place_order(18, 502)
```

The real output:

```
order 501 is activity #3 in the log
order 502 is activity #1 in the log
```

Read on their own, these two lines look identical to the broken
version's output from the Problem section — which is exactly why this
bug is dangerous in the first place: the wrong version and the fixed
version can print the same numbers under the same test sequence, and the
only real difference is whether that number is *guaranteed* correct or
merely *happened* to be correct this one time, for this one ordering of
calls.

### Connecting Back

Where Lesson 57 fixed which side of a relationship should depend on the
other, this lesson fixes how the two sides actually talk — replacing a
shared piece of mutable state either side could silently invalidate with
one function that owns the state and hands out only the specific answer
a caller needs.

## Connect the Pieces

The claim "this is activity #1" was computed twice, in the identical
checkout-then-cleanup-then-checkout sequence both times. First, computed
by `checkout_place_order` reading `activity_log`'s length itself, before
logging: technically the number `1` printed, but only because
`nightly_cleanup`'s unrelated `clear()` call happened to run at exactly
the right moment to make a stale assumption look correct by accident.
Second, computed by `log_order_activity` itself, atomically, at the
instant of the actual append: the identical number `1`, this time
because it's genuinely, unconditionally true — no other function's
timing could have changed the answer.

## What Breaks Without This

`log_order_activity` now owns `_activity_log` and computes positions
atomically — but `nightly_cleanup` still reaches past the leading
underscore to clear it directly, the same honest limit this domain has
proven at every encapsulation boundary so far:

```python
print("nightly_cleanup still touches the real private list directly:")
print(customer_activity._activity_log)
customer_activity.nightly_cleanup()
print(customer_activity._activity_log)
```

Run for real, this is what comes back:

```
nightly_cleanup still touches the real private list directly:
[(11, 'order 401 placed'), (12, 'order 402 placed'), (17, 'order 501 placed')]
[]
```

`nightly_cleanup` was never rewritten to go through a sanctioned
function of its own — it still reaches `_activity_log` directly, past
the underscore, the same way any other code technically still could.
This lesson's fix removed the coupling between `checkout_place_order`
and the list's *exact state at read time*; it didn't remove every piece
of code's ability to touch the list directly, only the one caller this
lesson specifically rewrote. A real codebase would need the identical
fix applied to `nightly_cleanup` too — exposing a `clear_activity_log()`
function instead of leaving `_activity_log.clear()` callable from
outside at all.

## Exercises

1. Give `nightly_cleanup` the same treatment this lesson gave
   `checkout_place_order` — replace its direct `_activity_log.clear()`
   call with a new, real `clear_activity_log()` function in
   `customer_activity.py`, so nothing outside the module ever touches
   `_activity_log` by name again.
2. Write a `activity_count()` function that returns
   `len(_activity_log)` for any code that legitimately needs to know the
   current count without logging anything new. Explain, in one sentence,
   why this is still data coupling and not a regression back toward the
   original bug.
3. Find one place in this curriculum's own earlier lessons where two
   functions or modules might plausibly share mutable state directly
   (consider `Order._lines` from Lesson 49, or `_ORDER_TRANSITIONS` from
   Lesson 53). Confirm, by rereading the fix each lesson already applied,
   that common coupling was already avoided there — and name which kind
   of coupling replaced it.

## Definition of Done

- [ ] `_activity_log` is private; `log_order_activity` returns the
      position atomically instead of any caller computing it separately.
- [ ] `checkout_place_order` no longer reads `activity_log`'s length
      directly anywhere.
- [ ] The Problem section's incorrect-by-coincidence numbering has been
      reproduced for real, against the *original*, shared-list version,
      before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" underscore-bypass has been run
      against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `coupling:
      make log_order_activity return the position atomically so checkout
      no longer depends on reading activity_log's length separately`,
      not `add return value`.

Up next: Lesson 59, Cohesion — the companion question to coupling: not
how tightly two different pieces of code are bound together, but how
tightly the pieces *inside* one module or class actually belong together
in the first place.
