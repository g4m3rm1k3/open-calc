# Lesson 19: What the Operating System Does — Abstraction, Isolation, Multiplexing

The reader will understand the three fundamental roles the OS plays (virtualization, concurrency, persistence), the key abstractions it provides (process, virtual memory, file), and the mechanism by which user programs request OS services (system calls via traps). The transferable insight: the OS is not magic -- it is a C program that runs in a privileged hardware mode and provides illusions to user programs. Understanding what the OS does makes every system call, every signal, and every segfault comprehensible.

**What you need to know first:**
- Lesson 18

**Terms used in this lesson:**
- **Virtualization** — the OS makes shared hardware appear private and infinite to each process.
- **Concurrency** — the OS manages multiple tasks running simultaneously, ensuring fair time-sharing and safe synchronization.
- **Persistence** — the OS ensures data survives power cycles by organizing it on durable storage.
- **Process** — an instance of a running program with its own address space, CPU context, and open files.
- **Virtual Memory** — an abstraction that makes each process think it owns the entire address space.
- **File** — a sequence of bytes used to abstract disks, devices, pipes, and sockets.
- **Kernel mode** — the hardware privilege level with full access to all CPU instructions and memory.
- **User mode** — the restricted hardware privilege level where ordinary programs run.
- **System call** — a controlled entry into the kernel for a user program to request a privileged service.
- **Exception** — an abrupt change in the control flow in response to a change in processor state (interrupt, trap, fault, abort).
- **Context switch** — the OS mechanism for multiplexing the CPU by saving one process's state and loading another's.
- **`#include`** — a C preprocessor directive used to include the contents of a standard header file into the current file.
- **`int`** — a primitive C data type representing a standard integer.
- **`void`** — a C keyword indicating the absence of a value or parameters.
- **`return`** — a C keyword used to exit a function and optionally pass a value back to the caller.
- **Pointer (`*`)** — a C variable that stores the memory address of another value.
- **Address-of (`&`)** — a C operator that returns the memory address of its operand.
- **`if` / `else`** — C control flow constructs used for conditional execution.
- **`struct`** — a C keyword used to define a composite data type that groups variables of different types.
- **`long`** — a primitive C data type representing an integer larger than a standard `int`.
- **`pid_t`** — a POSIX data type representing a process identifier.
- **`ssize_t`** — a POSIX data type used for a byte count or error indication.

**Objects and methods used:**
- **`printf`**
  - *What it is:* A formatted output function from the C standard library.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used to demonstrate user-level printing that eventually requires a system call.
  - *Type:* A variadic library function.
  - *Responsibility:* Formats data into a character string and writes it to standard output.
  - *Depends on:* The string format and any variables matching the format specifiers.
  - *Connects to:* Calls `write()` internally to pass the formatted string to the OS.
  - *Shape:* A standard library API available to all C programs.

- **`getpid`**
  - *What it is:* A system call wrapper that retrieves the process ID of the calling process.
  - *Implementation:* `pid_t getpid(void);`
  - *Its use:* Used to demonstrate the process abstraction.
  - *Type:* A library function wrapping a system call.
  - *Responsibility:* Returns the unique integer identifier assigned to the current process by the OS.
  - *Depends on:* Nothing (takes `void`).
  - *Connects to:* Executes a trap instruction to ask the OS kernel for the PID.
  - *Shape:* A POSIX standard system call interface.

- **`getppid`**
  - *What it is:* A system call wrapper that retrieves the process ID of the parent process.
  - *Implementation:* `pid_t getppid(void);`
  - *Its use:* Used to demonstrate the parent-child relationship of the process abstraction.
  - *Type:* A library function wrapping a system call.
  - *Responsibility:* Returns the PID of the process that created the current process.
  - *Depends on:* Nothing (takes `void`).
  - *Connects to:* Executes a trap instruction to ask the OS kernel for the parent's PID.
  - *Shape:* A POSIX standard system call interface.

- **`malloc`**
  - *What it is:* A memory allocation function from the C standard library.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* Used to demonstrate virtual memory allocation on the heap.
  - *Type:* A library function.
  - *Responsibility:* Allocates a block of uninitialized virtual memory of the specified size and returns a pointer to it.
  - *Depends on:* The size in bytes to allocate.
  - *Connects to:* May call `brk` or `mmap` system calls to request more memory from the OS if the heap is exhausted.
  - *Shape:* A standard library API.

