# Lesson 01: C Fundamentals — Variables, Types, and Compilation

**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 0 — The Machine

## What You Need to Know First
Lesson 00 (the tour, layers, process model, compilation pipeline).

## What You Will Build
The reader will be able to read and write basic C programs: declare variables of the correct types, use printf with format strings, write functions, and understand the compilation model. 
**The transferable insight:** C is not Python — there are no objects, no garbage collector, no runtime type checking, no bounds checking. Every byte in memory is yours to manage, and every mistake is yours to debug. This is power and responsibility simultaneously.

## Concept Units

### 1. The minimal C program and its structure

Before writing any real project code, we will write a throwaway lab to understand the basic structure of a C program.

**Throwaway Lab:**
```c
#include <stdio.h>    /* bring in printf declaration */

int main(void)        /* program entry point */
{
    printf("hello, world\n");  /* write to stdout */
    return 0;                  /* 0 = success to the OS */
}
```

**Mechanical Trace:**
- `main` is called by the C runtime (`crt0`).
- `printf` writes the string `"hello, world\n"` to file descriptor 1 (`stdout`).
- `return 0` sets the process exit status. 
- The OS sees exit status 0 and considers the program successful.

**Output:**
```text
hello, world
```

**Every C program:**
- `#include <stdio.h>`: tells the preprocessor to paste in the declarations from stdio.h. Without this, the compiler does not know what `printf` is.
- `int main(void)`: the entry point. Returns `int` (the exit status). `void` means no parameters here (alternatively `int main(int argc, char *argv[])`).
- Braces `{}` delimit blocks. Every statement ends with `;`. Comments: `/* multi-line */` and `// single-line`.

**Objects and Methods:**
*   **main**
    *   **What it is:** The entry point of a C program.
    *   **Implementation:** A function returning an integer.
    *   **Its use:** Called by the C runtime to begin execution.
    *   **Type:** Function.
    *   **Responsibility:** To orchestrate the primary logic of the program and return an exit status.
    *   **Depends on:** The C runtime environment.
    *   **Connects to:** Operating system exit codes.
    *   **Shape:** `int main(void) { ... }` or `int main(int argc, char *argv[]) { ... }`

*   **printf**
    *   **What it is:** A standard library function for formatted output.
    *   **Implementation:** Provided by the C standard library (`libc`).
    *   **Its use:** Writing text and variables to standard output.
    *   **Type:** Function.
    *   **Responsibility:** Formatting data and sending it to `stdout`.
    *   **Depends on:** `#include <stdio.h>` for declaration.
    *   **Connects to:** Standard output file descriptor (fd 1).
    *   **Shape:** `int printf(const char *format, ...);`

### 2. Basic types — width, range, and when to use each

Before writing any real project code, we will write a throwaway lab to understand C's basic types.

**Throwaway Lab:**
```c
#include <stdio.h>
#include <limits.h>   /* INT_MAX, INT_MIN, LONG_MAX ... */
#include <float.h>    /* FLT_MAX, DBL_MAX ... */

int main(void)
{
    /* Integer types */
    char   c = 65;          /* 1 byte: -128 to 127. ASCII: 65 = 'A' */
    short  s = 1000;        /* 2 bytes: -32768 to 32767 */
    int    i = 2147483647;  /* 4 bytes: INT_MAX */
    long   l = 9223372036854775807L; /* 8 bytes on x86-64: LONG_MAX */

    /* Unsigned variants */
    unsigned int ui = 4294967295U;  /* 4 bytes: UINT_MAX = 2^32 - 1 */

    /* Floating point */
    float  f = 3.14f;   /* 4 bytes: ~7 significant decimal digits */
    double d = 3.14159265358979;  /* 8 bytes: ~15 significant digits */

    printf("%c\n", c);   /* A     (char as character) */
    printf("%d\n", i);   /* 2147483647 */
    printf("%ld\n", l);  /* 9223372036854775807 */
    printf("%u\n", ui);  /* 4294967295 */
    printf("%f\n", f);   /* 3.140000 */
    printf("%.15f\n", d);/* 3.141592653589790 */
    return 0;
}
```

