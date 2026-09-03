# Lesson 09: Arrays, Structs, and Data Alignment in Memory

What you will build: The reader will understand how arrays, structs, and unions are laid out in memory, how the compiler computes element addresses, what alignment means and why the compiler inserts padding, and how to read and verify struct layouts. The transferable insight: knowing the memory layout of your data structures is essential for performance (cache locality), for binary file formats and network protocols (must match bit-for-bit), and for debugging with gdb or hexdump.

What you need to know first: Lessons 00-08.

Terms used in this lesson:
- **Array** — A contiguous block of memory holding elements of the same type. It exists so we can store and iterate over multiple related values efficiently without naming each one.
- **Struct** — A named region of memory holding elements of potentially different types. It exists so we can group related data into a single logical unit.
- **Pointer arithmetic** — The mechanism by which adding an integer to a pointer automatically scales the integer by the size of the pointed-to type. It exists so array indexing can compute correct memory addresses seamlessly.
- **Alignment** — The hardware requirement that certain data types must reside at memory addresses that are multiples of a specific size (usually their own size). It exists because CPUs fetch data from memory in aligned word-sized chunks, and unaligned accesses can be slow or trap.
- **Padding** — Unused bytes inserted into a struct by the compiler. It exists to ensure that subsequent fields and the struct itself satisfy their alignment requirements.
- **Packed struct** — A struct compiled with a directive to omit padding. It exists for when memory layout must perfectly match an external format (like a network packet), at the potential cost of unaligned access penalties.
- **Union** — A data structure where all fields share the exact same memory address. It exists so a single memory location can be interpreted in multiple ways, saving space when only one type of value is active at a time.

Objects and methods used:
- **`sizeof`**
  - *What it is:* A C language operator (evaluated at compile time) that yields the size in bytes of its operand.
  - *Implementation:* `size_t sizeof(type)` or `size_t sizeof expression`
  - *Its use:* We use it to determine the exact number of bytes an array, struct, or type occupies in memory, revealing the effects of padding.
  - *Type:* Language operator.
  - *Responsibility:* Computes the compile-time byte size of a type or expression.
  - *Depends on:* A type name or an expression.
  - *Connects to:* Used by the programmer to allocate memory or verify data layouts.
  - *Shape:* A fundamental compile-time facility of the C language.

- **`offsetof`**
  - *What it is:* A macro defined in `<stddef.h>` that yields the byte offset of a specific field within a struct.
  - *Implementation:* `size_t offsetof(type, member)`
  - *Its use:* We use it to peek inside a struct's layout and prove exactly where the compiler placed each field.
  - *Type:* Standard library macro.
  - *Responsibility:* Calculates the byte offset of a struct member relative to the beginning of the struct.
  - *Depends on:* A struct type and the name of a member within that struct.
  - *Connects to:* Used by the programmer to inspect layouts or serialize data structures.
  - *Shape:* A standardized macro provided by the C standard library.

Everything else in the file, not this lesson's subject but still explained:
- **`printf`**
  - *What it is:* The standard C library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...)`
  - *Its use:* We use it to print memory addresses and field values to prove our understanding of data layout.
  - *Type:* Standard library function.
  - *Responsibility:* Formats and prints data to the standard output stream.
  - *Depends on:* A format string and a variable number of arguments matching the format specifiers.
  - *Connects to:* Calls underlying OS write system calls to display text.
  - *Shape:* An I/O boundary function in the C standard library.

## Concept Unit: Arrays — contiguous memory and element addressing

### The Problem
When we need to store multiple items of the same type, declaring individual variables like `int a`, `int b`, `int c` becomes unmanageable. How can we store these items so we can access them dynamically by an index? How does the computer know exactly where the third or fourth item is stored in memory?

> **Pause and predict:** Given a starting address of an integer variable, and knowing that an integer takes 4 bytes, what address would hold the next integer if we placed them side by side? How would you calculate the address of the 10th integer?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main(void) {
    int arr[3] = {10, 20, 30};
    printf("arr base: %p\n", (void*)arr);
    printf("arr[1] address: %p\n", (void*)&arr[1]);
    return 0;
}
```
Predicted confidently: `arr base` will print an address (e.g., `0x7ffc1000`), and `arr[1] address` will print exactly 4 bytes higher (e.g., `0x7ffc1004`). This proves that **arrays** are laid out contiguously in memory, and pointer arithmetic automatically scales by the size of the element.

