# Lesson 14: Locality — Temporal, Spatial, and Writing Cache-Friendly Code

**What you will build:** The reader will understand temporal locality (same data accessed repeatedly) and spatial locality (nearby data accessed sequentially), quantify them in terms of cache miss rates, and write code that maximizes both. The transferable insight: locality is not a vague 'good practice' — it is the single most important thing a programmer can do to influence performance. Code with good locality runs 5-100x faster than equivalent code with poor locality on modern hardware.

**What you need to know first:** Lessons 00-13.

**Terms used in this lesson**
- **Temporal locality** — The concept of reusing data that has been accessed recently. It solves the problem of fetching the same data from slower memory repeatedly by keeping it in the cache for multiple uses.
- **Spatial locality** — The concept of accessing data that is stored sequentially or close together in memory. It takes advantage of the fact that memory is fetched into the cache in blocks (cache lines), solving the problem of high latency by loading nearby data before it is explicitly requested.
- **Cache line** — The unit of data transfer between main memory and the cache (typically 64 bytes). It exists because transferring a larger block of contiguous data is more efficient than transferring single bytes, and it is the physical mechanism that makes spatial locality work.
- **Cache miss** — An event that occurs when a requested data item is not found in the cache and must be fetched from a slower memory level (like L2 cache or DRAM). It is the performance penalty that locality optimization aims to minimize.
- **Cache miss rate** — The fraction of memory accesses that result in a cache miss (misses / total accesses). It is the metric used to quantify the effectiveness of an algorithm's locality.
- **Miss penalty** — The number of CPU cycles wasted waiting for data to arrive from slower memory after a cache miss. It represents the actual time cost of poor locality.
- **Effective access time** — The average time required to access memory, calculated as a weighted average of hit times and miss penalties across the memory hierarchy. It measures the real-world performance of memory accesses.
- **Array of Structs (AoS)** — A data layout where multiple fields (e.g., coordinates, mass) are grouped into a struct, and the program allocates an array of these structs. It is common for organizing related data but often leads to poor spatial locality when only a subset of fields is accessed across multiple elements, because unused fields waste cache space.
- **Struct of Arrays (SoA)** — A data layout where each field of a logical entity is stored in its own separate, contiguous array, and a single struct holds pointers to these arrays. It solves the AoS wasted-bandwidth problem by ensuring that iterating over a single field accesses memory sequentially with 100% cache efficiency.
- **Row-major order** — The memory layout used by C for multidimensional arrays, where elements of the same row are stored contiguously in memory. It dictates that iterating through an array by changing the innermost index accesses sequential memory locations.
- **Column-major order** — An access pattern (or memory layout in some languages) where elements of the same column are accessed sequentially. In C, accessing a row-major array in a column-major pattern results in a stride equal to the row length, which destroys spatial locality and causes frequent cache misses.
- **Loop interchange** — A compiler optimization or manual refactoring technique that swaps the nesting order of loops. It solves the problem of poor spatial locality by changing the access pattern (e.g., from column-major to row-major) to match the data's layout in memory without altering the computed result.
- **Stride** — The distance in memory (in bytes or elements) between successive accesses. A stride of 1 (sequential access) maximizes spatial locality; a large stride often leads to a cache miss on every access.

**Objects and methods used**
- **`printf`**
  - *What it is:* A standard library function for formatted output to the console.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used in the examples to display the computed sums and verify the behavior of the throwaway code.
  - *Type:* A variadic free function from `<stdio.h>`.
  - *Responsibility:* Formats a string according to embedded format specifiers and writes the resulting characters to standard output.
  - *Depends on:* A format string and a matching number of variadic arguments of the correct types.
  - *Connects to:* Called by the application; connects to the operating system's standard output stream to display text to the user.
  - *Shape:* A standard C library API call, acting as a boundary between the application and the environment's standard output.

---

## Concept Unit: Temporal locality

