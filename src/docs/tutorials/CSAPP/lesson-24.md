# Lesson 24: Address Translation — MMU, Multi-Level Page Tables, and the TLB

What you will build: The reader will understand address translation at the hardware level: how the MMU walks a multi-level page table to convert a virtual address to a physical address on every memory access, and how the TLB caches recent translations to make this fast. The transferable insight: multi-level page tables are an application of the exact same principle as tries and radix trees — trading lookup time for storage compactness. The TLB is simply the cache for the page table, applying the same locality principles as the CPU cache.

What you need to know first: Lessons 00-23.

Terms used in this lesson:
- **Virtual Address (VA)** — An address used by an application program. It is the illusion of a continuous, private memory space, independent of actual physical RAM layout. It exists to isolate processes and simplify linking.
- **Physical Address (PA)** — An actual address on the hardware memory bus. The memory controller uses this to fetch data from physical RAM chips.
- **Page** — A fixed-size contiguous block of virtual memory (typically 4KB on x86). It is the minimum unit of memory management and protection.
- **Frame (Physical Page)** — A fixed-size contiguous block of physical memory, exactly the same size as a virtual page. A virtual page is mapped to a physical frame.
- **Page Table** — A data structure used by the virtual memory system in an operating system to store the mapping between virtual addresses and physical addresses. It solves the problem of needing to locate physical data for any given virtual access.
- **Memory Management Unit (MMU)** — The hardware component inside the CPU that automatically translates virtual addresses to physical addresses on every memory access, using the page table. It offloads translation from software to fast hardware.
- **Translation Lookaside Buffer (TLB)** — A small, extremely fast hardware cache inside the MMU that stores recent virtual-to-physical address translations. It solves the performance catastrophe of having to read the page table from slow RAM on every single CPU memory access.
- **Page Table Entry (PTE)** — A single record in a page table mapping one virtual page number to one physical frame number, along with permission and status bits.
- **Page Global Directory (PGD) / Level-4 Table** — The top-level table in a 4-level paging scheme (like x86-64).
- **CR3 Register** — An x86 CPU register that holds the physical base address of the current process's top-level page table (PGD). The MMU uses this as the starting point for every page table walk.
- **Context Switch** — The OS procedure of pausing one process and resuming another. It requires changing the active page table (usually by writing a new value to CR3).
- **Address Space ID (ASID) / PCID** — A hardware tag added to TLB entries identifying which process they belong to. It allows TLB entries from multiple processes to coexist, avoiding the need to flush the entire TLB on every context switch.
- **Virtual Memory Area (VMA)** — A contiguous range of virtual addresses with the same permissions and backing store, managed by the OS (e.g., the heap, the stack, a memory-mapped file).

Objects and methods used:
- `printf`
  - *What it is:* A standard library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used to print the results of throwaway calculations and inspect memory addresses.
  - *Type:* Standard library function.
  - *Responsibility:* Formats and prints data to the standard output stream.
  - *Depends on:* A format string and a variable number of arguments matching the format specifiers.
  - *Connects to:* Calls underlying OS write system calls.
  - *Shape:* A fundamental I/O utility function.
- `getpid`
  - *What it is:* A POSIX system call that returns the process ID of the calling process.
  - *Implementation:* `pid_t getpid(void);`
  - *Its use:* Used to dynamically determine the PID to construct the path to `/proc/<PID>/maps`.
  - *Type:* POSIX system call wrapper.
  - *Responsibility:* Retrieves the unique identifier assigned to the current process by the OS.
  - *Depends on:* Nothing (takes `void`).
  - *Connects to:* The OS kernel's process management structures.
  - *Shape:* An OS interaction primitive.
- `malloc`
  - *What it is:* A standard library function for dynamic memory allocation.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* Used to allocate memory on the heap to demonstrate where heap VMAs live.
  - *Type:* Standard library function.
  - *Responsibility:* Allocates a contiguous block of memory of at least the requested size and returns a pointer to it.
  - *Depends on:* The requested size in bytes.
  - *Connects to:* The process's heap manager, potentially invoking `brk` or `mmap` system calls to expand the heap.
  - *Shape:* The primary interface for dynamic memory.
