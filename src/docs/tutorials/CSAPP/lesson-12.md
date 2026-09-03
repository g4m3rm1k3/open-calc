# Lesson 12: Reading Compiler Output — What gcc -O2 Does to Your Code

The reader will be able to take any C function, compile it at -O0 and -O2, and understand what transformations the compiler applied and why. The transferable insight: the -O2 compiler is not magic; it applies a fixed set of well-understood transformations: inlining, constant folding, dead code elimination, strength reduction, and register allocation. Knowing what it can and cannot do tells you when to help it and when to get out of its way.

What you need to know first: Lessons 00-11.

**Terms used in this lesson:**
- **Optimization level (-O0 / -O2)** — Compiler flags that dictate how much effort the compiler spends improving the generated code's performance and size. -O0 (the default) does almost no optimization, mapping C statements directly to assembly for easier debugging. -O2 turns on a broad set of safe optimizations that significantly improve performance.
- **Register allocation** — The process by which the compiler decides which local variables and temporary values should be kept in fast CPU registers rather than slower memory (the stack).
- **Constant folding** — An optimization where the compiler evaluates constant expressions (like `10 + 20`) at compile time rather than emitting instructions to compute them at runtime.
- **Dead code elimination** — An optimization where the compiler removes code that it can prove will never be executed (like branches of an `if` statement whose condition is always false) or whose results are never used.
- **Inlining** — An optimization where the compiler replaces a function call with the actual body of the called function, eliminating the overhead of the `call` and `ret` instructions and setting up a stack frame.
- **Strength reduction** — An optimization where the compiler replaces a computationally expensive operation (like multiplication) with a cheaper but equivalent operation (like addition or bit shifting).
- **Aliasing** — A situation where two different pointers refer to the same memory location. This limits the compiler's ability to optimize memory accesses, as writing to one pointer might unexpectedly change the value read from the other.

**Objects and methods used:**

**`gcc`**
- *What it is:* The GNU Compiler Collection's C compiler driver.
- *Implementation:* An executable command-line tool (`gcc`).
- *Its use:* We use it to compile C source code into assembly language or executable binaries, specifically testing its `-O0` and `-O2` flags to observe their effects.
- *Type:* Command-line executable.
- *Responsibility:* Orchestrates the preprocessing, compilation, assembly, and linking of C programs.
- *Depends on:* Source files, command-line flags (like `-O2`, `-S`).
- *Connects to:* Reads `.c` files, writes `.s` (assembly), `.o` (object), or executable files.
- *Shape:* A build-time tool that sits between the source code and the final executable artifact.

**`restrict`**
- *What it is:* A type qualifier in C (introduced in C99) for pointers.
- *Implementation:* A keyword applied to a pointer declaration (e.g., `int * restrict p`).
- *Its use:* We use it to promise the compiler that the memory accessed through this pointer is not accessed by any other pointer in the same scope, allowing the compiler to perform optimizations (like eliminating redundant memory loads/stores) it otherwise couldn't due to potential aliasing.
- *Type:* C language keyword / type qualifier.
- *Responsibility:* Asserts an absence of aliasing for a specific pointer.
- *Depends on:* Must be applied to a pointer type.
- *Connects to:* Affects the optimizer's assumptions during code generation.
- *Shape:* An internal implementation detail and API contract modifier.

---

## Concept Unit: -O0 vs -O2 — what optimization actually changes

### The Problem
When you write C code, variables exist conceptually. But CPUs don't have C variables; they have a small set of fast registers and a large, slow memory (RAM). How does the compiler decide where to put your variables? If you compile without optimizations, what is the default behavior? Why might this default be terrible for performance?

### Introduce the concept in isolation

```c
/* compile_test.c */
long square(long x) { return x * x; }
```

```asm
# gcc -O0 square:
square:
    pushq  %rbp
    movq   %rsp, %rbp
    movq   %rdi, -8(%rbp)      # spill x to stack
    movq   -8(%rbp), %rax      # reload x from stack
    imulq  -8(%rbp), %rax      # x * x (reads from stack twice!)
    popq   %rbp
    ret
# 7 instructions, accesses memory 3 extra times

# gcc -O2 square:
square:
    movq   %rdi, %rax          # rax = x
    imulq  %rdi, %rax          # rax = x * x
    ret
# 3 instructions, no memory access
```

