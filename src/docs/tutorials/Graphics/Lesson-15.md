# Lesson 15: Transformation Composition

**What you will build:** A two-level coordinate chain — a fixture placed
inside a table's frame, and that table placed inside the machine's own
frame — converted from fixture coordinates to machine coordinates two
different ways: first by applying Lesson 14's `apply_matrix` twice, link
by link, and second by combining both matrices into one first, with a new
`multiply_matrices` operation, then applying that single combined matrix
once. Both methods must produce the identical result. The transferable
problem: Lesson 5 first showed that a chain of coordinate frames can
either be walked link-by-link or resolved by combining offsets first —
proved for plain origins, using addition. This lesson proves the same
result again, for full matrices, using multiplication.

**What you need to know first:** Lesson 14's `dot3` and `apply_matrix`
(reused unchanged here), Lesson 14's matrix and homogeneous-point
representation, and Lesson 5's own "walk the chain vs. combine offsets
first" result, which this lesson re-proves in matrix form.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–14.

**Terms introduced in this lesson:**

- **Column** — the values sitting at the same position across every row
  of a matrix, read top to bottom. Why: this lesson's matrices are stored
  row by row (`matrix[0]`, `matrix[1]`, `matrix[2]` are each a whole row),
  so nothing hands a column back directly — it has to be assembled one
  entry at a time, and matrix-matrix multiplication, below, needs exactly
  that.
- **Matrix-matrix multiplication** — combining two matrices into one new
  matrix, where each entry of the result is the dot product of one row
  from the first matrix and one column from the second. Why: this is the
  operation that lets "apply this transform, then that transform" be
  precomputed into a single matrix once, instead of applying both
  transforms separately every time a point needs converting.

**Objects and methods used:**

None. `multiply_matrices` and `get_column`, this lesson's two new
functions, are hand-authored project code, not external library calls —
full treatment is in each Concept Unit's Mechanical Walkthrough below.

---

## Concept Unit: Two Chained Frames — Link by Link

### The Problem

