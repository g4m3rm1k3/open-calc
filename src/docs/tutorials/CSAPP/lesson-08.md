# Lesson 08: Procedures and the Call Stack — Stack Frames, Calling Conventions, and Recursion

The reader will understand the x86-64 call stack: how `%rsp` moves, what a stack frame contains, how the `call`/`ret` instructions work, the System V AMD64 ABI calling convention (which registers hold arguments, return values, and who saves what), and how recursion creates a chain of frames. The transferable insight: the call stack is a data structure, specifically a LIFO stack of activation records. Every function call pushes a frame; every return pops it. Stack overflows, buffer overflows, and stack-based attacks all exploit the structure of this stack.

**What you need to know first:** Lessons 00-07.

### Terms used in this lesson

- **Stack** — A Last-In, First-Out (LIFO) data structure used to temporarily store data. It solves the problem of needing to save state (like local variables and return addresses) in a nested, recursive manner where the most recently saved state is the first one needed to be retrieved.
- **Call Stack** — The specific stack maintained by the runtime environment and CPU to keep track of active subroutines (functions/procedures). It exists so that a program can suspend one function, execute another, and then resume the first one exactly where it left off.
- **Stack Frame** — An activation record pushed onto the call stack for a single function call. It exists to hold all the local state (arguments, local variables, saved registers, return address) that a single invocation of a function needs to operate independently of other invocations.
- **`%rsp` (Stack Pointer)** — The hardware register that holds the memory address of the current top of the stack. It exists because the CPU and runtime need a definitive, constantly updated pointer to know where the next push should write data or the next pop should read it from.
- **`%rbp` (Frame Pointer)** — The hardware register conventionally used to point to the base (start) of the current stack frame. It exists to provide a stable reference point for accessing local variables and arguments, even if the stack pointer (`%rsp`) moves during function execution.
- **Calling Convention** — A standardized set of rules governing how functions invoke each other. It solves the problem of interoperability by dictating exactly how arguments are passed, how return values are handed back, and which registers must be preserved across a call.
- **System V AMD64 ABI** — The specific calling convention used on Linux, macOS, and other Unix-like systems for x86-64 processors. It exists to provide a binary interface standard so that code compiled by different compilers (or written in assembly) can seamlessly call each other.
- **Recursion** — A programming technique where a function calls itself. It exists to solve problems that can be broken down into smaller, identical subproblems, relying on the call stack to keep track of the state of each active subproblem.
- **LIFO** — Last-In, First-Out, the defining property of a stack. It exists because the last function called must be the first one to finish and return before the caller can resume.

### Objects and methods used

- **`call`**
  - *What it is:* A hardware instruction to invoke a procedure.
  - *Implementation:* `call target` (or `call *%register`)
  - *Its use:* Used to transfer control to a function while saving the way back.
  - *Type:* CPU instruction
  - *Responsibility:* Pushes the address of the next instruction (the return address) onto the stack, and then jumps to the target address.
  - *Depends on:* `%rsp` (determines where the return address is pushed).
  - *Connects to:* The target procedure being invoked.
  - *Shape:* Control flow instruction at the boundary between caller and callee.
- **`ret`**
  - *What it is:* A hardware instruction to return from a procedure.
  - *Implementation:* `ret`
  - *Its use:* Used at the end of a function to go back to the caller.
  - *Type:* CPU instruction
  - *Responsibility:* Pops a return address off the stack into the instruction pointer (`%rip`), transferring control back to the caller.
  - *Depends on:* `%rsp` (must point exactly to the stored return address).
  - *Connects to:* The caller's instruction immediately following the `call`.
  - *Shape:* Control flow instruction at the exit boundary of a callee.