Trace `-O0`: `x` arrives in the `%rdi` register (standard calling convention). The compiler stores it to the stack memory (`-8(%rbp)`), then immediately reloads it to the `%rax` register. This is needless: `-O0` compiles each statement in isolation with no optimization. At `-O2`: the register allocator keeps `x` in `%rdi` and multiplies `%rdi * %rdi` directly into `%rax`. No stack traffic is generated. This proves that `-O0` heavily relies on memory for safety and debugging, while `-O2` leverages registers for speed.

### Discard the throwaway
The `compile_test.c` file and its functions are discarded and will not be used in the main project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating compiler behavior on basic mathematical functions.
- **Files affected**: Create `math_ops.c`.
- **Change type**: Add.
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code

```c
long sum(long *arr, int n) {
    long s = 0;
    for (int i = 0; i < n; i++)
        s += arr[i];
    return s;
}
```

### The Updated Project

```c
// ← new
1: long sum(long *arr, int n) {
2:     long s = 0;
3:     for (int i = 0; i < n; i++)
4:         s += arr[i];
5:     return s;
6: }
```
We have created a function `sum` that iterates over an array and accumulates its values.

### Mechanical walkthrough
- `long sum(long *arr, int n) {` declares a function returning a `long` integer, taking a pointer to `long` (`arr`) and an integer `n`.
- `long s = 0;` declares a local accumulator variable `s` initialized to `0`.
- `for (int i = 0; i < n; i++)` initiates a loop with an index `i` from `0` up to `n - 1`.
- `s += arr[i];` adds the value at the `i`-th position of the array `arr` to the accumulator `s`.
- `return s;` returns the accumulated sum.

### CS lens
**Register Allocation:** This is a fundamental problem in compiler design—mapping a potentially infinite number of program variables to a finite, small set of CPU registers. It appears in JIT compilers (like V8 for JavaScript), ahead-of-time compilers (like GCC or LLVM), and even in the microcode of modern processors that perform register renaming.

### SE lens
**Debuggability vs. Performance:** The `-O0` flag optimizes for the developer's experience (predictable line-by-line execution, variables always live in memory for a debugger to inspect). The `-O2` flag optimizes for the user's experience (maximum execution speed). You don't ship `-O0` code, but you often debug with it.

### Commands needed
`gcc -O0 -S math_ops.c` and `gcc -O2 -S math_ops.c` to generate the assembly output for comparison.

### Run it
Predicted confidently: `-O0` will generate a loop that constantly loads and stores `i` and `s` to the stack on every iteration. `-O2` will keep `s`, `i`, and the `arr` pointer in registers, avoiding memory access entirely except for reading the array elements.

### One sentence connecting to previous unit
Understanding how variables map to registers is the first step; next we will see how the compiler handles computations that don't need to happen at runtime at all.

---

## Concept Unit: Constant folding and dead code elimination

### The Problem
If you write `int x = 60 * 60 * 24;` to represent the number of seconds in a day, does the CPU actually perform two multiplications every time that line of code runs? What if you have debugging code wrapped in an `if (false)` block—does the CPU still have to evaluate the branch?

### Introduce the concept in isolation

```c
int compute(void) {
    int a = 10;
    int b = 20;
    int c = a + b;     /* 30: computed at compile time */
    int d = c * 2;     /* 60: computed at compile time */
    if (d > 100)       /* false: dead branch */
        return -1;     /* dead code: never emitted */
    return d;          /* always returns 60 */
}
```

```asm
# gcc -O2 compute:
       movl   $60, %eax   # one instruction!
       ret                # constant folded + dead code removed
```

Trace: The compiler evaluates `a + b = 30` and `c * 2 = 60` at COMPILE time (constant folding). It checks `d > 100`: `60 > 100` is false. The dead branch is eliminated. The remaining code is `return 60;`. It generates `movl $60, %eax; ret`. The entire sequence of variables and conditionals disappears. This proves that the compiler actively simplifies expressions and removes unreachable paths before generating assembly.

### Discard the throwaway
The `compute` function is discarded and will not be kept.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `math_ops.c`.
- **Change type**: Add.
- **Location**: Below the `sum` function.
- **Dependencies**: None.

### The New Code

```c
#include <stdio.h>

void unused_function(void) {
    printf("I am never called\n");
}
```

### The Updated Project

```c
  long sum(long *arr, int n) {
      // ... (body of sum)
  }

// ← new
8: #include <stdio.h>
9: 
10: void unused_function(void) {
11:     printf("I am never called\n");
12: }
```
We added a function that is never called by any other function in our file.

