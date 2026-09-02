# Lesson 41: Advanced Optimization — Loop Unrolling, Instruction Parallelism, and Compiler Limits

The reader will understand the key program-level optimizations that reduce CPE: eliminating function calls from inner loops, loop unrolling, accumulator variables for instruction-level parallelism, and what the compiler can and cannot do. The transferable insight: the compiler optimizes individual statements but cannot restructure algorithms. Loop unrolling and multiple accumulators exploit instruction-level parallelism that the compiler cannot always discover on its own.

**What you need to know first:**
Lessons 00-40.

**Terms used in this lesson:**
- **Code motion** — moving computation out of a loop that evaluates to the same result on every iteration. Solves redundant work.
- **Strength reduction** — replacing a costly operation (like multiplication) with a cheaper one (like addition) that computes the equivalent sequence. Solves CPU cycle waste on heavy instructions.
- **Accumulator variable** — a local variable (kept in a register) that holds a running sum or product. Solves the latency and traffic of writing intermediate results back to memory.
- **Loop unrolling** — reducing the number of loop iterations by doing more work per iteration. Solves loop control overhead (incrementing, comparing, branching) taking up too much of the loop's total time.
- **Instruction-level parallelism (ILP)** — executing multiple independent instructions in the same clock cycle. Solves the throughput limits imposed by instruction latency chains.
- **Data dependency** — when one instruction cannot execute because it needs the result of a previous instruction. Solves the ordering of operations, but creates a latency bottleneck.
- **Constant folding** — evaluating constant expressions at compile time. Solves runtime overhead for values known ahead of time.
- **Dead store elimination** — removing memory writes that are never read. Solves memory traffic for unused data.
- **Register allocation** — deciding which variables live in fast CPU registers versus slower memory. Solves memory access bottlenecks for hot variables.
- **Vectorization (SIMD)** — applying one instruction to multiple data items simultaneously. Solves throughput limits for data-parallel tasks.
- **Aliasing** — when two pointers refer to the same memory location. Solves flexible memory access, but creates a barrier for compiler optimizations like vectorization.

**Objects and methods used:**
- **`strlen`**
  - *What it is:* A C standard library function that computes the length of a string.
  - *Implementation:* `size_t strlen(const char *s);`
  - *Its use:* Used here to demonstrate how an $O(N)$ function call inside a loop condition turns an $O(N)$ loop into an $O(N^2)$ operation.
  - *Type:* A standard library function.
  - *Responsibility:* Traverses a null-terminated string to count its characters, stopping when it finds `\0`.
  - *Depends on:* A valid memory address pointing to a null-terminated string.
  - *Connects to:* Called by user code; sequentially reads memory bytes until a null byte is found.
  - *Shape:* A utility function from `<string.h>` providing a basic text operation.
- **`__restrict__`**
  - *What it is:* A C type qualifier (often spelled `restrict` in C99, or `__restrict__` as a GCC extension) that promises no other pointer accesses the same object.
  - *Implementation:* A keyword applied to pointer declarations, e.g., `double * __restrict__ c`.
  - *Its use:* Tells the compiler it is safe to vectorize loops because writing to `c` will not overwrite values in `a` or `b`.
  - *Type:* A language keyword/type qualifier.
  - *Responsibility:* Communicates programmer intent to the compiler about pointer aliasing to unlock aggressive optimizations.
  - *Depends on:* The programmer ensuring the promise is true; violating it causes undefined behavior.
  - *Connects to:* Used by the compiler's optimization passes (like the vectorizer) to prove independence of memory operations.
  - *Shape:* A declarative hint in a function signature or pointer declaration.

**Everything else in the file, not this lesson's subject but still explained:**
- **`printf`**
  - *What it is:* Formatted print function.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used to output the results of our optimizations to verify correctness.
  - *Type:* Standard library function.
  - *Responsibility:* Formats data according to a format string and writes it to standard output.
  - *Depends on:* A format string and matching arguments.
  - *Connects to:* User code calls it; it writes to `stdout`.
  - *Shape:* Standard output utility from `<stdio.h>`.

## Concept Unit: Code motion
### The Problem
If a loop executes 10,000 times, every statement inside its condition and body executes 10,000 times. What if one of those statements computes a value that never changes?
- What happens if we call `strlen(s)` inside the `for` loop's condition?
- How many times will `strlen` be called?
- Given that `strlen` itself must read every character of the string, what is the total number of character reads if the string is $N$ characters long?

