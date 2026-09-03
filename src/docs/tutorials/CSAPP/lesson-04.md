# Lesson 04: Floating Point and IEEE 754 — Real Numbers in Binary

What you will build: The reader will understand IEEE 754 floating-point: how real numbers are approximated in binary, the structure of a float (sign/exponent/mantissa), why `0.1 + 0.2 != 0.3`, special values (NaN, Inf, -0.0), and when to use float vs. double vs. integer arithmetic. The transferable insight: floating-point arithmetic is NOT real-number arithmetic. It is a finite approximation with rounding at every step. Programs that treat floating-point results as exact (e.g. for equality comparison or financial calculations) have bugs.

What you need to know first: Lessons 00-03.

### Terms used in this lesson

- **Floating-point** — A system for representing real numbers that can support a wide range of values by letting the radix point "float" rather than being fixed. Exists to allow computation on both very large and very small fractions efficiently in hardware.
- **IEEE 754** — The standard defining floating-point math. Exists so that floating-point calculations behave identically across different CPU architectures.
- **Sign bit** — A single bit representing whether the number is positive (0) or negative (1). Exists to allow signed magnitude representation.
- **Exponent** — The portion of the floating-point number representing the power of 2 by which to scale the fraction. Exists to give the float its massive dynamic range.
- **Mantissa (or Significand)** — The fractional part of the floating-point number. Exists to provide the precision of the value.
- **Catastrophic cancellation** — The massive loss of relative precision that occurs when subtracting two nearly equal floating-point numbers.
- **Binary fraction** — A fraction where each place value to the right of the binary point is a decreasing power of 2 (1/2, 1/4, 1/8). Exists because computers must represent fractions in base-2.
- **`+`, `-`, `*`, `/` (Arithmetic operators)** — Standard mathematical operators. Exist to perform computation on numerical types.
- **`==` (Equality operator)** — Compares two values for exact equality. Exists to allow exact matching, which is notoriously problematic for floats.
- **`>>` (Right shift operator)** — Shifts bits to the right. Exists to allow bitwise extraction of components like the exponent.
- **`&` (Bitwise AND operator)** — Performs a logical AND on each bit. Exists to mask out specific bits.

### Objects and methods used

- **`printf`**
  - *What it is:* A standard library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* To display floating-point values and their underlying representations.
  - *Type:* Standard library free function.
  - *Responsibility:* Translates internal data types into human-readable formatted text written to standard output.
  - *Depends on:* A format string and matching variadic arguments; the OS standard output stream.
  - *Connects to:* Called by our application; calls down to OS write syscalls.
  - *Shape:* A public API surface of the C standard library.

- **`memcpy`**
  - *What it is:* A function to copy blocks of memory.
  - *Implementation:* `void *memcpy(void *dest, const void *src, size_t n);`
  - *Its use:* To safely copy the raw bytes of a `float` into a `uint32_t` integer without violating strict aliasing rules, so we can inspect its bits.
  - *Type:* Standard library free function.
  - *Responsibility:* Copies `n` bytes from a source memory address to a destination memory address verbatim.
  - *Depends on:* Valid, non-overlapping source and destination pointers, and a byte count.
  - *Connects to:* Called by our application; interacts directly with raw memory.
  - *Shape:* A low-level utility function in the C standard library.

- **`isnan`**
  - *What it is:* A macro/function to check if a floating-point value is Not-a-Number (NaN).
  - *Implementation:* `int isnan(real-floating x);`
  - *Its use:* To safely determine if a calculation produced a NaN, since `NaN == NaN` is false.
  - *Type:* Standard library macro/function (from `math.h`).
  - *Responsibility:* Returns non-zero if the argument is a NaN value.
  - *Depends on:* A floating-point value to test.
  - *Connects to:* Called by our application; runs a bitwise check on the floating-point format.
  - *Shape:* A mathematical utility in the standard library.

- **`fabs`**
  - *What it is:* A function to compute the absolute value of a floating-point number.
  - *Implementation:* `double fabs(double x);`
  - *Its use:* To find the magnitude of the difference between two floats for epsilon-based equality comparison.
  - *Type:* Standard library free function (from `math.h`).
  - *Responsibility:* Clears the sign bit of a floating-point number, returning its absolute magnitude.
  - *Depends on:* A floating-point value.
  - *Connects to:* Called by our application.
  - *Shape:* A mathematical utility in the standard library.

