# Lesson 34: Undefined Behavior

**What you will build:** You will write isolated code snippets that violate the rules of the C++ language in ways that do not produce compilation errors. This proves that C++ compilers do not stop you from writing invalid programs, and demonstrates how to use sanitizers to detect these silent failures before they cause unpredictable bugs in production. This solves the fundamental problem of how to trust a codebase when the language itself does not guarantee safe execution.

**What you need to know first:** Lesson 02 Memory The Stack and the Heap, Lesson 03 Pointers.

**Terms used in this lesson:**
- **Undefined Behavior (UB)** — a situation where the C++ standard imposes no requirements on what the program does. *Why it exists:* To allow C++ to run as fast as possible by not requiring the compiler to inject runtime safety checks for every operation.
- **Compiler Optimization** — the process where the compiler rewrites your code to run faster or use less memory. *Why it exists:* To make abstractions (like function calls and loops) cost nothing at runtime.
- **Sanitizer** — a diagnostic tool integrated into the compiler that injects runtime checks into your executable. *Why it exists:* To actively detect and report Undefined Behavior during testing, since the compiler normally assumes it never happens.
- **Shadow Memory** — a separate region of memory maintained by a sanitizer to track the validity of the application's actual memory. *Why it exists:* To provide a fast, parallel accounting system that can verify if a pointer access is legal without complex runtime structures.

**Objects and methods used:**
- **-fsanitize=address**
  - *What it is:* A compiler flag that enables AddressSanitizer (ASan).
  - *Implementation:* Passed to `g++` or `clang++` as a command-line argument during compilation.
  - *Its use:* Detects memory-related Undefined Behavior like out-of-bounds array accesses and use-after-free errors.
- **-fsanitize=undefined**
  - *What it is:* A compiler flag that enables UndefinedBehaviorSanitizer (UBSan).
  - *Implementation:* Passed to `g++` or `clang++` as a command-line argument during compilation.
  - *Its use:* Detects logic-related Undefined Behavior like signed integer overflow and division by zero.

---

## Concept Unit: The Reality of Undefined Behavior

### The Problem
When you do something illegal in C++, like reading beyond the end of an array, the language does not promise to crash. It promises absolutely nothing. You need to understand what this lack of a promise actually looks like in practice, because assuming an invalid operation will cleanly halt your program is a dangerous misconception in C++.

### The New Code
```cpp
#include <iostream>

int main() {
    int numbers[3] = {10, 20, 30};
    
    // Attempting to read past the end of the array
    std::cout << "The fourth element is: " << numbers[3] << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `int numbers[3] = {10, 20, 30};` — allocates an array of precisely 3 integers on the stack. The valid indices are `0`, `1`, and `2`.
- `numbers[3]` — asks the program to read the memory located exactly one integer's width past the end of the array. Because C++ does not perform bounds checking, it faithfully computes the memory address where the fourth element *would* be, and reads whatever bits happen to live there.
- `std::cout << ...` — prints the garbage value retrieved from that memory address.

### CS Lens
Undefined Behavior is a breach of contract between the programmer and the compiler. High-level languages like Java or Python check every array access at runtime and throw an `IndexOutOfBoundsException` if the access is illegal. C++ does not. It translates the array access directly into a hardware memory offset. The CPU blindly reads whatever happens to be at that memory address, whether it belongs to your array, another variable, or uninitialized memory.

### SE Lens
The C++ standard defines this as Undefined Behavior to guarantee zero-overhead abstraction. The alternative not chosen is requiring the compiler to automatically inject a bounds check before every array access. C#'s approach costs CPU cycles for every read. C++'s approach is infinitely faster, but costs the developer the burden of absolute correctness, because an error might silently corrupt data instead of cleanly crashing.

### Run It Yourself
1. Open a terminal.
2. Save the code above in a file named `out_of_bounds.cpp`.
3. Compile it: `g++ -std=c++17 out_of_bounds.cpp -o out_of_bounds`
4. Run it: `./out_of_bounds` (or `out_of_bounds.exe` on Windows).
5. Observe the output. You will not see a crash. You will see a random number (garbage memory) printed to the console.

---

## Concept Unit: The Compiler's Assumption

### The Problem
The danger of Undefined Behavior is not just that you might read garbage memory at runtime. It is that the compiler is legally allowed to assume your program *never* contains Undefined Behavior. If the compiler sees a path of code that contains Undefined Behavior, it can optimize your code by rewriting or deleting that path entirely, altering the fundamental logic of your program.

### The New Code
```cpp
#include <iostream>

bool isPositive(int value) {
    // If value is 2147483647, adding 1 causes a signed integer overflow.
    // Signed integer overflow is Undefined Behavior.
    return (value + 1) > value;
}

