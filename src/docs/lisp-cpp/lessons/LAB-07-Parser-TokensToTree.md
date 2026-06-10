# Lisp-CPP — LAB 07 — Parser: Turning Tokens Into a Tree

**Prerequisites:** LAB-06 complete. The lexer produces tokens. You can build AST nodes manually.

**What this lab adds:**
- A complete recursive descent parser: `parse(tokens)` → `Node*`
- The grammar of Lisp expressions — why the recursive structure is so simple
- `size_t` position tracking — how to consume a token stream
- Error recovery — what happens when the input is malformed

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The token stream for `(+ (* 2 3) 4)` is:
>    `LPAREN SYMBOL LPAREN SYMBOL NUMBER NUMBER RPAREN NUMBER RPAREN`.
>    Trace through these tokens mentally. At what token does the parser know a
>    nested list has started?
> 2. The parser must call itself recursively to handle nested expressions. What
>    is the base case that stops the recursion?
> 3. If the input is `(+ 1`, what should the parser do when it reaches the end
>    of the token stream without finding `)`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

parse("(+ 1 2)"):
(+
  1
  2)

parse("(+ (* 2 3) 4)"):
(+
  (*
    2
    3)
  4)

parse("(define x (+ 1 2))"):
(define
  x
  (+
    1
    2))

Error test — "(+ 1":
Error: Unexpected end of tokens — expected ')'
```

The parser converts token streams into the exact same trees you built by hand in LAB-06.

---

## Concept: The Grammar of Lisp

**What it is:** A grammar defines the valid structure of a language. Lisp's grammar
is unusually simple — it is one of the simplest non-trivial grammars in existence.

**Lisp grammar in BNF (Backus-Naur Form):**

```
expression  ::= atom | list

atom        ::= NUMBER | SYMBOL | BOOLEAN | NIL

list        ::= '(' expression* ')'
```

In plain English:
- An expression is either an atom or a list.
- An atom is any single token that is not a parenthesis.
- A list is `(` followed by zero or more expressions, followed by `)`.

**Why this grammar makes the parser recursive:**

`list` contains `expression*`, and `expression` contains `list`. The grammar is
recursive. The parser must be recursive to match it — when the parser sees `(`,
it calls itself to parse each element of the list, until it sees `)`.

This is called a **recursive descent parser**: the parser descends into the grammar
recursively, one rule at a time.

**Contrast with C++:**

C++'s grammar is enormous — hundreds of rules, ambiguous in places, requiring
special tricks to parse. Lisp's grammar is 3 rules. This simplicity is intentional:
Lisp's uniform syntax (`()` for everything) makes programs easy to manipulate
programmatically — the foundation of macros (LAB-27).

**Transfer:** Every language has a grammar. SQL, JSON, HTML, CSS — all have grammars
defined in BNF or similar notation. Understanding Lisp's grammar first (the simplest)
makes reading C++'s grammar (the hardest) much more tractable later.

---

## Concept: Recursive Descent Parsing

**What it is:** A recursive descent parser is a hand-written parser where each
grammar rule corresponds to one function. Functions call each other according
to the grammar structure.

**The direct correspondence:**

```
Grammar rule:          Parser function:

expression             Node* parse_expression(tokens, pos)
  = atom | list          if current token is LPAREN → parse_list
                         else → parse_atom

atom                   Node* parse_atom(tokens, pos)
  = NUMBER | ...         create an ATOM node, advance pos, return

list                   Node* parse_list(tokens, pos)
  = '(' expr* ')'       consume '(', loop calling parse_expression
                         until ')', consume ')', return LIST node
```

**Position tracking:**

The parser reads from a `std::vector<Token>` using a position index `pos`.
`pos` starts at 0. Each time the parser "consumes" a token, it increments `pos`.

We pass `pos` by reference so that nested calls advance the same position counter:

```cpp
Node* parse_expression(const std::vector<Token>& tokens, size_t& pos);
//                                                        ────────
//                                                        & = reference
//                                                        nested calls advance the same pos
```

Without the `&`, each recursive call would get its own copy of `pos` — changes
in nested calls would not propagate back to the caller, and the parser would
read the same tokens repeatedly.

**Peek vs. advance:**

```cpp
// Peek: look at the current token without consuming it
const Token& current = tokens[pos];

