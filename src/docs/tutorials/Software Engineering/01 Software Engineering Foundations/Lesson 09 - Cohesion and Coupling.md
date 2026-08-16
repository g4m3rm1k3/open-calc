# Lesson 9: Cohesion and Coupling

**What you will build.** Two small, real failures, each caused by a
different mistake that "just split it into more functions," Lesson 8's own
fix, does nothing to prevent: a single function bundling three unrelated
jobs under one dispatch argument, and a second function reaching directly
into another module's private internals instead of going through its
public interface. Both run correctly today. Both break — one silently
returning the wrong answer, one accepting a typo without complaint — the
moment something nearby changes, for reasons that have nothing to do with
whether the code was "separated" in Lesson 8's sense at all.

**What you need to know first.** Lesson 8's separation of concerns, whose
closing unit asked, and left open, exactly the question this lesson
answers: how do you tell whether a given split actually lines up with real
independent reasons to change? Also Lesson 3's `accounts.py` /
`growth_signup.py` boundary, reused directly as this lesson's second
example.

**Terms introduced in this lesson**

- **cohesion** — how closely the responsibilities inside a single unit
  (a function, in this lesson) relate to each other. A highly cohesive
  unit does one job, completely, for one reason; a low-cohesion unit
  bundles unrelated jobs under one name, even if it's already its own,
  separate function. The word matters because Lesson 8 showed that
  splitting code into more functions is necessary for good design but
  this lesson shows it isn't sufficient — a function can be its own,
  separate unit and still fail this test badly.
- **coupling** — how much one unit depends on another unit's *internal*
  details, rather than only on its stated interface. Low coupling means a
  unit can change internally — its private data, its implementation — with
  nothing that depends on it needing to change too, as long as the
  interface it exposes stays the same. High coupling means a change deep
  inside one unit can silently break something that was never told it
  depended on that detail.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax: `if`/`elif` dispatch, dict indexing, and function
calls.

No pipeline diagram yet — this curriculum has not established one.

---

## Concept Unit: How Related Are the Things Inside One Function

### The Problem

A function gets written to hold a few small, reusable pieces of account
logic in one place, dispatching on an `action` argument:

```python
def account_utils(action, value):
    if action == "validate_password":
        return len(value) >= 10
    elif action == "normalize_username":
        return value.strip().lower()
    elif action == "shipping_fee":
        return value * 0.05
```

### Run It — It Works

```python
print(account_utils("validate_password", "hunter22"))
print(account_utils("shipping_fee", 40))
```

Running it:

```text
$ python account_utils.py
False
2.0
```

Both correct: an eight-character password fails the ten-character rule
Lesson 8 settled on; a $40 order's 5% shipping fee is $2.00. By Lesson
8's own test, this is even "separated" from `process_signup` — it's
already its own function, living on its own, not tangled into a signup
flow the way Lesson 8's original version was.

### The Real Bug This Causes

A caller elsewhere in the codebase, working from memory rather than
reading this function's source, reaches for password validation:

```python
print(account_utils("validate_pw", "hunter22"))
```

Here's what actually comes back:

```text
$ python account_utils.py
None
```

`"validate_pw"` doesn't match any of the three known strings inside
`account_utils`, so none of the `if`/`elif` branches run, and the function
falls through to its implicit `None` — no error, no traceback, nothing
that would draw anyone's attention to a typo. Whatever calls this
expecting `True` or `False` back now silently gets a third, unplanned
value instead.

### The Concept

Look at what's actually inside `account_utils`: password validation,
username normalization, and a shipping fee calculation — three jobs with
nothing in common except that someone decided to file them under one
name. Password rules changing has zero relationship to shipping fees
changing; a shipping-fee bug fix has no business being anywhere near
password logic, and yet editing either one means opening the same
function, reading past the other two entirely unrelated branches to find
the right one. This is what **low cohesion** looks like: the function's
one, singular *reason to exist* isn't singular at all — it's a
grab-bag, and Lesson 8's separation-of-concerns test (does each
independent reason to change land in exactly one place) fails here just
as badly as it failed inside the original tangled `process_signup`, even
though `account_utils` is, technically, its own separate function.

### CS Lens

The same shape shows up anywhere a single interface is stretched to cover
unrelated jobs by adding a mode flag or action string instead of adding a
new interface: a REST endpoint that does three unrelated things depending
on a query parameter; a single class with a `type` field that switches its
entire behavior depending on its value; a command-line tool with one flag
silently changing what a dozen other flags mean. In every case, low
cohesion doesn't announce itself as broken — it announces itself exactly
like `account_utils` did, as a plausible-looking function that happens to
also do two other, unrelated things.

### SE Lens

`is_password_valid`, `normalize_username`, and a separate, equally
narrow shipping-fee function would each have exactly one reason to exist
and exactly one reason to change — genuinely high cohesion, not just three
functions instead of one. The real cost `account_utils` avoided by staying
one function was trivial — three definitions instead of one — while the
cost it created was real and already demonstrated: a caller's typo that a
set of three separately-named functions would have turned into an
immediate, loud `NameError`, and that this single dispatching function
instead turned into a silent `None`.

