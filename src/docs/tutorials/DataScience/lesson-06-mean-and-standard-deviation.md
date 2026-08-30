# Lesson 6: One Number to Summarize Many — Mean and Spread

## What you will build

`datatools.py` gains three new summary values for the size column:
its **mean** (the single number that best represents "a typical
size"), its **standard deviation** (a single number capturing how
spread out the sizes are around that mean), and a **standardized**
version of the whole column — every size rewritten as "how many
standard deviations above or below average," a rescaling used
throughout the Hands-On Machine Learning book before feeding numeric
features into most learning algorithms. The transferable problem this
lesson is actually about: a dataset with even a handful of rows is
already too much to hold in your head as a list of individual numbers,
and "the mean" and "the standard deviation" are the two single numbers
that compress an entire column down to "roughly what value, and how
much do individual values typically differ from it" — the two
questions almost every later statistical or machine learning technique
in this curriculum will build on.

## What you need to know first

Lesson 1's vectorized arithmetic with `*`, Lesson 2's `.shape` and
column slicing with `houses[:, 0]`, and Lesson 4's broadcasting a
scalar across an array with `+` — this lesson computes new scalar
summaries from `houses[:, 0]` and broadcasts them back across that
same column, reusing exactly those tools rather than introducing new
arithmetic machinery.

## Terms used in this lesson

- **mean** — the sum of a collection of numbers divided by how many
  numbers there are; commonly called "the average." It exists as the
  standard way to answer "what's one representative number for this
  whole collection?" when every value should count equally toward that
  answer.
- **deviation** — how far a single value sits from the mean of its own
  collection — computed as that value minus the mean, so a value above
  the mean gives a positive deviation and a value below it gives a
  negative one. It exists as the building block for measuring spread:
  before asking "how spread out is this data, overall," you first need
  "how far is each individual value from the middle."
