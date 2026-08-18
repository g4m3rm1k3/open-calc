# Lesson 18: Compile-Time Computation with Templates

We will build compile-time mechanisms — specifically, generating a compile-time lookup table, unpacking its values using `std::integer_sequence`, and branching logic at compile time using Concepts and `if constexpr`. The real transferable problem is knowing how to shift heavy computation from runtime to compile time, and critically, recognizing when classic Template Metaprogramming (TMP) becomes an unreadable liability that should be replaced with modern C++ features.

**What you need to know first:**
- C++ From Scratch (templates, `constexpr`, variadic templates, concepts)

**Terms used in this lesson:**
- **Template Metaprogramming (TMP)** — Writing code that the compiler executes during compilation to generate types or values, existing to shift work from runtime to compile time so the final executable is smaller and faster.
- **`constexpr`** — A language specifier guaranteeing that a variable or function can be evaluated at compile time, existing to replace complex functional TMP with ordinary-looking imperative C++ code.
- **Concepts** — Compile-time predicates for template arguments, introduced in C++20, existing to provide readable constraints and better error messages compared to older SFINAE techniques.
- **Parameter Pack** — A template feature accepting zero or more arguments, existing to write generic functions over an unknown number of types or values.
- **`if constexpr`** — A compile-time branching statement introduced in C++17, existing to discard invalid code branches during compilation without causing compile errors.

**Objects and methods used:**
- **`std::integer_sequence`**
  - *What it is:* A compile-time sequence of integers.
  - *Implementation:* `template<class T, T... Ints> class integer_sequence;`
  - *Its use:* We use it to carry indices across template instantiations to unpack arrays and apply functions at compile time.
- **`std::make_index_sequence`**
  - *What it is:* A standard library helper alias.
  - *Implementation:* `template<std::size_t N> using make_index_sequence = std::make_integer_sequence<std::size_t, N>;`
  - *Its use:* We use it to automatically generate the `0, 1, ..., N-1` sequence without writing the recursion manually.
- **`std::integral`**
  - *What it is:* A C++20 concept.
  - *Implementation:* `template<class T> concept integral = std::is_integral_v<T>;`
  - *Its use:* We use it to constrain templates and branch compile-time logic based on whether a type is an integer.
- **`std::floating_point`**
  - *What it is:* A C++20 concept.
  - *Implementation:* `template<class T> concept floating_point = std::is_floating_point_v<T>;`
  - *Its use:* We use it to constrain templates and branch compile-time logic based on whether a type is a float.

---

## Concept Unit: `constexpr` vs Template Metaprogramming

### The Problem
We want to compute values during compilation so the runtime executable does not waste CPU cycles doing it. Historically, C++ developers used Template Metaprogramming (TMP) — relying on recursive struct instantiations — to force the compiler to do math. This was powerful but famously difficult to read. We need a way to run normal, imperative C++ at compile time.

### Introduce the concept in isolation
```cpp
// Classic TMP approach
template <int N> 
struct Fact { 
    static constexpr int value = N * Fact<N - 1>::value; 
};
template <> 
struct Fact<0> { 
    static constexpr int value = 1; 
};

// Modern constexpr approach
constexpr int fact(int n) { 
    return n <= 1 ? 1 : n * fact(n - 1); 
}

#include <iostream>
int main() {
    std::cout << Fact<5>::value << "\n";
    std::cout << fact(5) << "\n";
}
```

Output:
```
120
120
```

This output proves that both approaches compute the factorial perfectly. The first is called a **Template Metaprogram**, which uses recursive struct instantiation. The second is called a **`constexpr` function**, which uses normal function syntax but guarantees the compiler can evaluate it during the build.

### Discard the throwaway example
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition to demonstrate compile-time logic.
- **Files affected:** `compile_math.h` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#pragma once

constexpr int compute_scaling_factor(int base, int multiplier) {
    int result = base;
    for(int i = 0; i < multiplier; ++i) {
        result += base * i;
    }
    return result;
}
```

### The Updated Project
```cpp
// compile_math.h
// ← new
#pragma once

