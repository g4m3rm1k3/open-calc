# C++ Masterclass — S-01 — LAB 08 — Pointers

**Prerequisites:** LAB 06 (arrays and memory addresses). LAB 07 (strings).

**What this lab adds:**
- What a pointer is — a variable that stores a memory address
- The address-of operator `&` — getting the address of a variable
- The dereference operator `*` — reading the value at an address
- `nullptr` — the safe "points to nothing" value
- Pointer arithmetic — and why it explains LAB 06's array behavior
- The three pointer dangers: null dereference, dangling pointers, wild pointers
- Why pointers exist — the foundation for linked lists (S-02), dynamic memory (LAB 09), and OS interfaces (S-07)

**Time:** ~75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 06, when you passed an array to a function, the function could modify
>    the original. In LAB 05, when you passed an `int`, the function got a copy.
>    What is different about how arrays are passed that allows the function to reach
>    the original?
> 2. A pointer variable holds a memory address. What type does that address have —
>    is it a number? A special type? What can you do with it?
> 3. Predict: If a pointer holds the value `0` (address zero), and you try to read
>    the value it "points to," what do you expect will happen?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **memory address inspector** — a program that shows actual memory addresses of
variables on the call stack, demonstrates dereferencing, and reveals why array
indexing is just pointer arithmetic:

```
=== Memory Address Inspector ===

Variable 'score'  holds value: 100
Variable 'score'  lives at:    0x5ffe3c
Variable 'health' holds value: 75
Variable 'health' lives at:    0x5ffe38

pointer 'p' holds address:     0x5ffe3c    ← same as 'score'
*p (value at that address):    100

Changing score through the pointer...
score is now: 999

=== Array as Pointer ===
tiles[0] is at: 0x5ffe10
tiles[1] is at: 0x5ffe11   ← exactly 1 byte later (sizeof char)
tiles[2] is at: 0x5ffe12
```

*(Your actual addresses will be different — addresses are assigned by the OS at runtime.)*

---

## Part 1 — Addresses and Pointers

### Concept: Pointers — Variables That Hold Addresses

**What they are:** A pointer is a variable whose value is a **memory address** —
the location of another variable in RAM. While `int score = 100` stores the number
100, `int* p = &score` stores the location (address) where `score` lives.

**Why they exist — three critical uses:**

1. **Accessing the original:** Functions normally receive copies (pass-by-value).
   A pointer lets a function reach the original variable via its address —
   the first mechanism for modifying data across function boundaries.

2. **Dynamic memory (LAB 09):** Data created with `new` lives on the heap. It has
   no name — only an address. The only way to access it is via a pointer.

3. **OS and hardware interfaces (S-07 Shell):** Operating system calls take and return
   raw memory addresses. There is no abstraction layer — you must work with pointers
   directly when calling `read()`, `write()`, `mmap()`, and similar functions.

**What a pointer IS in memory:** A pointer is just a number — an unsigned integer
large enough to hold any memory address. On a 64-bit system, a pointer is 8 bytes
(addresses go up to 2⁶⁴). On a 32-bit system, 4 bytes. The type of pointer
(`int*`, `char*`) tells the compiler the type of data at that address.

**Canonical example — the address in an envelope:**
You write "send a letter to 123 Main Street." You are not sending Main Street — you
are sending a reference to a location. A pointer is the "address written on an
envelope." Dereferencing (going to that address to pick up the letter) is what
actually gets you the data.

```
RAM layout:
Address 0x100 │  100  │  ← int score = 100;
Address 0x104 │ 0x100 │  ← int* p = &score;  (p holds the address 0x100)
```

**Watch for:** The `*` symbol has three different meanings in C++ depending on context:
- In a type: `int* p` — declares a pointer variable
- As a prefix operator: `*p` — dereferences (reads value at address `p`)
- As an infix operator: `3 * 4` — multiplication
Context determines which meaning applies. This is one of C++'s most confusing overloads.

---

### Concept: `&` — The Address-Of Operator

**What it is:** When `&` appears before a variable name (not in a declaration),
it returns the memory address of that variable as a pointer.

```cpp
int score = 100;
int* p = &score;    // & here: "give me the address of score"
//       ↑ 'address of score' — a number like 0x5ffe3c
```

**`int*` — pointer type syntax:** `int*` is read as "pointer to int."
The `*` is part of the type. `int* p` declares `p` as "a variable that holds the
address of an int." The type records what kind of data lives at that address.

