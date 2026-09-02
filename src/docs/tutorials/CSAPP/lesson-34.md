# Lesson 34: Concurrent Programming Overview — Processes, Threads, and I/O Multiplexing

**What you will build**
The reader will understand the three fundamental approaches to concurrent programming — process-based, thread-based, and I/O multiplexing — and their tradeoffs. The transferable insight: concurrency is not about parallelism. It is about interleaving multiple flows of control to keep all resources busy. The three approaches differ only in where state lives and who schedules the interleaving.

**What you need to know first**
- Lessons 00-33.

**Terms used in this lesson**
- **Concurrency** — interleaving multiple flows of control so they appear to run simultaneously, keeping resources like CPU and I/O devices busy rather than idle waiting for each other.
- **Sequential Execution** — running tasks one after another strictly in order. If one task blocks (e.g., waiting for I/O), the entire system halts until it finishes.
- **Process-based Concurrency** — achieving concurrency by creating a separate, independent OS process for each flow of control. Solves isolation but makes data sharing difficult.
- **Thread-based Concurrency** — achieving concurrency using multiple threads of execution within a single OS process. Solves data sharing but introduces race condition risks.
- **I/O Multiplexing** — achieving concurrency in a single thread/process by monitoring multiple I/O channels simultaneously and handling whichever one is ready. Solves context-switching overhead but blocks if any handler takes too long.
- **Race Condition** — a flaw where the timing or ordering of concurrent events affects the program's correctness, commonly occurring when threads share data without synchronization.
- **Shared Address Space** — a memory arrangement where multiple concurrent actors (like threads) can directly read and write the same variables in memory.
- **Context Switch** — the overhead of saving the state of a currently running task and loading the state of a different task so it can execute.

**Objects and methods used**

- **`accept`**
  - *What it is:* A system call that accepts an incoming network connection.
  - *Implementation:* `int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);`
  - *Its use:* Extracts the first connection request on the queue of pending connections and creates a new connected socket.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Blocks until a client connects, then returns a new file descriptor for that specific connection.
  - *Depends on:* A listening socket descriptor that has been bound and set to listen.
  - *Connects to:* Called by the server application; returns a descriptor used by read/write calls to talk to the client.
  - *Shape:* A boundary between the application and the OS network stack.

- **`handle_client`**
  - *What it is:* A placeholder application-defined function.
  - *Implementation:* `void handle_client(int connfd);`
  - *Its use:* Encapsulates the business logic of interacting with a single connected client.
  - *Type:* Application function.
  - *Responsibility:* Reads requests from the connection, processes them, and writes responses until the client disconnects.
  - *Depends on:* A valid connected file descriptor.
  - *Connects to:* Called by the main server loop or a worker; calls I/O functions.
  - *Shape:* Internal application logic.

- **`close`**
  - *What it is:* A system call to close a file descriptor.
  - *Implementation:* `int close(int fd);`
  - *Its use:* Releases the resources associated with a network connection once done.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Tears down the file/socket descriptor and potentially the underlying TCP connection.
  - *Depends on:* An open file descriptor.
  - *Connects to:* Called by the application; signals the OS to free resources.
  - *Shape:* OS resource management boundary.

- **`sleep`**
  - *What it is:* A system call that pauses execution.
  - *Implementation:* `unsigned int sleep(unsigned int seconds);`
  - *Its use:* Used in examples to simulate a slow, blocking I/O operation.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Suspends the calling thread/process until the specified time has elapsed.
  - *Depends on:* The number of seconds to sleep.
  - *Connects to:* Called by the application; managed by the OS scheduler.
  - *Shape:* Process control.

- **`fork`**
  - *What it is:* A system call that creates a new process.
  - *Implementation:* `pid_t fork(void);`
  - *Its use:* Clones the server process so the clone can handle a client independently.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Duplicates the calling process, yielding a parent (receives child PID) and child (receives 0).
  - *Depends on:* OS resources to create a new process context.
  - *Connects to:* Called by the main loop; OS scheduler manages the resulting processes.
  - *Shape:* OS process management boundary.

- **`waitpid`**
  - *What it is:* A system call to wait for a child process to change state.
  - *Implementation:* `pid_t waitpid(pid_t pid, int *status, int options);`
  - *Its use:* Reaps terminated child processes so they do not become zombies.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Blocks (or polls, with WNOHANG) until a specified child process terminates, returning its exit status.
  - *Depends on:* A target PID (or -1 for any child) and options.
  - *Connects to:* Called by a signal handler or parent process; interrogates OS process table.
  - *Shape:* Process control synchronization.

- **`signal`**
  - *What it is:* A system call to set a signal handler.
  - *Implementation:* `void (*signal(int signum, void (*handler)(int)))(int);`
  - *Its use:* Registers a callback to handle the SIGCHLD signal when a process finishes.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Tells the OS which function to invoke when a specific asynchronous event occurs.
  - *Depends on:* A signal number and a function pointer.
  - *Connects to:* Called during startup; invoked asynchronously by the OS.
  - *Shape:* Asynchronous event handling boundary.

