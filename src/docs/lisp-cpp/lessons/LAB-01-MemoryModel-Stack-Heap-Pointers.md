# Lisp-CPP — LAB 01 — Memory Model: Stack, Heap, and Pointers

**Prerequisites:** LAB-00 complete. You can compile and run a C++ binary with CMake.

**What this lab adds:**
- Understanding of stack vs. heap memory — where every variable in this interpreter lives
- Raw pointers — the memory address type that connects everything in C++
- Your first `new` and `delete` — manual heap allocation and deallocation
- AddressSanitizer catching a real memory error

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. When a function calls another function, where do the local variables go? Where do they come from when the first function returns?
> 2. What happens to a local variable after the function it was declared in returns?
> 3. If you need a data structure that outlives the function that created it, where must it live?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp

=== Stack Memory ===
x lives at address: 0x7ffd3a2c14ac
x has value: 42
size of x in bytes: 4

=== Heap Memory ===
y lives at address: 0x602000000010
y has value: 100
size of *y in bytes: 4

=== Pointer Arithmetic ===
address stored in y: 0x602000000010
address of y itself: 0x7ffd3a2c14a0

=== ASAN Catches a Bug ===
(this line intentionally causes ASAN to fire — read the output)
```

Every line you see comes from you deliberately inspecting memory. When this lab
is done, you will know where every variable in your Lisp interpreter lives and why.

---

## Concept: The Process Memory Map

**What it is:** When the OS runs your binary, it gives the process a large block
of virtual memory. That memory is divided into regions with different purposes.

**The full map of a running C++ process:**

```
High addresses (e.g., 0xFFFFFFFFFFFF)
┌─────────────────────────────┐
│  Kernel (OS code)           │  ← you cannot touch this
├─────────────────────────────┤
│  Stack                      │  ← local variables, function call frames
│    grows downward ↓         │
│                             │
│        (unused space)       │
│                             │
│    grows upward ↑           │
│  Heap                       │  ← new/delete, long-lived data
├─────────────────────────────┤
│  BSS segment                │  ← uninitialized global variables
├─────────────────────────────┤
│  Data segment               │  ← initialized global/static variables
├─────────────────────────────┤
│  Text segment               │  ← your compiled machine code (read-only)
└─────────────────────────────┘
Low addresses (e.g., 0x000000000000)
```

**The two regions you control are Stack and Heap.** Everything else is managed
by the OS and compiler.

**Why does the stack grow downward and the heap grow upward?**

They start from opposite ends of the available address space and grow toward
each other. This maximizes the usable space — neither region needs a fixed size
allocation. If they meet (stack overflow, or out of memory), the process crashes.

**Transfer:** Every operating system on every architecture uses this same layout.
Linux, macOS, Windows — all the same. Every language runtime operates within
this model. When JavaScript's V8 engine allocates an object, it uses the heap.
When a Python function calls another function, it uses the stack. The model is
universal.

---

## Concept: The Stack

**What it is:** The stack is a region of memory that stores local variables and
function call state (the "call frame"). It operates like a physical stack of plates:
you push frames onto it when functions are called, and pop them off when functions return.

**How it works — step by step:**

```cpp
int add(int a, int b) {
    int result = a + b;   // result lives on the stack — in add's frame
    return result;
}

