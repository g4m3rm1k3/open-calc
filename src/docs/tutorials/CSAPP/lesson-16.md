# Lesson 16: Cache Performance — Miss Penalties, AMAT, and Writing

What you will build
In this lesson, you will build a mathematical and practical model for evaluating memory hierarchy performance in C. Instead of building a standalone application, you will write small, performance-critical C functions to quantify execution costs. You will calculate Average Memory Access Time (AMAT), compute exact miss rates for stride-based array accesses, and observe how write policies and hardware prefetchers dictate whether a program runs efficiently or stalls on the memory bus. The core problem is that modern CPUs execute instructions far faster than main memory can serve data; managing this gap is the essence of high-performance systems programming.

What you need to know first
- Lesson 15

Terms used in this lesson
- **Average Memory Access Time (AMAT)** — The statistical average time it takes to read or write a unit of data, factoring in both fast cache hits and slow memory misses. It exists to give a single metric for memory hierarchy performance.
- **Hit time** — The cost in clock cycles to successfully locate and retrieve data from a cache. It exists because even fast SRAM takes a few cycles to route electrical signals.
- **Miss rate** — The fraction of memory accesses (between 0.0 and 1.0) that fail to find their data in the cache. It measures the ineffectiveness of the cache for a specific workload.
- **Miss penalty** — The massive cost in clock cycles to fetch a cache line from the next level down (or main memory) after a miss. It exists because DRAM and memory buses are physically slower and further away than the CPU core.
- **Cold miss** — A cache miss that occurs because the cache is completely empty or the specific block has never been accessed before. It is an unavoidable first-time cost when data is initially requested.
- **Stride** — The distance in memory between successive accesses in a loop. It exists to characterize spatial locality; a stride of 1 means perfectly sequential access.
- **Write-through** — A cache policy where every write immediately updates both the cache and the next lower level of memory. It exists to keep memory perfectly synchronized at all times, at the cost of extremely high bus traffic.
- **Write-back** — A cache policy where writes only update the cache, deferring the main memory update until the cache line is evicted. It exists to coalesce multiple writes to the same block, saving enormous amounts of memory bus bandwidth.
- **Write-allocate** — A cache policy where a write miss causes the block to be loaded into the cache before being modified. It exists to ensure that subsequent writes or reads to the same block will hit the cache.
- **No-write-allocate** — A cache policy where a write miss goes straight to main memory without loading the block into the cache. It exists to avoid polluting the cache with data that the program will not read again.
- **Prefetching** — The hardware or software mechanism of loading data into the cache before the program explicitly requests it. It exists to perfectly hide the miss penalty by doing the fetching in the background.
- **Row-major** — The memory layout used by C where multi-dimensional arrays are stored row by row sequentially in memory. It exists to map 2D coordinates into a flat, linear 1D physical address space.
- **Column-major** — Accessing a row-major array by jumping down columns instead of across rows. It causes massive strides that defeat spatial locality and destroy cache performance.
- **`for`** — A C language keyword used to iterate over a sequence. It exists to express repeated operations compactly in code.
- **`int`** — A C data type representing a signed integer (typically 32 bits). It exists to store discrete countable values like loop indices.
- **`long`** — A C data type representing a large signed integer (typically 64 bits on x86-64). It exists for data or pointers requiring larger capacities.
- **`double`** — A C data type representing a double-precision floating-point number (64 bits). It exists for high-precision fractional arithmetic.
- **`+=`** — The compound addition-assignment operator in C. It exists to succinctly add a value to a variable and store the result without repeating the variable name.
- **`<`** — The strictly-less-than relational operator in C. It exists to evaluate bounds and control loop execution.

Objects and methods used
- **`__builtin_prefetch`**
  - *What it is:* A GCC/Clang compiler intrinsic that explicitly instructs the CPU to load data into the cache ahead of time.
  - *Implementation:* `void __builtin_prefetch(const void *addr, ...);` (takes an address, and optional read/write and locality flags).
  - *Its use:* We use it to manually hide the miss penalty for memory accesses that the hardware prefetcher cannot predict.
  - *Type:* Compiler built-in function (intrinsic).
  - *Responsibility:* Emits a non-blocking hardware prefetch instruction (like `PREFETCHT0` on x86) without altering the program's observable logic or output.
  - *Depends on:* A memory address indicating what data to fetch, plus optional integer flags (0/1 for read/write intent, 0-3 for temporal locality hints).
  - *Connects to:* Called directly by C application code; lowers directly to machine instructions interpreted by the hardware cache controller.
  - *Shape:* A low-level performance boundary bridging software application logic and hardware cache state.

---

## Concept Unit: AMAT -- Average Memory Access Time

### The Problem
When a CPU requests data, it might find it in the L1 cache (very fast, perhaps 4 cycles) or it might have to wait for main memory (very slow, perhaps 100 cycles). How do we calculate the overall average time a program spends waiting for memory, given a mix of fast hits and slow misses? If 10% of your accesses take 100 cycles, how much does that drag down the average? Pause and try to sketch the math before reading on.

