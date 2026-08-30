# Lesson 2: Rows, Columns, and Asking an Array a Question

## What you will build

`datatools.py` currently holds one house feature — size in square feet
— as a one-dimensional array. This lesson adds a second feature,
bedroom count, and reshapes the data into the layout every real machine
learning dataset actually uses: one row per house, one column per
feature. From there, the lesson adds two ways of reaching into that
layout — indexing and slicing to pull out a specific row, column, or
value by position, and boolean masking to pull out rows by asking a
yes/no question about their data instead of by position at all. The
transferable problem this lesson is actually about: a flat list of
numbers is not how real datasets are shaped, and neither position-only
thinking nor a hand-written loop is how real code selects rows out of
one — this lesson replaces both with tools built directly into the
array itself.

## What you need to know first

Lesson 1's `np.array`, `.shape`, `.dtype`, and vectorized arithmetic
with `*` — this lesson builds directly on `datatools.py` as Lesson 1
left it, and reuses the array-construction and inspection ideas from
that lesson on a two-dimensional array instead of a one-dimensional
one.

## Terms used in this lesson

- **dimension (of an array)** — one independent axis along which an
  array's data is arranged; a one-dimensional array has a single row
  of values with no notion of "rows versus columns," while a
  two-dimensional array has both. It exists as a concept because
  `.shape`, already introduced in Lesson 1, reports exactly one number
  per dimension, and reading that tuple correctly depends on knowing
  what a "dimension" actually is.
- **row** — in a two-dimensional array, one complete slice along the
  first dimension — everything at a fixed position along axis `0`. In
  a dataset laid out with one sample per row (the convention this
  lesson adopts), a row is one house's complete data.
- **column** — in a two-dimensional array, one complete slice along
  the second dimension — everything at a fixed position along axis
  `1`. In this lesson's layout, a column is one feature's values
  across every house.
- **index** — an integer (or, for multiple dimensions, a tuple of
  integers) naming one specific position inside an array, starting
  from `0`. It exists because an array needs some way to name "this
  one value, right here" out of everything it holds, and position — a
  count from the start — is the mechanism every array in this
  curriculum uses.
- **slice** — a `start:stop` expression inside square brackets that
  names a *range* of positions instead of a single one, with `start`
  included and `stop` excluded; leaving either side empty means "all
  the way to that end." It exists because indexing alone can only name
  one value at a time, and pulling out "an entire row" or "an entire
  column" needs a way to say "everything along this dimension," which
  a single integer index can't express.
- **boolean array** — an array whose every element is `True` or
  `False` rather than a number, most often produced by comparing an
  existing array to a value. It exists as a distinct, ordinary array
  type — not special syntax — specifically so it can itself be used,
  in a moment, to select which positions of another array to keep.
- **boolean mask** — a boolean array used, by passing it inside square
  brackets, to filter another array of the same shape down to only the
  positions where it holds `True`. It exists because "give me every
  row matching some condition" is a different, more common need than
  "give me the row at position `N`," and expressing it as a
  comparison, rather than a hand-written loop with an `if` inside it,
  keeps the selection itself vectorized — the same idea Lesson 1
  introduced for arithmetic, now applied to selection instead.

## Objects and methods used

### `numpy.ndarray` (indexing and slicing syntax)

- **What it is:** the same `ndarray` type from Lesson 1 — this isn't a
  new object, but square-bracket indexing (`arr[i]`, `arr[i, j]`,
  `arr[:, j]`) is new syntax this lesson introduces on it, provided by
  the type's own `__getitem__` machinery rather than a separate,
  named method you call.
- **Implementation:** for a two-dimensional array, `arr[i, j]` returns
  the single element at row `i`, column `j`; `arr[i]` returns the
  entire row at position `i`, itself a one-dimensional array; `arr[:,
  j]` returns the entire column at position `j`.
- **Its use:** it's how this lesson reaches into `houses` (built
  below) to pull out one house's full data, one feature's values
  across every house, or one specific value — without writing a loop
  for any of the three.
- **Type:** special-method-backed syntax (`__getitem__`) on the
  `ndarray` instance — written with square brackets, not a dotted
  method call with parentheses.
