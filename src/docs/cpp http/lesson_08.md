# Lesson 8: A * B

**What you will build:** a real `Matrix::operator*` — genuinely different in shape from
Lesson 7's `operator+`/`operator-`, not a third case bolted onto the same element-wise loop
— implementing actual matrix multiplication, with its own dimension rule (inner dimensions
must match, not "same shape"), wired into `BinaryExpression`'s existing matrix branch. The
transferable problem: it's tempting, after Lesson 7, to assume every matrix operator follows
the same "loop over matching positions, combine, done" template. Multiplication breaks that
assumption on purpose — this lesson is about noticing when a new case in a `switch` needs an
entirely different algorithm, not just a different operator symbol, and about what that
algorithm actually costs to run.

**What you need to know first:** Lesson 7's `Matrix::operator+`, its `check_same_dimensions`
helper, and `BinaryExpression::evaluate`'s matrix-vs-matrix `switch` — this lesson adds one
case to that `switch` and one new free function to `matrix.cpp`.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
```

No lexer or parser changes this lesson either — `A * B` has parsed correctly since Lesson 3
(`*` was always a `BinaryExpression` operator); only `evaluate()`'s matrix branch is
missing the real behavior for `Star`. Carrying `A = [1 2; 3 4]`, `B = [5 6; 7 8]`, then
`A * B` through: two prior requests store both matrices; the third request's
`BinaryExpression::evaluate` sees two matrices and a `Star` token, calls the new
`operator*`, and returns `Value::matrix([19 22; 43 50])`.

---

## Concept Unit 1: One number out of a whole row and a whole column

### The Problem

Element-wise addition combines the value at `(r, c)` in `A` with the value at the *same*
`(r, c)` in `B`. Matrix multiplication's result at `(r, c)` isn't like that at all — it's
defined as: take row `r` of the left matrix, take column `c` of the right matrix, multiply
them position-by-position, and add up all those products. That single number — one row
times one column, summed — is the real unit of work here, and it's worth isolating before
writing the triple-nested loop that produces a whole result matrix out of many of them.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<double> row = {1, 2, 3};
    std::vector<double> col = {7, 9, 11};

    double sum = 0;
    for (std::size_t i = 0; i < row.size(); i++) {
        sum += row[i] * col[i];
    }

    std::cout << "dot product = " << sum << "\n";
    return 0;
}
```

Real output:

```
dot product = 58
```

(`1×7 + 2×9 + 3×11 = 7 + 18 + 33 = 58` — worth checking by hand once, since this exact `58`
reappears as the top-left entry of a real matrix product later in this lesson.)

### Discard

This standalone `row`/`col` example is deleted. `Matrix::operator*` (next unit) performs
exactly this same accumulate-a-sum loop, once for *every* position in the result matrix,
reading each "row" and "column" directly out of the two `Matrix` operands via `operator()`
instead of separate `std::vector`s.

### Mechanical walkthrough

- `double sum = 0;` initialized **before** the loop, accumulated inside it — **(b)
  reappearing pattern.** The same accumulator shape as `Lexer::read_number`'s `text += ...`
  loop back in Lesson 2 — start empty, add one contribution per iteration, read the final
  result once the loop ends.
- `sum += row[i] * col[i];` — **(a) first appearance of this specific computation, named
  properly.** This sum-of-products over two equal-length sequences is called a **dot
  product** (or inner product) — a genuinely named, standard mathematical operation, not an
  ad hoc bit of arithmetic this project invented.

### CS lens

A dot product is the computational core of far more than matrix multiplication: also
recognized in cosine similarity (comparing two vectors' directions, used in search and
recommendation systems), and in a neural network's single neuron — literally a dot product
of inputs and weights, plus a bias — which is worth naming plainly rather than treating as
some other kind of exotic math: the same three-line loop just shown, run many times over.

---

## Concept Unit 2: Real matrix multiplication

### The Problem

