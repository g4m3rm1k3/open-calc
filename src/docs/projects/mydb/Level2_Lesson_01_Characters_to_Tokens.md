# Level 2, Lesson 1: Characters to Tokens
*(`enum class`, Walking a String by Index, and the First Stage of a Real Pipeline)*

This is the pipeline this level builds, in full, established here for
the first time:

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

**This lesson builds the Lexer stage only** — turning raw SQL text into
a flat sequence of tokens. Nothing past that exists yet. Carried through
the one stage that does exist so far, the concrete value this lesson
ends on is:

```
"SELECT * FROM students;"
    → Lexer →
[KEYWORD "SELECT"] [STAR "*"] [KEYWORD "FROM"] [IDENTIFIER "students"] [SEMICOLON ";"]
```

**What you will build.** `mydb`'s command loop currently only
recognizes four fixed, hardcoded words — `insert`, `select`, `update`,
`remove`. Today starts replacing that with the real thing: a `Lexer`
that reads actual SQL text, character by character, and groups it into
a sequence of typed `Token`s — the mandatory first step before any of
that text can be understood as a query. This lesson handles exactly one
statement shape, `SELECT * FROM students;`, on purpose — a real lexer
that only understands one sentence, built completely, beats a lexer
that half-understands everything.

**What you need to know first.** All of Level 1 — `struct`, `class`,
`std::vector`, `std::string`, header/`.cpp` splits, and Lesson 6's
`assert`-based testing pattern, reused directly in this lesson's test
file. `storage/`'s frozen API is not touched at all today; `sql/` is a
brand-new, independent module.

---

## Concept Unit: Naming a Fixed Set of Kinds (`enum class`)

### The Problem

A lexer's whole output is a sequence of pieces, each one needing to say
*what kind* of thing it is — a keyword, an identifier, a symbol — before
anything downstream can make sense of it. `std::string` alone can't
express "kind" cheaply or safely: comparing `piece.text == "SELECT"`
everywhere a keyword-check is needed would work, but it's fragile (a
typo compiles silently) and slow to read. What's needed is a small,
fixed, named set of possible kinds — closed and checkable by the
compiler.

### Introduce the Concept in Isolation

Throwaway file, `enum_lab.cpp`:

```cpp
#include <iostream>

enum class Color {
    RED,
    GREEN,
    BLUE
};

int main() {
    Color c = Color::GREEN;
    if (c == Color::GREEN) {
        std::cout << "it's green";
    }
    return 0;
}
```

```
$ g++ enum_lab.cpp -o enum_lab
$ ./enum_lab
it's green
```

`c` was compared against `Color::GREEN` and matched — proof `Color` is
a real, comparable type with exactly three possible values, not a
string or a number standing in for one.

### Discard the Throwaway Example

`enum_lab.cpp` and `Color` are scratch work. The real project defines
`TokenType`, next.

### Project Change

- **Files affected:** `sql/token.h` — new file.
- **Change type:** create.
- **Location:** n/a — new file.
- **Dependencies:** none new.

### The New Code

```cpp
enum class TokenType {
    KEYWORD,
    IDENTIFIER,
    STAR,
    SEMICOLON
};
```

### The Updated Project

`sql/token.h`, in full — new file, nothing to return to yet:

```cpp
#pragma once
#include <string>

enum class TokenType {
    KEYWORD,
    IDENTIFIER,
    STAR,
    SEMICOLON
};

struct Token {
    TokenType type;
    std::string text;
};
```

`Token` pairs a `TokenType` with the literal text that produced it —
`{TokenType::KEYWORD, "SELECT"}` says both *what kind* of piece this is
and *exactly what it said*, which matters even for a fixed set of
keywords: the parser (a future lesson) will need the actual text to
distinguish `SELECT` from `FROM`, not just "this was some keyword."

### Mechanical Walkthrough
- `enum class TokenType` — reuses the exact shape from the lab (basic
  reuse) — four named values instead of three, otherwise identical.
- `KEYWORD, IDENTIFIER, STAR, SEMICOLON` — the four kinds this lesson's
  lexer will ever produce, chosen to match exactly `SELECT * FROM
  students;`'s five tokens (`SELECT` and `FROM` both being `KEYWORD`).
- This list is deliberately incomplete — no `NUMBER`, no `COMMA`, no `WHERE` — matching this lesson's one-statement-shape scope honestly.

- `struct Token { TokenType type; std::string text; };` — reuses
  `struct` (basic reuse, from Lesson 2), bundling the new `TokenType`
  with an already-familiar `std::string`.

