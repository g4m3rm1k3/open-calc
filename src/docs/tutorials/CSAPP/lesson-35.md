# Lesson 35: POSIX Threads — pthread_create, pthread_join, and Thread Lifecycle

What you will build: The reader will understand POSIX threads: how to create, join, and detach threads; how to pass arguments correctly; how threads share address space; and what thread-local storage means. The transferable insight: a thread is a lightweight process with its own stack and registers but shared code, heap, and globals. The pthread API is the C standard for creating threads on any POSIX system (Linux, macOS, BSDs).

What you need to know first: Lessons 00-34.

Terms used in this lesson:
- **Thread** — A scheduling entity with its own stack and registers, but sharing the address space (code, globals, heap) with other threads in the same process. It allows concurrent execution within a single program.
- **Thread-local storage (TLS)** — Memory that is unique to each thread, rather than shared across all threads like standard global variables. It prevents data races on variables that don't need to be shared.
- **Data race** — A condition where multiple threads access the same shared memory location concurrently, and at least one access is a write, without proper synchronization.

Objects and methods used:
- **pthread_create**
  - *What it is:* A function to start a new thread in the calling process.
  - *Implementation:* `int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);`
  - *Its use:* Used to spawn a new thread to execute a specific function concurrently.
  - *Type:* C standard library function (POSIX).
  - *Responsibility:* Allocates resources for a new thread, sets up its stack, and schedules it to run the provided function with the given argument.
  - *Depends on:* A valid thread ID pointer, optional attributes, a function pointer for the thread to run, and the argument to pass to that function.
  - *Connects to:* Calls into the OS kernel to create the thread; returns control to the caller while the new thread runs independently.
  - *Shape:* A system-level API boundary between application code and the OS thread scheduler.
- **pthread_join**
  - *What it is:* A function to wait for a specific thread to terminate.
  - *Implementation:* `int pthread_join(pthread_t thread, void **retval);`
  - *Its use:* Used to block the calling thread until the specified thread finishes execution, allowing for synchronization and retrieval of the thread's return value.
  - *Type:* C standard library function (POSIX).
  - *Responsibility:* Blocks execution until the target thread exits, collects its exit status, and reclaims the thread's resources.
  - *Depends on:* The ID of the thread to wait for, and an optional pointer to store the thread's return value.
  - *Connects to:* Halts the calling thread; interacts with the target thread's lifecycle to ensure it has fully terminated before proceeding.
  - *Shape:* A synchronization point in concurrent execution flow.
- **pthread_detach**
  - *What it is:* A function to mark a thread as detached, meaning its resources are automatically released when it terminates.
  - *Implementation:* `int pthread_detach(pthread_t thread);`
  - *Its use:* Used for "fire-and-forget" threads where the main thread does not need to wait for their completion or collect a return value.
  - *Type:* C standard library function (POSIX).
  - *Responsibility:* Modifies the internal state of a thread so that the OS reclaims its resources immediately upon exit, preventing resource leaks without needing a join.
  - *Depends on:* The ID of the thread to detach.
  - *Connects to:* Informs the OS thread manager that this thread's exit status is not needed by anyone.
  - *Shape:* A lifecycle configuration step for background tasks.
- **pthread_self**
  - *What it is:* A function to get the ID of the calling thread.
  - *Implementation:* `pthread_t pthread_self(void);`
  - *Its use:* Used when a thread needs to know its own identifier, for example, for logging or self-management.
  - *Type:* C standard library function (POSIX).
  - *Responsibility:* Returns the unique thread ID of the currently executing thread.
  - *Depends on:* Nothing (takes no arguments).
  - *Connects to:* Reads the current execution context from the OS.
  - *Shape:* A utility function for inspecting thread context.

## Concept Unit: What a thread is — shared memory, separate stack

### The Problem
When running tasks concurrently, using separate processes via `fork()` duplicates the entire address space. How can we run concurrent tasks that need to easily share a large amount of memory, without the overhead of copying the entire process memory? Can we have multiple execution paths operating within the exact same memory space? What happens to local variables if they do?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

int global = 0;  /* shared: all threads see same 'global' */

void *thread_fn(void *arg) {
    int local = 42;  /* private: on THIS thread's stack */
    global = 100;    /* modifies shared global */
    printf("thread: local=%p, global=%p\n",
           (void*)&local, (void*)&global);
    return NULL;
}