### Discard the throwaway
This isolated lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we need to demonstrate basic array layouts before building more complex structures.
- **Files affected:** `src/arrays.c` (created)
- **Change type:** Add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>

int main(void) {
    int arr[5] = {10, 20, 30, 40, 50};

    /* Array elements are CONTIGUOUS in memory */
    printf("arr    = %p\n", (void*)arr);        /* base address */
    printf("&arr[0]= %p\n", (void*)&arr[0]);    /* same as arr */
    printf("&arr[1]= %p\n", (void*)&arr[1]);    /* base + 4 bytes */
    printf("&arr[2]= %p\n", (void*)&arr[2]);    /* base + 8 bytes */
    printf("sizeof(int) = %zu\n", sizeof(int)); /* 4 */

    /* Array indexing is pointer arithmetic: */
    /* arr[i] == *(arr + i) == *(int*)((char*)arr + i*sizeof(int)) */
    printf("arr[3] = %d\n", arr[3]);            /* 40 */
    printf("*(arr+3) = %d\n", *(arr + 3));      /* 40: same thing */

    /* 2D array: row-major order */
    int matrix[2][3] = {{1,2,3},{4,5,6}};
    /* Layout in memory: 1 2 3 4 5 6 (rows contiguous) */
    printf("matrix[1][2] = %d\n", matrix[1][2]);  /* 6 */
    /* Address: &matrix[r][c] = base + (r*3 + c) * sizeof(int) */
    printf("&matrix[1][2] = base + %zu bytes\n",
           (char*)&matrix[1][2] - (char*)matrix);  /* 20 bytes */
    return 0;
}
```

### The Updated Project
```c
// ← new file: src/arrays.c
1: #include <stdio.h>
2: 
3: int main(void) {
4:     int arr[5] = {10, 20, 30, 40, 50};
5: 
6:     /* Array elements are CONTIGUOUS in memory */
7:     printf("arr    = %p\n", (void*)arr);        /* base address */
8:     printf("&arr[0]= %p\n", (void*)&arr[0]);    /* same as arr */
9:     printf("&arr[1]= %p\n", (void*)&arr[1]);    /* base + 4 bytes */
10:    printf("&arr[2]= %p\n", (void*)&arr[2]);    /* base + 8 bytes */
11:    printf("sizeof(int) = %zu\n", sizeof(int)); /* 4 */
12: 
13:    /* Array indexing is pointer arithmetic: */
14:    /* arr[i] == *(arr + i) == *(int*)((char*)arr + i*sizeof(int)) */
15:    printf("arr[3] = %d\n", arr[3]);            /* 40 */
16:    printf("*(arr+3) = %d\n", *(arr + 3));      /* 40: same thing */
17: 
18:    /* 2D array: row-major order */
19:    int matrix[2][3] = {{1,2,3},{4,5,6}};
20:    /* Layout in memory: 1 2 3 4 5 6 (rows contiguous) */
21:    printf("matrix[1][2] = %d\n", matrix[1][2]);  /* 6 */
22:    /* Address: &matrix[r][c] = base + (r*3 + c) * sizeof(int) */
23:    printf("&matrix[1][2] = base + %zu bytes\n",
24:           (char*)&matrix[1][2] - (char*)matrix);  /* 20 bytes */
25:    return 0;
26: }
```

### Mechanical walkthrough
- `int arr[5]` declares a contiguous block of memory large enough to hold five `int` values.
- `= {10, 20, 30, 40, 50}` initializes the array elements in order.
- `printf("arr    = %p\n", (void*)arr);` prints the base memory address of the array, casting the array to a void pointer as required by the `%p` format specifier.
- `&arr[0]` takes the address of the first element, which is identical to the array's base address.
- `&arr[1]` takes the address of the second element, which sits exactly `sizeof(int)` bytes after the first.
- `sizeof(int)` yields the compile-time size of an integer (usually 4 bytes).
- `arr[3]` accesses the fourth element (index 3) using array subscript notation.
- `*(arr + 3)` performs pointer arithmetic to achieve the exact same result: it starts at `arr`, steps forward 3 integers (12 bytes), and dereferences the address to get the value.
- `int matrix[2][3]` declares a two-dimensional array with 2 rows and 3 columns.
- `matrix[1][2]` accesses the element at row 1, column 2.
- `(char*)&matrix[1][2] - (char*)matrix` subtracts the base address of the matrix from the address of the specific element to calculate the exact byte offset in memory, casting to `char*` to force the difference to be in units of 1 byte.

### CS lens
Contiguous memory layout.
Also recognized in: disk block allocation, raster image pixel buffers, hardware memory-mapped IO registers, network packet payloads.

### SE lens
Design principle: Direct mapping to hardware capabilities. C arrays map directly to the CPU's memory addressing modes. The alternative not chosen is bounds-checked arrays with fat pointers, which would prevent out-of-bounds errors but at the cost of requiring more memory per array and additional instructions per access.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
arr    = [some address]
&arr[0]= [same address]
&arr[1]= [address + 4]
&arr[2]= [address + 8]
sizeof(int) = 4
arr[3] = 40
*(arr+3) = 40
matrix[1][2] = 6
&matrix[1][2] = base + 20 bytes
```
Because pointer arithmetic scales by the type size implicitly, and multidimensional arrays in C are laid out row-by-row in a flat block of memory.

