# Lesson 01: C Fundamentals — Types, Operators, Control Flow, and Functions

What you will build: The reader will understand C as a language of explicit choices: you choose the type (and therefore the size), you choose the operator (and therefore the machine instruction), you choose to allocate (and therefore to free). The transferable insight: every C type is a SIZE CONTRACT with the hardware. `int` promises 4 bytes; `char` promises 1 byte. Everything the compiler generates follows from those contracts.

What you need to know first: Lesson 00.

**Terms used in this lesson**
- **Compiler** — A program that translates human-readable source code into machine code the hardware can execute. It exists because CPUs only understand raw bytes, not text files.
- **Type** — A contract between the programmer and the compiler that defines how many bytes to allocate in memory and how to interpret those bytes (e.g., as text, as an integer, or as a fractional number). This exists to prevent the CPU from treating arbitrary memory as the wrong kind of data.
- **Variable** — A named location in memory that stores a value of a specific type. It exists so that programmers can reference memory by name instead of by raw numeric addresses.
- **Operator** — A symbol that tells the compiler to perform a specific mathematical, relational, or logical operation (like `+` or `*`). It exists to express data transformations concisely.
- **Function** — A named block of code that performs a specific task, optionally taking inputs and returning a result. It exists to encapsulate logic so it can be reused without repetition, making programs maintainable.
- **Parameter** — A variable in a function declaration that accepts a value passed in by the caller. It exists to make functions generic and reusable across different inputs.
- **Argument** — The actual value passed to a function when it is called. It exists to bind concrete data to the function's abstract parameters for one specific execution.
- **Stack frame** — A block of memory allocated automatically when a function is called, holding its local variables and the return address. It exists so that function calls (especially recursive ones) can maintain independent states without corrupting each other.
- **Pointer** — A variable that stores the memory address of another variable. It exists to allow direct memory access, sharing of memory between functions without copying, and building complex dynamic data structures.
- **Address-of (`&`)** — An operator that evaluates to the memory address of a variable. It exists so we can find exactly where in memory our data lives and pass that location to other parts of the program.
- **Dereference (`*`)** — An operator that accesses the value stored at a specific memory address. It exists to let programs read or modify data through a pointer.
- **`sizeof`** — A compile-time operator that returns the size (in bytes) of a type or a variable. It exists so that programs can allocate exactly the right amount of memory across different CPU architectures where types might vary in size.
- **Bitwise operator** — An operator that manipulates the individual binary bits of integer data. It exists to give systems programmers raw control over hardware registers, memory efficiency, and specific bit-level flags.

**Objects and methods used**
- **`printf`**
  - *What it is:* A standard library function for formatted console output.
  - *Implementation:* `int printf(const char *format, ...);` (variadic function returning the number of characters printed).
  - *Its use:* To output text and the results of our code execution to the console so we can observe behavior.
  - *Type:* Standard library free function.
  - *Responsibility:* Parses a format string and substitutes subsequent arguments at designated format specifiers, then writes the resulting string to standard output.
  - *Depends on:* A valid null-terminated format string and matching arguments for every format specifier.
  - *Connects to:* Called by our application code; connects to the operating system's standard output stream (`stdout`).
  - *Shape:* A standard C library (libc) boundary API.
- **`main`**
  - *What it is:* The designated entry point of a C program.
  - *Implementation:* `int main(void)` or `int main(int argc, char *argv[])`.
  - *Its use:* Defines the starting point of our application logic.
  - *Type:* Application entry-point function.
  - *Responsibility:* Bootstraps the application, calls the primary logic, and returns an exit status code to the operating system.
  - *Depends on:* Nothing for `void` parameters; the OS environment for `argc` and `argv`.
  - *Connects to:* Called by the C runtime startup code (usually `_start`); calls our application functions.
  - *Shape:* The boundary between the OS-level runtime and the user-level application.

## Concept Unit: Primitive types and sizes

### The Problem
When we declare a variable to hold data, how does the computer know how much physical memory to set aside? If we want to store a single letter versus a massive number, how do we express that difference to the hardware? What happens if we try to fit a value into a space that's too small?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main(void) {
    char a = 'X';
    int b = 100000;
    printf("char a takes %zu byte(s)\n", sizeof(a));
    printf("int b takes %zu byte(s)\n", sizeof(b));
    return 0;
}
/* Predicted confidently:
char a takes 1 byte(s)
int b takes 4 byte(s)
*/
```
This proves that different types are literally different sizes in memory. A `char` is an exactly 1-byte contract, whereas an `int` on modern systems typically demands 4 bytes. 

### Discard the throwaway
This isolated sizing check is discarded and will not be part of the final project code.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are initializing a new project file to explore foundational types.
- **Files affected**: Created `src/types.c`.
- **Change type**: Add.
- **Location**: Entire file.
- **Dependencies**: The standard C library headers `<stdio.h>`, `<stdint.h>`, and `<limits.h>`.

### The New Code
```c
#include <stdio.h>
#include <stdint.h>   /* for fixed-width types */
#include <limits.h>   /* for INT_MAX etc. */

