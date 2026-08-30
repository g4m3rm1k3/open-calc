# Lesson 11: Two Models at Once — Transpose and Matrix Multiplication

## What you will build

`datatools.py` gains a second candidate weight vector — a rival guess
at how size and bedroom count should predict price — and three new
operations to work with both at once: **vector addition**, first used
to combine the two candidates into a single averaged model;
**transpose**, used to flip a matrix's rows and columns so two weight
vectors can be arranged the way matrix multiplication needs them; and
**matrix-matrix multiplication**, which runs Lesson 4's `houses @
weights` computation for *both* candidate models simultaneously, in
one call, producing every prediction from every model at once. The
transferable problem this lesson is actually about: Lesson 4 covered
one weight vector and one matrix, but real linear algebra work —
including everywhere the Hands-On Machine Learning book's own math
appendix and its later chapters lean on linear algebra — routinely
needs to combine several vectors together, reshape a matrix's own
orientation, and multiply two matrices against each other, not just a
matrix against a single vector.

## What you need to know first

Lesson 4's dot product and matrix-vector multiplication with `@`, and
broadcasting a scalar with `+` and `*` — this lesson extends `@` from
matrix-vector to matrix-matrix multiplication, and reuses `+` between
two same-shaped vectors instead of a vector and a scalar.

## Terms used in this lesson

- **vector addition** — adding two vectors of the same length by
  adding their values position by position, producing a new vector of
  the same length. It exists as the most basic way to combine two
  vectors that represent comparable quantities — two weight vectors
  for the same two features, in this lesson's case — into one, without
  needing anything more complex than the addition every earlier lesson
  already knows.
- **transpose** — an operation on a matrix that flips its rows and
  columns: what was row `i`, column `j` becomes row `j`, column `i`,
  turning a matrix of shape `(rows, columns)` into one of shape
  `(columns, rows)`. It exists because a matrix's own data doesn't
  inherently say which axis "should" be rows and which "should" be
  columns — that's a choice made when the matrix is built — and
  matrix multiplication's own shape requirements, covered later in
  this lesson, sometimes need that choice reversed from however the
  matrix already happens to be laid out.
- **matrix-matrix multiplication** — an operation combining two
  matrices, of shapes `(m, n)` and `(n, p)`, into a new matrix of shape
  `(m, p)`, where each entry of the result is the dot product of one
  row from the first matrix and one column from the second. It exists
  as the direct generalization of Lesson 4's matrix-vector
  multiplication: a vector is really just a matrix with one column,
  and multiplying by a matrix with several columns instead of one
  performs that same per-row dot product against *every* column at
  once, rather than only one.

## Objects and methods used

### `ndarray.T`

- **What it is:** an attribute on every `ndarray` instance — no
  parentheses, the same category as Lesson 1's `.shape` and `.dtype`
  — that returns the array's transpose.
- **Implementation:** for a two-dimensional array of shape `(rows,
  columns)`, `.T` returns a new view of shape `(columns, rows)`, where
  element `[j, i]` of the result equals element `[i, j]` of the
  original.
- **Its use:** it's how this lesson reorients a matrix built with one
  weight vector per *row* into one with one weight vector per
  *column* — the shape matrix-matrix multiplication, covered later in
  this lesson, actually needs.
- **Type:** an instance attribute, read with no parentheses — a
  stored/computed property of the array, not a method call, the same
  category as `.shape` and `.dtype` from Lesson 1.
- **Responsibility:** report a reoriented version of the array it's
  read from, with rows and columns swapped — it does not modify the
  original array at all; the array `.T` is read from is left
  completely unchanged, the same non-mutating behavior every array and
  `DataFrame` operation in this curriculum has had so far.
- **Depends on:** an already-constructed `ndarray` with at least two
  dimensions for the row/column swap to be meaningful.
- **Connects to:** read directly off the weight matrix this lesson
  builds from two vectors; its result is what `@`, called immediately
  after, uses as its second operand.
- **Shape:** part of every `ndarray`'s core public interface — the
  standard way to reorient a matrix's rows and columns whenever an
  operation's shape requirements call for it.

### `@` (matrix-matrix multiplication)

- **What it is:** the identical operator from Lesson 4 — no new
  object or method — used here between two two-dimensional arrays
  instead of a two-dimensional array and a one-dimensional one.
- **Implementation:** for `a` of shape `(m, n)` and `b` of shape `(n,
  p)`, `a @ b` returns a new array of shape `(m, p)`, where entry `[i,
  j]` of the result is the dot product of row `i` of `a` and column
  `j` of `b` — the identical per-row dot product Lesson 4 already
  proved for matrix-vector multiplication, computed here once per
  column of `b` instead of only once.
- **Its use:** it's how this lesson computes every house's predicted
  price under *both* candidate weight vectors, in a single call,
  rather than calling Lesson 4's matrix-vector version once per
  candidate.
- **Type:** operator syntax backed by `ndarray`'s own `__matmul__`
  method — the same category of call as Lesson 4's use of `@`, applied
  here to two 2D operands instead of a 2D and a 1D one.
- **Responsibility:** given two arrays whose shapes are compatible —
  the first array's column count must equal the second array's row
  count — compute every required row-times-column dot product and
  assemble the results into a new array of the reduced shape; given
  incompatible shapes, it raises `ValueError` rather than proceeding.
- **Depends on:** two already-constructed 2D `ndarray`s with a
  matching inner dimension — here, `houses`'s column count (`2`)
  matching the transposed weight matrix's row count (also `2`).
- **Connects to:** called between `houses`, built across Lessons 2 and
  4, and the transposed weight matrix built earlier in this lesson;
  its result is what this lesson's final "Run It" step inspects.
- **Shape:** the same core operator from Lesson 4, now shown handling
  its more general, two-matrix case — the same operator every later
  lesson doing real linear algebra, including anything in the Hands-On
  Machine Learning book itself, will reach for regardless of whether
  one or both operands are matrices.

---

## Concept Unit: Vector Addition

### The Problem

Lesson 4 built one weight vector, `weights = np.array([120, 8000])`,
chosen by hand as a plausible guess. A second, equally plausible guess
might exist — a different analyst's own estimate of how much size and
bedroom count should matter — and combining two separate guesses into
one averaged model is a common, simple way to hedge between them,
without yet needing anything as involved as actually training a model
on data, which this curriculum hasn't reached yet.

Given two vectors of the same length, `weights_a = np.array([120,
8000])` and `weights_b = np.array([100, 10000])`, and given that
Lesson 1 already proved `+` broadcasts a *scalar* across every element
of an array — what do you predict happens when `+` is used between
*two arrays of the same shape* instead of an array and a single
number? Would you expect one combined number, the way Lesson 4's dot
product collapsed two vectors into one scalar — or a new vector, the
same shape as both, combining them position by position?

### Isolated Example

```python
>>> import numpy as np
>>> a = np.array([1, 2, 3])
>>> b = np.array([10, 20, 30])
>>> a + b
array([11, 22, 33])
```

Run for real, this session:

```
>>> import numpy as np
>>> a = np.array([1, 2, 3])
>>> b = np.array([10, 20, 30])
>>> a + b
array([11, 22, 33])
```

This proves `+` between two same-shaped arrays produces a new array of
the identical shape, combining them position by position — `1 + 10`,
`2 + 20`, `3 + 30` — genuinely different from Lesson 1's scalar
broadcasting, where a single number was applied to every position;
here, every position of `a` is paired with the *corresponding*
position of `b`. This is called **vector addition**, defined under
Terms, above. This `a`/`b` example is discarded now; it exists only to
prove element-wise addition between two same-shaped arrays, and it
will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 10's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `train_df = houses_filled.iloc[train_positions]`,
  added in Lesson 10's third Concept Unit.
- **Dependencies:** `weights`, built in Lesson 4's first Concept Unit
  — reused here under the name `weights_a`.

### The New Code

```python
weights_a = np.array([120, 8000])
weights_b = np.array([100, 10000])
weights_averaged = (weights_a + weights_b) / 2
```

### The Updated Project

This is a self-contained addition — three new lines with nothing
existing to insert them into — so the whole new block is:

```
1  weights_a = np.array([120, 8000])
2  weights_b = np.array([100, 10000])
3  weights_averaged = (weights_a + weights_b) / 2
```

As a whole, this block builds two candidate weight vectors and
combines them into a single, averaged vector — one model built by
splitting the difference between two independent guesses.

### Mechanical Walkthrough

- **`np.array([120, 8000])`** and **`np.array([100, 10000])`** — the
  same function from Lesson 1, explained there in full and, per the
  Repetition Rule, restated here: each builds a one-dimensional
  `ndarray` from a Python `list` — two separate weight vectors, both
  representing a per-unit price for size and a per-unit price for
  bedroom count, the same feature order Lesson 4 established.
- **`weights_a = ...`** and **`weights_b = ...`** — assignment,
  already-familiar syntax, binding each vector to its own name.
- **`weights_a + weights_b`** — the `+` operator, explained in full
  under Isolated Example, above: applied here between two
  one-dimensional arrays of equal length (`2`), it adds them position
  by position, returning a new vector — this lesson's own real
  instance of the vector addition just proven in isolation.
- **`/ 2`** — the `/` operator, already used in Lesson 6's
  standardization and, per the Repetition Rule, restated here: applied
  between the summed vector and the scalar `2`, it divides every
  element by `2` via the same broadcasting rule proven in Lesson 1,
  turning a sum into an average.
- **`weights_averaged = ...`** — assignment, binding the name
  `weights_averaged` to that final averaged vector.

### CS Lens

Averaging two independently-produced vectors together, rather than
trusting either one alone, is the simplest possible instance of an
**ensemble** — combining multiple separate estimates into one, in the
hope that the combination is more reliable than any single one of its
parts. The same underlying idea, in far more sophisticated forms,
recurs throughout the Hands-On Machine Learning book itself — random
forests average the predictions of many individual decision trees, and
several other techniques it covers combine multiple models' outputs
rather than relying on one — and also recurs outside machine learning
entirely, in a panel of judges averaging their individual scores, or a
weather forecast blending several independent models' predictions.

### SE Lens

The alternative not chosen here is picking one candidate vector —
`weights_a` or `weights_b` — and discarding the other outright. That's
simpler, and if one candidate is known, with confidence, to be more
trustworthy than the other, it might even be the right call. Averaging
costs almost nothing computationally and hedges against either
candidate being badly wrong on its own, at the real cost of also
diluting whichever candidate actually was better — if `weights_a` were
the far more accurate guess, averaging it with a poor `weights_b`
would make the combined estimate strictly worse than `weights_a` alone
would have been. Simple averaging, as used here, implicitly assumes
both candidates deserve equal trust; a *weighted* average — giving one
vector more influence than the other — would be one direct way to
relax that assumption, using tools this lesson has already
introduced (multiply each vector by a different scalar before adding),
though this lesson doesn't build that version.

### Commands Needed

None new — `numpy` is already installed from Lesson 1.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> weights_a = np.array([120, 8000])
>>> weights_b = np.array([100, 10000])
>>> (weights_a + weights_b) / 2
array([ 110., 9000.])
```

