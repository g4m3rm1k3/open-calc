# Lesson 3: Giving Columns Names Instead of Numbers

## What you will build

`datatools.py` currently holds house data as a NumPy `ndarray`, where
"the size column" means "column `0`" — a position you have to remember
correctly every time you write `houses[:, 0]`. This lesson replaces
that array with a Pandas `DataFrame`: the same row-per-house,
column-per-feature layout, but with each column addressed by a real
name — `houses_df['size_sqft']` instead of `houses[:, 0]`. From there,
the lesson shows that selecting a column and filtering rows by a
condition — both already learned on NumPy arrays in Lesson 2 — work
the same underlying way on a `DataFrame`, because a `DataFrame` is
built directly on top of NumPy arrays, not a competing idea. The
transferable problem this lesson is actually about: numeric position
is fragile — reorder the columns, and every `[:, 0]` in your code now
means something different — and a name is not.

## What you need to know first

Lesson 1's `np.array` and vectorized arithmetic, and Lesson 2's 2D
array shape, `arr[:, i]` column slicing, and boolean masking with
`arr[arr > x]` — this lesson assumes all three are already comfortable,
since every one of them reappears here, restated in full, applied to a
new container built on top of the one Lesson 2 used.

## Terms used in this lesson

- **`DataFrame`** — Pandas' table-like container: a two-dimensional
  structure of labeled columns, each one internally a NumPy array,
  aligned by a shared row label called an index. It exists because a
  raw `ndarray` has no place to store column names or row labels at
  all — those live only in a programmer's memory or a comment, which
  Lesson 2's `houses[:, 0]` already depended on ("column `0` is
  size") with nothing in the code itself confirming that fact.
- **`Series`** — Pandas' one-dimensional labeled container — a single
  column (or a single row) of a `DataFrame`, pulled out on its own,
  still carrying its own name and row labels rather than being reduced
  to a bare NumPy array with no memory of where it came from. It
  exists because selecting one column out of a `DataFrame` needs
  *some* return type, and returning a plain `ndarray` would throw away
  the column's name and row labels in the process.
- **index (Pandas)** — the row labels every `Series` and `DataFrame`
  carries alongside its actual data, shown as the leftmost column when
  either is printed. By default it's just `0, 1, 2, ...`, matching
  plain position — but it exists as its own real, inspectable thing,
  distinct from position, because Pandas allows it to be reassigned to
  something meaningful (a date, a name) in ways a raw array position
  never could be.

## Objects and methods used

### `pandas.DataFrame`

- **What it is:** a class in the `pandas` package — Pandas' central
  two-dimensional, labeled data structure.
- **Implementation:** `pandas.DataFrame(data, columns=None,
  index=None) -> pandas.DataFrame`. This lesson uses the `dict`-of-lists
  form: `data` is a Python `dict` whose keys become column names and
  whose values (each a `list` or array of equal length) become that
  column's data.
- **Its use:** it's the container `houses_df`, built in this lesson,
  actually is — the replacement for the bare `ndarray` `houses` from
  Lesson 2, now with real column names attached.
- **Type:** a class, constructed by calling it directly —
  `pd.DataFrame(...)` — not a function returning some other type.
- **Responsibility:** hold multiple named, equal-length columns of
  data together as one table, keep every column's values aligned to a
  shared row index, and expose that data through labels (column
  names) as well as position.
- **Depends on:** a source of data — here, a Python `dict` mapping
  column names to equal-length lists of values.
- **Connects to:** built once, from a `dict` literal, at the start of
  this lesson's Concept Unit sequence; every later line in this
  lesson — column selection, `.shape`, boolean filtering — is called
  on the `DataFrame` it returns.
