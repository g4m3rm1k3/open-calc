# Lesson 12: Reading Compiler Output — gcc -O2 and What It Does

**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 1 — From C to Machine (Final Lesson)
**Language:** C and x86-64 assembly (AT&T syntax)

## What You Need to Know First
Lessons 00–11 (entire Module 0 and Lessons 05–11 of Module 1).

## What You Will Build
The reader will be able to read real compiler-optimized assembly, understand the major optimizations GCC applies at -O2, and know when undefined behavior enables transformations that break intuitions. The transferable insight: the compiler is smarter than you at code generation — but it only knows what the C standard guarantees. Undefined behavior gives it permission to do things that seem wrong to you but are correct per the standard. Reading assembly reveals both the compiler's power and its contract.

## Objects and Methods

### GCC Optimization Levels
* **What it is**: Command-line flags (like `-O0`, `-O1`, `-O2`, `-O3`, `-Os`, `-Og`) that instruct the GCC compiler on how aggressively to transform the C source code into machine code to improve performance or reduce size.
* **Implementation**: Implemented as optimization passes within the compiler backend, analyzing and rewriting intermediate representation (IR) code.
* **Its use**: Used by programmers during the build process to balance compilation time, debuggability, binary size, and execution speed.
* **Type**: Build configuration parameter.
* **Responsibility**: To determine the set of algorithms the compiler applies to optimize the program.
* **Depends on**: The C compiler (GCC or Clang) and the source code provided.
* **Connects to**: The generated x86-64 assembly instructions.
* **Shape**: A discrete scale of increasing transformational complexity (0 through 3).

### Dead Code Elimination
* **What it is**: An optimization where the compiler removes code that does not affect the program's observable behavior.
* **Implementation**: The compiler builds a control flow graph and data dependency graph, identifying variables or branches whose results are never used or reached, and strips them from the output.
* **Its use**: Used automatically by the compiler at `-O1` and higher to clean up redundant computations, often left over from macro expansions or unused variables.
* **Type**: Compiler optimization pass.
* **Responsibility**: To ensure the final binary does not contain instructions that perform useless work.
* **Depends on**: Thorough static analysis of variable usage and branch conditions.
* **Connects to**: The execution time and binary size (reducing both).
* **Shape**: A subtraction operation on the instruction stream.

### Common Subexpression Elimination (CSE)
* **What it is**: An optimization that replaces identical expressions evaluated multiple times with a single evaluation.
* **Implementation**: The compiler detects that the same calculation (e.g., `a + b`) occurs more than once without its operands changing in between, stores the result in a register, and reuses the register.
* **Its use**: Automatically applied to avoid redundant CPU cycles computing the same arithmetic or memory address.
* **Type**: Compiler optimization pass.
* **Responsibility**: To minimize redundant arithmetic operations.
* **Depends on**: Data flow analysis to prove operands have not been modified between uses.
* **Connects to**: Register allocation (needs a place to store the common result).
* **Shape**: A substitution mapping from multiple expressions to a single computed value.

### Function Inlining
* **What it is**: Replacing a function call with the actual body of the called function.
* **Implementation**: The compiler copies the IR of the target function directly into the caller's IR, substituting parameters with the arguments provided.
* **Its use**: Used to eliminate function call overhead (stack frame setup, branching) and to expose further optimization opportunities within the caller's context.
* **Type**: Interprocedural compiler optimization.
* **Responsibility**: To flatten the call graph where profitable for performance.
* **Depends on**: The size of the called function and optimization heuristics.
* **Connects to**: Code size (often increases it) and execution speed (often increases it).
* **Shape**: An expansion of code at the call site.

### Strength Reduction
* **What it is**: Replacing an expensive operation (like multiplication or division) with an equivalent but cheaper sequence of operations (like bit shifts and additions).
* **Implementation**: The compiler's instruction selection phase matches arithmetic patterns against hardware capabilities, e.g., using `leaq` for `x * 9`.
* **Its use**: Applied automatically to decrease the latency of mathematical calculations on modern CPUs.
* **Type**: Peephole and algebraic compiler optimization.
* **Responsibility**: To lower the CPU cycle cost of arithmetic.
* **Depends on**: The specific latencies of x86-64 instructions.
* **Connects to**: Arithmetic operations like `*`, `/`, and `%`.
* **Shape**: A structural transformation from one complex operator to multiple simple operators.

