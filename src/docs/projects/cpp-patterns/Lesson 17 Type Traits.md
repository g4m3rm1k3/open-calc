# Lesson 17: Type Traits and `<type_traits>`

**What you will build**
In this lesson, you will build and evaluate compile-time type inspections using the `<type_traits>` header. You will not build a standing project; instead, you will write a series of isolated templates that prove how C++ allows querying and transforming types at compile time before any runtime branching occurs. This solves the problem of writing generic code that must adapt its behavior or memory layout based on the exact type it is instantiated with, without paying a runtime cost.

**What you need to know first**
- Templates, `constexpr`, and Concepts (from C++ From Scratch) are fully assumed. We will use them heavily.
- Move semantics and lvalue/rvalue references (from C++ From Scratch).

**Terms used in this lesson**
- **Type Trait** — A template struct that yields a compile-time constant or type based on the properties of its template argument. It exists to let the compiler ask questions about types ("is this a pointer?", "are these two types the same?") and branch or substitute code accordingly before the program ever runs.
- **Metaprogramming** — Writing code that executes at compile time to generate or verify the code that will actually run. Type traits are the fundamental building block of C++ metaprogramming, existing to automate type-safe code generation.
- **Substitution Failure Is Not An Error (SFINAE)** — A C++ compiler principle where an invalid template substitution does not immediately fail the build, but instead discards that candidate from overload resolution. It exists to allow conditional enabling of function overloads based on type properties.

**Objects and methods used**
- **`std::is_same`**
  - *What it is:* A standard library type trait that checks if two types are exactly identical.
  - *Implementation:* `template<class T, class U> struct is_same;` yielding a `static constexpr bool value`.
  - *Its use:* We use it to prove type identity during template instantiation.
- **`std::is_integral`**
  - *What it is:* A standard library type trait that checks if a type is a fundamental integer type.
  - *Implementation:* `template<class T> struct is_integral;` yielding a `bool value`.
  - *Its use:* We use it to restrict or branch logic when a type behaves like an integer.
- **`std::remove_reference`**
  - *What it is:* A type transformation trait that strips `&` or `&&` from a type.
  - *Implementation:* `template<class T> struct remove_reference;` yielding a nested `type` alias.
  - *Its use:* We use it to get the underlying value type, crucial for perfect forwarding and move semantics.
- **`std::add_const`**
  - *What it is:* A type transformation trait that adds a `const` qualifier to a type.
  - *Implementation:* `template<class T> struct add_const;` yielding a nested `type` alias.
  - *Its use:* We use it to enforce immutability on a type dynamically at compile time.
- **`std::conditional`**
  - *What it is:* A compile-time `if-then-else` for types.
  - *Implementation:* `template<bool B, class T, class F> struct conditional;` yielding a `type` alias that is `T` if `B` is true, and `F` otherwise.
  - *Its use:* We use it to choose between two different types for a variable declaration based on a compile-time boolean condition.
- **`std::enable_if`**
  - *What it is:* A SFINAE tool that removes a function or class template from overload resolution if a condition is false.
  - *Implementation:* `template<bool B, class T = void> struct enable_if;` yielding a `type` alias only if `B` is true.
  - *Its use:* We use it to conditionally compile code branches based on type constraints.

---

## Concept Unit: `std::is_same`

### The Problem
When writing a generic template, we often need to know if two types are exactly the same type. This isn't about runtime equality of values (`a == b`), but compile-time identity of types (`T` vs `int`). If they are the same, we might want to optimize a copy operation or change how a function behaves, all without taking a runtime performance hit.

### Introduce the concept in isolation
This is called a **type trait**. We will use `std::is_same` to ask the compiler if two types match.

```cpp
#include <iostream>
#include <type_traits>

template <typename T, typename U>
void check_types() {
    if constexpr (std::is_same<T, U>::value) {
        std::cout << "Types are exactly the same.\n";
    } else {
        std::cout << "Types are different.\n";
    }
}

int main() {
    check_types<int, int>();
    check_types<int, const int>();
    return 0;
}
```

**Output:**
```text
Types are exactly the same.
Types are different.
```
This output proves that `std::is_same` inspects the exact type signature. `int` and `const int` are distinct types to the compiler, so it evaluates to false. Because we use `if constexpr`, the failing branch is discarded entirely at compile time.

### Discard the throwaway example
This specific `check_types` function is deleted and will not appear again.