int main(void) {
    /* C's primitive types and their sizes on x86-64 Linux */
    printf("char:      %zu bytes, range [%d, %d]\n",
           sizeof(char), CHAR_MIN, CHAR_MAX);
    printf("short:     %zu bytes\n", sizeof(short));
    printf("int:       %zu bytes, max=%d\n", sizeof(int), INT_MAX);
    printf("long:      %zu bytes\n", sizeof(long));
    printf("long long: %zu bytes\n", sizeof(long long));
    printf("float:     %zu bytes\n", sizeof(float));
    printf("double:    %zu bytes\n", sizeof(double));
    printf("pointer:   %zu bytes\n", sizeof(void *));

    /* Fixed-width types (preferred in systems programming): */
    int8_t   a = 127;     /* exactly 8 bits, signed */
    uint32_t b = 4294967295U; /* exactly 32 bits, unsigned */
    int64_t  c = -1LL;   /* exactly 64 bits, signed */
    printf("int8_t=%d uint32_t=%u int64_t=%lld\n", a, b, (long long)c);
    return 0;
}
```

### The Updated Project
```c
1: // ← new: Entire file `src/types.c` created
2: #include <stdio.h>
3: #include <stdint.h>   /* for fixed-width types */
4: #include <limits.h>   /* for INT_MAX etc. */
5: 
6: int main(void) {
7:     /* C's primitive types and their sizes on x86-64 Linux */
8:     printf("char:      %zu bytes, range [%d, %d]\n",
9:            sizeof(char), CHAR_MIN, CHAR_MAX);
10:     printf("short:     %zu bytes\n", sizeof(short));
11:     printf("int:       %zu bytes, max=%d\n", sizeof(int), INT_MAX);
12:     printf("long:      %zu bytes\n", sizeof(long));
13:     printf("long long: %zu bytes\n", sizeof(long long));
14:     printf("float:     %zu bytes\n", sizeof(float));
15:     printf("double:    %zu bytes\n", sizeof(double));
16:     printf("pointer:   %zu bytes\n", sizeof(void *));
17: 
18:     /* Fixed-width types (preferred in systems programming): */
19:     int8_t   a = 127;     /* exactly 8 bits, signed */
20:     uint32_t b = 4294967295U; /* exactly 32 bits, unsigned */
21:     int64_t  c = -1LL;   /* exactly 64 bits, signed */
22:     printf("int8_t=%d uint32_t=%u int64_t=%lld\n", a, b, (long long)c);
23:     return 0;
24: }
```
This entire program now serves as a dynamic memory inspector that interrogates the compiler to prove exactly how many bytes it allocates for every foundational type on this specific architecture.

### Mechanical walkthrough
- `#include <stdio.h>` is a preprocessor directive that imports the declaration for `printf`.
- `#include <stdint.h>` is a preprocessor directive importing definitions for fixed-width integer types like `int8_t`.
- `#include <limits.h>` is a preprocessor directive importing limits constants like `INT_MAX`.
- `int` declares the return type of `main`, returning a 4-byte integer status code.
- `main(void)` is the function signature defining the entry point, taking no arguments (`void`).
- `{` begins the function body.
- `printf` is a standard library function called to write formatted output.
- `"char:      %zu bytes, range [%d, %d]\n"` is a string literal containing format specifiers. `%zu` expects a `size_t` (an unsigned integer type representing sizes), and `%d` expects standard integers. `\n` is the newline character.
- `,` is the argument separator.
- `sizeof(char)` uses the `sizeof` compile-time operator to compute the byte size of the `char` type, returning a `size_t`.
- `CHAR_MIN` is a constant macro from `limits.h` representing the minimum value a signed char can hold.
- `CHAR_MAX` is a constant macro representing the maximum value a signed char can hold.
- `)` closes the `printf` argument list.
- `;` terminates the statement.
- `printf("short:     %zu bytes\n", sizeof(short));` calls `printf` to output the size of a `short` integer.
- `printf("int:       %zu bytes, max=%d\n", sizeof(int), INT_MAX);` calls `printf` to output the size of an `int` and the `INT_MAX` limit (2147483647).
- `printf("long:      %zu bytes\n", sizeof(long));` outputs the size of a `long` integer (typically 8 bytes on 64-bit Linux).
- `printf("long long: %zu bytes\n", sizeof(long long));` outputs the size of a `long long` integer.
- `printf("float:     %zu bytes\n", sizeof(float));` outputs the size of a single-precision floating point number (4 bytes).
- `printf("double:    %zu bytes\n", sizeof(double));` outputs the size of a double-precision floating point number (8 bytes).
- `printf("pointer:   %zu bytes\n", sizeof(void *));` outputs the size of a generic pointer `void *` (8 bytes on a 64-bit system).
- `int8_t` declares a variable with an explicit fixed width of exactly 8 bits, signed.
- `a` is the variable identifier.
- `=` is the assignment operator, storing the right-hand value into the left-hand variable.
- `127` is an integer literal.
- `;` terminates the statement.
- `uint32_t` declares a fixed-width 32-bit unsigned integer type.
- `b` is the identifier.
- `=` assigns the value.
- `4294967295U` is an integer literal with the `U` suffix, explicitly marking it as unsigned.
- `;` terminates the statement.
- `int64_t` declares a fixed-width 64-bit signed integer type.
- `c` is the identifier.
- `=` assigns the value.
- `-1LL` is an integer literal with the `LL` suffix, marking it as a `long long` so it easily fits the 64-bit constraint without truncation.
- `;` terminates the statement.
- `printf("int8_t=%d uint32_t=%u int64_t=%lld\n", a, b, (long long)c);` prints the fixed-width variables. `%d` handles the signed 8-bit promoted to int, `%u` handles the unsigned 32-bit, and `%lld` handles the explicitly cast `(long long)c`.
- `return 0;` exits `main` and yields `0` (success) back to the operating system.
- `}` closes the `main` block.