### Introduce the concept in isolation
We will write a small program to demonstrate an inefficient loop, then fix it.

```c
#include <string.h>
#include <stdio.h>

void lower_slow(char *s) {
    for (int i = 0; i < (int)strlen(s); i++)
        if (s[i] >= 'A' && s[i] <= 'Z')
            s[i] += 32;
}

void lower_fast(char *s) {
    int len = (int)strlen(s);  /* computed once */
    for (int i = 0; i < len; i++)
        if (s[i] >= 'A' && s[i] <= 'Z')
            s[i] += 32;
}

int main(void) {
    char s1[] = "HELLO";
    char s2[] = "HELLO";
    lower_slow(s1);
    lower_fast(s2);
    printf("slow: %s\nfast: %s\n", s1, s2);
    return 0;
}
```

*Predicted output (since execution is straightforward string mutation):*
```
slow: hello
fast: hello
```
This proves that moving `strlen` outside the loop produces the exact same correct result. However, for `lower_slow`, `strlen` is called on every iteration. For `HELLO`, `strlen` is called 5 times, evaluating 5 chars each time. For `lower_fast`, `strlen` is evaluated exactly once. This is called **code motion**.

### Discard the throwaway
This throwaway code is discarded. We will not use it in the project.

### Project Change
No reference counterpart — this is a standalone theory lesson without a running project.
Files affected: none.
Change type: standalone example.
Location: N/A.
Dependencies: None.

### The New Code
```c
/* FAST: hoist strlen out of loop -- O(n) total */
void lower_fast(char *s) {
    int len = (int)strlen(s);
    for (int i = 0; i < len; i++)
        if (s[i] >= 'A' && s[i] <= 'Z')
            s[i] += 32;
}
```

### The Updated Project
```c
1: void lower_fast(char *s) {
2:     int len = (int)strlen(s);  // ← new
3:     for (int i = 0; i < len; i++)  // ← new
4:         if (s[i] >= 'A' && s[i] <= 'Z')
5:             s[i] += 32;
6: }
```
We replaced the loop condition with a cached variable.

### Mechanical walkthrough
- `int len =` allocates space for an integer to hold the length.
- `(int)` casts the `size_t` returned by `strlen` to an `int` to match our loop counter type.
- `strlen(s)` calls the standard library function to compute the string length. The **code motion** happens here because this call is placed before the loop, not inside it.
- `;` terminates the statement.
- `for (int i = 0;` initializes the loop counter to zero.
- `i < len;` compares the counter against our pre-computed `len` variable instead of calling `strlen(s)` again.
- `i++)` increments the counter after each iteration.

### CS lens
This is **loop-invariant code motion**. The result of `strlen(s)` is invariant (it does not change) across loop iterations, so it can be hoisted out. Also recognized in: compiler optimization passes, database query planners pushing filters down, shader compilation hoisting uniform calculations, and rendering engines evaluating static geometry once.

### SE lens
The principle is **hoisting**. The alternative not chosen is relying on the compiler to do it for us. The tradeoff is manual code clutter. The compiler CANNOT hoist `strlen` automatically here because `s[i] += 32` modifies the string memory, and the compiler cannot prove that `strlen(s)` won't change as a result of that modification.

### Commands needed
None.

### Run it
Execution trace for "HELLO" (5 chars):
1. `len = strlen("HELLO")` — evaluated once, `len` becomes 5.
2. `i = 0`: `0 < 5` is true, check 'H', change to 'h'.
3. `i = 1`: `1 < 5` is true, check 'E', change to 'e'.
4. `i = 5`: `5 < 5` is false, loop exits.
`strlen` was called 1 time instead of 5 times.

### One sentence connecting to previous unit
Moving computations out of the loop condition eliminates redundant work, but we can also optimize the computations happening inside the loop body itself.

## Concept Unit: Strength reduction and redundant memory traffic
### The Problem
Some CPU instructions (like multiplication) take longer than others (like addition). Furthermore, writing intermediate results to memory inside a loop is incredibly slow compared to keeping them in CPU registers.
- If we need to compute `i * 7` for every `i`, is there a way to do it using only addition?
- If we are summing elements into an array `result[i]`, does `result[i] += A[i*n+j]` need to write to memory on every inner iteration?

### Introduce the concept in isolation
We will write two functions to demonstrate strength reduction and register accumulation.

