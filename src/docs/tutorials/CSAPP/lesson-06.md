# Lesson 06: x86-64 Assembly — Registers, Operands, and the mov Instruction

What you will build: The reader will be able to read x86-64 assembly. They will understand the 16 integer registers, their naming conventions and sizes (%rax/%eax/%ax/%al), operand forms (immediate, register, memory), and the mov family of instructions. The transferable insight: assembly is not mysterious. It is a human-readable name for machine instructions. Every C statement you write compiles to 1-5 assembly instructions. Reading the assembly the compiler generates tells you exactly what the hardware does.

What you need to know first: Lessons 00-05.

### Terms used in this lesson
**Register** — A small, extremely fast storage location directly inside the CPU. They exist to hold the immediate data the CPU is currently operating on, because accessing main memory is too slow.
**Zero-extension** — The process of widening a value to a larger bit width by filling the new upper bits with zeros. It exists to ensure that moving a smaller unsigned value into a larger register doesn't leave garbage in the upper bits.
**Sign-extension** — The process of widening a value to a larger bit width by copying the sign bit (the most significant bit) into all the new upper bits. It exists to preserve the numerical value of signed integers when they are widened.
**Effective Address** — The computed memory address from which data will be loaded or to which data will be stored, calculated using a base register, index register, scale, and displacement. It exists to allow assembly to naturally express array indexing and struct field access.

### Objects and methods used

**%rax**
- *What it is:* The primary 64-bit general-purpose accumulator register.
- *Implementation:* 64-bit hardware register `rax`. The lower 32 bits are `eax`, lower 16 are `ax`, lower 8 are `al`.
- *Its use:* Used as the destination for the return value of a function, and for general arithmetic.
- *Type:* Hardware register.
- *Responsibility:* Holds intermediate arithmetic results and function return values.
- *Depends on:* The CPU state.
- *Connects to:* Instructions that read/write it, calling convention (caller expects return value here).
- *Shape:* Internal CPU state boundary.

**movq**
- *What it is:* Move quadword (64-bit) instruction.
- *Implementation:* Assembly instruction taking a source and destination operand.
- *Its use:* Used to copy 64 bits of data between registers, or between memory and registers.
- *Type:* CPU instruction.
- *Responsibility:* Accurately copying exactly 64 bits from the source to the destination.
- *Depends on:* Valid source and destination operands.
- *Connects to:* Source (read), Destination (write).
- *Shape:* Fundamental execution building block.

**leaq**
- *What it is:* Load Effective Address quadword instruction.
- *Implementation:* Assembly instruction taking a memory operand (source) and a register (destination).
- *Its use:* Used to compute addresses without actually reading from memory, or for fast integer arithmetic (multiplication and addition in one step).
- *Type:* CPU instruction.
- *Responsibility:* Computes the effective address of the source operand and stores that *address* (not the data at that address) into the destination register.
- *Depends on:* Base/index registers and displacement specified in the source operand.
- *Connects to:* Source (address computation), Destination (write).
- *Shape:* Memory addressing / ALU trick.

**gcc**
- *What it is:* The GNU Compiler Collection C compiler.
- *Implementation:* Command-line executable `gcc`.
- *Its use:* Used with the `-S` flag to translate C code into human-readable assembly language instead of compiling all the way to a binary executable.
- *Type:* Tooling.
- *Responsibility:* Translating higher-level C source code into valid x86-64 assembly instructions.
- *Depends on:* Valid C source file.
- *Connects to:* Source code (read), Assembly file (write).
- *Shape:* Build pipeline.

