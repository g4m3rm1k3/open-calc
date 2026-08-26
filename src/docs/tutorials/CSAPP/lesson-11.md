# Lesson 11: Buffer Overflows — How They Work and How They're Exploited

## Series: Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
## Module: Module 1 — From C to Machine
## Language: C and x86-64 assembly (AT&T syntax). Trace by hand.

### Prerequisites
What you need to know first: Lessons 00–10 (entire Module 0 and Lessons 06–10 of Module 1).

### What you will build
The reader will understand exactly how a buffer overflow works mechanically: how writing past the end of a stack buffer corrupts the return address, how an attacker crafts input to redirect execution to injected shellcode, and what the four modern defenses do to prevent it. The transferable insight: C gives you access to raw memory — the price is that you must enforce your own bounds. Every unchecked array write is a potential remote code execution vulnerability. Understanding the exploit is the only way to understand why the defenses work.

---

## Objects and Methods

* `gets()`
  * **What it is**: A standard library function in older C standards that reads characters from standard input.
  * **Implementation**: Reads from `stdin` until a newline character or EOF is encountered, storing the result in a provided memory buffer.
  * **Its use**: Used to read a line of text from the user.
  * **Type**: Function taking a `char*` and returning a `char*`.
  * **Responsibility**: To populate a buffer with user input.
  * **Depends on**: The `stdin` stream and a valid memory pointer.
  * **Connects to**: The stack or heap memory where the buffer resides.
  * **Shape**: A sequential writer of bytes.

* Buffer
  * **What it is**: A contiguous block of memory allocated to hold multiple instances of the same data type.
  * **Implementation**: Allocated on the stack via array declaration or on the heap via `malloc`.
  * **Its use**: Temporarily storing data while it is being processed.
  * **Type**: Array or pointer to a memory region.
  * **Responsibility**: Holding bytes exactly as they are written.
  * **Depends on**: The memory management subsystem of the process.
  * **Connects to**: Pointers that reference its starting address.
  * **Shape**: A linear array of fixed capacity.

* Stack Frame
  * **What it is**: A segment of the call stack dedicated to a single function invocation.
  * **Implementation**: Delimited by the base pointer (`rbp`) and stack pointer (`rsp`) registers.
  * **Its use**: Storing local variables, saved registers, and the return address.
  * **Type**: Execution context memory.
  * **Responsibility**: Maintaining the isolated state of a running function.
  * **Depends on**: CPU registers and the process's stack segment.
  * **Connects to**: The previous function's stack frame via the saved base pointer.
  * **Shape**: A LIFO (Last-In-First-Out) contiguous block.

* Return Address
  * **What it is**: The memory address of the instruction to execute after a function finishes.
  * **Implementation**: Pushed onto the stack by the `call` instruction.
  * **Its use**: Tells the CPU where to resume execution using the `ret` instruction.
  * **Type**: 64-bit integer representing an instruction pointer (`rip`).
  * **Responsibility**: Ensuring the control flow correctly returns to the caller.
  * **Depends on**: The integrity of the stack memory.
  * **Connects to**: The instruction stream in the text segment.
  * **Shape**: An 8-byte pointer on x86-64.

* Shellcode
  * **What it is**: A small piece of code used as the payload in the exploitation of a software vulnerability.
  * **Implementation**: Hand-crafted machine code, often starting a command shell (`/bin/sh`).
  * **Its use**: Giving an attacker control over a compromised system.
  * **Type**: Executable byte sequence.
  * **Responsibility**: Executing arbitrary system commands on behalf of the attacker.
  * **Depends on**: Being mapped into executable memory and having the instruction pointer directed to it.
  * **Connects to**: The operating system's system call interface.
  * **Shape**: A dense, typically null-free sequence of opcodes.

* Canary (Stack Protector)
  * **What it is**: A random value placed on the stack to detect buffer overflows.
  * **Implementation**: Generated at program start and stored in thread-local storage; placed just before the saved base pointer.
  * **Its use**: Checked before a function returns; if altered, the program terminates safely.
  * **Type**: 64-bit random integer.
  * **Responsibility**: Protecting the return address from linear overflows.
  * **Depends on**: Compiler support (`-fstack-protector`) and a secure source of randomness.
  * **Connects to**: The function prologue (insertion) and epilogue (verification).
  * **Shape**: An 8-byte unpredictable value.

