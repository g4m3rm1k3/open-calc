# Level 2, Lesson 2: Growing the Lexer
*(Numbers, Quoted Strings, and Refusing to Guess)*

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

**This lesson stays entirely in the Lexer stage**, widening it from one
statement shape to everything Level 2's next few lessons will need.
Carried through, the concrete value this lesson ends on is:

```
"INSERT INTO students VALUES (1, 'Alice', 20);"
    → Lexer →
[KEYWORD "INSERT"] [KEYWORD "INTO"] [IDENTIFIER "students"] [KEYWORD "VALUES"]
[LPAREN "("] [NUMBER "1"] [COMMA ","] [STRING "Alice"] [COMMA ","]
[NUMBER "20"] [RPAREN ")"] [SEMICOLON ";"]
```

**What you will build.** Lesson 1's lexer only ever produced four kinds
of token, only recognized two keywords, and — as Lesson 1's own second
exercise surfaced — silently ignored any character it didn't recognize,
including every digit. Today `Lexer` gains `NUMBER` and `STRING` tokens,
four new single-character symbols (`,`, `=`, `(`, `)`), four more
keywords (`WHERE`, `INSERT`, `INTO`, `VALUES`), and — the fix for that
silent gap — a real, thrown error the moment it meets a character it
genuinely can't classify.

**What you need to know first.** Level 2, Lesson 1 in full —
`TokenType`, `Token`, the index-based walk, and the word-accumulation
pattern (`isalpha` + inner `while` + `i--`). Today's first unit reuses
that exact pattern with one character class swapped out; the rest is
new.

---

## Concept Unit: Numbers as Their Own Kind of Token

### The Problem

`INSERT INTO students VALUES (1, 'Alice', 20);` needs `1` and `20`
recognized as actual numeric values, not swallowed silently the way
Lesson 1's lexer currently would (`isalpha` doesn't match a digit, and
nothing else does either — the character is just skipped, invisibly).
A real `NUMBER` token is needed, and — this is the part worth noticing
before writing any code — the *shape* of the fix is already familiar:
accumulate consecutive matching characters, the same way `SELECT` got
accumulated letter by letter in Lesson 1.

### Introduce the Concept in Isolation

Throwaway file, `number_lab.cpp`:

```cpp
#include <iostream>
#include <cctype>
#include <string>

int main() {
    std::string text = "42 abc";
    for (size_t i = 0; i < text.size(); i++) {
        if (std::isdigit(text[i])) {
            std::string number;
            while (i < text.size() && std::isdigit(text[i])) {
                number += text[i];
                i++;
            }
            i--;
            std::cout << "number: " << number << "\n";
        }
    }
    return 0;
}
```

```
$ g++ number_lab.cpp -o number_lab
$ ./number_lab
number: 42
```

`"42 abc"` correctly produced one number, `"42"`, and stopped exactly
at the space — not consuming `abc` at all, since this loop only reacts
to digits — proof the pattern generalizes cleanly to a different
character class.

### Discard the Throwaway Example

`number_lab.cpp` is scratch work. The real lexer gains this branch
next, alongside several smaller, already-familiar additions at the same
time.

### Project Change

- **Files affected:** `sql/token.h` — modified. `sql/lexer.h` —
  unchanged. `sql/lexer.cpp` — modified.
- **Change type:** add.
- **Location:** in `token.h`, six new values added to `TokenType`. In
  `lexer.cpp`'s `tokenize`, four new single-character branches are
  added alongside the existing `*`/`;` checks, the keyword list grows
  by four words, and a new `isdigit` branch is added after the
  `isalpha` branch.
- **Dependencies:** none new.

### The New Code

```cpp
if (std::isdigit(c)) {
    std::string number;
    while (i < sql.size() && std::isdigit(sql[i])) {
        number += sql[i];
        i++;
    }
    i--;
    tokens.push_back({TokenType::NUMBER, number});
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
    NUMBER,      // ← new
    STRING,      // ← new
    COMMA,       // ← new
    EQUALS,      // ← new
    LPAREN,      // ← new
    RPAREN       // ← new
};

struct Token {
    TokenType type;
    std::string text;
};
```

`sql/lexer.cpp`'s `tokenize`, in full (the `NUMBER` branch is this
unit's real new material; the four single-character additions and the
grown keyword list are reused mechanism, called out plainly in the
walkthrough below rather than treated as their own units):

