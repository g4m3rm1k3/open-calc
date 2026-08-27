# Lesson 29: Standard I/O — Buffering, stdio, and the C Library

What you will build: The reader will understand how the C standard I/O library wraps Unix I/O with buffering, and why that buffering causes surprising behavior (output not appearing until flushed, mixing read/write bugs). The transferable insight: stdio's buffer is the reason printf output sometimes disappears in a crash — it never made it to the kernel. Understanding stdio buffering explains every 'where did my output go?' mystery.

What you need to know first: Lessons 00-28.

**Terms used in this lesson**
- **Unix I/O** — system calls for raw, unbuffered interaction with the kernel.
- **Standard I/O (stdio)** — the C library wrapper that provides buffering over Unix I/O to improve performance.
- **Buffering** — holding data in a user-space memory block to minimize the number of direct, expensive kernel system calls.
- **Line buffered** — a buffer mode where the buffer flushes automatically when a newline character is encountered.
- **Fully buffered** — a buffer mode where the buffer flushes only when it is completely full, or explicitly flushed.
- **Unbuffered** — a buffer mode where every write immediately triggers a system call without sitting in a user-space buffer.
- **Format specifier** — a placeholder string starting with `%` that tells a variadic function like `printf` how to interpret and format the corresponding argument.
- **Variadic function** — a function that accepts a variable number of arguments, determined at runtime by another parameter (like a format string).
- **Undefined behavior** — what happens when the types in a format string do not match the provided arguments; the C standard guarantees no specific outcome.

**Objects and methods used**
- **`printf`**
  - *What it is:* A formatted output function from the C standard library.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* To write formatted text to the standard output stream, utilizing user-space buffering.
  - *Type:* Standard library variadic function.
  - *Responsibility:* Parses a format string, formats the variadic arguments into text, and places the resulting characters into the `stdout` buffer.
  - *Depends on:* A format string, matching arguments, and the standard output stream.
  - *Connects to:* Calls internal stdio buffering logic, which eventually connects to `write()` system calls.
  - *Shape:* A high-level public API boundary in the standard C library.

- **`write`**
  - *What it is:* A fundamental Unix system call for output.
  - *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
  - *Its use:* To bypass stdio buffering and send bytes directly to the kernel for a given file descriptor.
  - *Type:* System call wrapper function.
  - *Responsibility:* Requests the kernel to transfer exactly `count` bytes from the user-space `buf` into the open file described by `fd`.
  - *Depends on:* A valid open file descriptor and a contiguous buffer of bytes in memory.
  - *Connects to:* Invokes a context switch to the operating system kernel to perform the actual I/O.
  - *Shape:* The lowest-level user-space boundary before entering kernel space.

- **`fflush`**
  - *What it is:* A function to force the flushing of a stdio buffer.
  - *Implementation:* `int fflush(FILE *stream);`
  - *Its use:* To guarantee that data sitting in a user-space `FILE*` buffer is pushed to the kernel immediately, preventing interleaved output bugs.
  - *Type:* Standard library function.
  - *Responsibility:* Examines the provided `FILE*` stream and, if it has pending write data, issues a `write()` system call to empty the buffer.
  - *Depends on:* An open `FILE*` stream.
  - *Connects to:* Reads the `FILE*` structure's buffer state and connects to the `write()` system call.
  - *Shape:* An explicit synchronization boundary between user-space library state and kernel state.

- **`FILE*`**
  - *What it is:* An opaque struct representing a buffered standard I/O stream.
  - *Implementation:* `typedef struct _IO_FILE FILE;`
  - *Its use:* To manage file descriptors alongside a user-space buffer and current position state.
  - *Type:* Opaque struct pointer type.
  - *Responsibility:* Encapsulates an underlying file descriptor and maintains a user-space buffer to optimize read/write performance by reducing system calls.
  - *Depends on:* A valid allocation and initialization by `fopen` or standard stream setup.
  - *Connects to:* Handled by all stdio functions (like `fread`, `fwrite`, `fprintf`) as their primary state tracking mechanism.
  - *Shape:* The core abstraction entity of the C standard I/O library.