int main(void) {
    pthread_t tid;
    pthread_create(&tid, NULL, thread_fn, NULL);
    pthread_join(tid, NULL);
    printf("main: global=%d\n", global);
    printf("main: &global=%p\n", (void*)&global);
    return 0;
}
```
This demonstrates the **thread** concept. The output proves that the thread has its own separate stack (the address of `local` is distinct and typically in a high memory region separate from `main`'s stack), but it shares the `.data` segment because the address of `global` is identical in both `main` and `thread_fn`. The write to `global` by the thread is visible to `main` after the join.

### Discard the throwaway
This throwaway example is discarded and will not be included in the final project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our threading module.
- **Files affected:** `src/threading.c` (created).
- **Change type:** Add.
- **Location:** Brand-new file.
- **Dependencies:** None.

### The New Code
```c
#include <pthread.h>
#include <stdio.h>

void *basic_thread(void *arg) {
    printf("Thread running.\n");
    return NULL;
}
```

### The Updated Project
```c
1: #include <pthread.h>
2: #include <stdio.h>
3: 
4: void *basic_thread(void *arg) { // ← new
5:     printf("Thread running.\n"); // ← new
6:     return NULL;                 // ← new
7: }                                // ← new
```
This establishes a basic function matching the signature required by pthreads.

### Mechanical walkthrough
- `#include <pthread.h>` includes the POSIX thread library header.
- `#include <stdio.h>` includes standard I/O for `printf`.
- `void *basic_thread(void *arg)` defines a function that takes a generic `void *` argument and returns a generic `void *` pointer. This is the mandatory signature for any function that a pthread will execute.
- `printf("Thread running.\n");` prints a message to stdout.
- `return NULL;` terminates the thread function, returning a null pointer as its exit status.

### CS lens
The fundamental CS concept is shared-memory concurrency. This appears in real-world systems like database engines handling multiple queries in shared buffer pools, web servers processing simultaneous requests accessing a shared cache, and game engines where a physics thread and a rendering thread read the same game state.

### SE lens
The design principle here is lightweight concurrency. The alternative not chosen is multiprocessing (e.g., `fork()`). The real tradeoff is that while threads share memory (making communication fast and cheap), they require explicit synchronization (like mutexes) to avoid data races, whereas processes are isolated by default but require heavier IPC mechanisms.

### Commands needed
`gcc -lpthread src/threading.c`

### Run it
Predicted confidently: This file alone doesn't have a `main` function yet, so it cannot be run.

### One sentence connecting to previous unit
Now that we understand a thread is an execution context in a shared address space, we need to know how to actually spawn one.

## Concept Unit: pthread_create — creating a thread

### The Problem
We have a function defined for a thread. How do we tell the operating system to allocate a new stack, create a new execution context, and begin running that function concurrently? How do we pass it data safely?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

void *print_number(void *arg) {
    int n = *(int *)arg;
    printf("thread %lu: n = %d\n", pthread_self(), n);
    return NULL;
}

int main(void) {
    pthread_t tids[4];
    int nums[4] = {10, 20, 30, 40};

    for (int i = 0; i < 4; i++) {
        pthread_create(&tids[i], NULL, print_number, &nums[i]);
    }
    for (int i = 0; i < 4; i++) pthread_join(tids[i], NULL);
    return 0;
}
```
This demonstrates **pthread_create**. It proves that multiple threads can be launched concurrently, each receiving a distinct argument safely by passing a pointer to a stable memory location (`&nums[i]`). `pthread_self()` outputs the unique ID for each thread.

### Discard the throwaway
This throwaway example is discarded and will not be in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/threading.c` (modified).
- **Change type:** Add.
- **Location:** Below `basic_thread`.
- **Dependencies:** `basic_thread`.

### The New Code
```c
int run_threads(void) {
    pthread_t tid;
    pthread_create(&tid, NULL, basic_thread, NULL);
    pthread_join(tid, NULL);
    return 0;
}
```

### The Updated Project
```c
1: #include <pthread.h>
2: #include <stdio.h>
3: 
4: void *basic_thread(void *arg) {
5:     printf("Thread running.\n");
6:     return NULL;
7: }
8: 
9: int run_threads(void) {                            // ← new
10:     pthread_t tid;                                // ← new
11:     pthread_create(&tid, NULL, basic_thread, NULL); // ← new
12:     pthread_join(tid, NULL);                      // ← new
13:     return 0;                                     // ← new
14: }                                                 // ← new
```
This adds a controller function that actually creates and waits for a thread.