- **`free`**
  - *What it is:* A memory deallocation function from the C standard library.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* Used to return dynamically allocated virtual memory to the heap.
  - *Type:* A library function.
  - *Responsibility:* Frees the memory space pointed to by `ptr`, making it available for further allocations.
  - *Depends on:* A pointer previously returned by `malloc`, `calloc`, or `realloc`.
  - *Connects to:* Updates the heap allocator's internal data structures.
  - *Shape:* A standard library API.

- **`write`**
  - *What it is:* A system call wrapper for writing data to a file descriptor.
  - *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
  - *Its use:* Used to demonstrate the file abstraction and how user programs directly interact with the OS.
  - *Type:* A library function wrapping a system call.
  - *Responsibility:* Writes up to `count` bytes from the buffer `buf` to the open file descriptor `fd`.
  - *Depends on:* An open file descriptor, a memory buffer containing data, and the number of bytes to write.
  - *Connects to:* Executes a trap instruction to transfer control to the OS kernel to perform the actual write.
  - *Shape:* A POSIX standard system call interface.

- **`fork`**
  - *What it is:* A system call wrapper used to create a new process.
  - *Implementation:* `pid_t fork(void);`
  - *Its use:* Used to demonstrate the process lifecycle and how the OS creates process instances.
  - *Type:* A library function wrapping a system call.
  - *Responsibility:* Creates a new child process by duplicating the calling parent process.
  - *Depends on:* Nothing (takes `void`).
  - *Connects to:* Executes a trap instruction; the kernel duplicates the process's memory space and context.
  - *Shape:* A fundamental POSIX process creation API.

- **`waitpid`**
  - *What it is:* A system call wrapper used to wait for state changes in a child process.
  - *Implementation:* `pid_t waitpid(pid_t pid, int *wstatus, int options);`
  - *Its use:* Used to demonstrate parent-child synchronization in the process lifecycle.
  - *Type:* A library function wrapping a system call.
  - *Responsibility:* Suspends execution of the calling process until a child specified by `pid` changes state.
  - *Depends on:* The PID of the child to wait for, a pointer to store status information, and options flags.
  - *Connects to:* Traps into the OS, which blocks the parent process until the child exits or changes state.
  - *Shape:* A POSIX standard system call interface.

- **`WEXITSTATUS`**
  - *What it is:* A macro used to extract the exit status of a child process.
  - *Implementation:* `#define WEXITSTATUS(status) (((status) & 0xff00) >> 8)`
  - *Its use:* Used to inspect the return value of a child process after `waitpid`.
  - *Type:* A C preprocessor macro.
  - *Responsibility:* Evaluates to the least significant 8 bits of the return code of the child process.
  - *Depends on:* The integer status value populated by `waitpid`.
  - *Connects to:* Operates directly on the integer status locally.
  - *Shape:* A POSIX standard macro defined in `<sys/wait.h>`.

- **`perror`**
  - *What it is:* A library function that prints a system error message.
  - *Implementation:* `void perror(const char *s);`
  - *Its use:* Used to print the human-readable string corresponding to the current value of `errno`.
  - *Type:* A standard library function.
  - *Responsibility:* Translates an error code into a descriptive message and writes it to standard error.
  - *Depends on:* An optional prefix string `s`, and the global `errno` variable set by the last failed system call.
  - *Connects to:* Calls `write` on file descriptor 2 (stderr).
  - *Shape:* A standard C library error handling function.

## Concept Unit: The three roles of the OS

### The Problem
Hardware is complex, messy, and finite. A computer has one CPU, a finite amount of RAM, and specific disk drives. If every user program had to write directly to the disk controller hardware to save a file, or if every program had to manually coordinate with other programs to share the CPU, writing software would be impossible. We need a layer between the hardware and the applications to manage these resources. What should that layer actually do?

### Introduce the concept in isolation
Here is a conceptual view of how a user program interacts with the hardware, mediated by the Operating System (OS). We will write a tiny throwaway C program that simply prints "hello", but we will trace its execution conceptually.

