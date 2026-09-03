# Lesson 18: The Memory Mountain — Measuring Cache Performance and Understanding Bandwidth

What you will build: The reader will understand the memory mountain: a 3D surface showing read throughput as a function of working set size and stride, and will be able to write a mountain-reading function, interpret its output, and use it to identify cache sizes and bandwidths. The transferable insight: the memory mountain is the definitive visualization of how your program's memory access pattern determines performance. Every programmer who cares about performance should be able to read one.

What you need to know first: Lessons 00-17.

**Terms used in this lesson**
- **Throughput** — The rate at which bytes are read from or written to memory, usually measured in megabytes per second (MB/s) or gigabytes per second (GB/s). We measure throughput because it directly determines how long a memory-bound program will take to execute.
- **Working Set** — The total amount of data a program actively uses during a specific phase of its execution. If the working set fits entirely within a certain cache level (e.g., L1), the program will enjoy the high throughput of that cache level.
- **Stride** — The distance between successive memory accesses. A stride of 1 means contiguous elements are accessed sequentially. A stride of 32 means accessing every 32nd element. Stride determines spatial locality and how effectively the hardware prefetcher can guess the next required memory address.
- **Hardware Prefetcher** — A CPU mechanism that detects regular memory access patterns and fetches data into the cache before the CPU actually executes the load instruction. It hides memory latency for predictable patterns (like stride-1).
- **False Sharing** — A performance degradation that occurs when multiple threads on different cores independently modify variables that happen to reside in the same cache line. The cache line ping-pongs between the cores, causing a massive drop in throughput even though the threads are not actually sharing data.
- **Pointer Chasing** — A memory access pattern where the address of the next load is obtained from the data loaded by the previous one (e.g., linked list traversal `p = p->next`). This completely defeats the hardware prefetcher because the next address cannot be predicted until the current load completes.

**Objects and methods used**
- **`measure_throughput_MBs`**
  - *What it is:* A function to benchmark read throughput.
  - *Implementation:* `double measure_throughput_MBs(size_t working_set_bytes, int stride)`
  - *Its use:* We use it to measure how fast the CPU can read data for a specific working set size and spatial stride, illustrating the memory mountain.
  - *Type:* Free function.
  - *Responsibility:* Allocates a buffer, warms the cache, measures the time to traverse the buffer according to a stride, calculates throughput, and frees the buffer.
  - *Depends on:* Standard C library for allocation (`malloc`, `free`) and timekeeping (`clock_gettime`).
  - *Connects to:* Called by `main` or other benchmarking drivers. Calls system time routines. Returns a `double`.
  - *Shape:* Benchmark harness function.
- **`clock_gettime`**
  - *What it is:* POSIX standard function for high-resolution timekeeping.
  - *Implementation:* `int clock_gettime(clockid_t clk_id, struct timespec *tp);`
  - *Its use:* We use it to get precise wall-clock time elapsed across our benchmarking loops to calculate throughput accurately.
  - *Type:* Standard library function.
  - *Responsibility:* Retrieves the time of the specified clock and stores it in a `timespec` struct.
  - *Depends on:* An OS implementation of the POSIX time interface.
  - *Connects to:* Called by `measure_throughput_MBs`. Mutates the struct pointed to by `tp`.
  - *Shape:* Low-level OS API interaction.
- **`CLOCK_MONOTONIC`**
  - *What it is:* A clock identifier for `clock_gettime`.
  - *Implementation:* Macro expanding to an integer constant.
  - *Its use:* Represents a clock that cannot be set and represents monotonic time since some unspecified starting point, immune to system clock jumps. Perfect for benchmarking.
  - *Type:* Constant macro.
  - *Responsibility:* Tells `clock_gettime` to use a monotonic clock.
  - *Depends on:* N/A.
  - *Connects to:* Passed as the first argument to `clock_gettime`.
  - *Shape:* API flag.
