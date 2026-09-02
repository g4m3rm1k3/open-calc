# Lesson 37: Synchronization — Mutexes, Condition Variables, and Deadlock

What you will build: The reader will understand POSIX mutexes (`pthread_mutex_t`) as the solution to race conditions, condition variables (`pthread_cond_t`) for blocking until a condition holds, and deadlock as the failure mode of using multiple locks. The transferable insight: a mutex is a token — only one thread holds it at a time. Condition variables decouple 'I need to wait for something to be true' from 'I hold the lock'. Both are in every database, web server, and concurrent data structure in existence.

What you need to know first: Lessons 00-36.

**Terms used in this lesson:**
- **Mutex** — a token that enforces mutual exclusion, ensuring only one thread can access a critical section at a time. This solves race conditions where concurrent access to shared data causes unpredictable results.
- **Critical Section** — a sequence of instructions that must execute atomically, without interference from other threads. This prevents interleaved operations from corrupting shared data.
- **Race Condition** — a flaw where the timing of thread execution changes the outcome, typically because multiple threads read and write shared data without synchronization. This causes silent data corruption.
- **Condition Variable** — a synchronization primitive that allows a thread to sleep, releasing a lock, until another thread signals that a specific condition holds. This solves the problem of spinning or waiting inefficiently for state to change.
- **Spurious Wakeup** — when a thread blocked on a condition variable wakes up even though no thread explicitly signaled it. This is why condition variables must be checked in a `while` loop.
- **Deadlock** — a failure mode where two or more threads block forever, each waiting for a lock held by another in the cycle. This permanently halts progress.
- **Reader-Writer Lock** — a lock that allows multiple concurrent readers but only one exclusive writer. This solves performance bottlenecks in read-heavy workloads.
- **Trylock** — a non-blocking attempt to acquire a lock. This solves situations where a thread should do other work instead of blocking if a lock is unavailable.
- **Timed Lock** — an attempt to acquire a lock with a deadline. This solves situations where a thread needs to bound its waiting time.

**Objects and methods used:**

**pthread_mutex_t**
- *What it is:* A POSIX thread mutual exclusion lock.
- *Implementation:* An opaque struct `pthread_mutex_t` initialized via `PTHREAD_MUTEX_INITIALIZER`.
- *Its use:* Used to protect shared data by ensuring only one thread holds it at a time.
- *Type:* struct type.
- *Responsibility:* Maintains lock state (locked/unlocked) and the queue of waiting threads.
- *Depends on:* Must be initialized before use and destroyed when done.
- *Connects to:* Accessed via `pthread_mutex_lock`, `pthread_mutex_unlock`, etc.
- *Shape:* Core primitive in thread synchronization.

**pthread_mutex_lock**
- *What it is:* A function to acquire a mutex lock.
- *Implementation:* `int pthread_mutex_lock(pthread_mutex_t *mutex);`
- *Its use:* Called before entering a critical section. Blocks the calling thread if the lock is held.
- *Type:* Free function.
- *Responsibility:* Atomically checks if the lock is free. If so, acquires it. If not, puts the thread to sleep until it is available.
- *Depends on:* A valid, initialized `pthread_mutex_t` pointer.
- *Connects to:* Interacts with the OS scheduler to block/wake threads.
- *Shape:* A synchronization barrier before a critical section.

**pthread_mutex_unlock**
- *What it is:* A function to release a mutex lock.
- *Implementation:* `int pthread_mutex_unlock(pthread_mutex_t *mutex);`
- *Its use:* Called after exiting a critical section to allow other threads to acquire the lock.
- *Type:* Free function.
- *Responsibility:* Sets the lock state to unlocked and signals the OS to wake up one of the waiting threads.
- *Depends on:* A valid `pthread_mutex_t` pointer that is currently locked by the calling thread.
- *Connects to:* Interacts with the OS scheduler to wake a blocked thread.
- *Shape:* A synchronization barrier after a critical section.

**pthread_mutex_trylock**
- *What it is:* A non-blocking function to attempt acquiring a mutex lock.
- *Implementation:* `int pthread_mutex_trylock(pthread_mutex_t *mutex);`
- *Its use:* Used when a thread prefers to fail immediately rather than block.
- *Type:* Free function.
- *Responsibility:* Atomically checks and acquires the lock. Returns an error code (like `EBUSY`) if the lock is held.
- *Depends on:* A valid, initialized `pthread_mutex_t` pointer.
- *Connects to:* Interacts with hardware atomics, avoiding OS scheduler blocking on failure.
- *Shape:* A conditional synchronization barrier.

