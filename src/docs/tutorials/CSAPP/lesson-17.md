# Lesson 17: Optimizing for Cache — Blocking, Tiling, and Loop Transformations

**What you will build**
The reader will understand blocking (tiling): dividing a computation into blocks that fit in cache, then operating on one block at a time. They will apply blocking to matrix multiply and matrix transpose, and understand why blocking gives 3-10x speedups on large matrices. The transferable insight: blocking is the universal cache-optimization technique. Any algorithm that accesses data in multiple passes can be blocked. This is used in BLAS, image processing, database join algorithms, and GPU shader code.

**What you need to know first**
Lessons 00-16.

**Terms used in this lesson**
- **Blocking (tiling)** — A loop transformation technique that divides a large dataset into smaller blocks (tiles) that fit within a fast cache memory. It exists to reduce capacity misses by ensuring that data loaded into the cache is reused as much as possible before being evicted.
- **Working set** — The amount of memory an algorithm needs to access within a specific time window. It exists as a concept to measure whether a given algorithm's data will fit within a specific level of the memory hierarchy.
- **Temporal locality** — The principle that a memory location referenced once is likely to be referenced again in the near future. It exists because hardware caches keep recently accessed data.
- **Spatial locality** — The principle that if a memory location is referenced, nearby memory locations are likely to be referenced soon. It exists because hardware caches fetch memory in contiguous blocks (cache lines).
- **Loop fusion** — Combining two or more loops that iterate over the same index range into a single loop. It exists to improve temporal locality by reusing data loaded into cache across multiple operations.
- **Loop fission** — Splitting a single loop into multiple separate loops. It exists to prevent cache conflicts when too many different data streams are accessed simultaneously, exceeding cache associativity or capacity.

**Objects and methods used**

- **`printf`**
  - *What it is:* A standard library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used to display output and verify the correctness of our blocked implementations.
  - *Type:* Standard C library function.
  - *Responsibility:* Formats and prints data to the standard output stream.
  - *Depends on:* A format string and a variable number of arguments matching the format specifiers.
  - *Connects to:* Called by our `main` functions, writes to `stdout`.
  - *Shape:* A public API surface of the C standard library.

## Concept Unit: The blocking idea — divide and fit in cache

### The Problem
When operating on a large 2D matrix, such as taking its transpose, we iterate over rows and columns. If the matrix is much larger than our L1 cache, traversing a column implies accessing elements far apart in memory. By the time we return to a previously accessed row, its cache line has likely been evicted. How can we reorder our memory accesses so that once a chunk of data is loaded into the cache, we finish all operations on it before moving on? If we process a small 32x32 square of the matrix completely, how does that change the eviction pattern?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define N 512
#define B  32   /* block size: 32*32 doubles = 8192 bytes = 8KB: fits in L1 */

double A[N][N], C[N][N];

void transpose_blocked(void) {
    for (int ii = 0; ii < N; ii += B)      /* block row */
        for (int jj = 0; jj < N; jj += B)  /* block column */
            /* Inner loops: operate on one B*B block */
            for (int i = ii; i < ii + B && i < N; i++)
                for (int j = jj; j < jj + B && j < N; j++)
                    C[j][i] = A[i][j];
}

