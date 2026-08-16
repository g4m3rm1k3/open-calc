# Lesson 61: Dependency Inversion

**What you will build.** Lesson 57 fixed `order_lifecycle.py` depending
directly on `customer_activity.py` by moving the logging call out to
whichever caller coordinates both — but that fix has its own gap: a
second checkout path, written later, simply forgets to make the second
call, and two orders get paid while only one activity entry gets logged.
This lesson closes that gap without reintroducing the wrong-direction
import Lesson 57 removed: `order_lifecycle.py` gains a small listener
registry — `register_transition_listener` — and `customer_activity.py`
registers itself with it. `order_lifecycle.py` still has zero references
to `customer_activity` anywhere in its own source; every checkout path
now logs activity automatically, with no call to remember, because the
notification happens inside `transition_to` itself. The transferable
problem: Lesson 60 said a dependency should point from unstable toward
stable; this lesson is the technique for getting the *behavior* of a
direct call — automatic, can't-be-forgotten — without the *dependency*
that would normally come with it.

**What you need to know first.** Stable Dependencies (Lesson 60) — the
rule this lesson's fix satisfies: `order_lifecycle.py`'s own fan-out
stays at zero even after this lesson, unlike a direct import would cost
it. Dependency Direction (Lesson 57) — the specific gap this lesson
closes; Lesson 57's own fix traded automatic notification for correct
direction, and this lesson is how to keep both at once.

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

Still the **Design** stage — and the last lesson in this domain's
dependency-focused run (Lessons 56 through 61) before it turns to
composition and polymorphism. Carried through: every one of those
lessons protected `order_lifecycle.py`'s stability from a different
angle; this lesson is the one that lets it stay stable while still
reacting to something that isn't.

**Terms introduced in this lesson.** One line each.

- **dependency inversion** — restructuring a relationship so a stable,
  foundational module exposes a minimal registration point that other,
  less stable modules depend on and plug themselves into, instead of the
  foundational module depending on them directly. It's the technique
  that achieves what Lesson 57's own fix couldn't: an unstable module
  reacting automatically to a stable one, without the stable module ever
  needing to know the unstable one exists.
- **inversion of control** — the shift where a module stops calling out
  to specific other code directly and instead exposes a place for other
  code to register itself to be called later, handing over "when does my
  code run" instead of deciding it internally. It's the mechanism
  dependency inversion in this lesson is built on: the registry is what
  lets *control* flow one way (the stable module calls the registered
  function) while the *dependency* points the other way (the unstable
  module is the one that imported anything).

**Objects and methods used.** None new — `_transition_listeners` is an
ordinary list, and `register_transition_listener` an ordinary function;
what's new is the pattern they form together, covered in this lesson's
own Concept Unit.

## Concept Unit: Let Other Code Register Itself, Instead of Reaching for It

### The Problem

Lesson 57's fix works only as long as every caller of `transition_to`
remembers to call `log_order_activity` separately, right after. A second
checkout path, added later, doesn't:

```python
def checkout_web(order):
    order.transition_to(OrderStatus.PAID)
    customer_activity.log_order_activity(
        order.customer_id, f"order {order.order_id} moved to {order.status}"
    )


def checkout_phone(order):
    order.transition_to(OrderStatus.PAID)
    # forgot to log activity here


order1 = Order(order_id=501, customer_id=17)
checkout_web(order1)

order2 = Order(order_id=502, customer_id=18)
checkout_phone(order2)

print("activity log entries recorded:", len(customer_activity._activity_log))
print("orders actually paid:", 2)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
activity log entries recorded: 1
orders actually paid: 2
```

Two orders were correctly, legally marked `PAID`. Only one activity
entry exists. `checkout_phone` isn't buggy in any way `order_lifecycle`
or `customer_activity` can detect — it's a perfectly legal way to call
`transition_to` — it simply never made the second call Lesson 57's fix
depends on every caller remembering. This is the identical shape as
Lesson 47's rule drift: one behavior, correctly implemented once,
silently missing from a second call site that had no way to know it was
expected.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `order_lifecycle`/`customer_activity`
  modules, not a port of an external reference codebase.