### Mechanical walkthrough
- `int run_threads(void)` defines a new function.
- `pthread_t tid;` declares a variable to hold the thread identifier.
- `pthread_create(&tid, NULL, basic_thread, NULL);` calls the OS to spawn a thread. It passes the address of `tid` to store the ID, `NULL` for default attributes, `basic_thread` as the function to run, and `NULL` as the argument.
- `pthread_join(tid, NULL);` blocks until the thread `tid` finishes.
- `return 0;` exits the function.

### CS lens
The concept is asynchronous execution. Real-world examples include UI frameworks dispatching heavy work to background threads to keep the interface responsive, background garbage collectors running alongside application code, and asynchronous I/O completion handlers.

### SE lens
The design principle is imperative thread management. The alternative not chosen is a thread pool or an abstraction like futures/promises. The tradeoff is direct control over OS thread creation versus the overhead and complexity of managing individual thread lifecycles manually.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Calling `run_threads()` would print "Thread running." exactly once.

### One sentence connecting to previous unit
Creating a thread is useful, but we need to manage what happens when it finishes.

## Concept Unit: pthread_join and pthread_detach

### The Problem
If a main thread finishes before a child thread, the whole process exits and the child dies abruptly. Conversely, if a child thread finishes and no one collects its exit status, its resources (like its stack) leak. How do we safely wait for a thread, or tell the OS we don't care to wait?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

void *background_task(void *arg) {
    printf("Detached thread.\n");
    return NULL;
}

int main(void) {
    pthread_t tid;
    pthread_create(&tid, NULL, background_task, NULL);
    pthread_detach(tid); 
    return 0;
}
```
This demonstrates **pthread_detach**. It proves a thread can be configured to clean up after itself without a `join`. Since `main` returns immediately, the process might exit before the thread prints anything, showing that detached threads are at the mercy of the process lifetime.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/threading.c` (modified).
- **Change type:** Replace.
- **Location:** Inside `run_threads`.
- **Dependencies:** None.

### The New Code
```c
    pthread_create(&tid, NULL, basic_thread, NULL);
    pthread_detach(tid);
```

### The Updated Project
```c
9: int run_threads(void) {
10:     pthread_t tid;
11:     pthread_create(&tid, NULL, basic_thread, NULL);
12:     pthread_detach(tid); // ← new (replaced join)
13:     return 0;
14: }
```
The thread is now detached instead of joined.

### Mechanical walkthrough
- `pthread_detach(tid);` takes the thread ID `tid` and marks it detached, telling the OS to reclaim its stack and resources as soon as `basic_thread` returns, without requiring a `pthread_join`.

### CS lens
The concept is resource lifecycle management. This appears in file descriptors (closing when no longer needed), network sockets, and dynamic memory allocation.

### SE lens
The principle is fire-and-forget. The alternative is explicit synchronization (joining). The tradeoff is simpler management for purely background tasks versus losing the ability to know when the task finishes or to collect its error code.

### Commands needed
None for this unit.

### Run it
Predicted confidently: If this is run in a fast-exiting program, it might print nothing because the process terminates before the detached thread executes its `printf`.

### One sentence connecting to previous unit
To make threads do useful work, we usually need to pass them complex data.

## Concept Unit: Thread arguments — the heap allocation pattern

### The Problem
If we pass a pointer to a local stack variable into a thread, the thread might read that pointer *after* the calling function has already returned, leading to reading garbage memory (a dangling pointer). How do we safely pass data that outlives the caller's stack frame?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct { int id; } ThreadArgs;

void *worker(void *arg) {
    ThreadArgs *a = arg;
    printf("worker %d\n", a->id);
    free(a); 
    return NULL;
}

int main(void) {
    for (int i = 0; i < 3; i++) {
        ThreadArgs *args = malloc(sizeof(ThreadArgs));
        args->id = i;
        pthread_t tid;
        pthread_create(&tid, NULL, worker, args);
        pthread_detach(tid);
    }
    return 0;
}
```
This demonstrates the **heap allocation pattern for thread arguments**. It proves that by using `malloc`, each thread receives a unique, stable memory address that won't be destroyed when the loop iterates or the function returns. The thread itself takes ownership and calls `free`.

### Discard the throwaway
This throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/threading.c` (modified).
- **Change type:** Add.
- **Location:** Above `basic_thread`.
- **Dependencies:** `stdlib.h` for `malloc`.

### The New Code
```c
#include <stdlib.h>

typedef struct {
    int id;
} ThreadData;

void *advanced_thread(void *arg) {
    ThreadData *data = arg;
    printf("Thread %d running.\n", data->id);
    free(data);
    return NULL;
}
```