### CS Lens

`enum class` gives you a **closed, named set of values** the compiler
itself enforces — you cannot accidentally construct a `TokenType` that
isn't one of the four listed. Also recognized in: Python's `Enum` class
(similar intent, more permissive at runtime); HTTP methods as a fixed
set (`GET`, `POST`, ...) rather than arbitrary strings; and the reason
every real lexer, in every language, represents token kinds this way
rather than as raw text.

### SE Lens

The alternative — comparing raw strings everywhere (`token == "SELECT"`)
— was explicitly rejected in this unit's Problem section, and it's
worth restating why concretely: a typo like `token == "SELCET"` compiles
and silently never matches, while `TokenType::SELCET` would be a
compile error, caught immediately rather than discovered by a confusing
runtime bug. The (small) cost: `TokenType` has to be extended by hand
every time a new kind of token is needed — `COMMA`, `NUMBER`, `WHERE`
all still to come — a maintenance point worth knowing about now.

### Commands

No new commands.

### Run It

Not runnable standalone — `TokenType`/`Token` are type definitions with
nothing using them yet. Connects into the next two units.

### One Sentence Connecting This to What Came Before

Level 1 ended with `struct Student` describing what a stored record is;
this unit is the same idea, one level up — describing what a piece of
SQL text is.

---

## Concept Unit: Walking a String One Character at a Time

### The Problem

Every C++ loop you've written so far — `while (getline(...))`,
range-based `for` — either reads a whole line at once or visits a whole
container's elements without needing to know *where* it is. Reading
SQL text character by character needs something neither of those gives
you: the actual numeric position in the string, so a piece of code can
decide, per character, "is this a letter, a space, or a symbol" and act
differently for each.

### Introduce the Concept in Isolation

Throwaway file, `walk_lab.cpp`:

```cpp
#include <iostream>
#include <cctype>
#include <string>

int main() {
    std::string text = "ab 12";
    for (size_t i = 0; i < text.size(); i++) {
        char c = text[i];
        if (std::isalpha(c)) {
            std::cout << c << " is alpha\n";
        } else if (std::isspace(c)) {
            std::cout << "(space)\n";
        } else {
            std::cout << c << " is other\n";
        }
    }
    return 0;
}
```

```
$ g++ walk_lab.cpp -o walk_lab
$ ./walk_lab
a is alpha
b is alpha
(space)
1 is other
2 is other
```

Five characters in `"ab 12"`, five classifications out, each one
correctly sorted into letter, space, or other — proof this loop shape
visits every character in order, by position, letting different logic
run for each one based on what it actually is.

### Discard the Throwaway Example

`walk_lab.cpp` is scratch work. The real lexer walks actual SQL text,
starting next unit.

### Project Change

*(Deferred — this unit's concept is applied directly inside the next
unit's `tokenize` function, since an index-based walk with nothing to
do at each position isn't yet a meaningful standalone project change.
This is the same situation Lesson 2 flagged explicitly: a concept
introduced in isolation, immediately followed by the unit that puts it
to real use.)*

### Mechanical Walkthrough
- `for (size_t i = 0; i < text.size(); i++)` — **first appearance** of
- an index-based `for` loop — the three-part form: start `i` at `0`,
  keep looping while `i < text.size()`, and increment `i` after each
  pass. This is the more powerful, more error-prone alternative to
  range-based `for` that Lesson 2's SE Lens flagged as "reached for only
  when a lesson actually needs an index" — this is that lesson.
- `size_t` — **first appearance** — an unsigned integer type used for
  sizes and indices throughout the standard library; `text.size()`
  returns this type, so `i` is declared to match.
- `text[i]` — **first appearance** of indexing into a `std::string` by
  position, mirroring `std::vector`'s `[0]` from Lesson 2's lab, applied
  here to characters instead of `Student`s.
- `std::isalpha(c)`, `std::isspace(c)` — **first appearance.** Character
  classification functions from `<cctype>`: `isalpha` reports whether a
  character is a letter, `isspace` whether it's whitespace (space, tab,
  newline). Both return true/false-like values usable directly as `if`
  conditions, the same shape as every condition since Lesson 1.

### CS Lens

