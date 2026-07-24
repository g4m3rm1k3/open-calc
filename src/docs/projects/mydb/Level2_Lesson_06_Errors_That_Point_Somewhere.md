# Level 2, Lesson 6: Errors That Point Somewhere
*(Tracking Line and Column, and `std::to_string`)*

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

**This lesson touches the Lexer and Parser stages**, upgrading every
error either one throws. Carried through, the concrete value this
lesson ends on is a *message*, not a value — the whole point:

```
"SELECT *\nFROM students\nWHERE id 1;"
    → Lexer → Tokens → Parser →
"Parser error at line 3, column 10: expected '='"
```

**What you will build.** Every `throw` in this project so far — lexer
errors since Level 2 Lesson 2, parser errors since Lesson 3 — has named
*what* went wrong but never *where*. That's tolerable for a five-token
statement on one line; it stops being tolerable the moment a real query
spans several lines and something fails deep inside it. Today `Token`
gains `line` and `column` fields, the lexer stamps every token with
where it started, and the parser's errors are rebuilt to report the
exact position of the token that broke an expectation.

**What you need to know first.** All of Level 2, Lessons 1–5 — `Token`,
`Lexer::tokenize`, every `Parser` method, and `Executor`. Nothing about
*what* any of them do changes today; only how precisely they report
failure.

---

## Concept Unit: Where the Line Starts

### The Problem

Right now, `tokenize` knows a character's raw index into the source
string (`i`), but that's not what a person reading an error wants —
"unexpected character at index 47" means counting characters by hand.
What's actually useful is *line* and *column*, the way every real
compiler or editor reports position. Getting there means tracking two
things while scanning: which line the lexer is currently on, and where
that line began, so a column can be computed at any point without
re-scanning from the start of the string.

### Introduce the Concept in Isolation

Throwaway file, `position_lab.cpp`:

```cpp
#include <iostream>
#include <string>
#include <cctype>

int main() {
    std::string text = "ab\ncd";
    int line = 1;
    size_t lineStart = 0;

    for (size_t i = 0; i < text.size(); i++) {
        char c = text[i];
        if (c == '\n') {
            line++;
            lineStart = i + 1;
            continue;
        }
        int column = i - lineStart + 1;
        std::cout << c << " is at line " << line << ", column " << column << "\n";
    }
    return 0;
}
```

```
$ g++ position_lab.cpp -o position_lab
$ ./position_lab
a is at line 1, column 1
b is at line 1, column 2
c is at line 2, column 1
d is at line 2, column 2
```

`"ab\ncd"` correctly produced two characters on line 1 and two on line
2, each with the right column, resetting cleanly at the newline — proof
`lineStart` alone (the index right after the most recent `\n`) is
enough to compute any later character's column, with no need to count
characters back to the start of the string each time.

### Discard the Throwaway Example

`position_lab.cpp` is scratch work. The real lexer gains this tracking
next.

### Project Change

- **Files affected:** `sql/token.h` — modified. `sql/lexer.cpp` —
  modified.
- **Change type:** add (`line`/`column` fields on `Token`, `line`/
  `lineStart` tracking in `tokenize`) + replace (every `tokens.push_back`
  call, now including position; the final `throw`, now including
  position).
- **Location:** `token.h`'s `Token` struct gains two fields;
  `lexer.cpp`'s `tokenize` gains two local variables at the top and a
  computed `tokenLine`/`tokenColumn` pair before each branch.
- **Dependencies:** `<string>`'s `std::to_string`, used in the next
  unit.

### The New Code

```cpp
if (c == '\n') {
    line++;
    lineStart = i + 1;
    continue;
}
```

### The Updated Project

`sql/token.h`, in full:

```cpp
#pragma once
#include <string>

enum class TokenType {
    KEYWORD,
    IDENTIFIER,
    STAR,
    SEMICOLON,
    NUMBER,
    STRING,
    COMMA,
    EQUALS,
    LPAREN,
    RPAREN
};

struct Token {
    TokenType type;
    std::string text;
    int line;         // ← new
    int column;       // ← new
};
```

