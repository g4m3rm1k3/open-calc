# Lesson 19: What the OS Does — Processes, Kernel Mode, System Calls, and Exceptions

**What you will build**
The reader will understand what the OS kernel does and HOW it does it: user vs. kernel mode, the exception/interrupt mechanism, system calls as controlled mode transitions, and the process abstraction. The transferable insight is that the OS is not magic. It is software that runs in a privileged mode and gains control via hardware exceptions. Every interaction between your program and the system (file I/O, network, memory allocation, process creation) is fundamentally a system call.

**What you need to know first**
Lessons 00-18. 

**Terms used in this lesson**
- **Ring 0 / Kernel Mode** — The hardware-enforced CPU privilege level where the operating system kernel runs. Code here can execute any instruction, access any memory address, and interact directly with hardware peripherals. It exists to protect the system from malicious or buggy user programs.
- **Ring 3 / User Mode** — The restricted CPU privilege level where normal applications run. Code here cannot directly access hardware or kernel memory, and must ask the kernel for help via system calls. It exists to isolate applications from each other and from the OS itself.
- **System Call (syscall)** — A controlled mechanism that intentionally triggers an exception to switch the CPU from Ring 3 to Ring 0, jumping to a pre-registered OS handler. It exists because user-mode code cannot perform privileged operations directly.
- **Exception** — A hardware event that abruptly changes the CPU's control flow, switching execution to the kernel. It exists to handle asynchronous events (interrupts), intentional requests (traps/syscalls), and errors (faults and aborts).
- **Process** — The kernel's abstraction of a running program. It exists to give each program the illusion that it has exclusive use of the CPU and its own private, contiguous memory space, simplifying application development.
- **Context Switch** — The mechanism by which the OS saves the CPU registers and memory state of a running process and restores the state of a different process. It exists to multiplex a single CPU across many concurrent processes.
- **Virtual File System (/proc)** — An interface provided by the kernel that looks like normal files and directories but actually queries kernel data structures in real-time. It exists to allow user-space tools to inspect OS state using standard file I/O operations.

**Objects and methods used**

- **getpid**
  - *What it is:* A POSIX standard library function that returns the Process ID of the calling process.
  - *Implementation:* `pid_t getpid(void);`
  - *Its use:* Used in this lesson to demonstrate a basic, simple system call that queries the kernel for information.
  - *Type:* Standard C library function.
  - *Responsibility:* Queries the OS kernel for the unique integer identifying the current running process.
  - *Depends on:* The underlying OS kernel providing a system call to retrieve process metadata.
  - *Connects to:* Called by user code; calls into the kernel's process management subsystem.
  - *Shape:* A public API in `<unistd.h>` serving as a thin wrapper around a system call.

- **getppid**
  - *What it is:* A POSIX standard library function returning the Parent Process ID.
  - *Implementation:* `pid_t getppid(void);`
  - *Its use:* Used to demonstrate retrieving relational metadata about processes.
  - *Type:* Standard C library function.
  - *Responsibility:* Identifies the process that spawned the current process.
  - *Depends on:* Kernel process tracking data structures.
  - *Connects to:* Called by user code; queries kernel state.
  - *Shape:* A public API in `<unistd.h>`.

- **getuid**
  - *What it is:* A POSIX standard library function returning the Real User ID.
  - *Implementation:* `uid_t getuid(void);`
  - *Its use:* Used to show how the kernel tracks privileges and identity.
  - *Type:* Standard C library function.
  - *Responsibility:* Retrieves the numeric ID of the user who launched the process.
  - *Depends on:* Kernel security/credential data structures.
  - *Connects to:* Called by user code; queries kernel state.
  - *Shape:* A public API in `<sys/types.h>` and `<unistd.h>`.

- **write**
  - *What it is:* A low-level POSIX system call wrapper for writing bytes to a file descriptor.
  - *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
  - *Its use:* Used to demonstrate a system call that moves data from user space to a kernel-managed device or file.
  - *Type:* Standard C library function (syscall wrapper).
  - *Responsibility:* Requests the kernel to transfer `count` bytes from the user buffer `buf` to the resource identified by `fd`.
  - *Depends on:* An open, valid file descriptor and a valid memory buffer.
  - *Connects to:* Called by user code; interacts with the kernel VFS (Virtual File System) layer and device drivers.
  - *Shape:* The fundamental output primitive in POSIX systems, residing in `<unistd.h>`.