Multiplying an `m×n` matrix by an `n×p` matrix produces an `m×p` result — this is genuinely
different from Lesson 7's operators, which only ever worked between matrices of *identical*
shape and produced a result of that same shape. Multiplication's dimension rule is about the
*inner* dimensions matching (the left matrix's column count and the right matrix's row
count), not the whole shapes matching — `Lesson 7`'s `check_same_dimensions` helper is the
wrong check entirely here, not just reusable with different arguments.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `matrix.h`, `matrix.cpp`.
- **Change type:** add one free function.
- **Location:** `matrix.h`, after the `operator-` declaration; `matrix.cpp`, after
  `operator-`'s definition.
- **Dependencies:** none new — `Matrix::operator()` (Lesson 6) is all this needs.

### The New Code — type it yourself

```cpp
Matrix operator*(const Matrix& lhs, const Matrix& rhs) {
    if (lhs.cols() != rhs.rows()) {
        throw std::runtime_error(
            "cannot multiply a " + std::to_string(lhs.rows()) + "x" + std::to_string(lhs.cols()) +
            " matrix by a " + std::to_string(rhs.rows()) + "x" + std::to_string(rhs.cols()) +
            " matrix: inner dimensions " + std::to_string(lhs.cols()) + " and " + std::to_string(rhs.rows()) +
            " do not match");
    }

    Matrix result(lhs.rows(), rhs.cols());
    for (std::size_t r = 0; r < lhs.rows(); r++) {
        for (std::size_t c = 0; c < rhs.cols(); c++) {
            double sum = 0.0;
            for (std::size_t k = 0; k < lhs.cols(); k++) {
                sum += lhs(r, k) * rhs(k, c);
            }
            result(r, c) = sum;
        }
    }
    return result;
}
```

### The Updated Project

`matrix.h`'s tail, with the new declaration marked (`operator+`/`operator-` unchanged from
Lesson 7):

```cpp
Matrix operator+(const Matrix& lhs, const Matrix& rhs);
Matrix operator-(const Matrix& lhs, const Matrix& rhs);
Matrix operator*(const Matrix& lhs, const Matrix& rhs);                  // ← new
```

`matrix.cpp`, with `operator*` appended after `operator-` (both unchanged from Lesson 7):

