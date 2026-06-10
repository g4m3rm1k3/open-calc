# Lisp-CPP — LAB 05 — Lexer: Turning Characters Into Tokens

**Prerequisites:** LAB-04 complete. You have Token, std::vector, functions, and pass-by-reference.

**What this lab adds:**
- A complete `tokenize()` function that reads a source string and returns a `std::vector<Token>`
- Finite State Machine — the pattern that drives the lexer
- Character classification — how to decide what kind of character you are reading
- Include guards — how to split code across multiple files for the first time

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The source string `"(+ 12 foo)"` contains 10 characters. How many tokens does it contain?
> 2. Reading character by character, how do you know when a multi-character token like `"12"` or `"foo"` ends?
> 3. What should the lexer do with spaces and newlines?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

tokenize("(+ 1 2)"):
  Token { type: LPAREN,  value: "("  }
  Token { type: SYMBOL,  value: "+"  }
  Token { type: NUMBER,  value: "1"  }
  Token { type: NUMBER,  value: "2"  }
  Token { type: RPAREN,  value: ")"  }

tokenize("(define x 42)"):
  Token { type: LPAREN,  value: "("      }
  Token { type: SYMBOL,  value: "define" }
  Token { type: SYMBOL,  value: "x"      }
  Token { type: NUMBER,  value: "42"     }
  Token { type: RPAREN,  value: ")"      }

tokenize("(if #t 1 0)"):
  Token { type: LPAREN,  value: "("  }
  Token { type: SYMBOL,  value: "if" }
  Token { type: BOOLEAN, value: "#t" }
  Token { type: NUMBER,  value: "1"  }
  Token { type: NUMBER,  value: "0"  }
  Token { type: RPAREN,  value: ")"  }
```

---

## Concept: What a Lexer Does

**What it is:** A lexer (also called a scanner or tokenizer) reads a stream of
characters and groups them into tokens — the smallest meaningful units of the language.

**The problem without it:**

The parser needs to work with meaningful units, not individual characters.
If the parser received characters one at a time, it would need to remember
whether `1`, `2` are one token `"12"` or two tokens `"1"` `"2"`. It would need
to skip spaces everywhere. Every rule in the parser would be entangled with
character-level concerns.

The lexer separates concerns: it handles the character-level detail so the
parser works with clean tokens. This is the classic separation of lexical
analysis from syntactic analysis.

**What the lexer ignores:**

- Whitespace (spaces, tabs, newlines) — separators between tokens, discarded
- Comments — in Lisp, `;` to end of line is a comment, ignored

**What the lexer produces:**

One token per meaningful unit:
```
Source: "(+ 12 foo)"
         ^           → LPAREN  "("
          ^          → SYMBOL  "+"
           ^^        → (space — skip)
            ^^       → NUMBER  "12"
              ^      → (space — skip)
               ^^^   → SYMBOL  "foo"
                  ^  → RPAREN  ")"
```

**Transfer:** Every language implementation starts with a lexer. Python's tokenize
module, JavaScript's parser, the C preprocessor — all have a lexer as the first
stage. LLVM's lexer is called a "lexer." GCC's is called a "scanner." The names
vary; the job is always the same: characters in, tokens out.

---

## Concept: Finite State Machine

**What it is:** A Finite State Machine (FSM) is a system that can be in exactly
one of a finite set of states at any time, and transitions between states based
on input.

**Why lexers use FSMs:**

When reading `"12abc"`:
- You read `'1'` — you are now reading a number
- You read `'2'` — still reading a number (stay in same state)
- You read `'a'` — a letter after digits: the number ended, a symbol began
- You read `'b'`, `'c'` — still reading a symbol

Your current state tells you what to do with the next character. Without a state,
you would need complex nested conditions to track "am I in a number or a symbol?"

**The lexer's states:**

```
States:
  START    — between tokens, ready for the next one
  IN_NUM   — reading digits of a number
  IN_SYM   — reading characters of a symbol/keyword

Transitions:
  START  + digit    → IN_NUM  (start collecting number)
  START  + letter   → IN_SYM  (start collecting symbol)
  START  + '('      → emit LPAREN, stay START
  START  + ')'      → emit RPAREN, stay START
  START  + '#'      → read next char, emit BOOLEAN, stay START
  START  + space    → stay START (skip whitespace)
  IN_NUM + digit    → stay IN_NUM (continue number)
  IN_NUM + non-digit → emit NUMBER, go to START, re-process current char
  IN_SYM + alphanumeric/symbol-char → stay IN_SYM
  IN_SYM + other   → emit SYMBOL, go to START, re-process current char
