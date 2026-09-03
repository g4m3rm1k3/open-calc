# Lesson 02: Bits, Bytes, and Binary — How Data Is Stored

What you will build: The reader will understand how all data — integers, floats, characters, pointers — is stored as bits and bytes, what hexadecimal is and why systems programmers use it, how byte ordering (endianness) works, and how C's bitwise operators manipulate individual bits. The transferable insight: the computer has no concept of 'type' — it only has bits. Every type is a human interpretation of a bit pattern. This is why C lets you reinterpret any bit pattern as any type (with `memcpy` or pointer casts), and why type mistakes are so dangerous.

What you need to know first: Lesson 00, Lesson 01.

Terms used in this lesson:
- **Bit** — A single binary digit (0 or 1), the fundamental unit of information in a computer, representing a two-state physical reality like voltage high/low.
- **Byte** — A sequence of 8 bits, the smallest addressable unit of memory in modern architectures, allowing us to store values from 0 to 255.
- **Binary** — Base-2 numeral system, the native language of the machine, where each position represents a power of 2, because hardware is built from simple on/off switches.
- **Hexadecimal** — Base-16 numeral system, using 0-9 and A-F, created by systems programmers as a compact, human-readable shorthand for binary, where one hex digit precisely equals 4 bits (a nibble).
- **Endianness** — The order in which a computer architecture sequences the bytes of a multi-byte value in memory (little-endian places the least significant byte at the lowest address, big-endian at the highest), solving the physical necessity of mapping a 32-bit or 64-bit value into 8-bit memory slots.
- **Bitwise Operator** — C operators (`&`, `|`, `^`, `~`, `<<`, `>>`) that operate directly on the individual bits of an integer, providing the hardware-level control needed for systems programming and hardware interaction.
- **Pointer Cast** — The act of converting a pointer of one type to a pointer of another type, which tells the compiler to reinterpret the bytes at that memory address according to the new type's rules.

Objects and methods used:
- **`printf`**
  - *What it is:* A standard library function that formats and prints data to standard output.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used in this lesson to print decimal, hexadecimal, and binary-derived values to prove bit patterns to the reader.
  - *Type:* A standard library variadic function.
  - *Responsibility:* Takes a format string and a variable number of arguments, converts them to their string representations according to the format specifiers, and writes the result to stdout.
  - *Depends on:* The `<stdio.h>` header, an active standard output stream, and arguments matching the format string.
  - *Connects to:* Called by our `main` function; connects to the operating system's write syscalls to output text.
  - *Shape:* An external standard library API boundary.
- **`memcpy`**
  - *What it is:* A standard library function that copies a block of memory from one location to another, byte by byte, ignoring C's type system entirely.
  - *Implementation:* `void *memcpy(void *dest, const void *src, size_t n);`
  - *Its use:* Used in this lesson to safely reinterpret the bit pattern of a float as an integer without triggering undefined behavior from strict aliasing rules.
  - *Type:* A standard library function.
  - *Responsibility:* Unconditionally copies `n` bytes from the memory address at `src` to the memory address at `dest`, regardless of what data types live there.
  - *Depends on:* The `<string.h>` header, valid memory pointers for `dest` and `src`, and an accurate byte count `n`.
  - *Connects to:* Called by our code; interacts directly with physical memory, often optimized into direct CPU vector instructions.
  - *Shape:* An internal utility function acting across the memory space.
- **`uint8_t`**
  - *What it is:* An exact-width unsigned integer type guaranteeing exactly 8 bits of storage, explicitly defining the size rather than leaving it up to the compiler.
  - *Implementation:* `typedef unsigned char uint8_t;`
  - *Its use:* Used as the precise type to represent a single byte when inspecting memory.
  - *Type:* A standard type definition (typedef).
  - *Responsibility:* Provides a uniform, cross-platform way to declare an 8-bit unsigned integer, avoiding the variable size of standard `char` or `int`.
  - *Depends on:* The `<stdint.h>` header.
  - *Connects to:* Used universally as the fundamental array type when viewing raw memory buffers.
  - *Shape:* A standard primitive type alias.