```cpp
Matrix operator-(const Matrix& lhs, const Matrix& rhs) {
    check_same_dimensions(lhs, rhs, "subtraction");

    Matrix result(lhs.rows(), lhs.cols());
    for (std::size_t r = 0; r < lhs.rows(); r++) {
        for (std::size_t c = 0; c < lhs.cols(); c++) {
            result(r, c) = lhs(r, c) - rhs(r, c);
        }
    }
    return result;
}

Matrix operator*(const Matrix& lhs, const Matrix& rhs) {                 // ← new
    if (lhs.cols() != rhs.rows()) {                                      // ← new
        throw std::runtime_error(                                       // ← new
            "cannot multiply a " + std::to_string(lhs.rows()) + "x" + std::to_string(lhs.cols()) +  // ← new
            " matrix by a " + std::to_string(rhs.rows()) + "x" + std::to_string(rhs.cols()) +  // ← new
            " matrix: inner dimensions " + std::to_string(lhs.cols()) + " and " + std::to_string(rhs.rows()) +  // ← new
            " do not match");                                           // ← new
    }                                                                    // ← new

    Matrix result(lhs.rows(), rhs.cols());                               // ← new
    for (std::size_t r = 0; r < lhs.rows(); r++) {                       // ← new
        for (std::size_t c = 0; c < rhs.cols(); c++) {                   // ← new
            double sum = 0.0;                                           // ← new
            for (std::size_t k = 0; k < lhs.cols(); k++) {                // ← new
                sum += lhs(r, k) * rhs(k, c);                            // ← new
            }                                                            // ← new
            result(r, c) = sum;                                         // ← new
        }                                                                // ← new
    }                                                                    // ← new
    return result;                                                      // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- `if (lhs.cols() != rhs.rows())` — **(a) first appearance of this specific check, distinct
  from `check_same_dimensions`.** This deliberately does **not** call Lesson 7's
  `check_same_dimensions` helper — that function checks that *both* dimensions match between
  two matrices, which is not what multiplication requires at all. Multiplication is legal
  between differently-shaped matrices (a `2×3` times a `3×2` is perfectly valid, as this
  lesson's real output shows) as long as the *inner* pair — left's columns, right's rows —
  agree; writing a separate check here, rather than contorting `check_same_dimensions` to
  cover both cases, keeps each check honestly named for what it actually verifies.
- `Matrix result(lhs.rows(), rhs.cols());` — **(a) first appearance of an asymmetric result
  shape.** Notice this reads `lhs.rows()` from the *left* operand and `cols()` from the
  *right* — Lesson 7's `operator+`/`operator-` could get away with `result(lhs.rows(),
  lhs.cols())` because both operands were required to share one shape; here, the result's
  shape is genuinely built from *different* operands' dimensions, which is only correct
  because the inner-dimension check above already confirmed multiplication is legal at all.
- **Three nested loops**, not two — **(a) first appearance of a triple-nested loop in this
  project.** The outer two (`r`, `c`) walk every position in the *result*, exactly like
  `operator+`/`operator-`'s double loop; the innermost (`k`) is new — it's Concept Unit 1's
  dot-product loop, run once per result position, reading `lhs(r, k)` (row `r` of the left
  matrix, walking across) and `rhs(k, c)` (column `c` of the right matrix, walking down) as
  `k` advances.
- `sum += lhs(r, k) * rhs(k, c);` — **(b) reappearing pattern, real payoff.** The identical
  accumulation shape as Concept Unit 1's throwaway lab, now reading both operands directly
  through `Matrix::operator()` (Lesson 6) instead of separate `std::vector`s — the lab's
  `row[i]`/`col[i]` become `lhs(r, k)`/`rhs(k, c)` here, with `k` playing the role `i` played
  in isolation.

### CS lens

This is the **naive** (or "textbook") matrix multiplication algorithm — three nested loops,
directly implementing the mathematical definition. It's worth naming honestly that faster
algorithms exist: **Strassen's algorithm** multiplies matrices asymptotically faster than
this triple-loop approach by recursively splitting matrices into blocks and combining
sub-results with fewer multiplications than the naive method needs — genuinely more complex
to implement correctly, and not something this project builds. Naming that it exists,
without building it, is itself part of an honest engineering habit: know that a better
algorithm exists for a problem, and consciously choose the simpler one for now, rather than
being unaware there was a choice at all.

### SE lens

The alternative rejected here was trying to reuse `check_same_dimensions` by, say, adding an
optional parameter or a different call convention that could also express "left's columns
must equal right's rows." The real cost of that alternative: a single function trying to
express two genuinely different mathematical requirements (same shape vs. compatible inner
dimensions) under one name becomes harder to read at every call site — a reader would have
to check *which* meaning applies each time. Writing the multiplication check inline instead,
right where it's used, costs a few duplicated lines of `std::to_string`-based message
building — a small, deliberate tradeoff in favor of each check being honestly self-contained.

---

## Concept Unit 3: One line wires it in

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.cpp` only.
- **Change type:** add one `switch` case.
- **Location:** `BinaryExpression::evaluate`'s matrix-vs-matrix `switch`, from Lesson 7.
- **Dependencies:** `operator*` from Concept Unit 2.

### The New Code — type it yourself

```cpp
            case TokenType::Star:  return Value::matrix(l * r);
```

### The Updated Project

`BinaryExpression::evaluate`'s matrix branch, in full — the `Plus`/`Minus` cases and the
`default` are unchanged from Lesson 7:

```cpp
    if (lhs.is_matrix() && rhs.is_matrix()) {
        const Matrix& l = lhs.as_matrix();
        const Matrix& r = rhs.as_matrix();

        switch (op_) {
            case TokenType::Plus:  return Value::matrix(l + r);
            case TokenType::Minus: return Value::matrix(l - r);
            case TokenType::Star:  return Value::matrix(l * r);          // ← new
            default:
                throw std::runtime_error("this operator is not supported between two matrices yet");
        }
    }
```

### Mechanical walkthrough

Nothing new here worth a full treatment — `l * r` resolves to Concept Unit 2's free-function
`operator*` by the same overload-resolution mechanism `l + r` used in Lesson 7, and
`Value::matrix(...)` wraps the result the same way every matrix-producing branch in this
project has since Lesson 6. The entire "wiring" cost of a working `A * B` was one line,
because Lessons 6 and 7 already built every piece of scaffolding (`Value`, the dispatch
`switch`, `Value::matrix`) this line needed.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "B = [5 6; 7 8]"
[5 6; 7 8]

