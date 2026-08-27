# Lesson 26: Implementing malloc — Explicit Free Lists and Boundary Tags

What you will build: The reader will implement a minimal but complete heap allocator in C using the boundary-tag method and an explicit free list. The transferable insight: the boundary tag trick (storing block size at BOTH the header and footer) enables O(1) coalescing — a technique that appears in database buffer pools, memory arenas, and buddy allocators.

What you need to know first: Lessons 00-25.

**Terms used in this lesson**
- **Boundary tag** — A technique storing the block's size and allocation status in both a header (before the payload) and a footer (after the payload). This allows constant-time (O(1)) traversal to the previous block in memory, solving the problem of coalescing adjacent free blocks without needing a full heap scan.
- **Explicit free list** — A doubly-linked list woven through the payloads of free blocks. By storing `prev` and `next` pointers within unused payload space, it reduces the time to find a free block from O(total blocks) to O(free blocks).
- **Coalescing** — The process of merging two or more adjacent free memory blocks into a single larger free block. This combats fragmentation by ensuring that large allocation requests can be fulfilled if sufficient contiguous free memory exists.
- **Fragmentation** — The phenomenon where free memory is broken into small, non-contiguous chunks, making it impossible to satisfy a large allocation request despite having enough total free memory.
- **Payload** — The usable memory region returned to the user by `malloc()`, situated between the block's header and footer (if present).
- **Word / Double Word** — System-dependent alignment units. Here, a word is 4 bytes and a double word is 8 bytes, keeping allocations strictly aligned to 8-byte boundaries.

**Objects and methods used**
- **sbrk()**
  - *What it is:* A system call that increments the program's data space, effectively extending the heap.
  - *Implementation:* `void *sbrk(intptr_t increment);`
  - *Its use:* When the explicit free list cannot satisfy an allocation request (no fit found), `mm_malloc` calls `sbrk()` to request a large chunk of fresh memory from the operating system to replenish the heap.
  - *Type:* Standard library system call (function).
  - *Responsibility:* Adjusts the program's break (the end of the heap) by the given increment, allocating or deallocating raw pages of memory from the OS.
  - *Depends on:* An integer increment specifying how many bytes to add to the heap.
  - *Connects to:* Called by the allocator when more space is needed. Communicates directly with the OS kernel.
  - *Shape:* A boundary seam between the user-space runtime environment and the operating system's memory manager.

## Concept Unit: Boundary tags — O(1) bidirectional coalescing
### The Problem
How can we efficiently merge adjacent free memory blocks? If we free a block and the next block is also free, we can easily find it by adding the current block's size to its address. But what if the *previous* block in memory is free? If we only have a header, we would have to start from the very beginning of the heap and traverse block by block just to find the block immediately preceding ours. How can we jump backwards in O(1) time?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define WSIZE 4
#define DSIZE 8
#define PACK(size, alloc)  ((size) | (alloc))
#define GET(p)             (*(unsigned int *)(p))
#define PUT(p, val)        (*(unsigned int *)(p) = (val))
#define GET_SIZE(p)        (GET(p) & ~0x7)
#define GET_ALLOC(p)       (GET(p) & 0x1)

/* Given payload pointer bp: */
#define HDRP(bp)  ((char *)(bp) - WSIZE)
#define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
#define NEXT_BLKP(bp) ((char *)(bp) + GET_SIZE(HDRP(bp)))
#define PREV_BLKP(bp) ((char *)(bp) - GET_SIZE((char *)(bp) - DSIZE))

int main() {
    /* Simulate a small heap slice */
    char heap[128];
    char *bp = heap + 8; /* Assume payload starts at offset 8 */
    
    /* Set up current block at bp: size 32, allocated */
    PUT(HDRP(bp), PACK(32, 1));
    PUT(FTRP(bp), PACK(32, 1));

    /* Set up previous block ending just before bp: size 16, free */
    /* Its footer is right before our header */
    PUT((char *)bp - DSIZE, PACK(16, 0));

    printf("HDRP: %p\n", (void *)HDRP(bp));
    printf("FTRP: %p\n", (void *)FTRP(bp));
    printf("NEXT_BLKP: %p\n", (void *)NEXT_BLKP(bp));
    printf("PREV_BLKP: %p\n", (void *)PREV_BLKP(bp));

    /* Proof of O(1) backward traversal */
    printf("PREV_BLKP size: %u\n", GET_SIZE(HDRP(PREV_BLKP(bp))));
    
    return 0;
}
```
Predicted confidently:
`HDRP` points to `bp - 4`.
`FTRP` points to `bp + 32 - 8 = bp + 24`.
`NEXT_BLKP` points to `bp + 32`.
`PREV_BLKP` points to `bp - 16`.
`PREV_BLKP size: 16`.
This proves that by reading the 4 bytes immediately preceding the current block's header (which is the previous block's footer), we can discover the previous block's size and jump directly to its payload in O(1) time without scanning the heap. This concept is called **boundary tags**.

### Discard the throwaway
This simulated heap code is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are defining the macro layout for our custom allocator.
- **Files affected:** `mm.c` (created).
- **Change type:** add.
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code
```c
/* Block layout:
   [ HEADER: 4 bytes | payload... | FOOTER: 4 bytes ]
   Both header and footer store: (size | alloc_bit)
   Size is always 8-byte aligned so low 3 bits are free for flags */

