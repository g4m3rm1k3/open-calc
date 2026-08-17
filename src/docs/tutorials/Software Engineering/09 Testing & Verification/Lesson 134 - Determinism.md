# Lesson 134: Determinism

**What you will build.** `check_reorder_suggestion_property.py` (Lesson 128)
currently generates its own example inputs at random every time it runs —
meaning two runs of the exact same file, against the exact same code, can
silently explore two different sets of inputs. This lesson pins that down
with `hypothesis`'s `seed()` so the check explores the identical sequence
of inputs on every run, on every machine, forever. The transferable
problem: a test whose own pass/fail verdict can vary between two runs of
identical code isn't evidence of anything — a red build has to fail the
same way every time someone reruns it, or nobody can trust an
investigation into why; a green build that only stayed green because this
particular run happened not to draw the input that would have broken it
isn't proof of correctness, it's luck wearing a passing test's clothes.

**What you need to know first.** Lesson 128 (Property-Based Testing)
built `check_reorder_suggestion_property.py` using `hypothesis`'s `@given`
decorator and its `strategies` module (`st.dictionaries`, `st.integers`,
`st.tuples`, `.map`) to generate many example inputs automatically
instead of hand-picking them, and found and fixed a real precondition bug
by doing so. Lesson 129 (Generative Testing) replaced ad-hoc `assume()`
filtering with a constructed-by-design strategy after `hypothesis` raised
a real `FailedHealthCheck`. Lesson 130 (Fuzz Testing) reused the same
`hypothesis` machinery in a second file, `check_parse_inventory_fuzz.py`,
to find a real `AttributeError` a bare `null` JSON file could cause.
Lesson 133 (Test Isolation), the most recent lesson, fixed a different
but related problem: two checks sharing one mutable dictionary could fail
depending on which order they ran in — a test's own verdict depending on
something other than the code being tested. This lesson's own problem is
the same shape, from a different cause.

**Terms used in this lesson.**

- **Determinism** — a property of a system: given the same starting state
  and the same inputs, it always produces the same output, every single
  time it runs, on every machine. It exists as a named idea because most
  real systems are not automatically deterministic — a system's true
  inputs are often wider than the ones written down in an argument list,
  and anything reading a clock, a random number generator, another
  program's response time, or the operating system's own internal state
  is silently importing an extra, invisible input that never appears in
  the code's own signature.
- **Non-determinism** — the opposite: a system where the same visible
  inputs can still produce different outputs across separate runs,
  because some invisible input — a clock, a random draw, thread
  scheduling order, a network round-trip's timing — is influencing the
  result without appearing anywhere in the code's own parameter list.
- **Pseudo-random number generator (PRNG)** — an algorithm that produces
  a long sequence of numbers that look statistically random but are
  actually a fully deterministic function of one starting number, its
  seed. Given the same seed, a PRNG produces the exact same sequence of
  "random" numbers every time; this is why "random" and "deterministic"
  aren't opposites — a PRNG is both at once, depending on whether its
  seed is fixed. `hypothesis`'s own example generator, used since Lesson
  128 to pick `inventory` dictionaries and `threshold_target` pairs, is a
  PRNG under this exact definition.
- **Seed** — the one starting value a PRNG is initialized with. Two runs
  of the same PRNG, given the same seed, produce the identical sequence
  of values; two runs given no fixed seed — most PRNGs default to seeding
  themselves from something that changes every time, like the system
  clock or an OS-level entropy source — produce two different sequences.

**Objects and methods used.**

- **`seed`** (`hypothesis.seed`)
  - *What it is:* a decorator factory from the `hypothesis` library — a
    function that, when called with a value, returns a decorator.
  - *Implementation:* `seed(seed: Hashable) -> Callable[[TestFunc],
    TestFunc]`. It accepts any hashable value (an `int`, a `str`, anything
    usable as a dictionary key) and returns a decorator meant to wrap a
    `@given`-decorated test function.
  - *Its use:* fixes the starting seed `hypothesis`'s own internal PRNG
    uses to decide which example inputs to generate, so the identical
    sequence of examples is produced on every run, on every machine,
    regardless of wall-clock time.