// Advance: consume the current token — move to the next one
pos++;

// Combined peek-and-advance: read current, then move forward
const Token& tok = tokens[pos++];   // post-increment: reads pos, then increments it
```

---

## Concept: Parse Error Handling

**What it is:** When the token stream violates the grammar, the parser must report
the error clearly. Silent failure — returning a null pointer with no message — makes
debugging impossible.

**Two common malformed inputs:**

```
"(+ 1"      → missing closing paren — runs out of tokens mid-list
"1 2"       → two expressions with no containing list — may be valid (multi-expression files)
")"         → closing paren with no opening paren — grammar violation
```

**Strategy:** Throw `std::runtime_error` with a message that identifies the problem.
The REPL (LAB-24) will catch these errors and print them without crashing.

```cpp
if (pos >= tokens.size()) {
    throw std::runtime_error("Unexpected end of tokens — expected ')'");
}
if (tokens[pos].type != TokenType::RPAREN) {
    throw std::runtime_error(
        std::string("Expected ')' but got '") + tokens[pos].value + "'");
}
```

**Why `std::runtime_error`?**

It is a standard C++ exception that carries a message string. The caller catches
it with `catch (const std::runtime_error& e)` and reads `e.what()` for the message.
Exceptions propagate up the call stack automatically — if `parse_expression` calls
`parse_list` which calls `parse_expression` recursively, any exception thrown deep
in the recursion immediately unwinds all the frames to the nearest `catch`.

---

## Step 1 — Create `src/parser.h` and `src/parser.cpp`

```bash
touch src/parser.h
touch src/parser.cpp
```

Update `CMakeLists.txt`:

```cmake
add_executable(lisp
    src/main.cpp
    src/lexer.cpp
    src/node.cpp
    src/parser.cpp   # ← add this
)
```

**`src/parser.h`:**

```cpp
#pragma once

#include <vector>
#include <cstddef>    // size_t
#include "lexer.h"    // Token, TokenType
#include "node.h"     // Node, NodeKind, make_atom, make_list

// parse_expression: parse one expression starting at tokens[pos].
// Advances pos past every token it consumes.
// Returns a heap-allocated Node* (caller owns it — call free_tree when done).
// Throws std::runtime_error on malformed input.
Node* parse_expression(const std::vector<Token>& tokens, size_t& pos);

// parse: convenience wrapper — parses the first expression in the token list.
// Returns nullptr if tokens is empty.
Node* parse(const std::vector<Token>& tokens);
```

---

## Step 2 — Write `src/parser.cpp`

```cpp
#include "parser.h"
#include <stdexcept>    // std::runtime_error

// parse_atom: consume one atom token and return an ATOM node.
// Called by parse_expression when the current token is not '('.
static Node* parse_atom(const std::vector<Token>& tokens, size_t& pos) {
    // Guard: ensure there is a token to consume.
    // This should never trigger if parse_expression checks first.
    if (pos >= tokens.size()) {
        throw std::runtime_error("parse_atom: unexpected end of tokens");
    }

    const Token& tok = tokens[pos];   // read without consuming (peek)
    pos++;                            // now consume (advance)

    // Create and return an atom node with the token's text as value.
    return make_atom(tok.value);
}

// parse_list: parse a parenthesized list starting at '('.
// Precondition: tokens[pos] is LPAREN (caller has already checked).
static Node* parse_list(const std::vector<Token>& tokens, size_t& pos) {
    // Consume the '(' — we know it is there.
    pos++;   // tokens[pos] was LPAREN; now pos points to the first element

    // Create the list node that will hold the children.
    Node* list_node = make_list();

    // Loop: parse child expressions until we see ')' or run out of tokens.
    while (true) {
        // Check for end of token stream — unclosed list:
        if (pos >= tokens.size()) {
            free_tree(list_node);   // clean up before throwing — no leaks
            throw std::runtime_error("Unexpected end of tokens — expected ')'");
        }

        // Check for closing paren — end of this list:
        if (tokens[pos].type == TokenType::RPAREN) {
            pos++;       // consume the ')'
            break;       // done with this list
        }

        // Parse the next child expression (may itself be a list):
        Node* child = parse_expression(tokens, pos);
        list_node->children.push_back(child);   // add child to this list
    }

    return list_node;
}