```c
#include <stdio.h>

void fill_fast(long *arr, int n) {
    long val = 3;
    for (int i = 0; i < n; i++) {
        arr[i] = val;
        val += 7;
    }
}

void sum_rows_fast(long *result, long *A, int n) {
    for (int i = 0; i < n; i++) {
        long s = 0;  /* register accumulator */
        for (int j = 0; j < n; j++)
            s += A[i*n + j];
        result[i] = s;
    }
}

int main(void) {
    long arr[4];
    fill_fast(arr, 4);
    printf("%ld %ld %ld %ld\n", arr[0], arr[1], arr[2], arr[3]);
    return 0;
}
```

*Predicted output (since execution is straightforward arithmetic):*
```
3 10 17 24
```
This proves that replacing `i * 7 + 3` with `val += 7` produces the correct values using only addition. This is called **strength reduction**. By using `long s = 0`, we perform the additions in a local register, avoiding memory traffic for intermediate sums.

### Discard the throwaway
This throwaway code is discarded. We will not use it in the project.

### Project Change
No reference counterpart — this is a standalone theory lesson.
Files affected: none.
Change type: standalone example.
Location: N/A.
Dependencies: None.

### The New Code
```c
void sum_rows_fast(long *result, long *A, int n) {
    for (int i = 0; i < n; i++) {
        long s = 0;
        for (int j = 0; j < n; j++)
            s += A[i*n + j];
        result[i] = s;
    }
}
```

### The Updated Project
```c
1: void sum_rows_fast(long *result, long *A, int n) {
2:     for (int i = 0; i < n; i++) {
3:         long s = 0;  // ← new
4:         for (int j = 0; j < n; j++)
5:             s += A[i*n + j];  // ← new
6:         result[i] = s;  // ← new
7:     }
8: }
```
We introduced a local accumulator variable `s` to hold the running sum.

### Mechanical walkthrough
- `long s = 0;` declares a local **accumulator variable** of type `long` and initializes it to zero. Because it is a local primitive, the compiler will keep it in a CPU register.
- `for (int j = 0; j < n; j++)` loops over the columns of the matrix.
- `s +=` adds the right-hand value to our register accumulator `s`, avoiding a memory read of `result[i]`.
- `A[i*n + j]` computes the linear index for a 2D array element and reads it from memory.
- `;` terminates the statement.
- `result[i] = s;` writes the final accumulated sum back to memory exactly once per row, eliminating $N-1$ unnecessary memory writes.

### CS lens
This is **strength reduction** and **register accumulation**. Memory is orders of magnitude slower than CPU registers. Also recognized in: matrix multiplication algorithms, graphics pipeline vertex accumulators, hashing algorithms maintaining internal state, and DSP filters.

### SE lens
The principle is **memory traffic minimization**. The alternative not chosen is writing directly to the output array pointer on every iteration. The tradeoff is adding an extra local variable. Direct pointer writes force the compiler to issue real memory loads and stores because it cannot prove that `result` and `A` do not overlap (aliasing).

### Commands needed
None.

### Run it
Execution trace for an $N \times N$ matrix sum:
1. Inner loop reads `A[i*n+j]` (memory load).
2. Adds to `s` (register add).
3. Result stays in `s` (no memory store).
Total memory traffic: $N^2$ loads, $N$ stores. The slow version would have $2N^2$ loads and $N^2$ stores.

### One sentence connecting to previous unit
Even when memory traffic is minimized, the loop itself adds overhead by checking conditions and incrementing counters on every single element.

## Concept Unit: Loop unrolling
### The Problem
A `for` loop doesn't just execute the body; it increments the index, compares the index to the bound, and conditionally branches back to the top.
- If the loop body is very small, what percentage of the CPU's time is spent just managing the loop itself?
- How can we process an array of $N$ elements while evaluating the loop condition fewer than $N$ times?

### Introduce the concept in isolation
We will write a loop that sums an array by processing two elements at a time.

```c
#include <stdio.h>

long sum_unroll2(long *a, int n) {
    long s = 0;
    int i;
    for (i = 0; i < n - 1; i += 2)
        s += a[i] + a[i+1];
    for (; i < n; i++)
        s += a[i];
    return s;
}

int main(void) {
    long data[] = {1, 2, 3, 4, 5, 6, 7};
    printf("%ld\n", sum_unroll2(data, 7));
    return 0;
}
```

