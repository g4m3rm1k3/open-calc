# Lesson 28: Unix I/O — File Descriptors, open, read, write, close

What you will build: The reader will understand Unix I/O at the system call level: file descriptors as integers, open/read/write/close, short counts, file metadata with stat(), and I/O redirection. The transferable insight: 'everything is a file' — Unix I/O works identically for regular files, terminals, network sockets, pipes, and devices. One interface, many implementations.

What you need to know first: Lessons 00-27.

### Terms used in this lesson
- **File descriptor (fd)** — A small, non-negative integer that the OS kernel uses to identify an open file in a per-process table. It acts as a unified handle for reading and writing.
- **System call** — A programmatic request for a service from the kernel of the operating system, bridging user space and kernel space.
- **Short count** — A situation where a `read()` or `write()` operation transfers fewer bytes than requested. This happens normally with network sockets, pipes, and sometimes regular files (like hitting EOF).
- **File metadata** — Administrative data about a file, such as its size, owner, permissions, and timestamps, maintained by the OS separately from the file's contents.
- **I/O redirection** — The process of changing the standard input, output, or error streams to point to a different file or device instead of the terminal.

### Objects and methods used

**`open`**
- *What it is:* A system call to open a file or device.
- *Implementation:* `int open(const char *pathname, int flags, mode_t mode);`
- *Its use:* To acquire a new file descriptor for reading or writing a specific path.
- *Type:* Free function (system call wrapper).
- *Responsibility:* Instructs the kernel to allocate an entry in the process's file descriptor table, resolve the path, check permissions, and return the integer handle.
- *Depends on:* A valid file path string, access flags (e.g., `O_RDONLY`), and optionally file permissions (`mode`) if creating.
- *Connects to:* Called by user code, calls into the kernel's virtual file system layer.
- *Shape:* A fundamental OS boundary API.

**`close`**
- *What it is:* A system call to release a file descriptor.
- *Implementation:* `int close(int fd);`
- *Its use:* To free up a file descriptor so it can be reused, and to flush/release kernel resources associated with the open file.
- *Type:* Free function (system call wrapper).
- *Responsibility:* Removes the entry from the process's fd table and decrements the kernel's internal open file reference count.
- *Depends on:* A valid open file descriptor integer.
- *Connects to:* Called by user code when I/O is done.
- *Shape:* Cleanup/teardown boundary.

**`read`**
- *What it is:* A system call to read bytes from an open file descriptor.
- *Implementation:* `ssize_t read(int fd, void *buf, size_t count);`
- *Its use:* To pull data from a file, socket, or device into a user-provided memory buffer.
- *Type:* Free function (system call wrapper).
- *Responsibility:* Transfers up to `count` bytes from the kernel's file abstraction into user memory, updating the file offset.
- *Depends on:* An open file descriptor, a pre-allocated memory buffer, and the maximum number of bytes to read.
- *Connects to:* Called by user code, returns the actual number of bytes read (or error).
- *Shape:* Data ingestion boundary.

**`write`**
- *What it is:* A system call to write bytes to an open file descriptor.
- *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
- *Its use:* To push data from a user-provided memory buffer to a file, socket, or device.
- *Type:* Free function (system call wrapper).
- *Responsibility:* Transfers exactly or up to `count` bytes from user memory to the kernel's file abstraction.
- *Depends on:* An open file descriptor, a memory buffer containing data, and the number of bytes to write.
- *Connects to:* Called by user code, returns the actual number of bytes written.
- *Shape:* Data emission boundary.

**`stat`**
- *What it is:* A system call to retrieve file metadata.
- *Implementation:* `int stat(const char *restrict pathname, struct stat *restrict statbuf);`
- *Its use:* To query the size, permissions, and type of a file without opening it.
- *Type:* Free function (system call wrapper).
- *Responsibility:* Fills a provided `struct stat` with metadata fetched from the filesystem's inode table.
- *Depends on:* A file path and a pointer to an allocated `struct stat`.
- *Connects to:* Called by user code, accesses the filesystem metadata layer.
- *Shape:* Metadata query API.

**`dup2`**
- *What it is:* A system call to duplicate a file descriptor to a specific integer.
- *Implementation:* `int dup2(int oldfd, int newfd);`
- *Its use:* To redirect standard streams (like making fd 1 point to a file instead of the terminal).
- *Type:* Free function (system call wrapper).
- *Responsibility:* Closes `newfd` if open, then makes `newfd` refer to the exact same open file description as `oldfd`.
- *Depends on:* A valid `oldfd` and the desired target `newfd`.
- *Connects to:* Called by user code to modify the process's fd table.
- *Shape:* Process configuration API.

