# Lesson 9: A Number You Can't Predict, on Purpose

## What you will build

`datatools.py` gains a small probability simulation: ten thousand
simulated coin flips, generated with NumPy's own random number
generator, used to estimate the probability of heads by simply
counting how often it actually happened — and then the exact same
simulation, rerun with a fixed **seed**, to prove it produces the
identical sequence of "random" flips every single time. The
transferable problem this lesson is actually about: probability, as a
concept, is about long-run frequency — "how often does this happen,
over many repetitions" — and simulation is the most direct way to
build real intuition for that, by actually generating many repetitions
and counting, rather than only manipulating probability formulas
abstractly. Reproducible randomness, meanwhile, is a genuinely
practical requirement this curriculum is about to need directly: the
train/test split every machine learning workflow depends on is itself
built on randomness, and an experiment that can't be rerun identically
is much harder to debug or compare against a later change.

## What you need to know first

Lesson 1's `np.array` and vectorized comparison operators (`>`, `<`),
first proven on `*` in Lesson 1 and generalized to comparisons in
Lesson 2's `arr > 1500`; and Lesson 6's `.mean()` — this lesson
estimates a probability by comparing a whole array of random numbers
against a threshold in one vectorized expression, then averaging the
resulting boolean array.

## Terms used in this lesson

- **probability** — a number between `0` and `1` describing how likely
  an event is, where `0` means the event never happens and `1` means
  it always happens; equivalently, the long-run fraction of times the
  event occurs if the same random process were repeated many, many
  times. It exists as the standard way to quantify uncertainty
  numerically, rather than only describing it in words like "likely"
  or "rare."
- **random number generator** — code that produces a sequence of
  numbers that behaves, for practical purposes, as if each one were
  chosen unpredictably and independently of the others — a NumPy
  `Generator` object, in this lesson's case. It exists because
  simulating any random process at all — a coin flip, a shuffled deck,
  a dataset split into random groups — requires some source of
  numbers that isn't simply "the next line of a fixed, predictable
  sequence."
- **seed** — a starting value handed to a random number generator that
  fully determines the entire sequence of "random" numbers it will
  produce from that point forward. It exists because computer-generated
  randomness is, underneath, a deterministic calculation — the same
  seed reliably produces the exact same sequence every time — which
  makes a seeded generator's output reproducible on demand, even
  though that same sequence still passes every practical test of
  looking and behaving randomly.
- **simulation** — using a random number generator to actually carry
  out many repetitions of a random process in code, and observing what
  happens, rather than only reasoning about the process mathematically
  in the abstract. It exists as a way to build or check intuition about
  probability directly from generated evidence — "run it ten thousand
  times and count" — especially useful when a process is complex
  enough that working out its exact probability by hand would be
  difficult or error-prone.

## Objects and methods used

### `numpy.random.default_rng`

- **What it is:** a function in the `numpy.random` module that creates
  a new random number `Generator` object — NumPy's own current,
  recommended way to generate random numbers, in place of an older
  interface (`numpy.random.seed`/`numpy.random.random`, not used in
  this lesson) that managed randomness through hidden global state
  instead of an explicit object.
- **Implementation:** `numpy.random.default_rng(seed=None) ->
  numpy.random.Generator`. `seed`, left out, produces a generator
  seeded unpredictably (typically drawing from the operating system's
  own source of randomness); given an integer, it produces a generator
  whose entire future output is fully determined by that integer,
  defined under Terms, above.
- **Its use:** it's how this lesson creates the one object every
  random number in this lesson comes from — both the unseeded version,
  for a genuinely unpredictable simulation, and the seeded version, to
  prove that same simulation can be made to repeat exactly.
- **Type:** a free function in the `numpy.random` module, reached
  through `np.random.default_rng`, not a method on an object this
  lesson already holds.
- **Responsibility:** construct and return one new `Generator`
  instance, initialized either unpredictably or, given a seed,
  deterministically from that seed — it is not itself responsible for
  producing random numbers; that's the returned `Generator`'s own job,
  covered next.
- **Depends on:** nothing required; an optional integer seed.
- **Connects to:** called once per generator this lesson creates; its
  returned `Generator` object is what `.random()`, covered next, is
  called on.