`sql/lexer.cpp`'s `tokenize`, showing just the top of the function and
the newline handling (the rest — every branch's `tokens.push_back` and
the final `throw` — is fully rebuilt in the next unit, since it needs
`tokenColumn` computed first):

```cpp
std::vector<Token> Lexer::tokenize(const std::string& sql) {
    std::vector<Token> tokens;
    int line = 1;                 // ← new
    size_t lineStart = 0;         // ← new

    for (size_t i = 0; i < sql.size(); i++) {
        char c = sql[i];

        if (c == '\n') {              // ← new
            line++;                      // ← new
            lineStart = i + 1;              // ← new
            continue;                          // ← new
        }                                        // ← new

        if (std::isspace(c)) {
            continue;
        }

        // ... rest of tokenize, updated next unit
```

### Mechanical Walkthrough

- `int line; int column;` added to `Token` — reuses plain member
  declarations (Level 1 Lesson 2) — every token, from now on, knows
  exactly where in the source it started.
- `int line = 1;` — starts at `1`, not `0`, matching how every text
  editor and compiler numbers lines for humans.
- `size_t lineStart = 0;` — the index of the first character of the
  *current* line; starts at `0` since the very first line begins at the
  very start of the string.
- `if (c == '\n') { line++; lineStart = i + 1; continue; }` — **first
  appearance** of this exact check, though `'\n'` itself was already
  used as an escape sequence in every `std::string` literal since
  Lesson 1 (Level 1) — new here is checking for it as an individual
  *character* being scanned, not writing it into output. `lineStart =
  i + 1` sets the new line's start to the character right *after* the
  newline — the newline itself belongs to no line's column count.

### CS Lens

This is the same idea behind every text editor's line/column indicator
in its status bar, and every compiler error like `file.cpp:14:8: error:
...` — position tracking maintained incrementally, one pass through the
source, rather than recomputed by re-scanning from the start every time
a position is needed. Also recognized in: how a terminal's cursor
tracks its own row/column as text streams past it, and how source maps
in compiled JavaScript let a browser report an error's position in
*original*, pre-compiled source rather than the generated file.

### SE Lens

The alternative — computing line/column by re-scanning the whole
string from the beginning every time an error needs to report a
position — would work, and would even be simpler to write in isolation,
but it's real, avoidable waste: for a lexer processing a string once,
character by character, tracking `line`/`lineStart` incrementally is
strictly cheaper, and it's *free* to compute here specifically because
the lexer is already walking every character exactly once regardless.

### Commands

No new commands.

### Run It

Not runnable standalone yet — `line`/`lineStart` are tracked, but no
token is stamped with them until the next unit.

### One Sentence Connecting This to What Came Before

Every lexer branch since Level 2 Lesson 1 has known *what* it just
scanned; this unit is the first time it also started keeping track of
*where*.

---

## Concept Unit: Stamping Every Token, and `std::to_string`

### The Problem

`line`/`lineStart` are tracked now, but nothing uses them yet — every
`Token` this lexer produces still only carries a `type` and `text`. And
once a position needs to go into an error *message*, a new small
problem appears: `line` and `column` are `int`s, but
`std::runtime_error`'s constructor takes a `std::string` — there's no
way to `+` an `int` directly onto a string the way `+` already
concatenates two strings (Level 1 Lesson 5).

### Introduce the Concept in Isolation

Throwaway file, `tostring_lab.cpp`:

```cpp
#include <iostream>
#include <string>

int main() {
    int x = 42;
    std::string message = "the value is " + std::to_string(x);
    std::cout << message;
    return 0;
}
```

```
$ g++ tostring_lab.cpp -o tostring_lab
$ ./tostring_lab
the value is 42
```

`x`, a real `int`, became `"42"`, a real `std::string`, concatenable
with `"the value is "` using the exact same `+` from Level 1 Lesson 5
— proof `std::to_string` is the direct reverse of `std::stoi` (Level 1
Lesson 5): one turns text into a number, the other turns a number back
into text.

### Discard the Throwaway Example

`tostring_lab.cpp` is scratch work. The real lexer uses this to build
its error message, alongside stamping every token, next.