- **Shape:** the primary data structure of the `pandas` package —
  the same container every later lesson touching real datasets (the
  book's own housing data included) will be built on.

### `DataFrame.__getitem__` (column selection, `df['name']`)

- **What it is:** square-bracket access on a `DataFrame` instance,
  provided by the type's own indexing machinery — the same
  `__getitem__` mechanism Lesson 2 named for `ndarray`, here doing
  something specific to `DataFrame`: selecting by column *label*
  rather than by position.
- **Implementation:** `df['column_name']` returns that one column as a
  `pandas.Series`; `df[boolean_series]`, covered later in this lesson,
  returns a new `DataFrame` containing only the rows where that
  boolean `Series` holds `True`.
- **Its use:** it's how this lesson reaches `houses_df['size_sqft']`
  — the size column, by name — without needing to know or remember
  which position it was written in.
- **Type:** special-method-backed syntax (`__getitem__`) on the
  `DataFrame` instance, written with square brackets and a string
  column name, not a dotted method call.
- **Responsibility:** given a column name, return exactly that
  column's data, with its row index intact, as a `Series` — or, given
  a boolean `Series` of matching length, return a filtered
  `DataFrame`; it is not responsible for validating that the data
  inside the column makes sense, only for retrieving it correctly by
  the label given.
- **Depends on:** an already-constructed `DataFrame` with a column
  actually named whatever string is passed in — a misspelled name
  raises a `KeyError`, since there's no position to fall back to.
- **Connects to:** called directly on `houses_df` in this lesson's own
  code, and its `Series` return value is what a later comparison
  (`> 1500`) and `print` both consume.
- **Shape:** part of `DataFrame`'s core public interface — the primary
  way real code reaches into a `DataFrame`'s columns throughout every
  later lesson using one.

---

## Concept Unit: Building a Labeled Table

### The Problem

`houses`, from Lesson 2, is a plain `ndarray` with shape `(4, 2)`.
Reading `houses[:, 0]` as "the size column" only works because you,
the programmer, remember that size was written first when the array
was built — nothing in `houses[:, 0]` itself says "size." Swap the
column order while editing the file, forget which was which, or hand
the array to someone who wasn't there when it was built, and
`houses[:, 0]` silently starts meaning something else, with no error
raised anywhere.

Given that a Python `dict` already lets you attach a name to a value
(`{'size_sqft': [...], 'bedrooms': [...]}`), and given that Lesson 2's
`houses` array already holds this same data positionally — what do you
think a container that combined "the shape of a 2D array" with "the
naming of a `dict`" would actually need to store, at minimum, to make
`df['size_sqft']` mean something concrete? Would a name alone be
enough, or would it also need to know how many rows exist and which
row is which?

### Isolated Example

```python
>>> import pandas as pd
>>> pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
   a  b
0  1  4
1  2  5
2  3  6
```

Run for real, this session:

```
>>> import pandas as pd
>>> table = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
>>> table
   a  b
0  1  4
1  2  5
2  3  6
>>> type(table)
<class 'pandas.core.frame.DataFrame'>
```

This proves `pd.DataFrame` accepts a Python `dict` whose keys become
column headers (`a`, `b`, printed across the top) and whose values
become that column's rows, with an automatically generated row index
(`0`, `1`, `2`, printed down the left side) that this lesson did not
ask for or supply. This `table` example is discarded now; it exists
only to prove the `dict`-of-lists form of `pd.DataFrame` and the shape
of what it prints, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 2's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** replace (the `houses` `ndarray` from Lesson 2, and
  the lines built directly on it, are superseded by a `DataFrame`
  covering the same data; the earlier lines are removed rather than
  left alongside the new ones).