- **`fopen`**
  - *What it is:* A function to open a file and associate it with a stdio stream.
  - *Implementation:* `FILE *fopen(const char *pathname, const char *mode);`
  - *Its use:* To initialize a buffered stream for reading or writing a file.
  - *Type:* Standard library function.
  - *Responsibility:* Asks the kernel to open a file descriptor (via `open()`), allocates a `FILE` struct and an associated memory buffer, and returns a pointer to it.
  - *Depends on:* A valid file path and access mode string.
  - *Connects to:* Calls the `open()` system call and connects the resulting file descriptor to newly allocated buffer memory.
  - *Shape:* The factory method for `FILE*` streams.

- **`fclose`**
  - *What it is:* A function to close a stdio stream.
  - *Implementation:* `int fclose(FILE *stream);`
  - *Its use:* To cleanly terminate file access, ensuring any remaining buffered data is flushed.
  - *Type:* Standard library function.
  - *Responsibility:* Flushes any unwritten buffered data to the kernel, closes the underlying file descriptor via `close()`, and frees the `FILE` struct and its buffer memory.
  - *Depends on:* A valid `FILE*` stream previously opened.
  - *Connects to:* Calls `fflush()` internally, then the `close()` system call, then `free()`.
  - *Shape:* The destructor boundary for stdio streams.

- **`fwrite`**
  - *What it is:* A buffered binary write function.
  - *Implementation:* `size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream);`
  - *Its use:* To efficiently write blocks of data to a file by batching them in the stdio buffer.
  - *Type:* Standard library function.
  - *Responsibility:* Copies data from the user's pointer into the stream's buffer, triggering a `write()` to the kernel only when the buffer fills up.
  - *Depends on:* A source memory pointer, element dimensions, and an open `FILE*` stream.
  - *Connects to:* Copies memory to the `FILE*` buffer array and conditionally calls the `write()` system call.
  - *Shape:* A high-throughput data transfer API.

- **`fgets`**
  - *What it is:* A function to read a string until a newline or size limit.
  - *Implementation:* `char *fgets(char *s, int size, FILE *stream);`
  - *Its use:* To safely read a line of text from a stream into a user buffer without risking buffer overflow.
  - *Type:* Standard library function.
  - *Responsibility:* Reads characters from the stream's buffer into the user's string until a newline is found, EOF occurs, or `size - 1` characters are read, appending a null terminator.
  - *Depends on:* A destination string buffer, a maximum size, and an open readable `FILE*` stream.
  - *Connects to:* Pulls data from the `FILE*` buffer, which internally calls `read()` when empty.
  - *Shape:* A safe text input API boundary.

- **`fileno`**
  - *What it is:* A POSIX function that extracts the file descriptor from a stdio stream.
  - *Implementation:* `int fileno(FILE *stream);`
  - *Its use:* To interoperate between stdio and Unix I/O layers when necessary.
  - *Type:* POSIX standard library function.
  - *Responsibility:* Inspects the opaque `FILE` struct and returns the raw integer file descriptor it is currently managing.
  - *Depends on:* A valid `FILE*` stream.
  - *Connects to:* Peeks into the internal fields of the `FILE` struct.
  - *Shape:* An escape hatch crossing the abstraction boundary from buffered library to raw kernel identifier.

**Everything else in the file, not this lesson's subject but still explained**
- **`perror`**
  - *What it is:* A function to print a system error message.
  - *Implementation:* `void perror(const char *s);`
  - *Its use:* To display a descriptive string corresponding to the current value of the global `errno` variable.
  - *Type:* Standard library function.
  - *Responsibility:* Translates the current numeric error code in `errno` into a human-readable string and prints it to `stderr`, prefixed by the user's custom string.
  - *Depends on:* The global `errno` state set by a previously failed system or library call.
  - *Connects to:* Reads `errno` and writes to the unbuffered `stderr` stream.
  - *Shape:* A diagnostic utility boundary.

- **`STDOUT_FILENO`**
  - *What it is:* A POSIX macro for the standard output file descriptor.
  - *Implementation:* `#define STDOUT_FILENO 1`
  - *Its use:* To explicitly target the standard output stream in raw `write()` system calls.
  - *Type:* Preprocessor macro constant.
  - *Responsibility:* Represents the fixed file descriptor integer (1) that the operating system conventionally assigns to standard output.
  - *Depends on:* Inclusion of `<unistd.h>`.
  - *Connects to:* Passed as the first argument to raw Unix I/O functions.
  - *Shape:* A fundamental OS-level convention constant.

