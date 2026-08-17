# Lesson 135: Flaky Tests

**What you will build.** A new function, `low_stock_across_stores`, that
combines the low-stock reports from several store inventories into one
deduplicated list — and, when its very first real test turns out to pass
and fail unpredictably with zero code changes between runs, a small
`detect_flaky_tests.py` harness that reruns a check dozens of times in
fresh, independent processes and tallies the real pass/fail rate, turning
a vague suspicion ("this test feels unreliable") into hard, counted
evidence. The transferable problem underneath both: a test's own single
pass or fail is not, by itself, proof of anything, and knowing when to
distrust a green checkmark — and how to go get real evidence instead of
just rerunning until it turns green — is a distinct skill from writing
the test in the first place.

**What you need to know first.** Lesson 133 (Test Isolation) named a
different, flaky-feeling failure mode: two checks silently sharing one
mutable dictionary, so the test *suite's* own run order changed the
result. This lesson's own cause has nothing to do with run order or
shared state — every check in this lesson builds its own fresh data.
Lesson 134 (Determinism) named the other classic flaky cause: an
unseeded `hypothesis` strategy silently drawing different random inputs
on different runs, fixed with `@seed`. This lesson's own cause has
nothing to do with randomness the reader controls, either — nothing in
this lesson's new code calls `random` or `hypothesis` at all. Lesson 120
(System Tests) established `subprocess.run`, `sys.argv`, and this
project's own CLI-argument-driven script convention (`inventory_cli.py`),
all reused directly in this lesson's own new `detect_flaky_tests.py`.
`low_stock_items` (Lesson 115 onward) is called directly by this
lesson's own new function.

**Pipeline diagram.** This lesson continues Domain 9's own placement on
the 17-stage lifecycle pipeline first laid out in Lesson 12:

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

This lesson, like every lesson in this domain since Lesson 115, sits on
**Verification** — producing real evidence about whether the system
actually behaves the way it's supposed to, as distinct from
*Implementation*, the stage directly above it, which is only about the
system existing at all. `inventory-report/`, this domain's own running
project, was first placed on this pipeline as a real, working
Implementation back in Lesson 105, at the start of Domain 8, already
existing as a working file with no dedicated Problem, Requirements,
Domain model, Specification, Architecture, or Design placement of its
own — those earlier stages were each worked out using this curriculum's
*other* running examples, in their own domains, never using this
project. `inventory-report/` keeps landing new evidence on this same
Verification stage, lesson after lesson: Lesson 128's `hypothesis`-found
counterexample, Lesson 131's hand-run mutation, Lesson 134's
`@seed`-fixed determinism, and now this lesson's own repeated-subprocess
flake detection. The concrete literal value carried through this
lesson's own work is the item name `"bolts"`, introduced fresh by this
lesson's own new `low_stock_across_stores` function — this project's own
running values have been project-specific since Domain 8 began, not
inherited from Domain 1's own separate worked example — and it is traced
through every stage this lesson's own work touches in the Closing's
"Connect the Pieces" section, below.

**Terms used in this lesson.**

- **Flaky test** — a test whose outcome (pass or fail) is not a reliable
  function of the code under test: run the identical test against
  identical, unchanged code, and get different results on different
  runs. This is named as its own distinct failure mode, separate from
  "broken test" (reliably fails) or "correct test" (reliably passes),
  because a flaky test corrupts the entire signal a test suite exists to
  provide — a red run might mean nothing changed, and a green run might
  mean nothing was actually checked. Left unnamed and undetected, this
  wastes real engineering time chasing phantom regressions, or worse,
  teaches engineers to distrust and ignore CI entirely, which is exactly
  the condition under which a real regression slips through unnoticed.
- **Hash randomization** — CPython's practice of picking a fresh,
  unpredictable seed value for hashing strings and bytes once per
  process, at interpreter startup, instead of using one fixed hash
  function forever. This exists as a security fix (Python 3.3+, PEP
  456) against "hash-flooding" denial-of-service attacks, where an
  attacker who knows a fixed hash function can deliberately craft many
  keys that collide inside a hash table, degrading lookups from average
  O(1) to worst-case O(n) and stalling a server that hashes attacker-
  controlled input (form field names, JSON keys, and the like).
  Randomizing the seed per process makes those collisions unpredictable
  to an outside attacker — but a real side effect rides along with the
  fix: anything ordered by string hash, most visibly the iteration order
  of a `set`, inherits that exact same per-process randomness.
- **Test flakiness detection by repetition** — treating a test's own
  pass/fail outcome as one sample drawn from a distribution, not a fixed
  fact, and running it many times in fresh, independent processes to see
  whether the outcome actually varies. This exists because a single run
  of a flaky test is statistically indistinguishable from a single run
  of a reliable one — the entire defining trait of "flaky" is invisible
  from any one observation alone, so the only way to actually tell the
  two apart is to sample more than once.
- **Quarantine (a flaky test)** — an interim response to a known flaky
  test: mark it so it no longer blocks a required CI check (skip it, or
  move it out of the required set) while keeping it visibly present and
  tracked, without deleting it. This exists as a middle path between two
  worse options: deleting the test throws away real coverage and hides
  that a bug might genuinely exist underneath the flakiness; leaving it
  blocking CI as-is trains engineers to treat red builds as noise.
  Quarantining buys time to root-cause the real problem without paying
  either of those costs — but it is an honestly temporary state, not a
  fix, and it carries its own real cost: a quarantined test provides
  zero signal for however long it stays quarantined.

**Objects and methods used.**

- **`set()`**
  - *What it is:* a built-in mutable collection type holding only
    unique, hashable elements, with no guaranteed iteration order.
  - *Implementation:* constructed via `set()` (empty) or a `{...}`
    literal; supports `.add(item)`, `.update(iterable)`, membership
    testing with `in`, and set algebra (`|`, `&`, `-`); backed
    internally by a hash table — the same general structure behind
    Python's own `dict`.
  - *Its use:* dedupes item names collected from more than one store's
    inventory, without a hand-written "have I already added this name"
    check.