- `free`
  - *What it is:* A standard library function to release dynamically allocated memory.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* Used to clean up the memory allocated by `malloc`.
  - *Type:* Standard library function.
  - *Responsibility:* Returns previously allocated memory to the heap manager so it can be reused.
  - *Depends on:* A pointer previously returned by `malloc`, `calloc`, or `realloc`.
  - *Connects to:* The process's heap manager internal structures.
  - *Shape:* The required counterpart to dynamic allocation.

## Concept Unit: Why a single-level page table is impractical

### The Problem
If every process needs its own isolated virtual memory space, the hardware needs a way to translate every virtual address into a physical address. The simplest idea is an array: use the virtual page number as an index, and store the physical frame number at that index. But how big would that array need to be for a modern 64-bit system? Would it fit in memory? What happens if you only use a few kilobytes of your massive virtual address space?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main(void)
{
    /* Single-level page table for 48-bit virtual address space */
    long pages   = 1L << (48 - 12);  /* 2^36 pages of 4KB */
    long pte_size = 8;                /* 8 bytes per PTE */
    long table_bytes = pages * pte_size;
    printf("Single-level page table size: %ld bytes = %ld GB\n",
           table_bytes, table_bytes >> 30);
    /* Output: Single-level page table size: 549755813888 bytes = 512 GB */
    /* Completely impractical for a per-process table */
    return 0;
}
```
This output proves that a **single-level page table** is completely impossible for modern architectures. A 48-bit virtual address space with 4KB (12-bit) pages means 2^36 pages. At 8 bytes per entry, a flat array requires 512 GB of contiguous physical RAM *just to hold the translation table for one single process*. 

### Discard the throwaway
This throwaway C code is discarded. It exists only to prove the mathematical impossibility of flat page tables on 64-bit systems.

### Project Change
No reference counterpart — this is a standalone theory lesson exploring the hardware MMU architecture; there is no running C project to modify for this unit.
Files affected: None.
Change type: None.
Location: None.
Dependencies: None.

### The New Code
```c
/* No project code for this theoretical unit. */
```

### The Updated Project
```c
/* No project code for this theoretical unit. */
```

### Mechanical walkthrough
- `#include <stdio.h>`: Preprocessor directive. Includes the standard I/O library declarations. Returns nothing.
- `int main(void)`: Function definition. The entry point of the C program. Returns an integer exit status.
- `long pages = 1L << (48 - 12);`: Variable declaration and initialization. Calculates the number of virtual pages. The `<<` operator shifts the literal `1L` left by 36 bits, computing 2^36. Returns the calculated value to be stored in `pages`.
- `long pte_size = 8;`: Variable declaration. Sets the size of a single Page Table Entry to 8 bytes (typical for 64-bit systems).
- `long table_bytes = pages * pte_size;`: Variable declaration. Computes total table size by multiplying total pages by the size of each entry.
- `printf(...)`: Function call. Formats and prints the result. Takes a format string and the computed values. The `>> 30` operator divides by 2^30 to convert bytes to gigabytes. Returns the number of characters printed.
- `return 0;`: Return statement. Ends `main` and signals successful execution to the OS.

### CS lens
This demonstrates the fundamental CS concept of **sparse data structures**. When a space is massive but mostly empty (a typical process uses only a tiny fraction of its 256 TB address space), flat arrays are disastrously inefficient. Other places this appears:
- Sparse matrices in scientific computing (storing only non-zero elements).
- Hash tables (mapping a large key space to a smaller array).
- File system block allocation tables (not pre-allocating blocks for empty file space).

