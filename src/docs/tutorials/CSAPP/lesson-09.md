# Lesson 09: Arrays and Structs in Memory

**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 1 — From C to Machine
**Language:** C and x86-64 assembly (AT&T syntax). Trace by hand.
**What you need to know first:** Lessons 00–08 (tour, C, bits, integers, floats, pipeline, registers, control flow, procedures).
**What you will build:** The reader will understand how arrays, multi-dimensional arrays, structs, and unions are laid out in memory, including alignment padding, and how the compiler accesses them in assembly. The transferable insight: C gives you direct control over memory layout — knowing the layout lets you optimize for cache, understand why struct fields have unexpected offsets, and interpret raw memory dumps.

## Objects and Methods

- **Array**
  - **What it is:** A contiguous block of memory containing elements of the same type.
  - **Implementation:** The compiler allocates `N * sizeof(type)` bytes contiguously.
  - **Its use:** Used to store multiple items of uniform type for indexed access.
  - **Type:** Compound data type.
  - **Responsibility:** Holds an ordered collection of values safely in memory.
  - **Depends on:** Element size for calculating pointer offsets.
  - **Connects to:** Pointers (decays to a pointer to its first element).
  - **Shape:** Contiguous bytes, structured sequentially.

- **Struct**
  - **What it is:** A composite data type grouping multiple variables of different types.
  - **Implementation:** The compiler aligns each field in memory, possibly adding padding bytes.
  - **Its use:** Used to group related data into a single coherent block.
  - **Type:** User-defined compound type.
  - **Responsibility:** Represents a record or object with named fields.
  - **Depends on:** The sizes and alignments of its component fields.
  - **Connects to:** Unions (can be nested together), bit fields.
  - **Shape:** A sequence of variables in memory, interrupted by padding gaps.

- **Union**
  - **What it is:** A type where multiple fields share the exact same starting memory address.
  - **Implementation:** The compiler reserves enough space for the largest member.
  - **Its use:** Used for type-punning or saving memory when only one field is active at a time.
  - **Type:** User-defined overlapping type.
  - **Responsibility:** Interprets the exact same memory bits in different ways.
  - **Depends on:** The size of its largest field.
  - **Connects to:** Structs (frequently used together for tagged unions).
  - **Shape:** A single overlapping memory block.

- **Bit Field**
  - **What it is:** A struct member assigned a specific number of bits.
  - **Implementation:** The compiler packs adjacent bit fields into single machine words.
  - **Its use:** Used for compact flags or matching exact hardware/protocol layouts.
  - **Type:** Integer type sub-field.
  - **Responsibility:** Conserves space by not wasting entire bytes on booleans or small ranges.
  - **Depends on:** Endianness and compiler layout rules (MSB vs LSB packing).
  - **Connects to:** Bitwise operations (the compiler auto-generates masks/shifts under the hood).
  - **Shape:** Partial bits packed inside an integer word.


## Concept 1: Array layout — contiguous, stride, and pointer arithmetic

### Throwaway Lab: Basic Array Addresses

Before writing project code, let's look at how elements are spaced in memory.
```c
#include <stdio.h>

int main(void)
{
    long arr[5] = {10, 20, 30, 40, 50};

    /* arr decays to a pointer to its first element */
    printf("%p\n",  (void*)arr);          /* address of arr[0] */
    printf("%p\n",  (void*)&arr[1]);      /* arr[0] address + 8 */
    printf("%p\n",  (void*)&arr[4]);      /* arr[0] address + 32 */

    printf("%ld\n", arr[2]);              /* 30 */
    printf("%ld\n", *(arr + 2));          /* 30 (pointer arithmetic: arr+2 = arr+2*8) */
    printf("%ld\n", 2[arr]);              /* 30 (legal in C! arr[2] == *(arr+2) == *(2+arr) == 2[arr]) */
    return 0;
}
```
**Output:**
```
0x7fffcb3b10
0x7fffcb3b18
0x7fffcb3b30
30
30
30
```

