# Lesson 11: plot(...) — When the Result Isn't Text

**What you will build:** `svg.h`/`svg.cpp` with `render_bar_chart`, a third `Value`
alternative (alongside `double` and `Matrix`) for raw SVG markup, a `plot` branch in
`FunctionCallExpression`, and — the actual point of this lesson — `server.cpp` choosing a
different HTTP `Content-Type` header depending on what kind of value the interpreter
produced. The transferable problem: every response this project has ever sent has been
`Content-Type: text/plain`, unconditionally, because every result has genuinely been text —
a number, or a matrix formatted as text. An SVG image is *also* text (this lesson's very
first lab proves that directly), but a browser needs to be told, via the header, that this
particular text should be interpreted and rendered as an image rather than displayed as a
literal string. This is the project's first time the **shape of the response itself**, not
just its content, depends on what was computed.

**What you need to know first:** Lesson 6's `Value` (the `is_number()`/`is_matrix()` pattern
this lesson extends to a third kind), and Lesson 9's `FunctionCallExpression` matrix branch
(where `det`/`inverse` already live, and where `plot` joins them).

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
                                                                                                      ▲
                                                                                                      └── this lesson: the Result Formatter
                                                                                                          now decides the Content-Type, not
                                                                                                          just the body text
```

No lexer changes, no parser changes. Carrying `plot(A)` through, with
`A = [3 7 2 9 5]` already stored: `FunctionCallExpression::evaluate` recognizes `"plot"`,
calls the new `render_bar_chart`, and returns a `Value` holding raw SVG text — which
`server.cpp` then has to recognize as different in kind from every previous result, both in
its body *and* in a header nothing before this lesson ever varied.

---

## Concept Unit 1: An image is just text, formatted a particular way

### The Problem

Before writing anything matrix-specific, it's worth directly confirming something easy to
take on faith without ever seeing it: SVG — a genuine, renderable image format — is not
binary data requiring special encoding. It's plain XML text, buildable with exactly the same
`std::ostringstream` tool this project has used since `Matrix::to_string()` in Lesson 6.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <sstream>

int main() {
    std::ostringstream oss;
    oss << "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\">";
    oss << "<rect x=\"10\" y=\"20\" width=\"30\" height=\"40\" fill=\"steelblue\" />";
    oss << "</svg>";

    std::cout << oss.str() << "\n";
    return 0;
}
```

Real output:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="20" width="30" height="40" fill="steelblue" /></svg>
```

Paste that exact string into a `.svg` file, or into an `<img>` tag's `src`, and a real
browser renders a blue rectangle. Nothing about producing it required anything beyond string
concatenation this project has done dozens of times already.

### Discard

This minimal single-rectangle example is deleted. `render_bar_chart` (next unit) builds the
same `<svg>...</svg>` structure, with one `<rect>` per data value instead of one fixed
rectangle, computed from real matrix data instead of hardcoded numbers.

### Mechanical walkthrough

- `xmlns="http://www.w3.org/2000/svg"` — **(a) first appearance, worth naming plainly
  rather than treating as boilerplate.** This attribute is what identifies the document as
  SVG XML specifically (as opposed to some other XML dialect) — without it, some strict SVG
  consumers won't recognize the markup as valid SVG at all.
- `viewBox="0 0 100 100"` — **(a) first appearance.** Defines the coordinate system: `100
  100` here means "this image's internal coordinate space is 100 units wide and 100 units
  tall," independent of whatever pixel size it's actually displayed at — every `x`/`y`/
  `width`/`height` on shapes inside is expressed in these units, not screen pixels.
- `<rect x="10" y="20" width="30" height="40" fill="steelblue" />` — **(a) first appearance.**
  One shape element: a rectangle whose top-left corner sits at `(10, 20)` in the `viewBox`'s
  coordinate space, `30` units wide, `40` units tall, filled with a named CSS color. This
  project's bar chart is, structurally, nothing more than several of these, positioned by a
  small amount of arithmetic.

### CS lens

SVG being plain text is itself a specific, deliberate design choice in a broader family:
**declarative, human-readable data formats** — the same philosophy behind JSON, XML
generally, and HTML itself. The alternative — a binary image format like PNG — packs pixel
data far more compactly, but isn't hand-editable or greppable the way this `<rect>` element
is; SVG trades file-size efficiency for exactly the property this unit demonstrated: you can
build one with a string-formatting tool you already know, and read one back with your own
eyes.

---

## Concept Unit 2: The real bar chart

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `svg.h`, new `svg.cpp`.
- **Change type:** add.
- **Location:** new files, alongside `matrix.h`/`matrix.cpp`.
- **Dependencies:** `matrix.h`, for the `Matrix` this function reads from.

### The New Code — type it yourself

`svg.h`:

```cpp
#pragma once
#include <string>
#include "matrix.h"

