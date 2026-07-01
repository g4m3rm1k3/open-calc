# RAII and Smart Pointers: Modern C++'s Safety Net

In 2014, researchers disclosed **Heartbleed** — a vulnerability in OpenSSL that allowed attackers to read arbitrary memory from servers running vulnerable versions. The bug was a two-line mistake: code returned data beyond the end of a buffer without checking whether it was still valid memory. For two years, this single error exposed private keys, passwords, and session tokens from millions of servers.

The root cause wasn't incompetence. OpenSSL was written and maintained by talented engineers. The root cause was that **C does not require you to track whether memory is valid**. Nothing stops you from reading past an array. Nothing stops you from using a pointer after freeing the memory it points to. Nothing stops you from freeing memory twice.

Modern C++ has systematically built a solution to this problem. It's called RAII, and it's the reason that well-written C++11 or later code is dramatically safer than C or old C++ — without sacrificing performance.

## The Problem: Manual Memory Management

Before C++11, dynamic memory in C++ worked like this:

```cpp
#include <iostream>
#include <stdexcept>

void processData(int size) {
    int* data = new int[size];  // Allocate

    // What happens if this throws?
    if (size > 100) throw std::runtime_error("Too large!");

    for (int i = 0; i < size; i++) data[i] = i * i;

    for (int i = 0; i < size; i++) std::cout << data[i] << " ";
    std::cout << std::endl;

    delete[] data;  // Free — but this line is NEVER reached if an exception throws!
}

int main() {
    processData(5);
    try {
        processData(200);  // Throws — data is leaked!
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << std::endl;
    }
    // The 200 ints allocated inside processData are now leaked — forever
}
```

Every `new` must have a corresponding `delete`. If an exception escapes, if you return early, if you simply forget — the memory is leaked. In long-running servers, leaks accumulate until the process runs out of memory.

## RAII: The Core Insight

**RAII** (Resource Acquisition Is Initialization) is a deceptively simple idea: wrap every resource in an object. The constructor acquires the resource. The destructor releases it. Since the destructor is *guaranteed* to run when the object goes out of scope — even through exceptions — you get automatic, exception-safe resource management.

C++'s `std::unique_ptr` is RAII applied to heap memory:

```cpp
#include <iostream>
#include <memory>
#include <stdexcept>

void processData(int size) {
    // unique_ptr manages the allocation — no explicit delete
    auto data = std::make_unique<int[]>(size);

    if (size > 100) throw std::runtime_error("Too large!");

    for (int i = 0; i < size; i++) data[i] = i * i;

    for (int i = 0; i < size; i++) std::cout << data[i] << " ";
    std::cout << std::endl;

    // When data goes out of scope (including via exception), delete[] is called automatically
}

int main() {
    processData(5);
    try {
        processData(200);  // Throws — but this time, NO leak!
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << std::endl;
    }
    std::cout << "No memory leak — unique_ptr cleaned up automatically" << std::endl;
}
```

The key: `std::unique_ptr`'s destructor calls `delete` (or `delete[]`). Whether the function returns normally or throws an exception, C++ guarantees the destructor runs.

## `std::unique_ptr`: Sole Ownership

`unique_ptr` expresses **sole ownership**: exactly one `unique_ptr` owns each resource at any time. You cannot copy a `unique_ptr` (that would create two owners). You can *move* one — transferring ownership:

```cpp
#include <iostream>
#include <memory>
#include <string>

class Resource {
public:
    std::string name;
    Resource(const std::string& name) : name(name) {
        std::cout << "Acquired: " << name << std::endl;
    }
    ~Resource() {
        std::cout << "Released: " << name << std::endl;
    }
    void use() const {
        std::cout << "Using: " << name << std::endl;
    }
};

std::unique_ptr<Resource> createResource(const std::string& name) {
    return std::make_unique<Resource>(name);  // Ownership transferred to caller
}

int main() {
    auto r1 = createResource("Database Connection");
    r1->use();

    // Transfer ownership to r2 — r1 is now null
    auto r2 = std::move(r1);
    if (!r1) std::cout << "r1 is now null" << std::endl;
    r2->use();

    // unique_ptr works with arrays too
    auto arr = std::make_unique<int[]>(5);
    for (int i = 0; i < 5; i++) arr[i] = i * 10;
    for (int i = 0; i < 5; i++) std::cout << arr[i] << " ";
    std::cout << std::endl;

    // When r2 and arr go out of scope, destructors run automatically
}
```

`std::move` converts an lvalue (named variable) to an rvalue, enabling the transfer. After the move, `r1` is empty — it holds `nullptr`. This is safe and explicit, unlike copying where two owners fight over the same resource.

