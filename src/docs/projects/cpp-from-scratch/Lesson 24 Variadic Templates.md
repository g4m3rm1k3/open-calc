# Lesson 24: Variadic Templates

**What you will build:** You will write functions and type definitions that accept an unlimited number of arguments of differing types, rather than hardcoding a fixed number of parameters. The transferable problem this solves is creating flexible, type-safe APIs that can handle arbitrary combinations of data without duplicating code for every possible parameter count.

**What you need to know first:** Lesson 11 Templates, Lesson 23 Type Deduction.

**Terms introduced in this lesson:**
- **Variadic template** — A template that takes a variable number of template parameters. *Why it exists:* To allow functions and classes to accept an arbitrary list of types without writing separate overloads for one, two, or ten arguments.
- **Parameter pack** — The actual list of parameters accepted by a variadic template, denoted by an ellipsis (`...`). *Why it exists:* To bundle an unknown number of types or values into a single referencable name so the compiler can process them together.
- **Pack expansion** — The process of unpacking a parameter pack into separate, comma-separated arguments using an ellipsis. *Why it exists:* Because a pack cannot be used directly as a value; it must be expanded so the compiler can feed the individual items to functions or classes that expect discrete variables.
- **sizeof... operator** — An operator that returns the number of elements in a parameter pack. *Why it exists:* To allow code to make compile-time decisions based on how many arguments were passed.

**Objects and methods used:**
- **std::tuple**
  - *What it is:* A fixed-size collection of heterogeneous values, capable of holding multiple different types in a single object.
  - *Implementation:* `template< class... Types > class tuple;`
  - *Its use:* To store the contents of an arbitrary parameter pack in memory securely.
- **std::get**
  - *What it is:* A template function to extract an element from a tuple by its specific position.
  - *Implementation:* `template< std::size_t I, class... Types > constexpr std::tuple_element_t<I, tuple<Types...>>& get( tuple<Types...>& t ) noexcept;`
  - *Its use:* To retrieve a strongly-typed value from a `tuple` since we cannot use a dynamic runtime index.

---

## Concept Unit: Parameter Packs

### The Problem
When you write a function, you must declare exactly how many arguments it takes. If you want a function that processes two values, you write one with two parameters. If you want three, you write an overload with three. We need a way to pass any number of type-safe arguments to a single function definition, without writing endless overloads, while keeping the compiler's strict type checking intact.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because this lesson uses isolated examples to prove language mechanics.
- **Files affected:** `main.cpp` (created)
- **Change type:** Add
- **Location:** A brand-new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>

template<typename... Args>
void countArguments(Args... args) {
    std::cout << "Number of arguments: " << sizeof...(args) << "\n";
}

int main() {
    countArguments(1);
    countArguments("hello", 3.14, 'c');
    countArguments();
    return 0;
}
```

### The Updated Project
This is the complete `main.cpp`. It introduces a single template function that can accept one, three, or zero arguments, and prints the count of arguments provided.

### Mechanical Walkthrough
- `template<typename... Args>`: Declares a **variadic template**. The ellipsis (`...`) before `Args` means this is a type **parameter pack**. It tells the compiler to accept zero or more types and bundle them under the name `Args`. Without this, the template could only accept exactly one type.
- `void countArguments(Args... args)`: Uses the type pack `Args` to declare a function parameter pack named `args`. The ellipsis here means "zero or more function arguments". Without this, the function could only take a fixed number of parameters.
- `sizeof...(args)`: The `sizeof...` operator (note the ellipsis) counts the number of elements in a parameter pack at compile time. It does not compute byte size in memory; it computes the pack length.
- `countArguments("hello", 3.14, 'c');`: Calls the function. The compiler deduces `Args` to be `<const char*, double, char>` and generates a specialized version of the function for those exact three types.

### CS Lens
This is compile-time code generation for arity (the number of arguments a function takes). The C++ compiler generates a distinct, perfectly sized function for every unique combination of arguments you pass, ensuring absolute type safety with zero runtime overhead. 

### SE Lens
The alternative not chosen is writing overloaded functions for 1, 2, 3, up to N arguments. The tradeoff is increased compiler work (generating multiple functions behind the scenes) and potentially larger executable size if the function is called with many different type combinations, in exchange for removing immense code duplication in the source files.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main`: Compiles the file with C++17 support.
- `./main` (Linux/macOS) or `main.exe` (Windows): Runs the executable.

### Run It.
```text
Number of arguments: 1
Number of arguments: 3
Number of arguments: 0
```

### Discard the throwaway example
This specific counting function is deleted and will not appear in the project again.

### Connection
We can count the arguments in a pack, but to actually use the data inside them, we must explicitly "expand" the pack so the rest of the language can read it.

---

## Concept Unit: Pack Expansion

### The Problem
A parameter pack like `args` cannot be used directly as a normal variable. You cannot write `args[0]` to get the first one, or `std::cout << args`. The compiler treats the pack as an opaque compressed bundle. To use the values inside, we need a mechanism to unpack them into a discrete, comma-separated list that the rest of C++ can understand.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (modified)
- **Change type:** Replace
- **Location:** Replacing the previous `countArguments` code in `main.cpp`.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <string>

void process(int a, double b, std::string c) {
    std::cout << "Processed: " << a << ", " << b << ", " << c << "\n";
}

template<typename... Args>
void forwardToProcess(Args... args) {
    process(args...); 
}