- **signal**
  - *What it is:* A standard C library function to set a signal handler.
  - *Implementation:* `void (*signal(int signum, void (*handler)(int)))(int);`
  - *Its use:* Used to catch a hardware fault (SIGSEGV) that the kernel translates into a user-space signal.
  - *Type:* Standard C library function.
  - *Responsibility:* Registers a user-space function to be executed asynchronously when the kernel delivers a specific signal.
  - *Depends on:* The kernel's signal delivery mechanism.
  - *Connects to:* Called by user code; modifies process state in the kernel.
  - *Shape:* A public API in `<signal.h>`.

- **setjmp**
  - *What it is:* A standard C library macro/function that saves the current execution context.
  - *Implementation:* `int setjmp(jmp_buf env);`
  - *Its use:* Used to demonstrate recovering control flow after a severe fault, saving state before doing something dangerous.
  - *Type:* Standard C library macro/function.
  - *Responsibility:* Snapshots the CPU registers (like stack pointer and instruction pointer) into a buffer for later restoration.
  - *Depends on:* A user-provided `jmp_buf` structure.
  - *Connects to:* Called by user code; sets a jump target for `longjmp`.
  - *Shape:* A non-local goto mechanism in `<setjmp.h>`.

- **longjmp**
  - *What it is:* A standard C library function that restores an execution context.
  - *Implementation:* `void longjmp(jmp_buf env, int val);`
  - *Its use:* Used inside a signal handler to escape the faulting context and return to the safe state saved by `setjmp`.
  - *Type:* Standard C library function.
  - *Responsibility:* Replaces the current CPU registers with those saved in `env`, causing execution to resume as if `setjmp` had just returned `val`.
  - *Depends on:* A valid `jmp_buf` previously initialized by `setjmp`.
  - *Connects to:* Called from within a signal handler; jumps back to the `setjmp` call site.
  - *Shape:* A non-local goto mechanism in `<setjmp.h>`.

- **syscall**
  - *What it is:* A GNU C Library function that invokes a raw system call by number.
  - *Implementation:* `long syscall(long number, ...);`
  - *Its use:* Used to show exactly how user mode transitions to kernel mode by manually passing the syscall number and arguments.
  - *Type:* Standard C library function (architecture specific).
  - *Responsibility:* Executes the architecture-specific trap instruction (e.g., `syscall` on x86-64) with the provided arguments in the correct registers.
  - *Depends on:* Architecture-specific calling conventions and valid syscall numbers.
  - *Connects to:* Called by user code; triggers a trap to the kernel's syscall entry point.
  - *Shape:* A low-level escape hatch in `<unistd.h>` and `<sys/syscall.h>`.

- **fopen**
  - *What it is:* A standard C library function for opening a file stream.
  - *Implementation:* `FILE *fopen(const char *pathname, const char *mode);`
  - *Its use:* Used to read from the `/proc` virtual filesystem.
  - *Type:* Standard C library function.
  - *Responsibility:* Allocates a `FILE` structure, buffers, and calls the `open` system call.
  - *Depends on:* A valid file path and the OS kernel's VFS layer.
  - *Connects to:* Called by user code; calls the `open` syscall.
  - *Shape:* The standard buffered I/O initialization in `<stdio.h>`.

- **fgets**
  - *What it is:* A standard C library function for reading a line from a stream.
  - *Implementation:* `char *fgets(char *s, int size, FILE *stream);`
  - *Its use:* Used to read text lines generated dynamically by the kernel from `/proc`.
  - *Type:* Standard C library function.
  - *Responsibility:* Reads characters from a stream into a buffer until a newline or EOF is reached.
  - *Depends on:* A valid, open `FILE` stream.
  - *Connects to:* Called by user code; calls the `read` syscall under the hood.
  - *Shape:* Buffered input primitive in `<stdio.h>`.