* ASLR (Address Space Layout Randomization)
  * **What it is**: A security technique that randomizes the memory locations of key data areas.
  * **Implementation**: Provided by the operating system kernel during program loading.
  * **Its use**: Preventing attackers from knowing the exact addresses of buffers and functions.
  * **Type**: Kernel memory management feature.
  * **Responsibility**: Randomizing the base addresses of the stack, heap, and libraries.
  * **Depends on**: The OS loader and available address space entropy.
  * **Connects to**: The virtual memory mapping of the process.
  * **Shape**: Variable address offsets applied per-execution.

* NX bit (No-Execute)
  * **What it is**: A hardware feature that marks certain areas of memory as non-executable.
  * **Implementation**: A bit in the CPU's page table entries.
  * **Its use**: Preventing the CPU from executing data as code.
  * **Type**: Hardware-level memory protection.
  * **Responsibility**: Ensuring that the stack and heap cannot run injected shellcode.
  * **Depends on**: Hardware support and OS page table configuration.
  * **Connects to**: The CPU's instruction fetch mechanism (raising a fault if violated).
  * **Shape**: A single binary flag per memory page.

* PIE (Position-Independent Executable)
  * **What it is**: A body of machine code that executes properly regardless of its absolute memory address.
  * **Implementation**: Generated by the compiler using relative addressing.
  * **Its use**: Enabling ASLR for the main executable's text and data segments.
  * **Type**: Executable file format configuration.
  * **Responsibility**: Allowing the entire program to be loaded at a random base address.
  * **Depends on**: Compiler and linker flags (`-fPIE`, `-pie`).
  * **Connects to**: The OS loader and ASLR mechanisms.
  * **Shape**: Code that relies on instruction-pointer-relative offsets.

* RELRO (Relocation Read-Only)
  * **What it is**: A mitigation technique that hardens the data sections of an executable.
  * **Implementation**: The dynamic linker resolves symbols at startup and then marks the Global Offset Table (GOT) as read-only.
  * **Its use**: Preventing attackers from overwriting function pointers in the GOT.
  * **Type**: Linker security feature.
  * **Responsibility**: Protecting dynamically linked function addresses.
  * **Depends on**: The dynamic linker (e.g., `ld.so`) and compiler flags.
  * **Connects to**: The GOT and PLT (Procedure Linkage Table).
  * **Shape**: Read-only memory pages initialized once.

* Safe String Functions
  * **What it is**: Bounded versions of standard C library functions.
  * **Implementation**: Functions like `fgets`, `strncpy`, and `snprintf` that take a maximum length parameter.
  * **Its use**: Replacing unsafe functions to prevent buffer overflows.
  * **Type**: C standard library functions.
  * **Responsibility**: Ensuring memory operations do not exceed buffer capacities.
  * **Depends on**: The programmer correctly specifying the buffer size.
  * **Connects to**: Memory buffers across the application.
  * **Shape**: API calls with explicit size limits.

---

### Concept Unit 1: The vulnerable function — stack layout

Before we examine the C code for a vulnerable function, we must set up our throwaway lab. The throwaway lab consists of a Racket script that will simulate the source code generation and display the program output. 

```racket
#lang racket
;; Throwaway Lab: Displaying the Vulnerable C Code
(displayln "Lab Output:")
(displayln "#include <stdio.h>")
(displayln "#include <string.h>")
(displayln "")
(displayln "void echo(void)")
(displayln "{")
(displayln "    char buf[8];           /* 8-byte buffer on the stack */")
(displayln "    gets(buf);             /* DANGEROUS: reads until newline, no bounds check */")
(displayln "    printf(\"%s\\n\", buf);")
(displayln "}")
(displayln "")
(displayln "int main(void)")
(displayln "{")
(displayln "    echo();")
(displayln "    return 0;")
(displayln "}")
```

And here is the simulated output of running this Racket code:

```racket
#lang racket
;; Output:
;; Lab Output:
;; #include <stdio.h>
;; #include <string.h>
;; 
;; void echo(void)
;; {
;;     char buf[8];           /* 8-byte buffer on the stack */
;;     gets(buf);             /* DANGEROUS: reads until newline, no bounds check */
;;     printf("%s\n", buf);
;; }
;; 
;; int main(void)
;; {
;;     echo();
;;     return 0;
;; }
```