- **variance** — the mean of the squared deviations of a collection —
  square every deviation first (so negative and positive deviations
  can't cancel each other out when averaged), then average those
  squared values. It exists as a single number summarizing "how spread
  out, overall" a collection is, in squared units of whatever the
  original data measured.
- **standard deviation** — the square root of the variance, undoing
  the squaring step and returning spread to the same units the
  original data was measured in. It exists because variance, on its
  own, is in squared units — "square feet squared," for this lesson's
  size data — which isn't directly comparable to the original values;
  taking the square root converts that spread measure back into
  plain, comparable units.
- **standardization** — rescaling every value in a collection by
  subtracting that collection's mean and dividing by its standard
  deviation, producing a new collection whose own mean is `0` and
  whose own standard deviation is `1`. It exists because raw features
  measured in different units and scales — house size in the
  thousands, bedroom count in single digits — can distort many
  learning algorithms that implicitly treat larger raw numbers as more
  important; standardizing puts every feature on the same, comparable
  scale before that happens.

## Objects and methods used

### `ndarray.mean`

- **What it is:** a method on every `ndarray` instance that computes
  the mean of every element in the array.
- **Implementation:** `ndarray.mean() -> numpy.float64` (for a 1D
  array; a 2D array without further arguments averages every element
  across the whole array, not per row or column). Equivalent to, and
  computed the same way as, `array.sum() / len(array)`.
- **Its use:** it's how this lesson computes "the average house size"
  from `houses[:, 0]`, as one number rather than by hand-writing the
  sum-then-divide formula every time.
- **Type:** an instance method — called with parentheses on an
  already-existing `ndarray` — as opposed to `.shape` or `.dtype` from
  earlier lessons, which are attributes with no parentheses; `.mean()`
  performs a real computation each time it's called rather than
  reading back an already-stored value.
- **Responsibility:** sum every element of the array it's called on
  and divide that sum by the count of elements, returning the single
  resulting number — it is not responsible for handling an empty
  array meaningfully (that produces `nan`, "not a number," rather than
  an error) or for anything about the data's spread, only its central
  value.
- **Depends on:** an already-constructed `ndarray` with at least one
  element to average.
- **Connects to:** called directly on `houses[:, 0]` in this lesson's
  own code; its return value feeds directly into the deviation and
  standardization computations later in the same lesson.
- **Shape:** part of every `ndarray`'s core public interface — the
  same method every later lesson computing an average from real data
  will reach for.

### `ndarray.std`

- **What it is:** a method on every `ndarray` instance that computes
  the standard deviation of every element in the array.
- **Implementation:** `ndarray.std() -> numpy.float64`. Internally
  equivalent to computing every element's deviation from the array's
  own mean, squaring each deviation, averaging those squared values
  (the variance), and taking the square root of that average.
- **Its use:** it's how this lesson computes "how spread out are house
  sizes" as one number, without manually chaining the deviation,
  squaring, averaging, and square-root steps by hand every time —
  though this lesson's first Concept Unit does chain them by hand once,
  specifically to prove `.std()` performs that exact sequence.
- **Type:** an instance method, called with parentheses, the same
  category as `.mean()` above — a real computation performed on
  demand, not a stored attribute.
- **Responsibility:** compute the array's own mean internally, measure
  every element's squared distance from it, average those squared
  distances, and return the square root of that average as a single
  number — it is not responsible for computing the mean as a
  separately usable value; that's `.mean()`'s own, separate job, even
  though `.std()` computes a mean internally to do its own job.
- **Depends on:** an already-constructed `ndarray` with at least one
  element.
- **Connects to:** called directly on `houses[:, 0]` in this lesson's
  own code, alongside `.mean()`; both return values feed into the
  standardization computation in the final Concept Unit.
- **Shape:** part of every `ndarray`'s core public interface, alongside
  `.mean()` — the standard way this curriculum, and most later NumPy
  code touching real data, measures spread.

---

## Concept Unit: The Mean

### The Problem

`houses[:, 0]`, from Lesson 2, holds four house sizes: `1400`, `1850`,
`900`, `2200`. Describing "how big are these houses, roughly?" by
listing all four numbers works fine for four houses, but stops working
the moment there are four hundred or four thousand — no one can hold
that many individual values in their head at once, and a single
representative number is needed instead.

Using only what you already know — `.sum()` on an array (used
implicitly inside the dot product back in Lesson 4) and Python's own
`len()` — how would you compute one number representing "a typical
size" from `houses[:, 0]`? Try writing that expression, using earlier
lessons' tools only, before reading on.

### Isolated Example

```python
>>> import numpy as np
>>> values = np.array([2, 4, 6, 8])
>>> values.sum() / len(values)
5.0
>>> values.mean()
5.0
>>> np.mean(values)
5.0
```

Run for real, this session:

```
>>> import numpy as np
>>> values = np.array([2, 4, 6, 8])
>>> values.sum() / len(values)
5.0
>>> values.mean()
5.0
>>> np.mean(values)
5.0
```

This proves `.mean()` computes exactly the same value as manually
summing and dividing by the count — `(2 + 4 + 6 + 8) / 4 = 5.0` — and
that both the method form (`values.mean()`) and the free-function form
(`np.mean(values)`) agree. This is called the **mean**, defined under
Terms, above. This `values` example is discarded now; it exists only
to prove `.mean()` matches the sum-then-divide definition, and it will
not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 5's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `plt.savefig('house_price_plot.png')`,
  added in Lesson 5's third Concept Unit.
- **Dependencies:** `houses`, already built in Lesson 4; no new
  packages.

### The New Code

```python
size_mean = houses[:, 0].mean()
```

### The Updated Project

This is a self-contained addition — one new line reusing an array
already built earlier in the file — so the whole new block is:

```
1  size_mean = houses[:, 0].mean()
```

As a whole, this line pulls the size column back out of `houses` using
Lesson 2's column-slicing syntax, and immediately computes its mean —
no intermediate variable holding the column on its own, since nothing
else in this unit needs it yet.

### Mechanical Walkthrough

- **`houses[:, 0]`** — the column-slicing syntax explained in full in
  Lesson 2 and, per the Repetition Rule, restated here: a bare `:` in
  the row position selects every row, and `0` in the column position
  selects only the size column, returning a new one-dimensional array
  of the four house sizes.
- **`.mean()`** — the method explained in full under Objects and
  methods, above: called on that one-dimensional array, it sums all
  four sizes and divides by `4`, returning a single `numpy.float64`
  value — the mean.
- **`size_mean = ...`** — assignment, already-familiar syntax, binding
  the name `size_mean` to that single number.

### CS Lens

The mean is the simplest instance of a **measure of central
tendency** — a single value meant to represent "the middle" or "the
typical value" of a whole collection. The same underlying goal —
compress many values into one representative number — recurs, with
different rules for what counts as "representative," in a median (the
middle value when sorted, less sensitive to a few extreme outliers
than a mean), a mode (the single most frequent value), and a weighted
average (a mean where some values count more than others) — all
answering the same question, "what's typical here?", with different
tradeoffs about which values pull that answer around.

### SE Lens

The alternative not chosen here is exactly what the Socratic prompt
above invited you to write: `houses[:, 0].sum() / len(houses[:, 0])`,
computed by hand every time a mean is needed. That version is correct
and produces the identical number, proven in the isolated example
above. `.mean()` costs nothing extra to use and gains real safety:
NumPy's own internal implementation is the single, tested source of
truth for "how a mean is computed," while a hand-written
`sum() / len()` repeated across many places in a larger project risks
a subtle bug creeping into just one of those repetitions — a
`len()` computed on the wrong array, for instance — that a single,
reused `.mean()` call structurally can't have.

### Commands Needed

None new — `numpy` is already installed from Lesson 1.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])
>>> houses[:, 0].mean()
1587.5
```

`1587.5` — `(1400 + 1850 + 900 + 2200) / 4` — confirming the mean
matches the sum-then-divide computation proven in the isolated
example, applied here to the real size column.

### Connection

This unit compressed four house sizes into one representative number.
The next unit measures something the mean alone can't: how far, on
average, the real sizes actually stray from that number.

---

## Concept Unit: Standard Deviation

### The Problem

`size_mean`, from the previous unit, says "a typical house here is
about 1587.5 square feet" — but that single number can't distinguish
between a dataset where every house is close to 1587.5 square feet and
one where houses are wildly different sizes that just happen to
average out to the same number. Two very different-looking datasets
can share an identical mean; something else is needed to capture how
spread out the actual values are around it.

Given `size_mean` from the previous unit, and given that Lesson 4
already proved `array - scalar` broadcasts a single number across
every element (the same rule proven there for `+`), what do you
predict `houses[:, 0] - size_mean` produces — one number, or one
result per house? And once you have that per-house result — each
house's distance from the mean, some presumably negative, some
positive — what problem would you run into if you tried to average
those distances directly, without changing them first, to get "the
typical distance from the mean"?

### Isolated Example

```python
>>> import numpy as np
>>> values = np.array([2, 4, 6, 8])
>>> mean = values.mean()
>>> deviations = values - mean
>>> deviations
array([-3., -1.,  1.,  3.])
>>> deviations.mean()
0.0
```

Run for real, this session:

```
>>> import numpy as np
>>> values = np.array([2, 4, 6, 8])
>>> mean = values.mean()
>>> deviations = values - mean
>>> deviations
array([-3., -1.,  1.,  3.])
>>> deviations.mean()
0.0
```

This proves two things. First, `values - mean` broadcasts the single
scalar `mean` across every element, per the broadcasting rule proven
in Lesson 4 — each result is that value's **deviation**, defined under
Terms, above. Second, and critically, averaging the raw deviations
directly gives `0.0` — always, for any data — because the positive and
negative deviations exactly cancel out; a mean of `0.0` says nothing
about how spread out the data actually is. Continue this same example,
run for real, this session:

```
>>> squared = deviations ** 2
>>> squared
array([9., 1., 1., 9.])
>>> variance = squared.mean()
>>> variance
5.0
>>> np.sqrt(variance)
2.23606797749979
>>> values.std()
2.23606797749979
```

Squaring every deviation first — `**`, an already-familiar Python
operator for exponentiation, applied here with broadcasting the same
way `*` and `-` were — makes every value positive before averaging, so
they can no longer cancel; that average of squared deviations is the
**variance**, defined under Terms, above. Taking its square root
returns the result to the original units, giving the **standard
deviation**, and `values.std()` confirms it computes that identical
number directly. This `values` example is discarded now; it exists
only to prove `.std()` performs exactly this deviation-square-average-
root sequence, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `size_mean = houses[:, 0].mean()`,
  added in the previous unit.
- **Dependencies:** `houses`, already built in Lesson 4.

### The New Code

```python
size_std = houses[:, 0].std()
```

### The Updated Project

`datatools.py`'s statistics block now reads, in full:

```
1  size_mean = houses[:, 0].mean()
2  size_std = houses[:, 0].std()   # ← new
```

As a whole, this block now computes both summary numbers this lesson
set out to build for the size column: its mean and its standard
deviation.

### Mechanical Walkthrough

- **`houses[:, 0]`** — the column-slicing syntax, explained in full in
  Lesson 2 and restated per the Repetition Rule throughout this
  lesson already: every row, column `0`, returning the size column.
- **`.std()`** — the method explained in full under Objects and
  methods, above: internally computes the array's own mean, every
  element's deviation from it, squares each deviation, averages the
  squared values (the variance), and returns the square root of that
  average — exactly the sequence proven step by step in the isolated
  example, here performed on the real size column in one call.
- **`size_std = ...`** — assignment, already-familiar syntax, binding
  the name `size_std` to that single number.

### CS Lens

Squaring deviations before averaging them — rather than, say, taking
their absolute value instead — is a specific, deliberate choice with
consequences beyond just "making them positive": squaring weighs
larger deviations disproportionately more than smaller ones (a
deviation of `4` contributes `16` to the sum, while a deviation of `2`
contributes only `4` — four times as much for only twice the
distance), which makes standard deviation especially sensitive to
outliers, values far from the rest of the data. This tradeoff recurs
throughout statistics and machine learning: the same "sum of squared
errors" pattern shows up in linear regression's own loss function
(the thing Lesson 4's dot-product model would eventually be trained to
minimize), and understanding *why* squaring is used, rather than just
that it is, is exactly this kind of recognition.

### SE Lens

The alternative not chosen here — visible directly in this unit's own
Socratic prompt — is averaging the raw deviations, or their absolute
values, instead of their squares. Averaging raw deviations, proven
above, always gives exactly `0`, useless as a spread measure — that
option is disqualified outright, not merely inferior. Averaging
absolute deviations (a real, named alternative called *mean absolute
deviation*) avoids standard deviation's outlier-sensitivity, at the
cost of losing several convenient mathematical properties standard
deviation has that make it easier to reason about combined uncertainty
across multiple variables — properties this curriculum doesn't need
yet, but which are the real reason standard deviation, not mean
absolute deviation, became the default spread measure across
statistics and machine learning.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])
>>> houses[:, 0].std()
487.82040752719644
```