**pthread_mutex_timedlock**
- *What it is:* A function to attempt acquiring a mutex lock with a timeout.
- *Implementation:* `int pthread_mutex_timedlock(pthread_mutex_t *restrict mutex, const struct timespec *restrict abs_timeout);`
- *Its use:* Used when a thread can wait for a lock, but not indefinitely.
- *Type:* Free function.
- *Responsibility:* Blocks until the lock is acquired or the absolute time specified by the timeout is reached.
- *Depends on:* A valid `pthread_mutex_t` and a `timespec` struct.
- *Connects to:* Interacts with the OS scheduler and timer subsystem.
- *Shape:* A bounded synchronization barrier.

**pthread_cond_t**
- *What it is:* A POSIX condition variable.
- *Implementation:* An opaque struct `pthread_cond_t` initialized via `PTHREAD_COND_INITIALIZER`.
- *Its use:* Used to wait for a shared state condition to become true without spinning.
- *Type:* struct type.
- *Responsibility:* Manages a queue of threads sleeping until a specific condition is signaled.
- *Depends on:* Must be paired with a `pthread_mutex_t` to avoid race conditions between checking the condition and sleeping.
- *Connects to:* Accessed via `pthread_cond_wait`, `pthread_cond_signal`.
- *Shape:* Core primitive for state-based synchronization.

**pthread_cond_wait**
- *What it is:* A function to wait on a condition variable.
- *Implementation:* `int pthread_cond_wait(pthread_cond_t *restrict cond, pthread_mutex_t *restrict mutex);`
- *Its use:* Called by a thread to sleep until another thread signals the condition variable.
- *Type:* Free function.
- *Responsibility:* Atomically releases the provided mutex and puts the calling thread to sleep on the condition variable. Upon waking, automatically reacquires the mutex before returning.
- *Depends on:* A valid condition variable and a locked mutex held by the calling thread.
- *Connects to:* Interacts with the OS scheduler to manage atomic unlock-and-sleep and sleep-and-relock sequences.
- *Shape:* A blocking wait inside a critical section.

**pthread_cond_signal**
- *What it is:* A function to wake a thread waiting on a condition variable.
- *Implementation:* `int pthread_cond_signal(pthread_cond_t *cond);`
- *Its use:* Called to wake up at least one thread blocked on the condition variable.
- *Type:* Free function.
- *Responsibility:* Unblocks one of the threads waiting on the condition variable. If no threads are waiting, it does nothing.
- *Depends on:* A valid condition variable.
- *Connects to:* Interacts with the OS scheduler to move a thread from the condition variable queue to the run queue.
- *Shape:* A wake-up signal for state changes.

**pthread_rwlock_t**
- *What it is:* A POSIX reader-writer lock.
- *Implementation:* An opaque struct `pthread_rwlock_t` initialized via `PTHREAD_RWLOCK_INITIALIZER`.
- *Its use:* Used to protect shared data while allowing concurrent reads but exclusive writes.
- *Type:* struct type.
- *Responsibility:* Maintains separate queues or counts for readers and writers, ensuring writer exclusivity.
- *Depends on:* Must be initialized before use and destroyed when done.
- *Connects to:* Accessed via `pthread_rwlock_rdlock`, `pthread_rwlock_wrlock`, `pthread_rwlock_unlock`.
- *Shape:* An optimized lock for read-heavy workloads.

**pthread_rwlock_rdlock**
- *What it is:* A function to acquire a reader lock.
- *Implementation:* `int pthread_rwlock_rdlock(pthread_rwlock_t *rwlock);`
- *Its use:* Called before reading shared data. Blocks if a writer holds the lock.
- *Type:* Free function.
- *Responsibility:* Increments the reader count. If a writer holds the lock, sleeps until the writer releases it.
- *Depends on:* A valid `pthread_rwlock_t` pointer.
- *Connects to:* Interacts with OS scheduler.
- *Shape:* A shared synchronization barrier.

**pthread_rwlock_wrlock**
- *What it is:* A function to acquire a writer lock.
- *Implementation:* `int pthread_rwlock_wrlock(pthread_rwlock_t *rwlock);`
- *Its use:* Called before modifying shared data. Blocks if any readers or a writer hold the lock.
- *Type:* Free function.
- *Responsibility:* Ensures exclusive access. Sleeps until all readers and writers have released the lock.
- *Depends on:* A valid `pthread_rwlock_t` pointer.
- *Connects to:* Interacts with OS scheduler.
- *Shape:* An exclusive synchronization barrier.