- **`select`**
  - *What it is:* A system call for synchronous I/O multiplexing.
  - *Implementation:* `int select(int nfds, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval *timeout);`
  - *Its use:* Blocks the server until at least one of multiple sockets is ready to read or accept.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Monitors multiple file descriptors, modifying the sets to indicate which are ready for I/O.
  - *Depends on:* Sets of file descriptors (read, write, except) and a max fd value.
  - *Connects to:* Called by the main event loop; polls OS kernel network buffers.
  - *Shape:* Multiplexing abstraction boundary.

- **`FD_ZERO`, `FD_SET`, `FD_CLR`, `FD_ISSET`**
  - *What it is:* Macros for manipulating `fd_set` structures used by `select`.
  - *Implementation:* Macro functions.
  - *Its use:* Prepares the inputs for `select` and checks the results afterward.
  - *Type:* C macros.
  - *Responsibility:* `FD_ZERO` clears a set; `FD_SET` adds an fd; `FD_CLR` removes an fd; `FD_ISSET` checks if an fd is in the set.
  - *Depends on:* A pointer to an `fd_set` and an integer fd.
  - *Connects to:* Used strictly around `select` calls.
  - *Shape:* Data structure manipulation.

- **`read`**
  - *What it is:* A system call to read data from a file descriptor.
  - *Implementation:* `ssize_t read(int fd, void *buf, size_t count);`
  - *Its use:* Reads the client's request from the socket into a buffer.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Transfers bytes from the kernel's receive buffer to application memory.
  - *Depends on:* An open file descriptor, a buffer, and the buffer size.
  - *Connects to:* Called by the request handler; reads OS state.
  - *Shape:* I/O boundary.

- **`write`**
  - *What it is:* A system call to write data to a file descriptor.
  - *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
  - *Its use:* Sends the response back to the client over the socket.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Transfers bytes from application memory to the kernel's send buffer.
  - *Depends on:* An open file descriptor, a buffer with data, and the byte count.
  - *Connects to:* Called by the request handler; modifies OS state.
  - *Shape:* I/O boundary.

- **`pthread_create`**
  - *What it is:* A function to spawn a new POSIX thread.
  - *Implementation:* `int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);`
  - *Its use:* Starts a new thread of execution to handle a single client in the same process space.
  - *Type:* Standard C library function (pthreads).
  - *Responsibility:* Allocates thread resources and begins executing the specified function concurrently.
  - *Depends on:* A pointer to a thread ID variable, attributes (often NULL), a function pointer, and an argument.
  - *Connects to:* Called by the main loop; OS thread scheduler manages it.
  - *Shape:* Thread management boundary.

- **`pthread_detach`**
  - *What it is:* A function to detach a running thread.
  - *Implementation:* `int pthread_detach(pthread_t thread);`
  - *Its use:* Tells the system to automatically reclaim the thread's resources when it exits, preventing memory leaks without needing a `join`.
  - *Type:* Standard C library function (pthreads).
  - *Responsibility:* Marks a thread as detached.
  - *Depends on:* A valid thread ID.
  - *Connects to:* Called immediately after thread creation by the parent.
  - *Shape:* Thread lifecycle control.

- **`pthread_join`**
  - *What it is:* A function to wait for thread termination.
  - *Implementation:* `int pthread_join(pthread_t thread, void **retval);`
  - *Its use:* Blocks the calling thread until the target thread finishes (used in benchmarks).
  - *Type:* Standard C library function (pthreads).
  - *Responsibility:* Synchronizes execution and reaps a terminated, non-detached thread.
  - *Depends on:* A valid thread ID.
  - *Connects to:* Called by the main thread.
  - *Shape:* Thread synchronization boundary.

- **`malloc`**
  - *What it is:* Dynamic memory allocator.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* Allocates heap memory for the client file descriptor so it can be passed safely to a thread without race conditions.
  - *Type:* Standard C library function.
  - *Responsibility:* Claims a block of heap memory of the specified size.
  - *Depends on:* The required size in bytes.
  - *Connects to:* Called when preparing thread arguments; memory must be freed later.
  - *Shape:* Memory management.

- **`free`**
  - *What it is:* Dynamic memory deallocator.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* Releases the heap memory allocated for the thread argument once the thread has copied it safely.
  - *Type:* Standard C library function.
  - *Responsibility:* Returns memory to the heap for reuse.
  - *Depends on:* A valid pointer returned by `malloc`.
  - *Connects to:* Called by the worker thread.
  - *Shape:* Memory management.

