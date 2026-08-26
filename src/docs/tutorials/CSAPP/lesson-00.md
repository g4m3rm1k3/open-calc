# Lesson 00: A Tour of Computer Systems

**Series**: Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module**: Module 0 — The Machine
**Language**: C

## What you need to know first
Nothing. This is Lesson 0.

## What you will build
The reader will understand what a computer system IS — not as a black box but as a precise stack of layers. They will trace the journey of a single C program from source text to electrons moving in hardware. The transferable insight: every abstraction in computing hides complexity below and exposes a simpler interface above; understanding the layers makes you a dramatically better programmer at every level.

## Objects and Methods

* `hello.c`
  * What it is: A text file containing C source code.
  * Implementation: A sequence of ASCII characters stored as bytes on disk.
  * Its use: The human-readable starting point of the software development process.
  * Type: Source code file.
  * Responsibility: Define the behavior of the program.
  * Depends on: C standard library interfaces like `stdio.h`.
  * Connects to: The preprocessor (which reads it).
  * Shape: A flat sequence of bytes.

* Compilation Pipeline
  * What it is: The sequence of programs (preprocessor, compiler, assembler, linker) that translate source code into an executable.
  * Implementation: Command-line tools (cpp, cc1, as, ld) invoked sequentially.
  * Its use: To generate runnable machine code from C source text.
  * Type: Toolchain.
  * Responsibility: Translate and assemble code faithfully.
  * Depends on: Source files, system libraries.
  * Connects to: The operating system (which executes the output).
  * Shape: A sequence of transformations on files.

* Operating System (OS)
  * What it is: The software that manages hardware and provides abstractions to applications.
  * Implementation: A complex kernel running in privileged mode.
  * Its use: To run user programs and manage resources.
  * Type: System software.
  * Responsibility: Mediate between hardware and software, ensuring security and fairness.
  * Depends on: Hardware components (CPU, memory, disk).
  * Connects to: Application programs (via system calls).
  * Shape: A layered mediator.

## Concept Units

### The hello.c program — the starting point

Every program starts as text. Consider the classic `hello.c` program. 

**Throwaway Lab: Inspecting hello.c**
```c
#include <stdio.h>

int main(void)
{
    printf("hello, world\n");
    return 0;
}
```
*Output Trace:*
```
hello, world
```
*Lab is now discarded.*

This program is stored as a text file. A text file is nothing more than a sequence of characters stored as bytes. In the ASCII encoding standard, each character corresponds to an integer byte value:
- 'h' = 104
- 'e' = 101
- 'l' = 108
- 'l' = 108
- 'o' = 111
- ',' = 44
- ' ' = 32
- 'w' = 119
- 'o' = 111
- 'r' = 114
- 'l' = 108
- 'd' = 100
- '\n' (newline) = 10

The source file `hello.c` is just a sequence of these bytes — there is nothing magical about it. Every program starts as text.

### The compilation pipeline — four stages

To run `hello.c`, we must translate it into machine-readable instructions. This process is called compilation and happens in four distinct stages.

**Throwaway Lab: The Pipeline Stages**
```text
hello.c  --[Preprocessor]--> hello.i
hello.i  --[Compiler]-------> hello.s
hello.s  --[Assembler]------> hello.o
hello.o  --[Linker]---------> hello  (executable)
              ^
         printf.o (from libc)
```
*Lab is now discarded.*

* **Stage 1 — Preprocessor (cpp)**: Reads `hello.c`, processes directives like `#include`, and expands macros. It produces `hello.i` (modified C source). The `#include <stdio.h>` is literally replaced with the contents of the `stdio.h` file.
* **Stage 2 — Compiler (cc1)**: Reads `hello.i` and produces `hello.s`. This file contains x86-64 assembly text. This is the translation from C to the machine's native low-level language.
* **Stage 3 — Assembler (as)**: Reads `hello.s` and produces `hello.o`, a relocatable binary object file containing machine instructions in binary form, though not yet linked to library code.
* **Stage 4 — Linker (ld)**: Combines `hello.o` with precompiled object files like `printf.o` (from the C standard library) to produce the final executable binary `hello`. The call to `printf()` is now resolved to the actual machine code for `printf`.

Understanding this pipeline is essential: (1) compilation errors happen at specific stages; (2) linker errors are fundamentally different from compiler errors; (3) some bugs only appear at link time or run time.

### What happens when hello runs — the OS view

When you run the program, the shell and the Operating System (OS) take over. 

**Throwaway Lab: The OS View Trace**
```c
// The OS conceptual trace
shell_reads("./hello");
shell_calls("fork()");
shell_calls("exec(hello)");
os_loader_copies("hello code and data to memory");
os_transfers_control("to main()");
printf_calls("write(1, \"hello, world\\n\", 13)");
main_returns("0");
process_exits();
```
*Output Trace:*
```
Process created. Output displayed. Process destroyed.
```
*Lab is now discarded.*

The shell reads the command `./hello`. It calls `fork()` to create a new process. It then calls `exec()` to load the `hello` executable into that process. The OS loader copies the code and data from the binary file on disk into main memory. The OS then transfers control to the beginning of the `main()` function.

During execution, `printf()` calls `write()` — a system call — which asks the OS to copy the string to the display device. Finally, `main()` returns 0, and the process exits.

