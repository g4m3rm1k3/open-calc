# Lesson 13: Storage Technologies — DRAM, SRAM, Disk, SSD, and the Memory Hierarchy

What you will build: The reader will understand why computers have a memory hierarchy, what SRAM/DRAM/SSD/HDD are and how they differ in speed, cost, and volatility, and what cache lines, sets, and ways are. The transferable insight: the memory hierarchy exists because fast storage is expensive and slow storage is cheap. Every program's performance is determined by how often it hits the fast levels vs. the slow ones. Understanding the hierarchy is the prerequisite for every cache optimization technique.

What you need to know first: Lessons 00-12.

Terms used in this lesson:
- **CPU register** — A small, extremely fast storage location directly inside the CPU used to hold temporary data during computation. It exists because the CPU needs immediate access to data without waiting for external memory.
- **L1 cache** — The fastest layer of cache memory, usually built into each CPU core. It exists to hold the most frequently used data and instructions to avoid stalling the CPU.
- **L2 cache** — The second layer of cache memory, slightly slower and larger than L1. It serves as a backup when data is not found in L1.
- **L3 cache** — The third layer of cache memory, usually shared among all CPU cores. It provides a larger, albeit slower, pool of fast memory before resorting to main memory.
- **DRAM (Dynamic RAM)** — The technology used for main memory (RAM). It is cheaper and denser than SRAM but requires periodic refreshing to maintain data.
- **SRAM (Static RAM)** — The technology used for cache memory. It is fast and requires no refreshing but is complex and expensive.
- **SSD (Solid State Drive)** — Non-volatile storage that uses NAND flash memory. It provides fast read and write speeds without any moving parts.
- **HDD (Hard Disk Drive)** — Non-volatile storage that uses spinning magnetic platters. It is very cheap for large capacities but mechanically slow.
- **Cache line** — The smallest unit of data transferred between main memory and cache, typically 64 bytes. It exists to exploit spatial locality by fetching neighboring data together.
- **Set** — A grouping of cache lines in a cache architecture used to organize where a specific memory block can be stored.
- **Way** — Refers to the associativity of a cache (e.g., n-way set associative), indicating how many different cache lines within a set a memory block can be placed into.
- **Temporal locality** — The principle that recently accessed data is likely to be accessed again in the near future.
- **Spatial locality** — The principle that data stored near recently accessed data is likely to be accessed soon.

Objects and methods used:
- **`measure_access_ms`**
  - *What it is:* A custom C function to measure memory access time.
  - *Implementation:* `double measure_access_ms(size_t bytes)`
  - *Its use:* Used in this lesson to prove the latency differences across the memory hierarchy.
  - *Type:* A freestanding C function.
  - *Responsibility:* Allocates memory, performs accesses with a specific stride to defeat the prefetcher, measures the elapsed time, frees the memory, and returns the time in milliseconds.
  - *Depends on:* Standard library functions `malloc`, `free`, `clock_gettime`.
  - *Connects to:* Called by `main` to print timings; calls OS time functions.
  - *Shape:* Internal implementation detail for the throwaway lab.
- **`clock_gettime`**
  - *What it is:* A POSIX standard library function to retrieve the current time.
  - *Implementation:* `int clock_gettime(clockid_t clock_id, struct timespec *tp);`
  - *Its use:* Used to get precise nanosecond-resolution timing for measuring memory access speeds.
  - *Type:* Standard library function.
  - *Responsibility:* Reads the system clock specified by `clock_id` and stores the time in the provided `timespec` struct.
  - *Depends on:* OS support for high-resolution timers.
  - *Connects to:* Called by user code; interacts with kernel timekeeping.
  - *Shape:* A public API boundary between user code and the operating system.
- **`CLOCK_MONOTONIC`**
  - *What it is:* A clock identifier for `clock_gettime`.
  - *Implementation:* A macro expanding to an integer constant.
  - *Its use:* Ensures that the measured time interval is not affected by system clock adjustments (like NTP syncs).
  - *Type:* Macro constant.
  - *Responsibility:* Identifies a non-settable clock that represents monotonic time since some unspecified starting point.
  - *Depends on:* Nothing.
  - *Connects to:* Passed as an argument to `clock_gettime`.
  - *Shape:* A configuration parameter for system time APIs.
- **`malloc`**
  - *What it is:* Standard library function for dynamic memory allocation.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* Allocates an array of a specific size to test memory access times at different hierarchy levels.
  - *Type:* Standard library function.
  - *Responsibility:* Allocates `size` bytes of uninitialized memory and returns a pointer to it.
  - *Depends on:* The heap manager and OS memory provisioning.
  - *Connects to:* Called by user code; managed by the C runtime.
  - *Shape:* Public API for dynamic memory.
- **`free`**
  - *What it is:* Standard library function to deallocate memory.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* Releases the memory allocated by `malloc` to prevent memory leaks.
  - *Type:* Standard library function.
  - *Responsibility:* Returns the memory pointed to by `ptr` to the heap for future allocations.
  - *Depends on:* A valid pointer previously returned by `malloc`, `calloc`, or `realloc`.
  - *Connects to:* Called by user code; managed by the C runtime.
  - *Shape:* Public API for memory management.