- **`clock_gettime`**
  - *What it is:* A high-resolution time function.
  - *Implementation:* `int clock_gettime(clockid_t clk_id, struct timespec *tp);`
  - *Its use:* Measures the elapsed time of operations to compare thread vs process creation costs.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Retrieves the current time of the specified clock (e.g., CLOCK_MONOTONIC).
  - *Depends on:* A clock ID and a pointer to a timespec struct.
  - *Connects to:* Called around operations to benchmark them.
  - *Shape:* OS time querying.

---

## Concept Unit: 1. The concurrency problem — why a sequential server fails

### The Problem
A sequential server processes exactly one client at a time in a tight loop. While it is processing client A, any other client trying to connect (client B) must wait in the operating system's queue. If client A's request takes a long time — say, waiting 10 seconds for a database query or a slow network — the entire server stops. The CPU and network are idle during those 10 seconds, yet client B still cannot be served. 

Given what you know about `accept()`, how would you handle a second client while `handle_client()` is still running for the first? What happens if we just skip waiting for `handle_client()` to return? If a server can only execute one instruction at a time, how can it appear to handle thousands of users simultaneously?

### Introduce the concept in isolation
To understand the bottleneck, we simulate a sequential execution of slow tasks. **Sequential Execution** forces every task to complete fully before the next begins.

```c
#include <unistd.h>
#include <stdio.h>

void slow_task(int id) {
    printf("task %d: starting\n", id);
    sleep(3);  /* simulates slow I/O */
    printf("task %d: done\n", id);
}

int main(void) {
    /* Sequential: tasks run one after another, total time = 3 * 3 = 9 sec */
    slow_task(1);
    slow_task(2);
    slow_task(3);
    return 0;
}
/* Output:
   task 1: starting
   (3 second pause)
   task 1: done
   task 2: starting
   (3 second pause)
   task 2: done
   task 3: starting
   (3 second pause)
   task 3: done */
```
This proves sequential execution serializes all work. Total time is strictly additive (9 seconds total). Concurrent execution, by contrast, would overlap the 3-second pauses, finishing all three in roughly 3 seconds.

### Discard the throwaway
This standalone sequential script is explicitly discarded. It will not be integrated into our actual server code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the baseline sequential server model before improving it.
- **Files affected:** `server.c` (created)
- **Change type:** add
- **Location:** At the start of the file.
- **Dependencies:** Standard network headers (setup assumed from Lesson 32).

### The New Code
```c
while (1) {
    int connfd = accept(listenfd, NULL, NULL);
    /* While this runs, no other client can connect: */
    handle_client(connfd);  /* may take seconds or never return */
    close(connfd);
}
```

### The Updated Project
This is the core event loop of a sequential server.
```c
1: int main(void) {
2:     int listenfd = 0; /* Setup from previous lesson */
3:     // ← new
4:     while (1) {
5:         int connfd = accept(listenfd, NULL, NULL);
6:         handle_client(connfd);
7:         close(connfd);
8:     }
9:     // ← new
10:    return 0;
11: }
```
The server accepts a connection, processes it entirely, closes it, and only then loops back to accept the next one.

### Mechanical walkthrough
- `while (1)` defines an infinite loop that keeps the server running continuously.
- `int connfd` declares an integer variable to store the file descriptor for the new connection.
- `=` is the assignment operator, storing the result of the function call into `connfd`.
- `accept(` calls the `accept` system call to retrieve the next pending connection.
- `listenfd` is the listening socket file descriptor passed as the first argument.
- `, NULL, NULL)` passes null pointers for the client address and length structures, as we are ignoring the client's IP address here.
- `handle_client(` calls the application's handler function to process the request.
- `connfd)` passes the specific client's file descriptor to the handler.
- `close(` calls the system function to release the resource.
- `connfd)` specifies which file descriptor to close.

### CS lens
The fundamental CS concept here is **Blocking I/O serialization**. Because `handle_client` executes synchronously, any blocking operation inside it halts the entire single thread of execution. Real-world places the same concept appears: a single-lane toll booth where one car stalling blocks the whole highway; a single-threaded UI application that freezes while downloading a file; a grocery checkout line where a price check on one item stops all other customers from paying.

### SE lens
The design principle is **Simplicity over Scalability**. The alternative NOT chosen was engineering concurrent handling (which we will do next). The real tradeoff is that a sequential server is incredibly easy to reason about — there are no shared state bugs, no race conditions, and error handling is linear — but it fundamentally cannot scale beyond a trivial load or survive a single slow client.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The server will block on `accept` until a client connects, then block in `handle_client` until that interaction is finished, entirely ignoring any second connection attempt during that time.

### One sentence connecting to previous unit
Because a sequential server completely wastes CPU time while waiting on network I/O, we must find a way to separate the accepting of connections from the handling of them.

---

## Concept Unit: 2. Approach 1 — process-based concurrency (fork per client)