- **fclose**
  - *What it is:* A standard C library function to close a file stream.
  - *Implementation:* `int fclose(FILE *stream);`
  - *Its use:* Used to cleanly release the file descriptor opened for `/proc`.
  - *Type:* Standard C library function.
  - *Responsibility:* Flushes any pending output and closes the underlying file descriptor via the `close` syscall.
  - *Depends on:* A valid, open `FILE` stream.
  - *Connects to:* Called by user code; calls `close` in the kernel.
  - *Shape:* Resource cleanup function in `<stdio.h>`.

- **snprintf**
  - *What it is:* A standard C library function for safe string formatting.
  - *Implementation:* `int snprintf(char *str, size_t size, const char *format, ...);`
  - *Its use:* Used to dynamically build the `/proc/[pid]/status` file path string.
  - *Type:* Standard C library function.
  - *Responsibility:* Writes a formatted string into a buffer, ensuring it does not write more than `size` bytes.
  - *Depends on:* A valid output buffer and a format string.
  - *Connects to:* Called by user code.
  - *Shape:* Safe string manipulation API in `<stdio.h>`.

- **clock_gettime**
  - *What it is:* A POSIX standard library function for high-resolution timing.
  - *Implementation:* `int clock_gettime(clockid_t clk_id, struct timespec *tp);`
  - *Its use:* Used to measure the actual elapsed time of a sleep, revealing the overhead of context switching.
  - *Type:* POSIX standard library function.
  - *Responsibility:* Queries a specific system clock to get the current time down to nanosecond precision.
  - *Depends on:* Kernel timing subsystems and vDSO (virtual dynamic shared object) for fast retrieval.
  - *Connects to:* Called by user code; often fulfilled without a full syscall via vDSO.
  - *Shape:* Timing API in `<time.h>`.

- **nanosleep**
  - *What it is:* A POSIX standard library function to suspend execution for a high-resolution time interval.
  - *Implementation:* `int nanosleep(const struct timespec *req, struct timespec *rem);`
  - *Its use:* Used to intentionally trigger a voluntary context switch by blocking the current process.
  - *Type:* POSIX standard library function.
  - *Responsibility:* Tells the kernel scheduler to put the process to sleep and not schedule it again until the requested time has elapsed.
  - *Depends on:* The kernel's timer and scheduler mechanisms.
  - *Connects to:* Called by user code; invokes a blocking syscall in the kernel.
  - *Shape:* Process control API in `<time.h>`.


## Concept Unit: Kernel mode vs. user mode — privilege levels

### The Problem
How can an operating system protect itself and other programs from a buggy or malicious application? If any program could execute any instruction, it could wipe the hard drive or halt the CPU. How does the hardware physically restrict what normal programs can do?

### Introduce the concept in isolation
```c
/* User mode: your program runs here */
/* - Cannot execute privileged instructions (hlt, cli, sti, in, out) */
/* - Cannot access kernel memory (page table marks it non-accessible) */
/* - Cannot directly access hardware (disk, NIC, GPU registers) */
/* - Cannot modify page tables */

/* Kernel mode: OS kernel runs here */
/* - Can execute ALL instructions */
/* - Can access ALL memory */
/* - Can access hardware registers directly */
/* - Controls which processes run (scheduler) */

/* The CPU has a privilege level bit (Ring 0 = kernel, Ring 3 = user on x86) */
/* User code: Ring 3. Kernel code: Ring 0. */
/* Attempting a privileged op in Ring 3 -> General Protection Fault (exception) */

#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main(void) {
    /* Everything we do goes through the kernel: */
    pid_t pid = getpid();     /* syscall: kernel returns our PID */
    pid_t ppid = getppid();   /* syscall: kernel returns parent PID */
    uid_t uid  = getuid();    /* syscall: kernel returns user ID */

    printf("PID=%d PPID=%d UID=%d\n", pid, ppid, uid);

    /* printf itself uses write() syscall to write to fd 1 (stdout) */
    /* write() is a syscall: CPU switches to kernel mode */
    /* Kernel: validates the fd, copies bytes to the output buffer */
    /* Kernel: returns number of bytes written */
    /* CPU: switches back to user mode */
    write(1, "direct write syscall\n", 21);
    return 0;
}
/* Output (PIDs vary):
   PID=12345 PPID=12300 UID=1000
   direct write syscall */
```
This output proves that our application successfully communicated with the kernel to request information (PIDs, UIDs) and to perform a restricted operation (writing to a device). We did not interact with the screen directly; we asked the kernel to do it for us. This boundary is **Kernel Mode vs. User Mode**.