- **`pushq`**
  - *What it is:* A hardware instruction to push a 64-bit value onto the stack.
  - *Implementation:* `pushq %reg` or `pushq $imm`
  - *Its use:* Used to save registers, pass arguments, or allocate space.
  - *Type:* CPU instruction
  - *Responsibility:* Decrements `%rsp` by 8, then writes the operand to the new address at `%rsp`.
  - *Depends on:* `%rsp` (the current stack top).
  - *Connects to:* Memory at the stack segment.
  - *Shape:* Stack manipulation instruction.
- **`popq`**
  - *What it is:* A hardware instruction to pop a 64-bit value off the stack.
  - *Implementation:* `popq %reg`
  - *Its use:* Used to restore saved registers or clean up the stack.
  - *Type:* CPU instruction
  - *Responsibility:* Reads the 64-bit value at `%rsp` into the destination operand, then increments `%rsp` by 8.
  - *Depends on:* `%rsp` (must point to the valid data to restore).
  - *Connects to:* Memory at the stack segment and the destination register.
  - *Shape:* Stack manipulation instruction.
- **`leave`**
  - *What it is:* A hardware instruction that tears down a stack frame.
  - *Implementation:* `leave`
  - *Its use:* Used in function epilogues to quickly restore `%rsp` and `%rbp`.
  - *Type:* CPU instruction
  - *Responsibility:* Equivalent to `movq %rbp, %rsp` followed by `popq %rbp`. Restores the stack and frame pointers to the caller's state.
  - *Depends on:* `%rbp` correctly pointing to the saved base pointer, and `%rsp` being valid.
  - *Connects to:* The caller's stack frame state.
  - *Shape:* Stack frame teardown instruction.
- **`printf`**
  - *What it is:* A standard C library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used here to print memory addresses and demonstrate execution traces.
  - *Type:* C standard library function
  - *Responsibility:* Formats data according to a format string and writes it to standard output.
  - *Depends on:* The System V AMD64 ABI for variable arguments (e.g., `%al` indicating vector register count).
  - *Connects to:* Standard output (stdout).
  - *Shape:* Library call providing external observability.

## Concept Unit: The stack and %rsp — the runtime stack

### The Problem

When a program runs, it needs a place to store local variables that are only active while a function is executing. Where should these variables live in memory? If we allocate fixed addresses for them at compile time, what happens if the function calls itself recursively? We need a memory region that can dynamically grow and shrink as functions are called and as they return.

### Introduce the concept in isolation

```c
#include <stdio.h>

void show_stack_addresses(void) {
    int a = 1;   /* lower address than b (stack grows down) */
    int b = 2;
    int c = 3;
    printf("&a = %p\n", (void*)&a);  /* highest address */
    printf("&b = %p\n", (void*)&b);  /* 4 bytes below &a */
    printf("&c = %p\n", (void*)&c);  /* 4 bytes below &b */
    /* &a > &b > &c: variables pushed in order, stack grows down */
}

int main(void) {
    show_stack_addresses();
    return 0;
}
```

*Output predicted confidently based on x86-64 stack layout:*
```text
&a = 0x7ffd12345010
&b = 0x7ffd1234500c
&c = 0x7ffd12345008
```
This proves that the runtime stack grows DOWN in memory (toward lower addresses). The compiler allocates locals on the stack by decrementing `%rsp`. The variable `a` is at the highest address, `b` is 4 bytes below it, and `c` is 4 bytes below `b`.

### Discard the throwaway

This throwaway C code is discarded; it exists only to prove the downward-growing nature of the stack and is not part of the open-calc project.

### Project Change

- **Reference Source:** None — this is a from-scratch standalone theory unit.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** None.

### The New Code

```c
void show_stack_addresses(void) {
    int a = 1;
    int b = 2;
    int c = 3;
}
```

### The Updated Project

```c
1: void show_stack_addresses(void) {
2:     int a = 1; // ← new
3:     int b = 2; // ← new
4:     int c = 3; // ← new
5: }
```
The variables `a`, `b`, and `c` are allocated in the stack frame for `show_stack_addresses`.

