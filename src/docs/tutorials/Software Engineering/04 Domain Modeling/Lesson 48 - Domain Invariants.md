# Lesson 48: Domain Invariants

**What you will build.** An order's `total` should always equal the sum
of its line items' `quantity × unit_price` — a rule about the
*relationship* between `total` and `lines`, not a rule about either one
in isolation. Stored as its own separately-updated field, `total` can
fall out of sync with `lines` the moment anything touches `lines`
without going through the one method that also happened to update
`total`. This lesson replaces the stored field with a computed
`@property`, so `total` is never a second copy of the truth to fall out
of sync with `lines` at all — it's recomputed from `lines` every time
it's read. The transferable problem: a *domain invariant* is a rule that
spans more than one piece of data at once, and the moment one of those
pieces is a value fully determined by the others, storing it separately
is itself the bug waiting to happen — not a bug in the formula, a bug in
the decision to store the answer instead of recomputing it.

**What you need to know first.** Business Rules (Lesson 47) — a rule
that spans more than one entity, and the specific failure mode,
duplicated logic drifting apart, that this lesson's failure mode
resembles without being identical to it. Invariants (Lesson 30) — a rule
that must hold at every point after construction; this lesson applies
that same idea to a rule spanning two pieces of data on one object
instead of one object's single field. Relationships (Lesson 44) — `Order`
holding a collection of other objects, the same shape `Order.lines`
reuses here.

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

Still the **Domain model** stage. Carried through: Lesson 45 protected a
single field's *value*; Lesson 46 protected a single field's *next
value*; Lesson 47 protected a rule spanning *two entities*; this lesson
protects a rule spanning *two pieces of data on the same entity*, where
one is fully determined by the other. All four are the same underlying
*Domain model* stage job — turning a real-world rule into a shape the
data itself can't violate — applied to four different shapes of rule.

**Terms introduced in this lesson.** One line each.

- **domain invariant** — a rule that must hold across a group of related
  pieces of data at every point, not just a rule about one field in
  isolation. It's distinguished from a business rule (Lesson 47) by what
  it's a rule *about*: a business rule gates whether a specific action is
  allowed to happen; a domain invariant is a standing fact about a
  relationship between data that must never become false, independent of
  which action anyone is attempting.
- **derived value** — a piece of data whose correct value is fully
  determined by other data that already exists, rather than being its
  own independent fact. It's worth naming separately from an ordinary
  field because a derived value has exactly one way to go wrong that an
  independently-set field doesn't: being stored as a second copy and
  allowed to disagree with the data it was derived from.
- **stale data** — a stored value that was correct at the moment it was
  written but has since stopped matching the thing it's supposed to
  represent, because whatever it was derived from changed and it didn't
  change with it.

**Objects and methods used.**

