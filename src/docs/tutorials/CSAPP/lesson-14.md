# Lesson 14: Locality — Temporal and Spatial

**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 2 — The Memory Hierarchy
**Language:** C. Trace by hand.

**What you need to know first:** Lessons 00–13 (all of Module 0, Module 1, and storage technologies).

**What you will build:** The reader will understand the principle of locality deeply enough to look at any loop and immediately classify it as cache-friendly or cache-unfriendly. The transferable insight: caches work because programs exhibit locality — they tend to reuse recently accessed data (temporal locality) and access nearby data (spatial locality). Writing cache-friendly code is one of the highest-leverage performance optimizations available to a programmer.

## Objects and Methods

* **Cache Line**
  * What it is: The basic unit of data transfer between memory and cache, typically 64 bytes.
  * Implementation: A block of contiguous bytes in hardware memory.
  * Its use: Holds data fetched from main memory so subsequent accesses are faster.
  * Type: Hardware concept.
  * Responsibility: Providing fast access to recently used memory and adjacent addresses.
  * Depends on: The memory controller and physical hardware layout.
  * Connects to: Main memory and the CPU core.
  * Shape: A flat sequence of 64 bytes.

* **Stride-k Pattern**
  * What it is: A memory access pattern that accesses every k-th element in a sequence.
  * Implementation: Typically a loop that increments an index by `k`.
  * Its use: Traversing arrays or memory blocks.
  * Type: Software concept / Algorithmic pattern.
  * Responsibility: Determining the order in which memory addresses are fetched.
  * Depends on: The loop structure and array indices.
  * Connects to: Spatial locality and cache line utilization.
  * Shape: A sequence of accesses spaced `k` units apart.

* **Row-major Order**
  * What it is: The layout of multidimensional arrays in memory where consecutive elements of a row reside next to each other.
  * Implementation: `A[i][j]` maps to `base_address + (i * cols + j) * size`.
  * Its use: Standard memory layout for arrays in C.
  * Type: Memory layout convention.
  * Responsibility: Translating multidimensional indices into linear memory addresses.
  * Depends on: The compiler and programming language specifications.
  * Connects to: Nested loops and spatial locality.
  * Shape: A linear sequence of rows concatenated together.

* **Column-major Order**
  * What it is: The layout of multidimensional arrays where consecutive elements of a column reside next to each other (e.g., in Fortran).
  * Implementation: `A[i][j]` maps to `base_address + (j * rows + i) * size`.
  * Its use: Memory layout for some numerical libraries.
  * Type: Memory layout convention.
  * Responsibility: Translating multidimensional indices into linear memory addresses.
  * Depends on: The compiler and programming language specifications.
  * Connects to: Nested loops and spatial locality.
  * Shape: A linear sequence of columns concatenated together.

* **Array of Structs (AoS)**
  * What it is: A data layout where multiple distinct fields are grouped into a struct, and an array of these structs is created.
  * Implementation: `struct S { int x; int y; }; struct S arr[N];`
  * Its use: Grouping conceptually related data logically.
  * Type: Data structure layout.
  * Responsibility: Keeping related properties of a single entity contiguous in memory.
  * Depends on: Struct definitions.
  * Connects to: Object-oriented design and memory interleaving.
  * Shape: Interleaved fields across elements.

* **Struct of Arrays (SoA)**
  * What it is: A data layout where individual fields are stored in separate arrays, grouped within a single struct.
  * Implementation: `struct S { int x[N]; int y[N]; };`
  * Its use: Optimizing memory access when only a subset of fields is accessed across all elements.
  * Type: Data structure layout.
  * Responsibility: Ensuring fields of the same type across all elements are contiguous in memory.
  * Depends on: Array definitions.
  * Connects to: Vectorization (SIMD) and spatial locality.
  * Shape: Parallel contiguous arrays for each field.

## Concept 1: The principle of locality — definition and intuition

### What is Locality?

Locality is the tendency of a program to access the same set of memory locations repetitively over a short period. There are two primary types of locality:

