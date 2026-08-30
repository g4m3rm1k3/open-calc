# Lesson 4: One Number Out of Many — the Dot Product

## What you will build

`datatools.py` gains a small linear price model: a `weights` vector
saying how much each feature (size, bedrooms) contributes per unit,
and a `bias` — one number added on top of everything else — combined
with `houses` to produce one predicted price per house. Getting there
introduces three ideas the Hands-On Machine Learning book leans on
constantly: the **dot product** (multiply two same-length vectors
element by element, then add up the results into one number),
**matrix-vector multiplication** (apply that same dot product to every
row of a 2D array against one vector, all at once), and
**broadcasting** (letting a single scalar apply to every element of a
larger array, made explicit here as the general rule Lesson 1's scalar
multiplication was already secretly following). The transferable
problem this lesson is actually about: nearly every prediction a
machine learning model makes — including the ones deeper chapters of
that book train — comes down to exactly this pattern: multiply
features by learned weights, add them up, add one bias term.

## What you need to know first

Lesson 1's `np.array` and vectorized scalar multiplication with `*`,
and Lesson 2's two-dimensional arrays, `.shape`, and row/column
indexing with `houses[i]` and `houses[:, j]` — this lesson builds
`weights` and `bias` directly against the `houses` array from Lesson
2's end state, and assumes both are already comfortable.

## Terms used in this lesson

- **vector** — in this lesson, a one-dimensional NumPy array treated
  as a single mathematical object rather than a loose list of unrelated
  numbers — `house = np.array([1850, 4])` is a vector because its two
  positions have an agreed meaning (size, then bedrooms) that both a
  matching weight vector and this lesson's code depend on staying
  fixed. It exists as a distinct idea from "a 1D array" purely as a
  framing: the array type doesn't change, but treating it as one
  mathematical quantity, rather than two independent numbers that
  happen to sit next to each other, is what makes a dot product
  meaningful at all.
- **matrix** — in this lesson, a two-dimensional NumPy array treated
  the same way — `houses`, from Lesson 2, is a matrix once its rows
  are read as "one house each" rather than an arbitrary grid of
  numbers. Same relationship to `ndarray` as vector: no new type, a
  new way of reading the existing one.
- **dot product** — a single number produced from two same-length
  vectors by multiplying them element by element and summing every
  one of those products together. It exists because "how much do
  these two vectors agree, weighted position by position" is a
  question that comes up constantly in numeric computing — a weighted
  total, in this lesson's case — and doing it by hand, every time,
  with a loop and an accumulator, would bury that one idea under
  repeated boilerplate.
- **broadcasting** — NumPy's rule for combining arrays of different
  shapes in one operation by automatically stretching the smaller one
  to match, without actually copying its data in memory. It exists
  because requiring every operand in every operation to already be the
  exact same shape would make even trivial operations, like adding one
  number to every element of an array, require writing that number out
  as a same-shaped array first — broadcasting is the rule that makes
  Lesson 1's `array * 100` and this lesson's `predictions + bias` both
  legal without that repetition.

## Objects and methods used

### `@` (the matrix multiplication operator) / `numpy.dot`

- **What it is:** two spellings of the same operation on `ndarray`
  operands — `@` is a Python operator (provided by the type's own
  `__matmul__` method), and `numpy.dot` is a free function; both
  compute a dot product when given two 1D arrays, and both compute
  matrix-vector or matrix-matrix multiplication when given
  higher-dimensional arrays.
- **Implementation:** `a @ b` and `np.dot(a, b)` — for two 1D arrays of
  equal length `n`, both return a single scalar, the sum of the `n`
  element-wise products. For a 2D array of shape `(rows, n)` and a 1D
  array of shape `(n,)`, both return a new 1D array of shape `(rows,)`
  — one dot product per row.
