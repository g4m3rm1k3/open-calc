# Lesson 08: Procedures — The Call Stack, Stack Frames, and Calling Conventions

**Series**: Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module**: Module 1 — From C to Machine
**Language**: C and x86-64 assembly (AT&T syntax). Trace by hand.

## What you need to know first
Lessons 00–07 (tour, C, bits, integers, floats, pipeline, registers, control flow).

## What you will build
The reader will understand exactly how function calls work at the machine level: how arguments are passed, how the stack frame is allocated and deallocated, how the return address is saved and restored, and what makes the System V AMD64 ABI (the calling convention) work. The transferable insight: a function call is not magic — it is a precise sequence of push/call/return instructions that build and tear down stack frames. Buffer overflows work by corrupting the return address on the stack.

## Objects and Methods

### `%rsp`
- **What it is**: The stack pointer register.
- **Implementation**: Hardware register on the CPU.
- **Its use**: Points to the top of the stack (the lowest memory address currently in use).
- **Type**: 64-bit register.
- **Responsibility**: Tracks the current boundary of the stack.
- **Depends on**: Updated by `push`, `pop`, `call`, `ret`, and manual arithmetic.
- **Connects to**: Memory subsystem (stack region).
- **Shape**: A 64-bit integer representing a memory address.

### The Stack
- **What it is**: A region of memory used for function calls and local variables.
- **Implementation**: RAM allocated by the OS for a process.
- **Its use**: Stores return addresses, saved registers, local variables, and extra arguments.
- **Type**: LIFO (Last-In, First-Out) data structure in memory.
- **Responsibility**: Provides isolation and storage for individual function invocations.
- **Depends on**: `%rsp` to track its top.
- **Connects to**: The execution model of procedural programming.
- **Shape**: Grows downward from high memory addresses to low memory addresses.

## Concept Units

### 1. The stack — layout and rsp

A throwaway lab to demonstrate this concept:
```c
// We will explore stack operations mentally using assembly.
```
This is an introductory look.

The stack is a region of memory that grows DOWNWARD (toward lower addresses) on x86-64. `%rsp` (the stack pointer) always points to the TOP of the stack (the LOWEST address currently in use).

```asm
# push src: rsp -= 8; Mem[rsp] = src
    pushq %rax           # rsp decremented by 8, then rax written to Mem[rsp]
```
The stack has just grown by 8 bytes.

```asm
# pop dest: dest = Mem[rsp]; rsp += 8
    popq  %rbx           # rbx = Mem[rsp], then rsp incremented by 8
```
The stack has shrunk by 8 bytes.

Stack layout diagram (addresses grow downward on the page = higher addresses at top):
```
High addresses (top of diagram)
  0x7fff8000:  [previous frame data]
  0x7fff7ff8:  [previous frame data]    <- old rsp before any pushes
  0x7fff7ff0:  [rax value]              <- after first pushq %rax, rsp here
  0x7fff7fe8:  [rbx value]              <- after second pushq %rbx, rsp here
Low addresses (stack grows this way)
```

Full trace of two pushes and two pops:
- Initial state: `%rsp` = `0x7fff7ff8`
- `pushq %rax` (assume `%rax` = 10): `%rsp` becomes `0x7fff7ff0`, memory at `0x7fff7ff0` holds 10.
- `pushq %rbx` (assume `%rbx` = 20): `%rsp` becomes `0x7fff7fe8`, memory at `0x7fff7fe8` holds 20.
- `popq %rcx`: `%rcx` gets 20, `%rsp` becomes `0x7fff7ff0`.
- `popq %rdx`: `%rdx` gets 10, `%rsp` becomes `0x7fff7ff8`.

### 2. The System V AMD64 calling convention (ABI)

A throwaway lab to demonstrate this concept:
```c
// We will look at argument passing.
```
This prepares us for the ABI rules.

Argument passing:
- Arguments 1–6 (integer/pointer): `%rdi`, `%rsi`, `%rdx`, `%rcx`, `%r8`, `%r9`
- Arguments 7+: pushed on the stack (rightmost argument pushed first)
- Return value: `%rax` (or `%rdx:%rax` for 128-bit values)

