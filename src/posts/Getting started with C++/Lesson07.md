# Functions: Abstraction, the Stack, and Why Return Types Matter

In 1957, the creators of FORTRAN had a problem. Subroutines — reusable code blocks — had existed in assembly language for years. You'd write a sequence of instructions, and other code could jump to them with a `CALL` instruction. When the subroutine finished, it would `RET` — return to wherever it was called from. But these early subroutines had no local variables. Every piece of data lived in a globally fixed memory address. If you called a subroutine from two places, or if it called itself, data would be overwritten.

The solution was the **call stack** — an idea that seems obvious in retrospect but required genuine insight to design. Each function call would allocate a **stack frame**: a block of memory holding its local variables, the return address (where to jump back to), and the caller's saved register state. When the function returned, its frame was popped off the stack and memory was reclaimed. This mechanism is what makes recursion possible. It's what makes C++ functions what they are today.

## Anatomy of a Function

```cpp
#include <iostream>

// Function declaration (can appear before main, in a header)
double circleArea(double radius);

// Function definition (the actual implementation)
double circleArea(double radius) {
    const double PI = 3.14159265358979323846;
    return PI * radius * radius;
}

// Function with multiple parameters
std::string classify(int score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}

int main() {
    double r = 5.0;
    std::cout << "Area of circle with radius " << r << ": " << circleArea(r) << std::endl;

    for (int score : {95, 82, 74, 61, 45}) {
        std::cout << "Score " << score << " -> " << classify(score) << std::endl;
    }
}
```

The **declaration** (also called a *prototype*) tells the compiler: "this function exists, it takes these parameters, and returns this type." The **definition** provides the body. Declarations allow you to use a function before you've defined it — crucial in larger programs where files reference each other.

## Parameters Are Copies

Here's one of the most important things to understand about C++ functions: **parameters are copied**. When you pass a variable to a function, the function receives a copy of the value. Modifying the parameter inside the function does *not* affect the original.

```cpp
#include <iostream>

void tryToDouble(int x) {
    x = x * 2;  // Modifies the local copy — caller's variable unchanged
    std::cout << "Inside function: " << x << std::endl;
}

void actuallyDouble(int& x) {  // & makes this a REFERENCE — an alias
    x = x * 2;  // Modifies the caller's actual variable
    std::cout << "Inside function: " << x << std::endl;
}

int main() {
    int n = 10;

    tryToDouble(n);
    std::cout << "After tryToDouble: " << n << std::endl;  // Still 10!

    actuallyDouble(n);
    std::cout << "After actuallyDouble: " << n << std::endl;  // Now 20
}
```

This "pass by value" default is a deliberate safety feature. It prevents functions from accidentally modifying the caller's data. When you *do* want modification, you explicitly ask for it with `&` (pass by reference). When you want efficiency without modification (e.g. passing a large struct), use `const&`:

```cpp
#include <iostream>
#include <string>

// Passing large objects efficiently
void printName(const std::string& name) {  // const& = no copy, no modification
    std::cout << "Name: " << name << std::endl;
}

// Returning large objects (modern compilers use RVO - Return Value Optimization)
std::string buildGreeting(const std::string& name) {
    return "Hello, " + name + "! Welcome to C++.";  // No copy in practice
}

int main() {
    std::string name = "Bjarne Stroustrup";
    printName(name);
    std::string greeting = buildGreeting(name);
    std::cout << greeting << std::endl;
}
```

## Default Arguments

C++ allows parameters to have default values, making them optional when calling the function:

```cpp
#include <iostream>
#include <string>

void log(const std::string& message, const std::string& level = "INFO", bool timestamp = false) {
    if (timestamp) std::cout << "[2024] ";
    std::cout << "[" << level << "] " << message << std::endl;
}

int main() {
    log("Server started");                       // uses all defaults
    log("Connection failed", "ERROR");           // overrides level
    log("Request processed", "DEBUG", true);     // overrides all
}
```