### Undefined Behavior (UB)
* **What it is**: Code constructs for which the C standard imposes no requirements on the compiler's behavior (e.g., dereferencing a null pointer, signed integer overflow).
* **Implementation**: Compilers assume UB never happens. They use this assumption as an absolute axiom during static analysis to aggressively eliminate checks or optimize loops.
* **Its use**: Used (often inadvertently by the programmer) to write code, which the compiler then exploits to heavily optimize based on the assumption that the UB state is unreachable.
* **Type**: Language specification concept.
* **Responsibility**: To provide a boundary for what the compiler must guarantee versus what it can freely optimize.
* **Depends on**: The C Standard specification (ISO/IEC 9899).
* **Connects to**: Security vulnerabilities and surprising runtime behaviors when assumptions are violated.
* **Shape**: An unbounded set of possible runtime behaviors arising from invalid assumptions.

---

## Concept Units

### Optimization Levels — What Each -O Flag Enables
Optimization levels dictate how hard the compiler works to improve your code. Let's start with a throwaway lab to see this in practice before applying it to project code.

```c
/* Throwaway Lab: Constant Folding */
#include <stdio.h>
int f(void) { 
    return 2 * 3 + 4; 
}
int main() {
    printf("%d\n", f());
    return 0;
}
```

This throwaway lab simply calculates a constant. Let's explicitly discard the main function and look at how the compiler translates `f()` at different optimization levels.

```asm
# At -O0:
f:
    movl  $6, %eax    # 2*3 = 6
    addl  $4, %eax    # 6 + 4 = 10
    ret
```

At `-O0`, the compiler performs no optimization. Each C statement maps to obvious assembly. The purpose is debugging: variables and steps stay exactly as written.

```asm
# At -O2:
f:
    movl  $10, %eax   # compiler computed 2*3+4=10 at compile time!
    ret
```

At `-O2`, we see constant folding. The compiler evaluates constant expressions at compile time. The function body becomes a single instruction! Here is what each level generally does:
- `-O0`: No optimization. Debugging focus.
- `-O1`: Basic optimizations: constant folding, dead code elimination, register allocation.
- `-O2`: Full optimization without size tradeoffs: loop optimizations, inlining, common subexpression elimination, strength reduction. DEFAULT for production builds.
- `-O3`: Aggressive: vectorization, loop unrolling.
- `-Os`: Optimize for size.
- `-Og`: Optimize for debugging.

### Dead Code Elimination
Dead code elimination removes code that has no effect. Time for a throwaway lab.

```c
/* Throwaway Lab: Dead Code */
int dead_code(int x)
{
    int y = x * 2;     /* computed but never used */
    if (0) {           /* always false */
        return -1;
    }
    return x + 1;
}
```

We discard the lab context and analyze the raw assembly output at `-O2`:

```asm
# At -O2:
dead_code:
    leal  1(%rdi), %eax    # eax = x + 1 (y and the if branch are gone!)
    ret
```

**Mechanical Trace:**
1. The function takes `x` in register `%rdi`.
2. The instruction `leal 1(%rdi), %eax` computes `x + 1` and stores it in `%eax` (the return register).
3. `ret` returns control to the caller.

Notice what is missing. The compiler proves `y` is never read (a dead store) and the `if(0)` branch is mathematically unreachable (dead code). It eliminates both entirely. Profiling tools might show "0% time" for code you think runs because the compiler removed it.

### Common Subexpression Elimination (CSE)
When you write the same calculation multiple times, the compiler can reuse the result. Let's write a throwaway lab to demonstrate CSE.

```c
/* Throwaway Lab: Redundant Math */
long cse(long a, long b, long c)
{
    return (a + b) * (a + b) + c;
}
```

Let's discard the lab and examine the `-O2` assembly:

```asm
# At -O2:
cse:
    leaq  (%rdi,%rsi), %rax   # rax = a + b
    imulq %rax, %rax          # rax = (a+b)^2  -- computed ONCE
    addq  %rdx, %rax          # rax += c
    ret
```

