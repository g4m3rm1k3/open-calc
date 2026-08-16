# Lesson 22: constexpr and Compile-Time Computation

**What you will build:** A series of isolated console programs that calculate values before the program even runs, proving how the C++ compiler can act as an execution engine to shift work from runtime to compile time. 

**What you need to know first:** Lesson 01 Types and Variables, Lesson 05 Functions.

**Terms introduced in this lesson:**
- **Compile-time** — the phase when the C++ compiler translates your source code into a runnable executable. *Why it exists:* to parse code, verify safety, and now, to perform calculations before the user ever runs the program.
- **Runtime** — the phase when the compiled executable is actually running on the computer. *Why it exists:* to handle user input, interact with the operating system, and do work that couldn't be known in advance.
- **`constexpr`** — a language keyword meaning "constant expression." *Why it exists:* to explicitly command the compiler to evaluate a variable or function during compile time rather than waiting for runtime.

**Objects and methods used:**
- **`std::cout`** (from `<iostream>`)
  - *What it is:* The standard character output stream.
  - *Implementation:* An instance of `std::ostream` globally available in the standard library.
  - *Its use:* To make the internal state of your variables visible on the terminal so you can verify what your program is doing.

---

## Concept Unit: constexpr Variables

### The Problem
A program often needs values that never change and can be completely determined by the programmer writing the code. If you define seconds in an hour as `60 * 60`, a standard variable forces the computer to do that multiplication every single time the program runs. We need a way to tell the compiler to do the math once, while building the program, and bake the final answer directly into the executable.

### The New Code
```cpp
#include <iostream>

int main() {
    constexpr int seconds_per_minute = 60;
    constexpr int minutes_per_hour = 60;
    
    // The compiler does this multiplication, not the running program
    constexpr int seconds_per_hour = seconds_per_minute * minutes_per_hour;

    std::cout << "Seconds in an hour: " << seconds_per_hour << "\n";
    return 0;
}
```

### The Updated Project
Because this is an isolated concept, this code stands alone. There is no surrounding project context yet.

### Mechanical Walkthrough
- `#include <iostream>` includes the standard library header required to print text to the screen.
- `constexpr int seconds_per_minute = 60;` declares an integer variable and marks it with `constexpr`. This guarantees two things: the value will never change, and the compiler must know its exact value right now.
- `constexpr int minutes_per_hour = 60;` declares a second compile-time constant.
- `constexpr int seconds_per_hour = seconds_per_minute * minutes_per_hour;` instructs the compiler to multiply the two values together *while it builds the program*. When the executable is generated, the multiplication is gone; the program only contains the hardcoded number `3600`.
- `std::cout << "Seconds in an hour: " << seconds_per_hour << "\n";` prints the pre-calculated result to the terminal.

### CS Lens
This embodies the concept of **Constant Folding** and **Compile-time Evaluation**. By shifting computation from runtime to compile time, the program uses fewer CPU cycles when running. The C++ compiler is not just a translator; it contains an interpreter capable of executing C++ code during the build process.

### SE Lens
The engineering principle is **Zero-Cost Abstraction**. The alternative not chosen is defining constants with `#define`, which operates via blind text replacement before the compiler even sees the code, circumventing type safety. `constexpr` provides the performance of hardcoded numbers while retaining strict type checking and scoping rules.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o app` — compiles the source code into an executable named `app`, enforcing C++17 rules.
- `./app` — runs the compiled executable.

### Run It Yourself
1. Create a file named `main.cpp` and paste the code above.
2. Compile the program: `g++ -std=c++17 main.cpp -o app`.
3. Run it: `./app`.
4. Expected output:
   ```
   Seconds in an hour: 3600
   ```
5. We discard this code; it exists only to prove the concept.

---

## Concept Unit: constexpr Functions

### The Problem
Doing compile-time math inline gets messy quickly. We want to use functions to organize our logic, but regular functions execute at runtime. If we call a regular function to initialize a `constexpr` variable, the compiler will reject it because it cannot run a normal function during the build. We need a way to tell the compiler a function is safe to execute at compile time.

### The New Code
```cpp
#include <iostream>

// Marked constexpr so the compiler can execute it
constexpr int calculateArea(int width, int height) {
    return width * height;
}

