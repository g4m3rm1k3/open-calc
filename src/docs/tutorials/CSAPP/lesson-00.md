# Lesson 00: A Tour of Computer Systems

The reader will get a complete mental map of a computer system before diving into any details. The transferable insight: every problem in systems programming — slow code, crashes, security holes, concurrency bugs — can be located on this map. Understanding which layer causes the problem is the first step to fixing it.

What you need to know first: Nothing. This is Lesson 0.

**Terms used in this lesson**
- **System layer** — an abstraction level representing part of the computer's operation. Abstractions exist to hide complexity from higher layers.
- **Hardware** — the physical machinery executing the code. Without it, logic remains conceptual.
- **Cache** — a small, fast memory location holding recently accessed data. It exists to bridge the massive speed gap between the CPU and main memory.
- **Process** — the operating system's abstraction for a running program. It exists to give a program the illusion of exclusive control over the CPU and memory.
- **Virtual memory** — the operating system's abstraction of main memory. It exists to isolate processes from each other so one crashing doesn't corrupt another.
- **Syscall** — a request made by user-level code to the operating system kernel. It exists because user code is untrusted and cannot touch hardware directly.
- **Toolchain** — the sequence of programs that transforms human-readable text into machine-executable binary. It exists to bridge the gap between high-level logic and CPU opcodes.
- **Pointer** — a variable that holds a memory address. It exists to allow indirect access and manipulation of memory locations.
- **Address** — the numerical location of a byte in memory. It exists to provide a specific destination for reading and writing data.

**Objects and methods used**

- **`printf`**
  - *What it is:* A standard C library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);` declared in `<stdio.h>`.
  - *Its use:* We use it to output text to the user's terminal to verify execution.
  - *Type:* A variadic standard library function.
  - *Responsibility:* Formats data according to a format string and writes the result to standard output (`stdout`).
  - *Depends on:* A format string and zero or more matching arguments; an active standard output stream.
  - *Connects to:* Called by user code; calls internal buffering routines which eventually call the `write` syscall.
  - *Shape:* A high-level public API boundary between user logic and the standard library's I/O facilities.

- **`clock_gettime`**
  - *What it is:* A POSIX function to retrieve the current time of a specific clock.
  - *Implementation:* `int clock_gettime(clockid_t clk_id, struct timespec *tp);` declared in `<time.h>`.
  - *Its use:* We use it to precisely measure execution time of memory access patterns.
  - *Type:* A POSIX system library function.
  - *Responsibility:* Reads the system clock and writes the current time into a provided structure.
  - *Depends on:* A clock identifier (e.g., `CLOCK_MONOTONIC`) and a valid pointer to a `struct timespec` where the result is stored.
  - *Connects to:* Called by user code; queries the kernel or hardware clock directly.
  - *Shape:* An API boundary for precise timing information, passing data via pointer out-parameter.

- **`malloc`**
  - *What it is:* A standard library function for dynamic memory allocation.
  - *Implementation:* `void *malloc(size_t size);` declared in `<stdlib.h>`.
  - *Its use:* We use it to allocate large arrays on the heap that would overflow the call stack.
  - *Type:* Standard library memory allocator function.
  - *Responsibility:* Finds and reserves a contiguous block of available heap memory of the requested size.
  - *Depends on:* The requested size in bytes; sufficient available memory in the process heap.
  - *Connects to:* Called by user code; connects to the OS kernel via syscalls (like `brk` or `mmap`) when it needs to expand the heap.
  - *Shape:* The entry point for dynamic resource acquisition within user space.

- **`free`**
  - *What it is:* A standard library function to release dynamically allocated memory.
  - *Implementation:* `void free(void *ptr);` declared in `<stdlib.h>`.
  - *Its use:* We use it to return allocated arrays to the system when we are done measuring them.
  - *Type:* Standard library memory deallocator function.
  - *Responsibility:* Marks a previously allocated block of memory as available for future allocations.
  - *Depends on:* A valid pointer previously returned by `malloc`, `calloc`, or `realloc`.
  - *Connects to:* Called by user code; manages internal heap metadata and may optionally return pages to the OS.
  - *Shape:* The exit point for dynamic resource lifecycle management.

- **`getpid`**
  - *What it is:* A POSIX system call that returns the process ID of the calling process.
  - *Implementation:* `pid_t getpid(void);` declared in `<unistd.h>`.
  - *Its use:* We use it to prove that the OS tracks our running program with a unique identifier.
  - *Type:* A POSIX system call wrapper function.
  - *Responsibility:* Retrieves the kernel's unique integer identifier for the current process.
  - *Depends on:* Being called from within an active process.
  - *Connects to:* Called by user code; traps into the OS kernel to read process metadata.
  - *Shape:* A direct boundary between a user process and kernel state.

- **`getppid`**
  - *What it is:* A POSIX system call that returns the process ID of the parent process.
  - *Implementation:* `pid_t getppid(void);` declared in `<unistd.h>`.
  - *Its use:* We use it to demonstrate process hierarchy (our program was spawned by the shell).
  - *Type:* A POSIX system call wrapper function.
  - *Responsibility:* Retrieves the kernel's unique integer identifier for the parent of the current process.
  - *Depends on:* Being called from within an active process.
  - *Connects to:* Called by user code; traps into the OS kernel to read process family tree metadata.
  - *Shape:* A direct boundary between a user process and kernel state.

- **`write`**
  - *What it is:* A fundamental POSIX system call for writing bytes to a file descriptor.
  - *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);` declared in `<unistd.h>`.
  - *Its use:* We use it to demonstrate how `printf` actually talks to the hardware, by doing it directly.
  - *Type:* A POSIX system call wrapper function.
  - *Responsibility:* Copies up to `count` bytes from the user buffer `buf` to the file or device referred to by `fd`.
  - *Depends on:* An open file descriptor, a readable memory buffer, and the number of bytes to write.
  - *Connects to:* Called by user code; traps into the OS kernel to interface with device drivers or file systems.
  - *Shape:* The lowest-level user-space boundary for outgoing data transfer.