- **Its use:** it's how this lesson computes a weighted total for one
  house (a plain dot product) and, in the same syntax, a weighted
  total for every house in `houses` at once (matrix-vector
  multiplication) — the same operator scales from one row to many
  without changing.
- **Type:** `@` is operator syntax backed by a special method on
  `ndarray`; `np.dot` is a free function reached through the `np`
  alias. Both are called directly on or with `ndarray` operands, not
  attributes read without a call.
- **Responsibility:** given two arrays whose shapes are compatible for
  this operation (matching length for two vectors; matching inner
  dimension for a matrix and a vector), compute every required
  element-wise-multiply-then-sum and return the result at the correct
  reduced shape — one dimension smaller than the higher-dimensional
  input, or a bare scalar when both inputs are 1D.
- **Depends on:** two already-constructed `ndarray`s whose shapes are
  actually compatible — a 1D array of length 3 combined with one of
  length 2 raises `ValueError` rather than silently proceeding.
- **Connects to:** called in this lesson's own code between `house`
  and `weights` (a plain dot product), and between `houses` and
  `weights` (matrix-vector multiplication); its return value is what
  the following broadcasting addition (`+ bias`) is applied to.
- **Shape:** one of NumPy's most heavily used operations — the same
  operator every later lesson touching linear models, including the
  ones the Hands-On Machine Learning book trains for real, will use
  for exactly this reason.

---

## Concept Unit: The Dot Product

### The Problem

Lesson 1 multiplied every element of an array by the *same* scalar —
`sizes_array * SQFT_TO_SQM`. A price estimate needs something
different: size should be multiplied by *its own* per-unit price, and
bedroom count by a *different* per-unit price, and then both results
added together into one number. That's two different multiplications
and one addition, chained — not a single scalar broadcast the way
Lesson 1's conversion was.

Given a house's features as a vector, `house = np.array([1850, 4])`,
and a matching vector of per-unit prices, `weights = np.array([120,
8000])` (120 dollars per square foot, 8000 dollars per bedroom) — using
only what you already know (`*` between two same-shaped arrays,
already proven in earlier lessons to multiply element by element, and
Python's own `sum()` or a `for` loop), how would you combine
`house` and `weights` into one single predicted price? Try writing
that expression, using only tools from earlier lessons, before reading
on.

### Isolated Example

```python
>>> import numpy as np
>>> a = np.array([1, 2, 3])
>>> b = np.array([10, 20, 30])
>>> (a * b).sum()
140
>>> np.dot(a, b)
140
>>> a @ b
140
```

Run for real, this session:

```
>>> import numpy as np
>>> a = np.array([1, 2, 3])
>>> b = np.array([10, 20, 30])
>>> (a * b).sum()
140
>>> np.dot(a, b)
140
>>> a @ b
140
```

This proves three different expressions produce the identical result:
element-wise multiplication (`a * b`, already known from Lesson 1)
followed by `.sum()` — a method that adds every element of an array
together into one number — gives `140`; and both `np.dot(a, b)` and
`a @ b` give that same `140` directly, in one step, without the
intermediate array `a * b` ever being built explicitly. This is called
the **dot product**, defined under Terms, above — a single number
built from two vectors by multiplying position-by-position and summing
the results. This `a`/`b` example is discarded now; it exists only to
prove all three expressions compute the same value, and it will not
appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 3's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after the `large_houses = houses_df[is_large]`
  line, added in Lesson 3's third Concept Unit.
- **Dependencies:** `numpy`, already imported on line 1; no dependency
  on `houses_df` or `pandas`, since this unit works directly with a
  plain NumPy vector, not the labeled `DataFrame` from Lesson 3.

### The New Code

```python
house = np.array([1850, 4])
weights = np.array([120, 8000])
predicted_price = house @ weights
```

### The Updated Project

This is a self-contained addition — three new lines with nothing
existing to insert them into — so the whole new block is:

```
1  house = np.array([1850, 4])
2  weights = np.array([120, 8000])
3  predicted_price = house @ weights
```

As a whole, this block builds one house's feature vector, a matching
weight vector, and combines them into one predicted price using a
single dot product — no loop, no intermediate `.sum()` call, in the
final line.

### Mechanical Walkthrough

- **`np.array([1850, 4])`** — the same function from Lesson 1,
  explained there in full and, per the Repetition Rule, restated here:
  reads a Python `list` and builds a one-dimensional `ndarray` — here,
  a vector, per the framing given under Terms, above, since its two
  positions (size, then bedrooms) carry an agreed meaning matching
  `houses`'s own column order from Lesson 2.
- **`house = ...`** and **`weights = ...`** — assignment,
  already-familiar syntax, binding two vectors to names.
- **`house @ weights`** — the `@` operator, explained in full under
  Objects and methods, above: applied here between two 1D arrays of
  equal length (`2`), it computes their dot product and returns a
  single Python scalar — `120 * 1850 + 8000 * 4`, matching the
  elementwise-multiply-then-sum pattern proven in the isolated example.
- **`predicted_price = ...`** — assignment, binding the name
  `predicted_price` to that single number.

### CS Lens

The dot product is one instance of a **reduction** — an operation that
combines every element of a collection into one single result,
collapsing a whole array down to a scalar. The same idea, in different
forms, recurs as `sum()` on a plain Python list, a database
`SUM(column)` aggregate, and a `reduce`/`fold` function in functional
programming — all of them take "many values in," produce "one value
out," differing only in what combining rule is used at each step (plain
addition for `sum()`; multiply-then-add, position by position, for a
dot product).

