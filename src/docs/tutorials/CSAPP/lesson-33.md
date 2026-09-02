# Lesson 33: Robust I/O — Handling Short Counts and Interrupted System Calls

What you will build: The reader will understand why raw `read()` and `write()` calls are insufficient for robust programs, and will implement the Rio (Robust I/O) package: `rio_readn`, `rio_writen`, and a buffered `rio_readline`. The transferable insight: every I/O abstraction in production systems — database WAL writers, network protocol parsers, kernel drivers — handles short counts with retry loops. The Rio functions are the simplest correct pattern.

What you need to know first: Lessons 00-32.

### Terms used in this lesson

- **Short count** — A condition where an I/O operation transfers fewer bytes than requested. This happens normally with network sockets (data arrives in chunks), pipes, and when signals interrupt the operation. Production code must handle short counts by looping until all data is transferred.
- **EINTR (Interrupted system call)** — An error code indicating that a blocking system call (like read or write) was interrupted by a signal handler before it could transfer any data. This is a recoverable error, and the operation should be retried.
- **Network socket** — An endpoint for communication between processes, potentially across a network. Reads and writes on sockets are subject to arbitrary short counts due to network fragmentation and protocol behaviors.
- **TCP segment** — A piece of a TCP connection's data stream. Because TCP is a stream protocol, a single logical message may arrive as multiple TCP segments, resulting in partial reads.
- **Signal** — An asynchronous notification sent to a process to indicate an event. When a signal is caught, it can interrupt a currently executing system call.
- **Pipe** — A unidirectional communication channel between processes. A pipe has a limited capacity, and reads may return early if the pipe contains less data than requested.
- **EOF (End of File)** — A condition indicating that no more data can be read from a file descriptor. For sockets, this typically means the other end closed the connection. For `read()`, it is indicated by returning 0.
- **Broken pipe (EPIPE)** — An error condition when attempting to write to a pipe or socket where the reading end has been closed.
- **SIGPIPE** — A signal sent to a process when it attempts to write to a broken pipe. By default, this signal terminates the process, so robust network servers often ignore it or handle it.
- **Buffered reading** — A technique to improve performance by reading a large block of data from a file descriptor into memory (a buffer) in a single system call, and then satisfying subsequent smaller read requests from that memory buffer instead of making a system call for each small request.

### Objects and methods used

- **read**
  - *What it is:* The fundamental Unix system call for reading bytes from a file descriptor.
  - *Implementation:* `ssize_t read(int fd, void *buf, size_t count);`
  - *Its use:* To retrieve data from files, sockets, pipes, or devices. It is the core primitive wrapped by the Rio package.
  - *Type:* System call (C standard library function).
  - *Responsibility:* Transfers up to `count` bytes from the object referenced by `fd` into the buffer `buf`. Returns the number of bytes read, 0 on EOF, or -1 on error.
  - *Depends on:* A valid, open file descriptor `fd`, a writable buffer `buf` of at least `count` bytes.
  - *Connects to:* Calls into the operating system kernel to interact with device drivers or file systems.
  - *Shape:* The lowest-level user-space boundary for input operations.

- **write**
  - *What it is:* The fundamental Unix system call for writing bytes to a file descriptor.
  - *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
  - *Its use:* To send data to files, sockets, pipes, or devices.
  - *Type:* System call (C standard library function).
  - *Responsibility:* Transfers up to `count` bytes from the buffer `buf` to the object referenced by `fd`. Returns the number of bytes written, or -1 on error.
  - *Depends on:* A valid, open file descriptor `fd`, a readable buffer `buf` containing at least `count` bytes.
  - *Connects to:* Calls into the kernel to pass data to device drivers or network stacks.
  - *Shape:* The lowest-level user-space boundary for output operations.

- **STDIN_FILENO**
  - *What it is:* A macro defining the file descriptor number for standard input.
  - *Implementation:* `#define STDIN_FILENO 0` (typically).
  - *Its use:* Provides a standardized way to read input directed to the program from the terminal or a pipeline.
  - *Type:* Integer macro constant.
  - *Responsibility:* Acts as the default source for input data.
  - *Depends on:* The environment setting up file descriptor 0 before process execution.
  - *Connects to:* The terminal driver or a pipe from a previous command.
  - *Shape:* A predefined global resource handle.

- **errno**
  - *What it is:* A global or thread-local variable set by system calls to indicate what went wrong when they fail.
  - *Implementation:* `extern int errno;` (accessed via `<errno.h>`).
  - *Its use:* Checked after a system call returns -1 to differentiate between fatal errors (e.g., EBADF) and recoverable conditions (e.g., EINTR).
  - *Type:* Global/thread-local integer variable.
  - *Responsibility:* Holds the specific error code of the most recently failed system call.
  - *Depends on:* The C standard library and operating system kernel setting it upon error.
  - *Connects to:* Inspected by application error-handling logic.
  - *Shape:* A side-channel for communicating error specifics across the user-kernel boundary.

- **rio_t**
  - *What it is:* A structure representing an active buffered read context.
  - *Implementation:* `typedef struct { int rio_fd; ssize_t rio_cnt; char *rio_bufptr; char rio_buf[8192]; } rio_t;`
  - *Its use:* Passed to `rio_readline` to maintain state (how much data is buffered, next byte to read) across multiple calls, avoiding a system call per character.
  - *Type:* Structure type definition.
  - *Responsibility:* Encapsulates the internal state needed for efficient buffered reading from a specific file descriptor.
  - *Depends on:* Initialization by `rio_readinitb`.
  - *Connects to:* Used by `rio_read` and `rio_readline` to access buffered data.
  - *Shape:* An opaque-to-the-user state object for the Rio buffered API.

- **rio_readn**
  - *What it is:* A robust function that reads exactly a requested number of bytes, handling short counts and interrupted system calls.
  - *Implementation:* `ssize_t rio_readn(int fd, void *usrbuf, size_t n);`
  - *Its use:* Used when the exact number of bytes to read is known (e.g., reading a fixed-size header), ensuring the program doesn't proceed with partial data.
  - *Type:* Application-level library function.
  - *Responsibility:* Loops over `read()` until `n` bytes are read, EOF is encountered, or a fatal error occurs.
  - *Depends on:* A valid file descriptor and buffer.
  - *Connects to:* Calls `read()` repeatedly.
  - *Shape:* A high-level, robust wrapper around unbuffered input.

