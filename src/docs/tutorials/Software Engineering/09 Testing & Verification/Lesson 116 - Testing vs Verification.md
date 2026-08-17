# Lesson 116: Testing vs Verification

**What you will build.** Two small formatting functions are added to
`inventory-report`'s `inventory_report.py` — `format_reorder_line` and
`format_reorder_line_priced` — each with Python type hints on its
parameters and return value. Alongside them, `mypy`, a real static type
checker, is installed and run against the file. The first function is
correct and gets a check file in the same style Lesson 115 already
established. The second function ships with a real bug that would slip
past an ordinary code review — and the project's own check suite, run
in full, reports
100% green anyway, because nothing in it happens to call the broken
function. `mypy` catches the exact same bug in under a second, without
running a single line of the project. The transferable problem this
lesson is actually about: "the tests pass" is a much weaker claim than
it sounds like, and testing is not the only way — or even always the
fastest way — to get real evidence that a program is correct.

**What you need to know first.** Lesson 115 (Why Test?) — the
`check_low_stock_items` pattern this lesson extends: a plain Python
function, named `check_<something>`, that calls the real project code
with a concrete input, asserts the result, prints a success line, and is
called immediately at the bottom of its own file, with no separate test
framework involved. This lesson also reuses `inventory-report`'s own
`inventory_report.py`, `.gitignore`, `CODEOWNERS`, and the plain
`git init` / `git add` / `git commit` sequence established across Domain
8 (Version Control & Collaboration, Lessons 105–114).

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