std::string render_bar_chart(const Matrix& data);
```

### The Updated Project

A brand-new file, nothing to place it inside yet. `svg.cpp`, whole:

```cpp
#include "svg.h"
#include <sstream>
#include <stdexcept>

std::string render_bar_chart(const Matrix& data) {
    if (data.rows() != 1) {
        throw std::runtime_error("plot expects a single row of values (1xN matrix)");
    }

    std::size_t n = data.cols();
    double max_value = 0.0;
    for (std::size_t i = 0; i < n; i++) {
        double value = data(0, i);
        if (value < 0.0) {
            throw std::runtime_error("plot does not support negative values yet");
        }
        if (value > max_value) {
            max_value = value;
        }
    }
    if (max_value == 0.0) {
        max_value = 1.0;
    }

    const double width = 400.0;
    const double height = 200.0;
    const double gap = 4.0;
    double bar_width = (width - gap * static_cast<double>(n + 1)) / static_cast<double>(n);

    std::ostringstream oss;
    oss << "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " << width << " " << height << "\">";
    oss << "<rect width=\"" << width << "\" height=\"" << height << "\" fill=\"white\" />";

    for (std::size_t i = 0; i < n; i++) {
        double value = data(0, i);
        double bar_height = (value / max_value) * (height - 20.0);
        double x = gap + static_cast<double>(i) * (bar_width + gap);
        double y = height - bar_height;
        oss << "<rect x=\"" << x << "\" y=\"" << y << "\" width=\"" << bar_width
            << "\" height=\"" << bar_height << "\" fill=\"steelblue\" />";
    }

    oss << "</svg>";
    return oss.str();
}
```

### Mechanical walkthrough (new items only)

- `if (data.rows() != 1) { throw ... }` — **(a) first appearance of this specific scope
  boundary, stated plainly.** This lesson deliberately only plots a single row of values —
  the same shape this project's own matrix literals already produce for `[1 2 3]` (Lesson 6)
  — not an arbitrary matrix. A `2×2` matrix like `B` from earlier lessons genuinely has no
  obvious single bar-chart reading (which row? which column? a grid of charts?), so this
  project rejects it outright with a clear message rather than guessing at a reasonable
  interpretation.
- The loop finding `max_value`, with `if (value < 0.0) { throw ...; }` folded into the same
  pass — **(a) first appearance of validating and measuring data in one loop.** Rather than
  a separate "check all values are non-negative" pass followed by a separate "find the
  maximum" pass, both happen together — this project's bar chart deliberately only supports
  non-negative values (drawing a bar *below* a baseline for negative numbers is a real,
  reasonable feature this lesson simply doesn't build), and checking for the disqualifying
  condition while already iterating costs nothing extra.
- `if (max_value == 0.0) { max_value = 1.0; }` — **(a) first appearance of guarding a
  division that hasn't happened yet.** If every value in the row is exactly `0`, the bar
  height formula below (`value / max_value`) would divide by zero — caught here, before it
  happens, by substituting a placeholder scale of `1.0` (a matrix of all zeros correctly
  renders as a chart of zero-height bars, not a crash or `nan`).
- `double bar_width = (width - gap * static_cast<double>(n + 1)) / static_cast<double>(n);`
  — **(a) first appearance of dividing available space among a variable number of items.**
  Total width, minus `n + 1` gaps (one gap before the first bar, one after each bar including
  the last), divided evenly among `n` bars — the specific arithmetic that makes this chart
  work correctly whether `A` has 3 values or 30, without any hardcoded bar count.
- `double x = gap + static_cast<double>(i) * (bar_width + gap);` — **(a) first appearance of
  positioning repeated elements left-to-right.** Bar `i`'s left edge is one gap in from the
  origin, plus `i` full bar-widths-plus-gaps — the same "position `i` times a fixed stride"
  arithmetic `Matrix`'s own flat storage used back in Lesson 6 (`row * cols_ + col`), applied
  here to laying out shapes instead of laying out numbers in memory.
- `double y = height - bar_height;` — **(a) first appearance of SVG's coordinate convention,
  stated explicitly.** SVG's `y` axis increases **downward** — `y = 0` is the *top* of the
  image, not the bottom, which is the opposite of the usual math-class convention. A bar of
  height `bar_height` that should sit on the bottom edge (`height`) and extend *upward* has
  to start at `height - bar_height`, not at `0` — get this backwards and every bar draws
  hanging from the top instead of standing on the bottom, still valid SVG, just visually
  wrong in a way no compiler or exception would ever catch.

### CS lens

Computing a screen (or `viewBox`) position from a data value via a **linear scale** —
`(value / max_value) * available_height` — is the foundational technique underlying
essentially all data visualization: also recognized in a progress bar's fill width, a
volume slider's handle position, and every chart library's axis-scaling code, all doing
the identical "map this data range onto this pixel range" arithmetic, just with more
configuration options layered on top.

### SE lens

Fixed canvas dimensions (`400×200`, hardcoded) and a fixed bar color (`"steelblue"`,
hardcoded) are real, deliberate simplifications — a production charting library would expose
both as configurable parameters. The tradeoff accepted here: hardcoding them means
`render_bar_chart` has exactly one parameter (`data`) and one job, which keeps this lesson's
actual point — a *different kind of result value* flowing through the interpreter — from
getting buried under configuration-handling code that doesn't teach anything new.

---

## Concept Unit 3: `Value` learns a third kind

### The Problem

`Value` (Lesson 6) currently holds `double` or `Matrix` — exactly two alternatives, matching
`is_number()`/`is_matrix()`/`as_number()`/`as_matrix()`. SVG markup is neither a number nor a
matrix; it's a third, genuinely different kind of result this project can produce, and
`Value` — already built as an extensible tagged union in Lesson 6 — is exactly the place to
add it.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `value.h`, `value.cpp` — both existing since Lesson 6.
- **Change type:** add a third `std::variant` alternative and one new named constructor.
- **Location:** whole files (small; the variant's type list is touched everywhere it
  appears).
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
Value Value::svg(std::string markup) {
    return Value(std::variant<double, Matrix, std::string>(std::move(markup)));
}

bool Value::is_svg() const {
    return std::holds_alternative<std::string>(data_);
}
```

