# Lesson 31: Pipes and Redirection — IPC via the Kernel

What you will build:
The reader will understand Unix pipes as kernel-managed byte streams connecting processes: how `pipe()` creates a pair of file descriptors, how `fork()` + `dup2()` + `exec()` implements shell pipelines, and how FIFOs (named pipes) enable IPC between unrelated processes. The transferable insight: a pipe is just a bounded kernel buffer with two fds — one for reading, one for writing. Every shell pipeline, every `|` operator, is built from this single primitive.

What you need to know first:
Lessons 00-30.

Terms used in this lesson:
- **Pipe** — a unidirectional, memory-based byte stream managed by the OS kernel, solving the problem of how to pass data between isolated process memory spaces without writing to disk.
- **File descriptor** — an integer handle used by a process to identify an open file or I/O resource, solving the problem of abstracting diverse resources (files, pipes, sockets) behind a single `read`/`write` interface.
- **Kernel buffer** — a protected region of memory maintained by the OS, solving the problem of temporarily holding data in transit between a writer and a reader that may operate at different speeds.
- **Inter-Process Communication (IPC)** — mechanisms provided by the OS to allow isolated processes to share data, solving the problem of coordinating separate programs into a single system.
- **FIFO / Named pipe** — a pipe that exists as a node in the filesystem, solving the problem of establishing a pipe between two processes that do not share a common ancestor.
- **Blocking** — the state where a process is paused by the OS while waiting for an event (like data arriving), solving the problem of preventing a process from wasting CPU cycles polling an empty resource.
- **EOF (End of File)** — a condition indicating no more data will ever be available, solving the problem of knowing when to stop reading.
- **Atomic write** — a write operation that completes entirely or not at all, solving the problem of data interleaving when multiple processes write to the same pipe.

Objects and methods used:
- **`pipe()`**
  - *What it is:* A system call that creates a unidirectional data channel.
  - *Implementation:* `int pipe(int pipefd[2]);`
  - *Its use:* We use it to create a paired read/write channel before forking, establishing the backbone of our IPC.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Allocates a kernel buffer and returns two file descriptors linked to it (one for reading, one for writing).
  - *Depends on:* An integer array of size 2 to populate the file descriptors.
  - *Connects to:* Called by the user program, calls into the kernel to allocate resources, returns the descriptors to the caller.
  - *Shape:* A fundamental OS resource allocation boundary.

- **`fork()`**
  - *What it is:* A system call that creates a new process.
  - *Implementation:* `pid_t fork(void);`
  - *Its use:* We use it to spawn child processes that will execute the programs in our pipeline.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Clones the calling process entirely, resulting in a parent and a child process with independent execution but identical open file descriptors.
  - *Depends on:* The OS having sufficient resources to allocate a new process control block.
  - *Connects to:* Called by the parent process; returns twice (once in parent with child PID, once in child with 0).
  - *Shape:* Process creation boundary.

- **`read()`**
  - *What it is:* A system call to pull bytes from a file descriptor.
  - *Implementation:* `ssize_t read(int fd, void *buf, size_t count);`
  - *Its use:* We use it to pull data out of the read end of a pipe.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Copies up to `count` bytes from the kernel buffer backing `fd` into the user-provided `buf`.
  - *Depends on:* A valid open file descriptor and a sufficiently large memory buffer.
  - *Connects to:* Reads from OS kernel space to user space memory.
  - *Shape:* Data ingestion boundary.

- **`write()`**
  - *What it is:* A system call to push bytes into a file descriptor.
  - *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
  - *Its use:* We use it to push data into the write end of a pipe.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Copies `count` bytes from the user-provided `buf` into the kernel buffer backing `fd`.
  - *Depends on:* A valid open file descriptor and initialized data in the buffer.
  - *Connects to:* Writes from user space memory into OS kernel space.
  - *Shape:* Data exfiltration boundary.

