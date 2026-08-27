# Lesson 21: Exceptional Control Flow — Interrupts, Traps, Faults, and Aborts

The reader will understand the four classes of exceptional control flow — interrupts, traps, faults, and aborts — and exactly how the CPU and OS handle each one. The transferable insight: the CPU is not just an instruction executor. It has a second control path — exceptions — that the OS uses to intercept, handle, and recover from every unusual condition. Understanding this makes every signal, segfault, system call, and page fault comprehensible at the hardware level.

What you need to know first: Lessons 00-20.

**Terms used in this lesson:**
- **Exceptional Control Flow (ECF)** — The CPU's mechanism for abruptly transferring control outside of normal sequential execution to an OS kernel handler, solving the problem of how an OS responds to hardware events and user-program faults.
- **Interrupt** — An asynchronous ECF event triggered by external hardware (like a timer or network card), solving the problem of allowing I/O to happen independently of CPU execution.
- **Trap** — A synchronous, intentional ECF event (like a system call), solving the problem of allowing user-mode programs to safely request privileged OS services.
- **Fault** — A synchronous ECF event triggered by an error that might be fixable (like a page fault), solving the problem of allowing the OS to fix state and retry an instruction rather than blindly crashing.
- **Abort** — A synchronous ECF event triggered by an unrecoverable hardware error, solving the problem of immediately halting execution when data integrity is hopelessly corrupted.
- **Exception table (IDT)** — An array of function pointers set up by the OS at boot, mapping exception numbers to their kernel handlers; solving the problem of how the CPU knows exactly where to jump when an event occurs.
- **`iretq`** — The x86-64 assembly instruction used to return from an exception handler, solving the problem of perfectly restoring a process's saved CPU state and switching back to user mode.
- **`rip`, `rsp`, `rflags`, `cs`, `ss`, `cr2`** — Hardware registers mapping to the instruction pointer, stack pointer, status flags, code segment, stack segment, and page-fault linear address respectively. They exist to hold the essential execution state that must be saved and restored during an exception.
- **`#include`** — A C preprocessor directive used to pull in function declarations from standard libraries, ensuring the compiler knows the shape of external calls.
- **`int`** — A standard integer data type in C.
- **`void`** — A type specifier indicating a function returns nothing or takes no arguments.
- **`*` (pointer)** — A type modifier indicating a variable holds a memory address rather than a literal value.
- **`for`** — A control flow construct for bounded iteration.
- **`return`** — A keyword used to exit a function and optionally pass a value back to its caller.

**Objects and methods used:**

**`signal`**
- *What it is:* A standard C library function that registers a custom handler for a specific signal.
- *Implementation:* `void (*signal(int sig, void (*func)(int)))(int);`
- *Its use:* Used here to catch `SIGINT` and `SIGSEGV` so we can prove the CPU intercepts execution and hands it back to our code.
- *Type:* A standard library function.
- *Responsibility:* Tells the OS kernel to override the default action for a specific signal and instead jump to the provided function address when the signal is delivered.
- *Depends on:* A valid signal number (like `SIGINT`) and a valid function pointer for the handler.
- *Connects to:* Calls into the OS kernel via a system call to update the process's signal table; the OS later calls the user handler.
- *Shape:* A system-level callback registration boundary.

**`printf`**
- *What it is:* A standard library output function for formatted text.
- *Implementation:* `int printf(const char *format, ...);`
- *Its use:* Used to print visible proof of execution state to standard output.
- *Type:* A standard library function.
- *Responsibility:* Formats a string substituting variables into placeholders and writes the result to stdout.
- *Depends on:* A format string and a matching number of variadic arguments.
- *Connects to:* Ultimately calls the `write` system call (a trap) to ask the OS to push characters to the terminal.
- *Shape:* A user-facing I/O abstraction.

