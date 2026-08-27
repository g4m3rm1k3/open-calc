# Lesson 25: Dynamic Memory Allocation — How malloc and free Work

What you will build: The reader will understand how dynamic memory allocation works: what the heap is, how malloc() finds free space, how free() reclaims it, what fragmentation means, and what causes common bugs like heap overflow, use-after-free, and double-free. The transferable insight: malloc is not magic — it is a C program managing a pool of memory using a free list. Every heap bug — overflow, use-after-free, double-free — makes sense once you understand the allocator's data structures.

What you need to know first: Lessons 00-24.

Terms used in this lesson:
- **heap** — The region of process memory reserved for dynamic allocation, growing upwards. It solves the problem of needing memory whose lifetime or size isn't known at compile time.
- **virtual memory** — An abstraction that provides each process with the illusion of a large, contiguous, private address space.
- **allocator** — The runtime component (usually part of libc) responsible for managing the heap space, fielding malloc and free requests.
- **block** — A contiguous chunk of memory on the heap consisting of a header and a payload.
- **header** — Metadata immediately preceding the payload of a block, storing its size and allocation status.
- **payload** — The actual usable memory region handed back to the user program by malloc.
- **free list** — A data structure (implicit or explicit) used by the allocator to track which blocks are available.
- **fragmentation** — Wasted memory space that cannot be used for new allocations.
- **internal fragmentation** — Wasted space inside an allocated block (e.g., due to alignment padding).
- **external fragmentation** — Wasted space between allocated blocks, where total free memory is sufficient but not contiguous.
- **splitting** — The process of dividing a large free block into a smaller allocated block and a smaller free block.
- **coalescing** — The process of merging adjacent free blocks into a single larger free block.
- **buffer overflow** — Writing more data into a memory block than it was allocated to hold.
- **use-after-free** — Accessing a memory block after it has been passed to free.
- **double-free** — Attempting to free a memory block that is already free.
- **implicit free list** — A free list where all blocks (free and allocated) are traversed by reading sizes from headers.

Objects and methods used:

- **sbrk**
  - *What it is:* A system call wrapper that changes the location of the program break.
  - *Implementation:* `void *sbrk(intptr_t increment);`
  - *Its use:* Used to demonstrate how the heap grows by asking the OS for more memory.
  - *Type:* C standard library function (POSIX).
  - *Responsibility:* Adjusts the end of the data segment (program break) to allocate or deallocate memory.
  - *Depends on:* Operating system kernel memory management.
  - *Connects to:* Called by our user code; calls OS-internal memory allocation routines.
  - *Shape:* A low-level system API boundary between process and OS.

- **malloc**
  - *What it is:* The standard C library function for dynamic memory allocation.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* Used to request blocks of memory from the heap.
  - *Type:* C standard library function.
  - *Responsibility:* Finds or creates a free block of memory of at least the requested size and returns a pointer to its payload.
  - *Depends on:* A lower-level OS allocator (like `sbrk` or `mmap`) and its own internal free list structure.
  - *Connects to:* Called by our code; calls OS APIs when out of space.
  - *Shape:* The primary user-facing dynamic memory interface.

- **free**
  - *What it is:* The standard C library function to release dynamically allocated memory.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* Used to return a previously allocated block to the heap allocator.
  - *Type:* C standard library function.
  - *Responsibility:* Marks a block as free and potentially coalesces it with neighboring free blocks to prevent fragmentation.
  - *Depends on:* The pointer provided must have been returned by a previous malloc/calloc/realloc call.
  - *Connects to:* Called by user code. Modifies the internal heap free list.
  - *Shape:* User-facing memory deallocation interface.

- **printf**
  - *What it is:* Standard C library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used to print memory addresses and sizes to verify heap behavior.
  - *Type:* C standard library function.
  - *Responsibility:* Formats data according to a format string and writes it to standard output.
  - *Depends on:* Standard output stream (stdout).
  - *Connects to:* Called by user code; calls write() syscall internally.
  - *Shape:* Standard output interface.

- **memcpy**
  - *What it is:* Standard C library function to copy blocks of memory.
  - *Implementation:* `void *memcpy(void *dest, const void *src, size_t n);`
  - *Its use:* Used here to demonstrate a heap buffer overflow by copying more bytes than allocated.
  - *Type:* C standard library function.
  - *Responsibility:* Copies exactly `n` bytes from source to destination memory.
  - *Depends on:* Valid source and destination memory regions of at least size `n`.
  - *Connects to:* Called by user code.
  - *Shape:* Memory utility interface.

