# Lesson 02: Memory - The Stack and the Heap

**What you will build:** A series of isolated console programs that allocate memory using different strategies, inspect physical memory addresses, and manually clean up resources. You will observe how the compiler automatically destroys local data, and how taking manual control requires you to take full responsibility for the data's lifecycle.

**What you need to know first:** Basic variable declaration and terminal output.

**Terms introduced in this lesson:**
- **Stack Memory** — a fast, strictly-ordered region of memory where local variables are allocated automatically and destroyed the moment they go out of scope. *Why it exists:* to provide high-speed, zero-maintenance storage for data whose lifespan is perfectly tied to the block of code that created it.
- **Heap Memory** — a large, unordered region of memory where data must be requested manually and persists until explicitly destroyed. *Why it exists:* to store data that must outlive the function that created it, or data whose size is not known until the program is running.
- **Scope** — the region of code (usually bounded by `{ }`) where a variable's name is valid. *Why it exists:* to limit where data can be accessed, preventing unintended modifications and telling the compiler exactly when automatic memory can be safely reclaimed.
- **Pointer (`*`)** — a variable that stores the physical memory address of another piece of data, rather than the data itself. *Why it exists:* to allow multiple parts of a program to observe and modify the exact same memory location without copying it, and to keep track of nameless data allocated on the heap.
- **Address-of Operator (`&`)** — an operator that retrieves the memory address of an existing variable. *Why it exists:* to find exactly where the computer placed a stack variable so you can point to it.
- **`new`** — an operator that requests a block of memory on the heap. *Why it exists:* to bypass the automatic destruction rules of the stack.
- **`delete`** — an operator that returns heap memory back to the operating system. *Why it exists:* because the heap has no automatic cleanup; without this, memory remains locked until the program crashes or ends.
- **Memory Leak** — a condition where heap memory is allocated but never deleted. *Why it exists as a concept:* it is the primary failure state of manual memory management, causing a program to slowly consume all available system RAM.

**Objects and methods used:**
- **`std::cout`**
  - *What it is:* The standard character output stream object.
  - *Implementation:* An instance of `std::ostream` defined in the `<iostream>` header.
  - *Its use:* To print values and memory addresses to the terminal, making the invisible behavior of memory physical and inspectable.

---

## Concept Unit: The Stack and Scope

### The Problem
A program needs memory to do basic work, but it also needs to clean up after itself automatically so the computer doesn't run out of space. If every temporary calculation permanently consumed RAM, the system would quickly halt. The language needs a mechanism to tie the lifespan of data directly to the code actively using it.

### The New Code
```cpp
#include <iostream>

int main() {
    int total = 100;
    
    {
        int temporary = 50;
        std::cout << "Inside block: " << temporary << "\n";
    }
    
    // std::cout << temporary; // The compiler would reject this.
    std::cout << "Outside block: " << total << "\n";
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a from-scratch addition because we are proving the fundamental rules of the language itself, independent of any specific architecture.
The code above represents the complete `main.cpp` file. The inner `{ ... }` block represents a limited scope within the main execution path.

### Mechanical Walkthrough
- `#include <iostream>` tells the compiler to copy the declarations for standard input/output into this file. Without this, `std::cout` is an unrecognized name.
- `int total = 100;` allocates 4 bytes of memory on the stack for an integer. Because it is declared immediately inside `main`, its scope lasts until `main` finishes.
- `{` begins a new, nested scope.
- `int temporary = 50;` allocates another 4 bytes on the stack. This variable belongs exclusively to the nested scope it was created in.
- `std::cout << ...` prints the value to the terminal.
- `}` ends the nested scope. The exact moment execution passes this brace, the compiler automatically destroys `temporary` and reclaims its memory. The data is gone.
- `std::cout << "Outside block: " << total << "\n";` prints the outer variable, which is still alive because its scope (the `main` function) has not yet closed.

