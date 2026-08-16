# Lesson 28: std::atomic and Lock-Free Patterns

**What you will build:** You will build a multi-threaded counter and evaluate compound operations that share data between threads without using a mutex. This proves you can synchronize state with zero blocking overhead, solving the problem of performance bottlenecks caused by heavy thread contention, while recognizing the boundaries of where lock-free patterns actually apply.

**What you need to know first:** Lesson 27 Threads and Mutex.

**Terms introduced in this lesson:**
- **Lock-free** — a property of an algorithm where at least one thread is always guaranteed to make progress, regardless of whether other threads are suspended or delayed. *Why it exists:* It provides predictable performance and avoids deadlocks, unlike mutex-based code where a thread holding a lock can halt the entire system if it gets preempted.
- **Data race** — undefined behavior that occurs when two threads access the same memory location simultaneously, and at least one access is a write. *Why it exists:* Hardware and compilers reorder instructions assuming single-threaded execution; data races are the formal term for when this assumption breaks down across multiple threads.
- **Memory ordering** — the set of rules that dictate how memory operations (reads and writes) in one thread become visible to other threads. *Why it exists:* Modern CPUs use caches and out-of-order execution. Memory ordering tells the CPU and compiler which operations must strictly happen before others to maintain logical correctness.

**Objects and methods used:**
- **std::atomic**
  - *What it is:* A standard library template that encapsulates a value and guarantees that operations on it are indivisible (atomic) and free of data races.
  - *Implementation:* `template<class T> struct atomic;`
  - *Its use:* Incrementing counters, flipping flags, and exchanging values safely across threads without the overhead of a mutex lock.
- **std::memory_order**
  - *What it is:* An enumeration specifying the exact synchronization requirements for an atomic operation.
  - *Implementation:* `enum class memory_order { relaxed, consume, acquire, release, acq_rel, seq_cst };`
  - *Its use:* Allowing developers to optimize performance by relaxing visibility guarantees when strict chronological ordering of surrounding variables isn't required.

---

## Concept Unit: The Atomic Counter

### The Problem
If two threads increment a normal integer simultaneously, the CPU must read the value, add one, and write it back. If both threads read the value before either writes, one of the increments is overwritten and lost. This is a data race. Using a mutex fixes it, but pausing an entire thread and invoking the operating system just to protect a single addition is devastating to performance. We need a way to tell the hardware itself to perform the read-modify-write cycle as one indivisible step.

### The New Code
```cpp
#include <iostream>
#include <thread>
#include <atomic>
#include <vector>

int main() {
    std::atomic<int> counter{0};

    auto increment = [&]() {
        for (int i = 0; i < 10000; ++i) {
            counter++;
        }
    };

    std::thread t1(increment);
    std::thread t2(increment);
    t1.join();
    t2.join();

    std::cout << "Final counter: " << counter.load() << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `std::atomic<int> counter{0};` — creates an atomic wrapper around a standard integer, initialized to 0. It guarantees that any operation performed on `counter` will be thread-safe.
- `counter++` — (which maps to `fetch_add(1)`) performs the read, addition, and write back to memory as a single, indivisible hardware operation. No other thread can see a half-finished update.
- `counter.load()` — safely reads the current value of the atomic variable.

### CS Lens
This is a hardware-level lock-free operation. Under the hood, the compiler translates `counter++` into specific CPU instructions (like `LOCK XADD` on x86) that lock the memory bus for a fraction of a nanosecond, preventing other CPU cores from accessing that memory address until the instruction finishes. It requires no OS-level context switching.

### SE Lens
The alternative is wrapping the integer in a `std::mutex`. While that works, a mutex involves the operating system and can put the thread to sleep, costing thousands of clock cycles. Atomics resolve the conflict at the silicon level in dozens of cycles. However, atomics only protect exactly one variable at a time.

### Commands Needed
- `g++ -std=c++17 -pthread main.cpp` — Compiles the program, linking the POSIX thread library required for C++ threads.
- `./a.out` — Runs the compiled binary.

### Run It
```text
Final counter: 20000
```
This proves the atomic operations are not losing increments. The throwaway code is now discarded.

### Connection
Now that we have a counter that safely increments without a mutex, we must understand the hidden cost of the default safety guarantees it uses.

---

## Concept Unit: Memory Ordering and relaxed

### The Problem
By default, every operation on a `std::atomic` uses a memory ordering called Sequential Consistency (`std::memory_order_seq_cst`). This prevents the CPU and compiler from reordering *any* memory operations around the atomic instruction. This is incredibly safe, but in a simple counter where we only care that the addition itself is atomic — and we don't care about the chronological order of other, unrelated variables — Sequential Consistency forces unnecessary stalls in the CPU's instruction pipeline.

### The New Code
```cpp
#include <iostream>
#include <thread>
#include <atomic>