- **`close()`**
  - *What it is:* A system call to release a file descriptor.
  - *Implementation:* `int close(int fd);`
  - *Its use:* We use it to sever a process's connection to a pipe end, which is critical for signaling EOF.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Deallocates the file descriptor and decrements the reference count of the underlying file description.
  - *Depends on:* An open file descriptor.
  - *Connects to:* Notifies the kernel that this process is done with the resource.
  - *Shape:* Resource cleanup boundary.

- **`dup2()`**
  - *What it is:* A system call to duplicate a file descriptor onto a specific target number.
  - *Implementation:* `int dup2(int oldfd, int newfd);`
  - *Its use:* We use it to overwrite standard input (0) or standard output (1) with our pipe descriptors.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Closes `newfd` if open, then makes `newfd` a clone of `oldfd`, pointing to the same underlying kernel resource.
  - *Depends on:* A valid `oldfd` and the desired `newfd` target integer.
  - *Connects to:* Alters the process's file descriptor table in the kernel.
  - *Shape:* File descriptor routing boundary.

- **`execlp()`**
  - *What it is:* A library function to replace the current process image with a new program.
  - *Implementation:* `int execlp(const char *file, const char *arg, ... /* (char  *) NULL */);`
  - *Its use:* We use it to transform our forked child into `ls` or `wc`.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Loads a new executable from the PATH, replacing the calling process's memory space entirely.
  - *Depends on:* The program existing in the PATH and proper null-terminated arguments.
  - *Connects to:* Reads the binary from disk and hands control to its entry point.
  - *Shape:* Process replacement boundary.

- **`mkfifo()`**
  - *What it is:* A system call to create a named pipe in the filesystem.
  - *Implementation:* `int mkfifo(const char *pathname, mode_t mode);`
  - *Its use:* We use it to create a rendezvous point for unrelated processes.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Creates a special file on disk that acts as a pipe rather than a regular file.
  - *Depends on:* Write permissions in the target directory and a valid pathname.
  - *Connects to:* Modifies the filesystem namespace.
  - *Shape:* Filesystem structural boundary.

- **`open()`**
  - *What it is:* A system call to open a file or FIFO.
  - *Implementation:* `int open(const char *pathname, int flags);`
  - *Its use:* We use it to connect to the named pipe we created.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Resolves a path to a file description and returns a new file descriptor.
  - *Depends on:* Path existence and proper permissions.
  - *Connects to:* Maps a filesystem node to a process file descriptor.
  - *Shape:* Resource acquisition boundary.

- **`waitpid()`**
  - *What it is:* A system call to wait for a child process to change state.
  - *Implementation:* `pid_t waitpid(pid_t pid, int *wstatus, int options);`
  - *Its use:* We use it to ensure the parent waits for the pipeline children to finish.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Suspends execution of the calling process until a child specified by `pid` terminates.
  - *Depends on:* A valid child PID.
  - *Connects to:* Reaps the zombie process from the kernel's process table.
  - *Shape:* Process synchronization boundary.

- **`fpathconf()`**
  - *What it is:* A library function to query file limits.
  - *Implementation:* `long fpathconf(int fd, int name);`
  - *Its use:* We use it to query the atomic write limit (`_PC_PIPE_BUF`) of our pipe.
  - *Type:* Standard C library function (POSIX).
  - *Responsibility:* Retrieves system-specific configuration values for an open file.
  - *Depends on:* A valid file descriptor and a configuration name constant.
  - *Connects to:* Reads kernel parameters related to the specific file descriptor.
  - *Shape:* System limits boundary.

Everything else in the file, not this lesson's subject but still explained:
- **`printf()`**
  - *What it is:* Formatted print function.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used to display output in the terminal to prove what was read.
  - *Type:* Standard C library function.
  - *Responsibility:* Formats and writes data to standard output.
  - *Depends on:* A format string and matching arguments.
  - *Connects to:* Writes to STDOUT_FILENO.
  - *Shape:* Output formatting.
