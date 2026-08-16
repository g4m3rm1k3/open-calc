# Lesson 11: Templates

**What you will build:** You will write functions and classes that can operate on any data type without duplicating code. These isolated programs prove that the C++ compiler can use a single blueprint to automatically generate specific, type-safe versions of a function or class at compile time. The transferable problem this solves is writing generic algorithms and data structures that are strictly type-checked but don't require you to copy-paste identical logic for every new data type.

**What you need to know first:** Lesson 05 Functions, Lesson 06 Classes and Objects.

**Terms introduced in this lesson:**
- **Template** — A blueprint for a function or class that leaves one or more data types unspecified until they are used. *Why it exists:* To eliminate code duplication when the exact same logic applies to many different types of data.
- **Template type parameter** — A placeholder name (usually `T`) in a template definition that stands in for an actual type. *Why it exists:* To declare exactly where the unknown type will be substituted later.
- **Instantiation** — The process where the compiler reads a template and generates a concrete, fully-typed version of the function or class based on the types provided. *Why it exists:* To ensure that the final compiled code is just as fast and type-safe as if you had written out every specific version by hand.

**Objects and methods used:**
- **std::cout**
  - *What it is:* The standard character output stream in C++.
  - *Implementation:* `extern std::ostream cout;` inside `<iostream>`.
  - *Its use:* Used to print the values returned by our generic code to verify the compiler correctly generated the type-specific versions.

---

## Concept Unit: The Problem

### The Problem
When building a function that compares two values to find the maximum, the logic is simple: `if (a > b) return a; else return b;`. However, C++ is statically typed, meaning a function's parameters and return type must be explicitly declared. If you write this function for integers, it only works for integers. To do the exact same comparison for decimals, you have to write a second function. This forces you to duplicate code just to satisfy the type system.

### The New Code
```cpp
#include <iostream>

int max_int(int a, int b) {
    if (a > b) return a;
    return b;
}

double max_double(double a, double b) {
    if (a > b) return a;
    return b;
}

int main() {
    std::cout << max_int(5, 10) << "\n";
    std::cout << max_double(3.14, 2.71) << "\n";
    return 0;
}
```

### The Updated Project
Because this is an isolated proof, there is no surrounding project structure. The code above is the entire file. It demonstrates two separate functions doing the exact same work for different data types.

### Mechanical Walkthrough
- `int max_int(int a, int b)`: Defines a function that strictly accepts and returns `int`.
- `double max_double(double a, double b)`: Defines a completely separate function that strictly accepts and returns `double`. The internal logic is identical to `max_int`.
- `std::cout << max_int(5, 10) << "\n";`: Calls the integer version of the function.
- `std::cout << max_double(3.14, 2.71) << "\n";`: Calls the decimal version of the function. Without this second function, passing decimals to `max_int` would cause the compiler to truncate them into whole integers, losing data.

### CS Lens
This is the concept of "manual monomorphization." The programmer acts as a macro expander, manually writing out a specialized version of the algorithm for every type it needs to support. This guarantees type safety but scales terribly as the number of required types grows.

### SE Lens
The alternative not chosen is abandoning static typing entirely (like using `void*` in C), which would allow one function to take any data but would break the compiler's ability to verify the program is safe. The tradeoff here is a maintenance burden: if you discover a bug in your `max` logic, you have to remember to fix it in `max_int`, `max_double`, `max_float`, and everywhere else you copied it.

### Commands needed to make this unit real
- `g++ -std=c++17 problem.cpp -o problem` — Compiles the C++ source file into an executable named `problem`.
- `./problem` — Runs the resulting executable.

### Run It Yourself
1. Open a terminal and create a new file named `problem.cpp`.
2. Replace the contents of `problem.cpp` with the code above.
3. Run `g++ -std=c++17 problem.cpp -o problem`.
4. Run `./problem`.
5. Observe the output: `10` followed by `3.14`.

