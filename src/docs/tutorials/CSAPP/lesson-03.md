# Lesson 03: Integers — Two's Complement, Overflow, and Unsigned

## Header
**Number:** 03
**Title:** Integers — Two's Complement, Overflow, and Unsigned
**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 0 — The Machine
**Language:** C
**What you need to know first:** Lessons 00–02 (tour, C fundamentals, bits and bytes).
**What you will build:** The reader will understand exactly how integers are stored in two's complement binary, why overflow wraps around, the dangerous implicit conversions between signed and unsigned, and the classic bugs that arise from ignoring these rules. The transferable insight: integer arithmetic in C is NOT mathematical arithmetic — it has bounds, wraps around, and converts implicitly in ways that have caused real security vulnerabilities.

## Objects and Methods

* `uint8_t` (and unsigned integers)
  * **What it is:** An unsigned 8-bit integer type provided by `<stdint.h>`.
  * **Implementation:** Stored as an 8-bit binary number where all bits contribute to the positive magnitude.
  * **Its use:** Used for representing non-negative values between 0 and 255.
  * **Type:** Data type.
  * **Responsibility:** Holds positive integers and guarantees wrap-around (modulo) arithmetic.
  * **Depends on:** The underlying machine's byte representation.
  * **Connects to:** Signed integers (via casts) and bitwise operations.
  * **Shape:** 8 bits (1 byte) wide.

* `int8_t` (and signed integers)
  * **What it is:** A signed 8-bit integer type provided by `<stdint.h>`.
  * **Implementation:** Stored using two's complement encoding, where the most significant bit is the sign bit.
  * **Its use:** Used for representing positive and negative values between -128 and 127.
  * **Type:** Data type.
  * **Responsibility:** Represents numbers with signs, making arithmetic intuitive for the hardware.
  * **Depends on:** Two's complement hardware support.
  * **Connects to:** Unsigned integers, integer promotion.
  * **Shape:** 8 bits (1 byte) wide.

## Concept Units

### Concept Unit 1: Unsigned integers — range and wrap-around

An unsigned integer with $w$ bits stores values from $0$ to $2^w - 1$. Unsigned arithmetic is modular arithmetic — modulo $2^w$. The result is always well-defined and correct in C. This wrap-around behavior is strictly defined.

**Throwaway Lab:** Let's see what happens when we exceed the limits of an unsigned 8-bit integer.

```c
#include <stdio.h>
#include <stdint.h>

int main(void)
{
    uint8_t a = 255;   /* 0xFF = 11111111 */
    uint8_t b = a + 1; /* wraps: 256 mod 256 = 0 */
    uint8_t c = 0;
    uint8_t d = c - 1; /* wraps: -1 mod 256 = 255 */

    printf("%u\n", a);  /* 255 */
    printf("%u\n", b);  /* 0   (wrapped around) */
    printf("%u\n", c);  /* 0 */
    printf("%u\n", d);  /* 255 (wrapped around) */
    return 0;
}
```

**Mechanical Trace:**
- Initialize `a` to `255` (binary `11111111`).
- `b` is assigned `a + 1`. Mathematically `256`, which requires 9 bits (`100000000`). Truncated to 8 bits, it becomes `00000000`. `b` becomes `0`.
- Initialize `c` to `0` (binary `00000000`).
- `d` is assigned `c - 1`. Mathematically `-1`. Modulo $2^8$, this wraps around backward to `255` (`11111111`). `d` becomes `255`.
- Print `a`: "255"
- Print `b`: "0"
- Print `c`: "0"
- Print `d`: "255"

**Output:**
```
255
0
0
255
```

**Explanation:** Unsigned arithmetic operates on a number circle: 0 → 1 → 2 → ... → 255 → 0 → 1. When you add 1 to the maximum value, you step forward onto 0. When you subtract 1 from the minimum value, you step backward onto the maximum value. This is **not** undefined behavior in C — unsigned overflow is completely valid, defined behavior.