### The Updated Project

`value.h`, in full:

```cpp
#pragma once
#include <string>
#include <variant>
#include "matrix.h"

class Value {
public:
    static Value number(double value);
    static Value matrix(Matrix value);
    static Value svg(std::string markup);                                // ← new

    bool is_number() const;
    bool is_matrix() const;
    bool is_svg() const;                                                  // ← new

    double as_number() const;
    const Matrix& as_matrix() const;

    std::string to_string() const;

private:
    explicit Value(std::variant<double, Matrix, std::string> data);       // ← changed
    std::variant<double, Matrix, std::string> data_;                      // ← changed
};
```

`value.cpp`, in full:

```cpp
#include "value.h"
#include "format.h"
#include <stdexcept>

Value::Value(std::variant<double, Matrix, std::string> data) : data_(std::move(data)) {}  // ← changed

Value Value::number(double value) {
    return Value(std::variant<double, Matrix, std::string>(value));      // ← changed
}

Value Value::matrix(Matrix value) {
    return Value(std::variant<double, Matrix, std::string>(std::move(value)));  // ← changed
}

Value Value::svg(std::string markup) {                                    // ← new
    return Value(std::variant<double, Matrix, std::string>(std::move(markup)));  // ← new
}                                                                          // ← new

bool Value::is_number() const {
    return std::holds_alternative<double>(data_);
}

bool Value::is_matrix() const {
    return std::holds_alternative<Matrix>(data_);
}

bool Value::is_svg() const {                                              // ← new
    return std::holds_alternative<std::string>(data_);                    // ← new
}                                                                          // ← new

static std::string kind_name(const std::variant<double, Matrix, std::string>& data) {  // ← new
    if (std::holds_alternative<double>(data)) {                           // ← new
        return "a number";                                               // ← new
    }                                                                     // ← new
    if (std::holds_alternative<Matrix>(data)) {                           // ← new
        return "a matrix";                                               // ← new
    }                                                                     // ← new
    return "an svg image";                                               // ← new
}                                                                          // ← new

double Value::as_number() const {
    if (!is_number()) {
        throw std::runtime_error("expected a number, got " + kind_name(data_));  // ← changed
    }
    return std::get<double>(data_);
}

const Matrix& Value::as_matrix() const {
    if (!is_matrix()) {
        throw std::runtime_error("expected a matrix, got " + kind_name(data_));  // ← changed
    }
    return std::get<Matrix>(data_);
}

std::string Value::to_string() const {
    if (is_number()) {
        return format_number(std::get<double>(data_));
    }
    if (is_matrix()) {                                                    // ← changed
        return std::get<Matrix>(data_).to_string();
    }                                                                     // ← changed
    return std::get<std::string>(data_);                                  // ← new
}
```