- **`uint32_t`**
  - *What it is:* An exact-width unsigned integer type guaranteeing exactly 32 bits (4 bytes) of storage.
  - *Implementation:* `typedef unsigned int uint32_t;`
  - *Its use:* Used to represent a 4-byte value to observe endianness and store 32-bit bit patterns.
  - *Type:* A standard type definition.
  - *Responsibility:* Guarantees a 32-bit unsigned integer across all platforms.
  - *Depends on:* The `<stdint.h>` header.
  - *Connects to:* Used when interacting with APIs or defining variables that strictly require a 32-bit width.
  - *Shape:* A standard primitive type alias.
- **`size_t`**
  - *What it is:* An unsigned integer type resulting from the `sizeof` operator, large enough to contain the size in bytes of the largest possible object.
  - *Implementation:* `typedef unsigned long size_t;` (varies by architecture)
  - *Its use:* Used as the type for the byte count parameter in `memcpy` and iteration boundaries for memory sizes.
  - *Type:* A standard type definition.
  - *Responsibility:* Safely represents the size of objects and memory blocks without risk of negative values or overflow on large architectures.
  - *Depends on:* The `<stddef.h>` or `<string.h>` header.
  - *Connects to:* Memory allocation and manipulation functions.
  - *Shape:* A standard primitive type alias.
- **`__builtin_bswap32`**
  - *What it is:* A compiler built-in function (intrinsic) that reverses the byte order of a 32-bit integer.
  - *Implementation:* `uint32_t __builtin_bswap32(uint32_t x);`
  - *Its use:* Used to explicitly swap the bytes of a 32-bit integer to simulate reading big-endian data on a little-endian machine.
  - *Type:* A compiler intrinsic function (GCC/Clang).
  - *Responsibility:* Emits the CPU's native byte-swapping instruction (like `BSWAP` on x86) to efficiently reverse byte order.
  - *Depends on:* A compiler that supports GNU extensions (GCC, Clang).
  - *Connects to:* Called by our code to alter integer byte layout before or after network/disk I/O.
  - *Shape:* A low-level hardware abstraction built into the compiler.

**Everything else in the file, not this lesson's subject but still explained:**
- **`main`**
  - *What it is:* The entry point of a C program.
  - *Implementation:* `int main(void)`
  - *Its use:* Provides the execution context for our throwaway code.
  - *Type:* A free function required by the C standard.
  - *Responsibility:* The function the C runtime calls to begin program execution; returning from it terminates the program.
  - *Depends on:* The C runtime environment.
  - *Connects to:* Called by the OS loader/C runtime; calls our standard library and custom functions.
  - *Shape:* The primary entry point boundary of the application.

---

## Concept Unit: Bits and binary representation

### The Problem
When we declare a variable `int age = 42;`, how does the computer actually store that "42"? Before looking at the code, what physical mechanism does a computer have to remember anything? If the hardware only has tiny switches that can be "on" or "off" (voltage or no voltage), how would you represent a number as large as 300 using only switches? Try to sketch how you might encode 1, 2, 3, and 4 using combinations of just 0 and 1.

### Introduce the concept in isolation
We will write a small program to extract and print the exact binary sequence representing the integer 42.

```c
#include <stdio.h>
#include <stdint.h>

void print_bits(uint8_t byte) {
    for (int i = 7; i >= 0; i--) {
        printf("%d", (byte >> i) & 1);
    }
    printf("\n");
}

int main(void) {
    printf("42 in binary: ");
    print_bits(42);
    return 0;
}
```

Predicted confidently: 
`42 in binary: 00101010`

What this proves: This is called **Binary** representation. The computer stores the number 42 as exactly the sequence of bits `00101010`. In binary (base-2), each position represents a power of 2, reading from right to left: 1, 2, 4, 8, 16, 32, 64, 128. For 42, the bits at the 32, 8, and 2 positions are set to 1. `32 + 8 + 2 = 42`.

