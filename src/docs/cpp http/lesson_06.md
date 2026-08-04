# Lesson 6: A Value That Isn't Always a Number

**What you will build:** a `Matrix` class (flat-array storage, 2D indexing via
`operator()`), a `Value` class wrapping `std::variant<double, Matrix>`, lexer support for
`[`, `]`, `;`, a `MatrixExpression` AST node, and a parser rule for matrix literals — so
`A = [1 2; 3 4]` works, `A` on a later request still returns `[1 2; 3 4]`, and mixing a
matrix into ordinary arithmetic (`A + 1`) fails with a clear, honest error instead of
nonsense or a crash. The transferable problem: every value in this project so far has been
a `double`, and every `evaluate()` has returned `double`, full stop. A matrix is a
genuinely different *kind* of thing — this lesson is about the moment an interpreter's
values stop being one uniform type and become a small closed set of kinds, each requiring
its own handling everywhere a value is used.

**What you need to know first:** Lesson 3's polymorphic `Expression` hierarchy, Lesson 4's
`Environment`, and Lesson 5's pattern for composing a new capability into `Environment`
rather than changing `evaluate()`'s parameter list again — this lesson does the opposite of
that pattern on purpose, and it's worth having Lesson 5's tradeoff fresh in mind to see why.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
```

This lesson opens the **Matrix Library** and **Result Formatter** boxes for the first time.
Carrying `"A = [1 2; 3 4]"` through: Lexer produces
`IDENTIFIER(A) EQUALS LBRACKET NUMBER(1) NUMBER(2) SEMICOLON NUMBER(3) NUMBER(4) RBRACKET END`
→ Parser builds `AssignmentExpression("A", MatrixExpression(<2×2 Matrix>))` → `evaluate()`
returns a `Value` holding that `Matrix`, stored under `"A"` in `Environment` → the
**Result Formatter** stage (this lesson's new `Value::to_string()`) turns it back into the
text `"[1 2; 3 4]"` for the HTTP response.

---

## Concept Unit 1: One box, more than one kind of thing inside

### The Problem

`Environment::get`, every `Expression::evaluate()`, and `server.cpp`'s response-building
code are all currently written against exactly one type: `double`. A matrix is not a
`double`. Rather than inventing a completely separate, parallel pipeline for matrices (a
second `Environment`, a second `evaluate`), this project needs one value type that can hold
*either* kind, checked at the moment it's used.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <variant>
#include <string>

int main() {
    std::variant<int, std::string> data;

    data = 42;
    std::cout << "holds int? " << std::holds_alternative<int>(data) << "\n";
    std::cout << "value: " << std::get<int>(data) << "\n";

    data = std::string("hello");
    std::cout << "holds int? " << std::holds_alternative<int>(data) << "\n";
    std::cout << "holds string? " << std::holds_alternative<std::string>(data) << "\n";
    std::cout << "value: " << std::get<std::string>(data) << "\n";

    try {
        std::cout << std::get<int>(data) << "\n";
    } catch (const std::bad_variant_access& e) {
        std::cout << "bad_variant_access: " << e.what() << "\n";
    }

    return 0;
}
```

Real output:

```
holds int? 1
value: 42
holds int? 0
holds string? 1
value: hello
bad_variant_access: std::get: wrong index for variant
```

### Discard

This `int`/`string` variant is deleted. The real project's variant holds `double` and
`Matrix` instead — same mechanism, different pair of types.

### Mechanical walkthrough

- `std::variant<int, std::string> data;` — **(a) first appearance.** A type-safe union: `data`
  holds *exactly one* of an `int` or a `std::string` at any moment, and — unlike a raw C
  union — it always knows which one, so asking the wrong question fails safely instead of
  reading garbage.
- `data = 42;` then later `data = std::string("hello");` — **(a) first appearance.** Plain
  assignment changes which alternative is *currently* active — this is the same "a variable
  can hold different things over its lifetime" idea Lesson 5 introduced for functions,
  applied here to two entirely unrelated types instead of two interchangeable callables.
- `std::holds_alternative<int>(data)` — **(a) first appearance.** Asks "is the *currently
  active* alternative an `int`?" without touching the value — the safe way to check before
  reading.
- `std::get<int>(data)` — **(a) first appearance.** Retrieves the value, *assuming* the
  caller already knows (or has checked) which alternative is active. Calling it for the
  wrong alternative — as the last block deliberately does — throws `std::bad_variant_access`
  rather than silently reinterpreting the bytes, which is exactly why `std::variant` is
  called "type-safe": the failure mode is a catchable exception, not undefined behavior.

### CS lens

`std::variant` is a **tagged union** (or "sum type" in type-theory terms): a value that is
one of several fixed alternatives, always self-aware of which one. Also recognized in:
TypeScript's union types (`number | string`), Rust's `enum` (which is exactly this, as a
first-class language feature rather than a library type), and — closer to home — this
project's own `TokenType` enum from Lesson 2, which tags a `Token` with *which kind* it is,
though without carrying differently-typed payloads the way a real variant does.

---

## Concept Unit 2: What a `std::vector` was managing all along

### The Problem

A `Matrix` needs to own a genuinely variable amount of memory — its size depends entirely on
what's parsed at runtime (`[1 2]` vs. `[1 2; 3 4; 5 6]`). Every project so far has used
`std::vector` for this without asking what it's actually doing underneath — worth seeing
once, directly, before building `Matrix` on top of `std::vector` anyway.