## Concept Unit: The heap — what it is and how it grows

### The Problem
Where does memory come from when we don't know how much we need until the program is already running? If local variables live on the stack and global variables live in the data segment, how does a program request memory dynamically? What does the operating system actually give us when we ask for more space?

### Introduce the concept in isolation
```c
#include <unistd.h>
#include <stdio.h>

int main(void)
{
    void *start = sbrk(0);  /* current program break (top of heap) */
    printf("Heap start: %p\n", start);

    sbrk(4096);  /* grow heap by 4096 bytes */
    void *after = sbrk(0);
    printf("Heap after:  %p\n", after);
    printf("Difference:  %ld bytes\n", (char*)after - (char*)start);
    /* Output (addresses illustrative):
       Heap start: 0x1234000
       Heap after:  0x1235000
       Difference:  4096 bytes */
    return 0;
}
```
This demonstrates the **heap**, a contiguous region of virtual memory that grows upward. `sbrk(0)` returns the current break pointer. `sbrk(4096)` asks the OS for 4096 more bytes of heap. The difference is exactly 4096 bytes. This proves the heap is a contiguous region that grows by explicit OS request.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- Reference Source: Standalone theory lesson — no running project.
- Files affected: `heap_demo.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: POSIX system headers (`unistd.h`).

### The New Code
```c
void *start = sbrk(0);
sbrk(4096);
void *after = sbrk(0);
```

### The Updated Project
```c
1: #include <unistd.h>
2: 
3: int main(void)
4: {
5:     void *start = sbrk(0);  // ← new
6:     sbrk(4096);             // ← new
7:     void *after = sbrk(0);  // ← new
8:     return 0;
9: }
```
This minimal setup initializes a starting pointer, expands the heap, and captures the new boundary.

### Mechanical walkthrough
- `void *`: A pointer to an unknown type.
- `start`: A variable name to store the initial heap boundary.
- `=`: The assignment operator.
- `sbrk`: The system call wrapper to change the program break.
- `(`: Opens the argument list.
- `0`: The integer literal passed to `sbrk`, meaning "increase by 0 bytes" (just fetch current break).
- `)`: Closes the argument list.
- `;`: Statement terminator.
- `sbrk(4096)`: A function call increasing the heap by exactly `4096` bytes.
- `void *after = sbrk(0);`: Captures the new program break after the expansion.

### CS lens
The concept here is **virtual memory allocation**. Programs don't deal with physical RAM chips; they deal with an address space. Three other places this appears: 
1. Database engines growing their internal buffer pools. 
2. Virtual machines (like the JVM) expanding their memory arena. 
3. Browsers allocating memory for a new WebAssembly instance.

### SE lens
The design principle here is **abstraction of resources**. The alternative NOT chosen is having every program explicitly map physical hardware pages. The real tradeoff is overhead: the OS must maintain page tables and map virtual addresses to physical ones on the fly, costing a small amount of performance (TLB misses) for massive gains in security and programming simplicity.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The output will show two addresses differing by exactly 4096 bytes.

### One sentence connecting to previous unit
Now that we know how the raw memory is obtained from the OS, we need a way to organize it into usable chunks.

## Concept Unit: The allocator's view — blocks and headers

### The Problem
If the heap is just a massive array of bytes, how does `malloc` know where the free spaces are? When you call `free(ptr)`, you don't pass the size — how does `free` know how many bytes to reclaim?

### Introduce the concept in isolation
```c
/* Each block in the heap looks like this: */
struct block_header {
    size_t size;   /* size of this block INCLUDING the header, in bytes */
    int    free;   /* 1 = free, 0 = allocated */
};

/* Heap with 3 blocks (conceptual diagram): */
/*
   Address 0x1000:
   [ header: size=32, free=0 | payload: 24 bytes       ]
   [ header: size=64, free=1 | payload: 56 bytes (free) ]
   [ header: size=16, free=0 | payload: 8 bytes        ]
*/

void *heap_start; 
void *heap_end;   

