# Lesson 38: Semaphores — The Producer-Consumer and Readers-Writers Problems

What you will build: The reader will understand POSIX semaphores (`sem_t`): what a semaphore is, how `P()` and `V()` work, how to implement a mutex with a semaphore, and how to solve the classic producer-consumer problem with a bounded buffer. The transferable insight: a semaphore is a counter with two atomic operations. Every coordination pattern in concurrent programming — mutex, bounded buffer, barrier, rate limiter — can be built from semaphores.

What you need to know first: Lessons 00-37.

**Terms used in this lesson:**
- **Semaphore** — a non-negative integer with two atomic operations, used to control access to a common resource by multiple processes or threads.
- **P() / sem_wait** — Proberen ('to test'); an atomic operation that waits for a semaphore to become greater than zero, then decrements it. It exists to acquire a resource or wait for a condition.
- **V() / sem_post** — Verhogen ('to increment'); an atomic operation that increments a semaphore and wakes up a blocked thread if any. It exists to release a resource or signal a condition.
- **Mutex** — mutual exclusion; a pattern ensuring only one thread accesses a critical section at a time. It exists to prevent race conditions.
- **Bounded Buffer** — a queue with a fixed capacity where producers add items and consumers remove them. It exists to decouple the execution rates of producers and consumers safely.
- **Deadlock** — a state where a set of threads are permanently blocked waiting for each other to release resources. It exists as a failure mode of incorrect synchronization ordering.

**Objects and methods used:**
- **`sem_t`**
  - *What it is:* A POSIX semaphore type.
  - *Implementation:* An opaque struct or integer defined in `<semaphore.h>`.
  - *Its use:* To declare semaphore variables that coordinate thread actions.
  - *Type:* `typedef` (often an opaque struct).
  - *Responsibility:* Holds the semaphore's counter and waiting queue state.
  - *Depends on:* Initialization via `sem_init` or `sem_open`.
  - *Connects to:* `sem_wait`, `sem_post`, `sem_destroy`.
  - *Shape:* A synchronization primitive at the OS/library boundary.
- **`sem_init`**
  - *What it is:* Function to initialize an unnamed semaphore.
  - *Implementation:* `int sem_init(sem_t *sem, int pshared, unsigned int value);`
  - *Its use:* To set the initial count and sharing scope of a semaphore.
  - *Type:* Free function in `<semaphore.h>`.
  - *Responsibility:* Prepares the semaphore for use with a starting integer value.
  - *Depends on:* An allocated `sem_t` pointer.
  - *Connects to:* OS kernel to setup the synchronization object.
  - *Shape:* API boundary between user code and OS threading library.
- **`sem_wait`**
  - *What it is:* The P() operation; blocks if semaphore is 0, otherwise decrements.
  - *Implementation:* `int sem_wait(sem_t *sem);`
  - *Its use:* To wait for a resource to become available.
  - *Type:* Free function.
  - *Responsibility:* Safely decrements the semaphore count, putting the calling thread to sleep if necessary.
  - *Depends on:* An initialized `sem_t`.
  - *Connects to:* Scheduler (can trigger context switch).
  - *Shape:* Blocking synchronization call.
- **`sem_post`**
  - *What it is:* The V() operation; increments the semaphore.
  - *Implementation:* `int sem_post(sem_t *sem);`
  - *Its use:* To signal that a resource is available or a condition is met.
  - *Type:* Free function.
  - *Responsibility:* Atomically increments the count and wakes a waiting thread if the count was 0.
  - *Depends on:* An initialized `sem_t`.
  - *Connects to:* Scheduler (wakes up a blocked thread).
  - *Shape:* Non-blocking synchronization call.
- **`sem_destroy`**
  - *What it is:* Function to clean up an unnamed semaphore.
  - *Implementation:* `int sem_destroy(sem_t *sem);`
  - *Its use:* To release resources associated with the semaphore when done.
  - *Type:* Free function.
  - *Responsibility:* Invalidates the semaphore and frees underlying kernel resources.
  - *Depends on:* An initialized `sem_t`.
  - *Connects to:* OS kernel.
  - *Shape:* Cleanup API.
