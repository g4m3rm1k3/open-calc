# Lesson 40: Optimizing Performance — Profiling, Amdahl's Law, and Bottleneck Analysis

What you will build: The reader will understand how to measure program performance correctly, how to use gprof and perf, what Amdahl's Law says about the limits of optimization, and how to identify the bottleneck before touching any code. The transferable insight: the first rule of optimization is MEASURE, not guess. Programmers consistently misidentify the bottleneck. Amdahl's Law quantifies why optimizing non-bottleneck code is wasted effort.

What you need to know first: Lessons 00-39.

## Terms used in this lesson

- **Wall time** — The actual real-world time elapsed from start to finish. It exists because CPU time doesn't account for time spent waiting (like I/O or sleep), which the user still experiences.
- **CPU time** — The time the processor actively spends executing instructions for a specific process. It exists because measuring performance strictly by wall time is misleading if the system is busy executing other processes.
- **Cycles Per Element (CPE)** — A metric indicating how many CPU cycles it takes to process one element of data. It exists to abstract away the total number of elements and show the fundamental efficiency of a loop's core operation.
- **Cache-friendly access (Locality)** — Accessing memory sequentially (e.g., row-major in C). It exists because modern CPUs load memory in chunks (cache lines); reading sequentially uses the whole chunk before it's evicted, whereas jumping around (column-major) causes cache misses and stalls the CPU.

## Objects and methods used

- **`clock_gettime`**
  - *What it is:* A POSIX standard C library function for high-resolution time measurement.
  - *Implementation:* `int clock_gettime(clockid_t clk_id, struct timespec *tp);`
  - *Its use:* We use it to measure both wall time and CPU time precisely for performance benchmarking.
  - *Type:* A standard library function.
  - *Responsibility:* Queries the system's clock hardware or kernel timekeeping to populate a `timespec` struct with seconds and nanoseconds.
  - *Depends on:* Requires a clock ID constant (like `CLOCK_MONOTONIC`) and a pointer to a `struct timespec` where the result will be written.
  - *Connects to:* Called by our benchmarking code; talks to the operating system kernel via a syscall to get the time.
  - *Shape:* A low-level system boundary API bridging user space and kernel space.

- **`struct timespec`**
  - *What it is:* A C struct defined in `<time.h>` used to hold high-resolution time values.
  - *Implementation:* `struct timespec { time_t tv_sec; long tv_nsec; };`
  - *Its use:* We use it as the destination for `clock_gettime`'s output, giving us nanosecond-level precision.
  - *Type:* A standard library structure.
  - *Responsibility:* Stores a time duration or timestamp, split into integer seconds and fractional nanoseconds.
  - *Depends on:* Being allocated (usually on the stack) before being passed by reference to functions that populate it.
  - *Connects to:* Populated by `clock_gettime`; read by our timing calculation math.
  - *Shape:* A data container used by POSIX time APIs.


## Concept Unit: Measuring with clock_gettime — the right way

### The Problem
How do you know if your code is actually fast? If you just use a stopwatch in your hand, you're measuring how long it took you to click the button. What if your program is paused while the OS reads a file from disk, or another program uses the CPU? How can we measure the *exact* time our program spends computing?

### Introduce the concept in isolation
Here is throwaway C code demonstrating how to measure time correctly:

```c
#include <time.h>
#include <stdio.h>
#include <math.h>

double elapsed_ms(struct timespec *start, struct timespec *end) {
    return (end->tv_sec - start->tv_sec) * 1000.0 +
           (end->tv_nsec - start->tv_nsec) / 1e6;
}

int main(void) {
    struct timespec t0, t1;

    /* CLOCK_MONOTONIC: wall time that doesn't jump on NTP adjustments */
    clock_gettime(CLOCK_MONOTONIC, &t0);

    /* Compute something non-trivial */
    volatile double sum = 0.0;
    for (int i = 0; i < 10000000; i++)
        sum += sqrt((double)i);  /* sqrt forces actual FPU work */

    clock_gettime(CLOCK_MONOTONIC, &t1);
    printf("Wall time: %.3f ms\n", elapsed_ms(&t0, &t1));
    printf("Sum: %.6f (prevents dead code elimination)\n", sum);

    /* CLOCK_PROCESS_CPUTIME_ID: CPU time only (excludes I/O wait) */
    clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &t0);
    volatile double sum2 = 0.0;
    for (int i = 0; i < 10000000; i++) sum2 += sqrt((double)i);
    clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &t1);
    printf("CPU time: %.3f ms\n", elapsed_ms(&t0, &t1));
    return 0;
}
```

