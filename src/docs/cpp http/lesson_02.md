# Lesson 2: Characters Become Tokens

**What you will build:** a `Lexer` class — split into its own header and source file for the
first time — that turns a raw string like `"2*(3+4)"` into a list of typed tokens
(`NUMBER(2) STAR LPAREN NUMBER(3) PLUS NUMBER(4) RPAREN END`), wired into the server so a
request now gets that token list back instead of an echo. The transferable problem: before
any structure or meaning can be assigned to text, you first have to agree on what the
indivisible *pieces* of that text are — this is true of C++ source code compiling, of
`extract_body`'s HTTP parsing last lesson, and now of this project's own math language.

**What you need to know first:** Lesson 1 — specifically `extract_body`'s string scanning
(`.find`, `.substr`), and the request/response loop the lexer now plugs into. Nothing about
recursion or trees yet — that's Lesson 3, when tokens become an actual computed result.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → ... → HTTP Response
                 ▲
                 └── this lesson. Carrying "2*(3+4)" through: it arrives as the HTTP body
                     (Lesson 1), and this lesson's new work turns it into exactly seven
                     tokens: NUMBER(2), STAR, LPAREN, NUMBER(3), PLUS, NUMBER(4), RPAREN,
                     plus an END marker. Nothing downstream of "Lexer" exists yet — the
                     server prints that token list as its response so you can see the
                     lexer's output directly, instead of it being invisible inside a
                     bigger pipeline.
```

---

## Concept Unit 1: The problem tokenization solves

### The Problem

`extract_body` gave you the string `"2*(3+4)"`. As far as C++ is concerned, that's just 7
characters in a row — `'2'`, `'*'`, `'('`, `'3'`, `'+'`, `'4'`, `')'`. Nothing yet groups
those characters into the things you actually care about: *the number 2*, as opposed to the
digit character `'2'`. That distinction matters immediately once numbers have more than one
digit — `"23+4"` must not become the digit `'2'` followed by the digit `'3'`; it must become
one token, the number 23.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <string>
#include <cctype>

int main() {
    std::string source = "123abc";
    std::size_t pos = 0;
    std::string number;
    while (pos < source.size() && std::isdigit(static_cast<unsigned char>(source[pos]))) {
        number += source[pos];
        pos++;
    }
    std::cout << "collected: " << number << ", stopped at index " << pos
              << " (character '" << source[pos] << "')\n";
    return 0;
}
```

Real output:

```
collected: 123, stopped at index 3 (character 'a')
```

That output proves the pattern: keep consuming characters one at a time while they satisfy
some test (`isdigit`), building up one combined piece, and stop the instant the test fails.
This is called **scanning**, and it's the core loop every lexer is built from.

### Discard

This loop is deleted now. The real project scans digits the same way, but as a method on a
class that also handles operators, parentheses, and whitespace — built in Concept Unit 4.

### Mechanical walkthrough

- `std::isdigit(static_cast<unsigned char>(...))` — **(a) first appearance.** `isdigit`
  tests whether a character is `0`–`9`. The `static_cast<unsigned char>` wrapping it isn't
  decoration: `isdigit` technically has undefined behavior if you pass it a plain (signed)
  `char` holding a negative value, which can happen with certain byte values — casting to
  `unsigned char` first sidesteps that entirely. Small, easy to skip, and exactly the kind
  of thing that passes every test until one input triggers it — worth doing correctly from
  the first appearance rather than "fixing later."
- `number += source[pos]` — **(c) already basic** — string indexing and `+=` are ordinary
  string operations you already know from Lesson 1.
- `pos++` inside the loop condition's own reach — **(c) already basic** — a counter
  increment, same as any Python `while` loop.

### CS lens

This exact loop — consume while a predicate holds, stop the moment it doesn't — is called
the **maximal munch** rule in lexer design: always consume the *longest* possible match, so
`123` becomes one token, never three. Also recognized in: how your terminal's tab-completion
decides where a word boundary is, and how regex engines greedily match `\d+`.

---

## Concept Unit 2: Representing a token

### The Problem