### Project Change
*No reference counterpart — this is a from-scratch addition because we are exploring type traits purely in isolation.*
- **Files affected:** `scratch.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <type_traits>

bool test_same() {
    return std::is_same_v<int, signed int>;
}
```

### The Updated Project
```cpp
#include <iostream>
#include <type_traits>

// ← new
bool test_same() {
    return std::is_same_v<int, signed int>;
}

int main() {
    std::cout << test_same() << "\n";
    return 0;
}
```
This file now contains a minimal test that returns the boolean result of the type trait evaluation directly.

### Mechanical walkthrough
- `#include <type_traits>`: A standard library preprocessor directive. It pulls in the declarations for all standard type traits, providing the foundational metaprogramming tools we need.
- `bool`: A fundamental C++ type representing true or false. It is the return type of our function.
- `test_same()`: A function declaration taking no arguments.
- `{`: Opens the function body scope.
- `return`: A C++ keyword that exits the function and passes the subsequent value back to the caller.
- `std::`: The namespace scope resolution operator. It directs the compiler to look for the following name inside the C++ Standard Library namespace.
- `is_same_v`: A variable template, which is a convenience helper for `std::is_same<...>::value`. It exists to save typing `::value` every time we evaluate a trait.
- `<`: Opens the template argument list.
- `int`: The first type argument, representing a standard integer.
- `,`: Separates template arguments.
- `signed int`: The second type argument. In C++, `int` is implicitly signed, meaning `int` and `signed int` are perfectly identical types.
- `>`: Closes the template argument list.
- `;`: Terminates the statement.
- `}`: Closes the function body scope.

### CS Lens
Type reflection. C++ lacks runtime reflection (the ability of a program to inspect its own structure while running), but it provides extensive **compile-time reflection** via type traits. Also recognized in: languages with dependent types, Rust's trait bounds, and Zig's `comptime` constructs.

### SE Lens
Performance over flexibility. By shifting type inspection to the compiler, C++ ensures that generic code has zero runtime overhead. The tradeoff is increased compile times and deeply complex compiler error messages when type traits fail.

### Commands needed
```bash
g++ -std=c++17 scratch.cpp -o scratch
./scratch
```

### Run it
```text
1
```

### One sentence connecting this unit to what came immediately before.
Now that we can ask if two specific types match, we can ask broader questions about categories of types.

---

## Concept Unit: `std::is_integral`

### The Problem
Sometimes checking for exactly `int` is too narrow. We might want to accept `short`, `long`, `long long`, or `unsigned int`. Writing an `is_same` check for every possible integer type would be brittle and verbose.

### Introduce the concept in isolation
This is called a **type category trait**. `std::is_integral` evaluates to true for any fundamental integer type.

```cpp
#include <iostream>
#include <type_traits>

template <typename T>
void print_if_integer(T val) {
    if constexpr (std::is_integral_v<T>) {
        std::cout << val << " is an integer.\n";
    } else {
        std::cout << "Not an integer.\n";
    }
}

int main() {
    print_if_integer(42);
    print_if_integer(3.14);
    return 0;
}
```

**Output:**
```text
42 is an integer.
Not an integer.
```
This proves that the compiler correctly categorizes `int` as integral and `double` as non-integral, dynamically branching the compiled code.

### Discard the throwaway example
This isolated snippet is deleted.

### Project Change
*No reference counterpart.*
- **Files affected:** `scratch.cpp` (modified)
- **Change type:** Replace
- **Location:** Replacing the `test_same` function.
- **Dependencies:** None.

### The New Code
```cpp
template <typename T>
bool check_integral() {
    return std::is_integral<T>::value;
}
```

### The Updated Project
```cpp
#include <iostream>
#include <type_traits>

// ← new
template <typename T>
bool check_integral() {
    return std::is_integral<T>::value;
}

int main() {
    std::cout << check_integral<char>() << "\n";
    return 0;
}
```