### SE Lens

The alternative not chosen here is the loop-and-accumulator version
this unit's Socratic prompt invited you to sketch: a `for` loop over
paired positions, multiplying and adding into a running total by hand.
That version is correct and, for two numbers, barely longer. The real
cost shows up at scale, exactly as it did for Lesson 1's scalar
multiplication: `house @ weights` runs the same multiply-and-sum logic
inside NumPy's own compiled code, without Python's own per-iteration
interpreter overhead, and — just as importantly for correctness — it
can't accidentally initialize the accumulator wrong or skip the last
element the way a hand-written loop occasionally does. The tradeoff is
that `@` only works when both vectors already have compatible shapes;
mismatched lengths raise an error immediately rather than silently
looping over whichever is shorter, which a naive hand-written loop
using `zip` might do without complaint.

### Commands Needed

None new — `numpy` is already installed from Lesson 1.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> house = np.array([1850, 4])
>>> weights = np.array([120, 8000])
>>> house @ weights
254000
```

`254000` — `120 * 1850` (`222000`, from the size) plus `8000 * 4`
(`32000`, from the bedrooms) — confirming the dot product combines
both features into one weighted total, matching
`120 * 1850 + 8000 * 4 = 254000` computed by hand.

### Connection

This unit computed a predicted price for exactly one house, using one
dot product. The next unit applies that same operation to every house
in `houses` at once, without writing a loop over houses either.

---

## Concept Unit: Matrix-Vector Multiplication

### The Problem

The previous unit predicted a price for one hand-built vector,
`house`. `houses`, from Lesson 2, holds four houses at once, as a 2D
array of shape `(4, 2)`. Getting a predicted price for all four would
seem to need a loop — visit each row, run the previous unit's dot
product on it, collect four results — the exact loop-over-rows pattern
Lesson 2's boolean masking already replaced for filtering.

Given that `house @ weights` in the previous unit computed one dot
product between a 1D vector and another 1D vector of the same length,
and given that each *row* of `houses` is itself exactly that shape —
a 2D array's row, per Lesson 2, is a 1D array — what do you predict
happens if `weights` is combined with `houses` directly, using the
same `@` operator, instead of with one extracted row at a time? Would
you expect an error, a single number, or something with one result per
row?

### Isolated Example

```python
>>> import numpy as np
>>> matrix = np.array([[1, 2], [3, 4], [5, 6]])
>>> vector = np.array([10, 100])
>>> matrix @ vector
array([210, 430, 650])
```

Run for real, this session:

```
>>> import numpy as np
>>> matrix = np.array([[1, 2], [3, 4], [5, 6]])
>>> vector = np.array([10, 100])
>>> matrix @ vector
array([210, 430, 650])
>>> matrix.shape, vector.shape, (matrix @ vector).shape
((3, 2), (2,), (3,))
```

This proves `@` between a 2D array and a compatible 1D array computes
one dot product *per row*, all in a single expression, and returns a
new 1D array collecting those results — `210` is `1*10 + 2*100`, the
dot product of `matrix`'s first row with `vector`, exactly the same
computation the previous unit's `house @ weights` performed on a
single, hand-built row. The result's shape, `(3,)`, matches
`matrix`'s row count, not its column count — one result per row. This
`matrix`/`vector` example is discarded now; it exists only to prove
`@` performs one dot product per row when given a 2D and a 1D
operand, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `predicted_price = house @ weights`,
  added in the previous unit.
- **Dependencies:** `houses`, the 2D array from Lesson 2 — this unit
  restores it as a plain `ndarray` for this vector-math context,
  alongside `houses_df`, the `DataFrame` from Lesson 3, which remains
  the table used for name-based selection and filtering; `weights`,
  from the previous unit.

### The New Code

```python
houses = np.array([
    [1400, 3],
    [1850, 4],
    [900, 2],
    [2200, 4],
])
predictions = houses @ weights
```

### The Updated Project

This block reintroduces `houses` (removed from `datatools.py` in
Lesson 3, when `houses_df` replaced it as the file's main data
container) specifically for this vector-math context, and immediately
uses it:

```
1  houses = np.array([
2      [1400, 3],
3      [1850, 4],
4      [900, 2],
5      [2200, 4],
6  ])
7  predictions = houses @ weights
```

As a whole, this block rebuilds the same four-house matrix from Lesson
2 and computes a predicted price for every one of its four rows in a
single `@` expression — no loop over houses, and no repetition of the
previous unit's single-house dot product four separate times by hand.

### Mechanical Walkthrough

- **`np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])`** — the
  same function and nested-list construction explained in full in
  Lesson 2 and, per the Repetition Rule, restated here: a list of four
  equal-length inner lists becomes a two-dimensional array of shape
  `(4, 2)`, read here as a **matrix**, per Terms above — four rows,
  each one house's feature vector.
- **`houses @ weights`** — the same `@` operator explained in full in
  the previous unit and, per the Repetition Rule, restated here, now
  applied between a 2D array (`houses`, shape `(4, 2)`) and a 1D array
  (`weights`, shape `(2,)`) instead of two 1D arrays: it computes one
  dot product per row of `houses` against `weights`, exactly as proven
  in the isolated `matrix @ vector` example above, and returns a new
  1D array of shape `(4,)` — one predicted price per house.
- **`predictions = ...`** — assignment, binding the name `predictions`
  to that resulting array of four predicted prices.

### CS Lens

Applying the same operation to every row of a table in one call,
rather than writing an explicit loop over rows, is the same
**vectorization** idea named in Lesson 1 and reused again in Lesson
2's boolean masking — here applied to a reduction (the dot product)
instead of elementwise arithmetic or a comparison. It's also, from a
mathematical angle, exactly what a **linear transformation** is:
`houses @ weights` maps every 2-element row of `houses` to one number,
using the same fixed rule (`weights`) for every row, which is the
literal mathematical operation every layer of a linear regression
model — and every fully-connected layer of a neural network — performs
on its inputs.

### SE Lens

The alternative not chosen here is looping over `houses`'s rows and
calling the previous unit's single-row dot product four separate
times, collecting results into a new list. That's correct, and for
four houses barely slower. The real cost at scale is the same one
Lesson 1 and Lesson 2 already named: Python-level looping pays
per-iteration interpreter overhead that a single `@` call, running
NumPy's own compiled matrix code, does not — and at the scale of a
real dataset with thousands or millions of rows, that overhead is the
difference between a computation finishing in milliseconds versus
seconds. The tradeoff, as with the plain dot product in the previous
unit, is that `@` requires `houses`'s column count to exactly match
`weights`'s length — mismatched shapes raise `ValueError` immediately,
which is stricter than a hand-rolled loop using `zip` would be, but
catches a real shape mistake at the exact line it happened rather than
producing silently wrong or truncated output.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])
>>> weights = np.array([120, 8000])
>>> houses @ weights
array([192000, 254000, 124000, 296000])
```

