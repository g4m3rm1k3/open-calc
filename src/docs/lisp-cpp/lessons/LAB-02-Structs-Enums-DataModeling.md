# Lisp-CPP — LAB 02 — Structs and Enums: Modeling Data Without Classes

**Prerequisites:** LAB-01 complete. You understand stack vs. heap memory and pointers.

**What this lab adds:**
- `struct` — grouping related data under one name
- `enum` — giving names to a finite set of integer categories
- The exact `Token` data model the lexer will produce in LAB-05
- Understanding how data lays out in memory (which matters for performance and pointers)

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A token in a programming language has a type (number, symbol, parenthesis)
>    and a value ("42", "+", "("). How would you represent that pair in C++ using
>    only what you know so far?
> 2. If token types are the integers 0, 1, 2, 3... what is wrong with using plain
>    integers to represent them in code?
> 3. What does `sizeof(struct)` measure — the size of the struct definition, or
>    the size of one instance of it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp

=== Token Types ===
TOKEN_LPAREN  = 0
TOKEN_RPAREN  = 1
TOKEN_NUMBER  = 2
TOKEN_SYMBOL  = 3
TOKEN_BOOLEAN = 4
TOKEN_NIL     = 5

=== Token Instances ===
Token { type: LPAREN,  value: "(" }
Token { type: NUMBER,  value: "42" }
Token { type: SYMBOL,  value: "+" }
Token { type: RPAREN,  value: ")" }

=== Memory Layout ===
sizeof(TokenType) = 4 bytes
sizeof(Token)     = 40 bytes
Token at address: 0x7ffd...
  .type  at offset: 0
  .value at offset: 8
```

This is the exact data structure the lexer (LAB-05) will produce. You are
designing it now so the shape is clear before the code that fills it exists.

---

## Concept: Enums — Named Integer Constants

**What it is:** An `enum` (enumeration) declares a named set of integer constants.
Instead of writing `0`, `1`, `2` to mean "left paren", "right paren", "number",
you write `TOKEN_LPAREN`, `TOKEN_RPAREN`, `TOKEN_NUMBER`.

**The problem without it:**

```cpp
// Without enum — what does 2 mean here?
int token_type = 2;
if (token_type == 2) { /* ... */ }  // is 2 a number? a symbol? a boolean?
```

This code compiles and runs, but the number `2` carries no meaning. Six months
later, you will not remember what `2` means. Worse: nothing prevents you from
writing `token_type = 99`, which is not a valid token type. The compiler accepts
it silently.

**The solution — `enum class`:**

```cpp
enum class TokenType {
    LPAREN,    // = 0  (first value is always 0 by default)
    RPAREN,    // = 1
    NUMBER,    // = 2
    SYMBOL,    // = 3
    BOOLEAN,   // = 4
    NIL        // = 5
};

TokenType token_type = TokenType::NUMBER;
if (token_type == TokenType::NUMBER) { /* now this is readable */ }
```

**Why `enum class` instead of plain `enum`?**

There are two kinds of enums in C++:

| Feature | `enum` (old) | `enum class` (C++11, modern) |
|---------|-------------|---------------------------|
| Scope | Values leak into surrounding scope: `LPAREN` | Values are scoped: `TokenType::LPAREN` |
| Implicit conversion | Converts to `int` without warning | Refuses to convert to `int` without explicit cast |
| Name collisions | `LPAREN` might collide with something else | `TokenType::LPAREN` cannot collide |

Always use `enum class`. The old `enum` is a C legacy and a source of bugs.

**Underlying type — what integer does each value map to?**

By default, `enum class` values are `int` (4 bytes). The first value is 0, each
subsequent value is one more:

```cpp
enum class TokenType {
    LPAREN,    // 0
    RPAREN,    // 1
    NUMBER,    // 2
    SYMBOL,    // 3
};
```

You can assign explicit values if you want them non-sequential:

```cpp
enum class Color { RED = 10, GREEN = 20, BLUE = 30 };
```

**Converting enum to string for printing:**

`printf` cannot print `TokenType::NUMBER` directly — it is an integer underneath.
You must convert it to a string manually with a function:

```cpp
// A function that maps each enum value to its name.
// const char* is a C-style string (pointer to the first character).
const char* token_type_name(TokenType type) {
    switch (type) {
        case TokenType::LPAREN:  return "LPAREN";
        case TokenType::RPAREN:  return "RPAREN";
        case TokenType::NUMBER:  return "NUMBER";
        case TokenType::SYMBOL:  return "SYMBOL";
        case TokenType::BOOLEAN: return "BOOLEAN";
        case TokenType::NIL:     return "NIL";
    }
    return "UNKNOWN";  // should never reach here
}
```

**Transfer:** Enums under different names exist in every language. Rust's `enum`
is far more powerful (it can hold data — LAB-09 will show why). Java's `enum`
can have methods. TypeScript has `enum` and literal union types. The core idea
is universal: a finite set of named possibilities, where the compiler catches
invalid values.

---

## Concept: Structs — Grouping Related Data

**What it is:** A `struct` groups multiple variables (called **fields** or **members**)
under one name. An instance of a struct holds one value for each field.

**The problem without it:**

To represent a token without a struct, you need separate variables:

```cpp
int token1_type = 2;         // NUMBER
const char* token1_value = "42";

