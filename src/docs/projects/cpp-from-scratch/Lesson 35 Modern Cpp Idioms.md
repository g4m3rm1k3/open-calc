# Lesson 35: Modern C++ Idioms

**What you will build:** You will write a series of isolated, throwaway C++ programs that pass data between functions. Each program will prove how modern C++ vocabulary types enforce a strict, specific contract between the caller and the function, eliminating unnecessary memory allocations, null pointer bugs, and ambiguous sentinel values. These examples are explicitly discarded after each unit; they never become part of a larger project.

**What you need to know first:** Lesson 12 Standard Library Containers, Lesson 17 Smart Pointers, Lesson 21 const Correctness.

**Terms used in this lesson:**
- **Vocabulary type** — A standard library type that exists purely to express a specific meaning or contract in function signatures, rather than to do heavy computation itself. *Why it exists:* To give programmers a shared, standard way to say "this might be missing" or "this is a read-only view" without inventing custom types for every project.
- **The Narrowest Contract** — The software engineering principle of choosing the most restrictive type that still allows a function to do its job. *Why it exists:* Broad types (like taking a `std::string` when you only need to read it, or returning a raw pointer when you mean "optional value") force the compiler to allow behaviors the function wasn't actually designed to handle. Narrow types turn those misuses into compile-time errors.
- **Non-owning view** — A type that looks at memory belonging to someone else, but is not responsible for allocating or freeing it. *Why it exists:* To allow fast, zero-copy read access to data without the overhead of copying or the danger of manual pointer arithmetic.

**Objects and methods used:**
- **std::string_view**
  - *What it is:* A non-owning, read-only view of a contiguous sequence of characters.
  - *Implementation:* `class string_view`
  - *Its use:* Replacing `const std::string&` in function parameters to accept both C-strings and `std::string` without ever triggering an allocation.
- **std::span / size**
  - *What it is:* A non-owning view of a contiguous sequence of objects.
  - *Implementation:* `template<class T, std::size_t Extent> class span; size_t size() const;`
  - *Its use:* Passing arrays, `std::vector`, or `std::array` to a function uniformly without losing their length or copying them.
- **std::optional / has_value / value**
  - *What it is:* A wrapper that contains either a value of type `T`, or nothing.
  - *Implementation:* `template<class T> class optional; bool has_value() const; T& value();`
  - *Its use:* Returning a value that might legitimately fail to compute, replacing "sentinel" return values like `-1` or `nullptr`.
- **std::variant / std::get / std::holds_alternative**
  - *What it is:* A type-safe union that holds exactly one value from a predefined list of types.
  - *Implementation:* `template<class... Types> class variant; template<class T> bool holds_alternative(const variant&); template<class T> T& get(variant&);`
  - *Its use:* Representing a state that can be one of several specific, completely different things (like "an integer OR a string") without resorting to raw `void*` or inheritance.
- **std::any / std::any_cast**
  - *What it is:* A type-safe container for single values of any copy-constructible type.
  - *Implementation:* `class any; template<class T> T any_cast(any&);`
  - *Its use:* Escaping static typing entirely when a container must hold literally anything, at the cost of performance and compile-time safety.

---

## Concept Unit: std::string_view

### The Problem
When a function needs to read a string, taking `const std::string&` is the classic choice. However, if you pass a string literal like `"hello"` to that function, C++ creates a temporary, hidden `std::string`, allocates memory on the heap, copies "hello" into it, passes the reference, and then immediately destroys it. This invisible allocation happens every single time the function is called with a raw C-string. You need a type whose contract says "I will only look at characters, I don't care who owns them, and I will never allocate memory to do so."

### The New Code
```cpp
#include <iostream>
#include <string>
#include <string_view>

void print_greeting(std::string_view name) {
    std::cout << "Hello, " << name << "!\n";
}

int main() {
    std::string dynamic_name = "Alice";
    
    // No allocation here: string_view just points to dynamic_name's buffer.
    print_greeting(dynamic_name); 
    
    // No allocation here: string_view just points to the literal in binary.
    print_greeting("Bob"); 
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <string_view>`: The header providing the `std::string_view` type.
- `std::string_view name`: The function parameter. It holds exactly two things internally: a pointer to the start of the characters, and a length. It does not own the characters.
- `print_greeting(dynamic_name)`: A `std::string` implicitly converts to a `std::string_view`. The view simply records the pointer to `dynamic_name`'s internal buffer and its size.
- `print_greeting("Bob")`: A string literal (a `const char*`) implicitly converts to a `std::string_view`. The compiler counts the characters at compile time, and the view points directly to the read-only memory segment where `"Bob"` lives. No `std::string` is ever created, and the heap is never touched.