### Discard the throwaway
This isolated lab is discarded and will not be carried into the main project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental bit representation.
- **Files affected:** `src/main.c` (modified)
- **Change type:** Add
- **Location:** Inside `main`, adding a wider 32-bit print function.
- **Dependencies:** None.

### The New Code
```c
void print_bits32(uint32_t val) {
    for (int i = 31; i >= 0; i--) {
        printf("%d", (val >> i) & 1);
        if (i % 8 == 0 && i > 0) printf(" ");
    }
    printf("\n");
}
```

### The Updated Project
```c
// ← new function added above main
1: void print_bits32(uint32_t val) {
2:     for (int i = 31; i >= 0; i--) {
3:         printf("%d", (val >> i) & 1);
4:         if (i % 8 == 0 && i > 0) printf(" ");
5:     }
6:     printf("\n");
7: }
8: 
9: int main(void) {
10:    printf("300 in binary: "); // ← new
11:    print_bits32(300);         // ← new
12:    return 0;
13:}
```
Our `main` file now includes a function `print_bits32` that takes a 32-bit unsigned integer and prints its raw memory layout as 32 ones and zeroes, grouped into bytes, and we use it to print the number 300.

### Mechanical walkthrough
- `void print_bits32(uint32_t val)` — A function declaration taking a `uint32_t` (an exact-width unsigned integer guaranteeing exactly 32 bits of storage). It returns nothing.
- `for (int i = 31; i >= 0; i--)` — A standard `for` loop starting `i` at 31 and decrementing down to 0, representing the 32 bit positions from most-significant to least-significant.
- `printf("%d", ...)` — The `printf` standard library function formats the isolated bit (a 0 or 1) as a decimal integer and prints it to the console.
- `(val >> i)` — The bitwise right-shift operator `>>`. It takes the bits of `val` and shifts them right by `i` positions, moving the target bit down to the 0th (rightmost) position.
- `& 1` — The bitwise AND operator `&` applied with the literal `1`. This isolates the rightmost bit (which we just shifted into place), zeroing out all other bits, so the result is exactly 0 or 1.
- `if (i % 8 == 0 && i > 0)` — The modulo operator `%` checks if `i` is a multiple of 8, and `&&` ensures we don't print a space at the very end. This detects byte boundaries.
- `printf(" ");` — The `printf` standard library function outputs a single space character to visually separate the 8-bit **Byte** chunks.
- `printf("\n");` — The `printf` standard library function prints a newline after all bits are processed.
- `printf("300 in binary: ");` — The `printf` standard library function prints the prefix text for our test.
- `print_bits32(300);` — Calls our new function, passing the literal integer `300`. The C compiler passes this 300 as a 32-bit bit pattern.

### CS lens
This embodies the fundamental CS concept of **Binary Encoding**. The computer has no concept of numbers, only states. Every piece of data is encoded into binary. Also recognized in: ASCII text files where characters map to numeric codes, IP network masks routing packets, boolean algebra in digital logic gates, and pixel color channels in bitmaps.

### SE lens
Design principle: **Fixed-width types over vague types.** We used `uint32_t` instead of `unsigned int`. The alternative not chosen was `unsigned int`, which might be 16 bits on a microcontroller or 32 bits on a PC. The tradeoff is that standard `int` allows the compiler to pick the most efficient size for the architecture, but when manipulating exact bit layouts, that variability introduces severe bugs. We pay a tiny abstraction tax for absolute certainty of width.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
`300 in binary: 00000000 00000000 00000001 00101100`
Reasoning: 300 is composed of 256 + 32 + 8 + 4. In a 32-bit integer, bit 8 (256) is in the second byte from the right. The first byte from the right contains bits 5 (32), 3 (8), and 2 (4), giving `00101100`.

### One sentence connecting to previous unit
Now that we have a way to see exactly what binary bits represent a value, we can look at a much shorter way to read them.

---

## Concept Unit: Hexadecimal — the systems programmer's notation

### The Problem
Binary is extremely verbose. The number 300 took 32 characters (`00000000 00000000 00000001 00101100`) to write out. When reading raw memory dumps or network packets, staring at thousands of 1s and 0s is impossible for humans to parse quickly. How could we compress this representation visually so that it's shorter to read, but still maps perfectly and predictably back to the exact underlying bits without doing complex base-10 math in our heads?