### Discard the throwaway
This code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because this lesson focuses on system fundamentals.
- **Files affected:** None.
- **Change type:** None.
- **Location:** None.
- **Dependencies:** None.

### The New Code
```c
write(1, "direct write syscall\n", 21);
```

### The Updated Project
```c
1: int main(void) {
2:     // ... initialization code
3:     write(1, "direct write syscall\n", 21); // <- new
4:     return 0;
5: }
```
We place a direct system call wrapper into our `main` entry point. This structure acts as a simple test bed to observe interactions with the operating system kernel.

### Mechanical walkthrough
- **`write`**: A function call to a POSIX library wrapper.
- **`(`**: Opens the argument list.
- **`1`**: The first argument, an integer literal representing the file descriptor for standard output (stdout).
- **`,`**: Separates arguments.
- **`"direct write syscall\n"`**: A string literal providing the data buffer to write. The `\n` is the newline character.
- **`,`**: Separates arguments.
- **`21`**: An integer literal specifying the exact number of bytes to transfer.
- **`)`**: Closes the argument list.
- **`;`**: Terminates the statement.

### CS lens
The fundamental CS concept is Privilege Separation. By creating hardware-enforced boundaries (Rings), systems can isolate critical components from untrusted or error-prone code. This appears in hypervisors managing VMs, web browsers isolating JavaScript tabs in sandboxes, and cloud architectures separating tenant network traffic.

### SE lens
A design principle here is the Facade or Gateway pattern at the OS level. Instead of exposing complex disk scheduling and hardware interrupts to applications, the kernel exposes a stable, abstract API (system calls). The tradeoff is performance overhead: transitioning across the user/kernel boundary costs CPU cycles.

### Commands needed
`strace ./prog` (to trace the system calls made by a program).

### Run it
Trace `write(1, "direct write syscall\n", 21)`: user code executes `syscall` instruction (x86-64). CPU: saves user-mode registers (`rip`, `rsp`, `rflags`) to kernel stack. Switches to Ring 0. Jumps to kernel's syscall handler (address in `MSR_LSTAR` register). Kernel validates fd=1 (stdout), copies 21 bytes to kernel buffer, flushes to terminal device. Returns 21 in `rax`. CPU restores user-mode registers, switches to Ring 3. Execution resumes after syscall.

### One sentence connecting to previous unit
If user-mode applications cannot directly access the hardware or kernel memory, we must understand the exact mechanism by which the CPU transfers control to the kernel.

## Concept Unit: Exceptions and interrupts — how the kernel gains control

### The Problem
How does the CPU actually transfer execution to the kernel? If your user-mode program is in an infinite loop, how does the OS ever get the CPU back to stop it?

### Introduce the concept in isolation
```c
/* Four types of exceptions (CS:APP taxonomy): */
/* 1. Interrupts: asynchronous, from HARDWARE (timer, disk, NIC) */
/*    Timer interrupt fires ~1000x/sec -> kernel preempts running process */
/*    Disk interrupt: disk has data ready -> kernel wakes waiting process */

/* 2. Traps: intentional, synchronous (system calls) */
/*    'syscall' instruction -> trap to kernel -> handle syscall -> return */

/* 3. Faults: unintentional, potentially recoverable */
/*    Page fault: access unmapped page -> kernel maps page -> re-execute */
/*    Divide by zero: usually kills process (SIGFPE) */
/*    Protection fault: access kernel memory from user mode -> SIGSEGV */

/* 4. Aborts: unrecoverable hardware errors */
/*    Machine check: uncorrectable RAM error -> kernel panic */

#include <stdio.h>
#include <signal.h>
#include <setjmp.h>

static jmp_buf jump_buf;

void segv_handler(int sig) {
    printf("Caught SIGSEGV (signal %d): page fault that couldn't be fixed\n", sig);
    longjmp(jump_buf, 1);
}

int main(void) {
    signal(SIGSEGV, segv_handler);
    if (setjmp(jump_buf) == 0) {
        int *bad_ptr = (int*)0xDEADBEEF;  /* invalid address */
        printf("Accessing bad ptr...\n");
        *bad_ptr = 42;  /* page fault -> SIGSEGV -> handler */
    } else {
        printf("Recovered from fault\n");
    }
    return 0;
}
/* Output:
   Accessing bad ptr...
   Caught SIGSEGV (signal 11): page fault that couldn't be fixed
   Recovered from fault */
```
This output proves that when a program performs an illegal operation (writing to unmapped memory), the CPU hardware generates a **Fault (Exception)** that immediately pauses user execution, switches to kernel mode, and forces the kernel to handle the error—which then translates into a signal sent back to the user process. 