- **Files affected:** `order_lifecycle.py`, gaining a listener registry;
  `customer_activity.py`, registering itself with it instead of being
  called from outside.
- **Change type:** add — `register_transition_listener` and the internal
  `_transition_listeners` list; `transition_to` calling every registered
  listener after a successful move.
- **Location:** module level in `order_lifecycle.py`, and inside
  `Order.transition_to`; a new top-level registration call at the bottom
  of `customer_activity.py`.
- **Dependencies:** none — no import added to `order_lifecycle.py`.

### The New Code

The smallest new piece is the registry and its registration function:

```python
_transition_listeners = []


def register_transition_listener(callback):
    _transition_listeners.append(callback)
```

### The Updated Project

`transition_to` calls every registered listener after a successful
move, and `customer_activity.py` registers its own listener at import
time instead of being called from any checkout path directly:

```python
_transition_listeners = []                                   # ← new  (order_lifecycle.py)


def register_transition_listener(callback):                   # ← new
    _transition_listeners.append(callback)                     # ← new


class Order:
    def transition_to(self, new_status):
        if not can_transition(self.status, new_status):
            raise InvalidTransition(f"{self.status} cannot transition to {new_status}")
        old_status = self.status                                # ← new
        self.status = new_status
        for listener in _transition_listeners:                 # ← new
            listener(self, old_status, new_status)                # ← new
```

`order_lifecycle.py`'s side of the change ends there — nothing else in
it changes. `customer_activity.py`, alongside it, is where the actual
registration happens:

```python
import order_lifecycle                                        # customer_activity.py

_activity_log = []


def log_order_activity(customer_id, message):
    _activity_log.append((customer_id, message))
    return len(_activity_log)


def _on_order_transition(order, old_status, new_status):       # ← new
    log_order_activity(order.customer_id, f"order {order.order_id} moved to {new_status}")  # ← new


order_lifecycle.register_transition_listener(_on_order_transition)  # ← new
```

`order_lifecycle.py` has no `import customer_activity` anywhere in it —
it only knows about `_transition_listeners`, an ordinary list of plain
callables it never inspects the source of. `customer_activity.py` is the
one doing the importing, and the one deciding, on its own, to plug
itself into `order_lifecycle`'s transitions — the dependency arrow
points the same direction Lesson 60 requires, while the *behavior*, one
call automatically reaching both modules, is back.

### Isolating the Concept: A Registry Instead of a Direct Call

The mechanism doing the real work above — a stable module exposing a
place to register a callback instead of calling a specific other module
by name — deserves to be seen on its own. Here it is letting an
unrelated logger plug into a countdown timer instead of an order:

```python
_tick_listeners = []


def on_tick(callback):
    _tick_listeners.append(callback)


def countdown(start):
    for n in range(start, 0, -1):
        for listener in _tick_listeners:
            listener(n)


def print_tick(n):
    print(f"tick: {n}")


on_tick(print_tick)
countdown(3)
```

Running it produces:

```
tick: 3
tick: 2
tick: 1
```

This is exactly what `order_lifecycle` is doing above, isolated:
`countdown` never imports or names `print_tick` anywhere in its own
source — it only knows about `_tick_listeners`, a list of plain
callables. `print_tick` is what registered itself, through `on_tick`,
the same way `customer_activity._on_order_transition` registers itself
through `register_transition_listener`. `countdown` could run to
completion with zero listeners registered, calling nothing, and never
notice the difference — the same way `order_lifecycle.py` works
perfectly well even in a program that never imports
`customer_activity.py` at all. This throwaway example is now discarded;
`countdown` does not appear anywhere else in this lesson or this project
again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`_transition_listeners = []`** — a module-level list, empty until
  something registers a listener with it; unlike `_ORDER_TRANSITIONS`,
  its contents aren't fixed at definition time — anything importing
  `order_lifecycle` and calling `register_transition_listener` can add
  to it.
