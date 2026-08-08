# Lesson 12: if — The First Branch

**What you will build:** comparison operators (`<`, `>`, `<=`, `>=`, `==`, `!=`), keyword
recognition in the lexer (`if`/`else`, as opposed to ordinary identifiers), a new
`parse_comparison` grammar layer sitting between assignment and arithmetic, and an
`IfExpression` AST node — the project's first construct whose evaluation genuinely branches,
computing only one of two possible children instead of always computing everything it's
handed. Along the way, this lesson finally closes a gap flagged as an open exercise all the
way back in Lesson 3: general unary minus (`-5`, `-x`), which this lesson's own testing hit
as a real, blocking bug the moment `if (5 > 3) 1 else -1` was tried for the first time.

**A scoping decision, stated up front:** doc1's own project list groups `for`, `while`, and
`if` into one lesson. Splitting them, the way this curriculum has already split matrix
literals from matrix arithmetic (Lessons 6–10) and `det` from `inverse` (Lessons 9–10), is
the right call here too — `if` alone touches the lexer, a new grammar layer, a new AST node,
*and* surfaces a real pre-existing bug. `while` (Lesson 13) reuses nearly everything built
here; cramming both into one lesson would either rush this one or bury `while`'s own genuinely
new idea (a loop that runs zero or more times) under material that's actually about branching,
not repetition.

**What you need to know first:** Lesson 4's `parse_statement`/`check_next` lookahead pattern
(reused again here), and Lesson 3's `BinaryExpression`, whose existing number-vs-number
`switch` this lesson extends rather than replaces.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
```

No changes to Built-in Functions, Matrix Library, or Result Formatter this lesson — this
lesson's work is entirely in the Lexer, Parser, and AST/Interpreter stages. Carrying
`"if (x > 5) x * 2 else x / 2"` through, with `x = 10` already stored: the lexer now
recognizes `if` as a keyword rather than a plain identifier; the parser builds an
`IfExpression` whose condition is `BinaryExpression(Greater, VariableExpression(x),
NumberExpression(5))`; `evaluate()` computes the condition once, and — this is the new
behavior — evaluates *only* the `then` branch (`x * 2 = 20`), never touching the `else`
branch's `x / 2` at all.

---

## Concept Unit 1: A word that isn't a name

### The Problem

Every identifier this lexer has ever produced — `x`, `sqrt`, `det` — has been a variable or
function name, decided entirely by the caller. `if` and `else` need to be different: `if (x)
1 else 2` must never be confused with calling a function named `if`, or reading a variable
named `if`. Something has to distinguish a **reserved word** from an ordinary name, using
nothing more than the characters already scanned.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <string>

int main() {
    for (const std::string text : {"if", "else", "sqrt", "x"}) {
        std::string kind;
        if (text == "if") {
            kind = "IF keyword";
        } else if (text == "else") {
            kind = "ELSE keyword";
        } else {
            kind = "IDENTIFIER";
        }
        std::cout << text << " -> " << kind << "\n";
    }
    return 0;
}
```

Real output:

```
if -> IF keyword
else -> ELSE keyword
sqrt -> IDENTIFIER
x -> IDENTIFIER
```

`sqrt` — already a meaningful name in this project since Lesson 5 — is correctly still an
ordinary `IDENTIFIER` here: it's meaningful to the *interpreter* (as a registered built-in
function), but nothing about the *lexer* or *grammar* treats it specially the way `if` is
about to be. That distinction — "special to the language's grammar" vs. "special to what the
interpreter happens to know about" — is exactly what a keyword is.

### Discard

This standalone lookup is deleted. `Lexer::read_identifier()` (Concept Unit 2) performs the
identical check as the very last step of scanning an identifier, on the real scanned text.

### Mechanical walkthrough

Nothing here is new syntax — `if`/`else if`/`else` and string comparison are all things this
project has used since Lesson 2. What's new is the *idea*: text that looks exactly like an
identifier, scanned by exactly the same code, gets reclassified after the fact by checking it
against a fixed, small list of reserved spellings.

### CS lens

This is the standard technique every real lexer uses for keywords — **scan generically, then
look up** — rather than trying to special-case `"if"` and `"else"` character-by-character
during scanning itself (which would require a lexer with special cases for `'i'` and `'e'`
specifically, an unmaintainable approach as keyword lists grow). Also recognized in: literally
every mainstream language's lexer, and in this project's own precedent — `TokenType`'s design
already separates "what shape of text is this" from "what does it mean," and keyword lookup
is just one more application of that same separation.

---

## Concept Unit 2: Wiring keyword recognition into the real lexer

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `lexer.h`, `lexer.cpp` — both existing since Lesson 2.
- **Change type:** add two `TokenType` values; add a check at the end of `read_identifier`.
- **Location:** `lexer.h`'s enum; `lexer.cpp`'s `read_identifier`.
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
    if (text == "if") {
        return Token{TokenType::If, text};
    }
    if (text == "else") {
        return Token{TokenType::Else, text};
    }
    return Token{TokenType::Identifier, text};
```

### The Updated Project

`lexer.h`'s enum, with the new values marked:

```cpp
enum class TokenType { Number, Identifier, Equals, Plus, Minus, Star, Slash, LParen, RParen,
                        LBracket, RBracket, Semicolon, Less, Greater, LessEqual, GreaterEqual,
                        EqualEqual, NotEqual, If, Else, End };                       // ← changed