### Discard the throwaway
This code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** None.
- **Change type:** None.
- **Location:** None.
- **Dependencies:** None.

### The New Code
```c
*bad_ptr = 42;
```

### The Updated Project
```c
1:     if (setjmp(jump_buf) == 0) {
2:         int *bad_ptr = (int*)0xDEADBEEF;
3:         printf("Accessing bad ptr...\n");
4:         *bad_ptr = 42;  // <- new
5:     }
```
We inject an intentional invalid memory write into our program to force the hardware to generate an exception.

### Mechanical walkthrough
- **`*`**: The dereference operator. It instructs the CPU to interpret the following variable as a memory address and access the value at that location.
- **`bad_ptr`**: A variable of type pointer-to-integer, containing an invalid address.
- **`=`**: The assignment operator.
- **`42`**: An integer literal.
- **`;`**: Terminates the statement.

### CS lens
The fundamental CS concept is Asynchronous Control Flow. Hardware exceptions override the normal sequential execution of instructions. This is essential for preemptive multitasking, hardware event handling (like keyboard presses), and system stability (preventing one bad program from freezing the machine).

### SE lens
A design principle here is Inversion of Control. Instead of the application polling for errors or hardware events, the hardware forcefully notifies the system. The alternative—having user programs voluntarily yield control or check for interrupts—leads to uncooperative multitasking, where one frozen program locks the entire computer (as in early versions of Windows and Mac OS).

### Commands needed
None for this unit.

### Run it
Trace `*bad_ptr = 42`: CPU fetches `0xDEADBEEF` -> MMU checks page table -> no valid PTE (not mapped). MMU raises page fault exception (exception number 14). CPU: saves `rip` (address of faulting instruction), switches to kernel mode, calls kernel's page fault handler. Kernel: checks if `0xDEADBEEF` is a valid virtual address for this process. It's not (not in any VMA). Kernel sends SIGSEGV to process. Process signal handler runs. `longjmp` recovers.

### One sentence connecting to previous unit
While faults and interrupts are unplanned exceptions, programs intentionally trigger exceptions to request OS services.

## Concept Unit: System calls — the controlled kernel entry point

### The Problem
If user mode cannot directly access the disk or network, but needs to read files and send packets, how exactly does it ask the kernel to perform these tasks on its behalf? 

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/syscall.h>

int main(void) {
    /* Every library function that talks to hardware uses syscalls: */
    /* fopen() -> open() syscall (SYS_open = 2) */
    /* fread() -> read() syscall (SYS_read = 0) */
    /* malloc() -> mmap() or brk() syscall */
    /* printf() -> write() syscall (SYS_write = 1) */
    /* exit() -> exit_group() syscall (SYS_exit_group = 231) */

    /* Making a syscall directly (Linux x86-64): */
    /* rax = syscall number */
    /* rdi,rsi,rdx,r10,r8,r9 = arguments */
    /* syscall instruction -> kernel */
    /* return value in rax */

    /* Equivalent to write(1, "hello\n", 6): */
    long ret = syscall(SYS_write, 1, "hello via syscall()\n", 20);
    printf("write returned: %ld\n", ret);  /* 20 */

    /* strace shows all syscalls a program makes: */
    /* strace ./prog 2>&1 | head -20 */
    /* Output shows: execve, brk, mmap, open, read, write, exit */
    /* A 'hello world' program makes ~100 syscalls before main() */

    return 0;
}
/* Output:
   hello via syscall()
   write returned: 20 */