**`&` has two meanings:** In a declaration (`int& ref`), it means reference.
As a prefix operator (`&score`), it means address-of. LAB 09 covers references.

---

### Concept: `*` — The Dereference Operator

**What it is:** When `*` appears before a pointer variable, it reads the value stored
at the address that pointer holds. Dereferencing "follows the arrow" to the actual data.

```cpp
int  score = 100;
int* p     = &score;    // p holds the address of score

int  value = *p;        // *p reads the int at the address p holds → 100
*p = 999;               // *p writes 999 to the memory at address p → score becomes 999
```

**Writing through a pointer:** `*p = 999` does not change `p` (the address stays
the same). It writes `999` into the memory at that address — which is where `score`
lives. After this, `score` is 999.

---

## Step 1 — Inspect Variable Addresses

New `main.cpp`:

```cpp
#include <iostream>    // std::cout, std::endl

int main() {
    std::cout << "=== Memory Address Inspector ===" << std::endl;
    std::cout << std::endl;

    int score  = 100;
    int health = 75;

    // Print values
    std::cout << "Variable 'score'  holds value: " << score  << std::endl;
    std::cout << "Variable 'score'  lives at:    " << &score << std::endl;  // & = address-of
    std::cout << "Variable 'health' holds value: " << health << std::endl;
    std::cout << "Variable 'health' lives at:    " << &health << std::endl;

    return 0;
}
```

**`std::cout << &score` explained:** When you print a pointer with `std::cout`,
it prints the address in hexadecimal (base 16). Hexadecimal is compact — 8 hex digits
represent a 32-bit address. You will see values like `0x5ffe3c`.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Four lines. The addresses will be different every time you run the
program — the OS assigns fresh stack memory on each run (ASLR: Address Space Layout
Randomization, a security feature you will study in S-08).

**Observe:** `score` and `health` are declared consecutively. Their addresses differ
by 4 bytes (the size of `int`). The compiler places local variables sequentially on
the stack — exactly as the array address arithmetic in LAB 06 predicted.

**Change something:** Add a `char c = 'A';` between `score` and `health`. Print `&c`.
The addresses of `score` and `health` now have a 1-byte gap between them — or may
be rearranged by the compiler for alignment. Observe the addresses.

---

## Step 2 — Declare a Pointer and Dereference

Add after the address prints:

```cpp
    std::cout << std::endl;

    int* p = &score;    // ← add: p is a pointer to int; it holds the address of score

    std::cout << "pointer 'p' holds address:  " << p  << std::endl;  // prints the address
    std::cout << "*p (value at that address): " << *p << std::endl;  // dereferences: prints 100
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** `p` prints the same address as `&score`. `*p` prints `100`.

**Change something:** Change `int score = 100` to `int score = 42`. Recompile. `*p`
now prints `42` — because `p` points to `score`, and `score` is 42. The pointer
does not store the value; it stores the location. The location's value changed.

---

## Step 3 — Modify the Original Through the Pointer

```cpp
    std::cout << std::endl;
    std::cout << "Changing score through the pointer..." << std::endl;

    *p = 999;   // ← add: write 999 to the memory address p points to

    // score itself changes — p points to score's location
    std::cout << "score is now: " << score << std::endl;   // prints 999
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** `score is now: 999`. We never wrote `score = 999`. We wrote
through the pointer `p`. This is the foundation of every "pass-by-pointer" function
you will write — it is how you let a function modify the caller's data.

---

## Part 2 — `nullptr` and Pointer Safety

### Concept: `nullptr` — The Safe "No Address" Value

**What it is:** `nullptr` (a C++11 keyword) is a special pointer value meaning
"this pointer does not point to anything valid." It evaluates to address `0x0`.

**Why it exists:** An uninitialized pointer holds garbage — a random number that
happens to look like an address. Dereferencing it reads random memory and produces
undefined behavior. `nullptr` gives you a safe "empty" state:

```cpp
int* safe = nullptr;   // explicitly "I point to nothing"

// Before dereferencing, always check:
if (safe != nullptr) {
    std::cout << *safe;   // only dereference if we know it's valid
}
```

**The alternative (what happens without nullptr):**
```cpp
int* wild;        // uninitialized — holds a garbage address (a "wild pointer")
*wild = 5;        // writes 5 to a random memory location → undefined behavior
                  // could crash, corrupt data, or appear to work randomly
```

