# Memory, Types, and the Cost of Precision

Here is something that surprises most programmers when they first encounter it: `0.1 + 0.2` does not equal `0.3` in C++. Or Python. Or Java. Or any language running on standard x86 hardware. Run this and see for yourself:

```cpp
#include <iostream>
#include <iomanip>

int main() {
    double a = 0.1;
    double b = 0.2;
    double c = a + b;

    std::cout << std::setprecision(20) << c << std::endl;
    // Expected: 0.3
    // Actual: 0.30000000000000004440...
}
```

This isn't a bug in C++. It's a fundamental property of how computers represent real numbers in binary, codified in the IEEE 754 standard from 1985. Understanding it — and dozens of other consequences of how C++ maps your abstractions to real hardware — is what separates programmers who write reliable systems from programmers who write programs that almost work.

## What a Variable Actually Is

In Python, when you write `x = 42`, Python creates an object, stores the value in that object's internal structure, creates a reference named `x` pointing to the object, and handles all the memory for you invisibly. The integer `42` in CPython takes 28 bytes — because it carries a reference count, a type pointer, and the value itself.

In C++, when you write `int x = 42;`, the compiler reserves **4 bytes** of memory — usually on the stack — at a specific address, and stores the binary representation of 42 there. That's it. Four bytes. No type information at runtime. No reference counting. The name `x` is a compile-time alias for that memory address. After compilation, `x` doesn't exist as a concept — the program just reads and writes to an address.

```cpp
#include <iostream>

int main() {
    int x = 42;

    // & gives us the memory address of x
    std::cout << "Value of x:    " << x << std::endl;
    std::cout << "Address of x:  " << &x << std::endl;
    std::cout << "Size of x:     " << sizeof(x) << " bytes" << std::endl;

    short s = 42;
    long long ll = 42;

    std::cout << "Size of short:     " << sizeof(s) << " bytes" << std::endl;
    std::cout << "Size of long long: " << sizeof(ll) << " bytes" << std::endl;
}
```

This directness is C++'s defining characteristic. You are not programming an abstraction of a computer — you are programming the computer.

## The Fundamental Types and Their Guarantees

C++ inherited its type system from C, which was designed to run on hardware ranging from 8-bit microcontrollers to 64-bit mainframes. This is why the standard gives only *minimum* size guarantees, not exact sizes.

| Type | Minimum bits | Typical (64-bit x86) | Range |
|------|-------------|----------------------|-------|
| `char` | 8 | 8 bits | -128 to 127 (or 0–255) |
| `short` | 16 | 16 bits | -32,768 to 32,767 |
| `int` | 16 | 32 bits | -2,147,483,648 to 2,147,483,647 |
| `long` | 32 | 32 or 64 bits | platform-dependent |
| `long long` | 64 | 64 bits | ±9.2 × 10¹⁸ |
| `float` | — | 32 bits (IEEE 754) | ~7 significant digits |
| `double` | — | 64 bits (IEEE 754) | ~15 significant digits |
| `bool` | — | 1 byte | `true` or `false` |

The fact that `int` is *at least* 16 bits, not exactly 32, is a genuine historical artifact. When C was standardized in 1989 (C89), 16-bit systems were still common. A 16-bit `int` meant `INT_MAX` was only 32,767 — meaning any loop counter or array size could overflow catastrophically on values modern programs handle trivially.

If you need exact sizes, use the types from `<cstdint>`:

```cpp
#include <iostream>
#include <cstdint>

int main() {
    int32_t  exactly32 = 2147483647;   // guaranteed 32 bits
    uint64_t exactly64 = 18446744073709551615ULL;  // guaranteed 64 bits unsigned
    int8_t   byte = 127;               // guaranteed 8 bits

    std::cout << exactly32 << std::endl;
    std::cout << exactly64 << std::endl;
    std::cout << (int)byte << std::endl;  // cast to print as number, not char
}
```

## The IEEE 754 Problem

Floating-point is a fascinating compromise. In 1985, the IEEE published a standard for representing real numbers in binary. The idea: represent a number as `(-1)ˢ × 1.mantissa × 2ᵉˣᵖᵒⁿᵉⁿᵗ`. A 64-bit `double` uses 1 sign bit, 11 exponent bits, and 52 mantissa bits.

The problem: `0.1` in decimal is `0.000110011001100...` in binary — a repeating fraction, like `1/3` in decimal. You can't represent it exactly in a finite number of bits. So `0.1` stored in a `double` is actually `0.1000000000000000055511151231257827021181583404541015625`.

The consequences are real and have cost companies millions:

- The Patriot missile failure in 1991 was partly caused by floating-point precision loss accumulating over 100 hours of operation.
- Financial systems that use `double` for currency calculations introduce systematic rounding errors.

For financial software, use integer arithmetic (store cents, not dollars) or a dedicated decimal library:

```cpp
#include <iostream>
#include <cmath>

int main() {
    // The floating-point trap
    double price1 = 0.10;
    double price2 = 0.20;
    std::cout << "0.10 + 0.20 = " << (price1 + price2) << std::endl;

    // Comparing floats correctly — never use ==
    double a = 0.1 + 0.2;
    double b = 0.3;
    double epsilon = 1e-10;

    if (std::abs(a - b) < epsilon) {
        std::cout << "Close enough to equal" << std::endl;
    }

    // Integer arithmetic for money (store cents)
    int cents1 = 10;   // $0.10
    int cents2 = 20;   // $0.20
    int total  = cents1 + cents2;
    std::cout << "Total: $" << total / 100 << "." << total % 100 << std::endl;
}
```

## Integer Overflow: The Silent Killer

Integer overflow in C++ is not just a quirk — for signed integers, it is **undefined behavior**. The compiler is permitted to assume it never happens and optimize your code accordingly. This has led to real security vulnerabilities.

Consider this loop, which looks like it should terminate:

```cpp
#include <iostream>
#include <climits>

int main() {
    // Signed overflow: undefined behavior
    // On most machines wraps to negative, but NEVER rely on this
    int max = INT_MAX;
    std::cout << "INT_MAX = " << max << std::endl;
    std::cout << "INT_MAX + 1 = " << (max + 1) << std::endl;  // UB!

    // Unsigned overflow: DEFINED, wraps around
    unsigned int umax = UINT_MAX;
    std::cout << "UINT_MAX = " << umax << std::endl;
    std::cout << "UINT_MAX + 1 = " << (umax + 1) << std::endl;  // Always 0
}
```

In 2012, GCC used UB-based optimizations to remove a null-pointer check in the Linux kernel — reasoning that if a pointer is dereferenced before being checked, the pointer can't possibly be null (because dereferencing null is UB). The check was removed, and the code became a privilege escalation vulnerability.

Unsigned integer overflow, by contrast, is *defined* behavior in C++. It wraps around modulo 2ⁿ. This is useful for hash functions, checksums, and circular buffers.

## `auto`: The Compiler Knows the Type

C++11 introduced `auto`, which tells the compiler to deduce the type from the initializer:

```cpp
#include <iostream>
#include <vector>
#include <typeinfo>

int main() {
    auto x = 42;          // int
    auto y = 3.14;        // double
    auto z = 3.14f;       // float (the f suffix makes it float)
    auto s = "hello";     // const char*  (not std::string!)
    auto flag = true;     // bool

    // auto really shines with complex types
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    auto it = numbers.begin();  // std::vector<int>::iterator — would you write that by hand?

    std::cout << x << " " << y << " " << z << std::endl;
    std::cout << "Iterator points to: " << *it << std::endl;
}
```

`auto` doesn't make C++ dynamic — the type is still fixed at compile time. It just lets the compiler infer it from context. This becomes invaluable with complex template types.

## `const` and `constexpr`: Values That Don't Change

`const` is a promise: "I will not modify this value through this name."

```cpp
#include <iostream>
#include <cmath>

// constexpr: value computed at COMPILE TIME
constexpr double PI = 3.14159265358979323846;
constexpr int BUFFER_SIZE = 1024;

int main() {
    const double radius = 5.0;  // can't change radius after this

    double area = PI * radius * radius;
    std::cout << "Area: " << area << std::endl;

    // constexpr functions: computed at compile time when inputs are constant
    // The compiler replaces these with their values, zero runtime cost
    char buffer[BUFFER_SIZE];  // array size must be a compile-time constant

    std::cout << "Buffer size: " << sizeof(buffer) << std::endl;
}
```

The difference between `const` and `constexpr` is *when* the value is computed. `const` can be initialized at runtime (from user input, for example). `constexpr` must be computable at compile time — the compiler replaces every use with the literal value, producing faster, smaller code.

## The Stack vs The Heap: A Preview

When you declare `int x = 42;` inside a function, `x` lives on the **stack** — a contiguous region of memory that grows and shrinks automatically as functions are called and return. Stack allocation is essentially free: incrementing a single register. Stack variables are automatically destroyed when the function returns.

When you write `new int(42)` in C++, or use a `std::vector`, memory comes from the **heap** — a pool of memory managed by the allocator. Heap allocation is slower (it may involve a system call) and the memory lives until you explicitly release it (or until a smart pointer does so for you).

We'll explore this deeply in the Pointers lesson. For now, understand that the distinction matters: **stack = automatic, fast, limited size; heap = manual or managed, slower, effectively unlimited.** Most local variables in a typical C++ program live on the stack. Large data structures live on the heap.

## Putting It Together

The type system in C++ is not bureaucracy. Every type choice is a decision about how many bytes to use, what operations are valid, and what performance characteristics to expect. Choosing `int` instead of `long long` is a statement about the range of values you expect. Choosing `float` instead of `double` cuts memory usage in half but loses precision. These tradeoffs don't exist in Python — but they're why Python can't write an operating system, and C++ can.
