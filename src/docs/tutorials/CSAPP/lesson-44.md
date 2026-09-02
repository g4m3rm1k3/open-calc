# Lesson 44: Capstone — A Complete Heap Allocator in C

What you will build: A complete, working heap allocator in a single file `mm.c`, using the explicit free list with boundary tags from Lesson 26, with a real `mm_init()`, `mm_malloc()`, `mm_free()`, and `mm_realloc()`. The transferable insight: this is the same structure as glibc's ptmalloc2, jemalloc, and tcmalloc — the difference is segregated size classes and thread caches, not the fundamental algorithm.

What you need to know first: Lesson 00-43 (especially Lesson 25, Lesson 26).

Terms used in this lesson:
- **Heap allocator** — A system that dynamically manages memory at runtime, providing memory blocks of requested sizes and reclaiming them when no longer needed, solving the problem of needing memory whose size or lifetime is unknown at compile time.
- **Explicit free list** — A linked list structure where free memory blocks contain pointers to the next and previous free blocks, solving the problem of having to scan allocated blocks during allocation or coalescing.
- **Boundary tags** — Metadata stored at both the beginning (header) and end (footer) of a block, containing its size and allocation status, solving the problem of finding the previous block in memory during constant-time coalescing.

Objects and methods used:
- **`sbrk`**
  - *What it is:* A system call wrapper that increments the program's data space (heap) by a specified number of bytes.
  - *Implementation:* `void *sbrk(intptr_t increment);`
  - *Its use:* Used to request raw memory pages from the operating system to extend our managed heap.
  - *Type:* Free function.
  - *Responsibility:* To interact with the OS kernel to expand the data segment of the calling process.
  - *Depends on:* An integer increment specifying the number of bytes to add.
  - *Connects to:* Called by our heap management routines, asks the OS kernel to adjust the `brk` pointer.
  - *Shape:* A boundary between user-space application code and the OS kernel.
- **`memcpy`**
  - *What it is:* A standard library function to copy a block of memory from one location to another.
  - *Implementation:* `void *memcpy(void *dest, const void *src, size_t n);`
  - *Its use:* Used in `mm_realloc` to preserve the old payload data when moving a block to a new location.
  - *Type:* Standard library function.
  - *Responsibility:* To copy `n` bytes from a source address to a destination address.
  - *Depends on:* Valid source and destination pointers and a byte count `n`.
  - *Connects to:* Called by `mm_realloc`, transfers data between two heap blocks.
  - *Shape:* An internal implementation detail for memory manipulation.

## Concept Unit: mm.c header — macros, types, and global state

### The Problem
How do we systematically manage memory metadata without filling our code with error-prone pointer arithmetic every time we need to read a block size? How do we abstract away the layout of headers and footers?

### Introduce the concept in isolation
```c
#include <stdio.h>

#define WSIZE 4
#define PACK(size, alloc) ((size) | (alloc))
#define GET(p) (*(unsigned int *)(p))
#define PUT(p, val) (*(unsigned int *)(p) = (unsigned int)(val))

int main() {
    unsigned int memory[2];
    PUT(&memory[0], PACK(32, 1)); // 32 byte size, allocated
    printf("Value: %u\n", GET(&memory[0]));
    return 0;
}
```
**Output:**
```
Value: 33
```
This demonstrates the concept of **bit packing macros**. It proves that we can store both a block's size (which is a multiple of 8, so the lower 3 bits are 0) and an allocation bit in a single 4-byte word.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** CS:APP malloc lab.
- **Files affected:** `mm.c` (created).
- **Change type:** add.
- **Location:** The beginning of the file.
- **Dependencies:** Lessons 25, 26.

### The New Code
```c
/* mm.c -- explicit free list heap allocator */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <assert.h>

/* Word and double-word sizes (bytes) */
#define WSIZE      4          /* single word = 4 bytes */
#define DSIZE      8          /* double word = 8 bytes */
#define CHUNKSIZE  (1 << 12)  /* default heap extension: 4096 bytes */
#define MIN_BLOCK  24         /* header(4) + prev_ptr(8) + next_ptr(8) + footer(4) */

#define MAX(x, y) ((x) > (y) ? (x) : (y))

/* Pack size and alloc bit into a word */
#define PACK(size, alloc)  ((size) | (alloc))

/* Read/write a word at address p */
#define GET(p)       (*(unsigned int *)(p))
#define PUT(p, val)  (*(unsigned int *)(p) = (unsigned int)(val))

/* Extract size and alloc fields from a block header/footer */
#define GET_SIZE(p)   (GET(p) & ~0x7U)
#define GET_ALLOC(p)  (GET(p) & 0x1U)

/* Block pointer (bp) points to first payload byte */
#define HDRP(bp)  ((char *)(bp) - WSIZE)
#define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)

/* Navigate to next/prev blocks in heap */
#define NEXT_BLKP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)))
#define PREV_BLKP(bp)  ((char *)(bp) - GET_SIZE(((char *)(bp) - DSIZE)))

/* Explicit free list: prev/next pointers stored in free block payload */
#define PREV_FREE(bp)  (*(char **)(bp))
#define NEXT_FREE(bp)  (*(char **)((char *)(bp) + sizeof(char *)))

/* Global heap pointers */
static char *heap_listp  = NULL;  /* points to prologue block */
static char *free_listp  = NULL;  /* head of explicit free list */
```

### The Updated Project
```c
1: /* mm.c -- explicit free list heap allocator */
2: #include <stdio.h>
3: #include <stdlib.h>
4: #include <string.h>
5: #include <unistd.h>
6: #include <assert.h>
7: 
8: /* Word and double-word sizes (bytes) */
9: #define WSIZE      4          /* single word = 4 bytes */
10: #define DSIZE      8          /* double word = 8 bytes */
11: #define CHUNKSIZE  (1 << 12)  /* default heap extension: 4096 bytes */
12: #define MIN_BLOCK  24         /* header(4) + prev_ptr(8) + next_ptr(8) + footer(4) */
13: 
14: #define MAX(x, y) ((x) > (y) ? (x) : (y))
15: 
16: /* Pack size and alloc bit into a word */
17: #define PACK(size, alloc)  ((size) | (alloc))
18: 
19: /* Read/write a word at address p */
20: #define GET(p)       (*(unsigned int *)(p))
21: #define PUT(p, val)  (*(unsigned int *)(p) = (unsigned int)(val))
22: 
23: /* Extract size and alloc fields from a block header/footer */
24: #define GET_SIZE(p)   (GET(p) & ~0x7U)
25: #define GET_ALLOC(p)  (GET(p) & 0x1U)
26: 
27: /* Block pointer (bp) points to first payload byte */
28: #define HDRP(bp)  ((char *)(bp) - WSIZE)
29: #define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
30: 
31: /* Navigate to next/prev blocks in heap */
32: #define NEXT_BLKP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)))
33: #define PREV_BLKP(bp)  ((char *)(bp) - GET_SIZE(((char *)(bp) - DSIZE)))
34: 
35: /* Explicit free list: prev/next pointers stored in free block payload */
36: #define PREV_FREE(bp)  (*(char **)(bp))
37: #define NEXT_FREE(bp)  (*(char **)((char *)(bp) + sizeof(char *)))
38: 
39: /* Global heap pointers */
40: static char *heap_listp  = NULL;  /* points to prologue block */
41: static char *free_listp  = NULL;  /* head of explicit free list */
```