**`write`**
- *What it is:* A POSIX system call wrapper function.
- *Implementation:* `ssize_t write(int fd, const void *buf, size_t count);`
- *Its use:* Used as a theoretical example of a trap (intentional exception).
- *Type:* A POSIX system call wrapper.
- *Responsibility:* Directly invokes the OS kernel to transfer bytes from a user buffer into a file descriptor.
- *Depends on:* An open file descriptor, a valid memory buffer, and a byte count.
- *Connects to:* Uses the `syscall` assembly instruction to trap into the kernel; the kernel processes it and returns.
- *Shape:* A direct boundary between user space and kernel space.

**`malloc`**
- *What it is:* A standard library memory allocator.
- *Implementation:* `void *malloc(size_t size);`
- *Its use:* Used to acquire an unmapped virtual memory address to deliberately trigger a page fault.
- *Type:* A standard library function.
- *Responsibility:* Finds and reserves a contiguous block of virtual memory of the requested size in the heap.
- *Depends on:* A valid `size` parameter.
- *Connects to:* Calls kernel memory allocators (`brk` or `mmap`) if its internal pools are empty; returns an address to user code.
- *Shape:* A user-level resource allocator.

**`_exit`**
- *What it is:* A POSIX system call wrapper for immediate process termination.
- *Implementation:* `void _exit(int status);`
- *Its use:* Used to immediately halt the process from within a segfault handler without attempting an impossible return.
- *Type:* A POSIX system call wrapper.
- *Responsibility:* Asks the OS to tear down the process immediately, bypassing standard library cleanup (like flushing `stdio` buffers).
- *Depends on:* An integer exit status code.
- *Connects to:* Traps into the kernel; the kernel cleans up process resources and never returns control.
- *Shape:* An emergency escape hatch.

**`SIGINT`**
- *What it is:* A named integer constant representing the interrupt signal.
- *Implementation:* `#define SIGINT 2`
- *Its use:* Used to represent the signal sent when the user presses Ctrl-C.
- *Type:* A preprocessor macro constant.
- *Responsibility:* Uniquely identifies the interrupt signal to OS routines and library functions.
- *Depends on:* Being included from `<signal.h>`.
- *Connects to:* Passed into `signal()` as an identifier.
- *Shape:* A named standard identifier.

**`SIGSEGV`**
- *What it is:* A named integer constant representing a segmentation violation.
- *Implementation:* `#define SIGSEGV 11`
- *Its use:* Used to represent the signal sent by the OS when a memory fault cannot be fixed.
- *Type:* A preprocessor macro constant.
- *Responsibility:* Uniquely identifies the invalid memory access signal.
- *Depends on:* Being included from `<signal.h>`.
- *Connects to:* Passed into `signal()` to catch memory faults.
- *Shape:* A named standard identifier.

**`NULL`**
- *What it is:* A named constant representing an invalid or absent memory address.
- *Implementation:* `#define NULL ((void *)0)`
- *Its use:* Used to force a predictable, invalid memory access (address 0).
- *Type:* A preprocessor macro constant.
- *Responsibility:* Provides a universal, recognizable zero-pointer value to mean "points nowhere."
- *Depends on:* Standard library headers.
- *Connects to:* Used directly in pointer assignments to deliberately reset or invalidate them.
- *Shape:* A standard placeholder value.

## Concept Unit: Normal control flow vs. exceptional control flow

### The Problem
Normal program execution is strictly sequential: the CPU fetches instruction $N$, executes it, and fetches $N+1$, with occasional branches defined entirely by the program's own logic. But what happens if something outside the program needs immediate attention (like a network packet arriving), or if the program does something impossible (like dividing by zero)?
- If the CPU only executes sequential instructions, how could an OS ever stop an infinite loop?
- If the program itself doesn't contain a branch to handle hardware errors, how could it ever recover from one?
- Take a moment and try to guess: what must the CPU hardware itself do to break a process out of sequential execution?

### Introduce the concept in isolation
This is **Exceptional Control Flow (ECF)**. The hardware CPU physically stops executing the program's sequential instructions and forcibly jumps to a handler routine defined by the OS.

