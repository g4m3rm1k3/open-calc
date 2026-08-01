# FOUNDATIONS — LAB-000 — Binary, Bytes, and Character Encoding

**Prerequisites:** None. This is the first lab.

**What this lab adds:**
- You will be able to read and convert binary numbers by hand and in the console
- You will see exactly how text like "hello" becomes a sequence of numbers in memory
- You will understand why an emoji takes more space than a letter

**Time:** 30–40 minutes

**Environment:** Browser DevTools console (press F12 → Console tab). No files, no install, no server.

---

> **Quick Check — try to answer before reading:**
>
> 1. Why do computers use binary (0s and 1s) instead of the decimal system (0–9)?
> 2. What do you think happens when two computers disagree on what the number 65 means as a character?
> 3. If a file is 1 kilobyte, how many bytes is that? How many bits?
>
> *(Answers at the end of this lab)*

---

## What You Will Be Able To Do

When this lab is complete, you can open any browser console and:
- Convert any number between binary, decimal, and hex
- Encode a string to bytes and see the exact numbers
- Explain why `"😀".length` returns `2` in JavaScript when the emoji is clearly one character
- Describe what UTF-8 is and why it exists

---

## Concept Blocks

---

### Concept: Bits and Binary

**What it is:** A bit is a single binary digit — either 0 or 1. It is the smallest possible unit of information. Binary is a number system with base 2 — every position represents a power of 2 instead of a power of 10.

**The problem before:**

Electronic hardware needs to store and transmit information reliably. A transistor — the physical switch inside every chip — has two reliable states: off and on. If we tried to use 10 voltage levels for decimal digits, small fluctuations in voltage would cause 4 to be misread as 5. Two states are robust; ten states are fragile.

**The solution:**

Represent all information using only 0 and 1 — the two states a transistor reliably holds. Then use positional notation in base 2 to express any number.

Decimal: each position is a power of 10.

```
  3   4   7
  ↑   ↑   ↑
 10²  10¹  10⁰
300 + 40 + 7 = 347
```

Binary: each position is a power of 2.

```
  1   0   1   1
  ↑   ↑   ↑   ↑
  2³  2²  2¹  2⁰
  8 + 0 + 2 + 1 = 11
```

So the binary number `1011` equals 11 in decimal.

**What it hides:**

The transistor. Programmers work with numbers — 42, 255, 16384. The hardware engineers made the deal: "we'll give you billions of reliable two-state switches; you can pretend you have numbers." Every variable you have ever declared is, at the bottom, a collection of transistors in on/off states. Binary is the language of that deal.

The invariant it protects: any number can be represented unambiguously as a sequence of 0s and 1s with no voltage ambiguity, no noise margin problem, and no disagreement between machines.

**Canonical example:**

A light switch is one bit. Off = 0. On = 1. One switch can represent two states.

Two switches can represent four states: 00, 01, 10, 11 — which is 0, 1, 2, 3 in decimal.

Eight switches can represent 256 states — 0 through 255. That is one byte.

```
Switches:  [ off off off off  off on  off on ]
Binary:        0   0   0   0    0   1    0   1
Value:    0×128 + 0×64 + 0×32 + 0×16 + 0×8 + 1×4 + 0×2 + 1×1 = 5
```

**Smallest possible example** — run this in the browser console right now:

```js
// Convert decimal to binary string:
(5).toString(2)      // → "101"  (4 + 0 + 1)
(255).toString(2)    // → "11111111"  (8 ones = 255)
(0).toString(2)      // → "0"

// Convert binary string back to decimal:
parseInt("101", 2)   // → 5  (the second argument is the base)
parseInt("11111111", 2)  // → 255
```

**Why it matters here:** Every number in every program — every coordinate, every ID, every pixel color, every character — is stored as bits. Understanding this is the foundation for understanding memory, file sizes, color values, and network protocols.

**You will see this again in:**
- Bitwise operators (`&`, `|`, `^`, `<<`, `>>`) — used in graphics color packing, permissions flags, and hash functions
- File size: a 1080p image is `1920 × 1080 × 3 bytes = 6,220,800 bytes` — understanding why requires knowing bits
- Network protocols: TCP/IP headers pack multiple fields into individual bits to save bandwidth
- Color values: CSS `rgb(255, 128, 0)` — three numbers, each fits in one byte, packed together as `0xFF8000`
- Job interviews: "What is the difference between `>>` and `>>>`?" requires knowing bit representation