This is **explicit index-based iteration** — visiting a sequence by
tracking position directly, rather than letting the loop construct
hide it, specifically because the *position itself* is needed, not just
each element in turn. Also recognized in: Python's `for i in
range(len(s))` (used exactly when Python code needs an index too, for
the same reason); scanning a byte buffer in any network protocol
parser; and — the connection worth holding — this is the literal
mechanism every real lexer in every real compiler uses to consume
source code, character by character, before anything about that code's
meaning can be understood.

### SE Lens

The alternative, range-based `for (char c : text)`, is exactly what
Lesson 2 already taught and would be strictly safer here — except it
cannot report *where* `c` is, and the next unit's job (accumulating
several characters into one word) genuinely needs to advance the
position itself, mid-loop, from inside the loop body — something
range-based `for` has no mechanism for at all. This is a real,
principled reason to reach for the less-safe tool, not a habit: the job
requires it.

### Commands

No new commands.

### Run It

See the lab's run above — this unit's concept is fully demonstrated
there; the real project applies it starting next unit.

### One Sentence Connecting This to What Came Before

The previous unit named what a token *is*; this unit is how the lexer
will actually walk across raw text to find where each one begins and
ends.

---

## Concept Unit: Grouping Characters Into Tokens (Assembling the Lexer)

### The Problem

Single characters aren't enough on their own: `*` and `;` are each one
character and a complete token by themselves, but `SELECT`, `FROM`, and
`students` are each *several* characters that need to be read together
as one token, not five separate ones. The lexer needs to notice "this
character starts a word," keep consuming characters while they're still
part of that word, and only then decide — is this word `SELECT` or
`FROM` (a keyword), or something else (an identifier, like a table
name)?

### Introduce the Concept in Isolation

Throwaway file, `word_lab.cpp`:

```cpp
#include <iostream>
#include <cctype>
#include <string>

int main() {
    std::string text = "abc 5";
    for (size_t i = 0; i < text.size(); i++) {
        if (std::isalpha(text[i])) {
            std::string word;
            while (i < text.size() && std::isalpha(text[i])) {
                word += text[i];
                i++;
            }
            i--;
            std::cout << "word: " << word << "\n";
        }
    }
    return 0;
}
```

```
$ g++ word_lab.cpp -o word_lab
$ ./word_lab
word: abc
```

Three letters, `a`, `b`, `c`, correctly accumulated into one word,
`"abc"` — and the loop correctly stopped consuming the moment it hit
the space, rather than continuing past it or crashing on `text[i]` once
`i` reached the end of the string.

### Discard the Throwaway Example

`word_lab.cpp` is scratch work. The real project assembles the full
lexer next, applying it to the actual target statement.

### Project Change

- **Files affected:** `sql/lexer.h` — new file. `sql/lexer.cpp` — new
  file.
- **Change type:** create.
- **Location:** n/a — new files.
- **Dependencies:** `sql/token.h`, from the first unit.

### The New Code

```cpp
if (std::isalpha(c)) {
    std::string word;
    while (i < sql.size() && std::isalpha(sql[i])) {
        word += sql[i];
        i++;
    }
    i--;

    if (word == "SELECT" || word == "FROM") {
        tokens.push_back({TokenType::KEYWORD, word});
    } else {
        tokens.push_back({TokenType::IDENTIFIER, word});
    }
    continue;
}
```

### The Updated Project

`sql/lexer.h`, in full — new file:

```cpp
#pragma once
#include <string>
#include <vector>
#include "token.h"

class Lexer {
public:
    std::vector<Token> tokenize(const std::string& sql);
};
```

`sql/lexer.cpp`, in full:

```cpp
#include "lexer.h"
#include <cctype>

