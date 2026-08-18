# Lesson 03: The Pimpl Idiom

You will build a `Widget` library class that hides all its internal dependencies and platform-specific state behind a single opaque pointer. By moving the private data members out of the header file and into the source file, you will break the compile-time dependency between the library and its consumers, meaning changes to the library's implementation will no longer force users of the library to recompile.

What you need to know first
- C++ From Scratch (smart pointers, header files, move semantics, incomplete types, destructors)

Terms used in this lesson
- **Pimpl Idiom** — "Pointer to implementation." A C++ programming technique that removes implementation details from a class definition by placing them in a separate class, accessed through an opaque pointer. It exists to minimize compilation dependencies and preserve binary compatibility.
- **Opaque Pointer** — A pointer to a record or data structure of some unspecified type (an incomplete type). It hides the internal details of the object it points to from the client code.
- **Incomplete Type** — A type that has been declared but not yet defined. You can declare a pointer or reference to an incomplete type, but you cannot create an instance of it or dereference it, because the compiler doesn't know its size or layout.
- **Application Binary Interface (ABI)** — The interface between two binary program modules at the machine code level. If the size or layout of a class changes (like adding a private field), the ABI breaks, requiring recompilation of all code using that class.

Objects and methods used
- **`std::unique_ptr`**
  - *What it is:* A smart pointer that owns and manages another object through a pointer and disposes of that object when the `unique_ptr` goes out of scope.
  - *Implementation:* `template<class T, class Deleter = std::default_delete<T>> class unique_ptr;`
  - *Its use:* We use it to hold the pointer to our implementation object, ensuring it is automatically cleaned up when the main class is destroyed, avoiding manual `delete` calls and memory leaks.
- **`std::make_unique`**
  - *What it is:* A standard library function that constructs an object of a given type and wraps it in a `std::unique_ptr`.
  - *Implementation:* `template<class T, class... Args> unique_ptr<T> make_unique(Args&&... args);`
  - *Its use:* We use it inside the source file to allocate the implementation object on the heap and safely initialize our `std::unique_ptr`.

## Concept Unit: Forward Declarations and Incomplete Types

### The Problem
When you include a header file (like `<string>` or `<vector>`) in your own class's header to use as private fields, every file that includes *your* header also drags in those dependencies. If you change a private member in your class, the size of your class changes, and every file that includes your header must be recompiled. In a large codebase, touching one private field can trigger a massive rebuild.

### Introduce the concept in isolation
We can declare a pointer to a type that the compiler knows exists, without telling the compiler what is inside it. This is called a **forward declaration**.

```cpp
// isolated_example.cpp
#include <iostream>

// 1. Forward declaration: "Impl exists, but I won't tell you its size or fields."
struct Impl;

// 2. We can create pointers to it, because all pointers have a fixed size.
struct Wrapper {
    Impl* pimpl;
};

int main() {
    Wrapper w;
    std::cout << "Wrapper size: " << sizeof(w) << " bytes\n";
    return 0;
}
```

Output:
```
Wrapper size: 8 bytes
```
This output proves that the compiler can compute the size of `Wrapper` (8 bytes for a pointer on a 64-bit system) without ever seeing the definition of `Impl`.

### Discard the throwaway example
We are deleting `isolated_example.cpp`. It will not appear in the project again.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are creating a new standalone class to demonstrate the idiom.
- **Files affected** — `Widget.h` (created)
- **Change type** — add
- **Location** — Project root.
- **Dependencies** — `std::unique_ptr`

### The New Code

```cpp
// Widget.h
#pragma once
#include <memory>
#include <string>

class Widget {
public:
    Widget(std::string name);
    ~Widget();

    Widget(Widget&&) noexcept;
    Widget& operator=(Widget&&) noexcept;

    void draw() const;

private:
    struct Impl;
    std::unique_ptr<Impl> pimpl;
};
```

### The Updated Project
```cpp
// Widget.h
// ← new (this is a brand new file, so the entire block above is the structure)
```