In the C code above, `gets()` reads characters from `stdin` and writes them to `buf` starting at `buf[0]`. It writes until it sees `\n` or EOF. Crucially, it does NOT check the length of `buf`. This was deprecated in C99 and removed in C11 because it is intrinsically unsafe.

Let us model the stack frame for `echo()` before any input is read. We'll use a Racket script to visualize the stack layout.

```racket
#lang racket
(displayln " High addresses")
(displayln " +----------------+")
(displayln " | return address |  <- pushed by call instruction (address of next instr in main)")
(displayln " +----------------+")
(displayln " | saved rbp      |  <- pushed by echo's prologue")
(displayln " +----------------+")
(displayln " | buf[7]         |  \\")
(displayln " | buf[6]         |   |")
(displayln " | buf[5]         |   |  8 bytes for buf")
(displayln " | buf[4]         |   |")
(displayln " | buf[3]         |   |")
(displayln " | buf[2]         |   |")
(displayln " | buf[1]         |   |")
(displayln " | buf[0]         |  /   <- rsp points here")
(displayln " +----------------+")
(displayln " Low addresses")
```

The execution output accurately diagrams our stack layout:

```racket
#lang racket
;; Output:
;;  High addresses
;;  +----------------+
;;  | return address |  <- pushed by call instruction (address of next instr in main)
;;  +----------------+
;;  | saved rbp      |  <- pushed by echo's prologue
;;  +----------------+
;;  | buf[7]         |  \
;;  | buf[6]         |   |
;;  | buf[5]         |   |  8 bytes for buf
;;  | buf[4]         |   |
;;  | buf[3]         |   |
;;  | buf[2]         |   |
;;  | buf[1]         |   |
;;  | buf[0]         |  /   <- rsp points here
;;  +----------------+
;;  Low addresses
```

---

### Concept Unit 2: What happens when input is too long

Before showing what happens when the input overflows, let's write a throwaway lab in Racket that constructs the malicious input of 19 'A' characters.

```racket
#lang racket
;; Throwaway Lab: Crafting 19 'A' characters
(define input-string (make-string 19 #\A))
(printf "Crafted Input: ~a\n" input-string)
(printf "Length: ~a bytes\n" (string-length input-string))
```

The output of our throwaway lab:

```racket
#lang racket
;; Output:
;; Crafted Input: AAAAAAAAAAAAAAAAAAA
;; Length: 19 bytes
```

If we pass "AAAAAAAAAAAAAAAAAAA" (19 'A' characters = 0x41 each) to `gets()`, it writes into memory starting at `buf[0]`. Because there are no bounds checks, it continues writing past the end of the 8-byte buffer. Let's trace the memory layout using Racket to print the exact byte placement.

```racket
#lang racket
(displayln "Byte  0: buf[0] = 0x41 ('A')")
(displayln "Byte  1: buf[1] = 0x41")
(displayln "...      ...")
(displayln "Byte  7: buf[7] = 0x41   (last byte of buf)")
(displayln "Byte  8: saved_rbp[0] = 0x41  (overwrites saved frame pointer!)")
(displayln "...      ...")
(displayln "Byte 15: saved_rbp[7] = 0x41")
(displayln "Byte 16: ret_addr[0] = 0x41  (overwrites return address!)")
(displayln "...      ...")
(displayln "Byte 19: ret_addr[3] = 0x41")
```

The printed layout reveals the corruption:

```racket
#lang racket
;; Output:
;; Byte  0: buf[0] = 0x41 ('A')
;; Byte  1: buf[1] = 0x41
;; ...      ...
;; Byte  7: buf[7] = 0x41   (last byte of buf)
;; Byte  8: saved_rbp[0] = 0x41  (overwrites saved frame pointer!)
;; ...      ...
;; Byte 15: saved_rbp[7] = 0x41
;; Byte 16: ret_addr[0] = 0x41  (overwrites return address!)
;; ...      ...
;; Byte 19: ret_addr[3] = 0x41
```