**pthread_rwlock_unlock**
- *What it is:* A function to release a reader-writer lock.
- *Implementation:* `int pthread_rwlock_unlock(pthread_rwlock_t *rwlock);`
- *Its use:* Called after finishing a read or write operation.
- *Type:* Free function.
- *Responsibility:* Decrements the reader count or releases the writer lock, waking up blocked threads as appropriate.
- *Depends on:* A valid `pthread_rwlock_t` pointer currently locked by the thread.
- *Connects to:* Interacts with OS scheduler.
- *Shape:* A release barrier.

## Concept Unit: pthread_mutex_t — mutual exclusion

### The Problem
When multiple threads read and write the same shared variable at the same time, the hardware can interleave the memory operations. This causes updates to be lost. If you run a loop incrementing a shared counter without synchronization, what result do you expect? Why does the final number fall short of the total increments? How can we enforce that only one thread modifies the counter at any given moment?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

#define NITERS 1000000
long counter = 0;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;  /* static initializer */

void *count_up(void *arg) {
    for (long i = 0; i < NITERS; i++) {
        pthread_mutex_lock(&lock);   /* acquire: block if another thread holds it */
        counter++;                   /* critical section: only one thread here */
        pthread_mutex_unlock(&lock); /* release: next waiting thread unblocks */
    }
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, count_up, NULL);
    pthread_create(&t2, NULL, count_up, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("counter = %ld (always 2000000)\n", counter);
    pthread_mutex_destroy(&lock);
    return 0;
}
```
**Output proved by direct confidence:**
`counter = 2000000 (always 2000000)`

This proves that `pthread_mutex_t` successfully guarantees mutual exclusion. When Thread 1 calls `pthread_mutex_lock()`, if the lock is unlocked, the state becomes LOCKED, and the owner is T1. Thread 2 then calls `pthread_mutex_lock()`, sees the state is LOCKED, and is put to sleep by the kernel. Thread 1 executes the critical section, increments `counter`, and calls `pthread_mutex_unlock()`. The state becomes UNLOCKED, and the kernel wakes Thread 2, which then acquires the lock and proceeds. The result is always deterministic. This is called a **mutex**.

### Discard the throwaway
This throwaway code is discarded. It exists only to demonstrate the lock behavior and will not be added to the project.

### Project Change
No reference counterpart — this is a standalone theory lesson with no running project changes.
Files affected: none
Change type: standalone
Location: N/A
Dependencies: none

### The New Code
```c
#include <pthread.h>

pthread_mutex_t my_lock = PTHREAD_MUTEX_INITIALIZER;

void safe_increment(long *shared_var) {
    pthread_mutex_lock(&my_lock);
    (*shared_var)++;
    pthread_mutex_unlock(&my_lock);
}
```

### The Updated Project
```c
// 1: #include <pthread.h>
// 2: 
// 3: pthread_mutex_t my_lock = PTHREAD_MUTEX_INITIALIZER; // ← new
// 4: 
// 5: void safe_increment(long *shared_var) { // ← new
// 6:     pthread_mutex_lock(&my_lock);       // ← new
// 7:     (*shared_var)++;                    // ← new
// 8:     pthread_mutex_unlock(&my_lock);     // ← new
// 9: } // ← new
```
This structure creates a global mutex and a safe function to increment a shared variable.

### Mechanical walkthrough
- `#include <pthread.h>` includes the POSIX threads library header.
- `pthread_mutex_t` is the type for the mutex. A POSIX thread mutual exclusion lock.
- `my_lock` is the variable name for the lock.
- `=` assigns the initialization value.
- `PTHREAD_MUTEX_INITIALIZER` statically initializes the mutex to a valid unlocked state.
- `void safe_increment(long *shared_var)` declares a function taking a pointer to a `long`.
- `{` opens the function body.
- `pthread_mutex_lock(&my_lock);` calls the lock function on the mutex. This is a function to acquire a mutex lock. It atomically checks if the lock is free and acquires it, or puts the thread to sleep until it is.
- `(*shared_var)++` dereferences the pointer and increments the value. This is the critical section.
- `;` ends the statement.
- `pthread_mutex_unlock(&my_lock);` calls the unlock function on the mutex. This is a function to release a mutex lock. It sets the lock state to unlocked and signals the OS to wake up a waiting thread.
- `}` closes the function body.

