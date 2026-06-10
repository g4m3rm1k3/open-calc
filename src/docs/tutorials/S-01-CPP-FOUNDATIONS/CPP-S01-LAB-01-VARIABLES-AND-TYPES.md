# C++ Masterclass — S-01 — LAB 01 — Variables, Types, and Memory

**Prerequisites:** LAB 00. You have `g++`, `make`, and a working `main.cpp` that prints one line.

**What this lab adds:**
- A mental model of what a "variable" actually is in hardware terms
- The six fundamental C++ types and why each exists
- The `sizeof` operator — measuring how much memory each type uses
- Binary representation — why integers have limits
- Two's complement — how negative numbers are stored
- Integer overflow — what happens when you exceed those limits
- A running "type inspector" program you extend step by step

**Time:** ~75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your program declares `int score = 100;`. Where does the number `100` live
>    while the program is running? In the source code file? In the `.exe`? Somewhere else?
> 2. Why do you think C++ has both `int` and `float` as separate types?
>    What is the fundamental difference between a whole number and a decimal number
>    that would require a different storage strategy?
> 3. Predict: If the largest value an `int` can store is 2,147,483,647 and you
>    add 1 to it, what do you think happens?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **type inspector** — a program that declares one variable of each fundamental type,
prints its value, and reports exactly how many bytes of memory it occupies:

```
=== C++ Type Inspector ===

int       score    = 100          size: 4 bytes
double    pi       = 3.14159      size: 8 bytes
float     gravity  = 9.81         size: 4 bytes
char      grade    = A            size: 1 byte
bool      alive    = 1            size: 1 byte

Overflow demo:
  max int: 2147483647
  max int + 1: -2147483648   ← wraps around!
```

---

## Part 1 — What a Variable Actually Is

### Concept: Variables — Named Locations in RAM

**What it is:** A variable is a named, reserved location in RAM (Random Access Memory —
the fast, temporary storage your computer uses while programs run). When you declare
`int score = 100;`, the computer reserves a small piece of RAM, labels it `score`, and
stores the value `100` there.

**Why RAM, not the hard drive?** RAM is fast — your CPU can read from it billions of
times per second. The hard drive (or SSD) is persistent but thousands of times slower.
Programs use RAM for all working data and only touch the hard drive for files.

**Why "temporary"?** RAM loses its contents when power is removed. When your program
ends, the OS reclaims the RAM your variables occupied. Nothing persists unless you
explicitly write to a file (as in LAB 13 — File I/O).

**The problem before (no variables):** Without named locations, you would have to
remember the exact memory address where every piece of data lives — for example,
address `0x7FFE3A40` holds the player's score. Programs written this way (early
machine code) are impossible to read or maintain.

**The solution:** A variable gives a meaningful name (`score`) to a memory address.
The compiler translates `score` back into the actual address everywhere it appears.
You never need to know or manage the address yourself.

**What it hides:** Memory addresses. The variable `score` might live at address
`0x7FFE3A40` or `0x00BCDEF0` — you don't know, and you don't need to. The compiler
tracks it. The name is the interface; the address is the hidden implementation.

**The protected invariant:** The name `score` always refers to the same memory location
within its scope. You cannot accidentally use the wrong address by making a typo in a
number — you use the name, and the compiler enforces the mapping.

**Canonical example:**
Think of RAM as a wall of labelled mailboxes. Each mailbox holds one piece of data.
A variable is a specific mailbox with a name written on the front (`score`). The compiler
assigns each variable to a mailbox slot. You write to `score`; the compiler handles
which slot that actually is.

```
RAM (simplified)
Slot 0x7FFE3A40  │  100  │  ← "score" lives here
Slot 0x7FFE3A44  │  3.14 │  ← "pi" lives here
Slot 0x7FFE3A48  │   0   │  ← "counter" lives here
```

**Watch for:** Variables in C++ must be **declared** (told to the compiler) before they
are **used** (read or written). Reading an undeclared variable is a compile error.
Reading a declared but **uninitialized** variable (one you never assigned a value) is
**undefined behavior** — the program might print garbage, crash, or do nothing. Always
initialize variables when you declare them.

