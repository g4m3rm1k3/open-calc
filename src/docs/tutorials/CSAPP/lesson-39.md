# Lesson 39: Thread Safety, Reentrancy, and Deadlock Prevention

What you will build: The reader will understand the four classes of thread-unsafe functions, what reentrant means and why it is stronger than thread-safe, and how to prevent deadlock using lock ordering and trylock strategies. The transferable insight: most standard C library functions are NOT thread-safe. Knowing which functions use hidden shared state (strtok, rand, strerror, gethostbyname) is essential before using them in multi-threaded programs.

What you need to know first: Lessons 00-38.

**Terms used in this lesson**
- **Thread-safe** — A property of a function where it works correctly when called concurrently by multiple threads, often achieved by protecting shared state with a mutex.
- **Reentrant** — A stronger property than thread-safe where a function can be safely interrupted and called again (e.g., from a signal handler or recursive call) before the first call returns, without requiring locks, because it relies on no shared state.
- **Deadlock** — A situation where two or more threads are blocked forever, waiting for each other to release locks, forming a cycle in the lock wait graph.
- **Lock wait graph** — A theoretical directed graph representing threads and the locks they are holding or waiting for; a cycle in this graph means deadlock has occurred.
- **Lock ordering** — A deadlock prevention strategy that imposes a strict global order in which multiple locks must be acquired by any thread.
- **Trylock** — A non-blocking lock acquisition function that returns immediately with an error if the lock is already held, used with a backoff strategy to prevent deadlock.
- **Backoff** — A technique where a thread that fails to acquire a lock releases its held locks and sleeps for a brief time before retrying, reducing contention.

**Objects and methods used**
- **strtok**
  - *What it is:* A standard C library function for tokenizing strings.
  - *Implementation:* `char *strtok(char *str, const char *delim);`
  - *Its use:* To split a string into tokens based on delimiters. Unsafe in multi-threaded contexts due to internal static state.
  - *Type:* Standard C library function.
  - *Responsibility:* Parses tokens from a string across successive calls.
  - *Depends on:* An input string, a delimiter string, and hidden static memory.
  - *Connects to:* Internal static buffer to remember the position between calls.
  - *Shape:* A stateful parsing utility.
- **strtok_r**
  - *What it is:* The reentrant version of `strtok`.
  - *Implementation:* `char *strtok_r(char *str, const char *delim, char **saveptr);`
  - *Its use:* To safely tokenize strings in multi-threaded applications.
  - *Type:* POSIX standard C library function.
  - *Responsibility:* Parses tokens using a caller-provided pointer to track state.
  - *Depends on:* An input string, delimiters, and a caller-managed `saveptr`.
  - *Connects to:* Caller's stack or heap memory via `saveptr`.
  - *Shape:* A stateless (to the library) parsing utility.
- **strerror**
  - *What it is:* A standard C library function that returns a string describing an error number.
  - *Implementation:* `char *strerror(int errnum);`
  - *Its use:* To convert `errno` values into human-readable strings. Unsafe due to static buffer.
  - *Type:* Standard C library function.
  - *Responsibility:* Maps an integer error code to a descriptive string message.
  - *Depends on:* An integer error number.
  - *Connects to:* Internal static buffer containing the generated string.
  - *Shape:* An error reporting utility.
- **strerror_r**
  - *What it is:* The thread-safe/reentrant version of `strerror`.
  - *Implementation:* `int strerror_r(int errnum, char *buf, size_t buflen);`
  - *Its use:* To safely get error strings by writing them into a caller-provided buffer.
  - *Type:* POSIX standard C library function.
  - *Responsibility:* Writes the error description into the provided buffer.
  - *Depends on:* Error number, destination buffer, and buffer length.
  - *Connects to:* Caller's allocated memory buffer.
  - *Shape:* An error reporting utility.