```
This output proves that we can explicitly invoke an OS routine by supplying its unique identifying number (`SYS_write`) and arguments to the **System Call** interface, bypassing the standard library wrapper entirely. 

### Discard the throwaway
This code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** None.
- **Change type:** None.
- **Location:** None.
- **Dependencies:** None.

### The New Code
```c
long ret = syscall(SYS_write, 1, "hello via syscall()\n", 20);
```

### The Updated Project
```c
1: int main(void) {
2:     long ret = syscall(SYS_write, 1, "hello via syscall()\n", 20); // <- new
3:     printf("write returned: %ld\n", ret); 
4:     return 0;
5: }
```
We replace the standard `write` function call with a direct invocation of the raw system call mechanism to reveal the underlying machinery.

### Mechanical walkthrough
- **`long`**: The type declaration for the return value, capable of holding register-sized responses.
- **`ret`**: The name of the variable storing the result.
- **`=`**: The assignment operator.
- **`syscall`**: A variadic library function that formats arguments into CPU registers and executes the trap instruction.
- **`(`**: Opens the argument list.
- **`SYS_write`**: A macro defined in `<sys/syscall.h>` representing the integer ID of the write system call (1 on x86-64).
- **`,`**: Separates arguments.
- **`1`**: The file descriptor argument.
- **`,`**: Separates arguments.
- **`"hello via syscall()\n"`**: The buffer argument.
- **`,`**: Separates arguments.
- **`20`**: The length argument.
- **`)`**: Closes the argument list.
- **`;`**: Terminates the statement.

### CS lens
The fundamental CS concept is an API boundary via Trap. Instead of a function call that jumps to a memory address, a system call triggers a hardware trap, which safely transitions the processor state. You see similar boundary transitions in RPC (Remote Procedure Calls) crossing a network, or FFI (Foreign Function Interfaces) crossing languages.

### SE lens
A design principle here is Architecture Isolation. By providing a fixed, numbered system call interface, the OS kernel can change its internal memory layout, structures, and algorithms freely without breaking user-space applications, as long as the syscall ABI (Application Binary Interface) remains stable.

### Commands needed
`strace` 

### Run it
Trace `syscall(SYS_write, 1, "hello...", 20)`: `syscall()` wrapper puts `SYS_write=1` in `rax`, `1` in `rdi` (fd), buffer address in `rsi`, `20` in `rdx`. Executes `syscall` instruction. CPU: saves state, switches to Ring 0, jumps to syscall dispatch table. Kernel: looks up handler for syscall 1 (`sys_write`). `sys_write`: validates fd 1 (stdout), copies 20 bytes from user space to kernel output buffer, flushes to terminal. Returns 20. CPU: restores user state, Ring 3. `rax=20`.

### One sentence connecting to previous unit
Because every program must use system calls for anything meaningful, the kernel becomes the ultimate mediator, tracking all these isolated running programs as separate processes.

## Concept Unit: The process abstraction — what the kernel provides

### The Problem
If fifty different programs are running at once, how do they not corrupt each other's memory, and how do they all think they own the CPU? 

### Introduce the concept in isolation
```c
/* A process is the OS's abstraction of a running program. */
/* The kernel gives each process the ILLUSION of: */
/* - Its own CPU (time-sliced by the scheduler) */
/* - Its own private memory (virtual address space) */
/* - Its own file descriptors (isolated from other processes) */

/* Process state (from the kernel's perspective): */
/* - Running: currently executing on a CPU */
/* - Ready: could run, waiting for CPU */
/* - Blocked (sleeping): waiting for I/O, timer, or signal */
/* - Zombie: exited, parent hasn't called wait() yet */

#include <stdio.h>
#include <unistd.h>

