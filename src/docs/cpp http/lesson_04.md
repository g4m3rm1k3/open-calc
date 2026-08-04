# Lesson 4: Variables and an Environment That Remembers

**What you will build:** an `Environment` class (a name-to-value map), two new AST node
kinds (`VariableExpression`, `AssignmentExpression`), lexer support for identifiers and `=`,
and a change to `Parser::parse()` so it recognizes `x = 5` as an assignment rather than
trying (and failing) to parse it as one expression. The environment is created **once**, in
`main()`, before the request loop — not per-request — so a variable set on one HTTP request
is still there on the next. The transferable problem: every language you've used has this
same core mechanism (a name resolves to a value, at the moment it's looked up, based on
whatever was last assigned to it) — this lesson builds the smallest possible version of it,
honestly, including the part where state living across requests is a real design choice with
real consequences, not a free feature.

**What you need to know first:** Lesson 3's full pipeline — `Lexer` → `Parser` → `Expression`
tree → `evaluate()`. This lesson changes `Expression::evaluate()`'s own signature, so you'll
be touching `NumberExpression` and `BinaryExpression` again, not just adding new code
alongside them.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → ... → HTTP Response
                              ↳ Environment (persists across requests, lives outside this diagram's per-request flow)
```

Carrying two separate requests through this lesson's new machinery: request one's body is
`"x = 5"` — Lexer produces `IDENTIFIER(x) EQUALS NUMBER(5) END`, Parser recognizes the
`IDENTIFIER` immediately followed by `EQUALS` and builds an `AssignmentExpression`,
`evaluate()` stores `5` under `"x"` in the `Environment` and returns `5`. Request two's body
is `"x + 10"` — a **separate** HTTP request, a **separate** call into the lexer and parser —
but the *same* `Environment` object, still holding `x = 5` from request one, so it evaluates
to `15`.

---

## Concept Unit 1: A place to remember things

### The Problem

Every request so far has been stateless — `evaluate()` computes a number and forgets
everything the instant it returns. `x = 5` needs somewhere to actually put the `5` that
survives past the end of that one `evaluate()` call, so a *later* `evaluate()` call (for
`x + 10`, possibly on a completely different request) can find it again.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <string>
#include <unordered_map>
#include <stdexcept>

int main() {
    std::unordered_map<std::string, double> variables;

    variables["x"] = 5;
    variables["y"] = 10;

    std::cout << "x = " << variables["x"] << "\n";
    std::cout << "y = " << variables["y"] << "\n";

    auto it = variables.find("z");
    std::cout << "z found? " << (it != variables.end()) << "\n";

    return 0;
}
```

Real output:

```
x = 5
y = 10
z found? 0
```

### Discard

This bare `unordered_map` is deleted. The real project wraps the same idea in a small class
(next unit) rather than passing a raw map around everywhere.

### Mechanical walkthrough

- `std::unordered_map<std::string, double>` — **(a) first appearance.** A hash table
  mapping keys to values — here, variable names to their current numeric value.
  `unordered_map`, specifically, because this project has no need to iterate variables in
  any particular order; it only ever needs fast lookup by name.
- `variables["x"] = 5` — **(a) first appearance.** The `[]` operator on a map does two
  different jobs depending on context: here, it **inserts** a new entry for `"x"` if none
  exists yet (which it doesn't, the first time), or overwrites the existing one if it does —
  either way, after this line, `variables["x"]` reads back as `5`.
- `variables.find("z")` returning an **iterator**, compared against `variables.end()` — **(a)
  first appearance.** This is the correct way to *check whether a key exists* without the
  side effect `operator[]` has: `variables["z"]` alone would have silently **created** a
  `"z"` entry (defaulted to `0`) just by asking about it — a real, easy-to-miss bug if you
  use `[]` for existence checks instead of `find`.

### CS lens

A name resolving to a value through a hash table lookup, done fresh at the moment it's
needed, is the same underlying idea as a Python or JavaScript variable lookup, a database
index, or a DNS lookup translating a hostname to an IP address — "give me a name, get back
the current value associated with it, in roughly constant time regardless of how many other
names exist."

---

## Concept Unit 2: The real `Environment`

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `environment.h`, new `environment.cpp`.
- **Change type:** add.
- **Location:** new files, alongside `lexer.h`/`ast.h`/`parser.h`.
- **Dependencies:** none beyond the standard library.

### The New Code — type it yourself

`environment.h`:

```cpp
#pragma once
#include <string>
#include <unordered_map>

class Environment {
public:
    double get(const std::string& name) const;
    void set(const std::string& name, double value);

private:
    std::unordered_map<std::string, double> variables_;
};
```

### The Updated Project

A brand-new file, nothing to place it inside yet. `environment.cpp`, whole, for the same
reason:

```cpp
#include "environment.h"
#include <stdexcept>

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
```

### Mechanical walkthrough (new items only)

- `Environment::get` returning by value, taking `name` by `const&`, and marked `const`
  itself — **(b) reappearing pattern.** Same const-correctness habit `Lexer::peek() const`
  established in Lesson 1 — `get` promises not to modify the environment just by being
  asked what's in it.
- `it->second` — **(a) first appearance.** `unordered_map::find` returns an iterator to a
  key-value pair; `->first` would be the key (already known — it's `name`), `->second` is
  the value actually being looked up.
- `throw std::runtime_error("undefined variable: " + name)` on a missing key — **(b)
  reappearing pattern, deliberate design choice restated.** Exactly `Lexer::tokenize()`'s
  and `Parser::expect()`'s "fail loudly" choice from Lessons 2 and 3, applied here for the
  same reason: silently returning `0` for an undefined variable would let `y + 1` (where `y`
  was never assigned) quietly produce `1` — a wrong-but-plausible answer, indistinguishable
  from a correct one, instead of an honest error.

### CS lens

Wrapping the raw `unordered_map` from Concept Unit 1 in a small class with exactly two
methods (`get`, `set`) — instead of handing every caller the map directly — is
**encapsulation**: nothing outside `Environment` can iterate all variables, delete one, or
insert with a typo'd access pattern that skips the "does it exist" check. The class's
*interface* is deliberately narrower than what the underlying data structure could do.

### SE lens

The alternative — a bare `std::unordered_map<std::string, double>` passed directly to every
function that needs variables — would work today, identically. The real cost of that
alternative: every one of those functions would need to remember, on its own, to use `find`
instead of `[]` for lookups (Concept Unit 1's exact footgun), and if this project later
wants to add, say, variable *types* beyond plain numbers, every caller touching the raw map
would need updating instead of just this one class's internals. This is a small, cheap
example of a large principle: a narrow, deliberate interface is easier to change safely
later than a wide-open data structure passed around directly.

---

## Concept Unit 3: The lexer learns two new symbols

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `lexer.h`, `lexer.cpp`.
- **Change type:** add — two new `TokenType` values, one new `Lexer` method, two new
  branches in `tokenize()`.
- **Location:** `lexer.h`'s `enum class TokenType` and private method list; `lexer.cpp`'s
  `token_type_name`, a new `read_identifier` method, and `tokenize()`'s dispatch.
- **Dependencies:** none new.

### The New Code — type it yourself

In `lexer.h`, extend the enum:

```cpp
enum class TokenType { Number, Identifier, Equals, Plus, Minus, Star, Slash, LParen, RParen, End };
```

and declare the new method alongside `read_number`:

```cpp
    Token read_number();
    Token read_identifier();
```

### The Updated Project

`lexer.cpp`'s `token_type_name`, with the two new cases added (the rest of the function is
unchanged from Lesson 2):

```cpp
std::string token_type_name(TokenType type) {
    switch (type) {
        case TokenType::Number:     return "NUMBER";
        case TokenType::Identifier: return "IDENTIFIER";                 // ← new
        case TokenType::Equals:     return "EQUALS";                     // ← new
        case TokenType::Plus:       return "PLUS";
        case TokenType::Minus:      return "MINUS";
        case TokenType::Star:       return "STAR";
        case TokenType::Slash:      return "SLASH";
        case TokenType::LParen:     return "LPAREN";
        case TokenType::RParen:     return "RPAREN";
        case TokenType::End:        return "END";
    }
    return "UNKNOWN";
}
```

`read_identifier`, new, placed right after `read_number`:

```cpp
Token Lexer::read_identifier() {
    std::string text;
    while (std::isalpha(static_cast<unsigned char>(peek()))) {
        text += peek();
        advance();
    }
    return Token{TokenType::Identifier, text};
}
```

`tokenize()`'s dispatch, with the new branch and the new `switch` case marked:

```cpp
std::vector<Token> Lexer::tokenize() {
    std::vector<Token> tokens;

    while (pos_ < source_.size()) {
        char c = peek();

        if (std::isspace(static_cast<unsigned char>(c))) {
            advance();
            continue;
        }

        if (std::isdigit(static_cast<unsigned char>(c))) {
            tokens.push_back(read_number());
            continue;
        }

        if (std::isalpha(static_cast<unsigned char>(c))) {               // ← new
            tokens.push_back(read_identifier());                         // ← new
            continue;                                                    // ← new
        }                                                                // ← new

        switch (c) {
            case '=': tokens.push_back(Token{TokenType::Equals, "="}); advance(); break;  // ← new
            case '+': tokens.push_back(Token{TokenType::Plus, "+"}); advance(); break;
            case '-': tokens.push_back(Token{TokenType::Minus, "-"}); advance(); break;
            case '*': tokens.push_back(Token{TokenType::Star, "*"}); advance(); break;
            case '/': tokens.push_back(Token{TokenType::Slash, "/"}); advance(); break;
            case '(': tokens.push_back(Token{TokenType::LParen, "("}); advance(); break;
            case ')': tokens.push_back(Token{TokenType::RParen, ")"}); advance(); break;
            default:
                throw std::runtime_error(std::string("unexpected character: ") + c);
        }
    }

    tokens.push_back(Token{TokenType::End, ""});
    return tokens;
}
```

### Mechanical walkthrough (new items only)

- `read_identifier()` — **(b) reappearing pattern, not a new concept.** This is exactly
  `read_number`'s maximal-munch loop (Lesson 2, Concept Unit 1) — consume while a predicate
  holds, stop the instant it doesn't — with `std::isalpha` in place of `std::isdigit`. No
  new lab needed; the pattern was already isolated once and is being reused, not
  reintroduced. (Real variable names in most languages also allow digits after the first
  letter, and underscores — this lexer's `read_identifier` doesn't yet; a real, honest gap,
  left as an exercise.)
- `case '=':` — **(b) reappearing pattern.** Same single-character token shape as every
  other operator case already in this `switch`.

### Run it. Real output.

A quick standalone check, tokenizing `"x = 5 + y"`:

```
IDENTIFIER(x) EQUALS(=) NUMBER(5) PLUS(+) IDENTIFIER(y) END
```

### Connect

The lexer now hands the parser exactly the vocabulary it needs to recognize an assignment —
an `IDENTIFIER` immediately followed by `EQUALS`. Nothing about *meaning* happens here; the
parser (next units) is what decides that this particular token shape is special.

---

## Concept Unit 4: Changing an interface that already has callers

### The Problem

`VariableExpression::evaluate()` and `AssignmentExpression::evaluate()` (built next) both
need access to the `Environment` to do their job — a variable lookup or an assignment is
meaningless without it. But `Expression::evaluate()` currently takes no arguments at all
(Lesson 3), and `NumberExpression` and `BinaryExpression` already implement that exact
signature. This is the project's first real interface change: not adding something new
alongside old code, but changing a contract every existing implementer has to follow.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.h`, `ast.cpp` — both already existing from Lesson 3.
- **Change type:** refactor (`Expression::evaluate()`'s signature) plus add (two new
  classes).
- **Location:** every `evaluate` declaration and definition in both files.
- **Dependencies:** `environment.h` from Concept Unit 2.

### The New Code — type it yourself

The new signature, applied to the abstract base:

```cpp
class Environment;

class Expression {
public:
    virtual double evaluate(Environment& env) const = 0;
    virtual ~Expression() = default;
};
```

### The Updated Project

`ast.h`, in full — every existing declaration updated, two new classes added:

```cpp
#pragma once
#include <memory>
#include <string>
#include "lexer.h"

class Environment;                                                       // ← new

class Expression {
public:
    virtual double evaluate(Environment& env) const = 0;                 // ← changed
    virtual ~Expression() = default;
};

class NumberExpression : public Expression {
public:
    explicit NumberExpression(double value);
    double evaluate(Environment& env) const override;                    // ← changed

private:
    double value_;
};

class BinaryExpression : public Expression {
public:
    BinaryExpression(TokenType op, std::unique_ptr<Expression> left, std::unique_ptr<Expression> right);
    double evaluate(Environment& env) const override;                    // ← changed

private:
    TokenType op_;
    std::unique_ptr<Expression> left_;
    std::unique_ptr<Expression> right_;
};

class VariableExpression : public Expression {                           // ← new
public:                                                                  // ← new
    explicit VariableExpression(std::string name);                       // ← new
    double evaluate(Environment& env) const override;                    // ← new
                                                                           // ← new
private:                                                                  // ← new
    std::string name_;                                                   // ← new
};                                                                        // ← new

class AssignmentExpression : public Expression {                         // ← new
public:                                                                  // ← new
    AssignmentExpression(std::string name, std::unique_ptr<Expression> value);  // ← new
    double evaluate(Environment& env) const override;                    // ← new
                                                                           // ← new
private:                                                                  // ← new
    std::string name_;                                                   // ← new
    std::unique_ptr<Expression> value_;                                  // ← new
};                                                                        // ← new
```

### Mechanical walkthrough (new items only)

- `class Environment;` on its own line, with no `#include "environment.h"` anywhere in this
  file — **(a) first appearance.** This is a **forward declaration**: it tells the compiler
  "a class named `Environment` exists," which is enough to declare a *reference* to one
  (`Environment& env`) without needing to know anything about what's inside it — no fields,
  no methods. Including the full `environment.h` here would work too, but isn't needed: this
  header only ever *refers to* an `Environment`, it never creates one or calls a method on
  one directly. `ast.cpp` (next unit) does need the real definition, and includes
  `environment.h` itself.
- `double evaluate(Environment& env) const override;` repeated across four classes — **(b)
  reappearing signature, not four separate concepts.** Every subclass follows the exact
  same contract change; there's nothing new to explain four times over.

### CS lens

The forward declaration here is a small, concrete instance of a large idea: **minimizing
compile-time coupling**. `ast.h` depends on `Environment` existing, but not on its
*internals* — so a future change to `Environment`'s private `unordered_map` (its
implementation) never forces `ast.h`'s own includers to recompile, only files that actually
`#include "environment.h"` and touch its internals do. Also recognized in: Java/C# interface
types (calling code depends on the interface, not the concrete class), and Python's duck
typing achieving the same decoupling with no declaration at all.

### SE lens

Changing `evaluate()`'s signature after two working classes already implemented it is a real
example of **breaking-change cost, paid deliberately, now, while the codebase is small**.
The honest alternative that was rejected: giving `VariableExpression` and
`AssignmentExpression` a *different* method name (`evaluate_with_env`) instead of touching
the shared interface, which would avoid editing `NumberExpression`/`BinaryExpression` at
all — but then `BinaryExpression::evaluate()`, which needs to call `evaluate` on its
children, would have no single method name that works for *any* child expression, defeating
the entire point of polymorphism from Lesson 3. Paying this cost now, with four classes
total, is far cheaper than paying it later with forty.

---

## Concept Unit 5: `ast.cpp` catches up

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.cpp`.
- **Change type:** update every existing `evaluate` definition to match the new signature;
  add two new class implementations.
- **Location:** whole file, since every function in it is touched.
- **Dependencies:** `environment.h`, now actually included here (unlike `ast.h`).

### The New Code — type it yourself

The two new classes' implementations:

```cpp
VariableExpression::VariableExpression(std::string name) : name_(std::move(name)) {}

double VariableExpression::evaluate(Environment& env) const {
    return env.get(name_);
}

AssignmentExpression::AssignmentExpression(std::string name, std::unique_ptr<Expression> value)
    : name_(std::move(name)), value_(std::move(value)) {}

double AssignmentExpression::evaluate(Environment& env) const {
    double result = value_->evaluate(env);
    env.set(name_, result);
    return result;
}
```

### The Updated Project

`ast.cpp`, in full:

```cpp
#include "ast.h"
#include "environment.h"                                                 // ← new

#include <stdexcept>

NumberExpression::NumberExpression(double value) : value_(value) {}

double NumberExpression::evaluate(Environment& /*env*/) const {          // ← changed
    return value_;
}

BinaryExpression::BinaryExpression(TokenType op, std::unique_ptr<Expression> left, std::unique_ptr<Expression> right)
    : op_(op), left_(std::move(left)), right_(std::move(right)) {}

double BinaryExpression::evaluate(Environment& env) const {              // ← changed
    double lhs = left_->evaluate(env);                                   // ← changed
    double rhs = right_->evaluate(env);                                  // ← changed

    switch (op_) {
        case TokenType::Plus:  return lhs + rhs;
        case TokenType::Minus: return lhs - rhs;
        case TokenType::Star:  return lhs * rhs;
        case TokenType::Slash: return lhs / rhs;
        default:
            throw std::runtime_error("unsupported operator in BinaryExpression");
    }
}

VariableExpression::VariableExpression(std::string name) : name_(std::move(name)) {}   // ← new

double VariableExpression::evaluate(Environment& env) const {            // ← new
    return env.get(name_);                                               // ← new
}                                                                         // ← new

AssignmentExpression::AssignmentExpression(std::string name, std::unique_ptr<Expression> value)   // ← new
    : name_(std::move(name)), value_(std::move(value)) {}                // ← new

double AssignmentExpression::evaluate(Environment& env) const {          // ← new
    double result = value_->evaluate(env);                               // ← new
    env.set(name_, result);                                              // ← new
    return result;                                                       // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- `double NumberExpression::evaluate(Environment& /*env*/) const` — **(a) first appearance
  of this comment convention.** `NumberExpression` doesn't need the environment at all — a
  plain number means the same thing regardless of what variables exist — but the method
  still has to accept the parameter to satisfy the base class's contract. Commenting out the
  parameter's name (`/*env*/`) documents *on purpose, unused* rather than leaving a bare
  unnamed parameter, which reads ambiguously as "was this forgotten?"
- `AssignmentExpression::evaluate` computing `value_->evaluate(env)` **before** calling
  `env.set(...)`, then returning that same `result` — **(a) first appearance of this
  ordering choice.** This is what makes `y = x * 2` evaluate `x * 2` (reading the *current*
  value of `x`) before `y` is touched at all, and it's also why the assignment itself
  evaluates to the assigned value — `x = 5` returns `5` as its own result, which is why the
  very first `curl` request in this lesson gets `5` back, not some placeholder.
- `env.get(name_)` inside `VariableExpression::evaluate` — **(b) reappearing call.**
  `Environment::get` from Concept Unit 2, doing exactly the job it was built for — this is
  the first place in the project that actually calls it.

### CS lens

`AssignmentExpression` evaluating to the value it just assigned — so `x = 5` is itself a
valid expression with a value, not just a side-effecting statement — is the same design
choice C, C++, JavaScript, and Python's walrus operator (`:=`) all make, which is exactly
what legally allows chained assignment (`x = y = 5`) in those languages. Also recognized in:
this project doesn't support chained assignment yet (that would need `parse_statement` to
recurse, which it currently doesn't) — a real, honest gap, not a hidden one.

---

## Concept Unit 6: The parser recognizes an assignment

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.h`, `parser.cpp`.
- **Change type:** add a lookahead helper and a new top-level rule; add an `Identifier`
  branch to `parse_factor`.
- **Location:** `parser.h`'s private method list; `parser.cpp`'s `check`/`check_next`
  region, `parse()`, and `parse_factor()`.
- **Dependencies:** `VariableExpression`, `AssignmentExpression` from Concept Unit 5.

### The Problem

`parse()` currently calls `parse_expression()` directly. `parse_expression()`
(`parse_term`, `parse_factor`, ...) has no concept of "the first thing might be a name
followed by `=`" — and it shouldn't; mixing "is this an assignment" into the
already-recursive precedence-climbing chain would tangle two separate jobs into one. The
grammar needs a new top layer, above `parse_expression`, that makes exactly that one
decision first.

### The New Code — type it yourself

A one-token-ahead lookahead, since telling an assignment (`x = ...`) apart from a plain
variable reference (`x + ...`) requires seeing *two* tokens, not one:

```cpp
bool Parser::check_next(TokenType type) const {
    if (pos_ + 1 >= tokens_.size()) {
        return false;
    }
    return tokens_[pos_ + 1].type == type;
}
```

### The Updated Project

`parser.h`, with the new declarations marked:

```cpp
#pragma once
#include <vector>
#include <memory>
#include "lexer.h"
#include "ast.h"

class Parser {
public:
    explicit Parser(std::vector<Token> tokens);
    std::unique_ptr<Expression> parse();

private:
    std::vector<Token> tokens_;
    std::size_t pos_ = 0;

    const Token& peek() const;
    const Token& advance();
    bool check(TokenType type) const;
    bool check_next(TokenType type) const;                                // ← new
    Token expect(TokenType type, const std::string& message);

    std::unique_ptr<Expression> parse_statement();                        // ← new
    std::unique_ptr<Expression> parse_expression();
    std::unique_ptr<Expression> parse_term();
    std::unique_ptr<Expression> parse_factor();
};
```

`parser.cpp`'s `check`/`check_next` region and `parse()`/`parse_statement()`, with new lines
marked:

```cpp
bool Parser::check(TokenType type) const {
    return peek().type == type;
}

bool Parser::check_next(TokenType type) const {                          // ← new
    if (pos_ + 1 >= tokens_.size()) {                                    // ← new
        return false;                                                   // ← new
    }                                                                    // ← new
    return tokens_[pos_ + 1].type == type;                               // ← new
}                                                                         // ← new

Token Parser::expect(TokenType type, const std::string& message) {
    if (!check(type)) {
        throw std::runtime_error(message + " (got " + token_type_name(peek().type) + ")");
    }
    return advance();
}

std::unique_ptr<Expression> Parser::parse() {
    std::unique_ptr<Expression> result = parse_statement();              // ← changed
    expect(TokenType::End, "expected end of input");
    return result;
}

std::unique_ptr<Expression> Parser::parse_statement() {                  // ← new
    if (check(TokenType::Identifier) && check_next(TokenType::Equals)) { // ← new
        Token name = advance();                                         // ← new
        advance();                                                      // ← new
        std::unique_ptr<Expression> value = parse_expression();          // ← new
        return std::make_unique<AssignmentExpression>(name.text, std::move(value));  // ← new
    }                                                                    // ← new
                                                                           // ← new
    return parse_expression();                                          // ← new
}                                                                         // ← new
```

And `parse_factor()`, with the new `Identifier` branch marked (the rest of the method —
`Number`, `LParen`, the final `throw` — is unchanged from Lesson 3):

```cpp
std::unique_ptr<Expression> Parser::parse_factor() {
    if (check(TokenType::Number)) {
        Token number = advance();
        return std::make_unique<NumberExpression>(std::stod(number.text));
    }

    if (check(TokenType::Identifier)) {                                  // ← new
        Token name = advance();                                         // ← new
        return std::make_unique<VariableExpression>(name.text);          // ← new
    }                                                                    // ← new

    if (check(TokenType::LParen)) {
        advance();
        std::unique_ptr<Expression> inner = parse_expression();
        expect(TokenType::RParen, "expected closing parenthesis");
        return inner;
    }

    throw std::runtime_error("expected a number or '(' (got " + token_type_name(peek().type) + ")");
}
```

### Mechanical walkthrough (new items only)

- `check_next` mirroring `check`, but at `pos_ + 1` — **(a) first appearance of two-token
  lookahead.** Every parsing decision so far only needed the *current* token (`check`);
  telling `x = 5` apart from `x + 5` genuinely needs to see one token further ahead before
  committing to either path — `check_next` is that one extra look, bounds-checked the same
  way `advance()` already guards against running past `End`.
- `parse_statement()` as a new layer *above* `parse_expression()` — **(a) first appearance
  of this grammar layer.** The updated grammar is now:
  ```
  statement  := IDENTIFIER '=' expression | expression
  expression := term (('+' | '-') term)*
  ...
  ```
  `parse()` calls `parse_statement()` exactly once, at the very top — the assignment
  decision is made once, up front, never revisited partway through parsing an expression.
- `Token name = advance();` followed immediately by a second, unconditional `advance();` in
  `parse_statement` — **(b) reappearing concept, new usage.** The first `advance()` consumes
  the `IDENTIFIER` and captures it (for its `.text`); the second consumes the `EQUALS` token
  that `check_next` already confirmed is there, without needing to capture it — nothing
  about `=` itself is needed downstream, only that it was present.
- The new `Identifier` branch in `parse_factor` — **(b) reappearing pattern.** Structurally
  identical to the `Number` branch right above it: check the token type, consume it, wrap
  its `.text` in the matching AST node. This is what lets a variable be used *inside* a
  larger expression, like `x + 10` or `y = x * 2` — `parse_factor` is called deep inside
  `parse_term`/`parse_expression`'s recursive descent, so a variable reference can appear
  anywhere a number could.

### CS lens

`statement := IDENTIFIER '=' expression | expression` is a **grammar alternative** — a
single rule with two different possible shapes, chosen based on a lookahead. This is the
same shape as an `if`/`else` statement's grammar in every C-family language (`if (cond)
statement else statement` vs. just `statement`), and the same reason a one-token lookahead
sometimes isn't enough for real languages — C++ itself famously needs more than one token of
lookahead (or backtracking) to disambiguate some declarations, which is part of why C++
parsers are notoriously more complex than this project's still is.

---

## Concept Unit 7: The environment that outlives a request

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `server.cpp`.
- **Change type:** add `#include "environment.h"`; construct one `Environment` before the
  request loop; pass it into `evaluate()`.
- **Location:** the `#include` block; immediately before `while (true)`; the
  `ast->evaluate(...)` call inside the loop.
- **Dependencies:** `environment.h` from Concept Unit 2.

### The New Code — type it yourself

```cpp
    Environment environment;
```

placed once, before the loop begins.

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <cstring>
#include <ctime>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include "lexer.h"
#include "parser.h"
#include "environment.h"                                                 // ← new

std::string extract_body(const std::string& request) {
    std::size_t separator = request.find("\r\n\r\n");
    if (separator == std::string::npos) {
        return "";
    }
    return request.substr(separator + 4);
}

void log_request(const std::string& body) {
    std::time_t now = std::time(nullptr);
    char timestamp[20];
    std::strftime(timestamp, sizeof(timestamp), "%H:%M:%S", std::localtime(&now));
    std::cout << "[" << timestamp << "] POST /evaluate body=\"" << body << "\"" << std::endl;
}

int main() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(8080);

    bind(server_fd, (struct sockaddr*)&address, sizeof(address));
    listen(server_fd, 5);

    std::cout << "math engine listening on port 8080\n";

    Environment environment;                                             // ← new

    while (true) {
        int client_fd = accept(server_fd, nullptr, nullptr);

        char buffer[4096] = {0};
        read(client_fd, buffer, sizeof(buffer) - 1);
        std::string request(buffer);

        std::string body = extract_body(request);
        log_request(body);

        std::string response_body;
        try {
            Lexer lexer(body);
            Parser parser(lexer.tokenize());
            std::unique_ptr<Expression> ast = parser.parse();
            response_body = std::to_string(ast->evaluate(environment));  // ← changed
        } catch (const std::exception& e) {
            response_body = std::string("error: ") + e.what();
        }

        std::string response =
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: text/plain\r\n"
            "Content-Length: " + std::to_string(response_body.size()) + "\r\n"
            "\r\n" + response_body;

        write(client_fd, response.c_str(), response.size());
        close(client_fd);
    }

    close(server_fd);
    return 0;
}
```

### Mechanical walkthrough (new item only)

- `Environment environment;` declared **outside** the `while (true)` loop, right after the
  "listening" message — **(a) first appearance of this lifetime choice, and the single most
  important line in this lesson.** A local variable's lifetime in C++ ends when the block
  it's declared in exits — had this line instead been placed *inside* the loop (right next
  to `Lexer lexer(body);`, say), a brand-new, empty `Environment` would be constructed on
  every single request and destroyed at the end of it, and `x = 5` followed by `x + 10` on
  the next request would fail with `undefined variable: x` every time. Declaring it once,
  outside the loop, means the *same* `Environment` object is reused across every request the
  server ever handles for as long as it keeps running — which is exactly, and only, why
  state persists here at all.

### Commands

```
g++ -std=c++17 -Wall -c environment.cpp -o environment.o
g++ -std=c++17 -Wall -c lexer.cpp -o lexer.o
g++ -std=c++17 -Wall -c ast.cpp -o ast.o
g++ -std=c++17 -Wall -c parser.cpp -o parser.o
g++ -std=c++17 -Wall -c server.cpp -o server.o
g++ server.o lexer.o ast.o parser.o environment.o -o server
./server
```

### Run it. Real output.

Five separate `curl` requests, in order, against one running server:

```
$ curl -X POST http://localhost:8080/evaluate -d "x = 5"
5.000000

$ curl -X POST http://localhost:8080/evaluate -d "x + 10"
15.000000

$ curl -X POST http://localhost:8080/evaluate -d "y = x * 2"
10.000000

$ curl -X POST http://localhost:8080/evaluate -d "y + 1"
11.000000

$ curl -X POST http://localhost:8080/evaluate -d "z + 1"
error: undefined variable: z
```

Server's own log, real output, all five requests:

```
math engine listening on port 8080
[21:58:45] POST /evaluate body="x = 5"
[21:58:45] POST /evaluate body="x + 10"
[21:58:45] POST /evaluate body="y = x * 2"
[21:58:45] POST /evaluate body="y + 1"
[21:58:45] POST /evaluate body="z + 1"
```

The second request (`x + 10`) is the whole lesson proven in one line: it's a completely
separate HTTP request — a new socket connection, a new `Lexer`, a new `Parser` — and it
still knows `x` is `5`, because the `Environment` object itself never went away between
requests. `z + 1`, referencing a name that was genuinely never assigned, fails cleanly with
a readable error rather than silently defaulting to `0`.

### Connect

The engine now has real memory, but only one flat namespace, shared by every client
connecting to it — there's no notion of "your `x`" vs. "my `x`" (a real, deliberate
simplification worth naming honestly; every request currently shares the exact same global
`Environment`). That's fine for a single-user learning project and would be a real problem
for a multi-tenant one — a gap worth remembering, not fixing here. The next feature gap is
different: `sqrt(16)` and `sin(pi/4)` still don't parse at all — the lexer has no notion of
a function call, and neither does the grammar. That's Lesson 5 — the fixed set of node kinds
built so far gets its first taste of representing something *callable*.

---

## Closing

### Connect the pieces

Trace both requests end to end: `"x = 5"` arrives (Lesson 1's socket/HTTP layer, untouched)
→ `Lexer` produces `IDENTIFIER(x) EQUALS NUMBER(5) END` (Concept Unit 3's new lexing) →
`Parser::parse()` calls `parse_statement()`, which sees `Identifier` followed by `Equals`
and builds `AssignmentExpression("x", NumberExpression(5))` (Concept Unit 6) →
`ast->evaluate(environment)` runs `AssignmentExpression::evaluate`: evaluates `5`, calls
`environment.set("x", 5)` (Concept Unit 2's `Environment`, now holding one entry), returns
`5` → HTTP response `5.000000`. Then, on a **new** request, `"x + 10"` arrives → new
`Lexer`, new `Parser`, but `parser.parse()` this time sees no `Equals` after the (absent)
identifier check at the very start, falls through to `parse_expression()`, and eventually
`parse_factor()` builds a `VariableExpression("x")` → `evaluate(environment)` calls
`environment.get("x")`, finds `5` (because it's the *same* `Environment` object from
Concept Unit 7's placement outside the loop) → `5 + 10 = 15`.

### What breaks without this

Move `Environment environment;` from before the loop to just inside it, right after
`int client_fd = accept(...)`:

```cpp
    while (true) {
        int client_fd = accept(server_fd, nullptr, nullptr);
        Environment environment;   // moved here, inside the loop

        char buffer[4096] = {0};
        ...
```

(and delete the original declaration from before the loop). Rebuild, restart the server, and
repeat the exact same `"x = 5"` then `"x + 10"` sequence. Real result: `"x = 5"` still
returns `5.000000`, but `"x + 10"` now returns `error: undefined variable: x` — a brand-new,
empty `Environment` was constructed for that second request, because it's now local to one
iteration of the loop, destroyed and rebuilt every time. This is the single most important
experiment in this lesson — it's the difference between "this feature exists" and "this
feature actually works across requests." Restore the original placement before moving on.

### Exercises

- Send `"x = 5"` then, on a *separate* request, `"x = x + 1"` twice in a row, and predict
  each response before running it — trace through `AssignmentExpression::evaluate`
  evaluating its own `value_` (which itself references `x`) *before* overwriting `x`.
- `read_identifier` currently stops at the first non-letter character, so a variable named
  `x1` would lex as `IDENTIFIER(x)` followed by `NUMBER(1)`, not one token. Trace by hand
  what `"x1 = 5"` actually does with the current lexer, and confirm your prediction with
  `curl`.
- The error message `env.get` throws is `"undefined variable: " + name` — with no mention of
  *which request* or *when*. `log_request` already timestamps every request. As an exercise
  only (not required for this lesson's Definition of Done), consider what it would take to
  include the timestamp in error messages too, without fully implementing it.

### Definition of done

- [ ] `environment.h`/`environment.cpp` compile cleanly on their own.
- [ ] `ast.h`/`ast.cpp` compile with the new `Environment&` parameter on every `evaluate`,
      including `NumberExpression` and `BinaryExpression` from Lesson 3.
- [ ] `parser.h`/`parser.cpp` compile with `parse_statement` and `check_next` added.
- [ ] The five-request sequence above (`x = 5`, `x + 10`, `y = x * 2`, `y + 1`, `z + 1`)
      produces exactly the results shown, against one running server, without restarting it
      between requests.
- [ ] The "what breaks without this" exercise (moving `Environment` inside the loop) was
      actually run and reverted.
- [ ] Commit:

```
git add environment.h environment.cpp ast.h ast.cpp parser.h parser.cpp lexer.h lexer.cpp server.cpp
git commit -m "Add variables: Environment, assignment, and identifier lookup

Environment wraps an unordered_map<string, double> behind get/set,
throwing on undefined-variable lookups rather than defaulting to 0.
Expression::evaluate() now takes an Environment& - a breaking change
to an interface two classes already implemented, paid now while the
tree is small. Environment is constructed once in main(), before the
request loop, so variables persist across separate HTTP requests -
this is the actual point of the lesson, not an incidental detail.
Known gaps: single shared global namespace (no per-client isolation),
identifiers can't contain digits yet, no chained assignment."
```

Next lesson: `sqrt(16)`, `sin(pi/4)` — function calls, and the first real look at treating
functions themselves as values.