#define WSIZE 4
#define DSIZE 8
#define PACK(size, alloc)  ((size) | (alloc))
#define GET(p)             (*(unsigned int *)(p))
#define PUT(p, val)        (*(unsigned int *)(p) = (val))
#define GET_SIZE(p)        (GET(p) & ~0x7)
#define GET_ALLOC(p)       (GET(p) & 0x1)

/* Given payload pointer bp: */
#define HDRP(bp)  ((char *)(bp) - WSIZE)
#define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
#define NEXT_BLKP(bp) ((char *)(bp) + GET_SIZE(HDRP(bp)))
#define PREV_BLKP(bp) ((char *)(bp) - GET_SIZE((char *)(bp) - DSIZE))
```

### The Updated Project
```c
1: /* Block layout:
2:    [ HEADER: 4 bytes | payload... | FOOTER: 4 bytes ]
3:    Both header and footer store: (size | alloc_bit)
4:    Size is always 8-byte aligned so low 3 bits are free for flags */
5: 
6: // ← new
7: #define WSIZE 4
8: #define DSIZE 8
9: #define PACK(size, alloc)  ((size) | (alloc))
10: #define GET(p)             (*(unsigned int *)(p))
11: #define PUT(p, val)        (*(unsigned int *)(p) = (val))
12: #define GET_SIZE(p)        (GET(p) & ~0x7)
13: #define GET_ALLOC(p)       (GET(p) & 0x1)
14: 
15: /* Given payload pointer bp: */
16: #define HDRP(bp)  ((char *)(bp) - WSIZE)
17: #define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
18: #define NEXT_BLKP(bp) ((char *)(bp) + GET_SIZE(HDRP(bp)))
19: #define PREV_BLKP(bp) ((char *)(bp) - GET_SIZE((char *)(bp) - DSIZE))
```
These macros establish the memory layout and provide the foundational operations to read, write, and traverse block metadata in O(1) time.

### Mechanical walkthrough
- `#define WSIZE 4` defines the size of a word (header/footer size) in bytes.
- `#define DSIZE 8` defines the size of a double word in bytes (used for strict alignment).
- `#define PACK(size, alloc) ((size) | (alloc))` is a bitwise OR macro that merges the block size and allocation bit into a single integer. Because sizes are multiples of 8, the lowest 3 bits are always 0, making them safe to store boolean flags.
- `#define GET(p) (*(unsigned int *)(p))` casts a void/char pointer `p` to an unsigned integer pointer and dereferences it, reading 4 bytes of memory at that address.
- `#define PUT(p, val) (*(unsigned int *)(p) = (val))` writes a 4-byte value to the memory address `p`.
- `#define GET_SIZE(p) (GET(p) & ~0x7)` reads the 4 bytes at `p` and masks off the lowest 3 bits using bitwise AND with `~0x7` (which is `...11111000` in binary), extracting just the size.
- `#define GET_ALLOC(p) (GET(p) & 0x1)` extracts only the lowest bit to determine if the block is allocated (1) or free (0).
- `#define HDRP(bp) ((char *)(bp) - WSIZE)` computes the header address by moving backward 4 bytes from the payload pointer `bp`.
- `#define FTRP(bp)` computes the footer address. It finds the block size via `GET_SIZE(HDRP(bp))`, adds it to `bp`, and subtracts `DSIZE` (8 bytes) to land exactly at the footer.
- `#define NEXT_BLKP(bp)` computes the address of the next block's payload by adding the current block's total size to the current payload pointer.
- `#define PREV_BLKP(bp)` calculates the previous block's payload address. It steps back `DSIZE` (8 bytes) to read the previous block's footer, extracts its size, and steps backward by that amount to find the start of the previous payload.

### CS lens
**Constant-Time Metadata Queries.** Boundary tags are an implementation of constant-time metadata retrieval. By embedding metadata predictably adjacent to the payload, we eliminate the need for search operations. This concept appears in file system inodes (where metadata sits at known disk offsets), network packet headers/footers (like Ethernet frames), and database buffer pool page headers (where LRU status is encoded at the exact start of a page frame).

### SE lens
**Space vs. Time Tradeoff.** The design choice to include a footer explicitly trades space (4 bytes per block) for speed (O(1) coalescing). The alternative NOT chosen is an implicit free list with no footers, where finding the previous free block requires an O(N) forward scan from the beginning of the heap. For programs making many small allocations, those 4 bytes add up to high fragmentation overhead, but the resulting allocation and free throughput is vastly improved.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The macros perform basic pointer arithmetic and bitwise operations. When correctly fed a payload pointer, `HDRP` and `FTRP` resolve to the exact 4-byte boundaries surrounding the payload.

### One sentence connecting to previous unit
With boundary tags allowing us to step backwards in memory, we need a way to track the free blocks themselves without scanning allocated memory.

## Concept Unit: Explicit free list — doubly linked list inside free blocks
### The Problem
If we only use block sizes to traverse memory, `find_fit` must scan every single block (allocated and free) sequentially. How can we jump only between *free* blocks? If a block is free, its payload space is unused. What could we store inside that unused space to speed up our search?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define PREV_FREE(bp) (*(char **)(bp))
#define NEXT_FREE(bp) (*(char **)((char *)(bp) + 8))

static char *free_listp = NULL;

static void insert_free(char *bp) {
    NEXT_FREE(bp) = free_listp;
    PREV_FREE(bp) = NULL;
    if (free_listp)
        PREV_FREE(free_listp) = bp;
    free_listp = bp;
}