### CS Lens
This is the "fat pointer" pattern. A normal pointer only knows *where* memory starts; it relies on a null-terminator `\0` to know where it ends. A fat pointer pairs the address with an explicit length, making bounds checking fast and safe (an O(1) operation) while entirely removing the need to scan for null terminators.

### SE Lens
The alternative not chosen is overloading the function: `void print_greeting(const std::string&)` and `void print_greeting(const char*)`. The tradeoff there is code duplication. By adhering to the principle of the Narrowest Contract, `std::string_view` asks for exactly what it needs: a read-only sequence of characters. It refuses to demand a specific memory layout or ownership model, making the function maximally reusable.

### Run It Yourself
1. Open a terminal and create `stringview.cpp`.
2. Paste the code above.
3. Compile: `g++ -std=c++17 stringview.cpp -o sv`
4. Run: `./sv`
5. Observe the output. Delete the file; we are done with it.

---

## Concept Unit: std::span

### The Problem
When a function needs to process a list of numbers, taking `const std::vector<int>&` forces callers to put their data into a `std::vector`. If they have a raw array, a `std::array`, or just a subset of a vector, they must copy their data into a new temporary `std::vector` just to call your function. You need a generic, non-owning view for *any* contiguous block of memory, not just characters.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <span>
#include <array>

void print_numbers(std::span<const int> numbers) {
    std::cout << "Span size: " << numbers.size() << "\n";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << "\n";
}

