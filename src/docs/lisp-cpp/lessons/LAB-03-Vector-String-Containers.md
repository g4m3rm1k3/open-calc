# Lisp-CPP — LAB 03 — std::vector and std::string: Dynamic Collections

**Prerequisites:** LAB-02 complete. You have `TokenType`, `Token`, and understand structs, enums, and pointers.

**What this lab adds:**
- `std::vector` — the resizable array that holds the token list the lexer produces
- `std::string` — what those 24 bytes actually contain, and how it manages heap memory
- Range-based for loop — the idiomatic C++ way to iterate a vector
- The first working preview of lexer output: a vector of hardcoded tokens

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. An array in C has a fixed size set at compile time. What happens when you
>    need to add more tokens than you predicted?
> 2. If `std::vector` resizes itself dynamically, what memory region must it use?
> 3. You have a `std::vector<Token> tokens`. You call `tokens.push_back(tok)`.
>    Predict: does `tokens` store a copy of `tok` or a reference to it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== Token Vector ===
tokens.size()     = 5
tokens.capacity() = 8  (or similar — implementation-defined)
tokens[0]: Token { type: LPAREN,  value: "(" }
tokens[1]: Token { type: SYMBOL,  value: "+"  }
tokens[2]: Token { type: NUMBER,  value: "1"  }
tokens[3]: Token { type: NUMBER,  value: "2"  }
tokens[4]: Token { type: RPAREN,  value: ")" }

=== std::string Internals ===
str = "hello"
str.length() = 5
str.capacity() = 15  (SSO: fits without heap allocation)
str.data() (pointer to chars) = 0x7ffd...

str2 = "this string is longer than fifteen characters"
str2.length() = 46
str2.capacity() = 46  (heap allocated)
```

This is the exact output format the lexer will produce — the same vector, the same
tokens, just filled by reading actual source text instead of hardcoded values.

---

## Concept: C Arrays — The Problem std::vector Solves

**What it is:** A C array is a fixed-size, contiguous block of memory. Its size
is set at compile time and cannot change.

**The problem:**

```cpp
// C array — size must be known at compile time:
Token tokens[100];   // allocate exactly 100 Token slots, always

// What if the source file has 101 tokens? You overwrite memory past the array.
// ASAN catches this. Without ASAN, it silently corrupts whatever is nearby.
// What if the file has 3 tokens? 97 slots are wasted.
```

You could allocate a large fixed array and hope it's big enough. But "hope" is not
engineering. The lexer does not know how many tokens the source will produce before
reading it. You need a collection that grows.

**Raw dynamic array — what std::vector does internally:**

```cpp
// The manual approach (what you'd have to write yourself):
Token*  buffer   = new Token[4];  // start small
size_t  count    = 0;             // how many are used
size_t  capacity = 4;             // how many slots exist

void push(Token t) {
    if (count == capacity) {
        // Out of space — allocate a new, larger buffer:
        Token* new_buffer = new Token[capacity * 2];  // double the size

        // Copy all existing tokens to the new buffer:
        for (size_t i = 0; i < count; i++) {
            new_buffer[i] = buffer[i];
        }

        delete[] buffer;     // free the old buffer
        buffer   = new_buffer;
        capacity = capacity * 2;
    }
    buffer[count++] = t;   // store the new token
}
```

`std::vector` does exactly this — automatically, safely, and with RAII cleanup
when the vector goes out of scope. You never write this code by hand.

**Transfer:** Python's `list`, JavaScript's `Array`, Rust's `Vec`, Java's `ArrayList` —
all implement this exact "double when full" strategy. The amortized cost of
`push_back` is O(1) because doublings are rare. This is the most common data
structure in software. Understanding how it works internally is what separates
knowing how to use it from understanding what it costs.

---

## Concept: std::vector — The Resizable Array

**What it is:** `std::vector<T>` is a heap-allocated, resizable array that manages
its own memory. `T` is the type of element stored — `Token`, `int`, `std::string`,
anything.

**What it hides:**
- The raw `new[]` / `delete[]` of the backing buffer
- The reallocation and copy logic when capacity is exceeded
- The tracking of `size` vs `capacity`

**The invariant it protects:** Elements are always stored contiguously in memory.
`vec[0]` is adjacent to `vec[1]`. You can take `&vec[0]` and treat it as a C array
if you need to. This contiguity guarantee exists even after reallocations.

**The three numbers inside a vector:**

```
std::vector<Token> tokens:
┌──────────────────────────────┐
│ data:     0x602000...        │ ← pointer to heap buffer
│ size:     5                  │ ← how many tokens are stored
│ capacity: 8                  │ ← how many slots exist before reallocation
└──────────────────────────────┘

