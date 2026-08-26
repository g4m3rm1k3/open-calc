# Lesson 02: Bits, Bytes, and Binary Representation

**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 0 — The Machine
**Language:** C

**What you need to know first:** Lessons 00–01 (the tour, C fundamentals).

**What you will build:** The reader will understand how all data is stored as bits, convert between binary/hex/decimal fluently, and use C's bitwise operators to manipulate individual bits. The transferable insight: the computer has no idea what your data "means" — it only stores and moves bits. The meaning (integer, float, char, pointer) comes entirely from how you INTERPRET those bits. This is the deepest insight in systems programming.

## Objects and Methods

*   **Bit**
    *   **What it is:** A single binary digit, either 0 or 1.
    *   **Implementation:** Stored electronically in computer memory or processing registers.
    *   **Its use:** To represent the smallest unit of data in computing.
    *   **Type:** Fundamental unit.
    *   **Responsibility:** To hold a binary state.
    *   **Depends on:** Underlying hardware support.
    *   **Connects to:** Groups of bits (bytes, words).
    *   **Shape:** `0` or `1`.

*   **Byte**
    *   **What it is:** A grouping of 8 bits.
    *   **Implementation:** Processors address memory at the byte level.
    *   **Its use:** To store small integer values or ASCII characters.
    *   **Type:** Basic memory unit.
    *   **Responsibility:** Grouping bits into an addressable chunk.
    *   **Depends on:** CPU architecture (most use 8-bit bytes).
    *   **Connects to:** Memory addresses, larger data types.
    *   **Shape:** 8 consecutive bits (e.g., `00000000` to `11111111`).

*   **Address**
    *   **What it is:** A non-negative integer identifying a specific byte in memory.
    *   **Implementation:** Handled by the hardware's memory management unit.
    *   **Its use:** To locate where data is stored in RAM.
    *   **Type:** Memory pointer.
    *   **Responsibility:** Uniquely identifying a memory location.
    *   **Depends on:** The computer's address bus width.
    *   **Connects to:** Pointers, memory cells.
    *   **Shape:** A numeric value, typically written in hexadecimal (e.g., `0x7ffd1234`).

*   **Bitwise AND (`&`)**
    *   **What it is:** An operator that performs a logical AND on every pair of corresponding bits.
    *   **Implementation:** Native CPU instruction.
    *   **Its use:** Masking out bits (clearing bits).
    *   **Type:** Binary operator.
    *   **Responsibility:** Returning 1 in a bit position only if both operands have a 1 there.
    *   **Depends on:** Operands being integers.
    *   **Connects to:** Masking idioms.
    *   **Shape:** `a & b`.

*   **Bitwise OR (`|`)**
    *   **What it is:** An operator that performs a logical OR on every pair of corresponding bits.
    *   **Implementation:** Native CPU instruction.
    *   **Its use:** Setting specific bits to 1.
    *   **Type:** Binary operator.
    *   **Responsibility:** Returning 1 in a bit position if at least one operand has a 1 there.
    *   **Depends on:** Operands being integers.
    *   **Connects to:** Masking idioms.
    *   **Shape:** `a | b`.

*   **Bitwise XOR (`^`)**
    *   **What it is:** An operator that performs a logical Exclusive-OR on every pair of corresponding bits.
    *   **Implementation:** Native CPU instruction.
    *   **Its use:** Toggling bits.
    *   **Type:** Binary operator.
    *   **Responsibility:** Returning 1 if exactly one operand has a 1 in that position.
    *   **Depends on:** Operands being integers.
    *   **Connects to:** Masking idioms, cryptography.
    *   **Shape:** `a ^ b`.

*   **Bitwise NOT (`~`)**
    *   **What it is:** An operator that flips every bit of its operand.
    *   **Implementation:** Native CPU instruction.
    *   **Its use:** Creating inverted masks.
    *   **Type:** Unary operator.
    *   **Responsibility:** Turning 0s into 1s and 1s into 0s.
    *   **Depends on:** Operand being an integer.
    *   **Connects to:** Clear mask idioms.
    *   **Shape:** `~a`.

*   **Left Shift (`<<`)**
    *   **What it is:** An operator that shifts bits to the left, padding with zeros on the right.
    *   **Implementation:** Native CPU shift instruction.
    *   **Its use:** Fast multiplication by powers of two; creating single-bit masks.
    *   **Type:** Binary operator.
    *   **Responsibility:** Moving bit patterns leftward.
    *   **Depends on:** Operands being integers.
    *   **Connects to:** Masking.
    *   **Shape:** `a << k`.