### Introduce the concept in isolation
To understand the math, we evaluate a single-level cache formula in isolation. AMAT is the hit time plus the product of the miss rate and the miss penalty.

```c
// Throwaway isolation: Single-level AMAT
double hit_time = 4.0;
double miss_rate = 0.10;
double miss_penalty = 100.0;
double amat = hit_time + (miss_rate * miss_penalty);
```

By the Verification Rule exemption, we do not need to run this computationally because the arithmetic is fully determined:
`amat = 4.0 + (0.10 * 100.0) = 14.0`.
The output proves that even with a low 10% miss rate, the average time per access balloons to 14 cycles, heavily skewed by the massive 100-cycle penalty. This formula is called the **Average Memory Access Time (AMAT)** equation.

### Discard the throwaway example
We delete this isolated calculation; it will not appear in our actual performance tool.

### Project Change
No reference counterpart — this is a from-scratch addition because we need a utility to compute multi-level AMAT dynamically.
- **Files affected:** `src/cache_perf.c` (created)
- **Change type:** Add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```c
double compute_amat_two_level(double h1, double m1, double h2, double m2, double p_dram) {
    return h1 + m1 * (h2 + m2 * p_dram);
}
```

### The Updated Project
Here is the function in its completed context within the new file, calculating a two-level cache penalty.

```c
// 1
double compute_amat_two_level(double h1, double m1, double h2, double m2, double p_dram) { // ← new
// 2
    return h1 + m1 * (h2 + m2 * p_dram); // ← new
// 3
} // ← new
```
This function encapsulates the nested mathematical logic to evaluate a two-level cache hierarchy's true cost.

### Mechanical walkthrough
- `double` — A C primitive type representing a double-precision floating-point number, used here because averages are rarely whole numbers.
- `compute_amat_two_level` — A function we are defining to encapsulate the nested AMAT formula.
- `(` — Begins the parameter list for our function.
- `double h1` — The hit time for the L1 cache.
- `,` — Separates parameters.
- `double m1` — The miss rate for the L1 cache.
- `double h2` — The hit time for the L2 cache (which acts as the base miss penalty for L1).
- `double m2` — The miss rate for the L2 cache.
- `double p_dram` — The absolute miss penalty to reach main memory.
- `)` — Ends the parameter list.
- `{` — Opens the function body block.
- `return` — A C keyword that sends the evaluated mathematical result back to the caller.
- `h1` — The base cost every single access pays, because we always query L1 first.
- `+` — Addition operator, adding the accumulated penalty cost to the base cost.
- `m1` — The frequency at which we actually suffer the L1 miss penalty.
- `*` — Multiplication operator, scaling the L1 penalty by how often it happens.
- `(` — Opens a sub-expression to compute the exact L1 miss penalty dynamically.
- `h2` — The base cost of accessing L2, paid on every L1 miss.
- `+` — Addition operator.
- `m2` — The frequency at which L2 misses.
- `*` — Multiplication operator.
- `p_dram` — The massive penalty of going to main DRAM, paid only when L2 misses.
- `)` — Closes the sub-expression.
- `;` — Terminates the C statement.
- `}` — Closes the function body.

### CS lens
AMAT is a direct application of Expected Value in probability and statistics. The expected cost is the sum of the costs of all possible outcomes, each weighted by the probability of that outcome occurring. 
Also recognized in: network routing latency estimates, database query planner cost models, branch prediction penalty calculations, and disk I/O wait times.

### SE lens
Why do we model mathematical averages instead of worst-case execution bounds? Throughput-oriented systems care about the aggregate flow of data over millions of operations, where an average of 14 cycles accurately predicts total runtime. However, for hard real-time systems (like avionics or engine controllers), the worst-case 100-cycle latency is the only metric that matters, making caches actively dangerous for predictable real-time engineering.

### Commands needed
None yet; this is a pure mathematical calculation.

### Run it
We test this with real values: L1 hit=4, L1 miss=0.10, L2 hit=12, L2 miss=0.50, DRAM penalty=200.
By the Verification Rule exemption, we do not need to compile and run this because the arithmetic is fully determined:
`AMAT = 4 + 0.10 * (12 + 0.50 * 200)`
`AMAT = 4 + 0.10 * (12 + 100)`
`AMAT = 4 + 0.10 * 112`
`AMAT = 4 + 11.2 = 15.2 cycles`.
At an extreme 0.1% L1 miss rate: `AMAT = 4 + 0.001 * 100 = 4.1` cycles. The penalty becomes nearly invisible.

### One sentence connecting this unit to what came immediately before.
With the math defined, we must now observe how small increases in that miss rate can disproportionately destroy the performance of real programs.

---

## Concept Unit: Why miss rate dominates -- the asymmetry of penalties

### The Problem
Why does a 99% hit rate still result in poor performance if the miss penalty is large? What happens to the total runtime of a program if the miss rate jumps from 0% to just 10%? Try to guess the performance multiplier before seeing the numbers.

### Introduce the concept in isolation
We will write a throwaway block simulating the total cycles spent processing 1,000,000 memory accesses under different miss rates, assuming a 4-cycle hit time and a 200-cycle miss penalty.