### One sentence connecting to previous unit
Now that we know how homogeneous data is laid out, we will look at how C groups heterogeneous data together into a struct.

## Concept Unit: Structs — named fields and memory layout

### The Problem
If arrays can only hold elements of the exact same type, how do we group a string, an integer, and a boolean together into a single logical entity (like a user or a network packet)? How does the compiler track where each piece is located?

> **Pause and predict:** If you have a struct with an integer (4 bytes) followed by another integer (4 bytes), what would you expect the address offset of the second integer to be, relative to the start of the struct?

### Introduce the concept in isolation
```c
#include <stdio.h>
struct Simple { int a; int b; };
int main(void) {
    struct Simple s;
    printf("Offset of b: %zu\n", (char*)&s.b - (char*)&s);
    return 0;
}
```
Predicted confidently: `Offset of b: 4`. This proves that **structs** place fields sequentially in memory, and the compiler knows the byte offset of each field.

### Discard the throwaway
This isolated lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are examining struct layouts.
- **Files affected:** `src/structs.c` (created)
- **Change type:** Add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>
#include <stddef.h>

struct Point {
    int x;    /* offset 0: 4 bytes */
    int y;    /* offset 4: 4 bytes */
};            /* total: 8 bytes, alignment: 4 bytes */

struct Rect {
    struct Point origin;  /* offset 0:  8 bytes */
    int width;            /* offset 8:  4 bytes */
    int height;           /* offset 12: 4 bytes */
};                        /* total: 16 bytes */

