---
concept: 078-bitwise-operators
name: Bitwise Operators
---

## Definition

Bitwise operators act directly on the individual binary bits of a number —
AND, OR, XOR, NOT, and bit shifts — rather than treating the number as a
single arithmetic value.

## Problem

Some problems are naturally about individual bits, not whole numbers —
checking whether a specific flag is set among many packed into one integer,
or toggling one option without disturbing the others. Doing this with
ordinary arithmetic is awkward or impossible; bitwise operators manipulate
exactly the bits involved.

## Execution

5 in binary: 0101, 3 in binary: 0011
↓
5 & 3 (AND): 0101 & 0011 = 0001 → 1 — a bit is 1 only where BOTH inputs have a 1
↓
5 | 3 (OR): 0101 | 0011 = 0111 → 7 — a bit is 1 where EITHER input has a 1
↓
5 ^ 3 (XOR): 0101 ^ 0011 = 0110 → 6 — a bit is 1 where the inputs DIFFER
↓
5 << 1 (left shift): 0101 << 1 = 1010 → 10 — every bit moves one place left, doubling the value

## Computer Science

Bitwise operations map directly onto hardware logic gates (AND/OR/XOR
gates) and run in a single CPU cycle regardless of the number's magnitude —
this is why bitmask techniques can represent and manipulate a whole set of
up to 32 (or 64) boolean flags as one single integer, checking or toggling
any one flag in O(1) time.

Tags: Logic gates, Bitmasks, Binary representation, Constant-time flag operations

## Software Engineering

Packing multiple boolean flags into one integer (a bitmask) saves memory and
lets a whole set of flags be compared, copied, or serialized as a single
value — common in permission systems (read/write/execute flags),
configuration options, and anywhere that would otherwise need a separate
boolean field per option.

Tags: Bitmasks, Permission flags, Memory efficiency, Feature flags

## Common Mistakes

- Confusing bitwise AND/OR with logical AND/OR — bitwise operators act on every bit of the whole number, while logical operators only care about true/false as a whole; using the wrong one silently produces a number, not a boolean, in the wrong context.
- Forgetting operator precedence between bitwise and comparison operators — a comparison usually binds tighter than a bitwise operator in many languages, so an expression combining both without parentheses often doesn't evaluate in the order it looks like it should (see the Operator Precedence concept).

## Exercises

- Compute `12 & 10`, `12 | 10`, and `12 ^ 10` by hand in binary first, then check your answer by running the code.
- Use a single integer as a bitmask for 4 boolean settings, and write code to check whether the 3rd flag (bit index 2) is set, using `&` and a shift.

## javascript

```javascript
const a = 5    // 0101
const b = 3    // 0011

console.log(a & b)     // 1  -- 0001
console.log(a | b)     // 7  -- 0111
console.log(a ^ b)     // 6  -- 0110
console.log(a << 1)    // 10 -- 1010
console.log(a >> 1)    // 2  -- 0010

const READ = 1 << 0     // 001
const WRITE = 1 << 1    // 010
let permissions = READ | WRITE   // 011 -- both flags set
console.log((permissions & WRITE) !== 0)   // true -- WRITE flag is set
```
Walkthrough: `&`, `|`, and `^` compare each pair of bits independently
across the whole number. `<<`/`>>` shift every bit left or right by the
given count, which is also a fast way to compute `× 2` / `÷ 2`. Packing
`READ` and `WRITE` into one `permissions` integer with `|`, then checking
one flag back out with `&`, is exactly the bitmask pattern described above.

## python

```python
a = 5    # 0101
b = 3    # 0011

print(a & b)     # 1  -- 0001
print(a | b)     # 7  -- 0111
print(a ^ b)     # 6  -- 0110
print(a << 1)    # 10 -- 1010
print(a >> 1)    # 2  -- 0010

READ = 1 << 0     # 001
WRITE = 1 << 1    # 010
permissions = READ | WRITE   # 011 -- both flags set
print((permissions & WRITE) != 0)   # True -- WRITE flag is set
```
Walkthrough: identical bit-level behavior to the JavaScript version —
Python's integers support the exact same bitwise operators with the exact
same semantics, and the same READ/WRITE bitmask pattern works identically.