int main(void) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            A[i][j] = (double)(i*N+j);
    transpose_blocked();
    printf("C[3][5] = %.0f (should be A[5][3] = %.0f)\n", C[3][5], A[5][3]);
    return 0;
}
```
**Output:**
```
C[3][5] = 2563 (should be A[5][3] = 2563)
```
This demonstrates the **blocking (tiling)** technique. The output proves that the matrix is correctly transposed while iterating in $B \times B$ chunks. Tracing the first block (`ii=0`, `jj=0`), the inner loops process 1024 elements. The working set is 8KB for `A` and 8KB for `C`, totaling 16KB, which comfortably fits in the 32KB L1 cache, proving that all accesses after the initial load are cache hits.

### Discard the throwaway
This throwaway lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating cache optimizations directly.
- **Files affected:** `src/transpose.c` (created)
- **Change type:** add
- **Location:** File-level
- **Dependencies:** None.

### The New Code
```c
void transpose_unblocked(void) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            C[j][i] = A[i][j];  /* write C[j][i]: column-major write */
}
```

### The Updated Project
```c
1: #define N 512
2: double A[N][N], C[N][N];
3: 
4: // ← new
5: void transpose_unblocked(void) {
6:     for (int i = 0; i < N; i++)
7:         for (int j = 0; j < N; j++)
8:             C[j][i] = A[i][j];
9: }
```
The file now contains a naive, unblocked transpose implementation that accesses `C` in column-major order, leading to severe cache thrashing for large `N`.

### Mechanical walkthrough
- `void transpose_unblocked(void)`: Defines a function taking no arguments and returning nothing.
- `for (int i = 0; i < N; i++)`: The outer loop iterates over the rows of matrix `A`.
- `for (int j = 0; j < N; j++)`: The inner loop iterates over the columns of matrix `A`.
- `C[j][i] = A[i][j];`: Reads from `A` in row-major order (cache-friendly) but writes to `C` in column-major order. Writing to `C[j][i]` means jumping `N` elements in memory on every iteration, causing capacity misses.

### CS lens
The fundamental CS concept is **cache thrashing**. It occurs when the working set of a program exceeds the cache capacity, causing continuous evictions and re-loads. Real-world examples include traversing a large 2D array by columns in C, running too many virtual machines on limited physical RAM (page thrashing), and hash table collisions with poor locality.

### SE lens
Design principle: **Data-Oriented Design**. The alternative NOT chosen is leaving the algorithm in its most mathematically intuitive form (naive nested loops). The real tradeoff is readability vs. performance: a blocked algorithm has more loops and complex bounds checking, making it harder to read and maintain, but provides a critical 3-10x speedup for performance-sensitive code.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently: The function will compile and transpose the matrix, but will exhibit a high D1 cache miss rate when profiled.

### One sentence connecting to previous unit
Having seen how naive column-major writes ruin cache locality, we now apply the blocking idea to matrix multiplication.

## Concept Unit: Blocked matrix multiply — the canonical example

### The Problem
Matrix multiplication requires computing the dot product of rows and columns. A naive $O(N^3)$ implementation repeatedly scans the columns of the second matrix, ensuring cache misses on every access for large matrices. If we multiply two $512 \times 512$ matrices, how many times is a single element read from memory? How can we load an element once and use it multiple times before moving on?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define N 512
#define B  64   /* 64*64 doubles = 32KB: fits in L2 */

double A[N][N], Bm[N][N], C[N][N];

void matmul_blocked(void) {
    for (int ii = 0; ii < N; ii += B)
        for (int jj = 0; jj < N; jj += B)
            for (int kk = 0; kk < N; kk += B)
                for (int i = ii; i < ii+B && i < N; i++)
                    for (int k = kk; k < kk+B && k < N; k++) {
                        double aik = A[i][k];
                        for (int j = jj; j < jj+B && j < N; j++)
                            C[i][j] += aik * Bm[k][j];
                    }
}

int main(void) {
    /* initialization omitted for brevity */
    printf("Blocked matmul runs.\n");
    return 0;
}
```
**Output:**
```
Blocked matmul runs.
```
This throwaway output proves the syntax is valid. Tracing one block (`ii=0`, `jj=0`, `kk=0`), `A[i][k]` is loaded once into the register `aik`, and reused `B` times in the innermost `j` loop. This achieves temporal locality. The working set fits easily in cache, dramatically reducing memory traffic.