### The Problem
When we process large amounts of data, loading that data from main memory is extremely slow compared to the speed of the CPU. If we need to perform multiple operations on the same data, should we complete all operations on one piece of data before moving to the next, or should we make multiple passes over the entire dataset? If a piece of data is already in the fast cache, what happens to performance if we let it get evicted before we need it again?

### Introduce the concept in isolation
Temporal locality means structuring our code to reuse data while it is still in the fast cache.

```c
#include <stdio.h>

#define N 1024
double matrix[N][N];

void fill_matrix(void) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            matrix[i][j] = (double)(i * N + j);
}

void good_temporal(void) {
    double total = 0.0;
    for (int i = 0; i < N; i++) {
        double row_sum = 0.0;
        for (int j = 0; j < N; j++) {
            double val = matrix[i][j];  /* load once */
            row_sum += val;             /* use 1 */
            total   += val * val;       /* use 2: reuse same value */
        }
        printf("row %d: sum=%.0f\n", i, row_sum);  /* (suppress output) */
    }
    (void)total;
}
```
**Output predicted confidently:** `good_temporal` will compute the sum of each row and the total sum of squares. It proves the concept of **temporal locality**: each element `matrix[i][j]` is loaded once into a local variable (`val`), resulting in only N^2 cache misses overall. Because `val` is used twice in rapid succession, the second use is effectively free.

### Discard the throwaway
This throwaway lab is discarded; it exists only to prove the concept of temporal locality and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the negative impact of poor temporal locality.
- **Files affected:** `temporal.c` (created)
- **Change type:** add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>

#define N 1024
double matrix[N][N];

void poor_temporal(void) {
    /* Pass 1: compute row sums */
    double row_sums[N];
    for (int i = 0; i < N; i++) {
        row_sums[i] = 0;
        for (int j = 0; j < N; j++)
            row_sums[i] += matrix[i][j];  /* access matrix[i][j] */
    }
    
    /* Pass 2: compute sum of squares (accesses matrix AGAIN) */
    double ss = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            ss += matrix[i][j] * matrix[i][j];  /* same data, 2nd pass */
    (void)ss;
}
```

### The Updated Project
```c
// temporal.c
1: #include <stdio.h>
2: 
3: #define N 1024
4: double matrix[N][N];
5: 
6: // ← new: function demonstrating poor temporal locality
7: void poor_temporal(void) {
8:     /* Pass 1: compute row sums */
9:     double row_sums[N];
10:    for (int i = 0; i < N; i++) {
11:        row_sums[i] = 0;
12:        for (int j = 0; j < N; j++)
13:            row_sums[i] += matrix[i][j];  /* access matrix[i][j] */
14:    }
15:    
16:    /* Pass 2: compute sum of squares (accesses matrix AGAIN) */
17:    double ss = 0;
18:    for (int i = 0; i < N; i++)
19:        for (int j = 0; j < N; j++)
20:            ss += matrix[i][j] * matrix[i][j];  /* same data, 2nd pass */
21:    (void)ss;
22: }
```
We now have a function that forces multiple passes over our data, setting up a situation where the cache is overwhelmed.

### Mechanical walkthrough
- `#include <stdio.h>`: The preprocessor directive that includes the standard I/O library.
- `#define N 1024`: A preprocessor macro defining `N` as 1024.
- `double matrix[N][N];`: The declaration of a 1024x1024 2D array of `double`s.
- `void poor_temporal(void) {`: The definition of a function taking no arguments and returning nothing.
- `double row_sums[N];`: The declaration of a local array of size `N`.
- `for (int i = 0; i < N; i++) {`: The start of the outer loop for the first pass.
- `row_sums[i] = 0;`: The initialization of the `i`-th element to zero.
- `for (int j = 0; j < N; j++)`: The start of the inner loop for the first pass.
- `row_sums[i] += matrix[i][j];`: The compound assignment operator adding `matrix[i][j]` to `row_sums[i]`. This loads the memory into the cache.
- `}`: The closing brace of the first pass's outer loop.
- `double ss = 0;`: The declaration and initialization of `ss`.
- `for (int i = 0; i < N; i++)`: The start of the outer loop for the second pass.
- `for (int j = 0; j < N; j++)`: The start of the inner loop for the second pass.
- `ss += matrix[i][j] * matrix[i][j];`: The compound assignment multiplying `matrix[i][j]` by itself and adding it to `ss`. This requires the memory to be loaded again.
- `(void)ss;`: A cast to `void` to suppress unused-variable warnings.
- `}`: The closing brace of the function.

