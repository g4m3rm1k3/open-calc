# Level 2, Lesson 4: Parsing `INSERT` and `WHERE`
*(Looking Ahead Without Committing, and Consuming a Repeated List)*

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

**This lesson stays in the Parser/AST stages**, extending both to two
statement shapes that don't fit Lesson 3's straight-line pattern.
Carried through every stage built so far, the concrete values this
lesson ends on are:

```
"SELECT * FROM students WHERE id = 1;"
    → Lexer → Tokens → Parser →
SelectStatement { tableName: "students", hasWhere: true,
                   where: { column: "id", value: NUMBER "1" } }

"INSERT INTO students VALUES (1, 'Alice', 20);"
    → Lexer → Tokens → Parser →
InsertStatement { tableName: "students",
                   values: [NUMBER "1", STRING "Alice", NUMBER "20"] }
```

**What you will build.** Lesson 3's `parseSelect` only ever handled a
fixed, five-token sequence — every token mandatory, none repeated. Real
SQL isn't always that rigid: `WHERE` is *optional* (a valid `SELECT` can
have zero or one), and `INSERT`'s value list can hold *any number* of
values, separated by commas. Neither of those fits "expect this exact
token next." Today `Parser` gains the two techniques that handle both:
looking ahead without committing, and consuming a list of unknown
length.

**What you need to know first.** Level 2, Lessons 1–3 in full —
`Token`, `Lexer::tokenize`, and every method on `Parser` (`peek`,
`advance`, `expect`, `expectKeyword`), all reused directly. Today builds
on top of them; none are modified.

---

## Concept Unit: Looking Ahead Without Committing

### The Problem

After parsing `SELECT * FROM students`, the next token might be `WHERE`
— or it might be the closing `;`, if there's no `WHERE` clause at all.
`expectKeyword("WHERE")` can't be used to check this: it *throws* the
moment its expectation isn't met, which is exactly wrong here — a
missing `WHERE` isn't an error, it's a perfectly valid statement.
What's needed is a way to ask "is the next token `WHERE`?" and get a
plain yes-or-no answer, without either consuming that token or throwing
if the answer is no.

### Introduce the Concept in Isolation

Throwaway file, `lookahead_lab.cpp`:

```cpp
#include <iostream>
#include <vector>
#include <string>

class Reader {
public:
    Reader(const std::vector<std::string>& tokens) : tokens(tokens), pos(0) {}

    bool checkNext(const std::string& value) const {
        if (pos >= tokens.size()) {
            return false;
        }
        return tokens[pos] == value;
    }

    std::string advance() {
        std::string t = tokens[pos];
        pos++;
        return t;
    }

private:
    std::vector<std::string> tokens;
    size_t pos;
};

int main() {
    Reader r({"hello", "world"});
    if (r.checkNext("hello")) {
        std::cout << "found hello, consuming it\n";
        r.advance();
    }
    std::cout << "next: " << r.advance() << "\n";

    Reader r2({"world"});
    if (r2.checkNext("hello")) {
        std::cout << "found hello\n";
    } else {
        std::cout << "no hello here, moving on\n";
    }
    return 0;
}
```

```
$ g++ lookahead_lab.cpp -o lookahead_lab
$ ./lookahead_lab
found hello, consuming it
next: world
no hello here, moving on
```

Two separate `Reader`s, one where `"hello"` genuinely comes next and one
where it doesn't — `checkNext` correctly answered `true` and `false`
respectively, and in *neither* case did calling it move `pos` or throw
— proof it's safe to call speculatively, purely to decide what to do
next.

### Discard the Throwaway Example

`lookahead_lab.cpp` and `Reader` are scratch work. The real project adds
this exact capability to `Parser`, next.

### Project Change

- **Files affected:** `sql/parser.h` — modified. `sql/parser.cpp` —
  modified.
- **Change type:** add.
- **Location:** `checkKeyword` is declared in `parser.h` alongside
  `expectKeyword`, and defined in `parser.cpp` right after it.
- **Dependencies:** none new.

### The New Code

```cpp
bool Parser::checkKeyword(const std::string& keyword) const {
    if (pos >= tokens.size()) {
        return false;
    }
    return tokens[pos].type == TokenType::KEYWORD && tokens[pos].text == keyword;
}
```

