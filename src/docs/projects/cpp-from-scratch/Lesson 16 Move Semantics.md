# Lesson 16: Move Semantics

**What you will build** — An exploration of how C++ transfers ownership of memory instead of copying it, enabling high-performance object management without memory leaks or unnecessary duplication. You will build classes that intentionally "steal" resources from temporary objects.

**What you need to know first** — Lesson 07 Constructors and Destructors, Lesson 10 Operator Overloading.

**Terms introduced in this lesson**
- **lvalue** — an expression that points to a specific memory location and has an identifiable name or address. *Why it exists:* It represents data that persists beyond a single expression, meaning you can safely assign to it or take its address.
- **rvalue** — an expression that does not have a persistent memory address, typically a temporary value or literal. *Why it exists:* It represents data that is about to be destroyed, making it safe to "steal" its resources instead of copying them.
- **Move semantics** — the process of transferring ownership of a resource (like allocated memory) from one object to another without copying the underlying data. *Why it exists:* It eliminates expensive and unnecessary deep copies when returning objects from functions or passing temporary objects.
- **Rule of Five** — a C++ rule stating that if a class requires a custom destructor, copy constructor, or copy assignment operator, it almost certainly requires all five (adding move constructor and move assignment). *Why it exists:* It ensures a class correctly manages its memory across all possible lifecycle events—creation, copying, moving, and destruction.

**Objects and methods used**
- **std::move**
  - *What it is:* A standard library function that casts an lvalue into an rvalue reference.
  - *Implementation:* `template <class T> typename remove_reference<T>::type&& move(T&& t) noexcept;` (available in `<utility>`)
  - *Its use:* Tells the compiler that an object is no longer needed in its current state, allowing its resources to be stolen by a move constructor or move assignment operator.
- **Everything else in the file, not this lesson's subject but still explained:**
  - `std::string` — reappearing from Lesson 04.

---

## Concept Unit: lvalues vs rvalues

### The Problem
In C++, every expression produces a value. Some values have a permanent home in memory, while others exist only temporarily during an evaluation. To control memory efficiently, we must first distinguish between data we can safely hold onto and data that is about to evaporate.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are exploring fundamental language mechanics.
- **Files affected** — `main.cpp` (created).
- **Change type** — add.

### The New Code
```cpp
#include <iostream>
#include <string>

int main() {
    std::string firstName = "Alice";
    std::string lastName = "Smith";

    std::string fullName = firstName + lastName;

    std::cout << "Name: " << fullName << "\n";
    return 0;
}
```

### The Updated Project
This is the entirety of `main.cpp`. We are running a basic string concatenation to expose value categories.

### Isolate and Discard
The code above demonstrates **lvalues** and **rvalues**. 
- `firstName`, `lastName`, and `fullName` are **lvalues**. They have a name, occupy a specific memory address, and persist beyond the line they are declared on.
- `"Alice"`, `"Smith"`, and the result of the expression `firstName + lastName` are **rvalues**. They are temporary values created just long enough to be assigned to an lvalue, and then they are destroyed. You cannot take the memory address of `firstName + lastName`.
This `main.cpp` is a throwaway example to prove the concept and is now discarded.

### Mechanical walkthrough
- `#include <iostream>`: Includes the standard input/output stream library for printing.
- `#include <string>`: Includes the standard string library.
- `int main() { ... }`: The entry point of a C++ program.
- `std::string firstName = "Alice";`: Declares a variable `firstName`. `firstName` is an lvalue. `"Alice"` is a string literal, which acts as an rvalue initializing the string.
- `std::string fullName = firstName + lastName;`: Evaluates `firstName + lastName`, yielding a brand new, temporary `std::string` object (an rvalue). That temporary object is then copied into the lvalue `fullName`.
- `std::cout << "Name: " << fullName << "\n";`: Prints the result to standard output.
- `return 0;`: Returns a success code to the operating system.

### CS Lens
The distinction between lvalues (locator values) and rvalues (read values) exists in many compiled languages. An lvalue refers to a memory location that can be written to, while an rvalue is a transient value that only exists for computation. 
Also recognized in: C, Rust, compiler syntax trees where expressions are categorized as assignable or non-assignable.