```cpp
#include "lexer.h"
#include <cctype>
#include <stdexcept>

std::vector<Token> Lexer::tokenize(const std::string& sql) {
    std::vector<Token> tokens;

    for (size_t i = 0; i < sql.size(); i++) {
        char c = sql[i];

        if (std::isspace(c)) {
            continue;
        }

        if (c == '*') { tokens.push_back({TokenType::STAR, "*"}); continue; }
        if (c == ';') { tokens.push_back({TokenType::SEMICOLON, ";"}); continue; }
        if (c == ',') { tokens.push_back({TokenType::COMMA, ","}); continue; }        // ← new
        if (c == '=') { tokens.push_back({TokenType::EQUALS, "="}); continue; }        // ← new
        if (c == '(') { tokens.push_back({TokenType::LPAREN, "("}); continue; }         // ← new
        if (c == ')') { tokens.push_back({TokenType::RPAREN, ")"}); continue; }           // ← new

        if (std::isalpha(c)) {
            std::string word;
            while (i < sql.size() && std::isalpha(sql[i])) {
                word += sql[i];
                i++;
            }
            i--;

            if (word == "SELECT" || word == "FROM" || word == "WHERE" ||     // ← changed
                word == "INSERT" || word == "INTO" || word == "VALUES") {     // ← changed
                tokens.push_back({TokenType::KEYWORD, word});
            } else {
                tokens.push_back({TokenType::IDENTIFIER, word});
            }
            continue;
        }

        if (std::isdigit(c)) {                                    // ← new
            std::string number;                                      // ← new
            while (i < sql.size() && std::isdigit(sql[i])) {             // ← new
                number += sql[i];                                          // ← new
                i++;                                                          // ← new
            }                                                                    // ← new
            i--;                                                                    // ← new
            tokens.push_back({TokenType::NUMBER, number});                            // ← new
            continue;                                                                    // ← new
        }
    }

    return tokens;
}
```

`tokenize` now recognizes six kinds of standalone symbol (up from two),
six keywords (up from two), and a genuine `NUMBER` branch sitting right
alongside the `IDENTIFIER`/`KEYWORD` branch it was modeled on — still
missing quoted strings and still silently dropping anything else,
both addressed in the next two units.

### Mechanical Walkthrough
- `NUMBER`, `STRING`, `COMMA`, `EQUALS`, `LPAREN`, `RPAREN` in
- `TokenType` — reuse `enum class` member declarations exactly (Level 2
  Lesson 1) — six more named values, same mechanism.
- `if (c == ',') { ... }`, `if (c == '=') { ... }`, `if (c == '(')
- { ... }`, `if (c == ')') { ... }` — **a hard concept reappearing**
  (per the Repetition Rule): each is the identical single-character
- token pattern Lesson 1 already fully explained for `*` and `;` — new
  characters, zero new mechanism, not owed individual re-explanation.
- `word == "WHERE"`, `word == "INSERT"`, `word == "INTO"`, `word ==
- "VALUES"` added to the `||` chain — reuses `||` and `==` exactly
  (Lesson 1) — the keyword *list* grew; the *mechanism* checking
  membership in it did not change at all.
- `if (std::isdigit(c))` — **first appearance** of `isdigit` from
- `<cctype>`, a sibling of `isalpha`/`isspace` (Lesson 1) — reports
  whether a character is a digit `0`–`9`.
- The body of the `isdigit` branch — **a hard concept reappearing**:
  structurally identical to the `isalpha` word-accumulation branch
  (accumulate matching characters into a string, step back with `i--`
  for the exact same reason Lesson 1 explained in full), with one
  difference worth naming: there's no keyword check afterward — every
  sequence of digits unconditionally becomes a `NUMBER`, since there's
  no such thing as a "reserved number."

### CS Lens

This unit's real content is less about digits specifically and more
about **pattern reuse in a lexer**: once "accumulate matching
characters, then classify the result" exists for letters, extending it
to digits is small, mechanical, additive work — exactly the shape real
lexers grow in, one character class or symbol at a time, rather than
being rewritten from scratch as a language's grammar expands.

### SE Lens

