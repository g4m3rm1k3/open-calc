# Lesson 8: The Number That Isn't There

## What you will build

`datatools.py` starts loading from `houses_missing.csv` — the same
eight-house file from Lesson 7, except one house's `bedrooms` value is
genuinely absent, the way real datasets (including the housing data
the Hands-On Machine Learning book itself uses, which has missing
values in one of its own columns) actually arrive. Getting there
introduces `NaN`, Pandas' representation for "no value here at all";
`.isna()` combined with `.sum()`, which finds and counts exactly where
data is missing; and two different responses to it — `.dropna()`,
which removes incomplete rows entirely, and `.fillna()`, which
replaces a missing value with a computed stand-in. The transferable
problem this lesson is actually about: every dataset so far in this
curriculum has been complete, with every cell holding a real value —
real data routinely isn't, and code that assumes every cell has a
usable number will either crash or silently compute something wrong
the first time it meets a dataset that doesn't.

## What you need to know first

Lesson 6's `.mean()`, and Lesson 7's `pd.read_csv`, `houses_df['name']`
column selection, and `.describe()` — this lesson reads a variant of
Lesson 7's own CSV file and reuses `.mean()` to compute a stand-in
value for the missing entries it introduces.

## Terms used in this lesson

- **missing value** — a position in a dataset where no real value was
  recorded, as opposed to a position holding a real value that happens
  to be zero, empty text, or otherwise unremarkable. It exists as a
  distinct concept from "a value of zero" or "an empty string" because
  those are still real, meaningful data — a missing value specifically
  represents the absence of any recorded data at all, and conflating
  the two (treating a missing bedroom count as "zero bedrooms," for
  instance) would silently introduce false information into the
  dataset.
- **`NaN`** — short for "Not a Number," a special floating-point value
  Pandas uses to represent a missing value in an otherwise numeric
  column. It exists because a numeric column's cells are expected to
  hold numbers, but "no value was recorded here" isn't a number at
  all; `NaN` is a placeholder that fits inside a numeric column's own
  data type while still being recognizably distinct from every genuine
  number, including zero.

## Objects and methods used

### `DataFrame.isna`

- **What it is:** a method on every `DataFrame` (and every `Series`)
  instance that reports, for each cell, whether it holds a missing
  value.
- **Implementation:** `DataFrame.isna() -> pandas.DataFrame`, of the
  identical shape as the original `DataFrame`, but holding `True`
  where the original held `NaN` and `False` everywhere else — a
  boolean `DataFrame`, the two-dimensional counterpart to the boolean
  arrays and `Series` already used for filtering in Lessons 2 and 3.
- **Its use:** it's how this lesson locates exactly which cells of
  `houses_df` are missing, rather than needing to print the whole
  table and scan for `NaN` by eye.
- **Type:** an instance method, called with parentheses, the same
  category as `.head()` and `.describe()` from Lesson 7.
- **Responsibility:** examine every cell of the `DataFrame` it's called
  on and report, cell by cell, whether it's missing — it does not
  remove, replace, or otherwise alter any of the original data; the
  `DataFrame` it's called on is left completely unchanged.
- **Depends on:** an already-constructed `DataFrame` (or `Series`) to
  check.
- **Connects to:** called directly on `houses_df`, and its boolean
  `DataFrame` return value is what `.sum()`, called immediately after
  it in this lesson's own code, consumes.
- **Shape:** part of `DataFrame`'s core public interface — the
  standard way any Pandas code checks for missing data before deciding
  how to handle it.

### `DataFrame.dropna`

- **What it is:** a method on every `DataFrame` instance that returns
  a new `DataFrame` with every row containing at least one missing
  value removed.
- **Implementation:** `DataFrame.dropna() -> pandas.DataFrame`. By
  default, any row with a `NaN` in *any* column is dropped entirely —
  it does not remove only the missing cell, it removes the whole row
  that cell belongs to.
- **Its use:** it's how this lesson produces a version of `houses_df`
  guaranteed to have no missing values anywhere, by accepting the cost
  of losing whichever rows were incomplete.