Default arguments must be specified in the declaration (or definition if there's no separate declaration) and must appear at the end of the parameter list. Once a parameter has a default, all subsequent parameters must also have defaults.

## Function Overloading and Name Mangling

C++ allows multiple functions with the same name, as long as their parameter types differ. The compiler picks the right one based on the argument types at the call site:

```cpp
#include <iostream>

// Three functions named 'print' — different parameters
void print(int x) {
    std::cout << "int: " << x << std::endl;
}

void print(double x) {
    std::cout << "double: " << x << std::endl;
}

void print(const std::string& x) {
    std::cout << "string: " << x << std::endl;
}

int main() {
    print(42);        // Calls print(int)
    print(3.14);      // Calls print(double)
    print("hello");   // Calls print(const std::string&)
}
```

Internally, the compiler implements this by **name mangling**: each `print` is given a unique internal name that encodes its parameter types. On Linux with GCC, `print(int)` becomes `_Z5printi`, `print(double)` becomes `_Z5printd`. This is why linking C++ and C code requires `extern "C"` — C has no name mangling, so the linker needs to be told not to mangle.

## Recursion and the Call Stack

A function can call itself. Recursion is a mathematical concept made executable:

```cpp
#include <iostream>

// Factorial: n! = n * (n-1) * ... * 1
long long factorial(int n) {
    if (n <= 1) return 1;  // Base case
    return n * factorial(n - 1);  // Recursive case
}

// Fibonacci — demonstrating why naive recursion can be slow
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);  // Exponential time!
}

int main() {
    for (int i = 0; i <= 10; i++) {
        std::cout << i << "! = " << factorial(i) << std::endl;
    }

    std::cout << std::endl;
    for (int i = 0; i <= 15; i++) {
        std::cout << "fib(" << i << ") = " << fibonacci(i) << std::endl;
    }
}
```

Each call to `factorial(n)` creates a new stack frame with its own copy of `n`. When `factorial(1)` returns, its frame is popped, `factorial(2)` resumes, and so on. For `factorial(10)`, there are 10 stack frames active simultaneously.

The danger: **stack overflow**. The call stack is finite — typically 1–8 MB. A recursion that goes thousands of levels deep will exhaust it. `fibonacci(50)` would create billions of recursive calls (it recomputes the same values exponentially). This is why iterative solutions or memoization (caching results) are preferred for deep or wide recursion.

## `constexpr` Functions: Computed at Compile Time

A `constexpr` function can be evaluated by the compiler during compilation when its arguments are constant expressions:

```cpp
#include <iostream>

constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr double power(double base, int exp) {
    return exp == 0 ? 1.0 : base * power(base, exp - 1);
}

int main() {
    // These are computed at compile time — zero runtime cost
    constexpr int f5 = factorial(5);   // 120
    constexpr double p = power(2.0, 10);  // 1024.0

    std::cout << "5! = " << f5 << std::endl;
    std::cout << "2^10 = " << p << std::endl;

    // Can also be called at runtime with non-constant arguments
    int n;
    std::cin >> n;
    std::cout << n << "! = " << factorial(n) << std::endl;
}
```

`constexpr` functions are one of C++'s most powerful features for zero-cost abstraction: write clear, readable functions, and let the compiler compute results at compile time when possible.

## Functions as First-Class Values

C++11 introduced **lambda functions** — anonymous functions that can be assigned to variables and passed around:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7, 4, 6};

    // Lambda: [capture](parameters) -> return_type { body }
    auto isEven = [](int n) { return n % 2 == 0; };

    // Count even numbers
    int evenCount = std::count_if(numbers.begin(), numbers.end(), isEven);
    std::cout << "Even numbers: " << evenCount << std::endl;

    // Sort in descending order
    std::sort(numbers.begin(), numbers.end(), [](int a, int b) { return a > b; });

    // Print
    for (auto n : numbers) std::cout << n << " ";
    std::cout << std::endl;

    // Capturing variables from surrounding scope
    int threshold = 5;
    auto aboveThreshold = [threshold](int n) { return n > threshold; };
    int count = std::count_if(numbers.begin(), numbers.end(), aboveThreshold);
    std::cout << "Numbers above " << threshold << ": " << count << std::endl;
}
```

Lambdas are syntactic sugar for anonymous classes with an `operator()`. They're one of C++11's most transformative features, enabling functional programming patterns without the runtime overhead of traditional function objects.

The call stack, the discipline of pass-by-value, the ability to overload and specialize — these make C++ functions more than syntax. They're a contract between the programmer and the machine, and understanding them deeply is what separates C++ code that works from C++ code that works *reliably*.