### CS lens
**Temporal locality** is a fundamental property in computer science where data that is accessed once is highly likely to be accessed again in the near future. Real-world examples include:
1. Web browsers caching recently downloaded images so they don't have to be re-downloaded on a page reload.
2. A database keeping recently queried rows in RAM rather than fetching them from disk.
3. A CPU's Translation Lookaside Buffer (TLB) storing recent virtual-to-physical memory page mappings.
4. A Content Delivery Network (CDN) holding popular video chunks at the edge node near users.

### SE lens
**Design Principle:** Design algorithms to do as much work as possible on a piece of data while you have it in fast memory.
**Alternative NOT chosen:** Breaking the code down into single-responsibility passes (e.g., one function for sums, one for squares).
**Real tradeoff:** A strict adherence to single-responsibility and pure functional passes often destroys temporal locality. If an array is 8MB and the L3 cache is only 4MB, the first pass evicts the early elements. By the time the second pass begins, it has to fetch the entire array from DRAM again. Writing "ugly" fused loops sacrifices some modularity for a massive gain in performance.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `poor_temporal` performs two complete passes over the 8MB matrix. If the L3 cache is 8MB or smaller, it may not hold the entire matrix, meaning elements accessed in Pass 1 are evicted by the time Pass 2 needs them. This results in extra, completely avoidable cache misses on the second pass. The compiler cannot automatically fuse these two loops without help, meaning the processor suffers the full latency of DRAM twice.

### One sentence connecting to previous unit
While temporal locality focuses on reusing the same exact data, we also need to consider how we access adjacent data in memory.

---

## Concept Unit: Spatial locality

### The Problem
If the CPU reads a single `double` from memory, the hardware doesn't just fetch those 8 bytes—it fetches an entire 64-byte block. Given this physical reality, how should we order our reads of a 2D array? Does it matter if we read a row left-to-right versus reading a column top-to-bottom?

### Introduce the concept in isolation
Spatial locality means accessing memory in the same contiguous sequence in which it is laid out physically.

```c
#include <stdio.h>
#define N 512
double A[N][N];

void row_major_sum(void) {
    double sum = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            sum += A[i][j];
    printf("row-major sum: %.0f\n", sum);
}
```
**Output predicted confidently:** This loop computes the total sum of `A`. It proves the concept of **spatial locality**: because C arrays are row-major, accessing `A[i][0]`, `A[i][1]`, etc. sequentially means one cache miss loads 64 bytes (8 doubles). The next 7 accesses are completely free hits, giving a miss rate of 1/8.

### Discard the throwaway
This throwaway code is discarded; we will build a side-by-side comparison in the project instead.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `spatial.c` (created)
- **Change type:** add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>

#define N 512
double A[N][N];  /* row-major: A[i][j] and A[i][j+1] are adjacent */