**Everything else in the file, not this lesson's subject but still explained**

**`perror`**
- *What it is:* A standard C library function to print a system error message.
- *Implementation:* `void perror(const char *s);`
- *Its use:* To log human-readable error reasons when a system call fails.
- *Type:* Free function (C standard library).
- *Responsibility:* Translates the global `errno` integer into an error string and prints it to stderr with a custom prefix.
- *Depends on:* A prefix string and the global `errno` state.
- *Connects to:* Writes to standard error.
- *Shape:* Diagnostic utility.

**`printf`**
- *What it is:* A standard C library function for formatted output.
- *Implementation:* `int printf(const char *format, ...);`
- *Its use:* To print formatted strings and integers to the terminal for observation.
- *Type:* Free function (C standard library).
- *Responsibility:* Formats a string and writes it to the standard output stream (fd 1).
- *Depends on:* A format string and a variable number of matching arguments.
- *Connects to:* Writes to standard output.
- *Shape:* Output utility.

## Concept Unit: File descriptors

### The Problem
How does an operating system keep track of which files a program is currently reading or writing? When you ask to read a file, how do you refer to it efficiently without sending the full file path string to the OS every single time? What happens if you open the same file twice? 

Given that a path is just a string, what would you try here first to refer to a file? What happens if this step is just skipped and we pass the path to every read?

### Introduce the concept in isolation
```c
#include <unistd.h>
#include <stdio.h>

int main(void) {
    /* fd 0, 1, 2 are always open */
    write(1, "hello via fd 1 (stdout)\n", 24);
    write(2, "error via fd 2 (stderr)\n", 24);
    
    printf("stdin  fd: %d\n", STDIN_FILENO);   /* 0 */
    printf("stdout fd: %d\n", STDOUT_FILENO);  /* 1 */
    printf("stderr fd: %d\n", STDERR_FILENO);  /* 2 */
    return 0;
}
```
**Predicted confidently (no execution needed):**
```text
hello via fd 1 (stdout)
error via fd 2 (stderr)
stdin  fd: 0
stdout fd: 1
stderr fd: 2
```
This proves that 0, 1, and 2 are pre-opened integer handles, and `write` can use them directly to print to the screen. This integer handle is called a **file descriptor**.

### Discard the throwaway
This isolated throwaway code is strictly for demonstration, discarded, and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to build the baseline I/O structures.
- **Files affected**: `src/io_demo.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: none

### The New Code
```c
#include <unistd.h>

void log_startup(void) {
    write(1, "system started\n", 15);
}
```

### The Updated Project
```c
// ← new (entire file)
1: #include <unistd.h>
2: 
3: void log_startup(void) {
4:     write(1, "system started\n", 15);
5: }
```
This new file establishes a function that uses standard file descriptors directly to output a startup message.

### Mechanical walkthrough
- `#include <unistd.h>` includes the POSIX standard definitions, enabling use of `write`.
- `void log_startup(void)` defines a new function taking no arguments and returning nothing.
- `{` begins the function body block.
- `write(` calls the system call wrapper for writing data.
- `1` is the file descriptor for standard output.
- `, "system started\n",` provides the string literal.
- `15` is the exact byte length of the string.
- `);` ends the function call.
- `}` closes the function body.

### CS lens
The fundamental CS concept is **indirection**. By giving the program a small integer instead of a large struct, the OS safely abstracts away file offsets, disk paths, and state in the kernel. This same concept appears in database connection IDs, OpenGL texture handles, and process IDs (PIDs).

### SE lens
The design principle is **Encapsulation**. The alternative not chosen is giving the program direct pointers to OS data structures. The real tradeoff is safety (kernel memory is protected) versus performance (system calls add overhead).

### Commands needed
`gcc -c src/io_demo.c`

### Run it
**Predicted confidently: Successful compilation.** 

### One sentence connecting to previous unit
Now that we know the OS uses integer file descriptors for standard streams, we need a way to acquire new descriptors for actual disk files.

## Concept Unit: open and close

### The Problem
If 0, 1, and 2 are reserved, how do we get file descriptor 3? How do we tell the OS that we want to read `/etc/hostname`? When we are done, how do we tell the OS to release the resources?

Look at the name `open` — what does it suggest this does, before you're told? How would the OS know whether you want to read or write?

