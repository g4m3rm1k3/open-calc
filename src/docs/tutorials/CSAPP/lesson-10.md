# Lesson 10: Pointers and Memory in Depth

**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 1 — From C to Machine
**Language:** C. Trace by hand.

## What you need to know first
Lessons 00–09 (tour, C, bits, integers, floats, pipeline, registers, control flow, procedures, arrays and structs).

## What you will build
The reader will understand every kind of pointer in C — simple pointers, pointers to pointers, void pointers, function pointers, const pointers, and the memory regions a process uses. The transferable insight: a pointer is just an integer that the CPU interprets as a memory address. Everything you do with pointers is arithmetic on that integer. The common pointer bugs all stem from one of three mistakes: using an invalid address, reading before writing, or writing past the end of an allocation.

## Objects and Methods

### Pointers
*   **What it is:** A variable that stores a memory address.
*   **Implementation:** Stored as an integer (e.g., 64-bit on x86_64) that the hardware treats as a location in RAM.
*   **Its use:** To reference, read, or modify data stored elsewhere in memory.
*   **Type:** Pointer type (e.g., `int *`, `char *`), which dictates how many bytes to read/write upon dereference and how arithmetic scales.
*   **Responsibility:** To accurately hold the address of a valid memory segment.
*   **Depends on:** The operating system and hardware memory management providing valid address spaces.
*   **Connects to:** The data it points to via dereferencing operations.
*   **Shape:** An integer-sized block in memory (typically 8 bytes on 64-bit systems).

### `malloc`
*   **What it is:** A standard library function that allocates a requested number of bytes on the heap.
*   **Implementation:** Requests memory pages from the OS and manages a pool of available memory chunks.
*   **Its use:** To dynamically allocate memory at runtime when the required size is not known at compile time or needs to outlive the current function scope.
*   **Type:** Function returning a `void *` (a generic pointer).
*   **Responsibility:** To find and reserve a contiguous block of unused heap memory of at least the requested size.
*   **Depends on:** The operating system's heap memory management and virtual memory system.
*   **Connects to:** `free`, which must be called to release the memory it allocates.
*   **Shape:** `void *malloc(size_t size);`

### `free`
*   **What it is:** A standard library function that deallocates memory previously allocated by `malloc`, `calloc`, or `realloc`.
*   **Implementation:** Marks the memory chunk as available in the allocator's internal data structures.
*   **Its use:** To prevent memory leaks by returning memory to the heap once it is no longer needed.
*   **Type:** Function returning `void`.
*   **Responsibility:** To safely return a previously allocated memory block to the available heap pool.
*   **Depends on:** A valid pointer previously returned by a memory allocation function.
*   **Connects to:** `malloc` and other allocation functions.
*   **Shape:** `void free(void *ptr);`

## Concept 1: What a pointer is — address, type, dereference

### Throwaway Lab: Basic Pointers
Before we integrate pointers into complex logic, let us examine a basic, throwaway example of declaring a pointer, assigning an address, and dereferencing it. We will explicitly discard this code afterward.

```c
#include <stdio.h>

int main(void)
{
    int   x = 42;
    int  *p = &x;          /* p holds the address of x */

    printf("%d\n",  x);    /* 42 (value of x) */
    printf("%p\n",  (void*)p);  /* address of x, e.g. 0x7fff1234 */
    printf("%d\n",  *p);   /* 42 (dereference: value at address p) */

    *p = 100;              /* write through pointer: modifies x */
    printf("%d\n",  x);    /* 100 (x was changed via *p) */
    printf("%d\n",  *p);   /* 100 */

    int **pp = &p;         /* pointer to pointer */
    printf("%d\n", **pp);  /* 100 (dereference twice) */

    return 0;
}
```

This short C program demonstrates declaring variables and pointers, taking addresses, and modifying data through a pointer. When executed, the program outputs something similar to this:

```
42
0x7ffc3a5b6f14
42
100
100
100
```

