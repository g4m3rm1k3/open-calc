# Lesson 7: Real Data Comes From a File, Not a Literal

## What you will build

`datatools.py` gets its house data from a real file, `houses.csv`, for
the first time — eight houses, each with size, bedroom count, and an
actual sale price, instead of the four hand-typed rows every earlier
lesson built directly inside the script. Getting there introduces
`pandas.read_csv`, which turns a plain text file into a `DataFrame` in
one call; `.head()`, which previews a `DataFrame` without printing
every row; and `.describe()`, which computes Lesson 6's entire toolkit
— mean, standard deviation, and more — for every numeric column at
once. The transferable problem this lesson is actually about: every
lesson so far has worked with data small enough to read in full at a
glance and type directly into the script; real data, including the
housing dataset the Hands-On Machine Learning book itself works with,
arrives as a file with far more rows than anyone would type by hand or
read in full — and the first skill real data work requires is getting
it off disk and quickly sanity-checking it before doing anything else.

## What you need to know first

Lesson 3's `pd.DataFrame`, column selection with `df['name']`, and
`.shape`; Lesson 6's `.mean()` and `.std()` — this lesson's
`.describe()` computes the same two statistics Lesson 6 computed by
hand, across every column of a `DataFrame` read from a real file
instead of a hand-built `dict`.

## Terms used in this lesson

- **CSV (comma-separated values)** — a plain text file format for
  tabular data: one line per row, with each row's values separated by
  commas, and (conventionally, though not required by the format
  itself) a first line naming each column. It exists as one of the
  most widely supported ways to move tabular data between programs,
  because it needs no special software to read or write — any text
  editor can open one — and nearly every data tool, including Pandas,
  can read and write it directly.
- **file path** — a string naming where a file lives on disk, either
  relative to the current working directory (`'houses.csv'`, meaning
  "look for this file in the folder the script is being run from") or
  as a full, unambiguous location starting from the filesystem's root.
  It exists because a running program has no inherent notion of "the"
  file you mean by a name alone; a path is what resolves that name to
  one specific location.

## Objects and methods used

### `pandas.read_csv`

- **What it is:** a function in the `pandas` package that reads a CSV
  file from disk and returns its contents as a `DataFrame`.
- **Implementation:** `pandas.read_csv(filepath_or_buffer) ->
  pandas.DataFrame`. By default, it treats the file's first line as
  column headers, infers each column's data type from its values (the
  same type-inference `np.array` already performs, applied here per
  column instead of across a whole array), and assigns a default
  `0, 1, 2, ...` row index, exactly as `pd.DataFrame` did in Lesson 3.
- **Its use:** it's how this lesson gets `houses.csv`'s contents into
  a `DataFrame` without manually reading the file's text and parsing
  its commas by hand.
- **Type:** a free function in the `pandas` package, called through
  the `pd` alias, not a method on an object this lesson already holds.
- **Responsibility:** open the file at the given path, read its text,
  interpret its first line as column names and every following line as
  one row of data split on commas, infer a consistent type per column,
  and assemble the whole thing into one `DataFrame` — it is not
  responsible for validating that the data itself makes sense (a
  negative house size, for instance, would be read in without
  complaint), only for parsing the file's structure correctly.
- **Depends on:** a real file that exists at the given path, readable
  by the program, actually formatted as valid CSV text.
- **Connects to:** called once, at the start of this lesson's Concept
  Unit sequence, with `'houses.csv'` as its argument; its returned
  `DataFrame` is what `.head()` and `.describe()`, called later in
  this lesson, both operate on.
- **Shape:** one of Pandas' most commonly used functions — the actual
  first step of nearly every real data-analysis script this curriculum
  will build from here forward, including the book's own housing
  dataset.

### `DataFrame.head`

- **What it is:** a method on every `DataFrame` instance that returns
  a new, smaller `DataFrame` containing only its first several rows.
- **Implementation:** `DataFrame.head(n=5) -> pandas.DataFrame`. `n`,
  the number of rows to return, defaults to `5` when left out.
- **Its use:** it's how this lesson previews `houses_df` without
  printing all eight of its rows — a habit that matters far more once
  a real dataset has thousands or millions of rows than it does for
  this lesson's own eight-row file.
- **Type:** an instance method, called with parentheses on an
  already-existing `DataFrame`.
