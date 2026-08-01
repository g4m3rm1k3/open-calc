# Lesson 3: From Tokens to an Answer

**What you will build:** an `Expression` class hierarchy (the AST) and a recursive-descent
`Parser` — two new file pairs, `ast.h`/`ast.cpp` and `parser.h`/`parser.cpp` — that turn
Lesson 2's token list into a real tree and then a real number, so `POST /evaluate` with
`2*(3+4)` finally returns `14` instead of a list of labeled tokens. The transferable
problem: a flat list of tokens has no structure — `2 * ( 3 + 4 )` and a hypothetical
`( 2 * 3 ) + 4` would produce the *exact same token list* if the lexer only saw `2 * 3 + 4`
with no parens at all, yet they mean different things. Structure — which operation applies
to which operands, in which order — has to come from somewhere, and that's the parser's
entire job.

**What you need to know first:** Lesson 2's `Lexer`, `Token`, and `TokenType` — this lesson
consumes the exact `std::vector<Token>` `tokenize()` produces. Nothing about matrices or
functions-as-values yet.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → ... → HTTP Response
                          ▲       ▲
                          └───────┴── this lesson. Carrying "2*(3+4)": Lesson 1 delivers it
                              as the HTTP body; Lesson 2's lexer turns it into
                              NUMBER(2) STAR LPAREN NUMBER(3) PLUS NUMBER(4) RPAREN END;
                              this lesson's parser turns that token list into a tree —
                              a BinaryExpression(*) whose left child is NumberExpression(2)
                              and whose right child is a BinaryExpression(+) of
                              NumberExpression(3) and NumberExpression(4) — and then calls
                              evaluate() on that tree to produce 14.
```

---

## Concept Unit 1: A function that calls itself

### The Problem

The grammar this parser needs — an expression can contain a parenthesized expression, which
can itself contain another expression — is naturally self-referential. Before writing that,
it's worth isolating what a function calling itself even does, syntactically, in C++.

### Introduce the concept in isolation

```cpp
#include <iostream>

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    std::cout << "factorial(4) = " << factorial(4) << "\n";
    return 0;
}
```

Real output:

```
factorial(4) = 24
```

This is called **recursion**: `factorial` is defined in terms of a smaller call to itself,
with `n <= 1` as the **base case** that stops it from calling itself forever.

### Discard

`factorial` is deleted — it's not part of this project. The recursive functions built next
(`parse_expression`, `parse_term`, `parse_factor`) follow the same shape: each calls a
"smaller" one, with the base case being "the next token isn't an operator, stop."

### CS lens

Recursion here isn't just a trick — it's the natural expression of a **recursively defined
grammar**: an expression is defined in terms of terms, which are defined in terms of
factors, which can themselves contain a whole expression again (inside parentheses). The
function structure mirrors the grammar structure directly — this is the same idea behind
recursive JSON parsers (a JSON value can contain another JSON value) and directory listing
code that recurses into subdirectories.

---

## Concept Unit 2: One base class, many shapes

### The Problem

The tree this parser builds needs nodes of genuinely different shapes — a plain number
(`NumberExpression`) and an operation with two children (`BinaryExpression`) — but the rest
of the program (specifically, `evaluate()`) needs to treat every node the same way: "give
me your value," without caring which shape it actually is.

### Introduce the concept in isolation

```cpp
#include <iostream>

class Animal {
public:
    virtual void speak() const = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void speak() const override {
        std::cout << "woof\n";
    }
};

class Cat : public Animal {
public:
    void speak() const override {
        std::cout << "meow\n";
    }
};

void announce(const Animal& a) {
    a.speak();
}

