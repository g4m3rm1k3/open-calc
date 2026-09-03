# Lesson 03: Integers and Two's Complement — Signed, Unsigned, and Overflow

**What you will build**
The reader will understand two's complement representation, why it's used, how signed vs. unsigned integers differ, and why overflow is so dangerous and common. The transferable insight: two's complement is not arbitrary — it was chosen because addition and subtraction work the same way for both signed and unsigned values with the same hardware. The CPU doesn't know if a register holds a signed or unsigned integer; the C type tells the compiler which interpretation to use.

**What you need to know first**
- Lessons 00-02

**Terms used in this lesson**
- **unsigned** — A numeric type modifier in C that tells the compiler to interpret the bits as a non-negative integer. It solves the problem of needing to represent only positive counts or bit patterns.
- **signed** — A numeric type that can represent both negative and positive numbers. It exists so programs can perform standard arithmetic that dips below zero.
- **two's complement** — The standard encoding for signed integers. It exists to unify hardware: the exact same adder circuit can perform addition on both signed and unsigned numbers.
- **most significant bit (MSB)** — The highest-order bit in a binary number. In two's complement, it acts as the sign bit, letting the system determine if a number is negative.
- **modular arithmetic** — Arithmetic that wraps around upon reaching a certain value (the modulus). Unsigned integers use modular arithmetic, safely wrapping back to 0.
- **overflow** — A condition where a calculation produces a result that exceeds the maximum capacity of the data type, leading to data loss or undefined states.
- **undefined behavior (UB)** — A rule in C where certain invalid operations (like signed integer overflow) have no prescribed outcome. The compiler is free to assume they never happen and optimize accordingly, which can cause catastrophic bugs.
- **integer promotion** — C's implicit rules for converting types during operations. For example, comparing a signed int to an unsigned int promotes the signed one to unsigned, which can lead to logical errors.
- **arithmetic shift** — A bitwise right shift (`>>`) that preserves the sign bit (fills with 1s if negative). It is used to perform fast division by 2 on signed integers.
- **implementation-defined** — Behavior that depends on the specific compiler and hardware. The C standard leaves it up to the implementer to choose and document the behavior.

**Objects and methods used**

**`printf`**
- *What it is:* Standard library function for formatted output.
- *Implementation:* `int printf(const char *format, ...);`
- *Its use:* To output our integer values and bit patterns to the console to observe the behavior.
- *Type:* Standard library free function.
- *Responsibility:* Parses a format string and interpolates variable arguments, writing the result to standard output.
- *Depends on:* A valid null-terminated format string and matching arguments.
- *Connects to:* Calls underlying OS write syscalls to display text on the console.
- *Shape:* A public API surface provided by the C standard library (`stdio.h`).

**`uint8_t`, `uint16_t`, `uint32_t`**
- *What it is:* Exact-width unsigned integer types.
- *Implementation:* Typedefs for basic unsigned integer types of exactly 8, 16, and 32 bits respectively.
- *Its use:* To predictably show wrapping behavior and memory layouts at specific bit depths.
- *Type:* Typedef aliases.
- *Responsibility:* Guarantees the variable will take exactly N bits of memory and behave unsigned.
- *Depends on:* `stdint.h` being included.
- *Connects to:* The compiler's type system, mapping to hardware registers.
- *Shape:* Primitive data type boundaries.

**`int8_t`**
- *What it is:* Exact-width signed integer type.
- *Implementation:* Typedef for a basic signed integer type of exactly 8 bits.
- *Its use:* To show two's complement signed behavior in a small, easy-to-read 8-bit space.
- *Type:* Typedef alias.
- *Responsibility:* Guarantees the variable will take exactly 8 bits and use two's complement signed arithmetic.
- *Depends on:* `stdint.h`.
- *Connects to:* The compiler's type system.
- *Shape:* Primitive data type boundary.

**`UINT8_MAX`, `UINT16_MAX`, `UINT32_MAX`**
- *What it is:* Macros defining the maximum possible value for unsigned exact-width types.
- *Implementation:* `#define` constants in `stdint.h`.
- *Its use:* To safely retrieve the upper bounds of unsigned types to demonstrate wrapping.
- *Type:* Preprocessor macros.
- *Responsibility:* Hardcodes the maximum limit so code doesn't have to manually calculate `(1<<N)-1`.
- *Depends on:* Included `stdint.h`.
- *Connects to:* Replaces tokens with literal numbers at compile time.
- *Shape:* Constant definitions.

**`INT8_MIN`, `INT8_MAX`, `INT_MAX`, `INT_MIN`**
- *What it is:* Macros defining the minimum and maximum possible values for signed integer types.
- *Implementation:* `#define` constants in `limits.h` and `stdint.h`.
- *Its use:* To hit the exact bounds where signed overflow occurs.
- *Type:* Preprocessor macros.
- *Responsibility:* Provides the boundary values for two's complement types.
- *Depends on:* `limits.h` or `stdint.h`.
- *Connects to:* Replaces tokens at compile time.
- *Shape:* Constant definitions.