int main() {
    char block1[32]; /* Simulated free block */
    char block2[32]; /* Simulated free block */

    char *bp1 = block1 + 8;
    char *bp2 = block2 + 8;

    insert_free(bp1);
    printf("List head after insert bp1: %p\n", (void *)free_listp);
    
    insert_free(bp2);
    printf("List head after insert bp2: %p\n", (void *)free_listp);
    printf("bp2 NEXT_FREE: %p\n", (void *)NEXT_FREE(bp2));
    printf("bp1 PREV_FREE: %p\n", (void *)PREV_FREE(bp1));

    return 0;
}
```
Predicted confidently:
`List head after insert bp1` points to `bp1`.
`List head after insert bp2` points to `bp2`.
`bp2 NEXT_FREE` points to `bp1`.
`bp1 PREV_FREE` points to `bp2`.
This proves that by treating the first 16 bytes of the payload as `prev` and `next` pointers, we can construct a doubly linked list without allocating external node structures. This concept is called an **explicit free list**.

### Discard the throwaway
This test script is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are continuing the custom allocator design.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** Below the macros added in the previous unit.
- **Dependencies:** The macros from the boundary tags unit.

### The New Code
```c
/* Free block stores prev/next pointers inside its payload: */
/* [ HEADER | PREV_PTR (8B) | NEXT_PTR (8B) | ... | FOOTER ] */
/* Minimum free block size: 4 + 8 + 8 + 4 = 24 bytes */

static char *free_listp = NULL;  /* head of explicit free list */

#define PREV_FREE(bp) (*(char **)(bp))
#define NEXT_FREE(bp) (*(char **)((char *)(bp) + 8))

static void insert_free(char *bp) {
    NEXT_FREE(bp) = free_listp;
    PREV_FREE(bp) = NULL;
    if (free_listp)
        PREV_FREE(free_listp) = bp;
    free_listp = bp;
}

static void remove_free(char *bp) {
    if (PREV_FREE(bp))
        NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);
    else
        free_listp = NEXT_FREE(bp);
    if (NEXT_FREE(bp))
        PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);
}
```

### The Updated Project
```c
18: #define NEXT_BLKP(bp) ((char *)(bp) + GET_SIZE(HDRP(bp)))
19: #define PREV_BLKP(bp) ((char *)(bp) - GET_SIZE((char *)(bp) - DSIZE))
20: 
21: // ← new
22: /* Free block stores prev/next pointers inside its payload: */
23: /* [ HEADER | PREV_PTR (8B) | NEXT_PTR (8B) | ... | FOOTER ] */
24: /* Minimum free block size: 4 + 8 + 8 + 4 = 24 bytes */
25: 
26: static char *free_listp = NULL;  /* head of explicit free list */
27: 
28: #define PREV_FREE(bp) (*(char **)(bp))
29: #define NEXT_FREE(bp) (*(char **)((char *)(bp) + 8))
30: 
31: static void insert_free(char *bp) {
32:     NEXT_FREE(bp) = free_listp;
33:     PREV_FREE(bp) = NULL;
34:     if (free_listp)
35:         PREV_FREE(free_listp) = bp;
36:     free_listp = bp;
37: }
38: 
39: static void remove_free(char *bp) {
40:     if (PREV_FREE(bp))
41:         NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);
42:     else
43:         free_listp = NEXT_FREE(bp);
44:     if (NEXT_FREE(bp))
45:         PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);
46: }
```
These methods manage a doubly linked list of free blocks, allowing O(1) insertion at the head and O(1) removal of any known free block.

### Mechanical walkthrough
- `static char *free_listp = NULL;` creates a global pointer to track the head of the free list.
- `#define PREV_FREE(bp) (*(char **)(bp))` casts the payload pointer `bp` to a pointer-to-pointer and dereferences it, treating the first 8 bytes of the payload as the "previous" pointer.
- `#define NEXT_FREE(bp) (*(char **)((char *)(bp) + 8))` adds 8 bytes to `bp`, casts it, and dereferences it, treating the next 8 bytes as the "next" pointer.
- `static void insert_free(char *bp)` defines a function to insert a block at the head of the list.
- `NEXT_FREE(bp) = free_listp;` links the new block's next pointer to the current list head.
- `PREV_FREE(bp) = NULL;` sets the new block's prev pointer to null since it is the new head.
- `if (free_listp)` checks if the list wasn't empty.
- `PREV_FREE(free_listp) = bp;` updates the old head's prev pointer to point to the new block.
- `free_listp = bp;` reassigns the global head pointer to the new block.
- `static void remove_free(char *bp)` defines a function to unlink a block from the list.
- `if (PREV_FREE(bp))` checks if the block has a predecessor.
- `NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);` bypasses the block by linking the predecessor directly to the successor.
- `else free_listp = NEXT_FREE(bp);` updates the head pointer if the block was the head.
- `if (NEXT_FREE(bp))` checks if the block has a successor.
- `PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);` links the successor's prev pointer back to the predecessor.

