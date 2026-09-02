# Lesson 42: Security — Attacks, Exploits, and Modern Defenses

**What you will build:** The reader will understand how buffer overflow attacks work at the stack level, how return-oriented programming (ROP) chains work, and how three modern defenses — stack canaries, ASLR, and NX (non-executable stack) — defeat them. The transferable insight: every security defense in systems programming is a response to a specific attack primitive. Understanding the attack is the only way to understand why the defense is necessary.

**What you need to know first:** Lesson 08, Lesson 11, Lesson 21.

## Terms used in this lesson

- **Buffer overflow** — writing more data to a block of memory than it was allocated to hold, allowing an attacker to corrupt adjacent memory spaces like the call stack.
- **Return address** — the saved instruction pointer pushed onto the stack by the CPU `call` instruction, dictating where control flow resumes when a function returns.
- **Shellcode** — a small piece of machine code used as the payload in the exploitation of a software vulnerability, traditionally used to spawn a shell.
- **Stack canary** — a random value placed between local variables and the saved return address on the stack; if modified, it indicates a buffer overflow has occurred.
- **ASLR (Address Space Layout Randomization)** — an OS-level defense that randomizes the memory locations of the stack, heap, and libraries, making it difficult for an attacker to predict memory addresses.
- **NX (Non-Executable Stack)** — a defense that marks certain areas of memory (like the stack) as non-executable, preventing the CPU from running code injected there.
- **ROP (Return-Oriented Programming)** — an exploit technique that strings together existing snippets of executable code (gadgets) ending in `ret` to bypass NX protections.

## Objects and methods used

- **strcpy**
  - *What it is:* A C standard library function that copies a null-terminated string into a destination buffer.
  - *Implementation:* `char *strcpy(char *dest, const char *src);`
  - *Its use:* Used in vulnerable code to demonstrate how a lack of bounds checking leads to buffer overflows.
  - *Type:* A standard library function.
  - *Responsibility:* Copies bytes from a source address to a destination address until a null byte is encountered.
  - *Depends on:* Expects the destination buffer to be large enough to hold the source string plus the null terminator.
  - *Connects to:* Called by user code, returns a pointer to the destination string.
  - *Shape:* A fundamental string manipulation utility in C, widely known for its lack of safety.

- **execve**
  - *What it is:* A system call that executes a program pointed to by filename.
  - *Implementation:* syscall number 59 in x86-64.
  - *Its use:* The ultimate target of our shellcode payload to spawn `/bin/sh`.
  - *Type:* A system call.
  - *Responsibility:* Replaces the current process image with a new process image.
  - *Depends on:* A valid path to an executable and properly formatted argument arrays.
  - *Connects to:* Transitions from user space to kernel space to execute the new program.
  - *Shape:* The primary mechanism for program execution in Unix-like systems.

- **__stack_chk_fail**
  - *What it is:* A compiler-inserted runtime function called when a stack canary validation fails.
  - *Implementation:* `void __stack_chk_fail(void);`
  - *Its use:* Triggers program abortion when a buffer overflow is detected via a corrupted canary.
  - *Type:* An internal runtime library function.
  - *Responsibility:* Safely terminates a process that has suffered a detected stack overflow.
  - *Depends on:* The stack canary value not matching the expected `__stack_chk_guard`.
  - *Connects to:* Called by the function epilogue; ultimately calls `abort()`.
  - *Shape:* A critical safety backstop injected invisibly by the compiler.

## Concept Unit: Stack smashing — the classic buffer overflow

### The Problem
How can a program be tricked into executing a function it was never meant to call? What happens if you try to write 24 bytes into a 16-byte array? Where does the extra data go on the call stack?

### Introduce the concept in isolation
We can observe how a buffer overflow overwrites memory adjacent to our buffer, specifically targeting the saved return address.