### SE lens
The design principle here is **lazy allocation vs. eager allocation**. The flat page table eagerly allocates space for every possible virtual address, regardless of whether it's used. The alternative, chosen in reality, is a hierarchical structure that only allocates tables for the regions of address space actually in use. The real tradeoff is memory vs. lookup time: a flat array guarantees an $O(1)$ single-memory-access lookup, while a sparse tree structure requires multiple memory accesses to resolve an address, costing CPU cycles to save RAM.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `Single-level page table size: 549755813888 bytes = 512 GB`. The arithmetic is deterministic: $2^{36} \times 8 = 549,755,813,888$.

### One sentence connecting to previous unit
Because a flat array is too large to exist, the hardware needs a way to look up addresses using a structure that can remain mostly unallocated.


## Concept Unit: x86-64 four-level page table walk

### The Problem
If we can't use a flat array, how do we structure the mapping so that we only use memory for the virtual addresses the process actually accesses, while still allowing the hardware MMU to look up translations quickly without complex software traversal?

### Introduce the concept in isolation
```c
/* Conceptual page table walk (hardware MMU does this automatically) */
typedef unsigned long pte_t;

pte_t *cr3;  /* base of PGD, loaded from CPU register CR3 */

unsigned long walk(unsigned long va) {
    /* Extract each 9-bit index */
    unsigned long pgd_idx = (va >> 39) & 0x1FF;
    unsigned long pud_idx = (va >> 30) & 0x1FF;
    unsigned long pmd_idx = (va >> 21) & 0x1FF;
    unsigned long pte_idx = (va >> 12) & 0x1FF;
    unsigned long offset  =  va        & 0xFFF;

    pte_t pgd_entry = cr3[pgd_idx];     /* level 4 */
    pte_t *pud = (pte_t*)(pgd_entry & ~0xFFF);  /* clear flag bits */
    pte_t pud_entry = pud[pud_idx];     /* level 3 */
    pte_t *pmd = (pte_t*)(pud_entry & ~0xFFF);
    pte_t pmd_entry = pmd[pmd_idx];     /* level 2 */
    pte_t *pte = (pte_t*)(pmd_entry & ~0xFFF);
    pte_t pte_entry = pte[pte_idx];     /* level 1 */

    unsigned long pfn = pte_entry >> 12;
    return (pfn << 12) | offset;         /* physical address */
}
```
This proves how a **multi-level page table** allows sparse allocation. By splitting the 36-bit Virtual Page Number into four 9-bit chunks, each chunk indexes into a 512-entry table (which conveniently fits exactly in one 4KB page: 512 * 8 bytes = 4096). If a large block of memory is unused, its top-level entry is marked invalid, and the lower-level tables for that block are simply never allocated.

### Discard the throwaway
This throwaway conceptual code is discarded. It is a software model of what the hardware MMU implements in silicon; we do not write this code in OS applications.

### Project Change
No reference counterpart — this is a standalone theory lesson.
Files affected: None.
Change type: None.
Location: None.
Dependencies: None.

### The New Code
```c
/* No project code for this theoretical unit. */
```

### The Updated Project
```c
/* No project code for this theoretical unit. */
```

