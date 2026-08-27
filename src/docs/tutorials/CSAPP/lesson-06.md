# Lesson 06: x86-64 Assembly — Registers, mov, and Arithmetic

**What you will build**
The reader will be able to read x86-64 assembly produced by gcc, identify all 16 registers and their conventional uses, understand all operand forms, and trace arithmetic instructions step by step. This foundational knowledge bridges the gap between high-level C code and the machine-level instructions the processor natively executes, allowing a programmer to debug optimized code and understand machine-level performance.

**What you need to know first**
Lessons 00–05.

**Terms used in this lesson**
- **Register** — A tiny, extremely fast storage location directly inside the CPU, used to hold data currently being processed. It exists because accessing memory (RAM) is vastly slower than reading from the CPU's own internal circuits.
- **Assembly** — A human-readable text representation of machine code. It exists so humans can read, write, and analyze the low-level instructions the CPU executes without having to read raw binary.
- **AT&T Syntax** — A specific format for writing x86 assembly language where the source operand comes before the destination operand, and registers are prefixed with `%`. It exists as the standard assembly syntax used by the GNU toolchain.
- **Operand** — A value or data location that an instruction acts upon (like an immediate number, a register, or a memory address). It exists to provide the inputs and outputs for CPU operations.
- **Memory** — The main system RAM where larger amounts of data and code reside. It exists because registers are too few and too small to hold an entire program's state.
- **Instruction** — A single fundamental operation that the CPU knows how to execute natively, like adding two numbers or moving data. It exists as the basic building block of executable programs.
- **Arithmetic** — Mathematical operations like addition, subtraction, and multiplication. It exists to compute values and manipulate data.
- **Return value** — The result produced by a function and handed back to the caller. It exists so functions can compute and provide answers.
- **Accumulator** — A register traditionally used as the primary target for arithmetic operations and return values. It exists to provide a standard default location for results.
- **Callee-saved** — A convention where a function (the callee) must preserve the original value of a register if it modifies it, restoring it before returning. It exists so the calling function can trust that its variables in those registers won't be destroyed across a function call.
- **Caller-saved** — A convention where a function (the caller) must save the value of a register before calling another function, if it wants that value to survive. It exists so the called function can freely use those registers without worrying about preserving them.
- **Stack pointer** — A register that holds the memory address of the top of the current call stack. It exists to track where local variables and return addresses are stored.
- **Frame pointer** — A register optionally used to hold the base address of the current function's stack frame. It exists to provide a stable reference point for accessing local variables and parameters.
- **Zero-extend** — An operation that expands a smaller data type to a larger one by filling the new upper bits with zeros. It exists to safely convert unsigned values to wider types without changing their magnitude.
- **Sign-extend** — An operation that expands a smaller data type to a larger one by copying the most significant bit (the sign bit) into all the new upper bits. It exists to preserve the mathematical value and sign of signed integers when widening them.
- **Immediate** — A constant literal value embedded directly inside the instruction itself. It exists so small constants can be used without needing to load them from a separate memory location.
- **Address arithmetic** — Mathematical operations performed specifically to calculate memory addresses, such as scaling an index by the size of an array element. It exists to efficiently access structured data like arrays and structs.
- **Division** — The mathematical operation of splitting a value into equal parts. It exists to compute quotients and remainders.
- **Quotient** — The integer result of a division. It exists to represent how many times the divisor fits into the dividend.
- **Remainder** — The amount left over after integer division. It exists because integer division is inexact, and the modulo value is often needed in algorithms.

**Objects and methods used**

**`%rax`**
- *What it is:* The 64-bit accumulator register.
- *Implementation:* A 64-bit hardware register in the x86-64 CPU, whose lower 32 bits are `%eax`.
- *Its use:* Used in this lesson to hold the return value of functions and the results of arithmetic.
- *Type:* Hardware register.
- *Responsibility:* Holds the primary return value for integer functions and participates in special arithmetic.
- *Depends on:* Nothing.
- *Connects to:* Receives values from instructions, provides values to callers.
- *Shape:* CPU architectural state.

**`%rbx`**
- *What it is:* A 64-bit general-purpose register.
- *Implementation:* A 64-bit hardware register in the x86-64 CPU.
- *Its use:* Used as a callee-saved register for holding local variables.
- *Type:* Hardware register.
- *Responsibility:* Stores data across function calls without being overwritten by the callee.
- *Depends on:* The callee explicitly saving and restoring it.
- *Connects to:* Memory (stack) when saved/restored.
- *Shape:* CPU architectural state.