Discard this throwaway example. It proves the inefficiency of code duplication, which we will now solve.

---

## Concept Unit: Function Templates

### The Problem
We need the safety of strictly typed functions without the maintenance nightmare of duplicating them. We need a way to write the logic once and let the compiler automatically generate the specific `int` or `double` versions for us when it sees what types we are trying to pass in.

### The New Code
```cpp
#include <iostream>

template <typename T>
T find_max(T a, T b) {
    if (a > b) return a;
    return b;
}

int main() {
    std::cout << find_max<int>(5, 10) << "\n";
    std::cout << find_max<double>(3.14, 2.71) << "\n";
    return 0;
}
```

### The Updated Project
Because this is an isolated proof, there is no surrounding project structure. The code above is the entire file. It replaces the duplicated functions with a single generic template.

### Mechanical Walkthrough
- `template <typename T>`: Declares that the following function is a template, and that `T` is a **template type parameter**. `T` acts as a variable for a data type (like `int` or `double`), not a variable for actual data (like `5`). Without this line, the compiler would complain that it has never heard of a type named `T`.
- `T find_max(T a, T b)`: Uses the placeholder `T` for the return type and the parameter types. When `T` becomes `int`, this signature becomes exactly `int find_max(int a, int b)`.
- `find_max<int>(5, 10)`: Calls the function, explicitly providing `int` as the type for `T` inside the angle brackets. This triggers **instantiation**: the compiler secretly writes a brand-new integer version of `find_max` just for this call.
- `find_max<double>(3.14, 2.71)`: Calls the function again, this time requesting a `double` version. The compiler secretly writes a second, entirely separate decimal version of `find_max`.

### Execution Trace
1. `find_max<int>(5, 10)` — The compiler sees the request for an `<int>` version. It checks if it has already generated one. It hasn't, so it creates `int find_max(int a, int b)`.
2. `find_max<double>(3.14, 2.71)` — The compiler sees a request for a `<double>` version. It creates `double find_max(double a, double b)`.
3. The final compiled program contains two completely separate functions, exactly as if you had written them by hand in the previous unit. The template itself does not exist in the final running program; only the generated functions do.

### CS Lens
This embodies parametric polymorphism. You define logic abstractly over parameters, and instantiate it with specific types later. It is like a customizable factory mold: you build the mold once, but the factory produces distinct plastic parts and metal parts depending on what material you pour in.

### SE Lens
The alternative not chosen is code generation tools outside the language (like writing a Python script to generate C++ files). The tradeoff here is slower compile times: the compiler has to do the heavy lifting of parsing the template and generating every requested variation from scratch every time you build the program. In exchange, the programmer gets maximum reuse with zero runtime performance cost.

### Run It Yourself
1. Open a terminal and create a new file named `function_template.cpp`.
2. Replace the contents with the code above.
3. Run `g++ -std=c++17 function_template.cpp -o function_template`.
4. Run `./function_template`.
5. Observe the output: `10` followed by `3.14`.

Discard this throwaway example.

---

## Concept Unit: Class Templates

### The Problem
Templates are not just for functions. When building a data structure (like a wrapper or a container) that needs to hold a piece of data, locking it to a single type makes the data structure useless for anything else. We need to create a class that can store and retrieve data of any type, determined at the moment an object is created.

### The New Code
```cpp
#include <iostream>

template <typename T>
class Box {
private:
    T value;
public:
    Box(T initial_value) {
        value = initial_value;
    }
    
    T get_value() {
        return value;
    }
};

int main() {
    Box<int> int_box(42);
    std::cout << int_box.get_value() << "\n";

    Box<double> double_box(9.99);
    std::cout << double_box.get_value() << "\n";

    return 0;
}
```

### The Updated Project
Because this is an isolated proof, there is no surrounding project structure. The code above is the entire file. It demonstrates a single class definition being used to instantiate objects holding entirely different data types.