- **Responsibility:** given a position or range of positions along
  each dimension, return exactly the data at those positions — as a
  single value when every dimension is given a single index, or as a
  smaller array when any dimension is given a slice.
- **Depends on:** an already-constructed `ndarray` with at least as
  many dimensions as indices provided.
- **Connects to:** called directly on `houses`, built in this lesson's
  first Concept Unit, by every later line in this lesson that reads a
  row, a column, or a single value back out of it.
- **Shape:** part of every `ndarray`'s core public interface — the
  same square-bracket syntax every array in every later lesson will
  be read through.

### Boolean-mask indexing (`arr[boolean_array]`)

- **What it is:** a second, distinct form of the same square-bracket
  syntax as above — instead of an integer or a slice, the thing
  inside the brackets is itself a boolean array of matching shape.
- **Implementation:** `arr[mask]`, where `mask` is a boolean `ndarray`
  the same length as `arr`'s first dimension, returns a new array
  containing only the rows (or elements, for a one-dimensional array)
  where `mask` is `True`, in their original order, with every `False`
  position dropped entirely.
- **Its use:** it's how this lesson selects "every house over 1,500
  square feet" without writing an `if` inside a `for` loop — the
  selection condition is expressed once, as a comparison, and applied
  to the whole array at once.
- **Type:** the same `__getitem__` square-bracket syntax as ordinary
  indexing, distinguished by what's passed inside the brackets — a
  boolean array instead of an integer, a tuple of integers, or a
  slice.
- **Responsibility:** given a boolean array of matching length, build
  and return a new array holding only the positions marked `True` —
  nothing about the *values themselves* being selected on; that logic
  already happened when the mask was built.
- **Depends on:** a boolean `ndarray`, itself typically produced by
  comparing an existing array to a value (`sizes > 1500`), the same
  length as the dimension it's filtering.
- **Connects to:** consumes the boolean array produced by a comparison
  operator (`>`) earlier in the same Concept Unit, and returns a new,
  smaller array that this lesson prints directly.
- **Shape:** part of every `ndarray`'s core public interface,
  alongside ordinary integer and slice indexing — the selection tool
  every later lesson filtering real data (including Pandas'
  `DataFrame`, built on the same underlying idea) will build on.

---

## Concept Unit: Building a Two-Dimensional Array

### The Problem

`sizes_array`, from Lesson 1, holds one number per house: size in
square feet. Real data is rarely one feature — a house also has a
bedroom count, and any dataset with more than one feature needs a
layout where "house 2's data" and "the size column" are both easy to
pull out. A one-dimensional array, with a single `.shape` of `(4,)`,
has no way to represent "four houses, two features each" — it can only
represent a single flat list of four numbers.

Given what `np.array` already does with a flat Python `list` — turning
it into a one-dimensional array with one number per position — what do
you think would happen if you handed it a `list` *of lists* instead,
where each inner list has the same length? Would you expect one
dimension, or two? And if each inner list represented one house's full
data (`[size, bedrooms]`), would you expect the outer list's length to
become the number of rows, or the number of columns?

### Isolated Example

```python
>>> import numpy as np
>>> np.array([[1, 2], [3, 4], [5, 6]])
array([[1, 2],
       [3, 4],
       [5, 6]])
```

Run for real, this session:

```
>>> import numpy as np
>>> grid = np.array([[1, 2], [3, 4], [5, 6]])
>>> grid.shape
(3, 2)
```

This proves `np.array` accepts a `list` of `list`s and builds a
**two-dimensional** array from it — confirmed by `.shape` reporting a
tuple of *two* numbers, `(3, 2)`, instead of the one-number tuple
`(4,)` from Lesson 1. The first number, `3`, is the outer list's
length — how many inner lists there were — and the second number, `2`,
is each inner list's own length; NumPy requires every inner list be
the same length, or this call would fail. This `grid` array is
discarded now; it exists only to prove that a list-of-lists becomes a
2D array with `.shape` reporting `(rows, columns)`, and it will not
appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 1's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** replace (the one-dimensional `sizes_array` from
  Lesson 1 is superseded by a two-dimensional `houses` array covering
  both features; the earlier lines are removed rather than left
  alongside the new ones, so the file has one clear source of truth
  for house data going forward).