**`nullptr` vs `NULL` vs `0`:**
- `0` — an integer. Using it as a pointer is allowed but confusing.
- `NULL` — a C macro that expands to `0`. Legacy code uses this.
- `nullptr` — a genuine null pointer constant. Type-safe. Always use this in C++11+.

**Watch for:** Dereferencing `nullptr` is still undefined behavior — it will almost
always crash with a segmentation fault. `nullptr` does not make dereferencing safe;
it makes the "invalid" state explicit and checkable.

---

## Step 4 — Null Pointer Demonstration

```cpp
    std::cout << std::endl;
    std::cout << "=== Null Pointer ===" << std::endl;

    int* nullPtr = nullptr;   // ← add: explicitly "points to nothing"

    std::cout << "nullPtr value: " << nullPtr << std::endl;   // prints 0x0 or (nil)

    // Safe check before dereferencing
    if (nullPtr != nullptr) {
        std::cout << *nullPtr << std::endl;   // would only run if valid
    } else {
        std::cout << "Pointer is null — not dereferencing." << std::endl;
    }

    // DO NOT DO THIS (shown for explanation only — commented out):
    // *nullPtr = 5;   // ← segfault: writing to address 0 crashes the program
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** `nullPtr value: 0` (or `(nil)` on some systems) and the null message.

---

## Part 3 — Pointer Arithmetic and Arrays

### Concept: Pointer Arithmetic — Why Arrays Are Pointers

**What it is:** You can add an integer to a pointer. `p + 1` does not add 1 to the
address — it adds `1 × sizeof(*p)` (one element's worth of bytes). This is exactly
how array indexing works.

**The connection to LAB 06:**
When you write `tiles[i]`, the compiler translates this to `*(tiles + i)`:
- `tiles` is the address of the first element
- `tiles + i` advances by `i × sizeof(char)` bytes
- `*(tiles + i)` reads the value at that address

`tiles[i]` and `*(tiles + i)` are completely interchangeable — one is syntactic
sugar for the other.

```
char tiles[4] = {'.', '#', '.', '@'};
//  Address: 0x100  0x101  0x102  0x103
//
// tiles + 0 = 0x100   *(tiles + 0) = '.'   tiles[0] = '.'
// tiles + 1 = 0x101   *(tiles + 1) = '#'   tiles[1] = '#'
// tiles + 2 = 0x102   *(tiles + 2) = '.'   tiles[2] = '.'
// tiles + 3 = 0x103   *(tiles + 3) = '@'   tiles[3] = '@'
```

**This also explains LAB 06's "arrays decay to pointers" in functions:**
When you write `void printRow(char tiles[], ...)`, the parameter `tiles` is actually
`char*` — a pointer to the first element. The `[]` notation in a parameter is
syntactic sugar for pointer.

---

## Step 5 — Pointer Arithmetic on an Array

Add a new section:

```cpp
    std::cout << std::endl;
    std::cout << "=== Array as Pointer ===" << std::endl;

    char tiles[4] = {'.', '#', '.', '@'};

    // The array name 'tiles' is the address of the first element
    char* tilePtr = tiles;   // ← add: no & needed — array already gives us the address

    for (int i = 0; i < 4; ++i) {
        std::cout << "tiles[" << i << "] is at: " << static_cast<void*>(tilePtr + i)
                  << "   value: " << *(tilePtr + i)
                  << "   (same as tiles[" << i << "] = " << tiles[i] << ")"
                  << std::endl;
    }
