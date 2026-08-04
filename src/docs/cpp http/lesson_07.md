# Lesson 7: A + B

**What you will build:** free-function `operator+` and `operator-` for `Matrix`, dimension
checking that fails loudly on mismatched shapes, and a restructured
`BinaryExpression::evaluate` that dispatches on *both* operands' kinds — number+number,
matrix+matrix, or a clear error for anything mixed — so `A + B` and `A - B` actually compute,
while `A * B` (real matrix multiplication, a different algorithm entirely) stays honestly
unimplemented until Lesson 8. The transferable problem: Lesson 3's polymorphism (`evaluate()`
picks the right behavior based on *one* object's type) doesn't, by itself, answer "what
should `+` do for *two* values whose types you don't know until runtime, and might not even
match each other?" That's a genuinely different, harder problem than ordinary single-object
dispatch, and this lesson solves it the direct way — explicit checks — while naming why that
's a real, known limitation of the tool this project has been using since Lesson 3.

**What you need to know first:** Lesson 6's `Matrix`, `Value`, and the `BinaryExpression`
guard it added (`"matrix arithmetic is not supported yet"`) — this lesson replaces that
single blanket check with something more specific.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
                                            ▲                                      ▲
                                            └── this lesson's dispatch logic       └── this lesson's operator+/operator-
```

No lexer or parser changes this lesson — `A + B` already parses correctly as of Lesson 6
(`BinaryExpression(Plus, VariableExpression("A"), VariableExpression("B"))`); the only thing
that was missing was what `evaluate()` does once both sides turn out to be matrices. Carrying
`A = [1 2; 3 4]`, `B = [5 6; 7 8]`, then `A + B` through: two separate prior requests store
`A` and `B` in `Environment` (Lesson 4's persistence, Lesson 6's `Value` storage). The third
request's `BinaryExpression::evaluate` resolves both variables, sees two matrices, calls the
new `operator+`, and returns `Value::matrix([6 8; 10 12])`.

---

## Concept Unit 1: An operator that isn't a member

### The Problem

Lesson 6's `Matrix::operator()` had to be a member function — indexing syntax
(`matrix(r, c)`) only makes sense "on" a specific `Matrix`. Addition is different: `A + B`
treats both sides symmetrically — there's no obvious reason `A` should "own" the `+` any
more than `B` does. Worth seeing this shape in isolation before writing it for `Matrix`.

### Introduce the concept in isolation

```cpp
#include <iostream>

struct Point {
    double x;
    double y;
};

Point operator+(const Point& lhs, const Point& rhs) {
    return Point{lhs.x + rhs.x, lhs.y + rhs.y};
}

int main() {
    Point a{1, 2};
    Point b{3, 4};
    Point c = a + b;
    std::cout << "c = (" << c.x << ", " << c.y << ")\n";
    return 0;
}
```

Real output:

```
c = (4, 6)
```

### Discard

This `Point` example is deleted. `Matrix`'s own `operator+`/`operator-` (next unit) follow
the identical shape — a free function taking two `const Matrix&` parameters, not a method
on either one.

### Mechanical walkthrough

- `Point operator+(const Point& lhs, const Point& rhs)` declared **outside** the `struct
  Point` body — **(a) first appearance of a free-function operator overload.** Unlike
  `Matrix::operator()` from Lesson 6 (a member, called as `matrix(...)`, implicitly
  operating on the object before the dot — except there's no dot for `()`), this `operator+`
  is an ordinary standalone function that happens to have a special name; `a + b` is exactly
  equivalent to writing `operator+(a, b)` directly.
- `Point c = a + b;` — **(b) reappearing syntax, new meaning.** `+` here is not addition on
  any built-in numeric type — it's calling the function just defined, resolved by the
  compiler because one of `+`'s operands (`a`, a `Point`) matches a `Point` overload of
  `operator+` that exists in scope.

### CS lens

Choosing a free function over a member here is the standard C++ idiom for **symmetric binary
operators** specifically because it treats both operands identically — a member `operator+`
(`Point::operator+(const Point& other)`) would technically still work for `a + b`, but would
read as "`a`'s `+`, given `b`," subtly privileging the left operand, and would also block any
future scenario where the left-hand side needs an implicit conversion into a `Point` (a
member function can never be found via implicit conversion on the object it's called on,
only on its arguments). Also recognized in: `std::string`'s own `operator+` for concatenation
is a free function for exactly this reason, and `operator<<` for `std::cout` (used constantly
since Lesson 1) is a free function too, not a member of `iostream`.

---

## Concept Unit 2: Real matrix addition and subtraction

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `matrix.h`, `matrix.cpp` — both existing since Lesson 6.
- **Change type:** add two free functions and one private helper.
- **Location:** `matrix.h`, after the `Matrix` class body; `matrix.cpp`, after
  `Matrix::to_string`.
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
static void check_same_dimensions(const Matrix& lhs, const Matrix& rhs, const std::string& operation) {
    if (lhs.rows() != rhs.rows() || lhs.cols() != rhs.cols()) {
        throw std::runtime_error(
            "matrix dimensions do not match for " + operation + ": " +
            std::to_string(lhs.rows()) + "x" + std::to_string(lhs.cols()) + " vs " +
            std::to_string(rhs.rows()) + "x" + std::to_string(rhs.cols()));
    }
}

Matrix operator+(const Matrix& lhs, const Matrix& rhs) {
    check_same_dimensions(lhs, rhs, "addition");

    Matrix result(lhs.rows(), lhs.cols());
    for (std::size_t r = 0; r < lhs.rows(); r++) {
        for (std::size_t c = 0; c < lhs.cols(); c++) {
            result(r, c) = lhs(r, c) + rhs(r, c);
        }
    }
    return result;
}
```