### Introduce the concept in isolation

```cpp
#include <iostream>

int main() {
    std::size_t rows = 2;
    std::size_t cols = 2;
    double* data = new double[rows * cols];

    data[0 * cols + 0] = 1;
    data[0 * cols + 1] = 2;
    data[1 * cols + 0] = 3;
    data[1 * cols + 1] = 4;

    for (std::size_t r = 0; r < rows; r++) {
        for (std::size_t c = 0; c < cols; c++) {
            std::cout << data[r * cols + c] << " ";
        }
    }
    std::cout << "\n";

    delete[] data;
    return 0;
}
```

Real output:

```
1 2 3 4
```

### Discard

This raw `new[]`/`delete[]` array is deleted. `Matrix` (next unit) uses `std::vector<double>`
for its actual storage — but now you've seen, directly, that a "2D array" here is really just
one flat block of memory with arithmetic (`row * cols + col`) doing the work of turning two
indices into one offset.

### Mechanical walkthrough

- `double* data = new double[rows * cols];` — **(a) first appearance of array `new`.**
  Allocates `rows * cols` contiguous `double`s on the heap and returns a pointer to the
  first one — there is no built-in concept of "2D" here at all; it's one long row of memory.
- `data[r * cols + c]` — **(a) first appearance of row-major flattening.** Two logical
  indices, one real offset: row `r`, column `c` lands at position `r * cols + c` because
  each row occupies `cols` consecutive slots. This specific formula — row index times column
  *count*, plus column index — is what "row-major order" means, and it's the exact
  arithmetic `Matrix::operator()` performs in the next unit.
- `delete[] data;` — **(a) first appearance, paired explicitly with `new[]`.** Array
  allocation (`new[]`) must be freed with array delete (`delete[]`), not plain `delete` —
  mismatching them is undefined behavior. This exact pairing requirement — remember to free
  it, remember to use the matching form — is precisely what `std::vector` exists to make
  unnecessary, which the SE lens below makes concrete.

### CS lens

Flattening a 2D structure into one contiguous 1D block with an index formula is a genuinely
recurring technique, not a one-off: also seen in image buffers (a `width × height` pixel
grid stored as one array), and — a preview of Lesson 9 — a chain of `Environment`s each
holding a flat name→value map is a different flattening of a conceptually nested (parent →
child scope) structure.

### SE lens

The alternative to flat storage — `std::vector<std::vector<double>>`, a vector of row
vectors — is arguably more "obviously 2D" to read. The real tradeoff: nested vectors put
each row in its own separately-heap-allocated block, scattered in memory, which is slower to
iterate over (worse cache locality) and requires *n* separate allocations for an *n*-row
matrix instead of one; flat storage is one allocation, contiguous, faster to scan — at the
cost of the index arithmetic this unit just made explicit, which nested vectors would have
hidden. `Matrix` (next unit) chooses flat storage for this reason — a real, if small,
performance-minded choice, not the "obvious" one.

---

## Concept Unit 3: The real `Matrix`

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `format.h`, `format.cpp` (a small shared utility, used by both
  `Matrix` and `Value`); new `matrix.h`, `matrix.cpp`.
- **Change type:** add.
- **Location:** new files.
- **Dependencies:** none beyond the standard library.

### The New Code — type it yourself

`format.h`/`format.cpp` first — a small, standalone utility both `Matrix` and `Value` will
need, kept in its own file specifically so neither has to include the other:

```cpp
#pragma once
#include <string>

std::string format_number(double value);
```

```cpp
#include "format.h"
#include <sstream>

std::string format_number(double value) {
    std::ostringstream oss;
    oss << value;
    return oss.str();
}
```

`matrix.h`:

```cpp
#pragma once
#include <vector>
#include <cstddef>
#include <string>

class Matrix {
public:
    Matrix(std::size_t rows, std::size_t cols);

    std::size_t rows() const;
    std::size_t cols() const;

    double& operator()(std::size_t row, std::size_t col);
    double operator()(std::size_t row, std::size_t col) const;

    std::string to_string() const;

private:
    std::size_t rows_;
    std::size_t cols_;
    std::vector<double> data_;
};
```

### The Updated Project

Brand-new files, nothing to place them inside yet. `matrix.cpp`, whole:

```cpp
#include "matrix.h"
#include "format.h"
#include <sstream>

Matrix::Matrix(std::size_t rows, std::size_t cols)
    : rows_(rows), cols_(cols), data_(rows * cols, 0.0) {}

std::size_t Matrix::rows() const {
    return rows_;
}

std::size_t Matrix::cols() const {
    return cols_;
}

double& Matrix::operator()(std::size_t row, std::size_t col) {
    return data_[row * cols_ + col];
}

double Matrix::operator()(std::size_t row, std::size_t col) const {
    return data_[row * cols_ + col];
}

std::string Matrix::to_string() const {
    std::ostringstream oss;
    oss << "[";
    for (std::size_t r = 0; r < rows_; r++) {
        for (std::size_t c = 0; c < cols_; c++) {
            oss << format_number((*this)(r, c));
            if (c + 1 < cols_) {
                oss << " ";
            }
        }
        if (r + 1 < rows_) {
            oss << "; ";
        }
    }
    oss << "]";
    return oss.str();
}
```

### Mechanical walkthrough (new items only)