- **Type:** an instance method, called with parentheses.
- **Responsibility:** identify every row containing at least one
  missing value and return a new `DataFrame` with those rows excluded,
  keeping every column and every fully complete row exactly as it was
  — it does not modify the original `DataFrame` it's called on, the
  same non-mutating behavior `.head()` already had in Lesson 7.
- **Depends on:** an already-constructed `DataFrame`, and implicitly,
  the results `.isna()` would report, even though `.dropna()` computes
  that check internally rather than requiring `.isna()` to be called
  first.
- **Connects to:** called directly on `houses_df` in this lesson's own
  code, producing a separate, smaller `DataFrame` that exists
  alongside the original, unmodified `houses_df`.
- **Shape:** part of `DataFrame`'s core public interface — one of two
  standard responses to missing data, alongside `.fillna()`, below.

### `DataFrame.fillna`

- **What it is:** a method on every `DataFrame` instance that returns
  a new `DataFrame` with missing values replaced by a given
  replacement value, rather than removed.
- **Implementation:** `DataFrame.fillna(value) -> pandas.DataFrame`.
  `value` can be a single number, applied to every missing cell
  regardless of column, or — as used in this lesson — a `dict` mapping
  specific column names to specific replacement values, so different
  columns can be filled with different stand-ins.
- **Its use:** it's how this lesson replaces the one missing
  `bedrooms` value with that column's own mean, rather than losing the
  entire row the way `.dropna()` would.
- **Type:** an instance method, called with parentheses.
- **Responsibility:** locate every missing value covered by the given
  `value` argument and replace it with the corresponding replacement,
  leaving every already-present value completely untouched — it is not
  responsible for deciding *what* a sensible replacement value is; that
  decision belongs entirely to whatever value the caller passes in.
- **Depends on:** an already-constructed `DataFrame`, and a
  replacement value or mapping supplied by the caller — here,
  `houses_df['bedrooms'].mean()`, computed in this lesson's own code
  before `.fillna()` is called.
- **Connects to:** called directly on `houses_df`, consuming the mean
  computed by `.mean()` moments earlier in the same Concept Unit, and
  producing a separate, filled `DataFrame` alongside the original,
  unmodified `houses_df`.
- **Shape:** part of `DataFrame`'s core public interface — the second
  standard response to missing data, chosen over `.dropna()` whenever
  losing an entire row costs more than the imprecision of a
  reasonable stand-in value.

---

## Concept Unit: Detecting Missing Values

### The Problem

Lesson 7's `houses.csv` had a real, present value in every single
cell — nothing in that lesson ever had to consider what happens if one
didn't. Real datasets frequently aren't that tidy: a sensor
malfunctions, a survey respondent skips a question, or — as in the
housing dataset the Hands-On Machine Learning book itself works with —
one particular column simply has some rows where the value was never
recorded. Before deciding what to *do* about a missing value,
something first has to reliably find where they are.

Given that Lesson 2 and Lesson 3 already proved a comparison like
`array > 1500` produces one `True`/`False` result per element — what
kind of question, asked per cell instead of compared against a
threshold, would let you build the same kind of boolean result for
"is this cell missing"? And once you had that boolean result — one
`True`/`False` per cell of an entire table — what tool from Lesson 6
would let you turn "many individual `True`/`False` values" into "one
number: how many are missing, per column"?

### Isolated Example

```python
>>> import pandas as pd
>>> import numpy as np
>>> table = pd.DataFrame({'x': [1, np.nan, 3]})
>>> table
     x
0  1.0
1  NaN
2  3.0
>>> table.isna()
       x
0  False
1   True
2  False
```

Run for real, this session:

```
>>> import pandas as pd
>>> import numpy as np
>>> table = pd.DataFrame({'x': [1, np.nan, 3]})
>>> table
     x
0  1.0
1  NaN
2  3.0
>>> table.isna()
       x
0  False
1   True
2  False
>>> table.isna().sum()
x    1
dtype: int64
```