- **`print_hierarchy`**
  - *What it is:* A custom C function to display the memory hierarchy.
  - *Implementation:* `void print_hierarchy(void)`
  - *Its use:* Used to output a table comparing sizes, latencies, and bandwidths.
  - *Type:* A freestanding C function.
  - *Responsibility:* Prints hardcoded facts about the memory hierarchy to standard output.
  - *Depends on:* `printf`.
  - *Connects to:* Called by `main`.
  - *Shape:* Internal helper function.
- **`cache_line_demo`**
  - *What it is:* A custom C function to demonstrate cache line behavior.
  - *Implementation:* `void cache_line_demo(void)`
  - *Its use:* Used to show how memory is loaded in 64-byte chunks.
  - *Type:* A freestanding C function.
  - *Responsibility:* Initializes a small array and prints information about cache line sizes and access patterns.
  - *Depends on:* `printf`.
  - *Connects to:* Called by `main`.
  - *Shape:* Internal helper function.
- **`show_io_latency`**
  - *What it is:* A custom C function to compare HDD and SSD speeds.
  - *Implementation:* `void show_io_latency(void)`
  - *Its use:* Used to output theoretical I/O latencies for different persistent storage media.
  - *Type:* A freestanding C function.
  - *Responsibility:* Prints sequential and random I/O speeds for HDD, SSD, and NVMe.
  - *Depends on:* `printf`.
  - *Connects to:* Called by `main`.
  - *Shape:* Internal helper function.
- **`good_locality`**
  - *What it is:* A custom C function demonstrating high spatial locality.
  - *Implementation:* `void good_locality(int *arr, int n)`
  - *Its use:* Used to show fast sequential memory access.
  - *Type:* A freestanding C function.
  - *Responsibility:* Iterates over an array sequentially, accumulating a sum, and prints it.
  - *Depends on:* A valid array pointer and size.
  - *Connects to:* Called by `main`.
  - *Shape:* Internal helper function.
- **`poor_locality`**
  - *What it is:* A custom C function demonstrating low spatial locality.
  - *Implementation:* `void poor_locality(int *arr, int n)`
  - *Its use:* Used to show the performance penalty of stride-based memory access.
  - *Type:* A freestanding C function.
  - *Responsibility:* Iterates over an array with a large stride, accumulating a sum, and prints it.
  - *Depends on:* A valid array pointer and size.
  - *Connects to:* Called by `main`.
  - *Shape:* Internal helper function.

## Concept Unit: The memory hierarchy — speed vs. cost tradeoff

### The Problem
If the CPU runs at 3GHz, it expects to process an instruction every 0.33 nanoseconds. However, large memory (like a 16GB RAM stick) takes around 60 to 100 nanoseconds to fetch data. How can we keep the CPU from stalling for hundreds of cycles waiting for every piece of data? What would happen if we just built the entire 16GB out of the fastest possible memory? Why isn't every computer built that way?

### Introduce the concept in isolation
We will write a C program to measure the access times of different data sizes, effectively probing the **L1 cache**, **L2 cache**, **L3 cache**, and **DRAM**.

```c
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

/* Measure access time for different data sizes */
double measure_access_ms(size_t bytes) {
    size_t n = bytes / sizeof(long);
    long *arr = malloc(bytes);
    for (size_t i = 0; i < n; i++) arr[i] = (long)i;

    struct timespec t0, t1;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    long sum = 0;
    /* Access pattern that defeats prefetcher: stride > cache line */
    for (int rep = 0; rep < 10; rep++)
        for (size_t i = 0; i < n; i += 64)  /* stride 64 longs = 512 bytes */
            sum += arr[i];
    clock_gettime(CLOCK_MONOTONIC, &t1);
    free(arr);
    double ms = (t1.tv_sec-t0.tv_sec)*1000.0 + (t1.tv_nsec-t0.tv_nsec)/1e6;
    return ms;
}

int main(void) {
    printf("32KB  (L1):   %.1f ms\n", measure_access_ms(32*1024));
    printf("256KB (L2):   %.1f ms\n", measure_access_ms(256*1024));
    printf("8MB   (L3):   %.1f ms\n", measure_access_ms(8*1024*1024));
    printf("128MB (DRAM): %.1f ms\n", measure_access_ms(128*1024*1024));
    return 0;
}
```

This output proves that access times scale non-linearly with size. A 32KB working set fits entirely in the L1 cache, allowing access in ~1 cycle (0.3ns). A 128MB working set spills out of the L3 cache into DRAM, causing each access to take ~100 cycles (33ns). With a 64-long stride, we intentionally access every 512th byte, minimizing spatial locality so that the access time directly reveals which cache level we are hitting.

### Discard the throwaway
This code is discarded. It is a standalone proof of the memory hierarchy latency curve and is not added to our main project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition to build intuition.
- **Files affected**: `src/hierarchy.c` (created)
- **Change type**: Add
- **Location**: N/A
- **Dependencies**: The standard C library.

