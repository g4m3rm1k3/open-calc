# Lesson 07: Control Flow in Assembly — Conditionals, Loops, and Jump Instructions

What you will build: The reader will understand how C control flow (if/else, while, for, switch) maps to assembly condition codes, `cmp`, `test`, and conditional/unconditional jump instructions. The transferable insight: a CPU has no `if` statement. It has flags and jumps. Every high-level control structure is an illusion built from 'set a flag, check a flag, jump or don't jump'. Understanding this makes branch prediction, short-circuit evaluation, and switch-table optimizations obvious.

What you need to know first: Lessons 00-06.

**Terms used in this lesson:**
- **Condition codes** — the CPU's flag register (CF, ZF, SF, OF) updated after arithmetic operations to reflect properties of the result (e.g., zero, negative, overflow). This exists so subsequent instructions can make branching decisions based on previous math.
- **Conditional jump** — an instruction that changes the instruction pointer (branches) only if specific condition codes are set. This solves the problem of executing different code paths.
- **Conditional move** — an instruction that moves data only if specific condition codes are set, avoiding a branch. This solves branch misprediction penalties on modern pipelined CPUs.
- **Jump table** — an array of code addresses used to route execution based on an index. This provides O(1) dispatch for `switch` statements with dense integer cases.
- **Indirect jump** — a jump to an address read from a register or memory, rather than a hardcoded label. This is the mechanism that makes jump tables work.
- **Branch prediction** — a CPU feature that guesses which way a conditional jump will go to keep the instruction pipeline full.

**Objects and methods used:**

- **`cmp`**
  - *What it is:* A comparison instruction.
  - *Implementation:* `cmp src, dst` (AT&T syntax).
  - *Its use:* To compare two values by subtraction, discarding the result but setting condition codes.
  - *Type:* Assembly instruction.
  - *Responsibility:* Computes `dst - src` and updates CF, ZF, SF, OF flags.
  - *Depends on:* Two operands (registers or memory/immediates).
  - *Connects to:* Prepares flags for a subsequent conditional jump or move.
  - *Shape:* Internal implementation detail in assembly logic.

- **`test`**
  - *What it is:* A logical test instruction.
  - *Implementation:* `test src, dst`.
  - *Its use:* To check if a value is zero or negative by bitwise ANDing it with itself.
  - *Type:* Assembly instruction.
  - *Responsibility:* Computes `dst & src`, discards the result, and updates ZF and SF.
  - *Depends on:* Two operands (usually the same register).
  - *Connects to:* Prepares flags for conditional branching.
  - *Shape:* Internal implementation detail.

- **`je` (and variants `jne`, `jl`, `jle`, `jg`, `jge`, `jb`, `ja`)**
  - *What it is:* Jump if condition met.
  - *Implementation:* `jCC .label`.
  - *Its use:* To branch execution based on previously set condition codes.
  - *Type:* Assembly instruction.
  - *Responsibility:* Modifies the instruction pointer `%rip` if the condition specified by `CC` is true.
  - *Depends on:* Condition codes (ZF, SF, OF, CF) and a target label.
  - *Connects to:* Control flow routing, typically following a `cmp` or `test`.
  - *Shape:* Control flow boundary.

- **`jmp`**
  - *What it is:* Unconditional jump.
  - *Implementation:* `jmp .label` or `jmp *%reg`.
  - *Its use:* To branch execution unconditionally.
  - *Type:* Assembly instruction.
  - *Responsibility:* Directly updates `%rip` to the target address.
  - *Depends on:* A target label or address.
  - *Connects to:* Skipping `else` blocks or indirect routing via jump tables.
  - *Shape:* Control flow boundary.

- **`cmovle`**
  - *What it is:* Conditional move instruction.
  - *Implementation:* `cmovCC src, dst`.
  - *Its use:* To conditionally update a register without branching.
  - *Type:* Assembly instruction.
  - *Responsibility:* Copies `src` to `dst` if the condition `CC` is met; does nothing otherwise.
  - *Depends on:* Condition codes and two operands.
  - *Connects to:* Optimization for small, unpredictable branches.
  - *Shape:* Internal data flow.

**Everything else in the file, not this lesson's subject but still explained:**