### CS Lens
This embodies Automatic Memory Management via a Call Stack. Variables are pushed onto a literal stack data structure as they are declared, and popped off in reverse order when their scope ends. This requires zero overhead during runtime because the compiler calculates exactly how much memory to allocate and destroy ahead of time.

### SE Lens
The engineering principle is localized state. By tightly restricting how long a variable lives, you reduce the mental burden of tracking it. The tradeoff C++ enforces here is strictness: if you need a value to survive past the `}`, you cannot simply leave it on the stack. You must either copy it outward, or use a completely different kind of memory.

### Run It Yourself
1. Open a terminal and create a new file named `stack.cpp`.
2. Paste the code above into the file.
3. Compile it: `g++ -std=c++17 stack.cpp -o stack_demo`
4. Run it: `./stack_demo` (or `.\stack_demo.exe` on Windows).
5. Expected output:
   ```
   Inside block: 50
   Outside block: 100
   ```

### Discard the throwaway example
This file proves how scope destroys variables. It will not be used in the final project.

---

## Concept Unit: Pointers and Memory Addresses

### The Problem
To manage memory manually, or to share data efficiently without constantly copying it, the program must be able to refer to the exact physical location of data in RAM, rather than just interacting with the variable's name. We need a way to look at and store memory addresses directly.

### The New Code
```cpp
#include <iostream>

int main() {
    int score = 42;
    int* addressOfScore = &score;
    
    std::cout << "Value: " << score << "\n";
    std::cout << "Address: " << addressOfScore << "\n";
    std::cout << "Value via address: " << *addressOfScore << "\n";
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a from-scratch addition. The code above is a complete, isolated `main.cpp` file demonstrating memory introspection.

### Mechanical Walkthrough
- `int score = 42;` allocates an integer on the stack.
- `int* addressOfScore` declares a completely new variable. The `*` as part of the type declaration means "pointer to an integer". It does not hold a normal number; it is specifically designed to hold a memory address.
- `= &score;` uses the address-of operator (`&`). Instead of reading the value `42`, this calculates the physical hexadecimal location in the computer's RAM where `score` is stored, and assigns that location to the pointer.
- `std::cout << "Address: " << addressOfScore << "\n";` prints the pointer itself. Because the pointer holds an address, this will output something like `0x7ffee2b5c8ac`.
- `*addressOfScore` uses the `*` symbol in a completely different context: as the dereference operator. When placed in front of an existing pointer variable, it means "go to the address stored here, and interact with the data at that location." It traverses the pointer to retrieve `42`.

### CS Lens
This embodies Indirection. You are no longer manipulating a value directly; you are manipulating a coordinate that leads to the value. This is the foundational mechanic of almost all complex data structures (trees, graphs, linked lists) where discrete blocks of memory must link to one another.

### SE Lens
The engineering tradeoff of exposing raw pointers is immense power at the cost of immense danger. Languages like Java and Python use references under the hood but hide the actual memory addresses from the developer to ensure safety. C++ hands you the raw coordinates, which allows you to interact directly with hardware or optimize memory layouts perfectly, but gives you the ability to easily corrupt your own program if you point at the wrong address.

### Run It Yourself
1. Create a file named `pointer.cpp`.
2. Paste the code above.
3. Compile it: `g++ -std=c++17 pointer.cpp -o pointer_demo`
4. Run it.
5. Expected output (the hexadecimal address will vary every time you run it, as the OS assigns memory dynamically):
   ```
   Value: 42
   Address: 0x16d9bb318
   Value via address: 42
   ```

### Discard the throwaway example
This isolated proof of pointers is discarded.

---

## Concept Unit: The Heap and Manual Allocation

### The Problem
Stack memory is rigid: it is destroyed the exact moment its scope ends. If a function needs to create data (like a loaded texture, a network connection, or a user profile) that survives long after the function finishes, it cannot use the stack. It needs a distinct region of memory governed by manual rules, not automatic scope.

### The New Code
```cpp
#include <iostream>

