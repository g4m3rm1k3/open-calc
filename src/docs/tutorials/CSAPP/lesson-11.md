# Lesson 11: Buffer Overflows — How They Work and How They're Exploited

What you will build: The reader will understand exactly how a buffer overflow works mechanically: how writing past the end of a stack buffer corrupts the return address, how an attacker crafts input to redirect execution, and what the four modern defenses do. This isn't just theory; we will trace the exact bytes on the stack before and after an overflow.

What you need to know first: Lessons 00–10. Specifically, you need to understand the x86-64 stack layout, what the instruction pointer (`%rip`) is, and how the `call` and `ret` instructions manage the return address on the stack.

Terms used in this lesson:
- **Buffer Overflow** — A memory safety violation where a program writes more data to an allocated block of memory (buffer) than it can hold, overflowing into adjacent memory locations. This destroys the data that was previously there.
- **Return Address** — The memory address pushed onto the stack by the `call` instruction. It tells the CPU where to resume execution after the current function finishes.
- **Shellcode** — Small piece of executable machine code injected into a vulnerable program by an attacker, typically used to start a command shell (like `/bin/sh`).
- **Stack Canary** — A random, secret value placed on the stack between local variables and the return address to detect buffer overflows before the function returns.
- **ASLR (Address Space Layout Randomization)** — An OS-level defense that randomizes the locations of the stack, heap, and libraries in memory each time the program runs, making it hard for an attacker to guess addresses.
- **NX Bit (No-Execute)** — A hardware feature that marks certain areas of memory (like the stack) as non-executable. If the CPU tries to run code there, it triggers a fault.
- **ROP (Return-Oriented Programming)** — An exploit technique used to bypass the NX bit by chaining together small snippets of already-existing, executable code (gadgets) instead of executing injected code.
- **PIE (Position-Independent Executable)** — A compiler feature that compiles the main program text so it can be loaded at a random address, applying ASLR to the program binary itself.
- **RELRO (Relocation Read-Only)** — A mitigation that makes the Global Offset Table (GOT) read-only after the dynamic linker resolves symbols, preventing attackers from overwriting function pointers.

Objects and methods used:

**`gets`**
- *What it is:* A standard C library function for reading a line of text from standard input.
- *Implementation:* `char *gets(char *s);`
- *Its use:* Used historically to read strings, but is intrinsically unsafe because it performs no bounds checking. We use it to demonstrate how vulnerabilities are introduced.
- *Type:* A free function in the C standard library (`libc`).
- *Responsibility:* Reads characters from `stdin` and stores them into the string pointed to by `s` until a newline character or end-of-file is encountered.
- *Depends on:* A pointer to an allocated memory buffer large enough to hold the input.
- *Connects to:* Called by user code; calls internal OS read routines to get characters from `stdin`.
- *Shape:* A public API surface of the C standard library.

**`printf`**
- *What it is:* A standard C library function for formatted output.
- *Implementation:* `int printf(const char *format, ...);`
- *Its use:* Used to print the buffer to the screen to prove the data was read.
- *Type:* A variadic free function in the C standard library (`libc`).
- *Responsibility:* Formats data according to the format string and writes the result to `stdout`.
- *Depends on:* A valid format string and corresponding arguments matching the format specifiers.
- *Connects to:* Called by user code; calls internal OS write routines to send data to `stdout`.
- *Shape:* A public API surface of the C standard library.

**`execve`**
- *What it is:* A POSIX system call to execute a program.
- *Implementation:* `int execve(const char *pathname, char *const argv[], char *const envp[]);`
- *Its use:* Used in shellcode to replace the current vulnerable process with a command shell.
- *Type:* A system call wrapper provided by `libc`, or directly invoked via the `syscall` instruction.
- *Responsibility:* Completely replaces the current process image with a new process image specified by `pathname`.
- *Depends on:* A valid path to an executable, an array of argument strings, and an array of environment strings.
- *Connects to:* Called by the attacker's shellcode; traps into the OS kernel to load the new binary.
- *Shape:* The boundary between user-space execution and kernel-level process management.