```c
#include <stdio.h>

int main(void)
{
    printf("hello\n"); 
    return 0;
}
```
*Output (predicted):*
```
hello
```
This output proves that the string was sent to the terminal. But this is called **abstraction and virtualization**. The `printf` function does not push pixels to the screen. It calls the `write()` system call. `write()` is a trap instruction that switches the CPU from user mode to kernel mode. The OS kernel takes over, copies the bytes to a terminal device driver. The driver knows the specific hardware details and tells the graphics hardware to display the characters. 

The OS plays three roles:
1. **Virtualization**: The OS makes shared hardware appear private and infinite. The CPU virtualization gives each process the illusion it owns the entire CPU. Memory virtualization gives each process the illusion it has a massive, private address space. Storage virtualization makes the disk appear as a hierarchical file system, hiding the physical sectors.
2. **Concurrency**: The OS manages multiple tasks running simultaneously. It uses time-sharing to rapidly switch the CPU between processes, and synchronization to ensure concurrent access to shared resources is safe.
3. **Persistence**: The OS ensures data survives power cycles. It implements file systems to organize data on disk and uses journaling to recover from crashes without data corruption.

### Discard the throwaway example
The simple `printf` conceptual trace is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are exploring conceptual foundations of the OS.
- **Files affected**: `os_roles.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: standard C library

### The New Code
```c
/* The OS kernel is written in C (and some assembly). It runs first. */
/* When your C program runs: */
#include <stdio.h>

int main(void)
{
    printf("hello\n");  /* this is NOT just printing to a screen */
    /* printf() calls write() system call */
    /* write() is a trap instruction that switches to kernel mode */
    /* The kernel copies bytes to the terminal device driver */
    /* The driver tells the hardware to display the characters */
    return 0;
}
```

### The Updated Project
```c
// 1: /* The OS kernel is written in C (and some assembly). It runs first. */
// 2: /* When your C program runs: */
// 3: #include <stdio.h>
// 4: 
// 5: int main(void)
// 6: {
// 7:     printf("hello\n");  /* this is NOT just printing to a screen */
// 8:     /* printf() calls write() system call */
// 9:     /* write() is a trap instruction that switches to kernel mode */
// 10:    /* The kernel copies bytes to the terminal device driver */
// 11:    /* The driver tells the hardware to display the characters */
// 12:    return 0;
// 13: }
```
This file demonstrates the illusion of simplicity. The `main` function simply asks to print "hello".

### Mechanical walkthrough
- `#include <stdio.h>`: The preprocessor directive that includes the standard input/output library declarations, making `printf` available.
- `int main(void)`: The entry point of the C program, where `int` specifies the integer return type and `void` indicates no arguments.
- `{`: Opens the function body.
- `printf("hello\n");`: A call to `printf`, passing the string literal `"hello\n"`. `printf` formats the string and eventually invokes the OS to do the actual I/O.
- `return 0;`: The `return` statement exits the function, returning the integer 0 to the OS to indicate successful execution.
- `}`: Closes the function body.

The actual magic happens under the hood: the OS virtualization abstracts away the complexity of electrons and pixels into a simple function call.

## Concept Unit: The three key OS abstractions

### The Problem
If the OS virtualizes hardware, what specific shapes do these illusions take? How does a C program "see" the CPU, the memory, and the disk?

### Introduce the concept in isolation
We will look at the three abstractions: Process, Virtual Memory, and File.

**Abstraction 1: Process**
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    pid_t my_pid = getpid();
    printf("My PID: %d\n", my_pid);
    return 0;
}
```
*Predicted output:*
```
My PID: 12345
```
This is called the **process abstraction**. The process is an instance of a running program. It has its own PID, CPU context, and address space.

**Abstraction 2: Virtual Memory**
```c
#include <stdio.h>

int global_var = 10;
int main(void) {
    printf("Global address: %p\n", (void*)&global_var);
    return 0;
}
```
*Predicted output:*
```
Global address: 0x601044
```
This is called **virtual memory**. The pointer address is a virtual address, not a physical hardware address in RAM. The OS maps it to physical memory transparently.

**Abstraction 3: File**
```c
#include <unistd.h>
int main(void) {
    write(1, "test\n", 5);
    return 0;
}
```
*Predicted output:*
```
test
```
This is the **file abstraction**. Everything is a file. The `write` function takes a file descriptor (`1` for standard output) and writes bytes to it, treating the terminal exactly like a disk file.

### Discard the throwaway example
The three throwaway snippets are discarded. They will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are demonstrating OS abstractions.
- **Files affected**: `abstractions.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: POSIX libraries (`unistd.h`, `fcntl.h`)