// parse_expression: the main parser function.
// Dispatches to parse_list or parse_atom based on the current token.
Node* parse_expression(const std::vector<Token>& tokens, size_t& pos) {
    if (pos >= tokens.size()) {
        throw std::runtime_error("parse_expression: unexpected end of tokens");
    }

    const Token& current = tokens[pos];   // peek — do not consume yet

    if (current.type == TokenType::LPAREN) {
        // A '(' starts a list — delegate to parse_list.
        // parse_list will consume '(' and ')' and all children.
        return parse_list(tokens, pos);
    }

    if (current.type == TokenType::RPAREN) {
        // A ')' at the top level means we have an unmatched paren:
        throw std::runtime_error(
            std::string("Unexpected ')' at token position ") + std::to_string(pos));
    }

    // Any other token (NUMBER, SYMBOL, BOOLEAN, NIL) is an atom:
    return parse_atom(tokens, pos);
}

// parse: convenience function — tokenize + parse_expression wrapper.
// Returns the first (and usually only) top-level expression.
Node* parse(const std::vector<Token>& tokens) {
    if (tokens.empty()) return nullptr;

    size_t pos = 0;   // starts at the first token
    return parse_expression(tokens, pos);
}
```

---

## Step 3 — Update `src/main.cpp`

```cpp
#include <cstdio>
#include <stdexcept>   // std::runtime_error — for the error test
#include "lexer.h"
#include "node.h"
#include "parser.h"    // ← add this

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

// Helper: tokenize a source string, parse it, print the tree, free it.
// Wraps parse in a try/catch so errors do not crash the whole program.
void test_parse(const char* source) {
    printf("\nparse(\"%s\"):\n", source);
    try {
        std::vector<Token> tokens = tokenize(source);
        Node* tree = parse(tokens);
        print_tree(tree);
        free_tree(tree);
    } catch (const std::runtime_error& e) {
        printf("Error: %s\n", e.what());
    }
}

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);

    test_parse("(+ 1 2)");
    test_parse("(+ (* 2 3) 4)");
    test_parse("(define x (+ 1 2))");
    test_parse("(+ 1");       // malformed — missing ')'

    return 0;
}
```

### COMPILE AND RUN

```bash
cmake -S . -B build
cmake --build build
./build/lisp
```

Expected:
```
Lisp interpreter v0.1

parse("(+ 1 2)"):
(+
  1
  2)

parse("(+ (* 2 3) 4)"):
(+
  (*
    2
    3)
  4)

parse("(define x (+ 1 2))"):
(define
  x
  (+
    1
    2))

parse("(+ 1"):
Error: Unexpected end of tokens — expected ')'
```

**What if it breaks?**

| Error | Cause | Fix |
|-------|-------|-----|
| `undefined reference to 'parse'` | `parser.cpp` not in CMakeLists.txt | Add it and re-run cmake |
| `Node* parse_expression` not found | Missing `#include "parser.h"` in main.cpp | Add the include |
| Tree printed incorrectly | `print_tree` from LAB-06 may need adjustment | Verify your `node.cpp` matches LAB-06 exactly |

---

## 🎯 Challenge: Parse Multiple Expressions

**You know:** `parse_expression`, position tracking with `size_t&`, `std::vector`.

**Task:** Write `std::vector<Node*> parse_all(const std::vector<Token>& tokens)`
that parses ALL top-level expressions in the token stream, not just the first one.

This is needed for loading files (LAB-28): a Lisp source file may contain many
top-level expressions:

```lisp
(define x 10)
(define y 20)
(+ x y)
```

`parse_all` should return three nodes for this input.

**Starting code:**
```cpp
std::vector<Node*> parse_all(const std::vector<Token>& tokens) {
    // YOUR CODE HERE
}
```

**Hints:**
1. Start `pos = 0`. Keep calling `parse_expression` until `pos >= tokens.size()`.
2. What happens if `parse_expression` throws? You need to `free_tree` the nodes
   already collected before rethrowing.

<details>
<summary>▶ Show Solution</summary>

