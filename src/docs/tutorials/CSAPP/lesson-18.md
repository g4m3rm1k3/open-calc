# Lesson 18: The Memory Mountain and Program Performance

What you will build: The reader will consolidate all of Module 2 by understanding the memory mountain as a unified performance model. You will practice analyzing any loop for its cache behavior and apply Array-of-Structs (AoS) vs Struct-of-Arrays (SoA) and tiling principles to real code patterns. The transferable insight is that the memory mountain reveals the entire memory hierarchy in one picture — throughput vs stride vs working set size. Every optimization in Module 2 is about moving toward the high-throughput corner of this mountain.

What you need to know first:
- Lessons 00–17

**Terms used in this lesson**
- **Memory Mountain** — a unified performance model plotting read throughput against stride and working set size, used to visualize cache performance.
- **Throughput** — the rate at which data is read from memory, measured in MB/s or GB/s, reflecting the efficiency of the memory system.
- **Stride** — the distance in memory (in elements or bytes) between successive accesses. Smaller strides maximize spatial locality.
- **Working set** — the total amount of data actively used by an algorithm during a period of time, determining which cache level it fits into.
- **AoS (Array of Structs)** — a data layout where each object's properties are stored contiguously. Often wastes cache space on unused fields.
- **SoA (Struct of Arrays)** — a data layout where each property of all objects is stored in its own array. Maximizes spatial locality for specific property sweeps.
- **Loop fission** — splitting a single loop into multiple loops to improve cache locality for disparate arrays.
- **Loop fusion** — combining multiple loops into one to reuse data while it remains in cache (registers/L1).
- **restrict** — a C keyword (promise to the compiler) indicating that a pointer is the sole way to access a block of memory, enabling optimizations.
- **Undefined Behavior (UB)** — the result of breaking a language contract (like aliasing a restrict pointer), allowing the compiler to generate arbitrary or broken code.
- **volatile** — a C keyword preventing the compiler from optimizing memory accesses, forcing every read/write to hit memory instead of registers.

**Objects and methods used**
- **`binary_search`**
  - *What it is:* An algorithm to find an element in a sorted array by halving the search space.
  - *Implementation:* `long binary_search(long *arr, long n, long target)`
  - *Its use:* Analyzed as a capstone example to demonstrate poor cache behavior (no spatial/temporal locality).
  - *Type:* Free function.
  - *Responsibility:* Returns the index of a target in a sorted array, or -1 if not found.
  - *Depends on:* A sorted array, its length, and a target value.
  - *Connects to:* Called by client code; accesses memory non-sequentially.
  - *Shape:* Implementation detail (algorithmic).
- **`memcpy`**
  - *What it is:* Standard C library function for copying memory.
  - *Implementation:* `void *memcpy(void *restrict dest, const void *restrict src, size_t n);`
  - *Its use:* Mentioned to explain why overlapping regions cause undefined behavior due to the `restrict` keyword.
  - *Type:* Standard library function.
  - *Responsibility:* Copies `n` bytes from `src` to `dest`.
  - *Depends on:* Non-overlapping pointers `dest` and `src`, and size `n`.
  - *Connects to:* Called by client code.
  - *Shape:* Utility function at the system boundary.
- **`memmove`**
  - *What it is:* Standard C library function for copying memory, safe for overlapping regions.
  - *Implementation:* `void *memmove(void *dest, const void *src, size_t n);`
  - *Its use:* Mentioned as the safe alternative to `memcpy` when regions overlap, as it does not use `restrict`.
  - *Type:* Standard library function.
  - *Responsibility:* Copies `n` bytes from `src` to `dest` safely.
  - *Depends on:* Pointers `dest` and `src` (can overlap), and size `n`.
  - *Connects to:* Called by client code.
  - *Shape:* Utility function.

## Concept Unit: The Memory Mountain

### The Problem
How can we visualize the performance of our memory hierarchy as a whole? We know L1 is fast and DRAM is slow, and we know stride-1 is better than stride-8. But how do they interrelate?

### Introduce the concept in isolation
Here is a program that systematically explores read throughput by varying both the working set size and the stride.

```c
#include <stdio.h>
#include <stdlib.h>

#define MAXELEMS 8388608  /* 64 MB / 8 bytes = 8M longs */
long data[MAXELEMS];

/* Sum elements with given stride over the first 'elems' elements */
long mountain_function(int elems, int stride)
{
    long sum = 0;
    for (long i = 0; i < elems; i += stride)
        sum += data[i];
    return sum;
}

int main() {
    /* For elems=8, stride=2 */
    long result = mountain_function(8, 2);
    printf("Sum: %ld\n", result);
    return 0;
}
```
*Output (predicted):* `Sum: 0` (since `data` is zero-initialized).

This is a **Memory Mountain benchmark**. It proves that by manipulating `elems` and `stride`, we can isolate every level of the cache. For `elems=8` and `stride=2`, it accesses `data[0]`, `data[2]`, `data[4]`, `data[6]`. That's 4 accesses, 32 bytes, with a spatial stride of 2. 