int main() {
    Dog d;
    Cat c;
    announce(d);
    announce(c);
    return 0;
}
```

Real output:

```
woof
meow
```

`announce` was written once, against `Animal`, and never mentions `Dog` or `Cat` by name —
yet it calls the *correct* `speak()` for whichever one it's handed. That's proof the actual
function called is decided at runtime, based on the real object, not at compile time based
on the declared type.

### Discard

`Animal`/`Dog`/`Cat` are deleted. The real project's base class is `Expression`, with
`NumberExpression` and `BinaryExpression` playing the `Dog`/`Cat` role — built in Concept
Unit 4.

### Mechanical walkthrough

- `virtual void speak() const = 0;` — **(a) first appearance.** `virtual` marks this method
  as one that derived classes are expected to override, and where the *actual* override
  called depends on the real object at runtime, not the compile-time type of the reference
  or pointer used to call it. The `= 0` makes it a **pure virtual function** — `Animal`
  itself provides no implementation at all, which in turn makes `Animal` an **abstract
  class**: it can describe the shared interface, but you can never construct a bare
  `Animal` directly, only a `Dog` or a `Cat`.
- `virtual ~Animal() = default;` — **(a) first appearance.** A virtual destructor. Without
  it, deleting a `Dog` through an `Animal*` (or letting a `unique_ptr<Animal>` go out of
  scope, coming in the next unit) would only run `Animal`'s destructor, silently skipping
  any cleanup `Dog` itself needed — a real, classic bug. `= default` asks the compiler to
  generate the ordinary do-nothing version, just marked `virtual`.
- `class Dog : public Animal` — **(a) first appearance.** `Dog` **inherits** from `Animal`
  — every `Dog` *is an* `Animal`, and can be used anywhere an `Animal` is expected (as
  `announce`'s parameter proves).
- `void speak() const override` — **(a) first appearance.** `override` isn't required by the
  language, but tells the compiler "I intend this to override a virtual method from the base
  class" — if the signature doesn't actually match one (a typo in the name, a missing
  `const`), the compiler now errors instead of silently creating an unrelated new method
  that never gets called. Cheap insurance, worth using every time.
- `void announce(const Animal& a)` — **(a) first appearance.** Takes a *reference* to the
  base class — this is what makes runtime dispatch possible: `a` doesn't know at compile
  time whether it refers to a `Dog` or `Cat`, only that it's "some `Animal`."

### CS lens

This mechanism is called **polymorphism** — one interface, many shapes, with the correct
behavior selected at runtime. Also recognized in: Python's duck typing (any object with a
matching method just works, no shared base class even required), and every GUI framework's
event handlers (`onClick` means something different for a `Button` vs. a `Checkbox`, called
through one shared interface).

### SE lens

The alternative to this design would be one `Expression` class with a `type` field and a
giant `switch` in `evaluate()` checking that field. The real tradeoff: the `switch` version
keeps all the logic in one place (arguably easier to scan once), but every new expression
kind means editing that one growing `switch` and risking forgetting a case; the
polymorphic version spreads logic across small classes, but adding a new kind means adding a
new class with no risk of touching — or breaking — existing ones. This project uses
polymorphism because the tree is going to keep growing new node kinds for many lessons to
come (function calls, matrices, control flow) and isolating each is worth more than one
tidy switch statement.

---

## Concept Unit 3: A tree node that owns its children

### The Problem

`BinaryExpression` needs to hold *other* `Expression` objects — its left and right operands
— and those operands were themselves built dynamically while parsing (you don't know how
big the tree is until you've read the whole input). Someone has to own that memory and free
it eventually; get this wrong and you either leak it or free it twice.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <memory>

int main() {
    std::unique_ptr<int> owner = std::make_unique<int>(42);
    std::cout << "value: " << *owner << "\n";

    std::unique_ptr<int> new_owner = std::move(owner);
    std::cout << "new_owner value: " << *new_owner << "\n";
    std::cout << "owner is now empty: " << (owner == nullptr) << "\n";

    return 0;
}
```

Real output:

```
value: 42
new_owner value: 42
owner is now empty: 1
```

That output proves the core rule: a `unique_ptr` has exactly one owner at a time.
`std::move(owner)` doesn't copy the `int` — it transfers ownership to `new_owner`, and
`owner` genuinely becomes empty (`nullptr`) afterward. There is no way to have two
`unique_ptr`s pointing at the same object simultaneously — the compiler refuses to compile
code that tries to copy one (there's no `owner2 = owner;` here because it wouldn't build).