---

## Concept Unit: How Entangled Two Separate Units Are

### The Problem

Lesson 3 showed `accounts.py` and `growth_signup.py` communicating
through one narrow function, `get_account_status`, and named that
boundary a consequence of Conway's Law without asking what the boundary
was actually *doing* for the two files. Build both versions for real —
one that respects it, one that doesn't.

### The Code, Run for Real

```python
# accounts.py -- version 1
_accounts = {"bob": "active", "alice": "suspended"}

def get_account_status(username):
    return _accounts[username]
```

Two callers, both currently correct — one going through the function
above, one reaching past it directly into `_accounts`:

```python
# growth_signup.py
def can_purchase_tight(username):
    return _accounts[username] == "active"

def can_purchase_loose(username):
    return get_account_status(username) == "active"
```

Call both the same way, side by side, so their answers can be compared
directly:

```python
print("tight:", can_purchase_tight("bob"))
print("loose:", can_purchase_loose("bob"))
```

Running it:

```text
$ python growth_signup.py
tight: True
loose: True
```

Both agree. Nothing distinguishes them yet.

### The Real Bug This Causes

Accounts, owning `accounts.py` entirely, makes an internal change that has
nothing to do with the public `get_account_status` interface at all: they
start storing more than just a status per account, so `_accounts` now maps
each username to a small dict instead of a plain string, and update
`get_account_status` to still return just the status:

```python
# accounts.py -- version 2
_accounts = {
    "bob": {"status": "active", "created_at": "2025-01-01"},
    "alice": {"status": "suspended", "created_at": "2024-06-15"},
}

def get_account_status(username):
    return _accounts[username]["status"]
```

`growth_signup.py` is not touched — nothing about this change was
announced to it, because as far as Accounts is concerned, nothing about
their public interface changed at all. Run both callers again, completely
unmodified:

```text
$ python growth_signup.py
tight: False
loose: True
```

`can_purchase_tight` now silently reports `False` for an active user —
`_accounts["bob"]` is a dict now, and a dict is never equal to the string
`"active"`, so the comparison fails every time, for every account,
without ever raising an error. `can_purchase_loose`, going through
`get_account_status`, is completely unaffected — it never knew or cared
whether `_accounts` held strings or dicts, only that `get_account_status`
still returns a status string, which it does.

### Mechanical Walkthrough

- `_accounts[username]["status"]` — a dict lookup, `_accounts[username]`,
  followed by a second dict lookup, `["status"]`, on the result.
  Already-assumed syntax; the mechanical detail worth tracing is that
  `get_account_status`'s own *interface* — one argument in, one status
  string out — is identical in both versions, even though what happens
  inside it changed completely.
- `_accounts[username] == "active"` inside `can_purchase_tight` —
  comparing a dict to a string with `==`. Already-assumed syntax; this is
  the exact line that silently starts returning `False` for every
  account once `_accounts`'s values stop being strings, because a dict and
  a string are never equal, and Python raises no error for comparing two
  different types with `==` — it simply says no.

### The Concept

`can_purchase_tight` depends on a fact about `accounts.py` that was never
part of its stated interface at all: that `_accounts` maps usernames
directly to status strings. That fact was true, and then it stopped being
true, entirely inside a change Accounts was free to make because nothing
about `get_account_status`'s own contract — its interface — changed.
`can_purchase_tight` is **tightly coupled** to `accounts.py`'s internals;
`can_purchase_loose` is **loosely coupled** to it, depending only on the
interface `accounts.py` actually promises. The tight version isn't
incorrect today, the same way `account_utils` wasn't incorrect before
someone mistyped `"validate_pw"` — both failures are latent, invisible
until something nearby changes, and both are a direct, demonstrated cost
of a design choice that had nothing to do with whether the code was split
into separate functions or files.

### CS Lens

This is the identical failure Lesson 6 demonstrated with `average` and a
batch job, moved from a single function's behavior to two units' *shared
assumptions*: a change that's completely correct on its own terms
(Accounts is free to restructure its own private storage) silently breaks
something else that never should have known that detail existed in the
first place. The general principle — depend only on what's promised, not
on how it happens to be implemented right now — is the same reason a
library's documented public interface is treated as a real commitment
while its internal implementation is treated as free to change: callers
that only ever touch the documented interface survive changes to
everything else.

### SE Lens

Reaching into `_accounts` directly wasn't a crazy choice at the moment it
was written — it's shorter, and it worked, exactly like `account_utils`
worked before the typo. The cost was invisible until Accounts made a
change that had every right to be "just an internal detail," and wasn't,
because something outside `accounts.py` had quietly started depending on
that detail without saying so. Low coupling is what keeps that kind of
change local to the file where it happened, instead of letting it become
a silent, unannounced break in a completely different file, owned by a
completely different team — tying directly back to Lesson 3's real
concern about who finds out about a change, and when.

---

## Concept Unit: The Actual Test for a Good Split

### The Problem