constexpr int compute_scaling_factor(int base, int multiplier) {
    int result = base;
    for(int i = 0; i < multiplier; ++i) {
        result += base * i;
    }
    return result;
}
```
This file provides a foundational math function that is guaranteed to be evaluable at compile time.

### Mechanical walkthrough
- `#pragma`: Preprocessor directive.
- `once`: Tells the compiler to include this header exactly once per compilation unit.
- `constexpr`: A language keyword that marks the function as evaluable at compile time.
- `int`: The return type, a standard integer.
- `compute_scaling_factor`: The name of the function.
- `(`: Opens the parameter list.
- `int`: The type of the first parameter.
- `base`: The first parameter, the base value.
- `,`: Separates parameters.
- `int`: The type of the second parameter.
- `multiplier`: The second parameter.
- `)`: Closes the parameter list.
- `{`: Opens the function body.
- `int`: The type of the local variable.
- `result`: Declares a local integer variable.
- `=`: The assignment operator.
- `base`: The initial value.
- `;`: Ends the statement.
- `for`: The loop keyword.
- `(`: Opens the loop conditions.
- `int`: The type of the loop counter.
- `i`: The loop counter name.
- `=`: The assignment operator.
- `0`: The initial value.
- `;`: Separates loop clauses.
- `i`: The loop counter.
- `<`: The less-than comparison operator.
- `multiplier`: The upper bound.
- `;`: Separates loop clauses.
- `++`: Pre-increment operator.
- `i`: The loop counter.
- `)`: Closes the loop conditions.
- `{`: Opens the loop body.
- `result`: The local state variable.
- `+=`: The compound addition assignment operator.
- `base`: The base parameter.
- `*`: The multiplication operator.
- `i`: The loop counter.
- `;`: Ends the statement.
- `}`: Closes the loop body.
- `return`: The keyword to exit the function and pass back a value.
- `result`: The final computed value.
- `;`: Ends the statement.
- `}`: Closes the function body.

Execution trace:
1. `compute_scaling_factor(10, 3)` — Call begins.
2. `result = 10` — Initial state setup.
3. `i = 0`, `result += 10 * 0` — `result` remains `10`.
4. `i = 1`, `result += 10 * 1` — `result` becomes `20`.
5. `i = 2`, `result += 10 * 2` — `result` becomes `40`.
6. Loop terminates, returns `40`.

### CS Lens
Compile-time evaluation / Constant folding.
Also recognized in: macro processors, Lisp macros, JIT compilers doing constant folding, Rust's `const fn`.

### SE Lens
Readability and maintainability. TMP requires recursive functional programming in a language not built for it. C++14 expanded `constexpr` to allow local mutation and loops, letting us write normal imperative C++ that runs at compile time, drastically reducing maintenance debt.

### Commands needed
No new commands.

### Run it
Cannot run standalone yet; it is a header file waiting to be used.

### Connection
Computing a single value is easy, but often we need an entire collection of values at compile time to avoid startup costs.

---

## Concept Unit: Compile-Time Lookup Tables

### The Problem
We need an array of precomputed values (like a sine table or scaling factors) baked directly into the binary. If we compute these at runtime during startup, we waste CPU cycles every time the program launches. 

### Introduce the concept in isolation
```cpp
#include <array>
#include <iostream>

constexpr std::array<int, 3> make_table() {
    return {10, 20, 30};
}

constexpr auto table = make_table();

int main() {
    std::cout << table[1] << "\n";
}
```

Output:
```
20
```

This output proves the array is populated and accessible. This is called a **`constexpr` `std::array` initialization**. Because `table` is declared `constexpr`, the compiler places the sequence `{10, 20, 30}` directly into the executable's read-only memory segment.

### Discard the throwaway example
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `compile_math.h` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** `<array>` standard header.

### The New Code
```cpp
#include <array>

template<size_t N>
constexpr std::array<int, N> make_scaling_table(int base) {
    std::array<int, N> table{};
    for (size_t i = 0; i < N; ++i) {
        table[i] = compute_scaling_factor(base, i);
    }
    return table;
}

constexpr auto lookup_table = make_scaling_table<5>(10);
```

### The Updated Project
```cpp
// compile_math.h
#pragma once
#include <array> // ← new

constexpr int compute_scaling_factor(int base, int multiplier) {
    // ...unchanged
}

// ← new
template<size_t N>
constexpr std::array<int, N> make_scaling_table(int base) {
    std::array<int, N> table{};
    for (size_t i = 0; i < N; ++i) {
        table[i] = compute_scaling_factor(base, i);
    }
    return table;
}

constexpr auto lookup_table = make_scaling_table<5>(10);
```
The file now automatically generates a 5-element scaling table based on the value `10` entirely during the compilation phase.