- **`strlen()`**
  - *What it is:* String length calculator.
  - *Implementation:* `size_t strlen(const char *s);`
  - *Its use:* Computes the number of bytes to write to the pipe.
  - *Type:* Standard C library function.
  - *Responsibility:* Counts characters until the null terminator.
  - *Depends on:* A valid null-terminated string.
  - *Connects to:* Reads memory.
  - *Shape:* Memory inspection.
- **`perror()`**
  - *What it is:* Error message printer.
  - *Implementation:* `void perror(const char *s);`
  - *Its use:* Prints diagnostic info if `execlp` fails.
  - *Type:* Standard C library function.
  - *Responsibility:* Prints the provided string and the string representation of `errno`.
  - *Depends on:* The global `errno` value.
  - *Connects to:* Writes to standard error.
  - *Shape:* Error handling.

## Concept Unit: What a pipe is — the kernel byte stream

### The Problem
If a process generates data in its own private memory space, how can another process read it without writing it all to a file on a slow disk? Given what you know about file descriptors, what would you try here first? What happens if you try to share a pointer directly between two isolated processes? 

### Introduce the concept in isolation
This code demonstrates a **Pipe**. We create a pipe, write to it, and read from it all within a single process to prove how the kernel buffer works.

```c
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main(void) {
    int pipefd[2];
    pipe(pipefd);  /* pipefd[0]=read, pipefd[1]=write */

    /* Write to write end */
    const char *msg = "hello through the pipe\n";
    write(pipefd[1], msg, strlen(msg));

    /* Read from read end */
    char buf[64];
    ssize_t n = read(pipefd[0], buf, sizeof(buf));
    buf[n] = '\0';
    printf("received: %s", buf);

    close(pipefd[0]);
    close(pipefd[1]);
    return 0;
}
```

This proves that `pipe()` successfully provisions a hidden kernel buffer and returns two file descriptors to access it. Data written to the write end (`pipefd[1]`) is temporarily stored by the kernel and successfully retrieved by reading the read end (`pipefd[0]`).

### Discard the throwaway
This throwaway code is explicitly discarded and will not be part of the final project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental IPC primitives before applying them in a larger shell project.
- **Files affected**: `src/pipe_demo.c` (created)
- **Change type**: add
- **Location**: N/A (new file)
- **Dependencies**: standard POSIX headers.

### The New Code

```c
int pipefd[2];
pipe(pipefd);
```

### The Updated Project

```c
// ← new (Lines 1-6)
#include <unistd.h>

int main(void) {
    int pipefd[2];
    pipe(pipefd);
    return 0;
}
```
This structure creates a new program that asks the OS for a pipe, receiving the two file descriptors back into the `pipefd` array.

### Mechanical walkthrough
- `int pipefd[2];` — declares an array of two integers on the stack to hold the returned file descriptors.
- `pipe(` — calls the system call to instantiate the kernel buffer.
- `pipefd` — passes the array pointer as an output parameter where the kernel will write the descriptor numbers.
- `);` — ends the statement.

### CS lens
This embodies the **Producer-Consumer** concept via a bounded buffer. Also recognized in: Go channels, TCP stream windows, hardware UART FIFOs, and audio playback buffers.

### SE lens
The design principle here is **Abstraction**. The alternative not chosen was creating a completely new set of system calls (e.g., `pipe_send`, `pipe_recv`). The real tradeoff is that by reusing the existing file descriptor interface, pipes integrate seamlessly with tools expecting files, but they carry file-specific baggage (like lack of message boundaries) that makes discrete message framing harder.

### Commands needed
```bash
gcc -o pipe_demo src/pipe_demo.c
```
Compiles the C source file into an executable binary. Success outputs nothing.

### Run it
Predicted confidently: The code will compile and execute silently, terminating immediately with return code 0. It sets up the kernel pipe and immediately tears it down when the process exits.

### One sentence connecting to previous unit
Now that we have a pipe within one process, we must split it across two to actually perform inter-process communication.

## Concept Unit: Pipe + fork — parent-child communication