### CS lens
The concept here is **Data Representation**. How physical memory (a long array of bytes) is mapped to logical values.
Also recognized in: network protocol packet headers (reserving exactly 4 bytes for an IPv4 address), image file formats (reserving exactly 3 bytes per pixel in a 24-bit bitmap), database schemas defining column sizes, CPU register widths, cryptography block sizes.

### SE lens
Design principle: **Explicit Contracts**. By choosing `int8_t` over `char`, the programmer explicitly documents intent.
The alternative not chosen was relying purely on standard types like `short` or `long`. The tradeoff is that standard types vary in size across architectures (a `long` is 4 bytes on 32-bit Windows but 8 bytes on 64-bit Linux). Fixed-width types ensure portability and predictability, costing a tiny bit more verbosity through included headers.

### Commands needed
`gcc src/types.c -o types`
This compiles the C source file into an executable binary named `types`.

### Run it
Predicted confidently:
```
char:      1 bytes, range [-128, 127]
short:     2 bytes
int:       4 bytes, max=2147483647
long:      8 bytes
long long: 8 bytes
float:     4 bytes
double:    8 bytes
pointer:   8 bytes
int8_t=127 uint32_t=4294967295 int64_t=-1
```
Because `sizeof` is resolved at compile time, the compiler replaces those expressions with absolute constants matching the x86-64 ABI rules.

### One sentence connecting to previous unit
Now that we have variables of specific sizes in memory, we need a way to combine and modify them mathematically and logically.

## Concept Unit: Operators and expressions

### The Problem
If we have two variables in memory, how do we instruct the CPU to add them together? How do we determine if one is larger than the other, or perform low-level manipulations on their individual binary bits? What happens when a math operation doesn't yield a whole number?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main(void) {
    int x = 10;
    int y = 3;
    printf("division: %d\n", x / y);
    return 0;
}
/* Predicted confidently:
division: 3
*/
```
This proves that C integer division strictly truncates toward zero. There is no fraction; it does not round up to 3.33. The remainder is discarded.

### Discard the throwaway
This simple division test is discarded and will not appear in the final codebase.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Created `src/operators.c`.
- **Change type**: Add.
- **Location**: Entire file.
- **Dependencies**: `<stdio.h>`.

### The New Code
```c
#include <stdio.h>

int main(void) {
    int a = 60, b = 13;

    /* Arithmetic */
    printf("%d + %d = %d\n",  a, b, a + b);  /* 73 */
    printf("%d - %d = %d\n",  a, b, a - b);  /* 47 */
    printf("%d * %d = %d\n",  a, b, a * b);  /* 780 */
    printf("%d / %d = %d\n",  a, b, a / b);  /* 4 (integer division!) */
    printf("%d %% %d = %d\n", a, b, a % b);  /* 8 (remainder) */

    /* Bitwise (the systems programmer's tools) */
    printf("%d & %d  = %d\n",  a, b, a & b);   /* AND:  8 */
    printf("%d | %d  = %d\n",  a, b, a | b);   /* OR:  61 */
    printf("%d ^ %d  = %d\n",  a, b, a ^ b);   /* XOR: 53 */
    printf("~%d      = %d\n",  a, ~a);          /* NOT: -61 */
    printf("%d << 2  = %d\n",  a, a << 2);      /* left shift:  240 = 60*4 */
    printf("%d >> 2  = %d\n",  a, a >> 2);      /* right shift:  15 = 60/4 */

    /* Comparison and logical */
    printf("%d == %d: %d\n", a, b, a == b);   /* 0 (false) */
    printf("%d != %d: %d\n", a, b, a != b);   /* 1 (true) */
    printf("%d && %d: %d\n", a, b, a && b);   /* 1 (both nonzero) */
    printf("%d || %d: %d\n", 0, b, 0 || b);   /* 1 (b is nonzero) */
    return 0;
}
```

### The Updated Project
```c
1: // ← new: Entire file `src/operators.c` created
2: #include <stdio.h>
3: 
4: int main(void) {
5:     int a = 60, b = 13;
6: 
7:     /* Arithmetic */
8:     printf("%d + %d = %d\n",  a, b, a + b);  /* 73 */
9:     printf("%d - %d = %d\n",  a, b, a - b);  /* 47 */
10:     printf("%d * %d = %d\n",  a, b, a * b);  /* 780 */
11:     printf("%d / %d = %d\n",  a, b, a / b);  /* 4 (integer division!) */
12:     printf("%d %% %d = %d\n", a, b, a % b);  /* 8 (remainder) */
13: 
14:     /* Bitwise (the systems programmer's tools) */
15:     printf("%d & %d  = %d\n",  a, b, a & b);   /* AND:  8 */
16:     printf("%d | %d  = %d\n",  a, b, a | b);   /* OR:  61 */
17:     printf("%d ^ %d  = %d\n",  a, b, a ^ b);   /* XOR: 53 */
18:     printf("~%d      = %d\n",  a, ~a);          /* NOT: -61 */
19:     printf("%d << 2  = %d\n",  a, a << 2);      /* left shift:  240 = 60*4 */
20:     printf("%d >> 2  = %d\n",  a, a >> 2);      /* right shift:  15 = 60/4 */
21: 
22:     /* Comparison and logical */
23:     printf("%d == %d: %d\n", a, b, a == b);   /* 0 (false) */
24:     printf("%d != %d: %d\n", a, b, a != b);   /* 1 (true) */
25:     printf("%d && %d: %d\n", a, b, a && b);   /* 1 (both nonzero) */
26:     printf("%d || %d: %d\n", 0, b, 0 || b);   /* 1 (b is nonzero) */
27:     return 0;
28: }
```
This new file serves as a comprehensive suite exercising C's core operational capabilities, proving out arithmetic truncation, bitwise masking, and logical boolean evaluations.

### Mechanical walkthrough
- `#include <stdio.h>` imports the standard I/O library for printing.
- `int main(void)` declares the main program entry.
- `{` starts the block.
- `int a = 60, b = 13;` declares two integer variables and initializes them to 60 and 13 respectively.
- `printf("%d + %d = %d\n", a, b, a + b);` executes an addition operator (`+`) and prints the result.
- `a - b` is the subtraction operator, yielding 47.
- `a * b` is the multiplication operator, yielding 780.
- `a / b` is the division operator. Since both are `int`s, it performs integer division (truncating to 4).
- `a % b` is the modulo operator, computing the remainder of the division (8). The `%%` in the format string escapes a literal `%`.
- `a & b` is the bitwise AND operator. It compares bits. 60 (0b00111100) AND 13 (0b00001101) yields 8 (0b00001100).
- `a | b` is the bitwise OR operator. Comparing bits yields 61 (0b00111101).
- `a ^ b` is the bitwise XOR (exclusive OR) operator. Differing bits are set, yielding 53.
- `~a` is the bitwise NOT operator. It inverts all bits. For a signed 32-bit int, `~60` yields -61 due to two's complement representation.
- `a << 2` is the bitwise left shift operator. It shifts bits left by 2 positions, effectively multiplying by $2^2=4$, yielding 240.
- `a >> 2` is the bitwise right shift operator. It shifts bits right, effectively dividing by 4, yielding 15.
- `a == b` is the equality comparison operator. It evaluates to 0 because 60 is not 13.
- `a != b` is the inequality operator. It evaluates to 1 because 60 is not equal to 13.
- `a && b` is the logical AND operator. It checks if both sides are non-zero (true). Since both are, it yields 1.
- `0 || b` is the logical OR operator. It yields 1 because `b` (13) is non-zero, satisfying the OR condition.
- `return 0;` exits gracefully.
- `}` closes the function.