- **rio_writen**
  - *What it is:* A robust function that writes exactly a requested number of bytes.
  - *Implementation:* `ssize_t rio_writen(int fd, void *usrbuf, size_t n);`
  - *Its use:* Ensures complete transmission of data over network sockets or pipes, where a single `write()` might not send the whole buffer.
  - *Type:* Application-level library function.
  - *Responsibility:* Loops over `write()` until all `n` bytes are written or a fatal error occurs.
  - *Depends on:* A valid file descriptor and buffer with data.
  - *Connects to:* Calls `write()` repeatedly.
  - *Shape:* A high-level, robust wrapper around unbuffered output.

- **rio_readinitb**
  - *What it is:* An initialization function for the `rio_t` buffered read structure.
  - *Implementation:* `void rio_readinitb(rio_t *rp, int fd);`
  - *Its use:* Sets up an empty buffer and associates it with a file descriptor before calling `rio_readline`.
  - *Type:* Application-level library function.
  - *Responsibility:* Resets the internal buffer pointers and counts, and stores the file descriptor for future reads.
  - *Depends on:* An allocated `rio_t` structure and an open file descriptor.
  - *Connects to:* Modifies fields in `rio_t`.
  - *Shape:* A constructor-like setup function.

- **rio_read**
  - *What it is:* An internal helper function for buffered reads.
  - *Implementation:* `static ssize_t rio_read(rio_t *rp, char *usrbuf, size_t n);`
  - *Its use:* Fills the `rio_t` internal buffer if empty, then copies data to the user buffer. It is a drop-in replacement for `read()` but uses the buffer.
  - *Type:* Static library function.
  - *Responsibility:* Manages the logic of reading from the OS into the internal buffer (handling EINTR) and serving user requests from that buffer.
  - *Depends on:* An initialized `rio_t` structure.
  - *Connects to:* Calls `read()` and `memcpy()`.
  - *Shape:* An internal state-management boundary between raw syscalls and the public buffered API.

- **rio_readline**
  - *What it is:* A robust function that reads a text line from a buffered descriptor.
  - *Implementation:* `ssize_t rio_readline(rio_t *rp, void *usrbuf, size_t maxlen);`
  - *Its use:* Essential for parsing text-based protocols like HTTP or SMTP, where messages are delimited by newline characters.
  - *Type:* Application-level library function.
  - *Responsibility:* Reads characters one by one from the internal buffer until a newline, EOF, or maximum length is reached, and null-terminates the string.
  - *Depends on:* An initialized `rio_t` structure.
  - *Connects to:* Calls `rio_read` to fetch characters.
  - *Shape:* A high-level text parsing utility relying on the buffered I/O layer.

- **memcpy**
  - *What it is:* A standard C library function for copying blocks of memory.
  - *Implementation:* `void *memcpy(void *dest, const void *src, size_t n);`
  - *Its use:* Used inside `rio_read` to efficiently copy data from the internal buffer to the user's buffer.
  - *Type:* C standard library function.
  - *Responsibility:* Copies exactly `n` bytes from `src` to `dest`.
  - *Depends on:* Valid pointers to non-overlapping memory regions.
  - *Connects to:* Operates directly on process memory.
  - *Shape:* A low-level memory manipulation primitive.

- **socket**
  - *What it is:* A system call that creates an endpoint for communication.
  - *Implementation:* `int socket(int domain, int type, int protocol);`
  - *Its use:* Creates the initial file descriptor used for network communication.
  - *Type:* System call.
  - *Responsibility:* Allocates kernel resources for a socket and returns a file descriptor referring to it.
  - *Depends on:* Address family (e.g., AF_INET) and socket type (e.g., SOCK_STREAM).
  - *Connects to:* The kernel networking subsystem.
  - *Shape:* The entry point to the network API.

- **setsockopt**
  - *What it is:* A system call to set options on a socket.
  - *Implementation:* `int setsockopt(int sockfd, int level, int optname, const void *optval, socklen_t optlen);`
  - *Its use:* Frequently used to set `SO_REUSEADDR`, allowing immediate rebinding to a port after a server restarts.
  - *Type:* System call.
  - *Responsibility:* Modifies the behavior of a socket at various protocol levels.
  - *Depends on:* A valid socket file descriptor.
  - *Connects to:* The network stack configuration.
  - *Shape:* A configuration boundary for network endpoints.

- **bind**
  - *What it is:* A system call that assigns a local address to a socket.
  - *Implementation:* `int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);`
  - *Its use:* Tells the OS which port the server should listen on.
  - *Type:* System call.
  - *Responsibility:* Associates a specific network address and port with a socket descriptor.
  - *Depends on:* A created socket and a populated `sockaddr` structure.
  - *Connects to:* The OS routing and port management tables.
  - *Shape:* A network configuration primitive.

- **listen**
  - *What it is:* A system call that marks a socket as passive, ready to accept incoming connections.
  - *Implementation:* `int listen(int sockfd, int backlog);`
  - *Its use:* Transitions a socket from an active state (can initiate connections) to a passive state (can receive them).
  - *Type:* System call.
  - *Responsibility:* Configures the socket to queue incoming connection requests up to `backlog`.
  - *Depends on:* A bound socket.
  - *Connects to:* The TCP connection establishment logic in the kernel.
  - *Shape:* A state-transition primitive for server sockets.

- **accept**
  - *What it is:* A system call that extracts the first connection request on the queue of a listening socket.
  - *Implementation:* `int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);`
  - *Its use:* Retrieves a new file descriptor specifically for communicating with the connected client.
  - *Type:* System call.
  - *Responsibility:* Blocks until a connection is available, then returns a new socket connected to the peer.
  - *Depends on:* A listening socket.
  - *Connects to:* The completed connection queue maintained by the kernel.
  - *Shape:* The boundary where a general listener yields a specific peer-to-peer session.