- **`malloc`**
  - *What it is:* Standard library dynamic memory allocator.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* Used to allocate the contiguous arrays that serve as our working sets.
  - *Type:* Standard library function.
  - *Responsibility:* Allocates uninitialized contiguous memory of the requested size.
  - *Depends on:* OS memory management.
  - *Connects to:* Called by benchmarking functions.
  - *Shape:* Memory allocation API.
- **`free`**
  - *What it is:* Standard library memory deallocator.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* Releases memory allocated by `malloc`.
  - *Type:* Standard library function.
  - *Responsibility:* Frees memory to the system to prevent memory leaks.
  - *Depends on:* A valid pointer previously returned by `malloc`.
  - *Connects to:* Called by benchmarking functions after measurement.
  - *Shape:* Memory deallocation API.

## Concept Unit: Read throughput as a metric — MB/s not time

### The Problem
When evaluating how well an application utilizes the memory subsystem, simply timing how long a loop takes in seconds is often misleading, because the amount of work scales with the size of the input. How can we meaningfully compare memory access efficiency across vastly different dataset sizes? And how can we tell if we are maxing out the hardware's capabilities?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

/* Measure read throughput in MB/s for a given working set size and stride */
double measure_throughput_MBs(size_t working_set_bytes, int stride) {
    size_t n = working_set_bytes / sizeof(int);
    int *data = malloc(working_set_bytes);
    for (size_t i = 0; i < n; i++) data[i] = (int)i;

    /* Warm up: bring data into cache */
    volatile long sink = 0;
    for (size_t i = 0; i < n; i += stride) sink += data[i];

    /* Measure: count bytes read per second */
    struct timespec t0, t1;
    int reps = 10;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    for (int r = 0; r < reps; r++)
        for (size_t i = 0; i < n; i += stride) sink += data[i];
    clock_gettime(CLOCK_MONOTONIC, &t1);
    (void)sink;

    double elapsed_s = (t1.tv_sec - t0.tv_sec)
                     + (t1.tv_nsec - t0.tv_nsec) / 1e9;
    /* Bytes read: (n/stride) elements * sizeof(int) * reps */
    double bytes_read = (double)(n / stride) * sizeof(int) * reps;
    free(data);
    return (bytes_read / elapsed_s) / (1024.0 * 1024.0);  /* MB/s */
}

int main(void) {
    printf("Working set 16KB,  stride 1:  %.0f MB/s\n",
           measure_throughput_MBs(16*1024, 1));    /* in L1: high */
    printf("Working set 16KB,  stride 32: %.0f MB/s\n",
           measure_throughput_MBs(16*1024, 32));   /* still in L1: lower */
    printf("Working set 256MB, stride 1:  %.0f MB/s\n",
           measure_throughput_MBs(256*1024*1024, 1));  /* DRAM: low */
    return 0;
}
/* Illustrative output (hardware-dependent):
   Working set 16KB,  stride 1:  20000 MB/s
   Working set 16KB,  stride 32:  5000 MB/s
   Working set 256MB, stride 1:  12000 MB/s   (sequential DRAM: prefetcher helps)
   Working set 256MB, stride 32:   500 MB/s   (random DRAM: no prefetch) */
```
Tracing `measure_throughput_MBs(16*1024, 1)`: n=4096 ints. stride=1. Warm-up: access all 4096 elements sequentially. All fit in L1 (16KB < 32KB L1). Measurement loop: 10 reps * 4096 reads = 40960 reads * 4 bytes = 163840 bytes. If elapsed = 0.000008s: 163840 / 0.000008 / 1048576 = ~19531 MB/s. This output proves that when data fits entirely in the L1 cache, read throughput approaches the theoretical L1 bandwidth limit (~20-50 GB/s on modern CPUs).

### Discard the throwaway
This throwaway demonstration code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: None — this is a from-scratch addition because we are building standalone analysis tools for the memory mountain.
- **Files affected**: `mountain.c` (created)
- **Change type**: Add
- **Location**: N/A
- **Dependencies**: None.

### The New Code
```c
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