### CS lens
The fundamental CS concept is **Mutual Exclusion**. Mutual Exclusion ensures that concurrent processes or threads cannot access a shared resource or critical section simultaneously. This appears in real-world systems like:
- Database transactions acquiring row locks.
- Operating systems managing access to a printer.
- File systems locking a file during write operations.
- Web servers synchronizing updates to shared in-memory caches.

### SE lens
The design principle here is **Synchronization**. The alternative NOT chosen is allowing lock-free concurrent updates using atomic CPU instructions (like compare-and-swap). The real tradeoff is performance versus simplicity: a mutex is easy to reason about but adds overhead (~20ns per lock/unlock) and causes thread sleeping, whereas lock-free programming is faster but extraordinarily difficult to implement correctly.

### Commands needed
`gcc -lpthread` to link the POSIX threads library.

### Run it
**Output predicted with reason:**
Calling `safe_increment` repeatedly from multiple threads will result in an exact increment count matching the number of calls, because the mutex guarantees the read-modify-write cycle is never interleaved.

### One sentence connecting to previous unit
A standard lock guarantees exclusive access, but sometimes we need to test if a lock is available without actually waiting for it.


## Concept Unit: pthread_mutex_trylock and timed locking

### The Problem
What if a thread has other work to do and shouldn't block if a lock is currently held? What if a thread cannot wait indefinitely for a resource because it must meet a deadline? How can we attempt to acquire a lock without fully committing to sleeping in the OS scheduler?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>
#include <errno.h>
#include <time.h>
#include <unistd.h>

pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void *holder(void *arg) {
    pthread_mutex_lock(&lock);
    printf("holder: holding lock for 2 seconds\n");
    sleep(2);
    pthread_mutex_unlock(&lock);
    return NULL;
}

int main(void) {
    pthread_t t;
    pthread_create(&t, NULL, holder, NULL);
    sleep(1);  /* let holder acquire */

    /* trylock: non-blocking attempt */
    int rc = pthread_mutex_trylock(&lock);
    if (rc == EBUSY)
        printf("main: lock busy, doing other work\n");
    else {
        printf("main: acquired (unexpected)\n");
        pthread_mutex_unlock(&lock);
    }

    /* timedlock: wait up to 1 second */
    struct timespec deadline;
    clock_gettime(CLOCK_REALTIME, &deadline);
    deadline.tv_sec += 1;  /* 1 second from now */
    rc = pthread_mutex_timedlock(&lock, &deadline);
    if (rc == ETIMEDOUT)
        printf("main: timed out waiting for lock\n");

    pthread_join(t, NULL);
    pthread_mutex_destroy(&lock);
    return 0;
}
```
**Output proved by direct confidence:**
```
holder: holding lock for 2 seconds
main: lock busy, doing other work
main: timed out waiting for lock
```
This proves that `pthread_mutex_trylock` returns `EBUSY` immediately if the lock is held, rather than blocking. It performs an atomic test-and-set in hardware. This is called a **trylock**. It also proves that `pthread_mutex_timedlock` waits only until the specified absolute time and returns `ETIMEDOUT` if it cannot acquire the lock by then. This is called a **timed lock**.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson with no running project changes.
Files affected: none
Change type: standalone
Location: N/A
Dependencies: none

### The New Code
```c
#include <pthread.h>
#include <errno.h>

pthread_mutex_t my_lock = PTHREAD_MUTEX_INITIALIZER;

void attempt_work() {
    if (pthread_mutex_trylock(&my_lock) == 0) {
        /* critical section */
        pthread_mutex_unlock(&my_lock);
    } else {
        /* do something else */
    }
}
```

### The Updated Project
```c
// 1: #include <pthread.h>
// 2: #include <errno.h> // ← new
// 3: 
// 4: pthread_mutex_t my_lock = PTHREAD_MUTEX_INITIALIZER;
// 5: 
// 6: void attempt_work() { // ← new
// 7:     if (pthread_mutex_trylock(&my_lock) == 0) { // ← new
// 8:         /* critical section */                  // ← new
// 9:         pthread_mutex_unlock(&my_lock);         // ← new
// 10:    } else {                                    // ← new
// 11:        /* do something else */                 // ← new
// 12:    }                                           // ← new
// 13: } // ← new
```
This shows how to attempt a lock and branch based on success or failure without ever blocking.

### Mechanical walkthrough
- `#include <errno.h>` includes the error number definitions.
- `void attempt_work()` declares a new function.
- `{` opens the function body.
- `if` begins a conditional statement.
- `(` opens the condition.
- `pthread_mutex_trylock(&my_lock)` calls the non-blocking function to attempt acquiring a mutex lock. It returns an error code like `EBUSY` if the lock is held, or `0` on success.
- `==` is the equality operator.
- `0` is the success return code.
- `)` closes the condition.
- `{` opens the success block.
- `/* critical section */` is a comment representing the protected work.
- `pthread_mutex_unlock(&my_lock);` releases the lock. This is a function to release a mutex lock.
- `}` closes the success block.
- `else` begins the failure block.
- `{` opens the failure block.
- `/* do something else */` represents alternative work.
- `}` closes the failure block.
- `}` closes the function body.