- **close**
  - *What it is:* A system call that closes a file descriptor.
  - *Implementation:* `int close(int fd);`
  - *Its use:* Cleans up resources when communication is finished.
  - *Type:* System call.
  - *Responsibility:* Decrements the reference count on the file description and releases the descriptor. For TCP sockets, initiates the connection teardown process.
  - *Depends on:* A valid file descriptor.
  - *Connects to:* The kernel resource management and network teardown logic.
  - *Shape:* The resource disposal boundary.

---

## Concept Unit: Short Counts and EINTR

### The Problem

When working with local disk files, a call to `read()` asking for 1024 bytes usually returns 1024 bytes (unless it hits the end of the file). But what happens if we use `read()` on a network socket, and the other side's operating system decides to split the 1024-byte message into two 512-byte packets? What if the kernel delivers a signal to our process right as `read()` is waiting for data? Can we trust the return value of `read()` to always equal the amount we asked for?

### Introduce the concept in isolation

```c
#include <unistd.h>
#include <stdio.h>
#include <signal.h>
#include <errno.h>

int main(void) {
    char buf[1024];
    /* On a network socket this single read() may return only part of the data */
    ssize_t n = read(STDIN_FILENO, buf, 1024);
    /* If a SIGCHLD arrives mid-read, n == -1, errno == EINTR */
    if (n < 0 && errno == EINTR)
        printf("read interrupted by signal\n");
    else
        printf("read %zd bytes\n", n);
    return 0;
}
/* This program does NOT retry on EINTR or partial reads -- a real bug */
```

Predicted confidently: `read N bytes` where N < 1024 if the input is short, or `read interrupted by signal` if a signal arrives.
This output proves that `read()` can return fewer bytes than requested (a **short count**) AND can fail entirely with an interrupted system call (**EINTR**). Both cases are normal behavior in Unix, especially for network sockets and pipes. A robust program must expect and handle them.

### Discard the throwaway

This throwaway code is discarded. It demonstrates the flaw of a naive unbuffered read and will not be included in our project.

### Project Change

No reference counterpart — this is a from-scratch addition because we are building our own I/O library to replace naive read/write calls.
Files affected: `src/rio.c` (created)
Change type: add
Location: New file
Dependencies: Standard C libraries (`<unistd.h>`, `<errno.h>`)

### The New Code

```c
#include <unistd.h>
#include <errno.h>

typedef struct {
    int    rio_fd;         /* file descriptor */
    ssize_t rio_cnt;       /* bytes remaining in buffer */
    char   *rio_bufptr;    /* pointer to next unread byte */
    char    rio_buf[8192]; /* internal read buffer */
} rio_t;

/* Read exactly n bytes from fd, retrying on short counts and EINTR */
ssize_t rio_readn(int fd, void *usrbuf, size_t n) {
    size_t  nleft = n;
    ssize_t nread;
    char   *bufp = usrbuf;

    while (nleft > 0) {
        nread = read(fd, bufp, nleft);
        if (nread < 0) {
            if (errno == EINTR)  /* interrupted by signal: retry */
                nread = 0;
            else
                return -1;       /* real error */
        } else if (nread == 0) {
            break;               /* EOF: stop, return bytes read so far */
        }
        nleft -= nread;
        bufp  += nread;
    }
    return n - nleft;  /* bytes actually read (may be < n on EOF) */
}
```

### The Updated Project

```c
1: #include <unistd.h>
2: #include <errno.h>
3: 
4: typedef struct {
5:     int    rio_fd;         /* file descriptor */
6:     ssize_t rio_cnt;       /* bytes remaining in buffer */
7:     char   *rio_bufptr;    /* pointer to next unread byte */
8:     char    rio_buf[8192]; /* internal read buffer */
9: } rio_t;
10: 
11: /* Read exactly n bytes from fd, retrying on short counts and EINTR */
12: ssize_t rio_readn(int fd, void *usrbuf, size_t n) { // ← new
13:     size_t  nleft = n; // ← new
14:     ssize_t nread; // ← new
15:     char   *bufp = usrbuf; // ← new
16: // ← new
17:     while (nleft > 0) { // ← new
18:         nread = read(fd, bufp, nleft); // ← new
19:         if (nread < 0) { // ← new
20:             if (errno == EINTR)  /* interrupted by signal: retry */ // ← new
21:                 nread = 0; // ← new
22:             else // ← new
23:                 return -1;       /* real error */ // ← new
24:         } else if (nread == 0) { // ← new
25:             break;               /* EOF: stop, return bytes read so far */ // ← new
26:         } // ← new
27:         nleft -= nread; // ← new
28:         bufp  += nread; // ← new
29:     } // ← new
30:     return n - nleft;  /* bytes actually read (may be < n on EOF) */ // ← new
31: } // ← new
```

The new code introduces the `rio_t` structure for future use and implements `rio_readn`, which provides a robust wrapper around `read()` that guarantees either `n` bytes are read or an EOF/fatal error occurs.

### Mechanical walkthrough

- `typedef struct { ... } rio_t;`
  - Defines a structure named `rio_t` that will hold state for buffered reading. It includes a file descriptor (`rio_fd`), a count of unread bytes in the buffer (`rio_cnt`), a pointer to the next unread byte (`rio_bufptr`), and the buffer array itself (`rio_buf`). This will be used in a later concept unit.
- `ssize_t rio_readn(int fd, void *usrbuf, size_t n)`
  - Declares the `rio_readn` function. It takes an integer file descriptor `fd`, a pointer to the destination buffer `usrbuf`, and the requested number of bytes `n`. It returns a signed size type `ssize_t` representing the total bytes successfully read.
- `size_t nleft = n;`
  - Initializes a variable `nleft` to keep track of how many bytes are still needed to satisfy the request.
- `ssize_t nread;`
  - Declares a variable `nread` to store the return value of each underlying `read()` system call.
- `char *bufp = usrbuf;`
  - Casts the generic `void *` buffer pointer to a `char *` and assigns it to `bufp`, which will be used to increment the memory address as data is read.
- `while (nleft > 0) {`
  - Initiates a loop that continues as long as there are more bytes needed to fulfill the request. This loop handles the **short count** problem.