### Mechanical walkthrough
1. `#pragma once` — A preprocessor directive that ensures this header file is included only once in a single compilation unit, preventing redefinition errors.
2. `#include <memory>` — Includes the standard library header for `std::unique_ptr`.
3. `#include <string>` — Includes the standard library header for `std::string`, used in the constructor.
4. `class Widget {` — Declares our main class, the interface the client will use.
5. `public:` — Access modifier making the following members accessible to anyone.
6. `Widget(std::string name);` — The constructor declaration. Takes a string to configure the widget.
7. `~Widget();` — The destructor declaration. It must be explicitly declared here (not defaulted or defined inline), because at this point in the header, `Impl` is an incomplete type. If the compiler generates a default destructor here, it won't know how to destroy `Impl`, causing a compilation error.
8. `Widget(Widget&&) noexcept;` — Declares the move constructor. We must explicitly declare it because declaring a destructor prevents the compiler from automatically generating move operations.
9. `Widget& operator=(Widget&&) noexcept;` — Declares the move assignment operator.
10. `void draw() const;` — A public method for the client to call.
11. `private:` — Access modifier hiding the following members.
12. `struct Impl;` — The forward declaration of our implementation struct. This is an incomplete type. We are saying "There is a struct named `Impl`, but its definition is elsewhere."
13. `std::unique_ptr<Impl> pimpl;` — A smart pointer holding the actual implementation. `unique_ptr` can store an incomplete type as long as the type is fully defined by the time the `unique_ptr` needs to destroy it (which will be in the source file, not the header).

### CS Lens
This is an embodiment of the **Bridge Pattern** (or Handle/Body idiom). By separating the abstraction (`Widget`) from its implementation (`Impl`), the two can vary independently. Also recognized in: operating system file descriptors (where the `int` handle hides the complex kernel struct), windowing systems (X11 `Window` handles), and opaque pointers in C libraries (`FILE*` in `<stdio.h>`).

### SE Lens
The principle here is **Information Hiding** and **Minimizing Compile-Time Dependencies**.
The alternative not chosen: putting all private members (like `std::vector<int> data`, `std::mutex mtx`, heavy third-party headers) directly into `Widget.h`. The tradeoff: doing that makes `Widget.h` large and forces every client to recompile when any private member changes, slowing down builds. The cost of Pimpl: one heap allocation per object (to create the `Impl`), and one extra pointer indirection every time a method accesses private data.

### Commands needed
None yet.

### Run it. Show the real output.
This cannot be run yet, because we have only declared the header. It will fail to link until we provide the implementation in `Widget.cpp`.

### One sentence connecting this unit to what came immediately before.
Now that we have a header with a forward-declared `Impl` pointer, we must define what `Impl` actually contains in the source file, out of sight from the compiler when it processes client code.

## Concept Unit: The Implementation File and Delegation

### The Problem
The header file promises that an `Impl` structure exists and that `Widget` has methods, but it does not define them. We need to implement `Impl` and wire `Widget`'s methods to it, ensuring `Impl` is only visible to the compiler when building the library itself, not when building the client.

### Introduce the concept in isolation
We can use a technique called **Delegation**, where an outer interface object forwards its method calls to an inner, hidden object that does the actual work.

```cpp
// isolated_example2.cpp
#include <iostream>
#include <memory>

struct Hidden {
    void do_work() { std::cout << "Work done behind the scenes.\n"; }
};

struct Interface {
    std::unique_ptr<Hidden> ptr = std::make_unique<Hidden>();
    void perform() { ptr->do_work(); }
};

int main() {
    Interface i;
    i.perform();
    return 0;
}
```
Output:
```
Work done behind the scenes.
```
This proves that the interface class can forward its method calls to the internal object it owns, hiding the logic inside the inner structure.

### Discard the throwaway example
We are deleting `isolated_example2.cpp`. It will not appear in the project again.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `Widget.cpp` (created)
- **Change type** — add
- **Location** — Project root.
- **Dependencies** — `Widget.h`

### The New Code