- **Responsibility:** return the first `n` rows of the `DataFrame`
  it's called on, in their original order, with every column intact —
  it does not modify the original `DataFrame` in any way; the full,
  unshortened `houses_df` still exists afterward, untouched.
- **Depends on:** an already-constructed `DataFrame` to read rows
  from.
- **Connects to:** called directly on the `DataFrame` `pd.read_csv`
  returns, and its own return value — a smaller `DataFrame` — is what
  `print` displays in this lesson's own code.
- **Shape:** part of `DataFrame`'s core public interface — the
  standard first call after loading any new, unfamiliar dataset, in
  this curriculum and in real Pandas code generally.

### `DataFrame.describe`

- **What it is:** a method on every `DataFrame` instance that computes
  a standard set of summary statistics for every numeric column at
  once.
- **Implementation:** `DataFrame.describe() -> pandas.DataFrame`. The
  returned `DataFrame` has one row per statistic (`count`, `mean`,
  `std`, `min`, `25%`, `50%`, `75%`, `max`) and one column per numeric
  column of the original `DataFrame`.
- **Its use:** it's how this lesson gets Lesson 6's entire toolkit —
  mean and standard deviation, plus several statistics not yet
  covered — for `size_sqft`, `bedrooms`, and `price` all at once,
  instead of calling `.mean()` and `.std()` separately on each column
  by hand, the way Lesson 6 did for a single column.
- **Type:** an instance method, called with parentheses, the same
  category as `.head()` above.
- **Responsibility:** compute a fixed, standard set of summary
  statistics for every numeric column of the `DataFrame` it's called
  on, and assemble those results into one new `DataFrame` for easy
  side-by-side comparison — it silently skips any non-numeric column
  (this lesson's `houses.csv` has none, so that behavior isn't
  directly observed here, but it's part of the method's real
  contract).
- **Depends on:** an already-constructed `DataFrame` with at least one
  numeric column.
- **Connects to:** called directly on `houses_df`, the same
  `DataFrame` `.head()` was called on earlier in this lesson; its own
  `DataFrame` return value is what `print` displays.
- **Shape:** part of `DataFrame`'s core public interface — the
  standard second call, right after `.head()`, when getting a first
  real look at any new dataset.

---

## Concept Unit: Reading a CSV File

### The Problem

Every house in this curriculum's project so far — `sizes_sqft` in
Lesson 1, `houses` in Lessons 2 and 4, `houses_df` in Lesson 3 — was
typed directly into `datatools.py` as a Python literal. That works for
four made-up rows. It stops being remotely realistic the moment real
data enters the picture: a real housing dataset, like the one the
Hands-On Machine Learning book itself uses, has thousands of rows,
arrives as a downloaded file, and was never meant to be retyped by
hand into source code.

Given `houses.csv`, a real file sitting next to `datatools.py`, holding
eight rows of `size_sqft`, `bedrooms`, and `price` data with a header
line naming those three columns — and given that `pd.DataFrame` in
Lesson 3 already builds a `DataFrame` from data that's already inside
Python, as a `dict` — what do you think a function meant to build a
`DataFrame` from a file *on disk* would need as input, instead of a
`dict`? And what do you expect happens to the file's own first line —
`size_sqft,bedrooms,price` — once the resulting `DataFrame` exists; do
you think it stays as one of the rows, or does something else happen
to it?

### Isolated Example

`sample.csv`, a small file written for this example only:

```
a,b
1,10
2,20
3,30
```

```python
>>> import pandas as pd
>>> pd.read_csv('sample.csv')
   a   b
0  1  10
1  2  20
2  3  30
```

Run for real, this session, with `sample.csv` written to disk exactly
as shown above:

```
>>> import pandas as pd
>>> table = pd.read_csv('sample.csv')
>>> table
   a   b
0  1  10
1  2  20
2  3  30
>>> type(table)
<class 'pandas.core.frame.DataFrame'>
>>> table.shape
(3, 2)
```

This proves `pd.read_csv` reads the file's first line as column
headers — `a` and `b` become real column names, exactly as if they'd
been written as `dict` keys in Lesson 3's `pd.DataFrame({...})` — and
every following line becomes one data row, with `table.shape` reporting
`(3, 2)`, three rows and two columns, confirming the header line itself
is not counted as a data row. This `sample.csv` file and the `table`
it produced are discarded now; they exist only to prove `read_csv`'s
header-then-rows behavior, and neither will appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 6's end state.
- **Files affected:** `houses.csv` — created, as real project data,
  alongside `datatools.py`; `datatools.py` — modified.