This lesson sits, again, at **Verification** — the same stage Lesson 115
placed `inventory-report` on for the first time. Lesson 115's own
concrete value at that stage was `low_stock_items` run against
`{"widgets": 2, "gadgets": 5, "gizmos": 8}` with `threshold=5`, checked
by `check_low_stock_items` and shown to be re-runnable, automated
evidence — stronger than a one-time hand check, but still only evidence
about the exact inputs that one check happened to try. This lesson
carries the identical Verification placement forward with a new concrete
value at the same stage: `format_reorder_line("widgets", 12)`, checked
the same way Lesson 115's value was, and `format_reorder_line_priced(
"widgets", 12, 4.50)`, which turns out to be broken in a way no check in
the project's suite happens to exercise — proven broken instead by a
second, different kind of evidence that Lesson 115 didn't have available
yet. This lesson does not attempt to re-place `inventory-report` on any
other stage of the diagram above; Domain 8's own ten lessons already did
that work, and re-deriving it without reopening those lesson files would
risk fabricating a placement no prior session actually verified.

**Terms used in this lesson.**

- **Testing** — running a program, or some piece of it, against specific
  chosen inputs and checking whether the real output matches the
  expected one. Why it exists: it is the most direct way to get real,
  observed evidence about what code actually does, as opposed to what
  someone believes it does. Lesson 115's `check_low_stock_items` is
  testing.
- **Verification** — the general activity of producing evidence that a
  system meets its specification. Why the distinction matters: testing
  is *one* way to produce that evidence, not the only one, and treating
  the two words as synonyms makes it easy to believe "the tests are
  green" is the strongest claim that can be made about a program — when,
  as this lesson shows with a real, run example, it usually is not the
  strongest claim available.
- **Dynamic analysis** — any technique that examines a program by
  actually executing it and observing what happens. Testing is dynamic
  analysis. Why it has a name of its own: it has a specific, honest
  limitation — it can only ever report on the exact inputs and code
  paths a given run actually reached, never on the ones it didn't.
- **Static analysis** — any technique that examines a program's source
  code and reasons about it *without running it*. Why it exists: some
  properties (does this code path always return the type it promises?)
  can be checked once, for every possible execution at the same time,
  which a finite number of test runs — no matter how many — can never
  fully do.
- **Type hint (type annotation)** — Python syntax that attaches a
  declared type to a function parameter, a return value, or a variable,
  written as `name: type` for a parameter or `-> type` for a return
  value. Why it exists: Python itself never checks or enforces it at
  runtime, but it gives a separate, dedicated tool something concrete
  and structured to reason about instead of just plain, untyped code.
- **Type checker** — a program that reads a program's type hints and
  statically proves, or disproves, that its operations are consistent
  with them, without ever executing the program being checked. Why it
  exists: it is what turns a type hint from a comment-like suggestion a
  human might ignore into a claim that gets mechanically, provably
  checked on every single run of the checker, forever, for free.
- **Third-party package** — a unit of distributable code, published by
  someone other than this project's own author, meant to be installed
  and reused rather than written from scratch. `mypy` is one. Why it
  matters here, briefly: Python's own standard library ships no type
  checker at all — getting one means installing code this project did
  not write. Domain 12 (Build & Dependency Engineering) is where package
  installation, versioning, and dependency graphs get real, full
  treatment; this lesson uses exactly one command from that whole
  subject, mechanically, only to get one specific tool running.

**Objects and methods used.**

- **`str()`**
  - *What it is:* a built-in Python function — not a method on any
    particular object, callable directly by name, available in every
    Python program with no import.
  - *Implementation:* `str(x)` takes one argument of essentially any
    type and returns a new `str` object holding that value's textual
    representation — `str(12)` returns `"12"`, `str(4.5)` returns
    `"4.5"`.
  - *Its use:* this lesson's correct formatting code calls it explicitly
    to convert a number to text before joining it into a larger string
    with `+`; the buggy sibling function's entire bug is a single,
    missing call to exactly this function.
- **`mypy`**
  - *What it is:* a real, independently maintained static type checker
    for Python — a separate program, not part of Python itself, that
    reads a `.py` file's source code and its type hints and reasons
    about whether every operation in it is consistent with those hints.
  - *Implementation:* invoked from the command line as
    `python -m mypy <file>`. It never imports or executes the target
    file — it parses the source text into a structural representation
    and reasons about it entirely statically. It prints one line per
    problem found, in the shape `file.py:LINE: error: <message>
    [error-code]`, then a one-line summary, and exits with code `0` when
    it finds nothing wrong or a non-zero code when it does — the same
    zero-means-success, nonzero-means-failure convention `git` and every
    other command used so far in this curriculum already follows.
  - *Its use:* the whole second half of this lesson exists to prove,
    with real, run output, that `mypy` finds a genuine bug in
    `inventory-report`'s own new code that the project's existing,
    passing check suite never touches.
- **`function.__annotations__`**
  - *What it is:* a real, ordinary attribute that every Python function
    object carries — not something a programmer builds or opts into.
  - *Implementation:* a plain `dict`. Each key is a parameter name that
    was given a type hint (plus the special key `'return'` for a return
    annotation); each value is the actual type object written after the
    colon or arrow — for `def double(n: int) -> int:`, the dict is
    `{'n': <class 'int'>, 'return': <class 'int'>}`.
  - *Its use:* this lesson's first isolated lab inspects it directly to
    prove, by looking at real data rather than trusting a description,
    that a type hint is stored as inert data on the function object and
    nothing more — Python's own machinery does not consult it before
    calling the function.

---

## Concept Unit: Type Hints — Declared, Not Enforced

### The Problem

Two new small functions are about to be added to `inventory-report`: one
that turns a stock item and a reorder quantity into a printable line of
text, and a second one that does the same thing but also includes a
unit cost, for a report that needs to show total spend. Both functions
take numbers as arguments. Nothing in the Python language itself
requires stating what type those numbers are supposed to be, or checks
it if it is stated. So: if a future reader — or a future version of
`inventory-report` itself, calling this code from somewhere else in the
project — passes the wrong kind of value, how would anyone find out
before it actually happens in a real run?

### Introduce the Concept in Isolation

A small, throwaway, unrelated function — never part of `inventory-report`
— is enough to see what Python actually does with a declared type,
distinct from what a person might assume it does:

```python
def double(n: int) -> int:
    return n * 2