### Introduce the concept in isolation
We will run a snippet to show the same number in decimal, hexadecimal, and split into its hexadecimal components.

```c
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint32_t x = 0xDEADBEEF;
    printf("Decimal: %u\n", x);
    printf("Hex: 0x%08X\n", x);
    return 0;
}
```

Predicted confidently:
`Decimal: 3735928559`
`Hex: 0xDEADBEEF`

What this proves: This is called **Hexadecimal**. A hex literal in C is prefixed with `0x`. Unlike decimal, where you have to do long division to figure out the bits, every single hex digit maps perfectly to exactly 4 bits (a nibble). `D` is `1101`, `E` is `1110`, etc. It is a direct translation layer over binary.

### Discard the throwaway
This isolated lab is discarded and will not be carried into the main project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/main.c` (modified)
- **Change type:** Add
- **Location:** Inside `main`, replacing the previous `print_bits32` calls.
- **Dependencies:** None.

### The New Code
```c
uint32_t x = 0xDEADBEEF;
printf("High byte: 0x%02X\n", (x >> 24) & 0xFF);
printf("Low byte:  0x%02X\n",  x        & 0xFF);
```

### The Updated Project
```c
int main(void) {
    uint32_t x = 0xDEADBEEF;                             // ← new
    printf("High byte: 0x%02X\n", (x >> 24) & 0xFF);     // ← new
    printf("Low byte:  0x%02X\n",  x        & 0xFF);     // ← new
    return 0;
}
```
Our `main` function now declares a 32-bit integer using a hexadecimal literal, and prints the highest 8 bits and the lowest 8 bits as distinct 2-character hex strings, demonstrating how hex maps directly to bytes.

### Mechanical walkthrough
- `uint32_t x` — Declares a variable `x` of type `uint32_t`, an exact-width unsigned integer guaranteeing exactly 32 bits of storage.
- `= 0xDEADBEEF;` — The assignment operator assigns the literal `0xDEADBEEF`. The `0x` prefix tells the C compiler this is a **Hexadecimal** number.
- `printf("High byte: 0x%02X\n", ...)` — The `printf` standard library function is called. The `%02X` format specifier tells it to print the integer argument as an uppercase hexadecimal string, padded with leading zeroes to exactly 2 characters.
- `(x >> 24)` — The bitwise right-shift operator `>>` shifts the bits of `x` right by 24 positions. Since `x` is 32 bits, this moves the top 8 bits down to the bottom 8 bit positions.
- `& 0xFF` — The bitwise AND operator `&` applied with the hexadecimal literal `0xFF` (which is binary `11111111`). This masks out everything except the lowest 8 bits, ensuring we isolate exactly one byte.
- `printf("Low byte:  0x%02X\n", ...)` — The `printf` standard library function formats the second extraction.
- `x & 0xFF` — The bitwise AND operator `&` isolates the lowest 8 bits of `x` directly, without shifting, grabbing the final byte.

### CS lens
This embodies the computational concept of **Base Conversion for Data Density**. Hexadecimal isn't a different type of data; it is an encoding optimized for human pattern recognition over raw bits. Also recognized in: URL encoding (like `%20` for a space), IPv6 addresses, HTML/CSS color codes (`#FF0000`), and cryptographic hash outputs (like a SHA-256 string).

### SE lens
Design principle: **Direct mapping representations.** We use hexadecimal for memory values instead of decimal because decimal obscures the bit boundaries. The alternative not chosen is printing bytes in decimal (e.g., `222 173 190 239`). The tradeoff is that hex requires memorizing the 0-F sequence, but it guarantees that two hex digits exactly equal one byte. In decimal, a byte takes 1 to 3 characters and bit patterns don't align visually.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
`High byte: 0xDE`
`Low byte:  0xEF`
Reasoning: `0xDEADBEEF` is exactly 4 bytes: `DE`, `AD`, `BE`, `EF`. Shifting right 24 bits isolates the `DE`. Masking with `0xFF` on the unshifted value isolates the `EF`.

