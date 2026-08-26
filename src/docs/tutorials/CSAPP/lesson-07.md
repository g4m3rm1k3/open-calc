# Lesson 07: Control Flow in Assembly — Branches, Loops, and EFLAGS

## Series
Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)

## Module
Module 1 — From C to Machine

## What you need to know first
Lessons 00–06 (tour, C, bits, integers, floats, pipeline, registers and arithmetic).

## What you will build
The reader will understand how if/else, while, for, and switch compile to conditional jumps in assembly. They will trace execution through branches and loops at the machine level. The transferable insight: the CPU has no concept of "if" or "while" — it only knows "jump to this address if this condition is true." Every high-level control structure is just a pattern of conditional jumps.

## Objects and Methods

- **EFLAGS Register**
  - **What it is**: A special register containing single-bit condition flags (CF, ZF, SF, OF) that describe the result of the most recent arithmetic or logical operation.
  - **Implementation**: Maintained automatically by the CPU's Arithmetic Logic Unit (ALU).
  - **Its use**: Used by conditional jumps and set instructions to control program flow based on computation results.
  - **Type**: Hardware register.
  - **Responsibility**: Storing the condition codes resulting from operations.
  - **Depends on**: Arithmetic and logical instructions (e.g., `add`, `cmp`, `test`).
  - **Connects to**: Conditional instructions (`jcc`, `setcc`, `cmovcc`).
  - **Shape**: A 32-bit/64-bit register where specific bits represent specific boolean flags.

- **`cmp` Instruction**
  - **What it is**: An instruction that compares two operands.
  - **Implementation**: Computes the difference (Operand2 - Operand1) inside the ALU, sets the condition codes, but discards the numeric result.
  - **Its use**: Establishing conditions (equal, less than, greater than) before branching.
  - **Type**: Arithmetic instruction.
  - **Responsibility**: Updating EFLAGS based on subtraction without modifying registers.
  - **Depends on**: EFLAGS register.
  - **Connects to**: Conditional jumps.
  - **Shape**: `cmp S1, S2`

- **`test` Instruction**
  - **What it is**: An instruction that performs a bitwise AND on two operands.
  - **Implementation**: Computes (Operand1 & Operand2), sets the zero and sign flags, and discards the result.
  - **Its use**: Checking if specific bits are set or if a value is zero.
  - **Type**: Logical instruction.
  - **Responsibility**: Updating EFLAGS based on logical AND.
  - **Depends on**: EFLAGS register.
  - **Connects to**: Conditional jumps.
  - **Shape**: `test S1, S2`

- **Conditional Jumps (`jcc`)**
  - **What it is**: Instructions that change the instruction pointer (program counter) if specific condition codes are met.
  - **Implementation**: The CPU checks EFLAGS; if the condition is true, it adds the jump offset to the program counter.
  - **Its use**: Implementing `if`, `while`, and `for` statements.
  - **Type**: Control flow instruction.
  - **Responsibility**: Redirecting execution based on condition flags.
  - **Depends on**: EFLAGS register.
  - **Connects to**: Target labels/addresses.
  - **Shape**: `jcc label`

- **Conditional Move (`cmovcc`)**
  - **What it is**: An instruction that copies data only if a specific condition is true.
  - **Implementation**: The CPU evaluates EFLAGS; if true, the destination is updated. Otherwise, it acts like a no-op.
  - **Its use**: Branch-free conditional assignment to avoid branch misprediction penalties.
  - **Type**: Data transfer/Control instruction.
  - **Responsibility**: Moving data conditionally.
  - **Depends on**: EFLAGS register.
  - **Connects to**: Source and destination registers.
  - **Shape**: `cmovcc S, D`

- **Jump Table**
  - **What it is**: An array of code memory addresses used to dispatch execution to different blocks.
  - **Implementation**: Stored in the data section, accessed via indirect jumps (`jmp *`).
  - **Its use**: Implementing dense `switch` statements efficiently (O(1) time).
  - **Type**: Data structure.
  - **Responsibility**: Mapping index values to execution targets.
  - **Depends on**: Indirect jump instructions.
  - **Connects to**: Case blocks.
  - **Shape**: Array of `.quad` pointers.

## Concept Units

### 1. The EFLAGS register — condition codes
The CPU maintains a set of single-bit condition flags in the EFLAGS register. The most important:
```
CF (Carry Flag):    set when unsigned arithmetic produces a carry/borrow
ZF (Zero Flag):     set when the result is zero
SF (Sign Flag):     set when the result is negative (MSB = 1)
OF (Overflow Flag): set when signed arithmetic overflows
```