### CS lens
**Data Structure Overlay.** An explicit free list relies on overlaying a linked list node onto memory that is currently not being used for its primary purpose (user payload). This identical technique appears in object pools, slab allocators in the Linux kernel, and free-lists in language garbage collectors (like Python's `id()` reuse), turning inactive data regions into metadata routing.

### SE lens
**Inline Allocation vs. External Allocation.** The design principle is avoiding out-of-band management structures. The alternative NOT chosen is allocating a separate `struct Node` for every free block using a separate memory pool. The tradeoff is that the minimum block size increases to 24 bytes (Header + Prev + Next + Footer) to fit the pointers, meaning a `malloc(1)` will waste 23 bytes of space to maintain the list structure.

### Commands needed
None for this unit.

### Run it
Predicted confidently: As traced above, inserting two blocks makes the last-inserted block the head, its `NEXT_FREE` pointing to the first block. Removing a block successfully splices the `PREV` and `NEXT` pointers around it.

### One sentence connecting to previous unit
Now that we have boundary tags to merge blocks and a free list to track them, we can build the core allocation logic that finds and claims space.

## Concept Unit: mm_malloc — find, split, extend heap
### The Problem
When a program calls `malloc()`, we need to find a block large enough. If we find a 1000-byte block for a 16-byte request, how do we avoid wasting the remaining 984 bytes? If no block is large enough, how do we get more memory from the system?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stddef.h>

/* Mock size calculations */
size_t compute_asize(size_t req_size) {
    size_t asize = (req_size + 15) & ~7U;
    if (asize < 24) asize = 24;
    return asize;
}

int main() {
    printf("Request 1 -> Aligned Size: %zu\n", compute_asize(1));
    printf("Request 12 -> Aligned Size: %zu\n", compute_asize(12));
    printf("Request 32 -> Aligned Size: %zu\n", compute_asize(32));
    return 0;
}
```
Predicted confidently:
`Request 1 -> Aligned Size: 24` (due to minimum block size).
`Request 12 -> Aligned Size: 24`.
`Request 32 -> Aligned Size: 40` (32 payload + 8 overhead, perfectly aligned).
This proves that our allocator must pad requests to maintain 8-byte alignment and enforce the 24-byte minimum size needed to hold the explicit free list pointers when the block is eventually freed. This alignment process prepares the input for the **first-fit search and split**.

### Discard the throwaway
This size computation script is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — custom allocator logic.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** Below `remove_free()`.
- **Dependencies:** `<unistd.h>` for `sbrk()`, `<string.h>`.

### The New Code
```c
#include <unistd.h>
#include <string.h>

static char *heap_start;

static char *find_fit(size_t asize) {
    char *bp;
    for (bp = free_listp; bp != NULL; bp = NEXT_FREE(bp))
        if (GET_SIZE(HDRP(bp)) >= asize)
            return bp;
    return NULL;
}

static void place(char *bp, size_t asize) {
    size_t csize = GET_SIZE(HDRP(bp));
    remove_free(bp);
    if (csize - asize >= 24) {
        PUT(HDRP(bp), PACK(asize, 1));
        PUT(FTRP(bp), PACK(asize, 1));
        char *next = NEXT_BLKP(bp);
        PUT(HDRP(next), PACK(csize - asize, 0));
        PUT(FTRP(next), PACK(csize - asize, 0));
        insert_free(next);
    } else {
        PUT(HDRP(bp), PACK(csize, 1));
        PUT(FTRP(bp), PACK(csize, 1));
    }
}

void *mm_malloc(size_t size) {
    if (size == 0) return NULL;
    size_t asize = (size + 15) & ~7U;
    if (asize < 24) asize = 24;
    char *bp = find_fit(asize);
    if (bp) { place(bp, asize); return bp; }
    size_t extsize = asize > 4096 ? asize : 4096;
    bp = sbrk(extsize);
    if (bp == (char *)-1) return NULL;
    PUT(HDRP(bp), PACK(extsize, 0));
    PUT(FTRP(bp), PACK(extsize, 0));
    insert_free(bp);
    place(bp, asize);
    return bp;
}
```

### The Updated Project
```c
45:         PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);
46: }
47: 
48: // ← new
49: #include <unistd.h>
50: #include <string.h>
51: 
52: static char *heap_start;
53: 
54: static char *find_fit(size_t asize) {
55:     char *bp;
56:     for (bp = free_listp; bp != NULL; bp = NEXT_FREE(bp))
57:         if (GET_SIZE(HDRP(bp)) >= asize)
58:             return bp;
59:     return NULL;
60: }
61: 
62: static void place(char *bp, size_t asize) {
63:     size_t csize = GET_SIZE(HDRP(bp));
64:     remove_free(bp);
65:     if (csize - asize >= 24) {
66:         PUT(HDRP(bp), PACK(asize, 1));
67:         PUT(FTRP(bp), PACK(asize, 1));
68:         char *next = NEXT_BLKP(bp);
69:         PUT(HDRP(next), PACK(csize - asize, 0));
70:         PUT(FTRP(next), PACK(csize - asize, 0));
71:         insert_free(next);
72:     } else {
73:         PUT(HDRP(bp), PACK(csize, 1));
74:         PUT(FTRP(bp), PACK(csize, 1));
75:     }
76: }
77: 
78: void *mm_malloc(size_t size) {
79:     if (size == 0) return NULL;
80:     size_t asize = (size + 15) & ~7U;
81:     if (asize < 24) asize = 24;
82:     char *bp = find_fit(asize);
83:     if (bp) { place(bp, asize); return bp; }
84:     size_t extsize = asize > 4096 ? asize : 4096;
85:     bp = sbrk(extsize);
86:     if (bp == (char *)-1) return NULL;
87:     PUT(HDRP(bp), PACK(extsize, 0));
88:     PUT(FTRP(bp), PACK(extsize, 0));
89:     insert_free(bp);
90:     place(bp, asize);
91:     return bp;
92: }
```
These functions implement the core allocation logic: finding a suitable free block, splitting it if it's too large, and requesting more memory from the system when all free blocks are too small.

### Mechanical walkthrough
- `#include <unistd.h>` includes standard UNIX OS APIs, explicitly giving us access to `sbrk()`.
- `#include <string.h>` is included for future `memset`/`memcpy` operations typical in allocators.
- `static char *heap_start;` declares a global pointer to track the beginning of the heap.
- `static char *find_fit(size_t asize)` declares a helper function taking the aligned request size.
- `for (bp = free_listp; bp != NULL; bp = NEXT_FREE(bp))` iterates over the explicit free list.
- `if (GET_SIZE(HDRP(bp)) >= asize) return bp;` returns the first block that is large enough (First-Fit).
- `static void place(char *bp, size_t asize)` declares a function to mark a block as allocated and split it if needed.
- `size_t csize = GET_SIZE(HDRP(bp));` stores the current total size of the block.
- `remove_free(bp);` unlinks the block from the free list since we are about to use it.
- `if (csize - asize >= 24)` checks if the remainder of the block is large enough to form a new valid free block.
- `PUT(HDRP(bp), PACK(asize, 1)); PUT(FTRP(bp), PACK(asize, 1));` updates the current block's boundaries to just the requested size and marks it allocated.
- `char *next = NEXT_BLKP(bp);` computes a pointer to the new remainder block.
- `PUT(HDRP(next), PACK(csize - asize, 0)); PUT(FTRP(next), PACK(csize - asize, 0));` formats the remainder block's boundaries with the leftover size and marks it free.
- `insert_free(next);` adds the newly created remainder block to the explicit free list.
- `else PUT(...)` (the else branch) allocates the entire block without splitting because the remainder would be too small to be a valid free block.
- `void *mm_malloc(size_t size)` is the main API function.
- `if (size == 0) return NULL;` handles the edge case of a zero-byte request.
- `size_t asize = (size + 15) & ~7U;` rounds the request size up to the nearest multiple of 8 (8 bytes for header/footer, plus alignment).
- `if (asize < 24) asize = 24;` enforces the minimum block size of 24 bytes to hold list pointers.
- `char *bp = find_fit(asize);` attempts to find an existing free block.
- `if (bp) { place(bp, asize); return bp; }` if found, splits it, allocates it, and returns it to the user.
- `size_t extsize = asize > 4096 ? asize : 4096;` determines how much to ask the OS for — at least 4KB to minimize system calls.
- `bp = sbrk(extsize);` calls the OS to expand the heap by `extsize` bytes.
- `if (bp == (char *)-1) return NULL;` handles the out-of-memory error from the OS.
- `PUT(HDRP(bp), ...); PUT(FTRP(bp), ...);` formats the newly acquired raw memory as a single large free block.
- `insert_free(bp);` adds this new massive block to the free list.
- `place(bp, asize);` runs the standard split logic on the new block, claiming what we need and leaving the rest on the free list.
- `return bp;` hands the allocated payload pointer back to the user.

