# Lesson 25: Template Specialization

**What you will build:** You will write generic types that automatically change their underlying logic when provided with specific types like booleans or pointers. The transferable problem this solves is handling edge cases in generic programming—where 99% of types behave one way, but one specific type requires a completely different approach—without losing the compiler's strict type safety or incurring runtime performance penalties.

**What you need to know first:** Lesson 11 Templates, Lesson 22 constexpr.

**Terms introduced in this lesson:**
- **Template specialization** — Overriding a generic template with a specific implementation for a particular type or category of types. *Why it exists:* To allow edge cases (like how `bool` is stored differently than other primitives) to have their own optimized logic without breaking the unified generic interface.
- **Full specialization** — A template override that locks down every single generic parameter to an exact, specific type. *Why it exists:* To handle one absolute type differently from the rest.
- **Partial specialization** — A template override that locks down the *shape* of a type (like a pointer or an array) while keeping the underlying type generic. *Why it exists:* To handle whole categories of types (e.g., all pointers need to be dereferenced) without writing a separate specialization for `int*`, `double*`, etc.
- **`if constexpr`** — A conditional statement evaluated entirely at compile time, discarding the false branches before the program is built. *Why it exists:* To branch logic based on types within a single function, avoiding the boilerplate of writing separate template specialization structs just to change one line of code.

**Objects and methods used:**
- **std::is_same_v**
  - *What it is:* A compile-time type trait that checks if two types are perfectly identical.
  - *Implementation:* `template <class T, class U> inline constexpr bool is_same_v;`
  - *Its use:* Used as the condition inside an `if constexpr` block to determine the current type of `T` at compile time.

---

## Concept Unit: Full Specialization

### The Problem
When you write a generic template, it assumes the code inside it works identically for every possible type. But sometimes, a specific type requires completely different logic. For example, printing a boolean as `1` or `0` might be fine for a generic formatter, but you might want it to explicitly print `"true"` or `"false"`.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are proving the compiler's behavior in isolation.
- **Files affected:** `main.cpp` (created)
- **Change type:** replace
- **Location:** whole file

### The New Code
```cpp
#include <iostream>

template <typename T>
struct Formatter {
    void print(T value) {
        std::cout << "Generic: " << value << "\n";
    }
};

template <>
struct Formatter<bool> {
    void print(bool value) {
        std::cout << "Boolean: " << (value ? "true" : "false") << "\n";
    }
};

int main() {
    Formatter<int> intFmt;
    intFmt.print(42);

    Formatter<bool> boolFmt;
    boolFmt.print(true);

    return 0;
}
```

### The Updated Project
```cpp
// ← new
#include <iostream>

template <typename T>
struct Formatter {
    void print(T value) {
        std::cout << "Generic: " << value << "\n";
    }
};

template <>
struct Formatter<bool> {
    void print(bool value) {
        std::cout << "Boolean: " << (value ? "true" : "false") << "\n";
    }
};

int main() {
    Formatter<int> intFmt;
    intFmt.print(42);

    Formatter<bool> boolFmt;
    boolFmt.print(true);

    return 0;
}
// ← new
```
This is a complete, runnable C++ file. It defines a generic `Formatter`, overrides it for `bool`, and proves both versions execute when their respective types are instantiated.

### Mechanical walkthrough
- `template <typename T> struct Formatter`: The primary template blueprint. If the compiler doesn't find a more specific match, it falls back to generating a struct from this.
- `template <>`: Declares a full specialization. The empty angle brackets tell the compiler "this template requires no further type deduction; the types are fully locked in."
- `struct Formatter<bool>`: The name of the specialization. The `<bool>` tells the compiler exactly which instantiation of the primary blueprint is being overridden.
- `Formatter<int> intFmt;`: Since there is no specialization for `int`, the compiler uses the primary template.
- `Formatter<bool> boolFmt;`: The compiler intercepts this request and uses the specialized `Formatter<bool>` struct instead of the primary one.

### CS Lens
This is compile-time polymorphism. Unlike runtime polymorphism (virtual functions), which checks an object's type while the program is running to decide which code to execute, template specialization decides *during compilation*. There is zero performance cost when the program runs.

### SE Lens
The alternative not chosen is writing unrelated classes like `IntFormatter` and `BoolFormatter`. The tradeoff here is keeping the API unified. By specializing `Formatter<T>`, the caller doesn't have to change their naming scheme; they just ask for `Formatter<TheirType>` and the compiler routes it to the optimal implementation.

