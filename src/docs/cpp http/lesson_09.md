# Lesson 9: det(A) — Recursion Over the Matrix Itself

**What you will build:** `Matrix::minor()` (building a smaller matrix by deleting one row
and one column) and `Matrix::determinant()` (recursive cofactor expansion along the first
row), wired into `FunctionCallExpression` through a new matrix-argument branch that sits
alongside — not inside — the existing scalar `FunctionTable` path from Lesson 5. Along the
way, this lesson hits and fixes a real bug: matrix literals with negative numbers
(`[6 1 1; 4 -2 5; 2 8 7]`) didn't parse at all before this lesson, because nothing since
Lesson 3's flagged-but-never-fixed "unary minus" gap ever needed one inside a matrix literal
until now. The transferable problem: every recursive structure this project has built so far
— the recursive descent parser (Lesson 3), the environment chain waiting in Lesson 13 —
recurses over something that shrinks by *removing one element at a time* (one token consumed,
one scope level up). Determinant recurses over a matrix that shrinks by *removing a whole
row and a whole column at once* — the same recursive shape, applied to a genuinely different
kind of "smaller."

**What you need to know first:** Lesson 8's `Matrix::operator*` (this lesson's
`determinant()` calls itself the same way `operator*` called `Matrix::operator()`), and
Lesson 5's `FunctionCallExpression`/`FunctionTable` split — this lesson is the first time
that split's boundary (scalar functions only) gets tested by a function that genuinely needs
a matrix argument.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
```

No lexer changes this lesson. One small, real parser fix (negative numbers inside matrix
literals — more below). Carrying `det(M)` through, with
`M = [6 1 1; 4 -2 5; 2 8 7]` already stored: `FunctionCallExpression::evaluate` resolves `M`
to a matrix, recognizes `"det"` as a matrix-taking function (new this lesson), and calls
`Matrix::determinant()`, which recurses three levels deep (a 3×3, then a 2×2, then a 1×1)
before returning `-306`.

---

## Concept Unit 1: Recursion over "what's left," not "how many are left"

### The Problem

Every recursive function this project has written so far — `factorial` (Lesson 3's throwaway
lab), the recursive-descent parser's `parse_expression`/`parse_term`/`parse_factor` — shrinks
its problem by removing exactly *one thing* each call: one token, one integer decrement.
Determinant's recursive definition shrinks a different way: computing an `n×n` determinant
needs the determinants of several `(n-1)×(n-1)` matrices, each built by deleting one row and
one column from the original. Worth isolating "recursion where the *thing itself* gets
smaller, not just a counter" before writing that against a `Matrix`.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <vector>

double sum(const std::vector<double>& values) {
    if (values.empty()) {
        return 0.0;
    }
    double first = values.front();
    std::vector<double> rest(values.begin() + 1, values.end());
    return first + sum(rest);
}

int main() {
    std::vector<double> numbers = {1, 2, 3, 4};
    std::cout << "sum = " << sum(numbers) << "\n";
    return 0;
}
```

Real output:

```
sum = 10
```

### Discard

This `sum` function is deleted. `Matrix::determinant()` (Concept Unit 3) follows the same
shape — base case on the smallest possible size, recursive case built from a genuinely
smaller version of the same kind of structure — but shrinks a 2D matrix by removing a row
*and* a column together, not a 1D vector by removing one front element.

### Mechanical walkthrough

- `if (values.empty()) { return 0.0; }` — **(b) reappearing concept, new shape.** A base
  case, same role as `factorial`'s `n <= 1` from Lesson 3 — the point recursion stops.
- `std::vector<double> rest(values.begin() + 1, values.end());` — **(a) first appearance of
  constructing a vector from an iterator range.** Builds a genuinely new vector containing
  everything *except* the first element — this is the "the structure itself gets smaller"
  step this unit exists to isolate; `rest` is a real, independent, one-shorter vector, not a
  view or reference into `values`.