## Concept Unit: The three layers of I/O

### The Problem
When you call a function to output text to the console, how does that text actually reach the operating system kernel? If every single character required a full system call, how would that affect performance? And if the standard library batches these characters up to save time, what happens if your program crashes before the batch is sent?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    /* Layer 1: Unix I/O (direct syscall) */
    write(STDOUT_FILENO, "write: no buffer\n", 17);

    /* Layer 2: stdio (buffered) */
    printf("printf: buffered");
    /* NOTE: no \n -> may NOT appear yet! Still in stdio buffer */
    
    fflush(stdout);  /* force buffer to kernel */
    write(STDOUT_FILENO, "\n", 1);

    /* Output order is guaranteed only after fflush */
    return 0;  /* atexit flushes stdio buffers on normal exit */
}
```
This proves that **Standard I/O (stdio)** and **Unix I/O** operate differently. The `write()` system call bypasses user-space entirely and sends data straight to the kernel. The `printf()` function places data into a user-space buffer. This proves `write()` goes directly to the kernel, while `printf()` sits in a user-space buffer until flushed manually or automatically by normal termination.

### Discard the throwaway
This throwaway demonstration file is discarded; it exists only to prove the layering and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental C standard library buffering behaviors.
- **Files affected:** `src/io_demo.c` (created)
- **Change type:** add
- **Location:** New file.
- **Dependencies:** None.

### The New Code
```c
#include <stdio.h>
#include <unistd.h>