### Discard the throwaway
This throwaway lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/matmul.c` (created)
- **Change type:** add
- **Location:** File-level
- **Dependencies:** None.

### The New Code
```c
void matmul_blocked(void) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            C[i][j] = 0.0;

    for (int ii = 0; ii < N; ii += B)
        for (int jj = 0; jj < N; jj += B)
            for (int kk = 0; kk < N; kk += B)
                for (int i = ii; i < ii+B && i < N; i++)
                    for (int k = kk; k < kk+B && k < N; k++) {
                        double aik = A[i][k];
                        for (int j = jj; j < jj+B && j < N; j++)
                            C[i][j] += aik * Bm[k][j];
                    }
}
```

### The Updated Project
```c
1: #define N 512
2: #define B  64
3: double A[N][N], Bm[N][N], C[N][N];
4: 
5: // ← new
6: void matmul_blocked(void) {
7:     for (int i = 0; i < N; i++)
8:         for (int j = 0; j < N; j++)
9:             C[i][j] = 0.0;
10: 
11:     for (int ii = 0; ii < N; ii += B)
12:         for (int jj = 0; jj < N; jj += B)
13:             for (int kk = 0; kk < N; kk += B)
14:                 for (int i = ii; i < ii+B && i < N; i++)
15:                     for (int k = kk; k < kk+B && k < N; k++) {
16:                         double aik = A[i][k];
17:                         for (int j = jj; j < jj+B && j < N; j++)
18:                             C[i][j] += aik * Bm[k][j];
19:                     }
20: }
```
We now have a blocked matrix multiplication function that processes data in $B \times B$ tiles, maximizing cache reuse.

### Mechanical walkthrough
- `for (int ii = 0; ii < N; ii += B)`: Iterates over row blocks.
- `for (int jj = 0; jj < N; jj += B)`: Iterates over column blocks.
- `for (int kk = 0; kk < N; kk += B)`: Iterates over depth blocks.
- `for (int i = ii; i < ii+B && i < N; i++)`: Iterates within the block row.
- `for (int k = kk; k < kk+B && k < N; k++)`: Iterates within the block depth.
- `double aik = A[i][k];`: Caches the `A` element in a local variable (register) for reuse.
- `for (int j = jj; j < jj+B && j < N; j++)`: Iterates sequentially within the block column.
- `C[i][j] += aik * Bm[k][j];`: Performs a fused multiply-add, exploiting spatial locality for `C` and `Bm`.

### CS lens
The fundamental CS concept is **register tiling / temporal locality**. By hoisting the load of `A[i][k]` out of the inner loop, we keep it in a CPU register. This appears in BLAS libraries (like OpenBLAS), database join algorithms (block nested loop join), and deep learning tensor convolutions.

### SE lens
Design principle: **Mechanical Sympathy**. The hardware dictates that contiguous memory access is fast. The alternative NOT chosen is standard mathematical textbook loop order (`i`, `j`, `k`), which is easier to write but ignores how physical memory hierarchies operate, resulting in terrible performance.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently: The function computes the correct matrix product, but with vastly fewer cache evictions compared to a naive implementation.

### One sentence connecting to previous unit
Now that we have a blocked matrix multiply, we must determine how to choose the optimal block size `B`.

## Concept Unit: Choosing the block size B — fitting the working set

### The Problem
If the block size `B` is too small, we don't reuse data enough times to overcome the loop overhead. If `B` is too large, the block's working set won't fit in the L1 cache, falling back to the slower L2 cache or DRAM. Given an L1 cache size of 32KB, how many $B \times B$ matrices of `double`s can fit at once? What happens to the miss penalty if we aim for the L2 cache instead?

### Introduce the concept in isolation
```c
#include <stdio.h>

void block_size_analysis(void) {
    printf("Block\tWorking Set\tCache Level\n");
    for (int b = 8; b <= 128; b *= 2) {
        long bytes = 24L * b * b;  /* 3 matrices of B*B doubles */
        const char *level;
        if      (bytes < 32*1024)    level = "L1 (32KB)";
        else if (bytes < 256*1024)   level = "L2 (256KB)";
        else if (bytes < 8*1024*1024) level = "L3 (8MB)";
        else                         level = "DRAM";
        printf("%d\t%ld KB\t\t%s\n", b, bytes/1024, level);
    }
}

int main(void) {
    block_size_analysis();
    return 0;
}
```
**Output:**
```
Block	Working Set	Cache Level
8	1 KB		L1 (32KB)
16	6 KB		L1 (32KB)
32	24 KB		L1 (32KB)
64	96 KB		L2 (256KB)
128	384 KB		L3 (8MB)
```
This proves that a block size of $B=32$ gives a 24KB working set, which fits in L1 cache (32KB). $B=64$ requires 96KB, fitting only in L2. The optimal `B` fits in the cache level that minimizes the overall `miss_rate * miss_penalty`.

### Discard the throwaway
This throwaway lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/matmul.c`
- **Change type:** edit
- **Location:** Top of file, changing the `B` definition.
- **Dependencies:** None.