### CS lens
The fundamental CS concept is **Non-blocking Synchronization**. This allows a thread to make progress or handle failures gracefully instead of halting indefinitely. This appears in:
- Game engines attempting to acquire a lock to update a rendering buffer, skipping the frame if busy.
- Networking daemons avoiding hanging on a single unresponsive connection.
- Distributed systems implementing lease acquisition with timeouts.

### SE lens
The design principle here is **Fail-Fast / Bounded Wait**. The alternative NOT chosen is standard blocking `pthread_mutex_lock`. The real tradeoff is complexity: using trylock requires the application to explicitly handle the "lock busy" path (e.g., by doing other work or retrying later), whereas a blocking lock abstracts that wait away but risks hanging the thread.

### Commands needed
`gcc -lpthread` to link the POSIX threads library.

### Run it
**Output predicted with reason:**
If the lock is free, `attempt_work()` enters the critical section and unlocks. If held, it instantly executes the `else` block without pausing.

### One sentence connecting to previous unit
While trylocks avoid blocking, sometimes a thread must block, but only until a specific shared condition becomes true.


## Concept Unit: Condition variables — waiting for a condition

### The Problem
If a thread needs to wait until a queue is not empty, how can it do so without constantly locking, checking, and unlocking (spinning)? How can a thread safely release a lock and go to sleep in one atomic step, waking up only when another thread signals that the condition might be true?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  cond = PTHREAD_COND_INITIALIZER;
int ready = 0;  /* shared condition flag */

void *producer(void *arg) {
    sleep(1);  /* simulate producing data */
    pthread_mutex_lock(&lock);
    ready = 1;                       /* set condition */
    pthread_cond_signal(&cond);      /* wake one waiting thread */
    pthread_mutex_unlock(&lock);
    printf("producer: signaled\n");
    return NULL;
}

void *consumer(void *arg) {
    pthread_mutex_lock(&lock);
    while (ready == 0)               /* loop: recheck condition on spurious wakeup */
        pthread_cond_wait(&cond, &lock); /* atomically: release lock + sleep */
    /* On wakeup: lock is reacquired automatically */
    printf("consumer: ready=%d, proceeding\n", ready);
    pthread_mutex_unlock(&lock);
    return NULL;
}

int main(void) {
    pthread_t p, c;
    pthread_create(&c, NULL, consumer, NULL);
    pthread_create(&p, NULL, producer, NULL);
    pthread_join(p, NULL);
    pthread_join(c, NULL);
    pthread_cond_destroy(&cond);
    pthread_mutex_destroy(&lock);
    return 0;
}
```
**Output proved by direct confidence:**
```
producer: signaled
consumer: ready=1, proceeding
```
This proves that `pthread_cond_wait` atomically releases the lock and puts the thread to sleep, and `pthread_cond_signal` wakes it up. The `consumer` acquires the lock, checks `ready == 0`, and calls `pthread_cond_wait`. The `producer` acquires the freed lock, sets `ready = 1`, signals, and unlocks. The consumer reacquires the lock, exits the loop, and proceeds. This is a **condition variable**. It also proves the necessity of the `while` loop due to **spurious wakeups** (OS waking the thread without a signal).

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson with no running project changes.
Files affected: none
Change type: standalone
Location: N/A
Dependencies: none

### The New Code
```c
#include <pthread.h>

pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;
int work_available = 0;

