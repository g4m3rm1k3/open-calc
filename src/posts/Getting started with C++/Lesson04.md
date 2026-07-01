# Operators: Where C++'s Power and Danger Meet

In 1978, Brian Kernighan and Dennis Ritchie published *The C Programming Language* — a book that would teach a generation of programmers. One of the most instructive passages was a table of operator precedence: fifteen levels, from unary operators at the top to the comma operator at the bottom, with various arithmetic, bitwise, logical, and assignment operators scattered between. Veteran programmers memorized the table. Beginners got bitten by it constantly.

C++ inherited every one of those precedence levels from C — and added more. Operators in C++ are not merely convenient syntax. They are the primary interface between your code and the machine's arithmetic logic unit, the instruction set, and the compiler's optimization pipeline. Some operators do exactly what you expect. Others have quirks baked in by hardware design decisions from the 1970s that continue to surprise programmers today.

## Arithmetic: The Ones That Bite

Addition, subtraction, and multiplication work as expected on any modern hardware. Division and modulo do not.

**Integer division truncates toward zero.** When both operands are integers, C++ performs integer arithmetic — the fractional part is discarded entirely, not rounded.

```cpp
#include <iostream>

int main() {
    std::cout << 7 / 2   << std::endl;  // 3, not 3.5
    std::cout << -7 / 2  << std::endl;  // -3, not -4 (truncates toward zero)
    std::cout << 7 / 2.0 << std::endl;  // 3.5 (one operand is double)
    std::cout << 7.0 / 2 << std::endl;  // 3.5
    std::cout << (double)7 / 2 << std::endl;  // 3.5 (explicit cast)
}
```

This surprises beginners constantly. `int result = 5 / 2;` gives `2`, not `2.5`. If you want floating-point division, at least one operand must be a floating-point type. The cast `(double)7 / 2` works; `(double)(7 / 2)` does not — by the time you cast, integer division has already happened.

**Modulo (`%`) follows the sign of the dividend.** In C++, the result of `a % b` has the same sign as `a`. This matches mathematical modular arithmetic when both operands are positive, but diverges from mathematical conventions when `a` is negative:

```cpp
#include <iostream>

int main() {
    std::cout << 10 % 3   << std::endl;  //  1 (expected)
    std::cout << -10 % 3  << std::endl;  // -1 (not 2!)
    std::cout << 10 % -3  << std::endl;  //  1
    std::cout << -10 % -3 << std::endl;  // -1

    // True mathematical modulo (always non-negative):
    int a = -10, b = 3;
    int mod = ((a % b) + b) % b;
    std::cout << "True mod: " << mod << std::endl;  // 2
}
```

This has caused real bugs in code that uses modulo for things like circular buffers or hash tables where negative indices are possible.

## Increment and Decrement: Pre vs Post

C++ has two increment operators: `++x` (prefix/pre-increment) and `x++` (postfix/post-increment). As standalone statements, they're identical. In expressions, they differ critically:

```cpp
#include <iostream>

int main() {
    int a = 5, b = 5;

    // Pre-increment: increment first, return new value
    int pre = ++a;  // a becomes 6, pre = 6
    std::cout << "pre-increment: a=" << a << ", result=" << pre << std::endl;

    // Post-increment: return old value, then increment
    int post = b++;  // post = 5, then b becomes 6
    std::cout << "post-increment: b=" << b << ", result=" << post << std::endl;

    // This matters in expressions like:
    int arr[] = {10, 20, 30};
    int i = 0;
    std::cout << arr[i++] << std::endl;  // prints arr[0]=10, then i becomes 1
    std::cout << arr[++i] << std::endl;  // i becomes 2, then prints arr[2]=30
}
```

The general rule in modern C++: **prefer `++x` over `x++`** for non-trivial types. For integers, the compiler optimizes both to identical instructions. For iterators and custom objects, `++x` avoids creating a temporary copy of the old value. Consistent use of `++x` is a good habit.

## Bitwise Operators: Speaking the Machine's Language

Before high-level languages, programmers manipulated hardware registers directly — every bit mattered. Bitwise operators expose this level of the machine, and they remain essential for systems programming, embedded development, graphics, cryptography, and performance-critical code.

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `&` | AND | `0b1100 & 0b1010` | `0b1000` |
| `\|` | OR | `0b1100 \| 0b1010` | `0b1110` |
| `^` | XOR | `0b1100 ^ 0b1010` | `0b0110` |
| `~` | NOT | `~0b1100` | `0b...0011` (all bits flipped) |
| `<<` | Left shift | `1 << 3` | `8` (2³) |
| `>>` | Right shift | `16 >> 2` | `4` (16/4) |