---

### Concept Unit 2: Two's complement — the signed integer encoding

For $w$ bits, two's complement encodes $-2^{w-1}$ to $2^{w-1} - 1$. The most significant bit (MSB) acts as the sign bit: a `1` means the number is negative, and a `0` means it is non-negative.

Encoding for 8-bit (`int8_t`):
```text
Bit pattern | Unsigned | Two's complement
 00000000   |    0     |      0
 00000001   |    1     |      1
 01111111   |   127    |    127
 10000000   |   128    |   -128
 10000001   |   129    |   -127
 11111110   |   254    |     -2
 11111111   |   255    |     -1
```

**Throwaway Lab:** Let's observe what happens when we overflow a signed integer.

```c
#include <stdio.h>
#include <stdint.h>

int main(void)
{
    int8_t x = 127;    /* 01111111 */
    int8_t y = x + 1;  /* overflow! 01111111 + 1 = 10000000 = -128 */
    printf("%d\n", x);  /* 127 */
    printf("%d\n", y);  /* -128 (signed overflow -- UNDEFINED BEHAVIOR for int) */

    int8_t neg = -1;   /* 11111111 */
    int8_t zero = 0;   /* 00000000 */
    printf("%d\n", neg);   /* -1 */
    printf("%x\n", (uint8_t)neg);  /* ff */
    printf("%d\n", zero);  /* 0 */
    return 0;
}
```

**Mechanical Trace:**
- Initialize `x` to `127` (binary `01111111`).
- `y` is assigned `x + 1`. `01111111` + `00000001` = `10000000`. In two's complement, `10000000` is `-128`. `y` becomes `-128`.
- Print `x`: "127"
- Print `y`: "-128"
- Initialize `neg` to `-1` (binary `11111111`).
- Initialize `zero` to `0` (binary `00000000`).
- Print `neg`: "-1"
- Print `(uint8_t)neg` as hex: "ff"
- Print `zero`: "0"

**Output:**
```
127
-128
-1
ff
0
```

**Explanation:** The MSB governs the sign. When we add 1 to `127` (`01111111`), the carry flips the MSB to `1`, creating `10000000` which represents `-128`. **CRITICAL:** While the math is deterministic at the bit level, signed integer overflow in C is officially **UNDEFINED BEHAVIOR**. For regular `int`, the compiler is legally allowed to assume overflow never happens and optimize your code out. The example using `int8_t` is illustrative. If you explicitly want wrap-around semantics, you must use unsigned integers.

---

### Concept Unit 3: Negation in two's complement — flip and add 1

How does the machine negate a number like `42` to `-42`? It flips all the bits (bitwise NOT) and adds 1.

**Throwaway Lab:** Let's manually perform two's complement negation using bitwise operations.

```c
#include <stdio.h>
#include <stdint.h>

int main(void)
{
    /* To negate x: flip all bits, then add 1 */
    int8_t x = 42;    /* 00101010 */
    /* ~x:        11010101 = -43 (bitwise NOT) */
    /* ~x + 1:    11010110 = -42 (two's complement negation) */
    int8_t neg_x = ~x + 1;
    printf("%d\n", neg_x);  /* -42 */

    /* Special case: -(-128) overflows */
    int8_t min = -128;  /* 10000000 */
    /* ~min = 01111111 = 127 */
    /* ~min + 1 = 10000000 = -128 again! */
    int8_t neg_min = ~min + 1;
    printf("%d\n", neg_min);  /* -128 (overflow: no positive 128 in int8_t) */
    return 0;
}
```

**Mechanical Trace:**
- Initialize `x` to `42` (`00101010`).
- Evaluate `~x`: flips bits to `11010101` (which is `-43`).
- Add 1: `11010101 + 1 = 11010110`. This is the binary representation of `-42`. Assign to `neg_x`.
- Print `neg_x`: "-42".
- Initialize `min` to `-128` (`10000000`).
- Evaluate `~min`: flips bits to `01111111` (`127`).
- Add 1: `01111111 + 1 = 10000000`. Assign to `neg_min`. Wait, `10000000` is `-128`!
- Print `neg_min`: "-128".