void print_heap(void) {
    struct block_header *hdr = heap_start;
    while ((void*)hdr < heap_end) {
        printf("block at %p: size=%zu, %s\n",
               (void*)hdr, hdr->size,
               hdr->free ? "FREE" : "ALLOCATED");
        hdr = (struct block_header*)((char*)hdr + hdr->size);
    }
}
```
This is an **implicit free list**. We trace `print_heap` for the 3-block example: start at 0x1000, print block (size=32, ALLOCATED), advance 32 bytes to 0x1020, print (size=64, FREE), advance 64 bytes to 0x1060, print (size=16, ALLOCATED), advance 16 bytes to 0x1070 = heap_end, stop. This proves the allocator embeds metadata directly in the heap to track sizes and statuses.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- Reference Source: Standalone theory lesson — no running project.
- Files affected: `allocator.h` (created).
- Change type: add.
- Location: entire file.
- Dependencies: None.

### The New Code
```c
struct block_header {
    size_t size;
    int free;
};
```

### The Updated Project
```c
1: #include <stddef.h>
2: 
3: struct block_header {  // ← new
4:     size_t size;       // ← new
5:     int free;          // ← new
6: };                     // ← new
```
This structure defines the metadata embedded before every allocation on the heap.

### Mechanical walkthrough
- `struct`: The C keyword defining a custom composite data type.
- `block_header`: The name of the structure.
- `{`: Opens the struct definition.
- `size_t`: An unsigned integer type used for representing sizes in bytes.
- `size`: The struct member holding the total size of the block.
- `;`: Statement terminator.
- `int`: The standard integer type.
- `free`: The struct member acting as a boolean flag (1 for free, 0 for allocated).
- `}`: Closes the struct definition.
- `;`: Terminates the struct declaration.

### CS lens
The fundamental CS concept is **embedded metadata**. Data structures can store their own bookkeeping information alongside the actual data. Three real-world places this appears:
1. Network packets (IP headers followed by payload).
2. File systems (inodes embedded on disk next to file contents).
3. Image files (EXIF data leading the raw pixel array).

### SE lens
The design principle is **in-band signaling**. The alternative NOT chosen is storing the metadata in a completely separate dictionary or hash map (out-of-band). The real tradeoff is locality: embedded metadata is fast to access and scales perfectly with the data, but it is vulnerable to being overwritten if the user accidentally writes past the bounds of the payload.

### Commands needed
None for this unit.

### Run it
Predicted confidently: A traversal function using this struct will accurately step from block to block by adding `size` to the current pointer.

### One sentence connecting to previous unit
Now that we have blocks with headers, we need an algorithm to decide which free block to use when a program calls `malloc`.

## Concept Unit: Placement policies — first fit, next fit, best fit

### The Problem
If the heap has many free blocks scattered throughout it, how do we choose one when `malloc` is called? Do we take the first one we find, or search the whole heap for the most perfectly sized one?

### Introduce the concept in isolation
```c
void *heap_start;
void *heap_end;

struct block_header {
    size_t size;
    int free;
};

/* First fit: scan from the beginning, use the first block with size >= n */
void *first_fit(size_t needed) {
    struct block_header *hdr = heap_start;
    while ((void*)hdr < heap_end) {
        if (hdr->free && hdr->size >= needed + sizeof(*hdr))
            return hdr;  /* found */
        hdr = (struct block_header*)((char*)hdr + hdr->size);
    }
    return NULL;  /* no fit: need to grow heap */
}

/* Best fit: scan ALL free blocks, pick the smallest that fits */
void *best_fit(size_t needed) {
    struct block_header *hdr = heap_start;
    struct block_header *best = NULL;
    while ((void*)hdr < heap_end) {
        if (hdr->free && hdr->size >= needed + sizeof(*hdr)) {
            if (!best || hdr->size < best->size)
                best = hdr;
        }
        hdr = (struct block_header*)((char*)hdr + hdr->size);
    }
    return best;
}
```
This shows **placement policies**. Trace first_fit for needed=20, on a 3-block heap: check block 0 (size=32, ALLOCATED) -> skip. Check block 1 (size=64, FREE, size >= 28) -> return. Trace best_fit: same heap, needed=20: check all three blocks, block 1 is free and fits -> best = block 1. Result: same as first_fit for this heap. Contrast: on a heap with free blocks of size 30 and 100, first_fit picks 30 (good), best_fit picks 30 (same here), but first_fit scans less. This proves different policies have different performance and fragmentation tradeoffs.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- Reference Source: Standalone theory lesson — no running project.
- Files affected: `allocator.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: `allocator.h`.