- `return first + sum(rest);` — **(b) reappearing pattern.** The same "do a little work, then
  recurse on what's left, combine the results" shape as `BinaryExpression::evaluate`
  recursing into its children (Lesson 3) — here applied to a container shrinking by one
  element instead of an expression tree shrinking by one level.

### CS lens

This shrink-by-removing-part-of-the-structure recursion is a direct preview of two things
this project will do later: Lesson 13's environment chain (a scope "shrinks" by stripping
off its outermost link to expose the parent scope), and — the actual subject here — a matrix
"shrinking" by losing a row and column at once, which is a strictly larger structural change
per recursive call than removing one list element, and is exactly why it needs its own
purpose-built helper (`minor`, next unit) rather than reusing anything generic like
`std::vector`'s iterator-range constructor.

---

## Concept Unit 2: Deleting a row and a column

### The Problem

Cofactor expansion needs, for each column `j` in the first row, the `(n-1)×(n-1)` matrix
formed by deleting row `0` and column `j` from the original. This "minor" is a genuinely new
kind of matrix-to-matrix transformation — not element-wise like Lesson 7's addition, not a
combination of two matrices like Lesson 8's multiplication, but a *reshaping* of one matrix
into a smaller one.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `matrix.h`, `matrix.cpp` — both existing since Lesson 6.
- **Change type:** add one member method.
- **Location:** `matrix.h`'s class body, after `to_string`; `matrix.cpp`, after
  `Matrix::to_string`.
- **Dependencies:** none new — `Matrix::operator()` (Lesson 6) is all this needs.

### The New Code — type it yourself

```cpp
Matrix Matrix::minor(std::size_t skip_row, std::size_t skip_col) const {
    Matrix result(rows_ - 1, cols_ - 1);

    std::size_t dest_row = 0;
    for (std::size_t r = 0; r < rows_; r++) {
        if (r == skip_row) {
            continue;
        }
        std::size_t dest_col = 0;
        for (std::size_t c = 0; c < cols_; c++) {
            if (c == skip_col) {
                continue;
            }
            result(dest_row, dest_col) = (*this)(r, c);
            dest_col++;
        }
        dest_row++;
    }

    return result;
}
```

### The Updated Project

`matrix.h`'s class body, with the new declaration marked (`to_string` above it unchanged
from Lesson 6):

```cpp
    std::string to_string() const;

    Matrix minor(std::size_t skip_row, std::size_t skip_col) const;      // ← new
    double determinant() const;                                         // ← new (Concept Unit 3)

private:
    std::size_t rows_;
    std::size_t cols_;
    std::vector<double> data_;
};
```

### Mechanical walkthrough (new items only)

- `Matrix result(rows_ - 1, cols_ - 1);` — **(a) first appearance of a method that shrinks
  its own object's shape by a fixed amount.** Every previous `Matrix`-returning operation
  (Lessons 7 and 8) computed the result's shape from *its arguments'* dimensions; `minor` is
  the first to compute a new shape directly from `this` object's own `rows_`/`cols_`,
  shrunk by exactly one in each direction — always valid to call as long as `rows_ > 0` and
  `cols_ > 0`, since `std::size_t` is unsigned and `0 - 1` would wrap to a huge number rather
  than a sensible size (a real, currently-unguarded edge case, named honestly rather than
  fixed here — `minor` is only ever called from `determinant`, and never on a 1×1 matrix,
  which is `determinant`'s own base case, so this path is never actually exercised on
  something too small in practice).
- `std::size_t dest_row = 0;` maintained *separately* from the outer loop's own `r` — **(a)
  first appearance of tracking two independent indices through one loop.** `r` walks every
  row of the *original* matrix (`0` through `rows_ - 1`), including the skipped one;
  `dest_row` only advances when a row is actually *kept*, and is what indexes into `result`.
  Without this separate counter, skipping row `1` of a 3-row matrix would leave a gap at
  destination row `1` instead of correctly shifting row `2`'s data up to fill it.