```

**The "re-process" step:**

When you are in `IN_NUM` and read a space, you know the number ended. But you
have already consumed the space character. In a simple loop, you advance the
index. For "re-process," you do NOT advance — you let the outer loop see the
same character again from the `START` state.

**Transfer:** FSMs are everywhere: network protocol parsers, regex engines,
tokenizers, compiler front-ends, UI state managers, game state machines.
Any system with a fixed set of modes and rule-based transitions is an FSM.
The Rust `nom` parser combinator library is built on FSM theory.

---

## Concept: Character Classification

**What it is:** Functions that answer "what category does this character belong to?"

**The standard library functions in `<cctype>`:**

```cpp
#include <cctype>   // provides character classification functions

isdigit(ch)   // true if ch is '0'–'9'
isalpha(ch)   // true if ch is 'a'–'z' or 'A'–'Z'
isalnum(ch)   // true if isdigit(ch) || isalpha(ch)
isspace(ch)   // true if ch is space, tab, newline, carriage return, form feed
ispunct(ch)   // true if ch is punctuation (!, @, #, etc.)
isupper(ch)   // true if ch is 'A'–'Z'
islower(ch)   // true if ch is 'a'–'z'
```

**What these functions take:** `int`, not `char`. The parameter type is `int`
because the functions also accept `EOF` (-1). Pass `(unsigned char)ch` to
avoid undefined behavior when `ch` is negative (some char types are signed):

```cpp
if (isdigit((unsigned char)ch)) { ... }
```

**Custom classifier for Lisp symbol characters:**

Lisp symbols can contain letters, digits, and many punctuation characters:
`+`, `-`, `*`, `/`, `=`, `<`, `>`, `?`, `!`, `_`. We need a custom classifier:

```cpp
// Returns true if ch can appear in a Lisp symbol name.
// Lisp is permissive: +, -, *, /, =, <, >, ?, !, _ are all valid symbol chars.
bool is_symbol_char(char ch) {
    return isalnum((unsigned char)ch)
        || ch == '+' || ch == '-' || ch == '*' || ch == '/'
        || ch == '=' || ch == '<' || ch == '>' || ch == '?'
        || ch == '!' || ch == '_';
}
```

---

## Concept: Splitting Code Into Files — Include Guards

**What it is:** As the project grows, all code in `main.cpp` becomes unmanageable.
We split declarations into header files (`.h`) and definitions into source files (`.cpp`).

**The three-file pattern:**

```
lexer.h    — declares the public interface (what callers need to know)
lexer.cpp  — defines the implementation (how it works)
main.cpp   — includes lexer.h and calls tokenize()
```

**Why you cannot just `#include "lexer.cpp"`:**

If you include a `.cpp` file and it is also compiled separately, the linker
sees two definitions of every function — a "multiple definition" error.
Header files contain only **declarations** (signatures, type definitions) —
no function bodies. Source files contain **definitions** (the actual code).

**Include guards — preventing double inclusion:**

If `a.h` includes `b.h`, and `main.cpp` includes both `a.h` and `b.h`, then
after preprocessing `b.h` appears twice in `main.cpp`. If `b.h` contains a
`struct Token` definition, the compiler sees it defined twice — an error.

Include guards prevent this:

```cpp
// lexer.h
#ifndef LEXER_H      // if LEXER_H is not defined...
#define LEXER_H      // ...define it (the empty definition is fine)

// ... all declarations go here ...

#endif               // end of the guarded section
```

The second time `lexer.h` is included in any translation unit, `LEXER_H` is
already defined, so the preprocessor skips everything between `#ifndef` and `#endif`.

**`#pragma once` — the modern alternative:**

```cpp
#pragma once   // this file will only be included once per translation unit
```

Most compilers support `#pragma once`. It is shorter and cannot have typo bugs
(`#ifndef LEXER_H` paired with `#endif` but no matching `#define` is a silent bug).
We use `#pragma once` in this series.

---

## Step 1 — Create the File Structure

From the `lisp-cpp/` root:

```bash
touch src/lexer.h
touch src/lexer.cpp
```

Update `CMakeLists.txt` to include the new source file:

```cmake
add_executable(lisp
    src/main.cpp
    src/lexer.cpp    # ← add this line
)
```

After this change, run `cmake -S . -B build` to regenerate the build files,
then `cmake --build build` to compile.

---

## Step 2 — Write `src/lexer.h`

