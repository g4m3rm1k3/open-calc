# Lesson 239: Inverses — When a Transformation Can Be Reversed

**What you will build**: A real matrix inverse, verified by actually
multiplying it against the original matrix and getting the identity
back — not assumed correct because the formula looked right. It uses
that inverse to finally solve the problem Lesson 237 deliberately left
open: recovering a vector's basis-relative coordinates from its
standard ones. It closes by proving, concretely, that a matrix with
determinant `0` has no inverse at all, because its transformation
genuinely destroys information — two different real inputs collapsing
onto the exact same output, with nothing left to reconstruct which one
actually happened.

**What you need to know first**: Lesson 238's `determinant` — this
lesson's entire inverse formula and its own failure case are both
governed by it directly. Lesson 235's `matrix-multiply`, reused to
verify an inverse actually works. Lesson 237's basis matrix and its own
deliberately unfinished "convert standard coordinates back to basis
coordinates" problem, finally completed here.

**Terms used in this lesson**:

- **inverse** (of a matrix) — a matrix that, combined with the original
  via matrix multiplication, produces the identity matrix; the
  transformation that exactly undoes another transformation.
- **invertible** — a matrix that has a genuine inverse; true exactly
  when its determinant is nonzero.
- **singular** (matrix) — a matrix with determinant exactly `0`, and
  therefore no inverse at all; its transformation genuinely destroys
  information, mapping more than one distinct input onto the identical
  output.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`/`**
  - *What it is:* Clojure's division function, reused from its earliest
    established use in this curriculum.
  - *Implementation:* `(/ a b)` returns `a` divided by `b`; for a
    non-integer result, an exact ratio; if `b` is `0`, Clojure raises a
    real, genuine `ArithmeticException` ("Divide by zero") rather than
    returning any numeric value at all.
  - *Its use:* the inverse formula divides every entry by the
    determinant — exactly the operation that fails outright when the
    determinant is `0`.
- **`-`** (unary)
  - *What it is:* Clojure's subtraction function, called here with a
    single argument.
  - *Implementation:* `(- x)`, with only one argument, returns the
    negation of `x` — this curriculum's own arithmetic has used `-`
    with two arguments throughout; this is its first use with one.
  - *Its use:* two of the inverse formula's four entries are the
    negation of the original matrix's own off-diagonal entries.

---

## Concept Unit: The Inverse Undoes a Transformation

### The Problem

`rotate90` turns a vector `90°` counterclockwise. Is there a matrix
that turns it back — takes any vector `rotate90` has already
transformed and returns it to exactly where it started?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrix inverses are a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn matrix-inverse-with-det [m det]
  (make-matrix
    (make-vector (/ (get (matrix-row m 1) 1) det) (/ (- (get (matrix-row m 0) 1)) det))
    (make-vector (/ (- (get (matrix-row m 1) 0)) det) (/ (get (matrix-row m 0) 0) det))))