When `echo` finishes and executes `ret`, it pops the corrupted return address `0x41414141` (or `0x4141414141414141` on 64-bit systems) off the stack and blindly jumps there. The operating system intervenes and delivers a `SIGSEGV` (segmentation fault) signal because `0x41414141...` is not a valid mapped memory address. The program crashes violently. 

---

### Concept Unit 3: The exploit — redirecting execution to shellcode

An attacker who controls the input can overwrite the return address not with arbitrary characters, but with the specific address of their own injected code, known as shellcode. Let's create a throwaway lab in Racket that outlines the exploit structure.

```racket
#lang racket
;; Throwaway Lab: Designing the Exploit Payload Structure
(displayln "[   8 bytes: padding to fill buf   ]")
(displayln "[   8 bytes: overwrite saved rbp   ]")
(displayln "[   8 bytes: new return address    ]  <- address of shellcode")
(displayln "[   shellcode bytes                ]  <- the malicious code")
```

The output gives us a clear blueprint for the payload:

```racket
#lang racket
;; Output:
;; [   8 bytes: padding to fill buf   ]
;; [   8 bytes: overwrite saved rbp   ]
;; [   8 bytes: new return address    ]  <- address of shellcode
;; [   shellcode bytes                ]  <- the malicious code
```

We can now look at what the actual shellcode looks like. Our Racket script will display the assembly bytes for a simplified shellcode that calls `execve("/bin/sh", NULL, NULL)`. The attacker knows (or guesses) the address where `buf` starts. They put shellcode at `buf[0]` and put `&buf[0]` as the return address, or they place it after the return address.

```racket
#lang racket
(displayln "48 31 c0            # xor rax, rax")
(displayln "b0 3b               # mov al, 59 (execve syscall number)")
(displayln "48 bf ...           # mov rdi, address of \"/bin/sh\" string")
(displayln "48 31 f6            # xor rsi, rsi (argv = NULL)")
(displayln "48 31 d2            # xor rdx, rdx (envp = NULL)")
(displayln "0f 05               # syscall")
```

The displayed assembly sequence performs the necessary system call:

```racket
#lang racket
;; Output:
;; 48 31 c0            # xor rax, rax
;; b0 3b               # mov al, 59 (execve syscall number)
;; 48 bf ...           # mov rdi, address of "/bin/sh" string
;; 48 31 f6            # xor rsi, rsi (argv = NULL)
;; 48 31 d2            # xor rdx, rdx (envp = NULL)
;; 0f 05               # syscall
```

When the `ret` instruction executes, the CPU pops the overwritten return address and jumps to the attacker-controlled location. That address points directly to the shellcode bytes. The CPU begins executing these bytes with the full privileges of the victim process. If the victim process is running as root (such as a system daemon or web server), the attacker instantly gains a root shell. This exact technique was famously used in the Morris Worm of 1988 and countless real-world exploits since.

---

### Concept Unit 4: Defense 1: Stack canaries (-fstack-protector)

To prevent simple overflows from corrupting the return address, modern compilers like GCC insert a random value, called the "canary," between the local variables and the saved frame pointer. Let's map out this new protected stack layout in our Racket throwaway lab.

```racket
#lang racket
;; Throwaway Lab: Protected Stack Layout
(displayln " +----------------+")
(displayln " | return address |")
(displayln " +----------------+")
(displayln " | canary value   |  <- random 8-byte value set at function entry")
(displayln " +----------------+")
(displayln " | saved rbp      |")
(displayln " +----------------+")
(displayln " | buf[0..7]      |")
(displayln " +----------------+")
```

The output of the layout clearly shows the canary shielding the return address:

```racket
#lang racket
;; Output:
;;  +----------------+
;;  | return address |
;;  +----------------+
;;  | canary value   |  <- random 8-byte value set at function entry
;;  +----------------+
;;  | saved rbp      |
;;  +----------------+
;;  | buf[0..7]      |
;;  +----------------+
```

The canary is loaded from a secret, unpredictable location—typically thread-local storage (accessed via `%fs:0x28` on Linux)—at function entry. Before the function executes its `ret` instruction, the compiler injects assembly code to verify that the canary remains intact. We can display this assembly check using Racket.