### SE Lens
Before C++11, the temporary object created by `firstName + lastName` was always deeply copied into `fullName`, wasting CPU cycles allocating memory and copying characters only to immediately destroy the temporary. Identifying rvalues is the first step toward fixing that inefficiency.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main`: Compiles the file into an executable named `main`.
- `./main`: Runs the compiled executable.

### Run it
```
Name: AliceSmith
```

### Connection
Now that we can identify temporary rvalues, we need a way to tell the compiler when an lvalue is no longer needed so we can treat it like a temporary rvalue.

---

## Concept Unit: `std::move`

### The Problem
Sometimes you have an lvalue (a named variable) that you are entirely done using. You want to transfer its heavy contents to another object without copying, but the compiler protects lvalues from being stolen from. You need a way to explicitly tell the compiler, "Treat this lvalue as a temporary rvalue."

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `main.cpp` (replaced).
- **Change type** — replace.
- **Dependencies** — `<utility>` header for `std::move`.

### The New Code
```cpp
#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string source = "Heavy Data";
    std::string destination = std::move(source);

    std::cout << "Destination: " << destination << "\n";
    std::cout << "Source after move: " << source << "\n";
    return 0;
}
```

### The Updated Project
This replaces the entire `main.cpp`.

### Isolate and Discard
The code above demonstrates **std::move**. It forces the compiler to treat the lvalue `source` as an rvalue reference (`&&`). Because `source` is now seen as an rvalue, the `std::string` class uses its move semantics to steal the memory pointer from `source` rather than copying the characters. `source` is left in a valid but empty state.
This throwaway code is now discarded.

### Mechanical walkthrough
- `#include <utility>`: Brings in the `<utility>` header, which provides the `std::move` function.
- `std::string source = "Heavy Data";`: Creates an lvalue string holding data.
- `std::string destination = std::move(source);`: Initializes `destination`. The `std::move(source)` call casts the lvalue `source` into an rvalue reference. It does *not* actually move anything on its own; it merely changes how the compiler categorizes the expression. Because the right side is now an rvalue, `std::string` steals the internal memory buffer of `source`.
- `std::cout << "Source after move: " << source << "\n";`: Prints `source`, which is now an empty string because its contents were stolen.

### CS Lens
This is an explicit "Transfer of Ownership." Rather than duplicating a resource, ownership is handed from one variable to another. 
Also recognized in: Rust's default ownership model, unique pointers, operating system file handles.

### SE Lens
`std::move` prevents expensive deep copies. The tradeoff is safety: after calling `std::move(source)`, you must not rely on the value of `source`. It is in a "valid but unspecified state," meaning it is safe to destroy or reassign, but reading from it is a logic error.

### Commands needed to make this unit real
No new commands. `g++ -std=c++17 main.cpp -o main` continues to compile the file.

### Run it
```
Destination: Heavy Data
Source after move: 
```

### Connection
`std::move` allows us to request a move, but a move only happens if the object's class knows *how* to be moved. We need to define that behavior in our own classes using a move constructor.

---

## Concept Unit: The Move Constructor

### The Problem
When you write a custom class that manages dynamic memory (like raw pointers), the compiler's default copy behavior will copy the pointer address, leading to double-free crashes. You need to teach your class how to gracefully steal a pointer from an rvalue temporary, leaving the temporary harmless.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `main.cpp` (replaced).
- **Change type** — replace.

### The New Code
```cpp
#include <iostream>
#include <utility>

class Buffer {
private:
    int* data;
public:
    Buffer() {
        data = new int[100];
        std::cout << "Constructed\n";
    }

    Buffer(Buffer&& other) noexcept {
        data = other.data;
        other.data = nullptr;
        std::cout << "Move Constructed\n";
    }

    ~Buffer() {
        delete[] data;
    }
};

int main() {
    Buffer a;
    Buffer b = std::move(a);
    return 0;
}
```

### The Updated Project
This replaces `main.cpp` completely.

### Isolate and Discard
This code demonstrates the **move constructor**. It takes an rvalue reference (`Buffer&&`) to another object. Instead of allocating a new array and copying elements, it simply copies the memory address from `other` and then sets `other.data` to `nullptr`. When `other` is eventually destroyed, its destructor deletes `nullptr`, which safely does nothing.
This code is now discarded.