**`movq`**
- *What it is:* Move quadword instruction.
- *Implementation:* x86-64 assembly instruction `movq src, dest`.
- *Its use:* Used to copy 64-bit values between registers or memory.
- *Type:* Assembly instruction.
- *Responsibility:* Copies 8 bytes of data from a source operand to a destination operand.
- *Depends on:* Valid source and destination operands.
- *Connects to:* Registers and memory locations.
- *Shape:* Data transfer operation.

**`leaq`**
- *What it is:* Load effective address instruction.
- *Implementation:* x86-64 assembly instruction `leaq src, dest`.
- *Its use:* Used to compute memory addresses or perform fast arithmetic without accessing memory.
- *Type:* Assembly instruction.
- *Responsibility:* Computes the effective address of the source operand and stores it in the destination register.
- *Depends on:* A memory addressing expression.
- *Connects to:* ALU for address calculation.
- *Shape:* Address calculation operation.

**Everything else in the file, not this lesson's subject but still explained:**

**`%rcx`, `%rdx`, `%rsi`, `%rdi`, `%rsp`, `%rbp`, `%r8`-`%r15`**
- *What it is:* The remaining x86-64 general-purpose registers.
- *Implementation:* Hardware registers in the CPU.
- *Its use:* Used to hold function arguments, loop counters, and local state.
- *Type:* Hardware register.
- *Responsibility:* Various specific ABI roles (like `%rdi` for the 1st argument).
- *Depends on:* Nothing.
- *Connects to:* ALU and memory.
- *Shape:* CPU architectural state.

**`addq`, `subq`, `imulq`, `andq`, `orq`, `xorq`, `incq`, `decq`, `negq`, `notq`, `salq`, `sarq`, `shrq`**
- *What it is:* Arithmetic and logical instructions.
- *Implementation:* Native x86-64 ALU instructions operating on quadwords.
- *Its use:* Used to perform math and bitwise operations on data.
- *Type:* Assembly instruction.
- *Responsibility:* Computes mathematical results and updates the condition codes.
- *Depends on:* Source and destination operands.
- *Connects to:* The CPU ALU.
- *Shape:* Computation operation.

**`idivq`**
- *What it is:* Signed integer division instruction.
- *Implementation:* `idivq S`, divides `%rdx:%rax` by `S`.
- *Its use:* Used to perform division.
- *Type:* Assembly instruction.
- *Responsibility:* Computes the quotient in `%rax` and remainder in `%rdx`.
- *Depends on:* The `%rdx` and `%rax` registers being correctly set up.
- *Connects to:* `%rax` and `%rdx`.
- *Shape:* Math operation.

**`cqto`**
- *What it is:* Convert quadword to octaword instruction.
- *Implementation:* Native instruction that sign-extends `%rax` into `%rdx:%rax`.
- *Its use:* Used to set up `%rdx` for `idivq`.
- *Type:* Assembly instruction.
- *Responsibility:* Prepares a 128-bit dividend from a 64-bit value.
- *Depends on:* `%rax`.
- *Connects to:* `%rdx` and `%rax`.
- *Shape:* Sign-extension operation.

---

## Concept Unit: The 16 general-purpose registers

### The Problem
When programming in C, we use variables like `int x` and `long y`. But the CPU does not natively understand C variables. To manipulate data, the CPU must load it into extremely fast internal storage locations. How does the x86-64 architecture provide these locations, and how do we access different sizes of data within them?

Before looking at the solution, consider what might happen if you write a 32-bit value into a 64-bit storage slot. Does the upper half stay the same, or does it clear out?

### Introduce the concept in isolation
The x86-64 CPU has 16 general-purpose registers. Each is a full 64 bits wide, but can be accessed in smaller chunks (32-bit, 16-bit, and 8-bit). A crucial quirk of x86-64 is how writes behave. Let us observe this with a throwaway inline assembly lab that writes to the 32-bit `%eax` portion of the 64-bit `%rax` register.

```c
#include <stdio.h>

int main() {
    long rax_val = 0;
    __asm__ (
        "movq $0xFFFFFFFFFFFFFFFF, %%rax\n\t" // Fill rax with 1s
        "movl $0x12345678, %%eax\n\t"         // Write 32 bits to eax
        "movq %%rax, %0"                      // Extract the full rax
        : "=r" (rax_val)
        :
        : "%rax"
    );
    printf("Result: 0x%lx\n", rax_val);
    return 0;
}
```
Output:
```
Result: 0x12345678
```
This output proves that writing to a 32-bit register (like `%eax`) automatically **zero-extends** to 64 bits, entirely clearing the upper 32 bits of the full `%rax` register.