Four predictions, one per house, in row order. The second value,
`254000`, matches the previous unit's single-house result exactly —
confirming `houses @ weights` really is performing the same dot
product per row, not some different computation.

### Connection

This unit produced a raw predicted price per house, using only the
weighted feature total. The next unit adds one more piece every linear
model needs: a flat amount added to every prediction regardless of a
house's features.

---

## Concept Unit: Broadcasting a Bias Term

### The Problem

`predictions`, from the previous unit, only accounts for size and
bedroom count. A real price model — and every linear model in the
Hands-On Machine Learning book — also includes a **bias** term: one
fixed number added to every single prediction, representing a baseline
price independent of any feature. `predictions` is an array of four
numbers; `bias` is a single number. Adding a lone number to an entire
array is exactly the situation Lesson 1's `sizes_array * SQFT_TO_SQM`
already did — but that was multiplication, proven once, and never
named as a *general rule*.

Given that Lesson 1 already showed `array * scalar` works, applying the
scalar to every element — without you needing to build a same-shaped
array of repeated scalars by hand first — what do you predict happens
with `array + scalar` instead? Does addition follow the identical
rule, or is scalar broadcasting specific to multiplication? And once
you've guessed, can you think of a reason NumPy would want that rule to
apply to *every* arithmetic operator consistently, rather than picking
and choosing which ones support it?