int main() {
    int maxInt = 2147483647;
    std::cout << "Is (maxInt + 1) > maxInt? " << isPositive(maxInt) << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `bool isPositive(int value)` — declares a function that takes a signed integer and returns a boolean.
- `return (value + 1) > value;` — evaluates whether adding 1 to the value makes it larger. Mathematically, this is always true.
- `int maxInt = 2147483647;` — assigns the maximum possible value for a 32-bit signed integer.
- `isPositive(maxInt)` — passes `maxInt` into the function. Inside the function, `maxInt + 1` causes a signed integer overflow. In C++, signed integer overflow is explicitly defined as Undefined Behavior.

### CS Lens
Compiler optimization relies on mathematical axioms. Because signed integer overflow is Undefined Behavior, the optimizer is mathematically justified in assuming it will *never* occur. Since the overflow never occurs, the compiler deduces that `value + 1` must *always* be strictly greater than `value`. Therefore, the compiler optimizes the entire `isPositive` function down to a single instruction that simply returns `true`. It deletes the check entirely.

### SE Lens
The standard could have defined signed integer overflow to reliably wrap around to negative numbers (which is what unsigned integers do). The tradeoff is that certain loop optimizations would become impossible, slowing down valid code. By declaring it Undefined Behavior, the standard prioritizes the maximum performance of correct programs over the predictable execution of incorrect ones.

### Run It Yourself
1. Save the code above in a file named `overflow.cpp`.
2. Compile it with high optimization enabled: `g++ -std=c++17 -O3 overflow.cpp -o overflow`
3. Run it: `./overflow`
4. Observe the output. It prints `1` (true). The compiler optimized the check away, assuming the overflow never happened, even though mathematically a 32-bit integer wrapping around would result in a negative number that is *not* greater than `maxInt`.

---

## Concept Unit: Detecting UB with Sanitizers

### The Problem
Because the compiler assumes Undefined Behavior never happens, it will not warn you when you write it. And because Undefined Behavior can fail silently at runtime, you cannot rely on crashes to find it. You need a tool that actively watches your program execute and stops it the exact moment Undefined Behavior occurs.

### The New Code
This unit uses the exact same code from the first unit (`out_of_bounds.cpp`), but changes how it is compiled.

```bash
# Compile with AddressSanitizer and Debug Symbols
g++ -std=c++17 -fsanitize=address -g out_of_bounds.cpp -o out_of_bounds_sanitized
```

### Mechanical Walkthrough
- `g++` — invokes the C++ compiler.
- `-std=c++17` — tells the compiler to use the C++17 standard.
- `-fsanitize=address` — instructs the compiler to inject bookkeeping code around every memory allocation and memory access in your program.
- `-g` — instructs the compiler to include debug information in the executable. This ensures the sanitizer can map the memory error back to the exact line number in your source code.
- `out_of_bounds.cpp -o out_of_bounds_sanitized` — specifies the input file and the output executable name.

### CS Lens
Sanitizers use a technique called shadow memory. For every 8 bytes of memory your program uses, AddressSanitizer allocates 1 byte in a separate, hidden region (the shadow memory) to track its state (e.g., valid, freed, unallocated). During compilation, AddressSanitizer injects a check before every single memory read or write. If the target address is marked as invalid in the shadow memory, the program immediately halts and prints a stack trace.

### SE Lens
Sanitizers are not meant for production binaries because they drastically slow down execution and consume significantly more memory. The standard engineering practice is to run your entire test suite with sanitizers enabled in a Continuous Integration (CI) environment. This catches Undefined Behavior during automated testing, ensuring the bugs never reach production.

### Run It Yourself
1. Ensure you have the code from the first unit saved in `out_of_bounds.cpp`.
2. Compile it using the sanitizer command: `g++ -std=c++17 -fsanitize=address -g out_of_bounds.cpp -o out_of_bounds_sanitized`
3. Run it: `./out_of_bounds_sanitized`
4. Observe the output. Instead of silently printing a garbage number, the program will crash violently with an `ERROR: AddressSanitizer: stack-buffer-overflow`, pointing exactly to the line where `numbers[3]` was accessed.

---

## Connect the Pieces

A piece of code attempting to perform an illegal memory access:

1. `int numbers[3] = {10, 20, 30};` — allocates valid memory.
2. `int badRead = numbers[3];` — attempts an out-of-bounds access. Without sanitizers, the compiler assumes this Undefined Behavior won't happen, performs the read, and silently retrieves garbage memory.
3. `g++ -fsanitize=address` — recompiles the program, fundamentally altering the generated executable.
4. `int badRead = numbers[3];` — at runtime, the AddressSanitizer intercepts the read, checks the shadow memory, discovers the address is unallocated, and terminates the program instantly.

## What Breaks Without This

Without sanitizers, Undefined Behavior lies dormant. A program might run perfectly on your machine, but crash on your user's machine because their memory layout is slightly different. It might run perfectly in debug mode, but behave erratically in release mode because the optimizer deleted a critical `if` statement. Sanitizers are the only reliable mechanism to prove your code is free of silent Undefined Behavior.

## Exercises

1. **UndefinedBehaviorSanitizer (UBSan):** Compile the `overflow.cpp` code from the second unit using `-fsanitize=undefined -g`. Run the resulting executable. Observe how UBSan catches the signed integer overflow at runtime and halts the program with a descriptive error.
2. **Use-After-Free:** Write a program that allocates an integer on the heap using `new`, deletes it using `delete`, and then attempts to print the value of the deleted pointer. Compile it normally and observe the silent failure. Recompile it with `-fsanitize=address` and observe the AddressSanitizer intercepting the use-after-free violation.

## Definition of Done
- [ ] You have compiled and run the out-of-bounds array access.
- [ ] You have compiled the overflow example with optimizations and observed the compiler delete the check.
- [ ] You have compiled the out-of-bounds example with `-fsanitize=address` and observed the sanitizer catch the error.
- [ ] You understand that Undefined Behavior does not guarantee a crash.
- [ ] You can explain why the compiler is allowed to assume Undefined Behavior never happens.
- [ ] You can explain Undefined Behavior out loud, in your own words, to someone who hasn't read this lesson.