Heap buffer at 0x602000...:
┌─────┬─────┬─────┬─────┬─────┬──── ┬─────┬─────┐
│ tok0│ tok1│ tok2│ tok3│ tok4│  ?  │  ?  │  ?  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
  used (size=5)                  unused (capacity=8)
```

**Essential methods:**

| Method | What it does | Complexity |
|--------|-------------|------------|
| `push_back(t)` | Append a copy of `t` to the end | Amortized O(1) |
| `pop_back()` | Remove the last element | O(1) |
| `size()` | Number of elements currently stored | O(1) |
| `capacity()` | Number of slots before reallocation | O(1) |
| `operator[]` | Access element by index — no bounds check | O(1) |
| `at(i)` | Access element by index — throws if out of range | O(1) |
| `front()` | First element | O(1) |
| `back()` | Last element | O(1) |
| `empty()` | True if size == 0 | O(1) |
| `reserve(n)` | Pre-allocate capacity for n elements | O(n) if reallocating |
| `clear()` | Set size to 0 (does not free memory) | O(n) — destructs elements |

**`push_back` copies — this matters:**

```cpp
Token tok = { .type = TokenType::NUMBER, .value = "42" };
tokens.push_back(tok);  // copies tok into the vector's buffer

tok.value = "99";       // modifying tok does NOT change the copy in the vector
```

The vector owns its own copy. This is safe but has a cost: every `push_back`
copies the entire `Token` (40 bytes, including a string copy). For large objects,
use `emplace_back` (constructs in-place) or `push_back(std::move(tok))` (moves
instead of copies). We use `push_back` for clarity in this series.

---

## Concept: std::string — A vector of chars

**What it is:** `std::string` is essentially `std::vector<char>` with extra
string-specific methods. It manages a heap-allocated buffer of characters
and null-terminates it for C compatibility.

**Small String Optimization (SSO):**

Short strings (typically ≤ 15 characters) are stored directly inside the
`std::string` object — no heap allocation. The `std::string` object itself
has 24 bytes of internal space. If the string fits, those bytes hold the
characters. If not, the object holds a pointer to a heap buffer.

```
std::string "hello":          (5 chars — fits in SSO buffer)
┌─────────────────────────────┐
│ internal buffer: "hello\0"  │  ← 15 char buffer inside the object itself
│ size: 5                     │
│ SSO flag: true              │
└─────────────────────────────┘
No heap allocation.