int main(int argc, char* argv[]) {
    int x = 10;           // x lives on the stack — in main's frame
    int y = add(x, 5);    // calling add pushes a new frame
    return 0;
}
```

When `main` starts:
```
Stack (top = current frame)
┌─────────────────┐
│ main's frame    │
│   x = 10       │
│   y = ???      │  ← not computed yet
│   argc = 1     │
│   argv = ...   │
└─────────────────┘
```

When `add(x, 5)` is called:
```
Stack
┌─────────────────┐
│ add's frame     │  ← pushed on top
│   a = 10       │  ← copy of x
│   b = 5        │
│   result = 15  │
├─────────────────┤
│ main's frame    │
│   x = 10       │
│   y = ???      │
└─────────────────┘
```

When `add` returns:
```
Stack
┌─────────────────┐
│ main's frame    │  ← add's frame is gone (popped)
│   x = 10       │
│   y = 15       │  ← result copied here from add's frame
└─────────────────┘
```

**The critical rule:** When a function returns, its stack frame is destroyed.
All local variables in that frame cease to exist. Their memory is immediately
available for the next function call to use.

**Why this matters for the interpreter:**

Every time `eval()` calls `parse()` which calls `tokenize()` — that's three
stack frames deep. If `eval()` calls itself recursively 10,000 times (deep
Lisp recursion), that's 10,000 frames on the stack. The stack has a fixed size
(typically 1–8 MB). This is exactly why LAB-15 shows a stack overflow and
LAB-16 fixes it with tail calls.

**Stack size test:**
```cpp
// This function calls itself forever — each call adds one frame
void infinite_recursion() {
    int local = 42;          // 4 bytes on the stack per call
    infinite_recursion();    // calls itself
}
```
After enough calls, the stack runs out of space: **Segmentation Fault** (or ASAN
reports a stack overflow). You will see this happen intentionally in LAB-15.

---

## Concept: The Heap

**What it is:** The heap is a region of memory you allocate manually using `new`
and release manually using `delete`. Data on the heap persists until you explicitly
free it — it does not disappear when the function that created it returns.

**The problem the heap solves:**

You cannot return a pointer to a local variable:

```cpp
int* broken_function() {
    int local = 42;
    return &local;   // WRONG: local is destroyed when function returns
}                    // the pointer now points to garbage memory
```

But you can return a pointer to heap-allocated data:

```cpp
int* working_function() {
    int* ptr = new int(42);  // allocates on the heap — survives the return
    return ptr;              // caller receives a valid pointer
}

int main(int argc, char* argv[]) {
    int* value = working_function();
    printf("%d\n", *value);  // prints 42 — the data is still there
    delete value;            // we are done — free the memory
    return 0;
}
```

**This is the entire reason the heap exists:** data that must outlive the function that created it.

**Why this matters for the interpreter:**

Every AST node you create in the parser (LAB-07) must outlive the `parse()`
function — it must still exist when `eval()` reads it. That means every node
goes on the heap. This interpreter will make thousands of heap allocations.
Managing that memory correctly is the subject of LAB-17 (smart pointers) and
LAB-18 (garbage collection).

**Transfer:** Python, Java, JavaScript, Ruby — every garbage-collected language
allocates all its objects on the heap. The garbage collector's job is to call
the equivalent of `delete` automatically when you are done with an object.
When you write `x = {}` in Python, that object is on the heap. When you write
`let obj = {}` in JavaScript, same. C++ just makes you manage it yourself —
which is why you must understand it before the GC can make sense.

---

## Concept: Pointers

**What it is:** A pointer is a variable that holds a memory address — the location
of another variable, not the variable's value itself.

**The anatomy of a pointer:**

```cpp
int x = 42;    // x is an int. It holds the value 42.
               // x lives at some address, say 0x7ffd...1abc

int* ptr = &x; // ptr is a pointer to int. It holds the ADDRESS of x.
               // ptr itself lives at some other address.
               // ptr's VALUE is 0x7ffd...1abc
               // *ptr is the value AT that address: 42