- **Location:** replaces lines 3–4 (`sizes_sqft = [...]` and
  `sizes_array = np.array(sizes_sqft)`), added in Lesson 1's first
  Concept Unit.
- **Dependencies:** none beyond NumPy, already imported on line 1.

### The New Code

```python
houses = np.array([
    [1400, 3],
    [1850, 4],
    [900, 2],
    [2200, 4],
])
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2
3  houses = np.array([        # ← new
4      [1400, 3],              # ← new
5      [1850, 4],              # ← new
6      [900, 2],               # ← new
7      [2200, 4],              # ← new
8  ])                          # ← new
9
10 print(houses.shape)
11 print(houses.dtype)
12
13 SQFT_TO_SQM = 0.092903
14 sizes_sqm = houses[:, 0] * SQFT_TO_SQM   # ← updated: was sizes_array * SQFT_TO_SQM
```

Lines 10–11 (the `.shape`/`.dtype` prints from Lesson 1) and line 13
(the conversion constant) are unchanged in substance from Lesson 1's
end state, but line 14 is updated: it previously read
`sizes_array * SQFT_TO_SQM`, and now reads `houses[:, 0] *
SQFT_TO_SQM`, because `sizes_array` no longer exists — `houses[:, 0]`,
covered in the next Concept Unit, is how the size column is reached
inside the new two-dimensional layout. As a whole, the file now stores
both house features together in one array, one row per house, and
still reports that array's shape and dtype, and still converts the
size column to square meters — the same behaviors as Lesson 1's end
state, now built on a layout that can hold more than one feature.

### Mechanical Walkthrough

- **`np.array([...])`** — the same function from Lesson 1, explained
  there in full: it reads a sequence and builds a new `ndarray`. Per
  the Repetition Rule, that explanation applies again here in full,
  unchanged — what's different this time is *what* sequence it's
  handed, covered in the next bullet.
- **`[[1400, 3], [1850, 4], [900, 2], [2200, 4]]`** — a `list` whose
  four elements are themselves `list`s, each holding exactly two
  numbers. This is ordinary, already-known Python `list` syntax
  nested one level deeper than Lesson 1's flat list — each inner
  `[size, bedrooms]` pair represents one house's complete data, and
  the outer list collects four such houses.
- **`houses = ...`** — assignment, already-familiar syntax, binding
  the name `houses` to the two-dimensional `ndarray` `np.array(...)`
  returns.

### CS Lens

Arranging data as "one row per observation, one column per feature" is
sometimes called a **design matrix** in statistics and machine
learning — and it's the exact layout every algorithm in the
Hands-On Machine Learning book expects its input data in, not a
convention invented for this lesson. The same row-per-record,
column-per-attribute idea recurs in a spreadsheet, a SQL table, and a
CSV file — in every case, a single row is one complete, self-contained
record, and a single column is one measurement taken consistently
across every record. Committing to this layout now, on a toy
four-house example, is what makes every real dataset the book
introduces later immediately readable the same way.

### SE Lens

The alternative not chosen here is keeping size and bedroom count as
two separate one-dimensional arrays, the way Lesson 1 kept
`sizes_array` alone. That would still work for this lesson's own
examples — indexing `sizes_array[2]` and `bedrooms_array[2]`
separately would still get you house 2's two values. What it costs at
real scale is that nothing *guarantees* the two arrays stay aligned:
sorting one without sorting the other identically, or accidentally
building one array with a row deleted, silently produces mismatched
data with no error raised anywhere, because nothing about two separate
arrays enforces that position `2` in one still corresponds to position
`2` in the other. A single two-dimensional array with one row per
house makes that misalignment structurally impossible — there is only
one array to keep in order, not several that have to be kept in sync
by hand.

### Commands Needed

None new — run `datatools.py` the same way as in Lesson 1
(`python3 datatools.py`).

### Run It

Run for real, this session, as the current `datatools.py`:

```
$ python3 datatools.py
(4, 2)
int64
```