$ curl -X POST http://localhost:8080/evaluate -d "A * B"
[19 22; 43 50]

$ curl -X POST http://localhost:8080/evaluate -d "C = [1 2 3; 4 5 6]"
[1 2 3; 4 5 6]

$ curl -X POST http://localhost:8080/evaluate -d "D = [7 8; 9 10; 11 12]"
[7 8; 9 10; 11 12]

$ curl -X POST http://localhost:8080/evaluate -d "C * D"
[58 64; 139 154]

$ curl -X POST http://localhost:8080/evaluate -d "A * D"
error: cannot multiply a 2x2 matrix by a 3x2 matrix: inner dimensions 2 and 3 do not match

$ curl -X POST http://localhost:8080/evaluate -d "A * 2"
error: cannot combine a number and a matrix
```

Server's own log, real output, all eight requests:

```
math engine listening on port 8080
[10:32:07] POST /evaluate body="A = [1 2; 3 4]"
[10:32:07] POST /evaluate body="B = [5 6; 7 8]"
[10:32:07] POST /evaluate body="A * B"
[10:32:07] POST /evaluate body="C = [1 2 3; 4 5 6]"
[10:32:07] POST /evaluate body="D = [7 8; 9 10; 11 12]"
[10:32:07] POST /evaluate body="C * D"
[10:32:07] POST /evaluate body="A * D"
[10:32:07] POST /evaluate body="A * 2"
```

`A * B = [19 22; 43 50]` is worth checking by hand once against the actual definition:
top-left entry is row 0 of `A` (`1, 2`) dotted with column 0 of `B` (`5, 7`) — `1×5 + 2×7 =
19`, matching the real output exactly. `C * D` proves multiplication works between
*non-square*, differently-shaped matrices (`2×3` times `3×2`, producing `2×2`) — something
`operator+`/`operator-` could never do at all, since they require identical shapes. `A * D`
proves the new inner-dimension check reports both shapes and both mismatched numbers
specifically (`2x2` by `3x2`, inner dimensions `2` and `3`). `A * 2` proves scalar-times-matrix
is still — deliberately, per Lesson 7's permanent design decision — not supported; nothing
about adding multiplication changed that boundary.

### Connect

Every arithmetic operator doc1's original project list named for matrices (`A + B`, `A * B`)
now genuinely works, on real, independently-verified computations. What's still missing:
`det(A)` and `inverse(A)` — operations that aren't "loop over positions and combine" at all,
not even in multiplication's three-nested-loop sense; determinant is defined *recursively*,
in terms of smaller matrices' own determinants. That's a different kind of recursion than
this project has used before (Lesson 3's recursive descent parser recursed over a *token
stream*; this would recurse over a *matrix itself getting smaller*) — Lesson 9's subject.

---

## Closing

### Connect the pieces

Trace `A * B` end to end, with `A = [1 2; 3 4]` and `B = [5 6; 7 8]` from two earlier
requests: Lesson 1's socket/HTTP layer delivers `"A * B"` unchanged → Lesson 2's `Lexer`
produces `IDENTIFIER(A) STAR IDENTIFIER(B) END` → the parser (unmodified since Lesson 5)
builds `BinaryExpression(Star, VariableExpression("A"), VariableExpression("B"))` →
`evaluate(environment)`: both variables resolve to matrices via `Environment::get` →
Lesson 7's dispatch sees `lhs.is_matrix() && rhs.is_matrix()`, and this lesson's new `Star`
case calls `l * r` → `operator*` (Concept Unit 2) checks `2 == 2` (inner dimensions agree),
builds a fresh `Matrix(2, 2)`, and for each of its four positions runs Concept Unit 1's
dot-product loop against `A`'s rows and `B`'s columns via `operator()` → the result
`[19 22; 43 50]` is wrapped in `Value::matrix(...)` → `Value::to_string()` (Lesson 6)
delegates to `Matrix::to_string()` → sent back over HTTP by Lesson 1's untouched
response-writing code.

### What breaks without this

In `operator*`, temporarily swap the result's shape to match `operator+`/`operator-`'s
pattern instead of the correct asymmetric one:

```cpp
    Matrix result(lhs.rows(), lhs.cols());   // was: Matrix result(lhs.rows(), rhs.cols());
