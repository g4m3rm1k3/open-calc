# Lesson 08: Deque

**What you will build:** You will build a custom chunked-array architecture to understand how memory can grow in two directions at once. Then, you will use the C++ Standard Library's `std::deque` to implement a priority task queue. The transferable problem this solves is escaping the O(N) performance trap of shifting elements in a single array when you need to insert data at the front of a collection.

**What you need to know first:** C++ From Scratch (Lessons 01-35) and DSA Lesson 07.

**Terms used in this lesson:**
- **Deque (Double-Ended Queue)** — A sequence container that allows insertions and deletions at both its beginning and its end. *Why it exists:* To combine the fast two-way growth of a linked list with the CPU cache locality of an array.
- **Chunked Array** — A memory architecture made of an array of pointers (the map) pointing to separate fixed-size arrays (the chunks). *Why it exists:* To allow a collection to grow endlessly by allocating new, disconnected chunks, without ever copying the existing data to a new location.
- **Cache Locality** — The hardware phenomenon where data stored tightly together in memory is read exponentially faster by the CPU. *Why it exists:* CPUs pull memory in large contiguous blocks; reading a raw array benefits from this, whereas traversing scattered heap allocations defeats it.
- **O(1) Time Complexity** — An operation that takes a constant amount of time to execute, regardless of how many items are in the collection. *Why it exists:* To prove that a container's insertion speed will not degrade as the collection scales to millions of elements.
- **O(N) Time Complexity** — An operation whose execution time grows linearly with the number of items. *Why it exists:* To quantify the performance penalty of operations like shifting a vector, which must touch every element.

**Objects and methods used:**
- **`std::deque<T>` / `push_front`**
  - *What it is:* The standard library's double-ended queue front insertion method.
  - *Implementation:* `void push_front(const T& value);`
  - *Its use:* To insert a value at the absolute beginning of the collection in O(1) time without shifting other elements.
- **`std::deque<T>` / `push_back`**
  - *What it is:* The back-insertion method for a double-ended queue.
  - *Implementation:* `void push_back(const T& value);`
  - *Its use:* To insert a value at the end of the collection, smoothly allocating a new chunk behind the scenes if the final chunk is full.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::string`**
  - *What it is:* The standard library class representing a sequence of characters.
  - *Implementation:* `class basic_string;`
  - *Its use:* To hold and print human-readable text messages.
- **`std::cout` / `<<`**
  - *What it is:* The standard character output stream and the insertion operator.
  - *Implementation:* `extern ostream cout;`
  - *Its use:* To print the contents of our collections to the terminal.

---

## Concept Unit: The Chunked Map Architecture

### The Problem
A single contiguous array (`std::vector`) must copy and shift every single existing element if you insert a new value at the front (an O(N) penalty). A linked list (`std::list`) avoids shifting entirely, but requires a separate heap allocation for every individual element, scattering memory and ruining the CPU's ability to read memory quickly via cache locality. We need a data structure that provides O(1) front insertion without surrendering contiguous memory blocks.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the internal engine of the standard library.
- **Files affected:** Created `ChunkDeque.h`.
- **Change type:** Add.
- **Location:** A brand new file.
- **Dependencies:** None.

### The New Code
```cpp
class ChunkDeque {
    int** map;
    int front_chunk = 1;
    int front_idx = 2;
    int back_chunk = 1;
    int back_idx = 1;

public:
    ChunkDeque() {
        map = new int*[3];
        for (int i = 0; i < 3; i++) {
            map[i] = new int[4];
        }
    }

    void push_front(int val) {
        front_idx--;
        if (front_idx < 0) {
            front_chunk--;
            front_idx = 3;
        }
        map[front_chunk][front_idx] = val;
    }