double measure_throughput_MBs(size_t working_set_bytes, int stride) {
    size_t n = working_set_bytes / sizeof(int);
    int *data = malloc(working_set_bytes);
    for (size_t i = 0; i < n; i++) data[i] = (int)i;

    volatile long sink = 0;
    for (size_t i = 0; i < n; i += stride) sink += data[i];

    struct timespec t0, t1;
    int reps = 10;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    for (int r = 0; r < reps; r++)
        for (size_t i = 0; i < n; i += stride) sink += data[i];
    clock_gettime(CLOCK_MONOTONIC, &t1);
    (void)sink;

    double elapsed_s = (t1.tv_sec - t0.tv_sec)
                     + (t1.tv_nsec - t0.tv_nsec) / 1e9;
    double bytes_read = (double)(n / stride) * sizeof(int) * reps;
    free(data);
    return (bytes_read / elapsed_s) / (1024.0 * 1024.0);
}
```

### The Updated Project
```c
1: #include <stdio.h>
2: #include <time.h>
3: #include <stdlib.h>
4: 
5: double measure_throughput_MBs(size_t working_set_bytes, int stride) { // ← new
6:     size_t n = working_set_bytes / sizeof(int); // ← new
7:     int *data = malloc(working_set_bytes); // ← new
8:     for (size_t i = 0; i < n; i++) data[i] = (int)i; // ← new
9: 
10:     volatile long sink = 0; // ← new
11:     for (size_t i = 0; i < n; i += stride) sink += data[i]; // ← new
12: 
13:     struct timespec t0, t1; // ← new
14:     int reps = 10; // ← new
15:     clock_gettime(CLOCK_MONOTONIC, &t0); // ← new
16:     for (int r = 0; r < reps; r++) // ← new
17:         for (size_t i = 0; i < n; i += stride) sink += data[i]; // ← new
18:     clock_gettime(CLOCK_MONOTONIC, &t1); // ← new
19:     (void)sink; // ← new
20: 
21:     double elapsed_s = (t1.tv_sec - t0.tv_sec) // ← new
22:                      + (t1.tv_nsec - t0.tv_nsec) / 1e9; // ← new
23:     double bytes_read = (double)(n / stride) * sizeof(int) * reps; // ← new
24:     free(data); // ← new
25:     return (bytes_read / elapsed_s) / (1024.0 * 1024.0); // ← new
26: } // ← new
```
We now have a core function capable of measuring the memory bandwidth of a single specific access pattern.

### Mechanical walkthrough
- `double measure_throughput_MBs(size_t working_set_bytes, int stride)` — Declares a function taking a byte size and integer stride, returning a double.
- `size_t n = working_set_bytes / sizeof(int);` — Computes the number of `int` elements in the working set.
- `int *data = malloc(working_set_bytes);` — Allocates the actual contiguous memory array on the heap.
- `for (size_t i = 0; i < n; i++) data[i] = (int)i;` — Initializes the array to prevent page faults during measurement.
- `volatile long sink = 0;` — Declares a `volatile` variable to force the compiler to actually emit load instructions in the loops below. If we didn't use `volatile`, the compiler's optimizer would realize `sink` is never meaningfully read and might delete our entire loop.
- `for (size_t i = 0; i < n; i += stride) sink += data[i];` — Performs a warm-up pass. It traverses the array by `stride` increments, summing the elements into `sink`. This forces the cache to populate with the required data if it fits.
- `struct timespec t0, t1;` — Declares variables to hold timestamps.
- `int reps = 10;` — Sets how many times we will read the buffer to get a stable time measurement.
- `clock_gettime(CLOCK_MONOTONIC, &t0);` — Captures the start time.
- `for (int r = 0; r < reps; r++)` — The outer loop repeats the measurement pass multiple times.
- `for (size_t i = 0; i < n; i += stride) sink += data[i];` — The inner loop, performing the actual reads we are timing.
- `clock_gettime(CLOCK_MONOTONIC, &t1);` — Captures the end time.
- `(void)sink;` — Casts `sink` to `void` to silence any "variable set but not used" compiler warnings.
- `double elapsed_s = (t1.tv_sec - t0.tv_sec) + (t1.tv_nsec - t0.tv_nsec) / 1e9;` — Calculates the exact time elapsed in seconds.
- `double bytes_read = (double)(n / stride) * sizeof(int) * reps;` — Calculates the exact total number of bytes read across all repetitions.
- `free(data);` — Releases the allocated buffer.
- `return (bytes_read / elapsed_s) / (1024.0 * 1024.0);` — Divides bytes by seconds, then converts to MB/s and returns the result.

### CS lens
Throughput (bandwidth) is the fundamental CS concept here. Throughput is everywhere: network interfaces have throughput (Gigabit Ethernet), disks have throughput (NVMe MB/s), and even inter-process communication mechanisms (pipes, shared memory) are often evaluated by throughput.

### SE lens
Design principle: explicit measurement over theoretical calculation. We could calculate theoretical bandwidth by reading CPU specs, but that ignores caching behavior, operating system overhead, and compiler optimizations. By actually allocating, iterating, and timing a buffer, we establish ground truth.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Will compile cleanly, but since it lacks a `main` function, it is not an executable program yet.

### One sentence connecting to previous unit
Now that we have a metric (MB/s) and a tool to measure it, we can vary the working set and stride to map out the entire memory hierarchy.

## Concept Unit: The mountain shape — two dimensions of locality

### The Problem
A single measurement of MB/s tells us how fast one specific configuration runs. But how do we visualize the behavior of the *entire* memory subsystem under all possible conditions?

### Introduce the concept in isolation
```c
/* The memory mountain is a 2D grid: */
/* X axis: stride (1, 2, 4, 8, 16, 32, 64 elements) */
/* Y axis: working set size (1KB to 512MB) */
/* Z axis: read throughput (MB/s) */

