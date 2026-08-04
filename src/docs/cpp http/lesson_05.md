# Lesson 5: Functions as Values

**What you will build:** a `FunctionTable` class holding built-in math functions
(`sqrt`, `sin`, `cos`, `abs`) as `std::function` values in a lookup table, composed into
`Environment`, plus one new AST node, `FunctionCallExpression`, and a small parser change so
`sqrt(16)` and `sin(pi/6)` actually evaluate. The transferable problem: so far, every
"thing this project can do" (add, multiply, look up a variable) has been baked directly into
`BinaryExpression`'s `switch` or `VariableExpression`'s lookup — hardcoded, closed lists.
Functions need to be *open* — addable without touching the parser or the AST — and the way
to do that is treating a function itself as a storable, passable value, not just a name the
compiler recognizes.

**What you need to know first:** Lesson 4's `Environment` and its `get`/`set`, and the
`check_next` lookahead the parser already has — this lesson reuses it rather than adding a
new one.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → ... → HTTP Response
```

This lesson is the first to genuinely touch the **Built-in Functions** stage from the
project's original architecture — until now that box in the pipeline was empty. Carrying
`"sqrt(16)"` through: Lexer produces tokens it already fully understands from Lesson 4 —
`IDENTIFIER(sqrt) LPAREN NUMBER(16) RPAREN END` — no new token types needed at all. Parser
builds `FunctionCallExpression("sqrt", NumberExpression(16))`. `evaluate()` computes the
argument (`16`), then asks the environment to *call* `"sqrt"` with it, landing in the new
Built-in Functions stage, which returns `4`.

---

## Concept Unit 1: A function, stored like any other value

### The Problem

`BinaryExpression::evaluate()`'s `switch` handles exactly four operators, decided at compile
time. Adding a fifth built-in capability (`sqrt`, then `sin`, then whatever comes after)
by extending a `switch` every single time doesn't scale, and — worse — mixes "arithmetic
operators" and "named functions" into the same mechanism when they're conceptually
different things. What's needed is a way to hand a *function itself* around as data: stored
in a container, looked up by name, called later.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <functional>
#include <cmath>

int main() {
    std::function<double(double)> square = [](double x) { return x * x; };
    std::function<double(double)> root = [](double x) { return std::sqrt(x); };

    std::cout << "square(4) = " << square(4) << "\n";
    std::cout << "root(16)  = " << root(16) << "\n";

    square = root;
    std::cout << "square is now root: square(16) = " << square(16) << "\n";

    return 0;
}
```

Real output:

```
square(4) = 16
root(16)  = 4
square is now root: square(16) = 4
```

The third line proves the point: `square` is a *variable*, not a fixed name for one
specific function — reassigning it (`square = root;`) genuinely changes what calling
`square(...)` does, exactly the way reassigning an `int` variable changes what reading it
gives back.

### Discard

`square`/`root` are deleted. The real project stores functions the same way — as
`std::function` values — inside a lookup table, next unit.

### Mechanical walkthrough

- `std::function<double(double)>` — **(a) first appearance.** A type that can hold *any*
  callable thing — a lambda, a free function, anything — as long as its signature matches
  ("takes a `double`, returns a `double`"). The variable `square` doesn't remember it started
  life as a lambda; from its own point of view it's just "a `double(double)` I can call."
- `[](double x) { return x * x; }` — **(b) reappearing syntax, new context.** A lambda —
  syntax already seen briefly in Lesson 3's exercises reference to closures being upcoming —
  here, an anonymous function with no captures (empty `[]`), assigned directly into a
  `std::function` variable.
- `square(4)` — **(a) first appearance of this call syntax on a variable.** Calling `square`
  the same way you'd call an ordinary function — `operator()` on `std::function` is
  overloaded to run whatever callable it currently holds.
- `square = root;` — **(a) first appearance.** Plain assignment — because `square` is a real
  variable of type `std::function<double(double)>`, not a special language construct,
  assigning a different callable into it is just... assignment. Nothing new syntactically;
  what's new is realizing a function can be the *value* on the right-hand side of `=` at
  all.