### Isolated Example

```python
>>> import numpy as np
>>> np.array([1, 2, 3]) + 100
array([101, 102, 103])
```

Run for real, this session:

```
>>> import numpy as np
>>> np.array([1, 2, 3]) + 100
array([101, 102, 103])
```

This proves `+` follows the identical rule Lesson 1 already proved for
`*`: a single scalar is applied to every element, with no explicit
same-shaped array required. This general rule — combining arrays of
different shapes by automatically stretching the smaller one to match,
without copying its data into a larger array first — is called
**broadcasting**, defined under Terms, above, and it isn't specific to
either operator: it's a rule NumPy applies consistently across `+`,
`-`, `*`, `/`, and comparison operators like `>`, all of which this
curriculum has now used. This `[1, 2, 3]` example is discarded now; it
exists only to prove scalar broadcasting applies to `+` the same way
Lesson 1 proved it for `*`, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `predictions = houses @ weights`, added
  in the previous unit.
- **Dependencies:** `predictions`, from the previous unit.

### The New Code

```python
bias = 15000
final_predictions = predictions + bias
```

### The Updated Project

`datatools.py`'s vector-math block now reads, in full:

```
1  house = np.array([1850, 4])
2  weights = np.array([120, 8000])
3  predicted_price = house @ weights
4
5  houses = np.array([
6      [1400, 3],
7      [1850, 4],
8      [900, 2],
9      [2200, 4],
10 ])
11 predictions = houses @ weights
12
13 bias = 15000                            # ← new
14 final_predictions = predictions + bias  # ← new
```

As a whole, this block now performs a complete linear prediction: it
builds one house's dot product, then every house's dot product at
once, and finally adds one flat baseline value to every one of those
predictions in a single broadcasted addition — the same three-part
formula (`features @ weights + bias`) underlying every linear model
the rest of this curriculum will eventually build toward.