`houses.shape` reports `(4, 2)` — four rows, two columns — confirming
the list-of-lists became a genuinely two-dimensional array, matching
the isolated `grid` example above. `houses.dtype` reports `int64`,
because every value in every inner list — sizes and bedroom counts
alike — is a whole number.

### Connection

This unit replaced Lesson 1's single-feature array with a
two-dimensional one holding both features, one row per house — the
next unit reaches into specific rows, columns, and values of that new
layout by position.

---

## Concept Unit: Indexing and Slicing a Two-Dimensional Array

### The Problem

`houses` now holds four rows and two columns, but nothing has actually
pulled a specific piece of it back out yet. Three different questions
need three different answers: "what is house 2's complete data?"
("row 2"), "what are every house's sizes, ignoring bedrooms?" ("column
0"), and "what is house 1's bedroom count specifically?" (one single
value, at row 1, column 1). A one-dimensional array only ever needed a
single index; a two-dimensional array needs a way to say "this row,"
"this column," or "this exact cell," and those are three genuinely
different requests.

Before reading on: with a one-dimensional array, `arr[2]` already gets
you a single value, by position. If `houses` now has *two* dimensions
— rows and columns — what would you guess `houses[2]` alone, with only
one index, returns: a single number, or something bigger, like a whole
row? And if you wanted *every* row's value in just one column, with
none of the rows singled out, what symbol from ordinary Python
slicing — the kind that works on a `list`, like `some_list[1:3]` —
might make sense as a stand-in for "give me all of them"?

### Isolated Example

```python
>>> import numpy as np
>>> grid = np.array([[1, 2], [3, 4], [5, 6]])
>>> grid[1]
array([3, 4])
>>> grid[1, 0]
3
>>> grid[:, 1]
array([2, 4, 6])
```

Run for real, this session:

```
>>> import numpy as np
>>> grid = np.array([[1, 2], [3, 4], [5, 6]])
>>> grid[1]
array([3, 4])
>>> grid[1, 0]
3
>>> grid[:, 1]
array([2, 4, 6])
```

This proves three distinct things at once, exactly matching the three
questions posed above. `grid[1]`, a single index, returns the entire
row at position `1` — not one value, but a whole one-dimensional array.
`grid[1, 0]`, two indices separated by a comma, returns the single
value at row `1`, column `0`. `grid[:, 1]`, a bare colon in the row
position, means "every row" — the same slicing syntax Python's own
`list` already uses for "from here to there," with both sides left
empty to mean "the whole range" — paired with `1` in the column
position to mean "only column `1`," returning every row's value in
that one column as a new one-dimensional array. This `grid` example is
discarded now; it exists only to isolate the three indexing shapes,
and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `datatools.py` — modified.
- **Change type:** replace (the previous `sizes_sqm = houses[:, 0] *
  SQFT_TO_SQM` line, written provisionally in the previous unit before
  this indexing syntax had been explained, is kept — but this unit's
  New Code is what actually teaches what `houses[:, 0]` on it means).
  This unit also adds one genuinely new line.
- **Location:** the new line is appended directly after the existing
  `sizes_sqm = houses[:, 0] * SQFT_TO_SQM` line.
- **Dependencies:** the `houses` array from the previous unit.

### The New Code

```python
first_house = houses[0]
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2
3  houses = np.array([
4      [1400, 3],
5      [1850, 4],
6      [900, 2],
7      [2200, 4],
8  ])
9
10 print(houses.shape)
11 print(houses.dtype)
12
13 SQFT_TO_SQM = 0.092903
14 sizes_sqm = houses[:, 0] * SQFT_TO_SQM
15 first_house = houses[0]         # ← new
```

As a whole, the file now does two things beyond Lesson 1's end state:
line 14 pulls out the entire size column (every row, column `0`) and
converts it to square meters in one vectorized expression, and line 15
pulls out house `0`'s complete row — both a size and a bedroom count
together — using single-index row access.

### Mechanical Walkthrough