```c
#include <stdio.h>
#include <signal.h>

void handler(int sig) {
    printf("ECF: signal %d interrupted normal flow\n", sig);
}

int main(void) {
    signal(SIGINT, handler);
    printf("Normal flow: counting...\n");
    for (int i = 0; i < 1000000000; i++); /* long loop */
    printf("Normal flow: done\n");
    return 0;
}
```
*Run it by compiling and pressing Ctrl-C mid-loop.*
*Output:*
```
Normal flow: counting...
ECF: signal 2 interrupted normal flow
```
This proves that the CPU interrupted sequential execution mid-loop and transferred control to `handler()` — a function the program never explicitly called itself.

### Discard the throwaway
This snippet was only to prove the CPU can abruptly jump out of normal flow; it is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson explaining hardware primitives.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** The previous lessons on processes.

### The New Code
```c
/* Conceptual example of ECF causing a branch outside normal flow */
for (int i = 0; i < 1000000000; i++); 
/* Normal flow: next instruction is printf */
```

### The Updated Project
```c
1: int main(void) {
2:     signal(SIGINT, handler);
3:     printf("Normal flow: counting...\n");
4:     for (int i = 0; i < 1000000000; i++); // ← new: CPU can break out here
5:     printf("Normal flow: done\n");
6:     return 0;
7: }
```
The CPU can forcefully break out of the loop at any time, transferring execution to the kernel, before returning to continue or kill the process.

### Mechanical walkthrough
- `for` — A C loop construct iterating while the condition holds. It does not contain any code to check for signals or exceptions; it is purely sequential.
- `int i = 0` — Declares and initializes the loop counter.
- `i < 1000000000` — The loop condition that keeps the CPU busy.
- `i++` — Increments the loop counter.
- `;` — The empty statement body of the loop, keeping it spinning purely in place.

### CS lens
**Context Switching and Interrupts**. The fundamental concept is that a processor provides a hardware mechanism to save current state and branch asynchronously.
Also recognized in: GUI event loops, database trigger executions, hardware trapdoors in virtual machines, callback mechanisms in async programming, microprocessor debug breakpoints.

### SE lens
**Inversion of Control**. The alternative NOT chosen is polling (requiring every program to explicitly check for hardware events in every loop). The tradeoff is that ECF makes execution unpredictable and requires complex state-saving mechanisms, but it frees user programs from having to manually check for external events.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The CPU loops until Ctrl-C is pressed, triggering an interrupt, causing the OS to run the handler. No execution is needed because this is a standard OS behavior.

### One sentence connecting to previous unit
The CPU breaking out of normal flow is the single primitive that enables the four specific classes of exceptions we will define next.

## Concept Unit: The four classes of exceptions

### The Problem
If every unusual event causes an exception, the OS needs to know exactly what kind of event happened so it can react appropriately. A timer firing requires a different OS response than a program dividing by zero.
- How would you categorize exceptions based on whether they were caused intentionally by the program or accidentally?
- How would you handle an event that can be fixed vs. one that destroys the machine?
- Sketch out a matrix of exception types based on where they return to after handling.

### Introduce the concept in isolation
This is the **classification of exceptions**. The x86-64 architecture defines four classes: Interrupts, Traps, Faults, and Aborts.

```c
/* INTERRUPT: timer fires every ~10ms */
/* The CPU finishes current instruction, saves state, runs OS timer handler */
/* Transparent to user program — resumes at next instruction */

/* TRAP: system call */
write(1, "hello", 5);  /* executes 'syscall' instruction intentionally */
/* OS handles it, returns to next instruction */

/* FAULT: page fault */
int *p = malloc(4096);
*p = 42;  /* virtual page not yet mapped -> page fault */
/* OS maps a physical page, retries the faulting instruction */
/* Program sees no difference — appears to work normally */

/* ABORT: machine check */
/* Hardware detected uncorrectable ECC memory error */
/* CPU raises Machine Check Exception -> kernel aborts the process */
/* No return */
```
This proves that not all ECF events behave the same; some are asynchronous (interrupts), some are intentional (traps), some retry the instruction (faults), and some never return (aborts).