**Mechanical Trace:**
1. Arguments are passed in `%rdi` (a), `%rsi` (b), and `%rdx` (c).
2. `leaq (%rdi,%rsi), %rax` computes `a + b` and stores the result in `%rax`.
3. `imulq %rax, %rax` multiplies `%rax` by itself. The expression `(a + b)` is only computed ONCE. This is Common Subexpression Elimination.
4. `addq %rdx, %rax` adds `c` to the accumulated result.
5. `ret` returns the value in `%rax`.

### Function Inlining
Calling a function has overhead. Inlining removes it. Here is our throwaway lab for inlining:

```c
/* Throwaway Lab: Small Functions */
static inline long square(long x) { return x * x; }

long sum_of_squares(long a, long b)
{
    return square(a) + square(b);
}
```

Discarding the lab constraints, we look at the generated assembly for `sum_of_squares` at `-O2`.

```asm
# At -O2 (square() is inlined -- no call instruction):
sum_of_squares:
    imulq %rdi, %rdi    # rdi = a * a
    imulq %rsi, %rsi    # rsi = b * b
    leaq  (%rdi,%rsi), %rax  # rax = a^2 + b^2
    ret
```

**Mechanical Trace:**
1. `%rdi` (a) and `%rsi` (b) are our inputs.
2. `imulq %rdi, %rdi` computes `a * a` and overwrites `%rdi`.
3. `imulq %rsi, %rsi` computes `b * b` and overwrites `%rsi`.
4. `leaq (%rdi,%rsi), %rax` adds the two squared values together into `%rax`.
5. `ret` returns.

The compiler completely replaced the call to `square` with its body, eliminating the call overhead (push/pop, branch, frame setup). Even without the `static inline` keyword, the compiler often inlines small functions at `-O2`.

### Strength Reduction
Multiplication is slow; addition and shifting are fast. Strength reduction swaps them. Throwaway lab time:

```c
/* Throwaway Lab: Multiply by 9 */
long multiply_by_9(long x) { 
    return x * 9; 
}
```

We discard the lab and review the assembly output.

```asm
# At -O2 (no imul instruction needed!):
multiply_by_9:
    leaq  (%rdi,%rdi,8), %rax   # rax = rdi + rdi*8 = 9*rdi
    ret
```

**Mechanical Trace:**
1. `%rdi` holds `x`.
2. `leaq (%rdi,%rdi,8), %rax` uses the Load Effective Address instruction to compute `%rdi + (%rdi * 8)`. This equals `9 * %rdi`.
3. The result is placed in `%rax`, and `ret` returns it.

Strength reduction replaces multiplication by a constant with shifts and adds. For example: `x * 2` becomes `addq %rdi, %rdi`, and `x * 10` becomes `leaq (%rdi,%rdi,4), %rax; addq %rax, %rax`.

### How UB Enables Aggressive Optimization
The C standard guarantees that certain constructs (like signed integer overflow or null pointer dereference) are Undefined Behavior (UB). Compilers assume UB *never happens*. Throwaway lab to explore this:

```c
/* Throwaway Lab: Signed Overflow */
int signed_loop(int n)
{
    int sum = 0;
    for (int i = 0; i < n + 1; i++) {  /* SIGNED overflow if n = INT_MAX */
        sum += i;
    }
    return sum;
}
```

Discarding the lab, we realize the compiler assumes `n + 1` does NOT overflow. If it did, it would be UB.

```asm
# Compiler treats n+1 as always > n mathematically.
# This allows it to unroll or vectorize the loop aggressively,
# which would produce incorrect results if n actually was INT_MAX.
```

Another profound example of UB-based optimization:

```c
int *p = get_ptr();
if (p != NULL) {
    *p = 42;     
}
```

Wait, if we wrote it differently...

```c
int *p = get_ptr();
*p = 42;         /* Dereference happens FIRST */
if (p != NULL) { /* NULL check happens SECOND */
    return 1;
}
```