### CS lens
**First-Fit Search.** `find_fit` stops at the very first block large enough to hold the request. This CS concept favors speed (searching stops early) over finding the tightest possible fit (Best-Fit, which minimizes immediate waste but requires full list traversal). First-Fit is commonly found in older OS memory managers and real-time systems where bounded execution time matters more than optimal space usage.

### SE lens
**Batching System Calls.** When `malloc` fails to find a fit, it doesn't just ask `sbrk` for exactly `asize` bytes; it asks for a minimum of 4096 bytes (a standard OS page). The design principle is batching expensive boundary crossings. The alternative NOT chosen is making an `sbrk` call for exactly the bytes needed every time. The tradeoff is that the allocator hoards OS memory it isn't strictly using yet, in exchange for avoiding a context switch to the kernel on the very next allocation.

### Commands needed
None for this unit.

### Run it
Predicted confidently: If `mm_malloc(32)` is called, `asize` becomes 40. `find_fit` returns `NULL` on an empty list. `sbrk(4096)` runs. A 4096-byte free block is inserted. `place(bp, 40)` splits it: block 1 is 40 bytes (allocated), block 2 is 4056 bytes (free, inserted into list).

### One sentence connecting to previous unit
We can now allocate memory and split blocks, but without a way to return them, our heap will grow indefinitely.

## Concept Unit: mm_free — mark free and coalesce
### The Problem
When the user calls `free()`, we mark the block as free and put it back on the explicit list. But if the blocks physically before or after it in memory are *also* free, we now have adjacent small free blocks instead of one large one. How do we detect this and merge them back together?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define PACK(size, alloc)  ((size) | (alloc))