### The Problem
If a pipe provides two file descriptors to the process that calls `pipe()`, how do we get those descriptors into a *different* process? Given what `fork()` does to file descriptors, what would you try here first? What happens if both processes keep both ends of the pipe open?

### Introduce the concept in isolation
This code demonstrates the **Forked Pipe**. We create a pipe, then `fork()`, allowing the parent and child to speak to each other.

```c
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <sys/wait.h>

int main(void) {
    int pipefd[2];
    pipe(pipefd);

    pid_t pid = fork();
    if (pid == 0) {
        close(pipefd[1]);  
        char buf[128];
        ssize_t n = read(pipefd[0], buf, sizeof(buf));
        buf[n] = '\0';
        printf("child received: %s", buf);
        close(pipefd[0]);
        return 0;
    }
    
    close(pipefd[0]);  
    const char *msg = "data from parent\n";
    write(pipefd[1], msg, strlen(msg));
    close(pipefd[1]);  
    waitpid(pid, NULL, 0);
    return 0;
}
```

This proves that `fork()` clones the file descriptors, granting both processes access to the same underlying kernel pipe. It also proves that closing unused ends is essential: the parent closes the read end, the child closes the write end, and when the parent writes and closes, the child receives the data and then successfully encounters EOF (because zero write ends remain open across the entire system).

### Discard the throwaway
This throwaway code is discarded; it solely exists to prove the mechanism of sharing a pipe across a fork boundary.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are building up to the pipeline mechanism.
- **Files affected**: `src/pipe_fork.c` (created)
- **Change type**: add
- **Location**: N/A
- **Dependencies**: POSIX process control headers.

### The New Code

```c
pid_t pid = fork();
if (pid == 0) {
    close(pipefd[1]);
} else {
    close(pipefd[0]);
}
```

### The Updated Project

```c
// ← new (Lines 1-13)
#include <unistd.h>

int main(void) {
    int pipefd[2];
    pipe(pipefd);
    
    pid_t pid = fork();
    if (pid == 0) {
        close(pipefd[1]);
    } else {
        close(pipefd[0]);
    }
    return 0;
}
```
This structure creates the pipe, duplicates the process via `fork()`, and immediately has each resulting process close the end of the pipe it does not intend to use.

### Mechanical walkthrough
- `pid_t pid` — declares a variable to hold the process ID returned by `fork`.
- `= fork();` — invokes the system call to split the process in two.
- `if (pid == 0) {` — checks if the current executing path is the child process.
- `close(pipefd[1]);` — in the child, invokes the system call to close the write end of the pipe.
- `} else {` — begins the block for the parent process.
- `close(pipefd[0]);` — in the parent, invokes the system call to close the read end of the pipe.
- `}` — ends the conditional block.

### CS lens
This embodies the **Capabilities Distribution** concept. Also recognized in: passing file handles over Unix domain sockets, OAuth token delegation, dropping privileges after port binding, and restricted chroot jails.

### SE lens
The design principle here is **Least Privilege**. The alternative not chosen was leaving all ends open in all processes. The real tradeoff is that forcing processes to eagerly close unused capabilities requires manual developer hygiene, but failing to do so breaks the reference-counted EOF mechanism, leading to infinite blocking.

### Commands needed
```bash
gcc -o pipe_fork src/pipe_fork.c
```
Compiles the C source file into an executable binary.

### Run it
Predicted confidently: The code compiles cleanly and, if run, exits silently with code 0 because we have stripped out the actual reading and writing.

### One sentence connecting to previous unit
Now that two processes share a pipe, we can extend this pattern to run two entirely different programs connected by that pipe.

## Concept Unit: Implementing a shell pipeline: 'ls | wc -l'

### The Problem
We can communicate between a parent and a child, but standard utilities like `ls` and `wc` don't know about `pipefd[0]` or `pipefd[1]`; they only read from standard input (0) and write to standard output (1). How can we wire our pipe into these programs? Given what you know about `dup2`, what would you try here first?