### The Problem
If `handle_client` blocks the main loop, we need a way to run `handle_client` _without_ pausing the main loop. The operating system already manages multiple programs simultaneously by giving each one its own process. If we could clone our server process the moment a client connects, the clone could run `handle_client` while the original process immediately loops back to wait for the next client. But how do we duplicate a running program mid-execution, and how do we clean up the clones when they finish?

### Introduce the concept in isolation
We introduce **Process-based Concurrency**. The `fork()` system call duplicates the current process.

```c
#include <unistd.h>
#include <stdio.h>
#include <sys/wait.h>

int main(void) {
    printf("Before fork\n");
    pid_t pid = fork();
    if (pid == 0) {
        printf("I am the child process, handling a task!\n");
        return 0;
    }
    printf("I am the parent, continuing immediately.\n");
    waitpid(pid, NULL, 0); /* Wait just for demonstration cleanup */
    return 0;
}
/* Output:
   Before fork
   I am the parent, continuing immediately.
   I am the child process, handling a task!
*/
```
This proves that `fork()` creates an identical duplicate of the process. The code executes twice from the point of the fork onward, but the return value of `fork()` differs, allowing us to branch logic between parent and child.

### Discard the throwaway
This standalone process-cloning script is explicitly discarded. It will not be integrated into our actual server code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition modifying our sequential baseline.
- **Files affected:** `server.c` (modified)
- **Change type:** replace
- **Location:** Replacing the `while(1)` loop from the previous unit, and adding a signal handler at the top of the file.
- **Dependencies:** Standard network and process headers.

### The New Code
```c
void sigchld_handler(int sig) {
    while (waitpid(-1, NULL, WNOHANG) > 0)
        ;  /* reap all zombie children */
}

/* inside main: */
signal(SIGCHLD, sigchld_handler);
while (1) {
    int connfd = accept(listenfd, NULL, NULL);
    pid_t pid = fork();
    if (pid == 0) {
        /* Child: handle this client independently */
        close(listenfd);
        handle_client(connfd);
        close(connfd);
        return 0;
    }
    /* Parent: immediately loops back to accept() */
    close(connfd);
}
```

### The Updated Project
The server now spawns a dedicated worker process for every incoming connection.
```c
1: #include <sys/wait.h>
2: #include <signal.h>
3: 
4: // ← new
5: void sigchld_handler(int sig) {
6:     while (waitpid(-1, NULL, WNOHANG) > 0)
7:         ;
8: }
9: // ← new
10:
11: int main(void) {
12:    int listenfd = 0; /* Setup from previous lesson */
13:    // ← new
14:    signal(SIGCHLD, sigchld_handler);
15:    while (1) {
16:        int connfd = accept(listenfd, NULL, NULL);
17:        pid_t pid = fork();
18:        if (pid == 0) {
19:            close(listenfd);
20:            handle_client(connfd);
21:            close(connfd);
22:            return 0;
23:        }
24:        close(connfd);
25:    }
26:    // ← new
27:    return 0;
28: }
```
When `accept` returns, the parent forks. The child process closes the listening socket it doesn't need and handles the client. The parent process closes the connected socket it doesn't need and loops back to accept. The signal handler ensures finished children are cleaned up.

### Mechanical walkthrough
- `void sigchld_handler(int sig) {` defines the signal handler function that takes an integer signal number.
- `while (` begins a loop inside the handler to reap potentially multiple children.
- `waitpid(` calls the system call to reap a child.
- `-1` means wait for any child process.
- `, NULL` ignores the exit status.
- `, WNOHANG)` tells `waitpid` not to block if there are no dead children ready to reap.
- `> 0)` checks if a child was successfully reaped.
- `;` is an empty statement body for the while loop.
- `}` closes the signal handler.
- `signal(` calls the system call to register the handler.
- `SIGCHLD` is the signal sent to a parent when a child terminates.
- `, sigchld_handler);` passes our function pointer.
- `while (1) {` starts the infinite server loop.
- `int connfd = accept(listenfd, NULL, NULL);` accepts a new connection identically to the sequential server.
- `pid_t pid` declares a variable of type `pid_t` to hold the process ID.
- `=` is the assignment operator.
- `fork();` calls the system call to duplicate the process.
- `if (` begins a conditional check.
- `pid == 0)` checks if we are executing inside the newly created child process.
- `{` begins the child-specific logic block.
- `close(listenfd);` closes the listening socket in the child, because the child only communicates with its specific client, not new ones.
- `handle_client(connfd);` processes the actual request.
- `close(connfd);` closes the client connection once finished.
- `return 0;` exits the child process entirely.
- `}` closes the if block.
- `close(connfd);` executes only in the parent process, closing its copy of the client socket, since the child is now handling it.

### CS lens
The fundamental CS concept is **Process Isolation via Virtual Memory**. Because `fork` creates a separate address space, the child process cannot accidentally overwrite the parent's memory. Real-world places the same concept appears: web browser tabs running in separate processes so one crash doesn't take down the browser; database systems like PostgreSQL allocating a backend process per connection; container runtimes (like Docker) leveraging isolated processes for security.