"Collected the text `123`" isn't quite enough on its own — the parser (Lesson 3) needs to
know *what kind* of thing `123` is (a number) as distinctly as it needs to know a `+`
character is an operator, not a number. Two pieces of information travel together for every
token: its category, and its actual text.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <string>

enum class TokenType { Number, Plus };

struct Token {
    TokenType type;
    std::string text;
};

int main() {
    Token t{TokenType::Number, "42"};
    std::cout << "token text: " << t.text << "\n";
    std::cout << "is it a Number? " << (t.type == TokenType::Number) << "\n";
    std::cout << "is it a Plus? " << (t.type == TokenType::Plus) << "\n";
    return 0;
}
```

Real output:

```
token text: 42
is it a Number? 1
is it a Plus? 0
```

(`true`/`false` print as `1`/`0` by default in C++ — that's `std::cout`'s normal behavior
for `bool`, not a bug.)

### Discard

This two-token-type stub is deleted; the real project's `TokenType` needs every operator and
parenthesis besides, built next.

### Mechanical walkthrough

- `enum class TokenType { Number, Plus }` — **(a) first appearance.** An `enum class` (as
  opposed to a plain, older-style `enum`) defines a small, closed set of named values, and
  — the "class" part — requires writing `TokenType::Number` rather than a bare `Number`
  everywhere, which prevents this project's `Number` from silently colliding with some
  unrelated `Number` defined elsewhere in a larger codebase.
- `struct Token { TokenType type; std::string text; }` — **(a) first appearance, in this
  project.** A `struct` groups related data into one named type with no behavior of its own
  yet — here, "which kind" and "what text" travel together as one `Token` value, exactly the
  gap identified in this unit's Problem step.
- `Token t{TokenType::Number, "42"}` — **(b) reappearing concept.** Brace-initialization, the
  same `{}` syntax already used for `sockaddr_in address{}` in Lesson 1 — here it fills in
  `Token`'s two fields in declaration order.
- `t.type == TokenType::Number` — **(a) first appearance.** `enum class` values support `==`
  out of the box; comparing against a specific named value is how code will ask "what kind
  of token is this?" throughout the real lexer and, later, the parser.

### CS lens

A `struct` pairing a *category* with its *payload* is the same shape as Python's tagged
tuples or a JSON object with a `"type"` field — a recurring pattern anywhere heterogeneous
things need to travel through one pipeline uniformly: also recognized in AST nodes (Lesson
3), and in message-passing systems where every message carries a type tag.

---

## Concept Unit 3: One file, too many jobs

### The Problem

Every project so far has lived in one file, `server.cpp`. The lexer is the first genuinely
separate *module* — something the server *uses* but that has nothing to do with sockets or
HTTP. Cramming it into `server.cpp` would work today, but every future lesson (parser, AST,
interpreter, matrices) would keep piling into that same file, and nothing about "sockets"
and "tokenizing" would ever be separably testable or even separately readable.

### Introduce the concept in isolation

```cpp
// greet.h
#pragma once
#include <string>

std::string greet(const std::string& name);
```

```cpp
// greet.cpp
#include "greet.h"

std::string greet(const std::string& name) {
    return "hello, " + name;
}
```

```cpp
// main.cpp
#include <iostream>
#include "greet.h"

int main() {
    std::cout << greet("math engine") << "\n";
    return 0;
}
```

### Commands

```
g++ -std=c++17 -Wall -c greet.cpp -o greet.o
g++ -std=c++17 -Wall -c main.cpp -o main.o
g++ greet.o main.o -o app
./app
```

Real output:

```
hello, math engine
```

Now, prove the linking step is doing real work — compile `main.cpp` *alone*, skipping
`greet.o`:

```
g++ -std=c++17 -Wall main.cpp -o app_broken
```

Real output:

```
/usr/bin/ld: /tmp/ccHMb5Qy.o: in function `main':
main.cpp:(.text+0x4f): undefined reference to `greet(std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > const&)'
collect2: error: ld returned 1 exit status
```

### Discard

`greet.h`/`greet.cpp`/`main.cpp` are deleted. The real split — `lexer.h` / `lexer.cpp`,
included from `server.cpp` — is built in the next unit.

### Mechanical walkthrough

- `#pragma once` — **(a) first appearance.** Tells the compiler to only process this header
  file once per compiled file, even if it's `#include`d more than once (directly or
  indirectly through other headers) — without it, a header included twice would try to
  define the same function or type twice and fail to compile. This is a *header guard*;
  `#pragma once` is the common modern shorthand for it.