/* Mountain features: */
/* - The ridges (high throughput): where working set fits in a cache level */
/*   Ridge 1: working set <= L1 size (~32KB): L1 bandwidth (~20-50 GB/s) */
/*   Ridge 2: working set <= L2 size (~256KB): L2 bandwidth (~10-20 GB/s) */
/*   Ridge 3: working set <= L3 size (~8MB): L3 bandwidth (~5-10 GB/s) */
/*   Valley: working set > L3 (DRAM): ~10-50 GB/s sequential, ~1 GB/s random */

/* - The slopes (how throughput degrades with stride): */
/*   Stride 1: prefetcher works: hardware detects sequential pattern, prefetches */
/*   Stride 2-4: still prefetchable: degraded but good */
/*   Stride 8+: random enough to defeat prefetcher: throughput collapses */

#include <stdio.h>

void print_mountain_concept(void) {
    const int strides[] = {1, 2, 4, 8, 16, 32};
    const char *sizes[] = {"16KB(L1)", "256KB(L2)", "8MB(L3)", "128MB(DRAM)"};
    /* Throughput matrix (MB/s, illustrative values): */
    int tput[4][6] = {
        {20000, 18000, 15000, 10000,  5000,  2000},  /* L1 */
        {12000, 10000,  8000,  5000,  2500,  1000},  /* L2 */
        { 6000,  5000,  4000,  2500,  1200,   500},  /* L3 */
        {10000,  8000,  4000,   800,   300,   100},  /* DRAM */
    };
    printf("%-12s", "Size/Stride");
    for (int s = 0; s < 6; s++) printf("%8d", strides[s]);
    printf("\n");
    for (int sz = 0; sz < 4; sz++) {
        printf("%-12s", sizes[sz]);
        for (int st = 0; st < 6; st++) printf("%8d", tput[sz][st]);
        printf("\n");
    }
}

