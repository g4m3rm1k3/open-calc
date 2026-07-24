# Level 2, Lesson 3: Tokens to a Tree
*(What an AST Node Is, Walking a Token Stream, and Matching Specific Keywords)*

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

**This lesson builds the Parser and AST stages**, the first time either
has existed in this project. Carried through every stage built so far,
the concrete value this lesson ends on is:

```
"SELECT * FROM students;"
    → Lexer →
[KEYWORD "SELECT"] [STAR "*"] [KEYWORD "FROM"] [IDENTIFIER "students"] [SEMICOLON ";"]
    → Parser →
SelectStatement { tableName: "students" }
```

**What you will build.** Lessons 1–2 turned SQL text into a flat list
of tokens — real progress, but a token list still isn't *understood*
SQL: nothing yet knows that `SELECT`, `*`, `FROM`, and an identifier,
in that specific order, together mean "retrieve every row from this
table." Today's `Parser` walks that token list with real expectations,
throws the moment those expectations aren't met, and — when they are —
produces a `SelectStatement`: a small, typed C++ value an executor
could act on directly, with no more scanning required.

**What you need to know first.** Level 2, Lessons 1–2 in full —
`Token`, `TokenType`, and `Lexer::tokenize`, all reused unchanged as
this lesson's input. `class`, `private` state, and constructors from
Level 1 Lesson 4 are reused directly for `Parser`'s own internals.

---

## Concept Unit: What an AST Node Is

### The Problem

`tokenize("SELECT * FROM students;")` already returns five correctly-
typed tokens — so what's actually still missing? The tokens are still
just a flat list: nothing about that list itself says "this is a SELECT
query," or names which piece is the table. Any code that wanted to *act*
on this SQL — actually call `storage/`'s `Table::selectAll()`, say —
would have to re-inspect the token list every time, re-deriving "oh,
token 3 must be the table name" from scratch. What's needed is a single,
typed value that already captures *what kind* of statement this is and
*what it's about* — built once, by the parser, and handed to everything
downstream fully formed.

This unit is skipped for the Concept Isolation Rule's throwaway-lab
step: `struct` itself was already fully taught in Level 1 Lesson 2, and
there's no new C++ syntax here — the new part is purely the *idea* of
what this particular struct is *for*, which a lab wouldn't clarify any
further than the Problem above already has.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `sql/ast.h` — new file.
- **Change type:** create.
- **Location:** n/a — new file.
- **Dependencies:** none new.

### The New Code

```cpp
struct SelectStatement {
    std::string tableName;
};
```

### The Updated Project

`sql/ast.h`, in full — new file, nothing to return to yet:

```cpp
#pragma once
#include <string>

struct SelectStatement {
    std::string tableName;
};
```

### Mechanical Walkthrough
- `struct SelectStatement { std::string tableName; };` — reuses
- `struct` exactly as taught in Level 1 Lesson 2 (basic reuse) — one
  member, `tableName`, deliberately minimal: this lesson's lexer only
  ever produces one statement shape (`SELECT * FROM <table>;`), so this
  AST node only needs to remember which table. There's no field for
  *which columns* were selected, because this project doesn't support
- anything but `*` yet — an honest, deliberate scope match, not an
  oversight.

### CS Lens

This is the very beginning of an **abstract syntax tree (AST)** — for
now, a tree with exactly one node and no children, since a single
`SELECT * FROM table;` has no nested structure to represent yet. Also
recognized in: every real compiler's internal representation of parsed
source code; a JSON parser's in-memory object graph, built once from
text and then used repeatedly without re-parsing; and the shape this
project's own AST will grow into starting Lesson 4, once `WHERE`
clauses introduce statements with genuine internal structure —
conditions nested inside statements — rather than one flat node.

### SE Lens

The alternative — never building an AST at all, and having every piece
of downstream code (the eventual executor) work directly off the raw
token list — would work for exactly this one statement shape, and stop
working the moment a second statement shape (like `INSERT`, arriving
Lesson 4) needed *different* fields entirely. Building a typed AST node
now, even for the simplest possible case, is what lets the executor
(a future lesson) be written against a stable, named shape
(`stmt.tableName`) instead of token-list positions that would silently
shift every time the grammar grows.

### Commands

No new commands.

### Run It

Not runnable standalone — `SelectStatement` is a type with nothing
producing it yet. Connects into the next two units.

### One Sentence Connecting This to What Came Before

Lessons 1–2 built a lexer whose whole job was recognizing *pieces*;
this unit is the first shape in this project meant to represent
*meaning* — what those pieces, together, actually say.