### The New Code
```c
void *first_fit(size_t needed) {
    struct block_header *hdr = heap_start;
    while ((void*)hdr < heap_end) {
        if (hdr->free && hdr->size >= needed + sizeof(*hdr)) return hdr;
        hdr = (struct block_header*)((char*)hdr + hdr->size);
    }
    return NULL;
}
```

### The Updated Project
```c
1: #include "allocator.h"
2: 
3: extern void *heap_start;
4: extern void *heap_end;
5: 
6: void *first_fit(size_t needed) {                            // ← new
7:     struct block_header *hdr = heap_start;                  // ← new
8:     while ((void*)hdr < heap_end) {                         // ← new
9:         if (hdr->free && hdr->size >= needed + sizeof(*hdr))// ← new
10:             return hdr;                                     // ← new
11:         hdr = (struct block_header*)((char*)hdr + hdr->size); // ← new
12:     }                                                       // ← new
13:     return NULL;                                            // ← new
14: }                                                           // ← new
```
This implements a first-fit search algorithm to find the first available block large enough for a memory request.

### Mechanical walkthrough
- `void *`: Pointer to an unknown type, used as the return type.
- `first_fit`: The name of the function.
- `(`: Opens parameter list.
- `size_t`: Unsigned integer type for size.
- `needed`: The requested payload size in bytes.
- `)`: Closes parameter list.
- `{`: Opens function body.
- `struct block_header *`: A pointer to a block header.
- `hdr`: The local loop variable tracking the current block.
- `=`: Assignment operator.
- `heap_start`: The global pointer to the start of the heap.
- `;`: Statement terminator.
- `while`: Loop keyword.
- `(`: Opens loop condition.
- `(void*)`: Casts the struct pointer to a raw void pointer for byte-level address comparison.
- `hdr`: The variable being checked.
- `<`: Less-than comparison operator.
- `heap_end`: The global pointer to the end of the heap.
- `)`: Closes loop condition.
- `{`: Opens loop body.
- `if`: Conditional statement keyword.
- `(`: Opens condition.
- `hdr->free`: Accesses the `free` field using the arrow operator (dereference and access).
- `&&`: Logical AND operator.
- `hdr->size`: Accesses the `size` field.
- `>=`: Greater-than-or-equal-to operator.
- `needed`: The requested size.
- `+`: Addition operator.
- `sizeof`: Operator that computes the size of a type in bytes.
- `(*hdr)`: Dereferences the pointer to yield the struct itself.
- `)`: Closes condition.
- `return`: Keyword to exit the function with a value.
- `hdr`: The pointer to the found block.
- `;`: Statement terminator.
- `hdr`: The local variable to update.
- `=`: Assignment.
- `(struct block_header*)`: Casts a void/char pointer back to a struct pointer.
- `(`: Opens grouping.
- `(char*)`: Casts to a character pointer, enabling byte-granular arithmetic.
- `hdr`: The current pointer.
- `+`: Pointer addition operator.
- `hdr->size`: The number of bytes to advance.
- `)`: Closes grouping.
- `;`: Statement terminator.
- `}`: Closes loop body.
- `return`: Keyword.
- `NULL`: A macro representing a null pointer (no block found).
- `;`: Statement terminator.
- `}`: Closes function body.

### CS lens
The concept here is **search heuristics**. Finding the perfect solution (Best Fit) can be slow, so we often settle for a "good enough" solution (First Fit) to save time. Three real-world places this appears:
1. Bin packing algorithms in logistics and shipping.
2. OS process scheduling (picking the next task to run).
3. Network routing (finding a route quickly vs calculating the absolute optimal path).

### SE lens
The design principle is **time vs. space tradeoffs**. The alternative NOT chosen is always using best-fit to minimize wasted space. The real tradeoff is performance: best-fit requires scanning the entire free list (O(N) time), whereas first-fit stops as soon as it finds a valid block, drastically speeding up allocations at the cost of leaving smaller, fragmented holes in the heap.

### Commands needed
None for this unit.

### Run it
Predicted confidently: For a heap with adequate space, first_fit returns the address of the first valid free block without scanning further.

### One sentence connecting to previous unit
But if our placement policy leaves a large free block only partially used, what happens to the remaining space?

## Concept Unit: Fragmentation — internal and external

### The Problem
If `malloc(1)` gives us a block, why does it actually consume 24 bytes? If we have 128 bytes of total free memory, why might `malloc(128)` still fail?