### The Updated Project

`sql/parser.h`, with `checkKeyword` added:

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
    bool checkKeyword(const std::string& keyword) const;   // ← new
};
```

`sql/parser.cpp`, with `checkKeyword` added below `expectKeyword`
(everything above unchanged from Lesson 3):

```cpp
Token Parser::expectKeyword(const std::string& keyword) {
    if (peek().type != TokenType::KEYWORD || peek().text != keyword) {
        throw std::runtime_error("Parser error: expected keyword '" + keyword + "'");
    }
    return advance();
}

bool Parser::checkKeyword(const std::string& keyword) const {   // ← new
    if (pos >= tokens.size()) {                                    // ← new
        return false;                                                 // ← new
    }                                                                     // ← new
    return tokens[pos].type == TokenType::KEYWORD                            // ← new
        && tokens[pos].text == keyword;                                        // ← new
}                                                                                  // ← new
```

`Parser` now has a fourth kind of check, alongside `expect` and
`expectKeyword`: one that never throws and never advances, purely for
deciding what to do next — used starting in this lesson's final unit
to make `WHERE` genuinely optional.

### Mechanical Walkthrough
- `bool Parser::checkKeyword(const std::string& keyword) const` —
- reuses `const` member functions (Level 1 Lesson 4) — genuinely read-
  only, unlike `advance`, which mutates `pos`.
- `if (pos >= tokens.size()) { return false; }` — **a hard concept
  reappearing**: the identical bounds check `peek()` uses (Lesson 3),
- but returning `false` instead of throwing — the whole point of this
  method existing separately from `peek()`.
- `tokens[pos].type == TokenType::KEYWORD && tokens[pos].text ==
- keyword` — reuses `&&`, `==`, and direct indexing (`tokens[pos]` instead of going through `peek()`) — indexing directly here, rather

  than calling `peek()`, is deliberate: `peek()` would throw on an
  out-of-bounds `pos`, which is exactly the case this method needs to
  handle gracefully instead.

### CS Lens

This is **lookahead**: inspecting upcoming input to decide which
grammar rule applies, without consuming anything — the standard
technique every recursive-descent parser uses to handle optional or
alternative constructs. Also recognized in: a compiler deciding whether
`if (...)` is followed by an `else` before committing to which AST
shape to build; regex engines checking ahead without advancing
(lookahead assertions, literally named after this idea); and a person
skimming the next word of a sentence before deciding how to finish
reading the current one.

### SE Lens

The alternative — trying to reuse `expectKeyword` by wrapping it in a
`try`/`catch` and treating a thrown exception as "no `WHERE` here" —
would technically work, but it's a real anti-pattern worth naming:
using exceptions for expected, routine control flow (whether a clause
is present) rather than genuine errors is slower (exceptions carry real
overhead) and muddies what an exception *means* in this codebase —
right now, every `throw` in `Parser` signals a real, malformed input.
`checkKeyword` keeps that meaning intact by handling the "maybe, maybe
not" case with an ordinary `bool`, not with exception machinery.

### Commands

No new commands.

### Run It

Not runnable as a standalone step — `checkKeyword` exists but nothing
calls it yet. Connects into the final unit.

### One Sentence Connecting This to What Came Before

Every check `Parser` has had until now demanded an answer immediately,
by throwing; this unit is the first time it can ask a question and
calmly accept either answer.

---

## Concept Unit: Consuming a Repeated List

### The Problem

`INSERT INTO students VALUES (1, 'Alice', 20);` could just as validly
have two values, or five — the grammar has no fixed number of values,
only a pattern: one value, then zero or more repetitions of "a comma,
then another value," until a closing `)`. None of `Parser`'s existing
methods handle "repeat until a stopping condition" — every method so
far consumes an exact, fixed sequence.

### Introduce the Concept in Isolation

Throwaway file, `commalist_lab.cpp`:

```cpp
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> tokens = {"1", ",", "2", ",", "3"};
    std::vector<int> values;
    size_t i = 0;

    values.push_back(std::stoi(tokens[i]));
    i++;
    while (i < tokens.size() && tokens[i] == ",") {
        i++;
        values.push_back(std::stoi(tokens[i]));
        i++;
    }

    for (int v : values) {
        std::cout << v << " ";
    }
    return 0;
}
```

```
$ g++ commalist_lab.cpp -o commalist_lab
$ ./commalist_lab
1 2 3
```

Five input tokens (`"1"`, `","`, `"2"`, `","`, `"3"`) correctly became
three values, `1`, `2`, `3` — proof the loop reads exactly one value per
comma, stopping cleanly once no comma remains, regardless of how many
values happened to be present.

### Discard the Throwaway Example

`commalist_lab.cpp` is scratch work. The real project applies this
exact shape to `INSERT`'s value list, in this lesson's final unit.

### Project Change

*(Deferred to the final unit, where `parseValueList` is built alongside
`parseInsert` and `parseWhereClause` — this concept's real application
needs `Parser`'s existing `expect`/`advance` machinery around it to be
meaningful as a project change on its own, the same situation Lesson 2
and Lesson 3 each flagged explicitly for a lab-only unit.)*

### Mechanical Walkthrough

- `values.push_back(std::stoi(tokens[i])); i++;` before the loop —
  reuses `push_back` (Level 1 Lesson 3) and `std::stoi` (Level 1
  Lesson 5) — reading the *first* value unconditionally, since a value
  list can never be empty (`VALUES ()` isn't valid SQL).
- `while (i < tokens.size() && tokens[i] == ",")` — reuses the bounded-
  loop shape from lexer accumulation (Level 2, Lessons 1–2) and `&&`
  (Level 2 Lesson 2) — the loop only continues if there's a comma
  *right here*, meaning it naturally stops the instant a non-comma
  (like the closing `)`) appears.
- `i++;` immediately inside the loop, before reading the next value —
  skips the comma itself, the same "consume the delimiter, don't store
  it" idea Level 2 Lesson 2's string-literal scanning used for quote
  marks.

### CS Lens

This is a classic instance of parsing a **comma-separated list**, one of
the most common repeated structures in any real grammar — function call
arguments, array literals, `SELECT` column lists (a gap this project
still has — only `*` is supported), and exactly this: `INSERT`'s value
list. Every one of them follows the identical shape: one required item,
then zero or more `(comma, item)` pairs.

### SE Lens

The alternative — hardcoding a fixed number of expected values, the way
`parseSelect` hardcodes an exact five-token sequence — would work only
if every `INSERT` this project ever needed to support had exactly three
values, which happens to be true today (`Student` has three fields) but
is a fragile assumption to bake into the parser itself. Writing a real
repeated-list parser here, even though today's only caller happens to
insert exactly three values, means the parser doesn't have to change
if `Student` ever grows a fourth field — only `storage/` would.

### Commands

No new commands.

### Run It

See the lab's run above — fully demonstrated there. The real project
applies it starting next unit.

### One Sentence Connecting This to What Came Before

The previous unit taught `Parser` to handle "maybe once"; this unit is
how it will handle "any number of times."

---

## Concept Unit: Assembling `parseInsert` and Extending `parseSelect`

### The Problem

Both new techniques exist in isolation now — lookahead, and a repeated-
list pattern — but nothing in `Parser` uses either one yet. This unit
wires them into two real, complete parsing rules: `parseSelect` grows an
optional `WHERE` clause, and a brand-new `parseInsert` handles `INSERT`
end to end.

### Introduce the Concept in Isolation

No new C++ construct is introduced here — every piece (`checkKeyword`,
the comma-loop, `expect`, `expectKeyword`, `advance`) was taught in
isolation earlier in this lesson or in Lesson 3. This unit is purely
composition, shown directly in the real project, matching the precedent
set by Lesson 3's own final unit.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `sql/ast.h` — modified. `sql/parser.h` —
  modified. `sql/parser.cpp` — modified.
- **Change type:** add (`WhereClause`, `InsertStatement`, `hasWhere`/
  `where` fields on `SelectStatement`, `parseWhereClause`,
  `parseValueList`, `parseInsert`) + replace (`parseSelect`'s body, to
  call `checkKeyword`/`parseWhereClause`).
- **Location:** `ast.h` gains two new structs and extends
  `SelectStatement`; `parser.h`/`parser.cpp` gain three new methods,
  and `parseSelect`'s body changes between its table-name check and its
  final semicolon check.
- **Dependencies:** none new.

### The New Code

```cpp
WhereClause Parser::parseWhereClause() {
    expectKeyword("WHERE");
    Token column = expect(TokenType::IDENTIFIER, "Parser error: expected column name");
    expect(TokenType::EQUALS, "Parser error: expected '='");
    Token value = advance();

    WhereClause clause;
    clause.column = column.text;
    clause.value = value;
    return clause;
}
```

### The Updated Project

`sql/ast.h`, in full:

```cpp
#pragma once
#include <string>
#include <vector>
#include "token.h"