std::string "this string is longer than fifteen characters":  (46 chars)
┌─────────────────────────────┐
│ data: 0x602000...           │  ← pointer to heap buffer
│ size: 46                    │
│ capacity: 46                │
└─────────────────────────────┘
Heap allocation of 47 bytes (46 chars + '\0').
```

**Why SSO matters for this interpreter:**

Most Lisp tokens are short: `(`, `)`, `+`, `-`, single-digit numbers.
SSO means these tokens cause zero heap allocations for their string field.
The vector's buffer holds the tokens, and each short string's characters
live inside the Token struct itself. This is a significant performance win
that happens automatically.

**Key methods:**

| Method | What it does |
|--------|-------------|
| `length()` / `size()` | Number of characters |
| `capacity()` | Number of chars before reallocation |
| `c_str()` | Raw `const char*` for C API compatibility |
| `data()` | Same as `c_str()` in C++11+ |
| `empty()` | True if length == 0 |
| `substr(pos, len)` | Copy of a substring |
| `find(ch)` | Position of first occurrence of char or string |
| `operator+` | Concatenation — creates a new string |
| `operator[]` | Character at index — no bounds check |
| `at(i)` | Character at index — throws if out of range |

---

## Concept: Range-Based For Loop

**What it is:** A C++11 syntax for iterating every element of a container
without manually managing indices.

**The problem with index-based loops:**

```cpp
for (int i = 0; i < (int)tokens.size(); i++) {
    print_token(tokens[i]);
}
```

This works but has problems:
- The cast `(int)` is needed because `size()` returns `size_t` (unsigned) and comparing signed to unsigned triggers a warning
- `tokens[i]` copies the token to pass to the function (unless you use `tokens[i]` directly and pass by reference)
- More characters to type for a simple "iterate everything" operation

**The range-based for loop:**

```cpp
// For each token in tokens — tok is a copy of the element:
for (Token tok : tokens) {
    print_token(tok);  // tok is a copy — modifying tok does not change the vector
}

// Better — const reference: no copy, read-only access:
for (const Token& tok : tokens) {
    print_token(tok);  // tok is an alias for the element in the vector
}

// If you need to modify elements in place:
for (Token& tok : tokens) {
    tok.value = "modified";  // modifies the element in the vector directly
}
```

**Always use `const T&` when you only read.** It avoids copying large objects
and signals intent. We use this pattern for every collection iteration in
this interpreter.

**What the compiler generates:**

The range-based for loop expands to:

```cpp
auto __begin = tokens.begin();  // iterator pointing to first element
auto __end   = tokens.end();    // iterator pointing past the last element
for (; __begin != __end; ++__begin) {
    const Token& tok = *__begin;
    print_token(tok);
}
```

You do not need to know about iterators yet — the range-based loop handles them.
Iterators are introduced when you need to do something a range-based loop cannot.

---

## Step 1 — Create the Token Vector

Update `src/main.cpp` to include `<vector>` and build a vector of tokens:

```cpp
#include <cstdio>
#include <cstddef>
#include <string>
#include <vector>    // ← add this — provides std::vector

// ... (TokenType enum, token_type_name, Token struct from LAB-02 — keep all of it)

// Print one token to stdout.
// const Token&: reference to avoid copying the 40-byte struct.
void print_token(const Token& tok) {
    printf("Token { type: %-8s value: \"%s\" }\n",
           token_type_name(tok.type),
           tok.value.c_str());
}

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);

    // ── TOKEN VECTOR ──────────────────────────────────────────────
    printf("\n=== Token Vector ===\n");

    // Declare an empty vector of Token.
    // The vector itself lives on the stack (it's a local variable).
    // The buffer holding the actual tokens lives on the heap (managed by vector).
    std::vector<Token> tokens;              // ← add this

    // push_back: copy the token into the vector's heap buffer.
    // These represent the tokens for "(+ 1 2)".
    tokens.push_back({ .type = TokenType::LPAREN,  .value = "(" });   // ← add
    tokens.push_back({ .type = TokenType::SYMBOL,  .value = "+" });   // ← add
    tokens.push_back({ .type = TokenType::NUMBER,  .value = "1" });   // ← add
    tokens.push_back({ .type = TokenType::NUMBER,  .value = "2" });   // ← add
    tokens.push_back({ .type = TokenType::RPAREN,  .value = ")" });   // ← add

    printf("tokens.size()     = %zu\n", tokens.size());       // ← add
    printf("tokens.capacity() = %zu\n", tokens.capacity());   // ← add

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

