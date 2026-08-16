# Lesson 08: RAII

**What you will build:** You will build isolated classes that manage their own memory lifecycle automatically. This proves that you can tie the lifespan of a resource directly to the lifespan of a local object, making leaks structurally impossible. The transferable problem this solves is resource management: instead of relying on the programmer to manually free memory or close files on every possible exit path, the language's own deterministic destruction rules do the cleanup for you.

**What you need to know first:** Lesson 07 Constructors and Destructors.

**Terms introduced in this lesson:**
- **RAII (Resource Acquisition Is Initialization)** — a design pattern where a resource is tied to the lifespan of an object. *Why it exists:* to guarantee that resources are cleaned up safely and automatically, even if a function exits early or fails.
- **Resource** — anything the program asks the operating system for that must eventually be returned. *Why it exists:* to hold data, access files, or communicate over networks, which are strictly limited system commodities.
- **Memory Leak** — a bug where a program loses track of a resource without releasing it. *Why it exists:* because a programmer acquired a resource but a function returned or crashed before the code to release it could run.

**Objects and methods used:**
- **new**
  - *What it is:* A C++ keyword that requests memory from the operating system's heap.
  - *Implementation:* Returns a memory address pointing to the newly allocated block.
  - *Its use:* We use it to acquire a raw resource that requires manual management.
- **delete[]**
  - *What it is:* A C++ keyword that returns an array of heap memory back to the operating system.
  - *Implementation:* Destroys the objects and frees the underlying block of memory.
  - *Its use:* We use it inside our destructor to safely clean up the memory acquired by `new`.
- **Everything else in the file, not this lesson's subject but still explained:**
  - **std::cout / std::endl**
    - *What it is:* The standard character output stream and newline manipulator.
    - *Implementation:* Defined in `<iostream>`.
    - *Its use:* We use it to print diagnostic messages proving exactly when our resource is acquired and released.

---

## Concept Unit: The Vulnerability of Manual Cleanup

### The Problem
When you ask the operating system for memory using a raw pointer, you are taking on a manual contract: you must explicitly give that memory back when you are done. If you write the cleanup code at the very bottom of your function, it seems safe. But if an error check causes the function to return early before reaching that bottom line, the cleanup code is skipped. The memory is permanently lost, causing a memory leak.