### Introduce the concept in isolation
This code demonstrates the **Shell Pipeline**. We combine `pipe`, `fork`, `dup2`, and `exec` to mirror the shell operator `|`.

```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

int main(void) {
    int pipefd[2];
    pipe(pipefd);

    pid_t pid1 = fork();
    if (pid1 == 0) {
        close(pipefd[0]);          
        dup2(pipefd[1], STDOUT_FILENO); 
        close(pipefd[1]);
        execlp("ls", "ls", NULL);  
        perror("ls"); return 1;
    }

    pid_t pid2 = fork();
    if (pid2 == 0) {
        close(pipefd[1]);          
        dup2(pipefd[0], STDIN_FILENO);  
        close(pipefd[0]);
        execlp("wc", "wc", "-l", NULL); 
        perror("wc"); return 1;
    }

    close(pipefd[0]);
    close(pipefd[1]);
    waitpid(pid1, NULL, 0);
    waitpid(pid2, NULL, 0);
    return 0;
}
```

This proves that `dup2()` successfully reroutes a standard stream (like STDOUT) to point to the pipe's write end. When `exec` replaces the process image, the file descriptor table is preserved, so `ls` seamlessly writes its output into the pipe, and `wc` seamlessly reads from it. The parent successfully orchestrates this by closing its own copies of the pipe descriptors so `wc` receives EOF when `ls` exits.

### Discard the throwaway
This throwaway code is discarded; it is a hardcoded pipeline demonstration and will not remain in the project.

### Project Change
- **Reference Source**: No reference counterpart — this builds the core mechanism needed for a shell.
- **Files affected**: `src/pipeline.c` (created)
- **Change type**: add
- **Location**: N/A
- **Dependencies**: POSIX standard library headers.

### The New Code

```c
dup2(pipefd[1], STDOUT_FILENO);
close(pipefd[1]);
execlp("ls", "ls", NULL);
```

### The Updated Project

```c
// ← new (Lines 1-8)
#include <unistd.h>

void run_ls(int pipefd[2]) {
    close(pipefd[0]);
    dup2(pipefd[1], STDOUT_FILENO);
    close(pipefd[1]);
    execlp("ls", "ls", NULL);
}
```
This structure encapsulates the specific sequence required to mutate a child process into `ls`, explicitly mapping its standard output into the write end of our provided pipe.

### Mechanical walkthrough
- `dup2(` — invokes the system call to duplicate a file descriptor.
- `pipefd[1]` — the old descriptor (the write end of the pipe).
- `, STDOUT_FILENO` — the new target descriptor (file descriptor 1).
- `);` — ends the duplication.
- `close(pipefd[1]);` — closes the original pipe descriptor since stdout now securely holds a reference to the pipe.
- `execlp(` — invokes the library function to replace the process.
- `"ls"` — the executable name to search for in PATH.
- `, "ls"` — the `argv[0]` argument passed to the program.
- `, NULL);` — null terminator indicating the end of the arguments list.

### CS lens
This embodies the **Composition** concept. Also recognized in: functional programming's `compose` operations, hardware stream multiplexing, stream filters in Java, and microservice HTTP request chaining.

### SE lens
The design principle here is the **Decorator Pattern** (applied at the system architecture level). The alternative not chosen was having `ls` directly understand IPC mechanisms and formatting. The real tradeoff is that small, isolated tools are highly reusable and easy to test, but performance pays a heavy serialization and context-switching tax compared to a monolithic tool that does everything internally.

### Commands needed
```bash
gcc -o pipeline src/pipeline.c
```
Compiles the C source file into an executable binary.

### Run it
Predicted confidently: The code will compile silently. If run, the logic maps STDOUT to the pipe, causing `ls` to output directly to the next process (or block forever if no reader exists, since we isolated just the writer side in the Updated Project block).

### One sentence connecting to previous unit
While `pipe()` solves the problem for processes spawned from a common parent, processes started entirely independently need a different way to find each other.