### Mechanical walkthrough
- `#define WSIZE 4`: Defines a word size as 4 bytes.
- `#define DSIZE 8`: Defines a double word as 8 bytes, satisfying alignment requirements.
- `#define PACK(size, alloc)`: Bitwise ORs the block size and allocation bit together.
- `#define GET(p)`: Casts the generic pointer `p` to an unsigned integer pointer and dereferences it to read a 4-byte word.
- `#define PUT(p, val)`: Writes a 32-bit unsigned integer value to the memory address `p`.
- `#define GET_SIZE(p)`: Masks out the lowest 3 bits (`~0x7U`) of a block header/footer to extract the size, which is a multiple of 8.
- `#define GET_ALLOC(p)`: Masks out all but the lowest bit (`0x1U`) to extract the allocation status.
- `#define HDRP(bp)`: Subtracts 1 word (4 bytes) from the block pointer (which points to the payload) to find the block header.
- `#define FTRP(bp)`: Uses `HDRP` to find the header, extracts the size, adds it to the block pointer, and subtracts a double word (8 bytes) to locate the block footer.
- `#define NEXT_BLKP(bp)`: Adds the block's total size to its block pointer to yield the block pointer of the next contiguous block in memory.
- `#define PREV_BLKP(bp)`: Reads the footer of the previous contiguous block (located 8 bytes behind `bp`) to find its size, and subtracts that size from `bp` to find the previous block's payload pointer.
- `static char *heap_listp`: A static global pointer that keeps track of the beginning of our managed heap (specifically, the prologue block).
- `static char *free_listp`: A static global pointer that serves as the head of our explicit doubly-linked free list.

### CS lens
The fundamental CS concept is **metadata encoding and bit manipulation**. Instead of wasting memory on separate fields for size and status, they are packed together. Unrelated real-world places this appears: TCP header flags, instruction opcodes in CPUs, color channels (ARGB) packed into 32-bit integers, page table entries in OS kernels.

### SE lens
The design principle is **macro encapsulation**. The alternative NOT chosen is writing inline pointer arithmetic (`*(unsigned int *)((char *)bp - 4)`) everywhere. The real tradeoff is that macros lack type safety and can be hard to debug compared to inline functions, but they guarantee zero overhead and work universally as simple text replacement in C.

### Commands needed
None.

### Run it
No executable code added yet. If we tested `GET_SIZE(HDRP(0x1008))` on a mock heap: `HDRP(0x1008)` is `0x1004`. Suppose `GET(0x1004)` reads `41` (size 40, alloc 1). `41 & ~7 = 40`. The output proves the math aligns with expected memory layouts.

### One sentence connecting to previous unit
With our macros established, we can now safely initialize our heap's structure without getting tangled in pointer math.

## Concept Unit: mm_init — creating the initial empty heap

### The Problem
When the allocator starts, the heap is completely uninitialized. How do we set up the initial boundary tags so that subsequent block navigations (like coalescing) don't accidentally read off the edge of our managed memory?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    void *heap = malloc(16);
    char *heap_listp = (char *)heap;
    
    // Simulate prologue and epilogue
    *(unsigned int *)(heap_listp + 4) = 9; // prologue header: size 8, alloc 1
    *(unsigned int *)(heap_listp + 8) = 9; // prologue footer
    *(unsigned int *)(heap_listp + 12) = 1; // epilogue header: size 0, alloc 1
    
    printf("Prologue size: %u\n", *(unsigned int *)(heap_listp + 4) & ~7);
    printf("Epilogue alloc: %u\n", *(unsigned int *)(heap_listp + 12) & 1);
    free(heap);
    return 0;
}
```
**Output:**
```
Prologue size: 8
Epilogue alloc: 1
```
This demonstrates **sentinel blocks**. It proves that by placing artificial allocated blocks at the start and end of the heap, we prevent backward and forward traversal from ever crossing into unmapped memory.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** CS:APP malloc lab.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** After the global pointers.
- **Dependencies:** Lessons 25, 26.

### The New Code
```c
static void insert_free(char *bp);
static void remove_free(char *bp);
static char *coalesce(char *bp);
static char *extend_heap(size_t words);

int mm_init(void) {
    /* Create the initial empty heap with prologue and epilogue blocks */
    if ((heap_listp = sbrk(4 * WSIZE)) == (void *)-1)
        return -1;

    PUT(heap_listp,             0);              /* alignment padding */
    PUT(heap_listp + (1*WSIZE), PACK(DSIZE, 1)); /* prologue header: 8/1 */
    PUT(heap_listp + (2*WSIZE), PACK(DSIZE, 1)); /* prologue footer: 8/1 */
    PUT(heap_listp + (3*WSIZE), PACK(0, 1));     /* epilogue header: 0/1 */
    heap_listp += (2 * WSIZE); /* point to payload of prologue block */
    free_listp = NULL;

    /* Extend heap with CHUNKSIZE bytes of free space */
    if (extend_heap(CHUNKSIZE / WSIZE) == NULL)
        return -1;
    return 0;
}