## `std::shared_ptr`: Shared Ownership with Reference Counting

Sometimes, multiple parts of a program need to share ownership of a resource. `shared_ptr` implements **reference counting**: it tracks how many `shared_ptr` instances point to the same object. When the last one is destroyed, the object is deleted:

```cpp
#include <iostream>
#include <memory>
#include <vector>

class Node {
public:
    int value;
    Node(int v) : value(v) {
        std::cout << "Created node " << value << std::endl;
    }
    ~Node() {
        std::cout << "Destroyed node " << value << std::endl;
    }
};

int main() {
    std::shared_ptr<Node> a = std::make_shared<Node>(42);
    std::cout << "Count after creating a: " << a.use_count() << std::endl;  // 1

    {
        std::shared_ptr<Node> b = a;  // Both a and b own the node
        std::cout << "Count after creating b: " << a.use_count() << std::endl;  // 2

        std::vector<std::shared_ptr<Node>> container;
        container.push_back(a);  // Three owners
        std::cout << "Count after push_back: " << a.use_count() << std::endl;  // 3
    }  // b and container destroyed — count drops back to 1

    std::cout << "Count after scope: " << a.use_count() << std::endl;  // 1
    // Node destroyed when a goes out of scope
}
```

`shared_ptr` is not free — the reference count increment/decrement requires atomic operations (for thread safety), which are slower than simple pointer copies. Use `unique_ptr` when ownership is clear; use `shared_ptr` only when you genuinely need shared ownership.

## `std::weak_ptr`: Breaking Reference Cycles

`shared_ptr` has one failure mode: **circular references**. If A holds a `shared_ptr` to B, and B holds a `shared_ptr` to A, neither will ever reach a count of zero — a memory leak.

`weak_ptr` solves this by observing a `shared_ptr` without owning it — it doesn't increment the reference count:

```cpp
#include <iostream>
#include <memory>
#include <string>

struct Person {
    std::string name;
    std::weak_ptr<Person> bestFriend;  // weak_ptr: no ownership!

    Person(const std::string& n) : name(n) {
        std::cout << name << " created" << std::endl;
    }
    ~Person() {
        std::cout << name << " destroyed" << std::endl;
    }
};

int main() {
    auto alice = std::make_shared<Person>("Alice");
    auto bob   = std::make_shared<Person>("Bob");

    alice->bestFriend = bob;    // Alice observes Bob — no ownership
    bob->bestFriend   = alice;  // Bob observes Alice — no ownership

    // Access through weak_ptr by locking it (checks if still alive)
    if (auto friend_ptr = alice->bestFriend.lock()) {
        std::cout << "Alice's best friend: " << friend_ptr->name << std::endl;
    }

    // When alice and bob go out of scope, both are destroyed cleanly
    // If we'd used shared_ptr, they'd leak!
}
```

## The Rule of Zero

In modern C++, if your class only holds standard containers and smart pointers, you likely don't need to write any special member functions. The **Rule of Zero**: if you can avoid writing destructors, copy constructors, or copy assignment operators, do so. Let the compiler-generated defaults handle it:

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

// Rule of Zero: no user-defined destructor, copy, or move needed
class Simulation {
    std::string name;
    std::vector<std::unique_ptr<double[]>> buffers;
    int bufferSize;

public:
    Simulation(const std::string& name, int bufSize)
        : name(name), bufferSize(bufSize) {}

    void addBuffer() {
        buffers.push_back(std::make_unique<double[]>(bufferSize));
        std::cout << "Added buffer to " << name << std::endl;
    }

    int bufferCount() const { return buffers.size(); }
    // Compiler generates correct destructor: all unique_ptrs freed automatically
    // Copy is disabled (unique_ptr can't be copied) — this is correct!
    // Move works automatically
};

int main() {
    {
        Simulation sim("Physics Sim", 1024);
        sim.addBuffer();
        sim.addBuffer();
        sim.addBuffer();
        std::cout << "Buffers: " << sim.bufferCount() << std::endl;
    }  // sim destroyed, all buffers freed automatically
    std::cout << "All resources cleaned up" << std::endl;
}
```

RAII and smart pointers don't make C++ as safe as Rust (which enforces ownership at the type system level and catches all violations at compile time). But they dramatically reduce the surface area of memory errors. Valgrind reports of memory leaks and sanitizer reports of use-after-free drop to near zero in well-written modern C++ code. The manual `delete` statement should appear in your code almost never — only in the implementation of your own smart pointer, which you should also almost never write.