Lesson 8 left open exactly this question: how do you tell whether a given
split of responsibilities is actually good, rather than just technically
present? This lesson's two failures answer it from two different
directions.

### The Concept

**High cohesion, low coupling** is the actual test, and it's two separate
questions, both of which matter: *inside* any one unit, do all its
responsibilities belong together, for one real reason (cohesion)?
*Between* any two units, does one depend only on what the other actually
promises, rather than on how the other happens to be built right now
(coupling)? `account_utils` failed the first question while being
perfectly well "separated" from `process_signup` in Lesson 8's sense —
already its own function, just with the wrong things inside it.
`can_purchase_tight` failed the second question while living in its own
file, calling nothing incorrectly, doing everything Lesson 8 would have
approved of about *how* it was split — it simply reached across a
boundary it should have respected. Lesson 8's separation of concerns is
necessary — bundling unrelated jobs into one function is always a
mistake — but this lesson shows it was never sufficient on its own; a
codebase can be thoroughly split into separate functions and files and
still be low-cohesion internally, tightly coupled externally, or both.

### CS Lens

Cohesion and coupling are among the oldest, most consistently reused
metrics in software design, tracing back to structured-design work in the
1970s, and they recur at every scale this curriculum will eventually
reach: a class with high cohesion has fields and methods that all serve
one clear purpose; a well-designed service has low coupling to the
services around it, communicating only through defined APIs the way
`get_account_status` did; even an organization's team structure is judged
by similar logic — a team with a cohesive, focused mandate, loosely
coupled to other teams through clear interfaces rather than constant
cross-team dependency, which is the same idea Lesson 3's Conway's Law
unit was circling without naming it this precisely.

### SE Lens

These two forces pull in the same direction far more often than they
conflict, but the real tension is worth naming honestly: pursuing
cohesion aggressively — splitting every plausible responsibility into its
own tiny unit — can itself increase coupling, if those tiny units end up
needing to call each other constantly, in ways that make understanding
any one of them require understanding several others. There's no formula
this lesson can hand over that resolves that tension automatically; it's
a real judgment call, made unit by unit, and this curriculum's design
domain returns to it directly, at far more depth, immediately after this
one.

---

## Connect the Pieces

Two structurally different failures, one test underneath both:

1. **Low cohesion** — `account_utils` bundles password validation,
   username normalization, and shipping fees under one dispatch argument;
   a typo, `"validate_pw"`, silently returns `None` instead of erroring,
   because nothing ties the caller's string to the function's real
   branches.
2. **High coupling** — `can_purchase_tight` reaches directly into
   `accounts.py`'s private `_accounts` dict; a purely internal change to
   how Accounts stores its data silently flips its answer from `True` to
   `False` for an active user, while `can_purchase_loose`, depending only
   on `get_account_status`'s stated interface, is unaffected by the
   identical change.
3. **The unifying test** — both failures happened inside code that was
   already "separated" in Lesson 8's sense; what was actually missing was
   high cohesion inside each unit and low coupling between them, which is
   a finer, different question than whether the code was split at all.

## What Breaks Without This

Leave `can_purchase_tight` exactly as this lesson found it, silently
returning `False` for every account after Accounts' internal change, and
ship it. Nothing crashes. Every legitimate, active user attempting to
purchase something through this code path is silently told they can't —
not with an error message pointing at the cause, just a quiet `False`
that looks, from the outside, like a correctly-enforced business rule. The
bug isn't in `accounts.py`, which changed for a legitimate internal reason
and never broke its own promises. It's entirely in a caller that promised
itself something `accounts.py` never actually promised back.

## Exercises

1. Split `account_utils` into three separately-named, single-purpose
   functions. Reproduce the `"validate_pw"` typo against the new
   functions (call a name that doesn't exist) and confirm Python now
   raises a real, immediate error instead of returning `None`.
2. In the `accounts.py` / `growth_signup.py` example, `get_account_status`
   itself had to change (from `_accounts[username]` to
   `_accounts[username]["status"]`) to absorb the internal representation
   change. Explain, in a sentence, why that change was safe for
   `get_account_status` to make, when the identical underlying change was
   unsafe for `can_purchase_tight` to be exposed to.
3. Look at any two functions from Lesson 8's separated signup code.
   Identify, honestly, whether they're coupled to each other only through
   their function signatures (loose) or whether either one assumes
   something about the other's internal implementation (tight).

## Definition of Done

- [ ] You've reproduced both failures — the silent `None` from
      `account_utils` and the silent `False` from `can_purchase_tight` —
      and confirmed the fixed versions don't have them.
- [ ] You can define cohesion and coupling as two separate questions, in
      your own words, and explain why Lesson 8's separation of concerns
      doesn't automatically guarantee either one.
- [ ] You've completed all three exercises.
- [ ] Commit the split `account_utils` functions and the `accounts.py` /
      `growth_signup.py` pair using `get_account_status`. Commit message
      should explain *why*: for example, `Lesson 9 — replaced a low-
      cohesion dispatch function and a tightly-coupled internal reference
      with narrower functions and a real interface boundary.`