int token2_type = 3;         // SYMBOL
const char* token2_value = "+";
```

Now write a function to print a token — you must pass two arguments for every
token. Write a function to store a list of tokens — you need two parallel arrays.
Every operation is doubled, and the pairing is maintained only by convention,
not by the compiler.

**The solution:**

```cpp
struct Token {
    TokenType   type;   // which kind of token this is
    std::string value;  // the actual text ("42", "+", "(", etc.)
};
```

Now a token is one thing: one `Token` variable holds both pieces. You pass it
as one argument. You store it in one array. The compiler ensures the pairing
always holds.

**Declaring and using a struct:**

```cpp
// Declaration — defines the type. No memory is allocated yet.
struct Token {
    TokenType   type;
    std::string value;
};

// Definition — creates an instance. Memory IS allocated here.
Token tok;                    // uninitialized — dangerous, don't do this
Token tok2 = { TokenType::NUMBER, "42" };  // initialized with values

// Accessing fields with the dot operator:
printf("type: %s\n",  token_type_name(tok2.type));   // "NUMBER"
printf("value: %s\n", tok2.value.c_str());            // "42"
```

**What is `.c_str()`?**

`std::string` is a C++ object. `printf` expects a C-style string (`const char*`).
`.c_str()` returns the raw `const char*` pointer that `printf` needs.
Alternatively, use `std::cout` which understands `std::string` directly.
We stick with `printf` for now because it requires no additional includes.

**Struct initialization syntax:**

```cpp
// C++11 aggregate initialization — fields filled in order:
Token tok1 = { TokenType::LPAREN, "(" };

// C++20 designated initializers — fields filled by name (clearer):
Token tok2 = { .type = TokenType::NUMBER, .value = "42" };

// Both produce identical results. We use designated initializers when clarity matters.
```

**Structs vs. classes:**

In C++, `struct` and `class` are nearly identical — the only difference is
default access: struct fields are `public` by default, class fields are `private`.
We use `struct` for plain data containers (no hidden state, no invariants to protect).
We use `class` in LAB-20 when we need to enforce rules about how data is accessed.

**Transfer:** Every language has structs or their equivalent. Rust's `struct`, Go's
`struct`, TypeScript's `interface`/`type`, Python's `dataclass` — all group related
data under one name. The concept is older than C. In database terms, a struct is a
row, and its fields are columns.

---

## Concept: Memory Layout of Structs

**What it is:** The compiler places struct fields sequentially in memory, but may
insert padding bytes between fields to align them on word boundaries.

**Why alignment matters:**

CPUs on x86-64 are most efficient when reading values from memory addresses that
are multiples of the value's size:
- `int` (4 bytes) → must start at an address divisible by 4
- `double` (8 bytes) → must start at an address divisible by 8
- `char` (1 byte) → any address

If you declare fields in the wrong order, the compiler inserts invisible padding bytes:

```cpp
struct Padded {
    char   a;      // 1 byte at offset 0
                   // 3 bytes of padding — to align b to offset 4
    int    b;      // 4 bytes at offset 4
    char   c;      // 1 byte at offset 8
                   // 3 bytes of padding — to align the next field
};
// sizeof(Padded) = 12, not 6