- **pthread_mutex_lock**
  - *What it is:* A function to acquire a mutex lock.
  - *Implementation:* `int pthread_mutex_lock(pthread_mutex_t *mutex);`
  - *Its use:* To protect critical sections by blocking until the lock is available.
  - *Type:* POSIX Threads API function.
  - *Responsibility:* Grants exclusive access to the thread that successfully acquires the mutex.
  - *Depends on:* An initialized `pthread_mutex_t` pointer.
  - *Connects to:* The OS thread scheduler.
  - *Shape:* A concurrency synchronization primitive.
- **pthread_mutex_trylock**
  - *What it is:* A non-blocking variant of mutex lock acquisition.
  - *Implementation:* `int pthread_mutex_trylock(pthread_mutex_t *mutex);`
  - *Its use:* To attempt to acquire a lock without blocking if it's already held.
  - *Type:* POSIX Threads API function.
  - *Responsibility:* Immediately returns success if the lock is acquired, or an error (EBUSY) if held by another thread.
  - *Depends on:* An initialized `pthread_mutex_t` pointer.
  - *Connects to:* The OS thread scheduler.
  - *Shape:* A non-blocking synchronization primitive.
- **pthread_mutex_unlock**
  - *What it is:* A function to release a held mutex lock.
  - *Implementation:* `int pthread_mutex_unlock(pthread_mutex_t *mutex);`
  - *Its use:* To exit a critical section and allow other threads to acquire the lock.
  - *Type:* POSIX Threads API function.
  - *Responsibility:* Frees the mutex so waiting threads can proceed.
  - *Depends on:* A `pthread_mutex_t` pointer currently held by the calling thread.
  - *Connects to:* The OS thread scheduler to wake up waiting threads.
  - *Shape:* A concurrency synchronization primitive.
- **pthread_mutex_destroy**
  - *What it is:* A function to destroy an initialized mutex.
  - *Implementation:* `int pthread_mutex_destroy(pthread_mutex_t *mutex);`
  - *Its use:* To clean up resources associated with a mutex when it is no longer needed.
  - *Type:* POSIX Threads API function.
  - *Responsibility:* Invalidates the mutex object and frees any underlying resources.
  - *Depends on:* An initialized, unlocked `pthread_mutex_t` pointer.
  - *Connects to:* OS resource management.
  - *Shape:* A resource cleanup function.
- **pthread_create**
  - *What it is:* A function to spawn a new thread.
  - *Implementation:* `int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);`
  - *Its use:* To begin execution of a function concurrently.
  - *Type:* POSIX Threads API function.
  - *Responsibility:* Creates a new OS-level thread executing the specified start routine.
  - *Depends on:* A thread identifier pointer, attributes, function pointer, and argument.
  - *Connects to:* The OS thread creation syscalls.
  - *Shape:* Thread lifecycle management.
- **pthread_join**
  - *What it is:* A function to wait for a thread to terminate.
  - *Implementation:* `int pthread_join(pthread_t thread, void **retval);`
  - *Its use:* To synchronize with the completion of a thread and reap its resources.
  - *Type:* POSIX Threads API function.
  - *Responsibility:* Blocks the caller until the specified thread exits.
  - *Depends on:* A valid thread identifier.
  - *Connects to:* The OS thread scheduler.
  - *Shape:* Thread lifecycle management.
- **usleep**
  - *What it is:* A function to suspend execution for microsecond intervals.
  - *Implementation:* `int usleep(useconds_t usec);`
  - *Its use:* To introduce a brief backoff delay when trylock fails.
  - *Type:* POSIX standard C library function.
  - *Responsibility:* Yields the CPU and sleeps for the specified time.
  - *Depends on:* A duration in microseconds.
  - *Connects to:* OS timer and scheduler.
  - *Shape:* A timing control function.
