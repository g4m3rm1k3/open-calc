# Lesson 23: Type Deduction - auto and decltype

**What you will build:** A series of isolated console programs that allocate memory, manipulate data, and prove how the C++ compiler automatically deduces types. You will observe how `auto` drops qualifiers for safety, how `decltype` preserves them exactly, and how reference collapsing allows code to adapt to any input.

**What you need to know first:**
- Lesson 01 Types and Variables: basic types and variable initialization.
- Lesson 04 References: `&` and `const &`, modifying data through a reference.
- Lesson 11 Templates: the concept of letting the compiler determine types automatically.

**Terms introduced in this lesson:**
- **Type Deduction** — the compiler's ability to figure out a variable's type from its initializer. *Why it exists:* to avoid typing redundant or complex type names while keeping the code statically typed.
- **Type Decay** — the process where type deduction drops reference and `const` qualifiers. *Why it exists:* to ensure that a basic assignment creates a safe, independent copy of the data by default.
- **Reference Collapsing** — the language rule that merges a reference to a reference into a single valid reference. *Why it exists:* so that generic code can accept both temporary values and persistent variables without generating illegal syntax like `int& &`.
- **Forwarding Reference** — a reference declared as `auto&&` that can adapt to bind to any value category. *Why it exists:* to allow a single variable to safely capture any kind of data without unnecessary copying.

**Objects and methods used:**

**Everything else in the file, not this lesson's subject but still explained.**
- **std::cout**
  - *What it is:* The standard character output stream from `<iostream>`.
  - *Implementation:* An instance of `std::ostream` that writes to the console.
  - *Its use:* To make the internal state of your variables visible so you can verify what your program is doing.

---

## Concept Unit: auto and Type Decay

### The Problem
When you read a value from a variable, you generally want your own independent copy to work with. If the source variable happens to be a `const` reference, you do not necessarily want your new variable to be locked as a `const` reference too. The compiler needs a safe default behavior for deducing types that guarantees you get a fresh, modifiable copy unless you ask otherwise.

### The New Code
```cpp
#include <iostream>

int main() {
    int original = 42;
    const int& ref = original;

    auto copy = ref;
    copy = 100;

    std::cout << "Original: " << original << "\n";
    std::cout << "Copy: " << copy << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>` imports the standard input/output stream library so we can print values.
- `int main() {` defines the entry point of the program.
- `int original = 42;` allocates memory for a standard integer and sets it to 42.
- `const int& ref = original;` creates a read-only reference to the existing `original` variable.
- `auto copy = ref;` deduces the type for `copy`. The compiler looks at `ref`, which is a `const int&`. By default, `auto` applies **type decay**: it strips away the reference (`&`) and strips away the `const` qualifier. The resulting deduced type is a plain `int`. A brand-new memory location is allocated for `copy`, and the value 42 is copied into it.
- `copy = 100;` overwrites the data in the memory location of `copy`. This proves `copy` is neither a reference (because `original` is unaffected) nor `const` (because the reassignment is allowed).
- `std::cout << ...` prints the values, proving that `original` is still 42, while `copy` is 100.
- `return 0;` signals successful completion of the program.

### CS Lens
This embodies the concept of "pass-by-value" semantics applied to type inference. Safe defaults are a critical language design choice. By forcing `auto` to drop references and immutability guarantees, C++ ensures that generic code behaves like standard assignment: you get an isolated copy. To get a reference, you must explicitly opt-in by writing `auto&`.

### SE Lens
The engineering principle is safety through isolation. The alternative not chosen is exact type matching for `auto`, where `auto x = ref;` would silently create another `const` reference. The tradeoff is that if you actually wanted a reference to avoid a heavy memory copy, a plain `auto` will quietly duplicate the data instead. You must intentionally write `auto&` or `const auto&` to share memory.

### Run It Yourself
1. Open a terminal and run `touch auto_decay.cpp` to create a new file.
2. Open `auto_decay.cpp` and replace all its contents with the code above.
3. Compile the program with `g++ -std=c++17 auto_decay.cpp -o auto_decay`.
4. Run the program with `./auto_decay`.
5. Expected output:
   ```text
   Original: 42
   Copy: 100
   ```
   *Discard this throwaway file after verifying the output.*

---

## Concept Unit: Reference Collapsing and auto&&

### The Problem
Sometimes you want to capture a value by reference to avoid copying it. But values come in two forms: persistent variables (lvalues) and temporary values (rvalues). `auto&` only binds to persistent variables. We need a way to declare a variable that automatically adapts its reference type to bind to absolutely anything without copying.