print(double(4))
print(double("ab"))
print(double.__annotations__)
```

Typed into a scratch file and run directly with `python3 double.py`, the
real output is:

```text
8
abab
{'n': <class 'int'>, 'return': <class 'int'>}
```

`double(4)` behaves exactly as the `n: int` hint promises: `4 * 2` is
`8`. But `double("ab")` runs too, without error, and returns `"abab"` —
Python's own `*` operator on a string repeats it, and nothing anywhere
in the language stopped a string from being passed to a parameter that
was declared `int`. The hint was written; it was simply never consulted.
The third line, printing `double.__annotations__`, shows exactly why:
the hint isn't gone or ignored in some mysterious sense — it is sitting
right there as a real, plain Python dictionary attached to the function
object itself, `{'n': <class 'int'>, 'return': <class 'int'>}`, available
to be read by anything that chooses to look at it. Python's own function
call machinery simply never looks. This is called a **type hint** — a
declared type that Python stores as data and does not enforce.

### Discard the Throwaway Example

`double` and this scratch file are not part of `inventory-report` and
will not appear in it. What survives is the fact just proven: a type
hint changes nothing about how a function actually runs; it only adds
data other tools can choose to read.

### Project Change

- **Reference Source.** No reference counterpart — `format_reorder_line`
  is a from-scratch addition to `inventory-report`'s own code, needed
  for a reorder report this lesson introduces, not a port of anything
  pre-existing.
- **Files affected.** `inventory_report.py`, modified — a new function
  appended. `check_format_reorder_line.py`, created — a new check file,
  same shape as Lesson 115's `check_low_stock.py`.
- **Change type.** Add.
- **Location.** `format_reorder_line` is appended to the end of
  `inventory_report.py`, directly after `reorder_suggestion`. It does
  not call `low_stock_items`, `restock_alert`, or `reorder_suggestion`,
  and none of those three are changed by this unit.
- **Dependencies.** None beyond what `inventory-report` already has —
  this unit needs no new package.

### The New Code

```python
def format_reorder_line(name: str, qty: int) -> str:
    return name + ": reorder " + str(qty)
```

### The Updated Project

`inventory_report.py`, in full, with the new function marked:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items at or below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)

def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(inventory, threshold)]

def reorder_suggestion(inventory, threshold=3, target=15):
    return {name: target - count for name, count in inventory.items() if count < threshold}

def format_reorder_line(name: str, qty: int) -> str:  # ← new
    return name + ": reorder " + str(qty)              # ← new
```

`low_stock_items`, `restock_alert`, and `reorder_suggestion` are shown
here unchanged, only so the file's real, current shape is visible rather
than left to guesswork — none of the three is this lesson's subject, and
none of them is called by the new code, so nothing about them is being
taught or retaught here. The file as a whole is now a small, flat
collection of independent top-level functions: three that reason about
inventory counts, and one new one that turns a single reorder decision
into a printable line of text.

### Mechanical Walkthrough

Every distinct syntactic element in the two new lines, in order:

- **`def format_reorder_line(`** — a function definition, the same
  construct `low_stock_items`, `restock_alert`, and `reorder_suggestion`
  already use above it in this same file: it creates a function object
  bound to the name `format_reorder_line`, containing the indented block
  that follows, and does not run that block yet — only calling
  `format_reorder_line(...)` later will.
- **`name: str`** — a parameter, `name`, carrying a **type hint**: the
  annotation `: str` declares that this parameter is meant to receive a
  string. As the isolated lab just proved, Python itself does not check
  this at the moment the function is called — the hint is stored, not
  enforced.
- **`qty: int`** — a second parameter, `qty`, annotated `: int` the same
  way, for the same reason: declaring an expected type, without Python
  enforcing it.
