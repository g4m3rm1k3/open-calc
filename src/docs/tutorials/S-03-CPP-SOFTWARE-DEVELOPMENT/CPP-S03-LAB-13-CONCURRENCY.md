# Lesson 13: Two Threads Reading and Writing the Same Thing Is a Race, Not a Coincidence
### (LAB 13 — Concurrency Basics)

**What you will build:** A real, dramatically wrong race condition — four threads incrementing a shared counter with no synchronization, producing a different, always-incorrect total on every single run — fixed two ways (`std::mutex`, then `std::atomic`), followed by a real, reproducible deadlock caught safely with a timeout, and `std::async`/`std::future` for getting a value back from background work. The transferable problem: every program this entire curriculum has built runs on exactly one thread, one instruction at a time, in an order that's always predictable from reading the code. The moment two threads touch the same data, that predictability is gone — and this lesson proves it, with real, repeatedly-wrong numbers, not a description of a danger to imagine.

**What you need to know first:** `S-01-CPP-FOUNDATIONS` LAB-05 — the call stack, functions. This series' Lesson 3 — RAII-style automatic cleanup (`std::lock_guard` reuses this exact idea for locking).

**Terms introduced in this lesson**

> **Thread** — an independent sequence of execution within a program; multiple threads run concurrently, potentially truly simultaneously on separate CPU cores.
> **Race condition** — a bug where a program's result depends on the unpredictable relative timing of two or more threads, rather than being fully determined by the code alone.
> **`std::mutex`** — a lock ensuring only one thread at a time can execute the code between acquiring and releasing it.
> **`std::lock_guard`** — an RAII wrapper that acquires a mutex on construction and releases it automatically on destruction, regardless of how the enclosing scope is exited.
> **`std::atomic<T>`** — a type whose operations (increment, read, write) are guaranteed indivisible across threads, without an explicit mutex.
> **Deadlock** — a state where two or more threads are each waiting on a resource the other holds, with neither able to proceed, ever.
> **`std::async` / `std::future`** — a higher-level way to run a function in the background and later retrieve its return value.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: `std::thread` — Running Code Concurrently

### The Problem

Every function call in this entire curriculum has run to completion, in order, on the one thread `main` itself runs on — nothing has ever run "at the same time" as anything else.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Inside `main`.
- **Dependencies:** `#include <thread>`.

### The New Code

```cpp
std::thread worker(announceFloor, 3);
worker.join();
```

### The Updated Project

```cpp
#include <iostream>
#include <thread>

void announceFloor(int floor) {
    std::cout << "Generating floor " << floor << " on thread " << std::this_thread::get_id() << std::endl;
}

int main() {
    std::cout << "main thread: " << std::this_thread::get_id() << std::endl;
    std::thread worker(announceFloor, 3);
    worker.join();
    std::cout << "main continues after join" << std::endl;
}
```

### Concept Lab

No separate throwaway: this real, minimal program, run below, is already the smallest useful demonstration.

