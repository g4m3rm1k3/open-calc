# Lesson 10: inverse(A)

**What you will build:** `Matrix::cofactor()` (one signed minor determinant — the building
block Lesson 9's `determinant()` already computed several of, without ever naming or
reusing them as a standalone thing) and `Matrix::inverse()`, which assembles the adjugate
matrix and divides by the determinant, plus one more branch in
`FunctionCallExpression::evaluate` alongside `det`. The transferable problem: `inverse` isn't
a new algorithm from scratch — it's Lesson 9's determinant and minor machinery, reused and
recombined, with exactly one new idea layered on top (the checkerboard sign-and-transpose
pattern that turns a matrix of raw minors into the adjugate). Recognizing when a new feature
is *mostly* composition of existing pieces, rather than something built from zero, is a real
skill, and this lesson is a clean example of it — most of the hard work already happened in
Lesson 9.

**What you need to know first:** Lesson 9's `Matrix::minor()` and `Matrix::determinant()`
in full — this lesson calls both directly and adds nothing that changes either.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
```

No lexer or parser changes this lesson at all. Carrying `A = [1 2; 3 4]`, then
`inverse(A)`, then `A * inverse(A)` through: `FunctionCallExpression::evaluate`'s existing
matrix branch (Lesson 9) gains one more name it recognizes; `Matrix::inverse()` calls
`determinant()` once and `cofactor()` four times (once per position in a 2×2 result), and the
final `A * inverse(A)` — using Lesson 8's `operator*`, completely untouched — comes back as
the identity matrix, a real, independently-checkable proof the whole chain is correct.

---

## Concept Unit 1: A sign that only depends on position

### The Problem

Lesson 9's `determinant()` already multiplies each first-row entry by an alternating `sign`
that flips every column — but that alternation was folded directly into `determinant()`'s
own loop, tied to "column index only," because determinant only ever needed signs along one
row. The adjugate needs a sign for *every* position in the matrix, `(row, col)`, not just
one row — worth seeing the general pattern in isolation before writing it as its own
function.

### Introduce the concept in isolation

```cpp
#include <iostream>

int main() {
    for (int row = 0; row < 2; row++) {
        for (int col = 0; col < 2; col++) {
            double sign = ((row + col) % 2 == 0) ? 1.0 : -1.0;
            std::cout << "(" << row << "," << col << ") sign = " << sign << "\n";
        }
    }
    return 0;
}
```

Real output:

```
(0,0) sign = 1
(0,1) sign = -1
(1,0) sign = -1
(1,1) sign = 1
```

This is the checkerboard pattern cofactor expansion actually relies on: the sign at any
position depends only on whether `row + col` is even or odd — `(0,0)` and `(1,1)` are `+`,
`(0,1)` and `(1,0)` are `-`, and this generalizes to any size matrix, not just the single row
Lesson 9's `determinant()` ever touched.

### Discard

This standalone loop is deleted. `Matrix::cofactor()` (next unit) computes exactly this
`(row + col) % 2` sign, for one specific `(row, col)` pair rather than printing every one.

### Mechanical walkthrough

- `((row + col) % 2 == 0) ? 1.0 : -1.0` — **(a) first appearance of this general two-index
  form.** Lesson 9's `determinant()` alternated `sign = -sign` across a single loop, which
  only works correctly because that loop always started at column `0`, row fixed at `0` —
  `(0 + 0) % 2 == 0`, matching the formula here. This unit's version is the same underlying
  rule, expressed so it's correct for *any* starting position, not just one that happens to
  begin at an even index.

### CS lens

A value that depends only on a position's coordinates — with no memory of how you got there
— is what makes this pattern a genuine **checkerboard**: also recognized in a literal
chessboard's alternating square colors (`(row + col) % 2` is the standard way to compute
which color a square is), and in image-processing dithering patterns that alternate pixel
treatment the same way.

---

## Concept Unit 2: Naming the thing `determinant()` was already computing

### The Problem

Look closely at Lesson 9's `determinant()`: its loop body computes
`sign * (*this)(0, col) * sub.determinant()` — a signed minor-determinant, multiplied by the
original entry, for one row. The *signed minor-determinant* part — `sign *
minor(row, col).determinant()` — is a real, named mathematical object in its own right (a
**cofactor**), and it's needed again, for *every* position, not just row `0`, to build the
adjugate. Worth pulling it out as its own method rather than duplicating that expression.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `matrix.h`, `matrix.cpp` — both existing since Lesson 6.
- **Change type:** add one member method.
- **Location:** `matrix.h`'s class body, after `determinant`; `matrix.cpp`, after
  `Matrix::determinant`.
- **Dependencies:** `Matrix::minor` and `Matrix::determinant`, both from Lesson 9.

### The New Code — type it yourself

```cpp
double Matrix::cofactor(std::size_t row, std::size_t col) const {
    double sign = ((row + col) % 2 == 0) ? 1.0 : -1.0;
    return sign * minor(row, col).determinant();
}
```

### The Updated Project

`matrix.h`'s class body, with the new declaration marked (`minor`/`determinant` above it
unchanged from Lesson 9):

```cpp
    Matrix minor(std::size_t skip_row, std::size_t skip_col) const;
    double determinant() const;
    double cofactor(std::size_t row, std::size_t col) const;             // ← new
    Matrix inverse() const;                                             // ← new (Concept Unit 3)