### The Updated Project

`matrix.h`'s tail, with the two new declarations marked (the `Matrix` class itself is
unchanged from Lesson 6):

```cpp
    std::string to_string() const;

private:
    std::size_t rows_;
    std::size_t cols_;
    std::vector<double> data_;
};

Matrix operator+(const Matrix& lhs, const Matrix& rhs);                  // ← new
Matrix operator-(const Matrix& lhs, const Matrix& rhs);                  // ← new
```

`matrix.cpp`'s tail, in full — `check_same_dimensions`, `operator+` (shown above), and
`operator-`:

```cpp
static void check_same_dimensions(const Matrix& lhs, const Matrix& rhs, const std::string& operation) {  // ← new
    if (lhs.rows() != rhs.rows() || lhs.cols() != rhs.cols()) {          // ← new
        throw std::runtime_error(                                      // ← new
            "matrix dimensions do not match for " + operation + ": " +  // ← new
            std::to_string(lhs.rows()) + "x" + std::to_string(lhs.cols()) + " vs " +  // ← new
            std::to_string(rhs.rows()) + "x" + std::to_string(rhs.cols()));  // ← new
    }                                                                    // ← new
}                                                                         // ← new

Matrix operator+(const Matrix& lhs, const Matrix& rhs) {                 // ← new
    check_same_dimensions(lhs, rhs, "addition");                         // ← new

    Matrix result(lhs.rows(), lhs.cols());                               // ← new
    for (std::size_t r = 0; r < lhs.rows(); r++) {                       // ← new
        for (std::size_t c = 0; c < lhs.cols(); c++) {                   // ← new
            result(r, c) = lhs(r, c) + rhs(r, c);                        // ← new
        }                                                                // ← new
    }                                                                    // ← new
    return result;                                                      // ← new
}                                                                         // ← new

Matrix operator-(const Matrix& lhs, const Matrix& rhs) {                 // ← new
    check_same_dimensions(lhs, rhs, "subtraction");                      // ← new

    Matrix result(lhs.rows(), lhs.cols());                               // ← new
    for (std::size_t r = 0; r < lhs.rows(); r++) {                       // ← new
        for (std::size_t c = 0; c < lhs.cols(); c++) {                   // ← new
            result(r, c) = lhs(r, c) - rhs(r, c);                        // ← new
        }                                                                // ← new
    }                                                                    // ← new
    return result;                                                      // ← new
}                                                                         // ← new
```

`#include <stdexcept>` is also added to `matrix.cpp`'s includes, alongside the existing
`"format.h"` and `<sstream>`, since this is the first place in `matrix.cpp` itself that
throws.

### Mechanical walkthrough (new items only)

