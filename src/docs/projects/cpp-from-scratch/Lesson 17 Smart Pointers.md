# Lesson 17: Smart Pointers

**What you will build**
A console application that automatically cleans up its own memory when objects go out of scope or are explicitly transferred. You will establish strict ownership rules that prevent memory leaks and dangling pointers, forming the foundation of safe modern C++.

**What you need to know first**
- Lesson 03: Pointers (raw pointers and memory addresses).
- Lesson 08: RAII (Resource Acquisition Is Initialization).
- Lesson 16: Move Semantics (using `std::move` to transfer ownership without copying).

**Terms introduced in this lesson**
- **Smart Pointer** — a class that wraps a raw pointer and manages the allocation and deletion of the memory it points to. *Why it exists:* It uses RAII to guarantee that dynamically allocated memory is freed exactly when it should be, without requiring manual `delete` calls.
- **Ownership** — the responsibility of a specific pointer to destroy the resource it points to. *Why it exists:* It clarifies who is responsible for memory cleanup, preventing double-deletes and memory leaks by design.
- **Reference Count** — a hidden integer tracking how many smart pointers are currently pointing to the same block of memory. *Why it exists:* It allows shared ownership where the last pointer to leave scope is the one that cleans up the memory.
- **Cyclic Reference** — a scenario where two objects hold shared pointers to each other, keeping their reference counts above zero permanently. *Why it exists:* It is a structural memory leak in reference-counted systems, requiring a non-owning pointer type to break the loop.

**Objects and methods used**
- **std::unique_ptr<T>**
  - *What it is:* A smart pointer that strictly enforces exclusive ownership of a dynamically allocated object.
  - *Implementation:* `template<class T, class Deleter = std::default_delete<T>> class unique_ptr;`
  - *Its use:* Used as the default choice for dynamic memory in modern C++ to ensure exactly one owner and zero runtime overhead.
- **std::make_unique<T>()**
  - *What it is:* A helper function that safely allocates memory and immediately wraps it in a `std::unique_ptr`.
  - *Implementation:* `template<class T, class... Args> unique_ptr<T> make_unique(Args&&... args);`
  - *Its use:* Used to construct objects and their unique pointers in a single exception-safe step, completely eliminating the raw `new` keyword.
- **std::shared_ptr<T>**
  - *What it is:* A smart pointer that shares ownership of an object through reference counting.
  - *Implementation:* `template<class T> class shared_ptr;`
  - *Its use:* Used when multiple parts of a program need to hold the same object alive and there is no clear single owner.
- **std::make_shared<T>()**
  - *What it is:* A helper function that allocates both the object and its reference counting control block in a single memory chunk.
  - *Implementation:* `template<class T, class... Args> shared_ptr<T> make_shared(Args&&... args);`
  - *Its use:* Used to create `shared_ptr` instances efficiently, preventing the double-allocation overhead of wrapping a raw `new` call.
- **std::weak_ptr<T>**
  - *What it is:* A smart pointer that observes an object managed by `shared_ptr` without increasing its reference count or claiming ownership.
  - *Implementation:* `template<class T> class weak_ptr;`
  - *Its use:* Used to break cyclic references and check if an object still exists before trying to access it.

---

## Concept Unit: `std::unique_ptr` and `std::make_unique`

### The Problem
If you allocate memory dynamically with `new`, you must manually free it with `delete`. If a function returns early or throws an exception before `delete` is reached, the memory is lost permanently (a memory leak). You need a way to tie the lifecycle of dynamic memory to the predictable scoping rules of normal variables.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are demonstrating standalone concepts that will not be retained in a project.
- **Files affected:** `main.cpp` (created).
- **Change type:** Add.
- **Location:** Brand-new file.
- **Dependencies:** A C++17 compiler.

### The New Code
```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource() { std::cout << "Resource Acquired\n"; }
    ~Resource() { std::cout << "Resource Destroyed\n"; }
    void DoWork() { std::cout << "Doing work...\n"; }
};

int main() {
    std::cout << "Start block\n";
    {
        std::unique_ptr<Resource> ptr = std::make_unique<Resource>();
        ptr->DoWork();
    }
    std::cout << "End block\n";
    return 0;
}
```

### The Updated Project
Because this is a standalone concept demonstration, `main.cpp` represents the entire updated project.