**Everything else in the file, not this lesson's subject but still explained.**
(No other objects/methods currently used).

## Concept Unit: The hello world journey — from source to output
### The Problem
How does a computer actually turn human-readable text into action? If you write a program to say hello, what steps does the machine take to understand it? What if a step fails?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main(void) {
    printf("hello, world\n");
    return 0;
}
```
Predicted confidently: `hello, world\n` is printed to the terminal.
This proves that the system successfully navigates the **compilation and execution pipeline** to produce visible output.

### Discard the throwaway
This code is discarded and will not be used in the project.

### Project Change
- Reference Source: No reference counterpart — this is a from-scratch addition because it is a standalone theory lesson.
- Files affected: `hello.c` (created)
- Change type: add
- Location: entire file
- Dependencies: A C compiler (gcc)

### The New Code
```c
#include <stdio.h>

int main(void) {
    printf("hello, world\n");
    return 0;
}
```

### The Updated Project
```c
// 1: #include <stdio.h> // <- new
// 2: 
// 3: int main(void) { // <- new
// 4:     printf("hello, world\n"); // <- new
// 5:     return 0; // <- new
// 6: } // <- new
```
This is a complete C program that prints a message and exits.

### Mechanical walkthrough
- `#include` is a preprocessor directive that tells the compiler to insert the contents of another file here.
- `<stdio.h>` is the standard input/output header file, containing declarations like `printf`.
- `int` specifies the return type of the function, a signed integer.
- `main` is the mandatory entry point name for a C program.
- `(` begins the parameter list.
- `void` indicates the function takes no arguments.
- `)` ends the parameter list.
- `{` begins the function's code block.
- `printf` is a function call to the standard output printer.
- `(` begins the arguments to `printf`.
- `"hello, world\n"` is a string literal containing text and a newline character.
- `)` ends the arguments.
- `;` terminates the statement.
- `return` is a keyword that exits the function and provides a result back to the caller (the OS).
- `0` is the integer literal indicating successful execution.
- `;` terminates the return statement.
- `}` closes the function block.