### Project Change

- **Files affected:** `sql/lexer.cpp` — modified.
- **Change type:** replace.
- **Location:** every `tokens.push_back({...})` call throughout
  `tokenize`, plus the final `throw` at the bottom.
- **Dependencies:** `<string>`'s `std::to_string` (already included via
  `<string>`, pulled in transitively through `token.h`).

### The New Code

```cpp
int tokenLine = line;
int tokenColumn = i - lineStart + 1;
```

### The Updated Project

`sql/lexer.cpp`, in full:

```cpp
#include "lexer.h"
#include <cctype>
#include <stdexcept>

std::vector<Token> Lexer::tokenize(const std::string& sql) {
    std::vector<Token> tokens;
    int line = 1;
    size_t lineStart = 0;

    for (size_t i = 0; i < sql.size(); i++) {
        char c = sql[i];

        if (c == '\n') {
            line++;
            lineStart = i + 1;
            continue;
        }

        if (std::isspace(c)) {
            continue;
        }

        int tokenLine = line;                                   // ← new
        int tokenColumn = i - lineStart + 1;                        // ← new

        if (c == '*') { tokens.push_back({TokenType::STAR, "*", tokenLine, tokenColumn}); continue; }        // ← changed
        if (c == ';') { tokens.push_back({TokenType::SEMICOLON, ";", tokenLine, tokenColumn}); continue; }     // ← changed
        if (c == ',') { tokens.push_back({TokenType::COMMA, ",", tokenLine, tokenColumn}); continue; }           // ← changed
        if (c == '=') { tokens.push_back({TokenType::EQUALS, "=", tokenLine, tokenColumn}); continue; }            // ← changed
        if (c == '(') { tokens.push_back({TokenType::LPAREN, "(", tokenLine, tokenColumn}); continue; }             // ← changed
        if (c == ')') { tokens.push_back({TokenType::RPAREN, ")", tokenLine, tokenColumn}); continue; }               // ← changed

        if (std::isalpha(c)) {
            std::string word;
            while (i < sql.size() && std::isalpha(sql[i])) {
                word += sql[i];
                i++;
            }
            i--;

            if (word == "SELECT" || word == "FROM" || word == "WHERE" ||
                word == "INSERT" || word == "INTO" || word == "VALUES") {
                tokens.push_back({TokenType::KEYWORD, word, tokenLine, tokenColumn});      // ← changed
            } else {
                tokens.push_back({TokenType::IDENTIFIER, word, tokenLine, tokenColumn});     // ← changed
            }
            continue;
        }

        if (std::isdigit(c)) {
            std::string number;
            while (i < sql.size() && std::isdigit(sql[i])) {
                number += sql[i];
                i++;
            }
            i--;
            tokens.push_back({TokenType::NUMBER, number, tokenLine, tokenColumn});      // ← changed
            continue;
        }

        if (c == '\'') {
            std::string value;
            i++;
            while (i < sql.size() && sql[i] != '\'') {
                if (sql[i] == '\n') {                     // ← new
                    line++;                                   // ← new
                    lineStart = i + 1;                            // ← new
                }                                                    // ← new
                value += sql[i];
                i++;
            }
            tokens.push_back({TokenType::STRING, value, tokenLine, tokenColumn});      // ← changed
            continue;
        }

        throw std::runtime_error("Lexer error at line " + std::to_string(tokenLine) +      // ← changed
                                  ", column " + std::to_string(tokenColumn) +                  // ← changed
                                  ": unexpected character '" + c + "'");                          // ← changed
    }

    return tokens;
}
```

`tokenize` now computes `tokenLine`/`tokenColumn` fresh right before
each branch, using the current `i` against the running `line`/
`lineStart` from the previous unit, and stamps *every* token with them
— including inside the `isalpha`/`isdigit`/quote branches, where the
position recorded is the *start* of the word, number, or string, not
wherever the inner `while` loop happened to leave `i`. The string
branch also gained its own small newline check, so a string literal
that happens to span multiple lines still keeps `line`/`lineStart`
correct for whatever comes after it.