- **Change type:** replace (the hand-built `dict` literal
  `houses_df = pd.DataFrame({...})`, added in Lesson 3's first Concept
  Unit, is superseded by data read from the new file; the earlier
  lines are removed rather than left alongside the new one, so the
  file has one clear source of truth for `houses_df` going forward).
- **Location:** replaces the `houses_df = pd.DataFrame({...})` block,
  originally added in Lesson 3.
- **Dependencies:** `houses.csv` must exist at the path given, in the
  same directory the script is run from.

### The New Code

`houses.csv`, the new data file this unit adds to the project:

```
size_sqft,bedrooms,price
1400,3,192000
1850,4,254000
900,2,124000
2200,4,296000
1600,3,215000
1200,2,158000
2450,5,328000
1750,3,241000
```

```python
houses_df = pd.read_csv('houses.csv')
```

### The Updated Project

`datatools.py`'s data-loading section now reads, in full:

```
1  houses_df = pd.read_csv('houses.csv')   # ← replaces the pd.DataFrame({...}) block from Lesson 3
```

As a whole, the file now loads `houses_df` from a real file on disk
instead of a literal written directly into the script — the same
variable name, `houses_df`, and the same shape of object (a Pandas
`DataFrame`), now backed by eight real rows instead of four hand-typed
ones. Every later line in `datatools.py` that already used
`houses_df` — Lesson 3's column selection and filtering, Lesson 4's
vector math built on a separately reconstructed `houses` array — is
unaffected by this change in source, since both are still ordinary
`DataFrame`/`ndarray` operations that don't care whether the data
originally came from a `dict` or a file.

### Mechanical Walkthrough

- **`pd.read_csv('houses.csv')`** — the function explained in full
  under Objects and methods, above: given the string `'houses.csv'` —
  a relative file path, defined under Terms, above, naming a file in
  the same directory the script runs from — it opens that file, reads
  its header line (`size_sqft,bedrooms,price`) as column names, reads
  every following line as one row, infers each column's type (all
  three, here, as `int64`, since every value in the file is a whole
  number), and returns the assembled `DataFrame`.
- **`houses_df = ...`** — assignment, already-familiar syntax, binding
  the name `houses_df` to that `DataFrame` — the same variable name
  Lesson 3 used, now pointing at data loaded from a file instead of
  built from a `dict` literal.

### CS Lens

Reading structured data from an external file into an in-memory
representation your program can actually work with is the concrete
form of **data ingestion** — the step, in any real data pipeline,
where information crosses the boundary from "stored somewhere outside
the running program" to "available as objects the program can
manipulate." The same underlying step recurs whenever a program loads
a JSON configuration file into a dictionary, a database driver reading
query results into result-set objects, or a web browser parsing an
HTML file into the DOM tree it actually renders — in every case, raw
bytes on disk (or over a network) become structured, navigable data
only after some ingestion step translates one into the other.

### SE Lens

The alternative not chosen here is exactly what every earlier lesson
did: keep house data as a literal, typed directly into the script.
That approach has a real advantage this lesson's approach gives up —
the data and the code that uses it live in one file, so nothing extra
needs to exist alongside `datatools.py` for it to run. What it costs
is everything real data work needs: the data can't grow past what's
comfortable to type by hand, can't be updated without editing and
re-reading the source code itself, and can't be shared or swapped for
a different dataset without changing the program's logic alongside its
data. Separating data into its own file, loaded by a single
`read_csv` call, means the *data* can change — a longer `houses.csv`,
or an entirely different one — without a single line of
`datatools.py`'s own logic needing to change at all, which is exactly
the situation every later lesson working with the book's own, far
larger housing dataset will be in.

### Commands Needed

None new — `pandas` is already installed from Lesson 3. If
`houses.csv` doesn't yet exist in the same directory as `datatools.py`,
create it with the exact contents shown in this unit's New Code,
above, before running the script.

### Run It

Already run and shown above, under Isolated Example — `pd.read_csv('sample.csv')`
really does produce a 3-row, 2-column `DataFrame` with `a` and `b` as
real column names. Run for real, this session, on the actual project
file:

```
>>> import pandas as pd
>>> houses_df = pd.read_csv('houses.csv')
>>> houses_df.shape
(8, 3)
```

`(8, 3)` — eight rows, three columns — confirming all eight data lines
of `houses.csv` were read, with the header line correctly excluded
from the row count.

### Connection

This unit replaced a hand-typed `dict` literal with data read from a
real file — the next unit previews that file's contents without
printing every one of its (now eight, and in a real dataset, possibly
many more) rows at once.

---

## Concept Unit: Previewing with `.head()`

### The Problem

`houses_df` now holds eight rows read from a file this lesson's own
code never explicitly listed out — unlike every earlier lesson, where
every value was visible directly in the script that built it, nothing
in `datatools.py` itself shows what's actually inside `houses.csv`
anymore. Printing the whole `DataFrame` works for eight rows; it
becomes unreadable, and slow, the moment a real file has thousands or
millions of rows instead — a quick way to sanity-check "did this load
correctly, and what does it roughly look like" is needed that doesn't
depend on the file staying small forever.

Given that `print(houses_df)` would print every one of its rows — fine
for eight, unreasonable for a much larger real file — what would you
guess a method meant to "preview" a `DataFrame` needs as an argument:
nothing at all, since "preview" implies a small, fixed number chosen
for you? Or a number you supply yourself, to control exactly how much
you see?

### Isolated Example

```python
>>> import pandas as pd
>>> table = pd.read_csv('sample.csv')
>>> table.head()
   a   b
0  1  10
1  2  20
2  3  30
>>> table.head(2)
   a   b
0  1  10
1  2  20
```

Run for real, this session, reusing the `sample.csv` file from the
previous unit:

```
>>> import pandas as pd
>>> table = pd.read_csv('sample.csv')
>>> table.head()
   a   b
0  1  10
1  2  20
2  3  30
>>> table.head(2)
   a   b
0  1  10
1  2  20
```

This proves `.head()` called with no argument at all still returns
something — `sample.csv` only has three rows, so the default preview
size (`5`, per its signature) simply returns every row that exists,
capped at whichever is smaller. Passed an explicit `2`, it returns
only the first two rows, confirming the method genuinely limits its
output rather than always showing everything regardless of the
argument. This `sample.csv` file and `table` are discarded now, for
the second and final time in this lesson; they will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `houses_df =
  pd.read_csv('houses.csv')`, added in the previous unit.
- **Dependencies:** `houses_df`, built in the previous unit.

### The New Code

```python
print(houses_df.head())
```

### The Updated Project

`datatools.py`'s data-loading section now reads, in full:

```
1  houses_df = pd.read_csv('houses.csv')
2  print(houses_df.head())   # ← new
```

As a whole, this block now loads `houses_df` from `houses.csv` and
immediately prints a preview of its first several rows — a sanity
check that the file loaded the way it was expected to, before any
further computation runs on it.

### Mechanical Walkthrough

- **`houses_df.head()`** — the method explained in full under Objects
  and methods, above, called with no argument: since `houses.csv` has
  eight rows, more than the default of `5`, this call returns a new,
  smaller `DataFrame` holding only the first five — houses at index
  `0` through `4` — with all three columns intact for each.
- **`print(...)`** — the already-familiar built-in function,
  restated per the Repetition Rule: converts its argument to text and
  writes it to the terminal, the same role it played in every earlier
  lesson, here displaying the smaller `DataFrame` `.head()` returned.

### CS Lens