### Mechanical walkthrough (new items only)

- No `as_svg()` method, unlike `as_number()`/`as_matrix()`'s pattern — **(a) first appearance
  of a deliberate asymmetry, worth explaining rather than leaving unnoticed.** `as_number()`
  and `as_matrix()` exist because *other code* needs to extract a typed value to compute with
  it further (`BinaryExpression` adds two numbers; `Matrix::operator*` reads matrix
  elements). Nothing in this project ever needs to do further computation *with* SVG markup —
  it's terminal output, only ever headed straight to an HTTP response body. `to_string()`
  already extracts the raw string for exactly that purpose, so a separate `as_svg()` would be
  a method with no caller — dead code, not added.
- `static std::string kind_name(...)` — **(a) first appearance, and a real fix made before
  this code ever shipped, worth walking through honestly.** The first version of
  `as_number()`'s error message, written while building this lesson, still said `"expected a
  number, got a matrix"` unconditionally — copied forward from Lesson 6, when a matrix really
  was the only other possibility. With a third alternative added, that message would now lie
  outright if the actual value were SVG markup: it would confidently report "got a matrix"
  about something that was never a matrix at all. `kind_name` is the fix — a small helper
  that actually checks which alternative is active before describing it, used by both
  `as_number()` and `as_matrix()`'s error paths.

### CS lens

Every alternative of `Value` requiring only the accessors its own actual *uses* justify —
`double`/`Matrix` get full `as_...` extraction, `std::string` only gets `to_string()` — is a
concrete instance of the **interface segregation** idea: a type's public surface should
match what callers genuinely need, not grow symmetrically just because it "looks
consistent" to give every alternative the same set of methods. A method with no real caller
is a liability (something to maintain, test, and reason about) with no offsetting benefit.

---

## Concept Unit 4: One more name `FunctionCallExpression` recognizes

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.cpp` only.
- **Change type:** add one `#include` and one `if` branch.
- **Location:** `FunctionCallExpression::evaluate`'s matrix branch, alongside `det` and
  `inverse` from Lessons 9 and 10.
- **Dependencies:** `render_bar_chart` from Concept Unit 2, `Value::svg` from Concept Unit 3.

### The New Code — type it yourself

```cpp
        if (name_ == "plot") {
            return Value::svg(render_bar_chart(argument.as_matrix()));
        }
```

### The Updated Project

`FunctionCallExpression::evaluate`'s matrix branch, in full — the `det`/`inverse` cases are
unchanged from Lessons 9 and 10:

```cpp
#include "ast.h"
#include "environment.h"
#include "svg.h"                                                         // ← new
#include <stdexcept>

// ... (everything above FunctionCallExpression unchanged)

Value FunctionCallExpression::evaluate(Environment& env) const {
    Value argument = argument_->evaluate(env);

    if (argument.is_matrix()) {
        if (name_ == "det") {
            return Value::number(argument.as_matrix().determinant());
        }
        if (name_ == "inverse") {
            return Value::matrix(argument.as_matrix().inverse());
        }
        if (name_ == "plot") {                                          // ← new
            return Value::svg(render_bar_chart(argument.as_matrix()));   // ← new
        }                                                                // ← new
        throw std::runtime_error("unknown matrix function: " + name_);
    }

    double result = env.call(name_, argument.as_number());
    return Value::number(result);
}
```

### Mechanical walkthrough

Nothing new here — this is the third time this exact `if (name_ == "...")` shape has been
added to this method (Lessons 9 and 10 added `det` and `inverse` the same way), which is
itself worth noticing: a small, growing chain of hardcoded name checks. This is precisely
the accumulating cost Lesson 9's CS lens named and deliberately left unaddressed — a real,
visible pattern by now, not a one-off.