(defn matrix-inverse [m]
  (matrix-inverse-with-det m (determinant m)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def rotate90-inverse (matrix-inverse rotate90))
#'user/rotate90-inverse
user=> rotate90-inverse
[[0 1] [-1 0]]
user=> (def should-be-identity (matrix-multiply rotate90-inverse rotate90))
#'user/should-be-identity
user=> should-be-identity
[[1 0] [0 1]]
```

### Mechanical Walkthrough

For a matrix `[[a, b], [c, d]]`, the inverse formula swaps the two
diagonal entries, negates the two off-diagonal entries, and divides
everything by the determinant: `[[d/det, -b/det], [-c/det, a/det]]`.

`(defn matrix-inverse-with-det [m det] ...)` — `get` and `matrix-row`,
both reappearing, read the original matrix's own four entries.
`(- (get (matrix-row m 0) 1))` — `-`, called with a single argument for
the first time in this curriculum — negates `b`, the top-right entry;
the identical shape negates `c`, the bottom-left entry. `/`, reappearing
from this curriculum's earliest arithmetic, divides every one of the
four resulting values by `det`.

`(defn matrix-inverse [m] (matrix-inverse-with-det m (determinant m)))`
— `determinant`, reappearing from Lesson 238, computes `det` once, then
hands it to the function above, following the established "compute
once, pass to a helper" pattern this curriculum has used since Lesson
56.

Trace: `rotate90` is `[[0, -1], [1, 0]]` — `a=0, b=-1, c=1, d=0`.
`determinant` computes `1` (Lesson 238's own result). The inverse is
`[[0/1, 1/1], [-1/1, 0/1]] = [[0, 1], [-1, 0]]`. `(matrix-multiply
rotate90-inverse rotate90)` — Lesson 235's own function, reappearing —
computes `[[1, 0], [0, 1]]`, the identity matrix, exactly. The inverse
genuinely undoes the original: composed together, they do nothing at
all.

### CS Lens

An inverse is defined by exactly one requirement — `matrix-
multiply(inverse, original) = identity` — and this unit proves the
formula actually satisfies it, rather than asking it to be trusted
because it looks like a plausible generalization of ordinary
reciprocal division. This mirrors every other operation this section
has built: `vector-add` was checked against real chained displacement
(Lesson 233), `matrix-multiply` was checked against real chained
transformation (Lesson 235); an inverse earns trust the identical way,
by being checked against what "undoing" is actually defined to mean.

Also recognized in: a cipher's decryption key, defined by the one
requirement that applying it after the encryption key returns the
original message exactly; a chemical neutralization reaction, defined
by returning a solution to its original pH; a `git revert` commit,
defined specifically by the property that applying it after the commit
it targets leaves the repository's tracked content exactly as it was
before that commit.

### SE Lens

The alternative to this formula — solving, from scratch, for the four
unknown entries of a matrix `X` such that `matrix-multiply(X, m) =
identity`, by hand, every single time a specific matrix needs
inverting — would work, but the formula this unit built does that
algebra once, in general, for any `2x2` matrix, and reduces every future
case to plugging in four numbers. The real cost, made explicit by this
formula's own shape: every one of its four entries divides by `det`,
meaning the entire computation depends on one single number never being
zero — a dependency this lesson's own final unit takes seriously rather
than leaving as an unstated assumption.

---

## Concept Unit: Recovering Basis Coordinates

### The Problem

Lesson 237 built `from-basis-coords`, converting a vector's coordinates
in a chosen basis *into* standard coordinates — but deliberately never
solved the reverse: given a vector already in standard coordinates, what
were its coordinates in that other basis? Is that now answerable?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrix inverses are a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `matrix-inverse` and `matrix-
vector-multiply`, both completely unchanged. What's new is applying
them to Lesson 237's own unfinished problem.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def basis-matrix (make-basis-matrix b1 b2))
#'user/basis-matrix
user=> (determinant basis-matrix)
-2
user=> (def basis-inverse (matrix-inverse basis-matrix))
#'user/basis-inverse
user=> basis-inverse
[[1/2 1/2] [1/2 -1/2]]
user=> (def standard-vec (make-vector 3 1))
#'user/standard-vec
user=> (matrix-vector-multiply basis-inverse standard-vec)
[2N 1N]
```

### Mechanical Walkthrough

`basis-matrix`, Lesson 237's own function applied to `b1 = [1, 1]` and
`b2 = [1, -1]`, is `[[1, 1], [1, -1]]`. Its determinant is `-2` — a
nonzero, negative number (this basis, worth noting from Lesson 238's own
Unit 3, reverses orientation — `b1` to `b2` turns clockwise rather than
counterclockwise). `matrix-inverse` produces `[[1/2, 1/2], [1/2,
-1/2]]` — real, exact ratios, Clojure's own `/`, reappearing, dividing
by `-2` and simplifying.

`standard-vec = [3, 1]` — this is exactly the standard-coordinate result
Lesson 237's `from-basis-coords` produced from basis coordinates `(2,
1)`. `(matrix-vector-multiply basis-inverse standard-vec)` returns
`[2N 1N]` — worth explaining directly: the `N` suffix marks a
`BigInt`, a genuine, exact whole-number type Clojure sometimes produces
from ratio arithmetic that happens to reduce evenly (`1/2 * 3 + 1/2 * 1
= 2`, computed as exact ratios the whole way through). `2N` is not a
different or approximate value from plain `2` — `(= 2N 2)` is `true` —
just Clojure's own honest way of printing which specific exact numeric
type the computation actually produced. The real content: `[2N, 1N]`
recovers exactly the original basis coordinates, `(2, 1)`, that Lesson
237 started from — the inverse genuinely reversed the conversion.

### CS Lens

This closes a loop deliberately left open two lessons ago: converting
*into* standard coordinates from a basis was always a straightforward
matrix-vector multiplication; converting *back out* required something
Lesson 237 didn't yet have — an inverse. Recognizing which direction of
a problem is "easy" (apply a matrix directly) and which requires
genuinely new machinery (undo a matrix) is itself a real, transferable
skill, not just a fact about coordinates specifically — many real
problems have exactly this shape, an easy forward direction and a
harder, structurally different backward one.

Also recognized in: encoding a message being computationally cheap
while decoding it (without the key) being the entire premise of a
cipher's own security; compressing a file being fast while, for a lossy
format, decompression can never fully recover the original at all — a
genuine, permanent version of Unit 3's own information-loss problem;
baking a cake being straightforward while "un-baking" it back into raw
ingredients is not merely hard, it's genuinely, physically impossible.

### SE Lens

The alternative — never building a real inverse, and instead solving
each new "convert backward" problem by hand, case by case, as it comes
up — is exactly what Lesson 237 was left doing. The real payoff of
building `matrix-inverse` once, generally, is that it now solves *every*
future "given a linear transformation, recover the original input"
problem this curriculum encounters, not just this one basis-conversion
case — the same investment-once, reuse-everywhere logic behind building
`dot-product` once and reusing it through Lessons 233 to 238.

---

## Concept Unit: Singular Matrices — When Information Is Genuinely Lost

### The Problem

Does every matrix have an inverse? The formula built in Unit 1 divides
every entry by the determinant — what happens when the determinant is
`0`, and does that failure reflect something real about the
transformation itself, or just a limitation of this particular formula?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrix inverses are a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `matrix-vector-multiply`,
`determinant`, and `matrix-inverse`, all completely unchanged. What's
new is a matrix deliberately chosen to have determinant `0`.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def collapsing-matrix (make-matrix (make-vector 2 4) (make-vector 1 2)))
#'user/collapsing-matrix
user=> (determinant collapsing-matrix)
0
user=> (matrix-vector-multiply collapsing-matrix (make-vector 0 0))
[0 0]
user=> (matrix-vector-multiply collapsing-matrix (make-vector 2 -1))
[0 0]
```