```

`Lexer::read_identifier`, in full (the scanning loop above the new check is unchanged from
Lesson 4):

```cpp
Token Lexer::read_identifier() {
    std::string text;
    while (std::isalpha(static_cast<unsigned char>(peek()))) {
        text += peek();
        advance();
    }
    if (text == "if") {                                                  // ← new
        return Token{TokenType::If, text};                               // ← new
    }                                                                    // ← new
    if (text == "else") {                                                // ← new
        return Token{TokenType::Else, text};                             // ← new
    }                                                                    // ← new
    return Token{TokenType::Identifier, text};
}
```

### Mechanical walkthrough

`text == "if"` and `text == "else"` — **(b) reappearing pattern.** Ordinary `std::string`
comparison, no different from any other string equality check already used throughout this
project's error messages. The only thing worth pausing on: this check runs *after* the
scanning loop has already consumed every letter — a hypothetical variable named `iffy` scans
completely first (`i`, `f`, `f`, `y`), and only the *finished* text `"iffy"` is compared
against `"if"`, which correctly fails to match. A keyword check based on the first character
alone, instead of the whole scanned word, would have wrongly flagged `iffy` as starting with
`if` — worth noticing that "scan first, then look up the *complete* word" is what makes this
safe.

---

## Concept Unit 3: Six new two-character operators

### The Problem

`<`, `>`, and `=` (already a token, for assignment) each need a sibling that means something
different depending on whether a `=` immediately follows: `<` vs. `<=`, `>` vs. `>=`, `=` vs.
`==`. And `!` is an entirely new character, meaningful only as the first half of `!=`. Each
of these needs the lexer to look one character *past* the one it's currently deciding about,
before committing to which token to emit.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <string>

int main() {
    std::string source = "<= < ==";
    std::size_t pos = 0;

    auto peek = [&]() -> char {
        return pos < source.size() ? source[pos] : '\0';
    };

    while (pos < source.size()) {
        char c = peek();
        if (c == ' ') { pos++; continue; }
        if (c == '<') {
            pos++;
            if (peek() == '=') {
                pos++;
                std::cout << "LESS_EQUAL\n";
            } else {
                std::cout << "LESS\n";
            }
            continue;
        }
        if (c == '=') {
            pos++;
            if (peek() == '=') {
                pos++;
                std::cout << "EQUAL_EQUAL\n";
            } else {
                std::cout << "EQUALS\n";
            }
            continue;
        }
        pos++;
    }
    return 0;
}
```

Real output:

```
LESS_EQUAL
LESS
EQUAL_EQUAL
```

### Discard

This standalone character-scanner is deleted. The real lexer performs the identical
consume-then-peek-ahead check, for four characters (`<`, `>`, `=`, `!`) instead of two, using
the project's own `peek()`/`advance()` methods (Lesson 1) instead of a local lambda.

### Mechanical walkthrough

- `auto peek = [&]() -> char { ... };` — **(b) reappearing concept, new syntax context.** A
  lambda (Lesson 5) capturing its enclosing variables by reference (`[&]`) — used here purely
  to keep this throwaway example self-contained in one function, mirroring the real
  `Lexer::peek()` member function's exact behavior without needing a whole class for a
  five-line lab.
- `pos++;` immediately after checking `c == '<'`, **before** deciding between `LESS_EQUAL` and
  `LESS` — **(a) first appearance of this specific ordering, worth naming.** The first
  character is consumed unconditionally the moment it's recognized as the *start* of a
  possible two-character operator; only *then* does a second `peek()` decide whether a second
  character (`=`) should also be consumed. Getting this ordering backwards — checking the
  second character before consuming the first — would leave the position pointing at the
  wrong place for whichever branch runs next.

### CS lens

This is **lookahead** at the character level — deciding what a token means based on more than
just the current character — the exact same idea Lesson 2's lexer already needed for numbers
(`isdigit` repeated until it stops matching) but applied here to a fixed, small, known amount
of lookahead (exactly one extra character) rather than an open-ended run. Also recognized in:
this project's own `Parser::check_next` (Lesson 4), doing the identical "look one further
ahead before committing" idea, one level up, over tokens instead of characters.

---

## Concept Unit 4: The real multi-character lexer cases

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `lexer.h`, `lexer.cpp`.
- **Change type:** rewrite the existing `'='` case into a lookahead form; add `'<'`, `'>'`,
  `'!'` cases in the same shape.
- **Location:** `tokenize()`'s `switch`.
- **Dependencies:** the two-character technique from Concept Unit 3.

### The New Code — type it yourself

```cpp
            case '<':
                advance();
                if (peek() == '=') {
                    advance();
                    tokens.push_back(Token{TokenType::LessEqual, "<="});
                } else {
                    tokens.push_back(Token{TokenType::Less, "<"});
                }
                break;
```

### The Updated Project

`tokenize()`'s `switch`, in full — the single-character cases (`+`, `-`, `*`, `/`, `(`, `)`,
`[`, `]`, `;`) below are unchanged from Lesson 6:

```cpp
        switch (c) {
            case '=':                                                    // ← changed shape
                advance();                                               // ← changed shape
                if (peek() == '=') {                                     // ← new
                    advance();                                          // ← new
                    tokens.push_back(Token{TokenType::EqualEqual, "=="}); // ← new
                } else {                                                 // ← new
                    tokens.push_back(Token{TokenType::Equals, "="});      // ← changed shape
                }                                                        // ← new
                break;
            case '<':                                                    // ← new
                advance();                                               // ← new
                if (peek() == '=') {                                     // ← new
                    advance();                                          // ← new
                    tokens.push_back(Token{TokenType::LessEqual, "<="});  // ← new
                } else {                                                 // ← new
                    tokens.push_back(Token{TokenType::Less, "<"});        // ← new
                }                                                        // ← new
                break;                                                   // ← new
            case '>':                                                    // ← new
                advance();                                               // ← new
                if (peek() == '=') {                                     // ← new
                    advance();                                          // ← new
                    tokens.push_back(Token{TokenType::GreaterEqual, ">="});  // ← new
                } else {                                                 // ← new
                    tokens.push_back(Token{TokenType::Greater, ">"});     // ← new
                }                                                        // ← new
                break;                                                   // ← new
            case '!':                                                    // ← new
                advance();                                               // ← new
                if (peek() == '=') {                                     // ← new
                    advance();                                          // ← new
                    tokens.push_back(Token{TokenType::NotEqual, "!="});   // ← new
                } else {                                                 // ← new
                    throw std::runtime_error("unexpected character: !");  // ← new
                }                                                        // ← new
                break;                                                   // ← new
            case '+': tokens.push_back(Token{TokenType::Plus, "+"}); advance(); break;
            case '-': tokens.push_back(Token{TokenType::Minus, "-"}); advance(); break;
            case '*': tokens.push_back(Token{TokenType::Star, "*"}); advance(); break;
            case '/': tokens.push_back(Token{TokenType::Slash, "/"}); advance(); break;
            case '(': tokens.push_back(Token{TokenType::LParen, "("}); advance(); break;
            case ')': tokens.push_back(Token{TokenType::RParen, ")"}); advance(); break;
            case '[': tokens.push_back(Token{TokenType::LBracket, "["}); advance(); break;
            case ']': tokens.push_back(Token{TokenType::RBracket, "]"}); advance(); break;
            case ';': tokens.push_back(Token{TokenType::Semicolon, ";"}); advance(); break;
            default:
                throw std::runtime_error(std::string("unexpected character: ") + c);
        }
```

### Mechanical walkthrough (new items only)

- The `'='` case's changed shape — **(a) first appearance of retrofitting an existing single-
  character case into a lookahead one.** Every case since Lesson 2 has followed the shape
  "push a token, then advance" — one action, one step. `'='` (and the three new cases) invert
  that: `advance()` runs *first*, immediately, then a conditional decides which token to push
  based on what's now current. This is a real, structural difference from every simpler case
  still sitting right below it in the same `switch` — worth noticing that not every case in
  one `switch` has to follow the same shape, as long as each is internally consistent.
- `case '!': ... else { throw std::runtime_error("unexpected character: !"); }` — **(a) first
  appearance of a character that's only ever valid as half of something else.** Unlike every
  other character this lexer recognizes, a bare `!` with nothing following it has no meaning
  in this language at all — there's no standalone "not" operator built (or planned) here, only
  `!=`. The error message reuses this project's standing "unexpected character" phrasing
  (Lesson 2) even though, technically, `!` alone *was* recognized — it's just recognized as
  meaningless without a following `=`, which this message doesn't over-explain, matching how
  concisely every other lexer error in this project has always been phrased.

### Run it. Real output.

A quick standalone check, tokenizing `"if (x >= 5) x <= 10 else x != 0"`:

```
IF(if) LPAREN(() IDENTIFIER(x) GREATER_EQUAL(>=) NUMBER(5) RPAREN()) IDENTIFIER(x) LESS_EQUAL(<=) NUMBER(10) ELSE(else) IDENTIFIER(x) NOT_EQUAL(!=) NUMBER(0) END
```

Every two-character operator resolved correctly, and `if`/`else` came through as their own
token types, not `IDENTIFIER`.

---

## Concept Unit 5: A new grammar layer for comparisons

### The Problem

`5 > 3` needs to parse as a comparison, distinct from ordinary `+`/`-`/`*`/`/` arithmetic —
and it needs to sit at a specific place in the precedence chain: below assignment (`x = a >
b` should assign the *result* of the comparison, not try to compare `x` against something),
but above plain arithmetic (`a + 1 > b` should compare `a + 1` against `b`, not try to add `1`
to `a > b`).

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.h`, `parser.cpp`.
- **Change type:** add a new grammar-layer method; change `parse_statement` to call it
  instead of `parse_expression` directly.
- **Location:** `parser.h`'s private method list; `parser.cpp`'s `parse_statement` and a new
  `parse_comparison` method.
- **Dependencies:** the six new token types from Concept Unit 4.

### The New Code — type it yourself

```cpp
std::unique_ptr<Expression> Parser::parse_comparison() {
    if (check(TokenType::If)) {
        return parse_if();
    }

    std::unique_ptr<Expression> left = parse_expression();

    if (check(TokenType::Less) || check(TokenType::Greater) || check(TokenType::LessEqual) ||
        check(TokenType::GreaterEqual) || check(TokenType::EqualEqual) || check(TokenType::NotEqual)) {
        TokenType op = advance().type;
        std::unique_ptr<Expression> right = parse_expression();
        return std::make_unique<BinaryExpression>(op, std::move(left), std::move(right));
    }

    return left;
}
```

### The Updated Project

`parser.h`'s private method list, with the new declarations marked:

```cpp
    std::unique_ptr<Expression> parse_statement();
    std::unique_ptr<Expression> parse_comparison();                      // ← new
    std::unique_ptr<Expression> parse_if();                              // ← new (Concept Unit 6)
    std::unique_ptr<Expression> parse_expression();
    std::unique_ptr<Expression> parse_term();
    std::unique_ptr<Expression> parse_factor();
    std::unique_ptr<Expression> parse_matrix();
