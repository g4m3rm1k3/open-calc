# Lesson 33: State Machines

**What you will build.** A password reset token, modeled not as a plain
string field that could be set to anything, but as an object with a
closed, named set of states and an explicit table of which moves between
them are actually legal. You'll watch it correctly allow a token to be
used once, and structurally refuse to let the identical token be used a
second time — not because of an extra `if` check bolted on afterward, but
because "used, then used again" was simply never listed as a legal
transition in the first place.

**What you need to know first.** Lesson 32's state-based specifications
(this lesson gives "state" real structure — a closed set of named values,
rather than an arbitrary dict) and Lesson 31's Design by Contract. This
lesson also draws on ordinary classes and objects, which this curriculum
treats as already-assumed, Foundations-level syntax, the same as every
other basic construct since Lesson 1 — what's new here isn't the class
syntax, it's the pattern built with it.

**Terms introduced in this lesson**

- **finite state machine** (full treatment in
  `finite-state-machine-guarded-transitions.md`) — a fixed, named set of
  states, plus an explicit table of which transitions between them are
  allowed, with every transition not in that table rejected structurally
  rather than merely discouraged by convention. Introduced here only far
  enough to support this lesson's own subject; the concept file covers
  the general mechanism — the guard, the transition table, the
  execution trace of valid and invalid attempts — in full, using its own
  order-tracking example.

**Objects and methods used.** None beyond ordinary, already-assumed class
syntax (`class`, `__init__`, `self`, instance attributes and methods).

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: Giving State a Real Shape

### The Problem

Lesson 32's cart used a plain dict for state — `{"items": [...], "total":
...}` — with no restriction at all on what values it could hold at any
moment. Some real state isn't like that: a password reset token isn't a
free-form bag of fields, it's something that moves through a small,
specific lifecycle — issued, then either used or expired — and nothing
else should ever be a legal value for it, and not every move between
those values should be allowed either.

### The Concept

This is exactly what `finite-state-machine-guarded-transitions.md`
covers in full: a **finite state machine** — a closed, named set of
states, and an explicit table of which transitions between them are
legal, with a guard that checks the table *before* changing anything and
rejects whatever isn't listed. Read that file now for the complete
mechanism, proven with its own real example (an order moving through
`Pending`, `Shipped`, `Delivered`, and `Cancelled`) — this lesson doesn't
repeat it, and builds a second, different real example on top of it
instead.

### CS Lens

Already covered in full in `finite-state-machine-guarded-transitions.md`
— multiple real-world recurrences (a traffic light, a vending machine, a
TCP connection, a document workflow) are listed there.

### SE Lens

Already covered in full in `finite-state-machine-guarded-transitions.md`
— the real tradeoff between a plain, freely-assignable field and a
guarded transition table.

---

## Concept Unit: A Token That Cannot Be Used Twice

### The Problem

Apply the identical pattern to a genuinely different, real problem: a
password reset token. It starts `issued`. It should become `used` exactly
once, or `expired` if nobody uses it in time. Once it's `used`, using it
again should be structurally impossible — not merely checked for and
rejected by a separate `if`, but simply absent from what the object can
even be asked to do.

### The New Code

```python
class ResetToken:
    ISSUED = "issued"
    USED = "used"
    EXPIRED = "expired"

    VALID_TRANSITIONS = {
        (ISSUED, USED),
        (ISSUED, EXPIRED),
    }

    def __init__(self):
        self.state = ResetToken.ISSUED

    def try_transition(self, new_state):
        if (self.state, new_state) not in ResetToken.VALID_TRANSITIONS:
            return False
        self.state = new_state
        return True