Arithmetic instructions (`add`, `sub`, `mul`, `inc`, `dec`, `neg`, `and`, `or`, `xor`, `not`) set the condition codes as a side effect.

`cmp S1, S2` computes `S2 - S1` and sets flags WITHOUT storing the result.
`test S1, S2` computes `S1 & S2` and sets ZF and SF WITHOUT storing the result.

```asm
# After: cmpq %rsi, %rdi  (computes rdi - rsi)
# ZF=1 if rdi == rsi
# SF=1 if rdi < rsi (for signed, when no overflow)
# CF=1 if rdi < rsi (for unsigned)

# After: testq %rax, %rax  (computes rax & rax = rax)
# ZF=1 if rax == 0
# SF=1 if rax < 0
# Used to test if rax is zero/negative without a cmp instruction
```

**Throwaway Lab:**
Let's see the EFLAGS in action manually.
Full trace: if rdi=5 and rsi=7, `cmpq %rsi, %rdi` computes 5-7=-2. ZF=0, SF=1, CF=1, OF=0. 
(We throw this away as we move on to using flags).

### 2. SET instructions — reading a condition code into a byte
We can use `setX` instructions to read condition flags into an 8-bit register.

```asm
# setX reads condition codes and sets %al to 0 or 1
    cmpq  %rsi, %rdi       # compute rdi - rsi, set flags
    sete  %al              # al = 1 if ZF=1 (rdi == rsi)
    setne %al              # al = 1 if ZF=0 (rdi != rsi)
    setl  %al              # al = 1 if SF!=OF (signed: rdi < rsi)
    setg  %al              # al = 1 if ZF=0 and SF==OF (signed: rdi > rsi)
    setb  %al              # al = 1 if CF=1  (unsigned: rdi < rsi)
    seta  %al              # al = 1 if CF=0 and ZF=0 (unsigned: rdi > rsi)

# C: int result = (a < b);  -- compiles to:
    cmpq  %rsi, %rdi       # compare a(rdi) with b(rsi)
    setl  %al              # al = (a < b)
    movzbl %al, %eax       # zero-extend al to eax (= rax)
    ret
```

**Throwaway Lab:**
Full trace with a=3, b=7: cmpq computes 3-7=-4, SF=1, OF=0, so SF!=OF is TRUE, setl sets al=1, movzbl gives rax=1.

### 3. Conditional jumps — the heart of control flow
The CPU can jump to different addresses based on EFLAGS.
```asm
# Unconditional:
    jmp  label             # always jump to label
    jmp  *%rax             # jump to address in rax (indirect jump)

# Conditional (jump if condition true):
    je   label             # jump if ZF=1 (equal)
    jne  label             # jump if ZF=0 (not equal)
    jl   label             # jump if SF!=OF (signed less than)
    jle  label             # jump if SF!=OF or ZF=1 (signed <=)
    jg   label             # jump if ZF=0 and SF==OF (signed >)
    jge  label             # jump if SF==OF (signed >=)
    jb   label             # jump if CF=1 (unsigned <)
    ja   label             # jump if CF=0 and ZF=0 (unsigned >)
    js   label             # jump if SF=1 (negative)
    jz   label             # same as je (jump if ZF=1)
```

Explain the encoding: a conditional jump encodes the OFFSET from the next instruction (relative addressing), not the absolute address. This makes the code position-independent.

### 4. How if/else compiles to jumps
C source:
```c
long max(long a, long b)
{
    if (a > b)
        return a;
    else
        return b;
}
```

Compiled assembly (gcc -O0 style with branches):
```asm
max:
    cmpq  %rsi, %rdi       # compare a(rdi) with b(rsi): rdi - rsi
    jle   .L_else           # if a <= b, go to else branch
    movq  %rdi, %rax       # then: rax = a
    ret
.L_else:
    movq  %rsi, %rax       # else: rax = b
    ret
```

**Throwaway Lab:**
Full trace with a=3, b=7: cmpq computes 3-7=-4, SF=1, OF=0, jle condition: ZF=0 OR SF!=OF, SF!=OF is TRUE, so jle TAKEN → jumps to L_else → rax = 7 → return 7.
Full trace with a=9, b=7: cmpq computes 9-7=2, SF=0, OF=0, jle: ZF=0 AND SF==OF, FALSE, jle NOT TAKEN → rax = 9 → return 9.