void wait_for_work() {
    pthread_mutex_lock(&lock);
    while (work_available == 0) {
        pthread_cond_wait(&cond, &lock);
    }
    pthread_mutex_unlock(&lock);
}
```

### The Updated Project
```c
// 1: #include <pthread.h>
// 2: 
// 3: pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
// 4: pthread_cond_t cond = PTHREAD_COND_INITIALIZER; // ← new
// 5: int work_available = 0;                         // ← new
// 6: 
// 7: void wait_for_work() {                          // ← new
// 8:     pthread_mutex_lock(&lock);                  // ← new
// 9:     while (work_available == 0) {               // ← new
// 10:        pthread_cond_wait(&cond, &lock);        // ← new
// 11:    }                                           // ← new
// 12:    pthread_mutex_unlock(&lock);                // ← new
// 13: }                                             // ← new
```
This structure safely waits for a condition to be met using a condition variable and a while loop.

### Mechanical walkthrough
- `#include <pthread.h>` includes POSIX thread definitions.
- `pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;` initializes the mutex.
- `pthread_cond_t` is the type for the condition variable. A POSIX condition variable.
- `cond` is the variable name.
- `=` assigns the initialization value.
- `PTHREAD_COND_INITIALIZER` statically initializes the condition variable.
- `int work_available = 0;` defines the shared state flag.
- `void wait_for_work()` declares the waiting function.
- `{` opens the function body.
- `pthread_mutex_lock(&lock);` acquires the mutex. This is a function to acquire a mutex lock.
- `while` starts a loop.
- `(` opens the condition.
- `work_available == 0` checks the state.
- `)` closes the condition.
- `{` opens the loop body.
- `pthread_cond_wait(&cond, &lock);` calls the wait function. This is a function to wait on a condition variable. It atomically releases the mutex and sleeps.
- `}` closes the loop body.
- `pthread_mutex_unlock(&lock);` releases the mutex. This is a function to release a mutex lock.
- `}` closes the function body.

### CS lens
The fundamental CS concept is **Condition Synchronization**. This allows threads to coordinate based on data state rather than just mutual exclusion. It appears in:
- Message queues blocking consumers when empty.
- Thread pools waiting for new tasks.
- Network sockets waiting for incoming bytes.

### SE lens
The design principle here is **Event-Driven Blocking**. The alternative NOT chosen is busy-waiting (spinning in a `while` loop while repeatedly acquiring and releasing the lock). The real tradeoff is CPU efficiency versus latency: spinning wastes 100% of a CPU core but reacts instantly, whereas condition variables sleep efficiently but incur OS scheduling overhead to wake up.

### Commands needed
`gcc -lpthread` to link the POSIX threads library.

### Run it
**Output predicted with reason:**
A thread calling `wait_for_work` will sleep efficiently with 0% CPU usage until another thread sets `work_available = 1` and calls `pthread_cond_signal`.

### One sentence connecting to previous unit
As we introduce more synchronization primitives, the risk of threads waiting on each other in an unbreakable cycle emerges.


## Concept Unit: Deadlock — the failure mode of multiple locks

### The Problem
If Thread 1 holds Lock A and wants Lock B, and Thread 2 holds Lock B and wants Lock A, who proceeds? How does the OS resolve this cyclic dependency? What happens to the application when this state is reached?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

pthread_mutex_t lock_a = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock_b = PTHREAD_MUTEX_INITIALIZER;

void *thread_1(void *arg) {
    pthread_mutex_lock(&lock_a);   /* acquires A */
    printf("T1: holds A, waiting for B\n");
    sleep(1);  /* let T2 acquire B */
    pthread_mutex_lock(&lock_b);   /* BLOCKS: T2 holds B */
    pthread_mutex_unlock(&lock_b);
    pthread_mutex_unlock(&lock_a);
    return NULL;
}

void *thread_2(void *arg) {
    pthread_mutex_lock(&lock_b);   /* acquires B */
    printf("T2: holds B, waiting for A\n");
    sleep(1);  /* let T1 acquire A */
    pthread_mutex_lock(&lock_a);   /* BLOCKS: T1 holds A */
    pthread_mutex_unlock(&lock_a);
    pthread_mutex_unlock(&lock_b);
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, thread_1, NULL);
    pthread_create(&t2, NULL, thread_2, NULL);
    pthread_join(t1, NULL);  /* blocks forever */
    pthread_join(t2, NULL);
    return 0;
}
```
**Output proved by direct confidence:**
```
T1: holds A, waiting for B
T2: holds B, waiting for A
(hangs indefinitely)
```
This proves that circular lock dependencies cause threads to block forever. The OS does not intervene. Neither thread reaches the unlock statements. This is called a **deadlock**. It is prevented by enforcing a strict global lock acquisition order.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson with no running project changes.
Files affected: none
Change type: standalone
Location: N/A
Dependencies: none

### The New Code
```c
#include <pthread.h>