```c
#include <string.h>
#include <stdio.h>

void vulnerable_demo(char *input) {
    char buf[16];
    strcpy(buf, input);
}
```
Writing more than 16 bytes here proves that C does not perform automatic bounds checking, allowing data to spill into the saved `%rbp` and `%rip` on the stack.

### Discard the throwaway
This code is discarded and will not be used in the final project.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson with no running project.

### The New Code
```c
#include <string.h>
#include <stdio.h>

void vulnerable(char *input) {
    char buf[16];
    strcpy(buf, input);
    printf("buf: %s\n", buf);
}

void secret(void) {
    printf("SECRET FUNCTION REACHED!\n");
}

int main(void) {
    char safe_input[] = "hello";
    vulnerable(safe_input);
    return 0;
}
```

### The Updated Project
```c
1: #include <string.h>
2: #include <stdio.h>
3: 
4: void vulnerable(char *input) { // <- new
5:     char buf[16];              // <- new
6:     strcpy(buf, input);        // <- new
7:     printf("buf: %s\n", buf);  // <- new
8: }                              // <- new
9: 
10: void secret(void) {            // <- new
11:     printf("SECRET FUNCTION REACHED!\n"); // <- new
12: }                              // <- new
13: 
14: int main(void) {               // <- new
15:     char safe_input[] = "hello"; // <- new
16:     vulnerable(safe_input);      // <- new
17:     return 0;                    // <- new
18: }                              // <- new
```
This represents our vulnerable program structure where user input can directly manipulate control flow.

### Mechanical walkthrough
- `void vulnerable(char *input)`: Defines a function taking a string pointer.
- `char buf[16];`: Allocates 16 bytes on the local stack frame.
- `strcpy(buf, input);`: Copies characters from `input` to `buf` until it hits a null byte, regardless of `buf`'s size.
- `printf("buf: %s\n", buf);`: Prints the copied buffer.
- `void secret(void)`: A function that is never legitimately called by `main`.
- `char safe_input[] = "hello";`: A legitimate 5-byte string.

### CS lens
**Memory Corruption.** This fundamental CS concept appears whenever software allows data bounds to be exceeded. It is seen in network packet parsing, file format decoding, and string manipulation libraries.

### SE lens
**Input Validation.** The design principle of never trusting user data. The alternative not chosen was explicitly tracking array lengths. The real tradeoff is the performance overhead of manual bounds checking versus system security.

### Commands needed
`gcc -fno-stack-protector -z execstack -no-pie vuln.c -o vuln`

### Run it
The program successfully prints "buf: hello" and returns gracefully. If provided with a 32-byte malicious input, it would jump to `secret()`.

### One sentence connecting to previous unit
Understanding how the stack pointer and instruction pointer operate in Lesson 08 lays the foundation for exploiting this exact structure through stack smashing.

## Concept Unit: Shellcode injection — executing attacker data

### The Problem
What if we don't just want to call an existing function, but run our own arbitrary instructions? How can we force the CPU to execute data we provide?

### Introduce the concept in isolation
We construct machine code to perform an `execve` syscall, designed to avoid null bytes that would truncate our string copy.

```asm
    xor    %rax, %rax
    movb   $59, %al
    syscall
```
This proves that we can format raw assembly instructions into a continuous byte sequence that functions as a self-contained program.

### Discard the throwaway
This throwaway snippet is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson.

### The New Code
```asm
    xor    %rax, %rax          # rax = 0
    movb   $59, %al            # rax = 59 = __NR_execve
    lea    str(%rip), %rdi     # rdi = &"/bin/sh\0"
    xor    %rsi, %rsi          # rsi = NULL (argv)
    xor    %rdx, %rdx          # rdx = NULL (envp)
    syscall                    # execve("/bin/sh", NULL, NULL)
str:
    .string "/bin/sh"
```

### The Updated Project
```asm
1:     xor    %rax, %rax          # <- new
2:     movb   $59, %al            # <- new
3:     lea    str(%rip), %rdi     # <- new
4:     xor    %rsi, %rsi          # <- new
5:     xor    %rdx, %rdx          # <- new
6:     syscall                    # <- new
7: str:                           # <- new
8:     .string "/bin/sh"          # <- new
```
This is the malicious payload that will be written into the buffer.