    void push_back(int val) {
        back_idx++;
        if (back_idx > 3) {
            back_chunk++;
            back_idx = 0;
        }
        map[back_chunk][back_idx] = val;
    }
};
```

### The Updated Project
Because `ChunkDeque.h` is a brand-new file, the code above represents the entire structure. It encapsulates the map arrays and tracking integers needed to provide double-ended growth.

### Isolate the Concept
```cpp
// Isolation of a chunked map
int* chunk_a = new int[4];
int* chunk_b = new int[4];
int** map = new int*[2] {chunk_a, chunk_b};

// Insert at the end of the first chunk
map[0][3] = 42;
// Insert at the beginning of the second chunk
map[1][0] = 99;

std::cout << map[0][3] << " -> " << map[1][0] << "\n";
// Output: 42 -> 99
```
This is called a **chunked map**. It proves that two disconnected, separate arrays in memory can be treated as an unbroken sequence simply by jumping pointers in an outer management array.

### Discard the Throwaway Example
We have verified the map math. Delete the isolated snippet; it will not appear in our codebase again.

### Mechanical Walkthrough
- `class ChunkDeque`: Declares a blueprint for a custom object. This encapsulates the data and methods needed for our double-ended queue.
- `int** map;`: A pointer to a pointer. Here, it represents a dynamic array that holds pointers to other arrays (the chunks).
- `int front_chunk = 1;` and `int front_idx = 2;`: Integer fields. They track the exact chunk and the exact index within that chunk where the *next* front element should be placed. We start in the middle chunk to allow space behind us.
- `int back_chunk = 1;` and `int back_idx = 1;`: Integer fields tracking where the *next* back element goes.
- `public:`: An access modifier. It exposes the constructor and insertion methods so code outside the class can call them.
- `ChunkDeque()`: The constructor method. It runs automatically when an instance of this class is created, setting up the initial memory.
- `map = new int*[3];`: Allocates an array of three integer pointers on the heap, assigning the starting address to `map`.
- `for (int i = 0; i < 3; i++)`: A loop that runs three times, incrementing `i` from `0` to `2`.
- `map[i] = new int[4];`: Allocates a contiguous chunk of four integers on the heap and stores its pointer in the map.
- `void push_front(int val)`: A method that takes a single integer to insert at the beginning of the deque. `void` means it returns nothing.
- `front_idx--;`: The decrement operator. Memory addresses generally grow up, but the front of a deque grows backwards. This shifts our target slot one step to the left.
- `if (front_idx < 0)`: A conditional check. If the index drops below zero, we have entirely filled the current chunk.
- `front_chunk--;`: Moves our active chunk pointer backward to the previous chunk in the map.
- `front_idx = 3;`: Resets the index to the far right of the newly selected chunk.
- `map[front_chunk][front_idx] = val;`: The assignment. It jumps to the specific chunk in the map, then places the integer `val` into the precise slot we calculated.
- `void push_back(int val)`: A method to insert at the absolute end.
- `back_idx++;`: The increment operator. It shifts our target slot one step to the right.
- `if (back_idx > 3)`: Boundary check. If the index exceeds `3`, the current chunk is full.
- `back_chunk++;` and `back_idx = 0;`: Moves to the next chunk in the map and targets its very first slot.
- `map[back_chunk][back_idx] = val;`: Stores the value in the calculated back position.

Execution trace:
1. `ChunkDeque d;` — The constructor allocates `map` with 3 total chunks.
2. `d.push_front(10);` — `front_idx` decrements to 1. `map[1][1]` becomes 10.
3. `d.push_front(20);` — `front_idx` decrements to 0. `map[1][0]` becomes 20. The current chunk is now full at the front.
4. `d.push_front(30);` — `front_idx` drops to -1. The `if` branch runs, `front_chunk` drops to 0, and `front_idx` resets to 3. `map[0][3]` becomes 30, seamlessly moving to a brand new memory block without copying the previous elements.

### CS Lens
This embodies the **Deque** (Double-Ended Queue). A deque allows O(1) insertions at both ends. By using a **Chunked Array**, we get the best of both worlds: the chunks themselves provide the dense cache locality of vectors, while the map of pointers allows the container to grow indefinitely without an O(N) reallocation and copy of the element data.

### SE Lens
The alternative not chosen is the Circular Buffer. A circular buffer maps a flat array into a ring, allowing O(1) front insertions. The tradeoff is that when a circular buffer fills up entirely, you must allocate a larger array and copy every single element. A chunked array avoids the data copy; when it fills up, it only needs to reallocate the small pointer `map`, leaving the heavy data chunks exactly where they are.

### Commands Needed
No commands yet. This file is a header defining our class; we cannot run it standalone until we write a main program.

### Run It
(Deferred until the next unit wires a program together).

Connecting sentence: Writing boundary-checked chunk logic by hand is mathematically exhausting and error-prone, so we turn to the standard library's robust, heavily optimized version of the exact same architecture.

---

## Concept Unit: The Standard Library `std::deque`

### The Problem
Our `ChunkDeque` proves the concept, but expanding its `map` dynamically when all three chunks are exhausted requires writing complex pointer reassignment logic. Building a generic version that accepts any data type requires deep template wizardry. We need a ready-made, battle-tested implementation that handles all memory safety and dynamic resizing automatically.

### Project Change
- **Reference Source:** Standard library documentation.
- **Files affected:** Created `main.cpp`.
- **Change type:** Add.
- **Location:** A brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <deque>
#include <string>

int main() {
    std::deque<std::string> task_queue;
    
    task_queue.push_front("URGENT: Save data");
    task_queue.push_back("INFO: Update UI");
    task_queue.push_front("CRITICAL: Network disconnect");
    
    for (const std::string& task : task_queue) {
        std::cout << task << "\n";
    }
    
    return 0;
}
```