### Mechanical walkthrough
- `template`: A C++ keyword declaring that the following construct is a blueprint, not a concrete function.
- `<`: Opens the template parameter list.
- `typename`: A keyword indicating that `T` is a placeholder for a type.
- `T`: The name of the template type parameter.
- `>`: Closes the parameter list.
- `bool`: The return type of the function.
- `check_integral()`: The function name and empty parameter list.
- `{`: Opens the function body.
- `return`: keyword to return a value.
- `std::`: Standard library namespace.
- `is_integral`: The type trait struct template that checks for integer types.
- `<`: Opens trait template arguments.
- `T`: We pass our function's template parameter directly into the trait.
- `>`: Closes trait template arguments.
- `::`: Scope resolution operator, used here to access a static member inside the `is_integral<T>` instantiated struct.
- `value`: The `static constexpr bool` member of the trait struct that holds the actual true/false result.
- `;`: Statement terminator.
- `}`: Closes function body.

### CS Lens
Type categorization. Grouping infinite possible types into finite, actionable categories allows algorithms to make assumptions about behavior (e.g., bitwise operations are only valid on integrals).

### SE Lens
The Open-Closed Principle applied to types. We don't modify our function when a new architecture introduces a weird 128-bit integer type; as long as the standard library marks it as integral, our generic code automatically supports it.

### Commands needed
```bash
g++ -std=c++17 scratch.cpp -o scratch
./scratch
```

### Run it
```text
1
```

### One sentence connecting this unit to what came immediately before.
We can query properties, but traits can also manipulate types, producing entirely new ones.

---

## Concept Unit: `std::remove_reference`

### The Problem
When dealing with templates and perfect forwarding, a type `T` might actually be a reference like `int&`. If we want to allocate a fresh, independent variable of that exact underlying type, declaring `T new_var;` would declare a reference, which fails because references must be initialized immediately. We need a way to strip the reference off.

### Introduce the concept in isolation
This is called a **type transformation trait**.

```cpp
#include <iostream>
#include <type_traits>

int main() {
    using RefType = int&;
    using ValueType = std::remove_reference<RefType>::type;
    
    ValueType x = 10; // If this were int&, it would fail without initialization to an existing lvalue.
    std::cout << x << "\n";
    return 0;
}
```

**Output:**
```text
10
```
This proves that `std::remove_reference` turned `int&` into `int`. The code compiles because `x` is a plain `int`.

### Discard the throwaway example
Deleted.

### Project Change
*No reference counterpart.*
- **Files affected:** `scratch.cpp` (modified)
- **Change type:** Replace
- **Location:** Entire file.

### The New Code
```cpp
template <typename T>
typename std::remove_reference<T>::type strip(T&& arg) {
    return arg;
}
```

### The Updated Project
```cpp
#include <iostream>
#include <type_traits>

// ← new
template <typename T>
typename std::remove_reference<T>::type strip(T&& arg) {
    return arg;
}

int main() {
    int x = 5;
    auto y = strip(x);
    y = 10;
    std::cout << "x is " << x << ", y is " << y << "\n";
    return 0;
}
```

### Mechanical walkthrough
- `template`: Begins template declaration.
- `<typename T>`: Declares type parameter `T`.
- `typename`: A critical C++ keyword here. Because `std::remove_reference<T>::type` depends on the template parameter `T`, the compiler doesn't know if `::type` is a static variable or a type. The `typename` keyword explicitly tells the compiler "treat what follows as a type name."
- `std::remove_reference`: The transformation trait.
- `<T>`: We pass our template parameter `T` into it.
- `::`: Accesses members inside the instantiated struct.
- `type`: The nested `typedef` or `using` alias inside the trait that holds the transformed result.
- `strip`: The function name.
- `(`: Opens function parameters.
- `T&&`: A forwarding reference (because `T` is a template parameter). It binds to both lvalues and rvalues.
- `arg`: The parameter name.
- `)`: Closes parameters.
- `{`: Opens function body.
- `return arg;`: Returns the value. Since the return type has references stripped, this forces a copy.
- `}`: Closes function body.

### CS Lens
Type mapping. This represents a pure function executed during compilation: `f(Type) -> Type`. It's functional programming, but mapped over types instead of values.

### SE Lens
Decoupling intent from caller arguments. `strip` guarantees it returns a value, regardless of whether the caller passed a temporary rvalue or an lvalue reference. This makes APIs predictable.

### Commands needed
```bash
g++ -std=c++17 scratch.cpp -o scratch
./scratch
```

### Run it
```text
x is 5, y is 10
```

### One sentence connecting this unit to what came immediately before.
Just as we can remove properties from a type, we can also add them.

---

## Concept Unit: `std::add_const`

### The Problem
We have a mutable type, but we want to force it to be immutable in a specific template context to enforce safety.