- **`houses[:, 0]`** — the square-bracket indexing syntax explained in
  full under Objects and methods, above, used here with a bare `:` in
  the row position (meaning "every row," the slice explained in Terms,
  above) and `0` in the column position (meaning "only column `0`,"
  the size column, since size was written first in each inner list
  when `houses` was built). The result is a new one-dimensional array
  holding every house's size and none of the bedroom counts — this is
  the same expression from the previous unit's Project Change, now
  fully explained rather than used provisionally.
- **`* SQFT_TO_SQM`** — the vectorized multiplication operator from
  Lesson 1, explained there in full and, per the Repetition Rule,
  restated here: applied between the one-dimensional array
  `houses[:, 0]` and the single float `SQFT_TO_SQM`, it multiplies
  every element of that column by the constant independently and
  returns a new array of the same shape, exactly as it did on
  `sizes_array` in Lesson 1 — only the source of the array being
  multiplied has changed, from a standalone 1D array to a column
  sliced out of a 2D one.
- **`houses[0]`** — the square-bracket indexing syntax again, this
  time with a single integer and no comma. On a two-dimensional array,
  a single index selects along the first dimension only — the row
  dimension — and returns everything in that row as a new
  one-dimensional array; this is the `grid[1]` shape from the isolated
  example above, applied here to row `0` of `houses` instead of row
  `1` of `grid`.
- **`first_house = ...`** — assignment, already-familiar syntax,
  binding the name `first_house` to the one-dimensional, two-element
  array `houses[0]` returns.

### CS Lens

Selecting data by position along an axis — a row, a column, or a
specific cell — is the array-level version of the same idea
underlying a spreadsheet cell reference like `B2`, a matrix entry
`A[i][j]` in linear algebra notation, and pixel access into a 2D image
buffer by `(x, y)` coordinate. In every one of these, "position" is a
pair (or more) of independent coordinates, and the notation for
picking one out — a comma-separated pair of indices — is the same
underlying idea NumPy's `arr[row, col]` borrows directly.

### SE Lens

The alternative not chosen here is writing `houses[0][0]` and
`houses[0][1]` — indexing the outer list, getting a row back, then
indexing *that* — the way you'd have to with a plain Python
list-of-lists, since a `list` has no native notion of "index both
dimensions in one step." NumPy's `arr[row, col]` syntax does both in a
single operation instead of two chained ones. The practical difference
shows up with slices: `houses[:, 0]` has no real list-of-lists
equivalent without writing a loop or a list comprehension by hand
(`[row[0] for row in houses]`) — a two-index array access expresses
directly what a nested list can only express through iteration. The
real cost being accepted is that this two-index syntax only exists on
NumPy's `ndarray`; the same bracket-comma notation raises a `TypeError`
on Python's own `list`, so this convenience is specific to committing
to NumPy's array type in the first place — a tradeoff already made
back in Lesson 1.

### Commands Needed

None new — run the same way as before.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])
>>> houses[:, 0]
array([1400, 1850,  900, 2200])
>>> houses[0]
array([1400,    3])
```

`houses[:, 0]` returns exactly the four sizes, in original row order,
with the bedroom counts entirely excluded — confirming column
selection works as traced in the isolated example. `houses[0]`
returns `array([1400, 3])` — house `0`'s size and bedroom count
together, confirming row selection returns a whole row, not a single
value.

### Connection

This unit reached into `houses` by position — a whole column, a whole
row — using indices and slices decided in advance by the code itself.
The next unit selects rows a different way: not by a position you
choose, but by a condition the data itself has to satisfy.

---

## Concept Unit: Boolean Masking

### The Problem

Pulling out "house at row `0`" only works if you already know which
row you want. A much more common real question is condition-based, not
position-based: "which houses are bigger than 1,500 square feet?" —
and the answer might be any subset of rows, decided by the data itself,
not chosen in advance. Answering that with what this lesson has built
so far would mean writing a `for` loop over every row, checking an
`if`, and collecting matches by hand — exactly the pattern Lesson 1
replaced for arithmetic, now showing up again for selection.

Given that `houses[:, 0]` already gets you every house's size as one
array, and given that ordinary Python already lets you write
`some_number > 1500`, what do you think happens if you compare an
*entire array* to `1500` using `>`, the way you'd compare one number?
Would you expect a single `True`/`False` answer for the whole array —
or one answer per element? And once you had an answer *per element*,
what shape do you think that result itself would be?

### Isolated Example

```python
>>> import numpy as np
>>> values = np.array([10, 25, 5, 40])
>>> values > 15
array([False,  True, False,  True])
```

Run for real, this session:

```
>>> import numpy as np
>>> values = np.array([10, 25, 5, 40])
>>> values > 15
array([False,  True, False,  True])
>>> (values > 15).dtype
dtype('bool')
```

This proves `>`, an ordinary comparison operator, behaves the same
vectorized way `*` did in Lesson 1: applied between an array and a
single number, it compares every element independently and returns a
new array of the same shape — but here holding `True`/`False` instead
of numbers. This is a **boolean array**, defined under Terms, above:
its `.dtype` reports `bool`, distinct from the `int64`/`float64` seen
so far. Contrast this with a plain Python `list`, run for real, this
session:

```
>>> [10, 25, 5, 40] > 15
Traceback (most recent call last):
  ...