- **`) -> str:`** — a return type annotation. Placed after the closing
  parenthesis of the parameter list and before the final colon, `-> str`
  declares what type calling this function is expected to produce. Like
  the parameter hints, this is data attached to the function object —
  visible in `format_reorder_line.__annotations__['return']` exactly the
  way `double.__annotations__['return']` was visible above — and, same
  as the parameter hints, not enforced by Python itself: nothing stops
  this function's body from returning an `int` or `None` instead, if it
  were written to.
- **`return`** — a return statement: it ends execution of the function
  and hands the value of the expression that follows back to whatever
  code called it.
- **`name`** — a variable read: the value passed in as the `name`
  parameter, looked up and used as-is.
- **`+`** (first occurrence) — Python's string concatenation operator,
  used here between two `str` values (`name` and the literal that
  follows): it builds and returns a brand-new string containing the
  left operand's characters immediately followed by the right operand's
  characters. It does not modify either operand — strings in Python
  cannot be modified in place at all.
- **`": reorder "`** — a string literal: a fixed, unchanging sequence of
  characters written directly in the source code, including its
  leading and trailing spaces, which is exactly why they're there — to
  land correctly between `name` and the digits that come after.
- **`str(qty)`** — a call to the built-in `str()` function (given full
  treatment in the Header's Objects and methods section above),
  converting the integer `qty` into its text form. This call is the
  entire reason this function works: `qty` itself is an `int`, and
  Python's `+` operator for strings refuses to accept anything that
  isn't already a string on either side — `str(qty)` is what makes the
  right-hand operand of the next `+` a `str` instead of an `int`.
- **`+`** (second occurrence) — the same concatenation operator as
  before, joining the growing string (`name + ": reorder "`) to
  `str(qty)`, producing the final, complete line.

### CS Lens

The core idea this whole lesson is built around — a declaration that is
recorded as data but not enforced by the thing being declared to — shows
up under different names in several unrelated places:

```text
Also recognized in: a database column's declared type before a
CHECK constraint is added to actually enforce it, a REST API's
published OpenAPI schema (which describes what a client should send,
but doesn't stop a client from sending something else), a code
comment claiming what a function does (readable, but never checked
against what the function actually does), Java and C's own compiled
type systems by contrast — which do enforce their declarations, at
compile time, which is exactly the difference the next Concept Unit
in this lesson turns Python's hints into
```

### SE Lens

The alternative to writing type hints at all is the one `inventory-report`
has used since Lesson 105: plain, unannotated parameters, exactly like
`low_stock_items(inventory, threshold=3)` above. That alternative was
not wrong — every lesson through 115 worked without hints. The real
tradeoff a hint buys is not enforcement (Python still won't enforce it,
as just proven) but *legibility to tooling*: a hint is a small, one-time
annotation cost, paid once per parameter, in exchange for making a
function's expected shape something a separate program can read and
reason about later, instead of something only a human reading the source
can infer. The honest cost this project is now carrying: every future
function added to `inventory_report.py` that skips a type hint is
opting that one function back out of everything the next Concept Unit
is about to make possible for the two that do have hints.

### Commands Needed

No new command is required for this unit — `format_reorder_line` and its
check file run with the same `python3 <file>.py` invocation every prior
`inventory-report` lesson has already used.

### Run It

`check_format_reorder_line.py`, in the same shape Lesson 115's
`check_low_stock.py` already established — a `check_` function that
calls the real code with a concrete input, `assert`s the result, prints
a success line, and calls itself immediately at module scope:

```python
from inventory_report import format_reorder_line

def check_format_reorder_line():
    result = format_reorder_line("widgets", 12)
    assert result == "widgets: reorder 12"
    print("check_format_reorder_line passed")

check_format_reorder_line()
```

Run directly:

```text
$ python3 check_format_reorder_line.py
check_format_reorder_line passed
```

Also running the existing `check_low_stock.py` again, unchanged, to
confirm nothing about this addition disturbed it:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
```

Both pass. `format_reorder_line` is real, typed, and has one piece of
automated, re-runnable evidence behind it — exactly Lesson 115's own
standard.

### Connecting Back

The isolated `double` example proved a type hint is inert, stored data.
`format_reorder_line` is the same idea, now inside the real project,
doing real work: two parameters and a return value, each declared, none
of it enforced by Python — which is precisely the gap the next Concept
Unit closes.

---

## Concept Unit: `mypy` — Verification Without Execution

### The Problem

`inventory-report`'s check suite — `check_low_stock.py` and
`check_format_reorder_line.py` — both pass. A second formatting function
is needed next: one that also shows a unit cost, for a report that has
to total up what reordering will actually spend. It gets written, typed
the same way `format_reorder_line` was. No check gets written for it yet
— there wasn't time, and `format_reorder_line`'s own check already
passes, so the suite still reports success either way. Does "the check
suite passes" mean this new function is safe to use?

### Introduce the Concept in Isolation

The same throwaway `double` function from the previous Concept Unit,
freshly retyped into a new scratch file, with a deliberately wrong call
left in on purpose:

```python
def double(n: int) -> int:
    return n * 2

print(double("ab"))
```

This file is never run with `python3` in this step — that's the entire
point. Instead, it's checked with `mypy`, a real static type checker,
run from the command line:

```text
$ python3 -m mypy double.py
double.py:4: error: Argument 1 to "double" has incompatible type "str"; expected "int"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

`mypy` never executed `double("ab")` — no `8`, no `"abab"`, nothing
printed by the program itself, because the program was never run. It
read the source text, read the `n: int` hint, read the literal `"ab"`
being passed at the call site, and *proved* — for that call, without
running it — that the two are inconsistent. This is called **static
type checking**: a form of **verification** that produces real evidence
about a program without ever executing it, as opposed to **testing**,
which — as every check file in this project so far has done — always
does.

### Discard the Throwaway Example

This second `double.py` is discarded the same way the first one was; it
will not appear in `inventory-report`. What survives is the proof that a
separate tool, reading only source text and type hints, can catch a real
mistake a human would otherwise only discover by actually running the
code with that exact bad input.

### Project Change

- **Reference Source.** No reference counterpart — `format_reorder_line_
  priced` is a from-scratch addition, needed for the cost-total report
  this lesson is building toward.
- **Files affected.** `inventory_report.py`, modified — a second new
  function appended.
- **Change type.** Add.
- **Location.** Appended directly after `format_reorder_line`, at the
  end of the file.
- **Dependencies.** `mypy` itself — a real, external, third-party
  package, not part of Python's standard library. Installed once per
  environment; see Commands Needed, below.

### The New Code

```python
def format_reorder_line_priced(name: str, qty: int, unit_cost: float) -> str:
    return name + ": reorder " + qty + " units at $" + str(unit_cost)
```

Read that return line closely before continuing — it has a real bug in
it, on purpose, left in exactly the way an actual, rushed addition to a
real project might.

### The Updated Project

`inventory_report.py`, in full, with the new (and, for now, still
broken) function marked:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items at or below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)