**Output:**
```
-42
-128
```

**Explanation:** Negation in two's complement is accomplished via `~x + 1`. This works flawlessly for almost all values, but notice the asymmetry: an 8-bit signed integer spans from `-128` to `127`. The negation of `-128` does not fit in the positive range! Thus, negating `INT_MIN` yields `INT_MIN` back via an overflow. This exact property is why taking `abs(INT_MIN)` is classified as undefined behavior in C.

---

### Concept Unit 4: Sign extension and truncation

Converting between integer types of different widths is a fundamental operation. Widening adds bits, narrowing discards bits. 

**Throwaway Lab:** Let's observe widening and narrowing casting.

```c
#include <stdio.h>
#include <stdint.h>

int main(void)
{
    /* Sign extension: widen a signed value */
    int8_t  small = -1;    /* 11111111 */
    int16_t wide  = small; /* 1111111111111111 -- sign bit extends */
    printf("%d\n", wide);  /* -1 (value preserved) */

    int8_t  pos = 42;      /* 00101010 */
    int16_t wide2 = pos;   /* 0000000000101010 -- zero-extended */
    printf("%d\n", wide2); /* 42 (value preserved) */

    /* Truncation: narrow a value -- HIGH BITS DISCARDED */
    int32_t big = 0x12345678;
    int8_t  cut = (int8_t)big;  /* keep only the low byte: 0x78 = 120 */
    printf("%d\n", cut);  /* 120 */

    int32_t big2 = 0x123456FF;
    int8_t  cut2 = (int8_t)big2; /* keep 0xFF = -1 as int8_t */
    printf("%d\n", cut2); /* -1 */
    return 0;
}
```

**Mechanical Trace:**
- Initialize `small` to `-1` (`11111111`).
- `wide` widens `small` to 16 bits. Because it is signed and the MSB is 1, the new high bits are filled with 1s (`1111111111111111`).
- Print `wide`: "-1".
- Initialize `pos` to `42` (`00101010`).
- `wide2` widens `pos`. Because MSB is 0, new high bits are filled with 0s (`0000000000101010`).
- Print `wide2`: "42".
- Initialize `big` to `0x12345678`.
- `cut` truncates `big` to 8 bits. The high bytes `123456` are dropped, keeping `0x78` (`120` in decimal).
- Print `cut`: "120".
- Initialize `big2` to `0x123456FF`.
- `cut2` truncates `big2` to 8 bits. Keeps `0xFF` (`-1` as a signed 8-bit).
- Print `cut2`: "-1".

**Output:**
```
-1
42
120
-1
```

**Explanation:** **Sign extension** ensures that widening a signed type preserves its numerical value by copying the sign bit into the new higher-order bits. (Unsigned types undergo **zero extension**). **Truncation** drastically changes the value by slicing off the most significant bits—the value is preserved only if the original number could fit perfectly within the narrower bounds.

---

### Concept Unit 5: Casting between signed and unsigned — the dangerous conversion

Casting between signed and unsigned types of the same size does not alter the bits; it simply alters how the C compiler interprets them. This leads to extremely dangerous implicit conversions during comparisons.

**Throwaway Lab:** Mixing signed and unsigned variables in a comparison.

