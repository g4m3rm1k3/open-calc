# Lesson 123: Test Doubles

**What you will build.** `check_restock_alert_isolated.py` — a new
check that finally closes the exact gap Lesson 118 named and
deliberately left open: a way to test `restock_alert` that keeps
passing regardless of whether the real `low_stock_items` is currently
broken. It works by temporarily replacing `low_stock_items` itself,
inside the running program, with a small stand-in function that returns
a fixed, controlled value — then restoring the real one again
afterward. Lesson 118's own `check_restock_alert.py` fails the moment
`low_stock_items` regresses, because it calls the real thing. This
lesson's new check, run against the identical regression, keeps
passing, because it never calls the real thing at all during the test.
The transferable problem this lesson names directly: Lesson 118 proved
a test can be coupled to a collaborator's correctness without anyone
intending it; this lesson builds the actual mechanism that breaks that
coupling on purpose.

**What you need to know first.** Lesson 118 (Unit Tests) — specifically
its own real regression (`low_stock_items`'s `count < threshold` changed
to `count > threshold`) and its explicit, kept promise that isolating a
unit from a real collaborator would be this lesson's own subject. This
lesson also reuses `restock_alert` and `low_stock_items`, both
unchanged since Lesson 118.

**Pipeline diagram.** This curriculum's full lifecycle:

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

Still **Verification**. Concrete value carried forward:
`restock_alert({}, threshold=5)`, checked while `low_stock_items` is
temporarily replaced with a controlled stand-in — the same call shape
Lesson 118 already used, now proven independent of whichever real
implementation `low_stock_items` currently has.

**Terms used in this lesson.**

- **Test double** — a stand-in function or object substituted for a
  real dependency during a test, so the test's own outcome depends only
  on the code actually being exercised, not on whatever the real
  dependency happens to do at that moment. Why the name: like a stunt
  double standing in for an actor in one specific scene, a test double
  stands in for one specific real dependency, for the duration of one
  specific test, while the rest of the real system stays completely
  untouched.
- **Late binding** — the fact that Python looks up a name like
  `low_stock_items` inside `restock_alert`'s own body fresh, every
  single time `restock_alert` actually runs, rather than fixing it once
  at the moment `restock_alert` was first defined. Why it matters here:
  it's the entire reason a test double can work at all without
  rewriting `restock_alert` itself — `restock_alert` never captured a
  specific function object, only a name, and a name can be pointed
  somewhere else after the fact.
- **Monkey-patching** — the technique of replacing a real function,
  method, or attribute with a substitute at runtime, after the code
  that originally defined it has already run, usually only for the
  duration of one test, with the original restored immediately after.
  Why the informal name has stuck: it's a patch applied from outside,
  after the fact, the way a mischievous monkey might swap something out
  when no one's looking — not a change made to the original source
  itself.

**Objects and methods used.** No new external class or method — this
lesson's new code reuses only constructs already given full treatment
in this project: `import`, function definition and call, `assert`,
`print`, and ordinary attribute assignment (`object.name = value`),
here applied to the imported `inventory_report` module itself rather
than to an instance of a class.

---

## Concept Unit: Test Doubles — Substituting a Real Collaborator on Purpose

### The Problem

Lesson 118 proved, with a real regression, that `check_restock_alert.py`
fails whenever `low_stock_items` is broken — even though `restock_
alert`'s own one-line body never changes. That check cannot currently
tell "I am broken" apart from "something I called is broken." Making
that distinction real means finding a way to run `restock_alert` while
controlling exactly what `low_stock_items` returns, without editing
`restock_alert`'s own source code to make that possible — `restock_
alert`, after all, is meant to keep calling the real `low_stock_items`
in actual production use; only a *test* should ever want it to do
otherwise.

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of functions — never part of
`inventory-report` — makes the real mechanism concrete:

```python
def greet():
    return say_hello()

def say_hello():
    return "real hello"

print(greet())
```

Run so far, this is unremarkable:

```text
real hello
```

Now, without touching `greet`'s own definition at all, `say_hello` is
reassigned to a different function entirely:

```python
def fake_hello():
    return "fake hello"