def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(inventory, threshold)]

def reorder_suggestion(inventory, threshold=3, target=15):
    return {name: target - count for name, count in inventory.items() if count < threshold}

def format_reorder_line(name: str, qty: int) -> str:
    return name + ": reorder " + str(qty)

def format_reorder_line_priced(name: str, qty: int, unit_cost: float) -> str:  # ← new
    return name + ": reorder " + qty + " units at $" + str(unit_cost)          # ← new
```

### Mechanical Walkthrough

The signature line repeats the same pattern `format_reorder_line`
already established — a third parameter, `unit_cost: float`, is a type
hint the same way `name: str` and `qty: int` are, declaring an expected
`float` without Python enforcing it, and `-> str` declares the return
type the same way it did on the function above it. The body is where
the real difference — and the real bug — is:

- **`name`** — a variable read, the string passed in, same as before.
- **`+`** — string concatenation, joining `name` to the literal that
  follows, same operator as before.
- **`": reorder "`** — the same kind of string literal as before.
- **`qty`** — a variable read. This is the bug: `qty` is read directly
  here, as the raw `int` it was declared to be, with **no** `str()`
  call around it — unlike the line directly above it in this same file,
  which does call `str(qty)`.
- **`+`** — the same concatenation operator, but now being asked to
  concatenate a `str` (everything built so far) with an `int` (`qty`
  itself, unconverted). Python's `+` operator for strings does not
  accept this combination at all — this single operator, given these
  two specific operand types, is where the function will fail the
  moment it actually runs.
- **`" units at $"`**, **`str(unit_cost)`**, and the final **`+`** — these
  are all written correctly (`unit_cost` *is* wrapped in `str()`), but
  Python never gets far enough to reach them: the failure above happens
  first, left to right, before this part of the expression is ever
  evaluated.

### CS Lens

```text
Also recognized in: a structural engineer checking a bridge's blueprint
against load-bearing formulas before any physical beam is ever poured
or tested, a proofreader catching a contradictory clause in a contract
before it is signed and invoked, a spell-checker underlining a
misspelled word while the document is still being written rather than
after it's printed and mailed, a compiler rejecting a program that
would type-mismatch on some input, before that input is ever supplied
```

### SE Lens

The check suite — run in full, right now, on this exact broken code — is
about to report 100% success, because nothing in it calls
`format_reorder_line_priced` at all. That is not a flaw in the checks
that already exist; `check_low_stock.py` and `check_format_reorder_line.py`
are both still telling the truth about the exact things they test. The
gap is what "the suite passes" is being asked to mean: it means *the
inputs someone thought to check are fine* — it says nothing at all about
`format_reorder_line_priced`, because nothing asked it to. The
alternative to reaching for `mypy` here would be writing more tests
until confidence feels sufficient — but "sufficient" is never provably
complete that way; there is always one more untested input. Static type
checking trades a small, one-time annotation cost (already paid, in the
previous Concept Unit) for a check that covers *every* call to a typed
function, on *every* future run of `mypy`, for free, without a human
having to think of the specific bad input first. The honest limit,
proven for real later in this lesson's own Exercises: `mypy` can only
prove what the type system can express. A function that returns the
wrong *number* — correct type, wrong value — is completely invisible to
it. That gap is exactly what testing, and later lessons in this domain,
still exist to cover.

### Commands Needed

`mypy` does not ship with Python — it is a real, separate, third-party
package, and has to be installed once per environment before it can run
at all:

```text
$ python3 -m pip install mypy
```

- `python3` — the same Python interpreter every command in this
  curriculum has already used.
- `-m pip` — runs Python's own bundled package installer, `pip`, as a
  module, the same `-m` flag `python3 -m mypy` itself uses below; this
  is the one command in this lesson that belongs to Domain 12 (Build &
  Dependency Engineering) rather than Domain 9, used here only
  mechanically to get one tool running.
- `install mypy` — `pip`'s own subcommand, `install`, followed by the
  package name to fetch and install, `mypy`.

Real output from running it (trimmed to what matters — the exact
version numbers downloaded are not the point):

```text
Successfully installed mypy-2.3.1 ...
```

Once installed, `mypy` itself is run the same way throughout this
lesson:

```text
$ python3 -m mypy inventory_report.py
```

- `python3 -m mypy` — runs the newly installed `mypy` package as a
  module, the same `-m` pattern used to invoke `pip` itself above.
- `inventory_report.py` — the one file to check; `mypy` reads only this
  file's source text, and does not execute any of it.

### Run It

First, the full check suite, run exactly as it stands, with the bug from
the New Code step still in `inventory_report.py`:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
$ python3 check_format_reorder_line.py
check_format_reorder_line passed
```