---

## Concept Unit: The Vulnerable Function and its Stack Layout

### The Problem

Programs need to read user input, but if a program assumes the input will be a certain size and the user provides more, where does that extra data go? In C, memory is raw bytes. If you write past the end of an array on the stack, you simply overwrite whatever variables happen to live next to it in memory.

What would you try here first if you were asked to read user input into an 8-byte array? What happens if you type 10 characters?

### Introduce the concept in isolation

Let's write a small throwaway C program that demonstrates reading an unbounded string into a small buffer.

```c
#include <stdio.h>

int main(void) {
    char name[4];
    gets(name);
    return 0;
}
```

Predicted output (exempt from execution because the exact crash behavior is known and standard): If we input "A", it exits normally. If we input "AAAAAAAAAA", the OS kills the program with a Segmentation Fault (`SIGSEGV`).

This proves that `gets` has no concept of the size of `name`. It just takes a starting memory address and writes bytes there until it sees a newline.

### Discard the throwaway example

The 4-byte `name` throwaway is deleted. It will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating a classic security vulnerability pattern, not building a calculator feature.
- **Files affected**: `echo.c` (created)
- **Change type**: Add
- **Location**: N/A (brand new file)
- **Dependencies**: C standard library, GCC.

### The New Code

```c
#include <stdio.h>
#include <string.h>

void echo(void)
{
    char buf[8];
    gets(buf);             /* reads until newline, NO bounds check */
    printf("%s\n", buf);
}

int main(void)
{
    echo();
    return 0;
}
```

### The Updated Project

```c
// ← new file: echo.c
1: #include <stdio.h>
2: #include <string.h>
3: 
4: void echo(void)
5: {
6:     char buf[8];
7:     gets(buf);             /* reads until newline, NO bounds check */
8:     printf("%s\n", buf);
9: }
10: 
11: int main(void)
12: {
13:     echo();
14:     return 0;
15: }
```
This complete program calls `echo`, which allocates an 8-byte buffer and reads user input into it.

### Mechanical walkthrough

- `char buf[8];` allocates an 8-byte array on the stack. The compiler subtracts 8 from the stack pointer (`%rsp`) to make room for this local variable.
- `gets(buf);` calls the `gets` function, passing the address of the first byte of `buf` (`&buf[0]`). `gets` reads characters from standard input and stores them sequentially in memory starting at that address. It stops when it reads a newline, appending a null terminator (`\0`). It does not know or care that `buf` is only 8 bytes long.
- `printf("%s\n", buf);` prints the string back out to the terminal.

Stack frame for `echo()` before any input:
```
 High addresses
 +------------------+
 | return address   |  <- pushed by call (address of next instr in main)
 +------------------+
 | saved rbp        |  <- pushed by echo's prologue
 +------------------+
 | buf[7]           |  \
 | buf[6]           |   |
 | buf[5]           |   |  8 bytes for buf
 | buf[4]           |   |
 | buf[3]           |   |
 | buf[2]           |   |
 | buf[1]           |   |
 | buf[0]           |  /  <- rsp points here
 +------------------+
 Low addresses
```

### CS lens

The stack data structure is fundamental to program execution. It manages function calls, local variables, and control flow. Because control data (the return address) and user data (the buffer) are intermixed on the same stack, a flaw in how user data is handled can corrupt the control data. This is an instance of the classic "in-band signaling" problem, where instructions and data share the same channel.

### SE lens

The C standard library included `gets` in its earliest versions. The alternative that was *not* chosen was to require the programmer to pass the size of the buffer to the function. The tradeoff was convenience versus safety. The failure cost of this design decision has been catastrophic: buffer overflows have caused billions of dollars in damage and countless security breaches. `gets` was officially removed from the C standard in C11.

### Commands needed to make this unit real

`gcc -O0 -fno-stack-protector -z execstack -no-pie echo.c -o echo`
- `gcc`: The GNU C Compiler.
- `-O0`: Disable optimizations so the stack looks exactly like our diagram.
- `-fno-stack-protector`: Disables stack canaries (we will learn about these later).
- `-z execstack`: Marks the stack as executable (disables NX bit).
- `-no-pie`: Disables position-independent execution (disables ASLR for the code).