```

### Mechanical walkthrough

Nothing here is conceptually new beyond Concept Unit 1's sign formula — `minor(row, col)`
and `.determinant()` are both direct, unmodified reuse of Lesson 9's own methods, called on
an arbitrary `(row, col)` instead of always `(0, col)`. Worth noticing what this method
*doesn't* do: it takes no shortcuts and adds no new algorithm — it's purely giving a name to
a computation this project already knew how to do, so it can be called by both
`determinant()`-shaped code and the genuinely new `inverse()` code without duplicating the
"sign, times minor's determinant" expression in two places.

### SE lens

Lesson 9's `determinant()` itself is **not** rewritten to call this new `cofactor()` method
— it still computes its sign inline with the alternating `sign = -sign` trick, rather than
calling `cofactor(0, col)` on every iteration. This is a deliberate choice, not an oversight:
`determinant()`'s inline version is already correct, already tested (Lesson 9's real `-306`
result), and changing working, verified code purely for the sake of eliminating a few lines
of duplication carries real risk (a transcription slip while "cleaning up" is exactly how
correct code becomes subtly wrong) for a benefit that's mostly cosmetic here. Extracting
`cofactor()` as new, additional code — leaving `determinant()` exactly as Lesson 9 left it —
gets the reuse this lesson actually needs (inside `inverse()`) without touching anything
already proven correct.

---

## Concept Unit 3: The real `inverse()`

### The Problem

A matrix's inverse is defined as its **adjugate** — the matrix of cofactors, *transposed*
(rows and columns swapped) — divided element-by-element by the original matrix's
determinant. Two new ideas beyond `cofactor()` itself: the transpose (position `(r, c)` in
the result comes from cofactor `(c, r)`, not `(r, c)`), and the fact that a zero determinant
makes inversion genuinely undefined — mathematically, not just as an implementation
limitation.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `matrix.h` (declaration already shown in Concept Unit 2's Updated
  Project block), `matrix.cpp`.
- **Change type:** add.
- **Location:** `matrix.cpp`, immediately after `Matrix::cofactor`.
- **Dependencies:** `Matrix::cofactor` from Concept Unit 2, `Matrix::determinant` from
  Lesson 9.

### The New Code — type it yourself

```cpp
Matrix Matrix::inverse() const {
    if (rows_ != cols_) {
        throw std::runtime_error("inverse is only defined for square matrices");
    }

    double det = determinant();
    if (det == 0.0) {
        throw std::runtime_error("matrix is singular (determinant is 0); it has no inverse");
    }

    Matrix result(rows_, cols_);
    for (std::size_t r = 0; r < rows_; r++) {
        for (std::size_t c = 0; c < cols_; c++) {
            result(r, c) = cofactor(c, r) / det;
        }
    }
    return result;
}
```

### The Updated Project

`matrix.cpp`, with `cofactor` (Concept Unit 2) and `inverse` appended after `determinant`
(unchanged from Lesson 9), before the free-function operators (unchanged from Lessons 7–8):

```cpp
double Matrix::cofactor(std::size_t row, std::size_t col) const {        // ← new
    double sign = ((row + col) % 2 == 0) ? 1.0 : -1.0;                   // ← new
    return sign * minor(row, col).determinant();                        // ← new
}                                                                         // ← new

