# Loops: The Heartbeat of Computation

At the lowest level of abstraction, a computer is a machine that reads an instruction, executes it, and increments a register called the **program counter** to the address of the next instruction. Every "loop" in a high-level language ultimately compiles to a handful of assembly instructions: compare a value, conditionally jump backward if the condition holds, continue. This pattern — the conditional backwards jump — is so fundamental that it predates high-level languages entirely.

When Fortran introduced the `DO` loop in 1957, it was revolutionary: for the first time, programmers could express iteration in mathematical terms rather than writing explicit jump instructions. When C was designed in the early 1970s, it added the `for` loop, which unified initialization, condition, and increment into a single line — a design so clean that virtually every language since has copied it. C++11's range-based `for` brought the loop into the modern era.

Understanding loops deeply means understanding not just the syntax, but what the CPU actually does, what the compiler is allowed to change, and where the real dangers lie.

## The `for` Loop: Three Clauses, One Machine

```cpp
#include <iostream>

int main() {
    // Classic for loop
    // Clause 1: initialization (runs once)
    // Clause 2: condition (checked before each iteration)
    // Clause 3: increment (runs after each iteration)
    for (int i = 0; i < 5; i++) {
        std::cout << "i = " << i << std::endl;
    }
    // i does not exist here — it's scoped to the loop
}
```

The three clauses are completely independent and all optional. You can leave any of them empty:

```cpp
#include <iostream>

int main() {
    // Initialization before the loop:
    int i = 0;
    for (; i < 5; i++) {
        std::cout << i << " ";
    }
    std::cout << std::endl;

    // Multiple variables in init and increment (comma operator):
    for (int x = 0, y = 10; x < y; x++, y--) {
        std::cout << "x=" << x << " y=" << y << std::endl;
    }

    // Non-integer step — using the increment to compute:
    for (double d = 0.0; d <= 1.0; d += 0.25) {
        std::cout << d << " ";
    }
    std::cout << std::endl;
}
```

An important nuance: the loop variable `i` declared in `for (int i = 0; ...)` is scoped to the loop. This is a C++98 feature that C89 lacked — in C89, loop variables had to be declared outside the loop. Keeping the variable inside the `for` clause reduces its visible scope to where it's actually relevant, preventing accidental reuse after the loop ends.

## The `while` Loop: When the Count Isn't Known

The `for` loop assumes you know (or can express) the iteration structure upfront. When the number of iterations depends on runtime data, `while` is often clearer:

```cpp
#include <iostream>
#include <string>

int main() {
    // Classic while loop
    int n = 100;
    int count = 0;
    while (n > 1) {
        if (n % 2 == 0) {
            n /= 2;
        } else {
            n = 3 * n + 1;  // Collatz conjecture!
        }
        count++;
    }
    std::cout << "Collatz steps for 100: " << count << std::endl;

    // Input validation loop
    int value;
    std::cout << "Enter a positive number: ";
    std::cin >> value;
    while (value <= 0) {
        std::cout << "Must be positive. Try again: ";
        std::cin >> value;
    }
    std::cout << "You entered: " << value << std::endl;
}
```

The **do-while** variant guarantees at least one execution before checking the condition — useful for menu-driven programs and input prompts where you always want to run the body once:

```cpp
#include <iostream>

int main() {
    int choice;
    do {
        std::cout << std::endl << "1. Option A" << std::endl;
        std::cout << "2. Option B" << std::endl;
        std::cout << "3. Quit" << std::endl;
        std::cout << "Choice: ";
        std::cin >> choice;

        if (choice == 1) std::cout << "You chose A" << std::endl;
        if (choice == 2) std::cout << "You chose B" << std::endl;
    } while (choice != 3);

    std::cout << "Goodbye!" << std::endl;
}
```

The difference between `while` and `do-while` is subtle: `while` checks the condition before the body runs; `do-while` checks after. For input loops where you always need to show the menu at least once, `do-while` reads more naturally.

## Range-Based `for`: The Modern Way

C++11 introduced the **range-based for loop**, which iterates over any range — array, container, or anything with `begin()` and `end()`:

```cpp
#include <iostream>
#include <vector>
#include <string>

int main() {
    // Over an array
    int numbers[] = {1, 2, 3, 4, 5};
    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;

    // Over a vector
    std::vector<std::string> fruits = {"apple", "banana", "cherry"};
    for (const std::string& fruit : fruits) {  // const& avoids copying
        std::cout << fruit << std::endl;
    }

    // Using auto to deduce type
    std::vector<double> values = {1.1, 2.2, 3.3};
    double sum = 0.0;
    for (auto v : values) {
        sum += v;
    }
    std::cout << "Sum: " << sum << std::endl;

    // Modifying elements: use reference
    std::vector<int> nums = {1, 2, 3, 4, 5};
    for (int& n : nums) {  // & means reference — modifies the actual element
        n *= 2;
    }
    for (auto n : nums) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
}
```