- **`given`** (`hypothesis.given`) — reappearing from Lesson 128.
  - *What it is:* a decorator from `hypothesis` that turns an ordinary
    function taking example arguments into a property-based check
    `hypothesis` itself calls repeatedly, once per generated example.
  - *Implementation:* `given(*_given_arguments, **_given_kwargs)`; each
    keyword argument names one of the decorated function's own parameters
    and supplies a *strategy* — an object describing how to generate
    values for that parameter (`st.dictionaries(...)`, `st.integers(...)`,
    and the custom `valid_threshold_target_pairs` strategy built with
    `st.tuples(...).map(...)`, all from Lesson 128, unchanged by this
    lesson).
  - *Its use:* this lesson doesn't change what `@given` does — it changes
    what happens *before* `@given` starts generating: `@seed` fixes the
    PRNG that `@given`'s own strategies draw every value from.

Everything else in the file, not this lesson's subject but still
explained:

- **`settings`** (`hypothesis.settings`)
  - *What it is:* a class from `hypothesis` for configuring how a
    `@given`-decorated check runs — how many examples to try, how much it
    prints, and more; instances of it double as decorators.
  - *Implementation:* `settings(*, max_examples=..., verbosity=..., ...)`
    accepts many keyword-only configuration options (confirmed this
    session via `help(settings.__init__)`); this lesson supplies only two,
    `verbosity` and `max_examples`. Constructing it returns a `settings`
    object, and that object itself is callable — `settings_instance(test)
    -> test` (its own `__call__`, confirmed the same way) — which is what
    lets `@settings(...)` work as a decorator at all: the call above the
    function builds the configured object, and the object then wraps the
    function immediately below it, the same two-step decorator-factory
    shape `seed` itself uses.
  - *Its use:* a diagnostic tool used only in this lesson's own throwaway
    lab, to make `hypothesis`'s own example generation visible — never
    committed into the real project's own check file, since a real
    project's test suite doesn't want per-example debug printing on every
    routine run.

- **`Verbosity`** (`hypothesis.Verbosity`)
  - *What it is:* an enumeration (Lesson 45 first introduced `Enum` — a
    fixed, named set of possible values, each one a distinct object, not
    a bare string or integer a typo could silently corrupt) of the
    print-detail levels `settings`'s own `verbosity` argument accepts.
  - *Implementation:* `Verbosity.quiet`, `Verbosity.normal` (the default —
    silent on success), `Verbosity.verbose`, `Verbosity.debug`, in
    increasing order of detail.
  - *Its use:* `Verbosity.verbose` makes `hypothesis` print every
    generated example as it tries it, which is the only way to actually
    *see* whether two runs explored the same inputs or not, rather than
    just trusting that they did.

---

## Concept Unit: Determinism

### The Problem

`check_reorder_suggestion_property.py`, built in Lesson 128, has been
passing since it was written. But "passing" and "trustworthy" are not the
same claim. Every time this file runs, `hypothesis` — the library
`@given` comes from — picks its own starting point in its own internal
pseudo-random number generator and, from there, generates a fresh batch
of example `inventory` dictionaries and `threshold_target` pairs to test
`reorder_suggestion` against. Nothing in the file fixes that starting
point. Two runs of the identical file, against the identical
`inventory_report.py`, can therefore exercise two different sets of
inputs — and if a bug existed that only a narrow slice of possible inputs
could trigger, one run might stumble onto it and fail, while the very
next run, changing nothing but rerunning, might miss it entirely and
print `passed`. A test suite whose own verdict depends on which run you
happened to get is not verifying the code; it's reporting on the PRNG's
own mood that morning. Before fixing anything, this needs proof, not
assertion — the next steps build that proof, then fix it.