```c
/* C call: result = add6(1, 2, 3, 4, 5, 6, 7, 8); */
```
This C code translates to the following assembly:

```asm
/* In the caller: */
    movq  $8, 8(%rsp)    /* 8th arg on stack (already allocated) */
    movq  $7,  (%rsp)    /* 7th arg on stack */
    movq  $6, %r9        /* 6th arg */
    movq  $5, %r8        /* 5th arg */
    movq  $4, %rcx       /* 4th arg */
    movq  $3, %rdx       /* 3rd arg */
    movq  $2, %rsi       /* 2nd arg */
    movq  $1, %rdi       /* 1st arg */
    call  add6
    /* return value in %rax */
```
Full trace: The caller must allocate stack space for arguments 7+ BEFORE the call. It writes 8 to `8(%rsp)` and 7 to `(%rsp)`. Registers are populated with 1 to 6. Then `call` is executed.

### 3. call and ret — the mechanism

A throwaway lab to demonstrate this concept:
```asm
# We will simulate a call and return.
```
This introduces the mechanics of function invocation.

```asm
# call target:
#   1. Push return address (address of next instruction after call)
#   2. Jump to target

# ret:
#   1. Pop return address from stack into PC
#   2. Jump to that address

# Example:
    movq  $42, %rdi      # arg1 = 42
    call  square         # push rip, jmp square
```
We setup the argument and make the call.

```asm
    movq  %rax, %rbx    # rbx = return value (execution resumes here)

square:
    imulq %rdi, %rdi    # rdi = rdi * rdi = 1764
    movq  %rdi, %rax    # rax = 1764
    ret                  # pop return address, jump to caller
```
Full stack trace:
- Before call: `rsp` = `0x7fff7ff8`
- `call square`: push `0x...nextinstr` onto stack, `rsp` = `0x7fff7ff0`, jump to `square`
- Inside `square`: `rax` = 1764
- `ret`: pop `0x...nextinstr` from stack, `rsp` = `0x7fff7ff8`, jump to `nextinstr`
- After `ret`: `rbx` = 1764, `rsp` back to original value

### 4. Stack frame layout

A throwaway lab to demonstrate this concept:
```c
// We will look at a full function with locals.
```
This prepares us for the full frame.

A full stack frame contains (from high address to low):
```
[Previous frame]          <- higher addresses
[7th arg, 8th arg, ...] <- pushed by caller (if > 6 args)
[return address]         <- pushed by call instruction
[saved %rbp]             <- pushed by callee (if using frame pointer)
[local variables]        <- allocated by subtracting from rsp
[saved callee registers] <- if callee uses rbx, r12-r15
                           <- rsp points here (lowest address in frame)
```

C function with local variables:
```c
long swap_and_add(long *xp, long *yp)
{
    long x = *xp;
    long y = *yp;
    *xp = y;
    *yp = x;
    return x + y;
}
```
This maps to:

```asm
swap_and_add:
    movq  (%rdi), %rax   # rax = *xp = x
    movq  (%rsi), %rdx   # rdx = *yp = y
    movq  %rdx, (%rdi)   # *xp = y
    movq  %rax, (%rsi)   # *yp = x
    addq  %rdx, %rax     # rax = x + y
    ret
```
Full trace with `xp` pointing to value 10 and `yp` pointing to value 20:
- `rax` = 10
- `rdx` = 20
- `Mem[xp]` = 20
- `Mem[yp]` = 10
- `rax` = 30
- Return 30.

### 5. Caller-saved vs callee-saved registers

A throwaway lab to demonstrate this concept:
```asm
# Demonstrating register preservation.
```
This shows how we keep values safe across calls.

Callee-saved (callee must preserve): `%rbx`, `%rbp`, `%r12`, `%r13`, `%r14`, `%r15`
-> If the callee wants to use these, it must push them at the start and pop them at the end.