`487.82...` square feet — confirming, via the isolated example's
step-by-step version, that this single call performs the full
deviation-square-average-root sequence on the real size data.

### Connection

This unit measured how spread out house sizes actually are around
their mean. The next unit uses both numbers together — mean and
standard deviation — to rescale the size column entirely, the last
step before real data, in a later lesson, could be fed into an actual
learning algorithm.

---

## Concept Unit: Standardization

### The Problem

`size_mean` and `size_std` describe the size column as a whole, but
the individual values in `houses[:, 0]` — `1400`, `1850`, `900`,
`2200` — are still in raw square feet, on a completely different scale
than `bedrooms`, which only ranges from `2` to `4`. Many machine
learning algorithms compare features numerically without knowing which
scale is "natural" for each one; a feature ranging in the thousands
can end up dominating a feature ranging in single digits for no reason
related to actual importance, purely because of the units it happened
to be measured in.

Given `size_mean` and `size_std`, both already computed, and given
that Lesson 4 already proved both `-` and `/` broadcast a single
scalar across an entire array — what single expression, combining
`houses[:, 0]`, `size_mean`, and `size_std`, would rescale every size
so that houses near the average size end up close to `0`, houses well
above average end up as a positive number, and houses well below
average end up as a negative number? Try writing that expression
before reading on — and consider: once every value has been rescaled
this way, what do you predict the *mean* of the rescaled column itself
would be?

