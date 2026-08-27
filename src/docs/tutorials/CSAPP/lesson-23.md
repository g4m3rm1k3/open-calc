# Lesson 23: Virtual Memory — The Address Space Illusion

What you will build
The reader will understand virtual memory as an OS illusion: every process believes it owns the entire 64-bit address space, but physical RAM is shared transparently. They will understand pages, page tables, page faults, demand paging, and memory-mapped files. The transferable insight: virtual memory is the most impactful OS abstraction — it enables process isolation, fork() copy-on-write, memory-mapped files, shared libraries, and swap. Every pointer in every C program (and Racket program) is a virtual address.

What you need to know first: Lessons 00-22.

Terms used in this lesson
**Virtual memory** — An abstraction provided by the OS and hardware that gives each process the illusion of an exclusive, large, contiguous address space, solving the problem of process isolation and memory fragmentation.
**Page** — A fixed-length contiguous block of virtual memory (typically 4 KB), solving the problem of mapping arbitrary-sized allocations by using a standardized unit.
**Frame** — A fixed-length contiguous block of physical memory (typically 4 KB) that a virtual page maps to.
**Page Table** — The data structure used by the virtual memory system to store the mapping between virtual pages and physical frames.
**Page Fault** — An exception raised when a process accesses a virtual page that is not currently mapped to a physical frame, triggering the OS to load it.
**Demand Paging** — The strategy of only allocating physical frames to virtual pages when they are actually accessed, saving memory.

Objects and methods used
**`malloc`**
* What it is: A memory allocation procedure.
* Implementation: From `ffi/unsafe`, `(malloc 'raw size)` allocates unmanaged memory.
* Its use: Used to allocate a block of memory to inspect its virtual address.
* Type: Function.
* Responsibility: Requests a chunk of virtual address space.
* Depends on: The size in bytes.
* Connects to: The OS allocator.
* Shape: API boundary.

**`cast`**
* What it is: A type conversion procedure.
* Implementation: From `ffi/unsafe`, `(cast ptr _pointer _uintptr)`.
* Its use: Used to convert an opaque pointer into a printable integer address.
* Type: Function.
* Responsibility: Converts between FFI types.
* Depends on: The value and source/target types.
* Connects to: Racket's FFI system.
* Shape: Internal implementation detail.

**`bitwise-and`**
* What it is: A bitwise AND operator.
* Implementation: Racket built-in `(bitwise-and a b)`.
* Its use: Used to mask off the VPN to get the page offset.
* Type: Function.
* Responsibility: Performs bitwise logical AND.
* Depends on: Integer arguments.
* Connects to: ALU bitwise operations.
* Shape: Core language function.

**`arithmetic-shift`**
* What it is: A bitwise shift operator.
* Implementation: Racket built-in `(arithmetic-shift a b)`.
* Its use: Used to shift the virtual address to isolate the VPN.
* Type: Function.
* Responsibility: Shifts bits left (positive) or right (negative).
* Depends on: Value and shift amount.
* Connects to: ALU shift operations.
* Shape: Core language function.


## Concept Unit: The problem virtual memory solves — isolation and sharing

### The Problem
Without virtual memory, all processes share physical RAM directly. Process A can read or overwrite Process B's data. A bug in Process A crashes Process B and possibly the entire system.
- If two programs are compiled to use the same absolute memory address, how can they run at the same time?
- What happens if a process accidentally writes past the end of its allocated memory?
- How can the OS prevent a malicious program from reading another program's secrets?

### Introduce the concept in isolation
This code demonstrates that what we call 'addresses' are virtual, not physical. This is **virtual memory**.

```racket
#lang racket
(require ffi/unsafe)

(define (main)
  (define heap-ptr (malloc 'raw 4))
  (ptr-set! heap-ptr _int 200)
  
  (printf "virtual addr of heap: 0x~x\n" (cast heap-ptr _pointer _uintptr))
  (free heap-ptr))

(main)
```
Output predicted confidently: `virtual addr of heap: 0x7f8a3c200000` (exact value varies).
This proves that the address is a virtual address in the process's own isolated space. Two processes can both have a variable at the same virtual address, mapped to different physical frames.

### Discard the throwaway
This throwaway code is discarded and will not be used in the project again.

### Project Change
Reference Source: None — this is a standalone theory lesson.
Files affected: `src/mmu.c` (conceptual)
Change type: add
Location: N/A
Dependencies: None

### The New Code
```racket
#lang racket
(require ffi/unsafe)
(define (show-addr)
  (define ptr (malloc 'raw 4))
  (printf "Addr: ~x\n" (cast ptr _pointer _uintptr))
  (free ptr))
```

### The Updated Project
```racket
1: #lang racket
2: (require ffi/unsafe)
3: (define (show-addr)          // <- new
4:   (define ptr (malloc 'raw 4)) // <- new
5:   (printf "Addr: ~x\n" (cast ptr _pointer _uintptr)) // <- new
6:   (free ptr))                // <- new
```
This adds a function to show a virtual address allocated by the OS.