```cpp
#pragma once               // ← prevent double inclusion

#include <string>          // std::string
#include <vector>          // std::vector

// TokenType: every category of token the lexer can produce.
// enum class: values are scoped (TokenType::LPAREN) and not implicitly int.
enum class TokenType {
    LPAREN,    // (
    RPAREN,    // )
    NUMBER,    // integer or float literal: 42, -7, 3.14
    SYMBOL,    // identifier or operator: +, define, lambda, foo
    BOOLEAN,   // #t or #f
    NIL        // the empty list: '() or nil
};

// The string name of a TokenType — for printing and error messages.
const char* token_type_name(TokenType type);

// A single token produced by the lexer.
struct Token {
    TokenType   type;    // which category
    std::string value;   // the original source text ("(", "42", "define", etc.)
};

// tokenize: scan a source string and return all tokens.
// Returns an empty vector if source is empty.
// Throws std::runtime_error on unrecognized characters.
std::vector<Token> tokenize(const std::string& source);
```

**What moved out of `main.cpp`:** The `TokenType` enum, the `Token` struct, and
the function declarations. `main.cpp` will `#include "lexer.h"` to see these.

---

## Step 3 — Write `src/lexer.cpp`

```cpp
#include "lexer.h"      // our own declarations — always first
#include <cctype>       // isdigit, isalpha, isspace, isalnum
#include <stdexcept>    // std::runtime_error
#include <cstdio>       // (not strictly needed here — remove if unused)

// token_type_name: map enum values to printable strings.
// String literals in C++ are stored in the program's read-only segment —
// they are valid for the lifetime of the program. No allocation.
const char* token_type_name(TokenType type) {
    switch (type) {
        case TokenType::LPAREN:  return "LPAREN";
        case TokenType::RPAREN:  return "RPAREN";
        case TokenType::NUMBER:  return "NUMBER";
        case TokenType::SYMBOL:  return "SYMBOL";
        case TokenType::BOOLEAN: return "BOOLEAN";
        case TokenType::NIL:     return "NIL";
    }
    return "UNKNOWN";   // should never reach here if all cases are covered
}

// is_symbol_char: returns true if ch can appear inside a Lisp symbol name.
// Lisp is permissive about symbol characters — +, -, *, / etc. are valid.
static bool is_symbol_char(char ch) {
    // static: this function is private to lexer.cpp (internal linkage).
    // isalnum cast to unsigned char: isalnum is defined for unsigned char + EOF.
    // Passing a negative char (possible on some platforms) is undefined behavior.
    return isalnum((unsigned char)ch)
        || ch == '+' || ch == '-' || ch == '*' || ch == '/'
        || ch == '=' || ch == '<' || ch == '>' || ch == '?'
        || ch == '!' || ch == '_';
}

std::vector<Token> tokenize(const std::string& source) {
    std::vector<Token> tokens;   // the result — built up as we scan

    // i: the current position in source.
    // size_t: unsigned integer type — the type source.size() returns.
    // Using size_t avoids signed/unsigned comparison warnings.
    size_t i = 0;
    const size_t length = source.size();  // cache length — avoid repeated calls

    while (i < length) {
        char ch = source[i];   // the current character

        // ── WHITESPACE ────────────────────────────────────────────
        if (isspace((unsigned char)ch)) {
            i++;       // skip whitespace — advance and look at next char
            continue;  // go back to top of while loop
        }

        // ── LEFT PARENTHESIS ─────────────────────────────────────
        if (ch == '(') {
            tokens.push_back({ .type = TokenType::LPAREN, .value = "(" });
            i++;
            continue;
        }

        // ── RIGHT PARENTHESIS ────────────────────────────────────
        if (ch == ')') {
            tokens.push_back({ .type = TokenType::RPAREN, .value = ")" });
            i++;
            continue;
        }

        // ── BOOLEAN LITERALS: #t and #f ──────────────────────────
        if (ch == '#') {
            // '#' must be followed by 't' or 'f'.
            // Check that we won't read past the end of the string (i+1 < length).
            if (i + 1 < length && source[i + 1] == 't') {
                tokens.push_back({ .type = TokenType::BOOLEAN, .value = "#t" });
                i += 2;   // consume both '#' and 't'
                continue;
            }
            if (i + 1 < length && source[i + 1] == 'f') {
                tokens.push_back({ .type = TokenType::BOOLEAN, .value = "#f" });
                i += 2;
                continue;
            }
            // '#' not followed by 't' or 'f' — unrecognized
            throw std::runtime_error(
                std::string("Unexpected character after #: ") + source[i + 1]);
        }

        // ── NUMBER LITERALS ──────────────────────────────────────
        // A number starts with a digit, or '-' followed by a digit.
        // Examples: 42, -7, 0
        bool starts_number = isdigit((unsigned char)ch)
            || (ch == '-' && i + 1 < length && isdigit((unsigned char)source[i + 1]));

        if (starts_number) {
            size_t start = i;   // remember where the number started
            i++;                // consume the first character (digit or '-')

            // Keep consuming while characters are digits:
            while (i < length && isdigit((unsigned char)source[i])) {
                i++;
            }

            // substr(start, length): copy the substring starting at 'start',
            // for 'i - start' characters.
            tokens.push_back({
                .type  = TokenType::NUMBER,
                .value = source.substr(start, i - start)   // e.g. "42" or "-7"
            });
            continue;
        }

        // ── SYMBOL / KEYWORD ─────────────────────────────────────
        // Symbols: identifiers and operators: +, define, lambda, foo, etc.
        if (is_symbol_char(ch)) {
            size_t start = i;
            while (i < length && is_symbol_char(source[i])) {
                i++;
            }
            std::string sym_text = source.substr(start, i - start);

            // Special case: "nil" is not a symbol — it is the empty list.
            if (sym_text == "nil") {
                tokens.push_back({ .type = TokenType::NIL, .value = sym_text });
            } else {
                tokens.push_back({ .type = TokenType::SYMBOL, .value = sym_text });
            }
            continue;
        }

        // ── COMMENT: ; to end of line ─────────────────────────────
        if (ch == ';') {
            // Skip everything until the newline or end of string.
            while (i < length && source[i] != '\n') {
                i++;
            }
            continue;
        }

        // ── UNRECOGNIZED CHARACTER ───────────────────────────────
        // std::runtime_error is a standard exception class.
        // std::string("...") + ch: concatenates a string and a char.
        throw std::runtime_error(
            std::string("Unrecognized character: '") + ch + "'");
    }

    return tokens;   // return the completed token list (by value — RVO applies)
}
```

