# Lesson 36: Shared Variables and Race Conditions

What you will build:
The reader will understand what a race condition is at the assembly level, why it is non-deterministic, how to identify shared variables, and what a critical section is. The transferable insight: a race condition is not a bug in any single thread — it is a bug in the INTERLEAVING of two correct threads. You can only find it by reasoning about all possible interleavings, not by reading one thread's code.

What you need to know first:
Lessons 00-35.

Terms used in this lesson:
- **Shared variable** — A variable that can be read or written by more than one thread, such as global variables, static local variables, and heap-allocated data. It exists to allow communication between threads, but introduces the risk of data races.
- **Race condition** — A concurrency bug where the output depends on the non-deterministic interleaving of threads. It exists because thread execution is scheduled by the OS, and operations like `++` are not atomic.
- **Interleaving** — The specific sequence in which the OS schedules the instructions of concurrent threads. It exists because multiple threads share CPU cores.
- **Critical section** — A sequence of instructions that must execute atomically with respect to other threads accessing the same shared variable. It solves the problem of data races by enforcing mutual exclusion.
- **ThreadSanitizer** — A compiler instrument and runtime library for detecting data races in C/C++ code. It exists to catch synchronization bugs that are too rare or complex to find through normal testing.
- **Safety** — The property that "nothing bad happens," specifically that at most one thread is in the critical section at a time. It exists to prevent state corruption.
- **Liveness** — The property that "something good eventually happens," specifically that a thread wanting to enter a critical section will eventually do so. It exists to prevent deadlocks and livelocks.
- **Fairness** — The property that no thread waits forever (bounded waiting). It exists to prevent starvation.

Objects and methods used:
- **`pthread_create`**
  - *What it is:* A POSIX thread API function to spawn a new thread.
  - *Implementation:* `int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);`
  - *Its use:* Used to create concurrent execution paths to demonstrate race conditions.
  - *Type:* Free function in the pthread library.
  - *Responsibility:* Allocates resources for a new thread and begins executing `start_routine`.
  - *Depends on:* A valid thread pointer, optional attributes, a function pointer, and an argument pointer.
  - *Connects to:* Calls into the OS kernel to instantiate a thread.
  - *Shape:* A public API surface of the POSIX threads library.
- **`pthread_join`**
  - *What it is:* A POSIX thread API function to wait for thread termination.
  - *Implementation:* `int pthread_join(pthread_t thread, void **retval);`
  - *Its use:* Used to wait for our concurrent threads to finish before printing the final shared variable state.
  - *Type:* Free function in the pthread library.
  - *Responsibility:* Blocks the calling thread until the specified thread terminates, reclaiming its resources.
  - *Depends on:* A valid thread ID.
  - *Connects to:* Interacts with the OS scheduler to block and wake up.
  - *Shape:* A public API surface of the POSIX threads library.

## Concept Unit: Shared variables
### The Problem
How do multiple threads communicate? If two threads need to update the same counter, where does that counter live in memory? What happens if they both try to update it at the exact same time?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

int global = 0;           /* SHARED: .data, one copy */
static int slocal = 0;   /* SHARED: .data, one copy */

void *fn(void *arg) {
    int local = 0;        /* NOT shared: this thread's stack */
    global++;             /* shared: race condition possible */
    slocal++;             /* shared: race condition possible */
    local++;              /* not shared: safe */
    printf("local=%d\n", local);
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, fn, NULL);
    pthread_create(&t2, NULL, fn, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("global=%d (expected 2, actual: 1 or 2)\n", global);
    return 0;
}
```
This output proves global is shared (both threads access the same address) while local is per-thread. This is called a **shared variable**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson — no running project.
- Files affected: `shared_vars.c` (created)
- Change type: add
- Location: entire file
- Dependencies: POSIX threads

### The New Code
```c
#include <pthread.h>
#include <stdio.h>

int global_counter = 0;

void *worker(void *arg) {
    global_counter++;
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, worker, NULL);
    pthread_create(&t2, NULL, worker, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    return 0;
}
```

### The Updated Project
```c
1: #include <pthread.h>
2: #include <stdio.h>
3: 
4: int global_counter = 0; // <- new
5: 
6: void *worker(void *arg) {
7:     global_counter++; // <- new
8:     return NULL;
9: }
10: 
11: int main(void) {
12:     pthread_t t1, t2;
13:     pthread_create(&t1, NULL, worker, NULL); // <- new
14:     pthread_create(&t2, NULL, worker, NULL); // <- new
15:     pthread_join(t1, NULL);
16:     pthread_join(t2, NULL);
17:     return 0;
18: }
```
This file declares a shared counter and spawns two threads that modify it.

### Mechanical walkthrough
- `#include <pthread.h>`: Includes the POSIX thread library.
- `#include <stdio.h>`: Includes the standard input/output library.
- `int global_counter = 0;`: Declares and initializes a global integer. This is a shared variable.
- `void *worker(void *arg) {`: Defines the thread start routine.
- `global_counter++;`: Increments the shared variable.
- `return NULL;`: Exits the thread.
- `int main(void) {`: Main entry point.
- `pthread_t t1, t2;`: Declares thread identifiers.
- `pthread_create(&t1, NULL, worker, NULL);`: Spawns the first thread.
- `pthread_create(&t2, NULL, worker, NULL);`: Spawns the second thread.
- `pthread_join(t1, NULL);`: Waits for the first thread to complete.
- `pthread_join(t2, NULL);`: Waits for the second thread to complete.
- `return 0;`: Returns success from main.