void show_layers() {
    write(STDOUT_FILENO, "write: no buffer\n", 17);
    printf("printf: buffered");
    fflush(stdout);
    write(STDOUT_FILENO, "\n", 1);
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: #include <unistd.h>
3: 
4: void show_layers() {
5:     write(STDOUT_FILENO, "write: no buffer\n", 17);
6:     printf("printf: buffered");
7:     fflush(stdout);
8:     write(STDOUT_FILENO, "\n", 1);
9: }
```
This file provides a demonstration function that manually mixes raw unbuffered output with buffered standard library output, explicitly forcing synchronization between them.

### Mechanical walkthrough
- `#include <stdio.h>` is a preprocessor directive that imports the C standard library declarations, giving us access to buffered I/O functions like `printf` and `fflush`.
- `#include <unistd.h>` is a preprocessor directive that imports POSIX operating system API declarations, giving us access to raw system calls like `write` and macros like `STDOUT_FILENO`.
- `void show_layers()` declares a new function taking no arguments and returning nothing.
- `write(` calls the POSIX `write` system call wrapper, which requests a direct transfer of data to the kernel.
- `STDOUT_FILENO,` passes the integer value 1, the standard file descriptor for output.
- `"write: no buffer\n",` passes a pointer to a string literal.
- `17)` passes the exact number of bytes to transfer.
- `printf(` calls the standard library's formatted output function.
- `"printf: buffered");` passes the string literal to be written into the user-space stdio buffer, lacking a newline so it does not auto-flush on line-buffered streams.
- `fflush(` calls the standard library buffer flushing function, explicitly demanding that pending data in a user-space buffer be pushed out.
- `stdout);` passes the global `FILE*` pointer representing the standard output stream.
- `write(STDOUT_FILENO, "\n", 1);` directly writes a newline character to the kernel immediately, returning control.

### CS lens
This code embodies **buffering** and **abstraction layers**. By grouping small, frequent operations (like writing characters) into one large chunk in memory before doing the expensive operation of crossing the kernel boundary, performance improves dramatically.
Also recognized in: disk I/O controllers, GPU command queues, TCP Nagle's algorithm, streaming video clients, and database commit logs.

### SE lens
The design principle here is **Layering**. The alternative not chosen was forcing programmers to manually build their own char arrays and track offsets every time they wanted to print something without killing performance via million-syscall spam. The real tradeoff is that buffering introduces *state drift*: the user-space program thinks the data has been output, but the kernel (and the actual screen or file) has not seen it yet, leading to confusing bugs if the program crashes before the buffer is emptied.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
write: no buffer
printf: buffered
```
Reasoning: We know `write` executes immediately, so it prints first. The `printf` string is buffered, but `fflush` forces it to empty into the kernel immediately after. The final `write` prints the newline, yielding the two precise lines in exact sequence.

### One sentence connecting to previous unit
Now that we have seen how `printf` relies on a hidden buffer, we must look closer at exactly where that buffer lives.


## Concept Unit: FILE* and the stdio buffer

### The Problem
If `printf` writes to a buffer, what actually holds that buffer in memory? How does the C standard library keep track of where one file's buffer ends and another begins? What connects this user-space memory structure back to the operating system's raw file descriptors?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main(void) {
    /* Three pre-opened FILE* streams */
    printf("stdin  fd: %d\n", fileno(stdin));   /* 0 */
    printf("stdout fd: %d\n", fileno(stdout));  /* 1 */
    printf("stderr fd: %d\n", fileno(stderr));  /* 2 */

    /* Buffering modes: */
    /* stdout to terminal: LINE BUFFERED (flush on \n or fflush) */
    /* stdout to file:     FULLY BUFFERED (flush when buffer full or fflush) */
    /* stderr:             UNBUFFERED (always immediate) */

    /* Check buffer size: */
    FILE *f = fopen("/tmp/test.txt", "w");
    if (f) {
        printf("buffer size: %d\n", (int)(f->_IO_buf_end - f->_IO_buf_base));
        fclose(f);
    }
    return 0;
}
```
This proves that the standard library tracks files using a **`FILE*`** abstraction, which internally manages both the raw integer file descriptor (via `fileno()`) and the memory limits of its own user-space buffer. We see that different streams use different buffering modes.

### Discard the throwaway
This throwaway demonstration is discarded; it exists only to prove `FILE*` internals and will not appear in the final project code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/io_demo.c` (modified)
- **Change type:** add
- **Location:** At the bottom of `src/io_demo.c`.
- **Dependencies:** The previous unit's includes.

### The New Code
```c
void inspect_stream() {
    printf("stdout fd: %d\n", fileno(stdout));
    printf("stderr fd: %d\n", fileno(stderr));
}
```

### The Updated Project
```c
#include <stdio.h>
#include <unistd.h>

void show_layers() {
    write(STDOUT_FILENO, "write: no buffer\n", 17);
    printf("printf: buffered");
    fflush(stdout);
    write(STDOUT_FILENO, "\n", 1);
}

// ← new
11: void inspect_stream() {
12:     printf("stdout fd: %d\n", fileno(stdout));
13:     printf("stderr fd: %d\n", fileno(stderr));
14: }
```
This adds a function that extracts and prints the underlying operating system file descriptors from standard C library stream objects.

### Mechanical walkthrough
- `void inspect_stream() {` declares a new function.
- `printf(` calls the standard library formatted output function.
- `"stdout fd: %d\n",` passes a format string containing a `%d` placeholder for an integer.
- `fileno(` calls the POSIX function that extracts a raw file descriptor from a `FILE*`.
- `stdout));` passes the global standard output `FILE*` and closes the calls.
- `printf("stderr fd: %d\n", fileno(stderr));` extracts the file descriptor for the unbuffered standard error stream, and prints it using the `%d` format specifier.

### CS lens
This code embodies **encapsulation** and **opaque types**. The C standard library gives the user a `FILE*` pointer but hides its internal fields (like `_IO_buf_base`), forcing the user to rely on functions like `fileno` to safely extract needed internal state.
Also recognized in: Windows handles, Unix directory streams (`DIR*`), OpenGL context objects, cryptographic key structs in OpenSSL, and browser DOM node references.

### SE lens
The design principle here is **Information Hiding**. The alternative not chosen was making the programmer declare their own buffer arrays, tracking variables, and file descriptor ints, passing all three into every single output function. The real tradeoff is that an opaque type prevents the programmer from manually tuning or resizing the buffer without using specialized library APIs (`setvbuf`), placing performance control squarely in the library's hands rather than the app's.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
stdout fd: 1
stderr fd: 2
```
Reasoning: By POSIX convention, standard output is permanently mapped to file descriptor 1, and standard error to file descriptor 2. `fileno` just extracts these fixed ints.

### One sentence connecting to previous unit
Knowing that `FILE*` wraps a raw file descriptor and a memory buffer, we can now use it to open and buffer our own files on disk.


## Concept Unit: fopen, fclose, fread, fwrite

### The Problem
How do you create a new `FILE*` buffer for a file on your hard drive? How do you write blocks of text into it efficiently, and how do you ensure that data actually makes it onto the disk when you are done?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <string.h>

int main(void) {
    /* Write to a file using stdio */
    FILE *f = fopen("demo.txt", "w");
    if (!f) { perror("fopen"); return 1; }

    const char *lines[] = {"first line\n", "second line\n", "third line\n"};
    for (int i = 0; i < 3; i++) {
        size_t nw = fwrite(lines[i], 1, strlen(lines[i]), f);
        printf("wrote %zu bytes\n", nw);
    }
    fclose(f);  /* flushes buffer, closes fd */

    /* Read back using fgets */
    f = fopen("demo.txt", "r");
    char buf[128];
    while (fgets(buf, sizeof(buf), f)) {
        printf("line: %s", buf);
    }
    fclose(f);
    return 0;
}
```
This proves that **`fopen`** initializes a `FILE*` stream and its buffer, **`fwrite`** efficiently batches data writes into that buffer, and **`fclose`** securely flushes those buffered bytes to the OS before destroying the stream. 

### Discard the throwaway
This throwaway demonstration is discarded; it exists only to prove stdio file operations and will not appear in the real project code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/io_demo.c` (modified)
- **Change type:** add
- **Location:** At the bottom of `src/io_demo.c`.
- **Dependencies:** Include `<string.h>` at the top of the file.

### The New Code
```c
#include <string.h>

void write_file() {
    FILE *f = fopen("out.txt", "w");
    if (!f) return;
    
    const char *msg = "hello\n";
    fwrite(msg, 1, strlen(msg), f);
    fclose(f);
}
```

### The Updated Project
```c
#include <stdio.h>
#include <unistd.h>
// ← new
3: #include <string.h>

void show_layers() {
    write(STDOUT_FILENO, "write: no buffer\n", 17);
    printf("printf: buffered");
    fflush(stdout);
    write(STDOUT_FILENO, "\n", 1);
}

void inspect_stream() {
    printf("stdout fd: %d\n", fileno(stdout));
    printf("stderr fd: %d\n", fileno(stderr));
}

// ← new
18: void write_file() {
19:     FILE *f = fopen("out.txt", "w");
20:     if (!f) return;
21:     
22:     const char *msg = "hello\n";
23:     fwrite(msg, 1, strlen(msg), f);
24:     fclose(f);
25: }
```
This file now contains a function that securely opens a disk file, writes a buffered string to it using the standard C library, and correctly closes and flushes the file.

### Mechanical walkthrough
- `#include <string.h>` includes string manipulation function declarations, specifically `strlen`.
- `void write_file() {` declares a new function.
- `FILE *f =` declares a pointer variable to a `FILE` struct.
- `fopen("out.txt", "w");` calls the file opening factory method, requesting write access to "out.txt", and returning a newly allocated stream object.
- `if (!f) return;` checks if the pointer is NULL (meaning file open failed) and safely exits the function if so.
- `const char *msg = "hello\n";` sets up a pointer to a read-only string literal.
- `fwrite(` calls the standard library buffered binary write function.
- `msg, 1, strlen(msg), f);` passes the source pointer, the size of each element (1 byte), the number of elements to write (the string length), and the destination `FILE*` stream.
- `fclose(f);` calls the standard library close function, which flushes any remaining buffered data directly to the kernel and frees the `FILE` struct.

### CS lens
This code embodies the **Resource Acquisition Is Initialization (RAII)** pattern's manual C equivalent, and **Resource Lifecycle Management**. A resource (a file descriptor and memory buffer) is acquired, utilized, and then explicitly released.
Also recognized in: database connection pools, memory allocators (`malloc`/`free`), thread locks (`lock`/`unlock`), network socket management, and temporary file cleanup handlers.

### SE lens
The design principle here is **Fail-fast Validation**. The alternative not chosen was assuming `fopen` always succeeds and blindly calling `fwrite` on a potential NULL pointer, causing a segmentation fault. The real tradeoff is that every single file I/O boundary requires manual error checking, bloating code length in exchange for runtime stability.

### Commands needed
None for this unit.

### Run it
Predicted confidently: (Outputs nothing to the terminal, but creates `out.txt` with contents `hello\n`)
Reasoning: The function contains no `printf` or `write` to standard output. It strictly interacts with a named file on disk, buffering the 6 characters of `hello\n` and flushing them when `fclose` is called.

### One sentence connecting to previous unit
Now that we know how to write raw text and binary strings into a buffered stream, we must learn how to format complex variables into those strings.


## Concept Unit: printf and scanf format strings

### The Problem
How do you safely combine static text with variables like integers, floating point numbers, or memory addresses when writing to a buffer? What mechanism does C use to convert raw binary numbers into human-readable characters?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main(void) {
    /* printf format specifiers */
    int i = 42;
    double d = 3.14159;
    char *s = "hello";
    void *p = &i;

    printf("%d\n",   i);       /* decimal integer: 42 */
    printf("%x\n",   255);     /* hex lowercase: ff */
    printf("%.2f\n", d);       /* float 2 decimal places: 3.14 */
    printf("%s\n",   s);       /* string: hello */
    printf("%p\n",   p);       /* pointer: 0x7fff1234 */
    printf("%zu\n",  sizeof(i)); /* size_t: 4 */
    
    return 0;
}
```
This proves that C utilizes **format specifiers** — small placeholders embedded in a format string — to instruct a variadic function like `printf` exactly how to read and cast the subsequent arguments. 

### Discard the throwaway
This throwaway demonstration is discarded; it exists only to prove format string syntax and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/io_demo.c` (modified)
- **Change type:** add
- **Location:** At the bottom of `src/io_demo.c`.
- **Dependencies:** None.

### The New Code
```c
void format_demo() {
    int count = 5;
    double price = 1.25;
    printf("Total: %d items for $%.2f\n", count, price);
}
```

### The Updated Project
```c
void write_file() {
    FILE *f = fopen("out.txt", "w");
    if (!f) return;
    
    const char *msg = "hello\n";
    fwrite(msg, 1, strlen(msg), f);
    fclose(f);
}

// ← new
27: void format_demo() {
28:     int count = 5;
29:     double price = 1.25;
30:     printf("Total: %d items for $%.2f\n", count, price);
31: }
```
This file now includes a function that formats different primitive types into a single human-readable string buffered to standard output.

### Mechanical walkthrough
- `void format_demo() {` declares a new function.
- `int count = 5;` declares an integer variable and initializes it.
- `double price = 1.25;` declares a double-precision floating point variable and initializes it.
- `printf(` calls the standard library variadic output function.
- `"Total: %d items for $%.2f\n",` passes the format string. The `%d` is a **format specifier** instructing `printf` to fetch the next argument as a signed integer. The `%.2f` is a **format specifier** instructing `printf` to fetch the next argument as a double and format it to exactly two decimal places.
- `count, price);` passes the variadic arguments that map to the format specifiers in strict left-to-right order.

### CS lens
This code embodies **Serialization** and **Dynamic Type Reflection** (or lack thereof). Because C is statically compiled with no runtime type information, the variadic function `printf` is utterly blind to the real types of `count` and `price`. It relies entirely on the format string as a proxy for type information.
Also recognized in: JSON payload generation, XML marshalling engines, Python's `struct.pack`, network packet framing, and ORM query builders.

### SE lens
The design principle here is **Data-Driven Execution**. The alternative not chosen was creating a hundred separate functions like `print_int_then_string_then_double(int, char*, double)`, which is impossible to scale. The real tradeoff is runtime safety: if the programmer accidentally puts a `%s` but passes an `int`, the program exhibits **undefined behavior** and will likely crash reading the integer as a memory address, because the compiler cannot strictly enforce variadic type safety in standard C.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Total: 5 items for $1.25
```
Reasoning: `count` replaces `%d` with "5". `price` replaces `%.2f` with "1.25".

### One sentence connecting to previous unit
With the power to format output dynamically, we must ensure we never mix these buffered format tools with raw Unix tools on the same stream, or the buffer will sabotage the output order.


## Concept Unit: The mixing problem — never mix stdio and Unix I/O on the same fd

### The Problem
If `printf` writes data into a buffer, and `write` sends data directly to the OS kernel, what happens if you use both on the exact same output stream? Will they appear in the terminal in the order you typed them in the code?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    /* WRONG: mixing stdio and Unix I/O on the same fd */
    printf("via printf");      /* in stdio buffer, NOT yet written */
    write(STDOUT_FILENO, "via write\n", 10); /* direct syscall, appears immediately */
    printf("\n");               /* flushed on \n (if line-buffered) */
    
    return 0;
}
```
This proves the **Mixing Problem**. The output on the terminal will print "via write" *before* "via printf", because `printf` placed its text into a user-space buffer and paused, while `write` bypassed the buffer entirely and handed its text directly to the OS kernel immediately.

### Discard the throwaway
This throwaway demonstration is discarded; it exists only to prove the danger of buffer bypassing and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/io_demo.c` (modified)
- **Change type:** add
- **Location:** At the bottom of `src/io_demo.c`.
- **Dependencies:** Include `<unistd.h>`.

### The New Code
```c
void dangerous_mix() {
    printf("Buffered output...");
    fflush(stdout);
    write(STDOUT_FILENO, "Raw output!\n", 12);
}
```

### The Updated Project
```c
void format_demo() {
    int count = 5;
    double price = 1.25;
    printf("Total: %d items for $%.2f\n", count, price);
}

// ← new
33: void dangerous_mix() {
34:     printf("Buffered output...");
35:     fflush(stdout);
36:     write(STDOUT_FILENO, "Raw output!\n", 12);
37: }
```
This file now contains a function that correctly prevents the mixing bug by explicitly flushing the standard I/O buffer before handing control over to a raw Unix I/O call.

### Mechanical walkthrough
- `void dangerous_mix() {` declares a new function.
- `printf("Buffered output...");` places a string into the standard output user-space buffer. Because there is no newline, it sits waiting.
- `fflush(stdout);` forces the standard output buffer to drain immediately, issuing a system call to the kernel to push "Buffered output..." right now.
- `write(STDOUT_FILENO, "Raw output!\n", 12);` issues a direct system call to the kernel, ensuring it arrives completely *after* the flushed buffered text.

### CS lens
This code embodies **State Synchronization** and **Cache Coherency**. The user-space buffer is essentially a local cache of the kernel's file state. When two different agents (the C library and the raw OS syscalls) attempt to mutate the same resource, cache invalidation and forced synchronization (`fflush`) are mandatory.
Also recognized in: multi-core CPU L1/L2 caches, distributed database replicas, GPU memory barriers, frontend React state vs real DOM, and filesystem journal commits.

### SE lens
The design principle here is **Single Source of Truth**. The alternative not chosen was having `write()` internally peek at stdio buffers to see if it should flush them first. The real tradeoff is that Unix and stdio are deliberately disconnected to keep the OS kernel entirely ignorant of C user-space libraries, placing the burden of synchronization entirely on the application programmer.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Buffered output...Raw output!
```
Reasoning: Because of the explicit `fflush()`, the buffered text is sent to the OS kernel first. Then the direct `write()` is sent. They arrive in the intended, chronological order.

### One sentence connecting to previous unit
Understanding how user-space buffers interact with the operating system completes our tour of file input and output.

## Closing

### Connect the pieces
When you run `printf("hello\n");`, it is a **Variadic function** that parses the format string. It takes the text and places it into a **`FILE*`** stream's user-space buffer. Because standard output to a terminal is **Line buffered**, the presence of the `\n` character triggers an automatic internal call to **`fflush`**. That flush extracts the raw file descriptor using the equivalent of **`fileno`**, and issues a direct **`write`** system call, crossing from the C standard library down into raw **Unix I/O**, placing the text safely in the kernel.

Lesson 30 covers process environment, exec, and how programs are loaded.