- **Location:** replaces lines 3–8 (the `houses = np.array([...])`
  block, added in Lesson 2's first Concept Unit) and lines 14–15
  (`sizes_sqm = houses[:, 0] * SQFT_TO_SQM` and `first_house =
  houses[0]`, which depended on positional indexing this lesson is
  moving away from).
- **Dependencies:** the `pandas` package must be installed (see
  Commands, below).

### The New Code

```python
import pandas as pd

houses_df = pd.DataFrame({
    'size_sqft': [1400, 1850, 900, 2200],
    'bedrooms': [3, 4, 2, 4],
})
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2  import pandas as pd                  # ← new
3
4  houses_df = pd.DataFrame({           # ← new
5      'size_sqft': [1400, 1850, 900, 2200],   # ← new
6      'bedrooms': [3, 4, 2, 4],        # ← new
7  })                                   # ← new
8
9  print(houses_df.shape)
10 print(houses_df.dtypes)
11
12 SQFT_TO_SQM = 0.092903
```

(`houses_df.shape` and `houses_df.dtypes` on lines 9–10, and the
conversion constant on line 12, are covered in the next Concept Unit —
they're shown here already in place because they replace Lesson 2's
`print(houses.shape)` / `print(houses.dtype)` lines directly, keeping
the file's line numbers accurate as this unit's own diff.) As a whole,
the file now builds house data as a labeled `DataFrame` instead of a
bare `ndarray` — `numpy` is still imported, since `SQFT_TO_SQM` and
later arithmetic still rely on it underneath Pandas, but the data
itself now carries real column names.

### Mechanical Walkthrough

- **`import pandas as pd`** — the `import` statement and `as` alias,
  both explained in full in Lesson 1 and, per the Repetition Rule,
  restated here: `import` loads the `pandas` package's code and binds
  it to a name, and `as pd` rebinds that name to the shorter `pd` —
  the same community-wide convention `np` is for NumPy.
- **`pd.DataFrame({...})`** — the class explained in full under
  Objects and methods, above, called directly to construct a new
  instance: `pd.DataFrame`, reached through the `pd` alias.
- **`{'size_sqft': [1400, 1850, 900, 2200], 'bedrooms': [3, 4, 2, 4]}`**
  — a Python `dict` literal, already-familiar syntax given its own
  real sentence per the Repetition Rule: curly braces enclosing
  `key: value` pairs separated by commas, here mapping the string
  `'size_sqft'` to a `list` of four sizes and `'bedrooms'` to a `list`
  of four bedroom counts — the exact same numbers Lesson 2 stored
  positionally in `houses`, now each attached to a name.
- **`houses_df = ...`** — assignment, already-familiar syntax, binding
  the name `houses_df` to the new `DataFrame` `pd.DataFrame({...})`
  returns.

### CS Lens

Attaching a name to each field of a record, rather than relying on
position alone, is the same underlying idea as a **schema** — a
declared structure naming what each piece of stored data means, used
so both the data and the code reading it agree on meaning without
either side needing to memorize an order. The same idea recurs in a
SQL table's column definitions, a JSON object's keys (as opposed to a
bare JSON array), and a class's named fields in almost any
object-oriented language — in every case, retrieval by name survives
reordering, insertion, or a reader unfamiliar with the original
layout, in a way retrieval by bare position never does.

### SE Lens

The alternative not chosen here is exactly what Lesson 2 already
built: a bare `ndarray` with column meaning tracked only by
convention and a programmer's memory. That approach isn't wrong — it's
faster to build for a quick, throwaway four-row example, and it avoids
the cost `DataFrame` does pay: every column lookup by name
(`df['size_sqft']`) involves a small amount of extra work compared to
directly indexing an already-known integer position, and the
`DataFrame` object itself carries more bookkeeping (the index, the
column names) than a bare array does. That overhead buys real safety
back: a misspelled column name raises a `KeyError` immediately, loud
and at the exact line it happened, where a wrong column *position* in
an `ndarray` silently returns the wrong column's data with no error
at all — exactly the failure mode named in "The Problem," above.

### Commands Needed

If `import pandas as pd` raises `ModuleNotFoundError: No module named
'pandas'`, install it the same way NumPy was installed in Lesson 1:

```
pip install pandas
```

Success looks like a `Successfully installed pandas-<version>` line
with no red error text above it.

### Run It

Already run and shown above, under Isolated Example — `pd.DataFrame({'a':
[1, 2, 3], 'b': [4, 5, 6]})` really does print as a table with column
headers across the top and a row index down the left. The New Code
block itself builds `houses_df` but prints nothing yet — that comes in
the next Concept Unit.

### Connection

This unit replaced Lesson 2's bare `ndarray` with a `DataFrame`
holding the same data under real column names — the next unit
confirms exactly what those names and that structure actually let you
do that positional indexing alone couldn't.

---

## Concept Unit: Selecting a Column by Name

### The Problem

`houses_df` now exists, with column names `size_sqft` and `bedrooms` —
but nothing has actually used those names yet to pull data back out.
Lesson 2's `houses[:, 0]` got you the size column by remembering it
was written first; the entire point of building `houses_df` instead
was to stop needing to remember that. Something has to confirm that a
name-based lookup actually works, and say precisely what it returns.

Given that `houses_df['size_sqft']` is a single string used to look up
one column, and given what square-bracket indexing already returned
for an `ndarray` in Lesson 2 (`houses[:, 0]` returned a
one-dimensional array), what type would you guess `houses_df['size_sqft']`
returns — the exact same kind of thing, or something Pandas-specific
carrying more than a `houses[:, 0]` result did? What information do
you think would be worth keeping around, per value, that a bare
`ndarray` element doesn't carry?

### Isolated Example

```python
>>> import pandas as pd
>>> table = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
>>> table['a']
0    1
1    2
2    3
Name: a, dtype: int64
>>> type(table['a'])
<class 'pandas.core.series.Series'>
```

Run for real, this session:

```
>>> import pandas as pd
>>> table = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
>>> table['a']
0    1
1    2
2    3
Name: a, dtype: int64
>>> type(table['a'])
<class 'pandas.core.series.Series'>
```

This proves `table['a']` returns a **`Series`**, defined under Terms,
above — not a plain `ndarray`. Printed, it shows each value alongside
its row index (`0`, `1`, `2`, on the left) and, at the bottom, its own
`Name` (`a`, the column it came from) and `dtype` — carrying more
identity than a bare array value would. This `table` example is
discarded now; it exists only to prove column selection returns a
named `Series`, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after the `SQFT_TO_SQM = 0.092903` line from
  the previous unit.
- **Dependencies:** the `houses_df` `DataFrame`, built in the previous
  unit.

### The New Code

```python
sizes_sqm = houses_df['size_sqft'] * SQFT_TO_SQM
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2  import pandas as pd
3
4  houses_df = pd.DataFrame({
5      'size_sqft': [1400, 1850, 900, 2200],
6      'bedrooms': [3, 4, 2, 4],
7  })
8
9  print(houses_df.shape)
10 print(houses_df.dtypes)
11
12 SQFT_TO_SQM = 0.092903
13 sizes_sqm = houses_df['size_sqft'] * SQFT_TO_SQM   # ← new
```

As a whole, the file now converts the size column to square meters by
selecting it by name and multiplying — the same conversion Lesson 2
did with `houses[:, 0] * SQFT_TO_SQM`, now written as
`houses_df['size_sqft'] * SQFT_TO_SQM`, with a real name in place of a
remembered position.

### Mechanical Walkthrough

- **`houses_df['size_sqft']`** — the square-bracket column-selection
  syntax explained in full under Objects and methods, above: given the
  string `'size_sqft'`, it looks up the column registered under that
  exact name and returns it as a `Series` — the same behavior proven
  in the isolated example, here applied to `houses_df` and the real
  column name `size_sqft` instead of `table` and `a`.
- **`* SQFT_TO_SQM`** — the vectorized multiplication operator, first
  explained in Lesson 1 on an `ndarray` and, per the Repetition Rule,
  restated here: it multiplies every element by the constant
  independently and returns a new object of the same shape. Applied
  to a `Series` rather than a bare `ndarray`, the result is a new
  `Series` — Pandas defines `*` on its own `Series` type to behave the
  same element-by-element way NumPy already defined it on `ndarray`,
  since a `Series` is built directly on top of one.
- **`sizes_sqm = ...`** — assignment, already-familiar syntax, binding
  the name `sizes_sqm` to the resulting `Series` of converted values.

### CS Lens

A `Series` carrying its own name and index alongside its values,
rather than being a bare, anonymous block of numbers, is an instance
of the broader idea of a **value object that carries its own
provenance** — data that remembers where it came from and what it
means, not just what its numbers are. The same idea recurs in a
labeled axis on a chart (an array of numbers is meaningless without
knowing what each position represents), a column returned by a SQL
query (which still carries its column name in the result set, not
just raw values), and a typed variable in a statically typed language
whose name persists through a debugger even after the underlying
value has changed.

### SE Lens

The alternative not chosen here is what Lesson 2's `houses[:, 0]`
already did — return a bare `ndarray` with no name attached, trusting
the surrounding code (a variable named `sizes_sqm`, in that case) to
carry the meaning instead. That's genuinely lighter-weight: no `Name:`
or index bookkeeping to maintain. What it costs is exactly the problem
this lesson opened with — a bare array, once passed into a function or
printed on its own, carries no memory of which column it came from;
a `Series` does, which matters the moment a `DataFrame` has a dozen
columns instead of two and a bug report says "the numbers in this
`Series` look wrong" — a `Series`'s own `Name` answers "which numbers"
immediately, where a bare array leaves that answer entirely up to
whatever variable name happened to be used at the print site.

### Commands Needed

None new — run the same way as before.

### Run It

Run for real, this session:

```
>>> import pandas as pd
>>> houses_df = pd.DataFrame({'size_sqft': [1400, 1850, 900, 2200], 'bedrooms': [3, 4, 2, 4]})
>>> SQFT_TO_SQM = 0.092903
>>> houses_df['size_sqft'] * SQFT_TO_SQM
0    130.0642
1    171.87005
2     83.6127
3    204.3866
Name: size_sqft, dtype: float64
```

Four converted values, one per house, each still labeled by its
original row index and still carrying the `size_sqft` name — even
though the values themselves are now square meters, not square feet.

### Connection

This unit selected one column by name and confirmed it returns a
`Series` that still carries its own identity — the next unit uses that
same name-based selection to build a condition, then filters the whole
table by it, the same way Lesson 2 filtered a bare array by a boolean
mask.

---

## Concept Unit: Filtering a DataFrame by Condition

### The Problem

Lesson 2 answered "which houses are over 1,500 square feet?" by
building a boolean array from `houses[:, 0] > 1500` and using it to
filter `houses`. `houses_df` needs the same answer, but `houses_df`
isn't an `ndarray` — it's a `DataFrame`, and `houses_df['size_sqft']`
is a `Series`, not a bare array. Whether the same comparison-then-filter
pattern from Lesson 2 still works at all, on these new types, hasn't
been shown yet.

Given that `houses_df['size_sqft']` was just shown, in the previous
unit, to support `*` the same vectorized way an `ndarray` does — and
Lesson 2 already proved that `>` on an `ndarray` produces a boolean
array, one `True`/`False` per element — what would you predict
`houses_df['size_sqft'] > 1500` produces? A `Series` of
`True`/`False`, the same way `*` produced a `Series` of numbers? And
if so, do you expect `houses_df[that_result]` to behave like Lesson
2's `houses[is_large]` — keeping only matching rows — or something
different, now that rows carry column names instead of just numbers?

### Isolated Example

```python
>>> import pandas as pd
>>> table = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
>>> table['a'] > 1
0    False
1     True
2     True
Name: a, dtype: bool
>>> table[table['a'] > 1]
   a  b
1  2  5
2  3  6
```

Run for real, this session:

```
>>> import pandas as pd
>>> table = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
>>> table['a'] > 1
0    False
1     True
2     True
Name: a, dtype: bool
>>> table[table['a'] > 1]
   a  b
1  2  5
2  3  6
```

This proves the prediction: `table['a'] > 1` returns a boolean
`Series`, one `True`/`False` per row, matching the pattern Lesson 2
already proved for `ndarray`. `table[boolean_series]` then keeps only
the rows where that `Series` holds `True` — here, rows `1` and `2` —
returning a new `DataFrame` with *every* column intact for those rows,
not just column `a`, the same "whole row survives" behavior Lesson 2's
`houses[is_large]` had. This `table` example is discarded now; it
exists only to confirm boolean filtering on a `DataFrame` matches
Lesson 2's pattern on an `ndarray`, and it will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after the `sizes_sqm = houses_df['size_sqft']
  * SQFT_TO_SQM` line from the previous unit.
- **Dependencies:** `houses_df`, built in the first unit of this
  lesson.

### The New Code

```python
is_large = houses_df['size_sqft'] > 1500
large_houses = houses_df[is_large]
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2  import pandas as pd
3
4  houses_df = pd.DataFrame({
5      'size_sqft': [1400, 1850, 900, 2200],
6      'bedrooms': [3, 4, 2, 4],
7  })
8
9  print(houses_df.shape)
10 print(houses_df.dtypes)
11
12 SQFT_TO_SQM = 0.092903
13 sizes_sqm = houses_df['size_sqft'] * SQFT_TO_SQM
14
15 is_large = houses_df['size_sqft'] > 1500     # ← new
16 large_houses = houses_df[is_large]           # ← new
```

As a whole, the file now selects the houses over 1,500 square feet out
of `houses_df` by name and condition — `houses_df['size_sqft'] >
1500` — mirroring exactly what Lesson 2 did on the bare `ndarray`
`houses`, with `'size_sqft'` standing in for the position `0` that
version depended on remembering.

### Mechanical Walkthrough

- **`houses_df['size_sqft']`** — the column-selection syntax explained
  in full in the previous unit and, per the Repetition Rule, restated
  here: returns the `size_sqft` column as a `Series`.
- **`> 1500`** — the comparison operator, first explained on an
  `ndarray` in Lesson 2 and, per the Repetition Rule, restated here:
  applied between a `Series` and a single integer, it compares every
  element independently and returns a new object of the same shape
  holding `True`/`False` — here a boolean `Series`, since Pandas
  defines comparison operators on `Series` the same element-by-element
  way NumPy defines them on `ndarray`.
- **`is_large = ...`** — assignment, binding the name `is_large` to
  that boolean `Series` — the mask itself, not yet applied to
  anything, exactly mirroring Lesson 2's `is_large` variable, only
  holding a `Series` instead of a bare boolean `ndarray`.
- **`houses_df[is_large]`** — the same square-bracket syntax used for
  column selection earlier in this lesson, here given a boolean
  `Series` instead of a string, which changes what it does: rather
  than returning one named column, it returns a new `DataFrame`
  containing only the rows where `is_large` holds `True`, with every
  column intact for each surviving row — proven in the isolated
  example above, where `table[table['a'] > 1]` kept both `a` and `b`
  for the matching rows, not just `a`.
- **`large_houses = ...`** — assignment, binding the name
  `large_houses` to that filtered `DataFrame`.

### CS Lens

This is the same **predicate-based filtering** idea named in Lesson 2
— a condition, evaluated per row, decides membership in a result set —
applied here to a labeled table instead of a bare array. It's worth
naming precisely because this is what makes the idea genuinely
transferable rather than an `ndarray`-specific trick: the same
`condition, then bracket-select-by-condition` shape recurs, unchanged,
across a SQL `WHERE` clause, an `ndarray` boolean mask, and a
`DataFrame` boolean mask — three different tools built on the identical
underlying pattern.

### SE Lens

The alternative not chosen here is filtering by rewriting the
condition against `houses` (the old `ndarray` from Lesson 2, if it had
been kept alongside `houses_df` instead of replaced) — but that would
mean maintaining two representations of the same data in sync, exactly
the misalignment risk named in Lesson 2's own SE Lens, now one level
up: two data structures instead of two separate arrays. Committing
fully to `houses_df` as the one source of truth, and building `is_large`
directly from it, avoids that risk entirely — there is only one object
whose rows could ever get out of sync with themselves, and using its
own column by name to build the mask, rather than a remembered
position from a retired array, is what this whole lesson has been
building toward.

### Commands Needed

None new — run the same way as before.

### Run It

Run for real, this session:

```
>>> import pandas as pd
>>> houses_df = pd.DataFrame({'size_sqft': [1400, 1850, 900, 2200], 'bedrooms': [3, 4, 2, 4]})
>>> is_large = houses_df['size_sqft'] > 1500
>>> is_large
0    False
1     True
2    False
3     True
Name: size_sqft, dtype: bool
>>> houses_df[is_large]
   size_sqft  bedrooms
1       1850         4
3       2200         4
```

This matches Lesson 2's `houses[is_large]` result exactly — rows `1`
and `3`, the same two houses — now returned as a `DataFrame` with real
column names instead of a bare `ndarray`.

### Connection

This unit filtered `houses_df` by a condition on one of its named
columns, producing the same two houses Lesson 2 found by filtering a
bare array — confirming the whole comparison-then-filter pattern
carries over unchanged, because a `DataFrame`'s columns are themselves
built on the same `ndarray` machinery underneath.

---

## Connect the Pieces

Follow the same house from Lesson 2 — size `1850`, `4` bedrooms —
through everything this lesson built, start to finish:

1. It starts as the second entry in each of the two lists inside the
   `dict` handed to `pd.DataFrame(...)`: `1850` in the `size_sqft`
   list, `4` in the `bedrooms` list, both at position `1`. Once built,
   this house is row `1` of `houses_df`, reachable now by column name
   instead of only by remembered position.
2. `houses_df['size_sqft']` reaches this house through its `size_sqft`
   column alone, returning `1850` as part of a `Series` still carrying
   the name `size_sqft` and the row index `1` — unlike Lesson 2's
   `houses[:, 0]`, which returned the same number with no name
   attached at all.
3. `houses_df['size_sqft'] * SQFT_TO_SQM` converts this house's size
   to roughly `171.87` square meters, as one position within a new
   `Series` — the same conversion Lesson 2 performed on `houses[:,
   0]`, producing the same number, now labeled.
4. `houses_df['size_sqft'] > 1500` evaluates this house's size
   specifically: `1850 > 1500` is `True`, placing `True` at position
   `1` of `is_large` — the same result Lesson 2's `houses[:, 0] >
   1500` produced for this same house, at the same position.
5. `houses_df[is_large]` keeps this house's entire row — both
   `size_sqft` and `bedrooms` — in the final `large_houses`
   `DataFrame`, with its column names intact, exactly mirroring
   Lesson 2's `houses[is_large]` keeping `[1850, 4]` as a bare row with
   no names at all.

Every operation in this lesson reproduced a result Lesson 2 already
proved on a bare `ndarray` — the difference, at every single step, was
never the underlying computation, only whether the result remembered
its own name afterward.