```

Use a token once, then attempt to use the same token a second time —
exactly the shape of a real replay attack, someone trying to reuse a
reset link after it's already been consumed:

```python
token = ResetToken()
print("initial state:", token.state)
print("issued -> used:", token.try_transition(ResetToken.USED), "state now:", token.state)
print("used -> used again (replay attack):", token.try_transition(ResetToken.USED), "state still:", token.state)
```

Running it:

```text
$ python reset_token.py
initial state: issued
issued -> used: True state now: used
used -> used again (replay attack): False state still: used
```

The first use succeeds — `issued` to `used` is in `VALID_TRANSITIONS`.
The second, identical call fails — `(used, used)` was never listed as a
legal pair, so `try_transition` returns `False` and `token.state` stays
exactly where it was. Nobody had to write "if this token has already been
used, reject it" as a separate check anywhere — that rule falls directly
out of `VALID_TRANSITIONS` simply never mentioning it.

### Mechanical Walkthrough

- `ISSUED`, `USED`, `EXPIRED` — three fixed, named states, already-
  assumed class-attribute syntax; the engineering idea, not the syntax,
  is that `token.state` can only ever hold one of exactly these three
  string values through this class's own methods.
- `VALID_TRANSITIONS = {(ISSUED, USED), (ISSUED, EXPIRED)}` — a `set` of
  two allowed pairs; deliberately does not include `(USED, ISSUED)`,
  `(USED, EXPIRED)`, `(USED, USED)`, or anything starting from `EXPIRED`
  at all — once a token leaves `ISSUED`, in either direction, it can
  never transition again through this method.
- `if (self.state, new_state) not in ResetToken.VALID_TRANSITIONS: return
  False` — already-assumed set membership testing, given full mechanical
  treatment in the linked concept file; the specific fact worth noting
  here is that this single check is what makes reuse impossible, not any
  reasoning about "has this been used before."

### CS Lens

This is the identical CS Lens the concept file already gives, applied to
a security-relevant case instead of a shipping one: a state machine
guarding "used" from becoming "used" a second time is a real, standard
technique against replay attacks — the same shape used far beyond
password resets, anywhere a token or credential must be consumable
exactly once.

### SE Lens

Connect this back to Lesson 31 directly: `try_transition`'s guard is a
**precondition**, in exactly Lesson 28's sense, on the transition itself
— "the current state and requested state must form a pair in
`VALID_TRANSITIONS`" is a condition the caller's request must satisfy for
the operation to be honored, checked before anything changes, the same
shape as `average`'s non-empty-list requirement. A finite state machine
isn't a separate idea from Design by Contract; it's Design by Contract's
precondition applied specifically to *which* state transitions are
allowed, rather than to a function's raw argument values.

---

## Concept Unit: What the Table Leaves Unsaid Is the Actual Rule

### The Problem

`VALID_TRANSITIONS` never mentions `(USED, ISSUED)`, `(EXPIRED, USED)`, or
any transition starting from `USED` or `EXPIRED` at all. Is that an
oversight, or the actual point?

### The Concept

It's the actual point, and it's worth stating precisely why: a finite
state machine's real security or correctness guarantee lives almost
entirely in what its transition table *excludes*, not in what it
explicitly allows. Anyone could write an `if` check that rejects reusing
a token — the guarantee this lesson actually cares about is that no
*other* code path, written today or added carelessly next year, has any
way to reach `(USED, USED)` and succeed, because the table itself has no
entry for it, structurally, regardless of how the transition is
attempted. This is the same idea Lesson 30's invariant captured for
`existing_usernames` — a guarantee that holds not because every caller
remembers to check it, but because the one legitimate path enforces it
by construction.

### CS Lens

This is a direct instance of a **default-deny** design: everything not
explicitly permitted is refused, rather than everything not explicitly
forbidden being allowed. The same principle recurs in network firewalls,
permission systems, and input validation generally — a smaller, safer
list of exceptions to maintain than an ever-growing list of things to
block.

### SE Lens

The real cost, honestly: forgetting to add a legitimate transition to
`VALID_TRANSITIONS` blocks something that should have worked, exactly as
silently as it blocks something that shouldn't have — the concept file's
own third exercise proves this directly by deleting a real transition and
watching a legitimate order get stuck. A finite state machine trades "an
attacker might sneak through" for "a legitimate case might get wrongly
rejected if the table is incomplete," which is a real, deliberate,
usually favorable trade for anything security-sensitive, but not a free
one.

---

## Connect the Pieces

One new example, one already-covered mechanism, one direct connection to
this domain's own vocabulary:

1. **The mechanism** — `finite-state-machine-guarded-transitions.md`'s
   own closed states and transition table, referenced rather than
   re-derived.
2. **Applied fresh** — `ResetToken`, a genuinely new, security-relevant
   example: a token correctly usable once, structurally unable to be
   replayed a second time.
3. **Connected to Design by Contract** — a transition guard is a
   precondition, Lesson 28's own idea, applied specifically to which
   state changes are legal rather than to a function's raw arguments.

## What Breaks Without This

Model a reset token as a plain boolean, `used = False`, checked by hand
wherever the token is consumed: `if not token.used: token.used = True;
...`. Every individual call site that remembers this check is safe.
Nothing stops a new code path — a retry handler, a background job, a
second endpoint added under deadline pressure — from setting `used`
directly, or from checking a stale copy of the flag, and honoring a
reused token anyway. The finite state machine doesn't just check this
condition once; it makes the underlying rule the *only* way the object's
state can move at all, through any caller, present or future.

## Exercises

1. Add the `EXPIRED` path to real use: build a second token, transition
   it to `EXPIRED`, and confirm — with real output — that an expired
   token can no longer transition to `USED`.
2. Read `finite-state-machine-guarded-transitions.md`'s own third
   exercise (removing a valid transition to observe a legitimate case
   silently blocked) and reproduce it against `ResetToken` instead of its
   `Order` example — remove `(ISSUED, EXPIRED)` and show a token that
   should have expired can no longer do so.
3. Write the precondition, in Lesson 28's own style, that
   `try_transition`'s guard is structurally equivalent to. State it as a
   single sentence about `self.state` and `new_state` together.

## Definition of Done

- [ ] You've read `finite-state-machine-guarded-transitions.md` in full.
- [ ] You've run `ResetToken` yourself and reproduced the successful use
      and the rejected replay attempt.
- [ ] You can explain, in your own words, why a transition guard is a
      precondition in Lesson 28's sense.
- [ ] You've completed all three exercises.
- [ ] Commit `ResetToken`. Commit message should explain *why*: for
      example, `Lesson 33 — reset tokens modeled as a finite state
      machine so reuse is structurally impossible, not just checked for
      at each call site.`