This proves `np.nan` — NumPy's own constant for "not a number,"
imported the same way `np.array` was in Lesson 1 — is how a missing
value is written directly in Python code, and that Pandas displays it
as `NaN` when printed. `.isna()` reports exactly where it is, as a
boolean `DataFrame`; `.sum()`, the same method Lesson 6 used to add up
squared deviations, here sums a column of `True`/`False` values by
treating `True` as `1` and `False` as `0` — an already-established
Python behavior, not new to this lesson — giving a per-column count of
missing values in one call. This `table` example is discarded now; it
exists only to prove `.isna()`'s output shape and that `.sum()` on top
of it counts missing values per column, and it will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 7's end state.
- **Files affected:** `houses_missing.csv` — created, as a new project
  data file, a variant of Lesson 7's `houses.csv` with one value
  removed; `datatools.py` — modified.
- **Change type:** replace (`houses_df`'s source file is switched from
  `houses.csv` to `houses_missing.csv`, so every later lesson from
  here forward works with data that includes a real missing value).
- **Location:** replaces `houses_df = pd.read_csv('houses.csv')`, added
  in Lesson 7's first Concept Unit.
- **Dependencies:** `houses_missing.csv` must exist at the path given.

### The New Code

`houses_missing.csv`, the new data file this unit adds to the project
— identical to Lesson 7's `houses.csv`, except the fifth data row's
`bedrooms` value is left blank:

```
size_sqft,bedrooms,price
1400,3,192000
1850,4,254000
900,2,124000
2200,4,296000
1600,,215000
1200,2,158000
2450,5,328000
1750,3,241000
```

```python
houses_df = pd.read_csv('houses_missing.csv')
missing_counts = houses_df.isna().sum()
```

### The Updated Project

`datatools.py`'s data-loading section now reads, in full:

```
1  houses_df = pd.read_csv('houses_missing.csv')   # ← updated: was 'houses.csv'
2  print(houses_df.head())
3  print(houses_df.describe())
4  missing_counts = houses_df.isna().sum()          # ← new
```

As a whole, the file now loads from a version of the housing data that
includes a real missing value, and computes — though doesn't yet
print — exactly how many missing values exist in each column.

### Mechanical Walkthrough

- **`pd.read_csv('houses_missing.csv')`** — the same function
  explained in full in Lesson 7 and, per the Repetition Rule, restated
  here: reads the file's header as column names and every following
  line as a row. The blank left where `bedrooms`'s value should be, on
  the row for the `1600`-square-foot house, is read as a missing
  value rather than as an error or an empty string — CSV's own comma
  format has no special missing-value marker; two commas with nothing
  between them (`1600,,215000`) is simply Pandas' own signal that the
  field between them holds nothing.
- **`houses_df.isna()`** — the method explained in full under Objects
  and methods, above: examines every cell of `houses_df` and returns a
  new, identically-shaped `DataFrame` of `True`/`False` values,
  `True` at the one cell where `bedrooms` is missing for the
  `1600`-square-foot house's row, `False` everywhere else.
- **`.sum()`** — the method first explained in Lesson 6, on a
  one-dimensional array of squared deviations, and, per the Repetition
  Rule, restated here: applied to a boolean `DataFrame` instead, it
  sums each column independently — treating every `True` as `1` and
  every `False` as `0`, an existing rule of Python's own `bool` type
  being a subtype of `int`, not something new to Pandas — producing
  one count per column: how many missing values that column has.
- **`missing_counts = ...`** — assignment, already-familiar syntax,
  binding the name `missing_counts` to that per-column `Series` of
  counts.

### CS Lens

Representing "no value" with a special, out-of-band marker distinct
from every ordinary value is a specific instance of a **sentinel
value** — a value reserved to mean "nothing here" or "end of data,"
rather than being a genuine data value that could be confused with a
real one. The same underlying idea recurs as `null` in many
programming languages and databases, `None` in Python itself, and a
C string's own terminating `'\0'` byte marking where the real
characters end — in every case, the sentinel exists specifically so
"absence" can be represented and checked for without hijacking an
otherwise-valid value (like `0`) to mean two different things at once.