```cpp
// Widget.cpp
#include "Widget.h"
#include <iostream>

struct Widget::Impl {
    std::string name;
    int draw_count = 0;

    Impl(std::string n) : name(std::move(n)) {}

    void draw_internal() {
        draw_count++;
        std::cout << "Drawing widget: " << name << " (Count: " << draw_count << ")\n";
    }
};

Widget::Widget(std::string name)
    : pimpl(std::make_unique<Impl>(std::move(name))) {}

Widget::~Widget() = default;

Widget::Widget(Widget&&) noexcept = default;
Widget& Widget::operator=(Widget&&) noexcept = default;

void Widget::draw() const {
    pimpl->draw_internal();
}
```

### The Updated Project
```cpp
// Widget.cpp
// ← new (brand new file)
```

### Mechanical walkthrough
1. `#include "Widget.h"` — Brings in our class declaration so we can implement its methods.
2. `#include <iostream>` — We can include heavy headers here safely, because client code won't see this file, avoiding cascading dependencies.
3. `struct Widget::Impl {` — Fully defines the previously incomplete `Impl` type. Because it is nested in `Widget`'s namespace, we scope it with `Widget::`.
4. `std::string name;` — A private data member of the implementation.
5. `int draw_count = 0;` — Another private data member keeping track of internal state.
6. `Impl(std::string n) : name(std::move(n)) {}` — The `Impl` constructor, taking ownership of the string.
7. `void draw_internal() {` — The actual work method.
8. `draw_count++;` — Mutates internal state.
9. `std::cout << "Drawing widget: " << name << " (Count: " << draw_count << ")\n";` — Prints output using the hidden state.
10. `Widget::Widget(std::string name)` — The `Widget` constructor definition.
11. `: pimpl(std::make_unique<Impl>(std::move(name))) {}` — Initializes the `unique_ptr` by allocating a new `Impl` on the heap and passing the string to its constructor. This is the exact cost of the Pimpl idiom: one heap allocation.
12. `Widget::~Widget() = default;` — We tell the compiler to generate the default destructor *here*. This is critical: in this source file, `Impl` is fully defined, so `std::unique_ptr<Impl>` knows how to delete it safely.
13. `Widget::Widget(Widget&&) noexcept = default;` — Defaults the move constructor here, for the same reason.
14. `Widget& Widget::operator=(Widget&&) noexcept = default;` — Defaults the move assignment operator here.
15. `void Widget::draw() const {` — Defines the public interface method.
16. `pimpl->draw_internal();` — Dereferences the pointer to call the actual implementation. This is the other exact cost of the Pimpl idiom: one pointer indirection per call.

### CS Lens
This pattern creates an **Application Binary Interface (ABI) boundary**. Because the `Widget` object itself contains only a single pointer (`pimpl`), `sizeof(Widget)` is always exactly the size of one pointer (e.g., 8 bytes). If you later add five new fields to `Widget::Impl`, `sizeof(Widget)` remains 8 bytes. This means pre-compiled client code that links to this library does not need to be recompiled when you update the library internals, preserving binary compatibility. Also recognized in: dynamic linked libraries (.dll, .so) exposing stable C APIs.

### SE Lens
The principle is **Encapsulation**. By enforcing a strict boundary, you guarantee that no client code can accidentally depend on your private fields, because they literally cannot see them. The tradeoff is boilerplate: every public method requires a forwarding wrapper function, and you must manually define the destructor and move semantics in the source file.

### Commands needed
None yet. We need a `main.cpp` to compile and run.

### Run it. Show the real output.
Still requires the client `main.cpp` to run.

### One sentence connecting this unit to what came immediately before.
With the implementation hidden away and the delegation wired up, we can now write a client that uses `Widget` without ever seeing `Impl`.

## Concept Unit: Client Code and Compile-Time Isolation

### The Problem
We need to prove that client code can include `Widget.h`, instantiate a `Widget`, and call its methods, all without knowing what `Impl` contains or including `<iostream>`.

### Introduce the concept in isolation
To prove **Compile-Time Isolation**, we can look at what happens when a definition is strictly partitioned.
```cpp
// isolated_example3.cpp
#define SECRET 42
struct Hidden { int value = SECRET; };
struct API { Hidden* h; };
```
If a client includes only the API but not the definition of `Hidden`, they cannot access `h->value`. They are perfectly isolated from the secret details.