- `static void check_same_dimensions(...)` at file scope in `matrix.cpp`, **not** declared
  in `matrix.h` — **(a) first appearance of an internal (translation-unit-local) helper.**
  `static` on a free function at file scope means it has **internal linkage** — it exists
  only inside `matrix.cpp`'s own compiled object file and is completely invisible to any
  other `.cpp` file, even ones that `#include "matrix.h"`. This is deliberate: nothing
  outside `matrix.cpp` needs to call this check directly, so it isn't part of `Matrix`'s
  public interface at all — a smaller public surface than putting it in the header would
  give.
- The dimension-mismatch message building `"2x2 vs 1x3"` style text via repeated
  `std::to_string` and string concatenation — **(b) reappearing pattern.** The same
  `+`-based string building `Lexer::tokenize()`'s error messages and `Parser::expect`'s error
  messages have used since Lesson 2 — nothing new here beyond applying it to four numbers
  instead of one token name.
- `Matrix result(lhs.rows(), lhs.cols());` followed by a nested loop writing into
  `result(r, c)` via the non-`const` `operator()` from Lesson 6 — **(b) reappearing
  pattern.** Structurally identical to `parse_matrix`'s own loop building a `Matrix` from
  parsed literal values (Lesson 6) — construct at the right size (zero-filled by the
  constructor), then fill it in, element by element, using the exact same indexing operator
  a matrix literal's construction used.
- Two nearly-identical functions (`operator+`, `operator-`) differing only in one operator
  (`+` vs `-`) and one string (`"addition"` vs `"subtraction"`) — **(a) first appearance of
  this specific duplication, named honestly.** This is a real, small case of repeated logic
  that a more advanced technique (a function template parameterized on the operation) could
  collapse into one implementation — deliberately not done here, since introducing C++
  templates for two five-line functions would cost more in unfamiliar syntax than it saves in
  duplication; a real judgment call, revisited only if a third or fourth near-identical
  operator shows up later.

### CS lens

Checking `lhs.rows() != rhs.rows() || lhs.cols() != rhs.cols()` before doing any element-wise
work is a **precondition check** — verifying an operation's requirements are met *before*
attempting it, rather than partway through (which, here, could otherwise mean silently
reading past the shorter matrix's actual data with no bounds checking, since `operator()`
does none). Also recognized in: array bounds checks in safer languages, type checks before a
function call in a dynamically-typed language's runtime, and database transaction
preconditions ("does this account have sufficient balance") checked before any balance is
actually modified.

---

## Concept Unit 3: `BinaryExpression` learns to ask both operands what they are

### The Problem