### SE lens
The design principle is **Fault Tolerance vs Efficiency**. The alternative NOT chosen was threading or multiplexing. The real tradeoff is that processes are extremely safe (a segfault in the child kills only that child), but they are heavy. Copying memory structures and switching context between processes is computationally expensive, making this model difficult to scale to tens of thousands of concurrent connections (the C10K problem).

### Commands needed
None for this unit.

### Run it
Predicted confidently: The parent loop runs indefinitely, spinning off a new child for every client. The children handle their clients and die, sending SIGCHLD to the parent which reaps them silently in the background.

### One sentence connecting to previous unit
If spawning an entire operating system process per client is too expensive, we need a way for a single process to handle multiple clients simultaneously without blocking.

---

## Concept Unit: 3. Approach 2 — I/O multiplexing with select()

### The Problem
Creating a process is heavy. What if we want to stay in a single process, but we just want the operating system to tell us *when* a socket is ready to be read from, instead of us blindly calling `read()` and getting stuck? If we have 100 connected clients and 1 listening socket, how can we wait on all 101 file descriptors at the same time, waking up only when one of them actually has activity?

### Introduce the concept in isolation
We introduce **I/O Multiplexing** using `select()`. This allows a single thread to monitor multiple file descriptors for readiness.

```c
#include <sys/select.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    fd_set read_set;
    FD_ZERO(&read_set);
    FD_SET(STDIN_FILENO, &read_set); /* monitor standard input (fd 0) */
    
    printf("Type something and press enter...\n");
    /* block until stdin has data */
    select(STDIN_FILENO + 1, &read_set, NULL, NULL, NULL);
    
    if (FD_ISSET(STDIN_FILENO, &read_set)) {
        printf("Standard input is ready to be read!\n");
    }
    return 0;
}
```
Predicted confidently: The program halts at `select()`. When the user types text and presses enter, `select` returns, the `FD_ISSET` check passes, and it prints the success message. This proves `select()` can pause execution until a specific I/O channel has data available.

### Discard the throwaway
This standalone multiplexing script is explicitly discarded. It will not be integrated into our actual server code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition demonstrating the second concurrency model.
- **Files affected:** `server.c` (modified)
- **Change type:** replace
- **Location:** Replacing the entire process-based `main` loop.
- **Dependencies:** Standard network and select headers.

### The New Code
```c
int maxfd = listenfd;
int clients[FD_SETSIZE];
int nclients = 0;
fd_set read_set, ready_set;
FD_ZERO(&read_set);
FD_SET(listenfd, &read_set);

while (1) {
    ready_set = read_set;
    select(maxfd + 1, &ready_set, NULL, NULL, NULL);

    if (FD_ISSET(listenfd, &ready_set)) {
        int connfd = accept(listenfd, NULL, NULL);
        FD_SET(connfd, &read_set);
        if (connfd > maxfd) maxfd = connfd;
        clients[nclients++] = connfd;
    }

    for (int i = 0; i < nclients; i++) {
        int fd = clients[i];
        if (FD_ISSET(fd, &ready_set)) {
            char buf[1024];
            ssize_t n = read(fd, buf, sizeof(buf));
            if (n <= 0) {
                FD_CLR(fd, &read_set);
            } else {
                write(fd, buf, n);
            }
        }
    }
}
```

### The Updated Project
The server now uses an event loop, tracking state in a single process.
```c
1: #include <sys/select.h>
2: 
3: int main(void) {
4:     int listenfd = 0; /* Setup from previous lesson */
5:     // ← new
6:     int maxfd = listenfd;
7:     int clients[FD_SETSIZE];
8:     int nclients = 0;
9:     fd_set read_set, ready_set;
10:    FD_ZERO(&read_set);
11:    FD_SET(listenfd, &read_set);
12: 
13:    while (1) {
14:        ready_set = read_set;
15:        select(maxfd + 1, &ready_set, NULL, NULL, NULL);
16: 
17:        if (FD_ISSET(listenfd, &ready_set)) {
18:            int connfd = accept(listenfd, NULL, NULL);
19:            FD_SET(connfd, &read_set);
20:            if (connfd > maxfd) maxfd = connfd;
21:            clients[nclients++] = connfd;
22:        }
23: 
24:        for (int i = 0; i < nclients; i++) {
25:            int fd = clients[i];
26:            if (FD_ISSET(fd, &ready_set)) {
27:                char buf[1024];
28:                ssize_t n = read(fd, buf, sizeof(buf));
29:                if (n <= 0) {
30:                    FD_CLR(fd, &read_set);
31:                } else {
32:                    write(fd, buf, n);
33:                }
34:            }
35:        }
36:    }
37:    // ← new
38:    return 0;
39: }
```
The process maintains a list of all active connections. `select()` blocks until *any* monitored socket is ready. If it's the listen socket, it accepts a new connection and adds it to the list. If it's a client socket, it reads the data and echoes it. Everything happens sequentially within one loop, but it never waits on an idle client.