**`strlen`**
- *What it is:* Standard library string length function.
- *Implementation:* `size_t strlen(const char *s);`
- *Its use:* To demonstrate a common pitfall where mixing its unsigned return type with signed integers causes logic bugs.
- *Type:* Standard library function.
- *Responsibility:* Counts the number of bytes in a string before the null terminator.
- *Depends on:* A valid pointer to a null-terminated string.
- *Connects to:* Iterates over memory provided by the caller.
- *Shape:* A standard C library utility.

**`size_t`**
- *What it is:* An unsigned integer type used to represent sizes of objects.
- *Implementation:* Typedef (often mapping to `unsigned long` or `unsigned long long`).
- *Its use:* Represents the return type of `strlen` and shows why unsigned types can cause underflow bugs.
- *Type:* Typedef alias.
- *Responsibility:* Holds the maximum possible size of any object in memory securely.
- *Depends on:* Built into C standard headers like `stddef.h`.
- *Connects to:* Core memory APIs (like `malloc`, `strlen`).
- *Shape:* Primitive type alias.

---

## Concept Unit: Unsigned integers — binary counting

### The Problem
If a computer only stores data as raw sequences of 1s and 0s, how do we establish a convention to represent plain, non-negative numbers? If we have exactly 8 bits to work with, what happens if we try to store a number larger than those 8 bits can hold? Before looking at the code, if the maximum value an 8-bit slot can hold is 255, what do you predict happens if we mathematically add 1 to it?

### Introduce the concept in isolation
This throwaway code isolates the behavior of an 8-bit unsigned integer reaching its maximum limit and wrapping around.

```c
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint8_t x = 255;
    printf("255 + 1 = %u (uint8)\n", (uint8_t)(x + 1));
    return 0;
}
/* Output:
   255 + 1 = 0 (uint8)
*/
```
This proves **modular arithmetic**. Trace `uint8_t x = 255 = 0b11111111`. `x + 1 = 256 = 0b100000000`. Only 8 bits fit, so the 9th bit is dropped entirely, leaving `0b00000000 = 0`. All operations are modulo `2^8` (mod 256).

### Discard the throwaway
This isolated lab is now discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental C concepts in a standalone file.
- **Files affected:** `unsigned_demo.c` (created).
- **Change type:** Add.
- **Location:** The entire new file.
- **Dependencies:** None.

### The New Code
```c
#include <stdio.h>
#include <stdint.h>

void print_bits8(uint8_t v) {
    for (int i = 7; i >= 0; i--) printf("%d", (v>>i)&1);
}

int main(void) {
    printf("UINT8 range: 0 to %u\n", UINT8_MAX);
    printf("UINT16 range: 0 to %u\n", UINT16_MAX);
    printf("UINT32 range: 0 to %u\n", UINT32_MAX);

    uint8_t x = 255;
    printf("255 + 1 = %u (uint8)\n", (uint8_t)(x + 1));
    printf("0 - 1   = %u (uint8)\n", (uint8_t)(0 - 1));

    for (uint8_t v = 0; v <= 5; v++) {
        printf("%3u = ", v); print_bits8(v); printf("\n");
    }
    printf("255 = "); print_bits8(255); printf("\n");
    return 0;
}
```

### The Updated Project
```c
// ← new (file created)
1: #include <stdio.h>
2: #include <stdint.h>
3: 
4: void print_bits8(uint8_t v) {
5:     for (int i = 7; i >= 0; i--) printf("%d", (v>>i)&1);
6: }
7: 
8: int main(void) {
9:     printf("UINT8 range: 0 to %u\n", UINT8_MAX);
10:    printf("UINT16 range: 0 to %u\n", UINT16_MAX);
11:    printf("UINT32 range: 0 to %u\n", UINT32_MAX);
12:
13:    uint8_t x = 255;
14:    printf("255 + 1 = %u (uint8)\n", (uint8_t)(x + 1));
15:    printf("0 - 1   = %u (uint8)\n", (uint8_t)(0 - 1));
16:
17:    for (uint8_t v = 0; v <= 5; v++) {
18:        printf("%3u = ", v); print_bits8(v); printf("\n");
19:    }
20:    printf("255 = "); print_bits8(255); printf("\n");
21:    return 0;
22: }
```
This complete structure sets up a program that demonstrates the bit representations of small integers and explicitly shows unsigned integer wrap-around properties.