### CS lens
The fundamental CS concept is **Shared Memory**. It appears in database connection pools, multi-core CPU caches, inter-process communication (IPC) via `mmap`, and concurrent web server request handlers.

### SE lens
The design principle is **Global State is Dangerous**. The alternative NOT chosen is passing state explicitly (message passing or actor model). The real tradeoff is performance and ease of access versus the extreme difficulty of reasoning about concurrent mutations.

### Commands needed
`gcc -lpthread shared_vars.c -o shared_vars`

### Run it
The predicted shape of the output (if we printed it) is that the program completes silently, with the counter ending at either 1 or 2, proving the memory is shared.

### One sentence connecting to previous unit
Understanding that memory can be shared leads us to question what happens when multiple threads mutate it simultaneously.

## Concept Unit: Race condition
### The Problem
If `global++` is just one line of C code, how can it fail? Don't computers execute one line at a time? What happens if we run it a million times?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

#define NITERS 1000000
long counter = 0;

void *count_up(void *arg) {
    for (long i = 0; i < NITERS; i++)
        counter++;  /* load, add, store: 3 instructions, not atomic */
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, count_up, NULL);
    pthread_create(&t2, NULL, count_up, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("counter = %ld (expected %d)\n", counter, 2 * NITERS);
    return 0;
}
```
This proves that `counter++` is not atomic and executing it concurrently produces non-deterministic results ranging from 1000000 to 2000000. This is called a **race condition**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson — no running project.
- Files affected: `race.c` (created)
- Change type: add
- Location: entire file
- Dependencies: POSIX threads

### The New Code
```c
/* The race is in the read-modify-write sequence. global++ compiles to THREE instructions: */
/*
movl global(%rip), %eax   # load: read global into register
addl $1, %eax             # modify: add 1 to register
movl %eax, global(%rip)   # store: write register back to global
*/
```

### The Updated Project
```c
1: /* The race is in the read-modify-write sequence. global++ compiles to THREE instructions: */
2: /*
3: movl global(%rip), %eax   # load: read global into register // <- new
4: addl $1, %eax             # modify: add 1 to register // <- new
5: movl %eax, global(%rip)   # store: write register back to global // <- new
6: */
```
This snippet shows the assembly instructions that make up a single C increment, demonstrating where the interleaving occurs.

### Mechanical walkthrough
- `movl global(%rip), %eax`: Reads the value of `global` from memory into the `%eax` CPU register.
- `addl $1, %eax`: Adds literal `1` to the `%eax` register.
- `movl %eax, global(%rip)`: Stores the new value from `%eax` back into the `global` memory address.

### CS lens
The fundamental CS concept is **Atomicity**. It appears in database transactions (ACID properties), file system renames, hardware compare-and-swap instructions, and concurrent data structures.

### SE lens
The design principle is **Non-Determinism is a Bug**. The alternative NOT chosen is writing entirely stateless, functional code. The real tradeoff is that debugging non-deterministic interleavings is nearly impossible, so we must structurally enforce atomicity.

### Commands needed
`gcc -O0 race.c -lpthread -o race`

### Run it
If thread 1 and 2 execute a single iteration, and the interleaving is load1, load2, add1, store1, add2, store2, the final value is 1, not 2. This is the predicted shape of a race failure.

### One sentence connecting to previous unit
Now that we see the assembly-level interleaving that causes a race, we must define the exact boundary that needs protection.

## Concept Unit: Critical sections
### The Problem
If three assembly instructions can be interrupted, how do we stop the OS from context-switching halfway through? Can we just use a boolean flag to lock out the other thread?

### Introduce the concept in isolation
```c
/* Broken attempt using a flag (NOT a real lock -- still a race): */
int lock_flag = 0;
long counter = 0;

