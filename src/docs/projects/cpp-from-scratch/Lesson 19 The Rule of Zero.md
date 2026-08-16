# Lesson 19: The Rule of Zero

**What you will build:** You will write classes that safely manage dynamically allocated heap memory and handle copying without writing a single line of memory-management code. This proves that you do not need to manually define destructors or copy operations when building robust data structures. The transferable problem this solves is maintenance burden: manually writing cleanup and copy logic for every class is tedious and error-prone, but by leaning on types that govern themselves, your classes become immune to memory leaks by default.

**What you need to know first:** Lesson 10 Operator Overloading, Lesson 17 Smart Pointers.

**Terms introduced in this lesson:**
- **The Rule of Zero** — a design principle in modern C++. *Why it exists:* to eliminate boilerplate memory management code by delegating cleanup and copying to types that already manage themselves.
- **Special Member Functions** — the destructor, copy constructor, and copy assignment operator. *Why it exists:* to define exactly what happens when an object goes out of scope or is duplicated, allowing custom memory handling when necessary.
- **Deleted Function** — a function explicitly marked by the compiler (or programmer) as forbidden to call. *Why it exists:* to prevent invalid operations, such as attempting to copy an object that owns a strictly unique resource.

**Objects and methods used:**
- **std::make_unique**
  - *What it is:* A standard library template function that allocates memory on the heap and wraps it in a `std::unique_ptr`.
  - *Implementation:* `template< class T, class... Args > std::unique_ptr<T> make_unique( Args&&... args );`
  - *Its use:* We use it to safely create a dynamically allocated object that will automatically clean itself up, proving our parent class doesn't need a custom destructor.
- **Everything else in the file, not this lesson's subject but still explained:**
  - **std::unique_ptr**
    - *What it is:* A smart pointer that claims exclusive ownership of heap memory.
    - *Implementation:* Given full treatment in Lesson 17.
    - *Its use:* We use it to demonstrate how placing a self-managing resource inside a class automatically dictates how the parent class can be destroyed or copied.
  - **std::vector**
    - *What it is:* A dynamically resizing array.
    - *Implementation:* Given full treatment in an earlier lesson.
    - *Its use:* We use it to hold data that copies correctly by default, proving that the parent class can safely copy itself without custom logic.

---

## Concept Unit: The Compiler-Generated Destructor

### The Problem
If a class holds a dynamically allocated resource (like an open network connection or a chunk of heap memory), that resource must be destroyed when the class dies, or you will cause a memory leak. Historically, C++ developers had to write a custom destructor (`~MyClass()`) for every class that owned a resource. You need a way to build a class that safely cleans up after itself without writing manual cleanup code.

### The New Code
```cpp
#include <iostream>
#include <memory>

class Connection {
public:
    Connection() { std::cout << "Connection opened\n"; }
    ~Connection() { std::cout << "Connection closed\n"; }
};

class Server {
public:
    std::unique_ptr<Connection> conn;
    
    Server() {
        conn = std::make_unique<Connection>();
    }
    // No ~Server() destructor written!
};

int main() {
    std::cout << "--- Starting scope ---\n";
    {
        Server srv;
    }
    std::cout << "--- Ended scope ---\n";
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a from-scratch addition because it is isolated throwaway code meant to prove memory safety.
```cpp
// ← new
class Server {
public:
    std::unique_ptr<Connection> conn;
    