```racket
#lang racket
(displayln "/* Before ret: */")
(displayln "    movq    %fs:0x28, %rax   /* load original canary value */")
(displayln "    xorq    -8(%rbp), %rax   /* compare with canary on stack */")
(displayln "    je      .L_ok             /* if equal, proceed to ret */")
(displayln "    call    __stack_chk_fail  /* canary corrupted -- abort! */")
(displayln ".L_ok:")
(displayln "    ret")
```

The validation logic halts the process if tampered with:

```racket
#lang racket
;; Output:
;; /* Before ret: */
;;     movq    %fs:0x28, %rax   /* load original canary value */
;;     xorq    -8(%rbp), %rax   /* compare with canary on stack */
;;     je      .L_ok             /* if equal, proceed to ret */
;;     call    __stack_chk_fail  /* canary corrupted -- abort! */
;; .L_ok:
;;     ret
```

If the attacker attempts the same linear overflow by writing 24 bytes (8 bytes for `buf` + 8 bytes for the canary + 8 bytes for the return address), they will inevitably overwrite the canary. When the function attempts to return, the canary on the stack will no longer match the master copy in thread-local storage. The program will branch to `__stack_chk_fail`, safely terminating the process before the attacker's return address is used. The attacker must somehow KNOW the exact random canary value to bypass this defense, and since it changes on every execution, guessing is practically impossible.

---

### Concept Unit 5: Defense 2: ASLR (Address Space Layout Randomization)

Even if an attacker can bypass the canary (perhaps via an arbitrary memory write rather than a linear overflow), they still need to know exactly where their shellcode is located to set the return address correctly. Let's use Racket to build a throwaway lab that simulates consecutive program executions under ASLR.

```racket
#lang racket
;; Throwaway Lab: Simulating ASLR Address Generation
(define (random-address base)
  (string-append base (number->string (random #x1000 #xFFFF) 16) "xxxx"))

(printf "Run 1: stack at ~a\n" (random-address "0x7fff"))
(printf "Run 2: stack at ~a\n" (random-address "0x7fff"))
(printf "Run 3: stack at ~a\n" (random-address "0x7fff"))
```

The output shows randomized addresses for each run:

```racket
#lang racket
;; Output:
;; Run 1: stack at 0x7fff1234xxxx
;; Run 2: stack at 0x7fff5678xxxx
;; Run 3: stack at 0x7fffe8abxxxx
```

Without ASLR, every run of a program loads the stack at the very same deterministic address. The attacker can simply test the program locally, find out exactly where `buf` starts, and hardcode that address into the exploit payload as the new return address.

With ASLR (enabled by default on modern Linux, macOS, and Windows operating systems), the operating system kernel heavily randomizes the starting base addresses of the stack, heap, and shared libraries every single time the program runs. The attacker cannot reliably predict where to redirect execution. On a 64-bit Linux system, ASLR provides approximately 42 bits of entropy. Brute-forcing this randomization would take over 4 trillion attempts on average.

However, ASLR does have limitations. It can be bypassed if the attacker discovers an "information leak"—a separate vulnerability that allows the attacker to read a pointer from the process's memory, thereby revealing the current memory layout. On older 32-bit systems, the limited address space means the entropy is low enough that brute-force attacks are feasible.

---

### Concept Unit 6: Defense 3: NX bit / DEP (No-Execute / Data Execution Prevention)

If an attacker successfully bypasses the canary and ASLR, they still need their injected shellcode to execute. Modern CPUs support a per-page No-Execute (NX) bit in their page table entries. Let's use Racket to print a table showing memory segment permissions to serve as our throwaway lab.

```racket
#lang racket
;; Throwaway Lab: Memory Segment Permissions
(displayln "Page         | Readable | Writable | Executable")
(displayln "-------------|----------|----------|------------")
(displayln "Text (.text) |    YES   |    NO    |    YES")
(displayln "Data (.data) |    YES   |    YES   |    NO")
(displayln "Stack        |    YES   |    YES   |    NO  <- shellcode here cannot run!")
(displayln "Heap         |    YES   |    YES   |    NO")
```

The output matrix reveals strict separation of code and data:

```racket
#lang racket
;; Output:
;; Page         | Readable | Writable | Executable
;; -------------|----------|----------|------------
;; Text (.text) |    YES   |    NO    |    YES
;; Data (.data) |    YES   |    YES   |    NO
;; Stack        |    YES   |    YES   |    NO  <- shellcode here cannot run!
;; Heap         |    YES   |    YES   |    NO
```