void *broken_lock(void *arg) {
    while (lock_flag == 1)  /* spin-wait */
        ;  /* another race: check and set are not atomic */
    lock_flag = 1;  /* RACE: two threads can both pass the while */
    counter++;      /* critical section */
    lock_flag = 0;
    return NULL;
}
```
This proves that fixing a race condition requires hardware support — a true atomic test-and-set instruction. Software-only solutions are not correct without hardware atomics. The area being protected is called a **critical section**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson — no running project.
- Files affected: `critical.c` (created)
- Change type: add
- Location: entire file
- Dependencies: None

### The New Code
```c
/* The critical section in counter++ is: */
/*   load counter                           */
/*   add 1                                  */
/*   store counter                          */
/* All three must be atomic as a unit       */
```

### The Updated Project
```c
1: /* The critical section in counter++ is: */ // <- new
2: /*   load counter                           */ // <- new
3: /*   add 1                                  */ // <- new
4: /*   store counter                          */ // <- new
5: /* All three must be atomic as a unit       */ // <- new
```
This defines the instructions that form the critical section which must not be interleaved.

### Mechanical walkthrough
- `/* The critical section in counter++ is: */`: A comment defining the scope.
- `/*   load counter                           */`: The first conceptual step that reads shared state.
- `/*   add 1                                  */`: The modification step.
- `/*   store counter                          */`: The final conceptual step that writes shared state.
- `/* All three must be atomic as a unit       */`: The fundamental requirement for correctness.

### CS lens
The fundamental CS concept is **Mutual Exclusion**. It appears in database row locking, file locking mechanisms (e.g., `flock`), distributed locks (Redis/ZooKeeper), and OS mutexes.

### SE lens
The design principle is **Encapsulate Concurrency**. The alternative NOT chosen is relying on developers to manually avoid concurrent execution. The real tradeoff is that locks introduce contention and hurt performance to guarantee correctness.

### Commands needed
None.

### Run it
The code is conceptual commentary; the output shape is conceptually an atomic block where no other thread can observe intermediate state.

### One sentence connecting to previous unit
Since we cannot easily spot critical sections by reading C code, we need tooling to detect races for us.

## Concept Unit: Detecting races
### The Problem
If races depend on random OS scheduling, how can we test for them? Do we just run the code a million times and hope it crashes if it's wrong?

### Introduce the concept in isolation
```c
/* Compile with ThreadSanitizer: */
/* gcc -fsanitize=thread -g counter.c -lpthread -o counter_tsan */
/* Run: ./counter_tsan */
/* TSan output (illustrative): */
/*
   WARNING: ThreadSanitizer: data race (pid=1234)
     Write of size 8 at 0x000000601050 by thread T2:
       #0 count_up /path/counter.c:12
     Previous write of size 8 at 0x000000601050 by thread T1:
       #0 count_up /path/counter.c:12
   Location is global variable 'counter' of size 8
*/
```
This proves that tooling can track memory accesses and detect unsynchronized reads/writes dynamically. This tool is called **ThreadSanitizer**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson — no running project.
- Files affected: `tsan_info.txt` (created)
- Change type: add
- Location: entire file
- Dependencies: GCC ThreadSanitizer

### The New Code
```c
/* TSan instruments every memory access at compile time.     */
/* At runtime, it tracks which thread last wrote each byte.  */
/* If two threads access the same byte and one is a write    */
/* without synchronization, TSan reports a data race.        */
/* Overhead: ~5-20x slowdown. Use in testing, not production.*/
```

### The Updated Project
```c
1: /* TSan instruments every memory access at compile time.     */ // <- new
2: /* At runtime, it tracks which thread last wrote each byte.  */ // <- new
3: /* If two threads access the same byte and one is a write    */ // <- new
4: /* without synchronization, TSan reports a data race.        */ // <- new
5: /* Overhead: ~5-20x slowdown. Use in testing, not production.*/ // <- new
```
This defines the runtime semantics and costs of using ThreadSanitizer.

### Mechanical walkthrough
- `/* TSan instruments every memory access at compile time.     */`: Explains the compile-time modification.
- `/* At runtime, it tracks which thread last wrote each byte.  */`: Explains the runtime shadow memory overhead.
- `/* If two threads access the same byte... TSan reports a data race.        */`: The detection condition.
- `/* Overhead: ~5-20x slowdown. Use in testing, not production.*/`: The performance cost of instrumentation.

### CS lens
The fundamental CS concept is **Dynamic Program Analysis**. It appears in memory leak detectors (Valgrind), fuzzers (AFL), code coverage tools, and garbage collection algorithms.

### SE lens
The design principle is **Shift-Left Testing**. The alternative NOT chosen is waiting for a production outage to discover a race condition. The real tradeoff is the massive CPU/memory overhead of TSan versus the confidence it provides.

### Commands needed
`gcc -fsanitize=thread -g counter.c -lpthread -o counter_tsan`

### Run it
The predicted output is a `WARNING: ThreadSanitizer: data race` report detailing the conflicting instruction addresses.

### One sentence connecting to previous unit
Once we detect a race, fixing it requires understanding the three properties of concurrent correctness.

## Concept Unit: Progress, safety, and liveness
### The Problem
If we use locks to stop data races, could we accidentally break the program in a different way? What happens if two threads wait for each other forever?

### Introduce the concept in isolation
```c
void *thread_a(void *arg) {
    /* acquire lock1, then lock2 */
    /* ... */
    return NULL;
}
void *thread_b(void *arg) {
    /* acquire lock2, then lock1 */
    /* Thread A holds lock1, waiting for lock2 */
    /* Thread B holds lock2, waiting for lock1 -> DEADLOCK */
    /* ... */
    return NULL;
}
```
This proves that holding resources while waiting for others can cause the system to freeze entirely. This is called a **deadlock**, which is a violation of liveness.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson — no running project.
- Files affected: `properties.c` (created)
- Change type: add
- Location: entire file
- Dependencies: None

### The New Code
```c
/* Three properties required for correct concurrent programs: */
/*
 * SAFETY (mutex): at most one thread in the critical section at a time.
 *   Violation: data race, corrupted result.
 *
 * LIVENESS (progress): a thread that wants to enter the critical
 *   section must eventually be allowed to do so.
 *   Violation: deadlock (no thread can proceed) or livelock (threads
 *   keep trying but none succeed).
 *
 * FAIRNESS (bounded waiting): no thread waits forever.
 *   Violation: starvation (one thread always loses to others).
 */