### CS lens

Three near-identical `if (name_ == "...")` checks, each dispatching to a different
matrix-taking function, is exactly the same **Strategy pattern** problem Lesson 5's
`FunctionTable` solved for scalar functions with a name-keyed map instead of a growing
`if`/`else if` chain. This project has, by this point, quietly grown a second, less elegant
version of the exact problem Lesson 5 already solved once — a real, visible case of
technical debt accumulating in plain sight across several lessons, not hidden or
hypothetical.

### SE lens

Refactoring this into a proper `MatrixFunctionTable` (mirroring Lesson 5's `FunctionTable`,
but for functions of shape `Matrix → Value` instead of `double → double`) is a real, obvious
next improvement — deliberately **not** done in this lesson. The reasoning: three cases is
still small enough to read in one glance, and this project has a working, established habit
(from `determinant()` staying hand-written rather than being folded into `cofactor()` in
Lesson 10) of not refactoring correct, working code purely for structural tidiness without a
concrete forcing function. If a fourth or fifth matrix function shows up, that's the moment
this `if` chain's cost stops being hypothetical and starts being worth paying down — noted
honestly here as a real, deferred decision, not silently ignored.

---

## Concept Unit 5: The response's shape depends on what was computed

### The Problem

Every response this project has ever sent has used `Content-Type: text/plain`,
unconditionally — correct for every result so far, because every result *was* plain text.
An SVG image, sent with `Content-Type: text/plain`, would still technically arrive
correctly as bytes — but a browser (or any HTTP client that respects the header) would
display it as a literal block of `<svg>...` text, not render it as an image. The header has
to match the content for the response to mean what it claims.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `server.cpp`.
- **Change type:** compute `content_type` conditionally instead of hardcoding it.
- **Location:** inside the `try` block, and the response-building string concatenation.
- **Dependencies:** `Value::is_svg()` from Concept Unit 3.

### The New Code — type it yourself

```cpp
        std::string response_body;
        std::string content_type = "text/plain";
        try {
            Lexer lexer(body);
            Parser parser(lexer.tokenize());
            std::unique_ptr<Expression> ast = parser.parse();
            Value result = ast->evaluate(environment);
            response_body = result.to_string();
            if (result.is_svg()) {
                content_type = "image/svg+xml";
            }
        } catch (const std::exception& e) {
            response_body = std::string("error: ") + e.what();
        }
```

### The Updated Project

The relevant section of `main()`'s request loop, in full — the socket/HTTP mechanics
around it are Lesson 1's, completely untouched:

```cpp
        std::string body = extract_body(request);
        log_request(body);

        std::string response_body;
        std::string content_type = "text/plain";                        // ← new
        try {
            Lexer lexer(body);
            Parser parser(lexer.tokenize());
            std::unique_ptr<Expression> ast = parser.parse();
            Value result = ast->evaluate(environment);                   // ← changed
            response_body = result.to_string();                         // ← changed
            if (result.is_svg()) {                                      // ← new
                content_type = "image/svg+xml";                         // ← new
            }                                                            // ← new
        } catch (const std::exception& e) {
            response_body = std::string("error: ") + e.what();
        }

        std::string response =
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: " + content_type + "\r\n"                     // ← changed
            "Content-Length: " + std::to_string(response_body.size()) + "\r\n"
            "\r\n" + response_body;
```

### Mechanical walkthrough (new items only)

- `std::string content_type = "text/plain";` declared **before** the `try` block, not inside
  it — **(a) first appearance of a variable deliberately declared outside a `try` so it's
  still in scope, with a sensible default, no matter which path execution takes.** If
  `content_type` were declared inside the `try` block, it would go out of scope by the time
  the response-building code runs, since that code sits *after* the `try`/`catch` entirely —
  declaring it outside, defaulted to `"text/plain"`, means every code path (success, or an
  exception caught and handled) reaches the response-building code with a valid,
  well-defined `content_type`, without needing to duplicate the assignment inside `catch` as
  well.
- `Value result = ast->evaluate(environment);` as its own named variable, rather than the
  previous single chained line — **(a) first appearance of this specific restructuring,
  and why it was needed.** Every earlier lesson chained `ast->evaluate(environment)`
  directly into `.to_string()` in one expression, since nothing else about the result was
  ever needed. This lesson needs the *same* `Value` inspected twice — once via
  `.to_string()` for the body, once via `.is_svg()` for the header — which is only possible
  if it's captured in a named variable first rather than discarded immediately after one use.