### CS lens

This is what "functions as first-class values" means, concretely: a function can be stored
in a variable, passed as an argument, returned from another function, and reassigned — with
no special-case syntax beyond what any other value already gets. Also recognized in:
Python's functions being ordinary objects (`f = len; f([1,2,3])` works), JavaScript
callbacks, and this project's own future — Lesson 9's closures are this same idea, one step
further, where the stored function also remembers the environment it was created in.

---

## Concept Unit 2: Looking a function up by name

### The Problem

One `std::function` variable isn't enough — the project needs to look up *which* function to
call based on a **name** that arrives as text in the request body (`"sqrt"`, `"sin"`, ...),
the same way `Environment::get` looks up a variable's value by its name.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <string>
#include <unordered_map>
#include <functional>
#include <cmath>
#include <stdexcept>

int main() {
    std::unordered_map<std::string, std::function<double(double)>> table;
    table["sqrt"] = [](double x) { return std::sqrt(x); };
    table["abs"] = [](double x) { return std::fabs(x); };

    for (const std::string name : {"sqrt", "abs"}) {
        auto it = table.find(name);
        std::cout << name << "(9) = " << it->second(9) << "\n";
    }

    try {
        table.at("cos")(0);
    } catch (const std::out_of_range&) {
        std::cout << "cos is not in the table\n";
    }

    return 0;
}
```

Real output:

```
sqrt(9) = 3
abs(9) = 9
cos is not in the table
```

### Discard

This table is deleted. The real project's version is the same idea, wrapped in a class
(next unit) with a name-based interface, exactly like `Environment` wrapped its own
`unordered_map` in Lesson 4.

### Mechanical walkthrough

- `std::unordered_map<std::string, std::function<double(double)>>` — **(a) first
  appearance of this combination**, but not a new concept in either half — `unordered_map`
  from Lesson 4, `std::function` from Concept Unit 1. Combining a known container with a
  known value type is exactly what makes "functions as values" (Concept Unit 1) actually
  *useful*: because a function is a normal value, it can be a map's value type with no
  special accommodation needed anywhere.
- `table.at("cos")` — **(a) first appearance.** Unlike `operator[]` (Lesson 4's footgun) or
  `find` (also Lesson 4), `.at()` throws `std::out_of_range` immediately if the key is
  missing, rather than returning an iterator you have to check — a more direct way to
  express "this must exist, or fail loudly right here," used here specifically to
  demonstrate the missing-key path without a manual `find`/compare.

### CS lens

Looking up *behavior* by name, rather than selecting it with a hardcoded `switch` or
`if`/`else` chain, is the **Strategy pattern**: each function in the table is an
interchangeable strategy for "how do I compute this," selected at runtime by a string key
instead of at compile time by which branch of code happens to run. Also recognized in: a
web framework's URL router (`"/users"` → this handler, `"/posts"` → that one), and a plugin
system where each plugin registers itself under a name.

---

## Concept Unit 3: The real `FunctionTable`

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `functions.h`, new `functions.cpp`.
- **Change type:** add.
- **Location:** new files, alongside `environment.h`/`environment.cpp`.
- **Dependencies:** none beyond the standard library.

### The New Code — type it yourself

`functions.h`:

```cpp
#pragma once
#include <string>
#include <unordered_map>
#include <functional>

class FunctionTable {
public:
    FunctionTable();
    double call(const std::string& name, double argument) const;

private:
    std::unordered_map<std::string, std::function<double(double)>> functions_;
};
```

### The Updated Project

A brand-new file, nothing to place it inside yet. `functions.cpp`, whole:

```cpp
#include "functions.h"
#include <cmath>
#include <stdexcept>

FunctionTable::FunctionTable() {
    functions_["sqrt"] = [](double x) { return std::sqrt(x); };
    functions_["sin"]  = [](double x) { return std::sin(x); };
    functions_["cos"]  = [](double x) { return std::cos(x); };
    functions_["abs"]  = [](double x) { return std::fabs(x); };
}