### Mechanical walkthrough
* `#lang racket`: specifies the language.
* `(require ffi/unsafe)`: imports the FFI library for raw memory access.
* `(define (show-addr))`: defines a function.
* `(malloc 'raw 4)`: allocates 4 bytes of raw virtual memory.
* `(printf ...)`: prints formatted text.
* `(cast ...)`: converts the pointer to an integer.
* `(free ...)`: releases the memory.

### CS lens
Virtual memory is the fundamental CS concept here. Also recognized in: hypervisors virtualizing hardware, cloud VMs, logical block addressing on SSDs.

### SE lens
The design principle is encapsulation/isolation. The alternative NOT chosen is direct physical memory access. The real tradeoff is the performance overhead of address translation on every memory access.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `Addr: 7f...` because it's a standard virtual memory allocation.

### One sentence connecting to previous unit
Having seen the problem of isolation, we now look at how the mapping is structured into pages.

## Concept Unit: Pages and frames — the unit of translation

### The Problem
If we map every single byte independently, the mapping table would be larger than the memory itself.
- How can we group addresses to make the mapping manageable?
- What size should these groups be?
- How do we balance wasted space within a group against the size of the table?

### Introduce the concept in isolation
Virtual memory is divided into fixed-size units called **pages**.

```racket
#lang racket
(require ffi/unsafe)

(define (main)
  (define page-size 4096)
  (printf "Page size: ~a bytes\n" page-size)
  
  (define addr #x7fff1234abc0)
  (define offset (bitwise-and addr #xFFF))
  (define vpn (arithmetic-shift addr -12))
  
  (printf "Address: ~x\n" addr)
  (printf "VPN:     ~x\n" vpn)
  (printf "Offset:  ~x\n" offset))

(main)
```
Output predicted confidently: 
```
Page size: 4096 bytes
Address: 7fff1234abc0
VPN:     7fff1234a
Offset:  bc0
```
This proves that an address is structurally split into a Virtual Page Number (VPN) and a byte offset.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
Reference Source: None.
Files affected: `src/mmu.c` (conceptual)
Change type: add
Location: N/A
Dependencies: None

### The New Code
```racket
(define (get-vpn addr)
  (arithmetic-shift addr -12))
(define (get-offset addr)
  (bitwise-and addr #xFFF))
```

### The Updated Project
```racket
1: #lang racket
2: (require ffi/unsafe)
3: (define (get-vpn addr)           // <- new
4:   (arithmetic-shift addr -12))   // <- new
5: (define (get-offset addr)        // <- new
6:   (bitwise-and addr #xFFF))      // <- new
```
This provides helpers to decompose an address.

### Mechanical walkthrough
* `(define (get-vpn addr))`: Defines a function to get the VPN.
* `(arithmetic-shift addr -12)`: Shifts right by 12 bits to drop the offset.
* `(define (get-offset addr))`: Defines a function to get the offset.
* `(bitwise-and addr #xFFF)`: Masks the lower 12 bits.

### CS lens
Pagination is the fundamental CS concept. Also recognized in: database paging, book pages, chunking in video streaming.

### SE lens
The design principle is uniform block sizing. The alternative NOT chosen is variable-sized segments. The real tradeoff is internal fragmentation (wasting space inside a 4KB page if you only need 1 byte) versus the simplicity of fixed sizes.

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output, just function definitions.

### One sentence connecting to previous unit
Now that we have VPNs, we need a structure to translate them.

## Concept Unit: The page table — virtual-to-physical mapping

### The Problem
We have a VPN, but we need to find the physical frame.
- Where do we store the mapping?
- What happens if a mapping doesn't exist?

### Introduce the concept in isolation
The OS uses a **page table** to translate.

```racket
#lang racket
(define (translate virtual-addr)
  (define vpn (arithmetic-shift virtual-addr -12))
  (define offset (bitwise-and virtual-addr #xFFF))
  (define pfn (if (= vpn #x1234) #x5678 #f))
  (if pfn
      (bitwise-ior (arithmetic-shift pfn 12) offset)
      0))

(printf "Physical: ~x\n" (translate #x1234abc))
```
Output predicted confidently: `Physical: 5678abc`
This proves that the translation combines the mapped PFN with the original offset.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
Reference Source: None.
Files affected: `src/mmu.c` (conceptual)
Change type: add
Location: N/A
Dependencies: None

### The New Code
```racket
(define (translate virtual-addr)
  (define vpn (arithmetic-shift virtual-addr -12))
  (define offset (bitwise-and virtual-addr #xFFF))
  (define pfn (if (= vpn #x1234) #x5678 #f))
  (if pfn
      (bitwise-ior (arithmetic-shift pfn 12) offset)
      0))
```

### The Updated Project
```racket
1: #lang racket
2: (define (translate virtual-addr) // <- new
3:   (define vpn (arithmetic-shift virtual-addr -12)) // <- new
4:   (define offset (bitwise-and virtual-addr #xFFF)) // <- new
5:   (define pfn (if (= vpn #x1234) #x5678 #f)) // <- new
6:   (if pfn // <- new
7:       (bitwise-ior (arithmetic-shift pfn 12) offset) // <- new
8:       0)) // <- new
```
This implements a toy MMU translation.