### Mechanical Walkthrough
- `int tokenLine = line; int tokenColumn = i - lineStart + 1;` —
  computed once, right before the six single-character checks and the
  three accumulation branches, capturing the position of the *first*
  character of whatever token is about to be built — this is why it's
  computed before, not after, each branch runs.
- `tokens.push_back({TokenType::STAR, "*", tokenLine, tokenColumn});`
  and every sibling — reuses brace-initialization (Level 1 Lesson 2)
  with two more values than before, matching `Token`'s two new fields.
- The `isalpha`/`isdigit` branches — `tokenLine`/`tokenColumn` were
  already captured *before* entering the branch, so even though the
  inner `while` loop advances `i` across the whole word or number, the
  token still correctly reports where it *started*, not where the
  accumulation finished.
- `if (sql[i] == '\n') { line++; lineStart = i + 1; }` inside the
- string-scanning `while` loop — reuses the exact newline-handling logic
  from the previous unit's top-level check, applied here too so a
  multi-line string doesn't desynchronize position tracking for
  whatever comes after it.
- `std::to_string(tokenLine)`, `std::to_string(tokenColumn)` — reuses
  this unit's own new function, twice, to build the final error
  message.

### CS Lens

Every token carrying its own **source location** — not just what it is,
but where it came from — is standard in every real lexer, and it's what
makes every later stage's errors (including the parser's, next unit)
possible without those stages needing to re-derive position themselves.
Also recognized in: debug symbols in compiled binaries, which map
machine instructions back to source line numbers; and stack traces,
which are fundamentally the same idea applied to function calls instead
of tokens.

### SE Lens

Stamping *every* token, even ones that will never cause an error, costs
two extra `int`s per token — genuinely negligible, but worth naming as
a real, deliberate tradeoff rather than a free lunch: a lexer optimized
purely for speed at massive scale might defer position computation
until an error actually occurs, rather than computing it unconditionally
for every single token. This project chooses simplicity and uniformity
(every token always has a real position, no special cases) over that
micro-optimization, which is the right call at this project's scale.

### Commands

No new commands.

### Run It

```
$ g++ lexer_position_demo.cpp sql/lexer.cpp -o lexer_position_demo -Wall
$ ./lexer_position_demo
[SELECT] at line 1, column 1
[*] at line 1, column 8
[FROM] at line 2, column 1
[students] at line 2, column 6
[;] at line 2, column 14
--- error case ---
Lexer error at line 2, column 6: unexpected character '#'
```

Five tokens across two lines, every position correct — `FROM` starting
fresh at column 1 on line 2, `students` at column 6 right after it —
and the error case correctly reporting line 2, column 6 for a `#`
placed exactly there.

### One Sentence Connecting This to What Came Before

The previous unit taught the lexer to track position; this unit is
where that tracking finally became visible, on every token and in a
real, precise error message.

---

## Concept Unit: Passing Position to the Parser

### The Problem

The lexer's own errors now point somewhere — but every parser error
since Level 2 Lesson 3 still only says *what* it expected, never
*where* the mismatched token actually was. `expect` and `expectKeyword`
already call `peek()` to check the current token; that same token
already carries `line`/`column`, stamped by the lexer moments ago. It's
sitting right there, unused.

This unit is skipped for the Concept Isolation Rule's throwaway-lab
step: `std::to_string` (just taught) and string concatenation (Level 1
Lesson 5) are the only pieces involved, both already isolated. What's
new is purely wiring them into `Parser`'s existing error paths.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `sql/parser.cpp` — modified.
- **Change type:** replace.
- **Location:** `expect` and `expectKeyword`'s bodies.
- **Dependencies:** none new.

### The New Code

```cpp
Token Parser::expect(TokenType type, const std::string& errorMessage) {
    Token t = peek();
    if (t.type != type) {
        throw std::runtime_error("Parser error at line " + std::to_string(t.line) +
                                  ", column " + std::to_string(t.column) + ": " + errorMessage);
    }
    return advance();
}
```

### The Updated Project