- **malloc**
  - *What it is:* A function to allocate dynamic memory on the heap.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* To illustrate a standard library function that is implemented in a thread-safe manner (in glibc).
  - *Type:* Standard C library function.
  - *Responsibility:* Provisions a block of memory of the requested size.
  - *Depends on:* An allocation size in bytes.
  - *Connects to:* The OS memory allocator (e.g., `sbrk` or `mmap`).
  - *Shape:* Memory management utility.

## Concept Unit: The four classes of thread-unsafe functions

### The Problem
When building concurrent programs, we often reach for standard library functions to parse strings or format errors. But what happens if two threads call the same library function at the exact same time?
- If a function keeps track of where it left off using a hidden static variable, what happens when thread B calls it before thread A finishes its work?
- If a function returns a pointer to a single internal buffer, whose data does that buffer contain when multiple threads use it simultaneously?
- How can we know which standard library functions are safe to use in a multithreaded environment?

### Introduce the concept in isolation
```c
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

/* CLASS 2: strtok() keeps state in a static internal pointer */
void class2_demo(void) {
    char s1[] = "hello world";
    char s2[] = "foo bar";
    /* UNSAFE in threads: */
    char *tok = strtok(s1, " "); /* sets internal static ptr into s1 */
    /* If another thread calls strtok here, the static ptr is overwritten */
    printf("tok: %s\n", tok);   /* hello */
    tok = strtok(NULL, " ");    /* uses SAME static ptr */
    printf("tok: %s\n", tok);   /* world */
}

/* Thread-safe version: strtok_r (reentrant) */
void class2_fixed(void) {
    char s1[] = "hello world";
    char *saveptr;  /* caller provides state storage: no hidden shared state */
    char *tok = strtok_r(s1, " ", &saveptr);  /* stores state in saveptr */
    printf("tok: %s\n", tok);   /* hello */
    tok = strtok_r(NULL, " ", &saveptr);  /* continues from saveptr */
    printf("tok: %s\n", tok);   /* world */
}

/* CLASS 3: strerror() returns pointer to static buffer */
void class3_demo(void) {
    /* UNSAFE: strerror may use a static buffer */
    char *msg = strerror(2);  /* ENOENT */
    /* Another thread calling strerror() may overwrite the same buffer */
    printf("%s\n", msg);  /* No such file or directory */
    
    /* Safe alternative: strerror_r (POSIX) or strerror_s (C11) */
    char buf[128];
    strerror_r(2, buf, sizeof(buf));  /* writes into caller's buffer */
    printf("%s\n", buf);
}

int main(void) { 
    class2_demo(); 
    class2_fixed(); 
    class3_demo(); 
    return 0; 
}
```
This is called a **thread-unsafe function class**. The output proves that `strtok` relies on hidden static state, whereas `strtok_r` successfully extracts tokens by relying entirely on the caller's stack via `saveptr`.

### Discard the throwaway
This code is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
- **Files affected**: None
- **Change type**: Theory
- **Location**: N/A
- **Dependencies**: N/A

### The New Code
```c
/* Concept unit theory — no new project code here */
```

### The Updated Project
```c
1: /* Concept unit theory — no new project code here */
```
This structure exists solely to demonstrate the concept conceptually.

### Mechanical walkthrough
- `char s1[] = "hello world";` allocates a modifiable array of characters on the stack.
- `char *tok = strtok(s1, " ");` calls `strtok`, passing the input array `s1` and a space string `" "` as the delimiter; it saves the internal position to a static pointer and returns the first token.
- `printf("tok: %s\n", tok);` prints the string `"hello"`.
- `tok = strtok(NULL, " ");` calls `strtok` with `NULL` to indicate it should resume parsing from its internally saved static pointer.
- `char *saveptr;` declares a pointer on the caller's stack to hold the parsing state.
- `char *tok = strtok_r(s1, " ", &saveptr);` calls `strtok_r`, which updates `saveptr` instead of an internal static variable, making it thread-safe.
- `char *msg = strerror(2);` calls `strerror`, which maps the integer `2` to an error string and returns a pointer to an internal static buffer.
- `char buf[128];` allocates a stack buffer of 128 bytes.
- `strerror_r(2, buf, sizeof(buf));` safely writes the resulting error string directly into the caller-owned buffer `buf`.