int main() {
    forwardToProcess(42, 3.14, std::string("hello"));
    return 0;
}
```

### The Updated Project
This replaces `main.cpp`. It introduces a template function that accepts any arguments and immediately unpacks them to call another specific function.

### Mechanical Walkthrough
- `process(args...)`: The ellipsis *after* the pack name is a **pack expansion**. It tells the compiler to take the bundle `args` and expand it into a comma-separated list.
- When the pack contains `42, 3.14, "hello"`, the compiler rewrites this exact line as `process(42, 3.14, "hello");`.
- `forwardToProcess(42, 3.14, std::string("hello"));`: Invokes the template. The pack receives three items. Without the `...` in the call to `process`, the compiler throws an error, because `args` is a pack, not a single value, and cannot be passed as one.

### CS Lens
Pack expansion is essentially a macro expansion applied at the Abstract Syntax Tree level during compilation. The compiler unrolls the pack into discrete arguments before it checks if the target function can actually accept them. 

### SE Lens
The alternative not chosen is trying to iterate over the pack with a `for` loop. The tradeoff here is that standard runtime loops cannot iterate over types that differ; a `for` loop expects every element to be the same data type. Pack expansion solves this by generating sequential, comma-separated code at compile time, treating each argument as its own distinct type.

### Run It.
```text
Processed: 42, 3.14, hello
```

### Discard the throwaway example
This forwarding function is deleted and will not appear in the project again.

### Connection
Expanding a pack into a function call works for executing behavior, but if we want to store those multiple different types in a variable to use later, we need a container built specifically for variadic parameters.

---

## Concept Unit: std::tuple

### The Problem
Parameter packs only exist in the immediate scope of the template function call. If we want to store that exact bundle of heterogeneous types as a real object in memory — for instance, returning multiple different types from a function — we need a concrete class that uses variadic templates internally to hold them.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (modified)
- **Change type:** Replace
- **Location:** Replacing the previous code in `main.cpp`.
- **Dependencies:** `<tuple>` standard library header.

### The New Code
```cpp
#include <iostream>
#include <string>
#include <tuple>

template<typename... Args>
std::tuple<Args...> bundleData(Args... args) {
    std::tuple<Args...> storage(args...);
    return storage;
}

int main() {
    std::tuple<int, double, std::string> myTuple = bundleData(100, 9.99, std::string("C++"));
    
    std::cout << std::get<0>(myTuple) << "\n";
    std::cout << std::get<1>(myTuple) << "\n";
    std::cout << std::get<2>(myTuple) << "\n";
    
    return 0;
}
```

### The Updated Project
This replaces `main.cpp`. It defines a variadic function that captures its arguments, explicitly packs them into a `std::tuple`, and returns it. `main` then extracts the values back out.

### Mechanical Walkthrough
- `#include <tuple>`: The standard library header providing `std::tuple` and `std::get`.
- `std::tuple<Args...>`: This is pack expansion applied to *types*. `std::tuple` is the canonical variadic template class. If `Args` is `<int, double>`, this expands to `std::tuple<int, double>`. Without this, we could only declare a container for a single type.
- `storage(args...)`: This is pack expansion applied to *values*. It passes the unpacked variables directly into the `std::tuple` constructor.
- `std::tuple<int, double, std::string> myTuple`: Declares the concrete variable to hold the returned tuple. 
- `std::get<0>(myTuple)`: Retrieves the first element (index 0) from the tuple. Because a tuple holds mixed types, the index must be known at compile time (inside the `< >` template brackets), not at runtime, so the compiler knows exactly what type it is returning (`int` for `<0>`, `double` for `<1>`).

### CS Lens
A `tuple` is a heterogeneous collection. Unlike an array or a `std::vector` which requires every element to have the exact same memory footprint and type, a tuple stores disparate types sequentially in memory. It is the C++ equivalent of an anonymous `struct` defined on the fly.

### SE Lens
The alternative not chosen is defining a custom `struct` every time you need to return or pass a specific grouping of variables (e.g., `struct IntDoubleString { int a; double b; std::string c; };`). The tradeoff is convenience versus naming. A tuple saves you from polluting the global namespace with one-off structures, but you lose meaningful field names, forcing access via `get<0>` instead of a descriptive property name.

### Run It.
```text
100
9.99
C++
```

### Discard the throwaway example
This tuple code is deleted. 

---

## Closing

- **Connect the pieces** — We started by capturing an unknown sequence of arguments using `typename... Args` and `Args... args`. We used `sizeof...(args)` to inspect the pack without opening it. We then unpacked it using `args...` to pass the values into the constructor of `std::tuple<Args...>`, proving we can capture, store, and retrieve arbitrary mixed-type data securely at compile time.
- **What breaks without this** — Try using a runtime variable for the tuple index:
  ```cpp
  int i = 0;
  std::cout << std::get<i>(myTuple) << "\n";
  ```
  **The error:** `the value of 'i' is not usable in a constant expression`. The compiler must know the type being returned at compile time; since the type changes depending on the index, the index itself must be a hardcoded compile-time constant.
- **Exercises** 
  - Write a template function `makePair` that accepts exactly two arguments, checking `sizeof...(args) == 2`, and returns a `std::tuple` of those two.
  - Modify the `std::tuple` code in `main.cpp` to use `auto myTuple = bundleData(...)` instead of explicitly writing out the tuple type, observing how type deduction perfectly handles the variadic return.
- **Definition of done**
  - [ ] You have compiled code using `sizeof...` and seen it count parameters.
  - [ ] You have expanded a parameter pack into a function call using `...`.
  - [ ] You have retrieved values from a `std::tuple` using compile-time indices.
  - [ ] You have committed your throwaway file experiments: `git commit -m "Confirm variadic template syntax for unpacking arbitrary parameters"`.