### Mechanical walkthrough
- `typedef unsigned long pte_t;`: Type definition. Creates an alias `pte_t` for `unsigned long` (8 bytes), representing a page table entry.
- `pte_t *cr3;`: Variable declaration. Simulates the CPU's CR3 register, pointing to the base of the top-level table.
- `unsigned long walk(unsigned long va)`: Function definition. Simulates the hardware page table walk.
- `unsigned long pgd_idx = (va >> 39) & 0x1FF;`: Variable declaration. Shifts the virtual address right by 39 bits and masks with `0x1FF` (511, or 9 bits of 1s) to extract the top 9 bits. Returns the index into the level-4 table.
- `unsigned long pud_idx = (va >> 30) & 0x1FF;`: Variable declaration. Extracts the next 9 bits for the level-3 table index.
- `unsigned long pmd_idx = (va >> 21) & 0x1FF;`: Variable declaration. Extracts the next 9 bits for the level-2 table index.
- `unsigned long pte_idx = (va >> 12) & 0x1FF;`: Variable declaration. Extracts the last 9 bits of the VPN for the level-1 table index.
- `unsigned long offset = va & 0xFFF;`: Variable declaration. Masks the lowest 12 bits to extract the offset within the 4KB page.
- `pte_t pgd_entry = cr3[pgd_idx];`: Array access. Reads the level-4 entry using the extracted index.
- `pte_t *pud = (pte_t*)(pgd_entry & ~0xFFF);`: Pointer arithmetic/casting. The lower 12 bits of an entry contain flags (like present, writable). `~0xFFF` creates a mask to clear these flags, leaving only the physical base address of the next table, which is then cast to a pointer.
- `pte_t pud_entry = pud[pud_idx];`: Array access. Reads the level-3 entry.
- `pte_t *pmd = (pte_t*)(pud_entry & ~0xFFF);`: Pointer arithmetic. Gets the base of the level-2 table.
- `pte_t pmd_entry = pmd[pmd_idx];`: Array access. Reads the level-2 entry.
- `pte_t *pte = (pte_t*)(pmd_entry & ~0xFFF);`: Pointer arithmetic. Gets the base of the level-1 table.
- `pte_t pte_entry = pte[pte_idx];`: Array access. Reads the final level-1 entry, which contains the target physical frame.
- `unsigned long pfn = pte_entry >> 12;`: Variable assignment. Extracts the Physical Frame Number by shifting away the flag bits.
- `return (pfn << 12) | offset;`: Return statement. Combines the physical frame base address with the original page offset to form the final physical address.

### CS lens
This embodies the fundamental CS concept of a **radix tree (or trie)**. Instead of comparing whole keys, a trie traverses the structure by using chunks of the key (here, 9-bit chunks of the virtual address) to route through levels of nodes. Other places this appears:
- IP routing tables in networking gear.
- Autocomplete dictionary lookups.
- Linux kernel internal data structures (like the xarray/radix-tree used for page caches).

### SE lens
The design principle is **indirection**. By breaking a direct mapping into multiple steps, we gain flexibility (tables can be scattered in physical memory, not contiguous) and save space. The tradeoff is lookup latency. A flat table takes one memory read; this 4-level table takes four sequential memory reads before we even access the data we want. This is a massive latency penalty for every single pointer dereference in a program.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The function will deterministically extract bits and follow pointers. Tracing `va = 0x7fff12345678`: 
- `pgd_idx` = `0xFF`
- `pud_idx` = `0x1C8`
- `pmd_idx` = `0x091`
- `pte_idx` = `0x045`
- `offset` = `0x678`.
The exact output depends on the memory contents pointed to by `cr3`.

### One sentence connecting to previous unit
The multi-level page table solves the size problem but introduces a severe performance problem: every memory access now requires four extra memory accesses just to translate the address.


## Concept Unit: The TLB — Translation Lookaside Buffer

### The Problem
If a 4-level page table requires four memory reads (taking hundreds of CPU cycles each) just to figure out where a variable lives in physical RAM, why isn't every modern computer intolerably slow? How can the hardware avoid doing this walk for every single instruction?

### Introduce the concept in isolation
```c
#define N 4096
double A[N][N];  /* 128 MB: much larger than TLB reach */

int main() {
    /* TLB-friendly: stride-1 */
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            A[i][j] = 0.0;  /* sequential: TLB reuses entries, hit rate ~99% */

    /* TLB-hostile: stride = N (column-major) */
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            A[i][j] = 0.0;  /* each row = new page = new TLB entry needed */
                             /* TLB thrashes: ~100% miss rate */
    return 0;
}
```
This code proves the existence and impact of the **Translation Lookaside Buffer (TLB)**. The TLB is a tiny, fully associative cache inside the MMU that stores the result of recent page table walks (Virtual Page Number -> Physical Frame Number). 
In the first loop, we access memory sequentially. Because a page is 4KB (holding 512 8-byte doubles), the first access misses the TLB and costs a full 4-level walk, but the next 511 accesses hit in the TLB instantly.
In the second loop, we access memory column by column. Every single access jumps to a new row, which is a new 4KB page. Every single access misses the TLB, forcing a full 4-level walk every time. The TLB thrashes, and performance falls off a cliff.