Predicted Output (because exact timing depends on the specific machine's CPU speed):
```text
Wall time: 45.231 ms
Sum: 21081851083.600372 (prevents dead code elimination)
CPU time: 44.987 ms
```

What this proves: `clock_gettime` fills a `struct timespec` with seconds and nanoseconds. `volatile` prevents the compiler from optimizing away the loop entirely. `CLOCK_MONOTONIC` tracks absolute wall time, while `CLOCK_PROCESS_CPUTIME_ID` isolates the time the CPU was actively executing this specific process.

### Discard the throwaway
This code is discarded. We will not use it directly in our project.

### Project Change
No project change. This is a standalone theory lesson.

### The New Code
```c
/* No new project code for this theory unit. */
```

### The Updated Project
```c
/* No updated project for this theory unit. */
```

### Mechanical walkthrough
- `#include <time.h>` brings in the declarations for POSIX time routines, including `clock_gettime` and `struct timespec`.
- `struct timespec t0, t1;` declares two local variables to hold the start and end timestamps.
- `clock_gettime(CLOCK_MONOTONIC, &t0);` calls the OS to record the current monotonic wall clock time and store it in `t0`.
- `volatile double sum = 0.0;` declares a variable that tells the compiler not to optimize out reads and writes to this memory location.
- `elapsed_ms(&t0, &t1)` is a helper function call that computes the difference in milliseconds using the seconds and nanoseconds fields.
- `clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &t0);` records the time the process has actually spent executing on the CPU, ignoring time spent suspended or waiting for I/O.

### CS lens
Performance Measurement. This concept appears when profiling web servers (measuring latency vs. throughput), in game engines (measuring frame time in milliseconds), and in high-frequency trading (where microseconds matter and wall-clock jumps can ruin calculations).

### SE lens
Design Principle: The Observer Effect. By measuring the system, we slightly perturb it. The alternative not chosen is using lower-resolution tools like `time()` which only measure in seconds. The tradeoff is that calling high-resolution timers takes a few CPU cycles itself, which can distort measurements if called too frequently in a tight loop.

### Commands needed
None.

### Run it
Output as shown in isolation step:
```text
Wall time: 45.231 ms
Sum: 21081851083.600372 (prevents dead code elimination)
CPU time: 44.987 ms
```

### One sentence connecting to previous unit
Now that we know how to measure time accurately, we need to understand the mathematical limit of how much speedup we can actually achieve.


## Concept Unit: Amdahl's Law — the limits of optimization

### The Problem
If you make a function that takes 10% of your program's execution time run instantly (infinitely fast), how much faster does your overall program run? Why does optimizing code sometimes barely make a dent in the overall performance?

### Introduce the concept in isolation
Here is throwaway C code calculating Amdahl's Law:

```c
#include <stdio.h>

double amdahl(double f, double k) {
    /* f: fraction of time spent in the optimized part (0.0 to 1.0) */
    /* k: speedup of that part (e.g., 2.0 = twice as fast) */
    return 1.0 / ((1.0 - f) + f / k);
}

int main(void) {
    printf("Fraction sped up | Speedup k=2  | Speedup k=10 | Speedup k=inf\n");
    double fractions[] = {0.5, 0.8, 0.9, 0.95, 0.99};
    for (int i = 0; i < 5; i++) {
        double f = fractions[i];
        printf("f=%.2f            | %.2fx        | %.2fx        | %.2fx\n",
               f,
               amdahl(f, 2.0),
               amdahl(f, 10.0),
               amdahl(f, 1e9));  /* approximates infinity */
    }
    return 0;
}
```

Predicted Output (deterministic math):
```text
Fraction sped up | Speedup k=2  | Speedup k=10 | Speedup k=inf
f=0.50            | 1.33x        | 1.82x        | 2.00x
f=0.80            | 1.67x        | 3.57x        | 5.00x
f=0.90            | 1.82x        | 5.26x        | 10.00x
f=0.95            | 1.90x        | 6.90x        | 20.00x
f=0.99            | 1.98x        | 9.17x        | 100.00x
```

What this proves: Amdahl's Law dictates that if fraction `f` of a program is sped up by factor `k`, the overall speedup is `1 / ((1 - f) + f/k)`. Making 90% of a program infinitely fast still only yields a 10x overall speedup, because the unoptimized 10% dominates the execution time. 

### Discard the throwaway
This code is discarded. We will not use it directly in our project.

### Project Change
No project change. This is a standalone theory lesson.

### The New Code
```c
/* No new project code for this theory unit. */
```

### The Updated Project
```c
/* No updated project for this theory unit. */
```

### Mechanical walkthrough
- `double amdahl(double f, double k)` declares a function that takes two doubles (fraction and speedup factor) and returns a double.
- `return 1.0 / ((1.0 - f) + f / k);` is the literal mathematical formulation of Amdahl's Law.
- `double fractions[] = {0.5, 0.8, 0.9, 0.95, 0.99};` declares an array of various fractions of time spent in a hypothetical bottleneck.
- `amdahl(f, 1e9)` calls the function with a speedup factor of 1 billion, effectively simulating an infinite speedup where the optimized portion takes zero time.

### CS lens
Theoretical limits of computation. This concept applies heavily in parallel computing (adding more CPU cores), network optimization (upgrading link speed when server processing is the bottleneck), and database queries (adding indexes).

### SE lens
Design Principle: The 80/20 Rule (Pareto Principle). The alternative not chosen is blindly optimizing every function in the codebase. The real tradeoff is engineering effort vs. actual performance gains: spending weeks optimizing a function that accounts for 5% of execution time will yield at most a 1.05x speedup, representing a massive waste of resources.

### Commands needed
None.

### Run it
Output as shown in isolation step:
```text
Fraction sped up | Speedup k=2  | Speedup k=10 | Speedup k=inf
f=0.50            | 1.33x        | 1.82x        | 2.00x
...
```

### One sentence connecting to previous unit
Because Amdahl's Law proves that optimizing non-bottleneck code is useless, we must use a profiler to find where the program actually spends its time.


## Concept Unit: Profiling with gprof

### The Problem
If our program consists of 50 different functions, how do we know which one is the bottleneck? Should we manually wrap `clock_gettime` around every single function call?

### Introduce the concept in isolation
Here is throwaway C code designed to be profiled, simulating a slow function and a fast function:

```c
/* matrix.c */
void compute_checksum() {
    volatile int dummy = 0;
    for(int i=0; i<10000; i++) dummy += i;
}

void matrix_multiply(double *C, double *A, double *B, int n) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            C[i*n + j] = 0.0;
            for (int k = 0; k < n; k++)
                C[i*n + j] += A[i*n + k] * B[k*n + j];
                /* Column-major access of B: cache-unfriendly */
        }
}

int main() {
    double C[100], A[100], B[100];
    for(int i=0; i<10000; i++) {
        matrix_multiply(C, A, B, 10);
        compute_checksum();
    }
    return 0;
}
```

Predicted gprof Output (when compiled with `-pg`):
```text
Flat profile:
%  cumulative   self              self     total
time   seconds   seconds    calls  ms/call  ms/call  name
95.2    0.43      0.43    10000  0.04     0.04     matrix_multiply
 4.8    0.45      0.02    10000  0.00     0.00     compute_checksum
```

What this proves: By compiling with `-pg`, the compiler inserts timing and counting instructions at the entry and exit of every function. When the program runs, it generates a `gmon.out` file. The tool `gprof` reads this file to produce a flat profile, immediately revealing that `matrix_multiply` takes 95% of the time, identifying it as the undisputed bottleneck.

### Discard the throwaway
This code is discarded. We will not use it directly in our project.

### Project Change
No project change. This is a standalone theory lesson.

### The New Code
```c
/* No new project code for this theory unit. */
```

### The Updated Project
```c
/* No updated project for this theory unit. */
```

### Mechanical walkthrough
- `void compute_checksum()` declares a dummy function that does a tiny amount of work.
- `void matrix_multiply(...)` declares a function that does $O(n^3)$ math.
- `C[i*n + j] += A[i*n + k] * B[k*n + j];` is the core loop doing the computation, notable for accessing array `B` non-sequentially.
- The `gcc -O2 -pg` compilation flag (used in the terminal) instruments the resulting binary to dump profiling data upon exit.

### CS lens
Instrumentation. This concept appears in garbage collection tuning, application performance monitoring (APM) tools like DataDog or New Relic, and tracing microservices via tools like Jaeger.

### SE lens
Design Principle: Data-Driven Decision Making. The alternative not chosen is guessing which function is slow based on code complexity. The real tradeoff is that instrumentation (like `-pg`) adds overhead to the program itself, slightly altering its performance characteristics in order to measure them.

### Commands needed
gprof

### Run it
Output as shown in isolation step:
```text
Flat profile:
...
```

### One sentence connecting to previous unit
While gprof tells us *which* function is slow, it doesn't tell us *why* it is slow at the hardware level.


## Concept Unit: perf — hardware counter profiling

### The Problem
We know `matrix_multiply` is the bottleneck, but why? Is it doing too much math? Is it waiting for memory? How can we peer inside the CPU itself to see what is holding it back?

### Introduce the concept in isolation
Here is throwaway C code showing an optimized matrix multiplication to contrast with the previous slow one:

```c
#include <stdlib.h>

void matrix_multiply_optimized(double *C, double *A, double *B, int n) {
    /* Transpose B first for cache-friendly access */
    double *BT = malloc(n * n * sizeof(double));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            BT[j*n + i] = B[i*n + j];  /* transpose */

    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            double sum = 0.0;
            for (int k = 0; k < n; k++)
                sum += A[i*n + k] * BT[j*n + k]; /* now row-major: cache-friendly */
            C[i*n + j] = sum;
        }
    free(BT);
}
```

Predicted `perf stat` Output (comparing old vs. new):
```text
Old matrix_multiply:
    45,678,901  cache-misses          # 23.4% of cache refs

Optimized matrix_multiply:
     1,234,567  cache-misses          #  0.8% of cache refs
```

What this proves: `perf` reads hardware performance counters built directly into modern CPUs. It doesn't require recompiling the code. It proves that the original code was slow not because of computation, but because of cache misses (memory delays). By transposing array `B` into `BT`, the inner loop now accesses memory sequentially, dropping the cache miss rate to near zero and drastically speeding up the execution.

### Discard the throwaway
This code is discarded. We will not use it directly in our project.

### Project Change
No project change. This is a standalone theory lesson.

### The New Code
```c
/* No new project code for this theory unit. */
```

### The Updated Project
```c
/* No updated project for this theory unit. */
```

### Mechanical walkthrough
- `double *BT = malloc(n * n * sizeof(double));` dynamically allocates memory for the transposed matrix on the heap.
- `BT[j*n + i] = B[i*n + j];` physically rearranges the data in memory so that columns become rows.
- `sum += A[i*n + k] * BT[j*n + k];` accesses `BT` linearly (varying `k` across the contiguous row) rather than jumping by strides of `n`.
- `free(BT);` releases the allocated memory back to the OS.

### CS lens
Locality of Reference. This concept appears everywhere in systems programming: database index design (B-trees grouping data in pages), OS virtual memory paging, and CDN architectures placing data physically closer to users.

### SE lens
Design Principle: Mechanical Sympathy. The alternative not chosen is assuming memory access time is uniform and leaving the algorithm alone. The tradeoff is using extra memory (the `BT` array allocation) and extra setup time (the transpose loop) to achieve drastically lower latency in the core computation.

### Commands needed
perf

### Run it
Output as shown in isolation step:
```text
Old matrix_multiply:
    45,678,901  cache-misses          # 23.4% of cache refs
```

### One sentence connecting to previous unit
To quantify exactly how bad those cache misses are at different sizes, we can measure the CPU cycles spent per array element.


## Concept Unit: CPE — cycles per element and throughput analysis

### The Problem
How do we know if our optimization hit a wall? If we process 1,000 items, it's fast. If we process 1,000,000 items, does it take exactly 1,000 times longer? Or does the CPU behave differently when dealing with massive datasets?

### Introduce the concept in isolation
Here is throwaway C code measuring Cycles Per Element (CPE) for a simple sum:

```c
#include <time.h>
#include <stdio.h>

void sum_array(long *result, long *a, int n) {
    long s = 0;
    for (int i = 0; i < n; i++)
        s += a[i];
    *result = s;
}

int main(void) {
    int sizes[] = {1000, 10000, 100000, 1000000};
    long data[1000000];
    for (int i = 0; i < 1000000; i++) data[i] = i;

    for (int s = 0; s < 4; s++) {
        int n = sizes[s];
        struct timespec t0, t1;
        long result;
        int reps = 1000000 / n;  /* more reps for small n */

        clock_gettime(CLOCK_MONOTONIC, &t0);
        for (int r = 0; r < reps; r++)
            sum_array(&result, data, n);
        clock_gettime(CLOCK_MONOTONIC, &t1);

        double ms = (t1.tv_sec - t0.tv_sec)*1000.0 +
                    (t1.tv_nsec - t0.tv_nsec)/1e6;
        double ns_per_elem = ms * 1e6 / ((double)n * reps);
        /* Assume 3 GHz: 1 ns = 3 cycles */
        double cpe = ns_per_elem * 3.0;
        printf("n=%7d: %.3f ns/elem = %.2f CPE\n", n, ns_per_elem, cpe);
    }
    return 0;
}
```

Predicted Output (typical x86-64, compiled with `-O2`):
```text
n=   1000: 0.333 ns/elem = 1.00 CPE
n=  10000: 0.333 ns/elem = 1.00 CPE
n= 100000: 0.500 ns/elem = 1.50 CPE
n=1000000: 1.333 ns/elem = 4.00 CPE
```

What this proves: CPE analysis reveals the physical memory hierarchy of the CPU. For small `n`, the array fits in the L1 cache, processing at 1 Cycle Per Element. As `n` grows past the L3 cache into main RAM (DRAM), the CPU stalls waiting for data, drastically increasing the CPE to 4.0. The math operation hasn't changed; the memory access cost has.

### Discard the throwaway
This code is discarded. We will not use it directly in our project.

### Project Change
No project change. This is a standalone theory lesson.

### The New Code
```c
/* No new project code for this theory unit. */
```

### The Updated Project
```c
/* No updated project for this theory unit. */
```

### Mechanical walkthrough
- `long s = 0;` declares a local accumulator variable.
- `int sizes[] = {1000, 10000, 100000, 1000000};` defines an array of varying problem sizes to benchmark.
- `long data[1000000];` allocates a large 8-megabyte array on the stack.
- `int reps = 1000000 / n;` computes how many times to repeat the loop so that the total amount of work remains constant, yielding stable time measurements.
- `double ns_per_elem = ms * 1e6 / ((double)n * reps);` mathematically derives the time taken per array element by dividing the total time by total operations.
- `double cpe = ns_per_elem * 3.0;` scales the time to CPU cycles, assuming a 3 GHz clock (3 cycles per nanosecond).

### CS lens
Memory Hierarchy. This concept is foundational to modern computing, showing up in the design of CPU caches (L1/L2/L3), SSD vs. HDD storage latency profiles, and tiered storage in cloud architectures.

### SE lens
Design Principle: Microbenchmarking. The alternative not chosen is assuming constant $O(1)$ time for array accesses. The real tradeoff is that microbenchmarking is notoriously difficult to get right, often falling victim to CPU frequency scaling, compiler optimizations, and background noise.

### Commands needed
None.

### Run it
Output as shown in isolation step:
```text
n=   1000: 0.333 ns/elem = 1.00 CPE
n=1000000: 1.333 ns/elem = 4.00 CPE
```

### One sentence connecting to previous unit
Now that we have covered how to identify bottlenecks at the hardware level, we can understand why compilers make the decisions they do.

## Closing

### Connect the pieces
You can now measure performance scientifically and identify bottlenecks rigorously. Tracing a profiling session on a matrix multiply moves from using `clock_gettime` to prove there's a problem, to `gprof` to find the exact function at fault, to `perf` to see that cache misses are the hardware cause, and finally to CPE analysis to prove the fix scales. Lesson 41 covers the code-level optimizations the compiler can do — and those it cannot. Amdahl's Law is the single most important insight in performance engineering: optimizing a non-bottleneck never matters, and the bottleneck is almost always not where you expect it.
