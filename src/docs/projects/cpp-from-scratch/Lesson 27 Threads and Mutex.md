# Lesson 27: Threads and Mutex

**What you will build**
You will build a series of short, concurrent C++ programs that divide work across multiple CPU cores. You will intentionally create a data race to observe how unprotected memory corrupts under simultaneous access, and then you will fix it by enforcing mutual exclusion. This proves that you can safely parallelize logic.

**What you need to know first**
Lesson 05 (Functions), Lesson 08 (RAII).

**Terms introduced in this lesson**
- **Thread** — an independent sequence of execution within a program that the operating system schedules on a CPU core. *Why it exists:* It allows a single process to execute multiple functions simultaneously, maximizing hardware utilization.
- **Data race** — a condition where two or more threads access the same memory location simultaneously, and at least one is writing to it. *Why it exists:* It is the fundamental concurrency bug; without enforced ordering, threads read and write at unpredictable nanosecond intervals, destroying intermediate state.
- **Undefined behavior (UB)** — a situation where the C++ standard provides no guarantees about what a program will do, allowing it to crash, produce garbage, or appear to work normally. *Why it exists:* It is the tradeoff C++ makes for maximum performance; instead of the compiler adding safety checks that slow down every operation, it assumes the programmer follows the rules, and if they don't, the execution contract is void.

**Objects and methods used**
- **std::thread**
  - *What it is:* A standard library class representing a single thread of execution.
  - *Implementation:* `class thread;` (in `<thread>`)
  - *Its use:* Spawning a new hardware thread to run a function concurrently alongside the caller.
- **std::thread::join**
  - *What it is:* A method that blocks the caller until the target thread finishes executing.
  - *Implementation:* `void join();`
  - *Its use:* Ensuring the main program does not exit or proceed before the background work is complete.
- **std::thread::detach**
  - *What it is:* A method that separates the thread of execution from the `std::thread` object.
  - *Implementation:* `void detach();`
  - *Its use:* Creating background tasks that the main thread never waits for.
- **std::mutex**
  - *What it is:* A synchronization primitive (Mutual Exclusion) that can be locked by only one thread at a time.
  - *Implementation:* `class mutex;` (in `<mutex>`)
  - *Its use:* Protecting shared memory by forcing threads to wait in line rather than accessing the data simultaneously.
- **std::lock_guard**
  - *What it is:* An RAII wrapper that owns a mutex for the duration of a scoped block, locking it on creation and unlocking it on destruction.
  - *Implementation:* `template<class Mutex> class lock_guard;` (in `<mutex>`)
  - *Its use:* Ensuring a mutex is always correctly unlocked when a scope exits, preventing deadlocks.

---

## Concept Unit: Spawning a Thread and `join`

### The Problem
By default, C++ executes line by line. If a program calls a function that takes a long time, the caller halts until the function returns. We want to start a function but immediately continue doing other work in the background.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because this curriculum builds conceptual mastery outside a monolithic project.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** entire file.
- **Dependencies:** a C++17 compiler and the system threading library (`-pthread` on Unix).

### The New Code
```cpp
#include <iostream>
#include <thread>

void worker_logic() {
    for (int i = 0; i < 5; ++i) {
        std::cout << "Worker: " << i << "\n";
    }
}

int main() {
    std::thread worker(worker_logic);
    
    for (int i = 0; i < 5; ++i) {
        std::cout << "Main: " << i << "\n";
    }
    
    worker.join();
    return 0;
}
```

### The Updated Project
The `main.cpp` file now holds a complete, runnable program that initiates a background sequence and concurrently executes its own loop before waiting for the background sequence to end.

### Introduce the concept in isolation
This is exactly what `std::thread worker(worker_logic);` in the code above is doing, isolated:
```cpp
std::thread t(worker_logic);
t.join();
```
This is called a **thread**. It asks the operating system to schedule the provided function on a CPU core immediately, returning control to the caller so both paths execute at once.