### Discard the throwaway
This throwaway demonstration is discarded. It exists to illustrate memory access patterns that exploit or defeat the hardware TLB.

### Project Change
No reference counterpart.
Files affected: None.
Change type: None.
Location: None.
Dependencies: None.

### The New Code
```c
/* No project code for this theoretical unit. */
```

### The Updated Project
```c
/* No project code for this theoretical unit. */
```

### Mechanical walkthrough
- `#define N 4096`: Macro definition. Defines a constant size for our matrix.
- `double A[N][N];`: Global variable declaration. Allocates a massive 128MB 2D array of double-precision floats.
- `for (int i = 0; i < N; i++)`: `for` loop syntax. Iterates rows.
- `for (int j = 0; j < N; j++)`: `for` loop syntax. Iterates columns (contiguous in memory for C arrays).
- `A[i][j] = 0.0;`: Array access and assignment. Writes a float to the contiguous location.
- `for (int j = 0; j < N; j++)` (second block): `for` loop syntax. Iterates columns in the outer loop.
- `for (int i = 0; i < N; i++)` (second block): `for` loop syntax. Iterates rows in the inner loop, causing large jumps in memory addresses on every step.

### CS lens
This is an application of **Locality of Reference**, specifically spatial locality. Caches work because programs tend to access memory near where they just accessed memory. The TLB is just a specialized cache for page table entries. Other places this appears:
- CPU L1/L2/L3 data and instruction caches.
- Browser image caching.
- Database query result caching (memcached/Redis).

### SE lens
The design principle here is **memoization at the hardware level**. Walking the page table is a pure, deterministic function (given the same CR3 and same page table contents, VA X always maps to PA Y). Instead of recomputing this expensive function every time, the hardware stores the input-output pair in a fast associative memory. The tradeoff is cache coherence: if the OS changes a page table entry (e.g., swapping a page to disk), it must explicitly tell the hardware to invalidate that stale entry in the TLB, complicating OS design.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The first loop will execute significantly faster than the second loop (often 5x to 10x faster) entirely due to hardware caching effects (both data cache and TLB). We do not need to run this to prove the architectural concept.

### One sentence connecting to previous unit
The TLB hides the latency of the multi-level page table, but it introduces a new problem: what happens to this cached state when we switch to a different process with a different page table?


## Concept Unit: Context switches and the TLB — ASID and TLB flushes

### The Problem
Process A and Process B both think they own virtual address `0x400000`. Process A's `0x400000` maps to physical frame 10. Process B's `0x400000` maps to physical frame 90. The TLB caches "0x400000 -> Frame 10". If the OS pauses Process A and resumes Process B, B will try to access `0x400000`. If it hits the TLB, it will read Frame 10—Process A's private memory! How does the hardware prevent this catastrophic security breach?

### Introduce the concept in isolation
```c
/* Conceptual: what happens on context switch */
void context_switch(struct PCB *prev, struct PCB *next)
{
    /* Save prev's register state */
    save_regs(prev);

    /* Switch address space */
    write_cr3(next->page_table_phys);  /* loads new page table base */
    /* Without PCID: CR3 write flushes entire TLB */
    /* With PCID: CR3 write preserves entries with matching PCID */

    /* Restore next's register state */
    restore_regs(next);
}
```
This models how a **Context Switch** interacts with the TLB. Historically, writing a new value to the `CR3` register (switching page tables) automatically flushed the entire TLB. This is safe, but causes a "cold cache" performance hit as the new process must re-walk tables to repopulate the TLB. Modern x86-64 uses **ASID (Address Space ID)** or **PCID (Process Context Identifier)**. The hardware tags each TLB entry with an ID. When Process B runs, the CPU ignores TLB entries tagged for Process A, allowing them to safely coexist and survive context switches.