```c
#include <stdio.h>

int main(void)
{
    int    s = -1;
    unsigned int u = (unsigned int)s;
    printf("%d\n", s);  /* -1 */
    printf("%u\n", u);  /* 4294967295 (= 2^32 - 1 = 0xFFFFFFFF) */

    /* The BIT PATTERN does not change -- only the interpretation */
    /* -1 as int32_t:   11111111 11111111 11111111 11111111 */
    /* 4294967295 as uint32_t: same bits, different meaning */

    /* Implicit conversion: the bug */
    unsigned int len = 5;
    int i = -1;
    
    if (i < (int)len) {
        printf("i is less than len\n");  /* this prints -- correct */
    }
    
    /* Without the cast: */
    if ((unsigned)i < len) {
        /* (unsigned)(-1) = 4294967295 > 5, so this branch is NOT taken */
        printf("this won't print\n");
    } else {
        printf("signed/unsigned comparison trap\n"); /* this prints */
    }
    return 0;
}
```

**Mechanical Trace:**
- Initialize `s` to `-1` (binary `0xFFFFFFFF`).
- Initialize `u` to cast of `s` (unsigned interpretation of `0xFFFFFFFF`, which is `4294967295`).
- Print `s`: "-1".
- Print `u`: "4294967295".
- `len` is `5`.
- `i` is `-1`.
- Condition: `i < (int)len` -> `-1 < 5`. True. Print "i is less than len".
- Condition: `(unsigned)i < len` -> `4294967295 < 5`. False. Print "signed/unsigned comparison trap".

**Output:**
```
-1
4294967295
i is less than len
signed/unsigned comparison trap
```

**Explanation:** In C, when an operation involves both a signed integer and an unsigned integer, the signed value is **implicitly promoted** to unsigned. `-1` interpreted as an unsigned 32-bit integer becomes `4294967295`. This implicit conversion has caused innumerable security vulnerabilities. For instance, code like `if (len < MAX_BUFFER_SIZE) memcpy(dst, src, len)` can be brutally bypassed if an attacker passes a negative `len`, satisfying a signed check, but behaving as an enormous size in `memcpy()`.

---

### Concept Unit 6: Overflow detection — how to do it safely

Since integer overflow in C results in undefined behavior for signed integers, you cannot just perform the operation and check if the result wrapped around. You must detect the potential for overflow *before* the operation.

**Throwaway Lab:** Testing a safe addition check.

```c
#include <stdio.h>
#include <limits.h>

/* WRONG: this does not work for signed overflow */
int bad_overflow_check(int x, int y)
{
    /* WRONG: x + y itself may overflow before the comparison */
    return (x + y < x);  /* UB if x+y overflows */
}

/* RIGHT: check BEFORE the operation */
int safe_add(int x, int y, int *result)
{
    /* For positive x and y: overflow if x > INT_MAX - y */
    if (x > 0 && y > 0 && x > INT_MAX - y) return 0; /* overflow */
    if (x < 0 && y < 0 && x < INT_MIN - y) return 0; /* underflow */
    *result = x + y;
    return 1; /* success */
}

int main(void)
{
    int result;
    int ok = safe_add(2000000000, 2000000000, &result);
    printf("ok=%d\n", ok);  /* 0 -- overflow detected */

    ok = safe_add(100, 200, &result);
    printf("ok=%d result=%d\n", ok, result);  /* 1, 300 */
    return 0;
}
```

**Mechanical Trace:**
- Call `safe_add(2000000000, 2000000000, &result)`.
- Condition: `2000000000 > 0 && 2000000000 > 0` is true. `INT_MAX` is usually `2147483647`.
- `INT_MAX - 2000000000` = `147483647`.
- `2000000000 > 147483647` is true. Overflow detected. Returns 0.
- Print "ok=0".
- Call `safe_add(100, 200, &result)`.
- Condition: `100 > 0 && 200 > 0` is true. `INT_MAX - 200` = `2147483447`.
- `100 > 2147483447` is false.
- Operation: `*result = 100 + 200 = 300`. Returns 1.
- Print "ok=1 result=300".

**Output:**
```
ok=0
ok=1 result=300
```