TypeError: '>' not supported between instances of 'list' and 'int'
```

A `list` has no notion of "compare every element" — `>` between a
`list` and a number is simply undefined and raises `TypeError`
immediately, which is a second confirmation that this element-by-element
comparison behavior belongs to `ndarray` specifically, not to
sequences in general. This `values` example is discarded now; it
exists only to isolate what a vectorized comparison produces, and it
will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `first_house = houses[0]`,
  added in the previous Concept Unit.
- **Dependencies:** the `houses` array, and `houses[:, 0]` (the size
  column), both already established.

### The New Code

```python
is_large = houses[:, 0] > 1500
large_houses = houses[is_large]
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2
3  houses = np.array([
4      [1400, 3],
5      [1850, 4],
6      [900, 2],
7      [2200, 4],
8  ])
9
10 print(houses.shape)
11 print(houses.dtype)
12
13 SQFT_TO_SQM = 0.092903
14 sizes_sqm = houses[:, 0] * SQFT_TO_SQM
15 first_house = houses[0]
16
17 is_large = houses[:, 0] > 1500      # ← new
18 large_houses = houses[is_large]     # ← new
```

As a whole, the file now does one thing more than before: after
building `houses` and locating individual pieces of it by position, it
also selects out only the houses over 1,500 square feet — as many rows
as satisfy that condition, decided by the data, not chosen by an index
written in advance.

### Mechanical Walkthrough

- **`houses[:, 0]`** — the same slicing expression explained in full
  in the previous Concept Unit and, per the Repetition Rule, restated
  here: every row, column `0`, returning the full size column as a
  one-dimensional array.
- **`> 1500`** — the comparison operator, explained above under
  Isolated Example: applied between the one-dimensional size array and
  the single integer `1500`, it compares every element independently
  and returns a new boolean array of the same shape — `True` at every
  position where that house's size exceeds `1500`, `False` everywhere
  else.
- **`is_large = ...`** — assignment, already-familiar syntax, binding
  the name `is_large` to that boolean array — the mask itself, defined
  under Terms, above, not yet applied to anything.
- **`houses[is_large]`** — the boolean-mask indexing syntax explained
  in full under Objects and methods, above: `is_large` is a boolean
  array the same length as `houses`'s first dimension (four rows, four
  boolean values), so `houses[is_large]` returns a new array
  containing only the rows where `is_large` holds `True` — the rows
  for houses over 1,500 square feet — with the two rows where it holds
  `False` dropped entirely, and the surviving rows kept in their
  original order.
- **`large_houses = ...`** — assignment, binding the name
  `large_houses` to that filtered, smaller array — a new `ndarray`,
  not a view back into a subset of `houses`'s original rows sharing
  its memory.

### Execution Trace

There's no explicit loop in this unit's own code, but it's worth
tracing what the comparison `houses[:, 0] > 1500` decides for each
element, since that decision is what the mask actually encodes:

1. `houses[:, 0][0]` is `1400` — `1400 > 1500` is `False` — house `0`
   is not marked for selection.
2. `houses[:, 0][1]` is `1850` — `1850 > 1500` is `True` — house `1`
   is marked for selection.
3. `houses[:, 0][2]` is `900` — `900 > 1500` is `False` — house `2` is
   not marked for selection.
4. `houses[:, 0][3]` is `2200` — `2200 > 1500` is `True` — house `3`
   is marked for selection.

`is_large` ends up holding `[False, True, False, True]`, in that
order; `houses[is_large]` then keeps only rows `1` and `3` — houses
`[1850, 4]` and `[2200, 4]` — because those are the only two positions
where the trace above produced `True`.

### CS Lens

Selecting data by a condition rather than a position is often called
**predicate-based filtering** — a *predicate* being any expression
that evaluates to `True` or `False` per item, used to decide
membership in a result set. The same idea recurs, under different
names, in a SQL `WHERE` clause (`WHERE size > 1500`), Python's own
list comprehensions with an `if` clause (`[h for h in houses if
h[0] > 1500]`), and a spreadsheet's `FILTER` function — in every case,
the selection logic is written once, as a condition, and applied
uniformly, rather than encoded as a sequence of hand-picked positions.

### SE Lens

The alternative not chosen here is a `for` loop with an `if` inside
it — visiting every row of `houses`, checking `row[0] > 1500`, and
appending matching rows to a new list by hand. That loop would produce
the same result. What boolean masking buys over it is the same
vectorization payoff from Lesson 1 — the per-element check runs inside
NumPy's own compiled code rather than the Python interpreter — plus a
readability benefit specific to filtering: `houses[houses[:, 0] >
1500]` states the selection condition once, inline, rather than
spreading "what am I filtering on" and "how do I collect matches"
across several lines of loop machinery. The cost being accepted is
that the mask itself is a separate, real array — `is_large`, here —
which means the memory to hold one `True`/`False` per row exists,
however briefly, even though the reader may only care about the
`large_houses` it produces; on a dataset with billions of rows, that
intermediate array is not free.

### Commands Needed

None new — run the same way as before.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])
>>> is_large = houses[:, 0] > 1500
>>> is_large
array([False,  True, False,  True])
>>> houses[is_large]
array([[1850,    4],
       [2200,    4]])
```