### Tracing Array Layout

Here is the exact memory layout of `arr`, assuming it starts at `base`:

```
Address:  base+0   base+8   base+16  base+24  base+32
Value:      10       20       30       40       50
Index:     [0]      [1]      [2]      [3]      [4]
```

`arr[i]` is EXACTLY `*(arr + i)`. Under the hood, this translates to `Mem[arr + i * sizeof(long)]`. The compiler translates `arr[i]` into the indexed memory addressing form `(%rdi,%rsi,8)` in assembly, where `%rdi` holds `arr`, `%rsi` holds `i`, and `8` is the scaling factor (stride). Because of this equivalence, `2[arr]` works, translating to `*(2 + arr)`.


## Concept 2: Array access in assembly

### Throwaway Lab: Getting an Element

Consider a function to retrieve an array element.
```c
long get_element(long arr[], long index)
{
    return arr[index];
}
```

### Tracing Element Access Assembly

The compiler emits the following x86-64 assembly:
```asm
get_element:
    movq  (%rdi,%rsi,8), %rax    # rax = Mem[arr + index*8]
    ret
```

**Full Trace:**
If `arr` is at `0x1000` (`%rdi`), and `index` is `3` (`%rsi`).
Effective address calculated: `0x1000 + 3 * 8 = 0x1018`.
`movq` loads the 8-byte value at `Mem[0x1018]`, which is `arr[3]`, into `%rax` and returns it.

### Throwaway Lab: Summing an Array

```c
long sum_array(long arr[], long len)
{
    long sum = 0;
    for (long i = 0; i < len; i++)
        sum += arr[i];
    return sum;
}
```

### Tracing the Loop Assembly

```asm
sum_array:
    movq  $0, %rax          # sum = 0
    movq  $0, %rcx          # i = 0
    jmp   .L_test
.L_loop:
    movq  (%rdi,%rcx,8), %rdx  # rdx = arr[i]
    addq  %rdx, %rax           # sum += arr[i]
    incq  %rcx                 # i++
.L_test:
    cmpq  %rsi, %rcx           # i < len?
    jl    .L_loop
    ret
```

**Full Trace for arr=[10, 20, 30], len=3:**
- Initial: `%rax=0`, `%rcx=0`. Jump to `.L_test`.
- `.L_test`: `0 < 3`. True, jump to `.L_loop`.
- Iter 1: Load `Mem[rdi + 0] = 10` into `%rdx`. Add `10` to `%rax`. Increment `%rcx` to 1.
- `.L_test`: `1 < 3`. True.
- Iter 2: Load `Mem[rdi + 8] = 20` into `%rdx`. Add `20` to `%rax=30`. Increment `%rcx` to 2.
- `.L_test`: `2 < 3`. True.
- Iter 3: Load `Mem[rdi + 16] = 30` into `%rdx`. Add `30` to `%rax=60`. Increment `%rcx` to 3.
- `.L_test`: `3 < 3`. False. Fall through to `ret`. Final `%rax=60`.


## Concept 3: Multi-dimensional arrays — row-major order

### Throwaway Lab: Traversing a Matrix

```c
#include <stdio.h>

#define ROWS 3
#define COLS 4

int main(void)
{
    int matrix[ROWS][COLS] = {
        {1,  2,  3,  4},
        {5,  6,  7,  8},
        {9, 10, 11, 12}
    };

    /* Row-major: all elements of row 0, then row 1, then row 2 */
    /* matrix[r][c] is at offset (r * COLS + c) * sizeof(int) from base */
    /* matrix[1][2] = 7, at offset (1*4 + 2)*4 = 24 bytes from base */

    printf("%d\n", matrix[1][2]);          /* 7 */
    printf("%p\n", (void*)&matrix[0][0]);  /* base address */
    printf("%p\n", (void*)&matrix[1][2]);  /* base + 24 */

    /* Pointer arithmetic across rows: */
    int *p = &matrix[0][0];
    printf("%d\n", p[6]);  /* p[6] = matrix[1][2] = 7 (offset 6*4=24) */
    return 0;
}
```