### Mechanical walkthrough
- `#include`: Preprocessor directive.
- `<array>`: The standard library fixed-size array header.
- `template`: Keyword introducing a template.
- `<`: Opens the template parameter list.
- `size_t`: The type of the template parameter, an unsigned integer type for sizes.
- `N`: The non-type template parameter representing the array size.
- `>`: Closes the template parameter list.
- `constexpr`: Keyword marking compile-time evaluation capability.
- `std::array`: The standard library container type.
- `<`: Opens the array template arguments.
- `int`: The type of elements in the array.
- `,`: Separates arguments.
- `N`: The size of the array, matching the template parameter.
- `>`: Closes the array template arguments.
- `make_scaling_table`: The function name.
- `(`: Opens the parameter list.
- `int`: The type of the parameter.
- `base`: The single parameter determining the scaling base.
- `)`: Closes the parameter list.
- `{`: Opens the function body.
- `std::array`: The standard library container.
- `<`: Opens the array template arguments.
- `int`: The element type.
- `,`: Separates arguments.
- `N`: The array size.
- `>`: Closes the array template arguments.
- `table`: The name of the local array.
- `{}`: Uniform initialization syntax, zero-initializing all elements.
- `;`: Ends the statement.
- `for`: The loop keyword.
- `(`: Opens loop conditions.
- `size_t`: The type of the loop counter.
- `i`: The loop counter name.
- `=`: The assignment operator.
- `0`: The initial value.
- `;`: Separator.
- `i`: The loop counter.
- `<`: The less-than operator.
- `N`: The array size bound.
- `;`: Separator.
- `++`: Pre-increment operator.
- `i`: The loop counter.
- `)`: Closes loop conditions.
- `{`: Opens loop body.
- `table`: The local array.
- `[`: Opens the array subscript operator.
- `i`: The index.
- `]`: Closes the subscript operator.
- `=`: Assignment operator.
- `compute_scaling_factor`: Call to our previous `constexpr` function.
- `(`: Opens function arguments.
- `base`: The base parameter.
- `,`: Separator.
- `i`: The loop counter, cast implicitly to `int`.
- `)`: Closes function arguments.
- `;`: Ends the statement.
- `}`: Closes loop body.
- `return`: Keyword to exit the function.
- `table`: The populated array.
- `;`: Ends the statement.
- `}`: Closes function body.
- `constexpr`: Keyword forcing compile-time evaluation for the variable definition.
- `auto`: Keyword telling the compiler to deduce the type automatically (which will be `std::array<int, 5>`).
- `lookup_table`: The name of the global constant variable.
- `=`: Assignment operator.
- `make_scaling_table`: Function call.
- `<`: Opens explicit template arguments.
- `5`: The compile-time value for `N`.
- `>`: Closes explicit template arguments.
- `(`: Opens function arguments.
- `10`: The argument for `base`.
- `)`: Closes function arguments.
- `;`: Ends the statement.

### CS Lens
Lookup tables / Memoization. 
Also recognized in: cryptography (S-boxes), graphics engines (trig tables), embedded systems (ADC correction tables), hardware synthesis.

### SE Lens
Startup performance vs Binary size. Computing at compile time makes the executable file larger on disk, but application startup becomes instantaneous. We are deliberately trading disk and memory footprint for CPU time.

### Commands needed
No new commands.

### Run it
Cannot run standalone yet.

### Connection
Now we have an array generated at compile time. What if we need to pass those elements as separate arguments to another function? We need compile-time indices.

---

## Concept Unit: `std::integer_sequence` and Index Tricks

### The Problem
We have an array, and we need to pass its elements as separate arguments to a function, like `func(arr[0], arr[1], arr[2])`. But we don't know the size `N` until compile time, and we cannot write a `for` loop to pass function arguments. We need the compiler to generate the sequence of indices `0, 1, 2...` and unpack them for us.

### Introduce the concept in isolation
```cpp
#include <utility>
#include <iostream>

template<size_t... Is>
void print_indices(std::index_sequence<Is...>) {
    // A fold expression printing each index
    ((std::cout << Is << " "), ...);
}

int main() {
    print_indices(std::make_index_sequence<3>{});
}
```

