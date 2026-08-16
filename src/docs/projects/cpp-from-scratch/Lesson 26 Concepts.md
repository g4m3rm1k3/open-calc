# Lesson 26: Concepts

**What you will build:** You will write templates that restrict what types they accept based on specific requirements, rather than accepting everything and failing deep inside. You will build constraints using `requires` clauses, test for valid syntax with `requires` expressions, and package these rules into named `concept` declarations. This replaces the complex and fragile SFINAE techniques with clear, intent-driven contracts for your generic code. Every example is discarded after it proves its point.

**What you need to know first:** Lesson 11 Templates, Lesson 25 Template Specialization.

**Terms introduced in this lesson:**
- **Concept** — a named set of requirements that a type must satisfy. *Why it exists:* To make template errors readable and to express design intent directly in the code, rather than relying on accidental substitution failures.
- **Requires clause** — a boolean condition attached to a template that determines if the template can be used. *Why it exists:* To stop the compiler from instantiating a template with a type that will inevitably break, catching the error at the boundary.
- **Requires expression** — a block of code that the compiler checks for validity without actually executing it. *Why it exists:* To probe a type's capabilities (like "does it have a `.size()` method?") at compile time.
- **SFINAE (Substitution Failure Is Not An Error)** — the historical C++ mechanism for constraining templates by deliberately causing substitution failures. *Why it exists:* We name it here only to explicitly replace it; concepts provide the exact same selective behavior but with clear syntax instead of exploiting a compiler quirk.

**Objects and methods used:**
- **std::is_integral_v**
  - *What it is:* A standard library type trait variable template from `<type_traits>`.
  - *Implementation:* `template <class T> inline constexpr bool is_integral_v = is_integral<T>::value;`
  - *Its use:* To ask the compiler if a given type is a whole number type (like `int` or `char`), used as a building block for constraints.
- **std::same_as**
  - *What it is:* A standard library concept from `<concepts>`.
  - *Implementation:* `template <class T, class U> concept same_as = /* internal compiler magic */;`
  - *Its use:* To enforce that an expression produces exactly a specific type, without implicit conversions.

---

## Concept Unit: The `requires` Clause

### The Problem
When you write a generic function like `template <typename T> void printDouble(T value)`, the compiler allows any type to be passed in. If you pass an object that cannot be doubled (like a string literal), the compiler attempts to build the function anyway, resulting in a massive, unreadable error message deep inside the template body. You need a way to reject invalid types at the door.

### The New Code
```cpp
#include <iostream>
#include <type_traits>

template <typename T>
requires std::is_integral_v<T>
void printDouble(T value) 
{
    std::cout << value * 2 << "\n";
}

int main() 
{
    printDouble(5);
    
    // printDouble("hello"); // If uncommented, this causes a constraint error
    return 0;
}
```

### Mechanical Walkthrough
- `#include <type_traits>`: Brings in the `<type_traits>` header, which contains the standard library's compile-time type inspection tools, including `std::is_integral_v`.
- `template <typename T>`: Declares that what follows is a template parameterized by a type `T`. This is the basic, already-established template syntax.
- `requires std::is_integral_v<T>`: A new C++20 keyword. It introduces a **requires clause**, a compile-time boolean condition. If `std::is_integral_v<T>` evaluates to `false`, the compiler simply removes this template from consideration (it is discarded) rather than trying to compile the body and failing.
- `void printDouble(T value)`: The signature of the function, securely guarded by the constraint above it.
- `printDouble(5)`: Passes an `int`. Because `std::is_integral_v<int>` is `true`, the template is instantiated and called.
- `// printDouble("hello")`: Passes a string literal (`const char*`). Because `std::is_integral_v<const char*>` is `false`, the compiler immediately aborts with a clear "constraints not satisfied" error at the call site, rather than trying to multiply a string by two inside the function.

### CS Lens
Preconditions and Contracts. By stating exactly what inputs are valid in the signature itself, you shift the burden of validation from the implementation details to the caller interface.

### SE Lens
Fail Fast and Self-Documenting Code. The alternative not chosen is SFINAE (Substitution Failure Is Not An Error), where you would write complex `std::enable_if` hacks to achieve the same selective instantiation. The SFINAE approach was notoriously difficult to read, write, and maintain. The `requires` clause makes the intent explicit: "This template is only for integers." The cost is that this requires a C++20-compliant compiler.