Attempting the inverse formula anyway:

```
user=> (matrix-inverse collapsing-matrix)
Execution error (ArithmeticException) at java.lang.Math/divideExact (Math.java:960).
Divide by zero
```

### Mechanical Walkthrough

`collapsing-matrix` is `[[2, 4], [1, 2]]` — its second row is exactly
half its first row, chosen deliberately. `(determinant collapsing-
matrix)` computes `2*2 - 4*1 = 4 - 4 = 0`.

`(matrix-vector-multiply collapsing-matrix (make-vector 0 0))` — the
zero vector, transformed, is still `[0, 0]`, unsurprising (every linear
transformation, per Lesson 236, sends the zero vector to itself).
`(matrix-vector-multiply collapsing-matrix (make-vector 2 -1))` —
a completely different, nonzero input — also produces `[0, 0]`: `dot([2
4], [2 -1]) = 4 - 4 = 0`; `dot([1 2], [2 -1]) = 2 - 2 = 0`.

`(matrix-inverse collapsing-matrix)` raises a real `ArithmeticException`
directly from Clojure's own `/` — `det` is `0`, and every one of the
inverse formula's four entries tries to divide by it.

### CS Lens

The exception isn't a limitation of the formula that a cleverer formula
could avoid — it's the formula honestly reporting a real, structural
fact: `collapsing-matrix` genuinely has no inverse, because its
transformation is not one-to-one. Both `[0, 0]` and `[2, -1]` — two
completely different vectors — map to the identical output, `[0, 0]`.
Given only that output, there is no way to determine which of the two
(or, in fact, infinitely many others along the same line) was the real
input — the information distinguishing them is genuinely, permanently
gone, not merely hard to recover. A matrix in this state is called
**singular**, and Lesson 238's own determinant is exactly what predicts
it: a determinant of `0` means the transformation collapses the entire
plane down onto a line (or a single point), exactly the "area becomes
zero" fact Lesson 238's own closing exercise already anticipated.
`matrix-inverse`'s exception is the correct, honest response to being
asked to undo something that destroyed information — there is no
formula, clever or otherwise, that could recover data that no longer
exists anywhere in the output.

Also recognized in: a hash function, deliberately built so that many
different inputs can produce the identical output, making "reverse the
hash" genuinely impossible in general, not merely difficult; a
photograph converted to grayscale, where two originally different colors
that happened to have the same brightness become permanently
indistinguishable in the result; a rounding operation, where `2.4` and
`2.4999` both round to `2`, and no amount of cleverness recovers which
one was the real original value from the rounded result alone.