Output:
```
0 1 2 
```

This output proves the compiler generated the numbers `0`, `1`, and `2` and fed them into the parameter pack `Is...`. This is called the **Index Sequence idiom**.

### Discard the throwaway example
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `compile_math.h` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** `<utility>` standard header.

### The New Code
```cpp
#include <utility>

template <typename F, size_t N, size_t... Is>
constexpr void apply_array_impl(F func, const std::array<int, N>& arr, std::index_sequence<Is...>) {
    func(arr[Is]...);
}

template <typename F, size_t N>
constexpr void apply_array(F func, const std::array<int, N>& arr) {
    apply_array_impl(func, arr, std::make_index_sequence<N>{});
}
```

### The Updated Project
```cpp
// compile_math.h
#pragma once
#include <array>
#include <utility> // ← new

// ... (previous functions omitted for brevity)

constexpr auto lookup_table = make_scaling_table<5>(10);

// ← new
template <typename F, size_t N, size_t... Is>
constexpr void apply_array_impl(F func, const std::array<int, N>& arr, std::index_sequence<Is...>) {
    func(arr[Is]...);
}

template <typename F, size_t N>
constexpr void apply_array(F func, const std::array<int, N>& arr) {
    apply_array_impl(func, arr, std::make_index_sequence<N>{});
}
```
The file now exposes `apply_array`, which takes an array and unpacks it into a function call seamlessly.