### Discard the throwaway example
The inline assembly lab above is deleted and will not appear in our project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building a collection of assembly functions to observe register behavior.
- **Files affected:** `arithmetic.s` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** None.

### The New Code — type it yourself
```asm
# Full 64-bit | Low 32-bit | Low 16-bit | Low 8-bit | Conventional use
# %rax        | %eax       | %ax        | %al       | Return value, accumulator
# %rbx        | %ebx       | %bx        | %bl       | Callee-saved
# %rcx        | %ecx       | %cx        | %cl       | 4th arg, loop counter
# %rdx        | %edx       | %dx        | %dl       | 3rd arg
# %rsi        | %esi       | %si        | %sil      | 2nd arg
# %rdi        | %edi       | %di        | %dil      | 1st arg
# %rsp        | %esp       | %sp        | %spl      | Stack pointer
# %rbp        | %ebp       | %bp        | %bpl      | Frame pointer
# %r8         | %r8d       | %r8w       | %r8b      | 5th arg
# %r9         | %r9d       | %r9w       | %r9b      | 6th arg
# %r10        | %r10d      | %r10w      | %r10b     | Caller-saved
# %r11        | %r11d      | %r11w      | %r11b     | Caller-saved
# %r12        | %r12d      | %r12w      | %r12b     | Callee-saved
# %r13        | %r13d      | %r13w      | %r13b     | Callee-saved
# %r14        | %r14d      | %r14w      | %r14b     | Callee-saved
# %r15        | %r15d      | %r15w      | %r15b     | Callee-saved
```

### The Updated Project
```asm
1: # arithmetic.s
2: # (Contains only the reference table of registers above)
```
The file now serves as a reference table mapping out the 16 general-purpose registers, their aliases for smaller sizes, and their standardized roles (the calling convention).

### Mechanical walkthrough
- **`%rax` through `%r15`**: These are the 64-bit general-purpose registers. They hold 8 bytes of data.
- **Low 32-bit names (`%eax`, `%r8d`, etc.)**: Writing to these 32-bit subsets automatically zero-extends, clearing the upper 32 bits of the full 64-bit register.
- **Low 16-bit and 8-bit names (`%ax`, `%al`, etc.)**: Writing to these smaller subsets does *not* zero-extend. It leaves the remaining upper bits completely untouched.
- **Conventional use**: The system ABI (Application Binary Interface) strictly dictates how these registers are used. For example, `%rdi` is always the 1st argument to a function, and `%rax` is always the return value.

---

## Concept Unit: Operand types -- immediate, register, memory

### The Problem
Now that we have registers, we need to instruct the CPU to move data between them, constant values, and memory. How does assembly syntax represent a constant number, a register, and a complex memory address lookup like `arr[i]`?

Before looking at the syntax, how would you express the address calculation `base_address + index * scale` directly in an instruction?

### Introduce the concept in isolation
An operand in assembly can take three forms: an immediate (a constant), a register, or a memory reference. Memory references can use a complex addressing mode: `D(Rb, Ri, S) = Mem[Rb + Ri*S + D]`. We can test this memory calculation in a throwaway C program.

```c
#include <stdio.h>

int main() {
    long arr[5] = {10, 20, 30, 40, 50};
    long result;
    long index = 3;
    __asm__ (
        "movq %1, %%rax\n\t"             // base address (arr) into %rax
        "movq %2, %%rcx\n\t"             // index (3) into %rcx
        "movq 8(%%rax,%%rcx,8), %%rbx\n\t" // load Mem[rax + rcx*8 + 8]
        "movq %%rbx, %0"
        : "=r" (result)
        : "r" (arr), "r" (index)
        : "%rax", "%rcx", "%rbx"
    );
    printf("Result: %ld\n", result);
    return 0;
}
```
Output:
```
Result: 50
```
This output proves that the addressing mode `8(%rax,%rcx,8)` calculates `arr + 3*8 + 8` bytes. Since `arr[3]` is at offset 24, adding another 8 bytes fetches the element at offset 32, which is `arr[4]` (value 50). This mode directly supports array access.

### Discard the throwaway example
The inline assembly lab above is deleted and will not appear in our project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `arithmetic.s` (modified)
- **Change type:** Add
- **Location:** Below the register table.
- **Dependencies:** None.