int main() {
    /* Simulate coalescing logic math */
    int current_size = 40;
    int next_size = 64;
    
    printf("Freeing block of size %d...\n", current_size);
    printf("Next block in memory is free, size: %d\n", next_size);
    
    int new_size = current_size + next_size;
    printf("New coalesced size: %d\n", new_size);
    printf("New Header: PACK(%d, 0)\n", new_size);
    
    return 0;
}
```
Predicted confidently:
`Freeing block of size 40...`
`Next block in memory is free, size: 64`
`New coalesced size: 104`
`New Header: PACK(104, 0)`
This proves that merging adjacent blocks simply requires adding their sizes and writing a single new header and footer across the entire span. This concept is called **coalescing**.

### Discard the throwaway
This coalescing math throwaway is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — custom allocator logic.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** Below `mm_malloc`.
- **Dependencies:** The boundary tag macros and explicit free list methods.

### The New Code
```c
static char *coalesce(char *bp) {
    int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));
    int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));
    size_t size = GET_SIZE(HDRP(bp));

    if (prev_alloc && next_alloc) {           /* Case 1 */
        insert_free(bp);
        return bp;
    } else if (prev_alloc && !next_alloc) {   /* Case 2: merge with next */
        size += GET_SIZE(HDRP(NEXT_BLKP(bp)));
        remove_free(NEXT_BLKP(bp));
        PUT(HDRP(bp), PACK(size, 0));
        PUT(FTRP(bp), PACK(size, 0));
        insert_free(bp);
    } else if (!prev_alloc && next_alloc) {   /* Case 3: merge with prev */
        size += GET_SIZE(HDRP(PREV_BLKP(bp)));
        remove_free(PREV_BLKP(bp));
        bp = PREV_BLKP(bp);
        PUT(HDRP(bp), PACK(size, 0));
        PUT(FTRP(bp), PACK(size, 0));
        insert_free(bp);
    } else {                                   /* Case 4: merge both */
        size += GET_SIZE(HDRP(PREV_BLKP(bp)))
             +  GET_SIZE(HDRP(NEXT_BLKP(bp)));
        remove_free(PREV_BLKP(bp));
        remove_free(NEXT_BLKP(bp));
        bp = PREV_BLKP(bp);
        PUT(HDRP(bp), PACK(size, 0));
        PUT(FTRP(bp), PACK(size, 0));
        insert_free(bp);
    }
    return bp;
}

void mm_free(void *ptr) {
    if (!ptr) return;
    char *bp = ptr;
    size_t size = GET_SIZE(HDRP(bp));
    PUT(HDRP(bp), PACK(size, 0));
    PUT(FTRP(bp), PACK(size, 0));
    coalesce(bp);
}
```

### The Updated Project
```c
93: 
94: // ← new
95: static char *coalesce(char *bp) {
96:     int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));
97:     int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));
98:     size_t size = GET_SIZE(HDRP(bp));
99: 
100:     if (prev_alloc && next_alloc) {           /* Case 1 */
101:         insert_free(bp);
102:         return bp;
103:     } else if (prev_alloc && !next_alloc) {   /* Case 2: merge with next */
104:         size += GET_SIZE(HDRP(NEXT_BLKP(bp)));
105:         remove_free(NEXT_BLKP(bp));
106:         PUT(HDRP(bp), PACK(size, 0));
107:         PUT(FTRP(bp), PACK(size, 0));
108:         insert_free(bp);
109:     } else if (!prev_alloc && next_alloc) {   /* Case 3: merge with prev */
110:         size += GET_SIZE(HDRP(PREV_BLKP(bp)));
111:         remove_free(PREV_BLKP(bp));
112:         bp = PREV_BLKP(bp);
113:         PUT(HDRP(bp), PACK(size, 0));
114:         PUT(FTRP(bp), PACK(size, 0));
115:         insert_free(bp);
116:     } else {                                   /* Case 4: merge both */
117:         size += GET_SIZE(HDRP(PREV_BLKP(bp)))
118:              +  GET_SIZE(HDRP(NEXT_BLKP(bp)));
119:         remove_free(PREV_BLKP(bp));
120:         remove_free(NEXT_BLKP(bp));
121:         bp = PREV_BLKP(bp);
122:         PUT(HDRP(bp), PACK(size, 0));
123:         PUT(FTRP(bp), PACK(size, 0));
124:         insert_free(bp);
125:     }
126:     return bp;
127: }
128: 
129: void mm_free(void *ptr) {
130:     if (!ptr) return;
131:     char *bp = ptr;
132:     size_t size = GET_SIZE(HDRP(bp));
133:     PUT(HDRP(bp), PACK(size, 0));
134:     PUT(FTRP(bp), PACK(size, 0));
135:     coalesce(bp);
136: }
```
These functions take an allocated block, unmark it, and merge it with its immediate physical neighbors in memory if they are also free, placing the final chunk onto the free list.

### Mechanical walkthrough
- `static char *coalesce(char *bp)` declares the coalescing helper function.
- `int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));` uses boundary tags to jump to the previous block's header and check its allocated bit.
- `int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));` jumps to the next block's header and checks its allocated bit.
- `size_t size = GET_SIZE(HDRP(bp));` stores the current block's size.
- `if (prev_alloc && next_alloc)` handles Case 1: both neighbors are allocated, so we cannot merge.
- `insert_free(bp); return bp;` drops the isolated block directly into the explicit free list.
- `else if (prev_alloc && !next_alloc)` handles Case 2: the block physically *after* us is free.
- `size += GET_SIZE(HDRP(NEXT_BLKP(bp)));` adds the next block's size to our total.
- `remove_free(NEXT_BLKP(bp));` unlinks the next block from the explicit free list because it is being absorbed.
- `PUT(HDRP(bp), PACK(size, 0)); PUT(FTRP(bp), PACK(size, 0));` rewrites the current block's header and the *next* block's footer to encompass the combined size.
- `insert_free(bp);` links the new combined block into the list.
- `else if (!prev_alloc && next_alloc)` handles Case 3: the block physically *before* us is free.
- `size += GET_SIZE(HDRP(PREV_BLKP(bp)));` adds the previous block's size to our total.
- `remove_free(PREV_BLKP(bp));` unlinks the previous block from the list.
- `bp = PREV_BLKP(bp);` shifts our pointer backwards, since the new combined block starts where the previous block started.
- `PUT(HDRP(bp), PACK(size, 0)); PUT(FTRP(bp), PACK(size, 0));` writes the new boundaries.
- `insert_free(bp);` links the combined block into the list.
- `else` handles Case 4: both neighbors are free.
- `size += GET_SIZE(...) + GET_SIZE(...);` sums all three block sizes.
- `remove_free(PREV_BLKP(bp)); remove_free(NEXT_BLKP(bp));` removes both neighbors from the list.
- `bp = PREV_BLKP(bp);` shifts the pointer to the previous block's start.
- `PUT(HDRP(bp), PACK(size, 0)); PUT(FTRP(bp), PACK(size, 0));` spans the header/footer across all three original blocks.
- `insert_free(bp);` inserts the massive combined block.
- `return bp;` returns the resulting pointer.
- `void mm_free(void *ptr)` implements the standard library `free` signature.
- `if (!ptr) return;` safely ignores null pointers.
- `char *bp = ptr;` sets up the payload pointer.
- `size_t size = GET_SIZE(HDRP(bp));` retrieves the size of the block being freed.
- `PUT(HDRP(bp), PACK(size, 0)); PUT(FTRP(bp), PACK(size, 0));` clears the allocated bits to 0.
- `coalesce(bp);` immediately triggers the merge logic to fight fragmentation.

### CS lens
**State Space Reduction.** Coalescing immediately upon `free()` enforces a strict invariant: no two contiguous free blocks ever exist in the heap. This simplifies the search space and ensures that the allocator can always fulfill an allocation up to the largest physically available span. Without it, the heap would suffer catastrophic **external fragmentation**, accumulating tiny free chunks that cannot satisfy larger requests.

### SE lens
**Deferred vs. Immediate Cleanup.** The design principle is eager maintenance. The alternative NOT chosen is deferred coalescing, where `free()` just flips a bit, and a separate pass sweeps the heap to merge blocks only when `find_fit` fails. The tradeoff is that immediate coalescing makes `free()` slightly slower (more O(1) operations per call), but prevents latency spikes during `malloc()`.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Freeing a 40-byte block located at `0x1028` when the next block at `0x1050` is a 64-byte free block (Case 2) results in a single 104-byte block. The header at `0x1024` and the footer at `0x108C` are updated to `104 | 0`. The old 64-byte block is unlinked, and the new 104-byte block is inserted into the free list.

### One sentence connecting to previous unit
We've successfully built an allocator that efficiently reuses memory, but we need to analyze how much overhead our design choices cost us.

## Concept Unit: Utilization vs throughput tradeoff
### The Problem
Our allocator uses 8 bytes of metadata (header and footer) for every single block, plus alignment padding. If a user allocates 8 bytes, we give them a 24-byte block. Does this make our allocator "bad"? How do we measure the balance between speed and wasted space?

### Introduce the concept in isolation
```c
#include <stdio.h>