- **`movl` / `movq`**
  - *What it is:* Data movement instruction (32-bit / 64-bit).
  - *Implementation:* `mov src, dst`.
  - *Its use:* To copy values between registers or memory.
  - *Type:* Assembly instruction.
  - *Responsibility:* Copies the source operand to the destination operand.
  - *Depends on:* Source and destination.
  - *Connects to:* Setting up variables or return values.
  - *Shape:* Internal data flow.

- **`xorl`**
  - *What it is:* Bitwise XOR instruction.
  - *Implementation:* `xorl src, dst`.
  - *Its use:* Fast way to zero out a register (`xorl %eax, %eax`).
  - *Type:* Assembly instruction.
  - *Responsibility:* Computes `dst ^ src` and stores in `dst`.
  - *Depends on:* Two operands.
  - *Connects to:* Variable initialization.
  - *Shape:* Internal arithmetic.

- **`addq` / `incq`**
  - *What it is:* Addition / Increment instructions (64-bit).
  - *Implementation:* `addq src, dst` / `incq dst`.
  - *Its use:* To perform integer arithmetic.
  - *Type:* Assembly instruction.
  - *Responsibility:* Adds values and updates flags.
  - *Depends on:* Operands.
  - *Connects to:* Loop counters and accumulation.
  - *Shape:* Internal arithmetic.

- **`movslq`**
  - *What it is:* Move with sign-extension (32-bit to 64-bit).
  - *Implementation:* `movslq src, dst`.
  - *Its use:* To safely promote a 32-bit integer to a 64-bit pointer index.
  - *Type:* Assembly instruction.
  - *Responsibility:* Copies and sign-extends `src` into `dst`.
  - *Depends on:* 32-bit source, 64-bit destination.
  - *Connects to:* Array indexing.
  - *Shape:* Data type conversion.

- **`leaq`**
  - *What it is:* Load Effective Address.
  - *Implementation:* `leaq src, dst`.
  - *Its use:* To calculate memory addresses without accessing memory.
  - *Type:* Assembly instruction.
  - *Responsibility:* Computes the address of `src` and stores it in `dst`.
  - *Depends on:* Memory addressing mode syntax.
  - *Connects to:* Pointer arithmetic and array indexing.
  - *Shape:* Address calculation.

- **`ret`**
  - *What it is:* Return from procedure.
  - *Implementation:* `ret`.
  - *Its use:* To exit a function and return to caller.
  - *Type:* Assembly instruction.
  - *Responsibility:* Pops the return address from the stack and jumps to it.
  - *Depends on:* Call stack.
  - *Connects to:* Function boundary.
  - *Shape:* Control flow exit.

## Concept Unit: Condition codes — the CPU's flag register
### The Problem
How does a CPU remember the result of a comparison long enough to act on it? When you subtract two numbers, the CPU computes the result, but if you only care whether they were equal, where is that "equality" fact stored? What happens if you need to know if it was negative instead?
### Introduce the concept in isolation
```c
/* To see condition codes in action, compile and look at assembly: */
#include <stdio.h>

int compare(int a, int b) {
    return a - b;  /* sub sets CF, ZF, SF, OF based on result */
}

int main(void) {
    printf("%d\n", compare(5, 3));   /* 2:  SF=0, ZF=0 */
    printf("%d\n", compare(3, 5));   /* -2: SF=1, ZF=0 */
    printf("%d\n", compare(5, 5));   /* 0:  SF=0, ZF=1 */
    return 0;
}
```
This is called **condition codes**. It proves that arithmetic operations inherently update internal flags (Zero Flag, Sign Flag, Overflow Flag) that reflect the nature of the result.
### Discard the throwaway
This C throwaway code is explicitly discarded and will not appear in the project again.
### Project Change
Reference Source: None - this is a from-scratch addition to build intuition.
Files affected: `src/asm/compare.s` (created)
Change type: add
Location: New file
Dependencies: C runtime.
### The New Code
```asm
    cmpl  %esi, %edi
    testl %eax, %eax
```
### The Updated Project
```asm
1:  # src/asm/compare.s
2:  compare_flags:
3:      cmpl  %esi, %edi    # <- new
4:      testl %eax, %eax    # <- new
5:      ret
```
This structure shows how we can compute facts about our operands purely to set flags, without storing the numerical result.
### Mechanical walkthrough
- **`cmpl`**: Computes `edi - esi`, discards the result, but updates the CPU's flags.
- **`%esi`**: Source register (second argument in C).
- **`,`**: Separator.
- **`%edi`**: Destination register (first argument in C).
- **`testl`**: Computes `eax & eax`, discards the result, updates flags. Used to check if `eax` is zero or negative.
- **`%eax`**: Register (often return value or working variable).
- **`,`**: Separator.
- **`%eax`**: Same register, bitwise ANDed with itself.
### CS lens
Fundamental concept: Side effects in hardware. Arithmetic operations don't just yield a result; they alter global state (flags). This appears in state machines, database transaction logs, and graphics pipeline state contexts.
### SE lens
Design principle: Implicit vs Explicit state. The CPU uses implicit state (flags) for extreme efficiency, avoiding the need for an explicit boolean return type on every instruction. Tradeoff: this makes instruction reordering complex since flags must be tracked.
### Commands needed
`gcc -S`
### Run it
Predicted confidently: For a=5, b=3: edi=5, esi=3. edi-esi = 2. ZF=0, SF=0. For a=3, b=5: -2. SF=1, ZF=0. For a=5, b=5: 0. ZF=1.
### One sentence connecting to previous unit
Now that flags are set, we need instructions that actually read them to make decisions.