### Mechanical walkthrough
- `xor %rax, %rax`: Clears the `%rax` register to zero, avoiding null bytes in the assembled machine code.
- `movb $59, %al`: Moves the syscall number for `execve` (59) into the lowest byte of `%rax`.
- `lea str(%rip), %rdi`: Loads the effective address of our string into `%rdi` using instruction-pointer relative addressing.
- `xor %rsi, %rsi`: Clears `%rsi` to act as a NULL pointer for `argv`.
- `xor %rdx, %rdx`: Clears `%rdx` to act as a NULL pointer for `envp`.
- `syscall`: Triggers the software interrupt to jump to kernel mode.
- `.string "/bin/sh"`: The null-terminated path to the shell executable.

### CS lens
**Von Neumann Architecture.** The fundamental idea that code and data reside in the same memory space. The CPU cannot inherently tell the difference between a compiled instruction and user input. This appears in JIT compilation, bootloaders, and firmware updates.

### SE lens
**Principle of Least Privilege.** The alternative not chosen was strictly separating memory segments for execution. The real tradeoff is architectural simplicity versus allowing arbitrary data to become executable code.

### Commands needed
None

### Run it
When control flow is redirected to this byte sequence, the CPU transitions to kernel mode and replaces the process with a `/bin/sh` shell.

### One sentence connecting to previous unit
While the buffer overflow provides the entry point to overwrite the return address, shellcode is the payload that leverages that control to do meaningful damage.

## Concept Unit: Defense 1 — Stack canaries (SSP)

### The Problem
How can the program detect that a buffer overflow has occurred before it uses a corrupted return address? If we cannot stop the overflow itself, can we catch the tampering?

### Introduce the concept in isolation
We place a random value on the stack and check if it has changed before returning.

```c
long canary = __stack_chk_guard;
/* ... risky operation ... */
if (canary != __stack_chk_guard) {
    __stack_chk_fail();
}
```
This proves that any linear buffer overflow will inevitably trample over our guard value, allowing us to detect the intrusion before `%rip` is popped.

### Discard the throwaway
This conceptual snippet is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson.

### The New Code
```c
void protected_vulnerable(char *input) {
    long canary = __stack_chk_guard;
    char buf[16];

    strcpy(buf, input);
    printf("buf: %s\n", buf);

    if (canary != __stack_chk_guard) {
        __stack_chk_fail();
    }
}
```

### The Updated Project
```c
1: void protected_vulnerable(char *input) { // <- new
2:     long canary = __stack_chk_guard;     // <- new
3:     char buf[16];                        // <- new
4:                                          // <- new
5:     strcpy(buf, input);                  // <- new
6:     printf("buf: %s\n", buf);            // <- new
7:                                          // <- new
8:     if (canary != __stack_chk_guard) {   // <- new
9:         __stack_chk_fail();              // <- new
10:     }                                    // <- new
11: }                                        // <- new
```
This represents what the compiler generates automatically when stack protections are enabled.

### Mechanical walkthrough
- `long canary = __stack_chk_guard;`: Fetches a random 8-byte value from thread-local storage and places it on the stack.
- `char buf[16];`: Allocates the buffer below the canary in memory.
- `strcpy(buf, input);`: The potentially dangerous memory copy.
- `if (canary != __stack_chk_guard)`: Checks if the canary value has been altered during the function's execution.
- `__stack_chk_fail();`: Aborts the program if the canary was corrupted.

### CS lens
**Integrity Checking.** A core CS concept used to verify that data has not been maliciously or accidentally altered. Appears in checksums, cryptographic hashes, and ECC memory.

### SE lens
**Fail-Safe Defaults.** The design principle of failing securely when something goes wrong. The alternative not chosen was continuing execution with corrupted state. The real tradeoff is crashing the application securely versus allowing a potential remote code execution vulnerability.