Lesson 6's `BinaryExpression::evaluate` had exactly one branch: "both numbers, or reject
outright." That blanket rejection is what's actually standing between this project and real
matrix arithmetic — it needs to become a genuine three-way decision: both numbers (existing
scalar path), both matrices (new path, this lesson), or one of each (a real, permanent error
— adding a matrix to a bare number is never going to mean something in this project without
a deliberate, separate broadcasting feature this lesson doesn't build).

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.cpp` only — `ast.h`'s declaration of
  `BinaryExpression::evaluate` doesn't change, only its body.
- **Change type:** refactor.
- **Location:** `BinaryExpression::evaluate`, replacing the entire body from Lesson 6.
- **Dependencies:** `operator+`/`operator-` from Concept Unit 2.

### The New Code — type it yourself

```cpp
    if (lhs.is_matrix() && rhs.is_matrix()) {
        const Matrix& l = lhs.as_matrix();
        const Matrix& r = rhs.as_matrix();

        switch (op_) {
            case TokenType::Plus:  return Value::matrix(l + r);
            case TokenType::Minus: return Value::matrix(l - r);
            default:
                throw std::runtime_error("this operator is not supported between two matrices yet");
        }
    }
```

### The Updated Project

`BinaryExpression::evaluate`, in full — the number-only branch is unchanged from Lesson 6,
just no longer the *only* branch:

```cpp
Value BinaryExpression::evaluate(Environment& env) const {
    Value lhs = left_->evaluate(env);
    Value rhs = right_->evaluate(env);

    if (lhs.is_number() && rhs.is_number()) {                           // ← changed (was: negated single check)
        double l = lhs.as_number();
        double r = rhs.as_number();

        switch (op_) {
            case TokenType::Plus:  return Value::number(l + r);
            case TokenType::Minus: return Value::number(l - r);
            case TokenType::Star:  return Value::number(l * r);
            case TokenType::Slash: return Value::number(l / r);
            default:
                throw std::runtime_error("unsupported operator in BinaryExpression");
        }
    }

    if (lhs.is_matrix() && rhs.is_matrix()) {                           // ← new
        const Matrix& l = lhs.as_matrix();                               // ← new
        const Matrix& r = rhs.as_matrix();                               // ← new

        switch (op_) {                                                  // ← new
            case TokenType::Plus:  return Value::matrix(l + r);          // ← new
            case TokenType::Minus: return Value::matrix(l - r);          // ← new
            default:                                                    // ← new
                throw std::runtime_error("this operator is not supported between two matrices yet");  // ← new
        }                                                                // ← new
    }                                                                    // ← new

    throw std::runtime_error("cannot combine a number and a matrix");    // ← new
}
```

### Mechanical walkthrough (new items only)

- `if (lhs.is_number() && rhs.is_number())` replacing Lesson 6's
  `if (!lhs.is_number() || !rhs.is_number()) { throw ...; }` — **(a) first appearance of
  this restructuring.** Logically, Lesson 6's guard and this lesson's first condition test
  the *same* thing (both numbers), but Lesson 6 wrote it as "reject if not both numbers, then
  proceed" — a shape that only makes sense when there's exactly one other case. This lesson
  needs a genuine three-way branch (both numbers / both matrices / mixed), which reads far
  more clearly as three positive conditions in sequence than as a negated guard followed by
  two more special cases bolted on.
- `const Matrix& l = lhs.as_matrix();` — **(b) reappearing pattern, new type.** The identical
  shape as the scalar branch's `double l = lhs.as_number();`, just extracting the matrix
  alternative instead — a `const&` here (not a copy) since `Matrix` genuinely owns a
  `std::vector`'s worth of data and there's no reason to copy it just to read from it.
- `return Value::matrix(l + r);` inside the matrix branch's `switch` — **(b) reappearing
  pattern, new call.** `l + r` calls Concept Unit 2's new free-function `operator+` (found by
  the compiler because `l` and `r` are `const Matrix&`), producing a real `Matrix`, which
  `Value::matrix(...)` (Lesson 6) wraps back into a `Value` the rest of this project already
  knows how to store, return, and print.
- The final, unconditional `throw std::runtime_error("cannot combine a number and a
  matrix");` after both `if` blocks — **(a) first appearance of this specific fallthrough
  case.** Reached only when neither `if` matched — meaning one operand is a number and the
  other a matrix (the only remaining possibility, since `Value` only ever holds one of
  exactly two alternatives). This is a real, permanent design decision, not a temporary gap:
  this project does not support implicitly treating a bare number as, say, a 1×1 matrix or
  broadcasting it across a matrix's elements — an operation like `A + 1` staying an error is
  intentional, not merely unimplemented yet.

### CS lens

What this `BinaryExpression::evaluate` is doing — choosing behavior based on the runtime
types of **two** values together, not just one — is a well-known hard problem in
object-oriented language design called **multiple dispatch** (or the "binary method problem"
for the two-argument case specifically). Lesson 3's ordinary virtual functions give you
**single dispatch**: calling `expr->evaluate()` picks the right code based on *one* object's
real type, automatically, via the vtable mechanism. Getting the *combination* of two
objects' types to pick the right code — the way `A + B` needs "matrix, matrix" to behave
differently from "number, number" or "number, matrix" — is not something C++'s ordinary
virtual functions solve for you at all; this project handles it the direct way, with explicit
`is_number()`/`is_matrix()` checks, precisely because true multiple dispatch (each pair of
types automatically routing to its own handler, the way single dispatch does for one type)
would need a substantially more elaborate mechanism (a "visitor" pattern with double
dispatch, or a per-pair-of-types lookup table) that isn't worth the complexity for two value
kinds. Also recognized in: this exact problem is why languages like Python and Julia offer
genuine multiple dispatch as a language feature — Julia's entire design is organized around
solving precisely this "what does `+` mean for these two runtime types" problem generally,
rather than case by case as this project does.

### SE lens

The alternative rejected here was adding a `combine(const Value& other, TokenType op)` method
directly on `Value`, so `BinaryExpression` could write `lhs.combine(rhs, op_)` instead of
branching on both operands' kinds itself. The real tradeoff: that would move the "what
combinations are legal" knowledge *into* `Value`, which currently knows nothing at all about
arithmetic — only about being a self-aware container for one of two kinds (Lesson 6's whole
point). Keeping the dispatch logic in `BinaryExpression` instead means `Value` stays a pure
data-holding abstraction, and every rule about what `+`/`-`/`*`/`/` mean for which
combinations lives in exactly one place, the place actually named for "a binary operation" —
worth the modest cost of `BinaryExpression::evaluate` itself growing longer.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "B = [5 6; 7 8]"
[5 6; 7 8]

$ curl -X POST http://localhost:8080/evaluate -d "A + B"
[6 8; 10 12]

$ curl -X POST http://localhost:8080/evaluate -d "A - B"
[-4 -4; -4 -4]

$ curl -X POST http://localhost:8080/evaluate -d "C = [1 2 3]"
[1 2 3]

$ curl -X POST http://localhost:8080/evaluate -d "A + C"
error: matrix dimensions do not match for addition: 2x2 vs 1x3

$ curl -X POST http://localhost:8080/evaluate -d "A + 1"
error: cannot combine a number and a matrix

$ curl -X POST http://localhost:8080/evaluate -d "A * B"
error: this operator is not supported between two matrices yet

$ curl -X POST http://localhost:8080/evaluate -d "x = 5"
5

$ curl -X POST http://localhost:8080/evaluate -d "x + 10"
15
```

Server's own log, real output, all ten requests:

```
math engine listening on port 8080
[10:28:27] POST /evaluate body="A = [1 2; 3 4]"
[10:28:27] POST /evaluate body="B = [5 6; 7 8]"
[10:28:27] POST /evaluate body="A + B"
[10:28:27] POST /evaluate body="A - B"
[10:28:27] POST /evaluate body="C = [1 2 3]"
[10:28:27] POST /evaluate body="A + C"
[10:28:27] POST /evaluate body="A + 1"
[10:28:27] POST /evaluate body="A * B"
[10:28:27] POST /evaluate body="x = 5"
[10:28:27] POST /evaluate body="x + 10"
```

`A + B` and `A - B` both compute the correct element-wise results across two matrices stored
in two *separate* prior requests — proof `Environment`'s persistence (Lesson 4) and `Value`'s
matrix storage (Lesson 6) both compose correctly with this lesson's new arithmetic.
`A + C`'s dimension-mismatch message reports the actual shapes involved (`2x2 vs 1x3`), not
just "dimensions don't match." `A + 1` and `A * B` prove the two remaining branches of the
three-way dispatch — mixed types, and an unimplemented matrix operator — both fail with
distinct, specific messages rather than one generic error. `x + 10` at the end proves the
scalar path, untouched in behavior since Lesson 4, still works exactly as before.

### Connect

`Matrix::operator()`'s read/write access, built in Lesson 6 and unused by anything until now,
finally does real work — every element of `operator+`/`operator-`'s result matrices is
written through it. What's still missing is the operation doc1's own project list calls out
as fundamentally different: `A * B`, real matrix multiplication, which — unlike element-wise
addition — isn't "do the same op at every matching position" at all; it requires each
element of the result to be a sum of products across a whole row and column, a genuinely
different algorithm shape. That's Lesson 8.

---

## Closing

### Connect the pieces

Trace `A + B` end to end, with `A = [1 2; 3 4]` and `B = [5 6; 7 8]` already stored from two
earlier requests: Lesson 1's socket/HTTP layer delivers `"A + B"` unchanged → Lesson 2's
`Lexer`, unmodified, produces `IDENTIFIER(A) PLUS IDENTIFIER(B) END` → Lesson 3's parser
(via `parse_expression`/`parse_term`/`parse_factor`, all unmodified since Lesson 5) builds
`BinaryExpression(Plus, VariableExpression("A"), VariableExpression("B"))` →
`evaluate(environment)` runs: both `VariableExpression`s resolve via `Environment::get`
(Lesson 4/6) to `Value`s wrapping the two stored matrices → this lesson's new dispatch sees
`lhs.is_matrix() && rhs.is_matrix()` is true → `l + r` calls the free-function `operator+`
(Concept Unit 2), which checks dimensions match (`2x2` and `2x2`, fine), builds a fresh
`Matrix(2, 2)`, and fills it element-by-element using `operator()` from Lesson 6 → wrapped
back into a `Value::matrix(...)` → `server.cpp`'s `Value::to_string()` (Lesson 6) delegates
to `Matrix::to_string()`, producing `"[6 8; 10 12]"` → sent back over HTTP by Lesson 1's
completely untouched response-writing code.

### What breaks without this

In `Matrix::operator+`, temporarily remove the dimension check:

```cpp
Matrix operator+(const Matrix& lhs, const Matrix& rhs) {
    // check_same_dimensions(lhs, rhs, "addition");

    Matrix result(lhs.rows(), lhs.cols());
    for (std::size_t r = 0; r < lhs.rows(); r++) {
        for (std::size_t c = 0; c < lhs.cols(); c++) {
            result(r, c) = lhs(r, c) + rhs(r, c);
        }
    }
    return result;
}
```

Rebuild, and send `"A + C"` again (`A` a 2×2, `C` a 1×3). Real result, worth actually running
rather than predicting: the loop bounds come from `lhs.rows()`/`lhs.cols()` (`A`'s shape,
2×2), so it reads `rhs(r, c)` — `C`'s data — at positions like `(1, 0)` and `(1, 1)` that
`C`'s own `1×3` shape never actually has, silently reading past the end of `C`'s
3-element `data_` vector. This is undefined behavior — it may produce garbage numbers, may
crash, or may (worse) appear to work by accident on this particular run, which is exactly
why undefined behavior is dangerous: nothing guarantees the failure is obvious. Restore the
dimension check before moving on — this is precisely the bug class Concept Unit 2's
precondition check exists to prevent, made concrete rather than theoretical.

### Exercises

- `Matrix::operator-` and `operator+` are near-duplicates, flagged honestly as such in
  Concept Unit 2's walkthrough. As an exercise only (not required for this lesson's
  Definition of Done), sketch — in comments or on paper, not necessarily compiled — what a
  shared private helper taking a `char op` or a `std::function<double(double,double)>` might
  look like, and decide for yourself whether it would actually be clearer than the current
  two separate functions.
- Trace by hand what `"A - A"` does — same variable on both sides of a binary operator —
  and confirm your prediction (every element `0`) against `curl`.
- The mixed-type error message is the same one word for word regardless of which side is the
  matrix (`"1 + A"` and `"A + 1"` both produce `"cannot combine a number and a matrix"`).
  Trace through `BinaryExpression::evaluate` by hand for `"1 + A"` specifically, and confirm
  which branch actually throws it — it may not be the one you first expect.

### Definition of done

- [ ] `matrix.h`/`matrix.cpp` compile cleanly with `operator+`, `operator-`, and the internal
      `check_same_dimensions` helper added.
- [ ] `ast.cpp` compiles with `BinaryExpression::evaluate` restructured into the three-way
      dispatch.
- [ ] `A + B` and `A - B` (with `A`, `B` set on separate prior requests) produce the correct
      element-wise results shown above.
- [ ] `A + C` (mismatched shapes) reports the actual dimensions involved.
- [ ] `A + 1` and `A * B` each produce their own distinct, specific error message.
- [ ] Ordinary scalar arithmetic (`x = 5`, `x + 10`) still works, unchanged in behavior.
- [ ] The "what breaks without this" exercise (removing the dimension check) was actually
      run and reverted.
- [ ] Commit:

```
git add matrix.h matrix.cpp ast.cpp
git commit -m "Add matrix addition and subtraction

Matrix::operator+/operator- are free functions (not members) since
addition should treat both operands symmetrically; a shared static
(internal-linkage) check_same_dimensions helper fails loudly on
mismatched shapes before any element is touched, rather than
reading past the shorter matrix's data. BinaryExpression::evaluate
now dispatches on both operands' kinds explicitly - number+number,
matrix+matrix, or a permanent error for anything mixed - since
ordinary C++ virtual dispatch only solves this for one object's
type at a time, not a pair (the 'multiple dispatch' / binary method
problem). Matrix*Matrix multiplication is deliberately still
rejected; it needs a genuinely different algorithm, not just a
third case added to the existing element-wise loop shape."
```

Next lesson: `A * B` — real matrix multiplication, and the first place this project's
computation is expensive enough that its algorithmic complexity is worth talking about
honestly.