### Project Change

**Reference Source:** `check_reorder_suggestion_property.py`, this
project's own current file, read this session — quoted in full under
"The Updated Project," below.

**Files affected:** `check_reorder_suggestion_property.py` (modified — no
new file).

**Change type:** add (one new imported name, one new decorator line).

**Location:** the `from hypothesis import ...` line at the top of the
file gains one more imported name; a new `@seed(20260817)` line is added
directly above the existing `@given(...)` decorator that already wraps
`check_reorder_quantities_always_positive`.

**Dependencies:** none beyond what Lesson 128 already installed —
`hypothesis` is already a dependency of this project; `seed` is exported
from the same top-level `hypothesis` package `given` and `strategies`
already come from.

### The New Code

```python
from hypothesis import given, seed, strategies as st
```

With `seed` now importable, the second new line applies it as a decorator,
directly above the existing `@given(...)`:

```python
@seed(20260817)
```

### The Updated Project

```python
from hypothesis import given, seed, strategies as st        # ← new: seed
from inventory_report import reorder_suggestion

def combine_threshold_and_gap(threshold_and_gap):
    threshold, gap = threshold_and_gap
    return (threshold, threshold + gap)

valid_threshold_target_pairs = st.tuples(
    st.integers(min_value=0, max_value=100),
    st.integers(min_value=1, max_value=100),
).map(combine_threshold_and_gap)

@seed(20260817)                                               # ← new
@given(
    inventory=st.dictionaries(
        st.text(alphabet="abcdefghij", min_size=1, max_size=8),
        st.integers(min_value=0, max_value=1000),
        max_size=5,
    ),
    threshold_target=valid_threshold_target_pairs,
)
def check_reorder_quantities_always_positive(inventory, threshold_target):
    threshold, target = threshold_target
    suggestions = reorder_suggestion(inventory, threshold=threshold, target=target)
    for name, qty in suggestions.items():
        assert qty > 0

check_reorder_quantities_always_positive()
print("check_reorder_quantities_always_positive passed")
```

The file still does exactly what Lesson 128 built it to do — generate
`inventory`/`threshold_target` pairs and assert every resulting reorder
quantity is positive — with one difference invisible from the file's own
printed output: the generator feeding it examples now starts from a fixed
point instead of a fresh one on every run.

### Isolating the Concept: Seeding a Property-Based Check

This is exactly what `@seed(20260817)`, just added above, is doing to
`check_reorder_quantities_always_positive` — isolated here with a
trivial, unrelated property, small enough to actually watch `hypothesis`
choose its own examples out in the open.

```python
from hypothesis import given, strategies as st, settings, Verbosity

@settings(verbosity=Verbosity.verbose, max_examples=3)
@given(st.integers(min_value=0, max_value=1000))
def check_doubles_itself(n):
    assert n + n == 2 * n

check_doubles_itself()
print("check_doubles_itself passed")
```

Run twice, back to back, with nothing at all changed in between:

```
$ python3 lab_unseeded.py
Test case: check_doubles_itself(
    n=0,
)
Test case: check_doubles_itself(
    n=126,
)
Test case: check_doubles_itself(
    n=413,
)
check_doubles_itself passed

$ python3 lab_unseeded.py
Test case: check_doubles_itself(
    n=0,
)
Test case: check_doubles_itself(
    n=756,
)
Test case: check_doubles_itself(
    n=38,
)
check_doubles_itself passed
```

Both runs pass — `n + n == 2 * n` is true for every integer, so there was
never any real risk of failure here — but the two runs did not test the
same thing. The first example, `n=0`, is identical both times; the second
and third are not (`126`/`413` versus `756`/`38`). This is real,
observed, run-to-run variation, not a hypothetical: the exact same file,
run twice with zero changes, chose different inputs to test each time.
This is what **non-determinism** means concretely, not just as a
definition — the set of inputs a check actually exercises is itself an
invisible, unfixed input to the check's own overall trustworthiness.