### The Updated Project
Because `main.cpp` is a brand-new file, the code above is the entirety of the runnable entry point. It imports the standard library's deque, populates it with a mix of front and back priorities, and iterates over them.

### Isolate the Concept
```cpp
#include <deque>
#include <iostream>

int main() {
    std::deque<int> d;
    d.push_front(1);
    d.push_back(2);
    std::cout << d.front() << ", " << d.back() << "\n";
    return 0;
}
// Output: 1, 2
```
This is a **`std::deque` instantiation**. It proves we can insert at both ends instantly and reliably without writing manual chunk boundaries or memory allocation math.

### Discard the Throwaway Example
We have verified the deque's basic API. Delete the snippet; it will not remain in our codebase.

### Mechanical Walkthrough
- `#include <iostream>`: Instructs the compiler to include the file defining input/output streams. Without this, `std::cout` is unrecognized.
- `#include <deque>`: Instructs the compiler to include the standard library's double-ended queue template.
- `#include <string>`: Brings in the definition for the `std::string` class, allowing text objects.
- `int main()`: The entry point function. The operating system calls this when the program starts.
- `std::deque<std::string> task_queue;`: Declares a local variable. The `<std::string>` template argument dictates this collection will strictly hold string objects. Under the hood, this sets up the chunked map architecture automatically.
- `task_queue.push_front("URGENT: Save data");`: Calls the front insertion method. It allocates memory in the front chunk and places the string at the absolute beginning in O(1) time.
- `task_queue.push_back("INFO: Update UI");`: Appends a string to the absolute end. If the back chunk is full, `std::deque` automatically handles allocating a newly attached chunk.
- `task_queue.push_front("CRITICAL: Network disconnect");`: Inserts another high-priority item at the front, pushing it ahead of the first urgent task without shifting any existing memory.
- `for (const std::string& task : task_queue)`: A range-based for loop. It asks the deque for its beginning and end iterators. The `const std::string&` ensures we take each element by reference—avoiding a slow copy—and promises we will not modify it.
- `std::cout << task << "\n";`: Pushes the string content to the console output, followed by a newline character.
- `return 0;`: Exits the program, signaling to the operating system that it completed successfully.