### Run it. Real output.

```
$ curl -i -X POST http://localhost:8080/evaluate -d "A = [3 7 2 9 5]"
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 11

[3 7 2 9 5]

$ curl -i -X POST http://localhost:8080/evaluate -d "plot(A)"
HTTP/1.1 200 OK
Content-Type: image/svg+xml
Content-Length: 450

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="white" /><rect x="4" y="140" width="75.2" height="60" fill="steelblue" /><rect x="83.2" y="60" width="75.2" height="140" fill="steelblue" /><rect x="162.4" y="160" width="75.2" height="40" fill="steelblue" /><rect x="241.6" y="20" width="75.2" height="180" fill="steelblue" /><rect x="320.8" y="100" width="75.2" height="100" fill="steelblue" /></svg>

$ curl -X POST http://localhost:8080/evaluate -d "B = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "plot(B)"
error: plot expects a single row of values (1xN matrix)

$ curl -X POST http://localhost:8080/evaluate -d "C = [1 -2 3]"
[1 -2 3]

$ curl -X POST http://localhost:8080/evaluate -d "plot(C)"
error: plot does not support negative values yet

$ curl -i -X POST http://localhost:8080/evaluate -d "x = 5"
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 1

5

$ curl -X POST http://localhost:8080/evaluate -d "det(B)"
-2
```

Server's own log, real output, all eight requests:

```
math engine listening on port 8080
[22:43:25] POST /evaluate body="A = [3 7 2 9 5]"
[22:43:25] POST /evaluate body="plot(A)"
[22:43:25] POST /evaluate body="B = [1 2; 3 4]"
[22:43:25] POST /evaluate body="plot(B)"
[22:43:25] POST /evaluate body="C = [1 -2 3]"
[22:43:25] POST /evaluate body="plot(C)"
[22:43:25] POST /evaluate body="x = 5"
[22:43:25] POST /evaluate body="det(B)"
```

The header lines, captured with `curl -i`, are the real proof this lesson worked: `plot(A)`'s
response genuinely carries `Content-Type: image/svg+xml`, while `A`'s own request one line
above (and `x = 5` at the end) both still carry `Content-Type: text/plain` — the exact same
server, choosing differently, request by request, based on what was actually computed. The
bar heights inside the SVG are worth checking by hand once against the source data
`[3 7 2 9 5]` (max `9`): value `9` produces `height="180"` (the full available height),
value `2` produces `height="40"` (a fifth of that) — `2/9 × 180 = 40`, matching exactly.
`plot(B)` and `plot(C)` prove both validation branches inside `render_bar_chart` (wrong
shape, negative values) fire with their own specific messages, and the server keeps running
and logging normally afterward in every case.

### Connect

This project's Result Formatter stage — named in the architecture since Lesson 1, empty of
any real behavior until this lesson — now genuinely does formatting work that varies by
kind, not just by value. What's still entirely missing is anything happening *inside* the
language the server evaluates: every feature so far (variables, functions, matrices, now
plots) computes one expression and returns one answer, in one request. There's no `for`, no
`while`, no `if` — the interpreter itself has never had to make a control-flow decision.
That's Lesson 12.

---

## Closing

### Connect the pieces