**Mechanical Trace:**
- `printf("%c\n", c);`: Interprets `65` as an ASCII character and prints `A`.
- `printf("%d\n", i);`: Prints the signed integer `2147483647`.
- `printf("%ld\n", l);`: Prints the long integer `9223372036854775807`.
- `printf("%u\n", ui);`: Prints the unsigned integer `4294967295`.
- `printf("%f\n", f);`: Prints the float `3.14f` with default 6 decimal places, yielding `3.140000`.
- `printf("%.15f\n", d);`: Prints the double `3.14159265358979` with 15 decimal places precision, yielding `3.141592653589790`.

**Output:**
```text
A
2147483647
9223372036854775807
4294967295
3.140000
3.141592653589790
```

**Explanation of Format Specifiers:**
- `%c`: character
- `%d`: signed decimal integer
- `%ld`: signed long decimal integer
- `%u`: unsigned decimal integer
- `%f`: floating-point number
- `%e`: scientific notation
- `%x`: hexadecimal representation
- `%p`: pointer address
- `%s`: string
- `%zu`: `size_t` (unsigned size)

**Explanation of Literal Suffixes:**
- `L`: Denotes a `long` literal.
- `U`: Denotes an `unsigned` literal.

**Objects and Methods:**
*   **Format Specifier**
    *   **What it is:** A placeholder in a format string used by functions like `printf`.
    *   **Implementation:** Parsed at runtime by the `printf` implementation to determine how to format arguments.
    *   **Its use:** Tells `printf` what type of data to expect and how to represent it.
    *   **Type:** String token.
    *   **Responsibility:** Defining the textual representation of binary data.
    *   **Depends on:** The type of the corresponding argument passed to the variadic function.
    *   **Connects to:** Arguments passed after the format string.
    *   **Shape:** `%[flags][width][.precision][length]specifier`

### 3. The sizeof operator

Before writing any real project code, we will write a throwaway lab to understand the `sizeof` operator.

**Throwaway Lab:**
```c
#include <stdio.h>

int main(void)
{
    printf("sizeof(char)   = %zu\n", sizeof(char));    /* 1 */
    printf("sizeof(short)  = %zu\n", sizeof(short));   /* 2 */
    printf("sizeof(int)    = %zu\n", sizeof(int));     /* 4 */
    printf("sizeof(long)   = %zu\n", sizeof(long));    /* 8 on x86-64 */
    printf("sizeof(float)  = %zu\n", sizeof(float));   /* 4 */
    printf("sizeof(double) = %zu\n", sizeof(double));  /* 8 */
    printf("sizeof(void*)  = %zu\n", sizeof(void*));   /* 8 on x86-64 */
    return 0;
}
```

**Mechanical Trace:**
- `sizeof(char)` evaluates to 1. Printed via `%zu` as `sizeof(char)   = 1`.
- `sizeof(short)` evaluates to 2. Printed via `%zu` as `sizeof(short)  = 2`.
- `sizeof(int)` evaluates to 4. Printed via `%zu` as `sizeof(int)    = 4`.
- `sizeof(long)` evaluates to 8 (on x86-64). Printed via `%zu` as `sizeof(long)   = 8`.
- `sizeof(float)` evaluates to 4. Printed via `%zu` as `sizeof(float)  = 4`.
- `sizeof(double)` evaluates to 8. Printed via `%zu` as `sizeof(double) = 8`.
- `sizeof(void*)` evaluates to 8 (on x86-64). Printed via `%zu` as `sizeof(void*)  = 8`.

**Output:**
```text
sizeof(char)   = 1
sizeof(short)  = 2
sizeof(int)    = 4
sizeof(long)   = 8
sizeof(float)  = 4
sizeof(double) = 8
sizeof(void*)  = 8
```