### The New Code
```c
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

double measure_access_ms(size_t bytes) {
    size_t n = bytes / sizeof(long);
    long *arr = malloc(bytes);
    for (size_t i = 0; i < n; i++) arr[i] = (long)i;

    struct timespec t0, t1;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    long sum = 0;
    for (int rep = 0; rep < 10; rep++)
        for (size_t i = 0; i < n; i += 64)
            sum += arr[i];
    clock_gettime(CLOCK_MONOTONIC, &t1);
    free(arr);
    return (t1.tv_sec - t0.tv_sec) * 1000.0 + (t1.tv_nsec - t0.tv_nsec) / 1e6;
}

int main(void) {
    printf("32KB  (L1):   %.1f ms\n", measure_access_ms(32*1024));
    printf("256KB (L2):   %.1f ms\n", measure_access_ms(256*1024));
    printf("8MB   (L3):   %.1f ms\n", measure_access_ms(8*1024*1024));
    printf("128MB (DRAM): %.1f ms\n", measure_access_ms(128*1024*1024));
    return 0;
}
```

### The Updated Project
```c
1: #include <stdio.h>
2: #include <time.h>
3: #include <stdlib.h>
4: 
5: double measure_access_ms(size_t bytes) { // ← new
6:     size_t n = bytes / sizeof(long);
7:     long *arr = malloc(bytes);
8:     for (size_t i = 0; i < n; i++) arr[i] = (long)i;
9: 
10:    struct timespec t0, t1;
11:    clock_gettime(CLOCK_MONOTONIC, &t0);
12:    long sum = 0;
13:    for (int rep = 0; rep < 10; rep++)
14:        for (size_t i = 0; i < n; i += 64)
15:            sum += arr[i];
16:    clock_gettime(CLOCK_MONOTONIC, &t1);
17:    free(arr);
18:    return (t1.tv_sec - t0.tv_sec) * 1000.0 + (t1.tv_nsec - t0.tv_nsec) / 1e6;
19:}
20:
21:int main(void) { // ← new
22:    printf("32KB  (L1):   %.1f ms\n", measure_access_ms(32*1024));
23:    printf("256KB (L2):   %.1f ms\n", measure_access_ms(256*1024));
24:    printf("8MB   (L3):   %.1f ms\n", measure_access_ms(8*1024*1024));
25:    printf("128MB (DRAM): %.1f ms\n", measure_access_ms(128*1024*1024));
26:    return 0;
27:}
```
We have established our initial file that outputs the timing for various data sizes.

### Mechanical walkthrough
- `double measure_access_ms(size_t bytes)`: Declares a function that takes the number of bytes as input and returns a double-precision floating-point number representing milliseconds.
- `size_t n = bytes / sizeof(long);`: Divides the total byte count by the size of a `long` integer to find out how many elements will fit into the array.
- `long *arr = malloc(bytes);`: Calls `malloc` to dynamically allocate `bytes` amount of memory, storing the pointer in `arr`.
- `for (size_t i = 0; i < n; i++) arr[i] = (long)i;`: Iterates over the entire array, initializing each element to its index.
- `struct timespec t0, t1;`: Declares two structures of type `timespec` to hold our start and end timestamps.
- `clock_gettime(CLOCK_MONOTONIC, &t0);`: Records the current monotonic time into `t0`.
- `long sum = 0;`: Initializes an accumulator.
- `for (int rep = 0; rep < 10; rep++)`: Loops the measurement 10 times to get a noticeable duration and average out noise.
- `for (size_t i = 0; i < n; i += 64)`: Loops through the array with a stride of 64 `long`s (512 bytes), which forces a cache miss at each step because it exceeds a typical 64-byte cache line.
- `sum += arr[i];`: Reads the value and adds it to `sum`.
- `clock_gettime(CLOCK_MONOTONIC, &t1);`: Records the time immediately after the loops finish into `t1`.
- `free(arr);`: Releases the dynamically allocated memory back to the heap to prevent memory leaks.
- `return (t1.tv_sec - t0.tv_sec) * 1000.0 + (t1.tv_nsec - t0.tv_nsec) / 1e6;`: Calculates the difference in seconds (converted to ms) and nanoseconds (converted to ms) and returns the total time.
- `int main(void) {`: The entry point of the program.
- `printf(...)`: Prints formatted strings with the results of `measure_access_ms` for 32KB, 256KB, 8MB, and 128MB, representing L1, L2, L3, and DRAM respectively.
- `return 0;`: Exits the program successfully.

### CS lens
This demonstrates the fundamental CS concept of the **Memory Hierarchy**. The memory hierarchy balances speed, cost, and size by layering small, fast, expensive memory (SRAM caches) on top of large, slower, cheaper memory (DRAM). Real-world manifestations include: web browsers storing assets locally rather than fetching them over the network; content delivery networks (CDNs) caching popular videos near users; and databases keeping "hot" rows in RAM while cold rows stay on disk.