### Tracing the Memory
The output begins by printing `42`, the literal value of `x`. The second line prints the actual memory address where `x` resides (e.g., `0x7ffc3a5b6f14`). Next, `*p` dereferences that address to read the value, outputting `42`. When we write `100` to `*p`, it directly alters the memory holding `x`. 

Here is a memory diagram tracing the final state of the local variables:

```
Address   Value     Variable
0x7fff10: 100       x
0x7fff08: 0x7fff10  p  (holds address of x)
0x7fff00: 0x7fff08  pp (holds address of p)
```

The syntax `*p` translates to `Mem[p]` in hardware logic. By creating `**pp`, a pointer to a pointer, evaluating `**pp` becomes `Mem[Mem[pp]]`.

## Concept 2: Pointer arithmetic

### Throwaway Lab: Pointer Addition and Subtraction
We now create another throwaway lab to demonstrate how pointer arithmetic scales by the size of the underlying type. We will discard this code after tracing it.

```c
#include <stdio.h>

int main(void)
{
    int arr[5] = {10, 20, 30, 40, 50};
    int *p = arr;         /* p points to arr[0] */

    printf("%d\n", *p);      /* 10 */
    printf("%d\n", *(p+1));  /* 20 (p+1 = p + 1*sizeof(int) = p + 4) */
    printf("%d\n", *(p+4));  /* 50 */

    p++;                     /* p now points to arr[1] */
    printf("%d\n", *p);      /* 20 */

    /* Pointer difference: number of elements between two pointers */
    int *start = arr;
    int *end   = arr + 5;  /* one past the last element */
    printf("%ld\n", end - start);  /* 5 (elements, not bytes!) */

    /* Byte difference: cast to char* */
    printf("%ld\n", (char*)end - (char*)start);  /* 20 (bytes) */

    return 0;
}
```

When we run this program, we see exactly how the compiler handles additions and differences between pointers.

```
10
20
50
20
5
20
```

### Examining Pointer Scaling
Adding integers to a pointer does not merely add raw bytes. The expression `p + n` mathematically adds `n * sizeof(*p)` to the numeric value of `p`. Since `p` is an `int *` (and `sizeof(int)` is 4 bytes on most systems), `p + 1` advances the address by 4 bytes. 

Pointer subtraction also operates on elements, not bytes. The difference `end - start` computes the number of `int` elements between the two addresses, returning `5`. To find the exact byte difference, we must cast the pointers to `char *` (since `sizeof(char)` is always 1 byte). 

## Concept 3: void pointers and casting

### Throwaway Lab: Generic Memory Access
This throwaway lab examines `void *`, which is an untyped pointer. We will cast it to a specific type before doing memory operations. We will discard this logic after observing it.

```c
#include <stdio.h>
#include <stdlib.h>  /* malloc, free */

void zero_bytes(void *ptr, size_t n)
{
    char *p = (char *)ptr;  /* cast void* to char* for byte access */
    for (size_t i = 0; i < n; i++)
        p[i] = 0;
}

int main(void)
{
    int arr[3] = {1, 2, 3};
    zero_bytes(arr, sizeof(arr));  /* zero all 12 bytes */
    printf("%d %d %d\n", arr[0], arr[1], arr[2]);  /* 0 0 0 */

    /* malloc returns void* */
    int *buf = (int*)malloc(10 * sizeof(int));
    buf[0] = 42;
    printf("%d\n", buf[0]);  /* 42 */
    free(buf);
    return 0;
}
```

Running this lab shows how untyped memory gets manipulated via casts.

```
0 0 0
42
```

### Understanding Untyped Addresses
A `void*` is a generic pointer. It strictly holds an address but possesses no type information regarding the data that resides there. Consequently, you cannot dereference it directly (as the compiler would not know how many bytes to read or write). You must cast it to a typed pointer first.

The `malloc` function returns a `void*` because it provides a raw block of memory and does not know what type you intend to use it for. In C, the cast from `void*` to any other pointer type happens implicitly; however, an explicit cast is commonly written for clarity.

## Concept 4: const and pointers — four combinations

