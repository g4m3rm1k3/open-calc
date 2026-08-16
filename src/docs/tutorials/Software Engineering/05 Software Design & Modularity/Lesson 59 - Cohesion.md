# Lesson 59: Cohesion

**What you will build.** `customer_activity.py`, for convenience, picks
up a second responsibility that has nothing to do with logging customer
activity: `check_low_stock`, which needs `inventory_db` to work. The
warehouse database goes down, `inventory_db` fails to import, and
suddenly `log_order_activity` — a function that never touches inventory
at all — can't be called either, because the whole module fails to
import before either function inside it ever gets a chance to run. This
lesson splits `check_low_stock` into its own module, `inventory.py`,
leaving `customer_activity.py` doing exactly one thing again. The
transferable problem: coupling (Lesson 58) asked how tightly two
*different* modules depend on each other; this lesson asks whether the
things living *inside* one module actually belong there — and a module
bundling unrelated responsibilities inherits every one of those
responsibilities' own failure modes, for every caller, even the ones who
only wanted one of them.

**What you need to know first.** Coupling (Lesson 58) — the companion
measure this lesson names the other half of; coupling is about the
relationship between separate modules, cohesion is about what's inside
one. What Is a Module? (Lesson 52) — a module as a namespace holding
related code; this lesson asks the question "related how, exactly" that
Lesson 52 left open.

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

Still the **Design** stage — and, together with Lesson 58, this pair
closes out the two questions every module in this domain's remaining
lessons gets checked against: how tightly is it bound to other modules,
and how tightly do its own pieces belong to each other.

**Terms introduced in this lesson.** One line each.

- **cohesion** — how strongly the responsibilities living inside one
  module or class actually belong together, sharing a common purpose and
  often the same internal state. It's the companion measure to coupling:
  coupling asks how tightly two *different* modules are bound to each
  other; cohesion asks whether everything living inside *one* module
  even belongs there in the first place.
- **low cohesion** — a module or class bundling two or more genuinely
  unrelated responsibilities together, typically because it was
  convenient at the time rather than because the responsibilities share
  a real purpose. It's worth naming precisely because a module with low
  cohesion inherits every one of its unrelated pieces' own dependencies
  and failure modes — for every caller, including the ones who only ever
  wanted one of them.

**Objects and methods used.** None new — this lesson's fix is a module
split, the same mechanism Lesson 52 already established, applied here
for a different reason: not to prevent a name collision, but to keep
unrelated responsibilities from sharing a failure mode.

## Concept Unit: One Module, Two Unrelated Reasons to Change

### The Problem

`customer_activity.py` gains a second function, `check_low_stock`, added
because it seemed like a small enough addition to not need its own file:

```python
import inventory_db

_activity_log = []


def log_order_activity(customer_id, message):
    _activity_log.append((customer_id, message))
    return len(_activity_log)


def check_low_stock(product_id, threshold=5):
    return inventory_db.quantity_on_hand(product_id) < threshold
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. `check_low_stock` needs `inventory_db`
to reach the warehouse database — and when that database goes down,
`inventory_db.py` itself starts failing to import at all:

```python
try:
    import customer_activity
    customer_activity.log_order_activity(17, "order 501 placed")
    print("activity logged fine")
except ImportError as e:
    print("ImportError:", e)
```

Running it while `inventory_db` is down produces:

```
ImportError: inventory_db: could not reach the warehouse database
```

`log_order_activity` never touches `inventory_db`. Nobody asked to check
stock levels. The `import customer_activity` line at the top of this
script still fails, because Python has to fully execute
`customer_activity.py` top to bottom to import it at all — including its
own `import inventory_db` line — before either `log_order_activity` or
`check_low_stock` becomes callable. Bundling an unrelated responsibility
into the same file didn't just add a second feature; it gave the first
feature a second way to fail that has nothing to do with what the first
feature actually does.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `customer_activity` module, not a port of an
  external reference codebase.
- **Files affected:** a new file, `inventory.py`; `customer_activity.py`,
  modified to remove `check_low_stock` and its import.
- **Change type:** split — the unrelated responsibility moves to its own
  module.
- **Location:** `check_low_stock` and `import inventory_db` move out of
  `customer_activity.py` entirely, into the new `inventory.py`.
- **Dependencies:** none new.

### The New Code

The smallest new piece is the new module's own, narrow content:

```python
import inventory_db