---

## Step 4 — Update `src/main.cpp`

Replace `main.cpp` with a clean version that includes the lexer and tests it:

```cpp
#include <cstdio>
#include "lexer.h"   // ← Token, TokenType, tokenize — from our new header

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

// Print a single token on one line.
void print_token(const Token& tok) {
    printf("  Token { type: %-8s value: \"%s\" }\n",
           token_type_name(tok.type),
           tok.value.c_str());
}

// Print all tokens in a vector.
void print_tokens(const std::string& label, const std::vector<Token>& tokens) {
    printf("\ntokenize(\"%s\"):\n", label.c_str());
    for (const Token& tok : tokens) {
        print_token(tok);
    }
}

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);

    // Test the lexer with representative inputs.
    print_tokens("(+ 1 2)",        tokenize("(+ 1 2)"));
    print_tokens("(define x 42)",  tokenize("(define x 42)"));
    print_tokens("(if #t 1 0)",    tokenize("(if #t 1 0)"));

    return 0;
}
```

### COMPILE AND RUN

```bash
cmake -S . -B build   # re-run: CMakeLists.txt changed (added lexer.cpp)
cmake --build build
./build/lisp
```

Expected:
```
Lisp interpreter v0.1

tokenize("(+ 1 2)"):
  Token { type: LPAREN    value: "(" }
  Token { type: SYMBOL    value: "+"  }
  Token { type: NUMBER    value: "1"  }
  Token { type: NUMBER    value: "2"  }
  Token { type: RPAREN    value: ")"  }

tokenize("(define x 42)"):
  Token { type: LPAREN    value: "("      }
  Token { type: SYMBOL    value: "define" }
  Token { type: SYMBOL    value: "x"      }
  Token { type: NUMBER    value: "42"     }
  Token { type: RPAREN    value: ")"      }

tokenize("(if #t 1 0)"):
  Token { type: LPAREN    value: "("  }
  Token { type: SYMBOL    value: "if" }
  Token { type: BOOLEAN   value: "#t" }
  Token { type: NUMBER    value: "1"  }
  Token { type: NUMBER    value: "0"  }
  Token { type: RPAREN    value: ")"  }
```

**What if it breaks?**

| Error | Cause | Fix |
|-------|-------|-----|
| `'Token' was not declared` | Missing `#include "lexer.h"` in main.cpp | Add the include |
| `undefined reference to 'tokenize'` | `lexer.cpp` not in CMakeLists.txt | Add `src/lexer.cpp` to `add_executable` and re-run cmake |
| `#pragma once` not recognized | Very old compiler | Replace with `#ifndef`/`#define`/`#endif` guard |

---

## 🎯 Challenge: Add Nested Expression Support