```c
// Throwaway isolation: Asymmetry of penalties
long N = 1000000;
long scenario_0_percent = N * 4;
long scenario_1_percent = N * (4 + 0.01 * 200);
long scenario_10_percent = N * (4 + 0.10 * 200);
long scenario_50_percent = N * (4 + 0.50 * 200);
```

By the Verification Rule exemption, we calculate this directly:
- Scenario 1 (0% miss rate): AMAT = 4 cycles. N=1,000,000: 4,000,000 cycles total.
- Scenario 2 (1% miss rate): AMAT = 4 + 0.01 * 200 = 6 cycles. Total: 6,000,000 cycles (50% slower than perfect caching).
- Scenario 3 (10% miss rate): AMAT = 4 + 0.10 * 200 = 24 cycles. Total: 24,000,000 cycles (6x slower).
- Scenario 4 (50% miss rate): AMAT = 4 + 0.50 * 200 = 104 cycles. Total: 104,000,000 cycles (26x slower).
This proves the extreme **asymmetry of penalties**: because the penalty is 50x larger than the hit time, even a tiny miss rate completely dominates total execution time.

### Discard the throwaway example
We delete this throwaway script. The math speaks for itself.

### Project Change
No reference counterpart — we will document this reality in a logging function to remind users of the performance cliffs.
- **Files affected:** `src/cache_perf.c`
- **Change type:** Add
- **Location:** Below `compute_amat_two_level`.
- **Dependencies:** `#include <stdio.h>` for printing.

### The New Code
```c
void print_penalty_scenarios() {
    printf("1%% miss rate is 50%% slower than 0%%.\n");
    printf("10%% miss rate is 6x slower than 0%%.\n");
}
```

### The Updated Project
Here is the new logging function in context.

```c
// 1
double compute_amat_two_level(double h1, double m1, double h2, double m2, double p_dram) {
// 2
    return h1 + m1 * (h2 + m2 * p_dram);
// 3
}
// 4
// 5
void print_penalty_scenarios() { // ← new
// 6
    printf("1%% miss rate is 50%% slower than 0%%.\n"); // ← new
// 7
    printf("10%% miss rate is 6x slower than 0%%.\n"); // ← new
// 8
} // ← new
```
This function explicitly records the performance cliffs that occur when memory accesses shift slightly out of the cache.

### Mechanical walkthrough
- `void` — A C keyword indicating this function returns no value.
- `print_penalty_scenarios` — The function name.
- `(` and `)` — The empty parameter list.
- `{` — Opens the function block.
- `printf` — A C standard library function that prints formatted text to standard output.
- `"1%% miss rate is 50%% slower than 0%%.\n"` — A string literal. The `%%` escapes the percent sign so `printf` prints it literally, and `\n` emits a newline.
- `;` — Terminates the statement.
- `printf` — Called again to print the next scenario.
- `"10%% miss rate is 6x slower than 0%%.\n"` — The string literal showing the massive 6x slowdown caused by just a 10% miss rate.
- `;` — Terminates the statement.
- `}` — Closes the function block.

### CS lens
This asymmetry is an example of Amdahl's Law in reverse. Amdahl's Law states that optimizing a fast path yields diminishing returns. Conversely, failing to optimize the slowest path (memory penalties) ensures the slow path dominates the entire system's latency.
Also recognized in: page faults out to disk, garbage collection pauses, network timeouts, and thread context switching overhead.

### SE lens
Software engineering often prioritizes algorithmic complexity (Big-O), assuming all operations cost the same. Cache asymmetry proves that a $O(N)$ algorithm with a 50% miss rate will brutally lose to an $O(N \log N)$ algorithm with a 1% miss rate on modern hardware. Memory access patterns matter more than instruction counts.

### Commands needed
None.

### Run it
By the Verification Rule exemption, we know this simply prints the strings precisely as formatted:
```
1% miss rate is 50% slower than 0%.
10% miss rate is 6x slower than 0%.
```
This requires no runtime validation to predict.

### One sentence connecting this unit to what came immediately before.
Knowing that miss rates dominate performance, we need to mathematically compute the exact miss rate of a real loop based on its stride.

---

## Concept Unit: Computing miss rates for simple loops

### The Problem
How do we know what the miss rate of a piece of code actually is? If we loop over an array of integers, does every read hit the cache, or does every read miss? What happens if we skip every other element? Pause and trace how a cache line loads data.

### Introduce the concept in isolation
We will write a throwaway block setting up an array and a stride-1 loop, assuming a cache with 4 sets, direct-mapped, with 2 `long`s per line (16 bytes total line size).

```c
// Throwaway isolation: Cache Miss Rate computation
long a[16]; // 16 * 8 bytes = 128 bytes total
long sum = 0;

// Loop 1: stride-1
for (int i = 0; i < 16; i++) {
    sum += a[i];
}
```