static char *extend_heap(size_t words) {
    size_t size = (words % 2) ? (words+1) * WSIZE : words * WSIZE; /* align */
    char *bp = sbrk(size);
    if (bp == (char *)-1) return NULL;
    /* Initialize free block header/footer and new epilogue */
    PUT(HDRP(bp),          PACK(size, 0));  /* free block header */
    PUT(FTRP(bp),          PACK(size, 0));  /* free block footer */
    PUT(HDRP(NEXT_BLKP(bp)), PACK(0, 1));  /* new epilogue header */
    /* Coalesce in case the previous block was free */
    return coalesce(bp);
}
```

### The Updated Project
```c
1: /* mm.c -- explicit free list heap allocator */
2: #include <stdio.h>
3: #include <stdlib.h>
4: #include <string.h>
5: #include <unistd.h>
6: #include <assert.h>
7: 
8: /* Word and double-word sizes (bytes) */
9: #define WSIZE      4          /* single word = 4 bytes */
10: #define DSIZE      8          /* double word = 8 bytes */
11: #define CHUNKSIZE  (1 << 12)  /* default heap extension: 4096 bytes */
12: #define MIN_BLOCK  24         /* header(4) + prev_ptr(8) + next_ptr(8) + footer(4) */
13: 
14: #define MAX(x, y) ((x) > (y) ? (x) : (y))
15: 
16: /* Pack size and alloc bit into a word */
17: #define PACK(size, alloc)  ((size) | (alloc))
18: 
19: /* Read/write a word at address p */
20: #define GET(p)       (*(unsigned int *)(p))
21: #define PUT(p, val)  (*(unsigned int *)(p) = (unsigned int)(val))
22: 
23: /* Extract size and alloc fields from a block header/footer */
24: #define GET_SIZE(p)   (GET(p) & ~0x7U)
25: #define GET_ALLOC(p)  (GET(p) & 0x1U)
26: 
27: /* Block pointer (bp) points to first payload byte */
28: #define HDRP(bp)  ((char *)(bp) - WSIZE)
29: #define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
30: 
31: /* Navigate to next/prev blocks in heap */
32: #define NEXT_BLKP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)))
33: #define PREV_BLKP(bp)  ((char *)(bp) - GET_SIZE(((char *)(bp) - DSIZE)))
34: 
35: /* Explicit free list: prev/next pointers stored in free block payload */
36: #define PREV_FREE(bp)  (*(char **)(bp))
37: #define NEXT_FREE(bp)  (*(char **)((char *)(bp) + sizeof(char *)))
38: 
39: /* Global heap pointers */
40: static char *heap_listp  = NULL;  /* points to prologue block */
41: static char *free_listp  = NULL;  /* head of explicit free list */
42: // ← new
43: static void insert_free(char *bp);
44: static void remove_free(char *bp);
45: static char *coalesce(char *bp);
46: static char *extend_heap(size_t words);
47: 
48: int mm_init(void) {
49:     /* Create the initial empty heap with prologue and epilogue blocks */
50:     if ((heap_listp = sbrk(4 * WSIZE)) == (void *)-1)
51:         return -1;
52: 
53:     PUT(heap_listp,             0);              /* alignment padding */
54:     PUT(heap_listp + (1*WSIZE), PACK(DSIZE, 1)); /* prologue header: 8/1 */
55:     PUT(heap_listp + (2*WSIZE), PACK(DSIZE, 1)); /* prologue footer: 8/1 */
56:     PUT(heap_listp + (3*WSIZE), PACK(0, 1));     /* epilogue header: 0/1 */
57:     heap_listp += (2 * WSIZE); /* point to payload of prologue block */
58:     free_listp = NULL;
59: 
60:     /* Extend heap with CHUNKSIZE bytes of free space */
61:     if (extend_heap(CHUNKSIZE / WSIZE) == NULL)
62:         return -1;
63:     return 0;
64: }
65: 
66: static char *extend_heap(size_t words) {
67:     size_t size = (words % 2) ? (words+1) * WSIZE : words * WSIZE; /* align */
68:     char *bp = sbrk(size);
69:     if (bp == (char *)-1) return NULL;
70:     /* Initialize free block header/footer and new epilogue */
71:     PUT(HDRP(bp),          PACK(size, 0));  /* free block header */
72:     PUT(FTRP(bp),          PACK(size, 0));  /* free block footer */
73:     PUT(HDRP(NEXT_BLKP(bp)), PACK(0, 1));  /* new epilogue header */
74:     /* Coalesce in case the previous block was free */
75:     return coalesce(bp);
76: }
```

### Mechanical walkthrough
- `if ((heap_listp = sbrk(4 * WSIZE)) == (void *)-1)`: Calls `sbrk` to request 16 bytes. Checks if it fails (returns `-1`).
- `PUT(heap_listp, 0)`: Writes a 4-byte zero word for alignment padding, ensuring block payloads are aligned to 8-byte boundaries.
- `PUT(heap_listp + (1*WSIZE), PACK(DSIZE, 1))`: Writes the prologue header (size 8, allocated).
- `PUT(heap_listp + (2*WSIZE), PACK(DSIZE, 1))`: Writes the prologue footer (size 8, allocated).
- `PUT(heap_listp + (3*WSIZE), PACK(0, 1))`: Writes the epilogue block (size 0, allocated).
- `heap_listp += (2 * WSIZE)`: Advances `heap_listp` to point directly to the prologue block's payload.
- `extend_heap(CHUNKSIZE / WSIZE)`: Calls `extend_heap` to grow the empty heap by the default chunk size (4096 bytes).
- `size_t size = (words % 2) ? (words+1) * WSIZE : words * WSIZE;`: Computes the size in bytes, rounding up to an even number of words to maintain 8-byte alignment.
- `char *bp = sbrk(size)`: Requests the newly calculated block of memory from the OS.
- `PUT(HDRP(bp), PACK(size, 0))`: Overwrites the old epilogue header with a new free block header.
- `PUT(FTRP(bp), PACK(size, 0))`: Writes the new free block footer at the end of the extended area.
- `PUT(HDRP(NEXT_BLKP(bp)), PACK(0, 1))`: Creates a new epilogue header immediately following the new free block.
- `return coalesce(bp);`: Merges this newly acquired free block with any adjacent free blocks.

### CS lens
The fundamental CS concept is **dummy or sentinel nodes**. Unrelated real-world places this appears: Linked lists with dummy head/tail nodes, search algorithms appending the search target to the end of an array to skip bounds checks, B-tree margin nodes.

### SE lens
The design principle is **establishing invariants**. The alternative NOT chosen is leaving the heap edges bare and adding bounds checks (e.g. `if (bp < heap_end)`) into every coalescing operation. The real tradeoff is spending 16 bytes of overhead once per heap initialization to completely remove branching logic from a hot-path operation executed millions of times.

### Commands needed
None.

### Run it
Traced output: `sbrk(16)` allocates 4 words. `heap_listp=0x1000`. `PUT(0x1000,0)`: alignment padding. `PUT(0x1004, PACK(8,1)=9)`: prologue header. `PUT(0x1008, PACK(8,1)=9)`: prologue footer. `PUT(0x100C, PACK(0,1)=1)`: epilogue. `heap_listp = 0x1008` (prologue payload). `extend_heap(1024)`: `sbrk(4096)` -> `bp=0x1010`. `PUT(HDRP(0x1010)=0x100C, PACK(4096,0))`. `PUT(FTRP(0x1010)=0x200C, PACK(4096,0))`. `PUT(HDRP(0x2010), PACK(0,1))`: new epilogue.

### One sentence connecting to previous unit
Now that the heap can be extended safely with sentinels, we need a way to manage the free memory it produces.

## Concept Unit: insert_free, remove_free, coalesce

### The Problem
When a block is freed, it might be adjacent to another free block. How do we merge them in constant time, and how do we update our explicit free list to reflect the new larger block?

### Introduce the concept in isolation
```c
#include <stdio.h>

struct Node {
    struct Node *prev;
    struct Node *next;
};

int main() {
    struct Node head = {NULL, NULL};
    struct Node block1 = {NULL, NULL};
    
    // Insert block1 at head
    block1.next = head.next;
    block1.prev = &head;
    if (head.next) head.next->prev = &block1;
    head.next = &block1;
    
    printf("Block inserted. Next from head is block1: %s\n", head.next == &block1 ? "Yes" : "No");
    return 0;
}
```
**Output:**
```
Block inserted. Next from head is block1: Yes
```
This demonstrates **doubly-linked list insertion**. It proves that we can wire a new node into the front of a list by carefully updating forward and backward pointers, which we will apply to the free blocks in our heap.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** CS:APP malloc lab.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** After `extend_heap`.
- **Dependencies:** Lessons 25, 26.

### The New Code
```c
static void insert_free(char *bp) {
    NEXT_FREE(bp) = free_listp;
    PREV_FREE(bp) = NULL;
    if (free_listp) PREV_FREE(free_listp) = bp;
    free_listp = bp;
}

static void remove_free(char *bp) {
    if (PREV_FREE(bp)) NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);
    else               free_listp = NEXT_FREE(bp);
    if (NEXT_FREE(bp)) PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);
}