**Explanation:**
- `%zu` is the format specifier for `size_t`, which is the unsigned integer type returned by `sizeof`.
- The sizes shown are typical for x86-64 Linux/macOS. On 32-bit systems, `long` and `void*` are typically 4 bytes.
- The C standard guarantees minimums, not exact sizes. This is why standard headers like `<stdint.h>` provide types like `int32_t` and `uint64_t` for exact widths when precision is required.

**Objects and Methods:**
*   **sizeof**
    *   **What it is:** A compile-time operator that yields the size in bytes of a type or an expression's type.
    *   **Implementation:** Evaluated by the compiler during compilation; not a runtime function call.
    *   **Its use:** Determining the amount of memory needed for types or variables, especially when allocating memory dynamically.
    *   **Type:** Operator.
    *   **Responsibility:** Returning the exact byte size of its operand.
    *   **Depends on:** The target architecture and compiler ABI.
    *   **Connects to:** `size_t` return type.
    *   **Shape:** `sizeof(type)` or `sizeof expression`

### 4. Variables, assignment, and expressions

Before writing any real project code, we will write a throwaway lab to explore operators and assignment.

**Throwaway Lab:**
```c
#include <stdio.h>

int main(void)
{
    int x = 10;
    int y = 3;
    int z;

    z = x + y;   printf("%d\n", z);   /* 13 */
    z = x - y;   printf("%d\n", z);   /* 7 */
    z = x * y;   printf("%d\n", z);   /* 30 */
    z = x / y;   printf("%d\n", z);   /* 3 (integer division: truncates) */
    z = x % y;   printf("%d\n", z);   /* 1 (remainder) */

    /* Compound assignment */
    x += 5;      printf("%d\n", x);   /* 15 */
    x -= 2;      printf("%d\n", x);   /* 13 */
    x *= 2;      printf("%d\n", x);   /* 26 */
    x /= 4;      printf("%d\n", x);   /* 6 */

    /* Increment and decrement */
    x++;         printf("%d\n", x);   /* 7 */
    ++x;         printf("%d\n", x);   /* 8 */
    x--;         printf("%d\n", x);   /* 7 */

    return 0;
}
```

**Mechanical Trace:**
- `z = x + y;`: 10 + 3 = 13. Printed as `13`.
- `z = x - y;`: 10 - 3 = 7. Printed as `7`.
- `z = x * y;`: 10 * 3 = 30. Printed as `30`.
- `z = x / y;`: 10 / 3 = 3. Integer division truncates towards zero. Printed as `3`. Emphasize integer division truncation: 10/3 = 3, not 3.33.
- `z = x % y;`: 10 % 3 = 1. Printed as `1`.
- `x += 5;`: x becomes 10 + 5 = 15. Printed as `15`.
- `x -= 2;`: x becomes 15 - 2 = 13. Printed as `13`.
- `x *= 2;`: x becomes 13 * 2 = 26. Printed as `26`.
- `x /= 4;`: x becomes 26 / 4 = 6. Printed as `6`.
- `x++;`: x evaluates as 6, then increments to 7. Printed as `7`.
- `++x;`: x increments to 8, evaluates as 8. Printed as `8`.
- `x--;`: x evaluates as 8, then decrements to 7. Printed as `7`.

**Output:**
```text
13
7
30
3
1
15
13
26
6
7
8
7
```

**Objects and Methods:**
*   **Integer Division (`/`)**
    *   **What it is:** An arithmetic operator that divides two integer operands.
    *   **Implementation:** Maps to hardware division instructions (e.g., `idiv` on x86).
    *   **Its use:** Calculating quotients.
    *   **Type:** Binary operator.
    *   **Responsibility:** Dividing operands and truncating any fractional remainder towards zero.
    *   **Depends on:** Integer operands.
    *   **Connects to:** The modulo operator (`%`) which yields the remainder.
    *   **Shape:** `operand1 / operand2`

### 5. Functions — definition, prototype, and call

Before writing any real project code, we will write a throwaway lab to learn how to structure and call functions.