The `const std::string& fruit` syntax is important: without `&`, each iteration copies the string — potentially expensive for large strings or objects. With `const&`, you get a reference to the original element, read-only. With `&` (no const), you get a modifiable reference.

Under the hood, `for (auto x : container)` expands to roughly:

```cpp
auto __begin = container.begin();
auto __end   = container.end();
for (; __begin != __end; ++__begin) {
    auto x = *__begin;
    // loop body
}
```

This means range-based `for` works with any type that provides `begin()` and `end()` — your own classes included.

## `break` and `continue`: Structured Exits

`break` exits the innermost enclosing loop immediately. `continue` skips the rest of the current iteration and jumps to the next one:

```cpp
#include <iostream>

int main() {
    // break: stop when we find what we want
    std::cout << "First multiple of 7 above 50: ";
    for (int i = 51; i < 200; i++) {
        if (i % 7 == 0) {
            std::cout << i << std::endl;
            break;  // No need to keep checking
        }
    }

    // continue: skip certain elements
    std::cout << "Even numbers 1-20: ";
    for (int i = 1; i <= 20; i++) {
        if (i % 2 != 0) continue;  // Skip odd numbers
        std::cout << i << " ";
    }
    std::cout << std::endl;

    // Nested loops: break only exits the INNERMOST loop
    bool found = false;
    int target = 15;
    for (int i = 0; i <= 5 && !found; i++) {
        for (int j = 0; j <= 5; j++) {
            if (i * j == target) {
                std::cout << "Found: " << i << " x " << j << " = " << target << std::endl;
                found = true;
                break;  // Only breaks the inner loop! Outer loop checks 'found'
            }
        }
    }
}
```

Dijkstra had reservations about `break` and `continue` too — they create additional exit points that make reasoning about loop invariants harder. But unlike `goto`, they're bounded: `break` can only jump to the point just after the innermost enclosing loop. The structured nature of C++ loops, combined with `break` and `continue`, is the practical compromise between pure structured programming and the realities of efficient code.

## Infinite Loops and Event Loops

`for (;;)` and `while (true)` both create infinite loops — loops that run until explicitly stopped with `break` or `return`. This sounds alarming, but **most real programs are essentially infinite loops**:

- A web server waits for connections, handles them, waits for the next one.
- A game engine runs: process input, update state, render frame — forever.
- An OS kernel runs: wait for interrupt, handle it, repeat.

```cpp
#include <iostream>
#include <string>

int main() {
    // Simple REPL (Read-Eval-Print Loop)
    std::string line;
    std::cout << "Simple calculator (type 'quit' to exit)" << std::endl;

    while (true) {
        std::cout << "> ";
        if (!std::getline(std::cin, line)) break;  // EOF
        if (line == "quit") break;

        // Parse and evaluate (simplified)
        if (line == "hello") {
            std::cout << "Hello!" << std::endl;
        } else {
            std::cout << "Unknown command: " << line << std::endl;
        }
    }

    std::cout << "Goodbye!" << std::endl;
}
```

## Loop Performance: What the Compiler Does to Your Loops

Here's something that should both reassure and unsettle you: **the loop you write is not necessarily the loop that runs.** Modern C++ compilers — GCC, Clang, MSVC — are extraordinarily aggressive at optimizing loops.

**Loop unrolling**: A loop that runs exactly four times might be transformed into four sequential statements with no loop overhead at all.

**SIMD vectorization**: A loop that adds corresponding elements of two arrays might be compiled into a single CPU instruction that adds eight elements at once using SSE or AVX registers.

**Hoisting**: If an expression inside the loop doesn't change with iteration, the compiler moves it outside the loop.

**Elimination**: An empty loop or a loop whose results are never used may be completely removed.

These optimizations depend on the compiler being able to prove properties about your code. Undefined behavior — like accessing an array out of bounds inside a loop — is particularly dangerous because it allows the compiler to assume it never happens and produce code that behaves unexpectedly when it does.

```cpp
#include <iostream>
#include <chrono>

int main() {
    const int N = 100000000;  // 100 million
    long long sum = 0;

    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < N; i++) {
        sum += i;
    }

    auto end = std::chrono::high_resolution_clock::now();
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();

    std::cout << "Sum: " << sum << std::endl;
    std::cout << "Time: " << ms << " ms" << std::endl;
    // With -O2, the compiler might compute this in 0ms
    // because sum = N*(N-1)/2 can be calculated at compile time
}
```

The loop above, compiled with optimizations enabled, may run nearly instantly — the compiler can recognize it as a sum of an arithmetic sequence and replace the entire loop with the formula `N*(N-1)/2`. You write clear, readable code; the compiler finds the fast version. This division of labor is C++'s fundamental promise.