static char *coalesce(char *bp) {
    int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));
    int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));
    size_t size    = GET_SIZE(HDRP(bp));

    if (prev_alloc && next_alloc) {
        /* Case 1: no neighbors free */
        insert_free(bp);
    } else if (prev_alloc && !next_alloc) {
        /* Case 2: merge with next */
        remove_free(NEXT_BLKP(bp));
        size += GET_SIZE(HDRP(NEXT_BLKP(bp)));
        PUT(HDRP(bp), PACK(size, 0));
        PUT(FTRP(bp), PACK(size, 0));
        insert_free(bp);
    } else if (!prev_alloc && next_alloc) {
        /* Case 3: merge with prev */
        size += GET_SIZE(HDRP(PREV_BLKP(bp)));
        remove_free(PREV_BLKP(bp));
        bp = PREV_BLKP(bp);
        PUT(HDRP(bp), PACK(size, 0));
        PUT(FTRP(bp), PACK(size, 0));
        insert_free(bp);
    } else {
        /* Case 4: merge both */
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
```

### The Updated Project
```c
1: /* mm.c -- explicit free list heap allocator */
2: #include <stdio.h>
3: #include <stdlib.h>
4: #include <string.h>
5: #include <unistd.h>
6: #include <assert.h>
7: 
8: /* Word and double-word sizes (bytes) */
9: #define WSIZE      4          /* single word = 4 bytes */
10: #define DSIZE      8          /* double word = 8 bytes */
11: #define CHUNKSIZE  (1 << 12)  /* default heap extension: 4096 bytes */
12: #define MIN_BLOCK  24         /* header(4) + prev_ptr(8) + next_ptr(8) + footer(4) */
13: 
14: #define MAX(x, y) ((x) > (y) ? (x) : (y))
15: 
16: /* Pack size and alloc bit into a word */
17: #define PACK(size, alloc)  ((size) | (alloc))
18: 
19: /* Read/write a word at address p */
20: #define GET(p)       (*(unsigned int *)(p))
21: #define PUT(p, val)  (*(unsigned int *)(p) = (unsigned int)(val))
22: 
23: /* Extract size and alloc fields from a block header/footer */
24: #define GET_SIZE(p)   (GET(p) & ~0x7U)
25: #define GET_ALLOC(p)  (GET(p) & 0x1U)
26: 
27: /* Block pointer (bp) points to first payload byte */
28: #define HDRP(bp)  ((char *)(bp) - WSIZE)
29: #define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
30: 
31: /* Navigate to next/prev blocks in heap */
32: #define NEXT_BLKP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)))
33: #define PREV_BLKP(bp)  ((char *)(bp) - GET_SIZE(((char *)(bp) - DSIZE)))
34: 
35: /* Explicit free list: prev/next pointers stored in free block payload */
36: #define PREV_FREE(bp)  (*(char **)(bp))
37: #define NEXT_FREE(bp)  (*(char **)((char *)(bp) + sizeof(char *)))
38: 
39: /* Global heap pointers */
40: static char *heap_listp  = NULL;  /* points to prologue block */
41: static char *free_listp  = NULL;  /* head of explicit free list */
42: 
43: static void insert_free(char *bp);
44: static void remove_free(char *bp);
45: static char *coalesce(char *bp);
46: static char *extend_heap(size_t words);
47: 
48: int mm_init(void) {
49:     /* Create the initial empty heap with prologue and epilogue blocks */
50:     if ((heap_listp = sbrk(4 * WSIZE)) == (void *)-1)
51:         return -1;
52: 
53:     PUT(heap_listp,             0);              /* alignment padding */
54:     PUT(heap_listp + (1*WSIZE), PACK(DSIZE, 1)); /* prologue header: 8/1 */
55:     PUT(heap_listp + (2*WSIZE), PACK(DSIZE, 1)); /* prologue footer: 8/1 */
56:     PUT(heap_listp + (3*WSIZE), PACK(0, 1));     /* epilogue header: 0/1 */
57:     heap_listp += (2 * WSIZE); /* point to payload of prologue block */
58:     free_listp = NULL;
59: 
60:     /* Extend heap with CHUNKSIZE bytes of free space */
61:     if (extend_heap(CHUNKSIZE / WSIZE) == NULL)
62:         return -1;
63:     return 0;
64: }
65: 
66: static char *extend_heap(size_t words) {
67:     size_t size = (words % 2) ? (words+1) * WSIZE : words * WSIZE; /* align */
68:     char *bp = sbrk(size);
69:     if (bp == (char *)-1) return NULL;
70:     /* Initialize free block header/footer and new epilogue */
71:     PUT(HDRP(bp),          PACK(size, 0));  /* free block header */
72:     PUT(FTRP(bp),          PACK(size, 0));  /* free block footer */
73:     PUT(HDRP(NEXT_BLKP(bp)), PACK(0, 1));  /* new epilogue header */
74:     /* Coalesce in case the previous block was free */
75:     return coalesce(bp);
76: }
77: // ← new
78: static void insert_free(char *bp) {
79:     NEXT_FREE(bp) = free_listp;
80:     PREV_FREE(bp) = NULL;
81:     if (free_listp) PREV_FREE(free_listp) = bp;
82:     free_listp = bp;
83: }
84: 
85: static void remove_free(char *bp) {
86:     if (PREV_FREE(bp)) NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);
87:     else               free_listp = NEXT_FREE(bp);
88:     if (NEXT_FREE(bp)) PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);
89: }
90: 
91: static char *coalesce(char *bp) {
92:     int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));
93:     int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));
94:     size_t size    = GET_SIZE(HDRP(bp));
95: 
96:     if (prev_alloc && next_alloc) {
97:         /* Case 1: no neighbors free */
98:         insert_free(bp);
99:     } else if (prev_alloc && !next_alloc) {
100:         /* Case 2: merge with next */
101:         remove_free(NEXT_BLKP(bp));
102:         size += GET_SIZE(HDRP(NEXT_BLKP(bp)));
103:         PUT(HDRP(bp), PACK(size, 0));
104:         PUT(FTRP(bp), PACK(size, 0));
105:         insert_free(bp);
106:     } else if (!prev_alloc && next_alloc) {
107:         /* Case 3: merge with prev */
108:         size += GET_SIZE(HDRP(PREV_BLKP(bp)));
109:         remove_free(PREV_BLKP(bp));
110:         bp = PREV_BLKP(bp);
111:         PUT(HDRP(bp), PACK(size, 0));
112:         PUT(FTRP(bp), PACK(size, 0));
113:         insert_free(bp);
114:     } else {
115:         /* Case 4: merge both */
116:         size += GET_SIZE(HDRP(PREV_BLKP(bp)))
117:              +  GET_SIZE(HDRP(NEXT_BLKP(bp)));
118:         remove_free(PREV_BLKP(bp));
119:         remove_free(NEXT_BLKP(bp));
120:         bp = PREV_BLKP(bp);
121:         PUT(HDRP(bp), PACK(size, 0));
122:         PUT(FTRP(bp), PACK(size, 0));
123:         insert_free(bp);
124:     }
125:     return bp;
126: }
```

### Mechanical walkthrough
- `NEXT_FREE(bp) = free_listp;`: Sets the next pointer of the new block `bp` to the current head of the list.
- `PREV_FREE(bp) = NULL;`: Sets the previous pointer of the new block `bp` to `NULL`, as it will be the new head.
- `if (free_listp) PREV_FREE(free_listp) = bp;`: If the list is not empty, updates the old head's previous pointer to point to the new block `bp`.
- `free_listp = bp;`: Sets the global free list head to the new block `bp`.
- `if (PREV_FREE(bp))`: Checks if the block `bp` has a predecessor in the free list.
- `NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);`: If so, updates the predecessor's next pointer to skip `bp`.
- `else free_listp = NEXT_FREE(bp);`: If `bp` was the head, updates the global head to `bp`'s next block.
- `if (NEXT_FREE(bp)) PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);`: If `bp` has a successor, updates its previous pointer to skip `bp`.
- `int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));`: Uses boundary tags to check the allocation status of the physically previous block.
- `int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));`: Uses boundary tags to check the allocation status of the physically next block.
- `size_t size = GET_SIZE(HDRP(bp));`: Gets the current block's size.
- `insert_free(bp);`: (Case 1) Since neither neighbor is free, simply adds the block to the explicit free list.
- `remove_free(NEXT_BLKP(bp));`: (Case 2) Removes the right neighbor from the free list.
- `size += GET_SIZE(HDRP(NEXT_BLKP(bp)));`: Increases the logical size to absorb the right neighbor.
- `PUT(HDRP(bp), PACK(size, 0));`: Updates the current block's header to reflect the new larger size.
- `PUT(FTRP(bp), PACK(size, 0));`: Updates the far footer (which now acts as the footer for the merged block) to the new size.
- `insert_free(bp);`: (Case 2) Adds the newly merged block back to the free list.
- `size += GET_SIZE(HDRP(PREV_BLKP(bp)));`: (Case 3/4) Increases the size to absorb the left neighbor.
- `remove_free(PREV_BLKP(bp));`: (Case 3/4) Removes the left neighbor from the free list.
- `bp = PREV_BLKP(bp);`: (Case 3/4) Shifts the block pointer back to start at the left neighbor's payload.
- `PUT(HDRP(bp), PACK(size, 0));`: (Case 3/4) Updates the new, combined header.
- `PUT(FTRP(bp), PACK(size, 0));`: (Case 3/4) Updates the new, combined footer.
- `insert_free(bp);`: (Case 3/4) Adds the final coalesced block into the free list.
- `remove_free(NEXT_BLKP(bp));`: (Case 4) Also removes the right neighbor from the free list since we are merging both sides.
- `return bp;`: Returns the final block pointer for the coalesced block.

### CS lens
The fundamental CS concept is **constant-time deletion using doubly-linked lists and boundary tags**. Unrelated real-world places this appears: LRU caches keeping track of most/least recently used items, browser history tracking (back/forward navigation), text editor undo/redo stacks.

### SE lens
The design principle is **separation of concerns**. The alternative NOT chosen is leaving the list update logic intertwined with the coalescing math. The real tradeoff is a few extra function calls (overhead) in exchange for isolating the pointer manipulation bugs into tiny, easily tested `insert_free` and `remove_free` helper functions.

### Commands needed
None.

### Run it
Trace Case 2 with concrete addresses: `bp=0x1028` (size=32, just freed). Next=`0x1048` (size=64, free). `remove_free(0x1048)`. `size=32+64=96`. `PUT(HDRP(0x1028)=0x1024, PACK(96,0))`. `PUT(FTRP(0x1028)=0x1024+96-4=0x1080, PACK(96,0))`. `insert_free(0x1028)`.

### One sentence connecting to previous unit
Now that blocks can merge seamlessly, we have the building blocks to actually serve memory requests from the user.

## Concept Unit: mm_malloc and place

### The Problem
When the user asks for memory, we must search our free list for a block large enough to fit it. If we find a block that is much larger than needed, how do we avoid wasting the excess space?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main() {
    int requested = 13;
    int DSIZE = 8;
    int MIN_BLOCK = 24;
    
    // Calculate adjusted size
    int asize = (requested + DSIZE + 7) & ~7;
    if (asize < MIN_BLOCK) asize = MIN_BLOCK;
    
    printf("Requested %d bytes, aligned to %d bytes\n", requested, asize);
    return 0;
}
```
**Output:**
```
Requested 13 bytes, aligned to 24 bytes
```
This demonstrates **alignment constraints**. It proves that requested sizes must be padded out to multiples of 8 and subject to a hard minimum block size so they can fit the header, footer, and free list pointers when later freed.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** CS:APP malloc lab.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** After `coalesce`.
- **Dependencies:** Lessons 25, 26.