### CS lens
The concept here is **System Abstraction Layers**. 
Also recognized in: OSI network model, virtualization hypervisors, database management systems, graphics APIs (OpenGL/Vulkan), and software-defined radio pipelines.

### SE lens
Design principle: Separation of Concerns. The alternative not chosen is making the programmer talk directly to video memory to draw pixels. The tradeoff is performance overhead for developer velocity and portability across hardware.

### Commands needed
`gcc hello.c -o hello`
Compiles the C file into an executable binary.
`./hello`
Executes the binary.

### Run it
Predicted confidently: 
```
hello, world
```
The program uses standard library I/O to output string literal data.

### One sentence connecting to previous unit
There is no previous unit; this starts our journey through the system layers.

## Concept Unit: Hardware organization — CPU, buses, memory, I/O
### The Problem
Where does data live when a program is running? How does it move from memory to the processor and back? If one operation is extremely slow, how do we know which hardware part is causing it?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main(void) {
    int x = 42;
    printf("Value: %d\n", x);
    return 0;
}
```
Predicted confidently: `Value: 42` will print.
This proves that the CPU can load data from memory (the variable `x`), move it through **hardware buses**, and send it out via I/O to the screen.

### Discard the throwaway
This code is discarded and will not be used in the project.

### Project Change
- Reference Source: No reference counterpart — this is a from-scratch addition because it is a standalone theory lesson.
- Files affected: `hardware.c` (created)
- Change type: add
- Location: entire file
- Dependencies: None

### The New Code
```c
#include <stdio.h>
#include <time.h>

int main(void) {
    int x = 42;
    int arr[1000000];
    arr[0] = x;
    printf("%d\n", arr[0]);
    return 0;
}
```

### The Updated Project
```c
// 1: #include <stdio.h> // <- new
// 2: #include <time.h> // <- new
// 3: 
// 4: int main(void) { // <- new
// 5:     int x = 42; // <- new
// 6:     int arr[1000000]; // <- new
// 7:     arr[0] = x; // <- new
// 8:     printf("%d\n", arr[0]); // <- new
// 9:     return 0; // <- new
// 10: } // <- new
```
This demonstrates different hardware usages: registers, DRAM, memory buses, and I/O devices.

### Mechanical walkthrough
- `#include` is a preprocessor directive, including `<stdio.h>`.
- `#include` is a preprocessor directive, including `<time.h>` for future timing use.
- `int` specifies the return type.
- `main` is the entry point.
- `(` opens parameter list.
- `void` indicates no arguments.
- `)` closes parameter list.
- `{` opens block.
- `int` specifies the variable type.
- `x` is the variable identifier.
- `=` is the assignment operator.
- `42` is an integer literal.
- `;` terminates statement.
- `int` specifies array element type.
- `arr` is the array identifier.
- `[` opens array subscript.
- `1000000` is an integer literal specifying size (4MB).
- `]` closes subscript.
- `;` terminates statement.
- `arr` is accessed.
- `[` opens subscript.
- `0` is the index.
- `]` closes subscript.
- `=` assigns to the element.
- `x` is read.
- `;` terminates statement.
- `printf` function call.
- `(` opens arguments.
- `"%d\n"` format string for integer and newline.
- `,` separates arguments.
- `arr` is accessed.
- `[` opens subscript.
- `0` is the index.
- `]` closes subscript.
- `)` closes arguments.
- `;` terminates statement.
- `return` exits.
- `0` indicates success.
- `;` terminates statement.
- `}` closes block.

### CS lens
The concept here is the **Von Neumann Architecture**.
Also recognized in: Microcontrollers (Arduino/AVR), modern GPUs, smart cards, embedded systems, and digital signal processors.

### SE lens
Design principle: Mechanical Sympathy. The alternative not chosen is treating all memory accesses as having uniform cost. The tradeoff is that understanding hardware constraints requires more mental effort but unlocks vastly higher performance.

### Commands needed
`gcc hardware.c -o hardware`
Compiles the file.
`./hardware`
Executes it.

### Run it
Predicted confidently:
```
42
```
The CPU writes `42` to the array in DRAM over the memory bus, reads it back, and formats it for I/O.