Worth flagging honestly: this `NUMBER` token stores its value as
`std::string`, not as an actual `int` — `"42"`, not `42`. That's
deliberate, not an oversight: converting to a real number is the
*parser's* job (an upcoming lesson), which will need to build an AST
node carrying a typed value; the lexer's only responsibility is
correctly identifying *where* a number is and what characters it's made
of. Handing back an already-parsed `int` here would blur that
boundary — a small instance of the same interface/implementation
separation Level 1's Lesson 4 built `storage/` around.

### Commands

No new commands.

### Run It

```
$ g++ escalate_demo.cpp sql/lexer.cpp -o escalate_demo
$ ./escalate_demo
"42" -> 1 tokens: [42]
```

One digit sequence, correctly tokenized as a standalone `NUMBER` —
confirmed before moving on to the unit that lets strings and full
statements through too.

### One Sentence Connecting This to What Came Before

Lesson 1 built the accumulate-and-classify pattern once, for letters;
this unit is the first proof that the pattern itself, not just the code
that happened to use it, is what actually generalizes.

---

## Concept Unit: Text Inside Quotes (`STRING`)

### The Problem

`'Alice'` needs to become one `STRING` token holding `Alice` — not
`Alice` with the quote marks still attached, and not five separate
letter tokens the way an un-quoted word would be lexed. This is
genuinely different from every previous branch: a quoted string's
*delimiters* (the two `'` characters) are meaningful and must be
detected, but they're not part of the *value* itself — they need to be
consumed without ending up inside the token's text.

### Introduce the Concept in Isolation