```

`parse_statement`, with its two calls to `parse_expression` changed to `parse_comparison`:

```cpp
std::unique_ptr<Expression> Parser::parse_statement() {
    if (check(TokenType::Identifier) && check_next(TokenType::Equals)) {
        Token name = advance();
        advance();
        std::unique_ptr<Expression> value = parse_comparison();          // ← changed
        return std::make_unique<AssignmentExpression>(name.text, std::move(value));
    }

    return parse_comparison();                                          // ← changed
}
```

### Mechanical walkthrough (new items only)

- `if (check(TokenType::If)) { return parse_if(); }` as `parse_comparison`'s very first line
  — **(a) first appearance of this dispatch point.** Before attempting to parse an ordinary
  comparison at all, this checks whether the statement is actually an `if`-expression — a
  deliberate design decision, not an incidental placement: it means `if` can appear *only*
  wherever a full comparison is expected (the right-hand side of an assignment, a statement's
  top level, inside parentheses, as a function argument — everywhere `parse_comparison` is
  called from), but never buried arbitrarily deep inside ordinary arithmetic like `1 +
  if (...) ...`. That's a real, honest scope boundary, not an oversight — it keeps the
  grammar's shape simple at the cost of disallowing `if` in a position most languages
  wouldn't put it either.
- The `if (check(Less) || check(Greater) || ...)` chain, checked **once**, not in a `while`
  loop — **(a) first appearance of single (non-repeating) operator consumption at this
  level.** Every earlier precedence layer (`parse_expression`'s `+`/`-`, `parse_term`'s
  `*`/`/`) uses a `while` loop specifically to support chaining (`1 + 2 + 3`). Comparisons
  deliberately do **not** chain here — `a < b < c` is not given any special meaning by this
  grammar; parsing stops after at most one comparison operator. This sidesteps a real,
  well-known ambiguity (does `a < b < c` mean "is `b` between `a` and `c`," the way some
  languages special-case it, or does it mean "compare `a` and `b`, then compare *that
  boolean* against `c`," which is what naively chaining would produce and is rarely what
  anyone means) by simply not supporting it — an honest, deliberate limitation, not a
  forgotten feature.

### CS lens

Placing comparisons in their own layer, between assignment and additive arithmetic, is
**operator precedence made structural** — the same technique Lesson 3 used to separate
`parse_expression` (`+`/`-`) from `parse_term` (`*`/`/`), extended one level higher. The
*order* these layers call each other in — `parse_statement` → `parse_comparison` →
`parse_expression` → `parse_term` → `parse_factor` — directly encodes, in code structure
alone, that `=` binds loosest, comparisons bind next, then `+`/`-`, then `*`/`/`, then
individual values — with no explicit "precedence table" data structure needed anywhere; the
grammar's own call graph *is* the precedence table.

---

## Concept Unit 6: `if` as its own grammar rule

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.cpp`.
- **Change type:** add.
- **Location:** immediately after `parse_comparison`.
- **Dependencies:** `TokenType::If`/`TokenType::Else` from Concept Unit 2, `IfExpression`
  from Concept Unit 7.

### The New Code — type it yourself

```cpp
std::unique_ptr<Expression> Parser::parse_if() {
    expect(TokenType::If, "expected 'if'");
    expect(TokenType::LParen, "expected '(' after 'if'");
    std::unique_ptr<Expression> condition = parse_comparison();
    expect(TokenType::RParen, "expected ')' after if condition");

    std::unique_ptr<Expression> then_branch = parse_comparison();
    expect(TokenType::Else, "if-expressions require an else branch");
    std::unique_ptr<Expression> else_branch = parse_comparison();

    return std::make_unique<IfExpression>(std::move(condition), std::move(then_branch), std::move(else_branch));
}
```

### Mechanical walkthrough

- `std::unique_ptr<Expression> condition = parse_comparison();` for the condition, not
  `parse_expression()` — **(a) first appearance of a condition that can itself be a full
  comparison.** This is what makes `if (x > 5)` parse at all: the parenthesized part between
  `if (` and `)` is a full `parse_comparison()` call, which itself could — though this
  project's tests don't exercise it — contain a *nested* `if`, since `parse_comparison`
  checks for `If` first before anything else.