struct stats {
    unsigned long allocs;
    unsigned long frees;
    unsigned long heap_size;
    unsigned long payload_bytes;
};

int main() {
    /* Simulate utilization */
    unsigned long payload = 8;
    unsigned long actual_block = 24; // 8 byte payload + 8 byte boundary tags + padding
    
    double util1 = (double)payload / actual_block;
    printf("malloc(8) utilization: %.1f%%\n", util1 * 100);
    
    payload = 1000;
    actual_block = 1008; // 1000 payload + 8 byte overhead
    
    double util2 = (double)payload / actual_block;
    printf("malloc(1000) utilization: %.1f%%\n", util2 * 100);
    
    return 0;
}
```
Predicted confidently:
`malloc(8) utilization: 33.3%`
`malloc(1000) utilization: 99.2%`
This proves that fixed-size overhead disproportionately punishes small allocations. We define **utilization** as the fraction of the heap actually holding requested user data.

### Discard the throwaway
This statistics simulation is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — conceptual documentation.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```c
/*
 * THROUGHPUT vs UTILIZATION TRADEOFF
 *
 * Explicit free list (this implementation):
 *   find_fit: O(free_blocks) — only traverses free blocks
 *   place:    O(1) — split is O(1)
 *   coalesce: O(1) — boundary tags make prev-block access O(1)
 *   Overall:  fast allocation
 *
 * Implicit free list (simpler):
 *   find_fit: O(total_blocks) — traverses ALL blocks
 *   Slower for fragmented heaps with many small allocated blocks
 *
 * Segregated free lists (glibc ptmalloc2):
 *   Separate free list per size class (8, 16, 24, ..., 512+)
 *   find_fit: O(1) amortized — pick size class, pop head
 *   Best throughput; higher implementation complexity
 *
 * Boundary tag overhead:
 *   8 bytes per block (4-byte header + 4-byte footer)
 *   malloc(8):    block=24 bytes, utilization = 8/24 = 33%
 *   malloc(1000): block=1008 bytes, utilization = 1000/1008 = 99.2%
 *   Small allocations pay a heavy overhead tax
 *
 * Optimization: omit footer for ALLOCATED blocks
 *   Encode prev_alloc bit in current block's header
 *   Free blocks still need footer for PREV_BLKP
 *   Reduces overhead to 4 bytes for allocated blocks
 */