say_hello = fake_hello
print(greet())
```

The real output, continuing the same run:

```text
fake hello
```

`greet`'s own code, `return say_hello()`, was never edited — it still
reads exactly as it did a moment ago. What changed is what the name
`say_hello` currently points to, in the surrounding scope `greet` looks
it up in. This is possible because of **late binding**: Python doesn't
freeze `say_hello` to a specific function object the moment `greet` is
*defined* — it looks the name up fresh, in whatever scope holds it,
every single time `greet` actually *runs*. Deliberately reassigning that
name to a different function, this way, is called **monkey-patching**,
and the substitute function itself — `fake_hello`, standing in for the
real `say_hello` — is called a **test double**.

### Discard the Throwaway Example

`greet`, `say_hello`, and `fake_hello` are not part of `inventory-report`
and will not appear in it. What survives is the mechanism: a function's
own body can keep calling a name it always has, while a test controls,
from outside, exactly what that name currently resolves to.

### Project Change

- **Reference Source.** No reference counterpart — this is a new check,
  not a port of anything existing.
- **Files affected.** `check_restock_alert_isolated.py`, created.
- **Change type.** Add.
- **Location.** A new top-level file, alongside the project's other
  `check_*.py` files, including Lesson 118's own `check_restock_
  alert.py`, left completely unchanged.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
def fake_low_stock_items(inventory, threshold):
    return ["fake_item"]
```

### The Updated Project

`check_restock_alert_isolated.py`, in full — a fresh, freestanding
file, so this is already its complete shape:

```python
import inventory_report

def fake_low_stock_items(inventory, threshold):  # ← new
    return ["fake_item"]                          # ← new

def check_restock_alert_isolated():
    real_low_stock_items = inventory_report.low_stock_items
    inventory_report.low_stock_items = fake_low_stock_items
    try:
        result = inventory_report.restock_alert({}, threshold=5)
        assert result == ["fake_item"]
    finally:
        inventory_report.low_stock_items = real_low_stock_items
    print("check_restock_alert_isolated passed")

check_restock_alert_isolated()
```

### Mechanical Walkthrough

- **`import inventory_report`** — a different import shape than every
  prior check file's own `from inventory_report import <name>`: it
  imports the *module itself*, bound to the name `inventory_report`,
  rather than pulling one specific name out of it. This is what makes
  reassigning `inventory_report.low_stock_items` possible at all — there
  has to be a real module object whose attribute can be reassigned.
- **`def fake_low_stock_items(inventory, threshold):`** — a function
  definition matching the real `low_stock_items`'s own parameter shape
  (two positional parameters), so it can be called anywhere the real one
  currently is, without `restock_alert`'s own call site needing to
  change at all.
- **`return ["fake_item"]`** — always returns the exact same, fixed
  list, completely ignoring whatever `inventory` and `threshold` it was
  actually called with. This is what makes it a controlled substitute:
  its output is decided entirely by this check, not by any real
  computation.
- **`real_low_stock_items = inventory_report.low_stock_items`** — reads
  the *current* real function object off the `inventory_report` module
  and saves it, under a new name, before anything is changed — this is
  what makes putting the original back afterward possible.
- **`inventory_report.low_stock_items = fake_low_stock_items`** — the
  actual monkey-patch: reassigns the module's own `low_stock_items`
  attribute to point at the fake function instead. From this line
  onward, anything that looks up `inventory_report.low_stock_items` —
  including `restock_alert`'s own body, the next time it runs — gets the
  fake one.
- **`try:`** — opens a block whose cleanup, below, is guaranteed to run
  no matter what happens inside it.
- **`result = inventory_report.restock_alert({}, threshold=5)`** — calls
  the real, unmodified `restock_alert`, with an empty inventory (`{}`)
  and an arbitrary `threshold` — neither actually matters here, since
  whatever `restock_alert` passes to `low_stock_items` is about to be
  completely ignored by the fake standing in for it.