### SE lens
**Optimization through empirical measurement.** Rather than guessing where a bottleneck lies, system engineers measure latency across varying problem sizes. By artificially crippling the prefetcher (using a 512-byte stride), we guarantee that hardware optimizations don't hide the raw latency characteristics of the underlying cache layers. The alternative not chosen would be to test with contiguous reads, which the hardware would perfectly prefetch, masking the latency cliff entirely.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
32KB  (L1):   1.1 ms
256KB (L2):   3.4 ms
8MB   (L3):   15.2 ms
128MB (DRAM): 80.5 ms
```
The exact values depend on the specific CPU, but the ratios reliably display the orders-of-magnitude performance cliffs between cache levels.

### One sentence connecting to previous unit
Having observed that smaller data is accessed exponentially faster, we will now look at the physical hardware differences between the caches and the main memory that cause this.

## Concept Unit: SRAM vs. DRAM — how cache and main memory work

### The Problem
Why is L1 cache so fast, and why can't we just build 16GB of it? What physical limitation forces us to choose between speed and density in semiconductor memory? If the CPU has to wait 180 cycles for a DRAM fetch, what exactly is happening during those 180 cycles?

### Introduce the concept in isolation
We will print a static table of the memory hierarchy, comparing sizes, latencies, and underlying technologies.

```c
#include <stdio.h>

void print_hierarchy(void) {
    printf("Level     | Size   | Latency | Bandwidth\n");
    printf("----------+--------+---------+----------\n");
    printf("Registers | ~1KB   | 0 ns    | ~TB/s     (in CPU)\n");
    printf("L1 cache  | 32KB   | 1 ns    | 1 TB/s    (per core, SRAM)\n");
    printf("L2 cache  | 256KB  | 4 ns    | 400 GB/s  (per core, SRAM)\n");
    printf("L3 cache  | 8MB+   | 20 ns   | 200 GB/s  (shared, SRAM)\n");
    printf("DRAM      | 8-64GB | 60 ns   | 50 GB/s   (DRAM)\n");
    printf("NVMe SSD  | 1-4TB  | 100 us  | 7 GB/s    (NAND flash)\n");
    printf("HDD       | 1-10TB | 10 ms   | 200 MB/s  (magnetic)\n");
    printf("Network   | \u221e      | 100 ms  | 1 GB/s    (varies)\n");
}

int main(void) { print_hierarchy(); return 0; }
```

This output proves the massive disparity between **SRAM** and **DRAM**. DRAM latency is ~60ns. At 3GHz, the CPU cycle is 0.33ns. 60 / 0.33 = ~180 cycles. When an L1 cache miss occurs and must go to DRAM, the CPU stalls for 180 cycles. At an ideal 1 instruction per cycle, that single miss costs the equivalent of 180 operations. This is why a 10x improvement in cache hit rate yields profound speedups.

### Discard the throwaway
This code is discarded. It is a static representation for educational purposes and is not merged into our active codebase.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory unit.
- **Files affected**: `src/hierarchy.c` (modified)
- **Change type**: Replace
- **Location**: Replacing the entire contents.
- **Dependencies**: The standard C library.

### The New Code
```c
#include <stdio.h>

void print_hierarchy(void) {
    printf("Level     | Size   | Latency | Bandwidth\n");
    printf("----------+--------+---------+----------\n");
    printf("Registers | ~1KB   | 0 ns    | ~TB/s     (in CPU)\n");
    printf("L1 cache  | 32KB   | 1 ns    | 1 TB/s    (per core, SRAM)\n");
    printf("L2 cache  | 256KB  | 4 ns    | 400 GB/s  (per core, SRAM)\n");
    printf("L3 cache  | 8MB+   | 20 ns   | 200 GB/s  (shared, SRAM)\n");
    printf("DRAM      | 8-64GB | 60 ns   | 50 GB/s   (DRAM)\n");
    printf("NVMe SSD  | 1-4TB  | 100 us  | 7 GB/s    (NAND flash)\n");
    printf("HDD       | 1-10TB | 10 ms   | 200 MB/s  (magnetic)\n");
    printf("Network   | \u221e      | 100 ms  | 1 GB/s    (varies)\n");
}