```

**Three pointer operators you must know:**

| Operator | Name | What it does |
|----------|------|-------------|
| `&x` | address-of | gives you the memory address of `x` |
| `int*` | pointer type | declares "this variable holds an address of an int" |
| `*ptr` | dereference | follows the address — gives you the value at that address |

**Reading `*` in declarations vs. expressions:**

This is confusing at first. The `*` means different things in two contexts:

```cpp
int* ptr = &x;   // declaration: ptr is a "pointer to int" (type declaration)
*ptr = 100;      // expression: follow the pointer, set the value there
printf("%d", *ptr); // expression: follow the pointer, read the value there
```

In a **type declaration**, `*` is part of the type name: `int*` = "pointer to int".
In an **expression**, `*` is the dereference operator: "go to the address stored in this pointer and give me what's there."

**Pointer size:**

On a 64-bit system (which you are almost certainly on), every pointer is exactly
8 bytes — regardless of what it points to. A `char*` is 8 bytes. An `int*` is 8
bytes. This is because a pointer holds a 64-bit memory address, and 64 bits = 8 bytes.

**The NULL pointer:**

A pointer that points to nothing. In modern C++, use `nullptr`:

```cpp
int* ptr = nullptr;  // this pointer points to nothing

if (ptr != nullptr) {
    printf("%d", *ptr);   // safe — only dereference if not null
}
// printf("%d", *ptr);    // CRASH if ptr is nullptr — dereferencing null
                          // is undefined behavior
```

Every pointer must be checked for `nullptr` before dereferencing.
In this interpreter, you will check for null constantly. ASAN catches
null dereferences immediately and shows you exactly which line caused it.

**Transfer:** Pointers in C++ are the explicit version of what every language
does internally. In Python, every variable is a reference (a pointer) to an
object on the heap. When you write `x = [1, 2, 3]`, Python stores a pointer
to the list. When you write `y = x`, you copy the pointer — both `x` and `y`
point to the same list. C++ just makes the pointer explicit and requires you
to manage the memory it points to.

---

## Concept: `new` and `delete`

**What it is:** `new` allocates memory on the heap and returns a pointer to it.
`delete` frees that memory and returns it to the OS.

**Syntax:**

```cpp
// Allocate one int on the heap, initialized to 42:
int* ptr = new int(42);

// Allocate an array of 10 ints on the heap:
int* arr = new int[10];

// Free a single allocation:
delete ptr;

// Free an array allocation (must use delete[], not delete):
delete[] arr;
```

**What happens without `delete`:**

The allocated memory is never returned to the OS for the lifetime of the process.
This is a **memory leak**. On a short program it doesn't matter — the OS reclaims
all memory when the process exits. On a long-running program (like a Lisp REPL
that runs for hours), leaks accumulate until the process runs out of memory.

**What ASAN reports for a leak:**

```
==12345==ERROR: LeakSanitizer: detected memory leaks

Direct leak of 4 byte(s) in 1 object(s) allocated from:
    #0 operator new(unsigned long) (/lib/libasan.so.6)
    #1 main src/main.cpp:15
```

The number, filename, and line are exact. You will learn to read this output.

**The cardinal rule:**

Every `new` must have exactly one corresponding `delete`. Not zero (leak).
Not two (double-free — corrupts the heap, undefined behavior). Exactly one.

LAB-17 introduces `std::unique_ptr`, which enforces this rule automatically
using the destructor mechanism. Until then, we manage it manually.

---

## Step 1 — Explore Stack Memory

Replace `src/main.cpp` with this:

```cpp
#include <cstdio>  // printf