def check_low_stock(product_id, threshold=5):
    return inventory_db.quantity_on_hand(product_id) < threshold
```

### The Updated Project

`customer_activity.py` shrinks back to exactly one responsibility, with
no import it doesn't itself need:

```python
_activity_log = []                                          # customer_activity.py
                                                              # ← import inventory_db removed


def log_order_activity(customer_id, message):
    _activity_log.append((customer_id, message))
    return len(_activity_log)
                                                              # ← check_low_stock removed, moved to inventory.py
```

`inventory.py`, alongside it, holds `check_low_stock` and the one import
it actually needs, with nothing about customer activity anywhere in it:

```python
import inventory_db                                          # inventory.py    # ← new file


def check_low_stock(product_id, threshold=5):                 # ← moved here
    return inventory_db.quantity_on_hand(product_id) < threshold
```

Whatever breaks inside `inventory_db` can now only ever break
`inventory.py`'s own callers — `customer_activity.py` has no way to be
affected by it at all, because it no longer mentions `inventory_db`
anywhere in its own source.

### Isolating the Concept: A Module Should Fail for Only Its Own Reasons

The mechanism doing the real work above — splitting a module along the
line between its genuinely unrelated responsibilities, so each one's
own failure mode stays contained to itself — is shown directly through
the real project code above, since the fix is precisely a module split,
the same mechanism Lesson 52 already isolated once; there is no separate
new construct here to demonstrate in an unrelated example. Running the
identical import-and-log attempt against the split version, with
`inventory_db` still down:

```python
customer_activity.log_order_activity(17, "order 501 placed")
print("activity logged fine")

try:
    import inventory
    inventory.check_low_stock("sku-1")
except ImportError as e:
    print("inventory ImportError (unrelated, does not affect activity logging):", e)
```

Running it produces:

```
order 501 is activity # 1  in the log
inventory ImportError (unrelated, does not affect activity logging): inventory_db: could not reach the warehouse database
```

`log_order_activity` succeeds, completely unaffected by
`inventory_db`'s continuing outage — `customer_activity.py` simply has
no dependency on it anymore. `inventory.check_low_stock` still fails,
exactly as it should, because that failure is real and belongs to
inventory specifically — but it no longer drags anything unrelated down
with it.

### Mechanical Walkthrough

Working through what actually changed between the two versions:

- **`import inventory_db` removed from `customer_activity.py`** — the
  substantive fix; `customer_activity.py` no longer has any binding to
  `inventory_db`'s module object anywhere in its own namespace, so
  nothing about `inventory_db`'s own health can affect whether
  `customer_activity.py` itself can even be imported.
- **`check_low_stock`, relocated to `inventory.py`** — identical function
  body, moved to a file whose only reason to exist is inventory-related
  code; `import inventory_db` moves with it, landing in the one module
  that actually needs it.

### CS Lens

This is **cohesion**, most often stated as the goal that a module should
have a **single responsibility** — one reason to change, not several
unrelated ones bundled together. A module with low cohesion is
structurally similar to a function that does two unrelated things in one
body (already covered, at the function level, by earlier engineering
foundations in this curriculum) — here the identical failure appears one
level up, at the level of an entire file: `customer_activity.py` had two
genuinely separate reasons to change (activity-logging behavior, and
inventory-checking behavior) bundled into one unit, and this lesson's
fix gives each reason its own unit instead.

Also recognized in: a "Utils" class in a large codebase that accumulates
dozens of unrelated static methods over time until nobody can say what
it's actually responsible for, a microservice that starts out doing one
job and slowly absorbs unrelated ones until a single unrelated failure
can take down features that never depended on it, and a single database
table storing two logically distinct kinds of records because it was
convenient early on, long after the two kinds of records stopped having
anything in common.

### SE Lens

The principle is **group code by shared reason to change, not by
convenience or proximity** — the alternative that was rejected,
`check_low_stock` living inside `customer_activity.py` because it
seemed too small to deserve its own file, isn't wrong on the day it's
added, the same honest caveat every lesson in this domain keeps making:
it costs nothing measurable until the day one of the bundled
responsibilities fails for a reason that has nothing to do with the
other, and the failure spreads to code that never should have been at
risk. The real cost of the fix: two files now exist where one did
before, and any code that used to `import customer_activity` to reach
`check_low_stock` has to be found and updated to `import inventory`
instead — a real, one-time migration cost, paid in exchange for making
sure a warehouse database outage can never again silently take activity
logging down with it.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py`, from the
directory containing both `customer_activity.py` and the new
`inventory.py` — the `python` program, given one positional argument,
executes that file's statements top to bottom, importing whatever local
modules it names along the way.