### Tracing Row-Major Memory

C stores 2D arrays in row-major order, meaning adjacent elements in the same row are adjacent in memory.

```
Offset:   0    4    8   12   16   20   24   28   32   36   40   44
Value:    1    2    3    4    5    6    7    8    9   10   11   12
Index:  [0][0][0][1][0][2][0][3][1][0][1][1][1][2][1][3][2][0][2][1][2][2][2][3]
```

Because of this layout, iterating in column-major order (outer loop over columns, inner over rows) causes the program to jump around in memory by `COLS * sizeof(type)` bytes at a time, skipping cache lines and making memory access severely cache-unfriendly.


## Concept 4: Structs — layout, alignment, and padding

### Throwaway Lab: Exploring Struct Padding

```c
#include <stdio.h>

struct S1 {
    char  a;   /* 1 byte at offset 0 */
    /* 3 bytes of padding (to align int to 4-byte boundary) */
    int   b;   /* 4 bytes at offset 4 */
    char  c;   /* 1 byte at offset 8 */
    /* 7 bytes of padding (to align double to 8-byte boundary) */
    double d;  /* 8 bytes at offset 16 */
};             /* total size: 24 bytes */

struct S2 {
    double d;  /* 8 bytes at offset 0 */
    int    b;  /* 4 bytes at offset 8 */
    char   a;  /* 1 byte at offset 12 */
    char   c;  /* 1 byte at offset 13 */
    /* 2 bytes of padding (struct size must be multiple of largest alignment = 8) */
};             /* total size: 16 bytes -- SAME FIELDS, different order, 8 bytes smaller! */

int main(void)
{
    printf("sizeof(S1) = %zu\n", sizeof(struct S1));  /* 24 */
    printf("sizeof(S2) = %zu\n", sizeof(struct S2));  /* 16 */

    struct S1 s1;
    printf("offset a: %zu\n", (char*)&s1.a - (char*)&s1);  /* 0 */
    printf("offset b: %zu\n", (char*)&s1.b - (char*)&s1);  /* 4 */
    printf("offset c: %zu\n", (char*)&s1.c - (char*)&s1);  /* 8 */
    printf("offset d: %zu\n", (char*)&s1.d - (char*)&s1);  /* 16 */
    return 0;
}
```

### Tracing Alignment

A data type of size `N` generally must be placed at an address that is a multiple of `N`.

Layout of S1 (24 bytes):
```
[ a ] [pad] [pad] [pad]   (offset 0 to 3)
[       b       ]         (offset 4 to 7)
[ c ] [pad] [pad] [pad]   (offset 8 to 11)
[pad] [pad] [pad] [pad]   (offset 12 to 15)
[       d       ]         (offset 16 to 23)
```

Layout of S2 (16 bytes):
```
[       d       ]         (offset 0 to 7)
[       b       ]         (offset 8 to 11)
[ a ] [ c ] [pad] [pad]   (offset 12 to 15)
```
Padding is inserted so fields satisfy alignment. Finally, the total size of the struct is padded at the end to be a multiple of its largest member's alignment requirement (8 for double).


## Concept 5: Struct access in assembly

### Throwaway Lab: Accessing a Struct Field

```c
struct Point { long x; long y; };

long get_y(struct Point *p) { return p->y; }
```

### Tracing Struct Field Assembly

```asm
get_y:
    movq  8(%rdi), %rax     # rax = Mem[p + 8] = p->y
    ret
```

Because `long x` takes 8 bytes at offset 0, `y` begins at offset 8. The compiler hardcodes this offset directly in the `movq` instruction as `8(%rdi)`.

### Throwaway Lab: Array of Structs

```c
long sum_ys(struct Point *arr, long n)
{
    long sum = 0;
    for (long i = 0; i < n; i++)
        sum += arr[i].y;
    return sum;
}
```

### Tracing Assembly for Array of Structs