### Introduce the concept in isolation
This is another **type transformation trait**. `std::add_const` appends a `const` qualifier.

```cpp
#include <iostream>
#include <type_traits>

int main() {
    using NormalInt = int;
    using ConstInt = std::add_const_t<NormalInt>;
    
    std::cout << std::is_same_v<ConstInt, const int> << "\n";
    return 0;
}
```

**Output:**
```text
1
```
This proves that the resulting type is mathematically identical to `const int`.

### Discard the throwaway example
Deleted.

### Project Change
*No reference counterpart.*
- **Files affected:** `scratch.cpp` (modified)
- **Change type:** Replace

### The New Code
```cpp
template <typename T>
void force_const(std::add_const_t<T>& arg) {
    // arg is always const here
}
```

### The Updated Project
```cpp
#include <iostream>
#include <type_traits>

// ← new
template <typename T>
void force_const(std::add_const_t<T>& arg) {
    std::cout << std::is_const_v<std::remove_reference_t<decltype(arg)>> << "\n";
}

int main() {
    int val = 0;
    force_const<int>(val);
    return 0;
}
```

### Mechanical walkthrough
- `template <typename T>`: Standard template declaration.
- `void`: Return type, returns nothing.
- `force_const`: Function name.
- `(`: Opens arguments.
- `std::add_const_t`: A variable template alias (ending in `_t`). It is shorthand for `typename std::add_const<...>::type`. It saves us from writing `typename` and `::type`.
- `<`: Opens trait arguments.
- `T`: The type parameter passed into the trait.
- `>`: Closes trait arguments.
- `&`: We append an lvalue reference to the resulting const type. The result is `const T&`.
- `arg`: Parameter name.
- `)`: Closes arguments.
- `{`: Opens body.
- `// arg is always const here`: A comment indicating the forced state.
- `}`: Closes body.

### CS Lens
Immutability constraints. We are programmatically weaving read-only enforcement into the type system rather than relying on programmer discipline.

### SE Lens
Defensive programming. When generating complex types, using `add_const_t` ensures downstream template instantiations cannot accidentally mutate state.

### Commands needed
```bash
g++ -std=c++17 scratch.cpp -o scratch
./scratch
```

### Run it
```text
1
```

### One sentence connecting this unit to what came immediately before.
With the ability to query and transform types, we can now make logic choices about types entirely at compile time.

---

## Concept Unit: `std::conditional`

### The Problem
We want to declare a variable whose type changes based on a condition. For example, if memory is tight, we want a `short`, otherwise an `int`. Standard `if` statements only control execution flow; they cannot declare variables with different types in the same scope.

### Introduce the concept in isolation
This is the **`std::conditional` trait**, the compile-time ternary operator for types.

```cpp
#include <iostream>
#include <type_traits>

int main() {
    constexpr bool use_small = true;
    std::conditional_t<use_small, short, int> var = 32000;
    
    std::cout << sizeof(var) << " bytes\n";
    return 0;
}
```

**Output:**
```text
2 bytes
```
This proves that the compiler chose `short` (which is typically 2 bytes) because the condition was `true`. If `use_small` were `false`, it would have chosen `int` (typically 4 bytes).

### Discard the throwaway example
Deleted.

### Project Change
*No reference counterpart.*
- **Files affected:** `scratch.cpp` (modified)
- **Change type:** Replace

### The New Code
```cpp
template <bool UseFloat>
using OptimalDecimal = std::conditional_t<UseFloat, float, double>;
```

### The Updated Project
```cpp
#include <iostream>
#include <type_traits>

// ← new
template <bool UseFloat>
using OptimalDecimal = std::conditional_t<UseFloat, float, double>;

int main() {
    OptimalDecimal<true> a = 1.0f;
    OptimalDecimal<false> b = 1.0;
    std::cout << sizeof(a) << " " << sizeof(b) << "\n";
    return 0;
}
```

### Mechanical walkthrough
- `template`: Begins template.
- `<`: Opens parameters.
- `bool UseFloat`: A non-type template parameter. Instead of taking a type `T`, this template takes a concrete compile-time boolean value.
- `>`: Closes parameters.
- `using`: C++ keyword for creating a type alias (modern `typedef`).
- `OptimalDecimal`: The name of our new custom alias template.
- `=`: Assigns the alias meaning.
- `std::conditional_t`: The type alias helper for `std::conditional<...>::type`.
- `<`: Opens conditional arguments.
- `UseFloat`: The boolean condition. If true, picks the first type.
- `,`: Separator.
- `float`: The type chosen if `UseFloat` is true.
- `,`: Separator.
- `double`: The type chosen if `UseFloat` is false.
- `>`: Closes conditional arguments.
- `;`: Statement terminator.