int main() {
    constexpr int area = calculateArea(5, 10);
    std::cout << "Calculated area: " << area << "\n";
    return 0;
}
```

### The Updated Project
Because this is an isolated concept, this code stands alone.

### Mechanical Walkthrough
- `constexpr int calculateArea(int width, int height)` defines a function but adds the `constexpr` keyword to its signature. This signals to the compiler that if the arguments provided are known at compile time, the compiler itself is allowed to execute this function.
- `return width * height;` performs the math. A `constexpr` function is restricted in what it can do — it cannot read files, print to the screen, or rely on anything unknown until the program runs.
- `constexpr int area = calculateArea(5, 10);` calls the function. Because `5` and `10` are literal numbers (known at compile time), and `area` is marked `constexpr`, the compiler executes `calculateArea` right now. The executable will simply contain the number `50`.

### CS Lens
This embodies the concept of **Pure Functions**. A pure function relies only on its inputs and produces no side effects. Because a compile-time function cannot interact with the outside world (no global state, no I/O), C++ enforces a degree of purity on any function executed during the build.

### SE Lens
The alternative not chosen is writing two separate functions: one for compile-time calculation and one for runtime calculation. The C++ tradeoff is unification. A `constexpr` function can *also* be called at runtime if given variables that aren't known until then. You write the logic once, and the compiler decides when to execute it based on when the data is available.

### Run It Yourself
1. Replace the contents of `main.cpp` with the code above.
2. Compile the program: `g++ -std=c++17 main.cpp -o app`.
3. Run it: `./app`.
4. Expected output:
   ```
   Calculated area: 50
   ```
5. We discard this code; it exists only to prove the concept.

---

## Concept Unit: if constexpr

### The Problem
Sometimes we want to conditionally compile code based on a value we know at compile time. A regular `if` statement evaluates the condition at runtime, meaning the compiler must compile both the `true` and `false` branches into the executable, even if one branch is mathematically impossible to reach. We need a way to force the compiler to completely discard the dead branch.

### The New Code
```cpp
#include <iostream>

constexpr bool is_debug_mode = true;

int main() {
    if constexpr (is_debug_mode) {
        std::cout << "Debug mode is ON. Compiling debug tools...\n";
    } else {
        // The compiler ignores this block entirely
        std::cout << "Production mode. Debug tools stripped out.\n";
    }
    return 0;
}
```

### The Updated Project
Because this is an isolated concept, this code stands alone.

### Mechanical Walkthrough
- `constexpr bool is_debug_mode = true;` creates a compile-time boolean constant.
- `if constexpr (is_debug_mode)` evaluates the condition during compilation. Unlike a normal `if`, this instructs the compiler to selectively compile branches.
- `std::cout << "Debug mode is ON...` is the true branch. Because `is_debug_mode` is true, the compiler includes this code in the final executable.
- `} else { ... }` is the false branch. Because the condition is proven false at compile time, the compiler completely ignores the contents of this block. The code inside it doesn't just get skipped at runtime; it literally does not exist in the final compiled program.

### CS Lens
This embodies **Static Branching** and guaranteed **Dead Code Elimination**. While an optimizer might try to remove unreachable code in a normal `if`, `if constexpr` guarantees it at the language level. The discarded branch does not even need to be fully valid code for the current type context, so long as it is syntactically valid C++.

### SE Lens
The alternative not chosen is using the C preprocessor (`#ifdef DEBUG`), which performs brute-force text manipulation before the compiler runs. The tradeoff here is scope and safety. `#ifdef` macros leak across entire projects and ignore namespaces. `if constexpr` respects C++ scoping, type checking, and variables, providing clean conditional compilation without the chaos of the preprocessor.

### Run It Yourself
1. Replace the contents of `main.cpp` with the code above.
2. Compile the program: `g++ -std=c++17 main.cpp -o app`.
3. Run it: `./app`.
4. Expected output:
   ```
   Debug mode is ON. Compiling debug tools...
   ```
5. We discard this code; it exists only to prove the concept.

---

## Connect the Pieces

Observe how `constexpr` transforms the C++ compiler from a passive translator into an active execution engine:
We define `constexpr int multiplier = 10;`. We write a pure function `constexpr int multiply(int a, int b) { return a * b; }`. We use it in a static branch: `if constexpr (multiply(multiplier, 2) == 20) { ... }`. All of this logic, function calling, and branching executes immediately when you run `g++`. By the time the user double-clicks the resulting executable, the work is already finished.

## What Breaks Without This

Without `constexpr`, the compiler cannot guarantee that an expression is evaluated at compile time. Let's force the compiler to stop you.

Create a console project and write this code:
```cpp
int getRuntimeValue() {
    return 42;
}

int main() {
    constexpr int value = getRuntimeValue();
    return 0;
}
```

Run `g++ -std=c++17 main.cpp -o app`. The compilation fails before the program ever runs.
**The error:**
`error: constexpr variable 'value' must be initialized by a constant expression`

The compiler caught the logic flaw. You asked it to guarantee that `value` is known at compile time, but you called a runtime function `getRuntimeValue()`, which the compiler is not allowed to execute. Restore it by either removing `constexpr` from `value`, or adding `constexpr` to `getRuntimeValue()`.

## Exercises

1. Create a `constexpr` variable representing the number of days in a standard year (365). Use it to calculate the number of hours in a year into a second `constexpr` variable. Print the result.
2. Write a `constexpr` function that takes a number and returns its square (number * number). Call it to initialize a `constexpr` variable and print it.
3. Change the `is_debug_mode` variable in the `if constexpr` example to `false`. Recompile and run the program to prove that the production message prints and the debug message is completely stripped out.

## Definition of Done
- [ ] You have written and executed code that calculates mathematical values at compile time using `constexpr` variables.
- [ ] You have written a `constexpr` function and successfully initialized a `constexpr` variable with its return value.
- [ ] You have used `if constexpr` to selectively include and exclude code from the final executable.
- [ ] You can explain the difference between compile time and runtime out loud, in your own words, to someone who hasn't read this lesson.
- [ ] You have run `git commit -m "Complete Lesson 22: understand constexpr and compile-time evaluation"`.