Execution trace:
1. `task_queue.push_front("URGENT: Save data")` — Deque allocates a chunk, placing "URGENT: Save data" as the only item.
2. `task_queue.push_back("INFO: Update UI")` — Places "INFO: Update UI" at the end, now sitting physically after the urgent task.
3. `task_queue.push_front("CRITICAL: Network disconnect")` — Inserts at the absolute front. Because this is a deque, it simply writes to the previous index in the map's chunk, requiring zero O(N) shifting of the two existing items.

### CS Lens
Also recognized in: job scheduling, work-stealing thread pools, browser history navigation, and undo/redo stacks. The defining trait is amortized O(1) insertion at both boundaries. Cache locality is excellent within a single chunk, but reading across chunk boundaries requires an occasional pointer jump through the map.

### SE Lens
The alternative not chosen is defaulting to `std::vector` for everything. The tradeoff is pointer indirection versus shifting. A `std::vector` stores everything in one single contiguous block, making iteration blazing fast and hardware-perfect, but `push_front` is O(N) because every element must shift right. You use `std::deque` only when your algorithm mandates heavy insertions or deletions at the front; otherwise, the cache perfection of `std::vector` makes it the superior default for almost all other C++ code.

### Commands Needed
To compile our newly written code, run:
`g++ -std=c++17 main.cpp -o queue_demo`

- `g++`: Invokes the GNU C++ compiler.
- `-std=c++17`: Instructs the compiler to strictly enforce the C++17 language standard.
- `main.cpp`: The source file we are compiling.
- `-o queue_demo`: Renames the default `a.out` output file to `queue_demo`.

### Run It
Run the compiled executable:
`./queue_demo`

Output:
```
CRITICAL: Network disconnect
URGENT: Save data
INFO: Update UI
```

Connecting sentence: You now have a working priority queue that performs perfectly regardless of how many items pile up inside it.

---

## Connect the Pieces
Start to finish: Our system needs to process an `INFO` task and a `CRITICAL` task. We push the info task to the back. A split-second later, the critical task fires. Instead of waiting in line or forcing the system to sluggishly shift the info task to make room, we push the critical task to the front of the `std::deque`. The deque merely steps its `front_idx` backwards inside its memory chunk, writing the critical task in O(1) time. The range-based loop reads the chunks sequentially from front to back, pulling the critical task first.

## What Breaks Without This
If we forcibly bypass the chunk bounds, we corrupt memory.

Modify `ChunkDeque.h` to remove the boundary jump logic entirely:
```cpp
void push_front(int val) {
    front_idx--;
    // REMOVED: if (front_idx < 0) { ... }
    map[front_chunk][front_idx] = val;
}
```
**The result:**
If we push five items to the front, `front_idx` decrements to `-1`, then `-2`. We are now blindly writing data into unallocated heap memory just outside our chunk array, silently corrupting other variables or crashing the program with a **Segmentation Fault**. This is exactly why bounds-checking logic is mandatory.

## Exercises

1. **Back Pressure:** Write a program using `std::deque<int>` that acts as a rolling buffer. Use a loop to push integers 1 through 10 to the back, but whenever the deque size exceeds 5, immediately call `pop_front()` to discard the oldest element.
2. **Palindrome Checker:** Ask the user for a string. Load every character into a `std::deque<char>`. Write a loop that continuously compares and removes `front()` and `back()` to determine if the word is identical forwards and backwards.
3. **Inspect the Map:** In your `ChunkDeque`, add a `print_diagnostics()` method that literally prints the integer values of `front_chunk` and `front_idx` to the console so you can observe the pointers moving in real time.

## Definition of Done
- [ ] You have compiled and run a custom chunked array, pushing data into multiple blocks.
- [ ] You have compiled and run a standard library `std::deque`.
- [ ] You have triggered and observed O(1) front insertions without element shifting.
- [ ] You can explain out loud why a chunked array is preferable to a simple circular buffer.
- [ ] You have committed your code with a message explaining *why* the standard library handles the map boundaries instead of you.