### Introduce the concept in isolation
```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int fd = open("/etc/hostname", O_RDONLY);
    if (fd < 0) { perror("open"); return 1; }
    printf("fd = %d\n", fd);

    int fd2 = open("/tmp/test.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd2 < 0) { perror("open"); return 1; }
    printf("fd2 = %d\n", fd2);

    close(fd);
    close(fd2);
    return 0;
}
```
**Predicted confidently (no execution needed):**
```text
fd = 3
fd2 = 4
```
This proves that **open** allocates the lowest available integer file descriptor (usually starting at 3) and **close** releases it back.

### Discard the throwaway
This isolated code is strictly illustrative, discarded, and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `src/io_demo.c` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: `<fcntl.h>`

### The New Code
```c
#include <fcntl.h>

int open_config(void) {
    int fd = open("/tmp/config.txt", O_RDONLY);
    if (fd >= 0) {
        close(fd);
    }
    return fd;
}
```

### The Updated Project
```c
  1: #include <unistd.h>
  2: // ← new start
  3: #include <fcntl.h>
  4: // ← new end
  5: 
  6: void log_startup(void) {
  7:     write(1, "system started\n", 15);
  8: }
  9: 
 10: // ← new start
 11: int open_config(void) {
 12:     int fd = open("/tmp/config.txt", O_RDONLY);
 13:     if (fd >= 0) {
 14:         close(fd);
 15:     }
 16:     return fd;
 17: }
 18: // ← new end
```
The file now includes `fcntl.h` to use `open`, creating a function that attempts to open a config file and closes it if successful.

### Mechanical walkthrough
- `#include <fcntl.h>` includes the header defining file control flags like `O_RDONLY`.
- `int open_config(void)` defines a new function returning an integer file descriptor.
- `{` opens the function body.
- `int fd =` declares a local integer variable `fd` and assigns it the return value of the call on the right.
- `open(` calls the `open` system call wrapper.
- `"/tmp/config.txt"` is a string literal specifying the absolute path to open.
- `, O_RDONLY` is a macro constant passed as the second argument, asking the kernel for read-only access.
- `);` terminates the `open` call statement.
- `if (` begins a conditional check.
- `fd >= 0` evaluates whether the file descriptor is valid (not an error).
- `) {` opens the conditional block.
- `close(` calls the system call wrapper to release the descriptor.
- `fd` passes the integer handle just acquired.
- `);` terminates the `close` call statement.
- `}` closes the `if` block.
- `return fd;` returns the descriptor (or error code) to the caller.
- `}` closes the function body.

### CS lens
The concept is **resource acquisition and release**. Any resource provided by the OS (memory, file handles, sockets) is finite. The same concept appears in dynamic memory allocation (`malloc`/`free`), thread creation/joining, and database connection pooling.

### SE lens
The design principle is **Deterministic Cleanup**. The alternative not chosen is relying on garbage collection to close the file. The real tradeoff is explicit control (no resource leaks, predictable timing) versus convenience (having to manually balance every `open` with a `close`).

### Commands needed
`gcc -c src/io_demo.c`

### Run it
**Predicted confidently: Successful compilation.**

### One sentence connecting to previous unit
Now that we can obtain a file descriptor for a specific file on disk, we need to actually move bytes out of the file and into our program.

## Concept Unit: read and write — and short counts

### The Problem
Once you have an open file descriptor, how do you extract the data? What if the file has 10,000 bytes, but the OS can only safely deliver 1,000 at a time? 

What happens if you ask for 500 bytes and the OS only gives you 100? How should your program react?

### Introduce the concept in isolation
```c
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/demo.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    write(fd, "hello\n", 6);
    close(fd);

    fd = open("/tmp/demo.txt", O_RDONLY);
    char buf[64];
    ssize_t nr = read(fd, buf, sizeof(buf));
    printf("read %zd bytes\n", nr);
    close(fd);
    return 0;
}
```
**Predicted confidently (no execution needed):**
```text
read 6 bytes
```
This proves that **read** attempts to fill a buffer but will return exactly what is available, which may be a **short count** — returning fewer bytes than requested.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `src/io_demo.c` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: none

### The New Code
```c
ssize_t read_all(int fd, char *buf, size_t n) {
    size_t total = 0;
    while (total < n) {
        ssize_t nr = read(fd, buf + total, n - total);
        if (nr < 0) return -1; 
        if (nr == 0) break;    
        total += nr;
    }
    return total;
}
```