### CS lens
The fundamental CS concept is **Shared Mutable State**. It appears in:
1. Global configuration dictionaries in web servers.
2. Singleton database connection pools.
3. Hidden state machines in legacy APIs like OpenGL 1.0.

### SE lens
The design principle is **Stateless Interfaces**. The alternative NOT chosen is relying on implicit global state for convenience. The real tradeoff is requiring the caller to explicitly pass state variables (like `saveptr`), which slightly clutters the API but guarantees thread safety.

### Commands needed
`gcc -lpthread`

### Run it
Output:
```
tok: hello
tok: world
tok: hello
tok: world
No such file or directory
No such file or directory
```
This is predicted with confidence because `strtok` keeps a static `char*` pointer. Each call with `NULL` continues from that pointer. Two threads calling `strtok` simultaneously corrupt each other's pointers. `strtok_r`: caller passes `&saveptr`, no shared state.

### One sentence connecting to previous unit
Understanding how state makes a function unsafe naturally leads to examining the exact definition of safety.

## Concept Unit: Reentrancy — stronger than thread-safe

### The Problem
If a function works correctly when called simultaneously by multiple threads (thread-safe), does that mean it's perfectly safe in all concurrent contexts?
- What happens if a thread-safe function, currently holding a lock, is interrupted by a signal?
- If the signal handler then calls that exact same thread-safe function, what occurs when it tries to acquire the lock?
- How can we write functions that are safe even when interrupted and recursively called?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

/* Thread-safe but NOT reentrant: uses a mutex */
static pthread_mutex_t rand_lock = PTHREAD_MUTEX_INITIALIZER;
static unsigned long rand_state = 12345;

int thread_safe_rand(void) {
    pthread_mutex_lock(&rand_lock);
    /* Cannot call thread_safe_rand from a signal handler: */
    /* signal may interrupt while rand_lock is held -> deadlock */
    rand_state = rand_state * 1103515245 + 12345;
    int result = (rand_state >> 16) & 0x7FFF;
    pthread_mutex_unlock(&rand_lock);
    return result;
}

/* Reentrant: all state passed by caller, no locks needed */
int reentrant_rand(unsigned long *state) {
    *state = *state * 1103515245 + 12345;
    return (*state >> 16) & 0x7FFF;
}

