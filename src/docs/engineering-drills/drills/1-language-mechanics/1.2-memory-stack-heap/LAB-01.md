# Drill 1.2 — C++: Memory — Stack vs Heap

**Standalone drill. No prerequisites. No series.**
**Time estimate:** 90–120 minutes
**What you will build:** A program that deliberately demonstrates stack overflow, memory leaks, dangling pointers, and double-free — then fixes each one
**What you will understand:** Where your variables actually live, what `new` and `delete` do, and why `unique_ptr` exists

---

## Quick Check

Read these questions now. Answer them yourself before starting.
You will find the answers in this lab — they reference specific code you will write.

1. You declare `int x = 5;` inside a function. When does the memory holding `x` get reclaimed? Who reclaims it?

2. You call a function that calls itself forever. Eventually the program crashes. What resource ran out, and approximately how much of it does a typical process get?

3. You write `int* p = new int(42);` and then the function returns. You never called `delete p`. What happens to the 4 bytes that were allocated? Who cleans them up?

4. `unique_ptr<int> p = make_unique<int>(42);` — when does this call `delete` on the int? How does it know when to do it?

*(Answers at the bottom of this lab, referenced to the exact code that proves each one.)*

---

## The Concept: Where Variables Live

### Concept: The Stack

**What it is:**
The stack is a region of memory with a fixed maximum size, managed automatically by the CPU and the operating system. Every time you call a function, the CPU pushes a "stack frame" onto the stack — a block of memory holding that function's local variables, parameters, and return address. When the function returns, the frame is popped. The memory is instantly available for reuse.

**The problem before:**
You declare variables in functions and they "just work." You never think about where they live. Then you try to return a pointer to a local variable and your program produces garbage. You don't know why.

**The solution:**
A concrete model: the stack is a fixed-size region (typically 1–8 MB per thread). Each function call carves out a chunk of it. When the function returns, that chunk is released. Local variables live in these chunks — they are valid only while their function is active.

**What it hides:**
The CPU has a dedicated register (the "stack pointer") that tracks the top of the stack. Entering a function is literally a subtraction on this register (the stack grows downward in memory on x86). Leaving is an addition. There is no garbage collector, no reference counting — just a register changing value.

**Canonical example (general):**
A stack of cafeteria trays. Each function call places a tray on top. The tray holds that function's variables. When the function returns, the tray is removed and returned to the pile. The next function gets that tray — possibly with old food still on it (uninitialized memory).

**Project application:**
In Step 1, you will allocate local variables and watch their addresses. In Step 2, you will overflow the stack by recursing infinitely and see the OS-level crash ("segmentation fault" or "stack overflow").

**Constraints:**
- Stack size is fixed at program startup — typically 1–8 MB per thread on Linux/macOS, 1 MB on Windows
- You cannot resize it at runtime (on most systems)
- Stack variables cannot outlive the function that created them
- Very fast: allocating stack memory is a single register decrement

**Failure modes:**
- Stack overflow: call stack grows beyond the limit (deep recursion, large local arrays)
- Returning a pointer to a local variable: the memory is "freed" when the function returns, but the pointer still points there — dangling pointer on the stack

**Operational reality:**
CAD kernels like OCCT (the Open CASCADE Technology kernel used by FreeCAD) process geometry through deep recursive algorithms — triangle subdivision, BSP tree traversal. Stack depth management is a real concern. Large geometric objects are allocated on the heap, passed by pointer.

**You will see this again in:**
Every discussion of recursion limits. Every "why can't I return a reference to a local variable" compiler warning. The reason callback-heavy code passes things by pointer — so they outlive the calling function's stack frame.