## Concept Unit: Conditional jumps — branching on flags
### The Problem
How do we skip over code? If an `if` condition is false, we shouldn't execute the `then` block. How does the CPU change what instruction it reads next?
### Introduce the concept in isolation
```asm
# Conditional jump instructions (all read condition codes):
    je   .label    # jump if ZF=1     (equal / zero)
    jle  .label    # jump if ZF=1 or SF!=OF (signed less-or-equal)
    jmp  .label    # unconditional jump
```
This is called a **conditional jump**. It proves that execution flow can be redirected automatically based solely on the current state of the condition codes.
### Discard the throwaway
This isolated list of jump instructions is explicitly discarded.
### Project Change
Reference Source: C compiler output for simple `if/else`.
Files affected: `src/asm/max.s` (created)
Change type: add
Location: New file
Dependencies: Previous unit's `cmpl` instruction.
### The New Code
```asm
max:
    cmpl   %esi, %edi
    jle    .else_branch
    movl   %edi, %eax
    ret
.else_branch:
    movl   %esi, %eax
    ret
```
### The Updated Project
```asm
1:  # src/asm/max.s
2:  max:
3:      cmpl   %esi, %edi     # <- new
4:      jle    .else_branch   # <- new
5:      movl   %edi, %eax     # <- new
6:      ret                   # <- new
7:  .else_branch:             # <- new
8:      movl   %esi, %eax     # <- new
9:      ret                   # <- new
```
This function implements `max(a, b)` using jumps to route around the "then" branch if the condition is false.
### Mechanical walkthrough
- **`max:`**: A label marking the start of the function.
- **`cmpl`**: Compare instruction.
- **`%esi`**: The `b` argument.
- **`,`**: Separator.
- **`%edi`**: The `a` argument.
- **`jle`**: Jump if less or equal. Checks flags set by `cmpl`.
- **`.else_branch`**: Target label. If `a <= b`, jump here.
- **`movl`**: Move instruction.
- **`%edi`**: Source (the `a` argument).
- **`,`**: Separator.
- **`%eax`**: Destination (the return value register).
- **`ret`**: Returns to the caller.
- **`.else_branch:`**: Target label.
- **`movl`**: Move instruction.
- **`%esi`**: Source (the `b` argument).
- **`,`**: Separator.
- **`%eax`**: Destination (the return value register).
- **`ret`**: Returns to the caller.
### CS lens
Fundamental concept: Control Flow. Jumps are the atomic building blocks of all loops and conditionals. This pattern appears in AST evaluation, state machine transitions, and bytecode interpreters (like the JVM or Python VM).
### SE lens
Design principle: GOTO considered harmful. Assembly requires direct jumping, but high-level languages abstract this away because raw jumps create spaghetti code. Tradeoff: flexibility vs maintainability.
### Commands needed
`gcc -S`
### Run it
Predicted confidently: Trace max(7, 3): cmpl sets flags. 7-3=4, ZF=0, SF=0. jle not taken. eax=7. ret. max(2, 5): 2-5=-3, SF=1, OF=0. jle condition true. jumps to .else_branch. eax=5. ret.
### One sentence connecting to previous unit
Jumping works, but it forces the CPU to guess which path will be taken, which can be expensive.