- **`sem_open`**
  - *What it is:* Function to open or create a named semaphore.
  - *Implementation:* `sem_t *sem_open(const char *name, int oflag, ...);`
  - *Its use:* To share a semaphore across unrelated processes.
  - *Type:* Free function.
  - *Responsibility:* Maps a string name to a system-wide semaphore object in `/dev/shm`.
  - *Depends on:* A string name, flags, and optional mode/initial value.
  - *Connects to:* File system and OS IPC mechanisms.
  - *Shape:* IPC initialization boundary.

## Concept Unit: What a semaphore is — P() and V()
### The Problem
How do we coordinate actions between threads when a simple lock isn't enough? What if we have a pool of 3 identical resources and want to let up to 3 threads use them simultaneously? A mutex only allows 1. How would you design a counter that safely blocks threads when it reaches 0 and wakes them up when a resource is returned?

### Introduce the concept in isolation
```c
#include <semaphore.h>
#include <stdio.h>

int main(void) {
    sem_t s;
    sem_init(&s, 0, 3);  /* initial value = 3 (allows 3 concurrent P()s) */

    int val;
    sem_getvalue(&s, &val);
    printf("initial: %d\n", val);  /* 3 */

    sem_wait(&s);  /* P(s): s becomes 2 */
    sem_getvalue(&s, &val);
    printf("after P: %d\n", val);  /* 2 */

    sem_post(&s);  /* V(s): s becomes 3 */
    sem_getvalue(&s, &val);
    printf("after V: %d\n", val);  /* 3 */

    sem_destroy(&s);
    return 0;
}
```
Output:
```
initial: 3
after P: 2
after V: 3
```
This proves that a **semaphore** maintains an internal integer counter. `sem_wait` (P) decreases it, and `sem_post` (V) increases it. If the value is 0, a call to `sem_wait` blocks until another thread calls `sem_post`.

### Discard the throwaway
This isolated throwaway code is now discarded and will not be part of the final project.

### Project Change
No reference counterpart — this is a standalone theory lesson — no running project.

### The New Code
```c
/* No project code for this theory unit. */
```

### The Updated Project
```c
// 1: /* Theory unit - no running project code added */
```
This simply establishes the theory.

### Mechanical walkthrough
- `#include <semaphore.h>`: Includes the POSIX semaphore API.
- `sem_t s;`: Declares the semaphore struct variable.
- `sem_init(&s, 0, 3);`: Initializes `s`. `0` means shared between threads in this process. `3` is the initial value.
- `sem_wait(&s);`: Decrements the count from 3 to 2.
- `sem_post(&s);`: Increments the count back to 3.
- `sem_destroy(&s);`: Cleans up the semaphore.

### CS lens
The fundamental CS concept is **Synchronization Primitives**. Semaphores are used in:
- Bounded thread pools (limiting concurrent workers)
- Rate limiters (tokens in a bucket)
- Managing pooled database connections

### SE lens
The design principle is **Encapsulation of State and Waiting**. The alternative not chosen is a manual while-loop with `sleep()` checking a volatile variable. The real tradeoff is that semaphores push the waiting mechanism into the OS kernel, saving CPU cycles, but introducing potential context-switching overhead.

### Commands needed
gcc sem.c -lpthread -o sem

### Run it
The predicted output: `initial: 3`, `after P: 2`, `after V: 3`.

### One sentence connecting to previous unit
Now that we know a semaphore is an integer counter, we can see what happens when we set its initial value to exactly 1.

## Concept Unit: Binary semaphore as a mutex
### The Problem
How can we ensure only one thread modifies a shared variable at a time? If a semaphore counts available resources, what happens if we say there is only 1 resource available total?