**Throwaway Lab:**
```c
#include <stdio.h>

/* Function prototype: tells the compiler the signature before definition */
int square(int n);
int add(int a, int b);

int main(void)
{
    int result;
    result = square(5);    printf("%d\n", result);     /* 25 */
    result = add(3, 7);    printf("%d\n", result);     /* 10 */
    result = add(square(3), square(4)); printf("%d\n", result); /* 25 */
    return 0;
}

/* Function definition */
int square(int n)
{
    return n * n;
}

int add(int a, int b)
{
    return a + b;
}
```

**Mechanical Trace:**
- `result = square(5);`: Evaluates `square(5)` -> `5 * 5 = 25`. Assigns 25 to `result`. Printed as `25`.
- `result = add(3, 7);`: Evaluates `add(3, 7)` -> `3 + 7 = 10`. Assigns 10 to `result`. Printed as `10`.
- Call trace for `add(square(3), square(4))`:
    - Evaluate `square(3)` -> `3 * 3 = 9`.
    - Evaluate `square(4)` -> `4 * 4 = 16`.
    - Call `add(9, 16)` -> `9 + 16 = 25`.
    - Assigns 25 to `result`. Printed as `25`.

**Output:**
```text
25
10
25
```

**Explanation:**
- **Function arguments are evaluated before the call.** When calling `add(square(3), square(4))`, both `square` calls complete and yield their results before `add` begins executing.
- **Pass by value:** Parameters are COPIES of the arguments. Changing `n` inside `square` does NOT change the variable in the caller. If `main` passed a variable `int x = 5;` and `square` modified `n`, `x` would remain 5.

**Objects and Methods:**
*   **Function Prototype**
    *   **What it is:** A forward declaration of a function's signature.
    *   **Implementation:** A function signature ending with a semicolon instead of a block.
    *   **Its use:** Informs the compiler about the function's name, return type, and parameters before its actual definition is reached.
    *   **Type:** Declaration.
    *   **Responsibility:** Enabling the compiler to verify calls to the function before analyzing the definition.
    *   **Depends on:** The types used in the signature.
    *   **Connects to:** The function definition provided later or in another file.
    *   **Shape:** `return_type function_name(parameter_types);`

### 6. Conditionals and loops

Before writing any real project code, we will write a throwaway lab to understand control flow in C.

**Throwaway Lab:**
```c
#include <stdio.h>

int main(void)
{
    /* if / else if / else */
    int x = 7;
    if (x > 10) {
        printf("big\n");
    } else if (x > 5) {
        printf("medium\n");  /* prints: medium */
    } else {
        printf("small\n");
    }

    /* while loop */
    int i = 0;
    while (i < 3) {
        printf("while: %d\n", i);  /* 0, 1, 2 */
        i++;
    }

    /* for loop */
    for (int j = 0; j < 3; j++) {
        printf("for: %d\n", j);    /* 0, 1, 2 */
    }

    /* do-while (body executes at least once) */
    int k = 0;
    do {
        printf("do: %d\n", k);     /* 0 */
        k++;
    } while (k < 0);  /* condition false, exits after first iteration */

    return 0;
}
```

**Mechanical Trace:**
- `x` is 7. `if (7 > 10)` is false. `else if (7 > 5)` is true. Prints `medium\n`.
- `while loop`: `i = 0`. Condition `0 < 3` true. Prints `while: 0`. `i` becomes 1. Condition `1 < 3` true. Prints `while: 1`. `i` becomes 2. Condition `2 < 3` true. Prints `while: 2`. `i` becomes 3. Condition `3 < 3` false. Loop exits.
- `for loop`: `j = 0`. Condition `0 < 3` true. Prints `for: 0`. `j++` makes `j = 1`. Condition `1 < 3` true. Prints `for: 1`. `j++` makes `j = 2`. Condition `2 < 3` true. Prints `for: 2`. `j++` makes `j = 3`. Condition `3 < 3` false. Loop exits.
- `do-while loop`: `k = 0`. Executes block unconditionally. Prints `do: 0`. `k++` makes `k = 1`. Evaluates condition `1 < 0`, which is false. Loop exits.