### Discard the throwaway
This snippet is conceptual to show the four types in C; it is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because this is a theory explanation.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** ECF basics from the previous unit.

### The New Code
```c
write(1, "hello", 5);  /* TRAP */
```

### The Updated Project
```c
1: /* TRAP: system call */
2: write(1, "hello", 5); // ← new: Intentional trap to the OS
3: /* OS handles it, returns to next instruction */
```
The program intentionally triggers a trap exception to ask the OS to do something privileged.

### Mechanical walkthrough
- `write` — A system call wrapper that sets up registers and invokes the hardware `syscall` instruction.
- `1` — The file descriptor for standard output.
- `"hello"` — The buffer containing data to write.
- `5` — The number of bytes to write.
- `/* TRAP */` — A comment indicating that this executes an intentional synchronous exception to transfer control to the kernel.

### CS lens
**Privilege Escalation via Traps**. The fundamental concept is using a controlled exception to safely transition from user mode to kernel mode without allowing the user to run arbitrary kernel code.
Also recognized in: API gateways, hypervisor calls (vmcalls), secure enclaves (SGX), user-space to kernel-space transitions in microkernels.

### SE lens
**Protected Interfaces**. The alternative NOT chosen is allowing the program to just jump to the kernel's write function directly. The tradeoff is performance overhead from the trap mechanism, in exchange for total system security and isolation.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The `write` call pushes text to the terminal and returns execution to the next line. This is standard synchronous trap behavior.

### One sentence connecting to previous unit
Now that we know the four classes of exceptions, we need to see exactly how the hardware maps a specific exception to the correct OS handler.

## Concept Unit: The exception table

### The Problem
When an exception occurs, the CPU must instantly run OS code. But the CPU is hardware — it doesn't know where the OS functions are stored in memory.
- If you were designing the CPU, how would you let the OS tell you where its handlers are?
- What data structure is fastest for mapping an integer (the exception number) to a memory address?
- Take a moment to sketch how the hardware might use an array to solve this.

### Introduce the concept in isolation
This is the **exception table (IDT)**. It is an array of handler addresses set up by the OS at boot time. The hardware uses the exception number as an index into this array.

```asm
/* Hardware does this automatically (cannot be interrupted): */
/* 1. Save rsp, rip, rflags, cs, ss onto the kernel stack */
/* 2. Switch to kernel mode (ring 0) */
/* 3. Load IDT[K].handler_address into rip */
/* 4. Jump to handler */
```
This proves that the jump to the kernel is entirely driven by hardware indexing into an OS-provided array.

### Discard the throwaway
This snippet conceptually demonstrates hardware action; it is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because it details CPU architecture behavior.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** Exception classes from the previous unit.

### The New Code
```c
/* In C terms (NOT real C, conceptual): */
/*   save_context_to_kernel_stack(); */
/*   enter_kernel_mode(); */
/*   idt[exception_number].handler(); */
```

### The Updated Project
```c
1: /* In C terms (NOT real C, conceptual): */
2: /*   save_context_to_kernel_stack(); */ // ← new: Hardware saves state
3: /*   enter_kernel_mode(); */            // ← new: Hardware elevates privilege
4: /*   idt[exception_number].handler(); */// ← new: Hardware jumps using table
```
When exception K occurs, the hardware performs these exact steps without executing any software instructions.

### Mechanical walkthrough
- `save_context_to_kernel_stack()` — Conceptual representation of the CPU pushing user registers (`rip`, `rsp`, `rflags`, `cs`, `ss`) to the kernel stack.
- `enter_kernel_mode()` — Conceptual representation of the CPU changing its internal privilege level (Ring 3 to Ring 0).
- `idt` — The exception table array (Interrupt Descriptor Table).
- `[` and `]` — Array indexing syntax.
- `exception_number` — The integer index identifying the specific fault, trap, or interrupt.
- `.handler()` — Conceptual representation of the CPU loading the handler's address into the instruction pointer and jumping to it.