### The New Code — type it yourself
```asm
# Immediate: constant, prefixed with $
    movq  $42,    %rax     # rax = 42
    movq  $0xFF,  %rbx     # rbx = 255

# Register:
    movq  %rax,   %rcx     # rcx = rax

# Memory: D(Rb, Ri, S) = Mem[Rb + Ri*S + D]
    movq  (%rax),       %rbx  # rbx = Mem[rax]
    movq  8(%rax),      %rbx  # rbx = Mem[rax + 8]
    movq  (%rax,%rcx),  %rbx  # rbx = Mem[rax + rcx]
    movq  (%rax,%rcx,4),%rbx  # rbx = Mem[rax + rcx*4]
    movq  8(%rax,%rcx,4),%rbx # rbx = Mem[rax + rcx*4 + 8]
```

### The Updated Project
```asm
1: # arithmetic.s
2: # ... (register table) ...
3: # Immediate: constant, prefixed with $
4:     movq  $42,    %rax     # rax = 42
5:     movq  $0xFF,  %rbx     # rbx = 255
6: # Register:
7:     movq  %rax,   %rcx     # rcx = rax
8: # Memory: D(Rb, Ri, S) = Mem[Rb + Ri*S + D]
9:     movq  (%rax),       %rbx  # rbx = Mem[rax]
10:    movq  8(%rax),      %rbx  # rbx = Mem[rax + 8]
11:    movq  (%rax,%rcx),  %rbx  # rbx = Mem[rax + rcx]
12:    movq  (%rax,%rcx,4),%rbx  # rbx = Mem[rax + rcx*4]
13:    movq  8(%rax,%rcx,4),%rbx # rbx = Mem[rax + rcx*4 + 8]
```
The file now demonstrates the syntax for all three operand types: immediates, registers, and memory references.

### Mechanical walkthrough
- **`$42`**: An **immediate** operand. The `$` prefix tells the assembler this is a literal constant value embedded directly in the instruction, not an address.
- **`%rax`**: A **register** operand. The `%` prefix identifies it as a CPU register.
- **`(%rax)`**: A **memory** operand. Parentheses act like dereferencing a pointer in C (`*rax`). It accesses the memory at the address stored in `%rax`.
- **`8(%rax)`**: Memory operand with a displacement. It accesses the memory 8 bytes past the address in `%rax` (like `*(rax + 8)` or a struct field access).
- **`(%rax,%rcx)`**: Memory operand with a base (`%rax`) and index (`%rcx`). Accesses `Mem[%rax + %rcx]`.
- **`(%rax,%rcx,4)`**: Memory operand with a scale. Accesses `Mem[%rax + %rcx * 4]`. The scale can only be 1, 2, 4, or 8, making it perfect for iterating over arrays of `char`, `short`, `int`, or `long`.
- **`8(%rax,%rcx,4)`**: The full memory operand form `D(Rb, Ri, S)`. The base register is `Rb` (`%rax`), the index register is `Ri` (`%rcx`), the scale is `S` (`4`), and the displacement is `D` (`8`).

---

## Concept Unit: The mov family

### The Problem
We know how to express operands, but we need instructions to actually move data around. Data comes in different sizes (1 byte, 2 bytes, 4 bytes, 8 bytes). How do we specify the size of the data being moved, and how do we handle moving smaller values into larger registers without leaving garbage in the upper bits?

Before looking at the instructions, consider: if you load a 1-byte `-1` (which is `0xFF`) into a 64-bit register, and you want it to still represent `-1`, what must the upper 56 bits become?

### Introduce the concept in isolation
The `mov` family of instructions has a suffix that specifies the size: `b` (byte, 1), `w` (word, 2), `l` (long, 4), and `q` (quadword, 8). We also have special zero-extending (`movz`) and sign-extending (`movs`) moves. Let's trace a sign-extending move in a throwaway lab.

```c
#include <stdio.h>
#include <stdint.h>

int main() {
    long rax_val = 0;
    int8_t al_val = -1; // 0xFF
    __asm__ (
        "movsbq %1, %%rax\n\t"
        "movq %%rax, %0"
        : "=r" (rax_val)
        : "r" (al_val)
        : "%rax"
    );
    printf("Result: 0x%lx\n", rax_val);
    return 0;
}
```
Output:
```
Result: 0xffffffffffffffff
```
This output proves that `movsbq` (move sign-extended byte to quadword) reads the 1-byte value `0xFF` (`-1`) and copies its sign bit (the highest bit, which is 1) across all the upper 56 bits, correctly yielding the 64-bit representation of `-1`. By contrast, `movzbq` would zero-extend it, yielding `0x00000000000000FF` (255).

### Discard the throwaway example
The inline assembly lab above is deleted and will not appear in our project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `arithmetic.s` (modified)
- **Change type:** Add
- **Location:** Below the operand examples.
- **Dependencies:** None.