### Introduce the concept in isolation
```c
#include <semaphore.h>
#include <pthread.h>
#include <stdio.h>

#define NITERS 1000000
long counter = 0;
sem_t mutex_sem;

void *count_up(void *arg) {
    for (long i = 0; i < NITERS; i++) {
        sem_wait(&mutex_sem);   /* P(1->0): acquire */
        counter++;              /* critical section */
        sem_post(&mutex_sem);   /* V(0->1): release */
    }
    return NULL;
}

int main(void) {
    sem_init(&mutex_sem, 0, 1);  /* binary semaphore: initial = 1 */
    pthread_t t1, t2;
    pthread_create(&t1, NULL, count_up, NULL);
    pthread_create(&t2, NULL, count_up, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    printf("counter = %ld (always 2000000)\n", counter);
    sem_destroy(&mutex_sem);
    return 0;
}
```
Output:
```
counter = 2000000 (always 2000000)
```
This proves that a **binary semaphore** initialized to 1 acts exactly like a mutex lock, preventing race conditions.

### Discard the throwaway
This throwaway mutex code is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson — no running project.

### The New Code
```c
/* No project code for this theory unit. */
```

### The Updated Project
```c
// 1: /* Theory unit - no running project code added */
```
The concept remains a theory model.

### Mechanical walkthrough
- `sem_init(&mutex_sem, 0, 1);`: Initializes a binary semaphore to 1.
- `sem_wait(&mutex_sem);`: The first thread decreases it to 0. If the second thread calls this, it blocks.
- `counter++;`: The critical section safely executes.
- `sem_post(&mutex_sem);`: Increases it to 1, waking the blocked thread.

### CS lens
The fundamental CS concept is **Mutual Exclusion**. It appears in:
- File locking mechanisms
- Database row locks
- OS scheduler run-queue locks

### SE lens
The design principle is **Generalization**. The alternative NOT chosen is using `pthread_mutex_t`. The real tradeoff is that semaphores have no concept of "ownership" (thread B can call `sem_post` even if thread A called `sem_wait`), providing more flexibility but removing the safety checks that strict mutexes offer.

### Commands needed
gcc -lpthread

### Run it
Predicted: `counter = 2000000 (always 2000000)` because the semaphore enforces strict turn-taking.

### One sentence connecting to previous unit
Since a binary semaphore acts as a mutex, we can combine it with counting semaphores to solve complex coordination problems.

## Concept Unit: The bounded buffer (producer-consumer)
### The Problem
If a producer writes data fast and a consumer reads it slow, how do we prevent the producer from overwriting unread data? And how do we stop the consumer from reading empty slots? What combination of semaphores handles a circular buffer?

### Introduce the concept in isolation
```c
#include <semaphore.h>
#include <pthread.h>
#include <stdio.h>

#define N 5   /* buffer capacity */

int buf[N];   /* shared circular buffer */
int in  = 0;  /* producer writes here */
int out = 0;  /* consumer reads here */

sem_t mutex;  /* mutual exclusion for buf, in, out */
sem_t slots;  /* counts empty slots (initially N) */
sem_t items;  /* counts filled items (initially 0) */

void insert(int val) {
    sem_wait(&slots);       /* P: wait for an empty slot */
    sem_wait(&mutex);       /* P: acquire mutual exclusion */
    buf[in] = val;
    in = (in + 1) % N;
    sem_post(&mutex);       /* V: release mutual exclusion */
    sem_post(&items);       /* V: signal that an item is available */
}

int remove_item(void) {
    sem_wait(&items);       /* P: wait for an item */
    sem_wait(&mutex);       /* P: acquire mutual exclusion */
    int val = buf[out];
    out = (out + 1) % N;
    sem_post(&mutex);       /* V: release mutual exclusion */
    sem_post(&slots);       /* V: signal that a slot is available */
    return val;
}

void *producer(void *arg) {
    for (int i = 0; i < 10; i++) {
        insert(i);
        printf("produced: %d\n", i);
    }
    return NULL;
}

void *consumer(void *arg) {
    for (int i = 0; i < 10; i++) {
        int val = remove_item();
        printf("consumed: %d\n", val);
    }
    return NULL;
}

int main(void) {
    sem_init(&mutex, 0, 1);
    sem_init(&slots, 0, N);   /* N empty slots */
    sem_init(&items, 0, 0);   /* 0 items available */
    pthread_t p, c;
    pthread_create(&p, NULL, producer, NULL);
    pthread_create(&c, NULL, consumer, NULL);
    pthread_join(p, NULL);
    pthread_join(c, NULL);
    sem_destroy(&mutex);
    sem_destroy(&slots);
    sem_destroy(&items);
    return 0;
}
```
This proves that **three semaphores** can coordinate a shared structure: one for mutual exclusion, one to block on full, and one to block on empty.