Now add `seed`, with an arbitrary fixed value — today's date, written as
one integer, works as well as any other hashable value:

```python
from hypothesis import given, seed, strategies as st, settings, Verbosity

@seed(20260817)
@settings(verbosity=Verbosity.verbose, max_examples=3)
@given(st.integers(min_value=0, max_value=1000))
def check_doubles_itself(n):
    assert n + n == 2 * n

check_doubles_itself()
print("check_doubles_itself passed")
```

Run twice again:

```
$ python3 lab_seeded.py
Test case: check_doubles_itself(
    n=0,
)
Test case: check_doubles_itself(
    n=303,
)
Test case: check_doubles_itself(
    n=80,
)
check_doubles_itself passed

$ python3 lab_seeded.py
Test case: check_doubles_itself(
    n=0,
)
Test case: check_doubles_itself(
    n=303,
)
Test case: check_doubles_itself(
    n=80,
)
check_doubles_itself passed
```

Byte-for-byte identical, both runs, every example. This is called
**determinism** — not "the check always passes" (it already always
passed, seeded or not, since the property itself is simply true), but
"the check always does the *same thing*," which is a stronger and
separately useful guarantee: a future reader debugging a *failing*
seeded check can trust that rerunning it reproduces the exact same
failure, with the exact same input, instead of chasing a moving target.

This throwaway example is now discarded — `check_doubles_itself` never
appears in the real project again. What carries forward is only the
pattern: `@seed(<any fixed hashable value>)`, placed above `@given(...)`,
turns a property-based check from "explores something different every
run" into "explores the identical thing every run," with no change to
what the check is actually asserting.

### Mechanical Walkthrough

Two elements were added, in this order:

- `seed` **added to the import line.** `from hypothesis import given,
  seed, strategies as st` is the same `import` statement Lesson 128
  wrote, with one more name pulled in. An `import` statement copies a
  name from another module's own namespace into this file's namespace so
  it can be referenced unqualified below — already-taught syntax, stated
  again here in full per the Repetition Rule, since this exact line is
  part of this lesson's own new code. Without this addition, the next
  line's bare `seed(...)` reference would raise `NameError: name 'seed'
  is not defined` — Python has no way to know `seed` refers to
  `hypothesis.seed` unless the name is imported first.
- `@seed(20260817)`, **a new decorator line above `@given(...)`.**
  `@expr` above a function definition is decorator syntax — shorthand
  for calling `expr` with the function immediately below it and
  rebinding the function's own name to whatever `expr` returns. This
  exact mechanism was first taught in Lesson 48 (`@property`) and reused
  since for `@given` and `@settings` themselves (Lesson 128 onward);
  restated here in full per the Repetition Rule rather than assumed
  familiar. Concretely: `seed(20260817)` is called first, which — per
  its own `Implementation` entry in the Header above — returns a new
  decorator function; that returned decorator is then applied to
  whatever sits below it in the source. `hypothesis`'s own official
  documentation places `@seed(...)` directly above `@given(...)`, and
  that is the order used here; empirically, in this session's own
  testing, reversing the two (`@given` above `@seed`) produced identical,
  still-reproducible output — so the ordering is not something
  `hypothesis` strictly enforces here, but following the documented
  convention costs nothing and keeps the code recognizable to anyone
  who has read `hypothesis`'s own docs, which honest, deliberate
  convention (Lesson 104) is worth choosing even when nothing forces it.
  The literal argument, `20260817`, is this session's own date written
  as one integer (`2026-08-17` with the punctuation removed) — an
  arbitrary but fixed choice; per `seed`'s own contract, any hashable
  value works identically, and Exercise 2, below, verifies that directly.

### CS Lens

This is **determinism**, a foundational computer science idea: a system
where the same starting state and the same inputs always produce the
same output, with no dependency on anything outside those two things.

Also recognized in: deterministic finite automata (a fixed next state
for every state-and-input pair, no matter how many times the same input
sequence is replayed); reproducible builds (a dependency lockfile pinning
exact package versions so building the same source code twice produces
byte-identical output, the same idea `@seed` applies to test *inputs*
instead of *dependencies*); replay debugging (recording a program's real
inputs and random draws once, so a crash can be replayed later against
the identical sequence of events that caused it); deterministic
simulation testing, a real technique some distributed-systems companies
use in production test suites — running an entire distributed system
inside one single-threaded, seeded event loop so a rare production bug
can be reproduced deterministically instead of chased across real
network timing; and procedurally generated game worlds, where a seed
typed in by a player reliably rebuilds the identical map every time,
because the "random" generation was a seeded PRNG all along.

### SE Lens

The alternative not chosen here is the one Lesson 128 actually shipped
and this project has been running since: leave `hypothesis` unseeded.
That's a real, defensible choice, not merely an oversight — it has a
genuine advantage a permanently seeded check gives up. An unseeded check
explores a *different* slice of the input space on every single run;
across many CI runs over many weeks, that adds up to broader accumulated
coverage than any one fixed sample ever tries, and `hypothesis` already
keeps this mostly safe on its own: any input that genuinely makes a check
fail gets saved to `hypothesis`'s own local example database and is
retried automatically on every future run regardless of the current
seed, so a real bug, once found, becomes deterministic on its own without
needing `@seed` at all.

The real cost `@seed` imposes is not obvious from a passing test — it's
narrowed coverage, permanently, and invisibly. This session's own two
verbose runs of the real project's `inventory` strategy, unseeded, drew a
1-key dictionary on one run and a 3-key dictionary on the other; seeded
at `20260817`, the exact same check now draws a 5-key dictionary and a
different 5-key dictionary, forever, on every future run, and will never
again draw the 1-key or 3-key shapes the unseeded runs happened to try.
If a bug existed that only a 1-key `inventory` could trigger, the seeded
version of this check would now pass forever, silently, having
permanently stopped looking there — the test still says `passed`, and
nothing about that output distinguishes "verified broadly" from "verified
against one fixed, narrow sample." This is the honest tradeoff: `@seed`
buys a red build that fails the same way every time, which real
debugging depends on, at the permanent cost of the broadening exploration
an unseeded run would otherwise keep doing for free. A team that wants
both in practice typically pins the seed for the CI run every engineer
actually reads and reacts to, while running a second, separately
scheduled, deliberately unseeded sweep — nightly or weekly — whose job is
only to keep searching, with any failure it finds becoming a permanent,
reproducible regression case the next time someone looks. This project
does not yet have that second sweep; it is a real, open gap this lesson
is naming honestly rather than closing.

### Commands Needed

No new command syntax — the same `python3 <file>.py` invocation every
prior lesson in this domain has used, run from inside `inventory-report/`.
One addition worth naming explicitly: `python3 -m mypy inventory_report.py
inventory_cli.py check_reorder_suggestion_property.py`, first introduced
in Lesson 116, re-run here to confirm this lesson's own two-line change
introduces no type error — `seed`'s own parameter and return types are
already known to `hypothesis`'s bundled type stubs, so nothing new needs
declaring on this project's own side.

### Run It

```
$ python3 check_reorder_suggestion_property.py
check_reorder_quantities_always_positive passed
$ python3 check_reorder_suggestion_property.py
check_reorder_quantities_always_positive passed
```

Identical output, both runs — expected, since this check's own visible
output was already just `"...passed"` before this lesson, seeded or not.
The real difference is invisible at this verbosity, which is exactly why
the isolated lab above used `Verbosity.verbose` first: without it, "ran
twice, printed the same thing" cannot be told apart from "ran twice,
explored the same inputs." The type check confirms the change is also
sound:

```
$ python3 -m mypy inventory_report.py inventory_cli.py check_reorder_suggestion_property.py
Success: no issues found in 3 source files
```

### Connecting Back

The isolated lab just proved, on a trivial property, exactly what
`@seed(20260817)` is now doing to `check_reorder_quantities_always_positive`
in the real project: fixing the starting point of `hypothesis`'s own PRNG
so the same examples get chosen every time. "Connect the Pieces," below,
traces one real example from this exact check, seeded, end to end.

---

## Connect the Pieces

`@seed(20260817)` fixes the one thing that made `check_reorder_suggestion_
property.py` untrustworthy: which examples `@given`'s own strategies hand
to `check_reorder_quantities_always_positive`. Tracing the second example
this seed produces, verified identically on two separate runs this
session:

`hypothesis`, seeded at `20260817`, generates `inventory={'aic': 776,
'ehbbbiea': 315, 'gfechgci': 15, 'fad': 665, 'gjefc': 221}` and
`threshold_target=(70, 110)` → `check_reorder_quantities_always_positive`
receives these as its two parameters → `threshold, target = threshold_
target` (a Lesson 33-era tuple unpacking, reused here) binds `threshold =
70` and `target = 110` → `reorder_suggestion(inventory, threshold=70,
target=110)` (Lesson 45, `inventory_report.py`) iterates `inventory.
items()` and keeps only entries whose count is strictly below `70`: `aic`
(776), `ehbbbiea` (315), `fad` (665), and `gjefc` (221) are all `>= 70`
and excluded; only `gfechgci` (15) qualifies, so the function returns
`{'gfechgci': 110 - 15}`, i.e. `{'gfechgci': 95}` → back in the check, `for
name, qty in suggestions.items()` iterates that one-entry dictionary once,
binding `name = 'gfechgci'`, `qty = 95` → `assert qty > 0` evaluates `95 >
0`, `True`, no `AssertionError` raised → `hypothesis` moves on to its
third and final fixed example, which passes the same way → the function
call `check_reorder_quantities_always_positive()` at the bottom of the
file returns normally, with no exception ever escaping it → `print(
"check_reorder_quantities_always_positive passed")` runs, and that is the
line this session's own two real runs both actually printed. Every one of
these values — the dictionary's five keys and counts, the `(70, 110)`
pair, the `95` computed from them — is identical on every future run of
this file, on any machine, because `20260817` fixes the one thing that
used to be free to vary.

## What Breaks Without This

Temporarily delete the `@seed(20260817)` line, and temporarily add
`@settings(verbosity=Verbosity.verbose, max_examples=3)` (already
explained above, in the isolated lab) so the actual chosen examples are
visible again:

```python
from hypothesis import given, settings, Verbosity, strategies as st
from inventory_report import reorder_suggestion