```cpp
#include <iostream>
#include <bitset>  // for printing binary

int main() {
    unsigned int a = 0b11001010;  // 202
    unsigned int b = 0b10110101;  // 181

    std::cout << "a        = " << std::bitset<8>(a) << " (" << a << ")" << std::endl;
    std::cout << "b        = " << std::bitset<8>(b) << " (" << b << ")" << std::endl;
    std::cout << "a & b    = " << std::bitset<8>(a & b) << std::endl;  // AND
    std::cout << "a | b    = " << std::bitset<8>(a | b) << std::endl;  // OR
    std::cout << "a ^ b    = " << std::bitset<8>(a ^ b) << std::endl;  // XOR
    std::cout << "~a       = " << std::bitset<8>(~a) << std::endl;    // NOT
    std::cout << "a << 2   = " << std::bitset<8>(a << 2) << std::endl;  // Left shift
    std::cout << "a >> 2   = " << std::bitset<8>(a >> 2) << std::endl;  // Right shift

    // Power of 2 check: a power of 2 has exactly one bit set
    // n & (n-1) clears the lowest set bit — result is 0 iff n is a power of 2
    int n = 64;
    bool isPow2 = (n > 0) && ((n & (n - 1)) == 0);
    std::cout << n << " is " << (isPow2 ? "" : "not ") << "a power of 2" << std::endl;
}
```

### Bit Flags: Packing Multiple Booleans

One common real-world use of bitwise operators is **bit flags** — packing multiple boolean options into a single integer:

```cpp
#include <iostream>

// Define flags as powers of 2 (each uses one bit)
const unsigned int READABLE   = 1 << 0;  // 0001
const unsigned int WRITABLE   = 1 << 1;  // 0010
const unsigned int EXECUTABLE = 1 << 2;  // 0100
const unsigned int HIDDEN     = 1 << 3;  // 1000

int main() {
    unsigned int permissions = READABLE | WRITABLE;  // 0011

    // Check if a flag is set
    if (permissions & READABLE) std::cout << "Readable" << std::endl;
    if (permissions & WRITABLE) std::cout << "Writable" << std::endl;
    if (!(permissions & EXECUTABLE)) std::cout << "Not executable" << std::endl;

    // Set a flag
    permissions |= EXECUTABLE;

    // Clear a flag
    permissions &= ~WRITABLE;

    std::cout << "Final permissions: " << permissions << std::endl;
}
```

This pattern is everywhere in systems programming. The Unix `chmod` permissions (read=4, write=2, execute=1) are exactly this. Network protocol headers pack multiple flags into single bytes for efficiency.

## Short-Circuit Evaluation

`&&` and `||` use **short-circuit evaluation**: the right operand is evaluated only if necessary.

- For `A && B`: if `A` is false, `B` is never evaluated (result is always false).
- For `A || B`: if `A` is true, `B` is never evaluated (result is always true).

This is guaranteed by the C++ standard, and it's not just an optimization — it's a critical tool for writing safe code:

```cpp
#include <iostream>
#include <string>

int main() {
    // Safe null check: if ptr is null, *ptr is never evaluated
    int* ptr = nullptr;
    if (ptr != nullptr && *ptr > 0) {
        std::cout << "Positive" << std::endl;
    } else {
        std::cout << "Null or non-positive" << std::endl;
    }

    // Short-circuit for performance: cheap check first
    std::string s = "";
    if (!s.empty() && s[0] == 'A') {
        // s[0] would be undefined if s is empty — safe because of short-circuit
        std::cout << "Starts with A" << std::endl;
    }

    // Side effects in short-circuit expressions
    int x = 0;
    bool result = false && (++x > 0);  // x is NOT incremented!
    std::cout << "x = " << x << std::endl;  // 0
}
```

The last example is subtle: `false && (++x > 0)` — since the left side is false, `++x` is never executed. Side effects inside short-circuited expressions can be invisible bugs. Avoid side effects in boolean expressions when possible.

## Compound Assignment and Operator Precedence

C++ provides compound assignment for every arithmetic and bitwise operator: `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `|=`, `^=`, `<<=`, `>>=`. They're more readable and occasionally produce better code:

```cpp
#include <iostream>

int main() {
    int x = 100;
    x += 50;    // x = x + 50 = 150
    x -= 30;    // x = x - 30 = 120
    x *= 2;     // x = x * 2  = 240
    x /= 4;     // x = x / 4  = 60
    x %= 7;     // x = x % 7  = 4

    std::cout << x << std::endl;

    // Operator precedence surprises
    // Always use parentheses when mixing bitwise and arithmetic
    int a = 2 + 3 * 4;   // 14, not 20 (multiplication first)
    int b = 2 & 3 + 4;   // 0! Because + has higher precedence than &
    int c = (2 & 3) + 4; // 2 + 4 = 6 (explicit)

    std::cout << "a=" << a << " b=" << b << " c=" << c << std::endl;
}
```

The precedence rule: **when in doubt, add parentheses.** Code that relies on subtle precedence rules is code that will be misread by the next developer — possibly you, in six months. Parentheses are free. Bugs are not.