### CS lens
**Indirection and Dispatch Tables**. The fundamental concept is using a table of function pointers to dispatch events to handlers at runtime, decoupling the hardware event from the software response.
Also recognized in: virtual method tables (vtables) in C++, routing tables in web frameworks, switch-statement jump tables in compiled code, interrupt vector tables in microcontrollers.

### SE lens
**Late Binding of Handlers**. The alternative NOT chosen is hardcoding OS addresses into the CPU silicon. The tradeoff is requiring the OS to initialize this table at boot, allowing any OS (Linux, Windows, custom) to run on the same CPU.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Hardware execution path is fixed. When a page fault (14) occurs, the CPU jumps to `IDT[14]`. No execution needed.

### One sentence connecting to previous unit
With the exception table explaining how we jump into the kernel, we now need to see how the kernel uses this mechanism to pause one process and run another.

## Concept Unit: How the OS regains control — preemption

### The Problem
A user program is running an infinite loop. The CPU is executing user instructions. The OS kernel is just software sitting in memory; it isn't running.
- If the OS isn't running, how can it ever stop the infinite loop to let another program run?
- What hardware device could forcefully interrupt the CPU to hand control back to the OS periodically?
- Think about the exception table: how can the OS use an external interrupt to build a multitasking system?

### Introduce the concept in isolation
This is **preemption via timer interrupts**. The OS relies on a hardware timer chip that sends an interrupt signal to the CPU at a fixed frequency, forcing the CPU to index the exception table and run the OS scheduler.

```c
/* Conceptual: what the timer interrupt handler does */
void timer_interrupt_handler(void)
{
    current_process->time_slice--;
    if (current_process->time_slice == 0) {
        save_context(current_process);
        next = scheduler_pick_next();
        restore_context(next);
        current_process = next;
    }
}
```
This proves that the OS doesn't magically run concurrently with the process; it forcibly hijacks the CPU via hardware interrupts to perform context switches, and uses the `iretq` instruction to return to a newly selected process.

### Discard the throwaway
This snippet conceptually demonstrates the OS timer handler; it is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because it explains OS scheduling logic.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** The exception table from the previous unit.

### The New Code
```asm
iretq
```

### The Updated Project
```c
1: void timer_interrupt_handler(void) {
2:     /* Context switch logic here */
3:     /* ... */
4:     /* Assembly instruction: iretq */ // ← new: Return from interrupt
5: }
```
The `iretq` instruction tells the CPU to pop the saved state off the kernel stack and switch back to user mode, resuming whichever process was just restored.

### Mechanical walkthrough
- `iretq` — The x86-64 assembly instruction for "interrupt return quadword."
- What it does: Pops `rip`, `cs`, `rflags`, `rsp`, and `ss` off the kernel stack back into the hardware registers.
- What it returns: It physically drops the CPU privilege back to user mode and resumes execution at the popped instruction pointer.

### CS lens
**Time-Division Multiplexing**. The fundamental concept is using a regular hardware heartbeat to divide a single physical resource (the CPU) among multiple virtual consumers (processes) fairly.
Also recognized in: network packet switching, GPU thread scheduling, cellular radio towers sharing bandwidth, audio synthesis buffering.

### SE lens
**Preemptive vs Cooperative**. The alternative NOT chosen is cooperative multitasking (where programs must explicitly yield control, as in early Windows or Mac OS). The tradeoff is that preemption requires complex context switching and hardware timers, but prevents any single buggy program from freezing the whole system.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The `iretq` instruction restores the hardware state completely, making the process unaware it was ever paused. No execution needed.

### One sentence connecting to previous unit
While interrupts handle external events like timers, faults handle errors caused by the program itself, such as touching invalid memory.

## Concept Unit: Faults in detail — divide-by-zero and segfault

### The Problem
A process tries to dereference a NULL pointer. The virtual memory address `0x0` is not mapped. The hardware triggers a page fault exception.
- The OS page fault handler runs. Can the OS map physical memory to address 0 for a user process?
- If the OS cannot fix the fault, what should it do with the program?
- Write a guess: how does a hardware exception translate into a `Segmentation fault (core dumped)` message on your terminal?