struct Compact {
    int    b;      // 4 bytes at offset 0
    char   a;      // 1 byte at offset 4
    char   c;      // 1 byte at offset 5
                   // 2 bytes of padding (struct size must be multiple of largest field)
};
// sizeof(Compact) = 8, not 6
```

**Rule:** Place your largest fields first to minimize padding.

**Why this matters for the interpreter:**

You will have structs with `std::string` (24 bytes on most implementations),
`int` fields, and pointer fields. Understanding layout helps when ASAN shows you
a buffer overflow that touches padding bytes — you need to know the padding exists.

**Transfer:** Database engine designers obsess over struct layout because table rows
are structs stored in files. Game engine programmers arrange struct fields to
maximize cache performance. Rust's `#[repr(C)]` and Go's `structlayout` tool both
address the same issue.

---

## Step 1 — Define TokenType

Add the enum to `src/main.cpp`, above `main()`:

```cpp
#include <cstdio>
#include <string>  // ← add this — provides std::string

// TokenType: the complete set of token categories the lexer can produce.
// enum class ensures values are scoped (TokenType::LPAREN, not just LPAREN)
// and cannot be implicitly converted to int.
enum class TokenType {       // ← add this block
    LPAREN,    // (
    RPAREN,    // )
    NUMBER,    // 42, -7, 3.14
    SYMBOL,    // +, -, *, define, lambda
    BOOLEAN,   // #t, #f
    NIL        // '() — the empty list
};

// Convert a TokenType to a printable name.
// const char* is a C-style string — a pointer to the first character.
// The string literals returned are stored in the program's read-only data
// segment — they are valid forever, no allocation needed.
const char* token_type_name(TokenType type) {   // ← add this function
    switch (type) {
        case TokenType::LPAREN:  return "LPAREN";
        case TokenType::RPAREN:  return "RPAREN";
        case TokenType::NUMBER:  return "NUMBER";
        case TokenType::SYMBOL:  return "SYMBOL";
        case TokenType::BOOLEAN: return "BOOLEAN";
        case TokenType::NIL:     return "NIL";
    }
    return "UNKNOWN";
}

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);

    // Print all enum values and their underlying integers.
    // The cast (int) converts the enum to its underlying integer.
    printf("\n=== Token Types ===\n");
    printf("TOKEN_LPAREN  = %d\n", (int)TokenType::LPAREN);   // ← add this
    printf("TOKEN_RPAREN  = %d\n", (int)TokenType::RPAREN);
    printf("TOKEN_NUMBER  = %d\n", (int)TokenType::NUMBER);
    printf("TOKEN_SYMBOL  = %d\n", (int)TokenType::SYMBOL);
    printf("TOKEN_BOOLEAN = %d\n", (int)TokenType::BOOLEAN);
    printf("TOKEN_NIL     = %d\n", (int)TokenType::NIL);

    return 0;
}
```

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

Expected:
```
Lisp interpreter v0.1

=== Token Types ===
TOKEN_LPAREN  = 0
TOKEN_RPAREN  = 1
TOKEN_NUMBER  = 2
TOKEN_SYMBOL  = 3
TOKEN_BOOLEAN = 4
TOKEN_NIL     = 5
```

**Change something:** Add a new value `STRING` to the enum between `SYMBOL` and
`BOOLEAN`. Recompile and print it. Notice `BOOLEAN` is now 5 and `NIL` is 6 —
inserting a value renumbers everything after it. Remove `STRING` and rebuild.
This is why you should not hardcode enum integer values in files or databases
unless you explicitly assign them with `= N`.

---

## Step 2 — Define the Token Struct

Add the struct above `main()`, after the `token_type_name` function:

```cpp
// A single token produced by the lexer.
// type:  which kind of token (from the enum above)
// value: the original source text ("42", "+", "(", etc.)
struct Token {                    // ← add this
    TokenType   type;             // 4 bytes (enum is int-sized)
                                  // + 4 bytes padding (std::string must be 8-byte aligned)
    std::string value;            // 24 bytes on most 64-bit systems (pointer + size + capacity)
};
```

Now update `main()` to create and print tokens:

```cpp
    // ── TOKEN INSTANCES ───────────────────────────────────────────
    printf("\n=== Token Instances ===\n");

    // Designated initializer syntax — fields named explicitly.
    // Both fields initialized at the point of definition — no uninitialized state.
    Token tok_lparen  = { .type = TokenType::LPAREN,  .value = "(" };   // ← add
    Token tok_number  = { .type = TokenType::NUMBER,  .value = "42" };  // ← add
    Token tok_symbol  = { .type = TokenType::SYMBOL,  .value = "+" };   // ← add
    Token tok_rparen  = { .type = TokenType::RPAREN,  .value = ")" };   // ← add

    // .c_str(): convert std::string to const char* so printf can print it
    printf("Token { type: %-8s value: \"%s\" }\n",
           token_type_name(tok_lparen.type),  tok_lparen.value.c_str());
    printf("Token { type: %-8s value: \"%s\" }\n",
           token_type_name(tok_number.type),  tok_number.value.c_str());
    printf("Token { type: %-8s value: \"%s\" }\n",
           token_type_name(tok_symbol.type),  tok_symbol.value.c_str());
    printf("Token { type: %-8s value: \"%s\" }\n",
           token_type_name(tok_rparen.type),  tok_rparen.value.c_str());
```

**What is `%-8s`?**

`%s` prints a string. `-8` pads it to 8 characters, left-aligned (the `-`).
This makes the output columns line up. Remove the `-8` and rebuild to see
the difference.

### COMPILE AND RUN

Expected:
```
=== Token Instances ===
Token { type: LPAREN   value: "(" }
Token { type: NUMBER   value: "42" }
Token { type: SYMBOL   value: "+" }
Token { type: RPAREN   value: ")" }
```

---

## Step 3 — Inspect the Memory Layout

Add to `main()`:

```cpp
    // ── MEMORY LAYOUT ─────────────────────────────────────────────
    printf("\n=== Memory Layout ===\n");

    // sizeof the enum: how many bytes does one TokenType value occupy?
    printf("sizeof(TokenType) = %zu bytes\n", sizeof(TokenType));

    // sizeof the struct: how many bytes does one Token instance occupy?
    // This includes all fields AND any padding bytes.
    printf("sizeof(Token)     = %zu bytes\n", sizeof(Token));

    // offsetof: the byte offset of a field within the struct.
    // offsetof(struct_type, field_name)
    // This is a macro from <cstddef> — add the include.
    printf("  .type  at byte offset: %zu\n", offsetof(Token, type));
    printf("  .value at byte offset: %zu\n", offsetof(Token, value));
```

Add `#include <cstddef>` at the top (provides `offsetof`):

```cpp
#include <cstdio>
#include <cstddef>   // ← add this — provides offsetof, size_t, nullptr_t
#include <string>
```

### COMPILE AND RUN

Expected:
```
=== Memory Layout ===
sizeof(TokenType) = 4 bytes
sizeof(Token)     = 40 bytes
  .type  at byte offset: 0
  .value at byte offset: 8
```