void col_major_sum(void) {
    /* BAD: column access -- poor spatial locality */
    double sum = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            sum += A[i][j];  /* A[0][j], A[1][j], ...: stride N doubles apart */
    printf("col-major sum: %.0f\n", sum);
}
```

### The Updated Project
```c
// spatial.c
1: #include <stdio.h>
2: 
3: #define N 512
4: double A[N][N];  /* row-major: A[i][j] and A[i][j+1] are adjacent */
5: 
6: // ← new: function demonstrating poor spatial locality via column-major access
7: void col_major_sum(void) {
8:     /* BAD: column access -- poor spatial locality */
9:     double sum = 0;
10:    for (int j = 0; j < N; j++)
11:        for (int i = 0; i < N; i++)
12:            sum += A[i][j];  /* A[0][j], A[1][j], ...: stride N doubles apart */
13:    printf("col-major sum: %.0f\n", sum);
14: }
```
We added a function that loops over columns in the inner loop, rather than rows.

### Mechanical walkthrough
- `#include <stdio.h>`: The preprocessor directive for I/O.
- `#define N 512`: A macro defining `N` as 512.
- `double A[N][N];`: The declaration of a 512x512 array.
- `void col_major_sum(void) {`: The function definition.
- `double sum = 0;`: The initialization of the accumulator.
- `for (int j = 0; j < N; j++)`: The outer loop, which iterates over *columns* (`j`).
- `for (int i = 0; i < N; i++)`: The inner loop, which iterates over *rows* (`i`).
- `sum += A[i][j];`: The access of the array where the row index `i` changes fastest. This means we are jumping `N` doubles (4096 bytes) ahead in memory on every single iteration.
- `printf("col-major sum: %.0f\n", sum);`: The standard library function outputting the result.
- `}`: The closing brace of the function.

### CS lens
**Spatial locality** reflects the fact that hardware is optimized for contiguous blocks. Real-world examples include:
1. Hard drives reading whole 4KB sectors at once, not individual bytes.
2. Network protocols grouping small packets into larger MTU frames.
3. CPU prefetchers detecting sequential access patterns and speculatively loading the next cache lines before the code even requests them.

### SE lens
**Design Principle:** Data layouts dictate access patterns.
**Alternative NOT chosen:** Transposing the matrix in memory before doing column operations.
**Real tradeoff:** If you genuinely need to access a matrix by column, your data layout (row-major) fights you. You can either suffer the cache misses, or spend cycles transposing the matrix first. Often, paying the cost to reorganize the data upfront makes the subsequent processing drastically faster.

### Commands needed
None for this unit.

### Run it
Predicted confidently: With N=512 and `double`=8 bytes, the stride between `A[0][0]` and `A[1][0]` is 4096 bytes. Since a cache line is only 64 bytes, every single access to `A[i][j]` inside the inner loop is a cache miss. The miss rate is 1/1 (100%), compared to a row-major miss rate of 1/8 (12.5%). The code will run 5-8x slower purely due to the order of the loops.

### One sentence connecting to previous unit
Beyond loop ordering, the actual structures we design to hold our data dictate our spatial locality.

---

## Concept Unit: Array of Structs vs. Struct of Arrays

### The Problem
If we are simulating a physics engine with millions of particles, we typically represent each particle with a `struct` holding position, velocity, and mass. If an update pass only needs position and velocity, what happens when we load a `struct` into the cache? Are we fetching useless bytes just because they belong to the same object?

### Introduce the concept in isolation
The Array of Structs (AoS) is the natural object-oriented way to organize data, but it interleaves data we need with data we don't.

```c
#include <stdio.h>

struct Particle_AoS {
    double x, y, z;
    double vx, vy, vz;
    double mass;
};

void update_positions_AoS(struct Particle_AoS *particles, int n, double dt) {
    for (int i = 0; i < n; i++) {
        particles[i].x += particles[i].vx * dt;
        particles[i].y += particles[i].vy * dt;
        particles[i].z += particles[i].vz * dt;
    }
}
```
**Output predicted confidently:** This loop will correctly update positions. It proves the concept of **Array of Structs**: each particle is 56 bytes. When we load one, we load all its fields. We only use 6 of the 7 fields. `mass` (8 bytes) is loaded into the cache but never touched, wasting 1/7th of our memory bandwidth.