### Run it

Predicted output (exempt from execution): 
If we compile and run with normal input ("hello"):
```
hello
```
This is predictably normal because "hello" (5 bytes + null terminator) fits perfectly within the 8-byte buffer.

### Connect the pieces

The `buf` array sits directly below the saved frame pointer and the return address. Because memory addresses grow upwards, writing past the end of `buf` writes directly into the saved frame pointer and then the return address.

---

## Concept Unit: What Happens with Oversized Input

### The Problem

If `gets` writes past the 8th byte, it overwrites the `saved rbp`. If it keeps writing, it overwrites the return address. How does this actually crash the program?

What do you think the CPU does when it tries to return from `echo` if the return address has been overwritten with 'A' characters?

### Introduce the concept in isolation

Let's look at how the `ret` instruction works in x86-64 assembly.

```asm
# throwaway.s
.global _start
_start:
    push $0x4141414141414141
    ret
```

Predicted output (exempt from execution): The program will crash with a segmentation fault at address `0x4141414141414141`. This proves that `ret` blindly pops whatever is at the top of the stack and jumps to it.

### Discard the throwaway example

The isolated assembly file is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: No files modified. We are analyzing the input to the existing `echo` program.
- **Change type**: N/A
- **Location**: N/A
- **Dependencies**: The compiled `echo` binary from the previous unit.

### The New Code

Input to the program:
`"AAAAAAAAAAAAAAAAAAA"` (19 'A' characters, each = 0x41)

### The Updated Project

No source code changed. We are feeding the 19 'A's into `echo.c`.

### Mechanical walkthrough

- The user inputs 19 'A' characters, followed by a newline.
- `gets` writes `0x41` starting at `buf[0]`.
- `buf[0]` to `buf[7]` are filled with the first 8 'A's.
- `buf[8]` to `buf[15]` are filled with the next 8 'A's, overwriting the 8-byte `saved rbp`.
- `buf[16]` to `buf[18]` are filled with the last 3 'A's, overwriting the first 3 bytes of the return address. The null terminator `\0` (0x00) overwrites the 4th byte.

The stack now looks like this:
```
buf[0]  = 0x41  ('A')
buf[1]  = 0x41
...     ...
buf[7]  = 0x41   (last byte of buf)
buf[8]  = 0x41   (overwrites saved_rbp byte 0)
...     ...
buf[15] = 0x41   (overwrites saved_rbp byte 7)
buf[16] = 0x41   (overwrites ret_addr byte 0)
buf[17] = 0x41
buf[18] = 0x41
buf[19] = 0x00   (null terminator)
```

When `echo` finishes, it executes `ret`. The CPU pops the corrupted return address (which is now `0x0000000000414141`) off the stack into `%rip`. The CPU attempts to fetch an instruction from that address, which is invalid memory, triggering a `SIGSEGV` (Segmentation Fault).

### CS lens

A Segmentation Fault is the operating system's memory protection mechanism in action. The OS uses virtual memory and page tables to map valid addresses. When the CPU attempts to access an unmapped page (like `0x414141`), the Memory Management Unit (MMU) raises an exception, and the OS kills the offending process.

### SE lens

The alternative to letting the program crash is attempting to recover or ignore the error. Crashing is the correct engineering choice (Fail-Fast principle). Continuing execution with a corrupted instruction pointer would lead to completely unpredictable and dangerous behavior.

### Commands needed to make this unit real

`python3 -c "print('A'*19)" | ./echo`
Pipes exactly 19 'A' characters into the program.

### Run it

Predicted output (exempt from execution):
```
AAAAAAAAAAAAAAAAAAA
Segmentation fault (core dumped)
```
This is predictably exactly how Linux reports a segmentation fault on a corrupted instruction pointer.

### Connect the pieces

The program crashed because we overwrote the return address with garbage. If we can overwrite it with garbage, we can overwrite it with a specific memory address of our choosing.

---