**Explanation:** Checking `x + y < x` assumes a wraparound will reliably occur, but a clever optimizing compiler is allowed to delete that check entirely by assuming signed overflow (which is undefined behavior) never happens. You must verify if `x > INT_MAX - y` before applying the addition operator. Modern compilers (GCC and Clang) also provide efficient intrinsics like `__builtin_add_overflow(x, y, &result)` for robust overflow checking.

---

### Concept Unit 7: The classic overflow bugs in real code

Integer properties spawn some of the most classic, persistent bugs in systems software.

**Throwaway Lab:** Analyzing common real-world bugs.

**Pattern 1: Length check bypass**
```c
#include <stdio.h>
#include <stddef.h>

void vulnerable(size_t len)
{
    /* If attacker sends len = 0xFFFFFFFF + 5 = 4 (wrap!) */
    if (len + 5 < 10) {  
        printf("Check bypassed for len=%zu\n", len);
    }
}

int main(void) {
    vulnerable(0xFFFFFFFFFFFFFFFB); /* Example on 64-bit */
    return 0;
}
```
**Mechanical Trace:**
- Call `vulnerable(0xFFFFFFFFFFFFFFFB)`.
- Evaluates `len + 5`. `0xFFFFFFFFFFFFFFFB + 5` wraps to `4`.
- Condition `4 < 10` is true.
- Output: "Check bypassed for len=18446744073709551611" (depending on print format).

*Explanation:* When checking lengths, `len + offset < MAX` is extremely dangerous because `len + offset` can overflow the unsigned bounds, dropping down to a very small number, bypassing the boundary check entirely while retaining a massive `len` that wreaks havoc. Fix: `len < MAX - offset`.

**Pattern 2: Absolute value of INT_MIN**
```c
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

int main(void)
{
    /* UB! abs(-2147483648) = 2147483648 > INT_MAX */
    int min = INT_MIN;
    printf("%d\n", abs(min)); 
    return 0;
}
```
**Mechanical Trace:**
- Set `min = -2147483648`.
- Call `abs(min)`. Undefined behavior. Typically wraps back to `-2147483648` on two's complement.
- Print `-2147483648`.

*Explanation:* Due to the asymmetry of two's complement, `-INT_MIN == INT_MIN`. Attempting to convert `INT_MIN` to a positive integer overflows. Thus `abs(INT_MIN)` is undefined behavior. 

**Pattern 3: Loop termination with unsigned**
```c
#include <stdio.h>

int main(void)
{
    unsigned int i = 3;
    /* INFINITE LOOP: i is unsigned, so i >= 0 is always true */
    for (; i >= 0; i--) {
        printf("Looping %u\n", i);
        if (i == 0) break; /* Safety exit for this test */
    }
    return 0;
}
```
**Mechanical Trace:**
- Initialize `i` to `3`.
- Condition `3 >= 0`. Print "Looping 3". `i` becomes `2`.
- Condition `2 >= 0`. Print "Looping 2". `i` becomes `1`.
- Condition `1 >= 0`. Print "Looping 1". `i` becomes `0`.
- Condition `0 >= 0`. Print "Looping 0". `i == 0` is true, breaks out (to prevent infinite looping in test).

*Explanation:* An unsigned number can never be less than zero. When `i == 0`, executing `i--` simply wraps the number around to its maximum value (`4294967295`). The loop condition `i >= 0` always holds true, causing an infinite loop. Fix: change the loop condition, or use a signed loop index if suitable.

## Closing

Integer arithmetic in C maps directly to hardware, and hardware has no implicit bounds checking. Every overflow, every truncation, and every sign conversion is solely your responsibility. Relying on intuitive mathematical behavior for bounded memory structures leads straight to undefined behavior and security vulnerabilities. 

Lesson 04 covers floating point — a completely different encoding that brings its own distinct set of numerical surprises.

**Exercises:** 
- What is the two's complement representation of `-42` in 8 bits?
- What does `(int)(unsigned int)(-1)` evaluate to?
- Write a safe subtraction function `safe_sub(int x, int y, int *result)` analogous to `safe_add`.
