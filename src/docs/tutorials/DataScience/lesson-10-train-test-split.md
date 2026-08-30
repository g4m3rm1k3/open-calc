# Lesson 10: Splitting Data Before Trusting It

## What you will build

`datatools.py` gets its actual last preprocessing step: `houses_filled`
— eight complete rows, missing values already handled by Lesson 8 —
gets randomly shuffled and split into a **training set** and a **test
set**, using the same seeded `Generator` from Lesson 9, and two new
tools: `rng.permutation`, which produces a random reordering of row
positions, and `DataFrame.iloc`, which selects rows by position rather
than by name or condition. The transferable problem this lesson is
actually about: every technique the Hands-On Machine Learning book
teaches from here forward is judged by how well it performs on data it
hasn't seen — and "data it hasn't seen" has to be set aside,
deliberately and before any model ever touches the full dataset, or
that judgment becomes meaningless. This is the exact last step before
this curriculum's own toy project is genuinely ready for the kind of
model-training work the book covers next.

## What you need to know first

Lesson 8's `houses_filled`, and Lesson 9's `np.random.default_rng`
with a seed and `.random()` — this lesson introduces `.permutation()`
as a second method on the same kind of `Generator` object Lesson 9
already built, and reuses that lesson's seeding for the identical
reproducibility reason.

## Terms used in this lesson

- **training set** — the portion of a dataset a model is actually
  allowed to learn from — its patterns, its examples, everything a
  learning algorithm bases its own internal adjustments on. It exists
  as a named, separate concept from "the whole dataset" because a
  model's performance on data it learned from doesn't answer the real
  question of interest: how well it performs on data it hasn't seen.
- **test set** — the portion of a dataset deliberately withheld from
  training, used only afterward, to check how well a model performs on
  data it never learned from. It exists specifically to answer the
  question a training set alone can't: not "did the model memorize
  these particular examples," but "does it generalize to new ones."
- **generalization** — how well a model's learned patterns hold up on
  data it wasn't trained on, as opposed to how well it merely
  reproduces the exact examples it was trained on. It exists as the
  actual goal of nearly every technique the Hands-On Machine Learning
  book teaches; a model that performs perfectly on its training set
  but poorly on new data has learned something, but not something
  useful.
- **permutation** — a reordering of a fixed collection of items, using
  every item exactly once, with no repeats and nothing left out — as
  opposed to a *sample*, which can select fewer than every item, or
  select some more than once. It exists as the specific mathematical
  concept behind "shuffle this dataset's rows into a random order"
  — every original row still appears exactly once afterward, just not
  necessarily in its original position.

## Objects and methods used

### `Generator.permutation`

- **What it is:** a method on a NumPy `Generator` instance — the same
  type of object Lesson 9's `np.random.default_rng` constructs — that
  returns a randomly shuffled version of a sequence of integers.
- **Implementation:** `Generator.permutation(n) -> numpy.ndarray`.
  Given a single integer `n`, it returns a new `ndarray` containing
  every integer from `0` up to (but not including) `n`, exactly once
  each, in a randomly shuffled order — a **permutation**, defined
  under Terms, above, of the numbers `0` through `n - 1`.
- **Its use:** it's how this lesson produces a random ordering of row
  *positions* for `houses_filled`, without touching the actual data in
  those rows at all — the shuffled integers are used afterward to
  select rows, rather than being data themselves.
- **Type:** an instance method, called with parentheses on an
  already-constructed `Generator` — the same category of call as
  Lesson 9's `.random()`, and, like that method, one whose specific
  output depends on the generator's own current internal state, not
  only on the argument passed to it.