### The New Code
```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>

int global = 42;  /* lives in .data segment */

int main(void)
{
    /* Abstraction 1: Process */
    pid_t my_pid = getpid();   /* returns this process's ID */
    pid_t parent  = getppid(); /* returns parent's PID */
    printf("PID: %d, Parent PID: %d\n", my_pid, parent);

    /* Abstraction 2: Virtual Memory */
    int local = 100;  /* lives on the stack */
    int *heap = malloc(sizeof(int));  /* lives on the heap */
    *heap = 200;

    printf("global: %p\n", (void*)&global); /* e.g. 0x601234 */
    printf("local:  %p\n", (void*)&local);  /* e.g. 0x7fff1234 */
    printf("heap:   %p\n", (void*)heap);    /* e.g. 0x1234560 */
    free(heap);

    /* Abstraction 3: File */
    write(1, "hello\n", 6);  /* fd 1 = stdout = the terminal */
    write(2, "error\n", 6);  /* fd 2 = stderr = also the terminal */
    
    return 0;
}
```

### The Updated Project
```c
// 1: #include <stdio.h>
// 2: #include <stdlib.h>
// 3: #include <unistd.h>
// 4: #include <fcntl.h>
// 5: 
// 6: int global = 42;  /* lives in .data segment */
// 7: 
// 8: int main(void)
// 9: {
// 10:    /* Abstraction 1: Process */
// 11:    pid_t my_pid = getpid();   /* returns this process's ID */
// 12:    pid_t parent  = getppid(); /* returns parent's PID */
// 13:    printf("PID: %d, Parent PID: %d\n", my_pid, parent);
// 14: 
// 15:    /* Abstraction 2: Virtual Memory */
// 16:    int local = 100;  /* lives on the stack */
// 17:    int *heap = malloc(sizeof(int));  /* lives on the heap */
// 18:    *heap = 200;
// 19: 
// 20:    printf("global: %p\n", (void*)&global); /* e.g. 0x601234 */
// 21:    printf("local:  %p\n", (void*)&local);  /* e.g. 0x7fff1234 */
// 22:    printf("heap:   %p\n", (void*)heap);    /* e.g. 0x1234560 */
// 23:    free(heap);
// 24: 
// 25:    /* Abstraction 3: File */
// 26:    write(1, "hello\n", 6);  /* fd 1 = stdout = the terminal */
// 27:    write(2, "error\n", 6);  /* fd 2 = stderr = also the terminal */
// 28:    
// 29:    return 0;
// 30: }
```
This single program exercises all three core OS abstractions.

### Mechanical walkthrough
- `int global = 42;`: Declares a global integer variable. In the virtual memory abstraction, this is placed in the data segment.
- `pid_t my_pid = getpid();`: Calls the `getpid()` function to get the current process ID, storing it in the `pid_t` variable `my_pid`. This relies on the process abstraction.
- `pid_t parent  = getppid();`: Calls `getppid()` to get the parent process ID, storing it in `parent`.
- `printf("PID: %d, Parent PID: %d\n", my_pid, parent);`: Prints the PIDs.
- `int local = 100;`: Declares a local integer variable, which is placed on the process's stack in virtual memory.
- `int *heap = malloc(sizeof(int));`: Calls `malloc()` to allocate memory on the heap. The return value is assigned to `heap`, a pointer to an integer (`int *`).
- `*heap = 200;`: Dereferences the pointer to store the value 200 in the allocated heap memory.
- `printf("global: %p\n", (void*)&global);`: Uses the address-of operator `&` to get the address of `global`, casts it to a void pointer, and prints it as a virtual memory address.
- `printf("local:  %p\n", (void*)&local);`: Prints the virtual memory address of the local variable.
- `printf("heap:   %p\n", (void*)heap);`: Prints the virtual memory address of the heap allocation.
- `free(heap);`: Returns the dynamically allocated memory to the virtual memory manager.
- `write(1, "hello\n", 6);`: Calls `write()` on file descriptor `1` (stdout). The OS treats the terminal as a file abstraction.
- `write(2, "error\n", 6);`: Calls `write()` on file descriptor `2` (stderr).