### Throwaway Lab: Reading const Pointer Declarations
Let us write a throwaway lab that attempts all combinations of `const` with pointers to see what the compiler permits and rejects. 

```c
int main(void)
{
    int x = 10;
    const int y = 20;

    /* 1. Pointer to const int: cannot modify *p, but can change p */
    const int *p1 = &y;   /* ok */
    /* *p1 = 30; */        /* COMPILE ERROR: *p1 is read-only */
    p1 = &x;              /* ok: p1 can point elsewhere */

    /* 2. Const pointer to int: cannot change p, but can modify *p */
    int * const p2 = &x;  /* p2 is fixed to point at x */
    *p2 = 50;             /* ok: modifies x */
    /* p2 = &y; */        /* COMPILE ERROR: p2 cannot be reassigned */

    /* 3. Const pointer to const int: cannot change p or *p */
    const int * const p3 = &y;
    /* *p3 = 30; */        /* COMPILE ERROR */
    /* p3 = &x; */        /* COMPILE ERROR */

    /* 4. Pointer to non-const int */
    int *p4 = &x;         /* ordinary pointer */
    *p4 = 99;             /* ok */
    
    return 0;
}
```

Since the invalid operations are commented out, compiling this program succeeds silently. It has no output.

```
(No output)
```

### The Right-To-Left Rule
To correctly understand complex pointer declarations in C, read them from right to left:
1. `const int *p`: "p is a pointer to an int that is const." You can change `p` to point to another address, but you cannot modify the value `*p`.
2. `int * const p`: "p is a const pointer to an int." The pointer `p` is fixed to its initial address, but you can alter the data at `*p`.
3. `const int * const p`: "p is a const pointer to an int that is const." Neither the address nor the target data can be changed.
4. `int *p`: Standard pointer where both address and data are mutable.

## Concept 5: Function pointers

### Throwaway Lab: Pointers to Code
Code itself resides in memory, and therefore we can hold a pointer to it. We will create a throwaway lab to execute functions indirectly through pointers.

```c
#include <stdio.h>

long add(long a, long b) { return a + b; }
long mul(long a, long b) { return a * b; }

int main(void)
{
    /* Declare a function pointer: */
    long (*op)(long, long);  /* op is a pointer to function (long,long)->long */

    op = add;
    printf("%ld\n", op(3, 4));   /* 7 */

    op = mul;
    printf("%ld\n", op(3, 4));   /* 12 */

    /* Array of function pointers: */
    long (*ops[2])(long, long) = {add, mul};
    printf("%ld\n", ops[0](5, 6));  /* 11 */
    printf("%ld\n", ops[1](5, 6));  /* 30 */

    return 0;
}
```

Running this lab demonstrates how we can swap the active logic of our program dynamically.

```
7
12
11
30
```

### Callbacks and Virtual Dispatch
Just as an array name decays to a pointer to its first element, a function name decays to a pointer to its machine code instructions. We can pass a function pointer as an argument to another function, which allows us to implement callbacks. This forms the basis of dynamic behavior in C, enabling patterns such as the comparison function used in `qsort` or the virtual method tables (vtables) that underpin C++ polymorphism.

## Concept 6: The process memory layout — stack, heap, text, data, BSS

### Throwaway Lab: Memory Segments in Practice
This throwaway lab allocates variables in different memory segments to show their resulting virtual addresses.

```c
#include <stdio.h>
#include <stdlib.h>

int global_init = 42;      /* .data segment */
int global_uninit;         /* .bss segment (zero-initialized) */
static int static_var = 7; /* .data segment */

int main(void)
{
    int local = 100;        /* stack */
    int *heap = malloc(8);  /* heap */
    *heap = 200;

    printf("text: %p\n", (void*)main);        /* low address */
    printf("data: %p\n", (void*)&global_init);
    printf("bss:  %p\n", (void*)&global_uninit);
    printf("heap: %p\n", (void*)heap);
    printf("stack:%p\n", (void*)&local);       /* high address */

    free(heap);
    return 0;
}
```