### Discard

This `int`-owning example is deleted. The real project uses `unique_ptr<Expression>` instead
of `unique_ptr<int>` — same ownership rule, holding a tree node instead of a bare integer.

### Mechanical walkthrough

- `std::unique_ptr<int>` — **(a) first appearance.** A smart pointer that owns a
  heap-allocated `int` and automatically deletes it when the `unique_ptr` itself is
  destroyed (goes out of scope) — no manual `delete` anywhere in this code, and none needed.
- `std::make_unique<int>(42)` — **(a) first appearance.** Allocates a new `int` on the heap,
  initializes it to `42`, and wraps it in a `unique_ptr` — the preferred way to create one,
  over writing `new`/`unique_ptr` construction by hand.
- `*owner` — **(b) reappearing concept, new type.** The dereference operator, same meaning
  it's always had — "give me the thing this pointer points to" — now applied to a smart
  pointer instead of a raw one.
- `std::move(owner)` — **(a) first appearance.** Doesn't move anything by itself — it casts
  `owner` into a form that tells the `unique_ptr` assignment operator "you're allowed to
  steal this one's contents instead of copying them." The real transfer happens inside
  `unique_ptr`'s own move-assignment, triggered by this cast.

### CS lens

This is **ownership**, made explicit and enforced by the compiler rather than left as a
convention to remember. Also recognized in: Rust's borrow checker (this exact rule is Rust's
entire memory model, not just an optional pattern); a library book that can only be checked
out by one person at a time — checking it out to someone new requires the previous holder to
give it up first, exactly like `std::move` here.

### SE lens

The alternative — plain `Expression*` raw pointers everywhere, with manual `delete` calls —
is what C++ looked like before smart pointers were standard, and is still legal code today.
The real cost of that alternative: it compiles fine right up until someone forgets a
`delete` (a leak) or calls it twice (undefined behavior, often a crash, sometimes much
worse) — bugs that don't show up in a quick test, only under load or after hours of runtime.
`unique_ptr` moves that cost from "a runtime bug you hope you catch" to "a compile error you
can't miss," at the cost of learning move semantics, which is a real, non-trivial thing to
learn — arguably the trickiest single concept in this lesson.

---

## Concept Unit 4: The real AST

### Project Change

- **Reference Source:** no reference counterpart — this project's AST shape is its own.
- **Files affected:** new `ast.h`, new `ast.cpp`.
- **Change type:** add.
- **Location:** new files, alongside `lexer.h`/`lexer.cpp`.
- **Dependencies:** `lexer.h` (for `TokenType`, used to tag which operator a
  `BinaryExpression` performs).

### The New Code — type it yourself

`ast.h`:

```cpp
#pragma once
#include <memory>
#include "lexer.h"

class Expression {
public:
    virtual double evaluate() const = 0;
    virtual ~Expression() = default;
};

class NumberExpression : public Expression {
public:
    explicit NumberExpression(double value);
    double evaluate() const override;

private:
    double value_;
};

class BinaryExpression : public Expression {
public:
    BinaryExpression(TokenType op, std::unique_ptr<Expression> left, std::unique_ptr<Expression> right);
    double evaluate() const override;

private:
    TokenType op_;
    std::unique_ptr<Expression> left_;
    std::unique_ptr<Expression> right_;
};
```

### The Updated Project

Brand-new files — nothing yet to place them inside. `ast.cpp` (the implementation) is also
shown whole, for the same reason:

```cpp
#include "ast.h"
#include <stdexcept>

NumberExpression::NumberExpression(double value) : value_(value) {}

double NumberExpression::evaluate() const {
    return value_;
}

BinaryExpression::BinaryExpression(TokenType op, std::unique_ptr<Expression> left, std::unique_ptr<Expression> right)
    : op_(op), left_(std::move(left)), right_(std::move(right)) {}

double BinaryExpression::evaluate() const {
    double lhs = left_->evaluate();
    double rhs = right_->evaluate();

    switch (op_) {
        case TokenType::Plus:  return lhs + rhs;
        case TokenType::Minus: return lhs - rhs;
        case TokenType::Star:  return lhs * rhs;
        case TokenType::Slash: return lhs / rhs;
        default:
            throw std::runtime_error("unsupported operator in BinaryExpression");
    }
}
```

### Mechanical walkthrough (new items only)

- `double value_;` as `NumberExpression`'s only field — **(c) already basic** — an ordinary
  member, same idea as `Lexer`'s `source_`.
- `BinaryExpression(TokenType op, std::unique_ptr<Expression> left, std::unique_ptr<Expression> right)`
  taking `unique_ptr` **by value**, then `: left_(std::move(left))` — **(a) first
  appearance, combining Concept Units 2 and 3.** Taking the `unique_ptr`s by value (not by
  reference) means the caller's `unique_ptr` is *moved into* the parameter when the
  constructor is called, and then moved again into the member field inside the initializer
  list — ownership passes cleanly from "whoever built this subtree" to "this
  `BinaryExpression` node," with no copy and no ambiguity about who's responsible for
  freeing it.
- `left_->evaluate()` inside `BinaryExpression::evaluate()` — **(a) first appearance of this
  exact call.** This is the polymorphism from Concept Unit 2 doing real work: `left_`'s
  declared type is `unique_ptr<Expression>`, but the actual object it points to might be a
  `NumberExpression` or another `BinaryExpression` — whichever it is, calling `evaluate()`
  runs the *correct* one automatically. This is also the recursion from Concept Unit 1,
  now operating on the tree instead of on an integer: evaluating a `BinaryExpression` means
  evaluating its children first, which may themselves be `BinaryExpression`s.
- `default: throw std::runtime_error(...)` inside the `switch` — **(b) reappearing
  pattern.** The same "fail loudly on something unexpected" choice `Lexer::tokenize()` made
  in Lesson 2 — here it's a safety net for an operator token that somehow reached evaluation
  without being one of the four handled (shouldn't currently be reachable, given how the
  parser builds these nodes, but costs nothing to guard against).

### CS lens

`evaluate()` walking the tree, calling itself on children before combining their results, is
a **post-order tree traversal** — visit both children, *then* act on the current node. Also
recognized in: computing a directory's total size (sum the children's sizes, then add your
own files), and how a compiler computes an expression's resulting type by first computing
its operands' types.

---

## Concept Unit 5: The real Parser

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `parser.h`, new `parser.cpp`.
- **Change type:** add.
- **Location:** new files.
- **Dependencies:** `lexer.h` (consumes `Token`/`TokenType`), `ast.h` (builds `Expression`
  trees).

### The New Code — type it yourself

`parser.h`:

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
    Token expect(TokenType type, const std::string& message);

    std::unique_ptr<Expression> parse_expression();
    std::unique_ptr<Expression> parse_term();
    std::unique_ptr<Expression> parse_factor();
};
```

### The Updated Project

`parser.cpp`, whole (new file, nothing yet to place it inside):

```cpp
#include "parser.h"
#include <stdexcept>

Parser::Parser(std::vector<Token> tokens) : tokens_(std::move(tokens)) {}

const Token& Parser::peek() const {
    return tokens_[pos_];
}

const Token& Parser::advance() {
    const Token& current = tokens_[pos_];
    if (pos_ + 1 < tokens_.size()) {
        pos_++;
    }
    return current;
}

bool Parser::check(TokenType type) const {
    return peek().type == type;
}

Token Parser::expect(TokenType type, const std::string& message) {
    if (!check(type)) {
        throw std::runtime_error(message + " (got " + token_type_name(peek().type) + ")");
    }
    return advance();
}