int main(void) {
    struct Rect r = {{10, 20}, 100, 200};
    printf("sizeof(Point) = %zu\n", sizeof(struct Point));  /* 8 */
    printf("sizeof(Rect)  = %zu\n", sizeof(struct Rect));   /* 16 */
    printf("offsetof(Rect, width) = %zu\n", offsetof(struct Rect, width));  /* 8 */
    printf("r.origin.x = %d\n", r.origin.x);  /* 10 */
    printf("r.width    = %d\n", r.width);      /* 100 */

    /* Struct field access in assembly: */
    /* r.width is at &r + 8 */
    /* Compiler generates: movl 8(%rbp), %eax  (where rbp points to r) */
    struct Rect *rp = &r;
    printf("via pointer: rp->width = %d\n", rp->width);  /* 100 */
    /* Assembly: movl 8(%rdi), %eax  (rdi = rp) */
    return 0;
}
```

### The Updated Project
```c
// ← new file: src/structs.c
1: #include <stdio.h>
2: #include <stddef.h>
3: 
4: struct Point {
5:     int x;    /* offset 0: 4 bytes */
6:     int y;    /* offset 4: 4 bytes */
7: };            /* total: 8 bytes, alignment: 4 bytes */
8: 
9: struct Rect {
10:    struct Point origin;  /* offset 0:  8 bytes */
11:    int width;            /* offset 8:  4 bytes */
12:    int height;           /* offset 12: 4 bytes */
13: };                        /* total: 16 bytes */
14: 
15: int main(void) {
16:    struct Rect r = {{10, 20}, 100, 200};
17:    printf("sizeof(Point) = %zu\n", sizeof(struct Point));  /* 8 */
18:    printf("sizeof(Rect)  = %zu\n", sizeof(struct Rect));   /* 16 */
19:    printf("offsetof(Rect, width) = %zu\n", offsetof(struct Rect, width));  /* 8 */
20:    printf("r.origin.x = %d\n", r.origin.x);  /* 10 */
21:    printf("r.width    = %d\n", r.width);      /* 100 */
22: 
23:    /* Struct field access in assembly: */
24:    /* r.width is at &r + 8 */
25:    /* Compiler generates: movl 8(%rbp), %eax  (where rbp points to r) */
26:    struct Rect *rp = &r;
27:    printf("via pointer: rp->width = %d\n", rp->width);  /* 100 */
28:    /* Assembly: movl 8(%rdi), %eax  (rdi = rp) */
29:    return 0;
30: }
```

### Mechanical walkthrough
- `struct Point` defines a new composite data type containing two integers.
- `int x;` reserves 4 bytes at offset 0 within the struct.
- `int y;` reserves 4 bytes at offset 4 within the struct.
- `struct Rect` embeds a `struct Point` as its first member, proving structs can be nested.
- `struct Rect r = {{10, 20}, 100, 200};` initializes the nested struct fields in memory order.
- `sizeof(struct Point)` evaluates to 8 bytes, the sum of two 4-byte integers.
- `offsetof(struct Rect, width)` uses a macro to ask the compiler for the exact byte distance from the start of `Rect` to the `width` field.
- `r.origin.x` uses the dot operator to access a field directly by its name; the compiler translates this to an offset.
- `struct Rect *rp = &r;` creates a pointer holding the memory address of the struct.
- `rp->width` uses the arrow operator to dereference the pointer and access the field in one step, equivalent to `(*rp).width`.

### CS lens
Composite data types.
Also recognized in: database records, network datagram headers, JSON objects, class instances in OOP, AST nodes in compilers.

### SE lens
Design principle: Encapsulation of related data. Structs allow passing a single pointer around instead of passing five disparate arguments to every function. The alternative not chosen is parallel arrays for each field (e.g., `int x_arr[]`, `int y_arr[]`), which is harder to maintain but sometimes used for extreme performance optimizations (Struct of Arrays vs Array of Structs).

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
sizeof(Point) = 8
sizeof(Rect)  = 16
offsetof(Rect, width) = 8
r.origin.x = 10
r.width    = 100
via pointer: rp->width = 100
```
Because the fields are tightly packed integers and nested structs with no unaligned elements, so their offsets are predictable simple sums.

### One sentence connecting to previous unit
While structs appear perfectly contiguous here just like arrays, mixing different data types introduces alignment rules that change their size.

## Concept Unit: Alignment and padding — why sizeof(struct) is often larger than the sum of fields

### The Problem
If a struct has a 1-byte char, a 4-byte int, and an 8-byte double, we might expect its total size to be 1 + 4 + 8 = 13 bytes. But if we compile it, the size is much larger. Why does the compiler secretly add empty space inside our structures, and how can we control it?