### Isolated Example

```python
>>> import numpy as np
>>> values = np.array([2, 4, 6, 8])
>>> standardized = (values - values.mean()) / values.std()
>>> standardized
array([-1.34164079, -0.4472136 ,  0.4472136 ,  1.34164079])
>>> standardized.mean()
0.0
>>> standardized.std()
1.0
```

Run for real, this session:

```
>>> import numpy as np
>>> values = np.array([2, 4, 6, 8])
>>> standardized = (values - values.mean()) / values.std()
>>> standardized
array([-1.34164079, -0.4472136 ,  0.4472136 ,  1.34164079])
>>> standardized.mean()
0.0
>>> standardized.std()
0.9999999999999999
```

This proves **standardization**, defined under Terms, above:
subtracting the mean centers the data around `0` (confirmed:
`standardized.mean()` really is `0.0`), and dividing by the standard
deviation rescales it so its own spread is exactly `1` — confirmed by
`standardized.std()`, which prints `0.9999999999999999` rather than a
perfectly exact `1.0`. That's not a mistake in the formula; it's
ordinary floating-point rounding, the same imprecision that shows up
throughout numeric computing whenever a result depends on several
chained divisions and square roots — mathematically exact, and
computationally accurate to about fifteen decimal digits. This
`values` example is discarded now; it exists only to prove
standardizing a collection always produces a result with mean `0` and
standard deviation `1`, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `size_std = houses[:, 0].std()`, added
  in the previous unit.