int main(void) { print_hierarchy(); return 0; }
```

### The Updated Project
```c
1: #include <stdio.h>
2: 
3: void print_hierarchy(void) { // ← new
4:     printf("Level     | Size   | Latency | Bandwidth\n");
5:     printf("----------+--------+---------+----------\n");
6:     printf("Registers | ~1KB   | 0 ns    | ~TB/s     (in CPU)\n");
7:     printf("L1 cache  | 32KB   | 1 ns    | 1 TB/s    (per core, SRAM)\n");
8:     printf("L2 cache  | 256KB  | 4 ns    | 400 GB/s  (per core, SRAM)\n");
9:     printf("L3 cache  | 8MB+   | 20 ns   | 200 GB/s  (shared, SRAM)\n");
10:    printf("DRAM      | 8-64GB | 60 ns   | 50 GB/s   (DRAM)\n");
11:    printf("NVMe SSD  | 1-4TB  | 100 us  | 7 GB/s    (NAND flash)\n");
12:    printf("HDD       | 1-10TB | 10 ms   | 200 MB/s  (magnetic)\n");
13:    printf("Network   | \u221e      | 100 ms  | 1 GB/s    (varies)\n");
14:}
15:
16:int main(void) { // ← new
17:    print_hierarchy();
18:    return 0;
19:}
```
We have replaced our measurement tool with a static function that prints the hierarchy specifications to explicitly contrast SRAM and DRAM speeds.

### Mechanical walkthrough
- `void print_hierarchy(void)`: Defines a function that takes no arguments and returns nothing.
- `printf(...)`: Calls the standard `printf` function consecutively to output the table header and separator.
- `printf("Registers ...")`: Prints the specifications for CPU registers.
- `printf("L1 cache ...")`: Prints the specifications for L1 cache, highlighting SRAM technology and 1ns latency.
- `printf("L2 cache ...")`: Prints the specifications for L2 cache, highlighting SRAM technology and 4ns latency.
- `printf("L3 cache ...")`: Prints the specifications for L3 cache, highlighting SRAM technology and 20ns latency.
- `printf("DRAM ...")`: Prints the specifications for DRAM, noting its 60ns latency and high capacity.
- `printf("NVMe SSD ...")`: Prints the specifications for SSD storage.
- `printf("HDD ...")`: Prints the specifications for magnetic HDD storage.
- `printf("Network ...")`: Prints the specifications for the network layer, showing infinite capacity but extreme latency.
- `int main(void)`: The program entry point.
- `print_hierarchy();`: Calls the function to display the table.
- `return 0;`: Exits successfully.

### CS lens
This highlights the **hardware implementation tradeoffs**. **SRAM (Static RAM)** requires six transistors per bit, making it fast and persistent while powered, but extremely bulky and expensive (~$10,000/GB). **DRAM (Dynamic RAM)** uses a single transistor and a capacitor per bit. It is incredibly dense and cheap (~$5/GB), but the capacitor leaks charge and must be constantly refreshed, and reading it is comparatively slow.

### SE lens
**Design for the common case.** Computer architects chose not to build homogeneous memory systems. Instead, they built a tiny amount of expensive SRAM and a massive amount of cheap DRAM. The tradeoff is that the system only appears fast if the software's working set fits in the SRAM. As software engineers, our job is to structure our code so that the hardware's "fast path" is hit as often as possible.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Level     | Size   | Latency | Bandwidth
----------+--------+---------+----------
Registers | ~1KB   | 0 ns    | ~TB/s     (in CPU)
L1 cache  | 32KB   | 1 ns    | 1 TB/s    (per core, SRAM)
L2 cache  | 256KB  | 4 ns    | 400 GB/s  (per core, SRAM)
L3 cache  | 8MB+   | 20 ns   | 200 GB/s  (shared, SRAM)
DRAM      | 8-64GB | 60 ns   | 50 GB/s   (DRAM)
NVMe SSD  | 1-4TB  | 100 us  | 7 GB/s    (NAND flash)
HDD       | 1-10TB | 10 ms   | 200 MB/s  (magnetic)
Network   | ∞      | 100 ms  | 1 GB/s    (varies)
```
The table prints exactly as structured.

### One sentence connecting to previous unit
Now that we see the drastic 60x latency gap between L1 cache and DRAM, we need to understand exactly how the hardware moves data between them to bridge that gap.

## Concept Unit: Cache lines, sets, and ways — how a cache is organized

### The Problem
If the CPU needs a single 4-byte integer from DRAM, does it fetch exactly 4 bytes? Given that DRAM has high latency but decent bandwidth, would it make sense to fetch more data while we're already paying the 60ns penalty? How does the cache keep track of which memory addresses map to which cache slots?

### Introduce the concept in isolation
We will write a C function to demonstrate that memory is always loaded in fixed-size chunks called **cache lines**.

```c
#include <stdio.h>

void cache_line_demo(void) {
    int arr[32] = {0};  /* 128 bytes = 2 cache lines */

    /* Access arr[0]: loads cache line 0 (bytes 0-63 = arr[0..15]) */
    /* arr[1] through arr[15]: FREE (already in cache from the line load) */
    /* arr[16]: loads cache line 1 (bytes 64-127 = arr[16..31]) */

    printf("Cache line size: typically 64 bytes\n");
    printf("Ints per cache line: %zu\n", 64 / sizeof(int));
    printf("arr[0..15]: 1 cache line\n");
    printf("arr[16..31]: 2nd cache line\n");
    printf("False sharing: threads on same cache line cause cache-line ping-pong\n");
}

int main(void) { cache_line_demo(); return 0; }
```

This output proves that data operates in 64-byte chunks. `arr` is 32 integers, or 128 bytes, meaning it perfectly spans two cache lines. When the CPU reads `arr[0]`, it misses the cache and fetches an entire 64-byte block (elements 0 through 15) from DRAM. Accessing `arr[1]` is then a cache hit. We endure 2 misses for 32 accesses, meaning only 1 in 16 accesses incurs the DRAM latency penalty.

### Discard the throwaway
This code is discarded. It isolates the concept of cache lines but will not remain in our project files.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory unit.
- **Files affected**: `src/hierarchy.c` (modified)
- **Change type**: Replace
- **Location**: Replacing the entire contents.
- **Dependencies**: The standard C library.

### The New Code
```c
#include <stdio.h>

void cache_line_demo(void) {
    printf("Cache line size: typically 64 bytes\n");
    printf("Ints per cache line: %zu\n", 64 / sizeof(int));
    printf("arr[0..15]: 1 cache line\n");
    printf("arr[16..31]: 2nd cache line\n");
    printf("False sharing: threads on same cache line cause cache-line ping-pong\n");
}

int main(void) { cache_line_demo(); return 0; }
```