### The New Code
```cpp
#include <iostream>

int main() {
    int original = 42;

    auto&& persistentRef = original;
    persistentRef = 100;

    auto&& temporaryRef = 999;
    temporaryRef = 200;

    std::cout << "Original now: " << original << "\n";
    std::cout << "temporaryRef now: " << temporaryRef << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `int original = 42;` creates a standard persistent integer.
- `auto&& persistentRef = original;` asks the compiler to form a **forwarding reference**. `original` is an lvalue. `auto` is deduced as `int&`. The compiler attempts to create `int& &&` (an rvalue reference to an lvalue reference). C++ applies **reference collapsing** rules: any combination containing an lvalue reference (`&`) collapses to just `&`. The final type of `persistentRef` becomes exactly `int&`.
- `persistentRef = 100;` overwrites the original memory location, proving it successfully bound as a mutable lvalue reference.
- `auto&& temporaryRef = 999;` uses the exact same syntax, but `999` is an rvalue (a temporary literal). `auto` is deduced as `int`. The compiler creates `int&&`. Reference collapsing is not needed because there is no conflict. The final type is `int&&` (an rvalue reference).
- `temporaryRef = 200;` modifies the temporary value whose lifetime was extended by the reference.
- `std::cout << ...` prints the variables to confirm the mutations succeeded.

### CS Lens
This embodies algebraic reduction rules applied to type systems. Just as multiplying a positive and negative number yields a predictable sign, reference collapsing follows strict boolean-like logic: `&` + `&&` = `&`, while `&&` + `&&` = `&&`. This mechanism is the backbone of generic programming, allowing a single template or variable to perfectly capture any value category.
Also recognized in: boolean algebra (AND/OR truth tables), type unification in functional languages.

### SE Lens
The alternative not chosen is writing two separate code paths for every situation: one for `int&` and one for `int&&`. The tradeoff of `auto&&` is conceptual complexity. It requires the programmer to understand that `&&` does not always mean "rvalue reference"; when attached to a deduced type like `auto`, it means "forwarding reference" that will dynamically collapse to whatever is necessary.

### Run It Yourself
1. Create `ref_collapse.cpp`.
2. Open it and paste the code above.
3. Compile with `g++ -std=c++17 ref_collapse.cpp -o ref_collapse`.
4. Run with `./ref_collapse`.
5. Expected output:
   ```text
   Original now: 100
   temporaryRef now: 200
   ```
   *Discard this throwaway file after verifying the output.*

---

## Concept Unit: decltype

### The Problem
There are times when `auto`'s decay behavior is dangerous. If you are inspecting a variable, you might need to know its *exact* declared type—including its `const` qualifiers and reference status—without the compiler stripping them away. We need a way to ask the compiler for the literal, undeclared type of an expression.

### The New Code
```cpp
#include <iostream>