### Mechanical Walkthrough
- `#include <memory>`: Includes the standard library header that provides all smart pointer types and their helper functions.
- `class Resource`: A standard class that prints messages in its constructor and destructor, allowing us to see exactly when memory is allocated and freed.
- `std::unique_ptr<Resource>`: Declares a smart pointer variable that exclusively owns a `Resource` object.
- `ptr`: The name of the local variable holding the smart pointer.
- `=`: The assignment operator binding the created pointer to the variable.
- `std::make_unique<Resource>()`: Safely allocates a `Resource` on the heap and immediately wraps it in a `unique_ptr`. This completely replaces the raw `new` keyword.
- `ptr->DoWork()`: Accesses the object just like a raw pointer using the arrow operator `->`. The smart pointer overloads this operator to pass the call through to the underlying raw pointer.
- `}`: The end of the inner block scope. Because `ptr` is a local variable, it is destroyed here. Its destructor automatically calls `delete` on the underlying raw pointer, freeing the memory.

### Concept Isolation and Discard
Because this entire curriculum relies on throwaway examples for foundational concepts, this code is now explicitly discarded. It will not appear in any future steps.

### CS Lens
This perfectly embodies the RAII (Resource Acquisition Is Initialization) pattern from Lesson 08. The resource (heap memory) is tied directly to the lifespan of a local object (`unique_ptr`).

### SE Lens
Exclusive ownership guarantees no double-deletes and no memory leaks. The compiler ensures that exactly one entity is responsible for the cleanup. The tradeoff is that you cannot copy a `unique_ptr`, which forces you to explicitly think about how ownership moves through your system.

### Commands Needed
`g++ -std=c++17 main.cpp -o main`

### Run It
```
> ./main
Start block
Resource Acquired
Doing work...
Resource Destroyed
End block
```

### Connection
Now that memory cleans itself up automatically within a block, how do we pass that memory to another function without copying it?

---

## Concept Unit: Transferring Ownership with `std::move`

### The Problem
Because `unique_ptr` strictly enforces exclusive ownership, you cannot copy it. If you try to pass it to a function by value, or assign it to another variable, the compiler throws an error. You need a way to hand over the responsibility of the memory to another part of your program.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (replaced).
- **Change type:** Replace.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    ~Resource() { std::cout << "Resource Destroyed\n"; }
};

void TakeOwnership(std::unique_ptr<Resource> paramPtr) {
    std::cout << "Function owns it now\n";
}

int main() {
    std::unique_ptr<Resource> myPtr = std::make_unique<Resource>();
    
    // std::unique_ptr<Resource> copy = myPtr; // This would cause a compile error
    
    TakeOwnership(std::move(myPtr));
    
    if (myPtr == nullptr) {
        std::cout << "myPtr is empty\n";
    }
    
    return 0;
}
```

### The Updated Project
This snippet entirely replaces the previous `main.cpp`.

### Mechanical Walkthrough
- `void TakeOwnership(std::unique_ptr<Resource> paramPtr)`: A function that takes a `unique_ptr` by value. By doing this, it demands absolute ownership of the resource. When the function finishes, `paramPtr` will be destroyed and the resource will be freed.
- `std::move(myPtr)`: Reappearing from Lesson 16. It casts the pointer to an rvalue reference, telling the compiler it is safe to transfer its internal raw pointer out of `myPtr` and into `paramPtr`.
- `if (myPtr == nullptr)`: After the move, the original `unique_ptr` (`myPtr`) is hollowed out. It safely sets its internal raw pointer to `nullptr`.
- `}`: When `TakeOwnership` ends, its local `paramPtr` is destroyed, freeing the resource. Notice this happens *before* "myPtr is empty" is printed.

1. `main` creates `myPtr`, allocating the resource.
2. `TakeOwnership` is called. Ownership is transferred via `std::move`.
3. Inside `TakeOwnership`, "Function owns it now" is printed.
4. `TakeOwnership` finishes. `paramPtr` goes out of scope and is destroyed. "Resource Destroyed" is printed.
5. Control returns to `main`. `myPtr` is checked against `nullptr`, and "myPtr is empty" is printed.

### Concept Isolation and Discard
This code is explicitly discarded.

### CS Lens
This is Linear Types in action. A linear type enforces that a value is used exactly once. While C++ doesn't have strict linear types, `unique_ptr` combined with move semantics simulates it by ensuring only one valid handle to the memory exists at any time.

### SE Lens
Passing a `unique_ptr` by value into a function makes ownership transfer visibly obvious in the method signature. Anyone calling `TakeOwnership` knows they are giving up the object permanently.

### Commands Needed
`g++ -std=c++17 main.cpp -o main`

### Run It
```
> ./main
Function owns it now
Resource Destroyed
myPtr is empty
```

### Connection
Exclusive ownership solves most problems, but what happens when multiple independent systems need to access the same resource and you don't know which one will finish last?

---

## Concept Unit: `std::shared_ptr`

### The Problem
Sometimes exclusive ownership is impossible. For example, a graphical window and an audio engine might both need a reference to the same configuration object. The object should only be destroyed when *both* systems are done with it. You need a way to share ownership safely.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (replaced).
- **Change type:** Replace.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    ~Resource() { std::cout << "Resource Destroyed\n"; }
};

int main() {
    std::shared_ptr<Resource> ptr1 = std::make_shared<Resource>();
    std::cout << "Count initially: " << ptr1.use_count() << "\n";
    
    {
        std::shared_ptr<Resource> ptr2 = ptr1;
        std::cout << "Count inside block: " << ptr1.use_count() << "\n";
    }
    
    std::cout << "Count outside block: " << ptr1.use_count() << "\n";
    return 0;
}
```