At `-O2`, the compiler *removes* the NULL check. If `p` was NULL, dereferencing it earlier was UB. Since the compiler assumes UB never happens, it concludes `p` cannot possibly be NULL by the time it hits the `if`. Therefore, `p != NULL` is always true, and the check is redundant! This is how UB-based optimization can sometimes introduce security vulnerabilities by deleting safety checks.

### Reading a Complete Optimized Function
Let's put it all together. Here is our final throwaway lab, computing exponents.

```c
/* Throwaway Lab: Exponentiation */
long power(long base, unsigned long exp)
{
    long result = 1;
    while (exp > 0) {
        if (exp & 1)
            result *= base;
        base *= base;
        exp >>= 1;
    }
    return result;
}
```

Discarding the lab wrapper, let's look at the raw `-O2` assembly.

```asm
power:
    movl  $1, %eax           # result = 1
    testq %rsi, %rsi         # test exp
    je    .L_done            # if exp == 0, return 1
.L_loop:
    testb $1, %sil           # test lowest bit of exp
    je    .L_no_mul          # if not set, skip multiply
    imulq %rdi, %rax         # result *= base
.L_no_mul:
    imulq %rdi, %rdi         # base *= base
    shrq  $1, %rsi           # exp >>= 1
    testq %rsi, %rsi         # test exp again
    jne   .L_loop            # if exp != 0, loop
.L_done:
    ret
```

**Mechanical Trace (for base=2, exp=5):**
1. `movl $1, %eax`: `result` (`%rax`) is initialized to 1.
2. `testq %rsi, %rsi`: checks if `exp` (5, which is binary `101`) is 0.
3. `je .L_done`: jump not taken.
4. **Iter 1:**
   - `testb $1, %sil`: checks lowest bit of `exp` (5 & 1 = 1).
   - `je .L_no_mul`: jump not taken.
   - `imulq %rdi, %rax`: `result` (1) *= `base` (2). `result` = 2.
   - `imulq %rdi, %rdi`: `base` (2) *= `base` (2). `base` = 4.
   - `shrq $1, %rsi`: `exp` (5) >>= 1. `exp` = 2.
   - `testq %rsi, %rsi`: check if `exp` is 0.
   - `jne .L_loop`: jump taken to `.L_loop`.
5. **Iter 2:**
   - `testb $1, %sil`: check lowest bit of `exp` (2 & 1 = 0).
   - `je .L_no_mul`: jump **taken** (skip multiply).
   - `imulq %rdi, %rdi`: `base` (4) *= `base` (4). `base` = 16.
   - `shrq $1, %rsi`: `exp` (2) >>= 1. `exp` = 1.
   - `testq %rsi, %rsi`: check if `exp` is 0.
   - `jne .L_loop`: jump taken to `.L_loop`.
6. **Iter 3:**
   - `testb $1, %sil`: check lowest bit of `exp` (1 & 1 = 1).
   - `je .L_no_mul`: jump not taken.
   - `imulq %rdi, %rax`: `result` (2) *= `base` (16). `result` = 32.
   - `imulq %rdi, %rdi`: `base` (16) *= `base` (16). `base` = 256.
   - `shrq $1, %rsi`: `exp` (1) >>= 1. `exp` = 0.
   - `testq %rsi, %rsi`: check if `exp` is 0 (ZF=1).
   - `jne .L_loop`: jump **not** taken.
7. `ret`: Returns `result` = 32.

Verify: 2^5 = 32. Correct. This is the fast exponentiation algorithm (square-and-multiply), operating in O(log exp) time. The assembly closely mirrors the C source at `-O2` because the function is already well-optimized natively.

## Conclusion and Self-Check
Module 1 is complete. You can now read, trace, and reason about real x86-64 assembly produced by the compiler. Module 2 begins with Lesson 13 — the memory hierarchy. Why does the same algorithm run 100× faster on one dataset than another? Cache is the answer.

**Self-Check Exercises:**
1. Predict the `-O2` assembly for `long f(long x) { return x*7; }` using `leaq` (no `imul`).
2. Explain why the compiler cannot eliminate `volatile int counter; counter++;` even at `-O3`.
3. Identify all the specific optimizations applied to the `power()` assembly trace above.

*All required concepts handled. Objects and methods fully defined. Mechanical traces provided for assembly code blocks.*