```

Rebuild, and send `"C * D"` again — `C` is `2×3`, `D` is `3×2`; the correct result is `2×2`,
but this change makes `result` a `2×3` instead. Real result, worth running rather than
guessing: the loop still iterates `c` from `0` to `rhs.cols()` (`2`, correct for the real
result shape) while writing into a `result` matrix whose `cols_` is actually `3` — every
write via `result(r, c)` computes `r * 3 + c` instead of the correct `r * 2 + c`, silently
writing into the wrong flattened positions (or, depending on the exact shapes involved,
potentially past the end of `result`'s own `data_` vector entirely — the same undefined-
behavior danger Lesson 7's broken-dimension-check experiment demonstrated). This is a subtle,
real bug class: the loop bounds were right, and the accumulation math was right, but the
*container being written into* was the wrong shape — proof that getting a multiplication
right requires the result's dimensions to be reasoned about explicitly, not copied by
habit from a similar-looking previous operator. Restore the correct
`Matrix result(lhs.rows(), rhs.cols());` before moving on.

### Exercises

- Multiply a matrix by an identity-shaped matrix you construct by hand — `[1 0; 0 1]` — and
  confirm `A * [1 0; 0 1]` returns exactly `A` unchanged, for whatever `2×2` matrix you
  assign to `A`.
- Compute `A * B` and `B * A` for the same two matrices from this lesson's real output, and
  compare the two results — matrix multiplication is not commutative, and this project's own
  triple loop (row of the left, column of the right, in that specific order) is *why* the
  order matters, not just an abstract fact to memorize.
- `check_same_dimensions` (Lesson 7) and this lesson's inline inner-dimension check both
  build near-identical `"AxB vs CxD"`-style error text through repeated
  `std::to_string`/string concatenation. As an exercise only (not required for this lesson's
  Definition of Done), consider whether a small shared helper for formatting one matrix's
  `"rows x cols"` shape as text would reduce that duplication without conflating the two
  genuinely different dimension *rules* the SE lens above argued for keeping separate.

### Definition of done

- [ ] `matrix.h`/`matrix.cpp` compile cleanly with `operator*` added.
- [ ] `ast.cpp` compiles with the `Star` case added to the matrix-vs-matrix `switch`.
- [ ] `A * B` (both `2×2`) produces the correct result, verified by hand against the
      row-times-column definition.
- [ ] `C * D` (a `2×3` times a `3×2`) produces a correct `2×2` result — proof multiplication
      works for non-square, differently-shaped operands.
- [ ] `A * D` (mismatched inner dimensions) reports both actual shapes and both mismatched
      numbers.
- [ ] `A * 2` still correctly rejects mixing a matrix with a bare number.
- [ ] The "what breaks without this" exercise (using the wrong result shape) was actually
      run and reverted.
- [ ] Commit:

```
git add matrix.h matrix.cpp ast.cpp
git commit -m "Add real matrix multiplication

operator* implements the naive (textbook) algorithm: three nested
loops, an inner dot-product accumulation per result position - a
genuinely different shape from operator+/operator-'s two-loop,
same-shape-required pattern, not a third case squeezed into it.
Dimension rule is deliberately a separate check from Lesson 7's
check_same_dimensions: multiplication requires left.cols() ==
right.rows(), not identical shapes, and the result's own shape
(left.rows() x right.cols()) is asymmetric - reusing the addition
check here would have been actively wrong, not just imprecise.
Naive complexity is O(n^3) for square n x n matrices; Strassen's
algorithm is asymptotically faster and deliberately not
implemented. Scalar-times-matrix (A * 2) remains unsupported by
design, per Lesson 7."
```

Next lesson: `det(A)` and `inverse(A)` — where matrix operations stop being "loop over
positions" entirely, and become genuinely recursive over the matrix's own structure.