### Run It Yourself
Create a file named `scratch.cpp`. Paste the code above into it. Compile with C++20 support using `g++ -std=c++20 scratch.cpp -o scratch`. Run `./scratch` (or `.\scratch.exe` on Windows). The exact expected output is:
`10`

---

## Concept Unit: The `requires` Expression

### The Problem
Sometimes you don't care if a type belongs to a specific category like "integral" or "floating-point"; you only care if it supports a specific operation, like the `+` operator. `std::is_integral_v` is too strict. You need to ask the compiler, "If I were to write this exact code, would it compile?" without actually running it.

### The New Code
```cpp
#include <iostream>
#include <string>

template <typename T>
requires requires(T a, T b) { a + b; }
void addAndPrint(T first, T second) 
{
    std::cout << first + second << "\n";
}

int main() 
{
    addAndPrint(10, 20);
    addAndPrint(std::string("A"), std::string("B"));
    return 0;
}
```

### Mechanical Walkthrough
- `requires requires(T a, T b)`: This looks like a stutter, but it serves two distinct roles. The first `requires` introduces the **requires clause** (from the previous unit). The second `requires` begins a **requires expression**, which is a special block that yields `true` or `false` based on whether the code inside it is valid.
- `(T a, T b)`: The parameter list for the requires expression. It invents fake variables of type `T` strictly for the compiler to test with. These variables do not exist at runtime; they are only used to verify syntax.
- `{ a + b; }`: The requirement block. The compiler attempts to parse and type-check the expression `a + b;`. If type `T` has a valid `+` operator, the expression is valid, and the whole `requires` expression evaluates to `true`. If `T` lacks a `+` operator, it evaluates to `false`.
- `addAndPrint(10, 20)`: Passes integers. Integers support `+`, so the condition is satisfied and the template compiles.
- `addAndPrint(std::string("A"), std::string("B"))`: Passes `std::string` objects. `std::string` overloads the `+` operator, so the condition is satisfied. This proves the requires expression is purely behavioral, uniting completely unrelated types that happen to share a syntax.

### CS Lens
Duck Typing at Compile Time. In dynamic languages (like Python), duck typing checks if a method exists at the exact moment it is called at runtime. C++ requires expressions bring duck typing to compile time—the compiler guarantees the capabilities exist before the program ever runs.

### SE Lens
Behavioral Constraints. The alternative not chosen is explicit inheritance (forcing types to inherit from an `IAddable` interface). Inheritance couples unrelated types together artificially and restricts flexibility. A `requires` expression allows types to remain completely independent, uniting them only by the behaviors they independently support.

### Run It Yourself
Replace the contents of `scratch.cpp` with the new code. Compile and run it. The exact expected output is:
```text
30
AB
```

---

## Concept Unit: Named `concept` Declarations

### The Problem
If you have five different generic functions that all need to ensure their parameters can be added together, copying and pasting `requires requires(T a, T b) { a + b; }` onto every single template creates massive duplication and makes the code difficult to read. You need a way to assign a formal name to this requirement so you can reuse it cleanly anywhere.

### The New Code
```cpp
#include <iostream>
#include <string>
#include <concepts>

// Define a named concept
template <typename T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::same_as<T>;
};

// Use the named concept
template <typename T>
requires Addable<T>
void process(T first, T second) 
{
    std::cout << first + second << "\n";
}

int main() 
{
    process(5, 7);
    return 0;
}
```

### Mechanical Walkthrough
- `concept Addable`: The `concept` keyword declares a new named concept. A concept is a compile-time boolean predicate that lives in your namespace. By convention, concepts are named with PascalCase and often act as adjectives.
- `= requires(T a, T b) {`: We assign the `requires` expression directly to the concept name. 
- `{ a + b } -> std::same_as<T>;`: A **compound requirement**. Not only does this check if `a + b` is valid syntax (as we did previously), it explicitly checks the *return type* of that operation. It demands that the result of `a + b` must be exactly type `T` (using the standard `std::same_as` concept). 
- `requires Addable<T>`: The template function now uses a clean `requires` clause, referencing our named concept. The visual stutter is gone, and the intent is perfectly clear.

### CS Lens
Ontology and Taxonomy. Concepts allow you to formalize the vocabulary of your generic architecture. Instead of dealing in raw types, you define named categories of capabilities, creating a formal language that the compiler understands and enforces.