### Mechanical walkthrough
- `#include <stdio.h>` includes the standard I/O library header to declare `printf`.
- `void unused_function(void) {` declares a function taking no arguments and returning nothing.
- `printf("I am never called\n");` calls the standard print function with a string literal.
- `}` closes the function body.

### CS lens
**Static Analysis and Reachability:** Constant folding and dead code elimination are forms of static analysis. The compiler builds a control flow graph and proves that certain nodes (blocks of code) can never be reached from the entry point. This is the same principle used by garbage collectors (to find unreachable objects) and security auditing tools (to find unreachable code paths).

### SE lens
**Write for Humans:** Because the compiler folds constants automatically, you should write `60 * 60 * 24` instead of `86400`. The performance is identical, but the intent is vastly clearer. Do not pre-calculate constants manually if it obscures meaning.

### Commands needed
`gcc -O2 -S math_ops.c` to see if `unused_function` is emitted, and `gcc -O2 -flto -c math_ops.c` to see Link-Time Optimization behavior.

### Run it
Predicted confidently: Without LTO, `unused_function` will still appear in the `.s` file because the compiler doesn't know if another C file might call it. With Link-Time Optimization (`-flto`), the linker will see it's never called globally and completely remove it from the final binary.

### One sentence connecting to previous unit
While dead code is removed entirely, what happens to code that *is* called, but the act of calling it is too slow?

---

## Concept Unit: Inlining — eliminating function call overhead

### The Problem
Calling a function in C has a cost: the CPU must push the return address to the stack, jump to the function, set up a new stack frame, do the work, tear down the frame, and jump back. If a function is extremely small—like `return x * 3;`—the overhead of calling it might take longer than the multiplication itself. How can we abstract code into small functions without paying this penalty?

### Introduce the concept in isolation

```c
static inline long triple(long x) { return x * 3; }

long use_triple(long a, long b) {
    return triple(a) + triple(b);
}
```

```asm
# gcc -O2 use_triple:
use_triple:
    leaq   (%rdi,%rdi,2), %rax   # rax = a + 2*a = 3a (inlined triple(a))
    leaq   (%rsi,%rsi,2), %rdx   # rdx = b + 2*b = 3b (inlined triple(b))
    addq   %rdx, %rax            # rax = 3a + 3b
    ret
# No call instruction! triple's body substituted directly
```

Trace `use_triple(4, 5)`: Without inlining, we would have a `call` to `triple(4)` (pushing stack, multiplying, returning), then a `call` to `triple(5)`. With inlining, the compiler substitutes the body of `triple` directly into `use_triple`. The instruction `leaq (%rdi,%rdi,2), %rax` computes `4 + (4*2) = 12`. The next `leaq` computes `5 + (5*2) = 15`. The `addq` adds them to `27`. There are zero `call` instructions. This proves the compiler can flatten the call graph for efficiency.

### Discard the throwaway
The `triple` and `use_triple` functions are discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `math_ops.c`.
- **Change type**: Add.
- **Location**: Below `unused_function`.
- **Dependencies**: None.

### The New Code

```c
long add_one(long x) { return x + 1; }
```

### The Updated Project

```c
  void unused_function(void) {
      printf("I am never called\n");
  }

// ← new
14: long add_one(long x) { return x + 1; }
```
We added a small helper function `add_one` that doesn't even use the `inline` keyword.

### Mechanical walkthrough
- `long add_one(long x) {` declares a function taking a `long` and returning a `long`.
- `return x + 1;` computes the value plus one and returns it.
- `}` closes the function.

### CS lens
**Time/Space Tradeoff:** Inlining trades space for time. By copying the function body to every call site, the binary size increases, but the execution speed increases by avoiding call overhead. Too much inlining causes code bloat and can hurt instruction cache performance.

### SE lens
**The `inline` Keyword is a Hint:** In modern C, the `inline` keyword is merely a suggestion. At `-O2`, the compiler will aggressively inline small functions like `add_one` even without the keyword, and it may refuse to inline massive functions even if you request it. Trust the compiler's heuristics over manual hinting.

### Commands needed
`gcc -O2 -S math_ops.c`

### Run it
Predicted confidently: If we write a function `test()` that calls `add_one(5)`, the generated assembly for `test()` will simply contain an instruction to put `6` into `%rax`, completely bypassing a `call add_one` instruction, because GCC at `-O2` inlines small functions automatically.