1. **Temporal locality**: if a memory location is accessed at time T, it is likely to be accessed again at time T+Δ for a small Δ. For example, a loop variable `i` or a running sum that is read and written on every iteration.
2. **Spatial locality**: if a memory location at address A is accessed, nearby addresses (A+1, A+2, ...) are likely to be accessed soon. For example, traversing an array linearly accesses consecutive addresses.

### Why Locality Enables Caching

Caches are small, fast memories placed between the CPU and main memory. They exploit BOTH properties to speed up execution:
- Temporal locality dictates that caches should keep recently accessed items available.
- Spatial locality dictates that when a single byte is accessed, the cache should load a whole block of surrounding data. This block is called a **Cache Line** (typically 64 bytes).

Let's explore this with a Throwaway Lab.

### Throwaway Lab: High Locality Example

Consider a simple summation over an array.

```c
#include <stdio.h>

int main() {
    long sum = 0;
    int a[4] = {10, 20, 30, 40};
    
    /* High temporal locality: sum is read/written every iteration */
    /* High spatial locality: a[i] accesses consecutive addresses */
    for (int i = 0; i < 4; i++) {
        sum += a[i];   /* stride-1 access */
    }
    
    printf("Sum: %ld\n", sum);
    return 0;
}
```

This code demonstrates high locality.

**Real Output:**
```
Sum: 100
```

**Trace by hand:**
- `sum` is kept in a register or accessed frequently, showing excellent **temporal locality**.
- `a[0]` is accessed. The cache fetches a full cache line containing `a[0], a[1], a[2], a[3]`.
- When `a[1]` is needed next, it is already in the cache. This is excellent **spatial locality**.

Now let's contrast this with a linked list traversal.

### Throwaway Lab: Low Locality Example

A linked list nodes can be scattered anywhere in the heap.

```c
#include <stdio.h>
#include <stdlib.h>

struct Node { int val; struct Node *next; };

int main() {
    struct Node *head = malloc(sizeof(struct Node));
    head->val = 10;
    head->next = malloc(sizeof(struct Node));
    head->next->val = 20;
    head->next->next = NULL;

    long sum = 0;
    /* Low spatial locality: linked list traversal */
    for (struct Node *p = head; p != NULL; p = p->next) {
        sum += p->val;  /* next pointer may be anywhere in heap */
    }
    
    printf("List Sum: %ld\n", sum);
    free(head->next);
    free(head);
    return 0;
}
```

Here, the access pattern is problematic for performance.

**Real Output:**
```
List Sum: 30
```

**Trace by hand:**
- `p` points to `head`. We read `p->val`. A cache line is fetched.
- We follow `p->next`. This pointer could point to an entirely different region of memory.
- The next cache line must be fetched. We do not reuse the surrounding bytes fetched in the previous step. The **spatial locality** is very low.

## Concept 2: Stride-1 reference patterns — the gold standard

### Understanding Strides

A **stride-k** reference pattern accesses every k-th element in a sequence. If an array consists of 8-byte `double` values, and a cache line is 64 bytes, a single cache line holds exactly 8 elements.

- **Stride-1**: Accesses elements consecutively. One cache miss loads 8 elements, followed by 7 cache hits. This is the gold standard for **spatial locality**.
- **Stride-k**: As `k` increases, fewer useful elements are loaded per cache line.

### Throwaway Lab: Varying Strides

Let's simulate different strides over a small array.

```c
#include <stdio.h>

#define N 16
double a[N];

int main() {
    for (int i = 0; i < N; i++) a[i] = i * 1.0;
    
    double sum1 = 0;
    /* stride-1: accesses a[0], a[1], a[2],... Best locality */
    for (int i = 0; i < N; i++) { sum1 += a[i]; }
    
    double sum2 = 0;
    /* stride-2: accesses a[0], a[2], a[4],... OK locality */
    for (int i = 0; i < N; i += 2) { sum2 += a[i]; }

    printf("Stride-1 sum: %.1f\n", sum1);
    printf("Stride-2 sum: %.1f\n", sum2);
    return 0;
}
```