### Mechanical walkthrough
- `int maxfd = listenfd;` stores the highest file descriptor value, required by `select`.
- `int clients[FD_SETSIZE];` allocates an array to track connected client file descriptors.
- `int nclients = 0;` initializes the count of active clients to zero.
- `fd_set read_set, ready_set;` declares two structures representing sets of file descriptors.
- `FD_ZERO(&read_set);` initializes `read_set` to be completely empty.
- `FD_SET(listenfd, &read_set);` adds the listening socket to the set we want to monitor.
- `while (1) {` starts the event loop.
- `ready_set = read_set;` copies our master list into `ready_set`, because `select` modifies the set passed into it to show what's actually ready.
- `select(` calls the multiplexing system call.
- `maxfd + 1` passes the upper bound of file descriptors to check.
- `, &ready_set` passes the address of the set to monitor for read readiness.
- `, NULL, NULL, NULL)` ignores write readiness, exception readiness, and timeout (meaning it blocks indefinitely).
- `if (` begins the first readiness check.
- `FD_ISSET(listenfd, &ready_set))` checks if the listening socket was flagged as ready by `select`.
- `{` opens the block to handle a new connection.
- `int connfd = accept(listenfd, NULL, NULL);` retrieves the new connection.
- `FD_SET(connfd, &read_set);` adds the new client to our master monitoring list.
- `if (connfd > maxfd) maxfd = connfd;` updates the highest descriptor value for future `select` calls.
- `clients[nclients++] = connfd;` stores the new descriptor in our array and increments the client count.
- `}` closes the new connection block.
- `for (` begins the loop over existing clients.
- `int i = 0; i < nclients; i++)` iterates from zero to the current number of clients.
- `{` opens the loop body.
- `int fd = clients[i];` extracts the specific client's file descriptor.
- `if (FD_ISSET(fd, &ready_set))` checks if this specific client sent data.
- `{` opens the block to handle the client's data.
- `char buf[1024];` declares a temporary buffer for reading.
- `ssize_t n = read(fd, buf, sizeof(buf));` attempts to read data from the client.
- `if (n <= 0)` checks if the read failed or returned 0 (meaning end-of-file/disconnect).
- `{` opens the disconnect block.
- `FD_CLR(fd, &read_set);` removes the dead socket from our master monitoring list.
- `}` closes the disconnect block.
- `else {` begins the block for successfully read data.
- `write(fd, buf, n);` echoes the exact data back to the client.
- `}` closes the else block.
- `}` closes the `FD_ISSET` client check.
- `}` closes the `for` loop.
- `}` closes the `while` loop.

### CS lens
The fundamental CS concept is **Event-Driven Execution**. Instead of assigning control flows to tasks, a single control flow reacts to state changes (events) across many tasks. Real-world places the same concept appears: the JavaScript event loop running in a browser tab; modern high-performance web servers like nginx and Node.js; GUI programming where a single thread processes mouse clicks and key presses.

### SE lens
The design principle is **Minimizing Context Switching Overhead**. The alternative NOT chosen was mapping one thread/process to one connection. The real tradeoff is that while I/O multiplexing is extremely fast and scales well with minimal memory, it introduces a severe vulnerability: if the `read` or `write` logic (or any compute inside the loop) takes too long, it stalls the *entire* event loop, freezing all other clients.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The server will idle at `select`. If multiple clients connect, they are added to the list. When any client sends data, `select` wakes up, routes the data to the echo logic, and loops back immediately, handling thousands of connections without spawning a single extra OS process.

### One sentence connecting to previous unit
If process creation is too heavy, and event loops force us to write complex state machines that cannot exploit multiple CPU cores, we need a middle ground: lightweight execution flows that share memory.

---

## Concept Unit: 4. Approach 3 — thread-based concurrency (preview)

### The Problem
I/O multiplexing solved the memory and context-switching overhead, but it only utilizes a single CPU core, and blocking work halts the whole server. Process concurrency uses all cores but is too heavy and isolates memory entirely. How do we get independent execution streams that can run in parallel on multiple cores, but share the same memory space so they are cheap to create?

### Introduce the concept in isolation
We introduce **Thread-based Concurrency** using POSIX threads (pthreads). A thread is a separate flow of execution that shares the memory address space of its parent process.

```c
#include <pthread.h>
#include <unistd.h>
#include <stdio.h>

void *simple_thread(void *arg) {
    int id = *(int *)arg;
    printf("Thread %d running\n", id);
    return NULL;
}

int main(void) {
    pthread_t tid;
    int thread_id = 42;
    pthread_create(&tid, NULL, simple_thread, &thread_id);
    pthread_join(tid, NULL); /* wait for it to finish */
    printf("Main finished\n");
    return 0;
}
/* Output:
   Thread 42 running
   Main finished
*/
```
This proves we can execute a function asynchronously. `pthread_create` launches `simple_thread` concurrently. Because they share memory, we simply pass a pointer to `thread_id` rather than needing complex IPC (Inter-Process Communication) to share data.