### One sentence connecting to previous unit
Inlining removes the boundaries between functions, allowing the compiler to see more of the computation at once; this wider view enables optimizations that transform the operations themselves, like strength reduction.

---

## Concept Unit: Strength reduction and register allocation

### The Problem
If you have a loop `for (int i = 0; i < n; i++)` and inside it you access `arr[i]`, the CPU conceptually has to calculate the memory address on every iteration: `base_address + (i * size_of_element)`. Multiplication is slower than addition. Can the compiler find a faster way to step through memory?

### Introduce the concept in isolation

```c
long sum_array(long *arr, int n) {
    long s = 0;
    for (int i = 0; i < n; i++)
        s += arr[i];
    return s;
}
```

```asm
# gcc -O2 sum_array:
sum_array:
    testl  %esi, %esi
    jle    .return_zero      # if n <= 0: return 0
    movl   %esi, %esi        # zero-extend n to 64-bit
    leaq   (%rdi,%rsi,8), %rdx  # rdx = arr + n*8  (one past end)
    xorl   %eax, %eax        # s = 0
.loop:
    addq   (%rdi), %rax      # s += *arr (direct memory add)
    addq   $8, %rdi          # arr++ (pointer increment: +8 bytes)
    cmpq   %rdx, %rdi        # arr == end?
    jne    .loop             # no: continue
    ret                      # return s in rax
.return_zero:
    xorl   %eax, %eax
    ret
```

Trace `sum_array([10,20,30], 3)`: `%rdx` holds the end address (`arr+24`). `%rax` is initialized to `0`. Iteration 1: `addq (%rdi), %rax` adds `10`. `%rdi` is incremented by 8 (bytes) to point to the next element. `cmpq` checks if we reached `%rdx`. Not equal. Iteration 2: Adds `30`. `%rdi` increments by 8. Iteration 3: Adds `60`. `%rdi` increments by 8, now equaling `%rdx`. The `jne` branch is not taken, and it returns `60`. This proves the compiler replaced `i * 8` with a simple `addq $8, %rdi` on each iteration—this is strength reduction.

### Discard the throwaway
The `sum_array` function is already functionally similar to our `sum` function, but we discard this specific isolated code block.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: No files changed. We are analyzing the existing `sum` function from earlier.
- **Change type**: None.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
(No new code to type; we are analyzing the `-O2` behavior of the `sum` function we wrote earlier.)

### The Updated Project
```c
1: long sum(long *arr, int n) {
2:     long s = 0;
3:     for (int i = 0; i < n; i++)
4:         s += arr[i];
5:     return s;
6: }
```
We analyze this exact structure.

### Mechanical walkthrough
- We analyze the loop structure: `for (int i = 0; i < n; i++)` implies an index `i`.
- The access `arr[i]` conceptually means `*(arr + i)`.
- The `-O2` compiler transforms this into pointer arithmetic internally, maintaining a pointer that advances by `sizeof(long)` (8 bytes) on each iteration.
- The `i` variable is often entirely optimized away; the compiler just compares the advancing pointer to the calculated end address of the array.