## Concept Unit: Kernel mode vs user mode

### The Problem
If the OS provides abstractions, what stops a user program from bypassing the OS and writing directly to the disk, or modifying another program's virtual memory? How is isolation enforced?

### Introduce the concept in isolation
We will write a C program that attempts to execute a privileged instruction that only the OS should be allowed to run.

```c
int main(void) {
    /* Attempt to disable hardware interrupts */
    __asm__ volatile ("cli");
    return 0;
}
```
*Predicted output:*
```
Segmentation fault (core dumped)
```
This is called **kernel mode vs user mode isolation**. The CPU has hardware privilege levels. On x86-64, Ring 0 is Kernel mode (full access), and Ring 3 is User mode (restricted access). The `cli` instruction disables hardware interrupts, which is a Ring 0 instruction. Because our C program runs in Ring 3, the CPU hardware itself blocks the instruction, raises a General Protection Fault, and the OS terminates our program with a Segmentation fault (SIGSEGV).

### Discard the throwaway example
The illegal instruction example is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected**: `privilege.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: none

### The New Code
```c
int main(void)
{
    /* This would be a privileged instruction -- illegal in user mode */
    /* asm volatile ("cli"); */  /* disable interrupts -- only kernel can do this */
    /* The CPU raises a General Protection Fault -> SIGSEGV or program termination */

    /* Correct way: ask the OS via a system call */
    /* write(1, "hello", 5); -> trap instruction -> kernel handles it */
    return 0;
}
```

### The Updated Project
```c
// 1: int main(void)
// 2: {
// 3:     /* This would be a privileged instruction -- illegal in user mode */
// 4:     /* asm volatile ("cli"); */  /* disable interrupts -- only kernel can do this */
// 5:     /* The CPU raises a General Protection Fault -> SIGSEGV or program termination */
// 6: 
// 7:     /* Correct way: ask the OS via a system call */
// 8:     /* write(1, "hello", 5); -> trap instruction -> kernel handles it */
// 9:     return 0;
// 10: }
```
This conceptual code illustrates that to interact with hardware safely, you cannot bypass the OS; you must ask the OS to do it on your behalf.

### Mechanical walkthrough
- `/* asm volatile ("cli"); */`: A commented-out inline assembly instruction that would attempt to clear the interrupt flag. If executed in user mode, it causes a hardware fault.
- `/* write(1, "hello", 5); */`: A commented-out system call wrapper. Instead of doing the hardware work ourselves, we trap into the OS, which validates the request and performs it safely in kernel mode.

## Concept Unit: System calls

### The Problem
If a user program is trapped in Ring 3 and cannot access hardware directly, how does it ever read a file or print to the screen? How do we securely transition from user mode to kernel mode?

### Introduce the concept in isolation
We will make a raw system call in assembly to demonstrate how the transition happens on x86-64.

```c
#include <unistd.h>

int main(void) {
    /* Raw system call to write(1, "hello", 5) */
    __asm__ volatile (
        "movq $1, %%rax\n"
        "movq $1, %%rdi\n"
        "leaq %0, %%rsi\n"
        "movq $5, %%rdx\n"
        "syscall\n"
        : 
        : "m" ("hello")
        : "%rax", "%rdi", "%rsi", "%rdx"
    );
    return 0;
}
```
*Predicted output:*
```
hello
```
This is called a **system call via a trap**. To ask the OS to do something, we load the system call number (1 for `sys_write`) into the `%rax` register, the arguments into `%rdi`, `%rsi`, and `%rdx`, and then execute the special `syscall` instruction. The `syscall` instruction is a hardware trap: it intentionally changes the CPU privilege level to Ring 0 and jumps to a predefined address in the OS kernel. The kernel handles the request, and then executes a return-from-trap instruction to resume the user program in Ring 3.

### Discard the throwaway example
The raw inline assembly system call is discarded. C libraries provide convenient wrappers. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected**: `syscall_wrapper.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: POSIX standard library (`unistd.h`, `stdio.h`)