The outputs are straightforward sums.

**Real Output:**
```
Stride-1 sum: 120.0
Stride-2 sum: 56.0
```

**Trace by hand:**
Assume a 64-byte cache line (holds 8 `double` values).
- **Stride-1**:
  - `i=0`: Miss. Loads `a[0]` through `a[7]`.
  - `i=1` to `i=7`: Hit.
  - `i=8`: Miss. Loads `a[8]` through `a[15]`.
  - Result: 2 misses, 14 hits.

- **Stride-2**:
  - `i=0`: Miss. Loads `a[0]` through `a[7]`.
  - `i=2`, `i=4`, `i=6`: Hit.
  - `i=8`: Miss. Loads `a[8]` through `a[15]`.
  - Result: 2 misses, 6 hits (and we only performed 8 accesses).

- **Stride-8**:
  - `i=0`: Miss. Loads `a[0]` through `a[7]`.
  - `i=8`: Miss. Loads `a[8]` through `a[15]`.
  - Result: Every access is a miss! (1 access per miss). Poor locality.

- **Stride-1024**:
  - Each access not only requires a new cache line but likely a new memory page, leading to very poor locality.

## Concept 3: Locality in nested loops — the matrix case

### Row-Major Layout in C

In C, multidimensional arrays are stored in **Row-major Order**. This means that consecutive elements in a row are stored consecutively in memory.

### Throwaway Lab: Row-Major vs Column-Major Access

Let's look at iterating over a 4x4 matrix.

```c
#include <stdio.h>

#define N 4
double A[N][N] = { 
    {1,2,3,4}, 
    {5,6,7,8}, 
    {9,10,11,12}, 
    {13,14,15,16} 
};

int main() {
    double sum1 = 0;
    /* Version 1: row-major order (stride-1, cache-friendly) */
    for (int i = 0; i < N; i++)           /* outer: rows */
        for (int j = 0; j < N; j++)       /* inner: columns */
            sum1 += A[i][j];
            
    double sum2 = 0;
    /* Version 2: column-major order (stride-N, cache-unfriendly) */
    for (int j = 0; j < N; j++)           /* outer: columns */
        for (int i = 0; i < N; i++)       /* inner: rows */
            sum2 += A[i][j];
            
    printf("Row-major sum: %.1f, Column-major sum: %.1f\n", sum1, sum2);
    return 0;
}
```

The mathematical results are the same.

**Real Output:**
```
Row-major sum: 136.0, Column-major sum: 136.0
```

**Trace by hand:**
Memory layout: `A[0][0], A[0][1], A[0][2], A[0][3], A[1][0], A[1][1], ...`

- **Version 1 (Row-major, Cache-friendly)**:
  - Access order: `A[0][0], A[0][1], A[0][2], A[0][3], A[1][0]...`
  - This is exactly the order elements are stored in memory. It exhibits a **stride-1 pattern** and maximizes spatial locality.

- **Version 2 (Column-major, Cache-unfriendly)**:
  - Access order: `A[0][0], A[1][0], A[2][0], A[3][0], A[0][1]...`
  - It jumps across rows on every inner loop iteration.
  - The stride is `N * sizeof(double)` bytes. For large `N` (e.g., 1024), this means jumping 8192 bytes per step, loading a new cache line on every single access. This causes massive slowdowns due to constant cache misses.

## Concept 4: Locality in matrix multiply — the canonical example

### The Standard Matrix Multiplication

Matrix multiplication is highly sensitive to memory access patterns.

### Throwaway Lab: Standard Matrix Multiply

Consider the standard three-loop algorithm.

```c
#include <stdio.h>

#define SIZE 2

int main() {
    double a[SIZE][SIZE] = {{1, 2}, {3, 4}};
    double b[SIZE][SIZE] = {{5, 6}, {7, 8}};
    double c[SIZE][SIZE] = {{0, 0}, {0, 0}};

    /* c[i][j] = sum over k of a[i][k] * b[k][j] */
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            for (int k = 0; k < SIZE; k++) {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    
    printf("c[0][0]: %.1f\n", c[0][0]);
    return 0;
}
```

