# Lisp-CPP — LAB 09 — Lisp Values: The Tagged Union (Sum Type)

**Prerequisites:** LAB-08 complete. `eval()` returns `int`. The pipeline works for arithmetic.

**What this lab adds:**
- `LispVal` — a struct that can hold any Lisp value: number, boolean, nil, or symbol
- The tagged union pattern — a C struct with a type tag and a `union`
- Replacing `eval()`'s `int` return type with `LispVal`
- `print_val()` — printing any LispVal correctly

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Lisp values can be numbers, booleans, nil, symbols, lists, or functions.
>    How would you represent "any one of these" in a language with a static type system?
> 2. A C `union` stores multiple types in the same memory location. What does
>    the size of a union depend on?
> 3. Why is a raw `union` unsafe? What information is missing?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== LispVal printing ===
make_number(42)     → 42
make_number(-7)     → -7
make_bool(true)     → #t
make_bool(false)    → #f
make_nil()          → nil
make_symbol("foo")  → foo

=== Evaluator with LispVal ===
eval("(+ 1 2)")             = 3
eval("(* 3 4)")             = 12
eval("(= 3 3)")             = #t
eval("(= 3 4)")             = #f
eval("(+ (* 2 3) 4)")       = 10

Error: eval("(foo 1 2)")    = unknown operator: foo
```

`eval()` now returns a `LispVal`. Booleans print as `#t` / `#f`. Numbers print as integers.

---

## Concept: The Sum Type Problem

**What it is:** A Lisp value can be exactly one of several types at any given moment.
In a statically-typed language, you need a type that represents "this is either A or B or C."
This is called a **sum type**, **variant type**, or **tagged union**.

**The problem with separate types:**

```cpp
// This does NOT work — a function can only return one type:
int    eval_number(const Node* node);   // returns int
bool   eval_bool(const Node* node);     // returns bool
// Which do you call? You don't know until runtime.
```

You cannot write `auto result = eval(node)` where `result` might be an int or a bool.
C++ is statically typed — the compiler needs to know the type at compile time.

**The problem with inheritance:**

```cpp
struct Value {};
struct NumberValue : Value { int n; };
struct BoolValue   : Value { bool b; };
// eval returns Value* — but every access requires a dynamic_cast.
// Every heap allocation for a simple integer.
```

This works but is expensive: every value is a heap allocation, every access is
a virtual dispatch or dynamic cast.

**The solution — tagged union:**

```cpp
struct LispVal {
    enum class Tag { NUMBER, BOOL, NIL, SYMBOL } tag;  // which type is active
    union {
        int64_t  number;   // active when tag == NUMBER
        bool     boolean;  // active when tag == BOOL
        // NIL has no data — the tag alone is sufficient
    } data;
    std::string string_data;  // used when tag == SYMBOL (cannot go in union)
};
```

One struct. Fixed size. The `tag` field tells you which union member is valid.
No heap allocation for small values.

---

## Concept: C Unions

**What it is:** A C `union` stores all its members in the same memory location.
At any time, only one member is "active" — the one most recently written.
All members share the same starting address.

**Size of a union:**

```cpp
union Example {
    int    a;    // 4 bytes
    double b;    // 8 bytes
    char   c;    // 1 byte
};
// sizeof(Example) = 8 — the size of the LARGEST member
```

The union is large enough to hold any of its members. Smaller members occupy
only part of the space. Reading a member that was not written last is undefined
behavior.

**Layout in memory:**

```
Address: 0x100  0x101  0x102  0x103  0x104  0x105  0x106  0x107
         [────────────────────b (double)─────────────────────────]
         [──────a (int)───────]
         [c]
```

All members start at the same address (0x100). Writing `b` fills all 8 bytes.
Writing `a` fills the first 4. Reading `a` after writing `b` gives you the
lower 4 bytes of the double — garbage from a type-safety perspective.

**The unsafe part:**

```cpp
union Example e;
e.b = 3.14;         // write the double
int x = e.a;       // read the int — UNDEFINED BEHAVIOR
                   // you are reinterpreting the bytes of a double as an int
```

There is NO runtime check. The union does not know which member was last written.
This is why we always pair a union with a tag — the tag tells us which member is active.

**Transfer:** C's `union` is the most dangerous form. Python's dynamic typing is
a tagged union under the hood — every Python object has a type pointer. Rust's
`enum` with data is a safe tagged union that the compiler enforces. C++'s
`std::variant` (LAB-19) is the safe version of what we build here manually.

---

## Concept: Why `std::string` Cannot Go in a Union