## Concept Unit: The Exploit — Redirecting Execution to Shellcode

### The Problem

Crashing a program is a denial-of-service, but an attacker wants *control*. If the attacker can control the return address, where should they point it?

If you can jump anywhere, and you want to run your own code, how do you get your code into the program's memory in the first place?

### Introduce the concept in isolation

Let's look at how shellcode actually works. Shellcode is just raw machine bytes that execute a system call.

```c
// shellcode.c
void main() {
    char shellcode[] = "\x48\x31\xc0\xb0\x3b\x48\x31\xf6\x48\x31\xd2\x0f\x05"; 
    // This isn't full shellcode, just a fragment to prove execution
    void (*func)() = (void (*)())shellcode;
    func();
}
```

Predicted output (exempt from execution): This crashes or executes the fragment depending on memory protections. It proves that a character array can be executed as code if the CPU is told to jump to it.

### Discard the throwaway example

The `shellcode.c` throwaway is deleted and will not be used again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: No files modified.
- **Change type**: N/A
- **Location**: N/A
- **Dependencies**: The `echo` binary.

### The New Code

Exploit input structure:
```
[ 8 bytes: shellcode starts here... ]
[ 8 bytes: overwrite rbp            ]
[ 8 bytes: new return addr          ]  <- address of buf[0] (where shellcode started)
```

Shellcode that calls `execve("/bin/sh", NULL, NULL)` -- byte sequence:
```asm
48 31 c0     # xor %rax, %rax
b0 3b        # mov $59, %al       (59 = execve syscall number)
48 bf ...    # movabs $addr, %rdi  (address of "/bin/sh" string)
48 31 f6     # xor %rsi, %rsi     (argv = NULL)
48 31 d2     # xor %rdx, %rdx     (envp = NULL)
0f 05        # syscall
```

### The Updated Project

We supply the exploit string to the running `echo` process.

### Mechanical walkthrough

- The attacker crafts a specific payload string.
- The first part of the payload is the raw machine code instructions (shellcode) shown above. It is written directly into `buf[0]`.
- The attacker pads the input to exactly reach the return address on the stack.
- The attacker overwrites the return address with the memory address of `buf[0]`.
- When `echo` executes `ret`, it pops the address of `buf[0]` and jumps there.
- The CPU begins executing the bytes inside `buf` as if they were normal program instructions.
- The shellcode sets up the registers: `%al = 59` (the syscall number for `execve`), `%rdi` points to the string "/bin/sh", `%rsi` and `%rdx` are null.
- The `syscall` instruction traps into the kernel.
- The kernel replaces the current process with `/bin/sh`. The attacker now has a command shell running with the privileges of the victim program.

Trace of control flow:
1. `call echo` — original return address pushed.
2. `gets(buf)` — buffer overflows; return address replaced with `&buf[0]`.
3. `ret` — CPU jumps to `&buf[0]`.
4. `xor %rax, %rax ... syscall` — shellcode executes in buffer memory.
5. `execve` replaces process.

### CS lens

This exploits the Von Neumann architecture, where both instructions and data are stored in the same memory. The CPU cannot tell the difference between a string of text and a sequence of machine instructions; it just executes whatever bytes it is pointed to.

### SE lens

The security impact of a buffer overflow depends on what privileges the vulnerable program has. If the program is a network service running as `root`, the attacker gains a `root` shell and completely compromises the server.

### Commands needed to make this unit real

Running an actual exploit requires a script to format the raw bytes (like `\x48`) properly, which we won't execute here, but the theory is complete.

### Run it

Predicted output (exempt from execution): If the exploit is successful, the output is a shell prompt (`$ `), proving the process was replaced.

### Connect the pieces

The attacker used the vulnerability not just to crash the program, but to hijack its control flow and execute arbitrary code. To stop this, the industry developed several layers of defense.

---

## Concept Unit: Defense 1 — Stack Canaries (-fstack-protector)

### The Problem

If the attacker has to write past the buffer to reach the return address, they must overwrite everything in between. How can the program detect that the memory between the buffer and the return address has been tampered with?