### CS lens
**Algorithm Refinement:** Strength reduction is the compiler doing algorithmic optimization for you at a micro level. Replacing multiplication with addition in a loop is a classic technique that dates back to the earliest compilers (like FORTRAN). It shows up in graphics programming (Bresenham's line algorithm avoids floating-point math) and cryptography.

### SE lens
**Write Clear Code, Not "Fast" Code:** Developers sometimes write convoluted pointer arithmetic like `long *ptr = arr; while(ptr < end) { sum += *ptr++; }` thinking it's faster. As shown, the `-O2` compiler takes the readable `arr[i]` code and turns it into exact same pointer arithmetic assembly. Write the readable version.

### Commands needed
`gcc -O2 -S math_ops.c` and observe the output for `sum`.

### Run it
Predicted confidently: The assembly for our `sum` function will look exactly like the `sum_array` trace above. It will use `addq $8, %rdi` instead of multiplying an index by 8.

### One sentence connecting to previous unit
The compiler is incredibly smart about transforming loops and math, but there is one major blind spot that forces it to be conservative: pointers.

---

## Concept Unit: What the compiler CANNOT do — aliasing and side effects

### The Problem
If you write to the same memory location twice, can the compiler just skip the first write? `*p = 1; *p = 2;` can safely become just `*p = 2;`. But what if you write to two *different* pointers, `*p = 1; *q = 2; *p = 3;`? Can the compiler skip `*p = 1`? What if `p` and `q` point to the exact same memory address?

### Introduce the concept in isolation

```c
void write_twice(int *p, int *q) {
    *p = 1;
    *q = 2;
    *p = 3;
}

void write_twice_r(int * restrict p, int * restrict q) {
    *p = 1;
    *q = 2;
    *p = 3;
}
```

Trace `write_twice`: If `p == q`, the sequence must be: write 1 to `p`, write 2 to `q` (which overwrites `p` since they alias), write 3 to `p` (overwrites again). Final state: `*p == 3`, `*q == 3`. If the compiler aggressively removed `*p = 1` and just did `*q = 2; *p = 3;`, the final state is still `3`. BUT, what if another thread or hardware device reads `*q` *between* the writes? The compiler is forced to emit all three memory writes just in case. 
Trace `write_twice_r`: By using the `restrict` keyword, we promise the compiler that `p` and `q` NEVER point to the same memory. Because it knows `*q = 2` cannot possibly overwrite the memory at `p`, it knows `*p = 1` is completely useless because `*p = 3` happens immediately after. It eliminates the first store entirely.

### Discard the throwaway
The `write_twice` functions are discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `math_ops.c`.
- **Change type**: Add.
- **Location**: Bottom of the file.
- **Dependencies**: None.

### The New Code

```c
void update_counters(long * restrict a, long * restrict b) {
    *a += 10;
    *b += 20;
    *a += 30;
}
```

### The Updated Project

```c
14: long add_one(long x) { return x + 1; }
15: 
// ← new
16: void update_counters(long * restrict a, long * restrict b) {
17:     *a += 10;
18:     *b += 20;
19:     *a += 30;
20: }
```
We added a function demonstrating the `restrict` keyword.

### Mechanical walkthrough
- `void update_counters(` starts a function that returns nothing.
- `long * restrict a` declares a pointer `a` to a `long`, with the `restrict` keyword promising it does not alias other pointers in this scope.
- `, long * restrict b)` declares a second restricted pointer `b`.
- `*a += 10;` reads the value at `a`, adds 10, and writes it back.
- `*b += 20;` reads the value at `b`, adds 20, and writes it back.
- `*a += 30;` reads `a`, adds 30, and writes it back.

### CS lens
**Pointer Aliasing:** Aliasing is a massive barrier to optimization in C and C++. It's the reason Fortran historically beat C in numerical computing (Fortran didn't have pointers that could arbitrarily alias). Modern languages like Rust solve this at the language level by enforcing strict borrowing rules, making aliasing impossible by default and giving the compiler free reign to optimize.

### SE lens
**The Contract of `restrict`:** Using `restrict` is an unsafe promise to the compiler. If you lie and pass `update_counters(&x, &x)`, the compiler will generate code that produces incorrect results because it optimized away operations assuming they didn't overlap. Use it only in low-level hot paths where you strictly control the inputs.

### Commands needed
`gcc -O2 -S math_ops.c`

### Run it
Predicted confidently: With the `restrict` keyword, the `-O2` compiler will combine the two additions to `*a`. It will emit code equivalent to `*a += 40; *b += 20;`, cutting the memory reads/writes to `a` in half. Without `restrict`, it would be forced to do `*a += 10`, then `*b += 20`, then `*a += 30` in exactly that order.

### One sentence connecting to previous unit
We've seen how the compiler manipulates variables and memory, but where does that memory actually live?

---

## Closing

### Connect the pieces
When you take a C function and run it through `gcc -O2`, a massive pipeline of transformations occurs. The compiler parses the code, evaluates constants immediately (constant folding), removes paths that can't be reached (dead code elimination), replaces function calls with their actual bodies (inlining), swaps slow math like `i * 8` for fast pointer increments (strength reduction), and finally maps your variables to fast CPU registers rather than stack memory (register allocation). The only thing that consistently stops this juggernaut of optimization is pointer aliasing, which you can bypass with `restrict`. The `-O2` compiler applies a fixed set of transformations — constant folding, inlining, strength reduction, dead code elimination, and register allocation — and understanding each one tells you when to write code that helps it and when it's already handling things optimally. Module 2 begins with Lesson 13: storage technologies.