**What it is:** Only types that are "trivially constructible/destructible" can
safely live in a raw C `union`. `std::string` is not trivial — it has a constructor
that allocates memory and a destructor that frees it.

**The problem:**

```cpp
union Bad {
    int         number;
    std::string text;   // COMPILE ERROR or undefined behavior
};
```

If you write `number`, the string's constructor was never called — its internal
state is garbage. If you then write `text`, which destructor runs when the union
goes out of scope? The compiler does not know. In C++, this is either a compile
error or deeply undefined behavior.

**The workaround for `LispVal`:**

Keep non-trivial types (strings, vectors) outside the union as separate fields.
Use the tag to know which external field is active:

```cpp
struct LispVal {
    enum class Tag { NUMBER, BOOL, NIL, SYMBOL } tag;
    union {
        int64_t  number;    // trivial — safe in union
        bool     boolean;   // trivial — safe in union
    } as;                   // named 'as' for readability: val.as.number
    std::string string_data; // for SYMBOL — outside the union
};
```

This is the standard pre-C++17 approach. LAB-19 replaces this entire design
with `std::variant`, which handles non-trivial types correctly.

---

## Step 1 — Create `src/value.h` and `src/value.cpp`

```bash
touch src/value.h
touch src/value.cpp
```

Update `CMakeLists.txt`:

```cmake
add_executable(lisp
    src/main.cpp
    src/lexer.cpp
    src/node.cpp
    src/parser.cpp
    src/eval.cpp
    src/value.cpp   # ← add this
)
```

**`src/value.h`:**

```cpp
#pragma once

#include <string>
#include <cstdint>   // int64_t — a guaranteed 64-bit signed integer

// LispVal: a Lisp value — the return type of eval().
// Exactly one of the tag values is active at any time.
// The 'as' union holds the value for NUMBER and BOOL.
// The 'string_data' field holds the value for SYMBOL.
// NIL has no data — the tag alone is sufficient.
struct LispVal {

    // Tag: which type of value this LispVal holds.
    enum class Tag {
        NUMBER,   // an integer: 0, 42, -7
        BOOL,     // a boolean: #t or #f
        NIL,      // the empty list / absence of value
        SYMBOL    // a symbol name (for error messages and future use)
    };

    Tag tag;   // always valid — tells you which union member to read

    // The union holds the actual data.
    // Only the member corresponding to 'tag' is valid to read.
    union {
        int64_t number;   // active when tag == NUMBER
                          // int64_t: 64-bit integer — handles large factorials
        bool    boolean;  // active when tag == BOOL
    } as;

    // Non-trivial types live outside the union:
    std::string string_data;   // active when tag == SYMBOL
};

// Factory functions — the only correct way to construct a LispVal.
// Using factories prevents partially-initialized LispVals.
LispVal make_number(int64_t n);
LispVal make_bool(bool b);
LispVal make_nil();
LispVal make_symbol(const std::string& name);

// Print a LispVal in Lisp notation:
// NUMBER  → "42"
// BOOL    → "#t" or "#f"
// NIL     → "nil"
// SYMBOL  → the symbol name
void print_val(const LispVal& val);

// Convert a LispVal to its Lisp-notation string (for error messages).
std::string val_to_string(const LispVal& val);
```

**`src/value.cpp`:**

```cpp
#include "value.h"
#include <cstdio>     // printf
#include <stdexcept>  // std::runtime_error

// make_number: construct a LispVal holding an integer.
LispVal make_number(int64_t n) {
    LispVal val;
    val.tag       = LispVal::Tag::NUMBER;   // declare which member is active
    val.as.number = n;                      // write the active member
    // val.as.boolean is NOT set — reading it would be undefined behavior
    return val;
}

LispVal make_bool(bool b) {
    LispVal val;
    val.tag        = LispVal::Tag::BOOL;
    val.as.boolean = b;
    return val;
}

LispVal make_nil() {
    LispVal val;
    val.tag = LispVal::Tag::NIL;
    // NIL has no data — no union member to set
    return val;
}

LispVal make_symbol(const std::string& name) {
    LispVal val;
    val.tag         = LispVal::Tag::SYMBOL;
    val.string_data = name;   // set the external string field
    return val;
}

// val_to_string: convert to Lisp-notation string.
std::string val_to_string(const LispVal& val) {
    switch (val.tag) {
        case LispVal::Tag::NUMBER:
            // std::to_string: converts int64_t to its decimal string representation
            return std::to_string(val.as.number);

        case LispVal::Tag::BOOL:
            // Lisp boolean literals: #t for true, #f for false
            return val.as.boolean ? "#t" : "#f";

        case LispVal::Tag::NIL:
            return "nil";

        case LispVal::Tag::SYMBOL:
            return val.string_data;
    }
    return "?";   // unreachable — all Tag values handled above
}

// print_val: print to stdout.
void print_val(const LispVal& val) {
    printf("%s", val_to_string(val).c_str());
}
```