## Concept Unit: Conditional moves — cmov (avoiding branches)
### The Problem
Modern CPUs are pipelined, meaning they start processing the next instruction before the current one finishes. If they hit a jump, they have to guess which way it goes. What happens if they guess wrong and have to throw away all that pipelined work? Is there a way to choose a result without jumping at all?
### Introduce the concept in isolation
```c
int max_cmov(int a, int b) {
    return a > b ? a : b;
}
```
This is called a **conditional move**. It proves that the CPU can decide whether to execute a move based on flags, side-stepping the branch predictor entirely.
### Discard the throwaway
This C throwaway code is explicitly discarded and will not appear in the project again.
### Project Change
Reference Source: C compiler `-O2` output for ternary operator.
Files affected: `src/asm/max.s` (modified)
Change type: replace
Location: Replacing the `max` function body.
Dependencies: None.
### The New Code
```asm
max_cmov:
    movl   %edi, %eax
    cmpl   %esi, %edi
    cmovle %esi, %eax
    ret
```
### The Updated Project
```asm
1:  # src/asm/max.s
2:  max_cmov:
3:      movl   %edi, %eax     # <- new
4:      cmpl   %esi, %edi     # <- new
5:      cmovle %esi, %eax     # <- new
6:      ret                   # <- new
```
This structure shows an optimized conditional that calculates both possibilities and conditionally overwrites the result, eliminating branching.
### Mechanical walkthrough
- **`max_cmov:`**: Label.
- **`movl`**: Move instruction.
- **`%edi`**: Source.
- **`,`**: Separator.
- **`%eax`**: Destination. Sets tentative result to `a`.
- **`cmpl`**: Compare.
- **`%esi`**: `b`.
- **`,`**: Separator.
- **`%edi`**: `a`.
- **`cmovle`**: Conditional move if less or equal.
- **`%esi`**: Source `b`.
- **`,`**: Separator.
- **`%eax`**: Destination `eax`. Overwrites with `b` only if condition met.
- **`ret`**: Return.
### CS lens
Fundamental concept: Branch Prediction Penalty. CPUs rely on keeping pipelines full. This optimization appears in GPU shader design (where branches are notoriously expensive), network packet filtering, and high-frequency trading systems.
### SE lens
Design principle: Eager Evaluation. We do the work for both paths upfront and pick the winner. Tradeoff: We waste a tiny bit of computation (the initial move) to avoid the massive delay of a pipeline flush.
### Commands needed
`gcc -O2 -S`
### Run it
Predicted confidently: Trace max_cmov(7, 3): eax=7. cmpl: 7-3=4, ZF=0, SF=0, OF=0. cmovle: condition 'le' = false. eax stays 7. ret 7.
### One sentence connecting to previous unit
With conditionals mastered, we can construct loops by jumping backwards.