### Commands needed
Run the compiler: `g++ -std=c++17 main.cpp -o main`

### Run it. Show the real output
```text
Generic: 42
Boolean: true
```

### Discard the throwaway example
This code exists only to prove full specialization. It is now discarded and will not appear in the project again.

---

## Concept Unit: Partial Specialization

### The Problem
Full specialization targets exactly one type (like `bool`). But what if you want to target a whole *category* of types? For instance, you want your template to behave one way for normal values, but a different way for pointers (like `int*` or `double*`), without hardcoding a separate specialization for every single pointer type.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are proving the compiler's behavior in isolation.
- **Files affected:** `main.cpp` (replaced)
- **Change type:** replace
- **Location:** whole file

### The New Code
```cpp
#include <iostream>

template <typename T>
struct Wrapper {
    void describe() {
        std::cout << "A regular value\n";
    }
};

template <typename T>
struct Wrapper<T*> {
    void describe() {
        std::cout << "A pointer to something\n";
    }
};

int main() {
    Wrapper<int> w1;
    w1.describe();

    Wrapper<int*> w2;
    w2.describe();

    return 0;
}
```

### The Updated Project
```cpp
// ← new
#include <iostream>

template <typename T>
struct Wrapper {
    void describe() {
        std::cout << "A regular value\n";
    }
};

template <typename T>
struct Wrapper<T*> {
    void describe() {
        std::cout << "A pointer to something\n";
    }
};

int main() {
    Wrapper<int> w1;
    w1.describe();

    Wrapper<int*> w2;
    w2.describe();

    return 0;
}
// ← new
```
This complete file replaces the previous one. It proves that `T*` intercepts all pointer types while leaving the underlying type `T` generic.