---

## Step 2 — Update `src/eval.h` and `src/eval.cpp`

**`src/eval.h`** — change return type:

```cpp
#pragma once

#include "node.h"
#include "value.h"   // ← add this

// eval now returns LispVal instead of int.
LispVal eval(const Node* node);    // ← was: int eval(...)
```

**`src/eval.cpp`** — update the return type and all return statements:

```cpp
#include "eval.h"
#include "value.h"   // ← add this
#include <stdexcept>
#include <string>

LispVal eval(const Node* node) {  // ← was: int eval(...)

    // ── ATOM EVALUATION ──────────────────────────────────────────
    if (node->kind == NodeKind::ATOM) {
        try {
            // Try to parse as integer:
            int64_t n = std::stoll(node->value);   // stoll: string-to-long-long (64-bit)
            return make_number(n);                  // ← was: return n;
        } catch (const std::invalid_argument&) {
            throw std::runtime_error(
                std::string("Unbound symbol: '") + node->value + "'");
        }
    }

    // ── LIST EVALUATION ──────────────────────────────────────────
    if (node->kind == NodeKind::LIST) {
        if (node->children.empty()) {
            return make_nil();   // empty list → nil   ← was: throw
        }

        const Node* op_node = node->children[0];
        if (op_node->kind != NodeKind::ATOM) {
            throw std::runtime_error("Operator must be a symbol");
        }
        const std::string& op = op_node->value;

        // ── ARITHMETIC ───────────────────────────────────────────
        if (op == "+") {
            int64_t result = 0;
            for (size_t i = 1; i < node->children.size(); i++) {
                LispVal v = eval(node->children[i]);
                if (v.tag != LispVal::Tag::NUMBER) {
                    throw std::runtime_error("'+' requires number arguments");
                }
                result += v.as.number;
            }
            return make_number(result);   // ← was: return result;
        }

        if (op == "-") {
            if (node->children.size() < 2) {
                throw std::runtime_error("'-' requires at least one argument");
            }
            LispVal first = eval(node->children[1]);
            if (first.tag != LispVal::Tag::NUMBER) {
                throw std::runtime_error("'-' requires number arguments");
            }
            if (node->children.size() == 2) {
                return make_number(-first.as.number);
            }
            int64_t result = first.as.number;
            for (size_t i = 2; i < node->children.size(); i++) {
                LispVal v = eval(node->children[i]);
                if (v.tag != LispVal::Tag::NUMBER) {
                    throw std::runtime_error("'-' requires number arguments");
                }
                result -= v.as.number;
            }
            return make_number(result);
        }

        if (op == "*") {
            int64_t result = 1;
            for (size_t i = 1; i < node->children.size(); i++) {
                LispVal v = eval(node->children[i]);
                if (v.tag != LispVal::Tag::NUMBER) {
                    throw std::runtime_error("'*' requires number arguments");
                }
                result *= v.as.number;
            }
            return make_number(result);
        }

        if (op == "/") {
            if (node->children.size() != 3) {
                throw std::runtime_error("'/' requires exactly two arguments");
            }
            LispVal a = eval(node->children[1]);
            LispVal b = eval(node->children[2]);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER) {
                throw std::runtime_error("'/' requires number arguments");
            }
            if (b.as.number == 0) {
                throw std::runtime_error("division by zero");
            }
            return make_number(a.as.number / b.as.number);
        }

        // ── COMPARISON ───────────────────────────────────────────
        if (op == "=") {
            if (node->children.size() != 3) {
                throw std::runtime_error("'=' requires two arguments");
            }
            LispVal a = eval(node->children[1]);
            LispVal b = eval(node->children[2]);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER) {
                throw std::runtime_error("'=' requires number arguments");
            }
            return make_bool(a.as.number == b.as.number);   // ← returns BOOL now
        }

        if (op == "<") {
            if (node->children.size() != 3) throw std::runtime_error("'<' needs 2 args");
            LispVal a = eval(node->children[1]);
            LispVal b = eval(node->children[2]);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER)
                throw std::runtime_error("'<' requires number arguments");
            return make_bool(a.as.number < b.as.number);
        }

        if (op == ">") {
            if (node->children.size() != 3) throw std::runtime_error("'>' needs 2 args");
            LispVal a = eval(node->children[1]);
            LispVal b = eval(node->children[2]);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER)
                throw std::runtime_error("'>' requires number arguments");
            return make_bool(a.as.number > b.as.number);
        }

        throw std::runtime_error(std::string("unknown operator: ") + op);
    }

    throw std::runtime_error("eval: unrecognized node kind");
}
```

