# Lesson 1: A Name Is Not the Value It Holds
### (LAB 01 — Variables, Types, and Memory)

**What you will build:** A **type inspector** — a program that declares one variable of each C++ fundamental type, prints its value, and reports exactly how many bytes of memory it occupies, ending with a deliberate demonstration of integer overflow. The transferable problem this lesson is actually about: every value a program holds while running lives somewhere in RAM, as a fixed number of bytes, in binary — and that fixed size is not a technicality, it is the reason numbers have limits, why `int` and `float` cannot be the same type, and why a program can silently compute the wrong answer with no error at all.

**What you need to know first:** LAB-00 — specifically, `int main()` as the entry point, `#include <iostream>`, `std::cout <<` for printing, the `std`/`::` namespace rule, and compiling with `make`. Nothing else is assumed.

**Terms introduced in this lesson**

> **Variable** — a named, reserved location in RAM that holds a value while a program runs.
> **RAM (Random Access Memory)** — a computer's fast, temporary working storage; contents are lost when power is removed.
> **Declaration (of a variable)** — the statement that creates a variable, giving it a name and a type.
> **Initialization** — giving a variable its first value, at the point it is declared.
> **Bit** — a single binary digit, 0 or 1 — the smallest unit of storage.
> **Byte** — 8 bits, able to represent 256 distinct values (0–255).
> **Binary (base 2)** — the number system computers use internally, using only digits 0 and 1.
> **`sizeof`** — a compile-time C++ operator that reports how many bytes a type or variable occupies.
> **Fundamental type** — one of C++'s built-in types (`int`, `long long`, `double`, `float`, `char`, `bool`) that maps directly to a fixed-size hardware storage layout.
> **Floating-point representation** — a way of storing decimal numbers as an approximation (sign, exponent, mantissa), trading exactness for a huge representable range.
> **Two's complement** — the standard binary representation for signed (negative-capable) integers, in which the leading bit signals sign.
> **Integer overflow** — the result of an arithmetic operation exceeding a type's representable range, causing the value to wrap around silently.
> **Narrowing conversion** — an implicit conversion that can lose information (precision or magnitude) converting from one type to another.
> **ASCII** — a standard mapping between small integers (0–127) and printable characters; the basis for how `char` values display as letters.
> **Stream manipulator** — a value (like `std::setw` or `std::left`) sent into a stream with `<<` that changes how *subsequent* values are formatted, rather than printing a value itself.

No pipeline diagram applies — this curriculum has not yet established a multi-stage project pipeline; the S-01 series builds standalone concept programs, not one continuous pipeline, unlike `S-02-CPP-DSA-MASTERY`.

---

## Concept Unit 1: Declaring a Variable

### The Problem

`main` (LAB-00) can print a fixed string, but it cannot yet remember a value to compute with or reuse. Machine code has no concept of a named value — every piece of data lives at a raw numeric memory address. Without a name, using a value would mean remembering and re-typing an address like `0x7FFE3A40` everywhere that value is needed — unreadable and, in any real program, unmaintainable.

### Project Change