- **`set.update(iterable)`**
  - *What it is:* a mutating method that adds every element of
    `iterable` into the set in place, silently ignoring any element
    already present.
  - *Implementation:* verified this session via `help(set.update)`:
    "Update a set with the union of itself and others" — signature
    `set.update(*others)`, accepting any number of iterables, returning
    `None`.
  - *Its use:* merges each store's own already-computed low-stock names
    into one running set, one store at a time, inside a loop.
- **`sorted()`** (reappearing — already used elsewhere in this same
  file, inside `low_stock_items` and `build_reorder_report`)
  - *What it is:* a built-in function that returns a new, ordered `list`
    built from any iterable, without modifying the original.
  - *Implementation:* verified this session via `help(sorted)`:
    `sorted(iterable, /, *, key=None, reverse=False)` — returns a new
    list containing every item from the iterable in ascending order; for
    strings, ascending means lexicographic (character-code) order.
  - *Its use:* this lesson's own fix — converting the unordered `set`
    back into a deterministic, alphabetically-ordered list before
    returning it, matching the exact convention this file's other two
    list-returning functions already follow.
- **`str.join(iterable)`**
  - *What it is:* a string method that builds one new string by placing
    a copy of the string it was called on between every pair of elements
    from `iterable`.
  - *Implementation:* verified this session via `help(str.join)`:
    `join(self, iterable, /)` — "Concatenate any number of strings. The
    string whose method is called is inserted in between each given
    string." Every element of `iterable` must already be a `str`, or it
    raises `TypeError`.
  - *Its use:* turns the list of low-stock names into one human-readable,
    comma-separated report line — which is exactly the kind of output
    whose correctness depends on order, making it the right place to
    put the assertion that ends up exposing this lesson's own flake.
- **`subprocess.run(args, ...)`** (reappearing from Lesson 120, System
  Tests)
  - *What it is:* a function that launches a brand-new, fully
    independent operating-system process, waits for it to finish, and
    returns an object describing what happened.
  - *Implementation:* verified this session via `inspect.signature` and
    by actually constructing and inspecting a real `CompletedProcess`
    this session: `subprocess.run(*popenargs, input=None,
    capture_output=False, timeout=None, check=False, **kwargs)`. The
    object it returns, `subprocess.CompletedProcess`, is a real class
    whose own docstring (read directly this session) says: "A process
    that has finished running... Attributes: args: The list or str args
    passed to run(). returncode: The exit code of the process, negative
    for signals. stdout: The standard output (None if not captured).
    stderr: The standard error (None if not captured)." Its real,
    declared shape, quoted rather than paraphrased from that docstring:
    ```python
    class CompletedProcess:
        args           # the list or str args passed to run()
        returncode: int  # exit code; 0 = normal exit, nonzero = abnormal
        stdout          # captured stdout, or None if not captured
        stderr          # captured stderr, or None if not captured
        def check_returncode(self): ...  # raises if returncode != 0
    ```
    `text=True`, passed by this lesson's own code, makes `stdout`/
    `stderr` come back as `str` instead of raw `bytes`.
  - *Its use:* this lesson depends on `subprocess.run` for a reason
    beyond convenience. A genuinely new OS process is the only way to
    get a genuinely new, unpredictable hash seed; calling the same
    function twice inside one already-running Python process, by
    contrast, reuses that one process's single fixed seed for its
    entire lifetime and would never reveal this lesson's own flake at
    all — proven directly, below.