- **`assert result == ["fake_item"]`** — the whole point made concrete:
  `restock_alert`'s own real code — `[name for name in
  low_stock_items(inventory, threshold)]` — ran exactly as written, and
  its result is `["fake_item"]`, the fake's own fixed return value,
  because that's genuinely what `low_stock_items` currently resolves to.
- **`finally:`** — a new part of the `try` construct, not used in any
  earlier check in this project: the indented block under `finally`
  runs *unconditionally* after the `try` block finishes, whether it
  finished normally or raised an exception partway through. This is
  different from `except`, already used in Lesson 119 — `except` only
  runs if a matching exception was actually raised; `finally` always
  runs, regardless.
- **`inventory_report.low_stock_items = real_low_stock_items`** — restores
  the real function, undoing the monkey-patch. Placing this inside
  `finally` — rather than just after the `try` block — means the real
  `low_stock_items` gets restored even if the `assert` above it fails,
  so a failing check here can never leave the whole module permanently
  patched for whatever runs after it.
- **`print("check_restock_alert_isolated passed")`** — the same
  success-line convention every check file in this project uses,
  reached only if the `assert` above it didn't stop execution first.

### CS Lens

```text
Also recognized in: a flight simulator substituting a real jet engine
with a mathematical model that behaves like one, so a pilot can be
trained without a real aircraft ever leaving the ground, a stunt double
standing in for the lead actor in exactly one dangerous scene while
every other scene still uses the real performer, a crash-test dummy
standing in for a real human body specifically because the real thing
being tested — the car's structure — shouldn't require an actual person
to prove it works
```

### SE Lens

The alternative — what Lesson 118's own `check_restock_alert.py` still
does, unchanged — is to call the real collaborator and accept whatever
it does. That alternative is not wrong; it's a legitimate, useful check
in its own right, still present and still passing in this project right
now. The real cost a test double adds: this new check now has to keep
its own fake shape in sync with the real one — if `low_stock_items`'s
real parameter list ever changes, `fake_low_stock_items` has to change
to match, by hand, or the substitution silently stops representing the
real thing it's standing in for. What it buys in return, proven for
real by this lesson's own investigation: a test whose result depends on
exactly one function's own logic, and nothing else — genuinely
achieving what Lesson 118 could only name as a gap. The honest limit,
worth stating plainly: a test double proves `restock_alert`'s own code
is correct *given* that `low_stock_items` behaves the way the fake
claims it does. It says nothing about whether `low_stock_items` really
does behave that way — that question still belongs entirely to `check_
low_stock.py`, unchanged, still doing exactly what it always has.

### Commands Needed

No new command — `python3 check_restock_alert_isolated.py`, the same
invocation every check file in this project already uses.

### Run It

First, `check_restock_alert_isolated.py`, run against the correct,
unmodified project:

```text
$ python3 check_restock_alert_isolated.py
check_restock_alert_isolated passed
```

Now, the exact same one-character regression Lesson 118 introduced —
`low_stock_items`'s own `count < threshold` changed to `count >
threshold` — is reintroduced, on purpose, into `inventory_report.py`
itself:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items strictly below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count > threshold:  # ← regression, on purpose, same as Lesson 118
            low.append(name)
    return sorted(low)
```

Lesson 118's own check, run against this broken state, fails exactly as
it did before — nothing about this lesson changed that check, and
nothing should have:

```text
$ python3 check_restock_alert.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_restock_alert.py", line 9, in <module>
    check_restock_alert()
  File "/path/to/inventory-report/check_restock_alert.py", line 6, in check_restock_alert
    assert result == ["widgets"]
           ^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

This lesson's own new check, run against the identical broken state:

```text
$ python3 check_restock_alert_isolated.py
check_restock_alert_isolated passed
```

Still green. `low_stock_items` is genuinely broken, on disk, right now
— and `check_restock_alert_isolated` never once calls it, because it's
replaced with `fake_low_stock_items` for the entire duration of the
check. `restock_alert`'s own logic — the one thing this check actually
exists to verify — is still exactly as correct as it always was, and
this check is now the first one in the project capable of saying so
without that claim depending on anything else. The regression is
reverted, restoring `count < threshold`, and both checks are confirmed
passing again:

```text
$ python3 check_restock_alert.py
check_restock_alert passed
$ python3 check_restock_alert_isolated.py
check_restock_alert_isolated passed
```

### Connecting Back

The isolated `greet`/`say_hello`/`fake_hello` example proved late
binding makes substitution possible without editing the caller.
`check_restock_alert_isolated.py` proved the identical mechanism closes
Lesson 118's own real, named gap: a test of `restock_alert` that
survives the exact regression that broke every other check touching it,
because it was never actually calling the broken thing at all.

---

## Connect the Pieces

One deliberate substitution, `low_stock_items` replaced by
`fake_low_stock_items`, moving through every piece this lesson built,
start to finish:

1. `check_restock_alert_isolated` saves the real `low_stock_items`
   under a new name, then reassigns `inventory_report.low_stock_items`
   to `fake_low_stock_items`.
2. `restock_alert({}, threshold=5)` is called — its own code runs
   unmodified, but the name `low_stock_items` it looks up now resolves
   to the fake, thanks to late binding.
3. The result, `["fake_item"]`, is asserted — proving `restock_alert`'s
   own logic (call `low_stock_items`, wrap the result in a list
   comprehension) behaved exactly as it should, entirely independent of
   what the real `low_stock_items` currently does.
4. `finally` restores the real `low_stock_items`, whether the `assert`
   above it passed or not.
5. The exact regression from Lesson 118 is reintroduced into the real
   `low_stock_items`. Lesson 118's own check fails, as it did before —
   this lesson's new check keeps passing, because it was never actually
   calling the broken function.
6. The regression is reverted, and both checks pass again, confirming
   nothing about this lesson's own substitution mechanism was left in a
   broken or half-patched state.

## What Breaks Without This

Without a test double, the only way to run `restock_alert` at all is to
run it together with whatever `low_stock_items` currently actually
does — exactly Lesson 118's own situation, and exactly why Lesson 118's
own check couldn't tell "I am broken" apart from "something I called is
broken." Restated plainly: this lesson doesn't make Lesson 118's check
wrong or unnecessary — it's still in the project, still passing, still
useful. What's missing without a test double is any way to ask the
narrower question Lesson 118's own SE Lens named directly: does
`restock_alert`'s own logic behave correctly, on the assumption that
whatever it calls behaves the way it's told to — a question with no
answer at all until something can actually make that assumption true on
demand, regardless of what the real collaborator is currently doing.

## Exercises

1. `fake_low_stock_items` currently ignores both of its own arguments,
   `inventory` and `threshold`, entirely. Rewrite it to actually inspect
   them — for example, asserting inside the fake itself that
   `threshold` really is `5`, the value `check_restock_alert_isolated`
   passes — and explain, in a comment, what extra confidence that gives
   beyond what this lesson's own version already provides.
2. Write `check_restock_alert_isolated_empty`, patching
   `low_stock_items` with a fake that always returns `[]` (an empty
   list), and confirm `restock_alert` correctly returns `[]` too — a
   case this lesson's own single check doesn't cover.
3. This lesson's monkey-patch reassigns `inventory_report.low_stock_
   items` directly, by hand, with an explicit `try`/`finally` to restore
   it. Research Python's own standard library `unittest.mock` module,
   specifically `unittest.mock.patch`, and identify what it automates
   about this exact pattern — without necessarily rewriting this
   lesson's check to use it yet.

## Definition of Done

- [ ] `check_restock_alert_isolated.py` exists, patches
      `inventory_report.low_stock_items` with `fake_low_stock_items`,
      and restores the real one inside a `finally` block.
- [ ] `check_restock_alert_isolated.py` passes against the correct
      project.
- [ ] `check_restock_alert_isolated.py` still passes after
      deliberately reintroducing Lesson 118's own regression into
      `low_stock_items` (verified, then reverted).
- [ ] `check_restock_alert.py` and every other existing check still
      pass, unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add check_restock_alert_isolated; a monkey-patched test double
      keeps this check passing even when low_stock_items regresses,
      closing the gap Lesson 118 left open` — not `add isolated test`.

Next: Lesson 124 — Mocks.