struct WhereClause {                   // ← new
    std::string column;                   // ← new
    Token value;                             // ← new
};                                              // ← new

struct SelectStatement {
    std::string tableName;
    bool hasWhere = false;             // ← new
    WhereClause where;                    // ← new
};

struct InsertStatement {               // ← new
    std::string tableName;                // ← new
    std::vector<Token> values;               // ← new
};                                              // ← new
```

`sql/parser.h`, in full:

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
    InsertStatement parseInsert();     // ← new

private:
    std::vector<Token> tokens;
    size_t pos;

    Token peek() const;
    Token advance();
    Token expect(TokenType type, const std::string& errorMessage);
    Token expectKeyword(const std::string& keyword);
    bool checkKeyword(const std::string& keyword) const;

    WhereClause parseWhereClause();       // ← new
    std::vector<Token> parseValueList();     // ← new
};
```

`sql/parser.cpp`'s `parseSelect`, `parseValueList`, and `parseInsert`,
in full (everything above `parseSelect` unchanged from earlier in this
lesson and Lesson 3):

```cpp
WhereClause Parser::parseWhereClause() {                                // ← new
    expectKeyword("WHERE");                                                // ← new
    Token column = expect(TokenType::IDENTIFIER, "Parser error: expected column name");  // ← new
    expect(TokenType::EQUALS, "Parser error: expected '='");                  // ← new
    Token value = advance();                                                     // ← new

    WhereClause clause;                                                            // ← new
    clause.column = column.text;                                                     // ← new
    clause.value = value;                                                               // ← new
    return clause;                                                                        // ← new
}

SelectStatement Parser::parseSelect() {
    expectKeyword("SELECT");
    expect(TokenType::STAR, "Parser error: expected '*'");
    expectKeyword("FROM");
    Token tableToken = expect(TokenType::IDENTIFIER, "Parser error: expected table name");

    SelectStatement stmt;
    stmt.tableName = tableToken.text;

    if (checkKeyword("WHERE")) {          // ← changed
        stmt.hasWhere = true;                // ← new
        stmt.where = parseWhereClause();        // ← new
    }                                              // ← changed

    expect(TokenType::SEMICOLON, "Parser error: expected ';'");
    return stmt;
}

std::vector<Token> Parser::parseValueList() {                          // ← new
    std::vector<Token> values;                                            // ← new

    expect(TokenType::LPAREN, "Parser error: expected '('");                 // ← new
    values.push_back(advance());                                                // ← new
    while (peek().type == TokenType::COMMA) {                                     // ← new
        advance();                                                                   // ← new
        values.push_back(advance());                                                   // ← new
    }                                                                                     // ← new
    expect(TokenType::RPAREN, "Parser error: expected ')'");                                // ← new

    return values;                                                                            // ← new
}                                                                                                  // ← new

InsertStatement Parser::parseInsert() {                                                              // ← new
    expectKeyword("INSERT");                                                                            // ← new
    expectKeyword("INTO");                                                                                // ← new
    Token tableToken = expect(TokenType::IDENTIFIER, "Parser error: expected table name");                    // ← new
    expectKeyword("VALUES");                                                                                     // ← new

    InsertStatement stmt;                                                                                          // ← new
    stmt.tableName = tableToken.text;                                                                                 // ← new
    stmt.values = parseValueList();                                                                                     // ← new

    expect(TokenType::SEMICOLON, "Parser error: expected ';'");                                                            // ← new
    return stmt;                                                                                                              // ← new
}
```