### Discard the throwaway
This throwaway code is discarded to make way for a better data layout.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `soa.c` (created)
- **Change type:** add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
/* SoA: Struct of Arrays -- cache-friendly for per-field ops */
struct Particles_SoA {
    double *x, *y, *z;      /* position arrays */
    double *vx, *vy, *vz;   /* velocity arrays */
    double *mass;            /* mass array */
    int count;
};

void update_positions_SoA(struct Particles_SoA *p, double dt) {
    for (int i = 0; i < p->count; i++) {
        p->x[i] += p->vx[i] * dt;  /* sequential: x[0],x[1],x[2]... */
        p->y[i] += p->vy[i] * dt;  /* sequential: y[0],y[1],y[2]... */
        p->z[i] += p->vz[i] * dt;
    }
}
```

### The Updated Project
```c
// soa.c
1: /* SoA: Struct of Arrays -- cache-friendly for per-field ops */
2: // ← new: SoA layout and update function
3: struct Particles_SoA {
4:     double *x, *y, *z;      /* position arrays */
5:     double *vx, *vy, *vz;   /* velocity arrays */
6:     double *mass;            /* mass array */
7:     int count;
8: };
9: 
10: void update_positions_SoA(struct Particles_SoA *p, double dt) {
11:     for (int i = 0; i < p->count; i++) {
12:         p->x[i] += p->vx[i] * dt;  /* sequential: x[0],x[1],x[2]... */
13:         p->y[i] += p->vy[i] * dt;  /* sequential: y[0],y[1],y[2]... */
14:         p->z[i] += p->vz[i] * dt;
15:     }
16: }
```
We define a Struct of Arrays layout, pulling fields apart into parallel arrays.

### Mechanical walkthrough
- `struct Particles_SoA {`: The definition of a struct meant to hold arrays.
- `double *x, *y, *z;`: Pointer members that will point to contiguous arrays of position data.
- `double *vx, *vy, *vz;`: Pointer members that will point to contiguous arrays of velocity data.
- `double *mass;`: A pointer to an array of mass data.
- `int count;`: The total number of particles represented by these arrays.
- `};`: The end of the struct definition.
- `void update_positions_SoA(struct Particles_SoA *p, double dt) {`: A function taking a pointer to this struct and a time delta.
- `for (int i = 0; i < p->count; i++) {`: A loop over all particles.
- `p->x[i] += p->vx[i] * dt;`: The pointer access `p->x`, followed by array indexing `[i]`. Because `x` points to an array of pure doubles, `x[0]`, `x[1]`, etc. are perfectly sequential in memory.
- `p->y[i] += p->vy[i] * dt;`: Sequential access for the `y` dimension.
- `p->z[i] += p->vz[i] * dt;`: Sequential access for the `z` dimension.
- `}`: The end of the loop and function.

### CS lens
**Struct of Arrays (SoA)** is a technique common in high-performance computing. Real-world examples include:
1. Relational databases storing data in a columnar format (like Parquet or ClickHouse) to quickly aggregate single columns without reading whole rows.
2. GPU vertex buffers organizing data into separate streams for positions, normals, and texture coordinates.
3. ECS (Entity Component System) game engines organizing memory by component type (all velocities together) to maximize cache efficiency during updates.

### SE lens
**Design Principle:** Orient data structures around the access pattern of the hot loop.
**Alternative NOT chosen:** Keeping the Array of Structs (AoS) for better object encapsulation.
**Real tradeoff:** SoA violates traditional object-oriented grouping. You no longer have a single "Particle" object to pass around to functions; you have an index `i` into parallel arrays. It makes the code harder to read and harder to manage, but the 100% cache line utilization and vectorization (SIMD) benefits make it mandatory for performance-critical systems.

### Commands needed
None for this unit.

### Run it
Predicted confidently: With the SoA layout, accessing `x[0]` loads the next 7 `double`s into the cache line. Because we only process `x` data in that array, all 8 doubles will be used before the cache line is evicted. The `mass` array is never touched and never loaded. We achieve 100% cache efficiency for the bandwidth we consume.

### One sentence connecting to previous unit
Understanding how these layouts reduce misses is good, but we need a way to mathematically quantify the exact cost of a cache miss.

---

## Concept Unit: Quantifying locality

### The Problem
If L1 cache hits are fast and main memory accesses are slow, how do we calculate the actual average time an instruction takes? If we optimize our code to improve the L1 hit rate by just 4%, how much faster will the whole program actually run?

### Introduce the concept in isolation
We quantify cache performance using the effective access time formula, blending the speed of each memory level by the probability of hitting it.

```c
#include <stdio.h>

double effective_time(double l1_hit, double l2_hit) {
    double l1_time = 4.0, l2_time = 12.0, dram_time = 200.0;
    double l1_miss = 1.0 - l1_hit;
    double l2_miss = 1.0 - l2_hit;
    return l1_hit * l1_time
         + l1_miss * (l2_hit * l2_time + l2_miss * dram_time);
}

int main(void) {
    printf("L1=95%%, L2=80%%: %.2f cycles\n", effective_time(0.95, 0.80));
    return 0;
}
```
**Output predicted confidently:** The output will be `L1=95%, L2=80%: 6.28 cycles`. It proves the concept of **Effective access time**: the vast majority of accesses take 4 cycles, but the 5% that miss suffer a massive penalty, pulling the average access time up significantly.

### Discard the throwaway
This throwaway code is discarded; the formula is standard theory.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `quantify.c` (created)
- **Change type:** add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>

double effective_time(double l1_hit, double l2_hit) {
    double l1_time = 4.0, l2_time = 12.0, dram_time = 200.0;
    double l1_miss = 1.0 - l1_hit;
    double l2_miss = 1.0 - l2_hit;
    return l1_hit * l1_time
         + l1_miss * (l2_hit * l2_time + l2_miss * dram_time);
}

int main(void) {
    printf("L1=90%%, L2=50%%: %.2f cycles\n", effective_time(0.90, 0.50));
    printf("L1=99%%, L2=95%%: %.2f cycles\n", effective_time(0.99, 0.95));
    return 0;
}
```

### The Updated Project
```c
// quantify.c
1: #include <stdio.h>
2: 
3: // ← new: function computing effective memory access time
4: double effective_time(double l1_hit, double l2_hit) {
5:     double l1_time = 4.0, l2_time = 12.0, dram_time = 200.0;
6:     double l1_miss = 1.0 - l1_hit;
7:     double l2_miss = 1.0 - l2_hit;
8:     return l1_hit * l1_time
9:          + l1_miss * (l2_hit * l2_time + l2_miss * dram_time);
10: }
11: 
12: int main(void) {
13:     printf("L1=90%%, L2=50%%: %.2f cycles\n", effective_time(0.90, 0.50));
14:     printf("L1=99%%, L2=95%%: %.2f cycles\n", effective_time(0.99, 0.95));
15:     return 0;
16: }
```
This file mathematically proves the massive impact small changes in locality have.

### Mechanical walkthrough
- `#include <stdio.h>`: The preprocessor directive for output.
- `double effective_time(double l1_hit, double l2_hit) {`: The function definition taking two probabilities as parameters.
- `double l1_time = 4.0, l2_time = 12.0, dram_time = 200.0;`: The initialization of cycle times for different cache levels.
- `double l1_miss = 1.0 - l1_hit;`: The calculation of the probability of missing L1 cache.
- `double l2_miss = 1.0 - l2_hit;`: The calculation of the probability of missing L2 cache.
- `return l1_hit * l1_time`: The base case: the hit rate multiplied by the fast access time.
- `+ l1_miss * (l2_hit * l2_time + l2_miss * dram_time);`: The miss penalty formula: if we miss L1, we pay the L2 time if we hit L2, or the DRAM time if we miss both.
- `int main(void) {`: The entry point of the program.
- `printf("L1=90%%, L2=50%%: %.2f cycles\n", effective_time(0.90, 0.50));`: A call printing the baseline poor-locality performance.
- `printf("L1=99%%, L2=95%%: %.2f cycles\n", effective_time(0.99, 0.95));`: A call printing the optimized good-locality performance.
- `return 0;`: The success exit code.

### CS lens
**Cache Miss Penalty** dominates modern CPU performance. Real-world manifestations include:
1. Profilers like `perf` reporting IPC (Instructions Per Cycle) dropping from 2.0 to 0.1 on memory-bound workloads.
2. The massive disparity between RAM latency (100ns) and NVMe SSD latency (10,000ns), making page faults devastating.
3. CPU frequency scaling mattering less for memory-heavy code, because the CPU spends its time stalled waiting for memory.

### SE lens
**Design Principle:** A 90% success rate is often disastrously slow in systems engineering.
**Alternative NOT chosen:** Assuming that a 90% cache hit rate is "good enough."
**Real tradeoff:** A 90% hit rate means 10% of accesses take hundreds of cycles. The math shows the average cycle time is 14.6 cycles. Pushing that hit rate to 99% brings the average down to 4.06 cycles. You gain a 3.6x speedup across your entire algorithm simply by reordering data accesses to squeeze out those last few percent of hits.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The output will show 14.60 cycles for the 90/50 case, and 4.06 cycles for the 99/95 case. A mere 9% improvement in L1 hit rate yields a 3.6x overall application speedup, proving that optimizing data layout is the highest leverage activity in performance engineering.

### One sentence connecting to previous unit
Now that we know the math behind the cost of poor locality, we can apply a mechanical code transformation to fix algorithms that suffer from it.

---

## Concept Unit: Loop interchange

### The Problem
Matrix multiplication involves multiplying rows of matrix A with columns of matrix B. Since C is row-major, traversing a column of B incurs a huge stride, guaranteeing cache misses. How can we perform the exact same mathematical operation without suffering the cache misses?

### Introduce the concept in isolation
Loop interchange means swapping the nesting order of our loops so that our memory access patterns match the row-major layout of the arrays.

```c
#include <stdio.h>
#define N 512
double A[N][N], B[N][N], C[N][N];

void matmul_slow(void) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            C[i][j] = 0.0;
            for (int k = 0; k < N; k++)
                C[i][j] += A[i][k] * B[k][j];
        }
}
```
**Output predicted confidently:** `matmul_slow` computes the product, but it proves the concept of **poor spatial locality** in complex algorithms. In the inner loop (`k`), `B[k][j]` increments `k`. Because rows are contiguous, moving down a column (`B[0][j]`, `B[1][j]`) requires jumping across memory, triggering a cache miss on almost every access of B.

### Discard the throwaway
This throwaway code is discarded; we will build a faster version instead.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `matmul.c` (created)
- **Change type:** add
- **Location:** Entire file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>
#define N 512
double A[N][N], B[N][N], C[N][N];

void matmul_fast(void) {
    /* Transpose B into BT */
    double BT[N][N];
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            BT[j][i] = B[i][j];  /* BT[j][i] accessed row-major in inner loop */

    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            double s = 0.0;
            for (int k = 0; k < N; k++)
                s += A[i][k] * BT[j][k];  /* BT accessed row-major: sequential */
            C[i][j] = s;
        }
}
```

### The Updated Project
```c
// matmul.c
1: #include <stdio.h>
2: #define N 512
3: double A[N][N], B[N][N], C[N][N];
4: 
5: // ← new: fast matrix multiplication via memory layout transformation
6: void matmul_fast(void) {
7:     /* Transpose B into BT */
8:     double BT[N][N];
9:     for (int i = 0; i < N; i++)
10:        for (int j = 0; j < N; j++)
11:            BT[j][i] = B[i][j];  /* BT[j][i] accessed row-major in inner loop */
12: 
13:    for (int i = 0; i < N; i++)
14:        for (int j = 0; j < N; j++) {
15:            double s = 0.0;
16:            for (int k = 0; k < N; k++)
17:                s += A[i][k] * BT[j][k];  /* BT accessed row-major: sequential */
18:            C[i][j] = s;
19:        }
20: }
```
We solve the stride problem by transposing matrix B before the main computation.

### Mechanical walkthrough
- `double BT[N][N];`: The declaration of a local transposed matrix.
- `for (int i = 0; i < N; i++)`: The outer loop of the transpose pass.
- `for (int j = 0; j < N; j++)`: The inner loop of the transpose pass.
- `BT[j][i] = B[i][j];`: The assignment that flips the row/column layout. `B` is read sequentially (fast), while `BT` is written with a stride (slow, but we only do it once).
- `for (int i = 0; i < N; i++)`: The outer loop of the main multiplication.
- `for (int j = 0; j < N; j++) {`: The middle loop of the multiplication.
- `double s = 0.0;`: A local accumulator to hold the dot product temporarily.
- `for (int k = 0; k < N; k++)`: The inner loop, where all the heavy lifting happens.
- `s += A[i][k] * BT[j][k];`: The core computation. Because we are using `BT[j][k]` instead of `B[k][j]`, `k` is the last index. This means we are iterating over a contiguous row. `A[i][k]` and `BT[j][k]` are both accessed strictly sequentially.
- `C[i][j] = s;`: The write-back to the result matrix.

### CS lens
**Loop interchange** and algorithmic transformation for cache efficiency appear everywhere:
1. Image processing libraries transposing vertical convolutions into horizontal ones.
2. Fast Fourier Transform (FFT) algorithms being heavily reorganized to fit cache boundaries (Cooley-Tukey).
3. Compilers (like GCC with `-O3`) attempting loop interchange automatically when they can prove it won't change the program's output.

### SE lens
**Design Principle:** Do upfront work to make the inner loop fast.
**Alternative NOT chosen:** Rearranging the three `for` loops (i, j, k). That works well but doesn't completely eliminate the stride on the write to `C`. Transposing is an explicit data transformation.
**Real tradeoff:** Transposing matrix B takes extra time and memory (an entirely new O(N^2) array allocation). However, because the multiplication itself is an O(N^3) operation, the cost of the transpose is eclipsed by the massive savings inside the inner loop. We traded O(N^2) space for an O(N^3) reduction in cache misses.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The `matmul_slow` version has a cache miss almost every iteration for matrix B. For a 512x512 matrix, that is roughly 134 million cache misses. By transposing B into BT first, `matmul_fast` turns the `BT[j][k]` access into a row-major access, dropping the miss rate to 1/8. This 8x reduction in misses translates to a 3-5x overall wall-clock speedup for the multiplication.

### One sentence connecting to previous unit
This transforms our theoretical knowledge of effective access times into a practical, highly-leveraged refactor.

---

## Closing

### Connect the pieces
Locality is the programmer's lever on the memory hierarchy. Consider a matrix access pattern: if you compute a row-sum (`A[i][0] + A[i][1]...`), you hit the first element, pull a 64-byte cache line into L1, and the next 7 accesses are completely free hits—this is spatial locality. If you also square that sum in the same function while the data is hot, you're exploiting temporal locality. However, if you compute a column-sum (`A[0][j] + A[1][j]...`), you jump 4096 bytes on every access, missing the cache entirely and suffering the DRAM miss penalty on every single iteration. By structuring loops and data structures (like SoA) to respect the physical reality of cache lines, you can achieve speedups of 5-100x without changing the Big-O complexity of the underlying algorithm. Lesson 17 covers the advanced technique of loop blocking to ensure working sets fit in cache.