Caller-saved (caller must save if needed): all others (`%rax`, `%rcx`, `%rdx`, `%rsi`, `%rdi`, `%r8`, `%r9`, `%r10`, `%r11`)
-> The callee can overwrite these freely.
-> If the caller needs their value after the call, it must save them first.

```asm
# A callee that uses %rbx must save and restore it:
func:
    pushq %rbx           # save rbx (callee-saved)
    movq  %rdi, %rbx     # use rbx to hold first arg
    call  helper         # helper may clobber rdi, rsi, rax, etc.
```
Here we use the callee-saved register safely.

```asm
    addq  %rbx, %rax     # rax += rbx (rbx still has original first arg)
    popq  %rbx           # restore rbx
    ret
```
Full trace. The callee-saved convention is what lets you call a function and trust that `%rbx`, `%rbp`, `%r12–15` have the same values afterward.

### 6. Recursion on the stack

A throwaway lab to demonstrate this concept:
```c
// We will look at a recursive function.
```
This demonstrates multiple frames of the same function.

```c
long factorial(long n)
{
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```
Assembly equivalent:

```asm
factorial:
    cmpq  $1, %rdi         # compare n with 1
    jle   .L_base          # if n <= 1, go to base case
    pushq %rbx             # save rbx (callee-saved)
    movq  %rdi, %rbx       # rbx = n (save n across recursive call)
    leaq  -1(%rdi), %rdi   # rdi = n - 1
    call  factorial        # recursive call: rax = factorial(n-1)
```
After the recursive call returns:

```asm
    imulq %rbx, %rax       # rax = n * factorial(n-1)
    popq  %rbx             # restore rbx
    ret
.L_base:
    movq  $1, %rax         # return 1
    ret
```

Full stack trace for `factorial(3)`:
- Call `factorial(3)`: push return addr, `rsp-=8`
  - `rbx=3`, call `factorial(2)`: push return addr, `rsp-=8`
    - `rbx=2`, call `factorial(1)`: push return addr, `rsp-=8`
      - `n=1`, `jle` taken, `rax=1`, `ret` (pop return addr, `rsp+=8`)
    - `rax` = 2*1 = 2, pop `rbx`, `ret` (`rsp+=8`)
  - `rax` = 3*2 = 6, pop `rbx`, `ret` (`rsp+=8`)
- Final: `rax` = 6

### 7. The prologue and epilogue of a full function

A throwaway lab to demonstrate this concept:
```c
// A complete function setup.
```
This shows the frame pointer in action.

A complete function with a frame pointer (`%rbp`):
```asm
full_function:
    /* Prologue */
    pushq  %rbp              # save caller's frame pointer
    movq   %rsp, %rbp        # rbp = rsp (establish our frame pointer)
    subq   $32, %rsp         # allocate 32 bytes for local variables
    pushq  %rbx              # save callee-saved register
```
The prologue sets up the frame.

```asm
    /* Body: local var at -8(%rbp), -16(%rbp), -24(%rbp), -32(%rbp) */
    movq   %rdi, -8(%rbp)    # store first arg as local variable
    movq   $0,  -16(%rbp)    # local variable = 0

    /* Epilogue */
    popq   %rbx              # restore callee-saved register
    movq   %rbp, %rsp        # deallocate locals (rsp = rbp)
    popq   %rbp              # restore caller's frame pointer
    ret                      # return
```
Full memory layout showing `rsp` and `rbp` at each step. The frame pointer `%rbp` creates a stable base for accessing local variables even if `%rsp` moves (e.g., during nested alloca calls). Modern optimized code (`-O2`) often omits the frame pointer (`-fomit-frame-pointer`) and accesses locals relative to `%rsp` directly.

## Closing
You now understand exactly how function calls work at the machine level. This knowledge is the foundation for understanding buffer overflows (Lesson 11) — an attacker corrupts the return address on the stack. Lesson 09 covers arrays and structs in memory.

### Exercises
1. Draw the stack for a call to `f(1, 2, 3, 4, 5, 6, 7)` and show where the 7th argument lives.
2. Explain why the stack grows downward.
3. Trace `factorial(4)` on the stack showing each frame.