- `nread = read(fd, bufp, nleft);`
  - Calls the system call `read()`, asking it to read up to `nleft` bytes into the current buffer position `bufp`. The actual bytes read are stored in `nread`.
- `if (nread < 0) {`
  - Checks if `read()` returned an error code.
- `if (errno == EINTR)`
  - Checks the global error variable `errno` to see if the error was **EINTR**, an interrupted system call caused by a signal.
- `nread = 0;`
  - If interrupted by a signal, sets `nread` to 0. This simulates a read of 0 bytes for this iteration, ensuring the loop continues without advancing the buffer or subtracting from `nleft`.
- `else return -1;`
  - If the error is not **EINTR**, it is a fatal error. The function exits immediately and propagates the -1 up to the caller.
- `} else if (nread == 0) {`
  - Checks if `read()` returned exactly 0. In Unix, a return value of 0 from `read()` signals an **EOF (End of File)**, meaning the other side closed the connection or the end of the disk file was reached.
- `break;`
  - Exits the `while` loop early because no more data will ever arrive on this descriptor.
- `nleft -= nread;`
  - Subtracts the number of bytes just read from the remaining total needed.
- `bufp += nread;`
  - Advances the buffer pointer forward by the number of bytes read, so the next iteration of the loop places data into the correct consecutive memory location.
- `return n - nleft;`
  - Returns the total number of bytes successfully read. If the loop finished normally, `nleft` is 0, so it returns `n`. If the loop broke early due to **EOF**, it returns `n` minus however many bytes were still requested.

### CS lens

The fundamental concept here is **Idempotent Retry Loops** wrapped around fallible abstractions. System calls are leaky abstractions over messy physical realities (network latency, interrupt handlers). 
Other places this appears:
- Database clients retrying queries after momentary connection drops.
- Microservices using exponential backoff when an upstream service returns a 503 error.
- Message queues re-delivering unacknowledged messages.

### SE lens

The design principle is **Encapsulation of Complexity**. The alternative not chosen is forcing every caller of `read()` in the application code to implement their own `while` loop and `errno` checks. The trade-off is slightly higher function call overhead (one extra stack frame for the wrapper) in exchange for drastically simpler, bug-resistant application logic.

### Commands needed

None for this unit.

### Run it

Predicted confidently: For a socket stream delivering 60 bytes and then 40 bytes to a `rio_readn(fd, buf, 100)` request:
- Iteration 1: `read()` returns 60. `nleft` becomes 40. `bufp` advances by 60.
- Iteration 2: `read()` returns 40. `nleft` becomes 0.
- Return 100.
The loop transparently handles the short count.

### One sentence connecting to previous unit

Now that we can guarantee complete reads, we must apply the same logic to output, because `write()` is also subject to short counts.

---

## Concept Unit: Robust Writing

### The Problem

If `read()` can return fewer bytes than requested, can `write()` do the same? If we ask the kernel to send a 500-byte string over a network socket, and the network buffer only has room for 300 bytes right now, how does the kernel react? Does it block forever, or does it write what it can?

### Introduce the concept in isolation

```c
#include <unistd.h>
#include <stdio.h>

int main(void) {
    char data[500];
    /* For a pipe or socket with limited buffer space, write() may return < 500 */
    ssize_t written = write(STDOUT_FILENO, data, 500);
    printf("\nwrite requested 500, actually wrote %zd bytes\n", written);
    return 0;
}
/* This program demonstrates that write() requires a retry loop just like read() */
```

Predicted confidently: `write requested 500, actually wrote N bytes` where N can theoretically be less than 500 if the destination pipe/socket is nearly full, though it will likely be 500 for a simple local terminal.
This output proves the concept of a **short count on write**. Like `read()`, `write()` can complete partially.

### Discard the throwaway

This throwaway code is discarded. It is merely a demonstration of write short counts.

### Project Change

No reference counterpart.
Files affected: `src/rio.c` (modified)
Change type: add
Location: At the bottom of `src/rio.c`.
Dependencies: `rio_readn` from the previous unit.

### The New Code

```c
ssize_t rio_writen(int fd, void *usrbuf, size_t n) {
    size_t  nleft = n;
    ssize_t nwritten;
    char   *bufp = usrbuf;

    while (nleft > 0) {
        nwritten = write(fd, bufp, nleft);
        if (nwritten <= 0) {
            if (nwritten < 0 && errno == EINTR)
                nwritten = 0;  /* retry on signal */
            else
                return -1;     /* write error (e.g. broken pipe) */
        }
        nleft -= nwritten;
        bufp  += nwritten;
    }
    return n;
}
```

### The Updated Project

```c
32: 
33: ssize_t rio_writen(int fd, void *usrbuf, size_t n) { // ← new
34:     size_t  nleft = n; // ← new
35:     ssize_t nwritten; // ← new
36:     char   *bufp = usrbuf; // ← new
37: // ← new
38:     while (nleft > 0) { // ← new
39:         nwritten = write(fd, bufp, nleft); // ← new
40:         if (nwritten <= 0) { // ← new
41:             if (nwritten < 0 && errno == EINTR) // ← new
42:                 nwritten = 0;  /* retry on signal */ // ← new
43:             else // ← new
44:                 return -1;     /* write error (e.g. broken pipe) */ // ← new
45:         } // ← new
46:         nleft -= nwritten; // ← new
47:         bufp  += nwritten; // ← new
48:     } // ← new
49:     return n; // ← new
50: } // ← new
```
We have added `rio_writen`, which applies the same retry logic to `write()` as `rio_readn` did to `read()`.

### Mechanical walkthrough

- `ssize_t rio_writen(int fd, void *usrbuf, size_t n)`
  - Declares the `rio_writen` function. It takes an integer file descriptor `fd`, a pointer to the source buffer `usrbuf`, and the requested number of bytes `n`. Returns total bytes written or -1 on error.
- `size_t nleft = n;`
  - Initializes `nleft` with the total number of bytes to write.
- `ssize_t nwritten;`
  - Declares `nwritten` to store the result of the `write()` system call.