int main() {
    std::vector<int> vec = {1, 2, 3};
    std::array<int, 2> arr = {4, 5};
    int raw[] = {6, 7, 8, 9};

    print_numbers(vec); // Views the vector's buffer
    print_numbers(arr); // Views the array's buffer
    print_numbers(raw); // Views the raw C-array
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <span>`: The header for `std::span` (introduced in C++20).
- `std::span<const int> numbers`: Declares a view over a contiguous sequence of integers. The `const` means this specific span refuses to modify the elements, fulfilling the narrowest contract: "I only read."
- `numbers.size()`: Returns the number of elements the span covers. Unlike raw pointers, the span knows its own length.
- `print_numbers(vec)`: The `std::vector` implicitly converts to a span. The span grabs the vector's underlying data pointer and size.
- `print_numbers(arr)` and `print_numbers(raw)`: The compiler knows the size of `std::array` and raw arrays at compile time, so it automatically configures the span with the correct length. No size arguments need to be passed manually.

### CS Lens
Like `std::string_view`, `span` is a non-owning fat pointer, but generalized via templates to work with any data type. It bridges the gap between C-style memory (raw arrays) and C++ object-oriented containers without forcing the performance penalty of copying data between them.

### SE Lens
The alternative not chosen is passing a pointer and a size: `void print_numbers(const int* ptr, size_t size)`. The tradeoff there is safety: humans forget to pass the size, or pass the wrong size, causing buffer overflows. `std::span` encapsulates both pieces of data into a single, type-safe unit, completely neutralizing the risk of a mismatched size argument.

### Run It Yourself
1. Create `span.cpp`.
2. Paste the code above.
3. Compile with C++20: `g++ -std=c++20 span.cpp -o span`
4. Run: `./span`
5. Observe the output. Delete the file.

---

## Concept Unit: std::optional

### The Problem
When a function searches for something and fails, how does it report failure? Returning `-1`, `""`, or a null pointer are "sentinel values." But what if `-1` is actually a valid answer? Using sentinels forces the caller to remember arbitrary rules ("Oh right, -1 means failure here") and causes silent bugs when they forget to check. You need a type whose explicit contract is "this value might legitimately not exist."

### The New Code
```cpp
#include <iostream>
#include <optional>
#include <string>
#include <string_view>

std::optional<int> parse_id(std::string_view input) {
    if (input == "admin") {
        return 42;
    }
    return std::nullopt;
}

int main() {
    std::optional<int> id = parse_id("guest");
    
    if (id.has_value()) {
        std::cout << "Found ID: " << id.value() << "\n";
    } else {
        std::cout << "No ID found.\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <optional>`: The header for `std::optional`.
- `std::optional<int>`: The return type. It reserves enough memory on the stack for an `int`, plus an extra hidden boolean flag to track whether the integer is currently "alive" or not.
- `return 42`: Implicitly wraps the integer `42` inside an `optional` and sets the internal "alive" flag to true.
- `return std::nullopt`: A standard constant representing an empty state. It sets the `optional`'s "alive" flag to false.
- `id.has_value()`: Checks the internal boolean flag. Without this check, you are flying blind.
- `id.value()`: Extracts the actual integer. If the optional is empty, calling `.value()` throws a `std::bad_optional_access` exception, actively preventing you from using garbage memory.

### CS Lens
This is the concept of an Algebraic Data Type (specifically, a "Sum Type" of `T + Nothing`). By encoding the possibility of absence directly into the type system, the compiler forces the programmer to acknowledge it. 

### SE Lens
The alternative not chosen is passing a pointer (`int* parse_id(...)`) so you can return `nullptr` on failure. The tradeoff is heap allocation and memory management overhead just to communicate "not found." `std::optional` lives entirely on the stack, requiring zero heap allocations, providing absolute safety with maximum performance.

### Run It Yourself
1. Create `optional.cpp`.
2. Paste the code above.
3. Compile: `g++ -std=c++17 optional.cpp -o opt`
4. Run: `./opt`
5. Observe the output. Delete the file.

---

## Concept Unit: std::variant

### The Problem
Sometimes a configuration file or a network payload can hold different types of data in the same field: a setting might be an integer (`Port: 80`), a string (`Host: "localhost"`), or a boolean (`Enabled: true`). You could create a struct with all three fields and leave two blank, but that wastes memory and leaves the contract ambiguous ("Which field is the real one?"). You need a type-safe way to say "this is exactly one of these three things, and nothing else."

### The New Code
```cpp
#include <iostream>
#include <variant>
#include <string>

using Setting = std::variant<int, std::string, bool>;

void print_setting(const Setting& val) {
    if (std::holds_alternative<int>(val)) {
        std::cout << "Int: " << std::get<int>(val) << "\n";
    } else if (std::holds_alternative<std::string>(val)) {
        std::cout << "String: " << std::get<std::string>(val) << "\n";
    } else if (std::holds_alternative<bool>(val)) {
        std::cout << "Bool: " << (std::get<bool>(val) ? "true" : "false") << "\n";
    }
}

int main() {
    Setting s1 = 8080;
    Setting s2 = std::string("localhost");
    
    print_setting(s1);
    print_setting(s2);
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <variant>`: The header for `std::variant`.
- `std::variant<int, std::string, bool>`: Defines a closed set of allowed types. The compiler calculates the size of the largest type (likely `std::string`) and reserves exactly that much memory, plus a small integer index to remember which type is currently active.
- `Setting s1 = 8080`: Assigns an integer. The variant stores the `8080` in its memory block and updates its hidden index to indicate "Type 0 (int) is active."
- `std::holds_alternative<int>(val)`: Checks the variant's hidden index. It returns true if the variant currently holds an `int`.
- `std::get<int>(val)`: Extracts the integer. If the variant actually holds a string at this moment, this throws a `std::bad_variant_access` exception.

### CS Lens
This is a "tagged union" (or true Sum Type: `A + B + C`). C-style unions overlap memory but rely on the programmer to blindly remember what was stored last, leading to undefined behavior if read incorrectly. A tagged union enforces safety by managing the "tag" (the index of the active type) internally and mathematically preventing unsafe reads.

### SE Lens
The alternative not chosen is Object-Oriented inheritance (`class Setting`, derived `IntSetting`, `StringSetting`, etc.) combined with `dynamic_cast`. The tradeoff there is massive boilerplate, heap allocations for every setting, and pointer indirection overhead. `std::variant` keeps everything contiguous on the stack with zero dynamic allocation, and represents a "closed" architecture: the compiler knows every possible type up front.

### Run It Yourself
1. Create `variant.cpp`.
2. Paste the code above.
3. Compile: `g++ -std=c++17 variant.cpp -o var`
4. Run: `./var`
5. Observe the output. Delete the file.

---

## Concept Unit: std::any

### The Problem
If `std::variant` is a strictly locked menu of choices, occasionally you need a container with no rules at all. If you are building a generic plugin system, a scripting language interpreter, or an event bus where users can attach literal arbitrary objects that your core system has never seen before, you cannot know the types at compile time. You need a type whose contract is "I will hold absolutely anything."

### The New Code
```cpp
#include <iostream>
#include <any>
#include <string>

int main() {
    std::any storage = 42;
    
    // We must guess the type perfectly to get it out.
    int number = std::any_cast<int>(storage);
    std::cout << "Stored: " << number << "\n";
    
    // Changing the type dynamically
    storage = std::string("Now I am a string");
    
    try {
        // Deliberately guessing wrong to show the safety net
        float mistake = std::any_cast<float>(storage);
    } catch (const std::bad_any_cast& e) {
        std::cout << "Caught an error: " << e.what() << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <any>`: The header for `std::any`.
- `std::any storage = 42`: Creates an `any` object. Because it has no idea how large the incoming type might be, `std::any` usually allocates memory on the heap to store the data, and records C++ `type_info` to remember what it is holding.
- `std::any_cast<int>(storage)`: The extraction mechanism. You must explicitly declare the exact type you believe is inside.
- `storage = std::string(...)`: Overwrites the `any`. The old integer is destroyed, new memory is likely allocated, and it becomes a string.
- `catch (const std::bad_any_cast& e)`: If you request a `float` but it holds a `std::string`, `any_cast` throws. The C++ runtime intervenes before undefined behavior can occur.

### CS Lens
This is dynamic typing implemented in a statically typed language. It acts exactly like variables in Python or JavaScript. It works through "Type Erasure": the container forgets the specific type at compile time but embeds a runtime metadata tag so it can check identity later.

### SE Lens
The alternative not chosen is a `void*` (a raw memory pointer with no type). The tradeoff is that `void*` provides zero safety: if you cast a string to an integer, it just silently reads garbage memory and crashes later. `std::any` trades a small amount of performance (allocations and type checks) to guarantee that you either guess the type exactly right, or receive an immediate, handled exception. It is the widest possible contract, representing an explicit abandonment of compile-time safety when flexibility is mandatory.

### Run It Yourself
1. Create `any.cpp`.
2. Paste the code above.
3. Compile: `g++ -std=c++17 any.cpp -o any`
4. Run: `./any`
5. Observe the output. Delete the file.

---

## Closing

**Connect the pieces:** 
Consider a generic configuration parser function. By applying the Narrowest Contract, we define the signature based on exactly what the function does. It takes `std::string_view` for the filename (because it only reads the name, without owning it). It returns `std::optional<std::variant<int, std::string>>` (because the file might fail to load, and if it succeeds, the setting must be strictly an integer or a string). If it took `std::string` and returned `std::any`, it would demand unnecessary memory allocations and force the caller to guess the returned type.

**What breaks without this:**
If you change `std::optional<int> id = parse_id("guest");` to an integer that uses `0` as a sentinel:
`int id = parse_id("guest");`
And later `parse_id` is updated to return legitimate `0` for the root user, your `if (id == 0)` failure check now falsely rejects valid users. The lack of an explicit `optional` contract causes a silent, catastrophic logic bug.

**Exercises:**
1. Write a function that takes a `std::span<int>` and a `std::string_view` prefix, and prints the prefix before each number. Call it with both a `std::vector` and a raw array.
2. Modify the `std::variant` example to add a fourth type: `double`. Update the `print_setting` function to handle it, and create a `Setting` initialized with `3.14`.
3. Try compiling the `std::span` example with `-std=c++17`. Read the compiler error to understand how crucial language version flags are for modern vocabulary types.

**Definition of done:**
- [ ] You have run all five examples and seen their outputs.
- [ ] You have deleted all the example files.
- [ ] You can explain why `std::string_view` is preferred over `const std::string&`.
- [ ] You understand that `std::optional` replaces sentinel values like `nullptr` or `-1`.
- [ ] You can articulate the principle of the Narrowest Contract.