Inspecting a small sample of a larger dataset before working with the
whole thing is a concrete instance of **sanity checking** — verifying
a basic assumption is actually true before building further logic on
top of it, cheaply, rather than discovering a problem only after
expensive computation has already run on bad or misread data. The
same instinct recurs as a database query's `LIMIT 5` clause, a Unix
`head` command previewing the first lines of any text file (the direct
inspiration for this method's own name), and any debugger's habit of
inspecting a variable's value before stepping further into a program —
in every case, look at a small, cheap piece first, before trusting or
building on the whole.

### SE Lens

The alternative not chosen here is printing `houses_df` directly, with
no `.head()` at all. For this lesson's own eight-row file, that
alternative isn't even wrong — both would fit comfortably on one
screen. The real cost shows up the moment `houses.csv` is swapped for
a dataset with a hundred thousand rows: `print(houses_df)` on a
`DataFrame` that large either floods the terminal with far more output
than anyone would read, or (depending on Pandas' own display
settings) gets silently truncated in the middle in a way that can hide
exactly the row you needed to see. `.head()` costs nothing when the
data is small and scales correctly when it isn't — which is why it's
the standard first call after loading any dataset whose size isn't
already known to be small, rather than a habit worth skipping for
"small enough" data.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import pandas as pd
>>> houses_df = pd.read_csv('houses.csv')
>>> print(houses_df.head())
   size_sqft  bedrooms   price
0       1400         3  192000
1       1850         4  254000
2        900         2  124000
3       2200         4  296000
4       1600         3  215000
```

Five rows shown — houses at index `0` through `4` — with `houses.csv`'s
three real column names, `size_sqft`, `bedrooms`, and `price`, and the
three remaining rows (indices `5`, `6`, `7`) correctly left out of this
preview.

### Connection

This unit confirmed `houses_df` loaded correctly by previewing a
handful of its rows. The next unit summarizes every numeric column at
once — the same statistics Lesson 6 computed by hand for a single
column, now automated across all three.

---

## Concept Unit: Summarizing with `.describe()`

### The Problem

`.head()` confirms the data loaded correctly and gives a rough feel
for what it looks like, but it says nothing quantitative about the
dataset as a whole — Lesson 6 computed a mean and a standard deviation
for the size column by hand, one column at a time, with two separate
method calls. Doing that for all three columns of `houses_df` —
`size_sqft`, `bedrooms`, and `price` — by hand would mean writing six
separate `.mean()`/`.std()` calls and organizing their results
yourself.

Given that Lesson 6's `.mean()` and `.std()` each operate on one
column at a time, and given that `houses_df` now has three numeric
columns at once, what would you guess a method meant to summarize "the
whole `DataFrame`, statistically, in one call" would need to do
differently from calling `.mean()` and `.std()` separately on each
column yourself? Would you expect it to return one number, one number
per column, or something with an even richer shape than that?

### Isolated Example

```python
>>> import pandas as pd
>>> table = pd.DataFrame({'x': [1, 2, 3, 4]})
>>> table.describe()
              x
count  4.000000
mean   2.500000
std    1.290994
min    1.000000
25%    1.750000
50%    2.500000
75%    3.250000
max    4.000000
```

Run for real, this session:

```
>>> import pandas as pd
>>> table = pd.DataFrame({'x': [1, 2, 3, 4]})
>>> table.describe()
              x
count  4.000000
mean   2.500000
std    1.290994
min    1.000000
25%    1.750000
50%    2.500000
75%    3.250000
max    4.000000
>>> type(table.describe())
<class 'pandas.core.frame.DataFrame'>
```

This proves `.describe()` returns a new `DataFrame` — not a bare
number, and not a `Series` — with one row per statistic (`count`
through `max`) and one column per numeric column of the original
table (here, just `x`). The `mean` row reads `2.500000`, matching
`(1 + 2 + 3 + 4) / 4`, exactly the computation `.mean()` performed
directly in Lesson 6; the `std` row reads `1.290994`, the same
underlying computation `.std()` performed there, now embedded as one
row among several rather than called on its own. This `table` example
is discarded now; it exists only to prove `.describe()`'s shape and to
confirm its `mean`/`std` rows match the individually-called methods
from Lesson 6, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `print(houses_df.head())`,
  added in the previous unit.
- **Dependencies:** `houses_df`, built two units ago in this lesson.

### The New Code

```python
print(houses_df.describe())
```

### The Updated Project

`datatools.py`'s data-loading section now reads, in full — its final
state for this lesson:

```
1  houses_df = pd.read_csv('houses.csv')
2  print(houses_df.head())
3  print(houses_df.describe())   # ← new
```

As a whole, this block now loads real data from a file, previews a
handful of its rows, and summarizes every numeric column statistically
— three progressively deeper looks at the same dataset, each one
building on confirming the previous step worked.

### Mechanical Walkthrough

- **`houses_df.describe()`** — the method explained in full under
  Objects and methods, above, called with no arguments: it computes
  `count`, `mean`, `std`, `min`, `25%`, `50%`, `75%`, and `max` for
  each of `houses_df`'s three numeric columns (`size_sqft`, `bedrooms`,
  `price`) and assembles the results into one new `DataFrame`, with
  one row per statistic and one column per original numeric column —
  the same shape proven in the isolated example above, here applied to
  three real columns instead of one.
- **`print(...)`** — the already-familiar built-in function, restated
  per the Repetition Rule for the second time in this lesson: converts
  its argument to text and displays it, here showing the summary
  `DataFrame` `.describe()` returned.

### CS Lens

Automatically computing the same fixed set of statistics across every
numeric column of a table, rather than requiring one call per column
per statistic, is an instance of **batch computation over a schema** —
applying a uniform operation to every field of a structured record
type at once, driven by the table's own declared columns rather than
by code written specifically for each one. The same underlying idea
recurs in a spreadsheet's "summary row" feature applied across every
column of a sheet, a database's `information_schema` tools reporting
column-level statistics for every table at once, and — closely
related to Lesson 4's own linear algebra — applying one operation to
every row of a matrix via `@` instead of writing a loop per row; in
every case, the table's own structure is what drives how many times an
operation repeats, rather than that count being hard-coded by the
programmer.

### SE Lens

The alternative not chosen here is exactly what Lesson 6 did: call
`.mean()` and `.std()` individually, one column at a time, and note
each result down separately. That approach is fine, and arguably
clearer, for genuinely understanding *how* a single statistic is
computed — which is precisely why Lesson 6 built it that way, by hand,
before this lesson introduced the batch version. Once the underlying
computation is understood, though, repeating six separate calls for
three columns doesn't scale to a real dataset with dozens of columns —
`.describe()` costs one call instead of many, and its tabular output
makes comparing statistics *across* columns (is `bedrooms`'s spread
large relative to its own mean, compared to `price`'s?) far easier
than reading the same numbers scattered across separate print
statements. The tradeoff is that `.describe()`'s fixed set of
statistics can't be customized per call — reaching for exactly one
extra statistic it doesn't include still means falling back to an
individual method call, the way Lesson 6 already demonstrated.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import pandas as pd
>>> houses_df = pd.read_csv('houses.csv')
>>> print(houses_df.describe())
         size_sqft  bedrooms          price
count     8.000000  8.000000       8.000000
mean   1668.750000  3.250000  226000.000000
std     509.858174  1.035098   68262.099922
min     900.000000  2.000000  124000.000000
25%    1350.000000  2.750000  183500.000000
50%    1675.000000  3.000000  228000.000000
75%    1937.500000  4.000000  264500.000000
max    2450.000000  5.000000  328000.000000
```

The `size_sqft` column's own `mean`, `1668.750000`, and `std`,
`509.858174`, are new numbers — computed from all eight real houses in
`houses.csv`, not the four hand-built ones Lesson 6 used, so they
don't match Lesson 6's own `1587.5` and `487.82...` exactly, though
they measure the identical thing on a different, larger sample. The
`price` column's own `mean`, `226000.0`, is new information this
curriculum hasn't computed before at all — the average sale price
across all eight houses in the file.

### Connection

This unit summarized every numeric column of `houses_df` in a single
call — the same mean-and-spread computation Lesson 6 performed by hand
on one column, now automated across all three, on real data loaded
from a file rather than typed directly into the script.

---

## Connect the Pieces

Follow `size_sqft`, the same column traced individually in Lesson 6,
through everything this lesson built, start to finish:

1. `pd.read_csv('houses.csv')` reads eight real `size_sqft` values —
   `1400, 1850, 900, 2200, 1600, 1200, 2450, 1750` — from the file's
   second line onward, each one paired on its own row with a bedroom
   count and a price, and assembles them, alongside the other two
   columns, into `houses_df`.
2. `houses_df.head()` previews the first five of those eight values —
   `1400` through `1600` — confirming the column loaded with
   sensible-looking numbers before anything further ran.
3. `houses_df.describe()` computes `size_sqft`'s mean, `1668.75`, and
   standard deviation, `509.858174`, across all eight real values at
   once — the exact same two computations Lesson 6 performed by hand,
   with `.mean()` and `.std()` called directly, on a different,
   smaller, hand-built version of this same column.

The underlying statistics — mean and standard deviation — are
identical ideas in both lessons; what changed is only the source of
the numbers being summarized, and how much code was needed to compute
and display them: two individual method calls for one column in
Lesson 6, versus one call covering three columns at once here.