```

**`static_cast<void*>(tilePtr + i)` explained:** `std::cout` treats `char*` as a
C-string (it would print the characters until `\0`). To print the raw address instead,
we cast to `void*` — a generic pointer type that `std::cout` always prints as a hex
address. `static_cast<void*>` is the safe, explicit C++ way to change pointer type.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Four rows, each with an address exactly 1 byte apart (since
`char` is 1 byte) and the value at that address matching `tiles[i]`.

---

## Part 4 — The Three Pointer Dangers

These are not theoretical. In S-07 (Shell) and S-08 (Networking), you will work
with OS APIs that return raw pointers. Knowing these dangers saves hours of debugging.

### Danger 1: The Dangling Pointer

**What it is:** A pointer that points to memory that has been freed or gone out of scope.

```cpp
int* createDanger() {
    int localVar = 42;      // localVar lives on the stack of this function
    return &localVar;       // returning its address — localVar is DESTROYED when function returns
}
// Caller now holds a pointer to memory that no longer belongs to the program
```

The stack frame for `createDanger` is reclaimed when the function returns. The caller's
pointer now points to memory that the system may reuse for something else.

**Detection:** AddressSanitizer (`-fsanitize=address`) catches many dangling pointer
accesses at runtime.

### Danger 2: The Wild Pointer

**What it is:** An uninitialized pointer holding a garbage address.

```cpp
int* wild;    // not initialized — holds whatever bits were in that memory
*wild = 5;    // writes 5 to a random location — undefined behavior
```

**Prevention:** Always initialize pointers — either to a valid address or to `nullptr`.

### Danger 3: Double Free (for dynamic memory)

**What it is:** Deleting the same heap object twice (covered in LAB 09).

```cpp
int* p = new int(42);
delete p;   // first delete — correct
delete p;   // second delete — undefined behavior (memory already returned)
```

---

## 🎯 Challenge: Swap Without a Return Value

**You know:** Pointers, dereferencing, address-of.

**Task:** Write a function `void swap(int* a, int* b)` that swaps the values of
two `int` variables. The function must have `void` return type — no returning the
values. The swap must happen to the original variables in the caller.

**Starting code:**
```cpp
int x = 10;
int y = 25;
std::cout << "Before: x=" << x << " y=" << y << std::endl;
swap(&x, &y);
std::cout << "After:  x=" << x << " y=" << y << std::endl;
// Expected: After: x=25 y=10
```

**Hint:** You need a temporary variable to hold one value during the swap.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void swap(int* a, int* b) {
    int temp = *a;   // save the value a points to
    *a = *b;         // write b's value into a's location
    *b = temp;       // write saved value into b's location
}
```

**Key insight:** `a` and `b` are pointers — they hold addresses. `*a = *b` does not
change what `a` points to; it writes the value at `b`'s address into the memory at
`a`'s address. After the function, `x` and `y` in the caller have swapped values
because the function worked on their actual memory locations. In LAB 09, you will
implement the same swap using references — the modern, preferred C++ approach.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `&score` prints address | A hexadecimal address like `0x5ffe3c` appears |
| `int* p = &score` | `p` prints the same address as `&score` |
| `*p` reads the value | `*p` prints `100` when `score = 100` |
| `*p = 999` modifies original | After `*p = 999`, printing `score` shows `999` |
| `nullptr` check | The null-check `if (nullPtr != nullptr)` correctly skips dereferencing |
| Pointer arithmetic | Addresses in the array demo are exactly `sizeof(char)` apart |
| `*(tilePtr + i) == tiles[i]` | Both expressions produce identical values |
| `swap` challenge | After calling `swap(&x, &y)`, x and y hold each other's original values |

---

## Quick Check Answers

**1. Why can functions modify the original array but not a copied `int`?**
When you pass an array to a function, the parameter receives the address of the
first element (a pointer) — not a copy of all the elements. The function works on
the original memory through that address. When you pass an `int`, C++ copies the
value into a new variable in the function's stack frame — the original is untouched.
The difference is that arrays "decay" to pointers automatically. This is the same
mechanism as passing `&score` to a function that takes `int*` — you are giving the
function the address, not the value.

**2. What type does a pointer's address have?**
A pointer itself is an unsigned integer — a number representing a memory address.
On a 64-bit system, this is a 64-bit unsigned integer (`uint64_t` internally).
But in C++, every pointer has a specific **type** that records what is at that address:
`int*` means "address of an int," `char*` means "address of a char." The type allows
the compiler to correctly compute pointer arithmetic (`int* p + 1` moves 4 bytes,
`char* p + 1` moves 1 byte) and to enforce type safety.

**3. What happens when you dereference a null pointer (`*p` where `p == nullptr`)?**
On virtually all operating systems, reading or writing to address `0x0` triggers a
hardware exception. The OS catches it and sends a signal to your program (SIGSEGV on
Linux, access violation on Windows). This terminates the program immediately with a
"segmentation fault" or "access violation" message. This is actually the best outcome
for a pointer bug — a crash is visible and debuggable. The far worse outcome is a
dangling or wild pointer, which reads valid-looking but incorrect memory and produces
wrong results without crashing.