### Run It

Running the fixed version, with `inventory_db` still broken, exercising
both modules from one script:

```python
import customer_activity

position = customer_activity.log_order_activity(17, "order 501 placed")
print("order 501 is activity #", position, " in the log")

try:
    import inventory
    inventory.check_low_stock("sku-1")
except ImportError as e:
    print("inventory ImportError (unrelated, does not affect activity logging):", e)
```

The real output:

```
order 501 is activity # 1  in the log
inventory ImportError (unrelated, does not affect activity logging): inventory_db: could not reach the warehouse database
```

The first line proves the fix directly: activity logging succeeds, in
the same script, in the same process, while the warehouse database is
still completely unreachable. The second line proves the fix isn't
hiding the inventory failure — it's real, it's still reported, it's just
correctly scoped to the one module that actually owns it.

### Connecting Back

Where Lesson 58 fixed how tightly two separate modules were bound
together, this lesson fixes what was allowed to live inside one module
in the first place — the same underlying question, "does this
relationship actually need to exist," asked about a module's own
contents instead of about two different modules.

## Connect the Pieces

`log_order_activity(17, "order 501 placed")` was attempted twice, with
the warehouse database down both times. First, bundled inside a module
that also held `check_low_stock`: the attempt failed before it even
started, `ImportError`, because Python couldn't finish loading the
module at all. Second, in a module holding only activity-logging code:
the identical call succeeded, correctly, `activity #1`, with the
inventory failure fully contained to `inventory.py`, reported honestly
only when `inventory.check_low_stock` itself was actually called.

## What Breaks Without This

Splitting `check_low_stock` out fixes the specific bundling this lesson
found. It says nothing about whether the *next* addition to
`customer_activity.py` will be genuinely related to activity logging or
just convenient to place there again:

```python
def send_marketing_email(customer_id, subject):
    import email_service
    email_service.send(customer_id, subject)
```

Adding this directly into `customer_activity.py`, the same way
`check_low_stock` was added before this lesson, would recreate the exact
same risk with a different unrelated dependency, `email_service`, in
place of `inventory_db` — nothing about this lesson's fix prevents a
future maintainer from making the identical convenience-driven choice
again, just with new names. This lesson fixed one instance of low
cohesion; it didn't install anything that catches the next one
automatically — that's a code-review judgment call, not something a
module split guarantees going forward on its own.

## Exercises

1. `Order` and `OrderLine`, from Domain 4, both live in the same
   conceptual file. Using this lesson's test — "does this piece share
   the module's own state and purpose, or is it just convenient to place
   here" — argue whether they belong in one module or two.
2. Write a short cohesion check for `customer_activity.py`, post-fix:
   list every function in it, and for each one, name which of the
   module's own module-level data it actually reads or writes. If any
   function touches none of it, that's a real signal worth flagging —
   does the fixed version have any?
3. `inventory.py` currently has exactly one function. Should
   `check_low_stock` eventually share a module with other
   inventory-related functions, if they're added later? Using this
   lesson's own principle, name the test you'd apply to decide, rather
   than a fixed rule like "one function per file" or "one file per
   feature."

## Definition of Done

- [ ] `customer_activity.py` contains only activity-logging code, with no
      `import inventory_db` anywhere in it.
- [ ] `inventory.py` exists as its own file, holding `check_low_stock`
      and its own `import inventory_db`.
- [ ] The Problem section's `ImportError` has been reproduced for real,
      against the *original*, bundled version, before you apply the
      split.
- [ ] The "Run It" scenario above runs against your own split files and
      produces output matching what's pasted here.
- [ ] Commit, with a message stating *why*: something like `cohesion:
      split check_low_stock into its own inventory module so a
      warehouse-database outage can no longer break activity logging`,
      not `move function to new file`.

Up next: Lesson 60, Stable Dependencies — given coupling and cohesion
both named, which modules in a real, growing system should be allowed to
change often, and which ones everything else should be able to trust to
stay still.