### Discard the throwaway
This conceptual kernel code is discarded. It illustrates hardware-OS interactions that user-space programs never write directly.

### Project Change
No reference counterpart.
Files affected: None.
Change type: None.
Location: None.
Dependencies: None.

### The New Code
```c
/* No project code for this theoretical unit. */
```

### The Updated Project
```c
/* No project code for this theoretical unit. */
```

### Mechanical walkthrough
- `void context_switch(...)`: Function definition. Represents the core OS scheduler function.
- `struct PCB *prev`: Pointer type. A pointer to the Process Control Block of the outgoing process.
- `struct PCB *next`: Pointer type. A pointer to the PCB of the incoming process.
- `save_regs(prev);`: Function call. Simulates pushing CPU registers to the outgoing process's kernel stack.
- `write_cr3(next->page_table_phys);`: Function call/Hardware interaction. Simulates an assembly instruction (`mov cr3, rax`) that tells the MMU to use a new top-level page table.
- `restore_regs(next);`: Function call. Simulates popping CPU registers from the incoming process's kernel stack to resume it.

### CS lens
This highlights the CS concept of **Cache Invalidation vs. Tagging**. When context changes, cache data becomes stale. You can either dump the whole cache (invalidation) or add metadata so the cache can distinguish contexts (tagging). Other places this appears:
- HTTP Cache-Control headers (ETags validating freshness).
- CPU L1 caches (virtually indexed, physically tagged caches).
- Multi-tenant database connections (tagging queries with tenant IDs instead of tearing down connection pools).

### SE lens
The design principle is **trading hardware complexity for performance**. Adding PCID required adding bits to the TLB hardware, changing the CPU architecture, and changing the OS to manage these IDs. The alternative (flushing) was simple and correct. The complex path was chosen because as TLBs grew larger to support bigger workloads, the cost of throwing away 1500 cached translations on every context switch became a dominant performance bottleneck.

### Commands needed
None for this unit.

### Run it
Predicted confidently: This is pseudocode modeling OS behavior. No execution needed.

### One sentence connecting to previous unit
Now that we understand how the hardware translates virtual addresses, we can look at how the operating system organizes the virtual address space it gives to a program.


## Concept Unit: Using /proc to inspect a process's memory map

### The Problem
We've talked abstractly about virtual addresses. But when you write a real C program, where do your variables actually go in this vast 48-bit address space? How can you prove that the OS gives you isolated regions for code, data, heap, and stack?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int global = 42;

int main(void)
{
    char *heap = malloc(1024);
    int local = 100;

    printf("PID: %d\n", (int)getpid());
    printf("&global: %p\n", (void*)&global);
    printf("heap:    %p\n", (void*)heap);
    printf("&local:  %p\n", (void*)&local);
    
    /* Simulate the read of /proc/<PID>/maps */
    char cmd[256];
    sprintf(cmd, "cat /proc/%d/maps", getpid());
    system(cmd);

    free(heap);
    return 0;
}
```
This proves that the OS organizes virtual memory into distinct **Virtual Memory Areas (VMAs)**. By printing the addresses of different types of variables, we see they are wildly far apart in the virtual address space. The global variable is low (e.g., `0x601000`), the heap is slightly higher, and the local variable is on the stack near the very top of the address space (e.g., `0x7ffe...`). The `cat /proc/PID/maps` output shows exactly how the OS kernel tracks these ranges and permissions before the MMU ever sees them.

### Discard the throwaway
This throwaway inspection tool is discarded. It is a diagnostic technique for understanding Linux memory layout, not project code.

### Project Change
No reference counterpart.
Files affected: None.
Change type: None.
Location: None.
Dependencies: None.

### The New Code
```c
/* No project code for this theoretical unit. */
```

### The Updated Project
```c
/* No project code for this theoretical unit. */
```

### Mechanical walkthrough
- `#include <stdlib.h>`: Preprocessor directive. Includes standard library for `malloc`, `free`, and `system`.
- `#include <unistd.h>`: Preprocessor directive. Includes POSIX API for `getpid`.
- `int global = 42;`: Global variable declaration. Stored in the `.data` segment of the executable.
- `char *heap = malloc(1024);`: Pointer declaration and function call. Dynamically allocates 1KB on the heap. Returns a virtual address to the new block.
- `int local = 100;`: Local variable declaration. Allocated automatically on the stack frame of `main`.
- `printf("PID: %d\n", (int)getpid());`: Function call. Casts the return of `getpid()` to `int` and prints it.
- `printf("&global: %p\n", (void*)&global);`: Function call. Uses the address-of operator `&` and the `%p` format specifier to print a pointer.
- `char cmd[256];`: Array declaration. Allocates a buffer on the stack for a string.
- `sprintf(cmd, "cat /proc/%d/maps", getpid());`: Function call. Writes formatted output into the `cmd` buffer instead of standard output.
- `system(cmd);`: Function call. Asks the OS to execute the shell command stored in the string.
- `free(heap);`: Function call. Releases the dynamically allocated memory.