```cpp
std::vector<Node*> parse_all(const std::vector<Token>& tokens) {
    std::vector<Node*> nodes;
    size_t pos = 0;

    try {
        while (pos < tokens.size()) {
            nodes.push_back(parse_expression(tokens, pos));
        }
    } catch (const std::runtime_error& e) {
        // Clean up already-parsed nodes before propagating the error.
        // Without this, every successfully parsed node before the error leaks.
        for (Node* node : nodes) {
            free_tree(node);
        }
        nodes.clear();
        throw;   // rethrow the same exception — do not lose the error message
    }

    return nodes;
}
```

Test it:
```cpp
// In main():
printf("\n=== parse_all test ===\n");
std::vector<Token> multi_tokens = tokenize("(define x 10) (define y 20) (+ x y)");
std::vector<Node*> multi_nodes  = parse_all(multi_tokens);
printf("Parsed %zu top-level expressions:\n", multi_nodes.size());
for (Node* node : multi_nodes) {
    print_tree(node);
    free_tree(node);
}
```

**Key insight:** The `try/catch` in `parse_all` demonstrates why error handling
in a system with manual memory management is hard: you must clean up partially-built
state before propagating errors. In LAB-17, `std::unique_ptr` makes this automatic —
if an exception unwinds the stack, the smart pointer's destructor frees the memory
automatically, no explicit cleanup needed.

</details>

---

## What Just Happened

The pipeline is now half-complete:

```
Source string
    ↓ tokenize()  (LAB-05)
std::vector<Token>
    ↓ parse()     (this lab)
Node* (AST)
    ↓ eval()      (LAB-08 — next)
LispVal (result)
```

The parser is recursive because the grammar is recursive. Every `(` triggers a
recursive call to `parse_expression`, which calls `parse_list`, which calls
`parse_expression` for each child — mirroring the recursive structure of the data.

When you understand why the code is recursive (because the grammar is recursive,
because the data structure is recursive), you understand the deepest principle
of language implementation.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `(+ 1 2)` parses correctly | Tree matches manually-built LAB-06 version |
| Nested `(+ (* 2 3) 4)` parses | Two-level tree, inner subtree correct |
| `(define x (+ 1 2))` parses | Three children: symbol, symbol, list |
| Error reported for `(+ 1` | Prints "Error: Unexpected end of tokens" |
| No ASAN leaks | `free_tree` after each parse, error path frees partial tree |
| `parse_all` challenge | Returns 3 nodes for 3-expression input |

---

## Self-Check

1. What does "recursive descent" mean in the context of a parser?
2. Why is `pos` passed by reference (`size_t& pos`) rather than by value?
3. When `parse_list` encounters a missing `)`, it calls `free_tree(list_node)` before throwing. Why is this important?
4. The grammar rule `list ::= '(' expression* ')'` uses `*` meaning "zero or more." Where in the code does this "zero or more" appear?
5. Why does `parse_expression` throw an error on an unexpected `)` at the top level?

---

## What's Next

LAB-08 builds the evaluator — the function that walks the AST and computes a result.
You will handle numbers (self-evaluating), symbols (look up in environment), and lists
(apply the operator to the evaluated operands). The pipeline becomes complete: source
string → tokens → tree → value.

---

## Quick Check Answers

**1. At what token does the parser know a nested list has started?**
When it reads `LPAREN`. The current token is `(`, so `parse_expression` dispatches
to `parse_list`. The parser does not know the full extent of the nested list until
it finds the matching `)` — but it knows a list has started the moment it sees `(`.

**2. What is the base case that stops the recursion?**
An atom token (NUMBER, SYMBOL, BOOLEAN, NIL). When `parse_expression` sees a
non-parenthesis token, it calls `parse_atom`, which consumes one token and returns
without any recursive call. No `(` = no nested list = no recursion.

**3. What should the parser do on `(+ 1` with no `)`?**
Report a clear error. The parser's `while` loop in `parse_list` checks
`pos >= tokens.size()` at the top of each iteration. When tokens run out mid-list,
it frees the partial tree (to avoid leaks) and throws `std::runtime_error("Unexpected
end of tokens — expected ')'")`. The caller catches the error and prints it.