---

## Part 2 — Memory Size and Binary Representation

### Math: Binary — How Computers Store Numbers

**What it computes:** Binary is the number system computers use internally. Every piece
of data stored in RAM is ultimately a sequence of **bits** (binary digits) — each bit
is either 0 or 1.

**Why 0s and 1s?** Computer hardware stores data using electrical signals. A signal
above a voltage threshold = 1. Below it = 0. Two states are physically reliable;
ten states (for decimal) are not. Binary is a consequence of physics, not a design choice.

**The real-world analogy:** Decimal uses 10 digits (0–9) because we have 10 fingers.
Every column is worth 10× the previous (ones, tens, hundreds...). Binary uses 2 digits
(0–1). Every column is worth 2× the previous (ones, twos, fours, eights...).

**Counting in binary:**

```
Decimal │ Binary │ How to read it
────────┼────────┼──────────────────────────────────────────────
      0 │    0   │ 0
      1 │    1   │ 1
      2 │   10   │ 1×2 + 0×1 = 2
      3 │   11   │ 1×2 + 1×1 = 3
      4 │  100   │ 1×4 + 0×2 + 0×1 = 4
      7 │  111   │ 1×4 + 1×2 + 1×1 = 7
      8 │ 1000   │ 1×8 + 0×4 + 0×2 + 0×1 = 8
```

**A byte is 8 bits.** One byte can represent 2⁸ = 256 different values (0 through 255).

**Why this matters for types:** The number of bytes a type uses determines how many
distinct values it can hold. A 4-byte `int` has 32 bits → 2³² = 4,294,967,296
possible values. Split evenly between negative and positive: −2,147,483,648 to
+2,147,483,647.

**Watch for:** Binary is base-2. When you see a number like `1000` in binary, do not
read it as "one thousand" — read it as "one zero zero zero base two" = 8.

---

### Math: Two's Complement — How Negative Numbers Are Stored

**What it computes:** A way to represent negative integers in binary using the same
hardware that handles positive integers — no separate "sign bit" logic needed.

**The real-world analogy:** An odometer that rolls over. If a car odometer reads `00000`
and you drive backward, it shows `99999`. Subtracting 1 from 0 "wraps around" to the
maximum value. Two's complement works the same way: subtracting 1 from `00000000`
(binary 0) wraps to `11111111` (which we interpret as −1).

**The rule for a 4-bit example:**

```
Bits  │ Unsigned meaning │ Two's complement meaning
──────┼──────────────────┼──────────────────────────
0000  │        0         │         0
0001  │        1         │         1
0010  │        2         │         2
0111  │        7         │         7
1000  │        8         │        -8   ← leading 1 = negative
1001  │        9         │        -7
1111  │       15         │        -1
```

If the leading bit is 1, the number is negative. This halves the positive range
(0 to 7 instead of 0 to 15) but gains an equal range of negatives (−8 to −1).

**Overflow:** If you add 1 to the maximum positive value (0111 in 4-bit), you get
1000 — which is the most negative value. This is integer **overflow** — the value
wraps around. In C++, overflow of a signed `int` is technically undefined behavior,
but in practice with g++, it wraps.

**Watch for:** Overflow produces no error at runtime. Your program will silently
compute the wrong answer. This is one of the most dangerous bugs in systems programming.

---

## Part 3 — The Six Fundamental Types

### Concept: Fundamental Types — The Building Blocks

**What they are:** C++ has six types that map directly to hardware storage. Every other
type in C++ (including every type you will build later) is ultimately composed of these.

| Type | Size (typical) | Stores | Range / Precision |
|------|---------------|--------|-------------------|
| `int` | 4 bytes | Whole numbers | −2,147,483,648 to +2,147,483,647 |
| `long long` | 8 bytes | Large whole numbers | ±9.2 × 10¹⁸ |
| `double` | 8 bytes | Decimal numbers | ~15–17 significant digits |
| `float` | 4 bytes | Decimal numbers (less precise) | ~6–9 significant digits |
| `char` | 1 byte | A single character (stored as a number) | 0–127 (ASCII) |
| `bool` | 1 byte | True or false | `true` (1) or `false` (0) |