- **`sys.argv`** (reappearing from Lesson 120's `inventory_cli.py`)
  - *What it is:* a plain `list[str]` the interpreter populates with the
    command line the script was invoked with, before any of the
    script's own code runs.
  - *Implementation:* `sys.argv[0]` is always the script's own path;
    `sys.argv[1:]` are the actual arguments a caller passed after it.
  - *Its use:* lets `detect_flaky_tests.py` take which check to rerun,
    and how many times, as command-line arguments — the identical
    calling convention `inventory_cli.py` already established.
- **`int()`** (reappearing — Lesson 120's own missing call to this exact
  function, on a CLI argument, was the real bug a system test caught
  there)
  - *What it is:* a built-in type constructor that converts its argument
    into an integer.
  - *Implementation:* `int(x) -> int`; raises `ValueError` if `x` is a
    string that isn't a valid integer literal.
  - *Its use:* converts the rerun-count argument, which arrives from
    `sys.argv` as a plain string, into a real integer `range()` can use.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`range(n)`**
  - *What it is:* a built-in that produces a lazy sequence of integers
    from `0` up to, but not including, `n`.
  - *Implementation:* `range(stop)`, or `range(start, stop, step)`;
    doesn't build a real list in memory — it produces the next integer
    on demand.
  - *Its use:* drives the rerun loop exactly `times` times.
- **`_` as a loop variable**
  - *What it is:* not special syntax — an ordinary variable name.
    Python attaches no meaning to it at all.
  - *Implementation:* any other name would behave identically; this is a
    naming convention, not a language feature.
  - *Its use:* signals to a reader, on sight, that this loop's own
    counter value is never read inside the loop body — the loop only
    cares about *how many times*, not *which* iteration it's on.
- **`if __name__ == "__main__":`** (reappearing — `inventory_cli.py`
  already uses this exact guard)
  - *What it is:* a conditional that's only true when this file is the
    one actually invoked from the command line, not when some other
    file imports it.
  - *Implementation:* every module gets a `__name__` variable, set by
    the interpreter; it holds the string `"__main__"` for the script
    that was actually run, and the module's own filename-derived name
    otherwise.
  - *Its use:* lets `rerun()` be imported and reused by some other
    script later without also auto-running `main()`.
- **Returning multiple values as a tuple (`return passed, failed`)**
  - *What it is:* comma-separated values after `return` are packed into
    one `tuple`; the reverse operation, unpacking, pulls a tuple's
    values back into separate names.
  - *Implementation:* `return a, b` is shorthand for `return (a, b)`.
    The unpacking side, `x, y = some_tuple`, is the exact same mechanism
    `for name, count in inventory.items()` already performs, elsewhere
    in this same file, on every dictionary item.
  - *Its use:* lets `rerun()` hand back two related counts from one
    call, without a dedicated class or a two-key dict just for this.
- **String concatenation with `+` and `str()`** (reappearing throughout
  this project — `format_reorder_line` already builds its own message
  the identical way)
  - *What it is:* `+` between two `str` values produces one new, longer
    `str`; `str(x)` converts a non-string value into its printable
    string form first, since `+` refuses to silently mix a `str` and an
    `int`.
  - *Implementation:* `str.__add__` for concatenation; `int.__str__` for
    the conversion.
  - *Its use:* builds the one-line pass/fail summary
    `detect_flaky_tests.py` prints.
- **Augmented assignment (`+=`)**
  - *What it is:* shorthand that reads a variable's current value, adds
    to it, and reassigns the result back to the same name.
  - *Implementation:* `x += 1` is equivalent to `x = x + 1`.
  - *Its use:* tallies `passed`/`failed` counts across the rerun loop.

---

## Concept Unit: Sets and Non-Deterministic Iteration Order

### The Problem

The warehouse this project reports on now has more than one physical
store. Each store keeps its own inventory counts, so each store has its
own `low_stock_items(inventory, threshold)` result already — that much,
this project already handles, one store at a time. What it can't do yet
is combine several stores into a single report: if `"widgets"` is low at
two different stores, a naive combination (just concatenating the two
lists) would list `"widgets"` twice, which is wrong — a manager reading
the combined report needs to know *which items* need reordering, not how
many separate stores happen to be low on the same item. The report needs
the *union* of low-stock names across every store, with duplicates
collapsed into one entry each.

### Project Change

- **Reference Source:** no reference counterpart — this is a
  from-scratch addition. `inventory-report/`'s own running example has
  been project-specific since Domain 8 began (see this lesson's own
  Pipeline diagram note, above); multi-store support was never part of
  any earlier lesson's own plan for this project, and this lesson
  introduces it directly to create a genuine, real reason to build a
  `set`.
- **Files affected:** `inventory_report.py`, modified.
- **Change type:** add.
- **Location:** after `apply_reorder`, currently the last function in
  the file.
- **Dependencies:** none new — `low_stock_items`, already defined
  earlier in this same file, is called directly.

### The New Code

```python
def low_stock_across_stores(store_inventories, threshold=3):
    low_names = set()
    for inventory in store_inventories:
        low_names.update(low_stock_items(inventory, threshold))
    return list(low_names)
```

### The Updated Project

Skipped for this unit: `low_stock_across_stores` is a brand-new,
freestanding function with nothing already surrounding it — the same
carve-out the schema names for "a brand-new file or a freestanding new
function." There's no existing enclosing structure to show it landing
inside of yet; `inventory_report.py` simply gains this one new function
at the bottom of the file, exactly as shown above.

### Isolating the Concept: Non-Deterministic Set Iteration Order

Before trusting what `low_names.update(...)` and `list(low_names)` in
the code just shown actually produce, isolate `set` on its own,
unrelated data. First, prove the dedup itself, the reason a `set` was
reached for in the first place:

```python
seen = set()
seen.update(["apple", "banana"])
seen.update(["banana", "cherry"])
print(seen)
print(len(seen))
```

Run for real:

```text
{'apple', 'banana', 'cherry'}
3
```

`len(seen)` is `3`, not `4`, even though four total strings were passed
across the two `.update()` calls — `"banana"` was added twice but only
counted once. That's the dedup working exactly as intended, and it's the
entire reason `low_names` in the real function above is a `set` and not
a plain `list`.

But the printed order — `apple`, `banana`, `cherry` — happens to be
alphabetical here, and that's a coincidence, not a guarantee. Prove it,
by running the *identical* one-line program as several genuinely
separate operating-system processes, not several calls inside one
already-running program:

```bash
python3 -c "print(list({'red', 'green', 'blue'}))"
python3 -c "print(list({'red', 'green', 'blue'}))"
python3 -c "print(list({'red', 'green', 'blue'}))"
python3 -c "print(list({'red', 'green', 'blue'}))"
python3 -c "print(list({'red', 'green', 'blue'}))"
```

Run for real, five separate times:

```text
['red', 'blue', 'green']
['red', 'blue', 'green']
['blue', 'green', 'red']
['blue', 'green', 'red']
['green', 'red', 'blue']
```

Same literal source code, same three strings, zero code changes between
runs — and three different orderings across five runs. This is called
**non-deterministic iteration order**, and it's caused by **hash
randomization**: CPython picks a fresh, unpredictable seed for hashing
strings once, when each process starts, and a `set`'s internal layout —
and therefore the order Python walks it in — depends on where each
element's hash happens to land in that layout. Two runs that pick
different seeds can walk the identical three strings in a different
order, and there is no way to predict which order a given run will
produce without also knowing that run's own seed. This is exactly what
`low_names` in the real function above is doing, isolated: the function
builds a `set`, and `list(low_names)` walks it in whatever order that
one process's own hash seed happens to produce.

This throwaway example — both the `seen` dedup script and the five
`red`/`green`/`blue` process runs — is discarded now and does not appear
in the project again. It used values (`apple`/`banana`/`cherry`,
`red`/`green`/`blue`) chosen specifically to have no relationship to
this project's own inventory data, so that nothing here is mistaken for
real project code going forward.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code block, in order:

- `def low_stock_across_stores(store_inventories, threshold=3):` —
  defines a new function taking two parameters: `store_inventories`, a
  plain list of dicts (one dict per store, each shaped exactly like
  every other inventory dict this project already handles — item name
  to count), and `threshold`, reusing the same default value (`3`) every
  other threshold-taking function in this file already defaults to.
- `low_names = set()` — calls the `set` constructor with no arguments,
  producing a new, empty set, and binds it to the name `low_names`. An
  empty set is the correct starting point for "the union of everything
  I'm about to add," the same role an empty list (`[]`) or empty dict
  (`{}`) plays as an accumulator elsewhere in this same file (`low` in
  `low_stock_items`, `lines` in `build_reorder_report`).
- `for inventory in store_inventories:` — an ordinary `for` loop, already
  established throughout this project, here iterating once per store's
  own inventory dict rather than once per item — the loop variable
  `inventory` holds one entire dict per iteration, not a single name or
  count.
- `low_names.update(low_stock_items(inventory, threshold))` — two calls
  on one line, evaluated inside-out. `low_stock_items(inventory,
  threshold)` is called first: this is the exact same function already
  defined at the top of this file, reused here without any
  modification, returning the sorted list of item names in *this one
  store's* inventory whose count is strictly below `threshold`. That
  returned list is then passed straight into `low_names.update(...)`,
  which adds every name in it into the running set, silently skipping
  any name already present from an earlier store's own pass through this
  loop.

  Tracing what `low_names` actually holds after each pass through the
  loop, using the three real store dicts this lesson's own "Run It"
  step, below, uses:

  ```text
  Iteration 1: inventory = store_a → low_stock_items = ["widgets"] → low_names = {'widgets'}
  Iteration 2: inventory = store_b → low_stock_items = ["gizmos"] → low_names = {'widgets', 'gizmos'}
  Iteration 3: inventory = store_c → low_stock_items = ["bolts"] → low_names = {'widgets', 'gizmos', 'bolts'}
  ```

  (Set contents, not order — a `set`'s own printed order is exactly what
  this lesson is about to prove is unreliable, so this trace deliberately
  states only *which* elements are present after each step, never what
  position they'd print in.) Each iteration calls `low_stock_items` fresh
  on that one store's own dict alone, contributing whatever it finds;
  `store_c`'s own `"widgets"` entry, at a count of `5`, is not low, so
  `low_stock_items(store_c, 3)` never returns it in the first place —
  `.update()` never actually has a duplicate to silently drop here, since
  `"widgets"` only ever enters the set once, during iteration 1.
- `return list(low_names)` — calls the `list` constructor on the set,
  producing a new list containing the same elements, in whatever order
  the set's own internal hash-table layout happens to walk them in for
  this process. This is the line proven, above, to be non-deterministic
  — and, not yet fixed at this point in the lesson, the actual bug.

### CS Lens

This is a **hash table**: the same general data structure backing
Python's own `dict`, most languages' "map"/"dictionary" type, and
`set` itself — a structure that trades away any guaranteed ordering in
exchange for average O(1) membership testing and insertion, by computing
a hash of each element and using that hash to decide where in an
internal array the element lives. Hash randomization, and the resulting
non-deterministic iteration order this lesson just proved, is a genuine,
real consequence of that same design, not a bug in CPython's own `set`
implementation.

Also recognized in: hash-flooding denial-of-service defenses added
around the same era, for the identical reason, to other languages'
standard libraries and runtimes, not just CPython's — a well-known
category of real-world security fix, not a Python-specific quirk;
Python's own `dict` type itself, before Python 3.7, when iteration order
was explicitly unspecified for exactly this same underlying reason
(3.7 made insertion order a guaranteed, documented property of `dict`
specifically — `set` never received that same guarantee); hash-based
load balancers, which deliberately route requests to different backend
servers based on a hash of some request field; hash joins in a database
query planner, which may emit matching rows in an order that has nothing
to do with either input table's own row order.

### SE Lens

The alternative not chosen here: build `low_names` as a plain `list`,
checking `if name not in low_names` before appending, instead of reaching
for a `set` at all. That alternative would have preserved first-seen
insertion order automatically, with no separate sort step required — and
it would never have produced this lesson's own bug. Its real cost is
algorithmic: checking `name not in low_names` against a growing list is
O(n) per check, making the whole loop O(n²) in the total number of
low-stock names across all stores, versus a `set`'s average O(1) per
`.update()` call. For the small store counts this project actually
handles, that difference is invisible in practice — but the codebase
chose the asymptotically better structure, and that choice quietly
introduced an obligation nothing in Python itself enforces: remembering
to sort before returning, the same way every other list-returning
function in this file already does. This is exactly the debt that just
surfaced — choosing `set` for its real, genuine performance advantage
was reasonable; forgetting the sort it now requires is the actual
mistake, and Python's own type system gives no warning when that
requirement is skipped. Any future function in this file that builds a
collection and returns it now carries the identical, silent obligation.

### Commands Needed

No new commands beyond `python3 <file>`, already established in this
project since Lesson 105 — every throwaway script above and the real
project's own scripts are all run the identical way.

### Run It

Calling the real function directly, printing its own real return value,
run as three separate process invocations of the same short script:

```python
from inventory_report import low_stock_across_stores

store_a = {"widgets": 2, "gadgets": 8}
store_b = {"gizmos": 1, "sprockets": 9}
store_c = {"bolts": 0, "widgets": 5}

names = low_stock_across_stores([store_a, store_b, store_c], threshold=3)
print(names)
```

`store_a` has `"widgets"` low (`2 < 3`); `store_b` has `"gizmos"` low
(`1 < 3`); `store_c` has `"bolts"` low (`0 < 3`) — `"widgets"` also
appears in `store_c`, at a count of `5`, which is *not* low, so it
contributes nothing there. The union across all three stores should be
exactly `"widgets"`, `"gizmos"`, and `"bolts"` — three names, no
duplicates. Run for real, three separate times:

```text
['widgets', 'gizmos', 'bolts']
['bolts', 'widgets', 'gizmos']
['gizmos', 'bolts', 'widgets']
```

The right three names, every time — dedup is correct. The order is
different in all three runs, exactly as the isolated lab, above,
predicted it would be. This is not yet fixed; the fix comes in the next
Concept Unit, once a real check exists to prove — and later reprove —
whether it actually worked.

### Connecting Back

`low_stock_across_stores` reuses `low_stock_items` exactly as it already
existed, unmodified, calling it once per store and merging the results
with a tool — `set` — genuinely new to this project. The bug this unit
proved but did not yet fix is the seam the next unit builds directly on:
a check that asserts an exact combined report string, and a way to prove,
mechanically rather than by eyeballing a handful of manual runs, that
the check's own outcome is not reliable yet.

---

## Concept Unit: Detecting Flakiness by Rerunning in Fresh Processes

### The Problem

A single run of a check either prints "passed" or raises an
`AssertionError`. Faced with one green result, there is no way to tell,
from that one result alone, whether the underlying code is actually
correct or whether this particular run just happened to get lucky — the
previous unit already proved that identical code, run repeatedly, can
land on the *one* ordering out of several that happens to satisfy a
specific assertion. Something more than "I ran it once and it passed" is
needed before that green result can be trusted.

### Project Change

- **Reference Source:** no reference counterpart — from-scratch
  addition, same as the previous unit.
- **Files affected:** `check_low_stock_across_stores.py`, new;
  `detect_flaky_tests.py`, new.
- **Change type:** add.
- **Location:** both new files, at the top level of `inventory-report/`,
  alongside every other `check_*.py` file already there.
- **Dependencies:** none beyond the Python standard library
  (`subprocess`, `sys`) — no new package installation.

### The New Code

The check first — deliberately written against `low_stock_across_stores`
exactly as it stands right now, still unfixed:

```python
from inventory_report import low_stock_across_stores

def check_low_stock_across_stores_message():
    store_a = {"widgets": 2, "gadgets": 8}
    store_b = {"gizmos": 1, "sprockets": 9}
    store_c = {"bolts": 0, "widgets": 5}
    names = low_stock_across_stores([store_a, store_b, store_c], threshold=3)
    message = ", ".join(names)
    assert message == "bolts, gizmos, widgets", message
    print("check_low_stock_across_stores_message passed")

check_low_stock_across_stores_message()
```

This check alone already reveals a problem the moment it's actually run
more than once, but a single terminal session re-running one command by
hand doesn't yet prove anything rigorous — it's still just eyeballing.
The second new file turns that eyeballing into an automated, counted
measurement:

```python
import subprocess
import sys

def rerun(check_path, times):
    passed = 0
    failed = 0
    for _ in range(times):
        result = subprocess.run(["python3", check_path], capture_output=True, text=True)
        if result.returncode == 0:
            passed += 1
        else:
            failed += 1
    return passed, failed

def main():
    check_path = sys.argv[1]
    times = int(sys.argv[2])
    passed, failed = rerun(check_path, times)
    print(check_path + ": " + str(passed) + " passed, " + str(failed) + " failed, out of " + str(times) + " runs")

if __name__ == "__main__":
    main()
```

### The Updated Project

Skipped for this unit, for both files: `check_low_stock_across_stores.py`
and `detect_flaky_tests.py` are each a brand-new, freestanding file with
nothing already surrounding them, the identical carve-out already used
in the previous unit.

### Isolating the Concept: Flaky-Test Detection by Repetition

Two small pieces need isolating before trusting what
`detect_flaky_tests.py` does with them: `str.join`, and the mechanics of
rerunning a command as several genuinely separate processes from inside
Python itself rather than from a shell loop.

`str.join`, on its own, unrelated data:

```python
letters = ["a", "b", "c"]
print(", ".join(letters))
```

Run for real:

```text
a, b, c
```

`", "` is the string the method was called on; `letters` is the
iterable passed to it; the result places a copy of `", "` between every
pair of elements. This is exactly what `message = ", ".join(names)` in
the real check above is doing, isolated — turning a list of names into
one comma-separated line, in whatever order the list itself is already
in.

Now the rerun mechanism itself, using the same `red`/`green`/`blue`
values from the previous unit's own throwaway lab, so the connection
back to the actual cause of the flakiness stays explicit:

```python
import subprocess

for i in range(4):
    result = subprocess.run(
        ["python3", "-c", "assert list({'red', 'green', 'blue'})[0] == 'red'"],
        capture_output=True,
    )
    print(i, result.returncode)
```

Run for real:

```text
0 1
1 0
2 1
3 0
```

Four genuinely separate process invocations of the *exact same* command
string — the assertion inside the quotes never changes — and the
`returncode` alternates: `1` (the assertion failed, an uncaught
`AssertionError` terminated the process abnormally) and `0` (the
assertion happened to hold for that run's own hash seed). This is called
**test flakiness detection by repetition**: instead of trusting one run,
spawn several fresh ones and look at the *distribution* of outcomes.
Within one already-running Python process, calling the same logic
repeatedly would reuse that one process's single fixed hash seed for its
entire lifetime and show the identical outcome every time — proven
directly, in the previous unit's own "Run It," where the whole point was
that *separate* process invocations differ. A rerun loop that stayed
inside one process would never have caught this bug at all; spawning a
fresh subprocess per attempt, exactly as `detect_flaky_tests.py` does, is
not an implementation detail — it's the entire mechanism this technique
depends on.

Both throwaway examples — the `letters` join and the four-run
`red`/`green`/`blue` subprocess loop — are discarded now and will not
appear in the project again.

### Mechanical Walkthrough

`check_low_stock_across_stores.py`, every distinct element:

- `from inventory_report import low_stock_across_stores` — an ordinary
  import, already this project's established convention since Lesson
  115, bringing in only the one function this file actually needs.
- `def check_low_stock_across_stores_message():` — defines a check
  function, following this project's own naming convention: `check_`
  prefix, then a name describing exactly what's being verified, matching
  every other file in this project's `check_*.py` collection.
- `store_a = {"widgets": 2, "gadgets": 8}` (and `store_b`, `store_c`) —
  three ordinary dict literals, each shaped like every inventory dict
  this project already handles, standing in for three separate physical
  stores.
- `names = low_stock_across_stores([store_a, store_b, store_c],
  threshold=3)` — calls this lesson's own new function from the previous
  unit, passing the three store dicts as a list (matching
  `store_inventories`'s own expected shape) and `threshold=3` as an
  explicit keyword argument.
- `message = ", ".join(names)` — already explained in full, above, in
  the isolated lab: joins the returned names into one comma-separated
  string.
- `assert message == "bolts, gizmos, widgets", message` — an `assert`
  statement, this project's own established check mechanism since
  Lesson 115: the condition (`message == "bolts, gizmos, widgets"`) is
  evaluated; if it's `False`, Python raises an `AssertionError` whose own
  message is the second, comma-separated part (`message` itself — the
  actual string produced, printed as evidence of exactly what went
  wrong instead of a generic failure with no context); if it's `True`,
  execution simply continues to the next line.
- `print("check_low_stock_across_stores_message passed")` — reached only
  if the assertion held, following this project's own established
  convention for signaling a passing check to whatever's watching this
  process's own stdout (a human, or, as of this lesson,
  `detect_flaky_tests.py` itself).
- `check_low_stock_across_stores_message()` — the module-level call at
  the bottom of the file that actually runs the check the moment this
  file is executed directly, the same convention every other
  `check_*.py` file in this project already follows.

`detect_flaky_tests.py`, every distinct element:

- `import subprocess` / `import sys` — two standard-library imports;
  `subprocess`, already explained in full in the Header, above;
  `sys`, providing `argv`.
- `def rerun(check_path, times):` — defines a function taking the path
  to a check file and how many times to run it, kept deliberately
  separate from `main()` below: this is the piece that could be
  `import`ed and reused by something else that wants a programmatic
  pass/fail tally without also going through command-line argument
  parsing.
- `passed = 0` / `failed = 0` — two plain integer accumulators,
  initialized to zero before the loop that will increment them.
- `for _ in range(times):` — a loop repeating exactly `times` times;
  `range(times)`, already explained in the Header's "everything else"
  section, produces the integers `0` through `times - 1` on demand;
  `_`, also already explained there, signals that this particular
  iteration's own counter value is never used inside the loop body —
  only the repetition itself matters here.
- `result = subprocess.run(["python3", check_path], capture_output=True,
  text=True)` — already explained in full in the Header. Note that
  `check_path` here is a *variable*, not a hardcoded literal the way
  Lesson 120's own first use of `subprocess.run` was — this call spawns
  a fresh process running whichever check file the caller named on the
  command line, not one fixed file.
- `if result.returncode == 0:` — reads the `.returncode` attribute off
  the returned `CompletedProcess`, already shown in full shape in the
  Header, and compares it to `0` — the documented meaning of "the
  process exited normally," which for one of this project's own
  `check_*.py` files means every `assert` in it held.
- `passed += 1` / `failed += 1` — already explained in the Header's
  "everything else" section: increments whichever counter matches this
  run's own outcome.

  This loop carries state across its own iterations — `passed` and
  `failed` accumulate — so it earns its own real trace rather than a
  prose paraphrase of "it counts up." Ten real, separate invocations of
  `python3 check_low_stock_across_stores.py`, against the still-unfixed
  project, produced this actual sequence of outcomes:

  ```text
  Iteration 1: returncode 1 → failed = 1, passed = 0
  Iteration 2: returncode 1 → failed = 2, passed = 0
  Iteration 3: returncode 0 → failed = 2, passed = 1
  Iteration 4: returncode 1 → failed = 3, passed = 1
  Iteration 5: returncode 1 → failed = 4, passed = 1
  Iteration 6: returncode 1 → failed = 5, passed = 1
  Iteration 7: returncode 1 → failed = 6, passed = 1
  Iteration 8: returncode 1 → failed = 7, passed = 1
  Iteration 9: returncode 1 → failed = 8, passed = 1
  Iteration 10: returncode 1 → failed = 9, passed = 1
  ```

  Every `returncode 1` here is the identical mechanism traced back in
  Concept Unit 1: that run's own process drew a hash seed that placed
  `"bolts"` somewhere other than first, so the check's own `assert`
  failed and the process exited abnormally. Iteration 3's `returncode 0`
  is the one run, out of these ten, whose own process happened to draw a
  seed that placed `"bolts"` first — the exact same "got lucky" case this
  lesson's own Closing returns to.
- `return passed, failed` — packs both counts into a tuple, already
  explained in full in the Header's "everything else" section.
- `def main():` — defines the entry point, following the identical
  `main()` convention `inventory_cli.py` already established in Lesson
  120.
- `check_path = sys.argv[1]` — already explained in the Header: the
  first real command-line argument, after the script's own path.
- `times = int(sys.argv[2])` — already explained in the Header: the
  second argument, converted from its raw string form into a real
  integer.
- `passed, failed = rerun(check_path, times)` — calls `rerun`, then
  unpacks its two-element tuple return value back into two separate
  names, the reverse of the packing already explained above.
- `print(check_path + ": " + str(passed) + " passed, " + str(failed) +
  " failed, out of " + str(times) + " runs")` — already explained in
  the Header's "everything else" section: string concatenation and
  `str()` conversions, building one human-readable summary line.
- `if __name__ == "__main__": main()` — already explained in full in the
  Header's "everything else" section: only actually calls `main()` when
  this file is the one invoked directly.

### CS Lens

This is **statistical sampling under repeated independent trials**: a
single trial's outcome is a random variable, not a fixed fact about the
system being measured, and only repeated, independent trials reveal the
true underlying rate. "Independent" is doing real work in that sentence
— the trials have to actually be independent of each other for the
sampling to mean anything, which is exactly why this lesson's own
harness spawns a fresh subprocess per attempt instead of looping inside
one process: looping inside one process would produce `times` samples
that are not independent of each other at all, since they'd all share
the identical fixed hash seed.

Also recognized in: A/B testing, where a single visitor's conversion or
non-conversion says nothing on its own about the true underlying
conversion rate; load testing, where a single request's latency doesn't
reveal a system's real tail-latency behavior under load; quality-control
sampling in manufacturing, where inspecting one unit off a production
line doesn't confirm the whole batch; randomized primality tests such as
Miller–Rabin, which explicitly report a number as only "probably prime"
after multiple independent rounds, precisely because any single round
can be fooled.

### SE Lens

The alternative not chosen, and a genuinely common real-world one: when a
test seems unreliable, just rerun the whole CI pipeline until it goes
green, without building anything like `detect_flaky_tests.py` at all.
That alternative costs real compute time on every single occurrence, and
it fixes nothing — the underlying cause stays exactly as broken as it
was, silently, for as long as nobody investigates it. Worse, it trains
engineers that a red build doesn't necessarily mean anything, which is
precisely the condition under which a real, unrelated regression can
land unnoticed, hidden inside what everyone has already learned to treat
as "probably just the flaky one again."

`detect_flaky_tests.py` is the deliberate alternative: instead of
tolerating the uncertainty, spend a small amount of real time quantifying
it — turning "this test feels unreliable" into "this test fails roughly
5 times out of 6," a specific, falsifiable, actionable number. That
number is also what justifies choosing to actually fix the root cause
here rather than reaching for **quarantine** (this lesson's own Header
term): quarantining is the right call when a flake's root cause is
genuinely hard to pin down (a rare race condition, an intermittent
network timeout) and a real fix isn't available yet; it would have been
the *wrong* call here, where the actual fix — one call to `sorted()` —
is cheap, fast, and about to be shown directly, below. Reaching for
quarantine as a default first response, instead of actually
investigating, is its own real anti-pattern: it makes a genuine, fixable
bug permanently invisible to CI instead of temporarily invisible while
it's being fixed.

### Commands Needed

`python3 detect_flaky_tests.py <check-file> <times>` — `python3`, the
same interpreter this whole project has always been run with;
`detect_flaky_tests.py`, this lesson's own new harness; `<check-file>`,
the path to whichever `check_*.py` file should be rerun, taken as
`sys.argv[1]`; `<times>`, how many independent process invocations to
run, taken as `sys.argv[2]` and converted with `int()`. Success output is
the one summary line `main()` builds and prints; there is no other
required setup, since both new files depend only on the standard
library.

### Run It

```bash
python3 detect_flaky_tests.py check_low_stock_across_stores.py 30
```

Run for real, against the project exactly as it stands right now —
`low_stock_across_stores` still ending in `return list(low_names)`, not
yet fixed:

```text
check_low_stock_across_stores.py: 5 passed, 25 failed, out of 30 runs
```

5 passes out of 30 runs is close to what a rough back-of-envelope
prediction would suggest: there are `3! = 6` possible orderings of three
elements, and the check's own assertion only matches exactly one of
them (`"bolts, gizmos, widgets"`), so roughly 1 run in 6 — about 5 out of
30 — would be expected to coincidentally match, purely by which ordering
that run's own process happened to draw. This is not a guarantee that
CPython's hash placement distributes perfectly evenly across all six
orderings, only a rough model that the real, observed count happens to
land close to. Either way, the number is no longer a vague impression —
it's a real, counted rate, produced by 30 genuinely independent process
runs.

### Applying the Fix

The fix follows this file's own existing convention exactly: every other
list-returning function in `inventory_report.py` already calls
`sorted()` before returning. `low_stock_across_stores` is the one
function that skipped it.

- **Reference Source:** no reference counterpart — same from-scratch
  addition as the rest of this lesson; the fix itself is this file's own
  pre-existing internal convention, not an external source.
- **Files affected:** `inventory_report.py`, modified.
- **Change type:** replace (one line).
- **Location:** the last line of `low_stock_across_stores`, added in the
  first Concept Unit of this lesson.
- **Dependencies:** none new — `sorted()` is already fully explained in
  this lesson's own Header, and is already used twice elsewhere in this
  same file.

```python
def low_stock_across_stores(store_inventories, threshold=3):
    low_names = set()
    for inventory in store_inventories:
        low_names.update(low_stock_items(inventory, threshold))
    return sorted(low_names)  # ← was: return list(low_names)
```

The function still builds the identical `set`, still dedupes across
stores the identical way — only the final line changed. `sorted()`,
already explained in full in this lesson's own Header, converts the
unordered set into a new list ordered lexicographically: `"bolts"` before
`"gizmos"` before `"widgets"`, alphabetically, every single time,
regardless of which order the underlying `set` happened to walk its own
elements in for this particular process. The whole function now returns
a deterministic result for a given input, exactly like `low_stock_items`
and `build_reorder_report` already did before this lesson touched
anything.

### Run It Again

```bash
python3 detect_flaky_tests.py check_low_stock_across_stores.py 30
```

Run for real, against the fixed file:

```text
check_low_stock_across_stores.py: 30 passed, 0 failed, out of 30 runs
```

30 passes out of 30 — the exact same harness, the exact same check file,
the exact same 30 genuinely separate process invocations that produced
`5 passed, 25 failed` moments ago against the unfixed code, now produces
`30 passed, 0 failed` against the fixed code. Nothing about the *check*
changed between these two runs; only `inventory_report.py`'s own last
line did.

### Connecting Back

The check written at the start of this unit — deliberately written
against still-buggy code — is what turned the previous unit's own
"the order looks different across runs" observation into something with
a real pass/fail outcome to measure at all. The harness built alongside
it is what turned "I ran it a few times by hand and one of them passed"
into a real, counted rate, and then into a real, counted confirmation
that the fix actually worked — not just once, but across 30 independent
attempts.

---

## Connect the Pieces

Trace the item name `"bolts"`, from this lesson's own new `store_c`
dict, through every unit this lesson built:

1. `store_c = {"bolts": 0, "widgets": 5}` — `"bolts"` has a count of
   `0`, which is strictly below `threshold=3`.
2. Inside `low_stock_across_stores`'s own loop, `low_stock_items(store_c,
   3)` is called, and its own existing logic (unchanged by this lesson)
   returns `["bolts"]` — `"widgets"`, also in `store_c`, has a count of
   `5`, not below `3`, so it's correctly excluded from *this* store's own
   result.
3. `low_names.update(["bolts"])` adds `"bolts"` into the running set,
   alongside `"widgets"` (added earlier, from `store_a`) and `"gizmos"`
   (from `store_b`).
4. Before the fix: `list(low_names)` walks the set in whatever order
   this process's own hash seed produces — `"bolts"` could land first,
   last, or in the middle, unpredictably, run to run. `check_
   low_stock_across_stores_message` asserts the exact string `"bolts,
   gizmos, widgets"`, which only holds when `"bolts"` happens to land
   first — real, run evidence above showed this happening in roughly 1
   run out of 6.
5. `detect_flaky_tests.py`, spawning 30 genuinely separate processes,
   turned that "roughly 1 in 6" into a real, counted `5 passed, 25
   failed, out of 30 runs`.
6. After the fix: `sorted(low_names)` places `"bolts"` first
   deterministically, because `"bolts"` sorts before both `"gizmos"` and
   `"widgets"` alphabetically — not because of anything about *this*
   process's own hash seed. The same 30-run harness, rerun against the
   identical check file, now reports `30 passed, 0 failed, out of 30
   runs`.

One item name, unchanged from step 1 through step 6; what changed was
whether its final position in the report was a property of the *data*
(alphabetical order, stable across every process) or an accident of
*which process happened to run it* (hash order, different every time).

## What Breaks Without This

Revert the fix, back to `return list(low_names)`, and simulate what six
separate, ordinary CI jobs would each see, one single run apiece — no
harness, no repetition, exactly the kind of single-run trust a green
checkmark normally earns:

```text
-- CI job 1 --
Traceback (most recent call last):
  File "/path/to/inventory-report/check_low_stock_across_stores.py", line 12, in <module>
    check_low_stock_across_stores_message()
  File "/path/to/inventory-report/check_low_stock_across_stores.py", line 9, in check_low_stock_across_stores_message
    assert message == "bolts, gizmos, widgets", message
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: gizmos, bolts, widgets
exit code: 1
```

Jobs 2 and 3, run immediately after, produce the identical traceback
shape, differing only in the exact ordering named in each one's own
`AssertionError` line — real, separately observed evidence, not the
same output repeated for effect. Job 4, the very next run, with zero
code changes since job 1:

```text
-- CI job 4 --
check_low_stock_across_stores_message passed
exit code: 0
```

A real, genuine green checkmark, on the exact same broken code that just
failed three times in a row. Jobs 5 and 6 go back to failing, each with
their own distinct ordering. A team seeing job 4 alone — the normal way
anyone actually experiences a single CI run — has no way to know it sits
between five failures on the identical, still-broken code; a green
checkmark here proves nothing at all about whether `low_stock_across_
stores` is correct, only that this one process happened to draw a
favorable hash seed. Beyond the test suite itself, the same underlying
bug reaches a real person directly: a warehouse manager reading this
combined report on two different days would see the exact same three
items listed in a different order each time, for no operational reason
whatsoever — a small thing, but exactly the kind of inconsistency that
erodes trust in a report that's supposed to be authoritative.

Restore the fix — `return sorted(low_names)` — and reconfirm with the
harness one more time, a fresh run independent of every run already
shown above:

```text
check_low_stock_across_stores.py: 10 passed, 0 failed, out of 10 runs
```

## Exercises

1. Add a fourth store to `check_low_stock_across_stores_message`,
   overlapping with an existing low-stock name from one of the other
   three, and update the asserted message to match. Rerun `python3
   detect_flaky_tests.py check_low_stock_across_stores.py 20` against
   the current, already-fixed project and confirm it still reports `20
   passed, 0 failed` regardless of how many stores or names are
   involved — sorting fixes this for any input size, not just this
   lesson's own specific three names.
2. Temporarily change `low_stock_across_stores`'s own last line back to
   `return list(low_names)`. Before running anything, predict roughly
   what fraction of runs `python3 detect_flaky_tests.py check_
   low_stock_across_stores.py 30` will report as passing, using the same
   "1 out of `n!` orderings" reasoning worked through in this lesson's
   own "Run It" section. Then actually run it and compare the real,
   observed count against the prediction. Restore the fix afterward.
3. `time.sleep(0.1)` followed by asserting that `time.perf_counter() -
   start < 0.15` is a different, genuinely common real-world source of
   flaky tests, unrelated to hashing or randomness entirely. Without
   running anything, write one or two sentences explaining why a
   threshold-based timing assertion like that one would be expected to
   fail occasionally even on completely correct code, on a real,
   variably-loaded machine.
4. `detect_flaky_tests.py check_low_stock_across_stores.py 3` — only 3
   reruns instead of 30 — against the still-unfixed code from Exercise 2.
   Using the real observed failure rate from this lesson (roughly 5 out
   of 6 runs fail), estimate the probability that at least one of 3 runs
   would show a failure, then actually run it several times to see how
   often 3 reruns is enough to catch this specific bug versus how often
   it would still isolate it.

## Definition of Done

- [ ] `low_stock_across_stores` exists in `inventory_report.py`, ending
      in `return sorted(low_names)`.
- [ ] `check_low_stock_across_stores.py` exists and passes on every run.
- [ ] `detect_flaky_tests.py` exists, takes a check path and a rerun
      count from the command line, and reports a real pass/fail tally.
- [ ] `python3 detect_flaky_tests.py check_low_stock_across_stores.py
      30` reports `30 passed, 0 failed` against the current project.
- [ ] Every other existing `check_*.py` file in `inventory-report/`
      still passes, unchanged by this lesson's own edits.
- [ ] `__pycache__/` removed before considering the project's own working
      tree clean, per this project's own standing verification
      convention.
- [ ] Commit message:

  ```text
  Fix non-deterministic ordering in low_stock_across_stores

  Returning list(set(...)) directly let a store's own hash seed decide
  report order instead of the data. Sorting before returning matches
  this file's own existing convention and made a genuinely flaky check
  reliably pass, confirmed 30/30 across independent process reruns.
  ```

  This message states *why* — a silent convention violation, not
  caught by any type checker, produced output whose order depended on
  the running process rather than the input data — not merely *what*
  changed (one function call swapped for another), because the *why* is
  the part a future engineer, staring at this same file months from now
  and wondering why every list-returning function here calls `sorted()`,
  actually needs.