int main(void) { print_mountain_concept(); return 0; }
```
Tracing the DRAM row, stride=1: Output is 10000 MB/s. It is high because the hardware prefetcher detects the sequential pattern and issues requests to DRAM before the CPU explicitly needs the data. Stride=32: Output is 100 MB/s. Each access is 128 bytes apart (stride of 32 ints). The prefetcher cannot confidently predict this pattern or gives up. Every access incurs full 60ns DRAM latency.

### Discard the throwaway
This throwaway code is discarded and will not be in the project.

### Project Change
- **Reference Source**: None.
- **Files affected**: None for this conceptual unit.
- **Change type**: N/A
- **Location**: N/A
- **Dependencies**: None.

### The New Code
```c
/* No project code change in this conceptual unit. We are just analyzing the shape of the data. */
```

### The Updated Project
```c
// No changes made.
```

### Mechanical walkthrough
- N/A - no code added in this unit. The throwaway code explained the conceptual matrix mapping working set and stride to throughput.

### CS lens
Multi-dimensional analysis. Performance is rarely a single number; it's a surface governed by multiple parameters. We see this in databases (query performance vs table size vs index density) and networks (throughput vs payload size vs concurrency).

### SE lens
Visualization for insight. A matrix of raw numbers is hard to read. Plotting these dimensions as a 3D "mountain" allows engineers to instantly identify exactly where the steep drops (cache boundaries) and gentle slopes (prefetcher limits) occur.

### Commands needed
None.

### Run it
N/A

### One sentence connecting to previous unit
Now that we know the "memory mountain" is a grid, we can write a function to sweep across one of those dimensions to find the exact boundaries of the caches.

## Concept Unit: Identifying cache boundaries from the mountain

### The Problem
CPU manufacturers list cache sizes in spec sheets, but how can software actually detect the size of L1, L2, and L3 caches dynamically?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/* A simple mountain-reader: vary working set, fixed stride */
void measure_ridge(int stride) {
    size_t sizes[] = {
        4096,         /* 4KB */
        16384,        /* 16KB */
        65536,        /* 64KB */
        262144,       /* 256KB */
        1048576,      /* 1MB */
        4194304,      /* 4MB */
        16777216,     /* 16MB */
        67108864,     /* 64MB */
    };
    const char *labels[] = {"4KB","16KB","64KB","256KB","1MB","4MB","16MB","64MB"};

    printf("Stride=%d ints:\n", stride);
    for (int s = 0; s < 8; s++) {
        size_t n = sizes[s] / sizeof(int);
        int *data = malloc(sizes[s]);
        for (size_t i = 0; i < n; i++) data[i] = (int)i;

        volatile long sink = 0;
        /* Warm up */
        for (size_t i = 0; i < n; i += stride) sink += data[i];

        struct timespec t0, t1;
        clock_gettime(CLOCK_MONOTONIC, &t0);
        for (int r = 0; r < 20; r++)
            for (size_t i = 0; i < n; i += stride) sink += data[i];
        clock_gettime(CLOCK_MONOTONIC, &t1);

        double elapsed = (t1.tv_sec-t0.tv_sec) + (t1.tv_nsec-t0.tv_nsec)/1e9;
        double bytes = (double)(n/stride) * 4 * 20;
        printf("  %-8s %.0f MB/s\n", labels[s], bytes/elapsed/1048576);
        free(data);
    }
}

int main(void) {
    measure_ridge(1);  /* sequential -- prefetcher helps */
    return 0;
}
```
Tracing: at 4KB and 16KB working sets, all data fits in L1 (typically 32KB). CPU reads from L1 at full speed (~20GB/s). At 64KB and 256KB, the data exceeds L1 but fits in L2 (typically 256KB). Throughput drops to L2 bandwidth (~10GB/s). At 1MB and 4MB, it fits in L3 (~8MB). At 16MB and 64MB, it exceeds L3 and falls to DRAM bandwidth. With stride=1, sequential accesses activate the prefetcher, giving ~10GB/s streaming DRAM bandwidth.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
- **Reference Source**: None.
- **Files affected**: `mountain.c` (modified)
- **Change type**: Add
- **Location**: Bottom of the file
- **Dependencies**: `measure_throughput_MBs` from earlier unit.