### SE Lens
DRY (Don't Repeat Yourself) applied to constraints. Named concepts consolidate complex compile-time logic into a single source of truth. If the definition of what makes something `Addable` changes, you only update the concept declaration, and all constrained templates automatically inherit the new, stricter rule.

### Run It Yourself
Replace the contents of `scratch.cpp` with the new code. Compile and run it. The exact expected output is:
`12`

---

## Concept Unit: Constrained Auto (Terse Syntax)

### The Problem
Even with named concepts, writing `template <typename T> requires Addable<T>` before every generic function is still verbose. For simple functions, we want a way to say "this parameter must be Addable" directly in the parameter list, making it look and read as simply as a normal function.

### The New Code
```cpp
#include <iostream>

template <typename T>
concept Addable = requires(T a, T b) {
    a + b;
};

// Terse syntax replaces the template header entirely
void fastProcess(Addable auto first, Addable auto second) 
{
    std::cout << first + second << "\n";
}

int main() 
{
    fastProcess(100, 200);
    return 0;
}
```

### Mechanical Walkthrough
- `void fastProcess`: The function signature. Notice there is no `template <typename T>` header above it at all.
- `Addable auto first`: The `auto` keyword in a parameter list automatically turns the function into a template (this is an Abbreviated Function Template, introduced in C++20). Placing the concept name `Addable` directly before `auto` constrains that automatically generated template parameter. It reads perfectly in English: "The parameter `first` is some automatically deduced type that must satisfy `Addable`."
- `Addable auto second`: The second parameter is also deduced and constrained. Note that in this specific syntax, `first` and `second` could theoretically be deduced as *different* types that both happen to be `Addable`.
- `fastProcess(100, 200)`: The compiler deduces `int` for both, checks that `int` satisfies `Addable`, and instantiates the template behind the scenes.

### CS Lens
Syntactic Sugar. The terse syntax doesn't add new semantic power; it is purely a more ergonomic way to write the same underlying abstract syntax tree. It reduces friction, encouraging developers to write safe, constrained generic code by making it as easy to type as dynamic Python code.

### SE Lens
Readability and Noise Reduction. The alternative not chosen is forcing developers to write full template headers for every single generic function. C++'s historical reputation for being overly verbose is directly addressed by this terse syntax, which makes generic code look like ordinary code while retaining strict compile-time type safety.

### Run It Yourself
Replace the contents of `scratch.cpp` with the new code. Compile and run it. The exact expected output is:
`300`

---

## Connect the Pieces
A single trace of the concepts lifecycle: We define an atomic test (`requires(T a, T b) { a + b; }`), assign it a formal name (`concept Addable`), and then attach that name directly to a function parameter (`Addable auto first`). If any developer attempts to pass an un-addable type into the system, the compilation halts immediately at the function call, completely insulated from the template's internal implementation.

## What Breaks Without This
Without concepts, generic programming relies on unconstrained templates. If a type lacks a required capability, the compiler blindly pastes the type into the template body, hits a syntax error, and dumps hundreds of lines of confusing template instantiation traces.

```cpp
template <typename T>
void badProcess(T item) 
{
    item.fly(); // What if T can't fly?
}

// In main:
badProcess(5);
```
**The exact compiler error (without concepts):**
`error: request for member 'fly' in 'item', which is of non-class type 'int'`

**To restore it (with concepts):**
Add a concept `concept Flyable = requires(T a) { a.fly(); };` and change the signature to `void badProcess(Flyable auto item)`. The error moves to the caller site, clearly stating: `error: constraints not satisfied`.

## Exercises
1. Write a concept `HasSize` that checks if a type has a `.size()` method (using a `requires` expression).
2. Write a function `void printSize(HasSize auto container)` that calls and prints `.size()`.
3. Try passing a `std::string` (which has `.size()`) and an `int` (which does not) to `printSize` and observe the exact constraint error for the `int`.

## Definition of Done
- [ ] You can restrict a template using a `requires` clause.
- [ ] You can write a `requires` expression to probe a type's capabilities.
- [ ] You can declare a named `concept` to reuse constraints.
- [ ] You can apply concepts using the terse `auto` syntax.
- [ ] You can explain Concepts out loud, in your own words, to someone who hasn't read this lesson, as the modern replacement for SFINAE.