struct stats {
    unsigned long allocs;
    unsigned long frees;
    unsigned long heap_size;
    unsigned long payload_bytes;
};
/* utilization = payload_bytes / heap_size */
```

### The Updated Project
```c
136: }
137: 
138: // ← new
139: /*
140:  * THROUGHPUT vs UTILIZATION TRADEOFF
141:  *
142:  * Explicit free list (this implementation):
143:  *   find_fit: O(free_blocks) — only traverses free blocks
144:  *   place:    O(1) — split is O(1)
145:  *   coalesce: O(1) — boundary tags make prev-block access O(1)
146:  *   Overall:  fast allocation
147:  *
148:  * Implicit free list (simpler):
149:  *   find_fit: O(total_blocks) — traverses ALL blocks
150:  *   Slower for fragmented heaps with many small allocated blocks
151:  *
152:  * Segregated free lists (glibc ptmalloc2):
153:  *   Separate free list per size class (8, 16, 24, ..., 512+)
154:  *   find_fit: O(1) amortized — pick size class, pop head
155:  *   Best throughput; higher implementation complexity
156:  *
157:  * Boundary tag overhead:
158:  *   8 bytes per block (4-byte header + 4-byte footer)
159:  *   malloc(8):    block=24 bytes, utilization = 8/24 = 33%
160:  *   malloc(1000): block=1008 bytes, utilization = 1000/1008 = 99.2%
161:  *   Small allocations pay a heavy overhead tax
162:  *
163:  * Optimization: omit footer for ALLOCATED blocks
164:  *   Encode prev_alloc bit in current block's header
165:  *   Free blocks still need footer for PREV_BLKP
166:  *   Reduces overhead to 4 bytes for allocated blocks
167:  */
168: struct stats {
169:     unsigned long allocs;
170:     unsigned long frees;
171:     unsigned long heap_size;
172:     unsigned long payload_bytes;
173: };
174: /* utilization = payload_bytes / heap_size */
```
This conceptual mapping explicitly records the engineering realities of our allocator design.

### Mechanical walkthrough
- `/* THROUGHPUT vs UTILIZATION TRADEOFF */` opens a multi-line comment block.
- `Explicit free list (this implementation):` outlines our exact current state.
- `find_fit: O(free_blocks)` states that search speed depends strictly on the number of available free blocks, skipping allocated ones.
- `place: O(1)` and `coalesce: O(1)` recap that boundary manipulation requires no looping.
- `Implicit free list (simpler):` discusses the naive alternative.
- `find_fit: O(total_blocks)` notes the fatal flaw of implicit lists: scanning allocated blocks wastes cycles.
- `Segregated free lists (glibc ptmalloc2):` touches upon production allocator architecture, where independent lists isolate blocks by specific size classes.
- `find_fit: O(1) amortized` explains that segregated lists effectively remove the search loop entirely by pre-sorting.
- `Boundary tag overhead:` highlights our spatial weakness.
- `malloc(8): block=24 bytes, utilization = 8/24 = 33%` gives a hard metric for the cost of boundary tags on small allocations.
- `Optimization: omit footer for ALLOCATED blocks` presents the standard mitigation technique used by production allocators.
- `struct stats { ... };` defines a C struct.
- `unsigned long allocs;` declares a counter for total allocations.
- `unsigned long frees;` declares a counter for total frees.
- `unsigned long heap_size;` tracks the high-water mark of memory requested from the OS.
- `unsigned long payload_bytes;` tracks exactly how many bytes the user actually asked for.
- `/* utilization = payload_bytes / heap_size */` establishes the final mathematical relationship evaluating the allocator.

### CS lens
**Algorithmic Overhead vs System Limits.** The tension between throughput (instructions executed to satisfy a request) and utilization (bytes retained versus bytes delivered) is central to systems programming. Segregated free lists maximize throughput but can fragment memory across many lists (lowering utilization). Implicit lists minimize overhead (maximizing utilization) but destroy throughput. Our explicit list balances the two, a common CS compromise.

### SE lens
**The "Good Enough" Optimization.** The principle is designing for the expected workload. The alternative NOT chosen is implementing the footer-omission optimization immediately. The tradeoff is that omitting the footer for allocated blocks requires stealing another flag bit from the header to store the `prev_alloc` status, significantly increasing the complexity of every split and coalesce operation to save just 4 bytes per block.

### Commands needed
None for this unit.

### Run it
Predicted confidently: No executable code changed, but logging the utilization for a sequence of small allocations (e.g., repeatedly calling `malloc(8)`) would yield 33%. Releasing those allocations via `free()` triggers coalescing, restoring the heap to a single large block and preventing long-term fragmentation waste.

### One sentence connecting to previous unit
The allocator is complete, and understanding its tradeoffs prepares us for diagnosing memory bottlenecks in the real world.

## Closing
### Connect the pieces
You have implemented a complete heap allocator. Let's trace one full cycle: a call to `malloc(32)` pads the request to 40 bytes to ensure room for metadata. `find_fit` traverses the explicit free list via the payload pointers, locating a large 4096-byte chunk. `place` updates the boundaries, slicing off 40 bytes for the user and rewriting the remaining 4056 bytes' boundary tags before reinserting it into the list. When `free()` is later called on that 40-byte block, the system immediately reads the boundary tags of its physical neighbors. Seeing that the 4056-byte chunk is still free, it coalesces them back into a single 4096-byte block in O(1) time, ensuring no memory is lost to external fragmentation. 

Boundary tags trade 8 bytes per block for O(1) coalescing — the same time-space tradeoff seen in doubly-linked lists, B-trees, and every allocator from kernel slabs to database buffer pools. Lesson 27 covers linking — how object files are combined into executables.