- **Responsibility:** produce a genuinely random reordering of the
  integers `0` through `n - 1`, using each exactly once — it is not
  responsible for interpreting what those integers mean afterward
  (row positions, in this lesson's case); that meaning comes entirely
  from how the caller uses the result.
- **Depends on:** an already-constructed `Generator` instance to call
  it on, and a single integer `n` naming how many positions to
  shuffle.
- **Connects to:** called on the seeded `rng` object first built in
  Lesson 9; its returned array of shuffled positions is what this
  lesson's own slicing, and then `.iloc`, are applied to.
- **Shape:** one of several methods a `Generator` provides for
  producing structured randomness, alongside `.random()` from Lesson
  9 — the standard NumPy tool for randomly reordering a fixed-size
  collection of positions.

### `DataFrame.iloc`

- **What it is:** an indexer on every `DataFrame` instance — accessed
  with square brackets, like ordinary indexing, but through the
  `.iloc` attribute specifically — that selects rows (and optionally
  columns) strictly by integer position, regardless of what the
  `DataFrame`'s own row index labels happen to be.
- **Implementation:** `DataFrame.iloc[row_selector]` — `row_selector`
  can be a single integer (selecting one row), a slice, or, as used in
  this lesson, an array of integers, selecting exactly those row
  positions, in the order given, as a new `DataFrame`.
- **Its use:** it's how this lesson turns a shuffled array of row
  *positions*, from `.permutation()`, into an actual, reordered subset
  of `houses_filled`'s real rows.
- **Type:** an attribute (`.iloc`, no parentheses) that itself supports
  square-bracket indexing (`.iloc[...]`) — a two-part access pattern
  distinct from both `df['column_name']` (Lesson 3's column selection
  by label) and `df[boolean_mask]` (Lesson 3's row filtering by
  condition).
- **Responsibility:** given a collection of integer positions, return
  exactly the rows at those positions, in the order given, as a new
  `DataFrame` — critically, it does not care what the `DataFrame`'s own
  row index currently reads; position `3`, via `.iloc`, always means
  "the fourth row, counting from zero," never "the row labeled `3`,"
  even on a `DataFrame` whose index has already been reordered or
  filtered.
- **Depends on:** an already-constructed `DataFrame`, and a valid
  collection of integer positions within its row count.
- **Connects to:** called on `houses_filled` in this lesson's own code,
  with the shuffled and then sliced position arrays from
  `.permutation()` as its argument, producing the final `train_df` and
  `test_df` `DataFrame`s.
- **Shape:** part of `DataFrame`'s core public interface — the
  standard way to select rows by position when a `DataFrame`'s row
  labels shouldn't be relied on, which is exactly the situation a
  randomly shuffled subset of rows creates.

---

## Concept Unit: Shuffling Row Positions

### The Problem

`houses_filled`, from Lesson 8, has its eight rows in the exact order
`houses_missing.csv` originally listed them — which, in a real
dataset, is often an arbitrary or even a systematically biased order
(sorted by date collected, by neighborhood, by whatever order a survey
happened to be conducted in). Selecting a "training set" as simply
"the first several rows" and a "test set" as "whatever's left" risks
those two sets looking nothing alike — a real, structural problem, not
just an aesthetic one — before any model has even been built.

Given Lesson 9's `rng.random(10000)`, which produced ten thousand
independent random *values* — and given that this lesson instead needs
a random *ordering* of `houses_filled`'s eight existing row positions,
`0` through `7`, using each exactly once — do you think
`rng.random(...)` itself, generating fresh random values with no
memory of "which ones have already been used," is the right tool for
that job? What would a function specifically built to shuffle a fixed
set of positions, rather than generate arbitrary new numbers, need to
guarantee that `.random()` alone doesn't?

### Isolated Example

```python
>>> import numpy as np
>>> rng = np.random.default_rng(42)
>>> rng.permutation(5)
array([1, 4, 2, 0, 3])
```

Run for real, this session:

```
>>> import numpy as np
>>> rng = np.random.default_rng(42)
>>> shuffled = rng.permutation(5)
>>> shuffled
array([1, 4, 2, 0, 3])
>>> sorted(shuffled)
[np.int64(0), np.int64(1), np.int64(2), np.int64(3), np.int64(4)]
```

This proves `.permutation(5)` returns exactly the five integers `0`
through `4`, in a random order — confirmed by sorting the result and
getting the plain, unshuffled sequence back, proving nothing was
duplicated and nothing was skipped, exactly the **permutation**
guarantee defined under Terms, above, that plain `.random()` calls,
each independent of the last, don't provide on their own. This `rng`
example is discarded now; it exists only to prove `.permutation()`'s
output really is a full reordering with nothing missing or repeated,
and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 9's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `estimated_probability =
  flips.mean()`, added in Lesson 9's second Concept Unit (Lesson 9's
  third unit only modified the `rng` construction line itself, not
  appended after it).
- **Dependencies:** the seeded `rng` object, built in Lesson 9's third
  Concept Unit; `houses_filled`, built in Lesson 8's third Concept
  Unit.

### The New Code

```python
shuffled_positions = rng.permutation(len(houses_filled))
```

### The Updated Project

This is a self-contained addition — one new line reusing two objects
already built in earlier lessons — so the whole new block is:

```
1  shuffled_positions = rng.permutation(len(houses_filled))
```

As a whole, this line produces a random reordering of the row
positions `0` through `7` — `houses_filled` has eight rows — with
nothing about the actual house data itself touched yet; only the
*positions* have been shuffled.

### Mechanical Walkthrough

- **`len(houses_filled)`** — Python's own already-familiar `len()`
  built-in function, given its own real sentence per the Repetition
  Rule: called on a `DataFrame`, it returns the number of rows —
  `8`, here — the same role `len()` played back in Lesson 4's
  Socratic prompt discussion of `sizes_sqft`, applied here to a
  `DataFrame` instead of a plain `list`.
- **`rng.permutation(...)`** — the method explained in full under
  Objects and methods, above, called with `8` (from `len(houses_filled)`)
  as its argument: returns a new `ndarray` holding the integers `0`
  through `7`, in a random order determined by `rng`'s own current
  internal state — which, because `rng` was seeded with `42` back in
  Lesson 9, is itself fully reproducible.
- **`shuffled_positions = ...`** — assignment, already-familiar
  syntax, binding the name `shuffled_positions` to that shuffled array
  of row positions.

### CS Lens

Generating a random permutation of a fixed collection, rather than
independently sampling values one at a time, is a distinct
computational operation — often implemented internally with an
algorithm called the **Fisher-Yates shuffle**, which guarantees every
possible ordering of the input is equally likely, with no ordering
favored over any other. The same underlying need — reorder a fixed
collection randomly, with every element preserved exactly once —
recurs in shuffling a deck of cards before a card game, randomizing
the order questions appear in on an exam to reduce copying, and
randomizing the playback order of a music playlist — in every case,
what's wanted is a genuine reordering, not a fresh, independent
resampling that could accidentally choose the same item multiple times
or leave one out entirely.

### SE Lens

The alternative not chosen here is what "The Problem," above, already
named as a risk: taking the dataset's rows in whatever order they
already happen to be in — the first several rows as training data, the
rest as test data — with no shuffling step at all. If the original
file's order correlates with anything relevant (houses added to the
dataset chronologically, say, with newer houses tending to be larger or
more expensive), an unshuffled split could put nearly every large
house in one set and nearly every small house in the other, making any
later evaluation misleading in a way that's easy to miss, because
nothing about the code itself would look wrong. Shuffling first, before
splitting, costs one extra function call and removes that entire risk
category — at the cost of losing the original row order entirely,
which is why Lesson 9's seeding matters here specifically: an
unseeded shuffle would make the exact same "which houses ended up
where" question unanswerable on a second run.

### Commands Needed

None new — `numpy` is already installed from Lesson 1.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> rng = np.random.default_rng(42)
>>> houses_len = 8
>>> shuffled_positions = rng.permutation(houses_len)
>>> shuffled_positions
array([3, 4, 2, 7, 6, 1, 5, 0])
```

Eight integers, `0` through `7`, each appearing exactly once, in a
shuffled order — because `rng` here uses the identical seed, `42`,
from Lesson 9, this exact sequence reproduces on every run.

### Connection

This unit produced a random ordering of row *positions*, with none of
the actual house data touched. The next unit divides those shuffled
positions into two groups, and uses them to actually select rows.

---

## Concept Unit: Splitting into Training and Test Sets

### The Problem

`shuffled_positions`, from the previous unit, is one array of eight
shuffled positions — a single group, not yet divided into anything.
A training set and a test set need to be two genuinely separate
groups, with every row belonging to exactly one of them, and — since
this curriculum's toy dataset only has eight houses total — a sensible
split needs to decide roughly what fraction of those eight goes to
each group.

Given `shuffled_positions`, already an ordinary NumPy `ndarray`, and
given that Lesson 2 already proved a slice like `arr[:3]` selects
everything up to (but not including) position `3`, while `arr[3:]`
selects everything from position `3` onward — with the two slices
together covering the whole array exactly once, no overlap and nothing
missing — what single number would you need to compute first, before
writing those two slices, to decide *where* the cut between test and
training rows should fall?

### Isolated Example

```python
>>> import numpy as np
>>> shuffled = np.array([3, 4, 2, 7, 6, 1, 5, 0])
>>> shuffled[:2]
array([3, 4])
>>> shuffled[2:]
array([2, 7, 6, 1, 5, 0])
```

Run for real, this session:

```
>>> import numpy as np
>>> shuffled = np.array([3, 4, 2, 7, 6, 1, 5, 0])
>>> shuffled[:2]
array([3, 4])
>>> shuffled[2:]
array([2, 7, 6, 1, 5, 0])
>>> set(shuffled[:2]) & set(shuffled[2:])
set()
```

This proves the same slicing syntax from Lesson 2 — `arr[:n]` and
`arr[n:]` — splits `shuffled_positions` cleanly into two groups at
whatever position `n` is chosen, with the empty `set()` intersection
confirming no position appears in both groups. This `shuffled` example
is discarded now; it exists only to prove slicing produces two
non-overlapping groups covering the whole array, and it will not
appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `shuffled_positions =
  rng.permutation(len(houses_filled))`, added in the previous unit.
- **Dependencies:** `shuffled_positions`, built in the previous unit.

### The New Code

```python
test_ratio = 0.2
test_size = int(len(houses_filled) * test_ratio)
test_positions = shuffled_positions[:test_size]
train_positions = shuffled_positions[test_size:]
```

### The Updated Project

`datatools.py`'s splitting block now reads, in full:

```
1  shuffled_positions = rng.permutation(len(houses_filled))
2  test_ratio = 0.2                                            # ← new
3  test_size = int(len(houses_filled) * test_ratio)             # ← new
4  test_positions = shuffled_positions[:test_size]               # ← new
5  train_positions = shuffled_positions[test_size:]              # ← new
```

As a whole, this block now decides how many of `houses_filled`'s eight
rows belong in the test set — roughly twenty percent — and divides the
already-shuffled positions into two non-overlapping groups
accordingly.

### Mechanical Walkthrough

- **`test_ratio = 0.2`** — already-familiar Python assignment, binding
  a plain float to a name — the fraction of the dataset intended for
  the test set, twenty percent, a number chosen here rather than
  computed.
- **`len(houses_filled) * test_ratio`** — `len()`, explained again in
  the previous unit, multiplied by `test_ratio` using the `*` operator
  first fully explained in Lesson 1 and restated per the Repetition
  Rule: `8 * 0.2`, giving `1.6`.
- **`int(...)`** — Python's own already-familiar built-in function for
  converting a value to an integer, given its own real sentence per
  the Repetition Rule since this is its first use in this curriculum:
  applied to a float, it truncates toward zero — discarding anything
  after the decimal point rather than rounding — so `int(1.6)` gives
  `1`, not `2`.
- **`test_size = ...`** — assignment, binding the name `test_size` to
  that single integer, `1` — how many of the eight houses will go into
  the test set.
- **`shuffled_positions[:test_size]`** — the slicing syntax explained
  in full in Lesson 2 and, per the Repetition Rule, restated here: a
  slice with nothing before the colon and `test_size` after it selects
  everything from the start up to (but not including) position
  `test_size` — the first `test_size` positions of the already-shuffled
  array.
- **`test_positions = ...`** — assignment, binding the name
  `test_positions` to that slice.
- **`shuffled_positions[test_size:]`** — the same slicing syntax,
  restated again: a slice with `test_size` before the colon and
  nothing after it selects everything from position `test_size` to the
  end — every remaining shuffled position, none of which overlap with
  `test_positions`, per the isolated example's own proof.
- **`train_positions = ...`** — assignment, binding the name
  `train_positions` to that second slice.

### CS Lens

Choosing what fraction of a dataset to reserve for testing, before
looking at how well anything trained on the rest performs, is part of
a broader idea called **experimental design** — deciding, in advance,
how evidence will be gathered and evaluated, rather than deciding
afterward, once results are already visible, in a way that could
(even unintentionally) bias the outcome. The specific eighty-twenty
split used here is a common convention, not a mathematical law — the
same underlying tradeoff (more training data usually helps a model
learn better; more test data usually gives a more reliable performance
estimate) recurs in clinical trials deciding how many participants get
a treatment versus a placebo, and in A/B testing deciding what fraction
of website visitors see a new feature versus the existing one — in
every case, the split has to be decided before the outcome is known,
or the resulting evaluation stops meaning what it's supposed to.

### SE Lens

The alternative not chosen here is deciding the train/test split *by
hand*, picking specific houses for each group based on some ad hoc
judgment ("these look representative") rather than a fixed ratio
applied to already-shuffled positions. Hand-picking might feel more
controlled, but it reintroduces exactly the bias risk this lesson's
first unit shuffled the data specifically to avoid — a human's own
sense of "representative" is itself a source of unintentional
selection bias, the same underlying problem an unshuffled ordering
already posed. The ratio-and-slice approach used here costs a small
amount of arithmetic (`int(len(...) * test_ratio)`) and gains a rule
that's mechanical, reproducible given a fixed seed, and free of any
hidden judgment about which specific houses "look right" for either
group.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> shuffled_positions = np.array([3, 4, 2, 7, 6, 1, 5, 0])
>>> test_ratio = 0.2
>>> test_size = int(8 * test_ratio)
>>> test_size
1
>>> test_positions = shuffled_positions[:test_size]
>>> train_positions = shuffled_positions[test_size:]
>>> test_positions
array([3])
>>> train_positions
array([4, 2, 7, 6, 1, 5, 0])
```

One position (`3`) in the test group, seven in the training group —
`int(8 * 0.2)` truncates `1.6` down to `1`, confirming this small,
eight-row toy dataset only reserves a single house for testing, purely
a consequence of its size — a real dataset with thousands of rows
would see the same `0.2` ratio produce a proportionally much larger
test set.

### Connection

This unit divided the shuffled row positions into two non-overlapping
groups. The next unit finally uses those two groups of positions to
select `houses_filled`'s actual rows into two real, separate
`DataFrame`s.

---

## Concept Unit: Selecting Rows by Position with `.iloc`

### The Problem

`test_positions` and `train_positions`, from the previous unit, are
still just two arrays of integers — `array([3])` and `array([4, 2, 7,
6, 1, 5, 0])` — describing *which* row positions belong to each group,
but not yet containing any of `houses_filled`'s actual size, bedroom,
or price data. Lesson 3's `houses_df['size_sqft']` selects a column by
name; Lesson 3's `houses_df[boolean_mask]` selects rows by a
condition. Neither of those tools selects rows by an arbitrary array of
integer *positions* — a genuinely different kind of selection from
either.

Given that `houses_filled`'s own row index, from Lesson 8, is still
the default `0, 1, 2, ..., 7` — matching row position exactly, for now
— you might reasonably guess `houses_filled[test_positions]`, using
ordinary square brackets the way `houses_filled[boolean_mask]` worked
in Lesson 3, would just work directly. Given that Pandas' own row
index can, in general, be reassigned to something that no longer
matches plain position at all (dates, names, or — after a real
shuffle-and-split, if the index isn't reset — a scrambled set of
integers), what real problem do you think could arise from relying on
plain `[...]` indexing with a position array, rather than a tool that's
explicitly, unambiguously about position and only position?

### Isolated Example

```python
>>> import pandas as pd
>>> table = pd.DataFrame({'x': [10, 20, 30, 40]})
>>> table.iloc[[0, 2]]
    x
0  10
2  30
```

Run for real, this session:

```
>>> import pandas as pd
>>> import numpy as np
>>> table = pd.DataFrame({'x': [10, 20, 30, 40]})
>>> positions = np.array([0, 2])
>>> table.iloc[positions]
    x
0  10
2  30
```

This proves `.iloc[...]`, given an array of integer positions, returns
exactly the rows at those positions — `0` and `2` — as a new
`DataFrame`, with each selected row keeping its own original index
label (`0` and `2`, here, since nothing has scrambled this small
example's index). Continue the same example, run for real, this
session, to see why `.iloc` matters specifically once the index no
longer matches position:

```
>>> reordered = table.iloc[[3, 1, 0, 2]]
>>> reordered
    x
3  40
1  20
0  10
2  30
>>> reordered.iloc[[0]]
    x
3  40
```

After reordering, `reordered`'s row index no longer runs `0, 1, 2, 3`
in order — its first row is now labeled `3`. `reordered.iloc[[0]]`
still correctly returns the *first* row by position — labeled `3` —
proving `.iloc` tracks position regardless of what the index labels
say, exactly the guarantee this unit's Socratic prompt asked you to
reason about. This `table`/`reordered` example is discarded now; it
exists only to prove `.iloc` selects by position, ignoring the index
labels entirely, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `train_positions =
  shuffled_positions[test_size:]`, added in the previous unit.
- **Dependencies:** `houses_filled`, from Lesson 8; `test_positions`
  and `train_positions`, from the previous unit.

### The New Code

```python
test_df = houses_filled.iloc[test_positions]
train_df = houses_filled.iloc[train_positions]
```

### The Updated Project

`datatools.py`'s splitting block now reads, in full — its final state
for this lesson:

```
1  shuffled_positions = rng.permutation(len(houses_filled))
2  test_ratio = 0.2
3  test_size = int(len(houses_filled) * test_ratio)
4  test_positions = shuffled_positions[:test_size]
5  train_positions = shuffled_positions[test_size:]
6  test_df = houses_filled.iloc[test_positions]    # ← new
7  train_df = houses_filled.iloc[train_positions]  # ← new
```

As a whole, this block now completes the entire train/test split this
lesson set out to build: `houses_filled`'s eight rows, shuffled and
divided by ratio into two groups of positions, are finally realized as
two genuine, separate `DataFrame`s — `train_df`, holding seven houses'
complete data, and `test_df`, holding the one house set aside and
never to be used for training anything built from this data.

### Mechanical Walkthrough

- **`houses_filled.iloc[test_positions]`** — the indexer explained in
  full under Objects and methods, above: `.iloc`, followed by
  square-bracket indexing with `test_positions` (the one-element array
  from the previous unit's "Run It" step, `array([3])`) — returns a
  new `DataFrame` containing exactly the row at position `3` of
  `houses_filled`, regardless of what that row's own index label
  happens to be.
- **`test_df = ...`** — assignment, already-familiar syntax, binding
  the name `test_df` to that one-row `DataFrame`.
- **`houses_filled.iloc[train_positions]`** — the same `.iloc`
  indexer, given the seven-element `train_positions` array instead,
  returning a new `DataFrame` with those seven rows, in the shuffled
  order `train_positions` specifies — not necessarily `houses_filled`'s
  own original row order.
- **`train_df = ...`** — assignment, binding the name `train_df` to
  that seven-row `DataFrame`.

### CS Lens

Selecting elements from a collection using a separately computed array
of positions, rather than a condition evaluated on the data itself, is
sometimes called **fancy indexing** or **gather** — using one array's
values as *addresses* into a second array or table, rather than as
data to be operated on directly. The same underlying operation recurs
in image processing (selecting specific pixels by a list of
coordinates), database systems (a join operation matching rows by a
key, conceptually a position lookup by another name), and, closer to
this curriculum's own earlier lessons, `houses[:, 0]` from Lesson 2,
which is itself a simpler, fixed case of the identical idea: using
one value (`0`, the column position) to select data from another
(`houses`) rather than filtering by a computed condition, the way
Lesson 2's boolean masking did instead.

### SE Lens

The alternative this unit's own Socratic prompt raised — plain
`houses_filled[test_positions]`, without `.iloc` — happens to produce
the same result on `houses_filled` specifically, since its row index
still matches position exactly, unchanged since Lesson 8. That
coincidence is exactly the trap: the moment any earlier step reorders
or filters a `DataFrame` without resetting its index — which
`train_df` and `test_df`, immediately after this very split, both now
have, since `.iloc` preserves each selected row's *original* index
label rather than renumbering — plain `[...]` indexing with an integer
array stops meaning "by position" and starts meaning something far
more ambiguous, risking either a confusing error or, worse, silently
selecting the wrong rows. `.iloc` costs nothing extra to write and
removes that entire ambiguity by being explicit, in the code itself,
about exactly which of the two meanings — "by position" or "by label"
— is intended, every single time.

### Commands Needed

None new.

### Run It

Run for real, this session, as the complete splitting block:

```python
import numpy as np
import pandas as pd

houses_df = pd.read_csv('houses_missing.csv')
bedroom_mean = houses_df['bedrooms'].mean()
houses_filled = houses_df.fillna({'bedrooms': bedroom_mean})

rng = np.random.default_rng(42)
shuffled_positions = rng.permutation(len(houses_filled))
test_ratio = 0.2
test_size = int(len(houses_filled) * test_ratio)
test_positions = shuffled_positions[:test_size]
train_positions = shuffled_positions[test_size:]
test_df = houses_filled.iloc[test_positions]
train_df = houses_filled.iloc[train_positions]

print(train_df)
print()
print(test_df)
```

```
   size_sqft  bedrooms   price
4       1600  3.285714  215000
2        900  2.000000  124000
7       1750  3.000000  241000
6       2450  5.000000  328000
1       1850  4.000000  254000
5       1200  2.000000  158000
0       1400  3.000000  192000

   size_sqft  bedrooms   price
3       2200       4.0  296000
```

Seven rows in `train_df`, one in `test_df`, with row `3` — the
2,200-square-foot house — the one set aside for testing; row labels on
the left are each row's original position in `houses_filled`, not a
fresh `0, 1, 2, ...` renumbering, exactly as `.iloc`'s own contract
predicts.

### Connection

This unit turned two arrays of shuffled positions into two real,
usable `DataFrame`s — completing the whole pipeline this lesson set
out to build, and the last preprocessing step this curriculum's own
toy project needs before it's structurally ready for the kind of model
training the Hands-On Machine Learning book covers from here forward.

---

## Connect the Pieces

Follow the house that actually ends up in the test set — size `2200`,
`4` bedrooms, price `296000`, originally row `3` of `houses_missing.csv`
— through everything this lesson built, start to finish:

1. `rng.permutation(8)`, seeded with `42` back in Lesson 9, places this
   house's original position, `3`, at index `0` of
   `shuffled_positions` — the very first entry of the shuffled array,
   confirmed by that unit's own "Run It" step: `array([3, 4, 2, 7, 6,
   1, 5, 0])`.
2. `test_size = int(8 * 0.2)` computes `1` — meaning only the first
   entry of `shuffled_positions` becomes part of the test set.
3. `test_positions = shuffled_positions[:1]` selects exactly that
   first entry — `array([3])` — which is this house's original
   position, landing it in the test group purely because it happened
   to shuffle into the very first slot.
4. `houses_filled.iloc[test_positions]` uses that position array to
   pull this house's real row — size `2200`, `4` bedrooms, price
   `296000` — out of `houses_filled` and into `test_df`, where it will
   remain untouched by any training step the rest of this curriculum
   eventually builds.

This house was never chosen for the test set by anything about its own
data — not its size, not its price, nothing about what makes it
different from the other seven houses — only by where the seeded
shuffle happened to place its original position. That's not an
accident this lesson is glossing over; it's the entire point:
a train/test split that depended on anything about a house's own
values, rather than on random chance alone, would risk the same bias
this lesson's first unit shuffled the data specifically to remove.