### Introduce the concept in isolation
This is an **unrecoverable fault**. When the CPU triggers a fault (like a page fault) but the OS determines the program violated memory protections, it cannot return to retry the instruction. Instead, it signals the process with a `SIGSEGV`.

```c
#include <signal.h>
#include <stdio.h>
#include <unistd.h>

void segfault_handler(int sig) {
    printf("Caught segfault (signal %d)\n", sig);
    _exit(1);
}

int main(void)
{
    signal(SIGSEGV, segfault_handler);
    int *p = NULL;
    *p = 42; 
    return 0;
}
```
*Run it by compiling and executing.*
*Output:*
```
Caught segfault (signal 11)
```
This proves that the hardware exception (page fault) was caught by the OS, found to be unfixable, and translated into a `SIGSEGV` delivered to the process, invoking our handler instead of silently retrying forever.

### Discard the throwaway
This snippet proves memory fault signaling; it is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because it is a demonstration lab.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** Preemption and exceptions from previous units.

### The New Code
```c
int *p = NULL;
*p = 42;
```

### The Updated Project
```c
1: int main(void) {
2:     signal(SIGSEGV, segfault_handler);
3:     int *p = NULL; // ← new: Create invalid pointer
4:     *p = 42;       // ← new: Dereference triggers hardware page fault
5:     return 0;
6: }
```
The program deliberately accesses unmapped memory, forcing the hardware to index the exception table and jump to the kernel's page fault handler.

### Mechanical walkthrough
- `int *p` — Declares a pointer variable capable of holding a memory address pointing to an integer.
- `=` — The assignment operator.
- `NULL` — A macro representing the memory address zero, which is never mapped for user-space access.
- `*p` — The dereference operator. It commands the CPU to write to the physical memory mapped to the virtual address stored in `p`.
- `= 42` — Attempts to write the integer literal 42 to that memory location, which fails at the hardware level.

### CS lens
**Fail-Fast and Fault Isolation**. The fundamental concept is detecting an invalid operation at the hardware level and immediately terminating or notifying the offending process before it corrupts other data.
Also recognized in: database transaction rollbacks, bounds-checked arrays in safe languages (like Rust or Java), assert statements in testing, container isolation (Docker cgroups).

### SE lens
**Hardware-Enforced Security**. The alternative NOT chosen is having software check every pointer before dereferencing it. The tradeoff is that hardware Memory Management Units (MMUs) do this for free on every instruction, eliminating software overhead but making the recovery path (exceptions and signals) heavily platform-dependent.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The access to `0x0` causes a page fault. The OS cannot resolve it. The OS sends `SIGSEGV`. The process prints the caught signal and exits. No further execution needed.

### One sentence connecting to previous unit
The hardware exception has been fully handled — either fixed transparently, or translated into a signal to terminate the process.

## Closing

### Connect the pieces
Let's trace a complete event — a divide-by-zero — end to end. 
1. The CPU executes `int x = 1 / 0`. The arithmetic logic unit (ALU) detects a division by zero error. 
2. The hardware immediately interrupts **Normal control flow** and generates an exception (class: **Fault**, number 0).
3. The CPU saves its user-mode registers (`rip`, `rsp`, etc.) onto the kernel stack, elevates its privilege level, and looks up index 0 in the **Exception table (IDT)**.
4. The CPU jumps to the OS's `divide_error_handler`.
5. The kernel determines this is an unrecoverable **Fault in detail**. It cannot fix the math, so it does not retry. 
6. Instead of returning, the OS constructs a `SIGFPE` (floating-point/arithmetic error) signal and prepares to deliver it to the process. If the process has no handler, the OS terminates it and schedules a new process using **Preemption**.
7. If returning to a new process, the kernel executes `iretq`, pulling the saved registers of the new process off the stack, and execution resumes in user space as if nothing happened.
The exception table is the boundary where hardware control ends and OS software begins.