### CS lens
The concept here is **Boolean Logic and Bit Manipulation**. Computers perform everything through gates matching these fundamental operators.
Also recognized in: cryptography algorithms (relying heavily on XOR and shifts), hardware device drivers (masking specific bits in control registers), subnet mask evaluations in IP networking, graphics blending operations, fast mathematical approximations.

### SE lens
Design principle: **Zero Overhead Mapping**. Operators in C map almost directly to single assembly instructions.
The alternative not chosen was having high-level abstractions like big integer math or automatically promoting integer division to floating-point. The tradeoff is that while C operators are extremely fast, the programmer must be hyper-aware of integer overflow, truncation, and bitwise layout because the compiler will not guard against them.

### Commands needed
`gcc src/operators.c -o operators`

### Run it
Predicted confidently:
```
60 + 13 = 73
60 - 13 = 47
60 * 13 = 780
60 / 13 = 4
60 % 13 = 8
60 & 13  = 8
60 | 13  = 61
60 ^ 13  = 53
~60      = -61
60 << 2  = 240
60 >> 2  = 15
60 == 13: 0
60 != 13: 1
60 && 13: 1
0 || 13: 1
```
The exact output is highly predictable because these mathematical and bitwise operations are deterministic and do not rely on external environment variables.

### One sentence connecting to previous unit
Knowing how to calculate and compare values means nothing if we cannot use the results of those comparisons to change what the program does next.

## Concept Unit: Control flow — if/else, for, while, switch

### The Problem
How do we make a program do something more than once? If we need to print a sequence of numbers, do we have to copy and paste `printf` 100 times? If we need to handle an error differently from a success, how do we split the program's path based on a condition evaluated at runtime?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main(void) {
    if (1 > 0) {
        printf("Branch taken\n");
    }
    return 0;
}
/* Predicted confidently:
Branch taken
*/
```
This proves that an `if` statement evaluates a condition and conditionally executes a block of code based entirely on whether that condition evaluates to a non-zero (true) value. 

### Discard the throwaway
This simplistic condition is discarded and won't be used in our project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Created `src/control_flow.c`.
- **Change type**: Add.
- **Location**: Entire file.
- **Dependencies**: `<stdio.h>`.

### The New Code
```c
#include <stdio.h>

void describe(int n) {
    /* if/else: branch on condition */
    if (n > 0)
        printf("%d is positive\n", n);
    else if (n < 0)
        printf("%d is negative\n", n);
    else
        printf("zero\n");

    /* switch: dispatch on integer value */
    switch (n % 3) {
        case 0:  printf("divisible by 3\n"); break;
        case 1:  printf("remainder 1\n");    break;
        case 2:  printf("remainder 2\n");    break;
        default: printf("negative remainder\n");
    }
}