### One sentence connecting to previous unit
Just as our code travels from source to binary, its execution travels through the physical hardware components of the system.

## Concept Unit: The memory hierarchy — why caches exist
### The Problem
If DRAM is 300 times slower than the CPU, why doesn't the CPU spend all its time waiting for memory? How do systems provide the illusion of fast, massive memory simultaneously?

### Introduce the concept in isolation
```c
#include <stdio.h>
#define N 100
int main(void) {
    int arr[N];
    for (int i=0; i<N; i++) arr[i] = i;
    printf("Done\n");
    return 0;
}
```
Predicted confidently: `Done` will print.
This proves that sequential access to memory allows the hardware's **caching mechanisms** to efficiently pre-fetch data.

### Discard the throwaway
This code is discarded and will not be used in the project.

### Project Change
- Reference Source: No reference counterpart — this is a standalone theory lesson.
- Files affected: `cache.c` (created)
- Change type: add
- Location: entire file
- Dependencies: A standard C library

### The New Code
```c
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

#define N (1 << 24)

int main(void) {
    int *arr = malloc(N * sizeof(int));
    for (int i = 0; i < N; i++) arr[i] = i;
    
    long sum = 0;
    for (int i = 0; i < N; i++) sum += arr[i];
    
    long sum2 = 0;
    for (int i = 0; i < N; i++) sum2 += arr[rand() % N];
    
    printf("Sequential sum=%ld, Random sum=%ld\n", sum, sum2);
    free(arr);
    return 0;
}
```

### The Updated Project
```c
// 1: #include <stdio.h> // <- new
// 2: #include <time.h> // <- new
// 3: #include <stdlib.h> // <- new
// 4: 
// 5: #define N (1 << 24) // <- new
// 6: 
// 7: int main(void) { // <- new
// 8:     int *arr = malloc(N * sizeof(int)); // <- new
// 9:     for (int i = 0; i < N; i++) arr[i] = i; // <- new
// 10:     
// 11:     long sum = 0; // <- new
// 12:     for (int i = 0; i < N; i++) sum += arr[i]; // <- new
// 13:     
// 14:     long sum2 = 0; // <- new
// 15:     for (int i = 0; i < N; i++) sum2 += arr[rand() % N]; // <- new
// 16:     
// 17:     printf("Sequential sum=%ld, Random sum=%ld\n", sum, sum2); // <- new
// 18:     free(arr); // <- new
// 19:     return 0; // <- new
// 20: } // <- new
```
This program allocates a large array and measures the impact of memory access patterns on performance.

### Mechanical walkthrough
- `#include` `<stdlib.h>` provides `malloc`, `free`, and `rand`.
- `#define` defines a macro.
- `N` is the macro name.
- `(` opens expression.
- `1` integer literal.
- `<<` left shift operator.
- `24` literal.
- `)` closes expression (16M items).
- `int` specifies return type.
- `main` entry point.
- `(` `void` `)` parameters.
- `{` opens block.
- `int` type.
- `*` pointer declarator.
- `arr` identifier.
- `=` assignment.
- `malloc` call.
- `(` opens arguments.
- `N` macro.
- `*` multiplication operator.
- `sizeof` operator.
- `(` opens `sizeof`.
- `int` type.
- `)` closes `sizeof`.
- `)` closes arguments.
- `;` terminates.
- `for` loop keyword.
- `(` opens loop conditions.
- `int` type.
- `i` identifier.
- `=` assignment.
- `0` literal.
- `;` separator.
- `i` variable.
- `<` less than operator.
- `N` macro.
- `;` separator.
- `i` variable.
- `++` increment operator.
- `)` closes conditions.
- `arr` variable.
- `[` opens subscript.
- `i` variable.
- `]` closes subscript.
- `=` assignment.
- `i` variable.
- `;` terminates.
- `long` type.
- `sum` variable.
- `=` assignment.
- `0` literal.
- `;` terminates.
- `for` loop identical to before.
- `sum` variable.
- `+=` compound assignment operator.
- `arr` variable.
- `[` `i` `]` subscript.
- `;` terminates.
- `long` type.
- `sum2` variable.
- `=` `0` `;` initialization.
- `for` loop identical to before.
- `sum2` variable.
- `+=` compound assignment.
- `arr` variable.
- `[` opens subscript.
- `rand` function call.
- `(` `)` arguments.
- `%` modulo operator.
- `N` macro.
- `]` closes subscript.
- `;` terminates.
- `printf` call.
- `(` format string and arguments `,` `sum` `,` `sum2` `)` closes args.
- `;` terminates.
- `free` call.
- `(` opens args.
- `arr` variable.
- `)` closes args.
- `;` terminates.
- `return` `0` `;` exits.
- `}` closes block.