### Introduce the concept in isolation

A stack canary is exactly what it sounds like — a coal mine canary.

```c
// canary_concept.c
#include <stdlib.h>
void func() {
    long canary = rand();
    char buf[8];
    // ... do stuff ...
    if (canary != rand_value_saved_elsewhere) exit(1);
}
```

Predicted output (exempt from execution): If `buf` overflows, it overwrites `canary`. The check fails, and the program exits safely before calling `ret`.

### Discard the throwaway example

The `canary_concept.c` file is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: We recompile `echo.c` without the `-fno-stack-protector` flag.
- **Change type**: Configure
- **Location**: N/A
- **Dependencies**: GCC.

### The New Code

Stack layout with a canary:
```
+------------------+
| return address   |
+------------------+
| canary value     |  <- random 8 bytes, loaded from fs:0x28 at entry
+------------------+
| saved rbp        |
+------------------+
| buf[0..7]        |
+------------------+
```

Assembly inserted by compiler (before `ret`):
```asm
    movq    %fs:0x28, %rax    # load original canary from TLS
    xorq    -8(%rbp), %rax    # compare with canary on stack
    je      .L_ok             # equal: proceed to ret
    call    __stack_chk_fail  # not equal: abort!
.L_ok:
    ret
```

### The Updated Project

The C code remains identical. The compiler changes the generated assembly.

### Mechanical walkthrough

- During the function prologue, the compiler inserts code to load a random 64-bit value from Thread-Local Storage (`%fs:0x28`).
- This random value (the canary) is pushed onto the stack right above the local variables and below the saved base pointer and return address.
- The user inputs a long string.
- The string overflows `buf`, overwriting the saved base pointer, the canary, and the return address.
- During the function epilogue, before `ret` executes, the compiler inserts a check.
- `movq %fs:0x28, %rax` loads the master copy of the canary into `%rax`.
- `xorq -8(%rbp), %rax` compares the master copy with the canary value currently on the stack. If they are identical, `xor` produces 0.
- `je .L_ok` jumps to the `ret` instruction if the values matched (result was 0).
- Because the attacker overwrote the canary on the stack with 'A's, it no longer matches the master copy in TLS. The `je` falls through.
- `call __stack_chk_fail` executes, which immediately terminates the process and prints an error message. The corrupted `ret` is never executed.

### CS lens

This is a probabilistic defense. The canary is random and changes every time the program runs. The attacker cannot predict it. If they try to guess it, they have a 1 in 18 quintillion chance (for a 64-bit canary) of getting it right.

### SE lens

The canary is loaded from Thread-Local Storage (`fs:0x28`) rather than a global variable because in a multi-threaded program, a global variable could be overwritten or leaked more easily, and accessing it requires synchronization. TLS is fast and isolated per-thread. The tradeoff is a small performance hit on every function call for the setup and check.

### Commands needed to make this unit real

Compile normally: `gcc echo.c -o echo_secure` (modern GCC enables stack protectors by default).

### Run it

Predicted output (exempt from execution):
```
AAAAAAAAAAAAAAAAAAA
*** stack smashing detected ***: terminated
Aborted (core dumped)
```
This is predictably the exact output of `__stack_chk_fail`.

### Connect the pieces

The canary prevents basic sequential overwrites. However, if an attacker can read the canary value (an information leak vulnerability) before exploiting the overflow, they can simply include the correct canary value in their payload and bypass the check.

---

## Concept Unit: Defense 2 — ASLR (Address Space Layout Randomization)

### The Problem

If the attacker bypasses the canary, they still need to overwrite the return address with the address of `buf[0]`. How do they know where `buf[0]` is in memory? Historically, the stack always started at the exact same address.

### Introduce the concept in isolation

```bash
# throwaway command
cat /proc/sys/kernel/randomize_va_space
```

Predicted output (exempt from execution): `2`. This means ASLR is fully enabled on the system.

### Discard the throwaway example

The command is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: System configuration.
- **Change type**: Configure
- **Location**: N/A
- **Dependencies**: Linux Kernel.

### The New Code