**You know:** The lexer handles `(+ 1 2)`. It should also handle nested expressions.

**Task:** Verify that `tokenize("(+ (* 2 3) 4)")` produces exactly:

```
LPAREN  "("
SYMBOL  "+"
LPAREN  "("
SYMBOL  "*"
NUMBER  "2"
NUMBER  "3"
RPAREN  ")"
NUMBER  "4"
RPAREN  ")"
```

Add this test to `main()` and confirm the output. Then extend the lexer to handle
negative numbers that appear as the result of subtraction: tokenize `"(- 10 -3)"`.
Confirm `"-3"` is tokenized as a single `NUMBER` token, not as `SYMBOL "-"` followed
by `NUMBER "3"`.

**Hint:** The current `starts_number` check handles this. Trace through the logic
manually for `'-'` followed by `'3'` to confirm it produces one `NUMBER "-3"` token.

<details>
<summary>▶ Show Solution</summary>

The nested test requires no code changes — the lexer handles it already because
parentheses are single-character tokens emitted immediately.

```cpp
// In main():
print_tokens("(+ (* 2 3) 4)", tokenize("(+ (* 2 3) 4)"));
print_tokens("(- 10 -3)",     tokenize("(- 10 -3)"));
```

For `"-3"`: when the outer loop sees `'-'`, it checks `starts_number`:
```
ch == '-'                           → true
i + 1 < length                     → true (there is a next char)
isdigit(source[i + 1]) == '3'      → true
```
So `starts_number` is true, and the lexer enters the number branch,
consuming `'-'` as the first character, then `'3'` in the while loop.
Result: one `NUMBER "-3"` token.

**Key insight:** The `starts_number` condition disambiguates `-` as operator from
`-` as sign. `(- 10 -3)` works because the `-` operator at position 1 is followed
by a space (not a digit), so it fails `starts_number` and becomes `SYMBOL "-"`.
The `-3` at position 4 is followed by `3`, so it succeeds and becomes `NUMBER "-3"`.

</details>

---

## What Just Happened

The interpreter has its first real component. The lexer turns raw source text
into structured data — a `std::vector<Token>`. Every concept from the previous
four labs is used simultaneously:
- `TokenType` enum (LAB-02) — categorizes each token
- `Token` struct (LAB-02) — groups type and value
- `std::vector` (LAB-03) — holds the growing list
- `std::string::substr` (LAB-03) — extracts token text from the source
- Functions and references (LAB-04) — `tokenize` takes `const std::string&`

In LAB-06, you build the tree structure the parser produces. In LAB-07, you
write the parser that consumes these tokens and builds that tree.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `(+ 1 2)` tokenizes correctly | 5 tokens: LPAREN SYMBOL NUMBER NUMBER RPAREN |
| `(define x 42)` tokenizes correctly | SYMBOL "define", SYMBOL "x", NUMBER "42" |
| `#t` and `#f` produce BOOLEAN tokens | `(if #t 1 0)` → BOOLEAN "#t" |
| Nested expressions work | `(+ (* 2 3) 4)` → 9 tokens |
| Negative numbers work | `"-3"` is one NUMBER token, not SYMBOL + NUMBER |
| Comments ignored | `tokenize("; comment\n(+ 1 2)")` → 5 tokens, no comment token |

---

## Self-Check

1. What is the difference between a lexer and a parser?
2. What is a Finite State Machine? Name the three states in this lexer.
3. Why does `is_symbol_char` take `char` but pass `(unsigned char)ch` to `isalnum`?
4. What does `#pragma once` do and what problem does it solve?
5. Why is `token_type_name` defined in `lexer.cpp` rather than `lexer.h`?

---

## What's Next

LAB-06 introduces recursive data structures — specifically, the tree node that
the parser uses to represent a Lisp expression. A node can contain other nodes,
which means the type definition refers to itself. This requires pointers, which
you understand from LAB-01.

---

## Quick Check Answers

**1. How many tokens in `"(+ 12 foo)"`?**
Five: `(`, `+`, `12`, `foo`, `)`. Whitespace is discarded. The lexer produces
one token per meaningful unit — individual characters are grouped into multi-character
tokens where the source text requires it.

**2. How do you know when a multi-character token ends?**
By reading until you see a character that cannot be part of the current token.
For numbers: read digits until a non-digit appears. For symbols: read
`is_symbol_char` characters until one returns false. The character that ends
the token is not consumed — it is re-processed from the START state.

**3. What should the lexer do with spaces and newlines?**
Discard them. Whitespace is a separator between tokens, not a token itself.
The lexer advances `i` past each whitespace character and continues scanning.