### CS Lens
Compile-time branching. This is the structural equivalent of multiplexer logic in digital circuits, but executed by the compiler during the translation phase.

### SE Lens
Memory and performance scaling. You can write a single math library that adapts its precision and memory footprint instantly based on a single compile-time flag, keeping the source code completely unified.

### Commands needed
```bash
g++ -std=c++17 scratch.cpp -o scratch
./scratch
```

### Run it
```text
4 8
```

### One sentence connecting this unit to what came immediately before.
We can choose between types, but sometimes we want to outright forbid a template from being compiled if a condition isn't met.

---

## Concept Unit: `std::enable_if`

### The Problem
If a function template is meant only for integers, passing a `float` might compile but cause silent logical errors. We want to remove the function from the compiler's list of options entirely if the type is wrong, forcing an immediate compile error or allowing a different overload to be chosen.

### Introduce the concept in isolation
This leverages **SFINAE** using `std::enable_if`. If the boolean condition is true, `enable_if` has a `type` member. If it is false, the `type` member simply does not exist.

```cpp
#include <iostream>
#include <type_traits>

template <typename T>
typename std::enable_if<std::is_integral<T>::value, void>::type
process(T val) {
    std::cout << "Processing integer: " << val << "\n";
}

int main() {
    process(10);
    // process(3.14); // This line would cause a compile error!
    return 0;
}
```

**Output:**
```text
Processing integer: 10
```
This proves SFINAE works: when `T` is `int`, `enable_if` yields `void`, making the return type valid. If we passed `double`, `enable_if` lacks a `type`, resulting in a substitution failure, effectively deleting the function candidate.

### Discard the throwaway example
Deleted.

### Project Change
*No reference counterpart.*
- **Files affected:** `scratch.cpp` (modified)
- **Change type:** Replace

### The New Code
```cpp
template <typename T, typename = std::enable_if_t<std::is_integral_v<T>>>
void strict_print(T val) {
    std::cout << val << "\n";
}
```

### The Updated Project
```cpp
#include <iostream>
#include <type_traits>

// ← new
template <typename T, typename = std::enable_if_t<std::is_integral_v<T>>>
void strict_print(T val) {
    std::cout << val << "\n";
}

int main() {
    strict_print(42);
    return 0;
}
```

### Mechanical walkthrough
- `template`: Begins template.
- `<`: Opens parameters.
- `typename T`: The primary type parameter.
- `,`: Separates parameters.
- `typename`: Starts an unnamed template type parameter.
- `=`: Assigns a default type for this unnamed parameter.
- `std::enable_if_t`: The helper alias that yields `void` if the condition is true.
- `<`: Opens arguments.
- `std::is_integral_v<T>`: The condition: is `T` an integer?
- `>`: Closes arguments.
- `>`: Closes template parameters.
- `void`: Return type.
- `strict_print(T val)`: Function signature.
- `{ std::cout << val << "\n"; }`: Function body.

*Why put it in the template parameters?* Placing SFINAE in a default template argument is much cleaner than mangling the return type, keeping the signature (`void strict_print(T val)`) highly readable.

### CS Lens
Constraint satisfaction. We are defining bounded quantification: "for all types T such that T is an integer."

### SE Lens
API guardrails. By actively removing overloads that don't make sense, we prevent downstream developers from misusing templates in ways that might accidentally compile but perform destructively at runtime.

### Commands needed
```bash
g++ -std=c++17 scratch.cpp -o scratch
./scratch
```

### Run it
```text
42
```

### One sentence connecting this unit to what came immediately before.
All of these standard traits are built using standard C++ rules, which means we can write our own.

---

## Concept Unit: Writing your own type trait

### The Problem
The standard library covers fundamental categories, but what if we want a trait specific to our own system, like `is_pointer_to_custom_class` or simply replicating `is_same` to understand the magic? We must implement a trait from scratch.

### Introduce the concept in isolation
A type trait is just a template struct with a static constant. SFINAE and partial template specialization drive it.

