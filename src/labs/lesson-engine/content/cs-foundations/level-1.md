---
series: cs-foundations
level: 1
title: Bits, Bytes, and Number Systems
lang: javascript
---

# Bits, Bytes, and Number Systems

Every value in every program — an integer, a string, an image, a network packet — is ultimately stored in memory as a sequence of bits. A bit is a single binary digit: 0 or 1. Eight bits form a byte. The entire field of computing is built on the mathematics of representing everything as numbers in different bases.

This is not abstract theory. When you write `255`, `0xFF`, `0b11111111`, and `'ÿ'`, these are four representations of the same value. When you shift bits with `>>` or mask with `&`, you are doing arithmetic directly on the machine's representation. When a floating-point number like `0.1 + 0.2 !== 0.3`, the explanation is in how the machine represents decimal fractions in binary. Understanding bits is understanding why your programs behave the way they do at the boundary with the machine.

By the end of this lesson you will be able to convert between binary, hexadecimal, and decimal, understand how integers and floats are stored, and use bitwise operations correctly.

## Binary: the counting system of machines

Decimal counts in powers of 10 (ones, tens, hundreds, ...). Binary counts in powers of 2 (ones, twos, fours, eights, ...).

```text
Decimal 42 means:
  4 × 10¹  +  2 × 10⁰
= 40       +  2
= 42

Binary 101010 means:
  1×2⁵  +  0×2⁴  +  1×2³  +  0×2²  +  1×2¹  +  0×2⁰
= 32    +  0     +  8     +  0     +  2     +  0
= 42

To convert decimal to binary: repeatedly divide by 2, reading remainders bottom-up.
  42 ÷ 2 = 21 r 0
  21 ÷ 2 = 10 r 1
  10 ÷ 2 =  5 r 0
   5 ÷ 2 =  2 r 1
   2 ÷ 2 =  1 r 0
   1 ÷ 2 =  0 r 1
  Reading remainders bottom-up: 101010 ✓

1 bit  → 2 values (0 or 1)
4 bits → 16 values (0–15)
8 bits → 256 values (0–255) — one byte
16 bits → 65,536 values
32 bits → ~4.3 billion values
64 bits → ~18.4 quintillion values
```

## Hexadecimal: compact binary notation

Binary is verbose — 8 binary digits represent just one byte. Hexadecimal (base-16) is a compact notation where each hex digit represents exactly 4 bits.

```text
Hex digits: 0–9 then A–F (A=10, B=11, C=12, D=13, E=14, F=15)

4 bits → 1 hex digit
8 bits → 2 hex digits (one byte)

Binary 1010 = hex A = decimal 10
Binary 1111 = hex F = decimal 15
Binary 11111111 = hex FF = decimal 255

42 in hex:
  42 ÷ 16 = 2 r 10  → hex digit A
   2 ÷ 16 = 0 r  2  → hex digit 2
  Reading bottom-up: 2A
  So 42 decimal = 0x2A = 0b00101010

Where you see hex in practice:
  Colors:    #FF5733 → R=255, G=87, B=51
  Memory:    0x00007fff5fbff000 (a memory address)
  Encodings: 0x48 = 72 decimal = ASCII 'H'
  Bitfields: 0xFF & value (keep only the low 8 bits)
```

```javascript
// JavaScript represents numbers in all three bases:
const decimal = 42
const binary  = 0b101010   // binary literal
const hex     = 0x2A       // hex literal

console.log(decimal === binary && binary === hex)   // true — same value, different notation

// Converting in JavaScript:
(42).toString(2)    // '101010'  — decimal to binary string
(42).toString(16)   // '2a'      — decimal to hex string
parseInt('101010', 2)  // 42     — binary string to decimal
parseInt('2a', 16)     // 42     — hex string to decimal
```

**CS lens:** Hexadecimal exists purely as a convenience for humans reading binary. The machine never uses hex — it always uses binary. Hex is a notational shortcut: 0xFF is exactly as meaningful to the CPU as 0b11111111, but much less painful to write. Hex became standard in computing because the first processors (like the Intel 8008) had 8-bit words, and two hex digits per byte was natural. Every modern programming language supports hex literals for this reason.

## How integers are stored: two's complement