- **Dependencies:** `houses`, `size_mean`, and `size_std`, all already
  built in this lesson and Lesson 4.

### The New Code

```python
size_standardized = (houses[:, 0] - size_mean) / size_std
```

### The Updated Project

`datatools.py`'s statistics block now reads, in full — its final
state for this lesson:

```
1  size_mean = houses[:, 0].mean()
2  size_std = houses[:, 0].std()
3  size_standardized = (houses[:, 0] - size_mean) / size_std   # ← new
```

As a whole, this block now computes the size column's mean and
standard deviation, then uses both to produce a fully standardized
version of the column — every value rescaled to say "how many standard
deviations from average," rather than raw square feet.

### Mechanical Walkthrough

- **`houses[:, 0]`** — the column-slicing syntax, restated per the
  Repetition Rule for the third time in this lesson: every row, column
  `0`, the size column.
- **`- size_mean`** — the `-` operator, ordinary already-known Python
  syntax, applied here between the one-dimensional size array and the
  single float `size_mean`. Per broadcasting, first proven for `*` in
  Lesson 1 and for `+` in Lesson 4, and restated here for `-`: the
  scalar `size_mean` is subtracted from every element independently,
  returning a new array of deviations, exactly as traced step by step
  in the previous unit's isolated example.
- **`/ size_std`** — the `/` operator (Python's true-division
  operator, distinct from `//`, which discards any remainder — not
  used anywhere in this lesson), applied here between the deviations
  array and the single float `size_std`. The same broadcasting rule
  applies again: every deviation is divided by `size_std`
  independently, returning a new array of the same shape — the
  standardized values.