*Predicted output (since execution is simple arithmetic):*
```
28
```
This proves that we can process elements in chunks of two and still get the correct sum. The main loop evaluates the condition and increments only $N/2$ times. This is called **loop unrolling**. The second loop is necessary to process leftover elements when $N$ is odd.

### Discard the throwaway
This throwaway code is discarded. We will not use it in the project.

### Project Change
No reference counterpart.
Files affected: none.
Change type: standalone example.
Location: N/A.
Dependencies: None.

### The New Code
```c
long sum_unroll4(long *a, int n) {
    long s = 0;
    int i;
    for (i = 0; i < n - 3; i += 4)
        s += a[i] + a[i+1] + a[i+2] + a[i+3];
    for (; i < n; i++)
        s += a[i];
    return s;
}
```

### The Updated Project
```c
1: long sum_unroll4(long *a, int n) {
2:     long s = 0;
3:     int i;
4:     for (i = 0; i < n - 3; i += 4)  // ← new
5:         s += a[i] + a[i+1] + a[i+2] + a[i+3];  // ← new
6:     for (; i < n; i++)  // ← new
7:         s += a[i];  // ← new
8:     return s;
9: }
```
We unrolled the loop by a factor of 4, processing four elements per iteration.

### Mechanical walkthrough
- `long s = 0;` declares the accumulator.
- `int i;` declares the index outside the loops so the cleanup loop can continue from where the main loop left off.
- `for (i = 0;` initializes the index to zero.
- `i < n - 3;` checks if there are at least 4 elements remaining. If $n=7$, it checks `i < 4`.
- `i += 4)` advances the index by 4 on each iteration, which is the **loop unrolling** step.
- `s +=` adds the result of the right-hand side to `s`.
- `a[i] + a[i+1] + a[i+2] + a[i+3]` accesses four adjacent memory locations and sums them.
- `;` terminates the statement.
- `for (; i < n; i++)` is the cleanup loop. It has no initialization because `i` retains its value from the first loop.
- `s += a[i];` adds any remaining single elements to `s`.

### CS lens
This is **loop unrolling**. By doing more work per iteration, we amortize the cost of the loop overhead (the branch and the increment) over more elements. Also recognized in: cryptographic block ciphers, hash function internals (like SHA-256), memory copy functions (`memcpy`), and pixel shaders.

### SE lens
The principle is **amortization of overhead**. The alternative not chosen is a simple 1-by-1 loop. The tradeoff is increased code size and complexity, plus the need for a cleanup loop to handle array sizes that aren't exact multiples of the unroll factor.

### Commands needed
None.

### Run it
Execution trace for $n=7$ with elements $\{1,2,3,4,5,6,7\}$:
1. `i=0`: `0 < 4` is true. `s += 1 + 2 + 3 + 4` $\rightarrow$ `s = 10`.
2. `i=4`: `4 < 4` is false. Main loop exits.
3. Cleanup loop starts at `i=4`. `4 < 7` is true. `s += 5` $\rightarrow$ `s = 15`.
4. `i=5`: `5 < 7` is true. `s += 6` $\rightarrow$ `s = 21`.
5. `i=6`: `6 < 7` is true. `s += 7` $\rightarrow$ `s = 28`.
6. `i=7`: `7 < 7` is false. Cleanup loop exits. Return 28.

### One sentence connecting to previous unit
Loop unrolling reduces branch overhead, but summing everything into a single accumulator variable still forces the CPU to wait for the previous addition to finish before starting the next one.

## Concept Unit: Multiple accumulators
### The Problem
Modern CPUs are pipelined and superscalar: they can execute multiple instructions in the exact same clock cycle, provided the instructions do not depend on each other.
- If we compute `s = s + a[i]`, can the CPU start the next addition `s = s + a[i+1]` before the first one finishes?
- No, because it needs the new value of `s` (a **data dependency**).
- How can we sum an array such that the CPU can perform multiple additions simultaneously?

### Introduce the concept in isolation
We will use multiple accumulators to break the dependency chain.

```c
#include <stdio.h>

long sum_2acc(long *a, int n) {
    long s0 = 0, s1 = 0;
    int i;
    for (i = 0; i < n - 1; i += 2) {
        s0 += a[i];
        s1 += a[i+1];
    }
    for (; i < n; i++) s0 += a[i];
    return s0 + s1;
}

int main(void) {
    long data[] = {1, 2, 3, 4, 5, 6, 7, 8};
    printf("%ld\n", sum_2acc(data, 8));
    return 0;
}
```