int main(void) {
    /* Show process info from /proc: */
    pid_t pid = getpid();
    char path[64];

    /* /proc/PID/status: process state, memory, etc. */
    snprintf(path, sizeof(path), "/proc/%d/status", pid);
    FILE *f = fopen(path, "r");
    if (f) {
        char line[128];
        int lines = 0;
        while (fgets(line, sizeof(line), f) && lines < 8) {
            printf("%s", line);
            lines++;
        }
        fclose(f);
    }
    /* Output (first 8 lines of /proc/PID/status): */
    /* Name: prog */
    /* Umask: 0022 */
    /* State: R (running) */
    /* Tgid: 12345 */
    /* Ngid: 0 */
    /* Pid: 12345 */
    /* PPid: 12300 */
    /* TracerPid: 0 */
    return 0;
}
```
This output proves that the kernel actively maintains detailed internal metadata about every running **Process**, tracking its state, identifiers, and resource usage, which it exposes through the virtual `/proc` filesystem.

### Discard the throwaway
This code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** None.
- **Change type:** None.
- **Location:** None.
- **Dependencies:** None.

### The New Code
```c
snprintf(path, sizeof(path), "/proc/%d/status", pid);
```

### The Updated Project
```c
1:     pid_t pid = getpid();
2:     char path[64];
3:     snprintf(path, sizeof(path), "/proc/%d/status", pid); // <- new
4:     FILE *f = fopen(path, "r");
```
We construct a string path pointing into the Linux `/proc` filesystem to interrogate the kernel about our own process's status.

### Mechanical walkthrough
- **`snprintf`**: A standard library function call to format a string safely.
- **`(`**: Opens the argument list.
- **`path`**: The destination character array.
- **`,`**: Separates arguments.
- **`sizeof(path)`**: An operator evaluating to the total size in bytes of the `path` array, ensuring we don't write past its bounds.
- **`,`**: Separates arguments.
- **`"/proc/%d/status"`**: The format string literal. `%d` is a placeholder for a decimal integer.
- **`,`**: Separates arguments.
- **`pid`**: The integer variable holding our Process ID, which will replace the `%d` placeholder.
- **`)`**: Closes the argument list.
- **`;`**: Terminates the statement.

### CS lens
The fundamental CS concept is Virtualization/Abstraction. The OS provides each process with a "virtual machine" consisting of virtual memory and a virtual CPU. This pattern appears in containerization (Docker), virtual memory pagers, and hardware virtualization (Hyper-V).

### SE lens
A design principle here is Everything is a File. Unix-like systems expose kernel state (like process metadata in `/proc`) using the exact same filesystem APIs (`open`, `read`) used for reading text documents. The alternative would be creating hundreds of bespoke system calls for every tiny piece of OS information, which would bloat the kernel ABI.

### Commands needed
`/proc` (browsing the procfs via cat or shell).

### Run it
Trace: `fopen("/proc/12345/status",...)`: the `/proc` filesystem is a VIRTUAL filesystem -- there are no actual files on disk. The kernel generates the text content dynamically on demand when you read it. `fgets` reads kernel-generated text describing the process state. State: R (running) means this process is currently executing. State: S (sleeping) would mean blocked on a syscall.

### One sentence connecting to previous unit
To maintain the illusion that dozens of processes are running simultaneously, the kernel must constantly pause one process and switch to another.

## Concept Unit: Context switching — how the kernel multiplexes the CPU

### The Problem
If a process is running on the CPU, and its time slice expires, how exactly does the OS take the CPU away and give it to someone else without losing the first program's progress?

### Introduce the concept in isolation
```c
/* Context switch: saving one process's state, restoring another's */
/* Trigger: timer interrupt (preemptive) or blocking syscall (voluntary) */

/* What the kernel saves/restores: */
/* - All 16 general-purpose registers (rax, rbx, ..., r15) */
/* - %rip (instruction pointer: where to resume) */
/* - %rsp (stack pointer: which stack to use) */
/* - %rflags (condition codes) */
/* - FPU/SSE/AVX state (optional: lazy save) */
/* - cr3 (page table base: switches virtual address space) */

/* Context switch cost: ~1-10 microseconds */
/* Breakdown: */
/* - Save/restore registers: ~100 ns */
/* - Switch page tables (cr3 write): ~100 ns + TLB flush */
/* - Cache warming (new process data not in cache): 1-5 us */

#include <stdio.h>
#include <unistd.h>
#include <time.h>