- **Shape:** the standard entry point into NumPy's random number
  generation — the recommended starting point for any code in this
  curriculum, or in real NumPy code generally, that needs
  randomness.

### `Generator.random`

- **What it is:** a method on a NumPy `Generator` instance that
  produces one or more random floating-point numbers, each uniformly
  distributed between `0.0` (inclusive) and `1.0` (exclusive) —
  meaning every value in that range is equally likely to come up, with
  none favored over any other.
- **Implementation:** `Generator.random(size=None) -> float |
  numpy.ndarray`. Called with no argument, it returns a single Python
  float; given an integer `size`, it returns a NumPy `ndarray` of that
  many independent random values instead.
- **Its use:** it's the actual source of randomness this lesson's
  simulation is built on — every simulated coin flip starts as one of
  these uniformly random numbers, turned into a `True`/`False` outcome
  by comparing it against `0.5`.
- **Type:** an instance method, called with parentheses on an
  already-constructed `Generator` — not a free function, unlike
  `default_rng` itself, because which sequence of numbers it produces
  next depends on that specific generator's own internal state, not
  on the `numpy.random` module as a whole.
- **Responsibility:** produce the requested count of random values,
  each uniformly distributed over `[0.0, 1.0)`, advancing the
  generator's own internal state each time so the *next* call — on
  that same `Generator` object — produces different values, not a
  repeat of the same ones.
- **Depends on:** an already-constructed `Generator` instance (from
  `default_rng`) to call it on; an optional integer `size`.
- **Connects to:** called directly on the `Generator` objects this
  lesson's own code builds with `default_rng`; its returned array is
  what the comparison operator `<`, and later `.mean()`, are applied
  to.
- **Shape:** one of several distribution-specific methods a
  `Generator` provides (others exist for non-uniform distributions,
  not used in this lesson); `.random()` specifically is the simplest
  and most commonly reached-for one.

---

## Concept Unit: Simulating a Random Event

### The Problem

A fair coin flip has a well-known probability of heads: `0.5`. That
number is easy to *state*, but this lesson's real goal isn't reciting
it — it's building a way to actually generate random outcomes in code
at all, since every later probability question this curriculum might
ask (what's the chance a random sample of houses averages over a
certain price? what's the chance a random train/test split badly
under-represents one kind of house?) needs a real source of randomness
to answer by simulation rather than by formula alone.

Given that every array built so far in this curriculum — `np.array([...])`
in Lesson 1, `houses` in Lesson 2 — held numbers chosen by you, in
advance, written directly into the code — what do you think a function
whose entire job is producing numbers *nobody* chose in advance would
need to look like? Could it be a plain function call with fixed
arguments, the way `np.array([1, 2, 3])` always returns the identical
result every time it's called — or would it need to behave
differently, by design, on each call?

### Isolated Example

```python
>>> import numpy as np
>>> rng = np.random.default_rng()
>>> rng.random()
0.6218387922637184
>>> rng.random()
0.19806286475962398
```

Run for real, this session:

```
>>> import numpy as np
>>> rng = np.random.default_rng()
>>> rng.random()
0.033829610709135705
>>> rng.random(5)
array([0.01849086, 0.9968698 , 0.34370294, 0.0755021 , 0.75791441])
```