### The New Code — type it yourself
```asm
# The mov family:
    movb  $0x41, %al      # al = 65 = 'A' (1 byte)
    movw  $1000, %ax      # ax = 1000 (2 bytes)
    movl  $100000, %eax   # eax = 100000, rax zero-extended (4 bytes)
    movq  $100000, %rax   # rax = 100000 (8 bytes)
    movq  %rdi, %rax      # rax = rdi
    movq  (%rsp), %rax    # rax = Mem[rsp] (load from stack)
    movq  %rax, (%rdi)    # Mem[rdi] = rax (store)
    movq  %rbx, 8(%rdi)   # Mem[rdi+8] = rbx

# Sign-extending and zero-extending:
    movsbq %al,  %rax     # rax = sign_extend(al to 64 bits)
    movzbq %al,  %rax     # rax = zero_extend(al to 64 bits)
    movslq %eax, %rax     # rax = sign_extend(eax to 64 bits)
```

### The Updated Project
```asm
13:    movq  8(%rax,%rcx,4),%rbx # rbx = Mem[rax + rcx*4 + 8]
14: 
15: # The mov family:
16:     movb  $0x41, %al      # al = 65 = 'A' (1 byte)
17:     movw  $1000, %ax      # ax = 1000 (2 bytes)
18:     movl  $100000, %eax   # eax = 100000, rax zero-extended (4 bytes)
19:     movq  $100000, %rax   # rax = 100000 (8 bytes)
20:     movq  %rdi, %rax      # rax = rdi
21:     movq  (%rsp), %rax    # rax = Mem[rsp] (load from stack)
22:     movq  %rax, (%rdi)    # Mem[rdi] = rax (store)
23:     movq  %rbx, 8(%rdi)   # Mem[rdi+8] = rbx
24: 
25: # Sign-extending and zero-extending:
26:     movsbq %al,  %rax     # rax = sign_extend(al to 64 bits)
27:     movzbq %al,  %rax     # rax = zero_extend(al to 64 bits)
28:     movslq %eax, %rax     # rax = sign_extend(eax to 64 bits)
```
The file now includes a catalog of the `mov` instructions used to transfer data of various widths.

### Mechanical walkthrough
- **`movb`, `movw`, `movl`, `movq`**: The base data transfer instructions. They move data from the source operand to the destination. They are sized: `b` (byte, 8-bit), `w` (word, 16-bit), `l` (long, 32-bit), `q` (quadword, 64-bit).
- **`movsbq`**: Move with Sign-extension. Reads a byte (`b`) and expands it to a quadword (`q`) by copying the highest bit of the byte into all the new upper bits. This preserves the value of signed negative integers.
- **`movzbq`**: Move with Zero-extension. Reads a byte (`b`) and expands it to a quadword (`q`) by filling all new upper bits with `0`. This is used for unsigned integers.
- **`movslq`**: Sign-extends a 32-bit long (`l`) to a 64-bit quadword (`q`).

---

## Concept Unit: Arithmetic instructions

### The Problem
With data loaded into registers, we need to manipulate it. How does x86-64 perform addition, subtraction, bitwise operations, and shifting?

Before reading further, notice that x86-64 assembly instructions usually only have two operands. If you need to compute `A = B + C`, how must you structure the instructions?

### Introduce the concept in isolation
Most x86-64 arithmetic instructions mutate their destination operand in place. `addq src, dest` computes `dest = dest + src`. Let's trace a left shift instruction (`salq`) in a throwaway lab.

```c
#include <stdio.h>

int main() {
    long rax_val = 5;
    __asm__ (
        "salq $3, %%rax\n\t"
        "movq %%rax, %0"
        : "=r" (rax_val)
        : "0" (rax_val)
        : "%rax"
    );
    printf("Result: %ld\n", rax_val);
    return 0;
}
```
Output:
```
Result: 40
```
This output proves that `salq $3, %rax` shifts the value `5` left by `3` bits. Mathematically, this is equivalent to multiplying by 2 to the power of 3 (8). Thus, 5 * 8 = 40.

### Discard the throwaway example
The inline assembly lab above is deleted and will not appear in our project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `arithmetic.s` (modified)
- **Change type:** Add
- **Location:** Below the `mov` family.
- **Dependencies:** None.