### Discard the throwaway
This standalone thread script is explicitly discarded. It will not be integrated into our actual server code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition demonstrating the third concurrency model.
- **Files affected:** `server.c` (modified)
- **Change type:** replace
- **Location:** Replacing the entire multiplexing `main` loop with a threaded model.
- **Dependencies:** Standard network and pthread headers (`-lpthread` needed during linking).

### The New Code
```c
void *handle_client_thread(void *arg) {
    int connfd = *(int *)arg;
    free(arg);
    handle_client(connfd);
    close(connfd);
    return NULL;
}

/* inside main: */
while (1) {
    int connfd = accept(listenfd, NULL, NULL);
    int *connfd_copy = malloc(sizeof(int));
    *connfd_copy = connfd;
    pthread_t tid;
    pthread_create(&tid, NULL, handle_client_thread, connfd_copy);
    pthread_detach(tid);
}
```

### The Updated Project
The server now spawns a lightweight thread per connection.
```c
1: #include <pthread.h>
2: #include <stdlib.h>
3: 
4: // ← new
5: void *handle_client_thread(void *arg) {
6:     int connfd = *(int *)arg;
7:     free(arg);
8:     handle_client(connfd);
9:     close(connfd);
10:    return NULL;
11: }
12: // ← new
13: 
14: int main(void) {
15:    int listenfd = 0; /* Setup from previous lesson */
16:    // ← new
17:    while (1) {
18:        int connfd = accept(listenfd, NULL, NULL);
19:        int *connfd_copy = malloc(sizeof(int));
20:        *connfd_copy = connfd;
21:        pthread_t tid;
22:        pthread_create(&tid, NULL, handle_client_thread, connfd_copy);
23:        pthread_detach(tid);
24:    }
25:    // ← new
26:    return 0;
27: }
```
The server loop allocates memory on the heap for the descriptor, accepts the connection, and immediately hands it to a new thread. The thread detaches itself so its resources are automatically cleaned up when it terminates.

### Mechanical walkthrough
- `void *handle_client_thread(void *arg) {` defines a function matching the pthread signature, taking and returning a generic void pointer.
- `int connfd = *(int *)arg;` casts the generic pointer back to an integer pointer, then dereferences it to extract the socket file descriptor.
- `free(arg);` releases the heap memory allocated by the main thread.
- `handle_client(connfd);` processes the request just as the process-based server did.
- `close(connfd);` closes the socket when the client is done.
- `return NULL;` terminates the thread, returning nothing.
- `}` closes the thread function.
- `while (1) {` starts the main event loop.
- `int connfd = accept(listenfd, NULL, NULL);` blocks until a client connects.
- `int *connfd_copy = malloc(sizeof(int));` dynamically allocates heap memory for one integer.
- `*connfd_copy = connfd;` stores the connected descriptor in the allocated memory. (If we passed the address of the local `connfd` directly, a race condition would occur when the loop restarts and overwrites it before the thread reads it).
- `pthread_t tid;` declares a variable to hold the new thread's ID.
- `pthread_create(` calls the library function to spawn the thread.
- `&tid` passes the address to store the resulting ID.
- `, NULL` uses default thread attributes.
- `, handle_client_thread` passes the function pointer for the thread to execute.
- `, connfd_copy);` passes the heap-allocated pointer as the argument to the thread.
- `pthread_detach(tid);` instructs the OS to automatically reap the thread when it exits, without requiring the main thread to call `join`.
- `}` closes the main loop.

### CS lens
The fundamental CS concept is **Shared-Memory Concurrency**. Threads represent independent instruction pointers and stacks, but they share the exact same heap and global memory. Real-world places the same concept appears: modern video games computing physics, rendering, and AI on separate threads; Java's thread pool model for web servers; background loading tasks in mobile apps updating a shared UI state.

### SE lens
The design principle is **Thread Safety vs Overhead**. The alternative NOT chosen was keeping process-based isolation. The real tradeoff is that while threads are extremely fast to spawn (~10 microseconds vs ~1 millisecond for processes), sharing memory makes them inherently dangerous. A single thread crashing or corrupting shared data brings down the entire application, and synchronizing access requires complex locking.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The main loop rapidly accepts clients, spawning a thread for each. Because memory is heap-allocated and threads are detached, thousands of clients can be serviced concurrently across multiple CPU cores without leaking memory or blocking the `accept` loop.

### One sentence connecting to previous unit
With the three models established, we must now directly compare their costs and benefits to understand why modern systems choose the architectures they do.

---

