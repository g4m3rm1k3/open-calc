---
series: cpp-fundamentals
level: 2
title: Functions
lang: cpp
---

# Functions

A function in C++ must declare its return type before the name, and each parameter's type before its name. This is the compiler's way of knowing the memory layout at every call site before the program runs — there is no dynamic dispatch over types. The return type and parameter types form the function's **signature**, which is checked at every call.

## Declaring and Calling Functions

In C++, a function must be declared before it is called. The simplest approach: define the function above `main`:

```cpp
#include <iostream>
using namespace std;

double celsiusToFahrenheit(double celsius) {
    return celsius * 9.0 / 5.0 + 32.0;
}

int main() {
    cout << celsiusToFahrenheit(0.0)   << endl;
    cout << celsiusToFahrenheit(100.0) << endl;
    cout << celsiusToFahrenheit(37.0)  << endl;
    return 0;
}
```

```text
32
212
98.6
```

`double celsiusToFahrenheit(double celsius)` — the function signature: return type `double`, name `celsiusToFahrenheit`, one parameter of type `double` named `celsius`.

`return celsius * 9.0 / 5.0 + 32.0;` — computes the expression and returns the result. Execution returns to the call site. Anything after `return` in the same block is unreachable.

**CS lens:** Each call to `celsiusToFahrenheit` creates a stack frame containing the local copy of `celsius`. This copy is separate from any variable at the call site — changing `celsius` inside the function would not change anything outside. This is **pass by value**: the function receives a copy of the argument.

## Multiple Parameters and Return Types

```cpp
#include <iostream>
using namespace std;

int clamp(int value, int minimum, int maximum) {
    if (value < minimum) return minimum;
    if (value > maximum) return maximum;
    return value;
}

int main() {
    cout << clamp(5, 0, 10)  << endl;
    cout << clamp(-3, 0, 10) << endl;
    cout << clamp(15, 0, 10) << endl;
    return 0;
}
```

```text
5
0
10
```

Multiple parameters are separated by commas. Each has its own type declaration.

`return` may appear at multiple points in a function. The first `return` reached ends the function. The remaining `if` branches are not checked.

## void — Functions That Return Nothing

`void` as a return type means the function produces no value:

```cpp
#include <iostream>
using namespace std;

void printSeparator(int width) {
    for (int i = 0; i < width; i++) {
        cout << "-";
    }
    cout << endl;
}

int main() {
    printSeparator(20);
    cout << "Result: 42" << endl;
    printSeparator(20);
    return 0;
}
```

```text
--------------------
Result: 42
--------------------
```

`void` functions exist purely for their side effects (output, file writes, state changes). They may use `return;` (no value) to exit early, or simply run to the closing brace.

## Function Overloading

C++ allows multiple functions with the same name, as long as their parameter types differ:

```cpp
#include <iostream>
using namespace std;

double square(double x) {
    return x * x;
}

int square(int x) {
    return x * x;
}

int main() {
    cout << square(4)   << endl;
    cout << square(4.5) << endl;
    return 0;
}
```

```text
16
20.25
```

The compiler selects the correct version based on the argument type at the call site. `square(4)` calls the `int` version; `square(4.5)` calls the `double` version.

**SE lens:** Overloading lets you provide the same conceptual operation for different types without forcing the caller to use a different name. It is one reason C++ can feel more ergonomic than C (which has no overloading and requires names like `sqrtf` vs `sqrt` vs `sqrtl`).

## Forward Declarations

If a function is defined after `main`, add a **forward declaration** (prototype) before `main`:

```cpp
#include <iostream>
using namespace std;

int factorial(int n);   // forward declaration

int main() {
    cout << factorial(5) << endl;
    cout << factorial(0) << endl;
    return 0;
}

int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

```text
120
1
```

`int factorial(int n);` — a prototype: the signature followed by a semicolon, no body. Tells the compiler what the function looks like so it can type-check calls before seeing the definition.

## Challenge: is_prime

Write a function `bool isPrime(int n)` that returns `true` if `n` is a prime number and `false` otherwise. A prime is an integer greater than 1 with no divisors other than 1 and itself. Write `main` to call `isPrime` with several values and print the results.

A number `n` is prime if no integer from `2` to `n-1` divides it evenly. `n % divisor == 0` means `divisor` divides `n`.

```challenge
#include <iostream>
using namespace std;

bool isPrime(int n) {
    // TODO
}

int main() {
    cout << isPrime(2)  << endl;
    cout << isPrime(7)  << endl;
    cout << isPrime(10) << endl;
    cout << isPrime(1)  << endl;
    return 0;
}
```

```test
#include <iostream>
#include <cassert>
using namespace std;

bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i < n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    assert(isPrime(2)  == true);
    assert(isPrime(7)  == true);
    assert(isPrime(10) == false);
    assert(isPrime(1)  == false);
    assert(isPrime(13) == true);
    cout << "ok" << endl;
    return 0;
}
```