**Watch for:** Binary `1011` is not one thousand and eleven. It is the number 11. The digits are a positional code, not separate decimal digits concatenated.

---

### SAVE AND TRY

Open your browser. Press **F12**. Click the **Console** tab.

Type these one at a time and press Enter after each:

```js
(10).toString(2)
```
Expected: `"1010"` — that is 8 + 2 = 10. Confirmed.

```js
parseInt("1010", 2)
```
Expected: `10` — you just converted back.

**Change something:** Try `(16).toString(2)`. Expected: `"10000"` — 16 is exactly 2⁴, so only the fifth bit is on. Try `(15).toString(2)`. Expected: `"1111"` — four bits all on = 8+4+2+1 = 15. Change it back to `(10)`.

---

### Concept: Bytes

**What it is:** A byte is a group of exactly 8 bits. It is the fundamental unit of computer memory — the smallest unit that has its own address in RAM.

**The problem before:**

Individual bits are too small to address individually — you would need a billion-digit address to reference a single bit in modern RAM. Grouping bits into fixed-size chunks gives us a practical unit that hardware can address efficiently.

**The solution:**

Standardize on 8 bits per byte. 8 bits gives 2⁸ = 256 possible values (0–255). This is enough to represent any printable character in English (ASCII needs 128), any red/green/blue color channel (0–255), and many other common quantities.

**What it hides:**

Memory addressing. When you write `let x = 42`, the JavaScript engine allocates some bytes in RAM, stores the binary for 42 into them, and gives the variable `x` a label for that address. You never see the address. You never handle the bits. The byte is the abstraction that makes this invisible.

The invariant it protects: every byte is independently addressable, so the CPU can read or write any single byte without disturbing adjacent bytes.

**Canonical example:**

```
One byte = 8 bits:

  bit 7  bit 6  bit 5  bit 4  bit 3  bit 2  bit 1  bit 0
  ─────  ─────  ─────  ─────  ─────  ─────  ─────  ─────
    1      0      1      0      0      0      0      1
   128  +  0  +  32  +  0  +   0  +   0  +   0  +   1  =  161
```

The rightmost bit is called the least-significant bit (LSB). The leftmost is the most-significant bit (MSB). This is exactly like decimal: the rightmost digit of 347 is the least significant (ones place).

**Smallest possible example:**

```js
// A byte holds values 0–255:
(0).toString(2).padStart(8, '0')    // → "00000000"  (minimum: 0)
(255).toString(2).padStart(8, '0')  // → "11111111"  (maximum: all bits on)
(161).toString(2).padStart(8, '0')  // → "10100001"  (example above)

// In hex — base 16 — one hex digit = exactly 4 bits, two hex digits = one byte:
(255).toString(16)   // → "ff"  (0xFF is 255)
(161).toString(16)   // → "a1"
```

**Why it matters here:** File sizes, memory limits, and performance are all measured in bytes. When a file is "4 KB," that is 4,096 bytes = 32,768 bits. When a function is slow, often it is because it is copying too many bytes. The byte is the currency of computing.

**You will see this again in:**
- File sizes everywhere: KB (1,024 bytes), MB (1,024 KB), GB (1,024 MB)
- Network requests: "this request transferred 12.4 KB" means 12,697 bytes of data
- Buffer and ArrayBuffer in JavaScript — raw byte arrays you can read directly
- Image formats: a PNG with dimensions 800×600 has at minimum 1,440,000 bytes of pixel data
- Database column types: `VARCHAR(255)` — 255 is the max value of one byte, so it fits in one byte to store the length

**Watch for:** A kilobyte is 1,024 bytes (2¹⁰), not 1,000. Storage manufacturers use 1,000 to make drives look bigger. Operating systems use 1,024. This is why a "500 GB" drive shows as ~466 GB in Windows.

---

### SAVE AND TRY

In the browser console:

```js
(255).toString(2).padStart(8, '0')
```
Expected: `"11111111"` — all 8 bits on.

```js
(128).toString(2).padStart(8, '0')
```
Expected: `"10000000"` — only the most significant bit is on. 128 = 2⁷.

**Change something:** Try `(127).toString(2).padStart(8, '0')`. Expected: `"01111111"` — all bits except the top one. 127 = 64+32+16+8+4+2+1. This is why 127 is a common maximum value: it is the largest number that fits in 7 bits, leaving 1 bit for a sign (positive/negative).

---

### Concept: Character Encoding