### One sentence connecting to previous unit
Now that we can compactly represent the bits of a 32-bit integer using hexadecimal, we have to ask how those four individual hex bytes are physically laid out in the computer's memory.

---

## Concept Unit: Byte ordering — endianness

### The Problem
A 32-bit integer like `0x01234567` takes exactly 4 bytes of space. However, computer memory is a vast array of individual 1-byte slots, each with its own sequential address. If we store `0x01234567` starting at memory address 1000, which byte goes into slot 1000? Does the computer store the `01` first because it's on the left, or does it store the `67` first? If a file saved on one computer is opened on another, what happens if the two computers disagree on the order?

### Introduce the concept in isolation
We will write a small program to inspect the memory layout of a 32-bit integer byte-by-byte.

```c
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint32_t test = 0x01234567;
    unsigned char *byte_ptr = (unsigned char *)&test;
    printf("Byte at address 0: 0x%02x\n", byte_ptr[0]);
    return 0;
}
```

Predicted confidently:
`Byte at address 0: 0x67` (Assuming execution on a standard x86-64 machine).

What this proves: This is called **Endianness**. The computer did not store `01` at the lowest address; it stored `67`. Modern Intel/AMD machines are "little-endian," meaning the least-significant byte (the "little" end of the number) is stored at the lowest memory address.

### Discard the throwaway
This isolated lab is discarded and will not be carried into the main project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/main.c` (modified)
- **Change type:** Replace
- **Location:** Inside `main`, replacing the hex parsing code with memory inspection code.
- **Dependencies:** None.

### The New Code
```c
uint32_t x = 0x01234567;
unsigned char *bytes = (unsigned char *)&x;
for (int i = 0; i < 4; i++) {
    printf("%02x ", bytes[i]);
}
printf("\n");