### SE Lens

The alternative not chosen here — and one real datasets sometimes
actually use — is representing a missing bedroom count as `0`
directly in the file, with no distinct missing-value marker at all.
That would let `pd.read_csv` load the file with no `NaN` anywhere, and
every column would stay a clean `int64` type. The cost is silent and
severe: `0` bedrooms is a real, meaningful value — a studio apartment,
for instance — completely different from "we don't know how many
bedrooms this house has." Every later computation touching that column
(this curriculum's own Lesson 6 mean and standard deviation, or Lesson
4's linear prediction) would then treat a genuinely unknown value as
if it were a confirmed fact, silently corrupting every result that
depended on it, with nothing anywhere flagging that anything was
wrong. `NaN`, by contrast, is loud: `.isna()` finds it immediately, and
— as the next two units show — most numeric operations either exclude
it automatically or fail outright rather than quietly treating it as a
real number.

### Commands Needed

None new — `pandas` and `numpy` are already installed from earlier
lessons. Create `houses_missing.csv` with the exact contents shown in
this unit's New Code, above, alongside `datatools.py`, before running
the script.

### Run It

Run for real, this session:

```
>>> import pandas as pd
>>> houses_df = pd.read_csv('houses_missing.csv')
>>> houses_df.isna().sum()
size_sqft    0
bedrooms     1
price        0
dtype: int64
```

Confirms exactly one missing value, in the `bedrooms` column, and
zero missing values in `size_sqft` and `price` — matching the CSV file
above, where only one field, in one row, was left blank.

### Connection

This unit located and counted a real missing value. The next unit
handles it the more conservative way: removing the entire row it
belongs to.

---

## Concept Unit: Dropping Incomplete Rows

### The Problem

`houses_df` now has one row — the `1600`-square-foot house — with an
unknown `bedrooms` value. Any computation that needs every column to
have a real number, for every row, can't safely include this one as-is.
The simplest response is also the most conservative: if a row can't be
trusted to be complete, don't use it at all.

Given `houses_df.isna()` from the previous unit — a boolean
`DataFrame` marking exactly where values are missing — and given that
Lesson 2 and Lesson 3 already proved a boolean array or `Series` can
be used to filter *out* the rows where it holds `True`, using
`arr[mask]` or `df[mask]` — what do you think would happen if you
built a mask meaning "this row has no missing values at all" and used
it to filter `houses_df`? Would that be more or less work than calling
a single method meant to do exactly that?

### Isolated Example

```python
>>> import pandas as pd
>>> import numpy as np
>>> table = pd.DataFrame({'x': [1, np.nan, 3], 'y': [10, 20, 30]})
>>> table.dropna()
     x   y
0  1.0  10
2  3.0  30
```

Run for real, this session:

```
>>> import pandas as pd
>>> import numpy as np
>>> table = pd.DataFrame({'x': [1, np.nan, 3], 'y': [10, 20, 30]})
>>> table.dropna()
     x   y
0  1.0  10
2  3.0  30
>>> table.shape
(3, 2)
>>> table.dropna().shape
(2, 2)
```

This proves `.dropna()` removed row `1` entirely — both its `x` value
(`NaN`) and its otherwise-perfectly-good `y` value (`20`) — because
the row as a whole had a missing value somewhere in it; `.dropna()`
operates on whole rows, not individual cells. `table.shape` confirms
the *original* `table` still has all three rows — `.dropna()`
returned a new, separate `DataFrame`, exactly the non-mutating
behavior `.head()` already had in Lesson 7. This `table` example is
discarded now; it exists only to prove `.dropna()` removes whole rows
and doesn't modify the original `DataFrame`, and it will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `missing_counts =
  houses_df.isna().sum()`, added in the previous unit.
- **Dependencies:** `houses_df`, built in the previous unit.

### The New Code

```python
houses_complete = houses_df.dropna()
```

### The Updated Project

`datatools.py`'s data-loading section now reads, in full:

```
1  houses_df = pd.read_csv('houses_missing.csv')
2  print(houses_df.head())
3  print(houses_df.describe())
4  missing_counts = houses_df.isna().sum()
5  houses_complete = houses_df.dropna()   # ← new
```

As a whole, this block now produces a second, separate `DataFrame`,
`houses_complete`, guaranteed to have no missing values anywhere,
while `houses_df` itself — still holding the one incomplete row — is
left completely unchanged for the next unit's different approach to
use instead.

### Mechanical Walkthrough

- **`houses_df.dropna()`** — the method explained in full under
  Objects and methods, above, called with no arguments: scans every
  row of `houses_df`, finds that exactly one row — the
  `1600`-square-foot house — has a missing `bedrooms` value, and
  returns a new `DataFrame` with that one row excluded, keeping the
  other seven rows and all three columns exactly as they were.
- **`houses_complete = ...`** — assignment, already-familiar syntax,
  binding the name `houses_complete` to that filtered `DataFrame` —
  distinct from `houses_df`, which retains all eight rows, including
  the incomplete one.

### CS Lens

Discarding incomplete records rather than attempting to work around
their missing pieces is a form of **fail-fast validation applied to
data quality**: rather than letting a partially-unreliable row
propagate further into a computation and risk producing a
partially-wrong result somewhere downstream, the row is excluded
immediately, at the earliest point its incompleteness is known. The
same underlying instinct recurs in a form validator rejecting an
incomplete submission outright rather than silently guessing at the
missing fields, and a build system refusing to compile code with an
unresolved dependency rather than substituting a stub and continuing —
in every case, the cost of proceeding on unreliable input is judged
higher than the cost of losing that input entirely.

### SE Lens

The alternative not chosen in *this* unit specifically — covered
instead in the next one — is filling the missing value in rather than
discarding the row it belongs to. `.dropna()`'s own real cost is
information loss: the `1600`-square-foot house's real, valid `price`
of `215000` and real, valid `size_sqft` of `1600` are both thrown away
along with the one missing `bedrooms` value, even though two-thirds of
that row's data was perfectly good. On a dataset with only a few
missing values scattered across otherwise-complete rows, that's a
reasonable, honest tradeoff — the resulting `houses_complete` is
completely trustworthy, at the cost of a shrinking dataset. On a
dataset where missing values are common — one column missing in ten
percent of rows, say — repeatedly dropping incomplete rows can end up
discarding a large fraction of otherwise-usable data, which is exactly
the situation the next unit's alternative approach is built for.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import pandas as pd
>>> houses_df = pd.read_csv('houses_missing.csv')
>>> houses_df.shape
(8, 3)
>>> houses_complete = houses_df.dropna()
>>> houses_complete.shape
(7, 3)
```

`houses_df` still has all eight rows; `houses_complete` has seven —
confirming exactly one row, the incomplete one, was removed, and
nothing else changed.

### Connection

This unit produced a completely reliable, but smaller, version of the
dataset by discarding the one incomplete row entirely. The next unit
takes the opposite approach: keep every row, and replace the missing
value with a reasonable stand-in instead.

---

## Concept Unit: Filling Missing Values

### The Problem

`houses_complete`, from the previous unit, threw away the
`1600`-square-foot house's real `size_sqft` and `price` values just to
avoid its one missing `bedrooms` entry. For a dataset with only one
missing value, losing an entire otherwise-good row is a real cost, and
an avoidable one: rather than discarding the row, a reasonable guess
could stand in for the missing `bedrooms` value instead, keeping the
row's other two, perfectly good values in the dataset.

Given Lesson 6's `.mean()`, already proven to compute "a typical
value" for a whole column — and given that this dataset's other seven
houses' `bedrooms` values are all real numbers, with only the eighth
missing — what do you think would make a more reasonable stand-in for
the missing value than, say, a fixed guess like `0` or `3`: a number
picked arbitrarily, or a number computed directly from the other seven
houses that *do* have a real `bedrooms` value?

### Isolated Example

```python
>>> import pandas as pd
>>> import numpy as np
>>> table = pd.DataFrame({'x': [1, np.nan, 3]})
>>> table['x'].mean()
2.0
>>> table.fillna({'x': table['x'].mean()})
     x
0  1.0
1  2.0
2  3.0
```

Run for real, this session:

```
>>> import pandas as pd
>>> import numpy as np
>>> table = pd.DataFrame({'x': [1, np.nan, 3]})
>>> table['x'].mean()
2.0
>>> table.fillna({'x': table['x'].mean()})
     x
0  1.0
1  2.0
2  3.0
```

This proves `.mean()`, called on the `x` column, automatically ignores
the `NaN` when computing the average — `(1 + 3) / 2 = 2.0`, not
attempting to include the missing value in the sum or the count at
all, since a `NaN` genuinely has no numeric value to contribute.
`.fillna({'x': 2.0})` then replaces exactly the missing cell with that
computed mean, leaving the two already-present values (`1.0` and
`3.0`) completely untouched. This `table` example is discarded now;
it exists only to prove `.mean()` skips missing values automatically
and that `.fillna()` replaces only the missing ones, and it will not
appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `houses_complete =
  houses_df.dropna()`, added in the previous unit.
- **Dependencies:** `houses_df`, still holding all eight rows,
  including the incomplete one.

### The New Code

```python
bedroom_mean = houses_df['bedrooms'].mean()
houses_filled = houses_df.fillna({'bedrooms': bedroom_mean})
```

### The Updated Project

`datatools.py`'s data-loading section now reads, in full — its final
state for this lesson:

```
1  houses_df = pd.read_csv('houses_missing.csv')
2  print(houses_df.head())
3  print(houses_df.describe())
4  missing_counts = houses_df.isna().sum()
5  houses_complete = houses_df.dropna()
6  bedroom_mean = houses_df['bedrooms'].mean()               # ← new
7  houses_filled = houses_df.fillna({'bedrooms': bedroom_mean})  # ← new
```

As a whole, this block now produces two different, independently
usable versions of the dataset alongside the original `houses_df`:
`houses_complete`, with the incomplete row removed entirely, and
`houses_filled`, with all eight rows retained and the one missing
value replaced by that column's own mean.

### Mechanical Walkthrough

- **`houses_df['bedrooms']`** — the column-selection syntax explained
  in full in Lesson 3 and, per the Repetition Rule, restated here:
  given the string `'bedrooms'`, returns that column as a `Series` —
  seven real numbers and one `NaN`.
- **`.mean()`** — the method explained in full in Lesson 6 and, per
  the Repetition Rule, restated here: sums every element and divides
  by the count — but, as proven in this unit's isolated example,
  automatically excludes any `NaN` from both the sum and the count,
  computing the average of only the seven real values rather than
  raising an error or treating the missing value as `0`.
- **`bedroom_mean = ...`** — assignment, binding the name
  `bedroom_mean` to that single computed number.
- **`houses_df.fillna({'bedrooms': bedroom_mean})`** — the method
  explained in full under Objects and methods, above, called with a
  `dict` — already-familiar syntax from Lesson 3 — mapping the string
  `'bedrooms'` to the just-computed `bedroom_mean`: it replaces the one
  missing value in the `bedrooms` column specifically with that mean,
  leaving `size_sqft` and `price` (both already fully complete)
  completely untouched, since no key for either was given in the
  `dict`.
- **`houses_filled = ...`** — assignment, binding the name
  `houses_filled` to that resulting `DataFrame`.

### CS Lens

Replacing a missing value with a statistic computed from the rest of
the data — rather than a fixed, arbitrary guess — is a specific,
named technique called **mean imputation**: substituting a
reasonable, data-derived estimate for an unknown value, so downstream
computations have *something* usable in that position without
fabricating a value out of nothing. The same underlying idea of
substituting a computed estimate for missing information recurs in
signal processing (interpolating a sensor's dropped reading from
its neighboring readings) and in database systems that use a
column's default value when an insert doesn't specify one — in every
case, a principled, derivable stand-in is chosen over either leaving a
genuine gap in the data or guessing blindly.

### SE Lens

The alternative not chosen here is the previous unit's `.dropna()` —
and the real tradeoff between them is honesty versus completeness.
`.dropna()` never introduces a value that wasn't really observed;
every number in `houses_complete` is a real, recorded fact, at the
cost of losing rows. `.fillna()` with a mean keeps every row, at the
cost of introducing one number — `bedroom_mean`, roughly `3.29` — that
was never actually true of the `1600`-square-foot house specifically;
it's a reasonable guess, not a fact, and any later computation using
`houses_filled` is implicitly trusting that guess as if it were real
data. Mean imputation is a defensible choice when a column's real
values cluster fairly closely together, so the mean is a genuinely
plausible stand-in — it becomes a much riskier choice on a column with
widely spread-out values, where "the average" might be a poor
approximation for any single missing entry. Neither `.dropna()` nor
`.fillna()` is the unconditionally "correct" choice; which one a real
project uses depends on how much a missing value can be reasonably
guessed at, and how costly losing a whole row actually is.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import pandas as pd
>>> houses_df = pd.read_csv('houses_missing.csv')
>>> bedroom_mean = houses_df['bedrooms'].mean()
>>> bedroom_mean
3.2857142857142856
>>> houses_filled = houses_df.fillna({'bedrooms': bedroom_mean})
>>> houses_filled
   size_sqft  bedrooms   price
0       1400  3.000000  192000
1       1850  4.000000  254000
2        900  2.000000  124000
3       2200  4.000000  296000
4       1600  3.285714  215000
5       1200  2.000000  158000
6       2450  5.000000  328000
7       1750  3.000000  241000
```

The `1600`-square-foot house — row `4` — now holds `3.285714` in its
`bedrooms` column, exactly `bedroom_mean` rounded for display, rather
than `NaN`; every other row's `bedrooms` value is completely unchanged
from the original file.

### Connection

This unit kept every row of the dataset by replacing its one missing
value with a computed stand-in, completing this lesson's two
contrasting responses to the same real problem: `houses_complete`
drops the uncertainty entirely, and `houses_filled` keeps every row at
the cost of one estimated value.

---

## Connect the Pieces

Follow the one house with a missing value — size `1600`, price
`215000`, `bedrooms` unknown — through everything this lesson built,
start to finish:

1. `pd.read_csv('houses_missing.csv')` reads this house's row exactly
   as the file has it: `1600` for size, nothing at all between the two
   commas for bedrooms, `215000` for price — becoming `NaN` in the
   `bedrooms` position of `houses_df`, at row `4`.
2. `houses_df.isna().sum()` counts this house's missing `bedrooms`
   value as the single `1` reported for that column — the only
   missing value anywhere in the whole file.
3. `houses_df.dropna()` removes this house's entire row from
   `houses_complete` — its real `1600` and `215000` values are gone
   from that version of the dataset, alongside the missing `bedrooms`
   value that caused the removal.
4. `houses_df['bedrooms'].mean()` computes `3.2857142857142856` from
   the *other* seven houses' real bedroom counts — this house's own
   missing value contributes nothing to that computation, confirmed by
   `.mean()`'s automatic exclusion of `NaN`.
5. `houses_df.fillna({'bedrooms': bedroom_mean})` gives this house's
   row, in `houses_filled`, a `bedrooms` value of `3.285714` — not a
   fact about this specific house, but the best available estimate
   from the rest of the dataset, while its real `size_sqft` and
   `price` values are preserved unchanged.

The same one missing value produced two entirely different, equally
valid versions of this house's row — entirely absent from one output,
present with an estimated value in the other — and neither version is
simply "correct": each is the direct, honest consequence of a
different, deliberate choice about how to handle not knowing something
real data sometimes doesn't tell you.