### Mechanical walkthrough

- `void` - Defines the return type of the function; here, it returns nothing.
- `show_stack_addresses` - The name of the function.
- `(void)` - The parameter list; here, it accepts no arguments.
- `{` - Opens the body of the function.
- `int` - A 32-bit signed integer type in C.
- `a` - A local variable identifier.
- `=` - The assignment operator, placing a value into the variable.
- `1` - An integer literal.
- `;` - Terminates the C statement.
- `int b = 2;` - Allocates another 32-bit integer, physically placed at a lower memory address than `a`.
- `int c = 3;` - Allocates a third 32-bit integer, placed at a lower address than `b`.
- `}` - Closes the function body, which implicitly acts as the destruction point for these locals as the stack shrinks.

### CS lens

The stack is a **Last-In, First-Out (LIFO)** data structure. This is a fundamental CS concept because it matches the semantics of nested function execution: the most recently called function must be the first one to return. Real-world places it appears: undo history in text editors, browser history (back button), syntax parsing (matching parentheses).

### SE lens

The principle is **dynamic memory allocation tied to scope**. The alternative not chosen is static allocation (like global variables). The real tradeoff: static allocation is fast and simple but prohibits recursion and reentrancy; stack allocation allows recursion and uses memory only when the function is active, but risks stack overflow if the nesting gets too deep.

### Commands needed

`None for this unit.`

### Run it

*Predicted confidently:* The addresses printed will decrease by 4 bytes (the size of an `int` in C) for each successive local variable, because the stack grows downwards towards lower addresses.

### One sentence connecting to previous unit

With the stack conceptually established as a downward-growing memory region, we now look at how the CPU actually instructs the stack to grow and shrink during function calls.

## Concept Unit: call and ret — the two stack instructions

### The Problem

How does the processor actually know where to return to when a function finishes executing? If `main` calls `foo`, how does `foo` know to jump back to `main`'s next instruction rather than somewhere else? We need a mechanism to remember the "return address" dynamically.

### Introduce the concept in isolation

```asm
# call target:
#   1. Push return address (address of NEXT instruction after call) onto stack
#   2. Jump to target

# ret:
#   1. Pop return address from stack into %rip
#   2. Jump to that address

main:
    # ... setup ...
    call   foo        # push addr_of_next_instr; jump to foo
    # <-- return address points here
    movl   %eax, %edi # use return value
    # ...
foo:
    # ... body ...
    movl   $42, %eax  # set return value
    ret               # pop return address; jump back to caller
```

```c
/* C to see the return address: */
#include <stdio.h>

void callee(void) {
    printf("inside callee\n");
}

int main(void) {
    printf("before call\n");
    callee();
    printf("after call\n");
    return 0;
}
```

*Output predicted confidently based on C execution:*
```text
before call
inside callee
after call
```
This proves that the `call` instruction pushed the address of the `after call` instruction onto the stack, and the `ret` instruction inside `callee` popped it and jumped to it, allowing execution to resume exactly where it left off.

### Discard the throwaway

This code is strictly throwaway and discarded; it exists to isolate the `call` and `ret` instructions.

### Project Change

- **Reference Source:** None — standalone theory.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** None.

### The New Code

```asm
    call   foo
    movl   %eax, %edi
foo:
    movl   $42, %eax
    ret
```

### The Updated Project

```asm
1:     call   foo           // ← new
2:     movl   %eax, %edi    // ← new
3: foo:                     // ← new
4:     movl   $42, %eax     // ← new
5:     ret                  // ← new
```
The caller uses `call` to invoke `foo`, and `foo` uses `ret` to return.

### Mechanical walkthrough