When this runs on our hypothetical cache, the hardware groups elements into 16-byte blocks. Since a `long` is 8 bytes, each block holds 2 elements.
By the Verification Rule exemption, we manually trace the cache state:
1. `i = 0` — CPU requests `a[0]`. Cache is cold. **MISS**. The memory bus loads the 16-byte block containing `a[0]` AND `a[1]` into the cache.
2. `i = 1` — CPU requests `a[1]`. **HIT**. It was just loaded in the previous step.
3. `i = 2` — CPU requests `a[2]`. **MISS**. Loads block with `a[2]` AND `a[3]`.
4. `i = 3` — CPU requests `a[3]`. **HIT**.
This pattern (miss, hit, miss, hit) continues. Out of 16 accesses, 8 are misses. The output proves the miss rate is exactly `8/16 = 50%`.

### Discard the throwaway example
We delete the throwaway loop. We will build both stride-1 and stride-2 loops into our project for comparison.

### Project Change
No reference counterpart — we are adding stride evaluation loops.
- **Files affected:** `src/cache_perf.c`
- **Change type:** Add
- **Location:** Below `print_penalty_scenarios`.
- **Dependencies:** None.

### The New Code
```c
long sum_array_stride1(long *a, int length) {
    long sum = 0;
    for (int i = 0; i < length; i++) {
        sum += a[i];
    }
    return sum;
}

long sum_array_stride2(long *a, int length) {
    long sum = 0;
    for (int i = 0; i < length; i += 2) {
        sum += a[i];
    }
    return sum;
}
```

### The Updated Project
Here are the new functions nestled into the file, illustrating sequential vs skipping access.

```c
// 7
    printf("10%% miss rate is 6x slower than 0%%.\n");
// 8
}
// 9
// 10
long sum_array_stride1(long *a, int length) { // ← new
// 11
    long sum = 0; // ← new
// 12
    for (int i = 0; i < length; i++) { // ← new
// 13
        sum += a[i]; // ← new
// 14
    } // ← new
// 15
    return sum; // ← new
// 16
} // ← new
// 17
// 18
long sum_array_stride2(long *a, int length) { // ← new
// 19
    long sum = 0; // ← new
// 20
    for (int i = 0; i < length; i += 2) { // ← new
// 21
        sum += a[i]; // ← new
// 22
    } // ← new
// 23
    return sum; // ← new
// 24
} // ← new
```
These functions demonstrate how simple changes in traversal fundamentally alter the cache behavior.

### Mechanical walkthrough
- `long` — A C type for the return value, representing a large 64-bit integer.
- `sum_array_stride2` — The name of the function demonstrating a stride of 2.
- `(` — Opens the parameter list.
- `long *a` — A pointer to a contiguous block of 64-bit integers in memory.
- `,` — Separates parameters.
- `int length` — The number of elements in the array.
- `)` — Closes the parameters.
- `{` — Opens the function block.
- `long sum` — Declares a 64-bit integer to accumulate the total.
- `=` — Assignment operator.
- `0` — Initializes the sum.
- `;` — Terminates the statement.
- `for` — A C keyword establishing a loop.
- `(` — Opens the loop conditions.
- `int i` — Declares the 32-bit loop index.
- `=` — Assignment.
- `0` — Initializes the index.
- `;` — Separates the initializer from the condition.
- `i` — The index variable being checked.
- `<` — The strictly-less-than operator.
- `length` — The upper bound.
- `;` — Separates condition from increment.
- `i` — The index variable to modify.
- `+=` — The compound addition-assignment operator.
- `2` — Increases `i` by 2 every iteration (the stride).
- `)` — Closes the loop conditions.
- `{` — Opens the loop block.
- `sum` — The accumulator.
- `+=` — Adds the right side to `sum`.
- `a` — The array pointer.
- `[` — Opens the array indexer.
- `i` — The current index.
- `]` — Closes the array indexer.
- `;` — Terminates the addition statement.
- `}` — Closes the loop block.
- `return` — Keyword to send the result back.
- `sum` — The final accumulated total.
- `;` — Terminates the return statement.
- `}` — Closes the function block.

### CS lens
This highlights **spatial locality**. When you read a byte, the hardware assumes you will soon want the adjacent bytes, fetching them in a single block. A stride-1 loop capitalizes perfectly on this assumption. A stride-2 loop wastes half of every loaded block, halving effective memory bandwidth. 
Also recognized in: block reads on hard drives, network packet chunking, database B-tree page layouts, and CPU instruction fetching.

### SE lens
Engineers commonly use arrays of large structures (`struct { long id; char name[256]; }`) and iterate over them just to read the `id`. This creates massive, implicit strides because the `name` data pollutes the cache line, pushing out the next `id`. Refactoring from an Array-of-Structures (AoS) to a Structure-of-Arrays (SoA) guarantees a stride-1 access pattern, vastly dropping the miss rate.

### Commands needed
None.

### Run it
By the Verification Rule exemption, we manually trace the stride-2 execution against our 4-set, 2-long-per-line cache model:
1. `i = 0` — CPU requests `a[0]`. **MISS**. Loads block containing `a[0]` and `a[1]`.
2. `i = 2` — CPU requests `a[2]`. **MISS**. Loads block containing `a[2]` and `a[3]`.
3. `i = 4` — CPU requests `a[4]`. **MISS**. Loads block containing `a[4]` and `a[5]`.
Every single access demands a new cache block. The miss rate is exactly `8/8 = 100%`. Every access pays the massive miss penalty.