### The Updated Project
```c
1: #include <stdio.h>
2: 
3: void cache_line_demo(void) { // ← new
4:     printf("Cache line size: typically 64 bytes\n");
5:     printf("Ints per cache line: %zu\n", 64 / sizeof(int));
6:     printf("arr[0..15]: 1 cache line\n");
7:     printf("arr[16..31]: 2nd cache line\n");
8:     printf("False sharing: threads on same cache line cause cache-line ping-pong\n");
9: }
10:
11:int main(void) { // ← new
12:    cache_line_demo();
13:    return 0;
14:}
```
We have updated our program to output the rules of cache line sizing.

### Mechanical walkthrough
- `void cache_line_demo(void)`: Defines a function taking no parameters and returning nothing.
- `printf("Cache line size: typically 64 bytes\n");`: Prints the absolute size of a modern x86 cache line.
- `printf("Ints per cache line: %zu\n", 64 / sizeof(int));`: Calculates how many 4-byte integers fit into 64 bytes (`64 / 4 = 16`) and prints the result. `%zu` is the format specifier for `size_t`.
- `printf("arr[0..15]: 1 cache line\n");`: Prints that the first 16 integers occupy exactly one cache line.
- `printf("arr[16..31]: 2nd cache line\n");`: Prints that the next 16 integers occupy the next cache line.
- `printf("False sharing...");`: Prints a warning about concurrent modification on the same cache line.
- `int main(void) {`: Program entry point.
- `cache_line_demo();`: Calls the demonstration function.
- `return 0;`: Exits successfully.

### CS lens
This highlights cache **Associativity** and **Blocks**. A cache is divided into **sets**, and each set contains a certain number of **ways** (slots). In a direct-mapped cache (1-way), each memory address maps to exactly one slot, causing frequent evictions if two active addresses hash to the same slot. In an N-way set associative cache, a memory address can go into any of N slots within its set, reducing conflict misses.

### SE lens
**Aligning data with hardware boundaries.** Because the unit of transfer is 64 bytes, placing independent, heavily mutated variables next to each other in memory can destroy multithreaded performance. If thread A modifies `arr[0]` and thread B modifies `arr[1]`, the CPU cores fight over exclusive ownership of the *entire 64-byte cache line*. This is called **false sharing**. The engineering solution is to pad critical concurrent structs to 64-byte boundaries so they occupy independent cache lines.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Cache line size: typically 64 bytes
Ints per cache line: 16
arr[0..15]: 1 cache line
arr[16..31]: 2nd cache line
False sharing: threads on same cache line cause cache-line ping-pong
```
The output prints the structural rules of caches exactly as defined.

### One sentence connecting to previous unit
While the cache acts as a fast buffer over DRAM, DRAM itself acts as a fast buffer over the immense, permanent, but extremely slow persistence layers: the disk and the SSD.

## Concept Unit: Disk and SSD — persistent storage

### The Problem
When the computer turns off, DRAM loses all data. If we need persistent storage, we must use magnetic disks (HDDs) or flash memory (SSDs). How much slower are these devices compared to RAM? Does the access pattern (sequential vs random) matter as much for an SSD as it does for an HDD?

### Introduce the concept in isolation
We will write a C program to output the theoretical performance differences between Hard Disk Drives and Solid State Drives.

```c
#include <stdio.h>

void show_io_latency(void) {
    printf("Sequential I/O:\n");
    printf("  HDD:  200 MB/s  -> reading 1GB = 5 seconds\n");
    printf("  SSD:  2000 MB/s -> reading 1GB = 0.5 seconds\n");
    printf("  NVMe: 7000 MB/s -> reading 1GB = 0.14 seconds\n");
    printf("Random I/O (4KB blocks):\n");
    printf("  HDD:  1 MB/s (100 IOPS * 10KB)\n");
    printf("  SSD:  400 MB/s (100,000 IOPS * 4KB)\n");
    printf("  NVMe: 3200 MB/s (800,000 IOPS * 4KB)\n");
}

int main(void) { show_io_latency(); return 0; }
```

This output proves the devastating penalty of random access on mechanical media. An HDD must physically move a read head (seek time ~5ms) and wait for the platter to rotate (rotational latency ~4ms). This 9ms mechanical cost caps the drive at ~111 operations per second. If we read 4KB randomly, we get less than 1MB/s bandwidth. Sequentially, the head never moves, yielding 200MB/s. NVMe SSDs, having no moving parts, suffer far less from random access, delivering 3200x the random I/O performance of an HDD.

### Discard the throwaway
This code is discarded. It is a static comparison and will not be maintained.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `src/hierarchy.c` (modified)
- **Change type**: Replace
- **Location**: Replacing the entire contents.
- **Dependencies**: The standard C library.

### The New Code
```c
#include <stdio.h>

void show_io_latency(void) {
    printf("Sequential I/O:\n");
    printf("  HDD:  200 MB/s  -> reading 1GB = 5 seconds\n");
    printf("  SSD:  2000 MB/s -> reading 1GB = 0.5 seconds\n");
    printf("  NVMe: 7000 MB/s -> reading 1GB = 0.14 seconds\n");
    printf("Random I/O (4KB blocks):\n");
    printf("  HDD:  1 MB/s (100 IOPS * 10KB)\n");
    printf("  SSD:  400 MB/s (100,000 IOPS * 4KB)\n");
    printf("  NVMe: 3200 MB/s (800,000 IOPS * 4KB)\n");
}