int main() {
    std::atomic<int> counter{0};

    auto increment = [&]() {
        for (int i = 0; i < 10000; ++i) {
            counter.fetch_add(1, std::memory_order_relaxed);
        }
    };

    std::thread t1(increment);
    std::thread t2(increment);
    t1.join();
    t2.join();

    std::cout << "Relaxed counter: " << counter.load() << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `counter.fetch_add(...)` — explicitly calls the addition function instead of using the `++` operator, because operators cannot take memory ordering arguments.
- `1` — the value to add to the counter.
- `std::memory_order_relaxed` — instructs the compiler and CPU that this operation must be atomic, but it places *no restrictions* on how this operation is ordered relative to other memory reads and writes in the program.

### CS Lens
Modern CPUs execute instructions out of order to keep their pipelines full. `memory_order_seq_cst` forces a full memory barrier, flushing hardware queues and stalling the CPU. `memory_order_relaxed` says "just make sure the addition is indivisible, but feel free to reorder this instruction if it makes things faster."

### SE Lens
The default behavior (`seq_cst`) is the alternative not chosen here. You should always default to `seq_cst` (which `++` and basic assignment use) because getting memory ordering wrong leads to impossible-to-reproduce bugs on different CPU architectures (like ARM vs x86). You only switch to `relaxed` in highly-profiled performance hotspots, such as reference counting, where synchronization of other data is handled elsewhere.

### Run It
```text
Relaxed counter: 20000
```
This proves that even with relaxed ordering, the atomic guarantee of the counter itself remains intact. The throwaway code is now discarded.

### Connection
We've proven atomics are fast and can be tuned for even more performance, but their scope is fundamentally limited.

---

## Concept Unit: Why Atomics Do Not Replace Mutexes

### The Problem
Because atomics are lock-free and fast, a common mistake is trying to replace all mutexes with them. But atomics only guarantee the safety of *one* operation on *one* variable. If a system requires two variables to remain in sync — like transferring money between two accounts — atomics cannot prevent another thread from observing an invalid intermediate state between the two atomic operations.

### The New Code
```cpp
#include <iostream>
#include <thread>
#include <atomic>
#include <chrono>

int main() {
    std::atomic<int> accountA{100};
    std::atomic<int> accountB{100};

    auto transfer = [&]() {
        accountA.fetch_sub(50);
        // If the thread is preempted right here, 50 has vanished.
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        accountB.fetch_add(50);
    };

    auto audit = [&]() {
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
        int total = accountA.load() + accountB.load();
        std::cout << "Total funds during transfer: " << total << "\n";
    };

    std::thread t1(transfer);
    std::thread t2(audit);
    t1.join();
    t2.join();

    return 0;
}
```

### Mechanical Walkthrough
- `accountA.fetch_sub(50)` — safely subtracts 50 from A.
- `std::this_thread::sleep_for(...)` — artificially delays the thread to simulate being preempted by the operating system mid-transfer.
- `accountB.fetch_add(50)` — safely adds 50 to B, but this hasn't happened yet.
- `int total = accountA.load() + accountB.load();` — the audit thread runs while the transfer thread is asleep. It safely reads A (50) and B (100).

### CS Lens
This demonstrates the difference between "atomicity" and "isolation". Each individual read and write is atomic, but the *transaction* (the transfer) is not isolated. A mutex provides critical section isolation, preventing the audit thread from observing the system midway through the transfer.

### SE Lens
The alternative is using a `std::mutex`. A mutex allows you to define a compound action where multiple variables change at once, and no other thread can observe the partial changes. You must use a mutex when the invariant spans multiple variables. Atomics are for isolated counters and flags, not for coordinating complex state.

### Run It
```text
Total funds during transfer: 150
```
This proves that while the atomic operations themselves don't tear, the logic of the program is broken. The state is inconsistent. The throwaway code is now discarded.

### Connection
This concludes our exploration of atomic operations.

---

## Connect the Pieces
When you use `std::atomic<T>`, you are leveraging hardware instructions to perform thread-safe operations on single variables without blocking. An atomic variable guarantees its own safety, preventing data races when multiple threads increment or flip it simultaneously. You can use `memory_order_relaxed` to squeeze out maximum performance if you don't care about the ordering of other variables. However, atomics cannot enforce invariants across multiple variables; for compound actions, you must still use a mutex.

## What Breaks Without This
If you remove `std::atomic` and use a standard `int counter = 0`, then run `counter++` from multiple threads, the final counter value will be randomly lower than expected. The CPU interleaves the read and write instructions from different threads, overwriting increments.

## Exercises
1. Modify the counter example to use `counter.fetch_sub(1, std::memory_order_seq_cst)` and count down from 20000 to 0 across two threads.
2. Rewrite the bank transfer example using a `std::mutex` to prove that the audit thread will always see `Total funds: 200`.

## Definition of Done
- [ ] You can explain the difference between a data race on a standard `int` and a thread-safe increment on a `std::atomic<int>`.
- [ ] You understand that `memory_order_relaxed` provides atomicity but not instruction ordering.
- [ ] You can explain why `std::atomic` cannot replace a mutex when updating two related variables.
- [ ] You can compile and run a C++ program using `<atomic>`.