### The New Code — type it yourself
```asm
# Arithmetic instructions:
    addq  %rsi, %rdi      # rdi = rdi + rsi
    subq  %rsi, %rdi      # rdi = rdi - rsi
    imulq %rsi, %rdi      # rdi = rdi * rsi (signed, low 64 bits)
    andq  %rsi, %rdi      # rdi = rdi & rsi
    orq   %rsi, %rdi      # rdi = rdi | rsi
    xorq  %rsi, %rdi      # rdi = rdi ^ rsi
    incq  %rax            # rax = rax + 1
    decq  %rax            # rax = rax - 1
    negq  %rax            # rax = -rax
    notq  %rax            # rax = ~rax
    salq  $3, %rax        # rax = rax << 3 (* 8)
    sarq  $1, %rax        # rax = rax >> 1 (arithmetic, sign-extends)
    shrq  $1, %rax        # rax = rax >> 1 (logical, zero-fills)
    salq  %cl, %rax       # rax = rax << cl (variable shift)
```

### The Updated Project
```asm
28:     movslq %eax, %rax     # rax = sign_extend(eax to 64 bits)
29: 
30: # Arithmetic instructions:
31:     addq  %rsi, %rdi      # rdi = rdi + rsi
32:     subq  %rsi, %rdi      # rdi = rdi - rsi
33:     imulq %rsi, %rdi      # rdi = rdi * rsi (signed, low 64 bits)
34:     andq  %rsi, %rdi      # rdi = rdi & rsi
35:     orq   %rsi, %rdi      # rdi = rdi | rsi
36:     xorq  %rsi, %rdi      # rdi = rdi ^ rsi
37:     incq  %rax            # rax = rax + 1
38:     decq  %rax            # rax = rax - 1
39:     negq  %rax            # rax = -rax
40:     notq  %rax            # rax = ~rax
41:     salq  $3, %rax        # rax = rax << 3 (* 8)
42:     sarq  $1, %rax        # rax = rax >> 1 (arithmetic, sign-extends)
43:     shrq  $1, %rax        # rax = rax >> 1 (logical, zero-fills)
44:     salq  %cl, %rax       # rax = rax << cl (variable shift)
```
The file now contains a reference for the primary arithmetic and logical operations used by the CPU.

### Mechanical walkthrough
- **`addq`, `subq`, `imulq`**: Addition, subtraction, and multiplication. `subq %rsi, %rdi` subtracts the source (`%rsi`) from the destination (`%rdi`) and stores the result in `%rdi`.
- **`andq`, `orq`, `xorq`**: Bitwise logical AND, OR, and XOR operations.
- **`incq`, `decq`**: Increment by 1 and decrement by 1. These take only one operand.
- **`negq`, `notq`**: Two's complement negation (mathematical `-rax`) and bitwise complement (flips all bits, `~rax`).
- **`salq`, `sarq`, `shrq`**: Shift instructions. `salq` is Shift Arithmetic Left. `sarq` is Shift Arithmetic Right, which shifts right while duplicating the sign bit to preserve signed numbers. `shrq` is Shift Logical Right, which shifts right and fills the new upper bits with zeros. When the shift amount is variable, it must be provided in the `%cl` register (the lowest byte of `%rcx`).

---

## Concept Unit: The leaq instruction -- address arithmetic

### The Problem
When accessing memory, the CPU has a dedicated hardware circuit to quickly calculate complex addresses like `(%rdi,%rdi,2)`. What if we just wanted to perform that exact mathematical calculation `(x + x*2)` without actually reading memory?

Before looking at `leaq`, consider how many standard `addq` and `imulq` instructions it would take to compute `x * 5 + 3`.

### Introduce the concept in isolation
The `leaq` (Load Effective Address) instruction uses the CPU's memory addressing circuitry to compute mathematics instead of touching memory. We can test this clever compiler trick in a throwaway lab.

```c
#include <stdio.h>

int main() {
    long rdi_val = 10;
    long result;
    __asm__ (
        "leaq 3(%%rdi,%%rdi,4), %%rax\n\t"
        "movq %%rax, %0"
        : "=r" (result)
        : "D" (rdi_val)
        : "%rax"
    );
    printf("Result: %ld\n", result);
    return 0;
}
```
Output:
```
Result: 53
```
This output proves that `leaq 3(%rdi,%rdi,4), %rax` computes `%rdi + %rdi*4 + 3` (which is $5 \times 10 + 3 = 53$) and stores the integer result in `%rax`. It does not attempt to access memory address 53.

### Discard the throwaway example
The inline assembly lab above is deleted and will not appear in our project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `arithmetic.s` (modified)
- **Change type:** Add
- **Location:** Below the arithmetic instructions.
- **Dependencies:** None.