### The Updated Project
```c
 18: // ← new start
 19: ssize_t read_all(int fd, char *buf, size_t n) {
 20:     size_t total = 0;
 21:     while (total < n) {
 22:         ssize_t nr = read(fd, buf + total, n - total);
 23:         if (nr < 0) return -1; 
 24:         if (nr == 0) break;    
 25:         total += nr;
 26:     }
 27:     return total;
 28: }
 29: // ← new end
```
The file now contains a robust `read_all` loop that aggressively reads until the buffer is filled or the file hits EOF, handling short counts properly.

### Mechanical walkthrough
- `ssize_t read_all(int fd, char *buf, size_t n)` defines a new function taking a descriptor, a character buffer pointer, and a size, returning a signed size type.
- `{` begins the function body.
- `size_t total = 0;` declares a local accumulator variable `total` and initializes it to 0.
- `while (` begins the loop.
- `total < n` checks if we still need more bytes to fulfill the request `n`.
- `) {` opens the loop body block.
- `ssize_t nr =` declares a local signed size variable `nr` to store the read result.
- `read(` invokes the system call wrapper.
- `fd` passes the file descriptor to read from.
- `, buf + total` calculates the new memory address offset to store incoming bytes.
- `, n - total` calculates the remaining number of bytes left to request.
- `);` terminates the `read` statement.
- `if (` begins an error check.
- `nr < 0` checks if the read failed.
- `) return -1;` exits the function early with an error code.
- `if (` begins an EOF check.
- `nr == 0` checks if the read returned exactly 0, indicating End of File.
- `) break;` exits the `while` loop early if EOF was hit.
- `total += nr;` adds the successfully read bytes to the accumulator.
- `}` closes the `while` loop.
- `return total;` returns the total number of bytes successfully read.
- `}` closes the function body.

### CS lens
The concept here is **stateful iteration over partial failures**. The OS guarantees progress but not completion in a single call. This appears in TCP socket streams, stream parsing algorithms, and large database result paginations.

### SE lens
The design principle is **Defensive Programming**. The alternative not chosen is assuming `read` will always return `n` bytes. The real tradeoff is explicit boilerplate (the while loop) versus catastrophic data truncation on network boundaries or fragmented disks.

### Commands needed
`gcc -c src/io_demo.c`

### Run it
**Predicted confidently: Successful compilation.**

### One sentence connecting to previous unit
Now that we can safely extract data from an open file, what if we just want to know how big the file is without reading it at all?

## Concept Unit: File metadata — stat()

### The Problem
Reading a file to count its bytes is inefficient. How do we ask the filesystem to tell us what it already knows about a file (like size, owner, and type) without doing any data transfer?

Given that this information lives on disk, what would you try here first?

### Introduce the concept in isolation
```c
#include <sys/stat.h>
#include <stdio.h>

int main(void) {
    struct stat st;
    if (stat("/etc/hostname", &st) < 0) {
        perror("stat"); return 1;
    }
    printf("size: %lld\n", (long long)st.st_size);
    if (S_ISREG(st.st_mode)) printf("regular file\n");
    return 0;
}
```
**Predicted confidently (no execution needed):**
```text
size: 12
regular file
```
This proves that **stat()** populates a struct with **file metadata** entirely separately from reading the file contents.

### Discard the throwaway
This throwaway demonstration is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `src/io_demo.c` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: `<sys/stat.h>`

### The New Code
```c
#include <sys/stat.h>

long long get_file_size(const char *path) {
    struct stat st;
    if (stat(path, &st) == 0) {
        return (long long)st.st_size;
    }
    return -1;
}
```

### The Updated Project
```c
  3: #include <fcntl.h>
  4: // ← new start
  5: #include <sys/stat.h>
  6: // ← new end
  7: 
 ...
 28: }
 29: 
 30: // ← new start
 31: long long get_file_size(const char *path) {
 32:     struct stat st;
 33:     if (stat(path, &st) == 0) {
 34:         return (long long)st.st_size;
 35:     }
 36:     return -1;
 37: }
 38: // ← new end
```
The file now imports `sys/stat.h` and defines a helper function to retrieve file sizes efficiently.

### Mechanical walkthrough
- `#include <sys/stat.h>` includes the header defining `struct stat` and the `stat` function.
- `long long get_file_size(const char *path)` defines a new function taking a path string and returning a long long integer.
- `{` begins the function body.
- `struct stat` declares a variable of the `stat` struct type.
- `st;` names the variable `st`. It is uninitialized.
- `if (` begins the conditional.
- `stat(` invokes the `stat` system call wrapper.
- `path` passes the target path.
- `, &st` passes the memory address of the struct so the kernel can write the metadata into it.
- `) == 0` evaluates if the call succeeded (returning 0).
- `) {` opens the block.
- `return` prepares to exit the function.
- `(long long)` casts the size variable to a guaranteed large integer type.
- `st.st_size;` accesses the `st_size` field of the populated struct.
- `}` closes the block.
- `return -1;` returns a failure indicator if `stat` failed.
- `}` closes the function body.