**What it is:** Character encoding is a lookup table — a mapping from numbers to characters — that lets computers store and transmit text by storing numbers instead.

**The problem before:**

Try this in the browser console right now. Don't look ahead.

```js
// What does this number mean as text?
String.fromCharCode(72, 101, 108, 108, 111)
```

That works because both your machine and the server agreed on the same table. But in the early days of computing, IBM used one table, DEC used another, and European countries added their own characters in positions 128–255 differently. A file created on an IBM system looked like gibberish on a DEC system because the same number meant a different character.

**The solution:**

ASCII (1963) standardized 128 characters — English letters, digits, punctuation, and control codes — and assigned each a number 0–127. Every machine agreed: 65 = 'A', 66 = 'B', 32 = space, 10 = newline.

Unicode (1991) extended this to cover every writing system in the world — over 149,000 characters. Each character gets a code point: a number. The letter 'A' is U+0041 (65). The emoji 😀 is U+1F600 (128512).

UTF-8 is the dominant encoding that stores Unicode code points as bytes. It uses 1 byte for ASCII characters (backward compatible) and 2–4 bytes for everything else. This is why an English text file is smaller than a Chinese text file of the same number of characters.

**What it hides:**

The entire complexity of representing every human writing system — left-to-right and right-to-left, alphabets and ideographs, combining characters, emoji — in a byte sequence that any computer can correctly decode. Programmers write `"hello"` and get five bytes. They write `"こんにちは"` and get fifteen bytes. They write `"😀"` and get four bytes. UTF-8 handles all of this transparently.

The invariant it protects: any valid UTF-8 sequence unambiguously identifies exactly one Unicode character. A decoder can never confuse where one character ends and the next begins.

**Canonical example:**

The letter 'A' → code point 65 → UTF-8 byte `0x41` (hex for 65)

```
'A'  →  Unicode U+0041  →  UTF-8: 01000001  (1 byte, value 65)
'é'  →  Unicode U+00E9  →  UTF-8: 11000011 10101001  (2 bytes)
'😀' →  Unicode U+1F600 →  UTF-8: 11110000 10011111 10011000 10000000  (4 bytes)
```

**Smallest possible example** — run these now:

```js
// A single character to its code point:
'A'.codePointAt(0)      // → 65
'a'.codePointAt(0)      // → 97   (lowercase is 32 higher than uppercase)
' '.codePointAt(0)      // → 32   (space)
'😀'.codePointAt(0)    // → 128512

// A code point back to a character:
String.fromCodePoint(65)      // → "A"
String.fromCodePoint(128512)  // → "😀"
```

**Why it matters here:** Every string in every program is a sequence of bytes using some encoding. When encoding mismatches — when a UTF-8 file is read as Latin-1 — you get "mojibake": café becomes cafÃ©. Every time you open a file, read from a network, or write to a database, the encoding matters.

**You will see this again in:**
- File reading in Python: `open("file.txt", encoding="utf-8")` — the encoding argument exists because of this
- HTTP headers: `Content-Type: text/html; charset=utf-8` — telling the browser which table to use
- Databases: `utf8mb4` in MySQL settings — "mb4" means 4-byte characters (emoji support)
- JSON: always transmitted as UTF-8 by the JSON specification
- Python 3 strings vs bytes: `str` is Unicode, `bytes` is raw bytes — you convert between them with encode/decode

**Watch for:** JavaScript strings are UTF-16 internally, not UTF-8. This is why `"😀".length` returns `2` — JavaScript counts UTF-16 code units, and emoji require two code units (a "surrogate pair"). The byte count and the character count are not the same thing.

---

### SAVE AND TRY

In the browser console:

```js
new TextEncoder().encode("hello")
```
Expected: `Uint8Array(5) [104, 101, 108, 108, 111]` — five bytes, one per character. `h` = 104, `e` = 101, `l` = 108, `l` = 108, `o` = 111.

Verify one: `String.fromCodePoint(104)` → `"h"`. Confirmed.

```js
new TextEncoder().encode("😀")
```
Expected: `Uint8Array(4) [240, 159, 152, 128]` — four bytes for one emoji.

Now check:
```js
"😀".length
```
Expected: `2` — JavaScript's `.length` counts UTF-16 code units, not characters or bytes. One emoji = two UTF-16 code units. This is the most common source of string length bugs in JavaScript.