### Introduce the concept in isolation
```c
/* Scenario demonstrating internal fragmentation: */
void *p = malloc(1);
/* Block header: 8 bytes, payload: 1 byte requested, padding: 15 bytes */
/* Total block size: 24 bytes for 1 byte request */

/* Scenario demonstrating external fragmentation: */
void *a = malloc(64);   /* allocate 64 bytes */
void *b = malloc(64);   /* allocate 64 bytes */
void *c = malloc(64);   /* allocate 64 bytes */
free(a);                /* free block A */
free(c);                /* free block C */
/* Heap: [FREE:64][ALLOC:64][FREE:64] */
/* Total free: 128 bytes. But malloc(128) FAILS */
```
This is **fragmentation**. Trace the heap state after each operation. Show why `malloc(128)` fails: the two 64-byte blocks are separated by an allocated block (`b`), so there is no contiguous 128-byte chunk. This proves that having enough total bytes is not sufficient; the bytes must be contiguous. 

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- Reference Source: Standalone theory lesson — no running project.
- Files affected: None.
- Change type: conceptual.
- Location: n/a.
- Dependencies: None.

### The New Code
```c
/* Conceptual snippet only */
void *a = malloc(64);
void *b = malloc(64);
void *c = malloc(64);
free(a);
free(c);
```

### The Updated Project
```c
1: // This unit exists to demonstrate a concept.
2: // No new persistent code is added to the allocator here.
3: void *a = malloc(64); // ← new
4: void *b = malloc(64); // ← new
5: void *c = malloc(64); // ← new
6: free(a);              // ← new
7: free(c);              // ← new
```
This sequence of allocations and deallocations artificially induces external fragmentation, leaving "holes" in the heap.

### Mechanical walkthrough
- `/* Conceptual snippet only */`: A C-style comment block.
- `void *`: Pointer to an unknown type.
- `a`: Variable storing a heap address.
- `=`: Assignment operator.
- `malloc`: The standard allocation function.
- `(`: Opens argument list.
- `64`: Integer literal requesting 64 bytes of memory.
- `)`: Closes argument list.
- `;`: Statement terminator.
- `void *`: Type.
- `b`: Second pointer variable.
- `=`: Assignment.
- `malloc(64)`: Function call.
- `;`: Statement terminator.
- `void *`: Type.
- `c`: Third pointer variable.
- `=`: Assignment.
- `malloc(64)`: Function call.
- `;`: Statement terminator.
- `free`: The standard deallocation function.
- `(`: Opens argument list.
- `a`: Passes the pointer to be freed.
- `)`: Closes argument list.
- `;`: Statement terminator.
- `free(c)`: Frees the third block.
- `;`: Statement terminator.

### CS lens
The concept here is **memory fragmentation**. When a resource is allocated in continuous chunks of varying sizes over time, holes inevitably develop. Three real-world places this appears:
1. File systems on spinning hard drives (disk fragmentation).
2. IPv4 packet transmission (fragmenting and reassembling packets over networks).
3. Relational databases (pages getting fragmented after many row deletes).

### SE lens
The design principle is **alignment and padding**. The alternative NOT chosen is allowing allocations to start at any arbitrary byte address. The real tradeoff is speed vs space: modern CPUs fetch memory much faster if it is aligned to word boundaries (e.g., 8 or 16 bytes), so we waste small amounts of space (internal fragmentation) to guarantee fast hardware access.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `malloc(128)` will return `NULL` (or trigger an OS-level heap expansion) because the existing 128 bytes of free space are physically split by an active allocation.

### One sentence connecting to previous unit
If we allocate a small amount of memory from a massive free block, we shouldn't waste the rest of the block — we need a way to cut it in two.

## Concept Unit: Splitting and coalescing

### The Problem
If `first_fit` selects a 1024-byte free block for a 32-byte request, how do we avoid wasting 992 bytes? Conversely, when two adjacent blocks become free, how do we merge them back into one big block to prevent external fragmentation?