=== Token Vector ===
tokens.size()     = 5
tokens.capacity() = 8
```

**Why is capacity 8 when we only pushed 5 elements?**

The vector started with capacity 0. First `push_back` triggers an allocation —
capacity jumps to 1. Second push: capacity becomes 2. Third: 4. Fourth: 8.
Each reallocation doubles capacity. After 5 pushes, capacity is 8.
The doubling strategy means you only pay for reallocation O(log n) times
for n insertions.

**Change something:** Add `tokens.reserve(10)` before the push_back calls.
`reserve` pre-allocates without adding elements. Check `capacity()` — it will
be 10 before any push. After all 5 pushes, capacity is still 10 (no reallocation).
This is how the lexer will pre-size the vector when it knows the source length.
Remove the reserve call and rebuild.

---

## Step 2 — Print the Vector With a Range-Based For Loop

Add to `main()` after the capacity print:

```cpp
    // Range-based for loop: iterate every element.
    // const Token&: reference to the element — no copy of the 40-byte struct.
    for (const Token& tok : tokens) {    // ← add this block
        print_token(tok);
    }
```

### COMPILE AND RUN

Expected:
```
=== Token Vector ===
tokens.size()     = 5
tokens.capacity() = 8
Token { type: LPAREN    value: "(" }
Token { type: SYMBOL    value: "+" }
Token { type: NUMBER    value: "1" }
Token { type: NUMBER    value: "2" }
Token { type: RPAREN    value: ")" }
```

---

## Step 3 — Inspect std::string Internals

Add to `main()`:

```cpp
    // ── STD::STRING INTERNALS ─────────────────────────────────────
    printf("\n=== std::string Internals ===\n");

    std::string short_str = "hello";    // 5 chars — fits in SSO buffer
    printf("short_str = \"%s\"\n", short_str.c_str());
    printf("  length()   = %zu\n", short_str.length());
    printf("  capacity() = %zu\n", short_str.capacity());
    // data() returns a pointer to the first character.
    // For SSO strings, this points inside the std::string object (on the stack).
    printf("  data()     = %p\n", (void*)short_str.data());
    printf("  &short_str = %p\n", (void*)&short_str);
    // For SSO: data() and &short_str are close — data is inside the object.

    printf("\n");

    std::string long_str = "this string is longer than fifteen characters";
    printf("long_str = \"%s\"\n", long_str.c_str());
    printf("  length()   = %zu\n", long_str.length());
    printf("  capacity() = %zu\n", long_str.capacity());
    printf("  data()     = %p\n", (void*)long_str.data());
    printf("  &long_str  = %p\n", (void*)&long_str);
    // For heap strings: data() is far from &long_str — it points to a heap buffer.
```

### COMPILE AND RUN

Observe the addresses:
- `short_str.data()` is close to `&short_str` — the characters live inside the object (SSO)
- `long_str.data()` is far from `&long_str` — the characters live on the heap

This has a real consequence: if you copy a `std::vector<Token>` that contains
tokens with long values, every long string triggers a heap allocation for the copy.
Short tokens (most tokens) copy for free thanks to SSO.

---

## Step 4 — Restore Clean main()

The interpreter entry point should be clean. Replace `main()` contents with:

```cpp
int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);
    return 0;
}
```

Keep all the type definitions at the top. The vector knowledge lives in your
head — you will apply it in LAB-05 when the lexer fills a real token vector.

### COMPILE AND RUN

Expected: `Lisp interpreter v0.1`

---

## 🎯 Challenge: Write a `print_token_list` Function

**You know:** `std::vector`, `const T&`, range-based for, `printf`.

**Task:** Write `void print_token_list(const std::vector<Token>& tokens)` that
prints the entire token list in this format:

```
TokenList [5 tokens]:
  [0] LPAREN   "("
  [1] SYMBOL   "+"
  [2] NUMBER   "1"
  [3] NUMBER   "2"
  [4] RPAREN   ")"