int main(void) {
    /* Reentrant: each thread/signal handler has its own state */
    unsigned long state1 = 12345;
    unsigned long state2 = 99999;
    printf("r1=%d r2=%d\n", reentrant_rand(&state1), reentrant_rand(&state2));
    return 0;
}
```
This is called **reentrancy**. The output proves that `reentrant_rand` computes correct values without locks because it isolates its state entirely to the arguments provided by the caller, meaning an interrupted call can safely be re-entered by a signal handler.

### Discard the throwaway
This code is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
- **Files affected**: None
- **Change type**: Theory
- **Location**: N/A
- **Dependencies**: N/A

### The New Code
```c
/* Concept unit theory — no new project code here */
```

### The Updated Project
```c
1: /* Concept unit theory — no new project code here */
```
This structure exists solely to demonstrate the concept conceptually.

### Mechanical walkthrough
- `static pthread_mutex_t rand_lock = PTHREAD_MUTEX_INITIALIZER;` statically declares and initializes a mutex for the pseudo-random generator.
- `static unsigned long rand_state = 12345;` initializes the shared pseudo-random state.
- `pthread_mutex_lock(&rand_lock);` attempts to acquire the lock to protect the critical section updating `rand_state`.
- `rand_state = rand_state * 1103515245 + 12345;` applies a linear congruential generator formula to the global state.
- `int result = (rand_state >> 16) & 0x7FFF;` computes the returned pseudo-random integer.
- `pthread_mutex_unlock(&rand_lock);` releases the mutex.
- `int reentrant_rand(unsigned long *state)` defines a function taking a pointer to a caller-managed state variable.
- `*state = *state * 1103515245 + 12345;` updates the caller's state in place, requiring no locks.

### CS lens
The fundamental CS concept is **Interrupt Safety**. It appears in:
1. POSIX signal handlers.
2. Hardware interrupt service routines (ISRs) in embedded systems.
3. Recursive descent parsers.

### SE lens
The design principle is **Pure Functions / Explicit State**. The alternative NOT chosen is using a thread-safe mutex wrapper around hidden state. The real tradeoff is passing state explicitly everywhere it is needed, which changes the function signature but eliminates synchronization overhead and deadlock risks.

### Commands needed
`gcc -lpthread`

### Run it
Output:
```
r1=16838 r2=12798
```
This is predicted with confidence. `thread_safe_rand` holds `rand_lock` during computation. If `SIGALRM` fires during this and the signal handler calls `thread_safe_rand`: tries to acquire `rand_lock` (already held by interrupted code) -> deadlock. `reentrant_rand`: no global state, no locks. Always safe. The `_r` suffix convention in POSIX names reentrant versions: `strtok_r`, `strerror_r`, `readdir_r`.

### One sentence connecting to previous unit
If relying on locks introduces the risk of deadlocks under interruption, we must examine how deadlocks form and how to prevent them.

## Concept Unit: Deadlock prevention — lock ordering

### The Problem
When two threads need to acquire the same two locks, they can easily get stuck. If Thread A holds Lock 1 and waits for Lock 2, while Thread B holds Lock 2 and waits for Lock 1, they are trapped.
- How can we guarantee that a cycle in the lock wait graph never forms?
- If multiple resources need to be locked simultaneously, in what order should we acquire them?
- What happens if we enforce a global ordering based on memory addresses?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>

/* Two locks with a global ordering: A < B (A must always be acquired before B) */
pthread_mutex_t lock_A = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock_B = PTHREAD_MUTEX_INITIALIZER;

/* CORRECT: both threads acquire A before B */
void transfer(int *from, int *to, int amount) {
    /* Determine ordering by address: always lock lower address first */
    pthread_mutex_t *first  = (&lock_A < &lock_B) ? &lock_A : &lock_B;
    pthread_mutex_t *second = (&lock_A < &lock_B) ? &lock_B : &lock_A;
    
    pthread_mutex_lock(first);
    pthread_mutex_lock(second);
    
    *from -= amount;
    *to   += amount;
    
    pthread_mutex_unlock(second);
    pthread_mutex_unlock(first);
}

int account_A = 1000;
int account_B = 500;

void *t1_fn(void *arg) { 
    transfer(&account_A, &account_B, 100); 
    return NULL; 
}
void *t2_fn(void *arg) { 
    transfer(&account_B, &account_A, 50); 
    return NULL; 
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, t1_fn, NULL);
    pthread_create(&t2, NULL, t2_fn, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("A=%d B=%d (total=%d, expected 1500)\n",
           account_A, account_B, account_A + account_B);
    pthread_mutex_destroy(&lock_A);
    pthread_mutex_destroy(&lock_B);
    return 0;
}
```
This is called **lock ordering**. The output proves that by sorting the lock addresses numerically and always acquiring the lock with the lower address first, both threads agree on a global sequence, preventing any wait cycles from forming.

### Discard the throwaway
This code is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
- **Files affected**: None
- **Change type**: Theory
- **Location**: N/A
- **Dependencies**: N/A

### The New Code
```c
/* Concept unit theory — no new project code here */
```

### The Updated Project
```c
1: /* Concept unit theory — no new project code here */
```
This structure exists solely to demonstrate the concept conceptually.