Matrix Matrix::inverse() const {                                         // ← new
    if (rows_ != cols_) {                                                // ← new
        throw std::runtime_error("inverse is only defined for square matrices");  // ← new
    }                                                                    // ← new
                                                                           // ← new
    double det = determinant();                                         // ← new
    if (det == 0.0) {                                                    // ← new
        throw std::runtime_error("matrix is singular (determinant is 0); it has no inverse");  // ← new
    }                                                                    // ← new
                                                                           // ← new
    Matrix result(rows_, cols_);                                         // ← new
    for (std::size_t r = 0; r < rows_; r++) {                             // ← new
        for (std::size_t c = 0; c < cols_; c++) {                         // ← new
            result(r, c) = cofactor(c, r) / det;                         // ← new
        }                                                                // ← new
    }                                                                    // ← new
    return result;                                                      // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- `if (rows_ != cols_) { throw std::runtime_error("inverse is only defined for square
  matrices"); }` — **(a) first appearance of this specific check, deliberately separate from
  reusing `determinant()`'s own square check.** `determinant()` (called two lines later)
  already throws its own `"determinant is only defined for square matrices"` if `rows_ !=
  cols_` — this check is technically redundant with that one. It's kept anyway, for the same
  reason Lesson 8 wrote its own inner-dimension check instead of reusing Lesson 7's
  same-shape check: a reader hitting `"determinant is only defined for square matrices"`
  while calling `inverse()` would have to make a small inferential leap ("oh, inverse must
  need a determinant, and *that's* why") that a direct `"inverse is only defined for square
  matrices"` message avoids entirely — worth two extra lines for a clearer error at the
  actual point of failure.
- `double det = determinant();` — **(b) reappearing call.** Lesson 9's `determinant()`,
  called exactly once here — not once per `(r, c)` position in the loop below, which matters:
  determinant is expensive (Lesson 9's CS lens named its cost as growing like `n!`), so
  computing it once and reusing the single `double det` for every division is a real,
  meaningful saving, not just tidiness.
- `if (det == 0.0)` — **(a) first appearance of this specific comparison, and a real
  numerical caveat worth naming honestly.** Comparing floating-point values for *exact*
  equality is normally suspect — accumulated rounding error can leave a value that's
  "morally zero" sitting at something like `1e-16` instead of exactly `0.0`. This project's
  `det == 0.0` check will correctly catch the *exact* zero this lesson's own singular-matrix
  test produces (`[1 2; 2 4]`'s determinant computes to exactly `0` through this project's
  arithmetic), but a matrix that's singular only after real-world floating-point error
  accumulates might slip through as some tiny nonzero value instead of being caught — a
  genuine, known limitation of exact floating-point comparison, not fixed here.
- `result(r, c) = cofactor(c, r) / det;` — **(a) first appearance of the transpose, folded
  directly into the loop indices.** This is the one line doing two jobs at once: `cofactor(c,
  r)` — arguments *swapped* relative to `result`'s own `(r, c)` — is what performs the
  adjugate's transpose, without ever constructing a separate, un-transposed "cofactor matrix"
  first and transposing it afterward as a second pass. Skipping that intermediate matrix
  avoids one extra full-size allocation, at the cost of this single line being easy to
  misread if you don't already know a transpose is happening — worth exactly the comment
  this walkthrough is giving it, since the code itself gives no visual hint.

### CS lens

Building the adjugate's transpose directly into which indices get read, rather than as a
separate transpose step applied afterward, is a small instance of a common technique:
**fusing** two logically separate operations (compute the cofactor matrix; then transpose
it) into one pass, when the second operation is simple enough to express as "read from a
different position" rather than requiring its own loop. Also recognized in image-processing
pipelines that apply a color transform and a flip in one combined pass instead of two
separate ones, each avoiding a full extra pass over the data.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "inverse(A)"
[-2 1; 1.5 -0.5]

$ curl -X POST http://localhost:8080/evaluate -d "I = inverse(A)"
[-2 1; 1.5 -0.5]

$ curl -X POST http://localhost:8080/evaluate -d "A * I"
[1 0; 0 1]

$ curl -X POST http://localhost:8080/evaluate -d "S = [1 2; 2 4]"
[1 2; 2 4]

$ curl -X POST http://localhost:8080/evaluate -d "inverse(S)"
error: matrix is singular (determinant is 0); it has no inverse

$ curl -X POST http://localhost:8080/evaluate -d "N = [1 2 3]"
[1 2 3]

$ curl -X POST http://localhost:8080/evaluate -d "inverse(N)"
error: inverse is only defined for square matrices

$ curl -X POST http://localhost:8080/evaluate -d "det(A)"
-2
```

Server's own log, real output, all nine requests:

```
math engine listening on port 8080
[09:43:57] POST /evaluate body="A = [1 2; 3 4]"
[09:43:57] POST /evaluate body="inverse(A)"
[09:43:57] POST /evaluate body="I = inverse(A)"
[09:43:57] POST /evaluate body="A * I"
[09:43:57] POST /evaluate body="S = [1 2; 2 4]"
[09:43:57] POST /evaluate body="inverse(S)"
[09:43:57] POST /evaluate body="N = [1 2 3]"
[09:43:57] POST /evaluate body="inverse(N)"
[09:43:57] POST /evaluate body="det(A)"
```

`inverse(A) = [-2 1; 1.5 -0.5]` matches the standard 2×2 inverse formula by hand
(`1/det × [d −b; −c a]`, with `det = −2`). But the far stronger proof is the fourth request:
`I = inverse(A)` is stored, then `A * I` — using Lesson 8's matrix multiplication, completely
untouched by this lesson — comes back as exactly `[1 0; 0 1]`, the identity matrix. That's
not a hand-checked expectation; it's the actual mathematical definition of an inverse
(`A × A⁻¹ = I`) verified end-to-end by this project's own independently-built,
previously-tested multiplication code — two entirely separate pieces of this project (Lesson
8's multiplication, this lesson's inverse) agreeing with each other is real evidence neither
has a hidden matching pair of bugs that happen to cancel out. `inverse(S)` correctly rejects
a genuinely singular matrix; `inverse(N)` correctly rejects a non-square one; `det(A)`
at the end confirms Lesson 9's functionality is completely unaffected.

### Connect

Every operation from doc1's original "Project 10: det(A), inverse(A)" now genuinely works,
verified against both hand-computed values and an internal cross-check
(`A * inverse(A) == I`) rather than trust alone. Everything doc1 named through matrices is
now built: literals, addition, subtraction, multiplication, determinant, inverse. What's
next in the original architecture is a different kind of output entirely —
`plot(...)`, returning something visual (SVG) instead of text — the first time this project's
**Result Formatter** stage has to produce something other than a plain string.

---

## Closing

### Connect the pieces

Trace `A * inverse(A)` end to end, with `A = [1 2; 3 4]`: the earlier `inverse(A)` request
already proved `Matrix::inverse()` works in isolation — this request exercises the *whole
chain* together. `A` resolves via `Environment::get` to a `Value` wrapping the stored matrix
→ `FunctionCallExpression::evaluate`'s matrix branch (Lesson 9, now extended by this
lesson's `"inverse"` case) calls `argument.as_matrix().inverse()` → `Matrix::inverse()`
(Concept Unit 3) calls `determinant()` once (Lesson 9, unmodified, returns `-2`), checks it's
nonzero, then loops over all four `(r, c)` positions calling `cofactor(c, r)` (Concept Unit
2, which itself calls `minor` and `determinant` again, Lesson 9's machinery, for each 1×1
sub-minor) divided by `-2` → returns a new `Matrix` wrapped in `Value::matrix(...)` →
`BinaryExpression::evaluate`'s existing `Star` case (Lesson 8, completely untouched) then
multiplies the original `A` by this freshly-computed inverse using `operator*`'s triple loop
→ the result, `[1 0; 0 1]`, is exactly what the mathematical definition of an inverse
guarantees, and exactly what came back over real HTTP.

### What breaks without this

In `Matrix::inverse()`, temporarily remove the singular-matrix check:

```cpp
Matrix Matrix::inverse() const {
    if (rows_ != cols_) {
        throw std::runtime_error("inverse is only defined for square matrices");
    }

    double det = determinant();
    // if (det == 0.0) {
    //     throw std::runtime_error("matrix is singular (determinant is 0); it has no inverse");
    // }

    Matrix result(rows_, cols_);
    for (std::size_t r = 0; r < rows_; r++) {
        for (std::size_t c = 0; c < cols_; c++) {
            result(r, c) = cofactor(c, r) / det;
        }
    }
    return result;
}
```

Rebuild, and send `"inverse(S)"` again, with `S = [1 2; 2 4]` (determinant `0`). Real result,
worth running rather than predicting: every `result(r, c) = cofactor(c, r) / det;` divides
by exactly `0.0`. In C++, floating-point division by zero does **not** throw or crash the way
integer division by zero does — it produces `inf` or `-inf` (or `nan` if the numerator is
also `0`), silently, and the function returns *successfully* with a matrix full of infinities
instead of failing at all. This is a real, dangerous category of bug: no exception, no crash,
just a quietly wrong answer that would only surface later, whenever something downstream
tried to actually use these `inf` values — possibly much further from the actual mistake than
the error message from a proper check would have pointed to. Restore the check before moving
on; it's not defensive paranoia, it's the difference between a clear error *here* and
untraceable garbage *somewhere else, later*.

### Exercises

- Confirm `inverse(A) * A` (operands reversed from this lesson's own test) also produces the
  identity matrix, and consider why that's worth checking separately from `A * inverse(A)` —
  recall Lesson 8's own exercise about matrix multiplication not being commutative in
  general.
- Trace `Matrix::cofactor(0, 1)` by hand for `A = [1 2; 3 4]` — which `minor` does it call,
  what's that minor's determinant, and what sign does `(0 + 1) % 2` produce? Confirm your
  hand trace against the `-3` used inside this lesson's own worked "Connect the pieces"
  section... except check the actual arithmetic yourself rather than trusting that reference.
- The `det == 0.0` exact-equality caveat named in Concept Unit 3's walkthrough is real but
  untested by anything in this lesson (this project's own arithmetic happens to produce an
  exact `0.0` for `S`'s determinant). As an exercise only, consider what a
  "close enough to zero" check might look like instead of exact equality, and what new
  problem *that* would introduce (how close is "close enough," and for what size of
  matrix entries).

### Definition of done

- [ ] `matrix.h`/`matrix.cpp` compile cleanly with `cofactor` and `inverse` added.
- [ ] `ast.cpp` compiles with the `"inverse"` branch added alongside `"det"`.
- [ ] `inverse(A)` for `A = [1 2; 3 4]` returns `[-2 1; 1.5 -0.5]`.
- [ ] `A * inverse(A)`, computed as two separate requests, returns the identity matrix
      `[1 0; 0 1]`.
- [ ] `inverse(S)` for a singular `S` reports the specific "singular" error.
- [ ] `inverse(N)` for a non-square `N` reports the specific "square matrices only" error.
- [ ] `det(A)` still works, unaffected by this lesson's changes.
- [ ] The "what breaks without this" exercise (removing the singular check) was actually run
      and reverted.
- [ ] Commit:

```
git add matrix.h matrix.cpp ast.cpp
git commit -m "Add inverse(A) via cofactor matrix and adjugate

Matrix::cofactor(row, col) names and reuses the signed-minor-
determinant computation determinant() already performed inline for
one row; determinant() itself is deliberately left unchanged rather
than refactored to call cofactor(), to avoid touching already-
verified code for a mostly-cosmetic gain. Matrix::inverse() builds
the adjugate's transpose directly into the loop indices (cofactor(c,
r), swapped from result's own (r, c)) rather than as a separate
transpose pass, and divides by a determinant computed exactly once,
not once per cell. Checks determinant != 0 before dividing - removing
that check (verified) doesn't throw, it silently fills the result
with inf/-inf, a real, dangerous quiet-failure mode particular to
floating-point division. Verified end-to-end via A * inverse(A)
producing the identity matrix, an independent cross-check against
Lesson 8's separately-built multiplication, not just a hand-computed
expectation. Known caveat: det == 0.0 is an exact-equality check,
which won't catch a matrix that's singular only after floating-point
rounding error, rather than exactly."
```

Next lesson: `plot(...)` — generating an SVG image as the HTTP response body, the first time
this project's Result Formatter stage produces something other than plain text.