- `if (r == skip_row) { continue; }` — **(b) reappearing pattern.** `continue` — familiar
  from ordinary loops — here specifically implements "don't advance `dest_row`, don't write
  anything, just skip straight to the next `r`" — the entire mechanism by which one row
  vanishes from the result.

### CS lens

Maintaining a separate "how many have I actually kept" counter alongside a loop that walks
every candidate, skipping some, is a **filter-and-compact** pattern: also recognized in any
"remove matching elements from an array in place" routine (two-pointer techniques in
algorithm interviews follow exactly this read-pointer/write-pointer shape), and in database
query execution filtering rows before writing them to an output buffer.

---

## Concept Unit 3: The real `determinant()`

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `matrix.h` (declaration already added in Concept Unit 2's Updated
  Project block), `matrix.cpp`.
- **Change type:** add.
- **Location:** `matrix.cpp`, immediately after `Matrix::minor`.
- **Dependencies:** `Matrix::minor` from Concept Unit 2.

### The New Code — type it yourself

```cpp
double Matrix::determinant() const {
    if (rows_ != cols_) {
        throw std::runtime_error("determinant is only defined for square matrices");
    }

    if (rows_ == 1) {
        return (*this)(0, 0);
    }

    double result = 0.0;
    double sign = 1.0;
    for (std::size_t col = 0; col < cols_; col++) {
        Matrix sub = minor(0, col);
        result += sign * (*this)(0, col) * sub.determinant();
        sign = -sign;
    }
    return result;
}
```

### The Updated Project

`matrix.cpp`, with `minor` (Concept Unit 2) and `determinant` appended after `to_string`
(unchanged from Lesson 6), before the free-function operators (unchanged from Lessons 7–8):