Both pass. There is no third check file yet, so nothing in this run
touches `format_reorder_line_priced` at all — the suite, taken as a
whole, reports total success.

Now `mypy`, against the same file, in the same broken state:

```text
$ python3 -m mypy inventory_report.py
inventory_report.py:19: error: Unsupported operand types for + ("str" and "int")  [operator]
Found 1 error in 1 file (checked 1 source file)
```

One real error, on line 19 — the exact `+` between the accumulated
string and the unconverted `qty` identified in the Mechanical Walkthrough
above — found without running `check_low_stock.py`, without running
`check_format_reorder_line.py`, and without ever calling
`format_reorder_line_priced` itself.

To prove this is not a theoretical concern, `format_reorder_line_priced`
is now actually called directly, the way a real caller eventually would:

```python
from inventory_report import format_reorder_line_priced
print(format_reorder_line_priced("widgets", 12, 4.50))
```

Run directly, this crashes exactly where `mypy` already said it would,
proving the static claim from a moment ago with a real, dynamic one:

```text
Traceback (most recent call last):
  File "<string>", line 2, in <module>
  File "/path/to/inventory-report/inventory_report.py", line 19, in format_reorder_line_priced
    return name + ": reorder " + qty + " units at $" + str(unit_cost)
           ~~~~~~~~~~~~~~~~~~~~^~~~~
TypeError: can only concatenate str (not "int") to str
```