## Concept Unit: Loops — for and while in assembly
### The Problem
How does a `for` loop actually repeat? There is no `for` instruction in x86. How can we use compare and jump to create a cycle?
### Introduce the concept in isolation
```c
long sum_to_n(long n) {
    long sum = 0;
    for (long i = 1; i <= n; i++)
        sum += i;
    return sum;
}
```
This is called a **loop**. It proves that high-level repetition is constructed purely from conditional backwards jumps.
### Discard the throwaway
This C throwaway code is explicitly discarded and will not appear in the project again.
### Project Change
Reference Source: C compiler loop optimization output.
Files affected: `src/asm/loop.s` (created)
Change type: add
Location: New file.
Dependencies: None.
### The New Code
```asm
sum_to_n:
    testq  %rdi, %rdi
    jle    .done
    movl   $1, %eax
    xorl   %ecx, %ecx
.loop:
    addq   %rax, %rcx
    incq   %rax
    cmpq   %rdi, %rax
    jle    .loop
    movq   %rcx, %rax
    ret
.done:
    xorl   %eax, %eax
    ret
```
### The Updated Project
```asm
1:  # src/asm/loop.s
2:  sum_to_n:
3:      testq  %rdi, %rdi      # <- new
4:      jle    .done           # <- new
5:      movl   $1, %eax        # <- new
6:      xorl   %ecx, %ecx      # <- new
7:  .loop:                     # <- new
8:      addq   %rax, %rcx      # <- new
9:      incq   %rax            # <- new
10:     cmpq   %rdi, %rax      # <- new
11:     jle    .loop           # <- new
12:     movq   %rcx, %rax      # <- new
13:     ret                    # <- new
14: .done:                     # <- new
15:     xorl   %eax, %eax      # <- new
16:     ret                    # <- new
```
This structure implements a complete loop by setting up initial state, accumulating values, and looping backwards until a condition fails.
### Mechanical walkthrough
- **`sum_to_n:`**: Label.
- **`testq`**: Test instruction (64-bit).
- **`%rdi`**: Argument `n`.
- **`,`**: Separator.
- **`%rdi`**: `n`. Tests if `n <= 0`.
- **`jle`**: Jump if less or equal.
- **`.done`**: Target to exit early.
- **`movl`**: Move instruction.
- **`$1`**: Literal 1.
- **`,`**: Separator.
- **`%eax`**: Destination, `i = 1`.
- **`xorl`**: XOR instruction.
- **`%ecx`**: Target register.
- **`,`**: Separator.
- **`%ecx`**: Same register. `ecx ^ ecx` sets it to 0 (`sum = 0`).
- **`.loop:`**: Loop start label.
- **`addq`**: Add instruction.
- **`%rax`**: Source `i`.
- **`,`**: Separator.
- **`%rcx`**: Destination `sum`. `sum += i`.
- **`incq`**: Increment instruction.
- **`%rax`**: `i++`.
- **`cmpq`**: Compare instruction.
- **`%rdi`**: `n`.
- **`,`**: Separator.
- **`%rax`**: `i`.
- **`jle`**: Jump if `i <= n`.
- **`.loop`**: Back to top of loop.
- **`movq`**: Move instruction.
- **`%rcx`**: Final sum.
- **`,`**: Separator.
- **`%rax`**: Return register.
- **`ret`**: Return.
- **`.done:`**: Exit label.
- **`xorl`**: XOR instruction.
- **`%eax`**: Target.
- **`,`**: Separator.
- **`%eax`**: Same. Return 0.
- **`ret`**: Return.
### CS lens
Fundamental concept: Loop unrolling and Guard clauses. The compiler checks `n <= 0` first (the guard) before entering a do-while style loop, avoiding an extra jump per iteration. This appears in database cursors, event loops, and game engines.
### SE lens
Design principle: Strength reduction. Using `xorl reg, reg` instead of `movl $0, reg` is faster because the CPU recognizes XOR as a zeroing idiom breaking data dependencies. Tradeoff: Obscures intent slightly for a machine-level optimization.
### Commands needed
`gcc -O2 -S`
### Run it
Predicted confidently: Trace sum_to_n(3): rdi=3. testq rdi,rdi: ZF=0. jle not taken. eax=1, ecx=0. Loop 1: ecx+=1=1, eax=2, cmp 2 vs 3: jle taken. Loop 2: ecx+=2=3, eax=3, cmp 3 vs 3: jle taken. Loop 3: ecx+=3=6, eax=4, cmp 4 vs 3: jle NOT taken. movq rcx,rax: rax=6. ret. Returns 6.
### One sentence connecting to previous unit
If loops handle repetition, how do we handle a massive conditional like a `switch` statement without jumping sequentially through a hundred `if` checks?