- **`FLT_MAX` / `FLT_MIN`**
  - *What it is:* Macros defining the maximum and minimum positive normalized representable values of a `float`.
  - *Implementation:* `#define FLT_MAX 3.402823466e+38F` (exact value depends on implementation, but standard IEEE 754 32-bit is ~3.4e38).
  - *Its use:* To demonstrate the limits and overflow behavior of 32-bit floats.
  - *Type:* Preprocessor macro constants (from `float.h`).
  - *Responsibility:* Provides compiler-known limits for the `float` type.
  - *Depends on:* The specific compiler and target architecture's floating-point implementation.
  - *Connects to:* Replaced by the preprocessor directly into our code.
  - *Shape:* System-defined constant boundary values.

---

## Concept Unit: Fractional binary — representing real numbers in bits

### The Problem
Computers store everything in binary (0s and 1s). It is easy to see how integers are represented (e.g., `101` in binary is `5` in decimal). But how do we represent fractions like `0.5`, `0.75`, or `0.1`?
Given what you know about integer bit positions (where each position is a positive power of 2, like 1, 2, 4, 8), what would you try first to represent a fraction? What happens if you try to represent `1/3` in base-10? Look at how `0.5` is `1/2` — what does it suggest binary fractions might be based on?

### Introduce the concept in isolation
We will write a small C program to test how standard binary fractions are stored and evaluated.

```c
#include <stdio.h>

int main(void) {
    /* Some fractions have exact binary representations: */
    printf("0.5   = %.20f\n", 0.5);   /* exact: 1/2 = 2^-1 */
    printf("0.25  = %.20f\n", 0.25);  /* exact: 1/4 = 2^-2 */
    
    /* Most fractions do NOT have exact binary representations: */
    printf("0.1   = %.20f\n", 0.1);   /* NOT exact: repeating binary */
    printf("0.1 + 0.2 = %.20f\n", 0.1 + 0.2);  /* NOT 0.3! */
    printf("0.1 + 0.2 == 0.3: %d\n", 0.1 + 0.2 == 0.3);  /* 0 (false!) */
    return 0;
}
/* Output:
   0.5   = 0.50000000000000000000
   0.25  = 0.25000000000000000000
   0.1   = 0.10000000000000000555
   0.1 + 0.2 = 0.30000000000000004441
   0.1 + 0.2 == 0.3: 0 */
```
This output proves that **binary fractions** can perfectly represent sums of negative powers of 2 (like 1/2, 1/4). It also proves that fractions like `0.1` (1/10) cannot be represented exactly in binary, leading to infinite repeating patterns that must be rounded, causing `0.1 + 0.2` to not equal `0.3`.

### Discard the throwaway
This throwaway code is discarded and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating standalone theory.
- **Files affected:** `fractions.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** Standard C library.

### The New Code
```c
#include <stdio.h>