This proves two things. First, `np.random.default_rng()`, called with
no seed, and `.random()`, called on the resulting generator, together
produce a number that's genuinely different every time this exact code
runs — unlike `np.array([1, 2, 3])`, which returns the identical array
on every call. Second, `.random(5)` returns five such values at once,
as a NumPy `ndarray`, each independently drawn from the same uniform
`[0.0, 1.0)` range — every value seen here does fall strictly between
`0` and `1`, confirming the distribution's own stated range. This
`rng` example is discarded now; it exists only to prove `.random()`
produces genuinely varying output and to confirm its `[0.0, 1.0)`
range, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 8's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `houses_filled =
  houses_df.fillna({'bedrooms': bedroom_mean})`, added in Lesson 8's
  third Concept Unit.
- **Dependencies:** `numpy`, already imported on line 1.

### The New Code

```python
rng = np.random.default_rng()
flips = rng.random(10000) < 0.5
```

### The Updated Project

This is a self-contained addition — two new lines with nothing
existing to insert them into — so the whole new block is:

```
1  rng = np.random.default_rng()
2  flips = rng.random(10000) < 0.5
```

As a whole, this block creates one random number generator and uses it
to simulate ten thousand independent, fair coin flips at once — each
one represented as `True` (heads) or `False` (tails) — with no loop
written over the ten thousand trials.

### Mechanical Walkthrough

- **`np.random.default_rng()`** — the function explained in full under
  Objects and methods, above, called here with no argument: produces a
  new `Generator` object, seeded unpredictably since no seed was
  given.
- **`rng = ...`** — assignment, already-familiar syntax, binding the
  name `rng` to that `Generator` object.
- **`rng.random(10000)`** — the method explained in full under Objects
  and methods, above: called with `10000` as its `size` argument, it
  returns a NumPy `ndarray` of ten thousand independent random values,
  each uniformly distributed over `[0.0, 1.0)`.
- **`< 0.5`** — the comparison operator, first explained on `>` in
  Lesson 2 and, per the Repetition Rule, restated here for `<`:
  applied between the array of ten thousand random values and the
  single scalar `0.5`, it compares every element independently and
  returns a new boolean array of the same shape — `True` wherever the
  random value fell below `0.5`, `False` otherwise. Since every value
  in `[0.0, 1.0)` is equally likely, a value falling below `0.5` is
  itself an event with probability `0.5` — this is exactly what
  simulates a fair coin flip: `True` standing in for "heads," `False`
  for "tails."
- **`flips = ...`** — assignment, binding the name `flips` to that
  boolean array of ten thousand simulated outcomes.

### CS Lens

Turning a uniformly random number into a `True`/`False` outcome with a
given probability, by comparing it against a threshold, is a
general-purpose technique — this lesson's threshold, `0.5`, happens to
simulate a fair coin, but the identical pattern with a different
threshold (`< 0.1`, for instance) would simulate any other probability
directly. This is the same underlying idea as **Monte Carlo
simulation**: using repeated random sampling to estimate a quantity
that would be difficult, tedious, or impossible to compute exactly by
direct calculation — the same technique recurs in physics simulations
estimating particle behavior, financial models estimating the range of
possible future outcomes, and, later in this curriculum's own path
toward the Hands-On Machine Learning book, algorithms that use
repeated random sampling as a core part of how they actually work.

### SE Lens

The alternative not chosen here is writing a `for` loop ten thousand
times, calling `rng.random()` once per iteration, comparing each
result to `0.5`, and appending each outcome to a Python list by hand.
That version is correct, and for genuinely understanding what a single
simulated flip looks like, writing it once that way is worthwhile.
The vectorized version — `rng.random(10000) < 0.5` — is the same
performance and readability tradeoff every earlier lesson has already
made repeatedly: NumPy's own compiled code generates and compares all
ten thousand values without Python's own per-iteration interpreter
overhead, and the resulting one-line expression states the entire
simulation's intent — "ten thousand fair-coin outcomes" — without
burying it inside loop-and-accumulator machinery.

### Commands Needed

None new — `numpy` is already installed from Lesson 1.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> rng = np.random.default_rng()
>>> flips = rng.random(10000) < 0.5
>>> flips.shape
(10000,)
>>> flips.dtype
bool
>>> flips[:10]
array([False,  True,  True, False,  True, False, False,  True, False, False])
```

Ten thousand `True`/`False` values, confirmed by `.shape` and
`.dtype`; the exact first ten values shown here will differ on a
different run, since this generator was created unseeded — the exact
behavior the next unit addresses directly.

### Connection

This unit generated ten thousand simulated coin flips but hasn't yet
asked what they're actually good for. The next unit uses them to
answer the original question this lesson opened with: what fraction of
them actually came up heads?

---

## Concept Unit: Estimating a Probability by Counting

### The Problem