`parseSelect` now checks, right after the table name, whether `WHERE`
comes next — and only if it does does it call `parseWhereClause`,
which itself is a small, complete grammar rule of its own (this
project's first example of one parsing function calling another —
genuine recursive-descent *structure*, even without deep operator
precedence yet, since only `=` exists as a comparison so far).
`parseInsert` is a new, complete rule end to end: `INSERT`, `INTO`, a
table name, `VALUES`, then the value list from this lesson's second
unit, then `;` — assembled entirely from pieces this project already
had, plus `parseValueList`, built specifically for this.

### Mechanical Walkthrough
- `WhereClause` and `InsertStatement` in `ast.h` — reuse `struct`
  exactly (Level 1 Lesson 2); `WhereClause` holds a `Token`, not a raw
- value, for the same reason `InsertStatement::values` does — the AST
  doesn't yet convert `NUMBER`/`STRING` text into real typed C++ values;
  that conversion is deferred, honestly, to whichever future lesson
  builds the executor.
- `bool hasWhere = false;` — **first appearance** of a default member
- initializer directly in a `struct` definition — every `SelectStatement`
  starts with `hasWhere` already `false`, without the constructing code
  needing to set it explicitly, unless a `WHERE` is actually found.
- `if (checkKeyword("WHERE")) { ... }` — reuses `if` and this lesson's
- own new `checkKeyword` — the payoff of this lesson's first unit: no
  `try`/`catch`, no special-casing, just a plain conditional.