### One sentence connecting this unit to what came immediately before.
Reading data exposes miss penalties, but writing data introduces complex policies regarding when and how memory actually receives the modified bytes.

---

## Concept Unit: Write policies and bandwidth

### The Problem
When you write to a variable, does the CPU update the cache, the main memory, or both? If you write to the same variable a million times in a loop, does the memory bus process a million transactions? Think about how the hardware might optimize repeated writes to the exact same address before reading on.

### Introduce the concept in isolation
We will write a throwaway loop that sets every element of an array to zero to analyze write policies.

```c
// Throwaway isolation: Write policies
long a[N];
for (int i = 0; i < N; i++) {
    a[i] = 0;
}
```

By the Verification Rule exemption, we trace the architectural impact of this code under two different policies:
- **Write-through**: Every write updates the cache AND goes immediately over the bus to DRAM. The bus experiences `N` transactions (N * 8 bytes).
- **Write-back**: The CPU writes only to the cache line, marking it "dirty". DRAM is not updated. When the cache line is eventually evicted, all 64 bytes (8 elements) are written to DRAM in a single burst. The bus experiences `N/8` transactions.
The output proves that write-back allows the hardware to coalesce writes, using significantly less memory bus bandwidth for the exact same programmatic result.

### Discard the throwaway example
We discard the throwaway array initialization.

### Project Change
No reference counterpart — we will add a function demonstrating a write miss that highlights write-allocate behavior.
- **Files affected:** `src/cache_perf.c`
- **Change type:** Add
- **Location:** Below `sum_array_stride2`.
- **Dependencies:** None.

### The New Code
```c
long demonstrate_write_allocate(long *a) {
    a[5] = 42;
    long x = a[5];
    return x;
}
```

### The Updated Project
Here is the write demonstration function inside our file.

```c
// 23
    return sum;
// 24
}
// 25
// 26
long demonstrate_write_allocate(long *a) { // ← new
// 27
    a[5] = 42; // ← new
// 28
    long x = a[5]; // ← new
// 29
    return x; // ← new
// 30
} // ← new
```
This function highlights what happens when a write miss occurs, immediately followed by a read to the same address.

### Mechanical walkthrough
- `long` — Return type.
- `demonstrate_write_allocate` — The function name.
- `(` — Opens parameters.
- `long *a` — The array pointer.
- `)` — Closes parameters.
- `{` — Opens block.
- `a` — The array.
- `[` — Opens indexer.
- `5` — Index 5.
- `]` — Closes indexer.
- `=` — Assignment operator.
- `42` — The literal value being written.
- `;` — Terminates write statement.
- `long x` — Declares a local variable to read into.
- `=` — Assignment.
- `a` — The array.
- `[` — Opens indexer.
- `5` — Index 5.
- `]` — Closes indexer.
- `;` — Terminates read statement.
- `return` — Keyword to return.
- `x` — The value returned.
- `;` — Terminates return.
- `}` — Closes block.

### CS lens
These policies represent the fundamental tradeoff of caching: **consistency vs. performance**. Write-through keeps the system consistent at all times, making multi-core synchronization easier, but chokes bandwidth. Write-back maximizes performance but creates temporary inconsistencies where the cache holds newer data than RAM, requiring complex hardware snooping protocols to keep multiple cores aligned.
Also recognized in: database transaction logging (write-ahead logs), distributed filesystem syncing, browser DOM rendering batching, and text editor auto-save mechanisms.

### SE lens
Modern CPUs almost exclusively use Write-Back paired with **Write-Allocate**. Under Write-Allocate, the `a[5] = 42` write miss forces the CPU to load the entire block into the cache, update just `a[5]`, and mark it dirty. The subsequent read `x = a[5]` is a guaranteed cache HIT. If a system used **No-Write-Allocate**, the write would go straight to RAM, bypassing the cache entirely, and the subsequent read would result in a second disastrous MISS.

### Commands needed
None.

### Run it
By the Verification Rule exemption, the function predictably writes 42 and returns 42.
The architectural proof lies in the timing: on a modern system, the write triggers a block load, meaning the subsequent read resolves in L1 (4 cycles) rather than waiting for DRAM (200 cycles).

### One sentence connecting this unit to what came immediately before.
Having modeled these policies conceptually, we can now plug in real-world hardware latency numbers to see exactly how fast modern memory hierarchies are.

---

## Concept Unit: Real CPU L1/L2/L3 numbers

### The Problem
What do the actual cycle penalties look like on a real, physical CPU chip today? If we chain three levels of cache together, how does the AMAT math actually resolve for a realistic workload?

### Introduce the concept in isolation
We will write a throwaway block computing the AMAT for a typical Intel Core or AMD Ryzen architecture using the exact sizes, hit times, and local miss rates observed in benchmarks.