int main(int argc, char* argv[]) {

    // ── STACK MEMORY ──────────────────────────────────────────────
    printf("=== Stack Memory ===\n");

    int x = 42;          // x is a local variable — lives on the stack

    // &x: the address-of operator — gives the memory address of x
    // %p: printf format specifier for pointers (prints as hex address)
    // (void*): cast to void* so %p accepts it (explained below)
    printf("x lives at address: %p\n", (void*)&x);

    // %d: printf format specifier for signed integers
    printf("x has value: %d\n", x);

    // sizeof(x): a compile-time operator that returns the size of a type/variable
    // in bytes. sizeof returns size_t — use %zu to print it.
    printf("size of x in bytes: %zu\n", sizeof(x));

    return 0;
}
```

**What is `(void*)`?**

`%p` in `printf` expects a `void*` — a pointer to "unspecified type." 
`&x` gives you an `int*`. The cast `(void*)&x` converts it to `void*` so
`printf` accepts it without a warning. This is the only valid use of this
specific cast pattern.

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

You should see:
```
=== Stack Memory ===
x lives at address: 0x7ffd3a2c14ac
x has value: 42
size of x in bytes: 4
```

Your address will be different — it changes every run (ASLR: Address Space
Layout Randomization, a security feature). But it will always start with
`0x7fff...` or similar high-value address — that is the stack region.

**Change something:** Add `int y = 99;` after `int x = 42;`. Print `&y`.
Notice that `&y` is 4 bytes away from `&x` (the stack grows downward, so
`y`'s address is lower than `x`'s by 4). Change it back.

---

## Step 2 — Explore Heap Memory

Add this to `main()` after the stack section:

```cpp
    // ── HEAP MEMORY ───────────────────────────────────────────────
    printf("\n=== Heap Memory ===\n");

    // new int(100): allocate one int on the heap, initialized to 100.
    // Returns a pointer to the allocated memory.
    // y is a pointer to int — it holds the ADDRESS of the heap memory.
    int* y = new int(100);  // ← add this

    // y is a pointer — print its value (the heap address)
    printf("y lives at address: %p\n", (void*)y);  // ← add this

    // *y: dereference the pointer — follow the address, get the int there
    printf("*y has value: %d\n", *y);  // ← add this

    printf("size of *y in bytes: %zu\n", sizeof(*y));  // ← add this (size of what y points to)
    printf("size of y (the pointer) in bytes: %zu\n", sizeof(y));  // ← add this (always 8 on 64-bit)

    // CRITICAL: every new must have a delete.
    // Without this line, ASAN reports a memory leak.
    delete y;  // ← add this — free the heap memory
    y = nullptr; // ← add this — good practice: null the pointer after delete
                 // prevents accidental use-after-free
```

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

You should see:
```
=== Stack Memory ===
x lives at address: 0x7ffd3a2c14ac
x has value: 42
size of x in bytes: 4

=== Heap Memory ===
y lives at address: 0x602000000010
*y has value: 100
size of *y in bytes: 4
size of y (the pointer) in bytes: 8
```

**Notice:** The heap address (`0x602...`) is completely different from the
stack address (`0x7ffd...`). They are in different memory regions, far apart.
The pointer `y` (8 bytes) holds the address `0x602000000010` — an 8-byte number
representing a location in heap memory.

---

## Step 3 — Show Pointer Arithmetic

Add this section to understand what a pointer *is*:

```cpp
    // ── POINTER ARITHMETIC ────────────────────────────────────────
    printf("\n=== Pointer Arithmetic ===\n");

    int* p = new int(55);

    // p holds the address of the heap allocation:
    printf("address stored in p: %p\n", (void*)p);

    // &p is the address of the pointer variable itself (on the stack!):
    printf("address of p itself: %p\n", (void*)&p);

    // p + 1: moves the pointer forward by sizeof(int) = 4 bytes.
    // This is pointer arithmetic — the step size depends on the type.
    printf("p + 1 (next int address): %p\n", (void*)(p + 1));

    delete p;
    p = nullptr;
```

### COMPILE AND RUN

Observe that `p + 1` is exactly 4 bytes ahead of `p`. Pointer arithmetic
steps by `sizeof(pointed-to type)`. This is fundamental to how arrays work
in C++: `arr[i]` is just `*(arr + i)` — start at `arr`, move `i * sizeof(type)` bytes, dereference.

---

## Step 4 — Let ASAN Catch a Bug

This step deliberately introduces a memory error so you see what ASAN output looks like.
Add this **after** the pointer arithmetic section:

```cpp
    // ── ASAN DEMONSTRATION ────────────────────────────────────────
    printf("\n=== ASAN Catches a Bug ===\n");

    int* leak = new int(999);  // ← add this — allocated but never deleted

    // We intentionally do NOT call delete leak.
    // ASAN's leak sanitizer will report this at program exit.
    // Comment this out after seeing the output to fix the lab.
    (void)leak;  // suppress "unused variable" warning — (void) is a cast to nothing