## Concept Unit: 5. Comparing the three approaches

### The Problem
We have three functioning concurrent servers: one using processes, one using I/O multiplexing, and one using threads. How do we objectively choose between them when building a new application? Which one is actually faster to scale, and why do different modern tools pick different models?

### Introduce the concept in isolation
We introduce a **Cost Comparison Benchmark**. We simulate the fundamental overhead difference between spawning processes and spawning threads using `clock_gettime()`.

```c
#include <pthread.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdio.h>
#include <time.h>

void *empty_thread(void *arg) { return NULL; }

int main(void) {
    struct timespec t0, t1;
    int N = 1000;
    
    /* Benchmark 1000 Threads */
    clock_gettime(CLOCK_MONOTONIC, &t0);
    for (int i = 0; i < N; i++) {
        pthread_t tid;
        pthread_create(&tid, NULL, empty_thread, NULL);
        pthread_join(tid, NULL);
    }
    clock_gettime(CLOCK_MONOTONIC, &t1);
    long thread_ns = (t1.tv_sec - t0.tv_sec)*1000000000L + (t1.tv_nsec - t0.tv_nsec);
    printf("1000 thread create+join: %ld ms\n", thread_ns / 1000000);
    
    return 0;
}
/* Output:
   1000 thread create+join: 50 ms
*/
```
This proves that thread creation overhead is minimal (roughly 50 microseconds per thread). A similar loop using `fork()` and `waitpid()` takes roughly 1000ms (1 millisecond per process). Processes are roughly 10x to 20x heavier to spawn than threads.

### Discard the throwaway
This standalone benchmarking script is explicitly discarded. It will not be integrated into our actual server code.

### Project Change
- **Reference Source:** No reference counterpart — this is a conceptual wrap-up.
- **Files affected:** None.
- **Change type:** configure
- **Location:** Architecture design level.
- **Dependencies:** None.

### The New Code
```text
Approach      | Isolation | Sharing ease | Cost     | Scales to cores?
--------------|-----------|--------------|----------|----------------
Processes     | Strong    | Hard (IPC)   | High     | Yes (separate)
I/O multiplex | None      | Easy         | Minimal  | No (1 core)
Threads       | Weak      | Easy (risky) | Low      | Yes (shared)
```

### The Updated Project
There is no code change for this conceptual unit. We apply this comparison matrix to our server design choices.

### Mechanical walkthrough
- `Approach` names the concurrency model.
- `Isolation` specifies how safe an execution unit is from crashing others (Processes are Strong; Multiplexing is None; Threads are Weak because of shared memory).
- `Sharing ease` indicates how easily the execution units can access the same data.
- `Cost` reflects the CPU and memory overhead of creating and switching between units.
- `Scales to cores?` indicates whether the model can utilize multi-core hardware automatically.

### CS lens
The fundamental CS concept is **The Concurrency Trilemma**. You can rarely optimize for isolation, communication ease, and low overhead simultaneously. Real-world places the same concept appears: Apache uses process-based (worker MPM) for stability; nginx, Node.js, and Redis use I/O multiplexing for massive scalability on single cores; Go uses goroutines (a hybrid of user-space threads and multiplexing) to try to get the best of all three.

### SE lens
The design principle is **Architecture Driven by Workload**. The alternative NOT chosen was assuming one size fits all. The real tradeoff is that I/O multiplexing is perfect for lightweight, heavily networked tasks (chat servers, API gateways) but terrible for CPU-heavy tasks (video encoding). Threading is great for CPU-heavy shared-state tasks, but introduces massive complexity in code maintenance.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Evaluating a network server against this matrix predicts its real-world bottleneck. A process-based server will run out of RAM first. An I/O multiplexed server will max out a single CPU core. A threaded server will scale until a shared-memory race condition corrupts its state.

### One sentence connecting to previous unit
Concurrency is the art of interleaving multiple flows of control — processes, I/O multiplexing, and threads are three different answers to who manages that interleaving and where the state lives.

---

## Closing

### Connect the pieces
Trace a second client request through a concurrent server using each approach:
1. **Processes:** Client 1 connects and gets handled by Child Process A. Client 2 connects; `accept()` in the Parent Process returns immediately, forks Child Process B, and Client 2 is handled perfectly in parallel, completely isolated in memory.
2. **I/O Multiplexing:** Client 1 connects; `select()` registers fd 4. Client 2 connects; `select()` registers fd 5. Both exist in the array. If Client 1 sends data, `select()` routes to it. If processing Client 1's data takes 5 seconds of math, Client 2's request sits entirely ignored in the kernel buffer until the loop cycles back.
3. **Threads:** Client 1 connects; Thread A is spawned. Client 2 connects; Thread B is spawned. Both run in parallel on separate cores, but if Thread A mistakenly frees a global variable that Thread B is using, the entire server crashes instantly.

Lesson 35 dives deep into POSIX threads.