- `call` - The CPU instruction that pushes the return address and jumps.
- `foo` - The label representing the target memory address to jump to.
- `movl` - An instruction to move a 32-bit (long) value.
- `%eax` - The 32-bit register holding the return value.
- `,` - Separates operands in AT&T syntax.
- `%edi` - The destination register.
- `foo:` - A label defining the entry point of the procedure.
- `$42` - An immediate literal value of 42.
- `ret` - The CPU instruction that pops the return address into the instruction pointer `%rip` and jumps to it.

### CS lens

This is **control flow manipulation via the stack**. By storing the instruction pointer state on the stack, the CPU turns a simple jump into a subroutine invocation. This pattern is foundational for all procedural and object-oriented programming. Real-world analogues: leaving a bookmark in a book when you pause to read a dictionary definition, then returning to the bookmark.

### SE lens

The principle is **decoupling caller and callee**. The alternative not chosen is having the caller pass the return address in a fixed register. The real tradeoff: using the stack allows infinite nesting (up to memory limits) because each call gets its own return address slot on the stack, whereas a fixed register would be overwritten on a nested call.

### Commands needed

`None for this unit.`

### Run it

*Predicted confidently:* The instruction pointer `%rip` will jump to `foo`, `%eax` will be set to 42, and `ret` will safely bounce execution back to `movl %eax, %edi`.

### One sentence connecting to previous unit

Now that we can jump to functions and return safely using the stack, we need a standard set of rules to agree on where arguments and return values go.

## Concept Unit: The x86-64 calling convention (System V AMD64 ABI)

### The Problem

If I write a function in assembly and you call it from C, how do I know where to look for the arguments you passed? If I want to return a value, where do I put it so you can find it? Without a strict standard, our code cannot interoperate.

### Introduce the concept in isolation

```asm
# Integer/pointer arguments in order:
# %rdi: 1st argument
# %rsi: 2nd argument
# %rdx: 3rd argument
# %rcx: 4th argument
# %r8:  5th argument
# %r9:  6th argument
# Beyond 6: pushed onto stack (caller's responsibility)

# Return value: %rax (integer/pointer)
```

```c
long add6(long a, long b, long c, long d, long e, long f) {
    return a + b + c + d + e + f;
}

long add7(long a, long b, long c, long d, long e, long f, long g) {
    return a + b + c + d + e + f + g;
}
```

*Output predicted confidently:*
In `add6(1,2,3,4,5,6)`: `rdi`=1, `rsi`=2, `rdx`=3, `rcx`=4, `r8`=5, `r9`=6. `rax` receives the sum (21). This proves that the first six arguments are passed in registers. For `add7`, the 7th argument `g` is pushed onto the stack by the caller because the registers are exhausted.

### Discard the throwaway

This code is discarded and will not be part of the final project.

### Project Change

- **Reference Source:** None.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** None.

### The New Code

```c
long add7(long a, long b, long c, long d, long e, long f, long g) {
    return a + b + c + d + e + f + g;
}
```

### The Updated Project

```c
1: long add7(long a, long b, long c, long d, long e, long f, long g) { // ← new
2:     return a + b + c + d + e + f + g;                               // ← new
3: }                                                                   // ← new
```
This function requires the caller to use the stack for the 7th argument.

### Mechanical walkthrough

- `long` - A 64-bit signed integer type.
- `add7` - The function name.
- `(long a, ...)` - The parameter list. The first six map to `%rdi, %rsi, %rdx, %rcx, %r8, %r9`.
- `long g` - The 7th argument, which the calling convention dictates must be pushed onto the stack.
- `return` - The statement that evaluates the expression and places the result in the `%rax` register according to the ABI.
- `a + b ... + g` - The arithmetic expression summing the values.
- `;` - Terminates the C statement.

### CS lens

This represents an **Application Binary Interface (ABI)**. It is a contract between software components at the machine code level. Real-world analogues: standardized shipping containers, standardized electrical plugs, standardized HTTP headers.

### SE lens