---

## Concept Unit: Walking a Token Stream With Position

### The Problem

Turning five tokens into one `SelectStatement` means checking them one
at a time, in order, with real expectations — "the first token must be
`SELECT`," "the third must be `FROM`" — and, critically, remembering
*where* the check left off between one check and the next. That's
different from the lexer's own index-based walk (Level 2, Lesson 1),
which was a single local loop inside one function. Here, several
different pieces of logic will need to share and advance the *same*
position over time — which means position needs to live somewhere that
outlives any one function call.

### Introduce the Concept in Isolation

Throwaway file, `walker_lab.cpp`:

```cpp
#include <iostream>
#include <vector>

class IntWalker {
public:
    IntWalker(const std::vector<int>& values) : values(values), pos(0) {}

    int peek() const {
        return values[pos];
    }

    int advance() {
        int v = values[pos];
        pos++;
        return v;
    }

private:
    std::vector<int> values;
    size_t pos;
};

int main() {
    IntWalker walker({10, 20, 30});
    std::cout << "peek: " << walker.peek() << "\n";
    std::cout << "advance: " << walker.advance() << "\n";
    std::cout << "peek again: " << walker.peek() << "\n";
    return 0;
}
```

```
$ g++ walker_lab.cpp -o walker_lab
$ ./walker_lab
peek: 10
advance: 10
peek again: 20
```

`peek()` returned `10` twice in a row on either side of one `advance()`
call — but the *second* `peek()` returned `20`, not `10` again — proof
`pos` genuinely persisted between separate method calls, as real
private state belonging to the object, not to any single function.

### Discard the Throwaway Example

`walker_lab.cpp` and `IntWalker` are scratch work. The real project
builds `Parser` with this exact shape, next.

### Project Change

- **Files affected:** `sql/parser.h` — new file. `sql/parser.cpp` —
  new file.
- **Change type:** create.
- **Location:** n/a — new files.
- **Dependencies:** `sql/token.h`, `sql/ast.h`.

### The New Code

```cpp
Token Parser::peek() const {
    if (pos >= tokens.size()) {
        throw std::runtime_error("Parser error: unexpected end of input");
    }
    return tokens[pos];
}

Token Parser::advance() {
    Token t = peek();
    pos++;
    return t;
}
```

### The Updated Project

`sql/parser.h`, in full — new file:

```cpp
#pragma once
#include <vector>
#include <string>
#include "token.h"
#include "ast.h"

class Parser {
public:
    Parser(const std::vector<Token>& tokens);
    SelectStatement parseSelect();

private:
    std::vector<Token> tokens;
    size_t pos;

    Token peek() const;
    Token advance();
    Token expect(TokenType type, const std::string& errorMessage);
    Token expectKeyword(const std::string& keyword);
};
```

`sql/parser.cpp`, so far — the constructor and the two methods this
unit builds; `expect`, `expectKeyword`, and `parseSelect` are declared
above but defined in the next unit:

```cpp
#include "parser.h"
#include <stdexcept>

Parser::Parser(const std::vector<Token>& tokens) : tokens(tokens), pos(0) {}

Token Parser::peek() const {                                  // ← new
    if (pos >= tokens.size()) {                                  // ← new
        throw std::runtime_error("Parser error: unexpected end of input");  // ← new
    }                                                                // ← new
    return tokens[pos];                                                // ← new
}                                                                          // ← new

Token Parser::advance() {                                                    // ← new
    Token t = peek();                                                          // ← new
    pos++;                                                                       // ← new
    return t;                                                                      // ← new
}                                                                                     // ← new
```

`Parser` now holds its own private copy of the token list and a
position into it, starting at `0`. `peek()` looks at the current token
without consuming it; `advance()` returns the current token and moves
`pos` forward by one — the two building blocks every later parsing rule
in this project will be built from.

### Mechanical Walkthrough
- `class Parser` with `private: std::vector<Token> tokens; size_t
- pos;` — reuses `class`/`private` exactly (Level 1 Lesson 4), applied
  to a new kind of state: unlike `Table`'s `filename`, which never
  changed after construction, `pos` is designed to be mutated
  repeatedly by the object's own methods over its lifetime — the first
  time this project has built a class around *changing* internal state
  rather than fixed configuration.
- `Parser::Parser(const std::vector<Token>& tokens) : tokens(tokens),
- pos(0) {}` — reuses the member-initializer-list constructor pattern
  from Level 1 Lesson 4 exactly, initializing two members instead of
  one.