```

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

After the normal output, ASAN prints:

```
=================================================================
==12345==ERROR: LeakSanitizer: detected memory leaks

Direct leak of 4 byte(s) in 1 object(s) allocated from:
    #0 0x... in operator new(unsigned long) (/lib/x86_64-linux-gnu/libasan.so.6+...)
    #1 0x... in main /home/user/lisp-cpp/src/main.cpp:62

SUMMARY: AddressSanitizer: 4 byte(s) leaked in 1 allocation(s).
```

ASAN tells you: **4 bytes leaked**, allocated at **your line 62** in `main.cpp`.
This is the exact information you need to fix it. Now fix the leak:

```cpp
    delete leak;   // ← add this to fix the leak
    leak = nullptr;
```

Rebuild and run. ASAN prints nothing extra — no leaks detected.

---

## Step 5 — Clean Up `main.cpp`

Remove all the demonstration code. Replace `main()` with the clean version
the interpreter will use going forward:

```cpp
#include <cstdio>

const int VERSION_MAJOR = 0;  // major version number — increment for breaking changes
const int VERSION_MINOR = 1;  // minor version number — increment for new features

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);
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
```

No ASAN output. Clean binary, ready for LAB-02.

---

## What Just Happened

You saw exactly where variables live:
- Local variables → stack (address like `0x7fff...`, gone when function returns)
- `new` allocations → heap (address like `0x602...`, survives until `delete`)
- Pointers → stack (they are variables too), but their *value* points to the heap

This model underlies every data structure you will build. The AST nodes in
the parser live on the heap. The environment frames live on the heap. The
Lisp values live on the heap. When LAB-18 builds the garbage collector, it
traces the heap to find which nodes are still reachable — you will understand
exactly what it is tracing because you have seen the heap with your own eyes.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Stack address printed | `&x` prints a high address (0x7fff...) |
| Heap address printed | `new int` address is lower (0x602...) |
| Pointer size is 8 | `sizeof(y)` prints 8 |
| Pointed-to size is 4 | `sizeof(*y)` prints 4 |
| ASAN catches leak | Removing `delete` causes ASAN to report a 4-byte leak |
| Clean binary at end | Final `main.cpp` compiles and prints version with no ASAN output |

---

## Self-Check (answer from memory)

1. A function creates `int x = 5` and returns. What happens to `x`? Why?
2. You need to return a large data structure from a function. Where must it live, and how do you allocate it?
3. What does `*ptr` mean when `ptr` is declared as `int*`?
4. Why is `sizeof(ptr)` always 8, regardless of what type `ptr` points to?
5. What is the difference between `delete ptr` and `ptr = nullptr`? Why do both?

---

## What's Next

LAB-02 introduces structs and enums — the two tools for grouping data and
giving names to categories. The Token type the lexer produces in LAB-05 is
a struct with an enum field. Understanding their layout in memory, which you
now can, makes their design obvious.

---

## Quick Check Answers

**1. When a function calls another function, where do the local variables go?**
Each function call creates a new stack frame — a block of stack memory holding
that function's local variables, parameters, and return address. Frames are
pushed when functions are called and popped when they return. The local variables
exist in memory for exactly the lifetime of their frame.

**2. What happens to a local variable after the function returns?**
Its stack frame is popped — the memory is immediately reused for the next
function call. The variable no longer exists. Any pointer to that memory is
now a "dangling pointer" — it points to memory that will be overwritten by
the next function call. Dereferencing a dangling pointer is undefined behavior:
the program might crash, produce wrong output, or appear to work correctly (worst case).

**3. If you need a data structure that outlives the function that created it?**
It must live on the heap. You allocate with `new`, which returns a pointer.
That pointer can be returned from the function and stored elsewhere. The data
remains valid until you explicitly `delete` the pointer. This is the fundamental
reason the heap exists: persistence beyond function scope.