### The New Code
```c
static char *find_fit(size_t asize) {
    /* First-fit search on explicit free list */
    for (char *bp = free_listp; bp != NULL; bp = NEXT_FREE(bp))
        if (GET_SIZE(HDRP(bp)) >= asize)
            return bp;
    return NULL;
}

static void place(char *bp, size_t asize) {
    size_t csize = GET_SIZE(HDRP(bp));
    remove_free(bp);
    if (csize - asize >= MIN_BLOCK) {
        /* Split */
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
    size_t asize = MAX((size + DSIZE + 7) & ~7U, (size_t)MIN_BLOCK);
    char *bp = find_fit(asize);
    if (bp) { place(bp, asize); return bp; }
    size_t extsize = MAX(asize, CHUNKSIZE);
    bp = extend_heap(extsize / WSIZE);
    if (!bp) return NULL;
    place(bp, asize);
    return bp;
}
```

### The Updated Project
```c
1: /* mm.c -- explicit free list heap allocator */
2: #include <stdio.h>
3: #include <stdlib.h>
4: #include <string.h>
5: #include <unistd.h>
6: #include <assert.h>
7: 
8: /* Word and double-word sizes (bytes) */
9: #define WSIZE      4          /* single word = 4 bytes */
10: #define DSIZE      8          /* double word = 8 bytes */
11: #define CHUNKSIZE  (1 << 12)  /* default heap extension: 4096 bytes */
12: #define MIN_BLOCK  24         /* header(4) + prev_ptr(8) + next_ptr(8) + footer(4) */
13: 
14: #define MAX(x, y) ((x) > (y) ? (x) : (y))
15: 
16: /* Pack size and alloc bit into a word */
17: #define PACK(size, alloc)  ((size) | (alloc))
18: 
19: /* Read/write a word at address p */
20: #define GET(p)       (*(unsigned int *)(p))
21: #define PUT(p, val)  (*(unsigned int *)(p) = (unsigned int)(val))
22: 
23: /* Extract size and alloc fields from a block header/footer */
24: #define GET_SIZE(p)   (GET(p) & ~0x7U)
25: #define GET_ALLOC(p)  (GET(p) & 0x1U)
26: 
27: /* Block pointer (bp) points to first payload byte */
28: #define HDRP(bp)  ((char *)(bp) - WSIZE)
29: #define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
30: 
31: /* Navigate to next/prev blocks in heap */
32: #define NEXT_BLKP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)))
33: #define PREV_BLKP(bp)  ((char *)(bp) - GET_SIZE(((char *)(bp) - DSIZE)))
34: 
35: /* Explicit free list: prev/next pointers stored in free block payload */
36: #define PREV_FREE(bp)  (*(char **)(bp))
37: #define NEXT_FREE(bp)  (*(char **)((char *)(bp) + sizeof(char *)))
38: 
39: /* Global heap pointers */
40: static char *heap_listp  = NULL;  /* points to prologue block */
41: static char *free_listp  = NULL;  /* head of explicit free list */
42: 
43: static void insert_free(char *bp);
44: static void remove_free(char *bp);
45: static char *coalesce(char *bp);
46: static char *extend_heap(size_t words);
47: 
48: int mm_init(void) {
49:     /* Create the initial empty heap with prologue and epilogue blocks */
50:     if ((heap_listp = sbrk(4 * WSIZE)) == (void *)-1)
51:         return -1;
52: 
53:     PUT(heap_listp,             0);              /* alignment padding */
54:     PUT(heap_listp + (1*WSIZE), PACK(DSIZE, 1)); /* prologue header: 8/1 */
55:     PUT(heap_listp + (2*WSIZE), PACK(DSIZE, 1)); /* prologue footer: 8/1 */
56:     PUT(heap_listp + (3*WSIZE), PACK(0, 1));     /* epilogue header: 0/1 */
57:     heap_listp += (2 * WSIZE); /* point to payload of prologue block */
58:     free_listp = NULL;
59: 
60:     /* Extend heap with CHUNKSIZE bytes of free space */
61:     if (extend_heap(CHUNKSIZE / WSIZE) == NULL)
62:         return -1;
63:     return 0;
64: }
65: 
66: static char *extend_heap(size_t words) {
67:     size_t size = (words % 2) ? (words+1) * WSIZE : words * WSIZE; /* align */
68:     char *bp = sbrk(size);
69:     if (bp == (char *)-1) return NULL;
70:     /* Initialize free block header/footer and new epilogue */
71:     PUT(HDRP(bp),          PACK(size, 0));  /* free block header */
72:     PUT(FTRP(bp),          PACK(size, 0));  /* free block footer */
73:     PUT(HDRP(NEXT_BLKP(bp)), PACK(0, 1));  /* new epilogue header */
74:     /* Coalesce in case the previous block was free */
75:     return coalesce(bp);
76: }
77: 
78: static void insert_free(char *bp) {
79:     NEXT_FREE(bp) = free_listp;
80:     PREV_FREE(bp) = NULL;
81:     if (free_listp) PREV_FREE(free_listp) = bp;
82:     free_listp = bp;
83: }
84: 
85: static void remove_free(char *bp) {
86:     if (PREV_FREE(bp)) NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);
87:     else               free_listp = NEXT_FREE(bp);
88:     if (NEXT_FREE(bp)) PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);
89: }
90: 
91: static char *coalesce(char *bp) {
92:     int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));
93:     int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));
94:     size_t size    = GET_SIZE(HDRP(bp));
95: 
96:     if (prev_alloc && next_alloc) {
97:         /* Case 1: no neighbors free */
98:         insert_free(bp);
99:     } else if (prev_alloc && !next_alloc) {
100:         /* Case 2: merge with next */
101:         remove_free(NEXT_BLKP(bp));
102:         size += GET_SIZE(HDRP(NEXT_BLKP(bp)));
103:         PUT(HDRP(bp), PACK(size, 0));
104:         PUT(FTRP(bp), PACK(size, 0));
105:         insert_free(bp);
106:     } else if (!prev_alloc && next_alloc) {
107:         /* Case 3: merge with prev */
108:         size += GET_SIZE(HDRP(PREV_BLKP(bp)));
109:         remove_free(PREV_BLKP(bp));
110:         bp = PREV_BLKP(bp);
111:         PUT(HDRP(bp), PACK(size, 0));
112:         PUT(FTRP(bp), PACK(size, 0));
113:         insert_free(bp);
114:     } else {
115:         /* Case 4: merge both */
116:         size += GET_SIZE(HDRP(PREV_BLKP(bp)))
117:              +  GET_SIZE(HDRP(NEXT_BLKP(bp)));
118:         remove_free(PREV_BLKP(bp));
119:         remove_free(NEXT_BLKP(bp));
120:         bp = PREV_BLKP(bp);
121:         PUT(HDRP(bp), PACK(size, 0));
122:         PUT(FTRP(bp), PACK(size, 0));
123:         insert_free(bp);
124:     }
125:     return bp;
126: }
127: // ← new
128: static char *find_fit(size_t asize) {
129:     /* First-fit search on explicit free list */
130:     for (char *bp = free_listp; bp != NULL; bp = NEXT_FREE(bp))
131:         if (GET_SIZE(HDRP(bp)) >= asize)
132:             return bp;
133:     return NULL;
134: }
135: 
136: static void place(char *bp, size_t asize) {
137:     size_t csize = GET_SIZE(HDRP(bp));
138:     remove_free(bp);
139:     if (csize - asize >= MIN_BLOCK) {
140:         /* Split */
141:         PUT(HDRP(bp), PACK(asize, 1));
142:         PUT(FTRP(bp), PACK(asize, 1));
143:         char *next = NEXT_BLKP(bp);
144:         PUT(HDRP(next), PACK(csize - asize, 0));
145:         PUT(FTRP(next), PACK(csize - asize, 0));
146:         insert_free(next);
147:     } else {
148:         PUT(HDRP(bp), PACK(csize, 1));
149:         PUT(FTRP(bp), PACK(csize, 1));
150:     }
151: }
152: 
153: void *mm_malloc(size_t size) {
154:     if (size == 0) return NULL;
155:     size_t asize = MAX((size + DSIZE + 7) & ~7U, (size_t)MIN_BLOCK);
156:     char *bp = find_fit(asize);
157:     if (bp) { place(bp, asize); return bp; }
158:     size_t extsize = MAX(asize, CHUNKSIZE);
159:     bp = extend_heap(extsize / WSIZE);
160:     if (!bp) return NULL;
161:     place(bp, asize);
162:     return bp;
163: }
```

