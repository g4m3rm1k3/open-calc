# C++ Masterclass — S-01 — LAB 06 — Arrays and Memory

**Prerequisites:** LAB 05. You know functions, scope, and pass-by-value.

**What this lab adds:**
- Fixed-size arrays — sequential storage of the same type
- Zero-based indexing — why arrays start at 0, not 1
- Address arithmetic — how indexing works in terms of memory addresses
- Out-of-bounds access — the silent danger that crashes programs
- Passing arrays to functions — why arrays behave differently from regular variables
- Iterating arrays with `for` loops — the standard pattern
- A tile array that represents a dungeon row — foundation of S-02 Snake's body

**Time:** ~65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If an `int` takes 4 bytes and you have an array of 10 `int`s, how many bytes
>    does the whole array occupy?
> 2. Why do you think arrays are zero-indexed (first element is at index 0)?
>    What property of memory addresses makes 0 the natural starting point?
> 3. Predict: If you declare `int tiles[5]` and then access `tiles[5]`, what
>    happens? Will the compiler catch it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **dungeon row inspector** — a program that stores a row of dungeon tiles in an
array, modifies individual tiles, and displays the row. You will also deliberately
trigger an out-of-bounds access to see what happens:

```
=== Dungeon Row Inspector ===

Initial row:
  tiles[0] = .
  tiles[1] = .
  tiles[2] = .
  tiles[3] = .
  tiles[4] = .
  tiles[5] = .
  tiles[6] = .
  tiles[7] = .
  tiles[8] = .
  tiles[9] = .

After placing the player at index 5:
  . . . . . @ . . . .

After placing a goblin at index 8:
  . . . . . @ . . G .
```

---

## Part 1 — What an Array Is

### Concept: Arrays — Sequential, Same-Type Storage

**What they are:** An array is a fixed-size, sequential block of memory that holds
multiple values of the same type. All elements are stored in consecutive memory
addresses — one right after the other.

**The problem before (no arrays):**
If you need 10 dungeon tile values, you would need 10 separate variables:
```cpp
char tile0 = '.';
char tile1 = '.';
char tile2 = '.';
// ... up to tile9
```
There is no way to access "the i-th tile" based on a variable `i`. You cannot loop
over them. You cannot pass them all to a function in one argument.

**The solution:**
```cpp
char tiles[10];   // 10 chars, stored contiguously in memory
tiles[3] = '@';   // access the 4th element (index 3)
```

**What it hides:** The individual memory addresses. `tiles[3]` is syntactic sugar for
"the `char` at the address `start_of_tiles + 3 * sizeof(char)`." The `[i]` operator
computes the correct address automatically.

**The protected invariant:** All elements are the same type and the same size.
This is what makes the index calculation exact — element `i` is always at
`base_address + i * element_size`.

**Canonical example — mailboxes in a row:**
An apartment building with units numbered 0–9. Each unit is the same size. To reach
unit 5, you walk past exactly 5 units from the entrance (unit 0). The array works
exactly the same: element 5 is `5 × sizeof(type)` bytes from the array's start.

---

## Math: Array Indexing — Zero-Based and Address Arithmetic

**What it computes:** The memory address of element `i` in an array.

**The formula:**
```
address of element[i] = base_address + (i × element_size)
```

**Why zero-based indexing is natural:**
For the first element (i = 0): `base + 0 × size = base` — exactly the base address.
No offset needed. If arrays were 1-indexed, the first element would be at
`base + 1 × size`, wasting `base` and requiring a subtraction in every index calculation.
Zero-based indexing makes the math cleanest at the hardware level.

**Concrete example (4-byte `int` array starting at address 1000):**
```
Index │ Address      │ Calculation
──────┼──────────────┼────────────────────────────
  [0] │ 1000         │ 1000 + 0 × 4 = 1000
  [1] │ 1004         │ 1000 + 1 × 4 = 1004
  [2] │ 1008         │ 1000 + 2 × 4 = 1008
  [5] │ 1020         │ 1000 + 5 × 4 = 1020
```

**Why `tiles[N]` is not valid (where N is the array size):**
An array declared as `char tiles[10]` has valid indices 0–9. Index 10 maps to address
`base + 10 × size` — one byte past the last element, into unknown memory.
C++ does not check this. Reading or writing past the end reads or modifies whatever
happens to be there — another variable, OS data, or nothing valid.

**Watch for:** Out-of-bounds access is the single most common source of crashes and
security vulnerabilities in C and C++ programs. Buffer overflow exploits (a class of
security attack you will study in S-08) work by writing past the end of an array into
memory the program should not touch.

---

## Step 1 — Declare and Initialize an Array

Start a new `main.cpp`:

```cpp
#include <iostream>    // std::cout, std::endl

const int ROW_SIZE = 10;   // number of tiles in one dungeon row

int main() {
    std::cout << "=== Dungeon Row Inspector ===" << std::endl;
    std::cout << std::endl;

    // Declare an array of ROW_SIZE chars, all initialized to '.' (floor tile)
    // Syntax: type name[size] = { initializer list };
    // If the list is shorter than the array, remaining elements are zero-initialized.
    char tiles[ROW_SIZE] = {'.', '.', '.', '.', '.', '.', '.', '.', '.', '.'};

    // Print the array with index labels
    std::cout << "Initial row:" << std::endl;
    for (int i = 0; i < ROW_SIZE; ++i) {       // iterate indices 0 to ROW_SIZE-1
        std::cout << "  tiles[" << i << "] = " << tiles[i] << std::endl;
    }

    return 0;
}
```

**`tiles[i]` explained:** The `[]` operator takes an index (an integer expression)
and returns a reference to that element. The index is computed using the address
arithmetic formula: it adds `i × sizeof(char)` to the base address of `tiles`.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
Initial row:
  tiles[0] = .
  tiles[1] = .
  ...
  tiles[9] = .
```

**Change something:** Change the initializer list so `tiles[4] = '#'` (a wall).
Recompile. The output shows `#` at index 4. Change back.

---

## Step 2 — Modify Individual Elements

Add this section after the initial print. Only new lines marked:

```cpp
    std::cout << std::endl;
    std::cout << "After placing the player at index 5:" << std::endl;
    tiles[5] = '@';   // ← add: place player symbol at index 5

    // Print the row as a single line (more like an actual game)
    for (int i = 0; i < ROW_SIZE; ++i) {        // ← add
        std::cout << tiles[i] << " ";            // ← add: tile then space
    }
    std::cout << std::endl;                      // ← add: end of row
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
After placing the player at index 5:
. . . . . @ . . . .
```

---

## Step 3 — Add a Goblin

```cpp
    std::cout << std::endl;
    std::cout << "After placing a goblin at index 8:" << std::endl;
    tiles[8] = 'G';   // ← add: goblin symbol

    for (int i = 0; i < ROW_SIZE; ++i) {
        std::cout << tiles[i] << " ";
    }
    std::cout << std::endl;
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
After placing a goblin at index 8:
. . . . . @ . . G .
```

---

## Part 2 — Out-of-Bounds Access

### Concept: Out-of-Bounds — The Silent Disaster

**What it is:** Accessing `array[i]` where `i < 0` or `i >= array_size`. The C++
compiler does not check this at runtime by default. It computes the address and reads
or writes whatever is there — which may be another variable, the call stack, or
OS-reserved memory.

**Why C++ does not automatically check:** Range checking would add an extra comparison
on every single array access. For a game running at 60 frames per second with thousands
of array accesses per frame, this cost adds up. C++ trades safety for performance and
trusts the programmer to use correct indices.

**The consequences range from:**
- **Garbage values** — reading returns a random number that was in adjacent memory
- **Overwriting another variable** — writing changes data you did not intend to change
- **Crash (segfault)** — writing to memory the OS did not allocate to your program
- **Security exploit** — writing past an array into the call stack to overwrite the
  return address (buffer overflow attack — you will study this in S-08)

**The fix:** Always derive indices from the array size constant. Never hardcode a
specific index without checking it. In later series, you will use `std::vector` which
provides bounds checking in debug builds.

---

## Step 4 — Controlled Out-of-Bounds Demonstration

Add this at the end of `main()`. We will access index 10 on a size-10 array:

```cpp
    std::cout << std::endl;
    std::cout << "=== Out-of-Bounds Demonstration ===" << std::endl;
    std::cout << "tiles[10] (one past the end): " << tiles[10] << std::endl;
    // ^ This is undefined behavior. The output will be garbage or a crash.
    // We do this once, deliberately, to see what the hardware does.
```

### SAVE AND TRY

Compile with an extra flag to get a runtime check:
```
g++ -std=c++17 -Wall -Wextra -g -fsanitize=address main.cpp -o dungeon
.\dungeon
```

**`-fsanitize=address` explained:** AddressSanitizer (ASan) is a compiler extension
that adds bounds checking at runtime. It makes the program slower but catches
out-of-bounds accesses immediately with a descriptive error instead of silent corruption.
Use this flag during development. The Makefile uses production settings by default;
you run ASan manually when debugging.

**You should see:** Either garbage output or an ASan error like:
```
ERROR: AddressSanitizer: stack-buffer-overflow on address...
```

Then rebuild without ASan:
```
make
```

**Remove the out-of-bounds line** after this experiment. Never leave UB in your code.

---

## Part 3 — Arrays and Functions

### Concept: Arrays Decay to Pointers When Passed to Functions

**What it is:** When you pass an array to a function, C++ does NOT copy the whole array.
Instead, it passes the memory address of the first element. Inside the function,
the parameter is a pointer (an address). This means:
1. The function works on the original array — changes inside the function affect the
   original (unlike regular parameters which are copies)