int main() {
    int data = 10;
    const int& ref = data;

    decltype(ref) exactRef = data;
    
    // exactRef = 20; // Uncommenting this would cause a compiler error

    std::cout << "Data is: " << exactRef << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `int data = 10;` creates the base integer.
- `const int& ref = data;` establishes a read-only reference to `data`.
- `decltype(ref)` is an operator that evaluates to the exact declared type of the expression `ref`. The compiler inspects the symbol table, sees that `ref` was explicitly declared as `const int&`, and replaces `decltype(ref)` with `const int&`.
- `exactRef = data;` initializes this new `const int&` to point at `data`.
- `// exactRef = 20;` proves the strictness of `decltype`. Unlike `auto`, which would have dropped the `const` and the `&`, `decltype` preserves both. The compiler correctly prevents you from modifying `exactRef` because it perfectly mirrored the read-only constraint.
- `std::cout << ...` prints the value through the exact reference.

### CS Lens
This embodies Compile-Time Reflection. You are programmatically querying the compiler's internal abstract syntax tree to extract metadata (the type) and inject it back into the code. 
Also recognized in: strongly-typed reflection APIs (like Java's `Class<?>`), metaprogramming type-traits.

### SE Lens
The alternative not chosen is manually typing `const int& exactRef = data;`. The tradeoff is verbosity versus maintainability. If the return type of the source variable changes in the future (e.g., from `int` to `double`), `decltype` will automatically update the downstream types, preventing fragile, cascading type mismatches throughout the codebase.

### Run It Yourself
1. Create `decltype_test.cpp`.
2. Paste the code above.
3. Compile with `g++ -std=c++17 decltype_test.cpp -o decltype_test`.
4. Run with `./decltype_test`.
5. Expected output:
   ```text
   Data is: 10
   ```
   *Discard this throwaway file after verifying the output.*

---

## Concept Unit: decltype(auto)

### The Problem
If a function returns a reference to a global variable, and you want to capture that return value exactly as it is, typing `decltype(functionCall()) variable = functionCall();` forces you to write the function call twice. We need a syntax that combines the convenience of `auto` (deducing from the right-hand side) with the exactness of `decltype` (never decaying the type).

### The New Code
```cpp
#include <iostream>

int globalData = 55;

int& getGlobalRef() {
    return globalData;
}

int main() {
    auto decayed = getGlobalRef();
    decayed = 100; 

    decltype(auto) exact = getGlobalRef();
    exact = 999; 

    std::cout << "globalData after decayed assignment: " << globalData << "\n";
    std::cout << "globalData after exact assignment: " << globalData << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `int globalData = 55;` allocates a persistent global integer.
- `int& getGlobalRef() {` declares a function that returns a direct, mutable reference.
- `return globalData;` returns the reference to the caller.
- `auto decayed = getGlobalRef();` evaluates the right side. The function returns `int&`. `auto` rules apply type decay, dropping the `&`. `decayed` becomes an independent `int` initialized with a copy of 55.
- `decayed = 100;` modifies only the local copy. The global data is untouched.
- `decltype(auto) exact = getGlobalRef();` tells the compiler to deduce the type from the initializer, but to use `decltype` rules instead of `auto` rules. The function returns `int&`, so `decltype` preserves it exactly. `exact` is declared as an `int&` pointing directly to `globalData`.
- `exact = 999;` overwrites the actual global variable, proving that `decltype(auto)` perfectly forwarded the reference.

### CS Lens
This embodies Perfect Forwarding. The language provides a mechanism to pass data across boundaries (from function return to local variable) without altering its fundamental nature or accidentally triggering a deep copy.
Also recognized in: network packet routing (preserving headers exactly as received), zero-copy memory buffers.

### SE Lens
The alternative not chosen is forcing the programmer to write out the exact return type manually (`int& exact = ...`). The tradeoff is syntax complexity. `decltype(auto)` looks strange and requires advanced knowledge to read, but it perfectly insulates the local code from changes in the function's signature. If `getGlobalRef()` later changes to return a `const int&`, `exact` will automatically update to `const`, ensuring total safety without code edits.

### Run It Yourself
1. Create `decltype_auto.cpp`.
2. Paste the code above.
3. Compile with `g++ -std=c++17 decltype_auto.cpp -o decltype_auto`.
4. Run with `./decltype_auto`.
5. Expected output:
   ```text
   globalData after decayed assignment: 55
   globalData after exact assignment: 999
   ```
   *Discard this throwaway file after verifying the output.*

---

## Connect the Pieces

Observe how the compiler navigates type constraints step by step:
You call a function returning `const std::string&`. If you assign it to `auto val`, the compiler decays the type, allocates new memory, and copies the string into a mutable `std::string`. If you assign it to `auto&& val`, reference collapsing recognizes an lvalue reference and safely creates a `const std::string&`. If you assign it to `decltype(auto) val`, the compiler perfectly mirrors the exact `const std::string&` return type. In all cases, the compiler acts as a static gatekeeper, enforcing exactly how much isolation or connection your data maintains.

## What Breaks Without This

If you misunderstand `auto` decay, you will accidentally copy massive data structures. Let's prove it by breaking the reference link.

Open a console project and write:
```cpp
#include <iostream>

int data = 1;
int& getData() { return data; }

int main() {
    auto myRef = getData();
    myRef = 500;
    std::cout << data << "\n";
}
```

Run it. The output is `1`, not `500`. The code compiled, but it silently failed to modify the original data because `auto` decayed the reference into a local copy. To fix it and restore the link, change `auto` to `decltype(auto)` or `auto&`.

## Exercises

1. Create a `const double` variable. Use `auto` to create a copy, and prove you can modify the copy (proving `const` was dropped).
2. Create an `int`. Bind it to an `auto&&` reference, and change the value. Then, bind the literal number `10` to an `auto&&` reference.
3. Write a function returning an `int&`. Use `decltype(auto)` to capture the result and modify the original data.

## Definition of Done
- [ ] You have written and executed code that proves `auto` drops reference and `const` qualifiers.
- [ ] You have written and executed code that proves `auto&&` can bind to both variables and temporary values.
- [ ] You have intentionally created a local copy when you meant to create a reference by misusing `auto`.
- [ ] You have verified that `decltype(auto)` preserves the exact return type of a function.
- [ ] You can explain reference collapsing out loud, in your own words, to someone who hasn't read this lesson.