> **Pause and predict:** Why might a CPU be slower (or fail entirely) if it tries to read a 4-byte integer that starts at an odd memory address like `0x1001`?

### Introduce the concept in isolation
```c
#include <stdio.h>
struct Gap { char c; int i; };
int main(void) {
    printf("sizeof(Gap) = %zu\n", sizeof(struct Gap));
    return 0;
}
```
Predicted confidently: `sizeof(Gap) = 8`. This proves that **padding** is inserted by the compiler; the char is 1 byte, but 3 bytes of padding are added before the integer to align it to a 4-byte boundary.

### Discard the throwaway
This isolated lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because alignment is a hardware and compiler constraint.
- **Files affected:** `src/padding.c` (created)
- **Change type:** Add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>
#include <stddef.h>

/* PADDED struct: compiler inserts padding for alignment */
struct Padded {
    char  c;    /* offset 0: 1 byte */
                /* 3 bytes padding: align next field to 4-byte boundary */
    int   i;    /* offset 4: 4 bytes */
    char  c2;   /* offset 8: 1 byte */
                /* 7 bytes padding: align next field to 8-byte boundary */
    double d;   /* offset 16: 8 bytes */
};              /* total: 24 bytes (not 14!) */

/* PACKED struct: no padding (use only when necessary) */
struct __attribute__((packed)) Packed {
    char   c;   /* offset 0: 1 byte */
    int    i;   /* offset 1: 4 bytes (unaligned!) */
    char   c2;  /* offset 5: 1 byte */
    double d;   /* offset 6: 8 bytes (unaligned!) */
};              /* total: 14 bytes */

/* REORDERED: put large fields first to minimize padding */
struct Optimal {
    double d;  /* offset 0:  8 bytes */
    int    i;  /* offset 8:  4 bytes */
    char   c;  /* offset 12: 1 byte */
    char   c2; /* offset 13: 1 byte */
               /* 2 bytes padding to reach 16 (align to 8) */
};             /* total: 16 bytes (saves 8 vs Padded) */

int main(void) {
    printf("Padded:  %zu bytes (offsetof d = %zu)\n",
           sizeof(struct Padded), offsetof(struct Padded, d));   /* 24, 16 */
    printf("Packed:  %zu bytes\n", sizeof(struct Packed));       /* 14 */
    printf("Optimal: %zu bytes\n", sizeof(struct Optimal));      /* 16 */
    return 0;
}
```

### The Updated Project
```c
// ← new file: src/padding.c
1: #include <stdio.h>
2: #include <stddef.h>
3: 
4: /* PADDED struct: compiler inserts padding for alignment */
5: struct Padded {
6:     char  c;    /* offset 0: 1 byte */
7:                 /* 3 bytes padding: align next field to 4-byte boundary */
8:     int   i;    /* offset 4: 4 bytes */
9:     char  c2;   /* offset 8: 1 byte */
10:                /* 7 bytes padding: align next field to 8-byte boundary */
11:    double d;   /* offset 16: 8 bytes */
12: };              /* total: 24 bytes (not 14!) */
13: 
14: /* PACKED struct: no padding (use only when necessary) */
15: struct __attribute__((packed)) Packed {
16:    char   c;   /* offset 0: 1 byte */
17:    int    i;   /* offset 1: 4 bytes (unaligned!) */
18:    char   c2;  /* offset 5: 1 byte */
19:    double d;   /* offset 6: 8 bytes (unaligned!) */
20: };              /* total: 14 bytes */
21: 
22: /* REORDERED: put large fields first to minimize padding */
23: struct Optimal {
24:    double d;  /* offset 0:  8 bytes */
25:    int    i;  /* offset 8:  4 bytes */
26:    char   c;  /* offset 12: 1 byte */
27:    char   c2; /* offset 13: 1 byte */
28:               /* 2 bytes padding to reach 16 (align to 8) */
29: };             /* total: 16 bytes (saves 8 vs Padded) */
30: 
31: int main(void) {
32:    printf("Padded:  %zu bytes (offsetof d = %zu)\n",
33:           sizeof(struct Padded), offsetof(struct Padded, d));   /* 24, 16 */
34:    printf("Packed:  %zu bytes\n", sizeof(struct Packed));       /* 14 */
35:    printf("Optimal: %zu bytes\n", sizeof(struct Optimal));      /* 16 */
36:    return 0;
37: }
```

### Mechanical walkthrough
- `struct Padded` declares fields with intermixed sizes.
- `char c` takes 1 byte.
- `int i` requires a 4-byte alignment, so the compiler inserts 3 invisible padding bytes after `c`.
- `char c2` takes 1 byte at offset 8.
- `double d` requires an 8-byte alignment, so the compiler inserts 7 padding bytes after `c2`.
- `__attribute__((packed))` is a compiler-specific extension instructing GCC/Clang to completely ignore alignment rules and pack fields byte-to-byte.
- `struct Optimal` groups fields from largest to smallest, satisfying alignment naturally and shrinking the total size from 24 bytes down to 16.
- `sizeof(struct Padded)` yields 24 bytes because the overall struct size is rounded up to the strictest alignment requirement among its members (8 bytes for the double).

### CS lens
Data alignment and bus widths.
Also recognized in: cache line utilization, SIMD instruction constraints, ELF binary segment alignment, struct padding in graphics APIs (Vulkan/OpenGL).

### SE lens
Design principle: Memory optimization via struct packing. Reordering struct fields from largest to smallest is a standard C engineering practice to reduce memory footprint when allocating millions of items. The alternative not chosen is applying `__attribute__((packed))` globally, which saves memory but exacts a severe CPU performance penalty on architectures that must trap and synthesize unaligned reads using multiple instructions.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Padded:  24 bytes (offsetof d = 16)
Packed:  14 bytes
Optimal: 16 bytes
```
Because the compiler adheres to strict alignment boundaries unless specifically overridden.