**Change something:** Try `new TextEncoder().encode("café")`. Expected: 5 bytes, not 4 — the `é` needs 2 bytes. Then try `new TextEncoder().encode("日本語")`. Expected: 9 bytes for 3 characters — each CJK character needs 3 bytes in UTF-8.

---

### Concept: Hex (Hexadecimal) — The Compact Binary Shorthand

**What it is:** Hexadecimal is base-16 notation using digits 0–9 and A–F, where each hex digit represents exactly 4 bits — so two hex digits represent one byte.

**The problem before:**

Writing binary is verbose:
```
11111111 10101010 00001111  (3 bytes written as binary = 24 characters)
```

Decimal is compact but doesn't map cleanly to bits — you can't look at `250` and immediately know which bits are on.

**The solution:**

Hex maps perfectly: one hex digit = 4 bits. Two hex digits = 8 bits = one byte.

```
Binary:  1111  1111  →  Hex: FF  →  Decimal: 255
Binary:  1010  1010  →  Hex: AA  →  Decimal: 170
Binary:  0000  1111  →  Hex: 0F  →  Decimal: 15
```

So `0xFF 0xAA 0x0F` is much easier to read than `11111111 10101010 00001111`.

**What it hides:**

Nothing — hex is purely a display convention. It is the same bits, just written with 16 symbols instead of 2. Its purpose is human readability of binary data. When you read hex, you are reading bits.

**Canonical example:**

CSS colors use hex: `#FF8000` is three bytes: red=0xFF=255, green=0x80=128, blue=0x00=0.

```js
parseInt("FF", 16)    // → 255
parseInt("80", 16)    // → 128
parseInt("00", 16)    // → 0
```

**Smallest possible example:**

```js
// Decimal → hex:
(255).toString(16)   // → "ff"
(16).toString(16)    // → "10"  (16 in hex is 10, just like 10 in decimal is 10)

// Hex → decimal:
parseInt("ff", 16)   // → 255
parseInt("1f600", 16) // → 128512  (the emoji code point U+1F600)
```

**Why it matters here:** You will see hex everywhere: memory addresses, color values, SHA hashes, UUID strings, network packet dumps. Being able to read `0x41` as 65 as 'A' is a basic professional skill.

**You will see this again in:**
- CSS colors: `#RRGGBB` format — two hex digits per color channel
- SHA hashes: git commit IDs like `a1b2c3d4` — 40 hex characters = 160 bits = the SHA-1 hash
- UUID: `550e8400-e29b-41d4-a716-446655440000` — 32 hex digits = 128 bits
- Memory dumps in debuggers: addresses shown as `0x00007fff5fbff8a0`
- Network: MAC addresses like `AA:BB:CC:DD:EE:FF` — 6 bytes in hex

**Watch for:** In JavaScript, hex literals start with `0x`: `0xFF` is the number 255. This is not a string — it is an integer literal. `0xFF === 255` is `true`.

---

### SAVE AND TRY

```js
0xFF === 255
```
Expected: `true` — hex literal, same number.

```js
'#FF8000'.slice(1).match(/.{2}/g).map(h => parseInt(h, 16))
```
Expected: `[255, 128, 0]` — red, green, blue channels of the orange color `#FF8000`.

**Change something:** Try `'#1a2b3c'.slice(1).match(/.{2}/g).map(h => parseInt(h, 16))`. You get `[26, 43, 60]` — a dark blue-grey color broken into its RGB channels. Change it to `'#ff0000'` and get `[255, 0, 0]` — pure red.

---

## 🎯 Challenge: Build a Binary Converter by Hand

**You know:** Binary is positional notation in base 2. Each position is a power of 2. To convert decimal to binary, repeatedly divide by 2 and collect remainders.

**Task:** Implement `decimalToBinary(n)` in the browser console — without using `.toString(2)`. Use the repeated division algorithm.

The algorithm:
```
37 ÷ 2 = 18 remainder 1  ← rightmost bit
18 ÷ 2 = 9  remainder 0
 9 ÷ 2 = 4  remainder 1
 4 ÷ 2 = 2  remainder 0
 2 ÷ 2 = 1  remainder 0
 1 ÷ 2 = 0  remainder 1  ← leftmost bit
Read remainders bottom to top: 100101 → 37 in binary
```

**Starting code:**

```js
function decimalToBinary(n) {
  if (n === 0) return '0';
  const bits = [];
  while (n > 0) {
    // push the remainder of n divided by 2
    // then divide n by 2 (use Math.floor)
  }
  // the bits are collected least-significant first — reverse before joining
  return bits.reverse().join('');
}
```