- **`def register_transition_listener(callback):`** — a function taking
  one parameter, `callback`, with no assumption at all about what module
  it came from or what it does — only that it's callable with the three
  arguments `transition_to` will eventually pass it.
- **`_transition_listeners.append(callback)`** — stores the given
  callable in the shared list, exactly the way any other list append
  works; nothing here inspects `callback`'s origin.
- **`old_status = self.status`** — captured before the reassignment on
  the next line, so listeners can be told both what the order's status
  used to be and what it just became.
- **`for listener in _transition_listeners: listener(self, old_status, new_status)`**
  — iterates every registered callable and invokes each one, passing the
  order itself and both status values. `order_lifecycle.py` never
  imports, names, or knows anything about what any of these callables
  actually do — it only knows they're callable with this exact shape.

### CS Lens

This is **dependency inversion**, built here on **inversion of
control**: instead of a stable module reaching out to call specific,
named code in a less stable module — the direction Lesson 57 removed —
the less stable module reaches *in*, registering itself with the stable
one, and control over *when* the registered code runs passes to the
stable module while the *dependency* on the callback's existence stays
entirely on the unstable side. This is the identical shape as a GUI
framework calling a button's registered click handler without the
framework itself knowing anything about what that handler does, a
plugin system where the host application never imports any individual
plugin, and an event bus where publishers and subscribers never
reference each other by name.

Also recognized in: the `on_click`/`addEventListener` pattern in web
UI frameworks, Python's own `atexit.register`, database triggers firing
registered stored procedures without the database engine importing
anything about them, and dependency-injection frameworks that let a
core system declare "I need something that satisfies this shape" without
naming which concrete implementation will be provided.

### SE Lens

The principle is **let the stable side define the shape of the
relationship, and let the unstable side register into it** — the
alternative that was rejected, keeping Lesson 57's manual-call fix and
just trying to be more careful about remembering every call site, has
the same honest weakness this domain keeps proving: it works exactly as
long as every future call site remembers, and `checkout_phone` already
proved that assumption fails in practice. The real cost of this fix:
`transition_to`'s own behavior is no longer fully visible by reading
`order_lifecycle.py` alone — a reader has to know that something,
somewhere, might have registered a listener, to understand everything
that happens on a successful transition. That's a real, honest tradeoff
against local reasoning, traded deliberately for removing an entire
class of "forgot to call it" bug.

The honest limit, proven directly: a listener that raises breaks
`transition_to` for every caller, the same way a direct
`customer_activity` import once did:

```python
def broken_listener(order, old_status, new_status):
    raise RuntimeError("activity feed database is down")


register_transition_listener(broken_listener)

order = Order(order_id=501, customer_id=17)
try:
    order.transition_to(OrderStatus.PAID)
    print("status:", order.status)
except RuntimeError as e:
    print("RuntimeError:", e)
    print("status still:", order.status)
```

The real output:

```
RuntimeError: activity feed database is down
status still: OrderStatus.PAID
```

`order_lifecycle.py` genuinely never imports whatever broke — but a
misbehaving listener can still propagate its own exception straight
through `transition_to`, because nothing in the dispatch loop protects
against one. Dependency inversion fixed the *static*, import-time
coupling this domain has spent five lessons on; it didn't, on its own,
fix the *runtime* risk of a registered callback failing badly — that's a
distinct problem, belonging to error handling, not dependency structure.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py`, from the
directory containing both `order_lifecycle.py` and `customer_activity.py`
— the `python` program, given one positional argument, executes that
file's statements top to bottom, importing whatever local modules it
names along the way.

### Run It

Running the identical two-checkout-path scenario from the Problem
section, against the fixed, listener-based version, with neither
checkout function calling `log_order_activity` directly anymore:

```python
def checkout_web(order):
    order.transition_to(OrderStatus.PAID)