### 5. Conditional moves (cmov) — branch-free code
Modern compilers often use `cmovX` instead of branches when possible:
```asm
# cmovX src, dest: if condition true, dest = src; else dest unchanged

# Same max() function with cmov:
max:
    movq  %rsi, %rax       # rax = b (tentative result)
    cmpq  %rsi, %rdi       # compare a with b
    cmovg %rdi, %rax       # if a > b (jg condition), rax = a
    ret
```

**Throwaway Lab:**
Full trace with a=3, b=7: rax=7, cmpq: 3-7=-4, cmovg condition: ZF=0 AND SF==OF is FALSE → cmov NOT taken, rax stays 7, return 7.
Full trace with a=9, b=7: rax=7, cmpq: 9-7=2, cmovg: SF==OF=0 AND ZF=0: TRUE → rax = 9, return 9.

Why cmov is better: branch misprediction costs ~15 cycles on modern CPUs. `cmov` is always 1 cycle because it doesn't redirect the instruction stream.

### 6. How loops compile — while and for
C source:
```c
long count_ones(unsigned long x)
{
    long count = 0;
    while (x != 0) {
        count += x & 1;   /* test lowest bit */
        x >>= 1;          /* shift right */
    }
    return count;
}
```

Compiled (do-while style — gcc converts while to do-while for optimization):
```asm
count_ones:
    movq  $0, %rax         # count = 0
    testq %rdi, %rdi       # test x
    je    .L_done          # if x == 0, skip loop
.L_loop:
    movq  %rdi, %rdx       # rdx = x
    andq  $1, %rdx         # rdx = x & 1
    addq  %rdx, %rax       # count += x & 1
    shrq  $1, %rdi         # x >>= 1
    testq %rdi, %rdi       # test x again
    jne   .L_loop          # if x != 0, repeat
.L_done:
    ret                    # return count in rax
```

**Throwaway Lab:**
Full trace for x=5 (binary 101):
- Iter 1: rdx=1, rax=1, x=2 (binary 010), testq: ZF=0, jne taken
- Iter 2: rdx=0, rax=1, x=1 (binary 001), testq: ZF=0, jne taken
- Iter 3: rdx=1, rax=2, x=0, testq: ZF=1, jne NOT taken
- Return 2

### 7. Switch statements and jump tables
C source:
```c
long switch_ex(long x)
{
    long result;
    switch(x) {
    case 1: result = x * 2;   break;
    case 2: result = x + 10;  break;
    case 3: result = x * x;   break;
    default: result = -1;
    }
    return result;
}
```

Assembly uses a JUMP TABLE (array of code addresses):
```asm
switch_ex:
    cmpq  $3, %rdi            # compare x with max case
    ja    .L_default           # if x > 3 (unsigned), go to default
    jmp   *.L_jt(,%rdi,8)    # indirect jump: PC = Mem[.L_jt + x*8]

.L_jt:   # jump table (array of 8-byte addresses)
    .quad .L_default   # [0] x=0: default
    .quad .L_case1     # [1] x=1: case 1
    .quad .L_case2     # [2] x=2: case 2
    .quad .L_case3     # [3] x=3: case 3

.L_case1:
    leaq  (%rdi,%rdi), %rax   # rax = 2*x
    ret
.L_case2:
    addq  $10, %rdi
    movq  %rdi, %rax           # rax = x + 10
    ret
.L_case3:
    imulq %rdi, %rdi
    movq  %rdi, %rax           # rax = x*x
    ret
.L_default:
    movq  $-1, %rax            # rax = -1
    ret
```

**Throwaway Lab:**
Full trace for x=2: cmpq: 2 <= 3, ja not taken; indirect jump reads `.L_jt + 2*8` = address of `.L_case2`; jumps to `.L_case2`; rax = 2 + 10 = 12; return 12.

Explain: jump tables are O(1) — selecting among 100 cases costs the same as 3 cases. This is why a dense switch with N cases compiles to a jump table (O(1)) rather than N if-else comparisons (O(N)).

## Closing
Every C control structure is now visible as a machine pattern. Lesson 08 covers procedures — the call stack, stack frames, and the calling convention that makes function calls work.

**Exercises:**
- Trace the assembly for a loop that sums an array of 4 longs.
- Explain why `ja` (unsigned above) is used to guard a jump table rather than `jg`.
- Draw the EFLAGS state after `cmpq $0, %rax` when rax = -1.