*   **Logical AND (`&&`)**
    *   **What it is:** An operator that evaluates whole operands for truthiness (non-zero).
    *   **Implementation:** Short-circuit evaluation logic.
    *   **Its use:** Boolean logic.
    *   **Type:** Logical operator.
    *   **Responsibility:** Returning 1 if both sides are non-zero, else 0.
    *   **Depends on:** Control flow.
    *   **Connects to:** `if` statements.
    *   **Shape:** `a && b`.

*   **Fixed-width integer types (`int32_t`, `uint8_t`, etc.)**
    *   **What it is:** Types that guarantee exactly N bits of width.
    *   **Implementation:** Defined via `typedef` in `<stdint.h>`.
    *   **Its use:** Ensuring sizes across different platforms.
    *   **Type:** Type definition.
    *   **Responsibility:** Providing portability.
    *   **Depends on:** The `<stdint.h>` header.
    *   **Connects to:** Cross-platform systems code.
    *   **Shape:** `intN_t` or `uintN_t`.


---

### Concept Unit: Binary and hexadecimal

Computers operate internally using binary (base-2) numbers. The digits of a binary number are 0 and 1, and each digit is called a BIT. 8 bits make up 1 BYTE.

**Converting binary to decimal:**
```text
0b10110011 = 128 + 32 + 16 + 2 + 1 = 179
Position:    7    5    4    1   0
Value:       2^7  2^5  2^4  2^1 2^0
```

**Hexadecimal (base-16):**
Hexadecimal makes it much easier to write and read binary because each hex digit represents exactly 4 bits (a nibble). The digits are 0–9 and A–F.
```text
Hex digit | Binary | Decimal
    0     |  0000  |   0
    1     |  0001  |   1
    ...   |  ...   |  ...
    9     |  1001  |   9
    A     |  1010  |  10
    B     |  1011  |  11
    C     |  1100  |  12
    D     |  1101  |  13
    E     |  1110  |  14
    F     |  1111  |  15
```

**Converting:**
- Converting `0xB3` to binary: B=1011, 3=0011 → `10110011` = 179 decimal.
- Converting 255 to hex: 255 = 15*16 + 15 = `0xFF`.
- Converting 256 to hex: 256 = 1*256 + 0 = `0x100`.

**Throwaway Lab:**
Let's see this in code. We discard this program after writing it.

```c
#include <stdio.h>

int main(void)
{
    int a = 0xB3;       /* hex literal = 179 decimal */
    int b = 0b10110011; /* binary literal (gcc extension) = 179 */
    int c = 179;
    
    printf("%d %d %d\n", a, b, c);   
    printf("%x\n", a);  
    printf("%X\n", a);  
    printf("%#x\n", a); 
    return 0;
}
```

**Output Trace:**
```text
179 179 179
b3
B3
0xb3
```
*   `%d` prints the decimal representation. All variables hold the same underlying value.
*   `%x` prints the lowercase hex representation.
*   `%X` prints the uppercase hex representation.
*   `%#x` prints the lowercase hex representation with the `0x` prefix.

---

### Concept Unit: Bytes and memory addresses

Memory is conceptualized as an enormous array of bytes. Each byte has an ADDRESS — a non-negative integer starting at 0.

**Throwaway Lab:**
Let's print some addresses and sizes of standard C types.

```c
#include <stdio.h>

int main(void)
{
    char  c = 'A';        /* 1 byte at some address, say 0x7ffd1234 */
    int   i = 0x12345678; /* 4 bytes at some address */

    printf("%p\n", (void*)&c);  
    printf("%p\n", (void*)&i);  
    printf("%zu\n", sizeof(c)); 
    printf("%zu\n", sizeof(i)); 
    return 0;
}
```

**Output Trace:**
```text
0x7ffd1234
0x7ffd1238
1
4
```
*(Note: Actual printed addresses will vary on every run due to Address Space Layout Randomization (ASLR), but `sizeof` will consistently output 1 and 4.)*

*   `&c` is the address-of operator. It returns the memory address where the variable is stored.
*   `(void*)` cast is necessary when printing addresses with the `%p` format specifier.

**Endianness:**
When an integer takes up multiple bytes (like `i = 0x12345678`), how is it stored?
x86-64 processors use **little-endian** byte order, meaning the least-significant byte is stored first (at the lowest address).
```text
Address:  0x...00  0x...01  0x...02  0x...03
Byte:       0x78     0x56     0x34     0x12
```
Network protocols, however, use **network byte order**, which is **big-endian** (most-significant byte first).

---

### Concept Unit: Bitwise operators in C

C provides operators that manipulate the raw bits of integers directly.

**Throwaway Lab:**
Let's see bitwise AND, OR, XOR, NOT, and bit shifts in action.