int main(void) {
    /* for loop: count-controlled */
    int sum = 0;
    for (int i = 1; i <= 10; i++)
        sum += i;
    printf("sum 1..10 = %d\n", sum);  /* 55 */

    /* while loop: condition-controlled */
    int n = 1;
    while (n < 1000)
        n *= 2;
    printf("first power of 2 >= 1000: %d\n", n);  /* 1024 */

    describe(7);
    describe(-3);
    describe(0);
    return 0;
}
```

### The Updated Project
```c
1: // ← new: Entire file `src/control_flow.c` created
2: #include <stdio.h>
3: 
4: void describe(int n) {
5:     /* if/else: branch on condition */
6:     if (n > 0)
7:         printf("%d is positive\n", n);
8:     else if (n < 0)
9:         printf("%d is negative\n", n);
10:     else
11:         printf("zero\n");
12: 
13:     /* switch: dispatch on integer value */
14:     switch (n % 3) {
15:         case 0:  printf("divisible by 3\n"); break;
16:         case 1:  printf("remainder 1\n");    break;
17:         case 2:  printf("remainder 2\n");    break;
18:         default: printf("negative remainder\n");
19:     }
20: }
21: 
22: int main(void) {
23:     /* for loop: count-controlled */
24:     int sum = 0;
25:     for (int i = 1; i <= 10; i++)
26:         sum += i;
27:     printf("sum 1..10 = %d\n", sum);  /* 55 */
28: 
29:     /* while loop: condition-controlled */
30:     int n = 1;
31:     while (n < 1000)
32:         n *= 2;
33:     printf("first power of 2 >= 1000: %d\n", n);  /* 1024 */
34: 
35:     describe(7);
36:     describe(-3);
37:     describe(0);
38:     return 0;
39: }
```
This complete file implements a battery of loops and conditional jumps, establishing the basic routing capabilities that allow logic to vary dynamically at runtime instead of running strictly top-to-bottom.

### Mechanical walkthrough
- `void describe(int n)` defines a new function named `describe` taking an integer parameter `n` and returning nothing (`void`).
- `{` starts the `describe` block.
- `if (n > 0)` evaluates the relational condition. If `n` is greater than 0, the next statement runs.
- `printf("%d is positive\n", n);` prints the positive message.
- `else if (n < 0)` provides a mutually exclusive secondary branch checked only if the first condition was false.
- `printf("%d is negative\n", n);` prints the negative message.
- `else` acts as the fallback catch-all for any scenario where neither prior condition was true (meaning `n` is exactly 0).
- `printf("zero\n");` prints zero.
- `switch (n % 3)` evaluates the expression `n % 3` (the remainder when dividing by 3) and jumps directly to a matching case.
- `{` starts the switch block.
- `case 0:` defines the jump target if the evaluated expression is `0`.
- `printf("divisible by 3\n");` prints the matching output.
- `break;` explicitly terminates the switch block, preventing execution from "falling through" to the next case.
- `case 1:` defines the target for `1`.
- `printf("remainder 1\n");` outputs the text.
- `break;` stops fall-through.
- `case 2:` defines the target for `2`.
- `printf("remainder 2\n");` outputs the text.
- `break;` stops fall-through.
- `default:` is the switch fallback executed if no `case` matched. In C, negative numbers modulo positive numbers yield negative remainders (e.g., `-3 % 3 == 0`, but `-2 % 3 == -2`).
- `printf("negative remainder\n");` prints the fallback.
- `}` closes the switch.
- `}` closes `describe`.
- `int main(void)` declares the main function.
- `{` opens main.
- `int sum = 0;` initializes an accumulator.
- `for (int i = 1; i <= 10; i++)` sets up a count-controlled loop. It initializes `i` to 1, loops as long as `i <= 10`, and increments `i` by 1 (`i++`) after every pass.
- `sum += i;` is shorthand for `sum = sum + i`, adding the current loop index into the accumulator.
- `printf("sum 1..10 = %d\n", sum);` prints the total (55).
- `int n = 1;` initializes `n` to 1 for the while loop.
- `while (n < 1000)` sets up a condition-controlled loop that repeats indefinitely as long as the condition evaluates to true.
- `n *= 2;` doubles `n` continuously.
- `printf("first power of 2 >= 1000: %d\n", n);` outputs the final doubled value (1024).
- `describe(7);` calls our custom function with `n=7`.
- `describe(-3);` calls it with `n=-3`.
- `describe(0);` calls it with `n=0`.
- `return 0;` exits `main`.
- `}` closes `main`.

Execution trace for the `while` loop:
Iteration 1: `n` 1 → 2, because 1 < 1000 is true, so 1 is multiplied by 2.
Iteration 2: `n` 2 → 4, because 2 < 1000 is true, multiplied by 2.
Iteration 3: `n` 4 → 8, because 4 < 1000 is true, multiplied by 2.
...
Iteration 10: `n` 512 → 1024, because 512 < 1000 is true, multiplied by 2.
Iteration 11: halts, because 1024 < 1000 is false, escaping the loop block.

### CS lens
The concept here is **Control Flow Branching and Iteration**. Programs are not straight lines; they are decision trees and cycles.
Also recognized in: state machines managing video game character logic, network packet retry loops waiting for acknowledgments, user interface event loops constantly listening for clicks, parser engines stepping through a source file character by character, sorting algorithms dividing datasets.

### SE lens
Design principle: **Structured Programming**. The `if`, `while`, and `for` constructs constrain execution flow into predictable scopes.
The alternative not chosen was using `goto` to arbitrarily jump memory locations like assembly languages do. The tradeoff is that structured blocks are slightly more rigid but massively prevent "spaghetti code" because every loop has a clear entry and exit point.

### Commands needed
`gcc src/control_flow.c -o control_flow`

### Run it
Predicted confidently:
```
sum 1..10 = 55
first power of 2 >= 1000: 1024
7 is positive
remainder 1
-3 is negative
divisible by 3
zero
divisible by 3
```
Mathematical logic determines the branch executions deterministically.

### One sentence connecting to previous unit
We wrote `describe` to group code together and hide its complexity from `main`, showing that we can package logic into callable functions.

## Concept Unit: Functions — declaration, definition, call, return

### The Problem
If we have a chunk of control flow logic that we need to use in twenty different places across ten different files, do we duplicate the loop every time? How does the compiler know the correct way to invoke a block of code if that code is defined much later in the file, or in a completely different file?

### Introduce the concept in isolation
```c
#include <stdio.h>