A real, uncaught `TypeError`, at the exact line `mypy` already flagged,
seconds before this call was ever made. The fix is the one-word change
the Mechanical Walkthrough already named — wrap `qty` in `str()`, the
same way the line above it already wraps `unit_cost`:

```python
def format_reorder_line_priced(name: str, qty: int, unit_cost: float) -> str:
    return name + ": reorder " + str(qty) + " units at $" + str(unit_cost)
```

`mypy`, rerun after the fix:

```text
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

The same direct call, rerun after the fix:

```text
$ python3 -c "from inventory_report import format_reorder_line_priced; print(format_reorder_line_priced('widgets', 12, 4.50))"
widgets: reorder 12 units at $4.5
```

A third check file closes the gap the whole unit was built around,
following the exact same shape as the two before it:

```python
from inventory_report import format_reorder_line_priced

def check_format_reorder_line_priced():
    result = format_reorder_line_priced("widgets", 12, 4.50)
    assert result == "widgets: reorder 12 units at $4.5"
    print("check_format_reorder_line_priced passed")

check_format_reorder_line_priced()
```

The full suite, run one more time, now legitimately green — every
function in the file has both a real check and a clean `mypy` pass
behind it:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
$ python3 check_format_reorder_line.py
check_format_reorder_line passed
$ python3 check_format_reorder_line_priced.py
check_format_reorder_line_priced passed
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `double("ab")` example proved `mypy` can catch a bad call
without running it. `format_reorder_line_priced` proved the identical
thing about real, working project code carrying a real bug that the
project's own passing check suite never noticed — and then showed, with
a real, uncaught traceback, exactly what that bug does the moment
someone finally does call it. Fixing it and adding the missing check
closes both gaps at once: one piece of dynamic evidence (the check) and
one piece of static evidence (`mypy`), covering two different things
neither one alone was covering by itself.

---

## Connect the Pieces

One concrete value, `"widgets"` / `12` / `4.50`, moving through every
piece this lesson built, start to finish:

1. `format_reorder_line(name: str, qty: int) -> str` is written, with
   type hints — declared, not enforced, per the first Concept Unit's
   own `double("ab")` proof.
2. `format_reorder_line("widgets", 12)` is called for real and returns
   `"widgets: reorder 12"`, exactly as expected — nothing about adding
   hints changed how the function actually runs.
3. `check_format_reorder_line.py` calls it with that exact value,
   asserts the result, and passes — one piece of dynamic, execution-
   based evidence, the same kind Lesson 115 already established.
4. `format_reorder_line_priced(name: str, qty: int, unit_cost: float) ->
   str` is written next, also with type hints, but with a real bug: `qty`
   reaches the `+` operator unconverted.
5. The full check suite is run. It reports total success — `"widgets"` /
   `12` / `4.50` is never passed to the broken function by anything in
   the suite, so the suite has no way to know it's broken.
6. `python3 -m mypy inventory_report.py` is run instead. Without
   executing anything, it reads the same declared types from step 4 and
   reports the exact operator that will fail — the first real evidence
   anything has produced that this function is broken.
7. `format_reorder_line_priced("widgets", 12, 4.50)` is called directly
   and crashes with a real `TypeError`, confirming `mypy`'s static claim
   with a second, dynamic one.
8. The missing `str(qty)` is added. `mypy` reports success. The direct
   call now returns `"widgets: reorder 12 units at $4.5"`. A third check
   file exercises exactly that value, asserts it, and passes.
9. The full suite and `mypy` are both run one final time, both clean —
   `"widgets"` / `12` / `4.50` is now genuinely, not just apparently,
   verified two different ways.

## What Breaks Without This

The type hints are removed from both functions, on a scratch copy, with
the `qty` bug from step 4 above deliberately left back in — the exact
same bug this whole lesson was built around, restored on purpose:

```python
def format_reorder_line(name, qty):
    return name + ": reorder " + str(qty)