- **`property`** (Python's built-in decorator)
  - *What it is:* a built-in descriptor that lets a method be read using
    plain attribute syntax (`order.total`) instead of call syntax
    (`order.total()`), running the method's body fresh on every read.
  - *Implementation:* written as `@property` directly above a method
    that takes only `self` — `@property` \n `def total(self): return
    sum(...)`. Reading `order.total` executes that method's body every
    single time; without a matching setter method also defined (which
    this lesson doesn't add), assigning to it directly — `order.total =
    999` — is refused with `AttributeError: property 'total' of 'Order'
    object has no setter`.
  - *Its use:* this lesson uses it to turn `total` from a separately
    stored field, updatable independently of `lines`, into a value that
    has no stored form at all — there is nothing for `lines` to drift
    away from, because `total` is recomputed from `lines` on demand
    every time it's read.

## Concept Unit: Deriving a Value Instead of Storing and Updating It

### The Problem

`Order.total` needs to always equal the sum of every line's `quantity ×
unit_price`. The straightforward way to build that is a field, updated
alongside `lines` by whatever method adds a line — and that works,
right up until something touches `lines` through any other path. Here it
is, run for real:

```python
class OrderLine:
    def __init__(self, item_id, quantity, unit_price):
        self.item_id = item_id
        self.quantity = quantity
        self.unit_price = unit_price


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.lines = []
        self.total = 0

    def add_line(self, line):
        self.lines.append(line)
        self.total += line.quantity * line.unit_price


order = Order(order_id=501, customer_id=17)
order.add_line(OrderLine(item_id="sku-1", quantity=2, unit_price=10))
print("total after add_line:", order.total)

order.lines.append(OrderLine(item_id="sku-2", quantity=1, unit_price=25))
print("total after direct lines.append:", order.total)
print("actual sum of lines:", sum(l.quantity * l.unit_price for l in order.lines))
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
total after add_line: 20
total after direct lines.append: 20
actual sum of lines: 45
```

`add_line` correctly keeps `total` in sync — the first print is right.
The second line item was added a different way, `order.lines.append(...)`
directly, which is perfectly legal Python (`lines` is an ordinary list,
with no guard on it at all) and perfectly reasonable-looking code. It
just doesn't happen to be the one method that also remembered to update
`total`. `order.total` stays `20`; the real sum of the two lines is `45`.
Nothing crashed. `order.total` is now **stale data** — correct when it
was written, wrong from the moment `lines` changed without it.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order` example, not a port of an external
  reference codebase.
- **Files affected:** `orders.py` (same file as the previous three
  lessons), modified.
- **Change type:** refactor — `total` stops being a field set in
  `__init__` and updated in `add_line`, and becomes a computed property
  instead.
- **Location:** remove `self.total = 0` from `Order.__init__` and the
  `self.total += ...` line from `add_line`; add a `total` property to
  `Order`.
- **Dependencies:** none — `property` is a Python built-in, no import
  needed.

### The New Code

The smallest new piece is the property itself:

```python
@property
def total(self):
    return sum(line.quantity * line.unit_price for line in self.lines)
```

### The Updated Project

`Order` loses its stored `total` field entirely; `add_line` gets
simpler, and the new property takes over answering "what is the total"
on every read instead of on every write:

```python
class OrderLine:
    def __init__(self, item_id, quantity, unit_price):
        self.item_id = item_id
        self.quantity = quantity
        self.unit_price = unit_price


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.lines = []                                    # ← unchanged
                                                              # ← self.total = 0 removed

    def add_line(self, line):
        self.lines.append(line)
                                                              # ← self.total += ... removed

    @property                                                # ← new
    def total(self):                                         # ← new
        return sum(line.quantity * line.unit_price for line in self.lines)  # ← new
```

`Order` no longer has anywhere for a stale total to live: `add_line`'s
only job now is appending to `lines`, and `total` is answered fresh,
from `lines`, every single time something asks for it — including when
`lines` was changed by a path other than `add_line`.

### Isolating the Concept: A Value That Recomputes Itself

The mechanism doing the real work above — a method decorated so it reads
like a plain attribute, recomputed from other data every time it's
accessed rather than stored anywhere — deserves to be seen on its own.
Here it is summing a playlist's track lengths instead of an order's line
totals:

```python
class Playlist:
    def __init__(self):
        self.track_durations = []

    def add_track(self, duration_seconds):
        self.track_durations.append(duration_seconds)

    @property
    def total_duration(self):
        return sum(self.track_durations)


playlist = Playlist()
playlist.add_track(180)
print("total_duration:", playlist.total_duration)

playlist.track_durations.append(240)
print("total_duration after direct append:", playlist.total_duration)
```

Running it produces:

```
total_duration: 180
total_duration after direct append: 420
```

This is exactly what `Order.total` is doing above, isolated:
`total_duration` is written like a method (`def total_duration(self):`)
but read like a field (`playlist.total_duration`, no parentheses) —
that's what `@property` changes. The first print, `180`, comes from the
one track added through `add_track`. The second line appends directly to
`track_durations`, bypassing `add_track` entirely — the same kind of
"different path" that broke the stored-field version of `Order.total`
above — and `total_duration` still reports the correct new sum, `420`,
because it was never storing an answer to begin with; it recomputes one,
from `track_durations`, on this exact read. This construct — a method
that behaves like a computed, read-only attribute — is called a
**property**. This throwaway example is now discarded; `Playlist` does
not appear anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`@property`** — a decorator expression applied to the function
  definition immediately below it. A decorator, as first taught earlier
  in this curriculum, is syntax that wraps a function in another piece
  of behavior without changing the function's own body; `@property`
  specifically wraps `total` in Python's descriptor machinery, which is
  what makes `order.total` — no parentheses — trigger the function call
  rather than returning the function object itself.
- **`def total(self):`** — a method definition taking only `self`, no
  other parameters. `@property` requires this shape; a property method
  that took a second parameter would have nowhere for that parameter's
  value to come from, since it's invoked by attribute access
  (`order.total`), not by an explicit call with arguments.
- **`return sum(line.quantity * line.unit_price for line in
  self.lines)`** — a generator expression, `line.quantity *
  line.unit_price for line in self.lines`, passed directly to the
  built-in `sum`. For each `OrderLine` currently in `self.lines`, it
  computes that one line's subtotal, `quantity` times `unit_price`, and
  `sum` adds all of those subtotals together into one number. Because
  this expression reads `self.lines` fresh every time the property runs,
  it can never report a total that doesn't match whatever is actually in
  `self.lines` at the moment it's asked — there is no separate "total so
  far" being incremented anywhere for `self.lines` to drift away from.

### CS Lens

This is the general idea of a **derived value**, sometimes called
computed state: data that is a pure function of other data, rather than
its own independent fact. Storing a derived value separately and trying
to keep it updated by hand is the same structural mistake as an
uninvalidated cache — a copy of an answer, made once, that silently
stops matching its source the moment the source changes through any path
the cache-updating code doesn't know about. Recomputing on every read
instead of caching removes the possibility of staleness entirely, at the
cost of redoing the computation every time — the same tradeoff spreadsheet
formulas make (a cell showing `=SUM(A1:A10)` is never stale, because it's
never actually "stored," it's recalculated on every view) versus a
value someone typed in by hand after doing the addition themselves once.

Also recognized in: spreadsheet formula cells, SQL views versus
materialized views (a view recomputes on every query; a materialized
view caches and can go stale), reactive UI frameworks that recompute
derived values whenever their inputs change, and any "total," "count," or
"average" field anywhere that's stored instead of computed from the
records it's supposed to summarize.

### SE Lens

The principle is **don't store what you can derive** — the alternative
that was rejected here is exactly what Lesson 47's alternative was too:
keep the stored field, and be disciplined about updating it everywhere
`lines` changes. That alternative has the identical structural weakness
Lesson 47 already demonstrated for duplicated business logic, applied
now to duplicated *data* instead of duplicated *logic*: it only stays
correct if every single place that touches `lines` also remembers to
update `total`, and "remembering everywhere" is precisely the discipline
failure the Problem section just proved fails in practice. Deriving
`total` removes the need to remember anything, because there is no
second copy of the answer left to forget to update.

This fix is honestly *stronger* than Lesson 46 and Lesson 47's own
guarded methods, not just different: `transition_to` and
`customer_can_pay` only protect the callers that go through them, and
this lesson's own Problem section already showed a bypass exists
(`order.lines.append(...)` directly). A computed `total` has no bypass
for *that specific invariant* — no matter what path adds or removes a
line, `total` is always correct the next time it's read, because it was
never storing anything to be wrong. What this fix does **not** protect is
different: `lines` itself is still an ordinary, directly-mutable list,
so nothing stops a bad `OrderLine` — a negative quantity, say — from
being appended to it directly. Deriving `total` from `lines` guarantees
`total` always matches `lines`; it says nothing about whether `lines`
itself is allowed to hold nonsense.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, the path to a `.py`
file, executes that file's statements top to bottom in a fresh
interpreter process. Success looks like exactly the `print(...)` output
appearing in order, with no traceback beneath it.

### Run It

Running the fixed version, with the identical direct-append scenario
that broke the stored field above:

```python
order = Order(order_id=501, customer_id=17)
order.add_line(OrderLine(item_id="sku-1", quantity=2, unit_price=10))
print("total after add_line:", order.total)

order.lines.append(OrderLine(item_id="sku-2", quantity=1, unit_price=25))
print("total after direct lines.append:", order.total)
```

The real output:

```
total after add_line: 20
total after direct lines.append: 45
```

The first line matches the earlier, broken run — `20` — because one
correctly-added line really does total `20`. The second line no longer
matches the earlier run: it's `45` now, not the stale `20` from before,
because `order.total` was never storing `20` to begin with. The exact
same direct-append call that broke the invariant in the Problem section
no longer can, not because the append was blocked — it wasn't, `lines`
is still an ordinary list — but because there was never a second copy of
the total for that append to leave behind unsynchronized.

### Connecting Back

Where Lesson 47 fixed a rule that had drifted between two pieces of
*logic*, this lesson fixes a rule that could drift between two pieces of
*data* on the same object — both are the same underlying failure,
something duplicated and allowed to disagree with itself, applied to two
different kinds of thing a codebase can duplicate.

## Connect the Pieces

Order `501` moved through this lesson twice, with the identical
sequence of two lines added the same way both times — one through
`add_line`, one appended straight to `lines`. First, with `total` as a
stored field: it reported `20` after the direct append, silently wrong
against the real sum of `45`. Second, with `total` as a computed
property: it reported `45` after the identical append — correct,
because there was no stored answer left to go stale in the first place.
Nothing about how the second line was added changed between the two
runs; what changed was whether `total` had anywhere to disagree with
`lines` at all.

## What Breaks Without This

Deriving `total` from `lines` closes exactly one gap: `total` can never
disagree with `lines` again. It says nothing about whether `lines`
itself is allowed to hold nonsense:

```python
order = Order(order_id=501, customer_id=17)
order.add_line(OrderLine(item_id="sku-1", quantity=2, unit_price=10))
order.lines.append(OrderLine(item_id="sku-2", quantity=-5, unit_price=25))
print("total with a directly-appended negative-quantity line:", order.total)
```

Run for real, this is what comes back:

```
total with a directly-appended negative-quantity line: -105
```

`total` is exactly, correctly, `-105` — the property did its one job
perfectly, summing `lines` faithfully. The actual problem is one level
up: nothing stopped a line with a negative quantity from being appended
to `lines` at all, whether through `add_line` or directly. `lines`
remains an ordinary, unguarded list, the same way `order.status`
remained a directly-assignable attribute after Lesson 46's transition
table. Closing *that* gap — restricting how `lines` itself can be
changed, not just how `total` is computed from whatever `lines` happens
to contain — is a structural question about who's allowed to touch a
collection of related objects at all, which is precisely what a later
lesson in this domain, on treating a cluster of objects as one
consistency boundary, exists to answer.

## Exercises

1. Add a `subtotal` property to `OrderLine` itself (`quantity *
   unit_price`), and rewrite `Order.total` to sum `line.subtotal for
   line in self.lines` instead of repeating the multiplication. Rerun the
   "Run It" scenario and confirm the real output is unchanged.
2. `Playlist.total_duration` has the identical unguarded-list weakness
   this lesson names for `Order.lines` in "What Breaks Without This."
   Demonstrate it for real: append a negative `duration_seconds` value
   directly to `track_durations`, print `total_duration`, and explain in
   one sentence why the property being correct doesn't mean the playlist
   is.
3. Write a `line_count` property on `Order` (the number of lines) the
   same way `total` was written, and prove, by appending directly to
   `lines` and printing `line_count` before and after, that it can't go
   stale either.

## Definition of Done

- [ ] `Order.total` is a `@property`, not a field set in `__init__` or
      updated inside `add_line`.
- [ ] The "Problem" scenario has been run against the *stored-field*
      version of `Order`, reproducing the real staleness bug, before you
      apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" negative-quantity scenario has been
      run against your own file, not just read, and you can state in one
      sentence which invariant it's proving `total` still doesn't cover.
- [ ] Commit, with a message stating *why*: something like `invariants:
      derive Order.total from lines instead of storing it, so it can't
      drift when lines is mutated directly`, not `refactor total to
      property`.

Up next: Lesson 49, Aggregates — treating `Order` and its `lines` as one
consistency boundary, so `lines` itself stops being a directly-mutable
list open to anyone.