```cpp
Matrix Matrix::minor(std::size_t skip_row, std::size_t skip_col) const {
    // ... (shown in full in Concept Unit 2)
}

double Matrix::determinant() const {                                     // ← new
    if (rows_ != cols_) {                                                // ← new
        throw std::runtime_error("determinant is only defined for square matrices");  // ← new
    }                                                                    // ← new
                                                                           // ← new
    if (rows_ == 1) {                                                    // ← new
        return (*this)(0, 0);                                            // ← new
    }                                                                    // ← new
                                                                           // ← new
    double result = 0.0;                                                // ← new
    double sign = 1.0;                                                  // ← new
    for (std::size_t col = 0; col < cols_; col++) {                       // ← new
        Matrix sub = minor(0, col);                                      // ← new
        result += sign * (*this)(0, col) * sub.determinant();            // ← new
        sign = -sign;                                                   // ← new
    }                                                                    // ← new
    return result;                                                      // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- `if (rows_ != cols_) { throw ... }` — **(b) reappearing pattern.** The same
  precondition-check-before-doing-any-work shape as Lesson 7's `check_same_dimensions` and
  Lesson 8's inner-dimension check — determinant's own precondition (square) just happens to
  be a different rule than either.
- `if (rows_ == 1) { return (*this)(0, 0); }` — **(b) reappearing concept, this function's
  base case.** The recursion's stopping point, playing the exact role `n <= 1` played in
  Concept Unit 1's `sum` and Lesson 3's `factorial` — the smallest input this function knows
  how to answer directly, with no further recursive call.
- `Matrix sub = minor(0, col);` then `sub.determinant();` on the very next line — **(a) first
  appearance of a method calling itself indirectly, through a smaller instance of its own
  class.** This is the actual recursive call — not `determinant()` calling itself by name
  the way `factorial` did, but `this->determinant()` implicitly calling `sub.determinant()`,
  where `sub` is a genuinely different, smaller `Matrix` object built by `minor` moments
  earlier. Each level of recursion operates on a real, independent, one-smaller `Matrix` —
  never on `this` again — which is exactly why it terminates: `rows_` strictly decreases by
  one on every recursive call, until it hits the `rows_ == 1` base case.
- `sign = -sign;` alternating `1.0`, `-1.0`, `1.0`, ... across the loop — **(a) first
  appearance.** This is cofactor expansion's alternating-sign rule
  (mathematically, `(-1)^col`) implemented without ever computing a power — flipping a sign
  each iteration is both simpler and cheaper than calling a power function for something
  that only ever alternates between two values.

### CS lens

`determinant()`'s recursive structure — check a base case, otherwise do a bounded amount of
work per "branch" and recursively combine — is a **tree recursion**, the same shape a naive
recursive Fibonacci or a recursive tree-traversal has, distinct from `sum`'s (Concept Unit 1)
or `factorial`'s (Lesson 3) *linear* recursion, which only ever makes **one** recursive call
per invocation. Determinant makes `cols_` recursive calls per invocation — for an `n×n`
matrix, that's `n` calls, each on an `(n-1)×(n-1)` matrix, each of *those* making `n-1` calls
on `(n-2)×(n-2)` matrices, and so on — which is precisely why the naive algorithm's cost
grows so fast: this is genuinely exponential work (proportional to `n!`, since each level
multiplies the branching factor by one fewer), not the polynomial `O(n³)` Lesson 8's naive
multiplication cost. Faster determinant algorithms exist — computing it via LU decomposition
(factoring the matrix into a product of triangular matrices) runs in the same `O(n³)` that
matrix multiplication does — named here honestly, the same way Strassen's algorithm was
named in Lesson 8, without being built: this project's `determinant()` is the direct,
textbook cofactor-expansion definition, correct but not the fast way to compute it for large
matrices.

### SE lens

Recomputing `minor(0, col)` fresh, from scratch, at every single recursive call — rather than
somehow reusing work across the `cols_` different minors taken at one level — is a real,
accepted inefficiency. The alternative (computing all the minors more cleverly, sharing
structure between them) exists in real numerical libraries; it isn't built here because doing
so would obscure the direct, readable correspondence between this code and the textbook
cofactor-expansion definition it's implementing — for the matrix sizes this project's tests
actually use (2×2, 3×3), the cost difference is unmeasurable, and readability wins.

---

## Concept Unit 4: A function that wants a matrix, not a number

### The Problem

`FunctionCallExpression::evaluate` (Lesson 5, unchanged since) unconditionally calls
`argument.as_number()` before ever reaching `Environment::call` — which means calling
`det(A)` today would throw `"expected a number, got a matrix"` before `determinant()` ever
runs, regardless of how correct `Matrix::determinant()` itself is. `det` fundamentally needs
a matrix argument; `FunctionTable` (Lesson 5) was deliberately scoped to
`std::function<double(double)>` only — a genuine signature mismatch, not something the
existing table can be coaxed into handling.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.cpp` only.
- **Change type:** refactor `FunctionCallExpression::evaluate`.
- **Location:** whole method body.
- **Dependencies:** `Matrix::determinant` from Concept Unit 3.

### The New Code — type it yourself

```cpp
Value FunctionCallExpression::evaluate(Environment& env) const {
    Value argument = argument_->evaluate(env);

    if (argument.is_matrix()) {
        if (name_ == "det") {
            return Value::number(argument.as_matrix().determinant());
        }
        throw std::runtime_error("unknown matrix function: " + name_);
    }

    double result = env.call(name_, argument.as_number());
    return Value::number(result);
}
```

### The Updated Project

This *is* `FunctionCallExpression::evaluate`'s complete new body — nothing larger to place it
inside, since it's the whole method (the surrounding class and every other method in
`ast.cpp` are unchanged from Lesson 8).

### Mechanical walkthrough (new items only)