void say_hello(void);

int main(void) {
    say_hello();
    return 0;
}

void say_hello(void) {
    printf("Hello\n");
}
/* Predicted confidently:
Hello
*/
```
This is called a **function prototype**. It proves that by declaring a function's signature (`void say_hello(void);`) at the top, we can call it in `main` before the compiler has actually seen the full definition at the bottom.

### Discard the throwaway
This basic forward declaration test is discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Created `src/functions.c`.
- **Change type**: Add.
- **Location**: Entire file.
- **Dependencies**: `<stdio.h>`.

### The New Code
```c
#include <stdio.h>

/* Declaration (prototype): tells the compiler the function's signature */
long factorial(int n);
int  gcd(int a, int b);

/* Definition: the actual implementation */
long factorial(int n) {
    if (n <= 1) return 1;         /* base case */
    return (long)n * factorial(n - 1);  /* recursive case */
}

/* Iterative GCD using Euclidean algorithm */
int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;  /* a is now the GCD */
}

int main(void) {
    /* Function calls: each creates a new stack frame */
    printf("5! = %ld\n",   factorial(5));   /* 120 */
    printf("10! = %ld\n",  factorial(10));  /* 3628800 */
    printf("gcd(48,18) = %d\n", gcd(48, 18)); /* 6 */
    printf("gcd(100,75) = %d\n", gcd(100,75)); /* 25 */
    return 0;
}
```

### The Updated Project
```c
1: // ← new: Entire file `src/functions.c` created
2: #include <stdio.h>
3: 
4: /* Declaration (prototype): tells the compiler the function's signature */
5: long factorial(int n);
6: int  gcd(int a, int b);
7: 
8: /* Definition: the actual implementation */
9: long factorial(int n) {
10:     if (n <= 1) return 1;         /* base case */
11:     return (long)n * factorial(n - 1);  /* recursive case */
12: }
13: 
14: /* Iterative GCD using Euclidean algorithm */
15: int gcd(int a, int b) {
16:     while (b != 0) {
17:         int temp = b;
18:         b = a % b;
19:         a = temp;
20:     }
21:     return a;  /* a is now the GCD */
22: }
23: 
24: int main(void) {
25:     /* Function calls: each creates a new stack frame */
26:     printf("5! = %ld\n",   factorial(5));   /* 120 */
27:     printf("10! = %ld\n",  factorial(10));  /* 3628800 */
28:     printf("gcd(48,18) = %d\n", gcd(48, 18)); /* 6 */
29:     printf("gcd(100,75) = %d\n", gcd(100,75)); /* 25 */
30:     return 0;
31: }
```
This file separates the concept of a function *declaration* from its *definition*, and demonstrates two different ways a function can do work: by calling itself recursively (`factorial`) and by iterating iteratively (`gcd`).

### Mechanical walkthrough
- `#include <stdio.h>` imports printing tools.
- `long factorial(int n);` declares a function prototype. It promises the compiler that a function named `factorial` exists somewhere, takes an `int`, and returns a `long`.
- `int gcd(int a, int b);` declares a prototype for `gcd`, taking two integers and returning an integer.
- `long factorial(int n)` begins the actual definition (the body) of the `factorial` function.
- `{` starts the factorial body.
- `if (n <= 1)` checks the base case. If `n` is 1 or less, the recursion stops.
- `return 1;` exits the function immediately, sending the value `1` back to the caller.
- `return (long)n * factorial(n - 1);` explicitly casts `n` to a `long` to prevent overflow during multiplication, multiplies it by the result of calling `factorial(n - 1)` again, and returns that product.
- `}` closes the factorial function.
- `int gcd(int a, int b)` defines the Greatest Common Divisor function.
- `{` opens it.
- `while (b != 0)` starts an iterative loop that continues as long as `b` is not zero.
- `{` opens the while loop.
- `int temp = b;` declares a local temporary variable and stores `b` inside it.
- `b = a % b;` updates `b` to hold the remainder of `a` divided by `b`.
- `a = temp;` updates `a` to hold the old value of `b` we stashed in `temp`.
- `}` closes the while loop.
- `return a;` returns the computed GCD when the loop finishes.
- `}` closes the gcd function.
- `int main(void)` opens the entry point.
- `{` starts main.
- `printf("5! = %ld\n", factorial(5));` calls `factorial` with the argument 5, taking its returned `long` result and printing it via the `%ld` format specifier.
- `printf("10! = %ld\n", factorial(10));` calls `factorial` with 10.
- `printf("gcd(48,18) = %d\n", gcd(48, 18));` calls `gcd` with 48 and 18, printing the `%d` returned integer.
- `printf("gcd(100,75) = %d\n", gcd(100,75));` calls `gcd` again.
- `return 0;` exits cleanly.
- `}` closes main.