*Predicted output (since execution is arithmetic):*
```
36
```
This proves that using two separate running totals yields the correct sum. Because `s0` and `s1` are completely independent variables, the CPU can execute `s0 += a[i]` and `s1 += a[i+1]` at the exact same time. This exploits **instruction-level parallelism (ILP)**.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart.
Files affected: none.
Change type: standalone example.
Location: N/A.
Dependencies: None.

### The New Code
```c
long sum_4acc(long *a, int n) {
    long s0 = 0, s1 = 0, s2 = 0, s3 = 0;
    int i;
    for (i = 0; i < n - 3; i += 4) {
        s0 += a[i];
        s1 += a[i+1];
        s2 += a[i+2];
        s3 += a[i+3];
    }
    for (; i < n; i++) s0 += a[i];
    return s0 + s1 + s2 + s3;
}
```

### The Updated Project
```c
1: long sum_4acc(long *a, int n) {
2:     long s0 = 0, s1 = 0, s2 = 0, s3 = 0;  // ← new
3:     int i;
4:     for (i = 0; i < n - 3; i += 4) {
5:         s0 += a[i];    // ← new
6:         s1 += a[i+1];  // ← new
7:         s2 += a[i+2];  // ← new
8:         s3 += a[i+3];  // ← new
9:     }
10:    for (; i < n; i++) s0 += a[i];
11:    return s0 + s1 + s2 + s3;  // ← new
12:}
```
We unrolled by 4 and used 4 independent accumulators.

### Mechanical walkthrough
- `long s0 = 0, s1 = 0, s2 = 0, s3 = 0;` declares four separate local accumulator variables, which the compiler will place in four separate CPU registers.
- `int i;` declares the loop index.
- `for (i = 0; i < n - 3; i += 4)` loops over the array in chunks of 4.
- `{` begins the loop block.
- `s0 += a[i];` adds the first element to `s0`.
- `s1 += a[i+1];` adds the second element to `s1`. Because this does not read or write `s0`, it has no **data dependency** on the previous line.
- `s2 += a[i+2];` adds to `s2`.
- `s3 += a[i+3];` adds to `s3`.
- `}` closes the loop block. The CPU's out-of-order execution engine will see these four additions and issue them to four separate ALUs (Arithmetic Logic Units) simultaneously.
- `for (; i < n; i++) s0 += a[i];` handles remaining elements by adding them to `s0`.
- `return s0 + s1 + s2 + s3;` combines the four independent totals into the final result.

### CS lens
This is **instruction-level parallelism (ILP)** via **multiple accumulators**. We broke a serial dependency chain of length $N$ into four parallel chains of length $N/4$. Also recognized in: map-reduce frameworks (where nodes sum independently), parallel prefix sum algorithms, GPU thread warp execution, and multi-core thread local storage aggregation.

### SE lens
The principle is **removing false dependencies**. The alternative not chosen is summing everything into one variable. The tradeoff is using more CPU registers. If you use more accumulators than the CPU has physical registers, the compiler will "spill" them to memory, destroying the performance gain.

### Commands needed
None.

### Run it
Execution trace for $\{1,2,3,4,5,6,7,8\}$, $N=8$:
1. `i=0`:
   `s0 += 1` $\rightarrow$ `s0 = 1`
   `s1 += 2` $\rightarrow$ `s1 = 2`
   `s2 += 3` $\rightarrow$ `s2 = 3`
   `s3 += 4` $\rightarrow$ `s3 = 4`
   (All four additions happen in parallel).
2. `i=4`:
   `s0 += 5` $\rightarrow$ `s0 = 6`
   `s1 += 6` $\rightarrow$ `s1 = 8`
   `s2 += 7` $\rightarrow$ `s2 = 10`
   `s3 += 8` $\rightarrow$ `s3 = 12`
3. Loop exits. `return 6 + 8 + 10 + 12` $\rightarrow$ `36`.
The CPE (cycles per element) drops dramatically because the CPU executes 4 additions in the latency time of 1.

### One sentence connecting to previous unit
While we can write manual loops to exploit ILP, the compiler itself has powerful optimization passes, but it operates under strict rules about when it is allowed to restructure our code.

