---
series: cpp-fundamentals
level: 0
title: Types, Variables, and main()
lang: cpp
---

# Types, Variables, and main()

C++ is a statically-typed, compiled language. Every variable must have its type declared before use, and the type is checked at compile time — before the program ever runs. This makes C++ strict and verbose compared to Python or JavaScript, but it also makes it fast: the compiler knows the exact memory layout of every variable and can generate optimal machine code.

This lesson teaches the structure of a C++ program, the basic value types, and how to print output.

## The Shape of Every C++ Program

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++" << endl;
    return 0;
}
```

```text
Hello, C++
```

`#include <iostream>` — includes the Input/Output stream library. Without it, `cout` does not exist. `#include` is a preprocessor directive — it runs before compilation and pastes the contents of the named header into the file.

`using namespace std;` — makes all names from the `std` (standard) namespace available without the `std::` prefix. `cout` is actually `std::cout`; `endl` is `std::endl`.

`int main()` — the entry point. Every C++ program must have exactly one `main` function. `int` means it returns an integer. `return 0` signals success to the operating system; any other value signals failure.

`cout << "Hello, C++" << endl;` — sends output to the console. `<<` is the **stream insertion operator**: it pushes data into the output stream `cout` (character output). `endl` ends the line and flushes the buffer.

**CS lens:** Unlike Python and JavaScript, C++ programs are **compiled** before running. The compiler (`g++`, `clang++`) reads your source code, checks types, and produces a binary executable. The executable runs directly on the CPU — no interpreter, no virtual machine. This is why C++ programs are typically 10–100× faster than equivalent Python programs for CPU-intensive work.

## Fundamental Types

C++ has several built-in types, each with a fixed size in memory:

```cpp
#include <iostream>
using namespace std;

int main() {
    int age = 28;
    double temperature = 36.6;
    bool isActive = true;
    char grade = 'A';

    cout << age << endl;
    cout << temperature << endl;
    cout << isActive << endl;
    cout << grade << endl;

    return 0;
}
```

```text
28
36.6
1
A
```

`int` — a 32-bit signed integer. Range: −2,147,483,648 to 2,147,483,647. Declared as `int name = value;`.
`double` — a 64-bit floating-point number (double-precision IEEE 754). Use for decimals.
`bool` — true or false. Printed as `1` (true) or `0` (false) by `cout` unless formatted otherwise.
`char` — a single character, stored as a 1-byte integer (the ASCII code). `'A'` is the char literal for A.

**Enable Debug and step through this.** Watch each variable appear in the panel as its declaration line executes. Notice that `bool` shows as `1`, not `true`.

**CS lens:** The type determines memory size. `int` uses 4 bytes; `double` uses 8 bytes; `bool` uses 1 byte; `char` uses 1 byte. The compiler uses these sizes to calculate where each variable lives in memory (its **address**). Python hides all of this — every Python int is actually a heap-allocated object with 28+ bytes of overhead regardless of the value's size.

## const — A Value That Cannot Change

`const` before a type declaration makes the variable read-only after initialisation:

```cpp
#include <iostream>
using namespace std;

int main() {
    const double PI = 3.14159265;
    const int DAYS_IN_WEEK = 7;

    double radius = 5.0;
    double area = PI * radius * radius;

    cout << "Area: " << area << endl;
    cout << "Weeks: " << 14 / DAYS_IN_WEEK << endl;

    return 0;
}
```

```text
Area: 78.5398
Weeks: 2
```

`const double PI = 3.14159265;` — `PI` cannot be reassigned. Any attempt raises a compile error. Convention: `const` names use ALL_CAPS with underscores.

`14 / DAYS_IN_WEEK` — integer division: `14 / 7` → `2`. When both operands are `int`, division produces an `int` (truncated, not rounded). `14 / 8` → `1`, not `1.75`.

## Arithmetic Operators

```cpp
#include <iostream>
using namespace std;

int main() {
    int a = 17;
    int b = 5;

    cout << a + b << endl;   // addition
    cout << a - b << endl;   // subtraction
    cout << a * b << endl;   // multiplication
    cout << a / b << endl;   // integer division
    cout << a % b << endl;   // remainder (modulo)

    double x = 17.0;
    double y = 5.0;
    cout << x / y << endl;   // floating-point division
    return 0;
}
```

```text
22
12
85
3
2
3.4
```

`%` — the **modulo operator**. `17 % 5` → `2` because `17 = 3 × 5 + 2`. Used for: checking divisibility (`n % 2 == 0` means even), wrapping indices, extracting digits.

`17 / 5` → `3` (integer division truncates toward zero).
`17.0 / 5.0` → `3.4` (floating-point division because both operands are `double`).

## Challenge: circle_stats

Write a program that declares a `const double` named `PI` equal to `3.14159`, declares a `double` named `radius` equal to `7.0`, and prints two lines:
- `Area: ` followed by `PI * radius * radius` (no newline formatting needed)
- `Circumference: ` followed by `2 * PI * radius`

```challenge
#include <iostream>
using namespace std;

int main() {
    // TODO: declare PI and radius, print area and circumference
    return 0;
}
```

```test
#include <iostream>
#include <cassert>
using namespace std;

int main() {
    const double PI = 3.14159;
    const double radius = 7.0;
    double area = PI * radius * radius;
    double circ = 2 * PI * radius;
    assert(area > 153.0 && area < 154.0);
    assert(circ > 43.0 && circ < 44.5);
    cout << "ok" << endl;
    return 0;
}
```