### One sentence connecting to previous unit
Structs place fields side-by-side (with padding), but sometimes we want fields to occupy the exact same physical memory.

## Concept Unit: Unions — overlapping fields at the same address

### The Problem
If you have a scenario where a variable might hold an integer *or* a float, but never both at the same time, using a struct wastes space because it allocates memory for both. How can we tell the compiler that multiple fields should share the exact same starting address?

> **Pause and predict:** If a float and an integer share the same 4 bytes of memory, what happens if you write a `1.0f` as a float, and then read those same bytes as an integer? Will it read `1`?

### Introduce the concept in isolation
```c
#include <stdio.h>
union U { int i; char c; };
int main(void) {
    union U u;
    u.i = 0x12345678;
    printf("Byte: %x\n", u.c);
    return 0;
}
```
Predicted confidently: `Byte: 78` (on a little-endian machine). This proves that a **union** overlays its fields, allowing us to read the exact raw bytes that make up the integer using the `char` field.

### Discard the throwaway
This isolated lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/unions.c` (created)
- **Change type:** Add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

union IntFloat {
    uint32_t  as_int;   /* access same bytes as uint32 */
    float     as_float; /* access same bytes as float */
};
/* size = max(4, 4) = 4 bytes. Both fields start at offset 0. */

int main(void) {
    union IntFloat u;

    /* Write as float, read back as uint32: */
    u.as_float = 1.0f;
    printf("1.0f as bits: 0x%08x\n", u.as_int);  /* 0x3f800000 */

    /* Write as uint32, read back as float: */
    u.as_int = 0x40000000;
    printf("0x40000000 as float: %f\n", u.as_float);  /* 2.0 */

    /* Tagged union: type-safe variant */
    struct Value {
        int type;  /* 0=int, 1=float, 2=ptr */
        union {
            int   i;
            float f;
            void *p;
        } data;
    };

    struct Value v;
    v.type = 0; v.data.i = 42;
    if (v.type == 0) printf("int: %d\n", v.data.i);  /* 42 */
    v.type = 1; v.data.f = 3.14f;
    if (v.type == 1) printf("float: %f\n", v.data.f);  /* 3.14 */
    return 0;
}
```