std::vector<Token> Lexer::tokenize(const std::string& sql) {
    std::vector<Token> tokens;

    for (size_t i = 0; i < sql.size(); i++) {
        char c = sql[i];

        if (std::isspace(c)) {
            continue;
        }

        if (c == '*') {
            tokens.push_back({TokenType::STAR, "*"});
            continue;
        }

        if (c == ';') {
            tokens.push_back({TokenType::SEMICOLON, ";"});
            continue;
        }

        if (std::isalpha(c)) {                                  // ← new
            std::string word;                                      // ← new
            while (i < sql.size() && std::isalpha(sql[i])) {          // ← new
                word += sql[i];                                          // ← new
                i++;                                                        // ← new
            }                                                                // ← new
            i--;                                                               // ← new

            if (word == "SELECT" || word == "FROM") {                            // ← new
                tokens.push_back({TokenType::KEYWORD, word});                       // ← new
            } else {                                                                 // ← new
                tokens.push_back({TokenType::IDENTIFIER, word});                        // ← new
            }                                                                            // ← new
            continue;                                                                     // ← new
        }
    }

    return tokens;
}
```

`tokenize` now handles every character `SELECT * FROM students;` can
contain: whitespace is skipped entirely, `*` and `;` each become a
single-character token immediately, and any letter triggers the new
word-accumulation branch — which consumes every consecutive letter,
then decides, once the whole word is known, whether it's one of the two
recognized keywords or falls through as a plain identifier.

### Mechanical Walkthrough
- `for (size_t i = 0; i < sql.size(); i++)` and `char c = sql[i];` —
  reuse the index-based walk from the previous unit exactly (basic
  reuse at this point).
- `if (std::isspace(c)) { continue; }` — reuses `isspace` (previous
- unit) and `continue` (Lesson 5) — whitespace produces no token at
  all, it's simply skipped.
- `if (c == '*') { tokens.push_back(...); continue; }`,
- `if (c == ';') { ... }` — **first appearance** of a single-character literal, `'*'` and `';'` (single quotes — a `char`, not a

  `std::string`), compared directly against `c`. `tokens.push_back({...})`
  reuses `push_back` (Lesson 3) with a brace-initialized `Token` (reuses
  `struct` initialization, Lesson 2) built inline.
- `if (std::isalpha(c)) { ... }` — reuses `isalpha` (previous unit) as
  the entry condition for word accumulation.
- `std::string word;` then `while (i < sql.size() && std::isalpha(sql[i]))`
  — reuses the inner accumulation loop from the lab exactly, with one
- addition worth naming: `&&` — **first appearance** of the logical AND
  operator, combining two conditions ("still inside the string" *and*
  "still a letter") so the loop can never read `sql[i]` past the end of
  the string, which would otherwise happen the instant a word runs all
  the way to the string's final character.
- `word += sql[i];` — **first appearance** of `+=` on a `std::string` —
  appends one character to the end of `word`, building it up one letter
  per pass.
- `i--;` — **first appearance**, and the single most important line to
  understand correctly in this unit: the inner `while` loop already
  advanced `i` past every letter of the word, stopping on the first
  *non*-letter character (a space or `;`). Without stepping back one
  position here, the outer `for` loop's own `i++` would advance *past*
  that character too, silently skipping it entirely — proven concretely
  below.
- `if (word == "SELECT" || word == "FROM")` — reuses `==` string
- comparison (Lesson 6) and introduces `||` — **first appearance** of
  logical OR, `&&`'s sibling: true if *either* side is true. Together,
  this line is the entire (deliberately minimal) keyword list for this
  lesson.
- `continue;` at the end of the `isalpha` branch — reuses `continue`
  (Lesson 5), returning control to the top of the outer `for` loop for
  its next character.

### CS Lens

This whole function is a **lexer** (also called a *scanner* or
*tokenizer*): the first stage of nearly every language-processing
pipeline in existence, converting a flat stream of characters into a
flat stream of meaningfully-typed tokens, with no understanding yet of
how those tokens relate to each other (that's the parser's job, coming
next). Also recognized in: every real programming language's compiler
or interpreter (Python's own source starts here too), a CSV parser's
first pass identifying field boundaries before interpreting values, and
— directly, not just by analogy — this is the exact first stage
`mydb`'s own SQL support is now built on.

### SE Lens

The alternative to hand-writing this lexer would be a lexer-generator
tool (like `flex`), which takes a declarative description of token
patterns and generates this exact kind of code automatically — genuinely
the standard approach for large, real languages. Hand-writing it here is
a deliberate teaching choice: seeing the character-by-character
mechanics directly is what makes the *idea* of lexing concrete, rather
than a generated black box. The real cost being accepted, honestly: this
lexer's keyword list (`SELECT`, `FROM`) and symbol set (`*`, `;`) are
hardcoded and will need to grow by hand with every new SQL feature this
project adds — `WHERE`, `INSERT`, commas, string literals, numbers, all
still ahead.

### Commands

No new commands.

### Run It

Escalating from the smallest possible input up to the actual target
statement, confirming each step before trusting the next:

```
$ g++ escalate_demo.cpp sql/lexer.cpp -o escalate_demo
$ ./escalate_demo
";" -> 1 tokens: [;]
"SELECT" -> 1 tokens: [SELECT]
"SELECT *" -> 2 tokens: [SELECT] [*]
"SELECT * FROM students;" -> 5 tokens: [SELECT] [*] [FROM] [students] [;]
```

A single symbol, then a single keyword, then a keyword plus a symbol,
then the full statement — five tokens, in the right order, with the
right text — confirming the lexer handles the target input correctly
by building up to it rather than trusting it on the first try.

### One Sentence Connecting This to What Came Before

The previous two units built the *pieces* — what a token is, how to
walk text by position; this unit is where those pieces actually became
a working lexer, turning one real SQL statement into real tokens for
the first time in this project.

---

## Closing

**Connect the pieces.** Follow `"SELECT * FROM students;"` through the
whole pipeline diagram this lesson opened with: it enters `tokenize` as
raw text → the outer `for` loop walks it character by character (Unit
2) → `S` triggers the word-accumulation branch, which consumes
`SELECT` in full via the inner `while`, then steps back with `i--`
before checking it against the keyword list and producing
`{KEYWORD, "SELECT"}` (Unit 3) → the space is silently skipped → `*`
immediately becomes `{STAR, "*"}` → another space skipped → `FROM`
goes through the exact same word-accumulation path as `SELECT`, also
landing in `KEYWORD` → `students` goes through that same path, but
matches neither `"SELECT"` nor `"FROM"`, so it becomes `{IDENTIFIER,
"students"}` → `;` immediately becomes `{SEMICOLON, ";"}` → the
function returns all five, in order, as one `std::vector<Token>`. Every
`Token`'s `type` came from Unit 1's `enum class`; every character that
built one came from Unit 2's indexed walk; every decision about *where*
one token ends and the next begins came from Unit 3.

**What breaks without this.** Remove the `i--;` line and rerun the
exact same escalating sequence:

```
$ g++ escalate_demo.cpp sql/lexer.cpp -o escalate_broken
$ ./escalate_broken
";" -> 1 tokens: [;]
"SELECT" -> 1 tokens: [SELECT]
"SELECT *" -> 2 tokens: [SELECT] [*]
"SELECT * FROM students;" -> 4 tokens: [SELECT] [*] [FROM] [students]
```

Notice the semicolon is simply gone — not four tokens because of an
error, four because the `;` immediately following `students` with no
space was silently skipped: the inner `while` loop's own `i++` already
advanced `i` to sit exactly on `;`, and the outer loop's `i++`, with no
`i--` to counteract it, then stepped one past it before ever inspecting
it. A single missing decrement, and a real token vanishes with no error
at all. Restore `i--;` before continuing.

**Exercises.**
1. Add a fifth `TokenType`, `COMMA`, and handle `,` in `tokenize` the
   same way `*` and `;` are handled. Confirm `tokenize("a, b")`
   produces an `IDENTIFIER`, a `COMMA`, and an `IDENTIFIER`.
2. `tokenize` currently has no branch for a character that's none of
   whitespace, `*`, `;`, or a letter — a digit, for instance. Predict
   what happens if you call `tokenize("SELECT 5;")` right now (hint:
   look at what the `for` loop does with a character that matches
   *none* of its `if` branches), then run it and confirm.
3. The keyword check, `word == "SELECT" || word == "FROM"`, will
   silently treat a lowercase `select` as an `IDENTIFIER`, not a
   `KEYWORD`. Is that the right behavior for a real SQL lexer, or a gap
   worth flagging? (No fix required — just reason about it, the same
   way this lesson's SE Lens named other gaps honestly.)

**Definition of done.**
- [ ] `g++ sql/lexer_test.cpp sql/lexer.cpp -o lexer_test -Wall`
      compiles and passes.
- [ ] `./escalate_demo` (or equivalent) shows the correct token count
      and text for `"SELECT * FROM students;"`.
- [ ] You can explain, without rereading the walkthrough, exactly why
      `i--;` is needed after the inner `while` loop.
- [ ] You've completed exercise 1 above, and its test passes.
- [ ] **Update `API_Reference.md`** — add a new `sql/` section (the
      skeleton is already there, marked 🔴): document `Token`,
      `TokenType`, and `Lexer::tokenize`. Mark it 🟡 — this lexer only
      handles one statement shape; it'll keep growing over the next
      several lessons before freezing.
- [ ] Add this lesson's real test, `sql/lexer_test.cpp`, to
      `storage/table_test.cpp`'s neighbor pattern — same idea, new
      module: a standalone executable, never linked with `mydb.cpp`.
- [ ] `git add sql/ API_Reference.md && git commit -m "Add a lexer for
      one SQL statement shape: SELECT * FROM students;

      This is the first stage of sql/'s pipeline (text -> tokens).
      Handles exactly one statement on purpose — keywords are
      hardcoded to SELECT/FROM only, and there's no branch yet for
      digits, commas, or anything past this lesson's scope. Parsing
      those tokens into a tree is next."`