### CS lens
The concept here is **Locality of Reference (Spatial and Temporal Locality)**.
Also recognized in: CPU caches (L1/L2/L3), disk paging algorithms, web CDNs (Content Delivery Networks), database query buffers, and garbage collector generations.

### SE lens
Design principle: Data-Oriented Design. The alternative not chosen is object-oriented layouts where data is scattered via pointers (like linked lists). The tradeoff is that contiguous data is harder to resize but exponentially faster to process linearly.

### Commands needed
`gcc cache.c -o cache`
Compiles.
`./cache`
Executes.

### Run it
Predicted confidently:
```
Sequential sum=134217727409242112, Random sum=<random_value>
```
Sequential access finishes rapidly due to prefetching; random access takes much longer because every lookup misses the cache.

### One sentence connecting to previous unit
While the hardware determines absolute speed, the Operating System controls how our program accesses those hardware resources.

## Concept Unit: The OS as resource manager — processes, virtual memory, files
### The Problem
How can multiple programs run at the same time without interfering with each other's memory or printing text into each other's files? Who enforces these boundaries?

### Introduce the concept in isolation
```c
#include <unistd.h>
#include <stdio.h>
int main(void) {
    printf("PID: %d\n", getpid());
    return 0;
}
```
Predicted confidently: `PID: <number>` prints.
This proves that the operating system gives every running instance a unique **process identifier** to manage its resources.

### Discard the throwaway
This code is discarded and will not be used in the project.

### Project Change
- Reference Source: No reference counterpart — standalone theory lesson.
- Files affected: `os.c` (created)
- Change type: add
- Location: entire file
- Dependencies: POSIX-compliant OS (Linux/macOS)

### The New Code
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main(void) {
    pid_t my_pid = getpid();
    int x = 42;
    printf("PID: %d, &x: %p\n", my_pid, (void*)&x);
    write(1, "hello via raw syscall\n", 22);
    return 0;
}
```

### The Updated Project
```c
// 1: #include <stdio.h> // <- new
// 2: #include <unistd.h> // <- new
// 3: #include <sys/types.h> // <- new
// 4: 
// 5: int main(void) { // <- new
// 6:     pid_t my_pid = getpid(); // <- new
// 7:     int x = 42; // <- new
// 8:     printf("PID: %d, &x: %p\n", my_pid, (void*)&x); // <- new
// 9:     write(1, "hello via raw syscall\n", 22); // <- new
// 10:     return 0; // <- new
// 11: } // <- new
```
This demonstrates the OS abstractions: process (PID), virtual memory (pointers), and files (syscalls on file descriptors).

### Mechanical walkthrough
- `#include` for `<stdio.h>`, `<unistd.h>`, and `<sys/types.h>`.
- `int` `main` `(` `void` `)` `{` entry point setup.
- `pid_t` type for process IDs.
- `my_pid` variable identifier.
- `=` assignment.
- `getpid` function call.
- `(` `)` arguments.
- `;` terminates.
- `int` `x` `=` `42` `;` declares and initializes integer.
- `printf` call.
- `(` opens arguments.
- `"PID: %d, &x: %p\n"` format string.
- `,` separator.
- `my_pid` argument.
- `,` separator.
- `(` opens cast.
- `void` type.
- `*` pointer.
- `)` closes cast.
- `&` address-of operator.
- `x` variable.
- `)` closes arguments.
- `;` terminates.
- `write` function call.
- `(` opens arguments.
- `1` file descriptor for stdout.
- `,` separator.
- `"hello via raw syscall\n"` byte buffer.
- `,` separator.
- `22` number of bytes.
- `)` closes arguments.
- `;` terminates.
- `return` `0` `;` `}` exits.