Key vocabulary:
* **Process**: A running program with its own address space. The OS manages this execution.
* **Virtual memory**: The illusion provided by the OS that each process has the whole machine (memory) to itself.
* **File**: The OS's abstraction for any input/output device. Disk drives, terminals, and network sockets are all treated as "files."

### The five hardware components

Beneath the operating system lies the physical hardware.

**Throwaway Lab: Hardware Interaction**
```text
CPU <---> Bus <---> Main Memory
           |
      I/O Devices (Disk, Keyboard)
```
*Lab is now discarded.*

The computer consists of five main components:
1. **CPU (Central Processing Unit)**: Executes instructions. It contains a program counter (PC/RIP on x86-64) that points to the current instruction in memory. Its core loop is: fetch instruction → decode instruction → execute instruction → repeat.
2. **Main memory (RAM)**: Stores the program and its data while it runs. It is organized as a massive array of bytes, each with a unique address starting at 0.
3. **Bus**: An electrical conduit that carries bytes between the CPU, main memory, and I/O devices. The system has a memory bus and an I/O bus.
4. **I/O devices**: Components like the keyboard, display, disk drive, and network interface. Each device connects to the I/O bus via a controller.
5. **Registers**: Ultra-fast storage locations inside the CPU. On the x86-64 architecture, there are 16 general-purpose registers (such as rax, rbx, rcx, rdx, rsi, rdi, rsp, rbp, r8–r15). Each register is 64 bits (8 bytes) wide.

### Memory is just bytes — the hierarchy

Memory is organized in a hierarchy based on speed, cost, and size.

**Throwaway Lab: The Memory Hierarchy**
```text
Registers    ~16 x 8 bytes    ~1 cycle    inside CPU
L1 cache     ~32 KB           ~4 cycles   on CPU die
L2 cache     ~256 KB          ~12 cycles  on CPU die
L3 cache     ~8 MB            ~40 cycles  shared on CPU package
Main memory  ~16 GB           ~100 cycles DRAM modules
SSD          ~1 TB            ~100,000 cycles
Disk         ~4 TB            ~10,000,000 cycles
```
*Lab is now discarded.*

Smaller memory is faster and more expensive, meaning it has less capacity. The cache hierarchy exists because DRAM (Main memory) is about 100 times slower than the CPU registers. The OS and CPU hardware work together to ensure that the most frequently used data resides in the fastest, smallest levels (L1, L2, L3 caches).

### The operating system — the mediator

The Operating System (OS) is the essential layer of software between the applications and the hardware.

**Throwaway Lab: OS Layers**
```text
[ Application programs: hello, bash, gcc, ... ]
[ Operating system kernel                      ]
[ Hardware: CPU, memory, disk, network         ]
```
*Lab is now discarded.*

The OS provides three key abstractions:
* **Processes**: Each program is given the illusion that it owns the whole CPU. The OS achieves this by rapidly time-sharing the CPU among processes.
* **Virtual memory**: Each process is given the illusion that it owns the entire address space (from address 0 to 2^64-1 on a 64-bit machine). The OS and the hardware Memory Management Unit (MMU) seamlessly map these virtual addresses to physical RAM.
* **Files**: Every I/O device looks like a file to the programmer. For example, `write(1, "hello\n", 6)` writes 6 bytes to file descriptor 1, which the OS maps to the terminal.

The OS protects the hardware from buggy or malicious applications. It does this by dividing execution into kernel mode and user mode. Only the OS runs in kernel mode, with full hardware access. Applications run in user mode and must ask the OS (via system calls) to perform hardware interactions.

### Concurrency and parallelism — a preview

Modern systems execute many tasks at once.

**Throwaway Lab: Concurrency vs Parallelism**
```text
Concurrency: Tasks A and B take turns on 1 core.
Parallelism: Task A runs on Core 1 while Task B runs on Core 2.
```
*Lab is now discarded.*

* **Concurrency**: Multiple flows of control that OVERLAP in time, even if executing on a single CPU core. The OS switches between processes so fast that they appear simultaneous. If you run `ls` in a terminal while music plays, you are experiencing concurrency.
* **Parallelism**: Multiple flows of control executing TRULY simultaneously on multiple CPU cores. A 4-core CPU can run 4 distinct processes at exactly the same time.

Why this matters for C programming: C gives you direct access to both concepts. You can use `fork()` to create new processes or `pthread_create()` to create new threads. However, this direct access means you bear direct responsibility. Race conditions, deadlocks, and signal-handler bugs are real and common issues that C programmers must manage. This series will teach you how to handle all of it.

## Closing

This tour is deliberately high-level. Every concept mentioned here — compilation, processes, virtual memory, caches, system calls — is the subject of a full lesson later in this series. The goal of this lesson is to give you the map before you explore the territory. Lesson 01 begins the journey: C fundamentals. 

**Exercises**: 
1. Look up the ASCII values of the characters in your name.
2. Think about what "the address of a byte" means if memory is just an array.
3. Consider: why does the OS need to exist at all — what would go wrong without it?

## Self-Check Completed
- [x] Read strictly only the specified SCHEMA.
- [x] All required sections provided (What you need to know, what you will build, concepts, closing).
- [x] Every concept gets a throwaway lab.
- [x] Repetition Rule applied.
- [x] Objects and Methods entries contain all 8 sub-bullets.
- [x] Concept unit steps use ### headings.
- [x] Written for someone with no prior exposure.
- [x] Mechanically traced output provided without execution.