### CS lens
The concept is **out-of-band metadata**. The metadata lives in the filesystem's inode, separate from the data blocks. This is identical to HTTP headers vs. HTTP body, or ID3 tags in MP3 files vs. the actual audio stream.

### SE lens
The design principle is **Pass-by-Pointer for Multiple Returns**. The alternative not chosen is having `stat` return a pointer to a kernel-managed struct. The real tradeoff is safety (caller owns the memory) versus usability (caller must allocate the struct).

### Commands needed
`gcc -c src/io_demo.c`

### Run it
**Predicted confidently: Successful compilation.**

### One sentence connecting to previous unit
If 'everything is a file', can we manipulate these descriptors so that a program writing to standard output accidentally writes to a file instead?

## Concept Unit: I/O redirection — dup2()

### The Problem
When you run `echo "hello" > out.txt` in a shell, `echo` still thinks it is writing to standard output (fd 1). How does the shell intercept fd 1 and route it to `out.txt` without changing the `echo` program's code?

If fd 1 is just an integer in a table, what would you try here first to trick a program?

### Introduce the concept in isolation
```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/output.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    dup2(fd, STDOUT_FILENO);  /* fd 1 now points to /tmp/output.txt */
    close(fd);

    printf("this goes to the file\n");
    return 0;
}
```
**Predicted confidently (no execution needed):** No output to the terminal; `/tmp/output.txt` contains `this goes to the file\n`.
This proves that **dup2** performs **I/O redirection** by forcibly overwriting a specific descriptor entry (1) to point to the open file representation of another descriptor (`fd`).

### Discard the throwaway
This code is purely illustrative, is discarded, and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `src/io_demo.c` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: none

### The New Code
```c
void redirect_stdout(int target_fd) {
    dup2(target_fd, 1);
}
```

### The Updated Project
```c
 37: }
 38: 
 39: // ← new start
 40: void redirect_stdout(int target_fd) {
 41:     dup2(target_fd, 1);
 42: }
 43: // ← new end
```
The file now contains a minimal helper function demonstrating how to overwrite standard output.

### Mechanical walkthrough
- `void redirect_stdout(int target_fd)` defines a new function taking an open file descriptor integer.
- `{` begins the function block.
- `dup2(` calls the system call wrapper.
- `target_fd` passes the file descriptor that we want to duplicate.
- `, 1` passes the hardcoded integer 1 (standard output), which `dup2` will close if open, and then overwrite to point to the same underlying file as `target_fd`.
- `);` terminates the function call statement.
- `}` closes the function body.

### CS lens
The fundamental CS concept is **Virtualization of Identity**. The program interacting with fd 1 has no idea that fd 1's destination has changed. This same concept appears in Virtual Memory (virtual addresses mapping to physical ones), DNS (domain names mapping to changing IPs), and Docker containers mapping internal ports to host ports.

### SE lens
The design principle is **Dependency Injection at the OS Level**. The alternative not chosen is making every program accept an explicit output file argument. The real tradeoff is composability (programs plug together effortlessly via pipelines) versus transparency (a program cannot easily know if it's talking to a terminal or a file).

### Commands needed
`gcc -c src/io_demo.c`

### Run it
**Predicted confidently: Successful compilation.**

### One sentence connecting to previous unit
The true power of Unix I/O is that `dup2` can redirect standard output to a file, a network socket, or another program's input without any code changes in the writer.

## Closing

### Connect the pieces
We have traced the full lifecycle of Unix I/O. When a process calls `open()`, the kernel allocates a file descriptor table entry and points it at an internal file representation. The program then loops over `read()` or `write()`, carefully handling short counts to reliably pull or push bytes through that descriptor. At any time, `stat()` can extract metadata about the file completely independently of the open descriptor. Because descriptors are merely table indices, tools like `dup2()` can silently swap them out underneath a running program to perform I/O redirection. Finally, `close()` releases the integer back to the kernel, finalizing the cycle. The file descriptor is the OS's handle to an open file — an integer index into the kernel's per-process file table, unified across files, terminals, sockets, and pipes. Lesson 29 covers the C standard I/O library (stdio) and how it wraps Unix I/O with buffering.