- `stmt.where = parseWhereClause();` — **first appearance** of one
  parsing method's return value being assigned directly into a field of
- another statement's AST node — `parseSelect` doesn't know or care how
  `parseWhereClause` works internally, only that it returns a complete
  `WhereClause`.
- `while (peek().type == TokenType::COMMA)` in `parseValueList` —
- reuses `peek()` and `==` — the same shape as the lab's `while` loop,
  now checking a `Token`'s `type` instead of comparing raw strings.
- `values.push_back(advance());` — reused twice in `parseValueList`
  (once before the loop, once inside it) — each call both reads and
  consumes the current token in one step, storing whatever it is
  (`NUMBER` or `STRING`) without yet checking which.

### CS Lens

`parseSelect` calling `parseWhereClause`, which is itself a self-
contained grammar rule, is **recursive descent** in its true shape: a
parser built as a set of functions, each one implementing exactly one
grammar rule, calling into each other to handle nested structure. It's
called *recursive* descent because, in general, these functions can
call each other (and even themselves) arbitrarily deeply — this
project's `WHERE` clause doesn't need that yet, since it only supports
one flat condition, but the *shape* — one function per rule, functions
calling functions — is exactly what real recursive descent looks like,
and exactly what a future lesson adding `AND`/`OR` (letting a `WHERE`
clause contain other `WHERE`-clause-like structures inside itself) will
extend, not replace.

### SE Lens

Worth naming honestly, the way every deferred piece of this project has
been: this lesson's title mentions "operator precedence," and there
genuinely isn't any here yet — precedence only becomes a real question
once multiple operators with different binding strength exist (`AND`
binding looser than `=`, for instance), and this project's lexer only
produces one comparison operator, `=`, so far. `parseWhereClause`
handles exactly one flat condition on purpose, honestly matching what
the grammar actually supports today, rather than half-building
precedence logic with nothing yet requiring it. `AND`/`OR` (started as
an exercise back in Level 2 Lesson 2) is the natural next step that
would make precedence a real, necessary concept — not yet forced here.

### Commands

No new commands.

### Run It

```
$ g++ demo.cpp sql/lexer.cpp sql/parser.cpp -o demo -Wall
$ ./demo
SELECT, table=students, hasWhere=0
SELECT, table=students, hasWhere=1, where.column=id, where.value=1
INSERT, table=students, values=[1] [Alice] [20]
```

Three real statements, three correct parses: a `SELECT` with no
`WHERE` (`hasWhere` correctly `0`/false), the same `SELECT` *with* a
`WHERE` (correctly capturing `id` and `1`), and a full `INSERT` with
all three values correctly extracted in order.