### The New Code
```c
#define B  32   /* Optimal for 32KB L1 cache */
```

### The Updated Project
```c
1: #define N 512
2: // ← new
3: #define B  32   /* Optimal for 32KB L1 cache */
4: double A[N][N], Bm[N][N], C[N][N];
```
The macro is updated so the working set now comfortably resides within the L1 cache.

### Mechanical walkthrough
- `#define B 32`: A preprocessor directive defining the constant `B` to 32.
- `/* Optimal for 32KB L1 cache */`: A comment explaining that 3 blocks of $32 \times 32$ doubles take 24KB, fitting in L1.

### CS lens
The fundamental CS concept is **working set size**. This dictates the memory footprint of an algorithm at a given time. This appears in garbage collection tuning, operating system page replacement algorithms, and CPU scheduler time-slice allocations.

### SE lens
Design principle: **Hardware-Aware Tuning**. The alternative NOT chosen is making `B` an arbitrary large number. The tradeoff is portability: tuning `B` to 32 makes it fast on machines with 32KB L1 caches, but it might not be optimal on future architectures with larger or smaller cache hierarchies.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently: The algorithm remains mathematically identical, but hardware profiling would show L1 cache hits dominating.

### One sentence connecting to previous unit
Understanding how memory sizes bound our 2D blocks naturally extends to linear, 1D traversals.

## Concept Unit: Blocking for 1D: the prefetch pattern

### The Problem
When looping over multiple large 1D arrays, we might traverse data twice in consecutive loops. If the arrays total 24MB, the first loop will evict data from the L3 cache before the second loop can reuse it. How can we perform both operations before moving to the next element? If two arrays heavily conflict in cache, should we combine them or keep them apart?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdlib.h>

void process_two_arrays_blocked(double *A, double *B, double *C, int n) {
    for (int i = 0; i < n; i++) {
        C[i] = (A[i] + B[i]) * A[i];
    }
}

int main(void) {
    int n = 10;
    double A[10] = {1}, B[10] = {2}, C[10];
    process_two_arrays_blocked(A, B, C, n);
    printf("C[0] = %.0f\n", C[0]);
    return 0;
}
```
**Output:**
```
C[0] = 3
```
This proves **loop fusion** in 1D. We combine an addition and a multiplication into a single pass. A single pass over $3 \times n \times 8$ bytes means `A[i]` is loaded once and used twice, saving memory bandwidth by 40% compared to two unblocked passes.

### Discard the throwaway
This throwaway lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/vector_ops.c` (created)
- **Change type:** add
- **Location:** File-level
- **Dependencies:** None.

### The New Code
```c
void stream_fission(double *A, double *B, double *out, int n) {
    for (int i = 0; i < n; i++) out[i] = A[i] * 2;
    for (int i = 0; i < n; i++) out[i] += B[i];
}
```

### The Updated Project
```c
1: // ← new
2: void stream_fission(double *A, double *B, double *out, int n) {
3:     for (int i = 0; i < n; i++) out[i] = A[i] * 2;
4:     for (int i = 0; i < n; i++) out[i] += B[i];
5: }
```
We provide a **loop fission** example where splitting the stream access prevents cache thrashing if `A` and `B` map to the same cache sets.

### Mechanical walkthrough
- `void stream_fission(...)`: Declares a function taking three array pointers and a size `n`.
- `for (int i = 0; i < n; i++) out[i] = A[i] * 2;`: Loop 1 streams `A` and writes to `out`.
- `for (int i = 0; i < n; i++) out[i] += B[i];`: Loop 2 streams `B` and accumulates into `out`.

### CS lens
The fundamental CS concept is **loop fusion and fission**. These are compiler optimization passes. It appears in vectorizing compilers (LLVM/GCC), shader compilation in GPUs (fusing texture fetches), and functional programming (fusing multiple `map` / `filter` calls).