Run it — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra main.cpp -o dungeon
$ ./dungeon.exe
main thread: 1
Generating floor 3 on thread 2
main continues after join
```

What that proves: `std::thread worker(announceFloor, 3);` — **(c) reusing** the "function plus arguments" calling shape (`S-01-CPP-FOUNDATIONS` LAB-05) — started `announceFloor(3)` running on a genuinely separate thread, confirmed by its own distinct thread ID (`2`, versus `main`'s own `1`). `worker.join()` paused `main` until that thread finished — without it, `main` could reach its own final line before `announceFloor` ever printed anything at all, an ordering this lesson's remaining Concept Units make concretely dangerous rather than merely possible.

### Mechanical Walkthrough

- `std::thread worker(announceFloor, 3);` — **(a) first appearance.** Constructing a `std::thread` immediately starts running the given function, on a new thread, with the given arguments — construction itself is what launches it, not a separate `.start()` call.
- `worker.join();` — **(a) first appearance.** Blocks the calling thread (`main`, here) until `worker`'s function finishes. A `std::thread` that is never `join()`-ed (nor explicitly `.detach()`-ed, not exercised in this lesson) before its own destructor runs terminates the entire program — a real, sharp restriction worth knowing exists, not exercised further here.

### CS Lens

A thread is a genuinely separate sequence of execution, potentially running on a different CPU core, truly simultaneously with `main` — not merely interleaved, the way a single-core system's operating system might simulate concurrency by rapidly switching between tasks. Modern multi-core hardware makes true simultaneity the common case, which is exactly why the next Concept Unit's danger is real and not theoretical.

### Connection

Concept Unit 2 runs *several* threads against the *same* piece of data — the moment concurrency actually becomes dangerous.

---

## Concept Unit 2: The Race Condition — a Real, Repeatedly Wrong Number

### The Problem

If two threads both read a shared value, compute a new one, and write it back — with no coordination at all — can their individual operations interleave in a way that loses one thread's work entirely?

### Concept Lab

```cpp
// scratch_race.cpp  (disposable)
#include <iostream>
#include <thread>
#include <vector>
int sharedGold = 0;
void collectGold(int times) {
    for (int i = 0; i < times; ++i) {
        sharedGold = sharedGold + 1;   // read, add, write -- NOT one indivisible step
    }
}
int main() {
    const int ITER = 200000;
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.push_back(std::thread(collectGold, ITER));
    }
    for (auto& t : threads) t.join();
    std::cout << "expected: " << (4 * ITER) << std::endl;
    std::cout << "actual:   " << sharedGold << std::endl;
}
```

Run it — verified this session, **three separate times**:

```
$ g++ -std=c++17 -Wall -Wextra scratch_race.cpp -o scratch_race -O0
$ ./scratch_race.exe
expected: 800000
actual:   266374
$ ./scratch_race.exe
expected: 800000
actual:   267535
$ ./scratch_race.exe
expected: 800000
actual:   242839
```

**A real, verified, dramatically wrong result — worth sitting with, not glossing over:** four threads, each incrementing `sharedGold` exactly `200000` times, should produce `800000` — real arithmetic, no ambiguity. The actual result is wrong on *every single run*, by a large and *different* amount each time. This is a **race condition**: `sharedGold = sharedGold + 1;` is not one indivisible operation — it is (at minimum) three: *read* `sharedGold`'s current value, *compute* the new value, *write* it back. If two threads both read the same value before either writes its own update back, one thread's increment is silently lost — the second write simply overwrites the first, as if it never happened. With four threads racing `200000` times each, this happens tens of thousands of times per run, and the exact count depends on unpredictable, run-to-run-different thread scheduling — which is precisely why the wrong answer is a *different* wrong answer each time.

This scratch file is discarded now; Concept Units 3–4 each fix this identical scenario, one way apiece.

### Mechanical Walkthrough

- `sharedGold = sharedGold + 1;` — **(a) first appearance of a non-atomic read-modify-write on data shared across threads**, the exact "read, modify, write" shape `S-01-CPP-FOUNDATIONS` LAB-02's own compound-assignment lens already named — safe when only one thread ever touches it, actively dangerous the instant more than one does, with no compiler warning produced for this specific danger under this course's standard `-Wall -Wextra` flags.

### CS Lens

This is the exact scenario `S-01-CPP-FOUNDATIONS` LAB-11's own "read the whole line" atomicity assumption and this series' own Lesson 4's move-vs-copy distinction both gestured toward without fully confronting: an operation that *looks* like one step in source code is frequently several steps in the actual machine code the compiler generates, and multiple threads can interleave at any of those intermediate steps, producing results no single-threaded reading of the code would ever predict.

### SE Lens

**The rule this verified proof justifies, without qualification:** any data touched by more than one thread needs explicit synchronization — there is no way to "just be careful" with ordinary reads and writes and get a reliably correct result; the race demonstrated above isn't a rare edge case, it's the *default*, guaranteed outcome of skipping synchronization on shared, mutable data.

### Connection

Concept Unit 3 fixes this exact scenario with `std::mutex`.

---

## Concept Unit 3: `std::mutex` and `std::lock_guard`

### The Problem

Concept Unit 2's threads need a way to guarantee only one of them executes the read-modify-write sequence at a time — the others must genuinely wait, not just "usually" avoid overlapping.

### Concept Lab

```cpp
// scratch_mutex.cpp  (disposable)
#include <iostream>
#include <thread>
#include <vector>
#include <mutex>
int sharedGold = 0;
std::mutex goldMutex;
void collectGold(int times) {
    for (int i = 0; i < times; ++i) {
        std::lock_guard<std::mutex> lock(goldMutex);
        sharedGold = sharedGold + 1;
    }
}
int main() {
    const int ITER = 200000;
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.push_back(std::thread(collectGold, ITER));
    }
    for (auto& t : threads) t.join();
    std::cout << "expected: " << (4 * ITER) << std::endl;
    std::cout << "actual:   " << sharedGold << std::endl;
}
```

Run it — verified this session, twice:

```
$ g++ -std=c++17 -Wall -Wextra scratch_mutex.cpp -o scratch_mutex -O0
$ ./scratch_mutex.exe
expected: 800000
actual:   800000
$ ./scratch_mutex.exe
expected: 800000
actual:   800000
```

What that proves: identical scenario to Concept Unit 2's own scratch file, with exactly two additions — a `std::mutex` and a `std::lock_guard` wrapping the read-modify-write line — now produces the mathematically correct `800000`, every single run. `std::lock_guard<std::mutex> lock(goldMutex);` acquires `goldMutex` when constructed; if another thread already holds it, this line *blocks* — genuinely pauses that thread — until the holder releases it. Only one thread can be inside the guarded region at a time, so the "read, then modify, then write" sequence can never be interrupted by another thread's own read of the same, not-yet-updated value.

This scratch file is discarded now.

### Mechanical Walkthrough

- `std::mutex goldMutex;` — **(a) first appearance.** A mutual-exclusion lock — at most one thread can hold it at a time.
- `std::lock_guard<std::mutex> lock(goldMutex);` — **(a) first appearance of RAII applied to locking.** Acquires the lock immediately on construction; releases it automatically when `lock` goes out of scope — `S-02-CPP-DSA-MASTERY` LAB-04's own RAII guarantee, and this series' own Lesson 8's stack-unwinding proof, applied here specifically so a lock is never accidentally left held (an early `return`, or an exception, inside the guarded region still releases it correctly, for the identical reason a `unique_ptr`, this series' Lesson 3, still cleans up correctly on those same paths).

### CS Lens

A mutex forces the exact "one at a time, in some order" execution every single-threaded program in this curriculum already had for free — the cost is real: threads that would otherwise run truly in parallel now serialize through the guarded region, one at a time, which is why the guarded region should be as small as possible (here, exactly one line) rather than wrapping more work than genuinely needs protecting.

### SE Lens

`std::lock_guard` over manually calling `.lock()`/`.unlock()` is this lesson's own instance of the same argument this series' Lesson 3 already made for smart pointers over raw `new`/`delete`: manual unlock requires remembering to call it on *every* exit path, including exceptions — RAII makes forgetting structurally impossible instead of merely a discipline to maintain.

### Connection

Concept Unit 4 shows a lighter-weight alternative, appropriate specifically for simple cases like this one.

---

## Concept Unit 4: `std::atomic` — a Lock-Free Alternative for Simple Cases

### The Problem

A `std::mutex` is real, general-purpose machinery — locking and unlocking has real cost, and for something as simple as "safely increment one integer across threads," a full mutex might be more machinery than the job needs.

### Concept Lab

```cpp
// scratch_atomic.cpp  (disposable)
#include <iostream>
#include <thread>
#include <vector>
#include <atomic>
std::atomic<int> sharedGold{0};
void collectGold(int times) {
    for (int i = 0; i < times; ++i) {
        ++sharedGold;
    }
}
int main() {
    const int ITER = 200000;
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.push_back(std::thread(collectGold, ITER));
    }
    for (auto& t : threads) t.join();
    std::cout << "expected: " << (4 * ITER) << std::endl;
    std::cout << "actual:   " << sharedGold << std::endl;
}
```

Run it — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra scratch_atomic.cpp -o scratch_atomic -O0
$ ./scratch_atomic.exe
expected: 800000
actual:   800000
```