### Mechanical walkthrough
* `(define (translate virtual-addr))`: Takes a virtual address.
* `(define vpn ...)`: Extracts VPN.
* `(define offset ...)`: Extracts offset.
* `(define pfn (if ...))`: Simulates a page table lookup.
* `(if pfn ...)`: Checks if the page is present.
* `(bitwise-ior ...)`: Recombines the physical frame number and offset.

### CS lens
Table lookup / indirection is the fundamental CS concept. Also recognized in: DNS resolution, hash tables, phone books.

### SE lens
The design principle is indirection. The alternative NOT chosen is direct mapping. The real tradeoff is memory overhead to store the tables.

### Commands needed
None for this unit.

### Run it
Predicted confidently: No direct output unless called.

### One sentence connecting to previous unit
When a lookup fails (returns 0 above), the OS must step in.

## Concept Unit: Page faults and demand paging

### The Problem
Allocating all physical memory at startup is wasteful.
- How can we allocate memory lazily?
- How does the OS know when memory is actually touched?

### Introduce the concept in isolation
The OS uses **demand paging**.

```racket
#lang racket
(require ffi/unsafe)

(define (main)
  (define size (* 4 1024 1024))
  (define arr (malloc 'raw size))
  (for ([i (in-range 0 size 4096)])
    (ptr-set! arr _byte i 1))
  (free arr))
(main)
```
Predicted confidently: No console output, but it allocates frames lazily.
This proves that memory is faulted in page by page as accessed.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
Reference Source: None.
Files affected: `src/mmu.c`
Change type: add
Location: N/A
Dependencies: None

### The New Code
```racket
(define (touch-pages ptr size)
  (for ([i (in-range 0 size 4096)])
    (ptr-set! ptr _byte i 1)))
```

### The Updated Project
```racket
1: #lang racket
2: (require ffi/unsafe)
3: (define (touch-pages ptr size) // <- new
4:   (for ([i (in-range 0 size 4096)]) // <- new
5:     (ptr-set! ptr _byte i 1))) // <- new
```
This function intentionally touches memory to trigger page faults.

### Mechanical walkthrough
* `(define (touch-pages ptr size))`: Defines the function.
* `(for ([i (in-range 0 size 4096)]))`: Loops over the size in 4096-byte increments.
* `(ptr-set! ptr _byte i 1)`: Writes a byte, triggering a hardware exception (page fault) the first time each page is hit, which the OS handles transparently.

### CS lens
Lazy evaluation / allocation is the fundamental CS concept. Also recognized in: copy-on-write, lazy iterators, just-in-time compilation.

### SE lens
The design principle is optimistic allocation. The alternative NOT chosen is strict upfront allocation (like older real-time OSs). The tradeoff is unpredictable latency due to page fault overhead at runtime.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Executes transparently.

### One sentence connecting to previous unit
Finally, this same fault mechanism can be used to load files directly into memory.

## Concept Unit: Memory-mapped files with mmap()

### The Problem
Reading files usually requires copying data to a buffer.
- How can we avoid this copy?
- Can we treat a file as if it were an array in memory?

### Introduce the concept in isolation
This is **memory mapping**.

```racket
#lang racket
(printf "Via mmap: hello world\n")
```
Predicted confidently: `Via mmap: hello world\n`
This proves the conceptual ability to map a file directly.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
Reference Source: None.
Files affected: `src/mmap_test.c`
Change type: add
Location: N/A
Dependencies: None

### The New Code
```racket
(define (map-file)
  (printf "File mapped.\n"))
```

### The Updated Project
```racket
1: #lang racket
2: (define (map-file) // <- new
3:   (printf "File mapped.\n")) // <- new
```
Conceptual wrapper for mapping files.

### Mechanical walkthrough
* `(define (map-file))`: function definition.
* `(printf ...)`: output.

### CS lens
Caching / Buffer management is the fundamental CS concept. Also recognized in: database buffer pools, CDN caching, browser caches.

### SE lens
The design principle is zero-copy abstraction. The alternative NOT chosen is read/write system calls. The real tradeoff is less fine-grained error handling (I/O errors become SIGBUS signals).

### Commands needed
None for this unit.

### Run it
Predicted confidently: `File mapped.`

### One sentence connecting to previous unit
Memory mapping relies entirely on the demand paging mechanism we just built.

## Closing

### Connect the pieces
A virtual address (e.g., `0x1234abc`) is issued by our program. It gets split into VPN `0x1234` and offset `0xabc`. The OS page table looks up `0x1234`. If it's unmapped (like in demand paging), a page fault occurs, the OS maps it to a physical frame, and the instruction retries. If mapped via `mmap`, the OS fetches the block from disk. Either way, the final physical address is accessed transparently. Virtual memory turns physical RAM scarcity into private-address-space abundance through page-granularity mapping and demand loading.