- `std::unique_ptr<Expression> then_branch = parse_comparison();` with **no surrounding
  braces or block syntax** — **(a) first appearance of this specific, deliberate scope
  boundary.** The `then` and `else` branches are each exactly one `comparison`-level
  expression — not a sequence of statements, not a block. `if (x > 5) x * 2 else x / 2` works;
  something like `if (x > 5) { y = 1; z = 2; } else { y = 0; }` (multiple statements per
  branch) is simply not expressible with this grammar. Blocks — sequences of statements — are
  real, additional machinery this lesson doesn't build, deliberately: the current one-
  expression-per-request model (since Lesson 4) stays intact for one more lesson.
- `expect(TokenType::Else, "if-expressions require an else branch");` — **(a) first
  appearance of a mandatory `else`.** Unlike many languages, where `else` is optional and an
  `if` without one simply does nothing when its condition is false, this project's `if` is an
  *expression* — it must always produce a `Value`, on every path, since `evaluate()`'s return
  type is `Value`, never "nothing." An `if` with no `else` would have no value to return when
  its condition is false, so this grammar makes `else` syntactically required rather than
  silently defaulting to some placeholder value.
- Calling `parse_comparison()` recursively for `else_branch` — **(a) first appearance of this
  specific recursive consequence, worth spelling out.** Because `else_branch` is parsed by
  calling `parse_comparison()` again, and `parse_comparison()` itself checks for a leading
  `If` token first, writing `else if (...) ... else ...` produces a *nested* `IfExpression` as
  the outer one's `else_branch`, entirely for free — no special "else if" syntax was written
  anywhere in this grammar; chained conditionals are a direct, emergent consequence of `if`
  being an ordinary recursive grammar rule, not a hand-built feature.

### CS lens

An `if` that's mandatory-`else` and evaluates to a value on every path is precisely a
**conditional expression** (the same shape as C's `?:` ternary, or Python's
`a if condition else b`) — as opposed to a **conditional statement** (C's `if`/`else` with
optional `else`, which doesn't need to produce a value because a statement's job is to have
side effects, not compute a result). This project's grammar-level design decision — `if`
lives at the `comparison` level, always required to produce a `Value` — is what makes it an
expression form rather than a statement form, and is exactly why `else` can't be optional
here the way it is in most C-family languages' `if` *statements*.

---

## Concept Unit 7: `IfExpression` — and evaluating only one branch

### The Problem

`IfExpression` needs to do something no `Expression` subclass in this project has done
before: decide, at evaluation time, *which* of its children to evaluate — and, critically,
never touch the other one at all. Every previous node (`BinaryExpression`,
`AssignmentExpression`, `FunctionCallExpression`) always evaluates every child it holds,
unconditionally.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.h`, `ast.cpp`.
- **Change type:** add one new class; add six new `switch` cases to `BinaryExpression`.
- **Location:** `ast.h`, after `MatrixExpression`; `ast.cpp`, after `MatrixExpression`'s
  definitions, and inside `BinaryExpression::evaluate`'s existing number-vs-number `switch`.
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
Value IfExpression::evaluate(Environment& env) const {
    Value condition_value = condition_->evaluate(env);
    if (condition_value.as_number() != 0.0) {
        return then_branch_->evaluate(env);
    }
    return else_branch_->evaluate(env);
}
```

### The Updated Project

`ast.h`'s tail, with `IfExpression` appended after `MatrixExpression` (unchanged from Lesson
6):

```cpp
class IfExpression : public Expression {                                 // ← new
public:                                                                  // ← new
    IfExpression(std::unique_ptr<Expression> condition, std::unique_ptr<Expression> then_branch, std::unique_ptr<Expression> else_branch);  // ← new
    Value evaluate(Environment& env) const override;                     // ← new
                                                                           // ← new
private:                                                                  // ← new
    std::unique_ptr<Expression> condition_;                               // ← new
    std::unique_ptr<Expression> then_branch_;                             // ← new
    std::unique_ptr<Expression> else_branch_;                             // ← new
};                                                                        // ← new
```

`BinaryExpression::evaluate`'s number-vs-number `switch`, with the six new cases marked
(`Plus`/`Minus`/`Star`/`Slash` unchanged from Lesson 3):

```cpp
        switch (op_) {
            case TokenType::Plus:  return Value::number(l + r);
            case TokenType::Minus: return Value::number(l - r);
            case TokenType::Star:  return Value::number(l * r);
            case TokenType::Slash: return Value::number(l / r);
            case TokenType::Less:         return Value::number(l < r  ? 1.0 : 0.0);   // ← new
            case TokenType::Greater:      return Value::number(l > r  ? 1.0 : 0.0);   // ← new
            case TokenType::LessEqual:    return Value::number(l <= r ? 1.0 : 0.0);   // ← new
            case TokenType::GreaterEqual: return Value::number(l >= r ? 1.0 : 0.0);   // ← new
            case TokenType::EqualEqual:   return Value::number(l == r ? 1.0 : 0.0);   // ← new
            case TokenType::NotEqual:     return Value::number(l != r ? 1.0 : 0.0);   // ← new
            default:
                throw std::runtime_error("unsupported operator in BinaryExpression");
        }
```

`ast.cpp`'s tail, `IfExpression`'s constructor and `evaluate` appended after
`MatrixExpression`:

```cpp
IfExpression::IfExpression(std::unique_ptr<Expression> condition, std::unique_ptr<Expression> then_branch, std::unique_ptr<Expression> else_branch)  // ← new
    : condition_(std::move(condition)), then_branch_(std::move(then_branch)), else_branch_(std::move(else_branch)) {}  // ← new

Value IfExpression::evaluate(Environment& env) const {                   // ← new
    Value condition_value = condition_->evaluate(env);                   // ← new
    if (condition_value.as_number() != 0.0) {                            // ← new
        return then_branch_->evaluate(env);                              // ← new
    }                                                                    // ← new
    return else_branch_->evaluate(env);                                 // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- The six comparison cases, each computing `l < r`, `l > r`, etc. and converting the C++
  `bool` result into `1.0`/`0.0` via a ternary — **(a) first appearance of representing a
  boolean as a plain number, deliberately.** This project has no distinct boolean type — no
  fourth `Value` alternative for `true`/`false`. Comparisons are just another kind of
  `BinaryExpression`, reusing the *exact same* `Value::number` result type as `Plus`/`Minus`.
  This is a real, deliberate simplification (mirroring how early C treated booleans as
  integers before `bool` existed as its own type), not an oversight — adding a real boolean
  alternative to `Value` would be a legitimate future refactor, not required for `if` or
  comparisons to work correctly today.
- `condition_value.as_number() != 0.0` — **(b) reappearing method, new role.** `as_number()`
  (Lesson 6) does double duty here: it extracts the numeric value *and* — for free, since
  `as_number()` already throws a clear error on a non-number `Value` — rejects a matrix or SVG
  condition with an existing, well-tested error path, without `IfExpression` needing to write
  its own type check at all. This is exactly why `if (A > 1) 1 else 2` (with `A` a matrix)
  fails with `"cannot combine a number and a matrix"` — thrown by `BinaryExpression`
  evaluating the condition itself, before `IfExpression` even gets a chance to call
  `as_number()` on the result.
- `if (condition_value.as_number() != 0.0) { return then_branch_->evaluate(env); } return
  else_branch_->evaluate(env);` — **(a) first appearance of evaluating only one child, ever.**
  This is the entire point of the lesson, made concrete in three lines: whichever branch's
  `return` statement executes, the *other* branch's `->evaluate(env)` is never called at all —
  not "called and its result discarded," genuinely never invoked. If that unevaluated branch
  contained an assignment (`if (x > 5) y = 1 else y = 2`), only one of the two assignments
  would actually run — a real, meaningful difference from `BinaryExpression`, which always
  evaluates both `left_` and `right_` unconditionally, every time.

### CS lens

Evaluating only one of two possible children is called **short-circuit evaluation** — a
concept usually introduced via `&&`/`||` (which this project doesn't have yet), but `if`
itself is the more fundamental, original case: every earlier node in this project's AST has
been evaluated *eagerly* (every child, every time); `IfExpression` is the first **lazy**
evaluation this interpreter performs, and it matters for more than just efficiency — it's
what makes recursion through `if` possible at all in a language that eventually gains
functions (Lesson 13+ territory): a recursive function's base case *must not* trigger another
recursive call, and that only works if the branch containing the recursive call is genuinely
skipped, not merely computed-and-ignored.

---

## Concept Unit 8: A real bug this lesson's own testing found

### The Problem

The most natural first test of this feature — `if (5 > 3) 1 else -1` — failed to parse at
all: `error: expected a number or '(' (got MINUS)`. This is the exact unary-minus gap Lesson
3's exercises flagged and left open ("this project deliberately left this undone"), and
Lesson 9 narrowly worked around *inside matrix literals only* — but never fixed as a general
expression feature. `else -1` is an ordinary, bare negative number in expression position,
exactly the case that was never handled.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.cpp` only.
- **Change type:** add a new branch at the top of `parse_factor`.
- **Location:** `parse_factor`, before the existing `Number` check.
- **Dependencies:** none new — reuses `BinaryExpression` and `NumberExpression`, both
  existing since Lesson 3.

### The New Code — type it yourself

```cpp
    if (check(TokenType::Minus)) {
        advance();
        std::unique_ptr<Expression> operand = parse_factor();
        return std::make_unique<BinaryExpression>(TokenType::Minus, std::make_unique<NumberExpression>(0.0), std::move(operand));
    }
```

### The Updated Project

`parse_factor`'s opening, with the new branch marked (everything below is unchanged from
Lesson 6):

```cpp
std::unique_ptr<Expression> Parser::parse_factor() {
    if (check(TokenType::Minus)) {                                       // ← new
        advance();                                                      // ← new
        std::unique_ptr<Expression> operand = parse_factor();            // ← new
        return std::make_unique<BinaryExpression>(TokenType::Minus, std::make_unique<NumberExpression>(0.0), std::move(operand));  // ← new
    }                                                                    // ← new

    if (check(TokenType::Number)) {
        Token number = advance();
        return std::make_unique<NumberExpression>(std::stod(number.text));
    }

    // ... (Identifier, function-call, LParen, LBracket branches unchanged)
}
```

### Mechanical walkthrough (new items only)

