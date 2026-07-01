# Decisions: Branching, Guards, and the Switch Statement

In 1968, Edsger Dijkstra published a short letter in the *Communications of the ACM* that changed computer science. The letter was titled **"Go To Statement Considered Harmful."** In it, Dijkstra argued that the `goto` statement — the mechanism that made early programs jump arbitrarily from one instruction to another — was fundamentally incompatible with writing programs you could reason about. A program with `goto` statements doesn't have a clear execution order. It's a tangle of arrows on a flowchart, and human minds cannot reliably follow it.

Dijkstra's alternative was **structured programming**: programs whose control flow consists only of sequences (do this, then that), selections (`if/else`), and repetitions (loops). Every mainstream language since has adopted this structure. C++ `if`, `else if`, `else`, and `switch` are the direct descendants of Dijkstra's selection construct — and their design still carries the fingerprints of 1970s hardware and compiler theory.

## The `if` Statement: More Than You Think

At its simplest:

```cpp
#include <iostream>

int main() {
    int temperature = 35;

    if (temperature > 30) {
        std::cout << "It's hot outside." << std::endl;
    } else if (temperature > 20) {
        std::cout << "Nice weather." << std::endl;
    } else if (temperature > 10) {
        std::cout << "A bit chilly." << std::endl;
    } else {
        std::cout << "Cold!" << std::endl;
    }
}
```

Straightforward. But C++'s truthiness rules introduce subtlety. The condition in an `if` statement is not restricted to `bool`. **Any nonzero value is truthy; zero is falsy.** This comes directly from C, where `bool` didn't exist — conditionals tested integers.

```cpp
#include <iostream>

int main() {
    // All of these are truthy:
    if (1)          std::cout << "1 is truthy" << std::endl;
    if (-42)        std::cout << "-42 is truthy" << std::endl;
    if (3.14)       std::cout << "3.14 is truthy" << std::endl;
    if ("hello")    std::cout << "A non-null pointer is truthy" << std::endl;

    // Only zero/null/false is falsy:
    if (!0)         std::cout << "0 is falsy" << std::endl;
    if (!0.0)       std::cout << "0.0 is falsy" << std::endl;
    if (!nullptr)   std::cout << "nullptr is falsy" << std::endl;

    // Common idiom: check if a pointer is valid
    int* p = nullptr;
    if (p) {
        std::cout << "p points to something" << std::endl;
    } else {
        std::cout << "p is null" << std::endl;
    }
}
```

This truthiness rule is useful — checking `if (p)` instead of `if (p != nullptr)` is idiomatic C++ — but it also creates pitfalls. `if (x = 5)` is valid C++ and is always true (it assigns 5 to x, then tests the result). Most compilers warn about this with `-Wall`. This is exactly why `if (x == 5)` vs `if (x = 5)` is the most common accidental C++ bug.

> Some programmers use "Yoda conditions" (`if (5 == x)`) to catch this at compile time — the compiler rejects `if (5 = x)` because you can't assign to a literal. Modern compilers warning flags (`-Wparentheses`) make this unnecessary.

## The Dangling Else Problem

Consider this code:

```cpp
#include <iostream>

int main() {
    int x = 5;
    int threshold = 10;

    if (x > 0)
        if (x > threshold)
            std::cout << "Large positive" << std::endl;
    else
        std::cout << "Non-positive" << std::endl;  // Which if does this else belong to?
}
```

By indentation, you might expect the `else` to match the outer `if (x > 0)`. But in C++, **an `else` always matches the nearest preceding `if`**. This code's `else` belongs to `if (x > threshold)` — so for `x = 5`, which is positive but not > threshold, the output is "Non-positive", which is wrong.

This is the **dangling else problem**, a known ambiguity in the original C grammar. The solution: **always use braces**.

```cpp
#include <iostream>

int main() {
    int x = 5;
    int threshold = 10;

    if (x > 0) {
        if (x > threshold) {
            std::cout << "Large positive" << std::endl;
        }
    } else {
        std::cout << "Non-positive" << std::endl;
    }
    // Now x=5 produces no output (correct: it's positive but small)
}
```

Making braces optional was a mistake in C's original design — one that C++ inherited and cannot remove for backward compatibility. Modern style guides (Google, LLVM, Mozilla) all mandate braces for every `if` body, even single-statement ones.

## The Ternary Operator: A Compact `if/else`

The conditional (ternary) operator `condition ? value_if_true : value_if_false` is the only C++ operator that takes three operands. It produces a value, making it useful in initializations and return statements:

```cpp
#include <iostream>
#include <string>

int main() {
    int score = 85;

    // Without ternary:
    std::string grade1;
    if (score >= 90) grade1 = "A";
    else grade1 = "B or below";

    // With ternary — more concise, produces a value
    std::string grade2 = (score >= 90) ? "A" : "B or below";

    std::cout << grade2 << std::endl;

    // Ternary is great in output chains
    int n = -5;
    std::cout << n << " is " << (n >= 0 ? "non-negative" : "negative") << std::endl;

    // Nested ternary: readable with careful formatting
    std::string letter =
        score >= 90 ? "A" :
        score >= 80 ? "B" :
        score >= 70 ? "C" :
        score >= 60 ? "D" : "F";

    std::cout << "Grade: " << letter << std::endl;
}
```

Don't abuse nested ternaries — beyond two or three levels they become unreadable. Use `if/else` for complex logic.

## The `switch` Statement: A Jump Table

Consider a game that processes player commands. An `if/else if/else` chain would work, but `switch` is cleaner when you're testing one variable against a fixed set of constants:

```cpp
#include <iostream>

int main() {
    char direction = 'N';

    switch (direction) {
        case 'N':
            std::cout << "Moving North" << std::endl;
            break;
        case 'S':
            std::cout << "Moving South" << std::endl;
            break;
        case 'E':
            std::cout << "Moving East" << std::endl;
            break;
        case 'W':
            std::cout << "Moving West" << std::endl;
            break;
        default:
            std::cout << "Unknown direction" << std::endl;
    }
}
```

Compilers typically implement `switch` as a **jump table**: an array where each index corresponds to a `case` value and contains the address to jump to. Checking `direction == 'N'` in a 26-way `if/else` chain takes up to 26 comparisons. A jump table takes one array lookup. For large switches on densely packed values, this is dramatically faster.

### Fall-Through: Intentional, But Dangerous

Here's what makes `switch` unusual: without `break`, execution **falls through** to the next case. This is not a bug — it's a feature, deliberately inherited from C, where it allowed one `case` to share code with another:

```cpp
#include <iostream>

int main() {
    int month = 4;  // April
    int daysInMonth;

    switch (month) {
        case 1: case 3: case 5: case 7:
        case 8: case 10: case 12:
            daysInMonth = 31;
            break;
        case 4: case 6: case 9: case 11:
            daysInMonth = 30;
            break;
        case 2:
            daysInMonth = 28;  // Ignoring leap years for brevity
            break;
        default:
            daysInMonth = -1;
    }

    std::cout << "Days in month " << month << ": " << daysInMonth << std::endl;
}
```

The accidental fall-through (forgetting a `break`) is one of the most common bugs in C and C++ code. In C++17, you can annotate intentional fall-through to silence compiler warnings:

```cpp
#include <iostream>

int main() {
    int x = 2;
    switch (x) {
        case 1:
            std::cout << "One" << std::endl;
            [[fallthrough]];  // C++17: intentional fall-through
        case 2:
            std::cout << "Two (or falling through from One)" << std::endl;
            break;
        case 3:
            std::cout << "Three" << std::endl;
            break;
    }
}
```

`[[fallthrough]]` is a C++17 **attribute** — a hint to the compiler that tells it your fall-through is intentional, suppressing the warning. It also signals intent to human readers.

## `if constexpr`: Compile-Time Branching

C++17 added `if constexpr`, which evaluates the condition at compile time and includes only the true branch in the generated code. This is powerful for template programming:

```cpp
#include <iostream>
#include <type_traits>

template<typename T>
void printInfo(T value) {
    if constexpr (std::is_integral_v<T>) {
        std::cout << "Integer: " << value << " (size: " << sizeof(T) << " bytes)" << std::endl;
    } else if constexpr (std::is_floating_point_v<T>) {
        std::cout << "Float: " << value << " (size: " << sizeof(T) << " bytes)" << std::endl;
    } else {
        std::cout << "Other type" << std::endl;
    }
}

int main() {
    printInfo(42);
    printInfo(3.14);
    printInfo(42LL);
}
```

Unlike a normal `if`, `if constexpr` discards the untaken branch before compilation completes — meaning the discarded branch doesn't even need to be valid code for the given type. This enables template code that behaves differently for different types without virtual dispatch or runtime overhead.

## Branch Prediction: Why Branching Has a Hidden Cost

Modern CPUs are pipelined: they start fetching the next instruction before the current one finishes. When the CPU encounters a branch (`if`), it has to guess which path the program will take — a practice called **branch prediction**. If the prediction is wrong, the CPU has to discard the work it did speculatively and start over. This can cost 10–20 clock cycles per misprediction.

For code that runs millions of times (game loops, parsers, physics engines), branch-heavy logic can be significantly slower than branchless alternatives. This is one reason the ternary operator, bitwise tricks, and `std::min`/`std::max` implementations sometimes use compiler intrinsics to avoid branches entirely.

For most code you'll write, this doesn't matter. But knowing it exists helps you understand why systems programmers sometimes write code that looks unnecessarily complex — they're working around the branching tax at the microarchitecture level.