### Introduce the concept in isolation
```c
struct block_header {
    size_t size;
    int free;
};

void allocate(struct block_header *blk, size_t needed) {
    size_t total   = needed + sizeof(struct block_header);
    size_t leftover = blk->size - total;
    if (leftover >= sizeof(struct block_header) + 8) {
        /* Split: create a new free block from the remainder */
        struct block_header *remainder =
            (struct block_header*)((char*)blk + total);
        remainder->size = leftover;
        remainder->free = 1;
        blk->size = total;
    }
    blk->free = 0;
}

void coalesce(struct block_header *blk) {
    /* Look at the next block */
    struct block_header *next =
        (struct block_header*)((char*)blk + blk->size);
    /* In a real system, we'd check against heap_end here */
    if (next->free) {
        /* Merge: absorb next block into blk */
        blk->size += next->size;  
    }
}
```
This is **splitting and coalescing**. Trace: `free(a)` on the `[FREE:64][ALLOC:64][FREE:64]` heap leaves it fragmented. After coalescing: if `b` is freed, then merging `a`, `b`, and `c` yields `[FREE:192]`. This proves that actively managing boundaries prevents the heap from slowly dissolving into microscopic, unusable chunks.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- Reference Source: Standalone theory lesson — no running project.
- Files affected: `allocator.c`.
- Change type: add.
- Location: bottom of the file.
- Dependencies: `allocator.h`.

### The New Code
```c
void coalesce(struct block_header *blk) {
    struct block_header *next = (struct block_header*)((char*)blk + blk->size);
    if (next->free) {
        blk->size += next->size;
    }
}
```

### The Updated Project
```c
12:         hdr = (struct block_header*)((char*)hdr + hdr->size);
13:     }
14:     return NULL;
15: }
16: 
17: void coalesce(struct block_header *blk) {                                    // ← new
18:     struct block_header *next = (struct block_header*)((char*)blk + blk->size); // ← new
19:     if (next->free) {                                                        // ← new
20:         blk->size += next->size;                                             // ← new
21:     }                                                                        // ← new
22: }                                                                            // ← new
```
This function inspects the next block in memory and, if it is free, absorbs it into the current block by simply extending the current block's size.

### Mechanical walkthrough
- `void`: Return type meaning nothing is returned.
- `coalesce`: The function name.
- `(`: Opens parameter list.
- `struct block_header *`: A pointer to a block header.
- `blk`: The parameter representing the current block.
- `)`: Closes parameter list.
- `{`: Opens function body.
- `struct block_header *`: A pointer type.
- `next`: The local variable to hold the adjacent block.
- `=`: Assignment operator.
- `(struct block_header*)`: Casts to a struct pointer.
- `(`: Opens grouping.
- `(char*)`: Casts to character pointer for math.
- `blk`: The current pointer.
- `+`: Addition operator.
- `blk->size`: Size of the current block.
- `)`: Closes grouping.
- `;`: Statement terminator.
- `if`: Conditional keyword.
- `(`: Opens condition.
- `next->free`: Checks if the adjacent block is free.
- `)`: Closes condition.
- `{`: Opens block.
- `blk->size`: The size of the current block.
- `+=`: Compound addition-assignment operator.
- `next->size`: The size of the adjacent block.
- `;`: Statement terminator.
- `}`: Closes if block.
- `}`: Closes function body.

### CS lens
The concept here is **defragmentation**. Combining adjacent small free regions into larger contiguous ones restores the ability to satisfy large requests. Three real-world places this appears:
1. Hard drive defragmentation utilities.
2. Garbage collection compaction phases (moving objects to create large free spaces).
3. Buddy memory allocation in the Linux kernel (merging adjacent "buddies").

### SE lens
The design principle is **lazy vs. eager evaluation**. The alternative NOT chosen is delaying coalescing until `malloc` fails to find space. The real tradeoff is latency: doing it eagerly on every `free` call makes `free` slightly slower but keeps the heap tidy; doing it lazily makes `free` O(1) but introduces massive latency spikes in `malloc` when defragmentation is eventually forced.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The `blk->size` will exactly equal the sum of the two individual sizes, effectively erasing the boundary header of the `next` block from the allocator's logical view.

### One sentence connecting to previous unit
Because the allocator relies on these headers existing untouched in memory, what happens if our application accidentally writes over them?

## Concept Unit: Heap bugs — overflow, use-after-free, double-free

### The Problem
Why does C have a reputation for being unsafe? If `malloc` returns a pointer and you use it, how can things go disastrously wrong simply by writing slightly past the end of an array?