    Server() {
        conn = std::make_unique<Connection>();
    }
};
```
This is the entirety of the `Server` class. It manages a heap-allocated `Connection`, but contains absolutely no destructor.

### Mechanical Walkthrough
- `~Connection() { ... }`: This is a custom destructor on the dummy `Connection` class, solely so we can see when it is destroyed.
- `std::unique_ptr<Connection> conn;`: `Server` holds a smart pointer to a `Connection`. 
- `conn = std::make_unique<Connection>();`: Inside the `Server` constructor, heap memory is allocated for a `Connection` and handed directly to the smart pointer.
- `Server srv;`: The `Server` object is created on the stack. Its constructor runs, opening the connection.
- `}` (end of scope): The `Server` object goes out of scope and is destroyed. Because we did not write a custom destructor, the compiler generates a default one. The default destructor automatically visits every field inside `Server` and calls that field's destructor. It visits `conn`, destroying the `std::unique_ptr`. The smart pointer's own destructor then frees the heap memory, printing "Connection closed".

### CS Lens
A compiler-generated destructor is an implicit recursive function. When an object dies, the compiler does not just vaporize its memory. It statically knows the type of every member variable, and automatically injects calls to each member's destructor in reverse order of declaration. Because `std::unique_ptr` already knows how to free heap memory, the parent class does not need to know anything about it.

### SE Lens
The engineering principle is the Single Responsibility Principle applied to memory. The alternative not chosen is storing a raw pointer (`Connection*`) and writing `~Server() { delete conn; }`. The tradeoff of the alternative is that the `Server` class now has two jobs: its actual networking logic, and managing raw heap memory. By using `std::unique_ptr`, we delegate memory management entirely to a type built specifically for it, leaving `Server` with zero memory-management code to maintain.

### Run It Yourself
1. Open a terminal and create `server.cpp`.
2. Replace all contents with the code above.
3. Compile with `g++ -std=c++17 server.cpp -o server`.
4. Run `./server`.
5. The exact expected output is:
```
--- Starting scope ---
Connection opened
Connection closed
--- Ended scope ---
```
Note that "Connection closed" prints before "Ended scope", proving the memory was freed automatically the exact moment `Server` died.

---

## Concept Unit: The Compiler-Generated Copy Constructor

### The Problem
If a class owns a unique resource (like an exclusive lock or a `unique_ptr`), it is physically dangerous to copy the class. If two objects think they exclusively own the exact same block of heap memory, they will both try to delete it when they die, crashing the program. You might think you must manually write code to forbid copying such a class.

### The New Code
Add this line to `main()`, right after `Server srv;`:
```cpp
Server srv2 = srv; // Try to copy the server
```

### The Updated Project
```cpp
int main() {
    std::cout << "--- Starting scope ---\n";
    {
        Server srv;
        Server srv2 = srv; // ← new
    }
    std::cout << "--- Ended scope ---\n";
    return 0;
}
```
We are attempting to duplicate the `Server` object, which inherently means duplicating its internal `unique_ptr`.

### Mechanical Walkthrough
- `Server srv2 = srv;`: This attempts to invoke the copy constructor of `Server`. Since we did not write one, the compiler attempts to generate a default copy constructor.
- The compiler inspects `Server`'s fields. It sees `std::unique_ptr<Connection> conn`.
- The compiler tries to figure out how to copy `conn`. However, `std::unique_ptr` explicitly forbids copying (it has a deleted copy constructor, as taught in Lesson 17).
- Because a required field cannot be copied, the compiler immediately gives up and implicitly marks `Server`'s own copy constructor as a **deleted function**.

### CS Lens
The compiler propagates constraints bottom-up. A class is only as copyable as its least-copyable member. If a single field cannot be copied, the entire class becomes uncopyable by default. This mathematically guarantees that a class composed of unique resources cannot accidentally violate that uniqueness.

### SE Lens
The engineering principle is "Make invalid states unrepresentable." The alternative not chosen is writing a custom copy constructor that throws a runtime error, or explicitly writing `Server(const Server&) = delete;`. The tradeoff of the alternative is manual labor and the risk of forgetting to update it. By doing absolutely nothing, the compiler automatically prevents the bug at compile time.

### Run It Yourself
1. Add `Server srv2 = srv;` to your `main()` block.
2. Run `g++ -std=c++17 server.cpp -o server`.
3. You will not get a running program. You will get a massive compiler error containing:
```
use of deleted function 'Server::Server(const Server&)'
```
4. Delete the line `Server srv2 = srv;` so the program compiles again. The throwaway code is successfully discarded.

---

## Concept Unit: Composing Value Types

### The Problem
Sometimes you *do* want a class to be freely copied. If you are building a data transfer object, like a network packet containing a string of data and a list of timestamps, you want to be able to duplicate it easily. You might think you have to write a custom copy constructor to manually duplicate the string and the array piece by piece.

### The New Code
```cpp
#include <iostream>
#include <string>
#include <vector>

class Packet {
public:
    std::string data;
    std::vector<int> timestamps;
    // No copy constructor written!
};