### The Updated Project
```c
// ← new file: src/unions.c
1: #include <stdio.h>
2: #include <stdint.h>
3: #include <string.h>
4: 
5: union IntFloat {
6:     uint32_t  as_int;   /* access same bytes as uint32 */
7:     float     as_float; /* access same bytes as float */
8: };
9: /* size = max(4, 4) = 4 bytes. Both fields start at offset 0. */
10: 
11: int main(void) {
12:    union IntFloat u;
13: 
14:    /* Write as float, read back as uint32: */
15:    u.as_float = 1.0f;
16:    printf("1.0f as bits: 0x%08x\n", u.as_int);  /* 0x3f800000 */
17: 
18:    /* Write as uint32, read back as float: */
19:    u.as_int = 0x40000000;
20:    printf("0x40000000 as float: %f\n", u.as_float);  /* 2.0 */
21: 
22:    /* Tagged union: type-safe variant */
23:    struct Value {
24:        int type;  /* 0=int, 1=float, 2=ptr */
25:        union {
26:            int   i;
27:            float f;
28:            void *p;
29:        } data;
30:    };
31: 
32:    struct Value v;
33:    v.type = 0; v.data.i = 42;
34:    if (v.type == 0) printf("int: %d\n", v.data.i);  /* 42 */
35:    v.type = 1; v.data.f = 3.14f;
36:    if (v.type == 1) printf("float: %f\n", v.data.f);  /* 3.14 */
37:    return 0;
38: }
```

### Mechanical walkthrough
- `union IntFloat` defines a structure where all members start at offset zero and occupy the exact same bytes in memory.
- `uint32_t as_int` provides a 32-bit unsigned integer view of the memory.
- `float as_float` provides an IEEE-754 floating-point view of the exact same memory.
- `u.as_float = 1.0f` writes the bit pattern for 1.0 (`0x3F800000`) into the union's memory.
- `u.as_int` reads those exact same bits back, interpreting them as an integer, not converting the value.
- `struct Value` defines a "tagged union", wrapping a plain union with an integer tag.
- `int type` acts as the tag, telling us which field in the following union is currently valid.
- `union { ... } data` is an anonymous union embedded within the struct; it allocates only enough space for its largest member (`void*`).
- `v.data.i = 42` assigns the integer field within the union.

### CS lens
Type punning and memory aliasing.
Also recognized in: fast inverse square root algorithms (Quake III), variant types (Rust's Enum, C++'s std::variant), dynamic typing runtime implementations (JavaScript V8 values), custom memory allocators.

### SE lens
Design principle: Controlled aliasing. Unions save space and allow bit-level reinterpretation. The alternative not chosen is safe language features like `std::variant` or sum types, which track the active type for you automatically. Raw C unions are memory-efficient but unsafe because they allow you to accidentally read a float as a pointer. Tagged unions mitigate this by making you track the type explicitly.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
1.0f as bits: 0x3f800000
0x40000000 as float: 2.000000
int: 42
float: 3.140000
```
Because the IEEE-754 standard defines the exact bit representations for floating-point numbers, and the union simply reads those identical bits as an integer.

### One sentence connecting to previous unit
All these high-level C concepts—arrays, structs, padding, and unions—are ultimately resolved into simple memory address calculations by the compiler before becoming assembly.

## Concept Unit: Struct layout in assembly — how the compiler accesses fields

### The Problem
When the CPU executes your code, it has no concept of "structs" or "fields." How does the compiler translate a nested struct field access like `head->next` into actual machine instructions? 

> **Pause and predict:** Given a pointer to a struct in a register, and knowing the `next` field is at offset 8, what assembly instruction would you write to load the `next` pointer into a register?

### Introduce the concept in isolation
```asm
# Throwaway assembly showing base+offset addressing
movq %rdi, %rax       # Copy base pointer to rax
movq 8(%rax), %rbx    # Dereference (rax + 8) into rbx
```
Predicted confidently: The second instruction accesses the 8 bytes starting exactly 8 bytes past the base pointer. This proves that **field access** in assembly is just pointer arithmetic with a constant offset baked directly into the instruction.

### Discard the throwaway
This isolated lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — we are examining compiler output directly.
- **Files affected:** `src/list.c` (created)
- **Change type:** Add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
struct Node {
    long   value;   /* offset 0 */
    struct Node *next;  /* offset 8 */
};

long sum_list(struct Node *head) {
    long sum = 0;
    while (head) {
        sum += head->value;  /* access field at offset 0 */
        head = head->next;   /* access field at offset 8 */
    }
    return sum;
}
```