- Declaration in `greet.h` vs. definition in `greet.cpp` — **(a) first appearance.** The
  header states *that* `greet` exists and what it takes/returns (its signature); the `.cpp`
  file is the only place that states *how* it works (its body). Anything that wants to call
  `greet` only needs the header — this is exactly what let `main.cpp` compile successfully
  on its own (produce `main.o`) even without `greet.cpp`'s actual implementation anywhere
  nearby.
- `g++ -c ... -o *.o` — **(a) first appearance.** `-c` means "compile only, don't link" —
  it produces an *object file* (`.o`), machine code for just that one source file, with a
  placeholder ("undefined reference") anywhere it calls a function it only saw a declaration
  for.
- The final `g++ greet.o main.o -o app` with no `-c` — **(a) first appearance.** This is the
  **linker** step: it stitches multiple object files together, replacing each
  "undefined reference" placeholder with the real address of the matching function found in
  one of the other object files. The broken build above is exactly what happens when linking
  never finds a match — `main.o` alone has a placeholder for `greet` with nothing to fill it.

### CS lens

Declaration vs. definition, and the two-step compile-then-link process, is the same
separation-of-concerns idea as an interface in Java or a `.d.ts` type-declaration file in
TypeScript: a promise about *what's callable*, kept separate from *how it works*.

### SE lens

The alternative to splitting into files is keeping everything in `server.cpp` forever. The
real cost of that alternative, honestly: nothing here would *stop working* for a long time —
it would just get slower to read, slower to compile (one giant file recompiles entirely on
every tiny change, where separate `.o` files let an unchanged `lexer.cpp` skip
recompilation), and impossible to unit-test the lexer without also spinning up a socket
server. The cost being accepted by splitting now instead: two files to keep in sync
(forget to update the header after changing a function's signature, and you get a
confusing compiler error instead of no error at all) — a real, small tax, paid from now on.

---

## Concept Unit 4: The real Lexer

### Project Change

- **Reference Source:** no reference counterpart — this project's language is its own,
  not a port of an existing lexer.
- **Files affected:** new `lexer.h`, new `lexer.cpp`.
- **Change type:** add.
- **Location:** new files, alongside `server.cpp`.
- **Dependencies:** none beyond the standard library.

### The New Code — type it yourself

`lexer.h`:

```cpp
#pragma once
#include <string>
#include <vector>

enum class TokenType { Number, Plus, Minus, Star, Slash, LParen, RParen, End };

struct Token {
    TokenType type;
    std::string text;
};

std::string token_type_name(TokenType type);

class Lexer {
public:
    explicit Lexer(const std::string& source);
    std::vector<Token> tokenize();

private:
    std::string source_;
    std::size_t pos_ = 0;

    char peek() const;
    void advance();
    Token read_number();
};
```

### The Updated Project

There is no larger existing structure to place this inside — it's a brand-new header, the
case Project Change already covers. `lexer.cpp` (the implementation) is shown whole below,
since it's also brand-new:

```cpp
#include "lexer.h"
#include <cctype>
#include <stdexcept>

std::string token_type_name(TokenType type) {
    switch (type) {
        case TokenType::Number: return "NUMBER";
        case TokenType::Plus:   return "PLUS";
        case TokenType::Minus:  return "MINUS";
        case TokenType::Star:   return "STAR";
        case TokenType::Slash:  return "SLASH";
        case TokenType::LParen: return "LPAREN";
        case TokenType::RParen: return "RPAREN";
        case TokenType::End:    return "END";
    }
    return "UNKNOWN";
}

Lexer::Lexer(const std::string& source) : source_(source) {}

char Lexer::peek() const {
    if (pos_ >= source_.size()) return '\0';
    return source_[pos_];
}

void Lexer::advance() {
    pos_++;
}

Token Lexer::read_number() {
    std::string text;
    while (std::isdigit(static_cast<unsigned char>(peek()))) {
        text += peek();
        advance();
    }
    return Token{TokenType::Number, text};
}

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

        switch (c) {
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

- `explicit Lexer(const std::string& source);` — **(a) first appearance.** `explicit` on a
  single-argument constructor blocks C++ from silently converting a plain string into a
  `Lexer` wherever one is expected (e.g. accidentally passing a `std::string` to a function
  that wants a `Lexer` would otherwise quietly compile) — a real category of bug this one
  keyword closes off entirely.
- `: source_(source)` (constructor initializer list) — **(a) first appearance.** Initializes
  the member `source_` directly from the constructor's parameter, before the constructor
  body runs — the C++ way to set up member variables, preferred over assigning them inside
  `{ }`, particularly relevant later for members (like `const` fields) that can only ever be
  set this way.
- Trailing underscore in `source_`, `pos_` — **(a) first appearance, as a convention.** Not a
  language rule — a naming convention marking "this is a member variable," so a reader
  scanning `Lexer`'s methods can tell `source_` (persists across calls) apart from a local
  variable like `text` inside `read_number` (doesn't) without checking a declaration.
- `char Lexer::peek() const` — **(a) first appearance.** The trailing `const` promises this
  method won't modify the object it's called on — `peek` only reads `pos_` and `source_`,
  never changes them, and the compiler now enforces that promise; calling a non-`const`
  method from inside a `const` one would be a compile error.
- `switch (c) { case '+': ... }` on a `char` — **(b) reappearing concept.** Same `switch`
  you'd recognize from other C-family languages; each `case` here both records a token and
  calls `advance()` before `break`ing, since consuming a single-character token means moving
  past exactly one character.
- `tokens.push_back(Token{TokenType::End, ""})` at the very end — **(a) first appearance of
  this pattern.** An explicit `End` token, always the last one, so the parser (Lesson 3) has
  an unambiguous signal "there is nothing more" instead of having to separately check
  whether it's run past the end of the `tokens` vector on every single lookup.

### Execution trace

Tracing `tokenize()` on `"2*(3+4)"` — a genuinely stateful loop, so this earns a real trace,
not a description of what it "generally does":

1. `pos_ 0`: `c = '2'`. Not space, is digit → `read_number()` runs its own inner loop:
   consumes `'2'` (now `pos_ 1`), then `peek()` returns `'*'`, which fails `isdigit`, so the
   inner loop stops. Token `NUMBER("2")` pushed.
2. `pos_ 1`: `c = '*'`. Falls to `switch`, matches `case '*'` → pushes `STAR("*")`,
   `advance()` → `pos_ 2`.
3. `pos_ 2`: `c = '('`. Matches `case '('` → pushes `LPAREN("(")`, `pos_ 3`.
4. `pos_ 3`: `c = '3'`. Digit → `read_number()` consumes just `'3'` (next char `'+'` isn't a
   digit) → pushes `NUMBER("3")`, `pos_ 4`.
5. `pos_ 4`: `c = '+'` → pushes `PLUS("+")`, `pos_ 5`.
6. `pos_ 5`: `c = '4'` → `read_number()` consumes just `'4'` → pushes `NUMBER("4")`,
   `pos_ 6`.
7. `pos_ 6`: `c = ')'` → pushes `RPAREN(")")`, `pos_ 7`.
8. `pos_ 7 == source_.size() (7)` → outer `while` condition fails, loop exits. `End`
   pushed unconditionally after the loop.

Final vector: `NUMBER(2) STAR LPAREN NUMBER(3) PLUS NUMBER(4) RPAREN END` — seven real
tokens plus the `End` marker, matching the pipeline diagram at the top of this lesson
exactly.

### CS lens

This entire `tokenize()` method is, underneath the C++, a **finite state machine**: at every
character, the current position and the small set of possible next actions (start a number,
emit a single-char token, skip whitespace, error) are fully determined by nothing but the
current character — there's no memory of "how we got here" beyond `pos_` itself. Also
recognized in: traffic lights, regex engines (literally compiled into state machines), and
CNC controllers reading G-code line by line — the same "modal, one-character/one-token-at-a-
time" shape recurs constantly.

### SE lens

`default: throw std::runtime_error(...)` for any unrecognized character is a deliberate
design choice: **fail loudly and immediately** rather than silently skip an unknown
character and produce a token list that's quietly wrong. The alternative — skip unknown
characters — would make `"2 $ 3"` silently lex as `NUMBER(2) NUMBER(3)`, a wrong-but-
plausible-looking result that could sail through the rest of the pipeline and produce a
confidently wrong answer instead of an honest error. The cost of failing loudly: every
caller of `tokenize()` now has to handle the exception — paid immediately, in the next unit.

---

## Concept Unit 5: Wiring the lexer into the server

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `server.cpp`.
- **Change type:** add `#include "lexer.h"`; replace the body of the response-building code.
- **Location:** the `#include` block at the top; the line `std::string response_body = body;`
  from Lesson 1, inside the `while (true)` loop.