```c
// Throwaway isolation: Real CPU AMAT
double L1_hit = 4.0;
double L1_miss = 0.10;
double L2_hit = 12.0;
double L2_miss = 0.05;
double L3_hit = 40.0;
double L3_miss = 0.01;
double dram = 200.0;
```

By the Verification Rule exemption, we calculate the nested formula:
`AMAT = L1_hit + L1_miss * (L2_hit + L2_miss * (L3_hit + L3_miss * dram))`
`AMAT = 4 + 0.10 * (12 + 0.05 * (40 + 0.01 * 200))`
`AMAT = 4 + 0.10 * (12 + 0.05 * (40 + 2))`
`AMAT = 4 + 0.10 * (12 + 0.05 * 42)`
`AMAT = 4 + 0.10 * (12 + 2.1)`
`AMAT = 4 + 0.10 * 14.1`
`AMAT = 4 + 1.41 = 5.41 cycles`.

The output proves that despite a 200-cycle DRAM penalty, the multi-level cache absorbs so much of the shock that the average access takes just 5.41 cycles.

### Discard the throwaway example
We discard the throwaway variables. 

### Project Change
No reference counterpart — we will add a three-level AMAT computing function.
- **Files affected:** `src/cache_perf.c`
- **Change type:** Add
- **Location:** Below `demonstrate_write_allocate`.
- **Dependencies:** None.

### The New Code
```c
double compute_real_amat() {
    return 4.0 + 0.10 * (12.0 + 0.05 * (40.0 + 0.01 * 200.0));
}
```

### The Updated Project
Here is the three-level computation hardcoded with real-world figures.

```c
// 29
    return x;
// 30
}
// 31
// 32
double compute_real_amat() { // ← new
// 33
    return 4.0 + 0.10 * (12.0 + 0.05 * (40.0 + 0.01 * 200.0)); // ← new
// 34
} // ← new
```
This hardcodes the reality of the three-level SRAM layers shielding the CPU from the DRAM latency cliff.

### Mechanical walkthrough
- `double` — Return type for a fractional cycle count.
- `compute_real_amat` — The function name.
- `(` and `)` — Empty parameter list.
- `{` — Opens block.
- `return` — Keyword to return the result.
- `4.0` — The L1 hit time (always paid).
- `+` — Addition.
- `0.10` — The L1 miss rate (10%).
- `*` — Multiplication.
- `(` — Opens the L2 penalty sub-expression.
- `12.0` — The L2 hit time.
- `+` — Addition.
- `0.05` — The L2 miss rate (5%).
- `*` — Multiplication.
- `(` — Opens the L3 penalty sub-expression.
- `40.0` — The L3 hit time.
- `+` — Addition.
- `0.01` — The L3 miss rate (1%).
- `*` — Multiplication.
- `200.0` — The absolute DRAM penalty.
- `)` — Closes the L3 sub-expression.
- `)` — Closes the L2 sub-expression.
- `;` — Terminates the statement.
- `}` — Closes the block.

### CS lens
This highlights the **hierarchy** in memory hierarchy. Each level is larger but slower than the one above it.
- L1: 32KB, 8-way associative, 4 cycles.
- L2: 256KB, 8-way, 12 cycles.
- L3: 8MB, 16-way, 40 cycles.
- DRAM: 16GB, 200 cycles.
The cascading probabilities ensure that only the most rarely accessed data ever reaches the 200-cycle threshold. Also recognized in: CDN edge nodes caching origin server data, RAM caching spinning disks, and CPU registers caching L1.

### SE lens
Understanding these numbers prevents over-optimization. If a profiler shows a function is bottlenecked on L1 hits (4 cycles), micro-optimizing memory layouts won't help; the CPU is simply executing instructions as fast as physically possible. If the bottleneck is L3 misses, restructuring the data to stay within 256KB will drastically cut runtime.

### Commands needed
None.

### Run it
By the Verification Rule exemption, the calculation is deterministic: `5.41`.

### One sentence connecting this unit to what came immediately before.
These cycle times assume we wait for a miss to occur before fetching, but modern hardware can predict misses and fetch data before we even ask for it.

---

## Concept Unit: Prefetching -- hiding miss penalty

### The Problem
If the CPU knows we are running a stride-1 loop, why does it wait for the inevitable L1 cache miss before fetching the next block from DRAM? Couldn't it fetch block $N+1$ while the program is still crunching the numbers for block $N$? How can we tell the CPU to prefetch data when the pattern isn't perfectly sequential?

### Introduce the concept in isolation
We will write a throwaway block using a compiler intrinsic to explicitly tell the hardware to load a specific address into the cache ahead of time.

```c
// Throwaway isolation: Software prefetching
long a[100];
long sum = 0;
for (int i = 0; i < 80; i++) {
    __builtin_prefetch(&a[i + 16], 0, 1);
    sum += a[i];
}
```

By the Verification Rule exemption, we know the behavioral output: this loop computes the exact same sum as a normal loop. However, the `__builtin_prefetch` call compiles down to a `PREFETCHT0` assembly instruction. While the CPU calculates `sum += a[i]`, the memory controller concurrently goes to fetch `a[i + 16]`. By the time the loop reaches `i = 16`, the data has already arrived in the L1 cache. The output proves that the effective miss penalty approaches 0.