(Everything else in the file, not this lesson's subject but still explained)
**printf**
- *What it is:* C standard library formatted print function.
- *Implementation:* `int printf(const char *format, ...);`
- *Its use:* Used to output the contents of variables to the console to observe their state.
- *Type:* Standard library function.
- *Responsibility:* Formatting values according to a format string and writing the result to standard output.
- *Depends on:* A format string and matching arguments.
- *Connects to:* Standard output stream.
- *Shape:* I/O boundary.

## Concept Unit: The 16 integer registers — naming and sizes

### The Problem
When we write `int x = 5;` in C, where does that `5` actually go inside the CPU? How does the processor hold onto values it is currently doing math on, since reading from main memory for every single addition would be incredibly slow? How can a 64-bit processor work with 32-bit or 8-bit variables efficiently?

### Introduce the concept in isolation
```c
/* C code to inspect register behavior indirectly: */
#include <stdio.h>

int main(void) {
    long rax_val = 0x0123456789ABCDEFL;  /* 64-bit value */

    /* In assembly, 'rax' holds all 64 bits */
    /* 'eax' is the LOW 32 bits: 0x89ABCDEF */
    /* 'ax'  is the LOW 16 bits: 0xCDEF */
    /* 'al'  is the LOW  8 bits: 0xEF */
    /* 'ah'  is bits 8-15:       0xCD */

    /* Writing to eax ZERO-EXTENDS to rax (clears upper 32 bits!) */
    /* Writing to ax  does NOT affect upper bits */
    /* This is a common assembly gotcha */

    printf("64-bit: 0x%016lx\n", rax_val);
    printf("Low 32: 0x%08x\n",  (unsigned int)rax_val);       /* 89abcdef */
    printf("Low 16: 0x%04x\n",  (unsigned short)rax_val);     /* cdef */
    printf("Low  8: 0x%02x\n",  (unsigned char)rax_val);      /* ef */
    printf("Bits 8-15: 0x%02x\n", (unsigned char)(rax_val >> 8)); /* cd */
    return 0;
}
```
Trace: `rax_val` = 0x0123456789ABCDEF. Low 32 bits = `(unsigned int)rax_val` = 0x89ABCDEF (C truncates on cast). Low 16 = 0xCDEF. Low 8 = 0xEF. Bits 8-15: shift right 8, then mask to 8 bits = 0xCD. This proves that a single 64-bit register can be accessed in smaller chunks using specific names, acting like overlapping storage.

### Discard the throwaway
This C code simulation is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None — this is a from-scratch addition because we are examining the assembly directly.
- **Files affected**: `registers.txt` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: None.

### The New Code
```text
%rax / %eax / %ax / %al   - accumulator, return value
%rbx / %ebx / %bx / %bl   - callee-saved
%rcx / %ecx / %cx / %cl   - 4th arg, loop counter
%rdx / %edx / %dx / %dl   - 3rd arg
%rsi / %esi / %si / %sil  - 2nd arg
%rdi / %edi / %di / %dil  - 1st arg
%rsp / %esp / %sp / %spl  - stack pointer (DO NOT modify casually)
%rbp / %ebp / %bp / %bpl  - frame pointer (callee-saved)
%r8  / %r8d / %r8w / %r8b - 5th arg
%r9  / %r9d / %r9w / %r9b - 6th arg
%r10 / %r10d / %r10w / %r10b - caller-saved
%r11 / %r11d / %r11w / %r11b - caller-saved
%r12 / %r12d / %r12w / %r12b - callee-saved
%r13 / %r13d / %r13w / %r13b - callee-saved
%r14 / %r14d / %r14w / %r14b - callee-saved
%r15 / %r15d / %r15w / %r15b - callee-saved
```

### The Updated Project
```text
1: %rax / %eax / %ax / %al   - accumulator, return value
2: %rbx / %ebx / %bx / %bl   - callee-saved
3: %rcx / %ecx / %cx / %cl   - 4th arg, loop counter
4: %rdx / %edx / %dx / %dl   - 3rd arg
5: %rsi / %esi / %si / %sil  - 2nd arg
6: %rdi / %edi / %di / %dil  - 1st arg
7: %rsp / %esp / %sp / %spl  - stack pointer (DO NOT modify casually)
8: %rbp / %ebp / %bp / %bpl  - frame pointer (callee-saved)
9: %r8  / %r8d / %r8w / %r8b - 5th arg
10: %r9  / %r9d / %r9w / %r9b - 6th arg
11: %r10 / %r10d / %r10w / %r10b - caller-saved
12: %r11 / %r11d / %r11w / %r11b - caller-saved
13: %r12 / %r12d / %r12w / %r12b - callee-saved
14: %r13 / %r13d / %r13w / %r13b - callee-saved
15: %r14 / %r14d / %r14w / %r14b - callee-saved
16: %r15 / %r15d / %r15w / %r15b - callee-saved
```
This is the complete list of all 16 integer registers available on x86-64 CPUs.

### Mechanical walkthrough
- `%rax`: The syntax for naming the 64-bit accumulator register.
- `%eax`: The syntax for naming the lowest 32 bits of the `%rax` register.
- `%ax`: The syntax for naming the lowest 16 bits of the `%rax` register.
- `%al`: The syntax for naming the lowest 8 bits of the `%rax` register.
- The same naming pattern applies down the list. For the newer registers (`%r8`-`%r15`), they use `d` for 32-bit, `w` for 16-bit, and `b` for 8-bit suffixes.
- Each register has conventional responsibilities (like `%rax` for return values, or `%rdi` for the first argument).

### CS lens
CPU Architecture. The concept of having a very small number of intensely fast local variables built directly into the silicon is fundamental. It appears in GPUs (where thread registers limit occupancy), in JVM bytecode (which uses local variable slots instead of registers), and in network switches (which use fast SRAM analogous to registers for routing).

### SE lens
Design Principle: Backwards Compatibility. The x86 architecture didn't start with 64-bit `%rax`. It started with 16-bit `%ax`, then extended to 32-bit `%eax`, then 64-bit `%rax`. The alternative not chosen was breaking backwards compatibility and inventing all new names. The tradeoff is a somewhat messy naming scheme that perfectly supports 40-year-old software.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The register names are static facts of the architecture, so there is no execution.

### One sentence connecting to previous unit
Now that we know the names of the registers, we need to know how to move data into and out of them.

## Concept Unit: Operand forms — immediate, register, memory

### The Problem
If we have registers, how do we tell the CPU to put the number `42` into one? What if we want to copy a value from one register to another? Or what if our data is out in main memory (like an array or a struct) and we need to fetch it?

### Introduce the concept in isolation
```asm
# Three operand forms:

# Immediate: a literal constant value
    movq   $42,   %rax     # rax = 42
    movq   $0xFF, %rbx     # rbx = 255
    movl   $-1,   %ecx     # ecx = -1 (32-bit move, zero-extends to rcx)

# Register: contents of another register
    movq   %rax,  %rdx     # rdx = rax
    movl   %eax,  %esi     # esi = eax (and clears upper 32 bits of rsi)

# Memory: load from or store to memory address
    movq   (%rax),  %rbx   # rbx = Memory[rax]         (indirect)
    movq   8(%rax), %rcx   # rcx = Memory[rax + 8]     (base+displacement)
    movq   (%rax,%rdx,8), %r8  # r8  = Memory[rax + rdx*8] (base+index*scale)
    movq   %rdi, (%rsp)    # Memory[rsp] = rdi          (store)
```
Trace `movq 8(%rax), %rcx` where `rax=0x1000`: effective address = 0x1000 + 8 = 0x1008. Load 8 bytes from memory address 0x1008 into `rcx`. This accesses the second 8-byte field of a struct at `rax`. Trace `movq (%rax,%rdx,8), %r8` where `rax=0x2000`, `rdx=3`: effective address = 0x2000 + 3*8 = 0x2018. Loads `arr[3]` where `arr` is an array of 8-byte elements at 0x2000. This proves the three distinct ways data is sourced or targeted in assembly.

### Discard the throwaway
This throwaway assembly code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None — this is a from-scratch addition.
- **Files affected**: `operands.asm` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: None.

### The New Code
```asm
# General memory form: D(Rb, Ri, S)
# Address = Rb + Ri * S + D
# D = displacement (signed integer constant)
# Rb = base register
# Ri = index register (not %rsp)
# S = scale: 1, 2, 4, or 8
```

### The Updated Project
```asm
1: # General memory form: D(Rb, Ri, S)
2: # Address = Rb + Ri * S + D
3: # D = displacement (signed integer constant)
4: # Rb = base register
5: # Ri = index register (not %rsp)
6: # S = scale: 1, 2, 4, or 8
```
This is the general formula for all memory operand calculations in x86-64.

### Mechanical walkthrough
- `D`: Displacement. A literal integer offset added to the address.
- `Rb`: Base register. Holds the starting address (like a pointer to an array or struct).
- `Ri`: Index register. Holds an offset or index.
- `S`: Scale. A multiplier for the index (1, 2, 4, or 8), matching common C data type sizes.
- `Rb + Ri * S + D`: The hardware ALU computes this exact mathematical formula to find the final Effective Address before performing the read or write.

### CS lens
Addressing Modes. CPUs provide hardware support for common high-level language constructs. The `D(Rb, Ri, S)` formula maps perfectly to `array[i].field` in C. It appears in ARM architecture (though with different syntax), in JVM array load instructions, and in virtual memory pagetable walks.

### SE lens
Design Principle: Hardware/Software Co-design. The alternative not chosen was forcing the compiler to emit separate addition and multiplication instructions to calculate addresses. The tradeoff is a more complex CPU instruction decoder, in exchange for significantly denser and faster assembly code for array and struct access.

### Commands needed
None for this unit.

### Run it
Predicted confidently: This is a mathematical formula definition, not executable code.

### One sentence connecting to previous unit
With registers and operands understood, we can look at the actual instructions that move data between them.

## Concept Unit: The mov family — movq, movl, movw, movb, movsx, movzx

### The Problem
Since registers have different sizes (8, 16, 32, 64 bits), what happens if we want to move a 32-bit value into a 64-bit register? What goes into the upper 32 bits? Does it matter if the original number was signed or unsigned?

### Introduce the concept in isolation
```asm
# Size suffixes: b=byte(8), w=word(16), l=long(32), q=quad(64)
    movb   $0xFF, %al      # 8-bit move: al = 0xFF
    movw   $0xABCD, %ax    # 16-bit move: ax = 0xABCD
    movl   $0x12345678, %eax  # 32-bit: eax = ..., CLEARS upper 32 bits of rax
    movq   $0x123456789ABCDEF0, %rax  # 64-bit move

# Zero-extension (movzxy: x=src size, y=dst size)
    movzbq  %al, %rbx    # rbx = zero_extend(al to 64 bits)
    movzwq  %ax, %rcx    # rcx = zero_extend(ax to 64 bits)
    # Note: movl to %eax automatically zero-extends to %rax!

# Sign-extension (movsxy: sign-extends src into larger dst)
    movsbq  %al, %rbx    # rbx = sign_extend(al to 64 bits)
    # If al = 0xFF (= -1 as signed byte): rbx = 0xFFFFFFFFFFFFFFFF = -1
    # If al = 0x7F (= 127): rbx = 0x000000000000007F = 127

    movslq  %eax, %rax   # rax = sign_extend(eax to 64 bits)
    # Used when converting int to long
```
Trace `movsbq %al, %rbx` where `al=0xFF`: `al=0xFF` = 255 as unsigned, -1 as signed byte. `movsb` sign-extends: the MSB of `al` is 1 (negative), so it fills all upper bits with 1s: `rbx` = 0xFFFFFFFFFFFFFFFF = -1 as int64. `movzbq` on the same `al=0xFF`: zero-extends by filling upper bits with 0s: `rbx` = 0x00000000000000FF = 255. This proves that how a number is widened depends entirely on whether the compiler knew it was signed or unsigned.

### Discard the throwaway
This throwaway assembly code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None.
- **Files affected**: `mov_family.c` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: None.

### The New Code
```c
/* Corresponding C operations and their assembly: */
long  a = 42L;      /* movq $42, %rax */
int   b = (int)a;   /* movl %eax, %ecx  (or just use %eax directly) */
long  c = b;        /* movslq %eax, %rcx  (sign-extend int to long) */
unsigned char u = 0xFF;
long  d = u;        /* movzbq %al, %rdx   (zero-extend: d = 255, not -1) */
signed char  s = 0xFF;  /* -1 */
long  e = s;        /* movsbq %al, %rsi   (sign-extend: e = -1) */
```

### The Updated Project
```c
1: /* Corresponding C operations and their assembly: */
2: long  a = 42L;      /* movq $42, %rax */
3: int   b = (int)a;   /* movl %eax, %ecx  (or just use %eax directly) */
4: long  c = b;        /* movslq %eax, %rcx  (sign-extend int to long) */
5: unsigned char u = 0xFF;
6: long  d = u;        /* movzbq %al, %rdx   (zero-extend: d = 255, not -1) */
7: signed char  s = 0xFF;  /* -1 */
8: long  e = s;        /* movsbq %al, %rsi   (sign-extend: e = -1) */
```
This shows how C type casts and variable assignments directly map to the various size and extension versions of the `mov` instruction.

### Mechanical walkthrough
- `long a = 42L;`: A 64-bit assignment in C.
- `movq $42, %rax`: The CPU moves a 64-bit immediate into a 64-bit register.
- `int b = (int)a;`: C truncates a 64-bit integer to a 32-bit integer.
- `movl %eax, %ecx`: The CPU copies only the lowest 32 bits.
- `long c = b;`: C widens a signed 32-bit int back to a 64-bit long.
- `movslq %eax, %rcx`: The CPU moves the 32-bit value into a 64-bit register, sign-extending it to preserve the value.
- `unsigned char u = 0xFF;`: C assigns an 8-bit unsigned value.
- `movzbq %al, %rdx`: The CPU moves the 8-bit value into a 64-bit register, zero-extending it because the source type was unsigned.

### CS lens
Type Representation. The hardware has no concept of "signed" or "unsigned" types inherently tied to a register. The compiler enforces the type system by choosing the correct instruction (`movzbq` vs `movsbq`). This appears in network protocol parsing, in database serialization formats, and in WebAssembly type conversions.

### SE lens
Design Principle: Explicitness. The assembly language explicitly encodes the source size, destination size, and extension method directly in the instruction mnemonic (e.g., `movzbq` = move zero-extended byte to quadword). The alternative not chosen is having one generic `mov` and trying to infer sizes from context. The tradeoff is a much larger instruction set manual, but no ambiguity when reading the code.

### Commands needed
None for this unit.

### Run it
Predicted confidently: This is a reference mapping C to assembly concepts; no execution occurs.

### One sentence connecting to previous unit
Now that we understand how individual variables translate to `mov` instructions, we can look at a complete C function compiled to assembly.

## Concept Unit: Seeing C as assembly — gcc -S

### The Problem
How do we actually see the assembly that our C compiler generates? If we compile a program to an executable, it's just raw binary bytes. How can we verify what the hardware is being asked to do?

### Introduce the concept in isolation
```c
/* arith.c */
long arith(long x, long y, long z) {
    long t1 = x + y;
    long t2 = z * 48;
    long t3 = t1 & 0xF;
    return t2 - t3;
}
```
If we run `gcc -S -O2 arith.c -o arith.s`, it creates a text file containing the assembly instead of a binary file.

```asm
# arith.s (gcc -O2 output, simplified):
arith:
    # Arguments: x in %rdi, y in %rsi, z in %rdx
    leaq   (%rdi,%rsi), %rax   # rax = x + y  (t1)
    andl   $15, %eax           # eax = eax & 0xF = t1 & 0xF  (t3)
    # Note: 'andl' zero-extends; safe since 0xF fits in 32 bits
    imulq  $48, %rdx, %rdx    # rdx = z * 48  (t2)
    subq   %rax, %rdx          # rdx = t2 - t3
    movq   %rdx, %rax          # rax = result (return value)
    ret
```
Trace `arith(10, 20, 5)`: `x=%rdi=10`, `y=%rsi=20`, `z=%rdx=5`. `leaq (%rdi,%rsi), %rax`: `rax` = 10+20 = 30 (`t1`). `andl $15, %eax`: `eax` = 30 & 15 = 14 (0b11110 & 0b01111 = 0b01110 = 14) (`t3`). `imulq $48, %rdx, %rdx`: `rdx` = 5*48 = 240 (`t2`). `subq %rax, %rdx`: `rdx` = 240-14 = 226 (`t2-t3`). `movq %rdx, %rax`: return 226. This proves that every C operation maps to a sequential hardware instruction.

### Discard the throwaway
This throwaway C file and its generated assembly are discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None.
- **Files affected**: None. (Using throwaway concepts to analyze tooling).
- **Change type**: configure
- **Location**: Command line.
- **Dependencies**: GCC compiler.

### The New Code
```bash
gcc -S -O2 arith.c -o arith.s
```

### The Updated Project
```bash
1: gcc -S -O2 arith.c -o arith.s
```
This is the command that asks the compiler to emit assembly.

### Mechanical walkthrough
- `gcc`: The GNU Compiler Collection executable.
- `-S`: The flag that tells the compiler to stop after the compilation stage, outputting assembly text rather than running the assembler to create binary object code.
- `-O2`: The flag enabling level 2 optimizations, creating clean, realistic assembly rather than unoptimized, stack-heavy debug code.
- `arith.c`: The input C source file.
- `-o arith.s`: The flag and argument specifying the output file name for the assembly.

### CS lens
Compilation Pipeline. The translation from text to running program is not magic; it is a pipeline of explicit stages (`Text → Lexer → Parser → AST → Semantic Analysis → Assembly → Object Code → Linker → Executable`). The `-S` flag taps the pipeline right before "Object Code", letting us inspect the compiler's output.

### SE lens
Design Principle: Tooling Transparency. We are not forced to guess what the compiler does. The alternative not chosen is a "black box" compiler that only emits finished binaries. The tradeoff is that the compiler must maintain a human-readable assembly format, which adds complexity to the compiler's backend, but makes debugging performance or behavior dramatically easier.

### Commands needed
`gcc -S`

### Run it
Predicted confidently: Running this command on `arith.c` produces the assembly text shown in the isolation step.

### One sentence connecting to previous unit
In the assembly output, we saw an instruction called `leaq` that looked like a memory operand, but was used for arithmetic — which requires its own explanation.

## Concept Unit: The leaq instruction — address arithmetic without memory access

### The Problem
If `movq 8(%rdi,%rsi,4), %rax` computes an address and then reads the memory at that address, what if we just want the address itself? What if we want to calculate `rdi + rsi*4 + 8` as pure math without ever touching memory?

### Introduce the concept in isolation
```asm
# leaq (Load Effective Address) computes an address WITHOUT accessing memory
# Used for: address computation, fast arithmetic

    leaq   (%rdi,%rsi), %rax    # rax = rdi + rsi  (addition with no memory access)
    leaq   (%rdi,%rdi,2), %rax  # rax = rdi + rdi*2 = 3*rdi  (multiply by 3)
    leaq   (%rdi,%rdi,4), %rax  # rax = 5*rdi  (multiply by 5)
    leaq   7(%rdi), %rax        # rax = rdi + 7
    leaq   (%rdi,%rsi,4), %rax  # rax = rdi + 4*rsi
```

```c
/* gcc uses leaq for fast multiplication by constants: */
long times3(long x)  { return x * 3; }
/* Assembly: leaq (%rdi,%rdi,2), %rax  (x + x*2 = 3x, 1 cycle) */
/* Much faster than: imulq $3, %rdi (3-5 cycle multiply) */

long times5(long x)  { return x * 5; }
/* Assembly: leaq (%rdi,%rdi,4), %rax  (x + x*4 = 5x) */

long times9(long x)  { return x * 9; }
/* Assembly: leaq (%rdi,%rdi,8), %rax  (x + x*8 = 9x) */

/* Also used to compute array element address: */
/* &arr[i] where arr is long*: leaq (%rdi,%rsi,8), %rax */
/* rax = arr_base + i*8 (size of long = 8 bytes) */
```
Trace `times3(7)`: `rdi=7`. `leaq (%rdi,%rdi,2), %rax`: `effective_address = 7 + 7*2 = 21`. No memory access! Just address arithmetic. `rax=21`. Return 21. One instruction, 1 CPU cycle, versus `imulq` which takes 3-5 cycles. This proves that `leaq` hijack the CPU's memory addressing hardware to do fast integer math.

### Discard the throwaway
This throwaway demonstration code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None.
- **Files affected**: `leaq.asm` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: None.

### The New Code
```asm
leaq (%rdi,%rdi,2), %rax
```

### The Updated Project
```asm
1: leaq (%rdi,%rdi,2), %rax
```
This is the standard compiler trick for multiplying by 3.

### Mechanical walkthrough
- `leaq`: The Load Effective Address instruction (64-bit quadword version).
- `(`: Begins the memory operand syntax.
- `%rdi`: The base register.
- `,`: Separator.
- `%rdi`: The index register.
- `,2`: The scale factor (multiplying the index register by 2).
- `)`: Ends the memory operand syntax.
- `, %rax`: The destination register where the computed result is stored.

### CS lens
Hardware Optimization. The CPU already has dedicated circuitry (an Address Generation Unit, AGU) to compute `Rb + Ri*S + D` extremely fast. `leaq` just writes that result to a register instead of the memory controller. Reusing existing hardware for a secondary purpose is a classic optimization seen in floating-point units used for fast inverse square roots, and GPUs used for machine learning.

### SE lens
Design Principle: Mechanical Sympathy. The compiler understands the hardware deeply enough to know that an instruction meant for "memory addressing" is actually the fastest way to multiply by 3. The alternative not chosen is always using `imul` for multiplication. The tradeoff is assembly code that can look extremely confusing to a human until they recognize the pattern.

### Commands needed
None for this unit.

### Run it
Predicted confidently: This instruction executes in a single cycle on the hardware to compute `7 + 7*2 = 21`.

### One sentence connecting to previous unit
We have now seen how the CPU calculates values and moves them around.

## Closing

### Connect the pieces
Trace `long y = x + 1` from C through ALL concept units to machine bytes.
First, we define variables in C. The compiler assigns `x` to a 64-bit integer register (Concept 1), perhaps `%rdi`. It needs to add 1 to it. It could use an `addq` instruction with an immediate operand `$1` (Concept 2). Or, it could use `leaq 1(%rdi), %rax` (Concept 5) to compute the address `x + 1` and store it in the return register. If it just needs to move the data, it will use `movq` (Concept 3) to place it in the correct destination. By using `gcc -S` (Concept 4), we can read the exact sequence the compiler chose, proving that assembly is simply a human-readable mnemonic skin over the 1-8 byte machine code sequences the hardware actually runs. Once you know the register names and the three operand forms, reading it is straightforward.