### The Updated Project
This snippet entirely replaces the previous `main.cpp`.

### Mechanical Walkthrough
- `std::shared_ptr<Resource>`: Declares a smart pointer that shares ownership via reference counting.
- `ptr1`: The initial smart pointer variable.
- `std::make_shared<Resource>()`: Allocates both the `Resource` and a hidden control block (which holds the reference count) in one contiguous chunk of memory.
- `ptr1.use_count()`: A method that returns the current number of `shared_ptr` instances pointing to this resource. First appearance — returns `1` here.
- `std::shared_ptr<Resource> ptr2`: Declares a second shared pointer inside a nested block.
- `= ptr1`: Unlike `unique_ptr`, `shared_ptr` can be safely copied. The assignment operator reaches into the shared control block and increments the reference count.
- `}`: When the inner block ends, `ptr2` is destroyed. Its destructor decrements the reference count. Because the count drops from 2 to 1 (not 0), the `Resource` is *not* deleted.
- `}`: End of `main`. `ptr1` is destroyed, the count drops to 0, and the `Resource` is finally deleted.

### Concept Isolation and Discard
This code is explicitly discarded.

### CS Lens
This is Reference Counting, a primitive form of Garbage Collection. The system tracks how many references exist and reclaims the memory exactly when the counter reaches zero.

Also recognized in: COM objects in Windows, Python's memory management, Swift's Automatic Reference Counting (ARC).

### SE Lens
`shared_ptr` provides tremendous safety and convenience, but at a cost. The control block requires extra memory, and modifying the reference count must be thread-safe, which introduces performance overhead. You should always default to `unique_ptr` unless shared ownership is explicitly required by the design.

### Commands Needed
`g++ -std=c++17 main.cpp -o main`

### Run It
```
> ./main
Count initially: 1
Count inside block: 2
Count outside block: 1
Resource Destroyed
```

### Connection
Shared pointers work perfectly until two objects decide they need to hold shared pointers to each other.

---

## Concept Unit: `std::weak_ptr`

### The Problem
If two objects hold `shared_ptr`s to each other, their reference counts will never drop to zero, even if all outside pointers are destroyed. This is a cyclic reference, and it causes a permanent memory leak. You need a way to look at a shared resource without actively keeping it alive.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (replaced).
- **Change type:** Replace.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <memory>

class Node {
public:
    std::shared_ptr<Node> neighbor;
    ~Node() { std::cout << "Node Destroyed\n"; }
};

class SafeNode {
public:
    std::weak_ptr<SafeNode> neighbor;
    ~SafeNode() { std::cout << "SafeNode Destroyed\n"; }
};