### The New Code
```c
void scan_ridge(int stride) {
    size_t sizes[] = { 4096, 16384, 65536, 262144, 1048576, 4194304, 16777216, 67108864 };
    const char *labels[] = {"4KB","16KB","64KB","256KB","1MB","4MB","16MB","64MB"};
    
    printf("Scanning stride %d:\n", stride);
    for (int i = 0; i < 8; i++) {
        double throughput = measure_throughput_MBs(sizes[i], stride);
        printf("  %-8s: %.0f MB/s\n", labels[i], throughput);
    }
}
```

### The Updated Project
```c
27: void scan_ridge(int stride) { // ← new
28:     size_t sizes[] = { 4096, 16384, 65536, 262144, 1048576, 4194304, 16777216, 67108864 }; // ← new
29:     const char *labels[] = {"4KB","16KB","64KB","256KB","1MB","4MB","16MB","64MB"}; // ← new
30:     
31:     printf("Scanning stride %d:\n", stride); // ← new
32:     for (int i = 0; i < 8; i++) { // ← new
33:         double throughput = measure_throughput_MBs(sizes[i], stride); // ← new
34:         printf("  %-8s: %.0f MB/s\n", labels[i], throughput); // ← new
35:     } // ← new
36: } // ← new
```
We added a scanning function that drives our throughput measurement tool over an exponentially increasing sequence of working set sizes to locate cache boundaries.

### Mechanical walkthrough
- `void scan_ridge(int stride)` — Declares a function returning `void` that accepts a `stride` integer.
- `size_t sizes[] = { ... };` — Initializes an array of size `size_t` with an exponentially increasing series of bytes representing typical cache boundary points.
- `const char *labels[] = { ... };` — Initializes an array of string literals corresponding to the sizes for clean printing.
- `printf("Scanning stride %d:\n", stride);` — Prints the header showing the constant stride for this run.
- `for (int i = 0; i < 8; i++)` — Loops over our 8 sizes.
- `double throughput = measure_throughput_MBs(sizes[i], stride);` — Calls our previously defined measurement function with the current working set size and the requested stride.
- `printf("  %-8s: %.0f MB/s\n", labels[i], throughput);` — Prints the human-readable label and the measured throughput, formatted with no decimal places.

### CS lens
Boundary detection through empirical probing. We don't read a configuration file; we measure a continuous variable (throughput) and locate the step functions (sharp drops). This same concept is used in networking to find the Maximum Transmission Unit (MTU) by sending larger and larger packets until fragmentation occurs.

### SE lens
Data-driven configuration. Hardcoding `L1_CACHE_SIZE = 32768` fails when the software runs on a different CPU. Writing empirical probes lets software self-tune to the hardware it finds itself on.

### Commands needed
None.

### Run it
Predicted confidently: Will compile and provide the utility function to print out a cross-section (a "ridge") of the memory mountain.

### One sentence connecting to previous unit
We've seen the hardware prefetcher maintain high DRAM bandwidth for stride 1, but what happens when access patterns are completely unpredictable?

## Concept Unit: The hardware prefetcher — hiding latency automatically

### The Problem
Sequential access is fast. But if we traverse data randomly using a linked list or an array of indices, we see massive performance degradation. Why does the CPU seem so slow in these scenarios?