### Mechanical Walkthrough

- **`bias = 15000`** — already-familiar Python assignment, binding a
  plain integer to a name; nothing about this line itself is new — it
  exists purely to give the next line something to add.
- **`predictions + bias`** — the `+` operator, ordinary already-known
  Python syntax on its own, applied here between a 1D array of shape
  `(4,)` and a single Python integer. Per broadcasting, defined above:
  NumPy treats the scalar `bias` as if it were repeated to match
  `predictions`'s shape — conceptually `[15000, 15000, 15000, 15000]`
  — without ever actually allocating that repeated array in memory,
  and adds element-wise, returning a new array of the same shape,
  `(4,)`.
- **`final_predictions = ...`** — assignment, binding the name
  `final_predictions` to the resulting array of four complete
  predictions.

### CS Lens

Broadcasting is a specific instance of a more general idea in array
and tensor computing: **shape-implicit operations**, where an
operation between differently-shaped operands is defined without
requiring the programmer to explicitly reconcile their shapes first.
The same underlying idea — stretch the smaller operand to match,
without copying data — recurs in image processing (applying one filter
value to every pixel of an image), audio processing (applying one gain
value to every sample of a waveform), and every other tensor library
modeled after NumPy's own broadcasting rules, including the ones
underneath the neural networks the Hands-On Machine Learning book
eventually trains.

### SE Lens

The alternative not chosen here — the one broadcasting exists
specifically to avoid — is manually building a same-shaped array of
repeated `bias` values before adding: `np.array([bias] * len(predictions))
+ predictions`. That version is correct and explicit, but it costs
real, avoidable memory (an actual array of four repeated `15000`s,
built and then discarded) and it costs the reader clarity — the
repeated-array version buries "add this one flat amount" inside
array-construction machinery that has nothing to do with the actual
intent. NumPy's own internal implementation of broadcasting avoids
even allocating that intermediate array, applying the scalar directly
during the addition instead — the syntactic simplicity for the
programmer and the memory efficiency inside NumPy come from the same
underlying design decision.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> predictions = np.array([192000, 254000, 124000, 296000])
>>> bias = 15000
>>> predictions + bias
array([207000, 269000, 139000, 311000])
```

Every one of the four predictions increased by exactly `15000` —
confirming the scalar was applied uniformly to every element, matching
the broadcasting rule proven in the isolated example.

### Connection

This unit completed the three-part linear prediction formula this
lesson has been building toward: a matrix-vector dot product per
house, then one flat bias broadcast across every result — the exact
computation Lesson 5 onward, and eventually the book's own linear
models, will reuse under the name "linear regression."

---

## Connect the Pieces

Follow the same house from Lessons 2 and 3 — size `1850`, `4`
bedrooms — through everything this lesson built, start to finish:

1. In the first unit, this exact house was hand-built as the vector
   `house = np.array([1850, 4])`, paired against `weights =
   np.array([120, 8000])`. `house @ weights` computed its dot
   product directly: `120 * 1850 + 8000 * 4 = 254000`.
2. In the second unit, this same house reappears as row `1` of the
   rebuilt matrix `houses`. `houses @ weights` computed a dot product
   for every row at once, and position `1` of the resulting
   `predictions` array — `254000` — exactly matches the first unit's
   hand-built result, confirming matrix-vector multiplication performs
   the identical computation per row that a single dot product performs
   in isolation.
3. In the third unit, `predictions + bias` added `15000` to every
   position, including this house's: `254000 + 15000 = 269000`,
   landing at position `1` of `final_predictions`.

This house's price prediction — `269000` — was reached two different
ways across this lesson's three units: once by hand, as a single
vector's dot product, and once as one row of a full matrix
multiplication applied to every house at once — and both routes agree,
because matrix-vector multiplication is nothing more than the first
unit's dot product, repeated per row, inside a single operator.