### The New Code — type it yourself
```asm
# The leaq instruction -- address arithmetic:
    leaq  24(%rdi), %rax      # rax = rdi + 24 (address of arr[3] for long arr)
    leaq  (%rdi,%rsi), %rax   # rax = rdi + rsi
    leaq  (%rdi,%rdi,2), %rax # rax = rdi*3
    leaq  0(,%rdi,4), %rax    # rax = rdi*4
    leaq  3(%rdi,%rdi,4), %rax # rax = 5*rdi + 3
```

### The Updated Project
```asm
44:     salq  %cl, %rax       # rax = rax << cl (variable shift)
45: 
46: # The leaq instruction -- address arithmetic:
47:     leaq  24(%rdi), %rax      # rax = rdi + 24 (address of arr[3] for long arr)
48:     leaq  (%rdi,%rsi), %rax   # rax = rdi + rsi
49:     leaq  (%rdi,%rdi,2), %rax # rax = rdi*3
50:     leaq  0(,%rdi,4), %rax    # rax = rdi*4
51:     leaq  3(%rdi,%rdi,4), %rax # rax = 5*rdi + 3
```
The file now highlights how `leaq` acts as a multi-purpose arithmetic instruction.

### Mechanical walkthrough
- **`leaq`**: Load Effective Address. Unlike `movq`, which reads the data *at* a memory address, `leaq` simply computes the address itself and stores that number in the destination register.
- **`leaq 24(%rdi), %rax`**: Computes `%rdi + 24`. If `%rdi` holds a pointer, this computes a pointer to the 4th element of an array of 8-byte integers.
- **`leaq (%rdi,%rdi,2), %rax`**: Computes `%rdi + %rdi*2 = %rdi * 3`. Compilers use this to multiply by 3, 4, 5, 8, or 9 in a single, extremely fast instruction without using the slower `imulq`.
- **`leaq 3(%rdi,%rdi,4), %rax`**: Computes $5 \times \%rdi + 3$. This does the work of an addition, a multiplication, and another addition, all in one step, without ever touching memory.

---

## Concept Unit: Division

### The Problem
Division in x86-64 is notoriously strange compared to addition or multiplication. A 64-bit integer division actually expects a 128-bit dividend. How do we prepare the registers so we can divide a standard 64-bit number?

### Introduce the concept in isolation
The `idivq` instruction divides a 128-bit number stored across *two* registers (`%rdx` and `%rax`) by a source operand. To divide a normal 64-bit number in `%rax`, we must use the `cqto` instruction to sign-extend `%rax` into `%rdx` before dividing. Let's trace it in a throwaway lab.

```c
#include <stdio.h>

int main() {
    long dividend = 17;
    long divisor = 5;
    long quotient, remainder;
    __asm__ (
        "movq %2, %%rax\n\t"
        "cqto\n\t"
        "idivq %3\n\t"
        "movq %%rax, %0\n\t"
        "movq %%rdx, %1\n\t"
        : "=r" (quotient), "=r" (remainder)
        : "r" (dividend), "r" (divisor)
        : "%rax", "%rdx"
    );
    printf("Quotient: %ld, Remainder: %ld\n", quotient, remainder);
    return 0;
}
```
Output:
```
Quotient: 3, Remainder: 2
```
This output proves that setting `%rax=17`, running `cqto` (which sets `%rdx=0` since 17 is positive), and running `idivq` by 5 places the quotient (3) into `%rax` and the remainder (2) into `%rdx`.

### Discard the throwaway example
The inline assembly lab above is deleted and will not appear in our project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `arithmetic.s` (modified)
- **Change type:** Add
- **Location:** Below the `leaq` instructions.
- **Dependencies:** None.

### The New Code — type it yourself
```asm
# idivq S: signed divide rdx:rax by S
# quotient -> rax, remainder -> rdx
# Setup: cqto sign-extends rax into rdx:rax

# long q = a / b;  long r = a % b;
    movq  %rdi, %rax    # rax = a
    cqto                # sign-extend rax into rdx:rax
    idivq %rsi          # rax = a/b, rdx = a%b

# For unsigned division:
    movq  %rdi, %rax
    xorq  %rdx, %rdx    # rdx = 0
    divq  %rsi          # rax = quotient, rdx = remainder
```