`sql/parser.cpp`'s `expect` and `expectKeyword`, in full (everything
else — `peek`, `advance`, `checkKeyword`, `parseWhereClause`,
`parseSelect`, `parseValueList`, `parseInsert` — unchanged; each of
their calls to `expect`/`expectKeyword` now passes a shorter message,
since the position prefix is added automatically):

```cpp
Token Parser::expect(TokenType type, const std::string& errorMessage) {       // ← changed
    Token t = peek();                                                            // ← new
    if (t.type != type) {                                                           // ← changed
        throw std::runtime_error("Parser error at line " + std::to_string(t.line) +    // ← new
                                  ", column " + std::to_string(t.column) +                 // ← new
                                  ": " + errorMessage);                                       // ← new
    }
    return advance();
}

Token Parser::expectKeyword(const std::string& keyword) {                      // ← changed
    Token t = peek();                                                             // ← new
    if (t.type != TokenType::KEYWORD || t.text != keyword) {                         // ← changed
        throw std::runtime_error("Parser error at line " + std::to_string(t.line) +    // ← new
                                  ", column " + std::to_string(t.column) +                 // ← new
                                  ": expected keyword '" + keyword + "'");                    // ← changed
    }
    return advance();
}
```

Every call site — inside `parseSelect`, `parseInsert`, `parseWhereClause`,
`parseValueList` — is unchanged in *what* it expects; only the error
message it produces on a mismatch is now automatically prefixed with
exactly where the mismatch happened, taken directly from the token that
failed to match.

### Mechanical Walkthrough
- `Token t = peek();` at the top of both methods — reuses `peek()`
  (Level 2 Lesson 3) — called once now and reused, rather than calling
  `peek()` again inside the error branch, since the token is needed
  either way (for the position, or to hand to `advance()` on success).
- `"Parser error at line " + std::to_string(t.line) + ", column " +
- std::to_string(t.column) + ": " + errorMessage` — reuses `+`
  concatenation and this lesson's own `std::to_string`, chained across
  four pieces to build one message.
- Every caller's error-message argument shrank (e.g., `"expected
  table name"` instead of the old `"Parser error: expected table
- name"`) — the position and the `"Parser error"` prefix are now
  supplied once, centrally, inside `expect`/`expectKeyword` themselves,
  rather than repeated in every one of `parseSelect`'s five separate
  calls.

### CS Lens