Verify: `decimalToBinary(37)` should return `"100101"`. Verify against `(37).toString(2)`.

**Hints:**

1. `n % 2` gives the remainder. `Math.floor(n / 2)` gives the quotient.
2. The while loop runs until `n` reaches 0.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function decimalToBinary(n) {
  if (n === 0) return '0';
  const bits = [];
  while (n > 0) {
    bits.push(n % 2);         // remainder is the next bit (LSB first)
    n = Math.floor(n / 2);    // integer division — drop the remainder, keep quotient
  }
  return bits.reverse().join(''); // reverse: we collected LSB first, want MSB first
}

// Test:
decimalToBinary(37)   // → "100101"
decimalToBinary(255)  // → "11111111"
decimalToBinary(0)    // → "0"

// Verify against built-in:
[37, 255, 128, 42].every(n => decimalToBinary(n) === (n).toString(2))  // → true
```

**Key insight:** The algorithm collects bits from right to left (LSB first) because each division strips off the rightmost bit. Reversing at the end produces the conventional left-to-right (MSB first) representation. This is the same algorithm every computer uses internally when converting between number bases — your implementation is the actual mechanism, just written in JavaScript instead of hardware.

</details>

---

## What Just Happened

Every piece of information in a computer is a sequence of bits — transistors in on/off states. Grouping 8 bits into a byte gives us 256 possible values, which is enough to address individual memory locations and represent one character of ASCII text. When computing went global, ASCII's 128 characters were not enough, so Unicode assigned a number (code point) to every character in every writing system, and UTF-8 became the standard way to encode those numbers as bytes — using 1 byte for ASCII characters (backward compatible) and up to 4 bytes for everything else.

Hex is not a separate concept — it is a shorthand for reading binary. Two hex digits equal one byte. When you see `0xFF`, `#FF8000`, or a git SHA, you are looking at bits written in base-16 to keep them readable.

The JavaScript `"😀".length === 2` quirk exists because JavaScript uses UTF-16 internally, not UTF-8. This is a historical accident — JavaScript was designed in 1995 when Unicode was thought to fit in 65,536 code points (2 bytes each). When emoji required more, JavaScript had to use pairs of 2-byte values ("surrogate pairs"), breaking the assumption that `.length` equals character count. Modern JavaScript has `String.prototype.normalize()` and spread `[..."😀"].length === 1` to work around this.

---

## Final Check

| You can do this | This demonstrates |
|---|---|
| `(42).toString(2)` returns `"101010"` and you can verify it by hand | Binary is positional base-2 notation; each digit is a power of 2 |
| `parseInt("101010", 2)` returns `42` | The conversion is lossless and reversible |
| `new TextEncoder().encode("A")` returns `[65]` and `"A".codePointAt(0)` returns `65` | Character encoding maps characters to numbers; UTF-8 stores the number as bytes |
| `new TextEncoder().encode("😀")` returns 4 bytes, but `"😀".length` returns `2` | JavaScript `.length` counts UTF-16 code units, not Unicode code points or bytes |
| `(255).toString(16)` returns `"ff"` and `parseInt("ff", 16)` returns `255` | Hex is a shorthand for binary — two hex digits equal one byte |
| `decimalToBinary(37)` matches `(37).toString(2)` | The repeated-division algorithm is the mechanism behind base conversion |

---

## Quick Check Answers

**1. Why do computers use binary instead of decimal?**
Physical transistors have two reliable electrical states: off and on. Using ten voltage levels for decimal would require extremely precise hardware and would be unreliable — small voltage fluctuations would cause misreads. Two states are robust. The choice of binary is an engineering constraint, not a mathematical one.

**2. What happens when two computers disagree on what the number 65 means as a character?**
You get "mojibake" — text that appears as garbage. If computer A stores the file using a table where 65 = 'A' and computer B reads it using a table where 65 = 'Á', every character is wrong. This was a real, widespread problem before Unicode. The `Content-Type: charset=utf-8` header in HTTP exists precisely to prevent this: it tells the receiver which table was used to encode the bytes.

**3. If a file is 1 kilobyte, how many bytes and bits?**
1 kilobyte = 1,024 bytes (2¹⁰). 1,024 bytes × 8 bits/byte = 8,192 bits. (Storage manufacturers sometimes define 1 KB as 1,000 bytes to make capacities look larger — operating systems use 1,024.)