### Introduce the concept in isolation
```c
/* Hardware prefetcher: CPU detects access patterns and issues */
/* memory reads before the data is needed */

/* Patterns the prefetcher CAN detect: */
/* - Stride-1 (sequential): arr[0], arr[1], arr[2]... */
/* - Constant stride: arr[0], arr[8], arr[16]... (stride 8) */
/* - Some prefetchers: up to 2 simultaneous streams with constant strides */

/* Patterns that DEFEAT the prefetcher: */
/* - Pointer chasing: p = p->next (address depends on loaded value) */
/* - Irregular strides: random-looking jumps */
/* - Very large strides: prefetcher gives up */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/* Pointer chasing: worst case for prefetcher */
void measure_pointer_chase(size_t n) {
    /* Build a linked list with random permutation */
    int *arr = malloc(n * sizeof(int));
    /* Simple shuffle */
    for (size_t i = 0; i < n; i++) arr[i] = (int)((i + 1) % n);
    /* Now shuffle to make it random: */
    for (size_t i = n-1; i > 0; i--) {
        size_t j = (size_t)rand() % (i+1);
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    volatile int idx = 0;
    struct timespec t0, t1;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    for (size_t i = 0; i < n; i++) idx = arr[idx];  /* each access depends on previous */
    clock_gettime(CLOCK_MONOTONIC, &t1);
    double elapsed = (t1.tv_sec-t0.tv_sec) + (t1.tv_nsec-t0.tv_nsec)/1e9;
    double ns_per_access = elapsed * 1e9 / n;
    printf("Pointer chase %zuMB: %.1f ns/access\n",
           n*4/1024/1024, ns_per_access);
    /* If > 60ns: DRAM latency (prefetcher defeated) */
    free(arr);
}

int main(void) {
    measure_pointer_chase(1024*1024*4);   /* 16MB: likely L3 */
    measure_pointer_chase(1024*1024*64);  /* 256MB: DRAM */
    return 0;
}
```
Tracing: pointer chasing with `idx = arr[idx]`. The next access address depends on the loaded value. The hardware prefetcher cannot predict the next address because it doesn't know it until the current load completes. This forms a serial dependency chain. A 256MB working set far exceeds the cache. Every single access goes to DRAM, exposing the full ~60-70ns DRAM latency instead of the ~5-10ns effective latency seen when the prefetcher successfully hides it.

### Discard the throwaway
This throwaway pointer chasing code is discarded.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: N/A
- **Location**: N/A
- **Dependencies**: None.

### The New Code
```c
/* No project code change in this conceptual unit. We are just analyzing the prefetcher limits. */
```

### The Updated Project
```c
// No changes made.
```

### Mechanical walkthrough
- N/A - no code added in this unit. The throwaway code explained hardware prefetcher defeat via pointer chasing.

### CS lens
Dependency chains. A data dependency occurs when instruction B requires the result of instruction A. `idx = arr[idx]` forces the CPU to wait. In contrast, `idx += stride` is purely computational and can be resolved instantly, allowing the CPU to queue up memory requests far in advance.

### SE lens
Data structures matter for performance, not just complexity. A linked list and an array might both offer O(N) traversal, but the array is vastly faster in reality because it aligns perfectly with the hardware prefetcher, while the linked list causes constant cache misses.

### Commands needed
None.

### Run it
N/A

### One sentence connecting to previous unit
Understanding how access patterns interact with the hardware allows us to use the memory mountain to diagnose and fix performance problems in real code.

## Concept Unit: Using the mountain to diagnose code

### The Problem
How can a programmer use their knowledge of the memory mountain to debug code that is running slower than expected?

### Introduce the concept in isolation
```c
/* Reading the mountain to diagnose a real program: */

/* Diagnosis 1: flat throughput across all working set sizes */
/* -> Code is compute-bound, not memory-bound */
/* -> Optimization: look at instruction-level bottlenecks */

/* Diagnosis 2: throughput collapses at exactly 32KB working set */
/* -> L1 cache is 32KB; code thrashes L1 */
/* -> Fix: reduce working set size (blocking) or improve reuse */

/* Diagnosis 3: large-stride access with large working set */
/* -> Low point on mountain: random DRAM access */
/* -> Fix: restructure data layout (SoA, sorting, spatial locality) */

/* Diagnosis 4: throughput is LOWER than DRAM bandwidth */
/* -> Possible false sharing (cache line ping-pong between cores) */
/* -> Fix: pad shared data to 64-byte (cache line) boundaries */

#include <stdio.h>

typedef struct {
    long count;                    /* 8 bytes */
    char padding[56];              /* pad to 64 bytes (one cache line) */
} AlignedCounter;

void false_sharing_fix_demo(void) {
    /* Naive: two counters in same cache line */
    long counters[2] = {0, 0};
    /* If thread 0 writes counters[0] and thread 1 writes counters[1]: */
    /* Both in same 64-byte cache line: cache line bounces between cores */

    /* Fix: pad to separate cache lines */
    AlignedCounter ac[2] = {{0,{0}}, {0,{0}}};
    /* ac[0] and ac[1] are 64 bytes apart: different cache lines */
    /* Threads can now write independently: no ping-pong */
    printf("sizeof(AlignedCounter) = %zu (should be 64)\n", sizeof(AlignedCounter));
    (void)counters; (void)ac;
}

int main(void) { false_sharing_fix_demo(); return 0; }
```
Tracing `AlignedCounter`: `long count` takes 8 bytes. `char padding[56]` takes 56 bytes. Total = 64 bytes, which is exactly one standard cache line. If thread 0 writes `ac[0].count` (modifying cache line X) and thread 1 writes `ac[1].count` (modifying cache line X+1), they don't interfere. Without padding, modifying `counters[0]` invalidates the entire 64-byte cache line for thread 1, forcing a massive slowdown (false sharing) as the cache line shuttles between cores.