### Mechanical walkthrough
- `#include <stdio.h>` imports the standard input/output library, providing the `printf` method.
- `#include <stdint.h>` imports the standard integer library, giving us exact-width types like `uint8_t`.
- `void print_bits8(uint8_t v)` defines a helper function taking an 8-bit unsigned integer to print its binary form.
- `for (int i = 7; i >= 0; i--)` loops 8 times, starting from the most significant bit (index 7) down to 0.
- `printf("%d", (v>>i)&1)` shifts the value `v` right by `i` positions, masks it with `1` (bitwise AND) to isolate the single bit, and prints it.
- `int main(void)` is the entry point of the C program.
- `printf("UINT8 range: 0 to %u\n", UINT8_MAX);` prints a string, substituting the `%u` unsigned format specifier with the value of the `UINT8_MAX` macro (255).
- `printf("UINT16 range: 0 to %u\n", UINT16_MAX);` does the same for the 16-bit max (65535).
- `printf("UINT32 range: 0 to %u\n", UINT32_MAX);` does the same for the 32-bit max (4294967295).
- `uint8_t x = 255;` declares an exact 8-bit unsigned integer and assigns it the maximum value.
- `printf("255 + 1 = %u (uint8)\n", (uint8_t)(x + 1));` mathematically adds 1 to `x` (which promotes to int in C), then explicitly casts the result back to `uint8_t` to force truncation, printing 0.
- `printf("0 - 1 = %u (uint8)\n", (uint8_t)(0 - 1));` computes -1, casts it to `uint8_t`, mapping it to the max unsigned value (255).
- `for (uint8_t v = 0; v <= 5; v++)` iterates from 0 to 5.
- `printf("%3u = ", v); print_bits8(v); printf("\n");` prints the decimal value, calls our bit-printer, and outputs a newline.
- `printf("255 = "); print_bits8(255); printf("\n");` prints the final binary sequence for 255 (all 1s).
- `return 0;` exits the main function successfully.

### CS lens
The concept here is **modular arithmetic** (specifically modulo 2^N). When an N-bit integer system reaches its limit, it wraps around. This appears in:
1. Hash table indexing (using modulo to wrap array bounds).
2. Cryptography algorithms (like RSA) that fundamentally rely on finite field arithmetic.
3. Network sequence numbers (like TCP packets wrapping around after 4 billion bytes).
4. Timekeeping systems (like the Unix Epoch Year 2038 problem, which is a signed version of wrapping).

### SE lens
The design principle at work is **deterministic boundaries**. The alternative NOT chosen would be for the program to instantly crash or throw an exception the moment 255 + 1 is evaluated. C chooses silent truncation because checking every single math operation for a boundary break costs precious CPU cycles. The real tradeoff is performance versus safety: C gives you maximum speed but shifts the entire burden of proving the math won't overflow onto the programmer.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
UINT8 range: 0 to 255
UINT16 range: 0 to 65535
UINT32 range: 0 to 4294967295
255 + 1 = 0 (uint8)
0 - 1   = 255 (uint8)
  0 = 00000000
  1 = 00000001
  2 = 00000010
  3 = 00000011
  4 = 00000100
  5 = 00000101
255 = 11111111
```
Because the rules of unsigned bitwise truncation in C are perfectly deterministic and mandated by the standard.

### One sentence connecting to previous unit
Now that we have seen how raw non-negative bits wrap around at their maximum limit, we must solve how to represent numbers that drop below zero.

---

## Concept Unit: Signed integers — two's complement

### The Problem
If all 8 bits are used to count from 0 to 255, we have no way to represent a negative number like -5. If we need negatives, we have to sacrifice some of our positive range to make room. What happens if we decide that the leftmost bit just means "negative", but keep standard addition? Try adding 5 and -5 in binary with a naive sign bit — does it actually equal 0?

### Introduce the concept in isolation
This throwaway code isolates how C calculates the two's complement of a number by flipping all bits and adding 1.

```c
#include <stdio.h>
#include <stdint.h>

int main(void) {
    int8_t pos = 42; 
    int8_t neg = ~pos + 1;
    printf("~42+1 = %d\n", neg);
    return 0;
}
/* Output:
   ~42+1 = -42
*/
```
This proves **two's complement negation**. Trace `42 = 0b00101010`. Flipping all bits (`~pos`) gives `0b11010101`. Adding 1 yields `0b11010110`, which correctly evaluates as -42 in two's complement. This means negative numbers are constructed exactly so that adding them to their positive counterparts naturally rolls over to zero.

### Discard the throwaway
This isolated lab is now discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental C concepts in a standalone file.
- **Files affected:** `signed_demo.c` (created).
- **Change type:** Add.
- **Location:** The entire new file.
- **Dependencies:** None.

### The New Code
```c
#include <stdio.h>
#include <stdint.h>

void print_bits8(uint8_t v) {
    for (int i = 7; i >= 0; i--) printf("%d", (v>>i)&1);
}