### Discard the throwaway example
We are deleting `isolated_example3.cpp`.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `main.cpp` (created)
- **Change type** — add
- **Location** — Project root.
- **Dependencies** — `Widget.h`, `Widget.cpp`

### The New Code

```cpp
// main.cpp
#include "Widget.h"
// Note: We do NOT include <iostream> or know about Impl.

int main() {
    Widget w("Dashboard");
    w.draw();
    w.draw();
    return 0;
}
```

### The Updated Project
```cpp
// main.cpp
// ← new (brand new file)
```

### Mechanical walkthrough
1. `#include "Widget.h"` — The client includes only the interface header. The compiler processes this and sees that `Widget` has a `unique_ptr<Impl>`, but `Impl` is incomplete.
2. `int main() {` — The entry point of the client application.
3. `Widget w("Dashboard");` — Instantiates a `Widget`. The compiler calls the constructor declared in the header, which is defined in the source file to do the actual allocation.
4. `w.draw();` — Calls the public method. The delegation to `Impl` happens inside the compiled library code, completely opaque to `main.cpp`.
5. `w.draw();` — Calls it again to prove state (`draw_count`) persists inside the hidden pointer.
6. `return 0;` — Exits. The `Widget` destructor is called automatically, which correctly destroys the `unique_ptr` and the `Impl` because we defaulted the destructor in the source file.

### CS Lens
This demonstrates **Separation of Concerns** at the build level. The build system parses `main.cpp` and `Widget.cpp` as independent translation units. `main.cpp` only needs the symbol signatures from `Widget.h`. The linker connects the calls at the end.

### SE Lens
The principle is **Decoupling**. The client depends only on the abstraction. If we change `Widget.cpp` to use a GPU for drawing, we only recompile `Widget.cpp`, and then relink. `main.cpp` doesn't even need to be recompiled.

### Commands needed
To compile and link all files into a single executable:
`g++ -std=c++17 main.cpp Widget.cpp -o app`

### Run it. Show the real output.
```bash
./app
```
Output:
```
Drawing widget: Dashboard (Count: 1)
Drawing widget: Dashboard (Count: 2)
```

### One sentence connecting this unit to what came immediately before.
The client successfully drives the hidden implementation, proving the Pimpl idiom works exactly as designed.

---

## Closing

- **Connect the pieces** — When `main.cpp` executes `Widget w("Dashboard");`, it calls the `Widget` constructor defined in `Widget.cpp`. That constructor dynamically allocates a `Widget::Impl` on the heap, passing `"Dashboard"` to the `Impl`'s constructor, and stores the resulting pointer in the `std::unique_ptr<Impl> pimpl` member of `Widget`. When `w.draw()` is called, `Widget::draw()` forwards the call by dereferencing `pimpl->draw_internal()`, causing the private `draw_count` to increment and the text to print. Finally, when `w` goes out of scope, the destructor (defaulted in `Widget.cpp`) safely destroys the `unique_ptr`, which deallocates the `Impl`.
- **What breaks without this** — If we remove `Widget::~Widget() = default;` from `Widget.cpp` and put it inline in `Widget.h` (`~Widget() = default;`), the compilation will fail with an error like `invalid application of 'sizeof' to an incomplete type 'Widget::Impl'`. The `std::unique_ptr` needs to know the size of the object to call `delete` on it, which it cannot do in the header.
- **Exercises** —
  1. Add a `std::vector<int>` field to `Widget::Impl` in `Widget.cpp` and recompile only `Widget.cpp`. Observe that `main.cpp` does not need to be recompiled.
  2. Implement a Copy Constructor and Copy Assignment operator for `Widget`. Since `unique_ptr` cannot be copied, you must manually allocate a new `Impl` in the copy constructor and copy the data from the source `Impl`.
- **Definition of done** —
  - [x] Pimpl interface defined in header.
  - [x] Impl struct defined in source file.
  - [x] Destructor and move semantics implemented in source file.
  - [x] Client application runs successfully.
  - `git commit -m "Implement Widget class using Pimpl idiom to isolate private state and minimize compilation dependencies"`