```asm
sum_ys:
    movq  $0, %rax           # sum = 0
    movq  $0, %rcx           # i = 0
    jmp   .L_test
.L_loop:
    movq  8(%rdi,%rcx,16), %rdx   # rdx = arr[i].y (offset 8, stride 16)
    addq  %rdx, %rax
    incq  %rcx
.L_test:
    cmpq  %rsi, %rcx
    jl    .L_loop
    ret
```

**Full trace:**
Each `struct Point` is 16 bytes.
To get `arr[i].y`, the base is `%rdi` (`arr`). The element stride is `16 * i` (`%rcx,16`). The constant offset inside the struct is `8`. Thus, `8(%rdi,%rcx,16)` calculates exactly `arr + 16 * i + 8`, loading the `y` coordinate for the current iteration.


## Concept 6: Unions — all members share the same bytes

### Throwaway Lab: The Union Type

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

union U {
    double  d;
    uint64_t i;
    struct {
        uint32_t lo;
        uint32_t hi;
    } halves;
};

int main(void)
{
    union U u;
    u.d = 1.0;  /* IEEE 754 double 1.0 = 0x3FF0000000000000 */
    printf("As uint64: 0x%016llX\n", (unsigned long long)u.i);
    /* 0x3FF0000000000000 */
    printf("Low 32:    0x%08X\n", u.halves.lo);  /* 0x00000000 */
    printf("High 32:   0x%08X\n", u.halves.hi);  /* 0x3FF00000 */

    /* Size of union = size of its largest member */
    printf("sizeof(U) = %zu\n", sizeof(union U));  /* 8 */
    return 0;
}
```

### Tracing Union Layout

All members of a union overlap in memory at offset 0.

Memory Layout for `u`:
```
Offset 0         Offset 4         Offset 8
[    lo    ]     [    hi    ]
[               i               ]
[               d               ]
```

Unions allow type-punning: writing data as one type (`double d = 1.0`) and reading it natively as another (`uint64_t i`). This is legal in C through unions, avoiding the undefined behavior of casting pointers that violate strict aliasing rules.


## Concept 7: Bit fields — packing flags into a struct

### Throwaway Lab: Packing Bits

```c
#include <stdio.h>

struct Flags {
    unsigned int ready:1;    /* 1 bit */
    unsigned int error:1;    /* 1 bit */
    unsigned int count:6;    /* 6 bits */
    unsigned int value:24;   /* 24 bits */
};  /* all 32 bits total -- fits in one int */

int main(void)
{
    struct Flags f;
    f.ready = 1;
    f.error = 0;
    f.count = 42;
    f.value = 1000000;

    printf("ready=%u error=%u count=%u value=%u\n",
           f.ready, f.error, f.count, f.value);
    /* ready=1 error=0 count=42 value=1000000 */
    printf("sizeof(Flags) = %zu\n", sizeof(struct Flags));  /* 4 */
    return 0;
}
```

### Tracing Bit Field Memory

Bit fields let you divide a single integer into smaller logical variables.

```
Total 32 bits (4 bytes):
[ value: 24 bits ] [ count: 6 bits ] [ error: 1 bit ] [ ready: 1 bit ]
```
*(Exact packing order—LSB first vs MSB first—is implementation-defined).*

This reduces memory significantly. It's heavily used in OS kernels, device drivers, and network protocol headers (like TCP and IP headers) where exact layout and minimal size matter.


## Self-Check and Closing

You now see memory layout from the machine's perspective. Lesson 10 covers pointers in depth — pointer arithmetic, pointer to pointer, function pointers, and the common bugs.

**Exercises:**
1. Compute the offset of each field in `struct { char a; double b; int c; char d; };` including padding. (Trace it manually!).
2. Write C code that uses pointer arithmetic to iterate an array of structs without subscript notation.
3. Predict the assembly for `matrix[i][j]` where `i` is in `%rdi`, `j` is in `%rsi`, and the matrix elements are `long`s with 4 columns.