This is a small but real instance of **centralizing cross-cutting
behavior**: instead of every call site individually formatting its own
positioned error message, one shared place (`expect`/`expectKeyword`)
does it once, consistently, for every caller. Also recognized in:
logging middleware that stamps every log line with a timestamp so
individual log calls don't have to; and the general software
engineering instinct to push a repeated concern (here, "where did this
happen") down into the few functions that already have the information
needed to answer it.

### SE Lens

The alternative — leaving each `expect`/`expectKeyword` call site
responsible for building its own full message, including position —
would work, but it would mean five separate places in `parseSelect`
alone independently reaching into `peek()` for position, each one a
chance to get the formatting slightly wrong or forget it entirely. This
project already flagged `peek()`'s own "unexpected end of input" error
as lacking a position (Level 2, Lesson 3) — an honest, still-open gap:
there's no token to report a position *from* when input runs out
entirely, and this lesson doesn't invent one. A future lesson could
address it by tracking the *last consumed* token's position as a
fallback; not done here, on purpose, rather than papered over silently.

### Commands

No new commands.

### Run It

```
$ g++ parser_position_demo.cpp sql/lexer.cpp sql/parser.cpp -o parser_position_demo -Wall
$ ./parser_position_demo
--- wrong keyword ---
Parser error at line 3, column 10: expected '='
--- missing table name ---
Parser error at line 1, column 15: expected table name
```

Two real, different failures — a three-line `WHERE id 1;` (missing the
`=`, error correctly pointing at line 3) and a single-line `SELECT *
FROM ;` (missing table name, error correctly pointing at the `;`'s own
column) — both reporting a precise, correct position, not just a
description of what went wrong.

And the full test suites, including the position-verifying test added
this lesson:

```
$ g++ sql/lexer_test.cpp sql/lexer.cpp -o lexer_test -Wall && ./lexer_test
testTokenizeSimpleSelect passed
testTokenizeNumberAndString passed
testTokenizeWhereEquals passed
testTokenizeUnexpectedCharacterThrows passed
testTokenizePositionsAreCorrect passed
All tests passed!

$ g++ sql/parser_test.cpp sql/parser.cpp sql/lexer.cpp -o parser_test -Wall && ./parser_test
testParseSelectWithoutWhere passed
testParseSelectWithWhere passed
testParseInsert passed
testParseInsertMissingCommaThrows passed
All tests passed!
```

Every pre-existing test from Lessons 2–4 still passes completely
unchanged — confirming this lesson's rework of `Token` and the parser's
error paths didn't alter any *behavior*, only what gets reported when
something fails.

### One Sentence Connecting This to What Came Before

The lexer learned to say where a problem was two units ago; this unit
is what finally let the parser, built on top of it, say the same thing.

---

## Closing

**Connect the pieces.** Follow `"SELECT *\nFROM students\nWHERE id
1;"` through this entire lesson: the lexer scans it character by
character, tracking `line`/`lineStart` (this lesson's first unit) →
every token gets stamped with its real position as it's produced,
including `WHERE` correctly landing on line 3 (second unit) → the
parser reaches `parseWhereClause`, calls `expect(EQUALS, "expected
'='")` after consuming `id`, and finds `1` instead of `=` → `expect`
pulls that mismatched token's `line`/`column` — `3`, `10` — directly
off the `Token` the lexer already stamped, and builds `"Parser error at
line 3, column 10: expected '='"` (third unit) — a message that, for
the first time in this project, would let a person editing a real
multi-line query jump straight to the actual mistake.

**What breaks without this.** Level 2 Lesson 2's original lexer error
format, for comparison — this exact same malformed input, run through
that earlier version, would have reported only:

```
Lexer error: unexpected character '#'
```

No line, no column — on a five-token, single-line statement, tolerable;
on a real multi-line query with several `WHERE` conditions, that
message alone gives no way to find the actual mistake without manually
counting through the text. This lesson's version, run on the same kind
of input, instead says exactly where — confirmed directly in this
lesson's own Run It sections above, not just claimed.

**Exercises.**
1. `peek()`'s "unexpected end of input" error, flagged as a known gap
   in this lesson's third unit, still has no position. Sketch (prose is
   fine) how `Parser` could track the *last consumed* token's position
   as a fallback for this specific case.
2. Write a test confirming a `WHERE` clause on line 2 of a multi-line
   statement produces a parser error whose reported line is `2`, not
   `1`.
3. The string-literal branch's newline handling (this lesson's second
   unit) was added specifically so a multi-line string doesn't
   desync position tracking for tokens after it. Write a test proving
   this: tokenize a string containing a `\n`, followed by another
   token, and confirm that following token's line number is correct.

**Definition of done.**
- [ ] `g++ sql/lexer_test.cpp sql/lexer.cpp -o lexer_test -Wall &&
      ./lexer_test` passes, including `testTokenizePositionsAreCorrect`.
- [ ] `g++ sql/parser_test.cpp sql/parser.cpp sql/lexer.cpp -o
      parser_test -Wall && ./parser_test` passes unchanged from
      Lesson 4.
- [ ] You can explain, without rereading the walkthrough, why
      `tokenLine`/`tokenColumn` are captured *before* the `isalpha`/
      `isdigit` branches' inner `while` loops run, not after.
- [ ] You've completed exercises 2 and 3 above.
- [ ] **Update `API_Reference.md`** — note that `Token` now carries
      `line`/`column`, and that every `Lexer`/`Parser` error message
      includes a position (except `peek()`'s end-of-input case, still
      flagged as a known gap).
- [ ] `git add sql/ API_Reference.md && git commit -m "Add line/column
      position to every Token, and thread it through every lexer and
      parser error

      Every existing test from Lessons 2-4 still passes unchanged --
      this lesson only changed what gets reported on failure, not any
      actual parsing behavior. peek()'s unexpected-end-of-input error
      still has no position -- flagged, not fixed, pending a
      last-consumed-token fallback."`