## Concept Unit: What the compiler can and cannot do
### The Problem
If multiple accumulators are so fast, why doesn't GCC just automatically rewrite our single-accumulator code into a four-accumulator version when we pass `-O3`?
- Is $(A + B) + C$ always equal to $A + (B + C)$?
- In integer math, yes. In IEEE 754 floating-point math, no — rounding errors differ depending on the order of operations.
- If the compiler changes the order of additions, and the result changes, is it allowed to do that?

### Introduce the concept in isolation
We will look at how the compiler handles array operations with and without aliasing guarantees.

```c
#include <stdio.h>

void add_arrays(double * __restrict__ c,
                const double * __restrict__ a,
                const double * __restrict__ b, int n) {
    for (int i = 0; i < n; i++)
        c[i] = a[i] + b[i];
}

int main(void) {
    double a[4] = {1,2,3,4};
    double b[4] = {4,3,2,1};
    double c[4];
    add_arrays(c, a, b, 4);
    printf("%.0f %.0f %.0f %.0f\n", c[0], c[1], c[2], c[3]);
    return 0;
}
```

*Predicted output (since execution is basic addition):*
```
5 5 5 5
```
This proves the array addition works. More importantly, the `__restrict__` keyword tells the compiler that `c`, `a`, and `b` never point to the same memory. Without this, the compiler cannot use **vectorization (SIMD)** because it fears that writing to `c[i]` might overwrite `a[i+1]`. With it, the compiler emits a single `vaddpd` instruction that adds 4 doubles at once.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart.
Files affected: none.
Change type: standalone example.
Location: N/A.
Dependencies: None.

### The New Code
```c
float sum_float(float *a, int n) {
    float s = 0.0f;
    for (int i = 0; i < n; i++)
        s += a[i];
    return s;
}
```

### The Updated Project
```c
1: float sum_float(float *a, int n) {
2:     float s = 0.0f;  // ← new
3:     for (int i = 0; i < n; i++)  // ← new
4:         s += a[i];  // ← new
5:     return s;
6: }
```
A standard floating-point sum loop.

### Mechanical walkthrough
- `float s = 0.0f;` initializes a floating-point accumulator.
- `for (int i = 0; i < n; i++)` iterates over the array.
- `s += a[i];` adds the current float to the running sum.
- `;` terminates the statement. Because floating point addition is not strictly associative, the compiler will strictly execute this sequentially, never using multiple accumulators automatically unless given the `-ffast-math` flag.

### CS lens
This is about **compiler safety guarantees**. Compilers are forbidden from making optimizations that change observable program behavior (except when explicitly allowed, like `-ffast-math`). Also recognized in: volatile memory accesses, memory barriers in multithreading, strict aliasing rules, and deterministic simulation execution.

### SE lens
The principle is **safe by default**. The alternative not chosen is aggressive reordering that sometimes subtly breaks physics simulations or financial calculations. The tradeoff is that the programmer must manually unroll and accumulate floating point math if they want maximum throughput, or explicitly pass a compiler flag that sacrifices strict precision for speed.

### Commands needed
To see the compiler's output: `gcc -O2 -march=native -S opt.c -o opt.s`
- `gcc` — the GNU C Compiler.
- `-O2` — enables a high level of safe optimizations.
- `-march=native` — tells the compiler to use the newest instructions available on the host CPU (like AVX for vectorization).
- `-S` — stops the compilation process after generating assembly code, instead of building an executable.
- `-o opt.s` — writes the assembly to `opt.s`.

### Run it
Execution trace for floating point sum:
1. Load `a[0]`. Add to `s`. (Wait for FP adder latency).
2. Load `a[1]`. Add to `s`. (Wait for FP adder latency).
The compiler refuses to vectorize or parallelize this sequence. The CPE will exactly match the latency of the floating-point addition unit on the hardware (typically 3-4 cycles).

### One sentence connecting to previous unit
Understanding the compiler's limits shows us exactly where we must step in to manually restructure code for performance.

## Closing
### Connect the pieces
A program starts with a simple algorithm (a loop summing elements). By performing **code motion**, we strip away unnecessary calculations. We use **strength reduction** to replace slow operations with fast ones. We then perform **loop unrolling** to slash the branch overhead, and pair it with **multiple accumulators** to unlock **instruction-level parallelism** — breaking data dependencies so the CPU's pipeline stays completely full. Finally, we must do this ourselves because the compiler's strict safety rules prevent it from altering the order of operations when floating point math or potential pointer **aliasing** is involved. Optimization is a structured discipline: measure, identify the bottleneck, and apply code-level techniques matching the hardware's throughput and latency constraints.