- `format_number` using `std::ostringstream` with no explicit precision set — **(a) first
  appearance, and a real fix worth naming.** `std::ostringstream`'s default formatting
  prints the *shortest* representation that round-trips at 6 significant digits, with no
  forced trailing zeros — this is precisely why this lesson's real output below shows `4`
  and `5`, not the `4.000000`/`5.000000` every previous lesson's `std::to_string(double)`
  produced. This is the "Result Formatter" cleanup Lesson 3 flagged as deferred debt,
  landing here as a genuine side effect of needing formatting logic `Matrix` can also use —
  not the main point of this lesson, but a real one.
- `data_(rows * cols, 0.0)` in the constructor's initializer list — **(a) first appearance
  of this `vector` constructor form.** Constructs `data_` with `rows * cols` elements, each
  initialized to `0.0` — a fresh matrix starts as all zeros, the same convention most
  matrix libraries use, before anything writes real values into it.
- `double& Matrix::operator()(std::size_t row, std::size_t col)` — **(a) first appearance of
  overloading the call operator, `operator()`.** Unlike `operator[]` (which only takes one
  index), `operator()` can take *two* arguments — `matrix(1, 0)` reads naturally as "row 1,
  column 0" the way `matrix[1][0]` (nested indexing) would need two separate bracket
  operations and an intermediate row object this flat-storage design doesn't have. Returning
  `double&` — a *reference*, not a copy — is what makes `matrix(1, 0) = 5;` legal: the
  caller gets direct read/write access to the actual stored element, not a disconnected
  copy of it.
- The `const` overload of `operator()`, differing from the first only by its `const`
  qualifier and return type (`double`, not `double&`) — **(a) first appearance of
  overloading purely on `const`-ness.** C++ allows two methods with identical
  names and parameters, differing only in whether they're `const`, and picks between them
  based on whether the `Matrix` being called is itself `const` — the `const` version
  returns a plain `double` (a copy) rather than a reference, since a `const Matrix` must
  never expose a way to modify its own contents through what looks like a read.

### CS lens