- `std::make_unique<BinaryExpression>(TokenType::Minus, std::make_unique<NumberExpression>(0.0), std::move(operand))`
  — **(a) first appearance of implementing one feature entirely in terms of another,
  already-existing one.** Rather than building a genuinely new AST node (a `UnaryExpression`)
  and a new evaluation rule, `-x` is parsed as *exactly* the expression `0 - x` — reusing
  `BinaryExpression`'s existing, already-tested `Minus` case (Lesson 3) without adding a
  single line to `ast.cpp`. This is a real, deliberate tradeoff: it's simple and costs nothing
  new in the interpreter, at the price of `-A` (negating a matrix) producing the same
  `"cannot combine a number and a matrix"` error as any other mixed number/matrix operation —
  arguably a slightly confusing message for what's conceptually "negate this matrix," but an
  honestly-scoped one; real matrix negation isn't built by this project, at any layer, and
  this fix doesn't pretend otherwise.
- `parse_factor()` called **recursively**, for the operand, rather than
  `parse_expression()` or `parse_comparison()` — **(a) first appearance of unary minus binding
  tighter than every binary operator.** Calling `parse_factor()` (not a looser rule) means `-`
  only ever applies to the single factor immediately following it — `-x * 2` parses as
  `(-x) * 2`, not `-(x * 2)`, matching how unary minus behaves in essentially every language
  with C-like precedence.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "if (5 > 3) 1 else -1"
1

$ curl -X POST http://localhost:8080/evaluate -d "if (5 < 3) 1 else -1"
-1

$ curl -X POST http://localhost:8080/evaluate -d "-5"
-5

$ curl -X POST http://localhost:8080/evaluate -d "3 - -2"
5

$ curl -X POST http://localhost:8080/evaluate -d "x = 10"
10

$ curl -X POST http://localhost:8080/evaluate -d "-x"
-10

$ curl -X POST http://localhost:8080/evaluate -d "if (x > 100) 1 else if (x > 5) 2 else 3"
2

$ curl -X POST http://localhost:8080/evaluate -d "(5 > 3) + (2 > 10)"
1

$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "if (A > 1) 1 else 2"
error: cannot combine a number and a matrix

$ curl -X POST http://localhost:8080/evaluate -d "A < A"
error: this operator is not supported between two matrices yet