### Discard the throwaway example
This isolated snippet is deleted and will not appear again.

### Mechanical walkthrough
- `#include <thread>` — first appearance. Pulls in the standard library's thread support.
- `std::thread worker(worker_logic);` — first appearance. Constructs a new `std::thread` object named `worker`. The moment this object is instantiated, the operating system begins executing `worker_logic` concurrently.
- `worker.join();` — first appearance. Blocks the current thread (in this case, `main`) from proceeding. The program sits at this line and does zero work until the `worker` thread completely finishes executing its function.

**Execution Trace:**
1. `std::thread worker(worker_logic);` — the OS schedules the worker thread. It begins preparing to run, but `main` does not pause to wait for it.
2. `for (int i = 0; i < 5; ++i)` (in main) — executes immediately. The `main` thread races the `worker` thread to output text.
3. `worker.join();` — the `main` thread hits this line and halts. If `worker` is already done, it passes instantly; if not, it waits.

### CS Lens
This embodies hardware concurrency. Also recognized in: operating system multitasking, database query execution, web servers handling multiple requests, and modern game engines calculating physics and rendering simultaneously.

### SE Lens
The alternative is sequential execution, where `main` calls `worker_logic()` and waits for it to return before printing its own loop. Sequential code is predictable and easy to debug. Concurrency trades that simplicity for performance, introducing the risk of unpredictable execution order to maximize hardware utilization.

### Commands needed
To compile and link threading support on Unix-like systems (including macOS and Linux), you must pass the `-pthread` flag. On Windows with MSVC, threading is linked by default.
`g++ -std=c++17 -pthread main.cpp -o main`

### Run it
```text
Main: 0
Main: 1
Worker: 0
Worker: 1
Main: 2
Worker: 2
Main: 3
Worker: 3
Main: 4
Worker: 4
```
(Note: Your exact output order will vary every time you run it, because the OS thread scheduler does not guarantee which thread gets CPU time first.)

### Connection
Now that we can spawn a thread and wait for it, what happens if we deliberately choose not to wait?

---

## Concept Unit: `detach`

### The Problem
Sometimes a program starts a background task—like logging or a network heartbeat—that should run continuously without the main thread ever waiting for it. Using `join` forces a wait, defeating the purpose of a purely independent background task.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (modified).
- **Change type:** replace.
- **Location:** entire file.
- **Dependencies:** a C++17 compiler.

### The New Code
```cpp
#include <iostream>
#include <thread>
#include <chrono>

void background_task() {
    std::this_thread::sleep_for(std::chrono::milliseconds(50));
    std::cout << "Background task finished.\n";
}

int main() {
    std::thread worker(background_task);
    worker.detach();
    
    std::cout << "Main thread finished.\n";
    return 0;
}
```

### The Updated Project
The `main.cpp` file is replaced with a program that fires a background task which sleeps for a fraction of a second, but `main` intentionally exits before the task wakes up.

### Introduce the concept in isolation
This is exactly what `worker.detach()` in the code above is doing, isolated:
```cpp
std::thread t(background_task);
t.detach();
```
This is called **detaching a thread**. It severs the connection between the `std::thread` object and the underlying OS thread, allowing the OS thread to continue running independently of the object's lifecycle.

### Discard the throwaway example
This isolated snippet is deleted and will not appear again.

### Mechanical walkthrough
- `worker.detach();` — first appearance. Tells the C++ runtime that we will never call `join()` on this thread. The `worker` object can be safely destroyed at the end of `main` without terminating the program, leaving the actual background execution running.

**Execution Trace:**
1. `std::thread worker(background_task);` — starts the background thread.
2. `worker.detach();` — relinquishes control. The `worker` variable no longer represents the hardware thread.
3. `return 0;` — the main thread finishes and the process exits. Because the process exits, the operating system forcibly terminates the detached thread before it finishes sleeping. The final print never happens.