### The New Code
```c
#include <unistd.h>
#include <stdio.h>

int main(void)
{
    /* write() in libc wraps the syscall instruction: */
    ssize_t n = write(1, "hello", 5);  /* returns 5 on success */
    if (n < 0) {
        /* errno is set by the C library from the kernel error code */
        perror("write");  /* prints: write: <error description> */
        return 1;
    }
    return 0;
}
```

### The Updated Project
```c
// 1: #include <unistd.h>
// 2: #include <stdio.h>
// 3: 
// 4: int main(void)
// 5: {
// 6:     /* write() in libc wraps the syscall instruction: */
// 7:     ssize_t n = write(1, "hello", 5);  /* returns 5 on success */
// 8:     if (n < 0) {
// 9:         /* errno is set by the C library from the kernel error code */
// 10:        perror("write");  /* prints: write: <error description> */
// 11:        return 1;
// 12:    }
// 13:    return 0;
// 14: }
```
This program uses the C library wrapper `write()` to safely execute a system call.

### Mechanical walkthrough
- `ssize_t n = write(1, "hello", 5);`: The `write` function is called and returns an `ssize_t` stored in `n`. Internally, it loads the registers and issues the `syscall` instruction. The OS executes the I/O and returns the number of bytes written.
- `if (n < 0)`: Checks if the system call failed (e.g., bad file descriptor) using an `if` statement. The OS actually returns a negative error code (like `-EBADF`), but the C library wrapper detects the negative value, sets the global `errno` variable to the positive error code, and returns `-1` to the caller.
- `perror("write");`: The `perror` function reads the global `errno` variable and prints the corresponding human-readable error message.
- `return 1;`: Exits the program with a failure status.

## Concept Unit: Exceptions

### The Problem
A system call is an intentional transition into the kernel, initiated by the program. But how does the OS regain control if the program is stuck in an infinite loop? Or how does it handle hardware events like a key press or a bad memory access?

### Introduce the concept in isolation
We will write a C program that triggers a division by zero.

```c
int main(void) {
    int x = 1;
    int y = 0;
    int z = x / y;
    return z;
}
```
*Predicted output:*
```
Floating point exception (core dumped)
```
This is called an **exception**. An exception is a sudden change in control flow in response to a state change. There are four classes:
1. **Interrupt**: Asynchronous (caused by hardware like a timer). Returns to the next instruction.
2. **Trap**: Synchronous and intentional (like a system call). Returns to the next instruction.
3. **Fault**: Synchronous and potentially recoverable (like a page fault or divide by zero). Returns to the current instruction to retry, or aborts if unrecoverable.
4. **Abort**: Unrecoverable hardware error (like machine check). Never returns.

The division by zero caused the CPU hardware to raise a fault. The CPU switched to kernel mode and jumped to the OS's exception handler. The OS determined the fault was a divide-by-zero, and since the program cannot recover, the OS sent a signal to terminate the program.

### Discard the throwaway example
The divide-by-zero example is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected**: `exceptions.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: `stdlib.h`

### The New Code
```c
#include <stdlib.h>

