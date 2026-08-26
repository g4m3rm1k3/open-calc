# Lesson 17: Optimizing for Cache — Loop Tiling and the Memory Mountain

Series: Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
Module: Module 2 — The Memory Hierarchy

## Terms and Concepts

- **Loop Tiling (Blocking)**: A program transformation that changes the traversal order of loops to operate on small, cache-sized blocks (tiles) of data rather than entire rows or columns.
- **Working Set**: The set of data that a program actively uses during a specific phase of execution.
- **Memory Mountain**: A 2D visualization of memory read throughput as a function of spatial locality (stride) and temporal locality (working set size).
- **Spatial Stride**: The distance in memory (usually measured in bytes or array elements) between successive memory accesses.
- **Throughput**: The rate at which data is read from or written to memory, typically measured in gigabytes per second (GB/s).

## Objects and Methods

- **Tiled Loop Structure**
  - **What it is**: A set of nested loops where the outer loops iterate over tiles (blocks) and the inner loops iterate over the elements within a tile.
  - **Implementation**: Written using loop variables with step sizes equal to the block size (e.g., `for (int ii = 0; ii < N; ii += BLOCK)`).
  - **Its use**: Used to ensure that the working set of the inner loops fits entirely within a specific cache level (usually L1 or L2).
  - **Type**: Code pattern / Loop transformation.
  - **Responsibility**: To maximize cache hits by keeping actively used data in the cache.
  - **Depends on**: The hardware cache size and cache line size.
  - **Connects to**: Matrix multiplication, image processing, and other dense array operations.
  - **Shape**: A deeply nested loop structure, often doubling the depth of the original naive loop.

## Concept Units

### 1. The problem — when working set exceeds cache

When we operate on large datasets, such as matrices, our access patterns dictate how efficiently we use the CPU cache. If our working set exceeds the cache size and we access data with a large stride, we will experience a high number of cache misses.

Let us write a small throwaway lab to illustrate a naive matrix multiplication.

```c
#define N 1024
double A[N][N], B[N][N], C[N][N];  /* 3 * 1024^2 * 8 = 24 MB total */

/* Naive matrix multiply throwaway lab */
void naive_matmul() {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            for (int k = 0; k < N; k++)
                C[i][j] += A[i][k] * B[k][j];
}
```

In this code, we have three matrices of 1024x1024 doubles. A typical L2 cache is 256 KB, but our working set is 24 MB. The loop accesses `A[i][k]` with stride-1 (excellent spatial locality). The loop accesses `C[i][j]` repeatedly in the inner loop (excellent temporal locality). However, `B[k][j]` is accessed by iterating over `k`, meaning we jump down a column. In C, arrays are row-major, so consecutive elements in a column are separated by `N` elements (8192 bytes). This is a massive spatial stride.

For each of the N^2 pairs of (i,j), we read the entire column `j` of B. The cache can only hold a tiny fraction of B (about 3%), so by the time we finish one iteration, everything we cached from B is evicted. We end up loading B from main memory N times.

### 2. Loop tiling — the solution

To solve this, we can use a technique called loop tiling (or blocking). We restructure the loops to process small submatrices (tiles) that easily fit inside the cache.

Let us look at a throwaway lab demonstrating a tiled loop structure.

```c
#define BLOCK 64  /* tile size: 64 * 64 * 8 bytes = 32 KB */

/* Tiled matrix multiply throwaway lab */
void tiled_matmul() {
    for (int ii = 0; ii < N; ii += BLOCK)          /* tile row */
        for (int jj = 0; jj < N; jj += BLOCK)      /* tile col */
            for (int kk = 0; kk < N; kk += BLOCK)  /* tile inner dim */
                /* Process BLOCK x BLOCK submatrices: */
                for (int i = ii; i < ii+BLOCK; i++)
                    for (int j = jj; j < jj+BLOCK; j++)
                        for (int k = kk; k < kk+BLOCK; k++)
                            C[i][j] += A[i][k] * B[k][j];
}
```

With `BLOCK = 64`, a single tile of A, B, and C each takes up 32 KB. The total size is 96 KB, which easily fits inside a 256 KB L2 cache. During the inner triple loop (the `i`, `j`, `k` loops), we are only working with these 64x64 submatrices. The data for these submatrices is loaded into the cache once and then reused extensively without being evicted. This turns cache misses into cache hits.

### 3. Small example — tiling with tiny matrices

To truly understand how this execution flows, let us manually trace a smaller example where N=4 and BLOCK=2.

```c
/* N=4, BLOCK=2 setup */
/* 
C (4x4)  A (4x4)  B (4x4)
[c00 c01 c02 c03]   [a00 a01 a02 a03]   [b00 b01 b02 b03]
[c10 c11 c12 c13] = [a10 a11 a12 a13] * [b10 b11 b12 b13]
[c20 c21 c22 c23]   [a20 a21 a22 a23]   [b20 b21 b22 b23]
[c30 c31 c32 c33]   [a30 a31 a32 a33]   [b30 b31 b32 b33]
*/
```

In the first tiled iteration (ii=0, jj=0, kk=0), we process the top-left 2x2 tiles of A and B to calculate partial sums for the top-left 2x2 tile of C:
- `C[0][0] += A[0][0]*B[0][0] + A[0][1]*B[1][0]`
- `C[0][1] += A[0][0]*B[0][1] + A[0][1]*B[1][1]`
- `C[1][0] += A[1][0]*B[0][0] + A[1][1]*B[1][0]`
- `C[1][1] += A[1][0]*B[0][1] + A[1][1]*B[1][1]`