### Mechanical walkthrough
- `pthread_mutex_t lock_A = PTHREAD_MUTEX_INITIALIZER;` initializes the first mutex statically.
- `pthread_mutex_t *first  = (&lock_A < &lock_B) ? &lock_A : &lock_B;` compares the memory addresses of the two locks to determine which one is computationally "lower".
- `pthread_mutex_t *second = (&lock_A < &lock_B) ? &lock_B : &lock_A;` assigns the higher memory address to `second`.
- `pthread_mutex_lock(first);` acquires the lower-addressed lock first, enforcing the global order.
- `pthread_mutex_lock(second);` acquires the higher-addressed lock second.
- `*from -= amount;` modifies the first protected resource.
- `*to   += amount;` modifies the second protected resource.
- `pthread_mutex_unlock(second);` releases the higher-addressed lock.
- `pthread_mutex_unlock(first);` releases the lower-addressed lock, completing the transaction.
- `pthread_create(&t1, NULL, t1_fn, NULL);` spawns thread `t1` executing the `t1_fn` transfer function.
- `pthread_join(t1, NULL);` waits for thread `t1` to finish its transfer.
- `pthread_mutex_destroy(&lock_A);` cleans up the mutex object.

### CS lens
The fundamental CS concept is **Total Order**. It appears in:
1. Timestamp-based concurrency control in distributed databases.
2. Two-Phase Locking (2PL) protocols.
3. Breaking symmetry in dining philosophers algorithms.

### SE lens
The design principle is **Symmetry Breaking**. The alternative NOT chosen is allowing threads to acquire locks based on the order of their parameters (e.g., `from` then `to`). The real tradeoff is that addressing-based ordering requires dynamic pointer comparisons at runtime but flawlessly scales to arbitrary lock pairs without deadlock.

### Commands needed
`gcc -lpthread`

### Run it
Output:
```
A=950 B=550 (total=1500, expected 1500)
```
This is predicted with confidence. Both `t1` and `t2` call `transfer`. By comparing lock addresses, both will always acquire `lock_A` first (assuming it has the lower address), then `lock_B`. No cycle in the wait graph can form. No deadlock.

### One sentence connecting to previous unit
While lock ordering solves deadlock fundamentally, sometimes the strict order isn't known ahead of time, leading to alternative wait-and-retry strategies.

## Concept Unit: Deadlock prevention — trylock with backoff

### The Problem
If we cannot easily sort locks, or if acquiring locks in a strict order is structurally impossible in the code, how can we prevent deadlock?
- What if a thread simply checks if a lock is available, and if not, backs away?
- Why is it critical for a thread to release its currently held locks before sleeping?
- How does introducing a random or fixed sleep interval (backoff) help resolve contention?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>
#include <errno.h>

pthread_mutex_t lock_A = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock_B = PTHREAD_MUTEX_INITIALIZER;

/* Trylock with backoff: never hold multiple locks while waiting */
void acquire_both(pthread_mutex_t *first, pthread_mutex_t *second) {
    while (1) {
        pthread_mutex_lock(first);
        if (pthread_mutex_trylock(second) == 0)
            return;  /* got both: proceed */
        
        /* Couldn't get second: release first and retry */
        pthread_mutex_unlock(first);
        /* Brief backoff to reduce contention */
        usleep(1);
    }
}

void *thread_fn(void *arg) {
    /* Thread 1: A then B. Thread 2: B then A */
    /* (normally deadlock, but trylock prevents it) */
    if ((long)arg == 1)
        acquire_both(&lock_A, &lock_B);
    else
        acquire_both(&lock_B, &lock_A);
        
    printf("thread %ld: holding both locks\n", (long)arg);
    pthread_mutex_unlock(&lock_A);
    pthread_mutex_unlock(&lock_B);
    return NULL;
}