**Output:**
```text
medium
while: 0
while: 1
while: 2
for: 0
for: 1
for: 2
do: 0
```

**Explanation:**
C's boolean rules dictate that `0` is considered false, and any non-zero value is considered true. There is no built-in `bool` type in the C89 standard (though C99 added `<stdbool.h>`).

**Objects and Methods:**
*   **do-while Loop**
    *   **What it is:** A control flow statement for iterating.
    *   **Implementation:** Executes a block of code, then checks a condition.
    *   **Its use:** Ensuring a block of code runs at least one time before evaluating the exit condition.
    *   **Type:** Loop construct.
    *   **Responsibility:** Repeating execution while a post-condition holds true.
    *   **Depends on:** A boolean expression.
    *   **Connects to:** The block of code inside the loop.
    *   **Shape:** `do { ... } while (condition);`

### 7. Undefined behavior — C's most dangerous feature

Before writing any real project code, we will write a throwaway lab to understand the severe implications of undefined behavior.

**Throwaway Lab:**
```c
#include <stdio.h>

int main(void)
{
    /* Uninitialized variable: value is GARBAGE (undefined behavior) */
    int x;           /* x could be 0, 42, -1234, anything */
    /* printf("%d\n", x); */  /* DO NOT DO THIS -- UB */

    /* Signed integer overflow: undefined behavior */
    int max = 2147483647;  /* INT_MAX */
    /* int overflow = max + 1; */  /* UB: compiler may do ANYTHING */

    /* Array out of bounds: undefined behavior */
    int arr[3] = {10, 20, 30};
    /* int bad = arr[5]; */  /* UB: reads memory past the array */

    /* The only safe code: */
    int y = 0;       /* always initialize */
    printf("%d\n", y);  /* 0 -- defined */
    return 0;
}
```

**Mechanical Trace:**
- Only the defined behavior runs. `int y = 0;` initializes `y` correctly.
- `printf("%d\n", y);` prints `0`.

**Output:**
```text
0
```

**Explanation:**
Undefined behavior (UB) means the C standard places NO requirement on what the compiler does when such an event occurs. The compiler is free to produce code that crashes, silently corrupts data, or appears to "work" on one system and explodes on another. UB is not a runtime error that can be caught — it is a contract violation. 

The most common UBs include:
- Uninitialized variables.
- Signed integer overflow.
- Null pointer dereference.
- Out-of-bounds array access.
- Strict aliasing violation.

Compilers heavily EXPLOIT undefined behavior for optimization. For example, the check `if (x + 1 > x)` where `x` is a signed int is typically completely removed and optimized to `true` by the compiler because signed overflow is UB, and the compiler assumes UB never happens.

**Objects and Methods:**
*   **Undefined Behavior (UB)**
    *   **What it is:** A situation where the C standard fails to impose any requirements on the implementation.
    *   **Implementation:** Depends entirely on the compiler and execution environment; often leads to aggressive optimizations assuming the UB never occurs.
    *   **Its use:** Avoided at all costs by programmers; exploited by compilers for optimization.
    *   **Type:** Specification concept.
    *   **Responsibility:** Invalidating any guarantees about program execution once violated.
    *   **Depends on:** The specific rules violated (e.g., bounds checking, integer representation).
    *   **Connects to:** Bugs, security vulnerabilities, and platform-specific behaviors.
    *   **Shape:** N/A (conceptual).

## Closing
C is powerful precisely because it makes no decisions for you. You choose the type; you manage the memory; you ensure bounds are respected. Module 0 continues with bits and integers. Lesson 02 covers binary representation — the actual bit patterns inside every variable. 

**Exercises:**
- Write a function that returns the maximum of three integers.
- Write a loop that prints the sum of 1 to 100.
- Predict what `sizeof(int[10])` returns and verify by tracing.