### Mechanical walkthrough
- `for (char *bp = free_listp; bp != NULL; bp = NEXT_FREE(bp))`: Iterates over the explicit free list starting from `free_listp`.
- `if (GET_SIZE(HDRP(bp)) >= asize)`: Checks if the current free block is large enough to satisfy the adjusted size requested.
- `return bp;`: Returns the first block that fits (First-Fit algorithm).
- `return NULL;`: Returns `NULL` if no block in the list is large enough.
- `size_t csize = GET_SIZE(HDRP(bp));`: Reads the complete size of the free block we are about to use.
- `remove_free(bp);`: Plucks the block out of the explicit free list.
- `if (csize - asize >= MIN_BLOCK)`: Determines whether the remaining space in the block is large enough to form a valid new free block (at least 24 bytes).
- `PUT(HDRP(bp), PACK(asize, 1));`: If so, rewrites the header to precisely the required allocation size, marking it allocated.
- `PUT(FTRP(bp), PACK(asize, 1));`: Rewrites the footer for this newly split allocated block.
- `char *next = NEXT_BLKP(bp);`: Advances the pointer to where the remainder block will begin.
- `PUT(HDRP(next), PACK(csize - asize, 0));`: Writes a new free header for the remaining space.
- `PUT(FTRP(next), PACK(csize - asize, 0));`: Writes a new free footer for the remainder.
- `insert_free(next);`: Inserts the remainder block back into the free list.
- `PUT(HDRP(bp), PACK(csize, 1));`: If the remaining space is too small to form a new block, hands over the whole block (internal fragmentation).
- `PUT(FTRP(bp), PACK(csize, 1));`: Marks the footer of this completely used block as allocated.
- `if (size == 0) return NULL;`: Validates the user's `size` request.
- `size_t asize = MAX((size + DSIZE + 7) & ~7U, (size_t)MIN_BLOCK);`: Computes the adjusted size by adding overhead (8 bytes for header/footer), rounding up to the nearest multiple of 8, and ensuring it meets `MIN_BLOCK` size requirements.
- `char *bp = find_fit(asize);`: Invokes the search over the free list.
- `if (bp) { place(bp, asize); return bp; }`: If a fit is found, places the block (potentially splitting it) and returns the pointer to the user.
- `size_t extsize = MAX(asize, CHUNKSIZE);`: If no fit is found, calculates how much to expand the heap (at least the requested size, but usually the chunk size).
- `bp = extend_heap(extsize / WSIZE);`: Asks the OS for more heap space.
- `if (!bp) return NULL;`: Handles out-of-memory errors.
- `place(bp, asize);`: Places the allocation into this brand-new extended memory.
- `return bp;`: Returns the final allocated payload pointer.

### CS lens
The fundamental CS concept is **First-Fit search and block splitting**. Unrelated real-world places this appears: File system disk space allocation strategies, scheduling rooms for meetings, assigning virtual machines to physical hypervisor hosts.

### SE lens
The design principle is **minimizing internal fragmentation**. The alternative NOT chosen is always giving the entire block without splitting. The real tradeoff is spending CPU cycles updating extra metadata and pointers in `place` in order to preserve precious memory for future allocations.

### Commands needed
None.

### Run it
Trace `mm_malloc(48)`: `asize = MAX((48+8+7)&~7, 24) = MAX(56, 24) = 56`. `find_fit(56)`: scan free list, find block with `size >= 56`. Suppose 4096-byte block found at `0x1010`. `place(0x1010, 56)`: `csize = 4096`. `4096 - 56 = 4040 >= 24`: split. `PUT(HDRP(0x1010), PACK(56,1))`. `PUT(FTRP(0x1010)=0x1044, PACK(56,1))`. `next=0x1048`. `PUT(HDRP(0x1048), PACK(4040,0))`. `PUT(FTRP(0x1048), PACK(4040,0))`. `insert_free(0x1048)`. Return `0x1010`.

### One sentence connecting to previous unit
With allocation now functional, we must allow the user to return that memory or adjust its size.

## Concept Unit: mm_free and mm_realloc — completing the allocator

### The Problem
When the user finishes with memory, how do we return it to our tracked pool, and what if they need to resize an existing allocation without losing its data?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main() {
    char *src = malloc(20);
    strcpy(src, "Hello, world!");
    char *dst = malloc(40);
    
    // Copy to larger block
    memcpy(dst, src, 20);
    printf("Copied text: %s\n", dst);
    
    free(src);
    free(dst);
    return 0;
}
```
**Output:**
```
Copied text: Hello, world!
```
This demonstrates **data preservation during reallocation**. It proves that when expanding memory, we can copy the precise payload contents to a new memory segment before discarding the old one.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** CS:APP malloc lab.
- **Files affected:** `mm.c` (modified).
- **Change type:** add.
- **Location:** At the end of the file.
- **Dependencies:** Lessons 25, 26.

### The New Code
```c
void mm_free(void *ptr) {
    if (!ptr) return;
    size_t size = GET_SIZE(HDRP(ptr));
    PUT(HDRP(ptr), PACK(size, 0));
    PUT(FTRP(ptr), PACK(size, 0));
    coalesce(ptr);
}