And the full test suite, including a deliberately malformed `INSERT`
missing its commas:

```
$ g++ sql/parser_test.cpp sql/parser.cpp sql/lexer.cpp -o parser_test -Wall
$ ./parser_test
testParseSelectWithoutWhere passed
testParseSelectWithWhere passed
testParseInsert passed
testParseInsertMissingCommaThrows passed
All tests passed!
```

### One Sentence Connecting This to What Came Before

This lesson's first two units each built one tool in isolation; this
unit is where both finally did real work, turning two more shapes of
SQL text into typed AST nodes for the first time.

---

## Closing

**Connect the pieces.** Follow `"INSERT INTO students VALUES (1,
'Alice', 20);"` end to end: the lexer produces twelve tokens (Level 2,
Lesson 2) → `parseInsert` consumes `INSERT`, `INTO`, the table name,
and `VALUES` using nothing but Lesson 3's original `expect`/
`expectKeyword` → `parseValueList` takes over at the `(`: `expect`s it,
reads `1` unconditionally as the first value (this lesson's second
unit), then loops — sees `,`, consumes it, reads `'Alice'`'s already-
lexed `STRING` token, sees another `,`, reads `20`, sees `)` instead of
another comma, and stops — `expect`s the `)`, and returns three tokens
→ back in `parseInsert`, those three tokens become
`InsertStatement::values`, the table name becomes `tableName`, the
final `;` is consumed, and one complete, typed AST node is returned.
Every piece — the optional check, the repeated list, and the plain
`expect`/`expectKeyword` calls — cooperating in one parse.

**What breaks without this.** A version of `parseValueList` that forgot
the `while` loop entirely — reading exactly one value and nothing more
— was built on purpose to check:

```
$ ./broken_demo
Got 1 value(s) instead of 3: [1]
Stopped at token index 3 out of 7 total
```

Only `1` was captured; `'Alice'` and `20` were silently never read at
all, and parsing stopped having consumed less than half the input —
exactly the kind of quiet, wrong result a missing loop produces, with
no thrown error to flag it. (This broken version was never wired into
the real `parseValueList` — the real one, with its `while` loop, was
verified correct from the start.)

**Exercises.**
1. Add a test confirming `parser.parseInsert()` throws on
   `"INSERT INTO students VALUES ();"` (an empty value list) — trace
   through `parseValueList` by hand first to predict exactly *where* it
   throws and why.
2. `parseWhereClause`'s `Token value = advance();` accepts *any* token
   as the comparison value, including a keyword or a `*`. Add a check
   that throws unless the token is specifically `NUMBER` or `STRING`.
3. `parseSelect`'s hardcoded five (or, with `WHERE`, more) tokens still
   assume `*` — no column list is supported. Sketch, in prose, what
   `parseColumnList` would need to look like to support `SELECT id,
   name FROM students;` — you don't need to write the code, just reason
   about which of this lesson's two techniques (lookahead, repeated
   list) it would need, and why.

**Definition of done.**
- [ ] `g++ sql/parser_test.cpp sql/parser.cpp sql/lexer.cpp -o
      parser_test -Wall` compiles and passes.
- [ ] `./demo` (or equivalent) correctly parses all three statement
      shapes shown in this lesson's Run It section.
- [ ] You can explain, without rereading the SE Lens, why this lesson
      doesn't actually implement operator precedence despite parsing a
      `WHERE` clause.
- [ ] You've completed exercises 1 and 2 above.
- [ ] **Update `API_Reference.md`** — add `WhereClause`,
      `InsertStatement`, the extended `SelectStatement`, `checkKeyword`,
      and `parseInsert` to the `sql/` section. Still 🟡 — no `UPDATE`/
      `DELETE` parsing, no compound `WHERE` conditions, no column lists.
- [ ] `git add sql/ API_Reference.md && git commit -m "Parse INSERT and
      optional WHERE clauses

      checkKeyword() adds true lookahead (peek without consuming or
      throwing) for optional grammar elements; parseValueList() adds a
      repeated comma-separated list. parseSelect calling
      parseWhereClause is this project's first real recursive-descent
      structure, though full operator precedence is still deferred —
      only '=' exists as a comparison operator so far."