### The Updated Project
```c
1: #include <pthread.h>
2: #include <stdio.h>
3: #include <stdlib.h> // ← new
4: 
5: typedef struct {      // ← new
6:     int id;           // ← new
7: } ThreadData;         // ← new
8: 
9: void *advanced_thread(void *arg) {      // ← new
10:     ThreadData *data = arg;            // ← new
11:     printf("Thread %d running.\n", data->id); // ← new
12:     free(data);                        // ← new
13:     return NULL;                       // ← new
14: }                                      // ← new
15: 
16: void *basic_thread(void *arg) {
```
We added a struct and a new thread function that safely consumes heap-allocated arguments.

### Mechanical walkthrough
- `#include <stdlib.h>` includes standard library for malloc/free.
- `typedef struct { int id; } ThreadData;` defines a struct to hold thread arguments.
- `void *advanced_thread(void *arg)` defines a new thread entry point.
- `ThreadData *data = arg;` casts the generic `void *` back to our concrete struct pointer.
- `printf("Thread %d running.\n", data->id);` accesses the struct's member.
- `free(data);` releases the heap memory, completing the transfer of ownership.

### CS lens
The concept is ownership transfer. This appears in Rust's ownership model, passing messages in Actor systems (like Erlang), and network packet buffering where the network stack takes ownership of a buffer provided by the application.

### SE lens
The principle is heap-allocated context. The alternative is carefully synchronizing stack access (which is fragile) or using global variables (which breaks if there are multiple threads). The tradeoff is the performance cost of `malloc` and `free` versus safety and decoupling.

### Commands needed
None for this unit.

### Run it
Predicted confidently: This function, when passed a valid heap-allocated `ThreadData`, will print the ID and free the memory safely.

### One sentence connecting to previous unit
Sometimes we need variables that look like globals but are private to each thread.

## Concept Unit: Thread-local storage — __thread

### The Problem
If multiple threads update a shared global counter, they overwrite each other's changes (a data race). If we want each thread to have its own independent instance of a variable that acts like a global within that thread's functions, how do we do it without passing it down through every function call?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

__thread int tls_counter = 0;

void *increment(void *arg) {
    tls_counter++;
    printf("TLS: %d\n", tls_counter);
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, increment, NULL);
    pthread_create(&t2, NULL, increment, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    return 0;
}
```
This demonstrates **Thread-local storage (TLS)**. It proves that despite being declared globally, `__thread` makes `tls_counter` unique to each thread. Both threads will print `TLS: 1`, rather than one printing `2`, because they do not share the variable.

### Discard the throwaway
This throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/threading.c` (modified).
- **Change type:** Add.
- **Location:** At the top level, below includes.
- **Dependencies:** None.

### The New Code
```c
__thread int thread_id_cache = -1;
```

### The Updated Project
```c
1: #include <pthread.h>
2: #include <stdio.h>
3: #include <stdlib.h>
4: 
5: __thread int thread_id_cache = -1; // ← new
6: 
7: typedef struct {
```
We've added a thread-local variable to safely cache thread-specific data.

### Mechanical walkthrough
- `__thread` is a compiler-specific keyword (in GCC/Clang) that specifies that the variable should have thread-local storage duration.
- `int thread_id_cache = -1;` declares an integer initialized to -1. Each newly created thread gets its own fresh copy of this variable initialized to -1.

### CS lens
The concept is implicit context. Real-world uses include OpenGL state machines (which are thread-local), standard library `errno` in C, and logging frameworks tracking request IDs per thread.

### SE lens
The principle is context isolation without parameter passing. The alternative is passing a context object into every single function (dependency injection). The tradeoff is global-like mutable state (harder to test and reason about) versus cluttering every function signature with thread state.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Accessing `thread_id_cache` from any thread yields its private copy, safely isolated from other threads.

### One sentence connecting to previous unit
Understanding how threads isolate memory leads us to the core issue: what happens when they actually need to share it.

## Closing

### Connect the pieces
Trace two threads running a shared counter through all concept units:
1. We start by realizing a thread is a separate execution path but shares memory space (Unit 1).
2. We use `pthread_create` to spawn two concurrent threads pointing at the same function (Unit 2).
3. We wait for them using `pthread_join` so main doesn't exit early (Unit 3).
4. We pass them distinct IDs via heap-allocated arguments so they know who they are (Unit 4).
5. If they use `__thread` variables, they safely count independently (Unit 5).
However, if they both try to modify a shared global variable *without* TLS, they will step on each other. A thread is a `fork()` without the address-space copy — sharing memory makes communication trivial but makes data safety the programmer's responsibility.

Lesson 36 addresses how to synchronize access to shared mutable data.