### Mechanical walkthrough
- `#include`: Preprocessor directive.
- `<utility>`: Standard header containing `integer_sequence` utilities.
- `template`: Keyword introducing a template.
- `<`: Opens template parameters.
- `typename`: Declares a type parameter.
- `F`: The template parameter for the callable function type.
- `,`: Separator.
- `size_t`: The type of the array size parameter.
- `N`: The array size parameter.
- `,`: Separator.
- `size_t`: The type of the index parameters.
- `...`: Denotes a parameter pack, meaning zero or more of the preceding type.
- `Is`: The name of the parameter pack containing the indices.
- `>`: Closes template parameters.
- `constexpr`: Marks the function as evaluable at compile time.
- `void`: The return type.
- `apply_array_impl`: The name of the internal implementation helper.
- `(`: Opens the parameter list.
- `F`: The callable type.
- `func`: The callable object parameter.
- `,`: Separator.
- `const`: Constant qualifier.
- `std::array`: The array type.
- `<`: Opens array template arguments.
- `int`: Element type.
- `,`: Separator.
- `N`: Array size.
- `>`: Closes array template arguments.
- `&`: Reference qualifier.
- `arr`: The array parameter.
- `,`: Separator.
- `std::index_sequence`: The standard library struct carrying a compile-time sequence of sizes.
- `<`: Opens index_sequence template arguments.
- `Is`: The parameter pack.
- `...`: Expands the pack into the template argument list.
- `>`: Closes index_sequence template arguments.
- `)`: Closes the parameter list. (Notice we don't name the `index_sequence` parameter; we only need its type to deduce `Is...`).
- `{`: Opens the function body.
- `func`: The callable object.
- `(`: Opens function call arguments.
- `arr`: The array.
- `[`: Opens subscript operator.
- `Is`: The index from the parameter pack.
- `]`: Closes subscript operator.
- `...`: Pack expansion operator. This tells the compiler to repeat `arr[Is]` for every element in the `Is` pack, separated by commas.
- `)`: Closes function call arguments.
- `;`: Ends the statement.
- `}`: Closes the function body.
- `template`: Keyword introducing a template.
- `<`: Opens template parameters.
- `typename`: Declares a type parameter.
- `F`: The callable type.
- `,`: Separator.
- `size_t`: The array size type.
- `N`: The array size parameter.
- `>`: Closes template parameters.
- `constexpr`: Marks the function as evaluable at compile time.
- `void`: Return type.
- `apply_array`: The public-facing function name.
- `(`: Opens the parameter list.
- `F`: The callable type.
- `func`: The callable parameter.
- `,`: Separator.
- `const`: Constant qualifier.
- `std::array`: The array type.
- `<`: Opens array template arguments.
- `int`: Element type.
- `,`: Separator.
- `N`: Array size.
- `>`: Closes array template arguments.
- `&`: Reference qualifier.
- `arr`: The array parameter.
- `)`: Closes the parameter list.
- `{`: Opens the function body.
- `apply_array_impl`: Calls the internal helper.
- `(`: Opens function call arguments.
- `func`: The callable passed through.
- `,`: Separator.
- `arr`: The array passed through.
- `,`: Separator.
- `std::make_index_sequence`: The standard library alias that generates an `index_sequence`.
- `<`: Opens template arguments.
- `N`: The array size.
- `>`: Closes template arguments.
- `{}`: Uniform initialization syntax, creating a temporary instance of the generated sequence.
- `)`: Closes function call arguments.
- `;`: Ends the statement.
- `}`: Closes the function body.

Execution trace:
1. User calls `apply_array(my_func, my_array_of_size_3)`.
2. Compiler deduces `N = 3`.
3. `std::make_index_sequence<3>{}` generates a temporary of type `std::index_sequence<0, 1, 2>`.
4. The helper `apply_array_impl` is invoked. The compiler matches `index_sequence<0, 1, 2>` to `index_sequence<Is...>`, deducing the pack `Is...` as `0, 1, 2`.
5. Inside the helper, `func(arr[Is]...);` is expanded.
6. The compiler writes the literal equivalent of `func(arr[0], arr[1], arr[2]);`.

### CS Lens
Pattern matching / Pack expansion.
Also recognized in: functional destructuring, Lisp unquote-splicing, Python `*args` and `**kwargs` expansion.

### SE Lens
Delegation pattern. We use an `_impl` helper strictly to deduce the parameter pack from the type of a temporary object, keeping the public API clean so the caller never sees `index_sequence`. This was the mandatory way to handle compile-time sequences before C++20.

### Commands needed
No new commands.

### Run it
Cannot run standalone yet.

### Connection
TMP tricks like delegation and pack expansion solve the problem, but they require building secondary helper functions. When TMP logic branches based on types, it historically created unreadable errors. C++17 and C++20 gave us tools to stop using TMP entirely for branching.

---

## Concept Unit: The Practical Limit of TMP vs Concepts

### The Problem
When we want to execute different logic based on compile-time conditions (like checking if a type is an integer versus a float), classic TMP required `std::enable_if` and multiple complex struct specializations. SFINAE (Substitution Failure Is Not An Error) is notoriously hostile to read. We need a way to branch logic at compile time cleanly, and a way to constrain templates so they fail with readable errors.

### Introduce the concept in isolation
```cpp
#include <concepts>
#include <iostream>

template <typename T>
requires std::integral<T> || std::floating_point<T>
constexpr T optimize_math(T value) {
    if constexpr (std::integral<T>) {
        return value << 1; // Bitshift is only valid for integers
    } else {
        return value * 2;  // Valid for floats
    }
}

int main() {
    std::cout << optimize_math(5) << "\n";
    std::cout << optimize_math(5.5) << "\n";
}
```

Output:
```
10
11
```

This output proves the compiler successfully chose the bitshift for the integer and the multiplication for the float. The `requires` clause is called **Concepts**, and the `if constexpr` branch is called **Compile-time Branching**. Because `if constexpr` guarantees the failing branch is discarded from the AST entirely, the float instantiation never attempts to compile the invalid bitshift code.

### Discard the throwaway example
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `compile_math.h` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** `<concepts>` standard header.

### The New Code
```cpp
#include <concepts>

template <typename T>
requires std::integral<T> || std::floating_point<T>
constexpr T optimize_math(T value) {
    if constexpr (std::integral<T>) {
        return value << 1;
    } else {
        return value * 2;
    }
}
```

### The Updated Project
```cpp
// compile_math.h
#pragma once
#include <array>
#include <utility>
#include <concepts> // ← new

// ... (previous functions omitted for brevity)

// ← new
template <typename T>
requires std::integral<T> || std::floating_point<T>
constexpr T optimize_math(T value) {
    if constexpr (std::integral<T>) {
        return value << 1;
    } else {
        return value * 2;
    }
}
```
The file now includes a type-safe math optimizer that performs type inspection and branching at compile time without SFINAE.

### Mechanical walkthrough
- `#include`: Preprocessor directive.
- `<concepts>`: Standard C++20 header defining common type constraints.
- `template`: Keyword introducing a template.
- `<`: Opens template parameters.
- `typename`: Declares a type parameter.
- `T`: The name of the generic type.
- `>`: Closes template parameters.
- `requires`: C++20 keyword introducing a constraint on the template. If this fails, the template is simply excluded from overload resolution with a clean error message.
- `std::integral`: A standard concept that evaluates to true if the type is an integer type.
- `<`: Opens concept arguments.
- `T`: The type being checked.
- `>`: Closes concept arguments.
- `||`: Logical OR operator.
- `std::floating_point`: A standard concept that evaluates to true if the type is a float or double.
- `<`: Opens concept arguments.
- `T`: The type being checked.
- `>`: Closes concept arguments.
- `constexpr`: Marks the function as evaluable at compile time.
- `T`: The return type.
- `optimize_math`: The function name.
- `(`: Opens parameters.
- `T`: The parameter type.
- `value`: The parameter name.
- `)`: Closes parameters.
- `{`: Opens the function body.
- `if`: The standard conditional keyword.
- `constexpr`: Modifier indicating the condition must be evaluated during compilation. The branch that is not taken is completely discarded and is not compiled.
- `(`: Opens condition.
- `std::integral`: The standard concept.
- `<`: Opens concept arguments.
- `T`: The type to check.
- `>`: Closes concept arguments.
- `)`: Closes condition.
- `{`: Opens true branch.
- `return`: Keyword to exit and pass back a value.
- `value`: The parameter.
- `<<`: The bitwise left-shift operator (fast multiply by 2).
- `1`: The shift amount.
- `;`: Ends the statement.
- `}`: Closes true branch.
- `else`: The fallback keyword.
- `{`: Opens false branch.
- `return`: Keyword to exit and pass back a value.
- `value`: The parameter.
- `*`: The multiplication operator.
- `2`: The literal two.
- `;`: Ends the statement.
- `}`: Closes false branch.
- `}`: Closes function body.

### CS Lens
Static branching / Dead code elimination.
Also recognized in: C preprocessor `#ifdef`, conditional compilation in Rust (`#[cfg]`), Zig's `comptime if`.

### SE Lens
Expressiveness. `if constexpr` flattens what used to be a complex web of `std::enable_if` struct specializations into a single readable imperative function, massively reducing cognitive load. Concepts replace dense template errors with exact, human-readable reasons why a type failed to match.

### Commands needed
No new commands.

### Run it
Cannot run standalone yet.

### Connection
We have now transitioned from raw TMP to modern `constexpr` branching and sequence generation.

---

## Closing

### Connect the pieces
We built a mechanism to shift load to compile time: `compute_scaling_factor` executes imperative logic during compilation to fill a `make_scaling_table` `std::array`. That array is stored purely in the binary. When we need to feed its values into a function, `apply_array` uses `std::make_index_sequence` to deduce parameter packs and expand `arr[Is]...` as literal arguments. Finally, `optimize_math` proves that when we need to handle different generic types, we discard unreadable SFINAE in favor of C++20 Concepts and `if constexpr`, resolving branches at compile time without throwing compilation errors on invalid discarded branches.

### What breaks without this
If you remove the `constexpr` keyword from the `if` statement in `optimize_math`:
```cpp
if (std::integral<T>) {
    return value << 1;
}
```
And try to compile it with a `float`, the compiler will crash with an error like `invalid operands to binary expression ('float' and 'int')`. Standard `if` requires both branches to be valid C++ for the given type, even if the runtime condition is false. `if constexpr` structurally deletes the branch from the compiler's view.

### Exercises
1. Change `make_scaling_table` so it accepts an invocable object (a lambda) instead of hardcoding the call to `compute_scaling_factor`.
2. Write a `requires` constraint for a class template that ensures a type is both default constructible and copyable.

### Definition of done
- [x] Create `compile_math.h`.
- [x] Implement loop-based compile-time evaluation.
- [x] Generate a compile-time lookup table using `std::array`.
- [x] Unpack arrays using `std::integer_sequence`.
- [x] Replace SFINAE logic with Concepts and `if constexpr`.
- [x] Commit: `git commit -m "Introduce modern compile-time evaluation replacing classic TMP"`