**Why separate types for whole vs decimal numbers?** Their binary representation is
fundamentally different. Integers are exact (every bit pattern maps to exactly one
integer). Floating-point numbers (`float`, `double`) store an approximation using
scientific notation in binary — they can represent an enormous range of values but
are not exact. `0.1 + 0.2` in floating-point does not equal `0.3`. (We cover IEEE 754
floating-point in depth in S-05 Breakout, when it causes a real bug.)

**Why both `double` and `float`?** Precision and speed. `double` (64-bit) is twice as
precise as `float` (32-bit) but uses twice the memory and can be slower on some hardware.
For game physics, `float` is often used. For financial calculations, neither is used
(you would use integer arithmetic with explicit decimal positions).

**Why does `char` store a number?** Characters are not stored as letters — they are
stored as numbers. The ASCII standard maps numbers to characters: 65 = 'A', 97 = 'a',
48 = '0'. A `char` stores the number; the terminal displays the corresponding character.

**Watch for:** C++ does not guarantee exact byte sizes for types — it only guarantees
minimums. A 4-byte `int` is guaranteed on all modern 32/64-bit platforms with g++,
but to be safe in portable code, use `int32_t` from `<cstdint>`. For this course, we
use `int` and note this caveat.

---

## Step 1 — The Program Shell

Open `main.cpp` from LAB 00. Update it to this — only the `cout` line changes:

```cpp
#include <iostream>    // std::cout, std::endl

int main() {
    std::cout << "=== C++ Type Inspector ===" << std::endl;   // ← was: "Hello, Dungeon!..."
    std::cout << std::endl;                                    // ← add: blank line for spacing
    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**

```
=== C++ Type Inspector ===

```

Two lines: the title and a blank line. The program runs correctly. We build from here.

---

## Step 2 — Declare an `int`

Add these lines. The `// ← add this` markers show exactly what is new:

```cpp
#include <iostream>
#include <iomanip>     // ← add: std::setw — formats output in columns (explained below)

int main() {
    std::cout << "=== C++ Type Inspector ===" << std::endl;
    std::cout << std::endl;

    int score = 100;   // ← add: declare an int, initialize to 100

    // Print the type name, variable name, value, and byte size — all in columns
    std::cout << std::left << std::setw(10) << "int"         // ← add: column 1: type name
              << std::setw(10) << "score"                    // ← add: column 2: variable name
              << "= " << std::setw(14) << score              // ← add: column 3: value
              << "size: " << sizeof(score) << " bytes"       // ← add: column 4: memory size
              << std::endl;

    return 0;
}
```

**`#include <iomanip>` explained:** `iomanip` (I/O manipulators) provides tools that
format output. `std::setw(n)` sets the minimum width of the next printed item to `n`
characters, padding with spaces. `std::left` left-aligns within that width. Without
these, all values would run together on one line without spacing.

**`sizeof(score)` explained:** `sizeof` is a C++ operator (not a function — it runs
at compile time, not runtime) that returns the number of bytes its argument occupies
in memory. `sizeof(score)` returns `4` because an `int` is 4 bytes on this platform.
You can also write `sizeof(int)` to get the size of the type directly.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**

```
=== C++ Type Inspector ===

int       score     = 100           size: 4 bytes
```

**Change something:** Change `int score = 100;` to `int score = -5;`. Recompile. Run.
The output shows `-5`. Change it to `int score = 2147483647;` (the maximum `int`).
Recompile. Run. You see the maximum value. Change back to `100`.

---

## Step 3 — Add `double` and `float`

Add two more variables after `int score = 100;`. Only new lines are marked:

```cpp
    int    score    = 100;
    double pi       = 3.14159265358979;   // ← add: double — 15+ significant digits
    float  gravity  = 9.81f;              // ← add: float — the 'f' suffix marks it as float

    std::cout << std::left << std::setw(10) << "int"
              << std::setw(10) << "score"
              << "= " << std::setw(14) << score
              << "size: " << sizeof(score) << " bytes" << std::endl;

    std::cout << std::setw(10) << "double"    // ← add: print pi
              << std::setw(10) << "pi"
              << "= " << std::setw(14) << pi
              << "size: " << sizeof(pi) << " bytes" << std::endl;

    std::cout << std::setw(10) << "float"     // ← add: print gravity
              << std::setw(10) << "gravity"
              << "= " << std::setw(14) << gravity
              << "size: " << sizeof(gravity) << " bytes" << std::endl;
```

**The `f` suffix on `9.81f`:** Without `f`, the literal `9.81` is a `double`. Assigning
it to a `float` would generate a compiler warning because you are narrowing a 64-bit
value to 32 bits. Adding `f` tells the compiler: "This literal is already a `float`
— no narrowing." Always use `f` on float literals.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**

```
=== C++ Type Inspector ===

int       score     = 100           size: 4 bytes
double    pi        = 3.14159       size: 8 bytes
float     gravity   = 9.81          size: 4 bytes
```

**Change something:** Change the `double pi` declaration to use more decimal places:
`double pi = 3.14159265358979323846;`. Recompile. The output still shows only 6 decimal
places because `std::cout` defaults to 6 significant digits. To see all 15, add
`std::cout << std::setprecision(15);` before the pi line. Change back to the original.

---

## Step 4 — Add `char` and `bool`

```cpp
    char   grade    = 'A';   // ← add: char stores a single character as a number
    bool   alive    = true;  // ← add: bool stores true or false

    // ... (previous cout lines unchanged) ...

    std::cout << std::setw(10) << "char"    // ← add
              << std::setw(10) << "grade"
              << "= " << std::setw(14) << grade
              << "size: " << sizeof(grade) << " bytes" << std::endl;

    std::cout << std::setw(10) << "bool"    // ← add
              << std::setw(10) << "alive"
              << "= " << std::setw(14) << alive
              << "size: " << sizeof(alive) << " bytes" << std::endl;
```

**`'A'` vs `"A"`:** Single quotes mark a `char` literal (one character). Double quotes
mark a `std::string` literal (zero or more characters). `'A'` stores the number 65
(the ASCII value of 'A'). `"A"` stores a string containing one character and a null
terminator — a completely different type.

**`bool` prints as `1` or `0`:** By default, `std::cout` prints `true` as `1` and
`false` as `0`. To print `true`/`false` as words, add `std::boolalpha` to the stream.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**

```
=== C++ Type Inspector ===

int       score     = 100           size: 4 bytes
double    pi        = 3.14159       size: 8 bytes
float     gravity   = 9.81          size: 4 bytes
char      grade     = A             size: 1 byte
bool      alive     = 1             size: 1 byte
```

**Change something:** Change `char grade = 'A';` to `char grade = 65;`. Recompile.
The output still shows `A` — because 65 IS 'A' in ASCII. `char` stores a number;
the terminal displays the character. Change back to `'A'`.

---

## Step 5 — The Overflow Demonstration

Add this section after the type inspector output. Only new lines added:

```cpp
    std::cout << std::endl;
    std::cout << "Overflow demo:" << std::endl;

    // INT_MAX is a constant from <climits> — the largest value an int can hold.
    // We will add <climits> to the includes at the top of the file.
    int maxInt = 2147483647;   // ← the largest 32-bit signed integer

    std::cout << "  max int: " << maxInt << std::endl;
    std::cout << "  max int + 1: " << maxInt + 1 << std::endl;   // ← intentional overflow
```

Also add `#include <climits>` at the top (we will use its constants in the challenge).

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**

```
Overflow demo:
  max int: 2147483647
  max int + 1: -2147483648   ← wraps around!
```

This is the two's complement wrap described in the Math block. The maximum 4-byte
signed integer is `01111111 11111111 11111111 11111111` in binary. Adding 1 produces
`10000000 00000000 00000000 00000000` — which two's complement interprets as −2,147,483,648.