Overloading `operator()` to make a class *callable-looking* while it's really doing indexed
access is one instance of a broader idea: **operators as named methods with special call
syntax**, nothing more mysterious than that. Also recognized in: NumPy's `array[i, j]`
(Python's `__getitem__` accepting a tuple, a different syntax for the same underlying idea),
and, back in Lesson 1, `std::cout << "..."` — `<<` overloaded to mean "send this into the
stream" instead of "shift these bits."

---

## Concept Unit 4: The real `Value`

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `value.h`, new `value.cpp`.
- **Change type:** add.
- **Location:** new files, alongside `matrix.h`/`matrix.cpp`.
- **Dependencies:** `matrix.h` — and, as with Lesson 5's `Environment`/`FunctionTable`
  pairing, this needs the **full** definition of `Matrix`, not a forward declaration, because
  `Value` holds one by value inside its `std::variant`.

### The New Code — type it yourself

`value.h`:

```cpp
#pragma once
#include <string>
#include <variant>
#include "matrix.h"

class Value {
public:
    static Value number(double value);
    static Value matrix(Matrix value);

    bool is_number() const;
    bool is_matrix() const;

    double as_number() const;
    const Matrix& as_matrix() const;

    std::string to_string() const;

private:
    explicit Value(std::variant<double, Matrix> data);
    std::variant<double, Matrix> data_;
};
```

### The Updated Project

Brand-new file, nothing to place it inside. `value.cpp`, whole:

```cpp
#include "value.h"
#include "format.h"
#include <stdexcept>

Value::Value(std::variant<double, Matrix> data) : data_(std::move(data)) {}

Value Value::number(double value) {
    return Value(std::variant<double, Matrix>(value));
}

Value Value::matrix(Matrix value) {
    return Value(std::variant<double, Matrix>(std::move(value)));
}

bool Value::is_number() const {
    return std::holds_alternative<double>(data_);
}

bool Value::is_matrix() const {
    return std::holds_alternative<Matrix>(data_);
}

double Value::as_number() const {
    if (!is_number()) {
        throw std::runtime_error("expected a number, got a matrix");
    }
    return std::get<double>(data_);
}

const Matrix& Value::as_matrix() const {
    if (!is_matrix()) {
        throw std::runtime_error("expected a matrix, got a number");
    }
    return std::get<Matrix>(data_);
}

std::string Value::to_string() const {
    if (is_number()) {
        return format_number(std::get<double>(data_));
    }
    return std::get<Matrix>(data_).to_string();
}
```

### Mechanical walkthrough (new items only)

- `static Value number(double value);` / `static Value matrix(Matrix value);`, with the
  actual constructor kept `private` — **(a) first appearance of the named-constructor
  pattern.** Rather than exposing `Value(double)` and `Value(Matrix)` as two public
  constructors (which reads ambiguously at a call site — `Value(5)` looks like "construct a
  number," but nothing forces that reading), `Value::number(5)` and `Value::matrix(m)` are
  unambiguous at the point they're called, and the single private constructor behind them
  means there's exactly one place that actually builds the `std::variant`. This is a small,
  deliberate SE choice: two clearly-named doors in, rather than one constructor overloaded
  by argument type.
- `as_number()` and `as_matrix()` each throwing on the *wrong* alternative — **(b)
  reappearing pattern.** The same fail-loudly choice as `Environment::get` (Lesson 4) and
  `FunctionTable::call` (Lesson 5) — asking a `Value` for the wrong kind is exactly as real
  an error as asking for an undefined variable or an unregistered function, and gets
  identical treatment: a clear, catchable exception, not a silent wrong answer.

### CS lens

`Value::number`/`Value::matrix` as the only ways in, and `as_number`/`as_matrix` as the only
(checked) ways out, makes `Value` a genuine **abstraction boundary**: nothing outside this
class ever touches `data_` or the raw `std::variant` directly. Also recognized in: any
"smart" wrapper type whose entire job is guarding access to something riskier underneath —
`unique_ptr` (Lesson 3) guarding a raw pointer, `Environment` (Lesson 4) guarding a raw
`unordered_map`.

---

## Concept Unit 5: Every existing `evaluate()` changes its return type

### The Problem

`Expression::evaluate()` currently returns `double` — a promise every one of five existing
subclasses already fulfills. A matrix literal's `evaluate()` needs to return a `Value`
instead. Lesson 5 deliberately *avoided* a signature change by composing `FunctionTable`
into `Environment`; this time, there's no way around it — the type being *returned*, not
just a parameter, has to change, and every existing subclass follows.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.h`, `ast.cpp` — every class in both files touched or added.
- **Change type:** refactor every `evaluate` signature; add `MatrixExpression`.
- **Location:** whole files.
- **Dependencies:** `value.h` from Concept Unit 4.

### The New Code — type it yourself

The new node, appended after `FunctionCallExpression`:

```cpp
class MatrixExpression : public Expression {
public:
    explicit MatrixExpression(Matrix value);
    Value evaluate(Environment& env) const override;

private:
    Matrix value_;
};
```

### The Updated Project

`ast.h`, in full:

```cpp
#pragma once
#include <memory>
#include <string>
#include "lexer.h"
#include "value.h"                                                       // ← new
#include "matrix.h"                                                      // ← new

class Environment;

class Expression {
public:
    virtual Value evaluate(Environment& env) const = 0;                  // ← changed
    virtual ~Expression() = default;
};

class NumberExpression : public Expression {
public:
    explicit NumberExpression(double value);
    Value evaluate(Environment& env) const override;                     // ← changed

private:
    double value_;
};

class BinaryExpression : public Expression {
public:
    BinaryExpression(TokenType op, std::unique_ptr<Expression> left, std::unique_ptr<Expression> right);
    Value evaluate(Environment& env) const override;                     // ← changed

private:
    TokenType op_;
    std::unique_ptr<Expression> left_;
    std::unique_ptr<Expression> right_;
};

class VariableExpression : public Expression {
public:
    explicit VariableExpression(std::string name);
    Value evaluate(Environment& env) const override;                     // ← changed

private:
    std::string name_;
};

class AssignmentExpression : public Expression {
public:
    AssignmentExpression(std::string name, std::unique_ptr<Expression> value);
    Value evaluate(Environment& env) const override;                     // ← changed

private:
    std::string name_;
    std::unique_ptr<Expression> value_;
};

class FunctionCallExpression : public Expression {
public:
    FunctionCallExpression(std::string name, std::unique_ptr<Expression> argument);
    Value evaluate(Environment& env) const override;                     // ← changed

private:
    std::string name_;
    std::unique_ptr<Expression> argument_;
};

class MatrixExpression : public Expression {                             // ← new
public:                                                                  // ← new
    explicit MatrixExpression(Matrix value);                             // ← new
    Value evaluate(Environment& env) const override;                     // ← new
                                                                           // ← new
private:                                                                  // ← new
    Matrix value_;                                                       // ← new
};                                                                        // ← new
```

`ast.cpp`, in full:

```cpp
#include "ast.h"
#include "environment.h"
#include <stdexcept>

NumberExpression::NumberExpression(double value) : value_(value) {}

Value NumberExpression::evaluate(Environment& /*env*/) const {           // ← changed
    return Value::number(value_);                                       // ← changed
}

BinaryExpression::BinaryExpression(TokenType op, std::unique_ptr<Expression> left, std::unique_ptr<Expression> right)
    : op_(op), left_(std::move(left)), right_(std::move(right)) {}

Value BinaryExpression::evaluate(Environment& env) const {               // ← changed
    Value lhs = left_->evaluate(env);                                    // ← changed
    Value rhs = right_->evaluate(env);                                   // ← changed

    if (!lhs.is_number() || !rhs.is_number()) {                          // ← new
        throw std::runtime_error("matrix arithmetic is not supported yet"); // ← new
    }                                                                    // ← new

    double l = lhs.as_number();                                         // ← new
    double r = rhs.as_number();                                         // ← new

    switch (op_) {
        case TokenType::Plus:  return Value::number(l + r);              // ← changed
        case TokenType::Minus: return Value::number(l - r);              // ← changed
        case TokenType::Star:  return Value::number(l * r);              // ← changed
        case TokenType::Slash: return Value::number(l / r);              // ← changed
        default:
            throw std::runtime_error("unsupported operator in BinaryExpression");
    }
}

VariableExpression::VariableExpression(std::string name) : name_(std::move(name)) {}

Value VariableExpression::evaluate(Environment& env) const {             // ← changed
    return env.get(name_);
}

AssignmentExpression::AssignmentExpression(std::string name, std::unique_ptr<Expression> value)
    : name_(std::move(name)), value_(std::move(value)) {}

Value AssignmentExpression::evaluate(Environment& env) const {           // ← changed
    Value result = value_->evaluate(env);                                // ← changed
    env.set(name_, result);
    return result;
}

FunctionCallExpression::FunctionCallExpression(std::string name, std::unique_ptr<Expression> argument)
    : name_(std::move(name)), argument_(std::move(argument)) {}

Value FunctionCallExpression::evaluate(Environment& env) const {         // ← changed
    Value argument = argument_->evaluate(env);                           // ← changed
    double result = env.call(name_, argument.as_number());               // ← changed
    return Value::number(result);                                       // ← changed
}

MatrixExpression::MatrixExpression(Matrix value) : value_(std::move(value)) {}  // ← new

Value MatrixExpression::evaluate(Environment& /*env*/) const {           // ← new
    return Value::matrix(value_);                                       // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- `if (!lhs.is_number() || !rhs.is_number()) { throw ... }` in `BinaryExpression::evaluate`
  — **(a) first appearance of an explicit type check inside interpretation itself.** Every
  previous error in this project (undefined variable, unknown function, lex/parse failure)
  was a *lookup* failure. This is different: both operands evaluated successfully, and the
  values are individually valid — the error is that `+`, as currently written, has no
  defined meaning for a matrix. This is the project's first taste of what "Semantic
  Analysis" (the pipeline stage between Parser/AST and Interpreter, named all the way back
  in Lesson 1's original architecture) actually means: checking that an otherwise
  syntactically valid program's pieces *fit together*, not just that they parsed.
- `env.call(name_, argument.as_number())` in `FunctionCallExpression::evaluate` — **(b)
  reappearing pattern, new consequence.** `as_number()` here does double duty: it both
  extracts the `double` `FunctionTable::call` still expects (unchanged since Lesson 5), and
  — for free, as a side effect of Concept Unit 4's design — becomes the type check that
  makes `sqrt(A)` (a matrix argument) fail with a clear `"expected a number, got a matrix"`
  rather than a compile error or garbage.
- `MatrixExpression::evaluate` returning `Value::matrix(value_)`, copying the member
  `Matrix` — **(a) first appearance of this specific cost, named honestly.** `evaluate()` is
  `const`, so it cannot move from `value_` — every evaluation of a `MatrixExpression` copies
  its entire matrix. For the small literals this project handles so far, that's fine; for a
  much larger matrix, copying on every evaluation would be a real, measurable cost — a
  legitimate optimization opportunity, not fixed here.

### SE lens

Compare this lesson's cost directly against Lesson 5's: last time, composing `FunctionTable`
into `Environment` kept every existing `evaluate()` signature untouched. This time, five
files' worth of signatures changed because the change is fundamentally different in kind —
Lesson 5 added a new *capability* reachable through the existing `Environment&` parameter;
this lesson changes what every single node **returns**, and there's no composing your way
around a return type the way there was around a parameter. Recognizing *which* kind of
change you're facing — extend what's reachable vs. change the shape of the result — is
itself a real, transferable design skill, not just C++ mechanics.

---

## Concept Unit 6: `Environment` learns to hold either kind

### The Problem

`Environment::get`/`set` currently traffic in `double`. A matrix needs to be assignable to a
variable (`A = [1 2; 3 4]`) exactly the way a number is — which means `Environment`'s
internal storage has to hold `Value`, not `double`.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `environment.h`, `environment.cpp`.
- **Change type:** refactor `variables_`'s value type and both `get`/`set` signatures.
- **Location:** whole files (small; every line is touched by the type change).
- **Dependencies:** `value.h` from Concept Unit 4.

### The New Code — type it yourself

```cpp
Value Environment::get(const std::string& name) const {
    auto it = variables_.find(name);
    if (it == variables_.end()) {
        throw std::runtime_error("undefined variable: " + name);
    }
    return it->second;
}
```

### The Updated Project

`environment.h`, in full:

```cpp
#pragma once
#include <string>
#include <unordered_map>
#include "functions.h"
#include "value.h"                                                       // ← new

class Environment {
public:
    Environment();

    Value get(const std::string& name) const;                           // ← changed
    void set(const std::string& name, Value value);                      // ← changed
    double call(const std::string& function_name, double argument) const;

private:
    std::unordered_map<std::string, Value> variables_;                   // ← changed
    FunctionTable functions_;
};
```

`environment.cpp`, in full:

```cpp
#include "environment.h"
#include <cmath>
#include <stdexcept>

Environment::Environment() {
    variables_.insert_or_assign("pi", Value::number(std::acos(-1.0)));   // ← changed
}

Value Environment::get(const std::string& name) const {                  // ← changed
    auto it = variables_.find(name);
    if (it == variables_.end()) {
        throw std::runtime_error("undefined variable: " + name);
    }
    return it->second;
}

void Environment::set(const std::string& name, Value value) {            // ← changed
    variables_.insert_or_assign(name, std::move(value));                 // ← changed
}

double Environment::call(const std::string& function_name, double argument) const {
    return functions_.call(function_name, argument);
}
```

### Mechanical walkthrough (new items only)

- `variables_.insert_or_assign("pi", ...)` in place of the earlier `variables_["pi"] = ...`
  — **(a) first appearance, and a real compile error worth walking through honestly.** The
  original attempt used `operator[]`, exactly as Lesson 4 did — and it **failed to
  compile**: `unordered_map::operator[]` works by *default-constructing* a value in place
  first (if the key is new) and assigning into it afterward, which requires the value type
  to have a default constructor. `Value` deliberately has **no** default constructor —
  Concept Unit 4's named-constructor pattern (`Value::number`/`Value::matrix`) made the
  single real constructor `private` specifically so a `Value` can never exist in some
  unspecified "neither number nor matrix" state. That design choice, made for good reason in
  Concept Unit 4, is exactly what breaks `operator[]` here. `insert_or_assign` sidesteps the
  problem: it takes a fully-formed `Value` directly, with no intermediate default-constructed
  state ever created. This is a real example of one earlier, well-justified design decision
  having a genuine, non-obvious downstream consequence — not a hypothetical.

### CS lens

Requiring a default constructor for `operator[]`'s "insert if missing" behavior, and
`insert_or_assign` not requiring one, is a small but real illustration of **interface
requirements propagating through a type system**: a container's convenience method
(`operator[]`) silently demands more from its value type (default-constructibility) than the
container's core purpose (associating keys with values) strictly needs — `insert_or_assign`
asks for exactly what's needed and no more.

---

## Concept Unit 7: The lexer learns three more symbols

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `lexer.h`, `lexer.cpp`.
- **Change type:** add three `TokenType` values and their single-character cases.
- **Location:** `lexer.h`'s enum; `lexer.cpp`'s `token_type_name` and `tokenize()`'s
  `switch`.
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
enum class TokenType { Number, Identifier, Equals, Plus, Minus, Star, Slash, LParen, RParen, LBracket, RBracket, Semicolon, End };
```

### The Updated Project

`lexer.cpp`'s `switch` inside `tokenize()`, with the new cases marked (everything else
unchanged from Lesson 4):

```cpp
        switch (c) {
            case '=': tokens.push_back(Token{TokenType::Equals, "="}); advance(); break;
            case '+': tokens.push_back(Token{TokenType::Plus, "+"}); advance(); break;
            case '-': tokens.push_back(Token{TokenType::Minus, "-"}); advance(); break;
            case '*': tokens.push_back(Token{TokenType::Star, "*"}); advance(); break;
            case '/': tokens.push_back(Token{TokenType::Slash, "/"}); advance(); break;
            case '(': tokens.push_back(Token{TokenType::LParen, "("}); advance(); break;
            case ')': tokens.push_back(Token{TokenType::RParen, ")"}); advance(); break;
            case '[': tokens.push_back(Token{TokenType::LBracket, "["}); advance(); break;   // ← new
            case ']': tokens.push_back(Token{TokenType::RBracket, "]"}); advance(); break;   // ← new
            case ';': tokens.push_back(Token{TokenType::Semicolon, ";"}); advance(); break;  // ← new
            default:
                throw std::runtime_error(std::string("unexpected character: ") + c);
        }
```

### Mechanical walkthrough

Nothing new to explain — three more single-character cases, structurally identical to every
existing one in this `switch`. Worth noticing explicitly, though: this is the *only* lexer
change this entire lesson needed, despite matrices being the largest single feature added so
far. Numbers, spaces between them, and semicolons as row separators all reuse machinery this
lexer has had since Lesson 2 and Lesson 4.

---

## Concept Unit 8: The parser builds a matrix literal

### The Problem

`[1 2; 3 4]` needs its own grammar rule — rows of numbers, separated by spaces (already
handled by whitespace-skipping) and semicolons, wrapped in brackets — and every row must
have the same number of columns, or the literal doesn't describe a real matrix at all.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.h`, `parser.cpp`.
- **Change type:** add a new private method and a new branch in `parse_factor`.
- **Location:** `parser.h`'s private method list; `parser.cpp`'s `parse_factor` and a new
  `parse_matrix` method.
- **Dependencies:** `MatrixExpression`, `Matrix` from Concept Units 3 and 5.

### The New Code — type it yourself

```cpp
std::unique_ptr<Expression> Parser::parse_matrix() {
    expect(TokenType::LBracket, "expected '['");

    std::vector<std::vector<double>> rows;
    std::vector<double> current_row;

    while (true) {
        if (check(TokenType::Number)) {
            current_row.push_back(std::stod(advance().text));
        } else if (check(TokenType::Semicolon)) {
            advance();
            rows.push_back(current_row);
            current_row.clear();
        } else if (check(TokenType::RBracket)) {
            rows.push_back(current_row);
            advance();
            break;
        } else {
            throw std::runtime_error("expected a number, ';', or ']' in matrix literal (got " + token_type_name(peek().type) + ")");
        }
    }

    std::size_t column_count = rows[0].size();
    for (const std::vector<double>& row : rows) {
        if (row.size() != column_count) {
            throw std::runtime_error("every row of a matrix literal must have the same number of columns");
        }
    }

    Matrix matrix(rows.size(), column_count);
    for (std::size_t r = 0; r < rows.size(); r++) {
        for (std::size_t c = 0; c < column_count; c++) {
            matrix(r, c) = rows[r][c];
        }
    }

    return std::make_unique<MatrixExpression>(std::move(matrix));
}
```

### The Updated Project

`parser.h`, with the new declaration marked:

```cpp
    std::unique_ptr<Expression> parse_factor();
    std::unique_ptr<Expression> parse_matrix();                          // ← new
```

`parse_factor()`'s tail, with the new branch marked (the `Number`, function-call,
`Identifier`, and `LParen` branches above it are unchanged from Lesson 5):

```cpp
    if (check(TokenType::LParen)) {
        advance();
        std::unique_ptr<Expression> inner = parse_expression();
        expect(TokenType::RParen, "expected closing parenthesis");
        return inner;
    }

    if (check(TokenType::LBracket)) {                                    // ← new
        return parse_matrix();                                          // ← new
    }                                                                    // ← new

    throw std::runtime_error("expected a number or '(' (got " + token_type_name(peek().type) + ")");
}
```

### Mechanical walkthrough (new items only)

- `std::vector<std::vector<double>> rows;` alongside a separate `current_row` accumulator —
  **(a) first appearance of this two-level accumulation shape.** `current_row` grows one
  number at a time as `Number` tokens are consumed; hitting `Semicolon` or the final
  `RBracket` is what "closes" the current row and pushes a *copy* of it into `rows` before
  clearing it to start the next one — a direct, code-level parallel to how the matrix
  literal's own syntax is structured: numbers within a row need no separator token
  (whitespace already vanishes during lexing), but rows themselves are explicitly delimited.
- The `while (true)` loop with three `if`/`else if` branches and one `throw` in the `else`
  — **(b) reappearing shape.** Structurally the same character-by-character (here,
  token-by-token) dispatch loop as `Lexer::tokenize()` from Lesson 2 — consume, categorize,
  repeat, fail loudly on anything unrecognized — applied one level up, over tokens instead
  of characters.
- `rows[0].size()` used to establish `column_count`, with no check that `rows` is non-empty
  first — **(a) first appearance of an accepted, honest gap.** An input like `"[]"` (an
  empty matrix literal) would tokenize fine and immediately hit the `RBracket` branch with
  `current_row` empty, pushing one empty row — `rows[0]` would then read a genuinely empty
  vector's `.size()` (which is well-defined, `0`, not undefined behavior) rather than reading
  past the end of `rows` itself. The resulting `Matrix(1, 0)` — one row, zero columns — is a
  strange but not crashing result; whether that *should* be rejected outright is a real
  design question this lesson leaves open rather than silently resolving.
- `row.size() != column_count` checked for **every** row, including the first (trivially
  equal to itself) — **(a) first appearance of this validation.** This is the "does the
  input actually describe a valid matrix" check doc1's own architecture calls Semantic
  Analysis — syntactically, `[1 2; 3]` is a perfectly well-formed sequence of numbers,
  semicolons, and brackets; it just doesn't describe a rectangular matrix, which is a
  meaning-level problem the parser only catches because this check was written explicitly.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "A"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "[1 2 3]"
[1 2 3]

$ curl -X POST http://localhost:8080/evaluate -d "sqrt(16)"
4

$ curl -X POST http://localhost:8080/evaluate -d "x = 5"
5

$ curl -X POST http://localhost:8080/evaluate -d "x + 10"
15

$ curl -X POST http://localhost:8080/evaluate -d "A + 1"
error: matrix arithmetic is not supported yet

$ curl -X POST http://localhost:8080/evaluate -d "[1 2; 3]"
error: every row of a matrix literal must have the same number of columns

$ curl -X POST http://localhost:8080/evaluate -d "sqrt(A)"
error: expected a number, got a matrix
```

Server's own log, real output, all nine requests:

```
math engine listening on port 8080
[10:19:35] POST /evaluate body="A = [1 2; 3 4]"
[10:19:35] POST /evaluate body="A"
[10:19:35] POST /evaluate body="[1 2 3]"
[10:19:35] POST /evaluate body="sqrt(16)"
[10:19:35] POST /evaluate body="x = 5"
[10:19:35] POST /evaluate body="x + 10"
[10:19:35] POST /evaluate body="A + 1"
[10:19:35] POST /evaluate body="[1 2; 3]"
[10:19:35] POST /evaluate body="sqrt(A)"
```

The second request (`A` alone) proves matrix values persist across separate HTTP requests
exactly the way Lesson 4 proved for plain numbers — the same `Environment`, the same
`std::unordered_map`, now just holding a `Value` that happens to wrap a `Matrix` instead of a
`double`. `sqrt(16)` and `x = 5` printing as clean `4` and `5` — not `4.000000` — is Concept
Unit 3's `format_number` fix, verified for real, applying automatically to every number this
project has ever produced, not just new matrix-adjacent code.

### Connect

Three deliberately unimplemented operations — `A + 1`, `A + B` (not shown, but the same
`is_number()` guard rejects it identically), and `sqrt(A)` — all fail with clear, specific
errors rather than nonsense results or a crash. That gap is exactly Lesson 7's subject: real
matrix arithmetic, replacing `BinaryExpression`'s current blanket
`"matrix arithmetic is not supported yet"` with actual element-wise addition — the first
place `Matrix::operator()`'s read/write access (built this lesson, unused by anything until
now) finally gets exercised for real.

---

## Closing

### Connect the pieces

Trace `"A = [1 2; 3 4]"` end to end: Lesson 1's socket/HTTP layer, untouched, delivers the
body → Lesson 2's `Lexer`, extended by three cases (Concept Unit 7), produces
`IDENTIFIER(A) EQUALS LBRACKET NUMBER(1) NUMBER(2) SEMICOLON NUMBER(3) NUMBER(4) RBRACKET END`
→ `parse_statement` (Lesson 4) recognizes the assignment shape, calls `parse_expression` →
...→ `parse_factor` sees `LBracket` and calls `parse_matrix` (Concept Unit 8), which builds a
real `Matrix(2, 2)` with `1, 2, 3, 4` written into it via `operator()` (Concept Unit 3) and
wraps it in a `MatrixExpression` (Concept Unit 5) → `AssignmentExpression::evaluate` runs:
`MatrixExpression::evaluate` returns `Value::matrix(<the 2×2 matrix>)` (Concept Unit 4) →
`env.set("A", result)` stores it via `insert_or_assign` (Concept Unit 6) → the same `Value`
is returned as the whole expression's result → `server.cpp`'s
`ast->evaluate(environment).to_string()` calls `Value::to_string()`, which detects the
matrix alternative and delegates to `Matrix::to_string()` → `"[1 2; 3 4]"` comes back over
HTTP, unchanged from there by Lesson 1's response-writing code.

### What breaks without this

In `BinaryExpression::evaluate`, comment out the type check:

```cpp
Value BinaryExpression::evaluate(Environment& env) const {
    Value lhs = left_->evaluate(env);
    Value rhs = right_->evaluate(env);

    // if (!lhs.is_number() || !rhs.is_number()) {
    //     throw std::runtime_error("matrix arithmetic is not supported yet");
    // }

    double l = lhs.as_number();
    double r = rhs.as_number();
    ...
```

Rebuild, and send `"A + 1"` again (with `A` already set from a prior request). Real result:
`error: expected a number, got a matrix` — a *different*, less specific error than before,
now thrown from inside `Value::as_number()` (Concept Unit 4) instead of
`BinaryExpression`'s own explicit check. The program doesn't crash — `as_number`'s own
guard still catches it — but the error message is worse, and, more importantly, this proves
the explicit check in `BinaryExpression` was never the *only* thing standing between this
project and undefined behavior; it's `Value`'s own internal guard doing the real safety
work, with `BinaryExpression`'s check existing purely to fail *earlier*, with a *clearer*
message. Restore the check before moving on — a good error message is worth writing even
when a deeper layer would eventually catch the same mistake anyway.

### Exercises

- Send `"[]"` and see what actually happens, per the honest gap named in Concept Unit 8's
  walkthrough — confirm by hand whether the response matches your prediction of
  `Matrix(1, 0)`.
- `Matrix::to_string()` currently has no special case for a matrix with exactly one row —
  send `"[1 2 3]"` again and compare its output shape to a real MATLAB/NumPy row vector's
  usual display; decide for yourself whether this project's current formatting is
  acceptable or worth revisiting later.
- Trace by hand what `"B = A"` does (with `A` already assigned) — specifically, whether `B`
  and `A` end up sharing the same underlying `std::vector<double>` inside their respective
  `Matrix`es, or whether assignment copies the data. (Hint: revisit `Environment::set`'s
  signature from Concept Unit 6.)

### Definition of done

- [ ] `format.h`/`format.cpp`, `matrix.h`/`matrix.cpp`, and `value.h`/`value.cpp` each
      compile cleanly on their own.
- [ ] `ast.h`/`ast.cpp` compile with every `evaluate` returning `Value`, and
      `MatrixExpression` added.
- [ ] `environment.h`/`environment.cpp` compile with `variables_` holding `Value` and using
      `insert_or_assign` rather than `operator[]`.
- [ ] `lexer.h`/`lexer.cpp` and `parser.h`/`parser.cpp` compile with bracket/semicolon
      support and `parse_matrix`.
- [ ] `A = [1 2; 3 4]` followed by a separate `A` request both return `[1 2; 3 4]`.
- [ ] `sqrt(16)` and `x = 5` print as `4` and `5`, not `4.000000`/`5.000000`.
- [ ] `A + 1`, `[1 2; 3]`, and `sqrt(A)` each produce the specific error messages shown
      above, and the server keeps running and logging afterward.
- [ ] The "what breaks without this" exercise (removing `BinaryExpression`'s type check) was
      actually run and reverted.
- [ ] Commit:

```
git add format.h format.cpp matrix.h matrix.cpp value.h value.cpp ast.h ast.cpp environment.h environment.cpp lexer.h lexer.cpp parser.h parser.cpp server.cpp
git commit -m "Add matrices: Matrix, Value, matrix literals

Matrix stores elements in one flat std::vector<double> (row-major:
row * cols + col), not a vector of vectors, for contiguous memory
and one allocation instead of n. Value wraps std::variant<double,
Matrix> behind named constructors (Value::number/Value::matrix)
with no public default constructor - which broke Environment's
existing operator[] usage (requires default-constructibility) and
required switching to insert_or_assign, a real consequence of an
earlier design choice. Expression::evaluate() now returns Value
instead of double, touching every existing subclass - a return-type
change, unlike Lesson 5's Environment composition, which changed
what's reachable through a parameter rather than the result shape.
BinaryExpression rejects any matrix operand with a clear error;
real matrix arithmetic is not implemented yet. format_number's
clean formatting also fixes the long-standing '14.000000' display
issue for every existing scalar operation, not just new matrix code.
Known gaps: empty matrix literals ('[]') aren't rejected; matrix
copy-vs-reference semantics for 'B = A' are whatever std::vector's
copy constructor gives, not yet examined."
```

Next lesson: `A + B` — real matrix addition, replacing `BinaryExpression`'s current blanket
rejection of matrix operands with actual element-wise arithmetic.