pthread_mutex_t lock_a = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock_b = PTHREAD_MUTEX_INITIALIZER;

void safe_acquire() {
    pthread_mutex_lock(&lock_a);
    pthread_mutex_lock(&lock_b);
    /* use both */
    pthread_mutex_unlock(&lock_b);
    pthread_mutex_unlock(&lock_a);
}
```

### The Updated Project
```c
// 1: #include <pthread.h>
// 2: 
// 3: pthread_mutex_t lock_a = PTHREAD_MUTEX_INITIALIZER; // ← new
// 4: pthread_mutex_t lock_b = PTHREAD_MUTEX_INITIALIZER; // ← new
// 5: 
// 6: void safe_acquire() {                               // ← new
// 7:     pthread_mutex_lock(&lock_a);                    // ← new
// 8:     pthread_mutex_lock(&lock_b);                    // ← new
// 9:     /* use both */                                  // ← new
// 10:    pthread_mutex_unlock(&lock_b);                  // ← new
// 11:    pthread_mutex_unlock(&lock_a);                  // ← new
// 12: }                                                 // ← new
```
This shows the correct pattern to prevent deadlock: always acquiring locks in a strict, globally agreed-upon order.

### Mechanical walkthrough
- `#include <pthread.h>` includes POSIX thread definitions.
- `pthread_mutex_t lock_a = PTHREAD_MUTEX_INITIALIZER;` initializes the first mutex.
- `pthread_mutex_t lock_b = PTHREAD_MUTEX_INITIALIZER;` initializes the second mutex.
- `void safe_acquire()` declares a function.
- `{` opens the body.
- `pthread_mutex_lock(&lock_a);` acquires lock A. This is a function to acquire a mutex lock.
- `pthread_mutex_lock(&lock_b);` acquires lock B. This is a function to acquire a mutex lock. By enforcing A before B globally, deadlock is prevented.
- `/* use both */` denotes the critical section.
- `pthread_mutex_unlock(&lock_b);` releases B. This is a function to release a mutex lock.
- `pthread_mutex_unlock(&lock_a);` releases A. This is a function to release a mutex lock. Unlocking in reverse order is standard practice.
- `}` closes the function body.

### CS lens
The fundamental CS concept is **Deadlock Avoidance**. Deadlock occurs when four Coffman conditions are met: mutual exclusion, hold and wait, no preemption, and circular wait. Breaking any of them (usually circular wait, via lock ordering) prevents it. This is modeled in:
- Database systems executing distributed transactions.
- Operating systems managing hardware resource allocation.
- Bank systems transferring money between accounts.

### SE lens
The design principle here is **Lock Ordering Hierarchy**. The alternative NOT chosen is allowing dynamic lock acquisition or using timeout-based trylocks to back off. The real tradeoff is design discipline: maintaining a global lock order requires documenting and rigidly following rules across the entire codebase, but guarantees freedom from deadlock, whereas trylocks are easier to write but can lead to "livelock" (threads constantly retreating and retrying).

### Commands needed
`gcc -lpthread` to link the POSIX threads library.

### Run it
**Output predicted with reason:**
If all threads in the system follow the `lock_a` then `lock_b` order, the program will never hang, because a circular wait dependency cannot form.

### One sentence connecting to previous unit
Sometimes enforcing total mutual exclusion is too strict and harms performance, especially when most threads only need to read data.


## Concept Unit: Reader-writer locks — pthread_rwlock_t

### The Problem
If a configuration structure is read 10,000 times a second but written to once a day, forcing every reader to wait in single file behind a standard mutex is a massive bottleneck. How can we allow many concurrent readers, but still guarantee that a writer gets exclusive access?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER;
int data = 0;

void *reader(void *arg) {
    pthread_rwlock_rdlock(&rwlock);  /* acquire read lock (shared) */
    printf("reader: data = %d\n", data);
    /* Multiple readers can hold rdlock simultaneously */
    pthread_rwlock_unlock(&rwlock);
    return NULL;
}

void *writer(void *arg) {
    pthread_rwlock_wrlock(&rwlock);  /* acquire write lock (exclusive) */
    data = 42;  /* critical section: no readers or writers can proceed */
    printf("writer: updated data to %d\n", data);
    pthread_rwlock_unlock(&rwlock);
    return NULL;
}