- `if (argument.is_matrix()) { ... }` checked **before** the existing `env.call(...)` line —
  **(a) first appearance of this branch point, and the actual fix for this lesson's central
  design gap.** This is a deliberate fork in the road, not an afterthought: a matrix argument
  never reaches `Environment::call`/`FunctionTable` (Lesson 5) at all now — it's handled
  entirely separately, by a small, explicit `if (name_ == "det")` check, with anything else
  (`sqrt`, an as-yet-unbuilt `inverse`) falling to `throw std::runtime_error("unknown matrix
  function: " + name_);`.
- `argument.as_matrix().determinant()` — **(b) reappearing pattern, new call.** The familiar
  `as_matrix()`/`as_number()` extraction from Lesson 6, immediately followed by calling the
  brand-new `Matrix::determinant()` from Concept Unit 3 — the actual moment this lesson's new
  math connects to the interpreter.
- The un-changed tail, `double result = env.call(name_, argument.as_number());` — **(b)
  reappearing code, now reached conditionally.** Exactly Lesson 5's original line, now only
  reached when `argument.is_matrix()` was false — the scalar function path (`sqrt`, `sin`,
  `cos`, `abs`) is completely untouched in behavior, just no longer the *only* path through
  this method.

### CS lens

This `if (argument.is_matrix())` check, right at the top of `FunctionCallExpression::evaluate`,
is doing the same kind of work Lesson 7's `BinaryExpression::evaluate` dispatch does for
binary operators — deciding behavior based on a value's runtime kind, by hand, because
ordinary C++ virtual dispatch (Lesson 3) only solves this automatically for a *method call on
one object*, not for "which of several unrelated built-in behaviors should a function name
resolve to, given what was actually passed." Naming this explicitly: this project now has
*two* separate places (here, and `BinaryExpression`) independently reimplementing a small
piece of type-based dispatch, by hand, because nothing in this project's design centralizes
"dispatch on a `Value`'s kind" into one reusable mechanism. That's a real, accumulating cost
worth naming rather than hiding — not fixed this lesson, but worth watching as more
matrix-aware operations get added.

### SE lens