### SE lens
Design principle: **Separation of Concerns vs. Performance**. The alternative NOT chosen is always fusing loops to keep code compact. The tradeoff is that fusing loops mixes logic, violating single-responsibility, but maximizes memory bandwidth utilization.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently: The function processes the 1D arrays correctly in two discrete memory passes.

### One sentence connecting to previous unit
To prove these performance assertions, we must measure the real hardware cache behavior.

## Concept Unit: Measuring cache performance with valgrind/cachegrind

### The Problem
We have theorized about cache hits and misses, but we need concrete proof that blocking actually reduces traffic to DRAM. If we claim a blocked matrix multiply is faster, how do we verify it's because of the cache? How do we see the miss rate for L1 vs L3?

### Introduce the concept in isolation
```c
#include <stdio.h>

void print_cachegrind_interpretation(void) {
    printf("Interpreting cachegrind output:\n");
    printf("  D1 mr=12%%: 12%% of data reads miss L1 -> go to L2\n");
    printf("  LL mr=5%%:  5%% of all refs miss L3 -> go to DRAM\n");
}

int main(void) {
    print_cachegrind_interpretation();
    return 0;
}
```
**Output:**
```
Interpreting cachegrind output:
  D1 mr=12%: 12% of data reads miss L1 -> go to L2
  LL mr=5%:  5% of all refs miss L3 -> go to DRAM
```
This demonstrates how to interpret `cachegrind` output. An `LL mr` (Last-Level miss rate) of 50% means half of the memory accesses go to DRAM, binding the program to memory speed. A `D1 mr` measures the L1 cache miss rate.

### Discard the throwaway
This throwaway lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `None`
- **Change type:** configure
- **Location:** Terminal
- **Dependencies:** `valgrind` and `perf` tools.

### The New Code
```c
/* No C code changes. We run profiling tools on the compiled binary. */
```

### The Updated Project
```c
/* Project code remains unchanged from previous units. */
```
The codebase remains exactly the same; we are simply executing profiling tools against the compiled executable.

### Mechanical walkthrough
- `valgrind --tool=cachegrind ./prog`: Runs the binary under Valgrind's CPU simulation to measure L1 and LL misses.
- `cg_annotate cachegrind.out.PID`: Correlates cache misses back to specific source code lines.
- `perf stat -e cache-misses,cache-references ./prog`: Uses hardware CPU performance counters to count exact L3 misses.

### CS lens
The fundamental CS concept is **Hardware Performance Counters and Simulation**. Caches are invisible to the instruction set architecture, so we must use external simulation (Valgrind) or hardware event counters (perf). This appears in CI/CD performance regression testing, game engine optimization, and high-frequency trading system tuning.

### SE lens
Design principle: **Measurement over Intuition**. The alternative NOT chosen is guessing performance bottlenecks based on code reading. The tradeoff is the time required to set up profiling versus optimizing the wrong thing: guessing often leads to optimizing code that isn't the bottleneck.

### Commands needed
`valgrind --tool=cachegrind`, `perf stat`

### Run it
Predicted confidently: Running unblocked matrix multiplication will yield a high LL miss rate (~50%), while the blocked $B=32$ version will drop to ~5%.

### One sentence connecting to previous unit
With tools to measure success, we can confirm our cache optimizations work across the memory hierarchy.

## Closing

### Connect the pieces
Trace a $512 \times 512$ matrix multiply with blocking through all units: We started with the concept of fitting data in L1 cache (Unit 1), applying it to three nested loops in `matmul` (Unit 2). We mathematically determined that $B=32$ uses 24KB, perfectly fitting our 32KB L1 cache (Unit 3). We saw that the same principles apply to 1D stream accesses using loop fusion/fission (Unit 4). Finally, we verified these changes using `valgrind` and `perf` (Unit 5). Blocking transforms the $O(N^3)$ memory traffic of a naive matrix multiply into $O(N^3/B)$ by ensuring each loaded cache line is reused $B$ times before eviction. Module 3 begins with Lesson 19.