The principle is **standardized interoperability over raw performance**. The alternative not chosen is allowing custom calling conventions for every function. The real tradeoff: a standard ABI means compilers don't have to negotiate per-function rules, but it also means some functions might have to unnecessarily push variables to the stack if they exceed 6 arguments, even if other registers are technically free.

### Commands needed

`None for this unit.`

### Run it

*Predicted confidently:* Calling `add7` forces the caller to execute `pushq` for the 7th argument before executing `call`.

### One sentence connecting to previous unit

Because the calling convention specifies both registers and the stack for arguments, we must look at the total anatomy of a function's stack area: the stack frame.

## Concept Unit: Stack frames — complete frame layout

### The Problem

If a function needs to use registers like `%rbx` that the ABI says are "callee-saved" (meaning the caller expects them to remain unchanged), where does the function save them? If it needs to allocate local variables, how does it manage that space alongside the saved registers and the return address?

### Introduce the concept in isolation

```asm
func:
    # Prologue:
    pushq  %rbp             # save caller's frame pointer
    movq   %rsp, %rbp       # set frame pointer
    subq   $32, %rsp        # allocate 32 bytes for locals
    pushq  %rbx             # save callee-saved register

    # Body:
    movq   %rdi, -8(%rbp)   # use local variable

    # Epilogue:
    popq   %rbx             # restore callee-saved register
    movq   %rbp, %rsp       # deallocate locals
    popq   %rbp             # restore caller's frame pointer
    ret                     # return
```

*Output predicted confidently:*
This proves the lifecycle of a stack frame. The prologue sets up the new frame and saves the old one; the epilogue tears it down perfectly, restoring the stack exactly as it was before the call, thereby honoring the ABI.

### Discard the throwaway

This assembly snippet is discarded.

### Project Change

- **Reference Source:** None.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** None.

### The New Code

```asm
    pushq  %rbp
    movq   %rsp, %rbp
    subq   $32, %rsp
```

### The Updated Project

```asm
1: func:
2:     pushq  %rbp         // ← new
3:     movq   %rsp, %rbp   // ← new
4:     subq   $32, %rsp    // ← new
```
This is the standard function prologue that establishes a new stack frame.

### Mechanical walkthrough

- `func:` - The label for the function.
- `pushq` - Instruction to push a 64-bit value to the stack.
- `%rbp` - The base pointer register. Pushing it saves the caller's frame.
- `movq` - Instruction to move a 64-bit value.
- `%rsp, %rbp` - Copies the current stack pointer into the base pointer. This makes `%rbp` the anchor for the new frame.
- `subq` - Instruction to subtract a value.
- `$32, %rsp` - Subtracts 32 from the stack pointer, physically growing the stack downwards by 32 bytes to reserve space for local variables.

### CS lens

This is the creation of an **Activation Record**. It encapsulates the state of a single execution context. Real-world analogues: a dedicated workbench for a specific task, a fresh sheet of scratch paper for doing long division, an isolated sandbox environment.

### SE lens

The principle is **context isolation**. The alternative not chosen is having one global pool of memory for all variables. The real tradeoff: stack frames ensure functions don't clobber each other's data and naturally clean up after themselves, but allocating extremely large arrays on the stack can cause a stack overflow because the stack has a fixed maximum size enforced by the OS.

### Commands needed

`None for this unit.`

### Run it

*Predicted confidently:* `%rbp` will now point to the start of the frame, and `%rsp` will be exactly 32 bytes below it, creating a safe 32-byte region that the function can use freely via offsets like `-8(%rbp)`.

### One sentence connecting to previous unit

With the stack frame fully understood, we can see how this structure elegantly solves the problem of a function calling itself.

## Concept Unit: Recursion — the stack as a natural data structure

### The Problem

If a function computes a factorial by calling itself (`n * factorial(n - 1)`), how does the computer keep track of `n` across all the different invocations? If `factorial(3)` calls `factorial(2)`, doesn't `factorial(2)` overwrite `factorial(3)`'s variables?

### Introduce the concept in isolation