$ curl -X POST http://localhost:8080/evaluate -d "if (5 > 3) 1"
error: if-expressions require an else branch (got END)
```

Server's own log, real output, all twelve requests:

```
math engine listening on port 8080
[03:46:30] POST /evaluate body="if (5 > 3) 1 else -1"
[03:46:30] POST /evaluate body="if (5 < 3) 1 else -1"
[03:46:30] POST /evaluate body="-5"
[03:46:30] POST /evaluate body="3 - -2"
[03:46:30] POST /evaluate body="x = 10"
[03:46:30] POST /evaluate body="-x"
[03:46:30] POST /evaluate body="if (x > 100) 1 else if (x > 5) 2 else 3"
[03:46:30] POST /evaluate body="(5 > 3) + (2 > 10)"
[03:46:30] POST /evaluate body="A = [1 2; 3 4]"
[03:46:30] POST /evaluate body="if (A > 1) 1 else 2"
[03:46:30] POST /evaluate body="A < A"
[03:46:30] POST /evaluate body="if (5 > 3) 1"
```

`if (x > 100) 1 else if (x > 5) 2 else 3` returning `2` (with `x = 10`) is the else-if
chaining emergent behavior from Concept Unit 6, verified for real — no special "else if"
syntax exists anywhere in this grammar, yet it works correctly. `(5 > 3) + (2 > 10)`
returning `1` confirms comparisons and ordinary arithmetic compose cleanly through the
widened `LParen` branch. `if (A > 1) 1 else 2` and `A < A` prove the two different matrix-
related error paths — mixed number/matrix, and matrix/matrix with an unsupported operator —
both still fire correctly and distinctly, exactly as `BinaryExpression`'s existing dispatch
(Lesson 7) already guaranteed, with zero new code needed to make comparisons respect it.

### Connect

`if` now genuinely branches, and unary minus — a six-lesson-old flagged gap — is finally
closed as a real, general expression feature, not just a matrix-literal special case. What's
still entirely missing: repetition. Every feature built through this lesson computes once,
however conditionally, and stops. `while` — a condition checked, a body run, and the whole
thing repeated until the condition goes false — needs a genuinely new evaluation shape this
project has never had: a node whose `evaluate()` calls another node's `evaluate()` more than
once, in a loop, not just recursively once per level the way `BinaryExpression` or `if`'s own
nested chaining does.

---

## Closing

### Connect the pieces

Trace `"if (x > 100) 1 else if (x > 5) 2 else 3"` end to end, with `x = 10` already stored:
Lesson 1's socket/HTTP layer delivers the body unchanged → the lexer (Concept Units 2 and 4)
produces `IF LPAREN IDENTIFIER(x) GREATER NUMBER(100) RPAREN NUMBER(1) ELSE IF LPAREN
IDENTIFIER(x) GREATER NUMBER(5) RPAREN NUMBER(2) ELSE NUMBER(3) END` → `parse_statement`
calls `parse_comparison`, which sees `If` immediately and calls `parse_if` (Concept Unit 6):
condition `x > 100`, then-branch `1`, and — because the else-branch is parsed via another
`parse_comparison()` call, which *again* sees `If` first — the else-branch becomes a second,
nested `IfExpression` (condition `x > 5`, then-branch `2`, else-branch `3`) → at evaluation
time (Concept Unit 7), the outer `IfExpression` evaluates its condition
(`BinaryExpression(Greater, x, 100)` → `10 > 100` → `0.0`, false) → since the condition is
`0.0`, the outer `else_branch_` — the nested `IfExpression` — is evaluated: its own condition
(`10 > 5` → `1.0`, true) makes *it* evaluate `2` and return, without ever touching its own
`else_branch_` (`3`) → `2` propagates all the way back up, through Lesson 1's completely
untouched HTTP response code, to `curl`.

### What breaks without this

In `IfExpression::evaluate`, temporarily evaluate *both* branches regardless of the
condition, keeping only the correct one:

```cpp
Value IfExpression::evaluate(Environment& env) const {
    Value condition_value = condition_->evaluate(env);
    Value then_result = then_branch_->evaluate(env);
    Value else_result = else_branch_->evaluate(env);
    if (condition_value.as_number() != 0.0) {
        return then_result;
    }
    return else_result;
}
```

Rebuild, and send `"x = 10"` then `"if (x > 5) (y = 1) else (y = -1)"` — a condition that's
true, so `y = 1` is the branch that's *supposed* to run. Real result, worth running rather
than predicting: it still returns `1` (the correct-looking answer), because both assignments
now run unconditionally before the `if` check even happens — but `y` ends up holding `-1`,
not `1`, since the `else` branch's assignment runs *after* the `then` branch's and silently
overwrites it. Confirm with a follow-up request, `"y"`. This is a genuinely dangerous kind of
bug: the `if`-expression's own *return value* looks completely correct, while a *side effect*
happening elsewhere (the wrong branch's assignment winning) is silently wrong — exactly the
scenario Concept Unit 7's "only evaluate one branch, ever" design exists to prevent. Restore
the short-circuiting version before moving on.

### Exercises

- Trace `"5 == 5.0"` by hand — recall that this project's numbers are always `double`
  internally, never a separate integer type — and confirm `==` behaves the way you'd expect
  for two values that are mathematically equal even if they were typed differently.
- `if (5 > 3) 1 else -1` and `if (5 > 3) (1) else (-1)` should produce identical results —
  confirm with `curl`, and explain why the widened `LParen` branch (Concept Unit 5, reusing
  `parse_comparison`) makes the parenthesized version work.
- The unary-minus fix (Concept Unit 8) reuses `BinaryExpression`'s `Minus` case via `0 -
  operand`. Trace by hand what `"-A"` (negating matrix `A` from this lesson's own tests) now
  produces, and confirm which specific error message it triggers, and from which layer of the
  project (the parser, or `BinaryExpression::evaluate`'s dispatch).

### Definition of done

- [ ] `lexer.h`/`lexer.cpp` compile cleanly with keyword recognition and the four
      lookahead-based operator cases.
- [ ] `ast.h`/`ast.cpp` compile with `IfExpression` added and six new comparison cases in
      `BinaryExpression`.
- [ ] `parser.h`/`parser.cpp` compile with `parse_comparison`, `parse_if`, and the general
      unary-minus fix.
- [ ] `if (5 > 3) 1 else -1` and its false-condition counterpart both produce correct results.
- [ ] `else if` chaining works with no dedicated syntax for it, verified with a real
      multi-branch example.
- [ ] `-5`, `3 - -2`, and `-x` (after `x = 10`) all produce correct results.
- [ ] Both matrix-related error paths (`if (A > 1) ...` and `A < A`) still fire correctly and
      distinctly.
- [ ] An `if` with no `else` produces a specific syntax error rather than a crash or a
      confusing generic message.
- [ ] The "what breaks without this" exercise (evaluating both branches unconditionally) was
      actually run and reverted.
- [ ] Commit:

```
git add lexer.h lexer.cpp ast.h ast.cpp parser.h parser.cpp
git commit -m "Add comparisons and if/else as an expression

Six comparison operators reuse BinaryExpression's existing
number-vs-number switch, returning 1.0/0.0 rather than a real
boolean type - this project has no fourth Value alternative for
booleans, a deliberate simplification. if/else is a genuine
expression, not a statement: else is mandatory (evaluate() must
always return a Value on every path), and it lives at its own
grammar layer (parse_comparison, between assignment and arithmetic)
rather than nested inside parse_factor, so it can't appear
arbitrarily deep inside ordinary arithmetic expressions.
IfExpression evaluates exactly one of its two children, never
both - this project's first lazy/short-circuit evaluation, verified
by actually removing it and observing a real, silent wrong-branch-
wins bug in a follow-up assignment side effect.

Also closes the general unary-minus gap flagged since Lesson 3:
'-x' is parsed as '0 - x', reusing BinaryExpression's Minus case
rather than adding a new AST node - found as a genuine blocking
bug when 'if (5 > 3) 1 else -1' was the first real test of this
lesson's own feature and failed to parse at all.

Scope, deliberately deferred: no block syntax (if/else bodies are
single expressions only, not statement sequences); while and for
loops are a separate lesson, reusing this lesson's comparison and
condition-evaluation machinery rather than duplicating it."
```

Next lesson: `while` — a condition checked and a body run repeatedly, the project's first
node whose evaluation loops rather than branches once.