When the NX bit is set for a page of memory, the CPU will proactively raise a hardware fault if an instruction fetch (execution) is attempted on that page. As shown above, the stack and heap are marked as NX (they contain data only, and are not executable). The text segment (the actual compiled program code) is executable but not writable, preventing modification.

When the attacker redirects execution to the stack (where their shellcode resides), the CPU raises a fault instead of executing it. This completely neutralizes direct code injection attacks.

To bypass this formidable defense, attackers developed Return-Oriented Programming (ROP). Instead of injecting new executable code, an attacker chains together existing, already-executable code snippets called "gadgets" from the `.text` segment or loaded libraries. Each gadget is a short sequence of instructions ending in a `ret` instruction. By placing a carefully crafted chain of addresses on the stack, the attacker forces the CPU to execute these existing gadgets sequentially, computing the attack without ever executing data.

---

### Concept Unit 7: Defense 4: RELRO, PIE, and safe string functions

PIE (Position-Independent Executable) ensures that the entire program binary, including the `.text` segment, is loaded at a randomized base address. Without PIE, only the stack, heap, and external libraries are randomized by ASLR, while the core application code sits at a fixed address, providing reliable gadgets for ROP attacks.

RELRO (Relocation Read-Only) mitigates attacks that attempt to overwrite function pointers. After the dynamic linker resolves symbols at startup, it marks the Global Offset Table (GOT) as read-only.

However, all of these advanced defenses are mitigations, not cures. The real first line of defense is writing correct code with strict bounds checking. Let's use Racket to print the final throwaway lab contrasting unsafe C functions with their safe counterparts.

```racket
#lang racket
;; Throwaway Lab: Safe vs Unsafe String Functions
(displayln "/* UNSAFE functions to avoid: */")
(displayln "gets(buf);               /* no bounds at all */")
(displayln "strcpy(dst, src);        /* copies until NUL, no length limit */")
(displayln "sprintf(buf, fmt, ...);  /* no length limit on buf */")
(displayln "")
(displayln "/* SAFE replacements: */")
(displayln "fgets(buf, sizeof(buf), stdin);     /* reads at most sizeof(buf)-1 chars */")
(displayln "strncpy(dst, src, sizeof(dst)-1);   /* copies at most n-1 chars */")
(displayln "dst[sizeof(dst)-1] = '\\0';         /* ensure NUL termination */")
(displayln "snprintf(buf, sizeof(buf), fmt, ...); /* length-limited sprintf */")
```

The output provides the safe coding guidelines every C programmer must memorize:

```racket
#lang racket
;; Output:
;; /* UNSAFE functions to avoid: */
;; gets(buf);               /* no bounds at all */
;; strcpy(dst, src);        /* copies until NUL, no length limit */
;; sprintf(buf, fmt, ...);  /* no length limit on buf */
;; 
;; /* SAFE replacements: */
;; fgets(buf, sizeof(buf), stdin);     /* reads at most sizeof(buf)-1 chars */
;; strncpy(dst, src, sizeof(dst)-1);   /* copies at most n-1 chars */
;; dst[sizeof(dst)-1] = '\0';         /* ensure NUL termination */
;; snprintf(buf, sizeof(buf), fmt, ...); /* length-limited sprintf */
```

`fgets` guarantees it will never read more characters than the size provided, leaving space for the null terminator. `strncpy` and `snprintf` similarly enforce explicit boundaries.

The critical lesson here is that all four defenses—Canaries, ASLR, NX, and PIE/RELRO—can be bypassed given enough time, resources, and chained vulnerabilities (such as combining an information leak with a ROP chain). The only true defense is writing structurally sound code that mathematically guarantees bounds checking.

Buffer overflows are the archetype of the entire class of memory safety bugs. Lessons 43–45 (the security capstone) will return to this topic in depth, specifically focusing on Return-Oriented Programming and modern exploit mitigations. Lesson 12 covers reading compiler output with optimizations.

**Exercises**: 
1. Draw the exact stack layout for `echo()` on x86-64, taking into account 16-byte stack alignment padding.
2. Explain why the stack canary must be loaded from thread-local storage rather than a standard global variable.
3. What does the `-fsanitize=address` compiler flag do differently from a traditional stack canary?