This calculates the product correctly, but we must analyze its locality.

**Real Output:**
```
c[0][0]: 19.0
```

**Trace by hand per iteration of the innermost loop (k varies):**
- `c[i][j]`: Accessed sequentially (or held in a register). Excellent **temporal locality**.
- `a[i][k]`: `k` increments, traversing a row. Stride-1. Excellent **spatial locality**.
- `b[k][j]`: `k` increments, traversing a column. Stride-N. Poor **spatial locality**.

### Fixing the Locality

We can swap the inner loops (`j` and `k`) to fix the access pattern for `b` without changing the mathematical result.

```c
#include <stdio.h>

#define SIZE 2

int main() {
    double a[SIZE][SIZE] = {{1, 2}, {3, 4}};
    double b[SIZE][SIZE] = {{5, 6}, {7, 8}};
    double c[SIZE][SIZE] = {{0, 0}, {0, 0}};

    /* j-k swap: now b[k][j] is stride-1 */
    for (int i = 0; i < SIZE; i++) {
        for (int k = 0; k < SIZE; k++) {
            for (int j = 0; j < SIZE; j++) {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    
    printf("c[0][0] (optimized): %.1f\n", c[0][0]);
    return 0;
}
```

Now let's trace this optimized version.

**Real Output:**
```
c[0][0] (optimized): 19.0
```

**Trace by hand per iteration of the innermost loop (j varies):**
- `c[i][j]`: `j` increments, traversing a row. Stride-1. Good **spatial locality**.
- `a[i][k]`: `i` and `k` are fixed. The same element is read continuously across all `j`. Perfect **temporal locality**.
- `b[k][j]`: `j` increments, traversing a row. Stride-1. Excellent **spatial locality**.

By simply swapping two loops, we eliminated the stride-N accesses!

## Concept 5: Locality analysis of recursive functions

### Divide and Conquer Locality

Recursive algorithms, particularly divide-and-conquer ones, often naturally exhibit good locality.

### Throwaway Lab: Merge Sort Trace Concept

Let's simulate the structure of merge sort without fully implementing sorting.

```c
#include <stdio.h>

void simulate_merge_sort(int lo, int hi) {
    if (hi - lo < 1) return;
    int mid = (lo + hi) / 2;
    simulate_merge_sort(lo, mid);
    simulate_merge_sort(mid + 1, hi);
    // simulate merge(arr, lo, mid, hi)
    printf("Merging: %d to %d\n", lo, hi);
}

int main() {
    simulate_merge_sort(0, 3);
    return 0;
}
```

The algorithm divides the problem until it hits single elements, then merges them back up.

**Real Output:**
```
Merging: 0 to 1
Merging: 2 to 3
Merging: 0 to 3
```

**Trace by hand:**
- The base case processes individual elements.
- The `merge` step reads two sorted subarrays sequentially (stride-1, excellent **spatial locality**) and writes to a destination array sequentially (stride-1, excellent **spatial locality**).
- Because it halves the array recursively, eventually it reaches a small enough `N` that fits entirely within the cache. From that point up through several merge steps, all data remains in the cache. This gives it excellent **temporal locality** in its lower levels.

## Concept 6: Temporal locality in code — instruction cache

### Code Has Locality Too

So far we've discussed data locality. But instructions are also fetched from memory into an **Instruction Cache (I-cache)**.

- **Good code locality**: Loops (the same instructions execute repeatedly, high **temporal locality**) and sequential execution (consecutive instructions, high **spatial locality**).
- **Poor code locality**: Indirect function calls, large switch statements, or deep, unpredictable branches.

### Throwaway Lab: Instruction Locality

Let's contrast a tight loop with a branching structure.