With ASLR enabled, memory addresses change every run:
```
Run 1: stack at 0x7fff1234xxxx, buf at 0x7fff12348020
Run 2: stack at 0x7fff5678xxxx, buf at 0x7fff5678b0e0
Run 3: stack at 0x7fffe8abxxxx, buf at 0x7fffe8ab3140
```

### The Updated Project

The C code remains identical. The operating system changes how it loads the program.

### Mechanical walkthrough

- The OS kernel is responsible for setting up the virtual memory space for a new process.
- When `execve` is called to launch `echo`, the kernel chooses random base addresses for the stack, the heap, and shared libraries (`libc`).
- When `echo` runs and `gets` is called, `buf[0]` is located at a completely different, unpredictable address every time.
- The attacker crafts their payload, but they must guess the address of `buf[0]` to overwrite the return address.
- On a 64-bit system, there are about 42 bits of entropy (randomness) in the stack address.
- The attacker guesses wrong. The corrupted return address points to unmapped memory or the middle of an instruction.
- The program crashes (`SIGSEGV`) instead of executing the shellcode.

### CS lens

ASLR relies on the massive virtual address space of 64-bit processors. On a 32-bit system, there isn't enough room to randomize addresses effectively (only a few bits of entropy), so attackers can simply brute-force the address by trying repeatedly until they get lucky.

### SE lens

ASLR is a defense-in-depth mechanism. It doesn't fix the bug; it just makes it extremely unreliable to exploit. Like canaries, ASLR is completely defeated by an information leak. If the attacker can trick the program into printing a pointer to the stack, they can calculate the exact address of `buf[0]` for that specific run.

### Commands needed to make this unit real

None. ASLR is enabled by default on all modern operating systems.

### Run it

Predicted output (exempt from execution): Program crashes, exploit fails.

### Connect the pieces

Even if the attacker leaks the stack address and bypasses the canary, they still have to execute their shellcode on the stack. What if the stack simply refuses to execute code?

---

## Concept Unit: Defense 3 — NX Bit / DEP

### The Problem

The CPU shouldn't need to execute code on the stack. The stack is for data. Why does the CPU allow shellcode to run there at all?

### Introduce the concept in isolation

Modern CPUs have a page table attribute that marks memory pages.

```
Page         | Readable | Writable | Executable
-------------|----------|----------|------------
.text        |   YES    |    NO    |    YES
.data        |   YES    |    YES   |    NO
Stack        |   YES    |    YES   |    NO   <- shellcode here can't execute!
Heap         |   YES    |    YES   |    NO
```

### Discard the throwaway example

The conceptual table is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Recompile without `-z execstack`.
- **Change type**: Configure
- **Location**: N/A
- **Dependencies**: Hardware NX bit support.

### The New Code

No code changes. The compiler simply does not request an executable stack in the ELF binary header.

### The Updated Project

The C code remains identical.

### Mechanical walkthrough

- The attacker successfully overflows the buffer, bypasses the canary, guesses the stack address, and overwrites the return address to point to `buf[0]`.
- The `ret` instruction pops `&buf[0]` into `%rip`.
- The CPU attempts to fetch the first instruction of the shellcode from `&buf[0]`.
- The MMU checks the page table entry for the stack memory page.
- The No-Execute (NX) bit is set to 1 (true) for this page.
- The CPU hardware immediately raises a fault (Segmentation Fault) because of the permission violation. The shellcode never executes a single instruction.

### CS lens

Also known as DEP (Data Execution Prevention) on Windows. It enforces a strict separation between code and data at the hardware level, fixing the fundamental flaw of the Von Neumann architecture for this specific attack vector.

### SE lens

To bypass NX, attackers developed ROP (Return-Oriented Programming). Instead of writing new code to the stack, the attacker overflows the stack with a chain of return addresses pointing to small snippets of existing executable code (in `.text` or `libc`) ending in `ret`. By chaining these "gadgets" together, they can perform arbitrary computation without ever executing data.

### Commands needed to make this unit real

Compile normally. The stack is non-executable by default.

### Run it