int main() {
    int* persistentData = new int(99);
    
    std::cout << "Heap value: " << *persistentData << "\n";
    std::cout << "Heap address: " << persistentData << "\n";
    
    delete persistentData;
    
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a from-scratch addition. This represents the full file.

### Mechanical Walkthrough
- `new int(99)` requests exactly enough memory from the operating system's heap to hold one integer, and initializes it with the value `99`. 
- `int* persistentData = ...` stores the result of `new`. The `new` operator never returns a name or a normal variable; it only returns the physical memory address of the newly claimed space. Therefore, heap memory can *only* be accessed via pointers.
- `std::cout << ...` dereferences the pointer to print the value, proving the data exists.
- `delete persistentData;` tells the operating system, "I am completely done with the memory located at this address; you may give it to another program." This specifically destroys the data on the heap, but it does *not* destroy the `persistentData` pointer variable itself (which is just a local stack variable holding a coordinate).

### CS Lens
This embodies Dynamic Memory Allocation. The heap is an unstructured pool of memory. Allocating from it is significantly slower than stack allocation because the operating system must search for a continuous block of free space, mark it as taken, and return the address. 

### SE Lens
The tradeoff here is persistent lifespan versus manual responsibility. By using `new`, you opt out of the compiler's safety net. The compiler will no longer clean this up when the function ends. If you write `new`, you are entering into a strict contract to write `delete` exactly once for that exact address.

### Run It Yourself
1. Create `heap.cpp`.
2. Paste the code above.
3. Compile and run it.
4. Expected output:
   ```
   Heap value: 99
   Heap address: 0x600003e64030
   ```

### Discard the throwaway example
The heap proof is deleted.

---

## Connect the Pieces

Observe how the stack and the heap interact entirely through pointers. When you write `int* data = new int(5);`, you are actually using both types of memory simultaneously:
1. `new int(5)` creates the number 5 on the **heap**.
2. `data` is a pointer variable created on the **stack**, which merely holds the address.
When the scope ends, the stack destroys the `data` pointer automatically. However, the stack *cannot* destroy the heap memory it pointed to. If you haven't called `delete` before the pointer is destroyed, the memory address is lost forever, but the memory itself remains locked by the operating system.

## What Breaks Without This

Without strict attention to `delete`, manual memory management causes a **Memory Leak**. Let's force one to happen.

Create a loop that constantly allocates heap memory but never deletes it.
```cpp
#include <iostream>

int main() {
    while (true) {
        // Allocate an array of 10 million integers on the heap over and over
        int* leak = new int[10000000]; 
        std::cout << "Leaked memory at: " << leak << "\n";
    }
    return 0;
}
```

If you compile and run this, it will run for several seconds, printing addresses rapidly. Then, the program will crash violently. The operating system will physically terminate the process because it requested all available system RAM without giving any back.

**The error:**
`std::bad_alloc` (or an outright process termination by the OS).

The compiler cannot catch this. The syntax is perfectly valid. The failure occurs at runtime because managing the heap is purely a logical responsibility placed entirely on the programmer.

## Exercises

1. Write a function that creates a stack variable and attempts to return a pointer to it (`return &myVar;`). Compile it. Observe the compiler warning you about returning the address of a local variable (because it is instantly destroyed when the function ends).
2. Modify the `heap.cpp` example to create the integer, print its address, but remove the `delete` statement. Compile and run it. Notice that it still runs perfectly fine. Memory leaks are invisible until the system runs out of memory.
3. Use `new` to allocate a `double` on the heap, assign it the value `3.14`, print it via dereferencing, and safely `delete` it.

## Definition of Done
- [ ] You have compiled and executed code demonstrating that stack variables are bound by scope.
- [ ] You have printed raw memory addresses using the `&` operator and pointers.
- [ ] You have manually allocated and destroyed data on the heap using `new` and `delete`.
- [ ] You have observed how a memory leak occurs when `new` is used without `delete`.
- [ ] You can explain the exact difference between the Stack and the Heap, and why C++ forces you to choose between them.