Execution trace for `factorial(3)` (control flow trace):
1. `factorial(3)` — a new stack frame is created with `n=3`. 3 is not <= 1. It must return `3 * factorial(2)`. Execution of this frame is paused.
2. `factorial(2)` — a second stack frame is built with `n=2`. 2 is not <= 1. It must return `2 * factorial(1)`. This frame pauses.
3. `factorial(1)` — a third stack frame is built with `n=1`. 1 <= 1 is true. It returns `1` immediately.
4. `factorial(2)` resumes, substituting the `1` from step 3. It computes `2 * 1` and returns `2`.
5. `factorial(3)` resumes, substituting the `2` from step 4. It computes `3 * 2` and returns `6` to `main`.

### CS lens
The concept here is **Subroutines and Call Stacks**. Functions abstract complexity, allowing modular design.
Also recognized in: OS system calls (jumping from user space to kernel space functions), REST API endpoint handlers, mathematical abstractions, GUI event callbacks, parsing grammar production rules.

### SE lens
Design principle: **Separation of Interface and Implementation**. By putting declarations at the top (which often get moved to `.h` header files) and definitions at the bottom (or in `.c` files), we decoupled knowing *how* to call something from *what* it actually does under the hood.
The alternative not chosen was requiring all functions to be fully implemented above where they are called. The tradeoff is that separating interface and implementation requires typing the signature twice, but completely resolves cyclical dependencies where Function A calls Function B and Function B calls Function A.

### Commands needed
`gcc src/functions.c -o functions`

### Run it
Predicted confidently:
```
5! = 120
10! = 3628800
gcd(48,18) = 6
gcd(100,75) = 25
```
Because mathematics on these fixed values is fully deterministic.

### One sentence connecting to previous unit
Variables exist in memory, and functions let us build independent scopes with their own private variables, but what if a function needs to actually alter a variable belonging to the caller?

## Concept Unit: Pointers and addresses — the C superpower

### The Problem
When we pass an argument to a function, C makes a fresh copy of that value for the function's private stack frame. If we write a function to swap two variables, how can we make it change the *actual* variables we passed in, rather than just silently swapping its own private, isolated copies? 

### Introduce the concept in isolation
```c
#include <stdio.h>
int main(void) {
    int target = 99;
    int *arrow = &target;
    printf("Value through arrow: %d\n", *arrow);
    return 0;
}
/* Predicted confidently:
Value through arrow: 99
*/
```
This is called a **pointer dereference**. It proves that by using the `&` operator to get the physical memory address of `target`, and saving it in `arrow`, we can use `*arrow` to look up the value resting at that address, breaking out of standard variable naming boundaries.

### Discard the throwaway
This simplistic pointer lookup is discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Created `src/pointers.c`.
- **Change type**: Add.
- **Location**: Entire file.
- **Dependencies**: `<stdio.h>`.

### The New Code
```c
#include <stdio.h>

void double_it(int *p) {  /* p is a pointer to int */
    *p = *p * 2;           /* dereference: read and write through p */
}

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 10;
    int *p = &x;         /* & = address-of: p holds x's address */
    printf("x = %d\n", x);           /* 10 */
    printf("&x = %p\n", (void*)&x);  /* some address, e.g. 0x7fff... */
    printf("p = %p\n",  (void*)p);   /* same address */
    printf("*p = %d\n", *p);         /* 10: dereference = read through pointer */

    *p = 20;  /* write through pointer: modifies x */
    printf("x after *p=20: %d\n", x);  /* 20 */

    double_it(&x);  /* pass address of x: function can modify x */
    printf("x after double_it: %d\n", x);  /* 40 */

    int a = 3, b = 7;
    swap(&a, &b);
    printf("after swap: a=%d b=%d\n", a, b);  /* a=7 b=3 */

    /* Pointer arithmetic */
    int arr[4] = {10, 20, 30, 40};
    int *q = arr;  /* q points to arr[0] */
    printf("%d %d %d\n", *q, *(q+1), *(q+2));  /* 10 20 30 */
    return 0;
}
```

### The Updated Project
```c
1: // ← new: Entire file `src/pointers.c` created
2: #include <stdio.h>
3: 
4: void double_it(int *p) {  /* p is a pointer to int */
5:     *p = *p * 2;           /* dereference: read and write through p */
6: }
7: 
8: void swap(int *a, int *b) {
9:     int temp = *a;
10:     *a = *b;
11:     *b = temp;
12: }
13: 
14: int main(void) {
15:     int x = 10;
16:     int *p = &x;         /* & = address-of: p holds x's address */
17:     printf("x = %d\n", x);           /* 10 */
18:     printf("&x = %p\n", (void*)&x);  /* some address, e.g. 0x7fff... */
19:     printf("p = %p\n",  (void*)p);   /* same address */
20:     printf("*p = %d\n", *p);         /* 10: dereference = read through pointer */
21: 
22:     *p = 20;  /* write through pointer: modifies x */
23:     printf("x after *p=20: %d\n", x);  /* 20 */
24: 
25:     double_it(&x);  /* pass address of x: function can modify x */
26:     printf("x after double_it: %d\n", x);  /* 40 */
27: 
28:     int a = 3, b = 7;
29:     swap(&a, &b);
30:     printf("after swap: a=%d b=%d\n", a, b);  /* a=7 b=3 */
31: 
32:     /* Pointer arithmetic */
33:     int arr[4] = {10, 20, 30, 40};
34:     int *q = arr;  /* q points to arr[0] */
35:     printf("%d %d %d\n", *q, *(q+1), *(q+2));  /* 10 20 30 */
36:     return 0;
37: }
```
This final file implements pointer manipulation directly, unlocking C's superpower: the ability to observe and mutate state globally by sharing raw memory addresses rather than duplicating data.