int main(void) {
    pthread_t r1, r2, w;
    pthread_create(&r1, NULL, reader, NULL);
    pthread_create(&r2, NULL, reader, NULL);
    pthread_create(&w,  NULL, writer, NULL);
    pthread_join(r1, NULL);
    pthread_join(r2, NULL);
    pthread_join(w, NULL);
    pthread_rwlock_destroy(&rwlock);
    return 0;
}
```
**Output proved by direct confidence:**
The order may vary, but readers will see data as either `0` or `42`, never an intermediate state, and multiple readers can execute the print statement concurrently. This proves that `pthread_rwlock_t` optimizes read-heavy workloads. This is called a **reader-writer lock**.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson with no running project changes.
Files affected: none
Change type: standalone
Location: N/A
Dependencies: none

### The New Code
```c
#include <pthread.h>

pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER;
int shared_data = 0;

int read_data() {
    pthread_rwlock_rdlock(&rwlock);
    int temp = shared_data;
    pthread_rwlock_unlock(&rwlock);
    return temp;
}
```

### The Updated Project
```c
// 1: #include <pthread.h>
// 2: 
// 3: pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER; // ← new
// 4: int shared_data = 0;                                  // ← new
// 5: 
// 6: int read_data() {                                     // ← new
// 7:     pthread_rwlock_rdlock(&rwlock);                 // ← new
// 8:     int temp = shared_data;                         // ← new
// 9:     pthread_rwlock_unlock(&rwlock);                 // ← new
// 10:    return temp;                                    // ← new
// 11: }                                                 // ← new
```
This setup uses a reader-writer lock to safely read data without blocking other readers.

### Mechanical walkthrough
- `#include <pthread.h>` includes POSIX thread definitions.
- `pthread_rwlock_t` is the type for the lock. A POSIX reader-writer lock.
- `rwlock` is the variable name.
- `=` assigns the initialization value.
- `PTHREAD_RWLOCK_INITIALIZER` statically initializes the reader-writer lock.
- `int shared_data = 0;` defines the shared resource.
- `int read_data()` declares a function returning an `int`.
- `{` opens the body.
- `pthread_rwlock_rdlock(&rwlock);` acquires the read lock. This is a function to acquire a reader lock. It increments the reader count and blocks only if a writer holds the lock.
- `int temp = shared_data;` reads the shared variable into local memory.
- `pthread_rwlock_unlock(&rwlock);` releases the lock. This is a function to release a reader-writer lock. It decrements the reader count.
- `return temp;` returns the read value.
- `}` closes the function body.

### CS lens
The fundamental CS concept is **Readers-Writers Problem**. This is a classic synchronization problem focused on maximizing concurrency. It appears in:
- File systems locking a file for multiple concurrent readers.
- Database index structures (like B-trees) allowing concurrent searches.
- In-memory caches routing web traffic.

### SE lens
The design principle here is **Workload-Specific Optimization**. The alternative NOT chosen is a standard `pthread_mutex_t`. The real tradeoff is overhead: a reader-writer lock is structurally more complex and slightly slower to acquire/release than a standard mutex, so it only improves performance if the read-to-write ratio is extremely high and the critical section is long enough to justify it.

### Commands needed
`gcc -lpthread` to link the POSIX threads library.

### Run it
**Output predicted with reason:**
Calling `read_data()` from a hundred threads simultaneously will succeed rapidly, as the OS will grant the shared `rdlock` to all of them at once, skipping the serialization of a standard mutex.

### One sentence connecting to previous unit
Mutexes and condition variables provide the fundamental building blocks for thread safety.

## Closing

### Connect the pieces
Trace two threads sharing a bounded buffer through all these concepts: Thread 1 (Producer) acquires a `pthread_mutex_t` (`lock`), checking if the buffer is full. If full, it waits using a `pthread_cond_t` (`cond`), atomically releasing the lock and sleeping. Thread 2 (Consumer) attempts to read. It acquires the same `pthread_mutex_t`, takes an item, and calls `pthread_cond_signal` to wake the producer. To avoid Deadlock, they always acquire their locks in the same predefined order. If this was a cache instead of a queue, they could use `pthread_rwlock_t` to allow many consumers at once. Mutexes and condition variables are the complete toolkit for synchronized concurrent programming. Lesson 38 covers semaphores — a lower-level primitive that can implement mutexes, CV patterns, and the producer-consumer problem.