```cpp
#include <iostream>

// Primary template: general case is false
template <typename T, typename U>
struct my_is_same {
    static constexpr bool value = false;
};

// Partial specialization: when both types are exactly T, it is true
template <typename T>
struct my_is_same<T, T> {
    static constexpr bool value = true;
};

int main() {
    std::cout << my_is_same<int, double>::value << "\n";
    std::cout << my_is_same<int, int>::value << "\n";
    return 0;
}
```

**Output:**
```text
0
1
```
This proves the compiler chooses the primary template for `<int, double>`, yielding `false`, but aggressively matches the partial specialization `<T, T>` for `<int, int>`, yielding `true`.

### Discard the throwaway example
Deleted.

### Project Change
*No reference counterpart.*
- **Files affected:** `scratch.cpp` (modified)
- **Change type:** Replace

### The New Code
```cpp
template <typename T>
struct is_pointer {
    static constexpr bool value = false;
};

template <typename T>
struct is_pointer<T*> {
    static constexpr bool value = true;
};
```

### The Updated Project
```cpp
#include <iostream>

// ← new
template <typename T>
struct is_pointer {
    static constexpr bool value = false;
};

template <typename T>
struct is_pointer<T*> {
    static constexpr bool value = true;
};

int main() {
    std::cout << is_pointer<int>::value << "\n";
    std::cout << is_pointer<int*>::value << "\n";
    return 0;
}
```

### Mechanical walkthrough
- `template <typename T>`: Declares the primary template.
- `struct`: Opens the struct definition. In C++, structs are identical to classes except default visibility is public.
- `is_pointer`: The name of our custom trait.
- `{`: Opens body.
- `static`: Keyword indicating this member belongs to the type itself, not to instances of the struct. We will never instantiate this struct.
- `constexpr`: Keyword guaranteeing this value is computed entirely at compile time.
- `bool`: The type of the constant.
- `value = false;`: The generic fallback answer. Unless proven otherwise, a type is not a pointer.
- `};`: Closes the struct definition.
- `template <typename T>`: Declares a new template specialization.
- `struct`: Begins struct.
- `is_pointer`: We are specializing the trait we just declared.
- `<T*>`: The partial specialization. This tells the compiler: "If the type provided ends in `*` (is a pointer), use this version instead of the primary template, and extract the underlying type into `T`."
- `{`: Opens body.
- `static constexpr bool value = true;`: The specialized answer. Yes, this is a pointer.
- `};`: Closes struct.

### CS Lens
Pattern matching at compile time. The compiler evaluates type arguments against available templates, preferring the most specialized match. This is declarative logic programming (similar to Prolog) embedded entirely within C++ types.

### SE Lens
Extensibility. By understanding how traits are built, you can define project-specific compile-time constraints that integrate seamlessly with `std::enable_if` and `if constexpr`, creating robust, self-verifying architectures.

### Commands needed
```bash
g++ -std=c++17 scratch.cpp -o scratch
./scratch
```

### Run it
```text
0
1
```

---

## Closing

### Connect the pieces
Type traits represent a cohesive metaprogramming ecosystem: we use `std::is_same` or custom traits like `is_pointer` to query facts, route logic securely via `std::conditional` or `std::enable_if`, and actively sculpt memory layouts using transformers like `std::remove_reference` or `std::add_const`. Together, they shift immense analytical burden off the CPU at runtime, resolving it inside the compiler before an executable is ever built.

### What breaks without this
If we remove SFINAE (`std::enable_if`) from a template but pass invalid types, the code either silently compiles and crashes, or fails deep inside template instantiations, producing thousands of lines of unreadable compiler errors instead of failing cleanly at the interface boundary.

### Exercises
1. Write a custom trait `is_reference<T>` that returns `true` if `T` is an lvalue reference `&`, and `false` otherwise.
2. Use `std::conditional` to define a type alias `SignedEquivalent<T>` that yields `int` if `T` is `unsigned int`, and `T` otherwise.

### Definition of done
- [x] Standard query traits like `is_same` and `is_integral` are understood.
- [x] Transformation traits like `remove_reference` and `add_const` are understood.
- [x] Conditional compilation tools like `conditional` and `enable_if` are understood.
- [x] You can write your own trait using partial template specialization.

```bash
git commit -m "Learn type traits to enable zero-cost compile-time type introspection"
```