```

The index, type name (padded to 8 chars), and quoted value on each line.
The header shows the count.

**Starting code:**
```cpp
void print_token_list(const std::vector<Token>& tokens) {
    // YOUR CODE HERE
}
```

**Hints:**
1. You need the index — use an index-based for loop or add a counter variable.
2. `%-8s` pads a string to 8 characters, left-aligned.

<details>
<summary>▶ Show Solution</summary>

```cpp
void print_token_list(const std::vector<Token>& tokens) {
    // Print the header showing total count.
    // tokens.size() returns size_t — %zu is the correct format specifier.
    printf("TokenList [%zu tokens]:\n", tokens.size());

    // Index-based loop: we need the index for the [0], [1], ... prefix.
    // size_t is the correct type for indices into vectors (unsigned, matches size()).
    for (size_t i = 0; i < tokens.size(); i++) {
        const Token& tok = tokens[i];  // reference — no copy
        printf("  [%zu] %-8s \"%s\"\n",
               i,
               token_type_name(tok.type),
               tok.value.c_str());
    }
}
```

**Key insight:** The function takes `const std::vector<Token>&` — a reference
to the vector, not a copy. Copying a vector copies every element — all 5 tokens,
each 40 bytes = 200 bytes just to print them. The reference costs 8 bytes
(one pointer) and zero copies. For a function that only reads data, always
take `const T&`.

</details>

---

## What Just Happened

You now have the two containers this interpreter relies on:

- `std::vector<Token>` — the lexer's output, the parser's input. A resizable
  array that grows as tokens are appended.
- `std::string` — every token's text value. Short strings live inside the struct
  (SSO), long strings on the heap — automatically.

In LAB-05 (the lexer), you will replace the hardcoded `push_back` calls with
a function that reads a source string character by character and calls
`push_back` with real tokens. The vector will fill itself. Everything here transfers directly.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Vector holds 5 tokens | `tokens.size()` prints 5 |
| Capacity doubles | `capacity()` prints 8 after 5 pushes |
| Range-based for works | All 5 tokens printed correctly |
| SSO observed | `short_str.data()` address is near `&short_str` |
| Heap string observed | `long_str.data()` address is far from `&long_str` |
| Challenge complete | `print_token_list` prints in exact specified format |

---

## Self-Check (answer from memory)

1. What are the three fields inside a `std::vector`? What does each track?
2. Why does pushing 5 elements into an empty vector result in `capacity() == 8`?
3. What is SSO and when does it activate?
4. What is the difference between `tokens[i]` and `tokens.at(i)`?
5. Why does `print_token_list` take `const std::vector<Token>&` instead of `std::vector<Token>`?

---

## What's Next

LAB-04 introduces functions at depth — the substitution model, pass by value vs.
pass by reference, and the call stack you now understand. You will build the
mathematical skeleton of the evaluator before the parser exists.

---

## Quick Check Answers

**1. An array has fixed size. What happens when you need more tokens?**
With a C array, you overflow it — writing past the end of the allocated buffer.
ASAN catches this; without ASAN it silently corrupts whatever memory follows
the array. `std::vector` solves this by doubling its capacity when full:
it allocates a new buffer, copies all elements, frees the old buffer, and
continues. This reallocation is invisible to the caller.

**2. std::vector grows on the heap — why must it use the heap?**
The stack has a fixed size (set at process start, typically 1–8 MB) and
is automatically managed by function call/return. You cannot resize the stack.
The heap is the only memory region where you can request arbitrary amounts of
memory at runtime and have it persist until you explicitly free it.

**3. `push_back(tok)` — copy or reference?**
A copy. `push_back` copies the token into the vector's internal buffer.
The vector owns its elements — it does not hold references to external
variables. This means modifying `tok` after `push_back` does not affect
the copy inside the vector. It also means the vector is safe to use after
`tok` goes out of scope.