Throwaway file, `string_lab.cpp`:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string text = "'Alice' rest";
    for (size_t i = 0; i < text.size(); i++) {
        if (text[i] == '\'') {
            std::string value;
            i++;
            while (i < text.size() && text[i] != '\'') {
                value += text[i];
                i++;
            }
            std::cout << "string: " << value << "\n";
        }
    }
    return 0;
}
```

```
$ g++ string_lab.cpp -o string_lab
$ ./string_lab
string: Alice
```

`value` holds exactly `Alice`, with neither quote mark present — proof
the opening quote was detected and skipped, the closing quote correctly
stopped accumulation, and neither one leaked into the stored text.

### Discard the Throwaway Example

`string_lab.cpp` is scratch work. The real lexer gains this branch
next.

### Project Change

- **Files affected:** `sql/lexer.cpp` — modified.
- **Change type:** add.
- **Location:** a new branch added after the `isdigit` branch, before
  the final fallback this lesson's next unit adds.
- **Dependencies:** none new.

### The New Code

```cpp
if (c == '\'') {
    std::string value;
    i++;
    while (i < sql.size() && sql[i] != '\'') {
        value += sql[i];
        i++;
    }
    tokens.push_back({TokenType::STRING, value});
    continue;
}
```

### The Updated Project

`sql/lexer.cpp`'s `tokenize`, with the new branch added (everything
above it unchanged from the previous unit):

```cpp
        if (std::isdigit(c)) {
            std::string number;
            while (i < sql.size() && std::isdigit(sql[i])) {
                number += sql[i];
                i++;
            }
            i--;
            tokens.push_back({TokenType::NUMBER, number});
            continue;
        }

        if (c == '\'') {                                          // ← new
            std::string value;                                       // ← new
            i++;                                                        // ← new
            while (i < sql.size() && sql[i] != '\'') {                    // ← new
                value += sql[i];                                            // ← new
                i++;                                                          // ← new
            }                                                                   // ← new
            tokens.push_back({TokenType::STRING, value});                          // ← new
            continue;                                                                // ← new
        }
    }

    return tokens;
}
```

`tokenize` can now correctly turn `'Alice'` into `{STRING, "Alice"}` —
the last piece needed, alongside `NUMBER`, `COMMA`, and `LPAREN`/
`RPAREN`, to fully tokenize `INSERT INTO students VALUES (1, 'Alice',
20);`, this lesson's opening target statement.

### Mechanical Walkthrough
- `if (c == '\'')` — **first appearance.** `'\''` is an *escaped*
  character literal: a single quote, written this way because a bare
- `'''` would be ambiguous — the backslash tells the compiler "the next
  character is the literal value, not the closing delimiter."
- `i++;` immediately after entering the branch — **first appearance**
  of a deliberate, unconditional skip: this specifically advances `i`
  past the opening quote itself, so the accumulation loop below never
  sees it.
- `while (i < sql.size() && sql[i] != '\'')` — reuses the bounded-loop
  shape from word/number accumulation (basic reuse of the pattern), but
  with a genuinely different stop condition: *any* character until the
  *next* quote, rather than "while still matching one character class."
  This is what lets a string hold spaces, digits, anything — everything
  between the quotes, unlike identifiers or numbers.
- Note what's *absent* here compared to the two previous accumulation
  branches: no `i--` afterward. Worth reasoning through explicitly,
  since getting it wrong is an easy, subtle bug: the `while` loop stops
- with `i` sitting exactly *on* the closing quote — a character that
  needs to be consumed, not reprocessed. The outer `for` loop's own
  `i++` does exactly that, advancing past the closing quote correctly.
  Word and number accumulation needed `i--` because their loops stop
  one position *past* the last matching character, on a character that
  still needs handling; this loop stops *on* a character (the closing
  quote) that's already fully handled — different reason to stop,
  different correct action afterward.

### CS Lens

This is **delimiter-based scanning**, distinct from the
character-class-based scanning of word/number accumulation: instead of
"keep going while this kind of character," it's "keep going until this
specific character." Also recognized in: parsing anything between
matching brackets, HTML/XML tag content between `<tag>` and `</tag>`,
and — a gap worth naming rather than solving — real SQL string literals
also need to handle an *escaped* quote inside the string itself (e.g.
`'O''Brien'`), which this lexer does not yet support.

### SE Lens

The alternative — not skipping the opening quote, and including both
quote marks in `value` — would work, technically, but would leak a
storage-format detail (how strings happen to be delimited in SQL text)
into every piece of code downstream that ever reads a `STRING` token's
text, forcing all of them to strip the quotes themselves, repeatedly.
Stripping delimiters here, once, at the lexer boundary, is the same
principle Level 1's `storage/` module was built around: each stage
should hand the next stage clean, meaningful data, not raw formatting
details for every consumer to redo independently.

### Commands

No new commands.

### Run It

```
$ g++ escalate_demo.cpp sql/lexer.cpp -o escalate_demo
$ ./escalate_demo
"'Alice'" -> 1 tokens: [Alice]
```

One quoted string in, one clean `STRING` token out, quote marks
correctly stripped — confirmed before assembling the full target
statement.

### One Sentence Connecting This to What Came Before

The previous unit proved the accumulation pattern generalizes to a new
character class; this unit is the first time this lexer needed a
genuinely different stopping rule, and got it right for a different
reason than before.

---

## Concept Unit: Refusing to Guess (A Real Lexer Error)

### The Problem

Right now, any character that isn't whitespace, one of the six known
symbols, a letter, a digit, or a quote — a stray `#`, for instance —
falls through every `if` in `tokenize` and is silently, invisibly
skipped, exactly as Lesson 1's second exercise predicted. A lexer that
quietly drops characters it doesn't understand is worse than one that
crashes: it produces a token stream that looks complete but secretly
isn't, and nothing downstream would ever know the input was malformed.

### Introduce the Concept in Isolation

Throwaway file, `error_lab.cpp`:

```cpp
#include <iostream>
#include <stdexcept>
#include <string>

void checkChar(char c) {
    if (c == '#') {
        throw std::runtime_error(std::string("Lexer error: unexpected character '") + c + "'");
    }
    std::cout << "ok: " << c;
}

int main() {
    try {
        checkChar('#');
    } catch (const std::runtime_error& e) {
        std::cout << "caught: " << e.what();
    }
    return 0;
}
```

```
$ g++ error_lab.cpp -o error_lab
$ ./error_lab
caught: Lexer error: unexpected character '#'
```

The thrown message names the exact offending character — proof this
isn't just a generic crash, but a specific, informative failure a
caller (or a person reading the error) can act on.

### Discard the Throwaway Example

`error_lab.cpp` is scratch work. The real lexer's fallback case gets
this exact treatment next.

### Project Change

- **Files affected:** `sql/lexer.cpp` — modified.
- **Change type:** add.
- **Location:** the very end of the `for` loop's body, after every
  other `if` branch — this is the fallback reached only when none of
  them matched.
- **Dependencies:** `<stdexcept>`, reused from Level 1 Lesson 5.

### The New Code

```cpp
throw std::runtime_error(std::string("Lexer error: unexpected character '") + c + "'");
```

### The Updated Project

`sql/lexer.cpp`, in full:

```cpp
#include "lexer.h"
#include <cctype>
#include <stdexcept>

std::vector<Token> Lexer::tokenize(const std::string& sql) {
    std::vector<Token> tokens;

    for (size_t i = 0; i < sql.size(); i++) {
        char c = sql[i];

        if (std::isspace(c)) {
            continue;
        }

        if (c == '*') { tokens.push_back({TokenType::STAR, "*"}); continue; }
        if (c == ';') { tokens.push_back({TokenType::SEMICOLON, ";"}); continue; }
        if (c == ',') { tokens.push_back({TokenType::COMMA, ","}); continue; }
        if (c == '=') { tokens.push_back({TokenType::EQUALS, "="}); continue; }
        if (c == '(') { tokens.push_back({TokenType::LPAREN, "("}); continue; }
        if (c == ')') { tokens.push_back({TokenType::RPAREN, ")"}); continue; }

        if (std::isalpha(c)) {
            std::string word;
            while (i < sql.size() && std::isalpha(sql[i])) {
                word += sql[i];
                i++;
            }
            i--;

            if (word == "SELECT" || word == "FROM" || word == "WHERE" ||
                word == "INSERT" || word == "INTO" || word == "VALUES") {
                tokens.push_back({TokenType::KEYWORD, word});
            } else {
                tokens.push_back({TokenType::IDENTIFIER, word});
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
            tokens.push_back({TokenType::NUMBER, number});
            continue;
        }

        if (c == '\'') {
            std::string value;
            i++;
            while (i < sql.size() && sql[i] != '\'') {
                value += sql[i];
                i++;
            }
            tokens.push_back({TokenType::STRING, value});
            continue;
        }

        throw std::runtime_error(std::string("Lexer error: unexpected character '") + c + "'");  // ← new
    }

    return tokens;
}
```

`tokenize` now has no silent path left at all: every character either
matches one of the recognized branches and produces (or correctly
contributes to) a token, or the function throws immediately, naming the
exact character that defeated it.

### Mechanical Walkthrough
- `throw std::runtime_error(...)` — **a hard concept reappearing**
  (per the Repetition Rule): the exact mechanism Level 1 Lesson 5 built
  for `Table::update`/`remove`, reused here for a completely different
- kind of failure — proof `throw`/`catch` is a general-purpose tool,
  not something specific to storage.
- `std::string("Lexer error: unexpected character '") + c + "'"` —
  reuses `std::string` construction from a literal and `+` concatenation
  (Level 1 Lesson 5), with one new detail: `+ c` appends a single
  `char` directly onto a `std::string`, which works the same way `+=`
  did with individual characters during accumulation, just using `+`
  to build a brand-new string instead of extending an existing one.

### CS Lens

This is a **lexer error** — the first stage at which malformed input
can be rejected, as early and as specifically as possible, rather than
producing a token stream a later stage would have to somehow detect was
already wrong. Also recognized in: every real compiler's "unexpected
character" or "unexpected token" diagnostics, which are always
lexer-stage or parser-stage errors, never silent; and the general
principle — fail as close as possible to the actual mistake, with as
much specific information as possible — that Level 2's later lessons
will extend with actual line/column reporting.

### SE Lens

The alternative — what this lexer did through the start of this
lesson — silently continues past bad input, which sounds more
"forgiving" but is strictly worse: a caller has no way to distinguish
"this SQL was valid" from "this SQL had a typo the lexer happened to
shrug off." Throwing immediately is a deliberate, harder failure mode,
chosen specifically because a database silently misinterpreting a
malformed query is far more dangerous than one that refuses to run it
at all. The cost, honest and still open: this error message reports
*which character*, but not *where* — no line or column number yet.
Real error location reporting is planned explicitly as its own future
lesson (Level 2, Lesson 7) rather than solved as an afterthought here.

### Commands

No new commands.

### Run It

```
$ g++ escalate_demo.cpp sql/lexer.cpp -o escalate_demo
$ ./escalate_demo
"SELECT * FROM students WHERE id = 1;" -> 9 tokens: [SELECT] [*] [FROM] [students] [WHERE] [id] [=] [1] [;]
"INSERT INTO students VALUES (1, 'Alice', 20);" -> 12 tokens: [INSERT] [INTO] [students] [VALUES] [(] [1] [,] [Alice] [,] [20] [)] [;]
"SELECT # FROM students;" -> ERROR: Lexer error: unexpected character '#'
```

Both real target statements tokenize completely and correctly, and the
deliberately invalid one is caught immediately with a specific message
— all three outcomes confirmed together, not just the happy path.

### One Sentence Connecting This to What Came Before

Every unit in this lesson taught the lexer to recognize one more thing
correctly; this unit is what makes it equally honest about the things
it still can't.

---

## Closing

**Connect the pieces.** Follow `INSERT INTO students VALUES (1,
'Alice', 20);` through this lesson's three units at once:
`INSERT`/`INTO`/`VALUES` each go through the same word-accumulation
path Lesson 1 built, now matching a longer keyword list (this lesson's
first unit's reused-mechanism note) → `students` goes through that
identical path and falls through to `IDENTIFIER`, exactly as before →
`(` and `)` each become single-character tokens via this lesson's
trivial-reuse additions → `1` and `20` are each caught by the new
`isdigit` branch (Unit 1) → `'Alice'` is caught by the new quote branch,
its delimiters stripped (Unit 2) → `,` becomes `COMMA` twice → `;`
closes it out. Twelve tokens, every one correctly classified — and if
any single character in that statement had instead been something like
`#`, the whole call would have thrown immediately (Unit 3) rather than
silently producing a shorter, wrong token list.

**What breaks without this.** This lesson's very first Problem section
already described the "what breaks" case directly: Lesson 1's lexer,
unmodified, silently dropped every digit and every quote character with
no error at all — confirmed concretely in this lesson's own Unit 3 Run
It section, where the *old* behavior (no final `throw`) would have
made `"SELECT # FROM students;"` return some token list instead of
failing loudly. Nothing further to break on purpose here; this lesson's
whole point was fixing that exact gap.

**Exercises.**
1. Add `AND` and `OR` to the keyword list — Level 2's upcoming `WHERE`
   clause parsing will need compound conditions like `WHERE id = 1 AND
   age = 20`.
2. Add a `LESS_THAN` token for `<`, following the exact single-character
   pattern this lesson reused four times already.
3. This lexer's `STRING` branch has a real gap, flagged in its CS Lens:
   an unterminated string (`'Alice` with no closing quote) currently
   runs to the end of the input and returns whatever it collected, with
   no error — unlike every other malformed input this lesson just
   taught the lexer to reject. Predict what `tokenize("'Alice")`
   returns right now, confirm it, then explain (no fix required) why
   this deserves the same `throw` treatment Unit 3 gave unrecognized
   characters.

**Definition of done.**
- [ ] `g++ sql/lexer_test.cpp sql/lexer.cpp -o lexer_test -Wall`
      compiles and passes, including a test that a thrown error
      actually happens for `"SELECT # FROM students;"`.
- [ ] `./escalate_demo` (or equivalent) correctly tokenizes both
      `SELECT * FROM students WHERE id = 1;` and `INSERT INTO students
      VALUES (1, 'Alice', 20);`, and correctly errors on `SELECT #
      FROM students;`.
- [ ] You can explain, without rereading the walkthrough, why the
      `STRING` branch needs no `i--` while the `NUMBER` branch does.
- [ ] You've completed exercises 1 and 2 above, with tests for both.
- [ ] **Update `API_Reference.md`** — `sql/`'s `TokenType` list grew;
      update the code block to match, and note the lexer now throws
      `std::runtime_error` on an unrecognized character. Still 🟡 —
      no `WHERE`-clause parsing exists yet, and the unterminated-string
      gap from exercise 3 is still open.
- [ ] `git add sql/ API_Reference.md && git commit -m "Grow the lexer:
      NUMBER, STRING, comma/equals/parens, four more keywords, and a
      real thrown error on unrecognized input

      Closes the silent-skip gap flagged in Level 2 Lesson 1's
      exercises. The lexer can now fully tokenize both target
      statements for this level's next few lessons. Known gap: an
      unterminated string literal still doesn't error."`