### Discard the throwaway example
This specific test harness is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: Concept analysis.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
```c
/* Throughput tier | Working set fits in... | Stride
~15,000 MB/s    | L1 cache (32KB)        | stride-1
~8,000  MB/s    | L2 cache (256KB)       | stride-1
~4,000  MB/s    | L3 cache (8MB)         | stride-1
~2,000  MB/s    | DRAM                   | stride-1
~200    MB/s    | DRAM                   | stride-64 (1 cache line per access)
*/
```

### The Updated Project
```c
1: /* Throughput tier | Working set fits in... | Stride
2: ~15,000 MB/s    | L1 cache (32KB)        | stride-1
3: ~8,000  MB/s    | L2 cache (256KB)       | stride-1
4: ~4,000  MB/s    | L3 cache (8MB)         | stride-1
5: ~2,000  MB/s    | DRAM                   | stride-1
6: ~200    MB/s    | DRAM                   | stride-64 (1 cache line per access)
7: */
```
This is the topology of the memory mountain.

### Mechanical walkthrough
- **Working set size**: Determines which ridge we fall on. Small `elems` fit in L1, providing ~15 GB/s throughput. Larger `elems` fall back to L2, L3, and eventually DRAM.
- **Stride**: Determines the slope down from the ridge. Stride-1 keeps throughput high due to the prefetcher. Large strides plummet throughput down to ~200 MB/s.

## Concept Unit: Reading the Mountain

### The Problem
How does changing the stride drastically reduce performance even when the same amount of data is touched?

### Introduce the concept in isolation
```c
#include <stdio.h>

long a[64];  /* 64 elements = 512 bytes = 8 cache lines of 64 bytes */

int main() {
    /* stride-1: loads 8 elements per cache line miss */
    long sum1 = 0;
    for (int i = 0; i < 64; i++) sum1 += a[i];  /* 8 misses, 64 accesses */

    /* stride-8: loads 1 element per cache line miss */
    long sum2 = 0;
    for (int i = 0; i < 64; i += 8) sum2 += a[i];  /* 8 misses, 8 accesses */
    
    printf("stride-1: %ld, stride-8: %ld\n", sum1, sum2);
    return 0;
}
```
*Output (predicted):* `stride-1: 0, stride-8: 0`.

This proves that **stride** directly affects the cache miss rate. Stride-1 has a 12.5% miss rate, while stride-8 has a 100% miss rate (one miss per access).

### Discard the throwaway example
This specific example is deleted.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: Concept analysis.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
```c
/* stride-1: 12.5% miss rate */
/* stride-8: 100% miss rate */
```

### The Updated Project
```c
1: /* stride-1: 12.5% miss rate */
2: /* stride-8: 100% miss rate */
```

### Mechanical walkthrough
- **stride-1**: The cache fetches 64-byte lines. Accessing `a[0]` misses and fetches `a[0]` through `a[7]`. The next 7 accesses hit.
- **stride-8**: Accessing `a[0]` misses. The next access is `a[8]`, which is in the *next* cache line, so it misses too. Every access requires a new fetch from memory.

## Concept Unit: AoS vs SoA

### The Problem
If we have complex objects like particles with position, velocity, and mass, how should we organize them in memory?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define N 1000
#define dt 0.1

/* Array of Structs (AoS) */
struct Particle {
    double x, y, z;      /* 24 bytes */
    double vx, vy, vz;   /* 24 bytes */
    double mass;         /* 8 bytes */
};  /* Total: 56 bytes */

struct Particle particles_aos[N];

/* Struct of Arrays (SoA) */
double xs[N], ys[N], zs[N];
double vxs[N], vys[N], vzs[N];
double masses[N];

int main() {
    /* AoS update */
    for (int i = 0; i < N; i++) {
        particles_aos[i].x += particles_aos[i].vx * dt;
    }
    
    /* SoA update */
    for (int i = 0; i < N; i++) {
        xs[i] += vxs[i] * dt;
    }
    
    printf("Updated.\n");
    return 0;
}
```
*Output (predicted):* `Updated.`

This proves the difference between **AoS and SoA**. AoS loads 56 bytes per particle but wastes the `mass` field in cache. SoA packs contiguous `xs` together, so every byte loaded is used.

### Discard the throwaway example
This example is deleted.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: Concept analysis.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
```c
/* SoA uses 100% of cache lines */
/* AoS wastes space on unused fields */
```

### The Updated Project
```c
1: /* SoA uses 100% of cache lines */
2: /* AoS wastes space on unused fields */
```

### Mechanical walkthrough
- **AoS**: Each 64-byte cache line brings in one full 56-byte particle plus 8 bytes of the next. When computing position, `mass` is loaded into cache but never used.
- **SoA**: The array `xs` is tightly packed. One 64-byte cache line holds 8 doubles, meaning 8 `x` positions are loaded at once. Zero waste.

## Concept Unit: Loop Fusion and Fission

### The Problem
When should we write one large loop doing many things, versus many small loops doing one thing each?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define N 4
double a[N], b[N], c[N];

double compute_a(int i) { return i * 2.0; }
double transform(double val) { return val + 1.0; }
double combine(double x, double y) { return x + y; }

int main() {
    /* GOOD fused version: */
    for (int i = 0; i < N; i++) {
        double ai = compute_a(i);
        b[i] = transform(ai);
        c[i] = combine(ai, b[i]);
    }
    printf("c[0] = %f\n", c[0]);
    return 0;
}
```
*Output (predicted):* `c[0] = 1.000000`.