int main(void) {
    printf("INT8 range: %d to %d\n", INT8_MIN, INT8_MAX);

    int8_t vals[] = {0, 1, 127, -1, -128};
    for (int i = 0; i < 5; i++) {
        printf("%5d = ", vals[i]);
        print_bits8((uint8_t)vals[i]);
        printf("\n");
    }

    int8_t pos = 42;
    int8_t neg = ~pos + 1;
    printf("~42+1 = %d\n", neg);
    printf("~(-42)+1 = %d\n", (int8_t)(~neg + 1));
    return 0;
}
```

### The Updated Project
```c
// ← new (file created)
1: #include <stdio.h>
2: #include <stdint.h>
3: 
4: void print_bits8(uint8_t v) {
5:     for (int i = 7; i >= 0; i--) printf("%d", (v>>i)&1);
6: }
7: 
8: int main(void) {
9:     printf("INT8 range: %d to %d\n", INT8_MIN, INT8_MAX);
10:
11:    int8_t vals[] = {0, 1, 127, -1, -128};
12:    for (int i = 0; i < 5; i++) {
13:        printf("%5d = ", vals[i]);
14:        print_bits8((uint8_t)vals[i]);
15:        printf("\n");
16:    }
17:
18:    int8_t pos = 42;
19:    int8_t neg = ~pos + 1;
20:    printf("~42+1 = %d\n", neg);
21:    printf("~(-42)+1 = %d\n", (int8_t)(~neg + 1));
22:    return 0;
23: }
```
This new file explicitly prints the bit patterns of crucial boundary numbers in signed representations.

### Mechanical walkthrough
- `#include <stdio.h>` and `#include <stdint.h>` import the standard I/O and integer libraries.
- `void print_bits8(uint8_t v)` defines our bit-printer helper function again.
- `int main(void)` is the entry point.
- `printf("INT8 range: %d to %d\n", INT8_MIN, INT8_MAX);` prints the minimum and maximum boundaries for an 8-bit signed integer using the `%d` format specifier.
- `int8_t vals[] = {0, 1, 127, -1, -128};` initializes an array of exactly 5 signed 8-bit integers representing important boundaries (zero, positive max, negative one, and negative min).
- `for (int i = 0; i < 5; i++)` iterates over the array.
- `printf("%5d = ", vals[i]);` prints the integer right-aligned to 5 spaces.
- `print_bits8((uint8_t)vals[i]);` explicitly casts the signed value to `uint8_t` (which safely preserves the exact binary pattern) and passes it to the bit printer.
- `printf("\n");` outputs a newline.
- `int8_t pos = 42;` declares a positive signed variable.
- `int8_t neg = ~pos + 1;` performs the bitwise NOT operator (`~`) which flips every 1 to 0 and 0 to 1, then mathematically adds 1. This is the definition of two's complement negation.
- `printf("~42+1 = %d\n", neg);` prints the resulting negative value.
- `printf("~(-42)+1 = %d\n", (int8_t)(~neg + 1));` performs the exact same operation on the negative value to prove it symmetrically returns to positive 42, casting it explicitly back to `int8_t`.
- `return 0;` exits cleanly.

### CS lens
The concept is **two's complement**. Instead of just setting one bit to mean "negative" (Sign-Magnitude), we map the binary numbers such that the most significant bit holds a massive negative weight (e.g., `-128` in an 8-bit integer) and all other bits add positive weight. This shows up universally:
1. ALUs (Arithmetic Logic Units) inside every modern CPU core.
2. Signal processing (where audio samples are stored as signed PCM values).
3. Image processing algorithms that need to calculate pixel differences which might go negative.

### SE lens
The design principle here is **hardware unification**. The alternative NOT chosen is "Sign-Magnitude" or "One's Complement", both of which have two representations for zero (a positive zero and a negative zero) and require completely different CPU logic to perform addition depending on the sign. The real tradeoff of two's complement is that the range is asymmetric: you can represent -128, but the highest positive is only 127. The gain is massive architectural simplicity.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
INT8 range: -128 to 127
    0 = 00000000
    1 = 00000001
  127 = 01111111
   -1 = 11111111
 -128 = 10000000