Every matrix built so far has converted a point across exactly one level
— fixture coordinates to table coordinates. Real machine setups often
nest further: a fixture sits on a table, and that table itself sits at
some position and orientation inside the machine's own coordinate frame —
the same kind of nested setup Lesson 5 first raised for plain origins,
now with a second matrix instead of a second offset. Before anything new,
build a second matrix for this second level, and see what it takes to
convert a fixture-space point all the way to machine coordinates using
only what Lesson 14 already built.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–14.
- **Files affected:** `geometry_lesson_15.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

table_to_machine_matrix = (
    (1, 0, 100),
    (0, 1, 200),
    (0, 0, 1),
)


def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


feature_in_fixture_h = (3, 4, 1)

feature_in_table_h = apply_matrix(fixture_to_table_matrix, feature_in_fixture_h)
feature_in_machine_h = apply_matrix(table_to_machine_matrix, feature_in_table_h)

print(feature_in_table_h)
print(feature_in_machine_h)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every construct above already received full
treatment in Lesson 14 — the nested-tuple matrix literal, `dot3`, and
`apply_matrix` are all retyped unchanged. No new Python construct appears
in this unit, so no isolated throwaway lab is needed; what's new here is
the *arrangement* — calling `apply_matrix` a second time on the first
call's own output — not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `fixture_to_table_matrix = ( (0, -1, 50), (1, 0, 20), (0, 0, 1) )` —
  Lesson 14's own `transform_matrix`, for the identical fixture-on-table
  setup, retyped as a literal instead of built from separate origin and
  axis variables. Same matrix, same meaning: fixture coordinates in, table
  coordinates out.
- `table_to_machine_matrix = ( (1, 0, 100), (0, 1, 200), (0, 0, 1) )` —
  a new matrix, built the same way (no new construct — a literal nested
  tuple, same as above), representing a second, outer frame: the table
  itself sits at `(100, 200)` in the machine's own coordinate system,
  with its axes running the same direction as the machine's — no rotation
  at this second level, chosen deliberately so the arithmetic below stays
  easy to check by hand.
- `def dot3(a, b): ...`, `def apply_matrix(matrix, point_h): ...` —
  Lesson 14's own functions, retyped unchanged. No re-explanation owed
  for their mechanics, per the Repetition Rule.
- `feature_in_fixture_h = (3, 4, 1)` — Lesson 14's own homogeneous point,
  retyped, so this lesson's result can be checked against Lesson 14's
  already-verified numbers at the first link of the chain.
- `feature_in_table_h = apply_matrix(fixture_to_table_matrix,
  feature_in_fixture_h)` — the first link: fixture coordinates converted
  to table coordinates, exactly Lesson 14's Concept Unit 3 computation,
  reused unchanged.
- `feature_in_machine_h = apply_matrix(table_to_machine_matrix,
  feature_in_table_h)` — first appearance of **chaining two matrix
  applications**: the *output* of the first `apply_matrix` call becomes
  the *input* point of the second one. This is the same link-by-link idea
  Lesson 5 first raised for plain origins — walk one conversion, then
  walk the next, using the first result as the second step's starting
  point — now expressed as two matrix applications instead of two
  informal coordinate additions.
- The two `print(...)` calls — already-basic.

### CS Lens

Converting a point through two separately-defined coordinate frames, one
after another, is the general pattern behind every **chain of coordinate
frames** — a concept substantial enough to be worth tracing beyond this
lesson's own fixture-and-table example.

```
Also recognized in: robot kinematics (a robot arm's tool tip position is
found by walking through one frame per joint — base to shoulder, shoulder
to elbow, elbow to wrist, wrist to tool — exactly this lesson's chain,
just longer), 3D scene graphs (Three.js, Unity, and Unreal all place a
child object by walking from its own local frame, through its parent's
frame, up to the top-level scene frame), and CAD assembly trees (a bolt
hole's true position, buried inside a sub-assembly inside another
sub-assembly, is only known once every level's own placement has been
walked through, one frame at a time)
```

### SE Lens

The design principle is **keeping each frame independently defined**,
rather than flattening the whole setup into one frame from the start. The
alternative not chosen: skip separate `fixture_to_table_matrix` and
`table_to_machine_matrix` values entirely, and hand-compute a single
fixture-to-machine relationship directly, the way it might be measured on
a real machine with a single edge-finder pass.

That alternative would avoid the two-call chain this unit just built
entirely. The real cost it pays: if the table ever moves independently of
the fixture — a common real event, since fixtures get repositioned on a
table far more often than a machine's own frame changes — a single
flattened relationship has to be re-measured and re-derived from scratch.
Two separate matrices mean only the one that actually changed needs
updating; the other keeps working unmodified. The real cost *this
lesson's* approach pays instead: every point conversion now costs two
full `apply_matrix` calls instead of one, every single time — a cost the
next two units remove without giving up the two-matrix modularity that
motivated it.

### Commands Needed

`python geometry_lesson_15.py` — same interpreter and command as every
prior lesson.

### Run It

```
(46, 23, 1)
(146, 223, 1)
```

Verified by actually running the file above. `(46, 23, 1)` matches Lesson
14's own verified result for this exact fixture-to-table conversion
exactly.

### Connection

Chaining two `apply_matrix` calls works, and produces `(146, 223, 1)` —
but it cost two full operations to get there, and would cost two again
for the next point, and the next. The remaining units build a way to pay
that cost only once.

---

## Concept Unit: Columns — Reading a Row-Major Matrix the Other Way

### The Problem

Combining `fixture_to_table_matrix` and `table_to_machine_matrix` into
one matrix, the way the next unit needs, will require measuring a *row*
of one matrix against a *column* of the other — the same row-against-something
idea `apply_matrix` already uses, just against a column instead of a
point. But both matrices here are stored row by row: `matrix[0]`,
`matrix[1]`, and `matrix[2]` are each a whole row, ready to use directly.
Nothing about this storage hands back a column the same easy way — one
has to be built, by reading the same position out of every row in turn.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_15.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(feature_in_machine_h)` line
  added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `table_to_machine_matrix`.

### The New Code

```python
def get_column(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])


print(get_column(table_to_machine_matrix, 2))
```

### The Updated Project