```c
#include <stdio.h>

long factorial(long n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main(void) {
    printf("5! = %ld\n", factorial(5));  /* 120 */
    return 0;
}
```

*Output predicted confidently:*
```text
5! = 120
```
This proves that each recursive call gets its own distinct stack frame. `factorial(5)` pushes a frame where `n=5`. That frame stays alive and suspended while `factorial(4)` pushes a new frame where `n=4`. They do not overwrite each other.

### Discard the throwaway

This factorial implementation is discarded.

### Project Change

- **Reference Source:** None.
- **Files affected:** None.
- **Change type:** Concept explanation.
- **Location:** Conceptual.
- **Dependencies:** None.

### The New Code

```c
long factorial(long n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

### The Updated Project

```c
1: long factorial(long n) {          // ← new
2:     if (n <= 1) return 1;         // ← new
3:     return n * factorial(n - 1);  // ← new
4: }                                 // ← new
```
This recursive function relies entirely on the stack frame mechanism to maintain distinct states.

### Mechanical walkthrough

- `long` - The return type.
- `factorial` - The function name.
- `(long n)` - The parameter list, where `n` will live in the stack frame or a register for this specific invocation.
- `if (n <= 1)` - The base case condition to stop the recursion.
- `return 1;` - Returns the value 1, triggering the popping of the current stack frame.
- `return n *` - The caller will multiply its own local `n` (safely preserved in its frame) by the result of the call.
- `factorial(n - 1);` - The recursive call, forcing the CPU to execute `call` and push a brand new return address and frame.

### CS lens

This is **Recursion**. It is a method of solving a problem where the solution depends on solutions to smaller instances of the same problem. Real-world analogues: fractals, Russian nesting dolls, directories containing subdirectories.

### SE lens

The principle is **declarative problem solving over iterative state management**. The alternative not chosen is using a `while` loop with an explicit accumulator. The real tradeoff: recursion is often much more readable and mathematically elegant, but it consumes $O(n)$ stack space compared to $O(1)$ for an iterative loop, risking stack overflows for large inputs.

### Commands needed

`None for this unit.`

### Run it

*Predicted confidently:* Calling `factorial(3)` will allocate 3 distinct stack frames before hitting the base case, and then pop them off one by one, unwinding to multiply $1 \times 2 \times 3 = 6$.

### One sentence connecting to previous unit

The stack frame makes recursion possible, but it is also the mechanism that makes stack smash attacks possible when arrays overflow their frame boundaries.

## Closing

### Connect the pieces

The call stack is the mechanism behind every function call, every recursion, and every stack smash attack. When we evaluate `factorial(3)`, we see the culmination of every concept in this lesson:
1. `main` executes `call factorial` with `%rdi=3`. A return address is pushed.
2. `factorial(3)` executes its prologue, saving `%rbp` and allocating a frame. It checks `3 <= 1` (false) and computes `3 - 1`.
3. It executes `call factorial` with `%rdi=2`. A second return address is pushed.
4. `factorial(2)` pushes a second frame. It checks `2 <= 1` (false).
5. It executes `call factorial` with `%rdi=1`. A third return address is pushed.
6. `factorial(1)` pushes a third frame. It checks `1 <= 1` (true). It puts `1` in `%rax` and executes `ret`, popping its frame.
7. `factorial(2)` resumes, multiplies its local `n` (2) by `%rax` (1), puts `2` in `%rax`, and executes `ret`.
8. `factorial(3)` resumes, multiplies its local `n` (3) by `%rax` (2), puts `6` in `%rax`, and executes `ret`.
9. The stack is now fully unwound, exactly as it started, with the correct answer safely in `%rax`.

Lesson 09 covers arrays and structs — how aggregate data types are laid out in memory. The call stack is a hardware-supported LIFO data structure, and the ABI is the contract between caller and callee about who saves which registers and how arguments and return values are passed.