- `char *bufp = usrbuf;`
  - Casts the buffer to `char *` and assigns it to `bufp` for pointer arithmetic.
- `while (nleft > 0) {`
  - Loops until all data is written.
- `nwritten = write(fd, bufp, nleft);`
  - Attempts to write the remaining `nleft` bytes to the file descriptor. The number of successfully written bytes is returned.
- `if (nwritten <= 0) {`
  - Checks if the write failed entirely or wrote 0 bytes. Unlike `read()`, a return of 0 from `write()` is treated as an error by this library, because standard Unix semantics rarely result in a 0-byte write completing successfully unless requested.
- `if (nwritten < 0 && errno == EINTR)`
  - Checks if a system error occurred (`< 0`) and if the specific error is **EINTR**.
- `nwritten = 0;`
  - If interrupted by a signal, sets `nwritten` to 0 so the loop continues without advancing pointers, effectively retrying the same write.
- `else return -1;`
  - For any other error (such as a **broken pipe**, EPIPE), returns -1.
- `nleft -= nwritten;`
  - Decreases the remaining byte count by the amount actually transferred.
- `bufp += nwritten;`
  - Advances the buffer pointer forward.
- `return n;`
  - If the loop finishes, all `n` bytes have been written successfully, so it returns `n`.

### CS lens

The concept is **Symmetry in API Design**. Input and output operations share identical failure modes (short counts, interruptions) due to the underlying stream abstraction (sockets, pipes). Designing symmetrical abstractions (`rio_readn` and `rio_writen`) ensures developers don't have to context-switch failure models when moving between reading and writing.

### SE lens

The principle is **Fail Fast**. When `write()` returns 0 or a fatal error like EPIPE, `rio_writen` abandons the loop immediately. The alternative is ignoring the error and spinning in an infinite loop doing zero-byte writes. The trade-off is that the caller must handle the -1 return value and clean up gracefully.

### Commands needed

None for this unit.

### Run it

Predicted confidently: `rio_writen(fd, msg, 50)` where the first write only sends 30 bytes:
- Iteration 1: `write()` returns 30. `nleft` becomes 20. `bufp` advances by 30.
- Iteration 2: `write()` returns 20. `nleft` becomes 0.
- Returns 50.

### One sentence connecting to previous unit

While exact-byte transfers are great for fixed-size data, text-based protocols require us to read until we find a newline character, without knowing the length in advance.

---

## Concept Unit: Buffered Reading

### The Problem

If an HTTP request ends with `\r\n`, how do we read it from a socket? If we use `rio_readn` and ask for 100 bytes, we might accidentally read past the newline and consume the beginning of the *next* request. If we `read()` exactly 1 byte at a time until we see `\n`, we make a slow system call into the kernel for every single character. How can we read quickly in large chunks without losing track of where lines end?

### Introduce the concept in isolation

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    /* Simulate an internal buffer populated by a single large read() */
    char internal_buf[] = "GET / HTTP/1.0\r\nHost: loc";
    char *bufptr = internal_buf;
    
    /* We can serve single-character requests from this memory buffer directly */
    char next_char = *bufptr++;
    printf("First char served from buffer: %c\n", next_char);
    return 0;
}
/* Proves we can read chunks from memory without calling the OS */
```

Predicted confidently: `First char served from buffer: G`.
This output proves the concept of **buffered reading**. We fetch a large chunk of data once, and then application code reads it out of that memory buffer byte-by-byte. Memory access is vastly faster than a system call.

### Discard the throwaway

This throwaway code is discarded. We will implement a real, robust buffering system.

### Project Change

No reference counterpart.
Files affected: `src/rio.c` (modified)
Change type: add
Location: Above `rio_readn`.
Dependencies: The `rio_t` structure defined in the first unit.

### The New Code

```c
void rio_readinitb(rio_t *rp, int fd) {
    rp->rio_fd     = fd;
    rp->rio_cnt    = 0;
    rp->rio_bufptr = rp->rio_buf;
}