The alternative rejected here was extending `FunctionTable` itself — say, adding a second
internal map, `std::unordered_map<std::string, std::function<double(const Matrix&)>>`,
alongside the existing scalar one, and having `Environment::call` try both. The real tradeoff:
that keeps *all* function dispatch (scalar and matrix) behind one interface
(`Environment::call`), which is more uniform — but it means `FunctionTable`, whose entire
design in Lesson 5 was "every built-in has the exact same signature, `double(double)`," would
now need to support two genuinely different signatures, which either means two parallel maps
inside one class (duplicating Lesson 5's registration pattern) or a more general `Value(Value)`
signature for *every* built-in, including the simple scalar ones, which would cost real
clarity for the common case just to accommodate the rare one. Handling `det` as a special
case directly in `FunctionCallExpression`, at least for now — with exactly one matrix
function existing — costs less than generalizing `FunctionTable` prematurely for a pattern
that's only appeared once.

---

## Concept Unit 5: A real bug, found by actually testing this

### The Problem

Testing `det` against something more interesting than a positive-integer-only 2×2 matrix — the
classic textbook example `[6 1 1; 4 -2 5; 2 8 7]` — failed to even parse, with
`error: expected a number, ';', or ']' in matrix literal (got MINUS)`. This is exactly the
unary-minus gap Lesson 3's exercises flagged as unaddressed ("this project deliberately
left this undone") — it simply never blocked anything until a matrix literal actually needed
a negative entry.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.cpp` only.
- **Change type:** add one branch to `parse_matrix`'s dispatch loop.
- **Location:** `parse_matrix`, immediately after the existing `Number` check.
- **Dependencies:** `check_next` (Lesson 4/5) — reused again, for a third distinct purpose.

### The New Code — type it yourself

```cpp
        } else if (check(TokenType::Minus) && check_next(TokenType::Number)) {
            advance();
            Token number = advance();
            current_row.push_back(-std::stod(number.text));
```

### The Updated Project

`parse_matrix`'s dispatch loop, in full — the `Number`, `Semicolon`, and `RBracket` branches
are unchanged from Lesson 6:

```cpp
    while (true) {
        if (check(TokenType::Number)) {
            current_row.push_back(std::stod(advance().text));
        } else if (check(TokenType::Minus) && check_next(TokenType::Number)) {  // ← new
            advance();                                                  // ← new
            Token number = advance();                                   // ← new
            current_row.push_back(-std::stod(number.text));             // ← new
        } else if (check(TokenType::Semicolon)) {
            advance();
            rows.push_back(current_row);
            current_row.clear();
        } else if (check(TokenType::RBracket)) {
            rows.push_back(current_row);
            advance();
            break;
        } else {
            throw std::runtime_error("expected a number, '-', ';', or ']' in matrix literal (got " + token_type_name(peek().type) + ")");  // ← changed
        }
    }
```

### Mechanical walkthrough (new items only)

- `check(TokenType::Minus) && check_next(TokenType::Number)` — **(b) reappearing pattern, a
  third distinct use.** The same two-token lookahead tool as Lesson 4's
  assignment-vs-expression check and Lesson 5's function-call-vs-variable check — here
  confirming a `-` is genuinely followed by a number (rather than, say, a stray `-` before a
  `]`) before committing to treating it as a negative literal.
- `current_row.push_back(-std::stod(number.text));` — **(a) first appearance of applying
  unary negation to a parsed literal.** `std::stod` parses the digit text exactly as it did
  in the plain `Number` branch; the leading `-` (a *separate token*, produced by the lexer's
  existing `Minus` case since Lesson 4 — no lexer change needed at all) is applied afterward,
  by hand, as ordinary arithmetic negation.
- **What this fix does *not* do**, worth stating as plainly as the fix itself: `"-5"` typed
  as a bare, freestanding expression (outside a matrix literal — `parse_factor`'s own
  `Number`/`Identifier`/`LParen`/`LBracket` branches) still has no `Minus`-prefix handling at
  all, and still fails exactly as it has since Lesson 3's exercises first flagged it. This
  fix is narrowly scoped to matrix literals, where it was blocking real, otherwise-correct
  determinant testing — not a general unary-minus feature.

### CS lens

Fixing a gap only once it actually blocks something real — rather than preemptively handling
every theoretically-possible input up front — is a genuinely common, defensible engineering
rhythm: build the common case, note the gaps explicitly (as this project has, repeatedly,
since Lesson 3), and close a specific gap the moment it stops being theoretical. The risk
this rhythm accepts, worth naming honestly: gaps can sit unnoticed for a long time (this one
did, for six lessons) if nothing ever exercises them — which is exactly why deliberately
testing against varied, realistic input (a real textbook example, not just convenient small
positive integers) matters, and is exactly what surfaced this one.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "det(A)"
-2

$ curl -X POST http://localhost:8080/evaluate -d "M = [6 1 1; 4 -2 5; 2 8 7]"
[6 1 1; 4 -2 5; 2 8 7]

$ curl -X POST http://localhost:8080/evaluate -d "det(M)"
-306

$ curl -X POST http://localhost:8080/evaluate -d "N = [1 2 3]"
[1 2 3]

$ curl -X POST http://localhost:8080/evaluate -d "det(N)"
error: determinant is only defined for square matrices

$ curl -X POST http://localhost:8080/evaluate -d "inverse(A)"
error: unknown matrix function: inverse

$ curl -X POST http://localhost:8080/evaluate -d "sqrt(16)"
4

$ curl -X POST http://localhost:8080/evaluate -d "sqrt(A)"
error: unknown matrix function: sqrt
```

Server's own log, real output, all nine requests:

```
math engine listening on port 8080
[09:38:10] POST /evaluate body="A = [1 2; 3 4]"
[09:38:10] POST /evaluate body="det(A)"
[09:38:10] POST /evaluate body="M = [6 1 1; 4 -2 5; 2 8 7]"
[09:38:10] POST /evaluate body="det(M)"
[09:38:10] POST /evaluate body="N = [1 2 3]"
[09:38:10] POST /evaluate body="det(N)"
[09:38:10] POST /evaluate body="inverse(A)"
[09:38:10] POST /evaluate body="sqrt(16)"
[09:38:10] POST /evaluate body="sqrt(A)"
```

`det(A) = -2` matches `1×4 − 2×3` by hand. `det(M) = -306` matches a well-known textbook
determinant example exactly — real, independent confirmation the recursive cofactor
expansion is correct, not just "ran without crashing." `det(N)` (a 1×3, non-square) correctly
rejects with the specific "square matrices only" message from `Matrix::determinant()` itself.
`sqrt(A)` is worth comparing against Lesson 6's version of this exact test: the error message
changed, from `"expected a number, got a matrix"` (Lesson 6, thrown inside `Value::as_number`)
to `"unknown matrix function: sqrt"` (this lesson, thrown inside
`FunctionCallExpression::evaluate` itself) — a direct, visible consequence of Concept Unit 4's
new branch intercepting matrix arguments before they ever reach `as_number()` at all. Both
messages are honest and accurate; which reads more helpfully is a matter of judgment, noted
here rather than silently changed without comment.

### Connect

`det` now works end to end, correctly, on real examples. `inverse(A)` is the one operation
doc1's own project list groups with determinant that this lesson deliberately leaves
unbuilt — computing a matrix inverse needs the *adjugate* (a whole matrix of cofactors, not
just their sum) divided by the determinant just built here, which is real, additional work
this lesson's scope doesn't include. That's a natural next lesson, not a hidden gap.

---

## Closing

### Connect the pieces

Trace `det(M)` end to end, with `M = [6 1 1; 4 -2 5; 2 8 7]` already stored: Lesson 1's
socket/HTTP layer, untouched, delivers the body → the lexer, untouched this lesson, produces
`IDENTIFIER(det) LPAREN IDENTIFIER(M) RPAREN END` → the parser (Lesson 5's function-call
branch, unmodified) builds `FunctionCallExpression("det", VariableExpression("M"))` →
`evaluate(environment)`: `M` resolves to a `Value` wrapping the stored `3×3` matrix →
Concept Unit 4's new `if (argument.is_matrix())` branch fires, sees `name_ == "det"`, and
calls `argument.as_matrix().determinant()` → `Matrix::determinant()` (Concept Unit 3) sees
`rows_ == cols_ == 3`, not the base case, and loops over three columns: for each, `minor(0,
col)` (Concept Unit 2) builds a real `2×2` submatrix, and `sub.determinant()` recurses — each
of *those* calls hits the `rows_ == 1` base case after one more level of `minor`/recursion —
the alternating `sign` and the running `result` accumulate the three terms
`6×(det of the top-left 2×2 minor)`, minus `1×(...)`, plus `1×(...)` → `-306` returns all the
way back up → wrapped in `Value::number(-306)` → `Value::to_string()` (Lesson 6) formats it
cleanly → sent back over HTTP by Lesson 1's completely untouched response-writing code.

### What breaks without this

In `Matrix::determinant()`, temporarily remove the base case:

```cpp
double Matrix::determinant() const {
    if (rows_ != cols_) {
        throw std::runtime_error("determinant is only defined for square matrices");
    }

    // if (rows_ == 1) {
    //     return (*this)(0, 0);
    // }

    double result = 0.0;
    double sign = 1.0;
    for (std::size_t col = 0; col < cols_; col++) {
        Matrix sub = minor(0, col);
        result += sign * (*this)(0, col) * sub.determinant();
        sign = -sign;
    }
    return result;
}
```