### Commands needed
`gcc -fstack-protector-strong prog.c -o prog`
`checksec --file=prog`

### Run it
An overflow attempt will print "*** stack smashing detected ***" to standard error and immediately abort the process, preventing the hijack.

### One sentence connecting to previous unit
Stack canaries prevent the naive shellcode injection we just explored by ensuring the return address cannot be overwritten without detection.

## Concept Unit: Defense 2 — ASLR (Address Space Layout Randomization)

### The Problem
If an attacker somehow bypasses the canary, they still need to know exactly where their shellcode is stored in memory. How can we make the memory layout unpredictable?

### Introduce the concept in isolation
We print the addresses of variables to see where they live.

```c
#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int local;
    printf("stack: %p\n", (void*)&local);
    return 0;
}
```
Running this multiple times proves that the operating system places the stack at a completely different address on every execution.

### Discard the throwaway
This snippet is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson.

### The New Code
```c
#include <stdio.h>
#include <stdlib.h>

int global;

int main(void) {
    int local;
    void *heap = malloc(8);
    printf("stack:  %p\n", (void*)&local);
    printf("heap:   %p\n", heap);
    printf("global: %p\n", (void*)&global);
    printf("main:   %p\n", (void*)main);
    free(heap);
    return 0;
}
```

### The Updated Project
```c
1: #include <stdio.h>
2: #include <stdlib.h>
3: 
4: int global;                                // <- new
5: 
6: int main(void) {                           // <- new
7:     int local;                             // <- new
8:     void *heap = malloc(8);                // <- new
9:     printf("stack:  %p\n", (void*)&local); // <- new
10:     printf("heap:   %p\n", heap);          // <- new
11:     printf("global: %p\n", (void*)&global);// <- new
12:     printf("main:   %p\n", (void*)main);   // <- new
13:     free(heap);                            // <- new
14:     return 0;                              // <- new
15: }                                          // <- new
```
This shows how every segment of memory is dynamic and unpredictable.

### Mechanical walkthrough
- `int global;`: A variable in the `.data` segment, randomized via PIE.
- `int local;`: A variable on the stack segment, randomized by the OS.
- `void *heap = malloc(8);`: Memory in the heap segment, randomized by the allocator and OS.
- `printf(...)`: Prints the raw memory address pointers.
- `free(heap);`: Frees the allocated heap memory.

### CS lens
**Non-Determinism for Security.** Leveraging randomness to defeat attacks that rely on hardcoded environmental assumptions. Appears in TCP sequence number randomization, randomized hash seeds, and temporary file naming.

### SE lens
**Defense in Depth.** The design principle of layering multiple independent mitigations. The alternative not chosen was relying entirely on developers writing safe C code. The real tradeoff is added complexity in debugging core dumps due to shifting memory layouts.

### Commands needed
`gcc -pie -fPIE prog.c`

### Run it
First run: stack `0x7fff6a2b1c00`, heap `0x55a34b20f260`, main `0x55a34b0011f0`. Second run: stack `0x7ffd12345600`, heap `0x561a2c3d4270`, main `0x561a2c2021f0`. The attacker cannot hardcode a return address.

### One sentence connecting to previous unit
Even if a canary is bypassed via an information leak, ASLR guarantees the attacker still cannot blindly jump to their injected shellcode.

## Concept Unit: Defense 3 — NX (Non-Executable Stack) and ROP

### The Problem
If the attacker manages to find their shellcode despite ASLR, how can we prevent the CPU from running it altogether? And how do attackers bypass this prevention using existing code?

### Introduce the concept in isolation
We explore Return-Oriented Programming (ROP) gadgets, which are tiny pieces of existing code ending in a return instruction.

```asm
pop %rdi
ret
```
This proves that by manipulating the stack, we can chain together harmless snippets of libc into a malicious payload without injecting any new code.

### Discard the throwaway
This snippet is explicitly discarded.