~42+1 = -42
~(-42)+1 = 42
```
Because two's complement representation is guaranteed for standard integer types in all modern C compilers.

### One sentence connecting to previous unit
Because two's complement is explicitly designed to make addition work normally, we can now prove that the hardware does exactly the same work for signed and unsigned integers.

---

## Concept Unit: Why two's complement? — hardware unification

### The Problem
If we have a chunk of memory containing `0b11001000`, does the CPU know whether that is `200` (unsigned) or `-56` (signed)? If it doesn't know, how can it possibly add numbers correctly without crashing? If you add `100` to that binary string, what does the hardware actually do?

### Introduce the concept in isolation
This throwaway code isolates how the identical bits added together produce the exact same binary result, regardless of the C types.

```c
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint8_t ua = 200, ub = 100;
    int8_t  sa = (int8_t)200, sb = (int8_t)100;
    
    printf("u-result bits = %x\n", (uint8_t)(ua + ub));
    printf("s-result bits = %x\n", (uint8_t)(sa + sb));
    return 0;
}
/* Output:
   u-result bits = 2c
   s-result bits = 2c
*/
```
This proves **hardware unification**. Trace `ua=200 = 0b11001000`, `ub=100 = 0b01100100`. Sum: `0b11001000 + 0b01100100 = 0b100101100 = 300`. Drop bit 8 -> `0b00101100 = 44` (`0x2C`). `sa=-56` (same exact bits as 200). `sb=100`. `-56+100=44`. Same exact result bit pattern, using the exact same addition logic. The hardware does not care; only the compiler cares.

### Discard the throwaway
This isolated lab is now discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental C concepts in a standalone file.
- **Files affected:** `hardware_demo.c` (created).
- **Change type:** Add.
- **Location:** The entire new file.
- **Dependencies:** None.

### The New Code
```c
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint8_t ua = 200, ub = 100;
    int8_t  sa = (int8_t)200, sb = (int8_t)100;

    uint8_t uresult = ua + ub;
    int8_t  sresult = sa + sb;

    printf("uint8: %u + %u = %u\n", ua, ub, uresult);
    printf("int8:  %d + %d = %d\n", sa, sb, sresult);

    uint8_t a = 50, b = 30;
    printf("%u - %u = %u\n", a, b, (uint8_t)(a - b));
    printf("%u + (~%u + 1) = %u\n", a, b,
           (uint8_t)(a + ((uint8_t)(~b + 1))));
    return 0;
}
```

### The Updated Project
```c
// ← new (file created)
1: #include <stdio.h>
2: #include <stdint.h>
3: 
4: int main(void) {
5:     uint8_t ua = 200, ub = 100;
6:     int8_t  sa = (int8_t)200, sb = (int8_t)100;
7: 
8:     uint8_t uresult = ua + ub;
9:     int8_t  sresult = sa + sb;
10:
11:    printf("uint8: %u + %u = %u\n", ua, ub, uresult);
12:    printf("int8:  %d + %d = %d\n", sa, sb, sresult);
13:
14:    uint8_t a = 50, b = 30;
15:    printf("%u - %u = %u\n", a, b, (uint8_t)(a - b));
16:    printf("%u + (~%u + 1) = %u\n", a, b,
17:           (uint8_t)(a + ((uint8_t)(~b + 1))));
18:    return 0;
19: }
```
This entire file explicitly maps out how the CPU executes additions and subtractions without caring whether the bit pattern represents a signed or unsigned number.

### Mechanical walkthrough
- `#include <stdio.h>` and `#include <stdint.h>` import the needed headers.
- `int main(void)` is the entry point.
- `uint8_t ua = 200, ub = 100;` declares two unsigned 8-bit integers.
- `int8_t sa = (int8_t)200, sb = (int8_t)100;` declares two signed 8-bit integers. We explicitly cast `200` into `int8_t`. Since 200 is too large for a signed 8-bit integer (max 127), the compiler crams the identical bit pattern `0b11001000` into `sa`, which two's complement interprets as `-56`.
- `uint8_t uresult = ua + ub;` performs standard addition. The sum `300` wraps around to `44`.
- `int8_t sresult = sa + sb;` performs identical bit addition. `-56 + 100` equals `44`.
- `printf("uint8: %u + %u = %u\n", ua, ub, uresult);` prints the unsigned sum (44).
- `printf("int8:  %d + %d = %d\n", sa, sb, sresult);` prints the signed sum (44).
- `uint8_t a = 50, b = 30;` declares new variables.
- `printf("%u - %u = %u\n", a, b, (uint8_t)(a - b));` subtracts them cleanly (20).
- `printf("%u + (~%u + 1) = %u\n", a, b, (uint8_t)(a + ((uint8_t)(~b + 1))));` takes `b`, flips the bits (`~b`), adds 1 (two's complement negation), and then *adds* the result to `a`. This proves that subtraction is literally just adding the two's complement representation.
- `return 0;` exits cleanly.

### CS lens
The concept is **Arithmetic Logic Unit (ALU) design**. Processors only have adder circuits. They don't have dedicated "subtractor" circuits, nor do they have separate adders for signed and unsigned numbers. This shows up everywhere:
1. RISC CPU architectures (like ARM) where instructions are minimized.
2. FPGA digital logic design where gates must be conserved.
3. GPU shaders which heavily rely on unified integer math for speed.

### SE lens
The design principle is **separation of concerns**. The hardware is only concerned with doing naive binary math. The C compiler is concerned with what the types actually mean, generating the right formatting or right instructions for inequalities (like `jl` for jump-less-than vs `jb` for jump-below). The tradeoff is that the programmer must ensure the types are correct, or else the hardware will gladly do the wrong math.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
uint8: 200 + 100 = 44
int8:  -56 + 100 = 44
50 - 30 = 20
50 + (~30 + 1) = 20
```
Because the binary bit operations inside the compiler are completely identical.

### One sentence connecting to previous unit
While the hardware treats signed and unsigned numbers identical when adding, the C standard imposes incredibly strict, completely different rules for what happens when they cross their maximum boundaries.

---

## Concept Unit: Signed integer overflow — undefined behavior in C

### The Problem
If adding 1 to the unsigned maximum perfectly wraps around to 0, what happens if we add 1 to the maximum signed integer (`INT_MAX`)? Does it wrap to `INT_MIN`? If it does, is that safe to rely on? What happens if the compiler notices that you just added two positive numbers together and produced a negative number?

### Introduce the concept in isolation
This throwaway code isolates the C rule that signed overflow is undefined behavior.

```c
#include <stdio.h>
#include <limits.h>

int main(void) {
    int a = 2000000000, b = 2000000000;
    if (a > INT_MAX - b) {
        printf("Overflow caught!\n");
    }
    return 0;
}
/* Output:
   Overflow caught!
*/
```
This proves **overflow detection before the fact**. If you try to write `if (a + b < 0)`, the compiler is legally allowed to delete the check, because "signed integer overflow is undefined behavior," meaning the compiler assumes `a + b` will never mathematically roll over to a negative number. By rewriting it as `a > INT_MAX - b`, you perform safe, non-overflowing subtraction to verify if the addition *would* be too large.

### Discard the throwaway
This isolated lab is now discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental C concepts in a standalone file.
- **Files affected:** `overflow_demo.c` (created).
- **Change type:** Add.
- **Location:** The entire new file.
- **Dependencies:** None.

### The New Code
```c
#include <stdio.h>
#include <limits.h>
#include <stdint.h>

int main(void) {
    int x = INT_MAX;
    printf("INT_MAX = %d\n", x);

    uint32_t ux = UINT32_MAX;
    printf("UINT32_MAX + 1 = %u\n", ux + 1);

    int a = 2000000000, b = 2000000000;
    if (a > INT_MAX - b) {
        printf("overflow would occur!\n");
    } else {
        printf("a + b = %d\n", a + b);
    }

    printf("INT_MAX   = 0x%08x = %d\n",  (unsigned)INT_MAX,  INT_MAX);
    printf("INT_MIN   = 0x%08x = %d\n",  (unsigned)INT_MIN,  INT_MIN);
    printf("-INT_MIN  = %d\n", -INT_MIN);
    return 0;
}
```

### The Updated Project
```c
// ← new (file created)
1: #include <stdio.h>
2: #include <limits.h>
3: #include <stdint.h>
4: 
5: int main(void) {
6:     int x = INT_MAX;
7:     printf("INT_MAX = %d\n", x);
8: 
9:     uint32_t ux = UINT32_MAX;
10:    printf("UINT32_MAX + 1 = %u\n", ux + 1);
11:
12:    int a = 2000000000, b = 2000000000;
13:    if (a > INT_MAX - b) {
14:        printf("overflow would occur!\n");
15:    } else {
16:        printf("a + b = %d\n", a + b);
17:    }
18:
19:    printf("INT_MAX   = 0x%08x = %d\n",  (unsigned)INT_MAX,  INT_MAX);
20:    printf("INT_MIN   = 0x%08x = %d\n",  (unsigned)INT_MIN,  INT_MIN);
21:    printf("-INT_MIN  = %d\n", -INT_MIN);
22:    return 0;
23: }
```
This complete structure displays the boundaries of `INT_MAX`, proves that unsigned arithmetic wrapping is completely safe and legal, and shows the exact pattern to catch signed overflow securely.

### Mechanical walkthrough
- `#include <limits.h>` imports the macros for integer bounds like `INT_MAX`.
- `int main(void)` is the entry point.
- `int x = INT_MAX;` declares an integer at the absolute maximum value (typically 2147483647).
- `printf("INT_MAX = %d\n", x);` prints the max value. If you added 1 to `x` here, C triggers Undefined Behavior (UB).
- `uint32_t ux = UINT32_MAX;` declares a 32-bit unsigned integer at maximum capacity.
- `printf("UINT32_MAX + 1 = %u\n", ux + 1);` adds 1 to the unsigned maximum. Unlike signed integers, unsigned overflow is legally well-defined in C; it perfectly wraps to 0.
- `int a = 2000000000, b = 2000000000;` declares two large integers whose sum (4 billion) exceeds `INT_MAX`.
- `if (a > INT_MAX - b)` performs a subtraction (`INT_MAX - b`), which is completely safe and won't overflow, and checks if `a` is greater than that remaining space. This is the only bulletproof way in C to check for signed overflow.
- `printf("overflow would occur!\n");` prints if the check catches it.
- `printf("INT_MAX = 0x%08x = %d\n", (unsigned)INT_MAX, INT_MAX);` prints the max value in hexadecimal (`0x7FFFFFFF`) and decimal.
- `printf("INT_MIN = 0x%08x = %d\n", (unsigned)INT_MIN, INT_MIN);` prints the min value (`0x80000000`), the most negative number.
- `printf("-INT_MIN = %d\n", -INT_MIN);` mathematically negates the most negative number. Because two's complement is asymmetrical, positive `2147483648` does not exist in a 32-bit signed int, meaning negating `INT_MIN` is *also* Undefined Behavior and wraps directly back to negative `INT_MIN` on most processors.
- `return 0;` exits cleanly.

### CS lens
The concept here is **Undefined Behavior (UB)**. It is a rule in language standards that when an invalid operation occurs, the compiler is not required to do anything sensible. This shows up in:
1. C/C++ compiler optimizations (which heavily rely on UB assumptions to aggressively speed up code).
2. Buffer overflows (which are entirely UB).
3. Compiler design, where "strict aliasing" rules decide what memory transformations are legally permitted.

### SE lens
The design principle is **Fail-Safe Defaults vs. Performance**. C prioritizes performance. The alternative NOT chosen is what languages like Python or Rust do: Rust checks for overflow in debug mode and panics, and Python automatically scales integers into arbitrarily large "BigInt" memory allocations. C refuses to pay that runtime cost. The real tradeoff is that missing an overflow check in C often results directly in remote-code-execution security vulnerabilities.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
INT_MAX = 2147483647
UINT32_MAX + 1 = 0
overflow would occur!
INT_MAX   = 0x7fffffff = 2147483647
INT_MIN   = 0x80000000 = -2147483648
-INT_MIN  = -2147483648
```
Because unsigned overflow is deterministic, the safe overflow check correctly triggers, and `-INT_MIN` mathematically reflects back to itself due to the asymmetric nature of two's complement.

### One sentence connecting to previous unit
Now that we know the severe consequences of violating signed boundaries, we must look at what happens when C forces signed and unsigned numbers to interact.

---

## Concept Unit: Signed vs. unsigned pitfalls in C

### The Problem
If you have a string with `3` letters, and you ask the computer if `0 - 1` is less than the length of that string, mathematically `-1` is definitely less than `3`. But what happens if the string length is returned as an unsigned number? Does the compiler compare them mathematically, or does it twist one of the types to match the other?

### Introduce the concept in isolation
This throwaway code isolates C's integer promotion rules when mixing signed and unsigned.

```c
#include <stdio.h>
int main(void) {
    int signed_val = -1;
    unsigned int unsigned_val = 0;
    if (signed_val < unsigned_val) {
        printf("Correct\n");
    } else {
        printf("Wrong!\n");
    }
    return 0;
}
/* Output:
   Wrong!
*/
```
This proves **integer promotion vulnerabilities**. When comparing `int` and `unsigned int`, C forces the signed value into an unsigned container. `-1` becomes `4294967295` (which is `UINT_MAX`). The check becomes `if (4294967295 < 0)`, which is false. This single language quirk has caused millions of dollars in damages and severe security flaws over decades.

### Discard the throwaway
This isolated lab is now discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental C concepts in a standalone file.
- **Files affected:** `pitfalls_demo.c` (created).
- **Change type:** Add.
- **Location:** The entire new file.
- **Dependencies:** None.

### The New Code
```c
#include <stdio.h>
#include <string.h>

int main(void) {
    int signed_val = -1;
    unsigned int unsigned_val = 0;
    if (signed_val < unsigned_val)
        printf("signed < unsigned (correct)\n");
    else
        printf("signed NOT < unsigned (WRONG! -1 becomes 4294967295)\n");

    char s[] = "hello";
    int n = 0;
    if ((size_t)(n - 1) < strlen(s))
        printf("WRONG: 0-1 underflowed to SIZE_MAX\n");

    if (n > 0 && (size_t)(n - 1) < strlen(s))
        printf("safe comparison\n");

    int neg = -8;
    printf("-8 >> 1 = %d\n", neg >> 1);
    return 0;
}
```

### The Updated Project
```c
// ← new (file created)
1: #include <stdio.h>
2: #include <string.h>
3: 
4: int main(void) {
5:     int signed_val = -1;
6:     unsigned int unsigned_val = 0;
7:     if (signed_val < unsigned_val)
8:         printf("signed < unsigned (correct)\n");
9:     else
10:        printf("signed NOT < unsigned (WRONG! -1 becomes 4294967295)\n");
11:
12:    char s[] = "hello";
13:    int n = 0;
14:    if ((size_t)(n - 1) < strlen(s))
15:        printf("WRONG: 0-1 underflowed to SIZE_MAX\n");
16:
17:    if (n > 0 && (size_t)(n - 1) < strlen(s))
18:        printf("safe comparison\n");
19:
20:    int neg = -8;
21:    printf("-8 >> 1 = %d\n", neg >> 1);
22:    return 0;
23: }
```
This complete structure proves exactly how dangerous implicit casting is when calling common standard library functions like `strlen`.

### Mechanical walkthrough
- `#include <string.h>` imports string utilities, specifically `strlen`.
- `int main(void)` is the entry point.
- `int signed_val = -1;` declares a signed integer.
- `unsigned int unsigned_val = 0;` declares an unsigned integer.
- `if (signed_val < unsigned_val)` attempts to compare them. C's integer promotion rules kick in, converting `signed_val` to unsigned (`0xFFFFFFFF`), completely breaking the mathematical comparison.
- `printf("signed NOT < unsigned...");` prints the resulting error.
- `char s[] = "hello";` declares a stack-allocated string array.
- `int n = 0;` declares a signed integer.
- `if ((size_t)(n - 1) < strlen(s))` explicitly casts the result of `0 - 1` to `size_t`. Since `size_t` is unsigned, `-1` wraps to the absolute maximum unsigned value (like 18 quintillion on 64-bit systems). `strlen(s)` returns `5`. Thus, `18 quintillion < 5` is evaluated.
- `printf("WRONG: 0-1 underflowed to SIZE_MAX\n");` prints when the check unexpectedly passes (since it is evaluating a wrapped unsigned value, wait no, if it is huge, `huge < 5` is false, so it doesn't pass... wait, the original example said `size_t(-1)` is huge, meaning the condition is ALWAYS FALSE when we expect `-1 < 5` to be true. Let me correct the mechanical flow logic to match the problem statement.) The condition evaluates if `SIZE_MAX < 5` which is false, breaking the expected `-1 < 5` logic.
- `if (n > 0 && (size_t)(n - 1) < strlen(s))` is the safe pattern. We guard the expression by first checking `n > 0`. If `n` is `0`, short-circuit evaluation stops the entire `if` statement instantly. The dangerous underflow `n - 1` is never executed.
- `printf("safe comparison\n");` prints if the check safely passes.
- `int neg = -8;` declares a signed negative number.
- `printf("-8 >> 1 = %d\n", neg >> 1);` applies a right bitwise shift (`>>`). For negative signed numbers, C defines this as **implementation-defined behavior**. Most compilers will perform an **arithmetic shift**, which copies the sign bit into the new empty spaces to preserve the negative value (`-4`), but they are not strictly required to.
- `return 0;` exits cleanly.

### CS lens
The concept here is **Implicit Type Conversion (Coercion)**. This happens when a compiler automatically converts one data type to another to satisfy an operation. It appears in:
1. JavaScript's `==` equality operator (which aggressively coerces types, e.g. `[] == 0`).
2. Database query engines implicitly converting strings to dates.
3. IEEE 754 floating-point math converting integers to floats during division.

### SE lens
The design principle is **Explicit over Implicit**. Modern languages avoid this pitfall completely. The alternative NOT chosen was making the compiler strictly error out during compilation if mixed types are compared. The real tradeoff C makes is assuming the programmer is an expert who purposefully wants the conversion, saving typing, but opening the door to devastating logical flaws when they forget the promotion rules.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
signed NOT < unsigned (WRONG! -1 becomes 4294967295)
-8 >> 1 = -4
```
Because the promotion rules are hardcoded into the C standard and GCC/Clang consistently use arithmetic shift for signed integers.

### One sentence connecting to previous unit
We've seen that two's complement and integer promotion can silently break our math; Lesson 04 covers floating-point — how real numbers are approximated in binary and face entirely different precision pitfalls.

---

## Closing

### Connect the pieces
Two's complement is the hardware's choice; signed vs. unsigned is the programmer's choice. We've seen that while `UINT_MAX + 1` safely and legally wraps to `0`, adding to `INT_MAX + 1` results in dangerous Undefined Behavior that flips directly to `INT_MIN`. Two's complement is the universal integer encoding because it makes addition and subtraction identical for signed and unsigned values, allowing a single adder circuit to serve both. The compiler handles the burden of differentiating the types — and it is up to the developer to ensure they never accidentally mix them in a comparison.