def combine_threshold_and_gap(threshold_and_gap):
    threshold, gap = threshold_and_gap
    return (threshold, threshold + gap)

valid_threshold_target_pairs = st.tuples(
    st.integers(min_value=0, max_value=100),
    st.integers(min_value=1, max_value=100),
).map(combine_threshold_and_gap)

@settings(verbosity=Verbosity.verbose, max_examples=3)
@given(
    inventory=st.dictionaries(
        st.text(alphabet="abcdefghij", min_size=1, max_size=8),
        st.integers(min_value=0, max_value=1000),
        max_size=5,
    ),
    threshold_target=valid_threshold_target_pairs,
)
def check_reorder_quantities_always_positive(inventory, threshold_target):
    threshold, target = threshold_target
    suggestions = reorder_suggestion(inventory, threshold=threshold, target=target)
    for name, qty in suggestions.items():
        assert qty > 0

check_reorder_quantities_always_positive()
print("check_reorder_quantities_always_positive passed")
```

Run twice, back to back:

```
$ python3 check_reorder_suggestion_property.py
Test case: check_reorder_quantities_always_positive(
    inventory={},
    threshold_target=(0, 1),
)
Test case: check_reorder_quantities_always_positive(
    inventory={'ggj': 682},
    threshold_target=(3, 17),
)
Test case: check_reorder_quantities_always_positive(
    inventory={},
    threshold_target=(20, 75),
)
check_reorder_quantities_always_positive passed
$ python3 check_reorder_suggestion_property.py
Test case: check_reorder_quantities_always_positive(
    inventory={},
    threshold_target=(0, 1),
)
Test case: check_reorder_quantities_always_positive(
    inventory={'hgac': 10, 'fchdif': 382, 'ahhabhab': 905},
    threshold_target=(8, 71),
)
Test case: check_reorder_quantities_always_positive(
    inventory={'hbfhbj': 496},
    threshold_target=(73, 163),
)
check_reorder_quantities_always_positive passed
```

Both runs still pass — there is no live bug in `reorder_suggestion` right
now — but they are not testing the same thing. The first example
(`inventory={}`, `threshold_target=(0, 1)`) is identical both times,
because `hypothesis` always tries certain simple boundary values before
generating anything at random; the second and third examples are
completely different dictionaries, different keys, different counts,
different thresholds. Restore both the deleted `@seed(20260817)` line and
remove the temporary `@settings(...)` line, returning the file to exactly
the state shown in "The Updated Project," above, and rerun it twice to
confirm it is back to printing only `"check_reorder_quantities_always_
positive passed"`, identically, both times — the state this lesson's own
Concept Unit already verified.