Signed integers (those that can be negative) use **two's complement** representation. This is the universal standard for integer storage in CPUs.

```text
8-bit signed integer range: -128 to 127

How to read a two's complement number:
  If the leftmost (most significant) bit is 0: the number is positive.
    00101010 = 42 (same as unsigned)
  If the leftmost bit is 1: the number is negative.
    11111111 = -1
    10000000 = -128

How to negate a number in two's complement:
  1. Flip all bits (bitwise NOT)
  2. Add 1

  Negate 42 (00101010):
    Flip: 11010101
    Add 1: 11010110  → this is -42

Why two's complement (not just a sign bit)?
  Addition works identically for positive and negative numbers — no special case needed.
  42 + (-42) = 00101010 + 11010110 = 100000000 → the carry bit (9th bit) is discarded → 00000000 = 0 ✓
  The CPU uses the same adder circuit for signed and unsigned arithmetic.
```

## Floating-point numbers: IEEE 754

Decimal fractions cannot all be represented exactly in binary. This is the source of floating-point imprecision.

```javascript
0.1 + 0.2         // 0.30000000000000004 — not a JavaScript bug, a binary representation fact
0.1 + 0.2 === 0.3 // false

// Why: 0.1 in binary is 0.000110011001100110011... (repeating infinitely)
// Stored in 64 bits, it is rounded to the nearest representable value.
// 0.1 + 0.2 rounds to a value slightly above 0.3.
```

```text
IEEE 754 double-precision (JavaScript's number type):
  64 bits total:
    1 bit  — sign (0 = positive, 1 = negative)
   11 bits — exponent (the power of 2)
   52 bits — mantissa (the significant digits in binary)

Safe integer range: -(2^53 - 1) to 2^53 - 1 (Number.MAX_SAFE_INTEGER = 9,007,199,254,740,991)
  Integers outside this range lose precision — there are not enough mantissa bits to distinguish them.

For money and exact decimal arithmetic: never use floating-point.
  Use integers (store cents, not dollars) or a decimal library.
  0.1 + 0.2 === 0.30000000000000004 is not a rounding error — it is the correct IEEE 754 result.
```

**SE lens:** The floating-point imprecision issue causes real production bugs when developers store prices or financial calculations as floats. `0.1 + 0.2 !== 0.3` means that a price comparison like `if (total === 0.30)` can fail even when the mathematical total is $0.30. The standard practice is to store monetary values as integers (cents) and convert to display format only at the presentation layer.

**Common mistakes:**
- Using `===` to compare floats — use `Math.abs(a - b) < epsilon` for a small epsilon (e.g. `1e-9`).
- Assuming bit shift works on large integers — JavaScript bit operations convert numbers to 32-bit signed integers before operating. `2**32 >> 0` is 0, not 4294967296.
- Confusing `>>>` (unsigned right shift) and `>>` (signed right shift) — `(-1) >> 1 = -1` (sign-extends), `(-1) >>> 1 = 2147483647` (zero-fills).

**Debug tip:** When a comparison fails unexpectedly with floating-point numbers, print the values with full precision: `console.log(value.toPrecision(20))`. This shows the actual stored value vs the rounded display, revealing where the imprecision is.

## Challenge: bits_and_bytes

Work with binary and hex representations directly.

```challenge
// Convert and manipulate without using parseInt or toString — use arithmetic or bitwise ops.

// 1. What is 0b10110101 in decimal?
const binary_to_decimal = 0b10110101

// 2. What is 0xFF & 0b10110101 in decimal?  (& = bitwise AND — keeps only bits set in both)
const and_result = 0xFF & 0b10110101

// 3. Extract the low 4 bits (rightmost nibble) of 0b10110101 using & and 0b00001111
const low_nibble = 0b10110101 & 0b00001111

// 4. Extract the high 4 bits of 0b10110101: shift right by 4, then mask with 0b00001111
const high_nibble = (0b10110101 >> 4) & 0b00001111

// 5. Is 0.1 + 0.2 === 0.3 in JavaScript?
const floatEquality = 0.1 + 0.2 === 0.3
```

```test
assert binary_to_decimal === 181
assert and_result === 181
assert low_nibble === 5
assert high_nibble === 11
assert floatEquality === false
```