### Discard the throwaway
This throwaway bounded buffer is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson — no running project.

### The New Code
```c
/* No project code for this theory unit. */
```

### The Updated Project
```c
// 1: /* Theory unit - no running project code added */
```

### Mechanical walkthrough
- `sem_t mutex;`: Protects the buffer array and indices.
- `sem_t slots;`: Initialized to `N` (5). Producer calls `sem_wait` on this to claim an empty slot.
- `sem_t items;`: Initialized to 0. Consumer calls `sem_wait` on this to claim a filled item.
- `insert`: Producer waits for a slot, locks mutex, writes, unlocks mutex, and posts an item.
- `remove_item`: Consumer waits for an item, locks mutex, reads, unlocks mutex, and posts a slot.

### CS lens
The fundamental CS concept is the **Producer-Consumer Problem**. It appears in:
- Audio rendering pipelines
- Network packet queues
- Web server request dispatching

### SE lens
The design principle is **Separation of Concerns in Concurrency**. The alternative NOT chosen is a single lock with condition variables. The real tradeoff is that semaphores express counting logic elegantly but can become difficult to read when complex boolean conditions (e.g. "wait until queue is half full or timeout") are required.

### Commands needed
gcc -lpthread

### Run it
Predicted output: The producer will print `produced: 0` through `produced: 9` and consumer `consumed: 0` through `consumed: 9` in an interleaved fashion, with the producer never getting more than 5 items ahead of the consumer.

### One sentence connecting to previous unit
All our semaphores so far existed in one process's memory space, but we can also use them to coordinate entirely separate programs.

## Concept Unit: Named semaphores — cross-process IPC
### The Problem
What if we have two completely separate processes (different PIDs, different address spaces) that need to wait for each other? They don't share memory for a `sem_t` struct. How can they both talk to the same semaphore?

### Introduce the concept in isolation
```c
/* Process A: creates the semaphore */
#include <semaphore.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>

int main(void) {
    sem_t *s = sem_open("/my_semaphore", O_CREAT | O_EXCL, 0644, 0);
    /* initial value = 0: process B will block on P until we signal */
    printf("Process A: doing work...\n");
    sleep(2);
    sem_post(s);  /* V: signal process B */
    printf("Process A: signaled B\n");
    sem_close(s);
    sem_unlink("/my_semaphore");  /* remove from file system */
    return 0;
}
```
This proves that **named semaphores** created via `sem_open` persist in the OS kernel (often mounted under `/dev/shm`) and can be accessed by name across unrelated processes.

### Discard the throwaway
This cross-process throwaway is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson — no running project.

### The New Code
```c
/* No project code for this theory unit. */
```

### The Updated Project
```c
// 1: /* Theory unit - no running project code added */
```

### Mechanical walkthrough
- `sem_open("/my_semaphore", O_CREAT | O_EXCL, 0644, 0);`: Asks the kernel to create a named semaphore. `0644` sets permissions, and `0` is the initial value.
- `sem_post(s);`: Increments it, which can wake a completely different process blocked on it.
- `sem_close(s);`: Closes the current process's handle to it.
- `sem_unlink("/my_semaphore");`: Asks the kernel to destroy the semaphore object once all handles are closed.

### CS lens
The fundamental CS concept is **Inter-Process Communication (IPC)**. It appears in:
- Database clients connecting to a local DB server engine
- Microservice local daemon coordinating via shared memory
- Container runtime coordination

### SE lens
The design principle is **Global Namespaces for Shared State**. The alternative NOT chosen is passing unnamed semaphores via shared memory segments (e.g. `mmap`). The real tradeoff is that named semaphores are easier to setup but require explicit `sem_unlink` cleanup to prevent resource leaks that outlive the process lifecycle.

### Commands needed
gcc -lpthread

### Run it
Predicted output: Process A sleeps for 2 seconds, posts the semaphore, and prints "Process A: signaled B". Process B would successfully `sem_wait` and proceed.