**Watch for:**
Compilers will often warn you when you return a reference or pointer to a local variable: `warning: returning reference to temporary`. Heed this warning — the program will appear to work sometimes (the stack memory hasn't been overwritten yet) and fail catastrophically other times.

---

### Concept: The Heap

**What it is:**
The heap is a large region of memory (limited only by available RAM) that you manage manually: you request allocations with `new` and release them with `delete`. The memory persists until you explicitly free it, regardless of which function allocated it.

**The problem before:**
You need a large array whose size you don't know until runtime. You can't declare `int arr[n]` on the stack with a runtime `n` (or it's a compiler extension, not standard). You need memory that outlives the function that created it. The stack can't do either.

**The solution:**
`new T` asks the OS for `sizeof(T)` bytes, runs T's constructor, and returns a pointer. The memory lives on the heap — it has no automatic lifetime. It exists until you call `delete`.

**What it hides:**
`new` calls `malloc` (or equivalent) which talks to the OS via a system call (`brk` or `mmap` on Linux). The OS returns a page of physical memory. `new` carves your allocation out of that page and tracks the free list. `delete` marks the memory as available for future allocations — it does not return memory to the OS immediately.

**Canonical example (general):**
Renting a storage unit. You pay for it, you get a key (pointer), the unit persists until you cancel the rental. If you lose the key (lose the pointer) the storage unit still exists and the rental fee keeps running — that is a memory leak. If you cancel but keep trying to use the unit — that is a dangling pointer.

**Project application:**
In Step 3, you allocate integers and arrays on the heap with `new`. You observe that the allocated memory persists even after the allocating function returns. In Step 4, you forget to `delete` and the address sanitizer shows the leak.

**Constraints:**
- You must call `delete` exactly once for every `new`
- You must call `delete[]` for arrays allocated with `new[]`
- Mixing `delete` with `new[]` or `delete[]` with `new` is undefined behavior
- The heap is slower than the stack — allocation involves bookkeeping

**Failure modes:**
- Memory leak: allocate, lose the pointer, never delete — memory consumed until process exits
- Dangling pointer: delete, then read/write through the old pointer — undefined behavior
- Double free: delete the same pointer twice — corrupts the heap's free list, crashes or worse
- Use-after-free: same as dangling pointer, different framing

**Operational reality:**
Real programs that process large geometric data (mesh files, point clouds, toolpath arrays) allocate most of their working data on the heap. A CAD importer that reads a 10GB mesh file allocates that data dynamically — you cannot put 10GB on the stack. The reason STL containers (`std::vector`, `std::string`) exist is to manage heap allocations safely.

**You will see this again in:**
`std::vector` — it wraps a heap-allocated array. `std::string` — same. Any class that manages resources (file handles, textures, network connections) uses heap allocation internally. Understanding the heap is understanding every resource-managing class you will ever use.

**Watch for:**
In a class, if you write a constructor that calls `new`, you must write a destructor that calls `delete`, a copy constructor, and a copy assignment operator. This is called "The Rule of Three" (or "Rule of Five" in modern C++). Missing any one of them creates leaks or double-frees. `unique_ptr` automates all of this.

---

### Concept: Memory Bugs — Leak, Dangling Pointer, Double Free

**What it is:**
The three classic heap memory bugs. Each one violates one of the constraints on `new`/`delete` pairs. Each one produces undefined behavior — meaning the C++ standard says anything can happen, including appearing to work correctly.

**The problem before:**
Memory bugs are invisible at the point they occur. A memory leak only causes problems when you run out of memory — possibly hours later. A dangling pointer might read valid-looking data (the old bytes haven't been overwritten yet) and crash later in a completely unrelated function.

**The solution:**
The address sanitizer (`-fsanitize=address`) makes these bugs visible at the exact moment they occur. It instruments every memory access and allocation, catching bugs the moment they happen instead of when their effects become visible.

**What it hides:**
"Undefined behavior" does not mean "crashes immediately." The C++ standard says the behavior is unspecified — compilers can assume it never happens and optimize accordingly. This makes UB bugs produce wrong results that look correct, intermittent crashes, and security vulnerabilities. The address sanitizer opts out of this by checking every access.

**Canonical example (general):**
- Memory leak: driving away from a gas station and leaving the pump running. The meter keeps running.
- Dangling pointer: using a hotel room key card for a room you checked out of. It might work (the hotel hasn't changed the lock yet) or might let you into someone else's room.
- Double free: returning a library book you already returned. The library's records are now corrupted.

**Project application:**
Steps 4 and 5 deliberately introduce each bug. The address sanitizer output shows the exact line of code where each bug occurred. You will see the difference between the moment of the bug and the moment it crashes.

**Constraints:**
The address sanitizer: compile with `-fsanitize=address -g`. The `-g` flag adds debug symbols so error messages show line numbers.

**Failure modes:**
These bugs are the failure modes. Each one is demonstrated in a dedicated step.

**Operational reality:**
The address sanitizer is standard practice in C++ development. You run your tests with it enabled. It has roughly 2x runtime overhead and 3x memory overhead — acceptable for a test run, not for production. Google, Mozilla, and every serious C++ shop runs address sanitizer in CI.

**You will see this again in:**
Valgrind (older alternative to address sanitizer). ThreadSanitizer (`-fsanitize=thread`) for race conditions. UndefinedBehaviorSanitizer (`-fsanitize=undefined`) for other UB. CAD and game engine development relies heavily on these tools.

**Watch for:**
Address sanitizer output always shows two locations: where the bad access happened, and where the memory was originally allocated (or freed). Read both. The allocation site is usually the real bug.

---

### Concept: `unique_ptr` — Automatic Memory Management

**What it is:**
`std::unique_ptr<T>` is a class that wraps a raw pointer and calls `delete` on it automatically when the `unique_ptr` itself goes out of scope. It is a "smart pointer" — it behaves like a pointer but manages the lifetime automatically.

**The problem before:**
Every `new` requires a matching `delete`. In a function with multiple return paths (early returns, exceptions), ensuring `delete` is always called is error-prone. One missed path = memory leak or dangling pointer.

**The solution:**
`unique_ptr` uses RAII (Resource Acquisition Is Initialization): acquire the resource in the constructor, release it in the destructor. Since destructors run automatically when an object goes out of scope (including during exceptions), the release is guaranteed.

**What it hides:**
`unique_ptr<T>` has zero runtime overhead compared to a raw pointer in release builds. The `delete` call is compiled in by the compiler, not looked up at runtime. The "smart" part is purely a compile-time construct.

**Canonical example (general):**
A hotel key card that automatically notifies the front desk and releases your room when you walk out the door — regardless of whether you intended to check out or were ejected.

**Project application:**
Step 6 rewrites the dangling pointer and memory leak examples using `unique_ptr`. The address sanitizer reports zero errors after the rewrite.

**Constraints:**
- `unique_ptr` cannot be copied — only moved. This enforces single ownership. (Use `shared_ptr` if multiple owners are needed, but shared ownership is often a design smell.)
- To pass a `unique_ptr`-managed resource to a function, pass the raw pointer (`p.get()`) if the function doesn't take ownership, or `std::move(p)` if it does.

**Failure modes:**
- Calling `.get()` and then deleting the raw pointer — the `unique_ptr` will call `delete` again on destruction: double free
- Creating a `unique_ptr` from a raw pointer that was already owned elsewhere: double free

**Operational reality:**
Modern C++ (C++14 and later) guidelines say: never use raw `new`/`delete` in application code. Use `make_unique<T>(...)` to create resources and `unique_ptr` to own them. Raw pointers are still used as non-owning observers (pointing at something owned elsewhere), but they never call `delete`.

**You will see this again in:**
`std::vector` (owns its heap array internally with equivalent logic). `std::shared_ptr` (reference-counted ownership). Any modern C++ codebase. OCCT and most modern geometry libraries use smart pointers throughout.

**Watch for:**
`std::make_unique<T>(args...)` is preferred over `new T(args)` — it avoids a case where exception safety can cause a leak when using `new` directly in function arguments. Always use `make_unique`.

---

## Step 1 — Stack Variables: Automatic, Scoped, Fast

**Goal:** See stack variables in action. Observe their addresses and understand scope-based lifetime.

Create a working directory:

```
1.2-memory-stack-heap/
    main.cpp
```

**`main.cpp`:**

```cpp
#include <iostream>   // For cout

// This function demonstrates stack allocation
// Every local variable inside lives on the stack
void show_stack() {
    int a = 10;        // Allocate 4 bytes on the stack, initialize to 10
    int b = 20;        // Allocate 4 bytes on the stack, initialize to 20
    double d = 3.14;   // Allocate 8 bytes on the stack, initialize to 3.14

    // Print the ADDRESS of each variable — where in memory it lives
    // Note: addresses are typically close together (all on the same stack frame)
    std::cout << "Address of a: " << &a << std::endl;  // & means "address of"
    std::cout << "Address of b: " << &b << std::endl;
    std::cout << "Address of d: " << &d << std::endl;

    // The distance between addresses shows how variables are laid out in the frame
    // On most x86-64 systems, a and b will be 4 bytes apart (sizeof(int) = 4)
    std::cout << "Distance a→b: " << (long)&a - (long)&b << " bytes" << std::endl;

}  // <-- When this function returns, the stack frame is popped.
   //     a, b, and d no longer exist. Their memory is available for the next call.

// This function demonstrates scope within a function
void show_scope() {
    int x = 100;   // x exists for the entire function

    {
        // This inner brace creates a new scope
        int y = 200;   // y exists only within this inner block
        std::cout << "Inside block: x=" << x << " y=" << y << std::endl;
    }   // <-- y's lifetime ends here. Its stack space is released.

    // y is now out of scope — the compiler will refuse to let you use it
    // std::cout << y;  // UNCOMMENT to see: "error: 'y' was not declared in this scope"
    std::cout << "Outside block: x=" << x << std::endl;
}

int main() {
    std::cout << "--- Stack layout ---" << std::endl;
    show_stack();

    std::cout << "\n--- Scope demo ---" << std::endl;
    show_scope();

    return 0;
}
```

**COMPILE AND RUN:**

```bash
g++ -std=c++17 -g main.cpp -o memory_demo
./memory_demo
```

**Exact expected output:**
```
--- Stack layout ---
Address of a: 0x7ffee4b3a8ac
Address of b: 0x7ffee4b3a8a8
Address of d: 0x7ffee4b3a8a0
Distance a→b: 4 bytes

--- Scope demo ---
Inside block: x=100 y=200
Outside block: x=100
```

(Addresses will differ on your machine — the exact values depend on the OS, ASLR, and current stack state. The relationship between them is what matters.)

**Terminal verification:**

```bash
# Stack addresses on Linux typically start with 0x7fff...
# Heap addresses on Linux typically start with 0x55... or lower
# Confirm your stack addresses match the 0x7fff... pattern
./memory_demo | grep "Address of"
```

**Change something — experiment:**

Uncomment the `std::cout << y;` line after the closing brace. Recompile:

```bash
g++ -std=c++17 -g main.cpp -o memory_demo
```

**Expected error:** `error: 'y' was not declared in this scope`

The compiler enforces scope. `y` does not exist outside its block. This is not a runtime check — the compiler proves at compile time that this access is invalid. Restore the comment.

---

## Step 2 — Stack Overflow: Exhaust the Stack

**Goal:** Deliberately cause a stack overflow. See the real error message. Understand why it happens.

Add a function to `main.cpp` that calls itself forever:

```cpp
#include <iostream>

// A counter to see how deep we get before crashing
// static means it persists between calls (it lives in the data segment, not the stack)
static int call_depth = 0;

// This function calls itself infinitely — each call adds a stack frame
// Eventually the stack runs out of space
void recurse_forever() {
    call_depth++;   // Increment our counter so we can see how deep we got

    // Print every 10,000 calls so we can see progress without flooding output
    if (call_depth % 10000 == 0) {
        std::cout << "Depth: " << call_depth << std::endl;
    }

    recurse_forever();  // Call ourselves — adds another stack frame
                        // There is no base case, so this never stops
}   // This line is never reached — the stack overflows first

int main() {
    std::cout << "Starting infinite recursion..." << std::endl;

    recurse_forever();  // This will crash the program

    std::cout << "This line never executes." << std::endl;
    return 0;
}
```

**COMPILE AND RUN:**

```bash
g++ -std=c++17 -g main.cpp -o memory_demo
./memory_demo
```

**Exact expected output (Linux/macOS):**
```
Starting infinite recursion...
Depth: 10000
Depth: 20000
...
Depth: 60000
Segmentation fault (core dumped)
```

(The exact depth varies by platform and compiler optimizations. On Windows you may see a different depth due to the 1 MB default stack.)

**The "segmentation fault" is a stack overflow.** Here is what happened:
1. Each call to `recurse_forever()` pushed a new stack frame — local variables, return address
2. The stack grew downward in memory, consuming the fixed-size stack region
3. When the stack pointer crossed the boundary into unmapped memory, the CPU raised a protection fault
4. The OS caught the fault and sent the process a `SIGSEGV` signal (segmentation violation)
5. The default handler printed "Segmentation fault" and terminated the program

**Terminal verification:**

```bash
# Check the default stack size on your system
ulimit -s
# Expected on Linux: 8192 (= 8 MB)
# Expected on macOS: 8192 (= 8 MB)
# Expected on Windows: not applicable (use Task Manager or Process Explorer)

# Halve the stack size and see what happens to the crash depth
ulimit -s 4096  # Set to 4 MB
./memory_demo
# Expected: crashes at roughly half the previous depth
```

**Change something — experiment:**

Compile with maximum optimization (`-O2`). Optimizing compilers detect tail-call recursion and can eliminate the stack frame, converting recursion into a loop:

```bash
g++ -std=c++17 -O2 main.cpp -o memory_demo_opt
./memory_demo_opt
```

The program may now run forever without crashing — the optimizer eliminated the stack growth. This is "tail-call optimization." Restore to `-g` (no optimization) for the remaining steps.

---

## Step 3 — Heap Allocation: `new` and `delete`

**Goal:** Allocate memory on the heap. Observe that it persists beyond the allocating function's lifetime. Practice correct `delete` usage.

Replace `main.cpp` with a clean version:

```cpp
#include <iostream>

// This function allocates an integer on the HEAP and returns a pointer to it
// The integer survives after this function returns — it is NOT on the stack
int* allocate_int(int value) {
    // 'new int(value)' does three things:
    //   1. Asks the OS for sizeof(int) = 4 bytes of heap memory
    //   2. Writes 'value' into those bytes (initialization)
    //   3. Returns the address of those bytes as an int*
    int* p = new int(value);

    std::cout << "Allocated int at address: " << p << std::endl;
    std::cout << "Value: " << *p << std::endl;  // * dereferences the pointer

    return p;   // Return the pointer — the HEAP memory persists
                // If this were a stack variable (int x = value; return &x;),
                // the memory would be reclaimed here and the pointer would be dangling
}

// This function shows heap allocation of an array
int* allocate_array(int size) {
    // 'new int[size]' allocates size * sizeof(int) bytes
    // Must be freed with delete[] (not delete) — different deallocation function
    int* arr = new int[size];

    // Initialize the array — the heap does NOT zero-initialize by default
    for (int i = 0; i < size; i++) {
        arr[i] = i * 10;   // Store 0, 10, 20, 30, ...
    }

    std::cout << "Allocated array of " << size << " ints at: " << arr << std::endl;
    return arr;
}

int main() {
    std::cout << "--- Heap integer ---" << std::endl;

    // Allocate an integer on the heap
    int* p = allocate_int(42);

    // The integer is still valid here — it lives on the heap, not the stack
    // allocate_int()'s stack frame is gone, but the heap memory persists
    std::cout << "Back in main, value is still: " << *p << std::endl;

    // Addresses: heap addresses look different from stack addresses
    int stack_var = 0;
    std::cout << "Stack address: " << &stack_var << std::endl;
    std::cout << "Heap address:  " << p << std::endl;
    // On Linux: stack ≈ 0x7fff..., heap ≈ 0x55... or lower

    // MANDATORY: release the memory when done
    // 'delete p' does two things:
    //   1. Calls p's destructor (for int, this is a no-op)
    //   2. Returns the memory to the heap's free list
    delete p;   // p is a single int — use delete (not delete[])
    p = nullptr;   // Best practice: null the pointer so you can't accidentally use it again
                   // Using a null pointer crashes immediately and predictably
                   // Using a dangling (non-null) pointer crashes unpredictably

    std::cout << "\n--- Heap array ---" << std::endl;

    int* arr = allocate_array(5);

    // Print the array values — memory is still valid
    for (int i = 0; i < 5; i++) {
        std::cout << "arr[" << i << "] = " << arr[i] << std::endl;
    }

    // MANDATORY: use delete[] for arrays (not delete)
    // delete arr would only destroy the first element — undefined behavior
    delete[] arr;
    arr = nullptr;

    return 0;
}
```

**COMPILE AND RUN:**

```bash
g++ -std=c++17 -g main.cpp -o memory_demo
./memory_demo
```

**Exact expected output:**
```
--- Heap integer ---
Allocated int at address: 0x55a3f2b01eb0
Value: 42
Back in main, value is still: 42
Stack address: 0x7ffd1a2b34ac
Heap address:  0x55a3f2b01eb0

--- Heap array ---
Allocated array of 5 ints at: 0x55a3f2b01ed0
arr[0] = 0
arr[1] = 10
arr[2] = 20
arr[3] = 30
arr[4] = 40
```

(Addresses will differ. Note how stack addresses start with `0x7fff...` and heap addresses start much lower — different regions of the process's virtual address space.)

**Terminal verification:**

```bash
# Run under address sanitizer — with correct delete calls, it should report ZERO errors
g++ -std=c++17 -g -fsanitize=address main.cpp -o memory_demo_asan
./memory_demo_asan
# Expected: program runs normally, no ASAN error output
echo "Exit code: $?"
# Expected: Exit code: 0
```

**Change something — experiment:**

Change `delete[] arr` to `delete arr` (wrong form for arrays). Recompile with address sanitizer:

```bash
g++ -std=c++17 -g -fsanitize=address main.cpp -o memory_demo_asan
./memory_demo_asan
```

**Expected ASAN output:**
```
==12345==ERROR: AddressSanitizer: attempting free() on address which was not malloc()-ed
```

The address sanitizer catches the mismatch between `new[]` and `delete`. Restore `delete[]`.

---

## Step 4 — Memory Leak: Allocate Without Freeing

**Goal:** Deliberately create a memory leak. Watch the address sanitizer catch it.

Replace `main.cpp`:

```cpp
#include <iostream>

// This function deliberately LEAKS memory
// It allocates on the heap but never deletes
void leak_memory() {
    // Allocate 1000 integers on the heap — 4000 bytes
    int* data = new int[1000];

    // Use the memory
    for (int i = 0; i < 1000; i++) {
        data[i] = i;
    }

    std::cout << "data[500] = " << data[500] << std::endl;

    // Function returns WITHOUT calling delete[] data
    // The 4000 bytes are now LEAKED:
    //   - The heap still thinks they are allocated
    //   - 'data' (the pointer) goes out of scope and is gone
    //   - There is no way to ever free this memory
    //   - It is lost until the process exits
}

// This function leaks a single object
int* get_leaked_value() {
    int* p = new int(99);   // Allocate on heap
    return p;               // Caller receives the pointer
                            // If the caller does not delete it, it leaks
}

int main() {
    std::cout << "--- Memory leak demonstration ---" << std::endl;

    // Call the leaking function
    leak_memory();   // 4000 bytes leaked here

    // Call it again
    leak_memory();   // Another 4000 bytes leaked

    // Get a value but "forget" to delete it
    int* val = get_leaked_value();   // 4 bytes allocated
    std::cout << "Got value: " << *val << std::endl;
    // val goes out of scope at end of main() — those 4 bytes are leaked

    // NOTE: In a short-lived program, the OS reclaims all memory at exit
    // A memory leak only matters if:
    //   1. The program runs for a long time (server, daemon)
    //   2. The leak is in a loop (allocate each iteration, never free)
    // In those cases, the process eventually runs the system out of memory

    return 0;
    // val goes out of scope here — leak!
}
```

**COMPILE AND RUN — first without address sanitizer:**

```bash
g++ -std=c++17 -g main.cpp -o memory_demo
./memory_demo
```

**Expected output:**
```
--- Memory leak demonstration ---
data[500] = 500
data[500] = 500
Got value: 99
```

The program appears to work perfectly. No crash. No warning. This is why memory leaks are insidious — they are invisible without tools.

**COMPILE AND RUN — with address sanitizer:**

```bash
g++ -std=c++17 -g -fsanitize=address main.cpp -o memory_demo_asan
./memory_demo_asan
```

**Exact expected ASAN output (after the program's normal output):**
```
--- Memory leak demonstration ---
data[500] = 500
data[500] = 500
Got value: 99

=================================================================
==12345==ERROR: LeakSanitizer: detected memory leaks

Direct leak of 4 byte(s) in 1 object(s) allocated from:
    #0 0x... in operator new(unsigned long) ...
    #1 0x... in get_leaked_value() main.cpp:26
    #2 0x... in main main.cpp:38

Direct leak of 4000 byte(s) in 2 object(s) allocated from:
    #0 0x... in operator new[](unsigned long) ...
    #1 0x... in leak_memory() main.cpp:9
    #2 0x... in main main.cpp:33

SUMMARY: AddressSanitizer: 4004 byte(s) leaked in 3 allocation(s).
```

ASAN reports exactly:
- **Where** the leaked memory was allocated (line numbers)
- **How many bytes** were leaked
- **How many allocations** were leaked

The report shows `main.cpp:26` (the `new int(99)` line) and `main.cpp:9` (the `new int[1000]` line). These are the allocation sites — the real source of the bug.

**Terminal verification:**

```bash
# Fix the leaks manually and confirm ASAN reports clean
# (Add delete[] data before return in leak_memory, and delete val before end of main)
# Then recompile and run:
g++ -std=c++17 -g -fsanitize=address main.cpp -o memory_demo_asan
./memory_demo_asan
# Expected: no ASAN output, exit code 0
```

**Change something — experiment:**

Add a loop that calls `leak_memory()` ten thousand times without the sanitizer:

```bash
# (Temporarily modify main to loop 10000 times)
# Then run and watch memory in another terminal:
# Terminal 1: watch -n 0.1 "ps aux | grep memory_demo | grep -v grep"
# Terminal 2: ./memory_demo
# You should see the RSS (resident set size) growing as each call leaks more memory
```

---

## Step 5 — Dangling Pointer and Double Free

**Goal:** Create a dangling pointer and a double free. See the address sanitizer catch both. Understand why these are so dangerous.

Replace `main.cpp`:

```cpp
#include <iostream>

void dangling_pointer_demo() {
    std::cout << "\n--- Dangling pointer ---" << std::endl;

    int* p = new int(42);   // Allocate on heap
    std::cout << "Before delete, value: " << *p << std::endl;   // Fine

    delete p;   // Free the memory — p now points to freed memory
                // The heap's allocator may immediately reuse this memory for something else
                // Or it may sit there, still containing 42, for a while
                // We do not know — this is UNDEFINED BEHAVIOR

    // Access through the dangling pointer — this is use-after-free
    // On some systems, in some runs, this might print 42 (the old value is still there)
    // On other systems, this crashes immediately
    // With ASAN, this always produces an error
    std::cout << "After delete (DANGER): " << *p << std::endl;   // UB: use-after-free
}

void double_free_demo() {
    std::cout << "\n--- Double free ---" << std::endl;

    int* p = new int(99);
    std::cout << "Allocated: " << *p << std::endl;

    delete p;   // First delete: correct — frees the memory, returns it to heap
    delete p;   // Second delete: WRONG — the heap's bookkeeping is now corrupted
                // This can:
                //   - Crash immediately (most likely)
                //   - Silently corrupt the heap's free list
                //   - Allow an attacker to control program execution (security vulnerability)
                // With ASAN, this always produces an error
}

int main() {
    // Comment out one demo at a time to see each error cleanly
    dangling_pointer_demo();
    // double_free_demo();   // Uncomment to see the double free error

    return 0;
}
```

**COMPILE AND RUN — without sanitizer (shows why these are hard to find):**

```bash
g++ -std=c++17 -g main.cpp -o memory_demo
./memory_demo
```

**Expected output (this is the scary part):**

On many systems, the dangling pointer read appears to succeed:
```
--- Dangling pointer ---
Before delete, value: 42
After delete (DANGER): 42
```

The old value is still in memory. The program appears to work. This is undefined behavior manifesting as "appears correct" — the most dangerous kind.

**COMPILE AND RUN — with address sanitizer (shows the real bug):**

```bash
g++ -std=c++17 -g -fsanitize=address main.cpp -o memory_demo_asan
./memory_demo_asan
```

**Exact expected ASAN output:**
```
--- Dangling pointer ---
Before delete, value: 42
=================================================================
==12345==ERROR: AddressSanitizer: heap-use-after-free on address 0x602000000010
READ of size 4 at 0x602000000010 thread T0
    #0 0x... in dangling_pointer_demo() main.cpp:18
    ...
0x602000000010 was freed here:
    #0 0x... in operator delete(void*) ...
    #1 0x... in dangling_pointer_demo() main.cpp:14
    ...
0x602000000010 was allocated here:
    #0 0x... in operator new(unsigned long) ...
    #1 0x... in dangling_pointer_demo() main.cpp:5
```

ASAN shows three locations:
1. **Where** the bad read happened (`main.cpp:18` — the use-after-free)
2. **Where** the memory was freed (`main.cpp:14` — the `delete p`)
3. **Where** the memory was allocated (`main.cpp:5` — the `new int(42)`)

Now uncomment `double_free_demo()` in `main()` and comment out `dangling_pointer_demo()`. Recompile with ASAN and run:

**Expected ASAN output for double free:**
```
--- Double free ---
Allocated: 99
=================================================================
==12345==ERROR: AddressSanitizer: attempting double-free on 0x602000000010
    #0 0x... in operator delete(void*) ...
    #1 0x... in double_free_demo() main.cpp:30
    ...
0x602000000010 was freed here:
    #1 0x... in double_free_demo() main.cpp:29
    ...
0x602000000010 was allocated here:
    #1 0x... in double_free_demo() main.cpp:24
```

ASAN catches the double free at the second `delete` call and shows exactly where the first `delete` happened.

**Terminal verification:**

```bash
# Confirm the program exits with non-zero when ASAN catches an error
./memory_demo_asan; echo "Exit code: $?"
# Expected: Exit code: 1 (or non-zero — ASAN forces an error exit)
```

---

## Step 6 — `unique_ptr`: The Correct Fix

**Goal:** Rewrite every dangerous pattern from Steps 4 and 5 using `unique_ptr`. Show ASAN reporting zero errors.

Replace `main.cpp` with the fixed version:

```cpp
#include <iostream>
#include <memory>    // Required for unique_ptr and make_unique
                     // This is a standard library header — no external dependency

// This is the fixed version of leak_memory from Step 4
// unique_ptr<int[]> automatically calls delete[] when it goes out of scope
void safe_array() {
    std::cout << "\n--- Safe array (unique_ptr) ---" << std::endl;

    // make_unique<int[]>(1000) allocates new int[1000] and wraps it in a unique_ptr
    // This is the modern replacement for: int* data = new int[1000];
    std::unique_ptr<int[]> data = std::make_unique<int[]>(1000);

    // Use the array exactly like a raw pointer — operator[] works the same way
    for (int i = 0; i < 1000; i++) {
        data[i] = i;
    }
    std::cout << "data[500] = " << data[500] << std::endl;

}   // <-- unique_ptr goes out of scope here
    //     Its destructor is called automatically
    //     The destructor calls delete[] on the underlying array
    //     Zero lines of cleanup code required. Zero chance of forgetting.

// This is the fixed version of dangling_pointer_demo from Step 5
void safe_single_value() {
    std::cout << "\n--- Safe single value (unique_ptr) ---" << std::endl;

    // make_unique<int>(42) is the replacement for: int* p = new int(42);
    std::unique_ptr<int> p = std::make_unique<int>(42);

    // Dereference with * exactly like a raw pointer
    std::cout << "Value: " << *p << std::endl;

    // To access the underlying raw pointer (for read-only, non-owning use):
    // int* raw = p.get();   // .get() returns the raw pointer WITHOUT releasing ownership
    //                       // Never delete raw — unique_ptr still owns the memory

    // You cannot accidentally use p after the memory is freed, because:
    // 1. unique_ptr does not expose a way to "delete and continue using"
    // 2. When unique_ptr is destroyed, it immediately becomes invalid
    // The old dangling-pointer pattern is simply not possible with unique_ptr

}   // <-- unique_ptr destructor calls delete here, automatically

// This demonstrates transferring ownership with std::move
// unique_ptr cannot be copied (that would create two owners — which one deletes?)
// But it CAN be moved — transferring ownership to a new unique_ptr
std::unique_ptr<int> make_value(int v) {
    std::unique_ptr<int> p = std::make_unique<int>(v);
    return p;   // Ownership transfers to the caller
                // The compiler applies move semantics here automatically
                // No copy happens — the unique_ptr in the caller IS this unique_ptr
}

int main() {
    safe_array();        // No leak — unique_ptr handles it
    safe_single_value(); // No dangling pointer possible — unique_ptr handles it

    std::cout << "\n--- Ownership transfer ---" << std::endl;

    // Receive ownership from make_value — the returned unique_ptr is moved into 'val'
    std::unique_ptr<int> val = make_value(77);
    std::cout << "Transferred value: " << *val << std::endl;

    // You can explicitly release ownership to get the raw pointer back
    // (rarely needed — only when interoperating with C libraries)
    // int* raw = val.release();  // unique_ptr no longer owns this — YOU must delete raw
    // delete raw;

    // Or you can reset (delete the current value and optionally assign a new one)
    val.reset();   // Calls delete, sets internal pointer to nullptr
    // val is now empty — accessing *val would be a null pointer dereference (crashes cleanly)

    return 0;
}   // All unique_ptrs are destroyed here — any remaining owned memory is freed
```

**COMPILE AND RUN:**

```bash
g++ -std=c++17 -g -fsanitize=address main.cpp -o memory_demo_asan
./memory_demo_asan
```

**Exact expected output:**
```
--- Safe array (unique_ptr) ---
data[500] = 500

--- Safe single value (unique_ptr) ---
Value: 42

--- Ownership transfer ---
Transferred value: 77
```

**Critically: zero ASAN output after the program finishes.** No leaks, no use-after-free, no double-free. The address sanitizer is running and found nothing to report.

**Terminal verification:**

```bash
# Confirm clean exit
./memory_demo_asan
echo "Exit code: $?"
# Expected: Exit code: 0

# Compare the code you had to write for cleanup:
# Step 4 (raw pointers): you manually called delete[] and delete — and leaked it anyway
# Step 6 (unique_ptr): zero cleanup code — the destructor handles everything
```

**Change something — experiment:**

Try to copy a `unique_ptr`:

```cpp
std::unique_ptr<int> a = std::make_unique<int>(10);
std::unique_ptr<int> b = a;   // Add this line and try to compile
```

**Expected error:**
```
error: use of deleted function 'std::unique_ptr<int>::unique_ptr(const std::unique_ptr<int>&)'
```

The copy constructor of `unique_ptr` is deleted — copying is prohibited. This enforces the single-ownership rule. If two `unique_ptr`s could exist for the same memory, both would try to `delete` it: double free. The compiler prevents this at compile time.

Use `std::move` instead to transfer ownership:

```cpp
std::unique_ptr<int> a = std::make_unique<int>(10);
std::unique_ptr<int> b = std::move(a);   // Transfer ownership: a becomes empty, b owns the int
std::cout << *b << std::endl;   // Works: 10
// std::cout << *a;              // Would crash: a is now null
```

---

## Quick Check Answers

**1. When does the memory for `int x = 5;` get reclaimed, and who does it?**
The memory is reclaimed when the function containing `x` returns. The CPU does it automatically by restoring the stack pointer register to where it was before the function was called. No garbage collector, no reference counting — just a CPU register being set back to its previous value. See Step 1: `show_stack()` stores `a`, `b`, and `d` on the stack. When `show_stack()` returns, those bytes are immediately available for reuse by the next function call.

**2. What resource ran out during infinite recursion, and how much does a process get?**
The stack ran out. Each call to `recurse_forever()` adds a stack frame. The total stack size is fixed — on Linux/macOS, typically 8 MB (visible from `ulimit -s`). When the stack pointer crosses into unmapped memory, the CPU raises a protection fault and the OS terminates the process with "Segmentation fault." See Step 2: the crash depth correlates with stack size — halving the stack size with `ulimit -s 4096` halved the depth before the crash.

**3. What happens to the 4 bytes from `new int(42)` when the function returns without `delete`?**
They are leaked — permanently allocated from the heap, impossible to free, counted as "in use" by the allocator until the process exits. The OS reclaims all process memory at exit, so short-lived programs survive leaks. Long-running programs (servers, daemons) accumulate leaked memory until the system runs out. See Step 4: without ASAN, the program ran normally. With ASAN, it reported `4 byte(s) leaked in 1 object(s)` with the exact line where `new` was called.

**4. When does `unique_ptr<int>` call `delete`, and how does it know?**
`unique_ptr` calls `delete` in its destructor, which runs automatically when the `unique_ptr` object goes out of scope — either at the closing brace of its containing block, or when the containing object is destroyed. It knows because the destructor is always called for stack-allocated objects (including `unique_ptr` itself). See Step 6: `safe_single_value()` showed a `unique_ptr` managing an int. No `delete` was written anywhere. ASAN reported zero leaks because the destructor called `delete` when the function returned.

---

## Challenge

No solution is provided. Requirements only.

### Rewrite a Raw-Pointer Class to Use `unique_ptr`

You are given a class that manages a dynamically-sized integer array using raw `new`/`delete`. It has a memory bug. Your job is to rewrite it to use `unique_ptr`, then prove with the address sanitizer that the bugs are gone.

**Requirements checklist:**

- [ ] Start with the provided starter code (contains intentional bugs — read them carefully)
- [ ] Rewrite `NumberBuffer` to use `std::unique_ptr<int[]>` instead of raw `int*`
- [ ] The class must still have the same public interface: `NumberBuffer(int size)`, `set(int index, int value)`, `get(int index)`, `print_all()`
- [ ] Compile the original starter code with `-fsanitize=address` and show the error it produces
- [ ] Compile your rewritten version with `-fsanitize=address` and show zero errors
- [ ] Do NOT write a destructor in the rewritten version — let `unique_ptr` handle it
- [ ] Show that the rewritten version compiles without the `-fsanitize=address` flag and produces correct output

**Starter code** (`challenge.cpp`) — copy this exactly, then fix it:

```cpp
#include <iostream>
#include <memory>

// BUGGY VERSION — this class has at least two memory bugs
// Your job: find them, then rewrite the class to eliminate them using unique_ptr
class NumberBuffer {
private:
    int* data;   // Raw pointer to heap-allocated array
    int size;

public:
    NumberBuffer(int sz) : size(sz) {
        data = new int[size];   // Allocate the array
        for (int i = 0; i < size; i++) {
            data[i] = 0;
        }
    }

    // Bug 1: this class has no destructor
    // When a NumberBuffer goes out of scope, data is never deleted
    // The heap memory leaks

    // Bug 2: the default copy constructor does a shallow copy
    // If you copy a NumberBuffer, both copies point to the same data
    // When both are destroyed, delete is called twice: double free

    void set(int index, int value) {
        if (index >= 0 && index < size) {
            data[index] = value;
        }
    }

    int get(int index) {
        if (index >= 0 && index < size) {
            return data[index];
        }
        return -1;
    }

    void print_all() {
        for (int i = 0; i < size; i++) {
            std::cout << "  [" << i << "] = " << data[i] << std::endl;
        }
    }
};

int main() {
    NumberBuffer buf(5);
    buf.set(0, 100);
    buf.set(1, 200);
    buf.set(2, 300);
    buf.print_all();

    // This copies buf — triggers Bug 2 when both go out of scope
    NumberBuffer buf2 = buf;
    buf2.set(3, 400);
    buf2.print_all();

    return 0;
    // Both buf and buf2 destroyed here — double free!
}
```

**When you're done:**
Running `g++ -std=c++17 -g -fsanitize=address challenge.cpp -o challenge && ./challenge` produces zero ASAN errors. The program prints the buffer contents correctly. You cannot write `NumberBuffer buf2 = buf;` in the rewritten version (the copy constructor should be deleted because `unique_ptr` does not allow copies — attempting it should produce a compile error that tells you ownership is exclusive).

**Stuck?** Ask AI: "I rewrote a C++ class to use `unique_ptr<int[]>` instead of a raw `int*` member, but the compiler says the copy constructor is deleted. Why can't I copy the class, and what does that tell me about ownership?"