void *mm_realloc(void *ptr, size_t size) {
    if (!ptr)      return mm_malloc(size);      /* realloc(NULL, n) = malloc(n) */
    if (size == 0) { mm_free(ptr); return NULL; } /* realloc(p, 0) = free(p) */

    size_t oldsize = GET_SIZE(HDRP(ptr));
    size_t newsize = MAX((size + DSIZE + 7) & ~7U, (size_t)MIN_BLOCK);

    if (newsize <= oldsize) {
        /* Shrink or same size: optionally split */
        if (oldsize - newsize >= MIN_BLOCK) {
            PUT(HDRP(ptr), PACK(newsize, 1));
            PUT(FTRP(ptr), PACK(newsize, 1));
            char *next = NEXT_BLKP(ptr);
            PUT(HDRP(next), PACK(oldsize - newsize, 0));
            PUT(FTRP(next), PACK(oldsize - newsize, 0));
            coalesce(next);
        }
        return ptr;
    }

    /* Need more space: allocate new block, copy, free old */
    void *newptr = mm_malloc(size);
    if (!newptr) return NULL;
    memcpy(newptr, ptr, oldsize - DSIZE);  /* copy payload (minus header+footer) */
    mm_free(ptr);
    return newptr;
}
```

### The Updated Project
```c
1: /* mm.c -- explicit free list heap allocator */
2: #include <stdio.h>
3: #include <stdlib.h>
4: #include <string.h>
5: #include <unistd.h>
6: #include <assert.h>
7: 
8: /* Word and double-word sizes (bytes) */
9: #define WSIZE      4          /* single word = 4 bytes */
10: #define DSIZE      8          /* double word = 8 bytes */
11: #define CHUNKSIZE  (1 << 12)  /* default heap extension: 4096 bytes */
12: #define MIN_BLOCK  24         /* header(4) + prev_ptr(8) + next_ptr(8) + footer(4) */
13: 
14: #define MAX(x, y) ((x) > (y) ? (x) : (y))
15: 
16: /* Pack size and alloc bit into a word */
17: #define PACK(size, alloc)  ((size) | (alloc))
18: 
19: /* Read/write a word at address p */
20: #define GET(p)       (*(unsigned int *)(p))
21: #define PUT(p, val)  (*(unsigned int *)(p) = (unsigned int)(val))
22: 
23: /* Extract size and alloc fields from a block header/footer */
24: #define GET_SIZE(p)   (GET(p) & ~0x7U)
25: #define GET_ALLOC(p)  (GET(p) & 0x1U)
26: 
27: /* Block pointer (bp) points to first payload byte */
28: #define HDRP(bp)  ((char *)(bp) - WSIZE)
29: #define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
30: 
31: /* Navigate to next/prev blocks in heap */
32: #define NEXT_BLKP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)))
33: #define PREV_BLKP(bp)  ((char *)(bp) - GET_SIZE(((char *)(bp) - DSIZE)))
34: 
35: /* Explicit free list: prev/next pointers stored in free block payload */
36: #define PREV_FREE(bp)  (*(char **)(bp))
37: #define NEXT_FREE(bp)  (*(char **)((char *)(bp) + sizeof(char *)))
38: 
39: /* Global heap pointers */
40: static char *heap_listp  = NULL;  /* points to prologue block */
41: static char *free_listp  = NULL;  /* head of explicit free list */
42: 
43: static void insert_free(char *bp);
44: static void remove_free(char *bp);
45: static char *coalesce(char *bp);
46: static char *extend_heap(size_t words);
47: 
48: int mm_init(void) {
49:     /* Create the initial empty heap with prologue and epilogue blocks */
50:     if ((heap_listp = sbrk(4 * WSIZE)) == (void *)-1)
51:         return -1;
52: 
53:     PUT(heap_listp,             0);              /* alignment padding */
54:     PUT(heap_listp + (1*WSIZE), PACK(DSIZE, 1)); /* prologue header: 8/1 */
55:     PUT(heap_listp + (2*WSIZE), PACK(DSIZE, 1)); /* prologue footer: 8/1 */
56:     PUT(heap_listp + (3*WSIZE), PACK(0, 1));     /* epilogue header: 0/1 */
57:     heap_listp += (2 * WSIZE); /* point to payload of prologue block */
58:     free_listp = NULL;
59: 
60:     /* Extend heap with CHUNKSIZE bytes of free space */
61:     if (extend_heap(CHUNKSIZE / WSIZE) == NULL)
62:         return -1;
63:     return 0;
64: }
65: 
66: static char *extend_heap(size_t words) {
67:     size_t size = (words % 2) ? (words+1) * WSIZE : words * WSIZE; /* align */
68:     char *bp = sbrk(size);
69:     if (bp == (char *)-1) return NULL;
70:     /* Initialize free block header/footer and new epilogue */
71:     PUT(HDRP(bp),          PACK(size, 0));  /* free block header */
72:     PUT(FTRP(bp),          PACK(size, 0));  /* free block footer */
73:     PUT(HDRP(NEXT_BLKP(bp)), PACK(0, 1));  /* new epilogue header */
74:     /* Coalesce in case the previous block was free */
75:     return coalesce(bp);
76: }
77: 
78: static void insert_free(char *bp) {
79:     NEXT_FREE(bp) = free_listp;
80:     PREV_FREE(bp) = NULL;
81:     if (free_listp) PREV_FREE(free_listp) = bp;
82:     free_listp = bp;
83: }
84: 
85: static void remove_free(char *bp) {
86:     if (PREV_FREE(bp)) NEXT_FREE(PREV_FREE(bp)) = NEXT_FREE(bp);
87:     else               free_listp = NEXT_FREE(bp);
88:     if (NEXT_FREE(bp)) PREV_FREE(NEXT_FREE(bp)) = PREV_FREE(bp);
89: }
90: 
91: static char *coalesce(char *bp) {
92:     int prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));
93:     int next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));
94:     size_t size    = GET_SIZE(HDRP(bp));
95: 
96:     if (prev_alloc && next_alloc) {
97:         /* Case 1: no neighbors free */
98:         insert_free(bp);
99:     } else if (prev_alloc && !next_alloc) {
100:         /* Case 2: merge with next */
101:         remove_free(NEXT_BLKP(bp));
102:         size += GET_SIZE(HDRP(NEXT_BLKP(bp)));
103:         PUT(HDRP(bp), PACK(size, 0));
104:         PUT(FTRP(bp), PACK(size, 0));
105:         insert_free(bp);
106:     } else if (!prev_alloc && next_alloc) {
107:         /* Case 3: merge with prev */
108:         size += GET_SIZE(HDRP(PREV_BLKP(bp)));
109:         remove_free(PREV_BLKP(bp));
110:         bp = PREV_BLKP(bp);
111:         PUT(HDRP(bp), PACK(size, 0));
112:         PUT(FTRP(bp), PACK(size, 0));
113:         insert_free(bp);
114:     } else {
115:         /* Case 4: merge both */
116:         size += GET_SIZE(HDRP(PREV_BLKP(bp)))
117:              +  GET_SIZE(HDRP(NEXT_BLKP(bp)));
118:         remove_free(PREV_BLKP(bp));
119:         remove_free(NEXT_BLKP(bp));
120:         bp = PREV_BLKP(bp);
121:         PUT(HDRP(bp), PACK(size, 0));
122:         PUT(FTRP(bp), PACK(size, 0));
123:         insert_free(bp);
124:     }
125:     return bp;
126: }
127: 
128: static char *find_fit(size_t asize) {
129:     /* First-fit search on explicit free list */
130:     for (char *bp = free_listp; bp != NULL; bp = NEXT_FREE(bp))
131:         if (GET_SIZE(HDRP(bp)) >= asize)
132:             return bp;
133:     return NULL;
134: }
135: 
136: static void place(char *bp, size_t asize) {
137:     size_t csize = GET_SIZE(HDRP(bp));
138:     remove_free(bp);
139:     if (csize - asize >= MIN_BLOCK) {
140:         /* Split */
141:         PUT(HDRP(bp), PACK(asize, 1));
142:         PUT(FTRP(bp), PACK(asize, 1));
143:         char *next = NEXT_BLKP(bp);
144:         PUT(HDRP(next), PACK(csize - asize, 0));
145:         PUT(FTRP(next), PACK(csize - asize, 0));
146:         insert_free(next);
147:     } else {
148:         PUT(HDRP(bp), PACK(csize, 1));
149:         PUT(FTRP(bp), PACK(csize, 1));
150:     }
151: }
152: 
153: void *mm_malloc(size_t size) {
154:     if (size == 0) return NULL;
155:     size_t asize = MAX((size + DSIZE + 7) & ~7U, (size_t)MIN_BLOCK);
156:     char *bp = find_fit(asize);
157:     if (bp) { place(bp, asize); return bp; }
158:     size_t extsize = MAX(asize, CHUNKSIZE);
159:     bp = extend_heap(extsize / WSIZE);
160:     if (!bp) return NULL;
161:     place(bp, asize);
162:     return bp;
163: }
164: // ← new
165: void mm_free(void *ptr) {
166:     if (!ptr) return;
167:     size_t size = GET_SIZE(HDRP(ptr));
168:     PUT(HDRP(ptr), PACK(size, 0));
169:     PUT(FTRP(ptr), PACK(size, 0));
170:     coalesce(ptr);
171: }
172: 
173: void *mm_realloc(void *ptr, size_t size) {
174:     if (!ptr)      return mm_malloc(size);      /* realloc(NULL, n) = malloc(n) */
175:     if (size == 0) { mm_free(ptr); return NULL; } /* realloc(p, 0) = free(p) */
176: 
177:     size_t oldsize = GET_SIZE(HDRP(ptr));
178:     size_t newsize = MAX((size + DSIZE + 7) & ~7U, (size_t)MIN_BLOCK);
179: 
180:     if (newsize <= oldsize) {
181:         /* Shrink or same size: optionally split */
182:         if (oldsize - newsize >= MIN_BLOCK) {
183:             PUT(HDRP(ptr), PACK(newsize, 1));
184:             PUT(FTRP(ptr), PACK(newsize, 1));
185:             char *next = NEXT_BLKP(ptr);
186:             PUT(HDRP(next), PACK(oldsize - newsize, 0));
187:             PUT(FTRP(next), PACK(oldsize - newsize, 0));
188:             coalesce(next);
189:         }
190:         return ptr;
191:     }
192: 
193:     /* Need more space: allocate new block, copy, free old */
194:     void *newptr = mm_malloc(size);
195:     if (!newptr) return NULL;
196:     memcpy(newptr, ptr, oldsize - DSIZE);  /* copy payload (minus header+footer) */
197:     mm_free(ptr);
198:     return newptr;
199: }
```

### Mechanical walkthrough
- `if (!ptr) return;`: Aborts the free operation if a `NULL` pointer is given, conforming to `free()` standards.
- `size_t size = GET_SIZE(HDRP(ptr));`: Identifies exactly how much memory needs to be marked free by reading the block's header.
- `PUT(HDRP(ptr), PACK(size, 0));`: Clears the allocation bit in the header, rendering the block free.
- `PUT(FTRP(ptr), PACK(size, 0));`: Clears the allocation bit in the footer.
- `coalesce(ptr);`: Calls `coalesce` to merge this newly freed block with any unallocated neighbors.
- `if (!ptr) return mm_malloc(size);`: Handles the edge case where `realloc(NULL, size)` acts identically to `malloc(size)`.
- `if (size == 0) { mm_free(ptr); return NULL; }`: Handles the edge case where `realloc(ptr, 0)` acts identically to `free(ptr)`.
- `size_t oldsize = GET_SIZE(HDRP(ptr));`: Determines the existing block's size.
- `size_t newsize = MAX((size + DSIZE + 7) & ~7U, (size_t)MIN_BLOCK);`: Determines the new requested aligned footprint.
- `if (newsize <= oldsize)`: Checks if the user is shrinking the allocation or requesting the same size.
- `if (oldsize - newsize >= MIN_BLOCK)`: Determines if the shrinking frees up enough bytes to spin off a new independent free block.
- `PUT(HDRP(ptr), PACK(newsize, 1));`: Updates the existing block's header to the smaller size.
- `PUT(FTRP(ptr), PACK(newsize, 1));`: Updates the existing block's footer to the smaller size.
- `char *next = NEXT_BLKP(ptr);`: Moves to the starting address of the severed block.
- `PUT(HDRP(next), PACK(oldsize - newsize, 0));`: Writes a free header for the newly detached block.
- `PUT(FTRP(next), PACK(oldsize - newsize, 0));`: Writes a free footer for the newly detached block.
- `coalesce(next);`: Attempts to merge this newly detached free block with any free neighbors.
- `return ptr;`: Returns the original payload pointer, as the data hasn't moved.
- `void *newptr = mm_malloc(size);`: Requests a brand new block of the required larger size.
- `if (!newptr) return NULL;`: Gracefully fails if `mm_malloc` returns `NULL`.
- `memcpy(newptr, ptr, oldsize - DSIZE);`: Calls `memcpy` to physically copy the payload (subtracting the header and footer size from `oldsize` to isolate just the data portion) from the old memory address to the new memory address.
- `mm_free(ptr);`: Deallocates the old block now that its contents have been transferred.
- `return newptr;`: Returns the pointer to the newly allocated and populated block.

### CS lens
The fundamental CS concept is **memory lifecycle management**. Unrelated real-world places this appears: Reclaiming checked-out database connections in connection pools, cleaning up zombie processes, closing file descriptors when streams are destroyed.

### SE lens
The design principle is **graceful degradation in API contracts**. The alternative NOT chosen is crashing when `realloc` is passed `NULL` or size 0. The real tradeoff is slightly more branching overhead inside `mm_realloc` in exchange for strict POSIX standard compliance, allowing arbitrary application code to use our allocator without modification.

### Commands needed
None.

### Run it
Trace `mm_realloc(0x1010, 100)`: `size=100`. `oldsize=56`. `newsize=MAX((100+8+7)&~7,24) = MAX(104,24) = 104`. `104 > 56`: need more. `mm_malloc(100)` -> new block at `0x2000` (from `extend_heap`). `memcpy(0x2000, 0x1010, 56-8=48)`: copy 48 bytes of old payload to new. `mm_free(0x1010)`: marks `0x1010` as free, coalesces. Return `0x2000`.

### One sentence connecting to previous unit
With the ability to initialize, allocate, and free memory dynamically, the allocator is completely self-sufficient.

## Closing
### Connect the pieces
Tracing `mm_malloc(48) -> mm_free() -> mm_malloc(48)` shows the entire system working together. First, `mm_malloc(48)` computes an adjusted size of 56. It scans the `free_listp` via `find_fit`, discovers a suitable block (say the initial 4096-byte chunk), plucks it from the free list via `remove_free`, splits it in `place`, writes new boundary tags, inserts the 4040-byte remainder via `insert_free`, and returns the 56-byte payload pointer. Next, `mm_free()` takes that pointer, computes the 56-byte boundary tags to wipe the allocation bits, and calls `coalesce()`. Because the neighboring 4040-byte block is free, it hits Case 2, combining them back into a single 4096-byte block and re-inserting it at the head of `free_listp`. Finally, the second `mm_malloc(48)` performs exactly the same routine, immediately finding the newly coalesced 4096-byte chunk, splitting it again, and handing the memory back to the user.

`mm.c` is glibc malloc minus segregated size classes and thread caches — the core algorithm is identical, the optimizations are engineering.