int main(void)
{
    /* Trap: intentional, synchronous -- system calls use traps */
    /* write(1, "hi", 2); */  /* syscall instruction: trap to kernel, return after */

    /* Fault: recoverable error -- the OS may fix it and retry */
    /* Page fault example: */
    int *p = malloc(4096 * 1000);  /* allocate virtual memory (no physical pages yet) */
    *p = 42;  /* first access: page fault! OS allocates a physical page, retries instruction */
    /* transparent to the program -- appears to work normally */

    /* Abort: unrecoverable */
    /* Machine check: hardware detected uncorrectable memory error -> kernel aborts */
    return 0;
}
```

### The Updated Project
```c
// 1: #include <stdlib.h>
// 2: 
// 3: int main(void)
// 4: {
// 5:     /* Trap: intentional, synchronous -- system calls use traps */
// 6:     /* write(1, "hi", 2); */  /* syscall instruction: trap to kernel, return after */
// 7: 
// 8:     /* Fault: recoverable error -- the OS may fix it and retry */
// 9:     /* Page fault example: */
// 10:    int *p = malloc(4096 * 1000);  /* allocate virtual memory (no physical pages yet) */
// 11:    *p = 42;  /* first access: page fault! OS allocates a physical page, retries instruction */
// 12:    /* transparent to the program -- appears to work normally */
// 13: 
// 14:    /* Abort: unrecoverable */
// 15:    /* Machine check: hardware detected uncorrectable memory error -> kernel aborts */
// 16:    return 0;
// 17: }
```
This conceptual program illustrates the different types of exceptions and how faults can be silently recovered by the OS.

### Mechanical walkthrough
- `int *p = malloc(4096 * 1000);`: The `malloc` function requests a large chunk of virtual memory, assigning the result to the pointer `p`. The OS grants the virtual address range but does not actually allocate physical RAM pages for it yet (lazy allocation).
- `*p = 42;`: The program attempts to write to the memory by dereferencing the pointer `p`. The CPU checks the page table, finds no valid physical mapping, and raises a **page fault** exception. The CPU traps to the OS. The OS allocates a real physical page, updates the page table, and returns control to the *same instruction* `*p = 42;`. The instruction runs again, succeeds, and the user program never knew it was paused.

## Concept Unit: Process lifecycle

### The Problem
If a process is an abstraction, how does a new one come into existence? How do programs like a shell start other programs?

### Introduce the concept in isolation
We will write a C program that creates a new process.

```c
#include <unistd.h>
#include <stdio.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("I am the child\n");
    } else {
        printf("I am the parent\n");
    }
    return 0;
}
```
*Predicted output (order may vary):*
```
I am the parent
I am the child
```
This is the **process lifecycle via fork**. The `fork()` system call creates a near-identical clone of the calling process. Both processes resume execution at the instruction immediately following `fork()`. They have separate memory spaces. They are distinguished only by the return value of `fork()`: it returns `0` to the new child process, and the child's PID to the parent.

### Discard the throwaway example
The simple fork example is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected**: `process_lifecycle.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: POSIX standard library (`unistd.h`, `sys/wait.h`, `stdio.h`)

### The New Code
```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

int main(void)
{
    pid_t pid = fork();  /* create a copy of this process */

    if (pid == 0) {
        /* CHILD process: fork() returned 0 */
        printf("Child: PID=%d\n", getpid());
        /* child does work here */
        return 0;  /* child exits */
    } else {
        /* PARENT process: fork() returned child's PID */
        printf("Parent: child PID=%d\n", pid);
        int status;
        waitpid(pid, &status, 0);  /* wait for child to finish */
        printf("Child exited with status %d\n", WEXITSTATUS(status));
    }
    return 0;
}
```

### The Updated Project
```c
// 1: #include <unistd.h>
// 2: #include <sys/wait.h>
// 3: #include <stdio.h>
// 4: 
// 5: int main(void)
// 6: {
// 7:     pid_t pid = fork();  /* create a copy of this process */
// 8: 
// 9:     if (pid == 0) {
// 10:        /* CHILD process: fork() returned 0 */
// 11:        printf("Child: PID=%d\n", getpid());
// 12:        /* child does work here */
// 13:        return 0;  /* child exits */
// 14:    } else {
// 15:        /* PARENT process: fork() returned child's PID */
// 16:        printf("Parent: child PID=%d\n", pid);
// 17:        int status;
// 18:        waitpid(pid, &status, 0);  /* wait for child to finish */
// 19:        printf("Child exited with status %d\n", WEXITSTATUS(status));
// 20:    }
// 21:    return 0;
// 22: }
```
This program creates a process, does different things in the parent and child, and synchronizes their execution.

### Mechanical walkthrough
- `pid_t pid = fork();`: Calls the `fork` system call to duplicate the process.
- `if (pid == 0)`: Evaluates whether the current process is the child using the `if` construct. `fork` returns 0 in the child.
- `printf("Child: PID=%d\n", getpid());`: In the child, calls `getpid()` to print its own PID.
- `return 0;`: The child process exits successfully. When a process terminates, the OS reclaims its memory and CPU slices.
- `else {`: Executed by the parent process using the `else` construct, where `pid` holds the positive integer PID of the newly created child.
- `printf("Parent: child PID=%d\n", pid);`: The parent prints the child's PID.
- `int status;`: Declares an integer to hold the child's exit status.
- `waitpid(pid, &status, 0);`: The parent calls `waitpid`, which issues a system call. The OS puts the parent to sleep (blocks it) until the child process terminates. The child's exit status is written into the memory location pointed to by `&status`.
- `printf("Child exited with status %d\n", WEXITSTATUS(status));`: The `WEXITSTATUS` macro extracts the 8-bit exit code (0 in this case) from the raw integer status, and prints it.