uint32_t big_endian_val = 0x01000000;
uint32_t corrected = __builtin_bswap32(big_endian_val);
printf("swapped: 0x%08x\n", corrected);
```

### The Updated Project
```c
int main(void) {
    uint32_t x = 0x01234567;                                // ← new
    unsigned char *bytes = (unsigned char *)&x;             // ← new
    for (int i = 0; i < 4; i++) {                           // ← new
        printf("%02x ", bytes[i]);                          // ← new
    }                                                       // ← new
    printf("\n");                                           // ← new
    
    uint32_t big_endian_val = 0x01000000;                   // ← new
    uint32_t corrected = __builtin_bswap32(big_endian_val); // ← new
    printf("swapped: 0x%08x\n", corrected);                 // ← new
    return 0;
}
```
Our `main` function now declares a 32-bit integer, uses a pointer cast to view that integer as an array of bytes, prints them in physical memory order, and then uses a compiler intrinsic to forcefully reverse the byte order of a network-style big-endian value.

### Mechanical walkthrough
- `uint32_t x = 0x01234567;` — Declares our 32-bit unsigned integer and assigns it a 4-byte hexadecimal literal.
- `unsigned char *bytes` — Declares a pointer variable named `bytes` pointing to `unsigned char`. An `unsigned char` is exactly one byte, so this sets up a view of memory one byte at a time.
- `= (unsigned char *)&x;` — The address-of operator `&` takes the memory address of `x` (which is a `uint32_t *`). The `(unsigned char *)` is a **Pointer Cast**, forcing the C compiler to treat that memory address not as an integer, but as the start of an array of single bytes.
- `for (int i = 0; i < 4; i++)` — A standard `for` loop iterating 4 times, exactly the number of bytes in a `uint32_t`.
- `printf("%02x ", bytes[i]);` — The `printf` standard library function formats the byte at index `i` as a 2-digit lowercase hex string. Array access `bytes[i]` reads exactly one byte from the physical memory layout, sequentially.
- `printf("\n");` — The `printf` standard library function prints a newline.
- `uint32_t big_endian_val = 0x01000000;` — Declares a 32-bit integer representing a value we might have read from a network packet (where the `01` is visually at the top).
- `uint32_t corrected` — Declares the variable to hold the swapped result.
- `= __builtin_bswap32(big_endian_val);` — Calls the compiler built-in function `__builtin_bswap32`, which generates a specialized CPU instruction to rapidly reverse the bytes of the 32-bit integer, changing `0x01000000` into `0x00000001`.
- `printf("swapped: 0x%08x\n", corrected);` — The `printf` standard library function outputs the swapped 32-bit integer to prove the bits moved.

### CS lens
This embodies the CS concept of **Serialization Layout**. The conceptual value of a number is abstracted from how its pieces are mapped into linear storage. Also recognized in: reading and writing binary file formats (like PNG or WAV headers), parsing TCP/IP network packet headers (which require network byte order / big-endian), struct padding and alignment in memory, and cross-platform IPC (Inter-Process Communication) messaging.

### SE lens
Design principle: **Explicit canonical formats for I/O.** When transferring data between computers, we do not send raw structs. The alternative not chosen is simply writing the 4 bytes of memory directly to the network and reading them directly on the other side. The tradeoff is that if a little-endian machine sends `x` to a big-endian machine, the big-endian machine will read `0x67452301` completely ruining the data. We pay the CPU cost of `__builtin_bswap32` to guarantee that all bytes cross the wire in one strict, predictable order.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
`67 45 23 01`
`swapped: 0x00000001`
Reasoning: On x86-64 (little-endian), the lowest byte `0x67` is at address offset 0. `0x45` is at offset 1. The `__builtin_bswap32` reverses `0x01000000` so the `01` moves from the most significant byte to the least significant byte.

### One sentence connecting to previous unit
Knowing how bytes are ordered in memory is crucial when reading data, but to actively change data at the sub-byte level, we need operators that target the bits directly.

---

## Concept Unit: Bitwise operations in C

### The Problem
Sometimes a boolean flag or a hardware setting only requires 1 bit of information (on/off). Using a whole 8-bit `uint8_t` to store a single true/false wastes 87.5% of the memory. In embedded systems, thousands of flags are packed tightly. If you have an 8-bit variable holding 8 distinct flags, how do you turn on just the 3rd flag without accidentally turning off the 4th flag? Standard addition (`+`) or multiplication (`*`) affects all the bits via carry-over, so standard math won't work. 

### Introduce the concept in isolation
We will write a short script to demonstrate the bitwise OR and AND operators on two 8-bit values.

```c
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint8_t a = 0b10101010;
    uint8_t b = 0b00001111;
    printf("OR:  %02X\n", a | b);
    printf("AND: %02X\n", a & b);
    return 0;
}
```

Predicted confidently:
`OR:  AF`
`AND: 0A`

What this proves: This is called a **Bitwise Operator**. The `|` (OR) operator takes two bit patterns and produces a 1 wherever *either* input has a 1 (`10101010` | `00001111` = `10101111` = `0xAF`). The `&` (AND) operator produces a 1 only where *both* inputs have a 1 (`10101010` & `00001111` = `00001010` = `0x0A`). They operate entirely horizontally on corresponding bit positions without carrying over.

### Discard the throwaway
This isolated lab is discarded and will not be carried into the main project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/main.c` (modified)
- **Change type:** Replace
- **Location:** Inside `main`, replacing the memory inspection code with bit manipulation.
- **Dependencies:** None.

### The New Code
```c
uint32_t flags = 0;
flags |= (1U << 3); 
printf("set bit 3: 0x%x\n", flags);
flags &= ~(1U << 3);
printf("clear bit 3: 0x%x\n", flags);
```

### The Updated Project
```c
int main(void) {
    uint32_t flags = 0;                       // ← new
    flags |= (1U << 3);                       // ← new
    printf("set bit 3: 0x%x\n", flags);       // ← new
    flags &= ~(1U << 3);                      // ← new
    printf("clear bit 3: 0x%x\n", flags);     // ← new
    return 0;
}
```
Our `main` function now declares a 32-bit flags variable initialized to 0, sets exactly the 3rd bit to 1, prints the result, and then completely clears that 3rd bit back to 0 without affecting anything else.