## Concept Unit: FIFOs — named pipes

### The Problem
If process A is started in terminal 1, and process B is started an hour later in terminal 2, they cannot share a `pipe()` because they have no common parent to inherit from. How can two disconnected processes discover the same kernel buffer? Given what you know about the filesystem, what would you try here first?

### Introduce the concept in isolation
This code demonstrates the **FIFO (Named Pipe)**. Unrelated processes can communicate by opening a special file path.

```c
/* Process A: writer */
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main(void) {
    mkfifo("/tmp/myfifo", 0644);  
    int fd = open("/tmp/myfifo", O_WRONLY); 
    const char *msg = "hello from writer\n";
    write(fd, msg, strlen(msg));
    close(fd);
    return 0;
}

/* Process B: reader (run in a second terminal) */
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/myfifo", O_RDONLY); 
    char buf[128];
    ssize_t n = read(fd, buf, sizeof(buf));
    buf[n] = '\0';
    printf("reader got: %s", buf);
    close(fd);
    return 0;
}
```

This proves that `mkfifo()` provisions a visible node in the filesystem. Both processes use the standard `open()` call to connect to it. Crucially, it proves that `open()` blocks: the writer pauses until the reader opens the FIFO, synchronizing the two processes across terminals.

### Discard the throwaway
This throwaway code is discarded; it serves only to prove cross-terminal IPC.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition illustrating an alternative to anonymous pipes.
- **Files affected**: `src/fifo_demo.c` (created)
- **Change type**: add
- **Location**: N/A
- **Dependencies**: POSIX stat and fcntl headers.

### The New Code

```c
mkfifo("/tmp/myfifo", 0644);
int fd = open("/tmp/myfifo", O_WRONLY);
```

### The Updated Project

```c
// ← new (Lines 1-7)
#include <sys/stat.h>
#include <fcntl.h>

int main(void) {
    mkfifo("/tmp/myfifo", 0644);
    int fd = open("/tmp/myfifo", O_WRONLY);
    return 0;
}
```
This structure creates a program that constructs a FIFO special file and attempts to open it for writing, which will block until another process opens it for reading.

### Mechanical walkthrough
- `mkfifo(` — invokes the system call to create a FIFO.
- `"/tmp/myfifo"` — string literal naming the absolute path of the rendezvous point.
- `, 0644` — octal permission bits (read/write for owner, read for others).
- `);` — ends the statement.
- `int fd` — declares an integer to hold the returned file descriptor.
- `= open(` — invokes the system call to open the resource.
- `"/tmp/myfifo"` — the identical string literal identifying the node.
- `, O_WRONLY` — flag dictating the process intends only to push data, triggering the blocking mechanism until a reader appears.
- `);` — ends the statement.

### CS lens
This embodies the **Rendezvous Point** concept. Also recognized in: DNS SRV records, Windows Named Pipes, Unix domain socket paths, and message queue topics (e.g., Kafka).

### SE lens
The design principle here is **Namespace Unification**. The alternative not chosen was creating a completely separate registry for named IPC channels. The real tradeoff is that exposing IPC via the filesystem leverages existing permissions (like `chmod` or `chown`) and tooling (like `ls`), but litters the file tree with ephemeral nodes that must be explicitly cleaned up.

### Commands needed
```bash
gcc -o fifo_demo src/fifo_demo.c
```
Compiles the C source file into an executable binary.

### Run it
Predicted confidently: The program will compile silently. If executed, it will block indefinitely (hang the terminal) because no reader process is actively opening the other end.

### One sentence connecting to previous unit
Whether the pipe is anonymous or named, it relies on a finite kernel buffer which dictates how processes block and unblock.

## Concept Unit: Pipe capacity and blocking behavior

### The Problem
A pipe sits entirely in memory, and RAM is finite. What happens if a writer program produces gigabytes of data faster than the reader program can consume it? Given what you know about process blocking, what would you try here first?