### CS Lens
This embodies daemon threads or fire-and-forget execution. Also recognized in: garbage collectors, asynchronous telemetry reporters, OS background services.

### SE Lens
The alternative is manually tracking the lifecycle of every background thread and joining them all before exit. Detaching is convenient but dangerous: if a detached thread accesses variables that the main thread destroys (like local variables passed by reference), it will read invalid memory. Modern C++ heavily favors joining or structured concurrency over detaching to guarantee safety.

### Commands needed
`g++ -std=c++17 -pthread main.cpp -o main`

### Run it
```text
Main thread finished.
```
(The background task's output is missing, proving the process exited without waiting for it).

### Connection
Running independent tasks is trivial; the real difficulty arises when multiple threads must access the exact same piece of data.

---

## Concept Unit: Data Races

### The Problem
Threads are rarely entirely independent; they usually need to read or write shared state. If two threads modify the exact same variable at the exact same time, the memory operations conflict, causing silent data corruption.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (modified).
- **Change type:** replace.
- **Location:** entire file.
- **Dependencies:** a C++17 compiler.

### The New Code
```cpp
#include <iostream>
#include <thread>

int shared_total = 0;

void add_to_total() {
    for (int i = 0; i < 100000; ++i) {
        shared_total = shared_total + 1;
    }
}

int main() {
    std::thread t1(add_to_total);
    std::thread t2(add_to_total);
    
    t1.join();
    t2.join();
    
    std::cout << "Expected 200000, got: " << shared_total << "\n";
    return 0;
}
```

### The Updated Project
The `main.cpp` file now holds a program that intentionally violates memory rules. Two threads aggressively read and write a single global integer simultaneously.

### Introduce the concept in isolation
This is exactly what `shared_total = shared_total + 1;` in the code above is doing, isolated:
```cpp
shared_total = shared_total + 1;
```
This is a **data race**. It looks like a single step, but the CPU actually executes it in three distinct steps: read the current value into a register, add one to the register, and write the register back to memory.

### Discard the throwaway example
This isolated snippet is deleted and will not appear again.

### Mechanical walkthrough
- `int shared_total = 0;` — a global variable. It resides in memory accessible to all threads in the process.
- `shared_total = shared_total + 1;` — the site of the data race. Because `t1` and `t2` execute this simultaneously without coordination, their reads and writes overlap.

**Execution Trace:**
1. Thread `t1` reads `shared_total` (e.g., 50).
2. Thread `t2` reads `shared_total` (also 50, because `t1` hasn't written the new value yet).
3. Thread `t1` adds 1 and writes 51 back to memory.
4. Thread `t2` adds 1 and writes 51 back to memory.
Both loops advanced, but the total only increased by 1 instead of 2. 

### CS Lens
This embodies a race condition, specifically a data race. Also recognized in: database transaction anomalies (lost updates), file system overwrites when two processes edit the same file, double-booking a ticket in a distributed system.

### SE Lens
The alternative is running the loops sequentially, which yields correct data but takes twice as long. By parallelizing without synchronization, we achieved speed at the cost of correctness. In C++, a data race is officially Undefined Behavior (UB), meaning the compiler is allowed to optimize the loop assuming it never happens, potentially generating code that crashes completely rather than just miscalculating.

### Commands needed
`g++ -std=c++17 -pthread main.cpp -o main`

### Run it
```text
Expected 200000, got: 114382
```
(Your exact number will differ, but it will be significantly less than 200,000, proving the silent loss of data).

### Connection
To fix the data race, we must force the threads to take turns modifying the shared variable, ensuring the read-modify-write cycle is never interrupted.

---

## Concept Unit: `std::mutex`

### The Problem
We need a mechanism to lock the critical section of code. When one thread begins reading and modifying the total, any other thread must be forced to stop and wait until the first thread finishes writing.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (modified).
- **Change type:** replace.
- **Location:** entire file.
- **Dependencies:** a C++17 compiler.

### The New Code
```cpp
#include <iostream>
#include <thread>
#include <mutex>

int shared_total = 0;
std::mutex total_mutex;

void add_to_total() {
    for (int i = 0; i < 100000; ++i) {
        total_mutex.lock();
        shared_total = shared_total + 1;
        total_mutex.unlock();
    }
}

int main() {
    std::thread t1(add_to_total);
    std::thread t2(add_to_total);
    
    t1.join();
    t2.join();
    
    std::cout << "Expected 200000, got: " << shared_total << "\n";
    return 0;
}
```

### The Updated Project
The `main.cpp` file is updated to include `<mutex>`. The worker function now wraps the dangerous memory modification inside explicit lock and unlock commands.

### Introduce the concept in isolation
This is exactly what `total_mutex.lock()` and `unlock()` in the code above are doing, isolated:
```cpp
total_mutex.lock();
// Exclusive access here
total_mutex.unlock();
```
This is a **mutex** (Mutual Exclusion). It acts as a digital talking stick: a thread cannot proceed past `lock()` unless it holds the stick, and only one stick exists. 

### Discard the throwaway example
This isolated snippet is deleted and will not appear again.

### Mechanical walkthrough
- `#include <mutex>` — first appearance. Pulls in the standard library's synchronization primitives.
- `std::mutex total_mutex;` — first appearance. Instantiates a global mutex object. It starts in an unlocked state.
- `total_mutex.lock();` — first appearance. Attempts to acquire exclusive ownership. If `t1` calls this while `t2` already holds the lock, `t1` halts and waits entirely until `t2` releases it.
- `total_mutex.unlock();` — first appearance. Relinquishes ownership. The OS instantly wakes up one of the waiting threads (if any) and hands it the lock.

**Execution Trace:**
1. Thread `t1` locks the mutex.
2. Thread `t2` tries to lock the mutex, but fails. It goes to sleep.
3. Thread `t1` reads (50), adds (1), and writes (51).
4. Thread `t1` unlocks the mutex.
5. Thread `t2` wakes up, acquires the lock, reads (51), adds (1), and writes (52).
Data integrity is preserved.

### CS Lens
This embodies a critical section protected by a lock. Also recognized in: database row locks, file locks during saves, semaphore signals in hardware interrupts.

### SE Lens
The alternative is lock-free programming using atomic variables (e.g., `std::atomic<int>`). Atomics are faster for simple counters because they rely on hardware instructions rather than OS scheduling. However, mutexes are required when updating multiple variables at once or protecting complex data structures like `std::vector`, making them the fundamental building block of thread safety. The cost of a mutex is performance contention: threads spend time sleeping instead of working.

### Commands needed
`g++ -std=c++17 -pthread main.cpp -o main`

### Run it
```text
Expected 200000, got: 200000
```

### Connection
Manual locking solves the data race, but it introduces a severe structural flaw: if the code between `lock()` and `unlock()` crashes or returns early, the mutex is never unlocked.

---

## Concept Unit: `std::lock_guard`

### The Problem
If a function throws an exception or hits a `return` statement while holding a manual lock, it skips the `unlock()` call. The mutex remains locked permanently, freezing any other thread that attempts to acquire it. We need a way to guarantee the mutex is unlocked no matter how the function exits.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.cpp` (modified).
- **Change type:** replace.
- **Location:** the `add_to_total` function.
- **Dependencies:** a C++17 compiler.

### The New Code
```cpp
void add_to_total() {
    for (int i = 0; i < 100000; ++i) {
        std::lock_guard<std::mutex> guard(total_mutex);
        shared_total = shared_total + 1;
    }
}
```

### The Updated Project
The `add_to_total` function inside `main.cpp` replaces explicit `lock()` and `unlock()` calls with a single scoped lock guard, ensuring the shared variable is modified safely.

### Introduce the concept in isolation
This is exactly what `std::lock_guard<std::mutex> guard(total_mutex);` in the code above is doing, isolated:
```cpp
{
    std::lock_guard<std::mutex> guard(total_mutex);
    // Exclusive access here
} // Unlocked automatically here
```
This is a **lock guard**. It uses RAII (Resource Acquisition Is Initialization) to tie the lock's duration to the lifespan of the `guard` object.

### Discard the throwaway example
This isolated snippet is deleted and will not appear again.

### Mechanical walkthrough
- `std::lock_guard<std::mutex>` — first appearance. A template class that manages a mutex. We specify `std::mutex` as the type of mutex it will hold.
- `guard(total_mutex);` — constructs the object named `guard`. The constructor immediately calls `total_mutex.lock()`.
- *Missing `unlock()`* — because `guard` is a local variable inside the `for` loop body, it goes out of scope and is destroyed at the end of every single iteration. Its destructor automatically calls `total_mutex.unlock()`. This happens even if an exception is thrown inside the loop. This is the **RAII** pattern (covered in Lesson 08), which guarantees cleanup by binding it to scope.

### CS Lens
This embodies deterministic resource management and exception safety. Also recognized in: smart pointers automatically freeing memory, file streams automatically closing their handles, database transactions automatically rolling back if not committed.

### SE Lens
The alternative is wrapping the critical section in a `try/catch` block and manually calling `unlock()` in both the success and error paths. This is tedious, error-prone, and violates DRY (Don't Repeat Yourself). `std::lock_guard` costs zero runtime overhead compared to manual locking but guarantees structural safety. Modern C++ guidelines mandate that `lock()` and `unlock()` should almost never be called manually.

### Commands needed
`g++ -std=c++17 -pthread main.cpp -o main`

### Run it
```text
Expected 200000, got: 200000
```

### Connection
By delegating the unlocking responsibility to the compiler via RAII, we achieve both thread safety and exception safety simultaneously.

---

## Connect the Pieces
A C++ program spawns independent paths of execution using `std::thread`, running immediately alongside the caller. The caller must either `join()` to wait for completion or `detach()` to abandon the thread. When those paths intersect over the same memory, the CPU's simultaneous read-modify-write cycles overlap, causing data races and undefined behavior. To prevent this, threads coordinate using a `std::mutex`, which acts as a digital baton ensuring only one thread enters the critical section at a time. To prevent deadlocks caused by early exits, `std::lock_guard` leverages RAII to guarantee the mutex is unlocked the moment the scope ends.

## What breaks without this
If you modify data concurrently without a mutex, you corrupt memory. If you use a mutex but forget to unlock it, you freeze the program.

Modify `add_to_total` to cause a deliberate deadlock by using manual locks and simulating a skipped unlock:
```cpp
void add_to_total() {
    for (int i = 0; i < 100000; ++i) {
        total_mutex.lock();
        shared_total = shared_total + 1;
        if (i == 50) return; // Returns early without unlocking!
        total_mutex.unlock();
    }
}
```
When you run the application, it will hang indefinitely. Thread 1 locks the mutex and returns at iteration 50. Thread 2 attempts to lock the mutex but halts, waiting for an `unlock()` that will never happen. The process is permanently frozen.

Restore the code by putting `std::lock_guard` back.

## Exercises
1. Modify the data race example to use three threads instead of two, each doing 100,000 additions, and observe the even more drastic data loss.
2. Add a `std::this_thread::sleep_for(std::chrono::milliseconds(1));` inside the `lock_guard` block, and time how long the program takes. This proves that heavily contended mutexes destroy the performance benefits of multithreading.

## Definition of done
- [ ] You can explain why a data race corrupts memory.
- [ ] You understand that `join()` forces the caller to wait, while `detach()` does not.
- [ ] You know why manual `unlock()` is dangerous compared to `std::lock_guard`.
- [ ] You can spawn a thread, protect a shared resource, and wait for completion in your own code.
- [ ] You can explain threads and mutexes out loud, in your own words, to someone who hasn't read this lesson.
