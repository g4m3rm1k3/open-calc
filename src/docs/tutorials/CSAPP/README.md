# Computer Systems: A Programmer's Perspective

A 48-lesson series based on Bryant & O'Hallaron's *CS:APP*. This series answers
the question every programmer eventually asks: **what is actually happening when
my code runs?**

It does this by peeling back abstraction layers — from C source to binary to OS
process to electrons — and showing exactly how each layer works.

**Language:** C · **Assembly:** x86-64 (AT&T syntax, read-only) · **Runtime:** conceptual — no execution required

---

## Modules

| Module | Lessons | Topic |
|--------|---------|-------|
| 0 — The Machine | 0–4 | Tour, C basics, bits, integers, floating point |
| 1 — From C to Machine | 5–12 | Compilation pipeline, x86-64, stack, pointers, buffer overflows |
| 2 — The Memory Hierarchy | 13–18 | Storage technologies, locality, caches, optimization |
| 3 — The Operating System | 19–27 | Processes, signals, virtual memory, malloc, linking |
| 4 — System-Level I/O | 28–33 | Unix I/O, stdio, exec, pipes, sockets, robust I/O |
| 5 — Concurrency | 34–39 | Threads, race conditions, mutexes, semaphores, deadlock |
| 6 — Capstone | 40–47 | Performance, security, shell, malloc, web server, retrospective |

---

## Lesson Index

### Module 0 — The Machine

| # | Title |
|---|-------|
| 00 | A Tour of Computer Systems |
| 01 | C Fundamentals — Variables, Types, and Compilation |
| 02 | Bits, Bytes, and Binary Representation |
| 03 | Integers — Two's Complement, Overflow, and Unsigned |
| 04 | Floating Point — IEEE 754 and Precision Traps |

### Module 1 — From C to Machine

| # | Title |
|---|-------|
| 05 | The Compilation Pipeline — Preprocessor, Compiler, Assembler, Linker |
| 06 | x86-64 Assembly — Registers, mov, and Arithmetic |
| 07 | Control Flow in Assembly — Branches, Loops, and EFLAGS |
| 08 | Procedures — The Call Stack, Stack Frames, and Calling Conventions |
| 09 | Arrays and Structs in Memory |
| 10 | Pointers and Memory in Depth |
| 11 | Buffer Overflows — How They Work and How They're Exploited |
| 12 | Reading Compiler Output — gcc -O2 and What It Does |

### Module 2 — The Memory Hierarchy

| # | Title |
|---|-------|
| 13 | Storage Technologies — SRAM, DRAM, Disk, and SSD |
| 14 | Locality — Temporal and Spatial |
| 15 | Cache Organization — Direct-Mapped, Set-Associative, Fully-Associative |
| 16 | Cache Performance — Miss Penalties and Writing to Cache |
| 17 | Optimizing for Cache — Loop Ordering and Tiling |
| 18 | The Memory Mountain and Program Performance |

### Module 3 — The Operating System

| # | Title |
|---|-------|
| 19 | What the Operating System Does — Abstraction, Isolation, Multiplexing |
| 20 | Processes — fork, exec, wait, and the Process Model |
| 21 | Exceptional Control Flow — Interrupts, Traps, Faults, and Aborts |
| 22 | Signals — Sending, Handling, and the Rules |
| 23 | Virtual Memory — Address Spaces and Pages |
| 24 | Address Translation — Page Tables, TLBs, and Multi-Level Paging |
| 25 | Dynamic Memory Allocation — malloc, free, and Fragmentation |
| 26 | Implementing malloc — Implicit Free Lists and Coalescing |
| 27 | Linking — Symbol Resolution, Relocation, and Shared Libraries |

### Module 4 — System-Level I/O

| # | Title |
|---|-------|
| 28 | Unix I/O — File Descriptors, open, read, write, close |
| 29 | Standard I/O — FILE*, Buffering, and fprintf |
| 30 | Processes and Programs — exec, Environment, and /proc |
| 31 | Inter-Process Communication — Pipes, FIFOs, and Redirections |
| 32 | Sockets and Network Programming Basics |
| 33 | Robust I/O — Short Counts, EINTR, and the Rio Package |

### Module 5 — Concurrency

| # | Title |
|---|-------|
| 34 | Concurrent Programming — Processes, I/O Multiplexing, and Threads |
| 35 | POSIX Threads — pthreads, Creating and Joining |
| 36 | Shared Variables and Race Conditions |
| 37 | Synchronization — Mutexes and Condition Variables |
| 38 | Semaphores — Dijkstra's sem_wait and sem_post |
| 39 | Thread Safety and Deadlock |

### Module 6 — Capstone

| # | Title |
|---|-------|
| 40 | Optimizing Program Performance — Profiling and Bottlenecks |
| 41 | Advanced Optimization — Loop Unrolling and SIMD |
| 42 | Security — Exploits, Defenses, and Secure Coding |
| 43 | Capstone Part 1 — Building a Unix Shell in C |
| 44 | Capstone Part 2 — Implementing malloc |
| 45 | Capstone Part 3 — A Concurrent Web Server |
| 46 | The Virtual Machine — What C Hides from You |
| 47 | Series Retrospective — From Source to Silicon |