`[110.0, 9000.0]` — the midpoint between `120` and `100` for size, and
between `8000` and `10000` for bedrooms — confirming vector addition
combined both candidates position by position before the scalar
division averaged each combined value.

### Connection

This unit combined two weight vectors into one, but only ever produced
a single result vector. The next unit keeps both candidates fully
separate instead, arranging them into a single matrix so both can be
used to predict prices at once — the reason this lesson needs
transpose in the first place.

---

## Concept Unit: Transpose

### The Problem

`weights_a` and `weights_b`, from the previous unit, are two separate
vectors. Building predictions from *both*, for every house, using a
single matrix-matrix multiplication (this lesson's final unit) rather
than two separate matrix-vector calls, means arranging them together
into one matrix first — and matrix multiplication's own shape rule,
which Lesson 4 already established for a matrix and a vector, extends
directly to two matrices: an `(m, n)` matrix times an `(n, p)` matrix
needs the first matrix's column count to match the second matrix's row
count.

Given `houses`, shape `(8, 2)` — eight houses, two features — and
given that stacking `weights_a` and `weights_b` together as two
separate rows, `np.array([weights_a, weights_b])`, produces a matrix
of shape `(2, 2)` — two models, two features per model — what shape
would that "one row per model" matrix need to actually be, for
`houses @ that_matrix` to be a legal multiplication at all, given
`houses`'s own column count is `2`? Does `(2, 2)`, as built, already
have the right shape purely by coincidence of both dimensions being
equal — or does the *meaning* of each of its two axes (which axis
represents "which model," and which represents "which feature")
still need to be flipped, even though the numbers happen to already
match?

### Isolated Example

```python
>>> import numpy as np
>>> m = np.array([[1, 2], [3, 4], [5, 6]])
>>> m.shape
(3, 2)
>>> m.T
array([[1, 3, 5],
       [2, 4, 6]])
>>> m.T.shape
(2, 3)
```

Run for real, this session:

```
>>> import numpy as np
>>> m = np.array([[1, 2], [3, 4], [5, 6]])
>>> m.shape
(3, 2)
>>> m.T
array([[1, 3, 5],
       [2, 4, 6]])
>>> m.T.shape
(2, 3)
```

This proves `.T` swaps a matrix's two axes entirely — a `(3, 2)`
matrix becomes `(2, 3)`, and, checking specific values, `m`'s row `0`,
`[1, 2]`, becomes `m.T`'s *column* `0`, `[1, 2]` read downward — every
row of the original becomes a column of the result, and vice versa.
This is a genuinely non-square example specifically to make the shape
change unambiguous, since a square matrix's shape wouldn't visibly
change even though its actual content still would. This `m` example is
discarded now; it exists only to prove `.T` swaps rows and columns on
a matrix where the shape change is directly visible, and it will not
appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `weights_averaged = (weights_a +
  weights_b) / 2`, added in the previous unit.
- **Dependencies:** `weights_a` and `weights_b`, from the previous
  unit.

### The New Code

```python
weights_matrix = np.array([weights_a, weights_b])
weights_matrix_t = weights_matrix.T
```

### The Updated Project

`datatools.py`'s linear algebra block now reads, in full:

```
1  weights_a = np.array([120, 8000])
2  weights_b = np.array([100, 10000])
3  weights_averaged = (weights_a + weights_b) / 2
4  weights_matrix = np.array([weights_a, weights_b])   # ← new
5  weights_matrix_t = weights_matrix.T                  # ← new
```

As a whole, this block now builds both candidate weight vectors,
averages them (the previous unit's own result, still present and
unused by this unit), and separately arranges both candidates into a
matrix — first with one model per row, then transposed to one model
per column, the orientation the next unit's matrix multiplication
actually needs.

### Mechanical Walkthrough

- **`np.array([weights_a, weights_b])`** — the same function explained
  in full in Lesson 1 and, per the Repetition Rule, restated here, but
  given a `list` of two existing `ndarray`s rather than a `list` of
  plain numbers — the same nested-list-becomes-2D-array behavior
  proven in Lesson 2, here with each "inner list" itself already being
  an array rather than a freshly-typed literal: the result is a
  two-dimensional array of shape `(2, 2)`, with `weights_a` as row `0`
  and `weights_b` as row `1`.
- **`weights_matrix = ...`** — assignment, already-familiar syntax,
  binding the name `weights_matrix` to that `(2, 2)` array — "one row
  per model, one column per feature," the opposite orientation from
  `houses`'s own "one row per house, one column per feature" layout
  established back in Lesson 2.
- **`weights_matrix.T`** — the attribute explained in full under
  Objects and methods, above: reads `weights_matrix`'s transpose,
  proven in the isolated example to swap rows and columns — here
  producing a new `(2, 2)` array where column `0` is `weights_a` and
  column `1` is `weights_b`, "one column per model" instead of "one
  row per model," even though both matrices happen to share the exact
  same `(2, 2)` shape, since this particular weight matrix happens to
  be square.
- **`weights_matrix_t = ...`** — assignment, binding the name
  `weights_matrix_t` to that transposed array.

### CS Lens

Choosing which axis of a two-dimensional structure represents which
real-world concept — rows as houses versus rows as models, in this
lesson's own two matrices — is a specific instance of a broader idea
sometimes called **layout** or **orientation**: the same underlying
data can be validly represented multiple ways, and an operation
combining two such structures often requires them to agree on that
choice before it can proceed. The same underlying need to reconcile
differing orientations recurs in a spreadsheet where one table lists
records as rows and another, related table happens to list the same
kind of records as columns, and in image processing, where a color
image can be stored either "row-major" or "column-major" — in every
case, the data itself doesn't change meaning, but an operation
combining two structures still needs them aligned the same way before
it can run.

### SE Lens

The alternative not chosen here is building `weights_matrix` in the
already-correct "one column per model" orientation directly —
`np.array([weights_a, weights_b]).T` in one combined expression, or
constructing the columns directly some other way — rather than
building it "one row per model" first and transposing afterward. Both
end at the identical array. Building it row-first, the way this unit
did, mirrors how the data most naturally arrives — one whole weight
vector per candidate, added one at a time, the same way `weights_a`
and `weights_b` were each defined as one complete vector in the
previous unit — and transposing afterward is often clearer to a reader
than mentally reasoning about "which axis goes where" while
constructing the array in the final orientation directly. The real
cost of relying on transpose at all, rather than getting the
orientation right from the start, is that `.T` is easy to forget or
misapply on a case where — unlike this lesson's own square `(2, 2)`
example — a shape mismatch would raise an immediate, visible
`ValueError` rather than a subtler bug; the fact that this lesson's own
weight matrix happens to be square, and so `.T` doesn't even change
its shape, above, was called out specifically because that coincidence
can mask a genuine transpose-orientation mistake elsewhere.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> weights_a = np.array([120, 8000])
>>> weights_b = np.array([100, 10000])
>>> weights_matrix = np.array([weights_a, weights_b])
>>> weights_matrix
array([[  120,  8000],
       [  100, 10000]])
>>> weights_matrix.T
array([[  120,   100],
       [ 8000, 10000]])
```

`weights_matrix`'s row `0` is `weights_a`'s two values; its transpose's
*column* `0` holds those same two values instead — confirming the
row-to-column swap the isolated example already proved, here on the
lesson's own real weight matrix.

### Connection

This unit reoriented the weight matrix from "one row per model" to
"one column per model." The next unit uses that reoriented matrix to
finally compute both models' predictions for every house, in a single
matrix-matrix multiplication.

---

## Concept Unit: Matrix-Matrix Multiplication

### The Problem

Lesson 4's `houses @ weights` computed one prediction per house, using
one weight vector. `weights_matrix_t`, from the previous unit, now
holds *two* weight vectors, arranged as two columns. Getting
predictions from both candidate models, for every house, using only
Lesson 4's own matrix-vector tool, would mean calling `houses @
weights_a` and `houses @ weights_b` separately, exactly the way
"Connect the Pieces" verified them independently back in that lesson —
two separate calls, producing two separate result arrays that would
then need to be combined by hand.

Given that Lesson 4 already proved `@` between a `(4, 2)`-shaped
matrix and a `(2,)`-shaped vector produces one dot product per row —
and given that `weights_matrix_t`, from the previous unit, is a
`(2, 2)` *matrix*, not a vector, with each of its two columns being a
separate, complete weight vector — what do you predict `houses @
weights_matrix_t` computes? One combined number? One result per house,
the same as Lesson 4? Or something with an extra dimension, given that
there are now two separate weight vectors, not one, involved in the
same expression?

### Isolated Example

```python
>>> import numpy as np
>>> matrix_1 = np.array([[1, 2], [3, 4], [5, 6]])
>>> matrix_2 = np.array([[10, 100], [20, 200]])
>>> matrix_1 @ matrix_2
array([[  50,  500],
       [ 110, 1100],
       [ 170, 1700]])
```

Run for real, this session:

```
>>> import numpy as np
>>> matrix_1 = np.array([[1, 2], [3, 4], [5, 6]])
>>> matrix_2 = np.array([[10, 100], [20, 200]])
>>> matrix_1 @ matrix_2
array([[  50,  500],
       [ 110, 1100],
       [ 170, 1700]])
>>> matrix_1.shape, matrix_2.shape, (matrix_1 @ matrix_2).shape
((3, 2), (2, 2), (3, 2))
```

This proves `@` between two matrices — `(3, 2)` and `(2, 2)` here —
produces a new matrix of shape `(3, 2)`: three rows (matching
`matrix_1`'s row count) and two columns (matching `matrix_2`'s column
count). Checking one entry directly confirms the underlying
computation: result position `[0, 0]`, `50`, is `matrix_1`'s row `0`
(`[1, 2]`) dotted with `matrix_2`'s *column* `0` (`[10, 20]`) — `1*10 +
2*20 = 50` — exactly Lesson 4's own per-row dot product, run here once
against each of `matrix_2`'s two columns instead of only one vector.
This `matrix_1`/`matrix_2` example is discarded now; it exists only to
prove matrix-matrix multiplication's resulting shape and its
per-row-per-column dot product mechanism, and it will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `weights_matrix_t = weights_matrix.T`,
  added in the previous unit.
- **Dependencies:** `houses`, built across Lessons 2 and 4;
  `weights_matrix_t`, built in the previous unit.

### The New Code

```python
both_predictions = houses @ weights_matrix_t
```

### The Updated Project

`datatools.py`'s linear algebra block now reads, in full — its final
state for this lesson:

```
1  weights_a = np.array([120, 8000])
2  weights_b = np.array([100, 10000])
3  weights_averaged = (weights_a + weights_b) / 2
4  weights_matrix = np.array([weights_a, weights_b])
5  weights_matrix_t = weights_matrix.T
6  both_predictions = houses @ weights_matrix_t   # ← new
```

As a whole, this block now builds two candidate models, arranges them
into correctly-oriented matrix form, and computes every house's
predicted price under *both* models in a single matrix-matrix
multiplication — completing this lesson's own extension of Lesson 4's
single-model prediction into a genuinely multi-model one.

### Mechanical Walkthrough

- **`houses @ weights_matrix_t`** — the `@` operator, explained in
  full in Lesson 4 for the matrix-vector case and, under Objects and
  methods above, restated for the matrix-matrix case: applied between
  `houses` (shape `(8, 2)`) and `weights_matrix_t` (shape `(2, 2)`),
  it computes, for every house (every row of `houses`) and every model
  (every column of `weights_matrix_t`), the dot product of that
  house's feature vector and that model's weight vector — returning a
  new array of shape `(8, 2)`: eight houses, two predictions each, one
  per model.
- **`both_predictions = ...`** — assignment, already-familiar syntax,
  binding the name `both_predictions` to that resulting `(8, 2)`
  array.

### CS Lens

Matrix-matrix multiplication is, structurally, nothing more than
running Lesson 4's matrix-vector multiplication once per column of the
second matrix, and stacking the results together — the same
**vectorization** idea named in Lesson 1, applied one level deeper: not
only is the loop over rows removed (as Lesson 4 already showed), but
the loop over separate weight vectors is removed too, both folded into
a single operation. This is also the exact mathematical operation
underlying a **fully-connected layer** in a neural network — the kind
of model the Hands-On Machine Learning book covers in its deep
learning chapters — where a whole layer's output, for every neuron at
once, is computed as one matrix-matrix multiplication between the
layer's inputs and its own weight matrix, precisely the shape of
computation this unit just performed on a much smaller scale.

### SE Lens

The alternative not chosen here is calling Lesson 4's matrix-vector
multiplication twice, separately — `houses @ weights_a` and `houses @
weights_b` — and then combining the two resulting `(8,)` arrays into
one `(8, 2)` array by hand, perhaps with a tool like `np.column_stack`,
not introduced in this curriculum. That approach is correct and
arguably easier to read for exactly two models, since each call is
individually simple. The real cost shows up with more models: ten
candidate weight vectors would mean ten separate `@` calls plus a
manual combining step, versus this unit's single matrix-matrix `@`
call scaling to ten columns with no change to the code at all beyond
how `weights_matrix_t` itself is built. The tradeoff is the same one
this lesson's transpose unit already surfaced: getting the weight
matrix's orientation right becomes more important, not less, as more
models are added, since a single misplaced `.T` now silently affects
every one of them at once rather than one call's worth of output.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4],
...                     [1600, 3], [1200, 2], [2450, 5], [1750, 3]])
>>> weights_matrix_t = np.array([[120, 100], [8000, 10000]])
>>> houses @ weights_matrix_t
array([[192000, 170000],
       [254000, 225000],
       [124000, 110000],
       [296000, 260000],
       [216000, 190000],
       [160000, 140000],
       [334000, 295000],
       [234000, 205000]])
>>> houses @ np.array([120, 8000])
array([192000, 254000, 124000, 296000, 216000, 160000, 334000, 234000])
```

Column `0` of the matrix-matrix result — `[192000, 254000, 124000,
296000, 216000, 160000, 334000, 234000]` — matches `houses @
np.array([120, 8000])` (`weights_a` alone) exactly, value for value,
confirming a single matrix-matrix multiplication really does produce
the same per-model results Lesson 4's individual matrix-vector calls
would have, just computed together in one call instead of two
separate ones.

### Connection

This unit combined Lesson 4's per-house dot product with this lesson's
own vector addition and transpose into a single matrix-matrix
multiplication — every house, every candidate model, one call — the
last of the three specific operations this curriculum's own math
prerequisites named and Lesson 4 alone hadn't yet covered.

---

## Connect the Pieces

Follow one house — size `1850`, `4` bedrooms, the same house traced in
Lessons 2 through 5 — through everything this lesson built, start to
finish:

1. This house's row, `[1850, 4]`, is unaffected by the first unit's
   vector addition — `weights_averaged` combines the two *weight*
   vectors, not anything about individual houses.
2. `weights_matrix = np.array([weights_a, weights_b])` places
   `weights_a`'s and `weights_b`'s values into two rows, neither of
   which involves this house's data — this is still purely
   about arranging the two candidate models.
3. `weights_matrix_t = weights_matrix.T` reorients that same data — no
   house data enters yet — into the "one column per model" shape
   `houses @ weights_matrix_t` needs.
4. `houses @ weights_matrix_t` finally reaches this house, at row `1`
   of `houses`: its feature vector, `[1850, 4]`, is dotted against
   `weights_matrix_t`'s column `0` (`weights_a`, giving `254000`,
   matching Lesson 4's own traced result for this exact house exactly)
   and separately against column `1` (`weights_b`, giving `225000`) —
   both landing at row `1` of `both_predictions`, as `[254000,
   225000]`.

This house's first prediction, `254000`, is the identical number
Lesson 4's own "Connect the Pieces" traced for `weights_a` alone —
confirming matrix-matrix multiplication didn't change what a single
model predicts, it only computed a second model's prediction,
`225000`, from `weights_b`, at the same time, in the same call,
without requiring a second pass through `houses` to get it.