Trace `plot(A)` end to end, with `A = [3 7 2 9 5]` from an earlier request: Lesson 1's
socket/HTTP layer delivers `"plot(A)"` unchanged → the lexer/parser (unmodified since Lesson
9) build `FunctionCallExpression("plot", VariableExpression("A"))` → `evaluate(environment)`:
`A` resolves to a `Value` wrapping the stored `1×5` matrix → Concept Unit 4's new branch
fires, calling `render_bar_chart(argument.as_matrix())` → Concept Unit 2's function validates
the shape (one row — passes), finds `max_value = 9`, computes `bar_width`, and builds five
`<rect>` elements via `std::ostringstream`, each positioned and scaled from the real data →
the resulting string is wrapped in `Value::svg(...)` (Concept Unit 3) → back in
`server.cpp`, `result.to_string()` (Concept Unit 3's unmodified fallthrough) returns the raw
markup as the body, and `result.is_svg()` (Concept Unit 5) sets `content_type` to
`"image/svg+xml"` → the HTTP response is assembled with that header → sent back by Lesson
1's untouched socket-writing code, and any real browser pointed at this endpoint would render
five blue bars.

### What breaks without this

In `server.cpp`, temporarily revert `content_type` to always be `"text/plain"`, ignoring
`result.is_svg()`:

```cpp
            Value result = ast->evaluate(environment);
            response_body = result.to_string();
            // if (result.is_svg()) {
            //     content_type = "image/svg+xml";
            // }
```

Rebuild, and send `plot(A)` again with `curl -i`. Real result: the response body is
byte-for-byte identical `<svg>...` markup — nothing about the *content* changed — but the
header now reads `Content-Type: text/plain`. This is the entire lesson's point made
concrete: the same correct bytes, with a header that lies about what they are. A real
browser given this response would show the literal text `<svg xmlns=...>` on screen as a
string, not render an image — a completely silent failure from this server's point of view
(no error, no crash, `curl` shows a "successful" `200 OK`), only visible in how a client
actually chooses to interpret the mislabeled bytes. Restore the check before moving on.

### Exercises

- `plot([9])` — a single-element row vector — trace through `render_bar_chart` by hand: what
  is `max_value`, what is `bar_width`, and does the resulting SVG describe one full-height
  bar spanning nearly the whole canvas? Verify with `curl`.
- `plot([0 0 0])` exercises the `max_value == 0.0` guard from Concept Unit 2 directly —
  confirm the response is valid SVG (not a crash, not `nan` anywhere in the markup) with
  three zero-height bars.
- The `kind_name` helper (Concept Unit 3) is currently only used by `as_number()`'s and
  `as_matrix()`'s error messages. Trace by hand what error message `sqrt(plot([1 2 3]))`
  would currently produce (a plot's result fed into a scalar function) — which function
  actually throws, and does `kind_name` correctly describe an SVG value as "an svg image"
  rather than something misleading?

### Definition of done

- [ ] `svg.h`/`svg.cpp` compile cleanly with `render_bar_chart` added.
- [ ] `value.h`/`value.cpp` compile with the third `std::variant` alternative, `Value::svg`,
      `is_svg`, and the corrected `kind_name`-based error messages.
- [ ] `ast.cpp` compiles with the `"plot"` branch added alongside `"det"`/`"inverse"`.
- [ ] `server.cpp` compiles with `content_type` computed conditionally.
- [ ] `plot(A)` for a valid row vector returns real SVG markup with
      `Content-Type: image/svg+xml`, verified with `curl -i`.
- [ ] A non-row-vector and a negative-value matrix each produce their own specific error from
      `render_bar_chart`.
- [ ] Every existing plain-text response (`x = 5`, `det(B)`, etc.) still carries
      `Content-Type: text/plain`.
- [ ] The "what breaks without this" exercise (reverting to a hardcoded content type) was
      actually run and reverted.
- [ ] Commit:

```
git add svg.h svg.cpp value.h value.cpp ast.cpp server.cpp
git commit -m "Add plot(A): SVG bar charts and content-type-aware responses

render_bar_chart builds SVG the same way Matrix::to_string builds
text - std::ostringstream, no special image-encoding machinery,
since SVG is plain XML text. Value gains a third variant alternative
(string, for SVG markup) alongside double and Matrix; unlike the
other two, it gets no as_svg() extraction method, since nothing in
this project ever computes further with plotted output - it's
terminal, to_string() already gives callers everything they need.
Fixed a real error-message bug caught before shipping: as_number/
as_matrix's failure messages assumed only two possible alternatives
and would have misreported an svg value as 'a matrix'; added a
kind_name helper that actually checks.

server.cpp now computes Content-Type conditionally based on
Value::is_svg() rather than a hardcoded text/plain - the first time
this project's response shape, not just its content, depends on
what was computed. FunctionCallExpression's matrix branch is now a
three-case if-chain (det/inverse/plot) - the same Strategy-pattern
problem FunctionTable solved for scalar functions in Lesson 5,
now quietly re-accumulating here; not refactored yet, noted as
real, visible technical debt rather than fixed prematurely.
Bar chart is deliberately scoped to a single row of non-negative
values; a 2D matrix or negative entries are rejected outright."
```

Next lesson: `for`, `while`, `if` — real control flow inside the language itself, the first
time this interpreter's own execution has to branch or repeat rather than compute one
expression straight through.