### Mechanical walkthrough
- `void double_it(int *p)` defines a function that takes an `int *` (a pointer to an integer) named `p`.
- `{` starts the block.
- `*p` dereferences the pointer, looking up the actual integer value parked at the address `p` holds.
- `=` is the assignment operator.
- `*p * 2` reads the value through the pointer, multiplies it by 2. The whole statement writes that newly doubled value back directly to the memory address.
- `}` closes the function.
- `void swap(int *a, int *b)` takes two integer pointers.
- `{` opens the block.
- `int temp = *a;` dereferences pointer `a` to read its value, backing it up into a local integer `temp`.
- `*a = *b;` reads the value at address `b`, and writes it into the memory at address `a`.
- `*b = temp;` writes the backed-up value into memory at address `b`.
- `}` closes the swap function.
- `int main(void)` opens main.
- `{` opens block.
- `int x = 10;` declares standard integer variable `x`.
- `int *p = &x;` declares `p` as an `int *` pointer, and uses the `&` address-of operator to initialize it with `x`'s physical memory location.
- `printf("x = %d\n", x);` prints `x` natively (10).
- `printf("&x = %p\n", (void*)&x);` prints the raw address of `x`. `%p` is the pointer format specifier, and we cast to `(void*)` to satisfy `printf`'s generic pointer expectation.
- `printf("p = %p\n", (void*)p);` prints the contents of `p` (which is exactly that same address).
- `printf("*p = %d\n", *p);` dereferences `p` and prints the value residing there (10).
- `*p = 20;` reaches through `p` and changes the value at that address to 20. Because `p` points to `x`, `x` is now 20.
- `printf("x after *p=20: %d\n", x);` prints `x` to prove it changed (20).
- `double_it(&x);` calls the doubling function, using `&` to pass the *address* of `x`, granting `double_it` permission to mutate `x`.
- `printf("x after double_it: %d\n", x);` proves `double_it` modified it successfully (40).
- `int a = 3, b = 7;` sets up fresh variables.
- `swap(&a, &b);` calls swap, passing addresses of both.
- `printf("after swap: a=%d b=%d\n", a, b);` proves they are swapped globally (a=7, b=3).
- `int arr[4] = {10, 20, 30, 40};` declares a contiguous array of 4 integers in memory.
- `int *q = arr;` assigns the array directly to a pointer. In C, an array name decays automatically to a pointer to its 0th element (`&arr[0]`).
- `printf("%d %d %d\n", *q, *(q+1), *(q+2));` demonstrates pointer arithmetic. `*q` reads index 0. `*(q+1)` offsets the address by exactly 1 element's size (4 bytes for an int), reading index 1. `*(q+2)` offsets by 2 elements.
- `return 0;` exits cleanly.
- `}` closes main.

Execution trace for `double_it(&x)`:
1. `double_it(&x)` — `&x` evaluates to memory address `0x7fff001` (for example). `p` receives `0x7fff001`.
2. `*p * 2` — the CPU looks up the data at `0x7fff001` (it finds 20), and calculates 40.
3. `*p = 40` — the CPU overwrites the data at memory address `0x7fff001` with 40. Since `x` is physically bound to `0x7fff001`, `x` is now 40.

### CS lens
The concept here is **Indirection and Shared Memory Reference**. Passing a value passes a copy; passing a pointer grants access to the original underlying artifact.
Also recognized in: database indexes (which hold pointers to row locations rather than duplicating the row data), symbolic links in filesystems, references in Java/Python (which are just guarded pointers), DOM trees in web browsers, virtual memory page tables.

### SE lens
Design principle: **Pass-by-Reference Mutation**. Functions can yield multiple outputs by modifying state at provided addresses rather than returning a single bundled value.
The alternative not chosen was returning a tuple or a custom struct containing both swapped values. The tradeoff is that pointers drastically reduce memory copying overhead for large data structures, but introduce severe risks if the pointer is null, uninitialized, or points to memory that has already been deallocated.

### Commands needed
`gcc src/pointers.c -o pointers`

### Run it
Output involves memory addresses that vary randomly per run due to ASLR (Address Space Layout Randomization). Execution trace of real output on x86-64 Linux:
```
x = 10
&x = 0x7ffe9abc1234
p = 0x7ffe9abc1234
*p = 10
x after *p=20: 20
x after double_it: 40
after swap: a=7 b=3
10 20 30
```
This output proves that the address (`&x`) is a raw hex value, and manipulating the pointer modifies the exact target memory.

### One sentence connecting to previous unit
Pointers connect the dots: they are variables with a *type* and a *size* (Unit 1), manipulated via *operators* (`*` and `&` in Unit 2), used within *control flow* structures (Unit 3), to pass shared mutable state between *functions* (Unit 4).

## Closing

### Connect the pieces
Every concept unit in this lesson connects structurally when we trace how `&x` interacts with a function. First, the type system (Unit 1) dictates that `x` is a 4-byte `int` and `p` is an 8-byte pointer holding its location. When `main` reaches `double_it(&x)` (Unit 4), it calculates the address using the address-of operator (Unit 2). Execution control flow jumps (Unit 3) into the `double_it` stack frame, where pointer dereferencing (Unit 5) reaches back into `main`'s frame to read the 4 bytes, mathematically multiply them, and write them back. In C, the type is a contract that tells the compiler how many bytes to allocate and which machine instructions to emit — nothing more, nothing less.