```asm
# sum_list assembly (gcc -O2):
sum_list:
    testq  %rdi, %rdi       # if head == NULL:
    je     .done            # return 0
    xorl   %eax, %eax       # sum = 0
.loop:
    addq   (%rdi), %rax     # sum += head->value  (offset 0)
    movq   8(%rdi), %rdi    # head = head->next   (offset 8)
    testq  %rdi, %rdi       # if head != NULL:
    jne    .loop            # continue loop
.done:
    ret                     # return sum in rax
```

### The Updated Project
```c
// ← new file: src/list.c
1: struct Node {
2:     long   value;   /* offset 0 */
3:     struct Node *next;  /* offset 8 */
4: };
5: 
6: long sum_list(struct Node *head) {
7:     long sum = 0;
8:     while (head) {
9:         sum += head->value;  /* access field at offset 0 */
10:        head = head->next;   /* access field at offset 8 */
11:    }
12:    return sum;
13: }
```

### Mechanical walkthrough
- `struct Node` defines a structure with an 8-byte long and an 8-byte pointer, totaling 16 bytes.
- `head->value` compiles to accessing the memory exactly at the base address of the pointer (`offset 0`).
- `head->next` compiles to accessing the memory 8 bytes past the base address of the pointer (`offset 8`).
- `testq %rdi, %rdi` in assembly performs a bitwise AND on the register holding `head` to check if it's zero (NULL).
- `je .done` jumps to the end of the function if the previous test proved the pointer was zero.
- `xorl %eax, %eax` is an optimized assembly idiom to zero out the `rax` register, initializing `sum = 0`.
- `addq (%rdi), %rax` dereferences the pointer in `rdi` directly (offset 0), loads the 8-byte value, and adds it to the running sum in `rax`.
- `movq 8(%rdi), %rdi` dereferences the address at `rdi + 8`, reads the 8-byte next pointer, and stores it directly back into `rdi`, advancing the list head.

### CS lens
Effective address calculation.
Also recognized in: bytecode interpreters, virtual method dispatch tables (vtable offsets), garbage collection object tracing, position-independent code (PIC) GOT lookups.

### SE lens
Design principle: Compile-time offset resolution. The compiler completely erases the concept of "fields" and replaces them with hardcoded integer offsets. The alternative not chosen is runtime field lookups (like in Python or JavaScript), which are much more flexible but cost a hash map lookup on every single field access instead of executing a single hardware instruction.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The assembly correctly calculates the sum of the linked list because it correctly calculates the `next` pointer and the `value` field using standard memory displacement addressing modes.

### One sentence connecting to previous unit
Understanding how the compiler turns named fields into rigid byte offsets explains exactly why memory alignment and struct packing are so critical.

## Closing
### Connect the pieces
Data layout determines performance and correctness for binary protocols. We started by proving arrays are contiguous blocks accessed via pointer arithmetic: `arr[3]` translates to loading bytes at `arr + 12`. We then showed structs group distinct types, like `r.width`, translating to loading bytes at `base + 8`. We saw padding shift these offsets, expanding our struct to 24 bytes to satisfy hardware alignment, and how unions overlay different types entirely on the exact same offset. Finally, we watched the compiler reduce all of this high-level C logic into absolute assembly instructions: `movq 8(%rdi), %rdi`, replacing names entirely with math. Lesson 10 covers pointer arithmetic in depth.