/* Internal: refill buffer if empty */
static ssize_t rio_read(rio_t *rp, char *usrbuf, size_t n) {
    while (rp->rio_cnt <= 0) {
        rp->rio_cnt = read(rp->rio_fd, rp->rio_buf, sizeof(rp->rio_buf));
        if (rp->rio_cnt < 0) {
            if (errno != EINTR)
                return -1;
        } else if (rp->rio_cnt == 0) {
            return 0;  /* EOF */
        } else {
            rp->rio_bufptr = rp->rio_buf;
        }
    }
    size_t cnt = (n < (size_t)rp->rio_cnt) ? n : (size_t)rp->rio_cnt;
    memcpy(usrbuf, rp->rio_bufptr, cnt);
    rp->rio_bufptr += cnt;
    rp->rio_cnt    -= cnt;
    return cnt;
}
```

### The Updated Project

```c
11: 
12: void rio_readinitb(rio_t *rp, int fd) { // ← new
13:     rp->rio_fd     = fd; // ← new
14:     rp->rio_cnt    = 0; // ← new
15:     rp->rio_bufptr = rp->rio_buf; // ← new
16: } // ← new
17: 
18: /* Internal: refill buffer if empty */
19: static ssize_t rio_read(rio_t *rp, char *usrbuf, size_t n) { // ← new
20:     while (rp->rio_cnt <= 0) { // ← new
21:         rp->rio_cnt = read(rp->rio_fd, rp->rio_buf, sizeof(rp->rio_buf)); // ← new
22:         if (rp->rio_cnt < 0) { // ← new
23:             if (errno != EINTR) // ← new
24:                 return -1; // ← new
25:         } else if (rp->rio_cnt == 0) { // ← new
26:             return 0;  /* EOF */ // ← new
27:         } else { // ← new
28:             rp->rio_bufptr = rp->rio_buf; // ← new
29:         } // ← new
30:     } // ← new
31:     size_t cnt = (n < (size_t)rp->rio_cnt) ? n : (size_t)rp->rio_cnt; // ← new
32:     memcpy(usrbuf, rp->rio_bufptr, cnt); // ← new
33:     rp->rio_bufptr += cnt; // ← new
34:     rp->rio_cnt    -= cnt; // ← new
35:     return cnt; // ← new
36: } // ← new
37: 
38: /* Read exactly n bytes from fd... */
```

We added the initialization function `rio_readinitb` and the internal `rio_read` function, which acts as a buffered replacement for the standard `read()` system call.

### Mechanical walkthrough

- `void rio_readinitb(rio_t *rp, int fd)`
  - Declares the constructor for a `rio_t` struct.
- `rp->rio_fd = fd;`
  - Stores the underlying file descriptor into the struct so future calls know where to read from.
- `rp->rio_cnt = 0;`
  - Sets the initial count of unread bytes in the buffer to 0.
- `rp->rio_bufptr = rp->rio_buf;`
  - Points the read pointer to the very beginning of the internal array.
- `static ssize_t rio_read(rio_t *rp, char *usrbuf, size_t n)`
  - Declares an internal helper function. The `static` keyword hides it from other files. It takes a pointer to the initialized `rio_t` struct, a destination buffer, and a requested size `n`.
- `while (rp->rio_cnt <= 0) {`
  - Starts a loop that only executes if the internal buffer is empty. If it has data, it skips this system-call loop entirely.
- `rp->rio_cnt = read(rp->rio_fd, rp->rio_buf, sizeof(rp->rio_buf));`
  - Calls the OS `read()` to pull as much data as possible (up to the 8192-byte capacity of the buffer) directly into the `rio_t` internal array.
- `if (rp->rio_cnt < 0) {`
  - Checks for a read error.
- `if (errno != EINTR) return -1;`
  - If the error is not **EINTR**, returns -1. If it *is* EINTR, the loop repeats automatically because `rio_cnt` is still < 0.
- `} else if (rp->rio_cnt == 0) { return 0; }`
  - Returns 0 immediately on **EOF**.
- `else { rp->rio_bufptr = rp->rio_buf; }`
  - If data was successfully read, resets the buffer pointer back to the start of the array. The `while` loop then terminates because `rio_cnt` is now > 0.
- `size_t cnt = (n < (size_t)rp->rio_cnt) ? n : (size_t)rp->rio_cnt;`
  - Calculates how many bytes to actually hand to the user. It is the minimum of what the user requested (`n`) and what is currently available in the buffer (`rio_cnt`).
- `memcpy(usrbuf, rp->rio_bufptr, cnt);`
  - Copies `cnt` bytes from the internal buffer pointer to the user's buffer. Memory copying is much faster than a system call.
- `rp->rio_bufptr += cnt;`
  - Advances the internal buffer pointer past the copied bytes.
- `rp->rio_cnt -= cnt;`
  - Decreases the count of remaining bytes in the buffer.
- `return cnt;`
  - Returns the number of bytes copied to the user.

### CS lens

The concept is **Amortization via Buffering**. System calls cross the boundary between user space and kernel space, which requires saving registers, switching CPU privileges, and flushing TLB caches. By paying that cost once to load 8192 bytes, the next 8191 single-byte reads are effectively free memory accesses. The cost of the system call is amortized across many reads.

### SE lens

The principle is **Separation of Mechanism and Policy**. `rio_read` handles the complex mechanism of interacting with the kernel and maintaining state. The functions that call it (which we write next) define the policy of what a "line" is, without needing to know about `errno` or system calls.

### Commands needed

None for this unit.

### Run it

Predicted confidently: A call asking for 5 bytes when the buffer is empty triggers a real `read()`. If the socket delivers 100 bytes, `rio_read` copies 5 to the user, leaves 95 in the buffer, and updates the pointers. The next call asking for 10 bytes copies them directly from memory, no system call involved.

### One sentence connecting to previous unit

Now that we have a fast, stateful way to pull characters from a stream, we can efficiently scan for the end of a line.

---

## Concept Unit: Reading Lines

### The Problem

HTTP headers end with a newline `\n`. If a client sends a header, how do we extract just that one line so we can parse it? We need a function that reads data until it hits `\n`, null-terminates it as a proper C string, and leaves the remaining data untouched for the next request.

### Introduce the concept in isolation

```c
#include <stdio.h>

int main(void) {
    char stream[] = "hello\nworld\n";
    char buffer[10];
    int i = 0;
    
    /* Naive line extraction logic */
    while (i < 9) {
        char c = stream[i];
        buffer[i] = c;
        i++;
        if (c == '\n') break;
    }
    buffer[i] = '\0'; /* null-terminate */
    printf("Extracted line: %s", buffer);
    return 0;
}
/* Proves we can stop exactly at a newline and create a valid C string */
```

Predicted confidently: `Extracted line: hello\n`.
This output proves the concept of **character-by-character scanning**. By evaluating each character as it comes in, we can stop the transfer the moment a delimiter is found.

### Discard the throwaway

This throwaway code is discarded. We will implement this using our new buffered `rio_read` function.

### Project Change

No reference counterpart.
Files affected: `src/rio.c` (modified)
Change type: add
Location: Between `rio_read` and `rio_readn`.
Dependencies: The `rio_read` function from the previous unit.

### The New Code

```c
/* Read a text line (up to maxlen-1 chars, null-terminated) */
ssize_t rio_readline(rio_t *rp, void *usrbuf, size_t maxlen) {
    ssize_t n;
    size_t  nleft = maxlen - 1;
    char    c;
    char   *bufp = usrbuf;

    while (nleft > 0) {
        n = rio_read(rp, &c, 1);
        if (n == 1) {
            *bufp++ = c;
            nleft--;
            if (c == '\n') break;  /* stop at newline */
        } else if (n == 0) {
            break;  /* EOF */
        } else {
            return -1;  /* error */
        }
    }
    *bufp = '\0';  /* null-terminate */
    return maxlen - 1 - nleft;  /* chars read (not counting null) */
}
```

### The Updated Project

```c
37: 
38: /* Read a text line (up to maxlen-1 chars, null-terminated) */
39: ssize_t rio_readline(rio_t *rp, void *usrbuf, size_t maxlen) { // ← new
40:     ssize_t n; // ← new
41:     size_t  nleft = maxlen - 1; // ← new
42:     char    c; // ← new
43:     char   *bufp = usrbuf; // ← new
44: // ← new
45:     while (nleft > 0) { // ← new
46:         n = rio_read(rp, &c, 1); // ← new
47:         if (n == 1) { // ← new
48:             *bufp++ = c; // ← new
49:             nleft--; // ← new
50:             if (c == '\n') break;  /* stop at newline */ // ← new
51:         } else if (n == 0) { // ← new
52:             break;  /* EOF */ // ← new
53:         } else { // ← new
54:             return -1;  /* error */ // ← new
55:         } // ← new
56:     } // ← new
57:     *bufp = '\0';  /* null-terminate */ // ← new
58:     return maxlen - 1 - nleft;  /* chars read (not counting null) */ // ← new
59: } // ← new
60: 
61: /* Read exactly n bytes from fd... */
```

We now have `rio_readline`, which uses `rio_read` to rapidly pull characters one at a time from memory until it finds a newline.

### Mechanical walkthrough

- `ssize_t rio_readline(rio_t *rp, void *usrbuf, size_t maxlen)`
  - Declares the function. It takes the buffered context `rp`, the user's destination buffer, and a maximum length to prevent buffer overflows.
- `ssize_t n;`
  - Variable to hold the result of `rio_read` (number of bytes returned).
- `size_t nleft = maxlen - 1;`
  - We reserve one byte immediately for the mandatory null terminator `\0`.
- `char c;`
  - A temporary character variable to hold the single byte fetched.
- `char *bufp = usrbuf;`
  - Pointer to the current writing position in the user buffer.
- `while (nleft > 0) {`
  - Loops until the user buffer is full (minus the null terminator slot).
- `n = rio_read(rp, &c, 1);`
  - Asks our internal `rio_read` function for exactly 1 byte, storing it in `c`. Because of buffering, this usually just copies a byte from memory without a system call.
- `if (n == 1) {`
  - Checks if a byte was successfully read.
- `*bufp++ = c;`
  - Writes the character into the user buffer and increments the pointer.
- `nleft--;`
  - Decreases the remaining space count.
- `if (c == '\n') break;`
  - If the character just stored was a newline, breaks out of the loop immediately. The line is complete.
- `} else if (n == 0) { break; }`
  - If `rio_read` returns 0, it means **EOF**. We break out of the loop and process whatever we managed to read so far.
- `else { return -1; }`
  - Any other return value (like -1) means a fatal read error, which is immediately propagated up.
- `*bufp = '\0';`
  - After the loop finishes (either by hitting maxlen, EOF, or a newline), writes a null terminator to make the buffer a valid C string.
- `return maxlen - 1 - nleft;`
  - Calculates the number of characters actually read (excluding the null terminator) by subtracting the remaining space from the initial available space, and returns it.

### CS lens

The concept is **Protocol Framing**. In a raw TCP stream, there are no message boundaries — it's just a continuous tube of bytes. `rio_readline` imposes framing on that stream by treating `\n` as a delimiter, allowing an application to extract discrete, semantic messages out of a continuous flow.

### SE lens

The principle is **Safety by Default**. The `maxlen` parameter forces the caller to specify the size of their buffer, and `rio_readline` enforces it rigidly, reserving space for the null terminator. The alternative is functions like `gets()` which assume infinite buffer space, leading directly to buffer overflow security vulnerabilities.

### Commands needed

None for this unit.

### Run it

Predicted confidently: Reading `GET / HTTP/1.0\r\n` from a socket into a fresh buffer:
- `rio_read` calls `read()` and pulls 512 bytes into `rp->rio_buf`.
- `rio_readline` reads 'G', 'E', 'T', space, '/', space, 'H', 'T', 'T', 'P', '/', '1', '.', '0', '\r', '\n' directly from memory.
- Loop breaks at '\n'. Returns 17. Output buffer is `"GET / HTTP/1.0\r\n"`.

### One sentence connecting to previous unit

We now have all the tools needed to build a complete, robust server that echoes back text lines.

---

## Concept Unit: A Complete Echo Server

### The Problem

How do we actually put `rio_readinitb`, `rio_readline`, and `rio_writen` together to make a real network application? Can we build a server that accepts a connection, reads lines of text robustly, and writes them back out without crashing if the network hiccups?

### Introduce the concept in isolation

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <unistd.h>

int main(void) {
    /* Create a basic passive socket to prove the network API calls */
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(7778);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenfd, (struct sockaddr*)&addr, sizeof(addr));
    listen(listenfd, 5);
    printf("Socket created and listening on 7778\n");
    close(listenfd);
    return 0;
}
```

Predicted confidently: `Socket created and listening on 7778`.
This output proves that the sequence of `socket()`, `bind()`, and `listen()` successfully prepares the operating system to accept incoming connections on a specified port.

### Discard the throwaway

This throwaway code is discarded. We will use these system calls in our final echo server.

### Project Change

No reference counterpart.
Files affected: `src/echo.c` (created)
Change type: add
Location: New file
Dependencies: The `rio.c` functions built in the previous units.

### The New Code

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>
#include <stdio.h>
#include <unistd.h>

/* (Assume rio_t, rio_readinitb, rio_readline, rio_writen defined/included here) */

void echo(int connfd) {
    rio_t rio;
    char  buf[8192];
    ssize_t n;

    rio_readinitb(&rio, connfd);
    /* Echo each line back until EOF */
    while ((n = rio_readline(&rio, buf, sizeof(buf))) > 0) {
        rio_writen(connfd, buf, n);
    }
}

int main(void) {
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(7777);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenfd, (struct sockaddr*)&addr, sizeof(addr));
    listen(listenfd, 5);

    int connfd = accept(listenfd, NULL, NULL);
    echo(connfd);
    close(connfd);
    close(listenfd);
    return 0;
}
```

### The Updated Project

```c
1: #include <sys/socket.h>
2: #include <netinet/in.h>
3: #include <string.h>
4: #include <stdio.h>
5: #include <unistd.h>
6: 
7: /* (Assume rio_t, rio_readinitb, rio_readline, rio_writen defined/included here) */
8: 
9: void echo(int connfd) { // ← new
10:     rio_t rio; // ← new
11:     char  buf[8192]; // ← new
12:     ssize_t n; // ← new
13: 
14:     rio_readinitb(&rio, connfd); // ← new
15:     /* Echo each line back until EOF */
16:     while ((n = rio_readline(&rio, buf, sizeof(buf))) > 0) { // ← new
17:         rio_writen(connfd, buf, n); // ← new
18:     } // ← new
19: } // ← new
20: 
21: int main(void) { // ← new
22:     int listenfd = socket(AF_INET, SOCK_STREAM, 0); // ← new
23:     int opt = 1; // ← new
24:     setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)); // ← new
25:     struct sockaddr_in addr = {0}; // ← new
26:     addr.sin_family = AF_INET; // ← new
27:     addr.sin_port = htons(7777); // ← new
28:     addr.sin_addr.s_addr = INADDR_ANY; // ← new
29:     bind(listenfd, (struct sockaddr*)&addr, sizeof(addr)); // ← new
30:     listen(listenfd, 5); // ← new
31: 
32:     int connfd = accept(listenfd, NULL, NULL); // ← new
33:     echo(connfd); // ← new
34:     close(connfd); // ← new
35:     close(listenfd); // ← new
36:     return 0; // ← new
37: } // ← new
```
This is a complete, runnable server that leverages the robust Rio functions to handle short counts safely.

### Mechanical walkthrough

- `void echo(int connfd)`
  - Declares an `echo` function that takes a connected file descriptor `connfd`.
- `rio_t rio;`
  - Allocates the `rio_t` buffer structure on the stack.
- `char buf[8192];`
  - Allocates a user buffer to hold a single line of text.
- `ssize_t n;`
  - A variable to store the number of bytes returned by `rio_readline`.
- `rio_readinitb(&rio, connfd);`
  - Initializes the buffered read structure, tying it to the connection socket.
- `while ((n = rio_readline(&rio, buf, sizeof(buf))) > 0) {`
  - Calls `rio_readline` to fetch a line. The loop continues as long as data is returned (> 0). It automatically breaks on **EOF** (0).
- `rio_writen(connfd, buf, n);`
  - Calls `rio_writen` to send those exact `n` bytes back to the client, guaranteeing that a short write will retry automatically.
- `int main(void) {`
  - The entry point for the server program.
- `int listenfd = socket(AF_INET, SOCK_STREAM, 0);`
  - Creates a new IPv4 (`AF_INET`) TCP stream socket (`SOCK_STREAM`) and gets its file descriptor, `listenfd`.
- `int opt = 1; setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));`
  - Configures the socket to bypass port reuse time-limits, making restarts faster during development.
- `struct sockaddr_in addr = {0};`
  - Declares and zeroes out a structure to hold the server's address information.
- `addr.sin_family = AF_INET; addr.sin_port = htons(7777); addr.sin_addr.s_addr = INADDR_ANY;`
  - Sets the address family to IPv4, sets the port to 7777 (converted to network byte order), and tells it to listen on all available network interfaces.
- `bind(listenfd, (struct sockaddr*)&addr, sizeof(addr));`
  - Associates the socket with the specified port and address.
- `listen(listenfd, 5);`
  - Tells the kernel to accept incoming connection requests on this socket, queuing up to 5 pending connections.
- `int connfd = accept(listenfd, NULL, NULL);`
  - Blocks until a client connects. Once connected, returns a brand new socket `connfd` specifically for talking to that client.
- `echo(connfd);`
  - Passes the connected socket to the `echo` function to handle the I/O.
- `close(connfd);`
  - Closes the connection to the client after the echo loop finishes (EOF).
- `close(listenfd);`
  - Closes the main listening socket before exiting.
- `return 0;`
  - Exits the program successfully.

### CS lens

The concept is **Event Blocking**. The `accept()` call blocks the entire thread, halting execution until the OS network stack detects a complete TCP handshake from a client. Only then does it unblock and provide `connfd`. The process sleeps entirely in the meantime, consuming no CPU.

### SE lens

The principle is **Dependency Injection**. The `echo` function is not responsible for creating the socket or determining the port. It merely accepts an `int connfd` and operates on it. This makes the `echo` logic highly reusable; it can just as easily echo data to a file or a pipe without modifying its source code.

### Commands needed

None for this unit.

### Run it

Predicted confidently: 
1. The server starts and blocks on `accept()`.
2. A client runs `echo "hello" | nc localhost 7777`.
3. `accept()` returns `connfd`.
4. `rio_readinitb` initializes the state.
5. `rio_readline` calls `rio_read`, reading 'hello\n' into the internal buffer, then parses it into `buf`, returning 6.
6. `rio_writen` reliably writes 'hello\n' back to `connfd`.
7. Next `rio_readline` sees EOF (because the client closed the connection), returns 0.
8. Loop exits. Sockets are closed.

### One sentence connecting to previous unit

This complete application proves that combining robust buffered reads and retry loops handles the unpredictable nature of network I/O smoothly.

---

## Closing

### Connect the pieces

We set out to build robust I/O handling for a network server. A complete file read using all Rio functions traces through every unit we've covered: 
1. We start by initializing the buffer with `rio_readinitb`, connecting our `rio_t` state to the raw socket.
2. We call `rio_readline` to ask for a line of text.
3. Because the internal buffer is empty, `rio_readline` calls `rio_read`.
4. `rio_read` issues a raw `read()` system call to the OS, pulling up to 8192 bytes. If a signal like **EINTR** occurs here, the loop immediately retries.
5. The data is buffered, and `rio_read` hands one byte back to `rio_readline`.
6. `rio_readline` loops, checking each byte. Because it's pulling from the internal memory buffer now, it's fast. 
7. Once it finds `\n`, it terminates the string and returns it to application code.
8. The application code processes the line and calls `rio_writen` to send a response.
9. `rio_writen` loops over `write()`, guaranteeing that even if the OS encounters a **short count** and only writes half the data, it immediately retries and writes the rest before returning control.

Rio is the safe I/O layer for all network programming. Lesson 34 introduces concurrent programming — how to handle multiple connections simultaneously.