## Exercises

1. `check_parse_inventory_fuzz.py` (Lesson 130) uses the exact same
   unseeded `@given` pattern this lesson just fixed, on a different
   function. Apply the identical fix — add `seed` to its `hypothesis`
   import and place `@seed(20260817)` directly above its own `@given(
   json_like_values)` — and confirm `python3 check_parse_inventory_fuzz.py`
   still prints `check_parse_inventory_never_crashes_unexpectedly passed`,
   run twice, with no other change.
2. Change `@seed(20260817)` in your own copy of `check_reorder_suggestion_
   property.py` to `@seed(1)` instead. Temporarily add `@settings(
   verbosity=Verbosity.verbose, max_examples=3)` the same way "What Breaks
   Without This" did, and run it twice. Confirm two things: the specific
   `inventory`/`threshold_target` values chosen are different from the
   ones `20260817` produces, and the two runs at `@seed(1)` still match
   each other exactly. This is `seed`'s own contract in practice: the
   specific value chosen doesn't matter for reproducibility, only that
   some value is fixed.
3. In every verbose run shown in this lesson — unseeded or seeded, on the
   toy example or the real project's own check — the very first example
   tried is always the simplest possible one allowed by the strategy
   (`n=0`; `inventory={}, threshold_target=(0, 1)`). In one sentence,
   state why this specific fact is not evidence against anything this
   lesson argued about non-determinism.

## Definition of Done

- [ ] `check_reorder_suggestion_property.py` imports `seed` alongside
      `given` and `strategies`, and `@seed(20260817)` sits directly above
      `@given(...)` on `check_reorder_quantities_always_positive`.
- [ ] `python3 check_reorder_suggestion_property.py`, run twice in a row,
      prints identical output both times (verified above).
- [ ] `python3 -m mypy inventory_report.py inventory_cli.py check_
      reorder_suggestion_property.py` reports no issues.
- [ ] The full existing check suite (all seventeen `check_*.py` files)
      still passes, unchanged by this lesson's own two-line edit.
- [ ] `git commit`, with a message explaining why: not "add seed to
      property test," but something closer to "pin the property check's
      own random seed so a red build reproduces the same failure every
      time it's rerun, instead of only sometimes catching the input that
      breaks it."