```python
fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

table_to_machine_matrix = (
    (1, 0, 100),
    (0, 1, 200),
    (0, 0, 1),
)


def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


feature_in_fixture_h = (3, 4, 1)

feature_in_table_h = apply_matrix(fixture_to_table_matrix, feature_in_fixture_h)
feature_in_machine_h = apply_matrix(table_to_machine_matrix, feature_in_table_h)

print(feature_in_table_h)
print(feature_in_machine_h)


def get_column(matrix, col_index):                                       # ← new
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])  # ← new


print(get_column(table_to_machine_matrix, 2))                            # ← new
```

The file now has a way to read a matrix in the direction it isn't
naturally stored — a row is already a direct lookup, `matrix[i]`; a
column now costs one function call, `get_column(matrix, j)`.

*A note on method:* `get_column` uses only already-covered indexing —
`matrix[0][col_index]` is the same nested-tuple indexing Lesson 14's own
isolated lab proved, just with `col_index` supplied by a variable instead
of typed as a literal. Indexing with a variable is the same underlying
operation as indexing with a literal — the position just comes from
wherever the variable's value came from instead of being written out by
hand — so no new Python construct is introduced here, and no isolated
lab is needed; what's new is the *idea* of a column, not any new syntax
for reaching it.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def get_column(matrix, col_index): ...` — a new function, taking a
  whole matrix and a position rather than a literal row or column.
- `return (matrix[0][col_index], matrix[1][col_index],
  matrix[2][col_index])` — three nested-indexing expressions, each
  reading the *same* position (`col_index`) out of a *different* row
  (`matrix[0]`, `matrix[1]`, `matrix[2]`), bundled into one new tuple via
  already-basic tuple construction. This new tuple — one value taken from
  each row, all at the same position — is exactly what this lesson calls
  a **column**: not something the storage format hands back directly,
  the way a row is, but something assembled by reading across it.
- `print(get_column(table_to_machine_matrix, 2))` — calling the new
  function on the real matrix built in Concept Unit 1, asking for column
  index `2` — the *last* column, which turns out to hold `(100, 200, 1)`,
  the origin values, exactly the numbers that made the second
  `apply_matrix` call in Concept Unit 1 add `100` and `200` to the point
  passing through it.

### CS Lens

Whether data is naturally read "by row" or "by column" — and what it
costs to read it the other way — is the row-major vs. column-major
storage question, a genuinely recurring systems idea, not just a detail
of this lesson's matrices.

```
Also recognized in: NumPy and most scientific computing libraries
(row-major "C order" is the default, with an explicit column-major
"Fortran order" available, because which direction is fast depends
entirely on which direction code reads most often), image processing (a
bitmap is stored row by row, but many filters — blurring, edge detection
— need to read down a column of pixels, requiring exactly this kind of
"assemble one value from each row" access), and database engines (a
row-oriented database like Postgres stores one whole record together,
while a column-oriented format like Parquet stores one whole field
together across every record — the same row-vs-column tradeoff this
lesson's matrix just hit, at a much larger scale)
```

### SE Lens

The design principle is **storing data in whichever shape suits the more
common operation, and paying a small conversion cost for the less common
one**, rather than storing the same data twice in two shapes. The
alternative not chosen: keep a second copy of every matrix, already
transposed into column-major form, so `get_column` would never be needed.

That alternative would make every column lookup as direct as a row lookup
already is. The real cost it pays: two copies of the same matrix have to
be kept in sync by hand — if `table_to_machine_matrix` were ever updated
in its row-major form but the column-major copy forgotten, the two would
silently disagree, and nothing would signal the mismatch. One
storage format plus a small, always-correct conversion function
guarantees there is only one true copy to ever get out of sync.

### Commands Needed

`python geometry_lesson_15.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(46, 23, 1)
(146, 223, 1)
(100, 200, 1)
```

Verified by actually running the updated file above.

### Connection

Rows were already available directly; columns are now available on
demand. Both halves of a matrix-matrix multiply are ready — the next
unit combines them.

---

## Concept Unit: Matrix-Matrix Multiplication — Composing Two Frames Into One

### The Problem

Concept Unit 1's chain works, but it costs two `apply_matrix` calls for
every single point, forever — even though `fixture_to_table_matrix` and
`table_to_machine_matrix` themselves never change between points. Build
one matrix that already represents "fixture straight to machine," so that
every future point only needs one `apply_matrix` call, not two.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_15.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(get_column(...))` line added in
  Concept Unit 2.
- **Dependencies:** Concept Unit 1's two matrices and `apply_matrix`,
  Concept Unit 2's `get_column`.

### The New Code

```python
def multiply_matrices(a, b):
    b_col0 = get_column(b, 0)
    b_col1 = get_column(b, 1)
    b_col2 = get_column(b, 2)
    row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))
    row1 = (dot3(a[1], b_col0), dot3(a[1], b_col1), dot3(a[1], b_col2))
    row2 = (dot3(a[2], b_col0), dot3(a[2], b_col1), dot3(a[2], b_col2))
    return (row0, row1, row2)


fixture_to_machine_matrix = multiply_matrices(table_to_machine_matrix, fixture_to_table_matrix)
print(fixture_to_machine_matrix)

feature_in_machine_h_direct = apply_matrix(fixture_to_machine_matrix, feature_in_fixture_h)
print(feature_in_machine_h_direct)
```

### The Updated Project

```python
fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

table_to_machine_matrix = (
    (1, 0, 100),
    (0, 1, 200),
    (0, 0, 1),
)


def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


feature_in_fixture_h = (3, 4, 1)

feature_in_table_h = apply_matrix(fixture_to_table_matrix, feature_in_fixture_h)
feature_in_machine_h = apply_matrix(table_to_machine_matrix, feature_in_table_h)

print(feature_in_table_h)
print(feature_in_machine_h)


def get_column(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])


print(get_column(table_to_machine_matrix, 2))


def multiply_matrices(a, b):                                             # ← new
    b_col0 = get_column(b, 0)                                            # ← new
    b_col1 = get_column(b, 1)                                            # ← new
    b_col2 = get_column(b, 2)                                            # ← new
    row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))  # ← new
    row1 = (dot3(a[1], b_col0), dot3(a[1], b_col1), dot3(a[1], b_col2))  # ← new
    row2 = (dot3(a[2], b_col0), dot3(a[2], b_col1), dot3(a[2], b_col2))  # ← new
    return (row0, row1, row2)                                            # ← new


fixture_to_machine_matrix = multiply_matrices(table_to_machine_matrix, fixture_to_table_matrix)  # ← new
print(fixture_to_machine_matrix)                                         # ← new

feature_in_machine_h_direct = apply_matrix(fixture_to_machine_matrix, feature_in_fixture_h)  # ← new
print(feature_in_machine_h_direct)                                       # ← new
```

The file now demonstrates both methods side by side: Concept Unit 1's
two-call chain, and this unit's single combined-matrix call, on the exact
same starting point.

*A note on method:* `multiply_matrices` is built entirely from
already-covered syntax — function definitions, indexing, tuple
construction — plus `get_column` and `dot3`, both already given full
treatment earlier in this lesson and Lesson 14. No new Python construct
appears here; what's new is the mathematical operation these familiar
pieces are arranged to perform, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def multiply_matrices(a, b): ...` — first appearance: a function that
  takes two whole matrices and returns a third.
- `b_col0 = get_column(b, 0)`, `b_col1 = get_column(b, 1)`, `b_col2 =
  get_column(b, 2)` — Concept Unit 2's own function, reused unchanged, no
  re-explanation owed per the Repetition Rule, called three times to pull
  all three of `b`'s columns up front, before any multiplication happens.
- `row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))` —
  first appearance of the actual multiplication rule: `a`'s row 0,
  measured against each of `b`'s three columns in turn using `dot3`
  (Lesson 7 and 14's own function, reused unchanged), produces the three
  entries of the *output's* row 0. Each `dot3` call answers the same
  question Lesson 14 already established — "how much of this column lines
  up with this row" — just repeated once per output entry instead of
  once per whole point.
- `row1 = (...)`, `row2 = (...)` — the identical pattern against `a`'s
  rows 1 and 2, already explained by the line above.
- `return (row0, row1, row2)` — already-basic tuple construction,
  bundling the three computed rows into a new nested tuple — proving the
  *output* of multiplying two matrices is itself a matrix, the same shape
  as either input, ready to be handed to `apply_matrix`, or even back
  into `multiply_matrices` again for a third frame.
- `fixture_to_machine_matrix = multiply_matrices(table_to_machine_matrix,
  fixture_to_table_matrix)` — already-basic function call, but the
  **argument order matters**: `table_to_machine_matrix` first,
  `fixture_to_table_matrix` second, matching the order Concept Unit 1's
  two `apply_matrix` calls actually happened in — `table_to_machine` was
  applied *second*, to the *result* of `fixture_to_table`. Getting this
  order backwards produces a different, silently wrong matrix — this
  lesson's own closing section proves exactly how wrong.
- `print(fixture_to_machine_matrix)` — already-basic.
- `feature_in_machine_h_direct = apply_matrix(fixture_to_machine_matrix,
  feature_in_fixture_h)` — Lesson 14's own function, reused unchanged,
  called once on the freshly combined matrix — doing in a single call
  what took two separate calls in Concept Unit 1.
- `print(feature_in_machine_h_direct)` — already-basic.

### CS Lens

Combining two transforms into one, so that "do this, then that" becomes a
single precomputed operation, is the mathematical foundation behind every
real system that resolves nested placement.

```
Also recognized in: robot forward kinematics (each joint's own local
transform matrix gets multiplied together, in joint order, into one
matrix mapping straight from the tool tip to world coordinates), 3D
scene graphs (Three.js, Unity, and Unreal each cache a "world matrix" per
object by multiplying its own local matrix by its parent's already-computed
world matrix — this exact operation, run once per object per frame), and
CAD assembly trees (a bolt hole's position, nested inside a sub-assembly
inside another sub-assembly, is resolved by multiplying every level's
placement matrix together into one, replacing this lesson's own two-level
fixture/table/machine chain with an arbitrarily long one)
```

### SE Lens

The design principle is **precomputing a composed result once, instead of
repeating a chain of operations on every use**. The alternative not
chosen is Concept Unit 1's own approach: call `apply_matrix` twice, every
single time a fixture-to-machine conversion is needed.

That alternative isn't unreasonable when only a handful of points ever
need converting — building `fixture_to_machine_matrix` costs one extra
`multiply_matrices` call and one more named value to keep track of,
overhead that wouldn't pay for itself for a single point. The real cost
Concept Unit 1's approach pays as the number of points grows: a CAD
system converting a tool path with thousands of points would repeat both
matrix-application steps thousands of times, even though
`fixture_to_table_matrix` and `table_to_machine_matrix` themselves never
change between points. Composing them once and reusing the single result
for every point removes exactly that redundant, repeated work — the same
tradeoff Lesson 13's SE Lens made about one implementation vs. several,
now about *when* work gets repeated instead of *where* it lives.

### Commands Needed

`python geometry_lesson_15.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(46, 23, 1)
(146, 223, 1)
(100, 200, 1)
((0, -1, 150), (1, 0, 220), (0, 0, 1))
(146, 223, 1)
```

Verified by actually running the updated file above. The final line,
`(146, 223, 1)`, matches Concept Unit 1's `feature_in_machine_h` exactly —
the two-call chain and the single combined-matrix call agree completely.

### Connection

Both methods now exist in the same file, on the same starting point, and
produced the identical answer: `(146, 223, 1)`. That agreement is this
lesson's own proof, not just an assertion — traced fully in Connect the
Pieces below.

---

## Connect the Pieces

One concrete value, traced through both methods this lesson built, start
to finish:

1. `feature_in_fixture_h = (3, 4, 1)` — the same homogeneous point used
   throughout Lesson 14.
2. **Method A (link by link):**
   `apply_matrix(fixture_to_table_matrix, feature_in_fixture_h)` gives
   `(46, 23, 1)` — Lesson 14's own already-verified result. Then
   `apply_matrix(table_to_machine_matrix, (46, 23, 1))` gives `(146, 223,
   1)` — the table's origin, `(100, 200)`, added on top.
3. **Method B (compose first):** `multiply_matrices(table_to_machine_matrix,
   fixture_to_table_matrix)` gives one combined matrix, `((0, -1, 150),
   (1, 0, 220), (0, 0, 1))`. Applying that single matrix to
   `feature_in_fixture_h` directly — `apply_matrix(fixture_to_machine_matrix,
   (3, 4, 1))` — gives `(146, 223, 1)`.
4. Both methods land on the identical answer, `(146, 223, 1)`, from the
   identical starting point — proving, in matrix form, exactly what
   Lesson 5 first proved for plain origins: walking a chain of frames one
   link at a time, and combining every link into one frame first, are two
   routes to the same destination.

## What Breaks Without This

Concept Unit 3's own walkthrough flagged that `multiply_matrices`'s
argument order matters — `table_to_machine_matrix` first,
`fixture_to_table_matrix` second, matching the order the two frames are
actually nested in. Swap that order and check what happens:

```python
fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