### Mechanical Walkthrough
- `template <typename T>`: Declares that the following class is a template, using `T` as the placeholder type.
- `class Box { ... }`: The definition of the class itself. Because it is prefixed by the template declaration, everything inside this block can use `T` as a valid type.
- `T value;`: Declares a private member variable whose type is `T`. If `T` is `int`, this is an integer variable. If `T` is `double`, this is a decimal variable.
- `Box(T initial_value)`: The constructor. It takes an argument of type `T` to initialize the object.
- `T get_value()`: A method that returns the stored value, ensuring the return type perfectly matches whatever was put in.
- `Box<int> int_box(42);`: Creates an instance of the class. The `<int>` tells the compiler to generate a specific version of `Box` where every `T` is replaced with `int`, and then instantiate an object from that generated class.
- `Box<double> double_box(9.99);`: Proves the exact same template can be reused safely for decimals.

### CS Lens
This is generic programming applied to data structures. A class template is not a class; it is a recipe for a class. Just as `std::vector` or `std::string` in the C++ Standard Library can hold any data type, you are using the exact same mechanism they use under the hood to ensure type safety.

### SE Lens
The alternative not chosen is storing data as `void*` pointers, which can point to any data type in memory. The tradeoff for templates is that the compiler must see the full implementation of the class template wherever it is used (which is why templates are usually written entirely inside header files). The immense benefit is that the compiler prevents you from ever putting a `double` into a `Box<int>`, making the container structurally safe.

### Run It Yourself
1. Open a terminal and create a new file named `class_template.cpp`.
2. Replace the contents with the code above.
3. Run `g++ -std=c++17 class_template.cpp -o class_template`.
4. Run `./class_template`.
5. Observe the output: `42` followed by `9.99`.

Discard this throwaway example.

---

## Connect the Pieces

Observe how the generic type parameters flow: 
When you define `Box<double>`, the compiler replaces `T` with `double` throughout the class definition. Thus, the constructor `Box(T initial_value)` rigidly becomes `Box(double initial_value)`. Finally, when the object provides access to the data, `T get_value()` strictly manifests as `double get_value()`. The type flows from the initial instantiation in `main()` down through every method and property of the instance, entirely at compile time.

## What Breaks Without This

If you ignore the compiler's generic rules, it will stop you immediately.

Modify the `Box` code to insert the wrong type into an initialized box:
```cpp
Box<int> int_box(42);
int_box = Box<double>(9.99); // Trying to assign a double box to an int box
```

**The compiler error:**
`error: no viable overloaded '='`

Because you declared `int_box` as a `Box<int>`, the compiler considers it an entirely different, incompatible class from `Box<double>`. They do not share a type relationship just because they came from the same template. Restore the code by ensuring you only assign boxes of the exact same instantiated type.

## Exercises

1. **Multiple Template Parameters:** Create a function `template <typename T1, typename T2>` named `print_pair` that accepts two arguments of potentially different types (`T1 a`, `T2 b`) and prints them separated by a comma. Call it from `main` passing an `int` and a `double`.
2. **Type Deduction:** In modern C++, the compiler can often guess the type parameter for a function template without you explicitly writing `<int>`. Try calling `find_max(5, 10)` without the `<int>` brackets and verify it still compiles and runs.
3. **Array Box:** Modify the `Box` class template so that instead of holding a single `T value`, it holds a static array `T values[3]`. Add a method `void set_value(int index, T item)` and test it in `main` with an array of `double`s.

## Definition of Done

- [ ] You have compiled the duplicated functions and understood the maintenance problem.
- [ ] You have run a function template and witnessed the compiler generate the correct types.
- [ ] You have built a class template and retrieved a value without losing type safety.
- [ ] You can explain template instantiation out loud, in your own words, to someone who hasn't read this lesson.
- [ ] `git commit -m "Complete Lesson 11: Templates, isolating type from logic"`