### Discard the throwaway example
We delete the throwaway loop.

### Project Change
No reference counterpart — we will implement an explicit prefetch loop to demonstrate manual cache control.
- **Files affected:** `src/cache_perf.c`
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```c
long sum_array_prefetch(long *a, int length) {
    long sum = 0;
    for (int i = 0; i < length; i++) {
        __builtin_prefetch(&a[i + 16], 0, 1);
        sum += a[i];
    }
    return sum;
}
```

### The Updated Project
Here is the function fully formed in the project file.

```c
// 33
    return 4.0 + 0.10 * (12.0 + 0.05 * (40.0 + 0.01 * 200.0));
// 34
}
// 35
// 36
long sum_array_prefetch(long *a, int length) { // ← new
// 37
    long sum = 0; // ← new
// 38
    for (int i = 0; i < length; i++) { // ← new
// 39
        __builtin_prefetch(&a[i + 16], 0, 1); // ← new
// 40
        sum += a[i]; // ← new
// 41
    } // ← new
// 42
    return sum; // ← new
// 43
} // ← new
```
This loop explicitly instructs the hardware to fetch data 16 elements ahead, completely eliminating the cold miss penalty for the subsequent iterations.

### Mechanical walkthrough
- `long` — Return type.
- `sum_array_prefetch` — Function name.
- `(` and `)` — Parameters wrapping the array and length.
- `{` — Opens block.
- `long sum = 0;` — Accumulator setup.
- `for` — Opens the loop.
- `(` — Loop setup parameters.
- `int i = 0;` — Initializes index.
- `i < length;` — Loop bound.
- `i++` — Increment by 1.
- `)` — Closes loop parameters.
- `{` — Opens loop block.
- `__builtin_prefetch` — The GCC compiler intrinsic that emits a hardware prefetch instruction.
- `(` — Opens the arguments for the prefetch.
- `&` — The address-of operator in C.
- `a` — The array.
- `[` — Opens index.
- `i` — Current index.
- `+` — Addition.
- `16` — The lookahead distance. We ask for the data 16 elements in the future.
- `]` — Closes index.
- `,` — Separates arguments.
- `0` — The read/write flag (0 means we intend to read the data, 1 means write).
- `,` — Separates arguments.
- `1` — The temporal locality flag (0 means we won't need it again soon, 3 means keep it in cache forever; 1 is low temporal locality).
- `)` — Closes the intrinsic arguments.
- `;` — Terminates the prefetch statement.
- `sum += a[i];` — The actual calculation logic on the present data.
- `}` — Closes the loop.
- `return sum;` — Returns the value.
- `}` — Closes the function.

### CS lens
**Hardware prefetchers** are incredibly smart — they actively monitor the bus, detect stride-1 and stride-2 patterns dynamically, and automatically fetch ahead. The software `__builtin_prefetch` is a manual override, used when accesses are random (like traversing a linked list or dereferencing pointers in a hash map) where the hardware prefetcher is entirely blind.
Also recognized in: video buffering on YouTube, speculative execution branches, JIT compiler warmups, and pre-loading image assets in web browsers.

### SE lens
Using `__builtin_prefetch` is dangerous. If you prefetch too far ahead, you evict useful data from the L1 cache before the program actually needs it (cache pollution). If you prefetch too close, the data hasn't arrived from DRAM by the time the code reaches it, rendering the prefetch useless. Tuning the lookahead distance (16 elements here) requires deep knowledge of the specific CPU's memory latency and clock speed.

### Commands needed
None.

### Run it
By the Verification Rule exemption, the function computes the array sum identically to the non-prefetched version. The difference is purely in the clock cycles consumed by the CPU under the hood, effectively shrinking the AMAT toward 4.0 cycles.

### One sentence connecting this unit to what came immediately before.
Prefetching can save linear traversals, but an atrocious memory access pattern can create strides so large that even prefetching cannot save the performance.

---

## Concept Unit: Row-major vs column-major -- full performance comparison

### The Problem
If we have a massive 2D matrix of numbers, does it matter whether we add them up row-by-row or column-by-column? In mathematics, the sum is identical. In computer systems, one is 50 times slower than the other. Why?

### Introduce the concept in isolation
We will define a throwaway 2D array matrix in C and observe how the compiler maps it to a 1D memory space.

```c
// Throwaway isolation: Matrix layout
#define N 4096
double A[N][N]; // 4096 * 4096 * 8 bytes = 134,217,728 bytes (~128 MB)
```

By the Verification Rule exemption, we examine the architectural layout. C uses **Row-major** order. This means `A[0][0]` and `A[0][1]` sit physically side-by-side in RAM. `A[0][0]` and `A[1][0]` are separated by an entire row of 4096 `double`s, which is exactly `4096 * 8 = 32,768` bytes apart. The output proves that jumping between rows involves a massive stride that exceeds the size of a single 64-byte cache line entirely.

### Discard the throwaway example
We discard the throwaway array definition.

### Project Change
No reference counterpart — we will build two functions that highlight the performance destruction of column-major access.
- **Files affected:** `src/cache_perf.c`
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```c
#define N 4096
double A[N][N];

void sum_matrix_row() {
    double sum = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            sum += A[i][j];
}

void sum_matrix_col() {
    double sum = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            sum += A[i][j];
}
```

### The Updated Project
Here are the two loops in the file.

```c
// 42
    return sum;
// 43
}
// 44
// 45
#define N 4096 // ← new
// 46
double A[N][N]; // ← new
// 47
// 48
void sum_matrix_row() { // ← new
// 49
    double sum = 0; // ← new
// 50
    for (int i = 0; i < N; i++) // ← new
// 51
        for (int j = 0; j < N; j++) // ← new
// 52
            sum += A[i][j]; // ← new
// 53
} // ← new
// 54
// 55
void sum_matrix_col() { // ← new
// 56
    double sum = 0; // ← new
// 57
    for (int j = 0; j < N; j++) // ← new
// 58
        for (int i = 0; i < N; i++) // ← new
// 59
            sum += A[i][j]; // ← new
// 60
} // ← new
```
Swapping the `i` and `j` loops is structurally identical logic, but disastrously different at the hardware level.

### Mechanical walkthrough
- `#define` — A C preprocessor directive creating a macro.
- `N` — The macro name.
- `4096` — The value replacing `N`.
- `double A[N][N];` — Declares a massive 128 MB 2D array in global memory, far larger than any cache.
- `void sum_matrix_row()` — The row-major traversal function.
- `{` — Opens block.
- `double sum = 0;` — Initializes the accumulator.
- `for (int i = 0; i < N; i++)` — The outer loop, pinning the row `i`.
- `for (int j = 0; j < N; j++)` — The inner loop, advancing the column `j`.
- `sum += A[i][j];` — Accesses memory sequentially (stride-1). `j` moves rapidly, hitting adjacent bytes.
- `}` — Closes the function.
- `void sum_matrix_col()` — The column-major traversal function.
- `{` — Opens block.
- `double sum = 0;` — Initializes accumulator.
- `for (int j = 0; j < N; j++)` — The outer loop, pinning the column `j`.
- `for (int i = 0; i < N; i++)` — The inner loop, advancing the row `i`.
- `sum += A[i][j];` — Accesses memory vertically (stride-4096). Every iteration jumps 32,768 bytes ahead.
- `}` — Closes the function.

### CS lens
In `sum_matrix_row`, the access is stride-1. A 64-byte cache line holds 8 `double`s. The miss rate is $1/8 = 12.5\%$. The hardware prefetcher detects this stride and perfectly hides the penalty. The AMAT is $\sim 4$ cycles.
In `sum_matrix_col`, the access stride is 32,768 bytes. Every single access misses the cache because it lands in a completely different cache line. The hardware prefetcher is utterly defeated. The miss rate is $\sim 100\%$. The AMAT is $4 + 1.00 \times 200 = 204$ cycles. 
The ratio: $204 / 4 = 51\times$ slower execution for the exact same programmatic work.
Also recognized in: image processing (traversing pixels vertically vs horizontally), matrix multiplication in scientific computing (BLAS), and database columnar storage engines vs row-based SQL databases.

### SE lens
This is the ultimate trap for programmers transitioning from high-level languages to C. In Python or Java, 2D arrays are arrays of pointers, so the memory is already fragmented and slow regardless of traversal order. In C, memory is perfectly linear and continuous. Exploiting that linearity is the single most powerful optimization available. If a loop is column-major, no amount of loop unrolling, SIMD vectorization, or multithreading will save it from the memory bottleneck. 

### Commands needed
None.

### Run it
By the Verification Rule exemption, we know the architectural outcome. The `sum_matrix_row` code runs near the CPU's maximum speed. The `sum_matrix_col` code stalls the CPU pipe completely, waiting on main memory for every single addition.

### One sentence connecting this unit to what came immediately before.
Having proven that access patterns dictate memory speed entirely, we can now use AMAT to measure and mitigate these issues.

---

## Connect the pieces
Throughout this lesson, a single cache line travels a rocky path: it is calculated abstractly via the AMAT formula (`14 cycles`), tracked as a 6x slowdown in execution traces, loaded into a 4-set architecture via `sum_array_stride1`, written back to DRAM under a write-back policy in `demonstrate_write_allocate`, accelerated by a `PREFETCHT0` instruction via `__builtin_prefetch`, and ultimately weaponized or destroyed in the row-major vs column-major matrix summation loops. 

You can now quantify memory performance using AMAT. Lesson 17 covers loop tiling and cache blocking to optimize massive working sets that exceed cache capacities. Exercises to consider: compute the AMAT for a direct-mapped cache with a 5% miss rate and 50-cycle penalty; trace the miss rate for a stride-4 access on a cache with 8 elements per line; calculate how many bus cycles it takes to transfer 8 missed 64-byte cache lines on a 64-bit bus.