When we run this program, we observe the spatial layout of our memory.

```
text: 0x559e1b2011a9
data: 0x559e1b204010
bss:  0x559e1b20401c
heap: 0x559e1ca2b2a0
stack:0x7ffcf27b40bc
```

### Anatomy of Process Memory
A process's virtual memory maps into discrete regions:

*   **Stack:** (Highest addresses) Grows downward. Holds local variables and function call frames. Passing the bounds leads to a stack overflow.
*   **Heap:** (Middle addresses) Grows upward. Managed via `malloc` and `free` for dynamic allocations.
*   **BSS segment:** Holds uninitialized global/static variables. The OS zero-initializes this segment automatically.
*   **Data segment:** Holds initialized global/static variables (like `global_init` and `static_var`).
*   **Text segment:** (Lowest addresses) Contains the compiled program code. It is read-only and executable. 

Dereferencing addresses near `0x0000000000000000` (like `NULL`) triggers a segmentation fault (`SIGSEGV`) because that region is deliberately unmapped.

## Concept 7: Common pointer bugs and how to diagnose them

### Throwaway Lab: Memory Violations
Our final throwaway lab outlines various dangerous memory operations. Note that these are intentionally flawed implementations meant for analysis and should never be run in production.

```c
#include <stdio.h>
#include <stdlib.h>

void dangling_pointer() {
    int *p;
    {
        int x = 42;
        p = &x;     /* p points to a local variable */
    }               /* x's lifetime ends here; p is now dangling */
    /* *p = 100; */ /* UNDEFINED BEHAVIOR: x no longer exists */
}

void use_after_free() {
    int *p = malloc(sizeof(int));
    *p = 42;
    free(p);        /* p is now invalid */
    /* *p = 100; */ /* UNDEFINED BEHAVIOR */
    /* free(p); */  /* double free -- also UB */
}

void null_dereference() {
    int *p = NULL;  /* p = 0x0 (by convention) */
    /* *p = 42; */  /* SIGSEGV: address 0 is not mapped */
}

void uninitialized_pointer() {
    int *p;         /* p contains garbage address */
    /* *p = 42; */  /* reads garbage as address and writes -- UB */
}

void out_of_bounds() {
    int arr[3] = {0};
    /* arr[5] = 99; */ /* UB: writes past end of array */
}

int main(void)
{
    printf("Compiled with memory violations commented out.\n");
    return 0;
}
```

Since the bugs are commented out to prevent crashing, the output is simple:

```
Compiled with memory violations commented out.
```

### Diagnosing the Bugs
1.  **Dangling pointer:** The hardware memory remains, but the compiler reuses that stack frame space for future functions. Modifying a dangling pointer corrupts subsequent function calls.
2.  **Use after free:** The heap allocator has already reclaimed the chunk. Modifying it alters data now belonging to a completely different part of the program, or corrupts the allocator's internal structures.
3.  **NULL dereference:** The OS configures the CPU's memory management unit (MMU) to trap accesses to address 0, halting the program with a `SIGSEGV`.
4.  **Uninitialized pointer:** A local pointer variable gets whatever garbage value happened to be on the stack. Writing to it alters random memory locations, leading to silent, unpredictable corruption (Undefined Behavior).
5.  **Out-of-bounds write:** Writing past the end of a stack array silently corrupts adjacent local variables or, catastrophically, the function's return address.

Tools like Valgrind or compiler flags like AddressSanitizer (`-fsanitize=address`) instrument the code to track allocations and trap these bugs precisely at runtime.

## Conclusion and Exercises

Every systems programmer has hit each of these bugs at some point. Lesson 11 covers buffer overflows — what happens when an out-of-bounds write corrupts the return address, and how attackers exploit it to run arbitrary code.

### Exercises
1.  Declare a function pointer to `strcmp` from `<string.h>`.
2.  Draw the memory diagram for a function that has a local array `char buf[8]` and a local `int x` on the stack.
3.  Explain why placing `free(p); p = NULL;` after every free operation helps prevent use-after-free bugs.