### The Updated Project
```asm
51:     leaq  3(%rdi,%rdi,4), %rax # rax = 5*rdi + 3
52: 
53: # idivq S: signed divide rdx:rax by S
54: # quotient -> rax, remainder -> rdx
55: # Setup: cqto sign-extends rax into rdx:rax
56: 
57: # long q = a / b;  long r = a % b;
58:     movq  %rdi, %rax    # rax = a
59:     cqto                # sign-extend rax into rdx:rax
60:     idivq %rsi          # rax = a/b, rdx = a%b
61: 
62: # For unsigned division:
63:     movq  %rdi, %rax
64:     xorq  %rdx, %rdx    # rdx = 0
65:     divq  %rsi          # rax = quotient, rdx = remainder
```
The file now demonstrates the rigid multi-instruction sequence required to perform division.

### Mechanical walkthrough
- **`movq %rdi, %rax`**: Division always expects the dividend to be in `%rax`. We must move it there first.
- **`cqto`**: Convert Quadword to Octaword. This instruction takes the 64-bit value in `%rax` and sign-extends it into `%rdx`. If `%rax` is positive, `%rdx` becomes all zeros. If `%rax` is negative, `%rdx` becomes all ones. This forms the required 128-bit input.
- **`idivq %rsi`**: Signed divide. It divides the 128-bit value `%rdx:%rax` by the source operand `%rsi`.
- **Quotient and Remainder**: The division instruction magically deposits two results at once: the quotient goes into `%rax`, and the remainder goes into `%rdx`.
- **`xorq %rdx, %rdx`**: For unsigned division (`divq`), we do not sign extend. Instead, we manually zero out `%rdx` by XORing it with itself.

---

## Concept Unit: Reading compiler output -- a complete traced function

### The Problem
We have learned the individual instructions. But how do these pieces fit together when a C compiler actually generates a function? Can we read and trace the assembly back to the original C code?

### Introduce the concept in isolation
Let's look at a complete C function and the exact assembly `gcc` generates for it, and trace it mechanically.

```c
long arith(long x, long y, long z)
{
    long t1 = x + y;
    long t2 = z * 48;
    long t3 = t1 & 0x0F0F;
    return t2 - t3;
}
```
If we trace the assembly output for this function with the inputs `x=10, y=6, z=3`, we can follow the exact hardware state changes.

### Discard the throwaway example
The C function above is a conceptual example for tracing; we will now write its assembly representation into our project file.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `arithmetic.s` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself
```asm
arith:
    leaq  (%rdi,%rsi), %rax    # rax = x + y = t1
    andq  $0x0F0F, %rax        # rax = t1 & 0x0F0F = t3
    imulq $48, %rdx, %rdx      # rdx = z * 48 = t2
    subq  %rax, %rdx           # rdx = t2 - t3
    movq  %rdx, %rax           # return value in rax
    ret
```

### The Updated Project
```asm
65:     divq  %rsi          # rax = quotient, rdx = remainder
66: 
67: arith:
68:     leaq  (%rdi,%rsi), %rax    # rax = x + y = t1
69:     andq  $0x0F0F, %rax        # rax = t1 & 0x0F0F = t3
70:     imulq $48, %rdx, %rdx      # rdx = z * 48 = t2
71:     subq  %rax, %rdx           # rdx = t2 - t3
72:     movq  %rdx, %rax           # return value in rax
73:     ret
```
The file now contains a complete, functional assembly routine that mirrors compiler output.

### Mechanical walkthrough
Let's trace the execution with inputs `x=10` (in `%rdi`), `y=6` (in `%rsi`), and `z=3` (in `%rdx`).
- **`leaq (%rdi,%rsi), %rax`**: Computes `%rdi + %rsi` (`10 + 6 = 16`). Stores 16 in `%rax`. This is `t1`.
- **`andq $0x0F0F, %rax`**: Performs a bitwise AND on `%rax` (16, which is `0x10`) with `0x0F0F`. `0x10 & 0x0F0F` remains `16`. `%rax` is now 16. This is `t3`.
- **`imulq $48, %rdx, %rdx`**: This is a three-operand multiplication (an x86 extension). It multiplies `%rdx` (3) by the immediate 48. 3 * 48 = 144. Stores 144 back in `%rdx`. This is `t2`.
- **`subq %rax, %rdx`**: Subtracts `%rax` (16) from `%rdx` (144). 144 - 16 = 128. Stores 128 in `%rdx`.
- **`movq %rdx, %rax`**: Copies 128 from `%rdx` into `%rax`. The caller always expects the return value in `%rax`.
- **`ret`**: Returns control to the caller. The final return value is 128.

---

Lesson 07 covers control flow -- how if/else and loops compile to conditional jumps.

**Exercises:** Trace the assembly for `long f(long a) { return a*3 + a*2 - 7; }` assuming `gcc` uses `leaq`.