def format_reorder_line_priced(name, qty, unit_cost):
    return name + ": reorder " + qty + " units at $" + str(unit_cost)
```

`mypy`, run against this version:

```text
$ python3 -m mypy nohints_check.py
Success: no issues found in 1 source file
```

Not an error. Not a warning. `Success`, on a file that contains the
identical bug shown crashing with a real traceback earlier in this
lesson. With no annotations at all, `mypy`'s default behavior treats an
unhinted parameter as capable of holding anything, and does not check
operations performed on it — there is no declared type left for it to
compare `qty`'s use against. Removing the type hints does not remove the
bug. It removes verification's ability to see it, leaving only whatever
a human happens to test — which, as this exact lesson already showed
once, is not guaranteed to be the input that finds it.

## Exercises

1. Add a type hint to `restock_alert`'s existing signature
   (`inventory: dict`, `threshold: int = 3`, returning `list`) and run
   `mypy` against it. It should report success — `restock_alert`'s
   existing body was already type-consistent, even before this lesson
   added hints anywhere.
2. Add type hints to `reorder_suggestion` the same way, then, on a
   scratch copy only, swap `target - count` for `count - target` inside
   it — a real, wrong, but *type-consistent* bug (both operands are
   still `int`; the result is still `int`). Run `mypy` against the
   scratch copy. It reports success. Then call the swapped function
   directly with a real inventory and read the numbers it returns. This
   is the honest boundary the SE Lens above named: `mypy` proves type
   *shape* is correct; it has nothing to say about whether the value
   produced is the right one.
3. Write a `check_reorder_suggestion` file, in the same style as this
   lesson's three check files, that would have caught exercise 2's
   swapped-operator bug by asserting a real, known-correct output value
   — demonstrating that this specific class of bug is exactly what
   testing still has to cover, precisely because static type checking
   cannot.

## Definition of Done

- [ ] `format_reorder_line` and `format_reorder_line_priced` both exist
      in `inventory_report.py`, both fully typed.
- [ ] `format_reorder_line_priced`'s `qty` is wrapped in `str()`, same as
      `unit_cost` beside it.
- [ ] `python3 -m mypy inventory_report.py` reports `Success: no issues
      found in 1 source file`.
- [ ] `check_low_stock.py`, `check_format_reorder_line.py`, and
      `check_format_reorder_line_priced.py` all print their own
      `passed` line when run directly.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why*, not just what — for
      example: `add typed reorder formatting; mypy now checks every
      call for type consistency the existing check suite doesn't
      exercise`, not `add two functions`.

Next: Lesson 117 — Test Oracles.