int main(void) {
    double a = 0.1;
    double b = 0.2;
    double c = 0.3;
    printf("Result of a + b == c is %d\n", (a + b) == c);
    return 0;
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: 
3: int main(void) {
4:     double a = 0.1;
5:     double b = 0.2;
6:     double c = 0.3;
7:     printf("Result of a + b == c is %d\n", (a + b) == c);
8:     return 0;
9: }
```
This complete file assigns three floating-point variables and prints the result of checking if `0.1 + 0.2` exactly equals `0.3`.

### Mechanical walkthrough
- `#include <stdio.h>`: Preprocessor directive that includes the standard I/O library.
- `int main(void)`: The entry point function returning an integer.
- `{`: Begins the block of the `main` function.
- `double`: The C keyword for a double-precision (64-bit) floating-point type.
- `a`: The identifier for the first variable.
- `=`: The assignment operator assigning the value on the right to the variable on the left.
- `0.1`: A double-precision floating point literal representing one-tenth.
- `;`: Statement terminator.
- `double b = 0.2;`: Declares and assigns the second variable.
- `double c = 0.3;`: Declares and assigns the third variable.
- `printf`: Function call to print formatted text.
- `"Result of a + b == c is %d\n"`: The format string literal, with `%d` expecting an integer argument and `\n` for a newline.
- `,`: Separates arguments in the function call.
- `(`: Opens precedence grouping for the arithmetic.
- `a + b`: Uses the addition operator `+` to sum the floating-point values of `a` and `b`.
- `)`: Closes precedence grouping.
- `==`: The equality operator comparing the sum to `c`. Evaluates to 1 if exactly equal, 0 otherwise.
- `c`: The variable we are comparing against.
- `)`: Closes the `printf` argument list.
- `;`: Statement terminator.
- `return 0;`: Exits the program with a success code.
- `}`: Closes the `main` function.

### CS lens
The concept here is **Base Conversion Precision Loss**. When converting fractions between numeric bases (like base-10 to base-2), a fraction that terminates in one base may be infinitely repeating in another. In base-10, `1/3` is `0.3333...`. In base-2, `1/10` (which is `0.1` in decimal) is `0.0001100110011...`. Because memory is finite, the repeating sequence is truncated, leading to an approximation rather than an exact value. This appears in numeric simulations, graphics coordinate transformations, and audio sampling.

### SE lens
The design principle here is that **floating-point equality is dangerous**. The alternative of just using `==` to check if a math operation reached a specific value is often chosen by beginners because it looks correct algebraically. The real tradeoff is that because floats round at every single arithmetic step, algebraic equivalence does not guarantee binary equivalence. Robust software instead checks if the absolute difference is within a small threshold (an epsilon).

### Commands needed
```bash
gcc fractions.c -o fractions
```

### Run it
Predicted confidently: `Result of a + b == c is 0` (Because 0.1 + 0.2 is slightly larger than 0.3 in binary).

### One sentence connecting to previous unit
Now that we know binary fractions inherently approximate many decimal values, we need to understand the exact bit layout the machine uses to store this approximation.

---

## Concept Unit: IEEE 754 format — sign, exponent, mantissa

### The Problem
We have a 32-bit space to store a real number. We need to handle huge numbers (like the distance between stars) and microscopic numbers (like the size of an atom) using the exact same 32 bits.
How would you allocate 32 bits to achieve both huge range and high precision? What happens if you just use 16 bits for the whole number and 16 bits for the fraction? Look at scientific notation (like 6.02 × 10^23) — what does it suggest about how we might split up the bits?

### Introduce the concept in isolation
We will write a C function to crack open a `float` and read its actual bits.

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

void decode_float(float f) {
    uint32_t bits;
    memcpy(&bits, &f, 4);
    uint32_t sign     = (bits >> 31) & 0x1;
    uint32_t exp_bits = (bits >> 23) & 0xFF;
    uint32_t mantissa = bits & 0x7FFFFF;
    int      exponent = (int)exp_bits - 127;
    
    printf("f = %g | sign: %u, exp: %d, mantissa: 0x%x\n", f, sign, exponent, mantissa);
}

int main(void) {
    decode_float(1.0f);
    decode_float(-0.5f);
    return 0;
}
/* Output:
   f = 1 | sign: 0, exp: 0, mantissa: 0x0
   f = -0.5 | sign: 1, exp: -1, mantissa: 0x0
*/
```
This output proves the **IEEE 754** floating point layout: it stores the sign bit separately, uses a biased exponent to scale by powers of 2, and stores the fraction (the mantissa) in the remaining bits.

### Discard the throwaway
This throwaway code is discarded and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating standalone theory.
- **Files affected:** `ieee.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** Standard C library.

### The New Code
```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main(void) {
    float f = 2.0f;
    uint32_t bits;
    memcpy(&bits, &f, 4);
    
    uint32_t sign = (bits >> 31) & 1;
    uint32_t exp = (bits >> 23) & 0xFF;
    uint32_t mantissa = bits & 0x7FFFFF;
    
    printf("sign=%u exp=%u mantissa=0x%x\n", sign, exp, mantissa);
    return 0;
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: #include <stdint.h>
3: #include <string.h>
4: 
5: int main(void) {
6:     float f = 2.0f;
7:     uint32_t bits;
8:     memcpy(&bits, &f, 4);
9:     
10:     uint32_t sign = (bits >> 31) & 1;
11:     uint32_t exp = (bits >> 23) & 0xFF;
12:     uint32_t mantissa = bits & 0x7FFFFF;
13:     
14:     printf("sign=%u exp=%u mantissa=0x%x\n", sign, exp, mantissa);
15:     return 0;
16: }
```
This code assigns `2.0f`, copies its exact bit pattern into an integer, and extracts the sign, exponent, and mantissa fields using bitwise math.

### Mechanical walkthrough
- `#include <stdio.h>`, `#include <stdint.h>`, `#include <string.h>`: Includes for IO, exact-width integers, and memory functions.
- `int main(void) {`: The entry point.
- `float`: The C keyword for a single-precision 32-bit floating-point type.
- `f`: The variable name.
- `=`: Assignment operator.
- `2.0f`: A single-precision floating point literal.
- `;`: Statement terminator.
- `uint32_t bits;`: Declares an unsigned 32-bit integer to hold our raw bits.
- `memcpy`: Function call to copy memory.
- `(`: Opens arguments.
- `&bits`: Address-of operator giving the memory location of `bits`.
- `,`: Argument separator.
- `&f`: Address-of operator giving the memory location of `f`.
- `, 4)`: Copies exactly 4 bytes (32 bits).
- `;`: Statement terminator.
- `uint32_t sign`: Declares a variable to hold the sign bit.
- `=`: Assignment.
- `(`: Precedence.
- `bits >> 31`: The right shift operator `>>` shifts the bits down by 31 places, moving the top bit (the sign bit) to the lowest position.
- `)`: Closes precedence.
- `&`: The bitwise AND operator.
- `1`: Literal integer. Masks out all but the lowest bit.
- `;`: Terminator.
- `uint32_t exp = (bits >> 23) & 0xFF;`: Shifts right 23 bits (past the mantissa) and masks with `0xFF` (8 bits of 1s) to extract the 8-bit exponent.
- `uint32_t mantissa = bits & 0x7FFFFF;`: Applies a bitwise AND mask of `0x7FFFFF` (23 bits of 1s) to extract just the bottom 23 bits, the mantissa.
- `printf("sign=%u exp=%u mantissa=0x%x\n", sign, exp, mantissa);`: Prints the three extracted fields.
- `return 0; }`: Exits the program.

### CS lens
The concept here is **Floating-Point Encoding (IEEE 754)**. It solves the massive dynamic range problem by essentially storing numbers in binary scientific notation: a sign, a scaled exponent, and a fraction. By dedicating bits to an exponent, the decimal point can "float" to represent huge values with low precision or tiny values with high precision. This representation format appears in virtually all modern CPUs, GPUs, and hardware math coprocessors.

### SE lens
The design principle here is **Strict Aliasing and Type Punning**. The alternative not chosen is casting a `float*` to a `uint32_t*` and dereferencing it (e.g., `*(uint32_t*)&f`). The real tradeoff is that while pointer casting looks cleaner and faster, it violates C's strict aliasing rules, giving the compiler permission to aggressively optimize and break the code. Using `memcpy` is explicitly defined by the standard as the correct, safe way to view raw bytes.

### Commands needed
```bash
gcc ieee.c -o ieee
```

### Run it
Predicted confidently: `sign=0 exp=128 mantissa=0x0`. (Because 2.0 is positive, 2^1 so exponent is 1 + 127 bias = 128, and mantissa is 0 since 2.0 is exactly a power of 2 with no extra fraction).

### One sentence connecting to previous unit
Now that we can extract the IEEE 754 bits directly, we can look at what happens when those bits form special patterns that don't represent normal numbers.

---

## Concept Unit: Special values — Inf, NaN, and -0.0

### The Problem
Math operations often produce undefined or infinite results, like dividing by zero or taking the square root of a negative number.
If floating-point numbers represent a physical 32-bit circuit, what happens if an operation divides 1.0 by 0.0? What would you try first to handle this without crashing the whole program? Look at the exponent bits — what does it suggest we can use extreme bit patterns for?

### Introduce the concept in isolation
We will test dividing by zero in floating point versus integer math.

```c
#include <stdio.h>
#include <math.h>

int main(void) {
    float pos_inf  =  1.0f / 0.0f;
    float nan_val  =  0.0f / 0.0f;
    
    printf("1.0/0.0 = %f\n", pos_inf);
    printf("0.0/0.0 = %f\n", nan_val);
    printf("NaN == NaN: %d\n", nan_val == nan_val);
    return 0;
}
/* Output:
   1.0/0.0 = inf
   0.0/0.0 = nan
   NaN == NaN: 0
*/
```
This output proves that **IEEE 754 defines special values** for Infinity and Not-a-Number (NaN) so that impossible mathematical operations propagate safely instead of immediately crashing the CPU. It also proves the unique rule that `NaN` is never equal to anything, not even itself.

### Discard the throwaway
This throwaway code is discarded and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating standalone theory.
- **Files affected:** `special.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** Standard C library math functions.

### The New Code
```c
#include <stdio.h>
#include <math.h>

int main(void) {
    float n = 0.0f / 0.0f;
    if (isnan(n)) {
        printf("Detected a NaN correctly.\n");
    }
    return 0;
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: #include <math.h>
3: 
4: int main(void) {
5:     float n = 0.0f / 0.0f;
6:     if (isnan(n)) {
7:         printf("Detected a NaN correctly.\n");
8:     }
9:     return 0;
10: }
```
This creates a `NaN` by dividing zero by zero, and safely checks if the result is NaN using the proper library macro instead of `==`.

### Mechanical walkthrough
- `#include <stdio.h>`: Includes standard I/O.
- `#include <math.h>`: Includes the math library, necessary for `isnan`.
- `int main(void) {`: Program entry point.
- `float n`: Declares a single-precision floating point variable `n`.
- `=`: Assignment operator.
- `0.0f`: Floating-point zero.
- `/`: Division operator.
- `0.0f`: Divides by floating-point zero, triggering a NaN generation in hardware.
- `;`: Terminator.
- `if`: Conditional branching keyword.
- `(`: Opens condition.
- `isnan`: A standard library macro/function that checks if a float is a NaN.
- `(`: Opens `isnan` arguments.
- `n`: The variable to check.
- `))`: Closes `isnan` arguments and `if` condition.
- `{`: Opens `if` block.
- `printf("Detected a NaN correctly.\n");`: Prints our success message.
- `}`: Closes `if` block.
- `return 0; }`: Exits the program.

### CS lens
The concept here is **In-Band Signaling**. IEEE 754 needs a way to report errors (like undefined math) without requiring an out-of-band channel like exceptions or multiple return values. It dedicates specific bit patterns (exponent all 1s) to represent infinity and NaN. This is a common CS pattern used anywhere out-of-band error channels are unavailable, such as returning `-1` for an index failure in arrays or `null` for a missing object.

### SE lens
The design principle here is **Fail-Safe Degradation vs. Hard Crash**. The alternative not chosen is triggering a hardware fault and aborting the process immediately upon dividing by zero (which is exactly what integer division does!). The real tradeoff is that while a crash stops bad math instantly, in environments where floats are used heavily (like rendering graphics or running physics simulations), propagating a `NaN` gracefully is vastly preferred over crashing the entire simulation or game frame.

### Commands needed
```bash
gcc special.c -o special -lm
```

### Run it
Predicted confidently: `Detected a NaN correctly.` (Because 0.0/0.0 definitively produces a NaN, and `isnan` is the standard compliant way to detect it).

### One sentence connecting to previous unit
Special values show us that floating point numbers have edge cases defined by the standard, but normal numbers have insidious behavioral pitfalls of their own.

---

## Concept Unit: Floating-point pitfalls — comparison, cancellation, overflow

### The Problem
We have seen that fractions can lose precision, but arithmetic operations cascade that loss. If two numbers are very close together and we subtract them, what happens to their precise digits?
If floats are always slightly imprecise, how do we ever check if a calculation finished at a target value? What happens if you add a tiny number to a massive number in a 32-bit space? Look at the `==` operator — what does it suggest is required for equality?

### Introduce the concept in isolation
We will write a C program to show how associative math breaks down and how to properly compare floats.

```c
#include <stdio.h>
#include <math.h>

int main(void) {
    /* Associativity violation */
    float p = 1e30f, q = -1e30f, r = 1.0f;
    printf("(p+q)+r = %g\n", (p+q)+r);  /* 1.0 */
    printf("p+(q+r) = %g\n", p+(q+r));  /* 0.0 */
    
    /* Correct comparison */
    double a = 0.1 + 0.2, b = 0.3;
    printf("fabs(a-b) < 1e-9: %d\n", fabs(a - b) < 1e-9);
    return 0;
}
/* Output:
   (p+q)+r = 1
   p+(q+r) = 0
   fabs(a-b) < 1e-9: 1
*/
```
This output proves that **floating point math is not strictly associative** `(a+b)+c != a+(b+c)`. Because of limited mantissa bits, adding a tiny number (`1.0`) to a massive one (`-1e30`) causes the tiny number to simply fall off the edge and vanish to rounding. It also proves that using `fabs` and an epsilon (like `1e-9`) correctly tests for float equality.

### Discard the throwaway
This throwaway code is discarded and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating standalone theory.
- **Files affected:** `pitfalls.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** Standard C library math functions.

### The New Code
```c
#include <stdio.h>
#include <math.h>

int main(void) {
    double x = 0.1 + 0.2;
    double target = 0.3;
    double epsilon = 1e-9;
    
    if (fabs(x - target) < epsilon) {
        printf("Values are practically equal.\n");
    }
    return 0;
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: #include <math.h>
3: 
4: int main(void) {
5:     double x = 0.1 + 0.2;
6:     double target = 0.3;
7:     double epsilon = 1e-9;
8:     
9:     if (fabs(x - target) < epsilon) {
10:         printf("Values are practically equal.\n");
11:     }
12:     return 0;
13: }
```
This file correctly checks for floating-point equality by verifying the absolute difference is smaller than a tiny tolerance value (`epsilon`).

### Mechanical walkthrough
- `#include <stdio.h>`: Includes standard I/O.
- `#include <math.h>`: Includes math functions.
- `int main(void) {`: Program entry.
- `double x = 0.1 + 0.2;`: Performs floating point addition that we know incurs precision loss.
- `double target = 0.3;`: The exact value we conceptually expect.
- `double epsilon = 1e-9;`: Declares a tolerance threshold (one billionth).
- `if`: Conditional check.
- `(`: Opens condition.
- `fabs`: Function call to compute absolute magnitude of a double.
- `(`: Opens `fabs` arguments.
- `x - target`: Subtracts the target from `x` to find the difference between them.
- `)`: Closes `fabs`.
- `<`: The less-than relational operator.
- `epsilon`: The tolerance threshold.
- `)`: Closes `if` condition.
- `{`: Opens block.
- `printf("Values are practically equal.\n");`: Prints success message.
- `}`: Closes block.
- `return 0; }`: Exits properly.

### CS lens
The concept here is **Epsilon-Delta Continuity and Error Propagation**. Because floating-point representations act as discrete steps along the number line, operations inherently introduce quantization error. In numerical analysis, you never ask if an approximation perfectly hits a true coordinate; you ask if it falls within an acceptable bounded region (an epsilon). This is foundational in collision detection in games, machine learning gradient checks, and control systems.

### SE lens
The design principle here is **Bounded Tolerance vs Absolute Correctness**. The alternative not chosen is attempting to use arbitrary-precision arithmetic libraries (like GMP) to make every calculation perfectly exact. The real tradeoff is performance: hardware executes 32-bit floats in a single clock cycle, whereas arbitrary-precision math can be hundreds of times slower. We accept bounded tolerance specifically to get the massive hardware acceleration floats provide.

### Commands needed
```bash
gcc pitfalls.c -o pitfalls -lm
```

### Run it
Predicted confidently: `Values are practically equal.` (Because the rounding error in `0.1 + 0.2` is roughly `4e-17`, which is vastly smaller than our epsilon of `1e-9`).

### One sentence connecting to previous unit
Understanding these pitfalls makes it obvious that for certain tasks, we should avoid floating-point entirely and use different types.

---

## Concept Unit: float vs. double vs. integer — choosing the right type

### The Problem
If floats are dangerous and imprecise, how do banking apps calculate money without stealing pennies from users?
Given what you know about how integers are stored, what would you try first to handle money perfectly without floats? What happens if you try to use `double` instead of `float` for billions of dollars? Look at the name "integer" — what does it suggest about exactness?

### Introduce the concept in isolation
We will write a C program comparing how `float`, `double`, and `int` handle a large exact number like $12,345,678.99.

```c
#include <stdio.h>

int main(void) {
    float  f = 12345678.99f;
    double d = 12345678.99;
    int    cents = 1234567899;
    
    printf("float:  %.2f\n", f);
    printf("double: %.2f\n", d);
    printf("cents:  %d (which is $%.2f)\n", cents, cents / 100.0);
    return 0;
}
/* Output:
   float:  12345679.00
   double: 12345678.99
   cents:  1234567899 (which is $12345678.99)
*/
```
This output proves that **`float` only has about 7 significant decimal digits** of precision, destroying the pennies entirely. It also proves that `double` has enough precision (~15 digits) for this specific number, but that integer `cents` is the only format mathematically guaranteed to never lose precision to fractional rounding.

### Discard the throwaway
This throwaway code is discarded and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating standalone theory.
- **Files affected:** `types.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** Standard C library.

### The New Code
```c
#include <stdio.h>

int main(void) {
    int bank_balance_cents = 1099;
    printf("Balance: $%.2f\n", bank_balance_cents / 100.0);
    return 0;
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: 
3: int main(void) {
4:     int bank_balance_cents = 1099;
5:     printf("Balance: $%.2f\n", bank_balance_cents / 100.0);
6:     return 0;
7: }
```
This code demonstrates storing currency safely as an exact integer number of cents, only converting to a floating-point display format when it is time to print to the screen.

### Mechanical walkthrough
- `#include <stdio.h>`: Includes standard I/O.
- `int main(void) {`: Program entry.
- `int`: The C keyword for a standard size signed integer.
- `bank_balance_cents`: Identifier explicitly naming the unit (cents) to prevent confusion.
- `=`: Assignment operator.
- `1099`: Integer literal representing $10.99.
- `;`: Terminator.
- `printf`: Formatted print function.
- `"Balance: $%.2f\n"`: Format string literal. `%.2f` says to print a floating point number with exactly 2 decimal places.
- `,`: Argument separator.
- `bank_balance_cents`: The integer variable.
- `/`: Division operator.
- `100.0`: A double-precision floating point literal. Dividing an integer by a float forces a type promotion, executing the division in floating point strictly for display purposes.
- `)`: Closes `printf`.
- `;`: Terminator.
- `return 0; }`: Exits the program.

### CS lens
The concept here is **Fixed-Point vs Floating-Point Mathematics**. By using integers to represent a fractional value (e.g., storing $10.99 as 1099 cents), we have implemented a fixed-point scale where the decimal point is statically locked at two places. This guarantees uniform precision and exact addition/subtraction everywhere on the number line, which is required for cryptography, financial ledgers, and deterministic game engines.

### SE lens
The design principle here is **Separation of Storage and Display Representation**. The alternative not chosen is storing the balance directly as `10.99f` because that is how it looks to the user. The real tradeoff is that aligning backend storage types with user interface expectations leads to systemic data corruption over time. By storing integers natively and converting to float *only* at the UI boundary (`/ 100.0`), the system logic stays robust and exact.

### Commands needed
```bash
gcc types.c -o types
```

### Run it
Predicted confidently: `Balance: $10.99` (Because integer division promoted by a double literal `100.0` correctly results in the double `10.99`, formatted to two places).

### One sentence connecting to previous unit
By knowing the limits of floats, we know exactly when to rely on integers instead.

---

## Closing

### Connect the pieces
Floating-point numbers are not the continuous real numbers we learn about in algebra. They are a highly engineered, finite approximation. The 32 bits of a `float` are meticulously divided into a sign bit, an exponent, and a mantissa.

Because computers operate in base-2, many simple base-10 fractions (like `0.1` and `0.2`) become infinitely repeating bit patterns that must be chopped off to fit into the mantissa. This means when we run `0.1 + 0.2`, the CPU is actually adding `0.10000000000000000555...` and `0.2000000000000000111...`. Their sum overflows the true exactness of `0.3`, producing `0.30000000000000004441...`. Thus, `0.1 + 0.2 != 0.3` evaluates to true because the machine compares the two rounded, approximated bit patterns, which are inherently unaligned. 

IEEE 754 is a finite approximation of the infinite real number line, and every operation on it is rounded to the nearest representable value — understanding this is what separates programmers who are surprised by floating-point bugs from those who are not.

Module 1 begins with Lesson 05 — how the compiler translates C to machine code.