Then, in the next iteration (ii=0, jj=0, kk=2), we take the next set of tiles (A[0:2][2:4] and B[2:4][0:2]) and add their products to the same C tile:
- `C[0][0] += A[0][2]*B[2][0] + A[0][3]*B[3][0]`
And so on. The key is that the 2x2 tiles stay completely resident in the cache for the entire duration of the block computation.

### 4. The memory mountain — a model for measuring throughput

To understand the impact of working set size and access patterns on performance, computer scientists use a model known as the memory mountain. It graphs memory read throughput as a function of spatial stride and working set size.

```text
                     Read throughput (GB/s)
                      ^
                  15 |*** (registers)        <- plateau: L1 bandwidth
                  12 |   ***                  <- L1 cache
                   8 |      ***               <- L2 cache
                   4 |         ***            <- L3 cache
                   2 |            ***         <- DRAM (large stride)
                   0 +----+----+----+---> Spatial stride (bytes)
                     1    8   64  512
```

Moving left to right across the mountain, the spatial stride increases. As the stride increases, we use less of each fetched cache line, leading to more cache misses and a sharp drop in throughput. Moving from front to back, the working set size increases. As the working set exceeds the capacity of L1, then L2, then L3 caches, throughput forms distinct downward "steps" or ridges. The highest throughput is achieved when the working set fits in L1 and the stride is 1. The lowest is when the working set requires DRAM and the stride is large.

### 5. Tiling analysis — how it improves throughput

Let us analyze how tiling moves our program's performance on the memory mountain.

Without tiling (the naive N=1024 multiply), matrix B is accessed with a spatial stride of 8192 bytes, and the working set is 8 MB. This massive working set and stride places our execution in the deepest valley of the memory mountain, resulting in DRAM throughput (around 2 GB/s).

With tiling (BLOCK=64), matrix B is still accessed in column order within the tile, so the stride between consecutive row elements is still 8192 bytes. However, the working set for the tile is only 32 KB. This means the tile fits comfortably in the L2 cache. Even though the stride is high, the data is served from the L2 cache instead of DRAM, boosting throughput dramatically (e.g., up to 8 GB/s). By shrinking the working set, loop tiling effectively climbs the ridges of the memory mountain.

### 6. Other tiling applications — beyond matrix multiply

Loop tiling is not unique to matrix multiplication. It can be applied to any algorithm where multidimensional data structures are accessed in ways that defy spatial locality. A prime example is matrix transposition.

Here is a throwaway lab for a naive and a tiled matrix transpose.

```c
/* Naive transpose throwaway lab */
void naive_transpose(double src[N][N], double dst[N][N]) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            dst[j][i] = src[i][j];
}

/* Tiled transpose throwaway lab */
void tiled_transpose(double src[N][N], double dst[N][N]) {
    for (int ii = 0; ii < N; ii += BLOCK)
        for (int jj = 0; jj < N; jj += BLOCK)
            for (int i = ii; i < ii+BLOCK; i++)
                for (int j = jj; j < jj+BLOCK; j++)
                    dst[j][i] = src[i][j];
}
```

In the naive transpose, reading from `src` has a perfect stride of 1, but writing to `dst` has a terrible stride of N. With the tiled transpose, both the `src` tile and the `dst` tile fit entirely within the cache. Even though we are writing column-wise to the `dst` tile, those writes hit in the cache because the entire tile is resident, vastly improving overall speed.

### 7. Practical cache optimization guidelines

Now that we understand how the cache interacts with our data, we can form a set of general optimization guidelines.

**Guideline 1: Innermost loop over contiguous data**
Always ensure that the innermost loop iterates over the dimension that changes the fastest in memory. For C arrays (which are row-major), the inner loop should iterate over the columns.

```c
/* Good locality */
for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        a[i][j] = 0;
```

**Guideline 2: Tile large working sets**
When your working set vastly exceeds the size of the cache, restructure your algorithms to process data in cache-sized blocks. A rough heuristic for `BLOCK` size is `cache_line_count^(1/dim)`.

**Guideline 3: Array of Structs vs Struct of Arrays**
If you only need to process specific fields of a data structure, organize your data as a Struct of Arrays (SoA) rather than an Array of Structs (AoS) to maximize spatial locality.

```c
/* Array of Structs (AoS) - Poor spatial locality if only needing 'x' */
struct Point { double x, y, z; };
struct Point pts[N];

/* Struct of Arrays (SoA) - Excellent spatial locality */
double xs[N], ys[N], zs[N];
```

**Guideline 4: Minimize pointer indirection**
Linked lists and tree structures cause unpredictable memory access patterns (pointer chasing), which destroy spatial locality. Whenever possible, use contiguous arrays.

```c
/* Pointer chasing (Bad) */
for (Node *p = head; p; p = p->next) sum += p->val;

/* Contiguous array (Good) */
for (int i = 0; i < N; i++) sum += vals[i];
```

## Closing

Module 2 has one lesson remaining — Lesson 18 covers the memory mountain in detail and consolidates all cache optimization knowledge. Then Module 3 begins: the operating system.

**Exercises**:
1. Determine the optimal BLOCK size for a machine with 32KB L1 cache, 256KB L2, and 64-byte cache lines for tiling a double matrix multiply.
2. Analyze whether bubble sort or merge sort has better cache behavior.
3. Write the tiled version of a matrix-vector product.