### Discard the throwaway
This throwaway demonstration of cache-line padding is discarded.

### Project Change
- **Reference Source**: None.
- **Files affected**: `mountain.c` (modified)
- **Change type**: Add
- **Location**: Bottom of the file
- **Dependencies**: `scan_ridge`

### The New Code
```c
int main(void) {
    printf("Evaluating memory mountain cross-sections:\n\n");
    scan_ridge(1);   /* Sequential, prefetcher friendly */
    printf("\n");
    scan_ridge(32);  /* Stride 32 ints = 128 bytes apart, defeats prefetcher */
    return 0;
}
```

### The Updated Project
```c
37: int main(void) { // ← new
38:     printf("Evaluating memory mountain cross-sections:\n\n"); // ← new
39:     scan_ridge(1);   /* Sequential, prefetcher friendly */ // ← new
40:     printf("\n"); // ← new
41:     scan_ridge(32);  /* Stride 32 ints = 128 bytes apart, defeats prefetcher */ // ← new
42:     return 0; // ← new
43: } // ← new
```
We now have a complete program that uses our mountain-reading functions to output two dramatic ridges of the mountain: the fast sequential ridge, and the slow high-stride ridge.

### Mechanical walkthrough
- `int main(void)` — Standard entry point.
- `printf("Evaluating memory mountain cross-sections:\n\n");` — Prints a header.
- `scan_ridge(1);` — Calls our scan function with a stride of 1 (contiguous access).
- `printf("\n");` — Visual spacing.
- `scan_ridge(32);` — Calls our scan function with a stride of 32 (128 bytes per hop, skipping several cache lines every iteration).
- `return 0;` — Exits successfully.

### CS lens
Performance characterization. We synthesize multiple complex system behaviors—cache levels, prefetcher heuristics, memory latencies—into a single executable diagnostic that prints out a map of our system's performance boundaries.

### SE lens
Tool building. Instead of guessing why an application is slow, engineers build simple probes like this to determine the exact properties of the environment they are running in. It transforms "it feels slow" into "we are hitting the L3 boundary."

### Commands needed
`gcc -O3 mountain.c -o mountain`
`./mountain`

### Run it
Predicted confidently: Will compile and output two blocks of throughput numbers. The stride 1 block will show high MB/s tapering off gently as working sets grow. The stride 32 block will show a massive drop-off as soon as the working set exceeds the CPU's cache sizes, plummeting to very low MB/s when it hits DRAM.

### One sentence connecting to previous unit
With the ability to probe our system's memory constraints, we can confidently rewrite slow code to respect those constraints.

## Closing
### Connect the pieces
The memory mountain maps the entire cache hierarchy as a surface of throughput vs. working-set-size vs. stride. Every program's hot loop has a specific point on that surface that determines its performance ceiling. If you trace a read throughput measurement across working set sizes, you see the transitions: high throughput when contained entirely in L1, a step down as data spills into L2, another step down at the L3 boundary, and a final collapse to base bandwidth when forced to hit DRAM. By understanding these transitions, you can deliberately shrink working sets or change stride patterns to keep your program running on the high ridges of the mountain. Module 3 begins with Lesson 19.