Rebuild, and send `"det(A)"` again (`A` a `2×2`). Real result, worth running rather than
predicting: the program does not return an answer at all — it keeps recursing, each level
calling `minor(0, col)` on an ever-smaller matrix (`2×2` → `1×1` → `0×0` → an attempt to
build a matrix with `rows_ - 1` on an already-`0` value, wrapping to a huge unsigned number,
per Concept Unit 2's honestly-named unguarded edge case) — in practice, this either crashes
outright (memory allocation failure trying to build a nonsensically huge matrix) or hangs.
This is **unbounded recursion** — a recursive function with no reachable base case is exactly
as broken as a `while (true)` loop with no `break`, just expressed through function calls
instead of a loop. Restore the base case before moving on — it's not a minor detail
finishing off `determinant`, it's the entire reason the function terminates at all.

### Exercises

- Trace `det(A)` by hand for `A = [1 2; 3 4]`, writing out every recursive call the way the
  "Connect the pieces" section did for `det(M)` — confirm you land on `result = 1×4 − 2×3 =
  -2` by following the actual code path, not just recomputing the 2×2 shortcut formula from
  memory.
- `det` on a `1×1` matrix (`det([5])`) hits the base case on the very first call, with no
  recursion at all. Confirm this with `curl`, and identify which line in `determinant()`
  handles it.
- Now that matrix literals support a leading `-` on a number, trace by hand whether `"[1
  --2]"` (two minus signs in a row) is accepted or rejected by the current
  `check(TokenType::Minus) && check_next(TokenType::Number)` condition, and verify your
  prediction against the real server.

### Definition of done

- [ ] `matrix.h`/`matrix.cpp` compile cleanly with `minor` and `determinant` added.
- [ ] `ast.cpp` compiles with `FunctionCallExpression::evaluate` restructured into the
      matrix/scalar branch.
- [ ] `parser.cpp` compiles with negative-number support inside matrix literals.
- [ ] `det(A)` for `A = [1 2; 3 4]` returns `-2`.
- [ ] `det(M)` for `M = [6 1 1; 4 -2 5; 2 8 7]` returns `-306`, matching the known textbook
      example.
- [ ] `det(N)` for a non-square `N` reports the specific "square matrices only" error.
- [ ] `inverse(A)` and `sqrt(A)` both fail with clear, distinct errors, and ordinary scalar
      functions (`sqrt(16)`) are unaffected.
- [ ] The "what breaks without this" exercise (removing the base case) was actually run and
      reverted.
- [ ] Commit:

```
git add matrix.h matrix.cpp ast.cpp parser.cpp
git commit -m "Add det(A) via recursive cofactor expansion

Matrix::minor() builds an (n-1)x(n-1) matrix by deleting one row
and column; Matrix::determinant() recurses on minors along the
first row with alternating sign, base case at 1x1. This is tree
recursion (n calls per level, not 1), so naive cost grows like n!,
worse than multiplication's O(n^3) - named honestly; LU-decomposition-
based determinant (also O(n^3)) exists and isn't implemented.

FunctionCallExpression::evaluate now branches on the argument's
kind before reaching FunctionTable: a matrix argument is handled
by a small hardcoded check (currently just "det") rather than
generalizing FunctionTable to a second signature - a deliberate
scope decision, revisited only if more matrix functions arrive.
This changes sqrt(A)'s error message from Lesson 6's generic type
error to a more specific "unknown matrix function" message.

Also fixes a real bug this lesson's own testing surfaced: matrix
literals with negative numbers (e.g. containing -2) failed to
parse at all, since nothing exercised that path before now. Fix
is scoped to matrix literals only - unary minus as a general
expression (bare "-5") remains unimplemented, per Lesson 3."
```

Next lesson: `inverse(A)` — the adjugate matrix (a whole matrix of cofactors, not just their
signed sum) divided by the determinant this lesson just built, completing the pair doc1's
own project list groups together.