- **Dependencies:** `lexer.h`/`lexer.cpp` from Concept Unit 4.

### The New Code — type it yourself

```cpp
        std::string response_body;
        try {
            Lexer lexer(body);
            std::vector<Token> tokens = lexer.tokenize();
            for (const Token& t : tokens) {
                response_body += token_type_name(t.type);
                if (!t.text.empty()) {
                    response_body += "(" + t.text + ")";
                }
                response_body += " ";
            }
        } catch (const std::exception& e) {
            response_body = std::string("lex error: ") + e.what();
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
#include "lexer.h"                                                       // ← new

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

        std::string response_body;                                       // ← changed
        try {                                                             // ← new
            Lexer lexer(body);                                            // ← new
            std::vector<Token> tokens = lexer.tokenize();                 // ← new
            for (const Token& t : tokens) {                               // ← new
                response_body += token_type_name(t.type);                 // ← new
                if (!t.text.empty()) {                                    // ← new
                    response_body += "(" + t.text + ")";                  // ← new
                }                                                         // ← new
                response_body += " ";                                     // ← new
            }                                                             // ← new
        } catch (const std::exception& e) {                               // ← new
            response_body = std::string("lex error: ") + e.what();        // ← new
        }                                                                 // ← new

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

The server's loop is otherwise untouched — accept, read, extract, log, respond, close, all
exactly as Lesson 1 left them. Only what fills `response_body` changed: instead of echoing
`body` unchanged, it now runs the lexer over it and reports either the token list or a
readable error.

### Mechanical walkthrough (new items only)

- `try { ... } catch (const std::exception& e) { ... }` — **(a) first appearance.** `tokenize()`
  can `throw` (Concept Unit 4's `default` case); without a `try`/`catch` around the call,
  that exception would propagate out of the request-handling loop entirely and crash the
  whole server on one bad request. Catching `std::exception&` (a reference, and the base
  type `std::runtime_error` derives from) catches it here instead, keeping the crash
  contained to a single request's response.
- `e.what()` — **(a) first appearance.** Every `std::exception` provides `.what()`, returning
  the human-readable message it was constructed with — here, exactly the
  `"unexpected character: $"` text set inside `read_number`'s sibling `default` branch.

### Commands

```
g++ -std=c++17 -Wall -c server.cpp -o server.o
g++ -std=c++17 -Wall -c lexer.cpp -o lexer.o
g++ server.o lexer.o -o server
./server
```

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "2*(3+4)"
NUMBER(2) STAR(*) LPAREN(() NUMBER(3) PLUS(+) NUMBER(4) RPAREN()) END

$ curl -X POST http://localhost:8080/evaluate -d "10 + 25 * 3"
NUMBER(10) PLUS(+) NUMBER(25) STAR(*) NUMBER(3) END

$ curl -X POST http://localhost:8080/evaluate -d "2 $ 3"
lex error: unexpected character: $
```