- `Token Parser::peek() const` — reuses `const` member functions
  (Level 1 Lesson 4): `peek` promises not to modify `Parser`, which is
- true — it only reads `pos` and `tokens`, never advances anything.
- `if (pos >= tokens.size()) { throw ... }` — **a hard concept
  reappearing** (per the Repetition Rule): the identical bounds-check
  idea the lexer used constantly (`i < sql.size() && ...`, Level 2
  Lessons 1–2), just phrased as an explicit guard with a thrown error
  instead of a loop condition — worth calling out plainly, since
  skipping this check here (as an earlier draft of this exact lesson
  briefly did, before being caught) causes a real, silent out-of-bounds
  read the moment a statement is missing a token it should have had.
- `Token Parser::advance() { Token t = peek(); pos++; return t; }` —
  **first appearance** of one method calling another method on the same
- object (`peek()` from inside `advance()`) — reuses ordinary function
  calling (Level 1 Lesson 3) with no new syntax, just applied to a
  sibling member function instead of a free function. Calling `peek()`
  here, rather than duplicating its bounds check, means `advance()`
  automatically inherits that same protection for free.

### CS Lens

This is a **cursor** (also called an iterator position, in this
specific hand-rolled form): an object that remembers *where* it is in a
sequence, separate from the sequence itself, so that "what's next" can
be asked and answered repeatedly across many separate calls. Also
recognized in: a database's own result-set cursor, fetching one row at
a time without re-running the query; a text editor's caret position;
and — worth sitting with — this is structurally the same idea as
`storage/`'s file position when reading line by line in Level 1, just
walking an in-memory `std::vector<Token>` instead of a file on disk.

### SE Lens

The alternative — passing `pos` around as a separate parameter to every
parsing function, rather than storing it as a private member — is a
real, valid design some hand-written parsers use, and it has one
advantage: it makes each function's dependency on position explicit in
its signature. The cost is that every single parsing function then
needs an extra parameter, and every caller needs to thread it through
correctly by hand. Storing `pos` privately, as this lesson does, trades
that explicitness for convenience — every method automatically shares
the same cursor without extra plumbing — at the cost of making it
slightly less obvious, just from a function's signature alone, that
calling it has a side effect (advancing `pos`) beyond its return value.

### Commands

No new commands.

### Run It

Not runnable standalone — `peek`/`advance` exist but nothing calls them
yet. Connects into the final unit.

### One Sentence Connecting This to What Came Before

The lexer's walk (Level 2, Lesson 1) tracked position for the length of
one function call; this unit is the first time this project needed that
same idea to outlive any single call, and gave it a permanent home.

---

## Concept Unit: Matching Specific Keywords, Not Just Kinds

### The Problem

`peek().type != TokenType::KEYWORD` can confirm a token *is* some
keyword, but `SELECT` and `FROM` are both `TokenType::KEYWORD` — that
check alone can't tell them apart. A parsing rule that only checked
type would happily accept `FROM * SELECT students;` as if it were a
valid `SELECT` statement, since every token still has the right *kind*,
just in the wrong order. Matching a specific keyword needs to check
both the type *and* the exact text.

This unit is skipped for the Concept Isolation Rule's throwaway-lab
step: every piece involved — `!=`, `||`, comparing `std::string` with
`==`, and `throw` — was already fully taught (Level 1 Lessons 5–6,
Level 2 Lesson 2). What's new is only the *combination*, applied
directly in the real project below.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `sql/parser.cpp` — modified.
- **Change type:** add.
- **Location:** `expect`, `expectKeyword`, and `parseSelect` are added
  below the `peek`/`advance` definitions from the previous unit.
- **Dependencies:** none new.

### The New Code

```cpp
Token Parser::expectKeyword(const std::string& keyword) {
    if (peek().type != TokenType::KEYWORD || peek().text != keyword) {
        throw std::runtime_error("Parser error: expected keyword '" + keyword + "'");
    }
    return advance();
}
```

### The Updated Project

`sql/parser.cpp`, in full:

```cpp
#include "parser.h"
#include <stdexcept>

Parser::Parser(const std::vector<Token>& tokens) : tokens(tokens), pos(0) {}

Token Parser::peek() const {
    if (pos >= tokens.size()) {
        throw std::runtime_error("Parser error: unexpected end of input");
    }
    return tokens[pos];
}

Token Parser::advance() {
    Token t = peek();
    pos++;
    return t;
}

Token Parser::expect(TokenType type, const std::string& errorMessage) {    // ← new
    if (peek().type != type) {                                               // ← new
        throw std::runtime_error(errorMessage);                                 // ← new
    }                                                                              // ← new
    return advance();                                                                // ← new
}                                                                                        // ← new

Token Parser::expectKeyword(const std::string& keyword) {                                  // ← new
    if (peek().type != TokenType::KEYWORD || peek().text != keyword) {                        // ← new
        throw std::runtime_error("Parser error: expected keyword '" + keyword + "'");             // ← new
    }                                                                                                // ← new
    return advance();                                                                                  // ← new
}                                                                                                          // ← new

SelectStatement Parser::parseSelect() {                                                                       // ← new
    expectKeyword("SELECT");                                                                                     // ← new
    expect(TokenType::STAR, "Parser error: expected '*'");                                                          // ← new
    expectKeyword("FROM");                                                                                            // ← new
    Token tableToken = expect(TokenType::IDENTIFIER, "Parser error: expected table name");                               // ← new
    expect(TokenType::SEMICOLON, "Parser error: expected ';'");                                                             // ← new

    SelectStatement stmt;                                                                                                     // ← new
    stmt.tableName = tableToken.text;                                                                                           // ← new
    return stmt;                                                                                                                   // ← new
}
```

`parseSelect` is now a complete, working parsing rule: it expects
`SELECT` specifically (not just any keyword), then a literal `*`, then
`FROM` specifically, then any identifier (captured, since it's the
table name), then a semicolon — and builds a `SelectStatement` from the
one piece of information that actually mattered, the table name.
Anything out of order, missing, or wrong at any step throws immediately,
naming what was expected.

### Mechanical Walkthrough
- `Token Parser::expect(TokenType type, const std::string&
- errorMessage)` — the generic, type-only check: reuses `peek()`,
  `!=`, and `throw` exactly as established, with `errorMessage`
- supplied by the caller — deliberately generic, used for `*`,
  identifiers, and `;`, none of which need a specific *text* match,
  only a specific *kind*.
- `Token Parser::expectKeyword(const std::string& keyword)` — the
  specific check this unit's Problem section motivated: `||` (Level 2
  Lesson 1) combines two conditions — wrong type, *or* right type but
- wrong text — either one is a failure.
- `peek().text != keyword`
  reuses `std::string` `!=` comparison (a direct sibling of `==`,
  Level 1 Lesson 6).
- `Token tableToken = expect(TokenType::IDENTIFIER, "...");` — reuses
  `expect`, storing its *return value* this time (every earlier call in
- `parseSelect` discarded it) — because this is the one token whose
  actual text matters afterward, not just its presence.
- `stmt.tableName = tableToken.text;` — reuses member access and
  assignment (Level 1 Lesson 2) — the entire payoff of parsing: one
  specific token's text, pulled out and placed into the AST node this
  lesson's first unit defined.

### CS Lens

`parseSelect` is a **grammar rule**, hand-written: it directly encodes
"a SELECT statement is exactly the sequence SELECT, `*`, FROM,
identifier, `;`" as a sequence of function calls. Also recognized in:
every recursive-descent parser (the technique Level 2 Lesson 4 names
explicitly and extends), where each grammar rule becomes one function;
a state machine reading a fixed protocol handshake, byte by byte, in a
fixed required order; and this is, concretely, the mechanism that will
grow — not get replaced — into parsing `INSERT` and `WHERE` next.

### SE Lens

The choice to build `expect` *and* `expectKeyword` as two separate
methods, rather than one method trying to handle both cases, is a real
design decision worth naming: a single combined method would need an
optional "and also check this text" parameter, awkward for every call
site that doesn't need it (three of `parseSelect`'s five calls don't).
Two small, single-purpose methods, each doing one exact job, cost one
extra method definition in exchange for every call site in
`parseSelect` reading as precisely what it means: `expect(STAR, ...)`
for "any star," `expectKeyword("FROM")` for "specifically FROM."

### Commands

No new commands.

### Run It

```
$ g++ demo.cpp sql/lexer.cpp sql/parser.cpp -o demo -Wall
$ ./demo
Parsed SELECT statement, table = students
```

The full pipeline this lesson's header promised, actually run: raw SQL
text through the Lexer, through the Parser, into a real
`SelectStatement` with `tableName` correctly holding `"students"`.

And confirming the failure modes are real, not just theoretical —
`sql/parser_test.cpp` exercises all three outcomes in one suite:

```
$ g++ sql/parser_test.cpp sql/parser.cpp sql/lexer.cpp -o parser_test -Wall
$ ./parser_test
testParseSimpleSelect passed
testParseWrongKeywordThrows passed
testParseMissingSemicolonThrows passed
All tests passed!
```

A correct statement parses; `FROM * SELECT students;` (right kinds,
wrong keywords) is rejected; and `SELECT * FROM students` (missing the
final `;`, running out of tokens mid-parse) is rejected too — the
second one specifically *because* of `peek()`'s bounds check from the
previous unit, without which this exact input would have triggered
undefined behavior instead of a clean error, confirmed the hard way
while building this lesson.

### One Sentence Connecting This to What Came Before

The previous unit gave `Parser` the ability to look at and move through
tokens; this unit is what finally used that ability to make real
decisions, producing this project's very first parsed AST.

---

## Closing

**Connect the pieces.** Follow `"SELECT * FROM students;"` through the
entire pipeline this lesson opened with: `Lexer::tokenize` (Lessons 1–2)
produces five tokens → `Parser`'s constructor stores them and sets
`pos` to `0` (Unit 2) → `parseSelect` calls `expectKeyword("SELECT")`,
which uses `peek()` to check both type and text, finds a match, and
`advance()`s `pos` to `1` (Unit 3) → `expect(STAR, ...)` matches the
`*`, advancing to `2` → `expectKeyword("FROM")` matches, advancing to
`3` → `expect(IDENTIFIER, ...)` matches `students`, this time *keeping*
the returned token → `expect(SEMICOLON, ...)` matches the final token →
`stmt.tableName` is set to `"students"` → a `SelectStatement` (Unit 1)
is returned, five tokens' worth of meaning now sitting in one typed
value.

**What breaks without this.** Already demonstrated concretely, twice,
during this lesson's own construction: replacing `expectKeyword("SELECT")`
and `expectKeyword("FROM")` with the generic, text-blind `expect(KEYWORD,
...)` makes `parser.parseSelect()` on `"FROM * SELECT students;"`
silently succeed, returning `SelectStatement { tableName: "students" }`
as if it had parsed a real, valid query — a wrong answer, delivered
confidently, with no error at all. And removing `peek()`'s bounds check
entirely turns a missing semicolon from a clean thrown error into a
genuine out-of-bounds memory read, confirmed under AddressSanitizer
while this lesson's tests were being verified — not a hypothetical, a
real bug this lesson's own development caught and fixed before it ever
reached you.

**Exercises.**
1. Add a test to `parser_test.cpp` confirming that
   `parser.parseSelect()` on `"SELECT students FROM students;"`
   (a valid-looking identifier where `*` should be) throws.
2. `parseSelect`'s error messages name *what* was expected but not
   *what was actually found instead* — compare this to Level 2
   Lesson 2's lexer error, which does name the actual offending
   character. Rewrite one of `parseSelect`'s `expect` calls so its
   error message includes `peek().text` too.
3. Predict, then check: what does `Parser(tokens).parseSelect()` do if
   `tokens` is empty (e.g., from tokenizing an empty string)? Trace
   through `peek()`'s bounds check by hand before running it.

**Definition of done.**
- [ ] `g++ sql/parser_test.cpp sql/parser.cpp sql/lexer.cpp -o
      parser_test -Wall` compiles and passes.
- [ ] `./demo` (or equivalent) correctly parses `SELECT * FROM
      students;` into a `SelectStatement` with `tableName == "students"`.
- [ ] You can explain, without rereading the walkthrough, why
      `expect(TokenType::KEYWORD, ...)` alone isn't sufficient to check
      for the word `FROM` specifically.
- [ ] You've completed exercises 1 and 2 above.
- [ ] **Update `API_Reference.md`** — add a new `SelectStatement`
      entry and document `Parser`'s public constructor and
      `parseSelect()`. Still 🟡 — only one statement shape is parseable;
      `INSERT` and `WHERE` are next.
- [ ] `git add sql/ API_Reference.md && git commit -m "Add a parser and
      first AST node: SelectStatement

      Parser walks tokens with a private cursor (peek/advance),
      matching both token kind and, for keywords, exact text —
      expect() vs expectKeyword() are separate on purpose, confirmed
      necessary by a real bug (FROM * SELECT students; parsing
      successfully) caught while building this lesson. peek() also
      bounds-checks pos, fixing a real out-of-bounds read confirmed
      under AddressSanitizer during development."`