### Introduce the concept in isolation
This code demonstrates **Pipe Capacity and Blocking**. We interrogate the system constraints placed on pipes.

```c
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int pipefd[2];
    pipe(pipefd);

    long cap = fpathconf(pipefd[1], _PC_PIPE_BUF);
    printf("PIPE_BUF (atomic write size): %ld bytes\n", cap);

    close(pipefd[1]);  
    char buf[4];
    ssize_t n = read(pipefd[0], buf, sizeof(buf));
    printf("read after close: %zd (EOF = 0)\n", n);  

    close(pipefd[0]);
    return 0;
}
```

This proves that pipes have an atomic write size limit (`PIPE_BUF`), usually 4096 bytes on Linux. Writes smaller than this are never interleaved. It also proves the exact mechanism of EOF: reading from an empty pipe where all write descriptors are closed explicitly returns `0`, breaking out of blocking read loops.

### Discard the throwaway
This throwaway code is discarded; it verifies kernel limits programmatically but is unnecessary for our shell implementation.

### Project Change
- **Reference Source**: No reference counterpart — this explores system constraints programmatically.
- **Files affected**: `src/pipe_limits.c` (created)
- **Change type**: add
- **Location**: N/A
- **Dependencies**: POSIX standard library headers.

### The New Code

```c
long cap = fpathconf(pipefd[1], _PC_PIPE_BUF);
```

### The Updated Project

```c
// ← new (Lines 1-8)
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int pipefd[2];
    pipe(pipefd);
    long cap = fpathconf(pipefd[1], _PC_PIPE_BUF);
    return 0;
}
```
This structure creates a program that establishes a pipe and queries the kernel for the maximum number of bytes that can be written atomically.

### Mechanical walkthrough
- `long cap` — declares a variable to hold the returned capacity value.
- `= fpathconf(` — invokes the library function to query path configuration metadata via a file descriptor.
- `pipefd[1]` — passes the write end of the pipe as the target resource.
- `, _PC_PIPE_BUF` — passes the macro constant representing the configuration name for the atomic pipe buffer size limit.
- `);` — ends the statement.

### CS lens
This embodies the **Backpressure** concept. Also recognized in: TCP window sliding, Reactive Streams, leaky bucket algorithms for rate limiting, and asynchronous message queues with maximum depths.

### SE lens
The design principle here is **Fail-Safe Defaults**. The alternative not chosen was allowing pipes to allocate unbounded memory until the system crashed (OOM). The real tradeoff is that fixed bounds prevent system collapse and force producers to naturally throttle to consumer speeds (blocking), but introduces the risk of deadlocks if two processes try to write to each other's full pipes simultaneously.

### Commands needed
```bash
gcc -o pipe_limits src/pipe_limits.c
```
Compiles the C source file into an executable binary.

### Run it
Predicted confidently: The code will compile cleanly. When executed, it silently queries the limit and stores it in memory before exiting with 0.

### One sentence connecting to previous unit
Understanding how a pipe buffers data and blocks processes completes the picture of local Unix IPC.

## Closing

### Connect the pieces
When you run `ls | wc -l` in a shell, the shell calls `pipe()` to create a kernel buffer with a read and write descriptor. It calls `fork()` twice, creating two children. The first child uses `dup2()` to map its standard output (1) to the pipe's write descriptor, closes the pipe's read descriptor, and calls `execlp("ls")`. The second child uses `dup2()` to map its standard input (0) to the pipe's read descriptor, closes the write descriptor, and calls `execlp("wc")`. The parent shell explicitly closes *both* ends of the pipe in its own process and calls `waitpid()` for both children. `ls` runs, pushing atomic chunks into the kernel buffer via `write()`. `wc` reads these bytes via `read()`. When `ls` finishes, its standard output (the pipe's write end) is closed. Because the parent shell also closed its copy, the total number of open write ends drops to 0. `wc`'s final `read()` returns 0 (EOF), allowing it to print the line count and exit, finally unblocking the parent shell.