`flips`, from the previous unit, holds ten thousand `True`/`False`
values — but nothing has actually looked at them as a group yet. The
probability of heads for a fair coin is `0.5` by definition, but
`flips` wasn't *told* that number anywhere in its own construction —
it was built by comparing random numbers against a threshold. Whether
the actual simulated outcomes really do land close to `0.5`, and how
you'd even check, is still an open question.

Given that Lesson 8 already proved `.sum()` on a boolean array or
`Series` counts how many `True` values it holds, treating `True` as
`1` and `False` as `0` — and given that Lesson 6's `.mean()` computes
a sum divided by a count — what do you predict `flips.mean()` would
compute, for an array holding only `True` and `False` values? Would it
even be meaningful to average a boolean array at all — and if it is,
what quantity do you think that average actually represents?

### Isolated Example

```python
>>> import numpy as np
>>> outcomes = np.array([True, True, False, True])
>>> outcomes.sum()
3
>>> outcomes.mean()
0.75
```

Run for real, this session:

```
>>> import numpy as np
>>> outcomes = np.array([True, True, False, True])
>>> outcomes.sum()
3
>>> outcomes.mean()
0.75
```

This proves `.mean()` on a boolean array computes exactly the fraction
of `True` values — `3` out of `4`, or `0.75` — since `.mean()` is
sum-divided-by-count, and `.sum()` on a boolean array, per Lesson 8,
already counts `True` values as `1`. For an array of simulated coin
flips specifically, that fraction of `True` values *is* the estimated
probability of heads — the definition of probability given under
Terms, above, as "the long-run fraction of times an event occurs,"
computed directly rather than only stated as a formula. This
`outcomes` example is discarded now; it exists only to prove `.mean()`
on a boolean array computes the fraction of `True` values, and it will
not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `flips = rng.random(10000) <
  0.5`, added in the previous unit.
- **Dependencies:** `flips`, built in the previous unit.

### The New Code

```python
estimated_probability = flips.mean()
```

### The Updated Project

`datatools.py`'s simulation block now reads, in full:

```
1  rng = np.random.default_rng()
2  flips = rng.random(10000) < 0.5
3  estimated_probability = flips.mean()   # ← new
```

As a whole, this block now generates ten thousand simulated coin
flips and immediately estimates the probability of heads from them —
the actual answer to this lesson's opening question, computed from
generated evidence rather than only stated as a known fact.

### Mechanical Walkthrough

- **`flips.mean()`** — the method explained in full in Lesson 6 and,
  per the Repetition Rule, restated here: sums every element and
  divides by the count. Applied to `flips`, a boolean array, `True`
  values contribute `1` to the sum and `False` values contribute `0`
  — the same rule proven for `.sum()` in Lesson 8 and confirmed for
  `.mean()` in this unit's isolated example — so the result is exactly
  the fraction of the ten thousand simulated flips that came up heads.
- **`estimated_probability = ...`** — assignment, already-familiar
  syntax, binding the name `estimated_probability` to that single
  computed fraction.

### CS Lens

Estimating a true, fixed probability (`0.5`, for a fair coin, known
here in advance) by counting outcomes across many random trials, and
expecting the estimate to land close to — but not necessarily exactly
at — the true value, is the concrete, hands-on demonstration of the
**law of large numbers**: as the number of independent trials grows,
the observed fraction of an event converges toward its true
probability, getting reliably closer with more trials rather than by
any single trial being individually accurate. The same underlying idea
is why a casino trusts its long-run profit despite any single hand of
blackjack being unpredictable, why a polling organization surveys many
people rather than trusting one respondent's answer, and why this
lesson's own choice of ten thousand trials — rather than ten — produces
an estimate reliably close to `0.5` instead of one that could easily
land anywhere from `0.0` to `1.0` by chance.

### SE Lens