double FunctionTable::call(const std::string& name, double argument) const {
    auto it = functions_.find(name);
    if (it == functions_.end()) {
        throw std::runtime_error("unknown function: " + name);
    }
    return it->second(argument);
}
```

### Mechanical walkthrough (new items only)

- `functions_["sqrt"] = [](double x) { return std::sqrt(x); };` inside the constructor —
  **(a) first appearance of registration-in-constructor.** Every built-in function is set up
  once, when a `FunctionTable` is constructed — there's no "add a function later" API yet,
  deliberately: this table is meant to represent the fixed set of built-ins, not a place
  user-defined functions eventually live (that's a different feature, for a much later
  lesson).
- `it == functions_.end()` inside `call`, throwing `"unknown function: " + name` — **(b)
  reappearing pattern.** The exact same fail-loudly choice as `Environment::get`'s
  `"undefined variable: "` — an unrecognized function name is exactly as much a real,
  reportable error as an unrecognized variable name, and gets the identical treatment.

### CS lens

`FunctionTable`'s constructor populating `functions_` once and never changing it afterward
(no `set` or `add` method exists) makes every `FunctionTable` instance **immutable after
construction** — a deliberate, narrower interface than `Environment`'s (which explicitly
supports `set`). Also recognized in: read-only configuration objects loaded once at startup,
and `const` static data in general — narrowing what's *possible* through an interface, not
just what's *likely*, is worth doing whenever an object's job really is fixed for its
lifetime.

---

## Concept Unit 4: Composing `FunctionTable` into `Environment`

### The Problem

`FunctionCallExpression::evaluate()` (next unit) needs access to both the function lookup
and, in principle, variables (`sqrt(x)` needs `x`'s value first) — but
`Expression::evaluate()`'s signature only takes one `Environment&`. Rather than adding a
*second* parameter to every `evaluate()` method again (which Lesson 4 already did once, for
`Environment` itself), this lesson makes a different, narrower choice: `Environment` itself
grows a `FunctionTable` member, so one reference still gives every node everything it needs.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `environment.h`, `environment.cpp` — both existing since Lesson 4.
- **Change type:** add a member, add a constructor, add a `call` method.
- **Location:** `environment.h`'s class body; `environment.cpp`'s top (new constructor) and
  bottom (new `call`).
- **Dependencies:** `functions.h` from Concept Unit 3 — and, unlike `ast.h`'s forward
  declaration of `Environment` back in Lesson 4, this one needs the **full** definition of
  `FunctionTable`, not just its name.

### The New Code — type it yourself

```cpp
Environment::Environment() {
    variables_["pi"] = std::acos(-1.0);
}
```

### The Updated Project

`environment.h`, in full:

```cpp
#pragma once
#include <string>
#include <unordered_map>
#include "functions.h"                                                   // ← new

class Environment {
public:
    Environment();                                                       // ← new

    double get(const std::string& name) const;
    void set(const std::string& name, double value);
    double call(const std::string& function_name, double argument) const; // ← new

private:
    std::unordered_map<std::string, double> variables_;
    FunctionTable functions_;                                            // ← new
};
```

`environment.cpp`, in full:

```cpp
#include "environment.h"
#include <cmath>                                                         // ← new
#include <stdexcept>

Environment::Environment() {                                             // ← new
    variables_["pi"] = std::acos(-1.0);                                  // ← new
}                                                                         // ← new

double Environment::get(const std::string& name) const {
    auto it = variables_.find(name);
    if (it == variables_.end()) {
        throw std::runtime_error("undefined variable: " + name);
    }
    return it->second;
}

void Environment::set(const std::string& name, double value) {
    variables_[name] = value;
}