```c
#include <stdio.h>

int main(void)
{
    unsigned int a = 0x0F;  /* 00001111 */
    unsigned int b = 0x35;  /* 00110101 */

    printf("%#x\n", a & b); 
    printf("%#x\n", a | b); 
    printf("%#x\n", a ^ b); 
    printf("%#x\n", ~a);    

    /* Shift operators */
    unsigned int x = 0x01;  /* 00000001 */
    printf("%#x\n", x << 3); 
    printf("%#x\n", x << 7); 

    unsigned int y = 0x80;   /* 10000000 */
    printf("%#x\n", y >> 3); 

    return 0;
}
```

**Output Trace:**
```text
0x5
0x3f
0x3a
0xfffffff0
0x8
0x80
0x10
```

*   **AND (`&`)**: `00001111 & 00110101 = 00000101` (`0x05`). Both bits must be 1.
*   **OR (`|`)**: `00001111 | 00110101 = 00111111` (`0x3f`). At least one bit must be 1.
*   **XOR (`^`)**: `00001111 ^ 00110101 = 00111010` (`0x3a`). Exactly one bit must be 1.
*   **NOT (`~`)**: `~00001111 = ...11110000` (`0xfffffff0` for 32-bit int). Flips all bits.
*   **Left Shift (`<<`)**: Shifting left by `k` is equivalent to multiplying by `2^k`.
    *   `x << 3` shifts `00000001` to `00001000` (`0x08`, or 8).
    *   `x << 7` shifts `00000001` to `10000000` (`0x80`, or 128).
*   **Right Shift (`>>`)**: Shifting right by `k` is equivalent to dividing by `2^k`.
    *   `y >> 3` shifts `10000000` to `00010000` (`0x10`, or 16).
    *   For `unsigned` values, right shifting is **logical** (fills the left with 0s). For `signed` values, right shifting is implementation-defined but usually **arithmetic** (sign-extends the leftmost bit). Always use `unsigned` types for bitwise manipulation to avoid undefined or implementation-defined behavior.

---

### Concept Unit: Masking — reading and setting individual bits

Masking is the technique of using a specific bit pattern (the "mask") and a bitwise operator to extract, set, clear, or toggle specific bits within a value.

**Throwaway Lab:**
We use masks to manage individual flags inside a single byte.

```c
#include <stdio.h>

int main(void)
{
    unsigned char flags = 0b10110100;  /* 8 flags packed in 1 byte */

    /* Test bit 2 (0-indexed from LSB) */
    unsigned char mask_bit2 = 1 << 2;  /* 0b00000100 */
    int bit2_set = (flags & mask_bit2) != 0;
    printf("bit 2 is %s\n", bit2_set ? "set" : "clear"); 

    /* Set bit 0 */
    flags = flags | (1 << 0);   /* OR with 00000001 */
    printf("%#x\n", flags);     

    /* Clear bit 4 */
    flags = flags & ~(1 << 4);  /* AND with 11101111 */
    printf("%#x\n", flags);     

    /* Toggle bit 5 */
    flags = flags ^ (1 << 5);   /* XOR with 00100000 */
    printf("%#x\n", flags);     

    return 0;
}
```

**Output Trace:**
```text
bit 2 is set
0xb5
0xa5
0x85
```

**Explanation of Idioms:**
*   **Test bit k**: `(x & (1 << k)) != 0`. The mask `1 << k` has a 1 only at bit `k`. The bitwise AND wipes out all other bits. If the result is non-zero, bit `k` was originally 1.
*   **Set bit k**: `x | (1 << k)`. The OR operator forces bit `k` to 1 while leaving all other bits unaffected.
*   **Clear bit k**: `x & ~(1 << k)`. The mask `~(1 << k)` has 1s everywhere except at bit `k` (which is 0). The AND operator forces bit `k` to 0 and leaves the rest unaffected.
*   **Toggle bit k**: `x ^ (1 << k)`. The XOR operator flips the bit at position `k` and leaves the rest unaffected.

These idioms are pervasive in device drivers, network protocols, and all forms of systems programming.

---

### Concept Unit: Boolean operations vs bitwise operations

A very common and dangerous mistake is confusing bitwise operators (`&`, `|`) with logical operators (`&&`, `||`).

**Throwaway Lab:**
Let's see how they treat the same values differently.

```c
#include <stdio.h>

int main(void)
{
    /* Bitwise: operates on EVERY bit */
    printf("%d\n", 0x41 & 0x0F);  
    printf("%d\n", 0x00 | 0x41);  

    /* Logical: treats operand as whole (0=false, non-zero=true), returns 0 or 1 */
    printf("%d\n", 0x41 && 0x0F); 
    printf("%d\n", 0x00 || 0x41); 
    printf("%d\n", !0x41);        
    printf("%d\n", !0x00);        

    /* Common mistake: using & when you mean && */
    int x = 2;  /* binary: 10 */
    int y = 1;  /* binary: 01 */
    printf("%d\n", x & y);   
    printf("%d\n", x && y);  
    return 0;
}
```