int main() {
    // Cyclic reference leak
    auto n1 = std::make_shared<Node>();
    auto n2 = std::make_shared<Node>();
    n1->neighbor = n2;
    n2->neighbor = n1;
    
    // Safe reference
    auto s1 = std::make_shared<SafeNode>();
    auto s2 = std::make_shared<SafeNode>();
    s1->neighbor = s2;
    s2->neighbor = s1;
    
    // Check weak_ptr
    if (std::shared_ptr<SafeNode> temp = s1->neighbor.lock()) {
        std::cout << "SafeNode neighbor is alive\n";
    }
    
    return 0;
}
```

### The Updated Project
This snippet entirely replaces the previous `main.cpp`.

### Mechanical Walkthrough
- `std::shared_ptr<Node> neighbor`: Creates a strong, owning reference to another node.
- `n1->neighbor = n2`: `n1` stores a strong pointer to `n2`.
- `n2->neighbor = n1`: `n2` stores a strong pointer to `n1`. Each node now owns the other.
- `std::weak_ptr<SafeNode> neighbor`: Declares a non-owning smart pointer. It observes the object but does not increment its reference count.
- `s1->neighbor = s2`: Assigning a `shared_ptr` to a `weak_ptr` succeeds but leaves the object's reference count completely unchanged.
- `s1->neighbor.lock()`: A `weak_ptr` cannot be accessed directly because the memory might have been deleted on another thread. The `lock()` method creates a temporary `shared_ptr` if the object still exists. First appearance — returns a valid `shared_ptr` if the memory is alive, or an empty one if it was destroyed.
- `std::shared_ptr<SafeNode> temp`: The temporary variable that holds the result of the lock.
- `if (...)`: Checks if the temporarily created `shared_ptr` is valid (not empty) before entering the block.

1. `n1` and `n2` are created. Their reference counts are 1.
2. They point to each other. Their reference counts become 2.
3. `s1` and `s2` are created. Their reference counts are 1.
4. They point to each other using `weak_ptr`. Their reference counts remain 1.
5. End of `main` is reached.
6. The local variables `s1` and `s2` are destroyed. Their reference counts drop from 1 to 0. `SafeNode Destroyed` is printed for both.
7. The local variables `n1` and `n2` are destroyed. Their reference counts drop from 2 to 1. Neither reaches 0, so they are never destroyed and the memory leaks permanently.

### Concept Isolation and Discard
This code is explicitly discarded.

### CS Lens
This breaks reference cycles, transforming a cyclic graph into a Directed Acyclic Graph (DAG) from the perspective of ownership.

### SE Lens
`weak_ptr` is essential for caching, observer patterns, and parent-child tree structures (where the parent owns the child with a `shared_ptr`, and the child points back with a `weak_ptr`). The tradeoff is the mandatory `lock()` check, which forces the programmer to handle the case where the resource no longer exists.

### Commands Needed
`g++ -std=c++17 main.cpp -o main`

### Run It
```
> ./main
SafeNode neighbor is alive
SafeNode Destroyed
SafeNode Destroyed
```
*(Notice that `Node Destroyed` is never printed, proving the leak).*

### Connection
With `unique_ptr` for exclusive ownership, `shared_ptr` for shared ownership, and `weak_ptr` to break cycles, you now have a complete toolkit to manage memory dynamically without ever typing `new` or `delete`.

---

## Closing

**Connect the pieces**
A resource is created with `make_shared`, generating a control block with a reference count of 1. It is passed into an observer class which stores it as a `weak_ptr`, leaving the count at 1. When the original scope ends, the `shared_ptr` is destroyed, dropping the count to 0 and freeing the memory. Later, the observer calls `lock()` on its `weak_ptr`, receives an empty pointer, and safely handles the fact that the resource is gone, avoiding a catastrophic segmentation fault.

**What breaks without this**
Remove the `#include <memory>` directive at the top of the file.
**The Failure:**
```
error: 'unique_ptr' is not a member of 'std'
```
Smart pointers are not built directly into the core language grammar like raw pointers are; they are standard library templates that must be explicitly included.

**Exercises**
1. **The Factory:** Write a function `CreateResource()` that creates a resource using `make_unique` and returns it by value. Call the function from `main` and catch the returned pointer in a local `unique_ptr` variable.
2. **The Cache:** Create an array of 3 `weak_ptr<Resource>` objects. Write a loop that populates them with temporary `shared_ptr` objects inside a block, then loops again outside the block and uses `lock()` to prove they have all expired.

**Definition of done**
- [ ] You can explain why raw `new` and `delete` are dangerous and cause memory leaks.
- [ ] You can use `std::make_unique` to allocate memory and automatically free it.
- [ ] You can use `std::move` to transfer ownership of a `unique_ptr`.
- [ ] You can explain when `shared_ptr` is necessary and how the reference count works.
- [ ] You can explain what a cyclic reference is and how `weak_ptr` prevents it.