### Introduce the concept in isolation
```c
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

int main(void)
{
    char *buf = malloc(10);

    /* Bug 1: heap buffer overflow */
    memcpy(buf, "hello world!", 13);  
    /* Overwrites the header of the NEXT block */
    /* Corrupts allocator metadata -> crash or silent corruption */

    free(buf);

    /* Bug 2: use-after-free */
    buf[0] = 'X';  
    /* The allocator may have reused this block -> corrupts new allocation */

    /* Bug 3: double-free */
    free(buf);  
    /* Corrupts the free list -> next malloc() may return the same block twice */

    return 0;
}
```
These are **heap memory bugs**. Trace each bug mechanically: writing 13 bytes into a 10-byte allocation overwrites the adjacent `block_header`. When `free` later tries to read `size`, it reads garbage characters ('r', 'l', 'd') interpreted as an integer, causing wild pointer arithmetic. This proves that heap bugs are essentially corruptions of the allocator's hidden data structures, which live right next to the user's data.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- Reference Source: Standalone theory lesson — no running project.
- Files affected: `bugs.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: `stdlib.h`, `string.h`.

### The New Code
```c
char *buf = malloc(10);
memcpy(buf, "hello world!", 13);
free(buf);
buf[0] = 'X';
free(buf);
```

### The Updated Project
```c
1: #include <stdlib.h>
2: #include <string.h>
3: 
4: int main(void) {
5:     char *buf = malloc(10);            // ← new
6:     memcpy(buf, "hello world!", 13);   // ← new
7:     free(buf);                         // ← new
8:     buf[0] = 'X';                      // ← new
9:     free(buf);                         // ← new
10:    return 0;
11: }
```
This is a comprehensive demonstration of the three most dangerous memory errors in C, placed in a single control flow.

### Mechanical walkthrough
- `char *`: Pointer to a character (byte).
- `buf`: Variable to store the allocated memory.
- `=`: Assignment.
- `malloc(10)`: Requests 10 bytes from the allocator.
- `;`: Statement terminator.
- `memcpy`: Memory copy function.
- `(`: Opens arguments.
- `buf`: Destination pointer.
- `,`: Argument separator.
- `"hello world!"`: Source string literal (13 bytes including null terminator).
- `,`: Argument separator.
- `13`: Number of bytes to copy.
- `)`: Closes arguments.
- `;`: Statement terminator.
- `free(buf)`: Deallocates the memory.
- `;`: Statement terminator.
- `buf[0]`: Array access operator applied to the freed pointer.
- `=`: Assignment.
- `'X'`: Character literal.
- `;`: Statement terminator.
- `free(buf)`: Deallocates the already freed memory.
- `;`: Statement terminator.

### CS lens
The concept here is **memory corruption**. Because C has no runtime bounds checking, it relies on developer discipline. Three real-world places this appears:
1. Browser exploits (where an attacker crafts a payload to overwrite an object's virtual method table).
2. Network service crashes (like Heartbleed, which read past bounds).
3. Video game modding (using overflows to inject custom code).

### SE lens
The design principle is **fail-fast vs undefined behavior**. The alternative NOT chosen is having the allocator check bounds on every write. The real tradeoff is language design philosophy: C trades absolute safety for maximum performance, deciding that bounds-checking is the programmer's job, resulting in undefined behavior if violated.

### Commands needed
To see the exact damage, compile with AddressSanitizer:
`clang -fsanitize=address bugs.c`
or run with Valgrind:
`valgrind --tool=memcheck ./a.out`

### Run it
Predicted confidently: Running this under Valgrind will report "Invalid write of size 1", "Invalid free() / delete / delete[] / realloc()", and "Heap block overrun", likely culminating in a segmentation fault.

### One sentence connecting to previous unit
Now that we have seen the catastrophic results of misusing the heap, we understand exactly why memory safety is so critical.

## Closing

### Connect the pieces
You now understand how the heap allocator works. A complete scenario: the program starts and calls `sbrk` to claim virtual memory. `malloc(32)` is called, the allocator creates a `block_header` marking it allocated, and returns the payload. The user writes to the payload safely. When `malloc(100)` is called, the allocator uses `first_fit` to scan the headers; if it fails, it calls `sbrk` again. When `free` is called, the block is marked free, and `coalesce` absorbs any adjacent free blocks to defeat external fragmentation. 

Every heap bug — overflow, use-after-free, double-free — is a corruption of the allocator's own metadata, not just the payload. Lesson 26 implements a complete simple malloc from scratch.