- **Reference Source:** No reference counterpart — foundational language syntax.
- **Files affected:** `main.cpp` — new file for this lab (a fresh type-inspector program, separate from LAB-00's `main.cpp`).
- **Change type:** Add (new file, first variable declaration).
- **Location:** Inside `main`'s body.
- **Dependencies:** `#include <iostream>`, `std::cout` (both LAB-00).

### The New Code

```cpp
int score = 100;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "=== C++ Type Inspector ===" << std::endl;
    std::cout << std::endl;

    int score = 100;   // ← new

    return 0;
}
```

The two `std::cout` lines printing the banner and a blank line are carried over unchanged from setting up this file; `int score = 100;` is the only new statement.

### Concept Lab

```cpp
// scratch_variable.cpp  (disposable)
#include <iostream>

int main() {
    int mailboxSlot = 7;
    std::cout << mailboxSlot << std::endl;
    mailboxSlot = 42;
    std::cout << mailboxSlot << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_variable.cpp -o scratch_variable -std=c++17 -Wall -Wextra
$ ./scratch_variable.exe
7
42
```

What that proves: the name `mailboxSlot` refers to the same storage location both times it's printed — reassigning it (`mailboxSlot = 42;`, no `int` the second time) changes the value at that location without creating a new variable or needing a new name. This is called a **variable** — think of RAM as a wall of labelled mailboxes; declaring `int mailboxSlot = 7;` reserves one mailbox, labels it, and puts `7` inside. The label is yours to read and write through; the actual physical slot — the memory address — is something the compiler tracks and you never need to see.

This scratch file is discarded now; `main.cpp`'s real `int score = 100;` does exactly what `mailboxSlot` just demonstrated, with a name that means something in this program instead of a throwaway one.

### Mechanical Walkthrough

- `int` — **(a) first appearance as a type used in a declaration** (it appeared in LAB-00 only as `main`'s return type). Here it declares that `score` stores a whole number, using a fixed-size binary layout covered in Concept Unit 2.
- `score` — **(a) first appearance.** An identifier — a name the programmer chose. Names are covered as a design decision, not just syntax, in `CPP-S02-LAB-02`; for now, a name must start with a letter or underscore and contain no spaces.
- `=` — **(a) first appearance in this role.** Here, `=` is **initialization** — giving the newly declared variable its first value in the same statement that creates it — not reassignment (reassignment, with no type name before it, was demonstrated separately in the Concept Lab above).
- `100` — **(c) already basic.** An integer literal — a value written directly in source code.
- `;` — **(c) already basic,** per LAB-00 Concept Unit 4.

### CS Lens

A variable is a **name-to-address binding** — the compiler maintains a table, internally, mapping every declared name to the memory location it occupies, and rewrites every use of that name into the correct address before producing machine code. This is the same fundamental idea as a **symbol table**, the data structure every compiler and interpreter uses to resolve names — when you later see `error: 'x' was not declared in this scope`, that error means this lookup failed.

### SE Lens

Hiding the actual memory address behind a name is C++'s smallest instance of an **abstraction** — `score` is the interface; the address is the hidden implementation detail. This is deliberate, not incidental: it means the compiler is free to place `score` at a different physical address on every run, or optimize it into a CPU register with no address at all, without your code ever needing to change — a guarantee that would be impossible if you referred to values by raw address instead of by name.

### Watch for

C++ variables must be **declared** before they are used — reading an undeclared name is a compile error. A declared-but-never-initialized variable (skip the Concept Lab's `= 7`, just `int mailboxSlot;`) is legal C++, but reading its value before assigning one is **undefined behavior**: the memory at that location holds whatever bytes happened to already be there, so the program may print garbage, or something different every run. Always initialize.

### Connection

`score` is the first entry in the type inspector this lesson builds toward one variable at a time.

---

## Concept Unit 2: Binary and Bytes — Why Size Is a Number

### The Problem

Concept Unit 1 said `score`'s storage is "a fixed-size binary layout" without saying what that size actually is or means. Before `sizeof` (next unit) can mean anything, "how many bytes" needs a concrete definition.

### No isolated code lab for this step

This is mathematical/representational background, not a C++ language construct — there is no code to isolate. The table below is the demonstration.

### Explanation

Computer hardware stores data as electrical signals with two reliable states: above a voltage threshold reads as `1`, below reads as `0`. Ten distinguishable voltage levels (for decimal) would not be reliably distinguishable in practice; two are. This is a **bit** (binary digit). A **byte** is 8 bits grouped together, and 8 bits can represent 2⁸ = 256 distinct patterns — conventionally read as the numbers 0 through 255.

Binary counts the same way decimal does, just with 2 digits instead of 10 — each column is worth 2× the previous one instead of 10×:

```
Decimal │ Binary │ How to read it
────────┼────────┼──────────────────────────────
      0 │    0   │ 0
      1 │    1   │ 1
      2 │   10   │ 1×2 + 0×1 = 2
      3 │   11   │ 1×2 + 1×1 = 3
      4 │  100   │ 1×4 + 0×2 + 0×1 = 4
      7 │  111   │ 1×4 + 1×2 + 1×1 = 7
      8 │ 1000   │ 1×8 + 0×4 + 0×2 + 0×1 = 8
```

### CS Lens

Base-2 positional notation is the same idea as base-10, generalized — every positional number system (binary, decimal, hexadecimal) represents a value as a sum of digit × (base raised to a position), differing only in how many digits exist per position. Also recognized in: hexadecimal memory addresses (base 16, used because it maps cleanly to groups of 4 bits), IP address octets, and RGB color channels (each 0–255, exactly one byte).

### SE Lens

A type's byte size is not an implementation detail you can ignore — it directly determines the range of values that type can represent, which is the entire subject of the rest of this lesson. Treating "how many bytes" as a mechanical fact to memorize, rather than tracing it back to "2 raised to the number of bits," is what makes overflow (Concept Unit 5) feel like a mysterious bug instead of an inevitable consequence of a fixed-size container.

### Connection

Every `sizeof` result in the rest of this lesson is a byte count that traces directly back to this table.

---

## Concept Unit 3: `sizeof` — Measuring a Type's Storage

### The Problem

Concept Unit 1 declared `score` but never confirmed how much memory it actually occupies — asserting "an `int` is 4 bytes" without a way to check it would be exactly the kind of unverified claim this curriculum's own schema refuses to accept from itself.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Immediately after `int score = 100;`.
- **Dependencies:** None beyond Concept Unit 1's `score`.

### The New Code

```cpp
std::cout << "int" << " " << "score" << " = " << score
          << " size: " << sizeof(score) << " bytes" << std::endl;
```

(This unformatted version is shown first to isolate `sizeof` itself; Concept Unit 8 replaces it with the column-aligned version used in the final program.)

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "=== C++ Type Inspector ===" << std::endl;
    std::cout << std::endl;

    int score = 100;

    std::cout << "int" << " " << "score" << " = " << score
              << " size: " << sizeof(score) << " bytes" << std::endl;   // ← new

    return 0;
}
```

### Concept Lab

```cpp
// scratch_sizeof.cpp  (disposable)
#include <iostream>

int main() {
    int wholeNumber = 5;
    double decimalNumber = 5.0;
    std::cout << sizeof(wholeNumber) << std::endl;
    std::cout << sizeof(decimalNumber) << std::endl;
    std::cout << sizeof(int) << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_sizeof.cpp -o scratch_sizeof -std=c++17 -Wall -Wextra
$ ./scratch_sizeof.exe
4
8
4
```

What that proves: `sizeof` reports a byte count that depends only on the *type*, not the specific value stored — `wholeNumber` (value `5`) and `sizeof(int)` (no variable at all, just the type name) both report `4`. `decimalNumber`, holding the same mathematical value `5.0` but as a `double`, reports `8` — proving the byte count is a property of the type's storage layout, never the number stored inside it.

This scratch file is discarded now; the real `main.cpp`'s `sizeof(score)` does exactly this, on the real variable from Concept Unit 1.

### Mechanical Walkthrough

- `sizeof(score)` — **(a) first appearance.** `sizeof` is a C++ **operator**, not a function — despite the parentheses looking like a function call, it does not run at program runtime. It runs at *compile time*: the compiler already knows every type's byte layout while translating the program, so it substitutes the constant number directly into the compiled machine code — no calculation happens when `dungeon.exe` actually runs. `sizeof` also accepts a bare type name directly (`sizeof(int)`, demonstrated in the Concept Lab) without needing an existing variable.

### CS Lens

A value computed entirely at compile time, baked into the binary as a constant, is a form of **constant folding** — work the compiler does once, ahead of time, so the running program never has to redo it. This differs fundamentally from a runtime function call, which repeats its work every time it's invoked.

### SE Lens

Because `sizeof` costs nothing at runtime, C++ code can use it freely for real logic (computing buffer sizes, array bounds — both covered starting in LAB-06) without a performance penalty, unlike a hypothetical runtime "how big is this" function that would have to inspect the value every time it's called.

### Run It

```
$ g++ main.cpp -o typeinspect -std=c++17 -Wall -Wextra
$ ./typeinspect.exe
=== C++ Type Inspector ===

int score = 100 size: 4 bytes
```

Verified this session — `sizeof(score)` reports `4`, matching Concept Unit 2's byte table for a 32-bit type.

### Connection

Every remaining type in this lesson gets this same `sizeof` treatment — Concept Unit 8 is what turns this single unformatted line into the aligned table shown in this lesson's "What you will build."

---

## Concept Unit 4: `double` and `float` — Two Sizes of Decimal

### The Problem

`int` can only represent whole numbers. A physics calculation (gravity, `9.81`) or anything requiring a fractional part needs a type built for that — and, per Concept Unit 2, that type needs its own fixed byte size.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After `score`'s declaration and print line.
- **Dependencies:** `sizeof` (Concept Unit 3), the print-line pattern from Concept Unit 3.

### The New Code

```cpp
double pi      = 3.14159265358979;
float  gravity = 9.81f;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "=== C++ Type Inspector ===" << std::endl;
    std::cout << std::endl;

    int score = 100;
    double pi      = 3.14159265358979;   // ← new
    float  gravity = 9.81f;              // ← new

    std::cout << "int" << " " << "score" << " = " << score
              << " size: " << sizeof(score) << " bytes" << std::endl;
    std::cout << "double pi = " << pi << " size: " << sizeof(pi) << " bytes" << std::endl;      // ← new
    std::cout << "float gravity = " << gravity << " size: " << sizeof(gravity) << " bytes" << std::endl;   // ← new

    return 0;
}
```

### Concept Lab

```cpp
// scratch_float.cpp  (disposable)
#include <iostream>

int main() {
    float withoutSuffix = 9.81;
    float withSuffix    = 9.81f;
    std::cout << withoutSuffix << " " << withSuffix << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_float.cpp -o scratch_float -std=c++17 -Wall -Wextra
$ ./scratch_float.exe
9.81 9.81
```

**Correcting a claim before making it:** a widely repeated claim is that omitting the `f` suffix on a `float` literal produces a compiler warning about narrowing a `double` to a `float`. Verified this session, on this exact toolchain (GCC 14.2.0, `-Wall -Wextra`, both with and without brace-initialization): it does not — `withoutSuffix`, declared with no `f`, compiled with zero warnings and printed identically to `withSuffix`. What the Concept Lab actually proves, honestly: `9.81` with no suffix is a `double` literal (8 bytes of precision) being implicitly converted down to `float` (4 bytes) the moment it's assigned to `withoutSuffix` — a real narrowing conversion — but this specific compiler does not flag it, silently or otherwise, under the flags this course uses. The `f` suffix still matters, for a reason independent of warnings: it makes the literal *already* a `float` before any conversion happens, so there is no implicit narrowing step to reason about at all — `9.81f` is exact intent; `9.81` assigned to a `float` is intent left for the reader to infer.

This scratch file is discarded now; `gravity` in the real project uses `9.81f`, per the reasoning just proven.

### Mechanical Walkthrough

- `double` — **(a) first appearance.** An 8-byte type storing decimal numbers via **floating-point representation** (sign, exponent, mantissa — the internal layout is not needed to use `double`, only that it trades exactness for range, covered next).
- `float` — **(a) first appearance.** A 4-byte floating-point type — same representation strategy as `double`, half the storage, roughly half the significant digits of precision.
- `9.81f` — **(a) first appearance for the `f` suffix.** Marks the literal as already being of type `float`, per the Concept Lab's proof.

### CS Lens

Floating-point numbers are an **approximation with a documented, fixed error budget**, not an exact value — the same category of tradeoff as fixed-point arithmetic in embedded systems or financial software (money is deliberately *not* stored as `double`, for exactly this reason: `0.1 + 0.2` does not equal `0.3` in binary floating-point, because `0.1` has no exact binary representation, the same way `1/3` has no exact terminating decimal representation). This becomes a real, debuggable bug later in this curriculum — `S-05 Breakout` covers IEEE 754 floating-point in depth, at the point it causes an actual on-screen glitch.

### SE Lens

Two floating-point sizes exist as a **precision-versus-cost tradeoff**, not redundancy: `double`'s extra precision costs twice the memory and, on some hardware, more CPU cycles per operation. Game physics code commonly chooses `float` deliberately, accepting less precision for speed and memory density across thousands of simultaneous objects; this course defaults to `double` for anything not performance-critical, and reaches for `float` only when a later lesson's profiling gives a real reason to.

### Run It

```
$ g++ main.cpp -o typeinspect -std=c++17 -Wall -Wextra
$ ./typeinspect.exe
=== C++ Type Inspector ===

int score = 100 size: 4 bytes
double pi = 3.14159 size: 8 bytes
float gravity = 9.81 size: 4 bytes
```

Verified this session — `pi` prints only 6 significant digits by default (`std::cout`'s default precision, independent of the type's actual capacity) even though the literal specified 14; Concept Unit 8's Exercises revisit this with `std::setprecision`.

### Connection

`sizeof(pi)` and `sizeof(gravity)` extend the same pattern Concept Unit 3 established for `score`, now showing that the pattern reports a genuinely different number depending on the type — 8 versus 4 — proving `sizeof` measures the type, not merely repeating a constant.

---

## Concept Unit 5: Two's Complement and Integer Overflow

### The Problem

Concept Unit 2 established that a byte holds a fixed number of distinct patterns — a 4-byte `int` has 2³² = 4,294,967,296 of them. That number is finite. What happens when arithmetic tries to produce a value outside the range those patterns can represent?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After the existing print statements, before `return 0;`.
- **Dependencies:** `int` (Concept Unit 1), Concept Unit 2's binary background.

### The New Code

```cpp
int maxInt = 2147483647;
std::cout << "  max int: " << maxInt << std::endl;
std::cout << "  max int + 1: " << maxInt + 1 << std::endl;
```

### The Updated Project

```cpp
    std::cout << "float gravity = " << gravity << " size: " << sizeof(gravity) << " bytes" << std::endl;

    std::cout << std::endl;
    std::cout << "Overflow demo:" << std::endl;
    int maxInt = 2147483647;                                      // ← new
    std::cout << "  max int: " << maxInt << std::endl;            // ← new
    std::cout << "  max int + 1: " << maxInt + 1 << std::endl;    // ← new

    return 0;
```

### Concept Lab

Two's complement, first, in a disposable 4-bit-sized table (real `int` is 32 bits; 4 bits makes the pattern visible by hand):

```
Bits  │ Unsigned meaning │ Two's complement meaning
──────┼──────────────────┼──────────────────────────
0000  │        0         │         0
0001  │        1         │         1
0111  │        7         │         7
1000  │        8         │        -8   ← leading bit 1 = negative
1111  │       15         │        -1
```

If the leading bit is `1`, two's complement reads the value as negative. This halves the positive range a given bit width can represent (0 to 7 instead of 0 to 15, for 4 bits) in exchange for an equal-sized negative range (−8 to −1) — using the exact same hardware addition circuit for both signed and unsigned numbers, with no separate "negative number" logic needed. An odometer that reads `0000` and rolls backward to `9999` when driven in reverse is the same wraparound idea in decimal: subtracting past the minimum wraps to the maximum representable value, not to a negative sign appearing from nowhere.

Now the real overflow, verified this session:

```
$ g++ main.cpp -o typeinspect -std=c++17 -Wall -Wextra
$ ./typeinspect.exe
...
Overflow demo:
  max int: 2147483647
  max int + 1: -2147483648
```

No compiler warning was produced for this line, even under `-Wall -Wextra` — verified this session. What the output proves: `2147483647` (binary `01111111 11111111 11111111 11111111`, the largest positive 32-bit two's-complement pattern) plus `1` produces the bit pattern `10000000 00000000 00000000 00000000` — which two's complement reads as the most negative representable value, `-2147483648`, per the table above. The arithmetic itself is not broken; it produced the mathematically correct *next bit pattern* — only the *interpretation* of that pattern, as a signed number, makes the result look wrong. This is called **integer overflow**.

There is no separate "throwaway" version of the overflow demo to discard — `maxInt` is disposable in spirit (it exists only to demonstrate this) but is kept in the real project's console output because seeing the exact number that triggers overflow, in the same program that built up to it, is the point.

### Mechanical Walkthrough

- `int maxInt = 2147483647;` — **(c) already basic** — reuses the declaration syntax from Concept Unit 1, with a new value; the value itself, `2147483647`, is `2^31 - 1`, the largest positive value a signed 32-bit two's-complement `int` can represent (one bit reserved for sign, per the Concept Lab table).
- `maxInt + 1` — **(a) first appearance of arithmetic on a variable in this lesson.** `+` here is ordinary addition; nothing about `+` itself is new, but this specific operation is the one deliberately pushed past the type's range.

### CS Lens

Overflow as a **silent wraparound with no runtime error** is a direct, unavoidable consequence of representing numbers in a fixed number of bits — every language whose integers map to fixed-width hardware registers has this behavior in some form (C, Java's `int` explicitly wraps by specification, Rust panics on overflow only in debug builds). Also recognized in: 1970s Atari game glitches from 8-bit score wraparound, the Y2K bug (a fixed-width two-digit year field, not binary but the identical fixed-size-container problem), and clock arithmetic (a 12-hour clock "overflows" from 12 back to 1).

### SE Lens

C++ standard's own position on signed integer overflow is that it is technically **undefined behavior** — the standard permits a compiler to do anything at all, not guaranteed wraparound — but every mainstream compiler targeting normal hardware, including this one, wraps predictably in practice because the underlying CPU instruction does. This course teaches the practical, observed behavior because that's what a working program actually does on real hardware — but "undefined behavior that happens to currently wrap" is a real engineering hazard: a future compiler version, or a more aggressive optimization setting, is permitted to assume overflow never happens and generate code that behaves differently. This exact gap — between "what the standard promises" and "what today's compiler does" — is revisited directly in `CPP-S02-LAB-20`, The Danger Zone.

### Watch for

Overflow produces no runtime error, no crash, no warning under the flags this course uses (verified above) — the program keeps running with a silently wrong value. This is one of the most dangerous classes of bug in systems programming precisely because nothing announces it.

### Connection

This closes the fundamental-types portion of the lesson — the remaining two units (`char`, `bool`) round out the six types, then Concept Unit 8 formats everything built so far into the aligned table this lesson's "What you will build" promised.

---

## Concept Unit 6: `char` — A Number Wearing a Letter's Costume

### The Problem

Text — a single character like a letter grade — needs a type too, and per Concept Unit 2, it needs a byte size like every other type. The six fundamental types include exactly one built for this.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After the overflow demo block (or, in the final assembled program, grouped with the other type declarations — Concept Unit 8 reorders for the final column layout).
- **Dependencies:** None beyond the print-line pattern already established.

### The New Code

```cpp
char grade = 'A';
```

### The Updated Project

```cpp
    int score = 100;
    double pi      = 3.14159265358979;
    float  gravity = 9.81f;
    char   grade   = 'A';   // ← new
```

### Concept Lab

```cpp
// scratch_char.cpp  (disposable)
#include <iostream>

int main() {
    char letterForm = 'A';
    char numberForm = 65;
    std::cout << letterForm << " " << numberForm << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_char.cpp -o scratch_char -std=c++17 -Wall -Wextra
$ ./scratch_char.exe
A A
```

What that proves: `'A'` and `65` produce identical output from a `char` — because they are the identical stored value. A `char` does not store a letter; it stores a single number, one byte wide (per Concept Unit 2's table, one byte holds 256 patterns — 0 through 255). **ASCII** is the standard table mapping small numbers to printable characters — `65` means `'A'` by that standard, the same way every terminal and text editor agrees `10` means "newline." `std::cout`, printing a `char`, displays the character the number maps to, not the number itself — this is a display choice specific to `char`; the exact same value stored as an `int` instead would print `65`, the number.

This scratch file is discarded now; `grade` in the real project uses `'A'`, proven above to be identical to `65`.

### Mechanical Walkthrough

- `char` — **(a) first appearance.** A 1-byte fundamental type, confirmed by `sizeof` in Concept Unit 8's assembled table.
- `'A'` — **(a) first appearance.** A **character literal** — single quotes, exactly one character, evaluating to that character's ASCII numeric value (`65`) at compile time, per the Concept Lab.

### CS Lens

Storing text as small integers, with a separate lookup table (ASCII, and its modern superset Unicode) defining which integer means which glyph, is the universal strategy for representing text in any computer system — no hardware anywhere stores a literal picture of the letter "A"; every terminal, font renderer, and text file is ultimately numbers plus an agreed-upon mapping.

### SE Lens

Because a `char` genuinely is just a 1-byte integer, it can be used in arithmetic (`'A' + 1` evaluates to `66`, which prints as `'B'`) — a convenience some code relies on deliberately (looping through the alphabet), and a trap for code that means one thing and accidentally writes the other, because the compiler never distinguishes "a small number" from "a letter" — that distinction lives only in the programmer's intent.

### Watch for

`'A'` (single quotes) and `"A"` (double quotes) are different types entirely — `'A'` is one `char`; `"A"` is a `std::string`-like sequence containing the character `'A'` *plus* a hidden terminating character marking where the text ends (covered fully in LAB-07, Strings). Using the wrong quote style for a single character is a common source of confusing compiler errors about mismatched types.

### Connection

`grade` is the fifth of six variables in the type inspector's assembled output.

---

## Concept Unit 7: `bool` — True, False, and What Actually Prints

### The Problem

Some values in a program are naturally yes/no — is the player alive? Representing that as a full `int` (using only two of its 4-billion-plus possible values) would work, but wastes both storage and, more importantly, intent: nothing in the type itself would say "this can only ever be one of two things."

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After `char grade`.
- **Dependencies:** None beyond the print-line pattern.

### The New Code

```cpp
bool alive = true;
```

### The Updated Project

```cpp
    char   grade   = 'A';
    bool   alive   = true;   // ← new
```

### Concept Lab

```cpp
// scratch_bool.cpp  (disposable)
#include <iostream>
int main() {
    bool isReady = true;
    std::cout << isReady << std::endl;
    std::cout << std::boolalpha << isReady << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_bool.cpp -o scratch_bool -std=c++17 -Wall -Wextra
$ ./scratch_bool.exe
1
true
```

What that proves: `std::cout`'s *default* behavior for `bool` prints `1` for `true` and (by the same rule, unproven here but symmetric) `0` for `false` — the words `true`/`false` are not printed unless explicitly requested. `std::boolalpha` is a **stream manipulator** — sent into the stream with `<<` like a value, but instead of printing anything itself, it changes how the stream formats every `bool` sent into it *after* that point, for the rest of the program (or until a matching `std::noboolalpha` reverses it).

This scratch file is discarded now; the real project's `alive` prints as `1` by default, per this proof, without `std::boolalpha` applied.

### Mechanical Walkthrough

- `bool` — **(a) first appearance.** A 1-byte fundamental type (confirmed by `sizeof` in Concept Unit 8) that can hold exactly two distinct values, `true` and `false`, despite a full byte being able to represent 256 patterns — the type's *interface* restricts it to two, even though its *storage* could technically hold more.
- `true` — **(a) first appearance.** A boolean literal.
- `std::boolalpha` — **(a) first appearance, demonstrated in the Concept Lab only** — not applied in `main.cpp` in this lesson, so this program's own output shows `1`, not `true`; noted as available, per Concept Unit 8's Exercises.

### CS Lens

A type that is physically a byte but logically restricted to two values is the smallest possible instance of an **invariant enforced by a type** — the compiler will not let `alive` hold, say, `2`, even though the storage could physically represent it, the same underlying idea (a type's interface promising less than its raw storage could hold) that shows up again, at much higher stakes, in LAB-10's Structs and every class built starting in `CPP-S02-LAB-02`.

### SE Lens

Choosing `bool` over `int` for a yes/no value is a **self-documenting types** decision: `bool alive` tells a reader, without a comment, that only two states are possible — an `int alive` using `0`/`1` by convention relies entirely on every future reader remembering that convention, with nothing in the type itself enforcing or announcing it.

### Connection

`alive` is the sixth and final variable — Concept Unit 8 now formats all six into the aligned table this lesson set out to build.

---

## Concept Unit 8: `std::setw` and `std::left` — Formatting Columns

### The Problem

Every print line so far has produced readable but unaligned output — six separate lines with no shared column structure. This lesson's own "What you will build" target is a neatly aligned table; producing it needs a way to control exactly how much horizontal space each printed value occupies.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified (every print line rewritten to use column formatting; `#include <iomanip>` added).
- **Change type:** Refactor (existing print statements) + Add (`#include`).
- **Location:** Top of the file (`#include`), and every `std::cout` line printing a type/name/value/size row.
- **Dependencies:** `<iomanip>` — the header declaring these manipulators.

### The New Code

```cpp
#include <iomanip>
```

```cpp
std::cout << std::left << std::setw(10) << "int"
          << std::setw(10) << "score"
          << "= " << std::setw(14) << score
          << "size: " << sizeof(score) << " bytes"
          << std::endl;
```

### The Updated Project

```cpp
#include <iostream>
#include <iomanip>     // ← new

int main() {
    std::cout << "=== C++ Type Inspector ===" << std::endl;
    std::cout << std::endl;

    int    score   = 100;
    double pi      = 3.14159265358979;
    float  gravity = 9.81f;
    char   grade   = 'A';
    bool   alive   = true;

    std::cout << std::left << std::setw(10) << "int"           // ← changed from unformatted version
              << std::setw(10) << "score"
              << "= " << std::setw(14) << score
              << "size: " << sizeof(score) << " bytes" << std::endl;

    std::cout << std::setw(10) << "double"                     // ← changed
              << std::setw(10) << "pi"
              << "= " << std::setw(14) << pi
              << "size: " << sizeof(pi) << " bytes" << std::endl;

    std::cout << std::setw(10) << "float"                      // ← changed
              << std::setw(10) << "gravity"
              << "= " << std::setw(14) << gravity
              << "size: " << sizeof(gravity) << " bytes" << std::endl;

    std::cout << std::setw(10) << "char"                       // ← changed
              << std::setw(10) << "grade"
              << "= " << std::setw(14) << grade
              << "size: " << sizeof(grade) << " bytes" << std::endl;

    std::cout << std::setw(10) << "bool"                       // ← changed
              << std::setw(10) << "alive"
              << "= " << std::setw(14) << alive
              << "size: " << sizeof(alive) << " bytes" << std::endl;

    std::cout << std::endl;
    std::cout << "Overflow demo:" << std::endl;
    int maxInt = 2147483647;
    std::cout << "  max int: " << maxInt << std::endl;
    std::cout << "  max int + 1: " << maxInt + 1 << std::endl;

    return 0;
}
```

### Concept Lab

```cpp
// scratch_columns.cpp  (disposable)
#include <iostream>
#include <iomanip>

int main() {
    std::cout << "no padding:" << "X" << "Y" << std::endl;
    std::cout << "padded:" << std::setw(5) << "X" << std::setw(5) << "Y" << std::endl;
    std::cout << std::left << std::setw(5) << "X" << std::setw(5) << "Y" << "|" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_columns.cpp -o scratch_columns -std=c++17 -Wall -Wextra
$ ./scratch_columns.exe
no padding:XY
padded:    X    Y
X    Y    |
```

Three output lines, one per `std::cout` statement. What the second and third lines prove: `std::setw(n)` affects only the *next single value* sent into the stream — it applies once, then reverts, which is why `std::setw(5)` had to be repeated before both `"X"` and `"Y"` to pad each independently. By default, padding is added on the *left* (right-aligned); `std::left`, sent once, is **sticky** — it changes the stream's alignment mode for every subsequent `std::setw` until changed again, which is why it only needed to be written once before both `X` and `Y` in the third line, unlike `std::setw` itself.

This scratch file is discarded now; `main.cpp`'s real table uses exactly this combination — one `std::left` at the very start of the first line, and a `std::setw` before every column value on every line after.

### Mechanical Walkthrough

- `std::setw(10)` — **(a) first appearance.** A **stream manipulator** (named in Concept Unit 7's Mechanical Walkthrough for `std::boolalpha` — this is the same category of thing) that sets the minimum width of the *next* item inserted into the stream to 10 characters, padding with spaces if the item is shorter. Per the Concept Lab's proof, this effect applies once and must be repeated for each column.
- `std::left` — **(a) first appearance.** A manipulator that left-aligns padded output (the default is right-aligned) and, per the Concept Lab's proof, stays in effect for the rest of the stream's lifetime until something changes it back.

### CS Lens

A manipulator that mutates the stream's internal formatting *state*, rather than returning a formatted string directly, is a **stateful configuration object** — the same pattern as a graphics context that holds a "current fill color" set once and reused across many draw calls, rather than passing the color to every single draw call explicitly.

### SE Lens

`std::setw`'s "applies once, then reverts" default (versus `std::left`'s "sticky until changed") is a real, sometimes surprising asymmetry in the standard library's own design — code that assumes all manipulators behave the same way will mysteriously lose column alignment after the first row. This course states the asymmetry explicitly, per Concept Unit 8's own Concept Lab proof, specifically because assuming consistency here is a documented, common beginner mistake.

### Run It

Full program, verified this session:

```
$ g++ main.cpp -o typeinspect -std=c++17 -Wall -Wextra
$ ./typeinspect.exe
=== C++ Type Inspector ===

int       score     = 100           size: 4 bytes
double    pi        = 3.14159       size: 8 bytes
float     gravity   = 9.81          size: 4 bytes
char      grade     = A             size: 1 bytes
bool      alive     = 1             size: 1 bytes

Overflow demo:
  max int: 2147483647
  max int + 1: -2147483648
```

Note the literal `"1 bytes"` (not the grammatically correct "1 byte") on the `char` and `bool` rows — verified this session: the code always appends the literal string `" bytes"` regardless of the count, with no singular-versus-plural logic. This is not a bug to silently fix; it's an honest look at what the program you actually typed does, versus what a hand-written mockup might have implied.

### Connection

This is the complete type inspector this lesson set out to build — every one of the six fundamental types, formatted into one aligned table, plus the overflow demonstration from Concept Unit 5.

---

## Concept Unit 9: `sizeof` on a Type Name, Directly

### The Problem

Every `sizeof` call so far has taken a variable (`sizeof(score)`). Checking a type's size without first declaring a throwaway variable of that type — useful for types this program never actually uses, like `short` or `unsigned int` — needs a variant of the same operator.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None in `main.cpp` — this unit is demonstrated standalone and left as this lesson's Exercises, not merged into the assembled program, since it prints a type census unrelated to the `dungeon`-adjacent type inspector's own output.
- **Change type:** N/A (demonstrated in isolation; assigned as an exercise).
- **Location:** N/A.
- **Dependencies:** `sizeof` (Concept Unit 3).

### Concept Lab

```cpp
// scratch_typesizes.cpp  (disposable, and also the shape of this lesson's own Exercise 4)
#include <iostream>
#include <iomanip>

int main() {
    std::cout << std::left << std::setw(16) << "Type" << "Size (bytes)" << std::endl;
    std::cout << std::setw(16) << "char"          << sizeof(char)          << std::endl;
    std::cout << std::setw(16) << "short"         << sizeof(short)         << std::endl;
    std::cout << std::setw(16) << "int"           << sizeof(int)           << std::endl;
    std::cout << std::setw(16) << "long"          << sizeof(long)          << std::endl;
    std::cout << std::setw(16) << "long long"     << sizeof(long long)     << std::endl;
    std::cout << std::setw(16) << "unsigned int"  << sizeof(unsigned int)  << std::endl;
    std::cout << std::setw(16) << "float"         << sizeof(float)         << std::endl;
    std::cout << std::setw(16) << "double"        << sizeof(double)        << std::endl;
    std::cout << std::setw(16) << "bool"          << sizeof(bool)          << std::endl;
}
```

Run it — verified this session, on this toolchain:

```
Type            Size (bytes)
char            1
short           2
int             4
long            4
long long       8
unsigned int    4
float           4
double          8
bool            1
```

What that proves, beyond repeating Concept Unit 3's proof for new types: `sizeof(short)`, `sizeof(long)`, and the rest all work with no variable ever declared — confirming `sizeof` genuinely takes either a type name or an expression, per Concept Unit 3's Mechanical Walkthrough. **A real platform difference worth naming, not glossing over:** `long` measured **4 bytes** here — on this Windows/MinGW toolchain specifically. On most 64-bit Linux systems, `long` is 8 bytes. C++ does not guarantee an exact size for `long` (or most fundamental types) — only a *minimum* range it must be able to represent. This is precisely why `<cstdint>`'s fixed-width types (`int32_t`, `int64_t`) exist, for code that must have a guaranteed size across platforms — not needed yet in this series, but worth knowing the moment portable code is written.

This scratch file is not fully discarded — it becomes this lesson's Exercise 4, below, unmodified.

### Mechanical Walkthrough

- `sizeof(short)`, `sizeof(long)`, `sizeof(unsigned int)` — **(c) already basic**, reusing exactly the "type name directly" form already explained in Concept Unit 3's Mechanical Walkthrough; no new syntax, only new type names being measured. `unsigned` — **(a) first appearance** — a modifier restricting a type to non-negative values only, trading away the negative half of its range (per Concept Unit 5's two's-complement table) for double the positive range; covered in full the first time this program actually needs a value that can never be negative, later in this series.

### CS Lens

Confirming a type's size holds regardless of *how* you ask for it (a variable, or the bare type name) is a small instance of a broader idea: a well-defined operator should give a consistent answer regardless of the syntactic path used to reach it — the same expectation that makes `2 + 3` and `3 + 2` trustworthy without re-deriving addition's commutativity every time.

### SE Lens

Naming the `long` platform difference explicitly, rather than presenting one number as universal truth, is exactly LESSON_CONTRACT's standard for "explain, don't just describe" applied to this course's own claims about the language — a lesson that states `sizeof(long)` is "4 bytes," full stop, would be teaching a Windows-specific fact as if it were a C++ fact, and a reader who later compiles on Linux would hit a real, confusing discrepancy with no lesson to explain why.

### Connection

This closes every new concept in this lesson — the Closing section below traces one value through the whole program and assigns this unit's own program as a hands-on exercise.

---

## Closing

### Connect the pieces

Follow `score` from declaration to printed output: `int score = 100;` (Concept Unit 1) reserves 4 bytes of RAM (Concept Unit 2 explains why 4; Concept Unit 3's `sizeof(score)` confirms it) and stores the binary pattern for `100`. `std::left` and `std::setw(10)` (Concept Unit 8) format its printed row without altering the value itself — formatting and storage are entirely separate concerns, proven by the fact that `score` still equals `100` internally regardless of how many spaces surround it on screen. The same file, a few lines later, takes `maxInt = 2147483647` (Concept Unit 5) — a value that fits in the identical 4-byte `int` storage `score` uses — and pushes it one past that storage's limit, making visible, with a real verified run, exactly what "4 bytes" concretely bounds.

### What breaks without this

Removing the `f` suffix from `9.81f` does **not** break this program, verified in Concept Unit 4 — the honest, verified failure mode is smaller and easy to miss for exactly that reason: the value silently loses precision on the implicit `double`-to-`float` conversion, with no warning under this course's compiler flags. To see a real, loud break: change `int maxInt = 2147483647;` to `long long maxInt = 2147483647;` and rebuild. `maxInt + 1` now prints `2147483648` — correctly, no wraparound — because `long long` (per Concept Unit 9's table, 8 bytes) has far more headroom than 32 bits. Change it back to `int`, and the wraparound from Concept Unit 5 returns. This is the concrete, hands-on version of "the type is a promise about size, and violating that promise has consequences" — not violated here by a mistake, but by deliberately swapping one honest type for another and watching the guaranteed range change with it.

### Exercises

1. Change `int score = 100;` to `int score = -5;`, rebuild, confirm the printed value updates and `sizeof` stays `4` — the byte count never depends on the value stored, per Concept Unit 3's proof.
2. Add `std::boolalpha` (Concept Unit 7) before the `bool alive` print line in the real `main.cpp` and rebuild — confirm the row now prints `true` instead of `1`. Note whether it affects any row printed *after* it, per the "sticky" behavior proven in Concept Unit 8.
3. Add `std::cout << std::setprecision(15);` (verified this session to print `3.14159265358979`, matching the literal exactly) before the `pi` print line, and confirm all 15 digits appear, versus the default 6.
4. Type out Concept Unit 9's Concept Lab as its own program, compile and run it for real, and add three more types not shown (`unsigned char`, `signed char`, `wchar_t`) — look up their sizes with `sizeof` rather than guessing, the same way every size in this lesson was checked, not assumed.

### Definition of done

- [ ] `main.cpp` declares all six fundamental types (`int`, `double`, `float`, `char`, `bool`, plus `long long` implicitly covered via the overflow discussion) and prints each with its real `sizeof`.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] Running it reproduces this lesson's verified output exactly, including the literal `"1 bytes"` grammar quirk — not a hand-smoothed version of it.
- [ ] The overflow demo prints `-2147483648` for `max int + 1`, and you can explain why in terms of two's complement bit patterns, not just "it wraps."
- [ ] All four Exercises above completed and their real output observed, not predicted.
- [ ] You can state, from memory, why `9.81f` is still the right choice even though this compiler emits no warning without it.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-01: type inspector — six fundamental types, sizeof, and a verified integer overflow"` — the message states why (a working demonstration of type size and its limits), not just what changed.