## Concept Unit: Switch statements — jump tables
### The Problem
Imagine a `switch` statement with 100 cases. If we compile it to a chain of `if/else` checks, checking case 99 takes 99 comparisons. Can we jump directly to the right code in one step, regardless of how many cases there are?
### Introduce the concept in isolation
```c
const char *day_name(int day) {
    switch (day) {
        case 0: return "Sunday";
        case 1: return "Monday";
        // ...
        case 6: return "Saturday";
        default: return "Unknown";
    }
}
```
This is called a **jump table**. It proves that dense switch cases are optimized into an array of addresses, providing O(1) dispatch time.
### Discard the throwaway
This C throwaway code is explicitly discarded and will not appear in the project again.
### Project Change
Reference Source: C compiler jump table generation.
Files affected: `src/asm/switch.s` (created)
Change type: add
Location: New file.
Dependencies: None.
### The New Code
```asm
day_name:
    cmpl   $6, %edi
    ja     .default
    movslq %edi, %rdi
    leaq   .jump_table(%rip), %rax
    movq   (%rax,%rdi,8), %rax
    jmp    *%rax
```
### The Updated Project
```asm
1:  # src/asm/switch.s
2:  day_name:
3:      cmpl   $6, %edi                  # <- new
4:      ja     .default                  # <- new
5:      movslq %edi, %rdi                # <- new
6:      leaq   .jump_table(%rip), %rax   # <- new
7:      movq   (%rax,%rdi,8), %rax       # <- new
8:      jmp    *%rax                     # <- new
9:  .case0:
10:     leaq   .str_sunday(%rip), %rax
11:     ret
12: .default:
13:     leaq   .str_unknown(%rip), %rax
14:     ret
```
This structure checks the bounds of the input, calculates an offset into a table of memory addresses, and executes an indirect jump to land perfectly at the target case.
### Mechanical walkthrough
- **`day_name:`**: Label.
- **`cmpl`**: Compare.
- **`$6`**: Literal 6.
- **`,`**: Separator.
- **`%edi`**: Input `day`.
- **`ja`**: Jump if above (unsigned). Guards against negative or large inputs.
- **`.default`**: Fallback case label.
- **`movslq`**: Sign extend 32-bit to 64-bit.
- **`%edi`**: Source.
- **`,`**: Separator.
- **`%rdi`**: Destination pointer index.
- **`leaq`**: Load effective address.
- **`.jump_table(%rip)`**: Position-independent address of the jump table.
- **`,`**: Separator.
- **`%rax`**: Register holding base address.
- **`movq`**: Move instruction (pointer read).
- **`(%rax,%rdi,8)`**: Memory lookup: `rax + (rdi * 8)`. Reads the target address.
- **`,`**: Separator.
- **`%rax`**: Destination register holding the target address.
- **`jmp`**: Jump instruction.
- **`*%rax`**: Indirect jump. Jumps to the address *contained* in `rax`.
### CS lens
Fundamental concept: O(1) Dispatch and Indirect Branching. The time taken is constant regardless of case count. This mechanism is the exact same underlying primitive used for virtual method dispatch in OOP (v-tables) and dynamic library linking (PLT/GOT).
### SE lens
Design principle: Space-Time Tradeoff. We spend a few bytes on storing the `.jump_table` array in memory to save execution cycles. Tradeoff: If the case numbers are extremely sparse (e.g., `case 1`, `case 10000`), a jump table wastes memory, and compilers will fall back to binary search trees of branches.
### Commands needed
`gcc -O2 -S`
### Run it
Predicted confidently: Trace day=2 (Tuesday): cmpl $6,%edi: 2<=6, ja not taken. movslq: rdi=2. leaq: rax=&jump_table. movq (%rax,2,8): rax = jump_table[2] = address of .case2 code. jmp *%rax: jump to .case2. One indirect jump executed.
### One sentence connecting to previous unit
From direct branches to indirect jumps, we have seen all the primitive routing mechanisms a CPU can perform.

## Closing
### Connect the pieces
Every high-level structure boils down to a sequence of `cmp` and jump instructions. When you write a `for` loop in C, you are simply setting up an initialization block, writing an arithmetic sequence, and issuing a `cmp` followed by a `jle` to conditionally jump the instruction pointer back to the top. When you write a `switch` statement, you are issuing a bounds-check `cmp`, looking up an address in a table, and firing an indirect `jmp`. A CPU executes instruction after instruction blindly; all control flow is just an illusion built from manipulating the condition codes and the instruction pointer. Lesson 08 covers procedures — how function calls manage the call stack.