2. The function does not know the array's size — you must pass it separately

```cpp
void printRow(char tiles[], int size) {   // 'char tiles[]' here is actually a pointer
    for (int i = 0; i < size; ++i) {
        std::cout << tiles[i] << " ";
    }
}
// size must be passed separately — the function cannot determine it from 'tiles' alone
```

**Why no copy?** Copying a large array (e.g., a 1000×1000 game grid) into a function
would be extremely slow and use enormous stack space. Passing just the address is 8 bytes
regardless of array size.

**The consequence:** If a function modifies `tiles[i]`, it modifies the original.
This is different from passing `int value` (which is a copy). Arrays are inherently
"pass-by-reference-like" — a fact that surprises most beginners coming from other languages.

**Watch for:** Never use `sizeof(tiles)` inside a function that received an array as
a parameter. It returns the size of a pointer (8 bytes), not the array size. Always
pass the size as a separate `int`.

---

## Step 5 — Extract `printRow` Function

Add the function declaration and definition, then update main to use it:

```cpp
// Declarations (above main)
void printRow(char tiles[], int size);

// Definition (above main)
void printRow(char tiles[], int size) {   // tiles is a pointer — no copy made
    for (int i = 0; i < size; ++i) {
        std::cout << tiles[i] << " ";
    }
    std::cout << std::endl;
}
```

Replace the three inline print loops in `main` with calls to `printRow`:
```cpp
    // ← was: for loop printing tiles
    printRow(tiles, ROW_SIZE);   // ← replaces each inline for loop
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Identical output. Verify that modifying `tiles[5]` in `main`
before calling `printRow` shows the `@` — confirming `printRow` works on the original
array, not a copy.

---

## 🎯 Challenge: `fillRow` Function

**You know:** Array modification, passing arrays to functions.

**Task:** Write a function `void fillRow(char tiles[], int size, char fillChar)` that
sets every element of the array to `fillChar`. Call it to reset the tile row to all
`.` characters, then print the result.

**Expected output after calling `fillRow(tiles, ROW_SIZE, '.')`:**
```
. . . . . . . . . .
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void fillRow(char tiles[], int size, char fillChar) {
    for (int i = 0; i < size; ++i) {
        tiles[i] = fillChar;   // modifies the original array — no copy was made
    }
}

// In main, to reset:
fillRow(tiles, ROW_SIZE, '.');
printRow(tiles, ROW_SIZE);
```

**Key insight:** `fillRow` receives a pointer to the original `tiles` array.
When it writes `tiles[i] = fillChar`, it is writing to the same memory addresses
that `main` owns. After `fillRow` returns, `main`'s `tiles` array contains all
`fillChar` values. This is one of the most important behavioral differences between
arrays and regular variables in C++.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Array declaration | `char tiles[ROW_SIZE]` compiles; `sizeof(tiles)` in `main` returns `ROW_SIZE × 1` |
| Index access | `tiles[5] = '@'` places `@` at position 5 in the printed row |
| Loop iteration | All 10 tiles print in correct order |
| Out-of-bounds (ASan) | With `-fsanitize=address`, accessing `tiles[10]` triggers an error |
| Array in function | Modifying `tiles[i]` inside `printRow` changes the original |
| Size must be passed | `printRow(char tiles[], int size)` — size is a separate parameter |
| `fillRow` | All elements reset to `.` after calling `fillRow(tiles, ROW_SIZE, '.')` |

---

## Quick Check Answers

**1. How many bytes does an array of 10 `int`s occupy?**
`10 × 4 = 40 bytes`. All elements are stored contiguously. An `int` is 4 bytes,
so 10 of them require 40 consecutive bytes. The array occupies addresses `base`
through `base + 39`. You can verify this with `sizeof(int) × 10` or with
`sizeof(tiles)` when `tiles` is the array variable (note: this only works at the
declaration site, not inside a function that received the array as a parameter).

**2. Why is zero-based indexing natural?**
Because of address arithmetic: element `i` is at address `base + i × element_size`.
For element 0 (the first), the offset is `0 × size = 0` — exactly the base address.
If indexing started at 1, the first element would be at `base + 1 × size`, one
element_size past the actual start of the array. The hardware would need an extra
subtraction on every access. Zero-based indexing eliminates this overhead entirely.

**3. What happens when you access `tiles[5]` on an array of size 5?**
C++ does not stop you. The compiler computes the address `base + 5 × sizeof(char)`
and reads or writes whatever bytes are there — which may be another local variable,
the return address, or memory not allocated to your program. Results range from
garbage values to crashes to security exploits. The compiler with `-Wall` may warn,
but it will not refuse to compile. AddressSanitizer (`-fsanitize=address`) will
catch it at runtime. This is why bounds checking matters in any security-sensitive code.