int main(void) { show_io_latency(); return 0; }
```

### The Updated Project
```c
1: #include <stdio.h>
2: 
3: void show_io_latency(void) { // ← new
4:     printf("Sequential I/O:\n");
5:     printf("  HDD:  200 MB/s  -> reading 1GB = 5 seconds\n");
6:     printf("  SSD:  2000 MB/s -> reading 1GB = 0.5 seconds\n");
7:     printf("  NVMe: 7000 MB/s -> reading 1GB = 0.14 seconds\n");
8:     printf("Random I/O (4KB blocks):\n");
9:     printf("  HDD:  1 MB/s (100 IOPS * 10KB)\n");
10:    printf("  SSD:  400 MB/s (100,000 IOPS * 4KB)\n");
11:    printf("  NVMe: 3200 MB/s (800,000 IOPS * 4KB)\n");
12:}
13:
14:int main(void) { // ← new
15:    show_io_latency();
16:    return 0;
17:}
```
We replaced the cache demonstration with the I/O latency table.

### Mechanical walkthrough
- `void show_io_latency(void)`: Defines a function taking no parameters and returning nothing.
- `printf("Sequential I/O:\n");`: Prints a header for sequential speeds.
- `printf("  HDD:  200 MB/s...");`: Prints HDD sequential speed.
- `printf("  SSD:  2000 MB/s...");`: Prints SATA SSD sequential speed.
- `printf("  NVMe: 7000 MB/s...");`: Prints NVMe SSD sequential speed.
- `printf("Random I/O (4KB blocks):\n");`: Prints a header for random 4KB read speeds.
- `printf("  HDD:  1 MB/s...");`: Prints HDD random speed.
- `printf("  SSD:  400 MB/s...");`: Prints SATA SSD random speed.
- `printf("  NVMe: 3200 MB/s...");`: Prints NVMe SSD random speed.
- `int main(void) {`: Program entry point.
- `show_io_latency();`: Calls the latency function.
- `return 0;`: Exits gracefully.

### CS lens
This explores the hardware limitations of **Magnetic Storage vs NAND Flash**. HDDs rely on a spinning disk and a moving actuator arm. This mechanical reality enforces a strict penalty on random accesses. SSDs use NAND flash memory, where bits are trapped in floating-gate transistors. While SSDs eliminate seek times, they introduce **write amplification**, because flash memory can only be erased in large blocks (typically 4KB to 4MB), meaning changing a single byte requires rewriting an entire block.

### SE lens
**Data structures must respect the underlying storage medium.** The 500x difference between random and sequential HDD access is exactly why databases do not use standard binary search trees on disk. They use B-trees, which have massive nodes (often 4KB or 8KB) that align precisely with disk sectors, minimizing tree depth and converting random pointer chasing into dense, sequential block reads.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Sequential I/O:
  HDD:  200 MB/s  -> reading 1GB = 5 seconds
  SSD:  2000 MB/s -> reading 1GB = 0.5 seconds
  NVMe: 7000 MB/s -> reading 1GB = 0.14 seconds
Random I/O (4KB blocks):
  HDD:  1 MB/s (100 IOPS * 10KB)
  SSD:  400 MB/s (100,000 IOPS * 4KB)
  NVMe: 3200 MB/s (800,000 IOPS * 4KB)
```
The program trivially prints the requested static text.

### One sentence connecting to previous unit
Knowing how these devices fetch data in chunks sets the stage for the final piece of the puzzle: organizing our software's behavior to actually take advantage of those chunks.

## Concept Unit: The principle of locality — why the hierarchy works

### The Problem
If reading DRAM takes 180 CPU cycles, and the cache only holds a minuscule fraction of the data, why aren't all programs unplayably slow? By what mechanism do the caches "know" which bytes of DRAM to keep close to the CPU? If we access an array, what determines if we hit the fast SRAM or stall on the slow DRAM?

### Introduce the concept in isolation
We will write a C program contrasting good memory access patterns against poor ones to demonstrate **spatial locality**.

```c
#include <stdio.h>

void good_locality(int *arr, int n) {
    long sum = 0;
    for (int i = 0; i < n; i++)
        sum += arr[i];
    printf("good sum = %ld\n", sum);
}

void poor_locality(int *arr, int n) {
    long sum = 0;
    for (int i = 0; i < n; i += 256)
        sum += arr[i];
    printf("poor sum = %ld\n", sum);
}

int main(void) {
    int arr[1024*1024];  /* 4MB */
    for (int i = 0; i < 1024*1024; i++) arr[i] = i;
    good_locality(arr, 1024*1024);
    poor_locality(arr, 1024*1024);
    return 0;
}
```

This output proves that how we traverse data determines performance. `good_locality` accesses memory sequentially. The CPU loads a 64-byte cache line containing `arr[0]` to `arr[15]`. `arr[0]` is a miss, but `arr[1]` through `arr[15]` are guaranteed cache hits. This is a 6.25% miss rate. `poor_locality` jumps 256 integers (1024 bytes) at a time. It touches `arr[0]`, loads a 64-byte line, uses exactly one integer from it, and discards the rest. Every single access forces a DRAM fetch. This is a 100% miss rate. 

### Discard the throwaway
This code is discarded. It serves as a proof of concept for locality and will not remain in the project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `src/hierarchy.c` (modified)
- **Change type**: Replace
- **Location**: Replacing the entire contents.
- **Dependencies**: The standard C library.

### The New Code
```c
#include <stdio.h>

void good_locality(int *arr, int n) {
    long sum = 0;
    for (int i = 0; i < n; i++)
        sum += arr[i];
    printf("good sum = %ld\n", sum);
}

void poor_locality(int *arr, int n) {
    long sum = 0;
    for (int i = 0; i < n; i += 256)
        sum += arr[i];
    printf("poor sum = %ld\n", sum);
}

int main(void) {
    int arr[1024*1024];
    for (int i = 0; i < 1024*1024; i++) arr[i] = i;
    good_locality(arr, 1024*1024);
    poor_locality(arr, 1024*1024);
    return 0;
}
```

### The Updated Project
```c
1: #include <stdio.h>
2: 
3: void good_locality(int *arr, int n) { // ← new
4:     long sum = 0;
5:     for (int i = 0; i < n; i++)
6:         sum += arr[i];
7:     printf("good sum = %ld\n", sum);
8: }
9: 
10:void poor_locality(int *arr, int n) { // ← new
11:    long sum = 0;
12:    for (int i = 0; i < n; i += 256)
13:        sum += arr[i];
14:    printf("poor sum = %ld\n", sum);
15:}
16:
17:int main(void) { // ← new
18:    int arr[1024*1024];
19:    for (int i = 0; i < 1024*1024; i++) arr[i] = i;
20:    good_locality(arr, 1024*1024);
21:    poor_locality(arr, 1024*1024);
22:    return 0;
23:}
```
We have finalized the lesson's code by demonstrating how code structure exploits hardware behavior.

### Mechanical walkthrough
- `void good_locality(int *arr, int n)`: Defines a function taking an integer pointer (an array) and its size.
- `long sum = 0;`: Initializes an accumulator.
- `for (int i = 0; i < n; i++)`: Iterates sequentially, incrementing by 1.
- `sum += arr[i];`: Adds the current array element to the sum.
- `printf("good sum = %ld\n", sum);`: Prints the final accumulated sum for the good locality test.
- `void poor_locality(int *arr, int n)`: Defines a function taking an integer pointer and its size.
- `long sum = 0;`: Initializes a second accumulator.
- `for (int i = 0; i < n; i += 256)`: Iterates over the array, but strides forward by 256 elements each time.
- `sum += arr[i];`: Adds the element to the sum.
- `printf("poor sum = %ld\n", sum);`: Prints the final sum for the poor locality test.
- `int main(void) {`: The main program entry point.
- `int arr[1024*1024];`: Allocates a 4MB array on the stack.
- `for (int i = 0; i < 1024*1024; i++) arr[i] = i;`: Initializes the array with sequential integers.
- `good_locality(arr, 1024*1024);`: Calls the good locality function.
- `poor_locality(arr, 1024*1024);`: Calls the poor locality function.
- `return 0;`: Exits successfully.

### CS lens
This is the **Principle of Locality**, the core assumption that makes caches effective. It has two forms. **Temporal locality** states that recently accessed data is likely to be accessed again (e.g., local variables in a tight loop). **Spatial locality** states that data near recently accessed data is likely to be accessed next (e.g., sequentially iterating over an array). The entire memory hierarchy works purely because real-world programs exhibit both forms of locality.

### SE lens
**The working set size.** A program's "working set" is the amount of memory it actively needs to accomplish its current phase of execution. If the working set fits entirely within L1 cache, the program runs at L1 speeds (1-4 cycles per element). If the working set exceeds L3 cache and spills into DRAM, the program runs at DRAM speeds (100 cycles per element). Software engineers optimize critical paths not just by reducing instruction counts, but by shrinking the working set so it fits inside the fastest available tier of the memory hierarchy.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
good sum = 524287438848
poor sum = 2046976
```
The calculations are deterministic integer accumulations over the array. 

### One sentence connecting to previous unit
Understanding how the hardware buffers data through these caches leads directly to the programmer's job of optimizing code to take advantage of them.

## Closing
### Connect the pieces
The memory hierarchy is a speed, cost, and size tradeoff implemented entirely in hardware. Let's trace a single memory access across it. When the CPU requests `arr[0]`, it first checks its internal registers. Finding nothing, it issues a request to the **L1 cache**. If L1 misses, it checks **L2**, then **L3**. If all caches miss, the request hits the **DRAM** controller, stalling the CPU for ~180 cycles while the DRAM fetches exactly one **cache line** (64 bytes) containing `arr[0]` through `arr[15]`. That 64-byte line is pulled up through L3, L2, and placed in a specific **set** and **way** in L1. `arr[0]` is finally handed to the CPU register. Because of **spatial locality**, the next request for `arr[1]` will instantly hit the L1 cache. If `arr` was large enough to exceed DRAM, the operating system would fetch a 4KB page from the **SSD** (taking ~100 microseconds) or the **HDD** (taking ~10 milliseconds), orders of magnitude slower still. The programmer's job is to structure data and access patterns so that the working set fits in the fastest level possible. Lesson 14 covers locality — the specific techniques for restructuring code to do exactly that.