---

## Step 3 — Update `src/main.cpp`

```cpp
#include <cstdio>
#include <stdexcept>
#include "lexer.h"
#include "node.h"
#include "parser.h"
#include "eval.h"
#include "value.h"   // ← add this

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

void test_eval(const char* source) {
    try {
        std::vector<Token> tokens = tokenize(source);
        Node* tree = parse(tokens);
        LispVal result = eval(tree);   // ← was: int result
        free_tree(tree);
        printf("eval(\"%s\") = %s\n", source, val_to_string(result).c_str());
    } catch (const std::runtime_error& e) {
        printf("Error: eval(\"%s\") = %s\n", source, e.what());
    }
}

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n\n", VERSION_MAJOR, VERSION_MINOR);

    // LispVal factory demonstration:
    printf("=== LispVal printing ===\n");
    print_val(make_number(42));   printf("\n");
    print_val(make_bool(true));   printf("\n");
    print_val(make_bool(false));  printf("\n");
    print_val(make_nil());        printf("\n");
    print_val(make_symbol("foo")); printf("\n");

    printf("\n=== Evaluator with LispVal ===\n");
    test_eval("(+ 1 2)");
    test_eval("(* 3 4)");
    test_eval("(= 3 3)");
    test_eval("(= 3 4)");
    test_eval("(+ (* 2 3) 4)");
    printf("\n");
    test_eval("(foo 1 2)");

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

=== LispVal printing ===
42
#t
#f
nil
foo

=== Evaluator with LispVal ===
eval("(+ 1 2)") = 3
eval("(* 3 4)") = 12
eval("(= 3 3)") = #t
eval("(= 3 4)") = #f
eval("(+ (* 2 3) 4)") = 10

Error: eval("(foo 1 2)") = unknown operator: foo
```

---

## What Just Happened

`eval()` now returns a real Lisp value — not just an integer. The tagged union
pattern gives you a single type that can hold any of several alternatives, with
the `tag` field acting as a runtime discriminant. Every access to the union's
data is gated by checking the tag first.

This is the foundation on which booleans, nil, lists, and eventually closures
will be added in later labs. Each new value type is a new `Tag` value and new
factory function — the rest of the interpreter doesn't change.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `make_number(42)` prints `42` | Factory and `val_to_string` correct |
| `make_bool(true)` prints `#t` | Boolean tag handled |
| `make_nil()` prints `nil` | NIL tag handled |
| `eval("(= 3 3)")` returns `#t` | Comparison returns BOOL LispVal |
| `eval("(= 3 4)")` returns `#f` | False branch of comparison |
| Arithmetic still works | `(+ (* 2 3) 4)` = 10 |

---

## Self-Check

1. What is a tagged union? What two components make it safe to use?
2. Why can't `std::string` be placed directly inside a C `union`?
3. `sizeof(LispVal::as)` — what is it, and why?
4. What is `int64_t` and why is it used instead of `int`?
5. If you read `val.as.boolean` when `val.tag == Tag::NUMBER`, what happens?

---

## What's Next

LAB-10 introduces the Environment — the data structure that maps names to values.
Without it, `(define x 10)` and `x` mean nothing. The environment is a hash map
with a parent pointer, implementing lexical scope as a linked chain of frames.

---

## Quick Check Answers

**1. How to represent "any one of several types" in a static type system?**
A tagged union (sum type): a struct containing a tag enum (which type is active)
and a union (the actual data). The tag tells you which union member is safe to read.
In modern C++, `std::variant` handles this safely. In Rust, `enum` with data.
In Haskell, algebraic data types. All represent the same concept.

**2. What does union size depend on?**
The size of its largest member. The union must be large enough to hold any of its
members. Smaller members occupy only part of the space. A `union { int a; double b; }`
is 8 bytes — the size of `double`, the largest member.

**3. Why is a raw union unsafe?**
It stores no information about which member was last written. Reading a member that
was not the last one written is undefined behavior — you reinterpret raw bytes as
the wrong type. The fix is a tag: an external field that records which member is currently active.