### Mechanical walkthrough
- `uint32_t flags = 0;` — Declares a 32-bit unsigned integer `flags` initialized to all zeroes.
- `flags |=` — The bitwise OR assignment operator `|=`. This takes the current value of `flags`, performs a bitwise OR with the right-hand side, and assigns the result back to `flags`. It is used to *set* bits.
- `(1U << 3)` — The `1U` is an unsigned literal 1. The bitwise left-shift operator `<<` shifts that single 1 bit left by 3 positions, creating the mask `0b00001000` (which is decimal 8).
- `printf("set bit 3: 0x%x\n", flags);` — The `printf` standard library function prints the flags value as hexadecimal.
- `flags &=` — The bitwise AND assignment operator `&=`. This takes the current value of `flags`, performs a bitwise AND with the right-hand side, and assigns it back. It is used to *clear* bits.
- `~(1U << 3)` — The bitwise NOT operator `~` flips every single bit of its operand. `(1U << 3)` is `0b00001000`. The NOT operator flips it to `0b11110111`. When ANDed with `flags`, every bit is ANDed with 1 (leaving it unchanged) except the 3rd bit, which is ANDed with 0 (forcing it to 0).
- `printf("clear bit 3: 0x%x\n", flags);` — The `printf` standard library function prints the cleared result.

### CS lens
This embodies the computational concept of **Bit Masking**. We use specific bit patterns (masks) applied through logical gates (AND/OR/XOR) to selectively read, mutate, or isolate internal state. Also recognized in: file permission bits in Linux (`chmod 755`), graphics programming rendering layers, hardware interrupt masking in operating systems, and parsing packed binary protocols.

### SE lens
Design principle: **Bit packing for memory constraints.** Using bitwise operations allows us to pack 32 distinct boolean values into a single `uint32_t`. The alternative not chosen is an array of 32 `bool` variables. The tradeoff is code readability. The array is trivial to read (`flags[3] = true;`), but consumes 32 bytes in C (a 800% overhead). Bit masking requires complex syntax but minimizes memory footprint and cache-misses, crucial in systems programming.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
`set bit 3: 0x8`
`clear bit 3: 0x0`
Reasoning: `1U << 3` moves the 1 to the 4th position from the right (index 3). In binary that is `1000`, which is 8. ORing 0 with 8 yields 8. Clearing it leaves 0.

### One sentence connecting to previous unit
We can shift and mask integer bits all we want, but eventually we have to reckon with the fact that variables like floating-point numbers are fundamentally different under the hood.

---

## Concept Unit: Reading bytes in memory with memcpy and union tricks

### The Problem
We have seen that an integer like `300` has a predictable bit pattern. But what about a floating-point number like `1.0f`? A float uses a completely different encoding standard (IEEE 754) with a sign bit, an exponent, and a mantissa. If we want to look at the exact raw bit pattern of `1.0f` in C, we can't just assign it to an integer (`int x = 1.0f;`) because the C compiler will politely convert the value `1.0` into the integer `1`, destroying the bit pattern we wanted to inspect. How do we force C to copy the raw bytes without changing them?

### Introduce the concept in isolation
We will write a short block to copy bytes unconditionally between a float and an integer without triggering C's type conversions.

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main(void) {
    float f = 1.0f;
    uint32_t bits;
    memcpy(&bits, &f, 4);
    printf("1.0f raw bits: 0x%08X\n", bits);
    return 0;
}
```

Predicted confidently:
`1.0f raw bits: 0x3F800000`

What this proves: This is called **Memory Reinterpretation**. The `memcpy` standard library function bypasses the compiler's type system entirely. It looks at the physical memory address of `f` and copies exactly 4 bytes to the physical memory address of `bits`. The bits `0x3F800000` are the IEEE 754 encoding for `1.0` (sign=0, exponent=127, mantissa=0).

### Discard the throwaway
This isolated lab is discarded and will not be carried into the main project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/main.c` (modified)
- **Change type:** Replace
- **Location:** Inside `main`, replacing the bitwise flags code.
- **Dependencies:** Include `<string.h>` at the top of the file.