double Environment::call(const std::string& function_name, double argument) const { // ← new
    return functions_.call(function_name, argument);                     // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- `#include "functions.h"` in `environment.h` itself, not just in `environment.cpp` — **(a)
  first appearance of a genuinely required (not optional) include in a header.** Recall
  Lesson 4's `ast.h`, which only needed `class Environment;` (a forward declaration) because
  it only ever held a *reference* to one. `Environment` here holds a `FunctionTable` **by
  value**, as a direct member (`FunctionTable functions_;`, not `FunctionTable* functions_`
  or `FunctionTable& functions_`) — and a value member requires the compiler to know the
  member's complete size at the point `Environment` itself is defined, which a forward
  declaration alone can never provide. This is the direct contrast to Lesson 4's forward
  declaration, and worth holding both in mind together: forward-declare when you only need a
  reference or pointer; include the real header when you hold something by value.
- `Environment::Environment() { variables_["pi"] = std::acos(-1.0); }` — **(a) first
  appearance of a non-trivial constructor on this class.** Lesson 4's `Environment` had no
  user-written constructor at all — the compiler-generated default one (which does nothing)
  was enough. Adding real setup logic (predefining `pi`) is what forces writing this
  constructor out explicitly for the first time. `std::acos(-1.0)` computes π at full
  `double` precision using the standard library's own arccosine, rather than a hand-typed
  `3.14159...` literal that risks a transcription error or insufficient precision.
- `functions_` as a member with no explicit initializer anywhere in `Environment`'s
  constructor — **(a) first appearance of default member construction.** `FunctionTable`
  has its own default constructor (Concept Unit 3), which runs automatically for `functions_`
  before `Environment`'s own constructor body executes — nothing needs to be written to make
  this happen; it's why every `FunctionTable` (and its full set of built-ins) exists the
  instant an `Environment` does, with zero extra code here.

### SE lens

The alternative rejected here — adding a `const FunctionTable&` as a second parameter to
every `evaluate()` — was seriously worth considering, since it mirrors exactly what Lesson 4
already did once for `Environment` itself. The real tradeoff: a second parameter keeps
`Environment` and `FunctionTable` as two clearly separate concerns, callable independently —
but it means every one of the five (soon six) `Expression` subclasses' signatures changes
*again*. Composing `FunctionTable` into `Environment` instead keeps every existing
`evaluate(Environment&)` signature completely untouched — worth noticing concretely:
`NumberExpression`, `BinaryExpression`, `VariableExpression`, and `AssignmentExpression`
required zero edits this lesson. The real cost accepted instead: `Environment` now has two
somewhat different jobs bundled into one object (mutable variable storage, and read-only
function dispatch) rather than one job cleanly.

---

## Concept Unit 5: A new AST node — calling, not just looking up

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.h`, `ast.cpp`.
- **Change type:** add — one new class, no changes to any existing one.
- **Location:** `ast.h`, after `AssignmentExpression`; `ast.cpp`, after
  `AssignmentExpression::evaluate`.
- **Dependencies:** `Environment::call` from Concept Unit 4.

### The New Code — type it yourself

```cpp
class FunctionCallExpression : public Expression {
public:
    FunctionCallExpression(std::string name, std::unique_ptr<Expression> argument);
    double evaluate(Environment& env) const override;

private:
    std::string name_;
    std::unique_ptr<Expression> argument_;
};
```

```cpp
FunctionCallExpression::FunctionCallExpression(std::string name, std::unique_ptr<Expression> argument)
    : name_(std::move(name)), argument_(std::move(argument)) {}

double FunctionCallExpression::evaluate(Environment& env) const {
    double value = argument_->evaluate(env);
    return env.call(name_, value);
}
```

### The Updated Project

`ast.h`'s tail, with the new class appended after `AssignmentExpression` (everything above
it unchanged from Lesson 4):

```cpp
class AssignmentExpression : public Expression {
public:
    AssignmentExpression(std::string name, std::unique_ptr<Expression> value);
    double evaluate(Environment& env) const override;

private:
    std::string name_;
    std::unique_ptr<Expression> value_;
};

class FunctionCallExpression : public Expression {                       // ← new
public:                                                                  // ← new
    FunctionCallExpression(std::string name, std::unique_ptr<Expression> argument);  // ← new
    double evaluate(Environment& env) const override;                    // ← new
                                                                           // ← new
private:                                                                  // ← new
    std::string name_;                                                   // ← new
    std::unique_ptr<Expression> argument_;                                // ← new
};                                                                        // ← new
```

### Mechanical walkthrough

Nothing here is conceptually new — every piece is a direct reuse of a pattern this project
already has: a class deriving from `Expression` (Lesson 3), holding a name and an owned
child `Expression` via `unique_ptr` (the exact shape of `AssignmentExpression`), evaluating
its child first and then doing something with the result (the exact shape of
`BinaryExpression` and `AssignmentExpression` both). The one line worth pausing on:
`env.call(name_, value)` — this is where the tree stops being self-contained and reaches out
to `Environment`'s new composed `FunctionTable`, exactly the seam Concept Unit 4 built.

### Connect

Four AST node kinds now share one interface and get treated identically by anything that
just calls `evaluate()` — including each other, recursively. This is Lesson 3's
polymorphism, still paying for itself two lessons later: adding a fifth node kind required
touching *zero* existing `Expression` subclasses.

---

## Concept Unit 6: The parser tells a call apart from a variable

### The Problem

`parse_factor()` currently has one branch for `Identifier`: build a `VariableExpression`.
But `sqrt(16)` starts with exactly the same token (`IDENTIFIER(sqrt)`) as a bare variable
reference like `x` would — the *next* token is what actually distinguishes them: `LParen`
means a call, anything else means a plain variable. This is precisely the same shape of
decision Lesson 4 solved for assignment (`IDENTIFIER` then `Equals`) — same tool applies.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.cpp` only — `parser.h` needs no changes, since `check_next`
  already exists from Lesson 4.
- **Change type:** add a new branch to `parse_factor`, ahead of the existing `Identifier`
  branch.
- **Location:** `parse_factor()`, immediately before the plain-`Identifier` check.
- **Dependencies:** `FunctionCallExpression` from Concept Unit 5.

### The New Code — type it yourself

```cpp
    if (check(TokenType::Identifier) && check_next(TokenType::LParen)) {
        Token name = advance();
        advance();
        std::unique_ptr<Expression> argument = parse_expression();
        expect(TokenType::RParen, "expected closing parenthesis after function argument");
        return std::make_unique<FunctionCallExpression>(name.text, std::move(argument));
    }
```

### The Updated Project

`parse_factor()`, in full (the `Number`, `LParen`-grouping, and final `throw` branches are
unchanged from Lesson 3):

```cpp
std::unique_ptr<Expression> Parser::parse_factor() {
    if (check(TokenType::Number)) {
        Token number = advance();
        return std::make_unique<NumberExpression>(std::stod(number.text));
    }

    if (check(TokenType::Identifier) && check_next(TokenType::LParen)) {  // ← new
        Token name = advance();                                         // ← new
        advance();                                                      // ← new
        std::unique_ptr<Expression> argument = parse_expression();       // ← new
        expect(TokenType::RParen, "expected closing parenthesis after function argument"); // ← new
        return std::make_unique<FunctionCallExpression>(name.text, std::move(argument));   // ← new
    }                                                                    // ← new

    if (check(TokenType::Identifier)) {
        Token name = advance();
        return std::make_unique<VariableExpression>(name.text);
    }

    if (check(TokenType::LParen)) {
        advance();
        std::unique_ptr<Expression> inner = parse_expression();
        expect(TokenType::RParen, "expected closing parenthesis");
        return inner;
    }

    throw std::runtime_error("expected a number or '(' (got " + token_type_name(peek().type) + ")");
}
```

This new branch must come **before** the plain `Identifier` branch — `check` alone can't
tell `sqrt` (about to be called) apart from `x` (a plain reference); only the combination
with `check_next` can, and the more specific check has to run first or it never gets a
chance to fire.

### Mechanical walkthrough (new items only)

- `check(TokenType::Identifier) && check_next(TokenType::LParen)` — **(b) reappearing
  pattern.** Structurally identical to `parse_statement`'s
  `check(Identifier) && check_next(Equals)` from Lesson 4 — the same two-token lookahead
  tool, applied to a different pair of tokens, to make a different but equally-shaped
  decision.
- `Token name = advance(); advance();` — **(b) reappearing pattern.** The exact same "capture
  the identifier, then unconditionally consume the token that justified this branch"
  sequence `parse_statement` uses for `IDENTIFIER =` — here consuming `LParen` instead of
  `Equals`, with nothing about the parenthesis itself needed afterward.
- `parse_expression()` called for the argument, not `parse_factor()` — **(a) first
  appearance of this specific choice, worth noticing.** The argument to a function call can
  be any full expression — `sqrt(x + 1)`, not just `sqrt(x)` — which is exactly why this
  reaches all the way back up to `parse_expression`, the top of the precedence chain, rather
  than trying to parse only a single factor. This is the same recursive-descent
  "self-reference" that made parenthesized groups work in Lesson 3, reused for the exact
  same reason: an argument can be arbitrarily complex.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "sqrt(16)"
4.000000

$ curl -X POST http://localhost:8080/evaluate -d "sin(pi/6)"
0.500000

$ curl -X POST http://localhost:8080/evaluate -d "x = 9"
9.000000

$ curl -X POST http://localhost:8080/evaluate -d "sqrt(x) + 1"
4.000000

$ curl -X POST http://localhost:8080/evaluate -d "tan(1)"
error: unknown function: tan

$ curl -X POST http://localhost:8080/evaluate -d "pi"
3.141593
```

Server's own log, real output, all six requests:

```
math engine listening on port 8080
[22:04:17] POST /evaluate body="sqrt(16)"
[22:04:17] POST /evaluate body="sin(pi/6)"
[22:04:17] POST /evaluate body="x = 9"
[22:04:17] POST /evaluate body="sqrt(x) + 1"
[22:04:17] POST /evaluate body="tan(1)"
[22:04:17] POST /evaluate body="pi"
```

`sin(pi/6)` correctly returns `0.5` — proof that `pi`, predefined in `Environment`'s
constructor (Concept Unit 4), and a function call, both work together inside one ordinary
expression, no special-casing anywhere. `sqrt(x) + 1`, run right after `x = 9` on a separate
request, proves a function's argument can itself be a variable resolved from the same
persistent `Environment` Lesson 4 built. `tan(1)` proves the "unknown function" error path
is real, not hypothetical — `tan` genuinely isn't registered in `FunctionTable`'s
constructor.

### Connect

Notice what did **not** change this lesson: `lexer.h`/`lexer.cpp` (zero edits — function
calls needed no new token types, because `IDENTIFIER`, `LParen`, and `RParen` already
existed for other reasons), `server.cpp` (zero edits — `Environment environment;` calls the
same constructor line as before; its *behavior* changed because the constructor's body did,
but the caller never had to know that), and four of five `Expression` subclasses. That's the
layering from Lessons 1–4 genuinely paying for itself — a real feature landed by touching
five focused files, not by touching everything.

---

## Closing

### Connect the pieces

Trace `"sin(pi/6)"` end to end: Lesson 1's socket/HTTP layer delivers it unchanged →
Lesson 2's `Lexer`, completely unmodified, produces
`IDENTIFIER(sin) LPAREN IDENTIFIER(pi) SLASH NUMBER(6) RPAREN END` → `parse_factor` sees
`Identifier` followed by `LParen` (Concept Unit 6), consumes `sin` and `(`, recurses into
`parse_expression()` for the argument, which parses `pi / 6` as a `BinaryExpression` whose
left side is a `VariableExpression("pi")` → back in the function-call branch, `expect(RParen,
...)` consumes the closing `)`, and a `FunctionCallExpression("sin", <that BinaryExpression>)`
is built → `evaluate(environment)` runs: the argument evaluates first (`VariableExpression`
resolves `pi` via `Environment::get`, set to `std::acos(-1.0)` in Concept Unit 4's
constructor; divided by `6`) → `env.call("sin", value)` reaches into `Environment`'s composed
`FunctionTable` (Concept Unit 4) and calls the actual `std::sin` lambda registered in
`FunctionTable`'s constructor (Concept Unit 3) → `0.5` comes back, wrapped in the same HTTP
response code from Lesson 1, untouched.

### What breaks without this

In `parse_factor`, temporarily swap the order of the two `Identifier`-related branches — put
the plain-`Identifier` check *before* the function-call check:

```cpp
    if (check(TokenType::Identifier)) {
        Token name = advance();
        return std::make_unique<VariableExpression>(name.text);
    }

    if (check(TokenType::Identifier) && check_next(TokenType::LParen)) {
        // ... unreachable now
    }
```

Rebuild and send `"sqrt(16)"` again. Real result: `error: expected end of input (got
LPAREN)`. Trace why: `parse_factor` now matches the plain-`Identifier` branch first (it only
checks `Identifier`, nothing about what follows), consumes just `sqrt` as a
`VariableExpression`, and returns immediately — leaving `LPAREN NUMBER(16) RPAREN` completely
unconsumed. `parse()`'s own `expect(TokenType::End, ...)` then finds `LPAREN` sitting where
it expected nothing left at all, and reports exactly that. Restore the original order (more
specific check first) before moving on.

### Exercises

- Add `"log"` and `"exp"` to `FunctionTable`'s constructor (using `std::log` and `std::exp`
  from `<cmath>`), rebuild, and confirm `log(exp(1))` evaluates to (very close to) `1`.
- `FunctionCallExpression` currently only supports exactly one argument — trace by hand what
  happens if you send `"sqrt(4, 9)"` with the *current* grammar (no comma token exists at
  all yet), and predict which error message it produces before checking with `curl`.
- `pi` is a variable, set once in `Environment`'s constructor, using the exact same
  `variables_` map ordinary assignment writes to. Send `"pi = 3"` followed by `"pi"` on a
  separate request, and confirm (a real, honest gap) that nothing in this project currently
  stops a built-in constant from being silently overwritten.

### Definition of done

- [ ] `functions.h`/`functions.cpp` compile cleanly on their own.
- [ ] `environment.h`/`environment.cpp` compile with the new constructor, `call` method, and
      composed `FunctionTable` member.
- [ ] `ast.h`/`ast.cpp` compile with `FunctionCallExpression` added and every existing class
      left untouched.
- [ ] `parser.cpp` compiles with the new function-call branch, ordered before the plain
      `Identifier` branch.
- [ ] `sqrt(16)`, `sin(pi/6)`, and `sqrt(x) + 1` (after a separate `x = 9` request) all
      produce the correct results shown above, against one running server.
- [ ] `tan(1)` returns a readable `unknown function` error without crashing the server.
- [ ] The "what breaks without this" exercise (swapping branch order) was actually run and
      reverted.
- [ ] Commit:

```
git add functions.h functions.cpp environment.h environment.cpp ast.h ast.cpp parser.cpp
git commit -m "Add function calls: FunctionTable, FunctionCallExpression

FunctionTable stores built-ins (sqrt, sin, cos, abs) as std::function
values in a name-keyed map (Strategy pattern) rather than a switch,
so adding a function means one line in FunctionTable's constructor,
not touching the parser or AST. Composed into Environment as a
member (not a second evaluate() parameter) to avoid re-touching
every existing Expression subclass's signature - Environment now
predefines 'pi' in its own constructor via std::acos(-1.0).
lexer.h/lexer.cpp and server.cpp needed zero changes this lesson.
Known gap: only single-argument functions are supported; no comma
token exists yet. Built-in constants like pi can currently be
silently overwritten by ordinary assignment."
```

Next lesson: `A = [1 2; 3 4]` — matrices, and the project's first genuinely new *kind* of
value (not just a `double` anymore).