### Mechanical walkthrough
- `class Buffer`: A simple class managing a raw dynamically allocated array.
- `Buffer()`: A default constructor that allocates heap memory using `new int[100]`. (Reappearing from Lesson 07: Constructors).
- `Buffer(Buffer&& other) noexcept`: The move constructor. The `&&` signifies that `other` is an rvalue reference (a temporary or a `std::move`'d object). The `noexcept` keyword promises the compiler that this move operation will never throw an exception.
- `data = other.data;`: Steals the pointer from the rvalue object. `this->data` now points to the heap memory originally owned by `other`.
- `other.data = nullptr;`: Nullifies the rvalue's pointer. If we didn't do this, both `this` and `other` would point to the same memory, and `other`'s destructor would delete it, breaking `this->data`.
- `~Buffer() { delete[] data; }`: The destructor frees the memory. Deleting a `nullptr` is a safe no-op in C++.
- `Buffer a;`: Constructs a new `Buffer` object using the default constructor.
- `Buffer b = std::move(a);`: Triggers the move constructor because `std::move` casts `a` to an rvalue reference.

### CS Lens
The move constructor implements "Pointer Swapping." Instead of moving megabytes of data, we move a few bytes representing a memory address. 
Also recognized in: swapping linked list nodes, updating virtual memory page tables, transferring network socket ownership.

### SE Lens
Move constructors make returning large objects from functions nearly free. The tradeoff is that implementing them manually for classes with multiple pointers or resources introduces a high risk of subtle bugs—forgetting to nullify a stolen pointer results in fatal double-free errors.

### Commands needed to make this unit real
No new commands.

### Run it
```
Constructed
Move Constructed
```

### Connection
The move constructor handles stealing resources when an object is *created*. But what if we want to move resources into an object that *already exists*?

---

## Concept Unit: The Move Assignment Operator

### The Problem
If you already have a fully constructed object, and you want to overwrite it with the contents of a temporary rvalue, the move constructor cannot help you. You need an operator that frees the existing object's old memory before stealing the new memory.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `main.cpp` (replaced).
- **Change type** — replace.

### The New Code
```cpp
#include <iostream>
#include <utility>

class Buffer {
private:
    int* data;
public:
    Buffer() {
        data = new int[100];
    }
    
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            other.data = nullptr;
            std::cout << "Move Assigned\n";
        }
        return *this;
    }

    ~Buffer() {
        delete[] data;
    }
};

int main() {
    Buffer a;
    Buffer b;
    b = std::move(a);
    return 0;
}
```

### The Updated Project
Replaces `main.cpp` with a new version focusing on assignment.

### Isolate and Discard
This code demonstrates the **move assignment operator** (`operator=(Buffer&&)`). Because `b` already exists and owns its own memory, it must first `delete[] data` before stealing `a`'s pointer. The self-assignment check (`if (this != &other)`) ensures we don't accidentally delete our own memory if someone writes `b = std::move(b)`.
This throwaway code is discarded.

### Mechanical walkthrough
- `Buffer& operator=(Buffer&& other) noexcept`: Overloads the assignment operator specifically for rvalue references. It returns a reference to `*this` to support chained assignment (`a = b = c`).
- `if (this != &other)`: Compares the memory address of the current object (`this`) with the address of the incoming object (`&other`). If they are the same, we skip everything to avoid destroying our own data.
- `delete[] data;`: Frees the memory `b` currently owns, because we are about to overwrite its pointer.
- `data = other.data;`: Steals the pointer from `other`.
- `other.data = nullptr;`: Nullifies `other`'s pointer, exactly like the move constructor.
- `return *this;`: Returns the modified object itself.
- `Buffer b;`: Constructs a second `Buffer`.
- `b = std::move(a);`: Calls the move assignment operator because `b` is already constructed, and `std::move(a)` provides an rvalue reference.

### CS Lens
This mirrors "Resource Reallocation." When a process takes over a new resource, it must gracefully release its previous resource to prevent leaks before assuming control of the new one.
Also recognized in: garbage collector sweeps, GPU texture memory swapping.

### SE Lens
Move assignment is essential for maintaining high performance in container classes like `std::vector`, which frequently reassign and move elements internally when resizing. The tradeoff is the mandatory self-assignment check; omitting it leads to catastrophic data loss on `x = std::move(x)`.

### Commands needed to make this unit real
No new commands.

### Run it
```
Move Assigned
```

### Connection
We now have a destructor, a move constructor, and a move assignment operator. This pattern of resource management is so common that C++ formalizes it into a specific rule governing how classes are designed.

---

## Concept Unit: The Rule of Five

### The Problem
If your class manages its own memory, defining only a destructor or only a move constructor leaves holes in how the object behaves when copied or moved. The compiler generates default versions of the missing operators, which will blindly copy raw pointers and cause memory corruption.

### Project Change
- **Reference Source** — No reference counterpart.
- **Files affected** — `main.cpp` (replaced).
- **Change type** — replace.

### The New Code
```cpp
#include <iostream>
#include <utility>

class Buffer {
private:
    int* data;
public:
    Buffer() { data = new int[100]; }
    
    // 1. Destructor
    ~Buffer() { delete[] data; std::cout << "Destroyed\n"; }
    
    // 2. Copy Constructor
    Buffer(const Buffer& other) {
        data = new int[100];
        // In reality, we would copy the contents of the array here
        std::cout << "Copy Constructed\n";
    }
    
    // 3. Copy Assignment Operator
    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            delete[] data;
            data = new int[100];
            std::cout << "Copy Assigned\n";
        }
        return *this;
    }
    
    // 4. Move Constructor
    Buffer(Buffer&& other) noexcept {
        data = other.data;
        other.data = nullptr;
        std::cout << "Move Constructed\n";
    }
    
    // 5. Move Assignment Operator
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            other.data = nullptr;
            std::cout << "Move Assigned\n";
        }
        return *this;
    }
};

int main() {
    Buffer a;
    Buffer b = a;            // Copy Constructor
    Buffer c = std::move(a); // Move Constructor
    return 0;
}
```

### The Updated Project
Replaces `main.cpp` to demonstrate a fully compliant Rule of Five class.

### Isolate and Discard
This code demonstrates the **Rule of Five**. If a class manually defines *any* of the five special member functions (Destructor, Copy Constructor, Copy Assignment, Move Constructor, Move Assignment), it almost certainly needs to define *all* of them.
This throwaway code is discarded.

### Mechanical walkthrough
- `~Buffer()`: **Destructor**. Frees the managed resource. (Reappearing from Lesson 07).
- `Buffer(const Buffer& other)`: **Copy Constructor**. Allocates new memory and duplicates the data, leaving the original intact.
- `Buffer& operator=(const Buffer& other)`: **Copy Assignment Operator**. Frees old memory, allocates new memory, and duplicates data. (Reappearing from Lesson 10).
- `Buffer(Buffer&& other) noexcept`: **Move Constructor**. Steals the pointer, nullifies the original.
- `Buffer& operator=(Buffer&& other) noexcept`: **Move Assignment Operator**. Frees old memory, steals the pointer, nullifies the original.
- `Buffer b = a;`: `a` is an lvalue, so the compiler selects the Copy Constructor, performing a safe deep copy.
- `Buffer c = std::move(a);`: `a` is cast to an rvalue reference, so the compiler selects the Move Constructor, safely stealing the resource.

### CS Lens
The Rule of Five is an application of "Resource Lifecycle Management." It guarantees that every state transition an entity can undergo (creation, duplication, transfer, and destruction) has explicitly defined semantics, leaving no undefined edge cases.

### SE Lens
Adhering to the Rule of Five guarantees memory safety. The engineering tradeoff is severe boilerplate. Modern C++ development prefers the "Rule of Zero": delegating memory management entirely to smart pointers (like `std::unique_ptr`) or containers (like `std::vector`) so that you don't have to write any of these five methods yourself.

### Commands needed to make this unit real
No new commands.

### Run it
```
Copy Constructed
Move Constructed
Destroyed
Destroyed
Destroyed
```

### Connection
By defining all five methods, our `Buffer` class behaves perfectly in every scenario—copied when it must be, moved when it can be, and safely destroyed when it's done.

---

## Connect the Pieces
When a function returns a large `std::string`, it returns an rvalue. Because `std::string` implements the Rule of Five, the compiler automatically uses the move constructor to steal the string's internal memory buffer. You get the string without a single character being copied. `std::move` lets us manually invoke this same stealing behavior on lvalues when we know we are finished with them.

## What Breaks Without This
Remove the move constructor from the `Buffer` class in Unit 5, leaving only the copy constructor, and compile.
```cpp
Buffer c = std::move(a);
```
**The Failure:**
It doesn't fail to compile. Instead, because there is no move constructor, the compiler silently falls back to the copy constructor. It allocates new memory and performs an expensive deep copy. The program still works, but the performance optimization of moving is completely lost.

## Exercises
1. **The Vector Mover:** Create a class that owns a `std::vector`. Implement the move constructor to steal the vector (using `std::move` on the vector itself), and prove it leaves the original vector empty.
2. **The Logger Rule of Five:** Create a class that opens a file handle in its constructor. Implement the Rule of Five so that copying duplicates the file, moving transfers the handle, and the destructor closes it safely.

## Definition of Done
- [ ] You can explain the difference between an lvalue and an rvalue.
- [ ] You can explain what `std::move` actually does to an expression.
- [ ] You can write a move constructor that safely nullifies the original object's pointers.
- [ ] You can implement a self-assignment check in a move assignment operator.
- [ ] You can list the five methods mandated by the Rule of Five and explain why they belong together.