### CS lens
This illustrates the CS concept of **Memory Segmentation vs. Paging**. While hardware uses paging (fixed 4KB chunks) to manage physical RAM, the operating system still uses a form of logical segmentation (VMAs) to represent different semantic regions of a program (Text, Data, Heap, Stack). The OS VMA list dictates what is valid; the hardware page table makes it fast to access. Other places this dual-view appears:
- File systems (files are logical variable-length streams, stored as fixed-size blocks on disk).
- Network layers (TCP provides a logical continuous stream, chopped into fixed MTU packets by lower layers).

### SE lens
The design principle is **Observability**. Linux exposes complex internal kernel data structures (the VMA list of a process) as plain text files in the `/proc` virtual filesystem. The alternative is requiring specialized binary debugging APIs (like `ptrace`) just to see memory layout. The real tradeoff is the overhead of formatting kernel structs to strings on every read vs. the immense developer velocity gained by being able to use standard tools like `cat` and `grep` to inspect system state.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The output will show the PID, followed by three pointers, followed by the contents of the `/proc` map.
```
PID: 12345
&global: 0x55d012345000
heap:    0x55d013456000
&local:  0x7ffd12345678
55d012345000-55d012346000 rw-p 00000000 00:00 0   [data]
55d013456000-55d013477000 rw-p 00000000 00:00 0   [heap]
...
7ffd12325000-7ffd12346000 rw-p 00000000 00:00 0   [stack]
```
The exact addresses will vary due to ASLR (Address Space Layout Randomization).

### One sentence connecting to previous unit
The operating system uses VMAs to track what virtual memory a process is allowed to use, and uses the multi-level page table to tell the hardware exactly where that memory physically lives.


## Closing

### Connect the pieces
You now understand address translation at the hardware level. Let's trace one concrete virtual address end-to-end. 
When the CPU executes an instruction that accesses virtual address `0x7fff12345678`:
1. The MMU looks at the TLB. If there is a hit for this ASID and VPN, it immediately gets the physical frame and the access completes in 1 cycle.
2. If it misses the TLB, the hardware walks the page table. It reads `CR3` to find the PGD.
3. It uses bits 47-39 (`0xFF`) to index the PGD, finding the address of the PUD.
4. It uses bits 38-30 (`0x1C8`) to index the PUD, finding the address of the PMD.
5. It uses bits 29-21 (`0x091`) to index the PMD, finding the address of the PTE table.
6. It uses bits 20-12 (`0x045`) to index the PTE table, finding the physical frame number (e.g., Frame 10).
7. It combines Frame 10 with the offset (`0x678`) to access the final physical RAM location.
8. It caches this mapping in the TLB so the next access to this 4KB page is fast.

The TLB is to the page table what the L1 cache is to DRAM — a small, fast store of recent translations that makes an otherwise prohibitively slow mechanism practical. Lesson 25 covers dynamic memory allocation — how `malloc()` manages the heap inside the VMA boundaries we just explored.