This matches the Execution Trace exactly: `is_large` holds
`[False, True, False, True]`, and `houses[is_large]` returns only
rows `1` and `3` — the two houses over 1,500 square feet — with their
full two-feature data intact.

### Connection

This unit selected rows of `houses` by a condition on their data,
rather than by a position chosen in advance — the same underlying
square-bracket syntax from the previous unit, now driven by a boolean
array instead of an integer or a slice.

---

## Connect the Pieces

Follow one house, `[1850, 4]` — size 1850, 4 bedrooms — through
everything this lesson built, start to finish:

1. It starts as the second inner list inside the nested list handed to
   `np.array(...)` — `[1850, 4]`, one element among four in the outer
   list. Once built, it becomes row `1` of the two-dimensional array
   `houses`, with `.shape` equal to `(4, 2)`, confirmed by printing it.
2. `houses[:, 0]` reaches this row only through its first value —
   `1850`, the size — extracting it alongside every other house's size
   into a new one-dimensional array, with the bedroom count `4`
   excluded from that particular extraction entirely.
3. `houses[0]`, in the second Concept Unit, does *not* return this
   house — that expression asks for row `0`, and this house is row
   `1` — a deliberate contrast: `houses[1]` would return
   `array([1850, 4])`, this house's complete data, exactly the shape
   `houses[0]` returned for the *first* house.
4. `houses[:, 0] > 1500`, in the third unit, evaluates this house's
   size on its own: `1850 > 1500` is `True`, so position `1` of
   `is_large` holds `True`.
5. `houses[is_large]` keeps this house's entire row — both size and
   bedroom count together — because position `1` of the mask that
   selected it was `True`, placing `[1850, 4]` intact into the
   resulting `large_houses` array, alongside house `3`, `[2200, 4]`,
   selected the same way.

The same array, `houses`, was read three structurally different ways
in this lesson — by row, by column, and by condition — and this one
house was reachable, correctly, through every one of them.