**Interpreting this:**
- `type` is 4 bytes, starting at offset 0
- Offsets 4–7 are **padding** (4 invisible bytes added by the compiler)
- `value` (std::string, 24 bytes) starts at offset 8
- Total: 8 (type+padding) + 24 (string) + 8 (string's internal bookkeeping varies) = 40

The 4 bytes of padding exist because `std::string` requires 8-byte alignment.
The compiler inserts padding automatically — you never see it in source code,
but it occupies real memory.

---

## Step 4 — Clean Up for the Next Lab

Remove the diagnostic printing from `main()`. Keep only:

```cpp
#include <cstdio>
#include <cstddef>
#include <string>

enum class TokenType {
    LPAREN,
    RPAREN,
    NUMBER,
    SYMBOL,
    BOOLEAN,
    NIL
};

const char* token_type_name(TokenType type) {
    switch (type) {
        case TokenType::LPAREN:  return "LPAREN";
        case TokenType::RPAREN:  return "RPAREN";
        case TokenType::NUMBER:  return "NUMBER";
        case TokenType::SYMBOL:  return "SYMBOL";
        case TokenType::BOOLEAN: return "BOOLEAN";
        case TokenType::NIL:     return "NIL";
    }
    return "UNKNOWN";
}

struct Token {
    TokenType   type;
    std::string value;
};

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);
    return 0;
}
```

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

Expected: `Lisp interpreter v0.1` — the Token type exists in the binary,
ready for the lexer to use.

---

## 🎯 Challenge: Add a `print_token` Function

**You know:** `struct`, `enum class`, `switch`, `printf`, `.c_str()`.

**Task:** Write a function `void print_token(const Token& tok)` that prints
a token in this exact format:

```
Token { type: NUMBER, value: "42" }
```

Then call it on these four tokens in `main()` and confirm the output matches.

```cpp
Token tokens[4] = {
    { .type = TokenType::LPAREN,  .value = "("  },
    { .type = TokenType::NUMBER,  .value = "42" },
    { .type = TokenType::SYMBOL,  .value = "+"  },
    { .type = TokenType::RPAREN,  .value = ")"  },
};
```

**New syntax in the signature:** `const Token&` means "a reference to a Token
that I promise not to modify." This avoids copying the entire Token struct (40 bytes)
every time the function is called. References are explained fully in LAB-04.
For now, just use this syntax.

Try for at least 5 minutes before revealing the solution.

<details>
<summary>▶ Show Solution</summary>

```cpp
// const Token&: pass by reference — no copy of the struct is made.
// const: we promise not to modify the token inside this function.
void print_token(const Token& tok) {
    printf("Token { type: %s, value: \"%s\" }\n",
           token_type_name(tok.type),
           tok.value.c_str());
}

// In main():
Token tokens[4] = {
    { .type = TokenType::LPAREN,  .value = "("  },
    { .type = TokenType::NUMBER,  .value = "42" },
    { .type = TokenType::SYMBOL,  .value = "+"  },
    { .type = TokenType::RPAREN,  .value = ")"  },
};

for (int i = 0; i < 4; i++) {
    print_token(tokens[i]);
}
```

Output:
```
Token { type: LPAREN, value: "(" }
Token { type: NUMBER, value: "42" }
Token { type: SYMBOL, value: "+" }
Token { type: RPAREN, value: ")" }
```

**Key insight:** Passing `const Token&` is the idiomatic way to pass structs
to functions in C++. It avoids copying (pass-by-value would copy 40 bytes on
every call) while guaranteeing the function cannot modify the original
(the `const` makes it read-only). You will use `const T&` constantly in
this interpreter.

</details>

---

## What Just Happened

You built the Token data model that the entire interpreter is built on. Every
subsequent lab produces or consumes `Token` structs. The lexer (LAB-05) fills
a `std::vector<Token>`. The parser (LAB-07) reads from it. You designed this
before writing a single line of the lexer — and that is correct. Data models
come first.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Enum values print correctly | Each `TokenType` prints its name via `token_type_name` |
| Token struct compiles | `Token tok = { .type = TokenType::NUMBER, .value = "42" }` compiles |
| sizeof reported | `sizeof(Token)` prints 40 (or similar — depends on platform) |
| offsetof reported | `type` at 0, `value` at 8 (with 4 bytes padding between) |
| Challenge complete | `print_token` prints in exact format, called in a loop |

---

## Self-Check (answer from memory)

1. What is the difference between `enum` and `enum class`? Why do we use `enum class`?
2. What is padding in a struct, and why does the compiler insert it?
3. What does `const Token&` mean as a function parameter? What does it prevent?
4. Why does `tok.value.c_str()` exist — what problem does it solve?
5. If you add a new `TokenType` value between `NUMBER` and `SYMBOL`, what happens to the integer values of `SYMBOL`, `BOOLEAN`, and `NIL`?

---

## What's Next

LAB-03 introduces `std::vector` — the resizable array that holds the list of
tokens the lexer produces. You will also see `std::string` in more depth and
understand what those 24 bytes actually contain.

---

## Quick Check Answers

**1. How would you represent a token type + value pair using only what you knew before this lab?**
You would use two separate variables: an `int` for the type and a `const char*`
for the value. The pairing is maintained only by convention — nothing prevents
the two variables from getting out of sync. A struct enforces the pairing at
the type level: one `Token` is always one type and one value, together.

**2. What is wrong with using plain integers for token types?**
Integers carry no semantic meaning. `if (type == 2)` tells you nothing without
a comment. Nothing prevents `type = 99` which is not a valid token type —
the compiler accepts it. An `enum class` names the values, scopes them, and
refuses implicit conversion to/from `int`, catching invalid values at compile time.

**3. What does `sizeof(struct)` measure?**
The size of one instance of the struct in bytes, including all fields and any
padding bytes the compiler inserted for alignment. It measures the runtime
footprint, not the number of fields or the size of the definition.