### The New Code
```cpp
#include <iostream>

void process_data(bool should_fail) {
    int* raw_buffer = new int[100];
    std::cout << "Memory acquired." << std::endl;

    if (should_fail) {
        std::cout << "Error encountered, returning early!" << std::endl;
        return; 
    }

    std::cout << "Processing finished normally." << std::endl;
    delete[] raw_buffer;
    std::cout << "Memory freed." << std::endl;
}

int main() {
    process_data(true);
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Includes the standard library feature for console output.
- `void process_data(bool should_fail)`: A function that takes a boolean flag to simulate a success or failure path.
- `int* raw_buffer = new int[100];`: The `new` keyword asks the operating system for a block of heap memory large enough to hold 100 integers, returning the memory address into the `raw_buffer` pointer.
- `std::cout << "Memory acquired." << std::endl;`: Prints a diagnostic message to the console to prove the resource was acquired.
- `if (should_fail) {`: Checks the simulation flag to determine if the function should abort its work.
- `std::cout << "Error encountered, returning early!" << std::endl;`: Prints a message indicating the failure path was taken.
- `return;`: Exits the function immediately. Because the function halts here, the computer jumps directly back to `main`.
- `std::cout << "Processing finished normally." << std::endl;`: This line is skipped due to the early return.
- `delete[] raw_buffer;`: The keyword that returns the array memory to the operating system. Because of the early return above, this line is never reached.
- `std::cout << "Memory freed." << std::endl;`: Proves that the memory was released. This is never printed.
- `int main() {`: The entry point of the program.
- `process_data(true);`: Calls our function, intentionally passing `true` to trigger the early return and cause the leak.
- `return 0;`: Ends the program.

### CS Lens
Manual resource management is an open-loop constraint. The program state transitions into "holding a resource", but there is no structural mechanism forcing it to transition back to "empty". Every possible path through the code flowchart must be manually audited to ensure it contains a cleanup command, which scales poorly as code complexity increases.

### SE Lens
The engineering principle is Determinism. The alternative chosen here is Manual Management. The tradeoff is that manual management gives the programmer ultimate control over exactly when a resource is freed, which can occasionally optimize performance in critical loops. The maintenance cost is catastrophic: in a real codebase with hundreds of branches and exceptions, guaranteeing that every single exit path correctly frees every resource is impossible for human reviewers, leading inevitably to resource exhaustion crashes.

### Run It Yourself
1. Open a terminal and create a file named `manual.cpp`.
2. Paste the code above into the file.
3. Compile it with `g++ -std=c++17 manual.cpp -o manual`.
4. Run `./manual` (or `manual.exe` on Windows).
5. The exact expected output is:
Memory acquired.
Error encountered, returning early!

*(Note that "Memory freed." never prints. The memory is leaked.)*

---

## Concept Unit: Wrapping the Resource in an Object

### The Problem
You cannot rely on remembering to put a `delete` call on every possible exit path. Instead, you need a mechanism that fires automatically when the function ends, no matter *how* it ends. C++ guarantees that when a local object goes out of scope (when the function ends), its destructor is called deterministically. If you put the cleanup code inside a destructor, the compiler itself will ensure the resource is freed.

### The New Code
```cpp
#include <iostream>

class IntBuffer {
private:
    int* data;

public:
    IntBuffer() {
        data = new int[100];
        std::cout << "RAII: Memory acquired in constructor." << std::endl;
    }

    ~IntBuffer() {
        delete[] data;
        std::cout << "RAII: Memory freed in destructor." << std::endl;
    }
};

void process_data_safely(bool should_fail) {
    IntBuffer buffer;

    if (should_fail) {
        std::cout << "Error encountered, returning early!" << std::endl;
        return; 
    }

    std::cout << "Processing finished normally." << std::endl;
}

int main() {
    process_data_safely(true);
    return 0;
}
```

### Mechanical Walkthrough
- `class IntBuffer {`: Defines a new custom data type designed exclusively to manage one specific resource.
- `private:`: An access modifier ensuring that internal data cannot be touched by outside code.
- `int* data;`: The raw pointer is hidden inside the class. The outside world cannot touch it, ensuring no one else can accidentally delete it early or lose the reference.
- `public:`: An access modifier exposing the constructor and destructor to the outside world.
- `IntBuffer() {`: The constructor. It automatically runs the moment an `IntBuffer` object is created.
- `data = new int[100];`: The actual resource acquisition happens here, safely inside the initialization phase.
- `std::cout << "RAII: Memory acquired in constructor." << std::endl;`: Proves the constructor ran.
- `~IntBuffer() {`: The destructor. C++ guarantees this will run exactly once when the object's lifetime ends.
- `delete[] data;`: The cleanup code is written exactly once, permanently bonded to the destructor. 
- `std::cout << "RAII: Memory freed in destructor." << std::endl;`: Proves the destructor ran.
- `void process_data_safely(bool should_fail) {`: A function simulating the same risk of an early return.
- `IntBuffer buffer;`: Inside the function, we create the object as a local stack variable. The constructor runs immediately, acquiring the memory.
- `if (should_fail) {`: Checks if we should abort.
- `std::cout << "Error encountered, returning early!" << std::endl;`: Prints our failure message.
- `return;`: The early exit path. Even though we are abruptly leaving the function, C++ intercepts the return, notices that `buffer` is about to be destroyed, and automatically invokes `~IntBuffer()`.

### CS Lens
This is the **Resource Acquisition Is Initialization (RAII)** pattern. By binding a dynamic, heap-allocated resource (the array) to a deterministic, stack-allocated object (the `IntBuffer` instance), we map the unpredictable runtime lifespan of the resource to the strictly predictable, compiler-enforced lexical scope of the object. 
Also recognized in: mutex locks (locking in constructor, unlocking in destructor), file handles, network sockets, and database transactions.

### SE Lens
The engineering principle is Invariant Enforcement. The alternative not chosen is using a `finally` block, which languages like Java and C# use to guarantee cleanup code runs. The tradeoff of a `finally` block is that the cleanup logic is decoupled from the resource itself; the caller must remember to write the `finally` block every single time they use the resource. By using RAII, the class author writes the cleanup logic once, and the compiler forces it upon every caller automatically. The safety is built into the type itself.

### Run It Yourself
1. Open a terminal and create a file named `raii.cpp`.
2. Paste the code above into the file.
3. Compile it with `g++ -std=c++17 raii.cpp -o raii`.
4. Run `./raii` (or `raii.exe` on Windows).
5. The exact expected output is:
RAII: Memory acquired in constructor.
Error encountered, returning early!
RAII: Memory freed in destructor.

---

## Connect the Pieces
Consider the flow of the memory resource. The `process_data_safely` function starts by declaring an `IntBuffer`. The compiler immediately calls the `IntBuffer` constructor, which executes the `new int[100]` command, successfully acquiring the memory. The function then encounters an early `return` statement. Before the CPU is allowed to jump back to `main`, the C++ compiler injects a hidden call to the `~IntBuffer` destructor. The destructor executes `delete[] data`, returning the memory to the operating system. Only then does the function actually return. The resource was acquired, used, and cleaned up safely, with zero manual management at the call site.

## What Breaks Without This
If we try to bypass RAII and return to manual pointers, we risk silent leaks.

Change the `~IntBuffer()` destructor in the final code example by commenting out the delete line:
```cpp
    ~IntBuffer() {
        // delete[] data;
        std::cout << "RAII: Memory freed in destructor." << std::endl;
    }
```

When you attempt to run this, the program will still compile and run perfectly, and the output will look identical. However, the memory is now permanently leaked, because the actual `delete` command was removed. The program is silently broken. 

To fix this, uncomment the `delete[] data;` line. The destructor must actually perform the cleanup.

## Exercises
1. Modify the `process_data_safely` function to call `process_data_safely(false)` from `main`. Observe the output to prove that the destructor still runs correctly even when the function finishes normally.
2. Add a second `IntBuffer` object to the function (`IntBuffer buffer2;`). Observe the output to see the order in which the destructors are called (they are destroyed in reverse order of creation).
3. Create a new class called `FileHandler` that simulates opening a file in the constructor (print "File opened") and closing it in the destructor (print "File closed"). Use it inside a function to prove RAII works for concepts other than memory.

## Definition of Done
- You can identify a manual resource leak caused by an early return.
- You can write a class that acquires a resource in its constructor.
- You can write a class that releases a resource in its destructor.
- You understand how stack scoping guarantees the destructor will run.
- You can explain RAII out loud, in your own words, to someone who hasn't read this lesson.