### One sentence connecting to previous unit
Having multiple locks or semaphores introduces a new danger: if we acquire them in the wrong order, the entire system can freeze.

## Concept Unit: Semaphore pitfalls — ordering and deadlock
### The Problem
What happens if the producer in our bounded buffer locks the mutex *before* checking if there is an empty slot available? If the buffer is full, what does the producer do? And can the consumer ever empty it?

### Introduce the concept in isolation
```c
#include <semaphore.h>

extern sem_t mutex;
extern sem_t slots;
extern sem_t items;
extern int buf[];
extern int in;
extern int N;

/* WRONG order -- potential deadlock: */
void bad_insert(int val) {
    sem_wait(&mutex);  /* P mutex FIRST */
    sem_wait(&slots);  /* P slots SECOND */
    /* If slots == 0 (buffer full): we block while HOLDING mutex */
    /* Consumer needs mutex to remove an item and post slots */
    /* Consumer is blocked waiting for mutex -> DEADLOCK */
    buf[in] = val;
    in = (in + 1) % N;
    sem_post(&mutex);
    sem_post(&items);
}

/* CORRECT order: always P the resource semaphore BEFORE the mutex */
void good_insert(int val) {
    sem_wait(&slots);  /* P slots FIRST: block OUTSIDE the mutex */
    sem_wait(&mutex);  /* P mutex SECOND: only after a slot is available */
    buf[in] = val;
    in = (in + 1) % N;
    sem_post(&mutex);
    sem_post(&items);
}
```
This proves that holding a mutex while blocking on a resource semaphore causes **deadlock**, because the very thread that could free the resource is prevented from acquiring the mutex it needs to do so.

### Discard the throwaway
This throwaway deadlock example is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson — no running project.

### The New Code
```c
/* No project code for this theory unit. */
```

### The Updated Project
```c
// 1: /* Theory unit - no running project code added */
```

### Mechanical walkthrough
- `sem_wait(&mutex);`: Producer acquires exclusive access to the buffer.
- `sem_wait(&slots);`: Producer blocks because `slots` is 0 (buffer full). It goes to sleep *while still holding `mutex`*.
- (Consumer tries to run): Calls `sem_wait(&mutex)` in its own function, but blocks because the producer has it.
- **Result:** Both threads sleep forever.

### CS lens
The fundamental CS concept is **Deadlock**. It appears in:
- Circular dependencies in module loading
- Database transaction cross-locking
- OS resource allocation graphs (dining philosophers)

### SE lens
The design principle is **Lock Ordering and Minimizing Critical Sections**. The alternative NOT chosen is deadlock detection/recovery (letting it happen and aborting a thread). The real tradeoff is that strict lock ordering prevents deadlocks completely by design, but requires rigorous global discipline across the entire codebase to maintain.

### Commands needed
None for this unit.

### Run it
Predicted output: The program freezes and produces no further output, requiring a manual kill (Ctrl+C).

### One sentence connecting to previous unit
Understanding how deadlocks form allows us to design robust concurrent systems that can't accidentally lock themselves up.

## Closing
### Connect the pieces
Let's trace one complete produce and consume cycle using all these concepts.
1. The producer wishes to insert an item. It performs `sem_wait(&slots)` (P) to claim a slot. This decrements the counting semaphore.
2. It performs `sem_wait(&mutex)` to claim the binary semaphore acting as a lock, ensuring exclusive access.
3. It inserts the item, then releases the lock with `sem_post(&mutex)`.
4. It signals availability with `sem_post(&items)` (V), incrementing the item counter.
5. A sleeping consumer is awakened. It performs `sem_wait(&items)` to claim the item.
6. The consumer acquires the binary `mutex` with `sem_wait`, reads the item, and releases the `mutex`.
7. Finally, the consumer performs `sem_post(&slots)`, increasing the slot count, possibly waking a producer that was blocked on a full buffer.
This intricate dance, powered solely by atomic integers, solves the producer-consumer problem flawlessly, as long as we never hold the mutex while waiting for a slot (to avoid deadlock) and handle our IPC cleanup if we use named semaphores across processes. Lesson 39 covers thread safety, reentrancy, and deadlock prevention strategies.