def checkout_phone(order):
    order.transition_to(OrderStatus.PAID)


order1 = Order(order_id=501, customer_id=17)
checkout_web(order1)

order2 = Order(order_id=502, customer_id=18)
checkout_phone(order2)

print("activity log entries recorded:", len(customer_activity._activity_log))
print("orders actually paid:", 2)
```

The real output:

```
activity log entries recorded: 2
orders actually paid: 2
```

Both checkout paths are now identical in shape — neither one calls
`log_order_activity` at all — and both correctly produce a logged
activity entry, because the notification is no longer something a
caller has to remember; it's something `transition_to` itself does,
automatically, for every legal transition, regardless of how many
different checkout paths exist or will exist in the future.

### Connecting Back

Where Lesson 60 measured why `order_lifecycle.py` should never depend on
`customer_activity.py`, this lesson proves it doesn't have to give up
automatic notification to honor that — the registry lets control flow
toward the unstable module while the dependency arrow stays pointed the
other way, satisfying both lessons at once.

## Connect the Pieces

Two checkout paths, `checkout_web` and `checkout_phone`, both marked an
order `PAID` in this lesson, the identical way both times. First,
against Lesson 57's manual-call fix: `checkout_web` remembered to log
activity, `checkout_phone` didn't, and the activity log ended up missing
one real entry with no error anywhere to reveal it. Second, against this
lesson's listener registry: neither function calls
`log_order_activity` at all anymore, and both correctly produced a log
entry, because the call now lives inside `transition_to` itself,
reached only through a registration `order_lifecycle.py` never had to
import anything to support.

## What Breaks Without This

The SE Lens above already proved it directly: a listener that raises
still breaks every caller of `transition_to`, the exact failure mode
Lesson 57 removed for a *direct* dependency, now able to recur through a
*registered* one instead. Dependency inversion changed who has to import
whom; it didn't, by itself, protect the stable module's callers from a
misbehaving registrant. Making the dispatch loop catch and isolate a
failing listener — so one broken registration can't take down every
legal transition in the system — is a real, separate fix this lesson
deliberately leaves undone, honestly, rather than folding a second
technique into this lesson's own single concept.

## Exercises

1. Fix the honest limit named above: wrap each listener call inside
   `transition_to`'s dispatch loop in its own `try`/`except`, so one
   broken listener can't stop the others from running or stop the
   transition itself from succeeding. Prove it with the identical
   `broken_listener` scenario, run for real.
2. Register a *second*, working listener alongside `broken_listener`
   (before your fix from Exercise 1). Does the second listener run at
   all, against the original, unprotected dispatch loop? Check by
   running it, don't guess.
3. `register_transition_listener` accepts any callable, with no check on
   its shape. Write a listener that takes the wrong number of arguments,
   register it, and trigger a transition. What kind of error comes back,
   and at what point does it happen — at registration time, or at
   transition time? What does that tell you about how much this
   registry actually validates what it's given?

## Definition of Done

- [ ] `order_lifecycle.py` has no `import customer_activity` line
      anywhere in it, confirmed by checking its own source, not by
      assumption.
- [ ] `customer_activity.py` registers `_on_order_transition` with
      `order_lifecycle.register_transition_listener` at import time.
- [ ] The Problem section's missing activity entry has been reproduced
      for real, against the *original*, manual-call version, before you
      apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed files and
      produces output matching what's pasted here.
- [ ] The broken-listener scenario from the SE Lens has been run against
      your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `dependency
      inversion: let customer_activity register itself as a transition
      listener so activity logging can't be forgotten at a new call
      site`, not `add listener pattern`.

Up next: Lesson 62, Composition — moving from how modules depend on each
other to how objects are built out of other objects, the next layer this
domain's design vocabulary has to cover.