Predicted output (exempt from execution): `Segmentation fault` upon attempting to jump to the stack.

### Connect the pieces

NX stops code execution on the stack, but ROP bypasses it by reusing existing code. To stop ROP, we need ASLR to randomize the locations of the existing code, which leads to the final compiler defenses.

---

## Concept Unit: Defense 4 — PIE, RELRO, and Safe C Functions

### The Problem

If ASLR randomizes the stack and libraries, but the main program executable (`echo`) is loaded at the same fixed address every time, an attacker can just use ROP gadgets from the main program. How do we randomize the main program? And how do we stop the overflow in the first place?

### Introduce the concept in isolation

```c
/* UNSAFE: */
gets(buf);                        /* no bounds at all -- never use */
strcpy(dst, src);                 /* copies until NUL, no limit */
sprintf(buf, fmt, ...);           /* no length limit */
```

Predicted output (exempt from execution): These functions will blindly write past buffer boundaries and cause memory corruption.

### Discard the throwaway example

The unsafe functions list is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `echo.c`
- **Change type**: Replace
- **Location**: Inside the `echo` function.
- **Dependencies**: C standard library.

### The New Code

```c
    /* SAFE replacements: */
    fgets(buf, sizeof(buf), stdin);    /* reads at most sizeof(buf)-1 chars */
```

### The Updated Project

```c
// ← new file: echo.c
1: #include <stdio.h>
2: #include <string.h>
3: 
4: void echo(void)
5: {
6:     char buf[8];
7:     fgets(buf, sizeof(buf), stdin); // ← new: bounds checked
8:     printf("%s\n", buf);
9: }
10: 
11: int main(void)
12: {
13:     echo();
14:     return 0;
15: }
```
We replace `gets` with `fgets`, passing the exact size of the buffer.

### Mechanical walkthrough

- `fgets(buf, sizeof(buf), stdin)` is an instance call provided by the C standard library.
- `sizeof(buf)` evaluates at compile-time to 8.
- `fgets` reads characters from `stdin`.
- It keeps an internal counter. If it reads 7 characters without seeing a newline, it stops reading automatically.
- It writes the null terminator at `buf[7]`.
- Even if the user inputs 100 'A's, `fgets` only writes 7 'A's and a null byte. The remaining 92 'A's are left in the input stream.
- The `saved rbp` and return address are completely untouched. The program is physically impossible to overflow via this input.

Beyond safe code, modern compilers enable PIE and RELRO by default:
- **PIE (Position-Independent Executable)**: The compiler generates relative jumps (`%rip`-relative addressing) instead of absolute addresses, allowing the OS to apply ASLR to the main binary itself. Attackers can no longer find fixed ROP gadgets.
- **RELRO (Relocation Read-Only)**: Attackers often overwrite function pointers in the Global Offset Table (GOT) to redirect calls like `printf` to `system`. RELRO marks the GOT as read-only after the dynamic linker resolves all symbols at startup, preventing these overwrites.

### CS lens

The ultimate defense is correct code. Mitigations like Canaries, ASLR, NX, PIE, and RELRO are band-aids over a fundamental language design flaw: C does not automatically track array bounds.

### SE lens

Writing safe C code requires manual vigilance. You must always use bounded functions (`strncpy`, `snprintf`, `fgets`). Because humans make mistakes, modern systems programming is shifting towards memory-safe languages like Rust, which enforce bounds checking at compile-time and runtime automatically, eliminating buffer overflows entirely.

### Commands needed to make this unit real

None. `fgets` is standard C.

### Run it

Predicted output (exempt from execution):
```
AAAAAAAAAAAAAAAAAAA
AAAAAAA
```
The program safely truncates the input, prints the first 7 characters, and exits cleanly.

### Connect the pieces

The program is now safe. A user typing 100 characters no longer corrupts the stack; the excess data is simply ignored or handled gracefully.

Buffer overflows are the archetype of memory safety bugs. They exist because C trusts the programmer implicitly. Lesson 12 covers reading compiler output with optimizations, where we will see how the compiler transforms our safe code into highly efficient machine instructions.