The alternative not chosen here is trusting the known formula —
"a fair coin has probability `0.5` of heads" — without ever running a
simulation to check it. For a genuinely fair coin, whose probability
is already known with certainty, that's completely reasonable; nothing
about running ten thousand simulated flips proves anything a
mathematician didn't already know. The real value of simulation shows
up for questions *without* an easy formula — what's the probability a
random six-house sample, drawn from the housing dataset this
curriculum has been building, has an average price above some
threshold? — where working out an exact answer by hand might be
difficult, but running the same random-and-count pattern this unit
just demonstrated, many times, gives a reliable estimate directly,
even when no clean formula is available.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> rng = np.random.default_rng()
>>> flips = rng.random(10000) < 0.5
>>> flips.mean()
0.5069
```

`0.5069` — close to, but not exactly, the true probability of `0.5`,
which is expected: ten thousand trials gives a reliable estimate, not
a mathematically perfect one. A different run of this exact code would
produce a slightly different number each time — since `rng` here was
created unseeded — which is precisely the behavior the next unit
addresses.

### Connection

This unit estimated a real probability by simulating and counting,
rather than only asserting a known formula. The next unit fixes one
loose end this lesson has carried since its very first "Run It" step:
this exact code produces a *different* estimate every time it runs,
which makes comparing two runs, or debugging one, harder than it needs
to be.

---

## Concept Unit: Reproducibility with a Seed

### The Problem

Every "Run It" step in this lesson so far has printed a genuinely
different number each time the code actually runs — by design, since
`np.random.default_rng()` with no seed draws from an unpredictable
source. That unpredictability is exactly what a real simulation needs.
It becomes a real obstacle the moment reproducibility matters instead:
comparing two runs of an experiment, debugging a specific failure that
only showed up with one particular sequence of random numbers, or —
directly ahead in this curriculum — splitting a dataset into training
and testing groups in a way that can be exactly repeated later.

Given that `np.random.default_rng()` accepts an optional `seed`
argument, defined under Terms, above, as fully determining a
generator's entire future output — what do you predict happens if two
separate `Generator` objects are created with the *same* integer seed,
and `.random()` is then called the same number of times on each? Would
you expect their outputs to still differ, the way two unseeded
generators' outputs do — or to match exactly, every single value, in
order?

### Isolated Example

```python
>>> import numpy as np
>>> rng_a = np.random.default_rng(42)
>>> rng_b = np.random.default_rng(42)
>>> rng_a.random(3)
array([0.77395605, 0.43887844, 0.85859792])
>>> rng_b.random(3)
array([0.77395605, 0.43887844, 0.85859792])
```

Run for real, this session:

```
>>> import numpy as np
>>> rng_a = np.random.default_rng(42)
>>> rng_b = np.random.default_rng(42)
>>> rng_a.random(3)
array([0.77395605, 0.43887844, 0.85859792])
>>> rng_b.random(3)
array([0.77395605, 0.43887844, 0.85859792])
```

This proves two independently-created generators, given the identical
seed `42`, produce the exact same sequence of values, down to every
digit — confirming a seed fully determines a generator's output, per
its definition under Terms, above. Contrast this with two different
seeds, run for real, this session:

```
>>> rng_c = np.random.default_rng(7)
>>> rng_c.random(3)
array([0.62509547, 0.8972138 , 0.77568569])
```

A different seed, `7`, produces a completely different sequence —
confirming the seed, specifically, is what determines the output, not
some other hidden factor. This `rng_a`/`rng_b`/`rng_c` example is
discarded now; it exists only to prove seeded generators are exactly
reproducible and seed-dependent, and it will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** replace (the unseeded `rng = np.random.default_rng()`
  line, added in this lesson's first Concept Unit, is superseded by a
  seeded version, so the whole simulation becomes exactly reproducible
  from here forward).
- **Location:** replaces line 1 of this lesson's simulation block,
  `rng = np.random.default_rng()`.
- **Dependencies:** none beyond what the previous two units already
  established.

### The New Code

```python
rng = np.random.default_rng(42)
```

### The Updated Project

`datatools.py`'s simulation block now reads, in full — its final state
for this lesson:

```
1  rng = np.random.default_rng(42)   # ← updated: was np.random.default_rng()
2  flips = rng.random(10000) < 0.5
3  estimated_probability = flips.mean()
```

As a whole, this block now generates the exact same ten thousand
simulated coin flips, and therefore the exact same estimated
probability, every single time this file is run — the only line that
changed is the generator's own construction; every later line's logic
is completely unchanged from the previous two units.

### Mechanical Walkthrough

- **`np.random.default_rng(42)`** — the same function explained in
  full in this lesson's first Concept Unit and, per the Repetition
  Rule, restated here, now called with the integer `42` as its `seed`
  argument instead of no argument at all: per this unit's own isolated
  example, this fully determines every value `rng.random(...)` will
  ever produce from this generator, in order — the same guarantee
  proven there for `rng_a` and `rng_b`, now applied to this lesson's
  own real simulation instead of a throwaway example.

### CS Lens

A seed turning an otherwise-unpredictable process into an exactly
repeatable one is the same underlying idea as **determinism given a
fixed input** — a system whose entire output is fully determined by
its starting conditions, even when that output, from the outside,
looks unpredictable. The same idea recurs in a pseudo-random number
generator used in video games (a "seed" that regenerates an identical
game world every time), a hash function (the identical input always
produces the identical output, even though outputs look scattered and
unpredictable), and — closely relevant to where this curriculum is
heading — every machine learning library's own convention of accepting
a `random_state` or `seed` argument specifically so an entire training
run, including whichever random choices it makes internally, can be
exactly reproduced later.

### SE Lens

The alternative not chosen here is what this lesson's first two units
already did: an unseeded generator, producing a genuinely different
result on every run. That's the right choice when true
unpredictability is the actual goal — a real cryptographic key, for
instance, must never be reproducible by anyone who knows how it was
generated. It's the wrong choice the moment reproducibility itself
becomes valuable: without a fixed seed, "my simulation gave a
different probability estimate than yours" could mean either a real
bug or simply two different, equally valid unseeded runs, with no way
to tell which from the numbers alone. Seeding costs nothing in
realism — a seeded sequence is, for all practical purposes,
statistically indistinguishable from an unseeded one — and buys back
the ability to say, precisely, "run this again and you'll get the
identical result," which matters enormously for debugging and for
comparing one version of an experiment against another, exactly the
situation a train/test split, later in this curriculum, will need.

### Commands Needed

None new.

### Run It

Run for real, this session, three separate times, as the complete
simulation block:

```python
import numpy as np
rng = np.random.default_rng(42)
flips = rng.random(10000) < 0.5
estimated_probability = flips.mean()
print(estimated_probability)
```

```
0.4988
0.4988
0.4988
```

All three runs, executed independently, produce the identical
`0.4988` — confirming the seeded generator makes this entire
simulation exactly reproducible, unlike the previous unit's own "Run
It" step, where a genuinely different number appeared on each run.

### Connection

This unit made the simulation from this lesson's first two units
exactly repeatable, without changing what it actually computes — the
same estimated-probability-by-counting technique, now reliable to
rerun, compare, and debug, the same requirement the next stage of this
curriculum's own project, splitting data into training and testing
groups, will directly depend on.

---

## Connect the Pieces

Follow one specific value — the very first random number this
lesson's seeded generator ever produces — through everything this
lesson built, start to finish:

1. `np.random.default_rng(42)`, from the third unit, constructs a
   generator whose entire future output is fully determined by the
   seed `42` — confirmed, in that unit's own isolated example, by two
   independently-created generators with the same seed producing
   identical sequences.
2. `rng.random(10000)`, from the first unit, draws ten thousand values
   from that generator in one call; the very first of those ten
   thousand — position `0` — is one specific, exactly reproducible
   floating-point number, the same one every single time this seeded
   code runs.
3. `< 0.5`, from the same unit, turns that specific first value into a
   single `True` or `False` — whichever side of `0.5` it happened to
   land on — becoming position `0` of `flips`. Because the seed fixes
   that first random value exactly, this one outcome is exactly the
   same "heads" or "tails" result on every run, unlike an unseeded
   generator's first flip, which would differ run to run.
4. `.mean()`, from the second unit, folds that one outcome — alongside
   the other 9,999 — into the single estimated probability,
   `0.4988`, confirmed identical across three separate runs in the
   third unit's own "Run It" step.

Every one of this lesson's three ideas builds on the one before it:
without `.random()` there's nothing to compare against `0.5`; without
that comparison there's no boolean array for `.mean()` to summarize;
and without a seed, the exact value this trace just followed —
position `0` of `flips` — would be a different, unrepeatable outcome
on every single run.