std::unique_ptr<Expression> Parser::parse() {
    std::unique_ptr<Expression> result = parse_expression();
    expect(TokenType::End, "expected end of input");
    return result;
}

std::unique_ptr<Expression> Parser::parse_expression() {
    std::unique_ptr<Expression> left = parse_term();

    while (check(TokenType::Plus) || check(TokenType::Minus)) {
        TokenType op = advance().type;
        std::unique_ptr<Expression> right = parse_term();
        left = std::make_unique<BinaryExpression>(op, std::move(left), std::move(right));
    }

    return left;
}

std::unique_ptr<Expression> Parser::parse_term() {
    std::unique_ptr<Expression> left = parse_factor();

    while (check(TokenType::Star) || check(TokenType::Slash)) {
        TokenType op = advance().type;
        std::unique_ptr<Expression> right = parse_factor();
        left = std::make_unique<BinaryExpression>(op, std::move(left), std::move(right));
    }

    return left;
}

std::unique_ptr<Expression> Parser::parse_factor() {
    if (check(TokenType::Number)) {
        Token number = advance();
        return std::make_unique<NumberExpression>(std::stod(number.text));
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

### Mechanical walkthrough

- `Parser(std::vector<Token> tokens) : tokens_(std::move(tokens))` — **(b) reappearing
  pattern.** Same take-by-value-then-move idiom as `BinaryExpression`'s constructor —
  ownership of the token vector passes cleanly into the parser.
- `const Token& peek() const` returning `tokens_[pos_]` — **(b) reappearing concept.** Same
  role as `Lexer::peek()` in Lesson 2 — look at the current position without consuming it —
  now over a vector of tokens instead of a string of characters.
- `advance()` guarding `if (pos_ + 1 < tokens_.size())` before incrementing — **(a) first
  appearance of this specific safety.** Unlike the lexer's `advance()`, this one refuses to
  move past the last token — since the vector always ends with an `End` token (Lesson 2),
  staying "stuck" on `End` once reached means `peek()` never reads past the end of the
  vector, no matter how many more times `advance()` is accidentally called.
- **Three mutually recursive methods** — `parse_expression`, `parse_term`, `parse_factor` —
  **(a) first appearance of the overall pattern**, directly implementing this lesson's
  grammar:
  ```
  expression := term (('+' | '-') term)*
  term       := factor (('*' | '/') factor)*
  factor     := NUMBER | '(' expression ')'
  ```
  `parse_expression` only ever combines `term`s with `+`/`-`; `parse_term` only ever combines
  `factor`s with `*`/`/`. This layering — not a single flat loop checking all four operators
  at once — is *precisely* what makes `2 + 3 * 4` come out as `2 + (3*4) = 14` rather than
  `(2+3)*4 = 20`: `parse_expression` calls `parse_term` first for its left-hand side, and
  `parse_term` greedily consumes the entire `3 * 4` before ever returning control back up to
  `parse_expression`'s `+`-handling loop. Precedence isn't a rule checked anywhere
  explicitly — it falls directly out of which method calls which.
- `while (check(TokenType::Plus) || check(TokenType::Minus))` building up `left` — **(a)
  first appearance of this loop shape.** Rather than recursing for repeated `+`/`-` at the
  *same* precedence level (`1 + 2 + 3`), this loops, re-wrapping `left` in a new
  `BinaryExpression` each time — recursion here would work too, but would build the tree
  leaning the wrong way for left-to-right evaluation without extra care; the loop naturally
  produces `((1 + 2) + 3)`, evaluated left to right, matching ordinary arithmetic.
- The `LParen` branch in `parse_factor`, calling `parse_expression()` again from inside
  `parse_factor` — **(a) first appearance of the recursive descent "closing the loop."**
  This is the exact self-reference Concept Unit 1 introduced in miniature: parsing a
  parenthesized group means recursively parsing a *whole new expression*, which could itself
  contain more parentheses, arbitrarily deep — the grammar's recursion and the code's
  recursion are the same recursion.

### Execution trace

Tracing `parse()` over Lesson 2's tokens for `"2*(3+4)"` —
`NUMBER(2) STAR LPAREN NUMBER(3) PLUS NUMBER(4) RPAREN END` — a control-flow trace, since the
interesting part is *which method calls which*, not a changing value:

1. `parse()` calls `parse_expression()`.
2. `parse_expression()` calls `parse_term()` for its left-hand side, before it has even
   looked at `+`/`-` — this is what guarantees no `+`/`-` is grabbed prematurely.
3. `parse_term()` calls `parse_factor()`. `peek()` is `NUMBER(2)` → matches, consumed,
   returns `NumberExpression(2)`.
4. Back in `parse_term()`: `peek()` is now `STAR` → the `while` loop's condition is true.
   `advance()` consumes `STAR`; `parse_factor()` is called again for the right-hand side.
5. `parse_factor()` now sees `LParen` → consumes it, calls `parse_expression()` recursively
   — this is Concept Unit 4's recursion, happening for real.
6. That inner `parse_expression()` call runs steps 2–4 again, independently, on the
   remaining tokens: `parse_term()` → `parse_factor()` reads `NUMBER(3)` → back in
   `parse_term()`, `peek()` is `PLUS`, not `*`/`/`, so its `while` loop doesn't fire, and it
   returns just `NumberExpression(3)` up to the inner `parse_expression()`.
7. The inner `parse_expression()` sees `PLUS` → its own `while` loop fires: consumes `PLUS`,
   calls `parse_term()` again, which reads `NUMBER(4)` the same way step 3 did, returns
   `NumberExpression(4)`.
8. The inner `parse_expression()` combines them: `BinaryExpression(Plus, 3, 4)`, returns it.
9. Back in step 5's `parse_factor()`: `expect(RParen, ...)` consumes the `)`, and returns
   that same `BinaryExpression(Plus, 3, 4)` as the value of the parenthesized group.
10. Back in step 4's `parse_term()`: it now has `left = NumberExpression(2)` and
    `right = BinaryExpression(Plus, 3, 4)` — combines them into
    `BinaryExpression(Star, 2, BinaryExpression(Plus, 3, 4))`. `peek()` is now `END`, so its
    `while` loop stops; returns this tree up to the outer `parse_expression()`.
11. The outer `parse_expression()`'s own `while` loop checks `peek()` — `END`, not
    `+`/`-` — doesn't fire. Returns the same tree unchanged.
12. `parse()` calls `expect(TokenType::End, ...)` — matches, consumes it. Returns the final
    tree: `*` at the root, `2` on the left, `(3 + 4)` as a whole subtree on the right.

`evaluate()` on that tree then runs the post-order traversal from Concept Unit 4:
`3 + 4 = 7`, then `2 * 7 = 14`.

### CS lens

This is a **recursive descent parser** — one function per grammar rule, calling each other
in exactly the shape the grammar itself is written in. The layering of
`parse_expression`/`parse_term`/`parse_factor`, each level handling one precedence tier, is
called **precedence climbing**. Also recognized in: how a `.tar.gz` path or a CSS selector's
combinators are parsed by layered rules; how JSON's own grammar (`value := object | array |
string | number | ...`, `object := { members }`) is almost always parsed by a matching
family of mutually recursive functions, same shape as this one.

### SE lens

`expect()` throwing with the actual offending token's name baked into the message (`"got
LPAREN"`, `"got END"`) rather than a generic `"parse error"` is a small, deliberate choice
that pays for itself every time this project is debugged from now on. The tradeoff: it costs
a little more code at each call site (a message string, not just a bare check) — worth it
here because every future lesson's parser code inherits this same habit or fights it.

---

## Concept Unit 6: Wiring the parser into the server

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `server.cpp`.
- **Change type:** add `#include "parser.h"`; replace the token-printing loop from Lesson 2
  with a real parse-and-evaluate call.
- **Location:** the `#include` block; the `try` block inside the `while (true)` loop.
- **Dependencies:** `ast.h`/`ast.cpp`, `parser.h`/`parser.cpp` from this lesson.

### The New Code — type it yourself

```cpp
        std::string response_body;
        try {
            Lexer lexer(body);
            Parser parser(lexer.tokenize());
            std::unique_ptr<Expression> ast = parser.parse();
            response_body = std::to_string(ast->evaluate());
        } catch (const std::exception& e) {
            response_body = std::string("error: ") + e.what();
        }
```

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
#include "parser.h"                                                      // ← new

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

    while (true) {
        int client_fd = accept(server_fd, nullptr, nullptr);

        char buffer[4096] = {0};
        read(client_fd, buffer, sizeof(buffer) - 1);
        std::string request(buffer);

        std::string body = extract_body(request);
        log_request(body);

        std::string response_body;
        try {                                                            // (unchanged shape)
            Lexer lexer(body);
            Parser parser(lexer.tokenize());                             // ← new
            std::unique_ptr<Expression> ast = parser.parse();            // ← new
            response_body = std::to_string(ast->evaluate());             // ← changed
        } catch (const std::exception& e) {
            response_body = std::string("error: ") + e.what();           // ← changed
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

The rest of the loop — accept, read, extract, log, respond, close — is Lesson 1's, exactly.
The `catch` block now handles *both* lexer errors (Lesson 2's `unexpected character`) and
parser errors (this lesson's `expected closing parenthesis`, etc.) with the same one line,
because both are `std::runtime_error`, and both derive from `std::exception`.

### Mechanical walkthrough (new items only)

- `std::to_string(ast->evaluate())` on a `double` — **(b) reappearing function, new
  argument type.** Same `std::to_string` used for `Content-Length` in Lesson 1, now applied
  to a `double` instead of a `size_t` — worth flagging honestly rather than glossing over:
  `std::to_string` on a `double` always prints six digits after the decimal point, which is
  why the real output below shows `14.000000`, not `14`. That's a real, currently-unfixed
  rough edge — cleaning up numeric formatting belongs to a later "Result Formatter" pass
  (per the original project architecture), not this lesson, which is about correctness of
  the computed value, not its presentation.

### Commands

```
g++ -std=c++17 -Wall -c ast.cpp -o ast.o
g++ -std=c++17 -Wall -c parser.cpp -o parser.o
g++ -std=c++17 -Wall -c lexer.cpp -o lexer.o
g++ -std=c++17 -Wall -c server.cpp -o server.o
g++ server.o lexer.o ast.o parser.o -o server
./server
```

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "2*(3+4)"
14.000000

$ curl -X POST http://localhost:8080/evaluate -d "10 + 25 * 3"
85.000000

$ curl -X POST http://localhost:8080/evaluate -d "10 / 4"
2.500000

$ curl -X POST http://localhost:8080/evaluate -d "2*(3+4"
error: expected closing parenthesis (got END)

$ curl -X POST http://localhost:8080/evaluate -d "2 $ 3"
error: unexpected character: $
```

Server's own log, real output, all five requests:

```
math engine listening on port 8080
[09:02:33] POST /evaluate body="2*(3+4)"
[09:02:33] POST /evaluate body="10 + 25 * 3"
[09:02:33] POST /evaluate body="10 / 4"
[09:02:33] POST /evaluate body="2*(3+4"
[09:02:33] POST /evaluate body="2 $ 3"
```

`2*(3+4)` correctly evaluates to `14`, respecting precedence, exactly as promised at the top
of this lesson's pipeline diagram. The unbalanced-parens request proves the parser's own
error path (as opposed to Lesson 2's lexer error path) reaches the client correctly, and the
server survives both bad requests and keeps answering — the log shows all five, in order.

### Connect

The value coming back is now a real, correctly computed answer — the interpreter finally
does what the project's name promises. What's still missing: everything is a one-shot
calculation with no memory between requests — `x = 5` on one request and `x + 1` on the next
would currently just fail to parse (`x` isn't a token type the lexer even recognizes yet).
That's Lesson 4's problem: variables, and an `Environment` that persists state across
requests.

---

## Closing

### Connect the pieces

Trace `"2*(3+4)"` through every unit built this lesson: the token vector from Lesson 2
arrives at `Parser parser(lexer.tokenize())` → `parser.parse()` runs the full
`parse_expression`/`parse_term`/`parse_factor` trace from Concept Unit 5, consuming every
token and building the tree `BinaryExpression(*, NumberExpression(2),
BinaryExpression(+, NumberExpression(3), NumberExpression(4)))` → `ast->evaluate()` runs the
post-order traversal from Concept Unit 4 (`3+4=7`, then `2*7=14`) → `std::to_string(14.0)`
turns it into `"14.000000"` → the same HTTP response-writing code from Lesson 1, completely
untouched, sends it back → `curl` prints `14.000000`.

### What breaks without this

In `parse_factor()`, comment out the `LParen` branch entirely:

```cpp
std::unique_ptr<Expression> Parser::parse_factor() {
    if (check(TokenType::Number)) {
        Token number = advance();
        return std::make_unique<NumberExpression>(std::stod(number.text));
    }

    // if (check(TokenType::LParen)) {
    //     advance();
    //     std::unique_ptr<Expression> inner = parse_expression();
    //     expect(TokenType::RParen, "expected closing parenthesis");
    //     return inner;
    // }

    throw std::runtime_error("expected a number or '(' (got " + token_type_name(peek().type) + ")");
}
```

Rebuild and send `"2*(3+4)"` again. Real result: `error: expected a number or '(' (got
LPAREN)` — the parser now has no idea what to do the moment it sees an opening parenthesis,
because the one branch that recursed back into `parse_expression()` no longer exists. This
is the clearest possible proof that parentheses "work" *only* because of that recursive
call — nothing else in the grammar handles them. Restore the branch before moving on.

### Exercises

- Trace `"10 - 4 - 3"` by hand through `parse_expression`'s `while` loop (not `parse_term` —
  no `*`/`/` involved) and confirm it produces `((10 - 4) - 3) = 3`, not `10 - (4 - 3) = 9`.
  This is exactly why the loop rebuilds `left` on every iteration instead of recursing on
  the right-hand side.
- Send `"()"` — recall from Lesson 2 that the lexer happily tokenizes it. Predict what error
  the *parser* now produces, then verify it with `curl`.
- Add unary minus support (`"-5"` as a single factor, distinct from `10 - 4`) as a new
  branch at the top of `parse_factor()` — this is deliberately left undone by this lesson;
  Lesson 2's lexer already emits a `Minus` token that `parse_factor()` currently has no
  branch for at all.

### Definition of done

- [ ] `ast.h`/`ast.cpp` and `parser.h`/`parser.cpp` each compile cleanly on their own.
- [ ] `server.cpp` links against all four new/updated object files and starts without error.
- [ ] `2*(3+4)`, `10 + 25 * 3`, and `10 / 4` all evaluate to the correct results shown above.
- [ ] Both error cases (`2*(3+4`, `2 $ 3`) return a readable `error: ...` message and the
      server keeps running and logging afterward.
- [ ] The "what breaks without this" exercise (disabling the `LParen` branch) was actually
      run and reverted.
- [ ] Commit:

```
git add ast.h ast.cpp parser.h parser.cpp server.cpp
git commit -m "Add AST and recursive-descent parser; evaluate real expressions

Expression is an abstract base (NumberExpression, BinaryExpression)
evaluated via post-order traversal. Parser implements precedence
climbing: parse_expression -> parse_term -> parse_factor, one
method per grammar rule, matching operator precedence directly to
call structure rather than an explicit precedence table. Numeric
result formatting (std::to_string on a double prints six decimal
places) is a known rough edge, deferred to a later Result Formatter
pass. Unary minus is not yet supported."
```

Next lesson: `x = 5` — an `Environment` that maps names to values and survives across
requests, so the server finally has state.