- **`size_standardized = ...`** — assignment, already-familiar syntax,
  binding the name `size_standardized` to that final rescaled array.

### CS Lens

Standardization is the concrete, computed form of a more general idea
called **feature scaling** — transforming different features onto
comparable numeric ranges before comparing or combining them
mathematically. The same underlying need recurs any time raw
measurements in different units get combined: converting distances to
a common unit before adding them, normalizing test scores from
different exams onto a common scale before averaging them together,
and — directly relevant to where this curriculum is heading — nearly
every gradient-based learning algorithm the Hands-On Machine Learning
book covers, which tends to train faster and more reliably when its
input features are already on comparable scales, rather than one
feature ranging in the thousands and another in single digits.

### SE Lens

The alternative not chosen here is leaving `houses[:, 0]` in raw
square feet and `houses[:, 1]` (bedroom count) in its own raw units,
trusting whatever algorithm eventually consumes them to handle the
scale difference correctly on its own. Some algorithms genuinely don't
care about feature scale; many others — anything comparing distances
between data points, or anything trained by incrementally adjusting
weights based on each feature's numeric size — implicitly treat larger
raw numbers as more influential, for no reason connected to real
importance. The cost of standardizing preemptively, on every feature,
is a small amount of extra computation and two extra numbers
(`size_mean`, `size_std`) that have to be remembered and reapplied
identically to any new house this lesson's eventual model would need
to predict on — get that reapplication wrong, and predictions on new
data silently use the wrong scale, a mistake this curriculum will
return to directly once it reaches a real training pipeline.

### Commands Needed

None new.

### Run It

Run for real, this session:

```
>>> import numpy as np
>>> houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])
>>> size_mean = houses[:, 0].mean()
>>> size_std = houses[:, 0].std()
>>> (houses[:, 0] - size_mean) / size_std
array([-0.38436276,  0.53810787, -1.40933013,  1.25558503])
```

Four rescaled values: the smallest house (`900` sq ft) lands at
roughly `-1.41` standard deviations below average, and the largest
(`2200` sq ft) lands at roughly `1.26` above — both distances now
measured in the same units the size feature's own spread defines,
rather than raw square feet.

### Connection

This unit combined the mean and standard deviation from the previous
two units to rescale every house size onto a comparable, unitless
scale — the last of this lesson's three summary computations, and the
one most directly reused once this curriculum eventually builds a
real training pipeline on top of `houses`.

---

## Connect the Pieces

Follow the same house from Lessons 2 through 5 — size `1850`, `4`
bedrooms — through everything this lesson built, start to finish:

1. `size_mean = houses[:, 0].mean()` computes `1587.5` from all four
   houses at once, including this one's `1850` — a single number this
   house's own size contributed to, but which now describes the whole
   column, not this house individually.
2. `size_std = houses[:, 0].std()` computes `487.82...`, again from
   all four houses, measuring how spread out sizes are as a group —
   this house's own deviation from the mean, `1850 - 1587.5 = 262.5`,
   was one of the four squared values averaged to produce it.
3. `(houses[:, 0] - size_mean) / size_std` reaches this house
   specifically at position `1`: its deviation, `262.5`, divided by
   the standard deviation, `487.82...`, giving roughly `0.538` —
   confirming this house sits a little over half a standard deviation
   above the average size, a fact the raw number `1850` alone never
   stated directly.

Every value this lesson produced — the mean, the standard deviation,
and the standardized column — depended on all four houses together,
including this one; and this one house's own position in the final
standardized result, `0.538`, is now directly comparable to its
bedroom count in a way its raw size, `1850`, never was.