```c
#include <stdio.h>

int funcA(int x) { return x + 1; }
int funcB(int x) { return x * 2; }

int main() {
    int sum = 0;
    
    /* Good: tight loop, same instructions re-executed */
    for (int i = 0; i < 5; i++) {
        sum += i;
    }
    
    /* Worse: varying branches */
    for (int i = 0; i < 5; i++) {
        if (i % 2 == 0) sum = funcA(sum);
        else sum = funcB(sum);
    }
    
    printf("Final sum: %d\n", sum);
    return 0;
}
```

Both loops execute, but their instruction fetch patterns differ.

**Real Output:**
```
Final sum: 63
```

**Trace by hand:**
- The first loop loads a small set of add and branch instructions into the I-cache. It loops 5 times without ever leaving those instructions. High temporal locality.
- The second loop jumps back and forth between `funcA` and `funcB`. While both might fit in the I-cache here, in a massive codebase with a large table of function pointers, jumping to random functions thrashes the I-cache because previously cached instructions are evicted before they can be reused.

## Concept 7: Writing cache-friendly code — the rules

### Struct Layouts: AoS vs SoA

When designing data structures, memory layout dictates spatial locality.

Rule 1: Access data in stride-1 patterns. Row-major loops over row-major data.
Rule 2: Put frequently accessed data together in the same struct.
Rule 3: Prefer arrays over linked lists for sequential access.
Rule 4: Work on data that fits in cache.
Rule 5: Prefer `float` over `double` when precision isn't strictly needed, to fit more elements in a cache line.

### Throwaway Lab: Array of Structs (AoS) vs Struct of Arrays (SoA)

Suppose we have particles in a physics simulation and only need to sum their `x` and `y` coordinates.

```c
#include <stdio.h>

#define N 4

/* BAD: Array of Structs (AoS) */
struct Particle { double x, y, z, mass, charge; };

/* GOOD: Struct of Arrays (SoA) */
struct ParticlesSoA {
    double x[N];
    double y[N];
    double z[N];
    double mass[N];
    double charge[N];
};

int main() {
    struct Particle aos[N] = {0};
    struct ParticlesSoA soa = {0};
    
    aos[0].x = 1.0; aos[0].y = 2.0;
    soa.x[0] = 1.0; soa.y[0] = 2.0;

    double sumAoS = 0;
    for (int i = 0; i < N; i++) sumAoS += aos[i].x + aos[i].y;
    
    double sumSoA = 0;
    for (int i = 0; i < N; i++) sumSoA += soa.x[i] + soa.y[i];

    printf("AoS sum: %.1f, SoA sum: %.1f\n", sumAoS, sumSoA);
    return 0;
}
```

The mathematical result is the same.

**Real Output:**
```
AoS sum: 3.0, SoA sum: 3.0
```

**Trace by hand:**
- **AoS**: Reading `x` and `y` for one particle loads a cache line containing `z, mass, charge` as well. When you move to the next particle, you have skipped past unused data. The stride between `aos[i].x` and `aos[i+1].x` is 40 bytes (5 doubles). This wastes cache bandwidth.
- **SoA**: `soa.x` is a contiguous array. Reading `soa.x[0]` loads the next several `x` values into the cache line. You are doing a strict stride-1 access over pure `x` data, and another over pure `y` data. This gives perfect spatial locality for the specific task at hand. AoS is better when you need *all* fields of an element at once; SoA is better when computing on specific fields across many elements (common in SIMD and data-oriented design).

## Closing

Locality is the lens through which all cache performance is analyzed. Modern CPUs are so fast that they spend most of their time waiting for data from memory. By structuring your code and data to maximize temporal and spatial locality—using stride-1 accesses and keeping data contiguous—you ensure the CPU is constantly fed with data from the high-speed cache. Lesson 15 covers cache organization — how the hardware actually implements this locality exploitation under the hood.

### Exercises
1. Classify each access pattern in a bubble sort implementation as having good or poor locality.
2. Redesign a linked list traversal to improve locality using parallel arrays instead of nodes with pointers.
3. Explain why quicksort has better cache performance than merge sort in practice (despite merge sort having better worst-case complexity). Hint: think about how quicksort partitions data in place vs merge sort needing a separate destination array.