**Output Trace:**
```text
1
65
1
1
0
1
0
1
```

*   **Bitwise** (`&` and `|`) operate on every single bit position individually. `0x41 & 0x0F` checks bit-by-bit: `01000001 & 00001111 = 00000001` (1).
*   **Logical** (`&&` and `||`) treat the entire value as a single boolean entity where `0` is false and ANY non-zero value is true. `0x41 && 0x0F` evaluates as `true && true`, yielding 1.
*   Mixing them is a dangerous bug: `2 & 1` is 0 (false), while `2 && 1` is 1 (true).

---

### Concept Unit: The sizeof operator and type sizes in practice

Standard C types like `int` and `long` do not have guaranteed sizes across platforms. In systems programming, exact bit widths matter.

**Throwaway Lab:**
Let's look at the fixed-width integer types provided by `<stdint.h>`.

```c
#include <stdio.h>
#include <stdint.h>  /* int8_t, int16_t, int32_t, int64_t, uint8_t, etc. */

int main(void)
{
    /* Fixed-width types from <stdint.h>: the right choice for systems code */
    printf("%zu\n", sizeof(int8_t));   
    printf("%zu\n", sizeof(int16_t));  
    printf("%zu\n", sizeof(int32_t));  
    printf("%zu\n", sizeof(int64_t));  
    printf("%zu\n", sizeof(uint8_t));  
    printf("%zu\n", sizeof(uint64_t)); 

    /* Maximum values */
    printf("%lld\n", (long long)INT64_MAX);  
    printf("%llu\n", (unsigned long long)UINT64_MAX); 
    return 0;
}
```

**Output Trace:**
```text
1
2
4
8
1
8
9223372036854775807
18446744073709551615
```

When writing OS code, drivers, or network protocols, always use `<stdint.h>` types:
*   Use `int32_t` instead of `int`.
*   Use `uint8_t` instead of `char` when manipulating raw byte buffers.
*   These types guarantee absolute bit widths regardless of the platform, preventing subtle cross-platform memory bugs.

---

### Concept Unit: How a C string is stored as bytes

Finally, let's explore how text strings are stored in memory.

**Throwaway Lab:**
We inspect the individual bytes of a string array.

```c
#include <stdio.h>

int main(void)
{
    char s[] = "hello";  /* 6 bytes: h, e, l, l, o, \0 */

    printf("Length of string: %zu\n", sizeof(s) - 1); 
    printf("sizeof(s):        %zu\n", sizeof(s));      

    /* Print each byte as hex */
    for (int i = 0; i < (int)sizeof(s); i++) {
        printf("s[%d] = '%c' = 0x%02x = %d\n",
               i, s[i] ? s[i] : '?', (unsigned char)s[i], (unsigned char)s[i]);
    }
    return 0;
}
```

**Output Trace:**
```text
Length of string: 5
sizeof(s):        6
s[0] = 'h' = 0x68 = 104
s[1] = 'e' = 0x65 = 101
s[2] = 'l' = 0x6c = 108
s[3] = 'l' = 0x6c = 108
s[4] = 'o' = 0x6f = 111
s[5] = '?' = 0x00 = 0
```

A C string is an array of `char` bytes terminated by a NUL byte (`\0` = `0x00`).
*   There is no separate length stored in memory. The NUL byte is the sole marker C uses to know where the string ends.
*   Functions like `strcpy` rely on this NUL byte. If `strcpy` does not perform bounds checking, it will copy bytes indefinitely until it hits a `0x00` in memory, which may overwrite other memory regions (a classic buffer overflow vulnerability).

---

### Closing

Bits are the atoms of computing. Every program you have ever written — Python, Java, JavaScript — was compiled or interpreted into bit patterns. Understanding bits means understanding what the machine actually does. The machine does not know what an integer, string, or pointer is; it only shifts and moves bits. The meaning comes entirely from our interpretation of them.

**Next:** Lesson 03 covers how integers work at the bit level: two's complement, overflow, and the dangerous implicit conversions.

**Exercises:**
1.  Convert `0xDEADBEEF` to binary by breaking it into 8 hex digits and converting each to 4 bits.
2.  Write the masking code to extract bits 4-7 from a given byte (using `>>` and `&`).
3.  Predict the output of `printf("%d\n", ~0)` for a 32-bit int and verify by tracing.