### Mechanical walkthrough
- `template <typename T> struct Wrapper<T*>`: The syntax of partial specialization. The first `<typename T>` keeps `T` as an open parameter (unlike full specialization's empty `<>`), while the `<T*>` specifies the *shape* that triggers this specialization.
- `Wrapper<int> w1;`: `int` is not a pointer. The compiler falls back to the primary template.
- `Wrapper<int*> w2;`: The compiler matches `int*` against `T*`. It deduces `T` is `int`, and uses the specialized `T*` blueprint.

### CS Lens
This is pattern matching at compile time. The compiler evaluates the requested type against the available template signatures from most specific to least specific, stopping at the first valid match.

### SE Lens
The alternative not chosen is requiring the user to manually pass a flag indicating if they provided a pointer, or relying on function overloading instead of structs. The tradeoff here is structural complexity versus seamless consumption. Partial specialization allows you to write custom memory management for pointers inside generic containers (like `std::vector`) without burdening the end-user.

### Commands needed
Run the compiler: `g++ -std=c++17 main.cpp -o main`

### Run it. Show the real output
```text
A regular value
A pointer to something
```

### Discard the throwaway example
This code exists only to prove partial specialization. It is now discarded and will not appear in the project again.

---

## Concept Unit: if constexpr

### The Problem
Using structs to specialize templates is extremely verbose. If all you want to do is change one single line of code inside a generic function based on the type, writing an entire primary struct and a separate specialized struct is overkill. You need a way to branch logic *inside* a single function, but safely at compile time.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are proving the compiler's behavior in isolation.
- **Files affected:** `main.cpp` (replaced)
- **Change type:** replace
- **Location:** whole file

### The New Code
```cpp
#include <iostream>
#include <type_traits>

template <typename T>
void processValue(T value) {
    if constexpr (std::is_same_v<T, bool>) {
        std::cout << "Processing bool: " << (value ? "true" : "false") << "\n";
    } else if constexpr (std::is_same_v<T, int>) {
        std::cout << "Processing int: " << (value * 2) << "\n";
    } else {
        std::cout << "Processing other type\n";
    }
}

int main() {
    processValue(42);
    processValue(true);
    processValue(3.14);
    return 0;
}
```

### The Updated Project
```cpp
// ← new
#include <iostream>
#include <type_traits>

template <typename T>
void processValue(T value) {
    if constexpr (std::is_same_v<T, bool>) {
        std::cout << "Processing bool: " << (value ? "true" : "false") << "\n";
    } else if constexpr (std::is_same_v<T, int>) {
        std::cout << "Processing int: " << (value * 2) << "\n";
    } else {
        std::cout << "Processing other type\n";
    }
}

int main() {
    processValue(42);
    processValue(true);
    processValue(3.14);
    return 0;
}
// ← new
```
This complete file replaces the previous one. It proves that type-specific logic can be handled in a single function template without needing separate specialized structs.

### Mechanical walkthrough
- `#include <type_traits>`: The standard library header providing compile-time type introspection utilities.
- `if constexpr (...)`: A compile-time conditional branch. The compiler evaluates the condition while building the program. Whichever branch evaluates to false is literally erased from the compiled code.
- `std::is_same_v<T, bool>`: A standard type trait that returns `true` if `T` and `bool` are exactly the same type, and `false` otherwise.

### CS Lens
This is conditional compilation built directly into the language syntax. Before `if constexpr` (C++17), developers had to rely on template specialization or complex, unreadable tricks like SFINAE (Substitution Failure Is Not An Error) to achieve the same result.

### SE Lens
The alternative not chosen is a regular `if` statement. The problem with a regular `if` is that all branches must still successfully compile, even if they never run. If you called a method that only exists on `T=int` inside a regular `if`, and then instantiated the template with `T=bool`, the compiler would fail trying to compile the dead `int` code for the `bool` type. `if constexpr` solves this by safely deleting the invalid dead code before it is fully verified.

### Commands needed
Run the compiler: `g++ -std=c++17 main.cpp -o main`

### Run it. Show the real output
```text
Processing int: 84
Processing bool: true
Processing other type
```

### Discard the throwaway example
This code exists only to prove `if constexpr`. It is now discarded and will not appear in the project again.

---

## Connect the Pieces

When writing generic C++ code, you have tools to handle exceptions to the generic rule at different scales. If a type needs entirely different state or a different layout, use full specialization (`template <> struct`). If an entire category of types (like pointers) shares a structural difference, use partial specialization (`template <typename T> struct <T*>`). If the overall structure is identical but a few lines of logic differ based on type, handle it inline with `if constexpr`.

## What Breaks Without This

If you try to use a standard `if` statement to call a type-specific method in a generic function, compilation will fail.

Modify the `processValue` function in the last example to use a regular `if` instead of `if constexpr`, and attempt to call a string-specific method:

```cpp
#include <iostream>
#include <type_traits>
#include <string>

template <typename T>
void processValue(T value) {
    if (std::is_same_v<T, std::string>) {
        std::cout << value.length() << "\n";
    }
}

int main() {
    processValue(42);
    return 0;
}
```

**The compiler error:**
`error: request for member ‘length’ in ‘value’, which is of non-class type ‘int’`

Even though the `if` condition would be `false` for `int`, the standard `if` statement still requires both sides of the branch to be valid C++ for whatever type is passed in. An `int` doesn't have a `.length()` method, so it crashes the compiler. Restoring `if constexpr` deletes the `value.length()` branch entirely when `T` is `int`, making it perfectly safe.

## Exercises

1. **Full Specialization:** Write a generic `template <typename T> struct DefaultValue` that has a `print()` method printing `"No default"`. Then write a full specialization for `double` that prints `"0.0"`. Test both in `main()`.
2. **Partial Specialization:** Write a generic `template <typename T> struct SizeTracker` that prints `"Normal size"`. Write a partial specialization for arrays `template <typename T, int N> struct SizeTracker<T[N]>` that prints `"Array of fixed size"`. Instantiate both.
3. **`if constexpr`:** Write a generic `template <typename T> void printTypeCategory(T val)`. Inside, use `if constexpr` and `std::is_integral_v<T>` to print `"Whole number"`, `std::is_floating_point_v<T>` to print `"Decimal number"`, and a fallback to print `"Other"`. Test with `5`, `3.14`, and `"Hello"`.

## Definition of Done

- [ ] You have run a full specialization and seen the compiler pick the exact type match over the generic template.
- [ ] You have run a partial specialization and seen it intercept pointers.
- [ ] You have written an `if constexpr` branch and seen it execute logic specific to one type.
- [ ] You can explain the difference between a runtime `if` and a compile-time `if constexpr` to someone who hasn't read this lesson.
- [ ] You have run `git commit -am "Completed template specialization lesson concepts"` to save your progress.