**Change something:** Change `int maxInt = 2147483647;` to
`int maxInt = 2147483646;`. Run. Adding 1 gives `2147483647` — still within range,
no wrap. Change to `2147483647` again.

---

## 🎯 Challenge: Print All Six Type Sizes

**You know:** `sizeof(type)`, fundamental types.

**Task:** Print a table showing the size of *every* fundamental C++ type, using
`sizeof` with the type name directly (not a variable). Include `short`, `long`,
`long long`, `unsigned int`, `unsigned char`. Format it in neat columns.

**Starting point:**
```cpp
std::cout << "=== Type Sizes ===" << std::endl;
std::cout << std::left << std::setw(16) << "Type"
          << "Size" << std::endl;
// Add one line per type here
```

**Hint:** `sizeof(int)`, `sizeof(long long)`, `sizeof(unsigned int)` — type names
work directly inside `sizeof` without declaring a variable.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
std::cout << "=== Type Sizes ===" << std::endl;
std::cout << std::left << std::setw(16) << "Type" << "Size (bytes)" << std::endl;
std::cout << std::string(28, '-') << std::endl;

std::cout << std::setw(16) << "char"          << sizeof(char)          << std::endl;
std::cout << std::setw(16) << "short"         << sizeof(short)         << std::endl;
std::cout << std::setw(16) << "int"           << sizeof(int)           << std::endl;
std::cout << std::setw(16) << "long"          << sizeof(long)          << std::endl;
std::cout << std::setw(16) << "long long"     << sizeof(long long)     << std::endl;
std::cout << std::setw(16) << "unsigned int"  << sizeof(unsigned int)  << std::endl;
std::cout << std::setw(16) << "float"         << sizeof(float)         << std::endl;
std::cout << std::setw(16) << "double"        << sizeof(double)        << std::endl;
std::cout << std::setw(16) << "bool"          << sizeof(bool)          << std::endl;
```

**Key insight:** `sizeof` answers the question "how much RAM does this type use?" at
compile time — before the program even runs. This is why `sizeof` is an operator, not
a function: functions run at runtime, but `sizeof` produces a constant the compiler
embeds directly into the machine code. You can use it anywhere a constant number is valid.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `int` variable | `int score = 100;` compiles and prints `100` |
| `double` variable | `pi` shows ~6 significant digits by default |
| `float` variable | Uses `f` suffix on literal; prints 4-byte size |
| `char` variable | `'A'` stores 65; terminal shows `A` |
| `bool` variable | Prints `1` for `true`, `0` for `false` |
| `sizeof` | Each type shows correct byte count (int=4, double=8, char=1, bool=1) |
| Overflow visible | `2147483647 + 1` prints `-2147483648` |
| Columns formatted | Output is aligned in columns using `std::setw` |

---

## Quick Check Answers

**1. Where does `int score = 100` live while the program runs?**
In **RAM** — the computer's temporary, fast working memory. The value `100` is stored
in a specific location in RAM (a "slot") that the compiler reserved for the variable
`score`. It is not in the source file (which is on disk) and not directly in the `.exe`
(which is also on disk — though the `.exe` contains instructions to *put* `100` there
at startup). RAM is wiped when the program ends.

**2. Why are `int` and `float` separate types?**
Because they store numbers using fundamentally different binary representations. An `int`
stores the exact binary value of a whole number — every bit pattern maps to exactly one
integer. A `float` stores an approximation using binary scientific notation (a sign bit,
an exponent, and a mantissa) — it can represent very large or very small numbers, but
the values between are approximations. `0.1` cannot be represented exactly in binary
floating-point, just as `1/3` cannot be represented exactly in decimal.

**3. What happens when you add 1 to the maximum `int`?**
The value wraps to the most negative `int`: `−2,147,483,648`. This is **integer overflow**
— a consequence of two's complement representation. The maximum positive 32-bit integer is
`01111111 11111111 11111111 11111111`. Adding 1 gives `10000000 00000000 00000000 00000000`,
which two's complement interprets as the minimum negative value. C++ does not detect this
at runtime — it silently produces the wrong answer.