Server's own log for all three requests, real output:

```
math engine listening on port 8080
[08:56:58] POST /evaluate body="2*(3+4)"
[08:56:58] POST /evaluate body="10 + 25 * 3"
[08:56:58] POST /evaluate body="2 $ 3"
```

The third request proves the error path end to end: a bad character doesn't crash the
server (it's still listening, still logging afterward) and produces a readable message
instead of silently swallowing the problem.

### Connect

The token list printed here is still just *displayed*, not *understood* — the server has no
idea that `STAR` between two `NUMBER`s means multiplication. That's exactly what Lesson 3
adds: a parser that walks this same token list and builds an AST, replacing this unit's
`for` loop with an actual `evaluate()` call.

---

## Closing

### Connect the pieces

Trace `"2*(3+4)"` through everything this lesson added: it arrives as `body` (Lesson 1,
unchanged) → `Lexer lexer(body)` constructs a lexer over it → `tokenize()` runs the state
machine from Concept Unit 4's execution trace, character by character → the resulting
`vector<Token>` is walked in Concept Unit 5's `for` loop → each token's type is turned back
into readable text via `token_type_name` → concatenated into `response_body` → wrapped in
the same HTTP response machinery from Lesson 1, completely untouched → `curl` prints
`NUMBER(2) STAR(*) LPAREN(() NUMBER(3) PLUS(+) NUMBER(4) RPAREN()) END`.

### What breaks without this

Remove the `try`/`catch` (temporarily) and rebuild:

```cpp
        std::string response_body;
        Lexer lexer(body);
        std::vector<Token> tokens = lexer.tokenize();
        for (const Token& t : tokens) {
            response_body += token_type_name(t.type);
            if (!t.text.empty()) response_body += "(" + t.text + ")";
            response_body += " ";
        }
```

Rebuild, restart the server, and send the `"2 $ 3"` request again. Real result: the server
process terminates immediately (an uncaught exception calls `std::terminate`), and every
*other* in-flight or future request — not just the bad one — now gets nothing at all,
because there's no server left to answer. Restore the `try`/`catch` before moving on.

### Exercises

- Send `"()"` (parens with nothing between them) and read the token list — confirm by hand
  that the lexer doesn't care whether what's inside parentheses makes mathematical sense;
  that judgment doesn't exist yet, it belongs to the parser in Lesson 3.
- Send a request with two decimal points, like `"1.2.3"` — the current `read_number` only
  understands digits `0`–`9`, so trace by hand what tokens it actually produces, and confirm
  it does **not** error the way `"2 $ 3"` does. This is a real, currently-unhandled gap
  (decimal numbers aren't supported at all yet) — noting it, not fixing it yet.
- Add a new single-character token (`%` for modulo) to `TokenType`, `token_type_name`, and
  the `switch` in `tokenize()`, in all three places, and verify `"5 % 2"` lexes correctly.

### Definition of done

- [ ] `lexer.h` and `lexer.cpp` compile cleanly on their own (`g++ -c lexer.cpp`), separately
      from `server.cpp`.
- [ ] `server.cpp` includes `lexer.h` and links against `lexer.o` successfully.
- [ ] `2*(3+4)` and `10 + 25 * 3` both produce the correct token lists shown above.
- [ ] `2 $ 3` produces a `lex error` response and the server keeps running afterward.
- [ ] The "what breaks without this" exercise was actually run and reverted.
- [ ] Commit:

```
git add lexer.h lexer.cpp server.cpp
git commit -m "Add a Lexer and wire it into the server

Splits lexing into its own header/source pair rather than
growing server.cpp further - the first real module boundary
in the project. tokenize() throws on unrecognized characters
rather than silently skipping them; server.cpp catches that
per-request so one bad input can't take the whole server down.
Response currently just prints the token list - no parser yet."
```

Next lesson: a recursive-descent parser that turns this token list into an AST, so
`2*(3+4)` finally becomes `14` instead of just a list of labeled pieces.