## Concept Unit: Context switching

### The Problem
If we create multiple processes using `fork()`, and there is only one CPU core, how do they appear to run simultaneously? How does the OS multiplex the CPU among them without the programs constantly cooperating?

### Introduce the concept in isolation
No C program can truly show this in user space, because it happens invisibly underneath the program. We will conceptually trace what happens during a **context switch**. 

The hardware includes a timer chip that interrupts the CPU every few milliseconds. This asynchronous timer interrupt forces the CPU to jump to the OS kernel. 
The OS maintains a Process Control Block (PCB) for every process. When the timer fires while Process A is running, the OS saves Process A's state into A's PCB, picks Process B from the ready queue, loads B's state from B's PCB, and jumps to B's code.

### Discard the throwaway example
The conceptual trace stands on its own. It will not appear in the project again.

### Project Change
No reference counterpart.
- **Files affected**: `pcb_structure.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: none

### The New Code
```c
/* Conceptual structure (simplified from the Linux task_struct): */
#include <sys/types.h>

struct PCB {
    pid_t    pid;           /* process ID */
    long     regs[16];      /* saved general-purpose registers */
    long     rip;           /* saved program counter */
    long     rsp;           /* saved stack pointer */
    long     cr3;           /* saved page table base address */
    int      state;         /* RUNNING, READY, BLOCKED */
    int      exit_status;
    /* ... file descriptor table, signal masks, etc. */
};
```

### The Updated Project
```c
// 1: /* Conceptual structure (simplified from the Linux task_struct): */
// 2: #include <sys/types.h>
// 3: 
// 4: struct PCB {
// 5:     pid_t    pid;           /* process ID */
// 6:     long     regs[16];      /* saved general-purpose registers */
// 7:     long     rip;           /* saved program counter */
// 8:     long     rsp;           /* saved stack pointer */
// 9:     long     cr3;           /* saved page table base address */
// 10:    int      state;         /* RUNNING, READY, BLOCKED */
// 11:    int      exit_status;
// 12:    /* ... file descriptor table, signal masks, etc. */
// 13: };
```
This is what the OS keeps track of in kernel memory for every process you run.

### Mechanical walkthrough
- `struct PCB {`: Defines the conceptual Process Control Block using the `struct` keyword to group data.
- `pid_t pid;`: Stores the unique integer identifier for the process.
- `long regs[16];`: An array of type `long` to store the state of the CPU's general-purpose registers (like `%rax`, `%rbx`) when the process is preempted.
- `long rip;`: Stores the Instruction Pointer (program counter) indicating the exact memory address of the next instruction the process was about to execute before being paused.
- `long rsp;`: Stores the Stack Pointer, keeping track of the process's call stack.
- `long cr3;`: Stores the memory address of the process's page table. This is how the OS switches the virtual memory context. By loading a new value into the hardware `cr3` register, the whole virtual memory map instantly switches to the new process's map.
- `int state;`: Tracks whether the process is currently running on the CPU, ready to run, or blocked (e.g., waiting for `waitpid` or disk I/O).
- `int exit_status;`: Stores the value the process passed to `exit()` or returned from `main()`, to be later read by the parent's `waitpid()`.
- `};`: Closes the struct definition.

A context switch from A to B works precisely by saving all current CPU registers into A's PCB, then copying all registers from B's PCB into the physical CPU registers, and finally setting the CPU's instruction pointer to B's saved `rip`. This restores B exactly as it was when it was paused.

---
You now know what the OS is and what it does. The next six lessons peel back each OS service layer by layer. Lesson 20 covers processes in depth: `fork()`, `exec()`, `wait()`, and how the shell is just C code. 

**Exercises:**
1. List all three OS abstractions and their hardware counterparts.
2. Trace what happens at the hardware level when you call `write(1, "hi", 2)`.
3. Explain why a segfault (SIGSEGV) is delivered by the OS rather than directly by the CPU.