This proves **Loop Fusion**. The variable `ai` stays in a CPU register. If we had three separate loops, `a` would be written to memory, potentially evicted from cache, and re-read.

### Discard the throwaway example
This example is deleted.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: Concept analysis.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
```c
/* Fused: variables stay in registers */
```

### The Updated Project
```c
1: /* Fused: variables stay in registers */
```

### Mechanical walkthrough
- **Loop Fusion**: Combine loops when they touch the same data, allowing that data to stay hot in registers or L1 cache.
- **Loop Fission**: Split loops when touching disparate arrays that thrash the cache. If `a` and `b` evict each other, splitting them gives perfect stride-1 access for each.

## Concept Unit: The restrict Keyword

### The Problem
How do we tell the compiler that two pointers definitely do not point to the same memory, freeing it to vectorize our loops?

### Introduce the concept in isolation
```c
#include <stdio.h>

/* WITHOUT restrict */
void copy_slow(double *dst, double *src, int n) {
    for (int i = 0; i < n; i++) dst[i] = src[i];
}

/* WITH restrict */
void copy_fast(double * restrict dst, const double * restrict src, int n) {
    for (int i = 0; i < n; i++) dst[i] = src[i];
}

int main() {
    double arr[10] = {0};
    copy_slow(arr + 1, arr, 9);  /* overlapping! safe with slow */
    /* copy_fast(arr + 1, arr, 9); -> UB! */
    printf("Done.\n");
    return 0;
}
```
*Output (predicted):* `Done.`

This proves the behavior of **restrict**. The `restrict` keyword promises the compiler that `dst` and `src` do not overlap, enabling SIMD vectorization. Violating this promise causes undefined behavior.

### Discard the throwaway example
This example is deleted.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: Concept analysis.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
```c
/* restrict enables compiler optimizations */
```

### The Updated Project
```c
1: /* restrict enables compiler optimizations */
```

### Mechanical walkthrough
- **`restrict`**: A C keyword. It explicitly tells the compiler that for the lifetime of the pointer, only that pointer (or a value derived from it) will access that memory block.
- **Undefined Behavior**: Passing `arr` and `arr + 1` to `copy_fast` breaks the promise. `memcpy` uses `restrict` (which is why overlapping `memcpy` is UB), whereas `memmove` does not.

## Concept Unit: The volatile Keyword

### The Problem
What if a memory address is mapped to hardware, and its value changes without our code doing it? How do we stop the compiler from optimizing the read away?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdint.h>

void timed_loop(void) {
    volatile long sink = 0;
    for (long i = 0; i < 1000L; i++)
        sink += i;
}

int main() {
    timed_loop();
    printf("Finished.\n");
    return 0;
}
```
*Output (predicted):* `Finished.`

This proves the **volatile** keyword. `sink` is never read after the loop, so normally a compiler would delete the entire loop. `volatile` forces it to actually write to memory on every iteration.

### Discard the throwaway example
This example is deleted.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: Concept analysis.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
```c
/* volatile forces memory access */
```

### The Updated Project
```c
1: /* volatile forces memory access */
```

### Mechanical walkthrough
- **`volatile`**: Tells the compiler that the value might change outside the program's explicit control (e.g., hardware registers). It prohibits keeping the value in a register.

## Concept Unit: Capstone - Cache Analysis

### The Problem
We have learned about spatial and temporal locality. Let's analyze a real algorithm like binary search.

### Introduce the concept in isolation
```c
#include <stdio.h>

long binary_search(long *arr, long n, long target) {
    long lo = 0, hi = n - 1;
    while (lo <= hi) {
        long mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main() {
    long arr[] = {1, 2, 3, 4, 5, 6, 7};
    printf("Found at: %ld\n", binary_search(arr, 7, 5));
    return 0;
}
```
*Output (predicted):* `Found at: 4`

This proves the behavior of **`binary_search`**. While O(log N) is fast algorithmically, it has terrible cache locality.

### Discard the throwaway example
This example is deleted.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: Concept analysis.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
```c
/* binary_search has poor spatial and temporal locality */
```

### The Updated Project
```c
1: /* binary_search has poor spatial and temporal locality */
```

### Mechanical walkthrough
- **Spatial locality**: None. Each jump spans half the array, far exceeding the 64-byte cache line size. Every access is a cache miss.
- **Temporal locality**: None for large N. Each element is read at most once per search.
- **Performance**: For a 128MB array, most accesses hit DRAM, taking ~200 cycles each. This is why for very small arrays, a simple linear scan (with perfect spatial locality) is faster than binary search.

Module 2 complete. You now have the full cache model. Module 3 begins with Lesson 19 — the operating system. Exercises: explain why binary search has worse cache behavior than a B-tree search; analyze the memory mountain position for binary search on a 1M-element array; predict the throughput improvement from switching a particle simulation from AoS to SoA.