```

### The Updated Project
```c
1: /* Three properties required for correct concurrent programs: */
2: /*
3:  * SAFETY (mutex): at most one thread in the critical section at a time. // <- new
4:  *   Violation: data race, corrupted result. // <- new
5:  *
6:  * LIVENESS (progress): a thread that wants to enter the critical // <- new
7:  *   section must eventually be allowed to do so. // <- new
8:  *   Violation: deadlock (no thread can proceed) or livelock (threads // <- new
9:  *   keep trying but none succeed). // <- new
10:  *
11:  * FAIRNESS (bounded waiting): no thread waits forever. // <- new
12:  *   Violation: starvation (one thread always loses to others). // <- new
13:  */
```
This formally defines the criteria for correct concurrent synchronization.

### Mechanical walkthrough
- `/* Three properties required for correct concurrent programs: */`: Introduces the list.
- `/*  * SAFETY (mutex): at most one thread in the critical section at a time. */`: The property that bad things do not happen (no races).
- `/*  *   Violation: data race, corrupted result. */`: The consequence of failing safety.
- `/*  * LIVENESS (progress): a thread that wants to enter the critical */` and `/*  *   section must eventually be allowed to do so. */`: The property that good things eventually happen.
- `/*  *   Violation: deadlock (no thread can proceed) or livelock (threads */` and `/*  *   keep trying but none succeed). */`: The consequence of threads permanently blocking each other.
- `/*  * FAIRNESS (bounded waiting): no thread waits forever. */`: The property preventing infinite wait times for specific threads.
- `/*  *   Violation: starvation (one thread always loses to others). */`: The consequence of unfair scheduling.

### CS lens
The fundamental CS concept is **Concurrency Correctness Properties**. It appears in distributed consensus algorithms (Raft/Paxos), network routing loops, operating system schedulers, and database lock managers.

### SE lens
The design principle is **Safety vs. Liveness Tradeoff**. The alternative NOT chosen is ignoring liveness entirely to guarantee safety (e.g., locking the entire system via a single global lock). The real tradeoff is that fine-grained locking increases the risk of deadlock while global locking destroys performance.

### Commands needed
None.

### Run it
The predicted output for a deadlock trace: Thread A acquires lock1, Thread B acquires lock2. Thread A tries to acquire lock2 -> blocks. Thread B tries to acquire lock1 -> blocks. Neither can proceed. The system is stuck.

### One sentence connecting to previous unit
Now that we have established the rules of safety, liveness, and fairness, we are ready to build the constructs that enforce them.

## Closing
### Connect the pieces
Trace two threads racing on a counter through all concept units: First, they share memory, making them capable of a race condition. Second, they hit the read-modify-write assembly instructions at the same time, interleaving non-deterministically. Third, we define this block of assembly as a critical section that must be protected. Fourth, we can use tools like ThreadSanitizer to dynamically detect if we failed to protect it. Finally, when we design our protection, we must ensure safety (mutual exclusion) without sacrificing liveness (causing a deadlock) or fairness (starving a thread). 

You now understand the problem. Lesson 37 shows the solution: mutexes. A race condition is not a property of any single thread but of the set of all possible interleavings — it only becomes visible when you consider two threads’ instruction streams simultaneously.