### SE Lens

The alternative — catching this exception and silently returning some
placeholder value instead of letting it propagate — would hide a
genuine, structural fact behind a plausible-looking result, exactly the
silent-failure shape this curriculum has warned against since its
earliest lessons. Letting `matrix-inverse` fail loudly and specifically
when `det` is `0` is the correct design: a caller who asks to invert a
singular matrix has made a request that cannot be honestly answered, and
an exception says so directly, at the exact moment and location of the
actual problem, rather than producing a number that looks like an
answer but corresponds to nothing real.

---

## Connect the Pieces

Follow the question "can this be undone" through every unit built in
this lesson. `rotate90` (Unit 1) can: its inverse, checked directly
against `matrix-multiply`, genuinely returns the identity — every
rotation can be undone by rotating back, and the formula proves it
rather than assuming it. Lesson 237's own basis matrix (Unit 2) can
too: its inverse, applied to the standard-coordinate vector `[3, 1]`,
recovers the exact original basis coordinates `(2, 1)` this whole
section's own earlier lesson computed forward but never reversed —
completing a loop deliberately left open two lessons ago. `collapsing-
matrix` (Unit 3) cannot: its determinant is `0`, its transformation
genuinely maps more than one real input onto the identical output, and
`matrix-inverse` correctly refuses to pretend otherwise, raising a real
exception instead of a plausible-looking wrong number. All three
outcomes trace back to the identical single number, the determinant,
first built in Lesson 238 to measure area-scaling and now shown to
answer a second, equally fundamental question: not just how much a
transformation changes size, but whether it can ever be reversed at
all.

## What Breaks Without This

Silently substitute a fallback value instead of letting the division
fail, hiding the real structural problem:

```clojure
(defn matrix-inverse-broken [m]
  (matrix-inverse-with-det m (max (determinant m) 1)))
```

```
user=> (matrix-inverse-broken collapsing-matrix)
[[2 -4] [-1 2]]
```

No exception — a real, plausible-looking matrix comes back. But it is
not a real inverse: `(matrix-multiply (matrix-inverse-broken
collapsing-matrix) collapsing-matrix)` would not produce the identity
matrix, because dividing by `1` instead of the true `0` was never a
mathematically valid substitution — it silently invented a fake
denominator rather than honestly reporting that no real one exists. A
caller trusting this result would build further computation on a matrix
that looks legitimate but corresponds to no genuine "undo" operation at
all, exactly the silent-plausible-wrong-answer failure shape this
curriculum keeps returning to. Restoring the real exception is what
correctly stops that caller before it happens.

## Exercises

1. Confirm `(matrix-multiply rotate90 rotate90-inverse)` — the *other*
   order — also produces the identity matrix, and explain in one
   sentence why both orders matching is a stronger guarantee than only
   one order matching, given Lesson 235's own proof that matrix
   multiplication doesn't generally commute.
2. Build the inverse of `scale2-1` from Lesson 238 (`[[2, 0], [0, 1]]`),
   confirm it correctly "un-stretches" `x` by a factor of `2`, and state
   in your own words why a scaling matrix's inverse is always just
   another scaling matrix, never a rotation or a reflection.
3. Find a *second* vector, besides `[2, -1]`, that `collapsing-matrix`
   also sends to `[0, 0]`, and confirm it's a scalar multiple of `[2,
   -1]` — then explain in one sentence what this says about *every*
   vector a singular `2x2` matrix collapses to zero.

## Definition of Done

- [ ] `matrix-inverse-with-det` and `matrix-inverse` both defined and
      run in a live `bb` REPL, alongside `matrix-multiply` and
      `determinant` reused from earlier lessons, matching every
      transcript shown above exactly.
- [ ] Unit 1's inverse-times-original check reproduced, confirming the
      identity matrix exactly.
- [ ] Unit 2's basis-coordinate recovery reproduced, including
      understanding what the `N` suffix on `2N`/`1N` actually means.
- [ ] Unit 3's singular-matrix collapse reproduced, with two genuinely
      different inputs shown mapping to the identical output, and the
      real `ArithmeticException` reproduced when the inverse is
      attempted anyway.
- [ ] Exercise 3 completed, confirming a second collapsing vector and
      explaining the general pattern.
- [ ] `git commit -m "Add Lesson 239: matrix inverses, verified against
      real composition, closing Lesson 237's own open problem, and
      proven impossible for a singular matrix"`