table_to_machine_matrix = (
    (1, 0, 100),
    (0, 1, 200),
    (0, 0, 1),
)


def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


def get_column(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])


def multiply_matrices(a, b):
    b_col0 = get_column(b, 0)
    b_col1 = get_column(b, 1)
    b_col2 = get_column(b, 2)
    row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))
    row1 = (dot3(a[1], b_col0), dot3(a[1], b_col1), dot3(a[1], b_col2))
    row2 = (dot3(a[2], b_col0), dot3(a[2], b_col1), dot3(a[2], b_col2))
    return (row0, row1, row2)


feature_in_fixture_h = (3, 4, 1)

correct_order = multiply_matrices(table_to_machine_matrix, fixture_to_table_matrix)
reversed_order = multiply_matrices(fixture_to_table_matrix, table_to_machine_matrix)

print(apply_matrix(correct_order, feature_in_fixture_h))
print(apply_matrix(reversed_order, feature_in_fixture_h))
```

```
(146, 223, 1)
(-154, 123, 1)
```

Verified by actually running this. Swapping the two arguments to
`multiply_matrices` doesn't crash, and doesn't raise any error at all — it
silently produces `(-154, 123, 1)`, a completely different, wrong point,
using the exact same two source matrices and the exact same starting
`feature_in_fixture_h`. **Matrix multiplication is not commutative** —
`multiply_matrices(a, b)` and `multiply_matrices(b, a)` are, in general,
two genuinely different matrices, not two ways of writing the same thing.
This matters because nothing about calling `multiply_matrices(a, b)` looks
wrong on its own; the bug only shows up as a silently incorrect
real-world position, exactly the kind of mistake that, on an actual CNC
machine, would place a cut in the wrong physical location without any
error ever being raised.

## Exercises

1. Add a third frame — a `machine_to_room_matrix`, representing the
   machine's own placement inside a larger room or work-cell coordinate
   system — and compose all three matrices into one
   `fixture_to_room_matrix` using two `multiply_matrices` calls. Confirm
   it produces the same result as applying all three original matrices to
   `feature_in_fixture_h` one at a time, link by link.
2. Using `get_column`, extract and print all three columns of
   `fixture_to_table_matrix`, one at a time. Explain, in your own words,
   which column holds the x-axis, which holds the y-axis, and which holds
   the origin — tying back to how Lesson 14 built the matrix's *rows*
   from those same three tuples.
3. Predict, then verify, what `multiply_matrices(fixture_to_table_matrix,
   fixture_to_table_matrix)` computes — the fixture-to-table matrix
   multiplied by itself. What real-world transformation would applying
   *that* matrix to a point represent?

## Definition of Done

- [ ] `geometry_lesson_15.py` exists and runs with no errors via `python
      geometry_lesson_15.py`.
- [ ] Running it prints `(46, 23, 1)`, `(146, 223, 1)`, `(100, 200, 1)`,
      `((0, -1, 150), (1, 0, 220), (0, 0, 1))`, then `(146, 223, 1)` —
      matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why
      `feature_in_machine_h` (Concept Unit 1) and
      `feature_in_machine_h_direct` (Concept Unit 3) come out identical
      despite being computed two completely different ways.
- [ ] You can explain why `multiply_matrices(a, b)` and
      `multiply_matrices(b, a)` are not the same, using this lesson's own
      verified `(146, 223, 1)` vs. `(-154, 123, 1)` numbers.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Compose chained transforms into one matrix instead of applying each link separately"`,
      not `git commit -m "add multiply_matrices"`.

Next: Lesson 16 — Inverse Transformations, where the question flips: given
a point already in machine coordinates, and the matrix that produced it,
recover the original fixture-space point it came from.