int main(void) {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, thread_fn, (void*)1L);
    pthread_create(&t2, NULL, thread_fn, (void*)2L);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    return 0;
}
```
This is called **trylock with backoff**. The output proves that even when threads attempt to acquire locks in opposite orders (A->B and B->A), one thread will detect the conflict using `pthread_mutex_trylock`, release its held lock, and wait, allowing the other thread to make progress.

### Discard the throwaway
This code is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
- **Files affected**: None
- **Change type**: Theory
- **Location**: N/A
- **Dependencies**: N/A

### The New Code
```c
/* Concept unit theory — no new project code here */
```

### The Updated Project
```c
1: /* Concept unit theory — no new project code here */
```
This structure exists solely to demonstrate the concept conceptually.

### Mechanical walkthrough
- `while (1)` starts an infinite retry loop for acquiring the locks.
- `pthread_mutex_lock(first);` unconditionally blocks to acquire the first lock.
- `if (pthread_mutex_trylock(second) == 0)` attempts to acquire the second lock without blocking; returns `0` if successful.
- `return;` exits the loop if both locks are successfully acquired.
- `pthread_mutex_unlock(first);` releases the first lock because the second was unavailable, preventing a hold-and-wait scenario.
- `usleep(1);` sleeps for 1 microsecond, yielding the CPU so the other thread can complete its work.
- `if ((long)arg == 1)` casts the raw pointer argument back to an integer to identify the thread.
- `acquire_both(&lock_A, &lock_B);` attempts to grab lock A then lock B.
- `acquire_both(&lock_B, &lock_A);` attempts to grab lock B then lock A.

### CS lens
The fundamental CS concept is **Hold and Wait Avoidance**. It appears in:
1. Ethernet CSMA/CD exponential backoff protocols.
2. Optimistic concurrency control in transactional memory.
3. Software Transactional Memory (STM) abort and retry mechanisms.

### SE lens
The design principle is **Optimistic Retry**. The alternative NOT chosen is strictly ordered blocking locks. The real tradeoff is avoiding the complexity of a global lock ordering at the cost of potential "livelock" (threads repeatedly colliding) if the backoff time is too short under heavy contention.

### Commands needed
`gcc -lpthread`

### Run it
Output:
```
thread 1: holding both locks
thread 2: holding both locks
```
This is predicted with confidence. Both threads eventually proceed. No deadlock. `T1` acquires `A`, tries `B` (EBUSY: `T2` holds `B`), releases `A`, sleeps 1us. `T2` acquires `B`, tries `A` (now free), gets `A`. `T2` holds both: prints, releases. `T1` retries: acquires `A`, tries `B` (now free), gets `B`. Holds both: prints, releases.

### One sentence connecting to previous unit
Knowing how to safely encapsulate complex lock handling logic allows us to wrap unsafe functions securely.

## Concept Unit: Thread-safe wrappers — the standard pattern

### The Problem
If we must use an external function that relies on unsafe state, how can we make it safe?
- What if we wrap the entire function in a mutex?
- How do we encapsulate the state and the lock together so no caller can ever bypass the protection?
- Why is it considered best practice to bundle the lock and the data it protects into a single struct?

### Introduce the concept in isolation
```c
#include <pthread.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/* Wrap any thread-unsafe function with a mutex */
static pthread_mutex_t malloc_lock = PTHREAD_MUTEX_INITIALIZER;

/* Note: glibc malloc IS thread-safe; this is illustrative */
void *safe_malloc(size_t size) {
    pthread_mutex_lock(&malloc_lock);
    void *ptr = malloc(size);
    pthread_mutex_unlock(&malloc_lock);
    return ptr;
}

/* Or: use a thread-safe alternative if one exists */
/* gethostbyname is NOT thread-safe (uses static buffer) */
/* Use getaddrinfo() instead: fully reentrant */

/* Pattern: make shared state explicit, protect with mutex */
typedef struct {
    pthread_mutex_t lock;
    unsigned long   state;
} SafeRNG;

void srng_init(SafeRNG *r, unsigned long seed) {
    pthread_mutex_init(&r->lock, NULL);
    r->state = seed;
}