### The New Code
```c
float f = 1.0f;
uint32_t bits;
memcpy(&bits, &f, sizeof(float));
printf("float 1.0 as uint32: 0x%08x\n", bits);
```

### The Updated Project
```c
#include <stdio.h>
#include <stdint.h>
#include <string.h> // ← new dependency

int main(void) {
    float f = 1.0f;                                // ← new
    uint32_t bits;                                 // ← new
    memcpy(&bits, &f, sizeof(float));              // ← new
    printf("float 1.0 as uint32: 0x%08x\n", bits); // ← new
    return 0;
}
```
Our `main` function now declares a standard IEEE-754 floating point number, declares a 32-bit unsigned integer, uses `memcpy` to physically copy the raw bytes from the float into the integer bypassing the compiler's value conversion, and prints the true bit pattern of the float.

### Mechanical walkthrough
- `float f = 1.0f;` — Declares a single-precision floating point variable `f` and assigns it `1.0`. 
- `uint32_t bits;` — Declares an uninitialized 32-bit exact-width unsigned integer `bits` to act as our destination bucket.
- `memcpy(&bits, &f, sizeof(float));` — The `memcpy` standard library function unconditionally copies bytes. It takes the destination memory address `&bits`, the source memory address `&f`, and the number of bytes to copy. 
- `sizeof(float)` — The `sizeof` operator evaluates at compile-time to a `size_t` representing the number of bytes a `float` takes up (which is 4 on this architecture). This ensures we copy exactly the right amount.
- `printf("float 1.0 as uint32: 0x%08x\n", bits);` — The `printf` standard library function formats the copied bits as a zero-padded hexadecimal string and outputs them.

### CS lens
This embodies the computational concept of **Type Punning**. In computer science, data has no inherent meaning; meaning is strictly derived from the instructions that operate on it. Also recognized in: fast inverse square root algorithms (which treat floats as integers to manipulate exponents), network packet parsing where headers are cast dynamically based on byte flags, variant types or tagged unions in dynamic languages, and device drivers interacting with raw hardware registers.

### SE lens
Design principle: **Strict aliasing rules.** C requires that pointers of incompatible types do not point to the same memory. The alternative not chosen is casting the pointer directly: `uint32_t bits = *(uint32_t *)&f;`. The tradeoff is that while pointer casting looks cleaner, modern C compilers aggressively optimize under the assumption that an `int *` and a `float *` never alias (point to the same place). If you violate this, the compiler will generate broken machine code. Using `memcpy` is the standard-compliant, safe way to reinterpret bytes without invoking undefined behavior.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
`float 1.0 as uint32: 0x3f800000`
Reasoning: `1.0` in IEEE 754 single precision has a sign bit of 0. The biased exponent is `0 + 127 = 127`, which is `01111111`. The mantissa is exactly `1.0`, so the fractional part is all 0s. The bits are `0 01111111 00000000000000000000000`, matching `0x3F800000`.

### One sentence connecting to previous unit
By treating a float as a raw array of bytes using memcpy, we prove that all data—no matter the type—is ultimately just bits waiting for the C compiler to give them meaning.

---

## Closing

### Connect the pieces
Trace the number 300 through everything we built today. It starts as a human-readable decimal integer. Under the hood, the C compiler assigns it a **Binary** representation: `00000000 00000000 00000001 00101100`. As systems programmers, we shorten that sequence to **Hexadecimal** as `0x0000012C`. Because our architecture is little-endian, those bytes hit physical memory in reverse **Endianness** order: `2C 01 00 00`. We can use **Bitwise Operators** like `&` to isolate specific bits out of that `01` byte if we need to check flags. And finally, if we didn't want the CPU to treat `0x0000012C` as an integer anymore, we could use `memcpy` to copy those exactly four bytes into a `float` variable, radically reinterpreting the identical underlying bit pattern. The bit pattern is the ground truth; the type is merely a lens that gives it meaning.

Next lesson: Lesson 03.