### Project Change
No reference counterpart — this is a standalone theory lesson.

### The New Code
```asm
# Example gadgets (existing instructions in libc):
  pop %rdi; ret     # sets rdi to next stack value
  pop %rsi; ret     # sets rsi
  pop %rax; ret     # sets rax (syscall number)
  syscall; ret      # executes syscall

# Attacker's fake stack:
  # addr of syscall       <- final gadget
  # 59                    <- syscall number for execve (rax)
  # 0                     <- envp (rdx = 0)
  # 0                     <- argv (rsi = 0)
  # addr of /bin/sh       <- first arg (rdi)
  # addr: pop rdi; ret    <- first gadget
  # addr: pop rax; ret    <- second gadget
```

### The Updated Project
```asm
1: # Example gadgets (existing instructions in libc): // <- new
2:   pop %rdi; ret     # sets rdi to next stack value // <- new
3:   pop %rsi; ret     # sets rsi                     // <- new
4:   pop %rax; ret     # sets rax (syscall number)    // <- new
5:   syscall; ret      # executes syscall             // <- new
6:                                                    // <- new
7: # Attacker's fake stack:                           // <- new
8:   # addr of syscall       <- final gadget          // <- new
9:   # 59                    <- syscall number (rax)  // <- new
10:   # 0                     <- envp (rdx = 0)       // <- new
11:   # 0                     <- argv (rsi = 0)       // <- new
12:   # addr of /bin/sh       <- first arg (rdi)      // <- new
13:   # addr: pop rdi; ret    <- first gadget         // <- new
14:   # addr: pop rax; ret    <- second gadget        // <- new
```
This represents a ROP chain structure built entirely out of valid, executable `.text` segment pointers.

### Mechanical walkthrough
- `pop %rdi; ret`: A gadget that pops the top of the stack into `%rdi`, then returns to the *next* address on the stack.
- `pop %rsi; ret`: Pops the stack into `%rsi`.
- `pop %rax; ret`: Pops the stack into `%rax`.
- `syscall; ret`: Executes the system call using the registers we just populated.
- `addr of /bin/sh`: A data pointer placed on the stack that will be consumed by the `pop %rdi` gadget.
- `59`: The literal integer placed on the stack consumed by the `pop %rax` gadget.

### CS lens
**Turing Completeness via Borrowed Code.** The insight that any sufficiently large binary contains enough functional fragments to perform arbitrary computation if stitched together. Appears in weird machines, fault injection, and code reuse attacks.

### SE lens
**W^X (Write XOR Execute).** The design principle that memory pages should be either writable or executable, but never both simultaneously. The alternative not chosen was allowing dynamic self-modifying code freely. The tradeoff is preventing JIT compilation from working trivially without explicit permission management.

### Commands needed
`checksec --file=./program`

### Run it
The NX bit is enabled, marking the stack non-executable. The ROP chain bypasses this by executing code already present in libc, successfully popping the shell.

### One sentence connecting to previous unit
NX kills traditional shellcode injection outright, forcing attackers to weaponize the ASLR-randomized layout via ROP chains to achieve execution.

## Closing

### Connect the pieces
A complete stack smash attack begins by providing input that exceeds a buffer's bounds. To survive, the attacker must first leak the stack canary to avoid `__stack_chk_fail` aborting the program. Because ASLR randomizes the memory layout, the attacker must also leak a base pointer to calculate where libc is loaded. Since the NX bit prevents executing shellcode directly off the stack, the attacker crafts a ROP chain — a precise sequence of addresses pointing to `pop` and `syscall` gadgets inside libc, interleaved with payload data. They overwrite the canary with its true value, and the saved `%rip` with the address of their first gadget. When the vulnerable function returns, the CPU seamlessly begins executing the ROP chain, yielding a shell. Every defense (canary, ASLR, NX) raises the cost of exploitation by one level, and attackers respond with techniques (leak, brute-force, ROP) that restore that cost — security is an arms race, not a solved problem.