What that proves: `std::atomic<int> sharedGold{0};` with plain `++sharedGold;` — no mutex, no `lock_guard` anywhere — also produces the correct `800000`, reliably. `std::atomic<T>`'s own operations (increment, assignment, read) are guaranteed **indivisible** at the hardware level — no other thread can ever observe or interleave with a half-completed atomic operation, the identical guarantee `std::mutex` provided, achieved here through a CPU-level instruction instead of a general-purpose lock.

This scratch file is discarded now.

### Mechanical Walkthrough

- `std::atomic<int> sharedGold{0};` — **(a) first appearance.** A template (`S-02-CPP-DSA-MASTERY` LAB-05) wrapping an `int` such that its own operations are individually thread-safe with no external mutex required.
- `++sharedGold;` — **(c) reusing** `++` (`S-01-CPP-FOUNDATIONS` LAB-02), overloaded (this series' own Lesson 1 vocabulary) on `std::atomic<int>` to perform an indivisible increment.

### CS Lens

`std::atomic` typically compiles to a single, special CPU instruction (a "compare-and-swap" or equivalent, hardware-dependent, not covered further here) rather than a full lock-and-unlock sequence — genuinely cheaper than `std::mutex` for the specific case of simple, single-variable operations, at the cost of not generalizing to protecting *multiple* related variables together (a mutex can guard an entire multi-step operation across several variables; an atomic only ever guards one variable's own individual operations).

### SE Lens

Use `std::atomic` for a single counter or flag; use `std::mutex` the moment more than one piece of related data needs to change together, consistently, as one logical unit — `S-01-CPP-FOUNDATIONS` LAB-13's own `levelUp` (updating `level`, `xp`, `maxHp`, `hp`, `atk`, `def` together, atomically from the caller's perspective) is exactly the shape that needs a mutex, not several independent atomics, if it were ever made thread-safe: several atomics updated separately could still let another thread observe an inconsistent, half-updated `Player` in between.

### Connection

Concept Unit 5 shows what happens when synchronization itself is used incorrectly — a real, reproducible deadlock.

---

## Concept Unit 5: Deadlock — a Real, Reproducible Hang

### The Problem

If two threads each need *two* locks, and acquire them in *opposite* order, can each end up waiting forever for a lock the other one is holding?

### Concept Lab

```cpp
// scratch_deadlock.cpp  (disposable)
#include <iostream>
#include <thread>
#include <mutex>
#include <chrono>
std::mutex mutexA, mutexB;
void taskOne() {
    std::lock_guard<std::mutex> lockA(mutexA);
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    std::cout << "taskOne waiting for mutexB..." << std::endl;
    std::lock_guard<std::mutex> lockB(mutexB);
    std::cout << "taskOne acquired both" << std::endl;
}
void taskTwo() {
    std::lock_guard<std::mutex> lockB(mutexB);
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    std::cout << "taskTwo waiting for mutexA..." << std::endl;
    std::lock_guard<std::mutex> lockA(mutexA);
    std::cout << "taskTwo acquired both" << std::endl;
}
int main() {
    std::thread t1(taskOne);
    std::thread t2(taskTwo);
    t1.join();
    t2.join();
    std::cout << "both finished" << std::endl;
}
```

Run it, deliberately bounded with a timeout so a genuine hang can be observed safely rather than left running forever — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra scratch_deadlock.cpp -o scratch_deadlock
$ timeout 5 ./scratch_deadlock.exe
taskOne waiting for mutexB...
taskTwo waiting for mutexA...
[nothing further -- the process was killed by the timeout, exit code 124]
```

**A real, verified deadlock — the program never finishes on its own.** `taskOne` acquires `mutexA` first, then (after a deliberate short sleep, to make the interleaving reliable rather than a matter of luck) tries to acquire `mutexB`. `taskTwo` acquires `mutexB` first, then tries to acquire `mutexA`. By the time either thread reaches its second lock attempt, the *other* thread already holds it — `taskOne` waits for `mutexB`, which `taskTwo` holds and won't release until it gets `mutexA`; `taskTwo` waits for `mutexA`, which `taskOne` holds and won't release until it gets `mutexB`. Neither can ever proceed. `"both finished"` never prints. The process had to be killed by `timeout` — not a crash, not an error message, just silence, forever.

This scratch file is discarded now.

### Mechanical Walkthrough

- `lockA` (in `taskOne`) then `lockB`; `lockB` (in `taskTwo`) then `lockA` — **(a) first appearance of inconsistent lock ordering across threads**, the exact and only structural cause of this deadlock.

### CS Lens

Deadlock is not a timing accident the way Concept Unit 2's race condition was — it's a structural guarantee given this exact lock-ordering mismatch and this exact interleaving; the `sleep_for` calls exist in this Concept Lab specifically to make that interleaving reliable for a lesson demonstration, but the underlying danger exists with or without them, triggered whenever real-world timing happens to line up the same way.

### SE Lens

**The rule this verified deadlock justifies:** when a piece of code must hold more than one mutex at once, every thread that might hold both must acquire them in the *same* order, always — the simplest real fix for this exact example is having both `taskOne` and `taskTwo` acquire `mutexA` before `mutexB`, universally, which this lesson leaves as an exercise rather than a rewritten Concept Lab, specifically so the fix is worked out and verified firsthand rather than read.

### Connection

Concept Unit 6 closes with a simpler, higher-level tool for the common case of "run this in the background, get a value back" — no explicit thread management at all.

---

## Concept Unit 6: `std::async` and `std::future`

### The Problem

Concept Unit 1's `std::thread` has no direct way to return a value — `announceFloor` communicated only by printing, with no way for `main` to receive a computed result back from the thread once it finished.

### Concept Lab

```cpp
// scratch_async.cpp  (disposable)
#include <iostream>
#include <future>
int calculateTotalXP(int level) {
    int total = 0;
    for (int i = 1; i <= level; ++i) total += i * 100;
    return total;
}
int main() {
    std::cout << "starting background calculation..." << std::endl;
    std::future<int> result = std::async(std::launch::async, calculateTotalXP, 5);
    std::cout << "main is free to do other work while it runs..." << std::endl;
    int xp = result.get();
    std::cout << "total XP: " << xp << std::endl;
}
```

Run it — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra scratch_async.cpp -o scratch_async
$ ./scratch_async.exe
starting background calculation...
main is free to do other work while it runs...
total XP: 1500
```

What that proves: `std::async(std::launch::async, calculateTotalXP, 5)` — **(c) reusing** the "function plus arguments" shape (Concept Unit 1) — started `calculateTotalXP(5)` running in the background, immediately returning a `std::future<int>` (a placeholder for a value not yet computed) rather than the `int` itself. `main` continued running its own next line immediately, without waiting. `result.get()` blocked until the background computation actually finished, then returned its real value — `1500` (`100 + 200 + 300 + 400 + 500`), correct.

This scratch file is discarded now.

### Mechanical Walkthrough

- `std::future<int> result = std::async(...)` — **(a) first appearance.** `std::async` runs a function on a (possibly new) thread and immediately returns a `future` — a handle to a result that will exist once that thread finishes.
- `result.get()` — **(a) first appearance.** Blocks until the associated computation finishes, then returns its value — calling `.get()` a second time on the same `future` is undefined; a `future` represents a one-time handoff of exactly one result.

### CS Lens

`std::async`/`std::future` is a higher-level abstraction over `std::thread` — no explicit `.join()`, no shared variable requiring a mutex or atomic at all, because the *only* data crossing the thread boundary is the one return value, handed off exactly once through the `future`, with no possibility of two threads racing over it the way Concept Unit 2's shared `int` could be raced over.

### SE Lens

Reach for `std::async`/`std::future` first, whenever the actual need is "compute this in the background, get one result back later" — it sidesteps every synchronization danger this lesson demonstrated (races, deadlocks) entirely, by construction, for exactly this common case. Reach for raw `std::thread` plus explicit mutexes/atomics only when the actual requirement is genuinely more complex — ongoing, shared, mutable state accessed by multiple threads over time, which `std::async`'s single-result model cannot express.

### Connection

This closes every new mechanism in this lesson — the Closing section connects every verified danger back to the synchronization tool that solves it.

---

## Closing

### Connect the pieces

Concept Unit 1 proved `std::thread` genuinely runs code concurrently, with its own distinct thread ID. Concept Unit 2 proved, with real, differently-wrong numbers on every run, that shared mutable data touched by multiple threads with no coordination produces a race condition — not a rare edge case, the guaranteed default outcome. Concept Unit 3's `std::mutex`/`std::lock_guard` fixed it through RAII-guaranteed locking; Concept Unit 4's `std::atomic` fixed the identical scenario more cheaply, for the specific case of one simple variable. Concept Unit 5 proved synchronization itself can go wrong — a real, reproducible deadlock from inconsistent lock ordering, caught safely with a timeout rather than left to hang forever. Concept Unit 6 closed with the tool that avoids most of this danger by construction, for the specific, common case of "run this once, get one result back."

### What breaks without this

Concept Unit 2's own verified race *is* this lesson's "what breaks" — and it is worth restating precisely how dangerous its silence is: the program never crashed, never printed an error, never behaved in any way that announces something is wrong beyond the final number simply being incorrect. A real program with this exact bug — a shared counter, a shared score, a shared inventory count, touched by multiple threads with no synchronization — would run, appear to work, and produce subtly wrong results that could pass casual testing entirely, especially if the race is rare enough not to show up in a quick manual check, the identical "looks correct until you actually verify" danger this entire curriculum's schema has been built to catch, now at its most consequential.

### Exercises

1. Reproduce Concept Unit 2's race condition yourself, run it five times, and record the five different wrong totals — then apply Concept Unit 3's `std::mutex` fix and confirm all five runs now agree, exactly, on the correct total.
2. Fix Concept Unit 5's deadlock yourself, by making both `taskOne` and `taskTwo` acquire `mutexA` before `mutexB`, consistently — confirm, with the same `timeout`-guarded run, that `"both finished"` now prints reliably.
3. Rebuild Concept Unit 2's race condition using `std::atomic<int>` instead of `std::mutex`, and compare the compiled program's behavior — confirm both fixes produce the identical correct result, and explain, in your own words, when you'd reach for one over the other.
4. Use `std::async`/`std::future` to run two independent background computations at once (not one), and combine their two results after both `.get()` calls complete — confirming `std::future` handles multiple, independent background tasks cleanly, each with its own result.

### Definition of done

- [ ] A real race condition was reproduced, with its actual (not predicted) wrong output recorded across multiple runs.
- [ ] The same scenario was fixed two ways — `std::mutex`/`std::lock_guard` and `std::atomic` — both verified to produce the correct result reliably.
- [ ] A real deadlock was reproduced (safely, with a timeout) and then fixed by correcting lock ordering, verified to complete afterward.
- [ ] You can state, from Concept Unit 2's own verified proof, why `x = x + 1` is not a single, indivisible operation, and what that means for code shared across threads.
- [ ] You can explain the real tradeoff between `std::mutex` and `std::atomic`, and when each is the appropriate choice.
- [ ] All four Exercises completed with real, observed output, including Exercise 1's full record of multiple differently-wrong race outcomes.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-13: verified race condition, fixed with mutex and atomic; verified and fixed a deadlock"` — states why (a real, reproduced concurrency bug and its two verified fixes, not a description of a danger to imagine) not just what changed.

---

## Series Closing: What This Bridge Actually Bridged

Thirteen lessons ago, `S-01-CPP-FOUNDATIONS`'s own `Player` struct tracked a character's class as a plain string, checked with `if`-chains repeated in every function that cared. This series replaced that with real inheritance and polymorphism (Lessons 1–2), made every heap allocation leak-proof by construction (Lesson 3), made every resource-owning class efficient to move as well as safe to copy (Lesson 4), replaced hand-rolled data structures with the standard library's own tested versions (Lesson 5), opened up the iterator interface underneath every one of them (Lesson 6), and used that interface to call tested, correct algorithms instead of re-writing loops by hand (Lesson 7). Lesson 8 replaced manually-forwarded error codes with automatic exception propagation, proven safe specifically because Lessons 3–4's ownership discipline was already in place. Lesson 9 replaced a hand-typed `g++` command with a real, scalable build description. The optional tier closed real gaps this curriculum's own checklists had been gesturing at since `S-01-CPP-FOUNDATIONS` LAB-00: real git collaboration (Lesson 10), a real debugger (Lesson 11), automated, permanent verification (Lesson 12), and the one danger every single-threaded lesson before this series was structurally unable to demonstrate (Lesson 13).

Every one of these thirteen lessons, and every real bug and gotcha found inside them, was verified by actually compiling and running the code this session — not one of them was assumed to work because it looked right on the page.