### CS lens
The concept here is **Operating System Abstractions**.
Also recognized in: Container runtimes (Docker/cgroups), hypervisors, cloud orchestration (Kubernetes), secure enclaves, and web browser sandboxes.

### SE lens
Design principle: Encapsulation and Isolation. The alternative not chosen is cooperative multitasking in a single shared memory space (like early Windows/Mac OS). The tradeoff is significant context-switching overhead in exchange for bulletproof stability.

### Commands needed
`gcc os.c -o os`
Compiles.
`./os`
Executes.

### Run it
Predicted confidently:
```
PID: <some_number>, &x: <hex_address>
hello via raw syscall
```
The OS isolates our process's memory space, yet provides `write` so we can communicate with shared hardware like the terminal.

### One sentence connecting to previous unit
The OS provides the environment, but how exactly does our human-readable C code transform into something the OS and CPU can run?

## Concept Unit: The compilation toolchain — the four stages
### The Problem
A CPU only understands binary instructions. Our code is text. What exact transformations happen to bridge that gap?

### Introduce the concept in isolation
```c
#define MSG "Hi"
int main(void) {
    return 0;
}
```
Predicted confidently: Running `gcc -E` outputs the code with `#define` expanded, proving the **preprocessor** is an independent text-substitution phase.

### Discard the throwaway
This code is discarded and will not be used in the project.

### Project Change
- Reference Source: No reference counterpart — standalone theory lesson.
- Files affected: `stages.c` (created)
- Change type: add
- Location: entire file
- Dependencies: gcc toolchain

### The New Code
```c
#include <stdio.h>

int main(void) {
    printf("Compilation stages\n");
    return 0;
}
```

### The Updated Project
```c
// 1: #include <stdio.h> // <- new
// 2: 
// 3: int main(void) { // <- new
// 4:     printf("Compilation stages\n"); // <- new
// 5:     return 0; // <- new
// 6: } // <- new
```
We write a trivial program just to observe how the toolchain shreds it into intermediate representations.

### Mechanical walkthrough
- `#include` for `<stdio.h>`.
- `int` `main` `(` `void` `)` `{` opens entry point.
- `printf` call.
- `(` `"Compilation stages\n"` `)` passes string.
- `;` terminates.
- `return` `0` `;` `}` exits cleanly.

### CS lens
The concept here is **The Compilation Pipeline**.
Also recognized in: SQL query planners, JVM bytecode compilers (JIT), 3D graphics shader compilation, markdown-to-HTML static site generators, and natural language processing pipelines.

### SE lens
Design principle: Modularity and Pipelining. The alternative not chosen is a monolithic compiler that reads C and directly outputs an ELF binary in one black-box step. The tradeoff is creating many intermediate files, but it allows swapping out the frontend (C vs C++) or backend (x86 vs ARM) independently.

### Commands needed
`gcc -E stages.c -o stages.i` (Preprocess)
`gcc -S stages.i -o stages.s` (Compile to Assembly)
`gcc -c stages.s -o stages.o` (Assemble to Machine Code)
`gcc stages.o -o stages` (Link)

### Run it
Predicted confidently: `Compilation stages`
The linker combined our object file with `libc.a` to produce the final executable.

### One sentence connecting to previous unit
The entire system map is now complete: from text through the toolchain, scheduled by the OS, moved over buses, cached in memory, and executed by the CPU.

## Closing
### Connect the pieces
When you run a C program, the toolchain translates your text into binary opcodes (Unit 5). The OS allocates a process and virtual memory, loads that binary into DRAM, and points the CPU at it (Unit 4). As the CPU executes instructions, the hardware memory bus pulls the data into L1 cache for speed (Unit 3). Finally, when you ask to print, a syscall crosses back into the OS, moving data down the I/O bus to the terminal display (Unit 2) — completing the exact journey of our very first "hello world" (Unit 1).

A computer system is a hierarchy of abstractions, and every systems bug is a place where two layers' assumptions disagree.