int main(void) {
    /* Voluntary context switch: blocking syscall */
    struct timespec req = {0, 1};  /* sleep 1 nanosecond */
    struct timespec t0, t1;

    clock_gettime(CLOCK_MONOTONIC, &t0);
    nanosleep(&req, NULL);  /* blocks: kernel switches to another process */
    clock_gettime(CLOCK_MONOTONIC, &t1);

    long actual_ns = (t1.tv_sec-t0.tv_sec)*1000000000L
                   + (t1.tv_nsec-t0.tv_nsec);
    printf("Requested 1ns sleep, actual: %ld ns\n", actual_ns);
    /* Typically 50,000-100,000 ns (50-100 us): */
    /* Overhead = scheduler latency + context switch cost */
    return 0;
}
/* Output:
   Requested 1ns sleep, actual: 54231 ns */
/* The 54us overhead is the cost of two context switches */
/* (this process -> idle/other -> this process) */
```
This output proves that a **Context Switch** is not instantaneous. By requesting an impossible 1-nanosecond sleep, we force the kernel to take the CPU away from our process and then give it back, allowing us to measure the actual time it takes to swap process states.

### Discard the throwaway
This code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** None.
- **Change type:** None.
- **Location:** None.
- **Dependencies:** None.

### The New Code
```c
nanosleep(&req, NULL);
```

### The Updated Project
```c
1:     struct timespec req = {0, 1}; 
2:     struct timespec t0, t1;
3:     clock_gettime(CLOCK_MONOTONIC, &t0);
4:     nanosleep(&req, NULL);  // <- new
5:     clock_gettime(CLOCK_MONOTONIC, &t1);
```
We intentionally block our own process by making a system call that sleeps, ensuring the kernel scheduler gets invoked to perform a context switch.

### Mechanical walkthrough
- **`nanosleep`**: A standard library function call that suspends execution.
- **`(`**: Opens the argument list.
- **`&`**: The address-of operator. It takes the memory address of the following variable.
- **`req`**: The `timespec` struct containing the requested sleep duration.
- **`,`**: Separates arguments.
- **`NULL`**: A macro representing a null pointer, indicating we do not need the remaining un-slept time if interrupted.
- **`)`**: Closes the argument list.
- **`;`**: Terminates the statement.

### CS lens
The fundamental CS concept is State Multiplexing. A context switch pauses a state machine (the CPU executing a program), stores its exact state into memory, and loads a different state. This allows a limited resource (one CPU core) to be shared across many consumers.

### SE lens
A design principle here is Overhead vs. Responsiveness. The scheduler could let programs run for 1 whole second before switching, reducing context switch overhead. But the system would feel laggy. By switching every few milliseconds, the OS sacrifices raw throughput (wasting time swapping registers and flushing caches) to buy low latency (responsiveness). 

### Commands needed
None for this unit.

### Run it
Trace `nanosleep(&req, NULL)`: `write(CLOCK_NANOSLEEP, ...)` syscall. Kernel: marks process as SLEEPING. Removes from run queue. Scheduler picks another process to run. Timer interrupt fires: scheduler checks sleeping processes. After ~1ms (default timer resolution), our process is eligible. Scheduler places it on run queue. CPU executes our process: restores registers, resumes after syscall. Elapsed: 54us >> 1ns.

### One sentence connecting to previous unit
The kernel handles exceptions, fields system calls, and swaps out processes thousands of times a second to keep the system alive.

## Closing

### Connect the pieces
Trace a `printf("hello")` call through ALL concept units from user space to kernel and back:
When your **process** (Unit 4) in **Ring 3 / User Mode** (Unit 1) executes `printf`, the C library formats the string and eventually calls the `write` wrapper. The wrapper places the syscall number and arguments into registers and executes a hardware trap instruction, triggering an intentional **Exception** (Unit 2). The CPU immediately transitions to **Ring 0 / Kernel Mode** (Unit 1), saving your user state and jumping to the kernel's **System Call** handler (Unit 3). The kernel validates the file descriptor and writes "hello" to the terminal buffer. If writing to a disk instead of a terminal took a long time, the kernel might put your process to sleep and execute a **Context Switch** (Unit 5) to run another program while waiting. Once the write finishes, the CPU restores your registers and drops back down to Ring 3, resuming execution exactly where it left off, as if nothing happened. The OS is software running in Ring 0 that gains control via hardware exceptions. Lesson 20 covers processes — fork, exec, and wait. One sentence: every privilege boundary crossing — file I/O, network, memory allocation, process creation — is a hardware trap from Ring 3 to Ring 0, and the OS kernel is the only code that runs in Ring 0.