int srng_next(SafeRNG *r) {
    pthread_mutex_lock(&r->lock);
    r->state = r->state * 6364136223846793005ULL + 1442695040888963407ULL;
    int result = r->state >> 33;
    pthread_mutex_unlock(&r->lock);
    return result;
}

void srng_destroy(SafeRNG *r) {
    pthread_mutex_destroy(&r->lock);
}

int main(void) {
    SafeRNG rng;
    srng_init(&rng, 42);
    printf("%d %d %d\n", srng_next(&rng), srng_next(&rng), srng_next(&rng));
    srng_destroy(&rng);
    return 0;
}
```
This is called the **monitor pattern (or thread-safe wrapper)**. The output proves that by embedding the mutex directly alongside the mutable state variable inside a struct, any thread holding a pointer to the struct can safely generate random numbers without corrupting the state.

### Discard the throwaway
This code is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
- **Files affected**: None
- **Change type**: Theory
- **Location**: N/A
- **Dependencies**: N/A

### The New Code
```c
/* Concept unit theory — no new project code here */
```

### The Updated Project
```c
1: /* Concept unit theory — no new project code here */
```
This structure exists solely to demonstrate the concept conceptually.

### Mechanical walkthrough
- `static pthread_mutex_t malloc_lock = PTHREAD_MUTEX_INITIALIZER;` creates a global static lock to protect the wrapper.
- `void *safe_malloc(size_t size)` defines a function wrapping the standard memory allocator.
- `void *ptr = malloc(size);` calls the underlying standard library function while inside the locked critical section.
- `typedef struct { pthread_mutex_t lock; unsigned long state; } SafeRNG;` bundles the lock and the data it protects into one explicit structure.
- `pthread_mutex_init(&r->lock, NULL);` dynamically initializes the mutex embedded in the structure.
- `r->state = seed;` sets the initial random state safely before concurrent access begins.
- `pthread_mutex_lock(&r->lock);` acquires the instance-specific lock.
- `r->state = r->state * ...;` updates the internal random state safely.
- `int result = r->state >> 33;` computes the generated result while still holding the lock.
- `pthread_mutex_unlock(&r->lock);` releases the instance-specific lock.
- `pthread_mutex_destroy(&r->lock);` destroys the initialized instance lock.

### CS lens
The fundamental CS concept is **The Monitor Pattern**. It appears in:
1. Java's `synchronized` methods.
2. Concurrent data structures like thread-safe queues.
3. OS kernel objects representing hardware devices.

### SE lens
The design principle is **Encapsulation of Synchronization**. The alternative NOT chosen is making the caller responsible for locking before calling the function. The real tradeoff is that internalizing the lock ensures callers cannot forget to lock, but restricts callers from easily composing multiple operations into a single locked atomic transaction.

### Commands needed
`gcc -lpthread`

### Run it
Output:
```
-1628795550 519207011 1145152865
```
This is predicted with confidence. Trace `srng_next`: lock, update state with LCG formula, extract upper 31 bits, unlock. The `SafeRNG` struct is the correct pattern: shared state lives in a struct alongside its protecting mutex. Any thread with a `SafeRNG*` can safely call `srng_next`.

### One sentence connecting to previous unit
With tools to detect thread safety, write reentrant code, and prevent deadlocks, we have mastered the fundamental concurrency primitives.

## Closing

### Connect the pieces
Module 5 is nearly complete. Lesson 40 returns to performance — how to measure what is actually slow. Thread safety is a property of a function, not of its code — the same source code can be thread-safe in one context (called with a private state argument) and thread-unsafe in another (relying on hidden shared state). If a program uses `strtok_r`, the caller allocates a `char *saveptr` and passes its address (`&saveptr`) to the function. Each thread executing this has its own stack frame and its own `saveptr`. No static global state is touched, so no locks are needed. No locks mean no lock wait graph cycles can form. Without cycles, deadlocks are structurally impossible, and the function is completely reentrant, safely surviving even signal handler interruptions.