int main() {
    Packet p1;
    p1.data = "Hello";
    p1.timestamps.push_back(100);

    Packet p2 = p1; // Copy it
    p2.data = "World";
    
    std::cout << "p1 data: " << p1.data << "\n";
    std::cout << "p2 data: " << p2.data << "\n";
    
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a standalone example proving that rich value types copy themselves safely.
```cpp
// ← new
class Packet {
public:
    std::string data;
    std::vector<int> timestamps;
};
```
The `Packet` class consists of a `std::string` and a `std::vector`, and contains absolutely no custom constructors or destructors.

### Mechanical Walkthrough
- `std::string data;`: `std::string` is a standard library class that internally manages a dynamic character array.
- `std::vector<int> timestamps;`: `std::vector` is a standard library class that internally manages a dynamically resizing array of integers.
- `Packet p2 = p1;`: This invokes the default compiler-generated copy constructor for `Packet`.
- The compiler-generated copy constructor automatically invokes the copy constructor of `data`, causing `std::string` to allocate a fresh buffer and copy its characters over.
- It then invokes the copy constructor of `timestamps`, causing `std::vector` to allocate fresh memory and copy the integers over.
- `p2.data = "World";`: We modify the copy. Because the default copy was a deep copy (driven by `std::string`'s own correct copy logic), `p1.data` remains untouched.

### CS Lens
This is recursive composition. A compound data type's behavior is exactly the sum of its parts' behaviors. `std::string` and `std::vector` are value types — they enforce deep-copy semantics. When you build a new class solely out of value types, your new class automatically inherits deep-copy semantics for free.

### SE Lens
The engineering principle is the Rule of Zero. The historical "Rule of Three" stated that if you write a custom destructor, copy constructor, or copy assignment operator, you probably need to write all three. The modern Rule of Zero states: if your class deals with resources, do not manage them directly using raw pointers. Instead, wrap them in self-managing types (`unique_ptr`, `string`, `vector`). Then, write exactly zero special member functions. Your code will be shorter, simpler, and mathematically immune to memory leaks.

### Run It Yourself
1. Open a terminal and create `packet.cpp`.
2. Replace all contents with the code above.
3. Compile with `g++ -std=c++17 packet.cpp -o packet`.
4. Run `./packet`.
5. The exact expected output is:
```
p1 data: Hello
p2 data: World
```
Notice that modifying `p2` did not corrupt `p1`, proving the compiler performed a perfect deep copy without any custom code.

---

## Connect the Pieces
Consider the journey of heap memory in a Rule of Zero class. When `Server` is instantiated, it calls `make_unique`. Memory is allocated on the heap and bound to the `unique_ptr`. The `Server` class itself is oblivious; it simply holds a field. When you try to copy the `Server`, the compiler asks the `unique_ptr` to copy itself, fails, and rejects your code at compile time, saving you from a runtime crash. When the `Server` finally goes out of scope, the compiler automatically invokes the `unique_ptr`'s destructor, which safely frees the heap memory. 

## What Breaks Without This
If you violate the Rule of Zero by using a raw pointer and forgetting the destructor, the compiler will not warn you. 

Change `Server` to use a raw pointer instead of a smart pointer:
```cpp
class Server {
public:
    Connection* conn;
    
    Server() {
        conn = new Connection();
    }
};
```
If you compile and run this, "Connection closed" will never print. The heap memory is leaked permanently because the compiler-generated destructor for a raw pointer does nothing. The Rule of Zero prevents this by forcing the use of self-cleaning types.

## Exercises
1. Add a `std::shared_ptr<Connection>` to a new class. See if the compiler allows you to copy the class. (Hint: `std::shared_ptr` is copyable, so the parent class will be copyable too).
2. Attempt to write a custom empty destructor `~Server() {}` in the original `unique_ptr` version of `Server`. Observe that it still compiles and cleans up, but is now violating the Rule of Zero (because you wrote unnecessary boilerplate).
3. Create a class `Config` containing only `int port;` and `std::string host;`. Instantiate one, copy it, and prove that the copy is independent of the original.

## Definition of Done
- You can rely on the compiler to generate safe default destructors and copy constructors.
- You understand how `std::unique_ptr` prevents a parent class from being copied.
- You understand how composing value types like `std::string` gives your classes deep-copy behavior for free.
- You can explain the Rule of Zero out loud, in your own words, to someone who hasn't read this lesson.
